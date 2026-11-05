import { startMockServer } from "../../src/http.js";
import { createMockEndpoint } from "../../src/testing/transport.js";
import { expect, it } from "vitest";
import { withSiaRun } from "../../src/node.js";
import { bytesFixture } from "../../src/mock.js";

const app = {
  description: "Owned payloads",
  id: "a".repeat(64),
  name: "Streaming",
  serviceUrl: "https://example.invalid",
};
const backend = {
  app,
  kind: "mock" as const,
  payloadStorage: {
    kind: "temporary-files" as const,
    limits: {
      maxLogicalUploadBytes: 256,
      maxObjectBytes: 128,
      maxRetainedBytes: 256,
      maxUploadAttempts: 4,
    },
  },
};

it("selects direct Node storage and rejects oversized backing before committing", async () => {
  const result = await withSiaRun({ backend }, async (run) => {
    const port = run.mock.application({
      access: run.ownerAccess,
      as: run.mock.actor("writer"),
    });
    try {
      const file = await bytesFixture({
        bytes: new Uint8Array([1]),
        name: "one",
      });
      const invalid = {
        ...file,
        open: () =>
          new ReadableStream<Uint8Array>({
            start(c) {
              c.enqueue(new Uint8Array(new ArrayBuffer(65537), 0, 1));
              c.close();
            },
          }),
      };
      await expect(
        port.upload({ file: invalid, metadata: new Uint8Array() }),
      ).rejects.toThrow();
      const object = await port.upload({ file, metadata: new Uint8Array([8]) });
      await port.pin(object);
      const reader = run.mock.reader({
        access: run.ownerAccess,
        as: run.mock.actor("reader"),
      });
      try {
        expect([
          ...new Uint8Array(
            await new Response(
              await reader.download(await reader.object(object.id)),
            ).arrayBuffer(),
          ),
        ]).toEqual([1]);
      } finally {
        await reader.close();
      }
      expect(() =>
        run.mock.packedSdk({
          access: run.ownerAccess,
          as: run.mock.actor("browser"),
          maxBytes: 1,
          maxObjects: 1,
          platform: "browser",
        }),
      ).toThrow();
    } finally {
      await port.close();
    }
  });
  expect(result.summary.logicalUploadedBytes).toBe(1);
});

it("shares idle packed admission with managed and application sources before open", async () => {
  await withSiaRun({ backend }, async (run) => {
    const sdk = run.mock.packedSdk({
      access: run.ownerAccess,
      as: run.mock.actor("packer"),
      maxBytes: 64,
      maxObjects: 2,
      platform: "node",
    });
    const upload = sdk.uploadPacked();
    let opens = 0;
    const file = await bytesFixture({
      bytes: new Uint8Array([3]),
      name: "one",
    });
    const tracked = {
      ...file,
      open() {
        opens++;
        return file.open();
      },
    };
    const port = run.mock.application({
      access: run.ownerAccess,
      as: run.mock.actor("writer"),
    });
    try {
      await expect(
        run.objects.upload({ file: tracked, metadata: new Uint8Array() }),
      ).rejects.toThrow();
      await expect(
        port.upload({ file: tracked, metadata: new Uint8Array() }),
      ).rejects.toThrow();
      expect(opens).toBe(0);
      expect(await upload.add(file.open())).toBe(1n);
      const objects = await upload.finalize();
      expect(objects).toHaveLength(1);
      objects[0]!.seal(sdk.appKey());
      await sdk.pinObject(objects[0]!);
    } finally {
      await upload.dispose();
      await sdk.close();
      await port.close();
    }
  });
});

it("charges failed and empty packed sources before a later reader can lock", async () => {
  await withSiaRun(
    {
      backend: {
        ...backend,
        payloadStorage: {
          ...backend.payloadStorage,
          limits: { ...backend.payloadStorage.limits, maxUploadAttempts: 3 },
        },
      },
    },
    async (run) => {
      const sdk = run.mock.packedSdk({
        access: run.ownerAccess,
        as: run.mock.actor("packer"),
        maxBytes: 32,
        maxObjects: 3,
        platform: "node",
      });
      const upload = sdk.uploadPacked();
      try {
        const file = await bytesFixture({
          bytes: new Uint8Array([7]),
          name: "one",
        });
        expect(await upload.add(file.open())).toBe(1n);
        await expect(
          upload.add(
            new ReadableStream({
              start(c) {
                c.enqueue(new Uint8Array(new ArrayBuffer(65537), 0, 1));
                c.close();
              },
            }),
          ),
        ).rejects.toThrow();
        expect(
          await upload.add(
            new ReadableStream({
              start(c) {
                c.close();
              },
            }),
          ),
        ).toBe(0n);
        let locks = 0;
        const later = file.open();
        const getReader = later.getReader.bind(later);
        Object.defineProperty(later, "getReader", {
          value() {
            locks++;
            return getReader();
          },
        });
        await expect(upload.add(later)).rejects.toThrow();
        expect(locks).toBe(0);
        const objects = await upload.finalize();
        expect(objects).toHaveLength(2);
        expect(objects[0]!.id()).not.toBe(objects[1]!.id());
        for (const object of objects) await sdk.pinObject(object);
      } finally {
        await upload.dispose();
        await sdk.close();
      }
    },
  );
});

it("rejects conflicting budgets and unsupported direct bindings without opening sources", async () => {
  await expect(
    withSiaRun({ backend, limits: { maxLogicalUploadBytes: 255 } }, () =>
      Promise.resolve(undefined),
    ),
  ).rejects.toThrow("match");
  await expect(
    withSiaRun(
      {
        backend: {
          ...backend,
          payloadStorage: {
            ...backend.payloadStorage,
            limits: { ...backend.payloadStorage.limits, maxUploadAttempts: 17 },
          },
        },
      },
      () => Promise.resolve(undefined),
    ),
  ).rejects.toThrow();
  await withSiaRun({ backend }, async (run) => {
    await expect(startMockServer(run.mock)).rejects.toMatchObject({
      code: "unsupported",
    });
    expect(() =>
      createMockEndpoint(run.mock, "https://example.invalid"),
    ).toThrow("direct Node");
  });
});

it("joins an admitted producer cancellation before application close can resolve", async () => {
  await withSiaRun({ backend }, async (run) => {
    let pulled!: () => void;
    let cancelling!: () => void;
    let release!: () => void;
    const reading = new Promise<void>((resolve) => {
      pulled = resolve;
    });
    const cancelled = new Promise<void>((resolve) => {
      cancelling = resolve;
    });
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    const abort = new AbortController();
    const file = await bytesFixture({
      bytes: new Uint8Array([1]),
      name: "pending",
    });
    const port = run.mock.application({
      access: run.ownerAccess,
      as: run.mock.actor("writer"),
    });
    const upload = port.upload({
      file: {
        ...file,
        open: () =>
          new ReadableStream<Uint8Array>(
            {
              cancel() {
                cancelling();
                return held;
              },
              pull() {
                pulled();
              },
            },
            { highWaterMark: 0 },
          ),
      },
      metadata: new Uint8Array(),
      signal: abort.signal,
    });
    void upload.catch(() => undefined);
    let closing: Promise<void> | undefined;
    try {
      await reading;
      abort.abort();
      await cancelled;
      let closed = false;
      closing = port.close().then(() => {
        closed = true;
      });
      void closing.catch(() => undefined);
      await Promise.resolve();
      await Promise.resolve();
      expect(closed).toBe(false);
    } finally {
      release();
      await Promise.allSettled([upload, closing]);
      await port.close();
    }
  });
});

it("keeps a committed lost upload charged without publishing or returning authority", async () => {
  const result = await withSiaRun({ backend }, async (run) => {
    const actor = run.mock.actor("writer");
    const writer = run.mock.application({ access: run.ownerAccess, as: actor });
    try {
      run.mock.mutationFaults.loseReply(
        { actor, operation: "upload" },
        { times: 1 },
      );
      await expect(
        writer.upload({
          file: await bytesFixture({
            bytes: new Uint8Array([4]),
            name: "lost",
          }),
          metadata: new Uint8Array([7]),
        }),
      ).rejects.toMatchObject({ code: "unavailable" });
      expect(
        run.mock.history().filter((entry) => entry.operation === "upload"),
      ).toMatchObject([
        {
          committed: true,
          objectId: expect.any(String) as unknown,
          status: "failed",
        },
      ]);
      expect(
        (await writer.events({ cursor: null, limit: 10 })).events,
      ).toHaveLength(0);
    } finally {
      await writer.close();
    }
  });
  expect(result.summary.logicalUploadedBytes).toBe(1);
});

it("retains a caught managed producer-cancellation failure in final disk run cleanup", async () => {
  const cancellationError = new Error("managed producer cancel failed");
  const contains = (error: unknown): boolean =>
    error === cancellationError ||
    (error instanceof AggregateError && error.errors.some(contains));
  const outcome = await withSiaRun({ backend }, async (run) => {
    const file = await bytesFixture({
      bytes: new Uint8Array([1]),
      name: "one",
    });
    await expect(
      run.objects.upload({
        file: {
          ...file,
          open: () =>
            new ReadableStream<Uint8Array>(
              {
                cancel() {
                  return Promise.reject(cancellationError);
                },
                start(c) {
                  c.enqueue(new Uint8Array([1, 2]));
                },
              },
              { highWaterMark: 0 },
            ),
        },
        metadata: new Uint8Array(),
      }),
    ).rejects.toBeInstanceOf(AggregateError);
  }).then(
    () => undefined,
    (error: unknown) => error,
  );
  expect(contains(outcome)).toBe(true);
});
