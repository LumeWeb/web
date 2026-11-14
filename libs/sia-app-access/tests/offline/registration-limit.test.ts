/** A local indexer response checks the released WASM error before the adapter classifies it. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { test } from "node:test";
import { RegistrationLimitError } from "@/index";

void test(
  "the released SDK's exhausted-key reply reaches the adapter as a definite rejection",
  { timeout: 30000 },
  async (t) => {
    const wasm = await import("@siafoundation/sia-storage/wasm");
    const bytes = await readFile(
      new URL(
        import.meta
          .resolve("@siafoundation/sia-storage/wasm/sia_storage_wasm_bg.wasm"),
      ),
    );
    await wasm.default({ module_or_path: new Uint8Array(bytes) });

    const server = createServer((request, response) => {
      const origin = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
      if (request.url?.startsWith("/auth/connect/req/register")) {
        response.writeHead(403, {
          "content-type": "text/plain; charset=utf-8",
        });
        response.end("key has no remaining uses\n");
      } else if (request.url?.startsWith("/auth/connect/req/status")) {
        response.setHeader("content-type", "application/json");
        response.end(
          JSON.stringify({
            approved: true,
            reconnecting: false,
            userSecret:
              "cf02d945fe4bfe614d823dc13c19aa8501699e656d0f7915490c3056d5c97dc6",
          }),
        );
      } else if (request.url?.startsWith("/auth/connect")) {
        response.setHeader("content-type", "application/json");
        response.end(
          JSON.stringify({
            expiration: "2030-01-01T00:00:00Z",
            registerURL: `${origin}/auth/connect/req/register`,
            responseURL: `${origin}/approval`,
            statusURL: `${origin}/auth/connect/req/status`,
          }),
        );
      } else {
        response.writeHead(404);
        response.end();
      }
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    t.after(
      () => new Promise<void>((resolve) => server.close(() => resolve())),
    );
    const indexerUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
    const application = {
      appId: "0e90d697f5045a6593f1c43ebf79a369e2bc72cc5c7b6282f3b5aeb0de6e4005",
      description: "A test application",
      name: "test-app",
      serviceUrl: "https://test-app.com",
    };
    const phrase =
      "bleak style know actor budget endorse dream ketchup material index actual wide";
    const builder = new wasm.Builder(indexerUrl, {
      ...application,
      callbackUrl: undefined,
      logoUrl: undefined,
    });
    try {
      await builder.requestConnection();
      await builder.waitForApproval();
      await assert.rejects(builder.register(phrase), (error: unknown) => {
        assert.equal(
          (error as Error).message,
          "client error: indexd responded with an error: 403 Forbidden: key has no remaining uses\n",
        );
        return true;
      });
    } finally {
      builder.free();
    }

    const { createSiaAdapter } = await import("@/sia");
    const connection = await createSiaAdapter().begin(
      { appId: application.appId, indexerUrl },
      application,
    );
    try {
      await connection.waitForApproval();
      await assert.rejects(connection.register(phrase), RegistrationLimitError);
    } finally {
      await connection.dispose();
    }
  },
);
