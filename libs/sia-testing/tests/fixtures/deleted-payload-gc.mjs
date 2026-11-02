/** Pin identities reveal retained payload records without exposing the SDK's private byte store. */
import { setImmediate } from "node:timers/promises";

const { createMockNetwork } =
  /** @type {typeof import("../../src/sdk/index.js")} */ (
    await import(process.argv[2])
  );

/**
 * Detects payload records that outlive their retired slab pins.
 * @param {(network: import("../../src/sdk/index.js").MockNetwork, sdk: import("../../src/sdk/index.js").MockSdk, id: string) => Promise<void>} remove
 */
async function check(remove) {
  const network = createMockNetwork();
  network.model.createAccount({ publicKey: "owner" });
  const sdk = network.createSdk({ accountId: "owner" });
  const references = [];
  for (let index = 0; index < 64; index++) {
    const id = `video-${index}`;
    network.seedObject("owner", id, new Uint8Array([1]));
    const slab = network.model.object("owner", id)?.slabs?.[0];
    if (!slab) throw new Error("The fixture needs a pinned object slab");
    references.push(new WeakRef(network.model.slabIdentity("owner", slab)));
    await remove(network, sdk, id);
  }
  // WeakRef targets stay alive until their current job ends.
  for (let index = 0; index < 10; index++) {
    await setImmediate();
    global.gc();
  }
  const retained = references.filter(
    (reference) => reference.deref() !== undefined,
  ).length;
  network.serialize();
  return retained;
}

const sdkDeletion = await check((_network, sdk, id) => sdk.deleteObject(id));
const externalDeletionPruned = await check(async (network, sdk, id) => {
  network.model.deleteObject("owner", id);
  await sdk.pruneSlabs();
});
console.log(JSON.stringify({ externalDeletionPruned, sdkDeletion }));
