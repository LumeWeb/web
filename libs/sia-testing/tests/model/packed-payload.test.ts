/** A peer can repin deleted payload bytes only while a sibling keeps their slab pinned. */
import { expect, test } from "vitest";
import { createMockNetwork } from "../../src/sdk/index.js";

test("a deleted packed payload can be restored after restart while its sibling remains", async () => {
  const network = createMockNetwork();
  network.model.createAccount({ publicKey: "owner" });
  const object = network.seedObject("owner", "a", new Uint8Array([1, 2, 3]));
  const slabs = network.model.object("owner", "a")!.slabs!;
  network.model.pinObject("owner", { id: "b", slabs });
  const sdk = network.createSdk({ accountId: "owner" });
  await sdk.deleteObject("a");
  const restored = createMockNetwork({ state: network.serialize() });
  const peer = restored.createSdk({ accountId: "owner" });
  await expect(peer.object("a")).rejects.toThrow("not found");
  await peer.pinObject(object);
  const bytes = new Uint8Array(
    await new Response(await peer.download(object)).arrayBuffer(),
  );
  expect([...bytes]).toEqual([1, 2, 3]);
  await peer.deleteObject("b");
  await peer.deleteObject("a");
  await expect(peer.pinObject(object)).rejects.toThrow("not found");
});
