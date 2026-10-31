# `@lumeweb/sia-testing`

Deterministic Indexd control-plane fixtures and adapters for Sia Storage SDK tests. SDK compatibility tests use `@siafoundation/sia-storage` 0.1.4.

## Imports

| Export | Purpose |
| --- | --- |
| `/fixtures` | Account, object, slab, host and sharing fixtures |
| `/model` | In-memory accounts, objects and sharing state |
| `/msw` | Request handlers for MSW |
| `/msw/node` | MSW Node server with model access and reset |
| `/http` | Node HTTP adapter |

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

## Limits

The emulator checks signed-query encoding, expiry and caller scope, not cryptographic signatures. Approval credentials are opaque and approved connection secrets are placeholders. It does not simulate host payload transfers or issue usable host tokens.

The model's `quotaBytes` budget counts unique referenced slabs using supplied slab sizes. Fixed account-limit fields do not reproduce service funding or redundancy accounting. Seeded object IDs and envelopes are opaque test data, not proof of valid SDK encryption.

## Repository checks

From `libs/sia-testing`, with dependencies installed. Before building, run `pnpm --filter=@lumeweb/tsdown-config build:config` to build the shared configuration package.

- `pnpm test`, `pnpm check-types`, `pnpm lint`: package and harness checks.
- `pnpm test:browser`: offline browser/MSW and worker checks; requires Chromium.
- `pnpm test:native:helpers`, `pnpm test:native:control`: installed native SDK checks.
- `pnpm test:package`: built tarball consumers and import boundaries.
- `pnpm test:mutation`: compiler mutations checked through Vitest in a temporary copy.

These commands need no cluster.
