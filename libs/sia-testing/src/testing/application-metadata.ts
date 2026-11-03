/** Copies bounded application bytes without consulting subclass accessors or iterators. */
const typedArray = Object.getPrototypeOf(Uint8Array.prototype) as object;
const byteLength = Object.getOwnPropertyDescriptor(typedArray, "byteLength")!;
const byteOffset = Object.getOwnPropertyDescriptor(typedArray, "byteOffset")!;
const buffer = Object.getOwnPropertyDescriptor(typedArray, "buffer")!;
const tag = Object.getOwnPropertyDescriptor(typedArray, Symbol.toStringTag)!;
export function snapshotApplicationMetadata(value: unknown): Uint8Array {
  try {
    // The intrinsic getter reads the byte kind across contexts without consulting own tags.
    if (tag.get!.call(value) !== "Uint8Array") throw new Error();
    const length = byteLength.get!.call(value) as number;
    if (length > 1024) throw new Error();
    // Out-of-bounds resizable views report zero length and offset, just like valid empty views.
    Uint8Array.prototype.values.call(value);
    const view = new Uint8Array(
      buffer.get!.call(value) as ArrayBuffer,
      byteOffset.get!.call(value) as number,
      length,
    );
    const result = new Uint8Array(length);
    result.set(view);
    return result;
  } catch {
    throw Object.assign(new Error("Invalid application metadata"), {
      code: "invalid-input",
    });
  }
}
