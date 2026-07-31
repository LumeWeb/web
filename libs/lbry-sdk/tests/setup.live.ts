/**
 * Setup for live API tests — NO MSW, real network calls to mempool.lbry.org.
 *
 * Runs in the browser context alongside tests. We guard process.env access
 * because `process` is not defined in the browser. The mnemonic is read
 * from import.meta.env (stubbed by vitest on the server side via vi.stubEnv).
 */
import { vi } from "vitest";

// vi.stubEnv works in both Node and browser contexts — it sets import.meta.env
// Vitest handles the server-to-browser env transfer internally.
// No process.env access needed here.
