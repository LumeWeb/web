/** Lost acknowledgements leave known objects available for explicit inspection. */
import { expect, it, vi } from "vitest";
import { bytesFixture, createMockSia } from "../../src/mock.js";
import * as sdkModule from "../../src/sdk/index.js";
import { app } from "./application-scenarios.js";

it("committed-only losses survive rejection and cancellation before commit", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("writer");
      const writer = mock.application({ access: run.ownerAccess, as: actor });
      try {
        const file = await bytesFixture({ bytes: Uint8Array.of(1), name: "n" });
        const object = await writer.upload({
          file,
          metadata: new Uint8Array(),
          name: "n",
        });
        mock.mutationFaults.loseReply(
          { actor, object, operation: "pin" },
          { times: 2 },
        );
        mock.mutationFaults.fail(
          { actor, operation: "pin", stage: "beforeCommit" },
          { code: "denied", times: 1 },
        );
        await expect(writer.pin(object)).rejects.toMatchObject({
          code: "denied",
        });
        expect(await writer.inspect(object)).toBe("uploaded");
        const hold = mock.mutationFaults.hold({
          actor,
          operation: "pin",
          stage: "beforeCommit",
        });
        const abort = new AbortController();
        const pending = writer.pin(object, { signal: abort.signal });
        const outcome = pending.catch((error: unknown) => error);
        try {
          await hold.started();
          abort.abort();
          expect(await outcome).toBeInstanceOf(Error);
          expect(await writer.inspect(object)).toBe("uploaded");
        } finally {
          hold.release();
        }
        for (let i = 0; i < 2; i++) {
          await expect(writer.pin(object)).rejects.toMatchObject({
            code: "unavailable",
          });
          expect(await writer.inspect(object)).toBe("pinned");
        }
        await writer.pin(object);
        expect(
          mock.history().filter((row) => row.operation === "pin"),
        ).toMatchObject([
          { committed: false, status: "failed" },
          { committed: false, status: "cancelled" },
          { committed: true, status: "failed" },
          { committed: true, status: "failed" },
          { committed: true, status: "completed" },
        ]);
      } finally {
        await writer.close();
      }
    });
  } finally {
    await mock.close();
  }
});

it("loss selectors reject copied references and unsupported operations without arming a fault", async () => {
  const foreign = createMockSia(),
    mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("writer");
      const writer = mock.application({ access: run.ownerAccess, as: actor });
      try {
        const file = await bytesFixture({ bytes: Uint8Array.of(1), name: "n" });
        const object = await writer.upload({
          file,
          metadata: new Uint8Array(),
          name: "n",
        });
        for (const selector of [
          { operation: "pin" },
          { actor: { ...actor }, operation: "pin" },
          { actor: foreign.actor("foreign"), operation: "pin" },
          { actor, object: { ...object }, operation: "pin" },
          { actor, operation: "upload" },
          { actor, operation: "delete" },
          { actor, operation: "inspect" },
          { actor, operation: "pin", stage: "beforeCommit" },
        ])
          expect(() =>
            mock.mutationFaults.loseReply(selector as never, { times: 1 }),
          ).toThrow();
        expect(() =>
          foreign.mutationFaults.loseReply(
            { actor: foreign.actor("f"), object, operation: "pin" },
            { times: 1 },
          ),
        ).toThrow();
        for (const times of [
          0,
          -1,
          1.5,
          Infinity,
          NaN,
          Number.MAX_SAFE_INTEGER + 1,
        ]) {
          expect(() =>
            mock.mutationFaults.loseReply(
              { actor, operation: "pin" },
              { times },
            ),
          ).toThrow();
        }
        await writer.pin(object);
        expect(await writer.inspect(object)).toBe("pinned");
      } finally {
        await writer.close();
      }
    });
  } finally {
    await mock.close();
    await foreign.close();
  }
});

it("object and actor selectors leave sibling objects and other runs unaffected", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (first) => {
      await mock.run({ app }, async (second) => {
        const actor = mock.actor("writer"),
          other = mock.actor("other");
        const writer = mock.application({
          access: first.ownerAccess,
          as: actor,
        });
        const sibling = mock.application({
          access: first.ownerAccess,
          as: other,
        });
        const remote = mock.application({
          access: second.ownerAccess,
          as: actor,
        });
        try {
          const file = await bytesFixture({
            bytes: Uint8Array.of(1),
            name: "n",
          });
          const input = { file, metadata: new Uint8Array(), name: "n" };
          const elsewhere = await remote.upload(input);
          const next = await writer.upload(input);
          const target = await writer.upload(input);
          mock.mutationFaults.loseReply(
            { actor, object: target, operation: "pin" },
            { times: 1 },
          );
          await writer.pin(next);
          await sibling.pin(target);
          await remote.pin(elsewhere);
          await expect(writer.pin(target)).rejects.toMatchObject({
            code: "unavailable",
          });
          expect(await writer.inspect(target)).toBe("pinned");
          await writer.pin(target);
        } finally {
          await writer.close();
          await sibling.close();
          await remote.close();
        }
      });
    });
  } finally {
    await mock.close();
  }
});

it("a lost reply performs one SDK pin and caller abort cannot undo that effect", async () => {
  const makeNetwork = sdkModule.createMockNetwork;
  const pins: ReturnType<typeof vi.fn>[] = [];
  const factory = vi
    .spyOn(sdkModule, "createMockNetwork")
    .mockImplementation((...args) => {
      const network = makeNetwork(...args);
      const createSdk = network.createSdk.bind(network);
      vi.spyOn(network, "createSdk").mockImplementation((input) => {
        const sdk = createSdk(input);
        pins.push(vi.spyOn(sdk, "pinObject"));
        return sdk;
      });
      return network;
    });
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("writer");
      const writer = mock.application({ access: run.ownerAccess, as: actor });
      try {
        const file = await bytesFixture({ bytes: Uint8Array.of(1), name: "n" });
        const object = await writer.upload({
          file,
          metadata: new Uint8Array(),
          name: "n",
        });
        mock.mutationFaults.loseReply(
          { actor, object, operation: "pin" },
          { times: 1 },
        );
        const abort = new AbortController();
        await expect(
          writer.pin(object, { signal: abort.signal }),
        ).rejects.toMatchObject({ code: "unavailable" });
        abort.abort();
        expect(await writer.inspect(object)).toBe("pinned");
        expect(pins.flatMap((pin) => pin.mock.calls)).toHaveLength(1);
        expect(
          (await writer.events({ cursor: null, limit: 10 })).events,
        ).toEqual([]);
      } finally {
        await writer.close();
      }
    });
  } finally {
    factory.mockRestore();
    await mock.close();
  }
});
