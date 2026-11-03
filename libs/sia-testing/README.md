# Sia testing

Test Sia application behavior without a server. Managed runs own synthetic fixture objects and sharing keys; application code receives restricted ports, not fixture or publication controls.

## Write a Vitest test

Install `@lumeweb/sia-testing` and Vitest as development dependencies. Save this as `sia.test.ts` and run `pnpm exec vitest run sia.test.ts --environment node`:

```ts recipe=ordinary
import { expect, test } from "vitest";
import { bytesFixture, type ReadPort } from "@lumeweb/sia-testing/mock";
import { withSiaRun } from "@lumeweb/sia-testing/node";

async function applicationSize(reader: ReadPort, id: string) {
  return (await reader.object(id)).sizeBytes;
}

test("the recipient reads a managed fixture", async ({ signal }) => {
  const result = await withSiaRun(
    {
      backend: {
        kind: "mock",
        app: {
          id: "a".repeat(64),
          name: "Document tests",
          description: "Synthetic document fixtures",
          serviceUrl: "https://example.invalid",
        },
      },
      signal,
    },
    async (run) => {
      const file = await bytesFixture({ name: "document", bytes: Uint8Array.of(1, 2) });
      const object = await run.objects.upload({ file, metadata: new Uint8Array() });
      const share = await run.shares.create({ objects: [object] });
      const reader = run.mock.reader({ access: share.access, as: run.mock.actor("recipient") });
      try {
        return await applicationSize(reader, object.id);
      } finally {
        await reader.close();
      }
    },
  );
  expect(result.value).toBe(2);
  expect(result.summary.cleanup).toBe("clean");
});
```

The test driver owns the fixtures. `run.objects.upload` uploads and pins before returning. An application's `ApplicationPort.upload` stages bytes until the application calls `pin`; publication is a separate driver action. The optional upload `name` defaults to the snapshotted `TestFile.name` label; it does not set an application filename. Metadata stays required and is passed through as opaque bytes. Empty metadata is intentional here, not a usable file record for every application. These synthetic ports do not replace the full storage SDK or model native packed finalization.

`fileFixture(path)` from `/node` streams a local file and records its digest. Upload rejects changed bytes. Files are limited to 16 MiB. Mock runs default to 8 object reservations, 8 share reservations, and 16 MiB of logical uploads. Deletion does not refund these allowances.

## Choose an entry

| Entry         | Use it for                                                               |
| ------------- | ------------------------------------------------------------------------ |
| `/mock`       | Portable byte fixtures, direct application ports, and driver controls    |
| `/node`       | Owned callback runs, local files, and explicitly consented live profiles |
| `/playwright` | The Playwright-specific factory and private browser contexts             |
| `/client`     | Fetch-backed application ports and mock sign-in                          |
| `/http`       | An optional owned loopback listener over a mock                          |
| `/msw`        | An optional interceptor at an explicit base URL over a mock              |

No Vitest plugin is required. MSW and Playwright are optional peers. Portable mock and client imports contain no Node, test-runner, or storage SDK runtime. HTTP and MSW speak a synthetic fixture protocol, not native Indexd. The package does not deploy services or fund accounts.

## Use native Vitest fixtures for direct controls

Save this complete recipe in its own test file. Each test, including concurrent tests, gets a separate mock and run.

```ts recipe=fixture
import { expect, test } from "vitest";
import { bytesFixture, createMockSia, type MockRun } from "@lumeweb/sia-testing/mock";

const siaTest = test.extend<{ sia: MockRun }>({
  sia: async ({ signal, onTestFinished }, use) => {
    const mock = createMockSia();
    onTestFinished(() => mock.close());
    try {
      await mock.run(
        {
          app: {
            id: "b".repeat(64),
            name: "Fixture tests",
            description: "Isolated application fixtures",
            serviceUrl: "https://example.invalid",
          },
          signal,
        },
        use,
      );
    } finally {
      await mock.close();
    }
  },
});

for (const label of ["left", "right"]) {
  siaTest.concurrent(`isolates ${label}'s objects`, async ({ sia }) => {
    const file = await bytesFixture({ name: label, bytes: Uint8Array.of(3) });
    const object = await sia.objects.upload({ file, metadata: new Uint8Array() });
    const actor = sia.mock.actor(label);
    const reader = sia.mock.reader({ access: sia.ownerAccess, as: actor });
    try {
      const hold = sia.mock.faults.hold({ actor, operation: "objects" });
      const reading = reader.objects({ offset: 0, limit: 10 });
      await hold.started();
      hold.release();
      expect((await reading).objects.map((item) => item.id)).toEqual([object.id]);
    } finally {
      await reader.close();
    }
  });
}
```

Pass `TestContext.signal` so a timeout cancels owned work. `onTestFinished` also closes the mock if the test fails or times out; `finally` closes it when the fixture finishes. Close is safe to repeat. Run cleanup closes retained ports before deleting fixture state, including after assertion failures.

Cancellation cannot force an unrelated user promise to settle. Await your work and make callbacks cooperate with cancellation. Application and owner-share ports cancel and join their pending calls on close. For both direct and fetch-backed readers, `close()` aborts requests without waiting for those calls to settle. Close a fetch application client in `finally` to join its local upload collector; backend teardown cannot synchronously stop collection in a remote client.

## Publish application writes

Construct a manual clock before calling `advanceTime`. Pinning does not publish an event; the driver controls when a staged application write becomes visible in the feed.

```ts recipe=publication
import { expect, test } from "vitest";
import { bytesFixture, createMockSia } from "@lumeweb/sia-testing/mock";

test("publishes a pinned application object explicitly", async ({ signal }) => {
  const mock = createMockSia({ clock: { start: "2026-01-01T00:00:00Z" } });
  try {
    await mock.run(
      {
        app: {
          id: "c".repeat(64),
          name: "Publication tests",
          description: "Staged application uploads",
          serviceUrl: "https://example.invalid",
        },
        signal,
      },
      async (run) => {
        const writer = mock.application({ access: run.ownerAccess, as: mock.actor("uploader") });
        try {
          const file = await bytesFixture({ name: "document", bytes: Uint8Array.of(4) });
          const pending = await writer.upload({ file, metadata: new Uint8Array() });
          expect(await writer.inspect(pending)).toBe("uploaded");
          const selected = new TextEncoder().encode('{"name":"chosen-at-pin"}');
          await writer.pin(pending, { metadata: selected });
          const reader = mock.reader({ access: run.ownerAccess, as: mock.actor("owner-reader") });
          try {
            expect((await reader.object(pending.id)).metadata).toEqual(selected);
          } finally {
            await reader.close();
          }
          expect(await writer.inspect(pending)).toBe("pinned");
          expect((await writer.events({ cursor: null, limit: 10 })).events).toEqual([]);
          mock.advanceTime(1000);
          await mock.publish({ access: run.ownerAccess });
          expect((await writer.events({ cursor: null, limit: 10 })).events).toEqual([expect.objectContaining({ id: pending.id, deleted: false })]);
        } finally {
          await writer.close();
        }
      },
    );
  } finally {
    await mock.close();
  }
});
```

`pin(object, { metadata })` snapshots up to 1024 opaque bytes at invocation. Upload metadata remains required. Omitted or explicit `undefined` metadata preserves the last committed value; an empty `Uint8Array` clears it. Successful repins replace metadata at the same effect as pin membership. Failure or cancellation before commit leaves the prior value unchanged; losing a reply after commit retains the replacement. Reads return detached copies. Concurrent pins follow actual commit order, and `inspect` reports membership only, not which metadata update won. Events still need explicit publication. This option is mock-only and adds no native storage capability.

Handles and actors grant authority by their original reference, not copied fields or equal labels. Recipient reads check current attachments and keys. Revocation blocks fresh reads but cannot erase downloaded plaintext. No automatic retries or idempotency guarantee is provided. A lost pin acknowledgement can follow a committed effect: reconcile with `inspect`, not a blind retry. Publication remains explicit after reconciliation.

[Mock application contracts](docs/mock-contracts.md) covers pagination, lost replies, diagnostics, and transport upload limits. [Live runs](docs/live-runs.md) and [live authentication](docs/live-auth.md) describe owner-only external profiles and acknowledged-resource recovery. Nonempty live transfers and real-server compatibility have not been verified.

## Checks

```sh
pnpm --filter @lumeweb/sia-testing test
pnpm --filter @lumeweb/sia-testing check-types
pnpm --filter @lumeweb/sia-testing lint
pnpm --filter @lumeweb/sia-testing test:package
pnpm --filter @lumeweb/sia-testing test:consumers
```

Consumer checks extract and execute the complete README tests against the packed public exports with Node and Vitest 4.1.9. They also check timeout cancellation in an expected-failure child process. They do not certify every Vitest version or browser provider.
