/** Temporarily changes owned host metadata, restoring snapshots after SDK assertions. */
import { assertMutationAllowed } from "../../../src/e2e/internal/owned-cluster-lease.mjs";
import { execFile } from "node:child_process";
import { rm } from "node:fs/promises";
import { dirname } from "node:path";
import { createRecoveryRecord, writeRecoveryRecord } from "../../../src/e2e/internal/recovery.mjs";
import { readHostServiceConfig, redactSensitive } from "../../../src/e2e/internal/config.js";

interface Geography {
  country: string;
  latitude: number;
  longitude: number;
}
interface HostRow extends Geography {
  key: string;
}

export function readHostFixtureDatabase(
  env: Record<string, string | undefined> = process.env,
) {
  if (
    env.SIA_TEST_ALLOW_MUTATION !== "1" ||
    env.SIA_TEST_ALLOW_HOST_FIXTURES !== "1"
  )
    throw new Error("Host fixtures require both mutation permissions");
  let url: URL;
  try {
    url = new URL(env.SIA_TEST_HOST_FIXTURE_DATABASE ?? "");
  } catch {
    throw new Error("Host fixture database URL is required");
  }
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !["127.0.0.1", "localhost"].includes(url.hostname) ||
    url.search ||
    url.hash
  )
    throw new Error(
      "Host fixture database must be loopback PostgreSQL without URL options",
    );
  const database = decodeURIComponent(url.pathname.slice(1));
  if (!/^[a-zA-Z0-9_]+$/.test(database) || !url.username || !url.password)
    throw new Error("Host fixture database requires a name and credentials");
  return {
    PGDATABASE: database,
    PGHOST: url.hostname,
    PGPASSWORD: decodeURIComponent(url.password),
    PGPORT: url.port || "5432",
    PGUSER: decodeURIComponent(url.username),
  };
}

/** The database fixture compares this complete API key set before changing any rows. */
export async function readHostKeys(): Promise<string[]> {
  const config = readHostServiceConfig();
  const response = await fetch(new URL("/api/hosts", config.adminURL), {
    headers: {
      authorization: `Basic ${Buffer.from(`:${config.password}`).toString("base64")}`,
    },
  });
  if (!response.ok) throw new Error("Owned service host lookup failed");
  const value: unknown = await response.json();
  if (!Array.isArray(value))
    throw new Error("Owned service returned invalid hosts");
  return value.map((row: unknown) => {
    if (
      !row ||
      typeof row !== "object" ||
      !("publicKey" in row) ||
      typeof row.publicKey !== "string"
    )
      throw new Error("Owned host is missing its public key");
    return row.publicKey;
  });
}

const snapshotSQL =
  "SELECT json_agg(json_build_object('key',encode(public_key,'hex'),'country',country_code,'latitude',location[0],'longitude',location[1]) ORDER BY id) FROM hosts";
const updateSQL =
  "WITH changed AS (UPDATE hosts h SET country_code=f.country,location=point(f.latitude,f.longitude) FROM jsonb_to_recordset(:'rows'::jsonb) AS f(key text,country text,latitude double precision,longitude double precision) WHERE h.public_key=decode(f.key,'hex') RETURNING 1) SELECT count(*) FROM changed";

interface AddressRow {
  address: string;
  host: number;
  id: number;
  key: string;
  protocol: number;
}

export async function withHostGeography(
  expectedKeys: string[],
  geography: readonly [Geography, Geography],
  use: (keys: readonly [string, string]) => Promise<void>,
) {
  const database = readHostFixtureDatabase();
  if (
    geography.length !== 2 ||
    geography.some(
      (point) =>
        !/^[A-Z]{2}$/.test(point.country) ||
        !Number.isFinite(point.latitude) ||
        !Number.isFinite(point.longitude) ||
        Math.abs(point.latitude) > 90 ||
        Math.abs(point.longitude) > 180,
    )
  )
    throw new Error("Invalid owned host geography");
  const query = createHostFixtureQuery(database);
  const snapshot = async (): Promise<HostRow[]> => {
    const text = await query(snapshotSQL);
    return parseGeographySnapshot(text);
  };
  const original = await snapshot();
  const actualKeys = original.map((row) => `ed25519:${row.key}`).sort();
  if (
    expectedKeys.length !== 30 ||
    new Set(expectedKeys).size !== 30 ||
    JSON.stringify([...expectedKeys].sort()) !== JSON.stringify(actualKeys)
  )
    throw new Error(
      "Host fixture database does not match the owned 30-host service",
    );
  if (original.some((row) => row.country === "DE"))
    throw new Error("Host fixture requires DE to be absent before changes");
  const first = original[0],
    second = original[1];
  if (!first || !second)
    throw new Error("Host fixture requires two owned hosts");
  const saved = [first, second];
  const changed = saved.map((row, index) => ({ ...row, ...geography[index] }));
  await withHostRestoration(
    { database, keys: expectedKeys, kind: "host-geography", rows: saved },
    async () => {
      if ((await query(updateSQL, changed)) !== "2")
        throw new Error("Host fixture did not update both owned rows");
      await use([`ed25519:${first.key}`, `ed25519:${second.key}`]);
    },
    async () => {
      if ((await query(updateSQL, saved)) !== "2")
        throw new Error("Host fixture did not restore both owned rows");
      const restored = await snapshot();
      for (const row of saved) {
        const found = restored.find((item) => item.key === row.key);
        if (
          !found ||
          found.country !== row.country ||
          found.latitude !== row.latitude ||
          found.longitude !== row.longitude
        )
          throw new Error("Host fixture geography was not restored");
      }
    },
  );
}

/** Removes advertisements, not listening transports; row IDs are restored without advancing sequences. */
export async function withHostProtocols(
  expectedKeys: string[],
  use: (keys: readonly [string, string]) => Promise<void>,
) {
  const database = readHostFixtureDatabase();
  const query = createHostFixtureQuery(database);
  const hosts = parseGeographySnapshot(await query(snapshotSQL));
  const actualKeys = hosts.map((row) => `ed25519:${row.key}`);
  if (
    expectedKeys.length !== 30 ||
    new Set(expectedKeys).size !== 30 ||
    JSON.stringify([...expectedKeys].sort()) !==
      JSON.stringify([...actualKeys].sort())
  )
    throw new Error(
      "Host fixture database does not match the owned 30-host service",
    );
  const first = hosts[0],
    second = hosts[1];
  if (!first || !second)
    throw new Error("Host fixture requires two owned hosts");
  const sql =
    "SELECT json_agg(json_build_object('id',a.id,'host',a.host_id,'address',a.net_address,'protocol',a.protocol,'key',encode(h.public_key,'hex')) ORDER BY a.id) FROM host_addresses a JOIN hosts h ON h.id=a.host_id";
  const snapshot = async (): Promise<AddressRow[]> => {
    const value: unknown = JSON.parse(await query(sql));
    if (!Array.isArray(value)) throw new Error("Invalid host address snapshot");
    const rows: AddressRow[] = [];
    for (const row of value as unknown[]) {
      if (
        !row ||
        typeof row !== "object" ||
        !("id" in row) ||
        typeof row.id !== "number" ||
        !Number.isSafeInteger(row.id) ||
        row.id <= 0 ||
        !("host" in row) ||
        typeof row.host !== "number" ||
        !Number.isSafeInteger(row.host) ||
        row.host <= 0 ||
        !("address" in row) ||
        typeof row.address !== "string" ||
        !row.address ||
        !("key" in row) ||
        typeof row.key !== "string" ||
        !/^[0-9a-f]{64}$/.test(row.key) ||
        !("protocol" in row) ||
        (row.protocol !== 1 && row.protocol !== 2)
      )
        throw new Error("Invalid host address row");
      rows.push({
        address: row.address,
        host: row.host,
        id: row.id,
        key: row.key,
        protocol: row.protocol,
      });
    }
    return rows;
  };
  const original = await snapshot();
  for (const key of [first.key, second.key]) {
    const addresses = original.filter((row) => row.key === key);
    if (
      addresses.length !== 2 ||
      !addresses.some((row) => row.protocol === 1) ||
      !addresses.some((row) => row.protocol === 2)
    )
      throw new Error(
        "Host protocol fixture requires one address per protocol",
      );
  }
  const removed = original.filter(
    (row) =>
      (row.key === first.key && row.protocol === 2) ||
      (row.key === second.key && row.protocol === 1),
  );
  await withHostRestoration(
    { database, keys: expectedKeys, kind: "host-protocol", rows: removed },
    async () => {
      if (
        (await query(
          "WITH changed AS (DELETE FROM host_addresses a USING jsonb_to_recordset(:'rows'::jsonb) AS r(id integer,host integer) WHERE a.id=r.id AND a.host_id=r.host RETURNING 1) SELECT count(*) FROM changed",
          removed,
        )) !== "2"
      )
        throw new Error(
          "Host protocol fixture did not remove both advertisements",
        );
      await use([`ed25519:${first.key}`, `ed25519:${second.key}`]);
    },
    async () => {
      await query(
        "INSERT INTO host_addresses(id,host_id,net_address,protocol) SELECT id,host,address,protocol FROM jsonb_to_recordset(:'rows'::jsonb) AS r(id integer,host integer,address text,protocol smallint) ON CONFLICT(id) DO NOTHING",
        removed,
      );
      if (JSON.stringify(await snapshot()) !== JSON.stringify(original))
        throw new Error("Host protocol advertisements were not restored");
    },
  );
}

function createHostFixtureQuery(
  database: ReturnType<typeof readHostFixtureDatabase>,
) {
  return async (sql: string, rows: readonly unknown[] = []) => {
    await assertMutationAllowed();
    try {
      return await new Promise<string>((resolve, reject) => {
        const child = execFile(
          "psql",
          [
            "-X",
            "--no-password",
            "-A",
            "-t",
            "-v",
            "ON_ERROR_STOP=1",
            "-v",
            `rows=${JSON.stringify(rows)}`,
          ],
          {
            env: {
              ...process.env,
              ...database,
              PGCONNECT_TIMEOUT: "5",
              PGHOSTADDR: undefined,
              PGOPTIONS: undefined,
              PGSERVICE: undefined,
              PGSERVICEFILE: undefined,
            },
            maxBuffer: 1_000_000,
            timeout: 15_000,
          },
          (error, stdout) => {
            if (error) reject(new Error("psql failed"));
            else resolve(stdout.trim());
          },
        );
        child.stdin?.on("error", (error: Error) => reject(error));
        child.stdin?.end(`${sql};\n`);
      });
    } catch {
      throw new Error("Owned host fixture database command failed");
    }
  };
}

function parseGeographySnapshot(text: string): HostRow[] {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("Invalid host fixture snapshot");
  }
  if (!Array.isArray(value)) throw new Error("Invalid host fixture snapshot");
  const rows: HostRow[] = [];
  const values: unknown[] = value;
  for (const row of values) {
    if (
      !row ||
      typeof row !== "object" ||
      !("key" in row) ||
      typeof row.key !== "string" ||
      !/^[0-9a-f]{64}$/.test(row.key) ||
      !("country" in row) ||
      typeof row.country !== "string" ||
      !("latitude" in row) ||
      typeof row.latitude !== "number" ||
      !("longitude" in row) ||
      typeof row.longitude !== "number" ||
      !Number.isFinite(row.latitude) ||
      !Number.isFinite(row.longitude)
    )
      throw new Error("Invalid host fixture row");
    rows.push({
      country: row.country,
      key: row.key,
      latitude: row.latitude,
      longitude: row.longitude,
    });
  }
  return rows;
}

/** Separate psql connections commit before the SDK can observe a change, so restoration
 * rows must reach durable storage before the first write, not only in a finally block.
 */
async function withHostRestoration(
  {
    database,
    keys,
    kind,
    rows,
  }: {
    database: ReturnType<typeof readHostFixtureDatabase>;
    keys: string[];
    kind: "host-geography" | "host-protocol";
    rows: readonly unknown[];
  },
  operation: () => Promise<void>,
  restore: () => Promise<void>,
) {
  const service = Object.fromEntries(
    [
      "SIA_TEST_CLUSTER_BINARY",
      "SIA_TEST_CLUSTER_PID",
      "SIA_TEST_CLUSTER_SHA256",
      "SIA_TEST_CLUSTER_START_TICKS",
      "SIA_TEST_CLUSTER_STATE",
      "SIA_TEST_CLUSTER_UID",
    ].map((name) => {
      const value = process.env[name];
      if (!value)
        throw new Error(
          "Host restoration requires the selected service identity",
        );
      return [name, value];
    }),
  );
  const path = await createRecoveryRecord();
  await writeRecoveryRecord(path, {
    database: {
      host: database.PGHOST,
      name: database.PGDATABASE,
      port: database.PGPORT,
      user: database.PGUSER,
    },
    keys,
    kind,
    rows,
    schema: 1,
    service,
  });
  const failures: unknown[] = [];
  try {
    await operation();
  } catch (error) {
    failures.push(error);
  }
  try {
    await restore();
    await rm(dirname(path), { recursive: true });
  } catch (error) {
    failures.push(
      error,
      new Error(`Host restoration record retained at ${path}`),
    );
  }
  if (failures.length)
    throw new Error(
      failures
        .map((error) =>
          redactSensitive(
            error instanceof Error
              ? error.message
              : "Unknown host fixture failure",
          ),
        )
        .join("\n"),
    );
}
