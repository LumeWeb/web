import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useMobile } from "./useMobile";

describe("useMobile", () => {
  const setWindowWidth = (width: number) => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: width,
      writable: true,
    });
    window.dispatchEvent(new Event("resize"));
  };

  it("should return true if window width is less than or equal to breakpoint", () => {
    setWindowWidth(600);
    const { result } = renderHook(() => useMobile(640));
    expect(result.current).toBe(true);
  });

  it("should return false if window width is greater than breakpoint", () => {
    setWindowWidth(700);
    const { result } = renderHook(() => useMobile(640));
    expect(result.current).toBe(false);
  });

  it("should update the value on window resize", () => {
    setWindowWidth(600);
    const { result } = renderHook(() => useMobile(640));
    expect(result.current).toBe(true);

    act(() => {
      setWindowWidth(700);
    });
    expect(result.current).toBe(false);

    act(() => {
      setWindowWidth(640);
    });
    expect(result.current).toBe(true);
  });

  it("should use the default breakpoint if none is provided", () => {
    act(() => {
      setWindowWidth(600); // Default breakpoint is 640
    });
    const { result } = renderHook(() => useMobile());
    expect(result.current).toBe(true);

    act(() => {
      setWindowWidth(700);
    });
    expect(result.current).toBe(false);
  });

  it("should handle different breakpoints", () => {
    act(() => {
      setWindowWidth(1000);
    });
    const { result } = renderHook(() => useMobile(1024));
    expect(result.current).toBe(true);

    act(() => {
      setWindowWidth(1025);
    });
    expect(result.current).toBe(false);
  });
});
