/** Adapter ownership tests use a controlled SDK, not actual native allocations. */
import { registerHooks } from "node:module";
import { test } from "node:test";
import assert from "node:assert/strict";
import { configure, events } from "./helpers/controlled-sdk.ts";
import { deferred } from "./helpers/core-async.ts";
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "@siafoundation/sia-storage/wasm")
      return {
        shortCircuit: true,
        url: new URL("./helpers/controlled-sdk.ts", import.meta.url).href,
      };
    if (specifier === "@siafoundation/sia-storage")
      throw Error("optional native facade absent");
    return next(specifier, context);
  },
});
const { createSiaAdapter } = await import("@/sia");
const scope = { appId: "a".repeat(64), indexerUrl: "https://indexer.test/" };
const application = {
  appId: scope.appId,
  description: "",
  name: "Test",
  serviceUrl: "https://app.test",
};

void test("validation separates invalid input from initialization failure", async () => {
  configure({ initFails: true });
  const adapter = createSiaAdapter();
  await assert.rejects(adapter.validateRecoveryPhrase("bad"), /asset/);
  configure();
  assert.equal(await adapter.validateRecoveryPhrase("bad"), "invalid");
  assert.equal(await adapter.validateRecoveryPhrase("valid phrase"), "valid");
});
void test("retirement waits for pending approval and denies later calls", async () => {
  configure();
  const connection = await createSiaAdapter().begin(scope, application);
  let release!: () => void;
  configure({
    pending: () =>
      new Promise<void>((resolve) => {
        release = resolve;
      }),
  });
  const approval = connection.waitForApproval();
  await Promise.resolve();
  connection.dispose();
  assert.equal(events.includes("builder:free"), false);
  release();
  await approval;
  assert.equal(events.filter((e) => e === "builder:free").length, 1);
  await assert.rejects(connection.register("valid phrase"));
});
void test("late registration transfers session ownership and export releases its temporary key", async () => {
  configure();
  const connection = await createSiaAdapter().begin(scope, application);
  await connection.waitForApproval();
  let release!: () => void;
  configure({
    pending: () =>
      new Promise<void>((resolve) => {
        release = resolve;
      }),
  });
  const registration = connection.register("valid phrase");
  await Promise.resolve();
  connection.dispose();
  assert.equal(events.includes("builder:free"), false);
  release();
  const resource = await registration;
  assert.equal(events.includes("sdk:free"), false);
  assert.deepEqual(resource.exportAppKey(), new Uint8Array(32).fill(7));
  assert.equal(events.filter((e) => e === "key:free").length, 1);
  resource.dispose();
  resource.dispose();
  assert.equal(events.filter((e) => e === "sdk:free").length, 1);
  assert.throws(() => resource.exportAppKey());
});
void test("reconnect retains builder and imported key until its call settles", async () => {
  const started = deferred<void>();
  let release!: () => void;
  configure({
    pending: () =>
      new Promise<void>((resolve) => {
        release = resolve;
        started.resolve();
      }),
  });
  const reconnect = createSiaAdapter().reconnect(
    scope,
    application,
    new Uint8Array(32),
  );
  await started.promise;
  assert.equal(events.includes("key:free"), false);
  assert.equal(events.includes("builder:free"), false);
  release();
  const resource = await reconnect;
  assert.equal(events.filter((e) => e === "builder:free").length, 1);
  assert.equal(events.filter((e) => e === "key:free").length, 1);
  resource?.dispose();
});
void test("failed registration consumes and frees the connection once", async () => {
  configure();
  const connection = await createSiaAdapter().begin(scope, application);
  await connection.waitForApproval();
  const failure = new Error("registration response lost");
  configure({ pending: () => Promise.reject(failure) });
  await assert.rejects(
    connection.register("valid phrase"),
    (error: unknown) => error === failure,
  );
  assert.equal(events.filter((event) => event === "builder:free").length, 1);
  assert.equal(events.includes("sdk:free"), false);
  await assert.rejects(
    connection.register("valid phrase"),
    /Connection unavailable/,
  );
  connection.dispose();
  assert.equal(events.filter((event) => event === "builder:free").length, 1);
});

void test("failed reconnect releases the imported key and builder", async () => {
  const failure = new Error("reconnect failed");
  configure({ pending: () => Promise.reject(failure) });
  await assert.rejects(
    createSiaAdapter().reconnect(scope, application, new Uint8Array(32)),
    (error: unknown) => error === failure,
  );
  assert.equal(events.filter((event) => event === "builder:free").length, 1);
  assert.equal(events.filter((event) => event === "key:free").length, 1);
});

void test("a pending phrase match blocks other calls and delays retirement", async () => {
  configure();
  const connection = await createSiaAdapter().begin(scope, application);
  await connection.waitForApproval();
  const pending = deferred<void>();
  configure({ pending: () => pending.promise });
  const match = connection.matchesExistingAppKey("valid phrase");
  await Promise.resolve();
  await assert.rejects(
    connection.register("valid phrase"),
    /Connection unavailable/,
  );
  connection.dispose();
  assert.equal(events.includes("builder:free"), false);
  pending.resolve();
  assert.equal(await match, true);
  assert.equal(events.filter((event) => event === "builder:free").length, 1);
  await assert.rejects(
    connection.matchesExistingAppKey("valid phrase"),
    /Connection unavailable/,
  );
});
test.after(() => hooks.deregister());
