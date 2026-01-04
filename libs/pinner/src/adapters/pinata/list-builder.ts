import type { Pinner } from "@/pinner";
import type { PinataFile, PinataListBuilder } from "@/types/pinata";
import type { RemoteLsOptions } from "@/types/pin";

/**
 * List builder for listing pins.
 *
 * Note: .pageToken() provides Pinata SDK API compatibility for easier migration.
 * The token is passed through to the underlying IPFS Pinning Service cursor parameter.
 * The server handles the actual pagination logic according to the IPFS Pinning Service spec.
 */
class PinataListBuilderImpl implements PinataListBuilder<PinataFile[]> {
  private _limit?: number;
  private _pageToken?: string;
  private _offset?: number;

  constructor(private pinner: Pinner) {}

  limit(limit: number): this {
    this._limit = limit;
    return this;
  }

  offset(offset: number): this {
    this._offset = offset;
    return this;
  }

  pageToken(pageToken: string): this {
    this._pageToken = pageToken;
    return this;
  }

  async execute(): Promise<PinataFile[]> {
    const options: RemoteLsOptions = {};

    if (this._limit !== undefined) {
      options.limit = this._limit;
    }

    if (this._pageToken !== undefined) {
      options.cursor = this._pageToken;
    }

    const remotePins = await this.pinner.listPins(options);

    return remotePins.map((pin) => ({
      id: pin.cid.toString(),
      ipfsPinHash: pin.cid.toString(),
      size: pin.size || 0,
      name: pin.name || "",
      cid: pin.cid.toString(),
      createdAt: pin.created.toISOString(),
    }));
  }
}

/**
 * Create a list builder.
 */
export function createListBuilder(
  pinner: Pinner,
): PinataListBuilder<PinataFile[]> {
  return new PinataListBuilderImpl(pinner);
}
