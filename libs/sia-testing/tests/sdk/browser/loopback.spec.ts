import { expect, test } from "@playwright/test";
import { createIndexdHttpServer } from "../../../src/http/index.js";

test.describe("SDK streaming service-worker loopback", () => {
  test("observes handshake, reconnect, object routing, cleanup, and reload", async ({ page }) => {
    const requests: string[] = [];
    const backend = createIndexdHttpServer({
      responseOverride: (request, response) => {
        requests.push(`${request.method} ${new URL(request.url).pathname}`);
        return response;
      },
    });
    const { port } = await backend.listen();
    try {
      await page.goto(`/index.html?indexd=${encodeURIComponent(`http://127.0.0.1:${port}`)}`);
      await expect(page.locator("#status")).toHaveText("ready");
      const first = await page.evaluate(() => window.__loopbackEvidence);
      expect(first?.bytes).toBe(0);
      expect(first?.released).toBe(true);
      expect(first?.streaming).toBe(true);
      expect(first?.handshake).toBe(true);
      expect(first?.reconnected).toBe(true);
      expect(first?.releasedStatus).toBeGreaterThanOrEqual(400);
      expect(first?.objectId).toMatch(/^[0-9a-f]{64}$/);

      const controllerBeforeReload = await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL ?? null);
      await page.reload();
      await expect(page.locator("#status")).toHaveText("ready");
      const second = await page.evaluate(() => window.__loopbackEvidence);
      const controllerAfterReload = await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL ?? null);
      expect(new URL(controllerBeforeReload!).pathname).toBe("/sia-storage-sw.js");
      expect(controllerAfterReload).toBe(controllerBeforeReload);
      expect(second?.controller).toBe(true);
      expect(second?.bytes).toBe(0);

      expect(requests.some((request) => request.startsWith("POST /auth/connect"))).toBe(true);
      expect(requests.some((request) => request.startsWith("GET /auth/connect/") && request.endsWith("/status"))).toBe(true);
      expect(requests.some((request) => request.startsWith("POST /auth/connect/") && request.endsWith("/register"))).toBe(true);
      expect(requests.filter((request) => request === "GET /account").length).toBeGreaterThanOrEqual(4);
      expect(requests.filter((request) => request === "POST /objects").length).toBeGreaterThanOrEqual(2);
      expect(requests.some((request) => request.startsWith("GET /objects/"))).toBe(true);
      expect(requests.some((request) => request === "OPTIONS /auth/connect")).toBe(false);
    } finally {
      await page.evaluate(async () => {
        await Promise.all((await navigator.serviceWorker.getRegistrations()).map((registration) => registration.unregister()));
      });
      await backend.close();
    }
  });
});
