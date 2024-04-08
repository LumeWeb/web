import { base58btc } from "multiformats/bases/base58";
import { equalBytes } from "@noble/curves/abstract/utils";

export default class NodeId {
  bytes: Uint8Array;

  constructor(bytes: Uint8Array) {
    this.bytes = bytes;
  }

  static decode(nodeId: string): NodeId {
    return new NodeId(base58btc.decode(nodeId));
  }

  equals(other: any): boolean {
    if (!(other instanceof NodeId)) {
      return false;
    }
    return equalBytes(this.bytes, other.bytes);
  }

  get hashCode(): number {
    return (
      this.bytes[0] +
      this.bytes[1] * 256 +
      this.bytes[2] * 256 * 256 +
      this.bytes[3] * 256 * 256 * 256
    );
  }

  toBase58(): string {
    return base58btc.encode(this.bytes);
  }

  toString(): string {
    return this.toBase58();
  }
}
