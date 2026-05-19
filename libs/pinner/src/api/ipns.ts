import ky, { HTTPError } from "ky";
import type { PinnerConfig } from "../config";
import type {
  IPNSKeyListResponseResponse,
  IPNSKeyRequest,
  IPNSKeyResponse,
  IPNSPublishRequest,
  IPNSPublishResponse,
  IPNSResolveResponse,
} from "./generated/schemas/index";
import {
  ConfigurationError,
  AuthenticationError,
  NotFoundError,
  NetworkError,
  ValidationError,
} from "@/errors";

export interface IpnsClientOptions {
  signal?: AbortSignal;
}

export class IpnsClient {
  private config: PinnerConfig;

  constructor(config: PinnerConfig) {
    if (!config.jwt) {
      throw new ConfigurationError("JWT token is required");
    }
    this.config = config;
  }

  private getEndpoint(): string {
    return this.config.endpoint ?? "https://ipfs.pinner.xyz";
  }

  private async request<T>(
    path: string,
    options?: RequestInit & { signal?: AbortSignal },
  ): Promise<T> {
    if (!this.config.jwt) {
      throw new ConfigurationError("JWT token is required");
    }

    try {
      const response = await ky(path, {
        prefix: this.getEndpoint(),
        headers: {
          Authorization: `Bearer ${this.config.jwt}`,
          "Content-Type": "application/json",
        },
        ...options,
      });

      if (response.status === 204) {
        return undefined as T;
      }

      const text = await response.text();
      if (!text) {
        return undefined as T;
      }

      return JSON.parse(text) as T;
    } catch (error) {
      if (error instanceof HTTPError) {
        const status = error.response.status;
        const body = await error.response.json().catch(() => ({}));

        if (status === 401) {
          throw new AuthenticationError(
            body.error || "Authentication failed",
          );
        }
        if (status === 403) {
          throw new AuthenticationError(
            body.error || "Access forbidden",
          );
        }
        if (status === 404) {
          throw new NotFoundError(body.error || "Resource not found");
        }
        if (status === 400) {
          throw new ValidationError(body.error || "Invalid request");
        }

        throw new NetworkError(
          body.error || `HTTP error: ${status}`,
          status,
        );
      }

      if (error instanceof Error) {
        throw new NetworkError(error.message);
      }

      throw new NetworkError("Unknown error occurred");
    }
  }

  async listKeys(options?: IpnsClientOptions): Promise<IPNSKeyListResponseResponse> {
    return this.request<IPNSKeyListResponseResponse>("api/ipns/keys", {
      signal: options?.signal,
    });
  }

  async getKey(id: number, options?: IpnsClientOptions): Promise<IPNSKeyResponse> {
    return this.request<IPNSKeyResponse>(`api/ipns/keys/${id}`, {
      signal: options?.signal,
    });
  }

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

  async deleteKey(id: number, options?: IpnsClientOptions): Promise<void> {
    await this.request<void>(`api/ipns/keys/${id}`, {
      method: "DELETE",
      signal: options?.signal,
    });
  }

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

  async republish(
    name: string,
    options?: IpnsClientOptions,
  ): Promise<void> {
    await this.request<void>("api/ipns/republish", {
      method: "POST",
      body: JSON.stringify({ name }),
      signal: options?.signal,
    });
  }

  async resolve(
    name: string,
    options?: IpnsClientOptions,
  ): Promise<IPNSResolveResponse> {
    return this.request<IPNSResolveResponse>(`api/ipns/resolve/${name}`, {
      signal: options?.signal,
    });
  }
}
