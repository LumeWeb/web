/**
 * Deterministic sidx-less fMP4 fixture for the moof-walk random-access index
 * tests (`src/container/index/moof-index.ts`).
 *
 * These are TEST-side byte builders only — they deliberately re-implement a
 * tiny top-level ISO-BMFF scanner so the unit contracts assert exact byte
 * offsets derived independently of the production `MoofWalkIndex` parser.
 *
 * Layout produced by `buildSidxLessFmp4(n)`:
 *
 *   ftyp moov (mvhd duration 10 s @1000; one video trak @30000)  [i * (moof mdat)]
 *
 * Each fragment i (1-based) carries a `tfdt` base media decode time of
 * `(i-1) * 30000` → presentation start `(i-1)` s. Fragment mdat bodies use
 * distinct sizes so byte-boundary assertions are exact.
 */

/** One top-level box with byte extents (test-side layout scanner). */
export interface TestBoxLayout {
  readonly end: number;
  readonly start: number;
  readonly type: string;
}

/** ASCII '4cc' as bytes. */
export function ascii4(type: string): number[] {
  return type.split('').map((char) => char.charCodeAt(0));
}

/** One `size(4) type(4) body` ISO-BMFF box as bytes. */
export function box(type: string, body: number[]): number[] {
  return [...u32be(body.length + 8), ...ascii4(type), ...body];
}

/** Bytes for a tiny fMP4 with a top-level sidx AND moofs (sidx must win). */
export function buildSidxFmp4(): Uint8Array {
  const sidx = box('sidx', [0, 0, 0, 0, ...u32be(1, 1000), ...u32be(0, 0), ...u16be(1), ...u32be(100, 5000, 0x80000000)]);
  const bytes: number[] = [...box('ftyp', [...ascii4('isom'), ...u32be(0)]), ...sidx, ...moovFixture()];
  for (let i = 1; i <= 2; i += 1) {
    bytes.push(...moofFixture((i - 1) * 30_000, trafFixture((i - 1) * 30_000)));
    bytes.push(...box('mdat', new Array<number>(20).fill(0)));
  }
  return new Uint8Array(bytes);
}

/**
 * Builds a deterministic sidx-less fMP4: ftyp + moov + `count` (moof mdat)
 * pairs. Fragment i starts at (i-1) s; mdat bodies grow by 40 B per fragment
 * (`mdatPadBytes` pads every mdat so tests can build objects that overrun the
 * bounded index head without changing the fragment grid).
 */
export function buildSidxLessFmp4(
  count: number,
  options: { firstSampleNonSync?: boolean; mdatPadBytes?: number; viaTfhdDefault?: boolean } = {},
): Uint8Array {
  const { mdatPadBytes = 0 } = options;
  // moovFixture/moofFixture are already complete boxes (header + body); only
  // ftyp and the (possibly large, padded) mdat bodies need box headers here.
  const parts: Uint8Array[] = [
    new Uint8Array([...u32be(8 + 8), ...ascii4('ftyp'), ...ascii4('isom'), ...u32be(0)]),
    new Uint8Array(moovFixture()),
  ];
  for (let i = 1; i <= count; i += 1) {
    parts.push(new Uint8Array(moofFixture((i - 1) * 30_000, trafFixture((i - 1) * 30_000, options))));
    parts.push(boxU8('mdat', new Uint8Array(i * 40 + mdatPadBytes)));
  }
  const total = parts.reduce((sum, part) => sum + part.byteLength, 0);
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    bytes.set(part, offset);
    offset += part.byteLength;
  }
  return bytes;
}

/** One `moof` wrapping a pre-built `traf` (the tfdt lives inside the traf). */
export function moofFixture(_baseMediaDecodeTime: number, traf: number[]): number[] {
  const mfhd = box('mfhd', [0, 0, 0, 0, ...u32be(1)]);
  return box('moof', [...mfhd, ...traf]);
}

/** Minimal single-video-track `moov`: mvhd (1000, 10 s) + trak(mdhd 30000, hdlr vide). */
export function moovFixture(): number[] {
  const mvhd = box('mvhd', [0, 0, 0, 0, ...u32be(0, 0), ...u32be(1000, 10_000)]);
  const tkhd = box('tkhd', [0, 0, 0, 3, ...u32be(0, 0, 1)]);
  const mdhd = box('mdhd', [0, 0, 0, 0, ...u32be(0, 0, 30_000)]);
  const hdlr = box('hdlr', [0, 0, 0, 0, ...u32be(0), ...ascii4('vide')]);
  const mdia = box('mdia', [...mdhd, ...hdlr]);
  const trak = box('trak', [...tkhd, ...mdia]);
  return box('moov', [...mvhd, ...trak]);
}

/** 32-bit sample_flags for a non-sync (predicted) sample. */
export function nonSyncSampleFlags(): number {
  // sample_is_non_sync_sample = 1 (bit 16).
  return 0x00010000;
}

/**
 * Walks top-level ISO-BMFF boxes. Independent of the production parser so
 * unit tests can derive expected byte ranges from the crafted bytes.
 */
export function scanTopLevel(bytes: Uint8Array): TestBoxLayout[] {
  const boxes: TestBoxLayout[] = [];
  let offset = 0;
  while (offset + 8 <= bytes.byteLength) {
    const size = u32At(bytes, offset);
    if (size < 8) break;
    boxes.push({ end: offset + size, start: offset, type: fourCcAt(bytes, offset + 4) });
    if (offset + size > bytes.byteLength) break;
    offset += size;
  }
  return boxes;
}

/** 32-bit sample_flags for an independent (sync) H.264 sample. */
export function syncSampleFlags(): number {
  // sample_depends_on = 2 (I picture), sample_is_non_sync_sample = 0.
  return 0x02000000;
}

/**
 * Minimal `traf` for one fragment. `viaTfhdDefault` carries the first-sample
 * sync verdict in `tfhd`'s default-sample-flags instead of `trun`'s
 * first-sample-flags, exercising both sync-evidence paths.
 */
export function trafFixture(
  baseMediaDecodeTime: number,
  options: { firstSampleNonSync?: boolean; viaTfhdDefault?: boolean } = {},
): number[] {
  const { firstSampleNonSync = false, viaTfhdDefault = false } = options;
  const sampleFlags = firstSampleNonSync ? nonSyncSampleFlags() : syncSampleFlags();
  // tfhd flags: 0x020000 (default-base-is-moof); +0x20 when carrying default-sample-flags.
  const tfhdFlags = 0x020000 | (viaTfhdDefault ? 0x000020 : 0);
  const tfhd = box('tfhd', [0, (tfhdFlags >>> 16) & 255, (tfhdFlags >>> 8) & 255, tfhdFlags & 255, ...u32be(1), ...(viaTfhdDefault ? u32be(sampleFlags) : [])]);
  const tfdt = box('tfdt', [0, 0, 0, 0, ...u32be(baseMediaDecodeTime)]);
  const trun = viaTfhdDefault
    ? box('trun', [0, 0, 0, 0, ...u32be(1)])
    : box('trun', [0, 0, 0, 4, ...u32be(1), ...u32be(sampleFlags)]);
  return box('traf', [...tfhd, ...tfdt, ...trun]);
}

/** Big-endian u16s. */
export function u16be(...values: number[]): number[] {
  const out: number[] = [];
  for (const value of values) out.push((value >>> 8) & 255, value & 255);
  return out;
}

/** Big-endian u32s. */
export function u32be(...values: number[]): number[] {
  const out: number[] = [];
  for (const value of values) {
    out.push((value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255);
  }
  return out;
}

/** One `size(4) type(4) body` ISO-BMFF box as a flat Uint8Array (padding bodies avoid arg-spread). */
function boxU8(type: string, body: Uint8Array): Uint8Array {
  const size = body.byteLength + 8;
  const out = new Uint8Array(size);
  out[0] = (size >>> 24) & 255;
  out[1] = (size >>> 16) & 255;
  out[2] = (size >>> 8) & 255;
  out[3] = size & 255;
  out.set(ascii4(type), 4);
  out.set(body, 8);
  return out;
}

function fourCcAt(bytes: Uint8Array, offset: number): string {
  return String.fromCharCode(bytes[offset] ?? 0, bytes[offset + 1] ?? 0, bytes[offset + 2] ?? 0, bytes[offset + 3] ?? 0);
}

function u32At(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] * 2 ** 24) + (bytes[offset + 1] << 16) + (bytes[offset + 2] << 8) + (bytes[offset + 3] ?? 0);
}
