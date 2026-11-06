import { expect, it } from "vitest";
import { createMockSia } from "../../src/mock.js";
const app = {
  description: "Packed bounds",
  id: "a".repeat(64),
  name: "Bounds",
  serviceUrl: "https://example.invalid",
};

it("packed admission shares the application budget before a source is locked", async () => {
  const mock = createMockSia();
  try {
    await mock.run(
      { app, limits: { maxLogicalUploadBytes: 4, maxObjects: 2 } },
      async (run) => {
        const options = {
          access: run.ownerAccess,
          as: mock.actor("writer"),
          maxBytes: 4,
          maxObjects: 1,
          platform: "browser" as const,
        };
        expect(() =>
          mock.packedSdk({ ...options, maxBytes: 16 * 1024 * 1024 + 1 }),
        ).toThrow();
        const sdk = mock.packedSdk(options);
        const upload = sdk.uploadPacked();
        expect(() => sdk.uploadPacked()).toThrowError(
          expect.objectContaining({ code: "limit" }),
        );
        let pulled = 0;
        const untouched = new ReadableStream<Uint8Array>(
          {
            pull() {
              pulled++;
            },
          },
          { highWaterMark: 0 },
        );
        await upload.add(
          new ReadableStream({
            start(c) {
              c.close();
            },
          }),
        );
        await expect(upload.add(untouched)).rejects.toMatchObject({
          code: "limit",
        });
        expect(pulled).toBe(0);
        expect(untouched.locked).toBe(false);
        await untouched.cancel();
        await upload.dispose();
        const next = sdk.uploadPacked();
        let cancelled = 0;
        await expect(
          next.add(
            new ReadableStream({
              cancel() {
                cancelled++;
              },
              start(c) {
                c.enqueue(Uint8Array.of(1, 2, 3, 4, 5));
              },
            }),
          ),
        ).rejects.toMatchObject({ code: "limit" });
        expect(cancelled).toBe(1);
        expect(await next.finalize()).toEqual([]);
        await sdk.close();
      },
    );
  } finally {
    await mock.close();
  }
});

it("metadata holds snapshot invocation bytes and reads return detached snapshots", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("writer");
      const sdk = mock.packedSdk({
        access: run.ownerAccess,
        as: actor,
        maxBytes: 4,
        maxObjects: 1,
        platform: "browser",
      });
      const upload = sdk.uploadPacked();
      await upload.add(
        new ReadableStream({
          start(c) {
            c.enqueue(Uint8Array.of(1));
            c.close();
          },
        }),
      );
      const [object] = await upload.finalize();
      object!.updateMetadata(Uint8Array.of(2));
      const hold = mock.mutationFaults.hold({
        actor,
        operation: "metadata",
        stage: "beforeCommit",
      });
      const updating = sdk.updateObjectMetadata(object!);
      try {
        await hold.started();
        object!.updateMetadata(Uint8Array.of(3));
      } finally {
        hold.release();
        await updating;
      }
      await sdk.pinObject(object!);
      const reader = mock.reader({
        access: run.ownerAccess,
        as: mock.actor("reader"),
      });
      const first = await reader.object(object!.id());
      expect(first.metadata).toEqual(Uint8Array.of(2));
      first.metadata[0] = 9;
      expect((await reader.object(object!.id())).metadata).toEqual(
        Uint8Array.of(2),
      );
      await sdk.updateObjectMetadata(object!);
      expect((await reader.object(object!.id())).metadata).toEqual(
        Uint8Array.of(3),
      );
      await reader.close();
      await sdk.close();
    });
  } finally {
    await mock.close();
  }
});

it("SDK close cancels a held finalization without cancelling a sibling session", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("writer");
      const options = {
        access: run.ownerAccess,
        as: actor,
        maxBytes: 4,
        maxObjects: 1,
        platform: "browser" as const,
      };
      const sdk = mock.packedSdk(options);
      const sibling = mock.packedSdk({ ...options, as: mock.actor("sibling") });
      const upload = sdk.uploadPacked();
      await upload.add(
        new ReadableStream({
          start(c) {
            c.close();
          },
        }),
      );
      const hold = mock.mutationFaults.hold({
        actor,
        operation: "packed-finalize",
        stage: "beforeCommit",
      });
      const outcome = upload.finalize().then(
        (value) => ({ value }),
        (error: unknown) => ({ error }),
      );
      try {
        await hold.started();
        await sdk.close();
        expect(await outcome).toHaveProperty("error");
        expect((await hold.cancelled()).status).toBe("cancelled");
        expect(await sibling.uploadPacked().finalize()).toEqual([]);
      } finally {
        hold.release();
        await outcome;
        await sibling.close();
      }
    });
  } finally {
    await mock.close();
  }
});

it("packed pin reply loss retains the pin without minting replacement authority", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("writer");
      const sdk = mock.packedSdk({
        access: run.ownerAccess,
        as: actor,
        maxBytes: 4,
        maxObjects: 1,
        platform: "browser",
      });
      const upload = sdk.uploadPacked();
      await upload.add(
        new ReadableStream({
          start(c) {
            c.enqueue(Uint8Array.of(1));
            c.close();
          },
        }),
      );
      const [object] = await upload.finalize();
      mock.mutationFaults.loseReply({ actor, operation: "pin" }, { times: 1 });
      await expect(sdk.pinObject(object!)).rejects.toBeInstanceOf(Error);
      const reader = mock.reader({
        access: run.ownerAccess,
        as: mock.actor("reader"),
      });
      const record = await reader.object(object!.id());
      expect(record.sizeBytes).toBe(1);
      // @ts-expect-error Read projections are not packed mutation capabilities.
      await expect(sdk.pinObject(record)).rejects.toMatchObject({
        code: "foreign-handle",
      });
      await reader.close();
      await sdk.close();
    });
  } finally {
    await mock.close();
  }
});

it("a source read failure leaves earlier inputs intact and admits another add", async () => {
  const mock = createMockSia();
  try {
    const result = await mock.run({ app }, async (run) => {
      const sdk = mock.packedSdk({
        access: run.ownerAccess,
        as: mock.actor("writer"),
        maxBytes: 4,
        maxObjects: 2,
        platform: "browser",
      });
      const upload = sdk.uploadPacked();
      await upload.add(
        new ReadableStream({
          start(c) {
            c.enqueue(Uint8Array.of(1));
            c.close();
          },
        }),
      );
      const sourceError = new Error("read failed");
      await expect(
        upload.add(
          new ReadableStream({
            start(c) {
              c.error(sourceError);
            },
          }),
        ),
      ).rejects.toBe(sourceError);
      await upload.add(
        new ReadableStream({
          start(c) {
            c.enqueue(Uint8Array.of(2));
            c.close();
          },
        }),
      );
      const objects = await upload.finalize();
      expect(objects).toHaveLength(2);
      const reader = mock.reader({
        access: run.ownerAccess,
        as: mock.actor("reader"),
      });
      for (const [i, object] of objects.entries()) {
        await sdk.pinObject(object);
        expect([
          ...(await new Response(
            await reader.download({ id: object.id() }),
          ).bytes()),
        ]).toEqual([i + 1]);
      }
      await sdk.close();
      await reader.close();
    });
    expect(result.summary).toMatchObject({
      cleanup: "clean",
      logicalUploadedBytes: 2,
    });
  } finally {
    await mock.close();
  }
});
