/** Archive checks use copied consumers outside the workspace so source files cannot hide missing exports. */
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  cp,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { findPackageJSON } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

export const workspace = fileURLToPath(new URL("../../", import.meta.url));
const execute = promisify(execFile);

export async function checkPackage(input: string): Promise<void> {
  const owned = await mkdtemp(join(tmpdir(), "sia-credential-package-"));
  try {
    const archive = join(owned, "archive");
    const consumer = join(owned, "consumer");
    const cache = join(owned, "cache");
    await mkdir(archive);
    await mkdir(consumer);
    const cli = process.env.npm_execpath;
    assert.ok(cli, "Run package checks through npm or pnpm");
    await run(
      process.execPath,
      [cli, "pack", "--pack-destination", archive],
      input,
      cache,
    );
    const files = (await readdir(archive)).filter((name) =>
      name.endsWith(".tgz"),
    );
    assert.equal(files.length, 1);
    const tarball = files[0];
    assert.ok(tarball);
    await run(
      "tar",
      ["-xzf", join(archive, tarball), "-C", archive],
      owned,
      cache,
    );
    const packed = join(archive, "package");
    const manifest: unknown = JSON.parse(
      await readFile(join(packed, "package.json"), "utf8"),
    );
    assert.ok(
      manifest && typeof manifest === "object" && "exports" in manifest,
    );
    assert.ok("name" in manifest && "files" in manifest);
    assert.equal(manifest.name, "@lumeweb/sia-app-access");
    assert.deepEqual(manifest.files, ["dist"]);
    assert.ok(manifest.exports && typeof manifest.exports === "object");
    for (const [entry, unchecked] of Object.entries(manifest.exports)) {
      const targets: unknown = unchecked;
      assert.ok(targets && typeof targets === "object");
      for (const [condition, target] of Object.entries(targets)) {
        assert.equal(typeof target, "string");
        assert.ok(typeof target === "string" && target.startsWith("./"));
        const path = resolve(packed, target);
        assert.ok(path.startsWith(packed + sep));
        await readFile(path).catch((cause: unknown) => {
          throw new Error(
            `Packed export ${entry} ${condition} target missing: ${target}`,
            { cause },
          );
        });
      }
    }
    const modules = join(consumer, "node_modules/@lumeweb/sia-app-access");
    await mkdir(dirname(modules), { recursive: true });
    await cp(packed, modules, { recursive: true });
    const robot = findPackageJSON("robot3", import.meta.url);
    assert.ok(robot);
    // Linking would expose the workspace dependency graph to the isolated consumer.
    await cp(
      dirname(await realpath(robot)),
      join(consumer, "node_modules/robot3"),
      { recursive: true },
    );
    for (const file of await readdir(join(packed, "dist"))) {
      if (file.endsWith(".js") || file.endsWith(".d.ts"))
        assert.doesNotMatch(
          await readFile(join(packed, "dist", file), "utf8"),
          /["']@\//,
        );
    }
    await writeFile(
      join(consumer, "package.json"),
      JSON.stringify({ private: true, type: "module" }),
    );
    await cp(
      new URL("./runtime.fixture", import.meta.url),
      join(consumer, "runtime.mjs"),
    );
    await cp(
      new URL("./core.fixture", import.meta.url),
      join(consumer, "core.ts"),
    );
    await writeFile(
      join(consumer, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          exactOptionalPropertyTypes: true,
          lib: ["ES2022"],
          module: "NodeNext",
          moduleResolution: "NodeNext",
          noEmit: true,
          skipLibCheck: false,
          strict: true,
          target: "ES2022",
          types: [],
        },
        files: ["core.ts"],
      }),
    );
    const output = await run(
      process.execPath,
      ["runtime.mjs"],
      consumer,
      cache,
    );
    assert.match(output, /Packed credential consumer assertions completed/);
    assert.match(output, /Packed controller consumer assertions completed/);
    await run(
      process.execPath,
      [
        fileURLToPath(import.meta.resolve("typescript/bin/tsc")),
        "-p",
        join(consumer, "tsconfig.json"),
      ],
      consumer,
      cache,
    );
  } finally {
    await rm(owned, { force: true, recursive: true });
  }
}

async function run(
  file: string,
  args: readonly string[],
  cwd: string,
  cache: string,
): Promise<string> {
  const result = await execute(file, args, {
    cwd,
    encoding: "utf8",
    env: {
      ...process.env,
      npm_config_cache: cache,
      npm_config_ignore_scripts: "true",
      npm_config_offline: "true",
      npm_config_update_notifier: "false",
      // pnpm 11 reads its own prefix rather than npm's configuration variables.
      pnpm_config_cache_dir: cache,
      pnpm_config_ignore_scripts: "true",
      pnpm_config_offline: "true",
    },
    maxBuffer: 4 * 1024 * 1024,
    timeout: 45000,
  });
  return result.stdout;
}
