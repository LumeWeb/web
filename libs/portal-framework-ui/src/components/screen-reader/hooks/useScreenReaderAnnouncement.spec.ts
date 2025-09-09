import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useScreenReaderAnnouncement } from "./useScreenReaderAnnouncement";

describe("useScreenReaderAnnouncement", () => {
  // Use fake timers to control setTimeout
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return initial state", () => {
    const { result } = renderHook(() => useScreenReaderAnnouncement());

    expect(result.current.announcement).toBe("");
    expect(result.current.politeness).toBe("polite");
    expect(typeof result.current.announce).toBe("function");
  });

  it("should set announcement and politeness when announce is called with default politeness", () => {
    const { result } = renderHook(() => useScreenReaderAnnouncement());

    act(() => {
      result.current.announce("Test message");
    });

    expect(result.current.announcement).toBe("Test message");
    expect(result.current.politeness).toBe("polite");
  });

  it("should set announcement and politeness when announce is called with assertive politeness", () => {
    const { result } = renderHook(() => useScreenReaderAnnouncement());

    act(() => {
      result.current.announce("Urgent message", "assertive");
    });

    expect(result.current.announcement).toBe("Urgent message");
    expect(result.current.politeness).toBe("assertive");
  });

  it("should clear the announcement after the default delay", () => {
    const { result } = renderHook(() => useScreenReaderAnnouncement());

    act(() => {
      result.current.announce("Message to clear");
    });

    expect(result.current.announcement).toBe("Message to clear");

    // Advance timers by less than the delay
    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(result.current.announcement).toBe("Message to clear");

    // Advance timers by the remaining time
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.announcement).toBe("");
  });

  it("should clear the previous timeout when a new announcement is made", () => {
    const { result } = renderHook(() => useScreenReaderAnnouncement());
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");

    act(() => {
      result.current.announce("First message");
    });

    expect(result.current.announcement).toBe("First message");
    expect(clearTimeoutSpy).not.toHaveBeenCalled(); // No timeout to clear yet

    act(() => {
      // Make a new announcement before the first one clears
      result.current.announce("Second message");
    });

    expect(result.current.announcement).toBe("Second message");
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1); // Should have cleared the first timeout

    // Advance timers past the original delay (3000ms)
    // The announcement should still be the second message because its timer hasn't finished
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Advance timers past the second announcement's delay
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.announcement).toBe(""); // Now it should be cleared
  });

  it("should clear the timeout on unmount", () => {
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
    const { result, unmount } = renderHook(() => useScreenReaderAnnouncement());

    act(() => {
      result.current.announce("Message to clear on unmount");
    });

    expect(clearTimeoutSpy).not.toHaveBeenCalled(); // Timeout is set, not cleared yet

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1); // Should have cleared the timeout
  });
});
