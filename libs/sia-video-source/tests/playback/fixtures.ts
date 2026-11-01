/** Each test owns its mock listener and payload store; closing it aborts unfinished reads. */
import { readFile, writeFile } from "node:fs/promises";
import { test as base } from "@playwright/test";
import { createIndexdHttpServer } from "@lumeweb/sia-testing/http";
import { createMockNetwork, type MockNetwork } from "@lumeweb/sia-testing/sdk";
import type {} from "./page";

export const test = base.extend<{ network: MockNetwork; networkURL: string }>({
  // Playwright requires destructured parameters even when a fixture has no dependencies.
  // oxlint-disable-next-line no-empty-pattern
  network: async ({}, use) => {
    const network = createMockNetwork({ chunkBytes: 4096 });
    network.model.createAccount({ publicKey: "playback-owner" });
    const bytes = new Uint8Array(
      await readFile(
        new URL(
          "../../src/__fixtures__/media/browser-decodable-long.mp4",
          import.meta.url,
        ),
      ),
    );
    network.seedObject("playback-owner", "1".repeat(64), bytes);
    network.seedObject(
      "playback-owner",
      "2".repeat(64),
      new Uint8Array(
        await readFile(
          new URL(
            "../../src/__fixtures__/media/browser-decodable-avc-aac.mp4",
            import.meta.url,
          ),
        ),
      ),
    );
    await use(network);
  },
  networkURL: async ({ network }, use) => {
    const server = createIndexdHttpServer({
      mockClients: {
        reader: { accountId: "playback-owner", device: "browser" },
      },
      mockNetwork: network,
    });
    try {
      const { port } = await server.listen();
      await use(`http://127.0.0.1:${port}`);
    } finally {
      await server.close();
    }
  },
});

test.afterEach(async ({ network, page }, info) => {
  if (info.status !== info.expectedStatus) {
    const state: unknown = await page
      .evaluate(() => window.playback.snapshot())
      .catch(() => null);
    const path = info.outputPath("playback-state.json");
    await writeFile(
      path,
      JSON.stringify({ requests: network.control.requests(), state }),
    );
    await info.attach("playback-state", {
      contentType: "application/json",
      path,
    });
  }
});
