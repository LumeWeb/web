/** Failed persisted credentials must leave a usable entry screen without a request loop. */
import { expect } from "@playwright/test";
import { APP_ID } from "../../src/lib/constants";
import { test } from "./fixtures";

const storageKey = `sia-auth-${APP_ID.slice(0, 8)}`;

test("a failed account reconnect waits for an explicit retry", async ({ fixture, page }) => {
  let attempts = 0;
  page.on("request", (request) => {
    if (request.url().endsWith("/auth-connected")) attempts++;
  });
  await page.addInitScript(({ key, url }) => {
    localStorage.setItem(key, JSON.stringify({
      state: { indexerUrl: url, sharingKeyHex: null, userKeyHex: "f".repeat(64) },
      version: 2,
    }));
  }, { key: storageKey, url: fixture.url });
  await page.goto("/");
  await expect(page.getByRole("button", { exact: true, name: "Retry connection" })).toBeVisible();
  expect(attempts).toBe(1);
  await page.getByRole("button", { exact: true, name: "Retry connection" }).click();
  await expect(page.getByRole("button", { exact: true, name: "Retry connection" })).toBeVisible();
  expect(attempts).toBe(2);
});

test("a sharing session does not reconnect a persisted account key", async ({ fixture, page }) => {
  let attempts = 0;
  page.on("request", (request) => {
    if (request.url().endsWith("/auth-connected")) attempts++;
  });
  await page.addInitScript(({ key, seed, url }) => {
    localStorage.setItem(key, JSON.stringify({
      state: { indexerUrl: url, sharingKeyHex: seed, userKeyHex: "f".repeat(64) },
      version: 2,
    }));
  }, { key: storageKey, seed: fixture.sharingSeed, url: fixture.url });
  await page.goto("/");
  await expect(page.getByRole("button", { name: /Long demo video.mp4/ })).toBeVisible();
  expect(attempts).toBe(0);
});
