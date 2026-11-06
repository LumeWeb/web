/** Shared reads reconcile known writes without rebuilding mutation references. */
import { expect, it } from "vitest";
import { bytesFixture, createMockSia } from "../../src/mock.js";
import type {
  ActorRef,
  ApplicationPort,
  MockRun,
  MockSia,
  ObjectCursor,
  ReadPort,
} from "../../src/mock.js";
import { app } from "./application-scenarios.js";

export function recreatedSessionScenarios(
  setup: (
    mock: MockSia,
    run: MockRun,
  ) => Promise<{
    application(actor: ActorRef): ApplicationPort;
    close(): Promise<void>;
    reader(actor: ActorRef): ReadPort;
  }>,
  clientLocal: boolean,
) {
  it("recreated clients cannot recover an upload whose acknowledgement was lost", async () => {
    const mock = createMockSia();
    try {
      await mock.run({ app }, async (run) => {
        const ports = await setup(mock, run);
        const actor = mock.actor("unknown upload");
        const original = ports.application(actor);
        try {
          mock.mutationFaults.loseReply(
            { actor, operation: "upload" },
            { times: 1 },
          );
          await expect(
            original.upload({
              file: await bytesFixture({
                bytes: Uint8Array.of(8),
                name: "unknown",
              }),
              metadata: Uint8Array.of(9),
            }),
          ).rejects.toBeInstanceOf(Error);
          await original.close();
          const recreated = ports.application(
            mock.actor("recreated unknown writer"),
          );
          const reader = ports.reader(mock.actor("recreated unknown reader"));
          try {
            const receipt = mock
              .history()
              .find((row) => row.operation === "upload")!;
            expect(receipt).toMatchObject({
              committed: true,
              objectId: expect.any(String) as unknown,
              status: "failed",
            });
            // Only the driver sees this diagnostic ID; it is never an acknowledged application handle.
            const id = receipt.objectId!;
            await mock.publish({ access: run.ownerAccess });
            expect(
              (await recreated.events({ cursor: null, limit: 10 })).events,
            ).toEqual([]);
            expect(
              (await reader.objects({ limit: 10, offset: 0 })).objects,
            ).toEqual([]);
            await expect(reader.object(id)).rejects.toMatchObject({
              code: "not-found",
            });
            await expect(
              recreated.inspect({ id } as never),
            ).rejects.toMatchObject({ code: "foreign-handle" });
            await expect(recreated.pin({ id } as never)).rejects.toMatchObject({
              code: "foreign-handle",
            });
            await expect(
              recreated.delete({ id } as never),
            ).rejects.toMatchObject({ code: "foreign-handle" });
            expect(
              mock.history().filter((row) => row.operation === "upload"),
            ).toHaveLength(1);
            expect(
              mock.history().filter((row) => row.operation === "pin"),
            ).toEqual([]);
          } finally {
            await reader.close();
            await recreated.close();
          }
        } finally {
          await original.close();
          await ports.close();
        }
      });
    } finally {
      await mock.close();
    }
  });

  it("recreated clients read a known pin after its reply is lost without resending", async () => {
    const mock = createMockSia({ clock: { start: "2026-01-01T00:00:00Z" } });
    try {
      await mock.run({ app }, async (run) => {
        const ports = await setup(mock, run);
        const actor = mock.actor("original writer");
        const writer = ports.application(actor);
        const beforeReader = ports.reader(mock.actor("original reader"));
        try {
          const baseline = await writer.upload({
            file: await bytesFixture({
              bytes: Uint8Array.of(0),
              name: "baseline",
            }),
            metadata: new Uint8Array(),
          });
          await writer.pin(baseline);
          await mock.publish({ access: run.ownerAccess });
          const before = await writer.events({ cursor: null, limit: 10 });
          expect(before.events.map((row) => row.id)).toEqual([baseline.id]);
          expect(before.nextCursor).not.toBeNull();
          const cursor = JSON.parse(
            JSON.stringify(before.nextCursor),
          ) as null | ObjectCursor;
          const object = await writer.upload({
            file: await bytesFixture({
              bytes: Uint8Array.of(1, 2, 3),
              name: "known",
            }),
            metadata: Uint8Array.of(4),
          });
          const id = object.id;
          await expect(beforeReader.object(id)).rejects.toMatchObject({
            code: "not-found",
          });
          mock.mutationFaults.loseReply(
            { actor, operation: "pin" },
            { times: 1 },
          );
          await expect(
            writer.pin(object, { metadata: Uint8Array.of(7) }),
          ).rejects.toBeInstanceOf(Error);
          const settledHistory = mock.history();
          expect(
            settledHistory.filter((row) => row.operation === "pin"),
          ).toMatchObject([
            { committed: true, status: "completed" },
            { committed: true, status: "failed" },
          ]);
          expect(
            settledHistory.filter((row) => row.operation === "object"),
          ).toHaveLength(0);
          await writer.close();
          await beforeReader.close();

          const recreated = ports.application(mock.actor("recreated writer"));
          const reader = ports.reader(mock.actor("recreated reader"));
          try {
            expect(
              (await recreated.events({ cursor, limit: 10 })).events,
            ).toEqual([]);
            const row = await reader.object(id);
            expect(row).toEqual({
              id,
              metadata: Uint8Array.of(7),
              sizeBytes: 3,
            });
            expect(
              await new Response(await reader.download({ id })).bytes(),
            ).toEqual(Uint8Array.of(1, 2, 3));
            expect(
              (await reader.objects({ limit: 10, offset: 0 })).objects.map(
                (item) => item.id,
              ),
            ).toContain(id);
            row.metadata[0] = 99;
            expect((await reader.object(id)).metadata).toEqual(
              Uint8Array.of(7),
            );

            const diagnosticId = mock
              .history()
              .find(
                (receipt) =>
                  receipt.operation === "pin" &&
                  receipt.committed &&
                  receipt.status === "failed",
              )!.objectId;
            for (const invalid of [
              { ...object },
              { id },
              row,
              id,
              diagnosticId,
            ]) {
              await expect(
                recreated.inspect(invalid as never),
              ).rejects.toMatchObject({ code: "foreign-handle" });
              await expect(
                recreated.pin(invalid as never),
              ).rejects.toMatchObject({ code: "foreign-handle" });
              await expect(
                recreated.delete(invalid as never),
              ).rejects.toMatchObject({ code: "foreign-handle" });
            }
            if (clientLocal) {
              await expect(recreated.inspect(object)).rejects.toMatchObject({
                code: "foreign-handle",
              });
              await expect(recreated.pin(object)).rejects.toMatchObject({
                code: "foreign-handle",
              });
              await expect(recreated.delete(object)).rejects.toMatchObject({
                code: "foreign-handle",
              });
            } else {
              expect(await recreated.inspect(object)).toBe("pinned");
            }
            mock.advanceTime(1000);
            await mock.publish({ access: run.ownerAccess });
            expect(
              (await recreated.events({ cursor, limit: 10 })).events,
            ).toEqual([
              { deleted: false, id, updatedAt: "2026-01-01T00:00:01.000Z" },
            ]);
            expect(
              mock
                .history()
                .filter((receipt) => receipt.operation === "upload"),
            ).toHaveLength(2);
            expect(
              mock.history().filter((receipt) => receipt.operation === "pin"),
            ).toHaveLength(2);
          } finally {
            await reader.close();
            await recreated.close();
          }
        } finally {
          await beforeReader.close();
          await writer.close();
          await ports.close();
        }
      });
    } finally {
      await mock.close();
    }
  });
}
