/**
 * Claim types — parameter interfaces and result types for LBRY claims.
 *
 * LBRY claims are protobuf-encoded values published on the LBRY blockchain.
 * There are four claim types: channel, stream, collection, and repost.
 *
 * @module @lumeweb/lbry-sdk/claims/types
 */

/**
 * Channel claim parameters.
 *
 * @property title - Display name for the channel
 * @property publicKeyHex - Hex-encoded public key for channel identity
 */
export interface ChannelClaim {
  title: string;
  publicKeyHex: string;
}

/**
 * Stream claim parameters.
 *
 * @property title - Title of the content
 * @property description - Description text
 * @property sdHash - Hash of the signed data blob (SD hash)
 * @property mediaType - MIME type of the content (e.g., "video/mp4")
 * @property channelClaimID - Optional channel claim ID to associate the stream with
 */
export interface StreamClaim {
  title: string;
  description: string;
  sdHash: string;
  mediaType: string;
  channelClaimID?: string;
}

/**
 * Collection claim parameters.
 *
 * @property title - Title of the collection
 * @property claimIDs - Array of claim IDs to include in the collection
 */
export interface CollectionClaim {
  title: string;
  claimIDs: string[];
}

/**
 * Repost claim parameters.
 *
 * @property title - Title for the repost
 * @property claimID - The claim ID being reposted
 */
export interface RepostClaim {
  title: string;
  claimID: string;
}

/**
 * Support claim parameters.
 *
 * @property emoji - Emoji reaction for support
 */
export interface SupportClaim {
  emoji: string;
}

/**
 * Result of creating or signing a claim.
 *
 * @property valueHex - The hex-encoded claim value (protobuf serialized)
 */
export interface ClaimResult {
  valueHex: string;
}

/**
 * Parsed claim value — matches Go's exports.ParsedClaim struct.
 *
 * @property version - Claim version number
 * @property hasSignature - Whether the claim has a valid signature
 * @property claimType - Type of claim (e.g., "channel", "stream", "collection", "repost")
 * @property title - Claim title
 * @property publicKeyHex - Hex-encoded public key (for channel claims)
 * @property mediaType - MIME type (for stream claims)
 * @property sdHashHex - Hex-encoded SD hash (for stream claims)
 * @property claimIDHex - Hex-encoded claim ID (for repost claims)
 * @property signatureHex - Hex-encoded signature (for signed claims)
 */
export interface ParsedClaim {
  version: number;
  hasSignature: boolean;
  claimType: string;
  title: string;
  publicKeyHex?: string;
  mediaType?: string;
  sdHashHex?: string;
  claimIDHex?: string;
  signatureHex?: string;
}
