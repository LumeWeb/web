/** Failed persisted credentials must leave a usable entry screen without a request loop. */
import { expect } from "@playwright/test";
import { APP_ID } from "../../src/lib/constants";
import { test } from "./fixtures";

const storageKey = `sia-auth-${APP_ID.slice(0, 8)}`;

test("a failed account reconnect waits for an explicit retry", async ({
  fixture,
  page,
}) => {
  let attempts = 0;
  page.on("request", (request) => {
    if (request.url().endsWith("/auth-connected")) attempts++;
  });
  await page.addInitScript(
    ({ key, url }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          state: {
            indexerUrl: url,
            sharingKeyHex: null,
            userKeyHex: "f".repeat(64),
          },
          version: 2,
        }),
      );
    },
    { key: storageKey, url: fixture.url },
  );
  await page.goto("/");
  await expect(
    page.getByRole("button", { exact: true, name: "Retry connection" }),
  ).toBeVisible();
  expect(attempts).toBe(1);
  await page
    .getByRole("button", { exact: true, name: "Retry connection" })
    .click();
  await expect(
    page.getByRole("button", { exact: true, name: "Retry connection" }),
  ).toBeVisible();
  expect(attempts).toBe(2);
});

test("changing indexers after reconnect failure uses the new account scope", async ({
  endpoint,
  fixture,
  page,
}) => {
  const attempts: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.endsWith("/auth-connected"))
      attempts.push(request.url());
  });
  await page.addInitScript(
    ({ key, url }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          state: {
            indexerUrl: url,
            sharingKeyHex: null,
            userKeyHex: "f".repeat(64),
          },
          version: 2,
        }),
      );
    },
    { key: storageKey, url: fixture.url },
  );
  await page.goto("/");
  await expect(
    page.getByRole("button", { exact: true, name: "Retry connection" }),
  ).toBeVisible();
  expect(attempts).toHaveLength(1);

  const connection = endpoint.connection({
    access: fixture.share.access,
    as: fixture.actor,
  });
  const replacement = new URL(`${connection.client}/`, connection.url).href;
  await page
    .getByRole("button", { exact: true, name: "Show advanced" })
    .click();
  await page
    .getByLabel("Indexer URL (shared by both entry flows)")
    .fill(replacement);
  await page.getByRole("button", { exact: true, name: "Save" }).click();
  await expect.poll(() => attempts.length).toBe(2);
  await expect(
    page.getByRole("button", { exact: true, name: "Retry connection" }),
  ).toBeVisible();
  expect(attempts[1]).toContain(new URL(replacement).pathname);
  const storedIndexer = await page.evaluate((key) => {
    const payload = JSON.parse(localStorage.getItem(key)!) as {
      state: { indexerUrl: string };
    };
    return payload.state.indexerUrl;
  }, storageKey);
  expect(storedIndexer).toBe(replacement);
});

test("a sharing session does not reconnect a persisted account key", async ({
  fixture,
  page,
}) => {
  let attempts = 0;
  page.on("request", (request) => {
    if (request.url().endsWith("/auth-connected")) attempts++;
  });
  await page.addInitScript(
    ({ key, seed, url }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          state: {
            indexerUrl: url,
            sharingKeyHex: seed,
            userKeyHex: "f".repeat(64),
          },
          version: 2,
        }),
      );
    },
    { key: storageKey, seed: fixture.sharingSeed, url: fixture.url },
  );
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: /Long demo video.mp4/ }),
  ).toBeVisible();
  expect(attempts).toBe(0);
});
