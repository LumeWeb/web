/** Metadata snapshots use intrinsic byte kinds and never read input hooks. */
import { Buffer } from "node:buffer";
import { foreignMetadata } from "./foreign-metadata.js";
import { expect, it } from "vitest";
import { snapshotApplicationMetadata } from "../../src/testing/application-metadata.js";

it("copies foreign subviews, subclasses and Buffer without consulting input hooks", () => {
  const foreign: Uint8Array = foreignMetadata(
    "Uint8Array.of(99, 10, 20, 88).subarray(1, 3)",
  );
  const foreignSubclass = foreignMetadata(
    "new (class extends Uint8Array {})([10, 20])",
  );
  class Bytes extends Uint8Array {}
  for (const input of [
    foreign,
    foreignSubclass,
    new Bytes([10, 20]),
    Buffer.from([10, 20]),
  ]) {
    for (const key of [
      Symbol.toStringTag,
      Symbol.iterator,
      "constructor",
      "byteLength",
      "byteOffset",
      "buffer",
      "length",
      "slice",
      "subarray",
      "BYTES_PER_ELEMENT",
    ]) {
      Object.defineProperty(input, key, {
        get() {
          throw new Error("input hook read");
        },
      });
    }
    const output = snapshotApplicationMetadata(input);
    expect(output).toEqual(Uint8Array.of(10, 20));
    input[0] = 90;
    expect(output).toEqual(Uint8Array.of(10, 20));
    output[1] = 80;
    expect(input[1]).toBe(20);
  }
});

it("rejects forged tags, proxies and other byte kinds", () => {
  const inputs = [
    new Uint16Array([10, 20]),
    {},
    new Uint8ClampedArray([10, 20]),
    new DataView(new ArrayBuffer(2)),
    new ArrayBuffer(2),
    new Proxy(Uint8Array.of(10), {}),
  ];
  for (const input of inputs) {
    Object.defineProperty(input, Symbol.toStringTag, { value: "Uint8Array" });
    expect(() => snapshotApplicationMetadata(input)).toThrowError(
      expect.objectContaining({ code: "invalid-input" }),
    );
  }
});

it("bounds foreign intrinsic bytes and rejects invalid original views", () => {
  const oversized: Uint8Array = foreignMetadata("new Uint8Array(1025)");
  Object.defineProperty(oversized, "byteLength", { value: 0 });
  const detached: Uint8Array = foreignMetadata("Uint8Array.of(10)");
  structuredClone(detached.buffer, { transfer: [detached.buffer] });
  const outOfBounds: Uint8Array = foreignMetadata(
    "const b = new ArrayBuffer(8, { maxByteLength: 8 }); const v = new Uint8Array(b, 4, 4); b.resize(0); v",
  );
  for (const input of [oversized, detached, outOfBounds]) {
    expect(() => snapshotApplicationMetadata(input)).toThrowError(
      expect.objectContaining({ code: "invalid-input" }),
    );
  }
  const boundary: Uint8Array = foreignMetadata("new Uint8Array(1024)");
  expect(snapshotApplicationMetadata(boundary)).toHaveLength(1024);
});

it("accepts foreign empty fixed and length-tracking resizable views", () => {
  for (const expression of [
    "new Uint8Array()",
    "const b = new ArrayBuffer(8, { maxByteLength: 8 }); new Uint8Array(b, 0, 0)",
    "const b = new ArrayBuffer(8, { maxByteLength: 8 }); const v = new Uint8Array(b); b.resize(0); v",
  ]) {
    const input: Uint8Array = foreignMetadata(expression);
    expect(snapshotApplicationMetadata(input)).toEqual(new Uint8Array());
  }
});
