import { useNotification } from "@refinedev/core";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";
// Import real RHF FormProvider
import {
  FormProvider as RHFFormProvider,
  UseFormReturn,
} from "react-hook-form";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDialog } from "../dialog";
import { DialogType } from "../dialog/Dialog.types";
import { adapters } from "./adapters";
// Import custom FormProvider (mocked below)
import { FormProvider } from "./context";
import { SchemaForm } from "./SchemaForm";
import { FormConfig } from "./types";

// Mock dependencies
vi.mock("./FormRenderer", () => ({
  FormRenderer: vi.fn(({ fields }) => (
    <div data-testid="mock-form-renderer">
      {fields.map((field: any) => (
        <div key={field.name}>{field.label}</div>
      ))}
    </div>
  )),
}));
vi.mock("../dialog", () => ({
  useDialog: vi.fn(),
}));
vi.mock("@refinedev/core", () => ({
  // Mock other refinedev exports if needed by SchemaForm
  BaseRecord: {}, // Mock BaseRecord if used as a value
  useNotification: vi.fn(),
}));
vi.mock("./adapters", () => ({
  adapters: {
    refine: {
      Controller: vi.fn(), // Keep mocking Controller if adapters use it directly
      // Mock FormProvider to render the real RHF FormProvider but without passing methods
      FormProvider: ({ children }: any) => (
        <RHFFormProvider>{children}</RHFFormProvider>
      ),
      submitHandler: vi.fn(),
      useForm: vi.fn(), // This will return a mock object
    },
    rhf: {
      Controller: vi.fn(), // Keep mocking Controller if adapters use it directly
      // Mock FormProvider to render the real RHF FormProvider but without passing methods
      FormProvider: ({ children }: any) => (
        <RHFFormProvider>{children}</RHFFormProvider>
      ),
      submitHandler: vi.fn(),
      useForm: vi.fn(), // This will return a mock object
    },
  },
}));
vi.mock("./context", () => ({
  // Keep mocking custom FormProvider and useFormContext
  FormProvider: vi.fn(({ adapter, children, config }: any) => (
    <div data-testid={`mock-form-provider-${adapter}`}>{children}</div>
  )),
  useFormContext: vi.fn(),
}));
vi.mock("../actions", () => ({
  ActionListRenderer: vi.fn(({ actions }) => (
    <div data-testid="mock-action-list-renderer">
      {actions.map((action: any) => (
        <button key={action.label}>{action.label}</button>
      ))}
    </div>
  )),
}));
vi.mock("@lumeweb/portal-framework-ui-core", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@lumeweb/portal-framework-ui-core")>();
  return {
    ...actual,
    cn: vi.fn((...classes) => classes.join(" ")), // Simple mock for cn
  };
});

// Define a mock object that looks like UseFormReturn
const createMockFormMethods = () =>
  ({
    control: {}, // Add control as it's often needed
    formState: { isSubmitting: false },
    getValues: vi.fn(() => ({})),
    handleSubmit: vi.fn((onSubmit) => (e?: React.BaseSyntheticEvent) => {
      e?.preventDefault(); // Prevent default form submission
      return onSubmit({}); // Call onSubmit with mock data
    }),
    trigger: vi.fn(), // Add trigger
    watch: vi.fn(() => ({ unsubscribe: vi.fn() })), // Add watch
    // Add other methods if SchemaForm uses them directly
  }) as unknown as UseFormReturn<any>; // Cast for type compatibility

const mockUseDialog = useDialog as vi.Mock;
const mockUseNotification = useNotification as vi.Mock;
const mockAdapters = adapters as any; // Cast to any for easier mocking
const mockCustomFormProvider = FormProvider as vi.Mock; // Mock the custom FormProvider

describe("SchemaForm", () => {
  const mockCloseDialog = vi.fn();
  const mockOpenNotification = vi.fn();
  const mockSetFormMethods = vi.fn();

  // Declare mockFormMethods variable here to be assigned in beforeEach
  let mockFormMethods: UseFormReturn<any>;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Create a fresh mockFormMethods for each test
    mockFormMethods = createMockFormMethods();

    // Setup mocks for dependencies
    mockUseDialog.mockReturnValue({
      currentDialog: { onSuccess: vi.fn(), type: DialogType.FORM },
      setFormMethods: mockSetFormMethods,
    });
    mockUseNotification.mockReturnValue({
      open: mockOpenNotification,
    });

    // Setup adapter useForm mocks to return the fresh mockFormMethods
    mockAdapters.rhf.useForm.mockReturnValue(mockFormMethods);
    mockAdapters.refine.useForm.mockReturnValue({
      ...mockFormMethods,
      refineCore: { onFinish: vi.fn().mockResolvedValue({}) },
    });

    // Setup adapter submitHandler mocks
    mockAdapters.rhf.submitHandler.mockResolvedValue({});
    mockAdapters.refine.submitHandler.mockResolvedValue({});
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.resetAllMocks();
    vi.restoreAllMocks();
  });

  const mockConfig: FormConfig<any> = {
    actionButtons: [{ action: "submit", label: "Save" }],
    fields: [{ label: "Field 1", name: "field1" } as any],
    onError: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue({}),
    onSuccess: vi.fn(),
  };

  it("throws error if config is missing", () => {
    // @ts-expect-error - testing missing config case
    expect(() => render(<SchemaForm />)).toThrow(
      "SchemaForm requires a form config",
    );
  });

  it("renders the form with default RHF adapter", () => {
    render(<SchemaForm closeDialog={mockCloseDialog} config={mockConfig} />);

    expect(mockAdapters.rhf.useForm).toHaveBeenCalledTimes(1);
    expect(mockAdapters.refine.useForm).not.toHaveBeenCalled();
    // Expect the custom FormProvider to be called with the correct adapter
    expect(mockCustomFormProvider).toHaveBeenCalledWith(
      expect.objectContaining({ adapter: "rhf" }),
      {},
    );
    // Expect the real RHF FormProvider (used inside the adapter mock) to be in the document
    expect(screen.getByTestId("mock-rhf-provider")).toBeInTheDocument();
    expect(screen.getByTestId("mock-form-renderer")).toBeInTheDocument();
    expect(screen.getByTestId("mock-action-list-renderer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save/i })).toBeInTheDocument();
  });

  it('uses refine adapter if config.adapter is "refine"', () => {
    const refineConfig = { ...mockConfig, adapter: "refine" as const };
    render(<SchemaForm closeDialog={mockCloseDialog} config={refineConfig} />);

    expect(mockAdapters.refine.useForm).toHaveBeenCalledTimes(1);
    expect(mockAdapters.rhf.useForm).not.toHaveBeenCalled();
    expect(mockCustomFormProvider).toHaveBeenCalledWith(
      expect.objectContaining({ adapter: "refine" }),
      {},
    );
    expect(screen.getByTestId("mock-refine-provider")).toBeInTheDocument();
  });

  it("uses refine adapter if config.refine is true", () => {
    const refineConfig = { ...mockConfig, refine: true };
    render(<SchemaForm closeDialog={mockCloseDialog} config={refineConfig} />);

    expect(mockAdapters.refine.useForm).toHaveBeenCalledTimes(1);
    expect(mockAdapters.rhf.useForm).not.toHaveBeenCalled();
    expect(mockCustomFormProvider).toHaveBeenCalledWith(
      expect.objectContaining({ adapter: "refine" }),
      {},
    );
    expect(screen.getByTestId("mock-refine-provider")).toBeInTheDocument();
  });

  it("uses refine adapter if config.refineCoreProps.resource is present", () => {
    const refineConfig = {
      ...mockConfig,
      refineCoreProps: { resource: "posts" },
    };
    render(<SchemaForm closeDialog={mockCloseDialog} config={refineConfig} />);

    expect(mockAdapters.refine.useForm).toHaveBeenCalledTimes(1);
    expect(mockAdapters.rhf.useForm).not.toHaveBeenCalled();
    expect(mockCustomFormProvider).toHaveBeenCalledWith(
      expect.objectContaining({ adapter: "refine" }),
      {},
    );
    expect(screen.getByTestId("mock-refine-provider")).toBeInTheDocument();
  });

  it("calls setFormMethods with the form methods", () => {
    render(<SchemaForm closeDialog={mockCloseDialog} config={mockConfig} />);
    expect(mockSetFormMethods).toHaveBeenCalledWith(mockFormMethods);
  });

  it("calls adapter submitHandler on form submission", async () => {
    const submitResult = { id: 1, name: "test" };
    mockAdapters.rhf.submitHandler.mockResolvedValue(submitResult);

    render(<SchemaForm closeDialog={mockCloseDialog} config={mockConfig} />);

    // Find the form element within the RHF FormProvider mock
    const form = screen.getByTestId("mock-rhf-provider").closest("form");
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockFormMethods.handleSubmit).toHaveBeenCalledTimes(1);
      expect(mockAdapters.rhf.submitHandler).toHaveBeenCalledWith(
        mockConfig,
        mockFormMethods,
      );
    });
  });

  it("calls onSuccess callback on successful submission", async () => {
    const submitResult = { id: 1, name: "test" };
    mockAdapters.rhf.submitHandler.mockResolvedValue(submitResult);
    const mockOnSuccess = vi.fn();
    const configWithSuccess = { ...mockConfig, onSuccess: mockOnSuccess };

    render(
      <SchemaForm closeDialog={mockCloseDialog} config={configWithSuccess} />,
    );

    const form = screen.getByTestId("mock-rhf-provider").closest("form");
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(
        submitResult,
        mockFormMethods.getValues(),
      );
    });
  });

  it("calls dialog onSuccess callback if dialog type is form", async () => {
    const submitResult = { id: 1, name: "test" };
    mockAdapters.rhf.submitHandler.mockResolvedValue(submitResult);
    const mockDialogOnSuccess = vi.fn();
    mockUseDialog.mockReturnValue({
      currentDialog: { onSuccess: mockDialogOnSuccess, type: DialogType.FORM },
      setFormMethods: mockSetFormMethods,
    });

    render(<SchemaForm closeDialog={mockCloseDialog} config={mockConfig} />);

    const form = screen.getByTestId("mock-rhf-provider").closest("form");
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockDialogOnSuccess).toHaveBeenCalledWith(
        submitResult,
        mockFormMethods.getValues(),
      );
    });
  });

  it("closes dialog on successful submission by default", async () => {
    mockAdapters.rhf.submitHandler.mockResolvedValue({});

    render(<SchemaForm closeDialog={mockCloseDialog} config={mockConfig} />);

    const form = screen.getByTestId("mock-rhf-provider").closest("form");
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockCloseDialog).toHaveBeenCalledTimes(1);
    });
  });

  it("does not close dialog on successful submission if closeOnSubmit is false", async () => {
    mockAdapters.rhf.submitHandler.mockResolvedValue({});
    const configNoClose = { ...mockConfig, closeOnSubmit: false };

    render(<SchemaForm closeDialog={mockCloseDialog} config={configNoClose} />);

    const form = screen.getByTestId("mock-rhf-provider").closest("form");
    fireEvent.submit(form!);

    await waitFor(() => {
      // Wait for submit handler to finish
      expect(mockAdapters.rhf.submitHandler).toHaveBeenCalled();
    });
    // Give a moment for the setTimeout in SchemaForm to potentially run if closeOnSubmit was true
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(mockCloseDialog).not.toHaveBeenCalled();
  });

  it("calls onError callback on submission error", async () => {
    const submitError = new Error("Submission failed");
    mockAdapters.rhf.submitHandler.mockRejectedValue(submitError);
    const mockOnError = vi.fn();
    const configWithError = { ...mockConfig, onError: mockOnError };

    render(
      <SchemaForm closeDialog={mockCloseDialog} config={configWithError} />,
    );

    const form = screen.getByTestId("mock-rhf-provider").closest("form");
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(submitError);
    });
  });

  it("opens notification on submission error for non-refine adapter if errorNotification is configured", async () => {
    const submitError = new Error("Submission failed");
    mockAdapters.rhf.submitHandler.mockRejectedValue(submitError);
    const mockErrorNotification = vi.fn(() => ({
      message: "Failed",
      type: "error",
    }));
    const configWithErrorNotification = {
      ...mockConfig,
      errorNotification: mockErrorNotification,
    };

    render(
      <SchemaForm
        closeDialog={mockCloseDialog}
        config={configWithErrorNotification}
      />,
    );

    const form = screen.getByTestId("mock-rhf-provider").closest("form");
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockErrorNotification).toHaveBeenCalledWith(submitError);
      expect(mockOpenNotification).toHaveBeenCalledWith({
        message: "Failed",
        type: "error",
      });
    });
  });

  it("does not open notification for refine adapter errors (refine handles its own)", async () => {
    const submitError = new Error("Submission failed");
    mockAdapters.refine.submitHandler.mockRejectedValue(submitError);
    const mockErrorNotification = vi.fn(() => ({
      message: "Failed",
      type: "error",
    }));
    const configWithErrorNotification = {
      ...mockConfig,
      adapter: "refine" as const,
      errorNotification: mockErrorNotification,
    };

    render(
      <SchemaForm
        closeDialog={mockCloseDialog}
        config={configWithErrorNotification}
      />,
    );

    const form = screen.getByTestId("mock-refine-provider").closest("form");
    fireEvent.submit(form!);

    await waitFor(() => {
      // Wait for submit handler to finish
      expect(mockAdapters.refine.submitHandler).toHaveBeenCalled();
    });
    expect(mockErrorNotification).not.toHaveBeenCalled();
    expect(mockOpenNotification).not.toHaveBeenCalled();
  });

  it("renders custom footer if provided as a function", () => {
    const mockFooter = vi.fn(() => (
      <div data-testid="custom-footer">Custom Footer</div>
    ));
    const configWithFooter = { ...mockConfig, footer: mockFooter };

    render(
      <SchemaForm closeDialog={mockCloseDialog} config={configWithFooter} />,
    );

    expect(screen.getByTestId("custom-footer")).toBeInTheDocument();
    expect(mockFooter).toHaveBeenCalledWith(mockFormMethods, mockCloseDialog);
    expect(
      screen.queryByTestId("mock-action-list-renderer"),
    ).not.toBeInTheDocument();
  });

  it("renders custom footer if provided as ReactNode", () => {
    const customFooterNode = (
      <div data-testid="custom-footer-node">Custom Footer Node</div>
    );
    const configWithFooter = { ...mockConfig, footer: customFooterNode };

    render(
      <SchemaForm closeDialog={mockCloseDialog} config={configWithFooter} />,
    );

    expect(screen.getByTestId("custom-footer-node")).toBeInTheDocument();
    expect(
      screen.queryByTestId("mock-action-list-renderer"),
    ).not.toBeInTheDocument();
  });

  it("renders action buttons if footer is not provided", () => {
    const configWithoutFooter = { ...mockConfig, footer: undefined };
    render(
      <SchemaForm closeDialog={mockCloseDialog} config={configWithoutFooter} />,
    );

    expect(screen.getByTestId("mock-action-list-renderer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save/i })).toBeInTheDocument();
  });

  it("renders action buttons if footer is an empty array", () => {
    const configWithEmptyFooter = { ...mockConfig, footer: [] };
    render(
      <SchemaForm
        closeDialog={mockCloseDialog}
        config={configWithEmptyFooter}
      />,
    );

    expect(screen.getByTestId("mock-action-list-renderer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save/i })).toBeInTheDocument();
  });

  it("passes actionButtons from config to ActionListRenderer", () => {
    const actions = [
      { action: "custom", label: "Action 1" },
      { action: "cancel", label: "Action 2" },
    ];
    const configWithActions = {
      ...mockConfig,
      actionButtons: actions,
      footer: undefined,
    };

    render(
      <SchemaForm closeDialog={mockCloseDialog} config={configWithActions} />,
    );

    expect(screen.getByTestId("mock-action-list-renderer")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Action 1/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Action 2/i }),
    ).toBeInTheDocument();
  });

  it("passes actionButtonsLayout from config to ActionListRenderer", () => {
    const configWithLayout = {
      ...mockConfig,
      actionButtonsLayout: "vertical" as const,
      footer: undefined,
    };

    render(
      <SchemaForm closeDialog={mockCloseDialog} config={configWithLayout} />,
    );

    expect(screen.getByTestId("mock-action-list-renderer")).toBeInTheDocument();
    // Check if layout prop was passed (mock ActionListRenderer doesn't render based on layout, just checks prop)
    expect(screen.getByTestId("mock-action-list-renderer")).toHaveAttribute(
      "layout",
      "vertical",
    );
  });

  it("applies formClassName and layout classes", () => {
    const configWithClasses = {
      ...mockConfig,
      formClassName: "extra-class",
      layout: "grid" as const,
    };

    render(
      <SchemaForm closeDialog={mockCloseDialog} config={configWithClasses} />,
    );

    const formElement = screen.getByTestId("mock-rhf-provider").closest("form");
    expect(formElement).toHaveClass("space-y-4");
    expect(formElement).toHaveClass("extra-class");
    expect(formElement).toHaveClass("grid");
    expect(formElement).toHaveClass("gap-4");
  });
});
