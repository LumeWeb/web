/**
 * Ordered index-builder registry: concrete builders live here and are
 * registered at the composition root in best-effort order.
 */

import { containerKind } from '../../media/legacy-types.ts';
import type { ByteSource } from '../../transport/byte-source.ts';
import { CuesIndex } from '../webm/cues-index.ts';
import { probeWebmStreaming } from '../webm/webm-probe.ts';
import { MoofWalkIndex, scanMoofStreaming } from './moof-index.ts';
import { SidxIndex } from './sidx-index.ts';
import type { ContainerProfile, IndexBuilder, RandomAccessIndex } from './random-access-index.ts';

/** Bytes read before parsing the index; enough to reach the top-level sidx. */
export const INDEX_HEAD_LENGTH = 256 * 1024;

/**
 * Builds a `CuesIndex` for native WebM. Cluster byte offsets live throughout
 * the object (never in a bounded head), so `build` reads the head first and
 * streams any excess in bounded windows; it never buffers the whole object.
 * Registered after the fMP4 builders because it only ever supports `webm`
 * profiles.
 */
export class CuesIndexBuilder implements IndexBuilder {
  readonly #headLength: number;

  constructor(headLength = INDEX_HEAD_LENGTH) {
    this.#headLength = headLength;
  }

  async build(source: ByteSource, profile: ContainerProfile): Promise<null | RandomAccessIndex> {
    if (!this.supports(profile)) return null;
    const head = await readHead(source, this.#headLength);
    if (head === null) return null;
    // The whole object fit in the head: the strict full-buffer walk suffices.
    if (source.size <= head.byteLength) return CuesIndex.build(head);
    // Otherwise cluster offsets must be streamed from bounded windows.
    const probe = await probeWebmStreaming(source, head);
    return probe === null ? null : CuesIndex.fromProbe(probe);
  }

  supports(profile: ContainerProfile): boolean {
    return profile.container === containerKind.webm;
  }
}

/**
 * Builds a `MoofWalkIndex` for sidx-less fragmented fMP4. `build` reads the
 * bounded head; an object that overruns it is walked in windows that read each
 * moof's sample tables but skip `mdat` payloads by declared size, so neither a
 * whole-object buffer nor a full-object read happens before playback.
 * Registered after the sidx builder: manifested fMP4 stays `SidxIndex`'s job,
 * and this builder returns null when it finds a top-level `sidx` in the walk.
 */
export class MoofWalkIndexBuilder implements IndexBuilder {
  readonly #headLength: number;

  constructor(headLength = INDEX_HEAD_LENGTH) {
    this.#headLength = headLength;
  }

  async build(source: ByteSource, profile: ContainerProfile): Promise<null | RandomAccessIndex> {
    if (!this.supports(profile)) return null;
    const head = await readHead(source, this.#headLength);
    if (head === null) return null;
    if (source.size <= head.byteLength) return MoofWalkIndex.parse(head);
    return scanMoofStreaming(source, head);
  }

  supports(profile: ContainerProfile): boolean {
    return profile.container === containerKind.fmp4;
  }
}

/** Builds a `SidxIndex` from a bounded head read (exact-byte granularity). */
export class SidxIndexBuilder implements IndexBuilder {
  readonly #headLength: number;

  constructor(headLength = INDEX_HEAD_LENGTH) {
    this.#headLength = headLength;
  }

  async build(source: ByteSource, profile: ContainerProfile): Promise<null | RandomAccessIndex> {
    if (!this.supports(profile)) return null;
    const head = await readHead(source, this.#headLength);
    return head ? SidxIndex.parse(head) : null;
  }

  supports(profile: ContainerProfile): boolean {
    return profile.container === containerKind.fmp4;
  }
}

/**
 * Runs the ordered builders against one profile; the first builder that
 * returns a non-null index wins. Unsupported builders are skipped without a
 * read.
 */
export async function buildFirstIndex(
  builders: readonly IndexBuilder[],
  source: ByteSource,
  profile: ContainerProfile,
): Promise<null | RandomAccessIndex> {
  for (const builder of builders) {
    if (!builder.supports(profile)) continue;
    const index = await builder.build(source, profile);
    if (index) return index;
  }
  return null;
}

/** Ordered best-effort ladder of the index strategies the registry ships. */
export function createIndexBuilderRegistry(): IndexBuilder[] {
  return [new SidxIndexBuilder(), new MoofWalkIndexBuilder(), new CuesIndexBuilder()];
}

/** Reads the first `length` bytes (short at EOF), or null for an empty object. */
async function readHead(source: ByteSource, length: number): Promise<null | Uint8Array> {
  const want = Math.min(length, source.size);
  if (want <= 0) return null;
  const reader = source.read({ length: want, offset: 0 }, { loadGeneration: 0 }).getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      total += value.byteLength;
      if (total >= want) break;
    }
  } finally {
    // A short/aborted read still wants the stream cancelled so a superseding
    // source never delivers into a stale buffer.
    void reader.cancel().catch(() => { /* empty */ });
  }
  if (total === 0) return null;

  const head = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    const remaining = Math.min(chunk.byteLength, total - offset);
    head.set(chunk.subarray(0, remaining), offset);
    offset += remaining;
  }
  return head;
}
