/** Selectors and whole-snapshot hooks share controller lifetime without sharing subscriptions. */
import { expect, test } from "@playwright/test";

test("selectors ignore unchanged values and StrictMode releases replaced and unmounted controllers", async ({
  page,
}) => {
  await page.goto("/tests/browser/react-observation.html");
  await expect(page.getByTestId("a-subscriptions")).toHaveText("3");
  await expect(page.getByTestId("selected-app")).toHaveText("a".repeat(64));
  const selectedRenders = await page
    .getByTestId("selected-renders")
    .innerText();
  const wholeRenders = await page.getByTestId("whole-renders").innerText();
  await page.getByRole("button", { exact: true, name: "Publish" }).click();
  await expect(page.getByTestId("whole-renders")).not.toHaveText(wholeRenders);
  await expect(page.getByTestId("shared-snapshot")).toHaveText("true");
  await expect(page.getByTestId("selected-renders")).toHaveText(
    selectedRenders,
  );
  await page
    .getByRole("button", { exact: true, name: "Swap controller" })
    .click();
  await expect(page.getByTestId("selected-app")).toHaveText("b".repeat(64));
  await expect(page.getByTestId("a-subscriptions")).toHaveText("0");
  await expect(page.getByTestId("b-subscriptions")).toHaveText("3");
  await expect(page.getByTestId("shared-snapshot")).toHaveText("true");
  await page
    .getByRole("button", { exact: true, name: "Toggle observers" })
    .click();
  await expect(page.getByTestId("b-subscriptions")).toHaveText("0");
  await expect(page.getByTestId("a-disposals")).toHaveText("0");
  await expect(page.getByTestId("b-disposals")).toHaveText("0");
});

test("a mounted observer receives the owner disposal snapshot", async ({
  page,
}) => {
  await page.goto("/tests/browser/react-observation.html");
  await expect(page.getByTestId("a-subscriptions")).toHaveText("3");
  await expect(page.getByTestId("whole-phase")).toHaveText("disconnected");
  await page
    .getByRole("button", { exact: true, name: "Dispose owner" })
    .click();
  await expect(page.getByTestId("whole-phase")).toHaveText("disposed");
  await expect(page.getByTestId("shared-snapshot")).toHaveText("true");
  await expect(page.getByTestId("a-disposals")).toHaveText("1");
  await page
    .getByRole("button", { exact: true, name: "Toggle observers" })
    .click();
  await expect(page.getByTestId("a-subscriptions")).toHaveText("0");
  await expect(page.getByTestId("a-disposals")).toHaveText("1");
});
