/** Retained real backends expose cleanup effects without granting public mutation authority. */
import { afterEach, expect, it, vi } from "vitest";
import {
  bytesFixture,
  createMockSia,
  PackedFinalizeError,
} from "../../src/mock.js";
import * as sdkModule from "../../src/sdk/index.js";
import { payloadSlabId } from "../../src/sdk/state.js";
import * as packedModule from "../../src/testing/packed.js";

const app = {
  description: "Packed cleanup",
  id: "a".repeat(64),
  name: "Cleanup",
  serviceUrl: "https://example.invalid",
};
const source = (byte: number) =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(Uint8Array.of(byte));
      controller.close();
    },
  });
const deferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};
function containsIdentity(value: unknown, target: unknown): boolean {
  if (value === target) return true;
  return (
    value instanceof AggregateError &&
    value.errors.some((error: unknown) => containsIdentity(error, target))
  );
}
afterEach(() => vi.restoreAllMocks());

it("run cleanup retires partial staged bytes and pinned objects after a source cancellation error without touching an active sibling", async () => {
  const makeNetwork = sdkModule.createMockNetwork;
  const networks: ReturnType<typeof makeNetwork>[] = [];
  const discarded: string[] = [];
  const deleted: string[] = [];
  let inspectedBeforeReset = false;
  let failedRunId = "";
  vi.spyOn(sdkModule, "createMockNetwork").mockImplementation((...args) => {
    const network = makeNetwork(...args);
    networks.push(network);
    const discard = network.discardUpload.bind(network);
    vi.spyOn(network, "discardUpload").mockImplementation((account, id) => {
      expect(
        network.model.getSlab(account, payloadSlabId(account, id)).size,
      ).toBe(1);
      discard(account, id);
      expect(() =>
        network.model.getSlab(account, payloadSlabId(account, id)),
      ).toThrow();
      discarded.push(id);
    });
    const remove = network.model.deleteObject.bind(network.model);
    vi.spyOn(network.model, "deleteObject").mockImplementation(
      (account, id) => {
        expect(network.model.object(account, id)).toBeDefined();
        remove(account, id);
        expect(network.model.object(account, id)).toBeUndefined();
        expect(() =>
          network.model.getSlab(account, payloadSlabId(account, id)),
        ).toThrow();
        deleted.push(id);
      },
    );
    const reset = network.model.reset.bind(network.model);
    vi.spyOn(network.model, "reset").mockImplementation(() => {
      if (network === networks[1]) {
        expect(network.model.accountStats(failedRunId)).toMatchObject({
          objectCount: 0,
          pinnedSize: 0,
        });
        expect(
          (JSON.parse(network.serialize()) as { payloads: unknown[] }).payloads,
        ).toEqual([]);
        inspectedBeforeReset = true;
      }
      reset();
    });
    return network;
  });
  const mock = createMockSia();
  const cancellationError = new Error(
    "distinct packed source cancellation failure",
  );
  let partialId = "";
  let pinnedId = "";
  let adding: Promise<unknown> | undefined;
  try {
    await mock.run({ app }, async (siblingRun) => {
      const file = await bytesFixture({
        bytes: Uint8Array.of(9, 8),
        name: "sibling",
      });
      const sibling = await siblingRun.objects.upload({
        file,
        metadata: Uint8Array.of(7),
      });
      const reader = mock.reader({
        access: siblingRun.ownerAccess,
        as: mock.actor("sibling reader"),
      });
      try {
        const outcome = await mock
          .run({ app }, async (run) => {
            failedRunId = run.id;
            const actor = mock.actor("failed writer");
            const sdk = mock.packedSdk({
              access: run.ownerAccess,
              as: actor,
              maxBytes: 4,
              maxObjects: 2,
              platform: "browser",
            });
            const partial = sdk.uploadPacked();
            await partial.add(source(1));
            await partial.add(source(2));
            const first = mock.mutationFaults.hold({
              actor,
              operation: "packed-finalize",
              stage: "beforeCommit",
            });
            const finalizing = partial.finalize().then(
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
              expect(
                await Promise.race([
                  second.started().then(() => "held"),
                  finalizing.then(() => "settled"),
                ]),
              ).toBe("held");
              partial.cancel();
              const result = await finalizing;
              expect(result).toHaveProperty("error");
              if (
                !("error" in result) ||
                !(result.error instanceof PackedFinalizeError)
              )
                throw new Error("Missing acknowledged partial result");
              expect(result.error.objects).toHaveLength(1);
              partialId = result.error.objects[0]!.id();
            } finally {
              first.release();
              second?.release();
              partial.cancel();
              await finalizing;
            }
            const pinned = sdk.uploadPacked();
            await pinned.add(source(3));
            const [object] = await pinned.finalize();
            pinnedId = object!.id();
            object!.updateMetadata(Uint8Array.of(4));
            await sdk.updateObjectMetadata(object!);
            await sdk.pinObject(object!);
            const payloads = (
              JSON.parse(networks[1]!.serialize()) as {
                payloads: { data: string; id: string }[];
              }
            ).payloads;
            expect(payloads.map(({ data }) => data).sort()).toEqual([
              "AQ==",
              "Aw==",
            ]);
            const reading = deferred();
            adding = sdk
              .uploadPacked()
              .add(
                new ReadableStream(
                  {
                    cancel() {
                      throw cancellationError;
                    },
                    pull() {
                      reading.resolve();
                    },
                  },
                  { highWaterMark: 0 },
                ),
              )
              .then(
                (value) => ({ value }),
                (error: unknown) => ({ error }),
              );
            await reading.promise;
          })
          .then(
            (value) => ({ value }),
            (error: unknown) => ({ error }),
          );
        expect(outcome).toHaveProperty("error");
        if ("error" in outcome) {
          expect(containsIdentity(outcome.error, cancellationError)).toBe(true);
          if (outcome.error instanceof AggregateError)
            expect(outcome.error.errors).toHaveLength(1);
        }
        await adding;
        expect(discarded).toContain(partialId);
        expect(deleted).toContain(pinnedId);
        expect(inspectedBeforeReset).toBe(true);
        expect(
          (JSON.parse(networks[1]!.serialize()) as { payloads: unknown[] })
            .payloads,
        ).toEqual([]);
        expect((await reader.object(sibling.id)).metadata).toEqual(
          Uint8Array.of(7),
        );
        expect(
          await new Response(await reader.download(sibling)).bytes(),
        ).toEqual(Uint8Array.of(9, 8));
      } finally {
        await reader.close();
      }
    });
  } finally {
    await mock.close();
    await adding;
  }
});

it("settled SDK closes unregister without consuming another active session registration", async () => {
  const makeSdk = packedModule.createPackedSdk;
  const active = new Set<() => Promise<void>>();
  let cleanupInvocations = 0;
  vi.spyOn(packedModule, "createPackedSdk").mockImplementation(
    (options, backend) =>
      makeSdk(options, {
        ...backend,
        register(close) {
          const unregister = backend.register(() => {
            cleanupInvocations++;
            return close();
          });
          active.add(close);
          return () => {
            active.delete(close);
            unregister();
          };
        },
      }),
  );
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const options = {
        access: run.ownerAccess,
        as: mock.actor("writer"),
        maxBytes: 4,
        maxObjects: 1,
        platform: "browser" as const,
      };
      const sibling = mock.packedSdk(options);
      for (let i = 0; i < 4; i++) {
        const sdk = mock.packedSdk(options);
        const closing = sdk.close();
        expect(sdk.close()).toBe(closing);
        await closing;
        expect(active.size).toBe(1);
      }
      expect(await sibling.uploadPacked().finalize()).toEqual([]);
      await sibling.close();
      expect(active.size).toBe(0);
    });
    expect(cleanupInvocations).toBe(0);
  } finally {
    await mock.close();
  }
});

it("a rejecting close unregisters only after source cleanup settles and retains its original failure for run cleanup", async () => {
  const makeSdk = packedModule.createPackedSdk;
  const active = new Set<() => Promise<void>>();
  let cleanupInvocations = 0;
  vi.spyOn(packedModule, "createPackedSdk").mockImplementation(
    (options, backend) =>
      makeSdk(options, {
        ...backend,
        register(close) {
          const unregister = backend.register(() => {
            cleanupInvocations++;
            return close();
          });
          active.add(close);
          return () => {
            active.delete(close);
            unregister();
          };
        },
      }),
  );
  const mock = createMockSia();
  const cleanupError = new Error("owned cancellation failure");
  const cancelling = deferred();
  const release = deferred();
  let closing: Promise<unknown> | undefined;
  let adding: Promise<unknown> | undefined;
  let closeError: unknown;
  try {
    const outcome = await mock
      .run({ app }, async (run) => {
        const sdk = mock.packedSdk({
          access: run.ownerAccess,
          as: mock.actor("writer"),
          maxBytes: 4,
          maxObjects: 1,
          platform: "browser",
        });
        const reading = deferred();
        adding = sdk
          .uploadPacked()
          .add(
            new ReadableStream(
              {
                async cancel() {
                  cancelling.resolve();
                  await release.promise;
                  throw cleanupError;
                },
                pull() {
                  reading.resolve();
                },
              },
              { highWaterMark: 0 },
            ),
          )
          .then(
            (value) => ({ value }),
            (error: unknown) => ({ error }),
          );
        await reading.promise;
        const promise = sdk.close();
        expect(sdk.close()).toBe(promise);
        closing = promise.then(
          (value) => ({ value }),
          (error: unknown) => {
            closeError = error;
            return { error };
          },
        );
        await cancelling.promise;
        expect(active.size).toBe(1);
        release.resolve();
        await closing;
        await adding;
        expect(containsIdentity(closeError, cleanupError)).toBe(true);
        expect(active.size).toBe(0);
      })
      .then(
        (value) => ({ value }),
        (error: unknown) => ({ error }),
      );
    expect(cleanupInvocations).toBe(0);
    expect(outcome).toHaveProperty("error");
    if ("error" in outcome) {
      expect(containsIdentity(outcome.error, cleanupError)).toBe(true);
      expect(outcome.error).toBeInstanceOf(AggregateError);
      if (outcome.error instanceof AggregateError) {
        expect(outcome.error.errors).toHaveLength(1);
        expect(outcome.error.errors[0]).toBe(closeError);
      }
    }
  } finally {
    release.resolve();
    await closing;
    await adding;
    await mock.close();
  }
});

it("run cleanup joins a close already waiting for source cancellation before resetting its network", async () => {
  const makeNetwork = sdkModule.createMockNetwork;
  const release = deferred();
  const returned = deferred();
  let cancellationSettled = false;
  let resetObserved = false;
  vi.spyOn(sdkModule, "createMockNetwork").mockImplementation((...args) => {
    const network = makeNetwork(...args);
    const reset = network.model.reset.bind(network.model);
    vi.spyOn(network.model, "reset").mockImplementation(() => {
      expect(cancellationSettled).toBe(true);
      resetObserved = true;
      reset();
    });
    return network;
  });
  const mock = createMockSia();
  let adding: Promise<unknown> | undefined;
  let closing: Promise<unknown> | undefined;
  let settled = false;
  const running = mock
    .run({ app }, async (run) => {
      const sdk = mock.packedSdk({
        access: run.ownerAccess,
        as: mock.actor("writer"),
        maxBytes: 4,
        maxObjects: 1,
        platform: "browser",
      });
      const reading = deferred();
      const cancelling = deferred();
      adding = sdk
        .uploadPacked()
        .add(
          new ReadableStream(
            {
              async cancel() {
                cancelling.resolve();
                await release.promise;
                cancellationSettled = true;
              },
              pull() {
                reading.resolve();
              },
            },
            { highWaterMark: 0 },
          ),
        )
        .then(
          (value) => ({ value }),
          (error: unknown) => ({ error }),
        );
      await reading.promise;
      closing = sdk.close().then(
        (value) => ({ value }),
        (error: unknown) => ({ error }),
      );
      await cancelling.promise;
      returned.resolve();
    })
    .then(
      (value) => {
        settled = true;
        return { value };
      },
      (error: unknown) => {
        settled = true;
        return { error };
      },
    );
  try {
    expect(
      await Promise.race([
        returned.promise.then(() => "returned"),
        running.then(() => "settled"),
      ]),
    ).toBe("returned");
    expect(settled).toBe(false);
    release.resolve();
    expect(await running).toHaveProperty("value");
    expect(resetObserved).toBe(true);
  } finally {
    release.resolve();
    await running;
    await closing;
    await adding;
    await mock.close();
  }
});
