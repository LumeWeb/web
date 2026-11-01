/** Exercises the delivered account boundary without accessing a deployment. */
import { expect, onTestFinished, test, vi } from "vitest";

import { readE2EService, withDisposableAccount } from "../../src/e2e/node.js";
import {
  type AccountIO,
  withAccount,
} from "../../src/e2e/internal/disposable-account.js";
import { readFile, rm } from "node:fs/promises";
import { dirname } from "node:path";
import {
  createRecoveryRecord,
  writeRecoveryRecord,
} from "../../src/e2e/internal/recovery.mjs";
import { cleanupIndexd } from "../../src/e2e/internal/indexd-provision.mjs";

const service = {
  adminURL: new URL("http://127.0.0.1:1"),
  indexdURL: new URL("http://localhost:1"),
  password: "private",
  storagePath: "/tmp",
};
const options = { appID: "a".repeat(64), fundTargetBytes: 0, service };

/** Acknowledged identities use real private records while authority and transport stay offline. */
function fixture() {
  let path = "";
  const deleted: string[] = [];
  const io: AccountIO = {
    approve: () => Promise.resolve(),
    assertMutation: () => Promise.resolve(),
    cleanup: (value) =>
      cleanupIndexd({
        ...value,
        fetchImpl: (url) => {
          deleted.push(url.pathname);
          return Promise.resolve(new Response(null, { status: 204 }));
        },
      }),
    createRecord: async () => {
      const ownedPath = await createRecoveryRecord();
      onTestFinished(() =>
        rm(dirname(ownedPath), { force: true, recursive: true }),
      );
      path = ownedPath;
      return ownedPath;
    },
    provision: async ({ recovery }) => {
      await recovery?.persist({
        phase: "connect-key-created",
        plan: {
          appID: options.appID,
          connectKey: "private-connect",
          quotaKey: "owned-quota",
        },
      });
      return {
        appID: options.appID,
        connectKey: "private-connect",
        quota: true,
        quotaKey: "owned-quota",
      };
    },
    writeRecord: writeRecoveryRecord,
  };
  return { deleted, io, path: () => path };
}

test("refuses a forged lease before provisioning", async () => {
  vi.stubEnv("SIA_TEST_ALLOW_MUTATION", "1");
  vi.stubEnv("SIA_NATIVE_TOKEN_LOCK_FD", "999999");
  try {
    await expect(
      withDisposableAccount(options, () => Promise.resolve("unreachable")),
    ).rejects.toThrow("Inherited cluster lease");
  } finally {
    vi.unstubAllEnvs();
  }
});

test("requires explicit absolute storage when reading service options", () => {
  expect(() =>
    readE2EService({
      SIA_TEST_ADMIN_PASSWORD: "private",
      SIA_TEST_ADMIN_URL: "http://localhost:1",
      SIA_TEST_ALLOW_MUTATION: "1",
      SIA_TEST_INDEXD_URL: "http://localhost:1",
    }),
  ).toThrow("storage");
});

test("persists the account identity before returning to funding work", async () => {
  const f = fixture();
  await withAccount(
    options,
    async (account) => {
      expect(Object.keys(account)).not.toContain("connectKey");
      await account.recordAccountKey(`ed25519:${"b".repeat(64)}`);
      expect(JSON.parse(await readFile(f.path(), "utf8"))).toMatchObject({
        accountKey: `ed25519:${"b".repeat(64)}`,
        phase: "account-registered",
        plan: { quotaKey: "owned-quota" },
      });
    },
    f.io,
  );
  expect(f.deleted).toEqual([
    `/api/account/ed25519%3A${"b".repeat(64)}`,
    "/api/apps/connect/keys/private-connect",
    "/api/quotas/owned-quota",
  ]);
});

test("retains recovery after an unacknowledged account-record write while attempting every delete", async () => {
  const f = fixture();
  await expect(
    withAccount(
      options,
      async (account) => {
        const write = vi
          .spyOn(f.io, "writeRecord")
          .mockRejectedValueOnce(new Error("disk sync failed"));
        try {
          await account.recordAccountKey(`ed25519:${"b".repeat(64)}`);
        } finally {
          write.mockRestore();
        }
      },
      f.io,
    ),
  ).rejects.toThrow("Account operation");
  expect(f.deleted).toHaveLength(3);
  expect(await readFile(f.path(), "utf8").catch(() => "missing")).not.toBe(
    "missing",
  );
});

test("continues independent cleanup phases when one durable delete intent fails", async () => {
  const deleted: string[] = [];
  await expect(
    cleanupIndexd({
      ...service,
      accountKey: `ed25519:${"b".repeat(64)}`,
      created: { connectKey: "private-connect", quota: true },
      fetchImpl: (url) => {
        deleted.push(url.pathname);
        return Promise.resolve(new Response(null, { status: 204 }));
      },
      quotaKey: "owned-quota",
      recoveryRecord: (phase) =>
        phase === "connect-key-delete-pending"
          ? Promise.reject(new Error("disk failed"))
          : Promise.resolve(),
    }),
  ).rejects.toThrow("cleanup failed");
  expect(deleted).toEqual([
    `/api/account/ed25519%3A${"b".repeat(64)}`,
    "/api/quotas/owned-quota",
  ]);
});

test("binds cleanup and approval to the validated service even if the caller mutates its URLs", async () => {
  const f = fixture();
  const mutable = {
    ...service,
    adminURL: new URL(service.adminURL),
    indexdURL: new URL(service.indexdURL),
  };
  const approvalOrigins: string[] = [];
  f.io.approve = async ({ indexdURL }) => {
    approvalOrigins.push(new URL(indexdURL).origin);
    await Promise.resolve();
  };
  await withAccount(
    { ...options, service: mutable },
    async (account) => {
      mutable.indexdURL.hostname = "example.invalid";
      mutable.adminURL.hostname = "example.invalid";
      await account.approve("http://localhost:1/auth/connect/owned");
      await account.recordAccountKey(`ed25519:${"b".repeat(64)}`);
      const record: unknown = JSON.parse(await readFile(f.path(), "utf8"));
      expect(record).toMatchObject({
        service: {
          adminURL: "http://127.0.0.1:1/",
          indexdURL: "http://localhost:1/",
        },
      });
    },
    {
      ...f.io,
      cleanup: async (value) => {
        expect(new URL(value.adminURL).hostname).toBe("127.0.0.1");
        await f.io.cleanup(value);
      },
    },
  );
  expect(approvalOrigins).toEqual(["http://localhost:1"]);
});

test("retains exact provisioning identities when registration never returns an account key", async () => {
  const f = fixture();
  const primary = new Error("page crashed during registration");
  const failure: unknown = await withAccount(
    options,
    () => Promise.reject(primary),
    f.io,
  ).catch((error: unknown) => error);
  expect(failure).toBeInstanceOf(AggregateError);
  if (!(failure instanceof AggregateError))
    throw new Error("Expected account failure");
  expect(failure.errors).toEqual([primary]);
  expect(f.deleted).toEqual([
    "/api/apps/connect/keys/private-connect",
    "/api/quotas/owned-quota",
  ]);
  const record: unknown = JSON.parse(await readFile(f.path(), "utf8"));
  expect(record).toMatchObject({
    plan: {
      appID: options.appID,
      connectKey: "private-connect",
      quotaKey: "owned-quota",
    },
  });
  expect(record).not.toHaveProperty("password");
  expect(record).not.toHaveProperty("accountKey");
});

test("preserves the consumer failure when account cleanup also fails", async () => {
  const f = fixture();
  const primary = new Error("consumer failure");
  const cleanup = new Error("cleanup failure");
  const failure: unknown = await withAccount(
    options,
    async (account) => {
      await account.recordAccountKey(`ed25519:${"b".repeat(64)}`);
      throw primary;
    },
    { ...f.io, cleanup: () => Promise.reject(cleanup) },
  ).catch((error: unknown) => error);
  expect(failure).toBeInstanceOf(AggregateError);
  if (!(failure instanceof AggregateError))
    throw new Error("Expected account failure");
  expect(failure.errors).toEqual([primary, cleanup]);
  expect(JSON.parse(await readFile(f.path(), "utf8"))).toMatchObject({
    accountKey: `ed25519:${"b".repeat(64)}`,
  });
});

test("public callback receives one argument without private provisioning resources", async () => {
  const internal = await import("../../src/e2e/internal/disposable-account.js");
  const account = {
    appID: options.appID,
    approve: () => Promise.resolve(),
    quotaKey: "quota",
    recordAccountKey: () => Promise.resolve(),
  };
  const stub = vi
    .spyOn(internal, "withAccount")
    .mockImplementation(async (_options, use) =>
      use(account, {
        appID: options.appID,
        connectKey: "secret",
        quota: true,
        quotaKey: "quota",
      }),
    );
  try {
    const args = await withDisposableAccount(options, function (...args) {
      return Promise.resolve(args);
    });
    expect(args).toEqual([account]);
    expect(args).not.toContainEqual(
      expect.objectContaining({ connectKey: "secret" }),
    );
  } finally {
    stub.mockRestore();
  }
});
