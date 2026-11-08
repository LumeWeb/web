/** Shared auth owns approval and saved credentials; the controller owns admission. */
import { AccessIntent, AccessPhase } from "@/index";
import assert from "node:assert/strict";
import { test } from "node:test";
import { setupServer } from "msw/node";
import { bytesFixture, createMockSia } from "@lumeweb/sia-testing/mock";
import { createMockHandlers } from "@lumeweb/sia-testing/msw";
import { createMemoryCredentialStore, createSiaAccess } from "@/index";
import { sharedAdapter } from "./helpers/shared-adapter.ts";
const app = {
  description: "Synthetic access checks",
  id: "a".repeat(64),
  name: "Access checks",
  serviceUrl: "https://app.test",
};
const application = { ...app, appId: app.id };
for (const recovery of ["retry", "continue"] as const) {
  void test(
    `shared registration supports correction, ${recovery} after save failure, and saved-key reconnect`,
    { timeout: 5000 },
    async () => {
      const mock = createMockSia();
      const endpoint = createMockHandlers(mock, {
        baseUrl: "https://synthetic.test",
      });
      const server = setupServer(...endpoint.handlers);
      server.listen({ onUnhandledRequest: "error" });
      try {
        const result = await mock.run({ app }, async (run) => {
          const connection = endpoint.connection({
            access: run.auth.registrationAccess,
            as: mock.actor("application"),
          });
          const ownerActor = mock.actor("owner");
          const memory = createMemoryCredentialStore();
          let fail = true;
          const access = createSiaAccess({
            adapter: sharedAdapter(
              connection,
              run.auth.fixturePhrase,
              endpoint.connection({ access: run.ownerAccess, as: ownerActor }),
            ),
            application,
            credentials: {
              read: (scope) => memory.read(scope),
              remove: (scope) => memory.remove(scope),
              async write(scope, key) {
                await memory.write(scope, key);
                if (fail) throw Error("acknowledgement lost");
              },
            },
            indexerUrl: "https://synthetic.test",
          });
          try {
            const approving = access.authorize(AccessIntent.Create);
            await new Promise<void>((resolve, reject) => {
              const off = access.subscribe(() => {
                const state = access.getSnapshot().state;
                if (state.phase === AccessPhase.AwaitingApproval) {
                  off();
                  void run.auth
                    .approve(state.approvalUrl)
                    .then(resolve, reject);
                }
              });
            });
            assert.equal((await approving).kind, "approved");
            assert.equal(
              (await access.submitRecoveryPhrase("incorrect")).kind,
              "invalid-phrase",
            );
            assert.equal(
              (await access.submitRecoveryPhrase(run.auth.fixturePhrase)).kind,
              "failed",
            );
            fail = false;
            const ready =
              recovery === "retry"
                ? await access.retrySave()
                : access.continueWithoutSaving();
            assert.equal(ready.kind, "ready");
            assert.equal(access.getSnapshot().state.phase, "ready");
            const file = await bytesFixture({
              bytes: Uint8Array.of(4, 5, 6),
              name: "payload",
            });
            const object = await access.withSession(async (port) => {
              const object = await port.upload({
                file,
                metadata: Uint8Array.of(9),
              });
              await port.pin(object);
              return object;
            });
            assert.equal(
              await access.withSession((port) => port.inspect(object)),
              "pinned",
            );
            const hold = mock.faults.hold({
              actor: ownerActor,
              operation: "share-targets",
            });
            const admitted = access.withSession((port) =>
              port.shares.targets(),
            );
            try {
              await hold.started();
              access.disconnect();
              await assert.rejects(
                access.withSession(async () => "forbidden"),
                { code: "SIA_SESSION_UNAVAILABLE" },
              );
            } finally {
              hold.release();
            }
            assert.deepEqual(await admitted, []);
            assert.equal((await access.reconnect()).kind, "ready");
            assert.deepEqual(
              (
                await access.withSession((port) =>
                  port.events({ cursor: null, limit: 10 }),
                )
              ).events,
              [],
            );
            assert.equal((await access.forget()).kind, "removed");
            assert.equal(
              (await access.reconnect()).kind,
              "missing-credentials",
            );
          } finally {
            access.dispose();
          }
        });
        assert.equal(result.summary.cleanup, "clean");
      } finally {
        await endpoint.close();
        server.close();
        await mock.close();
      }
    },
  );
}
void test(
  "shared denial and cancellation leave application work unavailable",
  { timeout: 5000 },
  async () => {
    const mock = createMockSia();
    const endpoint = createMockHandlers(mock, {
      baseUrl: "https://synthetic.test",
    });
    const server = setupServer(...endpoint.handlers);
    server.listen({ onUnhandledRequest: "error" });
    try {
      await mock.run({ app }, async (run) => {
        const connection = endpoint.connection({
          access: run.auth.registrationAccess,
          as: mock.actor("application"),
        });
        const access = createSiaAccess({
          adapter: sharedAdapter(
            connection,
            run.auth.fixturePhrase,
            endpoint.connection({
              access: run.ownerAccess,
              as: mock.actor("owner"),
            }),
          ),
          application,
          indexerUrl: endpoint.url,
        });
        try {
          for (const action of ["deny", "cancel"] as const) {
            const pending = access.authorize(AccessIntent.Create);
            await new Promise<void>((resolve, reject) => {
              const off = access.subscribe(() => {
                const state = access.getSnapshot().state;
                if (state.phase !== AccessPhase.AwaitingApproval) return;
                off();
                if (action === "deny")
                  void run.auth.deny(state.approvalUrl).then(resolve, reject);
                else {
                  access.cancel();
                  resolve();
                }
              });
            });
            assert.equal(
              (await pending).kind,
              action === "deny" ? "failed" : "cancelled",
            );
            await assert.rejects(
              access.withSession(async () => "forbidden"),
              { code: "SIA_SESSION_UNAVAILABLE" },
            );
          }
        } finally {
          access.dispose();
        }
      });
    } finally {
      await endpoint.close();
      server.close();
      await mock.close();
    }
  },
);
