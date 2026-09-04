import { describe, expect, it } from "vitest";

import { encodeBase58 } from "./base58";

// Reference vectors from an independent base58 implementation (Bitcoin
// alphabet; leading zero bytes → '1' characters).
const VECTORS: [input: Uint8Array, expected: string][] = [
  [new Uint8Array(0), ""],
  [new Uint8Array([0]), "1"],
  [new Uint8Array([0, 0, 1]), "112"],
  [new TextEncoder().encode("hello world"), "StV1DL6CwTryKyV"],
];

describe("wallet/base58 — encodeBase58", () => {
  it.each(VECTORS)("encodes %j to %s", (input, expected) => {
    expect(encodeBase58(input)).toBe(expected);
  });

  it("encodes a 64-byte signature (the Solana verify payload shape)", () => {
    expect(encodeBase58(new Uint8Array(64).fill(1))).toBe(
      "2AXDGYSE4f2sz7tvMMzyHvUfcoJmxudvdhBcmiUSo6ijwfYmfZYsKRxboQMPh3R4kUhXRVdtSXFXMheka4Rc4P2",
    );

    // All-zero 64-byte edge case: one '1' per leading zero byte.
    expect(encodeBase58(new Uint8Array(64))).toBe("1".repeat(64));
  });
});
