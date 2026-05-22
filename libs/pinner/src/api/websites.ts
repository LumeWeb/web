import ky, { HTTPError } from "ky";
import { createNanoEvents } from "nanoevents";
import type { PinnerConfig } from "../config";
import type {
  WebsiteItemResponse,
  WebsiteRequest,
  WebsiteResponse,
  WebsiteUpdateRequest,
  WebsiteValidateResponse,
  WebsiteConfigResponse,
  SSLStatusInfo,
} from "./generated/schemas/index";

// SSL status constants
export const SSLStatus = {
  PENDING: "pending",
  VALIDATING: "validating",
  VALID: "valid",
  READY: "ready",
  FAILED: "failed",
  ERROR: "error",
} as const;

export type SSLStatusValue = (typeof SSLStatus)[keyof typeof SSLStatus];

// Website validation reason constants
export const WebsiteValidationReason = {
  VALIDATED: "validated",
  TOKEN_EXPIRED: "token_expired",
  DNS_MISSING: "dns_missing",
  DNS_MISMATCH: "dns_mismatch",
  TOKEN_MISSING: "token_missing",
} as const;

export type WebsiteValidationReasonValue = (typeof WebsiteValidationReason)[keyof typeof WebsiteValidationReason];

const validationReasonValues = Object.values(WebsiteValidationReason) as readonly string[];

export function getValidationReason(response: WebsiteValidateResponse | null | undefined): WebsiteValidationReasonValue | "" {
  if (!response) {
    return "";
  }
  const reason = response.reason;
  if (typeof reason === "string" && validationReasonValues.includes(reason)) {
    return reason as WebsiteValidationReasonValue;
  }
  return "";
}

export function isValidationReason(response: WebsiteValidateResponse | null | undefined, reason: WebsiteValidationReasonValue): boolean {
  if (!response) {
    return false;
  }
  return response.reason === reason;
}
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
        if (status === 410) {
          throw new ValidationError(body.error || "Target is broken or gone");
        }

        throw new NetworkError(
          body.error || `HTTP error: ${status}`,
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
    request: WebsiteUpdateRequest,
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

  async getSSLStatus(
    domain: string,
    options?: WebsitesClientOptions,
  ): Promise<SSLStatusInfo> {
    return this.request<SSLStatusInfo>(
      `api/websites/${encodeURIComponent(domain)}/ssl-status`,
      {
        signal: options?.signal,
      },
    );
  }

  async getWebsiteConfig(
    options?: WebsitesClientOptions,
  ): Promise<WebsiteConfigResponse> {
    return this.request<WebsiteConfigResponse>("api/websites/config", {
      signal: options?.signal,
    });
  }

  watchSSL(
    domain: string,
    options?: WatchOptions,
  ): SSLWatcher {
    return new SSLWatcherImpl(this, domain, options);
  }
}

export interface WatchOptions {
  interval?: number;
  timeout?: number;
}

export interface SSLEvents {
  ready: (status: SSLStatusInfo) => void;
  error: (error: SSLError) => void;
  status: (status: SSLStatusInfo) => void;
}

export interface SSLCallbacks {
  onReady?: (status: SSLStatusInfo) => void;
  onError?: (error: SSLError) => void;
  onStatus?: (status: SSLStatusInfo) => void;
}

export interface SSLWatcher {
  start(callbacks: SSLCallbacks): Promise<void>;
  stop(): void;
}

export interface SSLError extends Error {
  type: 'timeout' | 'error';
  details?: string;
}

const DEFAULT_INTERVAL = 5000;
const DEFAULT_TIMEOUT = 300000;

class SSLWatcherImpl implements SSLWatcher {
  private emitter = createNanoEvents<SSLEvents>();
  private unbind: (() => void)[] = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private stopped = false;
  private options: WatchOptions;
  private runId = 0;

  constructor(
    private client: WebsitesClient,
    private domain: string,
    options: WatchOptions = {},
  ) {
    this.options = {
      interval: options.interval ?? DEFAULT_INTERVAL,
      timeout: options.timeout ?? DEFAULT_TIMEOUT,
    };

    if (this.options.interval <= 0) {
      this.options.interval = DEFAULT_INTERVAL;
    }
    if (this.options.timeout <= 0) {
      this.options.timeout = DEFAULT_TIMEOUT;
    }
  }

  private emitError(
    message: string,
    type: SSLError['type'] = 'error',
    details?: string,
  ): void {
    const error: SSLError = new Error(message) as SSLError;
    error.type = type;
    error.details = details;
    this.emitter.emit('error', error);
    this.stop();
  }

  async start(callbacks: SSLCallbacks = {}): Promise<void> {
    this.stop();
    this.stopped = false;
    const currentRunId = ++this.runId;

    if (callbacks.onReady) {
      this.unbind.push(this.emitter.on('ready', callbacks.onReady));
    }
    if (callbacks.onError) {
      this.unbind.push(this.emitter.on('error', callbacks.onError));
    }
    if (callbacks.onStatus) {
      this.unbind.push(this.emitter.on('status', callbacks.onStatus));
    }

    const checkStatus = async (): Promise<void> => {
      if (this.stopped || this.runId !== currentRunId) {
        return;
      }

      try {
        const status = await this.client.getSSLStatus(this.domain);
        if (this.stopped || this.runId !== currentRunId) {
          return;
        }
        this.emitter.emit('status', status);

        if (status.status === SSLStatus.VALID || status.status === SSLStatus.READY) {
          this.emitter.emit('ready', status);
          this.stop();
        } else if (status.status === SSLStatus.FAILED || status.status === SSLStatus.ERROR) {
          this.emitError(
            status.error || 'SSL provisioning failed',
            'error',
            status.error,
          );
        }
      } catch (err) {
        if (this.stopped || this.runId !== currentRunId) {
          return;
        }

        this.emitError(
          err instanceof Error ? err.message : 'Failed to check SSL status',
          'error',
        );
      }
    };

    await checkStatus();

    if (this.stopped || this.runId !== currentRunId) {
      return;
    }

    this.intervalId = setInterval(checkStatus, this.options.interval);

    this.timeoutId = setTimeout(() => {
      if (!this.stopped && this.runId === currentRunId) {
        this.emitError('SSL provisioning timeout', 'timeout');
      }
    }, this.options.timeout);
  }

  stop(): void {
    this.stopped = true;

    this.unbind.forEach(unbind => unbind());
    this.unbind = [];

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
