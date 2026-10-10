// @vitest-environment happy-dom

/**
 * Runtime regression tests for the demo-owned Sia media element: the
 * centralized developer-options toggle must update the LIVE `SiaVideoSource`
 * backend in place (the host's `backend` setter tears down the active
 * backend and restarts the current source on the new one) without React
 * remounting the element or recreating the media instance.
 *
 * The pure unit specs cannot see instance lifetime, so this file mounts the
 * real `SiaMediaElement` inside a real `createPlayer` context (the same Sia
 * feature tuple the `SiaPlayer` shell composes) and drives the real
 * `useDeveloperOptionsStore` through `resolvePlaybackBackend`, exactly the
 * wiring `SiaVideoMount` uses. A `useMedia()` probe in the same player
 * context captures the live instance (the media element registers itself
 * there on mount); the DOM `video` node's identity proves there is no
 * remount.
 *
 * The host's `backend` setter and `reloadConfiguration` are wrapped on the
 * prototype to count in-place runs; the wrappers delegate to the real
 * implementation and are restored after each test. happy-dom has no module
 * worker, so a minimal `Worker` stub absorbs the media-worker spawn the
 * `auto` policy selects (the spawn outcome is irrelevant to these
 * contracts). These are DOM runtime tests, so this file opts into happy-dom
 * (the suite default is node) and uses `react-dom/client` directly because
 * this repo's React build does not expose `React.act` (no
 * @testing-library/react needed).
 */

import {
  createSiaNativeStreamProvider,
  SIA_PLAYBACK_BACKENDS,
  siaFeatures,
  type SiaPlaybackBackend,
  siaProgressFeature,
  SiaVideoSource,
} from "@lumeweb/sia-video-source";
import { createPlayer, useMedia, videoFeatures } from "@videojs/react";
import { createElement, type ReactElement, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { useStore } from "zustand";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { APP_META } from "../../lib/constants";
import { eventLogLogger } from "../../lib/eventLogLogger";
import { resolvePlaybackBackend } from "../../lib/playbackBackend";
import { createDemoNativeStreamService } from "../../lib/streamService";
import { useDeveloperOptionsStore } from "../../stores/developerOptions";
import { SiaMediaElement } from "./SiaMediaElement";

/** A 64-hex object key the media element can load as its transport src. */
const OBJECT_KEY =
  "a1b2c3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff01";

/** The same player shell the app's `SiaPlayer` composes (same feature tuple). */
const { Player } = createPlayer({
  displayName: "SiaMediaElementRuntimePlayer",
  features: [...videoFeatures, ...siaFeatures, siaProgressFeature],
});

/**
 * The demo native stream provider, built from the real demo stream service
 * (module-stable identity, like the one `SiaVideoMount` builds). Its
 * `isAvailable` reads the centralized developer-options store, which the
 * tests reset to "no stream base URL", so the `auto` policy deterministically
 * picks the media worker.
 */
const testNativeStreamProvider = createSiaNativeStreamProvider(
  createDemoNativeStreamService(),
);

/** happy-dom has no module worker; the stub absorbs the spawn and messages. */
class StubWorker extends EventTarget {
  postMessage(_message: unknown): void {
    // Absorbed: no real module worker in the test environment.
  }
  terminate(): void {
    // Absorbed: nothing to terminate.
  }
}

const previousWorker = globalThis.Worker;

/**
 * The real `SiaMediaElement` driven by the real developer-options store
 * through `resolvePlaybackBackend`, the exact `SiaVideoMount` derivation.
 */
function BackendHost({
  mediaRef,
  reloadKey,
}: {
  mediaRef: { current: null | SiaVideoSource };
  reloadKey: string;
}): ReactElement {
  const disableNativePlayback = useStore(
    useDeveloperOptionsStore,
    (s) => s.disableNativePlayback,
  );
  const backend = resolvePlaybackBackend({ disableNativePlayback });
  return createElement(
    Player,
    null,
    createElement(SiaMediaElement, {
      backend,
      logger: eventLogLogger,
      nativeStreamProvider: testNativeStreamProvider,
      preload: "auto",
      reloadKey,
      sia: { app: APP_META, indexerUrl: "https://indexer.test" },
      src: OBJECT_KEY,
    }),
    createElement(CaptureMedia, { mediaRef }),
  );
}

/** Captures the live media instance the media element registers in the store. */
function CaptureMedia({
  mediaRef,
}: {
  mediaRef: { current: null | SiaVideoSource };
}) {
  const media = useMedia();
  useEffect(() => {
    mediaRef.current = media as unknown as null | SiaVideoSource;
  }, [media, mediaRef]);
  return null;
}

const backendDescriptor = Object.getOwnPropertyDescriptor(
  SiaVideoSource.prototype,
  "backend",
) as {
  get: () => SiaPlaybackBackend;
  set: (this: SiaVideoSource, value: SiaPlaybackBackend) => void;
};
const originalBackendGet = (instance: SiaVideoSource) =>
  backendDescriptor.get.call(instance);
const originalBackendSet = (
  instance: SiaVideoSource,
  value: SiaPlaybackBackend,
) => {
  backendDescriptor.set.call(instance, value);
};
const reloadDescriptor = Object.getOwnPropertyDescriptor(
  SiaVideoSource.prototype,
  "reloadConfiguration",
) as { value: (this: SiaVideoSource) => void };
const originalReloadConfiguration = (instance: SiaVideoSource) =>
  reloadDescriptor.value.call(instance);

let backendSetterCalls = 0;
let reloadCalls = 0;
let container: HTMLDivElement | null = null;
let root: null | ReturnType<typeof createRoot> = null;
const mediaRef = { current: null as null | SiaVideoSource };

beforeEach(() => {
  // A fresh, deterministic options state for every test.
  useDeveloperOptionsStore.setState({
    disableNativePlayback: false,
    nativeStreamBaseUrl: "",
  });
  backendSetterCalls = 0;
  reloadCalls = 0;
  mediaRef.current = null;
  // Count in-place backend setter runs and reload runs; both delegate to the
  // real implementation.
  Object.defineProperty(SiaVideoSource.prototype, "backend", {
    configurable: true,
    get(this: SiaVideoSource) {
      return originalBackendGet(this);
    },
    set(this: SiaVideoSource, value: SiaPlaybackBackend) {
      backendSetterCalls += 1;
      originalBackendSet(this, value);
    },
  });
  SiaVideoSource.prototype.reloadConfiguration = function (
    this: SiaVideoSource,
  ) {
    reloadCalls += 1;
    return originalReloadConfiguration(this);
  };
  globalThis.Worker = StubWorker as unknown as typeof Worker;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  root?.unmount();
  container?.remove();
  container = null;
  root = null;
  Object.defineProperty(SiaVideoSource.prototype, "backend", backendDescriptor);
  SiaVideoSource.prototype.reloadConfiguration = reloadDescriptor.value;
  globalThis.Worker = previousWorker;
});

/**
 * Yields to the scheduler so React's passive effects (and the store renders
 * they schedule) flush. A real macrotask delay is required: react-dom's
 * scheduler falls back to `setTimeout(…, 0)` in happy-dom, so a same-tick
 * microtask/macrotask race would assert before the element's effects run.
 */
async function flush(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 25));
}

describe("SiaMediaElement runtime (developer-options backend toggle)", () => {
  it("switches the live media backend in place when disableNativePlayback toggles", async () => {
    root!.render(createElement(BackendHost, { mediaRef, reloadKey: "A" }));
    await flush();

    const media = mediaRef.current;
    const video = container!.querySelector("video");
    expect(media).not.toBeNull();
    expect(video).not.toBeNull();
    expect(media!.backend).toBe(SIA_PLAYBACK_BACKENDS.AUTO);
    // A fresh mount seeds the backend in the constructor; the per-render
    // equality guard keeps the setter out of the mount path.
    expect(backendSetterCalls).toBe(0);

    // The developer flips the centralized option; the store subscription
    // re-renders the element with the resolved `media-worker` backend.
    useDeveloperOptionsStore.getState().setDisableNativePlayback(true);
    await flush();

    expect(mediaRef.current).toBe(media); // same live instance, not recreated
    expect(container!.querySelector("video")).toBe(video); // no remount
    expect(media!.backend).toBe(SIA_PLAYBACK_BACKENDS.MEDIA_WORKER);
    expect(backendSetterCalls).toBe(1); // one in-place setter run
    expect(reloadCalls).toBe(0); // a backend switch is not a reload

    // Flipping back returns the same live instance to `auto`.
    useDeveloperOptionsStore.getState().setDisableNativePlayback(false);
    await flush();

    expect(mediaRef.current).toBe(media);
    expect(container!.querySelector("video")).toBe(video);
    expect(media!.backend).toBe(SIA_PLAYBACK_BACKENDS.AUTO);
    expect(backendSetterCalls).toBe(2);
    expect(reloadCalls).toBe(0);
  });

  it("seeds a worker-only backend at mount without a backend setter run", async () => {
    // Native disabled BEFORE the first mount: the constructor applies the
    // mount-time policy as plain field setup, so no setter side effects
    // (teardown/restart) fire for a fresh mount.
    useDeveloperOptionsStore.getState().setDisableNativePlayback(true);
    root!.render(createElement(BackendHost, { mediaRef, reloadKey: "A" }));
    await flush();

    expect(mediaRef.current).not.toBeNull();
    expect(mediaRef.current!.backend).toBe(SIA_PLAYBACK_BACKENDS.MEDIA_WORKER);
    expect(backendSetterCalls).toBe(0);
  });

  it("runs exactly one in-place reloadConfiguration when the reload key changes", async () => {
    root!.render(createElement(BackendHost, { mediaRef, reloadKey: "A" }));
    await flush();

    const media = mediaRef.current;
    const video = container!.querySelector("video");
    expect(reloadCalls).toBe(0); // the first run records the baseline only

    root!.render(createElement(BackendHost, { mediaRef, reloadKey: "B" }));
    await flush();

    expect(mediaRef.current).toBe(media); // same live instance, not recreated
    expect(container!.querySelector("video")).toBe(video); // no remount
    expect(reloadCalls).toBe(1); // one in-place reload for the new identity
  });
});
