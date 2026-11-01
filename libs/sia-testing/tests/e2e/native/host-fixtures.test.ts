/** Queries the real service while two owned hosts have temporarily controlled metadata. */
import { expect, it } from "vitest";
import { account, withAccounts } from "./session.js";
import type { HostQuery, Sdk } from "@siafoundation/sia-storage";
import { hostDistanceCases } from "../../fixtures/host-distance.js";
import { observeHostPayload } from "../support/host-observer.js";
import {
  readHostFixtureDatabase,
  readHostKeys,
  withHostGeography,
} from "../support/host-fixture-database.js";

readHostFixtureDatabase();

async function withOwnedSdk(use: (sdk: Sdk, keys: string[]) => Promise<void>) {
  await withAccounts(
    1,
    async (sessions) => {
      const sdk = account(sessions, 0).sdk;
      const keys = await readHostKeys();
      const log = process.env.SIA_TEST_CLUSTER_LOG;
      if (log)
        expect(
          (await observeHostPayload(log, () => use(sdk, keys))).payloadRPCs,
        ).toEqual([]);
      else await use(sdk, keys);
    },
    "metadata",
  );
}

for (const scenario of hostDistanceCases) {
  it(`orders deployed ${scenario.name} before pagination`, async () => {
    await withOwnedSdk(async (sdk, keys) => {
      await withHostGeography(
        keys,
        [
          { ...scenario.coordinates[0], country: "DE" },
          { ...scenario.coordinates[1], country: "DE" },
        ],
        async (pair) => {
          const expected = scenario.order.map((index) => pair[index]);
          expect(
            (
              await sdk.hosts({ country: "DE", location: scenario.location })
            ).map((host) => host.publicKey),
          ).toEqual(expected);
          expect(
            (
              await sdk.hosts({
                country: "DE",
                limit: 1,
                location: scenario.location,
                offset: 1,
              })
            ).map((host) => host.publicKey),
          ).toEqual([expected[1]]);
        },
      );
      expect(await sdk.hosts({ country: "DE" })).toEqual([]);
    });
  }, 30_000);
}

it("selects matching deployed countries before applying the page offset", async () => {
  await withOwnedSdk(async (sdk, keys) => {
    await withHostGeography(
      keys,
      [
        { country: "DE", latitude: 0, longitude: 0 },
        { country: "DE", latitude: 0, longitude: 0 },
      ],
      async (pair) => {
        expect(
          (await sdk.hosts({ country: "DE" })).map((host) => host.publicKey),
        ).toEqual([...pair]);
        expect(
          (await sdk.hosts({ country: "DE", limit: 1, offset: 1 })).map(
            (host) => host.publicKey,
          ),
        ).toEqual([pair[1]]);
        expect(await sdk.hosts({ country: "DE", limit: 1, offset: 2 })).toEqual(
          [],
        );
      },
    );
    expect(await sdk.hosts({ country: "DE" })).toEqual([]);
  });
}, 30_000);

it("excludes incompatible advertised protocols through the native SDK", async () => {
  await withOwnedSdk(async (sdk, keys) => {
    const fixture = await import("../support/host-fixture-database.js");
    let checked = false;
    await fixture.withHostProtocols(keys, async (pair) => {
      const quic = await sdk.hosts({
        limit: 500,
        protocol: "Quic" as NonNullable<HostQuery["protocol"]>,
      });
      const siamux = await sdk.hosts({
        limit: 500,
        protocol: "SiaMux" as NonNullable<HostQuery["protocol"]>,
      });
      expect(quic).toHaveLength(29);
      expect(siamux).toHaveLength(29);
      expect(quic.some((host) => host.publicKey === pair[0])).toBe(false);
      expect(quic.some((host) => host.publicKey === pair[1])).toBe(true);
      expect(siamux.some((host) => host.publicKey === pair[0])).toBe(true);
      expect(siamux.some((host) => host.publicKey === pair[1])).toBe(false);
      expect(
        (
          await sdk.hosts({
            limit: 1,
            protocol: "Quic" as NonNullable<HostQuery["protocol"]>,
          })
        ).map((host) => host.publicKey),
      ).toEqual([pair[1]]);
      checked = true;
    });
    expect(checked).toBe(true);
    expect(
      (
        await sdk.hosts({
          limit: 500,
          protocol: "Quic" as NonNullable<HostQuery["protocol"]>,
        })
      )
        .map((host) => host.publicKey)
        .sort(),
    ).toEqual([...keys].sort());
  });
}, 30_000);

it("restores advertisements after a failing protocol operation", async () => {
  await withOwnedSdk(async (sdk, keys) => {
    const fixture = await import("../support/host-fixture-database.js");
    await expect(
      fixture.withHostProtocols(keys, async () => {
        expect(
          await sdk.hosts({
            limit: 500,
            protocol: "Quic" as NonNullable<HostQuery["protocol"]>,
          }),
        ).toHaveLength(29);
        throw new Error("intentional protocol failure");
      }),
    ).rejects.toThrow("intentional protocol failure");
    for (const protocol of ["Quic", "SiaMux"] as NonNullable<
      HostQuery["protocol"]
    >[])
      expect(
        (await sdk.hosts({ limit: 500, protocol }))
          .map((host) => host.publicKey)
          .sort(),
      ).toEqual([...keys].sort());
  });
}, 30_000);

it("rejects protocol changes for a mismatched owned host set", async () => {
  await withOwnedSdk(async (sdk, keys) => {
    const fixture = await import("../support/host-fixture-database.js");
    await expect(
      fixture.withHostProtocols(keys.slice(1), () =>
        Promise.reject(new Error("unmatched protocol fixture executed")),
      ),
    ).rejects.toThrow("does not match");
    expect(await sdk.hosts({ limit: 500 })).toHaveLength(30);
  });
}, 30_000);

it("restores owned geography after a failing operation", async () => {
  await withOwnedSdk(async (sdk, keys) => {
    await expect(
      withHostGeography(
        keys,
        [
          { country: "DE", latitude: 1, longitude: 2 },
          { country: "DE", latitude: 3, longitude: 4 },
        ],
        () => Promise.reject(new Error("intentional fixture failure")),
      ),
    ).rejects.toThrow("intentional fixture failure");
    expect(await sdk.hosts({ country: "DE" })).toEqual([]);
  });
}, 30_000);

it("rejects invalid geography before changing owned rows", async () => {
  await withOwnedSdk(async (sdk, keys) => {
    await expect(
      withHostGeography(
        keys,
        [
          { country: "DE", latitude: 91, longitude: 2 },
          { country: "DE", latitude: 3, longitude: 4 },
        ],
        () => Promise.reject(new Error("invalid fixture was executed")),
      ),
    ).rejects.toThrow("Invalid owned host geography");
    expect(await sdk.hosts({ country: "DE" })).toEqual([]);
  });
}, 30_000);

it("rejects a database whose host keys do not match the service before updates", async () => {
  await withOwnedSdk(async (sdk, keys) => {
    await expect(
      withHostGeography(
        keys.slice(1),
        [
          { country: "DE", latitude: 1, longitude: 2 },
          { country: "DE", latitude: 3, longitude: 4 },
        ],
        () => Promise.reject(new Error("unmatched fixture was executed")),
      ),
    ).rejects.toThrow("does not match");
    expect(await sdk.hosts({ country: "DE" })).toEqual([]);
  });
}, 30_000);
