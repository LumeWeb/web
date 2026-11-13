/** Checks the packed public entry from outside the workspace source tree. */
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
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { test } from "node:test";

const run = promisify(execFile);
const workspace = fileURLToPath(new URL("../", import.meta.url));

async function unpack(input, archive) {
  await mkdir(archive);
  const cli = process.env.npm_execpath;
  assert.ok(cli, "Run package checks through pnpm");
  await run(process.execPath, [cli, "pack", "--pack-destination", archive], {
    cwd: input,
  });
  const tarballs = (await readdir(archive)).filter((name) =>
    name.endsWith(".tgz"),
  );
  assert.equal(tarballs.length, 1);
  await run("tar", ["-xzf", join(archive, tarballs[0]), "-C", archive]);
  return join(archive, "package");
}

void test(
  "the packed Uppy plugin imports and typechecks without its source tree",
  { timeout: 120000 },
  async (t) => {
    const owned = await mkdtemp(join(tmpdir(), "uppy-sia-package-"));
    t.after(() => rm(owned, { recursive: true, force: true }));
    const consumer = join(owned, "consumer");
    const nodeModules = join(consumer, "node_modules");
    await mkdir(nodeModules, { recursive: true });
    const packed = await unpack(workspace, join(owned, "archive"));
    const target = join(nodeModules, "@lumeweb", "uppy-sia-upload");
    await mkdir(dirname(target), { recursive: true });
    await cp(packed, target, { recursive: true });
    const manifest = JSON.parse(
      await readFile(join(target, "package.json"), "utf8"),
    );
    for (const entry of Object.values(manifest.exports)) {
      for (const value of Object.values(entry))
        await readFile(join(target, value));
    }
    for (const name of [
      "@uppy/core",
      "@siafoundation/sia-storage",
      "@lumeweb/sia-app-access",
    ]) {
      const peer = join(nodeModules, name);
      await mkdir(dirname(peer), { recursive: true });
      // Only this library is under test; established peers keep their installed exports.
      await symlink(
        await realpath(join(workspace, "node_modules", name)),
        peer,
        "dir",
      );
    }
    await writeFile(
      join(consumer, "package.json"),
      JSON.stringify({ type: "module", private: true }),
    );
    await writeFile(
      join(consumer, "consumer.mjs"),
      `
    import Uppy from "@uppy/core";
    import SiaUpload, { uploadToSia, SiaUploadUncertainError } from "@lumeweb/uppy-sia-upload";
    if (typeof uploadToSia !== "function" || typeof SiaUploadUncertainError !== "function") throw new Error("Missing exports");
    const uppy = new Uppy();
    uppy.use(SiaUpload, { access: { getSnapshot: () => ({ activeSessionId: null }), withSession: () => { throw new Error("not connected"); } } });
    if (!uppy.getPlugin("SiaUpload")) throw new Error("Plugin not installed");
    uppy.destroy();
  `,
    );
    await run(process.execPath, ["consumer.mjs"], { cwd: consumer });
    await writeFile(
      join(consumer, "consumer.ts"),
      `
    import Uppy, { type Meta } from "@uppy/core";
    import SiaUpload, { type SiaUploadBody, type UploadAccess } from "@lumeweb/uppy-sia-upload";
    declare const access: UploadAccess;
    const uppy = new Uppy<Meta, SiaUploadBody>();
    uppy.use(SiaUpload, { access });
    uppy.on("upload-success", (_file, response) => { if (response.body) { const id: string = response.body.objectId; void id; } });
  `,
    );
    await writeFile(
      join(consumer, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          target: "ES2022",
          lib: ["ES2022", "DOM", "ESNext.Disposable"],
          module: "NodeNext",
          moduleResolution: "NodeNext",
          strict: true,
          skipLibCheck: false,
          noEmit: true,
          types: [],
        },
        files: ["consumer.ts"],
      }),
    );
    const tsc = fileURLToPath(
      new URL("../node_modules/typescript/bin/tsc", import.meta.url),
    );
    await run(process.execPath, [tsc, "-p", "tsconfig.json"], {
      cwd: consumer,
    });
  },
);
