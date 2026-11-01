/** Checks owner-only sharing routes with a separate, zero-funded browser account. */
import { observeHostPayload } from "../support/host-observer.js";
import { expect, test, withPeerAccount } from "./browser-fixture.js";

for (const sameApp of [false, true]) {
  test(
    sameApp
      ? "rejects another account on same-app owner sharing routes"
      : "rejects another account on owner sharing routes",
    async ({ realPage }) => {
      const appID = sameApp
        ? await realPage.evaluate(() => window.probe.appID())
        : undefined;
      await withPeerAccount(
        realPage,
        { ...(appID && { appID }), fundTargetBytes: 0 },
        async ({ appID, register }) => {
          const deniedResponses: { method: string; status: number }[] = [];
          realPage.on("response", (response) => {
            if (
              new URL(response.url()).pathname.includes("/sharing/") &&
              response.status() === 404
            )
              deniedResponses.push({
                method: response.request().method(),
                status: response.status(),
              });
          });
          const log = process.env.SIA_TEST_CLUSTER_LOG;
          if (!log)
            throw new Error(
              "Owner payload checks require the owned cluster log",
            );
          const observed = await observeHostPayload(log, async () => {
            await register();
            return realPage.evaluate(() => window.probe.ownerIsolation());
          });
          expect(
            observed.payloadRPCs.some((rpc) => rpc.includes("ReadSector")),
          ).toBe(true);
          expect(
            observed.payloadRPCs.some((rpc) => rpc.includes("WriteSector")),
          ).toBe(false);
          const result = observed.result;
          expect(deniedResponses).toEqual([
            { method: "GET", status: 404 },
            { method: "GET", status: 404 },
            { method: "DELETE", status: 404 },
          ]);
          expect(result).toEqual(
            expect.objectContaining({
              detachDenied: true,
              foreignCount: 0,
              foreignPinnedData: 0,
              foreignPinnedSize: 0,
              listDenied: true,
              ownerBytes: [42],
              ownerCount: 1,
              recipientBytes: [42],
              recordDenied: true,
            }),
          );
          if (sameApp) expect(result.apps).toEqual([appID, appID]);
          else {
            expect(result.apps[1]).toBe(appID);
            expect(result.apps[0]).not.toBe(appID);
          }
          expect(result.ownerIDs).toEqual([result.fixtureID]);
          const foreignKey = await realPage.evaluate(() =>
            window.probe.peerAccountKey(),
          );
          const ownerKey = await realPage.evaluate(() =>
            window.probe.accountKey(),
          );
          expect(foreignKey).toBeTruthy();
          expect(ownerKey).toBeTruthy();
          expect(foreignKey).not.toBe(ownerKey);
        },
      );
    },
  );
}
