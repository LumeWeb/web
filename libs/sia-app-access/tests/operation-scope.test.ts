/** Access operation handles admit account work without granting another SDK disposer. */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  AccessFailure,
  AccessIntent,
  AccessOutcome,
  AccessPhase,
  createSiaAccess,
  SessionUnavailableError,
} from "@/index";
import { app, credentialStore, fixture } from "./helpers/core-fixture.ts";
import { deferred } from "./helpers/core-async.ts";

void test("an account scope drains admitted work after disconnect denies new work", async () => {
  const { access, counts } = fixture(
    credentialStore({ read: async () => new Uint8Array(32).fill(9) }),
  );
  assert.equal((await access.reconnect()).kind, AccessOutcome.Ready);
  const scope = access.openOperationScope();
  assert.deepEqual(Object.keys(scope).sort(), ["close", "closed", "run"]);
  let callbackArguments = 0;
  await scope.run((...args) => {
    callbackArguments = args.length;
  });
  assert.equal(callbackArguments, 1);
  const finish = deferred<void>();
  const work = scope.run(async (session) => {
    await finish.promise;
    return session.id;
  });
  const disconnected = access.disconnect();
  assert.equal(access.getSnapshot().state.phase, AccessPhase.Disconnected);
  assert.equal(counts().ended, 0);
  await assert.rejects(scope.run(() => 1));
  assert.throws(() => access.openOperationScope(), SessionUnavailableError);
  finish.resolve();
  assert.equal(await work, 7);
  await disconnected;
  await scope.closed;
  assert.equal(counts().ended, 1);
});

void test("disconnect waits for an admitted connection's pending native cleanup", async () => {
  const { access, connection } = fixture();
  const release = deferred<void>();
  connection.dispose = () => release.promise;
  assert.equal(
    (await access.authorize(AccessIntent.Create)).kind,
    AccessOutcome.Approved,
  );
  let complete = false;
  const cleanup = access.disconnect().then(() => {
    complete = true;
  });
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.equal(complete, false);
  release.resolve();
  await cleanup;
  assert.equal(complete, true);
});

void test("disconnect reports connection cleanup failure after retiring the connection", async () => {
  const failure = new Error("connection cleanup failed");
  const reported: unknown[] = [];
  const { adapter, connection } = fixture();
  const access = createSiaAccess({
    adapter,
    application: app,
    indexerUrl: "https://indexer/",
    onResourceError: (error) => reported.push(error),
  });
  connection.dispose = () => Promise.reject(failure);
  assert.equal(
    (await access.authorize(AccessIntent.Create)).kind,
    AccessOutcome.Approved,
  );
  await assert.rejects(
    access.disconnect(),
    (error: unknown) =>
      error instanceof AggregateError && error.errors[0] === failure,
  );
  assert.deepEqual(reported, [failure]);
  assert.equal(access.getSnapshot().state.phase, AccessPhase.Disconnected);
});

void test("a synchronous connection disposal failure still publishes disconnect", async () => {
  const failure = new Error("synchronous connection cleanup failed");
  const reported: unknown[] = [];
  const { adapter, connection } = fixture();
  const access = createSiaAccess({
    adapter,
    application: app,
    indexerUrl: "https://indexer/",
    onResourceError: (error) => reported.push(error),
  });
  connection.dispose = () => {
    throw failure;
  };
  assert.equal(
    (await access.authorize(AccessIntent.Create)).kind,
    AccessOutcome.Approved,
  );
  await assert.rejects(
    access.disconnect(),
    (error: unknown) =>
      error instanceof AggregateError && error.errors[0] === failure,
  );
  assert.equal(access.getSnapshot().state.phase, AccessPhase.Disconnected);
  assert.deepEqual(reported, [failure]);
  await access.dispose();
});

void test("a connection returned after disconnect reports its cleanup failure", async () => {
  const failure = new Error("late connection cleanup failed");
  const reported: unknown[] = [];
  const { adapter, connection } = fixture();
  const started = deferred<typeof connection>();
  adapter.begin = () => started.promise;
  connection.dispose = () => Promise.reject(failure);
  const access = createSiaAccess({
    adapter,
    application: app,
    indexerUrl: "https://indexer/",
    onResourceError: (error) => reported.push(error),
  });
  const authorization = access.authorize(AccessIntent.Create);
  await access.disconnect();
  started.resolve(connection);
  await authorization;
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.deepEqual(reported, [failure]);
});

void test("terminal disposal from disconnected prevents another reconnect", async () => {
  const { access } = fixture(
    credentialStore({ read: async () => new Uint8Array(32).fill(9) }),
  );
  await access.dispose();
  assert.equal(access.getSnapshot().state.phase, AccessPhase.Disposed);
  assert.equal((await access.reconnect()).kind, AccessOutcome.Unavailable);
});

void test("disposal reports a native failure after the last scoped operation finishes", async () => {
  const controlled = fixture();
  const failure = new Error("native cleanup failed");
  const issues: unknown[] = [];
  controlled.session.dispose = () => {
    throw failure;
  };
  const access = createSiaAccess({
    adapter: controlled.adapter,
    application: app,
    credentials: credentialStore({
      read: async () => new Uint8Array(32).fill(9),
    }),
    indexerUrl: "https://indexer/",
    onResourceError: (error) => issues.push(error),
  });
  await access.reconnect();
  const scope = access.openOperationScope();
  const finish = deferred<void>();
  const running = scope.run(async () => {
    await finish.promise;
  });
  const closing = access.dispose();
  assert.equal(access.getSnapshot().state.phase, AccessPhase.Disposed);
  assert.deepEqual(issues, []);
  finish.resolve();
  await running;
  await scope.closed;
  await assert.rejects(
    closing,
    (error) => error instanceof AggregateError && error.errors[0] === failure,
  );
  assert.deepEqual(issues, [failure]);
});

void test("active app keys are fresh copies only while ready", async () => {
  const { access } = fixture(
    credentialStore({ read: async () => new Uint8Array(32).fill(9) }),
  );
  assert.throws(() => access.copyActiveAppKeySeed(), SessionUnavailableError);
  assert.equal((await access.reconnect()).kind, AccessOutcome.Ready);
  const first = access.copyActiveAppKeySeed();
  const second = access.copyActiveAppKeySeed();
  assert.notEqual(first, second);
  first.fill(0);
  assert.equal(second[0], 9);
  assert.equal(access.activeAppKeyHex(), "09".repeat(32));
  await access.disconnect();
  assert.throws(() => access.copyActiveAppKeySeed(), SessionUnavailableError);
  assert.equal(access.activeAppKeyHex(), null);
});

void test("a key exported during reentrant disconnect is not returned as active", async () => {
  const store = credentialStore({
    read: async () => new Uint8Array(32).fill(9),
  });
  const first = fixture(store);
  const second = fixture(store);
  await first.access.reconnect();
  await second.access.reconnect();
  const firstBytes = new Uint8Array(32).fill(9);
  first.session.exportAppKey = () => {
    void first.access.disconnect();
    return firstBytes;
  };
  assert.throws(
    () => first.access.copyActiveAppKeySeed(),
    SessionUnavailableError,
  );
  assert.equal(firstBytes[0], 0);
  const secondBytes = new Uint8Array(32).fill(9);
  second.session.exportAppKey = () => {
    void second.access.disconnect();
    return secondBytes;
  };
  assert.equal(second.access.activeAppKeyHex(), null);
  assert.equal(secondBytes[0], 0);
});

void test("a reconnect returns its credential read error without publishing it", async () => {
  const failure = new Error("vault password rejected");
  const { access } = fixture(
    credentialStore({
      read: async () => {
        throw failure;
      },
    }),
  );
  const result = await access.reconnect();
  assert.equal(result.kind, AccessOutcome.Failed);
  if (result.kind !== AccessOutcome.Failed) return;
  assert.equal(result.failure, AccessFailure.CredentialsRead);
  assert.equal(result.cause, failure);
  assert.equal(access.getSnapshot().state.phase, AccessPhase.Failed);
  assert.equal("cause" in access.getSnapshot().state, false);
});

void test("active session identity is distinct across controllers and absent after disconnect", async () => {
  const first = fixture(
    credentialStore({ read: async () => new Uint8Array(32).fill(9) }),
  );
  const second = fixture(
    credentialStore({ read: async () => new Uint8Array(32).fill(9) }),
  );
  assert.equal(first.access.getSnapshot().activeSessionId, null);
  await first.access.reconnect();
  await second.access.reconnect();
  const a = first.access.getSnapshot().activeSessionId;
  const b = second.access.getSnapshot().activeSessionId;
  assert.equal(typeof a, "string");
  assert.notEqual(a, b);
  await first.access.disconnect();
  assert.equal(first.access.getSnapshot().activeSessionId, null);
  await second.access.dispose();
});
