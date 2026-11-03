import { expect, it } from "vitest";
import { bytesFixture, createMockSia } from "../../src/mock.js";
const app = {
  description: "Owned writes",
  id: "a".repeat(64),
  name: "Writes",
  serviceUrl: "https://example.invalid",
};
it("a pin stays hidden until its run publishes", async () => {
  const mock = createMockSia({ clock: { start: "2026-01-01T00:00:00Z" } });
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("writer");
      const writer = mock.application({ access: run.ownerAccess, as: actor });
      const file = await bytesFixture({
        bytes: Uint8Array.of(1, 2, 3),
        name: "note",
      });
      const object = await writer.upload({
        file,
        metadata: new Uint8Array(),
        name: file.name,
      });
      expect(await writer.inspect(object)).toBe("uploaded");
      const hold = mock.mutationFaults.hold({
        actor,
        object,
        operation: "pin",
        stage: "beforeCommit",
      });
      const pin = writer.pin(object);
      await hold.started();
      expect(await writer.inspect(object)).toBe("uploaded");
      hold.release();
      await pin;
      expect(await writer.inspect(object)).toBe("pinned");
      expect((await writer.events({ cursor: null, limit: 10 })).events).toEqual(
        [],
      );
      mock.advanceTime(1000);
      await mock.publish({ access: run.ownerAccess });
      expect((await writer.events({ cursor: null, limit: 10 })).events).toEqual(
        [
          {
            deleted: false,
            id: object.id,
            updatedAt: "2026-01-01T00:00:01.000Z",
          },
        ],
      );
      await writer.close();
    });
  } finally {
    await mock.close();
  }
});
it("deleting a pending upload leaves sibling payloads readable after pinning", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const writer = mock.application({
        access: run.ownerAccess,
        as: mock.actor("writer"),
      });
      const file = await bytesFixture({
        bytes: Uint8Array.of(1),
        name: "note",
      });
      const input = { file, metadata: new Uint8Array(), name: file.name };
      const first = await writer.upload(input);
      const second = await writer.upload(input);
      await writer.delete(first);
      expect(await writer.inspect(first)).toBe("missing");
      expect(await writer.inspect(second)).toBe("uploaded");
      await writer.pin(second);
      const reader = mock.reader({
        access: run.ownerAccess,
        as: mock.actor("reader"),
      });
      expect(await reader.object(second.id)).toMatchObject({ sizeBytes: 1 });
      expect(
        await new Response(await reader.download(second)).arrayBuffer(),
      ).toEqual(Uint8Array.of(1).buffer);
      await reader.close();
      await writer.close();
    });
  } finally {
    await mock.close();
  }
});
it("failed upload reservations allow another source within the byte allowance", async () => {
  const mock = createMockSia();
  try {
    await mock.run(
      { app, limits: { maxLogicalUploadBytes: 1, maxObjects: 3 } },
      async (run) => {
        const actor = mock.actor("writer");
        const writer = mock.application({ access: run.ownerAccess, as: actor });
        const file = await bytesFixture({
          bytes: Uint8Array.of(1),
          name: "note",
        });
        const input = { file, metadata: new Uint8Array(), name: file.name };
        mock.mutationFaults.fail(
          { actor, operation: "upload", stage: "beforeCommit" },
          { code: "unavailable", times: 1 },
        );
        await expect(writer.upload(input)).rejects.toMatchObject({
          code: "unavailable",
        });
        const object = await writer.upload(input);
        const reader = mock.reader({
          access: run.ownerAccess,
          as: mock.actor("reader"),
        });
        await expect(reader.object(object.id)).rejects.toMatchObject({
          code: "not-found",
        });
        await expect(reader.download(object)).rejects.toMatchObject({
          code: "not-found",
        });
        expect(
          (await reader.objects({ limit: 10, offset: 0 })).objects,
        ).toEqual([]);
        await writer.delete(object);
        let opened = false;
        await expect(
          writer.upload({
            ...input,
            file: {
              ...file,
              open() {
                opened = true;
                return file.open();
              },
            },
          }),
        ).rejects.toMatchObject({ code: "limit" });
        expect(opened).toBe(false);
        await reader.close();
        await writer.close();
      },
    );
  } finally {
    await mock.close();
  }
});
it("mutation receipts record completed effects without keeping private upload fields", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("writer");
      const writer = mock.application({ access: run.ownerAccess, as: actor });
      const file = await bytesFixture({
        bytes: Uint8Array.of(1),
        name: "private-name",
      });
      await writer.upload({
        file,
        metadata: Uint8Array.of(42),
        name: file.name,
      });
      expect(
        mock.history().filter((row) => row.operation === "upload"),
      ).toMatchObject([{ committed: true, status: "completed" }]);
      expect(JSON.stringify(mock.history())).not.toContain("private-name");
      await writer.close();
    });
  } finally {
    await mock.close();
  }
});
it("an oversized metadata view is rejected before its source opens", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const writer = mock.application({
        access: run.ownerAccess,
        as: mock.actor("writer"),
      });
      let opened = false;
      const file = await bytesFixture({
        bytes: Uint8Array.of(1),
        name: "note",
      });
      const metadata = new Uint8Array(1025);
      Object.defineProperty(metadata, "length", { value: 0 });
      await expect(
        writer.upload({
          file: {
            ...file,
            open() {
              opened = true;
              return file.open();
            },
          },
          metadata,
          name: file.name,
        }),
      ).rejects.toMatchObject({ code: "invalid-input" });
      expect(opened).toBe(false);
      await writer.close();
    });
  } finally {
    await mock.close();
  }
});
it("closing a writer retains a source cancellation failure", async () => {
  const mock = createMockSia();
  const failure = new Error("source cancellation failed");
  try {
    await expect(
      mock.run({ app }, async (run) => {
        const writer = mock.application({
          access: run.ownerAccess,
          as: mock.actor("writer"),
        });
        let opened!: () => void;
        const opening = new Promise<void>((resolve) => {
          opened = resolve;
        });
        const pending = writer.upload({
          file: {
            name: "held",
            open() {
              opened();
              return new ReadableStream({
                cancel() {
                  throw failure;
                },
              });
            },
            sha256: "0".repeat(64),
            sizeBytes: 1,
          },
          metadata: new Uint8Array(),
          name: "held",
        });
        const outcome = pending.catch((error: unknown) => error);
        await opening;
        await expect(writer.close()).rejects.toBeInstanceOf(AggregateError);
        expect(await outcome).toBeInstanceOf(AggregateError);
      }),
    ).rejects.toBeInstanceOf(AggregateError);
  } finally {
    await mock.close();
  }
});
import { applicationScenarios } from "./application-scenarios.js";
applicationScenarios((mock, run, actor) =>
  Promise.resolve({
    close: () => Promise.resolve(),
    writer: mock.application({ access: run.ownerAccess, as: actor }),
  }),
);
it("copied actors and objects cannot select another caller's controls", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("writer");
      expect(() =>
        mock.faults.hold({ actor: { ...actor }, operation: "objects" }),
      ).toThrow();
      const file = await bytesFixture({ bytes: Uint8Array.of(1), name: "n" });
      const object = await run.objects.upload({
        file,
        metadata: new Uint8Array(),
        name: file.name,
      });
      expect(() =>
        mock.faults.hold({ actor, object: { ...object }, operation: "object" }),
      ).toThrow();
    });
  } finally {
    await mock.close();
  }
});
it("publication cannot flush another run's pending events", async () => {
  const mock = createMockSia({ clock: { start: "2026-01-01T00:00:00Z" } });
  try {
    await mock.run({ app }, async (first) => {
      await mock.run({ app }, async (second) => {
        const firstWriter = mock.application({
          access: first.ownerAccess,
          as: mock.actor("first"),
        });
        const secondWriter = mock.application({
          access: second.ownerAccess,
          as: mock.actor("second"),
        });
        try {
          const file = await bytesFixture({
            bytes: Uint8Array.of(1),
            name: "n",
          });
          const object = await secondWriter.upload({
            file,
            metadata: new Uint8Array(),
            name: "n",
          });
          await secondWriter.pin(object);
          await expect(firstWriter.inspect(object)).rejects.toMatchObject({
            code: "foreign-handle",
          });
          await expect(
            first.objects.delete(object as never),
          ).rejects.toMatchObject({ code: "foreign-handle" });
          await mock.publish({ access: first.ownerAccess });
          expect(
            (await secondWriter.events({ cursor: null, limit: 10 })).events,
          ).toEqual([]);
          await mock.publish({ access: second.ownerAccess });
          expect(
            (await secondWriter.events({ cursor: null, limit: 10 })).events.map(
              (row) => row.id,
            ),
          ).toEqual([object.id]);
        } finally {
          await firstWriter.close();
          await secondWriter.close();
        }
      });
    });
  } finally {
    await mock.close();
  }
});
import { createMockNetwork } from "../../src/sdk/index.js";
it("discarding a pending upload refuses a logical pin without pruning siblings", async () => {
  const network = createMockNetwork();
  network.model.createAccount({ publicKey: "account" });
  const sdk = network.createSdk({ accountId: "account" });
  const first = await sdk.upload(Uint8Array.of(1), { id: "first" });
  const second = await sdk.upload(Uint8Array.of(2), { id: "second" });
  await sdk.pinObject(first);
  expect(() => network.discardUpload("account", "first")).toThrow(
    "Cannot discard a pinned object",
  );
  network.discardUpload("account", "second");
  expect(await new Response(await sdk.download(first)).arrayBuffer()).toEqual(
    Uint8Array.of(1).buffer,
  );
  await expect(sdk.download(second)).rejects.toThrow();
});
it("run cleanup reports cancellation errors even when the caller did not close its port", async () => {
  const mock = createMockSia();
  let outcome: Promise<unknown> | undefined;
  try {
    await expect(
      mock.run({ app }, async (run) => {
        const writer = mock.application({
          access: run.ownerAccess,
          as: mock.actor("writer"),
        });
        let opened!: () => void;
        const opening = new Promise<void>((resolve) => {
          opened = resolve;
        });
        outcome = writer
          .upload({
            file: {
              name: "n",
              open() {
                opened();
                return new ReadableStream({
                  cancel() {
                    throw new Error("cancel failed");
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
      }),
    ).rejects.toBeInstanceOf(AggregateError);
    expect(await outcome).toBeInstanceOf(AggregateError);
  } finally {
    await mock.close();
  }
});
it("mutation controls reject unsupported failure codes", () => {
  const mock = createMockSia();
  expect(() =>
    mock.mutationFaults.fail({ operation: "pin", stage: "beforeCommit" }, {
      code: "reply-lost",
      times: 1,
    } as never),
  ).toThrow();
});
it("feed cursors reject dates normalized to a different calendar day", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const writer = mock.application({
        access: run.ownerAccess,
        as: mock.actor("writer"),
      });
      try {
        await expect(
          writer.events({
            cursor: { after: "2026-02-31T00:00:00.000Z", id: "a".repeat(64) },
            limit: 1,
          }),
        ).rejects.toMatchObject({ code: "invalid-input" });
      } finally {
        await writer.close();
      }
    });
  } finally {
    await mock.close();
  }
});
it("a rejected upload retains its source cancellation error for cleanup", async () => {
  const mock = createMockSia();
  let closeError: unknown;
  try {
    await expect(
      mock.run({ app }, async (run) => {
        const writer = mock.application({
          access: run.ownerAccess,
          as: mock.actor("writer"),
        });
        await expect(
          writer.upload({
            file: {
              name: "n",
              open() {
                return new ReadableStream({
                  cancel() {
                    throw new Error("source cancel failed");
                  },
                  start(controller) {
                    controller.enqueue(Uint8Array.of(1, 2));
                  },
                });
              },
              sha256: "0".repeat(64),
              sizeBytes: 1,
            },
            metadata: new Uint8Array(),
            name: "n",
          }),
        ).rejects.toBeInstanceOf(AggregateError);
        closeError = await writer.close().catch((error: unknown) => error);
      }),
    ).rejects.toBeInstanceOf(AggregateError);
    expect(closeError).toBeInstanceOf(AggregateError);
  } finally {
    await mock.close();
  }
});
import { vi } from "vitest";
it("an oversized name is rejected before allocating its UTF-8 bytes", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const writer = mock.application({
        access: run.ownerAccess,
        as: mock.actor("writer"),
      });
      const file = await bytesFixture({ bytes: Uint8Array.of(1), name: "n" });
      const encode = vi.spyOn(TextEncoder.prototype, "encode");
      try {
        await expect(
          writer.upload({
            file,
            metadata: new Uint8Array(),
            name: "n".repeat(1025),
          }),
        ).rejects.toMatchObject({ code: "invalid-input" });
        expect(encode).not.toHaveBeenCalled();
      } finally {
        encode.mockRestore();
        await writer.close();
      }
    });
  } finally {
    await mock.close();
  }
});
it("copied and foreign direct references cannot leave a mutation control armed", async () => {
  const first = createMockSia(),
    second = createMockSia();
  try {
    await first.run({ app }, async (run) => {
      const actor = first.actor("writer");
      const writer = first.application({ access: run.ownerAccess, as: actor });
      try {
        const file = await bytesFixture({ bytes: Uint8Array.of(1), name: "n" });
        const object = await writer.upload({
          file,
          metadata: new Uint8Array(),
          name: "n",
        });
        expect(() =>
          first.mutationFaults.hold({
            actor,
            object: { ...object },
            operation: "pin",
            stage: "beforeCommit",
          }),
        ).toThrow();
        expect(() =>
          second.mutationFaults.fail(
            { object, operation: "pin", stage: "beforeCommit" },
            { code: "denied", times: 1 },
          ),
        ).toThrow();
        const abort = new AbortController();
        await writer.pin(object, { signal: abort.signal });
        abort.abort();
        expect(await writer.inspect(object)).toBe("pinned");
      } finally {
        await writer.close();
      }
    });
  } finally {
    await first.close();
    await second.close();
  }
});
it("a cancelled released SDK pin cannot create a logical object", async () => {
  const network = createMockNetwork();
  network.model.createAccount({ publicKey: "account" });
  const sdk = network.createSdk({ accountId: "account" });
  const object = await sdk.upload(Uint8Array.of(1), { id: "cancelled" });
  const release = network.control.hold({ operation: "pinObject" });
  const abort = new AbortController();
  const pin = sdk.pinObject(object, { signal: abort.signal });
  release();
  queueMicrotask(() => abort.abort());
  await expect(pin).rejects.toBeInstanceOf(Error);
  expect(network.model.object("account", "cancelled")).toBeUndefined();
});
it("a cancelled SDK transfer cannot create a payload slab", async () => {
  const network = createMockNetwork();
  network.model.createAccount({ publicKey: "account" });
  const sdk = network.createSdk({ accountId: "account" });
  const abort = new AbortController();
  const upload = sdk.upload(Uint8Array.of(1), {
    id: "cancelled",
    signal: abort.signal,
  });
  queueMicrotask(() => queueMicrotask(() => abort.abort()));
  await expect(upload).rejects.toBeInstanceOf(Error);
  expect(network.model.listSlabs("account")).toEqual([]);
});
