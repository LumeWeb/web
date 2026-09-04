/**
 * Minimal zero-dependency Bitcoin-style base58 encoder (Solana's standard
 * binary-string encoding). Only encoding is needed by wallet login —
 * signatures and public keys leave the client, never arrive.
 *
 * Not in the monorepo's dependency tree as `bs58`; signatures are 64 bytes,
 * so a plain BigInt loop is plenty fast and keeps the auth chunk dependency-free.
 */
const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/** Encodes bytes as base58. Leading zero bytes encode as `1` characters. */
export function encodeBase58(bytes: Uint8Array): string {
  if (bytes.length === 0) {
    return "";
  }

  let value = 0n;
  for (const byte of bytes) {
    value = value * 256n + BigInt(byte);
  }

  let encoded = "";
  while (value > 0n) {
    encoded = ALPHABET[Number(value % 58n)] + encoded;
    value /= 58n;
  }

  for (const byte of bytes) {
    if (byte !== 0) {
      break;
    }
    encoded = "1" + encoded;
  }
  return encoded;
}
