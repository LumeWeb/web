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
 *
 * The budget is per user-initiated arming, NOT per worker session: the counter
 * is only restored when a recovery reload demonstrably plays (the playhead
 * advances again, or the load ends cleanly). A recovered load that re-opens
 * (`SOURCE_OK`) and then fails again is the SAME broken object consuming the
 * same attempts — a naive reset on every `SOURCE_OK` reverts to attempt=1
 * forever (the observed ~2.6s infinite reload loop).
 */
const MAX_DECODE_RELOADS = 2;

/**
 * Tolerated overshoot past the worker-vouched duration before a seek is
 * treated as external: the reported duration can trail the real object by a
 * tick, so a seek exactly at the end must not be treated as unreachable.
 */
const SEEK_DURATION_TOLERANCE_SECONDS = 0.25;

/**
 * Bounded host-side source restarts for a seek that lands outside the
 * playable window (or that stalls unresolved past the stall timeout). Once
 * exhausted the host surfaces a decode-class error and force-clears the stuck
 * `seeking` state instead of hanging in HAVE_METADATA forever.
 */
const MAX_EXTERNAL_SEEK_RESTARTS = 2;

/**
 * How long an unresolved seek may hold the element in `seeking` before the
 * host assumes it will never resolve (the target is unreachable) and restarts
 * the source re-anchored there. Slow-but-real remote reads re-anchor with a
 * fresh attempt; only repeated failures surface an error.
 */
const SEEK_STALL_TIMEOUT_MS = 6000;

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
  // Duration the worker vouched for the active load (`SOURCE_OK.info`), used
  // to judge whether a seek target can ever be satisfied. Nulled at every load
  // boundary until the next SOURCE_OK.
  #durationSeconds: null | number = null;
  // True once the active load reached end-of-stream (worker `ENDED` or a real
  // native `ended`); nothing past the delivered buffer will ever arrive, so an
  // out-of-window seek there is provably unreachable.
  #endedReached = false;
  #error: MediaError | null = null;
  // Out-of-window seek restarts already spent on the current load (see
  // `#recoverFromOutOfWindowSeek`). Restored by a completed restart seek or by
  // a fresh src / load / ATTACH_OK replay, exactly like the decode budget.
  #externalSeeksThisLoad = 0;
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

  // Element re-anchor a recovery (decode reload / external-seek restart) wants
  // applied once the FRESH resource actually attaches. Setting `currentTime`
  // immediately after `#sendSource()` runs while the element still holds the
  // OLD (dead) resource — readyState ≥ HAVE_METADATA — so per spec it is a
  // plain seek on a tombstoned pipeline, NOT a HAVE_NOTHING default-playback
  // position, and the replacement resource resets the playhead to 0. Deferred
  // to the HANDLE / object-URL attach point (readyState is HAVE_NOTHING for
  // the fresh resource there), where the write parks the new load at the
  // target instead of stranding it at 0 with the worker buffering elsewhere.
  #pendingReanchorSeconds: null | number = null;

  // Current user playback intent, tracked from native events: a `play` sets
  // it, a `pause` clears it. Sticky across attaches only while unbroken — the
  // worker resets its own playback bookkeeping on every ATTACH, so the host
  // re-states a surviving intent for each replayed source — but a deliberate
  // pause supersedes an earlier play, so a re-attach never resumes what the
  // user stopped.
  #playRequested = false;

  #preload: MediaPreloadType = siaVideoDefaultProps.preload;

  #ready = false;

  // An engine-initiated reload/restart (decode recovery or external-seek
  // restart) is in flight. Native `pause`/`ended` observed inside this window
  // are the pipeline being replaced, not the user stopping or reaching EOF:
  // they neither clear playback intent nor latch end-state.
  #recovering = false;

  // The current load is a decode-error recovery reload. Its `SOURCE_OK` must
  // NOT restore the reload budget — a reloaded load that merely re-opens and
  // then fails again is the same broken object consuming the same attempts.
  // The budget restores only once that load actually plays (advancing playhead)
  // or ends cleanly, which keeps a persistently broken object from looping at
  // attempt=1 forever.
  #recoveryLoadInFlight = false;

  // Automatic reloads already spent recovering from decode-class errors on the
  // current load (see `#recoverFromDecodeError`). Restored to a full budget
  // only by a fresh src assignment / load / ATTACH_OK replay, by a normal
  // (non-recovery) `SOURCE_OK`, or once a recovery load actually plays — NOT
  // by a recovery load re-opening; a decode error surfaces once exhausted.
  #reloadsThisLoad = 0;

  #requestId: null | RequestId = null;

  // Watchdog for a `seeking` state that never resolves: armed on every user
  // seek, cancelled the moment `seeked` / a load boundary arrives. On fire it
  // treats the seek as stuck and restarts the source re-anchored at the target
  // (bounded), so the element never hangs in HAVE_METADATA forever.
  #seekWatchdog: null | ReturnType<typeof setTimeout> = null;

  #sharingKeySeedProvider: AppKeySeedProvider | undefined;

  #sourceBuffer: null | SourceBuffer = null;

  #src = '';

  // Host-lifetime playback intent, kept apart from the per-load `#playRequested`
  // so it survives load resets: decode-error recovery and external-seek
  // restarts must know the user was watching BEFORE the pipeline was torn
  // down, even if the engine's teardown fires an incidental native `pause`/
  // `ended` that would otherwise erase the intent. Cleared only by a deliberate
  // pause that happens outside an engine-initiated recovery window — the
  // recovery must never resume playback a genuinely-stopped user never asked
  // for twice over.
  #wasPlaying = false;

  #worker: null | Worker = null;

  // Highest buffered end the worker reported (`PROGRESS`) for the active load;
  // a seek far beyond it leaves the engine's window (see `#isOutOfWindowSeek`).
  #workerBufferEndSeconds = 0;

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
    target.addEventListener('seeked', this.#onSeeked);
    target.addEventListener('timeupdate', this.#onTimeUpdate);
    target.addEventListener('play', this.#onPlay);
    target.addEventListener('pause', this.#onPause);
    target.addEventListener('ended', this.#onEnded);

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
    // state (decode budget, seek watchdog/restart state) dies with it.
    this.#reloadsThisLoad = 0;
    this.#externalSeeksThisLoad = 0;
    this.#lastPlayheadSeconds = 0;
    this.#recovering = false;
    this.#recoveryLoadInFlight = false;
    this.#pendingReanchorSeconds = null;
    this.#cancelSeekWatchdog();
    super.destroy();
  }

  detach(): void {
    this.target?.removeEventListener('seeking', this.#onSeeking);
    this.target?.removeEventListener('seeked', this.#onSeeked);
    this.target?.removeEventListener('timeupdate', this.#onTimeUpdate);
    this.target?.removeEventListener('play', this.#onPlay);
    this.target?.removeEventListener('pause', this.#onPause);
    this.target?.removeEventListener('ended', this.#onEnded);
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

  // Applies (once) the element re-anchor a recovery parked for the fresh load,
  // then forgets it. Called at the point the replacement resource genuinely
  // attaches — the worker-MSE `HANDLE` swap and the main-MSE object-URL
  // assignment — when the element is HAVE_NOTHING for that resource, which is
  // exactly the state where a `currentTime` write parks the new load at the
  // target (the shared default-playback-start-position mechanism).
  #applyPendingReanchor(target: HTMLVideoElement | null): void {
    const reanchorSeconds = this.#pendingReanchorSeconds;
    if (reanchorSeconds === null || !target) return;
    this.#pendingReanchorSeconds = null;
    try {
      target.currentTime = reanchorSeconds;
    } catch {
      // A dead MediaSource mid-teardown can refuse the write; the recovery
      // budgets + stall watchdog still bound the failure if this never plays.
    }
  }

  // Arming/clearing for the unresolved-seek watchdog. When `seeking` is still
  // latched (no `seeked` has resolved it) past the stall interval, the seek is
  // judged stuck and recovered via `#recoverFromOutOfWindowSeek`.
  #armSeekWatchdog(): void {
    this.#cancelSeekWatchdog();
    this.#seekWatchdog = setTimeout(() => {
      this.#seekWatchdog = null;
      const target = this.target as HTMLVideoElement | null;
      if (!target || !target.seeking || this.#destroyed) return;
      this.#logger.child('host').warn('seek unresolved — recovering', {
        seekSeconds: target.currentTime,
      });
      this.#recoverFromOutOfWindowSeek(target.currentTime);
    }, SEEK_STALL_TIMEOUT_MS);
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
      // MSE-pipe diagnostics mirror the worker path's onLog forwarding onto
      // the host logger's `host` scope: the back-buffer eviction trace is
      // debug, and the rare best-effort breadcrumbs (failed eviction /
      // parser-reset / EOS — all still swallowed, just observable now) are
      // warn. Scalar detail only, and behavior is unchanged (all hooks
      // optional).
      onDiag: (name, detail) => {
        const sink = this.#logger.child('host');
        if (name === 'mse.evict') sink.debug(name, detail);
        else sink.warn(name, detail);
      },
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
    // The main-MSE replacement resource is now attached (the element is
    // HAVE_NOTHING for it); a recovery's parked re-anchor applies here, the
    // same HAVE_NOTHING park the worker-MSE path gets on HANDLE.
    this.#applyPendingReanchor(target);
  }

  #cancelSeekWatchdog(): void {
    if (this.#seekWatchdog !== null) {
      clearTimeout(this.#seekWatchdog);
      this.#seekWatchdog = null;
    }
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

  // Pauses and re-anchors an element stranded mid-`seeking` back onto buffered
  // data (or 0 when nothing is buffered) so the native `seeking` flag clears
  // and the element stops hanging in HAVE_METADATA.
  #forceClearStuckSeek(): void {
    const target = this.target as HTMLVideoElement | null;
    if (!target) return;
    target.pause();
    const end = nativeBufferedEnd(target);
    try {
      target.currentTime = end > 0 ? end : 0;
    } catch {
      // A MediaSource mid-teardown can refuse writes; the error event that
      // accompanies the exhaust branch surfaces the failure regardless.
    }
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

  // True when the seek target can never be satisfied by the current load: past
  // the worker-vouched duration, or past the delivered buffer once the source
  // reached end-of-stream. These are the only positions the engine provably
  // cannot reach — a far-but-valid forward seek stays on the ordinary SEEK path
  // (the worker's restart seam re-anchors it), so common in-buffer seeks are
  // unchanged.
  #isOutOfWindowSeek(seekSeconds: number, bufferedEnd: number): boolean {
    if (
      this.#durationSeconds !== null &&
      seekSeconds > this.#durationSeconds + SEEK_DURATION_TOLERANCE_SECONDS
    ) {
      return true;
    }
    const windowEnd = Math.max(bufferedEnd, this.#workerBufferEndSeconds);
    if (
      this.#endedReached &&
      windowEnd > 0 &&
      seekSeconds > windowEnd + SEEK_DURATION_TOLERANCE_SECONDS
    ) {
      return true;
    }
    return false;
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

  // ---- Main-thread MSE fallback (Firefox and friends) ----

  #onEnded = (event: Event) => {
    const target = this.target;
    if (!target || event.target !== target) return;
    if (this.#recovering) {
      // An engine-initiated teardown (recovery reload / source restart) ends
      // the old MediaSource mid-flight; that is not the user reaching EOF, so
      // it must neither latch end-state nor count as the recovered load having
      // played.
      return;
    }
    // Genuine end-of-stream: the active load played out. Nothing past the
    // delivered buffer will arrive, so an out-of-window seek here is provably
    // unreachable — and a recovery load that reached EOF demonstrably played,
    // so its reload budget may restore.
    this.#endedReached = true;
    if (this.#recoveryLoadInFlight) {
      this.#logger.child('host').info('decode-recovery.played', { at: 'ended' });
      this.#recoveryLoadInFlight = false;
      this.#reloadsThisLoad = 0;
      this.#recovering = false;
    }
  };

  #onMessage = (event: MessageEvent) => {
    // Foreign or malformed payloads (another library's worker, a draft
    // protocol version) must never reach the state-machine handlers as casts.
    // The dropped envelope's `type` field is the only safe identity — scalar,
    // never payload contents — and it is reported at debug as a dropped-message
    // counter (a foreign/wayward worker is rare, so this stays off the noise
    // budget).
    if (!isWorkerToMainMessage(event.data)) {
      const envelope = event.data as null | { type?: unknown };
      const type =
        typeof envelope?.type === 'string' || typeof envelope?.type === 'number'
          ? String(envelope.type)
          : 'unknown';
      this.#logger.child('host').debug('protocol.rejected', { type });
      return;
    }
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
        // End-of-stream for the active load: nothing past the delivered buffer
        // will ever arrive, so a later out-of-window seek is provably
        // unreachable (see `#isOutOfWindowSeek`).
        this.#endedReached = true;
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
        // The recovery window also closes: no reload is in flight to protect,
        // so a subsequent new load starts with clean recovery state.
        if (message.kind === workerErrorCode.decode && this.#src) {
          this.#logger.child('host').error('decode-recovery.exhausted', {
            attempt: MAX_DECODE_RELOADS,
            requestId: this.#requestId,
          });
          this.#recovering = false;
          this.#recoveryLoadInFlight = false;
        }
        this.#reportError(message.kind, message.context);
        return;
      case WorkerToMainMessageType.HANDLE: {
        if (message.requestId !== this.#requestId) return;
        const target = this.target as HTMLVideoElement | null;
        if (target) (target as unknown as { srcObject: unknown }).srcObject = message.handle;
        // The replacement resource is now live on the element; a recovery's
        // parked re-anchor (see `#pendingReanchorSeconds`) belongs HERE, in
        // HAVE_NOTHING, not on the tombstoned pipeline it was written before.
        this.#applyPendingReanchor(target);
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
        if (message.requestId !== this.#requestId) return;
        // Track the highest window end the worker reports so `#onSeeking` can
        // tell an out-of-window target from an ordinary in-buffer one.
        this.#workerBufferEndSeconds = message.buffered.reduce(
          (max, win) => (win.end > max ? win.end : max),
          this.#workerBufferEndSeconds,
        );
        this.dispatchEvent(new Event('progress'));
        return;
      case WorkerToMainMessageType.SOURCE_OK:
        // Only the newest load may drive the pipeline; a late acknowledgement
        // of a superseded SOURCE would downgrade the request id and let stale
        // chunks into the current append pipeline.
        if (message.requestId !== this.#requestId) return;
        // A clean acknowledgement proves this load opened, so a normal load's
        // recovery budget restarts from here. A RECOVERY reload, however, is
        // the SAME broken object re-opening: restoring the budget here is what
        // let the observed loop reset to attempt=1 every ~2.6s. It stays armed
        // (counter intact, `#recoveryLoadInFlight` true) until that load
        // actually plays — `#onTimeUpdate` sees the playhead advance — or ends
        // cleanly, and only then is the budget restored.
        if (this.#recoveryLoadInFlight) {
          this.#logger.child('host').info('decode-recovery.done', { attempt: this.#reloadsThisLoad });
        } else {
          this.#reloadsThisLoad = 0;
        }
        this.#durationSeconds = message.info.durationSeconds;
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
    if (this.#recovering) {
      // The engine is replacing the pipeline (decode recovery / external-seek
      // restart); the incidental native pause that surfaces during teardown is
      // engine work, not the user stopping — it must not erase the intent the
      // recovery is preserving, or re-attaches would regain nothing.
      return;
    }
    // A deliberate pause supersedes earlier play intent: once the user stops,
    // a re-attach must not resume the stopped playback. The next native `play`
    // re-asserts the intent, so clearing here loses nothing live.
    this.#playRequested = false;
    this.#wasPlaying = false;
  };

  #onPlay = (event: Event) => {
    const target = this.target;
    if (!target || event.target !== target) return;
    // Play intent is sticky: an attach that rebuilds the pipeline must not
    // lose it (the worker resets its own playback bookkeeping on ATTACH). The
    // host-lifetime `#wasPlaying` mirrors it so recovery can tell the user was
    // watching even after the per-load flag was reset by a teardown.
    this.#playRequested = true;
    this.#wasPlaying = true;
    // Deferred playback start (preload 'metadata'/'none'): first play (or a
    // user seek) triggers streaming.
    this.#send({ requestId: this.#requestId ?? nextRequestId(), type: MainToWorkerMessageType.PLAY });
  };

  #onSeeked = (event: Event) => {
    const target = this.target;
    if (!target || event.target !== target) return;
    this.#cancelSeekWatchdog();
    if (this.#externalSeeksThisLoad > 0) {
      // An external-seek restart's re-anchor seek resolved: the target is
      // reachable after all, so its restart budget restores and the recovery
      // window closes (later incidental pause/ended register normally again).
      this.#logger.child('host').info('seek-recovery.done', {
        attempt: this.#externalSeeksThisLoad,
      });
      this.#externalSeeksThisLoad = 0;
      this.#recovering = false;
    }
  };

  #onSeeking = (event: Event) => {
    const target = this.target;
    if (!target || event.target !== target) return;
    // A recovery reload parks the element at its re-anchor target, which
    // surfaces as a native `seeking` here; the recovery already issued the
    // SEEK + watchdog it needs, so re-entering the out-of-window check would
    // only double-send and double-arm (or worse, restart once more).
    if (this.#recovering) return;
    const seekSeconds = target.currentTime;
    if (this.#isOutOfWindowSeek(seekSeconds, nativeBufferedEnd(target))) {
      // The target can never be satisfied by this load (past the vouched
      // duration, or past the delivered buffer once the source ended). A bare
      // SEEK would leave the element in `seeking` / HAVE_METADATA forever, so
      // restart the source re-anchored at the target instead — the same remedy
      // as decode recovery, bounded, with the stall watchdog as backstop.
      this.#recoverFromOutOfWindowSeek(seekSeconds);
      return;
    }
    // A seek supersedes the current position: drop chunks still queued for it
    // and (once quiesced) reset the SourceBuffer's segment parser so the
    // worker's fresh fragment parses clean instead of continuing the tail the
    // seek cut off mid-fragment (Chromium's RunSegmentParserLoop failure).
    // The reset carries the target so the main-owned buffer is re-anchored to
    // the sought position (the trimmed output's timestamps rebase to zero).
    this.#appendPipe?.reset(seekSeconds);
    this.#send({
      requestId: this.#requestId ?? nextRequestId(),
      time: seekSeconds,
      type: MainToWorkerMessageType.SEEK,
    });
    // Watchdog for a seek that never resolves (e.g. an in-window target the
    // engine silently refuses): cleared on `seeked` / a load boundary.
    this.#armSeekWatchdog();
  };

  #onTimeUpdate = (event: Event) => {
    const target = this.target;
    if (!target || event.target !== target) return;
    const now = target.currentTime;
    // A recovery reload that is genuinely playing advances the playhead again;
    // only that (or a clean `ended`) is "the load actually played", so the
    // consecutive-recovery budget may restore. A stalled reload emits no
    // advancing timeupdate at all, keeping its count busy and the loop bounded.
    if (this.#recoveryLoadInFlight && now > this.#lastPlayheadSeconds + 0.05) {
      this.#logger.child('host').info('decode-recovery.played', { at: 'timeupdate' });
      this.#recoveryLoadInFlight = false;
      this.#reloadsThisLoad = 0;
      this.#recovering = false;
    }
    // Keep the newest position the host forwarded: decode-error recovery
    // seeks the reloaded source back here.
    this.#lastPlayheadSeconds = now;
    this.#evictMainBuffer();
    this.#send({
      requestId: this.#requestId ?? nextRequestId(),
      time: now,
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
    const attempt = this.#reloadsThisLoad + 1;
    // Capture what the reload must restore BEFORE `#resetLoadState` wipes it:
    // the resume position (the newest playhead the host forwarded) and whether
    // the load carries play intent. `#wasPlaying` is host-lifetime — it
    // survives the reset, and its clear-in-`#onPause` is guarded while
    // `#recovering` — so an incidental native `ended`/`pause` fired by the
    // engine's teardown cannot erase "the user was watching". A watch position
    // past 0 alone also forces playback on: an element the user was mid-way
    // through always sat at a positive playhead. Only a source the user never
    // played (position 0, no intent) stays paused.
    const resumeSeconds = this.#lastPlayheadSeconds;
    const shouldPlay = this.#wasPlaying || resumeSeconds > 0;
    this.#logger.child('host').warn('decode error on active load — reloading', {
      attempt,
      play: shouldPlay,
      requestId: this.#requestId,
      resumeSeconds,
    });
    // The reload runs the same teardown a new src/load() performs, which also
    // zeros the budget + recovery flags — restore the old count including this
    // one and reopen the recovery window AFTER the reset, so the reload's own
    // incidental pause/ended never register as user intent.
    this.#resetLoadState();
    this.#reloadsThisLoad = attempt;
    this.#recovering = true;
    this.#recoveryLoadInFlight = true;
    // The reset also cleared the captured watch position, but the stalled
    // element emits no further timeupdate to re-record it — keep the position
    // for later recoveries of this same load.
    this.#lastPlayheadSeconds = resumeSeconds;
    this.#sendSource();
    // Re-anchor the ELEMENT at the resume position the same way the external-
    // seek restart does (see `#recoverFromOutOfWindowSeek`): the reloaded
    // source's real-timestamped fragments need the display element parked on
    // the target so playback resumes where it broke. `#onSeeking` re-entrance
    // from this native seek is suppressed while `#recovering`. The write is
    // also parked for replay at the replacement-resource attach, because the
    // element may still be sat on the tombstoned pipeline here (readyState ≥
    // HAVE_METADATA), where the write is just a plain seek — the fresh
    // resource opens HAVE_NOTHING at 0 and would strand the element there
    // without the replay (see `#applyPendingReanchor`).
    this.#pendingReanchorSeconds = resumeSeconds;
    const recoverTarget = this.target as HTMLVideoElement | null;
    if (recoverTarget) {
      try {
        recoverTarget.currentTime = resumeSeconds;
      } catch {
        // A dead MediaSource mid-teardown can refuse the write; the bounded
        // budget still surfaces the failure if this load never plays.
      }
    }
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

  // Bounded recovery for a seek that lands outside the playable window (see
  // `#isOutOfWindowSeek`) or that the stall watchdog found stuck: restart the
  // whole load re-anchored at the target (SOURCE → SEEK → PLAY-if-needed), the
  // same remedy as decode recovery. Once its budget is exhausted the target is
  // treated as unreachable: surface a decode-class error and force the stuck
  // element out of `seeking` instead of leaving it in HAVE_METADATA forever.
  #recoverFromOutOfWindowSeek(seekSeconds: number): void {
    if (this.#externalSeeksThisLoad >= MAX_EXTERNAL_SEEK_RESTARTS) {
      this.#logger.child('host').error('seek-recovery.exhausted', {
        restarts: MAX_EXTERNAL_SEEK_RESTARTS,
        seekSeconds,
      });
      this.#recovering = false;
      this.#forceClearStuckSeek();
      this.#reportError(workerErrorCode.decode, `seek to ${seekSeconds}s is outside the playable range`);
      return;
    }
    this.#externalSeeksThisLoad += 1;
    const attempt = this.#externalSeeksThisLoad;
    // Restarting a source the user is scrubbing while paused must not
    // auto-start playback: only resume when playback was actually in flight
    // (`#wasPlaying` survives the teardown's incidental events). A seek from a
    // playing element restarts and keeps playing.
    const target = this.target as HTMLVideoElement | null;
    const shouldPlay = this.#wasPlaying || (target ? !target.paused : false);
    this.#logger.child('host').warn('seek outside window — restarting source', {
      attempt,
      play: shouldPlay,
      seekSeconds,
    });
    // `#resetLoadState` zeros the budget + recovery window like any fresh load;
    // restore this restart's count and reopen the window AFTER it, mirroring
    // the decode-recovery pattern.
    this.#resetLoadState();
    this.#externalSeeksThisLoad = attempt;
    this.#recovering = true;
    this.#lastPlayheadSeconds = seekSeconds;
    this.#sendSource();
    // Re-anchor the ELEMENT at the seek target, not just the worker's read:
    // the restarted source appends real-timestamped fragments (the main-mode
    // pipe rebases to zero, worker MSE does not), so a display element parked
    // at 0 would sit on data-less track and stall paused even though the
    // buffer holds the target. Setting currentTime while HAVE_NOTHING (the
    // post-`emptied` state) parks the native default playback start position,
    // which the fresh load honors as soon as its metadata opens; re-entrance
    // into `#onSeeking` from this native seek is suppressed while `#recovering`.
    // The write is also parked for replay at the replacement-resource attach,
    // because the element may not have reached the HAVE_NOTHING park yet (it
    // can still hold the tombstoned pipeline), where the write would be lost
    // to the fresh resource resetting the playhead to 0.
    this.#pendingReanchorSeconds = seekSeconds;
    if (target) {
      try {
        target.currentTime = seekSeconds;
      } catch {
        // A MediaSource mid-teardown can refuse the write; the watchdog +
        // restart budget still bound the recovery regardless.
      }
    }
    const requestId = this.#requestId ?? nextRequestId();
    this.#send({ requestId, time: seekSeconds, type: MainToWorkerMessageType.SEEK });
    if (shouldPlay) {
      this.#send({ requestId, type: MainToWorkerMessageType.PLAY });
    }
    // The restarted source must re-buffer the target; the stall watchdog
    // re-checks after a fresh interval and re-enters this method (or its
    // exhaust branch) if the seek still has not resolved.
    this.#armSeekWatchdog();
  }

  #reportError(kind: WorkerErrorCode, context?: string): void {
    if (this.#destroyed) return;
    // A fatal error ends all recovery ambitions: no reload is in flight to
    // protect, no unresolved seek needs a watchdog any longer, and no fresh
    // resource will arrive to honor a parked re-anchor.
    this.#recovering = false;
    this.#recoveryLoadInFlight = false;
    this.#pendingReanchorSeconds = null;
    this.#cancelSeekWatchdog();
    // An errored pipeline is never ended: the pipe refuses end-of-stream once
    // it has failed, and the ENDED handler refuses on `#error` — either way a
    // failure is never masked by a clean end. `#error` is cleared at every
    // load boundary, so its presence here means *this* load reported an error.
    const error = mediaErrorFromWorkerMessage({ context, kind });
    this.#error = error;
    this.dispatchEvent(mediaErrorEvent(error));
  }

  // Drops pipeline state attached to the previously played source and
  // announces the load boundary with the native `emptied` event. This is the
  // fresh/load/ATTACH_OK boundary: budgets and recovery windows die with the
  // old load (the recovery helpers re-arm their own counters/flags AFTER this
  // reset). `#wasPlaying` is deliberately preserved — it records "has the user
  // asked for playback this session" and survives reloads until a deliberate,
  // non-teardown pause clears it.
  #resetLoadState(): void {
    this.#error = null;
    // Any automatic decode-error reloads or out-of-window seek restarts
    // belonged to the old load; a fresh source, load(), or ATTACH_OK replay
    // starts with full budgets.
    this.#reloadsThisLoad = 0;
    this.#externalSeeksThisLoad = 0;
    this.#recoveryLoadInFlight = false;
    this.#recovering = false;
    // A fresh/load/ATTACH_OK boundary supersedes any recovery: no parked
    // re-anchor from the old load may reach the new one (the recovery helpers
    // re-arm their own re-anchor AFTER this reset).
    this.#pendingReanchorSeconds = null;
    // Per-load window facts are gone until the next SOURCE_OK / PROGRESS.
    this.#endedReached = false;
    this.#durationSeconds = null;
    this.#workerBufferEndSeconds = 0;
    // No load is seeking after a boundary; a stale watchdog must not fire into
    // the fresh pipeline.
    this.#cancelSeekWatchdog();
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

/** Highest end of the element's native buffered ranges; 0 when empty. */
function nativeBufferedEnd(target: HTMLVideoElement): number {
  const buffered = target.buffered;
  if (buffered.length === 0) return 0;
  return buffered.end(buffered.length - 1);
}
