/** Private fixture checks run without importing a browser or opening an Indexd connection. */
import assert from "node:assert/strict";
import { chmod, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  authorizeContractRun,
  parseContractConfig,
  readContractFile,
} from "./config.ts";

function fixture() {
  return {
    app: {
      objectId: "a".repeat(64),
      rangeBytes: [0, 1, 2],
      rangeOffset: 2,
      seekSeconds: 1,
      sizeBytes: 4096,
    },
    indexerUrl: "https://indexer.example.invalid/api/",
    maxTransferBytes: 65536,
    shared: {
      objectId: "b".repeat(64),
      rangeBytes: [3, 4, 5],
      rangeOffset: 4,
      seekSeconds: 1,
      sizeBytes: 4096,
    },
    sharingKeyHex: "c".repeat(64),
    timeoutMs: 60000,
    userKeyHex: "d".repeat(64),
    version: 1,
  };
}

const invalid: readonly {
  change: (input: ReturnType<typeof fixture>) => unknown;
  name: string;
}[] = [
  { change: () => null, name: "a missing fixture" },
  { change: () => [], name: "an array instead of a fixture" },
  {
    change: (input) => ({ ...input, version: 2 }),
    name: "an unknown format version",
  },
  {
    change: (input) => ({ ...input, registerAccount: true }),
    name: "an unknown action field",
  },
  {
    change: (input) => ({
      ...input,
      indexerUrl: "http://indexer.example.invalid/",
    }),
    name: "a plaintext endpoint",
  },
  {
    change: (input) => ({
      ...input,
      indexerUrl: "https://user:private-value@indexer.example.invalid/",
    }),
    name: "credentials in the endpoint",
  },
  {
    change: (input) => ({
      ...input,
      indexerUrl: "https://indexer.example.invalid/?token=private-value",
    }),
    name: "a query in the endpoint",
  },
  {
    change: (input) => ({
      ...input,
      indexerUrl: "https://indexer.example.invalid/#private-value",
    }),
    name: "a fragment in the endpoint",
  },
  {
    change: (input) => ({ ...input, userKeyHex: "private-value" }),
    name: "an invalid app key",
  },
  {
    change: (input) => ({ ...input, sharingKeyHex: "private-value" }),
    name: "an invalid sharing key",
  },
  {
    change: (input) => ({ ...input, timeoutMs: Infinity }),
    name: "an unbounded deadline",
  },
  {
    change: (input) => ({ ...input, timeoutMs: 120001 }),
    name: "a deadline above the runner limit",
  },
  { change: (input) => ({ ...input, timeoutMs: 0 }), name: "a zero deadline" },
  {
    change: (input) => ({ ...input, maxTransferBytes: 33554433 }),
    name: "a transfer allowance above the runner limit",
  },
  {
    change: (input) => ({ ...input, maxTransferBytes: 4096 }),
    name: "a transfer allowance smaller than the fixtures",
  },
  {
    change: (input) => ({ ...input, app: null }),
    name: "a missing app fixture",
  },
  {
    change: (input) => ({
      ...input,
      app: { ...input.app, objectId: "private-value" },
    }),
    name: "a malformed object identity",
  },
  {
    change: (input) => ({
      ...input,
      shared: { ...input.shared, objectId: input.app.objectId },
    }),
    name: "the same object for allowed and denied shared access",
  },
  {
    change: (input) => ({ ...input, app: { ...input.app, sizeBytes: 0 } }),
    name: "a zero-size fixture",
  },
  {
    change: (input) => ({
      ...input,
      app: { ...input.app, sizeBytes: 4194305 },
    }),
    name: "a fixture above the runner limit",
  },
  {
    change: (input) => ({ ...input, app: { ...input.app, rangeOffset: 4095 } }),
    name: "a range beyond the fixture",
  },
  {
    change: (input) => ({ ...input, app: { ...input.app, rangeBytes: [] } }),
    name: "an empty expected range",
  },
  {
    change: (input) => ({
      ...input,
      app: { ...input.app, rangeBytes: Array(4097).fill(0) },
    }),
    name: "an oversized expected range",
  },
  {
    change: (input) => ({ ...input, app: { ...input.app, rangeBytes: [256] } }),
    name: "a non-byte expected value",
  },
  {
    change: (input) => ({ ...input, app: { ...input.app, rangeOffset: 0.5 } }),
    name: "a fractional range offset",
  },
  {
    change: (input) => ({ ...input, app: { ...input.app, seekSeconds: 0 } }),
    name: "a zero seek target",
  },
  {
    change: (input) => ({ ...input, app: { ...input.app, seekSeconds: NaN } }),
    name: "an unbounded seek target",
  },
];
for (const { change, name } of invalid) {
  await test(`the preflight rejects ${name} without exposing its values`, () => {
    assert.throws(
      () => parseContractConfig(change(fixture())),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.equal(error.message.includes("private-value"), false);
        return true;
      },
    );
  });
}

await test("a valid fixture preserves its endpoint path and known range bytes", () => {
  const result = parseContractConfig(fixture());
  assert.equal(result.indexerUrl, "https://indexer.example.invalid/api/");
  assert.deepEqual(result.app.rangeBytes, [0, 1, 2]);
  assert.equal(result.shared.sizeBytes, 4096);
});

await test("an owner-only fixture outside the checkout can be read", async (context) => {
  const directory = await mkdtemp(join(tmpdir(), "sia-video-contract-"));
  context.after(() => rm(directory, { force: true, recursive: true }));
  const path = join(directory, "fixture.json");
  await writeFile(path, JSON.stringify(fixture()), { mode: 0o600 });
  const result = await readContractFile(path, [join(directory, "checkout")]);
  assert.equal(result.app.objectId, "a".repeat(64));
});

for (const { env, name } of [
  { env: {}, name: "missing consent" },
  {
    env: {
      DEBUG: "pw:api",
      SIA_VIDEO_CONTRACT_APPROVED_ORIGIN: "https://indexer.example.invalid",
      SIA_VIDEO_CONTRACT_RUN: "1",
    },
    name: "Playwright API debugging",
  },
  {
    env: {
      PWDEBUG: "1",
      SIA_VIDEO_CONTRACT_APPROVED_ORIGIN: "https://indexer.example.invalid",
      SIA_VIDEO_CONTRACT_RUN: "1",
    },
    name: "the Playwright inspector",
  },
  {
    env: {
      SIA_VIDEO_CONTRACT_APPROVED_ORIGIN: "https://indexer.example.invalid",
      SIA_VIDEO_CONTRACT_RUN: "true",
    },
    name: "ambiguous consent",
  },
  {
    env: {
      SIA_VIDEO_CONTRACT_APPROVED_ORIGIN: "https://other.example.invalid",
      SIA_VIDEO_CONTRACT_RUN: "1",
    },
    name: "an unapproved endpoint",
  },
  {
    env: {
      SIA_VIDEO_CONTRACT_APPROVED_ORIGIN:
        "https://private-value@indexer.example.invalid",
      SIA_VIDEO_CONTRACT_RUN: "1",
    },
    name: "an approval URL containing credentials",
  },
]) {
  await test(`live execution refuses ${name}`, () => {
    assert.throws(() =>
      authorizeContractRun(parseContractConfig(fixture()), env),
    );
  });
}

for (const { name, prepare, roots } of [
  {
    name: "group-readable credentials",
    prepare: async (path: string) => {
      await chmod(path, 0o640);
      return path;
    },
    roots: (dir: string) => [join(dir, "checkout")],
  },
  {
    name: "credentials inside a checkout",
    prepare: (path: string) => path,
    roots: (dir: string) => [dir],
  },
  {
    name: "a symlink to credentials",
    prepare: async (path: string) => {
      await symlink(path, `${path}.link`);
      return `${path}.link`;
    },
    roots: (dir: string) => [join(dir, "checkout")],
  },
  {
    name: "a valid JSON document above the input limit",
    prepare: async (path: string) => {
      await writeFile(path, " ".repeat(16384) + JSON.stringify(fixture()));
      return path;
    },
    roots: (dir: string) => [join(dir, "checkout")],
  },
  {
    name: "malformed JSON containing private values",
    prepare: async (path: string) => {
      await writeFile(path, "private-value");
      return path;
    },
    roots: (dir: string) => [join(dir, "checkout")],
  },
]) {
  await test(`the file reader rejects ${name} without printing contents`, async (context) => {
    const directory = await mkdtemp(join(tmpdir(), "sia-video-contract-"));
    context.after(() => rm(directory, { force: true, recursive: true }));
    const path = join(directory, "fixture.json");
    await writeFile(path, JSON.stringify(fixture()), { mode: 0o600 });
    const target = await prepare(path);
    await assert.rejects(
      readContractFile(target, roots(directory)),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.equal(error.message.includes("private-value"), false);
        return true;
      },
    );
  });
}

await test("live approval names the fixture endpoint before any connection", () => {
  assert.doesNotThrow(() =>
    authorizeContractRun(parseContractConfig(fixture()), {
      SIA_VIDEO_CONTRACT_APPROVED_ORIGIN: "https://indexer.example.invalid",
      SIA_VIDEO_CONTRACT_RUN: "1",
    }),
  );
});
