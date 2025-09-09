import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";
import {
  FormProvider as RHFFormProvider,
  UseFormReturn,
  useForm as useRHFForm,
} from "react-hook-form";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDialog } from "../dialog";
import { StepSchemaForm } from "./StepSchemaForm";
import { FormConfig, WizardFormConfig } from "./types";
import { WizardFooter } from "./WizardFooter";
import { WizardForm } from "./WizardForm";
import { WizardHeader } from "./WizardHeader";
import { WizardStepContent } from "./WizardStepContent";

// Mock dependencies
vi.mock("../dialog", () => ({
  useDialog: vi.fn(),
}));

// Create a proper wrapper that provides the REAL RHF context and exposes methods
const TestWrapper = ({
  children,
}: {
  children: (methods: ReturnType<typeof useRHFForm>) => React.ReactNode;
}) => {
  const methods = useRHFForm();
  return (
    <div>
      <RHFFormProvider {...methods}>{children(methods)}</RHFFormProvider>
    </div>
  );
};

describe("Wizard Components", () => {
  const mockCloseDialog = vi.fn();
  const mockSetFormMethods = vi.fn();
  let mockFormMethods: UseFormReturn<any>;

  const createMockFormMethods = () =>
    ({
      control: {},
      formState: { isSubmitting: false },
      getValues: vi.fn(() => ({})),
      handleSubmit: vi.fn((onSubmit) => (e?: React.BaseSyntheticEvent) => {
        e?.preventDefault();
        return onSubmit({});
      }),
      trigger: vi.fn(),
      watch: vi.fn(() => ({ unsubscribe: vi.fn() })),
    }) as unknown as UseFormReturn<any>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFormMethods = createMockFormMethods();

    (useDialog as vi.Mock).mockReturnValue({
      formMethods: mockFormMethods,
      setFormMethods: mockSetFormMethods,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.resetAllMocks();
    vi.restoreAllMocks();
  });

  const wizardConfig: WizardFormConfig<any> = {
    onSubmit: vi.fn().mockResolvedValue({}),
    stepBehavior: {
      defaultStep: 0,
      isBackValidate: false,
    },
    steps: [
      {
        description: "First step description",
        fields: [{ label: "Field 1", name: "field1", type: "text" } as any],
        icon: <div data-testid="step-1-icon">Icon1</div>,
        shortTitle: "S1",
        title: "Step 1",
      },
      {
        description: "Second step description",
        fields: [{ label: "Field 2", name: "field2", type: "text" } as any],
        icon: <div data-testid="step-2-icon">Icon2</div>,
        shortTitle: "S2",
        title: "Step 2",
      },
      {
        description: "Third step description",
        fields: [{ label: "Field 3", name: "field3", type: "text" } as any],
        icon: <div data-testid="step-3-icon">Icon3</div>,
        shortTitle: "S3",
        title: "Step 3",
      },
    ],
  };

  describe("WizardForm", () => {
    it("renders correctly with default configuration", () => {
      render(
        <TestWrapper>
          {(methods) => (
            <WizardForm closeDialog={mockCloseDialog} config={wizardConfig} />
          )}
        </TestWrapper>,
      );

      // Check that WizardHeader is rendered
      expect(screen.getByTestId("step-1-icon")).toBeInTheDocument();
      expect(screen.getByText("S1")).toBeInTheDocument();
      expect(screen.getByText("S2")).toBeInTheDocument();
      expect(screen.getByText("S3")).toBeInTheDocument();

      // Check that StepSchemaForm is rendered
      expect(screen.getByText("Field 1")).toBeInTheDocument();
      expect(screen.getByText("First step description")).toBeInTheDocument();
    });

    it("passes wizard configuration to StepSchemaForm", () => {
      render(
        <TestWrapper>
          {(methods) => (
            <WizardForm closeDialog={mockCloseDialog} config={wizardConfig} />
          )}
        </TestWrapper>,
      );

      // Verify that the step fields are rendered
      expect(screen.getByText("Field 1")).toBeInTheDocument();
      expect(screen.queryByText("Field 2")).not.toBeInTheDocument();
      expect(screen.queryByText("Field 3")).not.toBeInTheDocument();
    });

    it("applies custom wizard class names", () => {
      const customConfig = {
        ...wizardConfig,
        footerClassName: "custom-footer-class",
        headerClassName: "custom-header-class",
        wizardClassName: "custom-wizard-class",
      };

      render(
        <TestWrapper>
          {(methods) => (
            <WizardForm closeDialog={mockCloseDialog} config={customConfig} />
          )}
        </TestWrapper>,
      );

      const wizardContainer = screen
        .getByText("Field 1")
        .closest(".custom-wizard-class");
      expect(wizardContainer).toBeInTheDocument();
    });
  });

  describe("WizardHeader", () => {
    it("renders step headers with icons, titles and descriptions", () => {
      render(<WizardHeader currentStep={0} steps={wizardConfig.steps} />);

      expect(screen.getByTestId("step-1-icon")).toBeInTheDocument();
      expect(screen.getByTestId("step-2-icon")).toBeInTheDocument();
      expect(screen.getByTestId("step-3-icon")).toBeInTheDocument();

      expect(screen.getByText("S1")).toBeInTheDocument();
      expect(screen.getByText("S2")).toBeInTheDocument();
      expect(screen.getByText("S3")).toBeInTheDocument();

      expect(screen.getByText("First step description")).toBeInTheDocument();
      expect(screen.getByText("Second step description")).toBeInTheDocument();
      expect(screen.getByText("Third step description")).toBeInTheDocument();
    });

    it("handles step navigation correctly", () => {
      const mockOnStepClick = vi.fn();
      render(
        <WizardHeader
          currentStep={1}
          onStepClick={mockOnStepClick}
          steps={wizardConfig.steps}
        />,
      );

      // Click on first step (should work as it's completed)
      const firstStep = screen.getByText("S1").closest("div");
      fireEvent.click(firstStep!);
      expect(mockOnStepClick).toHaveBeenCalledWith(0);

      // Click on second step (current step - should work)
      const secondStep = screen.getByText("S2").closest("div");
      fireEvent.click(secondStep!);
      expect(mockOnStepClick).toHaveBeenCalledWith(1);

      // Click on third step (next step - should be disabled)
      const thirdStep = screen.getByText("S3").closest("div");
      fireEvent.click(thirdStep!);
      expect(mockOnStepClick).not.toHaveBeenCalledWith(2);
    });

    it("respects disabled steps configuration", () => {
      const mockOnStepClick = vi.fn();
      render(
        <WizardHeader
          currentStep={1}
          disabledSteps={[0]}
          onStepClick={mockOnStepClick}
          steps={wizardConfig.steps}
        />,
      );

      // First step should be disabled
      const firstStep = screen.getByText("S1").closest("div");
      fireEvent.click(firstStep!);
      expect(mockOnStepClick).not.toHaveBeenCalledWith(0);
    });

    it("hides titles and descriptions when configured", () => {
      render(
        <WizardHeader
          currentStep={0}
          showDescriptions={false}
          showTitles={false}
          steps={wizardConfig.steps}
        />,
      );

      expect(screen.queryByText("S1")).not.toBeInTheDocument();
      expect(
        screen.queryByText("First step description"),
      ).not.toBeInTheDocument();
    });
  });

  describe("WizardStepContent", () => {
    it("renders step content when active", () => {
      render(
        <WizardStepContent
          description="Test Description"
          icon={<div data-testid="test-icon">Icon</div>}
          isActive={true}
          title="Test Step">
          <div data-testid="step-content">Content</div>
        </WizardStepContent>,
      );

      expect(screen.getByText("Test Step")).toBeInTheDocument();
      expect(screen.getByText("Test Description")).toBeInTheDocument();
      expect(screen.getByTestId("test-icon")).toBeInTheDocument();
      expect(screen.getByTestId("step-content")).toBeInTheDocument();
    });

    it("does not render when not active", () => {
      render(
        <WizardStepContent
          description="Test Description"
          icon={<div data-testid="test-icon">Icon</div>}
          isActive={false}
          title="Test Step">
          <div data-testid="step-content">Content</div>
        </WizardStepContent>,
      );

      expect(screen.queryByTestId("step-content")).not.toBeInTheDocument();
    });

    it("renders children without header when no title/description/icon provided", () => {
      render(
        <WizardStepContent isActive={true}>
          <div data-testid="step-content">Content</div>
        </WizardStepContent>,
      );

      expect(screen.getByTestId("step-content")).toBeInTheDocument();
      expect(screen.queryByText("Test Step")).not.toBeInTheDocument();
    });
  });

  describe("WizardFooter", () => {
    it("renders step navigation controls correctly", () => {
      render(
        <WizardFooter
          currentStep={0}
          formMethods={mockFormMethods}
          isFirstStep={true}
          isLastStep={false}
          isSubmitting={false}
          onBack={vi.fn()}
          onNext={vi.fn()}
          onSubmit={vi.fn()}
          totalSteps={3}
        />,
      );

      expect(screen.getByText("Back")).toBeInTheDocument();
      expect(screen.getByText("Next")).toBeInTheDocument();
      expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    });

    it("renders submit button on last step", () => {
      render(
        <WizardFooter
          currentStep={2}
          formMethods={mockFormMethods}
          isFirstStep={false}
          isLastStep={true}
          isSubmitting={false}
          onBack={vi.fn()}
          onNext={vi.fn()}
          onSubmit={vi.fn()}
          submitLabel="Finish Registration"
          totalSteps={3}
        />,
      );

      expect(screen.getByText("Back")).toBeInTheDocument();
      expect(screen.getByText("Finish Registration")).toBeInTheDocument();
      expect(screen.getByText("Step 3 of 3")).toBeInTheDocument();
    });

    it("disables back button on first step", () => {
      render(
        <WizardFooter
          currentStep={0}
          formMethods={mockFormMethods}
          isFirstStep={true}
          isLastStep={false}
          isSubmitting={false}
          onBack={vi.fn()}
          onNext={vi.fn()}
          onSubmit={vi.fn()}
          totalSteps={3}
        />,
      );

      const backButton = screen.getByText("Back").closest("button");
      expect(backButton).toBeDisabled();
    });

    it("disables navigation during submission", () => {
      render(
        <WizardFooter
          currentStep={0}
          formMethods={mockFormMethods}
          isFirstStep={true}
          isLastStep={false}
          isSubmitting={true}
          onBack={vi.fn()}
          onNext={vi.fn()}
          onSubmit={vi.fn()}
          totalSteps={3}
        />,
      );

      const backButton = screen.getByText("Back").closest("button");
      const nextButton = screen.getByText("Next").closest("button");

      expect(backButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });

    it("shows progress percentage correctly", () => {
      render(
        <WizardFooter
          currentStep={1}
          formMethods={mockFormMethods}
          isFirstStep={false}
          isLastStep={false}
          isSubmitting={false}
          onBack={vi.fn()}
          onNext={vi.fn()}
          onSubmit={vi.fn()}
          totalSteps={3}
        />,
      );

      expect(screen.getByText("67% complete")).toBeInTheDocument();
    });
  });

  describe("Step Navigation", () => {
    it("navigates to next step correctly", async () => {
      render(
        <TestWrapper>
          {(methods) => (
            <WizardForm closeDialog={mockCloseDialog} config={wizardConfig} />
          )}
        </TestWrapper>,
      );

      // Initially on step 0
      expect(screen.getByText("Field 1")).toBeInTheDocument();
      expect(screen.queryByText("Field 2")).not.toBeInTheDocument();

      // Navigate to next step
      const nextButton = screen.getByText("Next").closest("button");
      fireEvent.click(nextButton!);

      // Should now be on step 1
      await waitFor(() => {
        expect(screen.getByText("Field 2")).toBeInTheDocument();
        expect(screen.queryByText("Field 1")).not.toBeInTheDocument();
      });
    });

    it("navigates to previous step correctly", async () => {
      render(
        <TestWrapper>
          {(methods) => (
            <WizardForm
              closeDialog={mockCloseDialog}
              config={{
                ...wizardConfig,
                stepBehavior: { defaultStep: 1 },
              }}
            />
          )}
        </TestWrapper>,
      );

      // Initially on step 1
      expect(screen.getByText("Field 2")).toBeInTheDocument();
      expect(screen.queryByText("Field 1")).not.toBeInTheDocument();

      // Navigate to previous step
      const backButton = screen.getByText("Back").closest("button");
      fireEvent.click(backButton!);

      // Should now be on step 0
      await waitFor(() => {
        expect(screen.getByText("Field 1")).toBeInTheDocument();
        expect(screen.queryByText("Field 2")).not.toBeInTheDocument();
      });
    });

    it("respects step navigation disabled configuration", () => {
      const disabledConfig: WizardFormConfig<any> = {
        ...wizardConfig,
        allowStepNavigation: false,
      };

      render(
        <TestWrapper>
          {(methods) => (
            <WizardForm closeDialog={mockCloseDialog} config={disabledConfig} />
          )}
        </TestWrapper>,
      );

      // Try to click on a step - should not navigate
      const stepElement = screen.getByText("S2").closest("div");
      fireEvent.click(stepElement!);

      // Should still be on step 0
      expect(screen.getByText("Field 1")).toBeInTheDocument();
      expect(screen.queryByText("Field 2")).not.toBeInTheDocument();
    });
  });

  describe("Dynamic Submit Labels", () => {
    it("uses dynamic submit labels based on form values", async () => {
      const dynamicLabelConfig: WizardFormConfig<any> = {
        ...wizardConfig,
        steps: [
          {
            ...wizardConfig.steps[0],
            submitLabel: (values) =>
              values.field1 ? "Save and Continue" : "Next",
          },
          {
            ...wizardConfig.steps[1],
            submitLabel: () => "Proceed to Final Step",
          },
          {
            ...wizardConfig.steps[2],
            submitLabel: () => "Complete Registration",
          },
        ],
      };

      render(
        <TestWrapper>
          {(methods) => (
            <WizardForm
              closeDialog={mockCloseDialog}
              config={dynamicLabelConfig}
            />
          )}
        </TestWrapper>,
      );

      // Initially should show "Next" since field1 value is empty
      expect(screen.getByText("Next")).toBeInTheDocument();

      // Mock form values to simulate field1 having a value
      mockFormMethods.getValues.mockReturnValue({ field1: "test value" });

      // Re-render to get updated label
      render(
        <TestWrapper>
          {(methods) => (
            <WizardForm
              closeDialog={mockCloseDialog}
              config={dynamicLabelConfig}
            />
          )}
        </TestWrapper>,
      );

      // Should now show "Save and Continue"
      expect(screen.getByText("Save and Continue")).toBeInTheDocument();
    });
  });

  describe("Wizard Configuration Options", () => {
    it("hides step progress when configured", () => {
      const noProgressConfig: WizardFormConfig<any> = {
        ...wizardConfig,
        showStepProgress: false,
      };

      render(
        <TestWrapper>
          {(methods) => (
            <WizardForm
              closeDialog={mockCloseDialog}
              config={noProgressConfig}
            />
          )}
        </TestWrapper>,
      );

      // With showStepProgress: false, we should still see the header but without progress indicators
      expect(screen.getByTestId("step-1-icon")).toBeInTheDocument();
    });

    it("uses different progress styles", () => {
      const stepperConfig: WizardFormConfig<any> = {
        ...wizardConfig,
        progressStyle: "stepper",
      };

      const dotsConfig: WizardFormConfig<any> = {
        ...wizardConfig,
        progressStyle: "dots",
      };

      // Just verify they render without error
      expect(() =>
        render(
          <TestWrapper>
            {(methods) => (
              <WizardForm
                closeDialog={mockCloseDialog}
                config={stepperConfig}
              />
            )}
          </TestWrapper>,
        ),
      ).not.toThrow();

      cleanup();

      expect(() =>
        render(
          <TestWrapper>
            {(methods) => (
              <WizardForm closeDialog={mockCloseDialog} config={dotsConfig} />
            )}
          </TestWrapper>,
        ),
      ).not.toThrow();
    });
  });

  describe("Backward Compatibility", () => {
    it("works with regular step form configurations", () => {
      const stepFormConfig: FormConfig<any> = {
        onSubmit: vi.fn().mockResolvedValue({}),
        steps: [
          {
            fields: [{ label: "Field 1", name: "field1", type: "text" } as any],
            title: "Step 1",
          },
          {
            fields: [{ label: "Field 2", name: "field2", type: "text" } as any],
            title: "Step 2",
          },
        ],
      } as any;

      render(
        <TestWrapper>
          {(methods) => (
            <StepSchemaForm
              closeDialog={mockCloseDialog}
              config={stepFormConfig}
            />
          )}
        </TestWrapper>,
      );

      // Should render first step fields
      expect(screen.getByText("Field 1")).toBeInTheDocument();
    });
  });
});
