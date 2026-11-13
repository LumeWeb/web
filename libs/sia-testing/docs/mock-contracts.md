# Mock application contracts

Use these contracts when testing writes or transport adapters. For complete runnable setup, see the [Vitest tests](../README.md).

## Inspect mock shares as their owner

Inside a `mock.run({ app }, async (run) => { ... })` callback, use owner access rather than recipient access:

```ts
const share = await run.shares.create({ objects: [], description: "Reading list" });
const owner = mock.ownerShares({ access: run.ownerAccess, as: mock.actor("owner UI") });
try {
  const page = await owner.list({ offset: 0, limit: 10 });
  const row = page.items[0]!;
  console.log((await owner.detail(row.ref)).description);
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

## Driver diagnostics

`actor(label)` keeps the label as driver-visible diagnostic text. Request receipts
from `history()`, `hold.started()` and `hold.cancelled()` include `actorLabel` for
reads and mutations. Labels grant no authority: actors with equal labels remain
distinct, and selectors require the original actor reference. Choose labels that
can appear in test failure reports; do not put credentials or private data in them.
History retains the latest 256 requests in start order. A held request can leave
history before it finishes; its hold still returns labelled snapshots.

Invalid fault `times` and invalid link rates or latency throw errors with
`code: "invalid-input"`. Page validation messages identify `offset` or `limit`.
Fetch domain errors include the local operation and a known invalid field when
available, without forwarding callback messages or request values. Error codes
remain available on the error's `code` property; narrow an unknown error before
reading that property.

Closing the loopback listener rejects new backend dispatch and cancels pending
owned requests. It preserves already-started response delivery. If cancellation
can still deliver a domain response, the caller receives `code: "closed"`.
A mutation cancelled before its effect retains `committed: false`; cancellation
cannot undo an effect that already committed. Closing the listener does not close
other direct ports in the run. Caller aborts and client close keep native cancellation behavior.
Actual response loss remains a native Fetch error, including lost pin replies;
cleanup failures can still reject with `AggregateError`. The package does not
retry or publish events in response to errors.

## Application writes (mock only)

`mock.application({ access: run.ownerAccess, as: actor })` returns an
`ApplicationPort`. Give that port to application code; keep the run and
`mock.publish` in the test driver. Managed `run.objects.upload` still uploads
and pins in one call.

See the complete [manual-clock test](../README.md#publish-application-writes).

`writer.pin(object, { metadata, signal })` optionally replaces committed metadata.
The byte view is copied once at invocation, before holds or transport dispatch.
Metadata must be a `Uint8Array` of at most 1024 bytes. Omission and explicit
`undefined` preserve the current committed bytes, including on repin; empty bytes
clear them. Membership, replacement bytes and the committed receipt change in one
synchronous effect. Before that effect, owner reads see the prior value (or no
object on a first pin). A failed or cancelled attempt before commit preserves it.
A lost reply after commit retains the replacement. Concurrent attempts follow
commit order; omission cannot reset another attempt's committed replacement.
`inspect` reports membership only and cannot identify a concurrent metadata
commit. Publication, event fields and second-based coalescing remain unchanged.
This is synthetic application metadata, not native encrypted object metadata.

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
an effect does not undo it. No automatic write retries or idempotency promise
is provided.

### Lost mutation acknowledgements

`mock.mutationFaults.loseReply(selector, { times })` drops acknowledgement after
a successful upload, pin, delete, share Add, Remove or End commits. `MutationReplySelector`
and the source-compatible `PinReplySelector` are exported from `mock`. Every
selector requires the original actor; `times` is a positive safe integer.
For `operation: "pin" | "delete"`, an optional `object` must be an original
backend reference from a direct application port. HTTP and MSW object references
are client-local, so those clients use actor/operation selection.
For `operation: "share-add" | "share-remove" | "share-end"`, optional `share`
selects an original driver grant across all its installations. Another grant for
the same share does not match. Share selectors accept neither objects nor IDs.
Selectors and options are snapshotted when installed.
For `operation: "upload"`, neither `object` nor `share` is accepted. Read reply
losses are unsupported. Rejection or cancellation before the effect and
successful no-ops leave the fault armed.

```ts
const known = await writer.upload({ file, name: file.name, metadata: new Uint8Array() });
mock.mutationFaults.loseReply({ actor, operation: "pin" }, { times: 1 });
try {
  await writer.pin(known);
} catch (error) {
  // A direct port rejects with code "unavailable". Fetch clients get a network error.
  const state = await writer.inspect(known);
  if (state !== "pinned") throw error;
}
// The application has reconciled the pin; no event exists until the driver publishes.
const unpublished = await writer.events({ cursor: null, limit: 10 });
```

Inspection confirms the object's current state without publication or driver
receipts. It does not report which earlier call committed. HTTP sends a deliberately
incomplete response prefix before destroying the owned connection to prevent
browser POST replay; MSW returns a network failure. Native Fetch errors retain
their platform's class and fields. Nothing retries, resends or rolls back
the mutation. Driver receipts may record `committed: true` with a failed caller outcome;
those receipts are not an application recovery API. Explicit publication keeps
the same event-coalescing behavior as an acknowledged pin.

A lost upload acknowledgement can reject without returning any application
object. Collected bytes, explicit metadata and committed logical-byte charges
remain owned by the run. Upload does not pin, create a catalogue row or queue an
account object event; explicit publication cannot reveal the staged upload.
Inspection requires an original application handle. Neither a generated ID in a
driver receipt, a copied object nor a fresh client can recover that missing
handle. The outcome stays unknown to the application. Another explicit upload
is a new attempt, not a retry with deduplication. Port close joins work without
discarding committed uploads; run cleanup discards unpinned payloads and clears
their records and metadata.

Upload `beforeCommit` holds and failures run after source collection and hash
verification. Validation and allowance rejection before collection open no
source. The local SDK stages payloads and synchronously completes application
record, metadata, accounting and receipt bookkeeping before Promise observers.
Post-effect cancellation does not release the committed byte reservation.

After a lost delete reply, retain the original application object and explicitly
call `writer.inspect(object)`; committed deletion reports `"missing"`. Staged
discard creates no event. Pinned deletion removes membership, metadata and payload
and queues the existing tombstone for explicit publication. Deletion refunds
neither committed bytes nor object attempts.

After lost Add or Remove replies, explicitly call
`writer.shares.inspect(ref, object.id)` to inspect current selected membership.
After lost End, inspect lifecycle with `writer.shares.inspect(ref, null)`; a valid
grant reports `"ended"` without restoring recipient access. A later mutation can
change membership before inspection, so inspection does not prove which request
won. Withdrawing the grant denies inspection and leaves the caller's outcome
unknown. No automatic inspection or resend occurs.

Application uploads allow files up to 16 MiB, metadata up to 1024 bytes and names
up to 1024 UTF-8 bytes. Run object-attempt and logical-byte allowances are
reserved before the source opens. Application uploads that fail before the
effect release active byte reservations; object attempts stay charged. Committed
bytes stay charged after lost acknowledgement, cancellation or deletion. Managed fixture allowance behavior is unchanged.

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

### Recreate clients against a retained mock backend

Retain acknowledged object IDs and event cursors as application data. Close the
original clients, keep the same run and backend open, then create new clients
with valid access. Use `mock.reader({ access, as })` directly, or
`createMockReader(connection, credential)` from `@lumeweb/sia-testing/client`
with a new HTTP/MSW connection. `reader.object(id)` returns current pinned
membership, metadata and size; `reader.download({ id })` reads the bytes. These
reads can reconcile a known pin whose reply was lost without repeating a write.
They do not identify which concurrent request committed. An unpinned or deleted
object has no readable row. Recipient reads still require current share access;
revocation denies fresh reads.

`ApplicationPort.events({ cursor, limit })` accepts a retained cursor on a new
authorized client. Events require explicit driver publication, so an absent event
does not establish that a pin failed. Read current membership and metadata through
the reader rather than treating an old event or receipt as current state.

Readable IDs, rows, cursors and diagnostic receipts never create mutation handles.
Direct application object references belong to the run and can be used by another
owner-authorized direct port in that run, even after the originating port closes.
Fetch application references belong to their local client; a recreated client
rejects the old references. Packed objects and keys belong to their SDK session.
Retained packed IDs can locate authorized reads after SDK close, but a new SDK
cannot mutate the old objects. Preserve every acknowledged packed identity;
reading one pinned result does not establish that all results were pinned.
Unknown uploads without an acknowledged handle remain unknown; owner enumeration
is not a handle recovery method.

This supports client recreation within one retained mock run. It does not prove
backend restart durability, browser reload persistence, native SDK behavior or
consumer checkpoint policy.

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

| Operation                                | Direct mock port          | HTTP/MSW client                 |
| ---------------------------------------- | ------------------------- | ------------------------------- |
| Upload, pin, inspect, delete, events     | Supported                 | Supported                       |
| Finite actor/operation mutation controls | Supported                 | Supported                       |
| Backend object selector                  | Original direct reference | Client-local reference rejected |
| Publication                              | Test driver only          | No publication route            |

### Loopback response lifetime

The listener returned by `startMockServer` closes gracefully: cancelling backend
work does not cancel buffered JSON already being delivered. A successful backend
request can finish before its response body reaches the caller. If a raw HTTP client leaves that
body unread, listener close can remain pending until the peer drains or
disconnects. Close does not guarantee that every response flushes, or join
unrelated JavaScript in a remote client. Streaming producers can still react to
the request's abort signal.

Before awaiting listener close, close the client port or consume or cancel raw
responses. The Fetch-backed ports consume JSON response bodies; their `close()`
aborts pending Fetch calls. For a raw Fetch response, consume its body or cancel
`response.body`; if the stream is locked, cancel its reader instead. For Node
`http`, drain the response with `resume()` or destroy the response and client.
Playwright consumers must close their contexts before the listener. External
clients remain responsible for their own response lifetimes.

## Connect applications

`endpoint.connection({ access, as })` materializes a fake mock credential for an application adapter. Pass the application's current credential to `createMockReader`; a recipient endpoint rejects owner-key substitution. `createMockAuth` accepts the connection's credential or an explicit credential. Requests use the driver's approval state rather than injecting connected UI state.

Playwright tests compose `/node` `withSiaRun` with `/http` `startMockServer` and their own contexts. Install `endpoint.connection({ access, as }).credential` before navigation. Close contexts before the endpoint, then return from the managed run. Do not put credentials in test configuration.

`/vitest` exports `createSiaTest`, a native Vitest `TestAPI<SiaTestFixtures>`. Each test requesting `sia` owns a fresh portable `MockRun`; fixture extension uses Vitest's `test.extend`. The runner signal and optional external signal cancel owned mock work. A shared external signal cancels all its users. The fixture does not own pages, listeners or arbitrary caller promises.

The low-level fixture, model, and SDK exports and the `/msw/node` wrapper are not available. There are no compatibility aliases.

## Edit an explicitly granted share

Share edits are mock-only. The driver issues a grant for one share and one
original actor, then installs it on an application or endpoint connection:

```ts
const actor = mock.actor("share editor");
const share = await run.shares.create({ objects: [] });
const grant = await run.shares.grant(share, {
  as: actor,
  label: "reading-list",
  operations: ["add", "remove", "end"],
});
const app = mock.application({
  access: run.ownerAccess,
  as: actor,
  shareGrants: [grant],
});
const [target] = await app.shares.targets();
const object = await app.upload({ file, metadata: new Uint8Array() });
await app.pin(object);
await app.shares.add(target!.ref, object);
await app.shares.remove(target!.ref, object.id);
await app.shares.end(target!.ref);
const ended = await app.shares.inspect(target!.ref, null);
// ended is { state: "ended", contains: null }.
await app.close();
```

`ApplicationPort.shares` provides `targets(options?)`,
`inspect(ref, objectId: string | null, options?)`, `add(ref, object, options?)`,
`remove(ref, objectId, options?)`, and `end(ref, options?)`. Each options object
accepts `signal?: AbortSignal`. Targets contain a client-bound opaque `ref`, the
driver's `label`, an operations snapshot, and an optional canonical ISO
`expiresAt`. Owner share refs remain read-only and cannot authorize edits.
Copied refs, fixture handles, IDs, and receipts do not grant mutation authority.
Omitting `shareGrants` installs no authority. Labels must differ within an
installed set; labels do not authorize requests.

`grant` requires nonempty, unique operations from `add`, `remove`, and `end`.
It snapshots the operations and optional `expiresAt: Date`. An explicit deadline
must be finite and future; without one the grant lasts until withdrawal or run
cleanup. Issuance requires an active share and the original actor. A grant can
be installed on several clients for its actor. `run.shares.revokeGrant(grant)`
withdraws only that grant from every installation and is a no-op when repeated.
It does not revoke the share or other grants.

Add requires a genuine, pinned, undeleted application object in the same run.
It never pins or changes metadata. Direct ports retain their existing run-scoped
object acceptance; Fetch object handles remain client-local. Remove's ID selects
membership under the grant and grants no object access. End revokes recipient
access without deleting owned payloads or changing sibling shares. Already-open
download streams keep their existing behavior.

Inspection requires a valid grant, even after End. It returns `active`, `expired`,
or `ended`, with current membership as `contains` for a supplied object ID.
Lifecycle-only inspection and ended shares return `contains: null`. Expired
shares remain inspectable but reject mutations. End takes precedence over share
expiry; repeated End with valid End permission succeeds without a change.
Revoked or deadline-reached grants deny inspection and mutations and disappear
from targets. An ended share stays in the roster while its grant is valid.

Before-effect mutation selectors support `share-add`, `share-remove`, and
`share-end`; read selectors support `share-targets` and `share-inspect`.
`share-inspect` and share mutations can select the original driver grant with
`share: grant`, across all installations. Diagnostic share IDs are not selectors.
Calls validate before controls and recheck authority, lifecycle, cancellation,
and Add's object eligibility after a hold. No-op calls still pass through controls.
Receipts report `committed: true` only when membership or revocation changes;
repeated Add, absent Remove, and repeated End report false without rewriting
timestamps. Effects, fixture state, and receipt attribution finish synchronously.
Share edits create no account object events and do not publish.

For HTTP or MSW, pass `shareGrants` to the existing `endpoint.connection` call.
Application code receives only its connection and credential and uses
`createMockApplication(connection, credential)`. First targets establishes a
private session; subsequent calls reuse it. Each application instance has its
own refs, even on one connection. A raw holder of a credential and a complete
session token has bearer authority; sessions do not isolate browser processes.
Client close aborts and joins local requests and discards local share refs,
without remotely revoking bearer tokens. Run cleanup aborts and joins its work
and removes only its entries; endpoint close joins all remaining work and
releases registrations. A lost first targets reply can leave an unreferenced
session until run or endpoint cleanup. Calls do not retry or recover sessions
automatically.

## Direct SDK 0.2 upload simulation

`mock.uploadSdk({ access: run.ownerAccess, as: actor, maxBytes })` provides a
small, direct SDK-shaped upload surface. Import `MockPinnedObject` from `mock`
and pass a fresh handle to `sdk.upload(handle, stream)`. The input handle is
freed when upload starts; the returned handle can be pinned with
`sdk.pinObject(handle)` and must be freed by its caller. `appKey().publicKey()`
returns a synthetic account label, not a cryptographic key. Close the SDK to
join its application port before ending the run. Run cleanup also closes an
unclosed SDK and reports source cancellation failures.

```ts
const sdk = mock.uploadSdk({
  access: run.ownerAccess,
  as: mock.actor("uploader"),
  maxBytes: 1024,
});
try {
  const draft = new MockPinnedObject();
  draft.updateMetadata(Uint8Array.of(7));
  const object = await sdk.upload(draft, new Blob([Uint8Array.of(1)]).stream());
  try {
    await sdk.pinObject(object);
  } finally {
    object.free();
  }
} finally {
  await sdk.close();
}
```

The upload collects at most `maxBytes` (from 1 through 16 MiB) before calling
the owned application port, which applies the run's upload limits and fault
controls. Metadata is copied before the source opens and again when pin starts;
a metadata change on the returned handle is included in that pin. `free()`
invalidates a local handle without deleting its staged or pinned object.
An uploaded handle from another SDK is not a fresh upload input.
`mutationFaults` for `upload` and `pin`, including lost replies, retain their
application-port behavior. The run owns unpublished object data and cleans it
up after the test. Source overflow cancels the source before any upload effect.

This mock accepts `dataShards`, `parityShards` and `onShardUploaded`. After a
successful staged upload, it reports one synthetic callback for each encoded
shard, using the SDK's sector size and zero elapsed time. The mock requires a
positive `dataShards`, nonnegative `parityShards` and a combined count at most 255. It sends no callback when staging fails, and it does not simulate host
transfers, shard retries or callback timing during upload. Other upload options
reject as unsupported.
This mock does not encrypt, upload to hosts, seal handles, resume uploads or
replace a native SDK 0.2 binding with a full `Sdk` implementation. A lost upload reply can leave an inaccessible staged
object; a lost pin reply can leave a readable pinned object.

## Direct SDK-shaped packed simulation

`mock.packedSdk({ access, as, platform, maxBytes, maxObjects })` uses original
owner access and actor capabilities. `platform` is `"node"` or `"browser"`;
`add(stream)` returns `Promise<bigint>` or `Promise<number>` respectively,
matching that part of SDK 0.2.0. The handle from `uploadPacked(options?)` is
synchronous. The supported options are positive safe integer `dataShards`,
`parityShards` and `maxBufferedSlabs`. They validate caller configuration;
they do not change simulated storage layout. Host progress callbacks are
unsupported and reject before admission.

```ts
const sdk = mock.packedSdk({
  access: run.ownerAccess,
  as: mock.actor("packed writer"),
  platform: "browser",
  maxBytes: 1024,
  maxObjects: 1,
});
try {
  const packed = sdk.uploadPacked({ dataShards: 1, parityShards: 1 });
  await packed.add(
    new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(Uint8Array.of(1, 2));
        controller.close();
      },
    }),
  );
  for (const object of await packed.finalize()) {
    object.updateMetadata(Uint8Array.of(7));
    await sdk.updateObjectMetadata(object);
    await sdk.pinObject(object);
    object.seal(sdk.appKey());
  }
} finally {
  await sdk.close();
}
```

Each successful add produces one independently pinnable object, including a
zero-byte input. No adds produces no objects. IDs use the run identity and
reserved object ordinal; repeated equal inputs do not alias. Sources are
collected in memory with an aggregate maximum of 16 MiB. This path does not
prove bounded-memory streaming, real slabs, encryption, host transfer or native
packed correctness. It is available only on the direct mock; HTTP and MSW do
not expose SDK-shaped packed calls.

Each `uploadPacked` reserves `maxBytes` and `maxObjects` against the same run
allowances as application and managed uploads before it locks a source. Invalid
configuration, owner access and exhausted run admission read no source. Object
attempts are not refunded, including empty or failed finalization. Finalization
and disposal release unused byte reservations; acknowledged uploaded bytes
remain charged. Failed adds consume no object slot within that packed handle.
Source byte overflow fails and cancels the source. This does not raise existing
application limits or change managed mock metadata (uncapped) or managed live
metadata (16384 bytes).

`updateMetadata(Uint8Array)` copies up to 1024 bytes locally. This deliberately
accepts a wider input than native Node's `Buffer` signature. No native-shaped
`metadata()` method is exposed. `updateObjectMetadata` snapshots local bytes at
invocation and commits through the existing object store; reads through the
owner reader return detached copies after pinning. Local changes alone do not
change stored metadata. Concurrent metadata calls follow commit order.
Publication remains explicit.

`mutationFaults` accepts `packed-add`, `packed-finalize` and `metadata` with
`stage: "beforeCommit"` and optional original actor. Add controls run after
collection, finalize controls run before each result's staging (once for an
empty batch), and metadata controls run before the metadata effect. Existing
`pin` holds, failures and reply losses also apply. These selectors do not accept
packed object IDs as authority. Existing application upload `beforeCommit`
still runs after collection and hashing.

Only one add or finalize may run per upload; overlap rejects with `code: "busy"`.
A failed add permits another add. Finalize is one-shot, including failure.
If finalization fails after staging results, `PackedFinalizeError.objects`
contains the original acknowledged object capabilities and `cause` retains the
original failure. A failure before any result propagates unchanged. No rollback,
retry or publication runs automatically. The caller may pin acknowledged partial
objects explicitly while the SDK session remains open.

`cancel()` interrupts reads and held work. `dispose()` cancels and joins that
upload, releases its buffers and unused byte reservation, and retains source
cancellation errors. `sdk.close()` does the same for every unfinished upload
and joins metadata and pin calls. Neither deletes acknowledged objects. Run
cleanup closes sessions and then deletes run-owned resources; it continues after
source cleanup errors and reports them. Closing one session does not close its
siblings. A source failure plus a cancellation failure is an `AggregateError`
containing both actual errors.

Packed objects and app keys belong to their original SDK session. Copies,
read records, guessed IDs, diagnostics and keys from sibling sessions cannot
mutate or seal. `seal(key)` validates the original object and key and returns
`void`. It does not create a sealed record, signature, encryption proof or
recovery capability. Code needing sealed output is unsupported by this mock.
The surface is not assignable to full native nominal classes. Package checks
separately check the consumed Node/browser 0.2.0 signatures and the intentional
seal output omission; no compatibility with SDK 0.0.12 is established.

### Chunked fixtures and collection controls

`chunkedFixture({ name, sizeBytes, chunkSizeBytes, pattern })`, exported by
`mock` and `node`, repeats a snapshotted nonempty byte pattern by absolute
position. Each open generates detached chunks on pull without prefetching.
Output generation uses output-chunk-sized working storage. Incremental SHA-256
hashing reuses a block of at most 65,536 bytes independently of output chunk
size, plus the pattern and hash state. Fixture construction still hashes the
actual bytes synchronously before its promise resolves. Size must be a safe
integer from zero through 16 MiB; chunk size and pattern length are limited to 1 through 65,536 bytes.
These limits apply to this fixture constructor only. Existing byte and file
fixture policies are unchanged.

```ts
const file = await chunkedFixture({
  name: "pattern",
  sizeBytes: 7,
  chunkSizeBytes: 3,
  pattern: Uint8Array.of(1, 2),
});
const hold = mock.mutationFaults.hold({
  actor,
  operation: "upload",
  stage: "collect",
  afterBytes: 2,
});
const pending = writer.upload({ file, metadata: new Uint8Array() });
const receipt = await hold.started(); // bytes is 3 for this direct producer
hold.release();
await pending;
```

Collection selectors require an owned actor, operation `upload` or `packed-add`,
and a nonnegative safe-integer `afterBytes`. Existing finite `fail` options
apply. Unknown and cross-stage fields reject before arming. Zero opens the
source but holds or fails before the first read. Positive thresholds match the
first validated, copied whole-chunk boundary reaching or exceeding the count.
An oversized chunk may already have been read; thresholds do not split chunks.
EOF below a threshold leaves the fault armed. A reached failure consumes one
configured occurrence. Validation, admission, source and hash failures leave
unreached faults armed. Empty chunks do not increase the accepted byte count.

The collector awaits controls before another read. Producer-owned chunk bytes
are copied before that wait. Caller, port, packed session or run cancellation
cancels the owned reader and joins producer cleanup; cleanup failures are
reported separately from repeated errors of an already errored reader.
`started()` and `cancelled()` expose snapshots with `stage: "collect"`, accepted
bytes and a stable receipt ID. Collection receipts stay outside `history()`;
its existing effect receipts remain unchanged and have different IDs.
`beforeCommit` still runs after full collection and hash checking where the
upload descriptor has a hash. No failed collection stages objects, metadata or
events. Attempts remain charged; uncommitted byte reservations are released.

Application uploads still buffer up to the existing 16 MiB limit. Fetch clients
collect and hash the original file before sending. HTTP and MSW controls affect
the admitted backend request body, so they cannot pace or cancel that original
client producer retroactively. Transport chunk boundaries can differ from file
chunk boundaries. Packed SDK simulation remains direct-only. These fixtures do
not establish end-to-end streaming, native upload behavior or browser producer
backpressure. Observation deadlines do not cancel owned work.

## Direct Node temporary-file payloads

`withSiaRun` from `/node` accepts `backend.payloadStorage` with kind
`temporary-files` and required `limits`: `maxObjectBytes`,
`maxLogicalUploadBytes`, `maxRetainedBytes`, and `maxUploadAttempts`.
The ceilings are 64 MiB per object, 128 MiB cumulative logical uploads,
128 MiB retained reservation, and 16 admitted source acquisitions per run.
An explicit run logical allowance must equal the storage logical allowance.
Omitting storage options preserves buffered mode and its existing defaults.

This mode supports direct application calls and packed SDK sessions with
`platform: "node"`. HTTP, MSW and browser-shaped packed
sessions reject. Fixture factory limits, metadata policies, authority and
mock slab layout do not change. This is Node simulation, not native packing,
streaming Fetch or browser storage.

Application and packed sources use bounded temporary spools and incremental
SHA-256. Each source view and its backing ArrayBuffer must be at most 64 KiB;
shared, resizable and detached backing storage rejects. Every admitted source,
including each failed or empty packed add, spends an attempt. Each source is
limited to 131072 chunks, including empty chunks. One upload reservation
(including an idle packed handle) and two download descriptor leases may be
active. Managed uploads remain buffered, but acquire the same physical
admission before source opening. Their buffers and uncapped managed metadata
are excluded from the bounded streaming-payload claim.

Retained capacity includes incomplete files, uncommitted inputs, unused packed
allowance and failed-removal residue. Logical committed bytes are cumulative;
deleting an object does not refund them. Serialization in temporary-file mode
always rejects. Buffered V1 snapshots remain supported in buffered mode.

Explicit cancel, disposal and close join owned work. No automatic operation,
download or idle deadline is added. Uncooperative source cancellation can keep
close pending. A rejected descriptor close retains its lease and makes that
run reject new uploads/downloads; other runs remain independent. Failed unlink
retains its entry and reservation, including an empty file. Cleanup attempts
independent resources and reports original failures and residue rather than a
clean summary. Physical operations are not automatically retried. Catching a
cleanup error does not make final run cleanup clean.

The backend owns a fresh private temporary root and random filenames, assumes
a trusted temporary parent and operating-system account, and accepts no caller
root or user paths. There is no crash recovery or residue sweep. Payload byte
quotas do not measure filesystem overhead, page cache, caller buffers or total
process memory.
