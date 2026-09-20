import { describe, expect, it } from 'vitest';
import type { Slab } from '@siafoundation/sia-storage';
import { RangedReader, ReadBudget, type SiaObjectLike, type SiaSdkLike } from '../ranged-reader.ts';

// objectSize() derives the payload size from the slab map, so fakes must
// return slabs whose lengths add up to the content length.
function fakeObject(contentLength: number): SiaObjectLike {
  const slab = { length: contentLength } as unknown as Slab;
  return { id: () => 'test-object', size: () => contentLength, slabs: () => [slab] };
}

const PAYLOAD = new Uint8Array(64 * 1024).map((_, i) => i % 251);
const WINDOW = 8 * 1024;
const CHUNK_SIZE = 16 * 1024;

interface Delivered { bytes: Uint8Array; position: number }

/**
 * SDK that holds each download's delivery behind a test-controlled promise, so
 * a seek can be injected at a precise point (e.g. while a specific window is
 * still parked). An enqueue that lands on a already-cancelled stream is
 * swallowed — the cancelled window simply must never deliver.
 */
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

/** SDK that records every (offset, length), slicing the payload per request. */
function recordingSdk(payload: Uint8Array): { requests: { length: number; offset: number; }[]; sdk: SiaSdkLike } {
  const requests: { length: number; offset: number; }[] = [];
  const sdk: SiaSdkLike = {
    download: (_object, options) => {
      const start = options?.offset ?? 0;
      const end = Math.min(start + (options?.length ?? payload.length - start), payload.length);
      requests.push({ length: Math.max(0, end - start), offset: start });
      return new ReadableStream<Uint8Array>({
        start: (controller) => {
          if (end > start) controller.enqueue(payload.slice(start, end));
          controller.close();
        },
      });
    },
  };
  return { requests, sdk };
}

/**
 * SDK that releases each download's delivery on demand, so a test can hand out
 * the exact window bytes from its own resolver list. Cancelled windows simply
 * must never deliver: releasing a stream that already aborted is a no-op.
 */
function releaseableWindowSdk(payload: Uint8Array): {
  release(index: number): void;
  releaseAll(): void;
  requests: number[];
  sdk: SiaSdkLike;
} {
  const releases: (() => void)[] = [];
  const requests: number[] = [];
  const sdk: SiaSdkLike = {
    download: (_object, options) => {
      const start = options?.offset ?? 0;
      const length = Math.min(options?.length ?? payload.length - start, payload.length - start);
      requests.push(start);
      const release = new Promise<void>((resolve) => {
        releases.push(resolve);
      });
      return new ReadableStream<Uint8Array>({
        start: async (controller) => {
          await release;
          try {
            controller.enqueue(payload.slice(start, start + length));
            controller.close();
          } catch {
            /* cancelled mid-window: nothing may deliver now */
          }
        },
      });
    },
  };
  return {
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

async function settle(): Promise<void> {
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * SDK whose first requested window delivers normally and whose SECOND distinct
 * window (offset === WINDOW) stalls forever — modelling a mid-segment
 * WebTransport-session-cap exhaustion. `cancel` settles so an abort can unwind.
 */
function stallSecondWindowSdk(payload: Uint8Array, windowBytes: number): SiaSdkLike {
  const size = payload.length;
  return {
    download: (_object, options) => {
      const start = options?.offset ?? 0;
      const length = Math.min(options?.length ?? size - start, size - start);
      if (start !== windowBytes) {
        return new ReadableStream<Uint8Array>({
          start: (controller) => {
            if (length > 0) controller.enqueue(payload.slice(start, start + length));
            controller.close();
          },
        });
      }
      return new ReadableStream<Uint8Array>({
        cancel() {
          /* settle: lets the watchdog's abort unwind */
        },
        pull() {
          // Deliberately never settles — a window whose sessions are all pending.
          return new Promise<undefined>(() => { /* empty */ });
        },
      });
    },
  };
}

describe('RangedReader windowed reads', () => {
  it('fetches a bounded range through sequential byte windows instead of one SDK download', async () => {
    const { requests, sdk } = recordingSdk(PAYLOAD);
    const delivered: Delivered[] = [];
    const reader = new RangedReader({
      chunkSize: CHUNK_SIZE,
      object: fakeObject(PAYLOAD.length),
      onChunk: (bytes, position) => delivered.push({ bytes, position }),
      sdk,
      windowBytes: WINDOW,
    });

    // [16 KiB, 40 KiB): a far-seek-like range longer than one window.
    reader.start(16 * 1024, 24 * 1024);
    await settle();

    // Three bounded, ordered downloads whose windows tile the exact range —
    // not one large SDK download fanning out over the whole span.
    expect(requests).toEqual([
      { length: 8 * 1024, offset: 16 * 1024 },
      { length: 8 * 1024, offset: 24 * 1024 },
      { length: 8 * 1024, offset: 32 * 1024 },
    ]);
    expect(reader.active).toBe(false);
    expect(reader.position).toBe(40 * 1024);

    // Exact payload bytes arrive at their absolute offsets, in order.
    const out = new Uint8Array(24 * 1024);
    for (const entry of delivered) out.set(entry.bytes, entry.position - 16 * 1024);
    expect(out).toEqual(PAYLOAD.slice(16 * 1024, 40 * 1024));
    for (let i = 1; i < delivered.length; i++) {
      expect(delivered[i].position).toBe(delivered[i - 1].position + delivered[i - 1].bytes.byteLength);
    }
  });

  it('windows an open-ended read through EOF in exact order', async () => {
    const { requests, sdk } = recordingSdk(PAYLOAD);
    const delivered: Delivered[] = [];
    const reader = new RangedReader({
      chunkSize: CHUNK_SIZE,
      object: fakeObject(PAYLOAD.length),
      onChunk: (bytes, position) => delivered.push({ bytes, position }),
      sdk,
      windowBytes: WINDOW,
    });

    reader.start();
    await settle();

    // 64 KiB / 8 KiB = 8 contiguous windows covering the whole object.
    expect(requests).toHaveLength(PAYLOAD.length / WINDOW);
    let expectedOffset = 0;
    for (const request of requests) {
      expect(request.offset).toBe(expectedOffset);
      expect(request.length).toBeLessThanOrEqual(WINDOW);
      expectedOffset = request.offset + request.length;
    }
    expect(expectedOffset).toBe(PAYLOAD.length);
    expect(join(delivered)).toEqual(PAYLOAD);
    expect(reader.active).toBe(false);
  });

  it('a seek mid-window aborts the run and restarts at the new target (epoch guarded)', async () => {
    const releaseable = releaseableWindowSdk(PAYLOAD);
    const delivered: Delivered[] = [];
    const reader = new RangedReader({
      chunkSize: CHUNK_SIZE,
      object: fakeObject(PAYLOAD.length),
      onChunk: (bytes, position) => delivered.push({ bytes, position }),
      sdk: releaseable.sdk,
      windowBytes: WINDOW,
    });

    reader.start(0, 24 * 1024);
    await settle();

    // Only the first window opened so far.
    expect(releaseable.requests).toEqual([0]);

    // Deliver window 0 → the run advances and opens window 1 (offset 8192).
    releaseable.release(0);
    await settle();
    expect(releaseable.requests).toEqual([0, 8 * 1024]);

    // A seek lands while window 1 is still parked: the current run must abort
    // (never deliver the stale window) and restart from the new target. The
    // target is the trailing window of the object — the exact bounded shape a
    // far indexed seek uses (`start(offset, length)`) — so the replacement
    // read finishes within the hold released below and the reader becomes
    // idle again; an unbounded windowed read would legitimately stay active
    // as later windows are fetched, which is covered by the EOF-windowing and
    // far-seek windowing tests.
    reader.seek(56 * 1024);
    await settle();
    releaseable.releaseAll();
    await settle();
    await settle();

    expect(releaseable.requests).toContain(56 * 1024);
    // The aborted window's bytes were never delivered, and the stale run could
    // not clobber the replacement: every delivered byte sits at or past the
    // new target's window start.
    expect(delivered.some((entry) => entry.position === 8 * 1024)).toBe(false);
    expect(delivered.some((entry) => entry.position >= 56 * 1024)).toBe(true);
    expect(reader.active).toBe(false);
  });

  it('replays cached windows across a backward seek after a windowed read without re-downloading', async () => {
    const { requests, sdk } = recordingSdk(PAYLOAD);
    const delivered: Delivered[] = [];
    const reader = new RangedReader({
      chunkSize: CHUNK_SIZE,
      object: fakeObject(PAYLOAD.length),
      onChunk: (bytes, position) => delivered.push({ bytes, position }),
      sdk,
      windowBytes: WINDOW,
    });

    reader.start();
    await settle();
    const countAfterFullRead = requests.length;
    delivered.length = 0;

    reader.seek(2 * WINDOW);
    await settle();

    // Fully satisfied from the LRU cache — no further downloads.
    expect(requests.length).toBe(countAfterFullRead);
    expect(reader.position).toBe(PAYLOAD.length);
    expect(reader.active).toBe(false);
    expect(join(delivered)).toEqual(PAYLOAD.slice(2 * WINDOW));
  });

  it('surfaces an error promptly when a later window stalls and releases in-flight state', async () => {
    const errors: unknown[] = [];
    const delivered: Delivered[] = [];
    const reader = new RangedReader({
      chunkSize: CHUNK_SIZE,
      object: fakeObject(PAYLOAD.length),
      onChunk: (bytes, position) => delivered.push({ bytes, position }),
      onError: (error) => errors.push(error),
      sdk: stallSecondWindowSdk(PAYLOAD, WINDOW),
      stallTimeoutMs: 20,
      windowBytes: WINDOW,
    });
    const startedAt = Date.now();

    reader.start(0, 3 * WINDOW);
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Window 0 landed before the stall; the stalled second window was aborted
    // and surfaced as a single error instead of hanging the caller.
    expect(delivered.some((entry) => entry.position === 0)).toBe(true);
    expect(errors).toHaveLength(1);
    expect(reader.active).toBe(false);
    expect(Date.now() - startedAt).toBeLessThan(2000);
  });

  it('keeps windowed downloads serialized by the shared budget', async () => {
    const budget = new ReadBudget(1);
    const releaseable = releaseableWindowSdk(PAYLOAD);
    const delivered: Delivered[] = [];
    const reader = new RangedReader({
      budget,
      chunkSize: CHUNK_SIZE,
      object: fakeObject(PAYLOAD.length),
      onChunk: (bytes, position) => delivered.push({ bytes, position }),
      sdk: releaseable.sdk,
      windowBytes: WINDOW,
    });

    reader.start(0, 3 * WINDOW);
    await settle();
    expect(releaseable.requests).toEqual([0]);

    releaseable.release(0);
    await settle();
    // Window 1 opens only after window 0 drained — still one download at a time.
    expect(releaseable.requests).toEqual([0, 8 * 1024]);

    releaseable.release(1);
    await settle();
    expect(releaseable.requests).toEqual([0, 8 * 1024, 16 * 1024]);

    releaseable.release(2);
    await settle();

    expect(join(delivered)).toEqual(PAYLOAD.slice(0, 3 * WINDOW));
    expect(reader.active).toBe(false);
  });
});
