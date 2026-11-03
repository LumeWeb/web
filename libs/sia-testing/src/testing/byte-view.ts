/** Borrows bounded intrinsic bytes; callers must copy them before awaiting. */
const typedArray = Object.getPrototypeOf(Uint8Array.prototype) as object;
const byteLength = Object.getOwnPropertyDescriptor(typedArray, "byteLength")!;
const byteOffset = Object.getOwnPropertyDescriptor(typedArray, "byteOffset")!;
const buffer = Object.getOwnPropertyDescriptor(typedArray, "buffer")!;
const tag = Object.getOwnPropertyDescriptor(typedArray, Symbol.toStringTag)!;

export function boundedByteView(value: unknown, maximum: number): Uint8Array {
  // The intrinsic getter reads the byte kind across contexts without consulting own tags.
  if (tag.get!.call(value) !== "Uint8Array")
    throw new Error("Invalid byte view");
  const length = byteLength.get!.call(value) as number;
  if (length > maximum) throw new Error("Byte view exceeds limit");
  // Out-of-bounds resizable views report zero length and offset, just like valid empty views.
  Uint8Array.prototype.values.call(value);
  return new Uint8Array(
    buffer.get!.call(value) as ArrayBuffer,
    byteOffset.get!.call(value) as number,
    length,
  );
}
