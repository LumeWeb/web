/** Only locally created processes and HTTP fixtures supply identity/readiness evidence here. */
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, realpath } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { once } from "node:events";
import { expect, it } from "vitest";
import { preflight } from "../../src/e2e/internal/service-preflight.mjs";

it("checks explicit owned process identity and matching ready service height", async () => {
  const child = spawn(
    process.execPath,
    [
      "-e",
      "setInterval(() => {}, 1000)",
      "--",
      `-dir=${tmpdir()}`,
      "-hostd=30",
      "-indexd=1",
      "-renterd=0",
    ],
    { stdio: "ignore" },
  );
  const server = createServer((request, response) => {
    const bodies: Record<string, unknown> = {
      "/api/consensus/state": {
        index: { height: 42 },
        prevTimestamps: [new Date().toISOString()],
      },
      "/api/state": { synced: true },
      "/api/stats/hosts": { failedScans: 0, goodForUpload: 30 },
      "/height": { height: 42 },
      "/nodes": [
        ...Array.from({ length: 30 }, () => ({ type: "hostd" })),
        { type: "indexd" },
      ],
    };
    response.setHeader("content-type", "application/json");
    response.end(JSON.stringify(bodies[request.url ?? ""]));
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const address = server.address();
    if (!address || typeof address === "string" || !child.pid)
      throw new Error("Local fixture did not start");
    const status = await readFile(`/proc/${child.pid}/stat`, "utf8");
    const env = {
      SIA_TEST_ADMIN_PASSWORD: "fixture-only",
      SIA_TEST_ADMIN_URL: `http://127.0.0.1:${address.port}`,
      SIA_TEST_CHAIN_HEIGHT: "42",
      SIA_TEST_CLUSTER_BINARY: await realpath(process.execPath),
      SIA_TEST_CLUSTER_PID: String(child.pid),
      SIA_TEST_CLUSTER_SHA256: createHash("sha256")
        .update(await readFile(process.execPath))
        .digest("hex"),
      SIA_TEST_CLUSTER_START_TICKS: status
        .slice(status.lastIndexOf(")") + 2)
        .trim()
        .split(/\s+/)[19]!,
      SIA_TEST_CLUSTER_STATE: tmpdir(),
      SIA_TEST_CLUSTER_UID: String(process.getuid!()),
      SIA_TEST_CLUSTER_URL: `http://127.0.0.1:${address.port}`,
      SIA_TEST_STORAGE_PATH: tmpdir(),
    };
    expect(await preflight(env)).toBeGreaterThan(0);
    await expect(
      preflight({ ...env, SIA_TEST_CLUSTER_SHA256: "00".repeat(32) }),
    ).rejects.toThrow(/identity|hash/i);
    await expect(
      preflight({ ...env, SIA_TEST_CHAIN_HEIGHT: "43" }),
    ).rejects.toThrow(/height|topology/i);
    await expect(
      preflight({ ...env, SIA_TEST_CLUSTER_START_TICKS: "0" }),
    ).rejects.toThrow(/identity/i);
    await expect(
      preflight({ ...env, SIA_TEST_STORAGE_PATH: "" }),
    ).rejects.toThrow(/setting|storage/i);
  } finally {
    child.kill();
    await once(child, "exit");
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
