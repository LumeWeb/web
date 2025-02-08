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
  Textarea: vi.fn(({ onChange, value, ...props }) => (
    <textarea data-testid="base-textarea" onChange={onChange ?? vi.fn()} value={value} readOnly={false} {...props} />
  )),
}));

// Mock the base components from ui-core using the hoisted mocks
vi.mock("@lumeweb/portal-framework-ui-core", () => mocks);

import { Textarea } from "./Textarea";

describe("Textarea", () => {
  afterEach(cleanup);

  it("renders the base textarea component", () => {
    render(<Textarea name="testTextarea" />);
    expect(screen.getByTestId("base-textarea")).toBeInTheDocument();
  });

  it("passes placeholder and value to the base textarea", () => {
    render(
      <Textarea
        name="testTextarea"
        onChange={vi.fn()}
        placeholder="Enter text"
        value="Initial value"
      />,
    );
    const textarea = screen.getByTestId("base-textarea");
    expect(textarea).toHaveAttribute("placeholder", "Enter text");
    expect(textarea).toHaveValue("Initial value");
  });

  it("handles empty value correctly", () => {
    render(<Textarea name="testTextarea" onChange={vi.fn()} value="" />);
    const textarea = screen.getByTestId("base-textarea");
    expect(textarea).toHaveValue("");
  });

  it("applies inputClassName to the base textarea", () => {
    render(<Textarea inputClassName="custom-class" name="testTextarea" onChange={vi.fn()} />);
    const textarea = screen.getByTestId("base-textarea");
    // The cn mock will just join classes, so we check for the custom class
    expect(textarea).toHaveClass("custom-class");
  });

  it("calls onChange when the value changes", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Textarea name="testTextarea" onChange={handleChange} />);

    const textarea = screen.getByTestId("base-textarea");
    await user.type(textarea, "New text");

    // React Hook Form's onChange typically passes an event object
    // We'll check if the mock was called, the exact event structure might vary
    expect(handleChange).toHaveBeenCalled();
  });
});
