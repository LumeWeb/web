import ky, { HTTPError } from "ky";
import type { AuthManager } from "@/auth";
import {
  AuthenticationError,
  NotFoundError,
  NetworkError,
  ValidationError,
} from "@/errors";

/**
 * Shared base class for API clients that use ky with Bearer auth.
 *
 * Replaces the duplicated request() + error handling in IpnsClient and WebsitesClient.
 * Auth headers come from AuthManager — one source of truth.
 */
export abstract class ApiClient {
  protected readonly auth: AuthManager;
  protected readonly endpoint: string;

  constructor(auth: AuthManager, endpoint: string) {
    this.auth = auth;
    this.endpoint = endpoint;
  }

  protected async request<T>(
    path: string,
    options?: RequestInit & { signal?: AbortSignal },
  ): Promise<T> {
    try {
      const response = await ky(path, {
        prefix: this.endpoint,
        headers: {
          ...await this.auth.getAuthHeaders(),
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
      throw await this.mapError(error);
    }
  }

  protected async mapError(error: unknown): Promise<Error> {
    if (error instanceof HTTPError) {
      const status = error.response.status;
      const body = await error.response.json().catch(() => ({}));
      const message =
        (body as any).error?.reason ||
        (body as any).error?.details ||
        (body as any).error ||
        (body as any).message;

      if (status === 401 || status === 403) {
        return new AuthenticationError(message || "Authentication failed");
      }
      if (status === 404) {
        return new NotFoundError(message || "Resource not found");
      }
      if (status === 400) {
        return new ValidationError(message || "Invalid request");
      }
      if (status === 410) {
        return new ValidationError(message || "Target is broken or gone");
      }

      return new NetworkError(message || `HTTP error: ${status}`);
    }

    if (error instanceof Error) {
      return new NetworkError(error.message);
    }

    return new NetworkError("Unknown error occurred");
  }
}
