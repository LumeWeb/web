/**
 * TDD contract for the dependency-neutral EBML primitives.
 *
 * Covers the byte-exact vint decoding the WebM probe is built on, with
 * special attention to the SEGMENT SIZE case real muxers produce: ffmpeg's
 * WebM muxer writes the Segment element's size as an EIGHT-BYTE size vint
 * (`01 00 00 00 00 01 b4 6c` for a ~111 KB file). That value must decode
 * exactly and must NOT be mistaken for the all-ones "unknown size" marker
 * (`01 ff ff ff ff ff ff ff`) that live/MSE Segments use. Naive 32-bit
 * `<<`-based accumulation corrupts both (a real 8-byte size overruns
 * `Number.MAX_SAFE_INTEGER` and `1 << 56` wraps to `1 << 24`).
 */
import { describe, expect, it } from 'vitest';
import { EBML_ELEMENT_ID, readAscii, readFloat64, readUint, readVint } from '../../container/webm/ebml.ts';
import { ebmlWalkMode, readEbmlElements, walkChildren } from '../../container/webm/ebml-reader.ts';
import { buildWebm } from '../fixtures/webm-fixture.ts';

/** ffmpeg-style 8-byte Segment size value for a ~111 KB file (from the real fixture). */
const FFMPEG_TWO_BYTE = [0x01, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00] as const;

describe('readVint (size mode)', () => {
  it('decodes a one-byte size vint', () => {
    const vint = readVint(new Uint8Array([0x9f]), 0, 'size');
    expect(vint).toEqual({ length: 1, unknown: false, value: 0x1f });
  });

  it('decodes a multi-byte size vint including an 8-byte ffmpeg-style value', () => {
    // bytes: 01 00 00 00 00 01 B4 6C -> value 0x0000000001B46C = 111724
    const bytes = new Uint8Array([0x01, 0x00, 0x00, 0x00, 0x00, 0x01, 0xb4, 0x6c]);
    const vint = readVint(bytes, 0, 'size');
    expect(vint).toEqual({ length: 8, unknown: false, value: 111724 });
  });

  it('does not mistake a real 8-byte value for the unknown-size marker', () => {
    const bytes = new Uint8Array([...FFMPEG_TWO_BYTE]);
    const vint = readVint(bytes, 0, 'size');
    expect(vint?.unknown).toBe(false);
    expect(vint?.value).toBe(0x010000);
  });

  it('detects the all-ones unknown-size marker at every supported length', () => {
    expect(readVint(new Uint8Array([0xff]), 0, 'size')).toEqual({ length: 1, unknown: true, value: 0 });
    expect(readVint(new Uint8Array([0x7f, 0xff]), 0, 'size')).toEqual({ length: 2, unknown: true, value: 0 });
    expect(readVint(new Uint8Array([0x1f, 0xff, 0xff, 0xff]), 0, 'size')).toEqual({ length: 4, unknown: true, value: 0 });
    expect(readVint(new Uint8Array([0x01, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]), 0, 'size')).toEqual({
      length: 8,
      unknown: true,
      value: 0,
    });
  });

  it('returns null for an empty/garbage vint start', () => {
    expect(readVint(new Uint8Array(), 0, 'size')).toBeNull();
    expect(readVint(new Uint8Array([0x00]), 0, 'size')).toBeNull();
  });
});

describe('readVint (id mode)', () => {
  it('keeps the marker bits in the returned value (EBML id convention)', () => {
    const bytes = new Uint8Array([0x18, 0x53, 0x80, 0x67]);
    const vint = readVint(bytes, 0, 'id');
    expect(vint).toEqual({ length: 4, unknown: false, value: EBML_ELEMENT_ID.segment });
  });
});

describe('readEbmlElements over a ffmpeg-style Segment size', () => {
  it('walks a Segment with an 8-byte size vint to an exact data end', () => {
    const body = [0x00, 0x01, 0x02, 0x03, 0x04];
    // Segment id 18 53 80 67, 8-byte size vint 01 00 00 00 00 00 00 05 (value 5)
    const segment = [0x18, 0x53, 0x80, 0x67, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x05, ...body];
    const bytes = new Uint8Array(segment);
    const elements = readEbmlElements(bytes, 0, bytes.byteLength, ebmlWalkMode.strict);
    expect(elements).toHaveLength(1);
    expect(elements[0].id).toBe(EBML_ELEMENT_ID.segment);
    expect(elements[0].offset).toBe(0);
    expect(elements[0].dataOffset).toBe(12);
    expect(elements[0].dataEnd).toBe(17);
    expect(elements[0].sizeUnknown).toBe(false);
  });

  it('swallows the rest of the bound for an unknown-size Segment (live convention)', () => {
    const body = [0x00, 0x01, 0x02, 0x03, 0x04];
    const segment = [0x18, 0x53, 0x80, 0x67, 0x01, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, ...body];
    const bytes = new Uint8Array(segment);
    const elements = readEbmlElements(bytes, 0, bytes.byteLength, ebmlWalkMode.strict);
    expect(elements).toHaveLength(1);
    expect(elements[0].sizeUnknown).toBe(true);
    expect(elements[0].dataEnd).toBe(bytes.byteLength);
  });
});

describe('integer / float / ascii readers', () => {
  it('reads big-endian unsigned integers and rejects unsafe reads', () => {
    expect(readUint(new Uint8Array([0x01, 0x00]), 0, 2)).toBe(256);
    expect(readUint(new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff]), 0, 6)).toBe(0xffffffffffff);
    expect(readUint(new Uint8Array([0x00]), 0, 9)).toBeNull();
    expect(readUint(new Uint8Array(), 0, 0)).toBeNull();
  });

  it('reads IEEE-754 binary64 and ASCII strings', () => {
    const buffer = new ArrayBuffer(8);
    new DataView(buffer).setFloat64(0, 3.0, false);
    expect(readFloat64(new Uint8Array(buffer), 0, 8)).toBe(3.0);
    expect(readFloat64(new Uint8Array(buffer), 0, 4)).toBeNull();
    expect(readAscii(new Uint8Array([0x77, 0x65, 0x62, 0x6d]), 0, 4)).toBe('webm');
  });
});

describe('probe integration over the crafted fixture still parses', () => {
  it('walks a crafted 3-cluster WebM via the reader', () => {
    const bytes = buildWebm(3);
    const elements = readEbmlElements(bytes, 0, bytes.byteLength, ebmlWalkMode.strict);
    const ids = elements.map((element) => element.id);
    expect(ids[0]).toBe(EBML_ELEMENT_ID.ebml);
    expect(ids[1]).toBe(EBML_ELEMENT_ID.segment);
    const segment = elements[1];
    const children = walkChildren(bytes, segment, ebmlWalkMode.strict);
    expect(children.find((child) => child.id === EBML_ELEMENT_ID.cluster)).toBeTruthy();
  });
});
