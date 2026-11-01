/** Restored models preserve ownership and event history without replaying mutations. */
import { expect, test } from "vitest";
import { createIndexdModel } from "../../src/model/index.js";
import type { ModelState } from "../../src/model/state.js";

function fixture() {
  const model = createIndexdModel({
    hosts: [{ addresses: ["host.test:9984"], publicKey: "host" }],
    now: () => new Date("2030-01-01T00:00:00Z"),
    quotaBytes: 4,
  });
  model.createAccount({ publicKey: "owner" });
  model.createAccount({ publicKey: "other" });
  model.pinSlab("owner", { id: "slab", size: 4 });
  model.pinObject("owner", {
    encryptedMetadata: "AQ==",
    id: "video",
    slabs: ["slab"],
  });
  return model;
}

function restored(model = fixture()) {
  return createIndexdModel({
    now: () => new Date("2030-01-01T00:00:00Z"),
    state: model.serialize(),
  });
}

test("restoring pinned objects keeps their original events and account boundaries", () => {
  const model = fixture();
  model.pinObject("owner", { id: "video", slabs: ["slab"] });
  const events = model.objectEvents("owner");
  const copy = restored(model);
  expect(copy.accountStats("owner")).toEqual({ objectCount: 1, pinnedSize: 4 });
  expect(copy.object("owner", "video")).toMatchObject({
    encryptedMetadata: "AQ==",
    slabs: ["slab"],
  });
  expect(copy.objectEvents("owner")).toEqual(events);
  expect(copy.object("other", "video")).toBeUndefined();
  expect(() => copy.getSlab("other", "slab")).toThrow("not found");
});

test("restoring preserves host configuration and quota enforcement", () => {
  const copy = restored();
  expect(copy.hosts("owner")).toEqual([
    { addresses: ["host.test:9984"], publicKey: "host" },
  ]);
  copy.pinSlab("owner", { id: "extra", size: 1 });
  expect(() =>
    copy.pinObject("owner", { id: "extra", slabs: ["extra"] }),
  ).toThrow("quota exceeded");
});

test("an unpinned slab survives until the restored account prunes it", () => {
  const model = fixture();
  model.pinSlab("owner", { id: "uncommitted", size: 1 });
  const copy = restored(model);
  expect(copy.getSlab("owner", "uncommitted").size).toBe(1);
  expect(copy.pruneSlabs("owner")).toEqual(["uncommitted"]);
  expect(copy.getSlab("owner", "slab").size).toBe(4);
});

test("sharing attachments retain recipient fields after restart", () => {
  const model = fixture();
  model.createSharingKey("owner", { nonce: "nonce", publicKey: "share" });
  model.attachSharedObject("owner", "share", {
    dataSignature: "recipient-signature",
    encryptedDataKey: "recipient-key",
    objectID: "video",
  });
  const copy = restored(model);
  expect(copy.sharedObject("share", "share", "video")).toEqual({
    dataSignature: "recipient-signature",
    encryptedDataKey: "recipient-key",
    objectID: "video",
  });
  expect(() => copy.sharedObject("other", "share", "video")).toThrow(
    "unavailable",
  );
  copy.revokeSharingKey("owner", "share");
  expect(() => restored(copy).sharedObject("share", "share", "video")).toThrow(
    "unavailable",
  );
});

test("pending and approved connections retain expiry and request identity", () => {
  const model = fixture();
  const pending = model.requestConnection({
    appId: "app",
    publicKey: "pending",
  });
  const approved = model.requestConnection({
    appId: "app",
    publicKey: "approved",
  });
  model.approveConnection(approved.id, "placeholder");
  const copy = restored(model);
  expect(copy.connectionRequest(pending.id)?.approved).toBe(false);
  expect(() => copy.registerConnection(pending.id, "key")).toThrow(
    "not approved",
  );
  expect(copy.registerConnection(approved.id, "approved-key").id).toBe(
    "approved-key",
  );
  expect(
    copy.requestConnection({ appId: "app", publicKey: "next" }).id,
  ).not.toBe(pending.id);
  const later = createIndexdModel({
    now: () => new Date("2030-01-01T00:11:00Z"),
    state: model.serialize(),
  });
  expect(() => later.connectionRequest(pending.id)).toThrow("expired");
});

test("restored mutations cannot change the source model", () => {
  const model = fixture();
  const copy = restored(model);
  copy.deleteObject("owner", "video");
  copy.pruneSlabs("owner");
  expect(model.object("owner", "video")?.slabs).toEqual(["slab"]);
  expect(model.accountStats("owner").pinnedSize).toBe(4);
});

test("seeded opaque records do not acquire pin events during restore", () => {
  const model = fixture();
  model.seedObject("owner", { id: "opaque", slabs: ["fixture-only"] });
  const copy = restored(model);
  expect(copy.object("owner", "opaque")?.slabs).toEqual(["fixture-only"]);
  expect(copy.objectEvents("owner")).toHaveLength(1);
});

test("a restored snapshot cannot silently override its saved quota", () => {
  expect(() =>
    createIndexdModel({ quotaBytes: 100, state: fixture().serialize() }),
  ).toThrow("snapshot");
});

test.each(["not json", "{}", '{"version":99}', '{"version":1,"accounts":[]}'])(
  "invalid model state %s is rejected",
  (state) => {
    expect(() => createIndexdModel({ state })).toThrow("snapshot");
  },
);

test("serializing rejects settings that JSON would silently change", () => {
  const unlimited = createIndexdModel({ quotaBytes: Infinity });
  expect(() => unlimited.serialize()).toThrow("snapshot");
  const invalidHost = createIndexdModel({
    hosts: [{ addresses: [], latitude: NaN, publicKey: "host" }],
  });
  expect(() => invalidHost.serialize()).toThrow("snapshot");
});

test("a saved account cannot refer to a missing slab", () => {
  const state = JSON.parse(fixture().serialize()) as ModelState;
  state.accounts[0]!.slabs.push("missing");
  expect(() => createIndexdModel({ state: JSON.stringify(state) })).toThrow(
    "snapshot",
  );
});

test("duplicate saved accounts cannot replace an earlier account", () => {
  const state = JSON.parse(fixture().serialize()) as ModelState;
  state.accounts.push(state.accounts[0]!);
  expect(() => createIndexdModel({ state: JSON.stringify(state) })).toThrow(
    "snapshot",
  );
});
