import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));
    expect(result.current).toBe("initial");
  });

  it("should not update the debounced value before the delay", () => {
    const { rerender, result } = renderHook(
      ({ delay, value }) => useDebounce(value, delay),
      {
        initialProps: { delay: 500, value: "initial" },
      },
    );

    act(() => {
      rerender({ delay: 500, value: "updated" });
    });
    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe("initial");
  });

  it("should update the debounced value after the delay", () => {
    const { rerender, result } = renderHook(
      ({ delay, value }) => useDebounce(value, delay),
      {
        initialProps: { delay: 500, value: "initial" },
      },
    );

    act(() => {
      rerender({ delay: 500, value: "updated" });
    });
    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe("updated");
  });

  it("should cancel the previous timer if the value changes before the delay", () => {
    const { rerender, result } = renderHook(
      ({ delay, value }) => useDebounce(value, delay),
      {
        initialProps: { delay: 500, value: "initial" },
      },
    );

    act(() => {
      rerender({ delay: 500, value: "update1" });
    });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe("initial");

    act(() => {
      rerender({ delay: 500, value: "update2" });
    });
    act(() => {
      vi.advanceTimersByTime(300); // Total time passed for 'update1' is 250 + 300 = 550ms, but timer was reset
    });
    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(200); // Total time passed for 'update2' is 300 + 200 = 500ms
    });
    expect(result.current).toBe("update2");
  });

  it("should handle different delay values", () => {
    const { rerender, result } = renderHook(
      ({ delay, value }) => useDebounce(value, delay),
      {
        initialProps: { delay: 100, value: "initial" },
      },
    );

    act(() => {
      rerender({ delay: 200, value: "updated" });
    });
    act(() => {
      vi.advanceTimersByTime(199);
    });
    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("updated");
  });
});
