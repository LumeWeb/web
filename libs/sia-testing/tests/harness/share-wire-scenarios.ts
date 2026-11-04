/** Raw wire tests distinguish bearer capabilities from local opaque reference checks. */
import { expect, it, vi } from "vitest";
import { createMockApplication } from "../../src/client.js";
import { createMockSia } from "../../src/mock.js";
import type { MockSia } from "../../src/mock.js";
import type {
  MockConnection,
  MockEndpoint,
} from "../../src/testing/transport.js";
import { shareApp as app } from "./share-scenarios.js";
interface Bootstrap {
  session: string;
  targets: [{ ref: string }];
}
type Endpoint = MockEndpoint & { close(): Promise<void> };
export function shareWireScenarios(
  start: (mock: MockSia) => Promise<Endpoint>,
) {
  const post = (
    connection: MockConnection & { credential: { keyHex: string } },
    operation: string,
    body: unknown,
  ) =>
    fetch(new URL(`${connection.client}/${operation}`, connection.url), {
      body: JSON.stringify(body),
      headers: { authorization: `Bearer ${connection.credential.keyHex}` },
      method: "POST",
    });
  for (const withdrawal of ["revoke", "deadline"] as const) {
    it(`initial targets omits a grant after ${withdrawal} without losing its sibling`, async () => {
      const mock = createMockSia({
        clock: { start: "2026-01-01T00:00:00.000Z" },
      });
      const endpoint = await start(mock);
      try {
        await mock.run({ app }, async (run) => {
          const actor = mock.actor("editor");
          const share = await run.shares.create({ objects: [] });
          const first = await run.shares.grant(share, {
            as: actor,
            label: "first",
            operations: ["end"],
            ...(withdrawal === "deadline"
              ? { expiresAt: new Date("2026-01-01T00:00:00.010Z") }
              : {}),
          });
          const sibling = await run.shares.grant(share, {
            as: actor,
            label: "sibling",
            operations: ["end"],
          });
          expect(() =>
            endpoint.connection({
              access: run.ownerAccess,
              as: actor,
              shareGrants: [{ ...first }],
            }),
          ).toThrow();
          expect(() =>
            endpoint.connection({
              access: run.ownerAccess,
              as: mock.actor("editor"),
              shareGrants: [first],
            }),
          ).toThrow();
          await mock.run({ app }, (otherRun) => {
            expect(() =>
              endpoint.connection({
                access: otherRun.ownerAccess,
                as: actor,
                shareGrants: [first],
              }),
            ).toThrow();
            return Promise.resolve();
          });
          const installed = [first, sibling];
          const connection = endpoint.connection({
            access: run.ownerAccess,
            as: actor,
            shareGrants: installed,
          });
          installed.length = 0;
          if (withdrawal === "revoke") await run.shares.revokeGrant(first);
          else mock.advanceTime(10);
          const writer = createMockApplication(
            connection,
            connection.credential,
          );
          const empty = createMockApplication(
            connection,
            connection.credential,
          );
          try {
            const targets = await writer.shares.targets();
            expect(targets.map((target) => target.label)).toEqual(["sibling"]);
            expect(await writer.shares.inspect(targets[0]!.ref, null)).toEqual({
              contains: null,
              state: "active",
            });
            await writer.shares.end(targets[0]!.ref);
            expect(await writer.shares.inspect(targets[0]!.ref, null)).toEqual({
              contains: null,
              state: "ended",
            });
            await run.shares.revokeGrant(sibling);
            expect(await empty.shares.targets()).toEqual([]);
          } finally {
            await Promise.all([writer.close(), empty.close()]);
          }
        });
      } finally {
        await endpoint.close();
        await mock.close();
      }
    });
  }
  it("an explicit targets call replaces a cancelled bootstrap before its Fetch rejection settles", async () => {
    const mock = createMockSia();
    const endpoint = await start(mock);
    try {
      await mock.run({ app }, async (run) => {
        const actor = mock.actor("editor");
        const share = await run.shares.create({ objects: [] });
        const grant = await run.shares.grant(share, {
          as: actor,
          label: "list",
          operations: ["end"],
        });
        const connection = endpoint.connection({
          access: run.ownerAccess,
          as: actor,
          shareGrants: [grant],
        });
        const writer = createMockApplication(connection, connection.credential);
        const original = globalThis.fetch;
        let release!: () => void;
        const released = new Promise<void>((resolve) => {
          release = resolve;
        });
        let caught!: () => void;
        const caughtRejection = new Promise<void>((resolve) => {
          caught = resolve;
        });
        let requests = 0;
        const spy = vi
          .spyOn(globalThis, "fetch")
          .mockImplementation(async (...args) => {
            const first = ++requests === 1;
            try {
              return await original(...args);
            } catch (error) {
              if (first) {
                caught();
                await released;
              }
              throw error;
            }
          });
        const hold = mock.faults.hold({ actor, operation: "share-targets" });
        let timer: ReturnType<typeof setTimeout> | undefined;
        try {
          const abort = new AbortController();
          const reason = new Error("first caller stopped");
          const first = writer.shares.targets({ signal: abort.signal });
          const rejected = expect(first).rejects.toBe(reason);
          await hold.started();
          abort.abort(reason);
          await rejected;
          await caughtRejection;
          const targets = await Promise.race([
            writer.shares.targets(),
            new Promise<never>((_, reject) => {
              timer = setTimeout(
                () =>
                  reject(
                    new Error(
                      "explicit targets joined the cancelled bootstrap",
                    ),
                  ),
                500,
              );
            }),
          ]);
          clearTimeout(timer);
          expect(requests).toBe(2);
          expect(targets.map((target) => target.label)).toEqual(["list"]);
          expect(await writer.shares.inspect(targets[0]!.ref, null)).toEqual({
            contains: null,
            state: "active",
          });
          let closed = false;
          const closing = writer.close().then(() => {
            closed = true;
          });
          await Promise.resolve();
          await Promise.resolve();
          expect(closed).toBe(false);
          release();
          await closing;
          await expect(
            writer.shares.inspect(targets[0]!.ref, null),
          ).rejects.toBeDefined();
        } finally {
          clearTimeout(timer);
          release();
          hold.release();
          try {
            await writer.close();
          } finally {
            spy.mockRestore();
          }
        }
      });
    } finally {
      await endpoint.close();
      await mock.close();
    }
  });
  it("wire tokens are bound to their connection and session", async () => {
    const mock = createMockSia();
    const endpoint = await start(mock);
    try {
      await mock.run({ app }, async (run) => {
        const actor = mock.actor("editor");
        const share = await run.shares.create({ objects: [] });
        const grant = await run.shares.grant(share, {
          as: actor,
          label: "list",
          operations: ["end"],
        });
        const connection = endpoint.connection({
          access: run.ownerAccess,
          as: actor,
          shareGrants: [grant],
        });
        const other = endpoint.connection({
          access: run.ownerAccess,
          as: actor,
          shareGrants: [grant],
        });
        const first = (await (
          await post(connection, "app-share-targets", {})
        ).json()) as Bootstrap;
        const second = (await (
          await post(connection, "app-share-targets", {})
        ).json()) as Bootstrap;
        expect(first.session).not.toBe(second.session);
        const ref = first.targets[0].ref;
        for (const [client, session, token] of [
          [connection, second.session, ref],
          [other, first.session, ref],
          [connection, first.session, "00000000-0000-0000-0000-000000000000"],
        ] as const) {
          const response = await post(client, "app-share-end", {
            ref: token,
            session,
          });
          expect(response.ok).toBe(false);
          expect(await response.json()).toMatchObject({
            code: expect.stringMatching(/denied|foreign-handle/) as unknown,
          });
        }
        expect(
          (
            await post(connection, "app-share-inspect", {
              objectId: null,
              ref,
              session: first.session,
            })
          ).ok,
        ).toBe(true);
        expect(
          (
            await post(connection, "app-share-end", {
              ref,
              session: first.session,
            })
          ).ok,
        ).toBe(true);
        const state: unknown = await (
          await post(connection, "app-share-inspect", {
            objectId: null,
            ref,
            session: first.session,
          })
        ).json();
        expect(state).toEqual({ contains: null, state: "ended" });
      });
    } finally {
      await endpoint.close();
      await mock.close();
    }
  });
  it("a lost bootstrap reply is not replayed and another run survives cleanup", async () => {
    const mock = createMockSia();
    const endpoint = await start(mock);
    let release!: () => void;
    const released = new Promise<void>((resolve) => {
      release = resolve;
    });
    let ready!: () => void;
    const readyPromise = new Promise<void>((resolve) => {
      ready = resolve;
    });
    let alive!: ReturnType<typeof createMockApplication>;
    try {
      const otherRun = mock.run({ app }, async (run) => {
        const actor = mock.actor("alive");
        const share = await run.shares.create({ objects: [] });
        const grant = await run.shares.grant(share, {
          as: actor,
          label: "alive",
          operations: ["end"],
        });
        const connection = endpoint.connection({
          access: run.ownerAccess,
          as: actor,
          shareGrants: [grant],
        });
        alive = createMockApplication(connection, connection.credential);
        await alive.shares.targets();
        ready();
        await released;
        await alive.close();
      });
      await readyPromise;
      let stale!: {
        connection: MockConnection & { credential: { keyHex: string } };
        ref: string;
        session: string;
      };
      await mock.run({ app }, async (run) => {
        const actor = mock.actor("lost");
        const share = await run.shares.create({ objects: [] });
        const grant = await run.shares.grant(share, {
          as: actor,
          label: "lost",
          operations: ["end"],
        });
        const connection = endpoint.connection({
          access: run.ownerAccess,
          as: actor,
          shareGrants: [grant],
        });
        const writer = createMockApplication(connection, connection.credential);
        const original = globalThis.fetch;
        let requests = 0;
        const fetchSpy = vi
          .spyOn(globalThis, "fetch")
          .mockImplementation(async (...args) => {
            requests++;
            const response = await original(...args);
            const body = (await response.clone().json()) as Bootstrap;
            stale = {
              connection,
              ref: body.targets[0].ref,
              session: body.session,
            };
            throw new TypeError("synthetic lost bootstrap");
          });
        try {
          await expect(writer.shares.targets()).rejects.toThrow(
            "synthetic lost bootstrap",
          );
          expect(requests).toBe(1);
        } finally {
          fetchSpy.mockRestore();
          await writer.close();
        }
      });
      expect(
        (
          await post(stale.connection, "app-share-inspect", {
            objectId: null,
            ref: stale.ref,
            session: stale.session,
          })
        ).ok,
      ).toBe(false);
      const [target] = await alive.shares.targets();
      expect(await alive.shares.inspect(target!.ref, null)).toEqual({
        contains: null,
        state: "active",
      });
      release();
      await otherRun;
    } finally {
      release();
      await endpoint.close();
      await mock.close();
    }
  });
  it("run cleanup joins held session work while the endpoint stays open", async () => {
    const mock = createMockSia();
    const endpoint = await start(mock);
    let pending: Promise<unknown> | undefined;
    let writer: ReturnType<typeof createMockApplication> | undefined;
    try {
      await mock.run({ app }, async (run) => {
        const actor = mock.actor("editor");
        const share = await run.shares.create({ objects: [] });
        const grant = await run.shares.grant(share, {
          as: actor,
          label: "list",
          operations: ["end"],
        });
        const connection = endpoint.connection({
          access: run.ownerAccess,
          as: actor,
          shareGrants: [grant],
        });
        writer = createMockApplication(connection, connection.credential);
        const [target] = await writer.shares.targets();
        const hold = mock.faults.hold({
          operation: "share-inspect",
          share: grant,
        });
        pending = writer.shares.inspect(target!.ref, null).then(
          () => "completed",
          () => "rejected",
        );
        await hold.started();
      });
      expect(await pending).toBe("rejected");
      expect(
        mock.history().find((row) => row.operation === "share-inspect"),
      ).toMatchObject({ status: "cancelled" });
      await mock.run({ app }, async (run) => {
        const connection = endpoint.connection({
          access: run.ownerAccess,
          as: mock.actor("alive"),
        });
        const alive = createMockApplication(connection, connection.credential);
        expect(await alive.shares.targets()).toEqual([]);
        await alive.close();
      });
    } finally {
      await writer?.close();
      await endpoint.close();
      await mock.close();
    }
  });
  it("cancelling one concurrent targets caller does not cancel its sibling", async () => {
    const mock = createMockSia();
    const endpoint = await start(mock);
    try {
      await mock.run({ app }, async (run) => {
        const actor = mock.actor("editor");
        const connection = endpoint.connection({
          access: run.ownerAccess,
          as: actor,
        });
        const writer = createMockApplication(connection, connection.credential);
        const hold = mock.faults.hold({ actor, operation: "share-targets" });
        const abort = new AbortController();
        const reason = new Error("first caller stopped");
        const first = writer.shares.targets({ signal: abort.signal });
        const failed = expect(first).rejects.toBe(reason);
        const sibling = writer.shares.targets();
        await hold.started();
        abort.abort(reason);
        await failed;
        hold.release();
        expect(await sibling).toEqual([]);
        expect(
          mock.history().filter((row) => row.operation === "share-targets"),
        ).toHaveLength(1);
        await writer.close();
      });
    } finally {
      await endpoint.close();
      await mock.close();
    }
  });
  it("cancelling the only bootstrap caller removes its held read waiter", async () => {
    const mock = createMockSia();
    const endpoint = await start(mock);
    try {
      await mock.run({ app }, async (run) => {
        const actor = mock.actor("editor");
        const connection = endpoint.connection({
          access: run.ownerAccess,
          as: actor,
        });
        const writer = createMockApplication(connection, connection.credential);
        const hold = mock.faults.hold({ actor, operation: "share-targets" });
        let timer: ReturnType<typeof setTimeout> | undefined;
        try {
          const abort = new AbortController();
          const first = writer.shares.targets({ signal: abort.signal });
          const failed = expect(first).rejects.toBeDefined();
          await hold.started();
          abort.abort();
          await failed;
          const receipt = await Promise.race([
            hold.cancelled(),
            new Promise<never>((_, reject) => {
              timer = setTimeout(
                () =>
                  reject(
                    new Error("bootstrap waiter survived caller cancellation"),
                  ),
                500,
              );
            }),
          ]);
          expect(receipt.status).toBe("cancelled");
        } finally {
          clearTimeout(timer);
          hold.release();
          await writer.close();
        }
      });
    } finally {
      await endpoint.close();
      await mock.close();
    }
  });
  it("closing the endpoint joins held share work and closed clients reject locally", async () => {
    const mock = createMockSia();
    const endpoint = await start(mock);
    try {
      await mock.run({ app }, async (run) => {
        const actor = mock.actor("editor");
        const share = await run.shares.create({ objects: [] });
        const grant = await run.shares.grant(share, {
          as: actor,
          label: "list",
          operations: ["end"],
        });
        const connection = endpoint.connection({
          access: run.ownerAccess,
          as: actor,
          shareGrants: [grant],
        });
        const writer = createMockApplication(connection, connection.credential);
        const [target] = await writer.shares.targets();
        const hold = mock.mutationFaults.hold({
          operation: "share-end",
          share: grant,
          stage: "beforeCommit",
        });
        const ending = writer.shares.end(target!.ref);
        const rejected = expect(ending).rejects.toBeDefined();
        await hold.started();
        await endpoint.close();
        await rejected;
        expect(
          mock.history().find((row) => row.operation === "share-end"),
        ).toMatchObject({ committed: false, status: "cancelled" });
        await writer.close();
        const original = globalThis.fetch;
        const fetchSpy = vi
          .spyOn(globalThis, "fetch")
          .mockImplementation(original);
        try {
          await expect(writer.shares.targets()).rejects.toBeDefined();
          expect(fetchSpy).not.toHaveBeenCalled();
        } finally {
          fetchSpy.mockRestore();
        }
      });
    } finally {
      await endpoint.close();
      await mock.close();
    }
  });
}
