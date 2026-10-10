// @vitest-environment happy-dom
// oxlint-disable no-empty-function, no-this-alias

/**
 * The demo runtime path from developer options through SiaVideoMount must
 * update one live SiaVideo media instance without remounting its video node.
 */

import {
  SIA_PLAYBACK_BACKENDS,
  type SiaPlaybackBackend,
  SiaVideoSource,
} from "@lumeweb/sia-video-source";
import { createElement, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useDeveloperOptionsStore } from "../../stores/developerOptions";
import { SiaVideoMount } from "./SiaVideoMount";
import type { PublishSelectedSource } from "./SelectedSource";

const OBJECT_KEY =
  "a1b2c3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff01";
const selectedSource: PublishSelectedSource = {
  mode: "publish",
  source: {
    fetchForm: `sia://indexer.test/objects/${OBJECT_KEY}/shared`,
    indexerUrl: "https://indexer.test",
    objectKey: OBJECT_KEY,
  },
  supplier: null,
};

class StubWorker extends EventTarget {
  postMessage(_message: unknown): void {}
  terminate(): void {}
}

function MountWithCapture(): ReactElement {
  return createElement(SiaVideoMount, {
    autoplayPending: false,
    indexerUrl: "https://indexer.test",
    onAutoplayConsumed: () => {},
    onFacts: () => {},
    onPlayConsumed: () => {},
    onStatus: () => {},
    playRequested: false,
    selectedSource,
  });
}

const backendDescriptor = Object.getOwnPropertyDescriptor(
  SiaVideoSource.prototype,
  "backend",
) as {
  configurable?: boolean;
  get: () => SiaPlaybackBackend;
  set: (this: SiaVideoSource, value: SiaPlaybackBackend) => void;
};
let observedMedia: null | SiaVideoSource = null;
const originalBackendGet = (instance: SiaVideoSource) => {
  observedMedia = instance;
  return backendDescriptor.get.call(instance);
};
const originalBackendSet = (
  instance: SiaVideoSource,
  value: SiaPlaybackBackend,
) => backendDescriptor.set.call(instance, value);

let backendSetterCalls = 0;
let container: HTMLDivElement | null = null;
let root: null | Root = null;
const previousWorker = globalThis.Worker;

beforeEach(() => {
  useDeveloperOptionsStore.setState({
    disableNativePlayback: false,
    nativeStreamBaseUrl: "",
  });
  backendSetterCalls = 0;
  observedMedia = null;
  Object.defineProperty(SiaVideoSource.prototype, "backend", {
    configurable: true,
    get(this: SiaVideoSource) {
      return originalBackendGet(this);
    },
    set(this: SiaVideoSource, value: SiaPlaybackBackend) {
      observedMedia = this;
      backendSetterCalls += 1;
      originalBackendSet(this, value);
    },
  });
  globalThis.Worker = StubWorker as unknown as typeof Worker;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  root?.unmount();
  container?.remove();
  root = null;
  container = null;
  Object.defineProperty(SiaVideoSource.prototype, "backend", backendDescriptor);
  globalThis.Worker = previousWorker;
});

async function flush(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 25));
}

describe("SiaVideoMount runtime backend toggle", () => {
  it("updates the live wrapper media backend while retaining its identity", async () => {
    root!.render(createElement(MountWithCapture));
    await flush();

    const media = observedMedia;
    const video = container!.querySelector("video");
    expect(media).not.toBeNull();
    expect(video).not.toBeNull();
    expect(media!.backend).toBe(SIA_PLAYBACK_BACKENDS.AUTO);
    const initialSetterCalls = backendSetterCalls;
    expect(initialSetterCalls).toBeGreaterThan(0);

    useDeveloperOptionsStore.getState().setDisableNativePlayback(true);
    await flush();

    expect(observedMedia).toBe(media);
    expect(container!.querySelector("video")).toBe(video);
    expect(media!.backend).toBe(SIA_PLAYBACK_BACKENDS.MEDIA_WORKER);
    expect(backendSetterCalls).toBe(initialSetterCalls + 1);
  });
});
