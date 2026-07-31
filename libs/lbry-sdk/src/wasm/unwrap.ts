/**
 * WASM result unwrapper — extracts success data or throws on error.
 *
 * Every WASM function returns `WasmResult<T>` which is either
 * the success payload or `{ error: string }`. This helper
 * eliminates the repetitive `if ("error" in result) throw new Error(result.error)`
 * pattern.
 *
 * @module @lumeweb/lbry-sdk/wasm/unwrap
 */

import type { WasmResult } from "@/wasm/types.generated";

/**
 * Unwrap a WASM result, throwing on error.
 *
 * @param result - The raw WASM result (success or error)
 * @param label - Human-readable label for error messages (e.g., function name)
 * @returns The success payload
 * @throws {Error} If the result contains an `error` property
 */
export function unwrap<T extends Record<string, unknown>>(
  result: WasmResult<T>,
  label: string
): T {
  if (
    result !== null &&
    typeof result === "object" &&
    typeof (result as Record<string, unknown>).error === "string"
  ) {
    throw new Error(`${label} failed: ${(result as { error: string }).error}`);
  }
  return result as T;
}
