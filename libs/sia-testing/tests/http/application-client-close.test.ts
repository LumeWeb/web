import { createServer, type ServerResponse } from "node:http";
import { expect, it } from "vitest";
import { createMockApplication } from "../../src/client.js";
it("client close aborts an unanswered admission-cancel request", async () => {
  let cancelling!: () => void;
  const cancellation = new Promise<void>((resolve) => {
    cancelling = resolve;
  });
  let disconnected!: () => void;
  const disconnect = new Promise<void>((resolve) => {
    disconnected = resolve;
  });
  let stalled: ServerResponse | undefined;
  const server = createServer((request, response) => {
    request.resume();
    if (request.url?.endsWith("app-upload-admit"))
      response.setHeader("content-type", "application/json").end(
        JSON.stringify({
          expiresAt: Date.now() + 30_000,
          token:
            "a".repeat(8) +
            "-" +
            "b".repeat(4) +
            "-" +
            "c".repeat(4) +
            "-" +
            "d".repeat(4) +
            "-" +
            "e".repeat(12),
        }),
      );
    else {
      stalled = response;
      response.once("close", disconnected);
      cancelling();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("No listener address");
  const writer = createMockApplication(
    {
      client: "client",
      kind: "app-key",
      url: `http://127.0.0.1:${address.port}/`,
    },
    { keyHex: "a".repeat(64), kind: "app-key" },
  );
  let timer: ReturnType<typeof setTimeout> | undefined;
  const upload = writer
    .upload({
      file: {
        name: "n",
        open() {
          throw new Error("source unavailable");
        },
        sha256: "0".repeat(64),
        sizeBytes: 1,
      },
      metadata: new Uint8Array(),
      name: "n",
    })
    .catch((error: unknown) => error);
  try {
    await cancellation;
    const closing = writer.close();
    const closed = await Promise.race([
      closing.then(() => true),
      new Promise<boolean>((resolve) => {
        timer = setTimeout(() => resolve(false), 1000);
      }),
    ]);
    expect(closed).toBe(true);
    await disconnect;
    expect(await upload).toBeInstanceOf(Error);
  } finally {
    clearTimeout(timer);
    stalled?.end("null");
    await writer.close();
    await upload;
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
      server.closeAllConnections();
    });
  }
});
import { vi } from "vitest";
it("best-effort cancellation cannot extend the admission's original deadline", async () => {
  vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
  let started!: () => void;
  const cancelling = new Promise<void>((resolve) => {
    started = resolve;
  });
  let cancelled = false;
  vi.stubGlobal(
    "fetch",
    vi.fn((_url: unknown, init?: RequestInit) => {
      if (String(_url).includes("app-upload-admit"))
        return Promise.resolve(
          Response.json({
            expiresAt: Date.now() + 30_000,
            token:
              "a".repeat(8) +
              "-" +
              "b".repeat(4) +
              "-" +
              "c".repeat(4) +
              "-" +
              "d".repeat(4) +
              "-" +
              "e".repeat(12),
          }),
        );
      return new Promise<Response>((_resolve, reject) => {
        const abort = () => {
          cancelled = true;
          reject(
            new DOMException("Cancellation request aborted", "AbortError"),
          );
        };
        init?.signal?.addEventListener("abort", abort, { once: true });
        started();
        if (init?.signal?.aborted) abort();
      });
    }),
  );
  const writer = createMockApplication(
    { client: "client", kind: "app-key", url: "https://example.invalid/" },
    { keyHex: "a".repeat(64), kind: "app-key" },
  );
  const upload = writer
    .upload({
      file: {
        name: "n",
        open() {
          vi.advanceTimersByTime(29_000);
          throw new Error("source unavailable");
        },
        sha256: "0".repeat(64),
        sizeBytes: 1,
      },
      metadata: new Uint8Array(),
      name: "n",
    })
    .catch((error: unknown) => error);
  try {
    await cancelling;
    expect(cancelled).toBe(false);
    await vi.advanceTimersByTimeAsync(999);
    expect(cancelled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(cancelled).toBe(true);
    expect(await upload).toBeInstanceOf(Error);
  } finally {
    await writer.close();
    await upload;
    vi.unstubAllGlobals();
    vi.useRealTimers();
  }
});
