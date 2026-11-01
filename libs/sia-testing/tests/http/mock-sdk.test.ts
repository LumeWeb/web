/** Real HTTP clients share the payload model while server-side bindings fix each client's account. */
import { afterEach, expect, test, vi } from "vitest";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  createIndexdHttpServer,
  type IndexdHttpServer,
} from "../../src/http/index.js";
import { createIndexdModel } from "../../src/model/index.js";
import * as sdkAPI from "../../src/sdk/index.js";

const servers: IndexdHttpServer[] = [];
afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.close()));
});

async function fixture(maxBodyBytes?: number) {
  const network = sdkAPI.createMockNetwork({ chunkBytes: 2 });
  const owner = network.model.createAccount({ publicKey: "owner" });
  const other = network.model.createAccount({ publicKey: "other" });
  const server = createIndexdHttpServer({
    ...(maxBodyBytes === undefined ? {} : { maxBodyBytes }),
    mockClients: {
      peer: { accountId: owner.id, device: "peer" },
      reader: { accountId: other.id, device: "reader" },
      uploader: { accountId: owner.id, device: "uploader" },
    },
    mockNetwork: network,
  });
  servers.push(server);
  const { port } = await server.listen();
  const url = `http://127.0.0.1:${port}`;
  return { network, other, owner, server, url };
}

test("the HTTP adapter uses the supplied payload model", async () => {
  const { network, server } = await fixture();
  expect(server.model).toBe(network.model);
});

test("conflicting control-plane and payload models are rejected", () => {
  expect(() =>
    createIndexdHttpServer({
      mockNetwork: sdkAPI.createMockNetwork(),
      model: createIndexdModel(),
    }),
  ).toThrow("same model");
});

test("a raw HTTP upload can be pinned and read by a different client", async () => {
  const { network, owner, url } = await fixture();
  const uploaded = await fetch(`${url}/mock-sdk/uploader/upload?id=video`, {
    body: new Uint8Array([1, 2, 3, 4]),
    method: "POST",
  });
  expect(uploaded.status).toBe(200);
  expect(await uploaded.json()).toEqual({ id: "video", size: 4 });
  expect(network.model.object(owner.id, "video")).toBeUndefined();
  const pinned = await fetch(`${url}/mock-sdk/uploader/pinObject?id=video`, {
    method: "POST",
  });
  expect(pinned.status).toBe(204);
  const response = await fetch(
    `${url}/mock-sdk/peer/download?id=video&offset=1&length=2`,
  );
  expect(response.status).toBe(200);
  expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([2, 3]);
});

test("the remote adapter returns reusable object handles and real byte streams", async () => {
  const { url } = await fixture();
  const writer = sdkAPI.createRemoteMockSdk({ client: "uploader", url });
  const peer = sdkAPI.createRemoteMockSdk({ client: "peer", url });
  const object = await writer.upload(new Uint8Array([10, 20, 30]), {
    id: "video",
  });
  await writer.pinObject(object);
  const loaded = await peer.object("video");
  expect(loaded.size()).toBe(3);
  const response = new Response(
    await peer.download(loaded, { length: 1, offset: 1 }),
  );
  expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([20]);
  await writer.deleteObject("video");
  await writer.pruneSlabs();
  await expect(peer.object("video")).rejects.toThrow("not found");
});

test("a client cannot override its bound account with request parameters", async () => {
  const { network, owner, url } = await fixture();
  network.seedObject(owner.id, "video", new Uint8Array([1]));
  const response = await fetch(
    `${url}/mock-sdk/reader/download?id=video&accountId=owner&device=uploader`,
  );
  expect(response.status).toBe(400);
  await response.arrayBuffer();
  const reader = sdkAPI.createRemoteMockSdk({ client: "reader", url });
  await expect(reader.object("video")).rejects.toThrow("not found");
});

test("device faults apply to the remote adapter without faulting model inspection", async () => {
  const { network, owner, url } = await fixture();
  network.seedObject(owner.id, "video", new Uint8Array([1]));
  network.control.setOffline("peer", true);
  const peer = sdkAPI.createRemoteMockSdk({ client: "peer", url });
  await expect(peer.object("video")).rejects.toThrow("offline");
  expect(network.model.accountStats(owner.id).objectCount).toBe(1);
  network.control.setOffline("peer", false);
  expect((await peer.object("video")).size()).toBe(1);
});

test("payload routes keep the existing upload body limit", async () => {
  const { network, owner, url } = await fixture(2);
  const response = await fetch(`${url}/mock-sdk/uploader/upload?id=video`, {
    body: new Uint8Array([1, 2, 3]),
    method: "POST",
  });
  expect(response.status).toBe(413);
  await response.arrayBuffer();
  expect(network.model.listSlabs(owner.id)).toEqual([]);
});

test("a streamed download opens before its first paced chunk", async () => {
  const { network, owner, url } = await fixture();
  network.seedObject(owner.id, "video", new Uint8Array([1, 2, 3, 4]));
  network.control.setConditions({ downloadBytesPerSecond: 1 });
  const sdk = sdkAPI.createRemoteMockSdk({ client: "peer", url });
  const stream = await sdk.download(
    { id: () => "video" },
    { signal: AbortSignal.timeout(1000) },
  );
  await vi.waitFor(() =>
    expect(network.control.requests()[0]).toMatchObject({
      bytes: 0,
      status: "pending",
    }),
  );
  await stream.cancel();
  await vi.waitFor(() =>
    expect(network.control.requests()[0]?.status).toBe("cancelled"),
  );
});

test("a remote stream can cancel a download before the server sends headers", async () => {
  const { network, owner, url } = await fixture();
  network.seedObject(owner.id, "video", new Uint8Array([1]));
  const release = network.control.hold({ operation: "download" });
  const sdk = sdkAPI.createRemoteMockSdk({ client: "peer", url });
  let stream: ReadableStream<Uint8Array> | undefined;
  const opening = sdk.download({ id: () => "video" }).then((value) => {
    stream = value;
  });
  try {
    await vi.waitFor(() =>
      expect(network.control.requests()[0]?.status).toBe("pending"),
    );
    expect(stream).toBeDefined();
    await stream!.cancel();
    await vi.waitFor(() =>
      expect(network.control.requests()[0]?.status).toBe("cancelled"),
    );
  } finally {
    release();
    await opening;
    await stream?.cancel();
  }
});

test("aborting the caller errors a remote read while headers are held", async () => {
  const { network, owner, url } = await fixture();
  network.seedObject(owner.id, "video", new Uint8Array([1]));
  const release = network.control.hold({ operation: "download" });
  const abort = new AbortController();
  const sdk = sdkAPI.createRemoteMockSdk({ client: "peer", url });
  const reader = (
    await sdk.download({ id: () => "video" }, { signal: abort.signal })
  ).getReader();
  const pending = reader.read().catch((error: unknown) => error);
  try {
    await vi.waitFor(() =>
      expect(network.control.requests()[0]?.status).toBe("pending"),
    );
    abort.abort();
    expect(await pending).toMatchObject({ name: "AbortError" });
    await vi.waitFor(() =>
      expect(network.control.requests()[0]?.status).toBe("cancelled"),
    );
  } finally {
    release();
    await reader.cancel().catch(() => undefined);
  }
});

test("HTTP download failures surface through the returned stream", async () => {
  const { url } = await fixture();
  const sdk = sdkAPI.createRemoteMockSdk({ client: "peer", url });
  const reader = (await sdk.download({ id: () => "missing" })).getReader();
  await expect(reader.read()).rejects.toThrow("not found");
});

test("a remote zero-byte payload closes without inventing a chunk", async () => {
  const { network, owner, url } = await fixture();
  network.seedObject(owner.id, "empty", new Uint8Array());
  const sdk = sdkAPI.createRemoteMockSdk({ client: "peer", url });
  const reader = (await sdk.download({ id: () => "empty" })).getReader();
  expect(await reader.read()).toEqual({ done: true, value: undefined });
});

test("an already aborted remote download sends no request", async () => {
  const { network, url } = await fixture();
  const sdk = sdkAPI.createRemoteMockSdk({ client: "peer", url });
  await expect(
    sdk.download({ id: () => "video" }, { signal: AbortSignal.abort() }),
  ).rejects.toMatchObject({ name: "AbortError" });
  expect(network.control.requests()).toEqual([]);
});

test("a remote reader receives bytes before the whole paced body is available", async () => {
  const { network, owner, url } = await fixture();
  network.seedObject(owner.id, "video", new Uint8Array(100).fill(7));
  network.control.setConditions({ downloadBytesPerSecond: 10 });
  const sdk = sdkAPI.createRemoteMockSdk({ client: "peer", url });
  const stream = await sdk.download(
    { id: () => "video" },
    { signal: AbortSignal.timeout(2000) },
  );
  const reader = stream.getReader();
  try {
    const first = await reader.read();
    expect(first.done).toBe(false);
    expect(first.value!.byteLength).toBeGreaterThan(0);
    expect(first.value!.byteLength).toBeLessThan(100);
    expect([...first.value!].every((value) => value === 7)).toBe(true);
    expect(network.control.requests()[0]?.status).toBe("pending");
  } finally {
    await reader.cancel();
  }
  await vi.waitFor(() =>
    expect(network.control.requests()[0]?.status).toBe("cancelled"),
  );
});

test("cancelling a remote held call settles its server-side request", async () => {
  const { network, owner, url } = await fixture();
  network.seedObject(owner.id, "video", new Uint8Array([1]));
  const release = network.control.hold({ operation: "object" });
  try {
    const abort = new AbortController();
    const sdk = sdkAPI.createRemoteMockSdk({ client: "peer", url });
    const pending = sdk
      .object("video", { signal: abort.signal })
      .catch(() => undefined);
    await vi.waitFor(() =>
      expect(network.control.requests()[0]?.status).toBe("pending"),
    );
    abort.abort();
    await pending;
    await vi.waitFor(() =>
      expect(network.control.requests()[0]?.status).toBe("cancelled"),
    );
  } finally {
    release();
  }
});

test("closing the server aborts held operations without releasing their global hold", async () => {
  const { network, owner, server, url } = await fixture();
  network.seedObject(owner.id, "video", new Uint8Array([1]));
  const release = network.control.hold({ operation: "object" });
  try {
    const sdk = sdkAPI.createRemoteMockSdk({ client: "peer", url });
    const pending = sdk.object("video").catch((error: unknown) => error);
    await vi.waitFor(() =>
      expect(network.control.requests()[0]?.status).toBe("pending"),
    );
    await server.close();
    servers.splice(servers.indexOf(server), 1);
    expect(await pending).toBeInstanceOf(Error);
    expect(network.control.requests()[0]?.status).toBe("cancelled");
  } finally {
    release();
  }
});

test("payloads survive an uploader process exiting and are read by another process", async () => {
  const { url } = await fixture();
  const run = promisify(execFile);
  await run(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `
    const url = process.argv[1];
    const response = await fetch(url + '/mock-sdk/uploader/upload?id=video', {
      method: 'POST', body: new Uint8Array([7, 8, 9]),
    });
    if (!response.ok) throw new Error(await response.text());
    const pin = await fetch(url + '/mock-sdk/uploader/pinObject?id=video', { method: 'POST' });
    if (!pin.ok) throw new Error(await pin.text());
  `,
      url,
    ],
    { maxBuffer: 4096, timeout: 5000 },
  );
  const result = await run(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `
    const response = await fetch(process.argv[1] + '/mock-sdk/peer/download?id=video');
    if (!response.ok) throw new Error(await response.text());
    console.log(JSON.stringify([...new Uint8Array(await response.arrayBuffer())]));
  `,
      url,
    ],
    { maxBuffer: 4096, timeout: 5000 },
  );
  expect(JSON.parse(result.stdout)).toEqual([7, 8, 9]);
});

test.each([
  ["/mock-sdk/missing/object?id=video", "GET", 404],
  ["/mock-sdk/uploader/upload?id=video", "GET", 405],
  ["/mock-sdk/uploader/object", "GET", 400],
  ["/mock-sdk/uploader/download?id=video&offset=invalid", "GET", 400],
])("mock request %s with %s returns %i", async (path, method, status) => {
  const { url } = await fixture();
  const response = await fetch(url + path, { method });
  expect(response.status).toBe(status);
  await response.arrayBuffer();
});
