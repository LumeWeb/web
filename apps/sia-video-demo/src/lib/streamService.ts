/* oxlint-disable perfectionist/sort-objects, perfectionist/sort-modules */
import { parseSiaShareUrl } from "@lumeweb/sia-video-source";
import {
  createSiaStreamService,
  type SiaNativeStreamSourceKind,
  type SiaStreamAuthSource,
  type SiaStreamService,
  type SiaStreamSource,
} from "@lumeweb/sia-video-source/sia";
import { createSiaStreamAuthSource } from "@lumeweb/sia-video-source/sia/zustand";

export type DemoStreamSource = SiaStreamSource;
export type DemoNativeStreamService = SiaStreamService;

/**
 * The demo keeps the auth store out of the library service. This adapter lets
 * the player configure the live Zustand store without importing the browser
 * store in Node-only stream tests.
 */
const authSource: SiaStreamAuthSource = {
  get: () => ({ indexerUrl: "", userKeyHex: "", sharingKeyHex: null }),
};
let configured = false;
type DemoAuthStore = Parameters<typeof createSiaStreamAuthSource>[0];
let configuredStore: DemoAuthStore | null = null;
let demoService: DemoNativeStreamService | null = null;

/** Wires the live app store before the first native service is created. */
export function configureDemoStreamAuth<TState extends object>(
  store: Parameters<typeof createSiaStreamAuthSource<TState>>[0],
): void {
  if (demoService) {
    throw new Error(
      "configureDemoStreamAuth must run before the demo stream service is constructed",
    );
  }
  if (configured) {
    if (configuredStore !== store) {
      throw new Error(
        "configureDemoStreamAuth was already configured with a different store",
      );
    }
    return;
  }
  const source = createSiaStreamAuthSource(store);
  Object.assign(authSource, source);
  configuredStore = store;
  configured = true;
}

export function createDemoNativeStreamService(
  options: Omit<Parameters<typeof createSiaStreamService>[0], "auth"> & {
    auth?: SiaStreamAuthSource;
  } = {},
): DemoNativeStreamService {
  const service = createSiaStreamService({
    ...options,
    auth: options.auth ?? authSource,
  });
  demoService = service;
  return service;
}

/** Returns the app-wide service after startup has wired the live auth store. */
export function getDemoNativeStreamService(): DemoNativeStreamService {
  demoService ??= createDemoNativeStreamService();
  return demoService;
}

/** Resolves a source with the library's canonical Sia URL parser. */
export function resolveDemoStreamSource(
  src: string,
  sourceKind?: SiaNativeStreamSourceKind,
): DemoStreamSource {
  if (/^[0-9a-f]{64}$/.test(src))
    return { objectKey: src, shared: sourceKind === "shared" };
  const parsed = parseSiaShareUrl(src);
  return { objectKey: parsed.objectKey, shared: true };
}

export { authSource as demoStreamAuthSource };
