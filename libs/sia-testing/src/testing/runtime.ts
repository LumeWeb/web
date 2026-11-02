/** Transport adapters share private credential resolution without exporting fixture authority. */
import type { BrowserAccess, MockSia } from "./types.js";

export interface MockCredential {
  readonly keyHex: string;
  readonly kind: "app-key" | "registration" | "sharing-key";
}
export interface MockRuntime {
  authenticate(credential: MockCredential): BrowserAccess;
  authentication(
    credential: MockCredential,
    operation: string,
    input: Record<string, unknown>,
    baseUrl: string,
  ): unknown;
  credential(access: BrowserAccess): MockCredential;
}
const runtimes = new WeakMap<MockSia, MockRuntime>();
export function mockRuntime(mock: MockSia): MockRuntime {
  const runtime = runtimes.get(mock);
  if (!runtime) throw new Error("Unknown mock environment");
  return runtime;
}
export function registerRuntime(mock: MockSia, runtime: MockRuntime): void {
  runtimes.set(mock, runtime);
}
