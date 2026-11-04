/** Real model observers check that share effects and receipts settle in the same turn. */
import { expect, it, vi } from "vitest";
import * as modelModule from "../../src/model/index.js";
import { bytesFixture, createMockSia } from "../../src/mock.js";
import type { IndexdModel } from "../../src/model/index.js";
import { shareApp as app } from "./share-scenarios.js";
it("membership no-ops preserve model timestamps and deletion changes live inspection", async () => {
  let model!: IndexdModel;
  const create = modelModule.createIndexdModel;
  const spy = vi
    .spyOn(modelModule, "createIndexdModel")
    .mockImplementation((options) => (model = create(options)));
  const mock = createMockSia({ clock: { start: "2026-01-01T00:00:00Z" } });
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
      const other = mock.application({ access: run.ownerAccess, as: actor });
      const [target] = await writer.shares.targets();
      const object = await other.upload({
        file: await bytesFixture({ bytes: Uint8Array.of(1), name: "n" }),
        metadata: new Uint8Array(),
      });
      await other.pin(object);
      await writer.shares.add(target!.ref, object);
      const updatedAt = model.getSharingKey(run.id, share.id).updatedAt;
      mock.advanceTime(1000);
      await writer.shares.add(target!.ref, object);
      await writer.shares.remove(target!.ref, "f".repeat(64));
      expect(model.getSharingKey(run.id, share.id).updatedAt).toBe(updatedAt);
      expect(model.hasOwnedSharedObject(run.id, share.id, object.id)).toBe(
        true,
      );
      await other.delete(object);
      expect(await writer.shares.inspect(target!.ref, object.id)).toEqual({
        contains: false,
        state: "active",
      });
      await expect(
        writer.shares.add(target!.ref, object),
      ).rejects.toMatchObject({ code: "denied" });
      await run.shares.revoke(share);
      expect(await writer.shares.inspect(target!.ref, null)).toEqual({
        contains: null,
        state: "ended",
      });
      await writer.shares.end(target!.ref);
      await Promise.all([writer.close(), other.close()]);
    });
  } finally {
    await mock.close();
    spy.mockRestore();
  }
});
it("post-effect cancellation preserves the actual model change and committed receipt", async () => {
  let model!: IndexdModel;
  const create = modelModule.createIndexdModel;
  const spy = vi
    .spyOn(modelModule, "createIndexdModel")
    .mockImplementation((options) => (model = create(options)));
  const mock = createMockSia();
  const abort = new AbortController();
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
      let observed!: () => void;
      const observation = new Promise<void>((resolve) => {
        observed = resolve;
      });
      const revoke = model.revokeSharingKey.bind(model);
      model.revokeSharingKey = (owner, id) => {
        revoke(owner, id);
        queueMicrotask(() => {
          expect(
            mock.history().find((row) => row.operation === "share-end"),
          ).toMatchObject({ committed: true });
          expect(model.listSharingKeys(run.id)).toEqual([]);
          abort.abort(new Error("after effect"));
          observed();
        });
      };
      await writer.shares.end(target!.ref, { signal: abort.signal });
      await observation;
      expect(await writer.shares.inspect(target!.ref, null)).toEqual({
        contains: null,
        state: "ended",
      });
      await writer.close();
    });
  } finally {
    await mock.close();
    spy.mockRestore();
  }
});
