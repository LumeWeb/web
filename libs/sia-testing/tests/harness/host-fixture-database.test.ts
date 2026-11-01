/** Rejects unsafe database targets before the owned-host fixture can change rows. */
import { expect, it } from "vitest";
import { readHostFixtureDatabase } from "../e2e/support/host-fixture-database.js";

const env = {
  SIA_TEST_ALLOW_HOST_FIXTURES: "1",
  SIA_TEST_ALLOW_MUTATION: "1",
  SIA_TEST_HOST_FIXTURE_DATABASE:
    "postgresql://fixture:fixture-only@127.0.0.1:5432/owned_cluster",
};

it("parses an explicitly allowed loopback database without forwarding a connection string", () => {
  expect(readHostFixtureDatabase(env)).toEqual({
    PGDATABASE: "owned_cluster",
    PGHOST: "127.0.0.1",
    PGPASSWORD: "fixture-only",
    PGPORT: "5432",
    PGUSER: "fixture",
  });
});

for (const patch of [
  { SIA_TEST_ALLOW_HOST_FIXTURES: "0" },
  { SIA_TEST_ALLOW_MUTATION: "0" },
  { SIA_TEST_HOST_FIXTURE_DATABASE: "" },
  {
    SIA_TEST_HOST_FIXTURE_DATABASE:
      "https://fixture:fixture-only@127.0.0.1:5432/owned_cluster",
  },
  {
    SIA_TEST_HOST_FIXTURE_DATABASE:
      "postgresql://fixture:fixture-only@remote.example:5432/owned_cluster",
  },
  {
    SIA_TEST_HOST_FIXTURE_DATABASE: "postgresql://127.0.0.1:5432/owned_cluster",
  },
  {
    SIA_TEST_HOST_FIXTURE_DATABASE:
      "postgresql://fixture:fixture-only@127.0.0.1:5432/",
  },
  {
    SIA_TEST_HOST_FIXTURE_DATABASE:
      "postgresql://fixture:fixture-only@127.0.0.1:5432/one/two",
  },
  {
    SIA_TEST_HOST_FIXTURE_DATABASE:
      "postgresql://fixture:fixture-only@127.0.0.1:5432/owned_cluster?options=unsafe",
  },
  {
    SIA_TEST_HOST_FIXTURE_DATABASE:
      "postgresql://fixture:fixture-only@127.0.0.1:5432/owned_cluster#fragment",
  },
]) {
  it(`rejects database fixture input ${Object.keys(patch)[0]}=${Object.values(patch)[0]}`, () => {
    expect(() => readHostFixtureDatabase({ ...env, ...patch })).toThrow();
  });
}
