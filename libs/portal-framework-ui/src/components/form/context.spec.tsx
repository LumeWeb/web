import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { adapters } from "./adapters";
import { FormProvider, useFormContext } from "./context";
import { FormConfig } from "./types";

// Mock adapters to avoid dependency issues, though not strictly necessary for this test
vi.mock("./adapters", () => ({
  adapters: {
    refine: {},
    rhf: {},
  },
}));

// Helper component to consume the context
const ContextConsumer = () => {
  const context = useFormContext();
  return (
    <div data-testid="context-consumer">
      <span data-testid="adapter">{context.adapter}</span>
      <span data-testid="config-fields-length">
        {context.config.fields.length}
      </span>
    </div>
  );
};

describe("Form Context", () => {
  afterEach(cleanup);

  it("FormProvider should provide the correct context values", () => {
    const mockConfig: FormConfig<any> = {
      fields: [{ label: "Field 1", name: "field1" } as any],
    };
    const mockAdapter = "rhf" as keyof typeof adapters;

    render(
      <FormProvider adapter={mockAdapter} config={mockConfig}>
        <ContextConsumer />
      </FormProvider>,
    );

    const consumerElement = screen.getByTestId("context-consumer");
    expect(consumerElement).toBeInTheDocument();

    expect(screen.getByTestId("adapter")).toHaveTextContent(mockAdapter);
    expect(screen.getByTestId("config-fields-length")).toHaveTextContent(
      mockConfig.fields.length.toString(),
    );
  });

  it("useFormContext should throw error if used outside FormProvider", () => {
    // Suppress console error from React context
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {}); // Suppress React's console error

    expect(() => render(<ContextConsumer />)).toThrow(
      "useFormContext must be used within a FormProvider",
    );

    consoleErrorSpy.mockRestore();
  });
});
