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
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { build } from "vite";

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
    assert.ok(
      "peerDependencies" in manifest && "peerDependenciesMeta" in manifest,
    );
    assert.deepEqual(manifest.peerDependencies, {
      "@siafoundation/sia-storage": "0.2.0",
      "react": "^19.0.0",
      "unstorage": "^1.17.5",
      "zustand": "^5.0.14",
    });
    assert.deepEqual(manifest.peerDependenciesMeta, {
      "@siafoundation/sia-storage": { optional: true },
      "react": { optional: true },
      "unstorage": { optional: true },
      "zustand": { optional: true },
    });
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
    assert.match(
      await readFile(join(packed, "dist/react.js"), "utf8"),
      /^"use client";/,
    );
    const modules = join(consumer, "node_modules/@lumeweb/sia-app-access");
    await mkdir(dirname(modules), { recursive: true });
    await cp(packed, modules, { recursive: true });
    const sessionArchive = join(owned, "session-archive");
    const sessionWorkspace = fileURLToPath(
      new URL("../../../sia-session/", import.meta.url),
    );
    await mkdir(sessionArchive);
    await run(
      process.execPath,
      [cli, "pack", "--pack-destination", sessionArchive],
      sessionWorkspace,
      cache,
    );
    const sessionTarballs = (await readdir(sessionArchive)).filter((name) =>
      name.endsWith(".tgz"),
    );
    assert.equal(sessionTarballs.length, 1);
    const sessionTarball = sessionTarballs[0];
    assert.ok(sessionTarball);
    await run(
      "tar",
      ["-xzf", join(sessionArchive, sessionTarball), "-C", sessionArchive],
      owned,
      cache,
    );
    await cp(
      join(sessionArchive, "package"),
      join(consumer, "node_modules/@lumeweb/sia-session"),
      { recursive: true },
    );
    await cp(
      await realpath(join(sessionWorkspace, "node_modules/nanoevents")),
      join(consumer, "node_modules/nanoevents"),
      { recursive: true },
    );
    const robot = findPackageJSON("robot3", import.meta.url);
    assert.ok(robot);
    // Linking would expose the workspace dependency graph to the isolated consumer.
    await cp(
      dirname(await realpath(robot)),
      join(consumer, "node_modules/robot3"),
      { recursive: true },
    );
    await copyPeer("@noble/hashes", join(consumer, "node_modules"));
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
    assert.match(output, /Packed unstorage adapter imports without unstorage/);
    assert.match(output, /Packed controller consumer assertions completed/);
    assert.match(
      output,
      /Packed SDK adapter construction completed without SDK resolution/,
    );
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
    await writeFile(
      join(consumer, "index.html"),
      '<script type="module" src="/main.js"></script>',
    );
    await writeFile(
      join(consumer, "main.js"),
      'import { createSiaAdapter } from "@lumeweb/sia-app-access/sia"; document.body.textContent = typeof createSiaAdapter().begin;',
    );
    // Vite must see the extracted package's optional-peer metadata, not checkout SDK links.
    await build({
      build: { outDir: join(owned, "browser") },
      configFile: false,
      logLevel: "silent",
      root: consumer,
    });
    const dependencies = join(consumer, "node_modules");
    await copyPeer("react", dependencies);
    await cp(
      new URL("./react-runtime.fixture", import.meta.url),
      join(consumer, "react-consumer.mjs"),
    );
    const reactOutput = await run(
      process.execPath,
      ["react-consumer.mjs"],
      consumer,
      cache,
    );
    assert.match(
      reactOutput,
      /Packed React observation imports without optional integrations/,
    );
    const reactTypes = await copyPeer("@types/react", dependencies);
    await copyPeer("csstype", dependencies, pathToFileURL(reactTypes).href);
    await cp(
      new URL("./react.fixture", import.meta.url),
      join(consumer, "react.ts"),
    );
    await writeFile(
      join(consumer, "tsconfig.react.json"),
      JSON.stringify({
        compilerOptions: { lib: ["ES2022", "DOM"] },
        extends: "./tsconfig.json",
        files: ["react.ts"],
      }),
    );
    await run(
      process.execPath,
      [
        fileURLToPath(import.meta.resolve("typescript/bin/tsc")),
        "-p",
        join(consumer, "tsconfig.react.json"),
      ],
      consumer,
      cache,
    );
    await copyPeer("react-dom", dependencies);
    await cp(
      new URL("./react-ssr.fixture", import.meta.url),
      join(consumer, "react-ssr-consumer.mjs"),
    );
    const nativeOutput = await run(
      process.execPath,
      ["react-ssr-consumer.mjs"],
      consumer,
      cache,
    );
    assert.match(nativeOutput, /Packed React hooks render without Zustand/);
    await copyPeer("zustand", dependencies);
    const mixedOutput = await run(
      process.execPath,
      ["react-ssr-consumer.mjs", "--zustand"],
      consumer,
      cache,
    );
    assert.match(
      mixedOutput,
      /Packed React and Zustand readers share controller snapshots without synchronization/,
    );
    // SDK types are needed only after the framework-free consumer has compiled alone.
    const sdk = findPackageJSON("@siafoundation/sia-storage", import.meta.url);
    assert.ok(sdk);
    await cp(
      dirname(await realpath(sdk)),
      join(consumer, "node_modules/@siafoundation/sia-storage"),
      { recursive: true },
    );
    await cp(
      new URL("./sia.fixture", import.meta.url),
      join(consumer, "sia.ts"),
    );
    await writeFile(
      join(consumer, "tsconfig.sdk.json"),
      JSON.stringify({
        compilerOptions: { lib: ["ES2022", "DOM", "ESNext.Disposable"] },
        extends: "./tsconfig.json",
        files: ["sia.ts"],
      }),
    );
    await run(
      process.execPath,
      [
        fileURLToPath(import.meta.resolve("typescript/bin/tsc")),
        "-p",
        join(consumer, "tsconfig.sdk.json"),
      ],
      consumer,
      cache,
    );
  } finally {
    await rm(owned, { force: true, recursive: true });
  }
}

/** Packed caller templates must also typecheck before access declarations exist. */
export async function checkSourceFixtures(): Promise<void> {
  const owned = await mkdtemp(join(tmpdir(), "sia-source-fixtures-"));
  try {
    await writeFile(
      join(owned, "package.json"),
      JSON.stringify({ type: "module" }),
    );
    for (const name of ["core", "react", "runtime"]) {
      await cp(
        new URL(`./${name}.fixture`, import.meta.url),
        join(owned, "fixture.ts"),
      );
      await writeFile(
        join(owned, "tsconfig.json"),
        JSON.stringify({
          compilerOptions: {
            allowImportingTsExtensions: true,
            exactOptionalPropertyTypes: true,
            jsx: "react-jsx",
            lib: ["ES2022", "DOM", "ESNext.Disposable"],
            module: "NodeNext",
            moduleResolution: "NodeNext",
            noEmit: true,
            paths: {
              "@/*": [
                join(workspace, "src/*.ts"),
                join(workspace, "src/*.tsx"),
              ],
              "@lumeweb/sia-app-access": [join(workspace, "src/index.ts")],
              "@lumeweb/sia-app-access/react": [
                join(workspace, "src/react.ts"),
              ],
              "@lumeweb/sia-app-access/react-hook-form": [
                join(workspace, "src/react-hook-form.ts"),
              ],
              "@lumeweb/sia-app-access/sia": [join(workspace, "src/sia.ts")],
              "@lumeweb/sia-app-access/unstorage": [
                join(workspace, "src/unstorage.ts"),
              ],
              "@lumeweb/sia-app-access/zustand": [
                join(workspace, "src/zustand.ts"),
              ],
            },
            skipLibCheck: false,
            strict: true,
            target: "ES2022",
            typeRoots: [join(workspace, "node_modules/@types")],
            types: name === "runtime" ? ["node"] : [],
          },
          files: ["fixture.ts"],
        }),
      );
      await run(
        process.execPath,
        [
          fileURLToPath(import.meta.resolve("typescript/bin/tsc")),
          "-p",
          join(owned, "tsconfig.json"),
        ],
        owned,
        join(owned, "cache"),
      );
    }
  } finally {
    await rm(owned, { force: true, recursive: true });
  }
}

/** Realpaths keep copied peers from resolving through workspace dependency links. */
async function copyPeer(
  name: string,
  modules: string,
  base: string = import.meta.url,
): Promise<string> {
  const metadata = findPackageJSON(name, base);
  assert.ok(metadata);
  const physical = await realpath(metadata);
  const destination = join(modules, name);
  await mkdir(dirname(destination), { recursive: true });
  await cp(dirname(physical), destination, { recursive: true });
  return physical;
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
