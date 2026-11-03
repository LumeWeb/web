/** Every advertised adapter runs these state changes against the owned model. */
import { expect, it } from "vitest";
import { bytesFixture, createMockSia } from "../../src/mock.js";
import type {
  ActorRef,
  ApplicationPort,
  MockRun,
  MockSia,
} from "../../src/mock.js";
export const app = {
  description: "Owned writes",
  id: "a".repeat(64),
  name: "Writes",
  serviceUrl: "https://example.invalid",
};
export function applicationScenarios(
  connect: (
    mock: MockSia,
    run: MockRun,
    actor: ActorRef,
  ) => Promise<{ close: () => Promise<void>; writer: ApplicationPort }>,
  transport = false,
) {
  it("upload labels default to one descriptor snapshot without changing metadata", async () => {
    const mock = createMockSia();
    try {
      await mock.run({ app }, async (run) => {
        const { close, writer } = await connect(
          mock,
          run,
          mock.actor("writer"),
        );
        const reader = mock.reader({
          access: run.ownerAccess,
          as: mock.actor("reader"),
        });
        try {
          const source = await bytesFixture({
            bytes: Uint8Array.of(1, 2),
            name: "fixture",
          });
          const encoded = new TextEncoder().encode(
            '{"name":"independent%2Flabel"}',
          );
          for (const [name, metadata, descriptorName = "fixture"] of [
            [undefined, new Uint8Array()],
            [undefined, encoded],
            ["override", encoded],
            ["override", encoded, ""],
            ["override", encoded, "é".repeat(513)],
            ["   ", new Uint8Array()],
          ] as const) {
            let reads = 0;
            const file = {
              ...source,
              get name() {
                reads++;
                return reads === 1 ? descriptorName : "";
              },
            };
            const object = await writer.upload({ file, metadata, name });
            expect(reads).toBe(1);
            expect(await writer.inspect(object)).toBe("uploaded");
            await writer.pin(object);
            expect((await reader.object(object.id)).metadata).toEqual(metadata);
            expect(
              new Uint8Array(
                await new Response(await reader.download(object)).arrayBuffer(),
              ),
            ).toEqual(Uint8Array.of(1, 2));
          }
        } finally {
          await reader.close();
          await writer.close();
          await close();
        }
      });
    } finally {
      await mock.close();
    }
  });
  it("invalid explicit and fallback labels reject before opening a source", async () => {
    const mock = createMockSia();
    try {
      await mock.run({ app }, async (run) => {
        const { close, writer } = await connect(
          mock,
          run,
          mock.actor("writer"),
        );
        try {
          const source = await bytesFixture({
            bytes: Uint8Array.of(1),
            name: "fixture",
          });
          let opens = 0;
          const file = {
            ...source,
            open() {
              opens++;
              return source.open();
            },
          };
          for (const name of [
            "",
            null,
            1,
            false,
            "x".repeat(1025),
            "é".repeat(513),
          ]) {
            await expect(
              writer.upload({
                file,
                metadata: new Uint8Array(),
                name: name as string,
              }),
            ).rejects.toMatchObject({ code: "invalid-input" });
          }
          for (const name of ["", null, 1, "x".repeat(1025), "é".repeat(513)]) {
            await expect(
              writer.upload({
                file: { ...file, name: name as string },
                metadata: new Uint8Array(),
              }),
            ).rejects.toMatchObject({ code: "invalid-input" });
          }
          expect(opens).toBe(0);
        } finally {
          await writer.close();
          await close();
        }
      });
    } finally {
      await mock.close();
    }
  });
  it("a lost pin reply requires inspection and stays unpublished", async () => {
    const mock = createMockSia();
    try {
      await mock.run({ app }, async (run) => {
        const actor = mock.actor("writer");
        const { close, writer } = await connect(mock, run, actor);
        try {
          const file = await bytesFixture({
            bytes: Uint8Array.of(1),
            name: "n",
          });
          const object = await writer.upload({
            file,
            metadata: new Uint8Array(),
            name: "n",
          });
          mock.mutationFaults.loseReply(
            { actor, operation: "pin" },
            { times: 1 },
          );
          const outcome = await writer
            .pin(object)
            .catch((error: unknown) => error);
          if (transport) {
            expect(outcome).toBeInstanceOf(TypeError);
            expect(outcome).not.toHaveProperty("code", "unavailable");
          } else expect(outcome).toMatchObject({ code: "unavailable" });
          expect(await writer.inspect(object)).toBe("pinned");
          expect(
            (await writer.events({ cursor: null, limit: 10 })).events,
          ).toEqual([]);
          expect(
            mock.history().filter((row) => row.operation === "pin"),
          ).toMatchObject([{ committed: true, status: "failed" }]);
          await mock.publish({ access: run.ownerAccess });
          expect(
            (await writer.events({ cursor: null, limit: 10 })).events.map(
              (row) => row.id,
            ),
          ).toEqual([object.id]);
          const next = await writer.upload({
            file,
            metadata: new Uint8Array(),
            name: "n",
          });
          await writer.pin(next);
          expect(await writer.inspect(next)).toBe("pinned");
        } finally {
          await writer.close();
          await close();
        }
      });
    } finally {
      await mock.close();
    }
  });
  it("a held pin publishes only when the driver publishes its account", async () => {
    const mock = createMockSia({ clock: { start: "2026-01-01T00:00:00Z" } });
    try {
      await mock.run({ app }, async (run) => {
        const actor = mock.actor("writer");
        const { close, writer } = await connect(mock, run, actor);
        try {
          const file = await bytesFixture({
            bytes: Uint8Array.of(1, 2, 3),
            name: "note",
          });
          const object = await writer.upload({
            file,
            metadata: Uint8Array.of(7),
            name: file.name,
          });
          expect(await writer.inspect(object)).toBe("uploaded");
          const hold = mock.mutationFaults.hold({
            actor,
            operation: "pin",
            stage: "beforeCommit",
          });
          const pinning = writer.pin(object);
          await hold.started();
          expect(await writer.inspect(object)).toBe("uploaded");
          hold.release();
          await pinning;
          expect(await writer.inspect(object)).toBe("pinned");
          expect(
            (await writer.events({ cursor: null, limit: 1 })).events,
          ).toEqual([]);
          mock.advanceTime(1000);
          await mock.publish({ access: run.ownerAccess });
          const page = await writer.events({ cursor: null, limit: 1 });
          expect(page.events).toEqual([
            {
              deleted: false,
              id: object.id,
              updatedAt: "2026-01-01T00:00:01.000Z",
            },
          ]);
          expect(
            (await writer.events({ cursor: page.nextCursor, limit: 1 })).events,
          ).toEqual([]);
          await expect(writer.pin({ ...object })).rejects.toMatchObject({
            code: "foreign-handle",
          });
          await writer.delete(object);
          expect(await writer.inspect(object)).toBe("missing");
          mock.advanceTime(1000);
          await mock.publish({ access: run.ownerAccess });
          expect(
            (await writer.events({ cursor: page.nextCursor, limit: 2 })).events,
          ).toEqual([
            {
              deleted: true,
              id: object.id,
              updatedAt: "2026-01-01T00:00:02.000Z",
            },
          ]);
        } finally {
          await writer.close();
          await close();
        }
      });
    } finally {
      await mock.close();
    }
  });
  it("an aborted pin never appears after its hold is released", async () => {
    const mock = createMockSia();
    try {
      await mock.run({ app }, async (run) => {
        const actor = mock.actor("writer");
        const { close, writer } = await connect(mock, run, actor);
        try {
          const file = await bytesFixture({
            bytes: Uint8Array.of(1),
            name: "n",
          });
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
          const abort = new AbortController();
          const pin = writer
            .pin(object, { signal: abort.signal })
            .catch((error: unknown) => error);
          await hold.started();
          abort.abort();
          await hold.cancelled();
          hold.release();
          expect(await pin).toBeInstanceOf(Error);
          expect(await writer.inspect(object)).toBe("uploaded");
        } finally {
          await writer.close();
          await close();
        }
      });
    } finally {
      await mock.close();
    }
  });
  it("tied cursors retain a lower-ID tombstone published in a later second", async () => {
    const mock = createMockSia({ clock: { start: "2026-01-01T00:00:00Z" } });
    try {
      await mock.run({ app }, async (run) => {
        const { close, writer } = await connect(
          mock,
          run,
          mock.actor("writer"),
        );
        try {
          const file = await bytesFixture({
            bytes: Uint8Array.of(1),
            name: "n",
          });
          const input = { file, metadata: new Uint8Array(), name: file.name };
          const first = await writer.upload(input),
            second = await writer.upload(input);
          await writer.pin(first);
          await writer.pin(second);
          await mock.publish({ access: run.ownerAccess });
          const high = first.id < second.id ? second : first,
            low = first.id < second.id ? first : second;
          const page = await writer.events({ cursor: null, limit: 1 });
          expect(page.events.map((row) => row.id)).toEqual([low.id]);
          const next = await writer.events({
            cursor: page.nextCursor,
            limit: 1,
          });
          expect(next.events.map((row) => row.id)).toEqual([high.id]);
          await writer.delete(low);
          await mock.publish({ access: run.ownerAccess });
          expect(
            (await writer.events({ cursor: next.nextCursor, limit: 10 }))
              .events,
          ).toEqual([]);
          mock.advanceTime(1000);
          await mock.publish({ access: run.ownerAccess });
          expect(
            (await writer.events({ cursor: next.nextCursor, limit: 10 }))
              .events,
          ).toEqual([
            {
              deleted: true,
              id: low.id,
              updatedAt: "2026-01-01T00:00:01.000Z",
            },
          ]);
        } finally {
          await writer.close();
          await close();
        }
      });
    } finally {
      await mock.close();
    }
  });
  it("a pending upload can be deleted without becoming a feed event", async () => {
    const mock = createMockSia();
    try {
      await mock.run({ app }, async (run) => {
        const { close, writer } = await connect(
          mock,
          run,
          mock.actor("writer"),
        );
        try {
          const file = await bytesFixture({
            bytes: Uint8Array.of(1),
            name: "n",
          });
          const object = await writer.upload({
            file,
            metadata: new Uint8Array(),
            name: file.name,
          });
          await writer.delete(object);
          expect(await writer.inspect(object)).toBe("missing");
          await mock.publish({ access: run.ownerAccess });
          expect(
            (await writer.events({ cursor: null, limit: 10 })).events,
          ).toEqual([]);
          await expect(writer.pin(object)).rejects.toMatchObject({
            code: "not-found",
          });
        } finally {
          await writer.close();
          await close();
        }
      });
    } finally {
      await mock.close();
    }
  });

  it("recipient and registration credentials cannot create application payloads", async () => {
    const mock = createMockSia();
    try {
      await mock.run({ app }, async (run) => {
        const share = await run.shares.create({ objects: [] });
        const file = await bytesFixture({ bytes: Uint8Array.of(1), name: "n" });
        for (const access of [share.access, run.auth.registrationAccess]) {
          const { close, writer } = await connect(
            mock,
            { ...run, ownerAccess: access },
            mock.actor("denied"),
          );
          let opened = false;
          try {
            await expect(
              writer.upload({
                file: {
                  ...file,
                  open() {
                    opened = true;
                    return file.open();
                  },
                },
                metadata: new Uint8Array(),
                name: "n",
              }),
            ).rejects.toMatchObject({ code: "denied" });
            expect(opened).toBe(false);
          } finally {
            await writer.close();
            await close();
          }
        }
      });
    } finally {
      await mock.close();
    }
  });
}
