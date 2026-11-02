/** Manual batches expose the latest object mutation at a cursor-safe whole-second position. */
import { expect, test } from "vitest";
import { createIndexdModel } from "../../src/model/index.js";

function manualModel() {
  let now = new Date("2026-01-01T00:00:00.400Z");
  const model = createIndexdModel({
    eventPublication: "manual",
    now: () => now,
  });
  model.createAccount({ publicKey: "owner" });
  return {
    model,
    setTime: (value: string) => {
      now = new Date(value);
    },
  };
}

test("reset starts a fresh publication timeline", () => {
  const { model } = manualModel();
  model.pinObject("owner", { id: "a", slabs: [] });
  model.publishObjectEvents();
  model.createAccount({ publicKey: "other" });
  model.pinObject("other", { id: "pending", slabs: [] });
  model.reset();
  model.createAccount({ publicKey: "owner" });
  model.pinObject("owner", { id: "fresh", slabs: [] });
  model.publishObjectEvents();
  expect(model.objectEvents("owner").map((event) => event.key)).toEqual([
    "fresh",
  ]);
  expect(
    createIndexdModel({ state: model.serialize() })
      .objectEvents("owner")
      .map((event) => event.key),
  ).toEqual(["fresh"]);
});

test("an idle publication call does not consume its second", () => {
  const { model } = manualModel();
  model.publishObjectEvents();
  model.pinObject("owner", { id: "a", slabs: [] });
  model.publishObjectEvents();
  expect(model.objectEvents("owner").map((event) => event.key)).toEqual(["a"]);
});

test("a packed object's pending changes coalesce to its latest pin", () => {
  const { model } = manualModel();
  model.pinSlab("owner", { id: "packed", size: 8 });
  model.pinObject("owner", { id: "sibling", slabs: ["packed"] });
  model.pinObject("owner", {
    encryptedMetadata: "b2xk",
    id: "a",
    slabs: ["packed"],
  });
  model.deleteObject("owner", "a");
  model.pinObject("owner", {
    encryptedMetadata: "bmV3",
    id: "a",
    slabs: ["packed"],
  });
  expect(model.objectEvents("owner")).toEqual([]);
  model.publishObjectEvents();
  expect(
    model.objectEvents("owner").filter((event) => event.key === "a"),
  ).toEqual([
    {
      deleted: false,
      key: "a",
      object: { encryptedMetadata: "bmV3", id: "a", slabs: ["packed"] },
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ]);
});

test("a deletion before publication leaves only a tombstone", () => {
  const { model } = manualModel();
  model.pinObject("owner", { id: "a", slabs: [] });
  model.deleteObject("owner", "a");
  expect(model.objectEvents("owner")).toEqual([]);
  model.publishObjectEvents();
  expect(model.objectEvents("owner")).toEqual([
    { deleted: true, key: "a", updatedAt: "2026-01-01T00:00:00.000Z" },
  ]);
});

test("pending mutations wait for a second past the global publication watermark", () => {
  const { model, setTime } = manualModel();
  model.pinObject("owner", { id: "a", slabs: [] });
  expect(model.objectEvents("owner")).toEqual([]);
  model.publishObjectEvents();
  model.createAccount({ publicKey: "other" });
  model.pinObject("other", { id: "b", slabs: [] });
  setTime("2026-01-01T00:00:00.900Z");
  model.publishObjectEvents();
  expect(model.objectEvents("other")).toEqual([]);
  setTime("2025-12-31T23:59:59.900Z");
  model.publishObjectEvents();
  expect(model.objectEvents("other")).toEqual([]);
  setTime("2026-01-01T00:00:01.001Z");
  model.publishObjectEvents();
  expect(model.objectEvents("other")).toEqual([
    {
      deleted: false,
      key: "b",
      object: { id: "b", slabs: [] },
      updatedAt: "2026-01-01T00:00:01.000Z",
    },
  ]);
});

test("a backlog publishes at most 25000 rows in one second", () => {
  const { model, setTime } = manualModel();
  const tombstone = (account: string, id: string) => {
    model.seedObject(account, { id });
    model.deleteObject(account, id);
  };
  tombstone("owner", "zzzz");
  for (let index = 0; index < 25000; index++)
    tombstone("owner", String(index).padStart(6, "0"));
  model.createAccount({ publicKey: "aaa-other" });
  tombstone("aaa-other", "other");
  model.publishObjectEvents();
  expect(model.objectEvents("owner")).toHaveLength(25000);
  expect(
    model.objectEvents("owner").some((event) => event.key === "zzzz"),
  ).toBe(false);
  expect(model.objectEvents("aaa-other")).toEqual([]);
  model.publishObjectEvents();
  expect(model.objectEvents("owner")).toHaveLength(25000);
  setTime("2026-01-01T00:00:01.000Z");
  model.publishObjectEvents();
  expect(
    model.objectEvents("owner").find((event) => event.key === "zzzz")
      ?.updatedAt,
  ).toBe("2026-01-01T00:00:01.000Z");
  expect(model.objectEvents("aaa-other")).toEqual([
    { deleted: true, key: "other", updatedAt: "2026-01-01T00:00:01.000Z" },
  ]);
});

test("mutating a published object hides its old row until it is republished", () => {
  const { model, setTime } = manualModel();
  model.pinObject("owner", { id: "a", slabs: [] });
  expect(model.objectEvents("owner")).toEqual([]);
  model.publishObjectEvents();
  model.deleteObject("owner", "a");
  expect(model.objectEvents("owner")).toEqual([]);
  model.publishObjectEvents();
  expect(model.objectEvents("owner")).toEqual([]);
  setTime("2026-01-01T00:00:01.000Z");
  model.publishObjectEvents();
  expect(model.objectEvents("owner")).toEqual([
    { deleted: true, key: "a", updatedAt: "2026-01-01T00:00:01.000Z" },
  ]);
});
