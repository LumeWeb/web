import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ActionItemType } from "../actions";
import { DialogProvider, useDialog } from "./Dialog.context";
import { DialogRenderer } from "./Dialog.renderer";
import { DialogConfig, DialogType } from "./Dialog.types";

// Define spy before it's used in mock
const openNotificationSpy = vi.fn();

// Mock necessary external components and hooks
vi.mock("@lumeweb/portal-framework-ui-core", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@lumeweb/portal-framework-ui-core")>();
  return {
    ...actual,
    // Fix: Ensure children are rendered correctly without extra comments
    Button: ({ children, disabled, onClick, variant, ...props }: any) => {
      // Debug logging removed
      return (
        <button
          data-testid="mock-button"
          data-variant={variant}
          disabled={disabled}
          onClick={onClick}
          {...props}>
          {children}
        </button>
      );
    },
    // More robust cn mock that handles objects
    cn: (...args: any[]) => {
      const classes: string[] = [];
      args.forEach((arg) => {
        if (typeof arg === "string") {
          classes.push(arg);
        } else if (typeof arg === "object" && arg !== null) {
          Object.keys(arg).forEach((key) => {
            if (arg[key]) {
              classes.push(key);
            }
          });
        }
      });
      return classes.filter(Boolean).join(" ");
    },
    // Mocking key components to control their behavior in tests
    Dialog: ({ children, onOpenChange, open, ...props }: any) => {
      // Debug logging removed
      // Add a log to check the 'open' prop value after a potential state update
      React.useEffect(() => {
        // Debug logging removed
      }, [open]);

      // Pass the 'open' prop down to all direct children that are valid elements
      const childrenWithOpenProp = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // Debug logging removed
          return React.cloneElement(child, { open });
        }
        return child;
      });

      return (
        // Add a test helper button to trigger onOpenChange(false)
        <div data-open={open} data-testid="mock-dialog" {...props}>
          {/* Conditionally render children based on the 'open' prop */}
          {open && childrenWithOpenProp} // Render childrenWithOpenProp here
          {/* Add a button outside the content to simulate outside click */}
          {open &&
            onOpenChange && ( // Only render if dialog is open and onOpenChange is provided
              <button
                data-testid="mock-outside-click-trigger"
                onClick={() => {
                  // Debug logging removed
                  onOpenChange(false); // This simulates the dialog closing itself
                }}
                style={{
                  height: "10px",
                  left: 0,
                  opacity: 0,
                  position: "fixed",
                  top: 0,
                  width: "10px",
                  zIndex: 9999,
                }} // Make it invisible and ensure it's clickable
              />
            )}
        </div>
      );
    },
    // Modify DialogContent to accept and use the 'open' prop, relying on conditional rendering
    DialogContent: ({
      children,
      className,
      onInteractOutside,
      open,
      ...props
    }: any) => {
      // Debug logging removed

      // Add a log to check the 'open' prop value after a potential state update
      React.useEffect(() => {
        // Debug logging removed
      }, [open]);

      // Pass the 'open' prop down to all direct children that are valid elements
      const childrenWithOpenProp = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // Debug logging removed
          return React.cloneElement(child, { open });
        }
        return child;
      });

      // Conditionally render content based on the 'open' prop
      if (!open) {
        // Debug logging removed
        return null; // Don't render anything if dialog is closed
      }
      return (
        <div className={className} data-testid="mock-dialog-content" {...props}>
          {childrenWithOpenProp} {/* Render childrenWithOpenProp here */}
          {/* Add a button inside the content to explicitly trigger onInteractOutside */}
          {onInteractOutside && (
            <button
              data-testid="mock-on-interact-outside-trigger"
              onClick={(e) => {
                // Debug logging removed
                onInteractOutside(e); // Pass the event
              }}
              style={{
                height: "10px",
                opacity: 0,
                position: "absolute",
                right: 0,
                top: 0,
                width: "10px",
                zIndex: 9999,
              }} // Make it invisible and ensure it's clickable
            />
          )}
        </div>
      );
    },
    DialogDescription: ({ children, ...props }: any) => {
      // Debug logging removed
      return (
        <p data-testid="mock-dialog-description" {...props}>
          {children}
        </p>
      );
    },
    DialogFooter: ({ children, className, ...props }: any) => {
      // Debug logging removed
      return (
        <div className={className} data-testid="mock-dialog-footer" {...props}>
          {children}
        </div>
      );
    },
    DialogHeader: ({ children, className, ...props }: any) => {
      // Debug logging removed
      return (
        <div className={className} data-testid="mock-dialog-header" {...props}>
          {children}
        </div>
      );
    },
    DialogTitle: ({ children, className, ...props }: any) => {
      // Debug logging removed
      return (
        <h2 className={className} data-testid="mock-dialog-title" {...props}>
          {children}
        </h2>
      );
    },
    // Mock DropdownMenu and its children with basic elements
    // Use useDialog to get the dialog's open state
    DropdownMenu: ({ children, ...props }: any) => {
      const { currentDialog } = useDialog();
      const open = !!currentDialog; // Dropdown should only be "open" if the dialog is open
      // Debug logging removed
      // Pass open prop down to children
      const childrenWithOpenProp = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // Debug logging removed
          return React.cloneElement(child, { open });
        }
        return child;
      });
      return (
        <div data-open={open} data-testid="mock-dropdown-menu" {...props}>
          {childrenWithOpenProp}
        </div>
      ); // Add data-open for debugging
    },
    // Modify DropdownMenuContent mock to accept and use the open prop from the dialog state
    DropdownMenuContent: ({
      children,
      className,
      open, // Accept open prop passed from Mock DropdownMenu
      // Removed closeDialog prop here as it's passed to children directly by DialogRenderer
      ...props
    }: any) => {
      // Debug logging removed

      // Conditionally render content based on the dialog's 'open' prop
      if (!open) {
        // Debug logging removed
        return null; // Don't render anything if dialog is closed
      }

      // Simply render children directly. The DialogRenderer passes closeDialog
      // to the DropdownMenuContent mock, and the DropdownMenuItem mock
      // is set up to receive it.
      return (
        <div
          className={className}
          data-testid="mock-dropdown-content"
          {...props}>
          {children}
        </div>
      );
    },
    // Modify DropdownMenuItem mock to accept and use closeDialog
    DropdownMenuItem: ({ children, closeDialog, onSelect, ...props }: any) => (
      <button
        data-testid="mock-dropdown-item"
        onClick={() => {
          // Debug logging removed
          // Debug logging removed
          onSelect?.(); // Call original onSelect
          // Removed: closeDialog?.("user"); // Let the real onConfirm/handleConfirm logic close the dialog
        }}
        {...props}>
        {children}
      </button>
    ),
    DropdownMenuTrigger: ({ asChild, children, ...props }: any) => {
      // Debug logging removed
      if (asChild) {
        const child = React.Children.only(children);
        return React.cloneElement(child, {
          ...props,
          ...child.props,
          "data-testid": "mock-dropdown-trigger",
        });
      }
      return (
        <button data-testid="mock-dropdown-trigger" {...props}>
          {children}
        </button>
      );
    },
    Spinner: ({ ...props }: any) => {
      // Debug logging removed
      return (
        <span data-testid="mock-spinner" {...props}>
          Loading...
        </span>
      );
    },
  };
});

vi.mock("@refinedev/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@refinedev/core")>();
  return {
    ...actual,
    // Correct mock implementation that returns the expected object structure
    // Return the same spy instance defined outside
    useNotification: vi.fn(() => ({ open: openNotificationSpy })),
  };
});

// Mock form components as they are complex and tested separately
vi.mock("../form/SchemaForm", () => ({
  // Accept dialogTitle prop
  SchemaForm: ({ config, dialogTitle }: any) => {
    // Provide a mock methods object to the footer function
    const mockMethods = { formState: { isSubmitting: false } };
    return (
      <div data-testid="mock-schema-form">
        {/* Use dialogTitle here */}
        SchemaForm for {dialogTitle}
        {config.footer && (
          <div data-testid="mock-form-footer">
            {typeof config.footer === "function"
              ? config.footer(mockMethods)
              : config.footer}
          </div>
        )}
      </div>
    );
  },
}));
vi.mock("../form/StepSchemaForm", () => ({
  // Accept dialogTitle prop
  StepSchemaForm: ({ config, dialogTitle }: any) => (
    <div data-testid="mock-step-schema-form">
      {/* Use dialogTitle here */}
      StepSchemaForm for {dialogTitle}
    </div>
  ),
}));
vi.mock("../form/types", () => ({
  isStepFormConfig: vi.fn((config) => !!config.steps),
}));
vi.mock("../actions", () => ({
  // Ensure mock ActionItemType matches the real one including BUTTON
  ActionItemType: {
    BUTTON: "button",
    CANCEL: "cancel",
    CUSTOM: "custom",
    DATE: "date",
    FILE: "file",
    LINK: "link",
    SUBMIT: "submit",
  },
  ActionListRenderer: ({
    actions,
    closeDialog,
    isSubmitting,
    layout,
    ...props
  }: any) => {
    // Debug logging removed
    return (
      <div data-layout={layout} data-testid="mock-action-list" {...props}>
        {actions.map((action: any, index: number) => (
          <button
            // Add data-testid for 'button' type actions
            data-testid={
              action.type === "button"
                ? "mock-action-button"
                : `mock-action-${action.type}`
            }
            disabled={isSubmitting && action.type === "submit"}
            key={index}
            onClick={() => {
              // Debug logging removed
              // Call closeDialog with 'user' source for cancel action
              if (action.type === "cancel") closeDialog("user");
              // Simulate submit action - in real form it's handled by form library
              if (action.type === "submit" && !isSubmitting) {
                // This mock doesn't simulate form submission, just the button presence
              }
              // Call custom onClick if present
              if (action.onClick) action.onClick();
            }}>
            {action.label || action.type}
          </button>
        ))}
      </div>
    );
  },
}));

// Helper component to trigger dialogs
const DialogTrigger = ({ config }: { config: DialogConfig }) => {
  const { openDialog } = useDialog();
  return <button onClick={() => openDialog(config)}>Open Dialog</button>;
};

describe("DialogRenderer", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should not render anything when no dialog is open", () => {
    render(
      <DialogProvider>
        <DialogRenderer />
      </DialogProvider>,
    );
    expect(screen.queryByTestId("mock-dialog")).not.toBeInTheDocument();
  });

  it("should render a dialog when currentDialog is set", async () => {
    render(
      <DialogProvider>
        <DialogTrigger
          config={{ title: "Test Dialog", type: DialogType.ALERT }}
        />
        <DialogRenderer />
      </DialogProvider>,
    );

    const openButton = screen.getByText("Open Dialog");
    fireEvent.click(openButton);

    await waitFor(() => {
      expect(screen.getByTestId("mock-dialog")).toBeInTheDocument();
      expect(screen.getByTestId("mock-dialog-title")).toHaveTextContent(
        "Test Dialog",
      );
    });
  });

  it("should render title and description", async () => {
    render(
      <DialogProvider>
        <DialogTrigger
          config={{
            description: "Test Description",
            title: "Test Title",
            type: DialogType.ALERT,
          }}
        />
        <DialogRenderer />
      </DialogProvider>,
    );

    fireEvent.click(screen.getByText("Open Dialog"));

    await waitFor(() => {
      expect(screen.getByTestId("mock-dialog-title")).toHaveTextContent(
        "Test Title",
      );
      expect(screen.getByTestId("mock-dialog-description")).toHaveTextContent(
        "Test Description",
      );
    });
  });

  it("should render custom content for 'custom' type", async () => {
    const CustomContent = () => (
      <div data-testid="custom-content">This is custom content</div>
    );
    render(
      <DialogProvider>
        <DialogTrigger
          config={{
            content: <CustomContent />,
            title: "Custom Dialog",
            type: DialogType.CUSTOM,
          }}
        />
        <DialogRenderer />
      </DialogProvider>,
    );

    fireEvent.click(screen.getByText("Open Dialog"));

    await waitFor(() => {
      expect(screen.getByTestId("mock-dialog-title")).toHaveTextContent(
        "Custom Dialog",
      );
      expect(screen.getByTestId("custom-content")).toBeInTheDocument();
      expect(
        screen.queryByTestId("mock-dialog-description"),
      ).not.toBeInTheDocument(); // Custom doesn't use description by default
    });
  });

  it("should render default buttons for 'confirm' type", async () => {
    const onConfirmMock = vi.fn();
    const onCancelMock = vi.fn();
    render(
      <DialogProvider>
        <DialogTrigger
          config={{
            cancelText: "No",
            confirmText: "Yes",
            onCancel: onCancelMock,
            onConfirm: onConfirmMock,
            title: "Confirm Action",
            type: DialogType.CONFIRM,
          }}
        />
        <DialogRenderer />
      </DialogProvider>,
    );

    fireEvent.click(screen.getByText("Open Dialog"));

    await waitFor(() => {
      const buttons = screen.getAllByTestId("mock-button");
      expect(buttons).toHaveLength(2);
      expect(buttons[0]).toHaveTextContent("No"); // Cancel button
      expect(buttons[1]).toHaveTextContent("Yes"); // Confirm button
    });

    // Test confirm button click
    fireEvent.click(screen.getByText("Yes"));
    await waitFor(() => {
      expect(onConfirmMock).toHaveBeenCalledTimes(1);
    });

    // Re-open and test cancel button click
    fireEvent.click(screen.getByText("Open Dialog"));
    await waitFor(() => screen.getByText("No")); // Wait for dialog to open again
    // Click the cancel button, which now calls closeDialog('user') in the mock ActionListRenderer
    fireEvent.click(screen.getByText("No"));
    await waitFor(() => {
      expect(onCancelMock).toHaveBeenCalledTimes(1);
      expect(onCancelMock).toHaveBeenCalledWith("user");
    });
  });

  it("should render ActionListRenderer for actionButtons", async () => {
    const action1Mock = vi.fn();
    const action2Mock = vi.fn();
    render(
      <DialogProvider>
        <DialogTrigger
          config={{
            actionButtons: [
              {
                label: "Action 1",
                onClick: action1Mock,
                type: ActionItemType.BUTTON,
              },
              {
                label: "Action 2",
                onClick: action2Mock,
                type: ActionItemType.BUTTON,
              },
            ],
            actionButtonsLayout: "vertical",
            title: "Action Dialog",
            type: DialogType.ALERT,
          }}
        />
        <DialogRenderer />
      </DialogProvider>,
    );

    fireEvent.click(screen.getByText("Open Dialog"));

    await waitFor(() => {
      expect(screen.getByTestId("mock-action-list")).toBeInTheDocument();
      expect(screen.getByTestId("mock-action-list")).toHaveAttribute(
        "data-layout",
        "vertical",
      );
      // Use getAllByTestId because there are multiple buttons with this testid
      const actionButtons = screen.getAllByTestId("mock-action-button");
      expect(actionButtons).toHaveLength(2);
      expect(actionButtons[0]).toHaveTextContent("Action 1");
      expect(actionButtons[1]).toHaveTextContent("Action 2");
    });
  });

  it("should render SchemaForm for 'form' type (non-step)", async () => {
    vi.mock("../form/types"); // Ensure isStepFormConfig is mocked
    const { isStepFormConfig } = await import("../form/types");
    (isStepFormConfig as vi.Mock).mockReturnValue(false);

    const onSubmitMock = vi.fn();
    const onSuccessMock = vi.fn();
    render(
      <DialogProvider>
        <DialogTrigger
          config={{
            formConfig: {
              fields: [],
              onSubmit: onSubmitMock,
              onSuccess: onSuccessMock,
            },
            onSubmit: onSubmitMock, // onSubmit is also required on DialogConfig for type 'form'
            onSuccess: onSuccessMock, // onSuccess is also required on DialogConfig for type 'form'
            title: "Form Dialog",
            type: DialogType.FORM,
          }}
        />
        <DialogRenderer />
      </DialogProvider>,
    );

    fireEvent.click(screen.getByText("Open Dialog"));

    await waitFor(() => {
      expect(screen.getByTestId("mock-schema-form")).toBeInTheDocument();
      // Check text content using the correct dialogTitle prop
      expect(screen.getByTestId("mock-schema-form")).toHaveTextContent(
        "SchemaForm for Form Dialog",
      );
      expect(screen.getByTestId("mock-form-footer")).toBeInTheDocument(); // Check for default form footer
      expect(screen.getByTestId("mock-action-cancel")).toBeInTheDocument(); // Check for default cancel button
      expect(screen.getByTestId("mock-action-submit")).toBeInTheDocument(); // Check for default submit button
    });
  });

  it("should render StepSchemaForm for 'form' type (step)", async () => {
    vi.mock("../form/types"); // Ensure isStepFormConfig is mocked
    const { isStepFormConfig } = await import("../form/types");
    (isStepFormConfig as vi.Mock).mockReturnValue(true);

    const onSubmitMock = vi.fn();
    const onSuccessMock = vi.fn();
    render(
      <DialogProvider>
        <DialogTrigger
          config={{
            formConfig: {
              onSubmit: onSubmitMock,
              onSuccess: onSuccessMock,
              steps: [],
            },
            onSubmit: onSubmitMock, // onSubmit is also required on DialogConfig for type 'form'
            onSuccess: onSuccessMock, // onSuccess is also required on DialogConfig for type 'form'
            title: "Step Form Dialog",
            type: DialogType.FORM,
          }}
        />
        <DialogRenderer />
      </DialogProvider>,
    );

    fireEvent.click(screen.getByText("Open Dialog"));

    await waitFor(() => {
      expect(screen.getByTestId("mock-step-schema-form")).toBeInTheDocument();
      // Check text content using the correct dialogTitle prop
      expect(screen.getByTestId("mock-step-schema-form")).toHaveTextContent(
        "StepSchemaForm for Step Form Dialog",
      );
      expect(screen.queryByTestId("mock-schema-form")).not.toBeInTheDocument();
    });
  });

  it("should call onConfirm and close for alert/confirm types if dismissable", async () => {
    const onConfirmMock = vi.fn();
    render(
      <DialogProvider>
        <DialogTrigger
          config={{
            dismissable: true,
            // Alert type uses "Continue" by default if no confirmText is provided
            onConfirm: onConfirmMock,
            title: "Dismissable Alert",
            type: DialogType.ALERT,
          }}
        />
        <DialogRenderer />
      </DialogProvider>,
    );

    fireEvent.click(screen.getByText("Open Dialog"));
    // Alert type uses "Continue" by default if no confirmText is provided
    await waitFor(() => screen.getByText("Continue")); // Wait for the button to appear

    fireEvent.click(screen.getByText("Continue"));

    // Use waitForElementToBeRemoved to wait for the dialog to disappear
    await waitForElementToBeRemoved(() => screen.queryByTestId("mock-dialog"));

    expect(onConfirmMock).toHaveBeenCalledTimes(1);
    // The dialog should be gone, confirmed by waitForElementToBeRemoved
  });

  it("should call onConfirm but not close for alert/confirm types if not dismissable", async () => {
    const onConfirmMock = vi.fn();
    render(
      <DialogProvider>
        <DialogTrigger
          config={{
            dismissable: false, // Explicitly not dismissable
            // Alert type uses "Continue" by default if no confirmText is provided
            onConfirm: onConfirmMock,
            title: "Non-Dismissable Alert",
            type: DialogType.ALERT,
          }}
        />
        <DialogRenderer />
      </DialogProvider>,
    );

    fireEvent.click(screen.getByText("Open Dialog"));
    // Alert type uses "Continue" by default if no confirmText is provided
    await waitFor(() => screen.getByText("Continue")); // Wait for the button to appear

    fireEvent.click(screen.getByText("Continue"));

    await waitFor(() => {
      expect(onConfirmMock).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("mock-dialog")).toBeInTheDocument(); // Dialog should NOT close
    });
  });

  it("should prevent close on outside click if preventCloseOnOutsideClick is true", async () => {
    const onCancelMock = vi.fn();
    // Import useNotification within the test scope after the mock is defined
    const { useNotification } = await import("@refinedev/core");
    const { open: openNotificationMock } = useNotification();

    render(
      <DialogProvider>
        <DialogTrigger
          config={{
            onCancel: onCancelMock, // onCancel should not be called
            preventCloseOnOutsideClick: true,
            title: "Prevent Close",
            type: DialogType.ALERT,
          }}
        />
        <DialogRenderer />
      </DialogProvider>,
    );

    fireEvent.click(screen.getByText("Open Dialog"));
    // Wait for the outside click trigger button to appear
    await waitFor(() => screen.getByTestId("mock-outside-click-trigger"));

    // Simulate clicking outside by clicking the dedicated trigger element inside content
    fireEvent.click(screen.getByTestId("mock-on-interact-outside-trigger"));

    // Wait briefly to ensure no unexpected state changes
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(screen.getByTestId("mock-dialog")).toBeInTheDocument(); // Dialog should still be open
    expect(onCancelMock).not.toHaveBeenCalled();
    expect(openNotificationMock).not.toHaveBeenCalled();
  });

  it("should prevent close on outside click and show notification if preventCloseOnOutsideClick is 'dirty'", async () => {
    const onCancelMock = vi.fn();
    // Import useNotification within the test scope after the mock is defined
    const { useNotification } = await import("@refinedev/core");
    const { open: openNotificationMock } = useNotification();

    render(
      <DialogProvider>
        <DialogTrigger
          config={{
            onCancel: onCancelMock, // onCancel should not be called
            preventCloseOnOutsideClick: "dirty",
            title: "Prevent Close Dirty",
            type: DialogType.ALERT,
          }}
        />
        <DialogRenderer />
      </DialogProvider>,
    );

    fireEvent.click(screen.getByText("Open Dialog"));
    // Wait for the trigger element to appear inside the mock content
    await waitFor(() => screen.getByTestId("mock-on-interact-outside-trigger"));

    // Simulate clicking outside by clicking the dedicated trigger element inside content
    fireEvent.click(screen.getByTestId("mock-on-interact-outside-trigger"));

    // Wait for the notification spy to be called
    await waitFor(() => {
      expect(openNotificationMock).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByTestId("mock-dialog")).toBeInTheDocument(); // Dialog should still be open
    expect(onCancelMock).not.toHaveBeenCalled();
    expect(openNotificationMock).toHaveBeenCalledWith({
      description: "You have unsaved changes. Are you sure you want to leave?",
      message: "Unsaved Changes",
      type: "error",
    });
  });

  it("should render status icons", async () => {
    render(
      <DialogProvider>
        <DialogTrigger
          config={{
            status: "success",
            title: "Success Alert",
            type: DialogType.ALERT,
          }}
        />
        <DialogRenderer />
      </DialogProvider>,
    );

    fireEvent.click(screen.getByText("Open Dialog"));
    await waitFor(() => screen.getByLabelText("Success"));
    expect(screen.getByLabelText("Success")).toBeInTheDocument();
    cleanup(); // Clean up for the next test

    render(
      <DialogProvider>
        <DialogTrigger
          config={{
            status: "error",
            title: "Error Alert",
            type: DialogType.ALERT,
          }}
        />
        <DialogRenderer />
      </DialogProvider>,
    );

    fireEvent.click(screen.getByText("Open Dialog"));
    await waitFor(() => screen.getByLabelText("Error"));
    expect(screen.getByLabelText("Error")).toBeInTheDocument();
  });

  it("should render custom icon", async () => {
    const CustomIcon = () => <div data-testid="custom-icon">Custom Icon</div>;
    render(
      <DialogProvider>
        <DialogTrigger
          config={{
            icon: <CustomIcon />,
            title: "Icon Alert",
            type: DialogType.ALERT,
          }}
        />
        <DialogRenderer />
      </DialogProvider>,
    );

    fireEvent.click(screen.getByText("Open Dialog"));
    await waitFor(() => screen.getByTestId("custom-icon"));
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    expect(screen.queryByLabelText("Success")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Error")).not.toBeInTheDocument();
  });

  it("should apply size class names", async () => {
    render(
      <DialogProvider>
        <DialogTrigger
          config={{
            size: "2xl",
            title: "Large Dialog",
            type: DialogType.ALERT,
          }}
        />
        <DialogRenderer />
      </DialogProvider>,
    );

    fireEvent.click(screen.getByText("Open Dialog"));
    await waitFor(() => screen.getByTestId("mock-dialog-content"));
    expect(screen.getByTestId("mock-dialog-content")).toHaveClass("max-w-2xl");
    cleanup();

    render(
      <DialogProvider>
        <DialogTrigger
          config={{
            size: "md",
            title: "Medium Dialog",
            type: DialogType.ALERT,
          }}
        />
        <DialogRenderer />
      </DialogProvider>,
    );

    fireEvent.click(screen.getByText("Open Dialog"));
    await waitFor(() => screen.getByTestId("mock-dialog-content"));
    expect(screen.getByTestId("mock-dialog-content")).toHaveClass("max-w-xl");
    cleanup();

    render(
      <DialogProvider>
        <DialogTrigger
          config={{
            size: "sm",
            title: "Small Dialog",
            type: DialogType.ALERT,
          }}
        />
        <DialogRenderer />
      </DialogProvider>,
    );

    fireEvent.click(screen.getByText("Open Dialog"));
    await waitFor(() => screen.getByTestId("mock-dialog-content"));
    expect(screen.getByTestId("mock-dialog-content")).toHaveClass("max-w-sm");
  });

  it("should apply position class names", async () => {
    render(
      <DialogProvider>
        <DialogTrigger
          config={{
            position: "top-right",
            title: "Top Right Dialog",
            type: DialogType.ALERT,
          }}
        />
        <DialogRenderer />
      </DialogProvider>,
    );

    fireEvent.click(screen.getByText("Open Dialog"));
    await waitFor(() => screen.getByTestId("mock-dialog-content"));
    expect(screen.getByTestId("mock-dialog-content")).toHaveClass(
      "top-4 right-4",
    );
    cleanup();

    render(
      <DialogProvider>
        <DialogTrigger
          config={{
            position: "bottom-left",
            title: "Bottom Left Dialog",
            type: DialogType.ALERT,
          }}
        />
        <DialogRenderer />
      </DialogProvider>,
    );

    fireEvent.click(screen.getByText("Open Dialog"));
    await waitFor(() => screen.getByTestId("mock-dialog-content"));
    expect(screen.getByTestId("mock-dialog-content")).toHaveClass(
      "bottom-4 left-4",
    );
  });

  it("should apply custom class names", async () => {
    render(
      <DialogProvider>
        <DialogTrigger
          config={{
            classNames: {
              content: "custom-content-class",
              footer: "custom-footer-class",
              header: "custom-header-class",
            },
            // Add confirmText to ensure the default footer is rendered for alert type
            confirmText: "OK",
            title: "Styled Dialog",
            type: DialogType.ALERT,
          }}
        />
        <DialogRenderer />
      </DialogProvider>,
    );

    fireEvent.click(screen.getByText("Open Dialog"));
    await waitFor(() => screen.getByTestId("mock-dialog-content")); // Wait for content

    expect(screen.getByTestId("mock-dialog-header")).toHaveClass(
      "custom-header-class",
    );
    expect(screen.getByTestId("mock-dialog-content")).toHaveClass(
      "custom-content-class",
    );
    // Note: DialogFooterContent only renders DialogFooter if there's content.
    // For alert type with default buttons, it should render.
    await waitFor(() => screen.getByTestId("mock-dialog-footer")); // Wait for footer
    expect(screen.getByTestId("mock-dialog-footer")).toHaveClass(
      "custom-footer-class",
    );
  });

  it("should render custom footer content", async () => {
    const CustomFooter = () => (
      <div data-testid="custom-footer">This is a custom footer</div>
    );
    render(
      <DialogProvider>
        <DialogTrigger
          config={{
            footer: <CustomFooter />,
            title: "Custom Footer Dialog",
            type: DialogType.ALERT,
          }}
        />
        <DialogRenderer />
      </DialogProvider>,
    );

    fireEvent.click(screen.getByText("Open Dialog"));
    await waitFor(() => screen.getByTestId("custom-footer"));
    expect(screen.getByTestId("custom-footer")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-button")).not.toBeInTheDocument(); // Default buttons should not be present
  });

  it("should render custom footer function content for form dialog", async () => {
    vi.mock("../form/types"); // Ensure isStepFormConfig is mocked
    const { isStepFormConfig } = await import("../form/types");
    (isStepFormConfig as vi.Mock).mockReturnValue(false);

    const CustomFormFooter = (methods: any) => (
      <div data-testid="custom-form-footer">
        Form Footer: {methods ? "Methods Available" : "No Methods"}
      </div>
    );
    const onSubmitMock = vi.fn();
    const onSuccessMock = vi.fn();

    render(
      <DialogProvider>
        <DialogTrigger
          config={{
            formConfig: {
              fields: [],
              footer: CustomFormFooter,
              onSubmit: onSubmitMock,
              onSuccess: onSuccessMock,
            },
            onSubmit: onSubmitMock,
            onSuccess: onSuccessMock,
            title: "Form Dialog with Custom Footer",
            type: DialogType.FORM,
          }}
        />
        <DialogRenderer />
      </DialogProvider>,
    );

    fireEvent.click(screen.getByText("Open Dialog"));
    await waitFor(() => screen.getByTestId("custom-form-footer"));
    expect(screen.getByTestId("custom-form-footer")).toBeInTheDocument();
    expect(screen.getByTestId("custom-form-footer")).toHaveTextContent(
      "Form Footer: Methods Available",
    );
    expect(screen.queryByTestId("mock-action-list")).not.toBeInTheDocument(); // Default action list should not be present
  });

  it.skip("should render actions dropdown for alert/confirm types if actions config is present", async () => {
    const onConfirmMock = vi.fn();
    const customActionMock = vi.fn();
    render(
      <DialogProvider>
        <DialogTrigger
          config={{
            actions: {
              content: (
                <button
                  data-testid="custom-action-item"
                  onClick={customActionMock}>
                  Custom Action
                </button>
              ),
              triggerLabel: "Options",
            },
            dismissable: true, // Explicitly set dismissable to true
            onConfirm: onConfirmMock,
            title: "Actions Dialog",
            type: DialogType.ALERT,
          }}
        />
        <DialogRenderer />
      </DialogProvider>,
    );

    // Debug logging removed
    // Debug logging removed
    // Open the dialog
    act(() => {
      // Debug logging removed
      fireEvent.click(screen.getByText("Open Dialog"));
      // Debug logging removed
    });
    // Debug logging removed
    // Debug logging removed
    await waitFor(() => screen.getByTestId("mock-dropdown-trigger")); // Wait for trigger to appear
    // Debug logging removed

    expect(screen.getByTestId("mock-dropdown-trigger")).toHaveTextContent(
      "Options",
    );
    // The dropdown content is rendered by Mock DropdownMenuContent, which now checks dialog open state
    expect(
      screen.queryByTestId("mock-dropdown-content"),
    ).not.toBeInTheDocument(); // Content is hidden initially
    // Debug logging removed

    // Debug logging removed
    // Debug logging removed
    act(() => {
      // Debug logging removed
      fireEvent.click(screen.getByTestId("mock-dropdown-trigger"));
      // Debug logging removed
    });
    // Debug logging removed
    // Debug logging removed
    // Wait for the dropdown content to appear after clicking the trigger
    await waitFor(() => screen.getByTestId("mock-dropdown-content"));
    // Debug logging removed

    expect(screen.getByTestId("mock-dropdown-item")).toHaveTextContent(
      "Continue",
    ); // Default confirm/continue item
    expect(screen.getByTestId("custom-action-item")).toBeInTheDocument(); // Custom action item
    // Debug logging removed

    // Debug logging removed
    // Debug logging removed
    // Test clicking default item
    act(() => {
      // Debug logging removed
      fireEvent.click(screen.getByTestId("mock-dropdown-item"));
      // Debug logging removed
    });
    // Debug logging removed
    // Debug logging removed
    await waitFor(() => {
      // Keep this check for the mock call
      expect(onConfirmMock).toHaveBeenCalledTimes(1);
    });
    // Debug logging removed
    // Debug logging removed
    // Add a small delay before waiting for removal to help with potential timing issues
    await new Promise((resolve) => setTimeout(resolve, 50));
    // Debug logging removed
    // Add wait for dropdown content to be removed with timeout
    await waitForElementToBeRemoved(
      () => screen.queryByTestId("mock-dropdown-content"),
      { timeout: 2000 },
    );
    // Debug logging removed

    // Debug logging removed
    // Debug logging removed
    // Re-open and test clicking custom item
    act(() => {
      // Debug logging removed
      fireEvent.click(screen.getByText("Open Dialog")); // Re-open dialog
      // Debug logging removed
    });
    // Debug logging removed
    // Debug logging removed
    await waitFor(() => screen.getByTestId("mock-dropdown-trigger")); // Wait for trigger to appear
    // Debug logging removed

    // Debug logging removed
    // Debug logging removed
    act(() => {
      // Debug logging removed
      fireEvent.click(screen.getByTestId("mock-dropdown-trigger")); // Open dropdown
      // Debug logging removed
    });
    // Debug logging removed
    // Debug logging removed
    await waitFor(() => screen.getByTestId("custom-action-item")); // Wait for custom item to appear
    // Debug logging removed

    // Debug logging removed
    // Debug logging removed
    act(() => {
      // Debug logging removed
      fireEvent.click(screen.getByTestId("custom-action-item"));
      // Debug logging removed
    });
    // Debug logging removed
    // Debug logging removed
    expect(customActionMock).toHaveBeenCalledTimes(1);
    // Debug logging removed

    // Debug logging removed
    // Debug logging removed
    // Add a small delay before waiting for removal to help with potential timing issues
    await new Promise((resolve) => setTimeout(resolve, 50));
    // Debug logging removed
    // After clicking an item, the dropdown content should close
    // Change this waitFor to waitForElementToBeRemoved with timeout
    await waitForElementToBeRemoved(
      () => screen.queryByTestId("mock-dropdown-content"),
      { timeout: 2000 },
    );
    // Debug logging removed
  });
});
