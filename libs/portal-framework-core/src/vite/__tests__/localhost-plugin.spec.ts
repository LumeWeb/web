import type { HtmlTagDescriptor } from "vite";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { localhostAccessPlugin } from "../localhost-plugin";

/** Helper to call transformIndexHtml with correct typing.
 *  Vite's IndexHtmlTransform is a union type; our plugin returns HtmlTagDescriptor[] directly. */
function callTransformIndexHtml(plugin: ReturnType<typeof localhostAccessPlugin>) {
  return (plugin.transformIndexHtml as () => HtmlTagDescriptor[])();
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

  it("returns VITE_PORTAL_DOMAIN_IS_ROOT script when env var is set", () => {
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

  it("VITE_PORTAL_DOMAIN_IS_ROOT value is interpolated into script content", () => {
    vi.stubEnv("VITE_PORTAL_DOMAIN_IS_ROOT", "my-custom-value");
    const plugin = localhostAccessPlugin();
    const result = callTransformIndexHtml(plugin);

    expect(result).toHaveLength(1);
    expect(result[0].children).toBe(
      "window.VITE_PORTAL_DOMAIN_IS_ROOT = my-custom-value;",
    );
  });
});
