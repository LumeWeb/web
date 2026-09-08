/**
 * X25519 + AEAD encapsulation of the Sia app-key seed for the worker
 * handshake ("box"-style layering over X25519).
 *
 * The worker owns a static X25519 key pair and only ever publishes its raw
 * public key (inside `HELLO_OK`). When the host has a plaintext seed, it
 * generates a fresh ephemeral X25519 key pair, computes ECDH against the
 * worker's public key, derives a 256-bit AES-GCM key with HKDF-SHA-256, and
 * sends an `AppKeyEnvelope`. The worker performs the mirror ECDH with its
 * private key and decrypts internally; the private key and the decrypted
 * seed never leave the worker isolate, and no protocol message can carry
 * either one back out.
 *
 * Ed25519 is deliberately not part of this scheme: Ed25519 is a signature
 * algorithm and cannot perform encryption or ECDH — X25519, the Diffie-Hellman
 * sibling of the same curve family, is required for the shared-secret step.
 *
 * All primitives come from the pure-JS `noble` family: `@noble/curves` for
 * X25519, `@noble/hashes` for HKDF/SHA-256 and secure randomness, and
 * `@noble/ciphers` for AES-GCM. Unlike the platform Web Crypto API, these
 * need neither a Secure Context nor `crypto.subtle`, so the handshake — both
 * in the worker and on the main thread — works in plain-http realms and
 * test environments. Secure randomness still comes from the platform CSPRNG
 * (`crypto.getRandomValues`, which has no Secure Context requirement).
 *
 * The derived key material and the shared secret are scrubbed (zeroed) after
 * use; the plaintext seed handed to `encryptToWorker` is scrubbed by the
 * caller once the envelope is built (the host does this in a `finally`),
 * so no long-lived main-thread copy of the seed survives the handoff.
 */

import { x25519 } from '@noble/curves/ed25519.js';
import { gcm } from '@noble/ciphers/aes.js';
import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { randomBytes } from '@noble/hashes/utils.js';
import { type AppKeyEnvelope, GCM_IV_LENGTH, WORKER_PUBLIC_KEY_LENGTH } from './protocol.ts';

/** Bits of the HKDF-derived AES-GCM key. */
const AEAD_KEY_BITS = 256;

/**
 * Domain separation shared by both peers: HKDF info/salt input and the AES-GCM
 * additional authenticated data. Binding both to the same protocol context
 * string binds a ciphertext to this handshake and this protocol version — an
 * envelope from another context (or replayed elsewhere) fails AEAD integrity.
 */
const HANDSHAKE_CONTEXT = 'sia-video-source worker app-key v1 handshake';

const ENCODER = new TextEncoder();

/** Supplies the 32-byte Sia app-key seed for one handshake round. */
export type AppKeySeedProvider = () => Promise<Uint8Array> | Uint8Array;

/**
 * The worker's static X25519 key pair: raw scalar + raw point bytes. There is
 * no platform "extractable" flag on plain bytes — private-key confinement to
 * the worker isolate is a code contract instead: the host never constructs
 * this value, and nothing on the wire carries it (see `protocol.ts`).
 */
export interface WorkerKeyPair {
  readonly privateKey: Uint8Array;
  readonly publicKey: Uint8Array;
}

/**
 * Worker side: mirror-decapsulates the envelope with the static private key
 * and returns the seed bytes for in-isolate use. Any integrity failure
 * (tampered ciphertext, wrong ephemeral key, wrong protocol context, bad key
 * lengths) rejects — the caller must treat a rejection as "no seed" and never
 * infer one from the error.
 */
export async function decryptAppKeyEnvelope(workerKeyPair: WorkerKeyPair, envelope: AppKeyEnvelope): Promise<Uint8Array> {
  const ephemeralPublicKey = validatePublicKey(envelope.ephemeralPublicKey);
  const aeadKey = await deriveAeadKey(workerKeyPair.privateKey, ephemeralPublicKey);
  // A rejected AEAD tag surfaces as a thrown error with no partial plaintext:
  // noble's GCM decrypt authenticates the full ciphertext (AAD included)
  // before any output is produced. The throw is the contract — never a
  // best-effort guess at the plaintext.
  return gcm(aeadKey, envelope.iv, ENCODER.encode(HANDSHAKE_CONTEXT)).decrypt(envelope.ciphertext);
}

/**
 * Host side: encapsulates the seed to the worker's public key. The caller owns
 * `seed` and must scrub it in a `finally` after this resolves — the envelope
 * is the only record of the key material this function leaves behind.
 */
export async function encryptToWorker(
  workerPublicKey: Uint8Array,
  seed: Uint8Array,
): Promise<AppKeyEnvelope> {
  validatePublicKey(workerPublicKey);
  // A fresh pair per envelope: compromise of any single ephemeral private key
  // (it exists only inside this call, and every copy is scrubbed below)
  // cannot decrypt any other envelope, and identical seeds produce ciphertexts
  // that share no IV.
  const ephemeral = generateWorkerKeyPair();
  const aeadKey = await deriveAeadKey(ephemeral.privateKey, workerPublicKey);
  // The ephemeral private half has served its purpose once the AEAD key is
  // derived; scrub it before leaving this scope.
  scrub(ephemeral.privateKey);
  const iv = randomBytes(GCM_IV_LENGTH);
  const ciphertext = gcm(aeadKey, iv, ENCODER.encode(HANDSHAKE_CONTEXT)).encrypt(seed);
  return { ciphertext, ephemeralPublicKey: ephemeral.publicKey, iv };
}

/** Exports the worker's public half as the raw 32-byte wire form. */
export function exportWorkerPublicKey(keyPair: WorkerKeyPair): Uint8Array {
  return keyPair.publicKey.slice();
}

/**
 * Generates the worker's static X25519 key pair from the platform CSPRNG
 * (via noble's `randomBytes`, which requires only `crypto.getRandomValues` —
 * no Secure Context). The returned object is the only reference to the
 * private key; the worker keeps exactly one memoized instance for its whole
 * lifetime and never publishes the private half.
 */
export function generateWorkerKeyPair(): WorkerKeyPair {
  const keyPair = x25519.keygen();
  return { privateKey: keyPair.secretKey, publicKey: keyPair.publicKey };
}

/**
 * Overwrites a keyed buffer's bytes with zeros. Best-effort hygiene: JS
 * runtimes may have copied the buffer, but zeroing the caller's reference
 * shrinks the window in which the plaintext is reachable.
 */
export function scrub(bytes: Uint8Array): void {
  bytes.fill(0);
}

// ECDH → shared secret → HKDF-SHA-256 → AES-GCM key. The shared secret exists
// briefly inside this call and is zeroed immediately after the HKDF copy.
// Both peers run this exact call shape, so the derived keys match even though
// each peer derived them from opposite ECDH halves; the salt and info strings
// domain-separate the key from any raw X25519 secret reuse.
// Keeping the async signature: both handshake peers await this call site.
// oxlint-disable-next-line require-await
async function deriveAeadKey(privateKey: Uint8Array, publicKey: Uint8Array): Promise<Uint8Array> {
  const shared = x25519.getSharedSecret(privateKey, publicKey);
  // Both the ECDH-shared X25519 secrets and the AEAD key live in
  // plain JS arrays; zeroing shrinks their reachable lifetime to this frame.
  const key = hkdf(sha256, shared, ENCODER.encode('sia-video-source'), ENCODER.encode(HANDSHAKE_CONTEXT), AEAD_KEY_BITS / 8);
  scrub(shared);
  return key;
}

function validatePublicKey(raw: Uint8Array): Uint8Array {
  if (raw.byteLength !== WORKER_PUBLIC_KEY_LENGTH) {
    throw new Error(`X25519 public key must be ${WORKER_PUBLIC_KEY_LENGTH} bytes`);
  }
  return raw;
}
