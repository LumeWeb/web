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
import { containerKind } from '../../media/types.ts';
import { ebmlWalkMode, findChild, findChildren, readEbmlElements, walkChildren } from './ebml-reader.ts';

/** One parsed Cluster: absolute byte extents + timecode in seconds. */
export interface WebmClusterInfo {
  /** Absolute start of the Cluster element's data (past its header). */
  readonly dataOffset: number;
  /** Absolute end of the Cluster element's data (exclusive). */
  readonly end: number;
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

/** Reconstructs the EbmlElement view of a probed Cluster (exact extents). */
export function clusterElement(cluster: WebmClusterInfo): EbmlElement {
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
  cluster: WebmClusterInfo,
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
 * parseable WebM object (no EBML header, a non-`webm` DocType — MKV is
 * deferred — or no Segment/Cluster to anchor the index).
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
    clusters.push({
      dataOffset: cluster.dataOffset,
      end: cluster.dataEnd,
      offset: cluster.offset,
      timecodeSeconds: (timecodeTicks ?? 0) * (timecodeScale / NANOS_PER_SECOND),
      timecodeTicks,
    });
  }
  if (clusters.length === 0) return null;

  const cuedClusterOffsets = new Set<number>();
  const cues = segmentChildren.find((element) => element.id === EBML_ELEMENT_ID.cues) ?? null;
  if (cues) {
    for (const cuePoint of findChildren(bytes, cues, EBML_ELEMENT_ID.cuePoint, mode)) {
      const positions = findChildren(bytes, cuePoint, EBML_ELEMENT_ID.cueTrackPositions, mode);
      for (const position of positions) {
        const rel = findChild(bytes, position, EBML_ELEMENT_ID.cueClusterPosition, mode);
        const relValue = rel ? readUint(bytes, rel.dataOffset, rel.dataEnd - rel.dataOffset) : null;
        if (relValue !== null) cuedClusterOffsets.add(segmentDataStart + relValue);
      }
    }
  }

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
