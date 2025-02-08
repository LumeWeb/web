import {
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Spinner,
} from "@lumeweb/portal-framework-ui-core";
import { BaseRecord, useNotification } from "@refinedev/core";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import React from "react";

import type { DialogConfig } from "./Dialog.types";

import { ActionItemType, ActionListRenderer } from "../actions";
import { SchemaForm } from "../form/SchemaForm";
import { StepSchemaForm } from "../form/StepSchemaForm";
import { isStepFormConfig } from "../form/types";
import { useDialog } from "./Dialog.context";

interface DialogFooterContentProps<T extends BaseRecord = any> {
  closeDialog: (source?: "programmatic" | "user") => void; // Allow source parameter
  currentDialog: DialogConfig<T>;
  formMethods?: any;
  onConfirm: () => void;
}

// Component to render default buttons or actions dropdown for non-form dialogs
const DefaultDialogFooterActions = ({
  closeDialog,
  currentDialog,
  formMethods,
  onConfirm,
}: DialogFooterContentProps) => {
  // If actions config is present, render the dropdown
  if (currentDialog.actions) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-controls="dialog-actions-menu"
          aria-haspopup="true"
          asChild>
          <Button
            disabled={
              currentDialog.showSpinner || formMethods?.formState?.isSubmitting
            } // Disable if submitting
            variant={
              currentDialog.variant === "destructive"
                ? "destructive"
                : "default"
            }>
            {currentDialog.actions.triggerLabel}
            {(currentDialog.showSpinner ||
              formMethods?.formState?.isSubmitting) && ( // Show spinner if submitting
              <Spinner className="ml-2" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          id="dialog-actions-menu"
          role="menu"
          closeDialog={closeDialog} // Pass closeDialog here
        >
          {/* Debug logging removed */}
          {/* Default confirm/continue item */}
          {(currentDialog.type === "confirm" ||
            currentDialog.type === "alert") && (
            <DropdownMenuItem onSelect={onConfirm}>
              {currentDialog.type === "confirm"
                ? currentDialog.confirmText
                : currentDialog.confirmText || "Continue"}{" "}
              // Use confirmText if provided, else "Continue"
            </DropdownMenuItem>
          )}
          {/* Custom actions content */}
          {currentDialog.actions.content}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // If no actions config, render default buttons for confirm/alert
  if (currentDialog.type === "confirm" || currentDialog.type === "alert") {
    return (
      <>
        {currentDialog.type === "confirm" && currentDialog.cancelText && (
          <Button
            disabled={
              formMethods?.formState?.isSubmitting || currentDialog.showSpinner
            } // Disable if submitting
            onClick={() => closeDialog("user")} // Call with 'user' source
            variant="outline">
            {currentDialog.cancelText}
          </Button>
        )}
        {(currentDialog.type === "confirm" ||
          currentDialog.type === "alert") && (
          <Button
            disabled={
              formMethods?.formState?.isSubmitting || currentDialog.showSpinner
            } // Disable if submitting
            onClick={onConfirm}
            variant={
              currentDialog.variant === "destructive"
                ? "destructive"
                : "default"
            }>
            {currentDialog.type === "confirm"
              ? currentDialog.confirmText
              : currentDialog.confirmText || "Continue"}
            {(currentDialog.showSpinner ||
              formMethods?.formState?.isSubmitting) && ( // Show spinner if submitting
              <Spinner className="ml-2" />
            )}
          </Button>
        )}
      </>
    );
  }

  return null; // Should not happen based on DialogFooterContent logic, but good practice
};

const DialogFooterContent = <T extends BaseRecord>({
  closeDialog,
  currentDialog,
  formMethods,
  onConfirm,
}: DialogFooterContentProps<T>) => {
  if (currentDialog.type === "form") {
    return null; // Form footer handled within the form component
  }

  // --- Determine the content to render inside the footer ---
  let footerChildren: React.ReactNode = null;

  // 1. Prioritize custom footer JSX passed in config
  if (currentDialog.footer) {
    footerChildren = currentDialog.footer;
  }
  // 2. Else, if actionButtons are provided
  else if (currentDialog.actionButtons?.length) {
    footerChildren = (
      <ActionListRenderer
        actions={currentDialog.actionButtons}
        closeDialog={closeDialog} // Keep programmatic close for action buttons unless specified otherwise in config
        isSubmitting={
          formMethods?.formState?.isSubmitting ?? currentDialog.showSpinner
        }
        layout={currentDialog.actionButtonsLayout || "horizontal"}
      />
    );
  }
  // 3. Else, if it's a confirm or alert type, render default actions/buttons
  else if (currentDialog.type === "confirm" || currentDialog.type === "alert") {
    footerChildren = (
      <DefaultDialogFooterActions
        closeDialog={closeDialog} // Pass closeDialog
        currentDialog={currentDialog} // Pass currentDialog
        formMethods={formMethods} // Pass formMethods
        onConfirm={onConfirm} // Pass onConfirm
      />
    );
  }

  // Render DialogFooter wrapper only if there's content
  if (!footerChildren) return null;

  return (
    <DialogFooter className={currentDialog.classNames?.footer}>
      {footerChildren}
    </DialogFooter>
  );
};

const FormDialogFooter = <T extends BaseRecord, R extends BaseRecord = any>({
  closeDialog,
  currentDialog,
  methods,
}: {
  closeDialog: (source?: "programmatic" | "user") => void; // Allow source parameter
  currentDialog: DialogConfig<T> & { type: "form" };
  methods: any;
}) => {
  if (currentDialog.formConfig?.footer) {
    const customFooter =
      typeof currentDialog.formConfig.footer === "function"
        ? currentDialog.formConfig.footer(
            methods,
            closeDialog,
            // @ts-ignore
            currentDialog as DialogConfig<T, R>,
          )
        : currentDialog.formConfig.footer;
    return (
      <DialogFooter className={currentDialog.classNames?.footer}>
        {customFooter}
      </DialogFooter>
    );
  }

  return (
    <DialogFooter className={currentDialog.classNames?.footer}>
      <ActionListRenderer
        actions={
          currentDialog.formConfig.actionButtons || [
            { type: ActionItemType.CANCEL },
            {
              label: currentDialog.formConfig.submitLabel || "Submit",
              type: ActionItemType.SUBMIT,
            },
          ]
        }
        closeDialog={closeDialog}
        isSubmitting={methods.formState.isSubmitting}
        layout={currentDialog.formConfig.actionButtonsLayout || "horizontal"}
      />
    </DialogFooter>
  );
};

export function DialogRenderer() {
  const { closeDialog, currentDialog } = useDialog();
  const { open: openNotification } = useNotification();
  const { formMethods } = useDialog();

  if (!currentDialog) return null;

  const handleConfirm = async () => {
    try {
      if (
        (currentDialog?.type === "confirm" ||
          currentDialog?.type === "alert") &&
        currentDialog?.onConfirm
      ) {
        await currentDialog.onConfirm();
      }
    } catch (error) {
      // If onConfirm throws and dialog is not dismissable, re-throw to prevent close
      if (!currentDialog.dismissable) {
        // Debug logging removed
        throw error; // Re-throw the error
      }
      // If dismissable, log error and proceed to close
      // Debug logging removed
    } finally {
      // Always close if dismissable, even if onConfirm failed
      if (currentDialog.dismissable) {
        closeDialog(); // Close programmatically after onConfirm attempt
      }
    }
  };

  return (
    <Dialog
      aria-describedby={
        currentDialog.description ? "dialog-description" : undefined
      }
      aria-labelledby="dialog-title"
      onOpenChange={(open) => !open && closeDialog("user")} // Close with 'user' source on outside/escape close
      open={!!currentDialog}>
      <DialogContent
        className={cn(
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          currentDialog.type === "custom" && "flex flex-col",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          currentDialog.size === "lg"
            ? "max-w-2xl"
            : currentDialog.size === "md"
              ? "max-w-xl"
              : "max-w-sm",
          currentDialog.classNames?.content,
          {
            "bottom-4 inset-x-0 mx-auto": currentDialog.position === "bottom",
            "bottom-4 left-4": currentDialog.position === "bottom-left",
            "bottom-4 right-4": currentDialog.position === "bottom-right",
            // Center positioning handled by base component styles
            "left-4 top-1/2 -translate-y-1/2":
              currentDialog.position === "left",
            "right-4 top-1/2 -translate-y-1/2":
              currentDialog.position === "right",
            // Position handling
            "top-4 inset-x-0 mx-auto": currentDialog.position === "top",
            "top-4 left-4": currentDialog.position === "top-left",
            "top-4 right-4": currentDialog.position === "top-right",
          },
        )}
        data-has-title={!!currentDialog.title} // Add data attribute for testing
        onInteractOutside={(e) => {
          if (currentDialog.preventCloseOnOutsideClick === true) {
            e.preventDefault();
          } else if (currentDialog.preventCloseOnOutsideClick === "dirty") {
            e.preventDefault();
            openNotification?.({
              description:
                "You have unsaved changes. Are you sure you want to leave?",
              message: "Unsaved Changes",
              type: "error",
            });
          }
          // Note: The actual Dialog component triggers onOpenChange(false)
          // when onInteractOutside is not prevented. This is handled by the mock Dialog.
        }}>
        <DialogHeader className={currentDialog.classNames?.header}>
          <div
            className={`flex items-center gap-4 mb-4 justify-${currentDialog.iconLayout === "center" ? "center" : currentDialog.iconLayout === "right" ? "end" : "start"}`}>
            {(currentDialog.icon || currentDialog.status) && (
              <div className="shrink-0">
                {currentDialog.icon || (
                  <>
                    {currentDialog.status === "success" && (
                      <CheckCircle2
                        aria-label="Success"
                        className="h-8 w-8 text-success"
                      />
                    )}
                    {currentDialog.status === "error" && (
                      <AlertCircle
                        aria-label="Error"
                        className="h-8 w-8 text-destructive"
                      />
                    )}
                  </>
                )}
              </div>
            )}
            <div className="flex-1">
              <DialogTitle
                className={!currentDialog.title ? "sr-only" : ""}
                id="dialog-title">
                {currentDialog.title || "Dialog"}
              </DialogTitle>
              {currentDialog.description && (
                <DialogDescription id="dialog-description">
                  {currentDialog.description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <div
          aria-live="polite"
          className={cn({
            "pt-4":
              currentDialog.type !== "form" && currentDialog.type !== "custom",
            "px-6 pb-6": currentDialog.type !== "custom",
            "shrink min-h-0 px-6 pb-6 pt-4": currentDialog.type === "custom",
          })}>
          {currentDialog.type === "form" ? (
            isStepFormConfig(currentDialog.formConfig) ? (
              <StepSchemaForm
                closeDialog={closeDialog}
                config={{
                  ...currentDialog.formConfig,
                  onSuccess: currentDialog.onSuccess,
                }}
              />
            ) : (
              <SchemaForm
                closeDialog={closeDialog}
                config={{
                  ...currentDialog.formConfig,
                  onSubmit: currentDialog.onSubmit,
                  onSuccess: currentDialog.onSuccess,
                  footer: (methods) => (
                    <FormDialogFooter<typeof currentDialog.formConfig>
                      closeDialog={closeDialog}
                      currentDialog={
                        currentDialog as DialogConfig<any> & { type: "form" }
                      }
                      methods={methods}
                    />
                  ),
                }}
              />
            )
          ) : (
            // Render content only if type is not 'form'
            (currentDialog.content ?? null) // Use ?? to handle null/undefined safely
          )}
        </div>

        <DialogFooterContent
          closeDialog={closeDialog}
          currentDialog={currentDialog}
          formMethods={formMethods}
          onConfirm={handleConfirm}
        />
      </DialogContent>
    </Dialog>
  );
}
