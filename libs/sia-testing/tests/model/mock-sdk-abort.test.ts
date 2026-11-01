/** Caller cancellation releases mock work instead of leaving a held request or transfer running. */
import { afterEach, expect, test, vi } from "vitest";
import { createMockNetwork } from "../../src/sdk/index.js";

function fixture() {
  const network = createMockNetwork({ chunkBytes: 1 });
  const account = network.model.createAccount({ publicKey: "owner" });
  const sdk = network.createSdk({ accountId: account.id });
  const object = network.seedObject(
    account.id,
    "video",
    new Uint8Array([1, 2]),
  );
  return { account, network, object, sdk };
}

afterEach(() => vi.useRealTimers());

test("an already cancelled upload cannot create a slab", async () => {
  const { account, network, sdk } = fixture();
  const signal = AbortSignal.abort();
  await expect(
    sdk.upload(new Uint8Array([9]), { id: "new", signal }),
  ).rejects.toThrow();
  expect(network.model.listSlabs(account.id)).toHaveLength(1);
  expect(network.control.requests()[0]?.status).toBe("cancelled");
});

test("cancelling a held object call does not require releasing the hold", async () => {
  const { network, sdk } = fixture();
  const release = network.control.hold({ operation: "object" });
  const abort = new AbortController();
  let settled = false;
  const pending = sdk.object("video", { signal: abort.signal }).catch(() => {
    settled = true;
  });
  abort.abort();
  await new Promise((resolve) => setTimeout(resolve, 0));
  const wasCancelled = settled;
  release();
  await pending;
  expect(wasCancelled).toBe(true);
  expect(network.control.requests()[0]?.status).toBe("cancelled");
});

test("cancelling during latency removes its timer", async () => {
  vi.useFakeTimers();
  const { network, sdk } = fixture();
  network.control.setConditions({ latencyMs: 1000 });
  const abort = new AbortController();
  const pending = sdk
    .object("video", { signal: abort.signal })
    .catch(() => undefined);
  await vi.advanceTimersByTimeAsync(0);
  abort.abort();
  await vi.advanceTimersByTimeAsync(0);
  const timers = vi.getTimerCount();
  await vi.advanceTimersByTimeAsync(1000);
  await pending;
  expect(timers).toBe(0);
});

test("cancelling an upload frees its queued transfer without publishing bytes", async () => {
  vi.useFakeTimers();
  const { account, network, sdk } = fixture();
  network.control.setConditions({ uploadBytesPerSecond: 1 });
  const abort = new AbortController();
  const pending = sdk
    .upload(new Uint8Array([9]), { id: "new", signal: abort.signal })
    .catch(() => undefined);
  await vi.advanceTimersByTimeAsync(100);
  abort.abort();
  await vi.advanceTimersByTimeAsync(0);
  const timers = vi.getTimerCount();
  await vi.advanceTimersByTimeAsync(1000);
  await pending;
  expect(timers).toBe(0);
  expect(network.model.listSlabs(account.id)).toHaveLength(1);
});

test("cancelling an opened download errors its pending read and clears link time", async () => {
  vi.useFakeTimers();
  const { network, object, sdk } = fixture();
  network.control.setConditions({ downloadBytesPerSecond: 1 });
  const abort = new AbortController();
  const reader = (
    await sdk.download(object, { signal: abort.signal })
  ).getReader();
  let rejected = false;
  const pending = reader.read().catch(() => {
    rejected = true;
  });
  await vi.advanceTimersByTimeAsync(100);
  abort.abort();
  await vi.advanceTimersByTimeAsync(0);
  const timers = vi.getTimerCount();
  await vi.advanceTimersByTimeAsync(1000);
  await pending;
  expect(timers).toBe(0);
  expect(rejected).toBe(true);
  expect(network.control.requests()[0]).toMatchObject({
    bytes: 0,
    status: "cancelled",
  });
});
