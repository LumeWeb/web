import Metadata from "#serialization/metadata/base.js";
import Packer from "#serialization/pack.js";
import { METADATA_TYPES, metadataMagicByte } from "#constants.js";
import Unpacker from "#serialization/unpack.js";
import ExtraMetadata from "#serialization/metadata/extra.js";
import { Buffer } from "buffer";
import CID from "#cid.js";
import { Multihash } from "#multihash.js";
import { base64url } from "multiformats/bases/base64";
import EncryptedCID from "#encrypted_cid.js";

export default class DirectoryMetadata extends Metadata {
  details: DirectoryMetadataDetails;
  directories: { [key: string]: DirectoryReference };
  files: { [key: string]: FileReference };
  extraMetadata: ExtraMetadata;

  constructor(
    details: DirectoryMetadataDetails,
    directories: { [key: string]: DirectoryReference },
    files: { [key: string]: FileReference },
    extraMetadata: ExtraMetadata,
  ) {
    super();
    this.details = details;
    this.directories = directories;
    this.files = files;
    this.extraMetadata = extraMetadata;
  }

  serialize(): Uint8Array {
    const p = new Packer();
    p.packInt(metadataMagicByte);
    p.packInt(METADATA_TYPES.DIRECTORY);

    p.packListLength(4);

    p.pack(this.details.data);

    p.packMapLength(Object.keys(this.directories).length);
    Object.entries(this.directories).forEach(([key, value]) => {
      p.packString(key);
      p.pack(value.encode());
    });

    p.packMapLength(Object.keys(this.files).length);
    Object.entries(this.files).forEach(([key, value]) => {
      p.packString(key);
      p.pack(value.encode());
    });

    p.pack(this.extraMetadata.data);

    return p.takeBytes();
  }

  toJson(): { [key: string]: any } {
    return {
      type: "directory",
      details: this.details,
      directories: this.directories,
      files: this.files,
      extraMetadata: this.extraMetadata,
    };
  }

  static deserialize(bytes: Uint8Array): DirectoryMetadata {
    const u = new Unpacker(Buffer.from(bytes));

    const magicByte = u.unpackInt();
    if (magicByte !== metadataMagicByte) {
      throw new Error("Invalid metadata: Unsupported magic byte");
    }
    const typeAndVersion = u.unpackInt();
    if (typeAndVersion !== METADATA_TYPES.DIRECTORY) {
      throw new Error("Invalid metadata: Wrong metadata type");
    }

    u.unpackListLength();

    const dir = new DirectoryMetadata(
      new DirectoryMetadataDetails(u.unpackMap()),
      {},
      {},
      new ExtraMetadata({}),
    );

    const dirCount = u.unpackMapLength();
    for (let i = 0; i < dirCount; i++) {
      const key = u.unpackString();
      dir.directories[key as string] = DirectoryReference.decode(u.unpackMap());
    }

    const fileCount = u.unpackMapLength();
    for (let i = 0; i < fileCount; i++) {
      const key = u.unpackString();
      dir.files[key as string] = FileReference.decode(u.unpackMap());
    }

    Object.assign(dir.extraMetadata.data, u.unpackMap());
    return dir;
  }
}

class DirectoryMetadataDetails {
  data: Map<number, any>;

  constructor(data: Map<number, any> | object) {
    if (data instanceof Map && typeof data == "object") {
      data = Object.entries(data).map(([key, value]) => [Number(key), value]);
    }
    this.data = data as Map<number, any>;
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

  setShared(value: boolean, write: boolean): void {
    if (!this.data.has(3)) {
      this.data.set(3, {});
    }
    this.data.get(3)[write ? 2 : 1] = value;
  }

  toJson(): { [key: string]: any } {
    // Convert the data Map to a JSON object
    const jsonObject: { [key: string]: any } = {};
    this.data.forEach((value, key) => {
      jsonObject[key.toString()] = value;
    });
    return jsonObject;
  }
}

export class DirectoryReference {
  created: number;
  name: string;
  encryptedWriteKey: Uint8Array;
  publicKey: Uint8Array;
  encryptionKey: Uint8Array | null;
  ext: { [key: string]: any } | null;

  uri: string | null; // For internal operations
  key: string | null; // For internal operations
  size: number | null; // For internal operations

  constructor(
    created: number,
    name: string,
    encryptedWriteKey: Uint8Array,
    publicKey: Uint8Array,
    encryptionKey: Uint8Array | null,
    ext: { [key: string]: any } | null,
  ) {
    this.created = created;
    this.name = name;
    this.encryptedWriteKey = encryptedWriteKey;
    this.publicKey = publicKey;
    this.encryptionKey = encryptionKey;
    this.ext = ext;
    this.uri = null;
    this.key = null;
    this.size = null;
  }

  toJson(): { [key: string]: any } {
    return {
      name: this.name,
      created: this.created,
      publicKey: base64url.encode(this.publicKey),
      encryptedWriteKey: base64url.encode(this.encryptedWriteKey),
      encryptionKey: this.encryptionKey
        ? base64url.encode(this.encryptionKey)
        : null,
      ext: this.ext,
    };
  }

  static decode(data: { [key: number]: any }): DirectoryReference {
    return new DirectoryReference(
      data[2],
      data[1],
      data[4],
      data[3],
      data[5],
      data[6] ? (data[6] as { [key: string]: any }) : null,
    );
  }

  encode(): { [key: number]: any } {
    const map: { [key: number]: any } = {
      1: this.name,
      2: this.created,
      3: this.publicKey,
      4: this.encryptedWriteKey,
    };

    if (this.encryptionKey !== null) {
      map[5] = this.encryptionKey;
    }
    if (this.ext !== null) {
      map[6] = this.ext;
    }

    return map;
  }
}
export class FileReference {
  created: number;
  file: FileVersion;
  history: Map<number, FileVersion> | null;
  mimeType: string | null;
  name: string;
  version: number;
  ext: { [key: string]: any } | null;

  uri: string | null; // For internal operations
  key: string | null; // For internal operations

  constructor(
    name: string,
    created: number,
    version: number,
    file: FileVersion,
    ext: { [key: string]: any } | null = null,
    history: Map<number, FileVersion> | null = null,
    mimeType: string | null = null,
  ) {
    this.name = name;
    this.created = created;
    this.version = version;
    this.file = file;
    this.ext = ext;
    this.history = history;
    this.mimeType = mimeType;
    this.uri = null;
    this.key = null;
  }

  get modified(): number {
    return this.file.ts;
  }

  toJson(): { [key: string]: any } {
    return {
      name: this.name,
      created: this.created,
      modified: this.modified,
      version: this.version,
      mimeType: this.mimeType,
      file: this.file.toJson(),
      ext: this.ext,
      history: this.history
        ? Array.from(this.history.values()).map((fv) => fv.toJson())
        : null,
    };
  }

  static decode(data: { [key: number]: any }): FileReference {
    const historyData = data[8] as { [key: number]: any } | undefined;
    const history = historyData
      ? new Map(
          Object.entries(historyData).map(([k, v]) => [
            Number(k),
            FileVersion.decode(v),
          ]),
        )
      : null;

    return new FileReference(
      data[1],
      data[2],
      data[5],
      FileVersion.decode(data[4]),
      data[7] ? (data[7] as { [key: string]: any }) : null,
      history,
      data[6],
    );
  }

  encode(): { [key: number]: any } {
    const data: { [key: number]: any } = {
      1: this.name,
      2: this.created,
      4: this.file.encode(),
      5: this.version,
    };

    if (this.mimeType !== null) {
      data[6] = this.mimeType;
    }
    if (this.ext !== null) {
      data[7] = this.ext;
    }
    if (this.history !== null) {
      data[8] = Array.from(this.history.entries()).reduce(
        (obj, [key, value]) => {
          obj[key] = value.encode();
          return obj;
        },
        {} as { [key: number]: any },
      );
    }

    return data;
  }
}

export class FileVersion {
  ts: number;
  encryptedCID?: EncryptedCID;
  plaintextCID?: CID;
  thumbnail?: FileVersionThumbnail;
  hashes?: Multihash[];
  ext?: { [key: string]: any };

  constructor(
    ts: number,
    encryptedCID?: EncryptedCID,
    plaintextCID?: CID,
    thumbnail?: FileVersionThumbnail,
    hashes?: Multihash[],
    ext?: { [key: string]: any },
  ) {
    this.ts = ts;
    this.encryptedCID = encryptedCID;
    this.plaintextCID = plaintextCID;
    this.thumbnail = thumbnail;
    this.hashes = hashes;
    this.ext = ext;
  }

  get cid(): CID {
    return this.plaintextCID ?? this.encryptedCID!.originalCID;
  }

  static decode(data: { [key: number]: any }): FileVersion {
    return new FileVersion(
      data[8],
      data[1] == null ? undefined : EncryptedCID.fromBytes(data[1]),
      data[2] == null ? undefined : CID.fromBytes(data[2]),
      data[10] == null ? undefined : FileVersionThumbnail.decode(data[10]),
      data[9] ? data[9].map((e: any) => new Multihash(e)) : null,
    );
  }

  encode(): { [key: number]: any } {
    const data: { [key: number]: any } = { 8: this.ts };

    if (!!this.encryptedCID) {
      data[1] = this.encryptedCID.toBytes();
    }
    if (!!this.plaintextCID) {
      data[2] = this.plaintextCID.toBytes();
    }
    if (!!this.hashes) {
      data[9] = this.hashes.map((e) => e.fullBytes);
    }
    if (!!this.thumbnail) {
      data[10] = this.thumbnail.encode();
    }

    return data;
  }

  toJson(): { [key: string]: any } {
    return {
      ts: this.ts,
      encryptedCID: this.encryptedCID?.toBase58(),
      cid: this.cid.toBase58(),
      hashes: this.hashes?.map((e) => e.toBase64Url()),
      thumbnail: this.thumbnail?.toJson(),
    };
  }
}
export class FileVersionThumbnail {
  imageType: string | null;
  aspectRatio: number;
  cid: EncryptedCID;
  thumbhash: Uint8Array | null;

  constructor(
    imageType: string | null,
    aspectRatio: number,
    cid: EncryptedCID,
    thumbhash: Uint8Array | null,
  ) {
    this.imageType = imageType || "webp"; // Default to 'webp' if not provided
    this.aspectRatio = aspectRatio;
    this.cid = cid;
    this.thumbhash = thumbhash;
  }

  toJson(): { [key: string]: any } {
    return {
      imageType: this.imageType,
      aspectRatio: this.aspectRatio,
      cid: this.cid.toBase58(),
      thumbhash: this.thumbhash ? base64url.encode(this.thumbhash) : null,
    };
  }

  static decode(data: { [key: number]: any }): FileVersionThumbnail {
    return new FileVersionThumbnail(
      data[1],
      data[2],
      EncryptedCID.fromBytes(data[3]),
      data[4],
    );
  }

  encode(): { [key: number]: any } {
    const data: { [key: number]: any } = {
      2: this.aspectRatio,
      3: this.cid.toBytes(),
    };

    if (this.imageType !== null) {
      data[1] = this.imageType;
    }
    if (this.thumbhash !== null) {
      data[4] = this.thumbhash;
    }

    return data;
  }
}
