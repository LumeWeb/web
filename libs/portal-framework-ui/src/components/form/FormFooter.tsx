import { BaseRecord } from "@refinedev/core";
import React from "react";

import { DialogConfig, FormDialogConfig } from "@/components/dialog";

import { ActionItemConfig, ActionListRenderer } from "../actions";
import { getDefaultFormActions } from "../dialog/utils/dialogActions";
import { FormConfig } from "./types";

type FooterContent<T extends BaseRecord = any> =
  | ((methods: any, closeDialog: () => void) => React.ReactNode)
  | ActionItemConfig[]
  | false
  | React.ReactNode;

interface FormDialogFooterProps<T extends BaseRecord = any> {
  className?: string;
  closeDialog?: () => void;
  config: FormDialogConfig<T>;
  formMethods?: any;
}

interface FormFooterProps<T extends BaseRecord = any> {
  className?: string;
  closeDialog?: () => void;
  config: FormConfig<T> | FormDialogConfig<T>;
  currentDialog?: DialogConfig<T>;
  formMethods?: any;
}

type GetFooterFn<T extends BaseRecord = any> = (
  config: FormConfig<T> | FormDialogConfig<T>,
) => FooterContent<T> | undefined;

interface RegularFormFooterProps<T extends BaseRecord = any> {
  className?: string;
  closeDialog?: () => void;
  config: FormConfig<T>;
  formMethods?: any;
}

export function FormFooter<T extends BaseRecord = any>({
  className,
  closeDialog,
  config,
  formMethods,
}: FormFooterProps<T>) {
  if ("type" in config && config.type === "form") {
    return (
      <FormDialogFooter
        className={className}
        closeDialog={closeDialog}
        config={config as FormDialogConfig<T>}
        formMethods={formMethods}
      />
    );
  }

  return (
    <RegularFormFooter
      className={className}
      closeDialog={closeDialog}
      config={config as FormConfig<T>}
      formMethods={formMethods}
    />
  );
}

function FormDialogFooter<T extends BaseRecord = any>({
  className,
  closeDialog,
  config,
  formMethods,
}: FormDialogFooterProps<T>): React.ReactNode {
  return renderFormFooter(
    config,
    (cfg) => (cfg as FormDialogConfig<T>).formConfig.footer,
    formMethods,
    closeDialog,
    className,
  );
}

function RegularFormFooter<T extends BaseRecord = any>({
  className,
  closeDialog,
  config,
  formMethods,
}: RegularFormFooterProps<T>): React.ReactNode {
  return renderFormFooter(
    config,
    (cfg) => (cfg as FormConfig<T>).footer,
    formMethods,
    closeDialog,
    className,
  );
}

function renderFormFooter<T extends BaseRecord = any>(
  config: FormConfig<T> | FormDialogConfig<T>,
  getFooter: GetFooterFn<T>,
  formMethods: any,
  closeDialog: () => void,
  className?: string,
): React.ReactNode {
  const footerValue = getFooter(config);
  const defaultActions = getDefaultFormActions(
    config,
    formMethods?.formState?.isSubmitting,
  );
  const actions = config.actionButtons ?? defaultActions;

  if (!footerValue && !actions.length) {
    return null;
  }

  if (footerValue) {
    const customFooter =
      typeof footerValue === "function"
        ? footerValue(formMethods, closeDialog)
        : footerValue;

    if (Array.isArray(customFooter)) {
      return (
        <div className={className}>
          <ActionListRenderer
            actions={customFooter}
            closeDialog={closeDialog}
            isSubmitting={formMethods?.formState?.isSubmitting || false}
            layout={config.actionButtonsLayout || "horizontal"}
          />
        </div>
      );
    }

    return <div className={className}>{customFooter}</div>;
  }

  return (
    <div className={className}>
      <ActionListRenderer
        actions={actions}
        closeDialog={closeDialog}
        isSubmitting={formMethods?.formState?.isSubmitting || false}
        layout={config.actionButtonsLayout || "horizontal"}
      />
    </div>
  );
}
