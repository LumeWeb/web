/**
 * Types for the WASM bridge layer.
 *
 * Go side exposes functions via syscall/js as globalThis.__lbrySDK__.
 * All functions are synchronous — they return result objects directly
 * (not callbacks). The Go runtime uses TinyGo's asyncify scheduler,
 * which yields to the JS event loop during blocking operations.
 *
 * Re-exports the generated types from types.generated.ts, which are
 * produced by `go run ./tools/gencontract` from the actual Go AST.
 *
 * @module @lumeweb/lbry-sdk/wasm/types
 */

// Re-export everything from the generated file — this is the single source of truth.
export * from "@/wasm/types.generated";
import type { WasmExports } from "@/wasm/types.generated";

/**
 * The loaded WASM instance returned by {@link WasmLoader.load}.
 *
 * Contains the typed exports object and a reference to the Go runtime
 * instance (opaque, for internal use).
 */
export interface WasmInstance {
  /** Typed WASM function exports — all synchronous functions */
  exports: WasmExports;
  /** Opaque Go runtime instance (from wasm_exec.js `new Go()`) */
  go: unknown;
}
