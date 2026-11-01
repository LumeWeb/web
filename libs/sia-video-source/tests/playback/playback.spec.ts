/** Real decoded frames are the acceptance signal; source acknowledgement alone cannot pass these tests. */
import { expect, type Page } from "@playwright/test";
import { test } from "./fixtures";
import type {} from "./page";

const longVideo = "1".repeat(64);
const shortVideo = "2".repeat(64);

async function openVideo(page: Page, networkURL: string, mse: "auto" | "main") {
  await page.goto(`/?network=${encodeURIComponent(networkURL)}&mse=${mse}`);
  await page.evaluate((id) => window.playback.load(id), longVideo);
}

test("the default worker entry answers the consumer handshake", async ({
  networkURL,
  page,
}) => {
  await page.goto(`/?network=${encodeURIComponent(networkURL)}`);
  expect(await page.evaluate(() => window.playback.defaultHandshake())).toEqual(
    { publicKeyBytes: 32, requestId: 73 },
  );
});

test("main-thread MIME rejection prevents video acceptance", async ({
  networkURL,
  page,
}) => {
  await page.addInitScript(() => {
    MediaSource.isTypeSupported = () => false;
  });
  await page.goto(`/?network=${encodeURIComponent(networkURL)}&mse=main`);
  await page.evaluate((id) => window.playback.load(id), shortVideo);
  await expect
    .poll(() => page.evaluate(() => window.playback.snapshot().errorCode))
    .toBe(4);
  expect(await page.evaluate(() => window.playback.snapshot())).toMatchObject({
    frames: 0,
    sourceKind: null,
  });
  await page.evaluate(() => window.playback.destroy());
});

for (const { mse, workerMse } of [
  { mse: "auto", workerMse: true },
  { mse: "main", workerMse: false },
] as const) {
  test(`${mse} MSE decodes video from the HTTP mock`, async ({
    browserName,
    networkURL,
    page,
  }) => {
    await openVideo(page, networkURL, mse);
    await expect
      .poll(() => page.evaluate(() => window.playback.snapshot()))
      .toMatchObject({
        error: null,
        height: 240,
        width: 320,
        workerMse: workerMse && browserName === "chromium",
      });
    await expect
      .poll(() => page.evaluate(() => window.playback.snapshot().frames))
      .toBeGreaterThan(2);
    await expect
      .poll(() => page.evaluate(() => window.playback.snapshot().frameTime))
      .toBeGreaterThan(0.1);
    await page.evaluate(() => window.playback.destroy());
  });

  test(`${mse} MSE cancels an old read when a different video replaces it`, async ({
    network,
    networkURL,
    page,
  }) => {
    network.control.setConditions({ downloadBytesPerSecond: 1 });
    await openVideo(page, networkURL, mse);
    await expect
      .poll(() =>
        network.control
          .requests()
          .some(
            (request) =>
              request.operation === "download" &&
              request.objectId === longVideo &&
              request.status === "pending",
          ),
      )
      .toBe(true);
    network.control.setConditions({ downloadBytesPerSecond: 0 });
    await page.evaluate((id) => window.playback.load(id), shortVideo);
    await expect
      .poll(() =>
        network.control
          .requests()
          .some(
            (request) =>
              request.operation === "download" &&
              request.objectId === longVideo &&
              request.status === "cancelled",
          ),
      )
      .toBe(true);
    await expect
      .poll(() => page.evaluate(() => window.playback.snapshot().frames))
      .toBeGreaterThan(2);
    expect(
      await page.evaluate(() => window.playback.snapshot().duration),
    ).toBeCloseTo(2, 2);
    expect(
      await page.evaluate(() => window.playback.snapshot().error),
    ).toBeNull();
    await page.evaluate(() => window.playback.destroy());
  });

  test(`${mse} MSE plays a new source after an earlier source fails`, async ({
    network,
    networkURL,
    page,
  }) => {
    network.control.addFault({ operation: "object" });
    await openVideo(page, networkURL, mse);
    await expect
      .poll(() => page.evaluate(() => window.playback.snapshot().errorCode))
      .toBe(2);
    await page.evaluate((id) => window.playback.load(id), shortVideo);
    await expect
      .poll(() => page.evaluate(() => window.playback.snapshot().frames))
      .toBeGreaterThan(2);
    expect(
      await page.evaluate(() => window.playback.snapshot().error),
    ).toBeNull();
    await page.evaluate(() => window.playback.destroy());
  });

  test(`${mse} MSE decodes frames after seeking beyond the buffered video`, async ({
    network,
    networkURL,
    page,
  }) => {
    network.control.setConditions({ downloadBytesPerSecond: 128 * 1024 });
    await openVideo(page, networkURL, mse);
    await expect
      .poll(() => page.evaluate(() => window.playback.snapshot().frames))
      .toBeGreaterThan(2);
    expect(
      await page.evaluate(() => window.playback.snapshot().bufferedEnd),
    ).toBeLessThan(11);
    await page.evaluate(() => window.playback.seek(11));
    await expect
      .poll(() => page.evaluate(() => window.playback.snapshot().frameTime))
      .toBeGreaterThan(11);
    expect(
      await page.evaluate(() => window.playback.snapshot().error),
    ).toBeNull();
    await page.evaluate(() => window.playback.destroy());
  });
}
