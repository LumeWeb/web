/** Exercises direct SDK 0.2 upload calls against owned synthetic object state. */
import { expect, it } from "vitest";
import { createMockSia, MockPinnedObject } from "../../src/mock.js";
import { app } from "./application-scenarios.js";

it("an uploaded handle keeps its metadata and bytes after pin", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("uploader");
      const sdk = mock.uploadSdk({
        access: run.ownerAccess,
        as: actor,
        maxBytes: 8,
      });
      const reader = mock.reader({
        access: run.ownerAccess,
        as: mock.actor("reader"),
      });
      try {
        const key = sdk.appKey();
        expect(key.publicKey()).toMatch(/^ed25519:[0-9a-f]{64}$/);
        key.free();
        expect(() => key.publicKey()).toThrow();
        const draft = new MockPinnedObject();
        const metadata = Uint8Array.of(9, 8);
        draft.updateMetadata(metadata);
        const object = await sdk.upload(
          draft,
          new Blob([Uint8Array.of(1, 2, 3)]).stream(),
        );
        metadata.fill(0);
        expect(() => draft.id()).toThrow();
        object.updateMetadata(Uint8Array.of(7));
        await sdk.pinObject(object);
        expect((await reader.object(object.id())).metadata).toEqual(
          Uint8Array.of(7),
        );
        await expect(
          sdk.pinObject(new MockPinnedObject(object.id())),
        ).rejects.toMatchObject({ code: "foreign-handle" });
        expect(
          new Uint8Array(
            await new Response(
              await reader.download({ id: object.id() }),
            ).arrayBuffer(),
          ),
        ).toEqual(Uint8Array.of(1, 2, 3));
        object.free();
        expect(() => object.id()).toThrow();
      } finally {
        await sdk.close();
        await reader.close();
      }
    });
  } finally {
    await mock.close();
  }
});

it("only a staged upload reports synthetic shard progress before pin", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("uploader");
      const sdk = mock.uploadSdk({
        access: run.ownerAccess,
        as: actor,
        maxBytes: 8,
      });
      try {
        const shards: {
          shardIndex: number;
          shardSize: number;
          slabIndex: number;
        }[] = [];
        const options = {
          dataShards: 10,
          onShardUploaded: (shard: {
            shardIndex: number;
            shardSize: number;
            slabIndex: number;
          }) => shards.push(shard),
          parityShards: 20,
        };
        mock.mutationFaults.fail(
          { actor, operation: "upload", stage: "beforeCommit" },
          { code: "unavailable", times: 1 },
        );
        await expect(
          sdk.upload(
            new MockPinnedObject(),
            new Blob([Uint8Array.of(1, 2, 3)]).stream(),
            options,
          ),
        ).rejects.toMatchObject({ code: "unavailable" });
        expect(shards).toHaveLength(0);
        const object = await sdk.upload(
          new MockPinnedObject(),
          new Blob([Uint8Array.of(1, 2, 3)]).stream(),
          options,
        );
        expect(shards).toHaveLength(30);
        expect(shards[0]).toMatchObject({
          shardIndex: 0,
          shardSize: 4_194_304,
          slabIndex: 0,
        });
        expect(shards[29]).toMatchObject({ shardIndex: 29, slabIndex: 0 });
        expect(
          mock.history().filter((row) => row.operation === "pin"),
        ).toHaveLength(0);
        await sdk.pinObject(object);
      } finally {
        await sdk.close();
      }
    });
  } finally {
    await mock.close();
  }
});

it("an excessive shard count rejects before staging an upload", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const sdk = mock.uploadSdk({
        access: run.ownerAccess,
        as: mock.actor("uploader"),
        maxBytes: 8,
      });
      try {
        await expect(
          sdk.upload(
            new MockPinnedObject(),
            new Blob([Uint8Array.of(1)]).stream(),
            { dataShards: 255, parityShards: 20 },
          ),
        ).rejects.toMatchObject({ code: "invalid-input" });
        expect(
          mock.history().filter((row) => row.operation === "upload"),
        ).toHaveLength(0);
      } finally {
        await sdk.close();
      }
    });
  } finally {
    await mock.close();
  }
});

it("a lost pin reply leaves a readable object without retrying the write", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("uploader");
      const sdk = mock.uploadSdk({
        access: run.ownerAccess,
        as: actor,
        maxBytes: 8,
      });
      const reader = mock.reader({
        access: run.ownerAccess,
        as: mock.actor("reader"),
      });
      try {
        const object = await sdk.upload(
          new MockPinnedObject(),
          new Blob([Uint8Array.of(4)]).stream(),
        );
        mock.mutationFaults.loseReply(
          { actor, operation: "pin" },
          { times: 1 },
        );
        await expect(sdk.pinObject(object)).rejects.toMatchObject({
          code: "unavailable",
        });
        expect((await reader.object(object.id())).id).toBe(object.id());
        expect(
          mock.history().filter((row) => row.operation === "pin"),
        ).toMatchObject([{ committed: true, status: "failed" }]);
      } finally {
        await sdk.close();
        await reader.close();
      }
    });
  } finally {
    await mock.close();
  }
});

it("oversized source bytes are cancelled without staging an object", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const sdk = mock.uploadSdk({
        access: run.ownerAccess,
        as: mock.actor("uploader"),
        maxBytes: 1,
      });
      let cancelled = false;
      try {
        const source = new ReadableStream<Uint8Array>({
          cancel() {
            cancelled = true;
          },
          pull(controller) {
            controller.enqueue(Uint8Array.of(1, 2));
          },
        });
        await expect(
          sdk.upload(new MockPinnedObject(), source),
        ).rejects.toMatchObject({ code: "limit" });
        expect(cancelled).toBe(true);
        expect(
          mock.history().filter((row) => row.operation === "upload"),
        ).toHaveLength(0);
      } finally {
        await sdk.close();
      }
    });
  } finally {
    await mock.close();
  }
});

it("closing the SDK waits for a cancelled source before the run ends", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const sdk = mock.uploadSdk({
        access: run.ownerAccess,
        as: mock.actor("uploader"),
        maxBytes: 8,
      });
      const waiting = Promise.withResolvers<void>();
      const cancelling = Promise.withResolvers<void>();
      let finishCancel: (() => void) | undefined;
      let sent = false;
      const source = new ReadableStream<Uint8Array>(
        {
          cancel() {
            cancelling.resolve();
            return new Promise<void>((resolve) => {
              finishCancel = resolve;
            });
          },
          pull(controller) {
            if (sent) return;
            sent = true;
            controller.enqueue(Uint8Array.of(1));
            waiting.resolve();
          },
        },
        { highWaterMark: 0 },
      );
      const uploading = sdk
        .upload(new MockPinnedObject(), source)
        .catch((error: unknown) => error);
      await waiting.promise;
      const closing = sdk.close();
      await cancelling.promise;
      let closed = false;
      void closing.then(() => {
        closed = true;
      });
      await Promise.resolve();
      expect(closed).toBe(false);
      finishCancel?.();
      await closing;
      expect(closed).toBe(true);
      expect(await uploading).toBeInstanceOf(Error);
      expect(
        mock.history().filter((row) => row.operation === "upload"),
      ).toHaveLength(0);
    });
  } finally {
    await mock.close();
  }
});

it("run cleanup cancels and joins an SDK upload source left open", async () => {
  const mock = createMockSia();
  const started = Promise.withResolvers<void>();
  let cancelled = false;
  const source = new ReadableStream<Uint8Array>(
    {
      cancel() {
        cancelled = true;
      },
      pull() {
        started.resolve();
      },
    },
    { highWaterMark: 0 },
  );
  let sdk: ReturnType<typeof mock.uploadSdk> | undefined;
  let upload: Promise<unknown> | undefined;
  try {
    await mock.run({ app }, async (run) => {
      sdk = mock.uploadSdk({
        access: run.ownerAccess,
        as: mock.actor("uploader"),
        maxBytes: 8,
      });
      upload = sdk
        .upload(new MockPinnedObject(), source)
        .catch((error: unknown) => error);
      await started.promise;
    });
    expect(cancelled).toBe(true);
    expect(source.locked).toBe(false);
    expect(await upload).toBeInstanceOf(Error);
  } finally {
    await sdk?.close();
    await upload;
    await mock.close();
  }
});

it("run cleanup reports a failed SDK source cancellation", async () => {
  const mock = createMockSia();
  const started = Promise.withResolvers<void>();
  let upload: Promise<unknown> | undefined;
  try {
    await expect(
      mock.run({ app }, async (run) => {
        const sdk = mock.uploadSdk({
          access: run.ownerAccess,
          as: mock.actor("uploader"),
          maxBytes: 8,
        });
        const source = new ReadableStream<Uint8Array>(
          {
            cancel() {
              throw new Error("source cancellation failed");
            },
            pull() {
              started.resolve();
            },
          },
          { highWaterMark: 0 },
        );
        upload = sdk
          .upload(new MockPinnedObject(), source)
          .catch((error: unknown) => error);
        await started.promise;
      }),
    ).rejects.toThrow("Mock cleanup failed");
    expect(await upload).toBeInstanceOf(AggregateError);
  } finally {
    await mock.close();
  }
});

it("another SDK rejects an uploaded handle without freeing it", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const first = mock.uploadSdk({
        access: run.ownerAccess,
        as: mock.actor("first"),
        maxBytes: 8,
      });
      const second = mock.uploadSdk({
        access: run.ownerAccess,
        as: mock.actor("second"),
        maxBytes: 8,
      });
      try {
        const object = await first.upload(
          new MockPinnedObject(),
          new Blob([Uint8Array.of(1)]).stream(),
        );
        const source = new Blob([Uint8Array.of(2)]).stream();
        await expect(second.upload(object, source)).rejects.toMatchObject({
          code: "invalid-input",
        });
        expect(source.locked).toBe(false);
        await first.pinObject(object);
        const reader = mock.reader({
          access: run.ownerAccess,
          as: mock.actor("reader"),
        });
        try {
          expect(
            new Uint8Array(
              await new Response(
                await reader.download({ id: object.id() }),
              ).arrayBuffer(),
            ),
          ).toEqual(Uint8Array.of(1));
          expect(
            mock.history().filter((row) => row.operation === "upload"),
          ).toHaveLength(1);
        } finally {
          await reader.close();
        }
      } finally {
        await first.close();
        await second.close();
      }
    });
  } finally {
    await mock.close();
  }
});

it("a failed upload before commit can be retried with a new handle", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("uploader");
      const sdk = mock.uploadSdk({
        access: run.ownerAccess,
        as: actor,
        maxBytes: 8,
      });
      try {
        mock.mutationFaults.fail(
          { actor, operation: "upload", stage: "beforeCommit" },
          { code: "unavailable", times: 1 },
        );
        const draft = new MockPinnedObject();
        await expect(
          sdk.upload(draft, new Blob([Uint8Array.of(1)]).stream()),
        ).rejects.toMatchObject({ code: "unavailable" });
        expect(() => draft.id()).toThrow();
        const object = await sdk.upload(
          new MockPinnedObject(),
          new Blob([Uint8Array.of(2)]).stream(),
        );
        await sdk.pinObject(object);
        const reader = mock.reader({
          access: run.ownerAccess,
          as: mock.actor("reader"),
        });
        try {
          expect(
            new Uint8Array(
              await new Response(
                await reader.download({ id: object.id() }),
              ).arrayBuffer(),
            ),
          ).toEqual(Uint8Array.of(2));
        } finally {
          await reader.close();
        }
      } finally {
        await sdk.close();
      }
    });
  } finally {
    await mock.close();
  }
});
