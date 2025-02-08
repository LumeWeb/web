import { registerBridgedContext } from "@lumeweb/portal-framework-core";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { DialogConfig, DialogContextType } from "./Dialog.types";

const DialogContext = createContext<DialogContextType>({
  closeDialog: () => {},
  currentDialog: undefined,
  formMethods: undefined,
  openDialog: () => {},
  replaceDialog: () => {},
  setFormMethods: () => {},
} as DialogContextType);

registerBridgedContext(DialogContext);

/**
 * Required provider that maintains dialog state and context.
 * Must wrap any components that will use dialogs.
 */
export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [dialogStack, setDialogStack] = useState<DialogConfig[]>([]);
  const [_formMethods, _setFormMethods] = useState<any>();
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
    _setFormMethods(methods);
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
          (closedDialog.type === "confirm" || closedDialog.type === "form")
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

  const contextValue = useMemo(
    () => ({
      closeDialog,
      currentDialog,
      openDialog,
      replaceDialog,
      setFormMethods,
    }),
    [closeDialog, currentDialog, openDialog, setFormMethods, replaceDialog],
  );

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
    </DialogContext.Provider>
  );
}

export const useDialog = () => useContext(DialogContext);
