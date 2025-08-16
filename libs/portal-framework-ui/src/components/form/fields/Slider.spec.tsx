import { cleanup, fireEvent, render, screen } from "@testing-library/react"; // Import fireEvent
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Slider } from "./Slider";

// Mock the registerFormComponent to prevent side effects
vi.mock("./index", () => ({
  registerFormComponent: vi.fn(),
}));

// Mock the base components from ui-core
vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  Slider: vi.fn(({ onValueChange, value, ...props }) => {
    // Simple mock: render a range input and simulate change
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      // Call onValueChange with an array containing the number value
      onValueChange?.([parseFloat(event.target.value)]);
    };
    return (
      <input
        data-testid="base-slider"
        onChange={handleChange}
        type="range"
        value={value?.[0] ?? props.min ?? 0} // Ensure value is a number or string representation
        {...props}
      />
    );
  }),
}));

describe("Slider", () => {
  afterEach(cleanup);

  it("renders the base slider component", () => {
    render(<Slider name="testSlider" />);
    expect(screen.getByTestId("base-slider")).toBeInTheDocument();
  });

  it("passes min, max, step, and value to the base slider", () => {
    render(<Slider max={50} min={10} name="testSlider" step={5} value={25} />);
    const slider = screen.getByTestId("base-slider");
    expect(slider).toHaveAttribute("min", "10");
    expect(slider).toHaveAttribute("max", "50");
    expect(slider).toHaveAttribute("step", "5");
    expect(slider).toHaveValue("25");
  });

  it("uses default min, max, and step if not provided", () => {
    render(<Slider name="testSlider" />);
    const slider = screen.getByTestId("base-slider");
    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "100");
    expect(slider).toHaveAttribute("step", "1");
    expect(slider).toHaveValue("0"); // Default value should be min
  });

  it("handles undefined value by using min", () => {
    render(<Slider min={5} name="testSlider" />);
    const slider = screen.getByTestId("base-slider");
    expect(slider).toHaveValue("5");
  });

  it("calls onChange when the slider value changes", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Slider max={100} min={0} name="testSlider" onChange={handleChange} />,
    );

    const slider = screen.getByTestId("base-slider");
    const newValue = "50"; // Example new value

    // Simulate changing the slider value using fireEvent
    // This is more reliable for range inputs than userEvent.type or pointer
    fireEvent.change(slider, { target: { value: newValue } });

    // Check if onChange was called with the correct number value
    // The mock calls onValueChange with an array, and the component calls onChange with the first element
    // So the test spy should be called with the number.
    expect(handleChange).toHaveBeenCalledWith(parseFloat(newValue));
  });

  it("disables the slider when disabled prop is true", () => {
    render(<Slider disabled name="testSlider" />);
    const slider = screen.getByTestId("base-slider");
    expect(slider).toBeDisabled();
  });
});
