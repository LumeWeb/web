import { describe, expect, it } from "vitest";
import { createIndexdModel } from "../../src/model/index.js";

describe("Indexd model object pinning", () => {
  it("requires the destination account to pin a slab before it pins an object", () => {
    const model = createIndexdModel();
    const source = model.createAccount({ publicKey: "source" });
    const destination = model.createAccount({ publicKey: "destination" });
    model.pinSlab(source.id, { id: "slab", size: 3 });

    expect(() => model.pinObject(destination.id, { encryptedMetadata: "YQ==", id: "object", slabs: ["slab"] })).toThrow("unpinned slab slab");
  });

  it("counts decoded metadata bytes at the 1024-byte boundary", () => {
    const model = createIndexdModel();
    const account = model.createAccount({ publicKey: "account" });
    model.pinSlab(account.id, { id: "slab", size: 3 });

    model.pinObject(account.id, { encryptedMetadata: Buffer.alloc(1024).toString("base64"), id: "fits", slabs: ["slab"] });

    expect(() => model.pinObject(account.id, { encryptedMetadata: Buffer.alloc(1025).toString("base64"), id: "too-large", slabs: ["slab"] })).toThrow("metadata size limit");
  });

  it("preserves signed sealed fields when metadata is repinned", () => {
    const model = createIndexdModel();
    const account = model.createAccount({ publicKey: "account" });
    model.pinSlab(account.id, { id: "slab", size: 1 });
    model.pinObject(account.id, { dataSignature: "data-signature", encryptedDataKey: "data-key", encryptedMetadata: "old", encryptedMetadataKey: "metadata-key", id: "object", metadataSignature: "metadata-signature", slabs: ["slab"] });
    model.pinObject(account.id, { encryptedMetadata: "new", id: "object", slabs: ["slab"] });

    expect(model.object(account.id, "object")).toMatchObject({ dataSignature: "data-signature", encryptedDataKey: "data-key", encryptedMetadata: "new", encryptedMetadataKey: "metadata-key", metadataSignature: "metadata-signature" });
  });

  it("isolates signed sealed fields between accounts", () => {
    const model = createIndexdModel();
    const first = model.createAccount({ publicKey: "first" });
    const second = model.createAccount({ publicKey: "second" });
    model.pinSlab(first.id, { id: "slab", size: 1 });
    model.pinSlab(second.id, { id: "slab", size: 1 });
    model.pinObject(first.id, { dataSignature: "first-signature", encryptedDataKey: "first-key", id: "object", slabs: ["slab"] });
    model.pinObject(second.id, { dataSignature: "second-signature", encryptedDataKey: "second-key", id: "object", slabs: ["slab"] });

    expect(model.object(first.id, "object")).toMatchObject({ dataSignature: "first-signature", encryptedDataKey: "first-key" });
    expect(model.object(second.id, "object")).toMatchObject({ dataSignature: "second-signature", encryptedDataKey: "second-key" });
  });

  it("upserts destination metadata without modifying the source record", () => {
    const model = createIndexdModel();
    const source = model.createAccount({ publicKey: "source" });
    const destination = model.createAccount({ publicKey: "destination" });
    model.pinSlab(source.id, { id: "slab", size: 3 });
    model.pinSlab(destination.id, { id: "slab", size: 3 });
    model.pinObject(source.id, { encryptedMetadata: "YQ==", id: "object", slabs: ["slab"] });
    model.pinObject(destination.id, { encryptedMetadata: "Yg==", id: "object", slabs: ["slab"] });

    expect(model.object(source.id, "object")?.encryptedMetadata).toBe("YQ==");
    expect(model.object(destination.id, "object")?.encryptedMetadata).toBe("Yg==");
  });
});

it('keeps seed slab arrays private', () => {
  const model = createIndexdModel(); model.createAccount({ publicKey: 'a' });
  const slabs = ['owned'];
  model.seedObject('a', { id: 'seed', slabs });
  slabs.push('not-pinned');
  expect(model.object('a', 'seed')?.slabs).toEqual(['owned']);
});

it.each(['object', 'event'] as const)('keeps %s read slab arrays separate from storage and other reads', source => {
  const model = createIndexdModel(); model.createAccount({ publicKey: 'a' });
  model.pinSlab('a', { id: 'owned', size: 1 });
  const slabs = ['owned'];
  model.pinObject('a', { id: 'o', slabs });
  slabs.push('input-change');
  const object = model.object('a', 'o')!;
  const event = model.objectEvents('a')[0]!.object!;
  (source === 'object' ? object : event).slabs!.push('not-pinned');
  expect((source === 'object' ? event : object).slabs).toEqual(['owned']);
  expect(model.object('a', 'o')?.slabs).toEqual(['owned']);
  expect(model.objectEvents('a')[0]!.object?.slabs).toEqual(['owned']);
});

it('rejects conflicting shared slab sizes without changing either account', () => {
  const model = createIndexdModel({ quotaBytes: 10 });
  model.createAccount({ publicKey: 'a' }); model.createAccount({ publicKey: 'b' });
  model.pinSlab('a', { id: 'shared', size: 10 });
  model.pinObject('a', { id: 'first', slabs: ['shared'] });
  model.pinSlab('b', { id: 'prior', size: 1 });
  expect(() => model.pinSlab('b', { id: 'shared', size: 0 })).toThrow('conflicting slab');
  expect(model.listSlabs('b')).toEqual([{ id: 'prior', size: 1 }]);
  expect(model.accountStats('a')).toEqual({ objectCount: 1, pinnedSize: 10 });
  model.pinSlab('a', { id: 'extra', size: 10 });
  expect(() => model.pinObject('a', { id: 'second', slabs: ['extra'] })).toThrow('quota');
  expect(() => model.pinSlab('a', { id: 'shared', size: 0 })).toThrow('conflicting slab');
  model.pinSlab('a', { id: 'shared', size: 10 });
  model.pinSlab('b', { id: 'shared', size: 10 });
  model.pinObject('b', { id: 'shared-object', slabs: ['shared'] });
  expect(model.accountStats('b')).toEqual({ objectCount: 1, pinnedSize: 10 });
});
