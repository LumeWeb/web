import { cn } from "@lumeweb/portal-framework-ui-core";

import {
  DIALOG_POSITION_CLASSES,
  DIALOG_SIZE_CLASSES,
  DialogConfig,
} from "../Dialog.types";

export function getDialogContentClasses(currentDialog: DialogConfig) {
  const baseClasses = [
    currentDialog.type === "custom" && "flex flex-col",
    currentDialog.classNames?.content,
  ];

  const sizeClasses = DIALOG_SIZE_CLASSES[currentDialog.size || "auto"];
  const positionClasses =
    DIALOG_POSITION_CLASSES[currentDialog.position || "center"];

  return cn(baseClasses, sizeClasses, positionClasses);
}
