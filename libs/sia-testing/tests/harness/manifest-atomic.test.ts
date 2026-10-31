/** Owned file/process fixtures check recovery identity survival before atomic replacement. */
import { execFileSync, spawn } from "node:child_process";
import { once } from "node:events";
import { readFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { expect, it } from "vitest";
import {
  createRecoveryRecord,
  writeRecoveryRecord,
} from "../../src/e2e/internal/recovery.mjs";

const original = {
  accountKey: "exact-account",
  connectKey: "exact-connect-key",
  quotaKey: "exact-quota",
};
const moduleURL = new URL("../../src/e2e/internal/recovery.mjs", import.meta.url).href;

it("keeps exact previous identities when an owned update process is interrupted before replacement", async () => {
  const path = await createRecoveryRecord();
  const ready = join(dirname(path), "ready");
  await writeRecoveryRecord(path, original);
  const program = `import {writeRecoveryRecord} from ${JSON.stringify(moduleURL)};import {writeFileSync} from 'node:fs';await writeRecoveryRecord(${JSON.stringify(path)},{toJSON(){writeFileSync(${JSON.stringify(ready)},'ready',{mode:0o600});Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0);return {};}});`;
  const child = spawn(
    process.execPath,
    ["--input-type=module", "-e", program],
    { stdio: "ignore" },
  );
  const exited = once(child, "exit");
  try {
    let started = false;
    for (let attempt = 0; attempt < 150; attempt++) {
      started = await readFile(ready, "utf8").then(
        (value) => value === "ready",
        () => false,
      );
      if (started) break;
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    expect(started).toBe(true);
    child.kill("SIGKILL");
    await exited;
    expect(await readFile(path, "utf8")).toBe(JSON.stringify(original));
  } finally {
    if (child.exitCode === null && child.signalCode === null)
      child.kill("SIGKILL");
    await exited;
    await rm(dirname(path), { force: true, recursive: true });
  }
});

it("keeps previous identities when the filesystem refuses sibling creation before rename", () => {
  const program = `import {createRecoveryRecord,writeRecoveryRecord} from ${JSON.stringify(moduleURL)};import {chmod,readFile,rm} from 'node:fs/promises';import {dirname} from 'node:path';import {chmodSync} from 'node:fs';
    if(process.getuid()===0){process.setgid(65534);process.setuid(65534);}
    const path=await createRecoveryRecord();const directory=dirname(path);try{await writeRecoveryRecord(path,${JSON.stringify(original)});let failed=false;try{await writeRecoveryRecord(path,{toJSON(){chmodSync(directory,0o500);return {connectKey:'replacement'};}});}catch{failed=true;}console.log(JSON.stringify({failed,record:await readFile(path,'utf8')}));}finally{await chmod(directory,0o700);await rm(directory,{recursive:true});}`;
  const result = JSON.parse(
    execFileSync(process.execPath, ["--input-type=module", "-e", program], {
      encoding: "utf8",
    }),
  ) as { failed: boolean; record: string };
  expect(result.failed).toBe(true);
  expect(result.record).toBe(JSON.stringify(original));
});
