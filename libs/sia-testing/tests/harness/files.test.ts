/** Fixture collection validates source views before counting or copying bytes. */
import { Buffer } from "node:buffer";
import { expect, it, vi } from "vitest";
import { bytesFixture, readFixture } from "../../src/testing/files.js";
import { foreignMetadata } from "./foreign-metadata.js";

async function collect(input: Uint8Array, expected = new Uint8Array()) {
  const descriptor = await bytesFixture({ bytes: expected, name: "bytes" });
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(input);
      controller.close();
    },
  });
  try {
    return await readFixture(
      { ...descriptor, open: () => stream },
      new AbortController().signal,
    );
  } finally {
    expect(stream.locked).toBe(false);
  }
}

it("copies foreign subviews, subclasses and Buffer without reading source hooks", async () => {
  class Bytes extends Uint8Array {}
  for (const chunk of [
    foreignMetadata("Uint8Array.of(99, 1, 2, 88).subarray(1, 3)"),
    foreignMetadata("new (class extends Uint8Array {})([1, 2])"),
    new Bytes([1, 2]),
    Buffer.from([1, 2]),
  ]) {
    for (const key of [
      "byteLength",
      "byteOffset",
      "buffer",
      "length",
      "constructor",
      "slice",
      "subarray",
      Symbol.iterator,
      Symbol.toStringTag,
    ]) {
      Object.defineProperty(chunk, key, {
        get() {
          throw new Error("source hook read");
        },
      });
    }
    expect(await collect(chunk, Uint8Array.of(1, 2))).toEqual(
      Uint8Array.of(1, 2),
    );
  }
});

it("rejects forged byte kinds, proxies and invalid original views", async () => {
  const detached = foreignMetadata("Uint8Array.of(1)");
  structuredClone(detached.buffer, { transfer: [detached.buffer] });
  const outOfBounds = foreignMetadata(
    "const b = new ArrayBuffer(8, { maxByteLength: 8 }); const v = new Uint8Array(b, 4, 4); b.resize(0); v",
  );
  for (const chunk of [
    new Uint16Array(),
    new Uint8ClampedArray(),
    new DataView(new ArrayBuffer(0)),
    {},
    new Proxy(new Uint8Array(), {}),
    detached,
    outOfBounds,
  ]) {
    Object.defineProperty(chunk, Symbol.toStringTag, { value: "Uint8Array" });
    await expect(collect(chunk as Uint8Array)).rejects.toMatchObject({
      code: "invalid-input",
    });
  }
});

it("accepts valid foreign empty fixed and tracking views", async () => {
  for (const expression of [
    "new Uint8Array()",
    "const b = new ArrayBuffer(8, { maxByteLength: 8 }); new Uint8Array(b, 0, 0)",
    "const b = new ArrayBuffer(8, { maxByteLength: 8 }); const v = new Uint8Array(b); b.resize(0); v",
  ]) {
    expect(await collect(foreignMetadata(expression))).toEqual(
      new Uint8Array(),
    );
  }
});

it("counts actual bytes even when a subclass reports another length", async () => {
  class Bytes extends Uint8Array {}
  for (const reported of [0, 1, 3]) {
    const chunk = new Bytes([1, 2]);
    Object.defineProperty(chunk, "byteLength", { value: reported });
    expect(await collect(chunk, Uint8Array.of(1, 2))).toEqual(
      Uint8Array.of(1, 2),
    );
  }
});

it.each(["oversize", "overwrite"])(
  "joins cancellation after rejecting %s bytes and retains both errors",
  async (kind) => {
    const descriptor = await bytesFixture({
      bytes: kind === "oversize" ? Uint8Array.of(1) : Uint8Array.of(1, 3),
      name: "bytes",
    });
    const cleanup = new Error("cancel failed");
    let finish!: () => void;
    const cancel = vi.fn(async () => {
      await new Promise<void>((resolve) => {
        finish = resolve;
      });
      throw cleanup;
    });
    const stream = new ReadableStream<Uint8Array>({
      cancel,
      start(controller) {
        class Bytes extends Uint8Array {}
        const chunk = new Bytes([1, 2]);
        Object.defineProperty(chunk, "byteLength", {
          value: kind === "oversize" ? 0 : 1,
        });
        controller.enqueue(chunk);
        if (kind === "overwrite") controller.enqueue(Uint8Array.of(3));
      },
    });
    const reading = readFixture(
      { ...descriptor, open: () => stream },
      new AbortController().signal,
    );
    const observed = reading.catch((error: unknown) => error);
    await vi.waitFor(() => expect(cancel).toHaveBeenCalledOnce());
    expect(stream.locked).toBe(true);
    finish();
    const error = await observed;
    expect(error).toBeInstanceOf(AggregateError);
    expect(error).toMatchObject({
      cause: cleanup,
      errors: [expect.objectContaining({ code: "invalid-input" }), cleanup],
    });
    if (!(error instanceof AggregateError))
      throw new Error("Expected aggregate");
    expect(error.errors[1]).toBe(cleanup);
    expect(error.cause).toBe(cleanup);
    expect(stream.locked).toBe(false);
  },
);

it("retains the exact producer error and releases the source lock", async () => {
  const descriptor = await bytesFixture({
    bytes: new Uint8Array(),
    name: "bytes",
  });
  const failure = new Error("producer failed");
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      controller.error(failure);
    },
  });
  const error: unknown = await readFixture(
    { ...descriptor, open: () => stream },
    new AbortController().signal,
  ).catch((error: unknown) => error);
  if (!(error instanceof AggregateError)) throw new Error("Expected aggregate");
  expect(error.errors[0]).toBe(failure);
  expect(error.errors[1]).toBe(failure);
  expect(error.cause).toBe(failure);
  expect(stream.locked).toBe(false);
});

it("abort joins cancellation of a pending read with exact error order", async () => {
  const descriptor = await bytesFixture({
    bytes: new Uint8Array(),
    name: "bytes",
  });
  const abort = new Error("aborted");
  const cleanup = new Error("cancel failed");
  const signal = new AbortController();
  const stream = new ReadableStream<Uint8Array>({
    cancel(reason) {
      expect(reason).toBe(abort);
      throw cleanup;
    },
  });
  const reading = readFixture(
    { ...descriptor, open: () => stream },
    signal.signal,
  );
  signal.abort(abort);
  const error: unknown = await reading.catch((error: unknown) => error);
  if (!(error instanceof AggregateError)) throw new Error("Expected aggregate");
  expect(error.errors[0]).toBe(abort);
  expect(error.errors[1]).toBe(cleanup);
  expect(error.cause).toBe(cleanup);
  expect(stream.locked).toBe(false);
});

it("digest mismatch releases a completed source without cancelling it", async () => {
  const descriptor = await bytesFixture({
    bytes: Uint8Array.of(1),
    name: "bytes",
  });
  const cancel = vi.fn();
  const stream = new ReadableStream<Uint8Array>({
    cancel,
    start(controller) {
      controller.enqueue(Uint8Array.of(2));
      controller.close();
    },
  });
  await expect(
    readFixture(
      { ...descriptor, open: () => stream },
      new AbortController().signal,
    ),
  ).rejects.toMatchObject({ code: "invalid-input" });
  expect(cancel).not.toHaveBeenCalled();
  expect(stream.locked).toBe(false);
});
