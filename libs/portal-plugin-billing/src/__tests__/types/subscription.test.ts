import { describe, it, expect } from "vitest";
import {
  ManagementAction,
  MANAGEMENT_OPERATIONS,
  isManagementAction,
  isManagementOperation,
  isRedirectAction,
  isShowUIAction,
  isApiRequiredAction,
  isUnsupportedAction,
  isErrorAction,
} from "@/types/subscription";

describe("ManagementAction type guards", () => {
  it("returns true for all valid ManagementAction enum values", () => {
    expect(isManagementAction(ManagementAction.Redirect)).toBe(true);
    expect(isManagementAction(ManagementAction.ShowUI)).toBe(true);
    expect(isManagementAction(ManagementAction.ApiRequired)).toBe(true);
    expect(isManagementAction(ManagementAction.Unsupported)).toBe(true);
    expect(isManagementAction(ManagementAction.Error)).toBe(true);
  });

  it("returns false for invalid action values", () => {
    expect(isManagementAction("unknown")).toBe(false);
    expect(isManagementAction("")).toBe(false);
    expect(isManagementAction("REDIRECT")).toBe(false); // wrong case
    expect(isManagementAction("Redirect")).toBe(false); // wrong case
  });

  it("isRedirectAction narrows type correctly", () => {
    const action = ManagementAction.Redirect;
    if (isRedirectAction(action)) {
      expect(action).toBe(ManagementAction.Redirect);
    }
  });

  it("isShowUIAction narrows type correctly", () => {
    const action = ManagementAction.ShowUI;
    if (isShowUIAction(action)) {
      expect(action).toBe(ManagementAction.ShowUI);
    }
  });

  it("isApiRequiredAction narrows type correctly", () => {
    const action = ManagementAction.ApiRequired;
    if (isApiRequiredAction(action)) {
      expect(action).toBe(ManagementAction.ApiRequired);
    }
  });
});

describe("MANAGEMENT_OPERATIONS", () => {
  it("contains expected operations", () => {
    expect(MANAGEMENT_OPERATIONS).toContain("cancel");
    expect(MANAGEMENT_OPERATIONS).toContain("change_plan");
    expect(MANAGEMENT_OPERATIONS).toContain("customer_portal");
    expect(MANAGEMENT_OPERATIONS).toContain("pause");
    expect(MANAGEMENT_OPERATIONS).toContain("resume");
  });

  it("isManagementOperation validates correctly", () => {
    expect(isManagementOperation("cancel")).toBe(true);
    expect(isManagementOperation("pause")).toBe(true);
    expect(isManagementOperation("resume")).toBe(true);
    expect(isManagementOperation("customer_portal")).toBe(true);
    expect(isManagementOperation("unknown")).toBe(false);
  });
});

describe("ManagementAction narrowed guards", () => {
  it("isRedirectAction returns true only for Redirect", () => {
    expect(isRedirectAction(ManagementAction.Redirect)).toBe(true);
    expect(isRedirectAction(ManagementAction.ShowUI)).toBe(false);
    expect(isRedirectAction(ManagementAction.ApiRequired)).toBe(false);
    expect(isRedirectAction(ManagementAction.Unsupported)).toBe(false);
    expect(isRedirectAction(ManagementAction.Error)).toBe(false);
  });

  it("isShowUIAction returns true only for ShowUI", () => {
    expect(isShowUIAction(ManagementAction.ShowUI)).toBe(true);
    expect(isShowUIAction(ManagementAction.Redirect)).toBe(false);
    expect(isShowUIAction(ManagementAction.ApiRequired)).toBe(false);
  });

  it("isApiRequiredAction returns true only for ApiRequired", () => {
    expect(isApiRequiredAction(ManagementAction.ApiRequired)).toBe(true);
    expect(isApiRequiredAction(ManagementAction.Redirect)).toBe(false);
    expect(isApiRequiredAction(ManagementAction.ShowUI)).toBe(false);
  });

  it("isUnsupportedAction returns true only for Unsupported", () => {
    expect(isUnsupportedAction(ManagementAction.Unsupported)).toBe(true);
    expect(isUnsupportedAction(ManagementAction.Redirect)).toBe(false);
    expect(isUnsupportedAction(ManagementAction.Error)).toBe(false);
  });

  it("isErrorAction returns true only for Error", () => {
    expect(isErrorAction(ManagementAction.Error)).toBe(true);
    expect(isErrorAction(ManagementAction.Redirect)).toBe(false);
    expect(isErrorAction(ManagementAction.Unsupported)).toBe(false);
  });
});
