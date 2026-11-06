/** A child process separates fixture retention from the test runner's own object references. */
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import ts from "typescript";
import { expect, it } from "vitest";
it("empty fixture chunks do not accumulate while the source is unfinished", async () => {
  const directory = await mkdtemp(join(tmpdir(), "sia-fixture-retention-"));
  try {
    const target = join(directory, "files.mjs");
    for (const [sourceName, output] of [
      ["files.ts", target],
      ["byte-view.ts", join(directory, "byte-view.js")],
      ["reader-lifetime.ts", join(directory, "reader-lifetime.js")],
    ] as const) {
      const source = await readFile(resolve("src/testing", sourceName), "utf8");
      const compiled = ts.transpileModule(source, {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
        },
      });
      await writeFile(output, compiled.outputText);
    }
    for (const retain of [true, false]) {
      const result = await promisify(execFile)(
        process.execPath,
        [
          "--expose-gc",
          resolve("tests/fixtures/scoped-empty-chunks-gc.mjs"),
          pathToFileURL(target).href,
          retain ? "retain" : "release",
        ],
        { maxBuffer: 4096, timeout: 10000 },
      );
      const actual = JSON.parse(result.stdout) as {
        bytes: number[];
        emitted: number;
        kept: number;
        live: number;
      };
      expect(actual).toMatchObject({
        bytes: [1],
        emitted: 128,
        kept: retain ? 128 : 0,
      });
      // A suspended read may retain its previous result; earlier chunks must be collectible.
      if (retain) expect(actual.live).toBe(128);
      else expect(actual.live).toBeLessThanOrEqual(1);
    }
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});
