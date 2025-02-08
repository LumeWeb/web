import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

// Mock the registerFormComponent to prevent side effects
vi.mock("./index", () => ({
  registerFormComponent: vi.fn(),
}));

// Mock the base editor component
vi.mock("@/components/editor", () => ({
  Editor: vi.fn(
    ({
      enablePreview,
      onChange,
      placeholder,
      required,
      toolbarOptions,
      value,
      ...props
    }) => {
      const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(event.target.value);
      };
      return (
        <textarea
          data-enable-preview={enablePreview}
          data-testid="mock-editor"
          data-toolbar-options={JSON.stringify(toolbarOptions)}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          value={value}
          {...props}
        />
      );
    },
  ),
}));

import { RichText } from "./RichText";

describe("RichText", () => {
  afterEach(cleanup);

  it("renders the mocked base editor component", () => {
    render(<RichText name="testRichText" />);
    expect(screen.getByTestId("mock-editor")).toBeInTheDocument();
  });

  it("passes props to the base editor", () => {
    const handleChange = vi.fn();
    const toolbarOptions = [{ action: "bold", name: "bold" }];
    render(
      <RichText
        enablePreview
        name="testRichText"
        onChange={handleChange}
        placeholder="Enter text"
        required
        toolbarOptions={toolbarOptions}
        value="Initial value"
      />,
    );

    const editor = screen.getByTestId("mock-editor");
    expect(editor).toHaveValue("Initial value");
    expect(editor).toHaveAttribute("placeholder", "Enter text");
    expect(editor).toBeRequired();
    expect(editor).toHaveAttribute("data-enable-preview", "true");
    expect(editor).toHaveAttribute(
      "data-toolbar-options",
      JSON.stringify(toolbarOptions),
    );
  });

  it("calls onChange when the value changes", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<RichText name="testRichText" onChange={handleChange} />);

    const editor = screen.getByTestId("mock-editor");
    await user.type(editor, "New text");

    expect(handleChange).toHaveBeenCalledWith("N");
    expect(handleChange).toHaveBeenCalledWith("Ne");
    expect(handleChange).toHaveBeenCalledWith("New");
    // ... and so on for each character
  });
});
