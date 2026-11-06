/** Native URL fixtures test demo selection and release without claiming service-worker support. */
import { expect } from "@playwright/test";
import { expectDecodedProgress } from "@lumeweb/sia-video-source/testing";
import { openShare, test } from "./fixtures";

test("worker-only playback never prepares native streaming", async ({ fixture, page }) => {
  await openShare(page, fixture);
  await page.getByRole("button", { name: "Long demo video.mp4" }).click();
  await expectDecodedProgress(page.locator("video"));
  expect(await page.evaluate(() => window.__siaDemoNative?.preparations ?? 0)).toBe(0);
  expect(page.workers().length).toBeGreaterThan(0);
});

test("worker playback stays mounted while native preparation is pending", async ({ fixture, page }) => {
  await page.addInitScript(() => {
    window.__siaDemoNative = { mode: "held", preparations: 0, releases: 0 };
  });
  await openShare(page, fixture);
  await page.getByRole("button", { name: "Long demo video.mp4" }).click();
  const video = page.locator("video");
  await expectDecodedProgress(video);
  const original = await video.elementHandle();
  try {
    await page.getByLabel("Disable native (service-worker) playback", { exact: true }).uncheck();
    await expect.poll(() => page.evaluate(() => window.__siaDemoNative?.preparations ?? 0)).toBeGreaterThan(0);
    expect(await original!.evaluate((element) => element.isConnected)).toBe(true);
    await expectDecodedProgress(video);
    await page.evaluate(() => window.__siaDemoNative?.releasePreparation?.());
    await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentSrc)).toContain("browser-decodable-long.mp4");
    expect(await original!.evaluate((element) => element.isConnected)).toBe(true);
  } finally {
    await page.evaluate(() => window.__siaDemoNative?.releasePreparation?.()).catch(() => undefined);
  }
});

test("available native playback decodes and releases the selected stream", async ({ fixture, page }) => {
  await openShare(page, fixture, false);
  await page.getByRole("button", { name: "Long demo video.mp4" }).click();
  const video = page.locator("video");
  await expectDecodedProgress(video);
  expect(await video.evaluate((element: HTMLVideoElement) => element.currentSrc)).toContain("browser-decodable-long.mp4");
  expect(page.workers()).toHaveLength(0);
  expect(fixture.mock.history().some((request) =>
    request.actor === fixture.actor && request.operation === "object" &&
    request.objectId === fixture.object.id && request.status === "completed",
  )).toBe(true);
  const releases = await page.evaluate(() => window.__siaDemoNative?.releases ?? 0);
  await page.getByRole("button", { name: "Long demo video.mp4" }).click();
  await expect(page.locator("video")).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => window.__siaDemoNative?.releases ?? 0)).toBe(releases + 1);
});

for (const mode of ["unavailable", "rejected"] as const) {
  test(`${mode} native streaming falls back to decoded worker playback`, async ({ fixture, page }) => {
    await page.addInitScript((mode) => {
      window.__siaDemoNative = { mode, preparations: 0, releases: 0 };
    }, mode);
    await openShare(page, fixture, false);
    await page.getByRole("button", { name: "Long demo video.mp4" }).click();
    const video = page.locator("video");
    await expectDecodedProgress(video);
    expect(page.workers().length).toBeGreaterThan(0);
    expect(await page.evaluate(() => window.__siaDemoNative?.preparations ?? 0)).toBeGreaterThan(0);
    await expect.poll(() => fixture.mock.history().some((request) =>
      request.actor === fixture.actor && request.operation === "download" &&
      request.objectId === fixture.object.id && request.status === "completed",
    )).toBe(true);
  });
}
