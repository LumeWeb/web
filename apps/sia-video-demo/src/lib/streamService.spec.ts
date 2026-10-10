// @vitest-environment happy-dom
/* oxlint-disable perfectionist/sort-objects */
/* oxlint-disable typescript/unbound-method */
/* oxlint-disable typescript(require-await) */
import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  createSiaNativeStreamProvider,
  type SiaNativeStreamService,
} from "@lumeweb/sia-video-source";
import type { Sdk, Streams } from "@siafoundation/sia-storage";
import {
  configureDemoStreamAuth,
  createDemoNativeStreamService,
  getDemoNativeStreamService,
  resolveDemoStreamSource,
} from "./streamService";
import { useAuthStore } from "../stores/auth";

const OBJECT_KEY =
  "a1b2c3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff01";
const auth = {
  get: () => ({
    indexerUrl: "https://indexer.example",
    userKeyHex: "aa".repeat(32),
    sharingKeyHex: null,
  }),
};

describe("demo stream service", () => {
  beforeAll(() => {
    configureDemoStreamAuth(useAuthStore);
  });

  it("models a rejected preparation retry before native readiness succeeds", async () => {
    let attempts = 0;
    const service: SiaNativeStreamService = {
      isAvailable: () => Promise.resolve(true),
      prepare: () => {
        attempts += 1;
        return attempts === 1
          ? Promise.reject(new Error("native setup failed"))
          : Promise.resolve();
      },
      resolve: () => Promise.resolve({ objectKey: OBJECT_KEY, shared: false }),
      session: () =>
        Promise.resolve({
          url: () =>
            Promise.resolve({ release: () => undefined, url: "blob:test" }),
        }),
    };
    const provider = createSiaNativeStreamProvider(service);
    await expect(provider.available()).rejects.toThrow("native setup failed");
    await expect(provider.available()).resolves.toBe(true);
    expect(attempts).toBe(2);
  });

  it("prepares streaming once and exposes readiness", async () => {
    const enableStreaming = vi.fn(() => Promise.resolve(true));
    const service = createDemoNativeStreamService({ auth, enableStreaming });
    await expect(service.prepare()).resolves.toBe(true);
    await expect(service.isAvailable()).resolves.toBe(true);
    expect(enableStreaming).toHaveBeenCalledTimes(1);
  });

  it("reports unavailable native streaming without opening a session", async () => {
    const service = createDemoNativeStreamService({
      auth,
      enableStreaming: () => Promise.resolve(false),
    });
    await expect(service.isAvailable()).resolves.toBe(false);
  });

  it("retires the demo SDK when auth rotates before the next session", async () => {
    let state = auth.get();
    const listeners = new Set<(next: typeof state) => void>();
    const rotatingAuth = {
      get: () => state,
      subscribe: (listener: (next: typeof state) => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    };
    const firstSdk = {
      free: vi.fn(),
      object: vi.fn(() => Promise.resolve({ free: vi.fn() })),
    } as unknown as Sdk;
    const secondSdk = {
      free: vi.fn(),
      object: vi.fn(() => Promise.resolve({ free: vi.fn() })),
    } as unknown as Sdk;
    const connectApp = vi
      .fn()
      .mockResolvedValueOnce(firstSdk)
      .mockResolvedValueOnce(secondSdk);
    const openStreams = vi.fn(() => ({
      close: vi.fn(),
      url: vi.fn(() =>
        Promise.resolve({
          blob: new Blob(),
          release: vi.fn(),
          url: "https://localhost/stream",
        }),
      ),
    })) as unknown as () => Streams;
    const service = createDemoNativeStreamService({
      auth: rotatingAuth,
      connectApp,
      enableStreaming: () => Promise.resolve(true),
      openStreams,
    });
    const first = await service.session({
      objectKey: OBJECT_KEY,
      shared: false,
    });
    const firstFile = await first.url(null, { name: "a", type: "video/mp4" });
    firstFile.release();
    state = { ...state, indexerUrl: "https://rotated.example" };
    listeners.forEach((listener) => listener(state));
    // oxlint-disable-next-line typescript(unbound-method)
    expect(firstSdk.free).toHaveBeenCalledTimes(1);
    const second = await service.session({
      objectKey: OBJECT_KEY,
      shared: false,
    });
    expect(connectApp).toHaveBeenNthCalledWith(
      2,
      "https://rotated.example",
      state.userKeyHex,
    );
    const secondFile = await second.url(null, {
      name: "b",
      type: "video/mp4",
    });
    secondFile.release();
    service.dispose();
    // oxlint-disable-next-line typescript(unbound-method)
    expect(firstSdk.free).toHaveBeenCalledTimes(1);
    // oxlint-disable-next-line typescript(unbound-method)
    expect(secondSdk.free).toHaveBeenCalledTimes(1);
  });

  it("subscribes to the real auth store and retires cached SDK credentials on logout", async () => {
    const original = useAuthStore.getState();
    useAuthStore.setState({
      indexerUrl: "https://indexer.example",
      userKeyHex: "aa".repeat(32),
      sharingKeyHex: null,
    });
    const sdk = {
      free: vi.fn(),
      object: vi.fn(() => Promise.resolve({ free: vi.fn() })),
    } as unknown as Sdk;
    const service = createDemoNativeStreamService({
      connectApp: vi.fn(() => Promise.resolve(sdk)),
      enableStreaming: () => Promise.resolve(true),
      openStreams: () =>
        ({
          close: vi.fn(),
          url: vi.fn(() =>
            Promise.resolve({
              blob: new Blob(),
              release: vi.fn(),
              url: "blob:test",
            }),
          ),
        }) as unknown as Streams,
    });
    const session = await service.session({
      objectKey: OBJECT_KEY,
      shared: false,
    });
    const file = await session.url(null, { name: "a", type: "video/mp4" });
    file.release();

    useAuthStore.setState({ userKeyHex: "" });
    // oxlint-disable-next-line typescript(unbound-method)
    expect(sdk.free).toHaveBeenCalledTimes(1);
    service.dispose();
    useAuthStore.setState(original, true);
  });

  it("rejects auth reconfiguration after the shared service is constructed", () => {
    getDemoNativeStreamService();
    expect(() => configureDemoStreamAuth(useAuthStore)).toThrow(
      "configureDemoStreamAuth must run before the demo stream service is constructed",
    );
  });

  it("resolves object keys and share URLs through the public source contract", () => {
    expect(resolveDemoStreamSource(OBJECT_KEY)).toEqual({
      objectKey: OBJECT_KEY,
      shared: false,
    });
    const url = `https://indexer.example/objects/${OBJECT_KEY}/shared?req=abc#encryption_key=${"BwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwc"}`;
    expect(resolveDemoStreamSource(url)).toEqual({
      objectKey: OBJECT_KEY,
      shared: true,
    });
  });

  it("connects, opens, forwards URL options, and releases through the public helper", async () => {
    const object = { free: vi.fn(), id: () => OBJECT_KEY };
    const file = {
      blob: new Blob(),
      release: vi.fn(),
      url: "https://localhost/stream",
    };
    const streams = {
      close: vi.fn(),
      url: vi.fn(() => Promise.resolve(file)),
    } as unknown as Streams;
    const sdk = {
      free: vi.fn(),
      object: vi.fn(() => Promise.resolve(object)),
    } as unknown as Sdk;
    const connectApp = vi.fn(() => Promise.resolve(sdk));
    const openStreams = vi.fn(() => streams);
    const service = createDemoNativeStreamService({
      auth,
      connectApp,
      enableStreaming: () => Promise.resolve(true),
      openStreams,
    });
    const session = await service.session({
      objectKey: OBJECT_KEY,
      shared: false,
    });
    const signal = new AbortController().signal;
    const result = await session.url(null, {
      name: "video.mp4",
      signal,
      type: "video/mp4",
    });
    expect(result.url).toBe(file.url);
    expect(connectApp).toHaveBeenCalledWith(
      "https://indexer.example",
      "aa".repeat(32),
    );
    expect(openStreams).toHaveBeenCalledWith(sdk, {
      appMeta: {},
      indexerUrl: "https://indexer.example",
    });
    // oxlint-disable-next-line typescript(unbound-method)
    expect(sdk.object).toHaveBeenCalledWith(OBJECT_KEY);
    // oxlint-disable-next-line typescript(unbound-method)
    expect(streams.url).toHaveBeenCalledWith(object, {
      name: "video.mp4",
      type: "video/mp4",
      signal,
      onProgress: undefined,
      onStatus: undefined,
    });
    result.release();
    result.release();
    expect(file.release).toHaveBeenCalledTimes(1);
    // oxlint-disable-next-line typescript(unbound-method)
    expect(streams.close).toHaveBeenCalledTimes(1);
    // oxlint-disable-next-line typescript(unbound-method)
    expect(object.free).toHaveBeenCalledTimes(1);
    // oxlint-disable-next-line typescript(unbound-method)
    expect(sdk.free).not.toHaveBeenCalled();
    service.dispose();
    // oxlint-disable-next-line typescript(unbound-method)
    expect(sdk.free).toHaveBeenCalledTimes(1);
  });
});
