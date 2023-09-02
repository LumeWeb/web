import { base64url } from "multiformats/bases/base64";
import { base32 } from "multiformats/bases/base32";
import { equalBytes } from "@noble/curves/abstract/utils";
import { CID_TYPES } from "#constants.js";

export class Multihash {
  fullBytes: Uint8Array;

  constructor(fullBytes: Uint8Array) {
    this.fullBytes = fullBytes;
  }

  get functionType(): number {
    return this.fullBytes[0];
  }

  get hashBytes(): Uint8Array {
    return this.fullBytes.subarray(1);
  }

  static fromBase64Url(hash: string): Multihash {
    while (hash.length % 4 !== 0) {
      hash += "=";
    }
    const bytes = base64url.decode(hash);
    return new Multihash(new Uint8Array(bytes));
  }

  toBase64Url(): string {
    return base64url.encode(this.fullBytes);
  }

  toBase32(): string {
    return base32.encode(this.fullBytes).replace(/=/g, "").toLowerCase();
  }

  toString(): string {
    return this.functionType === CID_TYPES.BRIDGE
      ? new TextDecoder().decode(this.fullBytes)
      : this.toBase64Url();
  }

  equals(other: any): boolean {
    if (!(other instanceof Multihash)) {
      return false;
    }
    return equalBytes(this.fullBytes, other.fullBytes);
  }

  get hashCode(): number {
    return (
      this.fullBytes[0] +
      this.fullBytes[1] * 256 +
      this.fullBytes[2] * 256 * 256 +
      this.fullBytes[3] * 256 * 256 * 256
    );
  }
}
