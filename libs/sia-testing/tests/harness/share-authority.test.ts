/** Direct grant tests cover deadlines, held work, and run-scoped object authority. */
import { expect, it } from "vitest";
import { bytesFixture, createMockSia } from "../../src/mock.js";
import { shareApp as app } from "./share-scenarios.js";
const start = "2026-01-01T00:00:00.000Z";
it("grant input is snapshotted and terminal End precedes share expiry", async () => {
  const mock = createMockSia({ clock: { start } });
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("editor");
      const share = await run.shares.create({
        expiresAt: new Date(Date.parse(start) + 1000),
        objects: [],
      });
      const operations: ("add" | "end")[] = ["end"];
      const expiresAt = new Date(Date.parse(start) + 2000);
      const grant = await run.shares.grant(share, {
        as: actor,
        expiresAt,
        label: "end",
        operations,
      });
      operations.push("add");
      expiresAt.setTime(0);
      const writer = mock.application({
        access: run.ownerAccess,
        as: actor,
        shareGrants: [grant],
      });
      const [target] = await writer.shares.targets();
      expect(target).toMatchObject({
        expiresAt: "2026-01-01T00:00:02.000Z",
        operations: ["end"],
      });
      (target!.operations as string[]).push("remove");
      expect((await writer.shares.targets())[0]!.operations).toEqual(["end"]);
      await writer.shares.end(target!.ref);
      mock.advanceTime(1000);
      expect(await writer.shares.inspect(target!.ref, "f".repeat(64))).toEqual({
        contains: null,
        state: "ended",
      });
      await writer.shares.end(target!.ref);
      mock.advanceTime(1000);
      await expect(
        writer.shares.inspect(target!.ref, null),
      ).rejects.toMatchObject({ code: "denied" });
      await expect(writer.shares.end(target!.ref)).rejects.toMatchObject({
        code: "denied",
      });
      expect(await writer.shares.targets()).toEqual([]);
      await writer.close();
    });
  } finally {
    await mock.close();
  }
});
it("valid grants can inspect expired membership but cannot mutate it", async () => {
  const mock = createMockSia({ clock: { start } });
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("editor");
      const fixture = await run.objects.upload({
        file: await bytesFixture({ bytes: Uint8Array.of(1), name: "n" }),
        metadata: new Uint8Array(),
      });
      const share = await run.shares.create({
        expiresAt: new Date(Date.parse(start) + 10),
        objects: [fixture],
      });
      const grant = await run.shares.grant(share, {
        as: actor,
        label: "list",
        operations: ["remove", "end"],
      });
      const writer = mock.application({
        access: run.ownerAccess,
        as: actor,
        shareGrants: [grant],
      });
      const [target] = await writer.shares.targets();
      mock.advanceTime(10);
      expect(await writer.shares.inspect(target!.ref, fixture.id)).toEqual({
        contains: true,
        state: "expired",
      });
      await expect(
        writer.shares.remove(target!.ref, fixture.id),
      ).rejects.toMatchObject({ code: "denied" });
      await expect(writer.shares.end(target!.ref)).rejects.toMatchObject({
        code: "denied",
      });
      const owner = mock.ownerShares({ access: run.ownerAccess, as: actor });
      const page = await owner.list({ limit: 10, offset: 0 });
      expect(page.items).toHaveLength(1);
      await expect(
        writer.shares.end(page.items[0]!.ref as never),
      ).rejects.toMatchObject({ code: "foreign-handle" });
      await Promise.all([owner.close(), writer.close()]);
    });
  } finally {
    await mock.close();
  }
});
for (const withdrawal of [
  "grant",
  "deadline",
  "share-expiry",
  "end",
  "delete",
] as const) {
  it(`held Add rechecks ${withdrawal} at its effect`, async () => {
    const mock = createMockSia({ clock: { start } });
    try {
      await mock.run({ app }, async (run) => {
        const actor = mock.actor("editor");
        const share = await run.shares.create({
          objects: [],
          ...(withdrawal === "share-expiry"
            ? { expiresAt: new Date(Date.parse(start) + 10) }
            : {}),
        });
        const grant = await run.shares.grant(share, {
          as: actor,
          label: "list",
          operations: ["add", "end"],
          ...(withdrawal === "deadline"
            ? { expiresAt: new Date(Date.parse(start) + 10) }
            : {}),
        });
        const writer = mock.application({
          access: run.ownerAccess,
          as: actor,
          shareGrants: [grant],
        });
        const [target] = await writer.shares.targets();
        const object = await writer.upload({
          file: await bytesFixture({ bytes: Uint8Array.of(1), name: "n" }),
          metadata: new Uint8Array(),
        });
        await writer.pin(object);
        const hold = mock.mutationFaults.hold({
          operation: "share-add",
          share: grant,
          stage: "beforeCommit",
        });
        const adding = writer.shares.add(target!.ref, object);
        const failed = expect(adding).rejects.toMatchObject({ code: "denied" });
        expect(await hold.started()).toMatchObject({
          committed: false,
          shareId: share.id,
        });
        if (withdrawal === "grant") await run.shares.revokeGrant(grant);
        else if (withdrawal === "deadline" || withdrawal === "share-expiry")
          mock.advanceTime(10);
        else if (withdrawal === "end") await writer.shares.end(target!.ref);
        else await writer.delete(object);
        hold.release();
        await failed;
        expect(
          mock.history().find((row) => row.operation === "share-add"),
        ).toMatchObject({ committed: false, status: "failed" });
        if (withdrawal === "delete")
          expect(await writer.shares.inspect(target!.ref, object.id)).toEqual({
            contains: false,
            state: "active",
          });
        await writer.close();
      });
    } finally {
      await mock.close();
    }
  });
}
it("read holds recheck grant authority and selectors match the original grant across clients", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("editor");
      const share = await run.shares.create({ objects: [] });
      const grant = await run.shares.grant(share, {
        as: actor,
        label: "one",
        operations: ["remove"],
      });
      const otherGrant = await run.shares.grant(share, {
        as: actor,
        label: "two",
        operations: ["remove"],
      });
      const writer = mock.application({
        access: run.ownerAccess,
        as: actor,
        shareGrants: [grant, otherGrant],
      });
      const sibling = mock.application({
        access: run.ownerAccess,
        as: actor,
        shareGrants: [grant],
      });
      const [one, two] = await writer.shares.targets();
      const [installed] = await sibling.shares.targets();
      const hold = mock.faults.hold({
        operation: "share-inspect",
        share: grant,
      });
      const inspecting = sibling.shares.inspect(installed!.ref, null);
      const denied = expect(inspecting).rejects.toMatchObject({
        code: "denied",
      });
      await hold.started();
      expect(await writer.shares.inspect(two!.ref, null)).toEqual({
        contains: null,
        state: "active",
      });
      await run.shares.revokeGrant(grant);
      hold.release();
      await denied;
      await expect(writer.shares.inspect(one!.ref, null)).rejects.toMatchObject(
        { code: "denied" },
      );
      await Promise.all([writer.close(), sibling.close()]);
    });
  } finally {
    await mock.close();
  }
});
it("failed and cancelled calls leave no effect while a sibling can commit", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("editor");
      const share = await run.shares.create({ objects: [] });
      const grant = await run.shares.grant(share, {
        as: actor,
        label: "list",
        operations: ["end"],
      });
      const writer = mock.application({
        access: run.ownerAccess,
        as: actor,
        shareGrants: [grant],
      });
      const [target] = await writer.shares.targets();
      mock.mutationFaults.fail(
        { operation: "share-end", share: grant, stage: "beforeCommit" },
        { code: "unavailable", times: 1 },
      );
      await expect(writer.shares.end(target!.ref)).rejects.toMatchObject({
        code: "unavailable",
      });
      expect(await writer.shares.inspect(target!.ref, null)).toEqual({
        contains: null,
        state: "active",
      });
      const abort = new AbortController();
      const reason = new Error("caller stopped");
      const hold = mock.mutationFaults.hold({
        operation: "share-end",
        share: grant,
        stage: "beforeCommit",
      });
      const ending = writer.shares.end(target!.ref, { signal: abort.signal });
      const cancelled = expect(ending).rejects.toBe(reason);
      await hold.started();
      abort.abort(reason);
      await cancelled;
      expect(await hold.cancelled()).toMatchObject({
        committed: false,
        status: "cancelled",
      });
      await Promise.all([
        writer.shares.end(target!.ref),
        writer.shares.end(target!.ref),
      ]);
      expect(
        mock
          .history()
          .filter((r) => r.operation === "share-end")
          .map((r) => [r.status, r.committed]),
      ).toEqual([
        ["failed", false],
        ["cancelled", false],
        ["completed", true],
        ["completed", false],
      ]);
      await writer.close();
    });
  } finally {
    await mock.close();
  }
});
it("grant issuance rejects malformed operations and foreign authority", async () => {
  const mock = createMockSia({ clock: { start } });
  const foreign = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("editor");
      const share = await run.shares.create({ objects: [] });
      for (const operations of [[], ["add", "add"], ["unknown"]]) {
        await expect(
          run.shares.grant(share, {
            as: actor,
            label: "bad",
            operations: operations as never,
          }),
        ).rejects.toMatchObject({ code: "invalid-input" });
      }
      for (const expiresAt of [new Date(NaN), new Date(start)]) {
        await expect(
          run.shares.grant(share, {
            as: actor,
            expiresAt,
            label: "bad",
            operations: ["end"],
          }),
        ).rejects.toMatchObject({ code: "invalid-input" });
      }
      await expect(
        run.shares.grant(
          { ...share },
          { as: actor, label: "bad", operations: ["end"] },
        ),
      ).rejects.toMatchObject({ code: "foreign-handle" });
      await expect(
        run.shares.grant(share, {
          as: foreign.actor("editor"),
          label: "bad",
          operations: ["end"],
        }),
      ).rejects.toMatchObject({ code: "foreign-handle" });
      const grant = await run.shares.grant(share, {
        as: actor,
        label: "list",
        operations: ["end"],
      });
      expect(() =>
        mock.application({
          access: run.ownerAccess,
          as: actor,
          shareGrants: [{ ...grant }],
        }),
      ).toThrow();
      expect(() =>
        mock.application({
          access: share.access,
          as: actor,
          shareGrants: [grant],
        }),
      ).toThrow();
      expect(() =>
        mock.application({
          access: run.ownerAccess,
          as: mock.actor("editor"),
          shareGrants: [grant],
        }),
      ).toThrow();
      expect(() =>
        mock.application({
          access: run.ownerAccess,
          as: actor,
          shareGrants: [grant, grant],
        }),
      ).toThrow();
      await mock.run({ app }, async (otherRun) => {
        expect(() =>
          mock.application({
            access: otherRun.ownerAccess,
            as: actor,
            shareGrants: [grant],
          }),
        ).toThrow();
        await expect(otherRun.shares.revokeGrant(grant)).rejects.toMatchObject({
          code: "foreign-handle",
        });
      });
      const empty = mock.application({ access: run.ownerAccess, as: actor });
      expect(await empty.shares.targets()).toEqual([]);
      await expect(empty.shares.end(share as never)).rejects.toMatchObject({
        code: "foreign-handle",
      });
      await empty.close();
    });
  } finally {
    await Promise.all([mock.close(), foreign.close()]);
  }
});
