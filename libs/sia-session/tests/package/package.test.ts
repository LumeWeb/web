/** npm and pnpm consumers run the real archive without workspace source resolution. */
import { execFile } from "node:child_process";
import { cp, mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { expect, it } from "vitest";
const execute = promisify(execFile);
const workspace = fileURLToPath(new URL("../../", import.meta.url));
const compiler = fileURLToPath(import.meta.resolve("typescript/bin/tsc"));

it.each(["npm", "pnpm"])(
  "%s installs and uses the packed library without SDK or framework dependencies",
  async (manager) => {
    const temporary = await mkdtemp(join(tmpdir(), "sia-session-package-"));
    try {
      const archives = join(temporary, "archives"),
        consumer = join(temporary, "consumer");
      await mkdir(archives);
      await mkdir(consumer);
      const pnpm = process.env.npm_execpath;
      if (!pnpm) throw new Error("Run archive tests with pnpm");
      const env = {
        ...process.env,
        NODE_DISABLE_COMPILE_CACHE: "1",
        npm_config_cache: join(temporary, "cache"),
        npm_config_ignore_scripts: "true",
        pnpm_config_ignore_scripts: "true",
      };
      await execute(
        process.execPath,
        [pnpm, "pack", "--pack-destination", archives],
        { cwd: workspace, env },
      );
      const nano = fileURLToPath(
        new URL(".", import.meta.resolve("nanoevents")),
      );
      await execute(
        "npm",
        ["pack", nano, "--ignore-scripts", "--pack-destination", archives],
        { cwd: temporary, env },
      );
      const files = (await readdir(archives))
        .filter((file) => file.endsWith(".tgz"))
        .map((file) => join(archives, file));
      expect(files).toHaveLength(2);
      await writeFile(
        join(consumer, "package.json"),
        JSON.stringify({ private: true, type: "module" }),
      );
      // A tmpfs consumer selects another pnpm store; offline registry tarballs are in the workspace store.
      const { stdout: store } = await execute(
        process.execPath,
        [pnpm, "store", "path"],
        { cwd: workspace, env },
      );
      const args =
        manager === "npm"
          ? [
              "install",
              "--offline",
              "--ignore-scripts",
              "--no-audit",
              "--no-fund",
              ...files,
            ]
          : [
              pnpm,
              "add",
              "--offline",
              "--ignore-scripts",
              "--store-dir",
              dirname(store.trim()),
              ...files,
            ];
      await execute(manager === "npm" ? "npm" : process.execPath, args, {
        cwd: consumer,
        env,
      }).catch((error: unknown) => {
        if (error instanceof Error && "stdout" in error && "stderr" in error) {
          throw new Error(`${String(error.stdout)}\n${String(error.stderr)}`, {
            cause: error,
          });
        }
        throw error;
      });
      await cp(
        join(workspace, "tests/package/consumer.mjs"),
        join(consumer, "consumer.mjs"),
      );
      await execute(process.execPath, [join(consumer, "consumer.mjs")], {
        cwd: consumer,
        env,
      });
      await cp(
        join(workspace, "tests/types/core.ts"),
        join(consumer, "contract.ts"),
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
          include: ["contract.ts"],
        }),
      );
      await execute(
        process.execPath,
        [compiler, "-p", join(consumer, "tsconfig.json")],
        { cwd: consumer, env },
      );
    } finally {
      await rm(temporary, { force: true, recursive: true });
    }
  },
);
