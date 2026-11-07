/** Checks public browser fixtures and attributes each intentional runner failure. */
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
const execute = promisify(execFile);
const require = createRequire(import.meta.url);
const cli = join(dirname(require.resolve("vitest/package.json")), "vitest.mjs");
const root = new URL("../", import.meta.url);
const directory = await mkdtemp(join(tmpdir(), "sia-vitest-browser-"));
try {
  for (const [mode, message] of [
    ["", null], ["skip", null],
    ["assertion", "expected 'actual-marker' to be 'expected-marker'"],
    ["timeout", "Test timed out in 100ms"],
    ["dependent", "dependent-cleanup-failure"],
    ["setup", "Expected a nonnegative safe integer"],
    ["already-aborted", "external-abort"], ["external", "external-abort"],
    ["shared", "external-abort"], ["cleanup", "owned-source-cleanup-failure"],
    ["assertion-cleanup", "expected 'actual-marker' to be 'expected-marker'"],
    ["run-cleanup", "external-abort"],
  ]) {
    const report = join(directory, "report.json");
    const errors = join(directory, "errors.json");
    await Promise.all([rm(report, { force: true }), rm(errors, { force: true })]);
    let failure;
    try {
      await execute(process.execPath, [cli, "run", "--config", "vitest.browser.config.ts", "--outputFile.json=" + report], {
        cwd: root, encoding: "utf8", env: { ...process.env, SIA_FAILURE_MESSAGES: errors, SIA_LIFECYCLE_CASE: mode },
        timeout: 120_000,
      });
    } catch (error) { failure = error; }
    const result = /** @type {{ numFailedTests: number; numPassedTests: number; testResults: { assertionResults: { title: string; status: string }[] }[] }} */ (JSON.parse(await readFile(report, "utf8")));
    assert.equal(Boolean(failure), message !== null, String(failure));
    assert.equal(result.numFailedTests, message === null ? 0 : mode === "shared" ? 4 : 2);
    const assertions = result.testResults.flatMap(file => file.assertionResults);
    if (mode) {
      const retained = assertions.filter(test => test.title === "retained run is closed");
      assert.equal(retained.length, 2);
      assert.ok(retained.every(test => test.status === "passed"));
    } else assert.equal(result.numPassedTests, 4);
    if (mode) {
      const failures = /** @type {{ errors: string[]; tests: { errors: string[] }[] }} */ (JSON.parse(await readFile(errors, "utf8")));
      assert.deepEqual(failures.errors, []);
      assert.equal(failures.tests.length, mode === "shared" ? 4 : 2);
      if (message) for (const subject of failures.tests) {
        const messages = subject.errors.join("\n");
        assert.ok(messages.includes(message), messages);
        if (mode.endsWith("cleanup")) assert.ok(messages.includes("owned-source-cleanup-failure"), messages);
      }
    }
    console.log(`Chromium and Firefox ${mode === "" ? "public fixture" : mode} passed`);
  }
} finally { await rm(directory, { force: true, recursive: true }); }
