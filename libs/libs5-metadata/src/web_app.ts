import { IMetadata, Metadata } from "./metadata";
import { Extra } from "./extra";
import { CID, METADATA_BYTES } from "@lumeweb/libs5-encoding";
import { Unpacker } from "./unpack";
import { Packer } from "./pack";

interface WebAppConstructorParams {
  name: string;
  tryFiles: string[];
  extraMetadata: Extra;
  errorPages: Map<number, string>;
  paths: Map<string, WebAppFile>;
}

export class WebApp implements IMetadata {
  public name: string;
  public tryFiles: string[];
  public extraMetadata: Extra;
  public errorPages: Map<number, string>;
  public paths: Map<string, WebAppFile>;

  constructor(
    {
      name = "",
      tryFiles = [],
      extraMetadata = new Extra(),
      errorPages = new Map<number, string>(),
      paths = new Map<string, WebAppFile>(),
    }: WebAppConstructorParams = {
      name: "",
      tryFiles: [],
      extraMetadata: new Extra(),
      errorPages: new Map<number, string>(),
      paths: new Map<string, WebAppFile>(),
    },
  ) {
    this.name = name;
    this.tryFiles = tryFiles;
    this.extraMetadata = extraMetadata;
    this.errorPages = errorPages;
    this.paths = paths;
  }

  encode(): Buffer {
    const p = new Packer();
    Metadata.prepare(p, METADATA_BYTES.TYPES.WEBAPP);
    p.packListLength(5);

    p.packString(this.name!);

    p.packListLength(this.tryFiles!.length ?? 0);

    if (this.tryFiles) {
      this.tryFiles.sort();
    }

    for (const tryFile of this.tryFiles ?? []) {
      p.packString(tryFile);
    }

    p.packMapLength(this.errorPages?.size ?? 0);

    if (this.errorPages) {
      for (const [key, value] of this.errorPages) {
        p.packInt(key);
        p.packString(value);
      }
    }

    p.packListLength(this.paths?.size ?? 0);

    if (this.paths) {
      for (const path of Array.from(this.paths.keys()).sort()) {
        const item = this.paths.get(path)!;
        p.packListLength(3);
        p.packString(path);
        p.packBinary(Buffer.from(item.cid.toBytes()));
        p.packString(item.contentType);
      }
    }

    p.packMapLength(0);

    return p.takeBytes();
  }

  decode(data: Buffer): boolean {
    const u = new Unpacker(data);
    Metadata.preprocess(u, METADATA_BYTES.TYPES.WEBAPP);

    u.unpackListLength();

    const name = u.unpackString() as string;
    const tryFiles = u.unpackList() as string[];
    const errorPages = u.unpackMap() as object;

    const errorPagesMap = new Map<number, string>();
    for (const [key, value] of Object.entries(errorPages)) {
      errorPagesMap.set(parseInt(key), value);
    }

    const length = u.unpackListLength();

    const paths = new Map<string, WebAppFile>();

    for (let i = 0; i < length; i++) {
      u.unpackListLength();
      const path = u.unpackString() as string;
      const cid = CID.fromBytes(u.unpackBinary());
      paths.set(
        path,
        new WebAppFile({
          cid,
          contentType: u.unpackString() as string,
        }),
      );
    }

    const extraMetadata = u.unpackMap();
    const extraMap = new Map<number, any>();
    for (const [key, value] of Object.entries(extraMetadata)) {
      extraMap.set(parseInt(key), value);
    }

    this.name = name;
    this.tryFiles = tryFiles;
    this.errorPages = errorPagesMap;
    this.paths = paths;
    this.extraMetadata = new Extra(extraMap);

    return true;
  }

  toJSON(): any {
    throw new Error("Method not implemented.");
  }

  public static fromBuffer(encoded: Buffer): WebApp {
    return Metadata.fromBuffer<WebApp>(WebApp, encoded);
  }
}

interface WebAppFileConstructorParams {
  contentType: string;
  cid: CID;
}

export class WebAppFile implements IMetadata {
  public contentType: string;
  public cid: CID;

  constructor({ contentType, cid }: WebAppFileConstructorParams) {
    this.contentType = contentType;
    this.cid = cid;
  }

  encode(): Buffer {
    throw new Error("Method not implemented.");
  }

  decode(data: Buffer): boolean {
    throw new Error("Method not implemented.");
  }

  toJSON(): any {
    return {
      cid: this.cid.toBase64Url(),
      contentType: this.contentType,
    };
  }
}
