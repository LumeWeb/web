/** Controller traces keep late protocol work from changing settled outcomes or freed resources. */
import {
  AccessFailure,
  AccessIntent,
  AccessPhase,
  createMemoryCredentialStore,
  createSiaAccess,
  PhraseValidation,
  SessionUnavailableError,
} from "@/index";
import type { AccessConnection, AccessSession, CredentialStore } from "@/index";
import { test } from "node:test";
import assert from "node:assert/strict";
import { app, credentialStore, fixture } from "./helpers/core-fixture.ts";
import type { TestSession } from "./helpers/core-fixture.ts";
import {
  activeTimeoutCount,
  deferred,
  drainMicrotasks,
} from "./helpers/core-async.ts";
void test("controller construction canonicalizes scope and rejects invalid configuration", () => {
  const options = {
    adapter: {
      begin: () => Promise.reject(new Error("Unexpected authorization")),
      generateRecoveryPhrase: () =>
        Promise.reject(new Error("Unexpected generation")),
      reconnect: () => Promise.reject(new Error("Unexpected reconnect")),
      validateRecoveryPhrase: () =>
        Promise.reject(new Error("Unexpected validation")),
    },
    application: { ...app, appId: "A".repeat(64) },
    indexerUrl: "HTTPS://EXAMPLE.COM:443/path",
  };
  const access = createSiaAccess(options);
  try {
    assert.deepEqual(access.getSnapshot().scope, {
      appId: "a".repeat(64),
      indexerUrl: "https://example.com/path",
    });
    assert.ok(Object.isFrozen(access.getSnapshot().scope));
    for (const indexerUrl of [
      "ftp://x",
      "https://u:p@x",
      "https://x?q=1",
      "https://x/#frag",
    ])
      assert.throws(
        () => createSiaAccess({ ...options, indexerUrl }),
        TypeError,
      );
    assert.throws(
      () =>
        createSiaAccess({
          ...options,
          application: { ...options.application, appId: "x" },
        }),
      TypeError,
    );
    for (const approvalTimeoutMs of [
      0,
      -1,
      Number.NaN,
      Number.POSITIVE_INFINITY,
    ])
      assert.throws(
        () => createSiaAccess({ ...options, approvalTimeoutMs }),
        TypeError,
      );
  } finally {
    access.dispose();
  }
});

void test("authorization requests input then installs confirmed access without exposing secrets", async () => {
  const f = fixture();
  assert.deepEqual(await f.access.authorize(AccessIntent.Create), {
    kind: "approved",
  });
  assert.equal(f.access.getSnapshot().state.phase, "recovery-phrase");
  assert.deepEqual(await f.access.submitRecoveryPhrase("secret phrase"), {
    credentials: "confirmed",
    kind: "ready",
  });
  assert.equal(await f.access.withSession((s) => s.id), 7);
  assert.equal(f.counts().registrations, 1);
  assert.ok(!JSON.stringify(f.access.getSnapshot()).includes("secret"));
  assert.deepEqual(await f.access.reconnect(), { kind: "unavailable" });
});
void test("invalid and mismatching phrases preserve correction without registering", async () => {
  const f = fixture();
  await f.access.authorize(AccessIntent.Existing);
  f.adapter.validateRecoveryPhrase = async () => PhraseValidation.Invalid;
  assert.deepEqual(await f.access.submitRecoveryPhrase("bad"), {
    kind: "invalid-phrase",
  });
  f.adapter.validateRecoveryPhrase = async () => PhraseValidation.Valid;
  f.connection.matchesExistingAppKey = async () => false;
  assert.deepEqual(await f.access.submitRecoveryPhrase("other"), {
    kind: "phrase-mismatch",
  });
  assert.equal(f.counts().registrations, 0);
  assert.equal(f.counts().retired, 0);
  f.connection.matchesExistingAppKey = async () => true;
  assert.equal((await f.access.submitRecoveryPhrase("right")).kind, "ready");
});
void test("operational validation failure retires the connection and does not blame input", async () => {
  const f = fixture();
  await f.access.authorize(AccessIntent.Create);
  f.adapter.validateRecoveryPhrase = async () => {
    throw Error("secret");
  };
  assert.deepEqual(await f.access.submitRecoveryPhrase("phrase"), {
    effects: { credentials: "none", registration: "none" },
    failure: "phrase-check",
    kind: "failed",
    recovery: "authorize",
  });
  assert.equal(f.counts().retired, 1);
});
void test("reentrant observers cannot change the completed result and throwing observers are isolated", async () => {
  const f = fixture();
  let errors = 0;
  f.access.subscribe(() => {
    throw Error("observer");
  });
  f.access.subscribe(() => {
    if (f.access.getSnapshot().state.phase === AccessPhase.Ready) {
      errors++;
      f.access.disconnect();
    }
  });
  await f.access.authorize(AccessIntent.Create);
  const result = await f.access.submitRecoveryPhrase("phrase");
  assert.deepEqual(result, { credentials: "confirmed", kind: "ready" });
  assert.ok(Object.isFrozen(result));
  assert.equal(errors, 1);
  await assert.rejects(
    f.access.withSession(() => 1),
    SessionUnavailableError,
  );
});
void test("save retry and skip retain the registered session without registering twice", async () => {
  let writes = 0;
  const store: CredentialStore = {
    async read() {
      return null;
    },
    async remove() {
      return;
    },
    async write() {
      writes++;
      if (writes === 1) throw Error("committed perhaps");
    },
  };
  const f = fixture(store);
  await f.access.authorize(AccessIntent.Create);
  assert.deepEqual(await f.access.submitRecoveryPhrase("phrase"), {
    effects: { credentials: "write", registration: "registered" },
    failure: "credentials-write",
    kind: "failed",
    recovery: "save",
  });
  assert.deepEqual(await f.access.retrySave(), {
    credentials: "confirmed",
    kind: "ready",
  });
  assert.equal(f.counts().registrations, 1);
  assert.equal(writes, 2);
  const g = fixture(
    credentialStore({
      ...store,
      async write() {
        throw Error();
      },
    }),
  );
  await g.access.authorize(AccessIntent.Create);
  await g.access.submitRecoveryPhrase("phrase");
  assert.deepEqual(g.access.continueWithoutSaving(), {
    credentials: "unconfirmed",
    kind: "ready",
  });
  assert.equal(g.counts().registrations, 1);
});
void test("session work is admitted synchronously and holds ownership through disposal", async () => {
  const f = fixture();
  await f.access.authorize(AccessIntent.Create);
  await f.access.submitRecoveryPhrase("phrase");
  const hold = deferred<number>();
  let invoked = false;
  const work = f.access.withSession((s) => {
    invoked = true;
    assert.equal(s.id, 7);
    return hold.promise;
  });
  assert.equal(invoked, true);
  f.access.dispose();
  assert.equal(f.counts().ended, 0);
  await assert.rejects(
    f.access.withSession(() => 0),
    SessionUnavailableError,
  );
  hold.resolve(4);
  assert.equal(await work, 4);
  assert.equal(f.counts().ended, 1);
  const g = fixture();
  await g.access.authorize(AccessIntent.Create);
  await g.access.submitRecoveryPhrase("phrase");
  const error = { message: "application" };
  await assert.rejects(
    g.access.withSession(() => {
      // The borrower must receive the original value even when it is not an Error.
      // oxlint-disable-next-line typescript/only-throw-error
      throw error;
    }),
    (e) => e === error,
  );
});
void test("cancellation settles pending begin and retires a late connection", async () => {
  const f = fixture();
  const d = deferred<AccessConnection<TestSession>>();
  f.adapter.begin = () => d.promise;
  const command = f.access.authorize(AccessIntent.Create);
  assert.deepEqual(await f.access.authorize(AccessIntent.Existing), {
    kind: "unavailable",
  });
  f.access.cancel();
  assert.deepEqual(await command, {
    effects: { credentials: "none", registration: "none" },
    kind: "cancelled",
  });
  d.resolve(f.connection);
  await drainMicrotasks();
  assert.equal(f.counts().retired, 1);
  assert.equal(f.access.getSnapshot().state.phase, "disconnected");
});
void test("disconnect during connection retirement releases the returned registration session", async () => {
  const f = fixture();
  let retired = false;
  f.connection.dispose = () => {
    if (retired) return;
    retired = true;
    f.access.disconnect();
  };
  try {
    await f.access.authorize(AccessIntent.Create);
    const result = await f.access.submitRecoveryPhrase("private phrase");
    assert.deepEqual(result, {
      effects: { credentials: "none", registration: "registered" },
      kind: "cancelled",
    });
    assert.equal(f.access.getSnapshot().state.phase, AccessPhase.Disconnected);
    assert.equal(f.counts().ended, 1);
    assert.equal(f.counts().registrations, 1);
  } finally {
    f.access.dispose();
  }
});

void test("cancelled registration reports unknown effects and retires its late session", async () => {
  const f = fixture();
  await f.access.authorize(AccessIntent.Create);
  const d = deferred<AccessSession<TestSession>>();
  const registering = deferred<void>();
  f.connection.register = () => {
    registering.resolve();
    return d.promise;
  };
  const command = f.access.submitRecoveryPhrase("phrase");
  await registering.promise;
  assert.equal(f.access.getSnapshot().state.phase, "registering");
  f.access.cancel();
  const result = await command;
  assert.deepEqual(result, {
    effects: { credentials: "none", registration: "unknown" },
    kind: "cancelled",
  });
  d.resolve(f.session);
  await drainMicrotasks();
  assert.equal(f.counts().ended, 1);
  assert.deepEqual(result, {
    effects: { credentials: "none", registration: "unknown" },
    kind: "cancelled",
  });
});
void test("forget queues behind a write that commits then rejects and concurrent callers coalesce", async () => {
  const writing = deferred<void>();
  let bytes: null | Uint8Array = null;
  const events: string[] = [];
  const store: CredentialStore = {
    async read() {
      events.push("read");
      return bytes?.slice() ?? null;
    },
    async remove() {
      events.push("remove");
      bytes = null;
    },
    async write(_s, b) {
      bytes = b.slice();
      events.push("write");
      await writing.promise;
      throw Error("after write");
    },
  };
  const f = fixture(store);
  await f.access.authorize(AccessIntent.Create);
  const save = f.access.submitRecoveryPhrase("phrase");
  await drainMicrotasks();
  const forgetting = f.access.forget();
  assert.equal(f.access.forget(), forgetting);
  f.access.cancel();
  assert.deepEqual(await save, {
    effects: { credentials: "write", registration: "registered" },
    kind: "cancelled",
  });
  assert.deepEqual(await forgetting, {
    effects: { credentials: "remove", registration: "none" },
    kind: "cancelled",
  });
  const restore = f.access.reconnect();
  await drainMicrotasks();
  assert.deepEqual(events, ["write"]);
  writing.resolve();
  assert.deepEqual(await restore, { kind: "missing-credentials" });
  assert.deepEqual(events, ["write", "remove", "read"]);
  assert.equal(bytes, null);
});
void test("reconnect coalesces and retains borrowed read bytes until late completion", async () => {
  const bytes = new Uint8Array(32).fill(3);
  const d = deferred<AccessSession<TestSession> | null>();
  let supplied: Uint8Array | undefined;
  const f = fixture(
    credentialStore({
      async read() {
        return bytes;
      },
    }),
  );
  f.adapter.reconnect = async (_s, _a, b) => {
    supplied = b;
    return d.promise;
  };
  const p = f.access.reconnect();
  assert.equal(f.access.reconnect(), p);
  await drainMicrotasks();
  f.access.disconnect();
  assert.equal((await p).kind, "cancelled");
  assert.equal(supplied?.[0], 3);
  d.resolve(f.session);
  await drainMicrotasks();
  assert.equal(bytes[0], 0);
  assert.equal(f.counts().ended, 1);
});
void test("generation belongs to each caller and primary commands cancel pending generation", async () => {
  const f = fixture();
  const a = deferred<string>(),
    b = deferred<string>();
  let calls = 0;
  f.adapter.generateRecoveryPhrase = () => (++calls === 1 ? a : b).promise;
  const one = f.access.generateRecoveryPhrase(),
    two = f.access.generateRecoveryPhrase();
  a.resolve("one");
  assert.deepEqual(await one, { kind: "generated", phrase: "one" });
  const auth = f.access.authorize(AccessIntent.Create);
  assert.deepEqual(await two, { kind: "cancelled" });
  b.reject(Error("late secret"));
  await auth;
  await drainMicrotasks();
  assert.equal(JSON.stringify(f.access.getSnapshot()).includes("one"), false);
});
void test("approval timeout starts after begin and validates approval URLs", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const f = fixture();
  const begin = deferred<AccessConnection<TestSession>>();
  const approving = deferred<void>();
  f.adapter.begin = () => begin.promise;
  f.connection.waitForApproval = () => {
    approving.resolve();
    return new Promise(() => {
      return;
    });
  };
  const p = f.access.authorize(AccessIntent.Create);
  t.mock.timers.tick(300001);
  await drainMicrotasks();
  assert.equal(f.access.getSnapshot().state.phase, "requesting-approval");
  begin.resolve(f.connection);
  await approving.promise;
  t.mock.timers.tick(299999);
  await drainMicrotasks();
  assert.equal(f.access.getSnapshot().state.phase, "awaiting-approval");
  t.mock.timers.tick(1);
  await drainMicrotasks();
  assert.deepEqual(await p, {
    effects: { credentials: "none", registration: "none" },
    failure: "approval-timeout",
    kind: "failed",
    recovery: "authorize",
  });
  const g = fixture();
  Object.defineProperty(g.connection, "approvalUrl", {
    value: "javascript:alert(1)",
  });
  assert.equal((await g.access.authorize(AccessIntent.Create)).kind, "failed");
  assert.equal(g.counts().retired, 1);
});
void test("cancelling approval and validation prevents subsequent registration", async () => {
  for (const boundary of ["approval", "validation"] as const) {
    const f = fixture();
    const d = deferred<PhraseValidation>();
    const started = deferred<void>();
    let p;
    if (boundary === "approval") {
      f.connection.waitForApproval = () => {
        started.resolve();
        return d.promise.then(() => {
          return;
        });
      };
      p = f.access.authorize(AccessIntent.Create);
    } else {
      await f.access.authorize(AccessIntent.Create);
      f.adapter.validateRecoveryPhrase = () => {
        started.resolve();
        return d.promise;
      };
      p = f.access.submitRecoveryPhrase("phrase");
    }
    await started.promise;
    f.access.cancel();
    assert.deepEqual(await p, {
      effects: { credentials: "none", registration: "none" },
      kind: "cancelled",
    });
    d.resolve(PhraseValidation.Valid);
    await drainMicrotasks();
    assert.equal(f.counts().registrations, 0);
    assert.equal(f.counts().retired, 1);
  }
});
void test("registration rejection is unknown and a save retry reports no earlier registration", async () => {
  const f = fixture();
  await f.access.authorize(AccessIntent.Create);
  f.connection.register = async () => {
    throw Error("remote perhaps");
  };
  assert.deepEqual(await f.access.submitRecoveryPhrase("phrase"), {
    effects: { credentials: "none", registration: "unknown" },
    failure: "registration",
    kind: "failed",
    recovery: "authorize",
  });
  const g = fixture(
    credentialStore({
      async write() {
        throw Error();
      },
    }),
  );
  await g.access.authorize(AccessIntent.Create);
  await g.access.submitRecoveryPhrase("phrase");
  assert.deepEqual(await g.access.retrySave(), {
    effects: { credentials: "write", registration: "none" },
    failure: "credentials-write",
    kind: "failed",
    recovery: "save",
  });
});
void test("reconnect failures preserve stored credentials and distinguish missing and unknown keys", async () => {
  const store = createMemoryCredentialStore();
  const f = fixture(store);
  assert.deepEqual(await f.access.reconnect(), { kind: "missing-credentials" });
  await store.write(f.access.getSnapshot().scope, new Uint8Array(32).fill(1));
  f.adapter.reconnect = async () => null;
  assert.deepEqual(await f.access.reconnect(), {
    effects: { credentials: "none", registration: "none" },
    failure: "unregistered-key",
    kind: "failed",
    recovery: "authorize",
  });
  assert.equal((await store.read(f.access.getSnapshot().scope))?.[0], 1);
  f.adapter.reconnect = async () => {
    throw Error();
  };
  assert.equal((await f.access.reconnect()).kind, "failed");
  assert.equal((await store.read(f.access.getSnapshot().scope))?.[0], 1);
});
void test("cancelling approval clears its deadline without waiting for the adapter", async () => {
  const before = activeTimeoutCount();
  const f = fixture();
  f.connection.waitForApproval = () =>
    new Promise(() => {
      return;
    });
  const p = f.access.authorize(AccessIntent.Create);
  await drainMicrotasks();
  f.access.cancel();
  await p;
  await drainMicrotasks();
  assert.equal(activeTimeoutCount(), before);
});
void test("forget cancelled by its first observer reports no queued removal", async () => {
  let removed = 0;
  const f = fixture(
    credentialStore({
      async remove() {
        removed++;
      },
    }),
  );
  f.access.subscribe(() => {
    if (f.access.getSnapshot().state.phase === AccessPhase.Forgetting)
      f.access.cancel();
  });
  assert.deepEqual(await f.access.forget(), {
    effects: { credentials: "none", registration: "none" },
    kind: "cancelled",
  });
  await drainMicrotasks();
  assert.equal(removed, 0);
});
void test("failed removal reports the queued mutation and never claims absence", async () => {
  const f = fixture(
    credentialStore({
      async read() {
        return new Uint8Array(32).fill(8);
      },
      async remove() {
        throw Error("secret");
      },
    }),
  );
  assert.deepEqual(await f.access.forget(), {
    effects: { credentials: "remove", registration: "none" },
    failure: "credentials-remove",
    kind: "failed",
    recovery: "forget",
  });
  assert.equal((await f.access.reconnect()).kind, "ready");
});
void test("save input is cleared only after the store settles and retry cancellation has local effects", async () => {
  const first = deferred<void>();
  const second = deferred<void>();
  let supplied: Uint8Array | undefined;
  let calls = 0;
  const f = fixture(
    credentialStore({
      async write(_s, b) {
        supplied = b;
        calls++;
        await (calls === 1 ? first : second).promise;
      },
    }),
  );
  await f.access.authorize(AccessIntent.Create);
  const p = f.access.submitRecoveryPhrase("phrase");
  await drainMicrotasks();
  assert.equal(supplied?.[0], 9);
  first.reject(Error());
  await p;
  assert.equal(supplied?.[0], 0);
  const retry = f.access.retrySave();
  await drainMicrotasks();
  assert.equal(supplied?.[0], 9);
  f.access.disconnect();
  assert.deepEqual(await retry, {
    effects: { credentials: "write", registration: "none" },
    kind: "cancelled",
  });
  assert.equal(supplied?.[0], 9);
  second.resolve();
  await drainMicrotasks();
  assert.equal(supplied?.[0], 0);
});
void test("subscriber errors reach the configured reporter and snapshots stay stable between changes", async () => {
  const f = fixture();
  const error = Error("listener");
  let reported: unknown;
  const g = createSiaAccess({
    adapter: f.adapter,
    application: app,
    indexerUrl: "https://indexer/",
    onSubscriberError(e) {
      reported = e;
      throw Error("reporter");
    },
  });
  assert.equal(g.getSnapshot(), g.getSnapshot());
  g.subscribe(() => {
    throw error;
  });
  assert.deepEqual(await g.authorize(AccessIntent.Create), {
    kind: "approved",
  });
  assert.equal(reported, error);
  assert.ok(Object.isFrozen(g.getSnapshot()));
  assert.ok(Object.isFrozen(g.getSnapshot().state));
  g.dispose();
});
void test("a subscriber added during notification starts on the next publication", async () => {
  const f = fixture();
  const phases: string[] = [];
  let subscribed = false;
  f.access.subscribe(() => {
    if (subscribed) return;
    subscribed = true;
    f.access.subscribe(() => phases.push(f.access.getSnapshot().state.phase));
  });
  await f.access.authorize(AccessIntent.Create);
  assert.deepEqual(phases, ["awaiting-approval", "recovery-phrase"]);
  f.access.dispose();
});

void test("disposal publishes the terminal snapshot before removing observers", () => {
  const f = fixture();
  const phases: string[] = [];
  f.access.subscribe(() => phases.push(f.access.getSnapshot().state.phase));
  f.access.dispose();
  assert.deepEqual(phases, ["disposed"]);
  f.access.disconnect();
  f.access.dispose();
  assert.deepEqual(phases, ["disposed"]);
});

void test("reentrant disposal publishes the terminal state without resuming an older notification", async () => {
  const f = fixture();
  const first: string[] = [];
  const second: string[] = [];
  f.access.subscribe(() => {
    const phase = f.access.getSnapshot().state.phase;
    first.push(phase);
    if (phase === AccessPhase.RequestingApproval) f.access.dispose();
  });
  f.access.subscribe(() => second.push(f.access.getSnapshot().state.phase));
  const result = await f.access.authorize(AccessIntent.Create);
  assert.equal(result.kind, "cancelled");
  assert.deepEqual(first, ["requesting-approval", "disposed"]);
  assert.deepEqual(second, ["disposed"]);
  assert.equal(f.counts().registrations, 0);
});

void test("ready cancel preserves admission and disposal denies every command", async () => {
  const f = fixture();
  await f.access.authorize(AccessIntent.Create);
  await f.access.submitRecoveryPhrase("phrase");
  const ready = f.access.getSnapshot();
  f.access.cancel();
  assert.equal(f.access.getSnapshot(), ready);
  assert.equal(await f.access.withSession((s) => s.id), 7);
  f.access.dispose();
  const snapshot = f.access.getSnapshot();
  f.access.disconnect();
  f.access.cancel();
  assert.equal(f.access.getSnapshot(), snapshot);
  for (const result of [
    await f.access.authorize(AccessIntent.Create),
    await f.access.reconnect(),
    await f.access.submitRecoveryPhrase("phrase"),
    await f.access.retrySave(),
    f.access.continueWithoutSaving(),
    await f.access.forget(),
    await f.access.generateRecoveryPhrase(),
  ])
    assert.deepEqual(result, { kind: "unavailable" });
});
void test("a read failure is distinct from absence and generation failure carries no phrase", async () => {
  const f = fixture(
    credentialStore({
      async read() {
        throw Error("credentials");
      },
    }),
  );
  assert.deepEqual(await f.access.reconnect(), {
    effects: { credentials: "none", registration: "none" },
    failure: "credentials-read",
    kind: "failed",
    recovery: "reconnect",
  });
  f.access.disconnect();
  f.adapter.generateRecoveryPhrase = async () => {
    throw Error("phrase");
  };
  assert.deepEqual(await f.access.generateRecoveryPhrase(), {
    failure: "phrase-generation",
    kind: "failed",
  });
});

void test("a completed approval releases admission before an observer submits a phrase", async () => {
  const f = fixture();
  let submitted: Promise<unknown> | undefined;
  f.access.subscribe(() => {
    if (
      f.access.getSnapshot().state.phase === AccessPhase.RecoveryPhrase &&
      !submitted
    ) {
      submitted = f.access.submitRecoveryPhrase("phrase");
    }
  });
  const approved = await f.access.authorize(AccessIntent.Create);
  assert.deepEqual(approved, { kind: "approved" });
  assert.ok(Object.isFrozen(approved));
  assert.deepEqual(await submitted, {
    credentials: "confirmed",
    kind: "ready",
  });
  assert.equal(f.counts().registrations, 1);
  f.access.dispose();
});

void test("a late begin cannot replace a newer approved connection", async () => {
  const f = fixture();
  const late = deferred<AccessConnection<TestSession>>();
  let retired = 0;
  let calls = 0;
  f.adapter.begin = () =>
    ++calls === 1 ? late.promise : Promise.resolve(f.connection);
  const first = f.access.authorize(AccessIntent.Create);
  f.access.cancel();
  assert.equal((await first).kind, "cancelled");
  assert.deepEqual(await f.access.authorize(AccessIntent.Existing), {
    kind: "approved",
  });
  const snapshot = f.access.getSnapshot();
  late.resolve({
    ...f.connection,
    dispose() {
      retired++;
    },
  });
  // The controller registered its begin continuation before this boundary wait.
  await late.promise;
  assert.equal(retired, 1);
  assert.equal(f.access.getSnapshot(), snapshot);
  assert.equal(f.counts().retired, 0);
  assert.deepEqual(await f.access.submitRecoveryPhrase("phrase"), {
    credentials: "confirmed",
    kind: "ready",
  });
  f.access.dispose();
});

void test("a save-failure observer can retry without changing the first command effects", async () => {
  let writes = 0;
  const f = fixture(
    credentialStore({
      async write() {
        if (++writes === 1) throw Error("unacknowledged write");
      },
    }),
  );
  let retry: Promise<unknown> | undefined;
  f.access.subscribe(() => {
    const state = f.access.getSnapshot().state;
    if (
      state.phase === AccessPhase.Failed &&
      state.failure === AccessFailure.CredentialsWrite &&
      !retry
    ) {
      retry = f.access.retrySave();
    }
  });
  await f.access.authorize(AccessIntent.Create);
  const failed = await f.access.submitRecoveryPhrase("phrase");
  assert.deepEqual(failed, {
    effects: { credentials: "write", registration: "registered" },
    failure: "credentials-write",
    kind: "failed",
    recovery: "save",
  });
  assert.deepEqual(await retry, { credentials: "confirmed", kind: "ready" });
  assert.ok(Object.isFrozen(failed));
  assert.ok("effects" in failed && Object.isFrozen(failed.effects));
  assert.equal(writes, 2);
  assert.equal(f.counts().registrations, 1);
  f.access.dispose();
});

void test("a reconnect cancelled behind a pending write never reads credentials at dispatch", async () => {
  const started = deferred<void>();
  const release = deferred<void>();
  let reads = 0;
  const f = fixture(
    credentialStore({
      async read() {
        reads++;
        return null;
      },
      async write() {
        started.resolve();
        await release.promise;
      },
    }),
  );
  await f.access.authorize(AccessIntent.Create);
  const save = f.access.submitRecoveryPhrase("phrase");
  await started.promise;
  f.access.disconnect();
  assert.deepEqual(await save, {
    effects: { credentials: "write", registration: "registered" },
    kind: "cancelled",
  });
  const reconnect = f.access.reconnect();
  f.access.cancel();
  assert.deepEqual(await reconnect, {
    effects: { credentials: "none", registration: "none" },
    kind: "cancelled",
  });
  release.resolve();
  await drainMicrotasks();
  assert.equal(reads, 0);
  assert.equal(f.access.getSnapshot().state.phase, AccessPhase.Disconnected);
  f.access.dispose();
});

for (const timeout of [2147483647, 2147483648, 4294967295, Number.MAX_VALUE]) {
  void test(`approval delay ${timeout} stays bounded and clears its continuation`, async (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const scheduled = t.mock.method(globalThis, "setTimeout");
    const cleared = t.mock.method(globalThis, "clearTimeout");
    const f = fixture();
    const approval = deferred<void>();
    f.connection.waitForApproval = () => approval.promise;
    const access = createSiaAccess({
      adapter: f.adapter,
      application: app,
      approvalTimeoutMs: timeout,
      indexerUrl: "https://indexer/",
    });
    t.after(() => access.dispose());
    const result = access.authorize(AccessIntent.Create);
    await drainMicrotasks();
    assert.equal(scheduled.mock.calls[0]?.arguments[1], 2147483647);
    t.mock.timers.tick(2147483647);
    await drainMicrotasks();
    if (timeout === 2147483647) {
      assert.equal((await result).kind, "failed");
    } else {
      assert.equal(
        access.getSnapshot().state.phase,
        AccessPhase.AwaitingApproval,
      );
      assert.equal(scheduled.mock.callCount(), 2);
      assert.equal(
        scheduled.mock.calls[1]?.arguments[1],
        Math.min(timeout - 2147483647, 2147483647),
      );
      access.cancel();
      assert.equal((await result).kind, "cancelled");
      await drainMicrotasks();
      assert.equal(
        cleared.mock.calls.at(-1)?.arguments[0],
        scheduled.mock.calls.at(-1)?.result,
      );
      t.mock.timers.tick(2147483647);
      approval.resolve();
      await drainMicrotasks();
      assert.equal(scheduled.mock.callCount(), 2);
      assert.equal(f.counts().retired, 1);
    }
  });
}

void test("approval continuation expires at the full delay and settles once", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const f = fixture();
  const approval = deferred<void>();
  f.connection.waitForApproval = () => approval.promise;
  const access = createSiaAccess({
    adapter: f.adapter,
    application: app,
    approvalTimeoutMs: 2147483648,
    indexerUrl: "https://indexer/",
  });
  t.after(() => access.dispose());
  const result = access.authorize(AccessIntent.Create);
  await drainMicrotasks();
  t.mock.timers.tick(2147483647);
  await drainMicrotasks();
  assert.equal(access.getSnapshot().state.phase, AccessPhase.AwaitingApproval);
  t.mock.timers.tick(1);
  await drainMicrotasks();
  assert.deepEqual(await result, {
    effects: { credentials: "none", registration: "none" },
    failure: "approval-timeout",
    kind: "failed",
    recovery: "authorize",
  });
  approval.resolve();
  await drainMicrotasks();
  assert.equal(f.counts().retired, 1);
  assert.equal((await result).kind, "failed");
});
