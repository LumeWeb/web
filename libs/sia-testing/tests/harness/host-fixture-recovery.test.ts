/** Host row changes must have a durable, credential-free restoration record before SQL commits. */
import { ChildProcess } from "node:child_process";
import { PassThrough } from "node:stream";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import * as recovery from "../../src/e2e/internal/recovery.mjs";
import {
  withHostGeography,
  withHostProtocols,
} from "../e2e/support/host-fixture-database.js";

const execute = vi.hoisted(() =>
  vi.fn<
    (
      file: string,
      args: string[],
      options: unknown,
      callback: (error: Error | null, output: string) => void,
    ) => ChildProcess
  >(),
);
vi.mock("node:child_process", async (importOriginal) => ({
  ...(await importOriginal<typeof import("node:child_process")>()),
  execFile: execute,
}));
vi.mock("../../src/e2e/internal/owned-cluster-lease.mjs", () => ({
  assertMutationAllowed: () => Promise.resolve(),
}));

const hosts = Array.from({ length: 30 }, (_, index) => ({
  country: "US",
  key: (index + 1).toString(16).padStart(64, "0"),
  latitude: 0,
  longitude: 0,
}));
const keys = hosts.map((row) => `ed25519:${row.key}`);
const addresses = hosts.flatMap((row, index) =>
  [1, 2].map((protocol) => ({
    address: `127.0.0.1:${10000 + index * 2 + protocol}`,
    host: index + 1,
    id: index * 2 + protocol,
    key: row.key,
    protocol,
  })),
);
let path: string;
let mutations: unknown[];
let firstIntent: unknown;
let failRestore: boolean;
let wrongReadback: boolean;

beforeEach(async () => {
  path = join(await mkdtemp("/tmp/sia-native-cutoff-run-"), "recovery.json");
  await writeFile(path, "{}", { mode: 0o600 });
  vi.spyOn(recovery, "createRecoveryRecord").mockResolvedValue(path);
  for (const [name, value] of Object.entries({
    SIA_TEST_ALLOW_HOST_FIXTURES: "1",
    SIA_TEST_ALLOW_MUTATION: "1",
    SIA_TEST_CLUSTER_BINARY: "/fixture/clusterd",
    SIA_TEST_CLUSTER_PID: "123",
    SIA_TEST_CLUSTER_SHA256: "a".repeat(64),
    SIA_TEST_CLUSTER_START_TICKS: "456",
    SIA_TEST_CLUSTER_STATE: "/fixture/state",
    SIA_TEST_CLUSTER_UID: "1000",
    SIA_TEST_HOST_FIXTURE_DATABASE:
      "postgresql://fixture:private-password@127.0.0.1:5432/owned_cluster",
  }))
    vi.stubEnv(name, value);
  mutations = [];
  firstIntent = undefined;
  failRestore = false;
  wrongReadback = false;
  execute.mockImplementation((_file, args, _options, callback) => {
    const child = new ChildProcess();
    const input = new PassThrough();
    child.stdin = input;
    let sql = "";
    input.on("data", (chunk) => {
      sql += String(chunk);
    });
    input.on("end", () => {
      void (async () => {
        if (sql.startsWith("SELECT")) {
          if (wrongReadback && mutations.length === 2)
            return JSON.stringify(
              sql.includes("FROM host_addresses")
                ? addresses.filter((row) => row.id !== 2)
                : hosts.map((row, index) =>
                    index === 0 ? { ...row, country: "DE" } : row,
                  ),
            );
          return JSON.stringify(
            sql.includes("FROM host_addresses") ? addresses : hosts,
          );
        }
        const rowsArgument = args.find((value) => value.startsWith("rows="));
        if (!rowsArgument) throw new Error("Missing SQL rows");
        const rows: unknown = JSON.parse(rowsArgument.slice(5));
        mutations.push(rows);
        if (mutations.length === 1)
          firstIntent = JSON.parse(await readFile(path, "utf8")) as unknown;
        if (failRestore && mutations.length > 1)
          throw new Error("Fixture restoration refused");
        if (
          !sql.startsWith("WITH changed AS (") &&
          !sql.startsWith("INSERT INTO host_addresses")
        )
          throw new Error("Unexpected fixture SQL");
        return "2";
      })().then(
        (output) => callback(null, output),
        () => callback(new Error("Fixture SQL failed"), ""),
      );
    });
    return child;
  });
});
afterEach(async () => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  await rm(dirname(path), { force: true, recursive: true });
});

async function useFixture(
  kind: "geography" | "protocol",
  use: () => Promise<void>,
) {
  if (kind === "geography")
    await withHostGeography(
      keys,
      [
        { country: "DE", latitude: 1, longitude: 2 },
        { country: "DE", latitude: 3, longitude: 4 },
      ],
      use,
    );
  else await withHostProtocols(keys, use);
}

it.each(["geography", "protocol"] as const)(
  "persists exact %s restoration rows before the first mutation",
  async (kind) => {
    await useFixture(kind, () => {
      expect(firstIntent).toMatchObject({
        database: {
          host: "127.0.0.1",
          name: "owned_cluster",
          port: "5432",
          user: "fixture",
        },
        keys,
        kind: `host-${kind}`,
        rows:
          kind === "geography"
            ? hosts.slice(0, 2)
            : [addresses[1], addresses[2]],
        service: {
          SIA_TEST_CLUSTER_PID: "123",
          SIA_TEST_CLUSTER_SHA256: "a".repeat(64),
          SIA_TEST_CLUSTER_START_TICKS: "456",
        },
      });
      expect(JSON.stringify(firstIntent)).not.toContain("private-password");
      return Promise.resolve();
    });
    expect(mutations).toHaveLength(2);
    expect(mutations[1]).toEqual(
      kind === "geography" ? hosts.slice(0, 2) : [addresses[1], addresses[2]],
    );
    await expect(readFile(path)).rejects.toMatchObject({ code: "ENOENT" });
  },
);

it.each(["geography", "protocol"] as const)(
  "retains %s restoration rows when restoration fails",
  async (kind) => {
    failRestore = true;
    await expect(useFixture(kind, () => Promise.resolve())).rejects.toThrow();
    const record: unknown = JSON.parse(await readFile(path, "utf8"));
    expect(record).toMatchObject({
      kind: `host-${kind}`,
      rows:
        kind === "geography" ? hosts.slice(0, 2) : [addresses[1], addresses[2]],
    });
  },
);

it.each(["geography", "protocol"] as const)(
  "retains %s restoration rows when acknowledged restoration has incorrect readback",
  async (kind) => {
    wrongReadback = true;
    await expect(useFixture(kind, () => Promise.resolve())).rejects.toThrow(
      kind === "geography"
        ? "geography was not restored"
        : "advertisements were not restored",
    );
    expect(mutations).toHaveLength(2);
    const record: unknown = JSON.parse(await readFile(path, "utf8"));
    expect(record).toMatchObject({
      keys,
      kind: `host-${kind}`,
      rows:
        kind === "geography" ? hosts.slice(0, 2) : [addresses[1], addresses[2]],
    });
  },
);

it.each(["geography", "protocol"] as const)(
  "does not change %s rows when recording fails",
  async (kind) => {
    vi.spyOn(recovery, "writeRecoveryRecord").mockRejectedValue(
      new Error("Disk refused intent"),
    );
    await expect(useFixture(kind, () => Promise.resolve())).rejects.toThrow();
    expect(mutations).toEqual([]);
  },
);
