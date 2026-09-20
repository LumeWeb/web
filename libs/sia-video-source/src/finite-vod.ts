export interface FiniteVodIndex {
  readonly durationSeconds: null | number;
  readonly segments: readonly VodSegment[];
}

export interface VodSegment {
  readonly durationSeconds: number;
  readonly endSeconds: number;
  readonly length: number;
  readonly offset: number;
  readonly startSeconds: number;
  readonly terminal: boolean;
}

interface Box {
  readonly end: number;
  readonly start: number;
  readonly type: string;
}

/** Parses a top-level sidx and the init segment's mvhd without guessing offsets. */
export function parseFiniteVodIndex(bytes: Uint8Array): FiniteVodIndex | null {
  const boxes = topLevelBoxes(bytes);
  const sidx = boxes.find((box) => box.type === 'sidx');
  if (!sidx) return null;
  const index = parseSidx(bytes, sidx);
  if (!index) return null;
  return { durationSeconds: mvhdDuration(bytes, boxes.find((box) => box.type === 'moov')), segments: index };
}

/**
 * Returns the RAP segment to read for a seek, clamping terminal seeks to the
 * final RAP. Selection FLOORS into the index — the last segment whose start is
 * at or before the target — so the appended fragment always begins at or
 * before the seek time. (Selecting the first segment whose END is past the
 * target can instead return a segment whose start is AFTER the target whenever
 * a publisher's per-segment durations drift from the wall-clock grid, leaving
 * an un-buffered gap at the playhead and stalling the seek.)
 */
export function segmentForTime(segments: readonly VodSegment[], time: number): null | VodSegment {
  if (segments.length === 0 || !Number.isFinite(time)) return null;
  const target = Math.max(0, time);
  let selected: null | VodSegment = null;
  for (const segment of segments) {
    if (segment.startSeconds > target) break;
    selected = segment;
  }
  return selected ?? segments[0] ?? null;
}

function boxesIn(bytes: Uint8Array, start: number, end: number): Box[] {
  const result: Box[] = [];
  let offset = start;
  while (offset + 8 <= end) {
    const size = uint32(bytes, offset);
    if (size < 8 || offset + size > end) break;
    result.push({ end: offset + size, start: offset + 8, type: fourCc(bytes, offset + 4) });
    offset += size;
  }
  return result;
}

function fourCc(bytes: Uint8Array, offset: number): string {
  return String.fromCharCode(bytes[offset] ?? 0, bytes[offset + 1] ?? 0, bytes[offset + 2] ?? 0, bytes[offset + 3] ?? 0);
}

function mvhdDuration(bytes: Uint8Array, moov: Box | undefined): null | number {
  if (!moov) return null;
  const mvhd = boxesIn(bytes, moov.start, moov.end).find((box) => box.type === 'mvhd');
  if (!mvhd || mvhd.start + 20 > mvhd.end) return null;
  const version = bytes[mvhd.start] ?? 0;
  const timescaleOffset = version === 1 ? mvhd.start + 20 : mvhd.start + 12;
  const durationOffset = version === 1 ? mvhd.start + 24 : mvhd.start + 16;
  if (durationOffset + (version === 1 ? 8 : 4) > mvhd.end) return null;
  const timescale = uint32(bytes, timescaleOffset);
  if (timescale === 0) return null;
  const duration = version === 1 ? Number(uint64(bytes, durationOffset)) : uint32(bytes, durationOffset);
  return Number.isSafeInteger(duration) ? duration / timescale : null;
}

function parseSidx(bytes: Uint8Array, sidx: Box): null | VodSegment[] {
  const version = bytes[sidx.start] ?? 0;
  const base = sidx.start + 4;
  const timescale = uint32(bytes, base + 4);
  if (!timescale) return null;
  const cursor = version === 1 ? base + 24 : base + 16;
  if (cursor + 4 > sidx.end) return null;
  const earliest = version === 1 ? uint64(bytes, base + 8) : BigInt(uint32(bytes, base + 8));
  const firstOffset = version === 1 ? uint64(bytes, base + 16) : BigInt(uint32(bytes, base + 12));
  const count = uint16(bytes, cursor + 2);
  let entry = cursor + 4;
  let offset = BigInt(sidx.end) + firstOffset;
  let time = earliest;
  const segments: VodSegment[] = [];
  for (let i = 0; i < count; i += 1) {
    if (entry + 12 > sidx.end) return null;
    const reference = uint32(bytes, entry);
    const length = reference & 0x7fffffff;
    const referenceType = reference >>> 31;
    const duration = uint32(bytes, entry + 4);
    const sap = uint32(bytes, entry + 8);
    // A zero RAP length, a reference that isn't a SAP, or a hierarchical
    // (non-RAP) reference would break byte-range seeking, so reject those.
    // Duration may be 0: our publisher's video-anchored sidx emits co-located
    // audio tiles at the exact frame of their anchor video, which legitimately
    // occupy zero presentation time. The seek grid floors by start, so a
    // zero-duration entry at the same instant as the next RAP is harmless.
    if (referenceType !== 0 || (sap >>> 31) !== 1 || length === 0 || offset > BigInt(Number.MAX_SAFE_INTEGER)) return null;
    const startSeconds = Number(time) / timescale;
    time += BigInt(duration);
    segments.push({ durationSeconds: duration / timescale, endSeconds: Number(time) / timescale, length, offset: Number(offset), startSeconds, terminal: i === count - 1 });
    offset += BigInt(length);
    entry += 12;
  }
  return segments.length > 0 ? segments : null;
}

function topLevelBoxes(bytes: Uint8Array): Box[] {
  return boxesIn(bytes, 0, bytes.length);
}

function uint16(bytes: Uint8Array, offset: number): number {
  return ((bytes[offset] ?? 0) << 8) | (bytes[offset + 1] ?? 0);
}

function uint32(bytes: Uint8Array, offset: number): number {
  return (((bytes[offset] ?? 0) * 2 ** 24) + ((bytes[offset + 1] ?? 0) << 16) + ((bytes[offset + 2] ?? 0) << 8) + (bytes[offset + 3] ?? 0));
}

function uint64(bytes: Uint8Array, offset: number): bigint {
  return (BigInt(uint32(bytes, offset)) << 32n) | BigInt(uint32(bytes, offset + 4));
}
