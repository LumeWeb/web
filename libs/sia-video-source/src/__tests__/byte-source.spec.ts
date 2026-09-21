/**
 * Contract for the generic ranged-byte transport: consumers read generic
 * bytes through `ByteSource`, never the Sia SDK or `RangedReader` directly.
 *
 * The same contract runs against both concrete sources:
 *
 * - `MemoryByteSource` — deterministic in-memory source for tests that must
 *   not require the SDK;
 * - `SiaByteSource` — a thin adapter over the existing `RangedReader` +
 *   `LruChunkCache` + `ReadBudget` (whose internals are intentionally not
 *   rewritten here) so range concurrency, cache, and watchdog behavior stay
 *   unchanged.
 *
 * Covered behaviors: exact ranges, EOF, cancellation, stale load generations,
 * short reads, and stalled reads.
 */

import { describe, expect, expectTypeOf, it } from 'vitest';
import type { Slab } from '@siafoundation/sia-storage';
import {
  type ByteRange,
  type ByteSource,
  ByteSourceSupersededError,
  type ReadOptions,
} from '../transport/byte-source.ts';
import { MemoryByteSource } from '../transport/memory-byte-source.ts';
import { SiaByteSource } from '../transport/sia-byte-source.ts';
import type { SiaObjectLike, SiaSdkLike } from '../ranged-reader.ts';

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

/**
 * SDK whose downloads stay parked until explicitly released, and which records
 * the offsets of streams that get cancelled (by the byte source aborting a
 * superseded/cancelled read). An enqueue that lands on an already-cancelled
 * stream is swallowed — the cancelled read must never deliver.
 */
/** SDK that records every (offset, length) download, slicing payload per request. */
function recordingSdk(payload: Uint8Array): { requests: { length: number; offset: number }[]; sdk: SiaSdkLike } {
  const requests: { length: number; offset: number }[] = [];
  const sdk: SiaSdkLike = {
    download: (_object, options) => {
      const start = options?.offset ?? 0;
      const length = options?.length ?? payload.length - start;
      requests.push({ length, offset: start });
      const end = Math.min(start + length, payload.length);
      return new ReadableStream<Uint8Array>({
        start: (controller) => {
          const size = Math.max(0, end - start);
          if (size > 0) controller.enqueue(payload.slice(start, end));
          controller.close();
        },
      });
    },
  };
  return { requests, sdk };
}

function releaseableSdk(payload: Uint8Array): {
  cancelled: number[];
  release(index: number): void;
  releaseAll(): void;
  requests: number[];
  sdk: SiaSdkLike;
} {
  const cancelled: number[] = [];
  const releases: (() => void)[] = [];
  const requests: number[] = [];
  const sdk: SiaSdkLike = {
    download: (_object, options) => {
      const start = options?.offset ?? 0;
      const length = Math.min(options?.length ?? payload.length - start, payload.length - start);
      requests.push(start);
      const hold = new Promise<void>((resolve) => {
        releases.push(resolve);
      });
      return new ReadableStream<Uint8Array>({
        cancel() {
          cancelled.push(start);
        },
        start: async (controller) => {
          await hold;
          try {
            if (length > 0) controller.enqueue(payload.slice(start, start + length));
            controller.close();
          } catch {
            /* cancelled mid-window: nothing may deliver now */
          }
        },
      });
    },
  };
  return {
    cancelled,
    release(index) {
      releases[index]?.();
    },
    releaseAll() {
      for (const release of releases) release?.();
    },
    requests,
    sdk,
  };
}

/** SDK that never delivers a byte and never reaches EOF — a stalled transport. */
function stalledSdk(): SiaSdkLike {
  return {
    download: () =>
      new ReadableStream<Uint8Array>({
        cancel() {
          /* swallow: lets the watchdog's abort unwind */
        },
        pull() {
          return new Promise<undefined>(() => { /* deliberately never settles */ });
        },
      }),
  };
}

const PAYLOAD = new Uint8Array(64 * 1024).map((_, i) => i % 251);

interface ReadOutcome {
  chunks: Uint8Array[];
  done: boolean;
  error: unknown;
}

function join(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

function newSiaSource(payload: Uint8Array, sdk: SiaSdkLike, options: Partial<ConstructorParameters<typeof SiaByteSource>[0]> = {}): SiaByteSource {
  return new SiaByteSource({ object: fakeObject(payload.length), sdk, ...options });
}

async function readAll(stream: ReadableStream<Uint8Array>): Promise<ReadOutcome> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let error: unknown;
  let done = false;
  try {
    for (;;) {
      const result = await reader.read();
      if (result.done) {
        done = true;
        break;
      }
      chunks.push(result.value);
    }
  } catch (err) {
    error = err;
  }
  return { chunks, done, error };
}

async function settle(): Promise<void> {
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('ByteSource contract', () => {
  it('is implemented by MemoryByteSource and SiaByteSource', () => {
    const memory: ByteSource = new MemoryByteSource(PAYLOAD);
    const sia: ByteSource = newSiaSource(PAYLOAD, fakeSdk(PAYLOAD));

    expectTypeOf(memory).toMatchTypeOf<ByteSource>();
    expectTypeOf(sia).toMatchTypeOf<ByteSource>();
    expectTypeOf<ReadOptions>().toMatchTypeOf<Parameters<ByteSource['read']>[1]>();
    expectTypeOf<ByteRange>().toMatchTypeOf<Parameters<ByteSource['read']>[0]>();
  });
});

describe('MemoryByteSource', () => {
  it('delivers the exact requested range', async () => {
    const source = new MemoryByteSource(PAYLOAD);
    const outcome = await readAll(source.read({ length: 4096, offset: 1024 }, { loadGeneration: 1 }));

    expect(outcome.done).toBe(true);
    expect(outcome.error).toBeUndefined();
    expect(join(outcome.chunks)).toEqual(PAYLOAD.slice(1024, 1024 + 4096));
  });

  it('reports the source size', () => {
    expect(new MemoryByteSource(PAYLOAD).size).toBe(PAYLOAD.byteLength);
    expect(new MemoryByteSource(new ArrayBuffer(8)).size).toBe(8);
  });

  it('a zero-length range closes immediately with no bytes', async () => {
    const outcome = await readAll(new MemoryByteSource(PAYLOAD).read({ length: 0, offset: 0 }, { loadGeneration: 1 }));

    expect(outcome.chunks).toHaveLength(0);
    expect(outcome.done).toBe(true);
    expect(outcome.error).toBeUndefined();
  });

  it('clamps reads at EOF to a short read, never garbage', async () => {
    const source = new MemoryByteSource(PAYLOAD);
    const outcome = await readAll(source.read({ length: 100, offset: PAYLOAD.length - 10 }, { loadGeneration: 1 }));

    expect(outcome.done).toBe(true);
    expect(outcome.error).toBeUndefined();
    expect(join(outcome.chunks)).toEqual(PAYLOAD.slice(PAYLOAD.length - 10));
  });

  it('a read starting at or beyond EOF yields an empty stream', async () => {
    const source = new MemoryByteSource(PAYLOAD);
    const atEof = await readAll(source.read({ length: 4, offset: PAYLOAD.length }, { loadGeneration: 1 }));
    const beyond = await readAll(source.read({ length: 4, offset: PAYLOAD.length + 16 }, { loadGeneration: 1 }));

    expect(atEof.chunks).toHaveLength(0);
    expect(atEof.done).toBe(true);
    expect(atEof.error).toBeUndefined();
    expect(beyond.chunks).toHaveLength(0);
    expect(beyond.done).toBe(true);
    expect(beyond.error).toBeUndefined();
  });

  it('clamps negative offsets to the start of the source', async () => {
    const outcome = await readAll(new MemoryByteSource(PAYLOAD).read({ length: 16, offset: -128 }, { loadGeneration: 1 }));

    expect(join(outcome.chunks)).toEqual(PAYLOAD.slice(0, 16));
  });

  it('delivers copies so callers cannot mutate the source', async () => {
    const source = new MemoryByteSource(PAYLOAD);
    const outcome = await readAll(source.read({ length: 16, offset: 0 }, { loadGeneration: 1 }));
    outcome.chunks[0][0] = 0xff;

    const again = await readAll(source.read({ length: 16, offset: 0 }, { loadGeneration: 2 }));
    expect(join(again.chunks)).toEqual(PAYLOAD.slice(0, 16));
  });

  it('drops stale-load-generation reads with ByteSourceSupersededError and no bytes', async () => {
    const source = new MemoryByteSource(PAYLOAD);
    const stale = source.read({ length: 16, offset: 0 }, { loadGeneration: 1 });
    const current = source.read({ length: 16, offset: 16 }, { loadGeneration: 2 });

    const staleOutcome = await readAll(stale);
    expect(staleOutcome.chunks).toHaveLength(0);
    expect(staleOutcome.error).toBeInstanceOf(ByteSourceSupersededError);

    const currentOutcome = await readAll(current);
    expect(currentOutcome.error).toBeUndefined();
    expect(join(currentOutcome.chunks)).toEqual(PAYLOAD.slice(16, 32));
  });

  it('drops an already-stale-load-generation read immediately', async () => {
    const source = new MemoryByteSource(PAYLOAD);
    void source.read({ length: 16, offset: 0 }, { loadGeneration: 5 });
    const stale = await readAll(source.read({ length: 16, offset: 0 }, { loadGeneration: 2 }));

    expect(stale.chunks).toHaveLength(0);
    expect(stale.error).toBeInstanceOf(ByteSourceSupersededError);
  });

  it('never delivers bytes from a read superseded by a newer load generation', async () => {
    const source = new MemoryByteSource(PAYLOAD);
    const older = source.read({ length: PAYLOAD.length, offset: 0 }, { loadGeneration: 1 });
    const newer = source.read({ length: 16, offset: 32 }, { loadGeneration: 2 });

    const olderOutcome = await readAll(older);
    expect(olderOutcome.chunks).toHaveLength(0);
    expect(olderOutcome.error).toBeInstanceOf(ByteSourceSupersededError);

    const newerOutcome = await readAll(newer);
    expect(newerOutcome.error).toBeUndefined();
    expect(join(newerOutcome.chunks)).toEqual(PAYLOAD.slice(32, 48));
  });

  it('cancel(reason) supersedes in-flight reads and the source stays reusable', async () => {
    const source = new MemoryByteSource(PAYLOAD);
    const inFlight = source.read({ length: 16, offset: 0 }, { loadGeneration: 1 });
    source.cancel('source exchanged');

    const cancelledOutcome = await readAll(inFlight);
    expect(cancelledOutcome.chunks).toHaveLength(0);
    expect(cancelledOutcome.error).toBeInstanceOf(ByteSourceSupersededError);

    const next = await readAll(source.read({ length: 16, offset: 0 }, { loadGeneration: 9 }));
    expect(next.error).toBeUndefined();
    expect(join(next.chunks)).toEqual(PAYLOAD.slice(0, 16));
  });

  it('aborts a pending read when its AbortSignal fires', async () => {
    const controller = new AbortController();
    const pending = new MemoryByteSource(PAYLOAD).read(
      { length: 16, offset: 0 },
      { loadGeneration: 1, signal: controller.signal },
    );
    controller.abort();

    const outcome = await readAll(pending);
    expect(outcome.chunks).toHaveLength(0);
    expect((outcome.error as { name?: string }).name).toBe('AbortError');
  });
});

describe('SiaByteSource', () => {
  it('delivers the exact requested range through the Sia transport', async () => {
    const source = newSiaSource(PAYLOAD, fakeSdk(PAYLOAD));
    const outcome = await readAll(source.read({ length: 4096, offset: 1024 }, { loadGeneration: 1 }));

    expect(outcome.done).toBe(true);
    expect(outcome.error).toBeUndefined();
    expect(join(outcome.chunks)).toEqual(PAYLOAD.slice(1024, 1024 + 4096));
  });

  it('reports the object payload size', () => {
    expect(newSiaSource(PAYLOAD, fakeSdk(PAYLOAD)).size).toBe(PAYLOAD.byteLength);
  });

  it('clamps reads at EOF to a short read', async () => {
    const source = newSiaSource(PAYLOAD, fakeSdk(PAYLOAD));
    const outcome = await readAll(source.read({ length: 100, offset: PAYLOAD.length - 10 }, { loadGeneration: 1 }));

    expect(outcome.done).toBe(true);
    expect(outcome.error).toBeUndefined();
    expect(join(outcome.chunks)).toEqual(PAYLOAD.slice(PAYLOAD.length - 10));
  });

  it('a read starting beyond EOF is empty and opens no SDK download', async () => {
    const recording = recordingSdk(PAYLOAD);
    const source = newSiaSource(PAYLOAD, recording.sdk);
    const outcome = await readAll(source.read({ length: 8, offset: PAYLOAD.length }, { loadGeneration: 1 }));

    expect(outcome.chunks).toHaveLength(0);
    expect(outcome.error).toBeUndefined();
    expect(recording.requests).toHaveLength(0);
  });

  it('serves one source range with a single SDK request of exact offset/length', async () => {
    const recording = recordingSdk(PAYLOAD);
    const source = newSiaSource(PAYLOAD, recording.sdk);
    const outcome = await readAll(
      source.read({ length: 24 * 1024, offset: 16 * 1024 }, { loadGeneration: 1 }),
    );

    expect(outcome.error).toBeUndefined();
    expect(join(outcome.chunks)).toEqual(PAYLOAD.slice(16 * 1024, 16 * 1024 + 24 * 1024));
    expect(recording.requests).toEqual([{ length: 24 * 1024, offset: 16 * 1024 }]);
  });

  it('aborts the underlying SDK stream when the read signal fires', async () => {
    const releaseable = releaseableSdk(PAYLOAD);
    const controller = new AbortController();
    const source = newSiaSource(PAYLOAD, releaseable.sdk);
    const reader = source
      .read({ length: 16 * 1024, offset: 0 }, { loadGeneration: 1, signal: controller.signal })
      .getReader();

    await settle();
    expect(releaseable.requests).toHaveLength(1);

    controller.abort();
    await settle();

    const error = await reader.read().then(
      () => undefined,
      (err: unknown) => err,
    );
    expect((error as { name?: string }).name).toBe('AbortError');

    // Aborting the byte source read cancelled the SDK stream it had opened.
    expect(releaseable.cancelled).toContain(0);
  });

  it('errors a stalled read within the stall timeout instead of hanging', async () => {
    const source = newSiaSource(PAYLOAD, stalledSdk());
    const startedAt = Date.now();

    const outcome = await readAll(
      source.read({ length: 1024, offset: 0 }, { loadGeneration: 1, stallTimeoutMs: 20 }),
    );

    expect(outcome.chunks).toHaveLength(0);
    expect(outcome.error).toBeDefined();
    expect(Date.now() - startedAt).toBeLessThan(2000);
  });

  it('never delivers bytes from an in-flight read superseded by a newer load generation', async () => {
    const releaseable = releaseableSdk(PAYLOAD);
    const source = newSiaSource(PAYLOAD, releaseable.sdk);
    const older = source.read({ length: PAYLOAD.length, offset: 0 }, { loadGeneration: 1 });
    const newer = source.read({ length: 1024, offset: PAYLOAD.length / 2 }, { loadGeneration: 2 });

    const olderOutcomePromise = readAll(older);
    releaseable.releaseAll();
    const olderOutcome = await olderOutcomePromise;
    expect(olderOutcome.chunks).toHaveLength(0);
    expect(olderOutcome.error).toBeInstanceOf(ByteSourceSupersededError);

    const newerOutcome = await readAll(newer);
    expect(newerOutcome.error).toBeUndefined();
    expect(join(newerOutcome.chunks)).toEqual(
      PAYLOAD.slice(PAYLOAD.length / 2, PAYLOAD.length / 2 + 1024),
    );
  });

  it('drops an already-stale-load-generation read immediately with no SDK download', async () => {
    const recording = recordingSdk(PAYLOAD);
    const source = newSiaSource(PAYLOAD, recording.sdk);
    void source.read({ length: 16, offset: 0 }, { loadGeneration: 5 });
    const stale = await readAll(source.read({ length: 16, offset: 0 }, { loadGeneration: 2 }));

    expect(stale.chunks).toHaveLength(0);
    expect(stale.error).toBeInstanceOf(ByteSourceSupersededError);
    // Only the load-generation-5 read reached the transport; the stale read did not.
    expect(recording.requests).toHaveLength(1);
  });

  it('replays a previously downloaded range from the shared cache without re-downloading', async () => {
    const recording = recordingSdk(PAYLOAD);
    const source = newSiaSource(PAYLOAD, recording.sdk);
    const first = await readAll(source.read({ length: 16 * 1024, offset: 0 }, { loadGeneration: 1 }));
    expect(first.error).toBeUndefined();

    const second = await readAll(source.read({ length: 16 * 1024, offset: 0 }, { loadGeneration: 2 }));
    expect(second.error).toBeUndefined();
    expect(join(second.chunks)).toEqual(PAYLOAD.slice(0, 16 * 1024));
    expect(recording.requests).toHaveLength(1);
  });

  it('cancelling a returned stream aborts the underlying transport read', async () => {
    const releaseable = releaseableSdk(PAYLOAD);
    const source = newSiaSource(PAYLOAD, releaseable.sdk);
    const stream = source.read({ length: PAYLOAD.length, offset: 0 }, { loadGeneration: 1 });
    const reader = stream.getReader();

    await settle();
    expect(releaseable.requests).toHaveLength(1);

    await reader.cancel();
    await settle();
    // Let the parked SDK stream unwind so its cancel reaches the source.
    releaseable.releaseAll();
    await settle();
    await settle();

    // The superseded transport stream was aborted by the byte source.
    expect(releaseable.cancelled).toContain(0);
    expect(releaseable.requests).toHaveLength(1);
  });
});
