/** Deleted slab identities must not remain reachable through cached SDK payloads. */
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import ts from "typescript";
import { expect, test } from "vitest";

test("deleted payload records are collected while their network stays alive", async () => {
  const directory = await mkdtemp(join(tmpdir(), "sia-payload-retention-"));
  try {
    await writeFile(
      join(directory, "package.json"),
      JSON.stringify({ type: "module" }),
    );
    for (const name of [
      "model/index",
      "model/state",
      "sdk/abort",
      "sdk/control",
      "sdk/index",
      "sdk/link",
      "sdk/object",
      "sdk/payload-store",
      "sdk/protocol",
      "sdk/remote",
      "sdk/state",
    ]) {
      const source = await readFile(resolve(`src/${name}.ts`), "utf8");
      const compiled = ts.transpileModule(source, {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
        },
      });
      const target = join(directory, `${name}.js`);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(
        target,
        compiled.outputText.replace(
          '"@noble/hashes/sha2.js"',
          JSON.stringify(
            pathToFileURL(
              createRequire(import.meta.url).resolve("@noble/hashes/sha2.js"),
            ).href,
          ),
        ),
      );
    }
    const result = await promisify(execFile)(
      process.execPath,
      [
        "--expose-gc",
        resolve("tests/fixtures/deleted-payload-gc.mjs"),
        pathToFileURL(join(directory, "sdk/index.js")).href,
      ],
      { maxBuffer: 4096, timeout: 10000 },
    );
    expect(JSON.parse(result.stdout)).toEqual({
      abandonedCache: 0,
      externalDeletionCollected: 0,
      externalDeletionPruned: 0,
      invalidatedRead: 0,
      lastSiblingDeleted: 0,
      replacement: 0,
      restoredLastSiblingDeleted: 0,
      sdkDeletion: 0,
    });
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});
