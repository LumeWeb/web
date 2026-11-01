/** Exercises the consumer's production API with its own page and exact-owned account. */
import { randomBytes } from "node:crypto";
import { expect, test } from "@playwright/test";
import {
  readE2EService,
  withDisposableAccount,
} from "@lumeweb/sia-testing/e2e/node";
import type {} from "./page";

test("serves an explicit shared source through the library stream service", async ({
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
        expect(result.available).toBe(true);
        expect(result.source).toEqual({
          objectKey: result.objectID,
          shared: true,
        });
        expect(result.status).toBe(206);
        expect(result.contentRange).toBe("bytes 2-4/8");
        expect(result.bytes).toEqual([2, 3, 4]);
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
