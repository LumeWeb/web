/** Checks imported handles while the cluster log independently records host payload RPCs. */
import { observeHostPayload } from "../support/host-observer.js";
import { expect, test, withPeerAccount } from "./browser-fixture.js";

test.use({
  realPage: async ({ fundedPage }, use) => {
    await use(fundedPage);
  },
});

for (const scoped of [false, true]) {
  test(
    scoped
      ? "a scoped import survives revocation and owner deletion"
      : "an imported handle survives owner deletion without payload transfers",
    async ({ realPage }) => {
      const logPath = process.env.SIA_TEST_CLUSTER_LOG;
      if (!logPath)
        throw new Error(
          "SIA_TEST_CLUSTER_LOG is required to observe host payload RPCs",
        );
      await withPeerAccount(
        realPage,
        { fundTargetBytes: 67_108_864 },
        async (peer) => {
          await peer.register();
          await peer.waitReady();
          await realPage.evaluate(() => window.probe.prepareReference());
          const sdkTransfers = await realPage.evaluate(
            () => window.probe.diagnostics().transfers,
          );
          const { payloadRPCs, result } = await observeHostPayload(
            logPath,
            () =>
              realPage.evaluate(
                (scoped) => window.probe.importReference(scoped),
                scoped,
              ),
          );
          expect(result).toEqual({
            destinationMetadata: "destination",
            ownerMetadata: "owner",
          });
          expect(payloadRPCs).toHaveLength(0);
          expect(
            (await realPage.evaluate(
              () => window.probe.diagnostics().transfers,
            )) - sdkTransfers,
          ).toBe(0);
          expect(
            await realPage.evaluate(() => window.probe.finishReference()),
          ).toEqual({
            bytes: [3, 1, 4, 1, 5, 9],
            metadata: "destination",
            ownerDeleted: true,
            scopedRevoked: scoped,
          });
        },
      );
    },
  );
}
