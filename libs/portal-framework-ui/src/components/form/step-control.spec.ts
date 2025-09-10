import { cleanup, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { StepControlProvider, useStepControl } from "./StepControlContext";
import { WizardForm } from "./WizardForm";
import { StepSchemaForm } from "./StepSchemaForm";
import { StepFormConfig, WizardFormConfig } from "./types";

// Mock dependencies
vi.mock("./StepSchemaForm", () => ({
  StepSchemaForm: vi.fn(({ closeDialog, config }) => (
    <div data-testid="step-schema-form">
      <button onClick={() => closeDialog?.()}>Close Dialog</button>
      <div data-testid="step-count">{config.steps.length} steps</div>
    </div>
  )),
}));

vi.mock("./WizardHeader", () => ({
  WizardHeader: vi.fn(({ currentStep, steps }) => (
    <div data-testid="wizard-header">
      <div data-testid="current-step">Step: {currentStep}</div>
      <div data-testid="total-steps">Total: {steps.length}</div>
    </div>
  )),
}));

vi.mock("./WizardStepContent", () => ({
  WizardStepContent: vi.fn(({ children, title, description }) => (
    <div data-testid="wizard-step-content">
      <div data-testid="step-title">{title}</div>
      <div data-testid="step-description">{description}</div>
      {children}
    </div>
  )),
}));

vi.mock("./WizardFooter", () => ({
  WizardFooter: vi.fn(() => <div data-testid="wizard-footer">Wizard Footer</div>),
}));

vi.mock("../dialog/Dialog.context", () => ({
  useDialog: vi.fn(() => ({
    formMethods: {
      formState: { isSubmitting: false },
    },
  })),
}));

// Test component that uses the step control hook
const TestComponentWithHook = () => {
  const stepControl = useStepControl();
  return (
    <div data-testid="hook-test">
      <span data-testid="hook-current-step">{stepControl.currentStep}</span>
      <span data-testid="hook-total-steps">{stepControl.totalSteps}</span>
      <span data-testid="hook-is-first-step">{stepControl.isFirstStep.toString()}</span>
      <span data-testid="hook-is-last-step">{stepControl.isLastStep.toString()}</span>
      <button data-testid="hook-next" onClick={stepControl.handleNext}>
        Next
      </button>
      <button data-testid="hook-previous" onClick={stepControl.handlePrevious}>
        Previous
      </button>
      <button data-testid="hook-go-to-step-1" onClick={() => stepControl.goToStep(1)}>
        Go to Step 1
      </button>
    </div>
  );
};

// Test component that uses the step control context
const TestComponentWithContext = () => {
  const stepControl = useStepControl();
  return (
    <div data-testid="context-test">
      <span data-testid="context-current-step">{stepControl.currentStep}</span>
      <span data-testid="context-total-steps">{stepControl.totalSteps}</span>
      <span data-testid="context-is-first-step">{stepControl.isFirstStep.toString()}</span>
      <span data-testid="context-is-last-step">{stepControl.isLastStep.toString()}</span>
      <button data-testid="context-next" onClick={stepControl.handleNext}>
        Next
      </button>
      <button data-testid="context-previous" onClick={stepControl.handlePrevious}>
        Previous
      </button>
      <button data-testid="context-go-to-step-1" onClick={() => stepControl.goToStep(1)}>
        Go to Step 1
      </button>
    </div>
  );
};

// Test component that verifies backward compatibility
const TestBackwardCompatibility = () => {
  const stepControl = useStepControl({
    defaultStep: 1,
    isBackValidate: true,
    steps: [{ title: "Step 1" }, { title: "Step 2" }],
  });
  return (
    <div data-testid="backward-compat-test">
      <span data-testid="backward-compat-current-step">{stepControl.currentStep}</span>
    </div>
  );
};

describe("Step Control System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("useStepControl hook", () => {
    it("throws error when used outside StepControlProvider", () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => render(<TestComponentWithHook />)).toThrow(
        "useStepControl must be used within a StepControlProvider"
      );

      consoleErrorSpy.mockRestore();
    });

    it("works correctly when used inside StepControlProvider", () => {
      render(
        <StepControlProvider totalSteps={3} defaultStep={1}>
          <TestComponentWithHook />
        </StepControlProvider>
      );

      expect(screen.getByTestId("hook-current-step")).toHaveTextContent("1");
      expect(screen.getByTestId("hook-total-steps")).toHaveTextContent("3");
      expect(screen.getByTestId("hook-is-first-step")).toHaveTextContent("false");
      expect(screen.getByTestId("hook-is-last-step")).toHaveTextContent("false");
    });
  });

  describe("useStepControl hook", () => {
    it("throws error when used outside StepControlProvider", () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => render(<TestComponentWithContext />)).toThrow(
        "useStepControl must be used within a StepControlProvider"
      );

      consoleErrorSpy.mockRestore();
    });

    it("works correctly when used inside StepControlProvider", () => {
      render(
        <StepControlProvider totalSteps={3} defaultStep={1}>
          <TestComponentWithContext />
        </StepControlProvider>
      );

      expect(screen.getByTestId("context-current-step")).toHaveTextContent("1");
      expect(screen.getByTestId("context-total-steps")).toHaveTextContent("3");
      expect(screen.getByTestId("context-is-first-step")).toHaveTextContent("false");
      expect(screen.getByTestId("context-is-last-step")).toHaveTextContent("false");
    });
  });

  describe("WizardForm component", () => {
    const mockConfig: WizardFormConfig<any> = {
      steps: [
        {
          title: "Step 1",
          description: "Description 1",
          icon: <div>Icon 1</div>,
          fields: [],
        },
        {
          title: "Step 2",
          description: "Description 2",
          icon: <div>Icon 2</div>,
          fields: [],
        },
      ],
      onSubmit: vi.fn(),
    };

    it("renders correctly with step control system", () => {
      render(<WizardForm config={mockConfig} />);

      expect(screen.getByTestId("wizard-header")).toBeInTheDocument();
      expect(screen.getByTestId("wizard-step-content")).toBeInTheDocument();
      expect(screen.getByTestId("wizard-footer")).toBeInTheDocument();
      expect(screen.getByTestId("step-schema-form")).toBeInTheDocument();
    });

    it("passes correct step information to child components", () => {
      render(<WizardForm config={mockConfig} />);

      expect(screen.getByTestId("current-step")).toHaveTextContent("Step: 0");
      expect(screen.getByTestId("total-steps")).toHaveTextContent("Total: 2");
      expect(screen.getByTestId("step-title")).toHaveTextContent("Step 1");
      expect(screen.getByTestId("step-description")).toHaveTextContent("Description 1");
      expect(screen.getByTestId("step-count")).toHaveTextContent("2 steps");
    });
  });

  describe("StepSchemaForm component", () => {
    const mockConfig: StepFormConfig<any> = {
      steps: [
        {
          title: "Step 1",
          fields: [],
        },
        {
          title: "Step 2",
          fields: [],
        },
      ],
      onSubmit: vi.fn(),
    };

    it("renders correctly with step control system", () => {
      render(<StepSchemaForm config={mockConfig} closeDialog={vi.fn()} />);

      expect(screen.getByTestId("step-schema-form")).toBeInTheDocument();
    });

    it("passes correct step information to child components", () => {
      render(<StepSchemaForm config={mockConfig} closeDialog={vi.fn()} />);

      expect(screen.getByTestId("step-count")).toHaveTextContent("2 steps");
    });
  });

  describe("Step Navigation", () => {
    it("navigates forward and backward correctly", async () => {
      render(
        <StepControlProvider totalSteps={3} defaultStep={0}>
          <TestComponentWithContext />
        </StepControlProvider>
      );

      // Initial state
      expect(screen.getByTestId("context-current-step")).toHaveTextContent("0");
      expect(screen.getByTestId("context-is-first-step")).toHaveTextContent("true");
      expect(screen.getByTestId("context-is-last-step")).toHaveTextContent("false");

      // Go to next step
      const nextButton = screen.getByTestId("context-next");
      nextButton.click();

      await waitFor(() => {
        expect(screen.getByTestId("context-current-step")).toHaveTextContent("1");
        expect(screen.getByTestId("context-is-first-step")).toHaveTextContent("false");
        expect(screen.getByTestId("context-is-last-step")).toHaveTextContent("false");
      });

      // Go to next step again
      nextButton.click();

      await waitFor(() => {
        expect(screen.getByTestId("context-current-step")).toHaveTextContent("2");
        expect(screen.getByTestId("context-is-first-step")).toHaveTextContent("false");
        expect(screen.getByTestId("context-is-last-step")).toHaveTextContent("true");
      });

      // Go to previous step
      const previousButton = screen.getByTestId("context-previous");
      previousButton.click();

      await waitFor(() => {
        expect(screen.getByTestId("context-current-step")).toHaveTextContent("1");
        expect(screen.getByTestId("context-is-first-step")).toHaveTextContent("false");
        expect(screen.getByTestId("context-is-last-step")).toHaveTextContent("false");
      });
    });

    it("handles goToStep correctly", async () => {
      render(
        <StepControlProvider totalSteps={4} defaultStep={0}>
          <TestComponentWithContext />
        </StepControlProvider>
      );

      // Go to step 2
      const goToStepButton = screen.getByTestId("context-go-to-step-1");
      goToStepButton.click();

      await waitFor(() => {
        expect(screen.getByTestId("context-current-step")).toHaveTextContent("1");
      });
    });

    it("respects step boundaries", async () => {
      render(
        <StepControlProvider totalSteps={3} defaultStep={0}>
          <TestComponentWithContext />
        </StepControlProvider>
      );

      // Try to go to previous step from first step (should not change)
      const previousButton = screen.getByTestId("context-previous");
      previousButton.click();

      await waitFor(() => {
        expect(screen.getByTestId("context-current-step")).toHaveTextContent("0");
      });

      // Go to last step
      const stepControl = useStepControl();
      stepControl.goToStep(2);

      await waitFor(() => {
        expect(screen.getByTestId("context-current-step")).toHaveTextContent("2");
      });

      // Try to go to next step from last step (should not change)
      const nextButton = screen.getByTestId("context-next");
      nextButton.click();

      await waitFor(() => {
        expect(screen.getByTestId("context-current-step")).toHaveTextContent("2");
      });
    });
  });

  describe("Backward Compatibility", () => {
    it("maintains backward compatibility with useStepControl hook", () => {
      render(
        <StepControlProvider totalSteps={3} defaultStep={1}>
          <TestBackwardCompatibility />
        </StepControlProvider>
      );

      // Should use the context value, not the hook parameters
      expect(screen.getByTestId("backward-compat-current-step")).toHaveTextContent("1");
    });
  });

  describe("Edge Cases", () => {
    it("handles single step correctly", () => {
      render(
        <StepControlProvider totalSteps={1} defaultStep={0}>
          <TestComponentWithContext />
        </StepControlProvider>
      );

      expect(screen.getByTestId("context-current-step")).toHaveTextContent("0");
      expect(screen.getByTestId("context-is-first-step")).toHaveTextContent("true");
      expect(screen.getByTestId("context-is-last-step")).toHaveTextContent("true");
    });

    it("handles zero steps correctly", () => {
      render(
        <StepControlProvider totalSteps={0}>
          <TestComponentWithContext />
        </StepControlProvider>
      );

      expect(screen.getByTestId("context-current-step")).toHaveTextContent("0");
      expect(screen.getByTestId("context-is-first-step")).toHaveTextContent("true");
      expect(screen.getByTestId("context-is-last-step")).toHaveTextContent("true");
    });

    it("clamps goToStep to valid range", async () => {
      render(
        <StepControlProvider totalSteps={3} defaultStep={1}>
          <TestComponentWithContext />
        </StepControlProvider>
      );

      const stepControl = useStepControl();

      // Try to go to negative step
      stepControl.goToStep(-1);

      await waitFor(() => {
        expect(screen.getByTestId("context-current-step")).toHaveTextContent("0");
      });

      // Try to go to step beyond total steps
      stepControl.goToStep(10);

      await waitFor(() => {
        expect(screen.getByTestId("context-current-step")).toHaveTextContent("2");
      });
    });
  });

  describe("TypeScript Types", () => {
    it("enforces correct types for StepControlContextType", () => {
      // This test is primarily for type checking - if the types were incorrect,
      // TypeScript would throw compilation errors
      const stepControl: ReturnType<typeof useStepControl> = {
        currentStep: 0,
        goToStep: (step: number) => {},
        handleNext: async () => {},
        handlePrevious: async () => {},
        isFirstStep: true,
        isLastStep: false,
        totalSteps: 3,
      };

      expect(stepControl).toBeDefined();
    });

    it("enforces correct types for StepControlProviderProps", () => {
      const providerProps: React.ComponentProps<typeof StepControlProvider> = {
        children: <div>Test</div>,
        totalSteps: 3,
        defaultStep: 1,
        isBackValidate: true,
        onStepChange: (step: number) => {},
        triggerValidation: async () => true,
      };

      expect(providerProps).toBeDefined();
    });
  });
});
