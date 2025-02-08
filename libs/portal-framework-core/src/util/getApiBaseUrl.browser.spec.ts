import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resetCurrentLocation, setCurrentLocation } from "./location";

// Mock the env module at the top level
vi.mock("../env", () => ({
  env: {
    VITE_PORTAL_DOMAIN: "example.com",
    VITE_PORTAL_DOMAIN_IS_ROOT: "",
  },
}));

describe("getApiBaseUrl", () => {
  let getApiBaseUrl: typeof import("./getApiBaseUrl").getApiBaseUrl;
  let normalizeUrl: typeof import("./getApiBaseUrl").normalizeUrl;
  let env: typeof import("../env").env;

  beforeEach(async () => {
    vi.resetModules();
    vi.unstubAllGlobals();

    // Import modules after reset
    const getApiBaseUrlModule = await import("./getApiBaseUrl");
    getApiBaseUrl = getApiBaseUrlModule.getApiBaseUrl;
    normalizeUrl = getApiBaseUrlModule.normalizeUrl;
    env = (await import("../env")).env;
  });

  afterEach(() => {
    resetCurrentLocation();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("should handle localhost with allowLocalhost", () => {
    setCurrentLocation({
      hostname: "localhost",
      href: "http://localhost:3000/dashboard",
      pathname: "/dashboard",
      port: "3000",
      protocol: "http:",
    });
    expect(getApiBaseUrl({ allowLocalhost: true })).toBe(
      "http://localhost:3000",
    );
  });

  it("should reject localhost without allowLocalhost", () => {
    setCurrentLocation({
      hostname: "localhost",
      href: "https://localhost:3000",
      port: "3000",
      protocol: "http:",
    });
    expect(getApiBaseUrl()).toBe(false);
  });

  it("should handle root domain when explicit preserveSubdomain = true", () => {
    setCurrentLocation({
      hostname: "sub.domain.example.com",
      href: "https://sub.domain.example.com/dashboard",
      pathname: "/dashboard",
      protocol: "https:",
    });

    vi.spyOn(env, "VITE_PORTAL_DOMAIN_IS_ROOT", "get").mockReturnValue("true");
    expect(getApiBaseUrl({ preserveSubdomain: true })).toBe(
      "https://sub.domain.example.com",
    );
  });

  it("should handle IP addresses", () => {
    setCurrentLocation({
      hostname: "192.168.1.1",
      href: "https://192.168.1.1:8080/app",
      pathname: "/app",
      port: "8080",
      protocol: "https:",
    });
    vi.spyOn(env, "VITE_PORTAL_DOMAIN_IS_ROOT", "get").mockReturnValue("true");
    expect(getApiBaseUrl()).toBe("https://192.168.1.1:8080");
  });

  it("should handle root domain detection from subdomain (default behavior)", () => {
    setCurrentLocation({
      hostname: "app.staging.example.com",
      href: "https://app.staging.example.com",
      protocol: "https:",
    });
    expect(getApiBaseUrl()).toBe("https://example.com");
  });

  it("should force HTTPS for non-local domains", () => {
    setCurrentLocation({
      hostname: "example.com",
      href: "http://example.com",
      protocol: "http:",
    });
    vi.spyOn(env, "VITE_PORTAL_DOMAIN_IS_ROOT", "get").mockReturnValue("true");
    expect(getApiBaseUrl()).toBe("https://example.com");
  });

  it("should preserve subdomain if VITE_PORTAL_DOMAIN_IS_ROOT env var is 'true'", () => {
    setCurrentLocation({
      hostname: "sub.example.com",
      href: "https://sub.example.com",
      protocol: "https:",
    });

    vi.spyOn(env, "VITE_PORTAL_DOMAIN_IS_ROOT", "get").mockReturnValue("true");
    expect(getApiBaseUrl()).toBe("https://sub.example.com");
  });

  it("should normalize URLs correctly", () => {
    const tests = [
      { input: "http://example.com:8080", output: "https://example.com:8080" },
      { input: "https://example.com/", output: "https://example.com" },
      { input: "localhost:3000", output: "http://localhost:3000" },
      { input: "http://localhost:8080", output: "http://localhost:8080" },
      { input: "192.168.1.1:3000", output: "http://192.168.1.1:3000" },
      { input: "http://example.com:80", output: "https://example.com" },
      { input: "https://example.com:443", output: "https://example.com" },
    ];

    tests.forEach(({ input, output }) => {
      expect(normalizeUrl(input)).toBe(output);
    });
  });
});
