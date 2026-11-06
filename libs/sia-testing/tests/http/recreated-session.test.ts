/** Loopback Fetch clients reconcile IDs through the existing authorized read routes. */
import { createMockApplication, createMockReader } from "../../src/client.js";
import { startMockServer } from "../../src/http.js";
import { recreatedSessionScenarios } from "../harness/recreated-session-scenarios.js";

recreatedSessionScenarios(async (mock, run) => {
  const server = await startMockServer(mock);
  return {
    application(as) {
      const connection = server.connection({ access: run.ownerAccess, as });
      return createMockApplication(connection, connection.credential);
    },
    close: () => server.close(),
    reader(as) {
      const connection = server.connection({ access: run.ownerAccess, as });
      return createMockReader(connection, connection.credential);
    },
  };
}, true);
