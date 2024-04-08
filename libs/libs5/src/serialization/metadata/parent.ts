import CID from "@/cid.js";
import { parentLinkTypeUserIdentity } from "@/constants.js";

export class MetadataParentLink {
  cid: CID;
  type: number;
  role: string | null;
  signed: boolean;

  constructor(
    cid: CID,
    type: number = parentLinkTypeUserIdentity,
    role: string | null = null,
    signed: boolean = false,
  ) {
    this.cid = cid;
    this.type = type;
    this.role = role;
    this.signed = signed;
  }

  toJson(): { [key: string]: any } {
    const map: { [key: string]: any } = {};

    map["cid"] = this.cid.toString();
    map["type"] = this.type;
    if (this.role !== null) {
      map["role"] = this.role;
    }
    map["signed"] = this.signed;

    return map;
  }
}
