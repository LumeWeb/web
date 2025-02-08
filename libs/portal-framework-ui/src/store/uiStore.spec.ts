import { storeResetFns } from "@/../__mocks__/zustand"; // Import the reset function set
import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { uiStore } from "./uiStore"; // Import the store

describe("uiStore", () => {
  // Reset the store BEFORE each test using the mock's reset functionality
  beforeEach(() => {
    act(() => {
      storeResetFns.forEach((resetFn) => resetFn());
    });
  });

  it("should have correct initial state", () => {
    const state = uiStore.getState();
    expect(state.theme).toBe("default");
  });

  it("should set theme", () => {
    const newTheme = "dark";
    act(() => {
      uiStore.getState().setTheme(newTheme);
    });
    expect(uiStore.getState().theme).toBe(newTheme);

    const anotherTheme = "light";
    act(() => {
      uiStore.getState().setTheme(anotherTheme);
    });
    expect(uiStore.getState().theme).toBe(anotherTheme);
  });
});
