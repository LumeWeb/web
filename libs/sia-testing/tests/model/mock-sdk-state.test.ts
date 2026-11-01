/** Payload checkpoints survive restarts without retaining caller buffers or active fault rules. */
import { expect, test } from "vitest";
import { createIndexdModel } from "../../src/model/index.js";
import { createMockNetwork } from "../../src/sdk/index.js";

interface PayloadCheckpoint {
  payloads: { accountId: string; data: string; id: string }[];
}

async function fixture() {
  const network = createMockNetwork();
  network.model.createAccount({ publicKey: "owner" });
  network.model.createAccount({ publicKey: "other" });
  const sdk = network.createSdk({ accountId: "owner" });
  const object = await sdk.upload(new Uint8Array([1, 2, 3]), { id: "video" });
  await sdk.pinObject(object);
  return { network, object, sdk };
}

async function read(stream: ReadableStream<Uint8Array>): Promise<number[]> {
  return [...new Uint8Array(await new Response(stream).arrayBuffer())];
}

test("restored clients read the saved bytes after the original model is reset", async () => {
  const { network } = await fixture();
  const saved = network.serialize();
  network.model.reset();
  const copy = createMockNetwork({ state: saved });
  const sdk = copy.createSdk({ accountId: "owner" });
  const object = await sdk.object("video");
  expect(object.size()).toBe(3);
  expect(
    await read(await sdk.download(object, { length: 2, offset: 1 })),
  ).toEqual([2, 3]);
  expect(copy.model.objectEvents("owner")).toHaveLength(1);
  expect(copy.model.accountStats("owner")).toEqual({
    objectCount: 1,
    pinnedSize: 3,
  });
});

test("restoring a payload does not grant it to another saved account", async () => {
  const { network, object } = await fixture();
  const copy = createMockNetwork({ state: network.serialize() });
  const other = copy.createSdk({ accountId: "other" });
  await expect(other.download(object)).rejects.toThrow("not found");
});

test("an uploaded object remains unpinned across restart", async () => {
  const { network, sdk } = await fixture();
  await sdk.upload(new Uint8Array([9]), { id: "pending" });
  const copy = createMockNetwork({ state: network.serialize() });
  const restored = copy.createSdk({ accountId: "owner" });
  await expect(restored.object("pending")).rejects.toThrow("not found");
  await restored.pinObject({ id: () => "pending" });
  expect(
    await read(await restored.download(await restored.object("pending"))),
  ).toEqual([9]);
});

test("deleted bytes survive until the restored account prunes them", async () => {
  const { network, object, sdk } = await fixture();
  await sdk.deleteObject("video");
  const copy = createMockNetwork({ state: network.serialize() });
  const restored = copy.createSdk({ accountId: "owner" });
  await expect(restored.object("video")).rejects.toThrow("not found");
  expect(await read(await restored.download(object))).toEqual([1, 2, 3]);
  await restored.pruneSlabs();
  const next = createMockNetwork({ state: copy.serialize() });
  await expect(
    next.createSdk({ accountId: "owner" }).download(object),
  ).rejects.toThrow("not found");
});

test("a restored network owns its payloads independently", async () => {
  const { network, object, sdk } = await fixture();
  const copy = createMockNetwork({ state: network.serialize() });
  await sdk.deleteObject("video");
  await sdk.pruneSlabs();
  const restored = copy.createSdk({ accountId: "owner" });
  const first = (await restored.download(object)).getReader();
  (await first.read()).value!.fill(0);
  await first.cancel();
  expect(await read(await restored.download(object))).toEqual([1, 2, 3]);
});

test("device outages and request history are not restored as stored data", async () => {
  const { network, sdk } = await fixture();
  network.control.setOffline("default", true);
  await expect(sdk.object("video")).rejects.toThrow("offline");
  const copy = createMockNetwork({ state: network.serialize() });
  expect(copy.control.requests()).toEqual([]);
  expect(
    (await copy.createSdk({ accountId: "owner" }).object("video")).size(),
  ).toBe(3);
});

test("stale payloads removed through the model do not enter a checkpoint", async () => {
  const { network } = await fixture();
  network.model.deleteObject("owner", "video");
  network.model.pruneSlabs("owner");
  const copy = createMockNetwork({ state: network.serialize() });
  await expect(
    copy.createSdk({ accountId: "owner" }).download({ id: () => "video" }),
  ).rejects.toThrow("not found");
});

test("a checkpoint does not include an upload that is still held", async () => {
  const { network, sdk } = await fixture();
  const release = network.control.hold({ operation: "upload" });
  const pending = sdk.upload(new Uint8Array([9]), { id: "later" });
  const saved = network.serialize();
  release();
  await sdk.pinObject(await pending);
  const copy = createMockNetwork({ state: saved });
  await expect(
    copy.createSdk({ accountId: "owner" }).object("later"),
  ).rejects.toThrow("not found");
});

test("snapshots support payloads larger than a function argument list", async () => {
  const { network } = await fixture();
  const input = new Uint8Array(256 * 1024).fill(37);
  input[0] = 11;
  input[input.length - 1] = 99;
  network.seedObject("owner", "large", input);
  const copy = createMockNetwork({ state: network.serialize() });
  const sdk = copy.createSdk({ accountId: "owner" });
  const output = await new Response(
    await sdk.download(await sdk.object("large")),
  ).arrayBuffer();
  expect(new Uint8Array(output)).toEqual(input);
});

test("restoring cannot replace a caller-owned model", async () => {
  const { network } = await fixture();
  const model = createIndexdModel();
  expect(() =>
    createMockNetwork({ model, state: network.serialize() }),
  ).toThrow("model");
  expect(model.snapshot().accounts).toEqual([]);
});

test.each([
  "invalid",
  "{}",
  '{"version":99}',
  '{"version":1,"model":"{}","payloads":[]}',
])("invalid network state %s is rejected", (state) => {
  expect(() => createMockNetwork({ state })).toThrow("snapshot");
});

test.each<[name: string, mutate: (state: PayloadCheckpoint) => void]>([
  [
    "wrong account",
    (state) => {
      state.payloads[0]!.accountId = "other";
    },
  ],
  [
    "wrong size",
    (state) => {
      state.payloads[0]!.data = "AA==";
    },
  ],
  [
    "duplicate",
    (state) => {
      state.payloads.push(state.payloads[0]!);
    },
  ],
  [
    "invalid bytes",
    (state) => {
      state.payloads[0]!.data = "not base64!";
    },
  ],
])("restoring a payload with %s is rejected", async (_name, mutate) => {
  const { network } = await fixture();
  const state = JSON.parse(network.serialize()) as PayloadCheckpoint;
  mutate(state);
  expect(() => createMockNetwork({ state: JSON.stringify(state) })).toThrow(
    "snapshot",
  );
});
