import { expect, it } from "vitest";
import { bytesFixture, createMockSia } from "../../src/mock.js";
const app = {
  description: "Owned writes",
  id: "a".repeat(64),
  name: "Writes",
  serviceUrl: "https://example.invalid",
};
it("two ports can delete the same pinned object without a second SDK deletion", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const first = mock.application({
        access: run.ownerAccess,
        as: mock.actor("first"),
      });
      const second = mock.application({
        access: run.ownerAccess,
        as: mock.actor("second"),
      });
      try {
        const file = await bytesFixture({ bytes: Uint8Array.of(1), name: "n" });
        const object = await first.upload({
          file,
          metadata: new Uint8Array(),
          name: "n",
        });
        await first.pin(object);
        const results = await Promise.allSettled([
          first.delete(object),
          second.delete(object),
        ]);
        expect(results.map((result) => result.status)).toEqual([
          "fulfilled",
          "fulfilled",
        ]);
        expect(await first.inspect(object)).toBe("missing");
        expect(
          mock
            .history()
            .filter((row) => row.operation === "delete")
            .map((row) => ({ committed: row.committed, status: row.status })),
        ).toEqual([
          { committed: true, status: "completed" },
          { committed: false, status: "completed" },
        ]);
      } finally {
        await first.close();
        await second.close();
      }
    });
  } finally {
    await mock.close();
  }
});
it("history keeps reads and held mutations in their creation order", async () => {
  const mock = createMockSia({ clock: { start: "2026-01-01T00:00:00Z" } });
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("writer");
      const writer = mock.application({ access: run.ownerAccess, as: actor });
      const reader = mock.reader({
        access: run.ownerAccess,
        as: mock.actor("reader"),
      });
      const file = await bytesFixture({ bytes: Uint8Array.of(1), name: "n" });
      const object = await writer.upload({
        file,
        metadata: new Uint8Array(),
        name: "n",
      });
      const hold = mock.mutationFaults.hold({
        actor,
        object,
        operation: "pin",
        stage: "beforeCommit",
      });
      const pinning = writer.pin(object);
      try {
        await hold.started();
        await reader.objects({ limit: 1, offset: 0 });
        expect(mock.history().map((row) => row.operation)).toEqual([
          "upload",
          "pin",
          "objects",
        ]);
        expect(mock.history()[1]).toMatchObject({
          committed: false,
          status: "pending",
        });
        hold.release();
        await pinning;
        expect(mock.history()[1]).toMatchObject({
          committed: true,
          status: "completed",
        });
        expect(mock.history().at(-1)?.operation).toBe("objects");
      } finally {
        hold.release();
        await pinning;
        await writer.close();
        await reader.close();
      }
    });
  } finally {
    await mock.close();
  }
});
import { vi } from "vitest";
import * as sdkModule from "../../src/sdk/index.js";
it.each(["first", "second"] as const)(
  "cancelling the %s delete does not cancel the other port's effect",
  async (cancelled) => {
    const mock = createMockSia();
    const createNetwork = sdkModule.createMockNetwork;
    let network: ReturnType<typeof createNetwork> | undefined;
    let release = () => undefined as void;
    const factory = vi
      .spyOn(sdkModule, "createMockNetwork")
      .mockImplementation((options) => {
        network = createNetwork(options);
        release = network.control.hold({ operation: "deleteObject" });
        return network;
      });
    try {
      await mock.run({ app }, async (run) => {
        const firstActor = mock.actor("first"),
          secondActor = mock.actor("second");
        const first = mock.application({
          access: run.ownerAccess,
          as: firstActor,
        });
        const second = mock.application({
          access: run.ownerAccess,
          as: secondActor,
        });
        const hold = mock.mutationFaults.hold({
          actor: secondActor,
          operation: "delete",
          stage: "beforeCommit",
        });
        const outcomes: Promise<unknown>[] = [];
        try {
          const file = await bytesFixture({
            bytes: Uint8Array.of(1),
            name: "n",
          });
          const object = await first.upload({
            file,
            metadata: new Uint8Array(),
            name: "n",
          });
          await first.pin(object);
          const firstAbort = new AbortController();
          const deleting = first.delete(object, { signal: firstAbort.signal });
          outcomes.push(deleting.catch((error: unknown) => error));
          await new Promise<void>((resolve) => setTimeout(resolve, 0));
          expect(
            network!.control
              .requests()
              .filter((row) => row.operation === "deleteObject"),
          ).toHaveLength(1);
          const abort = new AbortController();
          const waiting = second
            .delete(object, { signal: abort.signal })
            .catch((error: unknown) => error);
          outcomes.push(waiting);
          await hold.started();
          hold.release();
          await new Promise<void>((resolve) => setTimeout(resolve, 0));
          expect(
            network!.control
              .requests()
              .filter((row) => row.operation === "deleteObject"),
          ).toHaveLength(1);
          if (cancelled === "second") {
            abort.abort();
            expect(await waiting).toBeInstanceOf(Error);
            release();
            await deleting;
          } else {
            firstAbort.abort();
            expect(await outcomes[0]).toBeInstanceOf(Error);
            release();
            expect(await waiting).toBeUndefined();
          }
          expect(await first.inspect(object)).toBe("missing");
          expect(
            mock
              .history()
              .filter((row) => row.operation === "delete")
              .map((row) => ({
                actor: row.actor,
                committed: row.committed,
                status: row.status,
              })),
          ).toEqual([
            {
              actor: firstActor,
              committed: cancelled !== "first",
              status: cancelled === "first" ? "cancelled" : "completed",
            },
            {
              actor: secondActor,
              committed: cancelled !== "second",
              status: cancelled === "second" ? "cancelled" : "completed",
            },
          ]);
        } finally {
          hold.release();
          release();
          await Promise.all(outcomes);
          await first.close();
          await second.close();
        }
      });
    } finally {
      release();
      factory.mockRestore();
      await mock.close();
    }
  },
);
it("a shared bounded history does not reinsert a held mutation after eviction", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("writer");
      const writer = mock.application({ access: run.ownerAccess, as: actor });
      const reader = mock.reader({
        access: run.ownerAccess,
        as: mock.actor("reader"),
      });
      const file = await bytesFixture({ bytes: Uint8Array.of(1), name: "n" });
      const object = await writer.upload({
        file,
        metadata: new Uint8Array(),
        name: "n",
      });
      const hold = mock.mutationFaults.hold({
        actor,
        object,
        operation: "pin",
        stage: "beforeCommit",
      });
      const pinning = writer.pin(object);
      try {
        const receipt = await hold.started();
        for (let count = 0; count < 257; count++)
          await reader.objects({ limit: 1, offset: 0 });
        expect(mock.history()).toHaveLength(256);
        expect(mock.history().some((row) => row.id === receipt.id)).toBe(false);
        hold.release();
        await pinning;
        expect(await writer.inspect(object)).toBe("pinned");
        expect(mock.history()).toHaveLength(256);
        expect(
          mock
            .history()
            .every(
              (row) =>
                row.operation === "objects" && row.status === "completed",
            ),
        ).toBe(true);
      } finally {
        hold.release();
        await pinning;
        await writer.close();
        await reader.close();
      }
    });
  } finally {
    await mock.close();
  }
});
