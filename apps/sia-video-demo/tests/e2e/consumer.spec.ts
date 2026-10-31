/** Exercises the consumer's production API with its own page and exact-owned account. */
import { randomBytes } from "node:crypto";
import { expect, test } from "@playwright/test";
import {
  readE2EService,
  withDisposableAccount,
} from "@lumeweb/sia-testing/e2e/node";
import type {} from "./page";

test("decodes real shared summaries into progressive sanitized picker rows", async ({
  page,
}) => {
  const service = readE2EService(process.env);
  if (!process.env.SIA_TEST_HOST_SPKI_FILE)
    throw new Error("Explicit host SPKI file is required");
  const appID = randomBytes(32).toString("hex");
  await withDisposableAccount(
    { appID, fundTargetBytes: 67_108_864, service },
    async (account) => {
      let recorded = false;
      await page.exposeFunction(
        "recordConsumerAccount",
        async (key: string) => {
          await account.recordAccountKey(key);
          recorded = true;
        },
      );
      const errors: unknown[] = [];
      try {
        await page.goto("/");
        await expect(page.locator("#status")).toHaveText("ready");
        const responseURL = await page.evaluate(
          ({ appID, url }) => window.consumer.request(url, appID),
          { appID, url: service.indexdURL.toString() },
        );
        await account.approve(responseURL);
        await page.evaluate(() => window.consumer.register());
        await page.evaluate(() => window.consumer.waitForFunding());
        const result = await page.evaluate(() => window.consumer.run());
        expect(result.result).toEqual({
          ended: true,
          pagesRead: 2,
          rows: [{ id: result.objectID, name: "demo clip.mp4", size: 3 }],
        });
        expect(result.pages).toEqual([
          {
            end: false,
            nextOffset: 1,
            offset: 0,
            pageIndex: 0,
            rows: [{ id: result.objectID, name: "demo clip.mp4", size: 3 }],
            totalRows: 1,
          },
          {
            end: true,
            nextOffset: 1,
            offset: 1,
            pageIndex: 1,
            rows: [],
            totalRows: 1,
          },
        ]);
      } catch (error) {
        errors.push(error);
      }
      // A failed binding acknowledgement must not prevent browser cleanup.
      for (const cleanup of [
        async () => {
          if (!recorded) {
            const key = await page.evaluate(() =>
              window.consumer?.accountKey(),
            );
            if (key) await account.recordAccountKey(key);
          }
        },
        async () => {
          await page.evaluate(() => window.consumer?.close());
        },
        async () => {
          await page.evaluate(async () => {
            for (const registration of await navigator.serviceWorker.getRegistrations())
              await registration.unregister();
          });
        },
      ]) {
        try {
          await cleanup();
        } catch (error) {
          errors.push(error);
        }
      }
      if (errors.length)
        throw new AggregateError(errors, "Consumer test failed");
    },
  );
});
