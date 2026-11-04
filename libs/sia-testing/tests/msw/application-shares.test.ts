/** MSW runs the shared grant scenarios through Fetch and its adapted request body. */
import { setupServer } from "msw/node";
import { createMockApplication } from "../../src/client.js";
import { createMockHandlers } from "../../src/msw.js";
import { shareScenarios } from "../harness/share-scenarios.js";
shareScenarios((mock, run, actor, shareGrants) => {
  const endpoint = createMockHandlers(mock, {
    baseUrl: "https://shares.example.invalid",
  });
  const server = setupServer(...endpoint.handlers);
  server.listen({ onUnhandledRequest: "error" });
  const connection = endpoint.connection({
    access: run.ownerAccess,
    as: actor,
    shareGrants,
  });
  return Promise.resolve({
    async close() {
      await endpoint.close();
      server.close();
    },
    sibling: createMockApplication(connection, connection.credential),
    writer: createMockApplication(connection, connection.credential),
  });
}, true);
import { shareWireScenarios } from "../harness/share-wire-scenarios.js";
shareWireScenarios((mock) => {
  const endpoint = createMockHandlers(mock, {
    baseUrl: "https://raw-shares.example.invalid",
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
