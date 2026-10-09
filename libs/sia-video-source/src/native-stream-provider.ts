/* oxlint-disable perfectionist/sort-objects, perfectionist/sort-interfaces, perfectionist/sort-object-types, perfectionist/sort-classes, perfectionist/sort-exports */
/** App-owned adapter that returns service-worker stream URLs for Sia sources. */

import { isSiaShareUrl } from "./share-url.ts";
import type { SiaTransportStatus } from "./transport-telemetry.ts";

export interface SiaNativeStream {
  release(): void;
  readonly url: string;
}

export interface SiaNativeStreamFile {
  readonly blob?: Blob;
  release(): void;
  readonly url: string;
}

export interface SiaNativeStreamProvider {
  available(signal?: AbortSignal): Promise<boolean>;
  open(
    src: string,
    options: {
      mimeType?: string;
      name?: string;
      signal: AbortSignal;
      onStatus?: (status: SiaTransportStatus) => void;
      onProgress?: (bytesDownloaded: number) => void;
    },
  ): Promise<SiaNativeStream>;
}

export interface SiaNativeStreamProviderDependencies {
  capability: (signal?: AbortSignal) => Promise<boolean>;
  createStreamSession: (
    source: unknown,
    signal?: AbortSignal,
  ) => Promise<SiaNativeStreamSession> | SiaNativeStreamSession;
  resolveSource: (src: string, signal?: AbortSignal) => Promise<unknown>;
}

export interface SiaNativeStreamSession {
  url(
    source: unknown,
    options: {
      name: string;
      signal?: AbortSignal;
      type?: string;
      onStatus?: (status: SiaTransportStatus) => void;
      onProgress?: (bytesDownloaded: number) => void;
    },
  ): Promise<SiaNativeStreamFile>;
}

interface NativeProviderOpenOptions {
  mimeType?: string;
  name?: string;
  signal: AbortSignal;
  onStatus?: (status: SiaTransportStatus) => void;
  onProgress?: (bytesDownloaded: number) => void;
}

export class SiaNativeStreamResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SiaNativeStreamResolutionError";
  }
}

export class SiaNativeStreamUnavailableError extends Error {
  constructor() {
    super("native stream playback is unavailable on this page");
    this.name = "SiaNativeStreamUnavailableError";
  }
}

const DEFAULT_STREAM_NAME = "video";
const SHARE_KEY_FRAGMENT = /#encryption_key=[^\s"'<>)]*/gi;

export function createSiaNativeStreamProvider(
  deps: SiaNativeStreamProviderDependencies,
): SiaNativeStreamProvider {
  const provider = {
    available: (signal?: AbortSignal) => deps.capability(signal),
    open: async (src: string, options: NativeProviderOpenOptions) => {
      if (!(await deps.capability(options.signal)))
        throw new SiaNativeStreamUnavailableError();
      let source: unknown;
      try {
        source = await deps.resolveSource(src, options.signal);
      } catch (error) {
        throw sanitizeResolverError(error, src);
      }
      const session = await deps.createStreamSession(source, options.signal);
      const urlOptions: Parameters<SiaNativeStreamSession["url"]>[1] = {
        name: options.name ?? DEFAULT_STREAM_NAME,
        signal: options.signal,
        type: options.mimeType,
      };
      if (options.onStatus) urlOptions.onStatus = options.onStatus;
      if (options.onProgress) urlOptions.onProgress = options.onProgress;
      const file = await session.url(source, urlOptions);
      if (file.blob) {
        file.release();
        throw new Error(
          "native stream fell back to a whole-file blob; the native provider serves stream URLs only",
        );
      }
      let released = false;
      return {
        release: () => {
          if (released) return;
          released = true;
          file.release();
        },
        url: file.url,
      };
    },
  };
  return provider;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

/** Redacts a share URL and its encryption-key fragment from resolver errors. */
function sanitizeResolverError(error: unknown, src: string): unknown {
  if (!isSiaShareUrl(src)) return error;

  const message = errorMessage(error)
    .replaceAll(src, src.slice(0, src.indexOf("#")))
    .replace(SHARE_KEY_FRAGMENT, "#[redacted]");
  if (message === errorMessage(error)) return error;
  return new SiaNativeStreamResolutionError(message);
}
