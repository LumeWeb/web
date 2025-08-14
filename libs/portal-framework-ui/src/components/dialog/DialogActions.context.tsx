import { createContext } from "react";

import type { DialogConfig } from "./Dialog.types";

export const DialogActionsContext = createContext<{
  closeDialog: (source?: "programmatic" | "user") => void;
  openDialog: (config: DialogConfig) => void;
  replaceDialog: (newDialog: DialogConfig) => void;
  setFormMethods: (methods: any) => void;
}>({
  closeDialog: () => {},
  openDialog: () => {},
  replaceDialog: () => {},
  setFormMethods: () => {},
});
