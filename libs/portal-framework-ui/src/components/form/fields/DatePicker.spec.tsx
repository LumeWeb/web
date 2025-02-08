import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DatePicker } from "./DatePicker";

// Mock the registerFormComponent to prevent side effects
vi.mock("./index", () => ({
  registerFormComponent: vi.fn(),
}));

// Mock the base DatePicker component from ui-core
vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  DatePicker: vi.fn(
    ({ date, disabled, onBlur, placeholder, setDate, ...props }) => {
      // Simple mock: render an input and simulate date selection via change
      const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const dateValue = event.target.value
          ? new Date(event.target.value)
          : undefined;
        setDate?.(dateValue);
      };
      return (
        <input
          data-testid="base-date-picker"
          disabled={disabled}
          onBlur={onBlur}
          onChange={handleChange}
          placeholder={placeholder}
          type="date" // Use date type for easier simulation
          value={date ? date.toISOString().split("T")[0] : ""} // Format date for input value
          {...props}
        />
      );
    },
  ),
}));

describe("DatePicker", () => {
  afterEach(cleanup);

  it("renders the base date picker component", () => {
    render(<DatePicker name="testDatePicker" onChange={vi.fn()} />);
    expect(screen.getByTestId("base-date-picker")).toBeInTheDocument();
  });

  it("passes date, placeholder, and disabled props to the base date picker", () => {
    const testDate = new Date("2023-10-26T10:00:00.000Z");
    render(
      <DatePicker
        date={testDate}
        disabled
        name="testDatePicker"
        onChange={vi.fn()}
        placeholder="Select a date"
      />,
    );
    const input = screen.getByTestId("base-date-picker");
    expect(input).toHaveValue("2023-10-26"); // Check formatted date value
    expect(input).toHaveAttribute("placeholder", "Select a date");
    expect(input).toBeDisabled();
  });

  it("calls onChange when a date is selected", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<DatePicker name="testDatePicker" onChange={handleChange} />);

    const input = screen.getByTestId("base-date-picker");
    const newDate = "2024-01-15";
    await user.type(input, newDate); // Simulate typing a date

    // The mock converts the string to a Date object
    expect(handleChange).toHaveBeenCalledWith(new Date(newDate));
  });

  it("calls onChange with undefined when the input is cleared", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const initialDate = new Date("2023-10-26T10:00:00.000Z");
    render(
      <DatePicker
        date={initialDate}
        name="testDatePicker"
        onChange={handleChange}
      />,
    );

    const input = screen.getByTestId("base-date-picker");
    await user.clear(input); // Simulate clearing the input

    expect(handleChange).toHaveBeenCalledWith(undefined);
  });

  it("calls onBlur when the input is blurred", async () => {
    const user = userEvent.setup();
    const handleBlur = vi.fn();
    render(
      <DatePicker
        name="testDatePicker"
        onBlur={handleBlur}
        onChange={vi.fn()}
      />,
    );

    const input = screen.getByTestId("base-date-picker");
    await user.click(input); // Focus the input
    await user.tab(); // Blur the input

    expect(handleBlur).toHaveBeenCalled();
  });
});
