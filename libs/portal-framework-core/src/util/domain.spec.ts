import { beforeEach, describe, expect, it, vi } from "vitest";

import { env } from "../env";
import { getAccountSubdomain, getProtocolDomain } from "./domain";

// Mock getCurrentLocation
vi.mock("./location", () => ({
  getCurrentLocation: vi.fn(() => ({
    hostname: "admin.dev.pinner.xyz",
  })),
}));

// Mock env
vi.mock("../env", () => ({
  env: {
    VITE_PORTAL_DOMAIN_IS_ROOT: undefined,
  },
}));

describe("domain utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    env.VITE_PORTAL_DOMAIN_IS_ROOT = undefined;
  });

  describe("getProtocolDomain", () => {
    it("should combine protocol and domain", () => {
      const result = getProtocolDomain("api");
      expect(result).toBe("api.admin.dev.pinner.xyz");
    });

    it("should clean protocol strings", () => {
      const testCases = [
        { expected: "api.admin.dev.pinner.xyz", input: "api/" },
        { expected: "api.admin.dev.pinner.xyz", input: "http://api" },
        { expected: "api.admin.dev.pinner.xyz", input: "https://api" },
        { expected: ".admin.dev.pinner.xyz", input: "" },
        { expected: "api.admin.dev.pinner.xyz", input: "api." },
      ];

      testCases.forEach(({ expected, input }) => {
        expect(getProtocolDomain(input)).toBe(expected);
      });
    });

    it("should use root domain when isRootDomain is true", () => {
      env.VITE_PORTAL_DOMAIN_IS_ROOT = "true";
      const result = getProtocolDomain("account");
      expect(result).toBe("account.dev.pinner.xyz");
    });
  });

  describe("getAccountSubdomain", () => {
    it("should return current hostname when no subdomain provided", () => {
      const result = getAccountSubdomain(undefined);
      expect(result).toBe("admin.dev.pinner.xyz");
    });

    it("should return protocol domain when subdomain provided", () => {
      const result = getAccountSubdomain("account");
      expect(result).toBe("account.admin.dev.pinner.xyz");
    });

    it("should respect isRootDomain option", () => {
      const result = getAccountSubdomain("account", { isRootDomain: true });
      expect(result).toBe("account.dev.pinner.xyz");
    });
  });
});
