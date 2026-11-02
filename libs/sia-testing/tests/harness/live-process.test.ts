/** Owned child processes must stop native work before reporting deadlines or cancellation. */
import { afterEach, expect, it, vi } from "vitest";
import {
  type OwnedProcess,
  startOwnedProcess,
} from "../../src/testing/live/process.js";
const entrypoint = new URL(
  "../fixtures/sdk-agent-control.mjs",
  import.meta.url,
);
const active: OwnedProcess[] = [];
afterEach(async () => {
  vi.unstubAllEnvs();
  await Promise.allSettled(active.splice(0).map((process) => process.close()));
});
function start(onEvent?: Parameters<typeof startOwnedProcess>[0]["onEvent"]) {
  const process = startOwnedProcess({
    cleanupDeadlineMs: 500,
    deadlineMs: 5000,
    entrypoint,
    ...(onEvent && { onEvent }),
  });
  active.push(process);
  return process;
}
it("IPC preserves byte arrays and BigInt values without command-line secrets", async () => {
  const agent = start();
  const result = await agent.request("echo", {
    bytes: Uint8Array.of(1, 2),
    count: 9n,
  });
  expect(result).toEqual({ bytes: Uint8Array.of(1, 2), count: 9n });
  const environment = (await agent.request("environment", null)) as {
    argv: string[];
  };
  expect(environment.argv).toEqual([process.execPath, entrypoint.pathname]);
});
it("a deadline rejects only after its child has exited", async () => {
  const agent = start(() => Promise.resolve());
  await expect(
    agent.request("stall", null, { deadlineMs: 100 }),
  ).rejects.toMatchObject({ code: "deadline" });
  expect(() => process.kill(agent.pid, 0)).toThrowError(
    expect.objectContaining({ code: "ESRCH" }),
  );
});
it("caller cancellation stops a child that ignores SIGTERM", async () => {
  let started!: () => void;
  const ready = new Promise<void>((resolve) => {
    started = resolve;
  });
  const agent = start(() => {
    started();
    return Promise.resolve();
  });
  const controller = new AbortController();
  const request = agent.request("stall", null, { signal: controller.signal });
  const rejected = expect(request).rejects.toMatchObject({ code: "cancelled" });
  await ready;
  controller.abort();
  await rejected;
  expect(() => process.kill(agent.pid, 0)).toThrowError(
    expect.objectContaining({ code: "ESRCH" }),
  );
});
it("a disconnected child cannot keep work running without its owner channel", async () => {
  const agent = start();
  await expect(
    agent.request("disconnect", null, { deadlineMs: 300 }),
  ).rejects.toMatchObject({ code: "agent-exit" });
  expect(() => process.kill(agent.pid, 0)).toThrowError(
    expect.objectContaining({ code: "ESRCH" }),
  );
});
it("an unexpected child exit rejects outstanding work", async () => {
  const agent = start();
  await expect(agent.request("exit", null)).rejects.toMatchObject({
    code: "agent-exit",
  });
});
it("a malformed response stops the process instead of settling the wrong request", async () => {
  const agent = start();
  await expect(agent.request("malformed", null)).rejects.toMatchObject({
    code: "agent-protocol",
  });
  expect(() => process.kill(agent.pid, 0)).toThrowError(
    expect.objectContaining({ code: "ESRCH" }),
  );
});
it("a synchronous event-handler failure stops its child", async () => {
  const agent = start(() => {
    throw new Error("synthetic event secret");
  });
  await expect(
    agent.request("stall", null, { deadlineMs: 300 }),
  ).rejects.toMatchObject({ code: "agent-event" });
  expect(() => process.kill(agent.pid, 0)).toThrowError(
    expect.objectContaining({ code: "ESRCH" }),
  );
});
it("agent failures do not expose credential-bearing messages", async () => {
  const agent = start();
  const error: unknown = await agent
    .request("fail", null)
    .catch((value: unknown) => value);
  expect(error).toMatchObject({ code: "sdk-error" });
  expect(String(error)).not.toContain("synthetic secret");
});
it("concurrent closes stop outstanding work once", async () => {
  let started!: () => void;
  const ready = new Promise<void>((resolve) => {
    started = resolve;
  });
  const agent = start(() => {
    started();
    return Promise.resolve();
  });
  const pending = agent.request("stall", null);
  const rejected = expect(pending).rejects.toMatchObject({ code: "closed" });
  await ready;
  await Promise.all([agent.close(), agent.close()]);
  await rejected;
  await expect(agent.request("echo", null)).rejects.toMatchObject({
    code: "closed",
  });
});
it("child startup clears inherited module and native-loader overrides", async () => {
  vi.stubEnv("NODE_OPTIONS", "--require=/not-loaded/synthetic-secret.cjs");
  vi.stubEnv("NODE_PATH", "/not-loaded/synthetic-secret");
  vi.stubEnv(
    "NAPI_RS_NATIVE_LIBRARY_PATH",
    "/not-loaded/synthetic-secret.node",
  );
  const agent = start();
  expect(await agent.request("environment", null)).toMatchObject({
    execArgv: [],
    nativeOverride: undefined,
    nodeOptions: undefined,
    nodePath: undefined,
  });
});
