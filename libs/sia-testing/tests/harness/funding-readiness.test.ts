import { afterEach, expect, it, vi } from "vitest";
import { waitForFundingReady } from "../e2e/support/funding-readiness.js";

afterEach(() => vi.useRealTimers());

it("keeps waiting through the first two pool-funding retry intervals", async () => {
  vi.useFakeTimers();
  let ready = false;
  let settled = false;
  let failed: unknown;
  const pending = waitForFundingReady(() => Promise.resolve(ready))
    .then(() => {
      settled = true;
    })
    .catch((error) => {
      failed = error;
    });
  await vi.advanceTimersByTimeAsync(6 * 60_000);
  expect(failed).toBeUndefined();
  expect(settled).toBe(false);
  ready = true;
  await vi.advanceTimersByTimeAsync(250);
  await pending;
  expect(settled).toBe(true);
});

it("fails when readiness stays false through the selected deadline", async () => {
  vi.useFakeTimers();
  const rejected = expect(
    waitForFundingReady(() => Promise.resolve(false), 1000),
  ).rejects.toThrow("funding did not reach readiness");
  await vi.advanceTimersByTimeAsync(1000);
  await rejected;
});
