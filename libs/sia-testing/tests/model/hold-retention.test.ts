/** Exercises the compiled control module under a child-owned GC rather than inspecting its private collections. */
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import ts from "typescript";
import { expect, test } from "vitest";

test("cancelled callers can be collected while their global hold stays active", async () => {
  const directory = await mkdtemp(join(tmpdir(), "sia-hold-retention-"));
  try {
    await writeFile(
      join(directory, "package.json"),
      JSON.stringify({ type: "module" }),
    );
    for (const name of ["abort", "control", "link"]) {
      const source = await readFile(resolve(`src/sdk/${name}.ts`), "utf8");
      const compiled = ts.transpileModule(source, {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
        },
      });
      await writeFile(join(directory, `${name}.js`), compiled.outputText);
    }
    const result = await promisify(execFile)(
      process.execPath,
      [
        "--expose-gc",
        resolve("tests/fixtures/held-call-gc.mjs"),
        pathToFileURL(join(directory, "control.js")).href,
      ],
      { maxBuffer: 4096, timeout: 10000 },
    );
    expect(JSON.parse(result.stdout) as { retained: number }).toEqual({
      retained: 0,
    });
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});
