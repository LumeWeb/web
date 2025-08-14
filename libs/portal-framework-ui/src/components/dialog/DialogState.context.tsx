import { createContext } from "react";

import type { DialogConfig } from "./Dialog.types";

export const DialogStateContext = createContext<{
  currentDialog?: DialogConfig;
  formMethods?: any;
}>({
  currentDialog: undefined,
  formMethods: undefined,
});
