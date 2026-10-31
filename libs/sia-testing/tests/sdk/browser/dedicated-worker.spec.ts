import { expect, test } from "@playwright/test";
import type {} from "../app/main.js";

interface WorkerEvidence {
  accountKey?: string;
  error?: string;
  fetchedId?: string;
  objectId?: string;
  ok: boolean;
  requestKey?: string;
}

test.describe("dedicated worker SDK boundary", () => {
  test("pins and gets through the emulator with the worker account", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#status")).toHaveText("ready");

    try {
      const evidence = await page.evaluate(async () => {
        const before = window.__emulatorRequests.length;
        const script = new URL("/dedicated-worker.js", location.origin);
        const dedicated = new Worker(script);
        try {
          const value = await new Promise<WorkerEvidence>((resolve) => {
            dedicated.onmessage = (event: MessageEvent<WorkerEvidence>) => resolve(event.data);
            dedicated.onerror = (event) => resolve({ error: `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`, ok: false });
            dedicated.postMessage({});
          });
          return { observed: window.__emulatorRequests.slice(before), value };
        } finally {
          dedicated.terminate();
        }
      });
      expect(evidence.value.ok, evidence.value.error).toBe(true);
      expect(evidence.value.objectId).toBe(evidence.value.fetchedId);
      const workerRequests = evidence.observed.filter(({ path }) => path === "/account" || path.startsWith("/objects"));
      expect(workerRequests.length).toBeGreaterThan(0);
      for (const request of workerRequests) {
        expect(request.account, `${request.path} did not carry the worker registration key`).toBe(evidence.value.requestKey);
      }
    } finally {
      await page.evaluate(async () => {
        window.__stopEmulator();
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      });
    }
  });
});
