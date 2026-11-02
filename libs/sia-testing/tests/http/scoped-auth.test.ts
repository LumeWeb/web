/** Browser auth requests and Node approvals must share one run-owned account state. */
import { expect, it } from "vitest";
import { createMockSia } from "../../src/testing/mock.js";
import { mockCredential, startMockServer } from "../../src/testing/http.js";
import { createMockAuth } from "../../src/testing/auth-client.js";

const app = {
  description: "Auth test",
  id: "a".repeat(64),
  name: "Auth",
  serviceUrl: "https://example.invalid",
};
it("an owner can reconnect without gaining registration authority", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const server = await startMockServer(mock);
      try {
        const credential = mockCredential(mock, run.ownerAccess);
        const auth = createMockAuth(
          server.connection({
            access: run.ownerAccess,
            as: mock.actor("owner"),
          }),
          credential,
        );
        expect(await auth.connected(credential.keyHex)).toEqual(credential);
        await expect(auth.requestConnection(app)).rejects.toMatchObject({
          code: "denied",
        });
        await auth.close();
      } finally {
        await server.close();
      }
    });
  } finally {
    await mock.close();
  }
});

it("approval registers a phrase and reconnects with its acknowledged key", async () => {
  const module = { createMockAuth };
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const server = await startMockServer(mock);
      try {
        const auth = module.createMockAuth(
          server.connection({
            access: run.auth.registrationAccess,
            as: mock.actor("login"),
          }),
          mockCredential(mock, run.auth.registrationAccess),
        );
        const request = await auth.requestConnection(app);
        await expect(
          auth.register(request, "wrong phrase"),
        ).rejects.toMatchObject({ code: "denied" });
        await run.auth.approve(request.responseUrl);
        await auth.waitForApproval(request);
        const key = await auth.register(request, run.auth.fixturePhrase);
        expect(await auth.connected(key.keyHex)).toEqual(key);
        const denied = await auth.requestConnection(app);
        await run.auth.deny(denied.responseUrl);
        await expect(auth.waitForApproval(denied)).rejects.toMatchObject({
          code: "denied",
        });
        await auth.close();
      } finally {
        await server.close();
      }
    });
  } finally {
    await mock.close();
  }
});
