import {
  IChildMetadata,
  IMetadata,
  maybeConvertObjectToIntMap,
  Metadata,
} from "./metadata";
import { Unpacker } from "./unpack";
import {
  CID_BYTES,
  EncryptedCID,
  METADATA_BYTES,
  Multibase,
  Multihash,
} from "@lumeweb/libs5-encoding";
import { CID } from "@lumeweb/libs5-encoding";
import { Buffer } from "buffer";
import { base64url } from "multiformats/bases/base64";
import { Packer } from "./pack";

interface DirectoryConstructorParams {
  details?: DirectoryDetails;
  directories?: Map<string, DirectoryReference>;
  files?: Map<string, FileReference>;
}

function base64UrlEncode(data: Uint8Array): string {
  return base64url.encode(data).slice(1);
}

function base64UrlDecode(data: string): Uint8Array {
  return base64url.decode(`u${data}`);
}

export class Directory implements IMetadata {
  public details?: DirectoryDetails;
  public directories?: Map<string, DirectoryReference>;
  public files?: Map<string, FileReference>;

  constructor({
    details = undefined,
    directories = undefined,
    files = undefined,
  }: DirectoryConstructorParams = {}) {
    this.details = details;
    this.directories = directories;
    this.files = files;
  }

  static fromBuffer(data: Buffer): Directory {
    return Metadata.fromBuffer(Directory, data);
  }

  encode(): Buffer {
    const p = new Packer();
    Metadata.prepare(p, METADATA_BYTES.TYPES.DIRECTORY);

    p.packListLength(3);

    p.pack(this.details);

    p.packMapLength(this.directories?.size ?? 0);
    for (const [name, dir] of this.directories ?? []) {
      p.packString(name);
      p.pack(dir);
    }

    p.packMapLength(this.files?.size ?? 0);
    for (const [name, file] of this.files ?? []) {
      p.packString(name);
      p.pack(file);
    }

    return Buffer.from(p.takeBytes());
  }

  decode(data: Buffer): boolean {
    const u = new Unpacker(data);
    const type = Metadata.preprocess(u);

    if (
      Object.values(METADATA_BYTES.TYPES).includes(type) &&
      type !== METADATA_BYTES.TYPES.DIRECTORY &&
      type !== METADATA_BYTES.TYPES.DIRECTORY_LEGACY
    ) {
      throw new Error("Invalid metadata type");
    }

    u.unpackListLength();

    const detailsMap = u.unpackMap();
    this.details = new DirectoryDetails(detailsMap);
    const dirCount = u.unpackMapLength();

    const directories = new Map<string, DirectoryReference>();
    for (let i = 0; i < dirCount; i++) {
      const name = u.unpackString() as string;
      const dir = new DirectoryReference();
      dir.decodeData(u.unpackMap());
      directories.set(name, dir);
    }

    this.directories = directories;

    const fileCount = u.unpackMapLength();
    const files = new Map<string, FileReference>();
    for (let i = 0; i < fileCount; i++) {
      const name = u.unpackString() as string;
      const file = new FileReference();
      file.decodeData(u.unpackMap());
      files.set(name, file);
    }

    this.files = files;

    return true;
  }

  fromJSON(json: any): this {
    if (!json) {
      return this;
    }

    this.details = new DirectoryDetails().fromJSON(json.details);
    this.directories = new Map<string, DirectoryReference>();
    for (const [name, value] of Object.entries<any>(json.directories)) {
      this.directories.set(name, new DirectoryReference().fromJSON(value));
    }

    this.files = new Map<string, FileReference>();
    for (const [name, value] of Object.entries<any>(json.files)) {
      this.files.set(name, new FileReference().fromJSON(value));
    }

    return this;
  }

  toJSON(): Record<string, any> {
    return {
      type: "directory",
      details: this.details?.toJSON(),
      directories: this.directories
        ? Object.fromEntries(
            Array.from(this.directories.entries()).map(([key, value]) => [
              key,
              value.toJSON(),
            ]),
          )
        : undefined,
      files: this.files
        ? Object.fromEntries(
            Array.from(this.files.entries()).map(([key, value]) => [
              key,
              value.toJSON(),
            ]),
          )
        : undefined,
    };
  }
}

interface DirectoryReferenceConstructorParams {
  created: number;
  name: string;
  encryptedWriteKey: Uint8Array;
  publicKey: Uint8Array;
  encryptionKey?: Uint8Array;
  ext?: Map<string, any>;
  uri?: string;
  key?: string;
  size?: number;
}

export class DirectoryReference implements IMetadata, IChildMetadata {
  public created: number;
  public name: string;
  public encryptedWriteKey: Uint8Array;
  public publicKey: Uint8Array;
  public encryptionKey?: Uint8Array;
  public ext: Map<string, any>;

  constructor(
    {
      created = 0,
      name = "",
      encryptedWriteKey = new Uint8Array(0),
      publicKey = new Uint8Array(0),
      encryptionKey = undefined,
      ext = new Map<string, any>(),
    }: DirectoryReferenceConstructorParams = {
      created: 0,
      name: "",
      encryptedWriteKey: new Uint8Array(0),
      publicKey: new Uint8Array(0),
      encryptionKey: undefined,
      ext: new Map<string, any>(),
    },
  ) {
    this.created = created;
    this.name = name;
    this.encryptedWriteKey = encryptedWriteKey;
    this.publicKey = publicKey;
    this.encryptionKey = encryptionKey;
    this.ext = ext;
  }

  encode(): Buffer {
    throw new Error("Object does not support encoding");
  }

  encodeData(): Map<number, any> {
    const map = new Map<number, any>([
      [1, this.name],
      [2, this.created],
      [3, this.publicKey],
      [4, this.encryptedWriteKey],
    ]);

    function addNotNull(key: number, value: any): void {
      if (value !== undefined && value !== null) {
        map.set(key, value);
      }
    }

    addNotNull(5, this.encryptionKey);
    addNotNull(6, this.ext);

    return map;
  }

  decodeData(data: Map<number, any> | object): void {
    const map = maybeConvertObjectToIntMap(data);
    this.name = map.get(1);
    this.created = map.get(2);
    this.publicKey = map.get(3);
    this.encryptedWriteKey = map.get(4);
    this.encryptionKey = map.get(5);
    this.ext = map.get(6);
  }

  decode(data: Buffer): boolean {
    throw new Error("Object does not support decoding");
  }

  fromJSON(json: any): this {
    if (!json) {
      return this;
    }

    this.name = json.name;
    this.created = json.created;
    this.publicKey = base64UrlDecode(json.publicKey);
    this.encryptedWriteKey = base64UrlDecode(json.encryptedWriteKey);
    this.encryptionKey = json.encryptionKey
      ? base64UrlDecode(json.encryptionKey)
      : undefined;
    this.ext = json.ext;

    return this;
  }

  toJSON(): any {
    return {
      name: this.name,
      created: this.created,
      publicKey: base64UrlEncode(this.publicKey),
      encryptedWriteKey: base64UrlEncode(this.encryptedWriteKey),
      encryptionKey: this.encryptionKey
        ? base64UrlEncode(this.encryptionKey)
        : null,
      ext: this.ext ? Object.fromEntries(this.ext.entries()) : null,
    };
  }
}

export class DirectoryDetails implements IMetadata, IChildMetadata {
  public data!: Map<number, any>;

  constructor(data: Map<number, any> | object = {}) {
    this._encode(data);
  }

  private _encode(data: Map<number, any> | object) {
    this.data = maybeConvertObjectToIntMap(data);
  }

  encode(): Buffer {
    throw new Error("Object does not support encoding");
  }

  decode(data: Buffer): boolean {
    throw new Error("Object does not support decoding");
  }

  encodeData(): Map<number, any> {
    return this.data;
  }

  get isShared(): boolean {
    return this.data.has(3);
  }

  get isSharedReadOnly(): boolean {
    return this.data.get(3)?.[1] ?? false;
  }

  get isSharedReadWrite(): boolean {
    return this.data.get(3)?.[2] ?? false;
  }

  get previousVersion(): CID {
    return CID.decode(this.data.get(4));
  }

  setShared(value: boolean, write: boolean): void {
    if (!this.data.has(3)) {
      this.data.set(3, {});
    }

    const obj = this.data.get(3);
    obj[write ? 2 : 1] = value;
    this.data.set(3, obj);
  }

  fromJSON(json: any): this {
    if (!json) {
      return this;
    }

    this._encode(json);

    return this;
  }

  toJSON(): any {
    return Object.fromEntries(this.data.entries());
  }
}

interface FileReferenceConstructorParams {
  name: string;
  created: number;
  version: number;
  file: FileVersion;
  ext?: Map<string, any>;
  history?: Map<number, FileVersion>;
  mimeType?: string;
}

export class FileReference implements IMetadata, IChildMetadata {
  public name: string;
  public created: number;
  public version: number;
  public file: FileVersion;
  public ext?: Map<string, any>;
  public history?: Map<number, FileVersion>;
  public mimeType?: string;

  constructor(
    {
      name = "",
      created = 0,
      version = 0,
      file = new FileVersion(),
      ext = new Map<string, any>(),
      history = new Map<number, FileVersion>(),
      mimeType = "",
    }: FileReferenceConstructorParams = {
      name: "",
      created: 0,
      version: 0,
      file: new FileVersion(),
      ext: new Map<string, any>(),
      history: new Map<number, FileVersion>(),
      mimeType: "",
    },
  ) {
    this.name = name;
    this.created = created;
    this.version = version;
    this.file = file;
    this.ext = ext;
    this.history = history;
    this.mimeType = mimeType;
  }

  get modified(): number {
    return this.file.ts;
  }

  decode(data: Buffer): boolean {
    throw new Error("Object does not support decoding");
  }

  encode(): Buffer {
    throw new Error("Object does not support encoding");
  }

  encodeData(): Map<number, any> {
    const map = new Map<number, any>();

    function addNotNull(key: number, value: any): void {
      if (value !== undefined && value !== null) {
        map.set(key, value);
      }
    }

    addNotNull(1, this.name);
    addNotNull(2, this.created);
    addNotNull(4, this.file);
    addNotNull(5, this.version);
    addNotNull(6, this.mimeType);
    addNotNull(7, this.ext);
    addNotNull(8, this.history);

    return map;
  }

  decodeData(data: Map<number, any> | object): void {
    const map = maybeConvertObjectToIntMap(data);
    this.name = map.get(1);
    this.created = map.get(2);
    const file = new FileVersion();
    file.decodeData(map.get(4));
    this.file = file;
    this.version = map.get(5);
    this.mimeType = map.get(6);
    this.ext = map.get(7);

    if (map.get(8)) {
      this.history = new Map<number, FileVersion>();
      for (const [key, value] of Object.entries<object>(map.get(8))) {
        const ver = new FileVersion();
        ver.decodeData(value);
        this.history.set(parseInt(key), ver);
      }
    } else {
      this.history = undefined;
    }
  }

  fromJSON(json: any): this {
    if (!json) {
      return this;
    }

    this.name = json.name;
    this.created = json.created;
    this.version = json.version;
    this.mimeType = json.mimeType;
    this.file = new FileVersion().fromJSON(json.file);
    this.ext = json.ext;
    this.history = json.history
      ? new Map<number, FileVersion>(
          Object.entries(json.history).map(([key, value]) => [
            parseInt(key),
            new FileVersion().fromJSON(value),
          ]),
        )
      : undefined;

    return this;
  }

  toJSON(): any {
    return {
      name: this.name,
      created: this.created,
      modified: this.modified,
      version: this.version,
      mimeType: this.mimeType || null,
      file: this.file?.toJSON(),
      ext: this.ext ?? null,
      history: this.history
        ? Object.fromEntries(
            Array.from(this.history.entries()).map(([key, value]) => [
              key.toString(),
              value.toJSON(),
            ]),
          )
        : null,
    };
  }
}

interface FileVersionConstructorParams {
  ts: number;
  encryptedCID?: EncryptedCID;
  plaintextCID?: CID;
  thumbnail?: FileVersionThumbnail;
  hashes?: Set<Multihash>;
}

export class FileVersion implements IMetadata, IChildMetadata {
  public ts: number;
  public encryptedCID?: EncryptedCID;
  public plaintextCID?: CID;
  public thumbnail?: FileVersionThumbnail;
  public hashes?: Set<Multihash>;

  constructor(
    {
      ts = 0,
      encryptedCID = undefined,
      plaintextCID = undefined,
      thumbnail = undefined,
      hashes = new Set<Multihash>(),
    }: FileVersionConstructorParams = {
      ts: 0,
      encryptedCID: undefined,
      plaintextCID: undefined,
      thumbnail: undefined,
      hashes: new Set<Multihash>(),
    },
  ) {
    this.ts = ts;
    this.encryptedCID = encryptedCID;
    this.plaintextCID = plaintextCID;
    this.thumbnail = thumbnail;
    this.hashes = hashes;
  }

  encode(): Buffer {
    throw new Error("Object does not support encoding");
  }

  decode(data: Buffer): boolean {
    throw new Error("Object does not support decoding");
  }

  encodeData(): Map<number, any> {
    const map = new Map<number, any>();

    function addNotNull(key: number, value: any): void {
      if (value !== undefined && value !== null) {
        map.set(key, value);
      }
    }

    addNotNull(8, this.ts);
    addNotNull(1, this.encryptedCID?.toBytes());
    addNotNull(2, this.plaintextCID?.toBytes());

    if (this.hashes && this.hashes.size > 0) {
      const hashBytes = Array.from<Multihash>(this.hashes.values()).map(
        (cid) => cid.fullBytes,
      );
      addNotNull(9, hashBytes);
    }

    addNotNull(10, this.thumbnail);

    return map;
  }

  decodeData(data: Map<number, any> | object): void {
    const map = maybeConvertObjectToIntMap(data);
    this.ts = map.get(8);
    if (map.get(1)) {
      this.encryptedCID = EncryptedCID.fromBytes(map.get(1));
    }

    if (map.get(2)) {
      this.plaintextCID = CID.fromBytes(map.get(2));
    }

    if (map.get(9)) {
      this.hashes = new Set<Multihash>(
        map.get(9).map((bytes: Uint8Array) => new Multihash(bytes)),
      );
    }

    this.thumbnail = map.get(10);
  }

  fromJSON(json: any): this {
    if (!json) {
      return this;
    }

    this.ts = json.ts;
    if (json.encryptedCID) {
      this.encryptedCID = EncryptedCID.fromBytes(
        Multibase.decodeString(json.encryptedCID),
      );
    }

    if (json.cid) {
      this.plaintextCID = CID.decode(json.cid);
    }

    if (json.hashes) {
      this.hashes = new Set<Multihash>(
        json.hashes.map((bytes: Uint8Array) => new Multihash(bytes)),
      );
    }

    if (json.thumbnail) {
      this.thumbnail = new FileVersionThumbnail().fromJSON(json.thumbnail);
    }

    return this;
  }

  get cid(): CID {
    return this.plaintextCID ?? this.encryptedCID!.originalCID;
  }

  toJSON(): any {
    return {
      ts: this.ts,
      encryptedCID: this.encryptedCID?.toString() || null,
      cid: this.cid.toString(),
      hashes:
        this.hashes && this.hashes.size > 0
          ? Array.from(this.hashes.entries(), ([_, value]) =>
              value.toBase64Url(),
            )
          : null,
      thumbnail: this.thumbnail || null,
    };
  }
}

interface FileVersionThumbnailConstructorParams {
  aspectRatio: number;
  cid: CID;
  thumbhash: Uint8Array;
  imageType?: string;
}

export class FileVersionThumbnail implements IMetadata, IChildMetadata {
  public aspectRatio: number;
  public cid: CID;
  public thumbhash: Uint8Array;
  public imageType?: string;

  constructor(
    {
      aspectRatio = 0,
      cid = new CID(0, new Multihash(new Uint8Array(0))),
      thumbhash = new Uint8Array(0),
      imageType = "",
    }: FileVersionThumbnailConstructorParams = {
      aspectRatio: 0,
      cid: new CID(0, new Multihash(new Uint8Array(0))),
      thumbhash: new Uint8Array(0),
      imageType: "",
    },
  ) {
    this.aspectRatio = aspectRatio;
    this.cid = cid;
    this.thumbhash = thumbhash;
    this.imageType = imageType;
  }

  encode(): Buffer {
    throw new Error("Object does not support encoding");
  }

  decode(data: Buffer): boolean {
    throw new Error("Object does not support decoding");
  }

  encodeData(): Map<number, any> {
    const map = new Map<number, any>([
      [2, this.aspectRatio],
      [3, this.cid.toBytes()],
    ]);

    function addNotNull(key: number, value: any): void {
      if (value !== undefined && value !== null) {
        map.set(key, value);
      }
    }

    addNotNull(1, this.imageType);
    addNotNull(4, this.thumbhash);
    return map;
  }

  decodeData(data: Map<number, any> | object): void {
    const map = maybeConvertObjectToIntMap(data);
    this.aspectRatio = map.get(2);
    this.cid = CID.fromBytes(map.get(3));
    this.imageType = map.get(1);
    this.thumbhash = map.get(4);
  }

  fromJSON(json: any): this {
    if (!json) {
      return this;
    }

    this.aspectRatio = json.aspectRatio;
    this.cid = CID.fromBytes(json.cid);
    this.imageType = json.imageType;
    this.thumbhash = base64UrlDecode(json.thumbhash);

    return this;
  }

  toJSON(): any {
    return {
      imageType: this.imageType,
      aspectRatio: this.aspectRatio,
      cid: this.cid.toString(),
      thumbhash: this.thumbhash ? base64UrlEncode(this.thumbhash) : null,
    };
  }
}
