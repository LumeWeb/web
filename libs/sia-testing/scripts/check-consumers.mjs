/** Builds copied consumer pages using cached dependencies, never installs or contacts a service. */
import { execFileSync } from "node:child_process";
import {
  chmod,
  cp,
  mkdir,
  readdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { linkDirectory, withTemporaryDirectory } from "./workspace.mjs";

const repo = fileURLToPath(new URL("../../../", import.meta.url));
const cache = join(repo, "node_modules/.pnpm");
const entries = await readdir(cache);
const environment = {
  ...process.env,
  NODE_OPTIONS: "",
  NODE_PATH: "",
};
for (const name of Object.keys(environment)) {
  if (name.startsWith("SIA_TEST_") || name.startsWith("SIA_E2E_"))
    delete environment[name];
}
/** @param {string} root @param {Record<string, string>} localPackages */
async function dependencies(root, localPackages) {
  const manifest =
    /** @type {{ peerDependencies?: Record<string, string>, dependencies?: Record<string, string>, devDependencies?: Record<string, string> }} */ (
      JSON.parse(await readFile(join(root, "package.json"), "utf8"))
    );
  const all = {
    ...manifest.peerDependencies,
    ...manifest.dependencies,
    ...manifest.devDependencies,
  };
  for (const [name, version] of Object.entries(all)) {
    await linkDirectory(
      localPackages[name] ?? dependency(name, version),
      join(root, "node_modules", name),
    );
  }
}
/** @param {string} name @param {string} specifier */
function dependency(name, specifier) {
  for (const prefix of [
    join(repo, "node_modules"),
    join(repo, "libs/sia-testing/node_modules"),
  ]) {
    if (existsSync(join(prefix, name))) return join(prefix, name);
  }
  const prefix = `${name.replaceAll("/", "+")}@`;
  const version = specifier.replace(/^\^/, "");
  const candidates = entries
    .filter((entry) => entry.startsWith(prefix))
    .sort(
      (a, b) =>
        Number(b.startsWith(prefix + version)) -
        Number(a.startsWith(prefix + version)),
    );
  for (const entry of candidates) {
    const path = join(cache, entry, "node_modules", name);
    if (existsSync(path)) return path;
  }
  throw new Error(`Cached dependency unavailable: ${name} (${specifier})`);
}
/** @param {string} root @param {string} destination */
async function pack(root, destination) {
  await mkdir(destination, { recursive: true });
  const output = execFileSync(
    "npm",
    [
      "pack",
      "--offline",
      "--ignore-scripts",
      "--json",
      "--pack-destination",
      destination,
    ],
    { cwd: root, encoding: "utf8", env: environment, timeout: 30_000 },
  );
  const [packed] = /** @type {{ filename: string }[]} */ (JSON.parse(output));
  if (!packed?.filename) throw new Error("npm pack produced no package");
  execFileSync(
    "tar",
    ["-xzf", join(destination, packed.filename), "-C", destination],
    { env: environment, timeout: 30_000 },
  );
  return join(destination, "package");
}
/** @param {string} script @param {string[]} args @param {string} cwd */
function run(script, args, cwd) {
  return execFileSync(process.execPath, [script, ...args], {
    cwd,
    encoding: "utf8",
    env: environment,
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 90_000,
  });
}
await withTemporaryDirectory("sia-consumer-check-", async (directory) => {
  await linkDirectory(
    dependency("oxlint-tsgolint", "catalog:"),
    join(directory, "node_modules/oxlint-tsgolint"),
  );
  const library = join(directory, "libs/sia-video-source");
  const testing = join(directory, "packages/sia-testing");
  const testingTarball = await pack(
    join(repo, "libs/sia-testing"),
    join(directory, "testing-tarball"),
  );
  await cp(testingTarball, testing, { recursive: true });
  for (const [source, target] of [["libs/sia-video-source", library]]) {
    await mkdir(target, { recursive: true });
    for (const name of [
      "src",
      "tests",
      "package.json",
      "tsconfig.e2e.json",
      "playwright.e2e.config.ts",
    ])
      await cp(join(repo, source, name), join(target, name), {
        recursive: true,
      });
    await cp(join(target, "tsconfig.e2e.json"), join(target, "tsconfig.json"));
  }
  await cp(
    join(repo, "libs/sia-video-source/tsdown.config.ts"),
    join(library, "tsdown.config.ts"),
  );
  await cp(
    join(repo, "tsconfig.base.json"),
    join(directory, "tsconfig.base.json"),
  );
  const localPackages = {
    "@lumeweb/sia-testing": testing,
    "@lumeweb/sia-video-source": library,
    "@lumeweb/tsdown-config": join(repo, "libs/tsdown-config"),
  };
  await dependencies(library, localPackages);
  // The library consumes its own exported /sia path in its browser page.
  await linkDirectory(
    library,
    join(library, "node_modules/@lumeweb/sia-video-source"),
  );
  const tsdown = dependency("tsdown", "catalog:");
  try {
    const bin = join(library, "node_modules/.bin");
    await mkdir(bin, { recursive: true });
    await symlink(join(tsdown, "dist/run.mjs"), join(bin, "tsdown"));
    const serverCheck = join(library, "check-e2e-vite.mjs");
    await cp(
      new URL("./package-consumer/e2e-vite.mjs.fixture", import.meta.url),
      serverCheck,
    );
    await chmod(serverCheck, 0o700);
    await symlink(serverCheck, join(bin, "vite"));
    await mkdir(join(library, "dist/esm"), { recursive: true });
    await writeFile(
      join(library, "dist/esm/sia-stream-service.js"),
      "export const createSiaStreamService = undefined;\n",
    );
    await cp(
      new URL("./package-consumer/e2e-build.mjs.fixture", import.meta.url),
      join(library, "check-e2e-build.mjs"),
    );
    run(join(library, "check-e2e-build.mjs"), [], library);
    const packedLibrary = await pack(
      library,
      join(directory, "library-tarball"),
    );
    await dependencies(packedLibrary, localPackages);
    // A different copied package name prevents self-reference from bypassing the tarball.
    const manifest = /** @type {Record<string, unknown>} */ (
      JSON.parse(await readFile(join(library, "package.json"), "utf8"))
    );
    await writeFile(
      join(library, "package.json"),
      JSON.stringify({
        ...manifest,
        name: "@lumeweb/video-source-check-consumer",
      }),
    );
    for (const root of [library]) {
      await rm(join(root, "node_modules/@lumeweb/sia-video-source"));
      await linkDirectory(
        packedLibrary,
        join(root, "node_modules/@lumeweb/sia-video-source"),
      );
      execFileSync(
        join(repo, "node_modules/.bin/oxlint"),
        [
          "--config",
          join(repo, ".oxlintrc.json"),
          join(root, "tests/e2e"),
          join(root, "playwright.e2e.config.ts"),
        ],
        { cwd: repo, encoding: "utf8", env: environment, timeout: 30_000 },
      );
      run(
        join(repo, "node_modules/typescript/bin/tsc"),
        ["--noEmit", "-p", "tsconfig.e2e.json"],
        root,
      );
      run(
        join(repo, "node_modules/vite/bin/vite.js"),
        ["build", "--config", "tests/e2e/vite.config.ts"],
        root,
      );
      const output = run(
        join(repo, "node_modules/@playwright/test/cli.js"),
        ["test", "--config", "playwright.e2e.config.ts", "--list"],
        root,
      );
      if (!output.includes("Total: 1 test in 1 file"))
        throw new Error(`Unexpected consumer collection: ${output}`);
    }
  } catch (error) {
    throw new Error(
      `Consumer build/type/collection failed\n${error.stdout ?? ""}\n${error.stderr ?? ""}`,
      { cause: error },
    );
  }
  // Node must resolve the public entry from a copy without source or private tests.
  await cp(
    new URL("./package-consumer/e2e-node.mjs.fixture", import.meta.url),
    join(library, "public-import.mjs"),
  );
  run(join(library, "public-import.mjs"), [], library);
  console.log("consumer checks passed: 1 build, 1 typecheck, 1 collected test");
});
