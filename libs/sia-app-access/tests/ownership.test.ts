/** Focused owners protect retirement, settlement and queued credential mutations. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { AccessResources, SessionUnavailableError } from "@/access-resources";
import { CommandCoordinator } from "@/command-scope";
import { CredentialQueue } from "@/credential-queue";
import { AccessEvent } from "@/access-machine";
import {
  AccessErrorCode,
  AccessFailure,
  AccessOutcome,
  AccessRecovery,
  CredentialEffect,
  RegistrationEffect,
} from "@/index";
import type { AccessApproved, AccessConnection } from "@/index";
import type { AccessCommand } from "@/command-scope";
import { deferred } from "./helpers/core-async.ts";

void test("a credential removal follows a write that commits then rejects without clearing borrowed bytes early", async () => {
  const started = deferred<void>();
  const release = deferred<void>();
  const events: string[] = [];
  const bytes = new Uint8Array(32).fill(9);
  const failure = Error("write reply lost");
  let reads = 0;
  const queue = new CredentialQueue(
    {
      async read() {
        reads++;
        return null;
      },
      async remove() {
        events.push("remove");
      },
      async write(_scope, input) {
        assert.equal(input, bytes);
        events.push("write");
        started.resolve();
        await release.promise;
        assert.equal(input[0], 9);
        events.push("committed");
        throw failure;
      },
    },
    { appId: "a".repeat(64), indexerUrl: "https://indexer/" },
  );
  const write = assert.rejects(
    queue.write(bytes),
    (error) => error === failure,
  );
  const removal = queue.remove();
  const cancelledRead = queue.read(() => false);
  await started.promise;
  assert.deepEqual(events, ["write"]);
  assert.equal(bytes[0], 9);
  release.resolve();
  await write;
  await removal;
  assert.equal(await cancelledRead, null);
  assert.equal(reads, 0);
  assert.deepEqual(events, ["write", "committed", "remove"]);
  assert.ok(bytes.every((value) => value === 0));
});

function quietCoordinator(): CommandCoordinator {
  return new CommandCoordinator(
    {
      commit() {
        return;
      },
      publish() {
        return;
      },
    },
    {
      retireConnection() {
        return;
      },
      retireSession() {
        return;
      },
    },
  );
}

void test("retirement denies new session work but waits for every admitted borrower", async () => {
  const resources = new AccessResources<number>();
  let disposed = 0;
  resources.installSession({
    dispose() {
      disposed++;
    },
    exportAppKey: () => new Uint8Array(32),
    value: 7,
  });
  const first = deferred<number>();
  const second = deferred<number>();
  let admitted = 0;
  const one = resources.run((value) => {
    assert.equal(value, 7);
    admitted++;
    return first.promise;
  });
  const two = resources.run((value) => {
    assert.equal(value, 7);
    admitted++;
    return second.promise;
  });
  assert.equal(admitted, 2);
  void resources.retire();
  assert.equal(disposed, 0);
  await assert.rejects(
    resources.run(() => 0),
    SessionUnavailableError,
  );
  first.resolve(1);
  assert.equal(await one, 1);
  assert.equal(disposed, 0);
  second.resolve(2);
  assert.equal(await two, 2);
  assert.equal(disposed, 1);
  void resources.retire();
  assert.equal(disposed, 1);
});

void test("retirement reports both connection and session cleanup failures", async () => {
  const connectionFailure = new Error("builder cleanup failed");
  const sessionFailure = new Error("session cleanup failed");
  const reported: unknown[] = [];
  const resources = new AccessResources<number>((error) =>
    reported.push(error),
  );
  resources.installConnection({
    approvalUrl: "https://approve.test",
    dispose: () => Promise.reject(connectionFailure),
    matchesExistingAppKey: () => Promise.resolve(false),
    register: () => Promise.reject(new Error("not registered")),
    waitForApproval: () => Promise.resolve(),
  });
  resources.installSession({
    dispose() {
      throw sessionFailure;
    },
    exportAppKey: () => new Uint8Array(32),
    value: 7,
  });

  await assert.rejects(
    resources.retire(),
    (error: unknown) =>
      error instanceof AggregateError &&
      error.errors.length === 2 &&
      error.errors[0] === connectionFailure &&
      error.errors[1] === sessionFailure,
  );
  assert.deepEqual(
    new Set(reported),
    new Set([connectionFailure, sessionFailure]),
  );
});

void test("independent access handles can share a client while each use retains its handle", async () => {
  const sdk = { read: () => "document" };
  const first = new AccessResources<typeof sdk>();
  const second = new AccessResources<typeof sdk>();
  const release = deferred<void>();
  let firstDisposed = 0;
  let secondDisposed = 0;
  first.installSession({
    dispose() {
      firstDisposed++;
    },
    exportAppKey: () => new Uint8Array(32),
    value: sdk,
  });
  const pending = first.run(async (value) => {
    assert.equal(value, sdk);
    await release.promise;
  });
  void first.retireSession();
  try {
    second.installSession({
      dispose() {
        secondDisposed++;
      },
      exportAppKey: () => new Uint8Array(32),
      value: sdk,
    });
    assert.equal(await second.run((value) => value.read()), "document");
    assert.equal(firstDisposed, 0);
    assert.equal(secondDisposed, 0);
  } finally {
    release.resolve();
    await pending;
  }
  assert.equal(firstDisposed, 1);
  assert.equal(secondDisposed, 0);
  void second.retireSession();
  assert.equal(secondDisposed, 1);
});

for (const borrowing of [false, true]) {
  void test(`installing over ${borrowing ? "a borrowed" : "an idle"} session preserves the existing owner`, async () => {
    const resources = new AccessResources<number>();
    const release = deferred<number>();
    let firstDisposed = 0;
    let secondDisposed = 0;
    resources.installSession({
      dispose() {
        firstDisposed++;
      },
      exportAppKey: () => new Uint8Array(32),
      value: 1,
    });
    const work = borrowing ? resources.run(() => release.promise) : undefined;
    const incoming = {
      dispose() {
        secondDisposed++;
      },
      exportAppKey: () => new Uint8Array(32),
      value: 2,
    };
    assert.throws(() => resources.installSession(incoming));
    assert.equal(await resources.run((value) => value), 1);
    assert.equal(firstDisposed, 0);
    assert.equal(secondDisposed, 0);
    void resources.retireSession();
    assert.equal(firstDisposed, borrowing ? 0 : 1);
    resources.installSession(incoming);
    assert.equal(await resources.run((value) => value), 2);
    release.resolve(7);
    if (work) assert.equal(await work, 7);
    assert.equal(firstDisposed, 1);
    assert.equal(secondDisposed, 0);
    void resources.retireSession();
    assert.equal(secondDisposed, 1);
  });
}

void test("installing over a connection preserves the existing owner", () => {
  const resources = new AccessResources<number>();
  let firstDisposed = 0;
  let secondDisposed = 0;
  const first: AccessConnection<number> = {
    approvalUrl: "https://approval.example/",
    dispose() {
      firstDisposed++;
    },
    matchesExistingAppKey: () => Promise.resolve(false),
    register: () => Promise.reject(new Error("Unexpected registration")),
    waitForApproval: () => Promise.resolve(),
  };
  const second = {
    ...first,
    dispose() {
      secondDisposed++;
    },
  };
  resources.installConnection(first);
  assert.throws(() => resources.installConnection(second));
  assert.equal(resources.connection, first);
  assert.equal(firstDisposed, 0);
  assert.equal(secondDisposed, 0);
  void resources.retireConnection();
  assert.equal(firstDisposed, 1);
  resources.installConnection(second);
  assert.equal(resources.connection, second);
  void resources.retireConnection();
  assert.equal(secondDisposed, 1);
});

void test("overlapping command admission preserves the active command until cancellation", async () => {
  const coordinator = quietCoordinator();
  let settled = 0;
  const first = coordinator.begin<AccessApproved>(() => {
    settled++;
  });
  first.registrationEffect = RegistrationEffect.Unknown;
  const effects = first.effects;
  assert.throws(() => coordinator.begin<AccessApproved>());
  assert.equal(first.current, true);
  assert.equal(first.effects, effects);
  assert.equal(settled, 0);
  coordinator.cancel();
  assert.deepEqual(await first.promise, {
    effects,
    kind: AccessOutcome.Cancelled,
  });
  assert.equal(settled, 1);
  const next = coordinator.begin<AccessApproved>();
  next.finish({ kind: AccessOutcome.Approved });
  assert.deepEqual(await next.promise, { kind: AccessOutcome.Approved });
});

void test("failure captures effects and releases its scope before reentrant publication", async () => {
  const events: string[] = [];
  let second: AccessCommand<AccessApproved> | undefined;
  const coordinator = new CommandCoordinator(
    {
      commit(event) {
        assert.equal(event.type, AccessEvent.Failed);
        events.push("publish");
        assert.equal(first.current, false);
        second = coordinator.begin<AccessApproved>();
      },
      publish() {
        return;
      },
    },
    {
      retireConnection() {
        events.push("connection");
      },
      retireSession() {
        events.push("session");
      },
    },
  );
  const first = coordinator.begin<AccessApproved>(() => events.push("settled"));
  first.registrationEffect = RegistrationEffect.Registered;
  first.fail(AccessFailure.Registration, AccessRecovery.Authorize);
  const result = await first.promise;
  assert.deepEqual(events, ["connection", "session", "settled", "publish"]);
  assert.deepEqual(result, {
    effects: { credentials: "none", registration: "registered" },
    failure: "registration",
    kind: "failed",
    recovery: "authorize",
  });
  first.registrationEffect = RegistrationEffect.None;
  assert.equal(first.registrationEffect, RegistrationEffect.Registered);
  assert.equal(
    result.kind === AccessOutcome.Failed && result.effects.registration,
    "registered",
  );
  assert.equal(Object.isFrozen(result), true);
  assert.ok(second?.current);
  first.fail(AccessFailure.Connection, AccessRecovery.Authorize);
  assert.deepEqual(events, ["connection", "session", "settled", "publish"]);
  coordinator.cancel();
  assert.equal((await second.promise).kind, "cancelled");
});

void test("save failure keeps its session available for internal recovery", async () => {
  const resources = new AccessResources<number>();
  let disposed = 0;
  resources.installSession({
    dispose() {
      disposed++;
    },
    exportAppKey: () => new Uint8Array(32).fill(9),
    value: 7,
  });
  const coordinator = new CommandCoordinator(
    {
      commit() {
        return;
      },
      publish() {
        return;
      },
    },
    resources,
  );
  const operation = coordinator.begin<AccessApproved>();
  operation.credentialEffect = CredentialEffect.Write;
  operation.registrationEffect = RegistrationEffect.Registered;
  operation.fail(AccessFailure.CredentialsWrite, AccessRecovery.Save, true);
  assert.deepEqual(await operation.promise, {
    effects: {
      credentials: CredentialEffect.Write,
      registration: RegistrationEffect.Registered,
    },
    failure: AccessFailure.CredentialsWrite,
    kind: AccessOutcome.Failed,
    recovery: AccessRecovery.Save,
  });
  assert.equal(resources.hasSession(), true);
  assert.equal(disposed, 0);
  assert.deepEqual(resources.exportAppKey(), new Uint8Array(32).fill(9));
  void resources.retire();
  assert.equal(disposed, 1);
});

void test("a command settles its promise before completion publication", async () => {
  const events: string[] = [];
  const coordinator = new CommandCoordinator(
    {
      commit() {
        void operation.promise.then(() => events.push("result"));
        queueMicrotask(() => events.push("publication"));
      },
      publish() {
        return;
      },
    },
    {
      retireConnection() {
        return;
      },
      retireSession() {
        return;
      },
    },
  );
  const operation = coordinator.begin<AccessApproved>();
  operation.finish(
    { kind: AccessOutcome.Approved },
    { type: AccessEvent.Approved },
  );
  await operation.promise;
  assert.deepEqual(events, ["result", "publication"]);
});

for (const failure of [new Error("application failed"), "application failed"]) {
  void test(`retirement waits for a borrower throwing ${typeof failure === "string" ? "a non-Error value" : "an Error"}`, async () => {
    const resources = new AccessResources<number>();
    let disposed = 0;
    resources.installSession({
      dispose() {
        disposed++;
      },
      exportAppKey: () => new Uint8Array(32),
      value: 7,
    });
    const result = resources.run(() => {
      void resources.retire();
      // Borrowers may throw non-Error values; retirement must preserve their identity.
      // oxlint-disable-next-line typescript/only-throw-error
      throw failure;
    });
    assert.equal(resources.hasSession(), false);
    assert.equal(disposed, 0);
    await assert.rejects(result, (error: unknown) => error === failure);
    assert.equal(disposed, 1);
  });
}

void test("invalid exported keys are cleared and unavailable sessions deny export", () => {
  const resources = new AccessResources<number>();
  assert.throws(() => resources.exportAppKey(), {
    code: AccessErrorCode.SiaSessionUnavailable,
  });
  const key = new Uint8Array(31).fill(9);
  resources.installSession({
    dispose() {
      return;
    },
    exportAppKey: () => key,
    value: 7,
  });
  assert.throws(() => resources.exportAppKey());
  assert.ok(key.every((byte) => byte === 0));
  void resources.retire();
  assert.throws(() => resources.exportAppKey(), SessionUnavailableError);
});

void test("phrase generators return independent frozen outcomes", async () => {
  const coordinator = quietCoordinator();
  const first = deferred<string>();
  const second = deferred<string>();
  const one = coordinator.generate(() => first.promise);
  const two = coordinator.generate(() => second.promise);
  assert.notEqual(one, two);
  second.resolve("second example phrase");
  const result = await two;
  assert.deepEqual(result, {
    kind: AccessOutcome.Generated,
    phrase: "second example phrase",
  });
  assert.ok(Object.isFrozen(result));
  first.resolve("first example phrase");
  assert.deepEqual(await one, {
    kind: AccessOutcome.Generated,
    phrase: "first example phrase",
  });
});

for (const action of ["begin", "cancel"]) {
  void test(`${action === "begin" ? "starting a command" : "cancellation"} retires pending phrase generators`, async () => {
    const coordinator = quietCoordinator();
    const first = deferred<string>();
    const second = deferred<string>();
    const one = coordinator.generate(() => first.promise);
    const two = coordinator.generate(() => second.promise);
    if (action === "begin") coordinator.begin<AccessApproved>();
    else coordinator.cancel();
    const cancelled = await one;
    assert.deepEqual(cancelled, { kind: AccessOutcome.Cancelled });
    assert.deepEqual(await two, { kind: AccessOutcome.Cancelled });
    assert.ok(Object.isFrozen(cancelled));
    first.resolve("late first phrase");
    second.resolve("late second phrase");
    await Promise.all([first.promise, second.promise]);
    assert.equal(await one, cancelled);
    coordinator.cancel();
  });
}

void test("phrase generation failures omit the thrown error", async () => {
  const coordinator = quietCoordinator();
  const result = await coordinator.generate(() => {
    throw new Error("private failure detail");
  });
  assert.deepEqual(result, {
    failure: AccessFailure.PhraseGeneration,
    kind: AccessOutcome.Failed,
  });
  assert.ok(Object.isFrozen(result));
});

void test("cancelled command closures cannot publish over a replacement", async () => {
  const events: string[] = [];
  const coordinator = new CommandCoordinator(
    {
      commit() {
        events.push("commit");
      },
      publish() {
        events.push("publish");
      },
    },
    {
      retireConnection() {
        return;
      },
      retireSession() {
        return;
      },
    },
  );
  const old = coordinator.begin<AccessApproved>();
  coordinator.cancel();
  const current = coordinator.begin<AccessApproved>();
  old.finish({ kind: AccessOutcome.Approved }, { type: AccessEvent.Approved });
  old.publish();
  assert.deepEqual(events, []);
  assert.equal(current.current, true);
  assert.equal((await old.promise).kind, AccessOutcome.Cancelled);
  current.finish(
    { kind: AccessOutcome.Approved },
    { type: AccessEvent.Approved },
  );
  assert.deepEqual(await current.promise, { kind: AccessOutcome.Approved });
  assert.deepEqual(events, ["commit"]);
});

void test("command effect snapshots reject mutation and ignore writes after cancellation", async () => {
  const coordinator = new CommandCoordinator(
    {
      commit() {
        return;
      },
      publish() {
        return;
      },
    },
    {
      retireConnection() {
        return;
      },
      retireSession() {
        return;
      },
    },
  );
  const op = coordinator.begin<AccessApproved>();
  const initial = op.effects;
  op.registrationEffect = RegistrationEffect.Unknown;
  op.credentialEffect = CredentialEffect.Write;
  assert.deepEqual(initial, { credentials: "none", registration: "none" });
  assert.ok(Object.isFrozen(initial));
  assert.equal(
    Reflect.set(op.effects, "credentials", CredentialEffect.Remove),
    false,
  );
  const dispatched = op.effects;
  coordinator.cancel();
  op.registrationEffect = RegistrationEffect.Registered;
  op.credentialEffect = CredentialEffect.Remove;
  assert.equal(op.effects, dispatched);
  assert.equal(op.registrationEffect, RegistrationEffect.Unknown);
  assert.equal(op.credentialEffect, CredentialEffect.Write);
  assert.deepEqual(await op.promise, {
    effects: { credentials: "write", registration: "unknown" },
    kind: "cancelled",
  });
});
