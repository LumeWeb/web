import { registerBridgedContext } from "@lumeweb/portal-framework-core";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";

import type { DialogConfig } from "./Dialog.types";

import { DialogType } from "./Dialog.types";
import { DialogActionsContext } from "./DialogActions.context";
import { DialogStateContext } from "./DialogState.context";

/**
 * Required provider that maintains dialog state and context.
 * Must wrap any components that will use dialogs.
 */
export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [dialogStack, setDialogStack] = useState<DialogConfig[]>([]);
  const _formMethods = useRef<any>(undefined);
  const currentDialog = dialogStack[dialogStack.length - 1];

  useEffect(() => {
    // Debug logging removed
    return () => {
      // Debug logging removed
    };
  }, []);

  // Stabilize setFormMethods
  const setFormMethods = useCallback((methods: any) => {
    // Debug logging removed
    _formMethods.current = methods;
  }, []);

  const openDialog = useCallback((config: DialogConfig) => {
    // Debug logging removed
    setDialogStack((prev) => [...prev, config]);
  }, []);

  const closeDialog = useCallback(
    (source: "programmatic" | "user" = "programmatic") => {
      // Debug logging removed
      setDialogStack((prev) => {
        const newStack = prev.slice(0, -1);
        const closedDialog = prev[prev.length - 1];

        // Only call onCancel for user-initiated closures
        if (
          closedDialog &&
          (closedDialog.type === DialogType.CONFIRM ||
            closedDialog.type === DialogType.FORM)
        ) {
          if (source === "user") {
            closedDialog.onCancel?.(source);
          }
        }
        return newStack;
      });
    },
    [],
  );

  const replaceDialog = useCallback((newDialog: DialogConfig) => {
    // Debug logging removed
    setDialogStack((prev) => {
      const newStack = prev.slice(0, -1);
      return [...newStack, newDialog];
    });
  }, []);

  const stateValue = useMemo<DialogStateContextValue>(
    () => ({
      currentDialog,
      formMethods: _formMethods,
    }),
    [currentDialog, _formMethods],
  );

  const actionsValue = useMemo<DialogActionsContextValue>(
    () => ({
      closeDialog,
      openDialog,
      replaceDialog,
      setFormMethods,
    }),
    [openDialog, closeDialog, replaceDialog, setFormMethods],
  );

  return (
    <DialogStateContext.Provider value={stateValue}>
      <DialogActionsContext.Provider value={actionsValue}>
        {children}
      </DialogActionsContext.Provider>
    </DialogStateContext.Provider>
  );
}

export const useDialogState = () => useContext(DialogStateContext);
export const useDialogActions = () => useContext(DialogActionsContext);
export const useDialog = () => {
  const state = useDialogState();
  const actions = useDialogActions();

  return {
    ...state,
    ...(state.currentDialog
      ? actions
      : {
          closeDialog: actions.closeDialog,
          openDialog: actions.openDialog,
          replaceDialog: actions.replaceDialog,
        }),
  };
};

registerBridgedContext(DialogStateContext);
registerBridgedContext(DialogActionsContext);
