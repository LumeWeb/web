import { describe, expect, it } from 'vitest';
import { sniffContainer } from '../container-probe.ts';
import { containerKind } from '../media/types.ts';

function box(type: string, payload: Uint8Array = new Uint8Array(8)): Uint8Array {
  const bytes = new Uint8Array(8 + payload.byteLength);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, bytes.byteLength);
  for (let i = 0; i < 4; i++) bytes[4 + i] = type.charCodeAt(i);
  bytes.set(payload, 8);
  return bytes;
}

function concat(...parts: Uint8Array[]): Uint8Array {
  const bytes = new Uint8Array(parts.reduce((total, part) => total + part.byteLength, 0));
  let offset = 0;
  for (const part of parts) {
    bytes.set(part, offset);
    offset += part.byteLength;
  }
  return bytes;
}

function ebml(doctype: 'matroska' | 'webm'): Uint8Array {
  const doctypeBytes = Array.from(doctype, (char) => char.charCodeAt(0));
  return new Uint8Array([
    0x1a, 0x45, 0xdf, 0xa3, // EBML master element signature
    0x01, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, // (unrealistic long size, ignored by the sniff)
    0x42, 0x82, 0x88, // DocType string element
    ...doctypeBytes,
  ]);
}

function ftyp(brand = 'isom'): Uint8Array {
  const payload = new Uint8Array(16);
  for (let i = 0; i < 4; i++) payload[i] = brand.charCodeAt(i);
  payload.set([0, 0, 2, 0], 4);
  for (let i = 0; i < 4; i++) payload[8 + i] = 'isom'.charCodeAt(i);
  for (let i = 0; i < 4; i++) payload[12 + i] = 'avc1'.charCodeAt(i);
  return box('ftyp', payload);
}

/**
 * Indexed finite-VOD fMP4: ftyp + moov + a large top-level `sidx` whose
 * declared size carries the first `moof` past byte 4096, then `moof`+`mdat`.
 * Layout: ftyp(24) moov(40) sidx(4196 @ 64 → ends 4260) moof(16) mdat(16).
 */
function indexedFmp4Bytes(): Uint8Array {
  const ftypBox = ftyp();
  const moovBox = box('moov', new Uint8Array(32));
  const sidxBox = box('sidx', new Uint8Array(4188));
  return concat(ftypBox, moovBox, sidxBox, box('moof'), box('mdat'));
}

function tsPackets(count: number): Uint8Array {
  const bytes = new Uint8Array(188 * count);
  for (let i = 0; i < count; i++) bytes[i * 188] = 0x47;
  return bytes;
}

describe('sniffContainer', () => {
  it('detects fragmented MP4 (ftyp followed by moof)', () => {
    const bytes = concat(ftyp(), box('moof'), box('mdat'));
    expect(sniffContainer(bytes)).toBe(containerKind.fmp4);
  });

  it('keeps calling a file fragmented when moof comes after moov', () => {
    const bytes = concat(ftyp(), box('moov'), box('moof'), box('mdat'));
    expect(sniffContainer(bytes)).toBe(containerKind.fmp4);
  });

  it('detects progressive MP4 (ftyp + moov before media data)', () => {
    const bytes = concat(ftyp(), box('moov'), box('mdat'));
    expect(sniffContainer(bytes)).toBe(containerKind.mp4);
  });

  it('detects MPEG-TS by the 0x47 sync byte at packet strides', () => {
    const bytes = tsPackets(4);
    expect(sniffContainer(bytes)).toBe(containerKind.ts);
  });

  it('rejects a coincidental 0x47 that does not stride like TS packets', () => {
    const bytes = new Uint8Array(188 * 2);
    bytes[0] = 0x47; // only the first packet is synced
    expect(sniffContainer(bytes)).toBe(containerKind.unknown);
  });

  it('detects WebM and Matroska from the EBML signature', () => {
    expect(sniffContainer(ebml('webm'))).toBe(containerKind.webm);
    expect(sniffContainer(ebml('matroska'))).toBe(containerKind.mkv);
  });

  it('classifies short and text input as unknown', () => {
    expect(sniffContainer(new Uint8Array(4))).toBe(containerKind.unknown);
    expect(sniffContainer(new TextEncoder().encode('<html>definitely not video</html>'))).toBe(containerKind.unknown);
  });

  it('does not misread a truncated top-level sidx as progressive MP4', () => {
    const full = indexedFmp4Bytes();
    // The 4 KiB head probe cuts inside the top-level `sidx` (its declared size
    // runs past byte 4096 and the first moof lies beyond the probe): the walk
    // cannot decide between progressive and fragmented, so it must be
    // inconclusive — never a definitive "progressive MP4" verdict.
    const truncatedHead = full.subarray(0, 4096);
    expect(sniffContainer(truncatedHead)).toBe(containerKind.unknown);
    // Once the head is large enough to reach the moof the same bytes classify
    // as fragmented MP4.
    expect(sniffContainer(full)).toBe(containerKind.fmp4);
  });
});
