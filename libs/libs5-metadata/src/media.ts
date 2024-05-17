import {
  IChildMetadata,
  IMetadata,
  maybeConvertObjectToIntMap,
  Metadata,
} from "./metadata";
import { Extra } from "./extra";
import {
  CID,
  METADATA_BYTES,
  Multihash,
  PARENT_LINK_BYTES,
} from "@lumeweb/libs5-encoding";
import { Unpacker } from "./unpack";
import { OrderedSet } from "immutable";
import { Packer, registerEncodeableClass } from "./pack";
import { DirectoryDetails } from "libs/libs5-metadata/src/directory.js";

interface MediaConstructorParams {
  name: string;
  mediaTypes: Map<string, OrderedSet<MediaFormat>>;
  parents: OrderedSet<ParentLink>;
  details: MediaDetails;
  links?: MediaLinks;
  extraMetadata: Extra;
}

export class Media implements IMetadata {
  public name: string;
  public mediaTypes: Map<string, OrderedSet<MediaFormat>>;
  public parents: OrderedSet<ParentLink>;
  public details: MediaDetails;
  public links?: MediaLinks;
  public extraMetadata: Extra;

  constructor(
    {
      name = "",
      mediaTypes = new Map<string, OrderedSet<MediaFormat>>(),
      parents = OrderedSet<ParentLink>(),
      details = new MediaDetails(),
      links = undefined,
      extraMetadata = new Extra(),
    }: MediaConstructorParams = {
      name: "",
      mediaTypes: new Map<string, OrderedSet<MediaFormat>>(),
      parents: OrderedSet<ParentLink>(),
      details: new MediaDetails(),
      links: undefined,
      extraMetadata: new Extra(),
    },
  ) {
    this.name = name;
    this.mediaTypes = mediaTypes;
    this.parents = parents;
    this.details = details;
    this.links = links;
    this.extraMetadata = extraMetadata;
  }

  fromJSON(json: any): this {
    this.name = json.name;
    this.details.fromJSON(json.details);

    this.parents = OrderedSet<ParentLink>(
      json.parents.map((parent: any) => new ParentLink().fromJSON(parent)),
    );

    this.mediaTypes = new Map<string, OrderedSet<MediaFormat>>();

    for (const [key, value] of Object.entries<any>(json.mediaTypes)) {
      this.mediaTypes.set(
        key,
        OrderedSet<MediaFormat>(
          value.map((format: any) => new MediaFormat().fromJSON(format)),
        ),
      );
    }

    this.links = new MediaLinks();
    this.links.fromJSON(json.links);

    this.extraMetadata = new Extra();
    this.extraMetadata.fromJSON(json.extraMetadata);

    return this;
  }

  encode(): Buffer {
    const p = new Packer();
    Metadata.prepare(p, METADATA_BYTES.TYPES.MEDIA);

    p.packListLength(6);

    p.packString(this.name);
    p.pack(this.details.data);

    p.packListLength(this.parents.size);

    for (const parent of this.parents) {
      p.pack({
        0: parent.type,
        1: parent.cid.toBytes(),
      });
    }

    p.packMapLength(this.mediaTypes.size);
    for (const [key, value] of this.mediaTypes) {
      p.packString(key);
      p.pack(value);
    }

    if (!this.links) {
      p.packMapLength(0);
    } else {
      p.pack(this.links);
    }

    p.pack(this.extraMetadata.data);

    const bodyBytes = p.takeBytes();

    return Buffer.from(bodyBytes);
  }

  decode(data: Buffer): boolean {
    let u = new Unpacker(data);
    Metadata.preprocess(u, METADATA_BYTES.TYPES.MEDIA);
    u.unpackListLength();

    const name = u.unpackString() as string;
    const details = new MediaDetails(u.unpackMap());

    let parents = OrderedSet<ParentLink>();
    const userCount = u.unpackListLength();

    for (let i = 0; i < userCount; i++) {
      const m = u.unpackMap();
      const cid = CID.fromBytes(m[1] as Uint8Array);
      parents = parents.add(
        new ParentLink({
          cid,
          role: m[2] as string,
          type: (m[0] ?? PARENT_LINK_BYTES.TYPES.USER_IDENTITY) as number,
          signed: false,
        }),
      );
    }

    const mediaTypesMap = u.unpackMap();
    const mediaTypes = new Map<string, OrderedSet<MediaFormat>>();

    for (const [key, value] of Object.entries(mediaTypesMap)) {
      const type = key;

      let formats = OrderedSet<MediaFormat>();
      for (const format of value) {
        const inst = new MediaFormat();
        inst.decodeData(format);
        formats = formats.add(inst);
      }

      mediaTypes.set(type, formats);
    }

    const links = u.unpackMap();
    const extraMetadata = u.unpackMap();

    this.name = name;
    this.mediaTypes = mediaTypes;
    this.parents = parents;
    this.details = details;
    this.links = new MediaLinks();
    this.links.decodeData(links);

    if (this.links.count === 0) {
      this.links = undefined;
    }

    this.extraMetadata = new Extra(extraMetadata);

    return true;
  }

  toJSON() {
    const mediaTypesJson: Record<string, any[]> = {};

    for (const [mediaType, formats] of this.mediaTypes.entries()) {
      mediaTypesJson[mediaType] = formats
        .toArray()
        .map((format) => format.toJSON());
    }

    return {
      type: "media",
      name: this.name,
      details: this.details.toJSON(),
      parents: this.parents.toArray().map((parent) => parent.toJSON()),
      mediaTypes: mediaTypesJson,
      links: this.links?.toJSON() ?? null,
      extraMetadata: this.extraMetadata.toJSON(),
    };
  }

  public static fromBuffer(encoded: Buffer): Media {
    return Metadata.fromBuffer<Media>(Media, encoded);
  }
}

interface ParentLinkConstructorParams {
  cid: CID;
  type: number;
  signed: boolean;
  role?: string;
}

export class ParentLink implements IMetadata {
  public cid: CID;
  public type: number;
  public signed: boolean;
  public role?: string;

  constructor(
    {
      cid,
      type = PARENT_LINK_BYTES.TYPES.USER_IDENTITY,
      signed = false,
      role = "",
    }: ParentLinkConstructorParams = {
      cid: new CID(0, new Multihash(new Uint8Array()), 0),
      type: PARENT_LINK_BYTES.TYPES.USER_IDENTITY,
      signed: false,
      role: "",
    },
  ) {
    this.cid = cid;
    this.type = type;
    this.signed = signed;
    this.role = role;
  }

  encode(): Buffer {
    throw new Error("Object does not support encoding");
  }

  decode(data: Buffer): boolean {
    throw new Error("Object does not support decoding");
  }

  toJSON(): any {
    const map: Record<string, any> = {};

    function addNotNull(key: string, value: any): void {
      if (value !== undefined && value !== null) {
        map[key] = value;
      }
    }

    let role = this.role;

    if (role === "") {
      role = undefined;
    }

    addNotNull("cid", this.cid.toString());
    addNotNull("type", this.type);
    addNotNull("role", role);
    addNotNull("signed", this.signed);

    return map;
  }

  fromJSON(json: any) {
    this.cid = CID.decode(json.cid);
    this.type = json?.type;
    this.role = json?.role;
    this.signed = json?.signed;

    return this;
  }
}

export class MediaLinks implements IMetadata, IChildMetadata {
  public count: number;
  public head: OrderedSet<CID>;
  public collapsed?: OrderedSet<CID>;
  public tail?: OrderedSet<CID>;

  constructor(head: OrderedSet<CID> = OrderedSet<CID>()) {
    this.head = head as OrderedSet<CID>;
    this.count = this.head.size;
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

    if (this.head.size > 0) {
      addNotNull(1, this.count);
      addNotNull(2, this.head);
    }

    addNotNull(3, this.collapsed);
    addNotNull(4, this.tail);

    return map;
  }

  decode(data: Buffer): boolean {
    throw new Error("Object does not support decoding");
  }

  decodeData(links: Map<number, any> | object): void {
    let map;

    if (links instanceof Map) {
      map = links;
    } else {
      map = new Map<number, any>(
        Object.entries(links).map(([key, value]) => [Number(key), value]),
      );
    }

    if (!map.size) {
      return;
    }

    this.count = map.get(1) as number;
    this.head = OrderedSet<CID>(
      (map.get(2) as Uint8Array[]).map((bytes) => CID.fromBytes(bytes)),
    );

    const collapsedBytes = map.get(3) as Uint8Array[] | undefined;
    this.collapsed = collapsedBytes
      ? OrderedSet<CID>(collapsedBytes.map((bytes) => CID.fromBytes(bytes)))
      : undefined;

    const tailBytes = map.get(4) as Uint8Array[] | undefined;
    this.tail = tailBytes
      ? OrderedSet<CID>(tailBytes.map((bytes) => CID.fromBytes(bytes)))
      : undefined;
  }

  toJSON(): any {
    const map: Record<string, any> = {
      count: this.count,
      head: this.head.map((cid) => cid.toString()),
    };

    if (this.collapsed !== undefined) {
      map["collapsed"] = this.collapsed.map((cid) => cid.toString());
    }

    if (this.tail !== undefined) {
      map["tail"] = this.tail.map((cid) => cid.toString());
    }

    return map;
  }

  fromJSON(json: any): this {
    if (!json) {
      return this;
    }

    if (json.head) {
      this.head = OrderedSet<CID>(
        json.head.map((cid: string) => CID.decode(cid)),
      );
    }

    if (json.collapsed) {
      this.collapsed = OrderedSet<CID>(
        json.collapsed.map((cid: string) => CID.decode(cid)),
      );
    }

    if (json.tail) {
      this.tail = OrderedSet<CID>(
        json.tail.map((cid: string) => CID.decode(cid)),
      );
    }

    this.count = this.head?.size ?? 0;

    return this;
  }
}

export class MediaDetails implements IMetadata {
  public data: Map<number, any>;

  constructor(data: Map<number, any> | object = new Map<number, any>()) {
    this.data = maybeConvertObjectToIntMap(data);
  }

  encode(): Buffer {
    throw new Error("Object does not support encoding");
  }

  decode(data: Buffer): boolean {
    throw new Error("Object does not support decoding");
  }

  toJSON(): any {
    const map: Record<string, any> = {};
    const names: Record<string, string> = {
      [METADATA_BYTES.DETAILS.MEDIA.DURATION]: "duration",
      [METADATA_BYTES.DETAILS.MEDIA.IS_LIVE]: "isLive",
      [METADATA_BYTES.DETAILS.MEDIA.WAS_LIVE]: "wasLive",
    };

    for (const [key, value] of this.data.entries()) {
      const mappedKey = names[key];
      if (mappedKey) {
        map[mappedKey] = value;
      }
    }

    return map;
  }

  get duration(): number {
    return this.data.get(METADATA_BYTES.DETAILS.MEDIA.DURATION);
  }

  get isLive(): boolean {
    return this.data.get(METADATA_BYTES.DETAILS.MEDIA.IS_LIVE);
  }

  fromJSON(json: any): this {
    const names: Record<string, number> = {
      duration: METADATA_BYTES.DETAILS.MEDIA.DURATION,
      isLive: METADATA_BYTES.DETAILS.MEDIA.IS_LIVE,
      wasLive: METADATA_BYTES.DETAILS.MEDIA.WAS_LIVE,
    };

    const map = new Map<number, any>();

    for (const [key, value] of Object.entries<any>(json)) {
      if (key in names) {
        const mappedKey = names[key];
        map.set(mappedKey, value);
      }
    }

    this.data = map;

    return this;
  }
}

interface MediaFormatConstructorParams {
  subtype: string;
  role?: string;
  ext?: string;
  cid?: CID;
  height?: number;
  width?: number;
  languages?: OrderedSet<string>;
  asr?: number;
  fps?: number;
  bitrate?: number;
  audioChannels?: number;
  vcodec?: string;
  acodec?: string;
  container?: string;
  dynamicRange?: string;
  charset?: string;
  value?: Uint8Array;
  duration?: number;
  rows?: number;
  columns?: number;
  index?: number;
  initRange?: string;
  indexRange?: string;
  caption?: string;
}

export class MediaFormat implements IMetadata, IChildMetadata {
  public subtype: string;
  public role?: string;
  public ext?: string;
  public cid?: CID;
  public height?: number;
  public width?: number;
  public languages?: OrderedSet<string>;
  public asr?: number;
  public fps?: number;
  public bitrate?: number;
  public audioChannels?: number;
  public vcodec?: string;
  public acodec?: string;
  public container?: string;
  public dynamicRange?: string;
  public charset?: string;
  public value?: Uint8Array;
  public duration?: number;
  public rows?: number;
  public columns?: number;
  public index?: number;
  public initRange?: string;
  public indexRange?: string;
  public caption?: string;

  constructor(
    {
      subtype,
      role,
      ext,
      cid,
      height,
      width,
      languages,
      asr,
      fps,
      bitrate,
      audioChannels,
      vcodec,
      acodec,
      container,
      dynamicRange,
      charset,
      value,
      duration,
      rows,
      columns,
      index,
      initRange,
      indexRange,
      caption,
    }: MediaFormatConstructorParams = {
      subtype: "",
      role: "",
      ext: "",
      cid: undefined,
      height: 0,
      width: 0,
      languages: OrderedSet<string>(),
      asr: 0,
      fps: 0,
      bitrate: 0,
      audioChannels: 0,
      vcodec: "",
      acodec: "",
      container: "",
      dynamicRange: "",
      charset: "",
      value: new Uint8Array(),
      duration: 0,
      rows: 0,
      columns: 0,
      index: 0,
      initRange: "",
      indexRange: "",
      caption: "",
    },
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

    addNotNull(1, this.cid?.toBytes());
    addNotNull(2, this.subtype);
    addNotNull(3, this.role);
    addNotNull(4, this.ext);
    addNotNull(10, this.height);
    addNotNull(11, this.width);
    addNotNull(12, this.languages?.toArray());
    addNotNull(13, this.asr);
    addNotNull(14, this.fps);
    addNotNull(15, this.bitrate);
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

    return map;
  }

  decode(data: Buffer): boolean {
    throw new Error("Method not implemented.");
  }

  decodeData(data: Map<number, any> | object): void {
    const map = maybeConvertObjectToIntMap(data);
    if (map.get(1)) {
      this.cid = CID.fromBytes(map.get(1));
    }

    this.subtype = map.get(2);
    this.role = map.get(3);
    this.ext = map.get(4);
    this.height = map.get(10);
    this.width = map.get(11);
    this.languages = map.get(12);
    this.asr = map.get(13);
    this.fps = map.get(14);
    this.bitrate = map.get(15);
    this.audioChannels = map.get(18);
    this.vcodec = map.get(19);
    this.acodec = map.get(20);
    this.container = map.get(21);
    this.dynamicRange = map.get(22);
    this.charset = map.get(23);
    this.value = map.get(24);
    this.duration = map.get(25);
    this.rows = map.get(26);
    this.columns = map.get(27);
    this.index = map.get(28);
    this.initRange = map.get(29);
    this.indexRange = map.get(30);
    this.caption = map.get(31);
  }

  get valueAsString(): string | null | undefined {
    return this.value ? new TextDecoder().decode(this.value) : null;
  }

  toJSON(): any {
    const map: Record<string, any> = {};

    function addNotNull(key: string, value: any): void {
      if (value !== undefined && value !== null) {
        map[key] = value;
      }
    }

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
    addNotNull("audioChannels", this.audioChannels);
    addNotNull("vcodec", this.vcodec);
    addNotNull("acodec", this.acodec);
    addNotNull("container", this.container);
    addNotNull("dynamicRange", this.dynamicRange);
    addNotNull("charset", this.charset);
    addNotNull("value", this.valueAsString);
    addNotNull("duration", this.duration);
    addNotNull("rows", this.rows);
    addNotNull("columns", this.columns);
    addNotNull("index", this.index);
    addNotNull("initRange", this.initRange);
    addNotNull("indexRange", this.indexRange);
    addNotNull("caption", this.caption);

    return map;
  }

  fromJSON(json: any): this {
    if (!json) {
      return this;
    }

    if (json.cid) {
      this.cid = CID.decode(json.cid);
    }

    this.subtype = json?.subtype;
    this.role = json?.role;
    this.ext = json?.ext;
    this.height = json?.height;
    this.width = json?.width;
    if (json?.languages?.length > 0) {
      this.languages = OrderedSet(json?.languages);
    } else {
      this.languages = undefined;
    }
    this.asr = json?.asr;
    this.fps = json?.fps;
    this.bitrate = json?.bitrate;
    this.audioChannels = json?.audioChannels;
    this.vcodec = json?.vcodec;
    this.acodec = json?.acodec;
    this.container = json?.container;
    this.dynamicRange = json?.dynamicRange;
    this.charset = json?.charset;

    if (json?.value) {
      this.value = new TextEncoder().encode(json?.value);
    } else {
      this.value = undefined;
    }

    this.duration = json?.duration;
    this.rows = json?.rows;
    this.columns = json?.columns;
    this.index = json?.index;
    this.initRange = json?.initRange;
    this.indexRange = json?.indexRange;
    this.caption = json?.caption;

    return this;
  }
}

registerEncodeableClass(MediaFormat);
registerEncodeableClass(MediaLinks);
