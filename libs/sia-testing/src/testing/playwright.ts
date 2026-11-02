/** Each binding gets a fresh private browser context whose lifetime ends before storage cleanup. */
import { test as base, type Page } from "@playwright/test";
import {
  privateConnection as connect,
  ownRunResource,
  type RunOptions,
  withSiaRun,
} from "./node.js";
import type { ActorRef, BrowserAccess, MockRun } from "./types.js";
import type { privateConnection } from "./node.js";
export interface BrowserBinding {
  readonly access: BrowserAccess;
  readonly apply: (
    page: Page,
    connection: Awaited<ReturnType<typeof privateConnection>>,
  ) => Promise<void | { close(): Promise<void> }>;
  readonly mockActor?: ActorRef;
}
export type BrowserRun = MockRun & {
  readonly browser: { open(binding: BrowserBinding): Promise<Page> };
};
export function createSiaTest(options: RunOptions) {
  return base.extend<{ sia: BrowserRun }>({
    sia: async (
      { baseURL, browser, contextOptions, proxy, serviceWorkers },
      use,
    ) => {
      await withSiaRun(options, async (run) => {
        await use({
          ...run,
          browser: {
            async open(binding) {
              const connection = await connect(
                run,
                binding.access,
                binding.mockActor,
              );
              const context = await browser.newContext({
                ...contextOptions,
                ...(baseURL === undefined ? {} : { baseURL }),
                ...(proxy === undefined ? {} : { proxy }),
                serviceWorkers,
                storageState: { cookies: [], origins: [] },
              });
              ownRunResource(run, () => context.close());
              const page = await context.newPage();
              const resource = await binding.apply(page, connection);
              if (resource) ownRunResource(run, () => resource.close());
              return page;
            },
          },
        });
      });
    },
  });
}
