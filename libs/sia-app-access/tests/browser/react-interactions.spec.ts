/** Deferred controller ports exercise app-owned forms without native authorization. */
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
interface Probe {
  counts(): { generationCalls: number; registrations: number };
  delayValidation(): void;
  hide(): void;
  invalid(): void;
  mismatch(): void;
  replace(): Promise<void>;
  resolveGeneration(): void;
  restart(): Promise<void>;
  show(): void;
  start(): Promise<void>;
}
declare global {
  interface Window {
    interactionProbe: Probe;
  }
}
async function open(page: Page) {
  await page.goto("/tests/browser/react-interactions.html");
  await page.evaluate(() => window.interactionProbe.start());
  await expect(page.getByLabel("settings", { exact: true })).toBeVisible();
}
test("application forms retain their own values across Sia restart", async ({
  page,
}) => {
  await open(page);
  await page.getByLabel("settings", { exact: true }).fill("local input");
  await page.getByLabel("dialog", { exact: true }).fill("custom input");
  await page.evaluate(() => window.interactionProbe.restart());
  await expect(page.getByLabel("settings", { exact: true })).toHaveValue(
    "local input",
  );
  await expect(page.getByLabel("dialog", { exact: true })).toHaveValue(
    "custom input",
  );
});
test("invalid and mismatch correction keep input and correlate only to its submitting observer", async ({
  page,
}) => {
  await open(page);
  const field = page.getByLabel("dialog", { exact: true });
  await field.fill("bad");
  await page
    .getByRole("button", { exact: true, name: "Submit dialog" })
    .click();
  await expect(page.getByTestId("dialog-issue")).toHaveText(
    "Enter a valid recovery phrase.",
  );
  await expect(page.getByTestId("settings-issue")).toBeEmpty();
  await expect(field).toHaveValue("bad");
  await page.evaluate(() => window.interactionProbe.mismatch());
  await field.fill("other");
  await page
    .getByRole("button", { exact: true, name: "Submit dialog" })
    .click();
  await expect(page.getByTestId("dialog-issue")).toHaveText(
    "Use the recovery phrase for this account.",
  );
  await expect(field).toHaveValue("other");
  expect(
    await page.evaluate(() => window.interactionProbe.counts().registrations),
  ).toBe(0);
});
test("unmounting a form does not cancel another observer or controller work", async ({
  page,
}) => {
  await open(page);
  await page
    .getByRole("button", { exact: true, name: "Generate settings" })
    .click();
  await page.evaluate(() => window.interactionProbe.hide());
  await page.evaluate(() => window.interactionProbe.resolveGeneration());
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByLabel("settings", { exact: true })).toHaveValue(
    "generated private phrase",
  );
  await expect(page.getByTestId("phase")).toHaveText("recovery-phrase");
});

// Wait past promise settlement and React's resulting paint before negative assertions.
async function settleForm(page: Page, kind: "generation" | "validation") {
  await page.evaluate(async (kind) => {
    if (kind === "generation") window.interactionProbe.resolveGeneration();
    else window.interactionProbe.invalid();
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  }, kind);
}
for (const form of ["settings", "dialog"]) {
  for (const editBack of [false, true]) {
    test(`deferred generation preserves ${form} input after ${editBack ? "edit away and back" : "editing"}`, async ({
      page,
    }) => {
      await open(page);
      const field = page.getByLabel(form, { exact: true });
      await field.fill("original input");
      await page
        .getByRole("button", { exact: true, name: `Generate ${form}` })
        .click();
      expect(
        await page.evaluate(
          () => window.interactionProbe.counts().generationCalls,
        ),
      ).toBe(1);
      await field.fill("edited input");
      if (editBack) await field.fill("original input");
      await settleForm(page, "generation");
      await expect(field).toHaveValue(
        editBack ? "original input" : "edited input",
      );
    });
    test(`deferred validation does not apply old ${form} errors after ${editBack ? "edit away and back" : "editing"}`, async ({
      page,
    }) => {
      await open(page);
      await page.evaluate(() => window.interactionProbe.delayValidation());
      const field = page.getByLabel(form, { exact: true });
      await field.fill("original input");
      await page
        .getByRole("button", { exact: true, name: `Submit ${form}` })
        .click();
      // Busy presentation proves the asynchronous command was admitted before editing.
      await expect(
        page.getByRole("button", { exact: true, name: `Submit ${form}` }),
      ).toBeDisabled();
      await field.fill("edited input");
      if (editBack) await field.fill("original input");
      await settleForm(page, "validation");
      await expect(
        page.getByRole("button", { exact: true, name: `Submit ${form}` }),
      ).toBeEnabled();
      await expect(page.getByTestId(`${form}-issue`)).toBeEmpty();
      await expect(field).toHaveValue(
        editBack ? "original input" : "edited input",
      );
    });
  }
  for (const kind of ["generation", "validation"] as const) {
    test(`observer replacement ignores deferred ${kind} in ${form}`, async ({
      page,
    }) => {
      await open(page);
      if (kind === "validation")
        await page.evaluate(() => window.interactionProbe.delayValidation());
      const field = page.getByLabel(form, { exact: true });
      await field.fill("original input");
      await page
        .getByRole("button", {
          exact: true,
          name: `${kind === "generation" ? "Generate" : "Submit"} ${form}`,
        })
        .click();
      if (kind === "validation")
        await expect(
          page.getByRole("button", { exact: true, name: `Submit ${form}` }),
        ).toBeDisabled();
      if (kind === "generation")
        expect(
          await page.evaluate(
            () => window.interactionProbe.counts().generationCalls,
          ),
        ).toBe(1);
      await page.evaluate(() => window.interactionProbe.replace());
      await settleForm(page, kind);
      if (kind === "validation")
        await expect(
          page.getByRole("button", { exact: true, name: `Submit ${form}` }),
        ).toBeEnabled();
      await expect(field).toHaveValue("original input");
      await expect(page.getByTestId(`${form}-issue`)).toBeEmpty();
    });
  }
}

for (const kind of ["generation", "validation"] as const) {
  test(`unmounted dialog ignores deferred ${kind} after remount`, async ({
    page,
  }) => {
    await open(page);
    if (kind === "validation")
      await page.evaluate(() => window.interactionProbe.delayValidation());
    await page.getByLabel("dialog", { exact: true }).fill("old input");
    await page
      .getByRole("button", {
        exact: true,
        name: `${kind === "generation" ? "Generate" : "Submit"} dialog`,
      })
      .click();
    await page.evaluate(() => window.interactionProbe.hide());
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.evaluate(() => window.interactionProbe.show());
    await page.getByLabel("dialog", { exact: true }).fill("new dialog input");
    await settleForm(page, kind);
    await expect(page.getByLabel("dialog", { exact: true })).toHaveValue(
      "new dialog input",
    );
    await expect(page.getByTestId("dialog-issue")).toBeEmpty();
  });
  for (const form of ["settings", "dialog"]) {
    test(`restarted interaction ignores deferred ${kind} in ${form}`, async ({
      page,
    }) => {
      await open(page);
      if (kind === "validation")
        await page.evaluate(() => window.interactionProbe.delayValidation());
      await page.getByLabel(form, { exact: true }).fill("original input");
      await page
        .getByRole("button", {
          exact: true,
          name: `${kind === "generation" ? "Generate" : "Submit"} ${form}`,
        })
        .click();
      await page.evaluate(() => window.interactionProbe.restart());
      await settleForm(page, kind);
      await expect(page.getByLabel(form, { exact: true })).toHaveValue(
        "original input",
      );
      await expect(page.getByTestId(`${form}-issue`)).toBeEmpty();
    });
  }
}
for (const form of ["settings", "dialog"]) {
  test(`current generation populates ${form} input`, async ({ page }) => {
    await open(page);
    await page
      .getByRole("button", { exact: true, name: `Generate ${form}` })
      .click();
    await settleForm(page, "generation");
    await expect(page.getByLabel(form, { exact: true })).toHaveValue(
      "generated private phrase",
    );
  });
}
