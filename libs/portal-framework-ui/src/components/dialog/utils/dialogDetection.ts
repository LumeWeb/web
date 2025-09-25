import { useDialog } from "../Dialog.context";
import { DialogConfig, DialogType, DialogTypes } from "../Dialog.types";

/**
 * Config-based detection for dialog type
 * Useful for static type checking and compile-time analysis
 * @param config Dialog configuration object
 */
export function getDialogTypeFromConfig(config: DialogConfig): DialogType {
  return config.type;
}

/**
 * Hook-based detection for current dialog type
 * Returns the type of the currently open dialog or null if no dialog is open
 */
export function useDialogType(): DialogType | null {
  const { currentDialog } = useDialog();
  return currentDialog?.type ?? null;
}

/**
 * Hook-based detection for whether we're in a form dialog
 * Checks the current dialog context for form-related dialogs
 */
export function useIsFormDialog(): boolean {
  const dialogType = useDialogType();
  return (
    dialogType === DialogTypes.FORM || dialogType === DialogTypes.WIZARD_FORM
  );
}

/**
 * Hook-based detection for whether we're currently in any dialog
 * More accurate than config-based detection as it reflects runtime state
 */
export function useIsInDialog(): boolean {
  const { currentDialog } = useDialog();
  return !!currentDialog;
}

/**
 * Hook-based detection for whether we're in a wizard dialog
 * Checks the current dialog context for wizard-specific dialogs
 */
export function useIsWizardDialog(): boolean {
  const dialogType = useDialogType();
  return dialogType === DialogTypes.WIZARD_FORM;
}
