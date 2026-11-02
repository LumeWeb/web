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

### Model controls

The default model exposes an immediate, append-only mutation history. Use `createIndexdModel({ eventPublication: "manual", now })` to drive publication with a caller-owned clock and `model.publishObjectEvents()`. No timer or background job is started.

Manual mode keeps one pending row per object. A mutation hides that object's previous published row until publication assigns a new cursor position. Each call publishes at most 25000 pending rows, ordered by account creation order and then object key. All rows in a batch receive the clock's current whole second. The publication second must advance across the entire model, including across accounts; repeated calls in the same second or after a clock rollback leave rows pending. An idle call does not consume its second.

Manual checkpoints use model version 2 and preserve pending rows with the last publication second. Default checkpoints remain version 1. Restoring a checkpoint keeps its publication mode; pass `now` again to supply the new clock. Payload bytes remain readable independently of whether their object event has been published.

Connection requests remain pending until `model.approveConnection(id, connectKey)` approves them. `model.rejectConnection(id)` removes a request, including an approved request that has not registered. HTTP clients can send `{ "approve": false }` to its response URL with Basic authentication. Polling then returns HTTP 404, which SDK 0.1.4 reports as user rejection. Registration also returns HTTP 404. Bodyless Basic approval remains supported for existing fixture clients.

`model.trackSlabPins(accountId)` creates a caller-owned tracker. Pass current identities from `slabIdentity()` to `watch(identity)`; model pin removals, including reset, queue those identities for `takeRetired()` to drain. `forget(identity)` removes both the watch and any queued retirement. The model holds queue state weakly, and checkpoints do not store it. Payload SDK caches use these queues to collect direct model deletions during subsequent SDK deletion without inspecting live uploads.

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

The mock implements the `object`/ranged `download` interface used by streaming consumers. Its upload and pin methods are fixture operations; it does not implement the entire storage SDK. Uploaded bytes are copied, and each download returns detached chunks. Resetting the model or removing a slab pin invalidates its cached payload, even when the same slab ID is pinned again. Uploads become visible to `object()` and the model's event stream after pinning. Deletion removes the object record and its sharing attachments. Only slabs no longer referenced by another object in the same account are unpinned; unrelated unfinished uploads remain available until pruning. A deleted object can be repinned while a sibling keeps its slab pinned, but its sharing attachments do not return.

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

Remote downloads return a stream before fetch receives response headers. Cancelling the stream aborts its fetch, including work held before headers; HTTP download errors surface through stream reads.

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

Create a new listener with `mockNetwork: restored` and configure its client bindings again. Checkpoints retain pinned and uploaded-but-unpinned payloads. They also retain event history and pending approvals. Deleted payloads survive a checkpoint only while another object in the account keeps their slab pinned. Deleting the last reference invalidates retained payload handles.

`model.serialize()` and `createIndexdModel({ state })` provide the same checkpoint behavior for control-plane-only fixtures. `model.snapshot()` remains an account summary. Publication mode is restored alongside host and quota settings; conflicting replacement settings are rejected. Pass `now` again when restoring a controlled clock. A network snapshot cannot replace a caller-supplied `model`.

Clocks and in-flight calls are not stored. Fault rules, device outages and request inspection history start fresh. A checkpoint captures stored data at the call to `serialize()`; it does not save later mutations or provide automatic crash recovery. Wait for operations to finish or cancel them before stopping the listener and writing a checkpoint.

Payloads are base64-encoded in JSON, without encryption. Keep checkpoint files private and use disposable fixture data. Invalid versions, inconsistent slab ownership and malformed payload encodings are rejected during restore. Settings that JSON would silently change, such as nonfinite numbers, are rejected during serialization.

These mocks perform no encryption, host RPCs or payments, and their object handles are test values rather than cryptographic seals.

## Limits

The emulator checks signed-query encoding, expiry and caller scope, not cryptographic signatures. Approval credentials are opaque and approved connection secrets are placeholders. Indexd routes exposed by HTTP and MSW do not implement host transfers or issue usable host tokens. The mock SDK transfers fixture bytes through its separate payload routes.

Payload uploads allocate a separate synthetic slab for each object. Packed-object fixtures can pin multiple model objects to the same slab explicitly; the adapter does not implement the SDK's packed upload format. Default event history appends each mutation immediately. Manual publication models event coalescing and whole-second cursor positions. Publication runs synchronously; PostgreSQL writer locks and skipped locked rows are not simulated.

The model's `quotaBytes` budget counts unique referenced slabs using supplied slab sizes. Fixed account-limit fields do not reproduce service funding or redundancy accounting. Seeded object IDs and envelopes are opaque test data, not proof of valid SDK encryption.

## Repository checks

From `libs/sia-testing`, with dependencies installed. Before building, run `pnpm --filter=@lumeweb/tsdown-config build:config` to build the shared configuration package.

- `pnpm test`, `pnpm check-types`, `pnpm lint`: package checks.
- `pnpm test:browser`: offline browser/MSW and worker checks; requires Chromium.
- `pnpm test:native:helpers`, `pnpm test:native:control`: installed native SDK checks.
- `pnpm test:package`: built tarball consumers and import boundaries.
- `pnpm test:mutation`: compiler mutations checked through Vitest in a temporary copy.

These commands need no cluster.

## Packed playback consumers

The video library and demo use HTTP payload mocks in their `tests/playback`
pages. `node scripts/check-consumers.mjs` checks those pages against offline
tarballs of both libraries using public imports, types, page builds, lint and
safe Playwright collection. It also checks that the packed video-library
worker setup accepts a custom composition without installing a default listener.
Build this package and `@lumeweb/tsdown-config` first. The checker does not start
a browser or touch a live service. Mock playback does not establish real-SDK
compatibility; the video library provides a separate opt-in read-only SDK check.
