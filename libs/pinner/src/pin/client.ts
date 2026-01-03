import {
  Configuration,
  type Pin,
  type PinStatus,
  RemotePinningServiceClient,
} from "@ipfs-shipyard/pinning-service-client";
import type { PinnerConfig } from "../config";
import type {
  AbortOptions,
  RemoteAddOptions,
  RemoteLsOptions,
  RemotePin,
  RemotePins,
} from "@/types/pin";
import { CID } from "multiformats/cid";
import { ConfigurationError, NotFoundError } from "@/errors";

export class PinClient implements RemotePins {
  private client: RemotePinningServiceClient | null = null;
  private config: PinnerConfig;

  constructor(config: PinnerConfig) {
    this.config = config;
  }

  protected getClient(): RemotePinningServiceClient {
    if (this.client) {
      return this.client;
    }

    if (!this.config.jwt) {
      throw new ConfigurationError("JWT token is required");
    }

    const configuration = new Configuration({
      endpointUrl: this.config.endpoint,
      accessToken: this.config.jwt,
      fetchApi: this.config.fetch ?? fetch,
    });

    this.client = new RemotePinningServiceClient(configuration);
    return this.client;
  }

  async *add(
    cid: CID,
    options?: RemoteAddOptions,
  ): AsyncGenerator<CID, void, undefined> {
    const client = this.getClient();

    const pin: Pin = {
      cid: cid.toString(),
      name: options?.name,
      meta: options?.metadata,
      origins: options?.origins,
    };

    await client.pinsPost({ pin }, { signal: options?.signal });

    yield cid;
  }

  async *ls(
    options?: RemoteLsOptions,
  ): AsyncGenerator<RemotePin, void, undefined> {
    const client = this.getClient();
    const response = await client.pinsGet(this.normalizeListOptions(options), {
      signal: options?.signal,
    });

    for (const result of response.results) {
      yield this.mapResponse(result);
    }
  }

  async isPinned(cid: CID, options?: AbortOptions): Promise<boolean> {
    try {
      await this.get(cid, options);
      return true;
    } catch {
      return false;
    }
  }

  async get(cid: CID, options?: AbortOptions): Promise<RemotePin> {
    const client = this.getClient();
    const response = await client.pinsGet(
      { cid: [cid.toString()] },
      {
        signal: options?.signal,
      },
    );

    if (response.results.length === 0) {
      throw new NotFoundError(`Pin not found for CID: ${cid.toString()}`);
    }

    return this.mapResponse(response.results[0]);
  }

  async setMetadata(
    cid: CID,
    metadata: Record<string, string> | undefined,
    options?: AbortOptions,
  ): Promise<void> {
    const client = this.getClient();
    const response = await client.pinsGet(
      { cid: [cid.toString()] },
      {
        signal: options?.signal,
      },
    );

    if (response.results.length === 0) {
      throw new NotFoundError(`Pin not found for CID: ${cid.toString()}`);
    }

    const pin = response.results[0];
    await client.pinsRequestidPost(
      {
        requestid: pin.requestid,
        pin: {
          cid: pin.pin.cid,
          name: pin.pin.name,
          meta: metadata,
          origins: pin.pin.origins,
        },
      },
      { signal: options?.signal },
    );
  }

  async *rm(
    cid: CID,
    options?: AbortOptions,
  ): AsyncGenerator<CID, void, undefined> {
    const client = this.getClient();
    const response = await client.pinsGet(
      { cid: [cid.toString()] },
      { signal: options?.signal },
    );

    await Promise.all(
      [...response.results].map(async (result) => {
        return client.pinsRequestidDelete(
          { requestid: result.requestid },
          { signal: options?.signal },
        );
      }),
    );

    yield cid;
  }

  private mapResponse(response: PinStatus): RemotePin {
    return {
      cid: CID.parse(response.pin.cid),
      name: response.pin.name,
      status: response.status,
      created: response.created,
      size: response.pin.meta?.size
        ? parseInt(response.pin.meta.size, 10)
        : undefined,
      metadata: response.pin.meta,
    };
  }

  private normalizeListOptions(
    options?: RemoteLsOptions,
  ): Record<string, unknown> {
    const request: Record<string, unknown> = {};

    if (options?.limit !== undefined) {
      request.limit = options.limit;
    }
    if (options?.cursor !== undefined) {
      request.after = options.cursor;
    }
    if (options?.status !== undefined) {
      request.status = options.status;
    }
    if (options?.name !== undefined) {
      request.name = options.name;
    }

    return request;
  }
}
