import { describe, it, expect, vi } from "vitest";
import { copyScriptAttributes, attachScriptHandlers } from "@/ui/context/FragmentQueueHelpers";

describe("copyScriptAttributes", () => {
  it("copies all attributes from source to target", () => {
    const source = document.createElement("script");
    source.setAttribute("data-test", "value123");
    source.setAttribute("type", "module");
    source.setAttribute("async", "");

    const target = document.createElement("script");

    copyScriptAttributes(source, target);

    expect(target.getAttribute("data-test")).toBe("value123");
    expect(target.getAttribute("type")).toBe("module");
    expect(target.hasAttribute("async")).toBe(true);
  });

  it("preserves existing target attributes not in source", () => {
    const source = document.createElement("script");
    source.setAttribute("src", "/test.js");

    const target = document.createElement("script");
    target.setAttribute("id", "existing-id");

    copyScriptAttributes(source, target);

    expect(target.getAttribute("src")).toBe("/test.js");
    expect(target.getAttribute("id")).toBe("existing-id");
  });

  it("handles empty source script", () => {
    const source = document.createElement("script");
    const target = document.createElement("script");
    target.setAttribute("id", "keep-me");

    copyScriptAttributes(source, target);

    expect(target.getAttribute("id")).toBe("keep-me");
    expect(target.attributes.length).toBe(1);
  });

  it("handles inline scripts (no external attributes)", () => {
    const source = document.createElement("script");
    source.textContent = "console.log('test');";

    const target = document.createElement("script");

    copyScriptAttributes(source, target);

    expect(target.attributes.length).toBe(0);
  });

  it("copies src attribute for external scripts", () => {
    const source = document.createElement("script");
    source.src = "https://example.com/script.js";

    const target = document.createElement("script");

    copyScriptAttributes(source, target);

    expect(target.src).toContain("example.com/script.js");
  });
});

describe("attachScriptHandlers", () => {
  it("returns abort cleanup function", () => {
    const script = document.createElement("script");
    const resolve = vi.fn();

    const cleanup = attachScriptHandlers(script, resolve);

    expect(typeof cleanup).toBe("function");
  });

  it("resolves on load event", () => {
    const script = document.createElement("script");
    const resolve = vi.fn();

    attachScriptHandlers(script, resolve);

    script.dispatchEvent(new Event("load"));

    expect(resolve).toHaveBeenCalledTimes(1);
  });

  it("resolves on error event", () => {
    const script = document.createElement("script");
    const resolve = vi.fn();

    attachScriptHandlers(script, resolve);

    script.dispatchEvent(new Event("error"));

    expect(resolve).toHaveBeenCalledTimes(1);
  });

  it("removes script on abort when signal provided", () => {
    const script = document.createElement("script");
    document.body.appendChild(script);
    const resolve = vi.fn();
    const controller = new AbortController();

    attachScriptHandlers(script, resolve, controller.signal);

    expect(document.body.contains(script)).toBe(true);

    controller.abort();

    expect(document.body.contains(script)).toBe(false);
    expect(resolve).toHaveBeenCalledTimes(1);
  });

  it("removes abort listener after load", () => {
    const script = document.createElement("script");
    const resolve = vi.fn();
    const controller = new AbortController();

    attachScriptHandlers(script, resolve, controller.signal);

    script.dispatchEvent(new Event("load"));

    // Signal should have been cleaned up - aborting after load shouldn't call resolve again
    controller.abort();

    expect(resolve).toHaveBeenCalledTimes(1);
  });

  it("removes abort listener after error", () => {
    const script = document.createElement("script");
    const resolve = vi.fn();
    const controller = new AbortController();

    attachScriptHandlers(script, resolve, controller.signal);

    script.dispatchEvent(new Event("error"));

    // Signal should have been cleaned up
    controller.abort();

    expect(resolve).toHaveBeenCalledTimes(1);
  });

  it("handles abort after setup", async () => {
    const script = document.createElement("script");
    document.body.appendChild(script);
    const resolve = vi.fn();
    const controller = new AbortController();

    attachScriptHandlers(script, resolve, controller.signal);

    expect(document.body.contains(script)).toBe(true);
    expect(resolve).not.toHaveBeenCalled();

    // Abort after handlers are attached
    controller.abort();

    expect(document.body.contains(script)).toBe(false);
    expect(resolve).toHaveBeenCalledTimes(1);
  });

  it("works without signal (optional parameter)", () => {
    const script = document.createElement("script");
    const resolve = vi.fn();

    const cleanup = attachScriptHandlers(script, resolve);

    // Returns cleanup function even without signal
    expect(typeof cleanup).toBe("function");

    script.dispatchEvent(new Event("load"));

    expect(resolve).toHaveBeenCalledTimes(1);
  });

  it("cleans up listeners after resolution", () => {
    const script = document.createElement("script");
    const resolve = vi.fn();

    attachScriptHandlers(script, resolve);

    script.dispatchEvent(new Event("load"));

    // Multiple events should not trigger multiple resolves
    script.dispatchEvent(new Event("load"));
    script.dispatchEvent(new Event("error"));

    expect(resolve).toHaveBeenCalledTimes(1);
  });
});
