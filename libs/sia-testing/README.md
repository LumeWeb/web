# `@lumeweb/sia-testing`

Deterministic Indexd fixtures and payload mocks for Sia Storage SDK consumers. SDK compatibility tests use `@siafoundation/sia-storage` 0.1.4.

## Imports

| Export | Purpose |
| --- | --- |
| `/fixtures` | Account, object, slab, host and sharing fixtures |
| `/model` | In-memory accounts, objects and sharing state |
| `/msw` | Request handlers for MSW |
| `/msw/node` | MSW Node server with model access and reset |
| `/http` | Node HTTP adapter |
| `/sdk` | Payload SDK mocks, fetch clients and device fault controls |
| `/e2e/node` | Guarded disposable account provisioning for consumer-owned tests |

MSW is an optional peer, required only by its adapters. Fixtures and model imports need neither MSW nor the SDK. Imports do not start servers or interception.

## Model tests

```ts
import { expect, test } from "vitest";
import { createIndexdModel } from "@lumeweb/sia-testing/model";

test("keeps an object private to its owner", () => {
  const model = createIndexdModel();
  const owner = model.createAccount({ publicKey: "owner" });
  const other = model.createAccount({ publicKey: "other" });
  model.seedObject(owner.id, { id: "example" });

  expect(model.object(owner.id, "example")).toEqual({ id: "example" });
  expect(model.object(other.id, "example")).toBeUndefined();
});
```

## MSW setup

```ts
import { afterAll, afterEach, beforeAll } from "vitest";
import { createIndexdServer } from "@lumeweb/sia-testing/msw/node";

export const server = createIndexdServer({ baseUrl: "http://indexd.test" });
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  server.reset();
});
afterAll(() => server.close());
```

`server.model` exposes the backing model. `reset()` clears model state; `resetHandlers()` removes MSW overrides.

For browser tests, pass `createIndexdHandlers(options).handlers` to MSW's `setupWorker`. Start MSW before constructing SDK clients or application workers, and terminate those workers before stopping MSW. SDK WASM assets and its streaming service worker still need their normal application setup.

## Payload SDK mocks

```ts
import { createMockNetwork } from "@lumeweb/sia-testing/sdk";

const network = createMockNetwork();
const account = network.model.createAccount({ publicKey: "test-account" });
const uploader = network.createSdk({ accountId: account.id, device: "uploader" });
const reader = network.createSdk({ accountId: account.id, device: "reader" });
const object = await uploader.upload(new Uint8Array([10, 20, 30]), { id: "video" });
await uploader.pinObject(object);
const stream = await reader.download(await reader.object("video"), {
  length: 2,
  offset: 1,
});
const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
```

The mock implements the `object`/ranged `download` interface used by streaming consumers. Its upload and pin methods are fixture operations; it does not implement the entire storage SDK. Uploaded bytes are copied, and each download returns detached chunks. Uploads become visible to `object()` and the model's event stream after pinning. Deletion removes the object record; pruning then releases unreferenced payloads.

`network.control` can take a device offline, add finite operation faults, or hold matching operations until the returned release function is called. `setConditions` configures latency and shared upload/download rates through `uploadBytesPerSecond` and `downloadBytesPerSecond`; zero disables pacing. Rate changes affect newly scheduled transfers. Cancelling a download releases its pending transfer and records the delivered byte count.

`requests()` returns detached request records. History keeps 256 records by default; `requestLimit` changes that bound. Downloads use pull-based 64 KiB chunks by default; `chunkBytes` changes that size. `seedObject(accountId, id, bytes)` supplies a pinned payload without passing through device faults.

Every SDK operation accepts an optional `signal`; download options and upload options carry that signal alongside their other fields. Cancellation releases pending holds, latency timers and transfer reservations. A hold's release function still controls other matching calls.

### Shared HTTP payloads

The existing HTTP adapter can serve the same network to separate app processes:

```ts
import { createIndexdHttpServer } from "@lumeweb/sia-testing/http";
import { createRemoteMockSdk } from "@lumeweb/sia-testing/sdk";

const server = createIndexdHttpServer({
  mockClients: {
    phone: { accountId: account.id, device: "phone" },
  },
  mockNetwork: network,
});
const { port } = await server.listen();
const phone = createRemoteMockSdk({
  client: "phone",
  url: `http://127.0.0.1:${port}`,
});
try {
  const stream = await phone.download(await phone.object("video"));
  await new Response(stream).arrayBuffer();
} finally {
  await server.close();
}
```

Pass the URL and client name to an app process instead of constructing `phone` in the server process. Client names select identities configured by the server; HTTP requests cannot override the bound account or device. Names are fixture selectors, not secret credentials. Use this server only with disposable test data.

Mock routes live under `/mock-sdk/`, separate from the Indexd API. The server and payload network share one model. Device faults leave direct `network.control` and model inspection available to the test driver. Downloads stream without collecting their bodies in the server, and socket closure cancels pending SDK work. Request byte counts describe bytes emitted by the server's mock SDK, not proof that a remote app consumed them.

Uploads retain the HTTP adapter's 1 MiB body limit by default. Set `maxBodyBytes` explicitly for larger fixtures. Closing the server aborts pending mock operations; clients own their streams and should consume or cancel them before teardown.

### Restart checkpoints

`network.serialize()` returns a versioned JSON checkpoint containing payload bytes and model data. The caller owns storage; no files are opened automatically and no database is required. After stopping the HTTP listener, a Node test driver can save and restore it:

```ts
import { readFile, writeFile } from "node:fs/promises";

await writeFile(checkpointPath, network.serialize(), { mode: 0o600 });
const restored = createMockNetwork({
  state: await readFile(checkpointPath, "utf8"),
});
```

Create a new listener with `mockNetwork: restored` and configure its client bindings again. Checkpoints retain pinned and uploaded-but-unpinned payloads. They also retain event history and pending approvals. Object deletion continues to leave bytes available until pruning.

`model.serialize()` and `createIndexdModel({ state })` provide the same checkpoint behavior for control-plane-only fixtures. `model.snapshot()` remains an account summary. Saved host settings and quota limits are restored; conflicting replacement settings are rejected. Pass `now` again when restoring a controlled clock. A network snapshot cannot replace a caller-supplied `model`.

Clocks and in-flight calls are not stored. Fault rules, device outages and request inspection history start fresh. A checkpoint captures stored data at the call to `serialize()`; it does not save later mutations or provide automatic crash recovery. Wait for operations to finish or cancel them before stopping the listener and writing a checkpoint.

Payloads are base64-encoded in JSON, without encryption. Keep checkpoint files private and use disposable fixture data. Invalid versions, inconsistent slab ownership and malformed payload encodings are rejected during restore. Settings that JSON would silently change, such as nonfinite numbers, are rejected during serialization.

These mocks perform no encryption, host RPCs or payments, and their object handles are test values rather than cryptographic seals.

## Limits

The emulator checks signed-query encoding, expiry and caller scope, not cryptographic signatures. Approval credentials are opaque and approved connection secrets are placeholders. Indexd routes exposed by HTTP and MSW do not implement host transfers or issue usable host tokens. The mock SDK transfers fixture bytes through its separate payload routes.

The model's `quotaBytes` budget counts unique referenced slabs using supplied slab sizes. Fixed account-limit fields do not reproduce service funding or redundancy accounting. Seeded object IDs and envelopes are opaque test data, not proof of valid SDK encryption.

## Repository checks

From `libs/sia-testing`, with dependencies installed. Before building, run `pnpm --filter=@lumeweb/tsdown-config build:config` to build the shared configuration package.

- `pnpm test`, `pnpm check-types`, `pnpm lint`: package and harness checks.
- `pnpm test:browser`: offline browser/MSW and worker checks; requires Chromium.
- `pnpm test:native:helpers`, `pnpm test:native:control`: installed native SDK checks.
- `pnpm test:package`: built tarball consumers and import boundaries.
- `pnpm test:mutation`: compiler mutations checked through Vitest in a temporary copy.

These commands need no cluster.

## Cluster E2E tests

Browser and native SDK payload tests use an explicitly supplied disposable cluster. See the [E2E maintainer guide](https://github.com/LumeWeb/web/blob/develop/libs/sia-testing/docs/e2e.md) for consent, service prerequisites and private cleanup records.

## Guarded consumer E2E tests

`@lumeweb/sia-testing/e2e/node` provisions disposable accounts for your own SDK page or native client. It has no SDK, Vite, Playwright, Vitest or MSW runtime dependency. The package does not serve a browser probe or configure your SDK assets, browser certificates or test runner.

Live runs require Node 24 on Linux and Python 3 with `flock`, subreaper and pidfd support. Supply an already running disposable loopback service with 30 hostd, one Indexd and no renterd. Preflight checks the process identity, synced recent chain tip, expected height, upload-ready hosts and storage reserve. The executable never starts, mines, restarts or stops services.

Set these values privately in the environment before a separately authorized live run:

| Variables | Required values |
| --- | --- |
| `SIA_TEST_ALLOW_MUTATION` | `1`, explicit consent to disposable mutations |
| `SIA_TEST_INDEXD_URL`, `SIA_TEST_ADMIN_URL` | HTTP(S) loopback app/admin URLs without embedded credentials |
| `SIA_TEST_ADMIN_PASSWORD` | Admin password, kept in Node |
| `SIA_TEST_STORAGE_PATH` | Absolute filesystem path holding host volumes |
| `SIA_TEST_CLUSTER_URL`, `SIA_TEST_CHAIN_HEIGHT` | Loopback cluster API and expected height |
| `SIA_TEST_CLUSTER_PID`, `SIA_TEST_CLUSTER_UID`, `SIA_TEST_CLUSTER_START_TICKS` | Selected process PID, UID and Linux start ticks |
| `SIA_TEST_CLUSTER_BINARY`, `SIA_TEST_CLUSTER_SHA256`, `SIA_TEST_CLUSTER_STATE` | Canonical executable path, lowercase binary hash and exact `-dir` path |

Run your own executable with an argument array, in an explicit consumer directory:

```sh
sia-testing-e2e --help
sia-testing-e2e --cwd "$PWD" -- node ./node_modules/@playwright/test/cli.js test
```

Help requires no consent or deployment configuration. Direct API mutation requires real consent and a verified inherited kernel lease from the executable. An environment flag alone cannot grant that lease. All participating writers must use `/tmp/sia-testing-exclusive-cluster.lock`.

In your Node test, your page owns its SDK, handles and streams. Its registration method returns the SDK's account public key, separately from its funding wait:

```ts
import { randomBytes } from "node:crypto";
import { readE2EService, withDisposableAccount } from "@lumeweb/sia-testing/e2e/node";

const service = readE2EService(process.env);
await withDisposableAccount({
  service,
  appID: randomBytes(32).toString("hex"),
  fundTargetBytes: 67_108_864,
}, async (account) => {
  try {
    // consumerPage is your own SDK page adapter, not a package-provided API.
    const responseURL = await consumerPage.request(service.indexdURL.toString(), account.appID);
    await account.approve(responseURL);
    const { accountKey } = await consumerPage.register();
    await account.recordAccountKey(accountKey);
    await consumerPage.waitForFunding();
    await consumerPage.checkYourApplication();
  } finally {
    await consumerPage.close();
  }
});
```

Await `recordAccountKey` immediately after registration, before any funding wait or test work. It atomically records the acknowledged `ed25519:` account identity in private recovery storage. Approval accepts only an owned `/auth/connect/...` URL on the selected app origin; the connect credential never reaches the page. `fundTargetBytes` is explicit; use `0` for metadata-only accounts.

Close browser/native resources before the callback returns. The helper attempts each independent exact-owned cleanup phase and preserves callback and cleanup errors. A failed pre-delete recovery write prevents that resource's DELETE, while later eligible phases still run. Uncertain registration, an unacknowledged record write or failed cleanup retains private recovery data under `/tmp/sia-native-cutoff-run-*`. Missing account identity is not proof that registration did not happen.

The executable retains the kernel lock through owned descendant teardown, account cleanup and postflight. Child output is private and capped at 8 MiB. Failed runs retain `/tmp/sia-e2e-run-*` diagnostics. Review exact retained records privately; do not publish credentials or raw SDK output, discover-and-delete other resources, or kill a guardian to force lock release. Successful deletion does not prove that host sectors were reclaimed.

Consumer-owned examples live in `libs/sia-video-source/tests/e2e` and
`apps/sia-video-demo/tests/e2e` in this repository. They import only the public
`@lumeweb/sia-testing/e2e/node` operations for account authority, and call their
own production APIs in their own pages. They are not package scenarios or
published test-page helpers. `node scripts/check-consumers.mjs` (after building `@lumeweb/tsdown-config` and `@lumeweb/sia-testing`) checks actual
offline tarballs in copied consumers, including public imports, types, page
builds, lint and safe collection. Build this package and `@lumeweb/tsdown-config`
first. The checker does not start a browser or touch a live service.
