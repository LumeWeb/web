/** Keeps provisioning in Node while real WASM clients use app-scoped credentials. */
import {
  createPrivateKey,
  createPublicKey,
  randomBytes,
  sign,
} from "node:crypto";
import { expect, type Page, type Request, test } from "@playwright/test";
import { readE2EService } from "../../../src/e2e/node.js";
import { openAccount } from "../../../src/e2e/internal/disposable-account.js";
import { preauthorizationHash } from "../support/preauthorization.js";
import { observeHostPayload } from "../support/host-observer.js";

interface Credential {
  appID: string;
  approve(url: string): Promise<void>;
  connect(invalid?: boolean): Promise<string>;
  connectPeer(): Promise<string>;
  expiration: number;
  remainingUses(): Promise<number>;
}

export async function withCredential(
  page: Page,
  run: (credential: Credential) => Promise<void>,
  options: { lifetimeSeconds?: number; uses?: number; wrongApp?: boolean } = {},
) {
  const config = readE2EService(process.env);
  const baseURL = test.info().project.use.baseURL;
  if (!baseURL)
    throw new Error("Browser metadata checks require a local page URL");
  const origins = new Set([config.indexdURL.origin, new URL(baseURL).origin]);
  let unexpectedRequest = false;
  const onRequest = (request: Request) => {
    const url = new URL(request.url());
    if (["http:", "https:"].includes(url.protocol) && !origins.has(url.origin))
      unexpectedRequest = true;
  };
  const appID = randomBytes(32).toString("hex");
  const seed = randomBytes(32);
  const privateDER = Buffer.concat([
    Buffer.from("302e020100300506032b657004220420", "hex"),
    seed,
  ]);
  const signer = createPrivateKey({
    format: "der",
    key: privateDER,
    type: "pkcs8",
  });
  const publicKey = `ed25519:${createPublicKey(
    signer.export({ format: "pem", type: "pkcs8" }),
  )
    .export({ format: "der", type: "spki" })
    .subarray(-32)
    .toString("hex")}`;
  const headers = {
    authorization: `Basic ${Buffer.from(`:${config.password}`).toString("base64")}`,
    "content-type": "application/json",
  };
  const endpoint = new URL(
    `/api/apps/preauthorized/keys/${encodeURIComponent(publicKey)}`,
    config.adminURL,
  );
  const owned = await openAccount({ appID, fundTargetBytes: 0, service: config });
  const created = owned.created;
  let peerOwned: Awaited<ReturnType<typeof openAccount>> | undefined;
  let ownerRecorded = false, peerRecorded = false;
  const failures: unknown[] = [];
  page.on("request", onRequest);
  try {
    if (!created.connectKey)
      throw new Error("Browser connect key was not created");
    const wasm = page.waitForResponse((response) =>
      new URL(response.url()).pathname.endsWith(".wasm"),
    );
    const [, response] = await Promise.all([
      page.goto("/auth-probe.html"),
      wasm,
    ]);
    await expect(page.locator("#status")).toHaveText("ready");
    expect(response.ok()).toBe(true);
    expect(
      await page.evaluate(
        async () => (await navigator.serviceWorker.getRegistrations()).length,
      ),
    ).toBe(0);
    await page.evaluate(
      ({ appID, url }) => window.__browserAuth.setup(url, appID),
      { appID, url: config.indexdURL.toString() },
    );
    const expiration = new Date(
      (Math.floor(Date.now() / 1000) + (options.lifetimeSeconds ?? 60)) * 1000,
    );
    const policy = {
      allowedAppID: options.wrongApp ? randomBytes(32).toString("hex") : appID,
      connectKey: created.connectKey,
      expiration,
      publicKey,
      totalUses: options.uses ?? 1,
    };
    const registered = await fetch(
      new URL("/api/apps/preauthorized/keys", config.adminURL),
      {
        body: JSON.stringify({
          ...policy,
          signature: sign(null, preauthorizationHash(policy), signer).toString(
            "hex",
          ),
        }),
        headers,
        method: "POST",
      },
    );
    if (!registered.ok)
      throw new Error(
        `Browser preauthorization creation failed (${registered.status})`,
      );
    await run({
      appID,
      async approve(url) {
        await owned.account.approve(url);
      },
      async connect(invalid = false) {
        const accountKey = await page.evaluate(
          ({ invalid, seed }) => window.__browserAuth.connect(seed, invalid),
          { invalid, seed: [...seed] },
        );
        await owned.account.recordAccountKey(accountKey);
        ownerRecorded = true;
        return accountKey;
      },
      async connectPeer() {
        if (peerOwned) throw new Error("Browser peer was already provisioned");
        peerOwned = await openAccount({ appID, fundTargetBytes: 0, service: config });
        const url = await page.evaluate(() =>
          window.__browserAuth.requestPeer(),
        );
        await peerOwned.account.approve(url);
        const accountKey = await page.evaluate(() =>
          window.__browserAuth.registerPeer(),
        );
        await peerOwned.account.recordAccountKey(accountKey);
        peerRecorded = true;
        return accountKey;
      },
      expiration: expiration.getTime(),
      async remainingUses() {
        const response = await fetch(endpoint, { headers });
        if (!response.ok)
          throw new Error(
            `Browser preauthorization lookup failed (${response.status})`,
          );
        const value: unknown = await response.json();
        if (
          !value ||
          typeof value !== "object" ||
          !("remainingUses" in value) ||
          typeof value.remainingUses !== "number"
        )
          throw new Error("Invalid browser preauthorization response");
        return value.remainingUses;
      },
    });
  } catch (error) {
    failures.push(error);
  }
  try {
    const deleted = await fetch(endpoint, { headers, method: "DELETE" });
    if (!deleted.ok && deleted.status !== 404)
      throw new Error(
        `Browser preauthorization cleanup failed (${deleted.status})`,
      );
  } catch (error) {
    failures.push(error);
  }
  try {
    await page.evaluate(() => window.__browserAuth.close());
  } catch (error) {
    failures.push(error);
  }
  try {
    if (!ownerRecorded) {
      const key = await page.evaluate(() => window.__browserAuth.accountKey());
      if (key) await owned.account.recordAccountKey(key);
    }
  } catch (error) {
    failures.push(error);
  }
  try {
    if (peerOwned && !peerRecorded) {
      const key = await page.evaluate(() => window.__browserAuth.peerAccountKey());
      if (key) await peerOwned.account.recordAccountKey(key);
    }
  } catch (error) {
    failures.push(error);
  }
  for (const account of [peerOwned, owned]) {
    if (!account) continue;
    try { await account.close(); } catch (error) { failures.push(error); }
  }
  page.off("request", onRequest);
  if (unexpectedRequest)
    failures.push(
      new Error("Browser metadata made an unexpected HTTP request"),
    );
  if (failures.length)
    throw new AggregateError(
      failures,
      "Browser metadata or owned cleanup failed",
    );
}

export async function withoutHostPayload<T>(
  operation: () => Promise<T>,
): Promise<T> {
  const log = process.env.SIA_TEST_CLUSTER_LOG;
  if (!log) return operation();
  const observed = await observeHostPayload(log, operation);
  expect(observed.payloadRPCs).toEqual([]);
  return observed.result;
}
