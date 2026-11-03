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
