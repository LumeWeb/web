import CID from "@/cid.js";

export default class UserIdentityMetadata {
  userID?: CID;
  details: UserIdentityMetadataDetails;
  signingKeys: UserIdentityPublicKey[];
  encryptionKeys: UserIdentityPublicKey[];
  links: Map<number, CID>;

  constructor(
    details: UserIdentityMetadataDetails,
    signingKeys: UserIdentityPublicKey[],
    encryptionKeys: UserIdentityPublicKey[],
    links: Map<number, CID>,
  ) {
    this.details = details;
    this.signingKeys = signingKeys;
    this.encryptionKeys = encryptionKeys;
    this.links = links;
  }
}

class UserIdentityMetadataDetails {
  created: number;
  createdBy: string;

  constructor(created: number, createdBy: string) {
    this.created = created;
    this.createdBy = createdBy;
  }
}

class UserIdentityPublicKey {
  key: Uint8Array;

  constructor(key: Uint8Array) {
    this.key = key;
  }
}
