/** Managed bindings keep browser contexts and synthetic auth outside application control. */
import { expect } from "@playwright/test";
import { test } from "./fixtures.ts";
for (const mode of ["plain", "react"]) {
  for (const recovery of ["retry", "continue"]) {
    test(`${mode} controls correct input, recover saving with ${recovery}, and reconnect after remounting`, async ({
      page,
      sia,
    }) => {
      await page.goto(`/tests/browser/fixture.html?mode=${mode}`);
      const phase = page.getByTestId("phase");
      await expect(phase).toHaveText("disconnected");
      await page
        .getByRole("button", { exact: true, name: "Authorize" })
        .click();
      await expect(phase).toHaveText("awaiting-approval");
      await sia.auth.deny(await page.getByTestId("approval").innerText());
      await expect(phase).toHaveText("failed");
      await page
        .getByRole("button", { exact: true, name: "Authorize" })
        .click();
      await expect(phase).toHaveText("awaiting-approval");
      await page.getByRole("button", { exact: true, name: "Cancel" }).click();
      await expect(phase).toHaveText("disconnected");
      await page
        .getByRole("button", { exact: true, name: "Authorize" })
        .click();
      await expect(phase).toHaveText("awaiting-approval");
      await sia.auth.approve(await page.getByTestId("approval").innerText());
      await expect(phase).toHaveText("recovery-phrase");
      await page.getByLabel("Phrase").fill("incorrect");
      await page.getByRole("button", { exact: true, name: "Submit" }).click();
      await expect(page.getByTestId("result")).toHaveText("invalid-phrase");
      await page.getByLabel("Phrase").fill(sia.auth.fixturePhrase);
      await page.getByRole("button", { exact: true, name: "Submit" }).click();
      await expect(page.getByTestId("result")).toHaveText("failed");
      await page
        .getByRole("button", {
          exact: true,
          name: recovery === "retry" ? "Retry" : "Continue",
        })
        .click();
      await expect(phase).toHaveText("ready");
      await expect(page.getByTestId("confirmation")).toHaveText(
        recovery === "retry" ? "confirmed" : "unconfirmed",
      );
      await page.getByRole("button", { exact: true, name: "Work" }).click();
      await expect(page.getByTestId("result")).toHaveText("pinned");
      await page.getByRole("button", { exact: true, name: "Remount" }).click();
      await expect(phase).toHaveText("ready");
      await page.getByRole("button", { exact: true, name: "Work" }).click();
      await expect(page.getByTestId("result")).toHaveText("pinned");
      await page
        .getByRole("button", { exact: true, name: "Disconnect" })
        .click();
      await expect(phase).toHaveText("disconnected");
      await page
        .getByRole("button", { exact: true, name: "Reconnect" })
        .click();
      await expect(phase).toHaveText("ready");
      await page.getByRole("button", { exact: true, name: "Forget" }).click();
      await expect(phase).toHaveText("disconnected");
      await page
        .getByRole("button", { exact: true, name: "Reconnect" })
        .click();
      await expect(page.getByTestId("result")).toHaveText(
        "missing-credentials",
      );
      await expect(phase).toHaveText("disconnected");
      if (mode === "react")
        await expect(page.getByTestId("stable")).toHaveText("true");
    });
  }
}
