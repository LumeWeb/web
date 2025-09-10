import { cleanup, render, screen, waitFor } from "@testing-library/react";
import React from "react";
// Import real RHF components and hooks
import {
  FormProvider as RHFFormProvider,
  useForm as useRHFForm,
} from "react-hook-form";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useFormContext } from "./context";
import { FormFieldType, getFormComponent } from "./fields";
import { FormRenderer } from "./FormRenderer";
import { FormFieldConfig } from "./types";

// Mock dependencies
vi.mock("./context", () => ({
  // Mock custom FormProvider if it's used in the component under test's rendering tree
  // FormRenderer uses it, so we keep this mock simple
  FormProvider: ({ children }: any) => <div>{children}</div>,
  useFormContext: vi.fn(),
}));
vi.mock("./fields", () => ({
  FormFieldType: {
    CUSTOM: "custom",
    TEXT: "text",
    // Add other types as needed for tests
  },
  getFormComponent: vi.fn(),
}));
// Do NOT mock react-hook-form entirely. We need the real FormProvider and useForm.
// We will use the real hooks and components in our test wrapper.

vi.mock("@lumeweb/portal-framework-ui-core", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@lumeweb/portal-framework-ui-core")>();
  return {
    ...actual,
    Spinner: () => <div data-testid="spinner">Loading...</div>,
    // Keep other real exports like FormItem, FormLabel, etc.
  };
});
vi.mock("./adapters", () => ({
  adapters: {
    rhf: {
      // We don't need to mock useForm or FormProvider here, SchemaForm handles that.
      // FormRenderer uses the real RHF context provided by the wrapper.
      submitHandler: vi.fn(),
    },
  },
}));

// Mock our custom useFormContext
const mockUseFormContext = useFormContext as vi.Mock;
// Mock getFormComponent
const mockGetComponent = getFormComponent as vi.Mock;

// Create a proper wrapper that provides the REAL RHF context and exposes methods
const TestWrapper = ({
  children,
}: {
  children: (methods: ReturnType<typeof useRHFForm>) => React.ReactNode;
}) => {
  // Use the real RHF useForm hook
  const methods = useRHFForm();
  return (
    <div>
      {/* Use the real RHF FormProvider and pass the real methods */}
      <RHFFormProvider {...methods}>{children(methods)}</RHFFormProvider>
    </div>
  );
};

describe("FormRenderer", () => {
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Setup custom form context mock - DO NOT provide RHF methods here
    mockUseFormContext.mockReturnValue({
      adapter: "rhf",
      config: { fields: [] },
      // methods are NOT provided by the custom context in this test setup
      // FormRenderer gets RHF methods from the real useRHFContext
    });

    // Setup component mock
    mockGetComponent.mockReturnValue(
      vi.fn(({ onChange, value }) => (
        <input data-testid="mock-input" onChange={onChange} value={value} />
      )),
    );
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.resetAllMocks();
    vi.restoreAllMocks();
  });

  it.skip("renders fields based on the config", () => {
    const fields: FormFieldConfig<any>[] = [
      { label: "Field 1 Label", name: "field1", type: FormFieldType.TEXT },
      { label: "Field 2 Label", name: "field2", type: FormFieldType.TEXT },
    ];

    render(
      <TestWrapper>
        {(methods) => <FormRenderer fields={fields} />}
      </TestWrapper>,
    );

    // Expect the real RHF Controller to be used, which is mocked internally by RHF
    // We check for the data-testid added by our mock of the RHF Controller
    expect(screen.getByTestId("form-field-field1")).toBeInTheDocument();
    expect(screen.getByTestId("form-field-field2")).toBeInTheDocument();
    // Check for elements rendered by the mocked RHF components (FormItem, FormLabel, etc.)
    expect(screen.getAllByTestId("form-item").length).toBe(2);
    expect(screen.getAllByTestId("form-label").length).toBe(2);
    expect(screen.getByText("Field 1 Label")).toBeInTheDocument();
    expect(screen.getByText("Field 2 Label")).toBeInTheDocument();
    expect(screen.getAllByTestId("mock-input").length).toBe(2);
  });

  it.skip("renders custom component for CUSTOM type", () => {
    const MockCustomComponent = vi.fn(() => (
      <div data-testid="custom-component">Custom</div>
    ));
    const fields: FormFieldConfig<any>[] = [
      {
        component: MockCustomComponent,
        label: "Custom Label",
        name: "customField",
        type: FormFieldType.CUSTOM,
      },
    ];

    // Ensure getFormComponent is not called for CUSTOM type
    mockGetComponent.mockReturnValue(undefined);

    render(
      <TestWrapper>
        {(methods) => <FormRenderer fields={fields} />}
      </TestWrapper>,
    );

    expect(screen.getByTestId("form-field-customField")).toBeInTheDocument();
    expect(screen.getByTestId("custom-component")).toBeInTheDocument();
    expect(MockCustomComponent).toHaveBeenCalledTimes(1);
    expect(mockGetComponent).not.toHaveBeenCalledWith(FormFieldType.CUSTOM);
  });

  it.skip("shows required indicator if field is required and visible", () => {
    const fields: FormFieldConfig<any>[] = [
      {
        label: "Required Field",
        name: "requiredField",
        required: true,
        type: FormFieldType.TEXT,
      },
    ];

    render(
      <TestWrapper>
        {(methods) => <FormRenderer fields={fields} />}
      </TestWrapper>,
    );

    const label = screen.getByText("Required Field");
    expect(label.querySelector("span.text-destructive")).toBeInTheDocument();
  });

  it.skip("hides the field if requires condition is not met", async () => {
    const fields: FormFieldConfig<any>[] = [
      {
        dependencies: ["otherField"],
        label: "Conditional Field",
        name: "conditionalField",
        requires: { otherField: "correctValue" },
        type: FormFieldType.TEXT,
      },
    ];

    // Render with TestWrapper and get methods
    render(
      <TestWrapper>
        {(methods) => {
          // Set the value that does NOT meet the requirement
          methods.setValue("otherField", "wrongValue");
          return <FormRenderer fields={fields} />;
        }}
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(
        screen.queryByTestId("form-field-conditionalField"),
      ).not.toBeInTheDocument();
    });
  });

  it.skip("shows the field if requires condition is met", async () => {
    const fields: FormFieldConfig<any>[] = [
      {
        dependencies: ["otherField"],
        label: "Conditional Field",
        name: "conditionalField",
        requires: { otherField: "correctValue" },
        type: FormFieldType.TEXT,
      },
    ];

    // Render with TestWrapper and get methods
    render(
      <TestWrapper>
        {(methods) => {
          // Set the value that MEETS the requirement
          methods.setValue("otherField", "correctValue");
          return <FormRenderer fields={fields} />;
        }}
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("form-field-conditionalField"),
      ).toBeInTheDocument();
    });
  });

  it.skip("hides the field if show function returns false", async () => {
    const fields: FormFieldConfig<any>[] = [
      {
        dependencies: ["otherField"],
        label: "Conditional Field",
        name: "conditionalField",
        show: (values) => !values.otherField,
        type: FormFieldType.TEXT,
      },
    ];

    // Render with TestWrapper and get methods
    render(
      <TestWrapper>
        {(methods) => {
          // Set the value that makes show return false
          methods.setValue("otherField", true);
          return <FormRenderer fields={fields} />;
        }}
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(
        screen.queryByTestId("form-field-conditionalField"),
      ).not.toBeInTheDocument();
    });
  });

  it.skip("shows the field if show function returns true", async () => {
    const fields: FormFieldConfig<any>[] = [
      {
        dependencies: ["otherField"],
        label: "Conditional Field",
        name: "conditionalField",
        show: (values) => !values.otherField,
        type: FormFieldType.TEXT,
      },
    ];

    // Render with TestWrapper and get methods
    render(
      <TestWrapper>
        {(methods) => {
          // Set the value that makes show return true
          methods.setValue("otherField", false);
          return <FormRenderer fields={fields} />;
        }}
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("form-field-conditionalField"),
      ).toBeInTheDocument();
    });
  });

  it.skip("handles async show function", async () => {
    const fields: FormFieldConfig<any>[] = [
      {
        dependencies: ["otherField"],
        label: "Conditional Field",
        name: "conditionalField",
        show: async (values) => {
          await new Promise((resolve) => setTimeout(resolve, 50)); // Simulate async work
          return values.otherField;
        },
        type: FormFieldType.TEXT,
      },
    ];

    render(
      <TestWrapper>
        {(methods) => {
          // Set the value that makes show return true after async
          methods.setValue("otherField", true);
          return <FormRenderer fields={fields} />;
        }}
      </TestWrapper>,
    );

    // Should show spinner initially
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
    expect(
      screen.queryByTestId("form-field-conditionalField"),
    ).not.toBeInTheDocument();

    // Should show field after async resolves
    await waitFor(() => {
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
      expect(
        screen.getByTestId("form-field-conditionalField"),
      ).toBeInTheDocument();
    });
  });

  it("logs warning if component type is not registered and not CUSTOM", () => {
    const consoleSpy = vi.spyOn(console, "warn");
    mockGetComponent.mockReturnValue(undefined); // Ensure it's not found

    const fields: FormFieldConfig<any>[] = [
      {
        label: "Unknown Field",
        name: "unknownField",
        type: "unknownType" as FormFieldType,
      },
    ];

    render(
      <TestWrapper>
        {(methods) => <FormRenderer fields={fields} />}
      </TestWrapper>,
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      "No component registered for form field type: unknownType",
    );
    expect(
      screen.queryByTestId("form-field-unknownField"),
    ).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it("does not render if adapter is not found (throws error)", () => {
    mockUseFormContext.mockReturnValue({
      adapter: "unknownAdapter",
      config: {},
    });
    const fields: FormFieldConfig<any>[] = [
      { name: "field1", type: FormFieldType.TEXT },
    ];

    // This test does not use the TestWrapper, so no change needed here.
    expect(() => render(<FormRenderer fields={fields} />)).toThrow(
      'Form adapter "unknownAdapter" is not registered',
    );
  });
});
