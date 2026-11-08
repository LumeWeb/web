/** Playwright owns browser contexts; managed Sia runs outlive their HTTP connections. */
import { expect, test as playwright } from "@playwright/test";
import { withSiaRun } from "@lumeweb/sia-testing/node";
import type { MockRun } from "@lumeweb/sia-testing/node";
import { startMockServer } from "@lumeweb/sia-testing/http";

interface AccessFixtures {
  readonly sia: MockRun;
}
const app = {
  description: "Synthetic browser checks",
  id: "a".repeat(64),
  name: "Browser access",
  serviceUrl: "https://app.test",
};

export const test = playwright.extend<AccessFixtures>({
  context: async ({ baseURL, context, sia }, provide) => {
    if (!baseURL) throw new Error("Browser fixtures require a base URL");
    const endpoint = await startMockServer(sia.mock, {
      allowedOrigins: [new URL(baseURL).origin],
    });
    try {
      await context.addInitScript(
        (input) => Object.assign(window, { fixtureInput: input }),
        {
          owner: endpoint.connection({
            access: sia.ownerAccess,
            as: sia.mock.actor("application"),
          }),
          phrase: sia.auth.fixturePhrase,
          registration: endpoint.connection({
            access: sia.auth.registrationAccess,
            as: sia.mock.actor("browser"),
          }),
        },
      );
      await provide(context);
    } finally {
      // Closing the endpoint first would leave browser requests racing run cleanup.
      try {
        await context.close();
      } finally {
        await endpoint.close();
      }
    }
  },
  // Playwright reads fixture dependencies from destructured parameters.
  // oxlint-disable-next-line no-empty-pattern
  sia: async ({}, provide) => {
    const result = await withSiaRun(
      { backend: { app, kind: "mock" } },
      provide,
    );
    expect(result.summary.cleanup).toBe("clean");
  },
});
