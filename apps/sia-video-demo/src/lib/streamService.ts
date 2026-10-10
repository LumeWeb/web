/**
 * Demo-owned native stream service for `@lumeweb/sia-video-source`.
 *
 * The library's `service-worker` (native) backend plays a stream URL the
 * app's `SiaNativeStreamProvider` returns; the provider is built with the
 * concise `createSiaNativeStreamProvider(service)` factory from this single
 * service. The service is deliberately small and demo-shaped:
 *
 * - Availability delegates to the SDK's `enableStreaming()`: native
 *   playback exists only while the streaming service worker is registered
 *   and reachable (it resolves false on non-secure contexts, so the
 *   library's `auto` policy deterministically falls back to the media
 *   worker).
 * - `resolve` turns the transport `src` into the demo's source descriptor:
 *   a Sia share URL (via the library's `parseSiaShareUrl`) is a shared
 *   source; a bare 64-hex object key is an app (non-shared) source.
 * - `session.url` fetches the PinnedObject from the page-side SDK, opens a
 *   Streams handle via `openStreams`, and returns the same-origin stream URL
 *   the service worker answers with ranged reads. Release calls
 *   `file.release()`, `streams.close()`, and `object.free()` exactly once.
 *
 * The dependencies are injectable so unit tests run with plain fakes; the
 * defaults wire the real SDK and the demo-owned SDK lifetime manager. The
 * default SDK manager is created lazily on first use (dynamic import of the
 * auth store) so this module stays importable in Node test environments
 * where `window` is undefined.
 */

import {
  isSiaShareUrl,
  parseSiaShareUrl,
  type SiaNativeStreamFile,
  type SiaNativeStreamService,
} from "@lumeweb/sia-video-source";
import type {
  AppCredentials,
  PinnedObject,
  Sdk,
  SharedSdk,
  StreamedFile,
  Streams,
} from "@siafoundation/sia-storage";
import {
  enableStreaming as defaultEnableStreaming,
  openStreams as defaultOpenStreams,
} from "@siafoundation/sia-storage";
import {
  createStreamSdkManager,
  type StreamSdkHandle,
  type StreamSdkManager,
  watchAuthIdentity,
} from "./streamSdk";

/** Demo source descriptor the native stream service resolves. */
export interface DemoStreamSource {
  /** Canonical 64-hex object key. */
  readonly objectKey: string;
  /** True when the source is a shared (sharing-key) object. */
  readonly shared: boolean;
}

const OBJECT_KEY_PATTERN = /^[0-9a-f]{64}$/;

/** Injectable dependencies for the stream service. */
export interface DemoNativeStreamServiceDeps {
  /** Returns true when the streaming worker is registered. Defaults to the SDK's `enableStreaming()`. */
  enableStreaming?: () => Promise<boolean>;
  /** Returns a connected SDK handle for the source. Defaults to a lazily-created SDK lifetime manager. */
  getStreamSdk?: (source: DemoStreamSource) => Promise<StreamSdkHandle>;
  /** Opens a Streams handle. Defaults to the SDK's `openStreams`. */
  openStreams?: (
    sdk: Sdk | SharedSdk,
    credentials: StreamSdkHandle["credentials"],
  ) => Streams;
}

/**
 * Builds the demo `SiaNativeStreamService`. Availability delegates to
 * `enableStreaming()`; sessions open same-origin stream URLs through the
 * SDK's service worker.
 */
export function createDemoNativeStreamService(
  deps: DemoNativeStreamServiceDeps = {},
): SiaNativeStreamService<DemoStreamSource> {
  const enableStreaming =
    deps.enableStreaming ?? (() => defaultEnableStreaming());
  const getStreamSdk = deps.getStreamSdk ?? defaultGetStreamSdk;
  const openStreams =
    deps.openStreams ??
    ((sdk: Sdk | SharedSdk, credentials: StreamSdkHandle["credentials"]) =>
      // The SDK's openStreams is generic over Sdk|SharedSdk; the credentials
      // type is a union that satisfies both branches at runtime.
      defaultOpenStreams(sdk as Sdk, credentials as AppCredentials));

  return {
    isAvailable: () => enableStreaming(),
    resolve: (src) => Promise.resolve(resolveDemoStreamSource(src)),
    session: async (source, signal) => {
      // Everything a load creates before the session is returned (the
      // PinnedObject, the Streams handle) is released if the session's abort
      // signal fires while the SDK/object work is still pending, and the load
      // rejects with an AbortError.
      let object: null | PinnedObject = null;
      let streams: null | Streams = null;
      const releasePending = () => {
        streams?.close();
        object?.free();
        streams = null;
        object = null;
      };
      if (signal?.aborted) throw abortError();
      // While the SDK/object work below is pending, an abort releases whatever
      // the load has already created (the catch releases what is created
      // between the abort and the next check, so nothing leaks).
      const onAbort = () => releasePending();
      signal?.addEventListener("abort", onAbort, { once: true });
      try {
        const handle = await getStreamSdk(source);
        if (signal?.aborted) throw abortError();
        object = await handle.sdk.object(source.objectKey);
        if (signal?.aborted) throw abortError();
        streams = openStreams(handle.sdk, handle.credentials);
      } catch (error) {
        // The abort listener already released what it could; this covers the
        // resources created between the abort and the check above, and any
        // other failure path (e.g. openStreams throwing).
        releasePending();
        throw error;
      } finally {
        signal?.removeEventListener("abort", onAbort);
      }
      // The catch above rethrows, so both handles are set by the time a
      // session is returned; the consts give the url() closure non-null types.
      const sessionObject = object;
      const sessionStreams = streams;
      if (!sessionObject || !sessionStreams) {
        releasePending();
        throw new Error("stream session set up incompletely");
      }
      return {
        url: async (
          _source: unknown,
          options: {
            name: string;
            onProgress?: (bytes: number) => void;
            onStatus?: (status: string) => void;
            signal?: AbortSignal;
            type?: string;
          },
        ): Promise<SiaNativeStreamFile> => {
          // If the signal aborts while the stream URL is being produced, the
          // file (once it lands), the Streams handle, and the object are all
          // released and the load rejects with an AbortError.
          let file: null | StreamedFile = null;
          let urlWorkReleased = false;
          const releaseUrlWork = () => {
            if (urlWorkReleased) return;
            urlWorkReleased = true;
            file?.release();
            sessionStreams.close();
            sessionObject.free();
          };
          if (options.signal?.aborted) {
            releaseUrlWork();
            throw abortError();
          }
          let streamFile: StreamedFile;
          try {
            streamFile = await sessionStreams.url(sessionObject, {
              name: options.name,
              onProgress: options.onProgress,
              onStatus: options.onStatus,
              signal: options.signal,
              type: options.type,
            });
            file = streamFile;
          } catch (error) {
            // A non-abort failure keeps the handles for the library's
            // fallback chain; only an abort tears this load down.
            if (options.signal?.aborted) releaseUrlWork();
            throw error;
          }
          if (options.signal?.aborted) {
            releaseUrlWork();
            throw abortError();
          }
          let released = false;
          return {
            blob: streamFile.blob,
            release: () => {
              if (released) return;
              released = true;
              streamFile.release();
              sessionStreams.close();
              sessionObject.free();
            },
            url: streamFile.url,
          };
        },
      };
    },
  };
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

/** A standard AbortError, the shape fetch and the SDK reject with. */
function abortError(): DOMException {
  return new DOMException("Aborted", "AbortError");
}

// ---------------------------------------------------------------------------
// Lazy default SDK manager: created on first stream request, not at module
// load. The dynamic import of the auth store avoids its top-level `window`
// side effect in Node test environments.
// ---------------------------------------------------------------------------

// Single-flight: the creation promise itself is cached, so concurrent first
// requests share one manager (and one `watchAuthIdentity` subscription).
let _lazyPromise: null | Promise<StreamSdkManager> = null;

/**
 * Builds the page-side SDK lifetime manager wired to the auth store. The
 * `watchAuthIdentity` subscription is the demo's logout/rotation hook: any
 * credential change frees the cached Sdk/SharedSdk immediately, so a
 * restarted streaming worker re-fetches the credentials the page currently
 * has, never the previous user's.
 */
export async function createDefaultStreamSdkManager(): Promise<StreamSdkManager> {
  // Dynamic import: the auth module runs `ingestSharingFragment()` at
  // top level, which needs `window`. This path is only hit in the browser
  // (tests inject `getStreamSdk`), so `window` is always available here.
  const { useAuthStore } = await import("../stores/auth");
  const manager = createStreamSdkManager({
    getAuth: () => {
      const { indexerUrl, sharingKeyHex, userKeyHex } = useAuthStore.getState();
      return { indexerUrl, sharingKeyHex, userKeyHex };
    },
  });
  watchAuthIdentity(manager, useAuthStore);
  return manager;
}

async function defaultGetStreamSdk(
  source: DemoStreamSource,
): Promise<StreamSdkHandle> {
  _lazyPromise ??= createDefaultStreamSdkManager().catch((error) => {
    // A failed creation must not pin a rejected promise: the next request
    // retries manager creation.
    _lazyPromise = null;
    throw error;
  });
  const manager = await _lazyPromise;
  return manager.getStreamSdk(source);
}
