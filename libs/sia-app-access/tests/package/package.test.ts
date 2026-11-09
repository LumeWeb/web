/** A checkout import cannot establish that npm and pnpm include the declared entry files. */
import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { checkPackage, workspace } from "./packed-package.ts";

function standaloneManifest(manifest: object): void {
  const dependencies: unknown =
    "dependencies" in manifest ? manifest.dependencies : undefined;
  assert.ok(dependencies && typeof dependencies === "object");
  Reflect.set(dependencies, "@lumeweb/sia-session", "0.0.0");
  Reflect.deleteProperty(manifest, "devDependencies");
}

void test(
  "the archive provides the controller and lazy SDK adapter without optional runtimes",
  { timeout: 120000 },
  async () => {
    await checkPackage(workspace);
  },
);

void test(
  "archive checks reject an export whose checkout files are excluded from the package",
  { timeout: 120000 },
  async (t) => {
    const input = await mkdtemp(
      join(tmpdir(), "sia-credential-package-regression-"),
    );
    t.after(() => rm(input, { force: true, recursive: true }));
    await cp(join(workspace, "dist"), join(input, "dist"), { recursive: true });
    await mkdir(join(input, "src"));
    await writeFile(
      join(input, "src/not-packed.js"),
      "export * from '../dist/index.js';",
    );
    await writeFile(
      join(input, "src/not-packed.d.ts"),
      "export * from '../dist/index.js';",
    );
    const manifest: unknown = JSON.parse(
      await readFile(join(workspace, "package.json"), "utf8"),
    );
    assert.ok(
      manifest && typeof manifest === "object" && "exports" in manifest,
    );
    assert.ok(manifest.exports && typeof manifest.exports === "object");
    standaloneManifest(manifest);
    Reflect.set(manifest.exports, ".", {
      import: "./src/not-packed.js",
      types: "./src/not-packed.d.ts",
    });
    Reflect.set(manifest, "scripts", {
      prepack:
        "node -e \"throw new Error('Pack lifecycle must remain disabled')\"",
    });
    await writeFile(join(input, "package.json"), JSON.stringify(manifest));
    await assert.rejects(
      checkPackage(input),
      /Packed export \. import target missing: \.\/src\/not-packed\.js/,
    );
  },
);

void test(
  "archive checks reject an eager SDK import in the optional entry",
  { timeout: 120000 },
  async (t) => {
    const input = await mkdtemp(join(tmpdir(), "sia-package-eager-sdk-"));
    t.after(() => rm(input, { force: true, recursive: true }));
    await cp(join(workspace, "dist"), join(input, "dist"), { recursive: true });
    const manifest: unknown = JSON.parse(
      await readFile(join(workspace, "package.json"), "utf8"),
    );
    assert.ok(manifest && typeof manifest === "object");
    standaloneManifest(manifest);
    await writeFile(join(input, "package.json"), JSON.stringify(manifest));
    const entry = join(input, "dist/sia.js");
    await writeFile(
      entry,
      'import "@siafoundation/sia-storage/wasm";\n' +
        (await readFile(entry, "utf8")),
    );
    await assert.rejects(
      checkPackage(input),
      /Optional runtime peer requested: @siafoundation\/sia-storage\/wasm/,
    );
  },
);
