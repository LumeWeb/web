/** Public byte fixtures preserve selected bytes without coercing caller values. */
import { Buffer } from "node:buffer";
import { expect, it, vi } from "vitest";
import { bytesFixture, type TestFile } from "../../src/mock.js";
import { foreignMetadata } from "./foreign-metadata.js";

async function contents(file: TestFile): Promise<Uint8Array> {
  const reader = file.open().getReader();
  try {
    const first = await reader.read();
    expect(first.done).toBe(false);
    expect((await reader.read()).done).toBe(true);
    if (!first.value) throw new Error("Expected fixture bytes");
    return first.value;
  } finally {
    reader.releaseLock();
  }
}

it.each<[string, unknown]>([
  ["missing", undefined],
  ["null", null],
  ["number", 4],
  ["string", "12"],
  ["array", [1, 2]],
  ["arraylike", { 0: 1, 1: 2, length: 2 }],
  ["object", {}],
  ["ArrayBuffer", new ArrayBuffer(2)],
  ["DataView", new DataView(new ArrayBuffer(2))],
  ["Uint16Array", Uint16Array.of(256, 257)],
  ["Uint8ClampedArray", Uint8ClampedArray.of(1, 2)],
  ["proxy", new Proxy(Uint8Array.of(1, 2), {})],
  ["forged", Object.create(Uint8Array.prototype)],
])("rejects %s bytes without creating a descriptor", async (_label, bytes) => {
  // @ts-expect-error Unsupported runtime values must not widen the public input type.
  const pending = bytesFixture({ bytes, name: "bytes" });
  expect(pending).toBeInstanceOf(Promise);
  await expect(pending).rejects.toMatchObject({
    code: "invalid-input",
    message: "Fixture bytes must be a valid Uint8Array",
  });
});

it("keeps bytes required when the property is absent", async () => {
  // @ts-expect-error Explicit empty bytes are required.
  await expect(bytesFixture({ name: "empty" })).rejects.toMatchObject({
    code: "invalid-input",
  });
});

it("rejects unsupported objects without running coercion hooks or reading the name", async () => {
  const hook = vi.fn(() => {
    throw new Error("caller hook");
  });
  const bytes = {};
  for (const key of [
    "length",
    "byteLength",
    "buffer",
    "byteOffset",
    "constructor",
    "slice",
    "subarray",
    Symbol.iterator,
    Symbol.toStringTag,
    Symbol.toPrimitive,
  ]) {
    Object.defineProperty(bytes, key, { get: hook });
  }
  const name = vi.fn(() => "bytes");
  const hash = vi.spyOn(crypto.subtle, "digest");
  try {
    await expect(
      bytesFixture({
        // @ts-expect-error An object with coercion hooks is not a byte view.
        bytes,
        get name() {
          return name();
        },
      }),
    ).rejects.toMatchObject({ code: "invalid-input" });
    expect(hook).not.toHaveBeenCalled();
    expect(name).not.toHaveBeenCalled();
    expect(hash).not.toHaveBeenCalled();
  } finally {
    hash.mockRestore();
  }
});

it("copies genuine byte views without consulting their own hooks", async () => {
  class Bytes extends Uint8Array {}
  for (const bytes of [
    Uint8Array.of(99, 1, 2, 88).subarray(1, 3),
    foreignMetadata("Uint8Array.of(99, 1, 2, 88).subarray(1, 3)"),
    foreignMetadata("new (class extends Uint8Array {})([1, 2])"),
    new Bytes([1, 2]),
    Buffer.from([1, 2]),
  ]) {
    const hook = vi.fn(() => {
      throw new Error("caller hook");
    });
    for (const key of [
      "byteLength",
      "length",
      "buffer",
      "byteOffset",
      "constructor",
      "slice",
      "subarray",
      Symbol.iterator,
      Symbol.toStringTag,
      Symbol.species,
    ]) {
      Object.defineProperty(bytes, key, { get: hook });
    }
    const file = await bytesFixture({ bytes, name: "selected" });
    expect(await contents(file)).toEqual(Uint8Array.of(1, 2));
    expect(file.sizeBytes).toBe(2);
    expect(file.sha256).toBe(
      "a12871fee210fb8619291eaea194581cbd2531e4b23759d225f6806923f63222",
    );
    expect(hook).not.toHaveBeenCalled();
  }
});

it("rejects detached and out-of-bounds views rather than treating them as empty", async () => {
  const detached = foreignMetadata("Uint8Array.of(1)");
  structuredClone(detached.buffer, { transfer: [detached.buffer] });
  const outOfBounds = foreignMetadata(
    "const b = new ArrayBuffer(8, { maxByteLength: 8 }); const v = new Uint8Array(b, 4, 4); b.resize(0); v",
  );
  for (const bytes of [detached, outOfBounds]) {
    await expect(bytesFixture({ bytes, name: "bytes" })).rejects.toMatchObject({
      code: "invalid-input",
    });
  }
});

it("accepts empty fixed and tracking views", async () => {
  for (const bytes of [
    new Uint8Array(),
    foreignMetadata("new Uint8Array()"),
    foreignMetadata(
      "const b = new ArrayBuffer(8, { maxByteLength: 8 }); new Uint8Array(b, 0, 0)",
    ),
    foreignMetadata(
      "const b = new ArrayBuffer(8, { maxByteLength: 8 }); const v = new Uint8Array(b); b.resize(0); v",
    ),
  ]) {
    const file = await bytesFixture({ bytes, name: "" });
    expect(file.sizeBytes).toBe(0);
    expect(await contents(file)).toEqual(new Uint8Array());
    expect(file.sha256).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  }
});

it.each(["bytes", "name"] as const)(
  "preserves the exact %s getter error as a rejection",
  async (key) => {
    const original = new Error("caller property failed");
    const input = { bytes: Uint8Array.of(1, 2), name: "bytes" };
    Object.defineProperty(input, key, {
      get() {
        throw original;
      },
    });
    const pending = bytesFixture(input);
    expect(pending).toBeInstanceOf(Promise);
    await expect(pending).rejects.toBe(original);
  },
);

it("snapshots before name getters and immediate caller mutations, with independent replay streams", async () => {
  const bytes = Uint8Array.of(99, 1, 2, 88);
  const pending = bytesFixture({
    bytes: bytes.subarray(1, 3),
    get name() {
      bytes.fill(7);
      return "selected";
    },
  });
  bytes.fill(9);
  const file = await pending;
  expect(file).toMatchObject({
    name: "selected",
    sha256: "a12871fee210fb8619291eaea194581cbd2531e4b23759d225f6806923f63222",
    sizeBytes: 2,
  });
  expect(Object.isFrozen(file)).toBe(true);
  for (const key of ["name", "sizeBytes", "sha256", "open"]) {
    expect(Object.getOwnPropertyDescriptor(file, key)?.writable).toBe(false);
  }
  const first = await contents(file);
  const second = await contents(file);
  expect(first).not.toBe(second);
  expect(first.buffer).not.toBe(second.buffer);
  first.fill(42);
  expect(second).toEqual(Uint8Array.of(1, 2));
  expect(await contents(file)).toEqual(Uint8Array.of(1, 2));
});

it("preserves raw labels and accepts bytes above metadata limits", async () => {
  for (const name of ["", "x".repeat(2048)]) {
    const file = await bytesFixture({ bytes: new Uint8Array(16385), name });
    expect(file.name).toBe(name);
    expect(file.sizeBytes).toBe(16385);
    expect((await contents(file)).byteLength).toBe(16385);
  }
});
