import {
  approveIndexd,
  cleanupIndexd,
  type CleanupOptions,
  provisionIndexd,
} from "../../../src/e2e/internal/indexd-provision.mjs";
/** Genuine native SDK checks require a supplied disposable service. */
import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import type { HostQuery } from "@siafoundation/sia-storage";
import {
  account,
  binding,
  config,
  diagnostics,
  withAccounts,
  withPreauthorizedKey,
} from "./session.js";
import { byteSource } from "../support/byte-streams.js";
import { observeHostPayload } from "../support/host-observer.js";

describe("real native metadata", () => {
  it("pages deployed native hosts and excludes an absent country", async () => {
    await withAccounts(
      1,
      async (sessions) => {
        const a = account(sessions, 0);
        const all = await a.sdk.hosts({ limit: 500 });
        expect(all.length).toBeGreaterThanOrEqual(3);
        const ids = all.map((host) => host.publicKey);
        expect(new Set(ids).size).toBe(ids.length);
        expect(all.some((host) => host.countryCode === "ZZ")).toBe(false);
        expect(
          (await a.sdk.hosts({ limit: 2, offset: 0 })).map(
            (host) => host.publicKey,
          ),
        ).toEqual(ids.slice(0, 2));
        expect(
          (await a.sdk.hosts({ limit: 2, offset: 2 })).map(
            (host) => host.publicKey,
          ),
        ).toEqual(ids.slice(2, 4));
        expect(await a.sdk.hosts({ limit: 1, offset: all.length })).toEqual([]);
        expect(await a.sdk.hosts({ country: "ZZ", limit: 2 })).toEqual([]);
      },
      "metadata",
    );
  }, 30_000);

  it("selects deployed native hosts with the requested transport available", async () => {
    await withAccounts(
      1,
      async (sessions) => {
        const a = account(sessions, 0);
        // SDK 0.1.4 declares a const enum but exports no runtime enum object.
        for (const value of ["Quic", "SiaMux"]) {
          const protocol = value as NonNullable<HostQuery["protocol"]>;
          const hosts = await a.sdk.hosts({ limit: 500, protocol });
          expect(hosts.length).toBeGreaterThan(0);
          expect(
            hosts.every((host) =>
              host.addresses.some((address) => address.protocol === protocol),
            ),
          ).toBe(true);
        }
      },
      "metadata",
    );
  }, 30_000);

  it.each([
    { bytes: [], name: "empty" },
    { bytes: [7, 0, 255], name: "buffered" },
  ])(
    "cancels $name packed input without pinning a slab",
    async ({ bytes }) => {
      await withAccounts(
        1,
        async (sessions) => {
          const a = account(sessions, 0);
          const transferCount = diagnostics.snapshot().transfers;
          const run = async () => {
            const packed = a.sdk.uploadPacked({
              dataShards: 10,
              parityShards: 20,
            });
            const optimal = packed.optimalDataSize();
            let reading = false;
            let sourceCanceled = false;
            let release!: () => void;
            const blocked = new Promise<void>((resolve) => {
              release = resolve;
            });
            // Disable prefetch so only an SDK read can signal that add is active.
            const source = new ReadableStream<Uint8Array>(
              {
                cancel() {
                  sourceCanceled = true;
                  release();
                },
                async pull(controller) {
                  reading = true;
                  await blocked;
                  if (!sourceCanceled) controller.close();
                },
              },
              { highWaterMark: 0 },
            );
            let status: "pending" | "rejected" | "resolved" = "pending";
            let addError: unknown;
            let adding: Promise<void> | undefined;
            try {
              const length = BigInt(bytes.length);
              const slabs = bytes.length ? 1n : 0n;
              if (bytes.length) {
                expect(await packed.add(byteSource(bytes))).toBe(length);
                expect(packed.length()).toBe(length);
                expect(packed.remaining()).toBe(optimal - length);
                expect(packed.slabs()).toBe(slabs);
              }
              adding = packed.add(source).then(
                () => {
                  status = "resolved";
                },
                (error) => {
                  status = "rejected";
                  addError = error;
                },
              );
              await expect.poll(() => reading, { timeout: 5000 }).toBe(true);
              expect(status).toBe("pending");
              packed.cancel();
              await expect
                .poll(() => status, { timeout: 5000 })
                .toBe("rejected");
              expect(String(addError)).toContain("upload closed");
              if (bytes.length) {
                // Completed-add counters survive cancel; the account below must still have no pinned storage.
                expect(packed.length()).toBe(length);
                expect(packed.remaining()).toBe(optimal - length);
                expect(packed.slabs()).toBe(slabs);
              } else {
                await expect(packed.finalize()).rejects.toThrow(
                  /upload closed/,
                );
                expect(packed.length()).toBe(0n);
                expect(packed.slabs()).toBe(0n);
              }
              let lateReads = 0;
              const late = new ReadableStream<Uint8Array>(
                {
                  pull(controller) {
                    lateReads++;
                    controller.close();
                  },
                },
                { highWaterMark: 0 },
              );
              await expect(packed.add(late)).rejects.toThrow(/upload closed/);
              expect(lateReads).toBe(0);
              if (bytes.length)
                await expect(packed.finalize()).rejects.toThrow(
                  /upload closed/,
                );
            } finally {
              packed.cancel();
              release();
              await adding;
            }
          };
          const log = process.env.SIA_TEST_CLUSTER_LOG;
          if (log)
            expect((await observeHostPayload(log, run)).payloadRPCs).toEqual(
              [],
            );
          else await run();
          expect(diagnostics.snapshot().transfers).toBe(transferCount);
          expect((await a.sdk.account()).pinnedData).toBe(0n);
          expect((await a.sdk.account()).pinnedSize).toBe(0n);
        },
        "metadata",
      );
    },
    30_000,
  );

  it("queries recipient hosts from the usable pool and rejects revoked credentials", async () => {
    await withAccounts(
      1,
      async (sessions) => {
        const a = account(sessions, 0);
        const key = await a.sdk.createSharingKey(
          "native recipient host queries",
        );
        const recipient = await binding.SharedSdk.connect(
          config.indexdURL.toString(),
          key.seed(),
        );
        const owner = await a.sdk.hosts({ limit: 2 });
        const shared = await recipient.hosts({ limit: 2 });
        expect(owner.length).toBeGreaterThan(0);
        expect(shared.map((host) => host.publicKey)).toEqual(
          owner.map((host) => host.publicKey),
        );
        const filteredOwner = await a.sdk.hosts({ country: "DE", limit: 1 });
        const filteredShared = await recipient.hosts({
          country: "DE",
          limit: 1,
        });
        expect(filteredShared.map((host) => host.publicKey)).toEqual(
          filteredOwner.map((host) => host.publicKey),
        );
        expect((await recipient.stats()).objectCount).toBe(0n);
        await a.sdk.revokeSharingKey(key);
        await expect(recipient.hosts()).rejects.toThrow(/401 Unauthorized/);
        expect((await a.sdk.account()).pinnedSize).toBe(0n);
      },
      "metadata",
    );
  }, 30_000);

  it("registers a new app through preauthorization without interactive approval", async () => {
    const meta = {
      description: "Native preauthorized registration",
      id: randomBytes(32),
      name: "Disposable native metadata",
      serviceUrl: "https://example.invalid",
    };
    const created = await provisionIndexd({
      ...config,
      appID: meta.id.toString("hex"),
      fundTargetBytes: 0,
    });
    const quotaKey = created.quotaKey;
    const record: CleanupOptions = { ...config, created, quotaKey };
    const failures: unknown[] = [];
    try {
      if (!created.connectKey)
        throw new Error("Native connect key was not created");
      await withPreauthorizedKey(
        { connectKey: created.connectKey, meta },
        async (credential) => {
          const sdk = await new binding.Builder(
            config.indexdURL.toString(),
            meta,
          ).connectPreAuthorized(
            credential.seed,
            binding.generateRecoveryPhrase(),
          );
          record.accountKey = sdk.appKey().publicKey();
          expect(await credential.remainingUses()).toBe(0);
          const owner = await sdk.account();
          expect(owner.accountKey).toBe(record.accountKey);
          expect(owner.pinnedData).toBe(0n);
          expect(owner.pinnedSize).toBe(0n);
          const connected = await new binding.Builder(
            config.indexdURL.toString(),
            meta,
          ).connected(sdk.appKey());
          if (!connected)
            throw new Error("Preauthorized app key did not reconnect");
          expect((await connected.account()).accountKey).toBe(
            record.accountKey,
          );
        },
      );
    } catch (error) {
      failures.push(error);
    }
    const cleanup = await Promise.allSettled([cleanupIndexd(record)]);
    failures.push(
      ...cleanup
        .filter((result) => result.status === "rejected")
        .map((result): unknown => result.reason),
    );
    if (failures.length)
      throw new AggregateError(
        failures,
        "Preauthorized registration or cleanup failed",
      );
  }, 30_000);

  it("rejects a preauthorized key restricted to another app without consuming a use", async () => {
    await withAccounts(
      1,
      async (sessions) => {
        const a = account(sessions, 0);
        await withPreauthorizedKey(
          a,
          async (credential) => {
            await expect(
              new binding.Builder(
                config.indexdURL.toString(),
                a.meta,
              ).connectPreAuthorized(credential.seed, a.mnemonic),
            ).rejects.toThrow(/pre-authorized key rejected/);
            expect(await credential.remainingUses()).toBe(1);
            expect((await a.sdk.account()).accountKey).toBe(
              a.sdk.appKey().publicKey(),
            );
          },
          60,
          randomBytes(32).toString("hex"),
        );
      },
      "metadata",
    );
  }, 30_000);

  it("reconnects with one preauthorized use without another approval request", async () => {
    await withAccounts(
      1,
      async (sessions) => {
        const a = account(sessions, 0);
        await withPreauthorizedKey(a, async (credential) => {
          const invalid = new binding.Builder(
            config.indexdURL.toString(),
            a.meta,
          );
          await expect(
            invalid.connectPreAuthorized(
              credential.seed,
              "not a recovery phrase",
            ),
          ).rejects.toThrow();
          expect(await credential.remainingUses()).toBe(1);
          const connected = await new binding.Builder(
            config.indexdURL.toString(),
            a.meta,
          ).connectPreAuthorized(credential.seed, a.mnemonic);
          expect(connected.appKey().publicKey()).toBe(
            a.sdk.appKey().publicKey(),
          );
          expect((await connected.account()).pinnedData).toBe(0n);
          expect(await credential.remainingUses()).toBe(0);
          await expect(
            new binding.Builder(
              config.indexdURL.toString(),
              a.meta,
            ).connectPreAuthorized(credential.seed, a.mnemonic),
          ).rejects.toThrow(/pre-authorized key rejected/);
          expect(await credential.remainingUses()).toBe(0);
        });
      },
      "metadata",
    );
  }, 30_000);

  it("rejects an expired preauthorized credential", async () => {
    await withAccounts(
      1,
      async (sessions) => {
        const a = account(sessions, 0);
        await withPreauthorizedKey(
          a,
          async (credential) => {
            expect(await credential.remainingUses()).toBe(1);
            await new Promise((resolve) =>
              setTimeout(
                resolve,
                Math.max(0, credential.expiration.getTime() - Date.now() + 100),
              ),
            );
            await expect(
              new binding.Builder(
                config.indexdURL.toString(),
                a.meta,
              ).connectPreAuthorized(credential.seed, a.mnemonic),
            ).rejects.toThrow(/pre-authorized key rejected/);
            expect((await a.sdk.account()).accountKey).toBe(
              a.sdk.appKey().publicKey(),
            );
          },
          3,
        );
      },
      "metadata",
    );
  }, 30_000);

  it("matches the registered phrase before reconnecting an existing app", async () => {
    await withAccounts(
      1,
      async (sessions) => {
        const a = account(sessions, 0);
        const builder = new binding.Builder(
          config.indexdURL.toString(),
          a.meta,
        );
        await builder.requestConnection();
        await approveIndexd({
          connectKey: a.connectKey,
          indexdURL: config.indexdURL,
          responseURL: builder.responseUrl(),
        });
        await builder.waitForApproval();
        expect(builder.reconnecting()).toBe(true);
        expect(await builder.matchesExistingAppKey(a.mnemonic)).toBe(true);
        expect(
          await builder.matchesExistingAppKey(binding.generateRecoveryPhrase()),
        ).toBe(false);
        await expect(
          builder.matchesExistingAppKey("not a recovery phrase"),
        ).rejects.toThrow();
        const connected = await builder.register(a.mnemonic);
        expect(connected.appKey().publicKey()).toBe(a.sdk.appKey().publicKey());
        expect((await connected.account()).accountKey).toBe(
          a.sdk.appKey().publicKey(),
        );
      },
      "metadata",
    );
  }, 30_000);

  it("rejects scoped metadata reads after sharing-key expiry", async () => {
    await withAccounts(
      1,
      async (sessions) => {
        const a = account(sessions, 0);
        const quotaResponse = await fetch(
          new URL(`/api/quotas/${a.quotaKey}`, config.adminURL),
          {
            headers: {
              authorization: `Basic ${Buffer.from(`:${config.password}`).toString("base64")}`,
            },
          },
        );
        expect(quotaResponse.ok).toBe(true);
        const quota: unknown = await quotaResponse.json();
        expect(quota).toMatchObject({ fundTargetBytes: 0 });
        const expiresAt = new Date(Date.now() + 5000);
        const key = await a.sdk.createSharingKey(
          "native metadata expiry",
          expiresAt,
        );
        const recipient = await binding.SharedSdk.connect(
          config.indexdURL.toString(),
          key.seed(),
        );
        expect((await recipient.stats()).objectCount).toBe(0n);
        expect(await recipient.objects(0, 1)).toEqual([]);
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            Math.max(0, expiresAt.getTime() - Date.now() + 100),
          ),
        );
        await expect(recipient.stats()).rejects.toThrow(/401 Unauthorized/);
        await expect(recipient.objects(0, 1)).rejects.toThrow(
          /401 Unauthorized/,
        );
        const owner = await a.sdk.account();
        expect(owner.accountKey).toBe(a.sdk.appKey().publicKey());
        expect(owner.pinnedData).toBe(0n);
        expect(owner.pinnedSize).toBe(0n);
      },
      "metadata",
    );
  }, 30_000);
});
