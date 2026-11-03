/** Owner inspection must observe fixture changes through every supported adapter without granting recipient authority. */
import { expect, it } from "vitest";
import { setupServer } from "msw/node";
import * as client from "../../src/client.js";
import { bytesFixture, createMockSia } from "../../src/mock.js";
import { startMockServer } from "../../src/http.js";
import { createMockHandlers } from "../../src/msw.js";
import type {
  ActorRef,
  BrowserAccess,
  MockRun,
  MockSia,
  OwnerSharePort,
} from "../../src/mock.js";

const app = {
  description: "Owner reads",
  id: "a".repeat(64),
  name: "Owner",
  serviceUrl: "https://example.invalid",
};
const modes = ["direct", "http", "msw"] as const;
type Endpoint =
  | Awaited<ReturnType<typeof startMockServer>>
  | ReturnType<typeof createMockHandlers>;

type Mode = (typeof modes)[number];
const transports = new WeakMap<
  MockSia,
  {
    endpoint: Endpoint;
    interception?: ReturnType<typeof setupServer>;
    users: number;
  }
>();
async function connect(
  mode: Mode,
  mock: MockSia,
  access: BrowserAccess,
  actor: ActorRef,
) {
  if (mode === "direct") {
    const port = mock.ownerShares({ access, as: actor });
    return { close: () => port.close(), port };
  }
  if (typeof client.createMockOwnerShares !== "function")
    throw new Error("Public owner-share client is not available");
  let transport = transports.get(mock);
  if (!transport) {
    const endpoint =
      mode === "http"
        ? await startMockServer(mock)
        : createMockHandlers(mock, {
            baseUrl: "https://owner.example.invalid/",
          });
    const interception =
      "handlers" in endpoint && Array.isArray(endpoint.handlers)
        ? setupServer(
            ...(endpoint.handlers as ReturnType<
              typeof createMockHandlers
            >["handlers"]),
          )
        : undefined;
    interception?.listen({ onUnhandledRequest: "error" });
    transport = {
      endpoint,
      users: 0,
      ...(interception ? { interception } : {}),
    };
    transports.set(mock, transport);
  }
  const bound = transport;
  bound.users++;
  const connection = bound.endpoint.connection({ access, as: actor });
  const port = client.createMockOwnerShares(connection, connection.credential);
  return {
    async close() {
      await port.close();
      if (--bound.users === 0) {
        if ("close" in bound.endpoint) await bound.endpoint.close();
        bound.interception?.close();
        transports.delete(mock);
      }
    },
    port,
  };
}
async function fixture(
  mode: Mode,
  use: (
    mock: MockSia,
    run: MockRun,
    port: OwnerSharePort,
    actor: ActorRef,
  ) => Promise<void>,
) {
  const mock = createMockSia({ clock: { start: "2026-01-01T00:00:00Z" } });
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("owner");
      const bound = await connect(mode, mock, run.ownerAccess, actor);
      try {
        await use(mock, run, bound.port, actor);
      } finally {
        await bound.close();
      }
    });
  } finally {
    await mock.close();
  }
}

it.each(modes)(
  "%s owner descriptions and logical totals follow attachments and deletion",
  (mode) =>
    fixture(mode, async (_mock, run, port) => {
      const file = await bytesFixture({
        bytes: Uint8Array.of(1, 2, 3),
        name: "note",
      });
      const object = await run.objects.upload({
        file,
        metadata: Uint8Array.of(4),
        name: file.name,
      });
      const share = await run.shares.create({
        description: "Reading list",
        objects: [],
      });
      const page = await port.list({ limit: 10, offset: 0 });
      expect(page.items).toHaveLength(1);
      const ref = page.items[0]!.ref;
      expect(await port.detail(ref)).toMatchObject({
        description: "Reading list",
        statistics: { logicalBytes: 0, objectCount: 0 },
      });
      expect(JSON.stringify(page)).not.toContain(share.id);
      expect(JSON.stringify(page)).not.toContain("credential");
      await run.shares.attach(share, object);
      expect((await port.detail(ref)).statistics).toEqual({
        logicalBytes: 3,
        objectCount: 1,
      });
      const contents = await port.objects(ref, { limit: 10, offset: 0 });
      expect(contents.items).toEqual([
        { id: object.id, metadata: Uint8Array.of(4), sizeBytes: 3 },
      ]);
      contents.items[0]!.metadata[0] = 99;
      expect(
        (await port.objects(ref, { limit: 10, offset: 0 })).items[0]!.metadata,
      ).toEqual(Uint8Array.of(4));
      await run.shares.detach(share, object);
      expect((await port.detail(ref)).statistics).toEqual({
        logicalBytes: 0,
        objectCount: 0,
      });
      await run.shares.attach(share, object);
      await run.objects.delete(object);
      expect((await port.objects(ref, { limit: 10, offset: 0 })).items).toEqual(
        [],
      );
      expect((await port.detail(ref)).statistics).toEqual({
        logicalBytes: 0,
        objectCount: 0,
      });
    }),
);

it.each(modes)(
  "%s owners inspect expired shares while recipients lose access",
  (mode) =>
    fixture(mode, async (mock, run, port) => {
      const file = await bytesFixture({
        bytes: Uint8Array.of(1),
        name: "note",
      });
      const object = await run.objects.upload({
        file,
        metadata: new Uint8Array(),
        name: file.name,
      });
      const share = await run.shares.create({
        expiresAt: new Date("2026-01-01T00:00:01Z"),
        objects: [object],
      });
      const recipient = mock.reader({
        access: share.access,
        as: mock.actor("recipient"),
      });
      try {
        const ref = (await port.list({ limit: 1, offset: 0 })).items[0]!.ref;
        mock.advanceTime(1001);
        expect((await port.detail(ref)).statistics).toEqual({
          logicalBytes: 1,
          objectCount: 1,
        });
        expect(
          (await port.objects(ref, { limit: 1, offset: 0 })).items,
        ).toHaveLength(1);
        await expect(recipient.object(object.id)).rejects.toMatchObject({
          code: "denied",
        });
        await run.shares.revoke(share);
        expect((await port.list({ limit: 10, offset: 0 })).items).toEqual([]);
        await expect(port.detail(ref)).rejects.toMatchObject({
          code: "not-found",
        });
      } finally {
        await recipient.close();
      }
    }),
);

it.each(modes)("%s owner references reject copying and foreign runs", (mode) =>
  fixture(mode, async (mock, run, port) => {
    await run.shares.create({ objects: [] });
    const ref = (await port.list({ limit: 1, offset: 0 })).items[0]!.ref;
    await expect(port.detail({ ...ref })).rejects.toMatchObject({
      code: "foreign-handle",
    });
    await mock.run({ app }, async (other) => {
      const bound = await connect(
        mode,
        mock,
        other.ownerAccess,
        mock.actor("other"),
      );
      try {
        await expect(bound.port.detail(ref)).rejects.toMatchObject({
          code: "foreign-handle",
        });
      } finally {
        await bound.close();
      }
      expect((await port.list({ limit: 1, offset: 0 })).items).toHaveLength(1);
    });
  }),
);

it.each(modes)(
  "%s recipient and registration credentials cannot inspect owner shares",
  (mode) =>
    fixture(mode, async (mock, run) => {
      const share = await run.shares.create({ objects: [] });
      for (const access of [share.access, run.auth.registrationAccess]) {
        const bound = await connect(
          mode,
          mock,
          access,
          mock.actor("not-owner"),
        );
        try {
          await expect(
            bound.port.list({ limit: 1, offset: 0 }),
          ).rejects.toMatchObject({ code: "denied" });
        } finally {
          await bound.close();
        }
      }
    }),
);

it.each(modes)(
  "%s owner pages require valid bounds and finish with an empty terminal page",
  (mode) =>
    fixture(mode, async (_mock, run, port) => {
      for (const description of ["A", "B", "C"])
        await run.shares.create({ description, objects: [] });
      const first = await port.list({ limit: 3, offset: 0 });
      expect(first.items.map((item) => item.description).sort()).toEqual([
        "A",
        "B",
        "C",
      ]);
      expect(first.done).toBe(false);
      expect(first.nextOffset).toBe(3);
      expect(await port.list({ limit: 3, offset: 3 })).toEqual({
        done: true,
        items: [],
        nextOffset: 3,
      });
      expect((await port.list({ limit: 3, offset: 0 })).items).toEqual(
        first.items,
      );
      for (const page of [
        { limit: 1, offset: -1 },
        { limit: 0, offset: 0 },
        { limit: 1, offset: 0.5 },
        { limit: Number.MAX_SAFE_INTEGER + 1, offset: 0 },
      ]) {
        await expect(port.list(page)).rejects.toMatchObject({
          code: "invalid-input",
        });
      }
    }),
);

it.each(modes)(
  "%s aborting or closing held owner reads joins cancellation",
  (mode) =>
    fixture(mode, async (mock, _run, port, actor) => {
      for (const close of [false, true]) {
        const hold = mock.faults.hold({ actor, operation: "owner-shares" });
        const abort = new AbortController();
        const pending = port.list({
          limit: 1,
          offset: 0,
          signal: abort.signal,
        });
        const rejected = expect(pending).rejects.toMatchObject({
          name: "AbortError",
        });
        try {
          await hold.started();
          if (close) await port.close();
          else abort.abort();
          await rejected;
          expect((await hold.cancelled()).status).toBe("cancelled");
        } finally {
          hold.release();
          await pending.catch(() => undefined);
        }
      }
      await port.close();
      await expect(port.list({ limit: 1, offset: 0 })).rejects.toMatchObject({
        code: "closed",
      });
    }),
);

it.each(modes)(
  "%s held detail rechecks revocation and finite faults are consumed",
  (mode) =>
    fixture(mode, async (mock, run, port, actor) => {
      const share = await run.shares.create({ objects: [] });
      const ref = (await port.list({ limit: 1, offset: 0 })).items[0]!.ref;
      mock.faults.fail(
        { actor, operation: "owner-share" },
        { code: "unavailable", times: 1 },
      );
      await expect(port.detail(ref)).rejects.toMatchObject({
        code: "unavailable",
      });
      expect((await port.detail(ref)).statistics.objectCount).toBe(0);
      const hold = mock.faults.hold({ actor, operation: "owner-share" });
      const pending = port.detail(ref);
      const rejected = expect(pending).rejects.toMatchObject({
        code: "not-found",
      });
      try {
        await hold.started();
        await run.shares.revoke(share);
        hold.release();
        await rejected;
      } finally {
        hold.release();
        await pending.catch(() => undefined);
      }
    }),
);

it("run cleanup cancels a retained owner request before releasing its state", async () => {
  const mock = createMockSia();
  let pending: Promise<unknown> | undefined;
  let retained: OwnerSharePort | undefined;
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("retained");
      retained = mock.ownerShares({ access: run.ownerAccess, as: actor });
      const hold = mock.faults.hold({ actor, operation: "owner-shares" });
      pending = retained
        .list({ limit: 1, offset: 0 })
        .catch((error: unknown) => error);
      await hold.started();
    });
    expect(await pending).toMatchObject({ name: "AbortError" });
    await expect(retained!.list({ limit: 1, offset: 0 })).rejects.toMatchObject(
      { code: "closed" },
    );
    await retained!.close();
  } finally {
    await mock.close();
  }
});

it("owner statistics do not copy metadata and contents only copy the requested page", () =>
  fixture("direct", async (_mock, run, port) => {
    const file = await bytesFixture({
      bytes: Uint8Array.of(1, 2, 3),
      name: "note",
    });
    const objects = [];
    for (let i = 0; i < 2; i++)
      objects.push(
        await run.objects.upload({
          file,
          metadata: new Uint8Array(17),
          name: file.name,
        }),
      );
    await run.shares.create({ objects });
    const Original = globalThis.Uint8Array;
    let copies = 0;
    let allowance = 0;
    // Reject excess allocations rather than depending on machine speed or heap size.
    globalThis.Uint8Array = new Proxy(Original, {
      construct(target, args) {
        if (
          args[0] instanceof Original &&
          args[0].length === 17 &&
          ++copies > allowance
        )
          throw new Error("Unrequested metadata copy");
        return Reflect.construct(target, args) as Uint8Array;
      },
    });
    try {
      const ref = (await port.list({ limit: 1, offset: 0 })).items[0]!.ref;
      expect((await port.detail(ref)).statistics).toEqual({
        logicalBytes: 6,
        objectCount: 2,
      });
      await expect(
        port.objects(ref, { limit: 0, offset: 0 }),
      ).rejects.toMatchObject({ code: "invalid-input" });
      allowance = 1;
      expect(
        (await port.objects(ref, { limit: 1, offset: 0 })).items,
      ).toHaveLength(1);
      expect(copies).toBe(1);
    } finally {
      globalThis.Uint8Array = Original;
    }
  }));

it.each(["http", "msw"] as const)(
  "%s detail captures its abort signal before the call starts",
  (mode) =>
    fixture(mode, async (_mock, run, port) => {
      await run.shares.create({ objects: [] });
      const ref = (await port.list({ limit: 1, offset: 0 })).items[0]!.ref;
      const controller = new AbortController();
      const options = { signal: controller.signal };
      const pending = port.detail(ref, options);
      options.signal = new AbortController().signal;
      controller.abort();
      await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    }),
);

it.each(["http", "msw"] as const)(
  "%s wire tokens stay on their connection and substituted keys cannot upgrade authority",
  (mode) =>
    fixture(mode, async (mock, run) => {
      const share = await run.shares.create({ objects: [] });
      const endpoint = transports.get(mock)!.endpoint;
      const first = endpoint.connection({
        access: run.ownerAccess,
        as: mock.actor("first"),
      });
      const second = endpoint.connection({
        access: run.ownerAccess,
        as: mock.actor("second"),
      });
      async function raw(
        binding: typeof first,
        operation: string,
        key = binding.credential.keyHex,
      ) {
        return fetch(`${binding.url}${binding.client}/${operation}`, {
          headers: { authorization: `Bearer ${key}` },
        });
      }
      const page = (await (
        await raw(first, "owner-shares?offset=0&limit=1")
      ).json()) as { items: { ref: string }[] };
      const token = page.items[0]!.ref;
      expect((await raw(first, `owner-share?ref=${token}`)).status).toBe(200);
      expect(
        await (await raw(second, `owner-share?ref=${token}`)).json(),
      ).toEqual({ code: "foreign-handle" });
      for (const access of [share.access, run.auth.registrationAccess]) {
        const restricted = endpoint.connection({
          access,
          as: mock.actor("restricted"),
        });
        expect(
          await (
            await raw(
              restricted,
              "owner-shares?offset=0&limit=1",
              first.credential.keyHex,
            )
          ).json(),
        ).toEqual({ code: "denied" });
      }
      await mock.run({ app }, async (other) => {
        const foreign = endpoint.connection({
          access: other.ownerAccess,
          as: mock.actor("foreign"),
        });
        expect(
          await (await raw(foreign, `owner-share?ref=${token}`)).json(),
        ).toEqual({ code: "foreign-handle" });
        expect(
          await (
            await raw(
              first,
              `owner-share?ref=${token}`,
              foreign.credential.keyHex,
            )
          ).json(),
        ).toEqual({ code: "foreign-handle" });
      });
    }),
);

it.each(modes)("%s owner faults affect only their selected actor", (mode) =>
  fixture(mode, async (mock, run, port, actor) => {
    await run.shares.create({ description: "Owned", objects: [] });
    const other = await connect(
      mode,
      mock,
      run.ownerAccess,
      mock.actor("unaffected"),
    );
    try {
      mock.faults.fail(
        { actor, operation: "owner-shares" },
        { code: "unavailable", times: 1 },
      );
      expect(
        (await other.port.list({ limit: 1, offset: 0 })).items,
      ).toHaveLength(1);
      await expect(port.list({ limit: 1, offset: 0 })).rejects.toMatchObject({
        code: "unavailable",
      });
      const hold = mock.faults.hold({ actor, operation: "owner-shares" });
      const pending = port.list({ limit: 1, offset: 0 });
      try {
        await hold.started();
        expect(
          (await other.port.list({ limit: 1, offset: 0 })).items[0]!
            .description,
        ).toBe("Owned");
        hold.release();
        expect((await pending).items).toHaveLength(1);
      } finally {
        hold.release();
        await pending;
      }
    } finally {
      await other.close();
    }
  }),
);

it.each(["http", "msw"] as const)(
  "%s raw request abort cancels a held owner read",
  (mode) =>
    fixture(mode, async (mock, run) => {
      const actor = mock.actor("raw disconnect");
      const binding = transports
        .get(mock)!
        .endpoint.connection({ access: run.ownerAccess, as: actor });
      const hold = mock.faults.hold({ actor, operation: "owner-shares" });
      const abort = new AbortController();
      const pending = fetch(
        `${binding.url}${binding.client}/owner-shares?offset=0&limit=1`,
        {
          headers: { authorization: `Bearer ${binding.credential.keyHex}` },
          signal: abort.signal,
        },
      );
      const rejected = expect(pending).rejects.toMatchObject({
        name: "AbortError",
      });
      try {
        await hold.started();
        abort.abort();
        await rejected;
        expect((await hold.cancelled()).status).toBe("cancelled");
      } finally {
        abort.abort();
        hold.release();
        await pending.catch(() => undefined);
      }
    }),
);

it.each(modes)(
  "%s pre-aborted owner calls do not enter request controls",
  (mode) =>
    fixture(mode, async (mock, run, port) => {
      await run.shares.create({ objects: [] });
      const ref = (await port.list({ limit: 1, offset: 0 })).items[0]!.ref;
      const before = mock.history().length;
      const abort = new AbortController();
      abort.abort();
      await expect(
        port.list({ limit: 1, offset: 0, signal: abort.signal }),
      ).rejects.toMatchObject({ name: "AbortError" });
      await expect(
        port.detail(ref, { signal: abort.signal }),
      ).rejects.toMatchObject({ name: "AbortError" });
      await expect(
        port.objects(ref, { limit: 1, offset: 0, signal: abort.signal }),
      ).rejects.toMatchObject({ name: "AbortError" });
      expect(mock.history()).toHaveLength(before);
    }),
);
