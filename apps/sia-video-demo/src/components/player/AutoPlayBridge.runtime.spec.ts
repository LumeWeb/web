// @vitest-environment happy-dom

import { createElement, useEffect } from "react";
import { createRoot } from "react-dom/client";
import type { Media } from "@videojs/media";
import {
  createPlayer,
  useContainerAttach,
  useMediaAttach,
  videoFeatures,
} from "@videojs/react";
import {
  siaFeatures,
  siaLoadChange,
  siaProgressFeature,
} from "@lumeweb/sia-video-source";
import { describe, expect, it } from "vitest";
import { AutoPlayBridge } from "./AutoPlayBridge";

const { Player } = createPlayer({
  displayName: "AutoPlayBridgeRuntimePlayer",
  features: [...videoFeatures, ...siaFeatures, siaProgressFeature],
});

type FakeMedia = EventTarget & {
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

function fakeMedia(onPlay: () => void): FakeMedia {
  const media = new EventTarget() as FakeMedia;
  media.currentSrc = "";
  media.currentTime = 0;
  media.duration = 0;
  media.ended = false;
  media.load = () => undefined;
  media.pause = () => undefined;
  media.paused = true;
  media.play = () => {
    onPlay();
    return Promise.resolve();
  };
  media.readyState = 4;
  media.seeking = false;
  media.src = "";
  return media;
}

async function flush(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 25));
}

describe("AutoPlayBridge runtime", () => {
  it("resets the boundary and consumes one autoplay attempt", async () => {
    let playCalls = 0;
    let consumedCalls = 0;
    const media = fakeMedia(() => {
      playCalls += 1;
    });
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
        createElement(AutoPlayBridge, {
          onConsumed: () => {
            consumedCalls += 1;
          },
          pending: true,
        }),
      ),
    );
    await flush();

    media.dispatchEvent(
      new CustomEvent(siaLoadChange, { detail: { accepted: false } }),
    );
    await flush();
    media.dispatchEvent(
      new CustomEvent(siaLoadChange, { detail: { accepted: true } }),
    );
    await flush();

    expect(playCalls).toBe(1);
    expect(consumedCalls).toBe(1);

    media.dispatchEvent(
      new CustomEvent(siaLoadChange, { detail: { accepted: true } }),
    );
    await flush();
    expect(playCalls).toBe(1);
    expect(consumedCalls).toBe(1);
    root.unmount();
  });
});
