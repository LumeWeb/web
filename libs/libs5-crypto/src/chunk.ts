import { encodeEndian } from "@lumeweb/libs5-encoding";
import { xchacha20poly1305 } from "@noble/ciphers/chacha";

export interface EncryptChunkParams {
  key: Uint8Array;
  plaintext: Uint8Array;
  index: number;
}

async function encryptChunk({
  key,
  plaintext,
  index,
}: EncryptChunkParams): Promise<Uint8Array> {
  return xchacha20poly1305(key, encodeEndian(index, 24)).encrypt(plaintext);
}

export interface DecryptChunkParams {
  key: Uint8Array;
  ciphertext: Uint8Array;
  index: number;
}

async function decryptChunk({
  key,
  ciphertext,
  index,
}: DecryptChunkParams): Promise<Uint8Array> {
  return xchacha20poly1305(key, encodeEndian(index, 24)).decrypt(ciphertext);
}

export { encryptChunk, decryptChunk };
