import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PortalMeta } from "../types/portal";

import {
  __test_clearCache,
  fetchPortalMeta,
  getPluginMeta,
} from "./portalMeta";

const mockMeta: PortalMeta = {
  domain: "example.com",
  feature_flags: {},
  plugins: {
    "other-plugin": {
      meta: {
        active: false,
      },
      web_bundles: [],
    },
    "test-plugin": {
      meta: {
        settings: {
          enabled: true,
          nested: {
            value: "deep",
          },
        },
        version: "1.0.0",
      },
      web_bundles: [],
    },
  },
};

describe("portalMeta utilities", () => {
  beforeEach(async () => {
    vi.stubGlobal("fetch", vi.fn());
    await __test_clearCache();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("fetchPortalMeta", () => {
    it("fetches meta from API endpoint", async () => {
      vi.mocked(fetch).mockResolvedValue({
        json: () => Promise.resolve(mockMeta),
        ok: true,
      } as Response);

      const result = await fetchPortalMeta("https://api.example.com");
      expect(result).toEqual(mockMeta);
      expect(fetch).toHaveBeenCalledWith("https://api.example.com/api/meta");
    });

    it("throws on network errors", async () => {
      vi.mocked(fetch).mockRejectedValue(new Error("Network error"));
      await expect(fetchPortalMeta("https://example.com")).rejects.toThrow(
        "Network error",
      );
    });

    it("throws on HTTP errors", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      } as Response);

      await expect(fetchPortalMeta("https://example.com")).rejects.toThrow(
        "HTTP error! status: 404",
      );
    });

    it("throws on invalid response format", async () => {
      vi.mocked(fetch).mockResolvedValue({
        json: () => Promise.resolve({}),
        ok: true,
      } as Response);

      await expect(fetchPortalMeta("https://example.com")).rejects.toThrow(
        "Response does not contain required 'domain' property",
      );
    });

    it("memoizes requests", async () => {
      vi.mocked(fetch).mockResolvedValue({
        json: () => Promise.resolve(mockMeta),
        ok: true,
      } as Response);

      await fetchPortalMeta("https://example.com");
      await fetchPortalMeta("https://example.com");

      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("getPluginMeta", () => {
    it("should return undefined for undefined meta", () => {
      expect(getPluginMeta(undefined, "test-plugin")).toBeUndefined();
    });

    it("should return undefined for missing plugin", () => {
      expect(getPluginMeta(mockMeta, "non-existent-plugin")).toBeUndefined();
    });

    it("should return full plugin meta when no key is provided", () => {
      const result = getPluginMeta(mockMeta, "test-plugin");
      expect(result).toEqual({
        settings: {
          enabled: true,
          nested: {
            value: "deep",
          },
        },
        version: "1.0.0",
      });
    });

    it("should return specific property when key is provided", () => {
      const result = getPluginMeta(mockMeta, "test-plugin", "version");
      expect(result).toBe("1.0.0");
    });

    it("should return nested property when path is provided", () => {
      const result = getPluginMeta(
        mockMeta,
        "test-plugin",
        "settings.nested.value",
      );
      expect(result).toBe("deep");
    });

    it("should return undefined for invalid nested path", () => {
      const result = getPluginMeta(
        mockMeta,
        "test-plugin",
        "settings.invalid.path",
      );
      expect(result).toBeUndefined();
    });

    it("should return undefined when path starts from non-object", () => {
      const result = getPluginMeta(mockMeta, "test-plugin", "version.invalid");
      expect(result).toBeUndefined();
    });

    it("should maintain type safety with generic type", () => {
      const result = getPluginMeta<{ version: string }>(
        mockMeta,
        "test-plugin",
      );
      expect(result?.version).toBe("1.0.0");

      const nestedResult = getPluginMeta<boolean>(
        mockMeta,
        "test-plugin",
        "settings.enabled",
      );
      expect(nestedResult).toBe(true);
    });

    it("should handle empty plugin meta", () => {
      const emptyMeta: PortalMeta = {
        domain: "example.com",
        feature_flags: {},
        plugins: {
          "empty-plugin": {
            meta: {},
            web_bundles: [],
          },
        },
      };
      expect(getPluginMeta(emptyMeta, "empty-plugin")).toEqual({});
    });
  });
});
