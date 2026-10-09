/**
 * Native stream backend for forced service-worker playback; it turns provider streams into media-element URLs without creating a dedicated worker.
 */

import {
  type SiaNativeStream,
  type SiaNativeStreamProvider,
  SiaNativeStreamUnavailableError,
} from "./native-stream-provider.ts";

export interface ServiceWorkerBackendHooks {
  onSourceAttached?(url: string): void;
}

export interface ServiceWorkerLoadOptions {
  mimeType?: string;
  name?: string;
}

export interface ServiceWorkerStreamTarget {
  src: string;
}

export class ServiceWorkerBackend {
  #controller: AbortController | null = null;
  #destroyed = false;
  #generation = 0;
  readonly #hooks: ServiceWorkerBackendHooks;
  readonly #provider: SiaNativeStreamProvider;
  #stream: null | SiaNativeStream = null;
  #target: null | ServiceWorkerStreamTarget = null;

  constructor(
    provider: SiaNativeStreamProvider,
    hooks: ServiceWorkerBackendHooks = {},
  ) {
    this.#provider = provider;
    this.#hooks = hooks;
  }

  attach(target: ServiceWorkerStreamTarget): void {
    this.#target = target;
  }

  destroy(): void {
    if (this.#destroyed) return;
    this.#destroyed = true;
    this.detach();
  }

  detach(): void {
    this.#cancelCurrentLoad();
    this.#target = null;
  }

  load(src: string, options: ServiceWorkerLoadOptions = {}): Promise<void> {
    if (this.#destroyed)
      return Promise.reject(new ServiceWorkerLoadAbortedError());
    if (!this.#target)
      return Promise.reject(
        new ServiceWorkerLoadError("no media element is attached"),
      );

    this.#cancelCurrentLoad();
    const generation = this.#generation;
    const controller = new AbortController();
    this.#controller = controller;

    return this.#acquire(src, options, controller.signal).then(
      (stream) => {
        if (generation !== this.#generation) {
          stream.release();
          throw new ServiceWorkerLoadAbortedError();
        }
        this.#stream = stream;
        this.#controller = null;
        if (this.#target) this.#target.src = stream.url;
        this.#hooks.onSourceAttached?.(stream.url);
      },
      (err: unknown) => {
        if (generation !== this.#generation)
          throw new ServiceWorkerLoadAbortedError();
        throw classifyLoadError(err);
      },
    );
  }

  async #acquire(
    src: string,
    options: ServiceWorkerLoadOptions,
    signal: AbortSignal,
  ): Promise<SiaNativeStream> {
    if (signal.aborted) throw new ServiceWorkerLoadAbortedError();
    try {
      const available = await this.#provider.available(signal);
      if (!available) throw new SiaNativeStreamUnavailableError();
      return await this.#provider.open(src, {
        mimeType: options.mimeType,
        name: options.name,
        signal,
      });
    } catch (err) {
      if (err instanceof SiaNativeStreamUnavailableError) throw err;
      throw classifyLoadError(err);
    }
  }

  #cancelCurrentLoad(): void {
    this.#generation += 1;
    this.#controller?.abort();
    this.#controller = null;
    if (this.#stream) {
      const stream = this.#stream;
      this.#stream = null;
      stream.release();
      if (this.#target) this.#target.src = "";
    }
  }
}

export class ServiceWorkerLoadAbortedError extends Error {
  constructor() {
    super("service-worker native load was aborted");
    this.name = "ServiceWorkerLoadAbortedError";
  }
}

export class ServiceWorkerLoadError extends Error {
  constructor(
    message = "service-worker native load failed",
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "ServiceWorkerLoadError";
  }
}

function classifyLoadError(err: unknown): Error {
  if (err instanceof ServiceWorkerLoadAbortedError) return err;
  if (err instanceof ServiceWorkerLoadError) return err;
  if (err instanceof SiaNativeStreamUnavailableError) return err;
  if (err instanceof Error && err.name === "AbortError")
    return new ServiceWorkerLoadAbortedError();
  return new ServiceWorkerLoadError("native stream acquisition failed", {
    cause: err,
  });
}
