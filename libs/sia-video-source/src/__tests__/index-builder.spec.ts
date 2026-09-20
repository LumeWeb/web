/**
 * TDD contract for the ordered index-builder registry: the composition root
 * tries an ordered best-effort ladder of `IndexBuilder` strategies against
 * generic bytes (`ByteSource`) and a `ContainerProfile`; the first builder
 * that returns a non-null index wins.
 *
 * The registry covers the sidx builder (`SidxIndexBuilder`) and the WebM
 * `CuesIndexBuilder`, tried in registration order.
 */

import { describe, expect, it } from 'vitest';
import { CuesIndex } from '../container/webm/cues-index.ts';
import { SidxIndex } from '../container/index/sidx-index.ts';
import {
  buildFirstIndex,
  createIndexBuilderRegistry,
  CuesIndexBuilder,
  INDEX_HEAD_LENGTH,
  SidxIndexBuilder,
} from '../container/index/index-builder.ts';
import type { ContainerProfile, IndexBuilder, RandomAccessIndex } from '../container/index/random-access-index.ts';
import { containerProfileFor } from '../capabilities/container-classifier.ts';
import { containerKind, indexGranularity } from '../media/types.ts';
import type { RangeRead } from '../media/types.ts';
import type { ByteRange, ByteSource, ReadOptions } from '../transport/byte-source.ts';
import { MemoryByteSource } from '../transport/memory-byte-source.ts';
import { buildWebm, scanEbmlTop } from './fixtures/webm-fixture.ts';

/** ByteSource that records every ranged read's extent — proves bounded reads. */
class RecordingByteSource implements ByteSource {
  readonly reads: { length: number; offset: number }[] = [];
  readonly size: number;
  readonly #inner: MemoryByteSource;
  constructor(bytes: Uint8Array) {
    this.#inner = new MemoryByteSource(bytes);
    this.size = bytes.byteLength;
  }
  cancel(reason?: unknown): void {
    this.#inner.cancel(reason);
  }
  read(range: ByteRange, options: ReadOptions): ReadableStream<Uint8Array> {
    this.reads.push({ length: range.length, offset: range.offset });
    return this.#inner.read(range, options);
  }
}

function box(type: string, body: number[]): number[] {
  const size = body.length + 8;
  return [(size >>> 24) & 255, (size >>> 16) & 255, (size >>> 8) & 255, size & 255, ...type.split('').map((c) => c.charCodeAt(0)), ...body];
}

/** Absolute starts of every top-level Cluster in `bytes` (test-side scan). */
function clusterStartsOf(bytes: Uint8Array): number[] {
  const top = scanEbmlTop(bytes);
  const segment = top.find((box) => box.id === 0x18538067);
  if (!segment) return [];
  const out: number[] = [];
  let offset = segment.start + headerLengthAt(bytes, segment.start);
  const segEnd = segment.end;
  while (offset + 1 < segEnd && offset + 1 < bytes.byteLength) {
    const id = readIdAt(bytes, offset);
    const extent = elementExtentAt(bytes, offset);
    if (extent === null) break;
    if (id === 0x1f43b675) out.push(offset);
    offset += extent;
  }
  return out;
}

/** Full extent (header + data) of the element at `offset`, or null when truncated. */
function elementExtentAt(bytes: Uint8Array, offset: number): null | number {
  const idLen = vintLengthAt(bytes, offset);
  if (idLen === 0) return null;
  const sizeOffset = offset + idLen;
  const sizeLen = vintLengthAt(bytes, sizeOffset);
  if (sizeLen === 0) return null;
  let raw = 0;
  for (let i = 0; i < sizeLen; i += 1) raw = (raw << 8) | (bytes[sizeOffset + i] ?? 0);
  raw &= (1 << (8 * sizeLen - sizeLen)) - 1;
  if (raw === (1 << (8 * sizeLen - sizeLen)) - 1) return null; // unknown size
  return idLen + sizeLen + raw;
}

/** ftyp+moov+sidx bytes for a 10s two-segment finite VOD object. */
function finiteVodBytes(): Uint8Array {
  const mvhd = box('mvhd', [0, 0, 0, 0, ...u32(0), ...u32(0), ...u32(1000), ...u32(10_000)]);
  const moov = box('moov', mvhd);
  const ftyp = box('ftyp', [105, 115, 111, 109]);
  const sidx = box('sidx', [
    0, 0, 0, 0, ...u32(1), ...u32(1000), ...u32(0), ...u32(0),
    0, 0, 0, 2,
    ...u32(100), ...u32(5000), 0x80, 0, 0, 0,
    ...u32(120), ...u32(5000), 0x80, 0, 0, 0,
  ]);
  return new Uint8Array([...ftyp, ...moov, ...sidx, ...Array<number>(220).fill(0)]);
}

/** Byte length of the element's id + size header, from the marker bits. */
function headerLengthAt(bytes: Uint8Array, offset: number): number {
  const idLen = vintLengthAt(bytes, offset);
  return idLen + vintLengthAt(bytes, offset + idLen);
}

function readIdAt(bytes: Uint8Array, offset: number): number {
  const length = vintLengthAt(bytes, offset);
  if (length === 0) return 0;
  let value = 0;
  for (let i = 0; i < length; i += 1) value = (value << 8) | (bytes[offset + i] ?? 0);
  return value;
}

function u32(value: number): number[] {
  return [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
}

/** The vint byte length at `offset` (0 for a byte with no marker bit). */
function vintLengthAt(bytes: Uint8Array, offset: number): number {
  const first = bytes[offset] ?? 0;
  for (let i = 0; i < 8; i += 1) {
    if (first & (0x80 >> i)) return i + 1;
  }
  return 0;
}

/** Walks the `RandomAccessIndex` range chain in order. */
function walkRanges(index: RandomAccessIndex): RangeRead[] {
  const seen: RangeRead[] = [];
  let range: null | RangeRead = index.first;
  while (range) {
    seen.push(range);
    range = index.next(range);
  }
  return seen;
}

const fmp4: ContainerProfile = containerProfileFor(containerKind.fmp4);

describe('SidxIndexBuilder', () => {
  it('supports only the fmp4 container profile', () => {
    const builder = new SidxIndexBuilder();
    expect(builder.supports(fmp4)).toBe(true);
    for (const container of [containerKind.ts, containerKind.mp4, containerKind.mkv, containerKind.webm, containerKind.unknown] as const) {
      expect(builder.supports(containerProfileFor(container))).toBe(false);
    }
  });

  it('builds a SidxIndex from a deterministic in-memory source', async () => {
    const builder = new SidxIndexBuilder();
    const source = new MemoryByteSource(finiteVodBytes());
    const index = await builder.build(source, fmp4);
    expect(index).toBeInstanceOf(SidxIndex);
    expect(index?.granularity).toBe(indexGranularity['exact-byte']);
    expect(index?.durationSeconds).toBe(10);
    expect(index?.first).toEqual({
      endSeconds: 5,
      length: 100,
      offset: 104,
      rap: true,
      startSeconds: 0,
      terminal: false,
    });
    expect(index?.seek(7.5)?.offset).toBe(204);
  });

  it('respects a bounded head length instead of reading the whole object', async () => {
    const builder = new SidxIndexBuilder(8);
    const source = new MemoryByteSource(finiteVodBytes());
    // 8 bytes cannot reach the top-level sidx, so the build degrades to null
    // instead of guessing a seek grid.
    expect(await builder.build(source, fmp4)).toBeNull();
  });

  it('returns null for a source with no top-level sidx', async () => {
    const builder = new SidxIndexBuilder();
    const source = new MemoryByteSource(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]));
    expect(await builder.build(source, fmp4)).toBeNull();
    expect(await builder.build(new MemoryByteSource(new Uint8Array()), fmp4)).toBeNull();
  });

  it('returns null for a profile it does not support', async () => {
    const builder = new SidxIndexBuilder();
    const source = new MemoryByteSource(finiteVodBytes());
    expect(await builder.build(source, containerProfileFor(containerKind.ts))).toBeNull();
  });
});

describe('CuesIndexBuilder', () => {
  const webm: ContainerProfile = containerProfileFor(containerKind.webm);

  it('supports only the webm container profile', () => {
    const builder = new CuesIndexBuilder();
    expect(builder.supports(webm)).toBe(true);
    for (const container of [containerKind.ts, containerKind.mp4, containerKind.mkv, containerKind.fmp4, containerKind.unknown] as const) {
      expect(builder.supports(containerProfileFor(container))).toBe(false);
    }
  });

  it('builds a CuesIndex from a webm that overruns the head without a whole-object read', async () => {
    const bytes = buildWebm(3, { padLastClusterBytes: 300 * 1024 });
    expect(bytes.byteLength).toBeGreaterThan(INDEX_HEAD_LENGTH);
    const source = new RecordingByteSource(bytes);
    const index = await new CuesIndexBuilder().build(source, webm);
    expect(index).toBeInstanceOf(CuesIndex);

    const ranges = walkRanges(index!);
    expect(ranges).toHaveLength(3);
    // The index stays exact-byte even though the object exceeds the head: every
    // later range is exactly one Cluster at its true byte offset.
    const starts = clusterStartsOf(bytes);
    expect(starts).toHaveLength(3);
    expect(ranges[1].offset).toBe(starts[1]);
    expect(ranges[2].offset).toBe(starts[2]);
    expect(index!.seek(1.5)?.offset).toBe(starts[1]);
    expect(index!.seek(2.5)?.offset).toBe(starts[2]);
    expect(index!.granularity).toBe(indexGranularity['exact-byte']);
    // No single ranged read may buffer the whole object: the cluster offsets
    // are collected from bounded windows, not a full-object read.
    const maxRead = Math.max(...source.reads.map((read) => read.length));
    expect(maxRead).toBeLessThanOrEqual(INDEX_HEAD_LENGTH);
    expect(maxRead).toBeLessThan(bytes.byteLength);
  });

  it('builds from a small object that fits entirely within the head', async () => {
    const bytes = buildWebm(2);
    const source = new RecordingByteSource(bytes);
    const index = await new CuesIndexBuilder().build(source, webm);
    expect(index).not.toBeNull();
    expect(walkRanges(index!)).toHaveLength(2);
    expect(Math.max(...source.reads.map((read) => read.length))).toBeLessThanOrEqual(INDEX_HEAD_LENGTH);
  });

  it('returns null for a profile it does not support', async () => {
    const builder = new CuesIndexBuilder();
    const source = new MemoryByteSource(buildWebm(2));
    expect(await builder.build(source, containerProfileFor(containerKind.ts))).toBeNull();
  });
});

describe('index builder registry', () => {
  it('ships an ordered default ladder that leads with the sidx builder', () => {
    const builders = createIndexBuilderRegistry();
    expect(builders.length).toBeGreaterThan(0);
    expect(builders[0]).toBeInstanceOf(SidxIndexBuilder);
    expect(builders[0]?.supports(fmp4)).toBe(true);
  });

  it('builds the first non-null index in registration order', async () => {
    const source = new MemoryByteSource(finiteVodBytes());
    // A builder that never produces an index must not block the sidx builder.
    const noop: IndexBuilder = {
      build: () => Promise.resolve(null),
      supports: () => true,
    };
    const index = await buildFirstIndex([noop, new SidxIndexBuilder()], source, fmp4);
    expect(index).toBeInstanceOf(SidxIndex);
    expect(index?.durationSeconds).toBe(10);
  });

  it('lets an earlier builder win over a later one', async () => {
    const source = new MemoryByteSource(finiteVodBytes());
    const sentinel: IndexBuilder = {
      build: () => Promise.resolve({ durationSeconds: 3, first: null, granularity: indexGranularity['rap-range'], next: () => null, seek: () => null }),
      supports: (profile) => profile.container === containerKind.fmp4,
    };
    const index = await buildFirstIndex([sentinel, new SidxIndexBuilder()], source, fmp4);
    expect(index?.durationSeconds).toBe(3);
  });

  it('skips unsupported builders and returns null when none produce an index', async () => {
    const source = new MemoryByteSource(finiteVodBytes());
    const tsOnly: IndexBuilder = {
      build: () => Promise.resolve({ durationSeconds: 1, first: null, granularity: indexGranularity['rap-range'], next: () => null, seek: () => null }),
      supports: (profile) => profile.container === containerKind.ts,
    };
    expect(await buildFirstIndex([tsOnly], source, fmp4)).toBeNull();
  });

  it('exposes the bounded head length used by the default builder', () => {
    expect(Number.isSafeInteger(INDEX_HEAD_LENGTH)).toBe(true);
    expect(INDEX_HEAD_LENGTH).toBeGreaterThan(0);
  });
});
