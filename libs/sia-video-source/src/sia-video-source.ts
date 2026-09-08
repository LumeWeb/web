/**
 * Main-thread host element for Sia video playback, implementing the video.js
 * v10 media contract (`MediaEngineHost` + `MediaErrorCapability`) the same way
 * the packaged `HlsJsMedia` / `ShakaMedia` classes do: extend
 * `HTMLVideoElementHost`, own one engine, report fatal failures through the
 * `error` getter and `error` events, and drop the stored error on the next
 * load (announced with an `emptied` event).
 *
 * The playback engine is a dedicated worker (`@lumeweb/sia-video-source/worker`)
 * that owns byte fetching, container probing, remuxing, and — where the
 * browser allows it (Chromium, Safari 18+) — `MediaSource` itself, transferring
 * its `MediaSourceHandle` so this host only has to set `video.srcObject`.
 * Where MSE cannot run in a worker (Firefox), the worker transfers parsed
 * fMP4 bytes as `CHUNK` messages and the host appends them into its own
 * main-thread `MediaSource` via an object URL.
 *
 * Lifecycle: `attach` is idempotent across element swaps (React StrictMode
 * remounts included). Every `ATTACH_OK` is followed by a fresh `SOURCE` for
 * the current `src`, and only the acknowledgement of the newest load may
 * change request state, so a detach/reattach cycle rebuilds a coherent
 * pipeline instead of appending into an orphaned one.
 */

import { type AppKeySeedProvider, encryptToWorker, scrub } from './app-key-handshake.ts';
import { HTMLVideoElementHost } from '@videojs/media/dom/video-host';
import { type ErrorLike, MediaError, type MediaPreloadType } from '@videojs/media';
import { mediaErrorEvent, mediaErrorFromWorkerMessage } from './errors.ts';
import {
  DEFAULT_FMP4_MIME,
  isWorkerToMainMessage,
  type MainToWorkerMessage,
  nextRequestId,
  PROTOCOL_VERSION,
  type RequestId,
  type WorkerConfig,
  type WorkerErrorCode,
  type WorkerMode,
} from './protocol.ts';

/** Default props mirrored by the React wrapper's prop-syncing hook. */
export const siaVideoDefaultProps = {
  preload: 'metadata',
  src: '',
  streamType: 'on-demand',
} as const;

export interface SiaVideoSourceOptions {
  /**
   * Builds the playback worker. Defaults to a module worker compiled from this
   * package's `./worker` subpath — resolvable as a relative URL next to this
   * module's dist output — so consuming bundlers that understand
   * `new Worker(new URL(...), { type: 'module' })` (Vite, webpack, rolldown)
   * emit it automatically. Apps with their own worker pipeline inject it here.
   */
  createWorker?: () => Worker;
  /**
   * Supplies the 32-byte Sia app-key seed for the worker handshake. The host
   * reads it only once per (re)attach, immediately after the worker's HELLO_OK
   * publishes its public key, encrypts it into an `APP_KEY` envelope under an
   * ephemeral X25519 key, and scrubs the returned buffer — the plaintext seed
   * is never stored in a field of this element, worked into React state, or
   * written to storage, because the host structurally holds only a *supplier
   * function*, never the value. The supplier must produce a fresh buffer per
   * call (the host zeroes are propagated to the returned buffer) and must not
   * also keep that buffer elsewhere in usable form.
   */
  getAppKeySeed?: AppKeySeedProvider;
  /**
   * Declared content type of the source (the `type` from the v10 source
   * contract), forwarded on every `SOURCE`. The worker uses it only when it
   * matches what it actually appends — a transport type on remuxed input is
   * remapped, never trusted.
   */
  mimeType?: string;
  /**
   * Connection metadata for the worker's default SDK factory, sent in the
   * first `HELLO`. The app-key seed itself never travels through this object —
   * it is delivered separately inside the encrypted `APP_KEY` envelope, sourced
   * from `getAppKeySeed`. Must be set before the first `attach`; changing it
   * afterwards requires `detach` + `attach` (or `destroy` + a new instance)
   * to take effect.
   */
  workerConfig?: WorkerConfig;
}

/**
 * Sia-backed video host element.
 *
 * @fires error - Playback failed in a way the engine could not recover from.
 *   Read `error` for the failure, mapped from the worker's structured report.
 * @fires progress - The worker delivered more bytes / buffered more media.
 * @fires emptied - The source was replaced or cleared and the stored error was
 *   dropped with it.
 */
export class SiaVideoSource extends HTMLVideoElementHost {
  get engine(): null | Worker {
    return this.#worker;
  }
  /**
   * The last fatal playback failure, or `null`. The engine loads
   * asynchronously, so an unplayable object fails after `src` was assigned;
   * the `error` event is when to read this. Anything the element failed on by
   * itself still reads through.
   */
  get error(): ErrorLike | null {
    return this.#error ?? super.error;
  }
  /** Declared content type for the current source; sent with every `SOURCE`. */
  get mimeType(): string | undefined {
    return this.#mimeType;
  }
  set mimeType(value: string | undefined) {
    this.#mimeType = value;
  }
  get preload(): MediaPreloadType {
    return this.#preload;
  }
  set preload(value: MediaPreloadType) {
    this.#preload = value;
  }
  /** Object key of the pinned Sia object. Assigning it (re)starts playback. */
  get src(): string {
    return this.#src;
  }
  set src(value: string) {
    if (this.#src === value) return;
    this.#src = value;

    this.#resetLoadState();

    if (!value) return;

    if (this.#worker) {
      this.#sendSource();
      return;
    }
    // Wait for attach; the stored source starts when there is an engine.
  }
  /**
   * Connection metadata the worker's default SDK factory needs. Takes effect
   * on the next (re)attach, whichever comes first. Never holds key material:
   * the seed travels only via `getAppKeySeed` + the encrypted `APP_KEY` envelope.
   */
  get workerConfig(): undefined | WorkerConfig {
    return this.#workerConfig;
  }
  set workerConfig(value: undefined | WorkerConfig) {
    this.#workerConfig = value;
  }
  #appendQueue: Uint8Array[] = [];
  #destroyed = false;

  #error: MediaError | null = null;
  // Main-thread MSE fallback state (Firefox and other `main`-mode sessions).
  #mediaSource: MediaSource | null = null;
  #mimeType: string | undefined;
  #mode: null | WorkerMode = null;
  #objectUrl: null | string = null;

  readonly #options: SiaVideoSourceOptions;

  #pending: MainToWorkerMessage[] = [];

  #preload: MediaPreloadType = siaVideoDefaultProps.preload;

  #ready = false;

  #requestId: null | RequestId = null;

  #sourceBuffer: null | SourceBuffer = null;

  #src = '';

  #worker: null | Worker = null;

  #workerConfig: undefined | WorkerConfig;

  // Worker's raw X25519 handshake public key from the newest HELLO_OK. Public
  // key material only — harmless to retain; the seed this encrypts to is not.
  #workerPublicKey: null | Uint8Array = null;

  constructor(options: SiaVideoSourceOptions = {}) {
    super();
    this.#options = options;
    this.#workerConfig = options.workerConfig;
    this.#mimeType = options.mimeType;
  }

  /**
   * Spawns (or reconnects) the playback worker and wires message plumbing.
   * Safe across repeat attaches: every attach (re)negotiates the session —
   * HELLO delivers the current `workerConfig` so a re-attach picks up config
   * changes — and the resulting ATTACH_OK replays the current source into the
   * new element.
   */
  attach(target: HTMLVideoElement): void {
    // A destroyed host keeps no engine and can never replay a source; a
    // late attach call (e.g. a stale React effect) must not re-spawn the
    // worker into a zombie MediaEngineHost.
    if (this.#destroyed) return;
    super.attach(target);
    target.addEventListener('seeking', this.#onSeeking);
    target.addEventListener('play', this.#onPlay);

    if (this.#worker) {
      this.#post({ config: this.#workerConfig, requestId: nextRequestId(), type: 'HELLO' });
      return;
    }

    try {
      this.#worker = (this.#options.createWorker ?? defaultCreateWorker)();
    } catch (error) {
      this.#worker = null;
      this.#reportError('network', errorDescription(error));
      return;
    }

    this.#worker.addEventListener('message', this.#onMessage);
    // HELLO negotiates readiness itself, so it must not go through the
    // pending-message gate — that gate only opens on HELLO_OK.
    this.#post({ config: this.#workerConfig, requestId: nextRequestId(), type: 'HELLO' });
  }

  /**
   * Always `''`: this element's viability depends on bytes (container + codec)
   * a MIME string cannot vouch for by itself, so support is only claimed by
   * the programmatic engine, never pre-declared per-type.
   */
  override canPlayType(type: string): '' {
    void type;
    return '';
  }

  destroy(): void {
    this.#destroyed = true;
    this.#send({ type: 'DESTROY' });
    const worker = this.#worker;
    this.#worker = null;

    if (worker) {
      worker.removeEventListener('message', this.#onMessage);
      worker.terminate();
    }

    this.#teardownMainThreadMse();
    super.destroy();
  }

  detach(): void {
    this.target?.removeEventListener('seeking', this.#onSeeking);
    this.target?.removeEventListener('play', this.#onPlay);
    this.#send({ type: 'DETACH' });
    super.detach();
  }
  /** Reloads the current source through the engine, clearing any stored error. */
  override load(): void {
    if (this.#src && this.#worker) {
      this.#resetLoadState();
      this.#sendSource();
      return;
    }
    void super.load();
  }

  #addMainSourceBuffer(mediaSource: MediaSource, mime: string): void {
    if (mediaSource.readyState !== 'open') return;
    try {
      const sourceBuffer = mediaSource.addSourceBuffer(mime);
      sourceBuffer.addEventListener('updateend', () => this.#drainMainAppendQueue());
      this.#sourceBuffer = sourceBuffer;
      this.#drainMainAppendQueue();
    } catch (error) {
      this.#reportError('decode', errorDescription(error));
    }
  }

  #appendChunk(bytes: Uint8Array): void {
    if (!this.#mode || this.#mode !== 'main') {
      this.dispatchEvent(new Event('progress'));
      return;
    }
    this.#appendQueue.push(bytes);
    this.#drainMainAppendQueue();
  }

  #beginMainThreadMse(mime: string): void {
    const target = this.target;
    if (!target || this.#mediaSource) return;

    // Unsupported codec-qualified MIME fails as "unsupported source" here —
    // where it belongs — instead of surfacing later as an `addSourceBuffer`
    // decode error. Bare container MIMEs are not decisive (see the worker's
    // mirror comment), so they fall through to the concrete attempt.
    if (typeof MediaSource !== 'undefined' && mime.includes('codecs=') && !MediaSource.isTypeSupported(mime)) {
      this.#reportError('unsupported', `MIME: ${mime}`);
      return;
    }

    const mediaSource = new MediaSource();
    this.#mediaSource = mediaSource;

    if (mediaSource.readyState === 'open') {
      this.#addMainSourceBuffer(mediaSource, mime);
    } else {
      mediaSource.addEventListener('sourceopen', () => this.#addMainSourceBuffer(mediaSource, mime), {
        once: true,
      });
    }

    const objectUrl = URL.createObjectURL(mediaSource);
    this.#objectUrl = objectUrl;
    target.src = objectUrl;
  }

  #drainMainAppendQueue(): void {
    const sourceBuffer = this.#sourceBuffer;
    if (!sourceBuffer || sourceBuffer.updating || this.#appendQueue.length === 0) return;
    const bytes = this.#appendQueue.shift()!;
    try {
      sourceBuffer.appendBuffer(bytes as unknown as BufferSource);
    } catch (error) {
      this.#reportError('decode', errorDescription(error));
    }
  }

  // The plaintext seed exists in this method's scope only: read from the
  // supplier, encrypted into the envelope, then scrubbed before the promise
  // chain unwinds. It is never assigned to any field, never cloned into
  // React state, and never closed over beyond this method — the wire and the
  // host's retained state hold only the ciphertext.
  async #encryptAndSendSeed(
    getAppKeySeed: AppKeySeedProvider,
    workerPublicKey: Uint8Array,
  ): Promise<void> {
    let seed: Uint8Array | undefined;
    try {
      seed = await Promise.resolve(getAppKeySeed());
      const envelope = await encryptToWorker(workerPublicKey, seed);
      // POSTed directly, outside #send's pending gate: the seed supplier has
      // been consumed at this point, so a future re-attach re-reads it anyway.
      this.#post({ envelope, requestId: nextRequestId(), type: 'APP_KEY' });
    } catch (error) {
      this.#reportError('network', errorDescription(error));
    } finally {
      // The supplier's buffer is consumed either way — release whatever bytes
      // made it out of the login flow before the reference dies.
      if (seed) scrub(seed);
    }
  }

  #flushPending(): void {
    const pending = this.#pending;
    this.#pending = [];
    for (const message of pending) this.#post(message);
  }

  #onMessage = (event: MessageEvent) => {
    // Foreign or malformed payloads (another library's worker, a draft
    // protocol version) must never reach the state-machine handlers as casts.
    if (!isWorkerToMainMessage(event.data)) return;
    const message = event.data;
    switch (message.type) {
      case 'ATTACH_OK':
        this.#mode = message.mode;
        // Every attach generation plays the current source from scratch: the
        // fresh SOURCE rebuilds worker-side or host-side MSE cleanly, no
        // matter what a previous detach tore down.
        if (this.#src) {
          this.#resetLoadState();
          this.#sendSource();
        }
        return;
      case 'CHUNK':
        if (message.requestId === this.#requestId) this.#appendChunk(message.bytes);
        return;
      case 'ERROR':
        // After a clear (`src = ''`) there is no active load, so a late
        // request-scoped ERROR (an abandoned probe still failing) must die
        // with its request instead of surfacing on the emptied element. Only
        // errors matching the active load — or inherently global ones (no
        // request id) — stand.
        if (message.requestId !== null) {
          if (this.#requestId === null || message.requestId !== this.#requestId) return;
        }
        this.#reportError(message.kind, message.context);
        return;
      case 'HANDLE': {
        if (message.requestId !== this.#requestId) return;
        const target = this.target as HTMLVideoElement | null;
        if (target) (target as unknown as { srcObject: unknown }).srcObject = message.handle;
        return;
      }
      case 'HELLO_OK':
        // A worker speaking a different protocol version is incompatible, no
        // matter how much of the message flow happens to match.
        if (message.version !== PROTOCOL_VERSION) {
          this.#reportError('unsupported', `worker protocol ${message.version}`);
          return;
        }
        this.#ready = true;
        // The worker's handshake public key is not secret — only enough to
        // address the APP_KEY envelope to this worker instance. It is
        // re-published with every HELLO_OK, so a re-attach re-handshakes with
        // the key of the worker actually speaking now.
        this.#workerPublicKey = message.publicKey;
        this.#sendAppKeyEnvelope();
        this.#post({ requestId: nextRequestId(), type: 'ATTACH' });
        this.#flushPending();
        return;
      case 'PROGRESS':
        if (message.requestId === this.#requestId) this.dispatchEvent(new Event('progress'));
        return;
      case 'SOURCE_OK':
        // Only the newest load may drive the pipeline; a late acknowledgement
        // of a superseded SOURCE would downgrade the request id and let stale
        // chunks into the current append pipeline.
        if (message.requestId !== this.#requestId) return;
        if (message.info.mode === 'main') {
          this.#beginMainThreadMse(message.info.mime || DEFAULT_FMP4_MIME);
        }
        return;
      default:
        return;
    }
  };

  #onPlay = (event: Event) => {
    const target = this.target;
    if (!target || event.target !== target) return;
    // Deferred playback start (preload 'metadata'/'none'): first play (or a
    // user seek) triggers streaming.
    this.#send({ requestId: this.#requestId ?? nextRequestId(), type: 'PLAY' });
  };

  // ---- Main-thread MSE fallback (Firefox and friends) ----

  #onSeeking = (event: Event) => {
    const target = this.target;
    if (!target || event.target !== target) return;
    this.#send({
      requestId: this.#requestId ?? nextRequestId(),
      time: target.currentTime,
      type: 'SEEK',
    });
  };

  #post(message: MainToWorkerMessage): void {
    if (!this.#worker) return;
    this.#worker.postMessage(message);
    if (message.type === 'SOURCE') this.#requestId = message.requestId;
  }

  #reportError(kind: WorkerErrorCode, context?: string): void {
    if (this.#destroyed) return;
    const error = mediaErrorFromWorkerMessage({ context, kind });
    this.#error = error;
    this.dispatchEvent(mediaErrorEvent(error));
  }

  // Drops pipeline state attached to the previously played source and
  // announces the load boundary with the native `emptied` event.
  #resetLoadState(): void {
    this.#error = null;
    this.#requestId = null;

    // Main-thread fallback state belongs to the old load; a fresh SOURCE_OK
    // rebuilds it.
    if (this.#objectUrl) {
      URL.revokeObjectURL(this.#objectUrl);
      this.#objectUrl = null;
    }
    this.#mediaSource = null;
    this.#sourceBuffer = null;
    this.#appendQueue = [];
    this.dispatchEvent(new Event('emptied'));
  }

  #send(message: MainToWorkerMessage): void {
    if (!this.#worker) return;
    if (!this.#ready) {
      this.#pending.push(message);
      return;
    }
    this.#post(message);
  }

  // Kicks off the encrypted app-key handoff after every HELLO_OK. No-op when
  // the app injected its own SDK factory (no seed supplier) or the worker has
  // not yet published a handshake key.
  #sendAppKeyEnvelope(): void {
    const getAppKeySeed = this.#options.getAppKeySeed;
    const workerPublicKey = this.#workerPublicKey;
    if (!getAppKeySeed || !workerPublicKey) return;
    void this.#encryptAndSendSeed(getAppKeySeed, workerPublicKey);
  }

  #sendSource(): void {
    this.#post({
      // An empty preload reads as "no signal", so the worker is left at its
      // own deferring default rather than promising eager streaming.
      mimeType: this.#mimeType,
      preload: this.#preload || undefined,
      requestId: nextRequestId(),
      src: this.#src,
      type: 'SOURCE',
    });
  }

  #teardownMainThreadMse(): void {
    if (this.#objectUrl) {
      URL.revokeObjectURL(this.#objectUrl);
      this.#objectUrl = null;
    }
    this.#mediaSource = null;
    this.#sourceBuffer = null;
    this.#appendQueue = [];
  }
}

/**
 * Default engine spawn: a module worker from this package's `worker` subpath,
 * resolved relative to this module's compiled output. Consuming bundlers that
 * rewrite `new Worker(new URL(...))` emit the worker for
 * the app's own deploy targets automatically.
 */
function defaultCreateWorker(): Worker {
  return new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
}

function errorDescription(error: unknown): string {
  if (error instanceof Error) return error.message.slice(0, 240);
  return String(error).slice(0, 240);
}
