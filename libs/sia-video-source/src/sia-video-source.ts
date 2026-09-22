/**
 * Main-thread host element for Sia video playback, implementing the video.js
 * v10 media contract (`MediaEngineHost` + `MediaErrorCapability`) the same way
 * the packaged `HlsJsMedia` / `ShakaMedia` classes do: extend
 * `HTMLVideoElementHost`, own one engine, report fatal failures through the
 * `error` getter and `error` events, and drop the stored error on the next
 * load (announced with an `emptied` event).
 *
 * The playback engine is a dedicated worker (`@lumeweb/sia-video-source/worker`)
 * that owns byte fetching, converts the media with mediabunny to fragmented
 * MP4, and — where the browser allows it (Chromium, Safari 18+) — `MediaSource`
 * itself, transferring its `MediaSourceHandle` so this host only has to set
 * `video.srcObject`. Where MSE cannot run in a worker (Firefox), the worker
 * transfers the converted fMP4 bytes as `CHUNK` messages and the host appends
 * them into its own main-thread `MediaSource` via an object URL.
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
import { createConsoleLogger, type LogFields, type Logger, type LogLevelFilter } from './log/logger.ts';
import { MseAppendPipe } from './mse-pipe.ts';
import {
  DEFAULT_FMP4_MIME,
  isWorkerToMainMessage,
  type MainToWorkerMessage,
  MainToWorkerMessageType,
  nextRequestId,
  PROTOCOL_VERSION,
  type RequestId,
  type WorkerConfig,
  workerErrorCode,
  type WorkerErrorCode,
  workerLogLevel,
  type WorkerLogLevel,
  workerMode,
  type WorkerMode,
  type WorkerMsePreference,
  WorkerToMainMessageType,
} from './protocol.ts';

/** Default props mirrored by the React wrapper's prop-syncing hook. */
const MSE_BACK_BUFFER_SECONDS = 30;

/**
 * Automatic reloads the host performs after a decode-class `ERROR` on the
 * active load before it gives up and surfaces the MediaError normally. Bounded
 * so a genuinely broken source cannot spin the worker forever.
 */
const MAX_DECODE_RELOADS = 2;

/**
 * Friendly names for the host→worker messages that carry a request identity,
 * used by the per-post `request` debug line (DESTROY/DETACH have none).
 * HELLO reads as `set-log`: that is the one post that tunes the worker's
 * forwarding threshold.
 */
type RequestAction = 'app-key' | 'attach' | 'play' | 'playhead' | 'seek' | 'set-log' | 'source';

const REQUEST_ACTION_BY_TYPE: Readonly<Partial<Record<MainToWorkerMessageType, RequestAction>>> = {
  [MainToWorkerMessageType.APP_KEY]: 'app-key',
  [MainToWorkerMessageType.ATTACH]: 'attach',
  [MainToWorkerMessageType.HELLO]: 'set-log',
  [MainToWorkerMessageType.PLAY]: 'play',
  [MainToWorkerMessageType.PLAYHEAD]: 'playhead',
  [MainToWorkerMessageType.SEEK]: 'seek',
  [MainToWorkerMessageType.SOURCE]: 'source',
};

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
   * Supplies the 32-byte Sia sharing-key seed for the keyless handshake
   * (ADR 0008). The host treats it exactly like the app-key seed: read once
   * per (re)attach immediately after `HELLO_OK`, encapsulated into an
   * `APP_KEY` envelope tagged `keyType: 'sharing'` under an ephemeral X25519
   * key, then scrubbed — the plaintext never lives in a field, React state,
   * or storage, only in the login flow's reference and the supplier closure.
   *
   * When present, the worker's default SDK factory connects via
   * `SharedSdk.connect(indexerUrl, seed)` and routes share-URL sources
   * through `SharedSdk.object(objectKey)`, so a share link streams without an
   * app key or any SSO/approval. When both `getSharingKeySeed` and
   * `getAppKeySeed` are supplied, the worker creates BOTH SDKs and routes by
   * source kind — pinned object keys resolve through the app-key SDK, share
   * URLs through the sharing-key SDK. A share-URL `src` still works with only
   * `getAppKeySeed` (fallback to `Sdk.objectFromShareUrl`). Each `HELLO`
   * declares which providers exist (`appSeed`/`sharingSeed` presence
   * metadata), so the worker scrubs a seed slot whose provider was removed.
   */
  getSharingKeySeed?: AppKeySeedProvider;
  /**
   * The ONLY logging hook for this host. Defaults to `createConsoleLogger()`
   * so developers get out-of-the-box visibility (`'debug'` in non-production
   * builds, `'warn'` in production); pass `nullLogger` to mute the library.
   * The library never logs credential seeds, decrypted key material, or
   * share-URL strings (they embed decryption keys); worker events are scalar
   * milestone facts only, forwarded on `logger.child('worker')`.
   */
  logger?: Logger;
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
   *
   * A share-URL `src` still needs it: a share link grants decryption, and the
   * account/key connection funds the actual host downloads. The signed
   * metadata fetch itself targets the indexer host embedded in the share URL,
   * so no separate object identity is required for shared sources.
   */
  workerConfig?: WorkerConfig;
  /**
   * Host-side worker-MSE preference, forwarded on every `HELLO` so the worker
   * selects the main-thread fallback (`'main'`) or runtime feature-detection
   * (`'auto'`) for this session. `'main'` keeps CHUNK posting even on
   * runtimes that can construct MSE in a dedicated worker — useful for
   * policy, diagnostics, or Firefox parity — while the worker still decides
   * authoritatively and `ATTACH_OK.mode` is always honored. Defaults to
   * `'auto'` (the field is simply not forwarded).
   */
  workerMse?: WorkerMsePreference;
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
  /**
   * Per-render setter form of the `getAppKeySeed` option, so wrappers that
   * re-apply props on every render (the React media sync) can update the
   * supplier on a persistent media instance without going through options.
   * The host reads whatever supplier is current at each (re)attach's
   * HELLO_OK — only the supplier function is stored, never seed bytes.
   */
  set getAppKeySeed(value: AppKeySeedProvider | undefined) {
    this.#appKeySeedProvider = value;
  }
  /**
   * Per-render setter form of the `getSharingKeySeed` option, mirroring
   * `getAppKeySeed` for the keyless path (ADR 0008): only the supplier
   * function is stored, never seed bytes. The host reads whichever supplier
   * is current at each (re)attach's HELLO_OK and sends it inside an
   * `APP_KEY` envelope tagged `keyType: 'sharing'`.
   */
  set getSharingKeySeed(value: AppKeySeedProvider | undefined) {
    this.#sharingKeySeedProvider = value;
  }
  /**
   * The host's diagnostics hook: worker milestone `LOG` events are forwarded
   * on `logger.child('worker')`, and `logger.level` drives the worker's HELLO
   * `log` forwarding threshold on the next (re)attach. Defaults to
   * `createConsoleLogger()`; swap in `nullLogger` to mute the library.
   */
  get logger(): Logger {
    return this.#logger;
  }
  /**
   * Per-render setter form of the `logger` option, mirroring the
   * `getAppKeySeed` setter pattern: stores only the logger reference (never
   * any derived state — the worker's threshold and each forward re-derive
   * from the live `.level`), so wrappers can swap the sink on a persistent
   * media instance without going through options. Absent (`undefined`) resets
   * to the documented `createConsoleLogger()` default, exactly as the
   * constructor seeds the field and as `mimeType` clears on an omitted prop.
   */
  set logger(value: Logger | undefined) {
    this.#logger = value ?? createConsoleLogger();
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
  /**
   * Object locator — either the hex object key of a Sia object pinned under
   * the configured indexer account, or a full Sia share URL
   * (`/objects/<key>/shared#encryption_key=…`, optionally `sia://`-prefixed)
   * that identifies the object and carries its decryption key. Assigning it
   * (re)starts playback.
   */
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
  /**
   * Worker-MSE preference for the session, forwarded on every `HELLO` (when
   * explicitly set). Takes effect on the next (re)attach, whichever comes
   * first; the worker always remains the authoritative mode decision via
   * `ATTACH_OK`/`HELLO_OK`.
   */
  get workerMse(): undefined | WorkerMsePreference {
    return this.#workerMse;
  }
  set workerMse(value: undefined | WorkerMsePreference) {
    this.#workerMse = value;
  }
  // Shared MSE append pipe (main-thread fallback only). Centralizes the
  // append-queue serialization, back-buffer eviction and end-of-stream deferral
  // so the main-thread MSE path and the worker-side MSE pipeline exercise one
  // pipe implementation. Created at `SOURCE_OK`(main) pipeline setup and
  // aborted on teardown/load reset; `null` in worker mode.
  #appendPipe: MseAppendPipe | null = null;

  // Seed suppliers from the `getAppKeySeed`/`getSharingKeySeed` options or the
  // per-render setters. Holding only the functions keeps seed bytes out of
  // host state.
  #appKeySeedProvider: AppKeySeedProvider | undefined;

  #destroyed = false;
  #error: MediaError | null = null;
  // Most recent playhead the host forwarded via PLAYHEAD; decode-error
  // recovery repositions the reloaded load here. Starts at 0 until the first
  // timeupdate.
  #lastPlayheadSeconds = 0;
  // Main-thread MSE fallback state (Firefox and other `main`-mode sessions).
  #logger: Logger;
  #mediaSource: MediaSource | null = null;
  #mimeType: string | undefined;
  #mode: null | WorkerMode = null;

  #objectUrl: null | string = null;

  readonly #options: SiaVideoSourceOptions;

  #pending: MainToWorkerMessage[] = [];

  // Current user playback intent, tracked from native events: a `play` sets
  // it, a `pause` clears it. Sticky across attaches only while unbroken — the
  // worker resets its own playback bookkeeping on every ATTACH, so the host
  // re-states a surviving intent for each replayed source — but a deliberate
  // pause supersedes an earlier play, so a re-attach never resumes what the
  // user stopped.
  #playRequested = false;

  #preload: MediaPreloadType = siaVideoDefaultProps.preload;

  #ready = false;

  // Automatic reloads already spent recovering from decode-class errors on the
  // current load (see `#recoverFromDecodeError`). Reset to a full budget by a
  // fresh src assignment / load / ATTACH_OK replay and by a SOURCE_OK for the
  // current request; a decode error surfaces instead once it is exhausted.
  #reloadsThisLoad = 0;

  #requestId: null | RequestId = null;

  #sharingKeySeedProvider: AppKeySeedProvider | undefined;

  #sourceBuffer: null | SourceBuffer = null;

  #src = '';

  #worker: null | Worker = null;

  #workerConfig: undefined | WorkerConfig;

  #workerMse: undefined | WorkerMsePreference;

  // Worker's raw X25519 handshake public key from the newest HELLO_OK. Public
  // key material only — harmless to retain; the seed this encrypts to is not.
  #workerPublicKey: null | Uint8Array = null;

  constructor(options: SiaVideoSourceOptions = {}) {
    super();
    this.#options = options;
    this.#appKeySeedProvider = options.getAppKeySeed;
    this.#sharingKeySeedProvider = options.getSharingKeySeed;
    this.#workerConfig = options.workerConfig;
    this.#logger = options.logger ?? createConsoleLogger();
    this.#mimeType = options.mimeType;
    this.#workerMse = options.workerMse;
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
    target.addEventListener('timeupdate', this.#onTimeUpdate);
    target.addEventListener('play', this.#onPlay);
    target.addEventListener('pause', this.#onPause);

    if (this.#worker) {
      this.#post(this.#helloMessage());
      return;
    }

    try {
      this.#worker = (this.#options.createWorker ?? defaultCreateWorker)();
    } catch (error) {
      this.#worker = null;
      this.#logger.child('host').error('worker.spawn-failed', { message: errorDescription(error) });
      this.#reportError(workerErrorCode.network, errorDescription(error));
      return;
    }

    this.#worker.addEventListener('error', this.#onWorkerError);
    this.#worker.addEventListener('messageerror', this.#onWorkerMessageError);
    this.#worker.addEventListener('message', this.#onMessage);
    // HELLO negotiates readiness itself, so it must not go through the
    // pending-message buffer — that buffer only drains on HELLO_OK.
    this.#post(this.#helloMessage());
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
    this.#send({ type: MainToWorkerMessageType.DESTROY });
    const worker = this.#worker;
    this.#worker = null;

    if (worker) {
      worker.removeEventListener('message', this.#onMessage);
      worker.removeEventListener('error', this.#onWorkerError);
      worker.removeEventListener('messageerror', this.#onWorkerMessageError);
      worker.terminate();
    }

    this.#teardownMainThreadMse();
    // A destroyed host keeps no pipeline to recover or resume, so recovery
    // state dies with it.
    this.#reloadsThisLoad = 0;
    this.#lastPlayheadSeconds = 0;
    super.destroy();
  }

  detach(): void {
    this.target?.removeEventListener('seeking', this.#onSeeking);
    this.target?.removeEventListener('timeupdate', this.#onTimeUpdate);
    this.target?.removeEventListener('play', this.#onPlay);
    this.target?.removeEventListener('pause', this.#onPause);
    this.#send({ type: MainToWorkerMessageType.DETACH });
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

  #addMainSourceBuffer(mediaSource: MediaSource, mime: string, durationSeconds: null | number): void {
    if (mediaSource.readyState !== 'open') return;
    try {
      if (durationSeconds !== null) mediaSource.duration = durationSeconds;
      const sourceBuffer = mediaSource.addSourceBuffer(mime);
      // The pipe waits on `updateend` internally; the kick here (and on the
      // event) only re-runs the pump for state the option getters observe —
      // above all the SourceBuffer appearing after bytes were already queued.
      sourceBuffer.addEventListener('updateend', () => this.#appendPipe?.kick());
      this.#sourceBuffer = sourceBuffer;
      this.#appendPipe?.kick();
      // The main-thread SourceBuffer opened (mirror of the worker's
      // `session.mse-open`): scalar MIME + duration facts only.
      this.#logger.child('host').info(
        'mse-open',
        durationSeconds === null ? { mime } : { durationSeconds, mime },
      );
    } catch (error) {
      // The MIME the host applied was refused — name it, then report decode as
      // before (mirror of the worker's `session.mse-open-failed`).
      this.#logger.child('host').error('mse-open-failed', { mime });
      this.#reportError(workerErrorCode.decode, errorDescription(error));
    }
  }

  #appendChunk(bytes: Uint8Array): void {
    if (!this.#mode || this.#mode !== workerMode.main) {
      this.dispatchEvent(new Event('progress'));
      return;
    }
    this.#appendPipe?.append(bytes);
  }

  #beginMainThreadMse(mime: string, durationSeconds: null | number): void {
    // Each load's main-thread pipeline owns one shared append pipe. The
    // getters read the live host state so the pipe serializes appends into
    // whatever SourceBuffer the (possibly still-opening) MediaSource yields,
    // and it reports fatal append failures through the load's error path.
    // Sia-specific layers feeding it bytes — CHUNK delivery, the object-URL
    // plumbing — are unchanged.
    this.#appendPipe = new MseAppendPipe({
      backBufferSeconds: MSE_BACK_BUFFER_SECONDS,
      getMediaSource: () => this.#mediaSource,
      getPlayheadSeconds: () => this.target?.currentTime ?? 0,
      getSourceBuffer: () => this.#sourceBuffer,
      onError: (error) => this.#reportError(workerErrorCode.decode, errorDescription(error)),
    });
    const target = this.target;
    if (!target || this.#mediaSource) return;

    // Unsupported codec-qualified MIME fails as "unsupported source" here —
    // where it belongs — instead of surfacing later as an `addSourceBuffer`
    // decode error. Bare container MIMEs are not decisive (see the worker's
    // mirror comment), so they fall through to the concrete attempt.
    if (typeof MediaSource !== 'undefined' && mime.includes('codecs=') && !MediaSource.isTypeSupported(mime)) {
      this.#reportError(workerErrorCode.unsupported, `MIME: ${mime}`);
      return;
    }

    const mediaSource = new MediaSource();
    this.#mediaSource = mediaSource;

    if (mediaSource.readyState === 'open') {
      this.#addMainSourceBuffer(mediaSource, mime, durationSeconds);
    } else {
      mediaSource.addEventListener('sourceopen', () => this.#addMainSourceBuffer(mediaSource, mime, durationSeconds), {
        once: true,
      });
    }

    const objectUrl = URL.createObjectURL(mediaSource);
    this.#objectUrl = objectUrl;
    target.src = objectUrl;
  }

  async #encryptAndSendSeed(
    getSeed: AppKeySeedProvider,
    workerPublicKey: Uint8Array,
    keyType: 'app' | 'sharing',
  ): Promise<void> {
    let seed: Uint8Array | undefined;
    try {
      seed = await Promise.resolve(getSeed());
      // The keyType tag rides the envelope itself (see `AppKeyEnvelope`), so
      // the APP_KEY wire message shape is unchanged — no new message type.
      const envelope = await encryptToWorker(workerPublicKey, seed, keyType);
      // POSTed directly, outside #send's pending buffer: the seed supplier has
      // been consumed at this point, so a future re-attach re-reads it anyway.
      this.#post({ envelope, requestId: nextRequestId(), type: MainToWorkerMessageType.APP_KEY });
    } catch (error) {
      this.#reportError(workerErrorCode.network, errorDescription(error));
    } finally {
      // The supplier's buffer is consumed either way — release whatever bytes
      // made it out of the login flow before the reference dies.
      if (seed) scrub(seed);
    }
  }

  // The plaintext seeds exist only inside this method's scope: read from the
  // supplier, encapsulated into their envelopes, then scrubbed before the
  // promise chain unwinds. They are never assigned to fields, never cloned
  // into React state, and never closed over beyond this method — the wire and
  // the host's state hold only ciphertext (plus the plaintext `keyType` tag).
  // The app-key envelope is sent first, then the sharing-key envelope; the
  // worker stores each into its own slot, so no ordering dependency exists.
  async #encryptAndSendSeeds(workerPublicKey: Uint8Array): Promise<void> {
    if (this.#appKeySeedProvider) {
      await this.#encryptAndSendSeed(this.#appKeySeedProvider, workerPublicKey, 'app');
    }
    if (this.#sharingKeySeedProvider) {
      await this.#encryptAndSendSeed(this.#sharingKeySeedProvider, workerPublicKey, 'sharing');
    }
  }

  #evictMainBuffer(): void {
    // Fire-and-forget: the pipe serializes the removal through `flushBuffer`
    // and runs it on a quiesced SourceBuffer (see `mse-pipe.ts`).
    void this.#appendPipe?.evictBackBuffer();
  }

  #flushPending(): void {
    const pending = this.#pending;
    this.#pending = [];
    for (const message of pending) this.#post(message);
  }

  // HELLO config: the connection metadata plus the host's worker-MSE
  // preference. The preference is only forwarded when the app explicitly set
  // it (default `'auto'` leaves the wire payload byte-identical to before),
  // and only alongside a workerConfig it can ride on — the worker still owns
  // the authoritative mode decision and the main-thread fallback is always
  // honored via ATTACH_OK.
  #helloConfig(): undefined | WorkerConfig {
    const config = this.#workerConfig;
    if (!config || this.#workerMse === undefined) return config;
    return { ...config, workerMse: this.#workerMse };
  }

  // The HELLO wire message: connection config plus additive seed-presence
  // flags declaring which seed providers exist this attach (`appSeed` /
  // `sharingSeed` — booleans only, never the seeds themselves, which still
  // travel exclusively inside encrypted APP_KEY envelopes). A provider the
  // app removed between attaches is declared `false`, so the worker scrubs a
  // seed slot it previously held even though the config re-attached unchanged.
  // The `log` forwarding threshold rides along too, mapped from the host
  // logger's level (see `logThresholdFor`); a silent host omits the field, so
  // the HELLO payload stays byte-identical to the pre-logging wire shape.
  #helloMessage(): MainToWorkerMessage {
    const log = logThresholdFor(this.#logger.level);
    // Presence facts and connection metadata only: seeds and keys never
    // appear, and the configured indexer URL is not a share URL.
    this.#logger.info('hello', {
      hasAppKeySeed: this.#appKeySeedProvider !== undefined,
      hasSharingSeed: this.#sharingKeySeedProvider !== undefined,
      indexerUrl: this.#workerConfig?.indexerUrl,
      protocol: PROTOCOL_VERSION,
      threshold: log ?? 'silent',
      workerMse: this.#workerMse,
    });
    return {
      appSeed: this.#appKeySeedProvider !== undefined,
      config: this.#helloConfig(),
      requestId: nextRequestId(),
      sharingSeed: this.#sharingKeySeedProvider !== undefined,
      type: MainToWorkerMessageType.HELLO,
      ...(log === undefined ? {} : { log }),
    };
  }

  // One debug line per posted request that carries an identity, at the single
  // postMessage choke point, so every outbound host→worker message is
  // attributable. DESTROY/DETACH have no request id and are skipped.
  #logRequest(message: MainToWorkerMessage): void {
    if (!('requestId' in message)) return;
    const action = REQUEST_ACTION_BY_TYPE[message.type];
    if (action !== undefined) {
      this.#logger.debug('request', { action, requestId: message.requestId });
    }
  }

  #onMessage = (event: MessageEvent) => {
    // Foreign or malformed payloads (another library's worker, a draft
    // protocol version) must never reach the state-machine handlers as casts.
    if (!isWorkerToMainMessage(event.data)) return;
    const message = event.data;
    switch (message.type) {
      case WorkerToMainMessageType.ATTACH_OK:
        this.#mode = message.mode;
        // The worker accepted our HELLO; `version` is the protocol we spoke,
        // `mode` is the MSE construction site the worker picked for the session.
        this.#logger.info('hello-ok', { mode: message.mode, version: PROTOCOL_VERSION });
        // Every attach generation plays the current source from scratch: the
        // fresh SOURCE rebuilds worker-side or host-side MSE cleanly, no
        // matter what a previous detach tore down. The worker's attach path
        // resets its own play/seek bookkeeping, so the play intent the user
        // expressed before (or while) the source was queued must be re-stated
        // for the replayed load — otherwise a deferred-family preload starts
        // the load but never streams, stalling the element at byte 0.
        if (this.#src) {
          const target = this.target as HTMLVideoElement | null;
          // Only an unpaused element, or an intent no pause superseded, may
          // resume: a user who paused before the re-attach stays paused.
          const shouldPlay = target !== null && (!target.paused || this.#playRequested);
          this.#resetLoadState();
          this.#sendSource();
          if (shouldPlay) {
            // Aimed at the fresh SOURCE's request id, so the worker honors it
            // when that load completes (SEEK/PLAY are already request-scoped;
            // this one must be too or a later load could mis-read it).
            this.#send({ requestId: this.#requestId ?? nextRequestId(), type: MainToWorkerMessageType.PLAY });
          }
        }
        return;
      case WorkerToMainMessageType.CHUNK:
        if (message.requestId === this.#requestId) this.#appendChunk(message.bytes);
        return;
      case WorkerToMainMessageType.ENDED:
        // Only the current load may end this MediaSource; a late ENDED from a
        // superseded load must die with its request. The worker itself ends
        // worker-mode MediaSources, so only the main-thread fallback acts here.
        // And a load that already errored is never ended as if it were clean —
        // endOfStream on a failed pipeline would mask the failure. `#error` is
        // cleared at every load boundary, so its presence here means *this*
        // load reported an error.
        if (message.requestId !== this.#requestId) return;
        if (this.#mode !== workerMode.main) return;
        if (this.#error) return;
        // The pipe deals endOfStream only after the append queue drains and
        // the SourceBuffer quiesces (see `mse-pipe.ts`).
        this.#appendPipe?.requestEndOfStream();
        return;
      case WorkerToMainMessageType.ERROR:
        // After a clear (`src = ''`) there is no active load, so a late
        // request-scoped ERROR (an abandoned load still failing) must die
        // with its request instead of surfacing on the emptied element. Only
        // errors matching the active load — or inherently global ones (no
        // request id) — stand.
        if (message.requestId !== null) {
          if (this.#requestId === null || message.requestId !== this.#requestId) return;
        }
        // A decode-class failure on the active load is the one kind worth
        // retrying (worker MSE and the main-thread fallback both stall the
        // same way): the pipeline tearing down underneath the element leaves a
        // dead worker MediaSource / dead srcObject, so the browser sits in
        // HAVE_CURRENT_DATA forever with no signal this side can react to.
        // Restart the load — fresh SOURCE → SEEK to the last playhead → PLAY —
        // a bounded number of times, then surface the error normally. Any
        // other kind, and any decode error past the budget, stays fatal.
        if (message.kind === workerErrorCode.decode && this.#src && this.#reloadsThisLoad < MAX_DECODE_RELOADS) {
          this.#recoverFromDecodeError();
          return;
        }
        // A decode-class failure that exhausted its reload budget is a genuine
        // fatal error now — note the exhaustion, then surface it as before.
        if (message.kind === workerErrorCode.decode && this.#src) {
          this.#logger.child('host').error('decode-recovery.exhausted', {
            attempt: MAX_DECODE_RELOADS,
            requestId: this.#requestId,
          });
        }
        this.#reportError(message.kind, message.context);
        return;
      case WorkerToMainMessageType.HANDLE: {
        if (message.requestId !== this.#requestId) return;
        const target = this.target as HTMLVideoElement | null;
        if (target) (target as unknown as { srcObject: unknown }).srcObject = message.handle;
        return;
      }
      case WorkerToMainMessageType.HELLO_OK:
        // A worker speaking a different protocol version is incompatible, no
        // matter how much of the message flow happens to match.
        if (message.version !== PROTOCOL_VERSION) {
          this.#logger.warn('hello-ok.protocol-mismatch', {
            expectedVersion: PROTOCOL_VERSION,
            gotVersion: message.version,
          });
          this.#reportError(workerErrorCode.unsupported, `worker protocol ${message.version}`);
          return;
        }
        this.#ready = true;
        // The worker's handshake public key is not secret — only enough to
        // address the APP_KEY envelopes to this worker instance. It is
        // re-published with every HELLO_OK, so a re-attach re-handshakes with
        // the key of the worker actually speaking now.
        this.#workerPublicKey = message.publicKey;
        if ((this.#appKeySeedProvider || this.#sharingKeySeedProvider) && this.#workerPublicKey) {
          // #encryptAndSendSeeds only postMessages the APP_KEY envelopes after
          // awaiting the seed suppliers and the worker-key encryption, so
          // posting ATTACH (and any queued SOURCE) synchronously here would
          // reach the FIFO worker before the envelopes — the first load would
          // then fail #ensureSdk with "No Sia SDK is available". Chain the
          // ATTACH + flush on the envelope posts instead. That promise cannot
          // reject: supplier/encryption failures are already reported as
          // network errors inside #encryptAndSendSeed, so the session still
          // proceeds and SOURCE fails the same way it would without a seed.
          void this.#encryptAndSendSeeds(this.#workerPublicKey).then(() => {
            this.#post({ requestId: nextRequestId(), type: MainToWorkerMessageType.ATTACH });
            this.#flushPending();
          });
          return;
        }
        // Injected-SDK path: no APP_KEY envelope is ever exchanged, so
        // ATTACH + the pending flush go straight out — there is nothing to
        // order them behind, and they must not wait on an async chain that
        // does not exist for this configuration.
        this.#post({ requestId: nextRequestId(), type: MainToWorkerMessageType.ATTACH });
        this.#flushPending();
        return;
      case WorkerToMainMessageType.LOG:
        // Worker milestone facts only (the protocol's `detail` is scalar-only
        // and never carries key material); forwarded onto the host logger's
        // `worker` scope. Unknown severities are dropped silently inside.
        forwardWorkerLog(this.#logger, message);
        return;
      case WorkerToMainMessageType.PROGRESS:
        if (message.requestId === this.#requestId) this.dispatchEvent(new Event('progress'));
        return;
      case WorkerToMainMessageType.SOURCE_OK:
        // Only the newest load may drive the pipeline; a late acknowledgement
        // of a superseded SOURCE would downgrade the request id and let stale
        // chunks into the current append pipeline.
        if (message.requestId !== this.#requestId) return;
        // A clean acknowledgement proves this load made it, so its recovery
        // budget restarts: a later decode error gets a fresh run of reloads
        // instead of surfacing at once. A reload still in flight means this
        // SOURCE_OK is the recovered load succeeding.
        if (this.#reloadsThisLoad > 0) {
          this.#logger.child('host').info('decode-recovery.done', { attempt: this.#reloadsThisLoad });
        }
        this.#reloadsThisLoad = 0;
        if (message.info.mode === workerMode.main) {
          this.#beginMainThreadMse(
            message.info.mime || DEFAULT_FMP4_MIME,
            message.info.durationSeconds,
          );
        }
        return;
      default:
        return;
    }
  };

  #onPause = (event: Event) => {
    const target = this.target;
    if (!target || event.target !== target) return;
    // A deliberate pause supersedes earlier play intent: once the user stops,
    // a re-attach must not resume the stopped playback. The next native `play`
    // re-asserts the intent, so clearing here loses nothing live.
    this.#playRequested = false;
  };

  #onPlay = (event: Event) => {
    const target = this.target;
    if (!target || event.target !== target) return;
    // Play intent is sticky: an attach that rebuilds the pipeline must not
    // lose it (the worker resets its own playback bookkeeping on ATTACH).
    this.#playRequested = true;
    // Deferred playback start (preload 'metadata'/'none'): first play (or a
    // user seek) triggers streaming.
    this.#send({ requestId: this.#requestId ?? nextRequestId(), type: MainToWorkerMessageType.PLAY });
  };

  // ---- Main-thread MSE fallback (Firefox and friends) ----

  #onSeeking = (event: Event) => {
    const target = this.target;
    if (!target || event.target !== target) return;
    // A seek supersedes the current position: drop chunks still queued for it
    // and (once quiesced) reset the SourceBuffer's segment parser so the
    // worker's fresh fragment parses clean instead of continuing the tail the
    // seek cut off mid-fragment (Chromium's RunSegmentParserLoop failure).
    // The reset carries the target so the main-owned buffer is re-anchored to
    // the sought position (the trimmed output's timestamps rebase to zero).
    this.#appendPipe?.reset(target.currentTime);
    this.#send({
      requestId: this.#requestId ?? nextRequestId(),
      time: target.currentTime,
      type: MainToWorkerMessageType.SEEK,
    });
  };

  #onTimeUpdate = (event: Event) => {
    const target = this.target;
    if (!target || event.target !== target) return;
    // Keep the newest position the host forwarded: decode-error recovery
    // seeks the reloaded source back here.
    this.#lastPlayheadSeconds = target.currentTime;
    this.#evictMainBuffer();
    this.#send({
      requestId: this.#requestId ?? nextRequestId(),
      time: target.currentTime,
      type: MainToWorkerMessageType.PLAYHEAD,
    });
  };

  // A worker isolate crash or top-level error never arrives as a protocol
  // message, so it is surfaced only here — logged, never thrown; the worker
  // is left for the existing teardown paths to reap.
  #onWorkerError = (event: ErrorEvent): void => {
    const reason = event.error instanceof Error ? event.error.message : undefined;
    this.#logger.child('host').error('worker.error', {
      message: event.message || 'error',
      reason,
    });
  };

  // A postMessage round-trip failure (a structured-clone error) has no payload
  // of its own; the event name is the only identity there is.
  #onWorkerMessageError = (): void => {
    this.#logger.child('host').error('worker.error', { message: 'messageerror' });
  };

  #post(message: MainToWorkerMessage): void {
    if (!this.#worker) return;
    this.#worker.postMessage(message);
    if (message.type === MainToWorkerMessageType.SOURCE) this.#requestId = message.requestId;
    this.#logRequest(message);
  }

  // Bounded recovery from a decode-class ERROR delivered on the ACTIVE load
  // (see the ERROR handler in #onMessage for the failure mode it covers: the
  // worker's MediaSource died under the element, so the browser stalls forever
  // in HAVE_CURRENT_DATA with no error this side could otherwise react to).
  // Restart the whole load — a fresh SOURCE (new request id) torn down like
  // any new load, then SEEK back to the last playhead the host forwarded and
  // PLAY — and only retry a bounded number of times so a genuinely broken
  // source still surfaces its decode error instead of reloading forever.
  #recoverFromDecodeError(): void {
    const target = this.target as HTMLVideoElement | null;
    const attempt = this.#reloadsThisLoad + 1;
    // Capture what the reload must restore BEFORE `#resetLoadState` wipes it:
    // the resume position (the newest playhead the host forwarded) and whether
    // the load carries play intent (element playing, or a `play` the user
    // asked for — the reset clears both).
    const resumeSeconds = this.#lastPlayheadSeconds;
    const shouldPlay = target === null ? false : !target.paused || this.#playRequested;
    this.#logger.child('host').warn('decode error on active load — reloading', {
      attempt,
      play: shouldPlay,
      requestId: this.#requestId,
      resumeSeconds,
    });
    // The reload runs the same teardown a new src/load() performs, which also
    // zeroes the recovery budget — restore the old count including this one.
    this.#resetLoadState();
    this.#reloadsThisLoad = attempt;
    // The reset also cleared the captured watch position, but the stalled
    // element emits no further timeupdate to re-record it — keep the position
    // for later recoveries of this same load.
    this.#lastPlayheadSeconds = resumeSeconds;
    this.#sendSource();
    const requestId = this.#requestId ?? nextRequestId();
    // The fresh source is re-anchored at the position the user was watching —
    // position 0 for a source the host never played yet — and only resumed
    // when that load actually carried play intent. A paused element stays
    // paused: the recovery repairs the load, it does not start playback the
    // user never asked for.
    this.#send({ requestId, time: resumeSeconds, type: MainToWorkerMessageType.SEEK });
    if (shouldPlay) {
      this.#send({ requestId, type: MainToWorkerMessageType.PLAY });
    }
  }

  #reportError(kind: WorkerErrorCode, context?: string): void {
    if (this.#destroyed) return;
    // An errored pipeline is never ended: the pipe refuses end-of-stream once
    // it has failed, and the ENDED handler refuses on `#error` — either way a
    // failure is never masked by a clean end. `#error` is cleared at every
    // load boundary, so its presence here means *this* load reported an error.
    const error = mediaErrorFromWorkerMessage({ context, kind });
    this.#error = error;
    this.dispatchEvent(mediaErrorEvent(error));
  }

  // Drops pipeline state attached to the previously played source and
  // announces the load boundary with the native `emptied` event.
  #resetLoadState(): void {
    this.#error = null;
    // Any automatic decode-error reloads belonged to the old load; a fresh
    // source, load(), or ATTACH_OK replay starts with a full recovery budget.
    this.#reloadsThisLoad = 0;
    // Position memory belongs to the old source too: a fresh load starts at 0
    // and must never seek back to the previous playhead on its own recovery.
    this.#lastPlayheadSeconds = 0;
    // A new/explicit load has no playback intent yet: the element's next
    // native `play` re-asserts it. (The ATTACH_OK path re-captures intent
    // before this reset, so a rebuilt pipeline still resumes.)
    this.#playRequested = false;
    this.#requestId = null;

    // Main-thread fallback state belongs to the old load; a fresh SOURCE_OK
    // rebuilds it. The old load's pipe is permanently stopped and nulled —
    // nothing queued may drain into the next load's SourceBuffer.
    if (this.#objectUrl) {
      URL.revokeObjectURL(this.#objectUrl);
      this.#objectUrl = null;
    }
    this.#appendPipe?.abort();
    this.#appendPipe = null;
    this.#mediaSource = null;
    this.#sourceBuffer = null;
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

  #sendSource(): void {
    this.#post({
      // An empty preload reads as "no signal", so the worker is left at its
      // own deferring default rather than promising eager streaming.
      mimeType: this.#mimeType,
      preload: this.#preload || undefined,
      requestId: nextRequestId(),
      src: this.#src,
      type: MainToWorkerMessageType.SOURCE,
    });
  }

  #teardownMainThreadMse(): void {
    // Permanently stop the shared pipe: the whole MediaSource is being
    // discarded, so nothing further may append, evict, or end through it.
    this.#appendPipe?.abort();
    this.#appendPipe = null;
    if (this.#objectUrl) {
      URL.revokeObjectURL(this.#objectUrl);
      this.#objectUrl = null;
    }
    this.#mediaSource = null;
    this.#sourceBuffer = null;
  }
}

/**
 * Forwards one worker `LOG` event onto `logger.child('worker')` as a scalar
 * milestone line: `'worker <name>'` with the event's (scalar-only) `detail`
 * spread in alongside its owning `requestId` — the wire member the `#onMessage`
 * switch narrows to. Severities the wire does not know (a foreign or draft
 * worker) are dropped via the default — never thrown, never echoed as garbage —
 * and a `nullLogger` sink is already a no-op, so nothing else guards needed.
 * Field spreading (never the original `detail` object) keeps host-side sink
 * behavior from mutating the worker's payload.
 */
export function forwardWorkerLog(
  logger: Logger,
  message: Readonly<{
    detail?: Readonly<Record<string, unknown>>;
    level: WorkerLogLevel;
    name: string;
    requestId: null | RequestId;
    type: WorkerToMainMessageType.LOG;
  }>,
): void {
  const sink = logger.child('worker');
  const fields: LogFields = { ...message.detail, requestId: message.requestId };
  switch (message.level) {
    case workerLogLevel.debug:
      sink.debug(`worker ${message.name}`, fields);
      return;
    case workerLogLevel.error:
      sink.error(`worker ${message.name}`, fields);
      return;
    case workerLogLevel.info:
      sink.info(`worker ${message.name}`, fields);
      return;
    case workerLogLevel.warn:
      sink.warn(`worker ${message.name}`, fields);
      return;
    default:
      return;
  }
}

// Maps the host logger's console level to the HELLO `log` wire threshold.
// WHY these buckets: the wire deliberately carries only the four severities
// `debug`/`info`/`warn`/`error` (see `workerLogLevel` — trace is excluded to
// keep the worker-to-main channel cheap). Trace/debug mean "forward everything
// the wire can carry" (full wire). Info means "lifecycle milestones only": the
// worker posts its info-level events (attach, sdk.built, object.resolved,
// stream.*) but skips the debug-level per-read `bytes.read` / `read.window-*`
// milestones — the default console logger at 'info' would swallow those anyway,
// so keeping them off the wire avoids pointless traffic. Warn/error raise the
// worker's bar to match the console filter; 'silent' opts the host out of
// worker LOG entirely by omitting the field (absent = the worker posts
// nothing), keeping the wire payload byte-identical to before for a muted host.
export function logThresholdFor(level: LogLevelFilter): undefined | WorkerLogLevel {
  switch (level) {
    case 'debug':
      return workerLogLevel.debug;
    case 'error':
      return workerLogLevel.error;
    case 'info':
      return workerLogLevel.info;
    case 'silent':
      return undefined;
    case 'trace':
      return workerLogLevel.debug;
    case 'warn':
      return workerLogLevel.warn;
    default:
      // Unknown/future level: omit the threshold rather than leak debug traffic.
      return undefined;
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
