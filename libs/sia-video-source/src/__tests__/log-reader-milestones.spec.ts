/**
 * Milestone seam for the windowed-read observability path: `RangedReader`
 * emits `read.window-start` / `read.window-complete` around its single SDK
 * download attempt and `bytes.read` each time cumulative delivery crosses a
 * whole 1 MiB boundary, and `SiaByteSource` threads that listener through
 * from its own options into every `RangedReader` it constructs.
 *
 * Pure reader/source behavior — no worker or MediaSource — so these run under
 * the node vitest environment (`SIA_TEST_ENV=node`), mirroring the fake
 * SDK/object setup of the existing ranged-reader and byte-source specs.
 */

import { describe, expect, it } from 'vitest';
import type { Slab } from '@siafoundation/sia-storage';
import { RangedReader, type SiaObjectLike, type SiaSdkLike } from '../ranged-reader.ts';
import {
  createSiaByteSourceFactory,
  SiaByteSource,
  type SiaByteSourceSdk,
} from '../transport/sia-byte-source.ts';

const MIB = 1024 * 1024;
const PAYLOAD = new Uint8Array(3 * MIB).map((_, i) => i % 251);
const CHUNK_SIZE = 512 * 1024;

interface Delivered { bytes: Uint8Array; position: number }

interface Milestone {
  detail: Readonly<Record<string, unknown>>;
  name: string;
  requestId: null | number;
}

/** The `SiaByteSourceSdk` surface the factory needs: a ranged `download` plus `object(key)`. */
function factorySdk(payload: Uint8Array): SiaByteSourceSdk {
  return {
    download: (_object, options) => fakeSdk(payload).download(_object, options),
    object: () => Promise.resolve(fakeObject(payload.length)),
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

function joinChunks(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

/** Collects the milestones a reader/source emits, in order (with owning requestId). */
function milestoneRecorder(): {
  events: Milestone[];
  onMilestone: (name: string, requestId: null | number, detail: Readonly<Record<string, unknown>>) => void;
} {
  const events: Milestone[] = [];
  return {
    events,
    onMilestone: (name, requestId, detail) => events.push({ detail, name, requestId }),
  };
}

async function readAll(stream: ReadableStream<Uint8Array>): Promise<{ chunks: Uint8Array[]; done: boolean; error: unknown }> {
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

/** SDK whose download delivers only the first `delivered` bytes then closes (a short read). */
function shortReadSdk(payload: Uint8Array, delivered: number): SiaSdkLike {
  return {
    download: () =>
      new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(payload.slice(0, Math.min(delivered, payload.length)));
          controller.close();
        },
      }),
  };
}

/**
 * SDK whose downloads never deliver a byte and never reach EOF — models a
 * read stalled by exhausted WebTransport sessions. `cancel` settles so the
 * watchdog's abort unwinds.
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

describe('RangedReader — read window milestones', () => {
  it('emits one window-start, one window-complete, and 1 MiB byte-boundary crossings for a full read', async () => {
    const recorder = milestoneRecorder();
    const delivered: Delivered[] = [];
    const reader = new RangedReader({
      chunkSize: CHUNK_SIZE,
      object: fakeObject(PAYLOAD.length),
      onChunk: (bytes, position) => delivered.push({ bytes, position }),
      onMilestone: recorder.onMilestone,
      sdk: fakeSdk(PAYLOAD),
    });

    reader.start();
    await settle();

    // 3 MiB delivered in 512 KiB chunks crosses exactly the 1, 2, 3 MiB
    // boundaries — whole-MiB granularity, never a fraction and never per chunk.
    // A reader built without a SOURCE requestId reports every milestone as
    // connection-level (requestId null).
    expect(recorder.events).toEqual([
      { detail: { deltaBytes: 3 * MIB, position: 0 }, name: 'read.window-start', requestId: null },
      { detail: { bytes: MIB }, name: 'bytes.read', requestId: null },
      { detail: { bytes: 2 * MIB }, name: 'bytes.read', requestId: null },
      { detail: { bytes: 3 * MIB }, name: 'bytes.read', requestId: null },
      { detail: { deltaBytes: 3 * MIB, position: 0 }, name: 'read.window-complete', requestId: null },
    ]);
    // One SDK download attempt → exactly one start and one complete, both
    // carrying sane offset/range values for the whole downloaded window.
    expect(recorder.events.filter((e) => e.name === 'read.window-start')).toHaveLength(1);
    expect(recorder.events.filter((e) => e.name === 'read.window-complete')).toHaveLength(1);
    expect(join(delivered)).toEqual(PAYLOAD);
    expect(reader.position).toBe(PAYLOAD.length);
    expect(reader.active).toBe(false);
  });

  it('fires boundaries in whole MiB only, even when a single stream chunk spans them', async () => {
    // No chunkSize, so the whole 3 MiB arrives as one onChunk call; boundaries
    // must still be 1, 2, 3 MiB — boundary-based, never per-chunk.
    const recorder = milestoneRecorder();
    const delivered: Delivered[] = [];
    const reader = new RangedReader({
      object: fakeObject(PAYLOAD.length),
      onChunk: (bytes, position) => delivered.push({ bytes, position }),
      onMilestone: recorder.onMilestone,
      sdk: fakeSdk(PAYLOAD),
    });

    reader.start();
    await settle();

    expect(recorder.events.filter((e) => e.name === 'bytes.read').map((e) => e.detail)).toEqual([
      { bytes: MIB },
      { bytes: 2 * MIB },
      { bytes: 3 * MIB },
    ]);
    expect(join(delivered)).toEqual(PAYLOAD);
  });

  it('does not emit a boundary for a read that ends short of one (1.5 MiB → one 1 MiB boundary)', async () => {
    const payload = new Uint8Array(MIB + 512 * 1024).map((_, i) => i % 251);
    const recorder = milestoneRecorder();
    const reader = new RangedReader({
      chunkSize: CHUNK_SIZE,
      object: fakeObject(payload.length),
      onChunk: () => {
        /* byte delivery is not the point here */
      },
      onMilestone: recorder.onMilestone,
      sdk: fakeSdk(payload),
    });

    reader.start();
    await settle();

    // 1.5 MiB delivered in 512 KiB chunks crosses 1 MiB but never reaches 2 MiB.
    expect(recorder.events.filter((e) => e.name === 'bytes.read').map((e) => e.detail)).toEqual([
      { bytes: MIB },
    ]);
  });

  it('does not emit window-complete for a short-read download attempt that failed', async () => {
    // Deliberate choice documented here: `read.window-complete` is reserved for
    // a byte-exact successful delivery. A short read (stream closed before the
    // requested range arrived) must NOT advertise completion — the caller
    // treats that as a retryable failure, and a completion milestone would
    // falsely suggest the window was fully read.
    const recorder = milestoneRecorder();
    const errors: unknown[] = [];
    const reader = new RangedReader({
      chunkSize: CHUNK_SIZE,
      object: fakeObject(PAYLOAD.length),
      onChunk: () => {
        /* partial delivery is expected before the short read surfaces */
      },
      onError: (error) => errors.push(error),
      onMilestone: recorder.onMilestone,
      sdk: shortReadSdk(PAYLOAD, 512 * 1024),
    });

    reader.start(0, PAYLOAD.length);
    await settle();
    await settle();

    // The attempt began (window-start), but the range was never delivered, so
    // no window-complete and the short read surfaced through onError.
    expect(recorder.events.filter((e) => e.name === 'read.window-start')).toHaveLength(1);
    expect(recorder.events.filter((e) => e.name === 'read.window-complete')).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect((errors[0] as Error).message).toMatch(/before the requested range/);
    expect(reader.active).toBe(false);
  });

  it('completes the read with correct bytes even when the listener throws on every call', async () => {
    // The milestone listener is untrusted host code (logger/telemetry): a
    // throw must be swallowed so it can never abort or corrupt the stream.
    const delivered: Delivered[] = [];
    const errors: unknown[] = [];
    const reader = new RangedReader({
      chunkSize: CHUNK_SIZE,
      object: fakeObject(PAYLOAD.length),
      onChunk: (bytes, position) => delivered.push({ bytes, position }),
      onError: (error) => errors.push(error),
      onMilestone: () => {
        throw new Error('untrusted listener exploded');
      },
      sdk: fakeSdk(PAYLOAD),
    });

    reader.start();
    await settle();
    await settle();

    // All bytes still delivered, the read unwound cleanly, and the listener's
    // throw never leaked into the reader's own error contract.
    expect(join(delivered)).toEqual(PAYLOAD);
    expect(reader.position).toBe(PAYLOAD.length);
    expect(reader.active).toBe(false);
    expect(errors).toHaveLength(0);
  });

  it('leaves behavior unchanged when onMilestone is undefined', async () => {
    // Existing ranged-reader/byte-source specs already pin the no-listener
    // behavior; this confirms the seam adds nothing when not opted in.
    const delivered: Delivered[] = [];
    const reader = new RangedReader({
      chunkSize: CHUNK_SIZE,
      object: fakeObject(PAYLOAD.length),
      onChunk: (bytes, position) => delivered.push({ bytes, position }),
      sdk: fakeSdk(PAYLOAD),
    });

    reader.start();
    await settle();

    expect(join(delivered)).toEqual(PAYLOAD);
    expect(reader.position).toBe(PAYLOAD.length);
    expect(reader.active).toBe(false);
  });

  it('emits read.stalled when the stall watchdog aborts a read that never delivers', async () => {
    const recorder = milestoneRecorder();
    const errors: unknown[] = [];
    const reader = new RangedReader({
      chunkSize: CHUNK_SIZE,
      object: fakeObject(PAYLOAD.length),
      onChunk: () => {
        throw new Error('a stalled read must never deliver a chunk');
      },
      onError: (error) => errors.push(error),
      onMilestone: recorder.onMilestone,
      sdk: stalledSdk(),
      stallTimeoutMs: 20,
    });

    reader.start();
    await new Promise((resolve) => setTimeout(resolve, 150));

    // read.stalled names the watchdog's own timeout and the position the read
    // never advanced past; nothing claims the window completed, and the stall
    // error is NOT double-reported as a generic read.error.
    expect(recorder.events.filter((e) => e.name === 'read.stalled')).toEqual([
      { detail: { position: 0, stallTimeoutMs: 20 }, name: 'read.stalled', requestId: null },
    ]);
    expect(recorder.events.filter((e) => e.name === 'read.error')).toHaveLength(0);
    expect(recorder.events.filter((e) => e.name === 'read.window-complete')).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(reader.active).toBe(false);
  });

  it('emits read.error with the read-window facts for a short read', async () => {
    const recorder = milestoneRecorder();
    const errors: unknown[] = [];
    const reader = new RangedReader({
      chunkSize: CHUNK_SIZE,
      object: fakeObject(PAYLOAD.length),
      onChunk: () => {
        /* partial delivery is expected before the short read surfaces */
      },
      onError: (error) => errors.push(error),
      onMilestone: recorder.onMilestone,
      sdk: shortReadSdk(PAYLOAD, 512 * 1024),
    });

    reader.start();
    await settle();
    await settle();

    // read.error carries only scalar facts the catch held: the window start,
    // the requested length, and the bytes actually delivered (512 KiB here).
    expect(recorder.events.filter((e) => e.name === 'read.error')).toEqual([
      {
        detail: { deliveredBytes: 512 * 1024, expectedBytes: PAYLOAD.length, position: 0 },
        name: 'read.error',
        requestId: null,
      },
    ]);
    expect(recorder.events.filter((e) => e.name === 'read.window-complete')).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect((errors[0] as Error).message).toMatch(/before the requested range/);
  });
});

describe('SiaByteSource — onMilestone threading', () => {
  it('forwards the source-level onMilestone into the constructed RangedReader', async () => {
    const recorder = milestoneRecorder();
    const source = new SiaByteSource({
      object: fakeObject(PAYLOAD.length),
      onMilestone: recorder.onMilestone,
      sdk: fakeSdk(PAYLOAD),
    });

    const outcome = await readAll(source.read({ length: PAYLOAD.length, offset: 0 }, { loadGeneration: 1 }));

    expect(outcome.done).toBe(true);
    expect(outcome.error).toBeUndefined();
    expect(joinChunks(outcome.chunks)).toEqual(PAYLOAD);
    // One download attempt, one window-start/complete pair, and whole-MiB
    // byte boundaries — all visible through the source's listener.
    expect(recorder.events.filter((e) => e.name === 'read.window-start')).toHaveLength(1);
    expect(recorder.events.filter((e) => e.name === 'read.window-complete')).toHaveLength(1);
    expect(recorder.events.filter((e) => e.name === 'bytes.read').map((e) => e.detail)).toEqual([
      { bytes: MIB },
      { bytes: 2 * MIB },
      { bytes: 3 * MIB },
    ]);
  });

  it('a source without onMilestone reads identically and emits nothing', async () => {
    const source = new SiaByteSource({
      object: fakeObject(PAYLOAD.length),
      sdk: fakeSdk(PAYLOAD),
    });

    const outcome = await readAll(source.read({ length: PAYLOAD.length, offset: 0 }, { loadGeneration: 1 }));

    expect(outcome.done).toBe(true);
    expect(outcome.error).toBeUndefined();
    expect(joinChunks(outcome.chunks)).toEqual(PAYLOAD);
  });

  it('threads onMilestone through createSiaByteSourceFactory into the source it builds', async () => {
    const recorder = milestoneRecorder();
    const factory = createSiaByteSourceFactory(factorySdk(PAYLOAD), {
      onMilestone: recorder.onMilestone,
    });

    const source = await factory('object-key');
    const outcome = await readAll(source.read({ length: PAYLOAD.length, offset: 0 }, { loadGeneration: 1 }));

    expect(outcome.error).toBeUndefined();
    expect(joinChunks(outcome.chunks)).toEqual(PAYLOAD);
    // Every milestone reached the factory-supplied listener: window start +
    // complete and all three 1 MiB byte boundaries, all connection-level when
    // the factory was driven without a SOURCE requestId.
    expect(recorder.events.filter((e) => e.name === 'read.window-start')).toHaveLength(1);
    expect(recorder.events.filter((e) => e.name === 'read.window-complete')).toHaveLength(1);
    expect(recorder.events.filter((e) => e.name === 'bytes.read')).toHaveLength(3);
    for (const event of recorder.events) expect(event.requestId).toBeNull();
  });

  it('scopes every milestone to the SOURCE requestId the factory drove the load under', async () => {
    const recorder = milestoneRecorder();
    const factory = createSiaByteSourceFactory(factorySdk(PAYLOAD), {
      onMilestone: recorder.onMilestone,
    });

    // The SOURCE requestId threads into object.resolved (factory) and every
    // RangedReader milestone (window/bytes) the created source emits.
    const source = await factory('object-key', 7);
    const outcome = await readAll(source.read({ length: PAYLOAD.length, offset: 0 }, { loadGeneration: 1 }));

    expect(outcome.error).toBeUndefined();
    expect(recorder.events[0]).toMatchObject({ name: 'object.resolved', requestId: 7 });
    expect(recorder.events.filter((e) => e.name !== 'object.resolved')).toHaveLength(5);
    for (const event of recorder.events) expect(event.requestId).toBe(7);
  });
});
