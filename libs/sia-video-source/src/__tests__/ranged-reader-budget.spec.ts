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
const CHUNK_SIZE = 16 * 1024;

interface Delivered { bytes: Uint8Array; position: number }

/** Shared-budget SDK probe: every `download()` opens a stream whose delivery
 *  is parked until the test calls `release()`, so the number of streams open
 *  at once — the read concurrency a budget must cap — is observable. */
class ReleaseableSdk implements SiaSdkLike {
  /** download() calls in creation order (per reader of the same budget). */
  readonly calls: { length: number; offset: number }[] = [];
  inflight = 0;
  maxInflight = 0;
  #releases: (() => void)[] = [];

  download(_object: SiaObjectLike, options?: { length?: number; offset?: number }): ReadableStream<Uint8Array> {
    const offset = options?.offset ?? 0;
    const length = options?.length ?? PAYLOAD.length;
    this.calls.push({ length, offset });
    this.inflight++;
    this.maxInflight = Math.max(this.maxInflight, this.inflight);
    return new ReadableStream<Uint8Array>({
      pull: (controller) =>
        new Promise<void>((resolve) => {
          this.#releases.push(() => {
            controller.enqueue(PAYLOAD.slice());
            controller.close();
            this.inflight--;
            resolve();
          });
        }),
    });
  }

  /** Lets one parked stream's read deliver and drain. */
  async release(howMany = 1): Promise<void> {
    for (let i = 0; i < howMany; i++) {
      const pending = this.#releases.shift();
      if (!pending) throw new Error('no pending stream to release');
      pending();
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

function newReader(sdk: SiaSdkLike, budget: ReadBudget, delivered: Delivered[]): RangedReader {
  return new RangedReader({
    budget,
    chunkSize: CHUNK_SIZE,
    object: fakeObject(PAYLOAD.length),
    onChunk: (bytes, position) => delivered.push({ bytes, position }),
    sdk,
  });
}

async function tick(): Promise<void> {
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('ReadBudget', () => {
  it('serializes concurrent downloads to the configured limit', async () => {
    const budget = new ReadBudget(1);
    const sdk = new ReleaseableSdk();
    const deliveredA: Delivered[] = [];
    const deliveredB: Delivered[] = [];
    const readerA = newReader(sdk, budget, deliveredA);
    const readerB = newReader(sdk, budget, deliveredB);

    readerA.start();
    await tick();
    readerB.start();
    await tick();

    // While reader A holds the only permit, reader B must not have opened its
    // download yet — SDK reads are bounded at the shared budget limit, so a
    // batch of concurrent library reads cannot burst unbounded downloads.
    expect(sdk.calls).toEqual([{ length: PAYLOAD.length, offset: 0 }]);
    expect(sdk.maxInflight).toBe(1);

    await sdk.release(1);
    await tick();
    await tick();

    // Only once A's stream fully drained may B begin its own download.
    expect(sdk.calls).toEqual([
      { length: PAYLOAD.length, offset: 0 },
      { length: PAYLOAD.length, offset: 0 },
    ]);
    const delivered = new Uint8Array(PAYLOAD.length);
    for (const entry of deliveredA) delivered.set(entry.bytes, entry.position);
    expect(delivered).toEqual(PAYLOAD);
    expect(readerB.active).toBe(true);
  });

  it('admits up to the limit of concurrent downloads at once', async () => {
    const budget = new ReadBudget(2);
    const sdk = new ReleaseableSdk();
    const readerA = newReader(sdk, budget, []);
    const readerB = newReader(sdk, budget, []);

    readerA.start();
    readerB.start();
    await tick();

    // Two downloads may be in flight when the budget allows it.
    expect(sdk.calls).toEqual([
      { length: PAYLOAD.length, offset: 0 },
      { length: PAYLOAD.length, offset: 0 },
    ]);
    expect(sdk.maxInflight).toBe(2);
  });

  it('serializes concurrent independent reads without altering either request’s range', async () => {
    const budget = new ReadBudget(1);
    const sdk = new ReleaseableSdk();
    const deliveredA: Delivered[] = [];
    const deliveredB: Delivered[] = [];
    const readerA = newReader(sdk, budget, deliveredA);
    const readerB = newReader(sdk, budget, deliveredB);

    // Independent overlapping ranges, as mediabunny may issue concurrently.
    readerA.start(0, 24 * 1024);
    await tick();
    readerB.start(8 * 1024, 24 * 1024);
    await tick();

    // Reader A holds the only permit: only its download is open, with its own
    // exact range untouched.
    expect(sdk.calls).toEqual([{ length: 24 * 1024, offset: 0 }]);
    expect(sdk.maxInflight).toBe(1);

    await sdk.release(1);
    await tick();
    await tick();

    // Reader B then opens its own download with its own exact range unchanged —
    // the budget serializes, it never re-shapes either request.
    expect(sdk.calls).toEqual([
      { length: 24 * 1024, offset: 0 },
      { length: 24 * 1024, offset: 8 * 1024 },
    ]);
    expect(sdk.maxInflight).toBe(1);

    const delivered = new Uint8Array(24 * 1024);
    for (const entry of deliveredA) delivered.set(entry.bytes, entry.position);
    expect(delivered).toEqual(PAYLOAD.slice(0, 24 * 1024));
  });
});
