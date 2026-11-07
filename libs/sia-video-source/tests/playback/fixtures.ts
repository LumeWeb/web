/** Browser playback owns fixture objects and contexts through the managed run API. */
import { test as playwright } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { withSiaRun } from "@lumeweb/sia-testing/node";
import { startMockServer } from "@lumeweb/sia-testing/http";
import type { MockRun } from "@lumeweb/sia-testing/mock";
import type { ActorRef, MockSia, TestObject } from "@lumeweb/sia-testing/mock";
import { mediaFixture } from "@lumeweb/sia-video-source/testing";
import type {} from "./page";
export interface Media {
  readonly actor: ActorRef;
  readonly long: TestObject;
  readonly mock: MockSia;
  readonly short: TestObject;
}
const runOptions = {
  backend: {
    app: {
      description: "Playback fixtures",
      id: "a".repeat(64),
      name: "Playback",
      serviceUrl: "https://example.invalid",
    },
    kind: "mock" as const,
  },
};
const base = playwright.extend<{ sia: MockRun }>({
  // Playwright parses fixture dependencies from destructured parameters.
  // oxlint-disable-next-line no-empty-pattern
  sia: async ({}, use) => {
    await withSiaRun(runOptions, use);
  },
});
export const test = base.extend<{ media: Media }>({
  media: async ({ sia }, use) => {
    const long = await mediaFixture("seekable-avc");
    const short = await mediaFixture("short-avc-aac");
    await use({
      actor: sia.mock.actor("video-browser"),
      long: await sia.objects.upload({
        file: long,
        metadata: new Uint8Array(),
        name: long.name,
      }),
      mock: sia.mock,
      short: await sia.objects.upload({
        file: short,
        metadata: new Uint8Array(),
        name: short.name,
      }),
    });
  },
  page: async ({ baseURL, browser, contextOptions, media, proxy, serviceWorkers, sia }, use) => {
    const endpoint = await startMockServer(sia.mock);
    try {
      const connection = endpoint.connection({ access: sia.ownerAccess, as: media.actor });
      const context = await browser.newContext({
        ...contextOptions,
        ...(baseURL === undefined ? {} : { baseURL }),
        ...(proxy === undefined ? {} : { proxy }),
        serviceWorkers,
        storageState: { cookies: [], origins: [] },
      });
      try {
        const page = await context.newPage();
        await page.addInitScript((input) => {
          window.__siaVideoTest = input;
        }, { connection, credential: connection.credential, shortId: media.short.id });
        await use(page);
      } finally {
        await context.close();
      }
    } finally {
      await endpoint.close();
    }
  },
});
test.afterEach(async ({ media, page }, info) => {
  if (info.status !== info.expectedStatus) {
    const state: unknown = await page
      .evaluate(() => window.playback.snapshot())
      .catch(() => null);
    const path = info.outputPath("playback-state.json");
    await writeFile(
      path,
      JSON.stringify({ requests: media.mock.history(), state }),
    );
    await info.attach("playback-state", {
      contentType: "application/json",
      path,
    });
  }
});
