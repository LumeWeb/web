/** Fault selectors must stop retaining fixture handles when their last failure is consumed. */
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import ts from "typescript";
import { expect, it } from "vitest";
it("consumed fault selectors are collectible while pending faults remain active", async () => {
  const directory = await mkdtemp(join(tmpdir(), "sia-fault-retention-"));
  try {
    await writeFile(
      join(directory, "package.json"),
      JSON.stringify({ type: "module" }),
    );
    for (const name of [
      "testing/controls",
      "testing/diagnostics",
      "sdk/link",
    ]) {
      const source = await readFile(resolve(`src/${name}.ts`), "utf8");
      await mkdir(join(directory, name.split("/")[0]!), { recursive: true });
      await writeFile(
        join(directory, `${name}.js`),
        ts.transpileModule(source, {
          compilerOptions: {
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ES2022,
          },
        }).outputText,
      );
    }
    for (const mode of ["retain", "pending", "release"]) {
      const result = await promisify(execFile)(
        process.execPath,
        [
          "--expose-gc",
          resolve("tests/fixtures/scoped-consumed-faults-gc.mjs"),
          pathToFileURL(join(directory, "testing/controls.js")).href,
          mode,
        ],
        { maxBuffer: 4096, timeout: 10000 },
      );
      const actual = JSON.parse(result.stdout) as {
        kept: number;
        live: number;
      };
      expect(actual.kept).toBe(mode === "retain" ? 32 : 0);
      if (mode === "release") expect(actual.live).toBeLessThanOrEqual(1);
      else expect(actual.live).toBe(32);
    }
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});
