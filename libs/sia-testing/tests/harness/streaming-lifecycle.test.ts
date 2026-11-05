import * as fs from "node:fs/promises";
import { constants } from "node:fs";
import { expect, it } from "vitest";
import { createMockSiaWithBackend } from "../../src/testing/mock.js";
import { createNodePayloadOwner } from "../../src/testing/node-payload-store.js";
import { createMockNetworkWithPayloadOwner } from "../../src/sdk/index.js";
import { bytesFixture, PackedFinalizeError } from "../../src/mock.js";

const app = {
  description: "Owned payloads",
  id: "a".repeat(64),
  name: "Streaming",
  serviceUrl: "https://example.invalid",
};
const limits = {
  maxLogicalUploadBytes: 64,
  maxObjectBytes: 32,
  maxRetainedBytes: 64,
  maxUploadAttempts: 4,
};

it("reader close joins a pending actual descriptor close and removes owned files before model reset", async () => {
  let release!: () => void;
  let entered!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const closingDescriptor = new Promise<void>((resolve) => {
    entered = resolve;
  });
  let rootRemoved = false;
  let resetAfterRemoval = false;
  const mock = createMockSiaWithBackend(
    {},
    {
      async create(model) {
        const reset = model.reset.bind(model);
        model.reset = () => {
          resetAfterRemoval = rootRemoved;
          reset();
        };
        const owner = await createNodePayloadOwner(limits, {
          ...fs,
          async open(...args: Parameters<typeof fs.open>) {
            const handle = await fs.open(...args);
            if ((Number(args[1]) & constants.O_WRONLY) !== 0) return handle;
            return new Proxy(handle, {
              get(target, key) {
                if (key === "close")
                  return async () => {
                    entered();
                    await held;
                    await target.close();
                  };
                const value: unknown = Reflect.get(target, key);
                return typeof value === "function"
                  ? (value as (...args: unknown[]) => unknown).bind(target)
                  : value;
              },
            });
          },
          async rmdir(path) {
            await fs.rmdir(path);
            rootRemoved = true;
          },
        });
        return {
          network: createMockNetworkWithPayloadOwner({ model }, owner),
          owner,
        };
      },
      limits,
    },
  );
  try {
    await mock.run({ app }, async (run) => {
      const file = await bytesFixture({
        bytes: new Uint8Array([1]),
        name: "one",
      });
      const object = await run.objects.upload({
        file,
        metadata: new Uint8Array(),
      });
      const port = mock.reader({
        access: run.ownerAccess,
        as: mock.actor("reader"),
      });
      const reader = (
        await port.download(await port.object(object.id))
      ).getReader();
      const reading = reader.read().catch(() => undefined);
      await closingDescriptor;
      let closed = false;
      const closing = port.close().then(() => {
        closed = true;
      });
      void closing.catch(() => undefined);
      try {
        await Promise.resolve();
        await Promise.resolve();
        expect(closed).toBe(false);
      } finally {
        release();
        await Promise.allSettled([reading, closing]);
      }
    });
    expect(rootRemoved).toBe(true);
    expect(resetAfterRemoval).toBe(true);
  } finally {
    release();
    await mock.close();
  }
});

it("does not request another source chunk while append or a whole-chunk checkpoint is held", async () => {
  let release!: () => void;
  let entered!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const writing = new Promise<void>((resolve) => {
    entered = resolve;
  });
  let reads = 0;
  let owner!: Awaited<ReturnType<typeof createNodePayloadOwner>>;
  const mock = createMockSiaWithBackend(
    {},
    {
      async create(model) {
        owner = await createNodePayloadOwner(limits, {
          ...fs,
          async open(...args: Parameters<typeof fs.open>) {
            const handle = await fs.open(...args);
            if ((Number(args[1]) & constants.O_WRONLY) === 0) return handle;
            return new Proxy(handle, {
              get(target, key) {
                if (key === "write")
                  return async (...args: Parameters<typeof handle.write>) => {
                    entered();
                    await held;
                    return handle.write(...args);
                  };
                const value: unknown = Reflect.get(target, key);
                return typeof value === "function"
                  ? (value as (...args: unknown[]) => unknown).bind(target)
                  : value;
              },
            });
          },
        });
        return {
          network: createMockNetworkWithPayloadOwner({ model }, owner),
          owner,
        };
      },
      limits,
    },
  );
  let pending: Promise<unknown> | undefined;
  let releaseCheckpoint: (() => void) | undefined;
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("writer");
      const port = mock.application({ access: run.ownerAccess, as: actor });
      const checkpoint = mock.mutationFaults.hold({
        actor,
        afterBytes: 3,
        operation: "upload",
        stage: "collect",
      });
      releaseCheckpoint = () => checkpoint.release();
      const source = new Uint8Array([97, 98, 99]);
      const file = {
        name: "abc",
        open() {
          expect(owner.resources()).toMatchObject({ entries: 1, writers: 1 });
          return new ReadableStream<Uint8Array>(
            {
              pull(c) {
                reads++;
                if (reads === 1) c.enqueue(source);
                else c.close();
              },
            },
            { highWaterMark: 0 },
          );
        },
        sha256:
          "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
        sizeBytes: 3,
      };
      const uploading = port.upload({ file, metadata: new Uint8Array([6]) });
      pending = uploading;
      void pending.catch(() => undefined);
      try {
        await writing;
        source.fill(0);
        expect(reads).toBe(1);
        release();
        await checkpoint.started();
        expect(reads).toBe(1);
        checkpoint.release();
        const object = await uploading;
        await port.pin(object);
        const reader = mock.reader({
          access: run.ownerAccess,
          as: mock.actor("reader"),
        });
        try {
          expect([
            ...new Uint8Array(
              await new Response(
                await reader.download(await reader.object(object.id)),
              ).arrayBuffer(),
            ),
          ]).toEqual([97, 98, 99]);
        } finally {
          await reader.close();
        }
      } finally {
        release();
        checkpoint.release();
        await Promise.allSettled([uploading]);
        await port.close();
      }
    });
  } finally {
    release();
    releaseCheckpoint?.();
    await Promise.allSettled([pending]);
    await mock.close();
  }
});

it("keeps caught zero-byte unlink residue charged and reports it again at final run cleanup", async () => {
  const failure = new Error("injected unlink rejection");
  let owner!: Awaited<ReturnType<typeof createNodePayloadOwner>>;
  let calls = 0;
  const mock = createMockSiaWithBackend(
    {},
    {
      async create(model) {
        owner = await createNodePayloadOwner(limits, {
          ...fs,
          unlink() {
            calls++;
            return Promise.reject(failure);
          },
        });
        return {
          network: createMockNetworkWithPayloadOwner({ model }, owner),
          owner,
        };
      },
      limits,
    },
  );
  const contains = (error: unknown): boolean =>
    error === failure ||
    (error instanceof AggregateError && error.errors.some(contains));
  try {
    const result = await mock
      .run({ app }, async (run) => {
        const port = mock.application({
          access: run.ownerAccess,
          as: mock.actor("writer"),
        });
        try {
          const object = await port.upload({
            file: await bytesFixture({
              bytes: new Uint8Array(),
              name: "empty",
            }),
            metadata: new Uint8Array(),
          });
          await expect(port.delete(object)).rejects.toBeTruthy();
          expect(await port.inspect(object)).toBe("missing");
          expect(owner.resources()).toMatchObject({
            entries: 1,
            retainedBytes: 0,
            writers: 0,
          });
          expect(await fs.readdir(owner.root)).toHaveLength(1);
        } finally {
          await port.close();
        }
      })
      .then(
        () => ({ error: undefined as unknown, failed: false }),
        (error: unknown) => ({ error, failed: true }),
      );
    expect(result.failed).toBe(true);
    expect(contains(result.error)).toBe(true);
    expect(calls).toBe(1);
  } finally {
    await mock.close();
    // Only the deliberate failed-unlink residue is removed by the test after error assertions.
    for (const name of await fs.readdir(owner.root))
      await fs.unlink(`${owner.root}/${name}`);
    await fs.rmdir(owner.root);
  }
});

it("keeps the actual committed token and receipt when SDK delivery aborts after adoption", async () => {
  const reason = new Error("lost delivery after actual adoption");
  const abort = new AbortController();
  let receipt: unknown;
  let owner!: Awaited<ReturnType<typeof createNodePayloadOwner>>;
  const small = {
    ...limits,
    maxLogicalUploadBytes: 1,
    maxObjectBytes: 1,
    maxRetainedBytes: 8,
  };
  const mock = createMockSiaWithBackend(
    {},
    {
      async create(model) {
        owner = await createNodePayloadOwner(small);
        const network = createMockNetworkWithPayloadOwner({ model }, owner);
        const createSdk = network.createSdk.bind(network);
        network.createSdk = (options) => {
          const sdk = createSdk(options);
          const upload = sdk.uploadPayload.bind(sdk);
          sdk.uploadPayload = async (...args) => {
            await upload(...args);
            receipt = mock
              .history()
              .find((entry) => entry.operation === "upload");
            abort.abort(reason);
            throw reason;
          };
          return sdk;
        };
        return { network, owner };
      },
      limits: small,
    },
  );
  try {
    const result = await mock.run({ app }, async (run) => {
      const writer = mock.application({
        access: run.ownerAccess,
        as: mock.actor("writer"),
      });
      const file = await bytesFixture({
        bytes: new Uint8Array([4]),
        name: "one",
      });
      try {
        await expect(
          writer.upload({
            file,
            metadata: new Uint8Array(),
            signal: abort.signal,
          }),
        ).rejects.toBe(reason);
        expect(receipt).toMatchObject({
          committed: true,
          objectId: expect.any(String) as unknown,
        });
        expect(await fs.readdir(owner.root)).toHaveLength(1);
        let opens = 0;
        await expect(
          writer.upload({
            file: {
              ...file,
              open() {
                opens++;
                return file.open();
              },
            },
            metadata: new Uint8Array(),
          }),
        ).rejects.toMatchObject({ code: "limit" });
        expect(opens).toBe(0);
      } finally {
        await writer.close();
      }
    });
    expect(result.summary.logicalUploadedBytes).toBe(1);
    await expect(fs.stat(owner.root)).rejects.toMatchObject({ code: "ENOENT" });
  } finally {
    await mock.close();
  }
});

it("returns original partial packed capabilities after a later real model staging failure", async () => {
  const cause = new Error("second model slab rejected");
  let owner!: Awaited<ReturnType<typeof createNodePayloadOwner>>;
  const mock = createMockSiaWithBackend(
    {},
    {
      async create(model) {
        let stages = 0;
        const pin = model.pinSlab.bind(model);
        model.pinSlab = (...args) => {
          if (++stages === 2) throw cause;
          return pin(...args);
        };
        owner = await createNodePayloadOwner(limits);
        return {
          network: createMockNetworkWithPayloadOwner({ model }, owner),
          owner,
        };
      },
      limits,
    },
  );
  try {
    const result = await mock.run({ app }, async (run) => {
      const sdk = mock.packedSdk({
        access: run.ownerAccess,
        as: mock.actor("packer"),
        maxBytes: 8,
        maxObjects: 2,
        platform: "node",
      });
      const upload = sdk.uploadPacked();
      try {
        const file = await bytesFixture({
          bytes: new Uint8Array([8]),
          name: "one",
        });
        await upload.add(file.open());
        await upload.add(file.open());
        const failure = await upload.finalize().then(
          () => undefined,
          (error: unknown) => error,
        );
        expect(failure).toBeInstanceOf(PackedFinalizeError);
        const partial = failure as PackedFinalizeError;
        expect(partial.cause).toBe(cause);
        expect(partial.objects).toHaveLength(1);
        expect(partial.objects[0]!.seal(sdk.appKey())).toBeUndefined();
        await sdk.pinObject(partial.objects[0]!);
        expect(await fs.readdir(owner.root)).toHaveLength(1);
      } finally {
        await upload.dispose();
        await sdk.close();
      }
    });
    expect(result.summary.logicalUploadedBytes).toBe(1);
  } finally {
    await mock.close();
  }
});
