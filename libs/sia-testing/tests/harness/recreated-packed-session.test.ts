/** Acknowledged packed IDs locate reads but cannot rebuild SDK-session authority. */
import { expect, it } from "vitest";
import { createMockSia } from "../../src/mock.js";
import { app } from "./application-scenarios.js";

it("recreated packed sessions read only the acknowledged objects that were pinned", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("packed writer");
      const options = {
        access: run.ownerAccess,
        as: actor,
        maxBytes: 8,
        maxObjects: 2,
        platform: "browser" as const,
      };
      const original = mock.packedSdk(options);
      try {
        const upload = original.uploadPacked();
        for (const byte of [1, 2]) {
          await upload.add(
            new ReadableStream<Uint8Array>({
              start(controller) {
                controller.enqueue(Uint8Array.of(byte));
                controller.close();
              },
            }),
          );
        }
        const objects = await upload.finalize();
        expect(objects).toHaveLength(2);
        const ids = objects.map((object) => object.id());
        expect(new Set(ids).size).toBe(2);
        objects[0]!.updateMetadata(Uint8Array.of(7));
        await original.updateObjectMetadata(objects[0]!);
        mock.mutationFaults.loseReply(
          { actor, operation: "pin" },
          { times: 1 },
        );
        await expect(original.pinObject(objects[0]!)).rejects.toMatchObject({
          code: "unavailable",
        });
        await original.close();
        const recreated = mock.packedSdk(options);
        const reader = mock.reader({
          access: run.ownerAccess,
          as: mock.actor("recreated packed reader"),
        });
        try {
          expect(await reader.object(ids[0]!)).toEqual({
            id: ids[0],
            metadata: Uint8Array.of(7),
            sizeBytes: 1,
          });
          expect(
            await new Response(await reader.download({ id: ids[0]! })).bytes(),
          ).toEqual(Uint8Array.of(1));
          await expect(reader.object(ids[1]!)).rejects.toMatchObject({
            code: "not-found",
          });
          for (const object of objects) {
            await expect(recreated.pinObject(object)).rejects.toMatchObject({
              code: "foreign-handle",
            });
            await expect(
              recreated.updateObjectMetadata(object),
            ).rejects.toMatchObject({ code: "foreign-handle" });
          }
          await expect(
            recreated.pinObject({ id: () => ids[0] } as never),
          ).rejects.toMatchObject({ code: "foreign-handle" });
          expect(
            mock.history().filter((row) => row.operation === "pin"),
          ).toMatchObject([{ committed: true, status: "failed" }]);
          expect(
            mock.history().filter((row) => row.operation === "packed-add"),
          ).toHaveLength(2);
        } finally {
          await reader.close();
          await recreated.close();
        }
      } finally {
        await original.close();
      }
    });
  } finally {
    await mock.close();
  }
});
