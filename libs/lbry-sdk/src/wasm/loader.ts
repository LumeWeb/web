/**
 * WASM loader — loads and instantiates the LBRY SDK Go-WASM module.
 *
 * Handles fetching the WASM binary and wasm_exec.js support library,
 * verifying origin trustworthiness, enforcing Subresource Integrity (SRI),
 * and polling for the `globalThis.__lbrySDK__` export to be ready.
 *
 * All exported functions are synchronous thanks to TinyGo's asyncify
 * scheduler — they yield to the JS event loop during blocking operations.
 *
 * @module @lumeweb/lbry-sdk/wasm/loader
 */

import type { WasmInstance, WasmExports } from "@/wasm/types";

/**
 * Options for loading the WASM module.
 *
 * @property wasmUrl - Base URL for the WASM binary. Defaults to resolving relative to this module.
 * @property wasmExecUrl - URL for Go's wasm_exec.js support library. Must be served alongside the WASM binary.
 * @property integrity - Optional Subresource Integrity hashes for both wasm_exec.js and the WASM fetch.
 */
export interface WasmLoaderOptions {
  /** Base URL for the WASM binary. Defaults to resolving relative to this module. */
  wasmUrl?: string;
  /** URL for Go's wasm_exec.js support library. Must be served alongside the WASM binary. */
  wasmExecUrl?: string;
  /** Optional Subresource Integrity hashes. When provided, the loader enforces
   *  integrity on both the wasm_exec.js script tag and the WASM fetch. */
  integrity?: {
    /** SHA-384 hash for wasm_exec.js SRI */
    wasmExec?: string;
    /** SHA-384 hash for WASM binary SRI */
    wasm?: string;
  };
}

const DEFAULT_WASM_BASE =
  typeof import.meta !== "undefined" && import.meta.url
    ? new URL("./wasm/", import.meta.url).href
    : "/lbry-sdk/wasm/";

const DEFAULT_WASM_URL = new URL("lbry-sdk.wasm", DEFAULT_WASM_BASE).href;
const DEFAULT_EXEC_URL = new URL("wasm_exec.js", DEFAULT_WASM_BASE).href;

/**
 * Validates that a URL is same-origin or from an allowed CDN origin.
 * Prevents loading attacker-controlled WASM or wasm_exec.js.
 *
 * @param url - The URL to validate
 * @returns `true` if the URL is allowed, `false` otherwise
 */
function isAllowedWasmUrl(url: string): boolean {
  try {
    // Allow relative paths (no protocol/host) — check before URL parsing
    // so "./lbry-sdk.wasm" or "/wasm/lbry-sdk.wasm" work without throwing
    // Reject protocol-relative URLs ("//evil.com/sdk.wasm") which bypass Origin checks
    if ((url.startsWith("/") && !url.startsWith("//")) || url.startsWith("./") || url.startsWith("../")) {
      return true;
    }
    const parsed = new URL(url);
    // Allow same-origin
    if (typeof location !== "undefined" && parsed.origin === location.origin) {
      return true;
    }
    // Allow explicit localhost for dev (fixed port only to prevent SSRF)
    if (
      (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") &&
      parsed.port === "8080"
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Loads Go's wasm_exec.js support library.
 *
 * In a DOM environment, uses a `<script>` tag with SRI and a 30s timeout.
 * In non-DOM environments (Workers, Node), falls back to fetch + eval.
 * wasm_exec.js defines the global `Go` class used to instantiate the WASM module.
 *
 * @param url - URL to load wasm_exec.js from
 * @param integrity - Optional SRI hash for integrity verification
 * @throws {Error} If fetching fails, times out, or the Go class is not defined after loading
 */
async function loadWasmExec(url: string, integrity?: string): Promise<void> {
  if (typeof (globalThis as Record<string, unknown>).Go !== "undefined")
    return;

  if (typeof document === "undefined") {
    // Worker / Node — no DOM, use fetch + eval
    const fetchOpts: RequestInit = {};
    if (integrity) fetchOpts.integrity = integrity;
    const response = await fetch(url, fetchOpts);
    if (!response.ok) {
      throw new Error(`Failed to fetch wasm_exec.js from ${url}: ${response.status}`);
    }
    const code = await response.text();
    (0, eval)(code);
  } else {
    // Browser — use <script> tag with SRI and timeout
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      if (integrity) {
        script.integrity = integrity;
        script.crossOrigin = "anonymous";
      }
      const timer = setTimeout(
        () => reject(new Error(`Timed out loading wasm_exec.js from ${url}`)),
        30000
      );
      script.onload = () => {
        clearTimeout(timer);
        resolve();
      };
      script.onerror = () => {
        clearTimeout(timer);
        reject(new Error(`Failed to load wasm_exec.js from ${url}`));
      };
      document.head.appendChild(script);
    });
  }

  if (typeof (globalThis as Record<string, unknown>).Go === "undefined") {
    throw new Error("wasm_exec.js loaded but global Go class is not defined");
  }
}

/**
 * Loads and instantiates the LBRY SDK WASM module.
 *
 * This is a singleton — subsequent calls return the cached instance.
 * wasm_exec.js + lbry-sdk.wasm must be served from a URL the browser can reach.
 * The Go runtime sets globalThis.__lbrySDK__ with all exported functions after init.
 * All exported functions are synchronous (TinyGo asyncify scheduler handles yielding).
 *
 * @param opts - WASM loading options (URLs, SRI hashes)
 * @returns The loaded WASM instance with typed exports
 * @throws {Error} If the WASM URL or wasm_exec.js URL is from an untrusted origin
 * @throws {Error} If fetching wasm_exec.js or the WASM binary fails
 * @throws {Error} If WASM initialization fails or the exports are not ready within 30s
 *
 * @example
 * ```ts
 * const wasm = await WasmLoader.load();
 * const { mnemonic } = wasm.exports.makeSeed();
 * const { handle } = wasm.exports.walletFromMnemonic(mnemonic);
 * const { address } = wasm.exports.walletAddress(handle);
 * ```
 */
export class WasmLoader {
  private static instance: WasmInstance | null = null;
  private static loading: Promise<WasmInstance> | null = null;

  static async load(opts: WasmLoaderOptions = {}): Promise<WasmInstance> {
    if (this.instance) return this.instance;
    if (this.loading) return this.loading;

    this.loading = this.init(opts);
    try {
      this.instance = await this.loading;
      return this.instance;
    } finally {
      this.loading = null;
    }
  }

  private static async init(opts: WasmLoaderOptions): Promise<WasmInstance> {
    // If __lbrySDK__ is already registered (e.g. injected by tests or a prior load),
    // return it directly without re-instantiating.
    const existing = (globalThis as { __lbrySDK__?: WasmExports }).__lbrySDK__;
    if (existing) {
      return { exports: existing, go: null };
    }

    const wasmUrl = opts.wasmUrl ?? DEFAULT_WASM_URL;
    const execUrl = opts.wasmExecUrl ?? DEFAULT_EXEC_URL;

    if (!isAllowedWasmUrl(wasmUrl)) {
      throw new Error(`Refusing to load WASM from untrusted origin: ${wasmUrl}`);
    }
    if (!isAllowedWasmUrl(execUrl)) {
      throw new Error(`Refusing to load wasm_exec.js from untrusted origin: ${execUrl}`);
    }

    await loadWasmExec(execUrl, opts.integrity?.wasmExec);

    const GoCtor = (globalThis as { Go?: new () => unknown }).Go;
    if (!GoCtor) {
      throw new Error(
        "globalThis.Go is not defined after loading wasm_exec.js"
      );
    }

    const go = new GoCtor();

    const fetchOpts: RequestInit = {};
    if (opts.integrity?.wasm) {
      fetchOpts.integrity = opts.integrity.wasm;
    }
    const response = await fetch(wasmUrl, fetchOpts);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch WASM binary from ${wasmUrl}: ${response.status}`
      );
    }

    const bytes = new Uint8Array(await response.arrayBuffer());
    const result = await WebAssembly.instantiate(
      bytes,
      (go as any).importObject
    );

    // run() starts the Go runtime and registers globalThis.__lbrySDK__.
    // TinyGo's main() typically ends with select{} (blocking forever to keep
    // the runtime alive for syscall/js callbacks), so we do NOT await run().
    // Instead, we poll for __lbrySDK__.ready === true.
    (go as any).run(result.instance);

    const maxWaitMs = 30000;
    const start = Date.now();
    let exports = (globalThis as { __lbrySDK__?: WasmExports }).__lbrySDK__;
    while (!(exports as any)?.ready && Date.now() - start < maxWaitMs) {
      await new Promise((r) => setTimeout(r, 50));
      exports = (globalThis as { __lbrySDK__?: WasmExports }).__lbrySDK__;
    }
    if (!(exports as any)?.ready) {
      throw new Error(
        "WASM module initialized but globalThis.__lbrySDK__.ready was not set within 30s"
      );
    }

    return { exports: exports!, go };
  }

  /**
   * Unload and free the WASM instance.
   *
   * Clears the cached instance and removes globalThis.__lbrySDK__.
   * Subsequent calls to `load()` will re-initialize from scratch.
   */
  static unload(): void {
    this.instance = null;
    this.loading = null;
    delete (globalThis as Record<string, unknown>).__lbrySDK__;
  }
}
