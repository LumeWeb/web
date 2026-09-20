/**
 * `MoofWalkIndex` — the `moof-walk` implementation of the generic
 * `RandomAccessIndex` contract, for fMP4 WITHOUT a top-level `sidx`.
 *
 * A fragmented MP4 with no sidx carries no manifest, so without an index a
 * seek would restart from byte zero / re-read the whole object. This index
 * walks the top-level `moof`/`mdat` pairs and parses each fragment's `tfdt`
 * (presentation start in track time), its sync evidence (`trun`
 * first-sample-flags or per-sample flags, else `tfhd` default-sample-flags),
 * and the init's `mvhd` duration, then exposes the exact-byte contract:
 *
 *   - `seek` FLOOR-selects the last fragment whose start is at or before the
 *     target (the same anneal/floor semantics as `SidxIndex`), and clamps a
 *     terminal seek to the final fragment / a negative seek to the first;
 *   - the FIRST range begins at byte 0 so a passthrough append always
 *     delivers the init segment (ftyp+moov included in that first range)
 *     before any media; every later range spans exactly one `moof`→`mdat`
 *     pair, so seeks read bounded fragment windows instead of re-fetching the
 *     whole object;
 *   - granularity is `exact-byte` once the walk completes;
 *   - `rap` reports parsed sync evidence and only the terminal range may drive
 *     EOS.
 *
 * A top-level `sidx` present alongside `moof`s makes this builder return
 * null: manifested fMP4 stays `SidxIndex`'s job, and the registry already
 * tries sidx first, so the walker only ever backs the sidx-less case.
 */
import type { IndexGranularity, RandomAccessIndex, RangeRead } from './random-access-index.ts';
import { indexGranularity } from '../../media/types.ts';
import type { ByteSource } from '../../transport/byte-source.ts';

/** A parsed ISO-BMFF box with absolute byte extents. */
interface Box {
  /** Absolute byte where this box's size/type header begins (the read offset). */
  readonly at: number;
  /** Absolute end of this box. */
  readonly end: number;
  /** Body start (past the size/type header). */
  readonly start: number;
  readonly type: string;
}

/** One parsed moof's fragment facts: time anchor, sync evidence, media span. */
interface MoofFacts {
  readonly durationSeconds: null | number;
  readonly rap: boolean;
  readonly startSeconds: number;
}

/** One walked fragment: an exact, time-anchored, RAP-aware byte range. */
interface MoofFragment {
  readonly endSeconds: number;
  readonly length: number;
  readonly offset: number;
  readonly rap: boolean;
  readonly startSeconds: number;
  readonly terminal: boolean;
}

/** Per-track facts the init segment contributes to the walk. */
interface MoovInfo {
  readonly durationSeconds: null | number;
  /** mvhd timescale; fallback when a moof's track is not declared in `moov`. */
  readonly timescale: number;
  readonly tracks: readonly TrackInfo[];
  readonly videoTrackId: null | number;
}

interface TfhdInfo {
  readonly defaultSampleDuration: null | number;
  readonly defaultSampleFlags: null | number;
  readonly trackId: number;
}

interface TrackInfo {
  readonly handler: string;
  readonly id: number;
  readonly timescale: number;
}

export class MoofWalkIndex implements RandomAccessIndex {
  readonly durationSeconds: null | number;
  readonly first: null | RangeRead;
  readonly granularity: IndexGranularity = indexGranularity['exact-byte'];

  readonly #fragments: readonly MoofFragment[];
  readonly #ranges: readonly RangeRead[];

  constructor(fragments: readonly MoofFragment[], durationSeconds: null | number) {
    this.#fragments = fragments;
    this.#ranges = fragments.map(toRange);
    this.durationSeconds = durationSeconds;
    this.first = this.#ranges[0] ?? null;
  }

  /**
   * Walks `bytes` (one whole sidx-less fMP4 object) into a `MoofWalkIndex`.
   * Returns null when there is no `moof` to walk, when a top-level `sidx`
   * exists (the SidxIndex owns those), or when the walk cannot settle a
   * single usable fragment.
   */
  static parse(bytes: Uint8Array): MoofWalkIndex | null {
    const boxes = topLevelBoxes(bytes);
    if (boxes.some((box) => box.type === 'sidx')) return null;
    const moofs = boxes.filter((box) => box.type === 'moof');
    if (moofs.length === 0) return null;
    const mdats = boxes.filter((box) => box.type === 'mdat');
    const moov = moovInfo(bytes, boxes.find((box) => box.type === 'moov') ?? null);
    const facts = moofs.map((moof) => parseMoof(bytes, moof, moov));
    if (facts.some((fact) => fact === null)) return null;
    const fragments = assembleFragments(moofs, mdats, facts as MoofFacts[], moov);
    return fragments === null ? null : assembledIndex(fragments, moov);
  }

  next(from: RangeRead): null | RangeRead {
    const position = this.#ranges.indexOf(from);
    if (position < 0 || position + 1 >= this.#ranges.length) return null;
    return this.#ranges[position + 1];
  }

  seek(timeSeconds: number): null | RangeRead {
    if (this.#fragments.length === 0 || !Number.isFinite(timeSeconds)) return null;
    const target = Math.max(0, timeSeconds);
    let selected: MoofFragment | null = null;
    for (const fragment of this.#fragments) {
      if (fragment.startSeconds > target) break;
      selected = fragment;
    }
    const chosen = selected ?? this.#fragments[0];
    return this.#ranges[this.#fragments.indexOf(chosen)] ?? null;
  }
}

/** Builds the index from assembled fragments, or null when none survived. */
function assembledIndex(fragments: MoofFragment[], moov: MoovInfo): MoofWalkIndex | null {
  const overall = fragments.length > 0 ? (moov.durationSeconds ?? fragments[fragments.length - 1].endSeconds) : null;
  return fragments.length > 0 ? new MoofWalkIndex(fragments, overall) : null;
}

/**
 * Turns per-moof facts (full-buffer or windowed) plus the top-level moof/mdat
 * grid into the exact-byte fragment list. `facts` parallels `moofs`
 * (file order). Returns null when a fragment has no media or a fact is
 * missing.
 */
function assembleFragments(
  moofs: readonly Box[],
  mdats: readonly Box[],
  facts: readonly MoofFacts[],
  moov: MoovInfo,
): MoofFragment[] | null {
  if (facts.length !== moofs.length) return null;
  const fragments: MoofFragment[] = [];
  let mdatIndex = 0;
  for (let i = 0; i < moofs.length; i += 1) {
    const moof = moofs[i];
    // Associate the first mdat that begins at/after this moof with it.
    while (mdatIndex < mdats.length && mdats[mdatIndex].start < moof.end) mdatIndex += 1;
    const mdat = mdats[mdatIndex] ?? null;
    if (mdat === null) return null; // a fragment with no media is not walkable
    mdatIndex += 1;
    const parsed = facts[i] ?? null;
    if (parsed === null) return null;
    // First range carries the init (byte 0 → first mdat end); later ranges
    // start at the moof's full box header so a bounded read covers the whole
    // moof→mdat pair (mfhd + traf included for a self-contained fragment).
    const offset = i === 0 ? 0 : moof.at;
    const last = i === moofs.length - 1;
    // The terminal range's end is the init's mvhd duration when it vouches
    // for one, else the fragment's own start + media span (ffmpeg
    // `empty_moov` writes mvhd duration 0 and leaves the real length in the
    // fragments), else the chrono-last start.
    const fragmentEnd = parsed.durationSeconds === null ? null : parsed.startSeconds + parsed.durationSeconds;
    fragments.push({
      endSeconds: last ? (moov.durationSeconds ?? fragmentEnd ?? parsed.startSeconds) : 0,
      length: mdat.end - offset,
      offset,
      rap: parsed.rap,
      startSeconds: parsed.startSeconds,
      terminal: last,
    });
  }
  // Non-terminal endSeconds come from the next fragment's start (the exact
  // after-index grid); sew them now that all starts are known.
  for (let i = 0; i < fragments.length - 1; i += 1) {
    fragments[i] = { ...fragments[i], endSeconds: fragments[i + 1].startSeconds };
  }
  return fragments;
}

/**
 * Bounds a `trun`'s declared sample_count against the bytes its per-sample
 * table physically holds. Returns the count when the box can hold it, else
 * null for a malformed box whose count cannot be satisfied — a hostile count
 * like 0xFFFFFFFF must never drive the per-sample loops below. A trun with no
 * per-sample fields consumes zero bytes per sample (every sample takes the
 * tfhd defaults), so no table-capacity check applies there.
 */
function boundedTrunCount(bytes: Uint8Array, trun: Box): null | number {
  const flags = readFlags(bytes, trun.start + 1);
  const count = u32(bytes, trun.start + 4);
  const entrySize = trunEntrySize(flags);
  if (count <= 0 || entrySize === 0) return count;
  let tableStart = trun.start + 8; // past version/flags + sample_count
  if (flags & 0x1) tableStart += 4; // data-offset
  if (flags & 0x4) tableStart += 4; // first-sample-flags
  const capacity = trun.end - tableStart;
  return count > Math.floor(capacity / entrySize) ? null : count;
}

/** Walks the child boxes inside one box (its `start` is the body start). */
function childBoxes(bytes: Uint8Array, box: Box): Box[] {
  return walkBoxes(bytes, box.start, box.end);
}

function fourCc(bytes: Uint8Array, offset: number): string {
  return String.fromCharCode(bytes[offset] ?? 0, bytes[offset + 1] ?? 0, bytes[offset + 2] ?? 0, bytes[offset + 3] ?? 0);
}

function hasTfdt(bytes: Uint8Array, traf: Box): boolean {
  return childBoxes(bytes, traf).some((box) => box.type === 'tfdt');
}

/** True when the first sample is an independent (sync / RAP) sample. */
function isRap(firstSampleFlags: null | number): boolean {
  // Unknown (no evidence anywhere) is optimistic-true — most fragmented
  // H.264/AAC content has RAP-aligned fragment starts; explicit evidence that
  // says the first sample is a non-sync (predicted) sample flips it to false
  // so the caller can refuse an undecodable fresh range.
  if (firstSampleFlags === null) return true;
  return (firstSampleFlags & 0x00010000) === 0;
}

/** Parses moov's mvhd duration/timescale and the per-track mdhd timescales. */
function moovInfo(bytes: Uint8Array, moov: Box | null): MoovInfo {
  let durationSeconds: null | number = null;
  let timescale = 1000;
  const tracks: TrackInfo[] = [];
  if (moov) {
    for (const child of childBoxes(bytes, moov)) {
      if (child.type === 'mvhd') {
        const parsed = parseMvhd(bytes, child);
        if (parsed !== null) {
          timescale = parsed.timescale;
          durationSeconds = parsed.durationSeconds;
        }
      } else if (child.type === 'trak') {
        const track = parseTrak(bytes, child);
        if (track !== null) tracks.push(track);
      }
    }
  }
  const videoTrackId = tracks.find((track) => track.handler === 'vide')?.id ?? tracks[0]?.id ?? null;
  return { durationSeconds, timescale, tracks, videoTrackId };
}

/** One moof → time + sync verdict + fragment duration, using the video/anchor track's timescale. */
function parseMoof(bytes: Uint8Array, moof: Box, moov: MoovInfo): MoofFacts | null {
  const trafs = childBoxes(bytes, moof).filter((box) => box.type === 'traf');
  if (trafs.length === 0) return null;
  // Prefer the moov-declared video track (it anchors the RAP grid); fall back
  // to any traf with a usable tfdt.
  const traf = videoTraf(bytes, trafs, moov.videoTrackId) ?? trafs.find((t) => hasTfdt(bytes, t));
  if (!traf) return null;
  const tfhd = childBoxes(bytes, traf).find((t) => t.type === 'tfhd');
  if (!tfhd) return null;
  const tfhdInfo = parseTfhd(bytes, tfhd);
  const tfdt = childBoxes(bytes, traf).find((t) => t.type === 'tfdt');
  if (!tfdt) return null;
  const baseDecodeTime = parseTfdt(bytes, tfdt);
  const timescale = trackTimescale(moov, tfhdInfo.trackId);
  if (timescale <= 0) return null;
  const trun = childBoxes(bytes, traf).find((t) => t.type === 'trun');
  // A trun whose declared sample_count cannot fit its per-sample table is
  // malformed (a hostile count like 0xFFFFFFFF must never drive the loops
  // below); refuse the fragment instead of iterating unboundedly.
  if (trun && boundedTrunCount(bytes, trun) === null) return null;
  const firstSampleFlags = trun ? trunFirstSampleFlags(bytes, trun, tfhdInfo.defaultSampleFlags) : tfhdInfo.defaultSampleFlags;
  // Fragment media span in track time units: summed trun sample durations when
  // present, else tfhd default-sample-duration × sample count, else null.
  const units = trun ? trunDurationUnits(bytes, trun, tfhdInfo.defaultSampleDuration) : null;
  const durationSeconds = units === null ? null : units / timescale;
  return { durationSeconds, rap: isRap(firstSampleFlags), startSeconds: baseDecodeTime / timescale };
}

function parseMvhd(bytes: Uint8Array, mvhd: Box): null | { durationSeconds: number; timescale: number } {
  const version = bytes[mvhd.start] ?? 0;
  const timescale = u32(bytes, mvhd.start + (version === 1 ? 20 : 12));
  if (timescale === 0) return null;
  const duration = version === 1 ? Number(u64(bytes, mvhd.start + 24)) : u32(bytes, mvhd.start + 16);
  // mvhd duration 0 is the fragmented/`empty_moov` convention for "unknown"
  // (the real length lives in the fragments); treat it as absent so the caller
  // falls back to the walked fragment grid instead of a 0-second duration.
  return Number.isFinite(duration) && duration > 0 ? { durationSeconds: duration / timescale, timescale } : null;
}

function parseTfdt(bytes: Uint8Array, tfdt: Box): number {
  const version = bytes[tfdt.start] ?? 0;
  return version === 1 ? Number(u64(bytes, tfdt.start + 4)) : u32(bytes, tfdt.start + 4);
}

function parseTfhd(bytes: Uint8Array, tfhd: Box): TfhdInfo {
  const flags = readFlags(bytes, tfhd.start + 1);
  const trackId = u32(bytes, tfhd.start + 4);
  let pos = tfhd.start + 8;
  let defaultSampleDuration: null | number = null;
  let defaultSampleFlags: null | number = null;
  // Optional fields appear in flag order (ISO 14496-12 'tfhd').
  if (flags & 0x1) pos += 8; // base-data-offset (always 64-bit)
  if (flags & 0x2) pos += 4; // sample-description-index
  if (flags & 0x8) {
    // default-sample-duration: the fragment's samples are uniform when the
    // trun carries no per-sample durations (ffmpeg fragmented output does this).
    defaultSampleDuration = u32(bytes, pos);
    pos += 4;
  }
  if (flags & 0x10) pos += 4; // default-sample-size
  if (flags & 0x20) {
    defaultSampleFlags = u32(bytes, pos);
    pos += 4;
  }
  return { defaultSampleDuration, defaultSampleFlags, trackId };
}

function parseTrak(bytes: Uint8Array, trak: Box): null | TrackInfo {
  let id: null | number = null;
  let timescale: null | number = null;
  let handler = '';
  for (const child of childBoxes(bytes, trak)) {
    if (child.type === 'tkhd') {
      const version = bytes[child.start] ?? 0;
      id = u32(bytes, child.start + (version === 1 ? 20 : 12));
    } else if (child.type === 'mdia') {
      for (const part of childBoxes(bytes, child)) {
        if (part.type === 'mdhd') {
          const version = bytes[part.start] ?? 0;
          timescale = u32(bytes, part.start + (version === 1 ? 20 : 12));
        } else if (part.type === 'hdlr') {
          handler = fourCc(bytes, part.start + 8);
        }
      }
    }
  }
  if (id === null || timescale === null || timescale <= 0) return null;
  return { handler, id, timescale };
}

function readFlags(bytes: Uint8Array, offset: number): number {
  return ((bytes[offset] ?? 0) << 16) | ((bytes[offset + 1] ?? 0) << 8) | (bytes[offset + 2] ?? 0);
}

/** Walks the top-level boxes of a full object (absolute box starts). */
function topLevelBoxes(bytes: Uint8Array): Box[] {
  return walkBoxes(bytes, 0, bytes.length);
}

/** Maps a walked fragment to the contract `RangeRead`. */
function toRange(fragment: MoofFragment): RangeRead {
  return {
    endSeconds: fragment.endSeconds,
    length: fragment.length,
    offset: fragment.offset,
    rap: fragment.rap,
    startSeconds: fragment.startSeconds,
    terminal: fragment.terminal,
  };
}

function trackTimescale(moov: MoovInfo, trackId: number): number {
  const track = moov.tracks.find((candidate) => candidate.id === trackId);
  return track?.timescale ?? moov.timescale;
}

/**
 * Total media duration of a fragment's samples in track time units: the sum of
 * per-sample durations when `trun` carries them (flag 0x100), else
 * tfhd default-sample-duration × sample count when the tfhd declares one, else
 * null (no duration evidence).
 */
function trunDurationUnits(bytes: Uint8Array, trun: Box, tfhdDefaultDuration: null | number): null | number {
  const flags = readFlags(bytes, trun.start + 1);
  const count = boundedTrunCount(bytes, trun) ?? 0;
  if (count === 0) return 0;
  let pos = trun.start + 8;
  if (flags & 0x1) pos += 4; // data-offset
  if (flags & 0x4) pos += 4; // first-sample-flags
  // No per-sample fields means the loop has nothing to walk (all samples take
  // the tfhd defaults); skipping it keeps a hostile count from burning CPU.
  if (trunEntrySize(flags) === 0) {
    return tfhdDefaultDuration === null ? null : tfhdDefaultDuration * count;
  }
  let sum = 0;
  let haveDurations = false;
  for (let i = 0; i < count; i += 1) {
    if (flags & 0x100) {
      sum += u32(bytes, pos);
      haveDurations = true;
      pos += 4; // sample-duration
    }
    if (flags & 0x200) pos += 4; // sample-size
    if (flags & 0x400) pos += 4; // sample-flags
    if (flags & 0x800) pos += 4; // sample-composition-time-offset
  }
  if (haveDurations) return sum;
  return tfhdDefaultDuration === null ? null : tfhdDefaultDuration * count;
}

/** Per-sample bytes one `trun` entry occupies, from the trun flags (ISO 14496-12). */
function trunEntrySize(flags: number): number {
  return (
    (flags & 0x100 ? 4 : 0) + // sample-duration
    (flags & 0x200 ? 4 : 0) + // sample-size
    (flags & 0x400 ? 4 : 0) + // sample-flags
    (flags & 0x800 ? 4 : 0) // sample-composition-time-offset
  );
}

/**
 * Extracts the first sample's 32-bit flags from a `trun` (or the tfhd
 * default when trun carries none). Handles the optional-field flag order.
 */
function trunFirstSampleFlags(bytes: Uint8Array, trun: Box, tfhdDefaultFlags: null | number): null | number {
  const flags = readFlags(bytes, trun.start + 1);
  const count = boundedTrunCount(bytes, trun) ?? 0;
  if (count <= 0) return tfhdDefaultFlags;
  let pos = trun.start + 8;
  if (flags & 0x1) pos += 4; // data-offset
  if (flags & 0x4) return u32(bytes, pos); // first-sample-flags
  // No per-sample flags field means there is no per-sample evidence to walk;
  // skip the loop so a hostile count cannot burn CPU.
  if (trunEntrySize(flags) === 0) return tfhdDefaultFlags;
  let first: null | number = null;
  for (let i = 0; i < count; i += 1) {
    if (flags & 0x100) pos += 4; // sample-duration
    if (flags & 0x200) pos += 4; // sample-size
    if (flags & 0x400) {
      first ??= u32(bytes, pos);
      pos += 4; // sample-flags
    }
    if (flags & 0x800) pos += 4; // sample-composition-time-offset
  }
  return first ?? tfhdDefaultFlags;
}

function u32(bytes: Uint8Array, offset: number): number {
  return ((bytes[offset] ?? 0) * 2 ** 24) + ((bytes[offset + 1] ?? 0) << 16) + ((bytes[offset + 2] ?? 0) << 8) + (bytes[offset + 3] ?? 0);
}

function u64(bytes: Uint8Array, offset: number): bigint {
  return (BigInt(u32(bytes, offset)) << 32n) | BigInt(u32(bytes, offset + 4));
}

/** The traf whose tfhd names the moov video track, when one exists. */
function videoTraf(bytes: Uint8Array, trafs: readonly Box[], videoTrackId: null | number): Box | null {
  if (videoTrackId === null) return null;
  for (const traf of trafs) {
    const tfhd = childBoxes(bytes, traf).find((box) => box.type === 'tfhd');
    if (tfhd && u32(bytes, tfhd.start + 4) === videoTrackId) return traf;
  }
  return null;
}

function walkBoxes(bytes: Uint8Array, bodyStart: number, bodyEnd: number): Box[] {
  const result: Box[] = [];
  let offset = bodyStart;
  while (offset + 8 <= bodyEnd) {
    const size = u32(bytes, offset);
    const type = fourCc(bytes, offset + 4);
    if (size === 1) {
      // 64-bit largesize (only sizes > 2^32 use it): hi word must be 0 for a
      // size that fits a Number.
      const hi = u32(bytes, offset + 8);
      const lo = u32(bytes, offset + 12);
      if (hi !== 0 || lo < 8 || offset + lo > bodyEnd) break;
      result.push({ at: offset, end: offset + lo, start: offset + 8, type });
      offset += lo;
      continue;
    }
    if (size < 8 || offset + size > bodyEnd) break;
    result.push({ at: offset, end: offset + size, start: offset + 8, type });
    offset += size;
  }
  return result;
}

/** Cap on a single moof box body read (moofs hold only sample tables, not media). */
const MOOF_READ_CAP = 256 * 1024;

/**
 * Streams a sidx-less fMP4 whose object exceeds the bounded head into a
 * `MoofWalkIndex`. The head supplies the init (moov/mvhd/trak) facts; the
 * remaining top-level boxes are walked in bounded windows that read each
 * moof's extent but skip `mdat` payloads by declared size, so index building
 * never buffers the whole object and playback can start from the head-length
 * read. Returns null under the same conditions as `MoofWalkIndex.parse`.
 */
export async function scanMoofStreaming(source: ByteSource, head: Uint8Array): Promise<MoofWalkIndex | null> {
  const headBoxes = topLevelBoxes(head);
  if (headBoxes.some((box) => box.type === 'sidx')) return null;
  const moov = moovInfo(head, headBoxes.find((box) => box.type === 'moov') ?? null);
  const boxes = await walkTopLevelBoxes(source, head);
  const moofs = boxes.filter((box) => box.type === 'moof');
  if (moofs.length === 0) return null;
  const mdats = boxes.filter((box) => box.type === 'mdat');
  const facts: MoofFacts[] = [];
  for (const moof of moofs) {
    const fact = await moofFactsBounded(source, head, moof, moov);
    if (fact === null) return null;
    facts.push(fact);
  }
  const fragments = assembleFragments(moofs, mdats, facts, moov);
  return fragments === null ? null : assembledIndex(fragments, moov);
}

/** Parses one moof from its own bounded read (or the head when it fits). */
async function moofFactsBounded(source: ByteSource, head: Uint8Array, moof: Box, moov: MoovInfo): Promise<MoofFacts | null> {
  // A moof fully inside the head parses from the head window with no extra
  // read; one beyond it is fetched whole (bounded by MOOF_READ_CAP) and parsed
  // with box offsets relative to that window.
  if (moof.end <= head.byteLength) {
    return parseMoof(head, moof, moov);
  }
  const moofLength = moof.end - moof.at;
  const body = await readBoundedRange(source, moof.at, Math.min(moofLength, MOOF_READ_CAP));
  if (body === null) return null;
  const windowed: Box = { at: 0, end: body.byteLength, start: moof.start - moof.at, type: moof.type };
  return parseMoof(body, windowed, moov);
}

/** Reads `[offset, offset + length)` as one bounded buffer (short at EOF). */
async function readBoundedRange(source: ByteSource, offset: number, length: number): Promise<null | Uint8Array> {
  if (length <= 0) return null;
  const reader = source.read({ length, offset }, { epoch: 0 }).getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      total += value.byteLength;
      if (total >= length) break;
    }
  } finally {
    void reader.cancel().catch(() => { /* empty */ });
  }
  if (total === 0) return null;

  const out = new Uint8Array(total);
  let at = 0;
  for (const chunk of chunks) {
    const n = Math.min(chunk.byteLength, total - at);
    out.set(chunk.subarray(0, n), at);
    at += n;
  }
  return out;
}

/**
 * Walks the top-level boxes of a source that overruns the bounded head. Only
 * the head is held as a window; every later box header is fetched whole (up to
 * 16 B) and every box body is skipped by its declared size, so `mdat` payload
 * bytes are never fetched and the walk never buffers the object. Break rules
 * mirror `walkBoxes` so the returned grid is byte-identical to the full-buffer
 * walk's.
 */
async function walkTopLevelBoxes(source: ByteSource, head: Uint8Array): Promise<Box[]> {
  const boxes: Box[] = [];
  let offset = 0;
  let window: null | Uint8Array = head;
  let windowStart = 0;
  while (offset + 8 <= source.size) {
    // The cursor left the buffered range (a box body was skipped past its end,
    // or the walk moved past the head): fetch the next header-sized window.
    if (window === null || offset < windowStart || offset >= windowStart + window.byteLength) {
      window = await readBoundedRange(source, offset, Math.min(16, source.size - offset));
      if (window === null) break;
      windowStart = offset;
    }
    const cursor = offset - windowStart;
    const size = u32(window, cursor);
    const type = fourCc(window, cursor + 4);
    if (size === 1) {
      // A 64-bit largesize header is 16 B: refetch when the current window
      // holds only the first 8 B (a header straddling the head's end), and
      // treat a window that cannot even hold 16 B as a truncated tail.
      if (cursor + 16 > window.byteLength) {
        if (offset + 16 > source.size) break;
        const fetched = await readBoundedRange(source, offset, Math.min(16, source.size - offset));
        if (fetched === null) break;
        window = fetched;
        windowStart = offset;
      }
      const hi = u32(window, offset - windowStart + 8);
      const lo = u32(window, offset - windowStart + 12);
      if (hi !== 0 || lo < 8 || offset + lo > source.size) break;
      boxes.push({ at: offset, end: offset + lo, start: offset + 8, type });
      offset += lo;
      continue;
    }
    if (size < 8 || offset + size > source.size) break;
    boxes.push({ at: offset, end: offset + size, start: offset + 8, type });
    offset += size; // the body (an mdat payload) is skipped, never fetched
  }
  return boxes;
}
