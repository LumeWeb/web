import { IMetadata } from "./metadata";
import { CID } from "@lumeweb/libs5-encoding";
import { METADATA_BYTES } from "@lumeweb/libs5-encoding";

const IDS_TO_NAMES: Record<string, string> = {
  [METADATA_BYTES.EXTENSIONS.LICENSES]: "licenses",
  [METADATA_BYTES.EXTENSIONS.DONATION_KEYS]: "donationKeys",
  [METADATA_BYTES.EXTENSIONS.WIKIDATA_CLAIMS]: "wikidataClaims",
  [METADATA_BYTES.EXTENSIONS.LANGUAGES]: "languages",
  [METADATA_BYTES.EXTENSIONS.SOURCE_URIS]: "sourceUris",
  [METADATA_BYTES.EXTENSIONS.UPDATE_CID]: "updateCID",
  [METADATA_BYTES.EXTENSIONS.PREVIOUS_VERSIONS]: "previousVersions",
  [METADATA_BYTES.EXTENSIONS.TIMESTAMP]: "timestamp",
  [METADATA_BYTES.EXTENSIONS.ORIGINAL_TIMESTAMP]: "originalTimestamp",
  [METADATA_BYTES.EXTENSIONS.TAGS]: "tags",
  [METADATA_BYTES.EXTENSIONS.CATEGORIES]: "categories",
  [METADATA_BYTES.EXTENSIONS.BASIC_MEDIA_METADATA]: "basicMediaMetadata",
  [METADATA_BYTES.EXTENSIONS.VIEW_TYPES]: "viewTypes",
  [METADATA_BYTES.EXTENSIONS.BRIDGE]: "bridge",
  [METADATA_BYTES.EXTENSIONS.ROUTING_HINTS]: "routingHints",
};

const NAMES_TO_IDS: Record<string, number> = Object.fromEntries(
  Object.entries(IDS_TO_NAMES).map(([key, value]) => [value, Number(key)]),
);

export class Extra implements IMetadata {
  public data: Map<number, any>;

  constructor(
    data: Map<number, any> | Record<string, any> = new Map<number, any>(),
  ) {
    if (data instanceof Map) {
      this.data = data;
    } else {
      this.data = new Map<number, any>(
        Object.entries(data).map(([key, value]) => [Number(key), value]),
      );
    }
  }

  encode(): Buffer {
    throw new Error("Method not implemented.");
  }

  decode(data: Buffer): boolean {
    throw new Error("Method not implemented.");
  }

  toJSON(): any {
    const map: Record<string, any> = {};

    for (const [key, value] of this.data.entries()) {
      const mappedKey = IDS_TO_NAMES[key];
      if (mappedKey) {
        if (key === METADATA_BYTES.EXTENSIONS.UPDATE_CID) {
          map[mappedKey] = CID.fromBytes(value).toString();
        } else {
          map[mappedKey] = value;
        }
      }
    }

    return map;
  }

  fromJSON(json: any): this {
    for (const [key, value] of Object.entries<string>(json)) {
      const mappedKey = NAMES_TO_IDS[key];
      if (mappedKey) {
        if (mappedKey === METADATA_BYTES.EXTENSIONS.UPDATE_CID) {
          this.data.set(mappedKey, CID.decode(value));
        } else {
          this.data.set(mappedKey, value);
        }
      }
    }

    return this;
  }
}
