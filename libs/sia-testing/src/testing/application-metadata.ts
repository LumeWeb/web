/** Copies bounded application bytes without consulting subclass accessors or iterators. */
import { boundedByteView } from "./byte-view.js";

export function snapshotApplicationMetadata(value: unknown): Uint8Array {
  try {
    const view = boundedByteView(value, 1024);
    const result = new Uint8Array(view.byteLength);
    result.set(view);
    return result;
  } catch {
    throw Object.assign(new Error("Invalid application metadata"), {
      code: "invalid-input",
    });
  }
}
