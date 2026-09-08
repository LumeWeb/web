import { describe, expect, it } from 'vitest';
import type { Slab } from '@siafoundation/sia-storage';
import { LruChunkCache, RangedReader, type SiaObjectLike, type SiaSdkLike } from '../ranged-reader.ts';

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

describe('RangedReader', () => {
  it('delivers the whole payload from offset 0', async () => {
    const delivered: Delivered[] = [];
    const reader = newReader(PAYLOAD, delivered);
    reader.start();
    await settle();

    expect(join(delivered)).toEqual(PAYLOAD);
    expect(reader.active).toBe(false);
  });

  it('a cancelled run does not clobber its replacement’s reader (epoch guard)', async () => {
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
});
