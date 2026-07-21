import { describe, expect, it } from "vitest";
import {
  extractRedirectFromFrontmatter,
  buildFrontmatterRules,
} from "./frontmatter.js";

describe("extractRedirectFromFrontmatter", () => {
  it("extracts a single redirect_from string", () => {
    const source = `---\nredirect_from: /old\n---\n# Hello\n`;
    expect(extractRedirectFromFrontmatter(source)).toEqual({
      redirects: ["/old"],
    });
  });

  it("extracts array redirect_from", () => {
    const source = `---\nredirect_from: ["/old", "/older"]\n---\n# Hello\n`;
    expect(extractRedirectFromFrontmatter(source)).toEqual({
      redirects: ["/old", "/older"],
    });
  });

  it("returns slug and draft when present", () => {
    const source = `---\nredirect_from: /old\nslug: /custom\ndraft: true\n---\n# Hello\n`;
    expect(extractRedirectFromFrontmatter(source)).toEqual({
      redirects: ["/old"],
      slug: "/custom",
      draft: true,
    });
  });

  it("parses YAML array redirect_from", () => {
    const source = `---\nredirect_from:\n  - /old\n  - /older\n---\n# Hello\n`;
    expect(extractRedirectFromFrontmatter(source)).toEqual({
      redirects: ["/old", "/older"],
    });
  });

  it("parses JSON array redirect_from", () => {
    const source = `---\nredirect_from: ["/old", "/older"]\n---\n# Hello\n`;
    expect(extractRedirectFromFrontmatter(source)).toEqual({
      redirects: ["/old", "/older"],
    });
  });

  it("filters invalid redirect paths including empty strings", () => {
    const source = `---\nredirect_from:\n  - /valid\n  - "https://example.com"\n  - "has space"\n  - ""\n---\n# Hello\n`;
    expect(extractRedirectFromFrontmatter(source)).toEqual({
      redirects: ["/valid"],
    });
  });

  it("treats draft string 'true' as boolean true", () => {
    const source = `---\nredirect_from: /old\ndraft: true\n---\n# Hello\n`;
    expect(extractRedirectFromFrontmatter(source).draft).toBe(true);
  });

  it("handles missing redirect_from gracefully", () => {
    const source = `---\nslug: /post\n---\n# Hello\n`;
    expect(extractRedirectFromFrontmatter(source)).toEqual({
      redirects: [],
      slug: "/post",
      draft: undefined,
    });
  });

  it("skips missing frontmatter", () => {
    expect(extractRedirectFromFrontmatter("# No frontmatter\n")).toEqual({
      redirects: [],
      slug: undefined,
      draft: undefined,
    });
  });
});

describe("buildFrontmatterRules", () => {
  it("builds rules with leading slash", () => {
    const rules = buildFrontmatterRules(["/old"], "post");
    expect(rules).toEqual([{ from: "/old", to: "/post", status: 301 }]);
  });

  it("preserves existing leading slash in slug", () => {
    const rules = buildFrontmatterRules(["/old"], "/post");
    expect(rules).toEqual([{ from: "/old", to: "/post", status: 301 }]);
  });

  it("normalizes missing leading slash in redirect_from", () => {
    // Regression: frontmatter redirect_from values without leading / must be normalized
    const rules = buildFrontmatterRules(["old"], "/post");
    expect(rules).toEqual([{ from: "/old", to: "/post", status: 301 }]);
  });
});
