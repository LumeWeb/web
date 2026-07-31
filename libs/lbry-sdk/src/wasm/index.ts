/**
 * WASM module — re-exports the WasmLoader and type definitions.
 *
 * The WASM bridge loads Go-WASM (compiled with TinyGo) for LBRY crypto
 * operations. All exported functions are synchronous thanks to TinyGo's
 * asyncify scheduler — they yield to the JS event loop during blocking
 * operations and return result objects directly.
 *
 * @module @lumeweb/lbry-sdk/wasm
 */

export type { WasmInstance, WasmExports } from "@/wasm/types";
export { WasmLoader } from "@/wasm/loader";
export type { WasmLoaderOptions } from "@/wasm/loader";
export { unwrap } from "@/wasm/unwrap";
export { WasmBase } from "@/wasm/base";
