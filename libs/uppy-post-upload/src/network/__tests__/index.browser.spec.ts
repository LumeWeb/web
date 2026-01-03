/**
 * Browser-specific tests for network client factory
 * These tests verify actual environment detection in browser
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  browserClient,
  getActiveDriver,
  getNetworkClient,
  nodeClient,
  resetNetworkClient,
} from "../index";

describe("Network client factory (Browser)", () => {
  beforeEach(() => {
    // Reset to auto-detection
    resetNetworkClient();
    vi.clearAllMocks();
  });

  describe("environment detection", () => {
    it("should return browser client in browser environment", () => {
      const client = getNetworkClient();
      expect(client.getDriverName()).toBe("browser");
    });

    it("should return active driver as browser", () => {
      const driver = getActiveDriver();
      expect(driver).toBe("browser");
    });

    it("should have browser client available", () => {
      expect(browserClient.isAvailable()).toBe(true);
    });

    it("should not have node client available in browser", () => {
      expect(nodeClient.isAvailable()).toBe(false);
    });
  });

  describe("client selection", () => {
    it("should return same client instance on subsequent calls", () => {
      const client1 = getNetworkClient();
      const client2 = getNetworkClient();
      expect(client1).toBe(client2);
    });
  });

  describe("resetNetworkClient", () => {
    it("should reset client selection", () => {
      const client1 = getNetworkClient();
      resetNetworkClient();
      const client2 = getNetworkClient();

      // Both should return the same singleton browser client
      expect(client1.getDriverName()).toBe(client2.getDriverName());
      expect(client1).toBe(client2);
    });
  });
});
