import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

// Mock the registerFormComponent to prevent side effects
vi.mock("./index", () => ({
  registerFormComponent: vi.fn(),
}));

// Need to get a reference to the mocks object
const mocks = vi.hoisted(() => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(" ")), // Simple mock for classnames
  Input: vi.fn(({ onChange, value, ...props }) => (
    <input data-testid="base-input" onChange={onChange ?? vi.fn()} value={value} readOnly={false} {...props} />
  )),
}));

// Mock the base components from ui-core using the hoisted mocks
vi.mock("@lumeweb/portal-framework-ui-core", () => mocks);

import { Input } from "./Input";

describe("Input", () => {
  afterEach(cleanup);

  it("renders the base input component", () => {
    render(<Input name="testInput" />);
    expect(screen.getByTestId("base-input")).toBeInTheDocument();
  });

  it("passes placeholder, value, and type to the base input", () => {
    render(
      <Input
        name="testInput"
        onChange={vi.fn()}
        placeholder="Enter text"
        type="email"
        value="Initial value"
      />,
    );
    const input = screen.getByTestId("base-input");
    expect(input).toHaveAttribute("placeholder", "Enter text");
    expect(input).toHaveValue("Initial value");
    expect(input).toHaveAttribute("type", "email");
  });

  it("handles empty value correctly", () => {
    render(<Input name="testInput" onChange={vi.fn()} value="" />);
    const input = screen.getByTestId("base-input");
    expect(input).toHaveValue("");
  });

  it("applies inputClassName to the base input", () => {
    render(<Input inputClassName="custom-class" name="testInput" onChange={vi.fn()} />);
    const input = screen.getByTestId("base-input");
    // The cn mock will just join classes, so we check for the custom class
    expect(input).toHaveClass("custom-class");
  });

  it("calls onChange when the value changes", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Input name="testInput" onChange={handleChange} />);

    const input = screen.getByTestId("base-input");
    await user.type(input, "New text");

    // React Hook Form's onChange typically passes an event object
    // We'll check if the mock was called, the exact event structure might vary
    expect(handleChange).toHaveBeenCalled();
  });
});
