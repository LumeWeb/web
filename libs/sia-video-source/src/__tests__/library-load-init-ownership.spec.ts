/** Characterizes init-byte ownership when CMAF callback buffers are reused. */
import { expect, it, vi } from 'vitest';
import { inspectMediaLibrary } from '../media/library-load.ts';
import type { AppendUnit } from '../sink/append-sink.ts';
import { MemoryByteSource } from '../transport/memory-byte-source.ts';
import { mediabunnyMp4FixtureBytes } from './fixtures/mediabunny-mp4-fixture.ts';

const delivered = vi.hoisted(() => ({
  buffers: [] as Uint8Array[],
  ftyp: [] as number[],
  moov: [] as number[],
}));

vi.mock('mediabunny', async (importOriginal) => {
  const actual = await importOriginal<typeof import('mediabunny')>();
  return {
    ...actual,
    CmafOutputFormat: class extends actual.CmafOutputFormat {
      constructor(options: ConstructorParameters<typeof actual.CmafOutputFormat>[0]) {
        super({
          ...options,
          ...Object.fromEntries((['onFtyp', 'onMoov'] as const).map((name) => [
            name,
            (data: Uint8Array, position: number) => {
              // A padded view catches copying the backing buffer instead of the callback range.
              const backing = new Uint8Array(data.byteLength + 4).fill(0xee);
              const view = backing.subarray(2, data.byteLength + 2);
              view.set(data);
              delivered[name === 'onFtyp' ? 'ftyp' : 'moov'] = Array.from(data);
              delivered.buffers.push(view);
              const result = options?.[name]?.(view, position);
              view.fill(0xa5);
              return result;
            },
          ])),
        });
      }
    },
  };
});

it('keeps emitted init bytes after ftyp and moov callback buffers change', async () => {
  delivered.ftyp = [];
  delivered.moov = [];
  delivered.buffers = [];
  const load = await inspectMediaLibrary(new MemoryByteSource(mediabunnyMp4FixtureBytes()), {
    capabilities: {
      canConstructWorkerMse: () => false,
      mayDecode: () => ({ decodable: true } as never),
      mseImpl: () => ({ canConstructInDedicatedWorker: false, impl: 'standard', managed: false }),
      mseSupported: () => true,
      webCodecsAvailable: () => false,
      workerHandleAvailable: () => false,
    },
  });
  expect(load.status).toBe('ready');
  if (load.status !== 'ready') throw new Error('fixture was not ready');
  const units: AppendUnit[] = [];
  try {
    await new Promise<void>((resolve, reject) => {
      load.playback.start({
        abort: reject,
        append: (unit) => { units.push(unit); },
        evictBackBuffer: () => Promise.resolve(false),
        requestEndOfStream: () => undefined,
        resetParser: () => undefined,
      }, 1, { onComplete: resolve, onError: reject });
    });
    expect(delivered.ftyp.length).toBeGreaterThan(0);
    expect(delivered.moov.length).toBeGreaterThan(0);
    expect(delivered.buffers).toHaveLength(2);
    expect(delivered.buffers.every((view) => view.every((byte) => byte === 0xa5))).toBe(true);
    expect(units[0]?.kind).toBe('init');
    expect(Array.from(units[0].bytes)).toEqual([...delivered.ftyp, ...delivered.moov]);
  } finally {
    load.playback.dispose();
  }
});
