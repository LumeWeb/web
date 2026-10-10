// @vitest-environment happy-dom

/**
 * Runtime regression tests for the PlaybackFactsBridge render↔report loop.
 *
 * The inside-Player bridge used to build a fresh normalized snapshot on every
 * render and wire `useEffect(() => onFacts(snapshot), [onFacts, snapshot])`.
 * Because a fresh object is produced per render, the effect re-fired on EVERY
 * re-render — and because the parent (PlayerScreen) stores the report via
 * `setFacts`, that churn cascaded into an unbounded render/report loop (the
 * "Maximum update depth" runaway). The fix memoizes the snapshot against the
 * stable player-store selector values, so the report fires only on a genuine
 * store change.
 *
 * These component-level tests mount the real bridge inside a real
 * createPlayer `<Player>` (same player feature tuple the SiaPlayer shell uses)
 * and exercise the effect wiring itself — the pure normalizer spec cannot see
 * the loop. The genuine-change test drives the real store path: an
 * inside-Player probe attaches a minimal media host through the player context
 * so the playback feature's `attach` listener is wired, then fires a native
 * `play` event the way a real media element does. These are DOM runtime tests,
 * so this file opts into happy-dom (the suite default is node) and uses
 * `react-dom/client` directly because this repo's React build does not expose
 * `React.act` (no @testing-library/react needed).
 */

import { createElement, useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type { Media } from "@videojs/media";
import {
  createPlayer,
  useContainerAttach,
  useMediaAttach,
  videoFeatures,
} from "@videojs/react";
import { siaFeatures, siaProgressFeature } from "@lumeweb/sia-video-source";
import { describe, expect, it } from "vitest";
import type { PlaybackFacts } from "./PlaybackFactsBridge";
import { PlaybackFactsBridge } from "./PlaybackFactsBridge";

/** A minimal media host the player-store features can attach to. */
type FakeMediaHost = EventTarget & {
  currentSrc: string;
  currentTime: number;
  duration: number;
  ended: boolean;
  load: () => void;
  pause: () => void;
  paused: boolean;
  play: () => Promise<void>;
  readyState: number;
  seeking: boolean;
  src: string;
};

/** The same player feature tuple the app's SiaPlayer shell composes. */
const { Player } = createPlayer({
  displayName: "PlaybackFactsBridgeRuntimePlayer",
  features: [...videoFeatures, ...siaFeatures, siaProgressFeature],
});

/**
 * Inside-Player probe that attaches a media/container host through the player
 * context (the same `setMedia`/`setContainer` path the SiaVideo media element
 * uses), so the store features wire their real `attach` listeners.
 */
function AttachProbe({
  container,
  media,
}: {
  container: HTMLElement;
  media: Media;
}) {
  const attachContainer = useContainerAttach();
  const attachMedia = useMediaAttach();
  useEffect(() => {
    attachContainer?.(container);
    attachMedia?.(media);
  }, [attachContainer, attachMedia, container, media]);
  return null;
}

/** Builds a fresh event-target media host for the store's `attach` to wire. */
function fakeMedia(): FakeMediaHost {
  const media = new EventTarget() as FakeMediaHost;
  media.currentTime = 0;
  media.currentSrc = "";
  media.duration = 0;
  media.ended = false;
  media.load = () => undefined;
  media.pause = () => undefined;
  media.paused = true;
  media.play = () => Promise.resolve();
  media.readyState = 4;
  media.seeking = false;
  media.src = "";
  return media;
}

/**
 * Yields to the scheduler so React's passive effects (and the store renders
 * they schedule) flush. A real macrotask delay is required: react-dom's
 * scheduler falls back to `setTimeout(…, 0)` in happy-dom, so a same-tick
 * microtask/macrotask race would assert before the bridge's effect runs.
 */
async function flush(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 25));
}

describe("PlaybackFactsBridge runtime (deterministic loop fix)", () => {
  it("reports once on mount and never re-reports across unrelated re-renders", async () => {
    let reports = 0;
    const onFacts = (_facts: PlaybackFacts): void => {
      reports += 1;
    };
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const tree = () =>
      createElement(
        Player,
        null,
        createElement(PlaybackFactsBridge, { onFacts }),
      );

    root.render(tree());
    await flush();
    // The initial genuine report (the store's baseline snapshot).
    expect(reports).toBe(1);

    // Simulate N unrelated parent re-renders with the same player store and
    // callback identity: a snapshot memoized on the stable selector values
    // must be referentially stable, so no effect re-run and no extra report.
    // Pre-fix, every re-render produced a new facts object → 1 more report.
    for (let i = 0; i < 25; i += 1) {
      root.render(tree());
      await flush();
    }
    expect(reports).toBe(1);

    root.unmount();
  });

  it("does not fall into an update-depth loop when the parent stores the report", async () => {
    let reports = 0;
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    // Mirrors the real PlayerScreen wiring: the parent re-renders from the
    // report (`setFacts` via a stable useCallback identity — exactly the
    // stable setState setter the screen actually passes). With the pre-fix
    // fresh-snapshot-per-render this is the "Maximum update depth exceeded"
    // cascade; the fix breaks it by keeping the snapshot identity stable.
    function FactsHost() {
      const [, setFacts] = useState<null | PlaybackFacts>(null);
      const report = useCallback((facts: PlaybackFacts): void => {
        reports += 1;
        setFacts(facts);
      }, []);
      return createElement(
        Player,
        null,
        createElement(PlaybackFactsBridge, { onFacts: report }),
      );
    }

    root.render(createElement(FactsHost));
    await flush();
    expect(reports).toBe(1);
    await flush();
    expect(reports).toBe(1);

    root.unmount();
  });

  it("re-reports exactly once when a playback store slice genuinely changes", async () => {
    let reports = 0;
    const media = fakeMedia();
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    root.render(
      createElement(
        Player,
        null,
        createElement(AttachProbe, {
          container,
          media: media as unknown as Media,
        }),
        createElement(PlaybackFactsBridge, {
          onFacts: () => {
            reports += 1;
          },
        }),
      ),
    );
    await flush();
    // Baseline snapshot reported on mount (the element is paused). The memo
    // must not suppress this initial genuine report.
    expect(reports).toBe(1);

    // A real playback start (as a media element fires it): flip `paused` and
    // dispatch the native `play` event → the playback feature syncs the store
    // slice → a NEW facts snapshot → exactly one more report.
    media.paused = false;
    media.dispatchEvent(new Event("play"));
    await flush();
    await flush();
    expect(reports).toBe(2);

    root.unmount();
  });
});
