/** Native runner coverage for lazy mock ownership and fixture extension. */
import { afterAll, expect, type TestAPI } from "vitest";
import { createSiaTest, type MockSiaTestBackend, type SiaTest, type SiaTestFixtures, type SiaTestOptions } from "../../src/vitest.js";
import { bytesFixture, type MockRun } from "../../src/mock.js";

const test = createSiaTest({ backend: { app: {
  description: "Fixture tests", id: "a".repeat(64), name: "Vitest",
  serviceUrl: "https://example.invalid",
}, kind: "mock" } });
const runs: MockRun[] = [];
const extended = test.extend<{ label: string }>({
  label: async ({ sia }, use) => {
    runs.push(sia);
    await use("extended");
  },
});
extended.concurrent.for([1, 2])("owns a fresh run for concurrent test %i", async (_, { label, sia }) => {
  expect(label).toBe("extended");
  const object = await sia.objects.upload({ file: await bytesFixture({ bytes: Uint8Array.of(1), name: "one" }), metadata: new Uint8Array(), name: "one" });
  expect(object.sizeBytes).toBe(1);
  const reader = sia.mock.reader({ access: sia.ownerAccess, as: sia.mock.actor(label) });
  try {
    expect((await reader.objects({ limit: 10, offset: 0 })).objects.map(item => item.id)).toEqual([object.id]);
  } finally { await reader.close(); }
});
afterAll(async () => {
  expect(runs).toHaveLength(2);
  expect(runs[0]).not.toBe(runs[1]);
  for (const run of runs) {
    await expect(run.objects.upload({ file: await bytesFixture({ bytes: new Uint8Array(), name: "closed" }), metadata: new Uint8Array(), name: "closed" })).rejects.toMatchObject({ code: "closed" });
  }
});

const unused = createSiaTest({ backend: { app: {
  description: "Lazy setup", id: "a".repeat(64), name: "Unused", serviceUrl: "https://example.invalid",
}, kind: "mock" }, limits: { maxObjects: -1 } });
unused("does not validate run options until sia is requested", () => { expect(true).toBe(true); });

function checkPublicTypes(sia: MockRun, backend: MockSiaTestBackend) {
  const options: SiaTestOptions = { backend, limits: { maxObjects: 2 } };
  const native: TestAPI<SiaTestFixtures> = createSiaTest(options);
  const named: SiaTest = native;
  // @ts-expect-error Browser ownership belongs to the consumer's runner.
  void sia.browser;
  // @ts-expect-error Temporary-file storage belongs to the Node adapter.
  createSiaTest({ backend: { ...backend, payloadStorage: { kind: "temporary-files" } } });
  return named;
}
void checkPublicTypes;
