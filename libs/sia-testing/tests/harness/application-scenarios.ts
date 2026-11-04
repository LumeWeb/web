/** Every advertised adapter runs these state changes against the owned model. */
import { foreignMetadata } from "./foreign-metadata.js";
import { expect, it, vi } from "vitest";
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
  it("rejects non-string event cursor IDs without coercing them", async () => {
    const mock = createMockSia();
    try {
      await mock.run({ app }, async (run) => {
        const { close, writer } = await connect(
          mock,
          run,
          mock.actor("writer"),
        );
        try {
          const coerce = vi.fn(() => "a".repeat(64));
          const id = transport ? ["a".repeat(64)] : { toString: coerce };
          const outcome = await writer
            .events({
              cursor: {
                after: "2026-01-01T00:00:00.000Z",
                id: id as unknown as string,
              },
              limit: 1,
            })
            .catch((error: unknown) => error);
          expect(coerce).not.toHaveBeenCalled();
          expect(outcome).toMatchObject({ code: "invalid-input" });
          if (transport)
            expect(outcome).toMatchObject({
              message: "app-events.cursor: invalid input",
            });
          expect(outcome).not.toHaveProperty("nextCursor");
        } finally {
          await writer.close();
          await close();
        }
      });
    } finally {
      await mock.close();
    }
  });
  it.each([false, true])(
    "failed and cancelled deletes preserve the object before commit (pinned: %s)",
    async (pinned) => {
      const mock = createMockSia();
      try {
        await mock.run({ app }, async (run) => {
          const actor = mock.actor("writer");
          const { close, writer } = await connect(mock, run, actor);
          const reader = mock.reader({
            access: run.ownerAccess,
            as: mock.actor("reader"),
          });
          try {
            const object = await writer.upload({
              file: await bytesFixture({ bytes: Uint8Array.of(1), name: "n" }),
              metadata: Uint8Array.of(20),
            });
            if (pinned) await writer.pin(object);
            mock.mutationFaults.fail(
              { actor, operation: "delete", stage: "beforeCommit" },
              { code: "unavailable", times: 1 },
            );
            await expect(writer.delete(object)).rejects.toMatchObject({
              code: "unavailable",
            });
            const hold = mock.mutationFaults.hold({
              actor,
              operation: "delete",
              stage: "beforeCommit",
            });
            const abort = new AbortController();
            const pending = writer
              .delete(object, { signal: abort.signal })
              .catch((error: unknown) => error);
            try {
              await hold.started();
              abort.abort();
              await hold.cancelled();
              expect(await pending).toBeInstanceOf(Error);
            } finally {
              hold.release();
              await pending;
            }
            expect(await writer.inspect(object)).toBe(
              pinned ? "pinned" : "uploaded",
            );
            if (!pinned) await writer.pin(object);
            expect((await reader.object(object.id)).metadata).toEqual(
              Uint8Array.of(20),
            );
            const stream = await reader.download(object);
            expect((await stream.getReader().read()).value).toEqual(
              Uint8Array.of(1),
            );
            expect(
              mock
                .history()
                .filter((row) => row.operation === "delete")
                .map((row) => ({
                  committed: row.committed,
                  status: row.status,
                })),
            ).toEqual([
              { committed: false, status: "failed" },
              { committed: false, status: "cancelled" },
            ]);
            await writer.delete(object);
            expect(await writer.inspect(object)).toBe("missing");
          } finally {
            await reader.close();
            await writer.close();
            await close();
          }
        });
      } finally {
        await mock.close();
      }
    },
  );
  it.each(["foreign", "hooks", "padding", "overwrite"])(
    "validates %s fixture chunks using their actual bytes",
    async (kind) => {
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
            const expected =
              kind === "padding"
                ? Uint8Array.of(1, 0)
                : kind === "overwrite"
                  ? Uint8Array.of(1, 3)
                  : Uint8Array.of(1, 2, 3);
            const descriptor = await bytesFixture({
              bytes: expected,
              name: "bytes",
            });
            class Bytes extends Uint8Array {}
            const chunk =
              kind === "foreign"
                ? foreignMetadata(
                    "Uint8Array.of(99, 1, 2, 3, 88).subarray(1, 4)",
                  )
                : new Bytes(
                    kind === "padding"
                      ? [1]
                      : kind === "overwrite"
                        ? [1, 2]
                        : [1, 2, 3],
                  );
            if (kind === "padding" || kind === "overwrite") {
              Object.defineProperty(chunk, "byteLength", {
                value: kind === "padding" ? 2 : 1,
              });
            } else if (kind === "hooks") {
              for (const key of [
                "byteLength",
                "byteOffset",
                "buffer",
                "length",
                "constructor",
                "slice",
                "subarray",
                Symbol.iterator,
                Symbol.toStringTag,
              ]) {
                Object.defineProperty(chunk, key, {
                  get() {
                    throw new Error("input hook read");
                  },
                });
              }
            }
            const stream = new ReadableStream<Uint8Array>({
              start(controller) {
                controller.enqueue(chunk);
                if (kind === "overwrite") controller.enqueue(Uint8Array.of(3));
                controller.close();
              },
            });
            const upload = writer.upload({
              file: { ...descriptor, open: () => stream },
              metadata: new Uint8Array(),
            });
            if (kind === "padding" || kind === "overwrite") {
              await expect(upload).rejects.toMatchObject({
                code: "invalid-input",
              });
              expect(
                await reader.objects({ limit: 10, offset: 0 }),
              ).toMatchObject({ objects: [] });
              expect(
                mock
                  .history()
                  .filter(
                    (row) =>
                      row.operation === "upload" || row.operation === "pin",
                  ),
              ).toEqual([]);
            } else {
              const object = await upload;
              await writer.pin(object);
              const payload = new Uint8Array(
                await new Response(await reader.download(object)).arrayBuffer(),
              );
              expect(payload).toEqual(expected);
              expect(
                (await bytesFixture({ bytes: payload, name: "download" }))
                  .sha256,
              ).toBe(descriptor.sha256);
            }
            expect(stream.locked).toBe(false);
          } finally {
            await reader.close();
            await writer.close();
            await close();
          }
        });
      } finally {
        await mock.close();
      }
    },
  );
  it.each(["upload and pin", "pin"])(
    "accepts foreign Uint8Array metadata for %s",
    async (operation) => {
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
            const file = await bytesFixture({
              bytes: Uint8Array.of(1, 2, 3),
              name: "n",
            });
            const uploaded: Uint8Array =
              operation === "pin"
                ? Uint8Array.of(10, 20)
                : foreignMetadata(
                    "Uint8Array.of(99, 10, 20, 88).subarray(1, 3)",
                  );
            const object = await writer.upload({ file, metadata: uploaded });
            uploaded.fill(90);
            await writer.pin(object);
            expect((await reader.object(object.id)).metadata).toEqual(
              Uint8Array.of(10, 20),
            );
            const pinned: Uint8Array = foreignMetadata(
              "Uint8Array.of(77, 30, 40, 66).subarray(1, 3)",
            );
            expect(pinned instanceof Uint8Array).toBe(false);
            let reads = 0;
            const pinning = writer.pin(object, {
              get metadata() {
                reads++;
                return pinned;
              },
            });
            pinned.fill(80);
            await pinning;
            expect(reads).toBe(1);
            const first = await reader.object(object.id);
            expect(first.metadata).toEqual(Uint8Array.of(30, 40));
            first.metadata.fill(70);
            expect((await reader.object(object.id)).metadata).toEqual(
              Uint8Array.of(30, 40),
            );
            expect(
              await new Response(await reader.download(object)).arrayBuffer(),
            ).toEqual(Uint8Array.of(1, 2, 3).buffer);
          } finally {
            await reader.close();
            await writer.close();
            await close();
          }
        });
      } finally {
        await mock.close();
      }
    },
  );
  it("out-of-bounds metadata cannot replace pinned bytes or dispatch a request", async () => {
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
          const file = await bytesFixture({
            bytes: Uint8Array.of(1),
            name: "n",
          });
          const object = await writer.upload({
            file,
            metadata: Uint8Array.of(10),
          });
          await writer.pin(object);
          const buffer = new ArrayBuffer(8, { maxByteLength: 8 });
          const metadata = new Uint8Array(buffer, 4, 4);
          buffer.resize(0);
          const pins = mock
            .history()
            .filter((row) => row.operation === "pin").length;
          const fetches = vi.spyOn(globalThis, "fetch");
          try {
            const outcome: unknown = await writer
              .pin(object, { metadata })
              .catch((error: unknown) => error);
            expect.soft(outcome).toMatchObject({ code: "invalid-input" });
            expect.soft(fetches).not.toHaveBeenCalled();
            expect
              .soft(mock.history().filter((row) => row.operation === "pin"))
              .toHaveLength(pins);
          } finally {
            fetches.mockRestore();
          }
          expect
            .soft((await reader.object(object.id)).metadata)
            .toEqual(Uint8Array.of(10));
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
  it("out-of-bounds upload metadata rejects before opening or reserving allowances", async () => {
    const mock = createMockSia();
    try {
      await mock.run(
        { app, limits: { maxLogicalUploadBytes: 1, maxObjects: 1 } },
        async (run) => {
          const { close, writer } = await connect(
            mock,
            run,
            mock.actor("writer"),
          );
          try {
            const source = await bytesFixture({
              bytes: Uint8Array.of(1),
              name: "n",
            });
            let opens = 0;
            const file = {
              ...source,
              open() {
                opens++;
                return source.open();
              },
            };
            const buffer = new ArrayBuffer(8, { maxByteLength: 8 });
            const metadata = new Uint8Array(buffer, 4, 4);
            buffer.resize(0);
            const fetches = vi.spyOn(globalThis, "fetch");
            try {
              const outcome: unknown = await writer
                .upload({ file, metadata })
                .catch((error: unknown) => error);
              expect.soft(outcome).toMatchObject({ code: "invalid-input" });
              expect.soft(opens).toBe(0);
              expect.soft(fetches).not.toHaveBeenCalled();
              expect
                .soft(
                  mock.history().filter((row) => row.operation === "upload"),
                )
                .toEqual([]);
            } finally {
              fetches.mockRestore();
            }
            const valid: unknown = await writer
              .upload({ file, metadata: new Uint8Array() })
              .catch((error: unknown) => error);
            expect.soft(valid).toHaveProperty("id");
            expect.soft(opens).toBe(1);
          } finally {
            await writer.close();
            await close();
          }
        },
      );
    } finally {
      await mock.close();
    }
  });
  it("valid empty resizable views remain accepted while detached metadata rejects", async () => {
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
          const file = await bytesFixture({
            bytes: Uint8Array.of(1),
            name: "n",
          });
          const buffer = new ArrayBuffer(8, { maxByteLength: 8 });
          const fixedEmpty = new Uint8Array(buffer, 0, 0);
          const tracking = new Uint8Array(buffer);
          buffer.resize(0);
          for (const metadata of [new Uint8Array(), fixedEmpty, tracking]) {
            const object = await writer.upload({ file, metadata });
            await writer.pin(object, { metadata: Uint8Array.of(10) });
            await writer.pin(object, { metadata });
            expect((await reader.object(object.id)).metadata).toEqual(
              new Uint8Array(),
            );
          }
          const detached = new Uint8Array(1);
          structuredClone(detached.buffer, { transfer: [detached.buffer] });
          const object = await writer.upload({
            file,
            metadata: Uint8Array.of(10),
          });
          await writer.pin(object);
          await expect(
            writer.pin(object, { metadata: detached }),
          ).rejects.toMatchObject({ code: "invalid-input" });
          await expect(
            writer.upload({ file, metadata: detached }),
          ).rejects.toMatchObject({ code: "invalid-input" });
          expect((await reader.object(object.id)).metadata).toEqual(
            Uint8Array.of(10),
          );
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
  it("a metadata getter that closes its port is registered before close joins the pin", async () => {
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
            metadata: Uint8Array.of(10),
          });
          let closing: Promise<void> | undefined;
          let reads = 0;
          const order: string[] = [];
          const fetches = vi.spyOn(globalThis, "fetch");
          try {
            const pinning = writer.pin(object, {
              get metadata() {
                reads++;
                closing = writer.close();
                void closing.then(() => {
                  order.push("closed");
                });
                return Uint8Array.of(20);
              },
            });
            const outcome = pinning.catch((error: unknown) => {
              order.push("rejected");
              return error;
            });
            expect(await outcome).toBeDefined();
            await closing;
            expect(reads).toBe(1);
            expect(order).toEqual(["rejected", "closed"]);
            expect(fetches).not.toHaveBeenCalled();
            expect(
              mock.history().filter((row) => row.operation === "pin"),
            ).toEqual([]);
          } finally {
            fetches.mockRestore();
          }
        } finally {
          await writer.close();
          await close();
        }
      });
    } finally {
      await mock.close();
    }
  });
  it("failed first pins can retry with fresh metadata and close keeps prior committed bytes", async () => {
    const mock = createMockSia();
    try {
      await mock.run({ app }, async (run) => {
        const actor = mock.actor("writer");
        const { close, writer } = await connect(mock, run, actor);
        const reader = mock.reader({
          access: run.ownerAccess,
          as: mock.actor("reader"),
        });
        try {
          const file = await bytesFixture({
            bytes: Uint8Array.of(1),
            name: "n",
          });
          const object = await writer.upload({
            file,
            metadata: Uint8Array.of(10),
          });
          mock.mutationFaults.fail(
            { actor, operation: "pin", stage: "beforeCommit" },
            { code: "unavailable", times: 1 },
          );
          await expect(
            writer.pin(object, { metadata: Uint8Array.of(20) }),
          ).rejects.toMatchObject({ code: "unavailable" });
          expect(await writer.inspect(object)).toBe("uploaded");
          await expect(reader.object(object.id)).rejects.toBeDefined();
          await writer.pin(object, { metadata: Uint8Array.of(30) });
          mock.mutationFaults.fail(
            { actor, operation: "pin", stage: "beforeCommit" },
            { code: "denied", times: 1 },
          );
          await expect(
            writer.pin(object, { metadata: Uint8Array.of(40) }),
          ).rejects.toMatchObject({ code: "denied" });
          expect((await reader.object(object.id)).metadata).toEqual(
            Uint8Array.of(30),
          );
          const hold = mock.mutationFaults.hold({
            actor,
            operation: "pin",
            stage: "beforeCommit",
          });
          const pending = writer.pin(object, { metadata: Uint8Array.of(50) });
          const rejected = expect(pending).rejects.toBeDefined();
          await hold.started();
          await writer.close();
          await rejected;
          await hold.cancelled();
          expect((await reader.object(object.id)).metadata).toEqual(
            Uint8Array.of(30),
          );
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
  it("held repins commit metadata in release order and cancellation retains the last value", async () => {
    const mock = createMockSia();
    try {
      await mock.run({ app }, async (run) => {
        const actor = mock.actor("writer");
        const { close, writer } = await connect(mock, run, actor);
        const reader = mock.reader({
          access: run.ownerAccess,
          as: mock.actor("reader"),
        });
        try {
          const file = await bytesFixture({
            bytes: Uint8Array.of(1),
            name: "n",
          });
          const object = await writer.upload({
            file,
            metadata: Uint8Array.of(10),
          });
          await writer.pin(object);
          const holdB = mock.mutationFaults.hold({
            actor,
            operation: "pin",
            stage: "beforeCommit",
          });
          const chosen = Uint8Array.of(20);
          let metadataReads = 0;
          const options = {
            get metadata() {
              metadataReads++;
              return chosen;
            },
          };
          const b = writer.pin(object, options);
          await holdB.started();
          chosen[0] = 99;
          Object.defineProperty(options, "metadata", {
            get() {
              throw new Error("read twice");
            },
          });
          expect(metadataReads).toBe(1);
          expect((await reader.object(object.id)).metadata).toEqual(
            Uint8Array.of(10),
          );
          const holdC = mock.mutationFaults.hold({
            actor,
            operation: "pin",
            stage: "beforeCommit",
          });
          const c = writer.pin(object, { metadata: Uint8Array.of(30) });
          await holdC.started();
          holdC.release();
          await c;
          expect((await reader.object(object.id)).metadata).toEqual(
            Uint8Array.of(30),
          );
          holdB.release();
          await b;
          expect((await reader.object(object.id)).metadata).toEqual(
            Uint8Array.of(20),
          );
          const holdOmitted = mock.mutationFaults.hold({
            actor,
            operation: "pin",
            stage: "beforeCommit",
          });
          const omitted = writer.pin(object);
          await holdOmitted.started();
          await writer.pin(object, { metadata: Uint8Array.of(40) });
          holdOmitted.release();
          await omitted;
          expect((await reader.object(object.id)).metadata).toEqual(
            Uint8Array.of(40),
          );
          const abort = new AbortController();
          const holdCancel = mock.mutationFaults.hold({
            actor,
            operation: "pin",
            stage: "beforeCommit",
          });
          const cancelled = writer.pin(object, {
            metadata: Uint8Array.of(50),
            signal: abort.signal,
          });
          const rejection = expect(cancelled).rejects.toBeDefined();
          await holdCancel.started();
          abort.abort();
          await rejection;
          await holdCancel.cancelled();
          holdCancel.release();
          expect((await reader.object(object.id)).metadata).toEqual(
            Uint8Array.of(40),
          );
          const holdDelete = mock.mutationFaults.hold({
            actor,
            operation: "pin",
            stage: "beforeCommit",
          });
          const deleted = writer.pin(object, { metadata: Uint8Array.of(60) });
          const missing = expect(deleted).rejects.toBeDefined();
          await holdDelete.started();
          await writer.delete(object);
          holdDelete.release();
          await missing;
          expect(await writer.inspect(object)).toBe("missing");
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
  it("metadata uses intrinsic view bytes for uploads and pins", async () => {
    class Bytes extends Uint8Array {
      readonly byteLength = 0;
      readonly length = 0;
      slice(): Uint8Array<ArrayBuffer> {
        throw new Error("slice must not run");
      }
      subarray(): Uint8Array<ArrayBuffer> {
        throw new Error("subarray must not run");
      }
      [Symbol.iterator](): ArrayIterator<number> {
        throw new Error("iterator must not run");
      }
      values(): ArrayIterator<number> {
        throw new Error("values must not run");
      }
    }
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
          const file = await bytesFixture({
            bytes: Uint8Array.of(1),
            name: "n",
          });
          const bytes = new Bytes(new Uint8Array([9, 10, 11]).buffer, 1, 1);
          const object = await writer.upload({ file, metadata: bytes });
          await writer.pin(object);
          expect((await reader.object(object.id)).metadata).toEqual(
            Uint8Array.of(10),
          );
          await writer.pin(object, { metadata: bytes });
          expect((await reader.object(object.id)).metadata).toEqual(
            Uint8Array.of(10),
          );
          for (const metadata of [
            new Bytes(1025),
            (() => {
              const value = new Uint8Array(1);
              structuredClone(value.buffer, { transfer: [value.buffer] });
              return value;
            })(),
          ]) {
            await expect(
              writer.pin(object, { metadata }),
            ).rejects.toMatchObject({ code: "invalid-input" });
            await expect(
              writer.upload({ file, metadata }),
            ).rejects.toMatchObject({ code: "invalid-input" });
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
  it("pin snapshots selected metadata and repin omission preserves the last commit", async () => {
    const mock = createMockSia();
    try {
      await mock.run({ app }, async (run) => {
        const actor = mock.actor("writer");
        const { close, writer } = await connect(mock, run, actor);
        const reader = mock.reader({
          access: run.ownerAccess,
          as: mock.actor("reader"),
        });
        try {
          const file = await bytesFixture({
            bytes: Uint8Array.of(1, 2),
            name: "n",
          });
          const preserved = await writer.upload({
            file,
            metadata: Uint8Array.of(10),
          });
          await writer.pin(preserved, { metadata: undefined });
          expect((await reader.object(preserved.id)).metadata).toEqual(
            Uint8Array.of(10),
          );
          const object = await writer.upload({
            file,
            metadata: Uint8Array.of(10),
          });
          await expect(reader.object(object.id)).rejects.toBeDefined();
          const selected = Uint8Array.of(20);
          let reads = 0;
          const pinning = writer.pin(object, {
            get metadata() {
              reads++;
              return selected;
            },
          });
          selected[0] = 30;
          await pinning;
          expect(reads).toBe(1);
          expect((await reader.object(object.id)).metadata).toEqual(
            Uint8Array.of(20),
          );
          for (const options of [{}, { metadata: undefined }])
            await writer.pin(object, options);
          expect((await reader.object(object.id)).metadata).toEqual(
            Uint8Array.of(20),
          );
          const view = await reader.object(object.id);
          view.metadata[0] = 99;
          expect((await reader.object(object.id)).metadata).toEqual(
            Uint8Array.of(20),
          );
          expect(
            new Uint8Array(
              await new Response(await reader.download(object)).arrayBuffer(),
            ),
          ).toEqual(Uint8Array.of(1, 2));
          expect(
            (await writer.events({ cursor: null, limit: 10 })).events,
          ).toEqual([]);
          await writer.pin(object, { metadata: new Uint8Array() });
          expect((await reader.object(object.id)).metadata).toEqual(
            new Uint8Array(),
          );
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
  it("pin rejects invalid metadata before mutation", async () => {
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
            metadata: Uint8Array.of(1),
          });
          for (const metadata of [null, [], new Uint8Array(1025)]) {
            await expect(
              writer.pin(object, { metadata: metadata as Uint8Array }),
            ).rejects.toMatchObject({ code: "invalid-input" });
          }
          expect(await writer.inspect(object)).toBe("uploaded");
          await writer.pin(object, { metadata: new Uint8Array(1024) });
        } finally {
          await writer.close();
          await close();
        }
      });
    } finally {
      await mock.close();
    }
  });
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
            .pin(object, { metadata: Uint8Array.of(77) })
            .catch((error: unknown) => error);
          if (transport) {
            expect(outcome).toBeInstanceOf(TypeError);
            expect(outcome).not.toHaveProperty("code", "unavailable");
          } else expect(outcome).toMatchObject({ code: "unavailable" });
          expect(await writer.inspect(object)).toBe("pinned");
          const reader = mock.reader({
            access: run.ownerAccess,
            as: mock.actor("loss-reader"),
          });
          try {
            expect((await reader.object(object.id)).metadata).toEqual(
              Uint8Array.of(77),
            );
          } finally {
            await reader.close();
          }
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
          await writer.pin(object, { metadata: Uint8Array.of(88) });
          await mock.publish({ access: run.ownerAccess });
          expect(
            (await writer.events({ cursor: page.nextCursor, limit: 1 })).events,
          ).toEqual([]);
          await expect(
            writer.pin({ ...object }, { metadata: Uint8Array.of(90) }),
          ).rejects.toMatchObject({
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
