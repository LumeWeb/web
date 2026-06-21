import { describe, it, expect } from "vitest";
import { JwtAuthManager } from "../manager";
import { ConfigurationError } from "@/errors";

describe("JwtAuthManager", () => {
  describe("constructor", () => {
    it("should accept a valid JWT token", () => {
      const manager = new JwtAuthManager("my-jwt-token");
      expect(manager).toBeDefined();
    });

    it("should throw ConfigurationError for empty string", () => {
      expect(() => new JwtAuthManager("")).toThrow(ConfigurationError);
    });

    it("should throw ConfigurationError for null/undefined", () => {
      expect(() => new JwtAuthManager(null as unknown as string)).toThrow(
        ConfigurationError,
      );
      expect(() => new JwtAuthManager(undefined as unknown as string)).toThrow(
        ConfigurationError,
      );
    });

    it("should throw ConfigurationError with descriptive message", () => {
      try {
        new JwtAuthManager("");
      } catch (e) {
        expect(e).toBeInstanceOf(ConfigurationError);
        expect((e as Error).message).toBe("JWT token is required");
      }
    });
  });

  describe("getAuthToken", () => {
    it("should return the token string", () => {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
      const manager = new JwtAuthManager(token);
      expect(manager.getAuthToken()).toBe(token);
    });
  });

  describe("getAuthHeaders", () => {
    it("should return Authorization Bearer header", () => {
      const token = "my-jwt-token";
      const manager = new JwtAuthManager(token);
      expect(manager.getAuthHeaders()).toEqual({
        Authorization: `Bearer ${token}`,
      });
    });

    it("should return a new object each call (not cached)", () => {
      const manager = new JwtAuthManager("token");
      const h1 = manager.getAuthHeaders();
      const h2 = manager.getAuthHeaders();
      expect(h1).toEqual(h2);
      expect(h1).not.toBe(h2);
    });
  });

  describe("getAccessToken", () => {
    it("should return the raw token for pinning-service-client", () => {
      const token = "raw-token-123";
      const manager = new JwtAuthManager(token);
      expect(manager.getAccessToken()).toBe(token);
    });
  });

  describe("interface compliance", () => {
    it("should satisfy the AuthManager interface", () => {
      const manager: import("../manager").AuthManager = new JwtAuthManager(
        "token",
      );
      expect(manager.getAuthToken()).toBe("token");
      expect(manager.getAuthHeaders()).toHaveProperty("Authorization");
      expect(manager.getAccessToken()).toBe("token");
    });
  });
});
