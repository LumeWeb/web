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
import { SidxIndex } from '../container/index/sidx-index.ts';
import {
  buildFirstIndex,
  createIndexBuilderRegistry,
  INDEX_HEAD_LENGTH,
  SidxIndexBuilder,
} from '../container/index/index-builder.ts';
import type { ContainerProfile, IndexBuilder } from '../container/index/random-access-index.ts';
import { containerProfileFor } from '../capabilities/container-classifier.ts';
import { containerKind, indexGranularity } from '../media/types.ts';
import { MemoryByteSource } from '../transport/memory-byte-source.ts';

function box(type: string, body: number[]): number[] {
  const size = body.length + 8;
  return [(size >>> 24) & 255, (size >>> 16) & 255, (size >>> 8) & 255, size & 255, ...type.split('').map((c) => c.charCodeAt(0)), ...body];
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

function u32(value: number): number[] {
  return [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
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
