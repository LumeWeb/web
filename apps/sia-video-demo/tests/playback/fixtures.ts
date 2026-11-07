/** The demo UI and worker read the same run-owned objects with the supplied recipient credential. */
import { writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { type Page, test as playwright } from "@playwright/test";
import { withSiaRun } from "@lumeweb/sia-testing/node";
import { startMockServer } from "@lumeweb/sia-testing/http";
import type { MockRun } from "@lumeweb/sia-testing/mock";
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
const runOptions = {
  backend: {
    app: {
      description: APP_DESCRIPTION,
      id: APP_ID,
      name: APP_NAME,
      serviceUrl: "https://example.invalid",
    },
    kind: "mock" as const,
  },
  limits: { maxObjects: 24 },
};
const base = playwright.extend<{ endpoint: Awaited<ReturnType<typeof startMockServer>>; sia: MockRun }>({
  context: async ({ baseURL, browser, contextOptions, endpoint, proxy, serviceWorkers }, use) => {
    // The endpoint dependency keeps HTTP available until this context closes.
    void endpoint;
    const context = await browser.newContext({
      ...contextOptions,
      ...(baseURL === undefined ? {} : { baseURL }),
      ...(proxy === undefined ? {} : { proxy }),
      serviceWorkers,
      storageState: { cookies: [], origins: [] },
    });
    try { await use(context); } finally { await context.close(); }
  },
  endpoint: async ({ sia }, use) => {
    const endpoint = await startMockServer(sia.mock);
    try { await use(endpoint); } finally { await endpoint.close(); }
  },
  // Playwright parses fixture dependencies from destructured parameters.
  // oxlint-disable-next-line no-empty-pattern
  sia: async ({}, use) => {
    await withSiaRun(runOptions, use);
  },
});
export const test = base.extend<{ egress: Egress; fixture: Fixture; registration: { page: Page; url: string } }>({
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
  page: async ({ context, endpoint, fixture }, use) => {
    const connection = endpoint.connection({ access: fixture.share.access, as: fixture.actor });
    const page = await context.newPage();
    fixture.url = new URL(`${connection.client}/`, connection.url).href;
    fixture.sharingSeed = connection.credential.keyHex;
    await page.addInitScript((credential) => {
      window.__siaDemoTest = { credential };
    }, connection.credential);
    await use(page);
  },
  // Firefox keeps intercepted worker fetches alive after termination. A proxy
  // rejects remote traffic while loopback payloads retain native cancellation.
  proxy: async ({ egress }, use) => {
    await use({ bypass: "127.0.0.1,localhost", server: egress.url });
  },
  registration: async ({ baseURL, browser, contextOptions, endpoint, fixture, proxy, serviceWorkers, sia }, use) => {
    const connection = endpoint.connection({ access: sia.auth.registrationAccess, as: fixture.actor });
    const context = await browser.newContext({
      ...contextOptions,
      ...(baseURL === undefined ? {} : { baseURL }),
      ...(proxy === undefined ? {} : { proxy }),
      serviceWorkers,
      storageState: { cookies: [], origins: [] },
    });
    try {
      const page = await context.newPage();
      await page.addInitScript((credential) => {
        window.__siaDemoTest = { credential };
      }, { ...connection.credential, app: runOptions.backend.app, phrase: sia.auth.fixturePhrase });
      await use({ page, url: new URL(`${connection.client}/`, connection.url).href });
    } finally {
      await context.close();
    }
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
