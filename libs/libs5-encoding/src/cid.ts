import { Multibase } from "./multibase";
import { Multihash } from "./multihash";
import { CID_BYTES, REGISTRY_BYTES } from "./bytes";
import { decodeEndian, encodeEndian } from "./util";
import { concatBytes, equalBytes } from "@noble/curves/abstract/utils";
import { hexToBytes } from "@noble/hashes/utils";
import { SignedRegistryEntry } from "./types";

export class CID extends Multibase {
  type: number;
  hash: Multihash;
  size: number = 0;

  constructor(type: number, hash: Multihash, size?: number) {
    super();
    this.type = type;
    this.hash = hash;
    if (size !== undefined) {
      this.size = size;
    }
  }

  static decode(cid: string): CID {
    const decodedBytes = Multibase.decodeString(cid);
    return CID._init(decodedBytes);
  }

  static fromRegistry(bytes: Uint8Array): CID {
    if (!Object.values(REGISTRY_BYTES.TYPES).includes(bytes[0])) {
      throw new Error(`invalid registry type ${bytes[0]}`);
    }

    bytes = bytes.slice(1);

    return CID._init(bytes);
  }

  static fromBytes(bytes: Uint8Array): CID {
    return CID._init(bytes);
  }

  static fromSignedRegistryEntry(sre: SignedRegistryEntry): CID {
    return CID.fromRegistryPublicKey(sre.pk);
  }

  static fromRegistryPublicKey(pubkey: string | Uint8Array): CID {
    return CID.fromHash(pubkey, 0, CID_BYTES.TYPES.RESOLVER);
  }

  static fromHash(
    bytes: string | Uint8Array,
    size: number,
    type = CID_BYTES.TYPES.RAW,
  ): CID {
    if (typeof bytes === "string") {
      bytes = hexToBytes(bytes);
    }

    if (!Object.values(CID_BYTES.TYPES).includes(type)) {
      throw new Error(`invalid cid type ${type}`);
    }

    return new CID(type, new Multihash(bytes), size);
  }

  static verify(bytes: string | Uint8Array): boolean {
    if (typeof bytes === "string") {
      bytes = Multibase.decodeString(bytes);
    }

    try {
      CID._init(bytes);
    } catch {
      return false;
    }

    return true;
  }

  private static _init(bytes: Uint8Array): CID {
    const type = bytes[0];
    if (type === CID_BYTES.TYPES.BRIDGE) {
      return new CID(type, new Multihash(bytes));
    }

    const hash = new Multihash(bytes.subarray(1, 34));
    let size: number | undefined = undefined;
    const sizeBytes = bytes.subarray(34);
    if (sizeBytes.length > 0) {
      size = decodeEndian(sizeBytes);
    }

    if (!Object.values(CID_BYTES.TYPES).includes(type)) {
      throw new Error(`invalid cid type ${type}`);
    }

    return new CID(type, hash, size);
  }

  copyWith({ size, type }: { type?: number; size?: number }): CID {
    type = type || this.type;

    if (!Object.values(CID_BYTES.TYPES).includes(type)) {
      throw new Error(`invalid cid type ${type}`);
    }

    return new CID(type, this.hash, size || this.size);
  }

  toBytes(): Uint8Array {
    if (this.type === CID_BYTES.TYPES.BRIDGE) {
      return this.hash.fullBytes;
    } else if (this.type === CID_BYTES.TYPES.RAW) {
      let sizeBytes = encodeEndian(this.size as number, 8);

      while (sizeBytes.length > 0 && sizeBytes[sizeBytes.length - 1] === 0) {
        sizeBytes = sizeBytes.slice(0, -1);
      }
      if (sizeBytes.length === 0) {
        sizeBytes = new Uint8Array(1);
      }

      return concatBytes(
        this._getPrefixBytes(),
        this.hash.fullBytes,
        sizeBytes,
      );
    }

    return concatBytes(this._getPrefixBytes(), this.hash.fullBytes);
  }

  private _getPrefixBytes(): Uint8Array {
    return Uint8Array.from([this.type]);
  }

  toRegistryEntry(): Uint8Array {
    return concatBytes(
      Uint8Array.from([REGISTRY_BYTES.TYPES.CID]),
      this.toBytes(),
    );
  }

  toRegistryCID(): Uint8Array {
    return this.copyWith({ type: CID_BYTES.TYPES.RESOLVER }).toBytes();
  }

  override toString(): string {
    return this.type === CID_BYTES.TYPES.BRIDGE
      ? Buffer.from(this.hash.fullBytes).toString("utf8")
      : this.toBase58();
  }

  equals(other: CID): boolean {
    return equalBytes(this.toBytes(), other.toBytes());
  }
}
