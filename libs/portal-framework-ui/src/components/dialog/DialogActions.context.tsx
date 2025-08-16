import { createContext } from "react";

import type { DialogConfig } from "./Dialog.types";

export interface DialogActionsContextValue {
  closeDialog: (source?: "programmatic" | "user") => void;
  openDialog: (config: DialogConfig) => void;
  replaceDialog: (newDialog: DialogConfig) => void;
  setFormMethods: (methods: any) => void;
}

export const DialogActionsContext = createContext<DialogActionsContextValue>({
  closeDialog: () => {},
  openDialog: () => {},
  replaceDialog: () => {},
  setFormMethods: () => {},
});
