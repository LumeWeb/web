/** Fault controls exercise app retries without changing the Indexd model's ownership rules. */
import { afterEach, expect, test, vi } from "vitest";
import { createMockNetwork } from "../../src/sdk/index.js";

function fixture() {
  const network = createMockNetwork();
  const account = network.model.createAccount({ publicKey: "owner" });
  const first = network.createSdk({ accountId: account.id, device: "first" });
  const second = network.createSdk({ accountId: account.id, device: "second" });
  const object = network.seedObject(
    account.id,
    "video",
    new Uint8Array([1, 2, 3]),
  );
  return { account, first, network, object, second };
}

afterEach(() => vi.useRealTimers());

test("an offline device fails without affecting another device", async () => {
  const { first, network, object, second } = fixture();
  network.control.setOffline("first", true);
  await expect(first.download(object)).rejects.toThrow("offline");
  expect((await second.object("video")).size()).toBe(3);
  network.control.setOffline("first", false);
  expect((await first.object("video")).size()).toBe(3);
});

test("a finite device fault is consumed only by its matching operation", async () => {
  const { first, network, second } = fixture();
  network.control.addFault({
    device: "first",
    message: "try again",
    operation: "object",
    times: 2,
  });
  expect((await second.object("video")).size()).toBe(3);
  await expect(first.object("video")).rejects.toThrow("try again");
  await expect(first.object("video")).rejects.toThrow("try again");
  expect((await first.object("video")).size()).toBe(3);
});

test("a held call stays pending until its own hold is released", async () => {
  const { first, network, second } = fixture();
  const release = network.control.hold({
    device: "first",
    operation: "object",
  });
  let finished = false;
  const pending = first.object("video").then((value) => {
    finished = true;
    return value;
  });
  expect((await second.object("video")).size()).toBe(3);
  expect(finished).toBe(false);
  expect(network.control.requests()).toMatchObject([
    { device: "first", operation: "object", status: "pending" },
    { device: "second", operation: "object", status: "completed" },
  ]);
  release();
  release();
  expect((await pending).size()).toBe(3);
});

test("overlapping holds must both be released", async () => {
  const { first, network } = fixture();
  const releaseFirst = network.control.hold({ operation: "object" });
  const releaseSecond = network.control.hold({ operation: "object" });
  let finished = false;
  const pending = first.object("video").then(() => {
    finished = true;
  });
  releaseFirst();
  await Promise.resolve();
  await Promise.resolve();
  expect(finished).toBe(false);
  releaseSecond();
  await pending;
  expect(finished).toBe(true);
});

test("latency delays completion without delaying control inspection", async () => {
  vi.useFakeTimers();
  const { first, network } = fixture();
  network.control.setConditions({ latencyMs: 100 });
  let finished = false;
  const pending = first.object("video").then(() => {
    finished = true;
  });
  await vi.advanceTimersByTimeAsync(99);
  expect(finished).toBe(false);
  expect(network.control.requests()[0]?.status).toBe("pending");
  await vi.advanceTimersByTimeAsync(1);
  await pending;
  expect(finished).toBe(true);
});

test("a device taken offline during latency cannot complete its operation", async () => {
  vi.useFakeTimers();
  const { first, network } = fixture();
  network.control.setConditions({ latencyMs: 100 });
  const rejected = expect(first.object("video")).rejects.toThrow("offline");
  await vi.advanceTimersByTimeAsync(50);
  network.control.setOffline("first", true);
  await vi.advanceTimersByTimeAsync(50);
  await rejected;
});

test("cancelling a download records only bytes the reader received", async () => {
  const { first, network, object } = fixture();
  const stream = await first.download(object);
  expect(network.control.requests()[0]).toMatchObject({
    bytes: 0,
    status: "pending",
  });
  await stream.cancel();
  expect(network.control.requests()[0]).toMatchObject({
    bytes: 0,
    status: "cancelled",
  });
});

test("download completion records the delivered byte count", async () => {
  const { first, network, object } = fixture();
  const reader = (await first.download(object, { offset: 1 })).getReader();
  expect(await reader.read()).toMatchObject({ value: new Uint8Array([2, 3]) });
  expect(network.control.requests()[0]).toMatchObject({
    bytes: 2,
    status: "completed",
  });
});

test("request inspection returns detached records", async () => {
  const { first, network } = fixture();
  await first.object("video");
  network.control.requests()[0]!.status = "failed";
  expect(network.control.requests()[0]!.status).toBe("completed");
});

test("request history retains only its configured capacity", async () => {
  const network = createMockNetwork({ requestLimit: 2 });
  const account = network.model.createAccount({ publicKey: "owner" });
  network.seedObject(account.id, "video", new Uint8Array([1]));
  const sdk = network.createSdk({ accountId: account.id });
  await sdk.object("video");
  await sdk.object("video");
  await sdk.object("video");
  expect(network.control.requests().map((request) => request.sequence)).toEqual(
    [2, 3],
  );
});

test("a held upload owns its input before the caller can mutate it", async () => {
  const { first, network } = fixture();
  const release = network.control.hold({ operation: "upload" });
  const input = new Uint8Array([8, 9]);
  const pending = first.upload(input, { id: "new" });
  input.fill(0);
  release();
  const object = await pending;
  const response = new Response(await first.download(object));
  expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([8, 9]);
});

test("a held download retains the range supplied at call time", async () => {
  const { first, network, object } = fixture();
  const release = network.control.hold({ operation: "download" });
  const range = { length: 1, offset: 0 };
  const pending = first.download(object, range);
  range.offset = 2;
  release();
  const response = new Response(await pending);
  expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([1]);
});

test("a failed upload never appears in model state", async () => {
  const { account, first, network } = fixture();
  network.control.addFault({ operation: "upload" });
  await expect(
    first.upload(new Uint8Array([9]), { id: "failed" }),
  ).rejects.toThrow("injected");
  expect(network.model.object(account.id, "failed")).toBeUndefined();
  expect(network.model.listSlabs(account.id)).toHaveLength(1);
  expect(network.control.requests()[0]).toMatchObject({
    operation: "upload",
    status: "failed",
  });
});
