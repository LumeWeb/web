/** Exercises payload ownership through the same Indexd model used by the HTTP adapters. */
import { describe, expect, test } from "vitest";
import { createIndexdModel } from "../../src/model/index.js";
import { createMockNetwork, createMockObject } from "../../src/sdk/index.js";

async function bytes(stream: ReadableStream<Uint8Array>): Promise<number[]> {
  return [...new Uint8Array(await new Response(stream).arrayBuffer())];
}

function fixture() {
  const network = createMockNetwork();
  const account = network.model.createAccount({ publicKey: "owner" });
  const sdk = network.createSdk({ accountId: account.id });
  return { account, network, sdk };
}

describe("payload SDK", () => {
  test("an upload becomes visible only after pinning", async () => {
    const { account, network, sdk } = fixture();
    const object = await sdk.upload(new Uint8Array([10, 20, 30]), {
      id: "video",
    });
    expect(network.model.object(account.id, "video")).toBeUndefined();
    expect(network.model.objectEvents(account.id)).toEqual([]);
    await sdk.pinObject(object);
    expect((await sdk.object("video")).size()).toBe(3);
    expect(network.model.object(account.id, "video")?.slabs).toHaveLength(1);
    expect(network.model.objectEvents(account.id)).toMatchObject([
      { deleted: false, key: "video" },
    ]);
    expect(await bytes(await sdk.download(object))).toEqual([10, 20, 30]);
  });

  test("SDK clients on one account see each other's pinned payloads", async () => {
    const { account, network, sdk } = fixture();
    network.seedObject(account.id, "video", new Uint8Array([1, 2, 3, 4]));
    const peer = network.createSdk({ accountId: account.id });
    const object = await peer.object("video");
    expect(
      await bytes(await sdk.download(object, { length: 2, offset: 1 })),
    ).toEqual([2, 3]);
  });

  test("another account cannot download an owner's object handle", async () => {
    const { account, network } = fixture();
    const object = network.seedObject(account.id, "video", new Uint8Array([1]));
    const other = network.model.createAccount({ publicKey: "other" });
    const sdk = network.createSdk({ accountId: other.id });
    await expect(sdk.object("video")).rejects.toThrow("not found");
    await expect(sdk.download(object)).rejects.toThrow("not found");
    await expect(sdk.pinObject(object)).rejects.toThrow("not found");
  });

  test("input mutation does not replace stored upload bytes", async () => {
    const { sdk } = fixture();
    const input = new Uint8Array([1, 2, 3]);
    const object = await sdk.upload(input, { id: "video" });
    input.fill(9);
    expect(await bytes(await sdk.download(object))).toEqual([1, 2, 3]);
  });

  test("mutating downloaded bytes does not change a later download", async () => {
    const { sdk } = fixture();
    const object = await sdk.upload(new Uint8Array([1, 2, 3]), { id: "video" });
    const reader = (await sdk.download(object)).getReader();
    const first = await reader.read();
    first.value!.fill(9);
    await reader.cancel();
    expect(await bytes(await sdk.download(object))).toEqual([1, 2, 3]);
  });

  test.each([
    [{ length: 20, offset: 2 }, [3, 4]],
    [{ offset: 4 }, []],
    [{ offset: 9 }, []],
    [{ length: 0 }, []],
    [{ offset: 1 }, [2, 3, 4]],
  ])("a range %j ends at the payload boundary", async (options, expected) => {
    const { sdk } = fixture();
    const object = await sdk.upload(new Uint8Array([1, 2, 3, 4]), {
      id: "video",
    });
    expect(await bytes(await sdk.download(object, options))).toEqual(expected);
  });

  test.each([
    { offset: -1 },
    { length: -1 },
    { offset: 0.5 },
    { length: Infinity },
  ])("rejects an invalid range %j", async (options) => {
    const { sdk } = fixture();
    const object = await sdk.upload(new Uint8Array([1]), { id: "video" });
    await expect(sdk.download(object, options)).rejects.toThrow(
      "nonnegative safe integer",
    );
  });

  test("a duplicate upload cannot replace bytes behind an existing handle", async () => {
    const { sdk } = fixture();
    const object = await sdk.upload(new Uint8Array([1]), { id: "video" });
    await expect(
      sdk.upload(new Uint8Array([9]), { id: "video" }),
    ).rejects.toThrow("already exists");
    expect(await bytes(await sdk.download(object))).toEqual([1]);
  });

  test("pruning removes unreferenced payloads without deleting another pinned object", async () => {
    const { account, network, sdk } = fixture();
    const deleted = network.seedObject(
      account.id,
      "deleted",
      new Uint8Array([1]),
    );
    const kept = network.seedObject(account.id, "kept", new Uint8Array([2]));
    await sdk.deleteObject("deleted");
    await expect(sdk.object("deleted")).rejects.toThrow("not found");
    expect(await bytes(await sdk.download(deleted))).toEqual([1]);
    await sdk.pruneSlabs();
    await expect(sdk.download(deleted)).rejects.toThrow("not found");
    expect(await bytes(await sdk.download(kept))).toEqual([2]);
  });

  test("pinning enforces the supplied model's quota", async () => {
    const model = createIndexdModel({ quotaBytes: 1 });
    const network = createMockNetwork({ model });
    const account = model.createAccount({ publicKey: "owner" });
    const sdk = network.createSdk({ accountId: account.id });
    const object = await sdk.upload(new Uint8Array([1, 2]), { id: "video" });
    await expect(sdk.pinObject(object)).rejects.toThrow("quota exceeded");
    expect(model.accountStats(account.id)).toEqual({
      objectCount: 0,
      pinnedSize: 0,
    });
  });

  test("resetting the model invalidates old payload handles", async () => {
    const { account, network, sdk } = fixture();
    const object = network.seedObject(account.id, "video", new Uint8Array([1]));
    network.model.reset();
    network.model.createAccount({ publicKey: "owner" });
    await expect(sdk.download(object)).rejects.toThrow("not found");
  });

  test("object handles return detached slab descriptors", () => {
    const object = createMockObject("video", 4);
    object.slabs()[0]!.length = 99;
    expect(object.id()).toBe("video");
    expect(object.size()).toBe(4);
    expect(object.slabs()).toEqual([
      {
        encryptionKey: "",
        length: 4,
        minShards: 1,
        offset: 0,
        sectors: [],
        version: 1,
      },
    ]);
  });
});
