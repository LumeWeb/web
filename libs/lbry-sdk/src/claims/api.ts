/**
 * Claims module — create, sign, and parse LBRY claim values.
 *
 * All protobuf serialization + ECDSA signing is handled in WASM (liblbry/claim).
 * No JS equivalent exists for LBRY's protobuf format — must stay in Go.
 *
 * @module @lumeweb/lbry-sdk/claims/api
 */

import { WasmBase } from "@/wasm/base";
import { unwrap } from "@/wasm/unwrap";
import type { WalletHandle } from "@/wallet/types";
import type {
  ChannelClaim,
  StreamClaim,
  CollectionClaim,
  RepostClaim,
  ClaimResult,
  ParsedClaim,
} from "@/claims/types";

/**
 * LBRY Claims API — create, sign, and parse claim values.
 *
 * All protobuf serialization + ECDSA signing handled in WASM (liblbry/claim).
 * No JS equivalent exists for LBRY's protobuf format — must stay in Go.
 *
 * @example
 * ```ts
 * const wasm = await WasmLoader.load();
 * const claims = new ClaimsAPI(wasm);
 * const { valueHex } = claims.newChannel({ title: "My Channel", publicKeyHex: "..." });
 * ```
 */
export class ClaimsAPI extends WasmBase {

  /**
   * Create a new channel claim.
   *
   * @param params - Channel claim parameters (title and public key)
   * @returns The hex-encoded claim value
   * @throws {Error} If the WASM createChannelClaim call fails
   */
  newChannel(params: ChannelClaim): ClaimResult {
    const { valueHex } = unwrap(
      this.wasm.createChannelClaim(params.title, params.publicKeyHex),
      "createChannelClaim"
    );
    if (!valueHex) throw new Error("createChannelClaim failed");
    return { valueHex };
  }

  /**
   * Create a new stream claim.
   *
   * @param params - Stream claim parameters (title, description, sdHash, mediaType, optional channelClaimID)
   * @returns The hex-encoded claim value
   * @throws {Error} If the WASM createStreamClaim call fails
   */
  newStream(params: StreamClaim): ClaimResult {
    const { valueHex } = unwrap(
      this.wasm.createStreamClaim(
        params.title,
        params.description ?? "",
        params.sdHash,
        params.mediaType ?? "",
        params.channelClaimID ?? ""
      ),
      "createStreamClaim"
    );
    if (!valueHex) throw new Error("createStreamClaim failed");
    return { valueHex };
  }

  /**
   * Create a new collection claim.
   *
   * @param params - Collection claim parameters (title and array of claim IDs)
   * @returns The hex-encoded claim value
   * @throws {Error} If the WASM createCollectionClaim call fails
   */
  newCollection(params: CollectionClaim): ClaimResult {
    const { valueHex } = unwrap(
      this.wasm.createCollectionClaim(params.title, params.claimIDs),
      "createCollectionClaim"
    );
    if (!valueHex) throw new Error("createCollectionClaim failed");
    return { valueHex };
  }

  /**
   * Create a new repost claim.
   *
   * @param params - Repost claim parameters (title and target claim ID)
   * @returns The hex-encoded claim value
   * @throws {Error} If the WASM createRepostClaim call fails
   */
  newRepost(params: RepostClaim): ClaimResult {
    const { valueHex } = unwrap(
      this.wasm.createRepostClaim(params.title, params.claimID),
      "createRepostClaim"
    );
    if (!valueHex) throw new Error("createRepostClaim failed");
    return { valueHex };
  }

  /**
   * Sign a stream claim with a channel key. Returns the signed value hex.
   *
   * @param valueHex - The unsigned claim value hex
   * @param walletHandle - Wallet handle containing the channel key
   * @param firstInputTxID - The txid of the first input (required for signature binding)
   * @param channelClaimIDHex - The channel claim ID to sign with
   * @param channelChain - HD chain index for the channel key (default: 2, i.e., internal/change)
   * @param channelIndex - HD address index for the channel key (default: 0)
   * @returns The signed claim value hex
   * @throws {Error} If the WASM signStreamClaim call fails
   */
  sign(
    valueHex: string,
    walletHandle: WalletHandle,
    firstInputTxID: string,
    channelClaimIDHex: string,
    channelChain: number = 2,
    channelIndex: number = 0
  ): string {
    const { valueHex: signedHex } = unwrap(
      this.wasm.signStreamClaim(
        walletHandle,
        valueHex,
        firstInputTxID,
        channelClaimIDHex,
        channelChain,
        channelIndex
      ),
      "signStreamClaim"
    );
    if (!signedHex) throw new Error("signStreamClaim failed");
    return signedHex;
  }

  /**
   * Parse a claim value from hex.
   *
   * Returns a fully-typed {@link ParsedClaim} object. Optional fields
   * default to empty strings when omitted by Go's omitempty tags.
   *
   * @param claimHex - Hex-encoded claim value to parse
   * @returns Parsed claim data including version, type, title, and optional fields
   * @throws {Error} If parsing fails
   */
  parse(claimHex: string): ParsedClaim {
    const result = unwrap(this.wasm.parseClaimValue(claimHex), "parseClaimValue");
    // Go omits zero-value fields via omitempty tags, so defensively
    // default all optional fields to empty strings.
    return {
      version: result.version,
      hasSignature: result.hasSignature,
      claimType: result.claimType,
      title: result.title,
      publicKeyHex: result.publicKeyHex ?? "",
      mediaType: result.mediaType ?? "",
      sdHashHex: result.sdHashHex ?? "",
      claimIDHex: result.claimIDHex ?? "",
      signatureHex: result.signatureHex ?? "",
    };
  }

  /**
   * Compile (serialize) a claim value from hex.
   *
   * Inverse of `parse` — takes a hex-encoded claim value and returns
   * the canonical serialized form.
   *
   * @param claimHex - Hex-encoded claim value to compile
   * @returns The compiled hex-encoded claim value
   * @throws {Error} If the WASM compileClaimValue call fails
   */
  compile(claimHex: string): string {
    const { valueHex } = unwrap(this.wasm.compileClaimValue(claimHex), "compileClaimValue");
    if (!valueHex) throw new Error("compileClaimValue failed");
    return valueHex;
  }
}
