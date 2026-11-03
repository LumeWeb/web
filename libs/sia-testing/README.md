# Sia testing

Managed mock runs provide fixture objects and sharing keys without a Sia server. A run owns its resources and closes retained readers when its callback ends. HTTP and MSW use the same backend as in-process readers. Managed `run.objects.upload` uploads and pins the fixture before returning. It does not model separate application upload, pin or publication stages.

Node runs can also use an existing server through an owner-only external profile and explicit consent. [Live runs](docs/live-runs.md) journal fixture ownership and recover known resources without account-wide pruning. Nonempty live transfers and browser compatibility have not been verified.

## Node runs

```ts
import { bytesFixture } from "@lumeweb/sia-testing/mock";
import { withSiaRun } from "@lumeweb/sia-testing/node";

const result = await withSiaRun({
  backend: {
    kind: "mock",
    app: {
      id: "a".repeat(64),
      name: "Video tests",
      description: "Owned video fixtures",
      serviceUrl: "https://example.invalid",
    },
  },
}, async (run) => {
  const file = await bytesFixture({ name: "fixture", bytes: Uint8Array.of(1, 2) });
  const object = await run.objects.upload({ file, name: file.name, metadata: new Uint8Array() });
  const share = await run.shares.create({ objects: [object] });
  const reader = run.mock.reader({ access: share.access, as: run.mock.actor("recipient") });
  return (await reader.object(object.id)).sizeBytes;
});

console.log(result.value, result.summary.cleanup);
```

`fileFixture(path)` streams a local file and records its digest. Upload rejects a changed file rather than accepting bytes that differ from the descriptor. File descriptors are limited to 16 MiB. A mock run defaults to 8 object reservations, 8 share reservations and 16 MiB of logical uploads; deleting an object does not refund these allowances.

Object and share handles belong to their run. Copied handles and handles from another run cannot mutate resources. Recipient reads check the supplied key and current attachments. Revocation affects fresh lookups; it cannot remove plaintext an application already downloaded.

## Application transports

- `/mock` creates portable backends and byte fixtures.
- `/client` provides fetch-backed readers, owner-share inspection and mock sign-in.
- `/http` starts an owned loopback listener over an existing mock.
- `/msw` intercepts an explicit base URL over an existing mock.
- `/node` manages callback lifetimes and local file descriptors.
- `/playwright` gives each browser binding a fresh private context.

`endpoint.connection({ access, as })` materializes a fake mock credential for an application adapter. Pass the application's current credential to `createMockReader`; a recipient endpoint rejects owner-key substitution. `createMockAuth` accepts the connection's credential or an explicit credential. Its requests use the run driver's approval state rather than injecting connected UI state.

Playwright bindings receive connection data in `apply(page, privateConnection)`. They configure the app before navigation. The framework closes binding resources and contexts before deleting the run's objects. Test configuration must not contain credentials.

MSW and Playwright are optional peers. Portable mock/client imports contain no Node or storage SDK runtime. The low-level fixture/model/SDK exports and `/msw/node` wrapper are removed; there are no compatibility aliases.

`/node` accepts mock backends and explicitly consented live profiles. Application HTTP/MSW ports speak a synthetic fixture protocol, not the native Indexd protocol. The package does not deploy services, fund accounts or run a local cluster.

## Inspect mock shares as their owner

Inside a `mock.run({ app }, async (run) => { ... })` callback, use owner access rather than recipient access:

```ts
const share = await run.shares.create({ objects: [], description: "Reading list" });
const owner = mock.ownerShares({ access: run.ownerAccess, as: mock.actor("owner UI") });
try {
  const page = await owner.list({ offset: 0, limit: 10 });
  const row = page.items[0]!;
  console.log((await owner.detail(row.ref)).description); // Reading list
  console.log((await owner.objects(row.ref, { offset: 0, limit: 10 })).items);
} finally {
  await owner.close();
}
```

`description` is a mock-only fixture option; live managed shares retain their existing interface. Owner details report current attachment count and logical payload bytes, not slab sizes or physical storage usage. Contents return detached metadata copies. Expired shares remain inspectable by owners, while recipients lose fresh access. Revoked shares disappear from the catalogue and stale references fail.

For the same reads over an owned HTTP or MSW endpoint:

```ts
import { createMockOwnerShares } from "@lumeweb/sia-testing/client";

const connection = endpoint.connection({ access: run.ownerAccess, as: mock.actor("owner HTTP") });
const owner = createMockOwnerShares(connection, connection.credential);
try {
  console.log(await owner.list({ offset: 0, limit: 10 }));
} finally {
  await owner.close();
}
```

References are opaque runtime-owned handles, not share IDs or recipient credentials. Direct references belong to their mock run. Transport references belong to the authenticated connection and local client that materialized them; copied JSON and references from another client cannot be used as handles. Wire tokens alone grant no authority. Recipient and registration connections cannot upgrade to owner inspection by substituting an owner key.

Pages are current reads, not snapshots across edits. Ordering is deterministic for unchanged state. Offsets must be nonnegative safe integers and limits positive safe integers. Responses contain at most the requested limit, subject to the run's fixture allowances. `nextOffset` advances by the returned item count; `done` is true when fewer than `limit` items are returned, so an exactly full final page needs an empty follow-up page. `list`, `detail` and `objects` accept an abort signal. Repeated `close()` is safe, cancels held requests and joins pending calls. Run cleanup cancels retained ports before releasing state. Owner reads use the finite actor-selected `owner-shares`, `owner-share` and `owner-share-objects` controls.

## Checks

```sh
pnpm --filter @lumeweb/sia-testing test
pnpm --filter @lumeweb/sia-testing check-types
pnpm --filter @lumeweb/sia-testing lint
pnpm --filter @lumeweb/sia-testing test:browser
pnpm --filter @lumeweb/sia-testing test:package
pnpm --filter @lumeweb/sia-testing test:consumers
```

## Application writes (mock only)

`mock.application({ access: run.ownerAccess, as: actor })` returns an
`ApplicationPort`. Give that port to application code; keep the run and
`mock.publish` in the test driver. Managed `run.objects.upload` still uploads
and pins in one call.

```ts
const actor = mock.actor("uploader");
const writer = mock.application({ access: run.ownerAccess, as: actor });
try {
  const pending = await writer.upload({ file, name: file.name, metadata: new Uint8Array() });
  // inspect returns "uploaded"; owner readers cannot read an unpinned payload.
  const hold = mock.mutationFaults.hold({ actor, object: pending, operation: "pin", stage: "beforeCommit" });
  const pinning = writer.pin(pending);
  await hold.started();
  hold.release();
  await pinning;
  // Pin acknowledgement does not publish an event.
  mock.advanceTime(1000); // requires a manual mock clock
  await mock.publish({ access: run.ownerAccess });
  const page = await writer.events({ cursor: null, limit: 10 });
  await writer.events({ cursor: page.nextCursor, limit: 10 });
} finally {
  await writer.close();
}
```

`inspect` reads `"missing"`, `"uploaded"` or `"pinned"` from owned state;
`delete` accepts only an application's original object reference. Fixture
handles, copied references and foreign-run references grant no write authority.
Deleting a pending upload discards only its owned slab; deleting a pinned object
queues a tombstone. All pending and acknowledged payloads belong to the run.

`mutationFaults.hold` is one-shot. `mutationFaults.fail(selector, { code,
times })` accepts `denied` or `unavailable` and a positive finite integer count.
Both target `upload`, `pin` or `delete` at `beforeCommit`. Selectors may name an
owned actor and application object (upload has no object yet). Holds expose
`started()`, `cancelled()` and `release()`. Receipts record `committed` separately
from settlement, without source bytes, file names or private metadata.
Cancellation or rejection before commit changes no payload or model state;
closing a direct port cancels and joins its sources and holds. Cancellation after
an effect does not undo it. No write retries, lost-reply recovery or idempotency
promise is provided.

Application uploads allow files up to 16 MiB, metadata up to 1024 bytes and names
up to 1024 UTF-8 bytes. Run object-attempt and logical-byte allowances are
reserved before the source opens. Failed application uploads release active byte
reservations; object attempts stay charged. Committed bytes stay charged after
deletion. Managed fixture allowance behavior is unchanged.

Events use the run's existing account feed, including managed fixture events.
Use a fresh run or explicitly published fixture cursor as your baseline.
Pages accept limits from 1 to 1000. A cursor is `{ after, id }`, with a canonical
whole-second ISO timestamp and a lowercase 64-character hexadecimal object ID.
Continuation is exclusive in timestamp/ID order. `nextCursor` is the last row,
or the input cursor on an empty page; a full page has `done: false` and may need
an empty continuation. Publication coalesces each object's current event and
requires a later clock second after a prior publication. Later publication can
move a lower-ID object past an older cursor. Publication targets only the
owner-authenticated run; it never acknowledges an application ledger.

### Fetch-backed application ports

Import `createMockApplication` from `@lumeweb/sia-testing/client` and pass a
connection from the existing HTTP or MSW endpoint plus the application's current
credential. The same scoped dispatcher implements these ports; this protocol
is not native Indexd compatibility. Publication remains a test-driver action.

The upload client obtains a private, authenticated one-use admission before
opening `file`. It then buffers at most the admitted file size, checks its hash,
and sends raw bytes, without base64 expansion or streaming Fetch request bodies.
The server counts the incoming stream independently of `Content-Length` and
rejects oversize or incomplete bodies before any upload effect. File bodies have
the same admitted logical/raw limit of 16 MiB; other routes retain their
16,384-byte body limit. Admissions expire after 30 seconds of real time. They
cannot be replayed or moved between connections or credentials.

Close the client port before leaving the backend run when immediate local source
teardown matters. Client close cancels and joins its collector; its original
admission deadline also cancels collection. Backend run or endpoint close
invalidates admissions and joins backend-owned work, but cannot synchronously
stop JavaScript collecting a file in a remote client. A client left open can
collect only until its admission deadline and cannot commit with an invalidated
token. HTTP server close and MSW endpoint `close()` invalidate outstanding
admissions; the application never receives fixture or publication controls.
Application endpoint close also cancels and joins its active dispatches, including
held mutations and admission JSON reads.

Object selectors accept only backend-owned references returned by a direct
`mock.application` port, as in the example above. HTTP/MSW clients materialize
client-local references; those references, JSON copies and foreign mock handles
cannot arm backend object controls. For a transport client, allocate an actor
per binding and select its next operation instead:

```ts
const hold = mock.mutationFaults.hold({ actor, operation: "pin", stage: "beforeCommit" });
const pinning = writer.pin(pending); // writer may be an HTTP or MSW client
await hold.started();
hold.release();
await pinning;
```

| Operation | Direct mock port | HTTP/MSW client |
| --- | --- | --- |
| Upload, pin, inspect, delete, events | Supported | Supported |
| Finite actor/operation mutation controls | Supported | Supported |
| Backend object selector | Original direct reference | Client-local reference rejected |
| Publication | Test driver only | No publication route |
