/** Browser playback owns fixture objects and contexts through the managed run API. */
import { writeFile } from "node:fs/promises";
import { createSiaTest } from "@lumeweb/sia-testing/playwright";
import type { ActorRef, MockSia, TestObject } from "@lumeweb/sia-testing/mock";
import { mediaFixture } from "@lumeweb/sia-video-source/testing";
import type {} from "./page";
export interface Media {
  readonly actor: ActorRef;
  readonly long: TestObject;
  readonly mock: MockSia;
  readonly short: TestObject;
}
const base = createSiaTest({
  backend: {
    app: {
      description: "Playback fixtures",
      id: "a".repeat(64),
      name: "Playback",
      serviceUrl: "https://example.invalid",
    },
    kind: "mock",
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
  page: async ({ media, sia }, use) => {
    const page = await sia.browser.open({
      access: sia.ownerAccess,
      async apply(page, data) {
        await page.addInitScript(
          (input) => {
            window.__siaVideoTest = input;
          },
          {
            connection: data.backend.connection,
            credential: data.backend.credential,
            shortId: media.short.id,
          },
        );
      },
      mockActor: media.actor,
    });
    await use(page);
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
