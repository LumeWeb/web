/**
 * `SessionCoordinator` / `WorkerComposition`: the worker composition-root seam
 * that wires the session pieces into one protocol-compatible adapter:
 *
 *   `LoadPipeline` (one mediabunny Input: discover + convert)
 *     → `StreamController` (start/seek/playhead, EOS)
 *     → `AppendSink` (default: main-mode CHUNK poster)
 *   plus `Clock`, `ErrorReporter` (protocol ERROR mapping), and the handshake
 *   seam (`HELLO`/`APP_KEY`), all behind injected interfaces.
 *
 * Responsibilities: protocol validation via the existing
 * `MainToWorkerMessage` types, handshake/app-key lifecycle, request IDs and
 * source replacement (load-generation discipline), attach/detach/destroy, and creating
 * and disposing one load/session graph (one `StreamController` per accepted
 * load).
 *
 * The coordinator is Sia-free: everything below runs against injected fakes
 * with no SDK and no MSE. `createSource` is where a call site binds the real
 * Sia transport + SDK, and worker-mode MSE is supplied through `sinkFactory`.
 *
 * One load runs through ONE mediabunny pipeline: metadata discovery and
 * conversion share the same `Input`, so the metadata bytes are downloaded
 * once, and `SOURCE_OK` is posted only after the validated startup facts
 * (video + audio track, MSE-supported codecs) pass. An unsupported object
 * surfaces as a typed result, not a string comparison, and posts a protocol
 * `unsupported` error.
 *
 * Protocol compatibility: outbound messages are the existing
 * `WorkerToMainMessage` shapes (`HELLO_OK`, `ATTACH_OK`, `SOURCE_OK`,
 * `CHUNK`, `ENDED`, `ERROR`), the capability fields on `SOURCE_OK.info` stay
 * optional, and no protocol message is renamed.
 */

import type { PlaybackCapabilities } from '../capabilities/browser-capabilities.ts';
import { detectBrowserCapabilities } from '../capabilities/browser-capabilities.ts';
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
  MainToWorkerMessageType,
  PROTOCOL_VERSION,
  type RequestId,
  type WorkerConfig,
  workerErrorCode,
  type WorkerErrorCode,
  type WorkerLogLevel,
  workerMode,
  type WorkerMode,
  workerMsePreference,
  type WorkerToMainMessage,
  WorkerToMainMessageType,
} from '../protocol.ts';
import type { ByteSource } from '../transport/byte-source.ts';
import type { AppendSink, AppendUnit } from '../sink/append-sink.ts';
import type { Clock } from './clock.ts';
import { createErrorReporter, type ErrorReporter } from './error-reporter.ts';
import { createLoadPipeline, type LoadPipeline, type LoadResult } from './load-pipeline.ts';
import { sourceInfoFor } from './source-capabilities.ts';
import {
  createStreamController,
  type StreamController,
  type StreamLoad,
  streamState,
} from './stream-controller.ts';

/**
 * HELLO seed-presence declarations (additive, optional wire metadata): which
 * credential slots this connection's host will supply over `APP_KEY`. Booleans
 * only — presence metadata, never the seeds themselves (those still travel
 * exclusively inside the encrypted `APP_KEY` envelopes). A slot the host
 * declares absent (`false`) scrubs any seed still held for it, even when the
 * re-attached `WorkerConfig` is identical — otherwise the worker could not
 * distinguish "provider removed" from "envelope not yet arrived". An absent
 * flag means no claim (an old-protocol host) and changes nothing.
 */
export interface HelloSeedPresence {
  /** App-key seed slot declaration (`false` scrubs a held app-key seed). */
  readonly app?: boolean;
  /** Sharing-key seed slot declaration (`false` scrubs a held sharing seed). */
  readonly sharing?: boolean;
}

/** Outbound protocol channel (same shape as the worker's `PostMessage`). */
export type PostMessage = (message: WorkerToMainMessage, transfer?: Transferable[]) => void;

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
  /** Injectable time (default: `wallClock()`). */
  readonly clock?: Clock;
  /**
   * Resolves one SOURCE locator into a `ByteSource`. Sia in production (via
   * the SDK); `MemoryByteSource` in tests. Errors → network ERROR. The
   * owning SOURCE `requestId` is supplied (null before any load) so
   * request-scoped reader milestones the source emits pick up their load.
   */
  readonly createSource: (src: string, requestId?: null | RequestId) => Promise<ByteSource>;
  /** Handshake for `HELLO`/`APP_KEY` (default: `createSessionHandshake()`). */
  readonly handshake?: SessionHandshake;
  /**
   * Injected load-pipeline seam for package-owned tests; production defaults
   * to `createLoadPipeline({ capabilities })`.
   */
  readonly loadPipeline?: LoadPipeline;
  /**
   * Called whenever the active load/session graph is abandoned — superseded by
   * a new SOURCE, or stopped by DETACH/DESTROY — with the honest reason the
   * coordinator derives at the call site (`'replace'` for a superseding
   * SOURCE, `'detach'`/`'destroy'` for the two stop messages; undefined only
   * where the coordinator abandons without a caller-visible cause). The
   * production composition root uses it to tear the worker-side MSE root down
   * immediately (release the MediaSource + SourceBuffer a load opened) instead
   * of leaving the stale handle allocated until the next load's `sinkFactory`
   * happens to reset it, and derives its `session.detach` detail from the
   * reason. Optional; main-mode posting and non-MSE roots ignore it.
   */
  readonly onAbandon?: (reason?: WorkerAbandonReason) => void;
  /**
   * Reflects the validated media playhead (from PLAYHEAD/SEEK) to a worker-MSE
   * root, which derives the pipe's back-buffer eviction boundary from it.
   * Optional; main-mode posting and non-MSE sinks ignore it.
   */
  readonly onPlayhead?: (timeSeconds: number) => void;
  /** Outbound protocol channel. */
  readonly post: PostMessage;
  /**
   * Builds the per-load `AppendSink`. Defaults to a main-mode CHUNK poster;
   * worker-mode MSE (a `MseAdapter` over the worker MediaSource pipe) is
   * supplied by the production composition root. Receives the load context
   * (MIME/duration/request id) so an MSE-backed sink can open its own
   * SourceBuffer for exactly that load.
   */
  readonly sinkFactory?: (context: SinkFactoryContext) => AppendSink;
  /** Worker-MSE capability check; false in node, true where `canConstructInDedicatedWorker`. */
  readonly supportsWorkerMse?: () => boolean;
}

/**
 * The `HELLO`/`APP_KEY` handshake seam. The coordinator routes those two
 * protocol messages here and posts `HELLO_OK`/`ERROR` around the result, so
 * handshake crypto stays isolated and tests inject a fake.
 */
export interface SessionHandshake {
  /**
   * Validates/consumes one `APP_KEY` envelope; throws on rejection (→ network
   * ERROR). The envelope's plaintext `keyType` tag routes the decrypted seed
   * into the `seed` (app-key) or `sharingSeed` slot.
   */
  acceptAppKey(envelope: AppKeyEnvelope): Promise<void> | void;
  /** Active HELLO `WorkerConfig`, once one was received; undefined before/after clear. */
  readonly config?: undefined | WorkerConfig;
  /** Releases held connection credentials (scrubs both held seeds); optional. */
  dispose?(): void;
  /**
   * Returns the worker's static public half for `HELLO_OK`. When a HELLO
   * `WorkerConfig` is supplied and differs from the active one, both held
   * seeds are dropped (a config change invalidates the connection), so
   * `seed`/`sharingSeed` only ever describe the active connection. The
   * optional `presence` flags (additive wire metadata) additionally scrub a
   * held seed whose slot the host declares absent (`false`) — a host may
   * remove a seed provider while re-attaching an identical config, and the
   * worker must not keep a stale (possibly revoked) credential. Absent flags
   * (an old-protocol HELLO) scrub nothing beyond the config-change rule. The
   * optional `log` is the host's `LOG` forwarding threshold for this
   * connection (absent = silent); it is adopted as the live `log` getter.
   */
  hello(
    requestId: RequestId,
    config?: WorkerConfig,
    presence?: HelloSeedPresence,
    log?: WorkerLogLevel,
  ): { readonly publicKey: Uint8Array };
  /**
   * Live HELLO `log` forwarding threshold for worker `LOG` messages, as last
   * declared by the most recent `hello` (absent = no threshold = the worker
   * posts no LOG messages at all). Read at emit time so a threshold change on
   * re-attach takes effect without any stale snapshot.
   */
  readonly log?: WorkerLogLevel;
  /** Decrypted app-key seed of the active connection, or null until one is validated. */
  readonly seed?: null | Uint8Array;
  /** Decrypted sharing-key seed of the active connection, or null until one is validated. */
  readonly sharingSeed?: null | Uint8Array;
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

/**
 * Why the coordinator abandoned the active load/session graph, derived at the
 * exact call site: `'replace'` when a superseding SOURCE tore the previous
 * load down, `'detach'` when the DETACH stop message did, `'destroy'` when
 * DESTROY did (the coordinator stays dead after). Passed to `onAbandon` so
 * the composition can report the most precise reason convertible from the
 * wire — DETACH vs DESTROY vs a replace no longer collapse into one bare
 * event. `undefined` is the fallback for an abandon without a caller-facing
 * cause (none today; kept for forward compatibility).
 */
export type WorkerAbandonReason = 'destroy' | 'detach' | 'replace';

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

  readonly #createSource: (src: string, requestId?: null | RequestId) => Promise<ByteSource>;
  #destroyed = false;
  readonly #errorReporter: ErrorReporter;
  readonly #handshake: SessionHandshake;
  /**
   * One authoritative abort controller for the in-flight load. Created at
   * SOURCE, aborted by `#abandonLoad` (supersession / DETACH / DESTROY), and
   * released once the load resolves without an accepted session.
   */
  #loadAbortController: AbortController | null = null;
  #loadGeneration = 0;
  readonly #loadPipeline: LoadPipeline;
  // Default 'main' is safe until `#selectMode()` (called in the constructor,
  // then on every HELLO) picks the session's actual MSE site.
  #mode: WorkerMode = workerMode.main;
  readonly #onAbandon: ((reason?: WorkerAbandonReason) => void) | undefined;
  readonly #onPlayhead: ((timeSeconds: number) => void) | undefined;
  #pendingSeekTime: number | undefined = undefined;
  #playRequested = false;
  readonly #post: PostMessage;
  #requestId: null | RequestId = null;
  #session: CompositionSession | null = null;
  readonly #sinkFactory: (context: SinkFactoryContext) => AppendSink;
  #source: ByteSource | null = null;
  readonly #supportsWorkerMse: () => boolean;

  constructor(deps: SessionCoordinatorDeps) {
    const capabilities = deps.capabilities ?? detectBrowserCapabilities();
    this.#createSource = deps.createSource;
    this.#handshake = deps.handshake ?? createSessionHandshake();
    this.#supportsWorkerMse = deps.supportsWorkerMse ?? defaultSupportsWorkerMse;
    this.#selectMode();
    this.#onAbandon = deps.onAbandon;
    this.#onPlayhead = deps.onPlayhead;
    this.#post = deps.post;
    this.#sinkFactory = deps.sinkFactory ?? (() => createPostingSink(this.#post, this.#requestId ?? 0));

    this.#errorReporter = createErrorReporter((report) => {
      // Failures are scoped to the load that produced them; cancelled drops
      // never reach here (createErrorReporter filters them).
      this.#postError(report.kind, this.#requestId, report.context);
    });

    this.#loadPipeline = deps.loadPipeline ?? createLoadPipeline({ capabilities });
  }

  /** Stops all reads and drops pipeline state; the coordinator cannot be re-attached. */
  destroy(): void {
    if (this.#destroyed) return;
    this.#destroyed = true;
    this.#abandonLoad('destroy');
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
        case MainToWorkerMessageType.APP_KEY:
          await this.#handshake.acceptAppKey(message.envelope);
          return;
        case MainToWorkerMessageType.ATTACH:
          this.#post({ mode: this.#mode, requestId: message.requestId, type: WorkerToMainMessageType.ATTACH_OK });
          return;
        case MainToWorkerMessageType.DESTROY:
          this.destroy();
          return;
        case MainToWorkerMessageType.DETACH:
          this.#abandonLoad('detach');
          this.#playRequested = false;
          this.#pendingSeekTime = undefined;
          return;
        case MainToWorkerMessageType.HELLO: {
          const { publicKey } = this.#handshake.hello(
            message.requestId,
            message.config,
            {
              app: message.appSeed,
              sharing: message.sharingSeed,
            },
            message.log,
          );
          // A host `workerMse: 'main'` preference overrides the runtime
          // capability check for this session (auto keeps runtime feature-detection). HELLO
          // arrives before ATTACH, so HELLO_OK's `features.workerMse` and the
          // subsequent ATTACH_OK both reflect the host's selection.
          this.#selectMode(message.config);
          this.#post({
            features: { workerMse: this.#mode === workerMode.worker },
            publicKey,
            requestId: message.requestId,
            type: WorkerToMainMessageType.HELLO_OK,
            version: PROTOCOL_VERSION,
          });
          return;
        }
        case MainToWorkerMessageType.PLAY:
          this.#playRequested = true;
          this.#startStreaming();
          return;
        case MainToWorkerMessageType.PLAYHEAD:
          this.#handlePlayhead(message.requestId, message.time);
          return;
        case MainToWorkerMessageType.SEEK:
          this.#handleSeek(message.time);
          return;
        case MainToWorkerMessageType.SOURCE:
          await this.#handleSource(message.requestId, message.src, message.preload);
          return;
      }
    } catch (error) {
      const requestId = message.type === MainToWorkerMessageType.SOURCE || message.type === MainToWorkerMessageType.SEEK ? message.requestId : null;
      this.#postError(workerErrorCode.network, requestId, describeError(error));
    }
  }

  // Tears down the current load/session graph in the authoritative replacement
  // order: the load-level abort signal first (so every outstanding read fails),
  // then the session's playback/sink resources, then external worker-MSE state,
  // and finally the request/session references so no straggler can post under a
  // dead load. Every operation is idempotent. An accepted load's transport
  // source is cancelled exactly once, through the Input/CustomSource disposal
  // path inside `playback.dispose()`; a source that never produced an accepted
  // playback (still inspecting, or already a non-ready verdict) is stopped
  // directly — the pipeline's own Input disposal, when it runs, is a second
  // idempotent stop of the same source.
  #abandonLoad(reason?: WorkerAbandonReason): void {
    this.#loadAbortController?.abort();
    this.#loadAbortController = null;

    const session = this.#session;
    const source = this.#source;
    if (session) {
      session.load.playback.dispose();
      // The controller's teardown aborts the sink and rejects late callbacks.
      session.controller?.destroy();
    } else if (source) {
      source.cancel();
    }

    this.#onAbandon?.(reason);

    this.#requestId = null;
    this.#session = null;
    this.#source = null;
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
  // (the synchronous seek supersedes that initial run), then record the seek
  // position. A malformed time is dropped before it can park intent or re-pump
  // the controller, matching the current worker's `#handleSeek` guard.
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
    preload: 'auto' | 'metadata' | 'none' | undefined,
  ): Promise<void> {
    const loadGeneration = ++this.#loadGeneration;
    // Play intent is scoped to ONE load attempt (matches the current worker):
    // a stray PLAY that outlived a previous load must not auto-start a later
    // unrelated one. A parked seek survives source supersession.
    this.#playRequested = false;
    // `#abandonLoad` clears the previous load's request id; the new load's id
    // is bound AFTER the teardown so the session sink/reporter use THIS one.
    // The previous load's abandon is a `'replace'` — a superseding SOURCE tore
    // it down, which the composition distinguishes from a DETACH/DESTROY stop.
    this.#abandonLoad('replace');
    this.#requestId = requestId;
    const loadAbortController = new AbortController();
    this.#loadAbortController = loadAbortController;

    // A genuine load failure kills the intent parked on this attempt: a seek
    // or play that targeted a failed object must not auto-start a later,
    // unrelated SOURCE. Superseded returns skip this, so a seek parked during
    // a replaced load survives to the replacement load.
    const failed = (kind: WorkerErrorCode, context: string): void => {
      this.#playRequested = false;
      this.#pendingSeekTime = undefined;
      this.#postError(kind, requestId, context);
    };

    let source: ByteSource;
    try {
      // The new SOURCE's request id is threaded into the byte-source factory
      // so reader/source milestones the load emits carry their owning request.
      source = await this.#createSource(src, requestId);
    } catch (error) {
      if (this.#destroyed || loadGeneration !== this.#loadGeneration) {
        // A stale creation releases its own abort signal and posts nothing.
        loadAbortController.abort();
        return;
      }
      failed(workerErrorCode.network, describeError(error));
      return;
    }
    if (this.#destroyed || loadGeneration !== this.#loadGeneration) {
      // A superseded source is disposed by its own load, never the newer one.
      source.cancel();
      loadAbortController.abort();
      return;
    }
    this.#source = source;

    let result: LoadResult;
    try {
      result = await this.#loadPipeline.run({ loadGeneration, signal: loadAbortController.signal, source });
    } catch (error) {
      if (this.#destroyed || loadGeneration !== this.#loadGeneration) {
        // The replacement teardown already aborted this load's reads; the
        // local signal is all it owns to release.
        loadAbortController.abort();
        return;
      }
      failed(workerErrorCode.network, describeError(error));
      source.cancel();
      loadAbortController.abort();
      this.#loadAbortController = null;
      return;
    }
    if (this.#destroyed || loadGeneration !== this.#loadGeneration) {
      // Stale completion disposes its own resources — the abort signal and an
      // already-accepted verdict's playback/input (whose CustomSource disposal
      // cancels the transport source) — and posts nothing.
      loadAbortController.abort();
      if (result.status === 'ready') result.playback.dispose();
      return;
    }

    // The typed verdict drives the load outcome: a superseded or aborted
    // discovery posts nothing, an unplayable object posts one unsupported
    // error, and only a ready load proceeds to the sink + SOURCE_OK.
    // A non-ready verdict already cancelled the transport source when the
    // pipeline disposed its Input (CustomSource disposal path), so no second
    // `source.cancel()` runs here.
    if (result.status === 'cancelled') {
      this.#loadAbortController = null;
      return;
    }
    if (result.status === 'unsupported') {
      // One protocol error per unsupported load: the stable reason string with
      // the raw failure detail appended after a colon when one exists.
      failed(
        workerErrorCode.unsupported,
        result.detail === undefined ? result.reason : result.reason + ': ' + result.detail,
      );
      this.#loadAbortController = null;
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
            durationSeconds: result.durationSeconds,
            mime: result.mime,
            requestId,
          });
    const session: CompositionSession = {
      controller: null,
      load: { loadGeneration, playback: result.playback, sink },
      requestId,
      started: false,
    };
    session.controller = this.#newController(session);
    this.#session = session;

    // The capability report is built directly from the ready result (container,
    // duration, MIME, tracks) plus the session MSE mode.
    this.#post({
      info: sourceInfoFor(
        {
          container: result.container,
          durationSeconds: result.durationSeconds,
          mime: result.mime,
          tracks: result.tracks,
        },
        this.#mode,
      ),
      requestId,
      type: WorkerToMainMessageType.SOURCE_OK,
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
      // start() binds the session's controller synchronously; seek() records
      // the parked position so playback resumes from it once MSE buffers.
      if (parkedSeek !== undefined) {
        this.#session?.controller?.seek(parkedSeek);
      }
    }
  }

  // Creates the session-scoped controller (one per load graph) and
  // wire the main-mode ENDED transition onto the wire.
  #newController(session: CompositionSession): StreamController {
    const controller = createStreamController({
      errorReporter: this.#errorReporter,
    });
    controller.onStateChange((state) => {
      if (this.#destroyed) return;
      // Main-mode MSE: the host owns the MediaSource and must be told to end
      // it once its own append queue drains. Worker mode ends its own
      // MediaSource through the sink and never posts ENDED.
      if (state === streamState.ended && this.#mode === workerMode.main && this.#session === session) {
        this.#post({ requestId: session.requestId, type: WorkerToMainMessageType.ENDED });
      }
    });
    return controller;
  }

  #postError(kind: WorkerErrorCode, requestId: null | RequestId, context?: string): void {
    this.#post({ context, kind, requestId, type: WorkerToMainMessageType.ERROR });
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
 * the active connection's config + both decrypted seeds (app-key `seed` and
 * `sharingSeed`, routed by the envelope's `keyType` tag) so a composition
 * root can bind them lazily to the Sia transport on the first `SOURCE` — each
 * seed is kept while the connection is active and scrubbed on replacement
 * (config change, superseding `APP_KEY`, a HELLO presence flag declaring the
 * slot absent) or on `dispose`.
 */
export function createSessionHandshake(): SessionHandshake {
  let config: undefined | WorkerConfig;
  let keyPair: null | WorkerKeyPair = null;
  // The active LOG forwarding threshold, adopted from the latest HELLO (absent
  // = silent). Lives the same way as config/seed/sharingSeed so the composition
  // can read it live at emit time via the getter.
  let log: undefined | WorkerLogLevel = undefined;
  let seed: null | Uint8Array = null;
  let sharingSeed: null | Uint8Array = null;

  return {
    async acceptAppKey(envelope: AppKeyEnvelope): Promise<void> {
      if (keyPair === null) throw new Error('HELLO must precede APP_KEY');
      const decrypted = await decryptAppKeyEnvelope(keyPair, envelope);
      // The plaintext `keyType` tag is routing metadata only — never secret —
      // so it is trusted to steer the decrypted seed into the right slot.
      if (envelope.keyType === 'sharing') {
        adoptSeedSlot('sharing');
        return;
      }
      // Absent keyType = the original app-key handshake (backward compatible).
      adoptSeedSlot('app');
      return;

      // Adopts `decrypted` into the slot named by `kind`, scrubbing the
      // previous occupant when it changes. Same connection, fresh envelope (new
      // IV/ephemeral key): keep the active seed and drop the re-decrypted copy,
      // so repeat attaches never churn the SDK.
      function adoptSeedSlot(kind: 'app' | 'sharing'): void {
        const previous = kind === 'sharing' ? sharingSeed : seed;
        if (previous !== null) {
          if (appKeySeedsEqual(previous, decrypted)) {
            scrub(decrypted);
            return;
          }
          scrub(previous);
        }
        if (kind === 'sharing') sharingSeed = decrypted;
        else seed = decrypted;
      }
    },

    get config(): undefined | WorkerConfig {
      return config;
    },

    dispose(): void {
      if (seed) scrub(seed);
      seed = null;
      if (sharingSeed) scrub(sharingSeed);
      sharingSeed = null;
      config = undefined;
      log = undefined;
    },

    hello(
      _requestId: RequestId,
      nextConfig?: WorkerConfig,
      presence?: HelloSeedPresence,
      logThreshold?: WorkerLogLevel,
    ): { readonly publicKey: Uint8Array } {
      // The LOG threshold travels with the HELLO that (re)establishes the
      // connection, so adopt it unconditionally — the live `log` getter always
      // reflects the most recent HELLO, never a stale snapshot.
      log = logThreshold;
      // A HELLO config that changed — or was cleared entirely — invalidates the
      // connection: drop both held seeds so the next APP_KEY starts fresh.
      if (!workerConfigsEqual(config, nextConfig)) {
        if (seed) scrub(seed);
        seed = null;
        if (sharingSeed) scrub(sharingSeed);
        sharingSeed = null;
        config = nextConfig;
      }
      // HELLO seed-presence declarations (additive wire metadata; old-protocol
      // hosts omit them): a slot the host declares absent (`false`) scrubs any
      // seed still held for it, independently of the other slot, even when the
      // config re-attached unchanged — this is how the worker tells "provider
      // removed" from "envelope not yet arrived". A declared-present (`true`)
      // slot keeps current behavior; an absent flag makes no claim.
      if (presence?.app === false) {
        if (seed) scrub(seed);
        seed = null;
      }
      if (presence?.sharing === false) {
        if (sharingSeed) scrub(sharingSeed);
        sharingSeed = null;
      }
      keyPair ??= generateWorkerKeyPair();
      return { publicKey: exportWorkerPublicKey(keyPair) };
    },

    get log(): undefined | WorkerLogLevel {
      return log;
    },

    get seed(): null | Uint8Array {
      return seed;
    },

    get sharingSeed(): null | Uint8Array {
      return sharingSeed;
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
 * Main-mode `AppendSink`: posts each append unit as a protocol `CHUNK`
 * (kind init/media) under the load's request id. Worker mode supplies a real
 * MSE-backed sink through `sinkFactory` instead.
 */
function createPostingSink(post: PostMessage, requestId: RequestId): AppendSink {
  let active = true;
  return {
    abort(): void {
      active = false;
    },
    append(unit: AppendUnit): void {
      if (!active) return;
      post({ bytes: unit.bytes.slice(), kind: unit.kind, requestId, type: WorkerToMainMessageType.CHUNK });
    },
    evictBackBuffer(): Promise<boolean> {
      return Promise.resolve(false);
    },
    requestEndOfStream(): void {
      // Main-thread MSE: the host ends its own MediaSource when it receives
      // the coordinator's ENDED; a posting sink owns no SourceBuffer.
    },
    resetParser(_loadGeneration: number, _targetTimeSeconds?: number): void {
      // No SourceBuffer parser to reset (or re-anchor) on a posting sink.
    },
  };
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
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
