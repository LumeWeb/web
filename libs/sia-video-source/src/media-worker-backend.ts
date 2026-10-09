/**
 * Owns media-worker transport and main-thread media resources for one host.
 * The backend queues outbound protocol messages until the host marks the worker
 * session ready, drops PLAYHEAD messages while queued, and clears the queue at
 * session boundaries. It also owns MediaSource and SourceBuffer setup,
 * object-URL attachment, append-pipe lifecycle, and worker listener lifecycle.
 * SiaVideoSource retains protocol construction, request correlation, inbound
 * message interpretation, and callbacks that update host state.
 */

import { type HTMLVideoTargetLike } from "@videojs/media/dom/video-host";
import {
  constructMseMediaSource,
  type MseImplementation,
  type MseRuntimeHost,
  prepareMediaElementForMse,
} from "./capabilities/mse-runtime.ts";
import { type Logger } from "./log/logger.ts";
import { MseAppendPipe } from "./mse-pipe.ts";
import {
  type MainToWorkerMessage,
  MainToWorkerMessageType,
  workerLogEventName,
  workerMode,
  type WorkerMode,
} from "./protocol.ts";

/* The backend methods intentionally follow pipeline lifecycle order, not alphabetical order. */
/* oxlint-disable perfectionist/sort-interfaces, perfectionist/sort-classes */

const MSE_BACK_BUFFER_SECONDS = 30;

export interface MediaWorkerAppendPipeOptions {
  getMediaSource(): MediaSource | null;
  getPlayheadSeconds(): number;
  getSourceBuffer(): null | SourceBuffer;
}

/**
 * Callbacks for effects the host performs when the backend sets up a
 * SourceBuffer. The backend keeps the SourceBuffer and append-pipe state;
 * the host uses these callbacks to append chunks, report progress, and handle
 * decode failures.
 */
export interface MediaWorkerBackendGlue {
  /** A main-mode CHUNK: the host appends the bytes to its append pipe. */
  onChunkAppend?(bytes: Uint8Array): void;
  /** A worker-mode (or unknown-mode) CHUNK: the host dispatches `progress`. */
  onChunkProgress?(bytes?: number): void;
  /** `addSourceBuffer` threw (the MIME was refused): escalate as a decode failure. */
  onDecodeFailure(error: unknown): void;
  /** Reports the freshly created SourceBuffer to the host after the backend stores it. */
  onSourceBuffer(sourceBuffer: SourceBuffer): void;
  /**
   * A SourceBuffer `updateend` (or the just-attached buffer): re-run the
   * append pipe's pump, then re-report the main-thread buffered state.
   */
  onSourceBufferUpdated(): void;
}

/**
 * Host state accessors for the load-boundary MSE reset. The backend owns the
 * operation ordering; the host retains ownership of the fields themselves.
 */
export interface MediaWorkerBackendMseState {
  /** @deprecated compatibility for callers that supplied an external pipe before the current API. */
  getAppendPipe?(): MseAppendPipe | null;
  /** @deprecated compatibility for callers that supplied an external pipe before the current API. */
  setAppendPipe?(appendPipe: MseAppendPipe | null): void;
  /** @deprecated compatibility for callers that supplied MSE state before backend ownership. */
  getObjectUrl?(): null | string;
  /** @deprecated compatibility for callers that supplied MSE state before backend ownership. */
  setMediaSource?(mediaSource: MediaSource | null): void;
  /** @deprecated compatibility for callers that supplied MSE state before backend ownership. */
  setObjectUrl?(objectUrl: null | string): void;
  /** @deprecated compatibility for callers that supplied MSE state before backend ownership. */
  setSourceBuffer?(sourceBuffer: null | SourceBuffer): void;
}

export interface MediaWorkerBackendOptions extends MediaWorkerBackendGlue {
  /** Worker factory; creation and event listener ownership stay in the backend. */
  createWorker?: () => Worker;
  onMessage?: (event: MessageEvent) => void;
  onError?: (event: ErrorEvent) => void;
  onMessageError?: (event: MessageEvent) => void;
  /** The host logger scope the backend logs under (`host` in the host). */
  logger: Logger;
}

export class MediaWorkerBackend {
  readonly #glue: MediaWorkerBackendGlue;
  readonly #createWorker: (() => Worker) | undefined;
  readonly #onError: (event: ErrorEvent) => void;
  readonly #onMessage: (event: MessageEvent) => void;
  readonly #onMessageError: (event: MessageEvent) => void;
  #appendPipe: MseAppendPipe | null = null;
  #failed = false;
  readonly #log: Logger;
  #mediaSource: MediaSource | null = null;
  #objectUrl: null | string = null;
  #sourceBuffer: null | SourceBuffer = null;

  #worker: null | Worker = null;
  // Handshake transport state belongs to the backend: the host decides which
  // protocol messages are meaningful, while this backend owns the not-ready
  // window and its buffered outbound traffic.
  #ready = false;
  #pending: MainToWorkerMessage[] = [];

  constructor(options: MediaWorkerBackendOptions) {
    this.#glue = options;
    this.#createWorker = options.createWorker;
    this.#onError = options.onError ?? (() => undefined);
    this.#onMessage = options.onMessage ?? (() => undefined);
    this.#onMessageError = options.onMessageError ?? (() => undefined);
    this.#log = options.logger;
  }

  /** Creates the dedicated worker and owns all lifecycle listener wiring. */
  spawn(): Worker {
    if (this.#worker) return this.#worker;
    if (!this.#createWorker)
      throw new Error("media worker factory is not configured");
    const worker = this.#createWorker();
    worker.addEventListener("error", this.#onError);
    worker.addEventListener("messageerror", this.#onMessageError);
    worker.addEventListener("message", this.#onMessage);
    this.#worker = worker;
    return worker;
  }

  get worker(): null | Worker {
    return this.#worker;
  }

  /** Posts protocol traffic without exposing the Worker to the host. */
  post(message: MainToWorkerMessage): void {
    this.#worker?.postMessage(message);
  }

  /**
   * Sends host intent through the handshake gate. The host remains responsible
   * for constructing and interpreting protocol messages; this backend owns the
   * transport choice (post now, or retain the intent until the session is
   * ready). PLAYHEAD is deliberately dropped by `buffer`, preserving the
   * high-frequency update semantics of the existing host.
   */
  send(message: MainToWorkerMessage): boolean {
    if (!this.#worker) return false;
    if (!this.#ready) {
      this.buffer(message);
      return false;
    }
    this.post(message);
    return true;
  }

  /** Whether host-originated traffic may pass the handshake gate. */
  get ready(): boolean {
    return this.#ready;
  }

  /** Buffers host intent during a handshake, preserving PLAYHEAD drop semantics. */
  buffer(message: MainToWorkerMessage): void {
    if (message.type === MainToWorkerMessageType.PLAYHEAD) return;
    this.#pending.push(message);
  }

  /** Opens the session and returns the buffered traffic for host interpretation. */
  markReady(): MainToWorkerMessage[] {
    this.#ready = true;
    const pending = this.#pending;
    this.#pending = [];
    return pending;
  }

  /** Closes the session gate and discards traffic from the superseded session. */
  resetQueue(): void {
    this.#ready = false;
    this.#pending = [];
  }

  /** Removes listeners and terminates the owned worker. */
  terminate(): void {
    const worker = this.#worker;
    if (!worker) return;
    worker.removeEventListener("message", this.#onMessage);
    worker.removeEventListener("error", this.#onError);
    worker.removeEventListener("messageerror", this.#onMessageError);
    this.#worker = null;
    worker.terminate();
  }

  /**
   * Attaches a host-constructed `MediaSource` to the video element over a
   * fresh object URL. It creates the blob URL, runs element-side MSE prep
   * (managed runtimes need `disableRemotePlayback = true` before attachment
   * or `sourceopen` never fires), assigns the URL to `target.src`, and keeps
   * the URL for backend teardown. The URL is also returned to the caller.
   * The steps run in this order: createObjectURL, element prep, `src`
   * assignment.
   */
  attachObjectUrl(
    mediaSource: MediaSource,
    target: HTMLVideoTargetLike,
    impl: MseImplementation,
  ): string {
    const objectUrl = URL.createObjectURL(mediaSource);
    prepareMediaElementForMse(target, impl, (name) => this.#log.debug(name));
    target.src = objectUrl;
    this.#objectUrl = objectUrl;
    return objectUrl;
  }

  /**
   * Sets up the main-thread SourceBuffer for a load whose `MediaSource` is
   * open: writes the load's `durationSeconds` (when the worker vouched for
   * one), creates exactly one SourceBuffer for the load's codec-qualified
   * MIME, wires its `updateend` to the host's pipe kick / buffered-state
   * report, stores the buffer on the host, and logs `mse-open`. A
   * not-yet-open `MediaSource` is left alone; a MIME the `MediaSource`
   * refuses is named in `mse-open-failed` and escalated as a decode failure,
   * The host receives callbacks for state updates and error reporting.
   */
  attachSourceBuffer(
    mediaSource: MediaSource,
    mime: string,
    durationSeconds: null | number,
  ): void {
    if (mediaSource.readyState !== "open") return;
    try {
      if (durationSeconds !== null) mediaSource.duration = durationSeconds;
      const sourceBuffer = mediaSource.addSourceBuffer(mime);
      // The pipe waits on `updateend` internally; the kick here (and on the
      // event) only re-runs the pump for state the option getters observe —
      // above all the SourceBuffer appearing after bytes were already queued.
      sourceBuffer.addEventListener("updateend", () =>
        this.#glue.onSourceBufferUpdated(),
      );
      this.#sourceBuffer = sourceBuffer;
      this.#glue.onSourceBuffer(sourceBuffer);
      this.#glue.onSourceBufferUpdated();
      // The main-thread SourceBuffer opened (counterpart of the worker's
      // `session.mse-open`): scalar MIME + duration facts only.
      this.#log.info(
        "mse-open",
        durationSeconds === null ? { mime } : { durationSeconds, mime },
      );
    } catch (error) {
      // The MIME the host applied was refused — name it, then report decode as
      // before (counterpart of the worker's `session.mse-open-failed`).
      this.#log.error("mse-open-failed", { mime });
      this.#fail(error);
    }
  }

  /**
   * Constructs and retains the load's main-thread `MediaSource` through the
   * runtime's MSE surface. When it is already `open`, SourceBuffer setup runs
   * immediately; otherwise a once `sourceopen` listener runs setup when the
   * object-URL attachment opens it. The constructed `MediaSource` is returned
   * to the caller for attachment, while the backend retains it for its pipe
   * and teardown operations.
   */
  beginMse(
    mime: string,
    durationSeconds: null | number,
    runtime: MseRuntimeHost = globalThis,
  ): MediaSource {
    const mediaSource = constructMseMediaSource(runtime);
    this.#mediaSource = mediaSource;
    if (mediaSource.readyState === "open") {
      this.attachSourceBuffer(mediaSource, mime, durationSeconds);
    } else {
      mediaSource.addEventListener(
        "sourceopen",
        () => this.attachSourceBuffer(mediaSource, mime, durationSeconds),
        { once: true },
      );
    }
    return mediaSource;
  }

  /**
   * Creates the load's main-thread append pipe once. Repeated setup signals
   * return the live pipe so queued bytes cannot be orphaned by replacement.
   * Append/cancel routing and teardown remain backend-owned.
   */
  createAppendPipe(options: MediaWorkerAppendPipeOptions): MseAppendPipe {
    if (this.#appendPipe) return this.#appendPipe;
    this.#appendPipe = new MseAppendPipe({
      backBufferSeconds: MSE_BACK_BUFFER_SECONDS,
      getMediaSource: () => this.#mediaSource,
      getPlayheadSeconds: () => options.getPlayheadSeconds(),
      getSourceBuffer: () => this.#sourceBuffer,
      onDiag: (name, detail) => {
        if (name === workerLogEventName.mseEvict) this.#log.debug(name, detail);
        else this.#log.warn(name, detail);
      },
      onError: (error) => this.#fail(error),
    });
    return this.#appendPipe;
  }

  get mediaSource(): MediaSource | null {
    return this.#mediaSource;
  }

  get objectUrl(): null | string {
    return this.#objectUrl;
  }

  get sourceBuffer(): null | SourceBuffer {
    return this.#sourceBuffer;
  }

  /** Appends a main-mode worker chunk to the backend-owned pipe. */
  appendChunk(bytes: Uint8Array): void {
    this.#appendPipe?.append(bytes);
  }

  /** Re-runs the backend-owned pipe pump after SourceBuffer activity. */
  kickAppendPipe(): void {
    this.#appendPipe?.kick();
  }

  /** Current queued byte count for the host's buffered-state report. */
  get pendingBytes(): number {
    return this.#appendPipe?.pendingBytes ?? 0;
  }

  evictBackBuffer(): void {
    void this.#appendPipe?.evictBackBuffer();
  }

  resetAppendPipe(seconds: number): void {
    this.#appendPipe?.reset(seconds);
  }

  markFailed(): void {
    this.#failed = true;
  }

  requestEndOfStream(): void {
    if (this.#failed) return;
    this.#appendPipe?.requestEndOfStream();
  }

  #fail(error: unknown): void {
    this.#failed = true;
    this.#glue.onDecodeFailure(error);
  }

  /**
   * Tears down the main-thread MSE pipeline when the host is destroyed. Keep
   * the historical destroy ordering: abort the append pipe before revoking the
   * object URL, then clear every host-owned reference.
   */
  destroyMainThreadMse(state: MediaWorkerBackendMseState = {}): void {
    const appendPipe = this.#appendPipe ?? state.getAppendPipe?.() ?? null;
    appendPipe?.abort();
    this.#appendPipe = null;
    this.#failed = false;
    state.setAppendPipe?.(null);
    const objectUrl = this.#objectUrl ?? state.getObjectUrl?.() ?? null;
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      this.#objectUrl = null;
      state.setObjectUrl?.(null);
    }
    this.#mediaSource = null;
    this.#sourceBuffer = null;
    // Keep old state adapters harmless during the bounded migration.
    state.setMediaSource?.(null);
    state.setSourceBuffer?.(null);
  }

  /**
   * Resets the load's main-thread MSE pipeline in the exact load-reset order:
   * revoke object URL, abort the append pipe, then clear the pipe, MediaSource,
   * and SourceBuffer references.
   */
  resetMainThreadMse(state: MediaWorkerBackendMseState = {}): void {
    const objectUrl = this.#objectUrl ?? state.getObjectUrl?.() ?? null;
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      this.#objectUrl = null;
      state.setObjectUrl?.(null);
    }
    const appendPipe = this.#appendPipe ?? state.getAppendPipe?.() ?? null;
    appendPipe?.abort();
    this.#appendPipe = null;
    this.#failed = false;
    state.setAppendPipe?.(null);
    this.#mediaSource = null;
    this.#sourceBuffer = null;
    state.setMediaSource?.(null);
    state.setSourceBuffer?.(null);
  }

  /**
   * Chooses the main-thread CHUNK append route: a chunk
   * arriving for a main-mode load is handed to the host's append pipe
   * (`onChunkAppend`); a worker-mode chunk — or one whose mode is not yet
   * known — is a progress tick the host dispatches (`onChunkProgress`) and is
   * never appended. The backend owns the append pipe (storage, lifecycle,
   * teardown), while the host retains the `progress` dispatch; the backend only decides which of
   * the two host effects a chunk triggers, exactly as the existing
   * `SiaVideoSource#appendChunk` guard did.
   */
  routeChunk(mode: null | WorkerMode, bytes: Uint8Array): void {
    if (!mode || mode !== workerMode.main) {
      this.#glue.onChunkProgress?.(bytes.byteLength);
      return;
    }
    this.#glue.onChunkAppend?.(bytes);
  }
}
