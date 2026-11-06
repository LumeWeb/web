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

/** Each admitted disk source counts its original chunks before a collector can flatten them. */
export function createPayloadSourceValidator(): (
  value: unknown,
  maximum: number,
) => Uint8Array {
  let chunks = 0;
  return (value, maximum) => {
    if (++chunks > 131072)
      throw new Error("Payload source chunk limit exceeded");
    const view = boundedByteView(value, Math.min(maximum, 65536));
    const backingLength = Object.getOwnPropertyDescriptor(
      ArrayBuffer.prototype,
      "byteLength",
    )!.get!.call(view.buffer) as number;
    const resizable = Object.getOwnPropertyDescriptor(
      ArrayBuffer.prototype,
      "resizable",
    )?.get?.call(view.buffer) as boolean | undefined;
    if (resizable || backingLength > 65536)
      throw new Error("Invalid bounded payload backing storage");
    return view;
  };
}
