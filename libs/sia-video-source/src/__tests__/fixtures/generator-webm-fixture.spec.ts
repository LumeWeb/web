import { describe, expect, it } from "vitest";

// `typeof process` guards the browser run, where the global is undefined and
// `process.env` would throw a ReferenceError at collection time.
const IS_NODE = typeof process !== "undefined" && process.env?.SIA_TEST_ENV === "node";

// Regression spec for the fixture generator's cluster reader: like the
// production reader in webm-probe.ts (`firstBlockKeyframe`/`simpleBlockKeyframe`),
// the keyframe evidence must come from the VIDEO track's SimpleBlock, never
// from the first block of any track — an audio block with the 0x80 bit set
// must not vouch for a cluster's video random-access start. The generator is
// a node script (node:fs imports), so it is only loaded under the node
// suite; the dynamic import keeps it out of the browser bundle.
describe.skipIf(!IS_NODE)("browser-decodable webm generator: video-track keyframe reader", () => {
  it("gives no keyframe evidence for an audio-only cluster even when the audio block has the 0x80 bit set", async () => {
    const { buildCluster, buildSimpleBlock, firstVideoBlockKeyframe } = await import(
      /* @vite-ignore */ "../../__fixtures__/media/generate-browser-decodable-webm-fixture.mjs"
    );
    const { bytes, cluster } = buildCluster([
      buildSimpleBlock(2, 9, 0x80),
      buildSimpleBlock(2, 13, 0x00),
    ]);
    expect(firstVideoBlockKeyframe(bytes, cluster, 1)).toBeNull();
  });

  it("reports the video track's flag even when an audio block sits first", async () => {
    const { buildCluster, buildSimpleBlock, firstVideoBlockKeyframe } = await import(
      /* @vite-ignore */ "../../__fixtures__/media/generate-browser-decodable-webm-fixture.mjs"
    );
    const { bytes, cluster } = buildCluster([
      buildSimpleBlock(2, 11, 0x00),
      buildSimpleBlock(1, 7, 0x80),
    ]);
    expect(firstVideoBlockKeyframe(bytes, cluster, 1)).toBe(true);
  });

  it("returns the first video block's flag when the cluster starts on one", async () => {
    const { buildCluster, buildSimpleBlock, firstVideoBlockKeyframe } = await import(
      /* @vite-ignore */ "../../__fixtures__/media/generate-browser-decodable-webm-fixture.mjs"
    );
    const keyframed = buildCluster([buildSimpleBlock(1, 0, 0x80), buildSimpleBlock(2, 12, 0x00)]);
    const interframe = buildCluster([buildSimpleBlock(1, 0, 0x00), buildSimpleBlock(2, 12, 0x00)]);
    expect(firstVideoBlockKeyframe(keyframed.bytes, keyframed.cluster, 1)).toBe(true);
    expect(firstVideoBlockKeyframe(interframe.bytes, interframe.cluster, 1)).toBe(false);
  });

  it("returns null for a cluster without any SimpleBlock", async () => {
    const { buildCluster, firstVideoBlockKeyframe } = await import(
      /* @vite-ignore */ "../../__fixtures__/media/generate-browser-decodable-webm-fixture.mjs"
    );
    const { bytes, cluster } = buildCluster([]);
    expect(firstVideoBlockKeyframe(bytes, cluster, 1)).toBeNull();
  });
});

const ELEMENT_IDS = {
  codecId: [0x86],
  cueClusterPosition: [0xf1],
  cuePoint: [0xbb],
  cues: [0x1c, 0x53, 0xbb, 0x6b],
  cueTrackPositions: [0xb7],
  docType: [0x42, 0x82],
  ebml: [0x1a, 0x45, 0xdf, 0xa3],
  segment: [0x18, 0x53, 0x80, 0x67],
  trackEntry: [0xae],
  trackNumber: [0xd7],
  trackType: [0x83],
};

function cuesWithClusterPosition(position: number): Uint8Array {
  return withPayload(ELEMENT_IDS.cues, withPayload(
    ELEMENT_IDS.cuePoint,
    withPayload(ELEMENT_IDS.cueTrackPositions, withPayload(ELEMENT_IDS.cueClusterPosition, new Uint8Array([position]))),
  ));
}

function fromText(id: number[], text: string): Uint8Array {
  return withPayload(id, new TextEncoder().encode(text));
}

function segmentWebm(segmentChildren: Uint8Array[]): Uint8Array {
  return new Uint8Array([
    ...withPayload(ELEMENT_IDS.ebml, fromText(ELEMENT_IDS.docType, "webm")),
    ...withPayload(ELEMENT_IDS.segment, new Uint8Array(segmentChildren.flatMap((u8) => Array.from(u8)))),
  ]);
}

function trackEntry(number: number, type: number, codec: string): Uint8Array {
  return withPayload(ELEMENT_IDS.trackEntry, new Uint8Array([
    ...withPayload(ELEMENT_IDS.trackNumber, new Uint8Array([number])),
    ...withPayload(ELEMENT_IDS.trackType, new Uint8Array([type])),
    ...fromText(ELEMENT_IDS.codecId, codec),
  ]));
}

function withPayload(id: number[], payload: Uint8Array): Uint8Array {
  return new Uint8Array([...id, 0x80 | payload.length, ...payload]);
}

describe.skipIf(!IS_NODE)("browser-decodable webm generator: validate() on structurally-incomplete input", () => {
  it("rejects a fixture without a Tracks element instead of crashing", async () => {
    const { buildCluster, validate } = await import(
      /* @vite-ignore */ "../../__fixtures__/media/generate-browser-decodable-webm-fixture.mjs"
    );
    const verdict = validate(segmentWebm([buildCluster([]).bytes, buildCluster([]).bytes, cuesWithClusterPosition(0)]));
    expect(verdict.ok).toBe(false);
    expect(verdict.reason).toContain("Segment missing a Tracks element");
  });

  it("rejects a fixture without a Cues element instead of crashing", async () => {
    const { buildCluster, validate } = await import(
      /* @vite-ignore */ "../../__fixtures__/media/generate-browser-decodable-webm-fixture.mjs"
    );
    const verdict = validate(segmentWebm([
      buildCluster([]).bytes,
      buildCluster([]).bytes,
      trackEntry(1, 1, "V_VP8"),
      trackEntry(2, 2, "A_VORBIS"),
    ]));
    expect(verdict.ok).toBe(false);
    expect(verdict.reason).toContain("Segment missing a Cues element");
  });
});
