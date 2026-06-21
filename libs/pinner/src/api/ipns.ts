import type { PinnerConfig } from "../config";
import type { AuthManager } from "@/auth";
import { ApiClient } from "./client";
import type {
  IPNSKeyListResponseResponse,
  IPNSKeyRequest,
  IPNSKeyResponse,
  IPNSPublishRequest,
  IPNSPublishResponse,
  IPNSRepublishResponse,
  IPNSResolveResponse,
} from "./generated/schemas/index";

export interface IpnsClientOptions {
  signal?: AbortSignal;
}

/**
 * Client for managing IPNS keys and publishing content to IPNS names.
 */
export class IpnsClient extends ApiClient {
  /**
   * Create a new IpnsClient.
   * @param config SDK configuration
   * @param auth AuthManager for authentication
   */
  constructor(config: PinnerConfig, auth: AuthManager) {
    super(auth, config.endpoint ?? "https://ipfs.pinner.xyz");
  }

  /**
   * List all IPNS keys.
   * @param options Request options
   */
  async listKeys(options?: IpnsClientOptions): Promise<IPNSKeyListResponseResponse> {
    return this.request<IPNSKeyListResponseResponse>("api/ipns/keys", {
      signal: options?.signal,
    });
  }

  /**
   * Get a specific IPNS key by ID.
   * @param id Key ID
   * @param options Request options
   */
  async getKey(id: number, options?: IpnsClientOptions): Promise<IPNSKeyResponse> {
    return this.request<IPNSKeyResponse>(`api/ipns/keys/${id}`, {
      signal: options?.signal,
    });
  }

  /**
   * Create a new IPNS key.
   * @param request Key creation parameters
   * @param options Request options
   */
  async createKey(
    request: IPNSKeyRequest,
    options?: IpnsClientOptions,
  ): Promise<IPNSKeyResponse> {
    return this.request<IPNSKeyResponse>("api/ipns/keys", {
      method: "POST",
      body: JSON.stringify(request),
      signal: options?.signal,
    });
  }

  /**
   * Delete an IPNS key by ID.
   * @param id Key ID to delete
   * @param options Request options
   */
  async deleteKey(id: number, options?: IpnsClientOptions): Promise<void> {
    await this.request<void>(`api/ipns/keys/${id}`, {
      method: "DELETE",
      signal: options?.signal,
    });
  }

  /**
   * Publish content to an IPNS name.
   * @param request Publishing parameters
   * @param options Request options
   */
  async publish(
    request: IPNSPublishRequest,
    options?: IpnsClientOptions,
  ): Promise<IPNSPublishResponse> {
    return this.request<IPNSPublishResponse>("api/ipns/publish", {
      method: "POST",
      body: JSON.stringify(request),
      signal: options?.signal,
    });
  }

  /**
   * Republish (refresh) an existing IPNS record.
   * @param id Key ID to republish
   * @param options Request options
   */
  async republish(
    id: number,
    options?: IpnsClientOptions,
  ): Promise<IPNSRepublishResponse> {
    return this.request<IPNSRepublishResponse>(`api/ipns/keys/${id}/republish`, {
      method: "POST",
      signal: options?.signal,
    });
  }

  /**
   * Resolve an IPNS name to its content.
   * @param name IPNS name to resolve
   * @param options Request options
   */
  async resolve(
    name: string,
    options?: IpnsClientOptions,
  ): Promise<IPNSResolveResponse> {
    return this.request<IPNSResolveResponse>(`api/ipns/resolve/${name}`, {
      signal: options?.signal,
    });
  }
}
