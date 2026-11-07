/** Real runner reports must retain the original failure while closing retained runs. */
import { execFile } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { expect, test } from "vitest";
const execute = promisify(execFile);
const require = createRequire(import.meta.url);

test.each([
  ["assertion", "expected 'actual-marker' to be 'expected-marker'"],
  ["timeout", "Test timed out in 100ms"],
  ["dependent", "dependent-cleanup-failure"],
  ["already-aborted", "external-abort"],
  ["external", "external-abort"],
  ["skip", null],
  ["setup", "Expected a nonnegative safe integer"],
  ["shared", "external-abort"],
  ["cleanup", "owned-source-cleanup-failure"],
  ["assertion-cleanup", "expected 'actual-marker' to be 'expected-marker'"],
  ["run-cleanup", "external-abort"],
  ["boundary-errors", "run-boundary-error"],
  ["runner", null],
])("closes retained runs after %s", async (mode, message) => {
  const directory = mkdtempSync(join(tmpdir(), "sia-vitest-lifecycle-"));
  const report = join(directory, "report.json");
  try {
    let failed = false;
    let output = "";
    try {
      output = (await execute(process.execPath, [join(dirname(require.resolve("vitest/package.json")), "vitest.mjs"), "run", "--config", "tests/harness/lifecycle.config.ts", `--outputFile=${report}`], {
        cwd: new URL("../../", import.meta.url),
        encoding: "utf8",
        env: { ...process.env, SIA_FAILURE_MESSAGES: join(directory, "errors.json"), SIA_LIFECYCLE_CASE: mode }, timeout: 20_000,
      })).stdout;
    } catch (error) { failed = true; output = String(error); }
    const result = JSON.parse(readFileSync(report, "utf8")) as { numFailedTests: number; testResults: { assertionResults: { status: string; title: string }[] }[] };
    const assertions = result.testResults.flatMap((file) => file.assertionResults);
    expect(assertions.find((item: { title: string }) => item.title === "retained run is closed")?.status).toBe(mode === "runner" ? "skipped" : "passed");
    const subject = assertions.find((item: { title: string }) => item.title.startsWith("subject"));
    expect(failed, output).toBe(message !== null || mode === "runner");
    expect(subject?.status).toBe(message === null ? "skipped" : "failed");
    const failures = JSON.parse(readFileSync(join(directory, "errors.json"), "utf8")) as { errors: string[]; logs: string[]; tests: { errors: string[] }[] };
    expect(failures.errors).toEqual([]);
    if (mode === "runner") {
      expect(result.numFailedTests).toBe(0);
      expect(failures.logs.join("\n")).toContain("RUN_CANCEL_CLOSED");
      expect(failures.logs.join("\n")).toContain("REQUEST_RUN_CANCELLATION");
    }
    expect(failures.tests).toHaveLength(mode === "shared" ? 2 : 1);
    if (message !== null) {
      for (const subject of failures.tests) {
        const errors = subject.errors.join("\n");
        expect(errors).toContain(message);
        if (mode.endsWith("cleanup")) expect(errors).toContain("owned-source-cleanup-failure");
        if (mode === "boundary-errors") {
          expect(errors).toContain("cleanup-boundary-error");
          expect(errors).not.toContain("finally-must-not-replace-run");
        }
      }
      expect(result.numFailedTests).toBe(mode === "shared" ? 2 : 1);
    }

  } finally { rmSync(directory, { force: true, recursive: true }); }
}, 30_000);
