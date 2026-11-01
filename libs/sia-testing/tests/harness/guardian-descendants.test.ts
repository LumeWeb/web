/** Process-pool children close extra descriptors but remain under their owning guardian. */
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { once } from "node:events";
import { join, resolve } from "node:path";
import { expect, it } from "vitest";
import { withTemporaryDirectory } from "../../scripts/workspace.mjs";

const guardianURL = new URL(
  "../../src/e2e/internal/owned-cluster-lease.mjs",
  import.meta.url,
).href;

/** Capture the real pool's output while its guardian retains the fixture lock through reaping. */
function runPool(directory: string, cli: string, args: string[]) {
  const program = `import {runWithGuardian} from ${JSON.stringify(guardianURL)};process.exitCode=await runWithGuardian(process.execPath,${JSON.stringify([cli, ...args])},process.env,true,${JSON.stringify(join(directory, "lock"))},15000,100,process.cwd());`;
  const result = spawnSync(
    process.execPath,
    ["--input-type=module", "-e", program],
    {
      encoding: "utf8",
      timeout: 20_000,
    },
  );
  expect(result.status, result.stdout + result.stderr).toBe(0);
  expect(result.stdout).toMatch(/1 passed/);
}

it("verifies a real guarded grandchild after its parent closes the inherited lease descriptor", async () => {
  await withTemporaryDirectory("sia-guardian-child-", (directory) => {
    const child = `import {verifyOwnedGuardian} from './src/e2e/internal/owned-cluster-lease.mjs';console.log(await verifyOwnedGuardian(${JSON.stringify(join(directory, "lock"))}));`;
    const parent = `const {spawnSync}=require('node:child_process');const result=spawnSync(process.execPath,['--input-type=module','-e',${JSON.stringify(child)}],{stdio:'inherit'});process.exitCode=result.status;`;
    const program = `import {runWithGuardian} from './src/e2e/internal/owned-cluster-lease.mjs';process.exitCode=await runWithGuardian(process.execPath,['-e',${JSON.stringify(parent)}],process.env,true,${JSON.stringify(join(directory, "lock"))},3000,100,process.cwd());`;
    const output = execFileSync(
      process.execPath,
      ["--input-type=module", "-e", program],
      { encoding: "utf8" },
    );
    expect(output.trim()).toBe("true");
  });
});

it("rejects an actual cluster lock held by an unrelated owned sibling", async () => {
  await withTemporaryDirectory("sia-guardian-sibling-", async (directory) => {
    const lock = join(directory, "lock"),
      ready = join(directory, "ready");
    const worker = `require('node:fs').writeFileSync(${JSON.stringify(ready)},'ready');setInterval(()=>{},1000);`;
    const program = `import {runWithGuardian} from './src/e2e/internal/owned-cluster-lease.mjs';process.exitCode=await runWithGuardian(process.execPath,['-e',${JSON.stringify(worker)}],process.env,true,${JSON.stringify(lock)},5000,100,process.cwd());`;
    const guardian = spawn(
      process.execPath,
      ["--input-type=module", "-e", program],
      { stdio: "ignore" },
    );
    // The guardian can exit before readiness fails; teardown must not subscribe after that exit.
    const exited = once(guardian, "exit").catch(() => undefined);
    try {
      await once(guardian, "spawn");
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
      await exited;
    }
  });
}, 10_000);

it("verifies the still-locked guardian through an actual Vitest worker pool", async () => {
  await withTemporaryDirectory("sia-guardian-pool-", async (directory) => {
    const lock = join(directory, "lock");
    const fixture = join(directory, "owned.test.ts");
    const config = join(directory, "config.mjs");
    await writeFile(
      fixture,
      `import {it,expect} from ${JSON.stringify(import.meta.resolve("vitest"))};import {verifyOwnedGuardian} from ${JSON.stringify(guardianURL)};it('owns the worker',async()=>{expect(await verifyOwnedGuardian(${JSON.stringify(lock)})).toBe(true);});`,
    );
    await writeFile(
      config,
      `export default {test:{include:[${JSON.stringify(fixture)}],pool:'forks',maxWorkers:1}};`,
    );
    runPool(directory, resolve("node_modules/vitest/vitest.mjs"), [
      "run",
      "--config",
      config,
    ]);
  });
}, 25_000);

it("verifies the still-locked guardian through an actual Playwright worker pool", async () => {
  await withTemporaryDirectory("sia-guardian-pool-", async (directory) => {
    const lock = join(directory, "lock");
    const fixture = join(directory, "owned.spec.mjs");
    const config = join(directory, "config.mjs");
    await writeFile(
      fixture,
      `import {test,expect} from ${JSON.stringify(import.meta.resolve("@playwright/test"))};import {verifyOwnedGuardian} from ${JSON.stringify(guardianURL)};test('owns the worker',async()=>{expect(await verifyOwnedGuardian(${JSON.stringify(lock)})).toBe(true);});`,
    );
    await writeFile(
      config,
      `export default {testDir:${JSON.stringify(directory)},testMatch:'owned.spec.mjs',workers:1,outputDir:${JSON.stringify(join(directory, "results"))}};`,
    );
    runPool(directory, resolve("node_modules/@playwright/test/cli.js"), [
      "test",
      "--config",
      config,
    ]);
  });
}, 25_000);
