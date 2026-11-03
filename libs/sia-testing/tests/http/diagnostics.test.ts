/** Driver diagnostics identify callers and invalid fields without exposing application data. */
import { expect, it, vi } from "vitest";
import { bytesFixture, createMockSia } from "../../src/mock.js";
import {
  createMockApplication,
  createMockOwnerShares,
  createMockReader,
} from "../../src/client.js";
import { startMockServer } from "../../src/http.js";

const app = {
  description: "Synthetic data",
  id: "a".repeat(64),
  name: "Diagnostics",
  serviceUrl: "https://example.invalid",
};

it("listener shutdown reports closed and cancels only listener-owned reads", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("file picker");
      const server = await startMockServer(mock);
      const connection = server.connection({
        access: run.ownerAccess,
        as: actor,
      });
      const reader = createMockReader(connection, connection.credential);
      const direct = mock.reader({ access: run.ownerAccess, as: actor });
      try {
        const hold = mock.faults.hold({ actor, operation: "objects" });
        const pending = reader
          .objects({ limit: 1, offset: 0 })
          .catch((error: unknown) => error);
        await hold.started();
        await server.close();
        expect(await pending).toMatchObject({
          code: "closed",
        });
        expect(await pending).toHaveProperty(
          "message",
          expect.stringContaining("objects"),
        );
        const cancelled = await hold.cancelled();
        expect(cancelled).toMatchObject({
          actorLabel: "file picker",
          operation: "objects",
          status: "cancelled",
        });
        expect(cancelled).not.toHaveProperty("committed");
        expect(mock.history()).toEqual([cancelled]);
        expect((await direct.objects({ limit: 1, offset: 0 })).objects).toEqual(
          [],
        );
      } finally {
        await reader.close();
        await direct.close();
        await server.close();
      }
    });
  } finally {
    await mock.close();
  }
});

it("caller abort reasons and client close retain native cancellation", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("reader");
      const server = await startMockServer(mock);
      const connection = server.connection({
        access: run.ownerAccess,
        as: actor,
      });
      const reader = createMockReader(connection, connection.credential);
      try {
        const abort = new AbortController();
        const reason = new Error("caller stopped");
        const hold = mock.faults.hold({ actor, operation: "objects" });
        const pending = reader
          .objects({ limit: 1, offset: 0, signal: abort.signal })
          .catch((error: unknown) => error);
        await hold.started();
        abort.abort(reason);
        expect(await pending).toBe(reason);
        expect(await hold.cancelled()).toMatchObject({ status: "cancelled" });
        const second = mock.faults.hold({ actor, operation: "objects" });
        const closing = reader
          .objects({ limit: 1, offset: 0 })
          .catch((error: unknown) => error);
        await second.started();
        await reader.close();
        expect(await closing).toMatchObject({ name: "AbortError" });
        expect(await second.cancelled()).toMatchObject({ status: "cancelled" });
      } finally {
        await reader.close();
        await server.close();
      }
    });
  } finally {
    await mock.close();
  }
});

it("actor labels describe read and mutation snapshots without selecting equal-label actors", async () => {
  const mock = createMockSia();
  const foreign = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("preview");
      const other = mock.actor("preview");
      const reader = mock.reader({ access: run.ownerAccess, as: actor });
      const otherReader = mock.reader({ access: run.ownerAccess, as: other });
      const writer = mock.application({ access: run.ownerAccess, as: actor });
      const hold = mock.faults.hold({ actor, operation: "objects" });
      await otherReader.objects({ limit: 1, offset: 0 });
      const pending = reader
        .objects({ limit: 1, offset: 0 })
        .catch((error: unknown) => error);
      const started = await hold.started();
      expect(started).toMatchObject({
        actorLabel: "preview",
        status: "pending",
      });
      expect(started.actor).toBe(actor);
      hold.release();
      await pending;
      expect(started.status).toBe("pending");
      const file = await bytesFixture({
        bytes: Uint8Array.of(7),
        name: "private-name",
      });
      const object = await writer.upload({
        file,
        metadata: Uint8Array.of(9),
        name: file.name,
      });
      const mutation = mock.mutationFaults.hold({
        actor,
        operation: "pin",
        stage: "beforeCommit",
      });
      const abort = new AbortController();
      const pin = writer
        .pin(object, { signal: abort.signal })
        .catch((error: unknown) => error);
      expect(await mutation.started()).toMatchObject({
        actorLabel: "preview",
        committed: false,
        status: "pending",
      });
      abort.abort();
      await pin;
      expect(await mutation.cancelled()).toMatchObject({
        actorLabel: "preview",
        committed: false,
        status: "cancelled",
      });
      const history = mock.history();
      expect(
        history.every(
          (row) => "actorLabel" in row && row.actorLabel === "preview",
        ),
      ).toBe(true);
      expect(history[0]!.actor).toBe(other);
      expect(history[1]!.actor).toBe(actor);
      expect(JSON.stringify(history)).not.toContain(file.name);
      expect(() =>
        mock.faults.hold({
          actor: foreign.actor("preview"),
          operation: "objects",
        }),
      ).toThrow(expect.objectContaining({ code: "foreign-handle" }));
      await reader.close();
      await otherReader.close();
      await writer.close();
    });
  } finally {
    await mock.close();
    await foreign.close();
  }
});

it.each(["direct", "http"] as const)(
  "%s readers and owner ports identify invalid offset and limit",
  async (kind) => {
    const mock = createMockSia();
    try {
      await mock.run({ app }, async (run) => {
        const actor = mock.actor("listing");
        const server = await startMockServer(mock);
        const connection = server.connection({
          access: run.ownerAccess,
          as: actor,
        });
        const reader =
          kind === "direct"
            ? mock.reader({ access: run.ownerAccess, as: actor })
            : createMockReader(connection, connection.credential);
        const owner =
          kind === "direct"
            ? mock.ownerShares({ access: run.ownerAccess, as: actor })
            : createMockOwnerShares(connection, connection.credential);
        try {
          for (const port of [reader, owner]) {
            for (const field of ["offset", "limit"] as const) {
              const input =
                field === "offset"
                  ? { limit: 1, offset: -1 }
                  : { limit: -1, offset: 0 };
              const pending =
                "list" in port ? port.list(input) : port.objects(input);
              await expect(pending).rejects.toMatchObject({
                code: "invalid-input",
              });
              await expect(pending).rejects.toThrow(field);
            }
          }
          const missing = reader.object("f".repeat(64));
          await expect(missing).rejects.toMatchObject({ code: "not-found" });
          await expect(missing).rejects.toThrow(/object/i);
        } finally {
          await reader.close();
          await owner.close();
          await server.close();
        }
      });
    } finally {
      await mock.close();
    }
  },
);

it("application event errors identify the invalid limit over HTTP", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const server = await startMockServer(mock);
      const connection = server.connection({
        access: run.ownerAccess,
        as: mock.actor("events"),
      });
      const writer = createMockApplication(connection, connection.credential);
      try {
        const invalid = writer.events({ cursor: null, limit: -1 });
        await expect(invalid).rejects.toMatchObject({ code: "invalid-input" });
        await expect(invalid).rejects.toThrow("limit");
      } finally {
        await writer.close();
        await server.close();
      }
    });
  } finally {
    await mock.close();
  }
});

it.each([0, -1, 1.5, Infinity, NaN])(
  "invalid fault count %s has an invalid-input code",
  async (times) => {
    const mock = createMockSia();
    try {
      const actor = mock.actor("faults");
      const actions = [
        () =>
          mock.faults.fail(
            { actor, operation: "objects" },
            { code: "unavailable", times },
          ),
        () =>
          mock.mutationFaults.fail(
            { actor, operation: "pin", stage: "beforeCommit" },
            { code: "unavailable", times },
          ),
        () =>
          mock.mutationFaults.loseReply({ actor, operation: "pin" }, { times }),
      ];
      for (const action of actions) {
        expect(action).toThrow(
          expect.objectContaining({ code: "invalid-input" }),
        );
        expect(action).toThrow("times");
      }
    } finally {
      await mock.close();
    }
  },
);

it.each([
  { latencyMs: -1 },
  { latencyMs: Infinity },
  { latencyMs: NaN },
  { downloadBytesPerSecond: 0 },
  { downloadBytesPerSecond: -1 },
  { downloadBytesPerSecond: Infinity },
  { downloadBytesPerSecond: NaN },
])("invalid link value %j has an invalid-input code", async (input) => {
  const mock = createMockSia();
  try {
    const action = () => mock.faults.setLink(mock.actor("link"), input);
    expect(action).toThrow(expect.objectContaining({ code: "invalid-input" }));
    expect(action).toThrow(Object.keys(input)[0]!);
  } finally {
    await mock.close();
  }
});

it("evicting a held receipt keeps its labelled snapshots without reinserting history", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("held reader");
      const other = mock.actor("active reader");
      const held = mock.reader({ access: run.ownerAccess, as: actor });
      const active = mock.reader({ access: run.ownerAccess, as: other });
      const hold = mock.faults.hold({ actor, operation: "objects" });
      const abort = new AbortController();
      const pending = held
        .objects({ limit: 1, offset: 0, signal: abort.signal })
        .catch((error: unknown) => error);
      const started = await hold.started();
      for (let index = 0; index < 256; index++)
        await active.objects({ limit: 1, offset: 0 });
      const history = mock.history();
      expect(history).toHaveLength(256);
      expect(history.every((row) => row.actorLabel === "active reader")).toBe(
        true,
      );
      expect(history.some((row) => row.id === started.id)).toBe(false);
      abort.abort();
      await pending;
      expect(await hold.cancelled()).toMatchObject({
        actorLabel: "held reader",
        id: started.id,
        status: "cancelled",
      });
      expect(started.status).toBe("pending");
      expect(mock.history()).toEqual(history);
      await held.close();
      await active.close();
    });
  } finally {
    await mock.close();
  }
});

it("wire diagnostics omit callback messages and forged fields", async () => {
  const mock = createMockSia();
  const sentinel = "private-path-secret-credential";
  try {
    await mock.run({ app }, async (run) => {
      const server = await startMockServer(mock);
      const actor = mock.actor("reader");
      const connection = server.connection({
        access: run.ownerAccess,
        as: actor,
      });
      const direct = mock.reader({ access: run.ownerAccess, as: actor });
      const reader = createMockReader(connection, connection.credential);
      vi.spyOn(mock, "reader").mockImplementation(() => ({
        ...direct,
        objects: () =>
          Promise.reject(
            Object.assign(new Error(sentinel), {
              code: "invalid-input",
              field: "offset",
            }),
          ),
      }));
      try {
        const response = await fetch(
          new URL(
            `${connection.client}/objects?offset=0&limit=1`,
            connection.url,
          ),
          {
            headers: {
              authorization: `Bearer ${connection.credential.keyHex}`,
            },
          },
        );
        expect(await response.json()).toEqual({ code: "invalid-input" });
        await expect(
          reader.objects({ limit: 1, offset: 0 }),
        ).rejects.toMatchObject({
          code: "invalid-input",
          message: "objects: invalid input",
        });
        const malformed = await fetch(
          new URL(
            `${connection.client}/objects?offset=${sentinel}&limit=1`,
            connection.url,
          ),
          {
            headers: {
              authorization: `Bearer ${connection.credential.keyHex}`,
            },
          },
        );
        expect(await malformed.json()).toEqual({
          code: "invalid-input",
          field: "offset",
        });
      } finally {
        vi.restoreAllMocks();
        await direct.close();
        await reader.close();
        await server.close();
      }
    });
  } finally {
    vi.restoreAllMocks();
    await mock.close();
  }
});

it("listener shutdown cancels an uncommitted pin without closing a direct writer", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("uploader");
      const server = await startMockServer(mock);
      const connection = server.connection({
        access: run.ownerAccess,
        as: actor,
      });
      const writer = createMockApplication(connection, connection.credential);
      const direct = mock.application({
        access: run.ownerAccess,
        as: mock.actor("direct writer"),
      });
      try {
        const file = await bytesFixture({ bytes: Uint8Array.of(1), name: "n" });
        const object = await writer.upload({
          file,
          metadata: new Uint8Array(),
          name: file.name,
        });
        const hold = mock.mutationFaults.hold({
          actor,
          operation: "pin",
          stage: "beforeCommit",
        });
        const pending = writer.pin(object).catch((error: unknown) => error);
        await hold.started();
        await server.close();
        expect(await pending).toMatchObject({
          code: "closed",
        });
        expect(await pending).toHaveProperty(
          "message",
          expect.stringContaining("app-pin"),
        );
        expect(await hold.cancelled()).toMatchObject({
          actorLabel: "uploader",
          committed: false,
          status: "cancelled",
        });
        const another = await direct.upload({
          file,
          metadata: new Uint8Array(),
          name: file.name,
        });
        expect(await direct.inspect(another)).toBe("uploaded");
      } finally {
        await writer.close();
        await direct.close();
        await server.close();
      }
    });
  } finally {
    await mock.close();
  }
});

it("a lost pin response keeps its native delivery error and labelled committed receipt", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("pin caller");
      const server = await startMockServer(mock);
      const connection = server.connection({
        access: run.ownerAccess,
        as: actor,
      });
      const writer = createMockApplication(connection, connection.credential);
      try {
        const file = await bytesFixture({ bytes: Uint8Array.of(1), name: "n" });
        const object = await writer.upload({
          file,
          metadata: new Uint8Array(),
          name: file.name,
        });
        mock.mutationFaults.loseReply(
          { actor, operation: "pin" },
          { times: 1 },
        );
        const error: unknown = await writer
          .pin(object)
          .catch((reason: unknown) => reason);
        expect(error).toBeInstanceOf(TypeError);
        expect(error).toHaveProperty("cause");
        expect(error).not.toHaveProperty("code");
        expect(
          mock.history().filter((row) => row.operation === "pin"),
        ).toMatchObject([
          { actorLabel: "pin caller", committed: true, status: "failed" },
        ]);
        expect(await writer.inspect(object)).toBe("pinned");
        expect(
          (await writer.events({ cursor: null, limit: 10 })).events,
        ).toEqual([]);
      } finally {
        await writer.close();
        await server.close();
      }
    });
  } finally {
    await mock.close();
  }
});
