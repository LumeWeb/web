import { setupServer } from "msw/node";
import { createMockApplication } from "../../src/client.js";
import { createMockHandlers } from "../../src/msw.js";
import { applicationScenarios } from "../harness/application-scenarios.js";
applicationScenarios((mock, run, actor) => {
  const endpoint = createMockHandlers(mock, {
    baseUrl: "https://writes.example.invalid/",
  });
  const server = setupServer(...endpoint.handlers);
  server.listen({ onUnhandledRequest: "error" });
  const connection = endpoint.connection({
    access: run.ownerAccess,
    as: actor,
  });
  return Promise.resolve({
    async close() {
      await endpoint.close();
      server.close();
    },
    writer: createMockApplication(connection, connection.credential),
  });
});
import { expect, it, vi } from "vitest";
import { createMockSia } from "../../src/mock.js";
import { app } from "../harness/application-scenarios.js";
it("closing the client joins its admitted local source", async () => {
  const mock = createMockSia();
  const endpoint = createMockHandlers(mock, {
    baseUrl: "https://close.example.invalid/",
  });
  const server = setupServer(...endpoint.handlers);
  server.listen({ onUnhandledRequest: "error" });
  try {
    await mock.run({ app }, async (run) => {
      const connection = endpoint.connection({
        access: run.ownerAccess,
        as: mock.actor("writer"),
      });
      const writer = createMockApplication(connection, connection.credential);
      let opened!: () => void;
      const opening = new Promise<void>((resolve) => {
        opened = resolve;
      });
      let cancelled = false;
      const pending = writer
        .upload({
          file: {
            name: "n",
            open() {
              opened();
              return new ReadableStream({
                cancel() {
                  cancelled = true;
                },
              });
            },
            sha256: "0".repeat(64),
            sizeBytes: 1,
          },
          metadata: new Uint8Array(),
          name: "n",
        })
        .catch((error: unknown) => error);
      await opening;
      await writer.close();
      expect(cancelled).toBe(true);
      expect(await pending).toBeInstanceOf(Error);
    });
  } finally {
    vi.useRealTimers();
    await endpoint.close();
    server.close();
    await mock.close();
  }
});
it("backend close invalidates admission while the local collector stops at its original deadline", async () => {
  const mock = createMockSia();
  const endpoint = createMockHandlers(mock, {
    baseUrl: "https://expiry.example.invalid/",
  });
  const server = setupServer(...endpoint.handlers);
  server.listen({ onUnhandledRequest: "error" });
  try {
    await mock.run({ app }, async (run) => {
      const connection = endpoint.connection({
        access: run.ownerAccess,
        as: mock.actor("writer"),
      });
      const writer = createMockApplication(connection, connection.credential);
      let opened!: () => void;
      const opening = new Promise<void>((resolve) => {
        opened = resolve;
      });
      let cancelled = false;
      vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
      const pending = writer
        .upload({
          file: {
            name: "n",
            open() {
              opened();
              return new ReadableStream({
                cancel() {
                  cancelled = true;
                },
              });
            },
            sha256: "0".repeat(64),
            sizeBytes: 1,
          },
          metadata: new Uint8Array(),
          name: "n",
        })
        .catch((error: unknown) => error);
      await opening;
      await endpoint.close();
      expect(cancelled).toBe(false);
      await vi.advanceTimersByTimeAsync(29_999);
      expect(cancelled).toBe(false);
      await vi.advanceTimersByTimeAsync(1);
      expect(cancelled).toBe(true);
      expect(await pending).toBeInstanceOf(Error);
      await writer.close();
      vi.useRealTimers();
    });
  } finally {
    vi.useRealTimers();
    await endpoint.close();
    server.close();
    await mock.close();
  }
});
import { bytesFixture } from "../../src/mock.js";
it("endpoint close cancels a held pin without closing the client", async () => {
  const mock = createMockSia();
  const endpoint = createMockHandlers(mock, {
    baseUrl: "https://held-pin.example.invalid/",
  });
  const server = setupServer(...endpoint.handlers);
  server.listen({ onUnhandledRequest: "error" });
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("writer");
      const connection = endpoint.connection({
        access: run.ownerAccess,
        as: actor,
      });
      const writer = createMockApplication(connection, connection.credential);
      const reader = mock.reader({
        access: run.ownerAccess,
        as: mock.actor("observer"),
      });
      const file = await bytesFixture({ bytes: Uint8Array.of(1), name: "n" });
      const object = await writer.upload({
        file,
        metadata: new Uint8Array(),
        name: "n",
      });
      const hold = mock.mutationFaults.hold({
        actor,
        operation: "pin",
        stage: "beforeCommit",
      });
      const pinning = writer.pin(object).catch((error: unknown) => error);
      try {
        await hold.started();
        await endpoint.close();
        hold.release();
        const outcome = await pinning;
        expect(
          (await reader.objects({ limit: 10, offset: 0 })).objects,
        ).toEqual([]);
        expect(outcome).toBeInstanceOf(Error);
        expect(
          mock.history().filter((row) => row.operation === "pin"),
        ).toMatchObject([{ committed: false, status: "cancelled" }]);
      } finally {
        hold.release();
        await writer.close();
        await reader.close();
      }
    });
  } finally {
    await endpoint.close();
    server.close();
    await mock.close();
  }
});
