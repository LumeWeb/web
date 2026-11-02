# Sia testing

Managed mock runs provide fixture objects and sharing keys without a Sia server. A run owns its resources and closes retained readers when its callback ends. HTTP and MSW use the same backend as in-process readers.

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
- `/client` provides fetch-backed readers and mock sign-in.
- `/http` starts an owned loopback listener over an existing mock.
- `/msw` intercepts an explicit base URL over an existing mock.
- `/node` manages callback lifetimes and local file descriptors.
- `/playwright` gives each browser binding a fresh private context.

`endpoint.connection({ access, as })` materializes a fake mock credential for an application adapter. Pass the application's current credential to `createMockReader`; a recipient endpoint rejects owner-key substitution. `createMockAuth` accepts the connection's credential or an explicit credential. Its requests use the run driver's approval state rather than injecting connected UI state.

Playwright bindings receive connection data in `apply(page, privateConnection)`. They configure the app before navigation. The framework closes binding resources and contexts before deleting the run's objects. Test configuration must not contain credentials.

MSW and Playwright are optional peers. Portable mock/client imports contain no Node or storage SDK runtime. The low-level fixture/model/SDK exports and `/msw/node` wrapper are removed; there are no compatibility aliases.

Only mock backends are accepted by this version. It does not deploy services, fund accounts or run a local cluster.

## Checks

```sh
pnpm --filter @lumeweb/sia-testing test
pnpm --filter @lumeweb/sia-testing check-types
pnpm --filter @lumeweb/sia-testing lint
pnpm --filter @lumeweb/sia-testing test:browser
pnpm --filter @lumeweb/sia-testing test:package
pnpm --filter @lumeweb/sia-testing test:consumers
```
