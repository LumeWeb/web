import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Switch } from "./Switch";

// Mock the registerFormComponent to prevent side effects
vi.mock("./index", () => ({
  registerFormComponent: vi.fn(),
}));

// Mock the base Switch component from ui-core
vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  Switch: vi.fn(({ checked, onCheckedChange, ...props }) => {
    // Simple mock: render a checkbox and simulate change
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(event.target.checked);
    };
    return (
      <input
        checked={checked}
        data-testid="base-switch"
        onChange={handleChange}
        type="checkbox"
        {...props}
      />
    );
  }),
}));

describe("Switch", () => {
  afterEach(cleanup);

  it("renders the base switch component (mocked as checkbox)", () => {
    render(<Switch name="testSwitch" />);
    expect(screen.getByTestId("base-switch")).toBeInTheDocument();
  });

  it("passes checked and disabled props to the base switch", () => {
    render(<Switch disabled name="testSwitch" value />);
    const checkbox = screen.getByTestId("base-switch");
    expect(checkbox).toBeChecked();
    expect(checkbox).toBeDisabled();
  });

  it("handles unchecked state correctly", () => {
    render(<Switch name="testSwitch" value={false} />);
    const checkbox = screen.getByTestId("base-switch");
    expect(checkbox).not.toBeChecked();
  });

  it("calls onChange when the switch state changes", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Switch name="testSwitch" onChange={handleChange} />);

    const checkbox = screen.getByTestId("base-switch");
    await user.click(checkbox); // Click to check

    expect(handleChange).toHaveBeenCalledWith(true);

    await user.click(checkbox); // Click to uncheck

    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it("calls onBlur when the switch is blurred", async () => {
    const user = userEvent.setup();
    const handleBlur = vi.fn();
    render(<Switch name="testSwitch" onBlur={handleBlur} />);

    const checkbox = screen.getByTestId("base-switch");
    await user.click(checkbox); // Focus the element (clicking can focus)
    await user.tab(); // Blur the element

    expect(handleBlur).toHaveBeenCalled();
  });
});
