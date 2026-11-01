/** Summary bodies must settle within a deadline, including when the browser operation fails. */
import { EventEmitter } from "node:events";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import * as responses from "../e2e/support/response-drain.js";
beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  expect(vi.getTimerCount()).toBe(0);
  vi.useRealTimers();
});
function deferred() {
  let resolve!: (value: Buffer) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<Buffer>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, reject, resolve };
}
function response(body: Promise<Buffer>) {
  return {
    body: () => body,
    headers: () => ({}),
    request: () => ({
      method: () => "GET",
      url: () => "http://localhost/shared/objects?includeslabs=false",
    }),
    status: () => 200,
    url: () => "http://localhost/shared/objects?includeslabs=false",
  };
}
it("waits for delayed summary bodies before accepting their rows", async () => {
  expect(responses).toHaveProperty("observeSummaryResponses");
  const page = new EventEmitter();
  const body = deferred();
  const observed = responses.observeSummaryResponses(page, 100);
  page.emit("response", response(body.promise));
  const drained = observed.drain();
  await vi.advanceTimersByTimeAsync(50);
  expect(observed.snapshot()).toEqual([]);
  body.resolve(Buffer.from('[{"id":"first"}]'));
  await drained;
  expect(observed.snapshot()).toEqual([[{ id: "first" }]]);
  await observed.finish();
  expect(page.listenerCount("response")).toBe(0);
});
it("detaches the summary listener after a body fails without exposing its error", async () => {
  expect(responses).toHaveProperty("observeSummaryResponses");
  const page = new EventEmitter();
  const body = deferred();
  const observed = responses.observeSummaryResponses(page, 100);
  page.emit("response", response(body.promise));
  body.reject(new Error("secret credential"));
  await expect(observed.finish()).rejects.toThrow(
    "response decoding or projection failed",
  );
  expect(page.listenerCount("response")).toBe(0);
});
it("keeps the primary failure first when a summary body never settles", async () => {
  expect(responses).toHaveProperty("observeSummaryResponses");
  const page = new EventEmitter();
  const body = deferred();
  const observed = responses.observeSummaryResponses(page, 100);
  page.emit("response", response(body.promise));
  const primary = new Error("browser assertion");
  const finished = observed
    .finish({ error: primary })
    .catch((error: unknown) => error);
  await vi.advanceTimersByTimeAsync(100);
  const failure = await finished;
  expect(failure).toBeInstanceOf(AggregateError);
  if (!(failure instanceof AggregateError)) throw new Error("Missing failures");
  expect(failure.errors[0]).toBe(primary);
  expect(page.listenerCount("response")).toBe(0);
  body.resolve(Buffer.from("[]"));
  await Promise.resolve();
  expect(observed.snapshot()).toEqual([]);
});
