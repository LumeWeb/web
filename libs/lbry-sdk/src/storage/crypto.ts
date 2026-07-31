/**
 * AES-GCM encryption using browser WebCrypto API.
 *
 * WebCrypto is hardware-accelerated and audited — faster and safer
 * than any WASM AES-GCM implementation. Never use Go-WASM for this.
 *
 * @module @lumeweb/lbry-sdk/storage/crypto
 */

import type { EncryptedPayload } from "@/storage/types";

const PBKDF2_ITERATIONS = 600_000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 256;

/**
 * Derive an AES-256-GCM key from a password using PBKDF2.
 *
 * @param password - The password to derive the key from
 * @param salt - Random salt as Uint8Array (16 bytes)
 * @returns A CryptoKey suitable for AES-GCM encrypt/decrypt
 */
async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt a string with a password using AES-256-GCM.
 *
 * Generates a random salt and IV. The salt is used for PBKDF2 key derivation
 * and the IV for AES-GCM encryption. Returns all three components needed for
 * decryption.
 *
 * @param data - The plaintext string to encrypt
 * @param password - The password to encrypt with
 * @returns An {@link EncryptedPayload} containing ciphertext, IV, and salt
 */
export async function encryptData(
  data: string,
  password: string
): Promise<EncryptedPayload> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(password, salt);
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    enc.encode(data)
  );
  return { ciphertext, iv, salt };
}

/**
 * Decrypt data encrypted with {@link encryptData}.
 *
 * Uses the stored salt for PBKDF2 key derivation and the IV for AES-GCM decryption.
 *
 * @param payload - The encrypted payload (ciphertext, IV, and salt)
 * @param password - The password used during encryption
 * @returns The decrypted plaintext string
 * @throws {Error} If decryption fails (wrong password or corrupted data)
 */
export async function decryptData(
  payload: EncryptedPayload,
  password: string
): Promise<string> {
  const key = await deriveKey(password, payload.salt);
  const dec = new TextDecoder();
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: payload.iv as BufferSource },
    key,
    payload.ciphertext
  );
  return dec.decode(plaintext);
}
