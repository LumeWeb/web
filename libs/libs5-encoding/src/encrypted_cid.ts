import { Multibase } from "./multibase.js";
import { Multihash } from "./multihash.js";
import { CID } from "./cid.js";
import { CID_BYTES } from "./bytes";
import { decodeEndian, encodeEndian } from "./util.js";

export class EncryptedCID extends Multibase {
  encryptedBlobHash: Multihash;
  originalCID: CID;
  encryptionAlgorithm: number;
  padding: number;
  chunkSizeAsPowerOf2: number;
  encryptionKey: Uint8Array;

  constructor(
    encryptedBlobHash: Multihash,
    originalCID: CID,
    encryptionKey: Uint8Array,
    padding: number,
    chunkSizeAsPowerOf2: number,
    encryptionAlgorithm: number,
  ) {
    super();
    this.encryptedBlobHash = encryptedBlobHash;
    this.originalCID = originalCID;
    this.encryptionKey = encryptionKey;
    this.padding = padding;
    this.chunkSizeAsPowerOf2 = chunkSizeAsPowerOf2;
    this.encryptionAlgorithm = encryptionAlgorithm;
  }

  static decode(cid: string): EncryptedCID {
    return EncryptedCID.fromBytes(Multibase.decodeString(cid));
  }

  static fromBytes(bytes: Uint8Array): EncryptedCID {
    if (bytes[0] !== CID_BYTES.TYPES.ENCRYPTED_DYNAMIC) {
      throw new Error(`Invalid CID type (${bytes[0]})`);
    }

    return new EncryptedCID(
      new Multihash(bytes.slice(3, 36)),
      CID.fromBytes(bytes.slice(72)),
      bytes.slice(36, 68),
      decodeEndian(bytes.slice(68, 72)),
      bytes[2],
      bytes[1],
    );
  }

  get chunkSize(): number {
    return Math.pow(2, this.chunkSizeAsPowerOf2);
  }

  toBytes(): Uint8Array {
    const data = [
      CID_BYTES.TYPES.ENCRYPTED_STATIC,
      this.encryptionAlgorithm,
      this.chunkSizeAsPowerOf2,
      ...this.encryptedBlobHash.fullBytes,
      ...this.encryptionKey,
      ...encodeEndian(this.padding, 4),
      ...this.originalCID.toBytes(),
    ];
    return new Uint8Array(data);
  }
}
