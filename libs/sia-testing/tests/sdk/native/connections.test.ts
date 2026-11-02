/** The installed SDK must report a denied loopback request as user rejection. */
import { expect, test } from "vitest";
import { createIndexdHttpServer } from "../../../src/http/index.js";

test("the native SDK reports user rejection after a connection is denied", async () => {
  const binding = await import("@siafoundation/sia-storage");
  await binding.initSia();
  const server = createIndexdHttpServer();
  try {
    const { port } = await server.listen();
    const builder = new binding.Builder(`http://127.0.0.1:${port}`, {
      description: "Local denial fixture",
      id: Buffer.alloc(32),
      name: "Denied connection",
      serviceUrl: "https://example.invalid",
    });
    await builder.requestConnection();
    const response = await fetch(builder.responseUrl(), {
      body: JSON.stringify({ approve: false }),
      headers: { authorization: "Basic dGVzdDp0ZXN0" },
      method: "POST",
    });
    expect(response.status).toBe(204);
    await expect(builder.waitForApproval()).rejects.toThrow(/user rejected/i);
    expect(server.model.snapshot().accounts).toEqual([]);
  } finally {
    await server.close();
    server.model.reset();
  }
});
