/** Checks deployed slab charges using disposable accounts and their real SDK handles. */
import { test as base, expect, withPeerAccount } from "./browser-fixture.js";
import { readHostServiceConfig } from "../../../src/e2e/internal/config.js";

const config = readHostServiceConfig();
const headers = {
  authorization: `Basic ${Buffer.from(`:${config.password}`).toString("base64")}`,
  "content-type": "application/json",
};
interface Destination {
  accountKey: string;
  quotaKey: string;
}

const test = base.extend<{ destination: Destination }>({
  destination: async ({ fundedPage }, use) => {
    await withPeerAccount(
      fundedPage,
      { fundTargetBytes: 67_108_864 },
      async ({ quotaKey, register, waitReady }) => {
        const accountKey = await register();
        await waitReady();
        if (!accountKey)
          throw new Error("Destination account was not registered");
        await use({ accountKey, quotaKey });
      },
    );
  },
});

async function accountStats(key: string): Promise<unknown> {
  const response = await fetch(
    new URL(`/api/account/${encodeURIComponent(key)}`, config.adminURL),
    { headers },
  );
  expect(response.ok).toBe(true);
  return await response.json();
}

test("re-pinning an object does not charge its slab again", async ({
  fundedPage,
}) => {
  expect(
    await fundedPage.evaluate(() =>
      window.probe.accounting.repin([0, 1, 2, 3, 4, 5, 6, 7]),
    ),
  ).toEqual({
    addedData: 41_943_040,
    addedSize: 125_829_120,
    bytes: [0, 1, 2, 3, 4, 5, 6, 7],
    repinData: 0,
    repinSize: 0,
  });
});

test("packed references retain their shared slab until the last reference is pruned", async ({
  fundedPage,
}) => {
  expect(
    await fundedPage.evaluate(() =>
      window.probe.accounting.packedReferences([
        [10, 11, 12],
        [20, 21],
      ]),
    ),
  ).toEqual({
    addedData: 41_943_040,
    addedSize: 125_829_120,
    bytes: [20, 21],
    remainingData: 41_943_040,
    remainingSize: 125_829_120,
    unusedData: 0,
    unusedSize: 0,
  });
});

for (const scope of ["app", "connect-key"] as const) {
  test(`${scope} quota rejection rolls back the destination's slab charge`, async ({
    destination,
    fundedPage,
  }) => {
    await fundedPage.evaluate(() => window.probe.prepareReference());
    const setLimit = async (maxPinnedData: number) => {
      const url =
        scope === "app"
          ? `/api/account/${encodeURIComponent(destination.accountKey)}`
          : `/api/quotas/${destination.quotaKey}`;
      const body =
        scope === "app"
          ? { maxPinnedData }
          : {
              description: "disposable accounting quota",
              fundTargetBytes: 67_108_864,
              maxPinnedData,
              totalUses: 1,
            };
      const response = await fetch(new URL(url, config.adminURL), {
        body: JSON.stringify(body),
        headers,
        method: scope === "app" ? "PATCH" : "PUT",
      });
      expect(response.ok).toBe(true);
    };
    await setLimit(41_943_039);
    await expect(
      fundedPage.evaluate(() => window.probe.importReference(false)),
    ).rejects.toThrow(/storage limit exceeded/);
    expect(await accountStats(destination.accountKey)).toMatchObject({
      pinnedData: 0,
      pinnedSize: 0,
    });
    expect(
      await fundedPage.evaluate(() => window.probe.destinationContainsSource()),
    ).toBe(false);

    await setLimit(41_943_040);
    expect(
      await fundedPage.evaluate(() => window.probe.importReference(false)),
    ).toEqual({ destinationMetadata: "destination", ownerMetadata: "owner" });
    expect(await accountStats(destination.accountKey)).toMatchObject({
      pinnedData: 41_943_040,
      pinnedSize: 125_829_120,
    });
    await fundedPage.evaluate(() => window.probe.importReference(false));
    expect(await accountStats(destination.accountKey)).toMatchObject({
      pinnedData: 41_943_040,
      pinnedSize: 125_829_120,
    });
    expect(
      await fundedPage.evaluate(() => window.probe.finishReference()),
    ).toEqual({
      bytes: [3, 1, 4, 1, 5, 9],
      metadata: "destination",
      ownerDeleted: true,
      scopedRevoked: false,
    });
  });
}
