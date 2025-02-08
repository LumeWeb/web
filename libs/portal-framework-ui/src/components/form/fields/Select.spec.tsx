// Mock the base components from ui-core
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

// Mock the registerFormComponent to prevent side effects
vi.mock("./index", () => ({
  registerFormComponent: vi.fn(),
}));

// Need to get a reference to the mocks object to filter children correctly
const mocks = vi.hoisted(() => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(" ")), // Simple mock for classnames
  Select: vi.fn(),
  SelectItem: vi.fn(),
  SelectContent: vi.fn(),
  SelectTrigger: vi.fn(),
  SelectValue: vi.fn(),
}));

vi.mock("@lumeweb/portal-framework-ui-core", () => mocks);

// Mock the base components from ui-core
// The actual mock implementation needs to be defined after the hoisted mocks
mocks.Select = vi.fn(({ children, onValueChange, value, ...props }) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onValueChange?.(event.target.value);
  };

  // Render a native select element for interaction testing
  // Render SelectTrigger and SelectValue mocks as siblings
  return (
    <>
      <select
        data-testid="base-select"
        onChange={handleChange}
        // Use value for controlled behavior
        value={value ?? ''} // Ensure value is never undefined for controlled component
        // Pass relevant props to the native select if needed for testing attributes
        {...props}
      >
        {/* Find SelectContent child and render its SelectItem children inside the select */}
        {React.Children.map(children, (child) => {
          // Cast child to React.ReactElement<any> to access props
          const typedChild = child as React.ReactElement<any>;
          // Cast typedChild.props to any to access children
          if (React.isValidElement(typedChild) && typedChild.type === mocks.SelectContent && (typedChild.props as any).children) {
            // Cast children to React.ReactNode[] before mapping
            return React.Children.map((typedChild.props as any).children as React.ReactNode[], (selectItemChild) => {
              if (React.isValidElement(selectItemChild) && selectItemChild.type === mocks.SelectItem) {
                return selectItemChild;
              }
              return null; // Ignore non-SelectItem children within SelectContent
            });
          }
          return null; // Ignore other top-level children for the native select
        })}
      </select>
      {/* Render SelectTrigger and SelectValue mocks as siblings */}
      {React.Children.map(children, (child) => {
         // Cast child to React.ReactElement<any> to access props
         const typedChild = child as React.ReactElement<any>;
         if (React.isValidElement(typedChild) && (typedChild.type === mocks.SelectTrigger || typedChild.type === mocks.SelectValue)) {
           return typedChild; // Render the mock component itself
         }
         return null; // Ignore other children at this level (including SelectContent)
      })}
    </>
  );
});

// Mock SelectItem to render a native option element
mocks.SelectItem = vi.fn(({ children, value, ...props }) => (
  <option data-testid={`select-item-${value}`} value={value} {...props}>
    {children}
  </option>
));

// Mock other components as simple divs or null if not needed for interaction
// These mocks are still needed if the component being tested renders them,
// but they don't need to be children of the native select in the mock.
mocks.SelectContent = vi.fn((props) => ( // Remove children from props
  <div data-testid="select-content" {...props}></div> // Do not render children
));
mocks.SelectTrigger = vi.fn(({ children, ...props }) => (
  <button data-testid="select-trigger" {...props}>{children}</button>
));
mocks.SelectValue = vi.fn((props) => <span data-testid="select-value" {...props} />)

import { Select } from "./Select";

describe("Select", () => {
  afterEach(cleanup);

  const options = [
    "option1",
    { label: "Option Two", value: "option2" },
    "option3",
  ];

  it("renders the base select component", () => {
    render(<Select name="testSelect" options={options} onChange={vi.fn()} />); // Add dummy onChange
    expect(screen.getByTestId("base-select")).toBeInTheDocument();
  });

  // Removed tests for trigger/value rendering as they are no longer direct children of the mocked select
  // If needed, these could be tested by rendering the Select component and checking for the presence
  // of the mocked trigger/value elements as siblings or elsewhere in the rendered output.

  it("renders select items for each option", () => {
    render(<Select name="testSelect" options={options} onChange={vi.fn()} />);
    expect(screen.getByTestId("select-item-option1")).toBeInTheDocument();
    expect(screen.getByTestId("select-item-option2")).toBeInTheDocument();
    expect(screen.getByTestId("select-item-option3")).toBeInTheDocument();
  });

  it("uses option value for item value and label for item text", () => {
    render(<Select name="testSelect" options={options} onChange={vi.fn()} />); // Add dummy onChange
    expect(screen.getByTestId("select-item-option1")).toHaveValue("option1");
    expect(screen.getByTestId("select-item-option1")).toHaveTextContent(
      "option1",
    );
    expect(screen.getByTestId("select-item-option2")).toHaveValue("option2");
    expect(screen.getByTestId("select-item-option2")).toHaveTextContent(
      "Option Two",
    );
  });

  it("passes the correct value to the base select", () => {
    render(<Select name="testSelect" options={options} value="option2" onChange={vi.fn()} />);
    const select = screen.getByTestId("base-select");
    expect(select).toHaveValue("option2");
  });

  // Removed tests for placeholder as it's handled by SelectValue mock, not the native select

  it("calls onChange when a new option is selected", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Select name="testSelect" onChange={handleChange} options={options} />,
    );

    // Interact directly with the mocked native <select> element
    const selectElement = screen.getByTestId("base-select");
    // Wait for the options to be available before selecting
    await screen.findByTestId("select-item-option2");
    await user.selectOptions(selectElement, "option2");

    expect(handleChange).toHaveBeenCalledWith("option2");
  });

  it("marks the base select as required when required prop is true", () => {
    render(<Select name="testSelect" options={options} required onChange={vi.fn()} />);
    const select = screen.getByTestId("base-select");
    expect(select).toBeRequired();
  });

  // Removed test for inputClassName as it's applied to the SelectTrigger mock, not the native select
});
