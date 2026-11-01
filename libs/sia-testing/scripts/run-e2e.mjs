/// <reference types="node" />
// @ts-check
/**
 * Runs a cluster SDK suite against an explicitly supplied disposable service.
 * The outer guardian acquires the shared kernel lock; the locked invocation
 * verifies consent and service identity before starting a test runner.
 *
 * The lease covers the suite's resource cleanup and the final readiness check.
 * A runner exit alone is insufficient because detached SDK children can still
 * write to hosts. Failed runs retain private diagnostics for exact-owned cleanup;
 * this entrypoint never starts, mines or stops the supplied cluster.
 */
import { join } from "node:path";
import { parseArgs } from "node:util";
import { commandMain } from "../src/e2e/internal/run-command.mjs";
import { packageRoot } from "./workspace.mjs";

const suites = {
  "browser-host-fixtures": [
    "@playwright/test/cli.js",
    "test",
    "--config",
    "playwright.host-fixtures.config.ts",
  ],
  "host-fixtures": [
    "vitest/vitest.mjs",
    "run",
    "--project",
    "real-host-fixtures",
  ],
  "metadata": [
    "@playwright/test/cli.js",
    "test",
    "--config",
    "playwright.metadata.config.ts",
  ],
  "native": ["vitest/vitest.mjs", "run", "--project", "real-native"],
  "payload": [
    "@playwright/test/cli.js",
    "test",
    "--config",
    "playwright.payload.config.ts",
  ],
};
try {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: { help: { short: "h", type: "boolean" }, locked: { type: "boolean" } },
    strict: true,
  });
  if (values.help) {
    console.log(`Usage: run-e2e.mjs <${Object.keys(suites).join("|")}> [--help]`);
  } else {
    const [lane] = positionals;
    if (!lane || positionals.length !== 1 || !Object.hasOwn(suites, lane))
      throw new Error("Unknown suite");
    const [entry, ...args] = suites[/** @type {keyof typeof suites} */ (lane)];
    process.exitCode = await commandMain([
      ...(values.locked ? ["--locked"] : []),
      "--cwd", packageRoot, "--", process.execPath,
      join(packageRoot, "node_modules", entry), ...args,
    ]);
  }
} catch {
  console.error("E2E failed; private inputs and SDK diagnostics omitted");
  process.exitCode = 1;
}
