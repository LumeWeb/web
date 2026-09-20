/**
 * `SessionCoordinator` / `WorkerComposition`: the worker composition-root seam
 * that wires the session pieces into one protocol-compatible adapter:
 *
 *   `ContainerClassifier` (+ ordered `IndexBuilder[]`, default sidx)
 *     → `LoadPipeline` (classify → best-effort index → codec check → producer)
 *     → `StreamController` (start/seek/playhead, epochs, EOS)
 *     → `AppendSink` (default: main-mode CHUNK poster)
 *   plus `Clock`, `ErrorReporter` (protocol ERROR mapping), and the handshake
 *   seam (`HELLO`/`APP_KEY`), all behind injected interfaces.
 *
 * Responsibilities: protocol validation via the existing
 * `MainToWorkerMessage` types, handshake/app-key lifecycle, request IDs and
 * source replacement (epoch discipline), attach/detach/destroy, and creating
 * and disposing one load/session graph (one `StreamController` per accepted
 * load).
 *
 * The coordinator is Sia-free: everything below runs against injected fakes
 * with no SDK and no MSE. `createSource` is where a call site binds the real
 * Sia transport + SDK, and worker-mode MSE is supplied through `sinkFactory`.
 *
 * Protocol compatibility: outbound messages are the existing
 * `WorkerToMainMessage` shapes (`HELLO_OK`, `ATTACH_OK`, `SOURCE_OK`,
 * `CHUNK`, `ENDED`, `ERROR`), the capability fields on `SOURCE_OK.info` stay
 * optional, and no protocol message is renamed.
 */

import type { ContainerClassifier } from '../capabilities/container-classifier.ts';
import { createContainerClassifier } from '../capabilities/container-classifier.ts';
import type { PlaybackCapabilities } from '../capabilities/browser-capabilities.ts';
import { detectBrowserCapabilities } from '../capabilities/browser-capabilities.ts';
import type { IndexBuilder } from '../container/index/random-access-index.ts';
import { createIndexBuilderRegistry } from '../container/index/index-builder.ts';
import {
  type Mp4RuntimeProbe,
  probeProgressiveMp4,
} from '../container/engine/mp4-runtime-probe.ts';
import { ProgressiveMp4ProducerStrategy } from '../container/producer/progressive-mp4-producer-strategy.ts';
import {
  PassthroughProducerStrategy,
  ProducerFactoryRegistry,
  ProducerUnavailableError,
  producerVerdict,
  TsToFmp4ProducerStrategy,
  WebmNativeProducerStrategy,
} from '../container/producer/producer-factory.ts';
import type { ProducedSegment } from '../container/producer/appendable-producer.ts';
import {
  decryptAppKeyEnvelope,
  exportWorkerPublicKey,
  generateWorkerKeyPair,
  scrub,
  type WorkerKeyPair,
} from '../app-key-handshake.ts';
import {
  type AppKeyEnvelope,
  type MainToWorkerMessage,
  PROTOCOL_VERSION,
  type RequestId,
  type WorkerConfig,
  workerErrorCode,
  type WorkerErrorCode,
  workerMode,
  type WorkerMode,
  workerMsePreference,
  type WorkerToMainMessage,
} from '../protocol.ts';
import type { ByteSource } from '../transport/byte-source.ts';
import { ByteSourceSupersededError } from '../transport/byte-source.ts';
import type { AppendSink } from '../sink/append-sink.ts';
import type { Clock } from './clock.ts';
import { wallClock } from './clock.ts';
import { createErrorReporter, type ErrorReporter } from './error-reporter.ts';
import { createLoadPipeline, type LoadPipeline, type LoadResult } from './load-pipeline.ts';
import { sourceInfoFor } from './source-capabilities.ts';
import {
  createStreamController,
  type StreamController,
  type StreamLoad,
  streamState,
} from './stream-controller.ts';

/** Outbound protocol channel (same shape as the worker's `PostMessage`). */
export type PostMessage = (message: WorkerToMainMessage, transfer?: Transferable[]) => void;

/** Bounded probe read before the classifier decides (mirrors `HEAD_PROBE_LENGTH`). */
const DEFAULT_HEAD_PROBE_LENGTH = 4096;

/** The seam the worker entry will eventually install (`handleMessage` FSM). */
export interface SessionCoordinator {
  /** Permanently stops the coordinator; later messages are ignored. */
  destroy(): void;
  /** Processes one validated main→worker message. */
  handleMessage(message: MainToWorkerMessage): Promise<void>;
  /** Whether this coordinator feeds MSE itself ('worker') or posts CHUNKs ('main'). */
  readonly mode: WorkerMode;
}

/**
 * Everything the composition root needs to build a coordinator. Concrete
 * implementations of the seams are defaults (registered here), so only
 * `createSource` and `post` are truly required; tests inject fakes.
 */
export interface SessionCoordinatorDeps {
  /** Browser capability snapshot for the MSE/codec checks (default: detect). */
  readonly capabilities?: PlaybackCapabilities;
  /** Container classifier (default: `createContainerClassifier()`). */
  readonly classifier?: ContainerClassifier;
  /** Injectable time (default: `wallClock()`). */
  readonly clock?: Clock;
  /**
   * Resolves one SOURCE locator into a `ByteSource`. Sia in production (via
   * the SDK); `MemoryByteSource` in tests. Errors → network ERROR.
   */
  readonly createSource: (src: string) => Promise<ByteSource>;
  /** Handshake for `HELLO`/`APP_KEY` (default: `createSessionHandshake()`). */
  readonly handshake?: SessionHandshake;
  /** Bounded head-probe length fed to the classifier (default 4096). */
  readonly headProbeLength?: number;
  /** Ordered best-effort index builders (default: sidx registry). */
  readonly indexBuilders?: readonly IndexBuilder[];
  /** Forward lookahead seconds handed to each session's controller. */
  readonly lookaheadSeconds?: number;
  /**
   * Bounded Mediabunny runtime probe for progressive-MP4 loads (default:
   * `probeProgressiveMp4`). The engine is the single probe path — there is no
   * selection step and nothing to branch on — so absence only matters for tests
   * that want to observe a pipeline with probing disabled.
   */
  readonly mp4Probe?: Mp4RuntimeProbe;
  /**
   * Called whenever the active load/session graph is abandoned — superseded by
   * a new SOURCE, or stopped by DETACH/DESTROY. The production composition
   * root uses it to tear the worker-side MSE root down immediately (release
   * the MediaSource + SourceBuffer a load opened) instead of leaving the stale
   * handle allocated until the next load's `sinkFactory` happens to reset it.
   * Optional; main-mode posting and non-MSE roots ignore it.
   */
  readonly onAbandon?: () => void;
  /**
   * Reflects the validated media playhead (from PLAYHEAD/SEEK) to a worker-MSE
   * root, which derives the pipe's back-buffer eviction boundary from it.
   * Optional; main-mode posting and non-MSE sinks ignore it.
   */
  readonly onPlayhead?: (timeSeconds: number) => void;
  /** Outbound protocol channel. */
  readonly post: PostMessage;
  /**
   * Producer registry whose `select` exposes the winning reason. Defaults to
   * the ladder (passthrough → TS remux).
   */
  readonly producerFactory?: ProducerFactoryRegistry;
  /**
   * Builds the per-load `AppendSink`. Defaults to a main-mode CHUNK poster;
   * worker-mode MSE (a `MseAdapter` over the worker MediaSource pipe) is
   * supplied by the production composition root. Receives the load context
   * (MIME/duration/request id) so an MSE-backed sink can open its own
   * SourceBuffer for exactly that load.
   */
  readonly sinkFactory?: (context: SinkFactoryContext) => AppendSink;
  /** Controller-level stall timeout (0 disables; Sia owns its own watchdog). */
  readonly stallTimeoutMs?: number;
  /** Worker-MSE capability check; false in node, true where `canConstructInDedicatedWorker`. */
  readonly supportsWorkerMse?: () => boolean;
}

/**
 * The `HELLO`/`APP_KEY` handshake seam. The coordinator routes those two
 * protocol messages here and posts `HELLO_OK`/`ERROR` around the result, so
 * handshake crypto stays isolated and tests inject a fake.
 */
export interface SessionHandshake {
  /** Validates/consumes one `APP_KEY` envelope; throws on rejection (→ network ERROR). */
  acceptAppKey(envelope: AppKeyEnvelope): Promise<void> | void;
  /** Active HELLO `WorkerConfig`, once one was received; undefined before/after clear. */
  readonly config?: undefined | WorkerConfig;
  /** Releases held connection credentials (scrubs a held app-key seed); optional. */
  dispose?(): void;
  /**
   * Returns the worker's static public half for `HELLO_OK`. When a HELLO
   * `WorkerConfig` is supplied and differs from the active one, the held
   * app-key seed is dropped (a config change invalidates the connection), so
   * `seed` only ever describes the active connection.
   */
  hello(requestId: RequestId, config?: WorkerConfig): { readonly publicKey: Uint8Array };
  /** Decrypted app-key seed of the active connection, or null until one is validated. */
  readonly seed?: null | Uint8Array;
}

/**
 * Per-load context handed to `sinkFactory` when the coordinator creates each
 * session's `AppendSink`. MSE-backed sinks need the produced MIME and duration
 * to open their own SourceBuffer, and the accepted load's request id to scope
 * `HANDLE`/errors to — none of which a zero-argument factory could observe.
 */
export interface SinkFactoryContext {
  /** Media duration in seconds, when the pipeline can vouch for one, else null. */
  readonly durationSeconds: null | number;
  /** MSE-ready MIME type for this load's SourceBuffer. */
  readonly mime: string;
  /** The accepted load's request id; the sink's HANDLE/errors scope to it. */
  readonly requestId: RequestId;
}

/** One accepted load: the bound stream graph plus its wire context. */
interface CompositionSession {
  /** Session-scoped stream controller; created once the load is accepted. */
  controller: null | StreamController;
  readonly load: StreamLoad;
  readonly requestId: RequestId;
  started: boolean;
}

/**
 * Default `SessionCoordinator` implementation: the tested composition root
 * described in the module docstring. Instances are protocol-compatible with
 * the existing worker; the worker entry installs one as its composition
 * root.
 */
export class WorkerComposition implements SessionCoordinator {
  get mode(): WorkerMode {
    return this.#mode;
  }

  readonly #clock: Clock;
  readonly #createSource: (src: string) => Promise<ByteSource>;
  #destroyed = false;
  readonly #errorReporter: ErrorReporter;
  readonly #handshake: SessionHandshake;
  readonly #headProbeLength: number;
  #loadEpoch = 0;
  readonly #loadPipeline: LoadPipeline;
  readonly #lookaheadSeconds: number | undefined;
  // Default 'main' is safe until `#selectMode()` (called in the constructor,
  // then on every HELLO) picks the session's actual MSE site.
  #mode: WorkerMode = workerMode.main;
  readonly #mp4Probe: Mp4RuntimeProbe;
  readonly #onAbandon: (() => void) | undefined;
  readonly #onPlayhead: ((timeSeconds: number) => void) | undefined;
  #pendingSeekTime: number | undefined = undefined;
  #playRequested = false;
  readonly #post: PostMessage;
  #requestId: null | RequestId = null;
  #session: CompositionSession | null = null;
  readonly #sinkFactory: (context: SinkFactoryContext) => AppendSink;
  #source: ByteSource | null = null;
  readonly #stallTimeoutMs: number | undefined;
  readonly #supportsWorkerMse: () => boolean;

  constructor(deps: SessionCoordinatorDeps) {
    const capabilities = deps.capabilities ?? detectBrowserCapabilities();
    const classifier = deps.classifier ?? createContainerClassifier();
    this.#clock = deps.clock ?? wallClock();
    this.#createSource = deps.createSource;
    this.#handshake = deps.handshake ?? createSessionHandshake();
    this.#headProbeLength = deps.headProbeLength ?? DEFAULT_HEAD_PROBE_LENGTH;
    this.#lookaheadSeconds = deps.lookaheadSeconds;
    this.#mp4Probe = deps.mp4Probe ?? probeProgressiveMp4;
    this.#supportsWorkerMse = deps.supportsWorkerMse ?? defaultSupportsWorkerMse;
    this.#selectMode();
    this.#onAbandon = deps.onAbandon;
    this.#onPlayhead = deps.onPlayhead;
    this.#post = deps.post;
    this.#sinkFactory = deps.sinkFactory ?? (() => createPostingSink(this.#post, this.#requestId ?? 0));
    this.#stallTimeoutMs = deps.stallTimeoutMs;

    this.#errorReporter = createErrorReporter((report) => {
      // Failures are scoped to the load that produced them; cancelled drops
      // never reach here (createErrorReporter filters them).
      this.#postError(report.kind, this.#requestId, report.context);
    });

    this.#loadPipeline = createLoadPipeline({
      capabilities,
      classifier,
      indexBuilders: deps.indexBuilders ?? createIndexBuilderRegistry(),
      mp4Probe: this.#mp4Probe,
      producerFactory:
        deps.producerFactory ??
        // The progressive-MP4 mediabunny strategy is registered FIRST so a
        // progressive-MP4 load is served by the normalized refragmenter
        // (mediabunny is the only engine; there is no check to fall through), while
        // passthrough/TS still win for the containers they serve.
        new ProducerFactoryRegistry([
          new ProgressiveMp4ProducerStrategy(),
          new PassthroughProducerStrategy(),
          new TsToFmp4ProducerStrategy(),
          // Native-WebM strategy is wired unconditionally: WebM appends as-is
          // wherever the browser's MSE supports the object's codecs, so there
          // is no feature check to wait on.
          new WebmNativeProducerStrategy(),
        ]),
    });
  }

  /** Stops all reads and drops pipeline state; the coordinator cannot be re-attached. */
  destroy(): void {
    if (this.#destroyed) return;
    this.#destroyed = true;
    this.#abandonLoad();
    this.#pendingSeekTime = undefined;
    this.#playRequested = false;
    // Release any connection credential the handshake held (scrubs the
    // decrypted app-key seed) now that no load can ever read through it.
    this.#handshake.dispose?.();
  }

  /** Handles one protocol message; failures post `ERROR`, never a rejected promise. */
  async handleMessage(message: MainToWorkerMessage): Promise<void> {
    if (this.#destroyed) return;

    try {
      switch (message.type) {
        case 'APP_KEY':
          await this.#handshake.acceptAppKey(message.envelope);
          return;
        case 'ATTACH':
          this.#post({ mode: this.#mode, requestId: message.requestId, type: 'ATTACH_OK' });
          return;
        case 'DESTROY':
          this.destroy();
          return;
        case 'DETACH':
          this.#abandonLoad();
          this.#playRequested = false;
          this.#pendingSeekTime = undefined;
          return;
        case 'HELLO': {
          const { publicKey } = this.#handshake.hello(message.requestId, message.config);
          // A host `workerMse: 'main'` preference overrides the runtime
          // capability check for this session (auto keeps runtime feature-detection). HELLO
          // arrives before ATTACH, so HELLO_OK's `features.workerMse` and the
          // subsequent ATTACH_OK both reflect the host's selection.
          this.#selectMode(message.config);
          this.#post({
            features: { workerMse: this.#mode === workerMode.worker },
            publicKey,
            requestId: message.requestId,
            type: 'HELLO_OK',
            version: PROTOCOL_VERSION,
          });
          return;
        }
        case 'PLAY':
          this.#playRequested = true;
          this.#startStreaming();
          return;
        case 'PLAYHEAD':
          this.#handlePlayhead(message.requestId, message.time);
          return;
        case 'SEEK':
          this.#handleSeek(message.time);
          return;
        case 'SOURCE':
          await this.#handleSource(message.requestId, message.src, message.mimeType, message.preload);
          return;
      }
    } catch (error) {
      const requestId = message.type === 'SOURCE' || message.type === 'SEEK' ? message.requestId : null;
      this.#postError(workerErrorCode.network, requestId, describeError(error));
    }
  }

  // Tears down the current load/session graph (source, sink, controller) so a
  // replacement load or a detach can never inherit stale pipeline state. The
  // onAbandon hook then lets the composition root release any external per-load
  // state (the worker MediaSource + SourceBuffer) immediately — never a stale
  // handle waiting for the next load's sinkFactory to reset it.
  #abandonLoad(): void {
    const session = this.#session;
    this.#session = null;
    if (session) session.controller?.destroy();
    const source = this.#source;
    this.#source = null;
    source?.cancel();
    this.#requestId = null;
    this.#onAbandon?.();
  }

  #controllerFor(session: CompositionSession): StreamController {
    const current = session.controller;
    if (current && current.state !== streamState.destroyed && current.state !== streamState.ended && current.state !== streamState.failed) {
      return current;
    }
    const fresh = this.#newController(session);
    session.controller = fresh;
    return fresh;
  }

  // PLAYHEAD is only meaningful for the ACTIVE load at a valid clock position:
  // a stale request id (a previous load's straggler) or a malformed time must
  // not drive eviction/lookahead on the current session. This mirrors the
  // current worker's `#handlePlayhead` guard exactly.
  #handlePlayhead(requestId: RequestId, time: number): void {
    if (requestId !== this.#requestId || !Number.isFinite(time) || time < 0) return;
    this.#onPlayhead?.(time);
    this.#session?.controller?.playhead(time);
  }

  // SEEK with an active session: bind the load if streaming has not begun yet
  // (the synchronous seek supersedes that initial run), then re-pump from the
  // seek floor. A terminal/failed controller is re-created for the same graph.
  // A malformed time is dropped before it can park intent or re-pump the
  // controller, matching the current worker's `#handleSeek` guard.
  #handleSeek(timeSeconds: number): void {
    if (!Number.isFinite(timeSeconds) || timeSeconds < 0) return;
    this.#onPlayhead?.(timeSeconds);
    const session = this.#session;
    if (!session) {
      // Parked seek: start streaming once the deferred load resolves.
      this.#pendingSeekTime = timeSeconds;
      this.#startStreaming();
      return;
    }
    this.#pendingSeekTime = undefined;
    const controller = this.#controllerFor(session);
    if (!session.started) {
      session.started = true;
      controller.start(session.load);
    }
    controller.seek(timeSeconds);
  }

  async #handleSource(
    requestId: RequestId,
    src: string,
    mimeType: string | undefined,
    preload: 'auto' | 'metadata' | 'none' | undefined,
  ): Promise<void> {
    const epoch = ++this.#loadEpoch;
    // Play intent is scoped to ONE load attempt (matches the current worker):
    // a stray PLAY that outlived a previous load must not auto-start a later
    // unrelated one. A parked seek survives source supersession.
    this.#playRequested = false;
    // `#abandonLoad` clears the previous load's request id; the new load's id
    // is bound AFTER the teardown so the session sink/reporter use THIS one.
    this.#abandonLoad();
    this.#requestId = requestId;

    // A genuine load failure kills the intent parked on this attempt: a seek
    // or play that targeted a failed object must not auto-start a later,
    // unrelated SOURCE. Superseded (stale-epoch) returns skip this, so a seek
    // parked during a replaced probe survives to the replacement load.
    const failed = (kind: WorkerErrorCode, context: string): void => {
      this.#playRequested = false;
      this.#pendingSeekTime = undefined;
      this.#postError(kind, requestId, context);
    };

    let source: ByteSource;
    try {
      source = await this.#createSource(src);
    } catch (error) {
      if (this.#destroyed || epoch !== this.#loadEpoch) return;
      failed(workerErrorCode.network, describeError(error));
      return;
    }
    if (this.#destroyed || epoch !== this.#loadEpoch) {
      source.cancel();
      return;
    }
    this.#source = source;

    let head: Uint8Array;
    try {
      // Probe at epoch 0: the pipeline's index builders re-read the object
      // under epoch 0 too, while the stream controller owns epochs ≥ 1.
      head = await readProbe(source, this.#headProbeLength);
    } catch (error) {
      if (this.#destroyed || epoch !== this.#loadEpoch) return;
      if (isSupersededOrAbort(error)) return;
      failed(workerErrorCode.network, describeError(error));
      return;
    }
    if (this.#destroyed || epoch !== this.#loadEpoch) return;
    if (head.byteLength === 0) {
      failed(workerErrorCode.network, 'object is empty or unreadable');
      source.cancel();
      return;
    }

    let result: LoadResult;
    try {
      result = await this.#loadPipeline.run({ head, inputMime: mimeType, source });
    } catch (error) {
      if (this.#destroyed || epoch !== this.#loadEpoch) return;
      if (error instanceof ProducerUnavailableError) {
        failed(workerErrorCode.unsupported, producerFailureContext(error));
      } else {
        failed(workerErrorCode.network, describeError(error));
      }
      source.cancel();
      return;
    }
    if (this.#destroyed || epoch !== this.#loadEpoch) {
      source.cancel();
      return;
    }

    // Worker mode: the supplied MSE-backed sinkFactory builds one per-load
    // sink. Main mode — including a host `workerMse: 'main'` preference that
    // overrides a capable runtime — always uses the protocol-compatible CHUNK
    // posting sink, never the worker MediaSource root.
    const sink =
      this.#mode === workerMode.main
        ? createPostingSink(this.#post, requestId)
        : this.#sinkFactory({
            durationSeconds: result.capabilities.durationSeconds,
            mime: result.mime,
            requestId,
          });
    const session: CompositionSession = {
      controller: null,
      load: { index: result.index, producer: result.producer, sink, source },
      requestId,
      started: false,
    };
    session.controller = this.#newController(session);
    this.#session = session;

    // Domain capability report carried by the optional SOURCE_OK.info fields.
    this.#post({
      info: sourceInfoFor(
        {
          codecs: result.codecs,
          container: result.capabilities.container,
          durationSeconds: result.capabilities.durationSeconds,
          index: result.index,
          mime: result.mime,
          playback: result.capabilities.playbackMode,
        },
        this.#mode,
      ),
      requestId,
      type: 'SOURCE_OK',
    });

    // The parked seek this load carried is consumed when the load resolves:
    // it repositions streaming to its floor, and clearing it here keeps the
    // intent scoped to THIS load (a later, unrelated SOURCE must not
    // auto-start from a stale flag). A deferred resolve keeps it parked so a
    // later seek/play intent still finds it — though once the session exists
    // a live seek routes through the session path, not the park flags.
    const parkedSeek = this.#pendingSeekTime;
    if (preload === 'auto' || this.#playRequested || parkedSeek !== undefined) {
      this.#playRequested = false;
      this.#pendingSeekTime = undefined;
      this.#startStreaming();
      // start() binds the session's controller synchronously; seek() bumps the
      // run epoch so the byte-0 start is superseded before it can deliver a
      // stale first range, restarting playback from the parked seek's floor.
      if (parkedSeek !== undefined) {
        this.#session?.controller?.seek(parkedSeek);
      }
    }
  }

  // Creates the session-scoped controller (one per load graph) and
  // wire the main-mode ENDED transition onto the wire.
  #newController(session: CompositionSession): StreamController {
    const controller = createStreamController({
      clock: this.#clock,
      errorReporter: this.#errorReporter,
      lookaheadSeconds: this.#lookaheadSeconds,
      stallTimeoutMs: this.#stallTimeoutMs,
    });
    controller.onStateChange((state) => {
      if (this.#destroyed) return;
      // Main-mode MSE: the host owns the MediaSource and must be told to end
      // it once its own append queue drains. Worker mode ends its own
      // MediaSource through the sink and never posts ENDED.
      if (state === streamState.ended && this.#mode === workerMode.main && this.#session === session) {
        this.#post({ requestId: session.requestId, type: 'ENDED' });
      }
    });
    return controller;
  }

  #postError(kind: WorkerErrorCode, requestId: null | RequestId, context?: string): void {
    this.#post({ context, kind, requestId, type: 'ERROR' });
  }

  // Selects the session MSE site from the latest HELLO config + runtime
  // capability. `undefined`/`'auto'` defers to the runtime check
  // (`canConstructInDedicatedWorker`); `'main'` forces the main-thread fallback.
  #selectMode(config?: WorkerConfig): void {
    if (config?.workerMse === workerMsePreference.main) {
      this.#mode = workerMode.main;
      return;
    }
    this.#mode = this.#supportsWorkerMse() ? workerMode.worker : workerMode.main;
  }

  // Begins streaming the accepted load (PLAY / preload auto / parked seek).
  // Re-binds the session when the previous controller reached a terminal state.
  #startStreaming(): void {
    const session = this.#session;
    if (!session || this.#destroyed) return;
    const controller = this.#controllerFor(session);
    if (session.started && controller === session.controller) return;
    session.started = true;
    controller.start(session.load);
  }
}

/**
 * Composition-root factory: builds a {@link WorkerComposition} over the
 * injected seams. Exporting the factory keeps callers on the interface.
 */
export function createSessionCoordinator(deps: SessionCoordinatorDeps): SessionCoordinator {
  return new WorkerComposition(deps);
}

/**
 * Default handshake: memoized X25519 key pair for `HELLO`, AEAD-validated
 * `APP_KEY` decryption through the handshake helpers. The coordinator exposes
 * the active connection's config + decrypted seed so a composition root can
 * bind them lazily to the Sia transport on the first `SOURCE` — the seed is
 * kept while the connection is active and scrubbed on replacement (config
 * change, superseding `APP_KEY`) or on `dispose`.
 */
export function createSessionHandshake(): SessionHandshake {
  let config: undefined | WorkerConfig;
  let keyPair: null | WorkerKeyPair = null;
  let seed: null | Uint8Array = null;

  return {
    async acceptAppKey(envelope: AppKeyEnvelope): Promise<void> {
      if (keyPair === null) throw new Error('HELLO must precede APP_KEY');
      const decrypted = await decryptAppKeyEnvelope(keyPair, envelope);
      // Same connection, fresh envelope (new IV/ephemeral key): keep the active
      // seed and drop the re-decrypted copy, so repeat attaches never churn the
      // SDK. A genuinely different seed scrubs the old one before adoption.
      if (appKeySeedsEqual(seed, decrypted)) {
        scrub(decrypted);
        return;
      }
      if (seed) scrub(seed);
      seed = decrypted;
    },

    get config(): undefined | WorkerConfig {
      return config;
    },

    dispose(): void {
      if (seed) scrub(seed);
      seed = null;
      config = undefined;
    },

    hello(_requestId: RequestId, nextConfig?: WorkerConfig): { readonly publicKey: Uint8Array } {
      // A HELLO config that changed — or was cleared entirely — invalidates the
      // connection: drop the held seed so the next APP_KEY starts fresh.
      if (!workerConfigsEqual(config, nextConfig)) {
        if (seed) scrub(seed);
        seed = null;
        config = nextConfig;
      }
      keyPair ??= generateWorkerKeyPair();
      return { publicKey: exportWorkerPublicKey(keyPair) };
    },

    get seed(): null | Uint8Array {
      return seed;
    },
  };
}

/** Default worker-MSE capability: true only where the platform can construct MSE in a dedicated worker. */
export function defaultSupportsWorkerMse(): boolean {
  return (
    typeof MediaSource !== 'undefined' &&
    (MediaSource as { canConstructInDedicatedWorker?: boolean }).canConstructInDedicatedWorker === true
  );
}

/** Byte equality over two decapsulated seeds (or nulls); scrubbed buffers read as "changed". */
function appKeySeedsEqual(a: null | Uint8Array, b: null | Uint8Array): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.byteLength !== b.byteLength) return false;
  for (let i = 0; i < a.byteLength; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Main-mode `AppendSink`: posts each produced segment as a protocol `CHUNK`
 * (kind init/media) under the load's request id. Worker mode supplies a real
 * MSE-backed sink through `sinkFactory` instead.
 */
function createPostingSink(post: PostMessage, requestId: RequestId): AppendSink {
  let active = true;
  return {
    abort(): void {
      active = false;
    },
    append(segment: ProducedSegment): void {
      if (!active) return;
      post({ bytes: segment.bytes.slice(), kind: segment.kind, requestId, type: 'CHUNK' });
    },
    evictBackBuffer(): Promise<boolean> {
      return Promise.resolve(false);
    },
    requestEndOfStream(): void {
      // Main-thread MSE: the host ends its own MediaSource when it receives
      // the coordinator's ENDED; a posting sink owns no SourceBuffer.
    },
    resetParser(): void {
      // No SourceBuffer parser to reset on a posting sink.
    },
  };
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Whether a read error is a supersede/abort that must be dropped, not reported. */
function isSupersededOrAbort(error: unknown): boolean {
  if (error instanceof ByteSourceSupersededError) return true;
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: unknown }).name === 'AbortError'
  );
}

/** Presents a producer rejection with the worker's protocol-compatible context. */
function producerFailureContext(error: ProducerUnavailableError): string {
  return error.verdict === producerVerdict.codec ? `codec: ${error.detail}` : `container: ${error.container}`;
}

/** Reads the first `length` bytes (short at EOF) through `source` under epoch 0. */
async function readProbe(source: ByteSource, length: number): Promise<Uint8Array> {
  const want = Math.min(length, source.size);
  if (want <= 0) return new Uint8Array(0);
  const reader = source.read({ length: want, offset: 0 }, { epoch: 0 }).getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      total += value.byteLength;
      if (total >= want) break;
    }
  } finally {
    void reader.cancel().catch(() => {
      /* stream already closed/errored */
    });
  }
  const head = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    const remaining = Math.min(chunk.byteLength, total - offset);
    head.set(chunk.subarray(0, remaining), offset);
    offset += remaining;
  }
  return head;
}

/**
 * True when two HELLO worker configs describe the same connection. App
 * metadata is descriptive only (not part of SDK auth), so identity is the
 * indexer endpoint.
 */
function workerConfigsEqual(a: undefined | WorkerConfig, b: undefined | WorkerConfig): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.indexerUrl === b.indexerUrl;
}
