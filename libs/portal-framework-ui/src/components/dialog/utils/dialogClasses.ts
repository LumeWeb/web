import { cn } from "@lumeweb/portal-framework-ui-core";

import { DialogConfig } from "../Dialog.types";

export function getDialogContentClasses(currentDialog: DialogConfig) {
  const baseClasses = [
    currentDialog.type === "custom" && "flex flex-col",
    currentDialog.classNames?.content,
  ];

  const sizeClasses = {
    auto: "max-w-[calc(100%-2rem)] sm:max-w-md",
    lg: "max-w-2xl",
    md: "max-w-xl",
    sm: "max-w-sm",
  }[currentDialog.size || "auto"];

  const positionClasses = {
    "bottom": "bottom-4 inset-x-0 mx-auto",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "left": "left-4 top-1/2 -translate-y-1/2",
    "right": "right-4 top-1/2 -translate-y-1/2",
    "top": "top-4 inset-x-0 mx-auto",
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
  }[currentDialog.position || "center"];

  return cn(baseClasses, sizeClasses, positionClasses);
}
