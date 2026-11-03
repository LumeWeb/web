/** Creates genuine byte views in an isolated Node context for metadata tests. */
import { types } from "node:util";
import { runInNewContext } from "node:vm";

export function foreignMetadata(expression: string): Uint8Array {
  const value: unknown = runInNewContext(expression);
  if (!types.isUint8Array(value)) throw new Error("Expected a Uint8Array");
  return value;
}
