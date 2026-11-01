/** Exercises the public Node export against the real disposable Indexd and hosts. */
import { createSDKDiagnostics } from "../support/sdk-diagnostics.js";
import { randomBytes } from "node:crypto";
import { beforeAll } from "vitest";
import type {
  AppMetadata,
  PinnedObject,
  Sdk,
} from "@siafoundation/sia-storage";
import { readE2EService } from "../../../src/e2e/node.js";
import { withAccount } from "../../../src/e2e/internal/disposable-account.js";
import { byteSource } from "../support/byte-streams.js";
import { waitForFundingReady } from "../support/funding-readiness.js";
import { preauthorizationHash } from "../support/preauthorization.js";

export const config = readE2EService(process.env);
export let binding: typeof import("@siafoundation/sia-storage");
export const diagnostics = createSDKDiagnostics();
export interface Session {
  connectKey: string;
  meta: AppMetadata;
  mnemonic: string;
  quotaKey: string;
  sdk: Sdk;
}
beforeAll(async () => {
  try {
    binding = await import("@siafoundation/sia-storage");
    await binding.initSia();
  } catch (cause) {
    throw new Error(
      `Native SDK binding unavailable for ${process.platform}/${process.arch}`,
      { cause },
    );
  }
  binding.setLogger((message) => diagnostics.record(message), "debug");
}, 30_000);

export function account(sessions: Session[], index: number): Session {
  const session = sessions[index];
  if (!session) throw new Error("Native test account was not created");
  return session;
}

export async function upload(session: Session): Promise<PinnedObject> {
  const object = new binding.PinnedObject();
  object.updateMetadata(Buffer.from("owner"));
  const uploaded = await session.sdk.upload(
    object,
    byteSource([3, 1, 4, 1, 5, 9]),
    { dataShards: 10, parityShards: 20 },
  );
  await session.sdk.pinObject(uploaded);
  return uploaded;
}

export async function withAccounts(
  count: number,
  run: (sessions: Session[]) => Promise<void>,
  mode: "metadata" | "payload" = "payload",
  app?: AppMetadata,
) {
  const sessions: Session[] = [];
  async function next(i: number): Promise<void> {
    if (i === count) return run(sessions);
    const meta = app ?? {
      description: "Native SDK transport test",
      id: randomBytes(32),
      name: "Disposable native payload",
      serviceUrl: "https://example.invalid",
    };
    await withAccount({
      appID: meta.id.toString("hex"),
      fundTargetBytes: mode === "payload" ? 67_108_864 : 0,
      service: config,
    }, async (account, created) => {
      const builder = new binding.Builder(config.indexdURL.toString(), meta);
      await builder.requestConnection();
      await account.approve(builder.responseUrl());
      await builder.waitForApproval();
      const mnemonic = binding.generateRecoveryPhrase();
      const sdk = await builder.register(mnemonic);
      await account.recordAccountKey(sdk.appKey().publicKey());
      // Metadata-only cases need no host balances or paused-chain funding.
      if (mode === "payload")
        await waitForFundingReady(async () => (await sdk.account()).ready);
      if (!created.connectKey) throw new Error("Native connect key was not created");
      sessions.push({ connectKey: created.connectKey, meta, mnemonic, quotaKey: account.quotaKey, sdk });
      await next(i + 1);
    });
  }
  await next(0);
}

/** Owns a signed preauthorization credential so failed SDK calls cannot leave its key behind. */
export async function withPreauthorizedKey(
  session: Pick<Session, "connectKey" | "meta">,
  run: (credential: {
    expiration: Date;
    remainingUses(): Promise<number>;
    seed: Buffer;
  }) => Promise<void>,
  lifetimeSeconds = 60,
  allowedAppID = session.meta.id.toString("hex"),
) {
  const seed = randomBytes(32);
  const client = new binding.AppKey(seed);
  const publicKey = client.publicKey();
  const expiration = new Date(
    (Math.floor(Date.now() / 1000) + lifetimeSeconds) * 1000,
  );
  const policy = {
    allowedAppID,
    connectKey: session.connectKey,
    expiration,
    publicKey,
    totalUses: 1,
  };
  const headers = {
    "authorization": `Basic ${Buffer.from(`:${config.password}`).toString("base64")}`,
    "content-type": "application/json",
  };
  const endpoint = new URL(
    `/api/apps/preauthorized/keys/${encodeURIComponent(publicKey)}`,
    config.adminURL,
  );
  const failures: unknown[] = [];
  try {
    const created = await fetch(
      new URL("/api/apps/preauthorized/keys", config.adminURL),
      {
        body: JSON.stringify({
          ...policy,
          signature: client
            .sign(Buffer.from(preauthorizationHash(policy)))
            .toString("hex"),
        }),
        headers,
        method: "POST",
      },
    );
    if (!created.ok)
      throw new Error(`Preauthorized key creation failed (${created.status})`);
    await run({
      expiration,
      async remainingUses() {
        const response = await fetch(endpoint, { headers });
        if (!response.ok)
          throw new Error(
            `Preauthorized key lookup failed (${response.status})`,
          );
        const value: unknown = await response.json();
        if (
          !value ||
          typeof value !== "object" ||
          !("remainingUses" in value) ||
          typeof value.remainingUses !== "number"
        )
          throw new Error("Invalid preauthorized key response");
        return value.remainingUses;
      },
      seed,
    });
  } catch (error) {
    failures.push(error);
  }
  try {
    const deleted = await fetch(endpoint, { headers, method: "DELETE" });
    if (!deleted.ok && deleted.status !== 404)
      throw new Error(`Preauthorized key cleanup failed (${deleted.status})`);
  } catch (error) {
    failures.push(error);
  }
  if (failures.length)
    throw new AggregateError(failures, "Native preauthorized case failed");
}
