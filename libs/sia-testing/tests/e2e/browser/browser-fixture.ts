import { withCleanup } from "../../../src/e2e/internal/lifecycle.mjs";
import { readE2EService, withDisposableAccount } from "../../../src/e2e/node.js";
/** Funds a separate disposable account per payload test; only realPage adds an uploaded fixture. */
import { randomBytes } from "node:crypto";
import { test as base, expect, type Page } from "@playwright/test";
import type {} from "./bridge.js";


export const test = base.extend<{ fundedPage: Page; realPage: Page }>({
  fundedPage: async ({ page }, use) => {
    const service = readE2EService(process.env);
    const indexd = service.indexdURL.toString();
    const appID = randomBytes(32).toString("hex");
    await withDisposableAccount({ appID, fundTargetBytes: 67_108_864, service }, async (account) => {
      let recorded = false;
      await withCleanup(async () => {
        await page.goto("/real-probe.html");
        await expect(page.locator("#status")).toHaveText("ready");
        const responseURL = await page.evaluate(
          ({ appID, indexd }) => window.probe.request(indexd, appID),
          { appID, indexd },
        );
        await account.approve(responseURL);
        const key = await page.evaluate(() => window.probe.connect());
        await account.recordAccountKey(key);
        recorded = true;
        await page.evaluate(() => window.probe.waitReady());
        await use(page);
      }, [
        async () => {
          if (!recorded) {
            const key = await page.evaluate(() => window.probe.accountKey());
            if (key) await account.recordAccountKey(key);
          }
        },
        async () => { await page.evaluate(() => window.probe.close()); },
        async () => {
          await page.evaluate(async () => {
            await Promise.all((await navigator.serviceWorker.getRegistrations()).map((registration) => registration.unregister()));
          });
        },
      ]);
    });
  },
  realPage: async ({ fundedPage }, use) => {
    await fundedPage.evaluate(() => window.probe.upload());
    await use(fundedPage);
  },
});

/** Registration stays in the scenario so host-RPC observations can include the
 * registration itself; cleanup still reads the key after a partial failure.
 */
export async function withPeerAccount(
  page: Page,
  options: { appID?: string; fundTargetBytes: number },
  use: (peer: {
    appID: string;
    quotaKey: string;
    register: () => Promise<string>;
    waitReady: () => Promise<void>;
  }) => Promise<void>,
) {
  const service = readE2EService(process.env);
  const appID = options.appID ?? randomBytes(32).toString("hex");
  await withDisposableAccount({ appID, fundTargetBytes: options.fundTargetBytes, service }, async (account) => {
    let recorded = false;
    await withCleanup(async () => {
      const responseURL = await page.evaluate((id) => window.probe.requestPeer(id), appID);
      await account.approve(responseURL);
      await use({
        appID, quotaKey: account.quotaKey,
        async register() {
          const key = await page.evaluate(() => window.probe.registerPeer());
          await account.recordAccountKey(key);
          recorded = true;
          return key;
        },
        async waitReady() { await page.evaluate(() => window.probe.waitPeerReady()); },
      });
    }, [
      async () => {
        if (!recorded) {
          const key = await page.evaluate(() => window.probe.peerAccountKey());
          if (key) await account.recordAccountKey(key);
        }
      },
      async () => { await page.evaluate(() => window.probe.closePeer()); },
    ]);
  });
}

export { expect };
