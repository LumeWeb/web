/** Installed SDK auth runs against owned loopback control-plane fixtures, without a Sia host. */
import { mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import {
  AppKey,
  PinnedObject,
  type SealedObject,
} from "@siafoundation/sia-storage";
import { serialize } from "node:v8";
import {
  createJournal,
  readJournal,
} from "../../../src/testing/live/journal.js";
import { uploadRecordBytes } from "../../../src/testing/live/resource-limits.js";
import { expect, it } from "vitest";
import { recoverSiaRun, withSiaRun } from "../../../src/node.js";
import { bytesFixture } from "../../../src/testing/files.js";
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
/** The child runs outside Vitest, so its relative runtime imports need compiled neighbours. */
async function compileAgent(directory: string): Promise<void> {
  await writeFile(
    join(directory, "package.json"),
    JSON.stringify({ type: "module" }),
  );
  for (const name of ["agent", "resource-limits"]) {
    const source = await readFile(
      resolve(`src/testing/live/${name}.ts`),
      "utf8",
    );
    await writeFile(
      join(directory, `${name}.${name === "agent" ? "mjs" : "js"}`),
      ts.transpileModule(source, {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
        },
      }).outputText,
    );
  }
}
const phrase =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
it("sealed metadata and sector descriptors fit a reserved upload acknowledgement", async () => {
  const directory = await mkdtemp(join(tmpdir(), "sia-seal-budget-"));
  try {
    const key = new AppKey(Buffer.alloc(32, 7));
    const object = new PinnedObject();
    object.updateMetadata(Buffer.alloc(16 * 1024, 255));
    const sealed: SealedObject = {
      ...object.seal(key),
      slabs: Array.from({ length: 4 }, (_, slabIndex) => ({
        encryptionKey: Buffer.alloc(32, 255),
        length: 4 * 1024 * 1024,
        minShards: 1,
        offset: 0,
        sectors: Array.from({ length: 255 }, (_, index) => ({
          hostKey: "ed25519:" + index.toString(16).padStart(64, "f"),
          root: (slabIndex * 255 + index).toString(16).padStart(64, "f"),
        })),
        version: 1,
      })),
    };
    const journal = await createJournal(join(directory, "journal.jsonl"), {
      apiBaseUrl: "http://127.0.0.1/",
      appId: "0".repeat(64),
      kind: "header",
      runId: "budget",
      version: 1,
    });
    try {
      const reservation = journal.reserve(uploadRecordBytes);
      try {
        await reservation.append({
          id: "upload",
          input: { sha256: "f".repeat(64), sizeBytes: 16 * 1024 * 1024 },
          kind: "intent",
          operation: "upload",
        });
        await reservation.append({
          id: "upload",
          kind: "ack",
          result: {
            objectId: object.id(),
            observedShardBytes: 256 * 1024 * 1024,
            sealed: serialize(sealed).toString("base64"),
            sizeBytes: 16 * 1024 * 1024,
          },
        });
      } finally {
        reservation.release();
      }
    } finally {
      await journal.close();
    }
    expect((await readJournal(journal.path)).records.at(-1)).toMatchObject({
      id: "upload",
      kind: "ack",
      result: { objectId: object.id() },
    });
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});
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
    let poisonMissing = false;
    const server = createIndexdHttpServer({
      model,
      async responseOverride(request, response) {
        if (
          poisonMissing &&
          new URL(request.url).pathname.startsWith("/objects/")
        )
          return new Response('app error: Api(404, "simulated")', {
            status: 500,
          });
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
      await compileAgent(directory);
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
          const agent = sessionProcess(session);
          const uploaded = (await agent.request("upload", {
            bytes: new Uint8Array(),
            metadata: new TextEncoder().encode("owned metadata"),
          })) as { objectId: string; sealed: string; sizeBytes: number };
          expect(uploaded.objectId).toMatch(/^[a-f0-9]{64}$/);
          expect(uploaded.sizeBytes).toBe(0);
          await agent.request("pin", uploaded);
          const sharing = (await agent.request("create-share", {
            description: "owned offline SDK fixture",
          })) as { seedHex: string; shareId: string };
          expect(sharing.seedHex).toMatch(/^[a-f0-9]{64}$/);
          await agent.request("attach", {
            ...sharing,
            objectId: uploaded.objectId,
          });
          const signed = (await agent.request("signed-url", {
            expiresAt: new Date(Date.now() + 60000).toISOString(),
            objectId: uploaded.objectId,
          })) as { url: string };
          expect(new URL(signed.url).protocol).toBe("sia:");
          expect(new URL(signed.url).host).toBe(new URL(apiBaseUrl).host);
          await agent.request("detach", {
            ...sharing,
            objectId: uploaded.objectId,
          });
          await agent.request("revoke", sharing);
          await agent.request("revoke", sharing);
          await agent.request("delete", { objectId: uploaded.objectId });
          await agent.request("delete", { objectId: uploaded.objectId });
          await expect(
            agent.request("inspect", { objectId: uploaded.objectId }),
          ).resolves.toBe("missing");
          poisonMissing = true;
          await expect(
            agent.request("inspect", { objectId: uploaded.objectId }),
          ).rejects.toMatchObject({ code: "resource-error" });
        }
        if (kind === "preauthorized")
          expect(requestBody?.preAuthorizedKey).toBe(preauthorized.publicKey());
        if (kind === "app-key") {
          poisonMissing = false;
          const backend = {
            consent: {
              apiBaseUrl,
              mutations: true as const,
              transfers: true as const,
            },
            kind: "live" as const,
            profileFile: path,
          };
          const journalFile = join(directory, "public-run.jsonl");
          const result = await withSiaRun(
            { backend, journalFile },
            async (run) => {
              expect(run.backend).toBe("live");
              const file = await bytesFixture({
                bytes: new Uint8Array(),
                name: "empty",
              });
              const owned = await run.objects.upload({
                file,
                metadata: new TextEncoder().encode("public run"),
                name: file.name,
              });
              await run.shares.create({ objects: [owned] });
              return owned.id;
            },
          );
          const limited = await openLiveSession(profile, {
            agentModule: pathToFileURL(join(directory, "agent.mjs")),
          });
          try {
            await expect(
              sessionProcess(limited).request("upload", {
                bytes: new Uint8Array(),
                metadata: new Uint8Array(16 * 1024),
              }),
            ).resolves.toMatchObject({ sizeBytes: 0 });
            await expect(
              sessionProcess(limited).request("upload", {
                bytes: new Uint8Array(),
                metadata: new Uint8Array(16 * 1024 + 1),
              }),
            ).rejects.toMatchObject({ code: "invalid-input" });
          } finally {
            await closeLiveSession(limited);
          }
          expect(result.summary.cleanup).toBe("clean");
          await expect(
            recoverSiaRun({ backend, journalFile }),
          ).resolves.toMatchObject({ cleanup: "clean" });
        }
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
    await compileAgent(directory);
    const module = join(directory, "agent.mjs");
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
