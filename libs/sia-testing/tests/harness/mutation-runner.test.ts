/** Exercises the mutation CLI in an owned checkout, including failed collection and surviving controls. */
import { execFile } from "node:child_process";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterEach, beforeEach, expect, it } from "vitest";

let directory: string;
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "sia-mutation-test-"));
  for (const path of [
    "src",
    "tests/model",
    "tests/http/auth.test.ts",
    "tests/fixtures/auth.ts",
    "package.json",
    "vitest.config.ts",
    "scripts",
  ]) {
    const destination = join(directory, path);
    await mkdir(join(destination, ".."), { recursive: true });
    await cp(path, destination, { recursive: true });
  }
  await symlink(
    join(process.cwd(), "node_modules"),
    join(directory, "node_modules"),
    "dir",
  );
});
afterEach(async () => {
  await rm(directory, { force: true, recursive: true });
});

const run = (args: string[] = []) =>
  promisify(execFile)(
    process.execPath,
    [join(directory, "scripts/mutation-regression.mjs"), ...args],
    { cwd: directory, timeout: 60_000 },
  );

it("prints mutation help without running the controls", async () => {
  const result = await run(["--help"]);
  expect(result.stdout).toContain("Usage:");
  expect(result.stdout).not.toContain("detected mutation:");
}, 70_000);

it("rejects unknown mutation arguments before running tests", async () => {
  await expect(run(["--unknown"])).rejects.toThrow("Unknown option");
}, 70_000);

it("runs mutation controls without writing to the working model", async () => {
  const source = join(directory, "src/model/index.ts");
  const before = await stat(source, { bigint: true });
  const original = await readFile(source, "utf8");
  const result = await run();
  expect(result.stdout).toContain("all mutation regressions detected");
  expect(result.stdout.match(/detected mutation:/g)).toHaveLength(15);
  expect(await readFile(source, "utf8")).toBe(original);
  expect((await stat(source, { bigint: true })).mtimeNs).toBe(before.mtimeNs);
}, 70_000);

it("rejects a collection error instead of counting it as a detected mutation", async () => {
  await writeFile(
    join(directory, "tests/model/accounts.test.ts"),
    'throw new Error("collection failure");',
  );
  await expect(run()).rejects.toThrow("mutation run failed outside a test");
}, 70_000);

it("fails when a mutation survives its tests", async () => {
  await writeFile(
    join(directory, "tests/model/accounts.test.ts"),
    'import { it } from "vitest"; it("has no account assertion", () => {});',
  );
  await expect(run()).rejects.toThrow("undetected mutations: account scoping");
}, 70_000);
