import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Spinner,
} from "@lumeweb/portal-framework-ui-core";
import { BaseRecord } from "@refinedev/core";
import React from "react";

import { DialogBaseConfig } from "../Dialog.types";

interface FooterComponentProps<T extends BaseRecord = any> {
  className?: string;
  currentDialog: DialogBaseConfig<T>;
  formMethods?: any;
  onConfirm?: () => void;
}

export function ActionsDropdownFooter<T extends BaseRecord = any>({
  className,
  currentDialog,
  onConfirm,
}: FooterComponentProps<T>) {
  if (!currentDialog.actions) return null;

  return (
    <DropdownMenu className={className}>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={currentDialog.showSpinner}
          variant={
            currentDialog.variant === "destructive" ? "destructive" : "default"
          }>
          {currentDialog.actions.triggerLabel}
          {currentDialog.showSpinner && <Spinner className="ml-2" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(currentDialog.type === "confirm" ||
          currentDialog.type === "alert") && (
          <DropdownMenuItem onSelect={onConfirm}>
            {currentDialog.type === "confirm"
              ? currentDialog.confirmText
              : "Continue"}
          </DropdownMenuItem>
        )}
        {currentDialog.actions.content}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
