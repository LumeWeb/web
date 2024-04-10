import {
  metadataExtensionBasicMediaMetadata,
  metadataExtensionBridge,
  metadataExtensionCategories,
  metadataExtensionDonationKeys,
  metadataExtensionLanguages,
  metadataExtensionLicenses,
  metadataExtensionOriginalTimestamp,
  metadataExtensionPreviousVersions,
  metadataExtensionRoutingHints,
  metadataExtensionSourceUris,
  metadataExtensionTags,
  metadataExtensionTimestamp,
  metadataExtensionUpdateCID,
  metadataExtensionViewTypes,
  metadataExtensionWikidataClaims,
} from "../../constants.js";
import CID from "../../cid.js";

export default class ExtraMetadata {
  data: Map<number, any>;

  constructor(data: Map<number, any> | object) {
    if (data instanceof Map && typeof data == "object") {
      data = Object.entries(data).map(([key, value]) => [Number(key), value]);
    }
    this.data = data as Map<number, any>;
  }

  toJson(): { [key: string]: any } {
    const map: { [key: string]: any } = {};
    const names: { [key: number]: string } = {
      [metadataExtensionLicenses]: "licenses",
      [metadataExtensionDonationKeys]: "donationKeys",
      [metadataExtensionWikidataClaims]: "wikidataClaims",
      [metadataExtensionLanguages]: "languages",
      [metadataExtensionSourceUris]: "sourceUris",
      // metadataExtensionUpdateCID: 'updateCID',
      [metadataExtensionPreviousVersions]: "previousVersions",
      [metadataExtensionTimestamp]: "timestamp",
      [metadataExtensionOriginalTimestamp]: "originalTimestamp",
      [metadataExtensionTags]: "tags",
      [metadataExtensionCategories]: "categories",
      [metadataExtensionBasicMediaMetadata]: "basicMediaMetadata",
      [metadataExtensionViewTypes]: "viewTypes",
      [metadataExtensionBridge]: "bridge",
      [metadataExtensionRoutingHints]: "routingHints",
    };

    this.data.forEach((value, key) => {
      if (key === metadataExtensionUpdateCID) {
        map["updateCID"] = CID.fromBytes(value).toString();
      } else {
        map[names[key]] = value;
      }
    });

    return map;
  }
}
