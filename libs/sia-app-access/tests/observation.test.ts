/** Immediate account observations include the current state without requiring callers to read it. */
import {
  AccessIntent,
  AccessPhase,
  createSiaAccess,
  observeSiaAccess,
} from "@/index";
import { test } from "node:test";
import assert from "node:assert/strict";
import { app, fixture } from "./helpers/core-fixture.ts";

void test("an observer receives the current state, later states, and the final state once", async () => {
  const f = fixture();
  const phases: AccessPhase[] = [];
  const stop = observeSiaAccess(f.access, (snapshot) => {
    phases.push(snapshot.state.phase);
  });
  assert.deepEqual(phases, [AccessPhase.Disconnected]);
  await f.access.authorize(AccessIntent.Create);
  void f.access.dispose();
  stop();
  stop();
  assert.deepEqual(phases, [
    AccessPhase.Disconnected,
    AccessPhase.RequestingApproval,
    AccessPhase.AwaitingApproval,
    AccessPhase.RecoveryPhrase,
    AccessPhase.Disposed,
  ]);
});

void test("an observer can stop receiving updates before the next command", async () => {
  const f = fixture();
  const phases: AccessPhase[] = [];
  const stop = observeSiaAccess(f.access, (snapshot) => {
    phases.push(snapshot.state.phase);
  });
  stop();
  await f.access.authorize(AccessIntent.Create);
  assert.deepEqual(phases, [AccessPhase.Disconnected]);
  void f.access.dispose();
});

void test("a throwing initial observer is removed and its failure reaches the caller", async () => {
  const f = fixture();
  const failure = Error("view failed");
  let calls = 0;
  assert.throws(
    () =>
      observeSiaAccess(f.access, () => {
        calls += 1;
        throw failure;
      }),
    (error) => error === failure,
  );
  await f.access.authorize(AccessIntent.Create);
  assert.equal(calls, 1);
  void f.access.dispose();
});

void test("a change during subscription is delivered once before the initial read", () => {
  const f = fixture();
  const phases: AccessPhase[] = [];
  const source = {
    getSnapshot: () => f.access.getSnapshot(),
    subscribe(listener: () => void) {
      const stop = f.access.subscribe(listener);
      void f.access.dispose();
      return stop;
    },
  };
  observeSiaAccess(source, (snapshot) => phases.push(snapshot.state.phase));
  assert.deepEqual(phases, [AccessPhase.Disposed]);
});

void test("later observer failures reach the controller reporter", async () => {
  const f = fixture();
  const failure = Error("view failed");
  let reported: unknown;
  const access = createSiaAccess({
    adapter: f.adapter,
    application: app,
    indexerUrl: "https://indexer/",
    onSubscriberError: (error) => {
      reported = error;
    },
  });
  observeSiaAccess(access, (snapshot) => {
    if (snapshot.state.phase === AccessPhase.RequestingApproval) throw failure;
  });
  await access.authorize(AccessIntent.Create);
  assert.equal(reported, failure);
  void access.dispose();
});

void test("an observer that changes the state sees each new snapshot once", () => {
  const f = fixture();
  const phases: AccessPhase[] = [];
  const stop = observeSiaAccess(f.access, (snapshot) => {
    phases.push(snapshot.state.phase);
    if (snapshot.state.phase === AccessPhase.Disconnected)
      void f.access.dispose();
  });
  stop();
  assert.deepEqual(phases, [AccessPhase.Disconnected, AccessPhase.Disposed]);
});
