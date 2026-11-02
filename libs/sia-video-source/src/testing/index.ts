/** Packaged decode fixtures and frame checks keep playback tests independent of repository paths. */
import { readFile } from "node:fs/promises";
import { expect, type Locator } from "@playwright/test";
import { fileFixture } from "@lumeweb/sia-testing/node";
import type { TestFile } from "@lumeweb/sia-testing/node";
export type VideoFixture = TestFile & {
  readonly durationSeconds: number;
  readonly height: number;
  readonly knownRange: {
    readonly bytes: readonly number[];
    readonly offset: number;
  };
  readonly seekTargetSeconds: number;
  readonly width: number;
};
export async function expectDecodedAt(
  video: Locator,
  seconds: number,
): Promise<void> {
  await video.evaluate(
    (element: HTMLVideoElement, target) =>
      new Promise<void>((resolve, reject) => {
        let callback = 0;
        const timer = setTimeout(() => {
          element.cancelVideoFrameCallback(callback);
          reject(new Error("No decoded frame at the seek target"));
        }, 10_000);
        const decoded: VideoFrameRequestCallback = (_now, metadata) => {
          if (metadata.mediaTime >= target) {
            clearTimeout(timer);
            resolve();
          } else callback = element.requestVideoFrameCallback(decoded);
        };
        callback = element.requestVideoFrameCallback(decoded);
      }),
    seconds,
  );
}
export async function expectDecodedProgress(video: Locator): Promise<void> {
  const before = await video.evaluate(
    (element: HTMLVideoElement) =>
      element.getVideoPlaybackQuality().totalVideoFrames,
  );
  await expect
    .poll(() =>
      video.evaluate(
        (element: HTMLVideoElement) =>
          element.getVideoPlaybackQuality().totalVideoFrames,
      ),
    )
    .toBeGreaterThan(before);
  await video.evaluate(
    (element: HTMLVideoElement) =>
      new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          element.cancelVideoFrameCallback(callback);
          reject(new Error("No decoded video frame"));
        }, 10_000);
        const callback = element.requestVideoFrameCallback(() => {
          clearTimeout(timer);
          resolve();
        });
      }),
  );
}
export async function mediaFixture(
  name: "seekable-avc" | "short-avc-aac",
): Promise<VideoFixture> {
  if (name !== "seekable-avc" && name !== "short-avc-aac")
    throw new Error("Unknown decode fixture");
  const url = new URL(
    `../__fixtures__/media/browser-decodable-${name === "seekable-avc" ? "long" : "avc-aac"}.mp4`,
    import.meta.url,
  );
  const file = await fileFixture(url);
  const bytes = new Uint8Array(await readFile(url));
  return Object.freeze({
    ...file,
    durationSeconds: name === "seekable-avc" ? 12 : 2,
    height: 240,
    knownRange: { bytes: [...bytes.subarray(0, 64)], offset: 0 },
    seekTargetSeconds: name === "seekable-avc" ? 10 : 1,
    width: 320,
  });
}
