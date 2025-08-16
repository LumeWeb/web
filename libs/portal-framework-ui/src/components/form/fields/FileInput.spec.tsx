import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FileInput } from "./FileInput";

// Mock the registerFormComponent to prevent side effects
vi.mock("./index", () => ({
  registerFormComponent: vi.fn(),
}));

// Mock the base Input component from ui-core
vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  Input: vi.fn((props) => <input data-testid="base-input" {...props} />),
}));

describe("FileInput", () => {
  afterEach(cleanup);

  it("renders the base input component with type file", () => {
    render(<FileInput name="testFileInput" />);
    const input = screen.getByTestId("base-input");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "file");
  });

  it("passes disabled prop to the base input", () => {
    render(<FileInput disabled name="testFileInput" />);
    const input = screen.getByTestId("base-input");
    expect(input).toBeDisabled();
  });

  it("calls onChange with FileList when files are selected", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<FileInput name="testFileInput" onChange={handleChange} />);

    const input = screen.getByTestId("base-input");
    const file = new File(["hello"], "hello.png", { type: "image/png" });

    await user.upload(input, file);

    // Check if onChange was called with a FileList containing the file
    expect(handleChange).toHaveBeenCalled();
    const fileList = handleChange.mock.calls[0][0];
    expect(fileList).toBeInstanceOf(FileList);
    expect(fileList.length).toBe(1);
    expect(fileList[0]).toBe(file);
  });

  it("calls onBlur when the input is blurred", async () => {
    const user = userEvent.setup();
    const handleBlur = vi.fn();
    render(<FileInput name="testFileInput" onBlur={handleBlur} />);

    const input = screen.getByTestId("base-input");
    await user.click(input); // Focus the input
    await user.tab(); // Blur the input

    expect(handleBlur).toHaveBeenCalled();
  });

  // Note: Testing the 'value' prop for FileList is tricky as input[type="file"].value is read-only
  // and cannot be programmatically set for security reasons. The component doesn't seem to
  // rely on setting the value prop on the input itself, but rather receives it from RHF.
  // A test for how the component *uses* the value prop (e.g., displaying file names)
  // would require modifying the component to display this information.
});
