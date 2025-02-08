import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runWhenIdle } from "./asyncUtils";

describe("runWhenIdle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should use requestIdleCallback when available", () => {
    const mockCallback = vi.fn();
    let requestId = 0;
    const mockRequestIdleCallback = vi.fn((cb) => {
      setTimeout(() => cb({ didTimeout: false }), 0);
      return ++requestId;
    });

    // Mock requestIdleCallback with proper typing
    globalThis.requestIdleCallback = mockRequestIdleCallback as typeof requestIdleCallback;

    runWhenIdle(mockCallback);

    expect(mockRequestIdleCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).not.toHaveBeenCalled();

    // Advance timers to trigger the callback
    vi.advanceTimersByTime(1);

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("should fallback to setTimeout when requestIdleCallback is not available", () => {
    const mockCallback = vi.fn();

    // Remove requestIdleCallback
    delete (globalThis as any).requestIdleCallback;

    runWhenIdle(mockCallback);

    expect(mockCallback).not.toHaveBeenCalled();

    // Advance timers to trigger the setTimeout fallback
    vi.advanceTimersByTime(200);

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("should call the callback with the correct timing in fallback mode", () => {
    const mockCallback = vi.fn();
    delete (globalThis as any).requestIdleCallback;

    runWhenIdle(mockCallback);

    // Not called immediately
    expect(mockCallback).not.toHaveBeenCalled();

    // Called after 200ms
    vi.advanceTimersByTime(199);
    expect(mockCallback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });
});
