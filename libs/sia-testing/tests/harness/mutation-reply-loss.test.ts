/** Committed changes remain inspectable without replaying the mutation. */
import { expect, it, vi } from "vitest";
import * as modelModule from "../../src/model/index.js";
import { bytesFixture, createMockSia } from "../../src/mock.js";
import type {
  ActorRef,
  ApplicationObject,
  ApplicationPort,
  ApplicationShareRef,
  MockRun,
  MockShareGrant,
  MockSia,
  MutationReplySelector,
} from "../../src/mock.js";
import { shareApp as app } from "./share-scenarios.js";

async function scenario(
  check: (input: {
    actor: ActorRef;
    grant: MockShareGrant;
    mock: MockSia;
    object: ApplicationObject;
    ref: ApplicationShareRef;
    run: MockRun;
    writer: ApplicationPort;
  }) => Promise<void>,
) {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("editor");
      const share = await run.shares.create({ objects: [] });
      const grant = await run.shares.grant(share, {
        as: actor,
        label: "selected",
        operations: ["add", "remove", "end"],
      });
      const writer = mock.application({
        access: run.ownerAccess,
        as: actor,
        shareGrants: [grant],
      });
      try {
        const [target] = await writer.shares.targets();
        const object = await writer.upload({
          file: await bytesFixture({ bytes: Uint8Array.of(1), name: "note" }),
          metadata: Uint8Array.of(9),
        });
        await writer.pin(object);
        await check({
          actor,
          grant,
          mock,
          object,
          ref: target!.ref,
          run,
          writer,
        });
      } finally {
        await writer.close();
      }
    });
  } finally {
    await mock.close();
  }
}

it("a lost Add reply retains membership for explicit inspection", async () => {
  await scenario(async ({ actor, grant, mock, object, ref, writer }) => {
    mock.mutationFaults.loseReply(
      { actor, operation: "share-add", share: grant },
      { times: 1 },
    );
    await expect(writer.shares.add(ref, object)).rejects.toMatchObject({
      code: "unavailable",
    });
    expect(await writer.shares.inspect(ref, object.id)).toEqual({
      contains: true,
      state: "active",
    });
    expect(
      mock.history().filter((row) => row.operation === "share-add"),
    ).toMatchObject([{ committed: true, status: "failed" }]);
    await writer.shares.remove(ref, object.id);
    expect(await writer.shares.inspect(ref, object.id)).toEqual({
      contains: false,
      state: "active",
    });
  });
});

for (const operation of ["share-add", "share-remove", "share-end"] as const) {
  it(`${operation} failures and cancellation leave its loss armed`, async () => {
    await scenario(async ({ actor, grant, mock, object, ref, writer }) => {
      if (operation === "share-remove") await writer.shares.add(ref, object);
      const invoke = (signal?: AbortSignal) =>
        operation === "share-add"
          ? writer.shares.add(ref, object, signal ? { signal } : {})
          : operation === "share-remove"
            ? writer.shares.remove(ref, object.id, signal ? { signal } : {})
            : writer.shares.end(ref, signal ? { signal } : {});
      mock.mutationFaults.loseReply(
        { actor, operation, share: grant },
        { times: 1 },
      );
      mock.mutationFaults.fail(
        { actor, operation, share: grant, stage: "beforeCommit" },
        { code: "denied", times: 1 },
      );
      await expect(invoke()).rejects.toMatchObject({ code: "denied" });
      const hold = mock.mutationFaults.hold({
        actor,
        operation,
        share: grant,
        stage: "beforeCommit",
      });
      const abort = new AbortController();
      const pending = invoke(abort.signal).catch((error: unknown) => error);
      try {
        await hold.started();
        abort.abort();
        expect(await pending).toBeInstanceOf(Error);
      } finally {
        hold.release();
      }
      expect(await writer.shares.inspect(ref, object.id)).toEqual({
        contains: operation === "share-remove",
        state: "active",
      });
      await expect(invoke()).rejects.toMatchObject({ code: "unavailable" });
      expect(
        mock
          .history()
          .filter((row) => row.operation === operation)
          .slice(-3),
      ).toMatchObject([
        { committed: false, status: "failed" },
        { committed: false, status: "cancelled" },
        { committed: true, status: "failed" },
      ]);
    });
  });
}

it("share selection snapshots original grant identity across installations and excludes another grant on the same share", async () => {
  await scenario(async ({ actor, grant, mock, object, ref, run, writer }) => {
    const share = await run.shares.create({ objects: [] });
    const first = await run.shares.grant(share, {
      as: actor,
      label: "first",
      operations: ["add", "remove"],
    });
    const second = await run.shares.grant(share, {
      as: actor,
      label: "second",
      operations: ["add", "remove"],
    });
    const other = mock.application({
      access: run.ownerAccess,
      as: actor,
      shareGrants: [first, second],
    });
    const installed = mock.application({
      access: run.ownerAccess,
      as: actor,
      shareGrants: [first],
    });
    try {
      const [a, b] = await other.shares.targets();
      const [c] = await installed.shares.targets();
      const selector: {
        actor: ActorRef;
        operation: "share-add";
        share: MockShareGrant;
      } = { actor, operation: "share-add", share: first };
      const options = { times: 2 };
      mock.mutationFaults.loseReply(selector, options);
      selector.share = grant;
      options.times = 9;
      await writer.shares.add(ref, object);
      await other.shares.add(b!.ref, object);
      await other.shares.remove(b!.ref, object.id);
      await expect(installed.shares.add(c!.ref, object)).rejects.toMatchObject({
        code: "unavailable",
      });
      await other.shares.remove(a!.ref, object.id);
      await expect(other.shares.add(a!.ref, object)).rejects.toMatchObject({
        code: "unavailable",
      });
      await other.shares.remove(a!.ref, object.id);
      await installed.shares.add(c!.ref, object);
    } finally {
      await other.close();
      await installed.close();
    }
  });
});

it("no-op Add, Remove and End leave reply losses armed", async () => {
  await scenario(async ({ actor, mock, object, ref, run, writer }) => {
    await writer.shares.add(ref, object);
    mock.mutationFaults.loseReply(
      { actor, operation: "share-add" },
      { times: 1 },
    );
    await writer.shares.add(ref, object);
    mock.mutationFaults.loseReply(
      { actor, operation: "share-remove" },
      { times: 1 },
    );
    await writer.shares.remove(ref, "f".repeat(64));
    await expect(writer.shares.remove(ref, object.id)).rejects.toMatchObject({
      code: "unavailable",
    });
    await expect(writer.shares.add(ref, object)).rejects.toMatchObject({
      code: "unavailable",
    });
    await writer.shares.end(ref);
    mock.mutationFaults.loseReply(
      { actor, operation: "share-end" },
      { times: 1 },
    );
    await writer.shares.end(ref);
    const next = await run.shares.create({ objects: [] });
    const nextGrant = await run.shares.grant(next, {
      as: actor,
      label: "next",
      operations: ["end"],
    });
    const other = mock.application({
      access: run.ownerAccess,
      as: actor,
      shareGrants: [nextGrant],
    });
    try {
      const [target] = await other.shares.targets();
      const results = await Promise.allSettled([
        other.shares.end(target!.ref),
        other.shares.end(target!.ref),
      ]);
      expect(results.map((row) => row.status).sort()).toEqual([
        "fulfilled",
        "rejected",
      ]);
      expect(
        mock.history().filter((row) => row.operation === "share-end"),
      ).toMatchObject([
        { committed: true, status: "completed" },
        { committed: false, status: "completed" },
        { committed: true, status: "failed" },
        { committed: false, status: "completed" },
      ]);
    } finally {
      await other.close();
    }
  });
});

it("invalid reply selectors reject before arming any loss", async () => {
  await scenario(async ({ actor, grant, mock, object, ref, writer }) => {
    for (const selector of [
      { operation: "share-add", share: grant },
      { actor: { ...actor }, operation: "share-add", share: grant },
      { actor: mock.actor("editor"), operation: "share-add", share: grant },
      { actor, operation: "share-add", share: { ...grant } },
      { actor, operation: "share-add", share: "id" },
      { actor, object, operation: "share-add" },
      { actor, object: undefined, operation: "share-remove" },
      { actor, operation: "delete", share: grant },
      { actor, operation: "share-end", stage: "beforeCommit" },
      { actor, operation: "upload", share: grant },
      { actor, object: { ...object }, operation: "delete" },
    ])
      expect(() =>
        mock.mutationFaults.loseReply(selector as MutationReplySelector, {
          times: 1,
        }),
      ).toThrow();
    for (const times of [
      0,
      -1,
      1.5,
      NaN,
      Infinity,
      Number.MAX_SAFE_INTEGER + 1,
    ])
      expect(() =>
        mock.mutationFaults.loseReply(
          { actor, operation: "share-add", share: grant },
          { times },
        ),
      ).toThrow();
    const foreign = createMockSia();
    try {
      expect(() =>
        foreign.mutationFaults.loseReply(
          {
            actor: foreign.actor("editor"),
            operation: "share-end",
            share: grant,
          },
          { times: 1 },
        ),
      ).toThrow();
    } finally {
      await foreign.close();
    }
    let retired!: MockShareGrant;
    await mock.run({ app }, async (otherRun) => {
      const share = await otherRun.shares.create({ objects: [] });
      retired = await otherRun.shares.grant(share, {
        as: actor,
        label: "retired",
        operations: ["end"],
      });
    });
    expect(() =>
      mock.mutationFaults.loseReply(
        { actor, operation: "share-end", share: retired },
        { times: 1 },
      ),
    ).toThrow();
    await writer.shares.add(ref, object);
    await writer.delete(object);
  });
});

it.each([false, true])(
  "lost delete retains the known handle and commits once (pinned: %s)",
  async (pinned) => {
    const mock = createMockSia({ clock: { start: "2026-01-01T00:00:00Z" } });
    try {
      await mock.run(
        { app, limits: { maxLogicalUploadBytes: 2, maxObjects: 2 } },
        async (run) => {
          const actor = mock.actor("writer");
          const writer = mock.application({
            access: run.ownerAccess,
            as: actor,
          });
          const reader = mock.reader({
            access: run.ownerAccess,
            as: mock.actor("reader"),
          });
          try {
            const file = await bytesFixture({
              bytes: Uint8Array.of(1),
              name: "n",
            });
            const input = { file, metadata: Uint8Array.of(9) };
            const object = await writer.upload(input);
            const sibling = await writer.upload(input);
            if (pinned) await writer.pin(object);
            await mock.publish({ access: run.ownerAccess });
            const before = await writer.events({ cursor: null, limit: 10 });
            mock.mutationFaults.loseReply(
              { actor, object, operation: "delete" },
              { times: 2 },
            );
            const outcomes = await Promise.allSettled([
              writer.delete(object),
              writer.delete(object),
            ]);
            expect(outcomes.map((row) => row.status).sort()).toEqual([
              "fulfilled",
              "rejected",
            ]);
            expect(
              outcomes.find((row) => row.status === "rejected"),
            ).toMatchObject({ reason: { code: "unavailable" } });
            expect(await writer.inspect(object)).toBe("missing");
            expect(await writer.inspect(sibling)).toBe("uploaded");
            await expect(reader.object(object.id)).rejects.toMatchObject({
              code: "not-found",
            });
            await expect(reader.download(object)).rejects.toMatchObject({
              code: "not-found",
            });
            await writer.delete(object);
            await expect(writer.upload(input)).rejects.toMatchObject({
              code: "limit",
            });
            expect(
              (await writer.events({ cursor: before.nextCursor, limit: 10 }))
                .events,
            ).toEqual([]);
            mock.advanceTime(1000);
            await mock.publish({ access: run.ownerAccess });
            const events = (
              await writer.events({ cursor: before.nextCursor, limit: 10 })
            ).events;
            expect(events).toHaveLength(pinned ? 1 : 0);
            if (pinned)
              expect(events[0]).toMatchObject({ deleted: true, id: object.id });
            await expect(writer.delete(sibling)).resolves.toBeUndefined();
            // The object selector remains armed after no-op deletion and excludes the sibling.
            expect(
              mock
                .history()
                .filter((row) => row.operation === "delete")
                .map((row) => row.committed),
            ).toEqual([true, false, false, true]);
          } finally {
            await reader.close();
            await writer.close();
          }
        },
      );
    } finally {
      await mock.close();
    }
  },
);

it("delete rejection, cancellation and repeated deletion do not consume another committed loss", async () => {
  await scenario(async ({ actor, mock, object, writer }) => {
    mock.mutationFaults.loseReply({ actor, operation: "delete" }, { times: 2 });
    mock.mutationFaults.fail(
      { actor, operation: "delete", stage: "beforeCommit" },
      { code: "denied", times: 1 },
    );
    await expect(writer.delete(object)).rejects.toMatchObject({
      code: "denied",
    });
    const hold = mock.mutationFaults.hold({
      actor,
      operation: "delete",
      stage: "beforeCommit",
    });
    const abort = new AbortController();
    const pending = writer
      .delete(object, { signal: abort.signal })
      .catch((error: unknown) => error);
    try {
      await hold.started();
      abort.abort();
      expect(await pending).toBeInstanceOf(Error);
    } finally {
      hold.release();
    }
    expect(await writer.inspect(object)).toBe("pinned");
    await expect(writer.delete(object)).rejects.toMatchObject({
      code: "unavailable",
    });
    await writer.delete(object);
    const sibling = await writer.upload({
      file: await bytesFixture({ bytes: Uint8Array.of(2), name: "other" }),
      metadata: new Uint8Array(),
    });
    await expect(writer.delete(sibling)).rejects.toMatchObject({
      code: "unavailable",
    });
    expect(await writer.inspect(sibling)).toBe("missing");
    expect(
      mock.history().filter((row) => row.operation === "delete"),
    ).toMatchObject([
      { committed: false, status: "failed" },
      { committed: false, status: "cancelled" },
      { committed: true, status: "failed" },
      { committed: false, status: "completed" },
      { committed: true, status: "failed" },
    ]);
  });
});

it("lost share replies follow one real model effect and retain commitment after caller abort", async () => {
  let model!: ReturnType<typeof modelModule.createIndexdModel>;
  const create = modelModule.createIndexdModel;
  const factory = vi
    .spyOn(modelModule, "createIndexdModel")
    .mockImplementation((options) => (model = create(options)));
  try {
    await scenario(async ({ actor, grant, mock, object, ref, writer }) => {
      const attach = vi.spyOn(model, "attachSharedObject");
      const detach = vi.spyOn(model, "detachSharedObject");
      const revoke = model.revokeSharingKey.bind(model);
      const abort = new AbortController();
      const end = vi
        .spyOn(model, "revokeSharingKey")
        .mockImplementation((...args) => {
          revoke(...args);
          abort.abort(new Error("after effect"));
        });
      for (const operation of [
        "share-add",
        "share-remove",
        "share-end",
      ] as const)
        mock.mutationFaults.loseReply(
          { actor, operation, share: grant },
          { times: 1 },
        );
      await expect(writer.shares.add(ref, object)).rejects.toMatchObject({
        code: "unavailable",
      });
      await expect(writer.shares.remove(ref, object.id)).rejects.toMatchObject({
        code: "unavailable",
      });
      await expect(
        writer.shares.end(ref, { signal: abort.signal }),
      ).rejects.toMatchObject({ code: "unavailable" });
      expect(attach).toHaveBeenCalledTimes(1);
      expect(detach).toHaveBeenCalledTimes(1);
      expect(end).toHaveBeenCalledTimes(1);
      expect(
        mock
          .history()
          .filter(
            (row) =>
              row.operation.startsWith("share-") && row.committed !== undefined,
          ),
      ).toMatchObject([
        { committed: true, operation: "share-add", status: "failed" },
        { committed: true, operation: "share-remove", status: "failed" },
        { committed: true, operation: "share-end", status: "cancelled" },
      ]);
      expect(await writer.shares.inspect(ref, null)).toEqual({
        contains: null,
        state: "ended",
      });
      expect(await writer.inspect(object)).toBe("pinned");
    });
  } finally {
    factory.mockRestore();
  }
});

it("actor-only share loss excludes an equal label and rejects unpinned Add without consuming", async () => {
  await scenario(async ({ actor, mock, object, ref, run, writer }) => {
    const share = await run.shares.create({ objects: [] });
    const otherActor = mock.actor("editor");
    const grant = await run.shares.grant(share, {
      as: otherActor,
      label: "other",
      operations: ["add"],
    });
    const other = mock.application({
      access: run.ownerAccess,
      as: otherActor,
      shareGrants: [grant],
    });
    try {
      const staged = await writer.upload({
        file: await bytesFixture({ bytes: Uint8Array.of(4), name: "staged" }),
        metadata: new Uint8Array(),
      });
      mock.mutationFaults.loseReply(
        { actor, operation: "share-add" },
        { times: 1 },
      );
      await expect(writer.shares.add(ref, staged)).rejects.toMatchObject({
        code: "denied",
      });
      const [target] = await other.shares.targets();
      await other.shares.add(target!.ref, object);
      await expect(writer.shares.add(ref, object)).rejects.toMatchObject({
        code: "unavailable",
      });
      expect(await writer.inspect(staged)).toBe("uploaded");
      expect(await other.shares.inspect(target!.ref, object.id)).toEqual({
        contains: true,
        state: "active",
      });
    } finally {
      await other.close();
    }
  });
});
