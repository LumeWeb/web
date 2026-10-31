/**
 * Checks that the regression tests detect named faults in the model. A compiler
 * mutation deliberately breaks a rule such as account isolation or sharing expiry.
 * Its associated test file must fail after the unmodified baseline has passed;
 * a passing test file means the fault survived and makes this command fail.
 *
 * Collection and unhandled errors invalidate a run. A broken import must not be
 * credited as a test detecting a model fault. Mutations stay in a disposable
 * workspace so interruption cannot leave faults in the checked-out model.
 */
import { cp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseArgs } from "node:util";
import {
  linkDirectory,
  packageRoot,
  withTemporaryDirectory,
} from "./workspace.mjs";

/**
 * Several faults share test files. One combined baseline establishes that their
 * tests already pass, without repeating an unmodified file for each fault.
 * Survivors are collected so a run reports every surviving named fault instead
 * of stopping at the first gap in the tests.
 * @param {string} workspaceDirectory
 */
async function checkModelMutations(workspaceDirectory) {
  const { modelMutations, mutateModelSource } =
    await import("./model-mutations.mjs");
  const { runModelTests } = await import("./model-test-runner.mjs");
  const testFiles = [
    ...new Set(modelMutations.map((mutation) => mutation.testFile)),
  ];
  // Tests must resolve copied source; only their installed dependencies may point back to the checkout.
  await cp(join(packageRoot, "src"), join(workspaceDirectory, "src"), {
    recursive: true,
  });
  for (const path of [
    "package.json",
    "vitest.config.ts",
    "tests/fixtures/auth.ts",
    ...testFiles,
  ]) {
    await cp(join(packageRoot, path), join(workspaceDirectory, path));
  }
  await linkDirectory(
    join(packageRoot, "node_modules"),
    join(workspaceDirectory, "node_modules"),
  );

  const baselineFailureCount = await runModelTests(
    workspaceDirectory,
    testFiles,
  );
  if (baselineFailureCount > 0) throw new Error("mutation baseline failed");

  const modelPath = join(workspaceDirectory, "src/model/index.ts");
  const originalSource = await readFile(modelPath, "utf8");
  const survivingMutations = [];
  for (const mutation of modelMutations) {
    // Start from unchanged source so one fault cannot hide another.
    await writeFile(
      modelPath,
      mutateModelSource(originalSource, mutation.name),
    );
    const failureCount = await runModelTests(workspaceDirectory, [
      mutation.testFile,
    ]);
    if (failureCount > 0) console.log(`detected mutation: ${mutation.name}`);
    else survivingMutations.push(mutation.name);
  }
  if (survivingMutations.length)
    throw new Error(`undetected mutations: ${survivingMutations.join(", ")}`);
  console.log("all mutation regressions detected");
}

async function main() {
  const { values } = parseArgs({
    allowPositionals: false,
    options: { help: { short: "h", type: "boolean" } },
    strict: true,
  });
  if (values.help) {
    console.log("Usage: mutation-regression.mjs [--help]");
    return;
  }
  await withTemporaryDirectory("sia-model-mutations-", checkModelMutations);
}

await main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
