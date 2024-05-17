import { Packer } from "./pack";
import { Unpacker } from "./unpack";
import { METADATA_BYTES } from "@lumeweb/libs5-encoding";

export interface IMetadata {
  encode(): Buffer;
  decode(data: Buffer): boolean;
  toJSON(): any;
}

export type MetadataCtor<T extends IMetadata> = new (props?: any) => T;

export class Metadata {
  static fromBuffer<T extends IMetadata>(
    ctor: MetadataCtor<T>,
    data: Buffer,
  ): T {
    const instance = new ctor();

    if (!instance.decode(data)) {
      throw new Error("Failed to decode metadata");
    }

    return instance as T;
  }

  static prepare(p: Packer, type: number) {
    p.packInt(METADATA_BYTES.MAGIC_BYTE);

    if (!Object.values(METADATA_BYTES.TYPES).includes(type)) {
      throw new Error("Invalid metadata type");
    }

    p.packInt(type);
  }

  static preprocess(p: Unpacker, type?: number) {
    const magicByte = p.unpackInt();

    if (magicByte !== METADATA_BYTES.MAGIC_BYTE) {
      throw new Error("Invalid metadata magic byte");
    }

    const foundType = p.unpackInt();

    if (!type || !Object.values(METADATA_BYTES.TYPES).includes(type)) {
      throw new Error("Invalid metadata type");
    }

    if (type && foundType !== type) {
      throw new Error("Metadata type mismatch");
    }

    return type;
  }
}