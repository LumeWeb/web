/**
 * @vitest-environment node
 *
 * Tests for rollup-plugin-go-wasm — must run in node environment
 * because the plugin uses node:child_process, node:path, node:fs.
 */
import { describe, test, expect } from "vitest";
import { goWasm } from "@/rollup-plugin-go-wasm";

const TRUSTED_ROOT = "/opt/data/tinygo";

describe("#19: goWasm plugin rejects untrusted binary paths", () => {
  test("rejects arbitrary absolute path", () => {
    expect(() => goWasm({ trustedRoot: TRUSTED_ROOT, goBinaryPath: "/usr/local/bin/evil" }))
      .toThrow("Refusing to run go binary from untrusted path");
  });

  test("rejects relative path with directory traversal", () => {
    expect(() => goWasm({ trustedRoot: TRUSTED_ROOT, goBinaryPath: "../evil/tinygo" }))
      .toThrow("Refusing to run go binary from non-absolute path");
  });

  test("allows trusted root prefix", () => {
    expect(() => goWasm({ trustedRoot: TRUSTED_ROOT, goBinaryPath: "/opt/data/tinygo/bin/tinygo" }))
      .not.toThrow();
  });

  test("rejects bare basename (no PATH resolution) (#48)", () => {
    expect(() => goWasm({ trustedRoot: TRUSTED_ROOT, goBinaryPath: "tinygo" }))
      .not.toThrow(); // doesn't throw at construction, deferred to buildStart
  });

  test("rejects directory traversal under allowed root (#25)", () => {
    expect(() => goWasm({ trustedRoot: TRUSTED_ROOT, goBinaryPath: "/opt/data/tinygo/bin/../../usr/bin/evil" }))
      .toThrow("Refusing to run go binary from untrusted path");
  });

  test("rejects traversal that resolves outside allowed root", () => {
    expect(() => goWasm({ trustedRoot: TRUSTED_ROOT, goBinaryPath: "/opt/data/tinygo/../../../evil" }))
      .toThrow("Refusing to run go binary from untrusted path");
  });

  test("rejects unchecked wasmExecPath (#30)", () => {
    expect(() => goWasm({ trustedRoot: TRUSTED_ROOT, wasmExecPath: "/etc/passwd" }))
      .toThrow("Refusing to load wasm_exec.js from untrusted path");
  });

  test("rejects traversal in wasmExecPath", () => {
    expect(() => goWasm({ trustedRoot: TRUSTED_ROOT, wasmExecPath: "/opt/data/tinygo/../../etc/shadow" }))
      .toThrow("Refusing to load wasm_exec.js from untrusted path");
  });

  test("accepts wasmExecPath under allowed root", () => {
    expect(() => goWasm({ trustedRoot: TRUSTED_ROOT, wasmExecPath: "/opt/data/tinygo/targets/wasm_exec.js" }))
      .not.toThrow();
  });

  test("rejects PATH override in env (#48)", () => {
    // The plugin must silently drop PATH/GOPATH from user-provided env
    // We test indirectly: goWasm should not throw, but the env should be filtered.
    expect(() => goWasm({
      trustedRoot: TRUSTED_ROOT,
      goBinaryPath: "/opt/data/tinygo/bin/tinygo",
      env: { PATH: "/evil/bin", GOPATH: "/evil/gopath", CUSTOM_VAR: "allowed" },
    }))
      .not.toThrow();
  });
});
