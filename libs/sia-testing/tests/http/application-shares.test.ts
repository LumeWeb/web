/** HTTP share sessions keep application refs separate on the same connection. */
import { createMockApplication } from "../../src/client.js";
import { startMockServer } from "../../src/testing/http.js";
import { shareScenarios } from "../harness/share-scenarios.js";
shareScenarios(async (mock, run, actor, shareGrants) => {
  const server = await startMockServer(mock);
  const connection = server.connection({
    access: run.ownerAccess,
    as: actor,
    shareGrants,
  });
  return {
    close: () => server.close(),
    sibling: createMockApplication(connection, connection.credential),
    writer: createMockApplication(connection, connection.credential),
  };
}, true);
import { shareWireScenarios } from "../harness/share-wire-scenarios.js";
shareWireScenarios(startMockServer);
