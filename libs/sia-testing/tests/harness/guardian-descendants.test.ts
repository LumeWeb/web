/** Process-pool children close extra descriptors but remain under their owning guardian. */
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { once } from "node:events";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { expect, it } from "vitest";

it("verifies a real guarded grandchild after its parent closes the inherited lease descriptor", async () => {
  const directory = await mkdtemp(join(tmpdir(), "sia-guardian-child-"));
  try {
    const child = `import {verifyOwnedGuardian} from './src/e2e/internal/owned-cluster-lease.mjs';console.log(await verifyOwnedGuardian(${JSON.stringify(join(directory, "lock"))}));`;
    const parent = `const {spawnSync}=require('node:child_process');const result=spawnSync(process.execPath,['--input-type=module','-e',${JSON.stringify(child)}],{stdio:'inherit'});process.exitCode=result.status;`;
    const program = `import {ownedRun} from './src/e2e/internal/owned-cluster-lease.mjs';process.exitCode=await ownedRun(process.execPath,['-e',${JSON.stringify(parent)}],process.env,true,${JSON.stringify(join(directory, "lock"))},3000,100,process.cwd());`;
    const output = execFileSync(
      process.execPath,
      ["--input-type=module", "-e", program],
      { encoding: "utf8" },
    );
    expect(output.trim()).toBe("true");
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});

it("rejects an actual cluster lock held by an unrelated owned sibling", async () => {
  const directory = await mkdtemp(join(tmpdir(), "sia-guardian-sibling-"));
  const lock = join(directory, "lock"),
    ready = join(directory, "ready");
  const worker = `require('node:fs').writeFileSync(${JSON.stringify(ready)},'ready');setInterval(()=>{},1000);`;
  const program = `import {ownedRun} from './src/e2e/internal/owned-cluster-lease.mjs';process.exitCode=await ownedRun(process.execPath,['-e',${JSON.stringify(worker)}],process.env,true,${JSON.stringify(lock)},5000,100,process.cwd());`;
  const guardian = spawn(
    process.execPath,
    ["--input-type=module", "-e", program],
    { stdio: "ignore" },
  );
  try {
    let started = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      started = await readFile(ready, "utf8").then(
        (value) => value === "ready",
        () => false,
      );
      if (started) break;
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    expect(started).toBe(true);
    const check = `import {verifyOwnedGuardian} from './src/e2e/internal/owned-cluster-lease.mjs';try{await verifyOwnedGuardian(${JSON.stringify(lock)});console.log('UNSAFE');}catch{console.log('rejected');}`;
    expect(
      execFileSync(process.execPath, ["--input-type=module", "-e", check], {
        encoding: "utf8",
      }).trim(),
    ).toBe("rejected");
  } finally {
    // Let its bounded guardian reap the child before removing fixture files.
    await once(guardian, "exit");
    await rm(directory, { force: true, recursive: true });
  }
}, 10_000);

it.each(["vitest", "playwright"])(
  "verifies the still-locked guardian through an actual %s worker pool",
  async (runner) => {
    const directory = await mkdtemp(join(tmpdir(), "sia-guardian-pool-"));
    try {
      const lock = join(directory, "lock");
      const guardian = new URL(
        "../../src/e2e/internal/owned-cluster-lease.mjs",
        import.meta.url,
      ).href;
      const library = import.meta.resolve(
        runner === "vitest" ? "vitest" : "@playwright/test",
      );
      const fixture = join(
        directory,
        runner === "vitest" ? "owned.test.ts" : "owned.spec.mjs",
      );
      await writeFile(
        fixture,
        `import {${runner === "vitest" ? "it" : "test"},expect} from ${JSON.stringify(library)};import {verifyOwnedGuardian} from ${JSON.stringify(guardian)};${runner === "vitest" ? "it" : "test"}('owns the worker',async()=>{expect(await verifyOwnedGuardian(${JSON.stringify(lock)})).toBe(true);});`,
      );
      const config = join(directory, "config.mjs");
      await writeFile(
        config,
        runner === "vitest"
          ? `export default {test:{include:[${JSON.stringify(fixture)}],pool:'forks',maxWorkers:1}};`
          : `export default {testDir:${JSON.stringify(directory)},testMatch:'owned.spec.mjs',workers:1,outputDir:${JSON.stringify(join(directory, "results"))}};`,
      );
      const cli = resolve(
        "node_modules",
        runner === "vitest" ? "vitest/vitest.mjs" : "@playwright/test/cli.js",
      );
      const args = [runner === "vitest" ? "run" : "test", "--config", config];
      const program = `import {ownedRun} from ${JSON.stringify(guardian)};process.exitCode=await ownedRun(process.execPath,${JSON.stringify([cli, ...args])},process.env,true,${JSON.stringify(lock)},15000,100,process.cwd());`;
      const result = spawnSync(
        process.execPath,
        ["--input-type=module", "-e", program],
        { encoding: "utf8", timeout: 20_000 },
      );
      expect(result.status, result.stdout + result.stderr).toBe(0);
      expect(result.stdout).toMatch(/1 passed/);
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  },
  25_000,
);
