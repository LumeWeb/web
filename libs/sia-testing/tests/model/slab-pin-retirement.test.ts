/** Pin retirement queues let caches collect external mutations without polling live uploads. */
import { expect, test } from "vitest";
import { createIndexdModel, type IndexdModel } from "../../src/model/index.js";

const removals: { name: string; retire: (model: IndexdModel) => void }[] = [
  { name: "unpin", retire: (model) => model.unpinSlab("owner", "slab") },
  {
    name: "prune",
    retire: (model) => {
      model.pruneSlabs("owner");
    },
  },
  {
    name: "object deletion",
    retire: (model) => {
      model.pinObject("owner", { id: "object", slabs: ["slab"] });
      model.deleteObject("owner", "object");
    },
  },
  { name: "reset", retire: (model) => model.reset() },
];

test.each(removals)("$name queues a watched pin once", ({ retire }) => {
  const model = createIndexdModel();
  model.createAccount({ publicKey: "owner" });
  model.pinSlab("owner", { id: "slab", size: 1 });
  const identity = model.slabIdentity("owner", "slab");
  const tracker = model.trackSlabPins("owner");
  tracker.watch(identity);
  retire(model);
  expect(tracker.takeRetired()).toEqual([identity]);
  expect(tracker.takeRetired()).toEqual([]);
});

test("retirement queues contain only their watched account pins", () => {
  const model = createIndexdModel();
  for (const account of ["owner", "other"]) {
    model.createAccount({ publicKey: account });
    model.pinSlab(account, { id: "slab", size: 1 });
  }
  model.pinSlab("owner", { id: "untracked", size: 1 });
  const identity = model.slabIdentity("owner", "slab");
  const tracker = model.trackSlabPins("owner");
  tracker.watch(identity);
  model.unpinSlab("owner", "untracked");
  model.unpinSlab("other", "slab");
  expect(tracker.takeRetired()).toEqual([]);
  model.unpinSlab("owner", "slab");
  expect(tracker.takeRetired()).toEqual([identity]);
});

test("forgotten pin identities do not enter retirement results", () => {
  const model = createIndexdModel();
  model.createAccount({ publicKey: "owner" });
  model.pinSlab("owner", { id: "slab", size: 1 });
  const tracker = model.trackSlabPins("owner");
  const identity = model.slabIdentity("owner", "slab");
  tracker.watch(identity);
  model.unpinSlab("owner", "slab");
  tracker.forget(identity);
  expect(tracker.takeRetired()).toEqual([]);
  model.pinSlab("owner", { id: "slab", size: 1 });
  const replacement = model.slabIdentity("owner", "slab");
  tracker.watch(replacement);
  tracker.forget(replacement);
  model.unpinSlab("owner", "slab");
  expect(tracker.takeRetired()).toEqual([]);
});

test("independent caches receive the same retired pin", () => {
  const model = createIndexdModel();
  model.createAccount({ publicKey: "owner" });
  model.pinSlab("owner", { id: "slab", size: 1 });
  const identity = model.slabIdentity("owner", "slab");
  const first = model.trackSlabPins("owner");
  const second = model.trackSlabPins("owner");
  first.watch(identity);
  second.watch(identity);
  model.unpinSlab("owner", "slab");
  expect(first.takeRetired()).toEqual([identity]);
  expect(second.takeRetired()).toEqual([identity]);
});
