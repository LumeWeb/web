/* oxlint-disable perfectionist/sort-objects */
import { describe, expect, it, vi } from "vitest";
import { createSiaStreamService } from "../sia-stream-service.ts";

const connected = vi.fn();
const builderFree = vi.fn();
vi.mock("@siafoundation/sia-storage", () => ({
  AppKey: class AppKey {
    constructor(readonly value: Uint8Array) {}
  },
  Builder: class Builder {
    connected = connected;
    free = builderFree;
  },
  initSia: vi.fn(),
}));

describe("createSiaStreamService", () => {
  it("prepares once and shares the terminal availability result", async () => {
    let finish!: (value: boolean) => void;
    const enable = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          finish = resolve;
        }),
    );
    const service = createSiaStreamService({
      auth: {
        get: () => ({ indexerUrl: "x", userKeyHex: "u", sharingKeyHex: null }),
      },
      enableStreaming: enable,
    });
    const one = service.prepare();
    const two = service.isAvailable();
    expect(enable).toHaveBeenCalledTimes(1);
    finish(true);
    await expect(Promise.all([one, two])).resolves.toEqual([true, true]);
  });

  it("does not prepare when imported or constructed", () => {
    const enable = vi.fn(() => Promise.resolve(true));
    createSiaStreamService({
      auth: {
        get: () => ({ indexerUrl: "x", userKeyHex: "u", sharingKeyHex: null }),
      },
      enableStreaming: enable,
    });
    expect(enable).not.toHaveBeenCalled();
  });

  it("always frees the Builder when connection fails", async () => {
    connected.mockClear();
    builderFree.mockClear();
    connected.mockRejectedValueOnce(new Error("connected failed"));
    const service = createSiaStreamService({
      auth: {
        get: () => ({
          indexerUrl: "x",
          userKeyHex: "a".repeat(64),
          sharingKeyHex: null,
        }),
      },
    });
    await expect(
      service.session({ objectKey: "object", shared: false }),
    ).rejects.toThrow("connected failed");
    expect(builderFree).toHaveBeenCalledOnce();
  });

  it("rejects malformed app-key hex before connecting", async () => {
    connected.mockClear();
    const service = createSiaStreamService({
      auth: {
        get: () => ({
          indexerUrl: "x",
          userKeyHex: "odd",
          sharingKeyHex: null,
        }),
      },
    });
    await expect(
      service.session({ objectKey: "object", shared: false }),
    ).rejects.toThrow("64 hexadecimal characters");
    expect(connected).not.toHaveBeenCalled();
  });

  it("frees the object when aborted during object setup", async () => {
    let resolveObject!: (object: { free: () => void }) => void;
    const object = { free: vi.fn() };
    const sdk = {
      object: vi.fn(
        () =>
          new Promise<{ free: () => void }>(
            (resolve) => (resolveObject = resolve),
          ),
      ),
      free: vi.fn(),
    };
    const service = createSiaStreamService({
      auth: {
        get: () => ({ indexerUrl: "x", userKeyHex: "u", sharingKeyHex: null }),
      },
      connectApp: vi.fn(() => Promise.resolve(sdk as never)),
    });
    const controller = new AbortController();
    const session = service.session(
      { objectKey: "object", shared: false },
      controller.signal,
    );
    await vi.waitFor(() => expect(resolveObject).toBeDefined());
    controller.abort();
    resolveObject(object);
    await expect(session).rejects.toMatchObject({ name: "AbortError" });
    expect(object.free).toHaveBeenCalledOnce();
  });

  it("closes streams and frees the object when aborted during stream setup", async () => {
    const object = { free: vi.fn() };
    let resolveStreams!: (streams: { close: () => void }) => void;
    const streams = { close: vi.fn() };
    const sdk = {
      object: vi.fn(() => Promise.resolve(object)),
      free: vi.fn(),
    };
    const service = createSiaStreamService({
      auth: {
        get: () => ({ indexerUrl: "x", userKeyHex: "u", sharingKeyHex: null }),
      },
      connectApp: vi.fn(() => Promise.resolve(sdk as never)),
      openStreams: vi.fn(
        () =>
          new Promise<{ close: () => void }>(
            (resolve) => (resolveStreams = resolve),
          ),
      ) as never,
    });
    const controller = new AbortController();
    const session = service.session(
      { objectKey: "object", shared: false },
      controller.signal,
    );
    await vi.waitFor(() => expect(resolveStreams).toBeDefined());
    controller.abort();
    resolveStreams(streams);
    await expect(session).rejects.toMatchObject({ name: "AbortError" });
    expect(streams.close).toHaveBeenCalledOnce();
    expect(object.free).toHaveBeenCalledOnce();
  });
});
