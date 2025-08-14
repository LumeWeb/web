import { BaseRecord } from '@refinedev/core';
import React from 'react';
import { FormDialogConfig } from 'src/components/dialog';

import { ActionListRenderer } from '../actions';
import { getDefaultFormActions } from '../dialog/utils/dialogActions';
import { FormConfig } from './types';

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
  formMethods?: any;
}

interface RegularFormFooterProps<T extends BaseRecord = any> {
  className?: string;
  closeDialog?: () => void;
  config: FormConfig<T>;
  formMethods?: any;
}

function renderFormFooter<T extends BaseRecord = any>(
  config: FormConfig<T> | FormDialogConfig<T>,
  getFooter: (config: FormConfig<T> | FormDialogConfig<T>) =>
    | ((methods: any, closeDialog: () => void) => React.ReactNode)
    | React.ReactNode
    | undefined,
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
      typeof footerValue === 'function'
        ? footerValue(formMethods, closeDialog)
        : footerValue;
    return <div className={className}>{customFooter}</div>;
  }

  return (
    <div className={className}>
      <ActionListRenderer
        actions={actions}
        closeDialog={closeDialog}
        isSubmitting={formMethods?.formState?.isSubmitting || false}
        layout={config.actionButtonsLayout || 'horizontal'}
      />
    </div>
  );
}

export function FormFooter<T extends BaseRecord = any>({
  className,
  closeDialog,
  config,
  formMethods,
}: FormFooterProps<T>) {
  if ('type' in config && config.type === 'form') {
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
