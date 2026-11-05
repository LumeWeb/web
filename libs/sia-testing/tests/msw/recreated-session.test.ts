/** Node MSW reuses the retained backend without a browser-worker claim. */
import { setupServer } from "msw/node";
import { createMockApplication, createMockReader } from "../../src/client.js";
import { createMockHandlers } from "../../src/msw.js";
import { recreatedSessionScenarios } from "../harness/recreated-session-scenarios.js";

recreatedSessionScenarios((mock, run) => {
  const endpoint = createMockHandlers(mock, {
    baseUrl: "https://recreated.example.invalid/",
  });
  const server = setupServer(...endpoint.handlers);
  server.listen({ onUnhandledRequest: "error" });
  return Promise.resolve({
    application(as) {
      const connection = endpoint.connection({ access: run.ownerAccess, as });
      return createMockApplication(connection, connection.credential);
    },
    async close() {
      try {
        await endpoint.close();
      } finally {
        server.close();
      }
    },
    reader(as) {
      const connection = endpoint.connection({ access: run.ownerAccess, as });
      return createMockReader(connection, connection.credential);
    },
  });
}, true);
