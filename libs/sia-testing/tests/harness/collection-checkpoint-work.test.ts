/** Collection checkpoints avoid async work until an owned control matches the current boundary. */
import { expect, it, vi } from "vitest";
import * as requests from "../../src/testing/controls.js";
import * as mutations from "../../src/testing/mutations.js";
import type { ActorRef } from "../../src/mock.js";
import { bytesFixture, createMockSia } from "../../src/mock.js";
const app = {
  description: "Control work",
  id: "a".repeat(64),
  name: "Work",
  serviceUrl: "https://example.invalid",
};

it.each([
  ["upload", false],
  ["upload", true],
  ["packed-add", false],
  ["packed-add", true],
] as const)(
  "%s avoids async begin delegation at unmatched byte boundaries (irrelevant rules: %s)",
  async (operation, irrelevant) => {
    const create = requests.createRequestControls;
    const beginCalls: Parameters<ReturnType<typeof create>["begin"]>[] = [];
    const checkpointResults: (Promise<void> | void)[] = [];
    const spy = vi
      .spyOn(requests, "createRequestControls")
      .mockImplementation((...args) => {
        const engine = create(...args);
        const begin = engine.begin.bind(engine);
        vi.spyOn(engine, "begin").mockImplementation((...input) => {
          beginCalls.push(input);
          return begin(...input);
        });
        return engine;
      });
    const createMutations = mutations.createMutationControls;
    const mutationSpy = vi
      .spyOn(mutations, "createMutationControls")
      .mockImplementation((...args) => {
        const engine = createMutations(...args);
        const collect = engine.collect.bind(engine);
        vi.spyOn(engine, "collect").mockImplementation(
          <T>(
            actor: ActorRef,
            operation: "packed-add" | "upload",
            signal: AbortSignal,
            work: (
              checkpoint: (bytes: number) => Promise<void> | void,
            ) => Promise<T>,
          ): Promise<T> =>
            collect(actor, operation, signal, (checkpoint) =>
              work((bytes) => {
                const result = checkpoint(bytes);
                checkpointResults.push(result);
                return result;
              }),
            ),
        );
        return engine;
      });
    const mock = createMockSia();
    try {
      await mock.run({ app }, async (run) => {
        const actor = mock.actor("writer");
        const other = mock.actor("other");
        const writer = mock.application({ access: run.ownerAccess, as: actor });
        const sdk = mock.packedSdk({
          access: run.ownerAccess,
          as: actor,
          maxBytes: 8,
          maxObjects: 1,
          platform: "browser",
        });
        try {
          if (irrelevant) {
            mock.mutationFaults.fail(
              { actor: other, afterBytes: 0, operation, stage: "collect" },
              { code: "denied", times: 1 },
            );
            mock.mutationFaults.fail(
              {
                actor,
                afterBytes: 0,
                operation: operation === "upload" ? "packed-add" : "upload",
                stage: "collect",
              },
              { code: "denied", times: 1 },
            );
            mock.mutationFaults.fail(
              { actor, afterBytes: 9, operation, stage: "collect" },
              { code: "denied", times: 1 },
            );
          }
          const expected = Uint8Array.of(1, 2, 3, 4, 5, 6, 7, 8);
          const descriptor = await bytesFixture({
            bytes: expected,
            name: "small",
          });
          let reads = 0;
          const stream = new ReadableStream<Uint8Array>(
            {
              pull(c) {
                if (reads < 8) c.enqueue(Uint8Array.of(++reads));
                else {
                  reads++;
                  c.close();
                }
              },
            },
            { highWaterMark: 0 },
          );
          let id: string;
          if (operation === "upload") {
            const object = await writer.upload({
              file: { ...descriptor, open: () => stream },
              metadata: Uint8Array.of(42),
            });
            await writer.pin(object);
            id = object.id;
          } else {
            const packed = sdk.uploadPacked();
            expect(await packed.add(stream)).toBe(8);
            const [object] = await packed.finalize();
            object!.updateMetadata(Uint8Array.of(42));
            await sdk.updateObjectMetadata(object!);
            await sdk.pinObject(object!);
            id = object!.id();
          }
          const reader = mock.reader({
            access: run.ownerAccess,
            as: mock.actor("reader"),
          });
          try {
            expect((await reader.object(id)).metadata).toEqual(
              Uint8Array.of(42),
            );
            expect(
              await new Response(await reader.download({ id })).bytes(),
            ).toEqual(expected);
          } finally {
            await reader.close();
          }
          expect(reads).toBe(9);
          expect(checkpointResults).toEqual(
            Array.from({ length: 9 }, () => undefined),
          );
          expect(
            beginCalls.filter((input) => input[5]?.stage === "collect"),
          ).toHaveLength(0);
          expect(
            mock.history().filter((row) => row.operation === operation),
          ).toHaveLength(1);
        } finally {
          await writer.close();
          await sdk.close();
        }
      });
    } finally {
      await mock.close();
      spy.mockRestore();
      mutationSpy.mockRestore();
    }
  },
);

it.each(["upload", "packed-add"] as const)(
  "%s observes later controls while leaving unrelated and unreached failures armed",
  async (operation) => {
    const mock = createMockSia();
    try {
      await mock.run({ app }, async (run) => {
        const actor = mock.actor("late-writer"),
          other = mock.actor("other");
        const writer = mock.application({ access: run.ownerAccess, as: actor });
        const sdk = mock.packedSdk({
          access: run.ownerAccess,
          as: actor,
          maxBytes: 8,
          maxObjects: 3,
          platform: "browser",
        });
        const packed = sdk.uploadPacked();
        const abort = new AbortController();
        const descriptor = await bytesFixture({
          bytes: Uint8Array.of(1, 2, 3),
          name: "later",
        });
        let announce!: (
          hold: ReturnType<typeof mock.mutationFaults.hold>,
        ) => void;
        const armed = new Promise<ReturnType<typeof mock.mutationFaults.hold>>(
          (resolve) => {
            announce = resolve;
          },
        );
        const unrelated = mock.mutationFaults.hold({
          actor: other,
          afterBytes: 0,
          operation,
          stage: "collect",
        });
        let unrelatedStarted = false;
        void unrelated.started().then(() => {
          unrelatedStarted = true;
        });
        mock.mutationFaults.fail(
          { actor, afterBytes: 4, operation, stage: "collect" },
          { code: "unavailable", times: 1 },
        );
        mock.mutationFaults.fail(
          {
            actor,
            afterBytes: 0,
            operation: operation === "upload" ? "packed-add" : "upload",
            stage: "collect",
          },
          { code: "denied", times: 1 },
        );
        let reads = 0;
        const reasons: unknown[] = [];
        const stream = new ReadableStream<Uint8Array>(
          {
            cancel(reason) {
              reasons.push(reason);
            },
            pull(c) {
              reads++;
              if (reads === 1) c.enqueue(Uint8Array.of(1));
              else if (reads === 2) {
                const hold = mock.mutationFaults.hold({
                  actor,
                  afterBytes: 2,
                  operation,
                  stage: "collect",
                });
                mock.mutationFaults.fail(
                  { actor, afterBytes: 3, operation, stage: "collect" },
                  { code: "denied", times: 1 },
                );
                announce(hold);
                c.enqueue(Uint8Array.of(2, 3));
              } else c.close();
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
        const outcome = work.then(
          (value) => ({ value }),
          (error: unknown) => ({ error }),
        );
        let active: ReturnType<typeof mock.mutationFaults.hold> | undefined;
        try {
          active = await Promise.race([
            armed,
            outcome.then(() => {
              throw new Error(
                "Operation settled before later controls were armed",
              );
            }),
          ]);
          const receipt = await Promise.race([
            active.started(),
            outcome.then(() => {
              throw new Error("Later hold was skipped");
            }),
          ]);
          expect(receipt).toMatchObject({
            bytes: 3,
            stage: "collect",
            status: "pending",
          });
          expect(reads).toBe(2);
          expect(unrelatedStarted).toBe(false);
          active.release();
          expect(await outcome).toMatchObject({ error: { code: "denied" } });
          expect(reasons).toHaveLength(1);
          expect(reasons[0]).toMatchObject({ code: "denied" });
          expect(reads).toBe(2);
          expect(stream.locked).toBe(false);
          expect(
            mock.history().filter((row) => row.operation === operation),
          ).toEqual([]);
          const send = (file: typeof descriptor) =>
            operation === "upload"
              ? writer.upload({ file, metadata: new Uint8Array() })
              : packed.add(file.open());
          await send(descriptor);
          const four = await bytesFixture({
            bytes: Uint8Array.of(1, 2, 3, 4),
            name: "four",
          });
          await expect(send(four)).rejects.toMatchObject({
            code: "unavailable",
          });
          await send(four);
          expect(
            mock.history().filter((row) => row.operation === operation),
          ).toHaveLength(2);
          expect(unrelatedStarted).toBe(false);
        } finally {
          abort.abort();
          packed.cancel();
          active?.release();
          unrelated.release();
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
