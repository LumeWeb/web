/* oxlint-disable perfectionist/sort-objects */
import { describe, expect, it, vi } from "vitest";
import { createSiaStreamService } from "../sia-stream-service.ts";

interface ProcessLike {
  off: (
    event: "unhandledRejection",
    listener: (reason: unknown) => void,
  ) => void;
  on: (
    event: "unhandledRejection",
    listener: (reason: unknown) => void,
  ) => void;
}

/** Observe unhandled rejections in both Node and browser test runners. */
function trackUnhandledRejections(): {
  count: () => number;
  dispose: () => void;
} {
  let count = 0;
  const nodeProcess = (
    globalThis as typeof globalThis & { process?: ProcessLike }
  ).process;
  if (nodeProcess) {
    const listener = () => {
      count++;
    };
    nodeProcess.on("unhandledRejection", listener);
    return {
      count: () => count,
      dispose: () => nodeProcess.off("unhandledRejection", listener),
    };
  }

  const listener = (event: PromiseRejectionEvent) => {
    event.preventDefault();
    count++;
  };
  globalThis.addEventListener("unhandledrejection", listener);
  return {
    count: () => count,
    dispose: () =>
      globalThis.removeEventListener("unhandledrejection", listener),
  };
}

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

  it("rejects immediately when aborted during object setup and cleans up when it resolves", async () => {
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
    await vi.waitFor(() => expect(sdk.object).toHaveBeenCalledOnce());
    controller.abort();
    await expect(
      Promise.race([
        session,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("abort timeout")), 100),
        ),
      ]),
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(object.free).not.toHaveBeenCalled();
    resolveObject(object);
    await vi.waitFor(() => expect(object.free).toHaveBeenCalledOnce());
  });

  it("rejects immediately when aborted during stream setup and cleans up when it resolves", async () => {
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
    await vi.waitFor(() => expect(sdk.object).toHaveBeenCalledOnce());
    await vi.waitFor(() => expect(resolveStreams).toBeDefined());
    controller.abort();
    await expect(
      Promise.race([
        session,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("abort timeout")), 100),
        ),
      ]),
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(streams.close).not.toHaveBeenCalled();
    resolveStreams(streams);
    await vi.waitFor(() => expect(streams.close).toHaveBeenCalledOnce());
    expect(object.free).toHaveBeenCalledOnce();
  });

  it("releases the SDK reference when object setup throws synchronously", async () => {
    const sdk = {
      object: vi.fn(() => {
        throw new Error("object failed");
      }),
      free: vi.fn(),
    };
    const service = createSiaStreamService({
      auth: {
        get: () => ({ indexerUrl: "x", userKeyHex: "u", sharingKeyHex: null }),
      },
      connectApp: vi.fn(() => Promise.resolve(sdk as never)),
    });
    await expect(
      service.session({ objectKey: "object", shared: false }),
    ).rejects.toThrow("object failed");
    service.dispose();
    expect(sdk.free).toHaveBeenCalledOnce();
  });

  it("releases the SDK reference when stream setup throws synchronously", async () => {
    const object = { free: vi.fn() };
    const sdk = {
      object: vi.fn(() => Promise.resolve(object)),
      free: vi.fn(),
    };
    const service = createSiaStreamService({
      auth: {
        get: () => ({ indexerUrl: "x", userKeyHex: "u", sharingKeyHex: null }),
      },
      connectApp: vi.fn(() => Promise.resolve(sdk as never)),
      openStreams: vi.fn(() => {
        throw new Error("streams failed");
      }),
    });
    await expect(
      service.session({ objectKey: "object", shared: false }),
    ).rejects.toThrow("streams failed");
    expect(object.free).toHaveBeenCalledOnce();
    service.dispose();
    expect(sdk.free).toHaveBeenCalledOnce();
  });

  it("holds the SDK until pending object cleanup after disposal", async () => {
    let resolveObject!: (object: { free: () => void }) => void;
    const order: string[] = [];
    const object = { free: vi.fn(() => order.push("object")) };
    const sdk = {
      object: vi.fn(
        () =>
          new Promise<{ free: () => void }>(
            (resolve) => (resolveObject = resolve),
          ),
      ),
      free: vi.fn(() => order.push("sdk")),
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
    service.dispose();
    expect(sdk.free).not.toHaveBeenCalled();
    resolveObject(object);
    await expect(session).rejects.toMatchObject({ name: "AbortError" });
    await vi.waitFor(() => expect(sdk.free).toHaveBeenCalledOnce());
    expect(order).toEqual(["object", "sdk"]);
  });

  it("holds the SDK until pending stream cleanup after disposal", async () => {
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
    service.dispose();
    expect(sdk.free).not.toHaveBeenCalled();
    resolveStreams(streams);
    await expect(session).rejects.toMatchObject({ name: "AbortError" });
    await vi.waitFor(() => expect(sdk.free).toHaveBeenCalledOnce());
    expect(streams.close).toHaveBeenCalledOnce();
    expect(object.free).toHaveBeenCalledOnce();
  });

  it("continues cleanup when streams close throws and remains idempotent", async () => {
    const order: string[] = [];
    const object = { free: vi.fn(() => order.push("object")) };
    const streams = {
      url: vi.fn(() => Promise.reject(new Error("url failed"))),
      close: vi.fn(() => {
        order.push("streams");
        throw new Error("close failed");
      }),
    };
    const sdk = {
      object: vi.fn(() => Promise.resolve(object)),
      free: vi.fn(),
    };
    const service = createSiaStreamService({
      auth: {
        get: () => ({ indexerUrl: "x", userKeyHex: "u", sharingKeyHex: null }),
      },
      connectApp: vi.fn(() => Promise.resolve(sdk as never)),
      openStreams: vi.fn(() => Promise.resolve(streams)) as never,
    });
    const session = await service.session({
      objectKey: "object",
      shared: false,
    });
    await expect(session.url("source", { name: "file" })).rejects.toThrow(
      "close failed",
    );
    expect(object.free).toHaveBeenCalledOnce();
    expect(order).toEqual(["streams", "object"]);
    await expect(session.url("source", { name: "file" })).rejects.toThrow(
      "url failed",
    );
    expect(streams.close).toHaveBeenCalledOnce();
  });

  it("preserves the operation error when SDK cleanup throws during close", async () => {
    const object = { free: vi.fn() };
    const streams = {
      url: vi.fn(() => Promise.reject(new Error("url failed"))),
      close: vi.fn(),
    };
    const sdk = {
      object: vi.fn(() => Promise.resolve(object)),
      free: vi.fn(() => {
        throw new Error("sdk free failed");
      }),
    };
    const service = createSiaStreamService({
      auth: {
        get: () => ({ indexerUrl: "x", userKeyHex: "u", sharingKeyHex: null }),
      },
      connectApp: vi.fn(() => Promise.resolve(sdk as never)),
      openStreams: vi.fn(() => Promise.resolve(streams)) as never,
    });
    const session = await service.session({
      objectKey: "object",
      shared: false,
    });
    service.dispose();

    await expect(session.url("source", { name: "file" })).rejects.toThrow(
      "url failed",
    );
    expect(streams.close).toHaveBeenCalledOnce();
    expect(object.free).toHaveBeenCalledOnce();
    expect(sdk.free).toHaveBeenCalledOnce();
  });

  it("rejects preparation after disposal without restarting it", async () => {
    const enable = vi.fn(() => Promise.resolve(true));
    const service = createSiaStreamService({
      auth: {
        get: () => ({ indexerUrl: "x", userKeyHex: "u", sharingKeyHex: null }),
      },
      enableStreaming: enable,
    });
    await expect(service.prepare()).resolves.toBe(true);
    service.dispose();
    await expect(service.prepare()).rejects.toThrow("disposed");
    await expect(service.isAvailable()).rejects.toThrow("disposed");
    expect(enable).toHaveBeenCalledOnce();
  });

  it("does not reject detached object cleanup when object and SDK free throw", async () => {
    let resolveObject!: (object: { free: () => void }) => void;
    const unhandled = trackUnhandledRejections();
    const object = {
      free: vi.fn(() => {
        throw new Error("object free failed");
      }),
    };
    const sdk = {
      object: vi.fn(
        () =>
          new Promise<{ free: () => void }>((resolve) => {
            resolveObject = resolve;
          }),
      ),
      free: vi.fn(() => {
        throw new Error("sdk free failed");
      }),
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
    service.dispose();
    resolveObject(object);
    await expect(session).rejects.toMatchObject({ name: "AbortError" });
    await new Promise((resolve) => setTimeout(resolve, 0));
    unhandled.dispose();
    expect(unhandled.count()).toBe(0);
    expect(object.free).toHaveBeenCalledOnce();
    expect(sdk.free).toHaveBeenCalledOnce();
  });

  it("does not reject detached stream cleanup when object and SDK free throw", async () => {
    let resolveStreams!: (streams: { close: () => void }) => void;
    const unhandled = trackUnhandledRejections();
    const object = {
      free: vi.fn(() => {
        throw new Error("object free failed");
      }),
    };
    const sdk = {
      object: vi.fn(() => Promise.resolve(object)),
      free: vi.fn(() => {
        throw new Error("sdk free failed");
      }),
    };
    const streams = { close: vi.fn() };
    const service = createSiaStreamService({
      auth: {
        get: () => ({ indexerUrl: "x", userKeyHex: "u", sharingKeyHex: null }),
      },
      connectApp: vi.fn(() => Promise.resolve(sdk as never)),
      openStreams: vi.fn(
        () =>
          new Promise<{ close: () => void }>((resolve) => {
            resolveStreams = resolve;
          }),
      ) as never,
    });
    const controller = new AbortController();
    const session = service.session(
      { objectKey: "object", shared: false },
      controller.signal,
    );
    await vi.waitFor(() => expect(resolveStreams).toBeDefined());
    controller.abort();
    service.dispose();
    resolveStreams(streams);
    await expect(session).rejects.toMatchObject({ name: "AbortError" });
    await new Promise((resolve) => setTimeout(resolve, 0));
    unhandled.dispose();
    expect(unhandled.count()).toBe(0);
    expect(streams.close).toHaveBeenCalledOnce();
    expect(object.free).toHaveBeenCalledOnce();
    expect(sdk.free).toHaveBeenCalledOnce();
  });

  it("cleans up all resources when file release throws during normal release", async () => {
    const file = {
      blob: new Blob(),
      url: "blob:test",
      release: vi.fn(() => {
        throw new Error("file release failed");
      }),
    };
    const streams = {
      url: vi.fn(() => Promise.resolve(file)),
      close: vi.fn(),
    };
    const object = { free: vi.fn() };
    const sdk = {
      object: vi.fn(() => Promise.resolve(object)),
      free: vi.fn(),
    };
    const service = createSiaStreamService({
      auth: {
        get: () => ({ indexerUrl: "x", userKeyHex: "u", sharingKeyHex: null }),
      },
      connectApp: vi.fn(() => Promise.resolve(sdk as never)),
      openStreams: vi.fn(() => Promise.resolve(streams)) as never,
    });
    const session = await service.session({
      objectKey: "object",
      shared: false,
    });
    const nativeFile = await session.url("source", { name: "file" });

    expect(() => nativeFile.release()).toThrow("file release failed");
    expect(file.release).toHaveBeenCalledOnce();
    expect(streams.close).toHaveBeenCalledOnce();
    expect(object.free).toHaveBeenCalledOnce();
    service.dispose();
    expect(sdk.free).toHaveBeenCalledOnce();
  });

  it("preserves AbortError and cleans up when file release throws during abort", async () => {
    interface TestFile {
      blob: Blob;
      release: () => void;
      url: string;
    }
    let resolveFile!: (file: TestFile) => void;
    const fileValue: TestFile = {
      blob: new Blob(),
      release: vi.fn(() => {
        throw new Error("file release failed");
      }),
      url: "blob:test",
    };
    const streams = {
      url: vi.fn(
        () =>
          new Promise<typeof fileValue>((resolve) => {
            resolveFile = resolve;
          }),
      ),
      close: vi.fn(),
    };
    const object = { free: vi.fn() };
    const sdk = {
      object: vi.fn(() => Promise.resolve(object)),
      free: vi.fn(),
    };
    const service = createSiaStreamService({
      auth: {
        get: () => ({ indexerUrl: "x", userKeyHex: "u", sharingKeyHex: null }),
      },
      connectApp: vi.fn(() => Promise.resolve(sdk as never)),
      openStreams: vi.fn(() => Promise.resolve(streams)) as never,
    });
    const session = await service.session({
      objectKey: "object",
      shared: false,
    });
    const controller = new AbortController();
    const url = session.url("source", {
      name: "file",
      signal: controller.signal,
    });
    await vi.waitFor(() => expect(resolveFile).toBeDefined());
    controller.abort();
    resolveFile(fileValue);

    await expect(url).rejects.toMatchObject({ name: "AbortError" });
    expect(fileValue.release).toHaveBeenCalledOnce();
    expect(streams.close).toHaveBeenCalledOnce();
    expect(object.free).toHaveBeenCalledOnce();
    service.dispose();
    expect(sdk.free).toHaveBeenCalledOnce();
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
