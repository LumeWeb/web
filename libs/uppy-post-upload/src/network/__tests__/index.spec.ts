/**
 * Unit tests for network client factory
 * These tests use mocks and don't rely on actual environment detection
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  browserClient,
  getNetworkClient,
  nodeClient,
  resetNetworkClient,
  setNetworkClient,
} from "../index";

describe("Network client factory", () => {
  beforeEach(() => {
    resetNetworkClient();
  });

  describe("getNetworkClient", () => {
    it("should return a network client", () => {
      // Set up a client for the test
      vi.spyOn(nodeClient, "isAvailable").mockReturnValue(true);
      const client = getNetworkClient();
      expect(client).toBeDefined();
      expect(client.isAvailable).toBeInstanceOf(Function);
      expect(client.request).toBeInstanceOf(Function);
      expect(client.getDriverName).toBeInstanceOf(Function);
    });

    it("should return the same client instance on subsequent calls", () => {
      vi.spyOn(nodeClient, "isAvailable").mockReturnValue(true);
      resetNetworkClient();
      const client1 = getNetworkClient();
      const client2 = getNetworkClient();

      expect(client1).toBe(client2);
    });

    it("should prefer node client when available", () => {
      vi.spyOn(nodeClient, "isAvailable").mockReturnValue(true);
      vi.spyOn(browserClient, "isAvailable").mockReturnValue(false);

      resetNetworkClient();
      const client = getNetworkClient();

      expect(client.getDriverName()).toBe("node");
    });

    it("should fall back to browser client when node is not available", () => {
      vi.spyOn(nodeClient, "isAvailable").mockReturnValue(false);
      vi.spyOn(browserClient, "isAvailable").mockReturnValue(true);

      resetNetworkClient();
      const client = getNetworkClient();

      expect(client.getDriverName()).toBe("browser");
    });

    it("should throw when no client is available", () => {
      vi.spyOn(nodeClient, "isAvailable").mockReturnValue(false);
      vi.spyOn(browserClient, "isAvailable").mockReturnValue(false);

      resetNetworkClient();

      expect(() => getNetworkClient()).toThrow(
        "No suitable network client found for this environment",
      );
    });
  });

  describe("setNetworkClient", () => {
    it("should set a custom network client", () => {
      const mockClient = {
        isAvailable: () => true,
        request: vi.fn(),
        getDriverName: () => "custom",
      };

      setNetworkClient(mockClient as any);
      const client = getNetworkClient();

      expect(client.getDriverName()).toBe("custom");
    });

    it("should override automatic client selection", () => {
      // Clear any existing mock calls
      vi.clearAllMocks();
      vi.spyOn(nodeClient, "isAvailable").mockReturnValue(true);

      const mockClient = {
        isAvailable: () => true,
        request: vi.fn(),
        getDriverName: () => "custom",
      };

      setNetworkClient(mockClient as any);
      const client = getNetworkClient();

      expect(client.getDriverName()).toBe("custom");
      expect(nodeClient.isAvailable).not.toHaveBeenCalled();
    });

    it("should return the same custom client on subsequent calls", () => {
      const mockClient = {
        isAvailable: () => true,
        request: vi.fn(),
        getDriverName: () => "custom",
      };

      setNetworkClient(mockClient as any);
      const client1 = getNetworkClient();
      const client2 = getNetworkClient();

      expect(client1).toBe(client2);
    });
  });

  describe("resetNetworkClient", () => {
    it("should reset to automatic client selection", () => {
      const mockClient = {
        isAvailable: () => true,
        request: vi.fn(),
        getDriverName: () => "custom",
      };

      setNetworkClient(mockClient as any);
      expect(getNetworkClient().getDriverName()).toBe("custom");

      vi.spyOn(nodeClient, "isAvailable").mockReturnValue(true);
      resetNetworkClient();
      const client = getNetworkClient();

      expect(client.getDriverName()).not.toBe("custom");
    });

    it("should allow re-selection of client after reset", () => {
      vi.spyOn(nodeClient, "isAvailable").mockReturnValue(true);

      const mockClient = {
        isAvailable: () => true,
        request: vi.fn(),
        getDriverName: () => "custom",
      };

      setNetworkClient(mockClient as any);
      resetNetworkClient();

      const client = getNetworkClient();
      expect(client.getDriverName()).toBe("node");
    });
  });

  describe("client isolation", () => {
    it("should maintain separate state between set and reset", () => {
      const mockClient1 = {
        isAvailable: () => true,
        request: vi.fn(),
        getDriverName: () => "custom1",
      };

      const mockClient2 = {
        isAvailable: () => true,
        request: vi.fn(),
        getDriverName: () => "custom2",
      };

      setNetworkClient(mockClient1 as any);
      expect(getNetworkClient().getDriverName()).toBe("custom1");

      setNetworkClient(mockClient2 as any);
      expect(getNetworkClient().getDriverName()).toBe("custom2");

      vi.spyOn(nodeClient, "isAvailable").mockReturnValue(true);
      resetNetworkClient();
      expect(getNetworkClient().getDriverName()).not.toBe("custom2");
    });
  });
});
