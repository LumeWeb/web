/** Asserts browser credentials and metadata against the opted-in disposable service. */
import { expect, test } from "@playwright/test";
import { observeSharedHosts } from "../support/response-drain.js";
import { readHostServiceConfig } from "../../../src/e2e/internal/config.js";
import { withCredential, withoutHostPayload } from "./browser-auth-fixture.js";

test("pages deployed browser hosts and excludes an absent country", async ({
  page,
}) => {
  await withCredential(page, async (credential) => {
    await credential.connect();
    const result = await withoutHostPayload(() =>
      page.evaluate(() => window.__browserAuth.hostPages()),
    );
    expect(new Set(result.all).size).toBe(result.all.length);
    expect(result.first).toEqual(result.all.slice(0, 2));
    expect(result.second).toEqual(result.all.slice(2, 4));
    expect(result.exhausted).toEqual([]);
    expect(result.absentCountry).toEqual([]);
    expect(result.quic).toBe(true);
  });
});

test("pages browser sharing keys newest first without repeating keys", async ({
  page,
}) => {
  await withCredential(page, async (credential) => {
    await credential.connect();
    const result = await withoutHostPayload(() =>
      page.evaluate(() => window.__browserAuth.keyPages()),
    );
    expect(result.first).toEqual([
      { count: 0, description: "new", key: result.expectedKeys[2] },
      { count: 0, description: "middle", key: result.expectedKeys[1] },
    ]);
    expect(result.second).toEqual([
      { count: 0, description: "old", key: result.expectedKeys[0] },
    ]);
    expect(result.exhausted).toEqual([]);
    expect(result.detail).toEqual({
      count: 0,
      description: "middle",
      key: result.expectedKeys[1],
    });
  });
});

test("queries the usable host pool as a browser recipient and rejects revoked credentials", async ({
  page,
}) => {
  const origin = readHostServiceConfig().indexdURL.origin;
  await withCredential(page, async (credential) => {
    await withoutHostPayload(async () => {
      const observer = observeSharedHosts(page, origin);
      let probeFailure: undefined | { error: unknown };
      try {
        await credential.connect();
        const result = await page.evaluate(() =>
          window.__browserAuth.recipientHosts(),
        );
        await observer.drain();
        expect(result.ownerHosts.length).toBeGreaterThan(0);
        expect(result.hosts).toEqual(result.ownerHosts);
        expect(result.filtered).toEqual(result.filteredOwner);
        expect(result.filtered).toEqual([]);
        expect(result.objectCount).toBe(0);
        expect(result.revoked).toBe(true);
        expect(
          await page.evaluate(() => window.__browserAuth.snapshot()),
        ).toMatchObject({ pinnedData: "0", pinnedSize: "0" });
        await observer.finish();
        const counts = observer.counts();
        expect(counts.requests).toBe(counts.responses);
        expect(counts.recipients).toBe(1);
        const snapshot = observer.snapshot();
        expect(
          snapshot.observations.some(
            (observation) => observation.hosts.length > 0,
          ),
          "real shared-host deliveries were observed",
        ).toBe(true);
        expect(
          snapshot.observations.some(
            (observation) =>
              observation.kind === "unauthorized" &&
              observation.status === 401 &&
              observation.hosts.length === 0,
          ),
          "revoked response was observed without token expiry",
        ).toBe(true);
        const delivered = snapshot.observations.filter(
          (observation) => observation.kind === "delivered",
        );
        expect(
          delivered.some((observation) => observation.hosts.length === 0),
        ).toBe(true);
        expect(
          delivered.some(
            (observation) =>
              JSON.stringify(
                observation.hosts.map((host) => host.publicKey),
              ) === JSON.stringify(result.ownerHosts),
          ),
        ).toBe(true);
        const expiries = delivered.flatMap((observation) =>
          observation.hosts.map((host) => host.validUntilMs),
        );
        expect(snapshot.conservativeMaximumDeliveredExpiryMs).toBe(
          Math.max(...expiries),
        );
        for (const observation of snapshot.observations) {
          // Local event times bound this observation; they do not authenticate service clocks.
          expect(Number.isSafeInteger(observation.requestStartedAtMs)).toBe(
            true,
          );
          expect(Number.isSafeInteger(observation.responseReceivedAtMs)).toBe(
            true,
          );
          expect(observation.requestStartedAtMs).toBeLessThanOrEqual(
            observation.responseReceivedAtMs,
          );
          for (const host of observation.hosts) {
            expect(host.validUntilMs).toBeGreaterThan(
              observation.responseReceivedAtMs,
            );
            expect(host.validUntilMs).toBeLessThanOrEqual(
              snapshot.conservativeMaximumDeliveredExpiryMs!,
            );
          }
        }
      } catch (error) {
        probeFailure = { error };
        throw error;
      } finally {
        await observer.finish(probeFailure);
      }
    });
  });
});

test("cancels buffered browser input without pinning a slab", async ({
  page,
}) => {
  await withoutHostPayload(() =>
    withCredential(page, async (credential) => {
      await credential.connect();
      const result = await page.evaluate(() =>
        window.__browserAuth.bufferedCancel(),
      );
      expect(result).toEqual(
        expect.objectContaining({
          added: 3,
          addRejected: true,
          finalizeRejected: true,
          lateReads: 0,
          lateRejected: true,
          sourceStarted: true,
        }),
      );
      expect(result.addError).toContain("upload closed");
      expect(result.before).toEqual({
        length: 3,
        remaining: result.optimal - 3,
        slabs: 1,
      });
      expect(result.after).toEqual(result.before);
      expect(
        await page.evaluate(() => window.__browserAuth.snapshot()),
      ).toMatchObject({ pinnedData: "0", pinnedSize: "0" });
    }),
  );
});

test("rejects slab-free pins without storing an object or storage charges", async ({
  page,
}) => {
  await withCredential(page, async (credential) => {
    await credential.connect();
    const result = await withoutHostPayload(() =>
      page.evaluate(() => window.__browserAuth.rejectEmptyPin()),
    );
    expect(result).toEqual({
      lookupRejected: true,
      pinRejected: true,
      size: 0,
      slabs: 0,
    });
    const owner = await page.evaluate(() => window.__browserAuth.snapshot());
    expect(owner.pinnedData).toBe("0");
    expect(owner.pinnedSize).toBe("0");
  });
});

test("registers and reconnects through browser preauthorization with exact use accounting", async ({
  page,
}) => {
  await withCredential(
    page,
    async (credential) => {
      await expect(credential.connect(true)).rejects.toThrow();
      expect(await credential.remainingUses()).toBe(2);
      const accountKey = await credential.connect();
      expect(await credential.remainingUses()).toBe(1);
      expect(
        await page.evaluate(() => window.__browserAuth.snapshot()),
      ).toEqual({
        accountKey,
        ownedKey: accountKey,
        pinnedData: "0",
        pinnedSize: "0",
      });
      expect(await credential.connect()).toBe(accountKey);
      expect(await credential.remainingUses()).toBe(0);
      await expect(credential.connect()).rejects.toThrow(
        /pre-authorized key rejected/,
      );
      expect(
        (await page.evaluate(() => window.__browserAuth.snapshot())).accountKey,
      ).toBe(accountKey);
    },
    { uses: 2 },
  );
});

test("rejects browser preauthorization for another app without consuming a use", async ({
  page,
}) => {
  await withCredential(
    page,
    async (credential) => {
      await expect(credential.connect()).rejects.toThrow(
        /pre-authorized key rejected/,
      );
      expect(await credential.remainingUses()).toBe(1);
    },
    { wrongApp: true },
  );
});

test("rejects an expired browser preauthorization credential", async ({
  page,
}) => {
  await withCredential(
    page,
    async (credential) => {
      expect(await credential.remainingUses()).toBe(1);
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          Math.max(0, credential.expiration - Date.now() + 100),
        ),
      );
      await expect(credential.connect()).rejects.toThrow(
        /pre-authorized key rejected/,
      );
    },
    { lifetimeSeconds: 5 },
  );
});

test("isolates sharing keys between browser accounts using the same app", async ({
  page,
}) => {
  await withoutHostPayload(() =>
    withCredential(page, async (credential) => {
      const first = await credential.connect();
      const second = await credential.connectPeer();
      const deniedResponses: { method: string; status: number }[] = [];
      page.on("response", (response) => {
        if (
          new URL(response.url()).pathname.includes("/sharing/") &&
          response.status() === 404
        )
          deniedResponses.push({
            method: response.request().method(),
            status: response.status(),
          });
      });
      const result = await page.evaluate(() =>
        window.__browserAuth.sameAppIsolation(),
      );
      expect(deniedResponses).toEqual([
        { method: "GET", status: 404 },
        { method: "GET", status: 404 },
        { method: "DELETE", status: 404 },
      ]);
      expect(result).toEqual(
        expect.objectContaining({
          deniedList: true,
          deniedRecord: true,
          deniedRevoke: true,
          firstDescription: "first account",
          firstRevoked: true,
          objectCount: 0,
          pinned: [0, 0, 0, 0],
          secondDescription: "second account",
        }),
      );
      expect(second).toBeTruthy();
      expect(second).not.toBe(first);
      expect(result.accounts).toEqual([first, second]);
      expect(result.apps).toEqual([credential.appID, credential.appID]);
      expect(result.firstKeys).toEqual([result.firstKey]);
      expect(result.secondKeys).toEqual([result.secondKey]);
    }),
  );
});

test("matches the registered browser phrase before reconnecting the approved app", async ({
  page,
}) => {
  await withCredential(page, async (credential) => {
    const accountKey = await credential.connect();
    const url = await page.evaluate(() =>
      window.__browserAuth.requestPhraseCheck(),
    );
    await credential.approve(url);
    expect(
      await page.evaluate(() => window.__browserAuth.finishPhraseCheck()),
    ).toEqual({
      correct: true,
      invalidRejected: true,
      reconnecting: true,
      sameAccount: true,
      wrong: false,
    });
    expect(
      (await page.evaluate(() => window.__browserAuth.snapshot())).accountKey,
    ).toBe(accountKey);
  });
});
