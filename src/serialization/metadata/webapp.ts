import Metadata from "#serialization/metadata/base.js";
import ExtraMetadata from "#serialization/metadata/extra.js";
import CID from "#cid.js";
import Unpacker from "#serialization/unpack.js";
import { METADATA_TYPES, metadataMagicByte } from "#constants.js";
import { Buffer } from "buffer";

export default class WebAppMetadata extends Metadata {
  name: string | null;
  tryFiles: string[];
  errorPages: Map<number, string>;
  extraMetadata: ExtraMetadata;
  paths: { [key: string]: WebAppMetadataFileReference };

  constructor(
    name: string | null,
    tryFiles: string[],
    errorPages: Map<number, string>,
    paths: { [key: string]: WebAppMetadataFileReference },
    extraMetadata: ExtraMetadata,
  ) {
    super();
    this.name = name;
    this.tryFiles = tryFiles;
    this.errorPages = errorPages;
    this.paths = paths;
    this.extraMetadata = extraMetadata;
  }

  toJson(): { [key: string]: any } {
    return {
      type: "web_app",
      name: this.name,
      tryFiles: this.tryFiles,
      errorPages: Array.from(this.errorPages.entries()).reduce(
        (obj, [key, value]) => {
          obj[key.toString()] = value;
          return obj;
        },
        {} as { [key: string]: string },
      ),
      paths: Object.fromEntries(
        Object.entries(this.paths).map(([key, ref]) => [key, ref.toJson()]),
      ),
      extraMetadata: this.extraMetadata,
    };
  }
}

class WebAppMetadataFileReference {
  contentType: string | null;
  cid: CID;

  constructor(cid: CID, contentType: string | null) {
    this.cid = cid;
    this.contentType = contentType;
  }

  get size(): number {
    return this.cid.size ?? 0;
  }

  toJson(): { [key: string]: any } {
    return {
      cid: this.cid.toBase64Url(),
      contentType: this.contentType,
    };
  }
}

export async function deserialize(bytes: Uint8Array): Promise<WebAppMetadata> {
  const u = new Unpacker(Buffer.from(bytes));

  const magicByte = u.unpackInt();
  if (magicByte !== metadataMagicByte) {
    throw new Error("Invalid metadata: Unsupported magic byte");
  }
  const typeAndVersion = u.unpackInt();
  if (typeAndVersion !== METADATA_TYPES.WEBAPP) {
    throw new Error("Invalid metadata: Wrong metadata type");
  }

  u.unpackListLength();

  const name = u.unpackString();

  const tryFiles = u.unpackList() as string[];

  const errorPages = u.unpackMap() as Record<number, string>;

  const length = u.unpackListLength();

  const paths: Record<string, WebAppMetadataFileReference> = {};

  for (let i = 0; i < length; i++) {
    u.unpackListLength();
    const path = u.unpackString();
    const cid = CID.fromBytes(u.unpackBinary());
    paths[path as string] = new WebAppMetadataFileReference(
      cid,
      u.unpackString(),
    );
  }

  const extraMetadata = u.unpackMap() as Record<number, any>;

  return new WebAppMetadata(
    name,
    tryFiles,
    new Map<number, string>(
      Object.entries(errorPages).map(([key, value]) => [Number(key), value]),
    ),
    paths,
    new ExtraMetadata(extraMetadata),
  );
}
