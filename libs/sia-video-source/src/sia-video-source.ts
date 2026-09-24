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
 * Attach behavior: `attach` is idempotent across element swaps (React
 * StrictMode remounts included). Every `ATTACH_OK` is followed by a fresh
 * `SOURCE` for
 * the current `src`, and only the acknowledgement of the newest load may
 * change request state, so a detach/reattach cycle rebuilds a coherent
 * pipeline instead of appending into an orphaned one.
 */

import { type AppKeySeedProvider, encryptToWorker, scrub } from './app-key-handshake.ts';
import { HTMLVideoElementHost, type HTMLVideoTargetLike } from '@videojs/media/dom/video-host';
import { type ErrorLike, MediaError, type MediaPreloadType, type MediaStreamType } from '@videojs/media';
import { mediaErrorEvent, mediaErrorFromWorkerMessage } from './errors.ts';
import {
  constructMseMediaSource,
  detectMseRuntime,
  mseImplementation,
  prepareMediaElementForMse,
} from './capabilities/mse-runtime.ts';
import { createConsoleLogger, type LogFields, type Logger, type LogLevelFilter } from './log/logger.ts';
import {
  type HostDecision,
  hostDecisionKind,
  hostPlaybackEvent,
  HostPlaybackMachine,
  playbackPreference,
  type RecoveryReason,
  recoveryReason,
} from './host-playback-machine.ts';
import { MseAppendPipe } from './mse-pipe.ts';
import {
  DEFAULT_FMP4_MIME,
  isWorkerToMainMessage,
  type MainToWorkerMessage,
  MainToWorkerMessageType,
  nextRequestId,
  PROTOCOL_VERSION,
  type RequestId,
  type SourceInfo,
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

/** Default props used by the React wrapper's prop-syncing hook. */
const MSE_BACK_BUFFER_SECONDS = 30;

/**
 * Tolerated overshoot past the worker-vouched duration before a seek is
 * treated as external: the reported duration can trail the real object by a
 * tick, so a seek exactly at the end must not be treated as unreachable.
 */
const SEEK_DURATION_TOLERANCE_SECONDS = 0.25;

/**
 * How long an unresolved seek may hold the element in `seeking` before the
 * host assumes it will never resolve (the target is unreachable) and restarts
 * the source at that position. Slow-but-real remote reads retry with a fresh
 * attempt; only repeated failures surface an error.
 */
const SEEK_STALL_TIMEOUT_MS = 6000;

/**
 * The typed DOM event `SiaVideoSource` dispatches when the playback recovery
 * window opens (a `restart-source` decision starts) and closes (the recovered
 * load plays, the recovery exhausts, or a source reset / detach / destroy ends
 * it). The host dispatches it on BOTH its own `EventTarget` and the attached
 * `<video>` element, so consumers holding either can subscribe and read the
 * `detail` without re-inferring recovery from media events.
 */
export const siaRecoveryChange = 'sia-recovery-change' as const;

/**
 * The `siaRecoveryChange` payload. `active: true` opens the window exactly
 * once per recovery with the recovery's reason, resume position, and whether
 * playback should resume; `active: false` closes it exactly once. A deferred
 * repair alone is never announced: recovery only becomes active when an
 * explicit play/seek consumes it and the `restart-source` decision runs.
 */
export type RecoveryChangeDetail =
  | { active: false }
  | { active: true; reason: RecoveryReason; resumeSeconds: number; wantsPlay: boolean };

/**
 * The typed DOM event `SiaVideoSource` dispatches when a load's acceptance
 * changes: the current request's `SOURCE_OK` acknowledges the source
 * (`{ accepted: true }`, exactly once per load) or a load boundary resets it
 * (`{ accepted: false }`, exactly once at every fresh source/load,
 * reloadConfiguration/reattach replay, recovery restart, and detach/destroy).
 * The host dispatches it on BOTH its own `EventTarget` and the attached
 * `<video>` element, so consumers holding either can subscribe and read the
 * `detail` — the same pattern as `siaRecoveryChange`.
 */
export const siaLoadChange = 'sia-load-change' as const;

/**
 * The `siaLoadChange` payload — boolean-only. `accepted: true` means the
 * worker pipeline accepted the source at the existing unconditional `SOURCE_OK`
 * for the current request; it deliberately carries NO `SOURCE_OK.info`
 * metadata, progress, retries, counters, or broad phase, and a true value
 * does NOT mean the load is playable/ready.
 */
export interface SiaLoadChangeDetail {
  accepted: boolean;
}

/**
 * The typed DOM event `SiaVideoSource` dispatches when source information for
 * the CURRENT load changes: the current request's `SOURCE_OK` opens the window
 * (`{ active: true, info }`, exactly once per load, carrying the exact typed
 * `SourceInfo` the worker vouched for on the wire) or a load boundary closes
 * it (`{ active: false }`, exactly once at every fresh source/load,
 * reloadConfiguration/reattach replay, recovery restart, and detach/destroy).
 * The host dispatches it on BOTH its own EventTarget and the attached
 * `<video>` element, so consumers holding either can subscribe and read the
 * `detail` — the same pattern as `siaRecoveryChange`/`siaLoadChange`.
 *
 * There is no protocol change: the payload is the host's existing
 * `SOURCE_OK.info`, exposed without re-shaping it. An open `info` means the
 * worker pipeline accepted the source with those facts — not that the load is
 * playable/ready, and `durationSeconds` may be `null`.
 */
export const siaSourceInfoChange = 'sia-source-info-change' as const;

/**
 * The `siaSourceInfoChange` payload — a closed window (`active: false`, no
 * info) or an open one (`active: true`, the exact `SourceInfo` the worker
 * vouched for at `SOURCE_OK`). The close detail deliberately carries no
 * `info`, so the host clears the value when the window closes.
 */
export type SiaSourceInfoChangeDetail =
  | { active: false }
  | { active: true; info: SourceInfo };

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

/**
 * Media prop defaults the React wrapper syncs into the persistent media
 * instance (never the DOM element). Deliberately annotated, not `as const`:
 * this is the PUBLIC prop typing `Partial<typeof siaVideoDefaultProps>` feeds,
 * so `src` must stay a plain `string` (a hex object key or Sia share URL), not
 * the `''` literal a const assertion would expose — the same widening applies
 * to `preload`/`streamType`, which accept every value of their media types.
 */
export const siaVideoDefaultProps: {
  preload: MediaPreloadType;
  src: string;
  streamType: MediaStreamType;
} = {
  preload: 'metadata',
  src: '',
  streamType: 'on-demand',
};

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
   * authoritatively and `ATTACH_OK.mode` is always applied. Defaults to
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
   * Per-render setter form of the `getSharingKeySeed` option, matching
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
   * Per-render setter form of the `logger` option, matching the
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

    // A different source is now active: the machine drops every trace of the
    // previous source's recovery and reads back as never-played.
    if (value) {
      this.#machine.send({ type: hostPlaybackEvent.sourceSet });
    } else {
      this.#machine.send({ type: hostPlaybackEvent.sourceReset });
    }
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
  // Identity of the media resource the CURRENT load attached, used to tell a
  // live native event from a dead one. Worker mode holds the request-scoped
  // MediaSourceHandle the worker transferred (the element's srcObject) for the
  // active load; main mode uses the current object URL (`#objectUrl`). Cleared
  // at every load boundary BEFORE the replaced resource's events arrive, so
  // native events from a superseded pipeline are ignored until the fresh
  // resource genuinely attaches.
  #activeHandle: MediaSourceHandle | null = null;

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

  // Monotonic handshake generation. Bumped every time a fresh HELLO is posted
  // (initial attach, re-attach, `reloadConfiguration`) AND on detach/destroy,
  // so an async seed/encryption chain captured under an older generation can
  // prove it was superseded and drop its APP_KEY/ATTACH instead of applying a
  // stale configuration to the worker.
  #attachGeneration = 0;
  // The requestId of the most recently posted ATTACH and the handshake
  // generation it was posted under. Together they correlate an ATTACH_OK to
  // the ATTACH it answers: the requestId alone would still let a superseded
  // reload's ATTACH_OK match if a newer reload had posted a HELLO but not yet
  // its own ATTACH, so the generation must also be current. Cleared at every
  // handshake start and on detach/destroy, so an in-flight ATTACH_OK from a
  // dead handshake can never gate the session.
  #attachGenerationAtAttach: null | number = null;
  #attachRequestId: null | RequestId = null;

  // A recoverable decode/network error on the ACTIVE load while the user is
  // explicitly paused never reloads behind them; the machine stores the resume
  // point in its own `repairOwed` state, which the next explicit `play`
  // (restart + resume) or `seek` (restart paused) consumes exactly once.
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
  // The requestId of the most recently posted HELLO. `HELLO_OK` echoes the
  // requestId of the HELLO it answers (the worker posts it synchronously while
  // handling that HELLO, and MessagePort delivery is FIFO), so this is the
  // provable identity of the handshake a HELLO_OK belongs to — a reply still
  // in flight from an EARLIER handshake after a newer HELLO was posted carries
  // an older id and is discarded. Cleared on detach/destroy so a late reply
  // never gates anything for a host with no live handshake.
  #helloRequestId: null | RequestId = null;
  // Most recent playhead the host forwarded via PLAYHEAD; decode/seek recovery
  // repositions the reloaded load here. Starts at 0 until the first
  // timeupdate.
  #lastPlayheadSeconds = 0;
  // Whether the ACTIVE load's acceptance is currently announced as
  // `accepted: true`. Set exactly once per SOURCE_OK; reset (and announced
  // `accepted: false`, exactly once) at every load boundary, detach, and
  // destroy. Guards the "exactly once" open and close, never a second fact to
  // infer acceptance from.
  #loadAccepted = false;
  // Main-thread MSE fallback state (Firefox and other `main`-mode sessions).
  #logger: Logger;

  // Robot3 recovery machine for this video source. It tracks the playback
  // choice ('never-started' | 'playing' | 'paused'), the consecutive
  // recovery attempt count, whether a repair is owed and at what position, and
  // the recovery requests that drive the host's restart effect. The host keeps
  // ordinary per-load facts outside it: playhead, duration, buffered end,
  // request id, element/worker refs, pending re-attach seconds, and the seek
  // watchdog timer handle.
  readonly #machine = new HostPlaybackMachine();

  #mediaSource: MediaSource | null = null;

  #mimeType: string | undefined;

  #mode: null | WorkerMode = null;

  // MSE implementation snapshot for this runtime (standard / managed / none /
  // webkit-legacy). Snapped once at construction: the impl never changes for
  // a page's lifetime, and the host needs it for the element-side
  // `disableRemotePlayback` prep and the fail-fast device gate.
  readonly #mseSnapshot = detectMseRuntime();

  #objectUrl: null | string = null;

  readonly #options: SiaVideoSourceOptions;

  // Next-task confirmation for a provisional pause. video.js emits a native
  // `pause` before `seeking` on a far scrub of a playing element; the host
  // holds that pause in the machine's `pausepending` window and schedules this
  // zero-delay task to settle it as a genuine user pause via `pause.confirmed`
  // — UNLESS a seek/play (or a load boundary) cancels it first, which is what
  // keeps the seek's incidental pause from ever becoming the user's choice.
  // The handle is ordinary scheduling infrastructure; the machine holds the
  // decision state.
  #pauseConfirm: null | ReturnType<typeof setTimeout> = null;

  #pending: MainToWorkerMessage[] = [];

  // Element position a recovery (decode reload / external-seek restart) wants
  // applied once the FRESH resource actually attaches. Setting `currentTime`
  // immediately after `#sendSource()` runs while the element still holds the
  // OLD (dead) resource — readyState ≥ HAVE_METADATA — so per spec it is a
  // plain seek on the old pipeline, NOT a HAVE_NOTHING default-playback
  // position, and the replacement resource resets the playhead to 0. Deferred
  // to the HANDLE / object-URL attach point (readyState is HAVE_NOTHING for
  // the fresh resource there), where the write positions the new load at the
  // target instead of stranding it at 0 with the worker buffering elsewhere.
  #pendingReanchorSeconds: null | number = null;

  #preload: MediaPreloadType = siaVideoDefaultProps.preload;

  #ready = false;

  // True from the moment a `restart-source` decision announced `active: true`
  // until the recovery window closes (`active: false` was emitted). The host
  // maps the machine's `recovering` window to the typed event; this flag
  // guards the "exactly once" open and close, never a second boolean to infer
  // recovery from.
  #recoveryNotified = false;

  #requestId: null | RequestId = null;

  // Watchdog for a `seeking` state that never resolves: set on every user
  // seek, cleared when `seeked` / a load boundary arrives. On fire it treats
  // the seek as stuck and restarts the source at the target position, so the
  // element never hangs in HAVE_METADATA forever.
  #seekWatchdog: null | ReturnType<typeof setTimeout> = null;

  #sharingKeySeedProvider: AppKeySeedProvider | undefined;

  #sourceBuffer: null | SourceBuffer = null;

  // Whether the ACTIVE load's source information is currently announced as
  // `active: true` (with the worker's `SourceInfo`). Set exactly once per
  // SOURCE_OK — the same accepted load that opens acceptance — and reset (and
  // announced `active: false`, exactly once) at every load boundary, detach,
  // and destroy, so a stale `info` can never leak across loads.
  #sourceInfoNotified = false;

  #src = '';

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
   * Spawns (or reconnects) the playback worker and connects its message
   * channel. Safe across repeat attaches: every attach (re)negotiates the
   * session —
   * HELLO delivers the current `workerConfig` so a re-attach picks up config
   * changes — and the resulting ATTACH_OK replays the current source into the
   * new element.
   */
  attach(target: HTMLVideoElement): void {
    // A destroyed host keeps no engine and can never replay a source; a
    // late attach call (e.g. a stale React effect) must not re-spawn the
    // worker into a zombie MediaEngineHost.
    if (this.#destroyed) return;
    // Registered BEFORE `super.attach`: the base host forwards a native
    // `error` onto this element's listeners as a raw generic event when any
    // host `error` listener exists (video.js's error dialog is one), which
    // would surface a stale error from an idle-paused or replaced pipeline as
    // a fatal UI error. This handler runs first and stops that forwarding,
    // then classifies the failure itself — deferral while paused, retry-capped
    // recovery while playing, exhaustion through #reportError.
    target.addEventListener('error', this.#onNativeError);
    // Registered BEFORE the base host's native forwarding, so a stale `ended`
    // from a dead resource can stop it from reaching host/video.js ended
    // observers (see `#onEnded`). A genuine current-resource ended is never
    // stopped, so the forwarding still runs for real EOF.
    target.addEventListener('ended', this.#onEnded);
    super.attach(target);
    target.addEventListener('seeking', this.#onSeeking);
    target.addEventListener('seeked', this.#onSeeked);
    target.addEventListener('timeupdate', this.#onTimeUpdate);
    target.addEventListener('play', this.#onPlay);
    target.addEventListener('pause', this.#onPause);

    if (this.#worker) {
      // An already-attached host re-negotiates with a fresh HELLO (the same
      // path `reloadConfiguration` uses), so a re-attach also re-reads the
      // CURRENT config and seed suppliers.
      this.#startHandshake();
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
    this.#startHandshake();
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
    // A destroy invalidates any pending handshake work: bumping the generation
    // makes an async seed/encryption chain captured under an older generation
    // drop itself, and clearing the correlation ids makes a late HELLO_OK or
    // ATTACH_OK gate nothing (the override `detach` runs through `super.destroy`
    // too, so this is defense-in-depth for the instant before that). The host
    // is not-ready and the handshake buffer is emptied: there is no session
    // left to flush into.
    this.#attachGeneration += 1;
    this.#helloRequestId = null;
    this.#attachRequestId = null;
    this.#attachGenerationAtAttach = null;
    this.#ready = false;
    this.#pending = [];
    // Teardown is posted DIRECTLY (never through #send's not-ready gate): a
    // destroy arriving mid-reload must still reach the worker.
    this.#post({ type: MainToWorkerMessageType.DESTROY });
    const worker = this.#worker;
    this.#worker = null;

    if (worker) {
      worker.removeEventListener('message', this.#onMessage);
      worker.removeEventListener('error', this.#onWorkerError);
      worker.removeEventListener('messageerror', this.#onWorkerMessageError);
      worker.terminate();
    }

    this.#teardownMainThreadMse();
    // A destroyed host keeps no pipeline to recover or resume, so the memory
    // of past positions and any pending re-attach die with it; the Robot3
    // machine instance dies with the host.
    this.#lastPlayheadSeconds = 0;
    this.#pendingReanchorSeconds = null;
    // The resource identity dies with the host: no later native event is
    // trusted.
    this.#activeHandle = null;
    // A destroyed host's recovery cannot end gracefully elsewhere: close any
    // open recovery observation so consumers never wait on a close that
    // cannot come.
    this.#closeRecoveryObservation();
    // The lifecycle ends acceptance too: an accepted load must not stay open
    // on a dead host. (The override `detach` runs through `super.destroy` as
    // well, so this is defense-in-depth for the instant before that — the
    // already-accepted guard makes a second call a no-op.)
    this.#resetLoadAcceptance();
    // The lifecycle ends source information too: an open window must not stay
    // open with its `info` on a dead host (same defense-in-depth, no-op when
    // already closed).
    this.#resetSourceInfo();
    this.#cancelPauseConfirm();
    this.#cancelSeekWatchdog();
    super.destroy();
  }

  detach(): void {
    // A detach is a handshake boundary: an async seed/encryption chain from a
    // reload still in flight must not apply into the detached session (the
    // generation bump drops it), and a late HELLO_OK or ATTACH_OK must not gate
    // anything (the correlation ids are cleared). The host is left not-ready
    // with an empty handshake buffer: a detach mid-reload must not flush the
    // buffered intent into the parting session.
    this.#attachGeneration += 1;
    this.#helloRequestId = null;
    this.#attachRequestId = null;
    this.#attachGenerationAtAttach = null;
    this.#ready = false;
    this.#pending = [];
    // A detached host's recovery window is over: close any open observation
    // (a re-attach replay re-announces if it recovers again).
    this.#closeRecoveryObservation();
    // A detached host's accepted load is over too: reset the announced
    // acceptance, and drop the current request identity so no still-in-flight
    // SOURCE_OK (or PROGRESS/CHUNK/ERROR) for the torn-down load can apply to
    // a host with no current load. A re-attach replay re-announces when the
    // replayed source's SOURCE_OK lands (under a brand-new request id).
    this.#requestId = null;
    this.#resetLoadAcceptance();
    // A detached host's source-info window is over too: close it (and clear
    // the stored `info`) so nothing leaks into the detached session. A
    // re-attach replay re-opens when the replayed source's SOURCE_OK lands.
    this.#resetSourceInfo();
    this.#cancelPauseConfirm();
    // The element's resource identity dies with the detach; a re-attach
    // rebuilds the load and re-identifies it.
    this.#activeHandle = null;
    this.target?.removeEventListener('error', this.#onNativeError);
    this.target?.removeEventListener('seeking', this.#onSeeking);
    this.target?.removeEventListener('seeked', this.#onSeeked);
    this.target?.removeEventListener('timeupdate', this.#onTimeUpdate);
    this.target?.removeEventListener('play', this.#onPlay);
    this.target?.removeEventListener('pause', this.#onPause);
    this.target?.removeEventListener('ended', this.#onEnded);
    // Teardown is posted DIRECTLY (never through #send's not-ready gate): a
    // detach arriving mid-reload must still reach the worker.
    this.#post({ type: MainToWorkerMessageType.DETACH });
    super.detach();
  }
  /** Reloads the current source through the engine, clearing any stored error. */
  override load(): void {
    if (this.#src && this.#worker) {
      // An explicit re-load starts like a fresh `src`: the rebuilt pipeline
      // begins paused, never-played, and only streams once the user plays.
      this.#machine.send({ type: hostPlaybackEvent.sourceSet });
      this.#resetLoadState();
      this.#sendSource();
      return;
    }
    void super.load();
  }

  /**
   * Re-runs the connection handshake against the CURRENT configuration on the
   * SAME worker and element: a fresh HELLO (carrying the current worker config
   * and seed-presence flags), the current seed suppliers re-read into fresh
   * encrypted APP_KEY envelopes, an ATTACH, and the current source replayed
   * with its preserved play/pause intent — the identical flow a re-attach
   * performs, without a detach/attach cycle (no remount, no new worker, no new
   * element attachment).
   *
   * Use it to apply configuration the host only consumes at handshake time —
   * `workerConfig` (presence/indexerUrl identity), `workerMse`, swapped seed
   * suppliers, the HELLO log threshold — that would otherwise sit inert until
   * the next (re)attach. The reload is always-forced and idempotent: whatever
   * the previous session state (idle, playing, mid-recovery, or after a fatal
   * error), the rebuilt load starts fresh — buffered state / stored error /
   * the recovery observation reset, playhead back to 0 — while a genuinely
   * playing element's playback choice survives, exactly as a re-attach.
   *
   * No-op when the host was never attached, is currently detached, or has been
   * destroyed — there is no element to replay into and no session to renew.
   */
  reloadConfiguration(): void {
    if (this.#destroyed || !this.target) return;
    this.#startHandshake();
  }

  // Announces the active load as accepted exactly once (the "no duplicate
  // true" guard): the worker's SOURCE_OK proves a load opened, and a load can
  // only open once. It does NOT mean playable/ready — only that the pipeline
  // accepted the source for the current request.
  #acceptLoad(): void {
    if (this.#loadAccepted) return;
    this.#loadAccepted = true;
    this.#emitLoadDetail({ accepted: true });
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
      // The main-thread SourceBuffer opened (counterpart of the worker's
      // `session.mse-open`): scalar MIME + duration facts only.
      this.#logger.child('host').info(
        'mse-open',
        durationSeconds === null ? { mime } : { durationSeconds, mime },
      );
    } catch (error) {
      // The MIME the host applied was refused — name it, then report decode as
      // before (counterpart of the worker's `session.mse-open-failed`).
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

  // Performs the effects a machine transition decided. Returns true when a
  // restart-source decision was acted on (the caller must not also post the
  // ordinary wire message it would have sent).
  #applyDecisions(decisions: HostDecision[]): boolean {
    let restarted = false;
    for (const decision of decisions) {
      switch (decision.kind) {
        case hostDecisionKind.deferRepair:
          // Nothing to perform: the machine stored the repair, and the next
          // explicit play/seek consumes it and posts the restart itself.
          this.#logger.child('host').info('repair.deferred', {
            reason: decision.reason,
            resumeSeconds: decision.resumeSeconds,
          });
          break;
        case hostDecisionKind.reportError:
          // An exhausted seek restart leaves the element stuck in `seeking`;
          // force it back onto buffered data so it never hangs in
          // HAVE_METADATA. For any other exhausted failure the element is not
          // mid-seek and the guard below leaves it alone.
          if (this.target?.seeking) this.#forceClearStuckSeek();
          this.#reportError(decision.error);
          break;
        case hostDecisionKind.restartSource:
          this.#restartSource(decision);
          restarted = true;
          break;
      }
    }
    return restarted;
  }

  // Applies (once) the element position a recovery recorded for the fresh
  // load, then forgets it. Called at the point the replacement resource
  // genuinely attaches — the worker-MSE `HANDLE` swap and the main-MSE
  // object-URL assignment — when the element is HAVE_NOTHING for that
  // resource, which is exactly the state where a `currentTime` write positions
  // the new load at the target (the shared default-playback-start-position
  // mechanism).
  #applyPendingReanchor(target: HTMLVideoTargetLike | null): void {
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

  // Setting/clearing for the unresolved-seek watchdog. When `seeking` is
  // still latched (no `seeked` has resolved it) past the stall interval, the
  // seek is judged stuck and the machine runs the same retry-capped seek
  // restart (or, once exhausted, reports a decode-class error and force-clears
  // the stuck flag).
  #armSeekWatchdog(): void {
    this.#cancelSeekWatchdog();
    this.#seekWatchdog = setTimeout(() => {
      this.#seekWatchdog = null;
      const target = this.target as HTMLVideoElement | null;
      if (!target || !target.seeking || this.#destroyed) return;
      this.#logger.child('host').warn('seek unresolved — recovering', {
        seekSeconds: target.currentTime,
      });
      this.#applyDecisions(
        this.#machine.send({ seconds: target.currentTime, type: hostPlaybackEvent.stalledSeek }),
      );
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
      // MSE-pipe diagnostics are forwarded onto the host logger's `host` scope
      // the same way the worker path's onLog forwarding works: the back-buffer
      // eviction trace is debug, and the rare best-effort breadcrumbs (failed
      // eviction /
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

    // Only a standard or managed-implementing MSE runtime can play Sia video:
    // anything else — no MSE at all (all iPhone Safari pre-17.1) or only the
    // legacy WebKit-prefixed surface — is device-too-old, and fails with the
    // honest `device` kind instead of grinding toward a generic unsupported
    // error. (The same gate already ran at `#sendSource` on the main path;
    // this backstops a worker-mode session that degrades to main-mode
    // posting.)
    const impl = this.#mseSnapshot.impl;
    if (impl === mseImplementation.none || impl === mseImplementation.webkitLegacy) {
      this.#reportError(workerErrorCode.device, 'no-mse');
      return;
    }

    // Unsupported codec-qualified MIME fails as "unsupported source" here —
    // where it belongs — instead of appearing later as an `addSourceBuffer`
    // decode error. Bare container MIMEs are not decisive (see the worker's
    // matching comment), so they fall through to the concrete attempt. On
    // MMS-only runtimes there is no `MediaSource` global, so the check is
    // skipped exactly as it always was on such runtimes.
    if (typeof MediaSource !== 'undefined' && mime.includes('codecs=') && !MediaSource.isTypeSupported(mime)) {
      this.#reportError(workerErrorCode.unsupported, `MIME: ${mime}`);
      return;
    }

    const mediaSource = constructMseMediaSource();
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
    // Managed runtimes require `disableRemotePlayback = true` BEFORE the
    // source is attached or `sourceopen` never fires; a no-op for standard.
    prepareMediaElementForMse(target, this.#mseSnapshot.impl, (name) => this.#logger.child('host').debug(name));
    target.src = objectUrl;
    // The main-MSE replacement resource is now attached (the element is
    // HAVE_NOTHING for it); a recovery's recorded position applies here, the
    // same HAVE_NOTHING position the worker-MSE path gets on HANDLE.
    this.#applyPendingReanchor(target);
  }

  // Setting/clearing for the provisional-pause confirmation (see `#pauseConfirm`).
  // The zero-delay task runs after the current event turn, so a `seeking` /
  // `play` queued by the same scrub (media-element task source outranks timer
  // tasks) cancels it before it can settle the pause.
  #cancelPauseConfirm(): void {
    if (this.#pauseConfirm !== null) {
      clearTimeout(this.#pauseConfirm);
      this.#pauseConfirm = null;
    }
  }

  #cancelSeekWatchdog(): void {
    if (this.#seekWatchdog !== null) {
      clearTimeout(this.#seekWatchdog);
      this.#seekWatchdog = null;
    }
  }

  // Closes an open recovery observation exactly once (the "no duplicate
  // active:false" guard). NO-OP when no window is open.
  #closeRecoveryObservation(): void {
    if (!this.#recoveryNotified) return;
    this.#recoveryNotified = false;
    this.#emitRecoveryDetail({ active: false });
  }

  // Emits the typed load-change event through the attached <video> element,
  // the identical dispatch path (and element→host forwarding) as
  // `#emitRecoveryDetail`.
  #emitLoadDetail(detail: SiaLoadChangeDetail): void {
    this.target?.dispatchEvent(new CustomEvent<SiaLoadChangeDetail>(siaLoadChange, { detail }));
  }

  // Emits the typed recovery-change event through the attached <video>
  // element: element listeners (the demo) get it directly, and a host-level
  // listener is bridged to it by the base host's own element→host forwarding
  // for the types it has listeners on — so a consumer holding either receives
  // it exactly once, never duplicated by dispatching on both sides.
  #emitRecoveryDetail(detail: RecoveryChangeDetail): void {
    this.target?.dispatchEvent(new CustomEvent<RecoveryChangeDetail>(siaRecoveryChange, { detail }));
  }

  // Emits the typed source-info-change event through the attached <video>
  // element — the identical dispatch path (and element→host forwarding) as
  // `#emitLoadDetail`/`#emitRecoveryDetail`, so element and host listeners
  // each receive it exactly once.
  #emitSourceInfoDetail(detail: SiaSourceInfoChangeDetail): void {
    this.target?.dispatchEvent(
      new CustomEvent<SiaSourceInfoChangeDetail>(siaSourceInfoChange, { detail }),
    );
  }

  async #encryptAndSendSeed(
    getSeed: AppKeySeedProvider,
    workerPublicKey: Uint8Array,
    keyType: 'app' | 'sharing',
    generation: number,
  ): Promise<void> {
    let seed: Uint8Array | undefined;
    try {
      seed = await Promise.resolve(getSeed());
      // A handshake superseded while the supplier was pending (a newer reload,
      // a detach, or a destroy) must not encrypt or post: the envelope would
      // carry a seed current for a connection that is no longer current. The
      // buffer is still scrubbed below either way.
      if (generation !== this.#attachGeneration || this.#destroyed) return;
      // The keyType tag rides the envelope itself (see `AppKeyEnvelope`), so
      // the APP_KEY wire message shape is unchanged — no new message type.
      const envelope = await encryptToWorker(workerPublicKey, seed, keyType);
      // Re-check after the async encryption too — the handshake may have been
      // superseded while the bytes were being wrapped.
      if (generation !== this.#attachGeneration || this.#destroyed) return;
      // POSTed directly, outside #send's pending buffer: the seed supplier has
      // been consumed at this point, so a future re-attach re-reads it anyway.
      this.#post({ envelope, requestId: nextRequestId(), type: MainToWorkerMessageType.APP_KEY });
    } catch (error) {
      // A failure of a SUPERSEDED handshake is not this session's failure: a
      // stale supplier/encryption error must not surface on the current load.
      if (generation === this.#attachGeneration && !this.#destroyed) {
        this.#reportError(workerErrorCode.network, errorDescription(error));
      }
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
  // `generation` is the handshake this chain belongs to: every outbound step
  // re-checks it against `#attachGeneration`, so an older reload's chain that
  // resolves late drops its envelopes instead of winning the wire.
  async #encryptAndSendSeeds(workerPublicKey: Uint8Array, generation: number): Promise<void> {
    if (this.#appKeySeedProvider) {
      await this.#encryptAndSendSeed(this.#appKeySeedProvider, workerPublicKey, 'app', generation);
    }
    if (this.#sharingKeySeedProvider) {
      await this.#encryptAndSendSeed(this.#sharingKeySeedProvider, workerPublicKey, 'sharing', generation);
    }
  }

  // Runs after a machine send that may have ended a recovery (playhead
  // advance, seek-resolved, exhaustion, source boundary). The machine is the
  // authority on whether a recovery is in flight; the host only repeats it.
  #endRecoveryObservationIfMachineLeft(): void {
    if (this.#recoveryNotified && !this.#machine.isRecovering) this.#closeRecoveryObservation();
  }

  // True when a native media event on `target` belongs to the media resource
  // the CURRENT load attached, rather than a dead/superseded pipeline whose
  // handle or object URL the host already cleared. Worker mode: the element's
  // srcObject must be the request-scoped HANDLE of the active load. Main
  // mode: the element's src must be the object URL this load created. Before
  // a session mode is known there is nothing that can be dead yet, so events
  // pass — a plain pre-load element is not a replaced resource.
  #eventIsFromCurrentResource(target: HTMLVideoTargetLike): boolean {
    if (this.#mode === workerMode.worker) {
      return (
        this.#activeHandle !== null &&
        (target as unknown as { srcObject: unknown }).srcObject === this.#activeHandle
      );
    }
    if (this.#mode === workerMode.main) {
      return this.#objectUrl !== null && target.src === this.#objectUrl;
    }
    return true;
  }

  #evictMainBuffer(): void {
    // Fire-and-forget: the pipe serializes the removal through `flushBuffer`
    // and runs it on a quiesced SourceBuffer (see `mse-pipe.ts`).
    void this.#appendPipe?.evictBackBuffer();
  }

  // Replays the ONE host intent a rebuilt load honors from the handshake
  // buffer: a user SEEK, rebased onto the fresh SOURCE's request id (it was
  // buffered while the host was not-ready, under the request id of the
  // superseded session). PLAY is never replayed from the buffer — it is
  // re-stated from the machine's playback choice at the ATTACH_OK boundary —
  // and PLAYHEAD of the superseded session was dropped outright while the host
  // was not-ready (see `#send`).
  #flushBufferedSeek(): void {
    const pending = this.#pending;
    this.#pending = [];
    const requestId = this.#requestId ?? nextRequestId();
    for (const message of pending) {
      if (message.type !== MainToWorkerMessageType.SEEK) continue;
      this.#post({ ...message, requestId });
    }
  }

  // Pauses and repositions an element stranded mid-`seeking` back onto
  // buffered data (or 0 when nothing is buffered) so the native `seeking` flag
  // clears and the element stops hanging in HAVE_METADATA.
  #forceClearStuckSeek(): void {
    const target = this.target;
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
  #helloMessage(): Extract<MainToWorkerMessage, { type: MainToWorkerMessageType.HELLO }> {
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
  // (the worker's restart repositions it), so common in-buffer seeks are
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

  // ---- Main-thread MSE fallback (Firefox and friends) ----

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

  #onEnded = (event: Event) => {
    const target = this.target;
    if (!target || event.target !== target) return;
    if (!this.#eventIsFromCurrentResource(target)) {
      // A dead/superseded pipeline's ended is not the active load reaching
      // EOF: never latch end-state, and stop it forwarding to host/video.js
      // ended observers. This handler is registered before the base host's
      // forwarding (see `attach`), so the stop here runs first.
      event.stopImmediatePropagation();
      return;
    }
    if (this.#machine.isRecovering) {
      // An engine-initiated teardown (recovery reload / source restart) ends
      // the old MediaSource mid-flight; that is not the user reaching EOF, so
      // it must neither latch end-state nor count as the recovered load having
      // played — the machine's own `recover.played` on an advancing playhead is
      // the only completion signal.
      return;
    }
    // Genuine end-of-stream: the active load played out. Nothing past the
    // delivered buffer will arrive, so an out-of-window seek here is provably
    // unreachable.
    this.#endedReached = true;
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
        // Correlation: an ATTACH_OK echoes the requestId of the ATTACH it
        // answers, and that ATTACH must have been posted by the CURRENT
        // handshake generation. A reply still in flight from a SUPERSEDED
        // reload carries an older id and/or an older generation — principally
        // after a newer reload started (generation bump) but before its own
        // ATTACH was posted, where the requestId alone could still match — so
        // it must not gate the session nor replay a source.
        if (
          message.requestId !== this.#attachRequestId ||
          this.#attachGenerationAtAttach !== this.#attachGeneration
        ) {
          return;
        }
        // Consumed: a second ATTACH_OK answering the same ATTACH must not
        // replay the source again.
        this.#attachRequestId = null;
        this.#attachGenerationAtAttach = null;
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
          // A user pause issued while the load was actively playing is
          // provisional: the machine retains the playing choice until the
          // next-task confirmation settles it. A reload replays the source at
          // ATTACH_OK, and the re-state decision below is computed from the
          // machine preference — so an armed pause confirmation must be
          // settled HERE, before that decision. Without it the reload would
          // re-state PLAY over the live pause and then cancel the armed
          // confirmation (in `#resetLoadState`), losing the pause for good
          // and letting a later recovery resurrect playback.
          this.#settlePauseConfirmIfArmed();
          const target = this.target as HTMLVideoElement | null;
          const shouldPlay = target !== null && (!target.paused || this.#machine.preference === 'playing');
          // The re-attach rebuilds the same source's load: recovery state
          // resets but the playback choice survives it.
          this.#machine.send({ type: hostPlaybackEvent.sourceAttach });
          this.#resetLoadState();
          // The fresh SOURCE goes out FIRST, while the host is still not-ready
          // (`#ready` flips only below): that order is what makes the reload
          // atomic — the rebuilt load is on the wire before any buffered intent
          // is re-applied, so the rebased SEEK and the re-stated PLAY below are
          // scoped to THIS load's request id, never the superseded session's.
          this.#sendSource();
          this.#ready = true;
          // Release the ONE surviving intent of the handshake window: a user
          // SEEK, rebased onto the fresh load. PLAY is never replayed from the
          // buffer (it is re-stated below from the machine's current choice),
          // and PLAYHEAD was dropped while not-ready.
          this.#flushBufferedSeek();
          if (shouldPlay) {
            // Re-stated SOLELY from the current machine playback choice (and
            // the element's live paused state), aimed at the fresh SOURCE's
            // request id so the worker honors it when that load completes —
            // a PLAY the user buffered mid-reload is never resurrected here.
            this.#post({ requestId: this.#requestId ?? nextRequestId(), type: MainToWorkerMessageType.PLAY });
          }
        } else {
          // With no source to replay, the session is simply ready.
          this.#ready = true;
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
      case WorkerToMainMessageType.ERROR: {
        // After a clear (`src = ''`) there is no active load, so a late
        // request-scoped ERROR (an abandoned load still failing) must die
        // with its request instead of surfacing on the emptied element. Only
        // errors matching the active load — or inherently global ones (no
        // request id) — stand.
        if (message.requestId !== null) {
          if (this.#requestId === null || message.requestId !== this.#requestId) return;
        }
        // The worker already exhausted its own reader retries before posting
        // this ERROR. The machine routes the failure by kind: a decode/seek
        // incident gets the retry-capped reposition-and-resume (deferred
        // behind a paused user, exhausted → MEDIA_ERR_DECODE), a
        // network/transport incident reports MEDIA_ERR_NETWORK without any
        // auto-reload, and an unsupported container stays fatal — recovery
        // decisions stay purely in the machine; the host only performs the
        // effects (restart / record a repair / report the error).
        this.#applyDecisions(
          this.#machine.send({
            kind: message.kind,
            resumeSeconds: this.#lastPlayheadSeconds,
            type: hostPlaybackEvent.loadFailed,
          }),
        );
        return;
      }
      case WorkerToMainMessageType.HANDLE: {
        if (message.requestId !== this.#requestId) return;
        const target = this.target;
        // The handle attaches on the MAIN thread even in worker mode, so the
        // ManagedMediaSource `disableRemotePlayback = true` prep must happen
        // here too — a transferred worker-MMS handle never opens otherwise.
        if (target) {
          prepareMediaElementForMse(target, this.#mseSnapshot.impl, (name) => this.#logger.child('host').debug(name));
          (target as unknown as { srcObject: unknown }).srcObject = message.handle;
        }
        // The transferred handle is now the identity of the live resource:
        // only its native events are trusted until the next load boundary.
        this.#activeHandle = message.handle;
        // The replacement resource is now live on the element; a recovery's
        // recorded position (see `#pendingReanchorSeconds`) belongs HERE, in
        // HAVE_NOTHING, not on the dead pipeline it was written before.
        this.#applyPendingReanchor(target);
        return;
      }
      case WorkerToMainMessageType.HELLO_OK: {
        // Correlation: a HELLO_OK echoes the requestId of the HELLO it
        // answers (the worker posts it synchronously while handling that HELLO
        // and MessagePort delivery is FIFO), so that requestId is the
        // provable identity of the handshake this OK belongs to. A reply
        // still in flight from an EARLIER handshake after a newer HELLO was
        // already posted carries an older id: it must neither mark the session
        // ready nor launch a seed chain for the current generation. Comparing
        // against `#helloRequestId` (the newest posted HELLO) is the safe
        // correlation — a bare read of `#attachGeneration` at arrival time
        // would misattribute such an in-flight reply (the generation advances
        // the moment the newer HELLO is posted, not when its HELLO_OK lands).
        if (message.requestId !== this.#helloRequestId) return;
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
        // The session stays NOT-ready through HELLO_OK: host-originated intent
        // buffered since `#startHandshake` is only released once the following
        // ATTACH_OK has rebuilt the load (fresh SOURCE first), so nothing can
        // reach the worker between HELLO and ATTACH_OK except the handshake
        // control flow. Readiness flips in the ATTACH_OK handler.
        // The worker's handshake public key is not secret — only enough to
        // address the APP_KEY envelopes to this worker instance. It is
        // re-published with every HELLO_OK, so a re-attach re-handshakes with
        // the key of the worker actually speaking now.
        this.#workerPublicKey = message.publicKey;
        // The handshake generation this OK belongs to: the async seed chain is
        // checked against it, so a newer reload/attach/detach/destroy started
        // while the supplies were still being read supersedes it.
        const generation = this.#attachGeneration;
        if ((this.#appKeySeedProvider || this.#sharingKeySeedProvider) && this.#workerPublicKey) {
          // #encryptAndSendSeeds only postMessages the APP_KEY envelopes after
          // awaiting the seed suppliers and the worker-key encryption, so
          // posting ATTACH synchronously here would reach the FIFO worker
          // before the envelopes — the first load would then fail #ensureSdk
          // with "No Sia SDK is available". Chain the ATTACH on the envelope
          // posts instead. That promise cannot reject: supplier/encryption
          // failures are already reported as network errors inside
          // #encryptAndSendSeed, so the session still proceeds and SOURCE
          // fails the same way it would without a seed. The buffered intent is
          // NOT flushed here — ATTACH_OK owns that release.
          void this.#encryptAndSendSeeds(this.#workerPublicKey, generation).then(() => {
            // A handshake superseded while its chain ran must not ATTACH: the
            // worker would re-attach under a stale configuration. (Each seed
            // envelope inside the chain is already generation-guarded too.)
            if (generation !== this.#attachGeneration) return;
            this.#postAttach();
          });
          return;
        }
        // Injected-SDK path: no APP_KEY envelope is ever exchanged, so ATTACH
        // goes straight out — there is nothing to order it behind, and it must
        // not wait on an async chain that does not exist for this
        // configuration. The stale-HELLO_OK exclusion above already guarantees
        // this is the current handshake. As in the seed path, the buffered
        // intent is released only at the ATTACH_OK boundary.
        this.#postAttach();
        return;
      }
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
        // A clean acknowledgement proves a load opened: announce the typed
        // load-acceptance fact exactly once per load. It says nothing about
        // playability/ready — only that the worker pipeline accepted the
        // source for the current request. On a FRESH load the
        // machine's recovery budget restarts from here; on a recovery reload
        // (the machine is still `recovering`) it is the same broken object
        // re-opening, so the budget stays in place until that load genuinely
        // plays — which is what keeps a persistently broken object from
        // looping at attempt=1 forever.
        this.#acceptLoad();
        // The same accepted load opens the source-info window, exposing the
        // exact `SourceInfo` the worker vouched for (exactly once, guarded
        // like acceptance). No protocol change: it is the existing
        // `message.info` payload, just surfaced — not playability.
        this.#openSourceInfo(message.info);
        this.#machine.send({ type: hostPlaybackEvent.sourceReady });
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

  // A native media-element failure — the live trail is `MEDIA_ERR_SRC_NOT_SUPPORTED`
  // (4) whose message names `PIPELINE_ERROR_COULD_NOT_RENDER`, i.e. the element's
  // worker MediaSource died under it — must not treat every fatal-looking event as
  // a reason to reboot the stream. An explicitly paused video stays paused and
  // idle: one repair is recorded and runs on the next explicit play/seek. A
  // playing load gets the same retry-capped reposition-and-resume as a worker
  // decode ERROR, and a raw native `error` is only ever reported through
  // #reportError (with a proper MediaError), never as the generic forwarded event.
  #onNativeError = (event: Event) => {
    const target = this.target;
    if (!target || event.target !== target) return;
    // The base host forwards a native `error` onto this element's error
    // listeners as an unlabeled event whenever one exists. This handler runs
    // ahead of that forwarding and stops it: the failure is classified below
    // instead, so an idle-paused or replaced resource's stale event never
    // surfaces as a fatal UI error, and recovery completion/exhaustion reports
    // through #reportError.
    event.stopImmediatePropagation();
    if (this.#destroyed || !this.#src) return;
    // A native element failure (the `MEDIA_ERR_SRC_NOT_SUPPORTED` /
    // `PIPELINE_ERROR_COULD_NOT_RENDER` trail) from a dead or replaced
    // resource. The machine classifies it: while a recovery is in flight or a
    // repair is already owed it is the same incident's echo and is ignored;
    // paused with nothing owed it records one repair; otherwise the load is
    // repaired eagerly, within the retry cap.
    this.#applyDecisions(
      this.#machine.send({ resumeSeconds: target.currentTime, type: hostPlaybackEvent.nativeError }),
    );
  };

  #onPause = (event: Event) => {
    const target = this.target;
    if (!target || event.target !== target) return;
    // A dead/superseded resource's incidental pause (the teardown clamp) is
    // engine work, not the user stopping — the machine's playback choice must
    // survive it.
    if (!this.#eventIsFromCurrentResource(target)) return;
    if (this.#machine.isRecovering) {
      // The engine is replacing the pipeline (decode recovery / external-seek
      // restart); the incidental native pause that surfaces during teardown is
      // engine work, not the user stopping — the machine leaves the playback
      // choice unchanged.
      return;
    }
    // A PLAYING load's pause is provisional: video.js fires a native pause
    // before `seeking` on a far scrub, so the machine stays in `pausepending`
    // (retaining the playing choice) and the host schedules a next-task
    // `pause.confirmed`. A pause on an already-paused / never-started load is
    // final — no window to confirm.
    const wasPlaying = this.#machine.preference === playbackPreference.playing;
    this.#machine.send({ type: hostPlaybackEvent.pause });
    if (wasPlaying) this.#schedulePauseConfirm();
  };

  #onPlay = (event: Event) => {
    const target = this.target;
    if (!target || event.target !== target) return;
    // A play supersedes any outstanding provisional pause (the seek's resume,
    // or the user pressing play): playing wins without waiting for the confirm.
    this.#cancelPauseConfirm();
    // The user asked to play. If a repair is owed the machine consumes it:
    // restart at the owed position with PLAY (the ONE recovery trigger that
    // may auto-resume, because the user asked to play). Otherwise the machine
    // just records the choice and the host forwards the ordinary PLAY.
    const decisions = this.#machine.send({ type: hostPlaybackEvent.play });
    if (this.#applyDecisions(decisions)) return;
    // Deferred playback start (preload 'metadata'/'none'): first play (or a
    // user seek) triggers streaming.
    this.#send({ requestId: this.#requestId ?? nextRequestId(), type: MainToWorkerMessageType.PLAY });
  };

  #onSeeked = (event: Event) => {
    const target = this.target;
    if (!target || event.target !== target) return;
    this.#cancelPauseConfirm();
    this.#cancelSeekWatchdog();
    // If the machine was mid-recovery as a seek restart, its repositioning
    // seek resolving closes the window and restores the budget; a decode
    // recovery's incidental repositioning seek resolving changes nothing (the
    // machine knows which kind of recovery is in flight).
    this.#machine.send({ type: hostPlaybackEvent.seekResolved });
    // A seek-restart that resolved leaves the recovery window: echo the close
    // to the typed event (a decode recovery's seeked changes nothing).
    this.#endRecoveryObservationIfMachineLeft();
  };

  #onSeeking = (event: Event) => {
    const target = this.target;
    if (!target || event.target !== target) return;
    // A scrub supersedes a provisional pause (the far-seek case: this `seeking`
    // IS the event the incidental `pause` was leading to, so it must not later
    // settle as a user stop). Cancelled before the recovery guard so the
    // repositioning seek of an in-flight recovery also clears any stale handle.
    this.#cancelPauseConfirm();
    // A recovery reload positions the element at its target, which shows up as
    // a native `seeking` here; the recovery already issued the SEEK + watchdog
    // it needs, so re-entering the out-of-window check would only double-send
    // and double-set (or worse, restart once more).
    if (this.#machine.isRecovering) return;
    const seekSeconds = target.currentTime;
    // The load's pipeline died while the user was paused and a repair is
    // owed. This native seek is the user actively scrubbing the dead
    // resource: the machine consumes the owed repair NOW at the new target,
    // restoring the position without starting playback.
    if (this.#machine.repairOwed !== null) {
      this.#applyDecisions(this.#machine.send({ seconds: seekSeconds, type: hostPlaybackEvent.seek }));
      return;
    }
    if (this.#isOutOfWindowSeek(seekSeconds, nativeBufferedEnd(target))) {
      // The target can never be satisfied by this load (past the vouched
      // duration, or past the delivered buffer once the source ended). A bare
      // SEEK would leave the element in `seeking` / HAVE_METADATA forever, so
      // restart the source at the target instead — the same remedy as decode
      // recovery, retry-capped, with the stall watchdog as backstop.
      this.#applyDecisions(
        this.#machine.send({ seconds: seekSeconds, type: hostPlaybackEvent.seekOutOfWindow }),
      );
      return;
    }
    // A seek supersedes the current position: drop chunks still queued for it
    // and (once quiesced) reset the SourceBuffer's segment parser so the
    // worker's fresh fragment parses clean instead of continuing the tail the
    // seek cut off mid-fragment (Chromium's RunSegmentParserLoop failure).
    // The reset carries the target so the main-thread buffer is repositioned
    // to the sought position (the trimmed output's timestamps rebase to zero).
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
    // A native timeupdate from a dead/superseded resource (its playhead still
    // advancing and then clamping while the fresh resource has not attached)
    // must not move the playhead, send PLAYHEAD, close recovery, restore the
    // budget, or announce a recovery end.
    if (!this.#eventIsFromCurrentResource(target)) return;
    const now = target.currentTime;
    // A recovery reload that is genuinely playing advances the playhead again;
    // only that proves "the load actually played", so the machine restores the
    // consecutive-recovery budget. A stalled reload emits no advancing
    // timeupdate at all, keeping its count busy and the loop bounded.
    if (this.#machine.isRecovering && now > this.#lastPlayheadSeconds + 0.05) {
      this.#logger.child('host').info('recovery.played', { at: 'timeupdate' });
      this.#machine.send({ type: hostPlaybackEvent.recoverPlayed });
    }
    // A load that genuinely played again leaves the recovery window: echo the
    // close to the typed event (a no-op when nothing is open).
    this.#endRecoveryObservationIfMachineLeft();
    // Keep the newest position the host forwarded: decode/seek recovery
    // repositions the reloaded source back here.
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

  // Announces the ACTIVE load's source information exactly once (the "no
  // duplicate open" guard), aligned with `#acceptLoad`: the same SOURCE_OK
  // that opens acceptance opens the source-info window, exposing the exact
  // `SourceInfo` the worker vouched for on the wire (no protocol change, no
  // reshaped metadata). It does NOT mean playable/ready, and
  // `durationSeconds` may be null. A duplicate ack of the same load never
  // re-announces.
  #openSourceInfo(info: SourceInfo): void {
    if (this.#sourceInfoNotified) return;
    this.#sourceInfoNotified = true;
    this.#emitSourceInfoDetail({ active: true, info });
  }

  #post(message: MainToWorkerMessage): void {
    if (!this.#worker) return;
    this.#worker.postMessage(message);
    if (message.type === MainToWorkerMessageType.SOURCE) this.#requestId = message.requestId;
    this.#logRequest(message);
  }

  // Posts the session's ATTACH and records the correlation a valid ATTACH_OK
  // must match: the ATTACH's requestId AND the handshake generation it was
  // posted under. The generation half is essential — after a newer reload
  // starts (generation bump) its ATTACH may not be posted yet, so a stale
  // ATTACH_OK could still echo the newest requestId for a window; the
  // generation check closes that race.
  #postAttach(): void {
    const requestId = nextRequestId();
    this.#attachRequestId = requestId;
    this.#attachGenerationAtAttach = this.#attachGeneration;
    this.#post({ requestId, type: MainToWorkerMessageType.ATTACH });
  }

  #reportError(kind: WorkerErrorCode, context?: string): void {
    if (this.#destroyed) return;
    // A fatal error ends all recovery ambitions: no unresolved seek needs a
    // watchdog any longer and no fresh resource will arrive to apply a
    // recorded position. (The machine, not the host, now owns the recovery
    // window and has already moved to its `failed` state.)
    // A terminally-failed recovery leaves the window: echo the close to the
    // typed event (a fresh-network error outside a recovery is a no-op).
    this.#endRecoveryObservationIfMachineLeft();
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

  // Resets the announced load-acceptance to false exactly once (the "no
  // duplicate false" guard): a load boundary / lifecycle end only announces
  // the reset when a load had actually been accepted.
  #resetLoadAcceptance(): void {
    if (!this.#loadAccepted) return;
    this.#loadAccepted = false;
    this.#emitLoadDetail({ accepted: false });
  }

  // Drops HOST-owned pipeline facts attached to the previously played source
  // and announces the load boundary with the native `emptied` event. This is
  // the fresh/load/ATTACH_OK boundary. Recovery state (attempts, owed repair,
  // playback choice) belongs to the Robot3 machine, which the callers update
  // with their own events; a re-attach keeps the playback choice, a fresh
  // source/load drops it all.
  #resetLoadState(): void {
    this.#error = null;
    // A load boundary supersedes any provisional pause (fresh source / explicit
    // load / re-attach / recovery teardown): no stale confirmation may settle a
    // pause on the new load. The machine's source events cover the choice.
    this.#cancelPauseConfirm();
    // This load-boundary helper only drops HOST-owned facts: error, per-load
    // window (duration/buffered end/ended), seek watchdog, position memory,
    // request id, and main-thread MSE state. Recovery bookkeeping (attempts,
    // owed repair, playback choice) lives in the Robot3 machine, which the
    // callers update with their own `source.set` / `source.attach` /
    // `source.ready` events.
    // A fresh/load/ATTACH_OK boundary supersedes any recovery: no recorded
    // position from the old load may reach the new one (the restart helper
    // sets its own position again AFTER this reset).
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
    this.#requestId = null;
    // The old resource's identity dies with the load BEFORE the replaced
    // resource's events arrive: native events are trusted again only once the
    // fresh HANDLE / object URL actually attaches.
    this.#activeHandle = null;

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
    // A source boundary (fresh source / reset / re-attach) supersedes any
    // in-flight recovery: echo the close to the typed event before the new
    // load can announce its own. A restart's own teardown keeps the window
    // open (the machine is still `recovering` there).
    this.#endRecoveryObservationIfMachineLeft();
    // The load boundary also resets load acceptance (exactly once, only when
    // a load had actually been accepted), so the fresh SOURCE_OK can re-open.
    this.#resetLoadAcceptance();
    // The same boundary closes the source-info window (exactly once, only when
    // a window was actually open), so a stale `info` never crosses into the
    // fresh load and the fresh SOURCE_OK can re-open it.
    this.#resetSourceInfo();
    this.dispatchEvent(new Event('emptied'));
  }

  // Resets the announced source-info window to closed exactly once (the "no
  // duplicate close" guard): a load boundary / lifecycle end only announces
  // the close when a window had actually been open, so a stale `info` never
  // leaks past the boundary. The close detail carries no `info`.
  #resetSourceInfo(): void {
    if (!this.#sourceInfoNotified) return;
    this.#sourceInfoNotified = false;
    this.#emitSourceInfoDetail({ active: false });
  }

  // Shared body of an automatic reload/restart (decode recovery, an owed
  // repair consumed by play/seek, or an out-of-window / stalled-seek restart):
  // a fresh SOURCE (new request id) torn down like any new load, then the
  // worker-side SEEK that trims the fresh conversion at the resume point (the
  // worker records the target through its own `pendingSeekTarget` flow), and
  // PLAY only when the machine decided playback may resume. The ELEMENT is
  // positioned purely through `#pendingReanchorSeconds`, which
  // `#applyPendingReanchor` applies at the replacement-resource attach —
  // readyState HAVE_NOTHING for the fresh resource, where a currentTime write
  // sets the native default playback start position the fresh load honors.
  //
  // WHY no eager `target.currentTime = ...` here: by the time a restart runs,
  // the OLD load's worker has already torn down its MediaSource — only
  // SourceBuffer removed, duration NaN, `seekable` empty — yet the element
  // still reports the OLD cached duration (e.g. 3919.08s) while readyState ≥
  // HAVE_METADATA. Writing `currentTime` there is a REAL seek, not the
  // HAVE_NOTHING position: Chromium clamps it into the cached stream end (the
  // observed `seeked 3919.08s` → spurious `ended` → emptied/loadstart
  // cascade). So the host never writes currentTime before the fresh resource
  // exposes a usable state; the position write at attach IS that usable state.
  #restartSource(decision: Extract<HostDecision, { kind: typeof hostDecisionKind.restartSource }>): void {
    const attempt = this.#machine.attempt;
    this.#logger.child('host').warn('recovery.restart', {
      attempt,
      play: decision.wantsPlay,
      reason: decision.reason,
      resumeSeconds: decision.resumeSeconds,
    });
    // Announce the recovery window exactly once: a continued restart of the
    // SAME incident (e.g. a watchdog-stalled seek restart) does not re-open it.
    if (!this.#recoveryNotified) {
      this.#recoveryNotified = true;
      this.#emitRecoveryDetail({
        active: true,
        reason: decision.reason,
        resumeSeconds: decision.resumeSeconds,
        wantsPlay: decision.wantsPlay,
      });
    }
    // The restart runs the same teardown a new src/load() performs. The
    // machine already consumed the attempt and opened its recovery window, so
    // the target position must be re-recorded after the reset (a stalled load
    // emits no further timeupdate to re-capture it).
    this.#resetLoadState();
    this.#lastPlayheadSeconds = decision.resumeSeconds;
    this.#sendSource();
    // Record the element position for the fresh resource's attach (see the WHY
    // above); `#onSeeking` re-entrance from the eventual native seek is
    // suppressed while the machine is recovering.
    this.#pendingReanchorSeconds = decision.resumeSeconds;
    const requestId = this.#requestId ?? nextRequestId();
    // The fresh source is positioned at the position the user was watching —
    // position 0 for a source the host never played yet — and only resumed
    // when the machine decided playback may resume. A paused element stays
    // paused: the recovery repairs the load, it does not start playback the
    // user never asked for.
    this.#send({ requestId, time: decision.resumeSeconds, type: MainToWorkerMessageType.SEEK });
    if (decision.wantsPlay) {
      this.#send({ requestId, type: MainToWorkerMessageType.PLAY });
    }
    // A seek restart must re-buffer the target; the stall watchdog re-checks
    // after a fresh interval and re-enters the machine (or its exhaust branch)
    // if the seek still has not resolved.
    if (decision.reason === recoveryReason.seek) {
      this.#armSeekWatchdog();
    }
  }

  // Arms the next-task confirmation for a provisional pause (see `#pauseConfirm`).
  // Called by `#onPause` when a playing load pauses, it settles the retained
  // playing choice to paused unless a seek/play/load boundary cancels first.
  #schedulePauseConfirm(): void {
    this.#cancelPauseConfirm();
    this.#pauseConfirm = setTimeout(() => this.#settlePauseConfirmIfArmed(), 0);
  }

  #send(message: MainToWorkerMessage): void {
    if (!this.#worker) return;
    if (!this.#ready) {
      // While the session is negotiating (initial attach / re-attach / reload
      // window, i.e. between HELLO and ATTACH_OK) host-originated intent must
      // not leak into the stale session's request flow. SEEK is buffered (the
      // ATTACH_OK boundary rebases it onto the fresh load), while PLAYHEAD
      // belongs to a playhead that is NOT the current load's and is dropped
      // outright so a rebuilt session never replays a stale position.
      if (message.type === MainToWorkerMessageType.PLAYHEAD) return;
      this.#pending.push(message);
      return;
    }
    this.#post(message);
  }

  // Every SOURCE posts through here — a fresh `src`, an explicit `load()`,
  // an ATTACH_OK replay, and a recovery restart — so it is the single choke
  // point for the fail-fast device gate: a runtime whose MSE surface is not
  // standard or managed-implementing (no MSE at all, or only the legacy
  // WebKit-prefixed one) is device-too-old and reports the honest `device`
  // error immediately instead of paying a worker roundtrip that can only end
  // in a generic unsupported error.
  #sendSource(): void {
    const impl = this.#mseSnapshot.impl;
    if (impl === mseImplementation.none || impl === mseImplementation.webkitLegacy) {
      this.#reportError(workerErrorCode.device, 'no-mse');
      return;
    }
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

  // Settles an armed provisional pause confirmation NOW, without waiting for
  // the next-task timer: cancels the pending handle and reports
  // `pause.confirmed` to the machine so the retained playing choice becomes
  // paused. No-op when no confirmation is armed. Shared by the timer callback
  // (`#schedulePauseConfirm`) and by the ATTACH_OK boundary, where the reload
  // would otherwise re-state PLAY from the still-retained playing choice and
  // then cancel the armed confirmation in `#resetLoadState` — losing the user's
  // live pause (and letting a later recovery resurrect playback).
  #settlePauseConfirmIfArmed(): void {
    if (this.#pauseConfirm === null) return;
    this.#cancelPauseConfirm();
    // The window closed with no seek in between: the pause was deliberate. In
    // `pausepending` this settles the retained playing choice to paused;
    // anywhere else (already superseded by a seek/play) it is a no-op.
    this.#applyDecisions(this.#machine.send({ type: hostPlaybackEvent.pauseConfirmed }));
  }

  // Posts a fresh HELLO (the only message that re-negotiates the session) and
  // records the correlation state that makes a concurrent re-handshake safe:
  //   - bumps `#attachGeneration`, so an async seed/encryption chain captured
  //     under an older generation is dropped when it completes — a stale chain
  //     must never post its APP_KEY/ATTACH after a newer reload, detach, or
  //     destroy;
  //   - remembers the HELLO's requestId as `#helloRequestId`, so only the
  //     HELLO_OK that actually answers THIS HELLO can act (HELLO_OK echoes the
  //     HELLO's requestId; a reply still in flight from an older HELLO carries
  //     an older id and is discarded, never misattributed to this handshake);
  //   - re-opens a NOT-ready window: host-originated traffic is held back
  //     (SEEK buffered, PLAYHEAD dropped, see `#send`) until the ATTACH_OK that
  //     re-establishes the session, so a reload is atomic — nothing issued
  //     mid-handshake reaches the worker before the rebuilt load exists;
  //   - clears the previous handshake's ATTACH correlation and any intent still
  //     buffered from a SUPERSEDED handshake's window — a repeated reload can
  //     never resurrect the prior window's traffic (only the newest handshake's
  //     buffer survives to its own ATTACH_OK).
  #startHandshake(): void {
    this.#attachGeneration += 1;
    this.#ready = false;
    this.#pending = [];
    this.#attachRequestId = null;
    this.#attachGenerationAtAttach = null;
    this.#helloRequestId = null;
    const hello = this.#helloMessage();
    this.#helloRequestId = hello.requestId;
    this.#post(hello);
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
function nativeBufferedEnd(target: HTMLVideoTargetLike): number {
  const buffered = target.buffered;
  if (buffered.length === 0) return 0;
  return buffered.end(buffered.length - 1);
}
