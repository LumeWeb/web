import ky, { HTTPError } from "ky";
import type { PinnerConfig } from "../config";
import type {
  ErrorResponse,
  WebsiteItem,
  WebsiteItemResponse,
  WebsiteRequest,
  WebsiteResponse,
  WebsiteValidateResponse,
} from "./generated/lumePinnerWebsitesIPNSAPI.schemas";
import {
  ConfigurationError,
  AuthenticationError,
  NotFoundError,
  NetworkError,
  ValidationError,
} from "@/errors";

export interface WebsitesClientOptions {
  signal?: AbortSignal;
}

export class WebsitesClient {
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
        prefixUrl: this.getEndpoint(),
        headers: {
          Authorization: `Bearer ${this.config.jwt}`,
          "Content-Type": "application/json",
        },
        ...options,
      }).json<T>();

      return response;
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
        if (status === 410) {
          throw new ValidationError(body.error || "Target is broken or gone");
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

  async listWebsites(options?: WebsitesClientOptions): Promise<WebsiteItemResponse> {
    return this.request<WebsiteItemResponse>("api/websites", {
      signal: options?.signal,
    });
  }

  async createWebsite(
    request: WebsiteRequest,
    options?: WebsitesClientOptions,
  ): Promise<WebsiteResponse> {
    return this.request<WebsiteResponse>("api/websites", {
      method: "POST",
      body: JSON.stringify(request),
      signal: options?.signal,
    });
  }

  async getWebsite(
    id: number,
    options?: WebsitesClientOptions,
  ): Promise<WebsiteResponse> {
    return this.request<WebsiteResponse>(`api/websites/${id}`, {
      signal: options?.signal,
    });
  }

  async updateWebsite(
    id: number,
    request: WebsiteRequest,
    options?: WebsitesClientOptions,
  ): Promise<WebsiteResponse> {
    return this.request<WebsiteResponse>(`api/websites/${id}`, {
      method: "PUT",
      body: JSON.stringify(request),
      signal: options?.signal,
    });
  }

  async deleteWebsite(
    id: number,
    options?: WebsitesClientOptions,
  ): Promise<void> {
    await this.request<void>(`api/websites/${id}`, {
      method: "DELETE",
      signal: options?.signal,
    });
  }

  async validateWebsite(
    id: number,
    options?: WebsitesClientOptions,
  ): Promise<WebsiteValidateResponse> {
    return this.request<WebsiteValidateResponse>(
      `api/websites/${id}/validate`,
      {
        method: "POST",
        signal: options?.signal,
      },
    );
  }
}
