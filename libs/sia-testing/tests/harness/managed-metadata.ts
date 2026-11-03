/** Inputs shared by managed upload tests at the mock and fake-agent boundaries. */
import { Buffer } from "node:buffer";
import { foreignMetadata } from "./foreign-metadata.js";

export function emptyManagedMetadata(): Uint8Array[] {
  return [
    foreignMetadata("new Uint8Array()"),
    foreignMetadata(
      "const b = new ArrayBuffer(8, { maxByteLength: 8 }); const v = new Uint8Array(b); b.resize(0); v",
    ),
  ];
}

export function invalidManagedMetadata(): unknown[] {
  const detached = foreignMetadata("Uint8Array.of(10)");
  structuredClone(detached.buffer, { transfer: [detached.buffer] });
  const forged = new Uint16Array([10, 20]);
  Object.defineProperty(forged, Symbol.toStringTag, { value: "Uint8Array" });
  return [
    forged,
    {},
    new Proxy(Uint8Array.of(10), {}),
    detached,
    foreignMetadata(
      "const b = new ArrayBuffer(8, { maxByteLength: 8 }); const v = new Uint8Array(b, 4, 4); b.resize(0); v",
    ),
  ];
}

export function managedMetadataInputs(): Uint8Array[] {
  class Bytes extends Uint8Array {}
  return [
    foreignMetadata("Uint8Array.of(99, 10, 20, 88).subarray(1, 3)"),
    foreignMetadata("new (class extends Uint8Array {})([10, 20])"),
    new Bytes([10, 20]),
    Buffer.from([10, 20]),
  ].map((input) => {
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
    ]) {
      Object.defineProperty(input, key, {
        get() {
          throw new Error("input hook read");
        },
      });
    }
    return input;
  });
}
