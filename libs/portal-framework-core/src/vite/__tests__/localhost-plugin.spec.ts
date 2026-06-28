import type { HtmlTagDescriptor } from "vite";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { localhostAccessPlugin } from "../localhost-plugin";

function callTransformIndexHtml(plugin: ReturnType<typeof localhostAccessPlugin>, html = "") {
  return (plugin.transformIndexHtml as (html: string) => HtmlTagDescriptor[] | { html: string; tags: HtmlTagDescriptor[] })(html);
}

describe("localhostAccessPlugin", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns a Vite plugin with correct name", () => {
    const plugin = localhostAccessPlugin();
    expect(plugin.name).toBe("localhost-access-plugin");
  });

  it("transformIndexHtml returns empty array when no env vars set", () => {
    const plugin = localhostAccessPlugin();
    const result = callTransformIndexHtml(plugin);
    expect(result).toEqual([]);
  });

  it("returns VITE_PORTAL_ALLOW_LOCALHOST script when env var is set", () => {
    vi.stubEnv("VITE_PORTAL_ALLOW_LOCALHOST", "true");
    const plugin = localhostAccessPlugin();
    const result = callTransformIndexHtml(plugin);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      attrs: { type: "text/javascript" },
      children: "window.VITE_PORTAL_ALLOW_LOCALHOST = true;",
      injectTo: "head-prepend",
      tag: "script",
    });
  });

  it("VITE_PORTAL_DOMAIN_IS_ROOT='true' injects boolean true", () => {
    vi.stubEnv("VITE_PORTAL_DOMAIN_IS_ROOT", "true");
    const plugin = localhostAccessPlugin();
    const result = callTransformIndexHtml(plugin);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      attrs: { type: "text/javascript" },
      children: "window.VITE_PORTAL_DOMAIN_IS_ROOT = true;",
      injectTo: "head-prepend",
      tag: "script",
    });
  });

  it("VITE_PORTAL_DOMAIN_IS_ROOT='false' injects boolean false", () => {
    vi.stubEnv("VITE_PORTAL_DOMAIN_IS_ROOT", "false");
    const plugin = localhostAccessPlugin();
    const result = callTransformIndexHtml(plugin);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      attrs: { type: "text/javascript" },
      children: "window.VITE_PORTAL_DOMAIN_IS_ROOT = false;",
      injectTo: "head-prepend",
      tag: "script",
    });
  });

  it("VITE_PORTAL_DOMAIN_IS_ROOT with arbitrary value coerces to boolean false", () => {
    vi.stubEnv("VITE_PORTAL_DOMAIN_IS_ROOT", "1");
    const plugin = localhostAccessPlugin();
    const result = callTransformIndexHtml(plugin);

    expect(result).toHaveLength(1);
    expect(result[0].children).toBe(
      "window.VITE_PORTAL_DOMAIN_IS_ROOT = false;",
    );
  });

  it("returns both scripts when both env vars are set", () => {
    vi.stubEnv("VITE_PORTAL_ALLOW_LOCALHOST", "true");
    vi.stubEnv("VITE_PORTAL_DOMAIN_IS_ROOT", "true");
    const plugin = localhostAccessPlugin();
    const result = callTransformIndexHtml(plugin);

    expect(result).toHaveLength(2);
  });

  it("scripts have correct injectTo: 'head-prepend'", () => {
    vi.stubEnv("VITE_PORTAL_ALLOW_LOCALHOST", "true");
    vi.stubEnv("VITE_PORTAL_DOMAIN_IS_ROOT", "true");
    const plugin = localhostAccessPlugin();
    const result = callTransformIndexHtml(plugin);

    for (const script of result) {
      expect(script.injectTo).toBe("head-prepend");
    }
  });

  it("scripts have correct tag: 'script'", () => {
    vi.stubEnv("VITE_PORTAL_ALLOW_LOCALHOST", "true");
    vi.stubEnv("VITE_PORTAL_DOMAIN_IS_ROOT", "true");
    const plugin = localhostAccessPlugin();
    const result = callTransformIndexHtml(plugin);

    for (const script of result) {
      expect(script.tag).toBe("script");
    }
  });

  it("replaces favicon href when brand.faviconUrl is set", () => {
    const html =
      '<link rel="icon" type="image/svg+xml" href="/favicon.svg" />';
    vi.stubEnv(
      "VITE_PORTAL_BRAND",
      JSON.stringify({ faviconUrl: "/custom-favicon.png" }),
    );
    const plugin = localhostAccessPlugin();
    const result = callTransformIndexHtml(plugin, html);

    expect(result).toHaveProperty("html");
    expect((result as { html: string }).html).toContain(
      'href="/custom-favicon.png"',
    );
    expect((result as { html: string }).html).not.toContain(
      "/favicon.svg",
    );
  });

  it("replaces both logo and favicon when both are set", () => {
    const html =
      '<link rel="icon" type="image/svg+xml" href="/favicon.svg" /><div data-loader-logo></div>';
    vi.stubEnv(
      "VITE_PORTAL_BRAND",
      JSON.stringify({
        faviconUrl: "/custom-favicon.png",
        logoUrl: "/logo.png",
      }),
    );
    const plugin = localhostAccessPlugin();
    const result = callTransformIndexHtml(plugin, html);

    expect(result).toHaveProperty("html");
    const html2 = (result as { html: string }).html;
    expect(html2).toContain('href="/custom-favicon.png"');
    expect(html2).toContain('src="/logo.png"');
  });

  it("does not modify favicon when brand.faviconUrl is not set", () => {
    const html =
      '<link rel="icon" type="image/svg+xml" href="/favicon.svg" />';
    vi.stubEnv("VITE_PORTAL_BRAND", JSON.stringify({}));
    const plugin = localhostAccessPlugin();
    const result = callTransformIndexHtml(plugin, html);

    // No html modifications, only tags returned
    expect(Array.isArray(result)).toBe(true);
  });
});
