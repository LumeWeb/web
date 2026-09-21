/**
 * Dependency-neutral WebM probe: walks a WebM object's EBML header (DocType
 * must be `webm`), Segment, Info (TimecodeScale +
 * Duration), Tracks (track number / type / CodecID), Clusters (offset, end,
 * Timecode), and Cues (CuePoint → CueClusterPosition) into typed facts the
 * `CuesIndex` and the codec sniffer consume.
 *
 * `probeWebm` runs in `strict` mode against a full object (used by
 * `CuesIndex.build`) or `sniff` mode against a bounded head (used by
 * `webmCodecsFromHead`, where the Segment extends past the probe head yet its
 * leading Info/Tracks are still readable).
 */
import {
  EBML_ELEMENT_ID,
  readAscii,
  readFloat64,
  readUint,
  readVint,
} from './ebml.ts';
import type { EbmlElement, EbmlWalkMode } from './ebml-reader.ts';
import type { ByteSource } from '../../transport/byte-source.ts';
import { containerKind } from '../../media/legacy-types.ts';
import { ebmlWalkMode, findChild, findChildren, readEbmlElements, walkChildren } from './ebml-reader.ts';

/** One parsed Cluster: absolute byte extents + timecode in seconds. */
export interface WebmClusterInfo {
  /** Absolute start of the Cluster element's data (past its header). */
  readonly dataOffset: number;
  /** Absolute end of the Cluster element's data (exclusive). */
  readonly end: number;
  /** Keyframe evidence from the first video SimpleBlock, or null when absent. */
  readonly keyframe: boolean | null;
  /** Absolute start of the Cluster element's id. */
  readonly offset: number;
  /** Timecode in seconds (Timecode × TimecodeScale / 1e9). */
  readonly timecodeSeconds: number;
  /** Raw Timecode in TimecodeScale ticks, or null when absent. */
  readonly timecodeTicks: null | number;
}

/** Everything the index/codec path needs from one WebM object. */
export interface WebmProbeResult {
  readonly clusters: readonly WebmClusterInfo[];
  /** Absolute cluster offsets the Cues element references (RAP evidence). */
  readonly cuedClusterOffsets: ReadonlySet<number>;
  /** Segment `Duration` (float seconds) from Info, or null. */
  readonly durationSeconds: null | number;
  /** Absolute start of the Segment element's data (CueClusterPosition base). */
  readonly segmentDataStart: number;
  /** Info `TimecodeScale` in ns/tick (default 1_000_000). */
  readonly timecodeScale: number;
  /** Parsed TrackEntries (video and audio). */
  readonly tracks: readonly WebmTrackInfo[];
  /** The declared video track number (type 1), when one was parsed. */
  readonly videoTrackNumber: null | number;
}

/** One parsed TrackEntry: number, type (1 video / 2 audio), CodecID. */
export interface WebmTrackInfo {
  readonly codecId: string;
  readonly number: null | number;
  readonly type: null | number;
}

/** The default TimecodeScale when Info omits one (ns per tick). */
const DEFAULT_TIMECODE_SCALE = 1_000_000;

/** Nanoseconds per second (cluster Timecode × scale → seconds). */
const NANOS_PER_SECOND = 1_000_000_000;

/** The Cluster byte extents the walkers need (not timing/keyframe facts). */
export type ClusterExtents = Pick<WebmClusterInfo, 'dataOffset' | 'end' | 'offset'>;

/** Reconstructs the EbmlElement view of a probed Cluster (exact extents). */
export function clusterElement(cluster: ClusterExtents): EbmlElement {
  return {
    dataEnd: cluster.end,
    dataOffset: cluster.dataOffset,
    headerLength: cluster.dataOffset - cluster.offset,
    id: EBML_ELEMENT_ID.cluster,
    offset: cluster.offset,
    sizeUnknown: false,
  };
}

/**
 * Reads the keyframe flag of the first SimpleBlock belonging to
 * `trackNumber` inside a Cluster, or null when the cluster has no such block
 * or its header is truncated.
 */
export function firstBlockKeyframe(
  bytes: Uint8Array,
  cluster: ClusterExtents,
  trackNumber: null | number,
): boolean | null {
  for (const child of walkChildren(bytes, clusterElement(cluster), ebmlWalkMode.strict)) {
    if (child.id !== EBML_ELEMENT_ID.simpleBlock) continue;
    const flag = simpleBlockKeyframe(bytes, child, trackNumber);
    if (flag !== null) return flag;
  }
  return null;
}

/**
 * Probes `bytes` into a `WebmProbeResult`, or null when the bytes are not a
 * parseable WebM object (no EBML header or a non-`webm` DocType — MKV is
 * deferred). A strict (whole-object) walk additionally requires a Cluster to
 * anchor the index; a sniff of a bounded head does not, so a head that ends
 * before the first Cluster still yields its Info/Tracks codecs.
 */
export function probeWebm(bytes: Uint8Array, mode: EbmlWalkMode = ebmlWalkMode.strict): null | WebmProbeResult {
  const top = readEbmlElements(bytes, 0, bytes.length, mode);
  const ebml = top.find((element) => element.id === EBML_ELEMENT_ID.ebml);
  if (!ebml) return null;
  const docType = findChild(bytes, ebml, EBML_ELEMENT_ID.docType, mode);
  if (!docType || readAscii(bytes, docType.dataOffset, docType.dataEnd - docType.dataOffset) !== containerKind.webm) {
    return null; // MKV normalization is deferred; only DocType “webm” is served.
  }

  const segment = top.find((element) => element.id === EBML_ELEMENT_ID.segment);
  if (!segment) return null;
  const segmentDataStart = segment.dataOffset;
  const segmentChildren = walkChildren(bytes, segment, mode);

  const info = segmentChildren.find((element) => element.id === EBML_ELEMENT_ID.info) ?? null;
  let timecodeScale = DEFAULT_TIMECODE_SCALE;
  let durationSeconds: null | number = null;
  if (info) {
    const scale = findChild(bytes, info, EBML_ELEMENT_ID.timecodeScale, mode);
    const scaleValue = scale ? readUint(bytes, scale.dataOffset, scale.dataEnd - scale.dataOffset) : null;
    if (scaleValue !== null && scaleValue > 0) timecodeScale = scaleValue;
    const duration = findChild(bytes, info, EBML_ELEMENT_ID.duration, mode);
    if (duration) {
      // WebM Info/Duration is expressed in Segment Ticks (TimecodeScale
      // units), so 2003 ticks @ 1e6 ns/tick is 2.003 s — the same ticks→seconds
      // conversion the Cluster Timecodes use. Reading it as bare seconds would
      // over-report a real ffmpeg fixture by ~1000×.
      const raw =
        readFloat64(bytes, duration.dataOffset, duration.dataEnd - duration.dataOffset) ??
        readUint(bytes, duration.dataOffset, duration.dataEnd - duration.dataOffset);
      if (raw !== null) durationSeconds = raw * (timecodeScale / NANOS_PER_SECOND);
    }
  }

  const tracks: WebmTrackInfo[] = [];
  const tracksElement = segmentChildren.find((element) => element.id === EBML_ELEMENT_ID.tracks) ?? null;
  if (tracksElement) {
    for (const entry of findChildren(bytes, tracksElement, EBML_ELEMENT_ID.trackEntry, mode)) {
      const numberEl = findChild(bytes, entry, EBML_ELEMENT_ID.trackNumber, mode);
      const typeEl = findChild(bytes, entry, EBML_ELEMENT_ID.trackType, mode);
      const codecEl = findChild(bytes, entry, EBML_ELEMENT_ID.codecId, mode);
      tracks.push({
        codecId: codecEl ? readAscii(bytes, codecEl.dataOffset, codecEl.dataEnd - codecEl.dataOffset) : '',
        number: numberEl ? readUint(bytes, numberEl.dataOffset, numberEl.dataEnd - numberEl.dataOffset) : null,
        type: typeEl ? readUint(bytes, typeEl.dataOffset, typeEl.dataEnd - typeEl.dataOffset) : null,
      });
    }
  }
  const videoTrackNumber = tracks.find((track) => track.type === 1)?.number ?? null;

  const clusters: WebmClusterInfo[] = [];
  for (const cluster of segmentChildren) {
    if (cluster.id !== EBML_ELEMENT_ID.cluster) continue;
    const timecodeEl = findChild(bytes, cluster, EBML_ELEMENT_ID.clusterTimecode, mode);
    const timecodeTicks = timecodeEl ? readUint(bytes, timecodeEl.dataOffset, timecodeEl.dataEnd - timecodeEl.dataOffset) : null;
    const info = {
      dataOffset: cluster.dataOffset,
      end: cluster.dataEnd,
      offset: cluster.offset,
      timecodeSeconds: (timecodeTicks ?? 0) * (timecodeScale / NANOS_PER_SECOND),
      timecodeTicks,
    };
    clusters.push({ ...info, keyframe: firstBlockKeyframe(bytes, info, videoTrackNumber) });
  }
  // Only a strict full-object walk must anchor on a Cluster (the index needs
  // byte extents). A sniff of a bounded head never does: the codec path reads
  // only Segment + Info/Tracks, which can fit entirely before the first
  // Cluster starts, so it must not be refused for lacking one.
  if (mode === ebmlWalkMode.strict && clusters.length === 0) return null;

  const cuedClusterOffsets = new Set<number>();
  const cues = segmentChildren.find((element) => element.id === EBML_ELEMENT_ID.cues) ?? null;
  if (cues) collectCueOffsets(bytes, cues, segmentDataStart, mode, cuedClusterOffsets);

  return { clusters, cuedClusterOffsets, durationSeconds, segmentDataStart, timecodeScale, tracks, videoTrackNumber };
}

/**
 * Inspects one SimpleBlock: the track number is a vint, then a 2-byte signed
 * relative timecode, then a flags byte whose 0x80 bit marks a keyframe.
 * Returns null for a block of a different track or a truncated header.
 */
export function simpleBlockKeyframe(
  bytes: Uint8Array,
  block: { dataEnd: number; dataOffset: number; },
  trackNumber: null | number,
): boolean | null {
  const track = readVint(bytes, block.dataOffset, 'size');
  if (track === null) return null;
  if (trackNumber !== null && track.value !== trackNumber) return null;
  const flagsOffset = block.dataOffset + track.length + 2; // + 2-byte signed timecode
  if (flagsOffset >= block.dataEnd) return null;
  return (bytes[flagsOffset] & 0x80) !== 0;
}

/** Max bytes fetched in one windowed scan read over a Segment body (documented cap on per-read memory). */
export const SCAN_WINDOW_BYTES = 64 * 1024;

/** Max bytes fetched to parse a trailing Cues element (CuePoints are small). */
const CUES_READ_CAP = 256 * 1024;

/**
 * Probes a webm whose object exceeds the bounded head: the head supplies the
 * Segment/Info/Tracks facts and the remainder is streamed in bounded windows.
 * Same `WebmProbeResult` shape as `probeWebm`, for the index builder that
 * must not buffer a whole object just to extract cluster offsets.
 */
export async function probeWebmStreaming(source: ByteSource, head: Uint8Array): Promise<null | WebmProbeResult> {
  const base = probeWebm(head, ebmlWalkMode.sniff);
  if (base === null) return null;
  const scanned = await scanSegmentStreaming(source, base.segmentDataStart, base.videoTrackNumber, base.timecodeScale, base.segmentDataStart);
  if (scanned.clusters.length === 0) return null;
  return {
    clusters: scanned.clusters,
    cuedClusterOffsets: scanned.cuedClusterOffsets,
    durationSeconds: base.durationSeconds,
    segmentDataStart: base.segmentDataStart,
    timecodeScale: base.timecodeScale,
    tracks: base.tracks,
    videoTrackNumber: base.videoTrackNumber,
  };
}

/**
 * Adds every CueClusterPosition (made absolute against the Segment body start)
 * to `out`. Shared by the full-buffer probe and the windowed scan.
 */
function collectCueOffsets(
  bytes: Uint8Array,
  cues: EbmlElement,
  segmentDataStart: number,
  mode: EbmlWalkMode,
  out: Set<number>,
): void {
  for (const cuePoint of findChildren(bytes, cues, EBML_ELEMENT_ID.cuePoint, mode)) {
    for (const position of findChildren(bytes, cuePoint, EBML_ELEMENT_ID.cueTrackPositions, mode)) {
      const rel = findChild(bytes, position, EBML_ELEMENT_ID.cueClusterPosition, mode);
      const relValue = rel ? readUint(bytes, rel.dataOffset, rel.dataEnd - rel.dataOffset) : null;
      if (relValue !== null) out.add(segmentDataStart + relValue);
    }
  }
}

/** Reads `[offset, offset + length)` as one bounded buffer (short at EOF). */
async function readBoundedRange(source: ByteSource, offset: number, length: number): Promise<null | Uint8Array> {
  if (length <= 0) return null;
  const reader = source.read({ length, offset }, { loadGeneration: 0 }).getReader();
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
    void reader.cancel().catch(() => {/* empty */});
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
 * Streams a bounded-head webm's Segment body from byte `start` to EOF in
 * bounded windows. Cluster body bytes between elements are skipped (never
 * buffered), so peak memory is the largest single window rather than the
 * object size, while every Cluster's exact extents still get collected.
 *
 * The walk advances inside the window it already holds: consecutive element
 * headers that fall within the fetched bytes parse from the buffer, and a
 * fresh bounded read happens only when the cursor passes the window. A webm
 * whose clusters sit close together therefore costs a few wide reads instead
 * of one RangedReader/SDK round-trip per cluster.
 */
async function scanSegmentStreaming(
  source: ByteSource,
  start: number,
  videoTrackNumber: null | number,
  timecodeScale: number,
  segmentDataStart: number,
): Promise<{ clusters: WebmClusterInfo[]; cuedClusterOffsets: Set<number>; }> {
  const clusters: WebmClusterInfo[] = [];
  const cuedClusterOffsets = new Set<number>();
  let offset = start;
  let window: null | Uint8Array = null;
  let windowStart = start;
  while (offset + 1 < source.size) {
    // The current buffer no longer reaches `offset` (a cluster body was skipped
    // past the window's end): fetch the next bounded window there. Consecutive
    // elements already covered by fetched bytes parse from the buffer without
    // another round-trip.
    if (window === null || offset < windowStart || offset >= windowStart + window.byteLength) {
      const fetched = await readBoundedRange(source, offset, Math.min(SCAN_WINDOW_BYTES, source.size - offset));
      if (fetched === null) break;
      window = fetched;
      windowStart = offset;
    }
    const cursor = offset - windowStart;
    let idVint = readVint(window, cursor, 'id');
    let sizeVint = idVint === null ? null : readVint(window, cursor + idVint.length, 'size');
    if (idVint === null || sizeVint === null) {
      // The element header straddles the buffer's end (its id/size vint starts
      // inside the window but runs past it): refetch a fresh window at the
      // element so the header is contiguous. A fresh window at an element
      // start that still cannot be read as a vint is a truncated/malformed
      // tail, and the walk stops like the full-buffer walker does.
      if (windowStart === offset) break;
      const fetched = await readBoundedRange(source, offset, Math.min(SCAN_WINDOW_BYTES, source.size - offset));
      if (fetched === null) break;
      window = fetched;
      windowStart = offset;
      idVint = readVint(window, 0, 'id');
      sizeVint = idVint === null ? null : readVint(window, idVint.length, 'size');
      if (idVint === null || sizeVint === null) break;
    }
    const headerLength = idVint.length + sizeVint.length;
    const bodyLength = sizeVint.unknown ? source.size - offset - headerLength : sizeVint.value;
    const dataEnd = offset + headerLength + bodyLength;

    if (idVint.value === EBML_ELEMENT_ID.cluster) {
      const windowed: ClusterExtents = {
        dataOffset: cursor + headerLength,
        end: sizeVint.unknown ? window.byteLength : Math.min(cursor + headerLength + bodyLength, window.byteLength),
        offset: cursor,
      };
      const timecodeEl = findChild(window, clusterElement(windowed), EBML_ELEMENT_ID.clusterTimecode, ebmlWalkMode.sniff);
      const timecodeTicks = timecodeEl ? readUint(window, timecodeEl.dataOffset, timecodeEl.dataEnd - timecodeEl.dataOffset) : null;
      clusters.push({
        dataOffset: offset + headerLength,
        end: dataEnd,
        keyframe: firstBlockKeyframe(window, windowed, videoTrackNumber),
        offset,
        timecodeSeconds: (timecodeTicks ?? 0) * (timecodeScale / NANOS_PER_SECOND),
        timecodeTicks,
      });
    } else if (idVint.value === EBML_ELEMENT_ID.cues) {
      // Reuse the buffered window when it already holds the whole Cues extent
      // (bounded by the cap); only a Cues that runs past the window gets its
      // own read.
      const bodyBytes = Math.min(headerLength + bodyLength, CUES_READ_CAP);
      let cuesBytes = window;
      let cuesFrom = cursor;
      if (cursor + bodyBytes > window.byteLength) {
        const fetched = await readBoundedRange(source, offset, bodyBytes);
        if (fetched === null) break;
        cuesBytes = fetched;
        cuesFrom = 0;
      }
      const cuesElement = {
        dataEnd: Math.min(cuesFrom + headerLength + bodyLength, cuesBytes.byteLength),
        dataOffset: cuesFrom + headerLength,
        headerLength,
        id: EBML_ELEMENT_ID.cues,
        offset: cuesFrom,
        sizeUnknown: sizeVint.unknown,
      };
      collectCueOffsets(cuesBytes, cuesElement, segmentDataStart, ebmlWalkMode.sniff, cuedClusterOffsets);
    }
    if (sizeVint.unknown) break;
    offset = dataEnd;
  }
  return { clusters, cuedClusterOffsets };
}
