/** Real decoded frames are the acceptance signal; source acknowledgement alone cannot pass these tests. */
import { expect, type Page } from "@playwright/test";
import { type Media, test } from "./fixtures";
import type {} from "./page";
async function openVideo(page: Page, media: Media, mse: "auto" | "main") {
  await page.goto(`/?mse=${mse}`);
  await page.evaluate((id) => window.playback.load(id), media.long.id);
}
for (const scheme of ["sia", "https"]) {
  test(`${scheme} share URLs decode through the scoped HTTP reader`, async ({
    media,
    page,
  }) => {
    await page.goto("/?mse=main");
    await page.evaluate(
      (id) => window.playback.load(id),
      `${scheme}://indexer.invalid/objects/${media.short.id}/shared?signature=fixture#encryption_key=${"A".repeat(43)}`,
    );
    await expect
      .poll(() => page.evaluate(() => window.playback.snapshot().frames))
      .toBeGreaterThan(2);
    await page.evaluate(() => window.playback.destroy());
  });
}
test("the default worker entry answers the consumer handshake", async ({
  page,
}) => {
  await page.goto("/");
  expect(await page.evaluate(() => window.playback.defaultHandshake())).toEqual(
    { publicKeyBytes: 32, requestId: 73 },
  );
});
test("main-thread MIME rejection prevents video acceptance", async ({
  media,
  page,
}) => {
  await page.addInitScript(() => {
    MediaSource.isTypeSupported = () => false;
  });
  await page.goto("/?mse=main");
  await page.evaluate((id) => window.playback.load(id), media.short.id);
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
    media,
    page,
  }) => {
    await openVideo(page, media, mse);
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
    media,
    page,
  }) => {
    const hold = media.mock.faults.hold({
      actor: media.actor,
      object: media.long,
      operation: "download",
    });
    try {
      await openVideo(page, media, mse);
      await hold.started();
      await page.evaluate((id) => window.playback.load(id), media.short.id);
      expect((await hold.cancelled()).status).toBe("cancelled");
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
    } finally {
      hold.release();
    }
  });
  test(`${mse} MSE plays a new source after an earlier source fails`, async ({
    media,
    page,
  }) => {
    media.mock.faults.fail(
      { actor: media.actor, object: media.long, operation: "object" },
      { code: "unavailable", times: 1 },
    );
    await openVideo(page, media, mse);
    await expect
      .poll(() => page.evaluate(() => window.playback.snapshot().errorCode))
      .toBe(2);
    await page.evaluate((id) => window.playback.load(id), media.short.id);
    await expect
      .poll(() => page.evaluate(() => window.playback.snapshot().frames))
      .toBeGreaterThan(2);
    expect(
      await page.evaluate(() => window.playback.snapshot().error),
    ).toBeNull();
    await page.evaluate(() => window.playback.destroy());
  });
  test(`${mse} MSE decodes frames after seeking beyond the buffered video`, async ({
    media,
    page,
  }) => {
    media.mock.faults.setLink(media.actor, {
      downloadBytesPerSecond: 128 * 1024,
    });
    await openVideo(page, media, mse);
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
