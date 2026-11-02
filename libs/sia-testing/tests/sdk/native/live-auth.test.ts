/** Installed SDK auth runs against owned loopback control-plane fixtures, without a Sia host. */
import { mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import { AppKey } from "@siafoundation/sia-storage";
import { expect, it } from "vitest";
import { createIndexdHttpServer } from "../../../src/http/index.js";
import { createIndexdModel } from "../../../src/model/index.js";
import { startOwnedProcess } from "../../../src/testing/live/process.js";
import {
  loadLiveProfile,
  profileDocument,
} from "../../../src/testing/live/profile.js";
import {
  closeLiveSession,
  openLiveSession,
  sessionInfo,
  sessionProcess,
} from "../../../src/testing/live/session.js";
const phrase =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
it.each(["app-key", "register", "preauthorized"] as const)(
  "the owned agent authenticates with the installed SDK using %s",
  async (kind) => {
    const directory = await mkdtemp(join(tmpdir(), "sia-sdk-auth-"));
    const model = createIndexdModel();
    const appKey = new AppKey(Buffer.alloc(32, 7));
    const preauthorized = new AppKey(Buffer.alloc(32, 8));
    model.createAccount({ publicKey: appKey.publicKey() });
    let requestBody: Record<string, unknown> | undefined;
    let accountPolls = 0;
    const server = createIndexdHttpServer({
      model,
      async responseOverride(request, response) {
        if (
          kind === "app-key" &&
          new URL(request.url).pathname === "/account"
        ) {
          accountPolls++;
          if (accountPolls === 1)
            return Response.json({
              ...((await response.clone().json()) as Record<string, unknown>),
              ready: false,
            });
        }
        if (
          kind === "preauthorized" &&
          new URL(request.url).pathname === "/auth/connect" &&
          request.method === "POST"
        ) {
          const value = (await response.clone().json()) as { id: string };
          if (
            requestBody?.preAuthorizedKey === preauthorized.publicKey() &&
            typeof requestBody.preAuthorizationSignature === "string"
          )
            model.approveConnection(value.id, "synthetic-preauthorization");
        }
        return response;
      },
    });
    server.server.prependListener("request", (request) => {
      if (
        request.method !== "POST" ||
        request.url?.split("?")[0] !== "/auth/connect"
      )
        return;
      const chunks: Buffer[] = [];
      request.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });
      request.on("end", () => {
        requestBody = JSON.parse(Buffer.concat(chunks).toString()) as Record<
          string,
          unknown
        >;
      });
    });
    try {
      const { port } = await server.listen();
      const apiBaseUrl = `http://127.0.0.1:${port}/`;
      await symlink(
        resolve("node_modules"),
        join(directory, "node_modules"),
        "dir",
      );
      const source = await readFile(
        resolve("src/testing/live/agent.ts"),
        "utf8",
      );
      await writeFile(
        join(directory, "agent.mjs"),
        ts.transpileModule(source, {
          compilerOptions: {
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ES2022,
          },
        }).outputText,
      );
      const path = join(directory, "profile.json");
      const auth =
        kind === "app-key"
          ? { appKeyHex: "07".repeat(32), kind }
          : kind === "register"
            ? { connectKey: "synthetic-connect-key", kind, phrase }
            : { kind, phrase, preauthorizedKeyHex: "08".repeat(32) };
      await writeFile(
        path,
        JSON.stringify({
          apiBaseUrl,
          app: {
            description: "SDK auth fixture",
            id: "0".repeat(64),
            name: "SDK auth",
            serviceUrl: "https://example.invalid",
          },
          auth,
          encoding: { dataShards: 1, maxBufferedSlabs: 1, parityShards: 0 },
          limits: { cleanupDeadlineMs: 1000, deadlineMs: 10000 },
          version: 1,
        }),
        { mode: 0o600 },
      );
      const profile = await loadLiveProfile(path, {
        apiBaseUrl,
        mutations: true,
        transfers: true,
      });
      const session = await openLiveSession(profile, {
        agentModule: pathToFileURL(join(directory, "agent.mjs")),
      });
      try {
        expect(sessionInfo(session)).toMatchObject({
          appId: "0".repeat(64),
          ready: true,
        });
        expect(sessionInfo(session).appKeyHex).toMatch(/^[a-f0-9]{64}$/);
        if (kind === "app-key") {
          expect(sessionInfo(session).appKeyHex).toBe("07".repeat(32));
          expect(accountPolls).toBeGreaterThanOrEqual(2);
        }
        if (kind === "preauthorized")
          expect(requestBody?.preAuthorizedKey).toBe(preauthorized.publicKey());
        expect(JSON.stringify(session)).not.toContain(
          sessionInfo(session).appKeyHex,
        );
        const pid = sessionProcess(session).pid;
        await closeLiveSession(session);
        expect(() => process.kill(pid, 0)).toThrowError(
          expect.objectContaining({ code: "ESRCH" }),
        );
      } finally {
        await closeLiveSession(session);
      }
    } finally {
      await server.close();
      await rm(directory, { force: true, recursive: true });
    }
  },
  15000,
);
it("cancelling installed SDK authentication stops its blocked native request", async () => {
  const directory = await mkdtemp(join(tmpdir(), "sia-sdk-auth-cancel-"));
  const model = createIndexdModel();
  model.createAccount({
    publicKey: new AppKey(Buffer.alloc(32, 7)).publicKey(),
  });
  let started!: () => void;
  let release!: () => void;
  const requested = new Promise<void>((resolve) => {
    started = resolve;
  });
  const blocked = new Promise<void>((resolve) => {
    release = resolve;
  });
  const server = createIndexdHttpServer({
    model,
    async responseOverride(request, response) {
      if (new URL(request.url).pathname === "/auth/check") {
        started();
        await blocked;
      }
      return response;
    },
  });
  let agent: ReturnType<typeof startOwnedProcess> | undefined;
  try {
    const { port } = await server.listen();
    const apiBaseUrl = `http://127.0.0.1:${port}/`;
    await symlink(
      resolve("node_modules"),
      join(directory, "node_modules"),
      "dir",
    );
    const source = await readFile(resolve("src/testing/live/agent.ts"), "utf8");
    const module = join(directory, "agent.mjs");
    await writeFile(
      module,
      ts.transpileModule(source, {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
        },
      }).outputText,
    );
    const path = join(directory, "profile.json");
    await writeFile(
      path,
      JSON.stringify({
        apiBaseUrl,
        app: {
          description: "Native cancellation",
          id: "0".repeat(64),
          name: "Cancel",
          serviceUrl: "https://example.invalid",
        },
        auth: { appKeyHex: "07".repeat(32), kind: "app-key" },
        encoding: { dataShards: 1, maxBufferedSlabs: 1, parityShards: 0 },
        version: 1,
      }),
      { mode: 0o600 },
    );
    const profile = await loadLiveProfile(path, {
      apiBaseUrl,
      mutations: true,
      transfers: true,
    });
    agent = startOwnedProcess({
      cleanupDeadlineMs: 1000,
      deadlineMs: 5000,
      entrypoint: pathToFileURL(module),
    });
    const controller = new AbortController();
    const pending = agent.request("authenticate", profileDocument(profile), {
      signal: controller.signal,
    });
    const rejected = expect(pending).rejects.toMatchObject({
      code: "cancelled",
    });
    await requested;
    controller.abort();
    await rejected;
    expect(() => process.kill(agent!.pid, 0)).toThrowError(
      expect.objectContaining({ code: "ESRCH" }),
    );
  } finally {
    release();
    await agent?.close();
    await server.close();
    await rm(directory, { force: true, recursive: true });
  }
}, 15000);
