import { describe, expect, it, vi, beforeEach } from "vitest";
import { Sdk } from "@/sdk";
import { AccountApi } from "@/account";

describe("Sdk", () => {
  let sdk: Sdk;

  beforeEach(() => {
    sdk = new Sdk("https://test.com");
  });

  describe("constructor", () => {
    it("should create SDK instance with API URL", () => {
      expect(sdk).toBeInstanceOf(Sdk);
    });

    it("should throw error when API URL is empty", () => {
      expect(() => new Sdk("")).toThrow("API URL is required");
    });

    it("should throw error when API URL is undefined", () => {
      expect(() => new Sdk(undefined as any)).toThrow("API URL is required");
    });

    it("should throw error when API URL is null", () => {
      expect(() => new Sdk(null as any)).toThrow("API URL is required");
    });

    it("should throw error when API URL is whitespace", () => {
      expect(() => new Sdk("   ")).toThrow();
    });
  });

  describe("account", () => {
    it("should return AccountApi instance", () => {
      const accountApi = sdk.account();
      expect(accountApi).toBeInstanceOf(AccountApi);
    });

    it("should return same AccountApi instance on multiple calls", () => {
      const account1 = sdk.account();
      const account2 = sdk.account();
      expect(account1).toBe(account2);
    });
  });

  describe("setAuthToken", () => {
    it("should set JWT token on AccountApi", () => {
      sdk.setAuthToken("test-jwt-token");
      const accountApi = sdk.account() as any;
      expect(accountApi._jwtToken).toBe("test-jwt-token");
    });

    it("should overwrite existing token", () => {
      sdk.setAuthToken("first-token");
      sdk.setAuthToken("second-token");
      const accountApi = sdk.account() as any;
      expect(accountApi._jwtToken).toBe("second-token");
    });

    it("should handle empty string token", () => {
      sdk.setAuthToken("some-token");
      sdk.setAuthToken("");
      const accountApi = sdk.account() as any;
      expect(accountApi._jwtToken).toBe("");
    });
  });

  describe("integration with AccountApi", () => {
    it("should share token between SDK and AccountApi", () => {
      const token = "shared-token-123";
      sdk.setAuthToken(token);
      const accountApi = sdk.account() as any;
      expect(accountApi._jwtToken).toBe(token);
    });

    it("should initialize AccountApi with correct URL", () => {
      sdk = new Sdk("https://api.example.com");
      const accountApi = sdk.account() as any;
      expect(accountApi.apiUrl).toContain("account.api.example.com");
    });
  });
});
