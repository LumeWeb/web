import { setupServer } from "msw/node";
import { createIndexdHandlers, type IndexdHandlersOptions } from "./index.js";

export interface IndexdServer extends ReturnType<typeof setupServer> {
  model: ReturnType<typeof createIndexdHandlers>["model"];
  reset(): void;
}
/** Creates an MSW node server; lifecycle remains explicit and never starts at import time. */
export function setupIndexdServer(
  options: IndexdHandlersOptions = {},
): IndexdServer {
  const configured = createIndexdHandlers(options);
  return Object.assign(setupServer(...configured.handlers), {
    model: configured.model,
    reset: () => configured.model.reset(),
  });
}
export const createIndexdServer = setupIndexdServer;
