/**
 * Claims module index — re-exports ClaimsAPI and all claim types.
 *
 * @module @lumeweb/lbry-sdk/claims
 */

export { ClaimsAPI } from "@/claims/api";
export type {
  ChannelClaim,
  StreamClaim,
  CollectionClaim,
  RepostClaim,
  SupportClaim,
  ClaimResult,
  ParsedClaim,
} from "@/claims/types";
