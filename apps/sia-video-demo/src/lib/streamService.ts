/**
 * Demo-owned native stream service for `@lumeweb/sia-video-source`.
 *
 * The library's `service-worker` (native) backend plays a stream URL the
 * app's `SiaNativeStreamProvider` returns; the provider is built with the
 * concise `createSiaNativeStreamProvider(service)` factory from this single
 * service. The service is deliberately small and demo-shaped:
 *
 * - Availability is the developer-option `nativeStreamBaseUrl`: native
 *   playback exists only while a stream endpoint is configured (empty or
 *   blank means unavailable, so the library's `auto` policy deterministically
 *   falls back to the media worker).
 * - `resolve` turns the transport `src` into the demo's source descriptor:
 *   a Sia share URL (via the library's `parseSiaShareUrl`) is a shared
 *   source; a bare 64-hex object key is an app (non-shared) source.
 * - `session.url` returns the derived endpoint URL; the demo endpoint is
 *   responsible for the actual bytes.
 *
 * The base-URL supplier is injected so unit tests run with plain fakes; the
 * default reads the centralized developer-options store at call time, so a
 * developer typing a URL in the options panel changes availability live.
 */

import {
  isSiaShareUrl,
  parseSiaShareUrl,
  type SiaNativeStreamService,
} from "@lumeweb/sia-video-source";
import { useDeveloperOptionsStore } from "../stores/developerOptions";

/** Demo source descriptor the native stream endpoint serves. */
export interface DemoStreamSource {
  /** Canonical 64-hex object key. */
  readonly objectKey: string;
  /** True when the source is a shared (sharing-key) object. */
  readonly shared: boolean;
}

const OBJECT_KEY_PATTERN = /^[0-9a-f]{64}$/;

/**
 * Builds the demo `SiaNativeStreamService`. `streamBaseUrl` defaults to the
 * centralized developer-options store, so availability is exactly
 * "a stream base URL is configured".
 */
export function createDemoNativeStreamService(deps?: {
  streamBaseUrl?: () => string;
}): SiaNativeStreamService<DemoStreamSource> {
  const streamBaseUrl =
    deps?.streamBaseUrl ??
    (() => useDeveloperOptionsStore.getState().nativeStreamBaseUrl);
  return {
    isAvailable: () => Promise.resolve(streamBaseUrl().trim() !== ""),
    resolve: (src) => Promise.resolve(resolveDemoStreamSource(src)),
    session: (source) => ({
      url: () =>
        Promise.resolve({
          release: () => undefined,
          url: demoStreamUrl(source, streamBaseUrl()),
        }),
    }),
  };
}

/**
 * The native stream endpoint URL for a resolved source under a configured
 * base URL. A trailing slash on the base is normalized away; shared sources
 * are tagged `via=shared` so the endpoint can route them.
 */
export function demoStreamUrl(
  source: DemoStreamSource,
  baseUrl: string,
): string {
  const base = baseUrl.trim().replace(/\/+$/, "");
  const query = new URLSearchParams({ object: source.objectKey });
  if (source.shared) query.set("via", "shared");
  return `${base}/stream?${query.toString()}`;
}

/**
 * Turns a transport `src` into the demo source descriptor. A valid Sia
 * share URL yields a shared source; a bare 64-hex object key yields a
 * non-shared one; anything else throws.
 */
export function resolveDemoStreamSource(src: string): DemoStreamSource {
  if (isSiaShareUrl(src)) {
    return { objectKey: parseSiaShareUrl(src).objectKey, shared: true };
  }
  if (OBJECT_KEY_PATTERN.test(src)) {
    return { objectKey: src, shared: false };
  }
  throw new Error(
    "not a playable Sia source: expected a share URL or a 64-hex object key",
  );
}
