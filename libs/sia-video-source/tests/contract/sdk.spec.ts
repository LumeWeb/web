/** Separates real SDK/host compatibility from the HTTP-mock playback acceptance suite. */
import { expect, test } from "@playwright/test";
import { isSharedObjectDenial } from "./denial.ts";
import { contract } from "./settings.ts";
import type { ContractResult } from "./page.ts";

test("registered app and shared fixtures stream, decode and seek through the real SDK", async ({
  page,
}) => {
  let denied = false;
  page.on("response", (response) => {
    if (
      isSharedObjectDenial(
        {
          method: response.request().method(),
          status: response.status(),
          url: response.url(),
        },
        contract.indexerUrl,
        contract.app.objectId,
      )
    )
      denied = true;
  });
  await page.goto("/");
  await expect(page.locator("#status")).toHaveText("ready");
  // Browser failures return a fixed phase instead of serializing SDK exceptions.
  const result: ContractResult = await page.evaluate(
    (config) => window.sdkContract.run(config),
    contract,
  );
  expect(result.ok, `Compatibility failed during ${result.phase}`).toBe(true);
  await expect.poll(() => denied, { timeout: 1000 }).toBe(true);
});
