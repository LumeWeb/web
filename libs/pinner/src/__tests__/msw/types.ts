import type { RequestHandler } from "msw";

/** Function to reset all mutable state in a handler store */
export type ResetFunction = () => void;

/** A handler store that exposes MSW handlers and a reset function */
export interface StatefulHandlerStore {
  /** Get the current MSW handlers for this store */
  getHandlers(): RequestHandler[];
  /** Reset all mutable state to defaults */
  reset(): void;
}

/** Options for creating a stateful handler store */
export interface StatefulStoreOptions {
  /** Base URL for the API (e.g., "https://test.pinner.xyz/api") */
  baseUrl: string;
}
