/**
 * Sniffs the container format from the leading bytes of a downloaded stream.
 *
 * This is the worker's pre-flight decision point: an unknown container is
 * rejected before any real download or decompression has begun, so
 * non-playable sources fail fast with an `unsupported` error instead of
 * failing after megabytes of ranged I/O.
 */

export type ContainerKind = 'fmp4' | 'mkv' | 'mp4' | 'ts' | 'unknown' | 'webm';

const EBML_SIGNATURE = [0x1a, 0x45, 0xdf, 0xa3] as const;
const TS_PACKET_LENGTH = 188;
const MAX_ISO_BOX_SCAN = 1 << 16;

/**
 * Classifies a container from its first bytes.
 *
 * @param bytes - The head of the stream. The 4 KiB probe window the worker
 *   fetches before starting playback is comfortably enough for every sniff
 *   below.
 */
export function sniffContainer(bytes: Uint8Array): ContainerKind {
  if (bytes.length < 8) return 'unknown';

  if (readAscii(bytes, 4, 4) === 'ftyp') return sniffIsoBmff(bytes);
  if (isMpegTs(bytes)) return 'ts';
  if (isEbml(bytes)) return sniffEbmlDocType(bytes);

  return 'unknown';
}

function isEbml(bytes: Uint8Array): boolean {
  for (let i = 0; i < EBML_SIGNATURE.length; i++) {
    if (bytes[i] !== EBML_SIGNATURE[i]) return false;
  }
  return true;
}

function isMpegTs(bytes: Uint8Array): boolean {
  if (bytes[0] !== 0x47) return false;
  // Extra sync bytes at packet strides separate an MPEG-TS stream from a
  // coincidental 0x47 elsewhere; a lone byte-sized stream cannot be verified.
  if (bytes.length > TS_PACKET_LENGTH && bytes[TS_PACKET_LENGTH] !== 0x47) return false;
  if (bytes.length > TS_PACKET_LENGTH * 2 && bytes[TS_PACKET_LENGTH * 2] !== 0x47) return false;
  return bytes.length >= TS_PACKET_LENGTH;
}

function readAscii(bytes: Uint8Array, offset: number, length: number): string {
  let text = '';
  for (let i = 0; i < length; i++) {
    text += String.fromCharCode(bytes[offset + i] ?? 0);
  }
  return text;
}

function readUint32Be(bytes: Uint8Array, offset: number): number {
  return (
    ((bytes[offset] ?? 0) << 24) |
    ((bytes[offset + 1] ?? 0) << 16) |
    ((bytes[offset + 2] ?? 0) << 8) |
    (bytes[offset + 3] ?? 0)
  );
}

function sniffEbmlDocType(bytes: Uint8Array): 'mkv' | 'webm' {
  const documentType = new TextDecoder().decode(bytes.subarray(0, Math.min(bytes.length, 256)));
  return documentType.includes('webm') && !documentType.includes('matroska') ? 'webm' : 'mkv';
}

/**
 * Walks the ISO BMFF box chain to tell a fragmented file (`moof` segments)
 * from a progressive one (`moov` followed directly by media). The walk is
 * bounded to the header region — enough to reach the first `mdat` of any
 * sane file.
 */
function sniffIsoBmff(bytes: Uint8Array): ContainerKind {
  const limit = Math.min(bytes.length, MAX_ISO_BOX_SCAN);
  let offset = 0;
  let sawMoov = false;

  while (offset + 8 <= limit && offset + 8 <= bytes.length) {
    const size = readUint32Be(bytes, offset);
    const type = readAscii(bytes, offset + 4, 4);

    if (size === 1) {
      // 64-bit largesize: read the low word and treat larger-than-window boxes
      // as "rest of file". None of the sniffing depends on exact extents past
      // this point.
      const low = readUint32Be(bytes, offset + 12);
      if (readUint32Be(bytes, offset + 8) !== 0 || low < 8) return sawMoov ? 'mp4' : 'unknown';
      if (type === 'moof') return 'fmp4';
      if (type === 'moov') sawMoov = true;
      offset += low;
      continue;
    }

    if (size < 8) return sawMoov ? 'mp4' : 'unknown';

    if (type === 'moof') return 'fmp4';
    if (type === 'moov') sawMoov = true;
    if (type === 'mdat') return 'mp4';

    offset += size;
  }

  return sawMoov ? 'mp4' : 'unknown';
}
