import { expect, test } from "@playwright/test";
import type {} from "../app/main.js";

test.describe("browser SDK/MSW boundaries", () => {
  test("initializes the browser SDK, seals a zero-length object, and keeps unknown calls visible", async ({ page }) => {
    let unhandled = 0;
    page.on("console", message => { if (message.type() === "error") unhandled++; });
    await page.goto("/");
    await expect(page.locator("#status")).toHaveText("ready");
    const evidence = await page.evaluate(() => window.__browserEvidence);
    if (!evidence) throw new Error("Browser evidence was not published");
    expect(evidence.account.ready).toBe(true);
    expect(evidence.zeroLength).toBe(0);
    expect(evidence.objectId).toMatch(/^[0-9a-f]{64}$/);
    expect(evidence.metadata).toBe("browser-metadata");
    expect(evidence.cursorPage).toBe(1);
    expect(evidence.afterCursor.length).toBeGreaterThan(0);
    for (const event of evidence.afterCursor) {
      expect(new Date(event.updatedAt).getTime() > new Date(evidence.cursor.after).getTime() ||
        new Date(event.updatedAt).getTime() === new Date(evidence.cursor.after).getTime() && event.id > evidence.cursor.id).toBe(true);
    }
    expect(evidence.shareUrlMetadata).toBe("");
    expect(evidence.accountIsolation.sameObjectId).toBe(true);
    expect(evidence.accountIsolation.firstMetadata).toBe("browser-metadata");
    expect(evidence.accountIsolation.secondMetadata).toBe("second-account-metadata");
    expect(evidence.accountIsolation.secondAccountKey).not.toBe(evidence.account.key);
    expect(evidence.sharing.ownerDescription).toBe("browser sharing");
    expect(evidence.sharing.ownerObjectCount).toBe(1);
    expect(evidence.sharing.statsCount).toBe(1);
    expect(evidence.sharing.objectCount).toBe(1);
    expect(evidence.sharing.summaryCount).toBe(1);
    expect(evidence.sharing.sharedId).toBe(evidence.objectId);
    expect(evidence.sharing.sharedMetadata).toBe("browser-metadata");
    expect(evidence.sharing.shareUrl).toBe(true);
    expect(evidence.sharing.shareUrlObjectId).toBe(evidence.objectId);
    expect(evidence.sharing.shareUrlPublicKey).toMatch(/^[A-Za-z0-9_-]+=*$/);
    expect(evidence.sharing.revoked).toBe(true);
    expect(evidence.eventsBeforeDelete).toBeGreaterThan(0);
    expect(evidence.eventsAfterDelete).toBeGreaterThan(evidence.eventsBeforeDelete);
    expect(evidence.modelSnapshot.accounts).toHaveLength(2);
    expect(evidence.unknownVisible).toBe(true);
    expect(unhandled).toBeGreaterThan(0);
  });

  test("uses an isolated dedicated worker for a zero-length response", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#status")).toHaveText("ready");
    const result = await page.evaluate(() => window.__dedicatedWorkerCheck("/browser/zero"));
    expect(result).toEqual({ bytes: 0, ok: true });
  });
});
