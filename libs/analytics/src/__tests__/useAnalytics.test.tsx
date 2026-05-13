import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";
import { AnalyticsProvider, useAnalytics } from "../index";

function renderWithProvider(
  props: React.ComponentProps<typeof AnalyticsProvider>
) {
  return renderHook(() => useAnalytics(), {
    wrapper: ({ children }) => (
      <AnalyticsProvider {...props}>{children}</AnalyticsProvider>
    ),
  });
}

describe("useAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();

    window.posthog = {
      capture: vi.fn(),
      identify: vi.fn(),
      register_for_session: vi.fn(),
    };
  });

  it("capture calls posthog.capture with merged properties", () => {
    const { result } = renderWithProvider({
      children: null,
      baseProperties: { app: "test" },
    });

    result.current.capture("button_clicked", { button: "submit" });

    expect(window.posthog!.capture).toHaveBeenCalledWith("button_clicked", {
      app: "test",
      button: "submit",
    });
  });

  it("event properties override baseProperties on conflict", () => {
    const { result } = renderWithProvider({
      children: null,
      baseProperties: { plan: "free" },
    });

    result.current.capture("upgrade", { plan: "pro" });

    expect(window.posthog!.capture).toHaveBeenCalledWith("upgrade", {
      plan: "pro",
    });
  });

  it("capture is no-op when disabled=true", () => {
    const { result } = renderWithProvider({
      children: null,
      disabled: true,
    });

    result.current.capture("test_event");

    expect(window.posthog!.capture).not.toHaveBeenCalled();
  });

  it("capture is no-op when window.posthog is undefined", () => {
    delete (window as unknown as Record<string, unknown>).posthog;

    const { result } = renderWithProvider({ children: null });

    expect(() => result.current.capture("test_event")).not.toThrow();
  });

  it("console.warn in dev when window.posthog missing", () => {
    delete (window as unknown as Record<string, unknown>).posthog;
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { result } = renderWithProvider({ children: null });
    result.current.capture("test_event");

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("window.posthog not available")
    );

    warnSpy.mockRestore();
  });

  it("SSR safety — no ReferenceError when window is undefined", () => {
    const originalWindow = globalThis.window;
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    try {
      (globalThis as Record<string, unknown>).window = undefined;

      const capture = (
        event: string,
        properties?: Record<string, unknown>
      ) => {
        const posthog =
          typeof window !== "undefined" ? window?.posthog : undefined;

        if (!posthog) {
          if (
            typeof process !== "undefined" &&
            process.env.NODE_ENV !== "production"
          ) {
            console.warn(
              `[analytics] window.posthog not available. Event not captured: "${event}"`
            );
          }
          return;
        }

        posthog.capture(event, properties);
      };

      expect(() => capture("test_event")).not.toThrow();
    } finally {
      globalThis.window = originalWindow;
      warnSpy.mockRestore();
    }
  });

  it("identify calls posthog.identify with distinctId and properties", () => {
    const { result } = renderWithProvider({ children: null });

    result.current.identify("user-123", { plan: "pro" });

    expect(window.posthog!.identify).toHaveBeenCalledWith("user-123", {
      plan: "pro",
    });
  });

  it("identify is a no-op when disabled=true", () => {
    const { result } = renderWithProvider({
      children: null,
      disabled: true,
    });

    result.current.identify("user-123");

    expect(window.posthog!.identify).not.toHaveBeenCalled();
  });

  it("identify is a no-op when window.posthog is undefined", () => {
    delete (window as unknown as Record<string, unknown>).posthog;

    const { result } = renderWithProvider({ children: null });

    expect(() => result.current.identify("user-123")).not.toThrow();
  });

  it("console.warn in dev when window.posthog missing and identify called", () => {
    delete (window as unknown as Record<string, unknown>).posthog;
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { result } = renderWithProvider({ children: null });
    result.current.identify("user-123");

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Identify not called")
    );

    warnSpy.mockRestore();
  });
});
