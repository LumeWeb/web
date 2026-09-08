import { describe, expect, it } from 'vitest';
import {
  decryptAppKeyEnvelope,
  encryptToWorker,
  exportWorkerPublicKey,
  generateWorkerKeyPair,
  scrub,
  type WorkerKeyPair,
} from '../app-key-handshake.ts';
import { WORKER_PUBLIC_KEY_LENGTH } from '../protocol.ts';

/**
 * X25519 + HKDF + AES-GCM handshake primitives over the pure-JS noble stack.
 * These exercise the exact code the host encryptor and the worker decryptor
 * run; every test below fails (not just skips) if the crypto wiring is
 * removed or misparameterized, since the noble calls in
 * `app-key-handshake.ts` are the only way to satisfy them.
 */

/** A random 32-byte seed standing in for the Sia app-key seed. */
function randomSeed(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32));
}

function workerKeyWithPublicKey(): { keyPair: WorkerKeyPair; publicKey: Uint8Array; } {
  const keyPair = generateWorkerKeyPair();
  return { keyPair, publicKey: exportWorkerPublicKey(keyPair) };
}

describe('app key handshake primitives', () => {
  it("generates a 32-byte public key and a distinct 32-byte private key from the CSPRNG", () => {
    const { keyPair, publicKey } = workerKeyWithPublicKey();

    expect(publicKey).toBeInstanceOf(Uint8Array);
    expect(publicKey.byteLength).toBe(WORKER_PUBLIC_KEY_LENGTH);
    expect(keyPair.privateKey).toBeInstanceOf(Uint8Array);
    expect(keyPair.privateKey.byteLength).toBe(WORKER_PUBLIC_KEY_LENGTH);
    // The private half is not derivable from the published public half, and
    // two freshly generated pairs never share a private scalar.
    expect(Array.from(keyPair.privateKey)).not.toEqual(Array.from(publicKey));
    expect(Array.from(generateWorkerKeyPair().privateKey)).not.toEqual(Array.from(keyPair.privateKey));
  });

  it('round-trips a seed: host-side encryptor ciphertext decrypts in the worker decryptor', async () => {
    const { keyPair, publicKey } = workerKeyWithPublicKey();
    const seed = randomSeed();

    const envelope = await encryptToWorker(publicKey, seed);
    const decapsulated = await decryptAppKeyEnvelope(keyPair, envelope);

    expect(Array.from(decapsulated)).toEqual(Array.from(seed));
  });

  it('produces fresh IV and ephemeral material for every envelope', async () => {
    const { keyPair, publicKey } = workerKeyWithPublicKey();
    const seed = randomSeed();

    const first = await encryptToWorker(publicKey, seed);
    const second = await encryptToWorker(publicKey, seed);

    // Identical plaintexts must not produce identical wire bytes — otherwise
    // two handshakes of the same seed would be linkable and reusable.
    expect(Array.from(first.iv)).not.toEqual(Array.from(second.iv));
    expect(Array.from(first.ciphertext)).not.toEqual(Array.from(second.ciphertext));
    expect(Array.from(first.ephemeralPublicKey)).not.toEqual(Array.from(second.ephemeralPublicKey));

    // Both still decrypt to the same seed inside the worker.
    await expect(decryptAppKeyEnvelope(keyPair, first)).resolves.toEqual(seed);
    const secondSeed = await decryptAppKeyEnvelope(keyPair, second);
    expect(Array.from(secondSeed)).toEqual(Array.from(seed));
  });

  it('fails AEAD integrity on a tampered ciphertext', async () => {
    const { keyPair, publicKey } = workerKeyWithPublicKey();
    const envelope = await encryptToWorker(publicKey, randomSeed());
    envelope.ciphertext[envelope.ciphertext.length - 1] ^= 0x80;

    await expect(decryptAppKeyEnvelope(keyPair, envelope)).rejects.toThrow();
  });

  it('fails when the envelope was addressed to a different worker key', async () => {
    const { publicKey } = workerKeyWithPublicKey();
    const otherPair = generateWorkerKeyPair();
    const envelope = await encryptToWorker(publicKey, randomSeed());

    // The victim worker's private key derives a different shared secret from
    // the envelope's ephemeral key → its HKDF key differs → AEAD rejects.
    await expect(decryptAppKeyEnvelope(otherPair, envelope)).rejects.toThrow();
  });

  it('rejects structurally malformed or truncated envelopes', async () => {
    const { keyPair, publicKey } = workerKeyWithPublicKey();
    const envelope = await encryptToWorker(publicKey, randomSeed());

    // Truncated ciphertext is not just "unlikely valid": GCM rejects any
    // input whose length is < 16 bytes (the truncated tag).
    await expect(decryptAppKeyEnvelope(keyPair, { ...envelope, ciphertext: envelope.ciphertext.slice(0, 3) })).rejects.toThrow();
    // A zero-length ciphertext cannot authenticate anything.
    await expect(decryptAppKeyEnvelope(keyPair, { ...envelope, ciphertext: new Uint8Array(0) })).rejects.toThrow();
    // A non-32-byte ephemeral public key is not even a valid X25519 point
    // wire form — rejected before any crypto attempt.
    await expect(decryptAppKeyEnvelope(keyPair, { ...envelope, ephemeralPublicKey: new Uint8Array(31) })).rejects.toThrow();
  });

  it('scrubs a key buffer in place', () => {
    const bytes = crypto.getRandomValues(new Uint8Array(64));
    scrub(bytes);
    expect(bytes.every((b) => b === 0)).toBe(true);
  });
});
