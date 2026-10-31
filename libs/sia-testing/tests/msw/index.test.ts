import { createServer } from "node:http";
import { once } from "node:events";
import { expect, it } from "vitest";
import { setupIndexdServer } from "../../src/msw/node.js";
import { credentials, owner } from "../fixtures/auth.js";

it("forwards response bytes without decoding them as text", async () => {
  const server = setupIndexdServer({
    baseUrl: "http://indexd.test",
    responseOverride: () =>
      new Response(new Uint8Array([0, 255, 128, 65]), { status: 202 }),
  });
  server.model.createAccount({ publicKey: owner });
  server.listen({ onUnhandledRequest: "error" });
  try {
    const response = await fetch(`http://indexd.test/account?${credentials()}`);
    expect(response.status).toBe(202);
    expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([
      0, 255, 128, 65,
    ]);
  } finally {
    server.close();
  }
});

it("leaves requests outside the configured origin to MSW's unhandled-request policy", async () => {
  let requests = 0;
  const assets = createServer((_request, response) => {
    requests++;
    response.end("asset bytes");
  });
  assets.listen(0, "127.0.0.1");
  await once(assets, "listening");
  const address = assets.address();
  if (!address || typeof address === "string")
    throw new Error("missing asset listener");
  const server = setupIndexdServer({ baseUrl: "http://indexd.test" });
  server.listen({ onUnhandledRequest: "bypass" });
  try {
    const response = await fetch(
      `http://127.0.0.1:${address.port}/module.wasm`,
    );
    expect(await response.text()).toBe("asset bytes");
    expect(requests).toBe(1);
  } finally {
    server.close();
    await new Promise<void>((resolve, reject) =>
      assets.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
