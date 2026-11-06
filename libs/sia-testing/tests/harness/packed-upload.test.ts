import { expect, it } from "vitest";
import { createMockSia, PackedFinalizeError } from "../../src/mock.js";

const app = {
  description: "Packed writes",
  id: "a".repeat(64),
  name: "Packed",
  serviceUrl: "https://example.invalid",
};
const source = (...bytes: number[]) =>
  new ReadableStream<Uint8Array>({
    start(c) {
      c.enqueue(Uint8Array.from(bytes));
      c.close();
    },
  });

it("packed finalization stores consumed bytes and explicit metadata before pinning", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      expect(mock).toHaveProperty("packedSdk");
      const actor = mock.actor("writer");
      const sdk = mock.packedSdk({
        access: run.ownerAccess,
        as: actor,
        maxBytes: 8,
        maxObjects: 3,
        platform: "browser",
      });
      const packed = sdk.uploadPacked({ dataShards: 1, parityShards: 1 });
      expect(packed).not.toBeInstanceOf(Promise);
      expect(await packed.add(source(1, 2, 3))).toBe(3);
      expect(await packed.add(source())).toBe(0);
      const objects = await packed.finalize();
      expect(objects).toHaveLength(2);
      expect(objects[0]!.id()).not.toBe(objects[1]!.id());
      const metadata = Uint8Array.of(7);
      objects[0]!.updateMetadata(metadata);
      metadata[0] = 9;
      await sdk.updateObjectMetadata(objects[0]!);
      await sdk.pinObject(objects[0]!);
      await sdk.pinObject(objects[1]!);
      expect(objects[0]!.seal(sdk.appKey())).toBeUndefined();
      const reader = mock.reader({
        access: run.ownerAccess,
        as: mock.actor("reader"),
      });
      expect((await reader.object(objects[0]!.id())).metadata).toEqual(
        Uint8Array.of(7),
      );
      expect(
        await new Response(
          await reader.download({ id: objects[0]!.id() }),
        ).bytes(),
      ).toEqual(Uint8Array.of(1, 2, 3));
      await sdk.close();
      expect((await reader.object(objects[0]!.id())).sizeBytes).toBe(3);
      await reader.close();
    });
  } finally {
    await mock.close();
  }
});

it("empty finalization and Node byte counts preserve their selected shapes", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const sdk = mock.packedSdk({
        access: run.ownerAccess,
        as: mock.actor("node"),
        maxBytes: 8,
        maxObjects: 1,
        platform: "node",
      });
      expect(await sdk.uploadPacked().finalize()).toEqual([]);
      const packed = sdk.uploadPacked();
      expect(await packed.add(source(8))).toBe(1n);
      await packed.finalize();
      await sdk.close();
    });
  } finally {
    await mock.close();
  }
});

it("separate add, finalize, metadata and pin failures preserve acknowledged progress", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("writer");
      const sdk = mock.packedSdk({
        access: run.ownerAccess,
        as: actor,
        maxBytes: 8,
        maxObjects: 2,
        platform: "browser",
      });
      const packed = sdk.uploadPacked();
      mock.mutationFaults.fail(
        { actor, operation: "packed-add", stage: "beforeCommit" },
        { code: "unavailable", times: 1 },
      );
      await expect(packed.add(source(1))).rejects.toMatchObject({
        code: "unavailable",
      });
      await packed.add(source(2));
      await packed.add(source(3));
      mock.mutationFaults.fail(
        { actor, operation: "packed-finalize", stage: "beforeCommit" },
        { code: "unavailable", times: 1 },
      );
      await expect(packed.finalize()).rejects.toMatchObject({
        code: "unavailable",
      });
      await packed.dispose();
      const next = sdk.uploadPacked();
      await next.add(source(4));
      await next.add(source(5));
      const [first, second] = await next.finalize();
      first!.updateMetadata(Uint8Array.of(6));
      mock.mutationFaults.fail(
        { actor, operation: "metadata", stage: "beforeCommit" },
        { code: "denied", times: 1 },
      );
      await expect(sdk.updateObjectMetadata(first!)).rejects.toMatchObject({
        code: "denied",
      });
      await sdk.updateObjectMetadata(first!);
      await sdk.pinObject(first!);
      mock.mutationFaults.fail(
        { actor, operation: "pin", stage: "beforeCommit" },
        { code: "unavailable", times: 1 },
      );
      await expect(sdk.pinObject(second!)).rejects.toMatchObject({
        code: "unavailable",
      });
      const reader = mock.reader({
        access: run.ownerAccess,
        as: mock.actor("read"),
      });
      expect((await reader.object(first!.id())).metadata).toEqual(
        Uint8Array.of(6),
      );
      await expect(reader.object(second!.id())).rejects.toMatchObject({
        code: "not-found",
      });
      await sdk.close();
      await reader.close();
    });
  } finally {
    await mock.close();
  }
});

it("cancellation joins blocked reads, reports source errors and rejects overlapping calls", async () => {
  const mock = createMockSia();
  try {
    await expect(
      mock.run({ app }, async (run) => {
        const sdk = mock.packedSdk({
          access: run.ownerAccess,
          as: mock.actor("writer"),
          maxBytes: 8,
          maxObjects: 1,
          platform: "browser",
        });
        const packed = sdk.uploadPacked();
        let started!: () => void;
        const reading = new Promise<void>((resolve) => {
          started = resolve;
        });
        const cancelError = new Error("source cancellation failed");
        const adding = packed.add(
          new ReadableStream(
            {
              cancel() {
                throw cancelError;
              },
              pull() {
                started();
              },
            },
            { highWaterMark: 0 },
          ),
        );
        const rejected = expect(adding).rejects.toMatchObject({
          errors: expect.arrayContaining([cancelError]) as unknown,
        });
        await reading;
        await expect(packed.add(source(1))).rejects.toMatchObject({
          code: "busy",
        });
        await expect(packed.finalize()).rejects.toMatchObject({ code: "busy" });
        packed.cancel();
        await rejected;
        await expect(packed.dispose()).rejects.toMatchObject({
          errors: expect.arrayContaining([
            expect.any(AggregateError),
          ]) as unknown,
        });
        await expect(sdk.close()).rejects.toBeInstanceOf(AggregateError);
      }),
    ).rejects.toBeInstanceOf(AggregateError);
  } finally {
    await expect(mock.close()).resolves.toBeUndefined();
  }
});

it("only original session capabilities can mutate and invalid admission reads no source", async () => {
  const mock = createMockSia();
  try {
    await mock.run(
      { app, limits: { maxLogicalUploadBytes: 8 } },
      async (run) => {
        const actor = mock.actor("writer");
        const options = {
          access: run.ownerAccess,
          as: actor,
          maxBytes: 4,
          maxObjects: 1,
          platform: "browser" as const,
        };
        expect(() =>
          mock.packedSdk({ ...options, as: { ...actor } }),
        ).toThrow();
        const sdk = mock.packedSdk(options);
        const sibling = mock.packedSdk(options);
        const packed = sdk.uploadPacked();
        expect(() =>
          sdk.uploadPacked({
            // @ts-expect-error Host progress is outside the supported mock contract.
            onShardUploaded() {
              throw new Error("unsupported callback invoked");
            },
          }),
        ).toThrow();
        await packed.add(source(1));
        const [object] = await packed.finalize();
        await expect(sibling.pinObject(object!)).rejects.toMatchObject({
          code: "foreign-handle",
        });
        await expect(sdk.pinObject({ ...object! })).rejects.toMatchObject({
          code: "foreign-handle",
        });
        expect(() => object!.seal(sibling.appKey())).toThrow();
        expect(() =>
          ({ ...object! }).updateMetadata(Uint8Array.of(8)),
        ).toThrow();
        expect(() => ({ ...object! }).seal(sdk.appKey())).toThrow();
        expect(() => object!.updateMetadata(new Uint8Array(1025))).toThrow();
        await sdk.close();
        expect(() => object!.updateMetadata(Uint8Array.of(1))).toThrow();
        const other = sibling.uploadPacked();
        await other.add(source(2));
        const [otherObject] = await other.finalize();
        await sibling.pinObject(otherObject!);
        await sibling.close();
      },
    );
  } finally {
    await mock.close();
  }
});

it("acknowledged partial finalization IDs remain readable after closing the SDK session", async () => {
  const mock = createMockSia();
  const stop = new AbortController();
  try {
    await mock.run({ app, signal: stop.signal }, async (run) => {
      const actor = mock.actor("writer");
      const sdk = mock.packedSdk({
        access: run.ownerAccess,
        as: actor,
        maxBytes: 8,
        maxObjects: 2,
        platform: "browser",
      });
      const packed = sdk.uploadPacked();
      await packed.add(source(1));
      await packed.add(source(2));
      // A second result can fail after the first has committed. The per-result hold makes this observable.
      const first = mock.mutationFaults.hold({
        actor,
        operation: "packed-finalize",
        stage: "beforeCommit",
      });
      const finalizing = packed.finalize();
      const outcome = finalizing.then(
        (value) => ({ value }),
        (error: unknown) => ({ error }),
      );
      let second: ReturnType<typeof mock.mutationFaults.hold> | undefined;
      try {
        await first.started();
        second = mock.mutationFaults.hold({
          actor,
          operation: "packed-finalize",
          stage: "beforeCommit",
        });
        first.release();
        const observed = await Promise.race([
          second.started().then(() => "held"),
          outcome.then(() => "settled"),
        ]);
        expect(observed).toBe("held");
        packed.cancel();
        const result = await outcome;
        expect(result).toHaveProperty("error.objects");
        if ("error" in result) {
          expect(result.error).toBeInstanceOf(PackedFinalizeError);
          if (result.error instanceof PackedFinalizeError) {
            expect(result.error.objects).toHaveLength(1);
            expect(result.error.cause).toBeInstanceOf(Error);
            await sdk.pinObject(result.error.objects[0]!);
            const reader = mock.reader({
              access: run.ownerAccess,
              as: mock.actor("partial reader"),
            });
            expect(
              await new Response(
                await reader.download({ id: result.error.objects[0]!.id() }),
              ).bytes(),
            ).toEqual(Uint8Array.of(1));
            await reader.close();
            const id = result.error.objects[0]!.id();
            await sdk.close();
            const recreatedReader = mock.reader({
              access: run.ownerAccess,
              as: mock.actor("recreated partial reader"),
            });
            try {
              expect(await recreatedReader.object(id)).toEqual({
                id,
                metadata: new Uint8Array(),
                sizeBytes: 1,
              });
              expect(
                await new Response(
                  await recreatedReader.download({ id }),
                ).bytes(),
              ).toEqual(Uint8Array.of(1));
            } finally {
              await recreatedReader.close();
            }
          }
        }
        expect(
          mock
            .history()
            .filter((r) => r.operation === "packed-finalize" && r.committed),
        ).toHaveLength(1);
      } finally {
        first.release();
        second?.release();
        packed.cancel();
        await outcome;
      }
      await packed.dispose();
      await sdk.close();
    });
  } finally {
    await mock.close();
  }
});
