/**
 * Dependency-neutral EBML element walker for the native-WebM path: turns a
 * byte range into an ordered list of `EbmlElement`s with exact byte extents,
 * and walks a master element's children (skipping Void / CRC-32 padding). No
 * external library and no runtime globals.
 *
 * A child whose declared size overruns the scan bound is either clamped
 * (`sniff` mode, used for head-based codec sniffing where the Segment extends
 * past the probe head) or treated as a stop point (`strict` mode, used when
 * the whole object is in hand). An "unknown-size" element (all-ones vint)
 * swallows the rest of its range, exactly how live/MSE WebM Segments work.
 */
import { isSkippedChild, readVint } from './ebml.ts';

/** One walked EBML element with its absolute byte extents. */
export interface EbmlElement {
  /** Absolute end of the element's data (exclusive), clamped to the scan bound. */
  readonly dataEnd: number;
  /** Absolute start of the element's data (just past the id+size header). */
  readonly dataOffset: number;
  /** Byte length of the id + size header. */
  readonly headerLength: number;
  /** Raw (marker-included) element id. */
  readonly id: number;
  /** Absolute start of the element (its id's first byte). */
  readonly offset: number;
  /** True when the size vint was the all-ones "unknown size" marker. */
  readonly sizeUnknown: boolean;
}

/** Walk options: `strict` requires every declared element fit the bound. */
export const ebmlWalkMode = {
  sniff: 'sniff',
  strict: 'strict',
} as const;

export type EbmlWalkMode = (typeof ebmlWalkMode)[keyof typeof ebmlWalkMode];

/** The first non-padding child of `parent` with the given id, or null. */
export function findChild(bytes: Uint8Array, parent: EbmlElement, id: number, mode: EbmlWalkMode = ebmlWalkMode.strict): EbmlElement | null {
  return walkChildren(bytes, parent, mode).find((element) => element.id === id) ?? null;
}

/** Every non-padding child of `parent` with the given id. */
export function findChildren(bytes: Uint8Array, parent: EbmlElement, id: number, mode: EbmlWalkMode = ebmlWalkMode.strict): EbmlElement[] {
  return walkChildren(bytes, parent, mode).filter((element) => element.id === id);
}

/**
 * Walks the sibling elements in `[start, end)` of `bytes`. In `strict` mode a
 * truncated/oversized element stops the walk; in `sniff` mode it is recorded
 * clamped to the bound (a head probe that ends mid-Segment still yields the
 * leading Info/Tracks).
 */
export function readEbmlElements(
  bytes: Uint8Array,
  start: number,
  end: number,
  mode: EbmlWalkMode = ebmlWalkMode.strict,
): EbmlElement[] {
  const out: EbmlElement[] = [];
  let offset = start;
  while (offset + 1 < end) {
    const idVint = readVint(bytes, offset, 'id');
    if (idVint === null) break;
    const sizeVint = readVint(bytes, offset + idVint.length, 'size');
    if (sizeVint === null) break;
    const headerLength = idVint.length + sizeVint.length;
    const dataOffset = offset + headerLength;
    if (sizeVint.unknown) {
      // Unknown size: the element's data runs to the end of the scan bound.
      out.push({ dataEnd: end, dataOffset, headerLength, id: idVint.value, offset, sizeUnknown: true });
      break;
    }
    const dataEnd = dataOffset + sizeVint.value;
    if (dataEnd > end) {
      if (mode === ebmlWalkMode.sniff) {
        out.push({ dataEnd: end, dataOffset, headerLength, id: idVint.value, offset, sizeUnknown: false });
      }
      break;
    }
    out.push({ dataEnd, dataOffset, headerLength, id: idVint.value, offset, sizeUnknown: false });
    offset = dataEnd;
  }
  return out;
}

/** The immediate children of a master element, skipping Void/CRC-32 padding. */
export function walkChildren(bytes: Uint8Array, parent: EbmlElement, mode: EbmlWalkMode = ebmlWalkMode.strict): EbmlElement[] {
  return readEbmlElements(bytes, parent.dataOffset, parent.dataEnd, mode).filter((element) => !isSkippedChild(element.id));
}
