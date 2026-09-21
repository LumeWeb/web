/**
 * Shared deterministic transport + composition fixtures for the
 * composition/worker-entry specs: a fake Sia SDK slicing a payload over
 * `download`, a permissive capability snapshot, the fake ready `LoadPipeline`
 * the composition-root tests inject (so no real inspection runs), and the
 * small byte helpers the specs use. The composition layout is protocol/wiring
 * only — nothing here parses media or asserts media validity.
 */
import { capabilityVerdict } from '../../capabilities/codec-verdict.ts';
import type { PlaybackCapabilities } from '../../capabilities/browser-capabilities.ts';
import type { Slab } from '@siafoundation/sia-storage';
import type { MediaLoadResult, MediaPlayback } from '../../media/library-load.ts';
import type { SiaObjectLike } from '../../ranged-reader.ts';
import type { LoadPipeline, LoadRequest } from '../../session/load-pipeline.ts';
import type { AppendSink } from '../../sink/append-sink.ts';
import type { SiaByteSourceSdk } from '../../transport/sia-byte-source.ts';

export interface FakeSiaSdkResult {
  downloads: number[];
  objectKeys: string[];
  sdk: SiaByteSourceSdk;
  shareForms: string[];
}

/** Deterministic ready pipeline for composition tests; records every call. */
export class FakeLoadPipeline implements LoadPipeline {
  readonly calls: LoadRequest[] = [];
  readonly results: MediaLoadResult[];

  constructor(results: MediaLoadResult[] = [readyLoadResult()]) {
    this.results = results;
  }

  run(request: LoadRequest): Promise<MediaLoadResult> {
    this.calls.push(request);
    const next = this.results.shift();
    return Promise.resolve(next ?? readyLoadResult());
  }
}

/**
 * Playback fake conforming to the final callbacks-object contract. On `start`
 * it appends three identifiable marker units (init + two media) so composition
 * tests can assert sink-mode routing without real media bytes.
 */
export class FakeMediaPlayback implements MediaPlayback {
  disposed = 0;
  sink: AppendSink | null = null;
  started = 0;
  #disposed = false;
  #onComplete: (() => void) | null = null;
  #onError: ((error: unknown) => void) | null = null;

  complete(): void {
    this.#onComplete?.();
  }

  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    this.disposed += 1;
  }

  fail(error: unknown): void {
    this.#onError?.(error);
  }

  start(
    sink: AppendSink,
    _loadGeneration: number,
    callbacks: { readonly onComplete: () => void; readonly onError: (error: unknown) => void },
  ): void {
    this.started += 1;
    this.sink = sink;
    this.#onComplete = callbacks.onComplete;
    this.#onError = callbacks.onError;
    sink.append({ bytes: new Uint8Array([0x11, 0x11, 0x11, 0x11]), kind: 'init' });
    sink.append({ bytes: new Uint8Array([0x22, 0x22, 0x22, 0x22]), kind: 'media' });
    sink.append({ bytes: new Uint8Array([0x33, 0x33, 0x33, 0x33]), kind: 'media' });
  }
}

/** Three 30 s RAP ranges, each 5008 bytes (segments marked 0x11/0x22/0x33). */
export function boundedIndexedFmp4Payload(): Uint8Array {
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

export function concatBytes(chunks: readonly Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const out = new Uint8Array(total);
  let at = 0;
  for (const chunk of chunks) {
    out.set(chunk, at);
    at += chunk.byteLength;
  }
  return out;
}

export function containsInOrder(bytes: Uint8Array, search: readonly number[]): boolean {
  if (search.length === 0) return true;
  let at = 0;
  for (const value of search) {
    const index = bytes.indexOf(value, at);
    if (index < 0) return false;
    at = index + 1;
  }
  return true;
}

// objectSize() derives the payload size from the slab map, so fakes must
// return slabs whose lengths add up to the content length.
export function fakeObject(contentLength: number): SiaObjectLike {
  const slab = { length: contentLength } as unknown as Slab;
  return { id: () => 'composition-object', size: () => contentLength, slabs: () => [slab] };
}

/** SDK (object + optional sharedObject) whose downloads slice `payload`. */
export function fakeSiaSdk(payload: Uint8Array, options: { shared?: boolean } = {}): FakeSiaSdkResult {
  const downloads: number[] = [];
  const objectKeys: string[] = [];
  const shareForms: string[] = [];
  const sdk: SiaByteSourceSdk = {
    download: (_object: SiaObjectLike, dl?: { length?: number; offset?: number }) => {
      downloads.push(dl?.offset ?? 0);
      const start = dl?.offset ?? 0;
      const end = Math.min(start + (dl?.length ?? payload.length - start), payload.length);
      return new ReadableStream<Uint8Array>({
        start: (controller) => {
          const size = Math.max(0, end - start);
          if (size > 0) controller.enqueue(payload.slice(start, end));
          controller.close();
        },
      });
    },
    object: (key: string): Promise<SiaObjectLike> => {
      objectKeys.push(key);
      return Promise.resolve(fakeObject(payload.length));
    },
    ...(options.shared
      ? {
          sharedObject: (fetchForm: string): Promise<SiaObjectLike> => {
            shareForms.push(fetchForm);
            return Promise.resolve(fakeObject(payload.length));
          },
        }
      : {}),
  };
  return { downloads, objectKeys, sdk, shareForms };
}

export async function flush(): Promise<void> {
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 10));
}

/** Capability snapshot permitting any container with no worker MSE, no WebCodecs. */
export function permissiveCapabilities(): PlaybackCapabilities {
  return {
    canConstructWorkerMse: () => false,
    mayDecode: () => capabilityVerdict['unknown-codec'],
    mseSupported: () => true,
    webCodecsAvailable: () => false,
    workerHandleAvailable: () => false,
  };
}

/** A ready verdict that never involves real media bytes or mediabunny objects. */
export function readyLoadResult(playback: MediaPlayback = new FakeMediaPlayback()): MediaLoadResult {
  return {
    container: 'mp4',
    durationSeconds: 6,
    mime: 'video/mp4; codecs="avc1.640032,mp4a.40.2"',
    playback,
    status: 'ready',
    tracks: [
      { codec: 'avc1.640032', kind: 'video' },
      { codec: 'mp4a.40.2', kind: 'audio' },
    ],
  };
}

/** Valid Sia share URL (64-hex object key + 32-byte base64url key). */
export function shareSrc(): string {
  const key = Uint8Array.from({ length: 32 }, (_, i) => i + 1);
  let binary = '';
  for (const byte of key) binary += String.fromCharCode(byte);
  const fragment = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_');
  return `https://indexer.example/objects/${'a1b2c3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff01'}/shared?req=abc#encryption_key=${fragment}`;
}

function isoBox(type: string, body: number[]): number[] {
  const u32 = (value: number) => [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
  const size = body.length + 8;
  return [...u32(size), ...type.split('').map((c) => c.charCodeAt(0)), ...body];
}
