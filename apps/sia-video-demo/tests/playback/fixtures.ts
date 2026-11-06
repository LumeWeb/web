/** The demo UI and worker read the same run-owned objects with the supplied recipient credential. */
import { writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { type Page } from "@playwright/test";
import { createSiaTest } from "@lumeweb/sia-testing/playwright";
import {
  type ActorRef,
  type MockSia,
  type TestObject,
  type TestShare,
} from "@lumeweb/sia-testing/mock";
import { mediaFixture } from "@lumeweb/sia-video-source/testing";
import { APP_DESCRIPTION, APP_ID, APP_NAME } from "../../src/lib/constants";
export interface Fixture {
  readonly actor: ActorRef;
  readonly longId: string;
  readonly mock: MockSia;
  readonly object: TestObject;
  readonly share: TestShare;
  sharingSeed: string;
  url: string;
}
interface Egress {
  connections(): number;
  readonly url: string;
}
const base = createSiaTest({
  backend: {
    app: {
      description: APP_DESCRIPTION,
      id: APP_ID,
      name: APP_NAME,
      serviceUrl: "https://example.invalid",
    },
    kind: "mock",
  },
  limits: { maxObjects: 24 },
});
export const test = base.extend<{ egress: Egress; fixture: Fixture }>({
  // Playwright requires destructured parameters for fixtures without dependencies.
  // oxlint-disable-next-line no-empty-pattern
  egress: async ({}, use) => {
    let connections = 0;
    const server = createServer((socket) => {
      connections++;
      socket.destroy();
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("The rejecting proxy has no TCP address");
    try {
      await use({
        connections: () => connections,
        url: `http://127.0.0.1:${address.port}`,
      });
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }
  },
  fixture: async ({ sia }, use) => {
    const file = await mediaFixture("seekable-avc");
    const object = await sia.objects.upload({
      file,
      metadata: new TextEncoder().encode(
        JSON.stringify({
          filename: "Long demo video.mp4",
          type: "sialo-object-meta",
          version: 1,
        }),
      ),
      name: file.name,
    });
    const share = await sia.shares.create({ objects: [object] });
    await use({
      actor: sia.mock.actor("demo-browser"),
      longId: object.id,
      mock: sia.mock,
      object,
      share,
      sharingSeed: "",
      url: "",
    });
  },
  page: async ({ fixture, sia }, use) => {
    const page = await sia.browser.open({
      access: fixture.share.access,
      async apply(page, data) {
        const backend = data.backend;
        fixture.url = new URL(
          `${backend.connection.client}/`,
          backend.connection.url,
        ).href;
        fixture.sharingSeed = backend.credential.keyHex;
        await page.addInitScript((credential) => {
          window.__siaDemoTest = { credential };
        }, backend.credential);
      },
      mockActor: fixture.actor,
    });
    await use(page);
  },
  // Firefox keeps intercepted worker fetches alive after termination. A proxy
  // rejects remote traffic while loopback payloads retain native cancellation.
  proxy: async ({ egress }, use) => {
    await use({ bypass: "127.0.0.1,localhost", server: egress.url });
  },
});
export async function openDemo(page: Page, fixture: Fixture, disableNativePlayback = true) {
  await page.goto("/");
  await page
    .getByRole("button", { exact: true, name: "Show advanced" })
    .click();
  await page
    .getByLabel("Indexer URL (shared by both entry flows)")
    .fill(fixture.url);
  await page.getByRole("button", { exact: true, name: "Save" }).click();
  await page
    .getByRole("button", { exact: true, name: "Show developer tools" })
    .click();
  await page
    .getByLabel("Disable native (service-worker) playback", { exact: true })
    .setChecked(disableNativePlayback);
}
export async function openShare(page: Page, fixture: Fixture, disableNativePlayback = true) {
  await openDemo(page, fixture, disableNativePlayback);
  await page
    .getByLabel("Sharing link or key", { exact: true })
    .fill(fixture.sharingSeed);
  await page.getByRole("button", { exact: true, name: "Apply" }).click();
}
test.afterEach(async ({ fixture, page }, info) => {
  if (info.status !== info.expectedStatus) {
    const state = await page
      .locator("video")
      .evaluateAll((videos: HTMLVideoElement[]) =>
        videos.map((video) => ({
          currentTime: video.currentTime,
          error: video.error?.code,
          frames: video.getVideoPlaybackQuality().totalVideoFrames,
          paused: video.paused,
          readyState: video.readyState,
        })),
      )
      .catch(() => []);
    const path = info.outputPath("demo-playback-state.json");
    await writeFile(
      path,
      JSON.stringify({
        requests: fixture.mock.history(),
        state,
        workers: page.workers().map((worker) => worker.url()),
      }),
    );
    await info.attach("demo-playback-state", {
      contentType: "application/json",
      path,
    });
  }
});
