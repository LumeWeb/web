import { expect, test } from "@playwright/test";
for (const contextual of [false, true]) {
  test(`descendant mount effects precede passive activation through ${contextual ? "context" : "direct"} tasks`, async ({
    page,
  }) => {
    await page.goto("/tests/browser/react-task-hydration.html");
    const result = await page.evaluate(
      (contextual) => window.taskActivation.activation(contextual),
      contextual,
    );
    expect(result).toEqual({
      after: { kind: "generated", phrase: "generated after activation" },
      before: 0,
      enabled: true,
      generated: 1,
      layout: { kind: "unavailable" },
      passive: { kind: "unavailable" },
    });
  });
}
for (const kind of ["approval", "phrase", "save"]) {
  for (const contextual of [false, true]) {
    test(`StrictMode hydration retires ${kind} server closures through ${contextual ? "context" : "direct"} tasks`, async ({
      page,
    }) => {
      await page.goto("/tests/browser/react-task-hydration.html");
      const result = await page.evaluate(
        async ({ contextual, kind }) => {
          const probe = window.taskHydration;
          return probe.run(kind, contextual);
        },
        { contextual, kind },
      );
      expect(result).toBe("PASS");
    });
  }
}

test("live phrase tasks forward original promises and semantic outcomes without form writes", async ({
  page,
}) => {
  await page.goto("/tests/browser/react-task-hydration.html");
  expect(
    await page.evaluate(async () => {
      const probe = window.taskHydration;
      return probe.correlation();
    }),
  ).toBe("PASS");
});

for (const action of [
  "approval.cancel",
  "phrase.cancel",
  "phrase.generate",
  "phrase.submit",
  "save.cancel",
  "save.retry",
  "save.continue",
]) {
  for (const contextual of [false, true]) {
    test(`replacement layout rejects stale ${action} through ${contextual ? "context" : "direct"} tasks`, async ({
      page,
    }) => {
      await page.goto("/tests/browser/react-task-hydration.html");
      const result = await page.evaluate(
        async ({ action, contextual }) => {
          const probe = window.taskReplacement;
          return probe.replacement(action, contextual);
        },
        { action, contextual },
      );
      expect(result).toMatchObject({
        generated: 0,
        registrations: 0,
        unchanged: true,
        writes: 0,
      });
      if (!action.endsWith("cancel"))
        expect(result.outcome).toEqual({ kind: "unavailable" });
    });
  }
}
