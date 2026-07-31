import { beforeAll, afterEach, afterAll, expect } from "vitest";
import { createMockWasm } from "./mock-wasm";
import { WasmLoader } from "@/wasm/loader";

/** Mock WASM instance — injected into globalThis for tests */
export const mockWasm = createMockWasm();

// Only start MSW in browser environments
let worker: Awaited<ReturnType<typeof import("msw/browser").setupWorker>> | null = null;

beforeAll(async () => {
  // Inject mock WASM into globalThis so WasmLoader.load() finds it
  (globalThis as Record<string, unknown>).__lbrySDK__ = mockWasm;

  if (typeof document !== "undefined") {
    // Browser environment — start MSW
    const { setupWorker } = await import("msw/browser");
    const {
      staticHandlers,
      wsHandler,
      statefulHandlers,
    } = await import("./msw-handlers");
    worker = setupWorker(...staticHandlers, ...statefulHandlers, wsHandler);
    await worker.start({
      quiet: true,
      onUnhandledRequest: "bypass",
    });
  }
}, 30000);

/**
 * Helper: load WASM and return the exports object.
 * Shared by wallet.test.ts, coinselect.test.ts, transaction-claims.test.ts.
 */
export async function setupWasmExports(): Promise<Awaited<ReturnType<typeof WasmLoader.load>>["exports"]> {
  const instance = await WasmLoader.load();
  return instance.exports;
}

/**
 * Helper: run a WasmLoader.load() call that is expected to throw an untrusted-origin
 * error. Saves/restores globalThis.__lbrySDK__ so mock wasm doesn't interfere.
 * Shared by security-regression.test.ts URL validation tests.
 */
export async function expectUntrustedOrigin(opts: Parameters<typeof WasmLoader.load>[0]): Promise<void> {
  const g = globalThis as Record<string, unknown>;
  const saved = g.__lbrySDK__;
  delete g.__lbrySDK__;
  await expect(WasmLoader.load(opts)).rejects.toThrow("untrusted origin");
  if (saved) g.__lbrySDK__ = saved;
}

/**
 * Helper: run a WasmLoader.load() call that should NOT throw "untrusted origin".
 * Can still fail on fetch/script load, but the URL validation passes.
 * Saves/restores globalThis.__lbrySDK__ so mock wasm doesn't interfere.
 * Shared by security-regression.test.ts relative-path validation tests.
 */
export async function expectNoUntrustedOrigin(opts: Parameters<typeof WasmLoader.load>[0]): Promise<void> {
  const g = globalThis as Record<string, unknown>;
  const saved = g.__lbrySDK__;
  delete g.__lbrySDK__;
  try {
    await WasmLoader.load(opts);
  } catch (e: any) {
    expect(e.message).not.toContain("untrusted origin");
  }
  WasmLoader.unload();
  if (saved) g.__lbrySDK__ = saved;
}

afterEach(async () => {
  if (typeof document === "undefined") return; // node — no MSW
  if (!worker) return;
  const { resetMockState, staticHandlers, wsHandler, statefulHandlers } = await import("./msw-handlers");
  worker.resetHandlers(...staticHandlers, ...statefulHandlers, wsHandler);
  resetMockState();
});

afterAll(() => {
  worker?.stop();
});
