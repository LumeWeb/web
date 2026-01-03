/**
 * Integration test fixture with MSW worker
 */

import { createIntTest } from "./create-int-test";
import { optionsHandler } from "./msw-handlers";

// Only pass minimal handlers at creation
// Tests will use worker.use() to add specific handlers
export const test = await createIntTest({
  handlers: [optionsHandler],
  enableLogging: false,
});
