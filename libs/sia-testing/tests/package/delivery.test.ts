/** Runs the delivery checker against disposable package files, never workspace imports. */
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, beforeEach, expect, test } from "vitest";

let temp: string;
let packed: string;
beforeEach(async () => {
  temp = await mkdtemp(join(tmpdir(), "sia-delivery-test-"));
  packed = join(temp, "package");
  await mkdir(packed);
  const metadata = JSON.parse(await readFile("package.json", "utf8")) as {
    exports: Record<string, unknown>;
  };
  await writeFile(join(packed, "package.json"), JSON.stringify(metadata));
  const files: Record<string, string> = {
    "fixtures/index.d.ts":
      "export declare function createAccount(): { ready: boolean };",
    "fixtures/index.js":
      "export const createAccount = () => ({ ready: true });",
    "http/index.d.ts":
      'import type { Server } from "node:http"; import type { IndexdModel } from "../model/index.js"; export declare function createIndexdHttpServer(options: { model: IndexdModel }): { server: Server };',
    "http/index.js":
      'import "node:http"; export const createIndexdHttpServer = () => ({ server: { listening: false } });',
    "model/index.d.ts":
      "export interface IndexdModel { snapshot(): { accounts: unknown[] }; } export declare function createIndexdModel(options: { quotaBytes: number }): IndexdModel;",
    "model/index.js":
      "export const createIndexdModel = () => ({ snapshot: () => ({ accounts: [] }) });",
    "msw/index.d.ts":
      'import type { HttpHandler } from "msw"; import type { IndexdModel } from "../model/index.js"; export declare function createIndexdHandlers(options: { model: IndexdModel }): { handlers: HttpHandler[] };',
    "msw/index.js":
      'import { http } from "msw"; export const createIndexdHandlers = () => ({ handlers: [http.get("*", () => new Response())] });',
    "msw/node.d.ts":
      'import type { SetupServerApi } from "msw/node"; import type { IndexdModel } from "../model/index.js"; export declare function setupIndexdServer(options: { model: IndexdModel }): SetupServerApi;',
    "msw/node.js":
      'import { setupServer } from "msw/node"; export const setupIndexdServer = () => setupServer();',
  };
  for (const [path, content] of Object.entries(files)) {
    const file = join(packed, "dist/esm", path);
    await mkdir(resolve(file, ".."), { recursive: true });
    await writeFile(file, content);
  }
  // Block registry access if the checker regresses to installing dependencies.
  await mkdir(join(temp, "bin"));
  await writeFile(
    join(temp, "bin/npm"),
    "#!/bin/sh\necho 'npm is forbidden in fixture checks' >&2\nexit 99\n",
    { mode: 0o755 },
  );
});
afterEach(async () => {
  await rm(temp, { force: true, recursive: true });
});
async function append(path: string, source: string) {
  const file = join(packed, path);
  await writeFile(file, (await readFile(file, "utf8")) + source);
}
function check(
  args = ["--unpacked", packed],
  script = resolve("scripts/check-package.mjs"),
) {
  const result = spawnSync(process.execPath, [script, ...args], {
    encoding: "utf8",
    env: {
      ...process.env,
      NODE_PATH: "",
      PATH: `${join(temp, "bin")}:${process.env.PATH}`,
    },
  });
  return { output: result.stdout + result.stderr, status: result.status };
}
test("delivers all packed entries without npm installation", () => {
  const result = check();
  expect(result.output).toContain(
    "packed consumer checks passed (6 explicit exports)",
  );
  expect(result.status).toBe(0);
}, 60000);
test("prints help without packing or checking a package", () => {
  const result = check(["--help"]);
  expect(result.status).toBe(0);
  expect(result.output).toContain("--unpacked");
  expect(result.output).not.toContain("npm is forbidden");
});

test("accepts an equals-form unpacked directory without npm installation", () => {
  expect(check([`--unpacked=${packed}`]).status).toBe(0);
}, 60000);

test.each([["--unknown"], ["unexpected"], ["--unpacked"], ["--unpacked="]])(
  "rejects invalid arguments %j before packing",
  (...args) => {
    const result = check(args);
    expect(result.status).not.toBe(0);
    expect(result.output).not.toContain("npm is forbidden");
  },
);

test("executes the copied consumer fixture", async () => {
  const checkout = join(temp, "checkout");
  await cp("scripts", join(checkout, "scripts"), { recursive: true });
  await symlink(resolve("node_modules"), join(checkout, "node_modules"), "dir");
  const fixtures = join(checkout, "scripts/package-consumer");
  await mkdir(fixtures, { recursive: true });
  await writeFile(
    join(fixtures, "without-msw.mjs.fixture"),
    'throw new Error("consumer-fixture-executed");',
  );
  const result = check(
    ["--unpacked", packed],
    join(checkout, "scripts/check-package.mjs"),
  );
  expect(result.status).not.toBe(0);
  expect(result.output).toContain("consumer-fixture-executed");
}, 60000);

test("rejects dependency names that escape the consumer", async () => {
  const file = join(packed, "package.json");
  const metadata = JSON.parse(await readFile(file, "utf8")) as {
    dependencies: Record<string, string>;
  };
  metadata.dependencies = { "../outside": "1.0.0" };
  await writeFile(file, JSON.stringify(metadata));
  const result = check();
  expect(result.status).not.toBe(0);
  expect(result.output).toContain("invalid dependency name");
}, 60000);

test("rejects a packed package with an unexpected name", async () => {
  const file = join(packed, "package.json");
  const metadata = JSON.parse(await readFile(file, "utf8")) as { name: string };
  metadata.name = "../../outside-consumer";
  await writeFile(file, JSON.stringify(metadata));
  const result = check();
  expect(result.status).not.toBe(0);
  expect(result.output).toContain("unexpected package name");
}, 60000);

test("rejects a missing string export target", async () => {
  const file = join(packed, "package.json");
  const metadata = JSON.parse(await readFile(file, "utf8")) as {
    exports: Record<string, unknown>;
  };
  metadata.exports["./package.json"] = "./missing.json";
  await writeFile(file, JSON.stringify(metadata));
  const result = check();
  expect(result.status).not.toBe(0);
  expect(result.output).toContain("missing packed target ./missing.json");
}, 60000);
test("compiles declaration dependencies rather than checking only entry files", async () => {
  await append(
    "dist/esm/model/index.d.ts",
    '\nexport { Missing } from "./missing-types.js";\n',
  );
  const result = check();
  expect(result.status).not.toBe(0);
  expect(result.output).toContain("missing-types.js");
}, 60000);
test.each([
  "node:fs",
  "@siafoundation/sia-storage",
  "vitest",
  "@playwright/test",
])(
  "rejects the transitive browser dependency %s",
  async (dependency) => {
    await append("dist/esm/fixtures/index.js", '\nimport "./forbidden.js";\n');
    await writeFile(
      join(packed, "dist/esm/fixtures/forbidden.js"),
      `if (typeof window !== "undefined") void import(${JSON.stringify(dependency)});\n`,
    );
    const result = check();
    expect(result.status).not.toBe(0);
    expect(result.output).toContain(
      `forbidden browser dependency ${dependency}`,
    );
  },
  60000,
);
test("rejects a declaration that breaks the typed consumer", async () => {
  await writeFile(
    join(packed, "dist/esm/model/index.d.ts"),
    "export interface IndexdModel { snapshot(): { accounts: number }; } export declare function createIndexdModel(options: { quotaBytes: number }): IndexdModel;",
  );
  const result = check();
  expect(result.status).not.toBe(0);
  expect(result.output).toContain(
    "Property 'length' does not exist on type 'number'",
  );
}, 60000);
test.each(["msw/index.js", "msw/node.js"])(
  "rejects %s when it no longer requires the optional peer",
  async (entry) => {
    await writeFile(
      join(packed, "dist/esm", entry),
      "export const placeholder = true;\n",
    );
    const result = check();
    expect(result.status).not.toBe(0);
    expect(result.output).toContain("must require the optional msw peer");
  },
  60000,
);
test.each(["msw/index.js", "msw/node.js"])(
  "imports %s with the installed peer",
  async (entry) => {
    await append(
      `dist/esm/${entry}`,
      '\nthrow new Error("peer-present-entry-executed");\n',
    );
    const result = check();
    expect(result.status).not.toBe(0);
    expect(result.output).toContain("peer-present-entry-executed");
  },
  60000,
);
