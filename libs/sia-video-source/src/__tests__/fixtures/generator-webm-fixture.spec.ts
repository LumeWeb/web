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
