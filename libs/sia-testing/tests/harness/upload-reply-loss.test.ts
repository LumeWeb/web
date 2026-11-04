/** Upload effects remain owned when delivery never returns an application handle. */
import { expect, it, vi } from "vitest";
import { bytesFixture, createMockSia } from "../../src/mock.js";
import * as sdkModule from "../../src/sdk/index.js";
import { app } from "./application-scenarios.js";

it("upload reply loss rejects after committing without returning a handle", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("uploader");
      const writer = mock.application({ access: run.ownerAccess, as: actor });
      try {
        mock.mutationFaults.loseReply(
          { actor, operation: "upload" },
          { times: 1 },
        );
        await expect(
          writer.upload({
            file: await bytesFixture({ bytes: Uint8Array.of(7), name: "n" }),
            metadata: Uint8Array.of(3),
          }),
        ).rejects.toMatchObject({ code: "unavailable" });
        expect(
          mock.history().filter((r) => r.operation === "upload"),
        ).toMatchObject([
          {
            committed: true,
            objectId: expect.any(String) as unknown,
            status: "failed",
          },
        ]);
      } finally {
        await writer.close();
      }
    });
  } finally {
    await mock.close();
  }
});

it("real SDK staging completes receipt and charges before delivery can abort", async () => {
  const makeNetwork = sdkModule.createMockNetwork;
  const abort = new AbortController();
  const reason = new Error("SDK delivery aborted");
  let observed: unknown;
  let retained!: ReturnType<typeof makeNetwork>;
  let retainedSdk!: ReturnType<ReturnType<typeof makeNetwork>["createSdk"]>;
  let discard!: ReturnType<typeof vi.spyOn>;
  let stagedId = "";
  const mock = createMockSia();
  const factory = vi
    .spyOn(sdkModule, "createMockNetwork")
    .mockImplementation((...args) => {
      const network = (retained = makeNetwork(...args));
      discard = vi.spyOn(network, "discardUpload");
      const createSdk = network.createSdk.bind(network);
      vi.spyOn(network, "createSdk").mockImplementation((input) => {
        const sdk = (retainedSdk = createSdk(input));
        const upload = sdk.upload.bind(sdk);
        vi.spyOn(sdk, "upload").mockImplementation(async (...parameters) => {
          const object = await upload(...parameters);
          stagedId = object.id();
          observed = mock.history().find((r) => r.operation === "upload");
          abort.abort(reason);
          throw reason;
        });
        return sdk;
      });
      return network;
    });
  try {
    const result = await mock.run(
      { app, limits: { maxLogicalUploadBytes: 1, maxObjects: 2 } },
      async (run) => {
        const writer = mock.application({
          access: run.ownerAccess,
          as: mock.actor("writer"),
        });
        try {
          const file = await bytesFixture({
            bytes: Uint8Array.of(4),
            name: "n",
          });
          await expect(
            writer.upload({
              file,
              metadata: Uint8Array.of(8),
              signal: abort.signal,
            }),
          ).rejects.toBe(reason);
          expect(observed).toMatchObject({
            committed: true,
            objectId: stagedId,
          });
          expect(retained.serialize()).toContain(stagedId);
          const open = vi.fn(file.open.bind(file));
          await expect(
            writer.upload({
              file: { ...file, open },
              metadata: new Uint8Array(),
            }),
          ).rejects.toMatchObject({ code: "limit" });
          expect(open).not.toHaveBeenCalled();
        } finally {
          await writer.close();
        }
      },
    );
    expect(result.summary.logicalUploadedBytes).toBe(1);
    expect(retained.serialize()).not.toContain(stagedId);
    expect(discard).toHaveBeenCalledWith(
      expect.any(String) as unknown,
      stagedId,
    );
    await expect(
      retainedSdk.download({ id: () => stagedId }),
    ).rejects.toThrow();
  } finally {
    factory.mockRestore();
    await mock.close();
  }
});

it("upload loss selectors reject foreign actors and every object or share field before arming", async () => {
  const foreign = createMockSia(),
    mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("writer");
      const writer = mock.application({ access: run.ownerAccess, as: actor });
      try {
        for (const selector of [
          { operation: "upload" },
          { actor: { ...actor }, operation: "upload" },
          { actor: foreign.actor("writer"), operation: "upload" },
          { actor, object: undefined, operation: "upload" },
          { actor, object: {}, operation: "upload" },
          { actor, operation: "upload", share: undefined },
          { actor, operation: "upload", share: {} },
          { actor, operation: "upload", stage: "beforeCommit" },
          { actor, operation: "upload", times: 1 },
        ])
          expect(() =>
            mock.mutationFaults.loseReply(selector as never, { times: 1 }),
          ).toThrow();
        for (const times of [
          0,
          -1,
          1.5,
          Infinity,
          NaN,
          Number.MAX_SAFE_INTEGER + 1,
        ])
          expect(() =>
            mock.mutationFaults.loseReply(
              { actor, operation: "upload" },
              { times },
            ),
          ).toThrow();
        const object = await writer.upload({
          file: await bytesFixture({ bytes: Uint8Array.of(1), name: "n" }),
          metadata: new Uint8Array(),
        });
        expect(await writer.inspect(object)).toBe("uploaded");
      } finally {
        await writer.close();
      }
    });
  } finally {
    await mock.close();
    await foreign.close();
  }
});

it("source and hash failures and after-collection controls leave upload loss armed", async () => {
  const mock = createMockSia();
  try {
    const result = await mock.run(
      { app, limits: { maxLogicalUploadBytes: 1, maxObjects: 5 } },
      async (run) => {
        const actor = mock.actor("writer");
        const writer = mock.application({ access: run.ownerAccess, as: actor });
        try {
          const file = await bytesFixture({
            bytes: Uint8Array.of(1),
            name: "n",
          });
          const open = vi.fn(file.open.bind(file));
          const input = { file: { ...file, open }, metadata: Uint8Array.of(9) };
          mock.mutationFaults.loseReply(
            { actor, operation: "upload" },
            { times: 1 },
          );
          const sourceError = new Error("source failed");
          await expect(
            writer.upload({
              ...input,
              file: {
                ...file,
                open: () => {
                  throw sourceError;
                },
              },
            }),
          ).rejects.toBe(sourceError);
          await expect(
            writer.upload({
              ...input,
              file: { ...file, sha256: "0".repeat(64) },
            }),
          ).rejects.toBeDefined();
          mock.mutationFaults.fail(
            { actor, operation: "upload", stage: "beforeCommit" },
            { code: "denied", times: 1 },
          );
          await expect(writer.upload(input)).rejects.toMatchObject({
            code: "denied",
          });
          expect(open).toHaveBeenCalledTimes(1);
          const hold = mock.mutationFaults.hold({
            actor,
            operation: "upload",
            stage: "beforeCommit",
          });
          const abort = new AbortController();
          const cancelled = writer
            .upload({ ...input, signal: abort.signal })
            .catch((error: unknown) => error);
          try {
            const receipt = await hold.started();
            expect(receipt.committed).toBe(false);
            expect(open).toHaveBeenCalledTimes(2);
            const reason = new Error("caller stopped");
            abort.abort(reason);
            expect(await cancelled).toBe(reason);
          } finally {
            abort.abort();
            hold.release();
            await cancelled;
          }
          await expect(writer.upload(input)).rejects.toMatchObject({
            code: "unavailable",
          });
          expect(open).toHaveBeenCalledTimes(3);
          expect(
            mock.history().filter((row) => row.operation === "upload"),
          ).toMatchObject([
            { committed: false, status: "failed" },
            { committed: false, status: "cancelled" },
            {
              committed: true,
              objectId: expect.any(String) as unknown,
              status: "failed",
            },
          ]);
          const unopened = vi.fn(file.open.bind(file));
          await expect(
            writer.upload({ ...input, file: { ...file, open: unopened } }),
          ).rejects.toMatchObject({ code: "limit" });
          expect(unopened).not.toHaveBeenCalled();
        } finally {
          await writer.close();
        }
      },
    );
    expect(result.summary.logicalUploadedBytes).toBe(1);
  } finally {
    await mock.close();
  }
});

it("model microtasks observe committed upload receipts and explicit metadata survives the same completion", async () => {
  const makeNetwork = sdkModule.createMockNetwork;
  let observed: unknown;
  let effects = 0;
  const mock = createMockSia();
  const factory = vi
    .spyOn(sdkModule, "createMockNetwork")
    .mockImplementation((...args) => {
      const network = makeNetwork(...args);
      const pinSlab = network.model.pinSlab.bind(network.model);
      vi.spyOn(network.model, "pinSlab").mockImplementation((...parameters) => {
        pinSlab(...parameters);
        effects++;
        queueMicrotask(() => {
          observed = mock.history().find((row) => row.operation === "upload");
        });
      });
      return network;
    });
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("writer");
      const writer = mock.application({ access: run.ownerAccess, as: actor });
      const reader = mock.reader({ access: run.ownerAccess, as: actor });
      try {
        const object = await writer.upload({
          file: await bytesFixture({ bytes: Uint8Array.of(3), name: "n" }),
          metadata: Uint8Array.of(23),
        });
        expect(effects).toBe(1);
        expect(observed).toMatchObject({
          committed: true,
          objectId: object.id,
        });
        await writer.pin(object);
        expect((await reader.object(object.id)).metadata).toEqual(
          Uint8Array.of(23),
        );
        expect(
          new Uint8Array(
            await new Response(await reader.download(object)).arrayBuffer(),
          ),
        ).toEqual(Uint8Array.of(3));
      } finally {
        await writer.close();
        await reader.close();
      }
    });
  } finally {
    factory.mockRestore();
    await mock.close();
  }
});

it("port close retains an orphan until run cleanup discards its real payload without touching a sibling", async () => {
  const makeNetwork = sdkModule.createMockNetwork;
  const networks: ReturnType<typeof makeNetwork>[] = [];
  const discards: ReturnType<typeof vi.spyOn>[] = [];
  const factory = vi
    .spyOn(sdkModule, "createMockNetwork")
    .mockImplementation((...args) => {
      const network = makeNetwork(...args);
      networks.push(network);
      discards.push(vi.spyOn(network, "discardUpload"));
      return network;
    });
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (siblingRun) => {
      const sibling = mock.application({
        access: siblingRun.ownerAccess,
        as: mock.actor("sibling"),
      });
      const reader = mock.reader({
        access: siblingRun.ownerAccess,
        as: mock.actor("reader"),
      });
      try {
        const file = await bytesFixture({ bytes: Uint8Array.of(8), name: "n" });
        const control = await sibling.upload({
          file,
          metadata: Uint8Array.of(4),
        });
        await sibling.pin(control);
        let lostId = "";
        const result = await mock.run({ app }, async (run) => {
          const actor = mock.actor("lost");
          const writer = mock.application({
            access: run.ownerAccess,
            as: actor,
          });
          try {
            mock.mutationFaults.loseReply(
              { actor, operation: "upload" },
              { times: 1 },
            );
            await expect(
              writer.upload({ file, metadata: Uint8Array.of(6) }),
            ).rejects.toMatchObject({ code: "unavailable" });
            lostId = mock
              .history()
              .find(
                (row) => row.actor === actor && row.operation === "upload",
              )!.objectId!;
            await writer.close();
            expect(
              (JSON.parse(networks[1]!.serialize()) as { payloads: unknown[] })
                .payloads,
            ).toEqual([
              {
                accountId: expect.any(String) as unknown,
                data: "CA==",
                id: lostId,
              },
            ]);
            expect(discards[1]).not.toHaveBeenCalled();
          } finally {
            await writer.close();
          }
        });
        expect(result.summary.logicalUploadedBytes).toBe(1);
        expect(discards[1]).toHaveBeenCalledExactlyOnceWith(
          expect.any(String) as unknown,
          lostId,
        );
        expect(
          (JSON.parse(networks[1]!.serialize()) as { payloads: unknown[] })
            .payloads,
        ).toEqual([]);
        expect(await sibling.inspect(control)).toBe("pinned");
        expect((await reader.object(control.id)).metadata).toEqual(
          Uint8Array.of(4),
        );
        expect(
          new Uint8Array(
            await new Response(await reader.download(control)).arrayBuffer(),
          ),
        ).toEqual(Uint8Array.of(8));
      } finally {
        await sibling.close();
        await reader.close();
      }
    });
  } finally {
    factory.mockRestore();
    await mock.close();
  }
});

it("an SDK failure before staging leaves the upload loss for the next explicit attempt", async () => {
  const makeNetwork = sdkModule.createMockNetwork;
  const factory = vi
    .spyOn(sdkModule, "createMockNetwork")
    .mockImplementation((...args) => {
      const network = makeNetwork(...args);
      network.control.addFault({ operation: "upload", times: 1 });
      return network;
    });
  const mock = createMockSia();
  try {
    const result = await mock.run(
      { app, limits: { maxLogicalUploadBytes: 1, maxObjects: 2 } },
      async (run) => {
        const actor = mock.actor("writer");
        const writer = mock.application({ access: run.ownerAccess, as: actor });
        try {
          const file = await bytesFixture({
            bytes: Uint8Array.of(1),
            name: "n",
          });
          const open = vi.fn(file.open.bind(file));
          const input = { file: { ...file, open }, metadata: new Uint8Array() };
          mock.mutationFaults.loseReply(
            { actor, operation: "upload" },
            { times: 1 },
          );
          await expect(writer.upload(input)).rejects.toThrow(
            "injected network failure",
          );
          await expect(writer.upload(input)).rejects.toMatchObject({
            code: "unavailable",
          });
          expect(open).toHaveBeenCalledTimes(2);
          expect(
            mock.history().filter((row) => row.operation === "upload"),
          ).toMatchObject([
            { committed: false, status: "failed" },
            { committed: true, status: "failed" },
          ]);
        } finally {
          await writer.close();
        }
      },
    );
    expect(result.summary.logicalUploadedBytes).toBe(1);
  } finally {
    factory.mockRestore();
    await mock.close();
  }
});

it("validation, permission and allowance rejection do not open sources or consume upload loss", async () => {
  const mock = createMockSia();
  try {
    const actor = mock.actor("writer");
    const file = await bytesFixture({ bytes: Uint8Array.of(1), name: "n" });
    const open = vi.fn(file.open.bind(file));
    const input = { file: { ...file, open }, metadata: new Uint8Array() };
    mock.mutationFaults.loseReply({ actor, operation: "upload" }, { times: 1 });
    await mock.run({ app, limits: { maxObjects: 0 } }, async (run) => {
      const writer = mock.application({ access: run.ownerAccess, as: actor });
      try {
        await expect(writer.upload(input)).rejects.toMatchObject({
          code: "limit",
        });
        expect(open).not.toHaveBeenCalled();
      } finally {
        await writer.close();
      }
    });
    const result = await mock.run(
      { app, limits: { maxLogicalUploadBytes: 1, maxObjects: 1 } },
      async (run) => {
        const share = await run.shares.create({ objects: [] });
        const recipient = mock.application({ access: share.access, as: actor });
        const writer = mock.application({ access: run.ownerAccess, as: actor });
        try {
          await expect(recipient.upload(input)).rejects.toMatchObject({
            code: "denied",
          });
          await expect(
            writer.upload({ ...input, metadata: new Uint8Array(1025) }),
          ).rejects.toMatchObject({ code: "invalid-input" });
          const reason = new Error("already cancelled");
          await expect(
            writer.upload({ ...input, signal: AbortSignal.abort(reason) }),
          ).rejects.toBe(reason);
          expect(open).not.toHaveBeenCalled();
          await expect(writer.upload(input)).rejects.toMatchObject({
            code: "unavailable",
          });
          expect(open).toHaveBeenCalledTimes(1);
        } finally {
          await writer.close();
          await recipient.close();
        }
      },
    );
    expect(result.summary.logicalUploadedBytes).toBe(1);
  } finally {
    await mock.close();
  }
});
