/** Subscription ownership survives reentrant emission and synchronous registration callbacks. */
import { createNanoEvents } from "nanoevents";
import { expect, it, vi } from "vitest";
import { createSubscriptions } from "../src/internal/subscriptions.ts";

it("a once subscription stops before its listener runs", () => {
  const events = createNanoEvents<{ value: (value: number) => void }>();
  const scope = createSubscriptions();
  const order: string[] = [];
  const stop = scope.once<number>(
    (listener) => {
      const off = events.on("value", listener);
      return () => {
        order.push("off");
        off();
      };
    },
    () => {
      order.push("listener");
      events.emit("value", 2);
    },
  );
  events.emit("value", 1);
  stop();
  scope.clear();
  expect(order).toEqual(["off", "listener"]);
});

it("a throwing once listener stays stopped after the failed emission", () => {
  const events = createNanoEvents<{ value: (value: number) => void }>();
  const scope = createSubscriptions();
  const failure = new Error("listener");
  const listener = vi.fn(() => {
    throw failure;
  });
  scope.once<number>((callback) => events.on("value", callback), listener);
  expect(() => events.emit("value", 1)).toThrow(failure);
  expect(() => events.emit("value", 2)).not.toThrow();
  scope.clear();
  expect(listener).toHaveBeenCalledOnce();
});

it("a callback removed during emission does not run from the captured emitter array", () => {
  const events = createNanoEvents<{ value: (value: number) => void }>();
  const scope = createSubscriptions();
  const listener = vi.fn();
  let stop: () => void = () => undefined;
  events.on("value", () => stop());
  stop = scope.subscribe<number>(
    (callback) => events.on("value", callback),
    listener,
  );
  events.emit("value", 1);
  expect(listener).not.toHaveBeenCalled();
  scope.clear();
});

it("stopping one subscription keeps another active until clear", () => {
  const events = createNanoEvents<{ value: (value: number) => void }>();
  const scope = createSubscriptions();
  const first = vi.fn(),
    second = vi.fn();
  const stop = scope.subscribe<number>(
    (callback) => events.on("value", callback),
    first,
  );
  scope.once<number>((callback) => events.on("value", callback), second);
  stop();
  stop();
  events.emit("value", 1);
  scope.clear();
  scope.clear();
  events.emit("value", 2);
  expect(first).not.toHaveBeenCalled();
  expect(second).toHaveBeenCalledExactlyOnceWith(1);
});

it("clear removes current subscriptions without preventing later registration", () => {
  const events = createNanoEvents<{ value: (value: number) => void }>();
  const scope = createSubscriptions();
  const first = vi.fn(),
    second = vi.fn();
  scope.subscribe<number>((callback) => events.on("value", callback), first);
  scope.clear();
  scope.subscribe<number>((callback) => events.on("value", callback), second);
  events.emit("value", 1);
  expect(first).not.toHaveBeenCalled();
  expect(second).toHaveBeenCalledExactlyOnceWith(1);
  scope.clear();
});

it("a synchronous once callback still releases the returned unsubscribe", () => {
  const scope = createSubscriptions();
  const listener = vi.fn(),
    off = vi.fn();
  let emit: (value: number) => void = () => undefined;
  const stop = scope.once<number>((callback) => {
    emit = callback;
    callback(1);
    return off;
  }, listener);
  emit(2);
  stop();
  scope.clear();
  expect(listener).toHaveBeenCalledExactlyOnceWith(1);
  expect(off).toHaveBeenCalledOnce();
});

it("clear during registration releases the unsubscribe when registration returns", () => {
  const scope = createSubscriptions();
  const off = vi.fn();
  let emit: (value: number) => void = () => undefined;
  const listener = vi.fn(() => scope.clear());
  scope.subscribe<number>((callback) => {
    emit = callback;
    callback(1);
    return off;
  }, listener);
  emit(2);
  scope.clear();
  expect(listener).toHaveBeenCalledOnce();
  expect(off).toHaveBeenCalledOnce();
});

it("clear attempts every unsubscribe and preserves the first thrown value", () => {
  const scope = createSubscriptions();
  const failure = { reason: "first unsubscribe" };
  const first = vi.fn(() => {
    throw failure;
  });
  const second = vi.fn(() => {
    throw new Error("second unsubscribe");
  });
  scope.subscribe<number>(
    () => first,
    () => undefined,
  );
  scope.subscribe<number>(
    () => second,
    () => undefined,
  );
  let caught: unknown;
  try {
    scope.clear();
  } catch (error) {
    caught = error;
  }
  expect(caught).toBe(failure);
  expect(first).toHaveBeenCalledOnce();
  expect(second).toHaveBeenCalledOnce();
  expect(() => scope.clear()).not.toThrow();
});

it("a registration failure deactivates its callback and leaves no tracked stop", () => {
  const scope = createSubscriptions();
  const failure = new Error("registration");
  const listener = vi.fn();
  let emit: (value: number) => void = () => undefined;
  expect(() =>
    scope.subscribe<number>((callback) => {
      emit = callback;
      throw failure;
    }, listener),
  ).toThrow(failure);
  emit(1);
  expect(listener).not.toHaveBeenCalled();
  expect(() => scope.clear()).not.toThrow();
});
