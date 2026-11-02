/** Packed objects retain a common slab only while an account still has an object using it. */
import { expect, test } from "vitest";
import { createIndexdModel } from "../../src/model/index.js";

test("deleting an object unpins its private slab without pruning an unfinished upload", () => {
  const model = createIndexdModel();
  model.createAccount({ publicKey: "owner" });
  model.pinSlab("owner", { id: "private", size: 3 });
  model.pinSlab("owner", { id: "unfinished", size: 5 });
  model.pinObject("owner", { id: "a", slabs: ["private"] });
  model.deleteObject("owner", "a");
  expect(model.listSlabs("owner")).toEqual([{ id: "unfinished", size: 5 }]);
  expect(() =>
    model.pinObject("owner", { id: "a", slabs: ["private"] }),
  ).toThrow("unpinned slab");
});

test("a shared slab stays pinned until its last object is deleted", () => {
  const model = createIndexdModel();
  model.createAccount({ publicKey: "owner" });
  model.pinSlab("owner", { id: "packed", size: 8 });
  model.pinObject("owner", { id: "a", slabs: ["packed"] });
  model.pinObject("owner", { id: "b", slabs: ["packed"] });
  model.deleteObject("owner", "a");
  expect(model.listSlabs("owner")).toEqual([{ id: "packed", size: 8 }]);
  model.pinObject("owner", {
    encryptedMetadata: "bmV3",
    id: "a",
    slabs: ["packed"],
  });
  expect(model.object("owner", "a")?.encryptedMetadata).toBe("bmV3");
  model.deleteObject("owner", "b");
  model.deleteObject("owner", "a");
  expect(model.listSlabs("owner")).toEqual([]);
  expect(() =>
    model.pinObject("owner", { id: "a", slabs: ["packed"] }),
  ).toThrow("unpinned slab");
});

test("another account retaining a slab cannot restore the deleted account's object", () => {
  const model = createIndexdModel();
  for (const account of ["owner", "other"]) {
    model.createAccount({ publicKey: account });
    model.pinSlab(account, { id: "packed", size: 8 });
    model.pinObject(account, { id: "a", slabs: ["packed"] });
  }
  model.deleteObject("owner", "a");
  expect(model.listSlabs("owner")).toEqual([]);
  expect(model.getSlab("other", "packed")).toEqual({ id: "packed", size: 8 });
  expect(() =>
    model.pinObject("owner", { id: "a", slabs: ["packed"] }),
  ).toThrow("unpinned slab");
  expect(model.object("other", "a")).toEqual({ id: "a", slabs: ["packed"] });
});

test("repinning a deleted packed object does not restore its sharing attachments", () => {
  const model = createIndexdModel();
  model.createAccount({ publicKey: "owner" });
  model.pinSlab("owner", { id: "packed", size: 8 });
  model.pinObject("owner", { id: "a", slabs: ["packed"] });
  model.pinObject("owner", { id: "b", slabs: ["packed"] });
  for (const key of ["reader", "second-reader"]) {
    model.createSharingKey("owner", { nonce: "n", publicKey: key });
    model.attachSharedObject("owner", key, {
      dataSignature: "sig",
      encryptedDataKey: "key",
      objectID: "a",
    });
  }
  model.createAccount({ publicKey: "other" });
  model.pinObject("other", { id: "a", slabs: [] });
  model.createSharingKey("other", { nonce: "n", publicKey: "other-reader" });
  model.attachSharedObject("other", "other-reader", {
    dataSignature: "other-sig",
    encryptedDataKey: "other-key",
    objectID: "a",
  });
  model.deleteObject("owner", "a");
  model.pinObject("owner", { id: "a", slabs: ["packed"] });
  expect(model.sharedObject("other-reader", "other-reader", "a")).toEqual({
    dataSignature: "other-sig",
    encryptedDataKey: "other-key",
    objectID: "a",
  });
  for (const key of ["reader", "second-reader"]) {
    expect(model.listRecipientObjects(key, key)).toEqual([]);
    expect(model.sharedStats(key, key).objectCount).toBe(0);
    expect(() => model.sharedObject(key, key, "a")).toThrow("not shared");
  }
});
