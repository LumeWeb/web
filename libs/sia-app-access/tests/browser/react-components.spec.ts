/** Headless views expose bound actions and never claim application controller ownership. */
import { expect, test } from "@playwright/test";

test("application controls supply markup and styling while views observe one controller", async ({
  page,
}) => {
  await page.goto("/tests/browser/react-components.html");
  await expect(page.getByTestId("reconnects")).toHaveText("0");
  await expect(page.getByTestId("disposals")).toHaveText("0");
  await expect(
    page.getByTestId("views").locator(":scope > article"),
  ).toHaveCount(2);
  const direct = page.getByRole("button", {
    exact: true,
    name: "Reconnect direct",
  });
  await expect(direct).toHaveClass("application-button");
  await expect(direct).toHaveCSS("color", "rgb(128, 0, 128)");
  await direct.click();
  await expect(page.getByTestId("direct-outcome")).toHaveText(
    "missing-credentials",
  );
  await page
    .getByRole("button", { exact: true, name: "Reconnect context" })
    .click();
  await expect(page.getByTestId("context-outcome")).toHaveText(
    "missing-credentials",
  );
  await expect(page.getByTestId("reconnects")).toHaveText("2");
  await page.getByRole("button", { exact: true, name: "Toggle views" }).click();
  await expect(page.getByTestId("views")).toBeEmpty();
  await expect(page.getByTestId("disposals")).toHaveText("0");
  await page.getByRole("button", { exact: true, name: "Toggle views" }).click();
  await expect(page.getByTestId("reconnects")).toHaveText("2");
  await page
    .getByRole("button", { exact: true, name: "Dispose owner" })
    .click();
  await expect(page.getByTestId("direct-phase")).toHaveText("disposed");
  await expect(page.getByTestId("context-phase")).toHaveText("disposed");
  await expect(page.getByTestId("disposals")).toHaveText("1");
});
