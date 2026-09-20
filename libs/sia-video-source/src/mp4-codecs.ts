/**
 * Codec sniffing for the fMP4 passthrough path.
 *
 * When the worker streams a fragmented MP4 object it cannot rely on a declared
 * `video/mp4` MIME: Chromium rejects a bare container type in
 * `MediaSource.addSourceBuffer`, yet under-specifying the codec is exactly how
 * the fMP4 path used to fail. This module walks the object's init segment
 * (the `moov` tree that `readHead` already has in hand) and extracts the RFC
 * 6381 codec string — e.g. `avc1.640032,mp4a.40.2` — so the worker can hand
 * MSE a codec-qualified MIME that actually describes the appended bytes.
 *
 * The path walked is the ISO BMFF sample-description chain:
 *   moov → trak (… each …) → mdia → minf → stbl → stsd → sample entries
 * A visual sample entry (`avc1`/`avc3`) is decoded via its `avcC` child
 * (profile + compatibility + level); an audio sample entry (`mp4a`) is decoded
 * via its `esds` child (DecoderConfigDescriptor.objectTypeIndication = 0x40
 * for AAC-LC). Every boundary is bounds-checked so a malformed or truncated
 * init segment returns `undefined` instead of throwing.
 */

/** Fixed prelude of a VisualSampleEntry before its child boxes (per 14496-12). */
const VISUAL_ENTRY_PRELUDE = 78;
/** Fixed prelude of an AudioSampleEntry before its child boxes. */
const AUDIO_ENTRY_PRELUDE = 28;
/** stsd is a FullBox: version+flags (4 B) then entry_count (4 B). */
const STSD_PRELUDE = 8;
/** MPEG-4 descriptor tag for DecoderConfigDescriptor. */
const DECODER_CONFIG_DESCRIPTOR = 0x04;
/** DecoderConfigDescriptor.objectTypeIndication for MPEG-4 audio (AAC). */
const OBJECT_TYPE_MPEG4_AUDIO = 0x40;
/** RFC 6381 codec for AAC-LC (the audioObjectType Sia's remuxer produces). */
const AAC_LC_CODEC = 'mp4a.40.2';

interface BoxRange {
  /** Payload end (exclusive), clamped to the scanned window. */
  readonly end: number;
  /** Payload start (just past the box header). */
  readonly start: number;
  /** Four-cc of the box, ASCII. */
  readonly type: string;
}

/**
 * Returns the RFC 6381 codec string of the fMP4 init segment, or `undefined`
 * when the bytes contain no decodable sample description. Codecs are listed in
 * track order (video then audio for the standard moov layout).
 */
export function mp4CodecsFromInit(bytes: Uint8Array): string | undefined {
  const moov = findChild(bytes, 0, bytes.length, 'moov');
  if (!moov) return undefined;

  const codecs: string[] = [];
  for (const trak of childrenOfType(bytes, moov.start, moov.end, 'trak')) {
    const stsd = descend(bytes, trak, ['mdia', 'minf', 'stbl', 'stsd']);
    if (!stsd) continue;
    // Sample entries follow the 8-byte stsd prelude (version+flags, count).
    const entriesFrom = Math.min(stsd.start + STSD_PRELUDE, stsd.end);
    for (const entry of boxesIn(bytes, entriesFrom, stsd.end)) {
      const codec = codecOfSampleEntry(bytes, entry);
      if (codec !== undefined) codecs.push(codec);
    }
  }

  return codecs.length > 0 ? codecs.join(',') : undefined;
}

/** `mp4a.40.2` when the mp4a entry's esds declares MPEG-4 audio (AAC-LC). */
function aacCodec(bytes: Uint8Array, entry: BoxRange): string | undefined {
  const esds = findChild(bytes, entry.start + AUDIO_ENTRY_PRELUDE, entry.end, 'esds');
  if (!esds) return undefined;
  // esds is a FullBox: version+flags (4 B) then the descriptor chain.
  const objectType = firstObjectTypeIndication(bytes, esds.start + 4, esds.end);
  return objectType === OBJECT_TYPE_MPEG4_AUDIO ? AAC_LC_CODEC : undefined;
}

/** `avc1.PPCCLL` from the avcC child: profile, compatibility, level each 2 hex. */
function avcCodec(bytes: Uint8Array, entry: BoxRange): string | undefined {
  const avcC = findChild(bytes, entry.start + VISUAL_ENTRY_PRELUDE, entry.end, 'avcC');
  if (!avcC || avcC.end - avcC.start < 4) return undefined;
  // avcC payload: configVersion, AVCProfileIndication, profile_compatibility,
  // AVCLevelIndication, …
  const profile = bytes[avcC.start + 1] ?? 0;
  const compat = bytes[avcC.start + 2] ?? 0;
  const level = bytes[avcC.start + 3] ?? 0;
  return `avc1.${hexByte(profile)}${hexByte(compat)}${hexByte(level)}`;
}

/**
 * Iterates top-level ISO BMFF boxes within `[start, end)`. Handles the 32-bit
 * size header, the 64-bit `largesize` form (size==1), and the zero size that
 * extends to the end of the window. Malformed/truncated boxes stop the walk.
 */
function boxesIn(bytes: Uint8Array, start: number, end: number): BoxRange[] {
  const boxStart = Math.max(0, Math.min(start, end));
  const boxEnd = Math.min(end, bytes.length);
  const found: BoxRange[] = [];
  let offset = boxStart;
  while (offset + 8 <= boxEnd) {
    const size32 = readUint32Be(bytes, offset);
    const type = fourCc(bytes, offset + 4);
    let header = 8;
    let size = size32;
    if (size32 === 1) {
      // 64-bit largesize (hi word then lo word).
      if (offset + 16 > boxEnd) break;
      const hi = readUint32Be(bytes, offset + 8);
      const lo = readUint32Be(bytes, offset + 12);
      if (hi !== 0) break; // beyond any real file this library handles
      size = lo;
      header = 16;
    } else if (size32 === 0) {
      size = boxEnd - offset;
    }
    if (size < header) break;
    const payloadEnd = Math.min(offset + size, boxEnd);
    found.push({ end: payloadEnd, start: offset + header, type });
    offset = Math.min(offset + size, boxEnd);
  }
  return found;
}

/** All direct child boxes of a given type within the window. */
function childrenOfType(bytes: Uint8Array, start: number, end: number, type: string): BoxRange[] {
  return boxesIn(bytes, start, end).filter((box) => box.type === type);
}

/** Decodes one stsd sample entry into an RFC 6381 codec, if recognizable. */
function codecOfSampleEntry(bytes: Uint8Array, entry: BoxRange): string | undefined {
  if (entry.type === 'avc1' || entry.type === 'avc3') {
    return avcCodec(bytes, entry);
  }
  if (entry.type === 'mp4a') {
    return aacCodec(bytes, entry);
  }
  return undefined;
}

/** ISO 14496-1 descriptor length: 7 bits per byte, high bit means "more". */
function decodeDescriptorLength(
  bytes: Uint8Array,
  start: number,
  end: number,
): undefined | { bytes: number; value: number } {
  let value = 0;
  let offset = start;
  for (let i = 0; i < 4; i += 1) {
    if (offset >= end) return undefined;
    const byte = bytes[offset] ?? 0;
    value = (value << 7) | (byte & 0x7f);
    offset += 1;
    if ((byte & 0x80) === 0) return { bytes: offset - start, value };
  }
  return undefined;
}

/**
 * Walks the container chain: `trak → mdia → minf → stbl → stsd`. A missing
 * link returns `undefined` (the trak simply has no decodable sample table).
 */
function descend(bytes: Uint8Array, from: BoxRange, path: readonly string[]): BoxRange | undefined {
  let range = from;
  for (const type of path) {
    const next = findChild(bytes, range.start, range.end, type);
    if (!next) return undefined;
    range = next;
  }
  return range;
}

/** Finds a direct child box of `type` within `[start, end)` (payload window). */
function findChild(bytes: Uint8Array, start: number, end: number, type: string): BoxRange | undefined {
  return boxesIn(bytes, start, end).find((box) => box.type === type);
}

/**
 * Finds the first DecoderConfigDescriptor within an esds descriptor chain
 * (nesting inside an ES_Descriptor when present) and returns its
 * objectTypeIndication, or `undefined` if none can be parsed.
 */
function firstObjectTypeIndication(bytes: Uint8Array, start: number, end: number): number | undefined {
  let offset = start;
  while (offset + 2 <= end) {
    const tag = bytes[offset] ?? 0;
    const length = decodeDescriptorLength(bytes, offset + 1, end);
    if (length === undefined) return undefined;
    const bodyStart = offset + 1 + length.bytes;
    const bodyEnd = Math.min(bodyStart + length.value, end);

    if (tag === 0x03) {
      // ES_Descriptor body starts with ES_ID (2) + flags (1); its
      // DecoderConfigDescriptor follows.
      const inner = bodyStart + 3;
      if (inner + 2 <= bodyEnd) {
        const nested = firstObjectTypeIndication(bytes, inner, bodyEnd);
        if (nested !== undefined) return nested;
      }
      return undefined; // first ES_Descriptor governs; no further scanning
    }
    if (tag === DECODER_CONFIG_DESCRIPTOR) {
      if (bodyStart < bodyEnd) return bytes[bodyStart] ?? 0;
      return undefined;
    }
    offset = bodyEnd;
  }
  return undefined;
}

function fourCc(bytes: Uint8Array, offset: number): string {
  return String.fromCharCode(bytes[offset] ?? 0, bytes[offset + 1] ?? 0, bytes[offset + 2] ?? 0, bytes[offset + 3] ?? 0);
}

function hexByte(value: number): string {
  return (value & 0xff).toString(16).padStart(2, '0');
}

function readUint32Be(bytes: Uint8Array, offset: number): number {
  return (
    ((bytes[offset] ?? 0) << 24) |
    ((bytes[offset + 1] ?? 0) << 16) |
    ((bytes[offset + 2] ?? 0) << 8) |
    (bytes[offset + 3] ?? 0)
  );
}
