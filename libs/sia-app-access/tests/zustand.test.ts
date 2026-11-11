/** Readonly Zustand adapters observe one controller without copying its state. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { AccessIntent } from "@/index";
import { createSiaAccessStore } from "@/zustand";
import { fixture } from "./helpers/core-fixture.ts";

void test("the readonly store returns controller snapshots without subscribing during creation", async () => {
  const f = fixture();
  let subscriptions = 0;
  const access = {
    ...f.access,
    subscribe(listener: () => void) {
      subscriptions++;
      return f.access.subscribe(listener);
    },
  };
  const store = createSiaAccessStore(access);
  const initial = f.access.getSnapshot();
  assert.equal(store.getState(), initial);
  assert.equal(store.getInitialState(), initial);
  assert.equal(subscriptions, 0);
  assert.equal("setState" in store, false);
  assert.equal(Object.isFrozen(store), true);
  await f.access.authorize(AccessIntent.Create);
  assert.equal(store.getState(), f.access.getSnapshot());
  assert.equal(store.getState().state.phase, "recovery-phrase");
  assert.equal(store.getInitialState(), initial);
  void f.access.dispose();
});

void test("store notifications report the controller's current and previous snapshots", async () => {
  const f = fixture();
  const store = createSiaAccessStore(f.access);
  const initial = store.getState();
  const changes: {
    current: ReturnType<typeof store.getState>;
    previous: ReturnType<typeof store.getState>;
  }[] = [];
  const unsubscribe = store.subscribe((current, previous) => {
    assert.equal(current, f.access.getSnapshot());
    changes.push({ current, previous });
  });
  await f.access.authorize(AccessIntent.Create);
  assert.deepEqual(
    changes.map((change) => change.current.state.phase),
    ["requesting-approval", "awaiting-approval", "recovery-phrase"],
  );
  assert.equal(changes[0]?.previous, initial);
  assert.equal(changes[1]?.previous, changes[0]?.current);
  assert.equal(changes[2]?.previous, changes[1]?.current);
  unsubscribe();
  void f.access.disconnect();
  assert.equal(changes.length, 3);
  void f.access.dispose();
});

void test("independent adapters share snapshots while keeping their subscriptions separate", async () => {
  const f = fixture();
  const first = createSiaAccessStore(f.access);
  const second = createSiaAccessStore(f.access);
  let firstChanges = 0;
  const phases: string[] = [];
  const stopFirst = first.subscribe(() => {
    firstChanges++;
  });
  const stopSecond = second.subscribe((snapshot) => {
    assert.equal(snapshot, first.getState());
    assert.equal(snapshot, f.access.getSnapshot());
    phases.push(snapshot.state.phase);
  });
  await f.access.authorize(AccessIntent.Create);
  assert.equal(firstChanges, 3);
  assert.equal(first.getState(), second.getState());
  stopFirst();
  void f.access.disconnect();
  assert.equal(firstChanges, 3);
  assert.equal(first.getState(), second.getState());
  void f.access.dispose();
  assert.equal(second.getState(), f.access.getSnapshot());
  assert.deepEqual(phases, [
    "requesting-approval",
    "awaiting-approval",
    "recovery-phrase",
    "disconnected",
    "disposed",
  ]);
  stopSecond();
});

void test("store methods preserve a controller receiver", () => {
  const f = fixture();
  const access = {
    ...f.access,
    getSnapshot() {
      assert.equal(this, access);
      return f.access.getSnapshot();
    },
    subscribe(listener: () => void) {
      assert.equal(this, access);
      return f.access.subscribe(listener);
    },
  };
  const store = createSiaAccessStore(access);
  const read = store.getState;
  const subscribe = store.subscribe;
  assert.equal(read(), f.access.getSnapshot());
  subscribe(() => {
    return;
  })();
  void f.access.dispose();
});

void test("a supplied server snapshot is presentation only and must match the controller scope", () => {
  const f = fixture();
  const snapshot = f.access.getSnapshot();
  const serverSnapshot = Object.freeze({ ...snapshot });
  const store = createSiaAccessStore(f.access, { serverSnapshot });
  assert.equal(store.getInitialState(), serverSnapshot);
  assert.equal(store.getState(), snapshot);
  assert.throws(
    () =>
      createSiaAccessStore(f.access, {
        serverSnapshot: {
          ...snapshot,
          scope: { ...snapshot.scope, appId: "b".repeat(64) },
        },
      }),
    /scope.*match|match.*scope/i,
  );
  void f.access.dispose();
});
