import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Checkbox } from "./Checkbox";

// Mock the registerFormComponent to prevent side effects
vi.mock("./index", () => ({
  registerFormComponent: vi.fn(),
}));

// Mock the base Checkbox component from ui-core
vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  Checkbox: vi.fn(({ checked, onCheckedChange, ...props }) => {
    // Simple mock: render a checkbox and simulate change
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(event.target.checked);
    };
    return (
      <input
        checked={checked}
        data-testid="base-checkbox"
        onChange={handleChange}
        type="checkbox"
        {...props}
      />
    );
  }),
}));

describe("Checkbox", () => {
  afterEach(cleanup);

  it("renders the base checkbox component", () => {
    render(<Checkbox name="testCheckbox" />);
    expect(screen.getByTestId("base-checkbox")).toBeInTheDocument();
  });

  it("passes checked and disabled props to the base checkbox", () => {
    render(<Checkbox disabled name="testCheckbox" value />);
    const checkbox = screen.getByTestId("base-checkbox");
    expect(checkbox).toBeChecked();
    expect(checkbox).toBeDisabled();
  });

  it("handles unchecked state correctly", () => {
    render(<Checkbox name="testCheckbox" value={false} />);
    const checkbox = screen.getByTestId("base-checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("calls onChange when the checkbox state changes", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Checkbox name="testCheckbox" onChange={handleChange} />);

    const checkbox = screen.getByTestId("base-checkbox");
    await user.click(checkbox); // Click to check

    expect(handleChange).toHaveBeenCalledWith(true);

    await user.click(checkbox); // Click to uncheck

    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it("calls onBlur when the checkbox is blurred", async () => {
    const user = userEvent.setup();
    const handleBlur = vi.fn();
    render(<Checkbox name="testCheckbox" onBlur={handleBlur} />);

    const checkbox = screen.getByTestId("base-checkbox");
    await user.click(checkbox); // Focus the element (clicking can focus)
    await user.tab(); // Blur the element

    expect(handleBlur).toHaveBeenCalled();
  });

  it("sets the id and name attributes", () => {
    render(<Checkbox name="testCheckbox" />);
    const checkbox = screen.getByTestId("base-checkbox");
    expect(checkbox).toHaveAttribute("id", "testCheckbox");
    expect(checkbox).toHaveAttribute("name", "testCheckbox");
  });
});
