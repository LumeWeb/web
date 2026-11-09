/** The runnable guide uses shared synthetic auth while the application owns onboarding and forms. */
import { expect, test } from "@playwright/test";

const example = "http://127.0.0.1:4174/";

for (const scenario of ["edit", "replace", "unmount"]) {
  test(`the example ignores generation after ${scenario}`, async ({ page }) => {
    await page.goto("/tests/browser/onboarding-races.html");
    await page
      .getByRole("button", { exact: true, name: "Create account" })
      .click();
    await expect(
      page.getByRole("heading", {
        exact: true,
        name: "Keep your recovery phrase",
      }),
    ).toBeVisible();
    await page
      .getByRole("button", { exact: true, name: "Generate phrase" })
      .click();
    if (scenario === "edit")
      await page
        .getByLabel("Recovery phrase", { exact: true })
        .fill("my newer input");
    if (scenario === "replace") {
      await page
        .getByRole("button", { exact: true, name: "Replace controller" })
        .click();
      await expect(page.getByTestId("controller-id")).toHaveText("replacement");
      await expect(
        page.getByLabel("Recovery phrase", { exact: true }),
      ).toHaveValue("");
    }
    if (scenario === "unmount") {
      await page
        .getByRole("button", { exact: true, name: "Hide account UI" })
        .click();
      await expect(
        page.getByLabel("Recovery phrase", { exact: true }),
      ).toHaveCount(0);
      await page
        .getByRole("button", { exact: true, name: "Show account UI" })
        .click();
    }
    await page
      .getByRole("button", { exact: true, name: "Release generated phrase" })
      .click();
    await expect(page.getByTestId("generation-released")).toHaveText(
      "released",
    );
    await expect(
      page.getByLabel("Recovery phrase", { exact: true }),
    ).toHaveValue(scenario === "edit" ? "my newer input" : "");
  });
}

test("the copied UI accepts an existing-account phrase without a new backup checkbox", async ({
  page,
}) => {
  await page.goto("/tests/browser/onboarding-races.html");
  await page
    .getByRole("button", { exact: true, name: "Connect existing account" })
    .click();
  await expect(
    page.getByRole("heading", {
      exact: true,
      name: "Enter your recovery phrase",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { exact: true, name: "Generate phrase" }),
  ).toHaveCount(0);
  await expect(page.getByLabel("I saved my recovery phrase")).toHaveCount(0);
  await page
    .getByLabel("Recovery phrase", { exact: true })
    .fill("existing fixture phrase");
  await page
    .getByRole("button", { exact: true, name: "Connect account" })
    .click();
  await expect(
    page.getByRole("heading", { exact: true, name: "Set up your profile" }),
  ).toBeVisible();
});

test("persisted pagehide keeps its controller and UI", async ({ page }) => {
  await page.goto(example);
  await expect(
    page.getByRole("heading", { exact: true, name: "Connect your account" }),
  ).toBeVisible();
  await page.evaluate(() =>
    window.dispatchEvent(
      new PageTransitionEvent("pagehide", { persisted: true }),
    ),
  );
  await expect(
    page.getByRole("heading", { exact: true, name: "Connect your account" }),
  ).toBeVisible();
  await page
    .getByRole("button", { exact: true, name: "Create account" })
    .click();
  await expect(
    page.getByRole("heading", {
      exact: true,
      name: "Approve this application",
    }),
  ).toBeVisible();
});

test("the example ignores validation after an edit", async ({ page }) => {
  await page.goto("/tests/browser/onboarding-races.html");
  await page
    .getByRole("button", { exact: true, name: "Create account" })
    .click();
  await page
    .getByRole("button", { exact: true, name: "Hold validation" })
    .click();
  await page
    .getByLabel("Recovery phrase", { exact: true })
    .fill("submitted input");
  await page.getByLabel("I saved my recovery phrase").check();
  await page
    .getByRole("button", { exact: true, name: "Finish account setup" })
    .click();
  await expect(page.getByTestId("access-phase")).toHaveAttribute(
    "data-phase",
    "validating-phrase",
  );
  await page
    .getByLabel("Recovery phrase", { exact: true })
    .fill("my corrected input");
  await page
    .getByRole("button", { exact: true, name: "Release validation" })
    .click();
  await expect(page.getByTestId("access-phase")).toHaveAttribute(
    "data-phase",
    "recovery-phrase",
  );
  await expect(page.getByLabel("Recovery phrase", { exact: true })).toHaveValue(
    "my corrected input",
  );
  await expect(page.getByRole("alert")).toHaveCount(0);
});

async function approveAndFill(page: import("@playwright/test").Page) {
  await page
    .getByRole("button", { exact: true, name: "Create account" })
    .click();
  await page
    .getByRole("button", { exact: true, name: "Allow connection" })
    .click();
  await page
    .getByRole("button", { exact: true, name: "Generate phrase" })
    .click();
  await expect(
    page.getByLabel("Recovery phrase", { exact: true }),
  ).not.toHaveValue("");
  await page.getByRole("button", { exact: true, name: "Show phrase" }).click();
  await expect(
    page.getByLabel("Recovery phrase", { exact: true }),
  ).toHaveAttribute("type", "text");
  await page.getByRole("button", { exact: true, name: "Hide phrase" }).click();
  await expect(
    page.getByLabel("Recovery phrase", { exact: true }),
  ).toHaveAttribute("type", "password");
  await page.getByLabel("I saved my recovery phrase").check();
}

test("a new user finishes onboarding and signs in again with saved access", async ({
  page,
}) => {
  await page.goto(example);
  await expect(
    page.getByRole("heading", { exact: true, name: "Connect your account" }),
  ).toBeVisible();
  await page
    .getByRole("button", { exact: true, name: "Sign in again" })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "There's no saved sign-in",
  );
  await approveAndFill(page);
  await page
    .getByRole("button", { exact: true, name: "Finish account setup" })
    .click();
  await expect(
    page.getByRole("heading", { exact: true, name: "Set up your profile" }),
  ).toBeVisible();
  await page.getByLabel("Display name").fill("Ada");
  await page
    .getByRole("button", { exact: true, name: "Continue to workspace" })
    .click();
  await expect(
    page.getByRole("heading", { exact: true, name: "Welcome, Ada" }),
  ).toBeVisible();
  await page
    .getByRole("button", { exact: true, name: "Check connection" })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Your account is connected.",
  );
  await page.getByRole("button", { exact: true, name: "Sign out" }).click();
  await page
    .getByRole("button", { exact: true, name: "Sign in again" })
    .click();
  await expect(
    page.getByRole("heading", { exact: true, name: "Welcome, Ada" }),
  ).toBeVisible();
});

test("invalid phrase input stays editable and can be corrected", async ({
  page,
}) => {
  await page.goto(example);
  await page
    .getByRole("button", { exact: true, name: "Create account" })
    .click();
  await page
    .getByRole("button", { exact: true, name: "Allow connection" })
    .click();
  await page
    .getByLabel("Recovery phrase", { exact: true })
    .fill("not a recovery phrase");
  await page.getByLabel("I saved my recovery phrase").check();
  await page
    .getByRole("button", { exact: true, name: "Finish account setup" })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "This phrase isn't valid",
  );
  await expect(page.getByLabel("Recovery phrase", { exact: true })).toHaveValue(
    "not a recovery phrase",
  );
  await page
    .getByRole("button", { exact: true, name: "Generate phrase" })
    .click();
  await page.getByLabel("I saved my recovery phrase").check();
  await page
    .getByRole("button", { exact: true, name: "Finish account setup" })
    .click();
  await expect(
    page.getByRole("heading", { exact: true, name: "Set up your profile" }),
  ).toBeVisible();
});

for (const recovery of ["Try saving again", "Continue anyway"]) {
  test(`a user can recover a failed save with ${recovery} without registering twice`, async ({
    page,
  }) => {
    let registrations = 0;
    page.on("request", (request) => {
      if (new URL(request.url()).pathname.endsWith("/auth-register"))
        registrations++;
    });
    await page.goto(example);
    await page
      .getByRole("button", { exact: true, name: "Simulate a save error" })
      .click();
    await approveAndFill(page);
    await page
      .getByRole("button", { exact: true, name: "Finish account setup" })
      .click();
    await expect(
      page.getByRole("heading", { exact: true, name: "Save this sign-in" }),
    ).toBeVisible();
    await expect(page.getByTestId("access-phase")).toHaveText(
      "Saving needs attention",
    );
    await page.getByRole("button", { exact: true, name: recovery }).click();
    await expect(
      page.getByRole("heading", { exact: true, name: "Set up your profile" }),
    ).toBeVisible();
    expect(registrations).toBe(1);
    if (recovery.startsWith("Continue")) {
      await expect(
        page.getByText(
          "Saving wasn't confirmed. Keep your recovery phrase for your next sign-in.",
          { exact: true },
        ),
      ).toBeVisible();
    }
  });
}

test("denial and cancellation return to account choices", async ({ page }) => {
  await page.goto(example);
  await page
    .getByRole("button", { exact: true, name: "Create account" })
    .click();
  await page.getByRole("button", { exact: true, name: "Decline" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "The connection wasn't approved",
  );
  await page.getByRole("button", { exact: true, name: "Start again" }).click();
  await page
    .getByRole("button", { exact: true, name: "Create account" })
    .click();
  await page
    .getByRole("button", { exact: true, name: "Cancel connection" })
    .click();
  await expect(
    page.getByRole("heading", { exact: true, name: "Connect your account" }),
  ).toBeVisible();
});
