/** Credential copies keep caller-owned bytes and scoped records independent. */
import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { test } from "node:test";
import { createMemoryCredentialStore } from "@/index";
import { normalizeScope } from "@/credentials";

void test("memory credentials copy retained writes and returned reads", async () => {
  const store = createMemoryCredentialStore();
  const scope = { appId: "a".repeat(64), indexerUrl: "https://one/" };
  const bytes = new Uint8Array([1, 2]);
  await store.write(scope, bytes);
  bytes.fill(0);
  const read = await store.read(scope);
  assert.deepEqual(read, new Uint8Array([1, 2]));
  assert.ok(read);
  read.fill(0);
  assert.deepEqual(await store.read(scope), new Uint8Array([1, 2]));
});

void test("memory credentials copy Buffer inputs and returned reads", async () => {
  const store = createMemoryCredentialStore();
  const scope = { appId: "a".repeat(64), indexerUrl: "https://one/" };
  const bytes = Buffer.from([0, 1, 2, 0]).subarray(1, 3);
  await store.write(scope, bytes);
  bytes.fill(0);
  const read = await store.read(scope);
  assert.ok(read);
  assert.deepEqual(Array.from(read), [1, 2]);
  read.fill(0);
  const retained = await store.read(scope);
  assert.ok(retained);
  assert.deepEqual(Array.from(retained), [1, 2]);
});

void test("memory credentials isolate application IDs and indexer URLs", async () => {
  const store = createMemoryCredentialStore();
  const first = { appId: "a".repeat(64), indexerUrl: "https://one/" };
  const indexer = { ...first, indexerUrl: "https://two/" };
  const application = { ...first, appId: "b".repeat(64) };
  assert.equal(await store.read(first), null);
  await store.write(first, new Uint8Array([1]));
  await store.write(indexer, new Uint8Array([2]));
  await store.write(application, new Uint8Array([3]));
  await store.remove(first);
  assert.equal(await store.read(first), null);
  assert.deepEqual(await store.read(indexer), new Uint8Array([2]));
  assert.deepEqual(await store.read(application), new Uint8Array([3]));
  await store.clear();
  assert.equal(await store.read(indexer), null);
  assert.equal(await store.read(application), null);
});

void test("memory store instances do not share credentials", async () => {
  const first = createMemoryCredentialStore();
  const second = createMemoryCredentialStore();
  const scope = { appId: "a".repeat(64), indexerUrl: "https://one/" };
  await first.write(scope, new Uint8Array([1]));
  assert.equal(await second.read(scope), null);
});

void test("memory writes report copy errors through their returned promise", async () => {
  const store = createMemoryCredentialStore();
  const scope = { appId: "a".repeat(64), indexerUrl: "https://one/" };
  const buffer = new ArrayBuffer(32);
  const bytes = new Uint8Array(buffer);
  structuredClone(buffer, { transfer: [buffer] });
  await assert.rejects(store.write(scope, bytes), TypeError);
});

void test("scope normalization canonicalizes valid identities and freezes the result", () => {
  const scope = normalizeScope("A".repeat(64), "HTTPS://EXAMPLE.COM:443/path");
  assert.deepEqual(scope, {
    appId: "a".repeat(64),
    indexerUrl: "https://example.com/path",
  });
  assert.ok(Object.isFrozen(scope));
  assert.deepEqual(normalizeScope("b".repeat(64), "https://example.com"), {
    appId: "b".repeat(64),
    indexerUrl: "https://example.com/",
  });
});

void test("scope normalization rejects unsafe URLs and malformed application IDs", () => {
  for (const url of [
    "not a URL",
    "ftp://x",
    "https://u:p@x",
    "https://u@x",
    "https://x?q=1",
    "https://x/#frag",
    "https://x?",
    "https://x#",
  ])
    assert.throws(() => normalizeScope("a".repeat(64), url), TypeError);
  for (const appId of ["", "a".repeat(63), "a".repeat(65), "g".repeat(64)])
    assert.throws(
      () => normalizeScope(appId, "https://example.com/"),
      TypeError,
    );
});
