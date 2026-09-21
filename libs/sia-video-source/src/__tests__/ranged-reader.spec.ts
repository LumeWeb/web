import { describe, expect, it } from 'vitest';
import type { Slab } from '@siafoundation/sia-storage';
import { LruChunkCache, RangedReader, ReadBudget, type SiaObjectLike, type SiaSdkLike } from '../ranged-reader.ts';

/**
 * SDK that mirrors the lazy dual-seed adapter: `download()` returns a parked
 * promise the test resolves (`resolve(i)` materializes the i-th request's
 * stream) or rejects (`reject(i, reason)`). A materialized stream is
 * pull-based — `start` stays silent, `pull` enqueues the requested payload
 * slice then closes — so nothing reaches the reader until `#run` actually
 * reads. Its `cancel()` hook records the stream's offset: a stale async
 * download dropped while still open would leak its WebTransport sessions and
 * show up here as a missing cancel, pinning the adopt-or-cancel invariant.
 */
function deferredSdk(payload: Uint8Array): {
  cancelled: number[];
  reject(index: number, reason: unknown): void;
  requests: { length: number; offset: number }[];
  resolve(index: number): void;
  sdk: SiaSdkLike;
} {
  const cancelled: number[] = [];
  const requests: { length: number; offset: number }[] = [];
  const resolvers: ((stream: ReadableStream<Uint8Array>) => void)[] = [];
  const rejecters: ((reason: unknown) => void)[] = [];

  const sdk: SiaSdkLike = {
    download: (_object, options) => {
      const offset = options?.offset ?? 0;
      const length = options?.length ?? payload.length - offset;
      requests.push({ length, offset });
      return new Promise<ReadableStream<Uint8Array>>((resolve, reject) => {
        resolvers.push(resolve);
        rejecters.push(reject);
      });
    },
  };

  const materialize = (request: { length: number; offset: number }): ReadableStream<Uint8Array> =>
    new ReadableStream<Uint8Array>({
      cancel() {
        cancelled.push(request.offset);
      },
      pull(controller) {
        const end = Math.min(request.offset + request.length, payload.length);
        if (request.offset < end) controller.enqueue(payload.slice(request.offset, end));
        controller.close();
      },
    });

  return {
    cancelled,
    reject(index, reason) {
      rejecters[index]?.(reason);
    },
    requests,
    resolve(index) {
      const request = requests[index];
      if (request) resolvers[index]?.(materialize(request));
    },
    sdk,
  };
}

// objectSize() derives the payload size from the slab map, so fakes must
// return slabs whose lengths add up to the content length.
function fakeObject(contentLength: number): SiaObjectLike {
  const slab = { length: contentLength } as unknown as Slab;
  return { id: () => 'test-object', size: () => contentLength, slabs: () => [slab] };
}

/** SDK whose downloads slice `payload`, returning a fresh buffer per chunk. */
function fakeSdk(payload: Uint8Array): SiaSdkLike {
  return {
    download: (_object, options) => {
      const start = options?.offset ?? 0;
      const end = Math.min(start + (options?.length ?? payload.length - start), payload.length);
      return new ReadableStream<Uint8Array>({
        start: (controller) => {
          const size = Math.max(0, end - start);
          if (size > 0) controller.enqueue(payload.slice(start, end));
          controller.close();
        },
      });
    },
  };
}

const PAYLOAD = new Uint8Array(64 * 1024).map((_, i) => i % 251);
const CHUNK_SIZE = 16 * 1024;

interface Delivered { bytes: Uint8Array; position: number }

function join(delivered: Delivered[]): Uint8Array {
  const total = delivered.reduce((sum, entry) => sum + entry.bytes.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const entry of delivered) {
    out.set(entry.bytes, offset);
    offset += entry.bytes.byteLength;
  }
  return out;
}

function newReader(payload: Uint8Array, delivered: Delivered[], cache?: LruChunkCache): RangedReader {
  return new RangedReader({
    cache,
    chunkSize: CHUNK_SIZE,
    object: fakeObject(payload.length),
    onChunk: (bytes, position) => delivered.push({ bytes, position }),
    sdk: fakeSdk(payload),
  });
}

async function settle(): Promise<void> {
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * SDK whose downloads never deliver a byte and never reach EOF — models a
 * read stalled by exhausted WebTransport sessions ("Too many pending
 * WebTransport sessions (64)"). `cancel` settles so an abort can unwind.
 */
function stalledSdk(): SiaSdkLike {
  return {
    download: () =>
      new ReadableStream<Uint8Array>({
        cancel() {
          /* swallow: lets the watchdog's abort resolve */
        },
        pull() {
          return new Promise<undefined>(() => { /* deliberately never settles */ });
        },
      }),
  };
}

/**
 * Counts unhandled rejections for the duration of one test (node's process
 * `unhandledRejection`). Vitest would fail the run on its own, but asserting
 * the local count pins the contract: a swallowed cancel or an awaited
 * rejection must never surface anywhere.
 */
function trackUnhandledRejections(): { count: () => number; dispose: () => void } {
  let count = 0;
  const listener = () => {
    count++;
  };
  process.on('unhandledRejection', listener);
  return {
    count: () => count,
    dispose: () => {
      process.off('unhandledRejection', listener);
    },
  };
}

describe('RangedReader', () => {
  it('delivers the whole payload from offset 0', async () => {
    const delivered: Delivered[] = [];
    const reader = newReader(PAYLOAD, delivered);
    reader.start();
    await settle();

    expect(join(delivered)).toEqual(PAYLOAD);
    expect(reader.active).toBe(false);
  });

  it('fetches one exact range with a single SDK download', async () => {
    const requests: { length: number; offset: number }[] = [];
    const delivered: Delivered[] = [];
    const reader = new RangedReader({
      chunkSize: CHUNK_SIZE,
      object: fakeObject(PAYLOAD.length),
      onChunk: (bytes, position) => delivered.push({ bytes, position }),
      sdk: {
        download: (object, options) => {
          requests.push({ length: options?.length ?? PAYLOAD.length, offset: options?.offset ?? 0 });
          return fakeSdk(PAYLOAD).download(object, options);
        },
      },
    });

    // A far-seek-like range longer than one chunk.
    reader.start(16 * 1024, 24 * 1024);
    await settle();

    // Exactly one download spans the whole requested range with exact
    // offset/length — never tiled into multiple SDK requests.
    expect(requests).toEqual([{ length: 24 * 1024, offset: 16 * 1024 }]);
    expect(reader.position).toBe(40 * 1024);
    expect(reader.active).toBe(false);

    const out = new Uint8Array(24 * 1024);
    for (const entry of delivered) out.set(entry.bytes, entry.position - 16 * 1024);
    expect(out).toEqual(PAYLOAD.slice(16 * 1024, 40 * 1024));
  });

  it('rejects a short read that ends before the requested range is delivered', async () => {
    const errors: unknown[] = [];
    const reader = new RangedReader({
      chunkSize: CHUNK_SIZE,
      object: fakeObject(PAYLOAD.length),
      onChunk: () => {
        /* partial delivery is expected before the short read surfaces */
      },
      onError: (error) => errors.push(error),
      sdk: {
        download: () =>
          new ReadableStream<Uint8Array>({
            start(controller) {
              controller.enqueue(PAYLOAD.slice(0, 512));
              controller.close();
            },
          }),
      },
    });

    reader.start(0, PAYLOAD.length);
    await settle();
    await settle();

    expect(errors).toHaveLength(1);
    expect((errors[0] as Error).message).toMatch(/before the requested range/);
    expect(reader.active).toBe(false);
  });

  it('a cancelled run does not clobber its replacement’s reader (load-generation guard)', async () => {
    const delivered: Delivered[] = [];
    const reader = newReader(PAYLOAD, delivered);
    reader.start(0);
    // Seek fast enough that the first run is still awaiting its stream read.
    reader.seek(32 * 1024);

    expect(reader.active).toBe(true);
    await settle();

    // The replacement run survived the cancelled run's cleanup and delivered.
    expect(delivered.length).toBeGreaterThan(0);
    expect(join(delivered)).toEqual(PAYLOAD.slice(32 * 1024));
    expect(reader.active).toBe(false);
    expect(reader.position).toBe(PAYLOAD.length);
  });

  it('purges a stale window when an offset is re-put with a new length', () => {
    const cache = new LruChunkCache(8);
    cache.put(0, 10, new Uint8Array(10));
    cache.put(0, 12, new Uint8Array(12));

    // Only the fresh window remains; the `0:10` twin is unreachable.
    expect(cache.size).toBe(1);
    expect(cache.get(0, 12)).toEqual(new Uint8Array(12));
  });

  it('keeps a replacement window reachable when eviction removes its consumed twin', () => {
    const cache = new LruChunkCache(1);
    cache.put(0, 10, new Uint8Array(10));
    expect(cache.takeAt(0)).toEqual(new Uint8Array(10)); // consumes the offset index
    cache.put(0, 12, new Uint8Array(12)); // reindexes offset 0 → 12

    // Even with no further put, offset 0 must still resolve to the fresh 12.
    expect(cache.takeAt(0)).toEqual(new Uint8Array(12));
    expect(cache.takeAt(0)).toBeUndefined();
  });

  it('replays contiguous cached windows across a backward seek without re-downloading', async () => {
    const delivered: Delivered[] = [];
    const cache = new LruChunkCache(64);
    const downloads = { count: 0 };
    const reader = new RangedReader({
      cache,
      chunkSize: CHUNK_SIZE,
      object: fakeObject(PAYLOAD.length),
      onChunk: (bytes, position) => delivered.push({ bytes, position }),
      sdk: {
        download: (object, options) => {
          downloads.count++;
          return fakeSdk(PAYLOAD).download(object, options);
        },
      },
    });
    reader.start();
    await settle();
    const afterFirstRead = delivered.length;

    reader.seek(CHUNK_SIZE);
    await settle();

    // Cached windows replay synchronously and fully satisfy the seek — no
    // further network read is needed.
    expect(reader.active).toBe(false);
    expect(reader.position).toBe(PAYLOAD.length);
    expect(delivered[afterFirstRead].position).toBe(CHUNK_SIZE);
    expect(join(delivered.slice(afterFirstRead))).toEqual(PAYLOAD.slice(CHUNK_SIZE));
    expect(downloads.count).toBe(1);
  });

  it('surfaces an error within the stall timeout when a read stalls instead of hanging', async () => {
    // A stream that never yields (WebTransport sessions exhausted) must be
    // aborted after `stallTimeoutMs` and reported through `onError`, and the
    // reader must release its in-flight state so a retry can proceed.
    const errors: unknown[] = [];
    const reader = new RangedReader({
      chunkSize: CHUNK_SIZE,
      object: fakeObject(PAYLOAD.length),
      onChunk: () => {
        throw new Error('a stalled read must never deliver a chunk');
      },
      onError: (error) => errors.push(error),
      sdk: stalledSdk(),
      stallTimeoutMs: 20,
    });
    const startedAt = Date.now();

    reader.start();
    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(errors).toHaveLength(1);
    expect(reader.active).toBe(false);
    // The stall was aborted promptly — the read must not hang the caller.
    expect(Date.now() - startedAt).toBeLessThan(2000);
  });
});

// The lazy dual-seed adapter (worker-runtime.ts) may hand the reader a
// download that has not resolved when a seek/stop lands. These tests pin the
// adopt-or-cancel invariant: whatever the SDK promised, a resolved stream is
// owned until EOF or cancel, so a stale async stream must be cancelled —
// never dropped still open (leaking its WebTransport sessions).
describe('RangedReader — delayed (promise) download lifecycle', () => {
  it('cancels a stale async download that resolves after stop()', async () => {
    const errors: unknown[] = [];
    const unhandled = trackUnhandledRejections();
    try {
      const delivered: Delivered[] = [];
      const sdk = deferredSdk(PAYLOAD);
      const reader = new RangedReader({
        chunkSize: CHUNK_SIZE,
        object: fakeObject(PAYLOAD.length),
        onChunk: (bytes, position) => delivered.push({ bytes, position }),
        onError: (error) => errors.push(error),
        sdk: sdk.sdk,
      });

      reader.start();
      reader.stop();
      // stop() superseded the run before its async download resolved; the
      // still-open stream must be cancelled exactly once (adopt-or-cancel) so
      // its sessions are released, not leaked.
      sdk.resolve(0);
      await settle();

      expect(sdk.cancelled).toEqual([0]);
      expect(delivered).toEqual([]);
      expect(errors).toEqual([]);
      expect(unhandled.count()).toBe(0);
      expect(reader.active).toBe(false);
    } finally {
      unhandled.dispose();
    }
  });

  it('cancels only the stale async download when a seek replaces it (owner isolation)', async () => {
    const errors: unknown[] = [];
    const delivered: Delivered[] = [];
    const sdk = deferredSdk(PAYLOAD);
    const reader = new RangedReader({
      chunkSize: CHUNK_SIZE,
      object: fakeObject(PAYLOAD.length),
      onChunk: (bytes, position) => delivered.push({ bytes, position }),
      onError: (error) => errors.push(error),
      sdk: sdk.sdk,
    });

    reader.start(0);
    reader.seek(CHUNK_SIZE);
    // Resolve the superseded (offset 0) download first, then the current one.
    sdk.resolve(0);
    await settle();
    sdk.resolve(1);
    await settle();

    // Only the stale run's stream is cancelled; the current stream belongs to
    // its own load generation and must not be touched.
    expect(sdk.cancelled).toEqual([0]);
    expect(join(delivered)).toEqual(PAYLOAD.slice(CHUNK_SIZE));
    expect(reader.position).toBe(PAYLOAD.length);
    expect(reader.active).toBe(false);
    expect(errors).toEqual([]);
  });

  it('cancels a stale async download resolved late, after the replacement finished', async () => {
    const errors: unknown[] = [];
    const delivered: Delivered[] = [];
    const sdk = deferredSdk(PAYLOAD);
    const reader = new RangedReader({
      chunkSize: CHUNK_SIZE,
      object: fakeObject(PAYLOAD.length),
      onChunk: (bytes, position) => delivered.push({ bytes, position }),
      onError: (error) => errors.push(error),
      sdk: sdk.sdk,
    });

    reader.start(0);
    reader.seek(CHUNK_SIZE);
    // Resolve and drain the current download fully first, then park the stale
    // one resolving late — no long-lived leak, no state corruption.
    sdk.resolve(1);
    await settle();
    sdk.resolve(0);
    await settle();

    expect(sdk.cancelled).toEqual([0]);
    expect(join(delivered)).toEqual(PAYLOAD.slice(CHUNK_SIZE));
    expect(reader.position).toBe(PAYLOAD.length);
    expect(reader.active).toBe(false);
    expect(errors).toEqual([]);
  });

  it('does not surface an error when a stale async download rejects after stop()', async () => {
    const errors: unknown[] = [];
    const unhandled = trackUnhandledRejections();
    try {
      const delivered: Delivered[] = [];
      const sdk = deferredSdk(PAYLOAD);
      const reader = new RangedReader({
        chunkSize: CHUNK_SIZE,
        object: fakeObject(PAYLOAD.length),
        onChunk: (bytes, position) => delivered.push({ bytes, position }),
        onError: (error) => errors.push(error),
        sdk: sdk.sdk,
      });

      reader.start();
      reader.stop();
      sdk.reject(0, new Error('connect failed'));
      await settle();

      // The rejection is generation-guarded away: a superseded run must not
      // report an error the caller already moved past.
      expect(errors).toEqual([]);
      expect(reader.active).toBe(false);
      expect(reader.position).toBe(0);
      expect(delivered).toEqual([]);
      expect(unhandled.count()).toBe(0);
    } finally {
      unhandled.dispose();
    }
  });

  it('delivers a current async download normally, cancelling nothing', async () => {
    const delivered: Delivered[] = [];
    const sdk = deferredSdk(PAYLOAD);
    const reader = new RangedReader({
      chunkSize: CHUNK_SIZE,
      object: fakeObject(PAYLOAD.length),
      onChunk: (bytes, position) => delivered.push({ bytes, position }),
      sdk: sdk.sdk,
    });

    reader.start();
    sdk.resolve(0);
    await settle();

    // A current-generation async stream is adopted normally — the fix must
    // not over-eagerly cancel a stream that is meant to deliver.
    expect(sdk.cancelled).toEqual([]);
    expect(join(delivered)).toEqual(PAYLOAD);
    expect(reader.position).toBe(PAYLOAD.length);
    expect(reader.active).toBe(false);
  });

  it('releases the budget permit when a stale async download is cancelled (adopt-or-cancel)', async () => {
    const budget = new ReadBudget(1);
    const delivered: Delivered[] = [];
    const sdk = deferredSdk(PAYLOAD);
    const reader = new RangedReader({
      budget,
      chunkSize: CHUNK_SIZE,
      object: fakeObject(PAYLOAD.length),
      onChunk: (bytes, position) => delivered.push({ bytes, position }),
      sdk: sdk.sdk,
    });

    reader.start();
    // Let the run acquire its permit and open the parked download before the
    // stop lands, so this exercises the stale-cancel path (not the
    // abandon-before-download path).
    await settle();
    reader.stop();
    sdk.resolve(0);
    await settle();

    // The fire-and-forget cancel must not stall the run's unwinding: the
    // permit is released exactly like a delivered/aborted read.
    expect(budget.inFlight).toBe(0);
    expect(sdk.cancelled).toEqual([0]);
  });
});
