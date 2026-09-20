/**
 * Dependency-neutral EBML primitives for the native-WebM path. No external
 * library and no runtime globals: these are the raw vint / element-id /
 * integer / float readers every WebM parse (probe, codec sniff, Cues/Cluster
 * index) is built on.
 *
 * EBML sizes are vints: `marker` bits fix the byte length, the remaining bits
 * carry the value, and all-ones data bits mean "unknown size" (how live / MSE
 * WebM Segments are usually written). Element IDs are also vints but their
 * value INCLUDES the marker bits (an ID like 0x18538067 is 4 bytes).
 */

/** EBML/WebM element IDs used by the native-WebM index path. */
export const EBML_ELEMENT_ID = {
  audio: 0xe1,
  block: 0xa1,
  blockGroup: 0xa0,
  cluster: 0x1f43b675,
  clusterTimecode: 0xe7,
  codecId: 0x86,
  crc32: 0xbf,
  cueClusterPosition: 0xf1,
  cuePoint: 0xbb,
  cues: 0x1c53bb6b,
  cueTime: 0xb3,
  cueTrack: 0xf7,
  cueTrackPositions: 0xb7,
  docType: 0x4282,
  docTypeReadVersion: 0x4285,
  docTypeVersion: 0x4287,
  duration: 0x4489,
  ebml: 0x1a45dfa3,
  ebmlMaxIdLength: 0x42f2,
  ebmlMaxSizeLength: 0x42f3,
  ebmlReadVersion: 0x42f7,
  ebmlVersion: 0x4286,
  info: 0x1549a966,
  referenceBlock: 0xfb,
  seekHead: 0x114d9b74,
  segment: 0x18538067,
  simpleBlock: 0xa3,
  timecodeScale: 0x2ad7b1,
  trackEntry: 0xae,
  trackNumber: 0xd7,
  tracks: 0x1654ae6b,
  trackType: 0x83,
  video: 0xe0,
  void: 0xec,
} as const;

/** Elements that are pure padding/checksums and never carry index evidence. */
const SKIP_CHILD_IDS = new Set<number>([EBML_ELEMENT_ID.crc32, EBML_ELEMENT_ID.void]);

/** One decoded vint at `offset`. */
export interface EbmlVint {
  /** Byte length of the vint encoding. */
  readonly length: number;
  /** True when every data bit is 1 (an "unknown size" marker). */
  readonly unknown: boolean;
  /** The masked (marker-stripped) value. */
  readonly value: number;
}

/** Whether a child element id should be skipped (Void / CRC-32 padding). */
export function isSkippedChild(id: number): boolean {
  return SKIP_CHILD_IDS.has(id);
}

/** Decodes an element's data as ASCII (DocType, CodecID, app strings). */
export function readAscii(bytes: Uint8Array, dataOffset: number, dataLength: number): string {
  return new TextDecoder().decode(bytes.subarray(dataOffset, dataOffset + Math.max(0, dataLength)));
}

/** Reads an IEEE-754 binary64 from an element's data (WebM Duration is a float). */
export function readFloat64(bytes: Uint8Array, dataOffset: number, dataLength: number): null | number {
  if (dataLength !== 8) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset + dataOffset, 8);
  const value = view.getFloat64(0, false);
  return Number.isFinite(value) ? value : null;
}

/** Reads a big-endian unsigned integer from an element's data (minimal bytes). */
export function readUint(bytes: Uint8Array, dataOffset: number, dataLength: number): null | number {
  if (dataLength <= 0 || dataLength > 8) return null;
  let value = 0;
  for (let i = 0; i < dataLength; i += 1) value = (value * 256) + (bytes[dataOffset + i] ?? 0);
  return Number.isSafeInteger(value) ? value : null;
}

/**
 * Decodes the vint starting at `offset`. `mode` picks whether the value keeps
 * the marker bits (an EBML element ID) or strips them (an EBML size).
 *
 * Size values accumulate big-endian with `*` (not `<<`, which truncates to 32
 * bits) so an 8-byte size vint like ffmpeg writes for the Segment element
 * (`01 00 00 00 00 01 b4 6c` → 111724) decodes exactly. The all-ones "unknown
 * size" marker is recognized per length before the value is read: an 8-byte
 * marker is `01 ff ff ff ff ff ff ff` (its length-marker bit is the LSB, so
 * the remaining data bits are the seven `ff` bytes).
 */
export function readVint(bytes: Uint8Array, offset: number, mode: 'id' | 'size'): EbmlVint | null {
  const first = bytes[offset];
  if (first === undefined) return null;
  let length = 0;
  for (let i = 0; i < 8; i += 1) {
    if (first & (0x80 >> i)) {
      length = i + 1;
      break;
    }
  }
  if (length === 0) return null;
  if (offset + length > bytes.byteLength) return null;

  if (mode === 'size') {
    // Strip the length-marker (and its leading zeros): for a length-L vint the
    // first byte's low (8 - L) bits are the top data bits (0 for L = 8, whose
    // marker is the LSB), then every following byte is pure data. Accumulate
    // big-endian with `*` — `<<` truncates to 32 bits and would corrupt an
    // 8-byte Segment size like 01 00 00 00 00 01 b4 6c → 111724.
    const firstDataBits = 8 - length;
    const firstDataMask = firstDataBits === 0 ? 0 : (1 << firstDataBits) - 1;
    const firstDataAllOnes = firstDataBits === 0 ? first === 0x01 : (first & firstDataMask) === firstDataMask;
    let unknown = firstDataAllOnes;
    for (let i = 1; i < length && unknown; i += 1) unknown = (bytes[offset + i] ?? 0) === 0xff;
    if (unknown) return { length, unknown: true, value: 0 };
    let value = first & firstDataMask;
    for (let i = 1; i < length; i += 1) value = (value * 256) + (bytes[offset + i] ?? 0);
    return { length, unknown: false, value };
  }

  // id mode: the value keeps the marker bits (an EBML element id).
  let value = first;
  for (let i = 1; i < length; i += 1) value = (value * 256) + (bytes[offset + i] ?? 0);
  return { length, unknown: false, value };
}
