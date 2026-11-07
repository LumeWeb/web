/** Intentional runner failures expose original errors and retained-run cleanup. */
import { afterAll, test as base, expect } from "vitest";
import { createSiaTest } from "@lumeweb/sia-testing/vitest";
import { bytesFixture, type MockRun } from "@lumeweb/sia-testing/mock";

const controller = new AbortController();
const mode = process.env.SIA_LIFECYCLE_CASE;
if (mode === "already-aborted") controller.abort(new Error("external-abort"));
const test = createSiaTest({
  backend: { app: { description: "Runner failures", id: "a".repeat(64), name: "Lifecycle", serviceUrl: "https://example.invalid" }, kind: "mock" },
  ...(mode === "setup" ? { limits: { maxObjects: -1 } } : {}),
  ...(mode === "already-aborted" || mode === "external" || mode === "shared" || mode === "run-cleanup" ? { signal: controller.signal } : {}),
});
const retained: MockRun[] = [];
const recording = test.extend<{ recorded: boolean }>({
  recorded: async ({ sia }, use) => {
    retained.push(sia);
    await use(true);
    if (mode === "dependent") throw new Error("dependent-cleanup-failure");
  },
});
if (mode !== "shared") recording("subject", { timeout: 100 }, async ({ recorded, sia, skip }) => {
  expect(recorded).toBe(true);
  if (["assertion-cleanup", "cleanup", "run-cleanup"].includes(mode ?? "")) {
    const sdk = sia.mock.packedSdk({ access: sia.ownerAccess, as: sia.mock.actor("source"), maxBytes: 1, maxObjects: 1, platform: "browser" });
    let started!: () => void;
    const reading = new Promise<void>((resolve) => { started = resolve; });
    void sdk.uploadPacked().add(new ReadableStream<Uint8Array>({
      cancel() { throw new Error("owned-source-cleanup-failure"); },
      pull() { started(); },
    }, { highWaterMark: 0 })).catch(() => undefined);
    await reading;
    if (mode === "assertion-cleanup") expect("actual-marker").toBe("expected-marker");
    if (mode === "run-cleanup") controller.abort(new Error("external-abort"));
  }
  if (mode === "assertion") expect("actual-marker").toBe("expected-marker");
  if (mode === "skip") skip();
  if (mode === "timeout") await new Promise(() => undefined);
  if (mode === "external") {
    controller.abort(new Error("external-abort"));
    const reader = sia.mock.reader({ access: sia.ownerAccess, as: sia.mock.actor("cancelled") });
    await reader.objects({ limit: 1, offset: 0 });
  }
});
let started = 0;
if (mode === "shared") recording.concurrent.for(["left", "right"])("subject %s", async (_, { recorded, sia }) => {
  expect(recorded).toBe(true);
  const actor = sia.mock.actor("shared cancellation");
  const reader = sia.mock.reader({ access: sia.ownerAccess, as: actor });
  const hold = sia.mock.faults.hold({ actor, operation: "objects" });
  const reading = reader.objects({ limit: 1, offset: 0 });
  const rejected = expect(reading).rejects.toBeDefined();
  await hold.started();
  if (++started === 2) controller.abort(new Error("external-abort"));
  await rejected;
  await reader.close();
});
base("retained run is closed", async () => {
  expect(retained.length).toBe(["already-aborted", "setup"].includes(mode ?? "") ? 0 : mode === "shared" ? 2 : 1);
  for (const run of retained) {
    const file = await bytesFixture({ bytes: Uint8Array.of(1), name: "closed" });
    await expect(run.objects.upload({ file, metadata: new Uint8Array() })).rejects.toMatchObject({ code: "closed" });
  }
});
afterAll(() => expect(retained.length).toBe(["already-aborted", "setup"].includes(mode ?? "") ? 0 : mode === "shared" ? 2 : 1));
