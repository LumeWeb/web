import * as fs from "node:fs/promises";
import { readdir } from "node:fs/promises";
import { expect, it } from "vitest";
import {
  createMockNetwork,
  createMockNetworkWithPayloadOwner,
} from "../../src/sdk/index.js";
import { createNodePayloadOwner } from "../../src/testing/node-payload-store.js";

it("adopts actual file authority with synchronous model bookkeeping and physical retirement", async () => {
  const owner = await createNodePayloadOwner({
    maxLogicalUploadBytes: 64,
    maxObjectBytes: 32,
    maxRetainedBytes: 64,
    maxUploadAttempts: 3,
  });
  try {
    const network = createMockNetworkWithPayloadOwner({}, owner);
    const account = network.model.createAccount({ publicKey: "alice" });
    expect(() => network.serialize()).toThrow("serialize");
    const sdk = network.createSdk({ accountId: account.id });
    await expect(
      sdk.upload(new Uint8Array([1]), { id: "bypass" }),
    ).rejects.toThrow("admitted");
    const reservation = owner.reserveUpload(3);
    const spool = await reservation.admitSource(3);
    await spool.append(new Uint8Array([1, 2, 3]));
    const token = await spool.finish();
    reservation.release();
    let committed = false;
    const object = await sdk.uploadPayload(token, {
      id: "file",
      prepareCommit() {
        return () => {
          committed = true;
          expect(
            network.model.getSlab(
              account.id,
              `mock:${JSON.stringify([account.id, "file"])}`,
            ).size,
          ).toBe(3);
        };
      },
    });
    expect(committed).toBe(true);
    await sdk.pinObject(object);
    const stream = await sdk.download(object, { length: 1, offset: 1 });
    const reader = stream.getReader();
    expect(await reader.read()).toEqual({
      done: false,
      value: new Uint8Array([2]),
    });
    expect(await reader.read()).toEqual({ done: true, value: undefined });
    await sdk.deleteObject("file");
    expect(await readdir(owner.root)).toEqual([]);
    expect(owner.resources()).toMatchObject({
      entries: 0,
      readers: 0,
      retainedBytes: 0,
    });
  } finally {
    await owner.close();
  }
});

it("preserves the model delete effect when physical retirement fails and drains stale eviction", async () => {
  const failure = new Error("cannot unlink owned file");
  const owner = await createNodePayloadOwner(
    {
      maxLogicalUploadBytes: 64,
      maxObjectBytes: 32,
      maxRetainedBytes: 64,
      maxUploadAttempts: 3,
    },
    {
      ...fs,
      unlink() {
        return Promise.reject(failure);
      },
    },
  );
  try {
    const network = createMockNetworkWithPayloadOwner({}, owner);
    const account = network.model.createAccount({ publicKey: "alice" });
    const sdk = network.createSdk({ accountId: account.id });
    for (const id of ["deleted", "stale"]) {
      const reservation = owner.reserveUpload(1);
      const spool = await reservation.admitSource(1);
      await spool.append(new Uint8Array([9]));
      const token = await spool.finish();
      reservation.release();
      const object = await sdk.uploadPayload(token, { id });
      await sdk.pinObject(object);
    }
    await expect(sdk.deleteObject("deleted")).rejects.toMatchObject({
      errors: [failure],
    });
    expect(network.model.object(account.id, "deleted")).toBeUndefined();
    network.model.deleteObject(account.id, "stale");
    await expect(sdk.download({ id: () => "stale" })).rejects.toMatchObject({
      errors: [
        expect.any(Error),
        expect.objectContaining({ errors: [failure] }),
      ],
    });
    expect(owner.resources()).toMatchObject({ entries: 2, retainedBytes: 2 });
    await expect(owner.close()).rejects.toThrow("residue");
  } finally {
    // Failure injection leaves recorded files for explicit test cleanup.
    for (const name of await fs.readdir(owner.root))
      await fs.unlink(`${owner.root}/${name}`);
    await fs.rmdir(owner.root);
  }
});

it("retires only affected download leases and leaves a sibling payload readable", async () => {
  const owner = await createNodePayloadOwner({
    maxLogicalUploadBytes: 64,
    maxObjectBytes: 32,
    maxRetainedBytes: 64,
    maxUploadAttempts: 3,
  });
  try {
    const network = createMockNetworkWithPayloadOwner({}, owner);
    const account = network.model.createAccount({ publicKey: "alice" });
    const sdk = network.createSdk({ accountId: account.id });
    const objects = [];
    for (const id of ["first", "second"]) {
      const reservation = owner.reserveUpload(1);
      const spool = await reservation.admitSource(1);
      await spool.append(new Uint8Array([5]));
      const token = await spool.finish();
      reservation.release();
      const object = await sdk.uploadPayload(token, { id });
      await sdk.pinObject(object);
      objects.push(object);
    }
    const first = (await sdk.download(objects[0]!)).getReader();
    const second = (await sdk.download(objects[1]!)).getReader();
    const closed = first.closed.catch((error: unknown) => error);
    await sdk.deleteObject("first");
    expect(await closed).toBeInstanceOf(Error);
    await expect(first.read()).rejects.toThrow("retired");
    expect(await second.read()).toEqual({
      done: false,
      value: new Uint8Array([5]),
    });
    expect(await second.read()).toEqual({ done: true, value: undefined });
    expect(owner.resources()).toMatchObject({ entries: 1, readers: 0 });
  } finally {
    await owner.close();
  }
});

it("preserves an already opened buffered download across deletion", async () => {
  const network = createMockNetwork();
  const account = network.model.createAccount({ publicKey: "buffered" });
  const object = network.seedObject(account.id, "file", new Uint8Array([4, 5]));
  const sdk = network.createSdk({ accountId: account.id });
  const reader = (await sdk.download(object)).getReader();
  await sdk.deleteObject("file");
  expect(await reader.read()).toEqual({
    done: false,
    value: new Uint8Array([4, 5]),
  });
  expect(await reader.read()).toEqual({ done: true, value: undefined });
});
