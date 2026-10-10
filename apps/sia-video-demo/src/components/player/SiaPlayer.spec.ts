import { describe, expect, it } from "vitest";
import { videoFeatures } from "@videojs/react";
import { siaFeatures, siaProgressFeature } from "@lumeweb/sia-video-source";
import { siaPlayerFeatures } from "./SiaPlayer";

/**
 * The Sia shell's runtime `Player`/`VideoSkin` render a DOM container, so this
 * node unit-test only pins the pure feature-composition contract: the exact
 * ordered feature set that `createPlayer` receives at module scope. Identity
 * (not just shape) is asserted because the player store is built from these
 * exact feature objects, so a reordered or replaced feature silently changes
 * public player state — and the composition must stay module-stable.
 */
describe("siaPlayerFeatures (Video.js v10 Sia feature composition)", () => {
  it("puts the packaged Video.js v10 video features first, in order", () => {
    const features = siaPlayerFeatures();
    videoFeatures.forEach((feature, index) => {
      expect(features[index]).toBe(feature);
    });
  });

  it("appends the Sia triple in recovery -> load -> source-info order", () => {
    const features = siaPlayerFeatures();
    siaFeatures.forEach((feature, index) => {
      expect(features[videoFeatures.length + index]).toBe(feature);
    });
  });

  it("ends with the opt-in reader-progress feature after the Sia triple", () => {
    const features = siaPlayerFeatures();
    const length = videoFeatures.length + siaFeatures.length + 1;
    expect(features).toHaveLength(length);
    expect(features[length - 1]).toBe(siaProgressFeature);
  });

  it("composes the full tuple: video, Sia, progress — nothing else, in order", () => {
    const features = siaPlayerFeatures();
    expect(features).toEqual([
      ...videoFeatures,
      ...siaFeatures,
      siaProgressFeature,
    ]);
  });
});
