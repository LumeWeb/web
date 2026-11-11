/** Synthetic native streams authenticate through managed readers and decode a local MP4. */
import {
  parseSiaShareUrl,
  type SiaNativeStreamService,
} from "@lumeweb/sia-video-source";
import { createMockReader, type ReadPort } from "@lumeweb/sia-testing/client";
import { connection } from "./backend";
import { activeDemoAppKeyHex } from "../../src/stores/auth";
import { demoSettingsStore } from "../../src/stores/authSettings";

declare global {
  interface Window {
    __siaDemoNative?: {
      mode: "available" | "held" | "rejected" | "unavailable";
      preparations: number;
      releasePreparation?: () => void;
      releases: number;
    };
  }
}

function state() {
  return (window.__siaDemoNative ??= {
    mode: "available",
    preparations: 0,
    releases: 0,
  });
}

const service: SiaNativeStreamService<ReadPort> = {
  isAvailable: () => Promise.resolve(state().mode !== "unavailable"),
  prepare() {
    state().preparations++;
    if (state().mode === "held")
      return new Promise<void>((resolve) => {
        state().releasePreparation = resolve;
      });
    return state().mode === "rejected"
      ? Promise.reject(new Error("Synthetic native preparation failed"))
      : Promise.resolve();
  },
  async resolve(src, signal, sourceKind) {
    const auth = demoSettingsStore.getState();
    const kind = sourceKind === "shared" ? "sharing-key" : "app-key";
    const keyHex =
      kind === "sharing-key" ? auth.sharingKeyHex : activeDemoAppKeyHex();
    if (!keyHex) throw new Error("Native fixture credential is missing");
    const reader = createMockReader(connection(auth.indexerUrl, kind), {
      keyHex,
      kind,
    });
    try {
      await reader.object(
        sourceKind === "shared" ? src : parseSiaShareUrl(src).objectKey,
        { signal },
      );
      return reader;
    } catch (error) {
      await reader.close();
      throw error;
    }
  },
  session: (reader) => ({
    url: () =>
      Promise.resolve({
        release() {
          state().releases++;
          void reader.close();
        },
        url: new URL(
          "../../../../libs/sia-video-source/src/__fixtures__/media/browser-decodable-long.mp4",
          import.meta.url,
        ).href,
      }),
  }),
};

export function getDemoNativeStreamService() {
  return service;
}
