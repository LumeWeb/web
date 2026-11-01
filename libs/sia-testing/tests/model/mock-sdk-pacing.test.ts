/** Shared transfer rates make concurrent app downloads compete for one simulated link. */
import { afterEach, expect, test, vi } from "vitest";
import { createMockNetwork } from "../../src/sdk/index.js";

function fixture() {
  const network = createMockNetwork({ chunkBytes: 2 });
  const account = network.model.createAccount({ publicKey: "owner" });
  const sdk = network.createSdk({ accountId: account.id, device: "reader" });
  const object = network.seedObject(
    account.id,
    "video",
    new Uint8Array([1, 2, 3, 4]),
  );
  return { account, network, object, sdk };
}

afterEach(() => vi.useRealTimers());

test("download pacing delivers each requested chunk after its transfer time", async () => {
  vi.useFakeTimers();
  const { network, object, sdk } = fixture();
  network.control.setConditions({ downloadBytesPerSecond: 2 });
  const reader = (await sdk.download(object)).getReader();
  let delivered = false;
  const first = reader.read().then((value) => {
    delivered = true;
    return value;
  });
  await vi.advanceTimersByTimeAsync(999);
  expect(delivered).toBe(false);
  await vi.advanceTimersByTimeAsync(1);
  expect(await first).toMatchObject({ value: new Uint8Array([1, 2]) });
  const second = reader.read();
  await vi.advanceTimersByTimeAsync(1000);
  expect(await second).toMatchObject({ value: new Uint8Array([3, 4]) });
  expect(network.control.requests()[0]).toMatchObject({
    bytes: 4,
    status: "completed",
  });
});

test("simultaneous downloads share bandwidth instead of each receiving the full rate", async () => {
  vi.useFakeTimers();
  const { network, object, sdk } = fixture();
  network.control.setConditions({ downloadBytesPerSecond: 2 });
  const firstReader = (await sdk.download(object)).getReader();
  const secondReader = (await sdk.download(object)).getReader();
  const first = firstReader.read();
  let secondDone = false;
  const second = secondReader.read().then((value) => {
    secondDone = true;
    return value;
  });
  await vi.advanceTimersByTimeAsync(1000);
  expect(await first).toMatchObject({ value: new Uint8Array([1, 2]) });
  expect(secondDone).toBe(false);
  await vi.advanceTimersByTimeAsync(1000);
  expect(await second).toMatchObject({ value: new Uint8Array([1, 2]) });
  await firstReader.cancel();
  await secondReader.cancel();
});

test("cancelling an in-flight chunk frees the link for another reader", async () => {
  vi.useFakeTimers();
  const { network, object, sdk } = fixture();
  network.control.setConditions({ downloadBytesPerSecond: 2 });
  const first = (await sdk.download(object)).getReader();
  const discarded = first.read();
  await vi.advanceTimersByTimeAsync(500);
  await first.cancel();
  expect(await discarded).toMatchObject({ done: true });
  expect(vi.getTimerCount()).toBe(0);
  const second = (await sdk.download(object)).getReader();
  const delivered = second.read();
  await vi.advanceTimersByTimeAsync(1000);
  expect(await delivered).toMatchObject({ value: new Uint8Array([1, 2]) });
  expect(network.control.requests()[0]).toMatchObject({
    bytes: 0,
    status: "cancelled",
  });
  await second.cancel();
});

test("taking a device offline during a chunk fails before delivering its bytes", async () => {
  vi.useFakeTimers();
  const { network, object, sdk } = fixture();
  network.control.setConditions({ downloadBytesPerSecond: 2 });
  const reader = (await sdk.download(object)).getReader();
  const rejected = expect(reader.read()).rejects.toThrow("offline");
  await vi.advanceTimersByTimeAsync(500);
  network.control.setOffline("reader", true);
  await vi.advanceTimersByTimeAsync(500);
  await rejected;
  expect(network.control.requests()[0]).toMatchObject({
    bytes: 0,
    status: "failed",
  });
});

test("upload pacing does not publish slabs before the transfer completes", async () => {
  vi.useFakeTimers();
  const { account, network, sdk } = fixture();
  network.control.setConditions({ uploadBytesPerSecond: 2 });
  const pending = sdk.upload(new Uint8Array([8, 9]), { id: "new" });
  await vi.advanceTimersByTimeAsync(999);
  expect(network.model.listSlabs(account.id)).toHaveLength(1);
  await vi.advanceTimersByTimeAsync(1);
  const object = await pending;
  expect(object.size()).toBe(2);
  expect(network.model.listSlabs(account.id)).toHaveLength(2);
  expect(network.model.object(account.id, "new")).toBeUndefined();
});

test("slow links do not overflow the platform timer limit", async () => {
  vi.useFakeTimers();
  const { network, object, sdk } = fixture();
  network.control.setConditions({ downloadBytesPerSecond: 0.0000001 });
  const reader = (await sdk.download(object)).getReader();
  let delivered = false;
  const pending = reader.read().then(() => {
    delivered = true;
  });
  await vi.advanceTimersByTimeAsync(1000);
  expect(delivered).toBe(false);
  await reader.cancel();
  await pending;
  expect(vi.getTimerCount()).toBe(0);
});

test.each([{ chunkBytes: 0 }, { chunkBytes: -1 }, { requestLimit: 0 }])(
  "rejects invalid network limits %j",
  (options) => {
    expect(() => createMockNetwork(options)).toThrow("positive safe integer");
  },
);

test.each([
  { latencyMs: -1 },
  { latencyMs: Infinity },
  { downloadBytesPerSecond: -1 },
  { uploadBytesPerSecond: NaN },
])("rejects invalid conditions %j", (conditions) => {
  const { network } = fixture();
  expect(() => network.control.setConditions(conditions)).toThrow(
    "nonnegative and finite",
  );
});
