import { describe, expect, it } from 'vitest';
import type { Slab } from '@siafoundation/sia-storage';
import { isTransportReadError, LruChunkCache, RangedReader, ReadBudget, ReadTransportError, type SiaObjectLike, type SiaSdkLike } from '../ranged-reader.ts';

/**
 * SDK that resembles the lazy dual-seed adapter: `download()` returns a
 * promise the test resolves (`resolve(i)` materializes the i-th request's
 * stream) or rejects (`reject(i, reason)`). A materialized stream is
 * pull-based — `start` stays silent, `pull` enqueues the requested payload
 * slice then closes — so nothing reaches the reader until `#run` actually
 * reads. Its `cancel()` hook records the stream's offset: a stale async
 * download dropped while still open would leak its WebTransport sessions and
 * show up here as a missing cancel.
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

/**
 * SDK whose pull-based downloads deliver `CHUNK_SIZE` slices but never
 * self-close: after the requested range is enqueued the pull stays silent, so
 * the stream is still logically open when `#run` exits (exact-length
 * completion or a chunk-error throw). `cancel()` records the download's
 * offset, making the stream's deterministic abort observable at the source
 * level — the wasm side (Download → AbortOnDropHandle) is dropped only when
 * the stream is cancelled, which is exactly what `#run`'s teardown must do.
 */
function openPullSdk(payload: Uint8Array): { cancelFiredOffsets: number[]; sdk: SiaSdkLike } {
  const cancelFiredOffsets: number[] = [];
  const sdk: SiaSdkLike = {
    download: (_object, options) => {
      const offset = options?.offset ?? 0;
      const end = Math.min(offset + (options?.length ?? payload.length - offset), payload.length);
      let next = offset;
      return new ReadableStream<Uint8Array>({
        cancel() {
          cancelFiredOffsets.push(offset);
        },
        pull(controller) {
          // desiredSize is null once the stream is closed — a pull racing the
          // teardown cancel must not enqueue into a closed controller.
          if (next >= end || controller.desiredSize === null) return;
          const slice = payload.slice(next, Math.min(next + CHUNK_SIZE, end));
          next += slice.byteLength;
          controller.enqueue(slice);
        },
      });
    },
  };
  return { cancelFiredOffsets, sdk };
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
 * Counts unhandled rejections for the duration of one test. Under node that
 * is `process`'s `unhandledRejection` event; browsers have no `process`
 * global, so the count comes from the DOM `unhandledrejection` event instead
 * (fires when a rejected promise leaves the task loop with no handler).
 * Vitest would fail the run on its own, but asserting the local count keeps
 * the check explicit: a swallowed cancel or an awaited rejection must never
 * surface anywhere.
 */
function trackUnhandledRejections(): { count: () => number; dispose: () => void } {
  let count = 0;
  if (typeof process !== 'undefined' && typeof process.on === 'function') {
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
  const listener = (event: PromiseRejectionEvent) => {
    event.preventDefault();
    count++;
  };
  window.addEventListener('unhandledrejection', listener);
  return {
    count: () => count,
    dispose: () => {
      window.removeEventListener('unhandledrejection', listener);
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
    // `maxAttempts: 1` forces the single-attempt short-read path (one error
    // after one attempt); the retry recovery is covered by its own
    // describe block below.
    const errors: unknown[] = [];
    const reader = new RangedReader({
      chunkSize: CHUNK_SIZE,
      maxAttempts: 1,
      object: fakeObject(PAYLOAD.length),
      onChunk: () => {
        /* partial delivery is expected before the short read surfaces */
      },
      onError: (error) => errors.push(error),
      retryBackoffMs: 0,
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

    // The single-attempt short read surfaces as a ReadTransportError: the
    // reader wraps a transport failure after its budget is exhausted, carrying
    // the read-window facts and the original short-read cause.
    expect(errors).toHaveLength(1);
    expect(isTransportReadError(errors[0])).toBe(true);
    const transport = errors[0] as ReadTransportError;
    expect(transport.cause).toBeInstanceOf(Error);
    expect((transport.cause as Error).message).toMatch(/before the requested range/);
    expect(transport.attempts).toBe(1);
    expect(transport.position).toBe(0);
    expect(transport.expectedBytes).toBe(PAYLOAD.length);
    expect(reader.active).toBe(false);
  });

  it('a cancelled run does not clobber its replacement’s reader', async () => {
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

  it('storing a new length at the same offset evicts the stale window', () => {
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

// Every exit path of `#run`'s teardown cancels a stream it still holds before
// clearing: a stream that is still logically open when the run exits — exact-
// length completion (pull source never self-closed) or a chunk-error throw
// (wasm-bindgen slab-recovery tasks ahead of the read head) — is aborted
// deterministically instead of being dropped to a nondeterministic GC.
describe('RangedReader deterministic stream cancel on teardown', () => {
  it('cancels the still-open stream and reports exactly once when onChunk throws', async () => {
    const errors: unknown[] = [];
    const budget = new ReadBudget(1);
    const unhandled = trackUnhandledRejections();
    try {
      const sdk = openPullSdk(PAYLOAD);
      const reader = new RangedReader({
        budget,
        chunkSize: CHUNK_SIZE,
        object: fakeObject(PAYLOAD.length),
        onChunk: (_bytes, position) => {
          if (position >= CHUNK_SIZE) throw new Error('consumer aborted playback');
        },
        onError: (error) => errors.push(error),
        sdk: sdk.sdk,
      });

      reader.start();
      await settle();
      await settle();

      // The throw surfaced exactly once through the existing error-reporting path.
      expect(errors).toHaveLength(1);
      expect((errors[0] as Error).message).toBe('consumer aborted playback');
      // The still-open stream (pull source never closed) was deterministically
      // cancelled at the source — the wasm Download dropped, aborting any
      // leftover slab recovery ahead of the read head.
      expect(sdk.cancelFiredOffsets).toEqual([0]);
      // The fire-and-forget cancel did not delay the budget permit release.
      expect(budget.inFlight).toBe(0);
      expect(reader.active).toBe(false);
      expect(unhandled.count()).toBe(0);
    } finally {
      unhandled.dispose();
    }
  });

  it('cancels a stream left open after exact-length completion', async () => {
    const delivered: Delivered[] = [];
    const budget = new ReadBudget(1);
    const sdk = openPullSdk(PAYLOAD);
    const reader = new RangedReader({
      budget,
      chunkSize: CHUNK_SIZE,
      object: fakeObject(PAYLOAD.length),
      onChunk: (bytes, position) => delivered.push({ bytes, position }),
      sdk: sdk.sdk,
    });

    reader.start();
    await settle();
    await settle();
    await settle();

    // The full range was delivered exactly; `#run` exited on position === end
    // without the pull source ever self-closing, so the stream is still open.
    expect(join(delivered)).toEqual(PAYLOAD);
    expect(reader.position).toBe(PAYLOAD.length);
    expect(reader.active).toBe(false);
    // Even though the read is byte-exact, the open stream is now cancelled
    // (once) rather than dropped.
    expect(sdk.cancelFiredOffsets).toEqual([0]);
    expect(budget.inFlight).toBe(0);
  });
});

// The lazy dual-seed adapter (worker-runtime.ts) may hand the reader a
// download that has not resolved when a seek/stop lands. Whatever the SDK
// promised, a resolved stream stays owned until EOF or cancel, so a stale
// async stream must be cancelled — never dropped still open (leaking its
// WebTransport sessions).
describe('RangedReader delayed (promise) downloads', () => {
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
      // still-open stream must be cancelled exactly once so its sessions are
      // released, not leaked.
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

  it('cancels only the stale async download when a seek replaces it', async () => {
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
    // Resolve and drain the current download fully first, then hold the stale
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

  it('releases the budget permit when a stale async download is cancelled', async () => {
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
    // Let the run acquire its permit and open the held download before the
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

/**
 * SDK whose first `failCount` downloads fail with a zero-byte short read (the
 * stream opens then closes without delivering — the diagnosed transient
 * transport blip), then serves `payload` normally. Records each request's
 * offset/length so a test can assert the reader resumes at the right byte.
 */
function flakySdk(payload: Uint8Array, failCount: number): { requests: { length: number; offset: number }[]; sdk: SiaSdkLike } {
  const requests: { length: number; offset: number }[] = [];
  let failuresLeft = failCount;
  const sdk: SiaSdkLike = {
    download: (_object, options) => {
      const offset = options?.offset ?? 0;
      const length = options?.length ?? payload.length - offset;
      requests.push({ length, offset });
      if (failuresLeft > 0) {
        failuresLeft--;
        // Zero bytes, immediate EOF: a short read that delivered nothing.
        return new ReadableStream<Uint8Array>({
          start(controller) {
            controller.close();
          },
        });
      }
      return fakeSdk(payload).download(_object, options);
    },
  };
  return { requests, sdk };
}

// A transient transport blip (a zero-byte short read, a stream error, or a
// failed download open) retries the same read window instead of aborting the
// whole conversion. Retries resume from the un-delivered byte (so
// already-consumed bytes are never re-delivered), stop at the configured
// attempt budget, and never fire for a superseded/stalled run or a throwing
// onChunk.
describe('RangedReader retries on transient read failure', () => {
  it('recovers a zero-byte download failure on attempt 2, delivering the whole window once', async () => {
    const delivered: Delivered[] = [];
    const errors: unknown[] = [];
    const flaky = flakySdk(PAYLOAD, 1);
    const reader = new RangedReader({
      chunkSize: CHUNK_SIZE,
      object: fakeObject(PAYLOAD.length),
      onChunk: (bytes, position) => delivered.push({ bytes, position }),
      onError: (error) => errors.push(error),
      retryBackoffMs: 0,
      sdk: flaky.sdk,
    });

    reader.start(0, PAYLOAD.length);
    await settle();
    await settle();

    // The first download delivered nothing; the retry re-downloads the same
    // window from the start offset and delivers it exactly once.
    expect(flaky.requests).toEqual([{ length: PAYLOAD.length, offset: 0 }, { length: PAYLOAD.length, offset: 0 }]);
    expect(join(delivered)).toEqual(PAYLOAD);
    expect(reader.position).toBe(PAYLOAD.length);
    expect(reader.active).toBe(false);
    expect(errors).toEqual([]);
  });

  it('resumes from the un-delivered byte after a partial delivery, never duplicating bytes', async () => {
    const partialAfterFirst = 512;
    const requests: { length: number; offset: number }[] = [];
    let calls = 0;
    const sdk: SiaSdkLike = {
      download: (_object, options) => {
        const offset = options?.offset ?? 0;
        const length = options?.length ?? PAYLOAD.length - offset;
        requests.push({ length, offset });
        calls++;
        if (calls === 1) {
          // Attempt 1 delivers a little then drops (short read, partial).
          return new ReadableStream<Uint8Array>({
            start(controller) {
              controller.enqueue(PAYLOAD.slice(0, partialAfterFirst));
              controller.close();
            },
          });
        }
        return fakeSdk(PAYLOAD).download(_object, options);
      },
    };
    const delivered: Delivered[] = [];
    const reader = new RangedReader({
      chunkSize: CHUNK_SIZE,
      object: fakeObject(PAYLOAD.length),
      onChunk: (bytes, position) => delivered.push({ bytes, position }),
      retryBackoffMs: 0,
      sdk,
    });

    reader.start(0, PAYLOAD.length);
    await settle();
    await settle();

    // The retry opens at the byte the first attempt stopped at — a from-scratch
    // re-download would re-deliver the already-consumed 512B.
    expect(requests[1]).toEqual({ length: PAYLOAD.length - partialAfterFirst, offset: partialAfterFirst });
    expect(join(delivered)).toEqual(PAYLOAD);
    expect(reader.position).toBe(PAYLOAD.length);
    expect(reader.active).toBe(false);
  });

  it('exhausts the retry budget, then surfaces a single read.error and onError', async () => {
    const delivered: Delivered[] = [];
    const errors: unknown[] = [];
    const flaky = flakySdk(PAYLOAD, 3); // attempts 1..3 all fail with 0 bytes
    const reader = new RangedReader({
      chunkSize: CHUNK_SIZE,
      maxAttempts: 3,
      object: fakeObject(PAYLOAD.length),
      onChunk: (bytes, position) => delivered.push({ bytes, position }),
      onError: (error) => errors.push(error),
      retryBackoffMs: 0,
      sdk: flaky.sdk,
    });

    reader.start(0, PAYLOAD.length);
    await settle();
    await settle();

    // Every attempt opened a download (three total: original + two retries)
    // and delivered nothing; the failure surfaces exactly once, wrapped as a
    // ReadTransportError with the read-window facts and the original short-read
    // cause retained (the retry-loop only wraps a transport failure that
    // exhausted its budget, never a recovered blip).
    expect(flaky.requests).toHaveLength(3);
    expect(delivered).toEqual([]);
    expect(errors).toHaveLength(1);
    expect(isTransportReadError(errors[0])).toBe(true);
    const transport = errors[0] as ReadTransportError;
    expect(transport.attempts).toBe(3);
    expect(transport.position).toBe(0);
    expect(transport.expectedBytes).toBe(PAYLOAD.length);
    expect(transport.cause).toBeInstanceOf(Error);
    expect((transport.cause as Error).message).toMatch(/before the requested range/);
    expect(reader.active).toBe(false);
  });

  it('stopping mid-backoff cancels the pending retry', async () => {
    const errors: unknown[] = [];
    const flaky = flakySdk(PAYLOAD, 100); // every attempt would fail
    const reader = new RangedReader({
      chunkSize: CHUNK_SIZE,
      object: fakeObject(PAYLOAD.length),
      onChunk: () => {
        /* a failing read delivers nothing */
      },
      onError: (error) => errors.push(error),
      retryBackoffMs: 100,
      sdk: flaky.sdk,
    });

    reader.start(0, PAYLOAD.length);
    // Let attempt 1 fail and arm the retry backoff timer (microtasks only).
    await settle();
    expect(flaky.requests).toHaveLength(1);
    // A seek/stop lands mid-backoff: the retry must not fire at all.
    reader.stop();
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(flaky.requests).toHaveLength(1);
    expect(errors).toEqual([]);
    expect(reader.active).toBe(false);
  });

  it('does not retry a throwing onChunk (the caller’s own failure)', async () => {
    const requests: { length: number; offset: number }[] = [];
    const errors: unknown[] = [];
    let attempts = 0;
    const sdk: SiaSdkLike = {
      download: (_object, options) => {
        attempts++;
        requests.push({ length: options?.length ?? PAYLOAD.length, offset: options?.offset ?? 0 });
        // Delivers a full chunk — enough for onChunk to be invoked and throw.
        return new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(PAYLOAD.slice(0, CHUNK_SIZE));
            controller.close();
          },
        });
      },
    };
    const reader = new RangedReader({
      chunkSize: CHUNK_SIZE,
      object: fakeObject(PAYLOAD.length),
      onChunk: () => {
        throw new Error('consumer aborted playback');
      },
      onError: (error) => errors.push(error),
      retryBackoffMs: 0,
      sdk,
    });

    reader.start();
    await settle();
    await settle();

    // onChunk is the caller's own handler: a throw is not a transport blip, so
    // exactly one download attempt and one error — no retry.
    expect(attempts).toBe(1);
    expect(errors).toHaveLength(1);
    expect((errors[0] as Error).message).toBe('consumer aborted playback');
    expect(reader.active).toBe(false);
  });
});

describe('ReadTransportError + isTransportReadError', () => {
  it('recognizes a direct ReadTransportError instance', () => {
    const error = new ReadTransportError('failed after 3 attempts (expected 10 bytes at 4)', {
      attempts: 3,
      cause: new Error('boom'),
      expectedBytes: 10,
      position: 4,
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ReadTransportError');
    expect(error.attempts).toBe(3);
    expect(error.position).toBe(4);
    expect(error.expectedBytes).toBe(10);
    expect((error.cause as Error).message).toBe('boom');
    expect(isTransportReadError(error)).toBe(true);
  });

  it('walks the cause chain when a layer wrapped the transport error', () => {
    const transport = new ReadTransportError('failed after 2 attempts (expected 5 bytes at 0)', {
      attempts: 2,
      cause: new Error('Sia SDK read ended before the requested range was delivered'),
      expectedBytes: 5,
      position: 0,
    });
    // A pipeline layer may wrap the stream error; the helper must still find it.
    const wrapped = new Error('conversion failed', { cause: transport });
    const doubleWrapped = new Error('outer failure', { cause: wrapped });

    expect(isTransportReadError(transport)).toBe(true);
    expect(isTransportReadError(wrapped)).toBe(true);
    expect(isTransportReadError(doubleWrapped)).toBe(true);
  });

  it('returns false for ordinary errors, non-errors, and a finite cause cycle', () => {
    expect(isTransportReadError(new Error('normal failure'))).toBe(false);
    expect(isTransportReadError('a string reason')).toBe(false);
    expect(isTransportReadError(null)).toBe(false);
    expect(isTransportReadError(undefined)).toBe(false);

    // A corrupted cause graph must terminate, not loop.
    const cyclic = new Error('self-referential');
    (cyclic as { cause: unknown }).cause = cyclic;
    expect(isTransportReadError(cyclic)).toBe(false);
  });
});
