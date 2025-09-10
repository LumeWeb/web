import { ComponentType } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getActionItemComponent,
  registerActionItemComponent,
  resetRegistryForTesting,
} from "./registry";
import { ActionItemProps, ActionItemType } from "./types";

// Remove the incorrect getInternalRegistryMap helper

describe("Action Item Registry", () => {
  // Use beforeEach to clear the registry before *each* test
  beforeEach(() => {
    resetRegistryForTesting();
  });

  // Remove the afterEach hook as beforeEach is sufficient

  it("should register and retrieve a component", () => {
    const MockComponent: ComponentType<ActionItemProps<any>> = () => null;
    const type = ActionItemType.CUSTOM;

    registerActionItemComponent(type, MockComponent);
    const retrievedComponent = getActionItemComponent(type);

    expect(retrievedComponent).toBe(MockComponent);
  });

  it("should return undefined for an unregistered type", () => {
    const type = ActionItemType.CANCEL; // Assuming CANCEL is not registered in this test setup

    const retrievedComponent = getActionItemComponent(type);

    expect(retrievedComponent).toBeUndefined();
  });

  it("should warn when overwriting an existing registration", () => {
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    const MockComponent1: ComponentType<ActionItemProps<any>> = () => null;
    const MockComponent2: ComponentType<ActionItemProps<any>> = () => null;
    const type = ActionItemType.SUBMIT;

    registerActionItemComponent(type, MockComponent1);
    registerActionItemComponent(type, MockComponent2); // Overwrite

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      `ActionItemComponent type "${type}" is already registered. Overwriting.`,
    );
    expect(getActionItemComponent(type)).toBe(MockComponent2); // Should be the new one

    consoleWarnSpy.mockRestore();
  });
});
