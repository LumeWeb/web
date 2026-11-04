/** Application share grants constrain membership edits without granting object ownership. */
import { expect, it } from "vitest";
import { bytesFixture, createMockSia } from "../../src/mock.js";
const app = {
  description: "Shares",
  id: "a".repeat(64),
  name: "Shares",
  serviceUrl: "https://example.invalid",
};
it("grants expose client-bound targets and End preserves the owned payload", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("editor");
      const share = await run.shares.create({ objects: [] });
      const grant = await run.shares.grant(share, {
        as: actor,
        label: "list",
        operations: ["add", "remove", "end"],
      });
      const writer = mock.application({
        access: run.ownerAccess,
        as: actor,
        shareGrants: [grant],
      });
      const other = mock.application({
        access: run.ownerAccess,
        as: actor,
        shareGrants: [grant],
      });
      const [target] = await writer.shares.targets();
      expect(target).toMatchObject({
        label: "list",
        operations: ["add", "remove", "end"],
      });
      await expect(
        other.shares.inspect(target!.ref, null),
      ).rejects.toMatchObject({ code: "foreign-handle" });
      await expect(
        writer.shares.inspect({ ...target!.ref }, null),
      ).rejects.toMatchObject({ code: "foreign-handle" });
      const file = await bytesFixture({
        bytes: Uint8Array.of(1, 2),
        name: "note",
      });
      const object = await writer.upload({ file, metadata: new Uint8Array() });
      await expect(
        writer.shares.add(target!.ref, object),
      ).rejects.toMatchObject({ code: "denied" });
      await writer.pin(object);
      await writer.shares.add(target!.ref, object);
      await writer.shares.add(target!.ref, object);
      expect(await writer.shares.inspect(target!.ref, object.id)).toEqual({
        contains: true,
        state: "active",
      });
      await writer.shares.remove(target!.ref, object.id);
      await writer.shares.remove(target!.ref, object.id);
      await writer.shares.end(target!.ref);
      await writer.shares.end(target!.ref);
      expect(await writer.shares.inspect(target!.ref, object.id)).toEqual({
        contains: null,
        state: "ended",
      });
      expect(await writer.inspect(object)).toBe("pinned");
      expect(
        mock
          .history()
          .filter(
            (r) =>
              r.operation.startsWith("share-") && r.committed !== undefined,
          )
          .map((r) => r.committed),
      ).toEqual([true, false, true, false, true, false]);
      await run.shares.revokeGrant(grant);
      expect(await writer.shares.targets()).toEqual([]);
      await expect(
        writer.shares.inspect(target!.ref, null),
      ).rejects.toMatchObject({ code: "denied" });
      await Promise.all([writer.close(), other.close()]);
    });
  } finally {
    await mock.close();
  }
});
import { shareScenarios } from "./share-scenarios.js";
shareScenarios((mock, run, actor, shareGrants) =>
  Promise.resolve({
    close: () => Promise.resolve(),
    sibling: mock.application({
      access: run.ownerAccess,
      as: actor,
      shareGrants,
    }),
    writer: mock.application({
      access: run.ownerAccess,
      as: actor,
      shareGrants,
    }),
  }),
);
it("Remove rejects a null selector rather than recording a no-op", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("editor");
      const share = await run.shares.create({ objects: [] });
      const grant = await run.shares.grant(share, {
        as: actor,
        label: "list",
        operations: ["remove"],
      });
      const writer = mock.application({
        access: run.ownerAccess,
        as: actor,
        shareGrants: [grant],
      });
      const [target] = await writer.shares.targets();
      await expect(
        writer.shares.remove(target!.ref, null as never),
      ).rejects.toMatchObject({ code: "invalid-input" });
      expect(
        mock.history().filter((row) => row.operation === "share-remove"),
      ).toEqual([]);
      await writer.close();
    });
  } finally {
    await mock.close();
  }
});
