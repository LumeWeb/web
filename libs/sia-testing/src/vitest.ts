/** Native Vitest fixtures own portable mock state for each test that requests sia. */
import { test, type TestAPI } from "vitest";
import { createMockSia } from "./mock.js";
import type { AppDefinition, MockOptions, MockRun, RunLimits } from "./mock.js";

export interface MockSiaTestBackend {
  readonly app: AppDefinition;
  readonly kind: "mock";
  readonly options?: MockOptions;
}
export type SiaTest = TestAPI<SiaTestFixtures>;
export interface SiaTestFixtures {
  readonly sia: MockRun;
}
export interface SiaTestOptions {
  readonly backend: MockSiaTestBackend;
  readonly limits?: Partial<RunLimits>;
  /** Sharing this signal cancels every test using it. */
  readonly signal?: AbortSignal;
}
export type { AppDefinition, MockOptions, MockRun, RunLimits } from "./mock.js";

/** The finish hook closes runs even when a dependent fixture's teardown rejects. */
export function createSiaTest(options: SiaTestOptions): SiaTest {
  return test.extend<SiaTestFixtures>({
    sia: async ({ onTestFinished, signal: runnerSignal }, use) => {
      const mock = createMockSia(options.backend.options);
      let closing: Promise<void> | undefined;
      const close = () => (closing ??= mock.close());
      let runFailed = false;
      onTestFinished(async () => {
        // mock.run retains run and cleanup failures together in its AggregateError.
        if (!runFailed) await close();
      });
      const signal = options.signal
        ? AbortSignal.any([runnerSignal, options.signal])
        : runnerSignal;
      try {
        await mock.run({
          app: options.backend.app,
          ...(options.limits === undefined ? {} : { limits: options.limits }),
          signal,
        }, use);
      } catch (error) {
        runFailed = true;
        throw error;
      } finally {
        // Dynamic skip bypasses onTestFinished; finally still releases owned state.
        if (runFailed) await close().catch(() => undefined);
        else await close();
      }
    },
  });
}
