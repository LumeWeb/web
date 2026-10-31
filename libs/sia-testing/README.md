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

A consumer-owned example lives in `libs/sia-video-source/tests/e2e`. Its page
calls the production stream service through the library's public `/sia` export.
After building this package and `@lumeweb/tsdown-config`, run
`node scripts/check-consumers.mjs` to check the packed library and testing API
in a copied consumer. It checks types, lint and page builds, and collects the
spec without starting a browser or contacting a service.
