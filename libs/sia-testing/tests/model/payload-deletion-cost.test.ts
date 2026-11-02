/** Deletion must check affected pins without walking unrelated cached uploads. */
import { expect, test, vi } from "vitest";
import { createMockNetwork, type MockNetwork } from "../../src/sdk/index.js";

test("deleting a manually seeded object tolerates unpinned slab references", async () => {
  const network = createMockNetwork();
  network.model.createAccount({ publicKey: "owner" });
  network.model.seedObject("owner", { id: "loose", slabs: ["not-pinned"] });
  await network.createSdk({ accountId: "owner" }).deleteObject("loose");
  expect(network.model.object("owner", "loose")).toBeUndefined();
});

const networks: {
  name: string;
  prepare: (network: MockNetwork) => MockNetwork;
}[] = [
  { name: "in memory", prepare: (network) => network },
  {
    name: "restored",
    prepare: (network) => createMockNetwork({ state: network.serialize() }),
  },
];

test.each(networks)(
  "$name deletion checks only the deleted objects' pins",
  async ({ prepare }) => {
    const original = createMockNetwork();
    original.model.createAccount({ publicKey: "owner" });
    const originalSdk = original.createSdk({ accountId: "owner" });
    const targets: string[] = [];
    for (let index = 0; index < 8; index++) {
      const id = `target-${index}`;
      original.seedObject("owner", id, new Uint8Array([1]));
      targets.push(id);
    }
    for (let index = 0; index < 32; index++) {
      await originalSdk.upload(new Uint8Array([2]), { id: `pending-${index}` });
    }
    const network = prepare(original);
    const sdk = network.createSdk({ accountId: "owner" });
    const targetSlabs = new Set(
      targets.flatMap((id) => network.model.object("owner", id)!.slabs!),
    );
    const identity = vi.spyOn(network.model, "slabIdentity");
    for (const id of targets) await sdk.deleteObject(id);
    expect(identity.mock.calls.every(([, slab]) => targetSlabs.has(slab))).toBe(
      true,
    );
    expect(identity.mock.calls.length).toBeLessThanOrEqual(2 * targets.length);
    identity.mockRestore();
    const pending = { id: () => "pending-0" };
    await sdk.pinObject(pending);
    const bytes = new Uint8Array(
      await new Response(await sdk.download(pending)).arrayBuffer(),
    );
    expect([...bytes]).toEqual([2]);
  },
);
