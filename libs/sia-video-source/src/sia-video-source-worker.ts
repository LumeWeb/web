/**
 * Worker-side engine for Sia video playback.
 *
 * The worker owns everything heavy: the Sia WASM SDK (`initSia()` plus ranged
 * `Sdk.download(object, { offset, length })`), container probing, and remuxing
 * to fragmented MP4 (mux.js for MPEG-TS; passthrough for fragmented MP4
 * input). Where the browser allows MSE inside a dedicated worker
 * (`MediaSource.canConstructInDedicatedWorker === true`), it also owns MSE
 * itself and transfers a `MediaSourceHandle` to the main thread, which sets it
 * as `video.srcObject`. Where that is false (Firefox), the worker only reads,
 * parses and remuxes, posting fMP4 data as `CHUNK` messages; the host then
 * constructs `MediaSource` + SourceBuffers on the main thread using the MIME
 * metadata carried by `SOURCE_OK`.
 *
 * Concurrency model: every `SOURCE` bumps a load epoch. Async continuations
 * (SDK resolution, object fetch, head probe) check the epoch after each await
 * and abandon work that was superseded by a newer load, so two sources can
 * never interleave their deliveries. `ATTACH` resets the pipeline without
 * discarding the cache: the host answers with a fresh `SOURCE`, which rebuilds
 * the MSE pipeline on a brand new `MediaSource`.
 *
 * External glue: the Sia WASM binary is loaded by
 * `@siafoundation/sia-storage`'s own `new URL('sia_storage_wasm_bg.wasm',
 * import.meta.url)` loader. That keeps working as long as app bundlers leave
 * the package external (it stays external in this library's build) or process
 * its `.wasm` assets themselves.
 */

import { AppKey, Builder, initSia } from '@siafoundation/sia-storage';
import muxJs from 'mux.js';
import {
  decryptAppKeyEnvelope,
  exportWorkerPublicKey,
  generateWorkerKeyPair,
  scrub,
  type WorkerKeyPair,
} from './app-key-handshake.ts';
import { type ContainerKind, sniffContainer } from './container-probe.ts';
import {
  type AppKeyEnvelope,
  DEFAULT_FMP4_MIME,
  PROTOCOL_VERSION,
  type RequestId,
  type SiaVideoMessage,
  type WorkerConfig,
  type WorkerErrorCode,
  type WorkerMode,
  type WorkerToMainMessage,
} from './protocol.ts';
import {
  LruChunkCache,
  RangedReader,
  type SiaObjectLike,
  type SiaSdkLike,
} from './ranged-reader.ts';

const muxMp4 = muxJs.mp4;

/** Bytes fetched before playback, purely to sniff the container. */
export const HEAD_PROBE_LENGTH = 4096;

const CHUNK_SIZE = 256 * 1024;
const PROGRESS_INTERVAL_CHUNKS = 8;

export type PostMessage = (message: WorkerToMainMessage, transfer?: Transferable[]) => void;

/** The Sia SDK surface the worker needs: ranged reads plus object resolution. */
export type SiaVideoSdk = {
  /**
   * Optional release hook for SDKs that hold native resources (WASM
   * instances, WebTransport connections). Invoked whenever a created SDK is
   * discarded without ever being used — superseded by a config change mid-
   * creation or torn down with the worker. Absent on SDKs that need no
   * explicit cleanup.
   */
  dispose?: () => Promise<void> | void;
  object(key: string): Promise<SiaObjectLike>;
} & SiaSdkLike;

export interface SiaVideoWorkerOptions {
  /** Replaces the default byte chunk cache (capacity-limited LRU). */
  cache?: LruChunkCache;
  /**
   * Builds the SDK used to resolve and download pinned objects. Defaults to
   * the worker-local registration flow driven by the `HELLO` config plus the
   * decrypted `APP_KEY` seed; apps that own SDK registration elsewhere inject
   * a resolved `SiaVideoSdk` here. The seed argument is the worker's decrypted
   * copy and stays inside this isolate — it must not be forwarded anywhere.
   */
  createSdk?: (config: undefined | WorkerConfig, appKeySeed: null | Uint8Array) => Promise<SiaVideoSdk>;
  /** Overrides message delivery; useful when the caller wires its own channel. */
  post?: PostMessage;
  /** Overrides the worker-MSE capability probe (e.g. for alternative runtimes). */
  supportsWorkerMse?: () => boolean;
}

type Transmuxer = import('mux.js').Mp4Transmuxer;

/** Data event emitted by the mux.js mp4 Transmuxer. */
interface TransmuxerDataEvent {
  data?: Uint8Array;
  initSegment?: Uint8Array;
}

/**
 * Protocol state machine for one worker media session. One instance per media
 * element; the entry points are {@link handleMessage} and {@link destroy}.
 */
export class SiaVideoWorkerCore {
  /** Whether this worker feeds MSE itself or transfers fMP4 chunks to the host. */
  get mode(): WorkerMode {
    return this.#mode;
  }
  #appendQueue: Uint8Array[] = [];
  // Decrypted app-key seed. Worker-isolate only: it is produced solely by
  // decrypting the APP_KEY envelope, is passed to the injected/default SDK
  // factory here, and is scrubbed on replace and on destroy. No protocol
  // message forwards it (or the private key) back to the host.
  #appKeySeed: null | Uint8Array = null;
  readonly #cache: LruChunkCache;
  #chunksSinceProgress = 0;

  #config: undefined | WorkerConfig;
  #container: ContainerKind | null = null;
  readonly #createSdk: (config: undefined | WorkerConfig, appKeySeed: null | Uint8Array) => Promise<SiaVideoSdk>;
  #deliveredInit = false;
  #destroyed = false;
  // Throughput estimate backing time → byte-offset seek math.
  #firstByteAt = 0;

  // Memoized in-flight SDK build, so overlapping loads share one instance.
  #inflightSdk: null | Promise<null | SiaVideoSdk> = null;
  // Memoized static handshake key pair; the private half never leaves this
  // isolate — it is referenced only by the decrypt path in this module.
  #keyPair: null | WorkerKeyPair = null;
  // Monotonic per-load epoch; every async step abandons itself if it no longer
  // matches, which is what keeps superseded SOURCE loads from interleaving.
  #loadEpoch = 0;
  // Worker-MSE path state.
  #mediaSource: MediaSource | null = null;
  #mime = DEFAULT_FMP4_MIME;

  readonly #mode: WorkerMode;
  #object: null | SiaObjectLike = null;
  // Epoch the current `#object` belongs to; `#startStreaming` refuses to bind
  // a reader to an object whose load is no longer current.
  #objectEpoch = 0;
  // Seek intent parked while a load was probing; applied on completion.
  #pendingSeekTime: number | undefined;
  // Playback intent received while a deferred load was still in flight.
  #playRequested = false;
  readonly #post: PostMessage;
  #reader: null | RangedReader = null;

  #receivedBytes = 0;

  #requestId: null | RequestId = null;
  #sdk: null | SiaVideoSdk = null;

  // Whether the parked seek belongs to the live ATTACH session: such a seek
  // survives SOURCE supersession until a load genuinely succeeds, fails, or
  // the session is torn down; strays parked with no active session are
  // dropped when that load starts.
  #seekParkedSinceAttach = false;

  #sourceBuffer: null | SourceBuffer = null;

  readonly #supportsWorkerMse: () => boolean;

  // Remux path state (MPEG-TS → fMP4); passthrough paths never instantiate one.
  #transmuxer: null | Transmuxer = null;

  constructor(options: SiaVideoWorkerOptions = {}) {
    this.#cache = options.cache ?? new LruChunkCache(96);
    this.#createSdk = options.createSdk ?? createDefaultSdk;
    this.#post = options.post ?? defaultPost;
    this.#supportsWorkerMse = options.supportsWorkerMse ?? detectWorkerMseSupport;
    this.#mode = this.#supportsWorkerMse() ? 'worker' : 'main';
  }

  /** Stops all reads and drops pipeline state; the cache survives a re-attach. */
  destroy(): void {
    this.#destroyed = true;
    this.#forgetSeed();
    this.#teardownMediaPipeline();
    this.#reader?.stop();
    this.#reader = null;
    this.#playRequested = false;
    this.#pendingSeekTime = undefined;
    this.#cache.clear();
    const sdk = this.#sdk;
    this.#sdk = null;
    this.#disposeSdk(sdk);
  }


  /**
   * Handles one protocol message. Failures are reported as `ERROR` messages,
   * never as rejected promises.
   */
  async handleMessage(message: SiaVideoMessage): Promise<void> {
    if (this.#destroyed) return;

    try {
      switch (message.type) {
        case 'APP_KEY':
          await this.#acceptAppKey(message.envelope);
          return;
        case 'ATTACH':
          this.#handleAttach();
          return;
        case 'DESTROY':
          this.destroy();
          return;
        case 'DETACH':
          // A pending SOURCE continuation (sdk.object/readHead still waiting)
          // must not reinstall state into a detached session: bump the epoch so
          // it abandons at its next checkpoint.
          ++this.#loadEpoch;
          this.#reader?.stop();
          this.#reader = null;
          this.#teardownMediaPipeline();
          this.#object = null;
          this.#playRequested = false;
          this.#pendingSeekTime = undefined;
          this.#seekParkedSinceAttach = false;
          return;
        case 'HELLO': {
          // HELLO is authoritative on (re)attach: a config that changed — or
          // was cleared entirely — must invalidate the cached SDK so the next
          // SOURCE rebuilds against the fresh credentials/indexer. The active
          // load is torn down first so nothing reads against the SDK being
          // disposed.
          if (!workerConfigsEqual(this.#config, message.config)) {
            ++this.#loadEpoch;
            this.#reader?.stop();
            this.#reader = null;
            this.#object = null;
            this.#objectEpoch = 0;
            this.#teardownMediaPipeline();
            this.#playRequested = false;
            this.#pendingSeekTime = undefined;
            this.#seekParkedSinceAttach = false;
            this.#config = message.config;
            const sdk = this.#sdk;
            this.#sdk = null;
            this.#inflightSdk = null;
            this.#disposeSdk(sdk);
          }
          // The handshake's static X25519 key pair is created on the first
          // HELLO and memoized; HELLO_OK publishes only the raw public half.
          // The host needs it to encapsulate the app-key seed into the
          // following APP_KEY envelope.
          const keyPair = this.#ensureKeyPair();
          this.#post({
            features: { workerMse: this.#mode === 'worker' },
            publicKey: exportWorkerPublicKey(keyPair),
            requestId: message.requestId,
            type: 'HELLO_OK',
            version: PROTOCOL_VERSION,
          });
          return;
        }
        case 'PLAY':
          // Playback intent may arrive while a source is still probing; the
          // flag survives until the load completes and starts streaming.
          this.#playRequested = true;
          this.#startStreaming();
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
      this.#postError('network', requestId, errorDescription(error));
    }
  }

  // Decrypts the host's APP_KEY envelope and, when the decapsulated seed is
  // genuinely new, invalidates the connection exactly like a HELLO config
  // change: the active load is torn down and the cached/in-flight SDK story is
  // reset so the next SOURCE rebuilds against the fresh credentials. A
  // re-encrypted envelope holding the SAME seed (fresh IV + ephemeral key, no
  // way to compare wire bytes) decrypts to the existing seed and keeps the
  // SDK alive — this is what makes repeat attaches cheap.
  async #acceptAppKey(envelope: AppKeyEnvelope): Promise<void> {
    const keyPair = this.#ensureKeyPair();
    let seed: Uint8Array;
    try {
      seed = await decryptAppKeyEnvelope(keyPair, envelope);
    } catch {
      // AEAD integrity failure: tampered ciphertext, unrelated ephemeral key,
      // or foreign protocol context. Report and leave the current (possibly
      // absent) seed and SDK state untouched — garbage never invalidates.
      this.#postError('network', null, 'app key handshake failed: envelope rejected');
      return;
    }

    if (appKeySeedsEqual(this.#appKeySeed, seed)) {
      scrub(seed);
      return;
    }

    ++this.#loadEpoch;
    this.#reader?.stop();
    this.#reader = null;
    this.#object = null;
    this.#objectEpoch = 0;
    this.#teardownMediaPipeline();
    this.#playRequested = false;
    this.#pendingSeekTime = undefined;
    this.#seekParkedSinceAttach = false;
    this.#replaceSeed(seed);
    const sdk = this.#sdk;
    this.#sdk = null;
    this.#inflightSdk = null;
    this.#disposeSdk(sdk);
  }

  // Queues bytes for the worker-side SourceBuffer; drained on open/updateend.
  #append(bytes: Uint8Array): void {
    if (this.#mode !== 'worker' || !this.#mediaSource) return;
    this.#appendQueue.push(bytes);
    this.#drainAppendQueue();
  }

  // Throughput over wall-clock delivery; the floor keeps the estimate finite
  // in the first second, which is where seeks are worst anyway.
  #bytesPerSecond(): number {
    const elapsed = (performance.now() - this.#firstByteAt) / 1000;
    if (this.#receivedBytes === 0) return 0;
    return this.#receivedBytes / Math.max(elapsed, 1);
  }

  // True when the current connection still matches the one an SDK build was
  // started for (config equality + seed byte equality).
  #connectionIs(config: undefined | WorkerConfig, seed: null | Uint8Array): boolean {
    return workerConfigsEqual(this.#config, config) && appKeySeedsEqual(this.#appKeySeed, seed);
  }

  #consumeChunk(chunk: Uint8Array, position: number, epoch: number): void {
    if (this.#destroyed || this.#loadEpoch !== epoch) return;

    if (position === 0 && this.#receivedBytes === 0) this.#firstByteAt = performance.now();
    this.#receivedBytes += chunk.byteLength;
    this.#chunksSinceProgress++;

    if (this.#chunksSinceProgress >= PROGRESS_INTERVAL_CHUNKS) {
      this.#chunksSinceProgress = 0;
      this.#postProgress();
    }

    switch (this.#container) {
      case 'fmp4':
        this.#deliverPassthrough(chunk);
        return;
      case 'ts':
        this.#remux(chunk);
        return;
      default:
        return;
    }
  }

  // fMP4 input already speaks the append format: hand it through unchanged.
  #deliverPassthrough(chunk: Uint8Array): void {
    if (this.#mode === 'worker') {
      this.#append(chunk);
      return;
    }
    // The first window carries ftyp(+moov); the host derives its SourceBuffer
    // MIME from SOURCE_OK and appends in order, so the split is informational.
    const kind = this.#deliveredInit ? 'media' : 'init';
    this.#deliveredInit = true;
    this.#postChunk(kind, chunk);
  }

  #deliverSegment(kind: 'init' | 'media', bytes: Uint8Array): void {
    if (this.#mode === 'main') {
      if (kind === 'init') this.#deliveredInit = true;
      this.#postChunk(kind, bytes);
      return;
    }
    this.#append(bytes);
  }

  /**
   * Best-effort release of an SDK no longer in use. A rejected disposal is
   * swallowed: cleanup is a courtesy, never something to surface.
   */
  #disposeSdk(sdk: null | SiaVideoSdk): void {
    if (!sdk) return;
    // Defer the call so a SYNCHRONOUS throw inside dispose() lands on the
    // rejection path too; both cases are swallowed as best-effort cleanup.
    void Promise.resolve()
      .then(() => sdk.dispose?.())
      .catch(() => { /* best-effort */ });
  }

  #drainAppendQueue(): void {
    const sourceBuffer = this.#sourceBuffer;
    if (!sourceBuffer || sourceBuffer.updating || this.#appendQueue.length === 0) return;
    const bytes = this.#appendQueue.shift()!;
    try {
      sourceBuffer.appendBuffer(bytes as unknown as BufferSource);
    } catch (error) {
      this.#postError('decode', this.#requestId, errorDescription(error));
    }
  }

  // Memoized static handshake key pair; generated once per worker lifetime.
  // The private half is raw bytes with no export path on this class and is
  // only ever a derive* input — there is no code path that serializes it,
  // posts it, or returns it. Noble X25519 keygen is synchronous.
  #ensureKeyPair(): WorkerKeyPair {
    this.#keyPair ??= generateWorkerKeyPair();
    return this.#keyPair;
  }

  #ensureSdk(): Promise<null | SiaVideoSdk> {
    if (this.#sdk) return Promise.resolve(this.#sdk);
    // Memoize the in-flight build so overlapping loads for the same connection
    // share one SDK instead of orphan-building duplicates.
    if (this.#inflightSdk) return this.#inflightSdk;
    // Snapshot the connection this build targets (config + decapsulated seed);
    // a HELLO config change or a superseding APP_KEY that lands while creation
    // is in flight invalidates the result, and it must not be cached back over
    // the fresher connection. The seed snapshot holds the reference only — the
    // bytes are scrubbed on replacement, which the equality check (below)
    // reads as "credentials changed" because freshly generated seeds never
    // look like the zeroed-out old ones except with vanishing probability.
    const configAtCreate = this.#config;
    const seedAtCreate = this.#appKeySeed;
    // Identity-guard the memo slot: only the promise stored here clears it, so
    // a stale rejection (or stale success) can never clobber a newer in-flight
    // build that replaced it after a connection change.
    const inflight = this.#createSdk(configAtCreate, seedAtCreate).then(
      (sdk) => {
        if (this.#inflightSdk === inflight) this.#inflightSdk = null;
        if (this.#destroyed || !this.#connectionIs(configAtCreate, seedAtCreate)) {
          // A successfully built SDK that no session will use must still
          // release whatever native resources it grabbed.
          this.#disposeSdk(sdk);
          return null;
        }
        // Adopting a fresh build must release the previous one — a config
        // could oscillate A→B→A and leave the A build whose equality check
        // passed sitting orphaned underneath the newer A instance.
        const previous = this.#sdk;
        this.#sdk = sdk;
        if (previous && previous !== sdk) this.#disposeSdk(previous);
        return sdk;
      },
      () => {
        if (this.#inflightSdk === inflight) this.#inflightSdk = null;
        return null;
      },
    );
    this.#inflightSdk = inflight;
    return inflight;
  }

  /** Creates the worker-side SourceBuffer, deferring to open/flush. */
  #ensureWorkerSourceBuffer(): void {
    const mediaSource = this.#mediaSource ?? this.#openMediaSource();

    if (!mediaSource) return;

    if (mediaSource.readyState !== 'open') {
      mediaSource.addEventListener(
        'sourceopen',
        () => {
          // A torn-down pipeline's listener may outlive its MediaSource
          // assignment; acting then would wire stale buffers into a newer
          // source's pipeline. Only the current media source may proceed.
          if (this.#mediaSource === mediaSource) this.#ensureWorkerSourceBuffer();
        },
        { once: true },
      );
      return;
    }

    try {
      const sourceBuffer = mediaSource.addSourceBuffer(this.#mime);
      sourceBuffer.addEventListener('updateend', () => this.#drainAppendQueue());
      this.#sourceBuffer = sourceBuffer;
      this.#drainAppendQueue();
    } catch (error) {
      this.#postError('decode', this.#requestId, errorDescription(error));
    }
  }

  #forgetSeed(): void {
    if (this.#appKeySeed) scrub(this.#appKeySeed);
    this.#appKeySeed = null;
  }

  #handleAttach(): void {
    // DETACH stopped the read; a re-attach must also drop the pipeline the old
    // target's MSE was wired into, so the host's next SOURCE rebuilds from a
    // clean slate (fresh MediaSource, fresh SourceBuffer, null transmuxer).
    // The epoch bump abandons any probe still in flight from the old session,
    // and the media object is cleared with it so a SEEK/PLAY arriving before
    // the replacement SOURCE cannot start streaming a stale object.
    ++this.#loadEpoch;
    this.#reader?.stop();
    this.#reader = null;
    this.#object = null;
    this.#objectEpoch = 0;
    this.#playRequested = false;
    this.#pendingSeekTime = undefined;
    // Intent parked from here on belongs to the replacement SOURCE the host
    // is about to send; a seek landing in this window survives until then.
    this.#seekParkedSinceAttach = true;
    this.#teardownMediaPipeline();
    this.#post({ mode: this.#mode, requestId: this.#requestId ?? 0, type: 'ATTACH_OK' });
  }

  #handleSeek(time: number): void {
    if (!Number.isFinite(time) || time < 0) return;
    // A seek may arrive while a source is still probing (the host sends it
    // once); park it and apply it when the load completes.
    if (!this.#object) {
      this.#pendingSeekTime = time;
      return;
    }

    if (!this.#reader) {
      // Deferred start (preload 'metadata'/'none'): begin streaming from byte
      // 0. Until the MSE pipeline exists there is no reliable time → byte map
      // (a throughput estimate from just the probe head is meaningless), and
      // none is needed: the `<video>` element re-applies the user's seek from
      // its persisted `currentTime` once buffered data appears.
      this.#startStreaming();
      return;
    }

    const offset = Math.floor(Math.min(time * this.#bytesPerSecond(), this.#reader.size));

    // Stale transmuxer state (previous GOP, media-timestamp bookkeeping) must
    // not interpret bytes from the new position; a new Transmuxer rebuilds it.
    this.#transmuxer = null;

    // Abort in-flight shard recovery and re-download from the sought position.
    this.#reader.seek(offset);
  }

  async #handleSource(
    requestId: RequestId,
    src: string,
    mimeType?: string,
    preload?: 'auto' | 'metadata' | 'none',
  ): Promise<void> {
    const epoch = ++this.#loadEpoch;

    // The superseded load's chunk handlers are dead from this moment, but its
    // WebTransport download would keep pulling an object nobody consumes —
    // stop the reader before any await so a failed replacement can't leave it
    // running.
    this.#reader?.stop();
    this.#reader = null;

    // The pending object reference (and its reader binding) dies with the
    // superseded epoch too: during this probe there is NO current object, so
    // a mid-probe SEEK cannot be routed to the previous object's reader.
    this.#object = null;
    this.#objectEpoch = 0;

    // Play intent is scoped to ONE load attempt: clearing here prevents a
    // stray PLAY that outlived a previous load — e.g. a play signal racing a
    // failed probe — from surprising a later unrelated load with an
    // unprompted auto-start.
    this.#playRequested = false;
    // A parked seek survives supersession: a SOURCE that replaces another
    // still-probing SOURCE carries the seek intent forward, so the player's
    // re-applied currentTime is not stranded when the replacement finally
    // resolves under preload 'none' with no PLAY. Seeks parked with no attach
    // session — e.g. stragglers outside the ATTACH→SOURCE window — are still
    // dropped, matching the intent scoping of failed().
    if (!this.#seekParkedSinceAttach) {
      this.#pendingSeekTime = undefined;
    }

    // Seed the throughput clock from load start: the probe's transfer is the
    // first measurable traffic and parked seeks need a finite estimate.
    this.#firstByteAt = performance.now();

    const failed = (kind: WorkerErrorCode, context: string): void => {
      // Stale playback intent must not leak into a later, unrelated load.
      this.#playRequested = false;
      this.#pendingSeekTime = undefined;
      this.#seekParkedSinceAttach = false;
      this.#postError(kind, requestId, context);
    };

    const sdk = await this.#ensureSdk();
    if (this.#loadEpoch !== epoch || this.#destroyed) return;
    if (!sdk) {
      failed('network', 'No Sia SDK is available: send HELLO config or inject createSdk.');
      return;
    }

    let object: SiaObjectLike;
    try {
      object = await sdk.object(src);
    } catch (error) {
      if (this.#loadEpoch !== epoch) return;
      failed('network', errorDescription(error));
      return;
    }
    if (this.#loadEpoch !== epoch) return;

    // Probe before streaming: the head is one small ranged read, and an
    // unrecognized container never gets past this point.
    const head = await readHead(sdk, object);
    if (this.#loadEpoch !== epoch) return;
    if (head === null) {
      failed('network', 'object is empty or unreadable');
      return;
    }

    const container = sniffContainer(head);
    if (container !== 'fmp4' && container !== 'ts') {
      // Matroska has no remuxer here, and progressive MP4 carries its media
      // inside moov/mdat — not the fragmented layout MSE SourceBuffers
      // append. Both are rejected up front instead of failing deep in the
      // append pipeline with a misleading decode error.
      failed('unsupported', `container: ${container}`);
      return;
    }

    this.#container = container;
    this.#mime = muxMimeForContainer(container, mimeType);
    this.#object = object;
    // The object and the load epoch are bound together: `#startStreaming` only
    // ever engages the object that belongs to the current load, so a mid-probe
    // SEEK can never start streaming a stale object's reader under the new
    // epoch's request id.
    this.#objectEpoch = epoch;
    this.#deliveredInit = false;
    this.#receivedBytes = 0;
    this.#chunksSinceProgress = 0;
    this.#requestId = requestId;

    // A new object means new bytes everywhere: the cache holds nothing but
    // the previous object's ranges — replaying those into the new source
    // would silently decode the wrong video.
    this.#cache.clear();

    // Each source load gets a fresh MSE pipeline: distinct init segments and
    // media timelines can never be appended on top of the previous object's
    // buffered range. The host receives a new HANDLE for the new MediaSource.
    this.#teardownMediaPipeline();

    // A codec-qualified MIME ("/codecs=/") is decisive for isTypeSupported:
    // the remux pipeline vouches for H.264+AAC, so a platform that rejects it
    // can never play this source aloud. A bare container type like
    // 'video/mp4' without codecs stays undecided here — browsers reject the
    // string itself, yet append fine — so the concrete attempt must be left
    // to the actual appends.
    if (
      typeof MediaSource !== 'undefined' &&
      this.#mime.includes('codecs=') &&
      !MediaSource.isTypeSupported(this.#mime)
    ) {
      // Routing through failed() (not a bare postError) clears the parked
      // seek/play intent with the dead load: a MIME-rejected source must not
      // strand a seek that would later auto-start an unrelated replacement
      // load without any PLAY.
      // The object binding above, however, belongs to the load too: leaving
      // it in place lets a later SEEK/PLAY restart the rejected object's
      // download under the dead load's request id, so unbind it with the rest
      // of the failed load's state. #requestId stays as-is, matching every
      // other failed() terminal error: the request-scoped ERROR above already
      // carried it, and a nulling here would diverge from the sibling failure
      // paths without adding a guard (#startStreaming refuses a null object).
      this.#object = null;
      this.#objectEpoch = 0;
      failed('unsupported', `MIME: ${this.#mime}`);
      return;
    }

    if (this.#mode === 'worker') {
      this.#ensureWorkerSourceBuffer();
    }

    this.#post({
      info: {
        container,
        durationSeconds: probeDurationSeconds(head),
        mime: this.#mime,
        mode: this.#mode,
      },
      requestId,
      type: 'SOURCE_OK',
    });

    // The probe head is cached first, so the playback read replays it instead
    // of re-fetching the object start over the network. It is NOT counted here:
    // the replay flows through `#consumeChunk`, which records it exactly once
    // every time it is delivered, keeping `#receivedBytes` per-load and
    // undoubled.
    this.#cache.put(0, head.byteLength, head);

    // The load genuinely succeeded: the parked seek it carried is consumed
    // here, and later sources scope seek intent to themselves again.
    this.#seekParkedSinceAttach = false;
    // Play intent, a parked seek, or an eager preload all begin streaming;
    // a parked seek satisfies the intent (byte 0 start is fine — the element
    // re-applies its currentTime once buffered data is available).
    const pendingSeek = this.#pendingSeekTime !== undefined;
    this.#pendingSeekTime = undefined;
    if (preload === 'auto' || this.#playRequested || pendingSeek) {
      this.#playRequested = false;
      this.#startStreaming();
    }
  }

  #openMediaSource(): MediaSource | null {
    if (this.#mode !== 'worker') return null;
    if (!this.#mediaSource) {
      const mediaSource = new MediaSource();
      this.#mediaSource = mediaSource;
      const handle = mediaSourceHandleOf(mediaSource);
      this.#post({ handle, requestId: this.#requestId ?? 0, type: 'HANDLE' }, [handle]);
    }
    return this.#mediaSource;
  }

  /**
   * Hands a chunk to the host with a buffer this isolate owns exclusively.
   * Stream chunks and subarray slices can share one underlying ArrayBuffer
   * with LRU-cache entries and sibling slices; transferring such a buffer
   * would detach every co-inhabiting view. A shallow copy is transferred
   * instead — same cost as the structured-clone fallback, but the host side
   * stays zero-copy.
   */
  #postChunk(kind: 'init' | 'media', chunk: Uint8Array): void {
    const bytes = chunk.slice();
    this.#post(
      { bytes, kind, requestId: this.#requestId ?? 0, type: 'CHUNK' },
      [bytes.buffer],
    );
  }

  #postError(kind: WorkerErrorCode, requestId: null | RequestId, context?: string): void {
    if (this.#destroyed) return;
    this.#post({ context, kind, requestId, type: 'ERROR' });
  }

  #postProgress(): void {
    if (this.#requestId === null) return;
    this.#post({
      buffered: this.#workerBufferedWindows(),
      received: this.#receivedBytes,
      requestId: this.#requestId,
      type: 'PROGRESS',
    });
  }

  #remux(chunk: Uint8Array): void {
    this.#transmuxer ??= createTransmuxer((event) => {
      if (event.initSegment?.byteLength) this.#deliverSegment('init', event.initSegment);
      if (event.data?.byteLength) this.#deliverSegment('media', event.data);
    });

    try {
      this.#transmuxer.push(chunk);
      this.#transmuxer.flush();
    } catch (error) {
      this.#postError('decode', this.#requestId, errorDescription(error));
    }
  }

  // Swaps in a freshly decrypted seed and scrubs the previous copy, so the
  // only plaintext seed in the isolate is the one that is actually current.
  #replaceSeed(seed: Uint8Array): void {
    const stale = this.#appKeySeed;
    this.#appKeySeed = seed;
    if (stale) scrub(stale);
  }

  #startStreaming(): void {
    if (!this.#object || this.#reader || this.#destroyed) return;
    // Only engage the object current to this load; a stale epoch's object
    // must never be bound to the current reader.
    if (this.#objectEpoch !== this.#loadEpoch) return;
    if (!this.#sdk || this.#loadEpoch === 0) return;

    const epoch = this.#loadEpoch;
    const requestId = this.#requestId;
    if (requestId === null) return;

    this.#reader = new RangedReader({
      cache: this.#cache,
      chunkSize: CHUNK_SIZE,
      object: this.#object,
      onChunk: (chunk, position) => this.#consumeChunk(chunk, position, epoch),
      onError: (error) => this.#postError('network', requestId, errorDescription(error)),
      sdk: this.#sdk,
    });
    this.#reader.start(0);
  }

  // Drops MSE state belonging to a finished source/attachment. The next
  // SOURCE opens a brand-new MediaSource (and hands the host a new HANDLE).
  #teardownMediaPipeline(): void {
    this.#appendQueue = [];
    this.#transmuxer = null;
    this.#deliveredInit = false;
    if (this.#mediaSource && this.#sourceBuffer) {
      try {
        this.#sourceBuffer.abort();
        this.#mediaSource.removeSourceBuffer(this.#sourceBuffer);
      } catch {
        // The pipeline is being discarded; a partial cleanup is harmless.
      }
    }
    this.#sourceBuffer = null;
    this.#mediaSource = null;
  }

  #workerBufferedWindows(): { end: number; start: number; }[] {
    if (this.#mode !== 'worker' || !this.#sourceBuffer) return [];
    const ranges = this.#sourceBuffer.buffered;
    const windows: { end: number; start: number; }[] = [];
    for (let i = 0; i < ranges.length; i++) {
      windows.push({ end: ranges.end(i), start: ranges.start(i) });
    }
    return windows;
  }
}

/**
 * Media duration of an MP4/fMP4 head when the `mvhd` box sits inside the probe
 * window. `null` otherwise — fragmented files rarely carry usable duration in
 * the head — which the seek path covers with its throughput estimate.
 */
export function probeDurationSeconds(head: Uint8Array): null | number {
  const view = new DataView(head.buffer, head.byteOffset, head.byteLength);
  let offset = 0;
  while (offset + 8 <= head.length) {
    const size = view.getUint32(offset);
    const type = String.fromCharCode(
      head[offset + 4],
      head[offset + 5],
      head[offset + 6],
      head[offset + 7],
    );
    if (type === 'moov') break;
    if (type === 'mdat') return null;
    if (size < 8 || offset + size > head.length) return null;
    offset += size;
  }

  const boxEnd = offset + 8;
  const mvhd = head.indexOf('mvhd'.charCodeAt(0), boxEnd);
  if (mvhd < 0 || mvhd + 4 > head.length) return null;
  if (
    head[mvhd + 1] !== 'v'.charCodeAt(0) ||
    head[mvhd + 2] !== 'h'.charCodeAt(0) ||
    head[mvhd + 3] !== 'd'.charCodeAt(0)
  ) {
    return null;
  }

  const version = head[mvhd + 4];
  if (version === 1) {
    // Version-1 bodies extend to mvhd + 36 (creation/modification are 64-bit);
    // reading a truncated one would throw instead of reporting "no duration".
    if (mvhd + 36 > head.length) return null;
    const timescale = view.getUint32(mvhd + 24);
    if (!timescale) return null;
    return Number(view.getBigUint64(mvhd + 28)) / timescale;
  }
  if (mvhd + 24 > head.length) return null;
  const timescale = view.getUint32(mvhd + 16);
  if (!timescale) return null;
  return view.getUint32(mvhd + 20) / timescale;
}

/**
 * Exposes the worker's `dispose` cleanup contract on a WASM SDK whose own
 * lifecycle API is `free()`/`[Symbol.dispose]`, so every "abandon this SDK"
 * path releases the native (WASM/WebTransport) resources it holds.
 */
export function withDisposal(sdk: SiaVideoSdk): SiaVideoSdk {
  // Non-mutating: the WASM SDK object (and any shared injected instance) is
  // left untouched; the wrapper forwards to it and exposes the release
  // contract (`dispose` and [Symbol.dispose]) over the SDK's own lifecycle
  // API, with both entry points sharing one release-once latch.
  const underlying = sdk as unknown as {
    [Symbol.dispose]?: () => unknown;
    dispose?: () => unknown;
    free?: () => unknown;
  };
  const nativeDispose = typeof underlying.dispose === 'function' ? underlying.dispose : undefined;
  const nativeSymbolDispose =
    typeof underlying[Symbol.dispose] === 'function' ? underlying[Symbol.dispose] : undefined;
  const nativeFree = typeof underlying.free === 'function' ? underlying.free : undefined;

  // The real @siafoundation/sia-storage SDK aliases [Symbol.dispose] to
  // free(), so running more than one hook would double-release the WASM
  // object. Exactly one hook runs: the SDK's own dispose() when present,
  // otherwise [Symbol.dispose], otherwise free(). Both synthesized entry
  // points share this one latched release, so a caller (or teardown path)
  // that invokes dispose() and then [Symbol.dispose] still releases exactly
  // once.
  const release = nativeDispose ?? nativeSymbolDispose ?? nativeFree;
  let releaseOnce: (() => unknown) | undefined;
  if (release) {
    let released = false;
    releaseOnce = (): unknown => {
      if (released) return undefined;
      released = true;
      return release.call(underlying);
    };
  }

  // Bound forwards and synthesized hooks are memoized so every repeated read
  // of a member yields one stable identity; a fresh bind per access would
  // break WeakMap-keyed use and stored method references.
  const members = new Map<string | symbol, unknown>();

  return new Proxy(sdk, {
    get(target, property) {
      if (members.has(property)) return members.get(property);
      // Both disposal entry points route through the shared latched release:
      // handing out a genuine underlying hook bound would let it fire a second
      // time after the other entry point already released (the sia-storage SDK
      // aliases [Symbol.dispose] to free()). The selected native hook is still
      // the one that runs — just behind the latch.
      if (releaseOnce && (property === 'dispose' || property === Symbol.dispose)) {
        members.set(property, releaseOnce);
        return releaseOnce;
      }
      const value = Reflect.get(target, property, target) as unknown;
      if (typeof value === 'function') {
        const callable = value as (...args: unknown[]) => unknown;
        const bound = callable.bind(target);
        members.set(property, bound);
        return bound;
      }
      return value;
    },
  });
}

/**
 * Byte equality over two decapsulated seeds (or nulls). Used as half of the
 * SDK connection identity: an accepted seed must never be compared through a
 * setter-identity or wire-bytes lens — the wire carries only ciphertext, so
 * byte equality of the decrypted seeds is the only honest comparison. A
 * replaced seed's old buffer is scrubbed to zeros, which changes its bytes
 * and therefore reads as "credentials changed" here.
 */
function appKeySeedsEqual(a: null | Uint8Array, b: null | Uint8Array): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.byteLength !== b.byteLength) return false;
  for (let i = 0; i < a.byteLength; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

async function createDefaultSdk(config: undefined | WorkerConfig, seed: null | Uint8Array): Promise<SiaVideoSdk> {
  // The seed only exists after a completed APP_KEY handshake (or has been
  // injected via a custom createSdk); config alone can never authenticate.
  if (!config || !(seed instanceof Uint8Array) || seed.byteLength === 0) {
    throw new Error('No Sia SDK is available: complete the HELLO + APP_KEY handshake or inject createSdk.');
  }

  await initSia();

  const builder = new Builder(config.indexerUrl, config.app);
  const appKey = new AppKey(seed);
  const sdk = await builder.connected(appKey);
  if (!sdk) throw new Error('The Sia app key is not registered with the indexer.');
  return withDisposal(sdk);
}

function createTransmuxer(onData: (event: TransmuxerDataEvent) => void): Transmuxer {
  const transmuxer = new muxMp4.Transmuxer({ baseMediaDecodeTime: 0 });
  transmuxer.on('data', onData as (event?: unknown) => void);
  return transmuxer;
}

function defaultPost(message: WorkerToMainMessage, transfer?: Transferable[]): void {
  (self as unknown as { postMessage(message: unknown, options?: { transfer?: Transferable[] }): void }).postMessage(
    message,
    transfer?.length ? { transfer } : undefined,
  );
}

function detectWorkerMseSupport(): boolean {
  return typeof MediaSource !== 'undefined' && MediaSource.canConstructInDedicatedWorker === true;
}

function errorDescription(error: unknown): string {
  if (error instanceof Error) return error.message.slice(0, 240);
  return String(error).slice(0, 240);
}


function mediaSourceHandleOf(mediaSource: MediaSource): MediaSourceHandle {
  return (mediaSource as unknown as { handle: MediaSourceHandle }).handle;
}

/**
 * MIME used for `SourceBuffer` creation, preferring a caller-declared type.
 * For TS input the worker remuxes to fMP4, so a declared transport type like
 * `video/mp2t` (the common `type` on a `<source>` tag) must not leak into
 * SourceBuffer creation — only an MP4-flavoured declared type describes the
 * actual append format.
 */
function muxMimeForContainer(container: ContainerKind, declaredType?: string): string {
  // Passthrough stays generic ISO BMFF unless the declared type is MP4-flavoured
  // AND remembers to be codec-qualified; anything else (WebM, MPEG-TS, bare
  // video/*) cannot describe the real append format.
  if (container !== 'ts') {
    if (declaredType && /mp4/i.test(declaredType) && declaredType.includes('codecs=')) return declaredType;
    return 'video/mp4';
  }
  // The TS path remuxes to fMP4 and the remuxer alone controls the output
  // codec/container. Any declared transport type — `video/mp2t`,
  // `video/mp4`, an arbitrary codec string — is ignored in favour of the
  // pipeline's known H.264+AAC file, which is the only MIME that can describe
  // what actually reaches the SourceBuffer.
  return DEFAULT_FMP4_MIME;
}

/** Reads the first `HEAD_PROBE_LENGTH` bytes without starting the full pipeline. */
async function readHead(sdk: SiaSdkLike, object: SiaObjectLike): Promise<null | Uint8Array> {
  try {
    const stream = sdk.download(object, { length: HEAD_PROBE_LENGTH, offset: 0 });
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (total < HEAD_PROBE_LENGTH) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      total += value.byteLength;
    }
    void reader.cancel().catch(() => { /* empty */ });
    if (total === 0) return null;

    const head = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      const remaining = Math.min(chunk.byteLength, total - offset);
      head.set(chunk.subarray(0, remaining), offset);
      offset += remaining;
    }
    return head;
  } catch {
    return null;
  }
}

/**
 * True when two HELLO worker configs describe the same connection. The app
 * metadata is descriptive only (it is not part of SDK auth), so identity is
 * the indexer endpoint; the app-key seed half of the connection identity is
 * compared separately by `appKeySeedsEqual`, because the seed now lives
 * outside the wire config entirely.
 */
function workerConfigsEqual(a: undefined | WorkerConfig, b: undefined | WorkerConfig): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.indexerUrl === b.indexerUrl;
}
