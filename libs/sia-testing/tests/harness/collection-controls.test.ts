import { expect, it } from "vitest";
import { bytesFixture, createMockSia } from "../../src/mock.js";
const app = {
  description: "Collection",
  id: "a".repeat(64),
  name: "Collection",
  serviceUrl: "https://example.invalid",
};
it("a collection hold stops reads at a whole chunk boundary without adding history", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("writer");
      const writer = mock.application({ access: run.ownerAccess, as: actor });
      const hold = mock.mutationFaults.hold({
        actor,
        afterBytes: 2,
        operation: "upload",
        stage: "collect",
      });
      const fixture = await bytesFixture({
        bytes: Uint8Array.of(1, 2, 3, 4),
        name: "bytes",
      });
      let reads = 0;
      const file = {
        ...fixture,
        open: () =>
          new ReadableStream<Uint8Array>(
            {
              pull(c) {
                reads++;
                if (reads === 1) c.enqueue(Uint8Array.of(1, 2, 3));
                else if (reads === 2) c.enqueue(Uint8Array.of(4));
                else c.close();
              },
            },
            { highWaterMark: 0 },
          ),
      };
      const upload = writer.upload({ file, metadata: new Uint8Array() });
      const receipt = await hold.started();
      expect(receipt).toMatchObject({
        bytes: 3,
        stage: "collect",
        status: "pending",
      });
      expect(reads).toBe(1);
      expect(
        mock.history().filter((r) => r.operation === "upload"),
      ).toHaveLength(0);
      hold.release();
      await upload;
      const history = mock.history().filter((r) => r.operation === "upload");
      expect(history).toHaveLength(1);
      expect(history[0]!.id).not.toBe(receipt.id);
      await writer.close();
    });
  } finally {
    await mock.close();
  }
});

it("zero opens without reading and abort joins producer cancellation with the original reason", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("zero");
      const writer = mock.application({ access: run.ownerAccess, as: actor });
      const hold = mock.mutationFaults.hold({
        actor,
        afterBytes: 0,
        operation: "upload",
        stage: "collect",
      });
      const descriptor = await bytesFixture({
        bytes: Uint8Array.of(1),
        name: "x",
      });
      let opened = 0,
        reads = 0;
      const reasons: unknown[] = [];
      const abort = new AbortController();
      const upload = writer.upload({
        file: {
          ...descriptor,
          open() {
            opened++;
            return new ReadableStream(
              {
                cancel(reason) {
                  reasons.push(reason);
                },
                pull(c) {
                  reads++;
                  c.enqueue(Uint8Array.of(1));
                },
              },
              { highWaterMark: 0 },
            );
          },
        },
        metadata: new Uint8Array(),
        signal: abort.signal,
      });
      const failure = upload.catch((e: unknown) => e);
      const start = await hold.started();
      expect(opened).toBe(1);
      expect(reads).toBe(0);
      const reason = { stop: true };
      abort.abort(reason);
      expect(await failure).toBe(reason);
      expect(reasons).toEqual([reason]);
      expect(await hold.cancelled()).toMatchObject({
        bytes: 0,
        id: start.id,
        status: "cancelled",
      });
      expect(mock.history().filter((r) => r.operation === "upload")).toEqual(
        [],
      );
      await writer.close();
    });
  } finally {
    await mock.close();
  }
});

it("finite collection failures remain armed below EOF and after bad hashes", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("finite");
      const writer = mock.application({ access: run.ownerAccess, as: actor });
      mock.mutationFaults.fail(
        { actor, afterBytes: 3, operation: "upload", stage: "collect" },
        { code: "unavailable", times: 1 },
      );
      const small = await bytesFixture({
        bytes: Uint8Array.of(1, 2),
        name: "small",
      });
      await expect(
        writer.upload({
          file: { ...small, sha256: "0".repeat(64) },
          metadata: new Uint8Array(),
        }),
      ).rejects.toMatchObject({ code: "invalid-input" });
      await writer.upload({ file: small, metadata: new Uint8Array() });
      const large = await bytesFixture({
        bytes: Uint8Array.of(1, 2, 3),
        name: "large",
      });
      await expect(
        writer.upload({ file: large, metadata: new Uint8Array() }),
      ).rejects.toMatchObject({ code: "unavailable" });
      await writer.upload({ file: large, metadata: new Uint8Array() });
      expect(
        mock.history().filter((r) => r.operation === "upload"),
      ).toHaveLength(2);
      await writer.close();
    });
  } finally {
    await mock.close();
  }
});

it("packed checkpoints share identity and cancellation stops further reads", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("packed");
      const sdk = mock.packedSdk({
        access: run.ownerAccess,
        as: actor,
        maxBytes: 8,
        maxObjects: 1,
        platform: "browser",
      });
      const first = mock.mutationFaults.hold({
        actor,
        afterBytes: 1,
        operation: "packed-add",
        stage: "collect",
      });
      const second = mock.mutationFaults.hold({
        actor,
        afterBytes: 2,
        operation: "packed-add",
        stage: "collect",
      });
      const packed = sdk.uploadPacked();
      let reads = 0;
      const add = packed.add(
        new ReadableStream(
          {
            cancel() {
              return undefined;
            },
            pull(c) {
              reads++;
              c.enqueue(Uint8Array.of(reads));
            },
          },
          { highWaterMark: 0 },
        ),
      );
      const failed = add.catch((e: unknown) => e);
      const one = await first.started();
      first.release();
      const two = await second.started();
      expect(two.id).toBe(one.id);
      expect(two.bytes).toBe(2);
      expect(reads).toBe(2);
      packed.cancel();
      expect(await failed).toBeInstanceOf(DOMException);
      expect((await second.cancelled()).id).toBe(one.id);
      await packed.dispose();
      await sdk.close();
    });
  } finally {
    await mock.close();
  }
});

it("rejects cross-stage fields and foreign actors before arming", () => {
  const mock = createMockSia(),
    other = createMockSia();
  const actor = mock.actor("valid");
  for (const selector of [
    { actor, afterBytes: -1, operation: "upload", stage: "collect" },
    { actor, afterBytes: 0, operation: "pin", stage: "collect" },
    { actor, afterBytes: 0, operation: "upload", stage: "beforeCommit" },
    {
      actor,
      afterBytes: 0,
      extra: true,
      operation: "upload",
      stage: "collect",
    },
    { afterBytes: 0, operation: "upload", stage: "collect" },
  ])
    expect(() => mock.mutationFaults.hold(selector as never)).toThrow();
  expect(() =>
    mock.mutationFaults.hold({
      actor: other.actor("foreign"),
      afterBytes: 0,
      operation: "upload",
      stage: "collect",
    }),
  ).toThrowError(expect.objectContaining({ code: "foreign-handle" }));
});

it("held cancellation reports actual producer cleanup failure even when it equals the abort reason", async () => {
  const mock = createMockSia();
  try {
    const outcome = mock.run({ app }, async (run) => {
      const actor = mock.actor("cleanup");
      const writer = mock.application({ access: run.ownerAccess, as: actor });
      const descriptor = await bytesFixture({
        bytes: Uint8Array.of(1),
        name: "cleanup",
      });
      const hold = mock.mutationFaults.hold({
        actor,
        afterBytes: 0,
        operation: "upload",
        stage: "collect",
      });
      const abort = new AbortController();
      const reason = new Error("same reason");
      let cancelled = 0;
      const upload = writer.upload({
        file: {
          ...descriptor,
          open: () =>
            new ReadableStream(
              {
                cancel() {
                  cancelled++;
                  throw reason;
                },
              },
              { highWaterMark: 0 },
            ),
        },
        metadata: new Uint8Array(),
        signal: abort.signal,
      });
      const failure = upload.catch((e: unknown) => e);
      await hold.started();
      abort.abort(reason);
      expect(await failure).toMatchObject({ errors: [reason, reason] });
      expect(cancelled).toBe(1);
      await expect(writer.close()).rejects.toMatchObject({
        errors: [expect.objectContaining({ errors: [reason, reason] })],
      });
    });
    await expect(outcome).rejects.toBeInstanceOf(AggregateError);
  } finally {
    await mock.close();
  }
});

it("collection failure releases bytes but charges its attempt without staging effects", async () => {
  const mock = createMockSia();
  try {
    await mock.run(
      { app, limits: { maxLogicalUploadBytes: 3, maxObjects: 2 } },
      async (run) => {
        const actor = mock.actor("limits");
        const writer = mock.application({ access: run.ownerAccess, as: actor });
        mock.mutationFaults.fail(
          { actor, afterBytes: 2, operation: "upload", stage: "collect" },
          { code: "denied", times: 1 },
        );
        const file = await bytesFixture({
          bytes: Uint8Array.of(1, 2, 3),
          name: "quota",
        });
        await expect(
          writer.upload({ file, metadata: Uint8Array.of(9) }),
        ).rejects.toMatchObject({ code: "denied" });
        expect(mock.history().filter((r) => r.operation === "upload")).toEqual(
          [],
        );
        await mock.publish({ access: run.ownerAccess });
        expect(
          (await writer.events({ cursor: null, limit: 10 })).events,
        ).toEqual([]);
        const object = await writer.upload({
          file,
          metadata: new Uint8Array(),
        });
        expect(await writer.inspect(object)).toBe("uploaded");
        const empty = await bytesFixture({
          bytes: new Uint8Array(),
          name: "empty",
        });
        await expect(
          writer.upload({ file: empty, metadata: new Uint8Array() }),
        ).rejects.toMatchObject({ code: "limit" });
        await writer.close();
      },
    );
  } finally {
    await mock.close();
  }
});

it("a held copied chunk survives producer mutation before the next pull", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("reuse");
      const writer = mock.application({ access: run.ownerAccess, as: actor });
      const hold = mock.mutationFaults.hold({
        actor,
        afterBytes: 1,
        operation: "upload",
        stage: "collect",
      });
      const original = Uint8Array.of(1, 2);
      const file = await bytesFixture({ bytes: original, name: "reused" });
      let reads = 0;
      const pending = writer.upload({
        file: {
          ...file,
          open: () =>
            new ReadableStream(
              {
                pull(c) {
                  if (reads++ === 0) c.enqueue(original);
                  else c.close();
                },
              },
              { highWaterMark: 0 },
            ),
        },
        metadata: new Uint8Array(),
      });
      await hold.started();
      original.fill(9);
      hold.release();
      expect(await writer.inspect(await pending)).toBe("uploaded");
      await writer.close();
    });
  } finally {
    await mock.close();
  }
});

it.each(["upload", "packed-add"] as const)(
  "%s starts every hold crossed by one chunk and waits for both before EOF",
  async (operation) => {
    const mock = createMockSia();
    try {
      await mock.run({ app }, async (run) => {
        const actor = mock.actor("crossed-holds");
        const writer = mock.application({ access: run.ownerAccess, as: actor });
        const sdk = mock.packedSdk({
          access: run.ownerAccess,
          as: actor,
          maxBytes: 3,
          maxObjects: 1,
          platform: "browser",
        });
        const packed = sdk.uploadPacked();
        const abort = new AbortController();
        const holds = [1, 2].map((afterBytes) =>
          mock.mutationFaults.hold({
            actor,
            afterBytes,
            operation,
            stage: "collect",
          }),
        );
        const descriptor = await bytesFixture({
          bytes: Uint8Array.of(1, 2, 3),
          name: "crossed",
        });
        let reads = 0;
        const stream = new ReadableStream<Uint8Array>(
          {
            pull(c) {
              if (++reads === 1) c.enqueue(Uint8Array.of(1, 2, 3));
              else c.close();
            },
          },
          { highWaterMark: 0 },
        );
        const work =
          operation === "upload"
            ? writer.upload({
                file: { ...descriptor, open: () => stream },
                metadata: new Uint8Array(),
                signal: abort.signal,
              })
            : packed.add(stream);
        let settled = false;
        const outcome = work.then(
          (value) => {
            settled = true;
            return { value };
          },
          (error: unknown) => {
            settled = true;
            return { error };
          },
        );
        let second:
          Awaited<ReturnType<(typeof holds)[number]["started"]>> | undefined;
        void holds[1]!.started().then((receipt) => {
          second = receipt;
        });
        try {
          const first = await Promise.race([
            holds[0]!.started(),
            outcome.then(() => {
              throw new Error(
                "Operation settled before its collection hold started",
              );
            }),
          ]);
          await Promise.resolve();
          expect(second).toMatchObject({
            bytes: 3,
            id: first.id,
            stage: "collect",
            status: "pending",
          });
          expect(first.bytes).toBe(3);
          expect(reads).toBe(1);
          expect(settled).toBe(false);
          holds[0]!.release();
          await new Promise<void>((resolve) => setImmediate(resolve));
          expect(reads).toBe(1);
          expect(settled).toBe(false);
          expect(
            mock.history().filter((row) => row.operation === operation),
          ).toEqual([]);
          holds[1]!.release();
          expect(await outcome).toHaveProperty("value");
          expect(reads).toBe(2);
          const effects = mock
            .history()
            .filter((row) => row.operation === operation);
          expect(effects).toHaveLength(1);
          expect(effects[0]).toMatchObject({
            committed: true,
            status: "completed",
          });
          expect(effects[0]!.id).not.toBe(first.id);
        } finally {
          abort.abort();
          packed.cancel();
          for (const hold of holds) hold.release();
          await outcome;
          await packed.dispose();
          await writer.close();
          await sdk.close();
        }
      });
    } finally {
      await mock.close();
    }
  },
);

it.each(["upload", "packed-add"] as const)(
  "%s cancels all holds crossed by one chunk and joins cleanup before settling",
  async (operation) => {
    const mock = createMockSia();
    try {
      await mock.run({ app }, async (run) => {
        const actor = mock.actor("abort-crossed-holds");
        const writer = mock.application({ access: run.ownerAccess, as: actor });
        const sdk = mock.packedSdk({
          access: run.ownerAccess,
          as: actor,
          maxBytes: 3,
          maxObjects: 1,
          platform: "browser",
        });
        const packed = sdk.uploadPacked();
        const abort = new AbortController();
        const holds = [1, 2].map((afterBytes) =>
          mock.mutationFaults.hold({
            actor,
            afterBytes,
            operation,
            stage: "collect",
          }),
        );
        const descriptor = await bytesFixture({
          bytes: Uint8Array.of(1, 2, 3),
          name: "abort-crossed",
        });
        let finishCleanup!: () => void;
        const cleanup = new Promise<void>((resolve) => {
          finishCleanup = resolve;
        });
        const reasons: unknown[] = [];
        let reads = 0;
        const stream = new ReadableStream<Uint8Array>(
          {
            cancel(reason) {
              reasons.push(reason);
              return cleanup;
            },
            pull(c) {
              if (++reads === 1) c.enqueue(Uint8Array.of(1, 2, 3));
              else c.close();
            },
          },
          { highWaterMark: 0 },
        );
        const work =
          operation === "upload"
            ? writer.upload({
                file: { ...descriptor, open: () => stream },
                metadata: new Uint8Array(),
                signal: abort.signal,
              })
            : packed.add(stream);
        let settled = false;
        const outcome = work.then(
          (value) => {
            settled = true;
            return { value };
          },
          (error: unknown) => {
            settled = true;
            return { error };
          },
        );
        const cancelled: unknown[] = [],
          started: unknown[] = [];
        for (const hold of holds) {
          void hold.started().then((receipt) => {
            started.push(receipt);
          });
          void hold.cancelled().then((receipt) => {
            cancelled.push(receipt);
          });
        }
        try {
          const first = await Promise.race([
            holds[0]!.started(),
            outcome.then(() => {
              throw new Error(
                "Operation settled before its collection hold started",
              );
            }),
          ]);
          await Promise.resolve();
          expect(started).toHaveLength(2);
          const reason = new Error("stop at crossed boundary");
          if (operation === "upload") abort.abort(reason);
          else packed.cancel();
          await new Promise<void>((resolve) => setImmediate(resolve));
          expect(reasons).toHaveLength(1);
          if (operation === "upload") expect(reasons[0]).toBe(reason);
          expect(cancelled).toEqual([
            expect.objectContaining({
              bytes: 3,
              id: first.id,
              status: "cancelled",
            }),
            expect.objectContaining({
              bytes: 3,
              id: first.id,
              status: "cancelled",
            }),
          ]);
          expect(reads).toBe(1);
          expect(settled).toBe(false);
          expect(
            mock.history().filter((row) => row.operation === operation),
          ).toEqual([]);
          finishCleanup();
          expect(await outcome).toEqual({ error: reasons[0] });
          expect(stream.locked).toBe(false);
          expect(reads).toBe(1);
        } finally {
          abort.abort();
          packed.cancel();
          finishCleanup();
          for (const hold of holds) hold.release();
          await outcome;
          await packed.dispose();
          await writer.close();
          await sdk.close();
        }
      });
    } finally {
      await mock.close();
    }
  },
);
