import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EmailInput } from "./EmailInput";

// Mock the registerFormComponent to prevent side effects
vi.mock("./index", () => ({
  registerFormComponent: vi.fn(),
}));

// Mock the Input component
vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  Input: vi.fn((props) => <input data-testid="base-input" {...props} />),
}));

describe("EmailInput", () => {
  afterEach(cleanup);

  it("renders the base input component with type email", () => {
    render(<EmailInput name="testEmail" />);
    const input = screen.getByTestId("base-input");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "email");
  });

  it("passes all props to the base input", () => {
    render(
      <EmailInput
        className="test-class"
        inputClassName="input-class"
        name="testEmail"
        placeholder="Enter email"
        required
      />,
    );
    const input = screen.getByTestId("base-input");
    expect(input).toHaveAttribute("name", "testEmail");
    expect(input).toHaveAttribute("placeholder", "Enter email");
    expect(input).toBeRequired();
  });
});
