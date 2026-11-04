/** Strict Node MSW adapts body acknowledgement loss to a Fetch failure. */
import { setupServer } from "msw/node";
import { createMockHandlers } from "../../src/msw.js";
import { uploadWireScenarios } from "../harness/upload-wire-scenarios.js";
uploadWireScenarios((mock) => {
  const endpoint = createMockHandlers(mock, {
    baseUrl: "https://upload-loss.example.invalid",
  });
  const server = setupServer(...endpoint.handlers);
  server.listen({ onUnhandledRequest: "error" });
  return Promise.resolve({
    ...endpoint,
    async close() {
      await endpoint.close();
      server.close();
    },
  });
});
