/** Listing fixtures cross the UI page boundary while the driver controls each request. */
import { expect } from "@playwright/test";
import { bytesFixture } from "@lumeweb/sia-testing/mock";
import { openShare, test } from "./fixtures";

test("a failed second page preserves visible rows and retries without duplicates", async ({ fixture, page, sia }) => {
  for (let index = 0; index < 10; index++) {
    const object = await sia.objects.upload({
      file: await bytesFixture({ bytes: Uint8Array.of(index), name: `page-${index}` }),
      metadata: new TextEncoder().encode(`Page object ${index}`),
    });
    await sia.shares.attach(fixture.share, object);
  }
  const offsets: number[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname.endsWith("/objects")) offsets.push(Number(url.searchParams.get("offset")));
  });
  const first = fixture.mock.faults.hold({ actor: fixture.actor, operation: "objects" });
  const second = fixture.mock.faults.hold({ actor: fixture.actor, operation: "objects" });
  try {
    await openShare(page, fixture);
    await first.started();
    first.release();
    await second.started();
    const rows = page.getByRole("button", { name: /Page object|Long demo video/ });
    await expect(rows).toHaveCount(10);
    await expect(page.getByText("Showing 10 objects", { exact: true })).toBeVisible();
    fixture.mock.faults.fail({ actor: fixture.actor, operation: "objects" }, { code: "unavailable", times: 1 });
    second.release();
    await expect(rows).toHaveCount(11);
    await expect(page.getByText("11 objects", { exact: true })).toBeVisible();
    expect(new Set(await rows.allTextContents()).size).toBe(11);
    expect(offsets).toEqual([0, 10, 10]);
    expect(fixture.mock.history().filter((request) => request.operation === "objects" && request.status === "failed")).toHaveLength(1);
  } finally {
    first.release();
    second.release();
  }
});

test("an exactly full final page finishes after an empty follow-up read", async ({ fixture, page, sia }) => {
  for (let index = 0; index < 19; index++) {
    const object = await sia.objects.upload({
      file: await bytesFixture({ bytes: Uint8Array.of(index), name: `full-${index}` }),
      metadata: new TextEncoder().encode(`Page object ${index}`),
    });
    await sia.shares.attach(fixture.share, object);
  }
  const offsets: number[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname.endsWith("/objects")) offsets.push(Number(url.searchParams.get("offset")));
  });
  await openShare(page, fixture);
  await expect(page.getByRole("button", { name: /Page object|Long demo video/ })).toHaveCount(20);
  await expect(page.getByText("20 objects", { exact: true })).toBeVisible();
  expect(offsets).toEqual([0, 10, 20]);
});
