// Types for the fixture generator's exported helpers, consumed by its
// regression spec (src/__tests__/fixtures/generator-webm-fixture.spec.ts).
// The generator itself stays plain JavaScript; this declaration keeps the
// spec's dynamic import typed instead of any.

/** Assembles a Cluster of SimpleBlocks and returns its raw bytes plus the parsed element. */
export declare function buildCluster(blocks: Uint8Array[]): {
  bytes: Uint8Array;
  cluster: { dataEnd: number; dataOffset: number; end: number; id: number; start: number };
};

/** Builds one SimpleBlock as a standalone element (id, size, track, timecode, flags, filler). */
export declare function buildSimpleBlock(
  trackNumber: number,
  timecode: number,
  flags: number,
  dataBytes?: number,
): Uint8Array;

/**
 * Keyframe flag of the first SimpleBlock belonging to `trackNumber` inside a
 * Cluster, or null when the cluster carries no such block.
 */
export declare function firstVideoBlockKeyframe(
  bytes: Uint8Array,
  cluster: { dataEnd: number; dataOffset: number },
  trackNumber: null | number,
): boolean | null;

/**
 * Inspects one SimpleBlock and returns its keyframe flag (null for a block of
 * a different track or a truncated header).
 */
export declare function simpleBlockKeyframe(
  bytes: Uint8Array,
  block: { dataEnd: number; dataOffset: number },
  trackNumber: null | number,
): boolean | null;

/** Runs the full structural contract over candidate bytes, problems joined in `reason`. */
export declare function validate(bytes: Uint8Array): { ok: boolean; reason: string; sha: string };
