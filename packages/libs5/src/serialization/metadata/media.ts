import Metadata from "@/serialization/metadata/base.js";
import CID from "@/cid.js";
import {
  CID_HASH_TYPES,
  METADATA_TYPES,
  metadataMagicByte,
  metadataMediaDetailsDuration,
  metadataMediaDetailsIsLive,
  metadataProofTypeSignature,
  parentLinkTypeUserIdentity,
} from "@/constants.js";
import ExtraMetadata from "@/serialization/metadata/extra.js";
import { MetadataParentLink } from "@/serialization/metadata/parent.js";
import { Multihash } from "@/multihash.js";
import { decodeEndian, encodeEndian } from "@/util.js";
import Unpacker from "@/serialization/unpack.js";
import { Buffer } from "buffer";
import { blake3 } from "@noble/hashes/blake3";
import { ed25519 } from "@noble/curves/ed25519";
import KeyPairEd25519 from "@/ed25519.js";
import Packer from "@/serialization/pack.js";

export default class MediaMetadata extends Metadata {
  name: string;
  mediaTypes: { [key: string]: MediaFormat[] };
  parents: MetadataParentLink[];
  details: MediaMetadataDetails;
  links: MediaMetadataLinks | null;
  extraMetadata: ExtraMetadata;

  constructor(
    name: string,
    details: MediaMetadataDetails,
    parents: MetadataParentLink[],
    mediaTypes: { [key: string]: MediaFormat[] },
    links: MediaMetadataLinks | null,
    extraMetadata: ExtraMetadata,
  ) {
    super();
    this.name = name;
    this.details = details;
    this.parents = parents;
    this.mediaTypes = mediaTypes;
    this.links = links;
    this.extraMetadata = extraMetadata;
  }

  toJson(): { [key: string]: any } {
    return {
      type: "media",
      name: this.name,
      details: this.details,
      parents: this.parents,
      mediaTypes: this.mediaTypes,
      links: this.links,
      extraMetadata: this.extraMetadata,
    };
  }
}

class MediaMetadataLinks {
  count: number;
  head: CID[];
  collapsed: CID[] | null;
  tail: CID[] | null;

  constructor(head: CID[]) {
    this.head = head;
    this.count = head.length;
    this.collapsed = null;
    this.tail = null;
  }

  toJson(): { [key: string]: any } {
    const map: { [key: string]: any } = {
      count: this.count,
      head: this.head.map((e) => e.toString()),
    };
    if (this.collapsed != null) {
      map["collapsed"] = this.collapsed.map((e) => e.toString());
    }
    if (this.tail != null) {
      map["tail"] = this.tail.map((e) => e.toString());
    }
    return map;
  }

  static decode(links: { [key: number]: any }): MediaMetadataLinks {
    const count = links[1] as number;
    const head = (links[2] as Uint8Array[]).map((bytes) =>
      CID.fromBytes(bytes),
    );
    const collapsed = links[3]
      ? (links[3] as Uint8Array[]).map((bytes) => CID.fromBytes(bytes))
      : null;
    const tail = links[4]
      ? (links[4] as Uint8Array[]).map((bytes) => CID.fromBytes(bytes))
      : null;

    const instance = new MediaMetadataLinks(head);
    instance.count = count;
    instance.collapsed = collapsed;
    instance.tail = tail;

    return instance;
  }

  encode(): { [key: number]: any } {
    const data: { [key: number]: any } = {
      1: this.count,
      2: this.head,
    };

    const addNotNull = (key: number, value: any) => {
      if (value !== null && value !== undefined) {
        data[key] = value;
      }
    };

    addNotNull(3, this.collapsed);
    addNotNull(4, this.tail);

    return data;
  }
}

class MediaMetadataDetails {
  data: { [key: number]: any };

  constructor(data: { [key: number]: any }) {
    this.data = data;
  }

  toJson(): { [key: string]: any } {
    const map: { [key: string]: any } = {};
    const names: { [key: number]: string } = {
      [metadataMediaDetailsDuration]: "duration",
      [metadataMediaDetailsIsLive]: "live",
    };
    Object.entries(this.data).forEach(([key, value]) => {
      map[names[+key]] = value;
    });

    return map;
  }

  get duration(): number | null {
    return this.data[metadataMediaDetailsDuration];
  }

  get isLive(): boolean {
    return !!this.data[metadataMediaDetailsIsLive];
  }
}

export class MediaFormat {
  subtype: string;
  role: string | null;
  ext: string | null;
  cid: CID | null;
  height: number | null;
  width: number | null;
  languages: string[] | null;
  asr: number | null;
  fps: number | null;
  bitrate: number | null;
  audioChannels: number | null;
  vcodec: string | null;
  acodec: string | null;
  container: string | null;
  dynamicRange: string | null;
  charset: string | null;
  value: Uint8Array | null;
  duration: number | null;
  rows: number | null;
  columns: number | null;
  index: number | null;
  initRange: string | null;
  indexRange: string | null;
  caption: string | null;

  constructor(
    subtype: string,
    role: string | null,
    ext: string | null,
    cid: CID | null,
    height: number | null,
    width: number | null,
    languages: string[] | null,
    asr: number | null,
    fps: number | null,
    bitrate: number | null,
    audioChannels: number | null,
    vcodec: string | null,
    acodec: string | null,
    container: string | null,
    dynamicRange: string | null,
    charset: string | null,
    value: Uint8Array | null,
    duration: number | null,
    rows: number | null,
    columns: number | null,
    index: number | null,
    initRange: string | null,
    indexRange: string | null,
    caption: string | null,
  ) {
    this.subtype = subtype;
    this.role = role;
    this.ext = ext;
    this.cid = cid;
    this.height = height;
    this.width = width;
    this.languages = languages;
    this.asr = asr;
    this.fps = fps;
    this.bitrate = bitrate;
    this.audioChannels = audioChannels;
    this.vcodec = vcodec;
    this.acodec = acodec;
    this.container = container;
    this.dynamicRange = dynamicRange;
    this.charset = charset;
    this.value = value;
    this.duration = duration;
    this.rows = rows;
    this.columns = columns;
    this.index = index;
    this.initRange = initRange;
    this.indexRange = indexRange;
    this.caption = caption;
  }

  get valueAsString(): string | null {
    if (this.value === null) {
      return null;
    }
    return new TextDecoder().decode(this.value);
  }

  static decode(data: { [key: number]: any }): MediaFormat {
    return new MediaFormat(
      data[2], // subtype
      data[3], // role
      data[4], // ext
      data[1] == null ? null : CID.fromBytes(Uint8Array.from(data[1])),
      data[10], // height
      data[11], // width
      data[12] ? (data[12] as string[]) : null, // languages
      data[13], // asr
      data[14], // fps
      data[15], // bitrate
      data[18], // audioChannels
      data[19], // vcodec
      data[20], // acodec
      data[21], // container
      data[22], // dynamicRange
      data[23], // charset
      data[24] == null ? null : Uint8Array.from(data[24]), // value
      data[25], // duration
      data[26], // rows
      data[27], // columns
      data[28], // index
      data[29], // initRange
      data[30], // indexRange
      data[31], // caption
    );
  }

  encode(): { [key: number]: any } {
    const data: { [key: number]: any } = {};

    const addNotNull = (key: number, value: any) => {
      if (value !== null && value !== undefined) {
        data[key] = value;
      }
    };

    addNotNull(1, this.cid?.toBytes());
    addNotNull(2, this.subtype);
    addNotNull(3, this.role);
    addNotNull(4, this.ext);
    addNotNull(10, this.height);
    addNotNull(11, this.width);
    addNotNull(12, this.languages);
    addNotNull(13, this.asr);
    addNotNull(14, this.fps);
    addNotNull(15, this.bitrate);
    // addNotNull(16, this.abr);
    // addNotNull(17, this.vbr);
    addNotNull(18, this.audioChannels);
    addNotNull(19, this.vcodec);
    addNotNull(20, this.acodec);
    addNotNull(21, this.container);
    addNotNull(22, this.dynamicRange);
    addNotNull(23, this.charset);
    addNotNull(24, this.value);
    addNotNull(25, this.duration);
    addNotNull(26, this.rows);
    addNotNull(27, this.columns);
    addNotNull(28, this.index);
    addNotNull(29, this.initRange);
    addNotNull(30, this.indexRange);
    addNotNull(31, this.caption);

    return data;
  }
  toJson(): { [key: string]: any } {
    const data: { [key: string]: any } = {};

    const addNotNull = (key: string, value: any) => {
      if (value !== null && value !== undefined) {
        data[key] = value;
      }
    };

    addNotNull("cid", this.cid?.toBase64Url());
    addNotNull("subtype", this.subtype);
    addNotNull("role", this.role);
    addNotNull("ext", this.ext);
    addNotNull("height", this.height);
    addNotNull("width", this.width);
    addNotNull("languages", this.languages);
    addNotNull("asr", this.asr);
    addNotNull("fps", this.fps);
    addNotNull("bitrate", this.bitrate);
    // addNotNull('abr', this.abr);
    // addNotNull('vbr', this.vbr);
    addNotNull("audioChannels", this.audioChannels);
    addNotNull("vcodec", this.vcodec);
    addNotNull("acodec", this.acodec);
    addNotNull("container", this.container);
    addNotNull("dynamicRange", this.dynamicRange);
    addNotNull("charset", this.charset);
    addNotNull("value", this.value ? this.valueAsString : null); // Assuming valueAsString() is a method to convert value to string
    addNotNull("duration", this.duration);
    addNotNull("rows", this.rows);
    addNotNull("columns", this.columns);
    addNotNull("index", this.index);
    addNotNull("initRange", this.initRange);
    addNotNull("indexRange", this.indexRange);
    addNotNull("caption", this.caption);

    return data;
  }
}

export async function deserialize(bytes: Uint8Array): Promise<MediaMetadata> {
  const magicByte = bytes[0];
  if (magicByte !== metadataMagicByte) {
    throw new Error("Invalid metadata: Unsupported magic byte");
  }
  const typeAndVersion = bytes[1];
  let bodyBytes: Uint8Array;

  const provenPubKeys: Multihash[] = [];

  if (typeAndVersion === METADATA_TYPES.PROOF) {
    const proofSectionLength = decodeEndian(bytes.subarray(2, 4));

    bodyBytes = bytes.subarray(4 + proofSectionLength);

    if (proofSectionLength > 0) {
      const proofUnpacker = new Unpacker(
        Buffer.from(bytes.subarray(4, 4 + proofSectionLength)),
      );

      const b3hash = Uint8Array.from([
        CID_HASH_TYPES.BLAKE3,
        ...blake3(bodyBytes),
      ]);

      const proofCount = proofUnpacker.unpackListLength();

      for (let i = 0; i < proofCount; i++) {
        const parts = proofUnpacker.unpackList();
        const proofType = parts[0] as number;

        if (proofType === metadataProofTypeSignature) {
          const mhashType = parts[1] as number;
          const pubkey = parts[2] as Uint8Array;
          const signature = parts[3] as Uint8Array;

          if (mhashType !== CID_HASH_TYPES.BLAKE3) {
            throw new Error(`Hash type ${mhashType} not supported`);
          }

          if (pubkey[0] !== CID_HASH_TYPES.ED25519) {
            throw new Error("Only ed25519 keys are supported");
          }
          if (pubkey.length !== 33) {
            throw new Error("Invalid userId");
          }

          const isValid = await ed25519.verify(
            signature,
            b3hash,
            pubkey.subarray(1),
          );

          if (!isValid) {
            throw new Error("Invalid signature found");
          }
          provenPubKeys.push(new Multihash(pubkey));
        } else {
          // Unsupported proof type
        }
      }
    }
  } else if (typeAndVersion === METADATA_TYPES.MEDIA) {
    bodyBytes = bytes.subarray(1);
  } else {
    throw new Error(`Invalid metadata: Unsupported type ${typeAndVersion}`);
  }

  // Start of body section
  const u = new Unpacker(Buffer.from(bodyBytes));
  const type = u.unpackInt();

  if (type !== METADATA_TYPES.MEDIA) {
    throw new Error(`Invalid metadata: Unsupported type ${type}`);
  }

  u.unpackListLength();
  const name = u.unpackString();
  const details = new MediaMetadataDetails(u.unpackMap());

  const parents: MetadataParentLink[] = [];
  const userCount = u.unpackListLength();
  for (let i = 0; i < userCount; i++) {
    const m = u.unpackMap();
    const cid = CID.fromBytes(m[1] as Uint8Array);

    parents.push(
      new MetadataParentLink(
        cid,
        (m[0] ?? parentLinkTypeUserIdentity) as number,
        m[2],
        provenPubKeys.some((pk) => pk.equals(cid.hash)), // Assuming Multihash class has an equals method
      ),
    );
  }

  const mediaTypesMap = u.unpackMap() as Record<string, any>;
  const mediaTypes: Record<string, MediaFormat[]> = {};

  Object.entries(mediaTypesMap).forEach(([type, formats]) => {
    mediaTypes[type] = formats.map((e: any) =>
      MediaFormat.decode(e as Record<number, any>),
    );
  });

  const links = u.unpackMap();
  const extraMetadata = u.unpackMap();

  return new MediaMetadata(
    name || "",
    details,
    parents,
    mediaTypes,
    links.size > 0 ? MediaMetadataLinks.decode(links) : null,
    new ExtraMetadata(extraMetadata),
  );
}

export async function serialize(
  m: MediaMetadata,
  keyPairs: KeyPairEd25519[] = [],
): Promise<Uint8Array> {
  const c = new Packer();
  c.packInt(METADATA_TYPES.MEDIA);
  c.packListLength(6);

  c.packString(m.name);
  c.pack(m.details.data);

  c.packListLength(m.parents.length);
  for (const parent of m.parents) {
    c.pack({ 0: parent.type, 1: parent.cid.toBytes() });
  }

  c.packMapLength(Object.keys(m.mediaTypes).length);
  for (const [key, value] of Object.entries(m.mediaTypes)) {
    c.packString(key);
    c.pack(value);
  }

  if (m.links === null) {
    c.packMapLength(0);
  } else {
    c.pack(m.links.encode());
  }

  c.pack(m.extraMetadata.data);

  const bodyBytes = c.takeBytes();

  if (keyPairs.length === 0) {
    return Uint8Array.from([metadataMagicByte, ...bodyBytes]);
  }

  const b3hash = Uint8Array.from([CID_HASH_TYPES.BLAKE3, ...blake3(bodyBytes)]);

  const proofPacker = new Packer();
  proofPacker.packListLength(keyPairs.length);

  for (const kp of keyPairs) {
    const signature = await ed25519.sign(b3hash, kp.extractBytes());
    proofPacker.pack([
      metadataProofTypeSignature,
      CID_HASH_TYPES.BLAKE3,
      kp.publicKey,
      signature,
    ]);
  }
  const proofBytes = proofPacker.takeBytes();

  const header = [
    metadataMagicByte,
    METADATA_TYPES.PROOF,
    ...encodeEndian(proofBytes.length, 2),
  ];

  return Uint8Array.from([...header, ...proofBytes, ...bodyBytes]);
}
