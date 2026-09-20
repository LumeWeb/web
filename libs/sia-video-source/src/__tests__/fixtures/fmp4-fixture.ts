/**
 * Shared deterministic fMP4 + SDK fixtures for the composition/worker-entry
 * specs: a tiny indexed fMP4 payload whose three
 * 30 s RAP ranges are marked 0x11/0x22/0x33, a fake Sia SDK slicing that
 * payload over `download`, a permissive capability snapshot, and the small
 * byte helpers the specs use. Everything is codec-legal and self-contained so
 * container/index/producer behavior never needs the real SDK or network.
 */
import { capabilityVerdict } from '../../capabilities/codec-verdict.ts';
import type { PlaybackCapabilities } from '../../capabilities/browser-capabilities.ts';
import type { Slab } from '@siafoundation/sia-storage';
import type { SiaObjectLike } from '../../ranged-reader.ts';
import type { SiaByteSourceSdk } from '../../transport/sia-byte-source.ts';

export interface FakeSiaSdkResult {
  downloads: number[];
  objectKeys: string[];
  sdk: SiaByteSourceSdk;
  shareForms: string[];
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
