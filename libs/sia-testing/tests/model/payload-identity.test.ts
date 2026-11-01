/** Removing and recreating a slab pin must not authorize bytes cached under its earlier identity. */
import { expect, test } from "vitest";
import type { IndexdModel } from "../../src/model/index.js";
import { createMockNetwork } from "../../src/sdk/index.js";

const removals: [string, (model: IndexdModel, slabId: string) => void][] = [
  [
    "reset",
    (model) => {
      model.reset();
      model.createAccount({ publicKey: "owner" });
    },
  ],
  [
    "external prune",
    (model) => {
      model.deleteObject("owner", "video");
      model.pruneSlabs("owner");
    },
  ],
  [
    "external unpin",
    (model, slabId) => {
      model.deleteObject("owner", "video");
      model.unpinSlab("owner", slabId);
    },
  ],
  [
    "external prune with another account retaining the slab",
    (model, slabId) => {
      model.createAccount({ publicKey: "other" });
      model.pinSlab("other", { id: slabId, size: 3 });
      model.deleteObject("owner", "video");
      model.pruneSlabs("owner");
    },
  ],
];

function fixture() {
  const network = createMockNetwork();
  network.model.createAccount({ publicKey: "owner" });
  const object = network.seedObject(
    "owner",
    "video",
    new Uint8Array([1, 2, 3]),
  );
  const sdk = network.createSdk({ accountId: "owner" });
  const slabId = network.model.listSlabs("owner")[0]!.id;
  return { network, object, sdk, slabId };
}

test.each(removals)(
  "%s followed by slab ID reuse cannot revive cached bytes",
  async (_name, remove) => {
    const { network, object, sdk, slabId } = fixture();
    remove(network.model, slabId);
    network.model.pinSlab("owner", { id: slabId, size: 3 });
    await expect(sdk.download(object)).rejects.toThrow("not found");
    await expect(sdk.pinObject(object)).rejects.toThrow("not found");
  },
);

test.each(removals)(
  "%s followed by slab ID reuse cannot copy stale bytes into a checkpoint",
  async (_name, remove) => {
    const { network, object, slabId } = fixture();
    remove(network.model, slabId);
    network.model.pinSlab("owner", { id: slabId, size: 3 });
    const restored = createMockNetwork({ state: network.serialize() });
    await expect(
      restored.createSdk({ accountId: "owner" }).download(object),
    ).rejects.toThrow("not found");
  },
);

test.each(removals)(
  "a fresh upload can replace an invalidated cache after %s",
  async (_name, remove) => {
    const { network, sdk, slabId } = fixture();
    remove(network.model, slabId);
    network.model.pinSlab("owner", { id: slabId, size: 3 });
    const object = await sdk.upload(new Uint8Array([7, 8, 9]), { id: "video" });
    await sdk.pinObject(object);
    const response = new Response(await sdk.download(object));
    expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([
      7, 8, 9,
    ]);
  },
);

test("repeating an existing slab pin keeps its payload readable", async () => {
  const { network, object, sdk, slabId } = fixture();
  network.model.pinSlab("owner", { id: slabId, size: 3 });
  const response = new Response(await sdk.download(object));
  expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([1, 2, 3]);
});
