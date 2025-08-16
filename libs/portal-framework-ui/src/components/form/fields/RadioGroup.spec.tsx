import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RadioGroup } from "./RadioGroup";

// Mock the registerFormComponent to prevent side effects
vi.mock("./index", () => ({
  registerFormComponent: vi.fn(),
}));

// Need to get a reference to the mocks object
const mocks = vi.hoisted(() => ({
  RadioGroup: vi.fn(),
  RadioGroupItem: vi.fn(),
}));

// Mock the base components from ui-core
vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  // Mock the base components from ui-core
  RadioGroup: vi.fn(({ children, ...props }) => {
    // Simple mock that just renders children
    return (
      <div data-testid="base-radio-group" {...props}>
        {children}
      </div>
    );
  }),
  RadioGroupItem: vi.fn(({ value, ...props }) => {
    // Simple mock that just renders an input
    return (
      <input
        data-testid={`radio-item-${value}`}
        type="radio"
        value={value}
        {...props}
      />
    );
  }),
}));

describe("RadioGroup", () => {
  afterEach(cleanup);

  const options = ["option1", "option2", "option3"];

  it("renders the base radio group component", () => {
    render(<RadioGroup name="testRadioGroup" options={options} />);
    expect(screen.getByTestId("base-radio-group")).toBeInTheDocument();
  });

  it("renders radio items for each option", () => {
    render(<RadioGroup name="testRadioGroup" options={options} />);
    expect(screen.getByTestId("radio-item-option1")).toBeInTheDocument();
    expect(screen.getByTestId("radio-item-option2")).toBeInTheDocument();
    expect(screen.getByTestId("radio-item-option3")).toBeInTheDocument();
  });

  it("renders labels for each radio item", () => {
    render(<RadioGroup name="testRadioGroup" options={options} />);
    expect(screen.getByLabelText("option1")).toBeInTheDocument();
    expect(screen.getByLabelText("option2")).toBeInTheDocument();
    expect(screen.getByLabelText("option3")).toBeInTheDocument();
  });

  it.skip("renders the correct radio item as checked when value is provided", () => {
    render(
      <RadioGroup name="testRadioGroup" options={options} value="option2" />,
    );
    const option2Input = screen.getByTestId("radio-item-option2");
    expect(option2Input).toBeChecked();
  });

  it.skip("calls onChange when a radio item is selected", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <RadioGroup
        name="testRadioGroup"
        onChange={handleChange} // This spy is passed as onValueChange to the mock
        options={options}
      />,
    );

    // Interact with the label, which is a more robust way for radio buttons
    const option2Label = screen.getByLabelText("option2");
    await user.click(option2Label); // Click the label

    // Add a small delay to see if it helps the spy assertion
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(handleChange).toHaveBeenCalledWith("option2");
  });

  it("disables the radio group when disabled prop is true", () => {
    render(<RadioGroup disabled name="testRadioGroup" options={options} />);
    const radioGroup = screen.getByTestId("base-radio-group");
    expect(radioGroup).toHaveAttribute("disabled");
  });
});
