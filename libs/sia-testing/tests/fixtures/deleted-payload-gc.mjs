/** Pin identities reveal retained payload records without exposing the SDK's private byte store. */
import { setImmediate } from "node:timers/promises";

const { createMockNetwork } =
  /** @type {typeof import("../../src/sdk/index.js")} */ (
    await import(process.argv[2])
  );

/**
 * Detects payload records that outlive their retired slab pins.
 * @param {(network: import("../../src/sdk/index.js").MockNetwork, sdk: import("../../src/sdk/index.js").MockSdk, id: string) => Promise<void>} remove
 * @param {(network: import("../../src/sdk/index.js").MockNetwork) => import("../../src/sdk/index.js").MockNetwork} [prepare]
 */
async function check(remove, prepare = (network) => network) {
  const original = createMockNetwork();
  original.model.createAccount({ publicKey: "owner" });
  for (let index = 0; index < 64; index++)
    original.seedObject("owner", `video-${index}`, new Uint8Array([1]));
  const network = prepare(original);
  const sdk = network.createSdk({ accountId: "owner" });
  const references = [];
  for (let index = 0; index < 64; index++) {
    const id = `video-${index}`;
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
/** @type {Parameters<typeof check>[0]} */
const deleteLastSibling = async (network, sdk, id) => {
  const slabs = network.model.object("owner", id)?.slabs;
  if (!slabs) throw new Error("The fixture needs a pinned object slab");
  const sibling = `${id}-sibling`;
  network.model.pinObject("owner", { id: sibling, slabs });
  await sdk.deleteObject(id);
  await sdk.deleteObject(sibling);
};
const lastSiblingDeleted = await check(deleteLastSibling);
const restoredLastSiblingDeleted = await check(deleteLastSibling, (network) =>
  createMockNetwork({ state: network.serialize() }),
);
const invalidatedRead = await check(async (network, sdk, id) => {
  network.model.deleteObject("owner", id);
  await sdk.download({ id: () => id }).catch(() => undefined);
});
const replacement = await check(async (network, sdk, id) => {
  network.model.deleteObject("owner", id);
  await sdk.upload(new Uint8Array([2]), { id });
});
console.log(
  JSON.stringify({
    externalDeletionPruned,
    invalidatedRead,
    lastSiblingDeleted,
    replacement,
    restoredLastSiblingDeleted,
    sdkDeletion,
  }),
);
