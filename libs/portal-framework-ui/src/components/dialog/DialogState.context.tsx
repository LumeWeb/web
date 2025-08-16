import { createContext } from "react";

import type { DialogConfig } from "./Dialog.types";

export interface DialogStateContextValue {
  currentDialog?: DialogConfig;
  formMethods?: any;
}

export const DialogStateContext = createContext<DialogStateContextValue>({
  currentDialog: undefined,
  formMethods: undefined,
});
