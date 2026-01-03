/**
 * Network client factory for tree-shakable HTTP abstraction
 * Automatically selects the appropriate driver based on environment
 */

import type { NetworkClient, NetworkDriver } from "./types";
import { browserClient } from "./browser";
import { nodeClient } from "./node";

let activeClient: NetworkClient | null = null;

/**
 * Get the appropriate network client for the current environment
 */
export function getNetworkClient(): NetworkClient {
  if (activeClient) {
    return activeClient;
  }

  // Try node client first (Node.js 18+)
  if (nodeClient.isAvailable()) {
    activeClient = nodeClient;
    return activeClient;
  }

  // Fall back to browser client (XHR-based)
  if (browserClient.isAvailable()) {
    activeClient = browserClient;
    return activeClient;
  }

  throw new Error("No suitable network client found for this environment");
}

/**
 * Get the active driver name
 */
export function getActiveDriver(): NetworkDriver {
  const client = getNetworkClient();
  return client.getDriverName() as NetworkDriver;
}

/**
 * Set a specific network client (for testing or manual override)
 */
export function setNetworkClient(client: NetworkClient): void {
  activeClient = client;
}

/**
 * Reset to automatic client selection
 */
export function resetNetworkClient(): void {
  activeClient = null;
}

// Re-export types
export * from "./types.js";
export { browserClient, nodeClient };
