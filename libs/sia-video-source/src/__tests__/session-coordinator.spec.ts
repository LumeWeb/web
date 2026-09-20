/**
 * TDD contract for the `SessionCoordinator` / `WorkerComposition` adapter:
 * the tested composition-root seam that wires the pieces — `LoadPipeline`,
 * `ProducerFactory`, `StreamController`, `ContainerClassifier`, ordered
 * `IndexBuilder[]`, `ByteSource`, `AppendSink`, `Clock`, `ErrorReporter` —
 * into one protocol-compatible adapter.
 *
 * The coordinator is protocol-compatible (`handleMessage` speaks the existing
 * `MainToWorkerMessage` wire types and posts existing `WorkerToMainMessage`s)
 * and driven entirely through injected fakes (`createSource` returns a
 * `MemoryByteSource`, no Sia SDK or MSE).
 *
 * Scope: the coordinator's protocol/lifecycle wiring is driven through
 * injected fakes over fMP4/TS fixtures; per-container producer internals are
 * covered by the dedicated producer specs.
 */

import { describe, expect, it, vi } from 'vitest';
import { encryptToWorker } from '../app-key-handshake.ts';
import { capabilityVerdict } from '../capabilities/codec-verdict.ts';
import type { PlaybackCapabilities } from '../capabilities/browser-capabilities.ts';
import type { ProducerFactoryRegistry } from '../container/producer/producer-factory.ts';
import {
  DEFAULT_FMP4_MIME,
  isWorkerToMainMessage,
  type MainToWorkerMessage,
  PROTOCOL_VERSION,
  type WorkerConfig,
  type WorkerToMainMessage,
} from '../protocol.ts';
import {
  createSessionCoordinator,
  type SessionCoordinator,
  type SessionCoordinatorDeps,
  type SinkFactoryContext,
} from '../session/session-coordinator.ts';
import { TS_REMUX_CODECS } from '../session/source-capabilities.ts';
import type { AppendSink } from '../sink/append-sink.ts';
import type { ByteRange, ByteSource, ReadOptions } from '../transport/byte-source.ts';
import { MemoryByteSource } from '../transport/memory-byte-source.ts';

// ---- fixtures ----------------------------------------------------------------

interface Driver {
  coordinator: SessionCoordinator;
  errors(): Extract<WorkerToMainMessage, { type: 'ERROR'; }>[];
  messages: WorkerToMainMessage[];
  say(message: MainToWorkerMessage): Promise<void>;
}

/**
 * An `AppendSink` that records which state-changing calls the stream
 * controller actually issued, so the coordinator's PLAYHEAD/SEEK forwarding
 * guards are observable (a dropped message reaches none of these calls).
 */
class RecordingSink implements AppendSink {
  aborted = false;
  appended = 0;
  eosRequests = 0;
  evictions: number[] = [];
  resetParsers = 0;

  abort(): void {
    this.aborted = true;
  }

  append(): void {
    this.appended += 1;
  }

  evictBackBuffer(timeSeconds: number): Promise<boolean> {
    this.evictions.push(timeSeconds);
    return Promise.resolve(true);
  }

  requestEndOfStream(): void {
    this.eosRequests += 1;
  }

  resetParser(): void {
    this.resetParsers += 1;
  }
}

/**
 * A `ByteSource` that parks exactly one read (the `parkAt`-th in read order)
 * until `release()` — the coordinator's reads are deterministic (probe, index
 * build, then the per-range stream reads), so this holds the controller's
 * first range read in flight while the test issues a SEEK.
 */
class SequencedReleaseSource implements ByteSource {
  get size(): number {
    return this.#bytes.byteLength;
  }
  readonly #bytes: Uint8Array;
  readonly #parkAt: number;
  #reads = 0;

  #release: (() => void) | null = null;

  constructor(bytes: Uint8Array, parkAt: number) {
    this.#bytes = bytes;
    this.#parkAt = parkAt;
  }

  cancel(): void {
    // Test double: no transport work to cancel.
  }

  read(range: ByteRange, _options: ReadOptions): ReadableStream<Uint8Array> {
    const start = Math.max(0, Math.floor(range.offset));
    const end = Math.min(this.#bytes.byteLength, start + Math.max(0, Math.floor(range.length)));
    const bytes = this.#bytes;
    const at = ++this.#reads;
    return new ReadableStream<Uint8Array>({
      start: (controller) => {
        const deliver = () => {
          controller.enqueue(bytes.slice(start, end));
          controller.close();
        };
        if (at === this.#parkAt) {
          this.#release = deliver;
        } else {
          queueMicrotask(deliver);
        }
      },
    });
  }

  release(): void {
    const release = this.#release;
    this.#release = null;
    release?.();
  }
}

/** Errors every read with a hard (non-superseded) transport failure. */
class ThrowingReadSource implements ByteSource {
  readonly size = 500;

  cancel(): void {
    // Test double: no transport work to cancel.
  }

  read(_range: ByteRange, _options: ReadOptions): ReadableStream<Uint8Array> {
    return new ReadableStream<Uint8Array>({
      start(controller) {
        controller.error(new Error('transport down'));
      },
    });
  }
}

/** Three 30 s RAP ranges, each 5008 bytes (segments marked 0x11/0x22/0x33). */
function boundedIndexedFmp4Payload(): Uint8Array {
  const u16 = (value: number) => [value >>> 8, value & 255];
  const u32 = (value: number) => [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
  const segmentLength = 5008;
  const ftyp = isoBox('ftyp', [105, 115, 111, 109]);
  const mvhd = isoBox('mvhd', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ...u32(1000), ...u32(90_000)]);
  const moov = isoBox('moov', [...mvhd]);
  const sidx = isoBox('sidx', [
    0, 0, 0, 0, ...u32(1), ...u32(1000), ...u32(0), ...u32(0), ...u16(0), ...u16(3),
    ...u32(segmentLength), ...u32(30_000), 0x80, 0, 0, 0,
    ...u32(segmentLength), ...u32(30_000), 0x80, 0, 0, 0,
    ...u32(segmentLength), ...u32(30_000), 0x80, 0, 0, 0,
  ]);
  const segment = (marker: number) =>
    new Uint8Array([...isoBox('moof', []), ...isoBox('mdat', Array.from(new Uint8Array(4992).fill(marker)))]);
  return new Uint8Array([...ftyp, ...moov, ...sidx, ...segment(0x11), ...segment(0x22), ...segment(0x33)]);
}

async function flush(): Promise<void> {
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 10));
}

function isoBox(type: string, body: number[]): number[] {
  const u32 = (value: number) => [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
  const size = body.length + 8;
  return [...u32(size), ...type.split('').map((c) => c.charCodeAt(0)), ...body];
}

// ---- driver -----------------------------------------------------------------

function makeDriver(options: {
  capabilities?: PlaybackCapabilities;
  createSource?: (src: string) => Promise<ByteSource>;
  headProbeLength?: number;
  onPlayhead?: (timeSeconds: number) => void;
  producerFactory?: ProducerFactoryRegistry;
  sinkFactory?: (context: SinkFactoryContext) => AppendSink;
  supportsWorkerMse?: () => boolean;
} = {}): Driver {
  const messages: WorkerToMainMessage[] = [];
  const createSource = options.createSource ?? ((src: string) => {
    if (src === 'ts') return Promise.resolve(new MemoryByteSource(tsHead()));
    if (src === 'unknown') return Promise.resolve(new MemoryByteSource(unknownHead()));
    return Promise.resolve(new MemoryByteSource(boundedIndexedFmp4Payload()));
  });

  const deps: SessionCoordinatorDeps = {
    capabilities: options.capabilities ?? permissiveCapabilities(),
    createSource,
    headProbeLength: options.headProbeLength,
    onPlayhead: options.onPlayhead,
    post: (message) => messages.push(message),
    producerFactory: options.producerFactory,
    sinkFactory: options.sinkFactory,
    supportsWorkerMse: options.supportsWorkerMse ?? (() => false),
  };
  const coordinator = createSessionCoordinator(deps);
  return {
    coordinator,
    errors: () => messages.filter((m): m is Extract<WorkerToMainMessage, { type: 'ERROR'; }> => m.type === 'ERROR'),
    messages,
    say: (message) => coordinator.handleMessage(message),
  };
}

function posted<Type extends WorkerToMainMessage['type']>(driver: Driver, type: Type): Extract<WorkerToMainMessage, { type: Type; }>[] {
  return driver.messages.filter((m): m is Extract<WorkerToMainMessage, { type: Type; }> => m.type === type);
}

/** 3 MPEG-TS transport packets with 0x47 sync bytes. */
function tsHead(): Uint8Array {
  return new Uint8Array(3 * 188).map((_, i) => (i % 188 === 0 ? 0x47 : i % 251));
}

function unknownHead(): Uint8Array {
  return new Uint8Array(512).map((_, i) => i % 251);
}

// ---- tests ------------------------------------------------------------------

describe('SessionCoordinator (WorkerComposition adapter)', () => {
  it('composes the seams and streams an fMP4 SOURCE to SOURCE_OK + CHUNK + ENDED (main mode)', async () => {
    const driver = makeDriver();
    await driver.say({ requestId: 1, type: 'ATTACH' });
    await driver.say({ preload: 'auto', requestId: 2, src: 'fmp4', type: 'SOURCE' });
    await flush();

    const attach = driver.messages.find((m) => m.type === 'ATTACH_OK');
    expect(attach).toMatchObject({ mode: 'main', requestId: 1 });

    const ok = posted(driver, 'SOURCE_OK');
    expect(ok).toHaveLength(1);
    expect(ok[0].requestId).toBe(2);
    expect(ok[0].info.container).toBe('fmp4');
    expect(ok[0].info.playback).toBe('passthrough');
    expect(ok[0].info.indexGranularity).toBe('exact-byte');
    expect(ok[0].info.mode).toBe('main');
    expect(ok[0].info.mime).toBe('video/mp4');

    const chunks = posted(driver, 'CHUNK');
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].kind).toBe('init');
    expect(chunks.every((chunk) => chunk.requestId === 2)).toBe(true);
    const delivered = concatBytes(chunks.map((chunk) => chunk.bytes));
    expect(containsInOrder(delivered, segmentMarker(0x11))).toBe(true);
    expect(containsInOrder(delivered, segmentMarker(0x22))).toBe(true);
    expect(containsInOrder(delivered, segmentMarker(0x33))).toBe(true);

    const ended = posted(driver, 'ENDED');
    expect(ended).toHaveLength(1);
    expect(ended[0].requestId).toBe(2);
    expect(driver.errors()).toEqual([]);
  });

  it('reports the TS route as normalized/throughput and defers streaming under preload none', async () => {
    const driver = makeDriver();
    await driver.say({ preload: 'none', requestId: 2, src: 'ts', type: 'SOURCE' });
    await flush();

    const ok = posted(driver, 'SOURCE_OK');
    expect(ok).toHaveLength(1);
    expect(ok[0].info.container).toBe('ts');
    expect(ok[0].info.playback).toBe('normalized');
    expect(ok[0].info.indexGranularity).toBe('throughput');
    expect(ok[0].info.mime).toBe(DEFAULT_FMP4_MIME);
    expect(ok[0].info.tracks).toEqual(TS_REMUX_CODECS.map(({ codec, kind }) => ({ codec, kind })));
    // preload 'none' + no play/seek intent → no streaming begins.
    expect(posted(driver, 'CHUNK')).toEqual([]);
    expect(posted(driver, 'ENDED')).toEqual([]);
  });

  it('rejects an unclassifiable container with a protocol ERROR (unsupported) scoped to the request', async () => {
    const driver = makeDriver();
    await driver.say({ preload: 'auto', requestId: 3, src: 'unknown', type: 'SOURCE' });
    await flush();

    expect(posted(driver, 'SOURCE_OK')).toEqual([]);
    const errors = driver.errors();
    expect(errors).toHaveLength(1);
    expect(errors[0].kind).toBe('unsupported');
    expect(errors[0].requestId).toBe(3);
    expect(errors[0].context).toMatch(/container:/);
    expect(posted(driver, 'CHUNK')).toEqual([]);
    expect(posted(driver, 'ENDED')).toEqual([]);
  });

  it('answers HELLO and accepts APP_KEY envelopes through the real handshake', async () => {
    const driver = makeDriver();
    await driver.say({ requestId: 1, type: 'HELLO' });

    const hello = posted(driver, 'HELLO_OK');
    expect(hello).toHaveLength(1);
    expect(hello[0].requestId).toBe(1);
    expect(hello[0].version).toBe(PROTOCOL_VERSION);
    expect(hello[0].features).toEqual({ workerMse: false });
    expect(hello[0].publicKey.byteLength).toBe(32);

    const seed = new Uint8Array(32).fill(7);
    const envelope = await encryptToWorker(hello[0].publicKey, seed);
    await driver.say({ envelope, requestId: 2, type: 'APP_KEY' });
    expect(driver.errors()).toEqual([]);
  });

  it('surfaces a rejected APP_KEY envelope as a request-less network ERROR', async () => {
    const driver = makeDriver();
    await driver.say({ requestId: 1, type: 'HELLO' });
    const hello = posted(driver, 'HELLO_OK');
    const seed = new Uint8Array(32).fill(7);
    const envelope = await encryptToWorker(hello[0].publicKey, seed);
    const tampered = { ...envelope, ciphertext: new Uint8Array(envelope.ciphertext).map((b) => b ^ 0xff) };

    await driver.say({ envelope: tampered, requestId: 2, type: 'APP_KEY' });

    const errors = driver.errors();
    expect(errors).toHaveLength(1);
    expect(errors[0].kind).toBe('network');
    expect(errors[0].requestId).toBeNull();
  });

  it('routes HELLO/APP_KEY through an injected handshake seam', async () => {
    const acceptAppKey = vi.fn().mockResolvedValue(undefined);
    const publicKey = new Uint8Array(32).fill(3);
    const messages: WorkerToMainMessage[] = [];
    const coordinator = createSessionCoordinator({
      createSource: () => Promise.resolve(new MemoryByteSource(new Uint8Array(0))),
      handshake: {
        acceptAppKey,
        hello: vi.fn(() => ({ publicKey })),
      },
      post: (message) => messages.push(message),
      supportsWorkerMse: () => false,
    });

    await coordinator.handleMessage({ requestId: 1, type: 'HELLO' });
    const envelope = { ciphertext: new Uint8Array(2), ephemeralPublicKey: publicKey, iv: new Uint8Array(12) };
    await coordinator.handleMessage({ envelope, requestId: 2, type: 'APP_KEY' });

    const hello = messages.find((m) => m.type === 'HELLO_OK');
    expect(hello).toMatchObject({ publicKey, requestId: 1 });
    expect(acceptAppKey).toHaveBeenCalledWith(envelope);
  });

  it('drops a superseded SOURCE: only the replacement posts SOURCE_OK and streams', async () => {
    let resolveFirst: (source: ByteSource) => void = () => undefined;
    const firstSourcePromise = new Promise<ByteSource>((resolve) => {
      resolveFirst = resolve;
    });
    const driver = makeDriver({
      createSource: async (src) => {
        if (src === 'first') return firstSourcePromise;
        return new MemoryByteSource(boundedIndexedFmp4Payload());
      },
    });

    // SOURCE A stays pending; SOURCE B (auto) resolves and completes first.
    void driver.say({ preload: 'none', requestId: 1, src: 'first', type: 'SOURCE' });
    await driver.say({ preload: 'auto', requestId: 2, src: 'fmp4', type: 'SOURCE' });
    await flush();

    // Only B succeeded; A's later resolution must not surface SOURCE_OK/stale chunks.
    resolveFirst(new MemoryByteSource(boundedIndexedFmp4Payload()));
    await flush();

    const ok = posted(driver, 'SOURCE_OK');
    expect(ok).toHaveLength(1);
    expect(ok[0].requestId).toBe(2);
    expect(posted(driver, 'CHUNK').every((chunk) => chunk.requestId === 2)).toBe(true);
    expect(driver.errors()).toEqual([]);
  });

  it('parks a SEEK issued before the load resolves and starts streaming on completion', async () => {
    const driver = makeDriver();
    const pending = driver.say({ preload: 'none', requestId: 2, src: 'fmp4', type: 'SOURCE' });
    void driver.say({ requestId: 3, time: 35, type: 'SEEK' });
    await pending;
    await flush();

    expect(posted(driver, 'SOURCE_OK')).toHaveLength(1);
    expect(posted(driver, 'CHUNK').length).toBeGreaterThan(0);
    expect(posted(driver, 'ENDED')).toHaveLength(1);
    expect(driver.errors()).toEqual([]);
  });

  it('applies a SEEK parked during the probe to the requested floor once the load resolves (preload auto)', async () => {
    // Hold the SOURCE resolution so the SEEK lands while no session exists yet.
    let resolveSource: (source: ByteSource) => void = () => undefined;
    const sourcePromise = new Promise<ByteSource>((resolve) => {
      resolveSource = resolve;
    });
    const driver = makeDriver({ createSource: () => sourcePromise });

    const pending = driver.say({ preload: 'auto', requestId: 2, src: 'fmp4', type: 'SOURCE' });
    void driver.say({ requestId: 3, time: 35, type: 'SEEK' }); // floor → segment 1 (0x22)
    await flush();
    // Still probing: no session yet, so the SEEK is parked, not applied.
    expect(posted(driver, 'SOURCE_OK')).toEqual([]);

    resolveSource(new MemoryByteSource(boundedIndexedFmp4Payload()));
    await pending;
    await flush();

    expect(posted(driver, 'SOURCE_OK')).toHaveLength(1);
    const delivered = concatBytes(posted(driver, 'CHUNK').map((chunk) => chunk.bytes));
    // The parked seek repositions streaming to the 0x22 segment: the 0x11
    // first segment is never delivered.
    expect(containsInOrder(delivered, segmentMarker(0x22))).toBe(true);
    expect(containsInOrder(delivered, segmentMarker(0x33))).toBe(true);
    expect(containsInOrder(delivered, segmentMarker(0x11))).toBe(false);
    expect(posted(driver, 'ENDED')).toHaveLength(1);
    expect(driver.errors()).toEqual([]);
  });

  it('clears a parked SEEK when the load it targeted fails, so a later unrelated preload-none SOURCE does not auto-start', async () => {
    let resolveStalled: (source: ByteSource) => void = () => undefined;
    const stalledPromise = new Promise<ByteSource>((resolve) => {
      resolveStalled = resolve;
    });
    const driver = makeDriver({
      createSource: (src) =>
        src === 'stalled' ? stalledPromise : Promise.resolve(new MemoryByteSource(boundedIndexedFmp4Payload())),
    });

    // SOURCE A never resolves its object; the SEEK parked here targets it and
    // must die with the failed load — never light up a later unrelated source.
    void driver.say({ preload: 'none', requestId: 1, src: 'stalled', type: 'SOURCE' });
    void driver.say({ requestId: 2, time: 35, type: 'SEEK' });
    await flush();

    // A resolves to an unclassifiable object → unsupported ERROR; nothing streams.
    resolveStalled(new MemoryByteSource(unknownHead()));
    await flush();
    expect(driver.errors()).toEqual([expect.objectContaining({ kind: 'unsupported', requestId: 1 })]);
    expect(posted(driver, 'CHUNK')).toEqual([]);

    // SOURCE B (preload 'none') resolves with no new intent → still deferred.
    await driver.say({ preload: 'none', requestId: 3, src: 'fmp4', type: 'SOURCE' });
    await flush();
    expect(posted(driver, 'SOURCE_OK')).toHaveLength(1);
    expect(posted(driver, 'CHUNK')).toEqual([]);
    expect(posted(driver, 'ENDED')).toEqual([]);
    expect(driver.errors()).toHaveLength(1);
  });

  it('a PLAY arriving after a parked SEEK still starts streaming from the parked floor (preload none)', async () => {
    let resolveSource: (source: ByteSource) => void = () => undefined;
    const sourcePromise = new Promise<ByteSource>((resolve) => {
      resolveSource = resolve;
    });
    const driver = makeDriver({ createSource: () => sourcePromise });

    void driver.say({ preload: 'none', requestId: 2, src: 'fmp4', type: 'SOURCE' });
    void driver.say({ requestId: 3, time: 35, type: 'SEEK' });
    void driver.say({ requestId: 3, type: 'PLAY' });
    await flush();

    resolveSource(new MemoryByteSource(boundedIndexedFmp4Payload()));
    await flush();

    expect(posted(driver, 'SOURCE_OK')).toHaveLength(1);
    const delivered = concatBytes(posted(driver, 'CHUNK').map((chunk) => chunk.bytes));
    expect(containsInOrder(delivered, segmentMarker(0x22))).toBe(true);
    expect(containsInOrder(delivered, segmentMarker(0x11))).toBe(false);
    expect(posted(driver, 'ENDED')).toHaveLength(1);
    expect(driver.errors()).toEqual([]);
  });

  it('SEEK while playing re-pumps from the seek floor (stale first-range bytes dropped)', async () => {
    // Read order: [0]=probe, [1]=index build, [2]=stream range0. Park [2] so
    // the initial stream read is still in flight when the SEEK lands.
    const source = new SequencedReleaseSource(boundedIndexedFmp4Payload(), 3);
    const driver = makeDriver({ createSource: () => Promise.resolve(source) });

    await driver.say({ requestId: 1, type: 'ATTACH' });
    await driver.say({ preload: 'auto', requestId: 2, src: 'fmp4', type: 'SOURCE' });
    void driver.say({ requestId: 3, time: 35, type: 'SEEK' }); // floor → segment 1 (0x22)
    await flush();

    // Release the superseded range-0 read; its bytes must never be delivered.
    source.release();
    await flush();

    const delivered = concatBytes(posted(driver, 'CHUNK').map((chunk) => chunk.bytes));
    // The seek floor is the 0x22 segment; the 0x11 first segment is never delivered.
    expect(containsInOrder(delivered, segmentMarker(0x22))).toBe(true);
    expect(containsInOrder(delivered, segmentMarker(0x33))).toBe(true);
    expect(containsInOrder(delivered, segmentMarker(0x11))).toBe(false);
    expect(posted(driver, 'ENDED')).toHaveLength(1);
    expect(driver.errors()).toEqual([]);
  });

  it('DETACH cancels the active load and DESTROY stops the coordinator permanently', async () => {
    const driver = makeDriver();
    await driver.say({ preload: 'auto', requestId: 2, src: 'fmp4', type: 'SOURCE' });
    await flush();
    expect(posted(driver, 'CHUNK').length).toBeGreaterThan(0);

    await driver.say({ type: 'DETACH' });
    const chunksAfterDetach = posted(driver, 'CHUNK').length;

    driver.coordinator.destroy();
    await driver.say({ preload: 'auto', requestId: 4, src: 'fmp4', type: 'SOURCE' });
    await flush();

    // Destroyed: the post-destroy SOURCE is ignored; no later CHUNK/ENDED.
    expect(posted(driver, 'CHUNK').length).toBe(chunksAfterDetach);
    expect(posted(driver, 'ENDED')).toHaveLength(1);
    expect(posted(driver, 'ENDED')[0].requestId).toBe(2);
    expect(driver.errors()).toEqual([]);
  });

  it('reports a stream transport failure as a request-scoped network ERROR', async () => {
    const driver = makeDriver({
      createSource: () => Promise.resolve(new ThrowingReadSource()),
    });
    await driver.say({ preload: 'auto', requestId: 2, src: 'fmp4', type: 'SOURCE' });
    await flush();

    const errors = driver.errors();
    expect(errors).toHaveLength(1);
    expect(errors[0].kind).toBe('network');
    expect(errors[0].requestId).toBe(2);
    expect(posted(driver, 'ENDED')).toEqual([]);
  });

  it('drops PLAYHEAD for a stale request id or a non-finite/negative time (worker parity)', async () => {
    const sink = new RecordingSink();
    const driver = makeDriver({ sinkFactory: () => sink, supportsWorkerMse: () => true });
    await driver.say({ preload: 'auto', requestId: 2, src: 'fmp4', type: 'SOURCE' });
    await flush();

    // All three must be ignored: they name another load, or are not valid times.
    await driver.say({ requestId: 99, time: 12, type: 'PLAYHEAD' });
    await driver.say({ requestId: 2, time: Number.NaN, type: 'PLAYHEAD' });
    await driver.say({ requestId: 2, time: -1, type: 'PLAYHEAD' });
    await flush();
    expect(sink.evictions).toEqual([]);

    // The same coordinator still forwards a well-formed playhead for THIS load.
    await driver.say({ requestId: 2, time: 12, type: 'PLAYHEAD' });
    await flush();
    expect(sink.evictions).toEqual([12]);
  });

  it('drops a SEEK with a non-finite or negative time (worker parity)', async () => {
    const driver = makeDriver();
    // preload 'none' + no session yet: a parked seek is the ONLY way streaming
    // intent can reach this load, so an invalid time must leave it unstarted.
    const pending = driver.say({ preload: 'none', requestId: 2, src: 'fmp4', type: 'SOURCE' });
    void driver.say({ requestId: 3, time: -5, type: 'SEEK' });
    await pending;
    await flush();

    expect(posted(driver, 'SOURCE_OK')).toHaveLength(1);
    expect(posted(driver, 'CHUNK')).toEqual([]);
    expect(posted(driver, 'ENDED')).toEqual([]);

    // A valid seek then starts streaming from the call site.
    await driver.say({ requestId: 3, time: 35, type: 'SEEK' });
    await flush();
    expect(posted(driver, 'CHUNK').length).toBeGreaterThan(0);
    expect(posted(driver, 'ENDED')).toHaveLength(1);
  });

  it('posts only wire-valid WorkerToMainMessage payloads', async () => {
    const driver = makeDriver();
    await driver.say({ requestId: 1, type: 'ATTACH' });
    await driver.say({ preload: 'auto', requestId: 2, src: 'fmp4', type: 'SOURCE' });
    await flush();
    await driver.say({ preload: 'auto', requestId: 3, src: 'unknown', type: 'SOURCE' });
    await flush();

    for (const message of driver.messages) {
      expect(isWorkerToMainMessage(message), `invalid wire message: ${JSON.stringify(message)}`).toBe(true);
    }
  });

  it('hands each load its context (mime, durationSeconds, requestId) to sinkFactory', async () => {
    const contexts: SinkFactoryContext[] = [];
    const driver = makeDriver({
      sinkFactory: (context) => {
        contexts.push(context);
        return new RecordingSink();
      },
      supportsWorkerMse: () => true,
    });
    await driver.say({ preload: 'auto', requestId: 2, src: 'fmp4', type: 'SOURCE' });
    await flush();

    // One sink is created per accepted load, with the produced MIME and the
    // pipeline-vouched duration (from the sidx index for finite VOD).
    expect(contexts).toHaveLength(1);
    expect(contexts[0].requestId).toBe(2);
    expect(contexts[0].mime).toBe('video/mp4');
    expect(contexts[0].durationSeconds).toBe(90);
  });


  it('forces main-thread CHUNK mode when the HELLO config prefers main on a worker-capable runtime', async () => {
    const driver = makeDriver({ supportsWorkerMse: () => true });
    await driver.say({ config: { ...appConfig(), workerMse: 'main' }, requestId: 1, type: 'HELLO' });
    await driver.say({ requestId: 2, type: 'ATTACH' });

    // HELLO_OK and ATTACH_OK both advertise the host-preferred main mode.
    expect(posted(driver, 'HELLO_OK').at(-1)).toMatchObject({ features: { workerMse: false } });
    expect(posted(driver, 'ATTACH_OK').at(-1)).toMatchObject({ mode: 'main' });

    await driver.say({ preload: 'auto', requestId: 3, src: 'fmp4', type: 'SOURCE' });
    await flush();

    // Main mode uses the posting sink even though the runtime supports worker
    // MSE: produced bytes leave as CHUNK, never as a HANDLE'd worker pipe.
    expect(posted(driver, 'SOURCE_OK').at(-1)).toMatchObject({ info: { mode: 'main' } });
    expect(posted(driver, 'CHUNK').length).toBeGreaterThan(0);
    expect(posted(driver, 'HANDLE')).toEqual([]);
    expect(posted(driver, 'ENDED').length).toBeGreaterThan(0);
  });

  it('keeps worker mode when the HELLO config prefers auto on a worker-capable runtime', async () => {
    const sink = new RecordingSink();
    const driver = makeDriver({ sinkFactory: () => sink, supportsWorkerMse: () => true });
    await driver.say({ config: { ...appConfig(), workerMse: 'auto' }, requestId: 1, type: 'HELLO' });
    await driver.say({ requestId: 2, type: 'ATTACH' });

    expect(posted(driver, 'HELLO_OK').at(-1)).toMatchObject({ features: { workerMse: true } });
    expect(posted(driver, 'ATTACH_OK').at(-1)).toMatchObject({ mode: 'worker' });

    await driver.say({ preload: 'auto', requestId: 3, src: 'fmp4', type: 'SOURCE' });
    await flush();

    // Worker mode: the MSE-backed sinkFactory is used, no CHUNK is posted.
    expect(posted(driver, 'SOURCE_OK').at(-1)).toMatchObject({ info: { mode: 'worker' } });
    expect(posted(driver, 'CHUNK')).toEqual([]);
    expect(sink.appended).toBeGreaterThan(0);
  });

  it('reflects validated PLAYHEAD and SEEK times into onPlayhead (worker MSE eviction boundary)', async () => {
    const reflected: number[] = [];
    const driver = makeDriver({
      onPlayhead: (timeSeconds) => reflected.push(timeSeconds),
      sinkFactory: () => new RecordingSink(),
      supportsWorkerMse: () => true,
    });
    await driver.say({ preload: 'auto', requestId: 2, src: 'fmp4', type: 'SOURCE' });
    await flush();

    // PLAYHEAD for the active load at a valid time is reflected…
    await driver.say({ requestId: 2, time: 12.5, type: 'PLAYHEAD' });
    expect(reflected).toContain(12.5);

    // …stale request ids and malformed times are dropped at the same guard.
    await driver.say({ requestId: 99, time: 99, type: 'PLAYHEAD' });
    await driver.say({ requestId: 2, time: Number.NaN, type: 'PLAYHEAD' });
    await driver.say({ requestId: 2, time: -1, type: 'PLAYHEAD' });
    expect(reflected).toEqual([12.5]);

    // A valid SEEK is reflected even though it carries no session-wide eviction.
    await driver.say({ requestId: 3, time: 35, type: 'SEEK' });
    expect(reflected).toContain(35);
  });
});

// ---- helpers ----------------------------------------------------------------


/** Minimal HELLO `WorkerConfig` (connection identity) for preference tests. */
function appConfig(): WorkerConfig {
  return {
    app: { appId: 'app', callbackUrl: '', description: '', logoUrl: '', name: 'app', serviceUrl: 'https://app.example' },
    indexerUrl: 'https://indexer.example',
  };
}

function concatBytes(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

function containsInOrder(bytes: Uint8Array, needle: number[]): boolean {
  let at = 0;
  for (const value of needle) {
    const index = bytes.indexOf(value, at);
    if (index < 0) return false;
    at = index + 1;
  }
  return true;
}

/** Node has no `MediaSource`; stub capabilities so the producer eligibility passes. */
function permissiveCapabilities(): PlaybackCapabilities {
  return {
    canConstructWorkerMse: () => false,
    mayDecode: () => capabilityVerdict['unknown-codec'],
    mseSupported: () => true,
    webCodecsAvailable: () => false,
    workerHandleAvailable: () => false,
  };
}

/** A byte run present verbatim in every segment's mdat payload. */
function segmentMarker(marker: number): number[] {
  return [marker, marker, marker, marker, marker, marker, marker, marker];
}
