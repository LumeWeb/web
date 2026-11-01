/** Exercises browser host queries while Node temporarily controls owned host metadata. */
import { expect, test } from "@playwright/test";
import { hostDistanceCases } from "../../fixtures/host-distance.js";
import { withCredential, withoutHostPayload } from "./browser-auth-fixture.js";
import {
  readHostKeys as ownedKeys,
  withHostGeography,
  withHostProtocols,
} from "../support/host-fixture-database.js";

test("excludes incompatible advertised protocols through the browser SDK", async ({
  page,
}) => {
  await withCredential(page, async (credential) => {
    await credential.connect();
    const keys = await ownedKeys();
    await withoutHostPayload(() =>
      withHostProtocols(keys, async (pair) => {
        const requested = page.waitForRequest((request) =>
          new URL(request.url()).pathname.endsWith("/hosts"),
        );
        const hosts = await page.evaluate(() =>
          window.__browserAuth.queryHosts({ limit: 500 }),
        );
        expect(
          new URL((await requested).url()).searchParams.get("protocol"),
        ).toBe("quic");
        expect(hosts).toHaveLength(29);
        expect(hosts.some((host) => host.publicKey === pair[0])).toBe(false);
        expect(hosts.some((host) => host.publicKey === pair[1])).toBe(true);
        expect(
          (
            await page.evaluate(() =>
              window.__browserAuth.queryHosts({ limit: 1 }),
            )
          ).map((host) => host.publicKey),
        ).toEqual([pair[1]]);
      }),
    );
    const restored = await page.evaluate(() =>
      window.__browserAuth.queryHosts({ limit: 500 }),
    );
    expect(restored.map((host) => host.publicKey).sort()).toEqual(
      [...keys].sort(),
    );
  });
});

for (const scenario of hostDistanceCases) {
  test(`orders browser deployed ${scenario.name} before pagination`, async ({
    page,
  }) => {
    await withCredential(page, async (credential) => {
      await credential.connect();
      const keys = await ownedKeys();
      await withoutHostPayload(() =>
        withHostGeography(
          keys,
          [
            { ...scenario.coordinates[0], country: "DE" },
            { ...scenario.coordinates[1], country: "DE" },
          ],
          async (pair) => {
            const expected = scenario.order.map((index) => pair[index]);
            const hosts = await page.evaluate(
              (location) =>
                window.__browserAuth.queryHosts({ country: "DE", location }),
              scenario.location,
            );
            expect(hosts.map((host) => host.publicKey)).toEqual(expected);
            const following = await page.evaluate(
              (location) =>
                window.__browserAuth.queryHosts({
                  country: "DE",
                  limit: 1,
                  location,
                  offset: 1,
                }),
              scenario.location,
            );
            expect(following.map((host) => host.publicKey)).toEqual([
              expected[1],
            ]);
          },
        ),
      );
      expect(
        await page.evaluate(() =>
          window.__browserAuth.queryHosts({ country: "DE" }),
        ),
      ).toEqual([]);
    });
  });
}

test("selects matching browser countries before applying the page offset", async ({
  page,
}) => {
  await withCredential(page, async (credential) => {
    await credential.connect();
    const keys = await ownedKeys();
    await withoutHostPayload(() =>
      withHostGeography(
        keys,
        [
          { country: "DE", latitude: 0, longitude: 0 },
          { country: "DE", latitude: 0, longitude: 0 },
        ],
        async (pair) => {
          const hosts = await page.evaluate(() =>
            window.__browserAuth.queryHosts({ country: "DE" }),
          );
          expect(hosts.map((host) => host.publicKey)).toEqual([...pair]);
          const following = await page.evaluate(() =>
            window.__browserAuth.queryHosts({
              country: "DE",
              limit: 1,
              offset: 1,
            }),
          );
          expect(following.map((host) => host.publicKey)).toEqual([pair[1]]);
          expect(
            await page.evaluate(() =>
              window.__browserAuth.queryHosts({
                country: "DE",
                limit: 1,
                offset: 2,
              }),
            ),
          ).toEqual([]);
        },
      ),
    );
    expect(
      await page.evaluate(() =>
        window.__browserAuth.queryHosts({ country: "DE" }),
      ),
    ).toEqual([]);
  });
});
