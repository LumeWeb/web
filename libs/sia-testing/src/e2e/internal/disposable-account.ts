/** Records acknowledged identities before returning control to consumer funding work. */
import { isAbsolute } from "node:path";
import type { DisposableAccount, DisposableAccountOptions } from "../node.js";
import { assertOwnedMutation } from "./owned-cluster-lease.mjs";
import {
  approveIndexd,
  cleanupIndexd,
  type CleanupOptions,
  type ProvisionedResources,
  provisionIndexd,
} from "./indexd-provision.mjs";
import { createRecoveryRecord, writeRecoveryRecord } from "./recovery.mjs";
import { settlePhases } from "./lifecycle.mjs";

export interface AccountIO {
  approve: typeof approveIndexd;
  assertMutation: typeof assertOwnedMutation;
  cleanup: typeof cleanupIndexd;
  createRecord: typeof createRecoveryRecord;
  provision: typeof provisionIndexd;
  writeRecord: typeof writeRecoveryRecord;
}
const liveIO: AccountIO = {
  approve: approveIndexd,
  assertMutation: assertOwnedMutation,
  cleanup: cleanupIndexd,
  createRecord: createRecoveryRecord,
  provision: provisionIndexd,
  writeRecord: writeRecoveryRecord,
};

export async function openAccount(
  { appID, fundTargetBytes, service: suppliedService }: DisposableAccountOptions,
  io: AccountIO = liveIO,
) {
  const service = {
    adminURL: new URL(suppliedService.adminURL),
    indexdURL: new URL(suppliedService.indexdURL),
    password: suppliedService.password,
    storagePath: suppliedService.storagePath,
  };
  await io.assertMutation();
  for (const url of [service.adminURL, service.indexdURL]) {
    if (
      !["http:", "https:"].includes(url.protocol) ||
      !["127.0.0.1", "localhost"].includes(url.hostname) ||
      url.username || url.password
    ) throw new Error("Explicit loopback service is required");
  }
  if (
    !service.password || !isAbsolute(service.storagePath) ||
    !/^[a-f0-9]{64}$/i.test(appID) ||
    !Number.isSafeInteger(fundTargetBytes) || fundTargetBytes < 0
  ) throw new Error("Invalid disposable account options");

  const path = await io.createRecord();
  let record: Record<string, unknown> = {
    service: {
      adminURL: service.adminURL.toString(),
      indexdURL: service.indexdURL.toString(),
      storagePath: service.storagePath,
    },
  };
  const persist = async (value: Record<string, unknown>) => {
    record = { ...record, ...value };
    await io.writeRecord(path, record);
  };
  const created = await io.provision({
    ...service,
    appID,
    fundTargetBytes,
    recovery: { persist },
  });
  // Cleanup rereads this record so an uncertain write never erases an acknowledged key.
  created.recoveryPath = path;
  let accountKey: string | undefined;
  let active = true;
  let recordUncertain = false;
  const account: DisposableAccount = {
    appID,
    async approve(responseURL) {
      if (!active) throw new Error("Account lifetime has closed");
      await io.assertMutation();
      await io.approve({
        connectKey: created.connectKey,
        indexdURL: service.indexdURL,
        responseURL,
      });
    },
    quotaKey: created.quotaKey,
    async recordAccountKey(key) {
      if (
        !active || !/^ed25519:[a-f0-9]{64}$/i.test(key) ||
        (accountKey && accountKey !== key)
      ) throw new Error("Invalid acknowledged account identity");
      accountKey = key;
      recordUncertain = true;
      await persist({ accountKey: key, phase: "account-registered" });
      recordUncertain = false;
    },
  };
  return {
    account,
    async close() {
      if (!active) return;
      active = false;
      await io.assertMutation();
      const cleanup: CleanupOptions = {
        ...service,
        accountKey,
        created,
        quotaKey: created.quotaKey,
      };
      if (recordUncertain) {
        // A failed acknowledgement must retain recovery even after confirmed deletes.
        const retained = { ...created };
        delete retained.recoveryPath;
        cleanup.created = retained;
        cleanup.recoveryRecord = (phase) => persist({ accountKey, phase });
      }
      await io.cleanup(cleanup);
    },
    created,
  };
}

export async function withAccount<T>(
  options: DisposableAccountOptions,
  use: (account: DisposableAccount, created: Readonly<ProvisionedResources>) => Promise<T>,
  io: AccountIO = liveIO,
): Promise<T> {
  const owned = await openAccount(options, io);
  let result: T | undefined;
  const failures = await settlePhases([
    { phase: "business", run: async () => { result = await use(owned.account, owned.created); } },
    { phase: "account-cleanup", run: () => owned.close() },
  ]);
  if (failures.length)
    throw new AggregateError(
      failures.map(({ error }) => error),
      "Account operation or exact-owned cleanup failed",
    );
  return result as T;
}
