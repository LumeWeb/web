/** Native app keys and builders must be released after their SDK calls settle. */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { connectAppKey, openAuthRequest } from "./storageBackend";

const sdk = vi.hoisted(() => ({
  builderConstructor: vi.fn(),
  builderFree: vi.fn(),
  connected: vi.fn<(key: unknown) => Promise<unknown>>(),
  initSia: vi.fn(),
  keyBytes: vi.fn(),
  keyFree: vi.fn(),
  requestConnection: vi.fn<() => Promise<void>>(),
}));

vi.mock("@siafoundation/sia-storage", () => ({
  AppKey: class {
    constructor(bytes: Uint8Array) {
      sdk.keyBytes(bytes);
    }
    free() {
      sdk.keyFree();
    }
  },
  Builder: class {
    constructor() {
      sdk.builderConstructor();
    }
    connected(key: unknown) {
      return sdk.connected(key);
    }
    free() {
      sdk.builderFree();
    }
    requestConnection() {
      return sdk.requestConnection();
    }
  },
  initSia: sdk.initSia,
}));

const seed = "ab".repeat(32);
const session = { appKey: vi.fn(), free: vi.fn() };

beforeEach(() => {
  vi.resetAllMocks();
  sdk.initSia.mockResolvedValue(undefined);
  sdk.requestConnection.mockResolvedValue(undefined);
});

describe("connectAppKey native handles", () => {
  it("frees the app key and builder after a successful connection without freeing the session", async () => {
    sdk.connected.mockResolvedValue(session);

    await expect(connectAppKey("https://indexer.test", seed)).resolves.toBe(
      session,
    );

    expect(sdk.keyBytes).toHaveBeenCalledWith(new Uint8Array(32).fill(0xab));
    expect(sdk.keyFree).toHaveBeenCalledOnce();
    expect(sdk.builderFree).toHaveBeenCalledOnce();
    expect(session.free).not.toHaveBeenCalled();
  });

  it("keeps the handles alive during a pending connection and frees them on rejection", async () => {
    const failure = new Error("Indexer unavailable");
    let reject!: (error: Error) => void;
    sdk.connected.mockImplementation(
      () =>
        new Promise((_resolve, rejectConnection) => {
          reject = rejectConnection;
        }),
    );
    const connecting = connectAppKey("https://indexer.test", seed);
    await vi.waitFor(() => expect(sdk.connected).toHaveBeenCalledOnce());
    expect(sdk.keyFree).not.toHaveBeenCalled();
    expect(sdk.builderFree).not.toHaveBeenCalled();

    reject(failure);
    await expect(connecting).rejects.toBe(failure);
    expect(sdk.keyFree).toHaveBeenCalledOnce();
    expect(sdk.builderFree).toHaveBeenCalledOnce();
  });

  it("frees both handles when the indexer does not recognize the key", async () => {
    sdk.connected.mockResolvedValue(null);

    await expect(connectAppKey("https://indexer.test", seed)).rejects.toThrow(
      "not registered",
    );
    expect(sdk.keyFree).toHaveBeenCalledOnce();
    expect(sdk.builderFree).toHaveBeenCalledOnce();
  });

  it("frees the app key when constructing the builder fails", async () => {
    const failure = new Error("Builder unavailable");
    sdk.builderConstructor.mockImplementation(() => {
      throw failure;
    });

    await expect(connectAppKey("https://indexer.test", seed)).rejects.toBe(
      failure,
    );
    expect(sdk.keyFree).toHaveBeenCalledOnce();
    expect(sdk.builderFree).not.toHaveBeenCalled();
  });
});

describe("openAuthRequest native handles", () => {
  it("leaves a successful request owned by its caller", async () => {
    const request = await openAuthRequest("https://indexer.test");

    expect(request).toHaveProperty("free");
    expect(sdk.builderFree).not.toHaveBeenCalled();
    request.free();
    expect(sdk.builderFree).toHaveBeenCalledOnce();
  });

  it("frees the builder when opening the request fails", async () => {
    const failure = new Error("Indexer unavailable");
    sdk.requestConnection.mockRejectedValue(failure);

    await expect(openAuthRequest("https://indexer.test")).rejects.toBe(failure);
    expect(sdk.builderFree).toHaveBeenCalledOnce();
  });
});
