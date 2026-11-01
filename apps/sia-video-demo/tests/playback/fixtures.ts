/** Each test owns the payload listener; the real SDK seals listing metadata only against that local model. */
import { readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { test as base, type Page } from "@playwright/test";
import {
  AppKey,
  Builder,
  initSia,
  PinnedObject,
} from "@siafoundation/sia-storage";
import { createIndexdHttpServer } from "@lumeweb/sia-testing/http";
import { createMockNetwork, type MockNetwork } from "@lumeweb/sia-testing/sdk";

interface Egress {
  connections(): number;
  readonly url: string;
}

interface Fixture {
  readonly longId: string;
  readonly network: MockNetwork;
  readonly sharingSeed: string;
  readonly url: string;
}

export const test = base.extend<{ egress: Egress; fixture: Fixture }>({
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
  // Playwright requires destructured parameters for fixtures without dependencies.
  // oxlint-disable-next-line no-empty-pattern
  fixture: async ({}, use) => {
    await initSia();
    const key = new AppKey(Buffer.alloc(32, 7));
    const accountId = key.publicKey();
    const network = createMockNetwork({ chunkBytes: 4096 });
    network.model.createAccount({ publicKey: accountId });
    const server = createIndexdHttpServer({
      mockClients: { reader: { accountId, device: "demo-worker" } },
      mockNetwork: network,
      async responseOverride(request, response) {
        if (
          new URL(request.url).pathname !== "/shared/objects" ||
          response.status !== 200
        )
          return response;
        const rows = (await response.json()) as {
          objectID: string;
          size: number;
        }[];
        // Empty SDK objects provide valid metadata seals; the mock payload pins
        // supply sizes because the dispatcher returns placeholder summary sizes.
        return Response.json(
          rows.map((row) => ({
            ...row,
            size: (
              network.model.object(accountId, row.objectID)?.slabs ?? []
            ).reduce(
              (size, id) => size + network.model.getSlab(accountId, id).size,
              0,
            ),
          })),
          { headers: response.headers, status: response.status },
        );
      },
    });
    try {
      const { port } = await server.listen();
      const url = `http://127.0.0.1:${port}/`;
      // The Node binding reads id bytes; browser declarations require appId.
      const metadata = {
        appId: "00".repeat(32),
        callbackUrl: undefined,
        description: "Local demo metadata fixture",
        id: Buffer.alloc(32),
        logoUrl: undefined,
        name: "Demo fixture",
        serviceUrl: "https://example.invalid",
      };
      const sdk = await new Builder(url, metadata).connected(key);
      if (!sdk) throw new Error("Fixture account did not connect to its model");
      const sharing = await sdk.createSharingKey("Local demo videos");
      const seed: unknown = sharing.seed();
      if (!Buffer.isBuffer(seed))
        throw new Error("The fixture requires the Node SDK binding");
      const payload = network.createSdk({ accountId });
      const object = new PinnedObject();
      object.updateMetadata(
        Buffer.from(
          JSON.stringify({
            filename: "Long demo video.mp4",
            type: "sialo-object-meta",
            version: 1,
          }),
        ),
      );
      await sdk.pinObject(object);
      const bytes = new Uint8Array(
        await readFile(
          new URL(
            "../../../../libs/sia-video-source/src/__fixtures__/media/browser-decodable-long.mp4",
            import.meta.url,
          ),
        ),
      );
      network.seedObject(accountId, object.id(), bytes);
      await payload.pinObject(object);
      await sdk.shareObject(sharing, object);
      const longId = object.id();
      await use({ longId, network, sharingSeed: seed.toString("hex"), url });
    } finally {
      await server.close();
      network.model.reset();
    }
  },
  // Firefox keeps intercepted worker fetches alive after termination. A proxy
  // rejects remote traffic while loopback payloads retain native cancellation.
  proxy: async ({ egress }, use) => {
    await use({ bypass: "127.0.0.1,localhost", server: egress.url });
  },
});

export async function openDemo(page: Page, fixture: Fixture) {
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
    .check();
}

export async function openShare(page: Page, fixture: Fixture) {
  await openDemo(page, fixture);
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
        requests: fixture.network.control.requests().slice(-64),
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
