/** Managed disk inputs are validated before buffering can erase their original chunk boundaries. */
import * as fs from "node:fs/promises";
import { expect, it } from "vitest";
import { bytesFixture, createMockSia } from "../../src/mock.js";
import { createMockSiaWithBackend } from "../../src/testing/mock.js";
import { createNodePayloadOwner } from "../../src/testing/node-payload-store.js";
import { createMockNetworkWithPayloadOwner } from "../../src/sdk/index.js";
import type { TestFile } from "../../src/testing/types.js";

const app = {
  description: "Source policy",
  id: "a".repeat(64),
  name: "Managed",
  serviceUrl: "https://example.invalid",
};
const limits = {
  maxLogicalUploadBytes: 262144,
  maxObjectBytes: 131072,
  maxRetainedBytes: 262144,
  maxUploadAttempts: 4,
};

function fixture(budgets = limits) {
  let owner!: Awaited<ReturnType<typeof createNodePayloadOwner>>;
  let network!: ReturnType<typeof createMockNetworkWithPayloadOwner>;
  let removedBeforeReset = false;
  let removed = false;
  const mock = createMockSiaWithBackend(
    {},
    {
      async create(model) {
        const reset = model.reset.bind(model);
        model.reset = () => {
          removedBeforeReset = removed;
          reset();
        };
        owner = await createNodePayloadOwner(budgets, {
          ...fs,
          async rmdir(path) {
            await fs.rmdir(path);
            removed = true;
          },
        });
        network = createMockNetworkWithPayloadOwner({ model }, owner);
        return { network, owner };
      },
      limits: budgets,
    },
  );
  return {
    mock,
    network: () => network,
    owner: () => owner,
    removedBeforeReset: () => removedBeforeReset,
  };
}

const cases: {
  create(): { bytes: Uint8Array; value: unknown };
  name: string;
}[] = [
  {
    create() {
      const bytes = new Uint8Array(65537).fill(1);
      return { bytes, value: bytes };
    },
    name: "65537-byte view",
  },
  {
    create() {
      const view = new Uint8Array(new ArrayBuffer(65537), 0, 1);
      view[0] = 1;
      return { bytes: new Uint8Array([1]), value: view };
    },
    name: "one-byte view over 65537-byte backing",
  },
  {
    create() {
      const view = new Uint8Array(new SharedArrayBuffer(1));
      view[0] = 1;
      return { bytes: new Uint8Array([1]), value: view };
    },
    name: "shared backing",
  },
  {
    create() {
      const view = new Uint8Array(new ArrayBuffer(1, { maxByteLength: 2 }));
      view[0] = 1;
      return { bytes: new Uint8Array([1]), value: view };
    },
    name: "resizable backing",
  },
  {
    create() {
      const view = new Uint8Array(1);
      structuredClone(view.buffer, { transfer: [view.buffer] });
      return { bytes: new Uint8Array(), value: view };
    },
    name: "detached backing",
  },
  {
    create() {
      return { bytes: new Uint8Array([1]), value: "not bytes" };
    },
    name: "invalid chunk",
  },
];

it.each(
  cases.filter(
    (test) =>
      test.name !== "resizable backing" ||
      Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "resizable") !==
        undefined,
  ),
)(
  "rejects original managed $name and cleans its single admission before reset",
  async (test) => {
    const state = fixture();
    let reads = 0;
    let cancels = 0;
    let reason: unknown;
    try {
      const result = await state.mock.run({ app }, async (run) => {
        const input = test.create();
        const base = await bytesFixture({ bytes: input.bytes, name: "input" });
        const file: TestFile = {
          ...base,
          open() {
            expect(state.owner().resources()).toMatchObject({
              attempts: 1,
              entries: 1,
              writers: 1,
            });
            return new ReadableStream<Uint8Array>(
              {
                cancel(value) {
                  cancels++;
                  reason = value;
                },
                pull(controller) {
                  reads++;
                  if (reads === 1)
                    controller.enqueue(input.value as Uint8Array);
                  else controller.close();
                },
              },
              { highWaterMark: 0 },
            );
          },
        };
        const outcome = await run.objects
          .upload({ file, metadata: new Uint8Array() })
          .then(
            () => ({ error: undefined as unknown, failed: false }),
            (error: unknown) => ({ error, failed: true }),
          );
        expect(outcome.failed).toBe(true);
        expect(reason).toBe(outcome.error);
        expect(reads).toBe(1);
        expect(cancels).toBe(1);
        expect(
          state
            .network()
            .control.requests()
            .filter((entry) => entry.operation === "upload"),
        ).toHaveLength(0);
        expect(state.network().model.accountStats(run.id)).toEqual({
          objectCount: 0,
          pinnedSize: 0,
        });
        expect(state.owner().resources()).toMatchObject({
          attempts: 1,
          entries: 0,
          retainedBytes: 0,
          writers: 0,
        });
        expect(await fs.readdir(state.owner().root)).toEqual([]);
        const sibling = await run.objects.upload({
          file: await bytesFixture({
            bytes: new Uint8Array([7]),
            name: "sibling",
          }),
          metadata: new Uint8Array(),
        });
        expect(await run.objects.inspect(sibling)).toBe("present");
        expect(state.owner().resources().attempts).toBe(2);
      });
      expect(result.summary.logicalUploadedBytes).toBe(1);
      expect(state.removedBeforeReset()).toBe(true);
      await expect(fs.stat(state.owner().root)).rejects.toMatchObject({
        code: "ENOENT",
      });
    } finally {
      await state.mock.close();
    }
  },
);

it("counts original empty managed chunks rather than the completed buffer's generated spool blocks", async () => {
  const state = fixture();
  let reads = 0;
  let cancels = 0;
  const empty = new Uint8Array();
  try {
    await state.mock.run({ app }, async (run) => {
      const base = await bytesFixture({ bytes: empty, name: "empty chunks" });
      const file = {
        ...base,
        open: () =>
          new ReadableStream<Uint8Array>(
            {
              cancel() {
                cancels++;
              },
              pull(controller) {
                reads++;
                if (reads <= 131073) controller.enqueue(empty);
                else controller.close();
              },
            },
            { highWaterMark: 0 },
          ),
      };
      await expect(
        run.objects.upload({ file, metadata: empty }),
      ).rejects.toMatchObject({ code: "invalid-input" });
      expect(reads).toBe(131073);
      expect(cancels).toBe(1);
      expect(state.owner().resources()).toMatchObject({
        attempts: 1,
        entries: 0,
        retainedBytes: 0,
        writers: 0,
      });
      expect(await fs.readdir(state.owner().root)).toEqual([]);
      expect(state.network().control.requests()).toEqual([]);
    });
    expect(state.removedBeforeReset()).toBe(true);
  } finally {
    await state.mock.close();
  }
});

it("accepts aligned original chunks and retains uncapped managed metadata with one admission", async () => {
  const state = fixture();
  try {
    const result = await state.mock.run({ app }, async (run) => {
      const bytes = new Uint8Array(65537).fill(9);
      const base = await bytesFixture({ bytes, name: "aligned" });
      let reads = 0;
      const file = {
        ...base,
        open: () =>
          new ReadableStream<Uint8Array>(
            {
              pull(c) {
                reads++;
                if (reads === 1) c.enqueue(new Uint8Array(65536).fill(9));
                else if (reads === 2) c.enqueue(new Uint8Array([9]));
                else c.close();
              },
            },
            { highWaterMark: 0 },
          ),
      };
      const metadata = new Uint8Array(16385).fill(6);
      const object = await run.objects.upload({ file, metadata });
      const reader = state.mock.reader({
        access: run.ownerAccess,
        as: state.mock.actor("reader"),
      });
      try {
        expect((await reader.object(object.id)).metadata).toEqual(metadata);
        expect(
          await new Response(await reader.download({ id: object.id })).bytes(),
        ).toEqual(bytes);
      } finally {
        await reader.close();
      }
      expect(reads).toBe(3);
      expect(state.owner().resources()).toMatchObject({
        attempts: 1,
        entries: 1,
        writers: 0,
      });
    });
    expect(result.summary.logicalUploadedBytes).toBe(65537);
    expect(state.removedBeforeReset()).toBe(true);
  } finally {
    await state.mock.close();
  }
});

it("keeps default buffered managed backing-buffer acceptance unchanged", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const base = await bytesFixture({
        bytes: new Uint8Array([1]),
        name: "buffered",
      });
      const value = new Uint8Array(new ArrayBuffer(65537), 0, 1);
      value[0] = 1;
      const object = await run.objects.upload({
        file: {
          ...base,
          open: () =>
            new ReadableStream({
              start(c) {
                c.enqueue(value);
                c.close();
              },
            }),
        },
        metadata: new Uint8Array(),
      });
      expect(await run.objects.inspect(object)).toBe("present");
    });
  } finally {
    await mock.close();
  }
});

it.each([
  { name: "undefined", value: undefined },
  { name: "NaN", value: NaN },
  { name: "same reason", value: undefined },
])(
  "retains actual producer rejection $name after rejecting the original managed backing",
  async ({ name, value }) => {
    const state = fixture();
    let validationReason: unknown;
    let cancellationFailure: unknown;
    let uploadFailure: unknown;
    let reads = 0;
    let cancels = 0;
    try {
      const outcome = await state.mock
        .run({ app }, async (run) => {
          const base = await bytesFixture({
            bytes: new Uint8Array([1]),
            name: "invalid backing",
          });
          const view = new Uint8Array(new ArrayBuffer(65537), 0, 1);
          view[0] = 1;
          const file = {
            ...base,
            open: () =>
              new ReadableStream<Uint8Array>(
                {
                  cancel(reason) {
                    cancels++;
                    validationReason = reason;
                    cancellationFailure =
                      name === "same reason" ? reason : value;
                    // oxlint-disable-next-line typescript/prefer-promise-reject-errors -- Deliberate producer rejection values exercise original cleanup provenance.
                    return Promise.reject(cancellationFailure);
                  },
                  pull(c) {
                    reads++;
                    if (reads === 1) c.enqueue(view);
                    else c.close();
                  },
                },
                { highWaterMark: 0 },
              ),
          };
          uploadFailure = await run.objects
            .upload({ file, metadata: new Uint8Array() })
            .then(
              () => undefined,
              (error: unknown) => error,
            );
          expect(uploadFailure).toBeInstanceOf(AggregateError);
          expect((uploadFailure as AggregateError).errors).toHaveLength(2);
          expect((uploadFailure as AggregateError).errors[0]).toBe(
            validationReason,
          );
          expect((uploadFailure as AggregateError).errors[1]).toBe(
            cancellationFailure,
          );
          expect(reads).toBe(1);
          expect(cancels).toBe(1);
          expect(state.owner().resources()).toMatchObject({
            attempts: 1,
            entries: 0,
            retainedBytes: 0,
            writers: 0,
          });
          expect(await fs.readdir(state.owner().root)).toEqual([]);
          expect(state.network().control.requests()).toEqual([]);
        })
        .then(
          () => undefined,
          (error: unknown) => error,
        );
      expect(outcome).toBeInstanceOf(AggregateError);
      expect((outcome as AggregateError).errors).toContain(uploadFailure);
      expect(state.removedBeforeReset()).toBe(true);
      await expect(fs.stat(state.owner().root)).rejects.toMatchObject({
        code: "ENOENT",
      });
    } finally {
      await state.mock.close();
    }
  },
);

it("keeps a failed managed logical reservation while refunding only confirmed physical removal", async () => {
  const state = fixture({
    ...limits,
    maxLogicalUploadBytes: 2,
    maxObjectBytes: 1,
    maxRetainedBytes: 8,
  });
  try {
    const result = await state.mock.run({ app }, async (run) => {
      const base = await bytesFixture({
        bytes: new Uint8Array([1]),
        name: "one",
      });
      const view = new Uint8Array(new ArrayBuffer(65537), 0, 1);
      view[0] = 1;
      await expect(
        run.objects.upload({
          file: {
            ...base,
            open: () =>
              new ReadableStream({
                start(c) {
                  c.enqueue(view);
                },
              }),
          },
          metadata: new Uint8Array(),
        }),
      ).rejects.toMatchObject({ code: "invalid-input" });
      expect(state.owner().resources()).toMatchObject({
        attempts: 1,
        retainedBytes: 0,
      });
      await run.objects.upload({ file: base, metadata: new Uint8Array() });
      let opens = 0;
      await expect(
        run.objects.upload({
          file: {
            ...base,
            open() {
              opens++;
              return base.open();
            },
          },
          metadata: new Uint8Array(),
        }),
      ).rejects.toMatchObject({ code: "limit" });
      expect(opens).toBe(0);
      expect(state.owner().resources()).toMatchObject({
        attempts: 2,
        retainedBytes: 1,
      });
    });
    expect(result.summary.logicalUploadedBytes).toBe(1);
  } finally {
    await state.mock.close();
  }
});
