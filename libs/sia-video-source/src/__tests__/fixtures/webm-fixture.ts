/**
 * Deterministic WebM fixture builder for the Cues/Cluster random-access index
 * tests (`IndexSourceKind 'cues'`).
 *
 * These are TEST-side byte builders only — they deliberately re-implement a
 * tiny EBML writer so the unit contracts assert exact byte offsets derived
 * independently of the production `CuesIndex` parser.
 *
 * Layout produced by `buildWebm(n)`:
 *
 *   EBML(DocType webm) Segment(Info(TimecodeScale=1e6, Duration=3000 ticks = 3s)
 *        Tracks(video V_VP8 #1, audio A_VORBIS #2) Cluster×n Cues×n)
 *
 * Cluster i (0-based) carries a Timecode of `i * 1e3` ticks → presentation
 * start `i` s (TimecodeScale 1e6 ns/tick: 1000 ticks × 1e6 ns = 1 s). The
 * Cues element's `CueClusterPosition` values are relative to the Segment body
 * start — the exact-byte contract the index derives ranges from.
 */

/** One EBML element: `id` bytes then a size vint then the payload. */
export function ebmlElement(id: readonly number[], payload: readonly number[]): number[] {
  return [...id, ...sizeVint(payload.length), ...payload];
}

/** IEEE-754 binary64 big-endian bytes (WebM `Duration` is a float). */
export function float64Bytes(value: number): number[] {
  const buffer = new ArrayBuffer(8);
  new DataView(buffer).setFloat64(0, value, false);
  return [...new Uint8Array(buffer)];
}

/**
 * Encodes one EBML size vint (with the marker bit). Refuses the all-ones
 * unknown-size value so it can be used for every element here.
 */
export function sizeVint(value: number): number[] {
  for (let length = 1; length <= 8; length += 1) {
    const capacity = 2 ** (8 * length - length);
    if (value <= capacity - 2) {
      const coded = value | capacity;
      const out: number[] = [];
      for (let i = length - 1; i >= 0; i -= 1) out.push((coded >>> (8 * i)) & 0xff);
      return out;
    }
  }
  throw new Error(`sizeVint: ${value} does not fit in 8 bytes`);
}

/** ASCII string as bytes. */
export function stringBytes(text: string): number[] {
  return [...new TextEncoder().encode(text)];
}

/** Big-endian minimal bytes for an unsigned EBML integer value. */
export function uintBytes(value: number): number[] {
  if (!Number.isInteger(value) || value < 0) throw new Error(`uintBytes: ${value} is not a non-negative integer`);
  const out: number[] = [];
  let remaining = value;
  do {
    out.unshift(remaining & 0xff);
    remaining = Math.floor(remaining / 256);
  } while (remaining > 0);
  return out;
}

/** The 8-byte all-ones size vint: "unknown size" (used by live Segment elements). */
export const UNKNOWN_SIZE_VINT = [0x01, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff] as const;

/** WebM EBML element IDs used by this fixture builder. */
export const WEBM_ID = {
  audio: [0xe1],
  cluster: [0x1f, 0x43, 0xb6, 0x75],
  clusterTimecode: [0xe7],
  codecId: [0x86],
  cueClusterPosition: [0xf1],
  cuePoint: [0xbb],
  cues: [0x1c, 0x53, 0xbb, 0x6b],
  cueTime: [0xb3],
  cueTrack: [0xf7],
  cueTrackPositions: [0xb7],
  docType: [0x42, 0x82],
  docTypeReadVersion: [0x42, 0x85],
  docTypeVersion: [0x42, 0x87],
  duration: [0x44, 0x89],
  ebml: [0x1a, 0x45, 0xdf, 0xa3],
  ebmlMaxIdLength: [0x42, 0xf2],
  ebmlMaxSizeLength: [0x42, 0xf3],
  ebmlReadVersion: [0x42, 0xf7],
  ebmlVersion: [0x42, 0x86],
  info: [0x15, 0x49, 0xa9, 0x66],
  segment: [0x18, 0x53, 0x80, 0x67],
  simpleBlock: [0xa3],
  timecodeScale: [0x2a, 0xd7, 0xb1],
  trackEntry: [0xae],
  trackNumber: [0xd7],
  tracks: [0x16, 0x54, 0xae, 0x6b],
  trackType: [0x83],
  video: [0xe0],
} as const;

/**
 * Builds a deterministic WebM object: EBML header + Segment(Info, Tracks,
 * `count` keyframe-leading Clusters at 0s/1s/…, Cues at the tail).
 */
export function buildWebm(count: number, options: { nonSyncLast?: boolean; unknownSegmentSize?: boolean } = {}): Uint8Array {
  const { nonSyncLast = false, unknownSegmentSize = false } = options;
  const ebmlHeader = ebmlElement(WEBM_ID.ebml, [
    ...ebmlElement(WEBM_ID.ebmlVersion, uintBytes(1)),
    ...ebmlElement(WEBM_ID.ebmlReadVersion, uintBytes(1)),
    ...ebmlElement(WEBM_ID.ebmlMaxIdLength, uintBytes(4)),
    ...ebmlElement(WEBM_ID.ebmlMaxSizeLength, uintBytes(8)),
    ...ebmlElement(WEBM_ID.docType, stringBytes('webm')),
    ...ebmlElement(WEBM_ID.docTypeVersion, uintBytes(4)),
    ...ebmlElement(WEBM_ID.docTypeReadVersion, uintBytes(2)),
  ]);

  const info = ebmlElement(WEBM_ID.info, [
    ...ebmlElement(WEBM_ID.timecodeScale, uintBytes(1_000_000)),
    // WebM Info/Duration is in Segment Ticks: count s @ 1e6 ns/tick = count*1000 ticks.
    ...ebmlElement(WEBM_ID.duration, float64Bytes(count * 1000)),
  ]);
  const tracks = ebmlElement(WEBM_ID.tracks, [
    ...ebmlElement(WEBM_ID.trackEntry, [
      ...ebmlElement(WEBM_ID.trackNumber, uintBytes(1)),
      ...ebmlElement(WEBM_ID.trackType, uintBytes(1)),
      ...ebmlElement(WEBM_ID.codecId, stringBytes('V_VP8')),
    ]),
    ...ebmlElement(WEBM_ID.trackEntry, [
      ...ebmlElement(WEBM_ID.trackNumber, uintBytes(2)),
      ...ebmlElement(WEBM_ID.trackType, uintBytes(2)),
      ...ebmlElement(WEBM_ID.codecId, stringBytes('A_VORBIS')),
    ]),
  ]);

  // Assemble clusters sequentially, recording each cluster's body-relative offset.
  const clusters: { bytes: number[]; relOffset: number; }[] = [];
  let cursor = 0;
  for (let i = 0; i < count; i += 1) {
    const nonSync = nonSyncLast && i === count - 1;
    const bytes = clusterBytes(i * 1_000, nonSync, i + 1);
    clusters.push({ bytes, relOffset: cursor });
    cursor += bytes.length;
  }

  const cuePoints = clusters.flatMap((cluster, i) => cuePointBytes(i * 1000, cluster.relOffset));
  const cues = ebmlElement(WEBM_ID.cues, cuePoints);
  const segmentBody = [...info, ...tracks, ...clusters.flatMap((cluster) => cluster.bytes), ...cues];

  return new Uint8Array([
    ...ebmlHeader,
    ...(unknownSegmentSize
      ? [WEBM_ID.segment[0], WEBM_ID.segment[1], WEBM_ID.segment[2], WEBM_ID.segment[3], ...UNKNOWN_SIZE_VINT, ...segmentBody]
      : ebmlElement(WEBM_ID.segment, segmentBody)),
  ]);
}

/** One Cluster with a video (track 1, keyframe) + audio (track 2) SimpleBlock. */
export function clusterBytes(timecodeTicks: number, nonSync: boolean, marker: number): number[] {
  return ebmlElement(WEBM_ID.cluster, [
    ...ebmlElement(WEBM_ID.clusterTimecode, uintBytes(timecodeTicks)),
    ...ebmlElement(WEBM_ID.simpleBlock, simpleBlock(1, 0, !nonSync, [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, marker])),
    ...ebmlElement(WEBM_ID.simpleBlock, simpleBlock(2, 0, true, [0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, marker])),
  ]);
}

/** One CuePoint for a cluster whose body starts `clusterRelOffset` into the Segment. */
export function cuePointBytes(timeMs: number, clusterRelOffset: number): number[] {
  return ebmlElement(WEBM_ID.cuePoint, [
    ...ebmlElement(WEBM_ID.cueTime, uintBytes(timeMs)),
    ...ebmlElement(WEBM_ID.cueTrackPositions, [
      ...ebmlElement(WEBM_ID.cueTrack, uintBytes(1)),
      ...ebmlElement(WEBM_ID.cueClusterPosition, uintBytes(clusterRelOffset)),
    ]),
  ]);
}

export function roundTripUint(value: number): number {
  const bytes = uintBytes(value);
  let out = 0;
  for (const byte of bytes) out = (out * 256) + byte;
  return out;
}

/** Scans top-level EBML elements and returns their id + byte extents (test-side). */
export function scanEbmlTop(bytes: Uint8Array): { end: number; id: number; start: number; }[] {
  const out: { end: number; id: number; start: number; }[] = [];
  let offset = 0;
  while (offset + 1 < bytes.byteLength) {
    const id = readVintValue(bytes, offset);
    const idLen = idVintLength(bytes, offset);
    const size = readElementSize(bytes, offset + idLen);
    if (size === null) break;
    const start = offset;
    const end = start + idLen + size.vintLength + size.value;
    if (end > bytes.byteLength) break;
    out.push({ end, id, start });
    offset = end;
  }
  return out;
}

/** One SimpleBlock payload: track vint, 2-byte relative timecode, flags, frame. */
export function simpleBlock(trackNumber: number, relativeTimecode: number, keyframe: boolean, frame: readonly number[]): number[] {
  const track = sizeVint(trackNumber);
  const timecode = [((relativeTimecode >> 8) & 0xff) | 0, relativeTimecode & 0xff];
  const flags = keyframe ? 0x80 : 0x00; // bit 0x80 = keyframe; no lacing
  return [...track, ...timecode, flags, ...frame];
}

function idVintLength(bytes: Uint8Array, offset: number): number {
  const first = bytes[offset] ?? 0;
  for (let i = 0; i < 8; i += 1) if (first & (0x80 >> i)) return i + 1;
  return 1;
}

/** Reads a size vint; null for unknown/oversized. */
function readElementSize(bytes: Uint8Array, offset: number): null | { value: number; vintLength: number; } {
  const length = idVintLength(bytes, offset);
  let raw = 0;
  for (let i = 0; i < length; i += 1) raw = (raw << 8) | (bytes[offset + i] ?? 0);
  raw &= (1 << (8 * length - length)) - 1;
  if (raw === (1 << (8 * length - length)) - 1) return null; // unknown size
  return { value: raw, vintLength: length };
}

/** Reads the raw (marker-included) id vint value. */
function readIdRaw(bytes: Uint8Array, offset: number): number {
  const length = idVintLength(bytes, offset);
  let value = 0;
  for (let i = 0; i < length; i += 1) value = (value << 8) | (bytes[offset + i] ?? 0);
  return value;
}

function readVintValue(bytes: Uint8Array, offset: number): number {
  return readIdRaw(bytes, offset);
}
