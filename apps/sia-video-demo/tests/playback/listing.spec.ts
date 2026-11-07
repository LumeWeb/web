/** Picker teardown must cancel the listing request rather than only hide late rows. */
import { expect } from "@playwright/test";
import { bytesFixture } from "@lumeweb/sia-testing/mock";
import { openShare, test } from "./fixtures";

test("closing a share cancels its held object listing", async ({ fixture, page }) => {
  const hold = fixture.mock.faults.hold({ actor: fixture.actor, operation: "objects" });
  try {
    await openShare(page, fixture);
    const receipt = await hold.started();
    await page.getByRole("button", { exact: true, name: "Close share" }).click();
    await expect(page.getByRole("heading", { exact: true, name: "Open a share" })).toBeVisible();
    await expect.poll(() => fixture.mock.history().find((request) => request.id === receipt.id)?.status, { timeout: 2000 }).toBe("cancelled");
    expect((await hold.cancelled()).id).toBe(receipt.id);
  } finally {
    hold.release();
  }
});

test("changing the sharing key cancels old listing work and shows only the replacement rows", async ({ endpoint, fixture, page, sia }) => {
  const object = await sia.objects.upload({
    file: await bytesFixture({ bytes: Uint8Array.of(1), name: "replacement" }),
    metadata: new TextEncoder().encode("Replacement object"),
  });
  const share = await sia.shares.create({ objects: [object] });
  const seed = endpoint.connection({ access: share.access, as: fixture.actor }).credential.keyHex;
  const hold = fixture.mock.faults.hold({ actor: fixture.actor, operation: "objects" });
  try {
    await openShare(page, fixture);
    const receipt = await hold.started();
    await page.evaluate((sharingKey) => { location.hash = new URLSearchParams({ sharing_key: sharingKey }).toString(); }, seed);
    await expect.poll(() => fixture.mock.history().find((request) => request.id === receipt.id)?.status, { timeout: 2000 }).toBe("cancelled");
    hold.release();
    await expect(page.getByRole("button", { name: /Replacement object/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Long demo video.mp4/ })).toHaveCount(0);
  } finally {
    hold.release();
  }
});
