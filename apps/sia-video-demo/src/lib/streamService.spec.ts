import {
  createSiaNativeStreamProvider,
  SiaNativeStreamUnavailableError,
} from "@lumeweb/sia-video-source";
import type { Sdk, Streams } from "@siafoundation/sia-storage";
import { describe, expect, it, vi } from "vitest";
import type { StreamSdkHandle } from "./streamSdk";
import {
  createDemoNativeStreamService,
  type DemoStreamSource,
  resolveDemoStreamSource,
} from "./streamService";

// The lazy default manager path dynamic-imports the auth store and the WASM
// SDK. Both are mocked so the default (non-injected) path is testable in
// Node, and the mock spies double as leak detectors (each manager creation
// subscribes the auth store exactly once).
const mocks = vi.hoisted(() => {
  let failSubscriptions = false;
  const listeners = new Set<() => void>();
  const authState = {
    indexerUrl: "https://indexer.example",
    sharingKeyHex: null as null | string,
    userKeyHex: "aa".repeat(32),
  };
  const useAuthStore = {
    getState: () => authState,
    subscribe: vi.fn((listener: () => void) => {
      if (failSubscriptions) {
        throw new Error("auth store unavailable");
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }),
  };
  const failNextCreation = () => {
    failSubscriptions = true;
  };
  const allowCreation = () => {
    failSubscriptions = false;
  };
  const builderConnected = vi.fn((_key: unknown) =>
    Promise.resolve({} as unknown),
  );
  const initSia = vi.fn(() => Promise.resolve());
  const enableStreaming = vi.fn(() => Promise.resolve(true));
  const openStreams = vi.fn();
  return {
    allowCreation,
    builderConnected,
    enableStreaming,
    failNextCreation,
    initSia,
    openStreams,
    useAuthStore,
  };
});

vi.mock("../stores/auth", () => ({ useAuthStore: mocks.useAuthStore }));
vi.mock("@siafoundation/sia-storage", () => {
  class AppKey {}
  class Builder {
    connected = (key: unknown) => mocks.builderConnected(key);
    free = () => undefined;
  }
  return {
    AppKey,
    Builder,
    enableStreaming: mocks.enableStreaming,
    initSia: mocks.initSia,
    openStreams: mocks.openStreams,
    SharedSdk: { connect: vi.fn() },
  };
});

const OBJECT_KEY =
  "a1b2c3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff01";

/** Encodes to the padded base64url form real Sia share-URL generators emit. */
function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_");
}

function encryptionFragment(bytes = new Uint8Array(32).fill(7)): string {
  return `#encryption_key=${base64UrlEncode(bytes)}`;
}

function shareUrl(objectKey = OBJECT_KEY): string {
  return `https://indexer.example/objects/${objectKey}/shared?req=abc${encryptionFragment()}`;
}

const SIGNAL = new AbortController().signal;

describe("default SDK manager (lazy, single-flight)", () => {
  it("shares one lazy manager across concurrent first requests (no duplicate connect, no leaked auth-store subscription)", async () => {
    const { object } = fakePinnedObject();
    const { streams } = fakeStreams();
    const fakeSdk = {
      free: vi.fn(),
      object: () => Promise.resolve(object),
    } as unknown as Sdk;
    mocks.builderConnected.mockResolvedValue(fakeSdk);
    mocks.openStreams.mockReturnValue(streams);
    const service = createDemoNativeStreamService();

    // Two concurrent first-time stream requests: the lazy manager must be
    // created exactly once (one auth-store subscription, one SDK connect).
    const [a, b] = await Promise.all([
      service.session({ objectKey: OBJECT_KEY, shared: false }, SIGNAL),
      service.session({ objectKey: OBJECT_KEY, shared: false }, SIGNAL),
    ]);

    // Both sessions reach the stream URL through the same single manager.
    const fileA = await a.url(null, { name: "video", signal: SIGNAL });
    const fileB = await b.url(null, { name: "video", signal: SIGNAL });
    expect(fileA.url).toBe("https://localhost/sia-storage-sw-stream");
    expect(fileB.url).toBe("https://localhost/sia-storage-sw-stream");
    expect(mocks.useAuthStore.subscribe).toHaveBeenCalledTimes(1);
    expect(mocks.builderConnected).toHaveBeenCalledTimes(1);
  });

  it("retries manager creation after a failed first attempt", async () => {
    const { object } = fakePinnedObject();
    const { streams } = fakeStreams();
    const fakeSdk = {
      free: vi.fn(),
      object: () => Promise.resolve(object),
    } as unknown as Sdk;
    mocks.builderConnected.mockResolvedValue(fakeSdk);
    mocks.openStreams.mockReturnValue(streams);
    // Fresh module: the lazy manager starts uncreated in this instance.
    vi.resetModules();
    const { createDemoNativeStreamService: freshCreate } =
      await import("./streamService");
    const service = freshCreate();
    mocks.useAuthStore.subscribe.mockClear();
    mocks.builderConnected.mockClear();

    // The first creation fails (auth store unavailable): the lazy promise
    // must not be pinned to the rejection, so the next request retries.
    mocks.failNextCreation();
    await expect(
      service.session({ objectKey: OBJECT_KEY, shared: false }, SIGNAL),
    ).rejects.toThrow("auth store unavailable");
    mocks.allowCreation();

    const ok = await service.session(
      { objectKey: OBJECT_KEY, shared: false },
      SIGNAL,
    );
    const file = await ok.url(null, { name: "video", signal: SIGNAL });
    expect(file.url).toBe("https://localhost/sia-storage-sw-stream");
    // The failed attempt subscribes once before throwing, the retry succeeds:
    // exactly one live subscription, exactly one SDK connect.
    expect(mocks.useAuthStore.subscribe).toHaveBeenCalledTimes(2);
    expect(mocks.builderConnected).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// resolveDemoStreamSource (unchanged contract)
// ---------------------------------------------------------------------------

describe("resolveDemoStreamSource", () => {
  it("resolves a Sia share URL to a shared source with its object key", () => {
    expect(resolveDemoStreamSource(shareUrl())).toEqual({
      objectKey: OBJECT_KEY,
      shared: true,
    });
  });

  it("resolves a bare 64-hex object key to a non-shared source", () => {
    expect(resolveDemoStreamSource(OBJECT_KEY)).toEqual({
      objectKey: OBJECT_KEY,
      shared: false,
    });
  });

  it("rejects input that is neither a share URL nor an object key", () => {
    expect(() => resolveDemoStreamSource("not-a-source")).toThrow();
  });
});

// ---------------------------------------------------------------------------
// isAvailable: delegates to enableStreaming
// ---------------------------------------------------------------------------

describe("createDemoNativeStreamService.isAvailable", () => {
  it("resolves true when enableStreaming resolves true", async () => {
    const service = createDemoNativeStreamService({
      enableStreaming: () => Promise.resolve(true),
    });
    await expect(service.isAvailable(SIGNAL)).resolves.toBe(true);
  });

  it("resolves false when enableStreaming resolves false", async () => {
    const service = createDemoNativeStreamService({
      enableStreaming: () => Promise.resolve(false),
    });
    await expect(service.isAvailable(SIGNAL)).resolves.toBe(false);
  });
});

// ---------------------------------------------------------------------------
// session.url: forwards options to Streams.url, release lifecycle
// ---------------------------------------------------------------------------

/** A fake PinnedObject with a spied free(). */
function fakePinnedObject() {
  const free = vi.fn();
  return { free, object: { free, id: () => OBJECT_KEY } };
}

/**
 * Builds a fake StreamSdkHandle whose sdk.object() returns the given fake
 * PinnedObject.
 */
function fakeSdkHandle(
  object: { free: () => void; id: () => string },
  shared: boolean,
): StreamSdkHandle {
  const credentials: StreamSdkHandle["credentials"] = shared
    ? { indexerUrl: "https://indexer.example", seed: "ab".repeat(32) }
    : {
        appMeta: {
          appId: "cd".repeat(32),
          callbackUrl: undefined,
          description: "test",
          logoUrl: undefined,
          name: "Test",
          serviceUrl: "https://localhost",
        },
        indexerUrl: "https://indexer.example",
      };
  const sdk = {
    free: () => undefined,
    object: () => Promise.resolve(object),
  } as unknown as Sdk;
  return { credentials, sdk };
}

/**
 * A fake Streams handle that records url() and close() calls and returns a
 * configurable StreamedFile.
 */
function fakeStreams(overrides?: { blob?: Blob }) {
  const close = vi.fn();
  const fileRelease = vi.fn();
  const file = {
    blob: overrides?.blob,
    release: fileRelease,
    url: "https://localhost/sia-storage-sw-stream",
  };
  const url = vi.fn(() => Promise.resolve(file));
  const streams = { close, url } as unknown as Streams;
  return { close, file, fileRelease, streams, url };
}

describe("createDemoNativeStreamService.session", () => {
  it("forwards name, type, signal, onStatus, onProgress to Streams.url", async () => {
    const { object } = fakePinnedObject();
    const { streams, url: urlSpy } = fakeStreams();
    const handle = fakeSdkHandle(object, true);

    const service = createDemoNativeStreamService({
      enableStreaming: () => Promise.resolve(true),
      getStreamSdk: () => Promise.resolve(handle),
      openStreams: () => streams,
    });

    const session = await service.session(
      { objectKey: OBJECT_KEY, shared: true },
      SIGNAL,
    );
    const onStatus = vi.fn();
    const onProgress = vi.fn();
    await session.url(handle, {
      name: "test.mp4",
      onProgress,
      onStatus,
      signal: SIGNAL,
      type: "video/mp4",
    });

    expect(urlSpy).toHaveBeenCalledTimes(1);
    const callArgs = urlSpy.mock.calls[0] as unknown as [
      unknown,
      Record<string, unknown>,
    ];
    expect(callArgs[0]).toBe(object);
    expect(callArgs[1]).toMatchObject({
      name: "test.mp4",
      onProgress,
      onStatus,
      signal: SIGNAL,
      type: "video/mp4",
    });
  });

  it("release calls file.release, streams.close, and object.free exactly once each", async () => {
    const { free: objectFree, object } = fakePinnedObject();
    const { close: closeSpy, fileRelease, streams } = fakeStreams();
    const handle = fakeSdkHandle(object, false);

    const service = createDemoNativeStreamService({
      enableStreaming: () => Promise.resolve(true),
      getStreamSdk: () => Promise.resolve(handle),
      openStreams: () => streams,
    });

    const session = await service.session(
      { objectKey: OBJECT_KEY, shared: false },
      SIGNAL,
    );
    const file = await session.url(handle, { name: "v", signal: SIGNAL });
    file.release();

    expect(fileRelease).toHaveBeenCalledTimes(1);
    expect(closeSpy).toHaveBeenCalledTimes(1);
    expect(objectFree).toHaveBeenCalledTimes(1);
  });

  it("release is idempotent: a second call is a no-op", async () => {
    const { free: objectFree, object } = fakePinnedObject();
    const { close: closeSpy, fileRelease, streams } = fakeStreams();
    const handle = fakeSdkHandle(object, true);

    const service = createDemoNativeStreamService({
      enableStreaming: () => Promise.resolve(true),
      getStreamSdk: () => Promise.resolve(handle),
      openStreams: () => streams,
    });

    const session = await service.session(
      { objectKey: OBJECT_KEY, shared: true },
      SIGNAL,
    );
    const file = await session.url(handle, { name: "v", signal: SIGNAL });
    file.release();
    file.release();

    expect(fileRelease).toHaveBeenCalledTimes(1);
    expect(closeSpy).toHaveBeenCalledTimes(1);
    expect(objectFree).toHaveBeenCalledTimes(1);
  });

  it("passes through a blob result so the library can reject it", async () => {
    const { object } = fakePinnedObject();
    const blob = new Blob(["data"]);
    const { streams } = fakeStreams({ blob });
    const handle = fakeSdkHandle(object, true);

    const service = createDemoNativeStreamService({
      enableStreaming: () => Promise.resolve(true),
      getStreamSdk: () => Promise.resolve(handle),
      openStreams: () => streams,
    });

    const session = await service.session(
      { objectKey: OBJECT_KEY, shared: true },
      SIGNAL,
    );
    const file = await session.url(handle, { name: "v", signal: SIGNAL });
    expect(file.blob).toBe(blob);
  });

  it("rejects with the unavailable error when enableStreaming is false", async () => {
    const service = createDemoNativeStreamService({
      enableStreaming: () => Promise.resolve(false),
    });
    const provider = createSiaNativeStreamProvider(service);
    await expect(
      provider.open(shareUrl(), { signal: SIGNAL }),
    ).rejects.toBeInstanceOf(SiaNativeStreamUnavailableError);
  });

  it("opens a stream through the full provider path and stays releasable", async () => {
    const { free: objectFree, object } = fakePinnedObject();
    const { close: closeSpy, fileRelease, streams } = fakeStreams();
    const handle = fakeSdkHandle(object, true);

    const service = createDemoNativeStreamService({
      enableStreaming: () => Promise.resolve(true),
      getStreamSdk: () => Promise.resolve(handle),
      openStreams: () => streams,
    });
    const provider = createSiaNativeStreamProvider(service);
    const stream = await provider.open(shareUrl(), {
      name: "video",
      signal: SIGNAL,
    });
    expect(stream.url).toBe("https://localhost/sia-storage-sw-stream");
    stream.release();
    stream.release();
    expect(fileRelease).toHaveBeenCalledTimes(1);
    expect(closeSpy).toHaveBeenCalledTimes(1);
    expect(objectFree).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Abort handling: a session signal that fires must release everything the
// load created and reject with an AbortError (no leaked object/Streams).
// ---------------------------------------------------------------------------

describe("createDemoNativeStreamService abort handling", () => {
  const SOURCE: DemoStreamSource = { objectKey: OBJECT_KEY, shared: true };

  function serviceWith(
    getStreamSdk: (source: DemoStreamSource) => Promise<StreamSdkHandle>,
    openStreams: () => Streams,
  ) {
    return createDemoNativeStreamService({
      enableStreaming: () => Promise.resolve(true),
      getStreamSdk,
      openStreams,
    });
  }

  it("rejects with AbortError when the signal is already aborted, before any SDK work", async () => {
    const { object } = fakePinnedObject();
    const { streams } = fakeStreams();
    const handle = fakeSdkHandle(object, true);
    const getStreamSdk = vi.fn(() => Promise.resolve(handle));
    const openStreams = vi.fn(() => streams);
    const service = serviceWith(getStreamSdk, openStreams);

    const controller = new AbortController();
    controller.abort();
    await expect(
      service.session(SOURCE, controller.signal),
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(getStreamSdk).not.toHaveBeenCalled();
    expect(openStreams).not.toHaveBeenCalled();
  });

  it("rejects with AbortError when the signal aborts while the SDK is connecting", async () => {
    const { free: objectFree, object } = fakePinnedObject();
    const { close: closeSpy, streams } = fakeStreams();
    const handle = fakeSdkHandle(object, true);
    let resolveSdk: ((handle: StreamSdkHandle) => void) | undefined;
    const getStreamSdk = vi.fn(
      () =>
        new Promise<StreamSdkHandle>((resolve) => {
          resolveSdk = resolve;
        }),
    );
    const openStreams = vi.fn(() => streams);
    const service = serviceWith(getStreamSdk, openStreams);

    const controller = new AbortController();
    const sessionPromise = service.session(SOURCE, controller.signal);
    controller.abort();
    resolveSdk?.(handle);
    await expect(sessionPromise).rejects.toMatchObject({ name: "AbortError" });

    // Nothing past the SDK connect may have been created or released.
    expect(openStreams).not.toHaveBeenCalled();
    expect(closeSpy).not.toHaveBeenCalled();
    expect(objectFree).not.toHaveBeenCalled();
  });

  it("releases the fetched object when the signal aborts while fetching the PinnedObject", async () => {
    const { free: objectFree, object } = fakePinnedObject();
    const { close: closeSpy, streams } = fakeStreams();
    let resolveObject: (() => void) | undefined;
    const handle: StreamSdkHandle = {
      credentials: {
        indexerUrl: "https://indexer.example",
        seed: "ab".repeat(32),
      },
      sdk: {
        free: () => undefined,
        object: () =>
          new Promise((resolve) => {
            resolveObject = () => resolve(object);
          }),
      } as unknown as Sdk,
    };
    const openStreams = vi.fn(() => streams);
    const service = serviceWith(() => Promise.resolve(handle), openStreams);

    const controller = new AbortController();
    const sessionPromise = service.session(SOURCE, controller.signal);
    // Let the session get past the SDK handle and start fetching the object.
    await new Promise((resolve) => setTimeout(resolve, 0));
    controller.abort();
    resolveObject?.();
    await expect(sessionPromise).rejects.toMatchObject({ name: "AbortError" });

    // The object was created before the abort landed: it must be freed, and
    // the Streams handle never opened.
    expect(objectFree).toHaveBeenCalledTimes(1);
    expect(openStreams).not.toHaveBeenCalled();
    expect(closeSpy).not.toHaveBeenCalled();
  });

  it("releases object and Streams when the signal aborts while the stream URL is pending", async () => {
    const { free: objectFree, object } = fakePinnedObject();
    const close = vi.fn();
    const fileRelease = vi.fn();
    const file = {
      blob: undefined,
      release: fileRelease,
      url: "https://localhost/sia-storage-sw-stream",
    };
    let resolveFile: (() => void) | undefined;
    const url = vi.fn(
      () =>
        new Promise<typeof file>((resolve) => {
          resolveFile = () => resolve(file);
        }),
    );
    const streams = { close, url } as unknown as Streams;
    const handle = fakeSdkHandle(object, true);
    const service = serviceWith(
      () => Promise.resolve(handle),
      () => streams,
    );

    const session = await service.session(SOURCE, new AbortController().signal);
    const controller = new AbortController();
    const urlPromise = session.url(SOURCE, {
      name: "v",
      signal: controller.signal,
    });
    controller.abort();
    resolveFile?.();
    await expect(urlPromise).rejects.toMatchObject({ name: "AbortError" });

    // The file that resolved in the race, the Streams handle, and the object
    // are all released exactly once.
    expect(fileRelease).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
    expect(objectFree).toHaveBeenCalledTimes(1);
  });

  it("releases the per-load handles and never calls Streams.url when url() starts already aborted", async () => {
    const { free: objectFree, object } = fakePinnedObject();
    const { close: closeSpy, streams, url: urlSpy } = fakeStreams();
    const handle = fakeSdkHandle(object, true);
    const service = serviceWith(
      () => Promise.resolve(handle),
      () => streams,
    );

    const session = await service.session(SOURCE, new AbortController().signal);
    const controller = new AbortController();
    controller.abort();
    await expect(
      session.url(SOURCE, { name: "v", signal: controller.signal }),
    ).rejects.toMatchObject({ name: "AbortError" });

    expect(urlSpy).not.toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalledTimes(1);
    expect(objectFree).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// App vs shared source routing through the SDK handle
// ---------------------------------------------------------------------------

describe("createDemoNativeStreamService source routing", () => {
  it("routes a shared source through the shared SDK handle", async () => {
    const { object } = fakePinnedObject();
    const { streams } = fakeStreams();
    const getStreamSdk = vi.fn(() =>
      Promise.resolve(fakeSdkHandle(object, true)),
    );

    const service = createDemoNativeStreamService({
      enableStreaming: () => Promise.resolve(true),
      getStreamSdk,
      openStreams: () => streams,
    });

    const source: DemoStreamSource = { objectKey: OBJECT_KEY, shared: true };
    await service.session(source, SIGNAL);
    expect(getStreamSdk).toHaveBeenCalledWith(source);
  });

  it("routes an app source through the app SDK handle", async () => {
    const { object } = fakePinnedObject();
    const { streams } = fakeStreams();
    const getStreamSdk = vi.fn(() =>
      Promise.resolve(fakeSdkHandle(object, false)),
    );

    const service = createDemoNativeStreamService({
      enableStreaming: () => Promise.resolve(true),
      getStreamSdk,
      openStreams: () => streams,
    });

    const source: DemoStreamSource = { objectKey: OBJECT_KEY, shared: false };
    await service.session(source, SIGNAL);
    expect(getStreamSdk).toHaveBeenCalledWith(source);
  });
});
