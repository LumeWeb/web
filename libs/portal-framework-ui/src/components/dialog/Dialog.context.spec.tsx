import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DialogProvider, useDialog } from "./Dialog.context";
import { DialogConfig } from "./Dialog.types";

// Mock console.log to reduce noise during tests - Removed as logs are removed from source
// vi.spyOn(console, "log").mockImplementation(() => {});
// vi.spyOn(console, "error").mockImplementation(() => {});

// Helper component to access the dialog context
const TestComponent = () => {
  const dialog = useDialog();
  return (
    <div>
      <button
        onClick={() =>
          dialog.openDialog({ title: "Test Alert", type: "alert" })
        }>
        Open Alert
      </button>
      <button onClick={() => dialog.closeDialog()}>Close Dialog</button>
      <button
        onClick={() =>
          dialog.replaceDialog({ title: "Replaced Alert", type: "alert" })
        }>
        Replace Dialog
      </button>
      <span data-testid="current-dialog-title">
        {dialog.currentDialog?.title}
      </span>
    </div>
  );
};

// Helper component to trigger closeDialog from within a component
const CloseDialogHelper = ({ source }: { source: "programmatic" | "user" }) => {
  const { closeDialog } = useDialog();
  return (
    <button data-testid={`close-dialog-${source}`} onClick={() => closeDialog(source)}>
      Close Dialog ({source})
    </button>
  );
};


describe("DialogContext", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should provide the dialog context", () => {
    render(
      <DialogProvider>
        <TestComponent />
      </DialogProvider>,
    );

    const openButton = screen.getByText("Open Alert");
    expect(openButton).toBeInTheDocument();
  });

  it("should open a dialog", () => {
    render(
      <DialogProvider>
        <TestComponent />
      </DialogProvider>,
    );

    const openButton = screen.getByText("Open Alert");
    act(() => {
      openButton.click();
    });

    const currentDialogTitle = screen.getByTestId("current-dialog-title");
    expect(currentDialogTitle).toHaveTextContent("Test Alert");
  });

  it("should close the current dialog", () => {
    render(
      <DialogProvider>
        <TestComponent />
      </DialogProvider>,
    );

    const openButton = screen.getByText("Open Alert");
    act(() => {
      openButton.click();
    });

    const currentDialogTitleBeforeClose = screen.getByTestId(
      "current-dialog-title",
    );
    expect(currentDialogTitleBeforeClose).toHaveTextContent("Test Alert");

    const closeButton = screen.getByText("Close Dialog");
    act(() => {
      closeButton.click();
    });

    const currentDialogTitleAfterClose = screen.getByTestId(
      "current-dialog-title",
    );
    expect(currentDialogTitleAfterClose).toBeEmptyDOMElement();
  });

  it("should replace the current dialog", () => {
    render(
      <DialogProvider>
        <TestComponent />
      </DialogProvider>,
    );

    const openButton = screen.getByText("Open Alert");
    act(() => {
      openButton.click();
    });

    const currentDialogTitleBeforeReplace = screen.getByTestId(
      "current-dialog-title",
    );
    expect(currentDialogTitleBeforeReplace).toHaveTextContent("Test Alert");

    const replaceButton = screen.getByText("Replace Dialog");
    act(() => {
      replaceButton.click();
    });

    const currentDialogTitleAfterReplace = screen.getByTestId(
      "current-dialog-title",
    );
    expect(currentDialogTitleAfterReplace).toHaveTextContent("Replaced Alert");
  });

  it("should call onCancel for confirm/form dialogs on user close", async () => {
    const onCancelMock = vi.fn();
    const TestConfirmComponent = () => {
      const dialog = useDialog();
      return (
        <button
          onClick={() =>
            dialog.openDialog({
              cancelText: "Cancel",
              confirmText: "OK",
              onCancel: onCancelMock,
              onConfirm: vi.fn(),
              title: "Confirm Dialog",
              type: "confirm",
            })
          }>
          Open Confirm
        </button>
      );
    };

    render(
      <DialogProvider>
        <TestConfirmComponent />
        <CloseDialogHelper source="user" />
      </DialogProvider>,
    );

    const openButton = screen.getByText("Open Confirm");
    act(() => {
      openButton.click();
    });

    // Trigger user close via the helper component
    const closeUserButton = screen.getByTestId("close-dialog-user");
    act(() => {
      fireEvent.click(closeUserButton);
    });

    expect(onCancelMock).toHaveBeenCalledTimes(1);
    expect(onCancelMock).toHaveBeenCalledWith("user");
  });

  it("should not call onCancel for confirm/form dialogs on programmatic close", async () => {
    const onCancelMock = vi.fn();
    const TestConfirmComponent = () => {
      const dialog = useDialog();
      return (
        <button
          onClick={() =>
            dialog.openDialog({
              cancelText: "Cancel",
              confirmText: "OK",
              onCancel: onCancelMock,
              onConfirm: vi.fn(),
              title: "Confirm Dialog",
              type: "confirm",
            })
          }>
          Open Confirm
        </button>
      );
    };

    render(
      <DialogProvider>
        <TestConfirmComponent />
        <CloseDialogHelper source="programmatic" />
      </DialogProvider>,
    );

    const openButton = screen.getByText("Open Confirm");
    act(() => {
      openButton.click();
    });

    // Trigger programmatic close via the helper component
    const closeProgrammaticButton = screen.getByTestId("close-dialog-programmatic");
    act(() => {
      fireEvent.click(closeProgrammaticButton);
    });

    expect(onCancelMock).not.toHaveBeenCalled();
  });

  // Note: Testing setFormMethods requires a form dialog setup, which is more complex.
  // Basic context provision is covered by the other tests.
});
