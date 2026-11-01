/** Collection exercises the real Playwright config without launching an SDK connection. */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

const cli = createRequire(import.meta.url).resolve("@playwright/test/cli");

for (const approved of [false, true]) {
  await test(
    approved
      ? "approved collection exposes no fixture values and opens no SDK connection"
      : "unapproved collection fails without exposing fixture values",
    { timeout: 20000 },
    async (context) => {
      let connections = 0;
      const observer = createServer((socket) => {
        connections++;
        socket.destroy();
      });
      await new Promise<void>((resolve) =>
        observer.listen(0, "127.0.0.1", resolve),
      );
      context.after(
        () =>
          new Promise<void>((resolve, reject) =>
            observer.close((error) => (error ? reject(error) : resolve())),
          ),
      );
      const address = observer.address();
      assert.ok(address && typeof address !== "string");
      const origin = `https://127.0.0.1:${address.port}`;
      const directory = await mkdtemp(
        join(tmpdir(), "sia-video-contract-collection-"),
      );
      context.after(() => rm(directory, { force: true, recursive: true }));
      const file = join(directory, "private-fixture.json");
      const config = {
        app: {
          objectId: "a".repeat(64),
          rangeBytes: [0, 1, 2],
          rangeOffset: 2,
          seekSeconds: 1,
          sizeBytes: 4096,
        },
        indexerUrl: `${origin}/api/`,
        maxTransferBytes: 65536,
        shared: {
          objectId: "b".repeat(64),
          rangeBytes: [3, 4, 5],
          rangeOffset: 4,
          seekSeconds: 1,
          sizeBytes: 4096,
        },
        sharingKeyHex: "c".repeat(64),
        timeoutMs: 60000,
        userKeyHex: "d".repeat(64),
        version: 1,
      };
      await writeFile(file, JSON.stringify(config), { mode: 0o600 });
      const env: NodeJS.ProcessEnv = {
        ...process.env,
        SIA_VIDEO_CONTRACT_APPROVED_ORIGIN: origin,
        SIA_VIDEO_CONTRACT_FILE: file,
      };
      delete env.DEBUG;
      delete env.PWDEBUG;
      delete env.SIA_VIDEO_CONTRACT_RUN;
      if (approved) env.SIA_VIDEO_CONTRACT_RUN = "1";
      const child = spawn(
        process.execPath,
        [cli, "test", "--config", "playwright.contract.config.ts", "--list"],
        { env, stdio: ["ignore", "pipe", "pipe"] },
      );
      context.after(() => {
        if (child.exitCode === null) child.kill("SIGKILL");
      });
      const chunks: Buffer[] = [];
      child.stdout.on("data", (chunk: Buffer) => chunks.push(chunk));
      child.stderr.on("data", (chunk: Buffer) => chunks.push(chunk));
      const status = await new Promise<null | number>((resolve, reject) => {
        child.once("error", reject);
        child.once("close", resolve);
      });
      const output = Buffer.concat(chunks).toString("utf8");
      assert.equal(status, approved ? 0 : 1);
      assert.equal(connections, 0);
      for (const secret of [
        config.userKeyHex,
        config.sharingKeyHex,
        config.app.objectId,
        config.shared.objectId,
        config.indexerUrl,
      ])
        assert.equal(output.includes(secret), false);
      if (approved) assert.match(output, /Total: 1 test/);
      else assert.match(output, /Live execution needs explicit consent/);
    },
  );
}
