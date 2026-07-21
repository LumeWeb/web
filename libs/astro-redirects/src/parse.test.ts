import { describe, expect, it } from "vitest";
import {
  parseRedirects,
  parseFrom,
  parseTo,
  parseStatus,
  isValidStatus,
  isAstroSupportedStatus,
} from "./parse.js";

describe("parseRedirects", () => {
  it("parses a simple redirect", () => {
    const result = parseRedirects("/old /new 301");
    expect(result).toEqual([{ from: "/old", to: "/new", status: 301 }]);
  });

  it("defaults status to 301", () => {
    const result = parseRedirects("/a /b");
    expect(result[0].status).toBe(301);
  });

  it("supports splats", () => {
    const result = parseRedirects("/docs/* /help/:splat 301");
    expect(result[0].from).toBe("/docs/*");
  });

  it("supports external URLs", () => {
    const result = parseRedirects("/ipfs https://ipfs.io 302");
    expect(result[0].to).toBe("https://ipfs.io");
  });

  it("supports IPFS-only status codes (200, 404, 410, 451)", () => {
    // Regression: parser must accept full IPFS spec, not just Astro subset
    expect(parseRedirects("/rewrite /new 200")).toEqual([
      { from: "/rewrite", to: "/new", status: 200 },
    ]);
    expect(parseRedirects("/missing /404 404")).toEqual([
      { from: "/missing", to: "/404", status: 404 },
    ]);
    expect(parseRedirects("/gone /410 410")).toEqual([
      { from: "/gone", to: "/410", status: 410 },
    ]);
    expect(parseRedirects("/legal /451 451")).toEqual([
      { from: "/legal", to: "/451", status: 451 },
    ]);
  });

  it("ignores comments and blank lines", () => {
    const input = `# comment\n\n/old /new\n`;
    const result = parseRedirects(input);
    expect(result).toHaveLength(1);
  });

  it("throws on bad status", () => {
    expect(() => parseRedirects("/a /b 500")).toThrow();
  });

  it("throws on forced redirect", () => {
    expect(() => parseRedirects("/a /b 301!")).toThrow();
  });

  it("throws when file exceeds 64 KiB in bytes", () => {
    // Regression: must measure bytes, not UTF-16 code units
    const huge = "ä".repeat(32769); // 2 bytes each = 65538 bytes
    expect(() => parseRedirects(huge)).toThrow("cannot exceed");
  });

  it("allows file at exactly 64 KiB bytes", () => {
    const exact = "/a /b\n".repeat(10922); // 6 * 10922 = 65532 bytes
    expect(() => parseRedirects(exact)).not.toThrow();
  });

  it("throws on missing 'to' path", () => {
    expect(() => parseRedirects("/only-from")).toThrow("Missing 'to'");
  });

  it("throws on too many fields", () => {
    expect(() => parseRedirects("/a /b 301 extra")).toThrow("Too many fields");
  });

  it("throws on multiple asterisks", () => {
    expect(() => parseRedirects("/*/* /b")).toThrow("at most one asterisk");
  });

  it("throws when splat is not at end", () => {
    expect(() => parseRedirects("/foo*bar /b")).toThrow("end with asterisk");
  });

  it("throws when 'from' does not start with /", () => {
    expect(() => parseRedirects("old /new")).toThrow("begin with '/'");
  });

  it("throws on invalid URL scheme in 'to'", () => {
    expect(() => parseRedirects("/a ftp://host")).toThrow("Invalid URL scheme");
  });
});

describe("parseFrom", () => {
  it("accepts valid paths", () => {
    expect(parseFrom("/old")).toBe("/old");
    expect(parseFrom("/docs/*")).toBe("/docs/*");
  });

  it("throws on missing leading slash", () => {
    expect(() => parseFrom("old")).toThrow("begin with '/'");
  });

  it("throws on multiple splats", () => {
    expect(() => parseFrom("/*/*")).toThrow("at most one asterisk");
  });

  it("throws on inline splat", () => {
    expect(() => parseFrom("/a*b")).toThrow("end with asterisk");
  });
});

describe("parseTo", () => {
  it("accepts absolute paths", () => {
    expect(parseTo("/new")).toBe("/new");
  });

  it("accepts allowed URL schemes", () => {
    expect(parseTo("https://example.com")).toBe("https://example.com");
    expect(parseTo("http://example.com")).toBe("http://example.com");
    expect(parseTo("ipfs://Qmabc")).toBe("ipfs://Qmabc");
    expect(parseTo("ipns://example")).toBe("ipns://example");
  });

  it("rejects disallowed URL schemes", () => {
    expect(() => parseTo("ftp://host")).toThrow("Invalid URL scheme");
  });
});

describe("parseStatus", () => {
  it("accepts valid IPFS status codes", () => {
    expect(parseStatus("200")).toBe(200);
    expect(parseStatus("301")).toBe(301);
    expect(parseStatus("302")).toBe(302);
    expect(parseStatus("303")).toBe(303);
    expect(parseStatus("307")).toBe(307);
    expect(parseStatus("308")).toBe(308);
    expect(parseStatus("404")).toBe(404);
    expect(parseStatus("410")).toBe(410);
    expect(parseStatus("451")).toBe(451);
  });

  it("rejects unsupported codes", () => {
    expect(() => parseStatus("500")).toThrow("Unsupported");
    expect(() => parseStatus("399")).toThrow("Unsupported");
  });

  it("rejects forced redirects", () => {
    expect(() => parseStatus("301!")).toThrow("shadowing");
  });
});

describe("isValidStatus", () => {
  it("returns true for IPFS-valid status codes", () => {
    expect(isValidStatus(200)).toBe(true);
    expect(isValidStatus(301)).toBe(true);
    expect(isValidStatus(302)).toBe(true);
    expect(isValidStatus(303)).toBe(true);
    expect(isValidStatus(307)).toBe(true);
    expect(isValidStatus(308)).toBe(true);
    expect(isValidStatus(404)).toBe(true);
    expect(isValidStatus(410)).toBe(true);
    expect(isValidStatus(451)).toBe(true);
  });

  it("returns false for unsupported status codes", () => {
    expect(isValidStatus(500)).toBe(false);
    expect(isValidStatus(201)).toBe(false);
    expect(isValidStatus(400)).toBe(false);
  });
});

describe("isAstroSupportedStatus", () => {
  it("returns true for Astro-supported 3xx codes", () => {
    expect(isAstroSupportedStatus(301)).toBe(true);
    expect(isAstroSupportedStatus(302)).toBe(true);
    expect(isAstroSupportedStatus(303)).toBe(true);
    expect(isAstroSupportedStatus(307)).toBe(true);
    expect(isAstroSupportedStatus(308)).toBe(true);
  });

  it("returns false for IPFS-only codes not supported by Astro", () => {
    expect(isAstroSupportedStatus(200)).toBe(false);
    expect(isAstroSupportedStatus(404)).toBe(false);
    expect(isAstroSupportedStatus(410)).toBe(false);
    expect(isAstroSupportedStatus(451)).toBe(false);
  });
});
