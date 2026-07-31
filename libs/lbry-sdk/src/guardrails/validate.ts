/**
 * Guardrails — input validation and transaction review functions.
 *
 * Provides sync validation for addresses, amounts, fee rates, and
 * transaction sanity checks before broadcast. Used by wallet, tx,
 * and mempool modules to enforce safe defaults.
 *
 * @module @lumeweb/lbry-sdk/guardrails/validate
 */

import type { SignedTx } from "@/tx/types";
import { divAmount } from "@/tx/amount";

/** Dust threshold in satoshis — outputs below this are uneconomical */
export const DUST_THRESHOLD = 546;

/** Minimum fee rate in sat/vB */
export const FEE_FLOOR = 1;

/** Maximum fee rate in sat/vB — protects against fee spikes */
export const FEE_CEILING = 1000;

/**
 * Warning raised during validation of a transaction.
 *
 * @property field - The field that triggered the warning (e.g., "fee", "size")
 * @property message - Human-readable warning description
 * @property severity - Severity level: "error" (blocking) or "warning" (advisory)
 */
export interface ReviewWarning {
  field: string;
  message: string;
  severity: "error" | "warning";
}

/**
 * Result of reviewing a transaction before broadcast.
 *
 * @property warnings - Array of validation warnings
 * @property valid - Whether the transaction passes all error-level checks
 */
export interface ReviewResult {
  warnings: ReviewWarning[];
  valid: boolean;
}

/** LBRY mainnet address prefix is 'b' (base58, version byte 0x55) */
const LBRY_ADDRESS_REGEX = /^b[1-9A-HJ-NP-Za-km-z]{25,39}$/;

/** Base58 alphabet for checksum verification */
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/** LBRY mainnet P2PKH version byte */
const LBRY_VERSION_BYTE = 0x55;

/**
 * Synchronous SHA-256 implementation for base58check checksum verification.
 *
 * This is needed because SubtleCrypto.digest is async-only and validateAddress
 * must be callable synchronously from guardrails.
 *
 * @param data - Input data as Uint8Array
 * @returns SHA-256 hash as 32-byte Uint8Array
 */
function sha256(data: Uint8Array): Uint8Array {
  // SHA-256 constants
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);

  // Pre-processing: padding
  const originalLen = data.length;
  const bitLen = originalLen * 8;
  const paddedLen = Math.ceil((originalLen + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(data);
  padded[originalLen] = 0x80;
  // Append 64-bit big-endian length (we only use 32 bits; sufficient for our small inputs)
  const dv = new DataView(padded.buffer);
  dv.setUint32(paddedLen - 4, bitLen >>> 0, false);
  dv.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);

  // Initial hash values
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  const w = new Uint32Array(64);

  for (let chunk = 0; chunk < paddedLen; chunk += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = dv.getUint32(chunk + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + temp1) >>> 0;
      d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }

  const result = new Uint8Array(32);
  const rdv = new DataView(result.buffer);
  rdv.setUint32(0, h0, false); rdv.setUint32(4, h1, false);
  rdv.setUint32(8, h2, false); rdv.setUint32(12, h3, false);
  rdv.setUint32(16, h4, false); rdv.setUint32(20, h5, false);
  rdv.setUint32(24, h6, false); rdv.setUint32(28, h7, false);
  return result;
}

/**
 * Right-rotate a 32-bit integer.
 *
 * @param x - Value to rotate
 * @param n - Number of bit positions to rotate
 * @returns Rotated value as unsigned 32-bit integer
 */
function rotr(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

/**
 * Decode a base58check-encoded string and verify its 4-byte double-SHA256 checksum.
 *
 * @param address - The base58check-encoded string
 * @returns The decoded payload (version + hash) as Uint8Array, or null if invalid
 */
function base58CheckDecode(address: string): Uint8Array | null {
  if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(address)) return null;
  const bytes: number[] = [];
  for (const ch of address) {
    let value = BASE58_ALPHABET.indexOf(ch);
    if (value === -1) return null;
    for (let i = 0; i < bytes.length; i++) {
      value += bytes[i] * 58;
      bytes[i] = value & 0xff;
      value >>= 8;
    }
    while (value > 0) {
      bytes.push(value & 0xff);
      value >>= 8;
    }
  }
  // Handle leading '1' bytes (leading zeros)
  for (const ch of address) {
    if (ch !== "1") break;
    bytes.push(0);
  }
  bytes.reverse();

  if (bytes.length < 5) return null;
  const data = bytes.slice(0, -4);
  const checksum = bytes.slice(-4);

  // Verify double-SHA256 checksum
  const hash = sha256(sha256(new Uint8Array(data)));
  if (hash[0] !== checksum[0] || hash[1] !== checksum[1] ||
      hash[2] !== checksum[2] || hash[3] !== checksum[3]) {
    return null;
  }
  return new Uint8Array(data);
}

/**
 * Assert that a value is finite and positive.
 *
 * @param value - The value to check
 * @param label - Label for error message (e.g., "size", "amount")
 * @throws {Error} If the value is not a finite number or is not positive
 */
export function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
}

/**
 * Validate an LBRY address format (base58, correct prefix).
 *
 * Checks the base58check encoding, version byte (0x55 for mainnet P2PKH),
 * and payload length (20-byte hash). Synchronous — safe for guardrails use.
 *
 * @param address - The LBRY address string to validate
 * @returns `true` if the address is valid
 */
export function validateAddress(address: string): boolean {
  if (!LBRY_ADDRESS_REGEX.test(address)) return false;
  // Reject known-invalid base58 characters (0, O, I, l already excluded by regex)
  // Verify the decoded payload is at least the expected length (version + 20-byte hash + 4-byte checksum)
  const decoded = base58CheckDecode(address);
  if (!decoded) return false;
  // LBRY P2PKH: version byte (0x55) + 20-byte pubkey hash = exactly 21 bytes
  return decoded.length === 21 && decoded[0] === LBRY_VERSION_BYTE;
}

/**
 * Validate an amount in satoshis. Rejects dust amounts.
 *
 * Accepts both number and string representations.  Strings are
 * converted via BigInt first, so large int64 amounts from WASM
 * are handled correctly.
 *
 * @param amount - The amount in satoshis (as a number or string)
 * @returns `true` if the amount is a positive integer above the dust threshold
 */
export function validateAmount(amount: bigint | string | number): boolean {
  try {
    const n = typeof amount === "bigint" ? amount : BigInt(amount);
    return n >= BigInt(DUST_THRESHOLD);
  } catch {
    return false;
  }
}

/**
 * Validate a fee rate in sat/vB.
 *
 * Ensures the fee rate is within the valid range (FEE_FLOOR to FEE_CEILING).
 *
 * @param feePerByte - Fee rate in satoshis per byte
 * @returns `true` if the fee rate is valid
 */
export function validateFeeRate(feePerByte: number): boolean {
  return (
    Number.isFinite(feePerByte) &&
    feePerByte >= FEE_FLOOR &&
    feePerByte <= FEE_CEILING
  );
}

/**
 * Build a review of a transaction before broadcast. Returns warnings + validity.
 *
 * Checks:
 * - Transaction size is positive and finite
 * - Fee rate is not below floor
 * - Fee rate is not above ceiling
 * - Transaction size does not exceed 100KB
 *
 * @param tx - The signed transaction to review
 * @returns Review result with warnings and overall validity
 *
 * @example
 * ```ts
 * const review = buildReview(signedTx);
 * if (!review.valid) {
 *   console.warn("Transaction has errors:", review.warnings);
 * }
 * ```
 */
export function buildReview(tx: SignedTx): ReviewResult {
  const warnings: ReviewWarning[] = [];

  // Guard against zero/NaN/invalid size before any division
  try {
    assertFinite(tx.size, "transaction size");
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    warnings.push({
      field: "size",
      message,
      severity: "error",
    });
    return { warnings, valid: false };
  }

  if (divAmount(tx.fee, tx.size) < FEE_FLOOR) {
    warnings.push({
      field: "fee",
      message: `Fee rate below floor (${FEE_FLOOR} sat/vB)`,
      severity: "error",
    });
  }

  if (tx.fee > 0n && divAmount(tx.fee, tx.size) > FEE_CEILING) {
    warnings.push({
      field: "fee",
      message: `Fee rate above ceiling (${FEE_CEILING} sat/vB)`,
      severity: "error",
    });
  }

  if (tx.size > 100_000) {
    warnings.push({
      field: "size",
      message: "Transaction is unusually large (>100KB)",
      severity: "warning",
    });
  }

  return {
    warnings,
    valid: warnings.every((w) => w.severity !== "error"),
  };
}
