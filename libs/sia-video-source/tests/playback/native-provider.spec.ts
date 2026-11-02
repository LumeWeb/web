/** Native-provider tests wait for decoded frames so an acquired but unplayable URL cannot pass. */
import { expect } from "@playwright/test";
import { test } from "./fixtures";
import type {} from "./page";
test("automatic selection plays the available native provider", async ({
  media,
  page,
}) => {
  await page.goto("/?backend=auto");
  await page.evaluate((id) => window.playback.load(id), media.short.id);
  await expect
    .poll(() => page.evaluate(() => window.playback.snapshot().frames))
    .toBeGreaterThan(2);
  expect(await page.evaluate(() => window.playback.snapshot())).toMatchObject({
    error: null,
    hasWorker: false,
    sourceKind: "native",
  });
  await page.evaluate(() => window.playback.destroy());
  expect(
    await page.evaluate(() => window.playback.snapshot().nativeReleases),
  ).toBe(1);
});
test("automatic selection uses the media worker when native playback is unavailable", async ({
  media,
  page,
}) => {
  await page.goto("/?backend=auto&nativeAvailable=false");
  await page.evaluate((id) => window.playback.load(id), media.short.id);
  await expect
    .poll(() => page.evaluate(() => window.playback.snapshot().frames))
    .toBeGreaterThan(2);
  expect(await page.evaluate(() => window.playback.snapshot())).toMatchObject({
    error: null,
    hasWorker: true,
    nativeReleases: 0,
    sourceKind: "worker",
  });
  await page.evaluate(() => window.playback.destroy());
});
test("a broken native URL releases its stream before media-worker playback recovers", async ({
  media,
  page,
}) => {
  await page.goto(
    `/?backend=auto&nativeURL=${encodeURIComponent("/missing-native.mp4")}`,
  );
  await page.evaluate((id) => window.playback.load(id), media.short.id);
  await expect
    .poll(() => page.evaluate(() => window.playback.snapshot().frames))
    .toBeGreaterThan(2);
  expect(await page.evaluate(() => window.playback.snapshot())).toMatchObject({
    error: null,
    hasWorker: true,
    nativeReleases: 1,
    sourceKind: "worker",
  });
  await page.evaluate(() => window.playback.destroy());
  expect(
    await page.evaluate(() => window.playback.snapshot().nativeReleases),
  ).toBe(1);
});
test("a pause during worker fallback keeps the replacement paused", async ({
  media,
  page,
}) => {
  const hold = media.mock.faults.hold({
    actor: media.actor,
    object: media.short,
    operation: "object",
  });
  try {
    await page.goto("/?backend=auto&nativeAvailable=false");
    await page.evaluate((id) => window.playback.load(id), media.short.id);
    await hold.started();
    await page.evaluate(() => window.playback.pause());
    hold.release();
    await expect
      .poll(() => page.evaluate(() => window.playback.snapshot().sourceKind))
      .toBe("worker");
    expect(await page.evaluate(() => window.playback.snapshot())).toMatchObject(
      { error: null, paused: true },
    );
    await page.evaluate(() => window.playback.destroy());
  } finally {
    hold.release();
  }
});
test("a pause during native acquisition prevents automatic playback", async ({
  media,
  page,
}) => {
  const hold = media.mock.faults.hold({
    actor: media.actor,
    object: media.short,
    operation: "object",
  });
  try {
    await page.goto("/?backend=auto");
    await page.evaluate((id) => window.playback.load(id), media.short.id);
    await hold.started();
    await page.evaluate(() => window.playback.pause());
    hold.release();
    await expect
      .poll(() => page.evaluate(() => window.playback.snapshot().readyState))
      .toBeGreaterThanOrEqual(2);
    expect(await page.evaluate(() => window.playback.snapshot())).toMatchObject(
      {
        error: null,
        frameTime: 0,
        hasWorker: false,
        paused: true,
        sourceKind: "native",
      },
    );
    await page.evaluate(() => window.playback.destroy());
  } finally {
    hold.release();
  }
});
