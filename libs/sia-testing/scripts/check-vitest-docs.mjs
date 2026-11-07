/** Executes shipped README recipes against the packed public package, in Node and simulated DOMs, including isolated expected-timeout children. */
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkDocumentation, recipes } from "./documentation.mjs";
import {
  linkDirectory,
  packageRoot,
  withTemporaryDirectory,
} from "./workspace.mjs";

/** @typedef {{ numTotalTests: number, numPassedTests: number, numFailedTests: number, success: boolean, testResults: { assertionResults: { status: string }[] }[] }} TestReport */
const require = createRequire(import.meta.url);
const environment = { ...process.env, NODE_OPTIONS: "", NODE_PATH: "" };
const fixture = new URL("./package-consumer/", import.meta.url);

/** @param {string} packed @param {string} directory */
export async function checkVitestDocs(packed, directory) {
  await checkDocumentation(packed);
  const selected = recipes(await readFile(join(packed, "README.md"), "utf8"));
  const consumer = join(directory, "vitest-consumer");
  await mkdir(consumer, { recursive: true });
  await cp(packed, join(consumer, "node_modules/@lumeweb/sia-testing"), {
    recursive: true,
  });
  for (const dependency of [
    "vitest",
    "@types/node",
    "msw",
    "jsdom",
    "happy-dom",
  ]) {
    await linkDirectory(
      join(packageRoot, "node_modules", dependency),
      join(consumer, "node_modules", dependency),
    );
  }
  await writeFile(
    join(consumer, "package.json"),
    '{"private":true,"type":"module"}\n',
  );
  for (const [name, source] of Object.entries(selected)) {
    await writeFile(join(consumer, `${name}.test.ts`), source);
  }
  await cp(
    new URL("vitest-cleanup.test.ts.fixture", fixture),
    join(consumer, "cleanup.test.ts"),
  );
  for (const [source, target] of [
    ["vitest-environment.ts.fixture", "environment.ts"],
    ["vitest-transport.test.ts.fixture", "transport.test.ts"],
  ])
    await cp(new URL(source, fixture), join(consumer, target));
  await writeFile(
    join(consumer, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        lib: ["ESNext", "DOM"],
        module: "NodeNext",
        moduleResolution: "NodeNext",
        noEmit: true,
        skipLibCheck: true,
        strict: true,
        target: "ES2022",
        types: ["node"],
      },
      include: ["*.ts"],
    }),
  );
  const vitest = join(
    dirname(require.resolve("vitest/package.json")),
    "vitest.mjs",
  );
  const options = {
    cwd: consumer,
    encoding: /** @type {const} */ ("utf8"),
    env: environment,
    timeout: 60_000,
  };
  const prefix = selected.fixture.split("for (const label of")[0];
  await writeFile(
    join(consumer, "timeout.expected.ts"),
    prefix +
      (await readFile(new URL("vitest-timeout.ts.fixture", fixture), "utf8")),
  );
  execFileSync(
    process.execPath,
    [require.resolve("typescript/bin/tsc"), "-p", "tsconfig.json"],
    { ...options, stdio: "inherit" },
  );
  await writeFile(
    join(consumer, "timeout-reporter.mjs"),
    `
import { writeFileSync } from "node:fs";
export default class {
  tests = [];
  onTestCaseResult(test) {
    this.tests.push({ name: test.fullName, errors: test.result().errors?.map(error => error.message) ?? [] });
  }
  onTestRunEnd(_modules, errors) {
    writeFileSync(process.env.SIA_TEST_ENV + "-timeout-errors.json", JSON.stringify({ tests: this.tests, errors: errors.map(error => error.message) }));
  }
}
`,
  );
  /** @param {string} phase @param {string} name */
  async function checkIdentity(phase, name) {
    assert.deepEqual(
      JSON.parse(
        await readFile(
          join(consumer, `${phase}-${name}-identity.json`),
          "utf8",
        ),
      ),
      { environment: name, identity: name },
    );
  }
  const completed = [];
  for (const name of ["node", "jsdom", "happy-dom"]) {
    for (const [config, include] of [
      [`${name}.config.ts`, "*.test.ts"],
      [`${name}-timeout.config.ts`, "timeout.expected.ts"],
    ]) {
      await writeFile(
        join(consumer, config),
        `export default { test: { environment: ${JSON.stringify(name)}, include: [${JSON.stringify(include)}], setupFiles: ["./environment.ts"], maxWorkers: 1 } };\n`,
      );
    }
    options.env = {
      ...environment,
      SIA_TEST_ENV: name,
      SIA_TEST_PHASE: "ordinary",
    };
    execFileSync(
      process.execPath,
      [
        vitest,
        "run",
        "--config",
        `${name}.config.ts`,
        "--reporter=default",
        "--reporter=json",
        `--outputFile.json=${name}-passed.json`,
      ],
      { ...options, stdio: "inherit" },
    );
    const passed = /** @type {TestReport} */ (
      JSON.parse(await readFile(join(consumer, `${name}-passed.json`), "utf8"))
    );
    assert.equal(passed.numTotalTests, 6);
    assert.equal(passed.numPassedTests, 6);
    assert.equal(passed.success, true);

    assert.equal(passed.numFailedTests, 0);
    assert.deepEqual(
      passed.testResults
        .flatMap((file) => file.assertionResults)
        .map((result) => result.status),
      Array(6).fill("passed"),
    );
    await checkIdentity("ordinary", name);
    options.env = {
      ...environment,
      SIA_TEST_ENV: name,
      SIA_TEST_PHASE: "timeout",
    };
    const child = spawnSync(
      process.execPath,
      [
        vitest,
        "run",
        "--config",
        `${name}-timeout.config.ts`,
        "--reporter=default",
        "--reporter=json",
        "--reporter=./timeout-reporter.mjs",
        `--outputFile.json=${name}-timeout.json`,
      ],
      options,
    );
    assert.equal(
      child.error,
      undefined,
      "timeout child must execute and terminate",
    );
    assert.equal(child.signal, null);
    assert.equal(child.status, 1, `${child.stdout}\n${child.stderr}`);
    const report = /** @type {TestReport} */ (
      JSON.parse(await readFile(join(consumer, `${name}-timeout.json`), "utf8"))
    );
    assert.equal(report.numFailedTests, 2);
    assert.equal(report.numPassedTests, 0);
    assert.equal(report.success, false);
    assert.equal(report.numTotalTests, 2);
    assert.deepEqual(
      report.testResults
        .flatMap((file) => file.assertionResults)
        .map((result) => result.status),
      ["failed", "failed"],
    );
    assert.ok(
      child.stderr.includes("Test timed out in 100ms"),
      `${child.stdout}\n${child.stderr}`,
    );
    const errors =
      /** @type {{ errors: string[], tests: { name: string, errors: string[] }[] }} */ (
        JSON.parse(
          await readFile(join(consumer, `${name}-timeout-errors.json`), "utf8"),
        )
      );
    assert.deepEqual(
      errors.errors,
      [],
      "unhandled errors cannot count as expected timeouts",
    );
    assert.equal(errors.tests.length, 2);
    for (const result of errors.tests) {
      assert.ok(result.errors.length > 0);
      assert.ok(
        result.errors.every((message) =>
          message.startsWith("Test timed out in 100ms."),
        ),
        JSON.stringify(result),
      );
    }
    for (const marker of [
      "FIXTURE_CLOSED",
      "HELD_CALL_CANCELLED",
      "UNRELATED_CALLBACK_RELEASED",
    ]) {
      assert.ok(
        child.stdout.includes(marker),
        `Missing cleanup confirmation: ${marker}\n${child.stdout}\n${child.stderr}`,
      );
    }
    await checkIdentity("timeout", name);
    completed.push(name);
    const version = /** @type {{ version: string }} */ (
      JSON.parse(await readFile(require.resolve("vitest/package.json"), "utf8"))
    ).version;
    console.log(
      `Vitest public consumer passed: 6 tests; 2 expected timeout failures confirmed; ${process.version}, Vitest ${version}, ${name} environment`,
    );
  }
  assert.deepEqual(
    completed,
    ["node", "jsdom", "happy-dom"],
    "all environments must complete",
  );
  for (const dependency of ["msw", "jsdom", "happy-dom"]) {
    const metadata = /** @type {{ version: string }} */ (
      JSON.parse(
        await readFile(
          join(packageRoot, "node_modules", dependency, "package.json"),
          "utf8",
        ),
      )
    );
    console.log(`${dependency} ${metadata.version}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await withTemporaryDirectory("sia-vitest-docs-", async (directory) => {
    const output = execFileSync(
      "npm",
      [
        "pack",
        "--offline",
        "--ignore-scripts",
        "--json",
        "--pack-destination",
        directory,
      ],
      { cwd: packageRoot, encoding: "utf8", env: environment, timeout: 30_000 },
    );
    const [packed] = /** @type {{ filename: string }[]} */ (JSON.parse(output));
    execFileSync("tar", [
      "-xzf",
      join(directory, packed.filename),
      "-C",
      directory,
    ]);
    await checkVitestDocs(join(directory, "package"), directory);
  });
}
