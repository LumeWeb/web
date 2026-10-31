/**
 * Checks the built npm package as an application would consume it. Missing build
 * files and undeclared imports must fail even when the checkout has enough source
 * and development dependencies to make its own tests pass.
 *
 * MSW is an optional peer. The non-MSW entrypoints must load and type-check
 * without it; the MSW adapters must require it and work when it is supplied.
 * Browser entrypoints must also exclude Node built-ins and storage SDK code.
 * Test runners must stay out of that browser dependency graph.
 *
 * With no arguments, checks the current build through an npm tarball. --unpacked
 * applies the same checks to an extracted package. Neither mode installs
 * dependencies; both use temporary consumers and already-installed dependencies.
 */
import { cp, readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { builtinModules, createRequire } from "node:module";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import {
  linkDirectory,
  packageRoot,
  withTemporaryDirectory,
} from "./workspace.mjs";

const require = createRequire(import.meta.url);
const usage = "Usage: check-package.mjs [--unpacked <directory>] [--help]";
const environment = {
  ...process.env,
  NODE_OPTIONS: "",
  NODE_PATH: "",
  NPM_CONFIG_UPDATE_NOTIFIER: "false",
};
const processOptions = { env: environment, timeout: 30_000 };
const fixtures = new URL("./package-consumer/", import.meta.url);

/**
 * Node smoke tests cannot detect imports hidden behind browser-only branches.
 * Vite must resolve those branches, so its dependency graph exposes Node-only
 * code or SDK bindings that would make these entrypoints unsuitable for browsers.
 * @param {string} consumer
 */
async function checkBrowser(consumer) {
  const { build } = await import("vite");
  const builtins = new Set(
    builtinModules.map((name) => name.replace(/^node:/, "")),
  );
  /** @param {string} id */
  const rejectDependency = (id) => {
    if (
      id.startsWith("node:") ||
      builtins.has(id) ||
      /(?:^|[/\\])(?:@siafoundation|@vitest|@playwright|vitest|playwright|playwright-core)(?:[/\\]|$)|\.node(?:$|\?)/.test(
        id,
      )
    ) {
      throw new Error(`forbidden browser dependency ${id}`);
    }
  };
  await build({
    build: {
      lib: {
        entry: join(consumer, "browser.mjs"),
        fileName: "browser",
        formats: ["es"],
      },
      minify: false,
      write: false,
    },
    configFile: false,
    logLevel: "error",
    // Resolve catches imports Vite might externalize; load checks resolved dependency paths.
    plugins: [
      {
        enforce: "pre",
        load: rejectDependency,
        name: "packed-browser-boundary",
        resolveId: rejectDependency,
      },
    ],
    root: consumer,
  });
}

/**
 * Tests optional-peer compatibility in both runtime imports and declarations.
 * A missing-peer check must fail because MSW is absent; an unrelated import
 * crash would otherwise make a broken adapter look correctly optional.
 * @param {string} unpacked
 * @param {string} directory
 */
async function checkPackage(unpacked, directory) {
  const metadata = await readPackageMetadata(unpacked);
  const consumer = join(directory, "consumer");
  // Copy package code rather than symlinking it so Node resolves imports inside the consumer.
  await cp(unpacked, join(consumer, "node_modules", metadata.name), {
    recursive: true,
  });
  await copyConsumer(consumer);
  for (const name of Object.keys(metadata.dependencies ?? {}))
    await linkDependency(consumer, name);

  runNode(consumer, ["without-msw.mjs"]);
  await linkDependency(consumer, "@types/node");
  const tsc = require.resolve("typescript/bin/tsc");
  // Compile before linking MSW so pure declarations cannot depend on the optional peer.
  runNode(consumer, [tsc, "-p", "tsconfig.json"]);

  await linkDependency(consumer, "msw");
  runNode(consumer, ["with-msw.mjs"]);
  runNode(consumer, [tsc, "-p", "tsconfig.msw.json"]);
  await checkBrowser(consumer);
  console.log(
    `packed consumer checks passed (${Object.keys(metadata.exports).length} explicit exports)`,
  );
}

/**
 * The fixture suffix keeps repository tooling from resolving consumer imports
 * against workspace dependencies. Only their copies are compiled and executed.
 * @param {string} consumer
 */
async function copyConsumer(consumer) {
  for (const file of await readdir(fixtures)) {
    if (file.endsWith(".fixture")) {
      await cp(
        new URL(file, fixtures),
        join(consumer, file.slice(0, -".fixture".length)),
      );
    }
  }
}

/**
 * Dependency names become paths under node_modules. Reject path-like names
 * before they can place a link outside the isolated consumer.
 * @param {string} consumer
 * @param {string} name
 */
async function linkDependency(consumer, name) {
  if (!/^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/i.test(name)) {
    throw new Error(`invalid dependency name: ${name}`);
  }
  await linkDirectory(
    join(packageRoot, "node_modules", name),
    join(consumer, "node_modules", name),
  );
}

async function main() {
  const { values } = parseArgs({
    allowPositionals: false,
    options: {
      help: { short: "h", type: "boolean" },
      unpacked: { type: "string" },
    },
    strict: true,
  });
  if (values.help) {
    console.log(usage);
    return;
  }
  // An empty path must not fall back to packing and check a different artifact.
  if (values.unpacked === "")
    throw new Error("--unpacked requires a non-empty directory");
  await withTemporaryDirectory("sia-testing-package-", async (directory) => {
    const unpacked =
      values.unpacked === undefined
        ? packAndExtractPackage(directory)
        : resolve(values.unpacked);
    await checkPackage(unpacked, directory);
  });
}

/**
 * Pack the existing build without lifecycle scripts. A pack hook that rebuilt
 * missing output could hide a broken build step from this check.
 * @param {string} directory
 */
function packAndExtractPackage(directory) {
  const output = execFileSync(
    "npm",
    [
      "pack",
      "--offline",
      "--json",
      "--ignore-scripts",
      "--pack-destination",
      directory,
    ],
    {
      ...processOptions,
      cwd: packageRoot,
      encoding: "utf8",
    },
  );
  const [packed] = /** @type {{ filename: string }[]} */ (JSON.parse(output));
  if (!packed) throw new Error("npm pack produced no package");
  execFileSync(
    "tar",
    ["-xzf", join(directory, packed.filename), "-C", directory],
    {
      ...processOptions,
      cwd: directory,
      stdio: "inherit",
    },
  );
  return join(directory, "package");
}

/**
 * Every conditional export must name a file in the package, including branches
 * this Node process would not select. Source-tree exports and a root barrel
 * are outside this package's entrypoint contract.
 * @param {string} directory
 */
async function readPackageMetadata(directory) {
  const metadata =
    /** @type {{ dependencies?: Record<string, string>, exports: Record<string, unknown>, name: string }} */ (
      JSON.parse(await readFile(join(directory, "package.json"), "utf8"))
    );
  if (metadata.name !== "@lumeweb/sia-testing")
    throw new Error("unexpected package name");
  if (metadata.exports["."])
    throw new Error("root barrel must not be exported");
  for (const [specifier, conditions] of Object.entries(metadata.exports)) {
    for (const target of targets(conditions)) {
      if (
        !target.startsWith("./") ||
        target.split("/").includes("..") ||
        target.includes("src/") ||
        !existsSync(join(directory, target))
      ) {
        throw new Error(`${specifier}: missing packed target ${target}`);
      }
    }
  }
  return metadata;
}

/**
 * Each consumer check must resolve imports against its current dependency set
 * instead of reusing modules cached by a previous check.
 * @param {string} consumer
 * @param {string[]} args
 */
function runNode(consumer, args) {
  execFileSync(process.execPath, args, {
    ...processOptions,
    cwd: consumer,
    stdio: "inherit",
  });
}

/**
 * Conditional exports can nest. Both declaration and runtime targets must reach
 * the file-existence check even when they sit behind different conditions.
 * @param {unknown} value
 * @returns {string[]}
 */
function targets(value) {
  if (typeof value === "string") return [value];
  if (!value || typeof value !== "object")
    throw new Error("invalid export target");
  return Object.values(/** @type {Record<string, unknown>} */ (value)).flatMap(
    targets,
  );
}

await main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
