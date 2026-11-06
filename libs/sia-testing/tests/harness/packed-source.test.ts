/** Collector failures and storage checks use real streams and the shared mock backend. */
import { afterEach, expect, it, vi } from "vitest";
import { createMockSia } from "../../src/mock.js";
import * as sdkModule from "../../src/sdk/index.js";

const app = {
  description: "Packed sources",
  id: "a".repeat(64),
  name: "Sources",
  serviceUrl: "https://example.invalid",
};
const containsIdentity = (value: unknown, target: unknown): boolean =>
  Object.is(value, target) ||
  (value instanceof AggregateError &&
    value.errors.some((item: unknown) => containsIdentity(item, target)));
afterEach(() => vi.restoreAllMocks());

it.each([
  new Error("source read failed"),
  new AggregateError([new Error("source item")], "source read failed"),
])(
  "a handled source %s does not become a cleanup failure",
  async (sourceError) => {
    const mock = createMockSia();
    let cancelled = 0;
    try {
      await mock.run({ app }, async (run) => {
        const sdk = mock.packedSdk({
          access: run.ownerAccess,
          as: mock.actor("writer"),
          maxBytes: 8,
          maxObjects: 1,
          platform: "browser",
        });
        const upload = sdk.uploadPacked();
        await expect(
          upload.add(
            new ReadableStream(
              {
                cancel() {
                  cancelled++;
                },
                pull(controller) {
                  controller.error(sourceError);
                },
              },
              { highWaterMark: 0 },
            ),
          ),
        ).rejects.toBe(sourceError);
        await expect(upload.dispose()).resolves.toBeUndefined();
        await expect(sdk.close()).resolves.toBeUndefined();
      });
      expect(cancelled).toBe(0);
    } finally {
      await mock.close();
    }
  },
);

it.each([
  undefined,
  NaN,
  new Error("source cancel failed"),
  new AggregateError([new Error("cancel item")], "source cancel failed"),
])(
  "a real distinct cancellation %s remains in add, dispose, close and run failures",
  async (cancelError) => {
    const mock = createMockSia();
    let cancelCalls = 0;
    let closeFailure: unknown;
    try {
      const outcome = await mock
        .run({ app }, async (run) => {
          const sdk = mock.packedSdk({
            access: run.ownerAccess,
            as: mock.actor("writer"),
            maxBytes: 8,
            maxObjects: 1,
            platform: "browser",
          });
          const upload = sdk.uploadPacked();
          let started!: () => void;
          const reading = new Promise<void>((resolve) => {
            started = resolve;
          });
          const adding = upload
            .add(
              new ReadableStream(
                {
                  cancel() {
                    cancelCalls++;
                    // oxlint-disable-next-line typescript/only-throw-error -- Arbitrary producer rejection must remain observable.
                    throw cancelError;
                  },
                  pull() {
                    started();
                  },
                },
                { highWaterMark: 0 },
              ),
            )
            .then(
              (value) => ({ value }),
              (error: unknown) => ({ error }),
            );
          try {
            await reading;
            upload.cancel();
            const result = await adding;
            expect(result).toHaveProperty("error");
            if ("error" in result)
              expect(containsIdentity(result.error, cancelError)).toBe(true);
            const disposed = await upload.dispose().then(
              (value) => ({ value }),
              (error: unknown) => ({ error }),
            );
            expect(disposed).toHaveProperty("error");
            if ("error" in disposed)
              expect(containsIdentity(disposed.error, cancelError)).toBe(true);
            const closing = sdk.close();
            expect(sdk.close()).toBe(closing);
            const closed = await closing.then(
              (value) => ({ value }),
              (error: unknown) => ({ error }),
            );
            expect(closed).toHaveProperty("error");
            if ("error" in closed) {
              closeFailure = closed.error;
              expect(containsIdentity(closed.error, cancelError)).toBe(true);
            }
          } finally {
            upload.cancel();
            await adding;
            await sdk.close().catch(() => undefined);
          }
        })
        .then(
          (value) => ({ value }),
          (error: unknown) => ({ error }),
        );
      expect(outcome).toHaveProperty("error");
      if ("error" in outcome) {
        expect(containsIdentity(outcome.error, cancelError)).toBe(true);
        expect(outcome.error).toBeInstanceOf(AggregateError);
        if (outcome.error instanceof AggregateError) {
          expect(outcome.error.errors).toHaveLength(1);
          expect(outcome.error.errors[0]).toBe(closeFailure);
        }
      }
      expect(cancelCalls).toBe(1);
    } finally {
      await mock.close();
    }
  },
);

it("a handled AggregateError from a real backend operation does not poison disposal", async () => {
  const makeNetwork = sdkModule.createMockNetwork;
  const backendError = new AggregateError(
    [new Error("pin effect acknowledgement")],
    "backend operation failed",
  );
  vi.spyOn(sdkModule, "createMockNetwork").mockImplementation((...args) => {
    const network = makeNetwork(...args);
    const createSdk = network.createSdk.bind(network);
    vi.spyOn(network, "createSdk").mockImplementation((input) => {
      const sdk = createSdk(input);
      const pin = sdk.pinObject.bind(sdk);
      vi.spyOn(sdk, "pinObject").mockImplementation(async (...parameters) => {
        await pin(...parameters);
        throw backendError;
      });
      return sdk;
    });
    return network;
  });
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const sdk = mock.packedSdk({
        access: run.ownerAccess,
        as: mock.actor("writer"),
        maxBytes: 8,
        maxObjects: 1,
        platform: "browser",
      });
      const upload = sdk.uploadPacked();
      await upload.add(
        new ReadableStream({
          start(controller) {
            controller.enqueue(Uint8Array.of(5));
            controller.close();
          },
        }),
      );
      const [object] = await upload.finalize();
      await expect(sdk.pinObject(object!)).rejects.toBe(backendError);
      const reader = mock.reader({
        access: run.ownerAccess,
        as: mock.actor("reader"),
      });
      try {
        expect(
          await new Response(
            await reader.download({ id: object!.id() }),
          ).bytes(),
        ).toEqual(Uint8Array.of(5));
      } finally {
        await reader.close();
      }
      await upload.dispose();
      await sdk.close();
    });
  } finally {
    await mock.close();
  }
});

it("one-byte inputs use a fixed number of owned byte-storage allocations during collection", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const sdk = mock.packedSdk({
        access: run.ownerAccess,
        as: mock.actor("writer"),
        maxBytes: 256,
        maxObjects: 1,
        platform: "browser",
      });
      const upload = sdk.uploadPacked();
      const bytes = Uint8Array.from({ length: 256 }, (_, i) => i);
      const views = Array.from(bytes, (_, i) => bytes.subarray(i, i + 1));
      let offset = 0;
      const source = new ReadableStream<Uint8Array>(
        {
          pull(controller) {
            if (offset === views.length) controller.close();
            else controller.enqueue(views[offset++]!);
          },
        },
        { highWaterMark: 0 },
      );
      const Original = Uint8Array;
      let ownedAllocations = 0;
      const intercepted = new Proxy(Original, {
        construct(target, args, newTarget) {
          // ArrayBuffer-backed views do not own another byte store and are not counted.
          if (typeof args[0] === "number" || ArrayBuffer.isView(args[0]))
            ownedAllocations++;
          return Reflect.construct(target, args, newTarget) as Uint8Array;
        },
      });
      let consumed: number;
      try {
        vi.stubGlobal("Uint8Array", intercepted);
        consumed = await upload.add(source);
      } finally {
        vi.unstubAllGlobals();
      }
      expect(consumed).toBe(256);
      expect(ownedAllocations).toBeLessThanOrEqual(2);
      const [object] = await upload.finalize();
      await sdk.pinObject(object!);
      const reader = mock.reader({
        access: run.ownerAccess,
        as: mock.actor("reader"),
      });
      try {
        expect(
          await new Response(
            await reader.download({ id: object!.id() }),
          ).bytes(),
        ).toEqual(bytes);
      } finally {
        await reader.close();
        await sdk.close();
      }
    });
  } finally {
    vi.unstubAllGlobals();
    await mock.close();
  }
});

it("collection snapshots reused producer memory and preserves empty inputs and empty chunks", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const sdk = mock.packedSdk({
        access: run.ownerAccess,
        as: mock.actor("writer"),
        maxBytes: 8,
        maxObjects: 2,
        platform: "browser",
      });
      const upload = sdk.uploadPacked();
      const shared = Uint8Array.of(0);
      let position = 0;
      const values = [0, 1, 0, 2, 0, 3, 0];
      expect(
        await upload.add(
          new ReadableStream(
            {
              pull(controller) {
                if (position === values.length) {
                  controller.close();
                  return;
                }
                const value = values[position++]!;
                shared[0] = value;
                controller.enqueue(value ? shared : shared.subarray(0, 0));
              },
            },
            { highWaterMark: 0 },
          ),
        ),
      ).toBe(3);
      shared[0] = 255;
      expect(
        await upload.add(
          new ReadableStream({
            start(controller) {
              controller.close();
            },
          }),
        ),
      ).toBe(0);
      const objects = await upload.finalize();
      const reader = mock.reader({
        access: run.ownerAccess,
        as: mock.actor("reader"),
      });
      try {
        expect(objects).toHaveLength(2);
        for (const object of objects) await sdk.pinObject(object);
        expect(
          await new Response(
            await reader.download({ id: objects[0]!.id() }),
          ).bytes(),
        ).toEqual(Uint8Array.of(1, 2, 3));
        expect(
          await new Response(
            await reader.download({ id: objects[1]!.id() }),
          ).bytes(),
        ).toEqual(new Uint8Array());
      } finally {
        await reader.close();
        await sdk.close();
      }
    });
  } finally {
    await mock.close();
  }
});

const detachedChunk = new Uint8Array(1);
structuredClone(detachedChunk.buffer, { transfer: [detachedChunk.buffer] });
it.each([
  { chunk: detachedChunk, label: "detached" },
  { chunk: Uint8Array.of(1, 2, 3), label: "overlong" },
  { chunk: { byteLength: 1 }, label: "invalid" },
])(
  "$label input still cancels its source without poisoning cleanup",
  async ({ chunk }) => {
    const mock = createMockSia();
    let cancelled = 0;
    try {
      await mock.run({ app }, async (run) => {
        const sdk = mock.packedSdk({
          access: run.ownerAccess,
          as: mock.actor("writer"),
          maxBytes: 2,
          maxObjects: 1,
          platform: "browser",
        });
        const upload = sdk.uploadPacked();
        await expect(
          upload.add(
            new ReadableStream<Uint8Array>(
              {
                cancel() {
                  cancelled++;
                },
                pull(controller) {
                  controller.enqueue(chunk as Uint8Array);
                },
              },
              { highWaterMark: 0 },
            ),
          ),
        ).rejects.toMatchObject({ code: "limit" });
        await upload.dispose();
        await sdk.close();
      });
      expect(cancelled).toBe(1);
    } finally {
      await mock.close();
    }
  },
);

it("empty and tiny inputs do not allocate their large admitted ceiling", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const sdk = mock.packedSdk({
        access: run.ownerAccess,
        as: mock.actor("writer"),
        maxBytes: 1024 * 1024,
        maxObjects: 4,
        platform: "browser",
      });
      const upload = sdk.uploadPacked();
      const payloads = [
        new Uint8Array(),
        Uint8Array.of(1),
        Uint8Array.of(2, 3, 4),
        new Uint8Array(257).fill(5),
      ];
      const Original = Uint8Array;
      const capacities: number[] = [];
      const intercepted = new Proxy(Original, {
        construct(target, args, newTarget) {
          if (typeof args[0] === "number") capacities.push(args[0]);
          else if (ArrayBuffer.isView(args[0]))
            capacities.push(args[0].byteLength);
          return Reflect.construct(target, args, newTarget) as Uint8Array;
        },
      });
      try {
        vi.stubGlobal("Uint8Array", intercepted);
        for (const payload of payloads) {
          const before = capacities.length;
          await upload.add(
            new ReadableStream<Uint8Array>(
              {
                pull(controller) {
                  controller.enqueue(payload);
                  controller.close();
                },
              },
              { highWaterMark: 0 },
            ),
          );
          const allocated = capacities
            .slice(before)
            .reduce((sum, capacity) => sum + capacity, 0);
          expect(allocated).toBeLessThanOrEqual(
            payload.length === 0 ? 0 : 1024,
          );
        }
      } finally {
        vi.unstubAllGlobals();
      }
      const objects = await upload.finalize();
      const reader = mock.reader({
        access: run.ownerAccess,
        as: mock.actor("reader"),
      });
      try {
        expect(objects).toHaveLength(payloads.length);
        for (const [index, object] of objects.entries()) {
          await sdk.pinObject(object);
          expect(
            await new Response(
              await reader.download({ id: object.id() }),
            ).bytes(),
          ).toEqual(payloads[index]);
        }
      } finally {
        await reader.close();
        await sdk.close();
      }
    });
  } finally {
    vi.unstubAllGlobals();
    await mock.close();
  }
});

it("growth across one-byte chunks stays proportional to observed bytes rather than the ceiling or chunk count", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const sdk = mock.packedSdk({
        access: run.ownerAccess,
        as: mock.actor("writer"),
        maxBytes: 64 * 1024,
        maxObjects: 1,
        platform: "browser",
      });
      const upload = sdk.uploadPacked();
      const payload = Uint8Array.from(
        { length: 4097 },
        (_, index) => index % 251,
      );
      let position = 0;
      const source = new ReadableStream<Uint8Array>(
        {
          pull(controller) {
            if (position === payload.length) controller.close();
            else controller.enqueue(payload.subarray(position, ++position));
          },
        },
        { highWaterMark: 0 },
      );
      const Original = Uint8Array;
      const capacities: number[] = [];
      const intercepted = new Proxy(Original, {
        construct(target, args, newTarget) {
          if (typeof args[0] === "number") capacities.push(args[0]);
          else if (ArrayBuffer.isView(args[0]))
            capacities.push(args[0].byteLength);
          return Reflect.construct(target, args, newTarget) as Uint8Array;
        },
      });
      try {
        vi.stubGlobal("Uint8Array", intercepted);
        expect(await upload.add(source)).toBe(payload.length);
      } finally {
        vi.unstubAllGlobals();
      }
      expect(capacities.length).toBeLessThanOrEqual(
        1 + Math.ceil(Math.log2(payload.length)),
      );
      expect(
        capacities.reduce((sum, capacity) => sum + capacity, 0),
      ).toBeLessThanOrEqual(4 * payload.length);
      const [object] = await upload.finalize();
      await sdk.pinObject(object!);
      const reader = mock.reader({
        access: run.ownerAccess,
        as: mock.actor("reader"),
      });
      try {
        expect(
          await new Response(
            await reader.download({ id: object!.id() }),
          ).bytes(),
        ).toEqual(payload);
      } finally {
        await reader.close();
        await sdk.close();
      }
    });
  } finally {
    vi.unstubAllGlobals();
    await mock.close();
  }
});
