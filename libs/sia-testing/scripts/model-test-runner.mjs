/**
 * Adapts Vitest's results for model mutation checks. A test failure can be the
 * expected result of injecting a fault, so this module returns a failure count
 * and leaves the baseline-or-mutation decision to its caller.
 *
 * Collection errors and unhandled errors cannot establish that a model rule was
 * tested. Empty, skipped or unfinished runs also invalidate the check instead of
 * being counted as successful detection.
 *
 * The caller supplies a prepared workspace and owns its removal. This runner
 * uses the unit project there without choosing faults or modifying model source.
 */
import { join } from "node:path";
import { startVitest } from "vitest/node";

/**
 * Returns test failures only after checking that the selected tests finished
 * without collection or unhandled errors. Infrastructure failures throw so a
 * broken test environment cannot be credited as a detected model fault.
 * @param {string} workspaceDirectory Copied source and tests with installed dependencies linked in.
 * @param {string[]} testFiles Test file paths relative to that workspace.
 * @returns {Promise<number>} Number of failed tests; zero means all selected tests passed.
 */
export async function runModelTests(workspaceDirectory, testFiles) {
  const previousExitCode = process.exitCode;
  try {
    // Non-watch startVitest runs close their worker pool before returning.
    const vitest = await startVitest("test", testFiles, {
      cache: false,
      config: join(workspaceDirectory, "vitest.config.ts"),
      project: ["unit"],
      // Keep expected mutant failures out of Vitest's default CI failure report.
      reporters: [{}],
      root: workspaceDirectory,
      watch: false,
    });
    const testModules = vitest.state.getTestModules();
    if (
      vitest.state.getUnhandledErrors().length ||
      testModules.some(
        (module) =>
          module.errors().length ||
          [...module.children.allSuites()].some(
            (suite) => suite.errors().length,
          ),
      )
    )
      throw new Error("mutation run failed outside a test");
    const testResults = testModules.flatMap((module) =>
      [...module.children.allTests()].map((test) => test.result()),
    );
    // A skipped test cannot certify its rule, even if another test detected this mutation.
    if (
      !testResults.length ||
      testResults.some(
        (result) => result.state !== "passed" && result.state !== "failed",
      )
    ) {
      throw new Error("mutation run did not finish its tests");
    }
    return testResults.filter((result) => result.state === "failed").length;
  } finally {
    // Vitest sets this on test failure; the caller must decide the command's final status.
    process.exitCode = previousExitCode;
  }
}
