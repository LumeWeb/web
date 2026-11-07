/** UI selection must reach real decoded frames; deselection must stop server-observed reads. */
import { expect } from "@playwright/test";
import { expectDecodedProgress, mediaFixture } from "@lumeweb/sia-video-source/testing";
import { openDemo, openShare, test } from "./fixtures";

declare global {
  interface Window {
    demoSeekTime?: number;
  }
}

test("an account can play a managed video after registration and reconnect", async ({
  fixture,
  sia,
}) => {
  let url = "";
  const page = await sia.browser.open({
    access: sia.auth.registrationAccess,
    async apply(page, connection) {
      url = new URL(
        `${connection.backend.connection.client}/`,
        connection.backend.connection.url,
      ).href;
      await page.addInitScript((credential) => {
        window.__siaDemoTest = { credential };
      }, connection.backend.credential);
    },
    mockActor: fixture.actor,
  });
  await openDemo(page, { ...fixture, url });
  await page
    .getByRole("button", { exact: true, name: "Sign in with your Sia account" })
    .click();
  await page.getByRole("button", { exact: true, name: "Connect" }).click();
  await expect(
    page.getByRole("heading", { name: "Approve the connection" }),
  ).toBeVisible();
  const responseUrl = await page.getByRole("link").getAttribute("href");
  expect(responseUrl).not.toBeNull();
  await sia.auth.approve(responseUrl!);
  await page.getByRole("button", { exact: true, name: "Continue" }).click();
  await page
    .getByPlaceholder("12-word recovery phrase")
    .fill(sia.auth.fixturePhrase);
  await page.getByRole("button", { exact: true, name: "Register" }).click();
  await expect(
    page.getByRole("button", { exact: true, name: "Log out" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { exact: true, name: "Log out" }),
  ).toBeVisible();
  await page.getByRole("button", { exact: true, name: "Show developer tools" }).click();
  await page.getByLabel("Disable native (service-worker) playback", { exact: true }).check();
  const shareUrl = new URL(`/objects/${fixture.object.id}/shared`, url);
  shareUrl.hash = new URLSearchParams({
    encryption_key: btoa(String.fromCharCode(...new Uint8Array(32).fill(7))),
  }).toString();
  await page.getByLabel("Sia share URL", { exact: true }).fill(shareUrl.href);
  const video = page.locator("video");
  await expect(video).toBeVisible();
  await page.getByRole("button", { exact: true, name: "Play" }).first().click();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(false);
  await expectDecodedProgress(video);
  await expect.poll(() => fixture.mock.history().some((request) =>
    request.actor === fixture.actor && request.objectId === fixture.object.id &&
    request.operation === "download" && request.status === "completed",
  )).toBe(true);
});

test("a well-formed unknown sharing seed cannot list the fixture", async ({
  fixture,
  page,
}) => {
  await openDemo(page, fixture);
  await page
    .getByLabel("Sharing link or key", { exact: true })
    .fill("f".repeat(64));
  await page.getByRole("button", { exact: true, name: "Apply" }).click();
  await expect(
    page.getByRole("button", { exact: true, name: "Retry" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Long demo video.mp4/ }),
  ).toHaveCount(0);
  await expect(page.locator("video")).toHaveCount(0);
});

test("an owner credential cannot replace the sharing seed in the recipient UI", async ({
  fixture,
  page,
  sia,
}) => {
  let key = "";
  await sia.browser.open({
    access: sia.ownerAccess,
    apply(_page, connection) {
      key = connection.backend.credential.keyHex;
      return Promise.resolve();
    },
  });
  await openDemo(page, fixture);
  await page.getByLabel("Sharing link or key", { exact: true }).fill(key);
  await page.getByRole("button", { exact: true, name: "Apply" }).click();
  await expect(
    page.getByRole("button", { exact: true, name: "Retry" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Long demo video.mp4/ }),
  ).toHaveCount(0);
  await expect(page.locator("video")).toHaveCount(0);
});

test("revoking a listed share prevents fresh worker playback", async ({
  fixture,
  page,
  sia,
}) => {
  await openShare(page, fixture);
  const row = page.getByRole("button", { name: /Long demo video.mp4/ });
  await expect(row).toBeVisible();
  await sia.shares.revoke(fixture.share);
  await row.click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  expect(
    await page
      .locator("video")
      .evaluate(
        (video: HTMLVideoElement) =>
          video.getVideoPlaybackQuality().totalVideoFrames,
      ),
  ).toBe(0);
});

test("deleting a listed video prevents fresh worker playback", async ({
  fixture,
  page,
  sia,
}) => {
  await openShare(page, fixture);
  const row = page.getByRole("button", { name: /Long demo video.mp4/ });
  await expect(row).toBeVisible();
  await sia.objects.delete(fixture.object);
  await row.click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  expect(
    await page
      .locator("video")
      .evaluate(
        (video: HTMLVideoElement) =>
          video.getVideoPlaybackQuality().totalVideoFrames,
      ),
  ).toBe(0);
});

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
  await expectDecodedProgress(page.locator("video"));
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
  const hold = fixture.mock.faults.hold({
    actor: fixture.actor,
    object: fixture.object,
    operation: "download",
  });
  try {
    await openShare(page, fixture);
    const row = page.getByRole("button", { name: /Long demo video.mp4/ });
    await row.click();
    await hold.started();
    await row.click();
    await expect(page.locator("video")).toHaveCount(0);
    await expect(
      page.getByText("No source selected yet.", { exact: true }),
    ).toBeVisible();
    expect((await hold.cancelled()).status).toBe("cancelled");
  } finally {
    hold.release();
  }
});

test("closing a fragment-opened share cancels its held download", async ({
  fixture,
  page,
}) => {
  const hold = fixture.mock.faults.hold({
    actor: fixture.actor,
    object: fixture.object,
    operation: "download",
  });
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
    await hold.started();
    await page
      .getByRole("button", { exact: true, name: "Close share" })
      .click();
    await expect(
      page.getByRole("heading", { exact: true, name: "Open a share" }),
    ).toBeVisible();
    await expect(page.locator("video")).toHaveCount(0);
    expect(new URL(page.url()).hash).toBe("");
    expect((await hold.cancelled()).status).toBe("cancelled");
  } finally {
    hold.release();
  }
});

test("a shared video can be selected again after a transport error", async ({
  fixture,
  page,
}) => {
  fixture.mock.faults.fail(
    { actor: fixture.actor, object: fixture.object, operation: "object" },
    { code: "unavailable", times: 1 },
  );
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
    fixture.mock
      .history()
      .some(
        (request) =>
          request.operation === "object" || request.operation === "download",
      ),
  ).toBe(false);
});

for (const failure of ["shard-shortage", "read-stalled"] as const) {
  test(`a failed ${failure} opening ends preparing and can be retried in place`, async ({
    fixture,
    page,
    sia,
  }) => {
    test.setTimeout(60000);
    const file = await mediaFixture("seekable-avc");
    const healthy = await sia.objects.upload({
      file,
      metadata: new TextEncoder().encode(JSON.stringify({ filename: "Healthy video.mp4", type: "sialo-object-meta", version: 1 })),
    });
    await sia.shares.attach(fixture.share, healthy);
    const failingUrl = new URL(fixture.url);
    failingUrl.searchParams.set("openingFailure", failure);
    failingUrl.searchParams.set("failedObject", fixture.object.id);
    failingUrl.searchParams.set("failedOpenings", "2");
    await openShare(page, { ...fixture, url: failingUrl.href });
    const row = page.getByRole("button", { name: /Long demo video.mp4/ });
    await row.click();
    const video = page.locator("video");
    await expect(video).toBeVisible();
    await video.evaluate((element) => element.setAttribute("data-persistent-player", "true"));
    const dialog = page.getByRole("alertdialog");
    await expect(dialog).toBeVisible({ timeout: 15000 });
    await expect(dialog).toContainText(failure === "shard-shortage" ? /not fully available/i : /stalled/i);
    await expect(page.locator("[data-preparing-overlay]")).toHaveCount(0);
    await expect(page.locator("[data-recovery-feedback]")).toHaveCount(0);
    await page.getByRole("button", { exact: true, name: "OK" }).click();
    // Dismissal must consume the old autoplay intent rather than resume preparing.
    await expect(page.locator("[data-preparing-overlay]")).toHaveCount(0);
    await page.getByRole("button", { exact: true, name: "Retry opening video" }).click();
    await expect(dialog).toBeVisible({ timeout: 15000 });
    await expect(video).toHaveAttribute("data-persistent-player", "true");
    await expect(page.locator("[data-preparing-overlay]")).toHaveCount(0);
    await expect(page.locator("[data-recovery-feedback]")).toHaveCount(0);
    await page.getByRole("button", { exact: true, name: "OK" }).click();
    expect(fixture.mock.history().filter((request) => request.actor === fixture.actor && request.objectId === fixture.object.id && request.operation === "object")).toHaveLength(2);
    await page.getByRole("button", { exact: true, name: "Retry opening video" }).click();
    await expectDecodedProgress(video);
    await expect(video).toHaveAttribute("data-persistent-player", "true");
    await expect(page.getByRole("button", { exact: true, name: "Retry opening video" })).toHaveCount(0);
    await page.getByRole("button", { name: /Healthy video.mp4/ }).click();
    await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState)).toBe(4);
    if (await video.evaluate((element: HTMLVideoElement) => element.paused)) {
      await page.getByRole("button", { exact: true, name: "Play" }).first().click();
    }
    await expectDecodedProgress(video);
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole("button", { exact: true, name: "Retry opening video" })).toHaveCount(0);
  });
}
