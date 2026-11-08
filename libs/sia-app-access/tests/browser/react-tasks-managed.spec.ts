/** Both application layouts use the same tasks over shared synthetic auth. */
import { expect } from "@playwright/test";
import { test } from "./fixtures.ts";
test("inline settings and custom dialog share approval, phrase and save recovery behavior", async ({
  page,
  sia,
}) => {
  await page.goto("/tests/browser/react-interactions.html");
  await page.getByRole("button", { exact: true, name: "Start access" }).click();
  await expect(page.getByTestId("phase")).toHaveText("awaiting-approval");
  await sia.auth.approve(await page.getByTestId("approval").innerText());
  await page.getByLabel("dialog", { exact: true }).fill("bad");
  await page
    .getByRole("button", { exact: true, name: "Submit dialog" })
    .click();
  await expect(page.getByTestId("dialog-issue")).toHaveText(
    "Enter a valid recovery phrase.",
  );
  await page.getByLabel("dialog", { exact: true }).fill(sia.auth.fixturePhrase);
  await page
    .getByRole("button", { exact: true, name: "Submit dialog" })
    .click();
  await expect(page.getByTestId("phase")).toHaveText("failed");
  const settings = page.getByRole("region", { name: "Inline settings" });
  await expect(settings.getByTestId("effects")).toContainText("registered");
  await settings
    .getByRole("button", { exact: true, name: "Retry saving" })
    .click();
  await expect(page.getByTestId("phase")).toHaveText("ready");
});
