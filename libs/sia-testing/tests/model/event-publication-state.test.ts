/** Checkpoints preserve unpublished rows and the cursor watermark independently of the restored clock. */
import { expect, test } from "vitest";
import { createIndexdModel } from "../../src/model/index.js";
import { createMockNetwork } from "../../src/sdk/index.js";
import type { ModelState } from "../../src/model/state.js";

const invalidStates: { mutate: (state: ModelState) => void; name: string; }[] = [
  {
    mutate: (state) => {
      delete state.publication;
    },
    name: "missing publication state",
  },
  {
    mutate: (state) => {
      state.version = 1;
    },
    name: "manual rows under version one",
  },
  {
    mutate: (state) => {
      delete state.publication!.lastPublishedAt;
    },
    name: "missing watermark for visible events",
  },
  {
    mutate: (state) => {
      state.publication!.lastPublishedAt = "2026-01-01T00:00:00.001Z";
    },
    name: "fractional watermark",
  },
  {
    mutate: (state) => {
      state.accounts[0]!.events[0]!.updatedAt = "2026-01-01T00:00:01.000Z";
    },
    name: "published row newer than watermark",
  },
  {
    mutate: (state) => {
      state.publication!.lastPublishedAt = "2026-01-01T00:00:01.000Z";
      state.accounts[0]!.events[0]!.updatedAt = "2026-01-01T00:00:00.500Z";
    },
    name: "fractional event position",
  },
  {
    mutate: (state) => {
      state.accounts[0]!.events.push(state.accounts[0]!.events[0]!);
    },
    name: "duplicate visible object",
  },
  {
    mutate: (state) => {
      state.publication!.pending.push(state.publication!.pending[0]!);
    },
    name: "duplicate pending object",
  },
  {
    mutate: (state) => {
      state.publication!.pending[0]!.accountId = "unknown";
    },
    name: "pending event for an unknown account",
  },
  {
    mutate: (state) => {
      state.publication!.pending.push({
        accountId: "owner",
        event: state.accounts[0]!.events[0]!,
      });
    },
    name: "visible object also pending",
  },
  {
    mutate: (state) => {
      state.publication!.pending[0]!.event.deleted = false;
    },
    name: "pending live row without an object",
  },
  {
    mutate: (state) => {
      delete state.accounts[0]!.events[0]!.object;
    },
    name: "visible live row without an object",
  },
];

test.each(invalidStates)("rejects a checkpoint with $name", ({ mutate }) => {
  const model = createIndexdModel({
    eventPublication: "manual",
    now: () => new Date("2026-01-01T00:00:00.450Z"),
  });
  model.createAccount({ publicKey: "owner" });
  model.pinObject("owner", { id: "a", slabs: [] });
  model.pinObject("owner", { id: "z", slabs: [] });
  model.publishObjectEvents();
  model.deleteObject("owner", "a");
  const state = JSON.parse(model.serialize()) as ModelState;
  mutate(state);
  expect(() => createIndexdModel({ state: JSON.stringify(state) })).toThrow(
    "snapshot",
  );
});

test("restart keeps visible rows while pending changes wait past the saved publication second", () => {
  let now = new Date("2026-01-01T00:00:00.450Z");
  const model = createIndexdModel({
    eventPublication: "manual",
    now: () => now,
  });
  model.createAccount({ publicKey: "owner" });
  model.pinObject("owner", { id: "a", slabs: [] });
  model.pinObject("owner", { id: "z", slabs: [] });
  model.publishObjectEvents();
  model.deleteObject("owner", "a");
  model.pinObject("owner", { id: "b", slabs: [] });
  const copy = createIndexdModel({ now: () => now, state: model.serialize() });
  expect(copy.objectEvents("owner").map((event) => event.key)).toEqual(["z"]);
  copy.publishObjectEvents();
  expect(copy.objectEvents("owner").map((event) => event.key)).toEqual(["z"]);
  now = new Date("2026-01-01T00:00:01.450Z");
  copy.publishObjectEvents();
  expect(copy.objectEvents("owner").find((event) => event.key === "a")).toEqual(
    { deleted: true, key: "a", updatedAt: "2026-01-01T00:00:01.000Z" },
  );
  expect(
    copy.objectEvents("owner").find((event) => event.key === "b")?.updatedAt,
  ).toBe("2026-01-01T00:00:01.000Z");
});

test("restoring a snapshot cannot replace its publication mode", () => {
  const model = createIndexdModel({ eventPublication: "manual" });
  expect(() =>
    createIndexdModel({
      eventPublication: "immediate",
      state: model.serialize(),
    }),
  ).toThrow("snapshot");
});

test("a payload checkpoint keeps pending event publication separate from readable bytes", async () => {
  const model = createIndexdModel({
    eventPublication: "manual",
    now: () => new Date("2026-01-01T00:00:00.500Z"),
  });
  model.createAccount({ publicKey: "owner" });
  const network = createMockNetwork({ model });
  network.seedObject("owner", "a", new Uint8Array([1, 2, 3]));
  const copy = createMockNetwork({
    now: () => new Date("2026-01-01T00:00:00.500Z"),
    state: network.serialize(),
  });
  expect(copy.model.objectEvents("owner")).toEqual([]);
  copy.model.publishObjectEvents();
  expect(copy.model.objectEvents("owner").map((event) => event.key)).toEqual([
    "a",
  ]);
  const sdk = copy.createSdk({ accountId: "owner" });
  const bytes = new Uint8Array(
    await new Response(await sdk.download(await sdk.object("a"))).arrayBuffer(),
  );
  expect([...bytes]).toEqual([1, 2, 3]);
});
