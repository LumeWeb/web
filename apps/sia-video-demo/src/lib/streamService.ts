/* oxlint-disable perfectionist/sort-objects, perfectionist/sort-modules */
/** Adapts demo account and sharing state to the video service without owning either SDK. */
import { parseSiaShareUrl } from "@lumeweb/sia-video-source";
import {
  createSiaStreamService,
  type SiaNativeStreamSourceKind,
  type SiaStreamAuthSource,
  type SiaStreamAuthState,
  type SiaStreamService,
  type SiaStreamSource,
} from "@lumeweb/sia-video-source/sia";

export type DemoStreamSource = SiaStreamSource;
export type DemoNativeStreamService = SiaStreamService;

interface DemoAuthStore {
  getState(): Pick<SiaStreamAuthState, "indexerUrl" | "sharingKeyHex">;
  subscribe(listener: () => void): () => void;
}
interface DemoAccountSource {
  activeAppKeyHex(): null | string;
  subscribe(listener: () => void): () => void;
}

export function createDemoStreamAuthSource(
  store: DemoAuthStore,
  account: DemoAccountSource,
): SiaStreamAuthSource {
  const read = (): SiaStreamAuthState => {
    const state = store.getState();
    return {
      indexerUrl: state.indexerUrl,
      sharingKeyHex: state.sharingKeyHex,
      userKeyHex: account.activeAppKeyHex() ?? "",
    };
  };
  return {
    get: read,
    subscribe(listener) {
      let previous = read();
      const onChange = () => {
        const next = read();
        if (
          next.indexerUrl === previous.indexerUrl &&
          next.sharingKeyHex === previous.sharingKeyHex &&
          next.userKeyHex === previous.userKeyHex
        )
          return;
        previous = next;
        listener(next);
      };
      const unsubscribeStore = store.subscribe(onChange);
      // Account readiness can change without a persisted-key store write.
      const unsubscribeAccount = account.subscribe(onChange);
      return () => {
        unsubscribeStore();
        unsubscribeAccount();
      };
    },
  };
}

export function createDemoNativeStreamService(
  auth: SiaStreamAuthSource,
  options: Omit<Parameters<typeof createSiaStreamService>[0], "auth"> = {},
): DemoNativeStreamService {
  return createSiaStreamService({ ...options, auth });
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
