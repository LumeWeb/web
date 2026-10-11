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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDeveloperOptionsStore } from "../../stores/developerOptions";
import type { PublishSelectedSource } from "./SelectedSource";

const preparation = vi.hoisted(() => {
  let rejectPreparation: (reason?: unknown) => void = () => {};
  let resolvePreparation: (value: boolean) => void = () => {};
  let promise = Promise.resolve(true);
  let prepareCalls = 0;
  let available = true;

  return {
    get available() {
      return available;
    },
    get prepareCalls() {
      return prepareCalls;
    },
    get promise() {
      return promise;
    },
    reject(reason: unknown) {
      available = false;
      rejectPreparation(reason);
    },
    reset() {
      available = true;
      prepareCalls = 0;
      promise = new Promise<boolean>((resolve, reject) => {
        resolvePreparation = resolve;
        rejectPreparation = reject;
      });
    },
    resolve() {
      resolvePreparation(true);
    },
    setAvailable(value: boolean) {
      available = value;
    },
    started() {
      prepareCalls += 1;
    },
  };
});

vi.mock("../../lib/streamService", () => ({
  createDemoNativeStreamService: vi.fn(() => ({
    isAvailable: () => Promise.resolve(preparation.available),
    prepare: () => {
      preparation.started();
      return preparation.promise;
    },
    resolve: (src: string) =>
      Promise.resolve({ objectKey: src, shared: false }),
    session: () =>
      Promise.resolve({
        url: () => Promise.resolve({ release: () => {}, url: "blob:test" }),
      }),
  })),
  getDemoNativeStreamService: vi.fn(() => ({
    isAvailable: () => Promise.resolve(preparation.available),
    prepare: () => {
      preparation.started();
      return preparation.promise;
    },
    resolve: (src: string) =>
      Promise.resolve({ objectKey: src, shared: false }),
    session: () =>
      Promise.resolve({
        url: () => Promise.resolve({ release: () => {}, url: "blob:test" }),
      }),
  })),
}));

import { SiaVideoMount } from "./SiaVideoMount";

const OBJECT_KEY =
  "a1b2c3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff01";
const CHANGED_OBJECT_KEY =
  "ffeeddccbbaa99887766554433221100a1b2c3d4e5f60718293a4b5c6d7e8f90";
const selectedSource: PublishSelectedSource = {
  mode: "publish",
  source: {
    fetchForm: `sia://indexer.test/objects/${OBJECT_KEY}/shared`,
    indexerUrl: "https://indexer.test",
    objectKey: OBJECT_KEY,
  },
  supplier: null,
};

const workerMessages: unknown[] = [];
let workerInstances = 0;
let workerTerminations = 0;

class StubWorker extends EventTarget {
  constructor() {
    super();
    workerInstances += 1;
  }

  postMessage(message: unknown): void {
    workerMessages.push(message);
  }

  terminate(): void {
    workerTerminations += 1;
  }
}

function MountWithCapture({
  indexerUrl = "https://indexer.test",
  source = selectedSource,
}: {
  indexerUrl?: string;
  source?: PublishSelectedSource;
}): ReactElement {
  return createElement(SiaVideoMount, {
    autoplayPending: false,
    indexerUrl,
    onAutoplayConsumed: () => {},
    onFacts: () => {},
    onPlayConsumed: () => {},
    onStatus: () => {},
    playRequested: false,
    selectedSource: source,
  });
}

const changedSource: PublishSelectedSource = {
  ...selectedSource,
  source: {
    ...selectedSource.source,
    fetchForm: `sia://indexer.changed/objects/${CHANGED_OBJECT_KEY}/shared`,
    objectKey: CHANGED_OBJECT_KEY,
  },
};

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
  preparation.reset();
  useDeveloperOptionsStore.setState({
    disableNativePlayback: false,
    disableWorkerPlayback: false,
  });
  backendSetterCalls = 0;
  observedMedia = null;
  workerInstances = 0;
  workerTerminations = 0;
  workerMessages.length = 0;
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

afterEach(async () => {
  root?.unmount();
  await flush();
  container?.remove();
  root = null;
  container = null;
  Object.defineProperty(SiaVideoSource.prototype, "backend", backendDescriptor);
  globalThis.Worker = previousWorker;
});

async function flush(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 25));
}

describe("SiaVideoMount preparation effect", () => {
  it("prepares once and mounts the media element only after preparation settles", async () => {
    root!.render(createElement(MountWithCapture));
    await flush();

    expect(preparation.prepareCalls).toBe(1);
    expect(container!.querySelector("video")).toBeNull();

    preparation.resolve();
    await flush();

    expect(preparation.prepareCalls).toBe(1);
    expect(container!.querySelector("video")).not.toBeNull();
  });

  it("uses the worker backend when preparation rejects and native playback is unavailable", async () => {
    root!.render(createElement(MountWithCapture));
    await flush();

    expect(preparation.prepareCalls).toBe(1);
    expect(container!.querySelector("video")).toBeNull();

    preparation.reject(new Error("native preparation unavailable"));
    await flush();

    expect(preparation.prepareCalls).toBe(1);
    expect(observedMedia).not.toBeNull();
    expect(workerInstances).toBe(1);
    expect(workerMessages.length).toBeGreaterThan(0);
    expect(container!.querySelector("video")).not.toBeNull();
  });

  it("keeps preparation pending when source and indexer change before it settles", async () => {
    useDeveloperOptionsStore.getState().setDisableNativePlayback(true);
    root!.render(createElement(MountWithCapture));
    await flush();

    expect(preparation.prepareCalls).toBe(1);
    expect(container!.querySelector("video")).toBeNull();

    root!.render(
      createElement(MountWithCapture, {
        indexerUrl: "https://indexer.changed",
        source: changedSource,
      }),
    );
    await flush();

    expect(preparation.prepareCalls).toBe(1);
    expect(container!.querySelector("video")).toBeNull();

    preparation.resolve();
    await flush();

    expect(preparation.prepareCalls).toBe(1);
    expect(container!.querySelector("video")).not.toBeNull();

    const hellos = workerMessages
      .filter(
        (
          message,
        ): message is { config?: { indexerUrl?: string }; type: string } =>
          typeof message === "object" && message !== null && "type" in message,
      )
      .filter((message) => message.type === "HELLO");
    expect(hellos.at(-1)?.config?.indexerUrl).toBe("https://indexer.changed");
    expect(observedMedia?.src).toBe(changedSource.source.fetchForm);
  });

  it("applies changed indexer configuration through an in-place worker reload", async () => {
    useDeveloperOptionsStore.getState().setDisableNativePlayback(true);
    root!.render(createElement(MountWithCapture));
    preparation.resolve();
    await flush();

    const media = observedMedia;
    const video = container!.querySelector("video");
    const initialHelloCount = workerMessages
      .filter(
        (
          message,
        ): message is { config?: { indexerUrl?: string }; type: string } =>
          typeof message === "object" && message !== null && "type" in message,
      )
      .filter((message) => message.type === "HELLO").length;
    expect(workerInstances).toBe(1);
    expect(initialHelloCount).toBeGreaterThan(0);

    root!.render(
      createElement(MountWithCapture, {
        indexerUrl: "https://indexer.changed",
        source: changedSource,
      }),
    );
    await flush();

    const hellos = workerMessages
      .filter(
        (
          message,
        ): message is { config?: { indexerUrl?: string }; type: string } =>
          typeof message === "object" && message !== null && "type" in message,
      )
      .filter((message) => message.type === "HELLO");
    expect(hellos).toHaveLength(initialHelloCount + 1);
    expect(hellos.at(-1)?.config?.indexerUrl).toBe("https://indexer.changed");
    expect(observedMedia).toBe(media);
    expect(container!.querySelector("video")).toBe(video);
  });

  it("terminates the fallback worker once when rejected preparation unmounts", async () => {
    root!.render(createElement(MountWithCapture));
    await flush();
    preparation.reject(new Error("native preparation unavailable"));
    await flush();

    expect(workerInstances).toBe(1);
    expect(workerTerminations).toBe(0);

    root!.unmount();
    await flush();

    expect(workerTerminations).toBe(1);
    root!.unmount();
    await flush();
    expect(workerTerminations).toBe(1);
  });
});

describe("SiaVideoMount runtime backend toggle", () => {
  it("updates the live wrapper media backend while retaining its identity", async () => {
    root!.render(createElement(MountWithCapture));
    preparation.resolve();
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
