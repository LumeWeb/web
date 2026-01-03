/**
 * Creates a reusable integration test fixture with MSW
 * Based on the uppy-post-upload library's integration test setup
 * Automatically detects environment and uses appropriate MSW setup:
 * - Browser: uses MSW worker (setupWorker)
 * - Node.js: uses MSW server (setupServer)
 */

import { test as testBase } from "vitest";
import type { RequestHandler } from "msw";
import type { SetupWorker } from "msw/browser";
import type { SetupServerApi } from "msw/node";
import { updateInterceptorHandlers } from "./setup.browser";

// Environment detection
export const isBrowser =
  typeof window !== "undefined" && typeof XMLHttpRequest !== "undefined";
export const isNode =
  typeof process !== "undefined" &&
  process.versions != null &&
  process.versions.node != null;

/**
 * Wraps an MSW worker to automatically sync handlers with the XHR interceptor.
 * This ensures that dynamically added handlers (via worker.use()) are also
 * available to the XHR interceptor for proper event handling in browser tests.
 */
async function createWorkerWithInterceptorSync(handlers: RequestHandler[]) {
  const { setupWorker } = await import("msw/browser");
  const worker = setupWorker(...handlers);

  const originalUse = worker.use.bind(worker);
  const originalReset = worker.resetHandlers.bind(worker);

  // Override the methods we need to track
  worker.use = (...args: Parameters<typeof worker.use>) => {
    const result = originalUse(...args);
    // Sync handlers to XHR interceptor after adding new ones
    updateInterceptorHandlers(worker.listHandlers());
    return result;
  };

  worker.resetHandlers = (...args: Parameters<typeof worker.resetHandlers>) => {
    const result = originalReset(...args);
    // Sync handlers to XHR interceptor after reset
    updateInterceptorHandlers(worker.listHandlers());
    return result;
  };

  return worker;
}

// Define test fixtures interface
interface TestFixtures {
  worker: SetupWorker | SetupServerApi;
}

// Options for creating the integration test fixture
interface CreateIntTestOptions {
  handlers: RequestHandler[];
  resetState?: () => Promise<void> | void;
  enableLogging?: boolean;
}

/**
 * Creates a Node.js integration test fixture using MSW server.
 * Dynamically imports the server to avoid loading Node-specific modules in browser.
 */
async function createNodeIntTest(options: CreateIntTestOptions) {
  const { handlers, resetState } = options;
  const { server } = await import("./setup.node");

  return testBase.extend<TestFixtures>({
    worker: [
      async ({}, use) => {
        // Reset state before each test if provided
        if (resetState) {
          await resetState();
        }

        // Use the global server from setup.node.ts
        await use(server as any);

        // Reset handlers after each test
        server.resetHandlers(...handlers);
      },
      {
        auto: true,
      },
    ],
  });
}

/**
 * Creates a browser integration test fixture using MSW worker.
 */
async function createBrowserIntTest(options: CreateIntTestOptions) {
  const { handlers, resetState, enableLogging = false } = options;
  const worker = await createWorkerWithInterceptorSync(handlers);

  return testBase.extend<TestFixtures>({
    worker: [
      async ({}, use) => {
        // Reset state before each test if provided
        if (resetState) {
          await resetState();
        }

        // Start the worker before the test
        await worker.start({
          onUnhandledRequest: "bypass",
          quiet: !enableLogging,
        });

        // Add event listeners for debugging if logging is enabled
        if (enableLogging) {
          worker.events.on("request:start", ({ request }) => {
            console.log("[MSW] Outgoing:", request.method, request.url);
          });

          worker.events.on("response:mocked", ({ response, request }) => {
            console.log(
              "[MSW] Response mocked:",
              request.method,
              request.url,
              "->",
              response.status,
            );
          });
        }

        // Expose the worker object on the test's context
        await use(worker);

        // Remove any request handlers added in individual test cases
        // This prevents them from affecting unrelated tests
        worker.resetHandlers(...handlers);

        // Stop the worker after the test
        await worker.stop();
      },
      {
        auto: true,
      },
    ],
  });
}

/**
 * Creates a reusable integration test fixture with MSW.
 * Automatically detects environment and uses appropriate MSW setup:
 * - Browser: uses MSW worker (setupWorker)
 * - Node.js: uses MSW server (setupServer) - no-op in tests
 *
 * @param options - Configuration options for the test fixture
 * @returns A Vitest test fixture with MSW integration
 *
 * @example
 * ```ts
 * export const test = createIntTest({
 *   handlers: [...uploadHandlers],
 *   resetState: resetRequestCounter,
 *   enableLogging: false,
 * });
 * ```
 */
export async function createIntTest(options: CreateIntTestOptions) {
  if (isNode) {
    return createNodeIntTest(options);
  }

  return await createBrowserIntTest(options);
}
