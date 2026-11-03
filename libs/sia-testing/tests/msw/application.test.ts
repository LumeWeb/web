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
}, true);
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
it("client close joins local source cancellation before settling", async () => {
  const mock = createMockSia();
  const endpoint = createMockHandlers(mock, {
    baseUrl: "https://source-join.example.invalid/",
  });
  const server = setupServer(...endpoint.handlers);
  server.listen({ onUnhandledRequest: "error" });
  let finish!: () => void;
  const finishing = new Promise<void>((resolve) => {
    finish = resolve;
  });
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
      let cancel!: () => void;
      const cancelling = new Promise<void>((resolve) => {
        cancel = resolve;
      });
      const upload = writer
        .upload({
          file: {
            name: "n",
            open() {
              opened();
              return new ReadableStream({
                async cancel() {
                  cancel();
                  await finishing;
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
      try {
        await opening;
        let settled = false;
        const closing = writer.close();
        void closing.then(() => {
          settled = true;
        });
        await cancelling;
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        expect(settled).toBe(false);
        finish();
        await closing;
        expect(await upload).toBeInstanceOf(Error);
      } finally {
        finish();
        await writer.close();
        await upload;
      }
    });
  } finally {
    finish();
    await endpoint.close();
    server.close();
    await mock.close();
  }
});
it("endpoint close joins post-effect delivery work without rolling back the pin", async () => {
  const mock = createMockSia();
  const endpoint = createMockHandlers(mock, {
    baseUrl: "https://delivery.example.invalid/",
  });
  const server = setupServer(...endpoint.handlers);
  server.listen({ onUnhandledRequest: "error" });
  let release!: () => void;
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  let effect!: () => void;
  const effected = new Promise<void>((resolve) => {
    effect = resolve;
  });
  const application = mock.application.bind(mock);
  // Delay adapter delivery after the real pin settles; no public post-commit hold is needed.
  const replace = vi.spyOn(mock, "application").mockImplementation((input) => {
    const port = application(input);
    return {
      ...port,
      async pin(object, options) {
        try {
          await port.pin(object, options);
        } finally {
          effect();
          await released;
        }
      },
    };
  });
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("writer");
      const connection = endpoint.connection({
        access: run.ownerAccess,
        as: actor,
      });
      const writer = createMockApplication(connection, connection.credential);
      try {
        const file = await bytesFixture({ bytes: Uint8Array.of(1), name: "n" });
        const object = await writer.upload({
          file,
          metadata: new Uint8Array(),
          name: "n",
        });
        for (const ref of [object, { ...object }]) {
          expect(() =>
            mock.mutationFaults.loseReply(
              { actor, object: ref, operation: "pin" },
              { times: 1 },
            ),
          ).toThrow();
        }
        mock.mutationFaults.loseReply(
          { actor, operation: "pin" },
          { times: 1 },
        );
        const abort = new AbortController();
        const pending = writer
          .pin(object, { signal: abort.signal })
          .catch((error: unknown) => error);
        await effected;
        expect(await writer.inspect(object)).toBe("pinned");
        expect(
          (await writer.events({ cursor: null, limit: 10 })).events,
        ).toEqual([]);
        let closed = false;
        const closing = endpoint.close();
        void closing.then(() => {
          closed = true;
        });
        abort.abort();
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        expect(closed).toBe(false);
        release();
        await closing;
        expect(await pending).toBeInstanceOf(Error);
        expect(
          mock.history().filter((row) => row.operation === "pin"),
        ).toMatchObject([{ committed: true, status: "failed" }]);
        const observer = application({
          access: run.ownerAccess,
          as: mock.actor("observer"),
        });
        try {
          expect(
            (await observer.events({ cursor: null, limit: 10 })).events,
          ).toEqual([]);
          await mock.publish({ access: run.ownerAccess });
          expect(
            (await observer.events({ cursor: null, limit: 10 })).events.map(
              (row) => row.id,
            ),
          ).toEqual([object.id]);
        } finally {
          await observer.close();
        }
      } finally {
        release();
        await writer.close();
      }
    });
  } finally {
    release();
    replace.mockRestore();
    await endpoint.close();
    server.close();
    await mock.close();
  }
});
