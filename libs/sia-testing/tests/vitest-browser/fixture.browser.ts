/** The exported factory must work without Node storage or Playwright Test in the browser. */
import { afterAll, expect } from "vitest";
import { createSiaTest } from "@lumeweb/sia-testing/vitest";
import { bytesFixture, type MockRun } from "@lumeweb/sia-testing/mock";
const test = createSiaTest({ backend: { app: {
  description: "Portable fixture", id: "a".repeat(64), name: "Browser",
  serviceUrl: "https://example.invalid",
}, kind: "mock" } });
const retained: MockRun[] = [];
const extended = test.extend<{ label: string }>({ label: async ({ sia }, use) => {
  retained.push(sia);
  await use("browser");
} });
extended.concurrent.for(["left", "right"])("isolates %s", async (_, { label, sia }) => {
  expect(label).toBe("browser");
  const file = await bytesFixture({ bytes: Uint8Array.of(7), name: "one" });
  const object = await sia.objects.upload({ file, metadata: new Uint8Array() });
  const reader = sia.mock.reader({ access: sia.ownerAccess, as: sia.mock.actor(label) });
  try {
    expect((await reader.objects({ limit: 10, offset: 0 })).objects.map(item => item.id)).toEqual([object.id]);
    const hold = sia.mock.faults.hold({ object, operation: "object" });
    const controller = new AbortController();
    const pending = reader.object(object.id, { signal: controller.signal });
    const rejected = expect(pending).rejects.toBeDefined();
    await hold.started();
    controller.abort();
    await rejected;
  } finally { await reader.close(); }
});
afterAll(async () => {
  expect(retained).toHaveLength(2);
  expect(retained[0]).not.toBe(retained[1]);
  for (const run of retained) {
    const file = await bytesFixture({ bytes: Uint8Array.of(1), name: "closed" });
    await expect(run.objects.upload({ file, metadata: new Uint8Array() })).rejects.toMatchObject({ code: "closed" });
  }
});
