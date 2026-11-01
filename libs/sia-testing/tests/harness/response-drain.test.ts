/** Exercises observer deadlines without changing browser or SDK clocks. */
import { EventEmitter } from "node:events";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { ResponseDrain } from "../e2e/support/response-drain.js";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  try {
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, reject, resolve };
}

test("a stalled body rejects at the deadline and removes its listener", async () => {
  const body = deferred<string>();
  const emitter = new EventEmitter();
  const drain = new ResponseDrain(() => false, 100);
  const observed: string[] = [];
  const listener = () =>
    drain.observe(body.promise, (value) => observed.push(value));
  emitter.on("response", listener);
  emitter.emit("response");
  let outcome = "pending";
  const finished = drain
    .finish(() => emitter.off("response", listener))
    .then(
      () => {
        outcome = "completed";
      },
      (error: Error) => {
        outcome = error.message;
      },
    );
  await vi.advanceTimersByTimeAsync(99);
  expect(outcome).toBe("pending");
  await vi.advanceTimersByTimeAsync(1);
  expect(outcome).toBe("Shared-host observations did not settle");
  expect(emitter.listenerCount("response")).toBe(0);
  await finished;
  body.resolve("late body");
  await Promise.resolve();
  expect(observed).toEqual([]);
});

test("normally completed bodies are observed before listener removal", async () => {
  const body = deferred<string>();
  const drain = new ResponseDrain(() => false, 100);
  const events: string[] = [];
  drain.observe(body.promise, (value) => events.push(value));
  const finished = drain.finish(() => {
    events.push("detached");
  });
  body.resolve("delivered");
  await finished;
  expect(events).toEqual(["delivered", "detached"]);
});

test("a late body rejection is consumed after timeout without reopening cleanup", async () => {
  const body = deferred<string>();
  const drain = new ResponseDrain(() => false, 100);
  drain.observe(body.promise, () => {
    throw new Error("must not observe");
  });
  const failure = drain.drain().catch((error: Error) => error.message);
  await vi.advanceTimersByTimeAsync(100);
  expect(await failure).toBe("Shared-host observations did not settle");
  let detached = false;
  await expect(
    drain.finish(() => {
      detached = true;
    }),
  ).rejects.toThrow("Shared-host observations did not settle");
  expect(detached).toBe(true);
  body.reject(new Error("private body failure"));
  await vi.advanceTimersByTimeAsync(0);
});

test("an active body rejection reports a safe observation error and removes listeners", async () => {
  const drain = new ResponseDrain(() => false, 100);
  drain.observe(
    Promise.reject(new Error("private response details")),
    () => undefined,
  );
  let detached = false;
  await expect(
    drain.finish(() => {
      detached = true;
    }),
  ).rejects.toThrow("Shared-host response decoding or projection failed");
  expect(detached).toBe(true);
});

test("requests without response headers are bounded by the same deadline", async () => {
  const drain = new ResponseDrain(() => true, 100);
  const failure = drain
    .finish(() => undefined)
    .catch((error: Error) => error.message);
  await vi.advanceTimersByTimeAsync(100);
  expect(await failure).toBe("Shared-host observations did not settle");
});

test("a completed drain remains open for later responses until finalized", async () => {
  const drain = new ResponseDrain(() => false, 100);
  const values: number[] = [];
  drain.observe(Promise.resolve(1), (value) => values.push(value));
  await drain.drain();
  drain.observe(Promise.resolve(2), (value) => values.push(value));
  await drain.finish(() => undefined);
  drain.observe(Promise.reject(new Error("late response")), (value) =>
    values.push(value),
  );
  await vi.advanceTimersByTimeAsync(0);
  expect(values).toEqual([1, 2]);
});

test("bodies added while draining share the original remaining deadline", async () => {
  const first = deferred<string>();
  const second = deferred<string>();
  const drain = new ResponseDrain(() => false, 100);
  drain.observe(first.promise, () => undefined);
  let outcome = "pending";
  const finished = drain
    .finish(() => undefined)
    .catch((error: Error) => {
      outcome = error.message;
    });
  await vi.advanceTimersByTimeAsync(60);
  drain.observe(second.promise, () => undefined);
  first.resolve("first body");
  await vi.advanceTimersByTimeAsync(39);
  expect(outcome).toBe("pending");
  await vi.advanceTimersByTimeAsync(1);
  expect(outcome).toBe("Shared-host observations did not settle");
  await finished;
  second.resolve("late body");
});

test("cleanup preserves an earlier probe failure alongside the observation timeout", async () => {
  const drain = new ResponseDrain(() => false, 100);
  drain.observe(new Promise<string>(() => undefined), () => undefined);
  const original = new Error("recipient assertion failed");
  const detached = new Error("listener cleanup failed");
  const failure = drain
    .finish(
      () => {
        throw detached;
      },
      { error: original },
    )
    .catch((error: AggregateError) => error);
  await vi.advanceTimersByTimeAsync(100);
  const error = await failure;
  expect(error).toBeInstanceOf(AggregateError);
  if (!(error instanceof AggregateError))
    throw new Error("Expected aggregate observation failure");
  expect(error.errors).toHaveLength(3);
  expect(error.errors[0]).toBe(original);
  expect(error.errors[1]).toEqual(
    new Error("Shared-host observations did not settle"),
  );
  expect(error.errors[2]).toBe(detached);
});
