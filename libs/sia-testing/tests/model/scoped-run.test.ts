/** Scoped readers must enforce recipient grants and keep each run's mutations owned. */
import { expect, it } from "vitest";
import type { MockRun, MockSia, TestFile } from "../../src/testing/types.js";
import { bytesFixture, createMockSia } from "../../src/testing/mock.js";

const app = {
  description: "Owned mock fixtures",
  id: "a".repeat(64),
  name: "Scoped storage test",
  serviceUrl: "https://example.invalid",
};

async function setup(options: Parameters<typeof createMockSia>[0] = {}) {
  return {
    file: await bytesFixture({
      bytes: Uint8Array.of(1, 2, 3, 4),
      name: "video.mp4",
    }),
    mock: createMockSia(options),
  };
}

it("a recipient can read its attached video but not a private object", async () => {
  const { file, mock } = await setup();
  try {
    await mock.run({ app }, async (run) => {
      const visible = await run.objects.upload({
        file,
        metadata: Uint8Array.of(9),
        name: file.name,
      });
      const privateObject = await run.objects.upload({
        file,
        metadata: Uint8Array.of(8),
        name: "private.mp4",
      });
      const share = await run.shares.create({ objects: [visible] });
      const reader = mock.reader({
        access: share.access,
        as: mock.actor("recipient"),
      });
      const object = await reader.object(visible.id);
      expect(object).toEqual({
        id: visible.id,
        metadata: Uint8Array.of(9),
        sizeBytes: 4,
      });
      const stream = await reader.download(object, { length: 2, offset: 1 });
      expect(new Uint8Array(await new Response(stream).arrayBuffer())).toEqual(
        Uint8Array.of(2, 3),
      );
      await expect(reader.object(privateObject.id)).rejects.toMatchObject({
        code: "denied",
      });
      await expect(
        reader.download({ ...object, id: privateObject.id }),
      ).rejects.toMatchObject({ code: "denied" });
    });
  } finally {
    await mock.close();
  }
});

it("fixture bytes and metadata stay detached from callers", async () => {
  const original = Uint8Array.of(97, 98, 99);
  const file = await bytesFixture({ bytes: original, name: "abc" });
  original.fill(0);
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const metadata = Uint8Array.of(9);
      const object = await run.objects.upload({
        file,
        metadata,
        name: file.name,
      });
      metadata.fill(0);
      expect(object.sha256).toBe(
        "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
      );
      const reader = mock.reader({
        access: run.ownerAccess,
        as: mock.actor("owner"),
      });
      const first = await reader.object(object.id);
      first.metadata.fill(0);
      expect((await reader.object(object.id)).metadata).toEqual(
        Uint8Array.of(9),
      );
      expect(
        new Uint8Array(
          await new Response(await reader.download(first)).arrayBuffer(),
        ),
      ).toEqual(Uint8Array.of(97, 98, 99));
    });
  } finally {
    await mock.close();
  }
});

it("attachment changes and revocation apply to existing readers", async () => {
  const { file, mock } = await setup();
  try {
    await mock.run({ app }, async (run) => {
      const object = await run.objects.upload({
        file,
        metadata: new Uint8Array(),
        name: file.name,
      });
      const share = await run.shares.create({ objects: [] });
      const reader = mock.reader({
        access: share.access,
        as: mock.actor("recipient"),
      });
      expect((await reader.objects({ limit: 1, offset: 0 })).objects).toEqual(
        [],
      );
      await expect(reader.object(object.id)).rejects.toMatchObject({
        code: "denied",
      });
      await run.shares.attach(share, object);
      const resolved = await reader.object(object.id);
      await run.shares.detach(share, object);
      await expect(reader.download(resolved)).rejects.toMatchObject({
        code: "denied",
      });
      await run.shares.attach(share, object);
      await run.shares.revoke(share);
      await run.shares.revoke(share);
      await expect(reader.object(object.id)).rejects.toMatchObject({
        code: "denied",
      });
      await expect(
        reader.objects({ limit: 1, offset: 0 }),
      ).rejects.toMatchObject({ code: "denied" });
    });
  } finally {
    await mock.close();
  }
});

it("a copied access handle grants no read authority", async () => {
  const { file, mock } = await setup();
  try {
    await mock.run({ app }, async (run) => {
      const object = await run.objects.upload({
        file,
        metadata: new Uint8Array(),
        name: file.name,
      });
      const reader = mock.reader({
        access: { ...run.ownerAccess },
        as: mock.actor("forged"),
      });
      await expect(reader.object(object.id)).rejects.toMatchObject({
        code: "denied",
      });
      expect(JSON.stringify(run.ownerAccess)).toBe('"[Sia test access]"');
    });
  } finally {
    await mock.close();
  }
});

it("a run cannot mutate another run's object or sharing key", async () => {
  const { file, mock } = await setup();
  try {
    await mock.run({ app }, async (first) => {
      const firstObject = await first.objects.upload({
        file,
        metadata: new Uint8Array(),
        name: file.name,
      });
      const firstShare = await first.shares.create({ objects: [firstObject] });
      await mock.run({ app }, async (second) => {
        const secondObject = await second.objects.upload({
          file,
          metadata: new Uint8Array(),
          name: file.name,
        });
        await expect(second.objects.delete(firstObject)).rejects.toMatchObject({
          code: "foreign-handle",
        });
        await expect(
          second.shares.attach(firstShare, secondObject),
        ).rejects.toMatchObject({ code: "foreign-handle" });
        await expect(
          second.shares.create({ objects: [firstObject] }),
        ).rejects.toMatchObject({ code: "foreign-handle" });
      });
      expect(await first.objects.inspect(firstObject)).toBe("present");
      const reader = mock.reader({
        access: firstShare.access,
        as: mock.actor("first-recipient"),
      });
      expect((await reader.object(firstObject.id)).sizeBytes).toBe(4);
    });
  } finally {
    await mock.close();
  }
});

it("a copied object handle cannot delete its original", async () => {
  const { file, mock } = await setup();
  try {
    await mock.run({ app }, async (run) => {
      const object = await run.objects.upload({
        file,
        metadata: new Uint8Array(),
        name: file.name,
      });
      await expect(run.objects.delete({ ...object })).rejects.toMatchObject({
        code: "foreign-handle",
      });
      expect(await run.objects.inspect(object)).toBe("present");
    });
  } finally {
    await mock.close();
  }
});

it("deletion removes recipient listing and is repeatable for its owned handle", async () => {
  const { file, mock } = await setup();
  try {
    await mock.run({ app }, async (run) => {
      const object = await run.objects.upload({
        file,
        metadata: new Uint8Array(),
        name: file.name,
      });
      const share = await run.shares.create({ objects: [object] });
      const reader = mock.reader({
        access: share.access,
        as: mock.actor("recipient"),
      });
      await run.objects.delete(object);
      await run.objects.delete(object);
      expect(await run.objects.inspect(object)).toBe("missing");
      expect((await reader.objects({ limit: 10, offset: 0 })).objects).toEqual(
        [],
      );
      await expect(reader.object(object.id)).rejects.toMatchObject({
        code: "denied",
      });
    });
  } finally {
    await mock.close();
  }
});

it("a full listing page requires an empty terminal page", async () => {
  const { file, mock } = await setup();
  try {
    await mock.run({ app }, async (run) => {
      const object = await run.objects.upload({
        file,
        metadata: Uint8Array.of(7),
        name: file.name,
      });
      const share = await run.shares.create({ objects: [object] });
      const reader = mock.reader({
        access: share.access,
        as: mock.actor("recipient"),
      });
      expect(await reader.objects({ limit: 1, offset: 0 })).toEqual({
        done: false,
        nextOffset: 1,
        objects: [{ id: object.id, metadata: Uint8Array.of(7), sizeBytes: 4 }],
      });
      expect(await reader.objects({ limit: 1, offset: 1 })).toEqual({
        done: true,
        nextOffset: 1,
        objects: [],
      });
      await expect(
        reader.objects({ limit: 1, offset: -1 }),
      ).rejects.toMatchObject({ code: "invalid-input" });
      await expect(
        reader.objects({ limit: 0, offset: 0 }),
      ).rejects.toMatchObject({ code: "invalid-input" });
    });
  } finally {
    await mock.close();
  }
});

it("expiry uses the caller-controlled mock clock", async () => {
  const { file, mock } = await setup({
    clock: { start: "2030-01-01T00:00:00Z" },
  });
  try {
    await mock.run({ app }, async (run) => {
      const object = await run.objects.upload({
        file,
        metadata: new Uint8Array(),
        name: file.name,
      });
      const share = await run.shares.create({
        expiresAt: new Date("2030-01-01T00:00:01Z"),
        objects: [object],
      });
      const reader = mock.reader({
        access: share.access,
        as: mock.actor("recipient"),
      });
      expect((await reader.object(object.id)).sizeBytes).toBe(4);
      mock.advanceTime(1000);
      await expect(reader.object(object.id)).rejects.toMatchObject({
        code: "denied",
      });
    });
  } finally {
    await mock.close();
  }
});

it("teardown closes retained readers and mutation methods before returning", async () => {
  const { file, mock } = await setup();
  let reader!: ReturnType<MockSia["reader"]>;
  let retained!: MockRun;
  try {
    const result = await mock.run({ app }, async (run) => {
      retained = run;
      const object = await run.objects.upload({
        file,
        metadata: new Uint8Array(),
        name: file.name,
      });
      reader = mock.reader({
        access: run.ownerAccess,
        as: mock.actor("owner"),
      });
      return object;
    });
    expect(result.summary.cleanup).toBe("clean");
    expect(result.summary.logicalUploadedBytes).toBe(4);
    await expect(reader.object(result.value.id)).rejects.toMatchObject({
      code: "closed",
    });
    await expect(retained.objects.delete(result.value)).rejects.toMatchObject({
      code: "closed",
    });
  } finally {
    await mock.close();
  }
});

it("teardown cancels a retained download even when its caller holds a reader", async () => {
  const { file, mock } = await setup();
  let pending!: ReadableStreamDefaultReader<Uint8Array>;
  try {
    await mock.run({ app }, async (run) => {
      const object = await run.objects.upload({
        file,
        metadata: new Uint8Array(),
        name: file.name,
      });
      const reader = mock.reader({
        access: run.ownerAccess,
        as: mock.actor("owner"),
      });
      pending = (
        await reader.download(await reader.object(object.id))
      ).getReader();
    });
    await expect(pending.read()).rejects.toMatchObject({ name: "AbortError" });
  } finally {
    pending.releaseLock();
    await mock.close();
  }
});

it("a callback failure still closes readers and preserves the original error", async () => {
  const { mock } = await setup();
  const failure = new Error("assertion failed");
  let reader!: ReturnType<MockSia["reader"]>;
  try {
    await expect(
      mock.run({ app }, (run) => {
        reader = mock.reader({
          access: run.ownerAccess,
          as: mock.actor("owner"),
        });
        return Promise.reject(failure);
      }),
    ).rejects.toBe(failure);
    await expect(reader.objects({ limit: 1, offset: 0 })).rejects.toMatchObject(
      { code: "closed" },
    );
  } finally {
    await mock.close();
  }
});

it("a run abort cancels a stalled source without leaving an upload running", async () => {
  const { file, mock } = await setup();
  const controller = new AbortController();
  let cancelled = 0;
  let started!: () => void;
  const ready = new Promise<void>((resolve) => {
    started = resolve;
  });
  const stalled: TestFile = {
    ...file,
    open: () =>
      new ReadableStream<Uint8Array>({
        cancel() {
          cancelled++;
        },
        start() {
          started();
        },
      }),
  };
  try {
    await expect(
      mock.run({ app, signal: controller.signal }, async (run) => {
        const upload = run.objects.upload({
          file: stalled,
          metadata: new Uint8Array(),
          name: file.name,
        });
        await ready;
        controller.abort();
        await expect(upload).rejects.toMatchObject({ name: "AbortError" });
      }),
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(cancelled).toBe(1);
  } finally {
    await mock.close();
  }
});

it("deleting an object does not refund the run's upload allowance", async () => {
  const { file, mock } = await setup();
  try {
    await mock.run(
      { app, limits: { maxLogicalUploadBytes: 4 } },
      async (run) => {
        const object = await run.objects.upload({
          file,
          metadata: new Uint8Array(),
          name: file.name,
        });
        await run.objects.delete(object);
        await expect(
          run.objects.upload({
            file,
            metadata: new Uint8Array(),
            name: file.name,
          }),
        ).rejects.toMatchObject({ code: "limit" });
      },
    );
  } finally {
    await mock.close();
  }
});

it("parallel uploads cannot exceed the object allowance", async () => {
  const { file, mock } = await setup();
  try {
    await mock.run({ app, limits: { maxObjects: 1 } }, async (run) => {
      const outcomes = await Promise.allSettled(
        [0, 1].map(() =>
          run.objects.upload({
            file,
            metadata: new Uint8Array(),
            name: file.name,
          }),
        ),
      );
      expect(outcomes.map((outcome) => outcome.status)).toEqual([
        "fulfilled",
        "rejected",
      ]);
      if (outcomes[1]?.status === "rejected")
        expect(outcomes[1].reason).toMatchObject({ code: "limit" });
    });
  } finally {
    await mock.close();
  }
});

it("a wrong content digest fails before any object becomes readable", async () => {
  const { file, mock } = await setup();
  try {
    await mock.run({ app }, async (run) => {
      const bad = { ...file, sha256: "0".repeat(64) };
      await expect(
        run.objects.upload({
          file: bad,
          metadata: new Uint8Array(),
          name: file.name,
        }),
      ).rejects.toMatchObject({ code: "invalid-input" });
      const reader = mock.reader({
        access: run.ownerAccess,
        as: mock.actor("owner"),
      });
      expect((await reader.objects({ limit: 10, offset: 0 })).objects).toEqual(
        [],
      );
    });
  } finally {
    await mock.close();
  }
});
