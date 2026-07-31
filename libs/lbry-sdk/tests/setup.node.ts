/**
 * Node test setup — injects mock WASM, no MSW (node has no fetch interceptor needed).
 * Uses globalThis injection pattern same as browser setup.
 */
import { beforeAll, expect } from "vitest";
import { createMockWasm } from "./mock-wasm";
import { WasmLoader } from "@/wasm/loader";

export const mockWasm = createMockWasm();

beforeAll(() => {
  (globalThis as Record<string, unknown>).__lbrySDK__ = mockWasm;
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
