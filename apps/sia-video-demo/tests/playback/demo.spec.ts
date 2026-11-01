/** UI selection must reach real decoded frames; deselection must stop server-observed reads. */
import { expect } from "@playwright/test";
import { openDemo, openShare, test } from "./fixtures";

declare global {
  interface Window {
    demoSeekTime?: number;
  }
}

test("the browser rejects external requests through the owned proxy", async ({
  egress,
  page,
}) => {
  await page.goto("http://blocked.invalid").catch(() => undefined);
  expect(egress.connections()).toBeGreaterThan(0);
});

test("a shared video selected in the demo decodes frames", async ({
  fixture,
  page,
}) => {
  await openShare(page, fixture);
  const row = page.getByRole("button", { name: /Long demo video.mp4/ });
  await expect(row).toContainText("673.7 KiB");
  await row.click();
  await expect(page.locator("video")).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator("video")
        .evaluate(
          (video: HTMLVideoElement) =>
            video.getVideoPlaybackQuality().totalVideoFrames,
        ),
    )
    .toBeGreaterThan(0);
});

test("the demo seek control resumes decoded frames at the selected position", async ({
  fixture,
  page,
}) => {
  await openShare(page, fixture);
  await page.getByRole("button", { name: /Long demo video.mp4/ }).click();
  const video = page.locator("video");
  await expect
    .poll(
      () =>
        video.evaluate(
          (element: HTMLVideoElement) =>
            element.getVideoPlaybackQuality().totalVideoFrames,
        ),
      { timeout: 15000 },
    )
    .toBeGreaterThan(0);
  const initial = await video.evaluate((element: HTMLVideoElement) => ({
    currentTime: element.currentTime,
    duration: element.duration,
  }));
  expect(initial.duration).toBeCloseTo(12, 1);
  expect(initial.currentTime).toBeLessThan(2);
  const slider = page.getByRole("slider", { exact: true, name: "Seek" });
  await slider.press("Home");
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) => element.currentTime),
    )
    .toBeLessThan(0.5);
  await page.evaluate(() => {
    window.demoSeekTime = -1;
    const element = document.querySelector("video")!;
    const observe: VideoFrameRequestCallback = (_now, metadata) => {
      window.demoSeekTime = metadata.mediaTime;
      if (metadata.mediaTime < 9.5) element.requestVideoFrameCallback(observe);
    };
    element.requestVideoFrameCallback(observe);
  });
  await slider.press("PageUp");
  await expect
    .poll(() => page.evaluate(() => window.demoSeekTime), { timeout: 4000 })
    .toBeGreaterThanOrEqual(9.5);
  expect(await page.evaluate(() => window.demoSeekTime)).toBeLessThan(10.5);
});

test("deselecting a shared row cancels its held download", async ({
  fixture,
  page,
}) => {
  const release = fixture.network.control.hold({ operation: "download" });
  try {
    await openShare(page, fixture);
    const row = page.getByRole("button", { name: /Long demo video.mp4/ });
    await row.click();
    await expect
      .poll(() =>
        fixture.network.control
          .requests()
          .some(
            (request) =>
              request.operation === "download" && request.status === "pending",
          ),
      )
      .toBe(true);
    await row.click();
    await expect(page.locator("video")).toHaveCount(0);
    await expect(
      page.getByText("No source selected yet.", { exact: true }),
    ).toBeVisible();
    await expect
      .poll(() =>
        fixture.network.control
          .requests()
          .some(
            (request) =>
              request.operation === "download" &&
              request.status === "cancelled",
          ),
      )
      .toBe(true);
  } finally {
    release();
  }
});

test("closing a fragment-opened share cancels its held download", async ({
  fixture,
  page,
}) => {
  const release = fixture.network.control.hold({ operation: "download" });
  try {
    await openDemo(page, fixture);
    await page.evaluate(
      ({ id, seed }) => {
        location.hash = new URLSearchParams({
          object: id,
          sharing_key: seed,
        }).toString();
      },
      { id: fixture.longId, seed: fixture.sharingSeed },
    );
    await expect
      .poll(() =>
        fixture.network.control
          .requests()
          .some(
            (request) =>
              request.operation === "download" && request.status === "pending",
          ),
      )
      .toBe(true);
    await page
      .getByRole("button", { exact: true, name: "Close share" })
      .click();
    await expect(
      page.getByRole("heading", { exact: true, name: "Open a share" }),
    ).toBeVisible();
    await expect(page.locator("video")).toHaveCount(0);
    expect(new URL(page.url()).hash).toBe("");
    await expect
      .poll(() =>
        fixture.network.control
          .requests()
          .some(
            (request) =>
              request.operation === "download" &&
              request.status === "cancelled",
          ),
      )
      .toBe(true);
  } finally {
    release();
  }
});

test("a shared video can be selected again after a transport error", async ({
  fixture,
  page,
}) => {
  fixture.network.control.addFault({ operation: "object" });
  await openShare(page, fixture);
  const row = page.getByRole("button", { name: /Long demo video.mp4/ });
  await row.click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await expect(
    page.getByText("The Sia network connection failed.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { exact: true, name: "OK" }).click();
  await row.click();
  await expect(page.locator("video")).toHaveCount(0);
  await row.click();
  await expect
    .poll(() =>
      page
        .locator("video")
        .evaluate(
          (video: HTMLVideoElement) =>
            video.getVideoPlaybackQuality().totalVideoFrames,
        ),
    )
    .toBeGreaterThan(0);
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
});

test("an invalid sharing key stays on the entry screen without loading video", async ({
  fixture,
  page,
}) => {
  await openDemo(page, fixture);
  await page
    .getByLabel("Sharing link or key", { exact: true })
    .fill("not-a-sharing-key");
  await page.getByRole("button", { exact: true, name: "Apply" }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "Enter a valid sharing key.",
  );
  await expect(
    page.getByRole("heading", { exact: true, name: "Open a share" }),
  ).toBeVisible();
  await expect(page.locator("video")).toHaveCount(0);
  expect(
    fixture.network.control
      .requests()
      .some(
        (request) =>
          request.operation === "object" || request.operation === "download",
      ),
  ).toBe(false);
});
