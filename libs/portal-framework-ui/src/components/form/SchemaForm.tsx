import type { DefaultValues, FieldValues } from "react-hook-form";

import {
  Form as AdapterFormProvider,
  cn,
} from "@lumeweb/portal-framework-ui-core";
import {
  AutoSaveIndicator,
  BaseRecord,
  type FormAction,
  useNotification,
} from "@refinedev/core";
import React, { useEffect, useMemo } from "react";
import { isElement, isValidElementType } from "react-is";

import { createFormActions } from "@/components";
import { DialogConfig, FormDialogConfig, useDialog } from "@/components";
import { useIsFormDialog } from "@/components";
import { Environment, renderHeader, UnifiedFooter } from "@/components";
import { adapters, FormAdapter, UnifiedFormReturnType } from "./adapters";
import { FormProvider } from "./context";
import { FormRenderer } from "./FormRenderer";
import { handleFormSubmission } from "./handlers/core";
import { AdapterType, type FormConfig, isStepFormConfig } from "./types";
import { computeAutoSaveConfig } from "./utils/autoSave";
import { useForceRerender as useSharedForceRerender } from "@/components";

const defaultFooterCss = "pt-4 mt-4 border-t";

export interface SchemaFormProps<
  TRequest extends FieldValues = FieldValues,
  TResponse extends BaseRecord = any,
> {
  active?: boolean;
  closeDialog?: () => void;
  config: FormConfig<TRequest, TResponse>;
}

export function SchemaForm<T extends FieldValues = FieldValues>({
  active = true,
  closeDialog = () => void 0,
  config,
}: SchemaFormProps<T>) {
  if (!active) {
    return null;
  }

  const { currentDialog, setFormMethods: setFormInstance, formMethods } = useDialog();
  const { open: openNotification } = useNotification();
  const isInDialog = useIsFormDialog();

  if (!config) throw new Error("SchemaForm requires a form config");

  // Determine adapter - prioritize explicit config, then refine resource presence
  const shouldUseRefine =
    config.adapter === AdapterType.REFINE ||
    config.refine ||
    Boolean(config.refineCoreProps?.resource);
  const adapterName = shouldUseRefine
    ? AdapterType.REFINE
    : (config.adapter ?? AdapterType.RHF);
  const adapter = adapters[adapterName] as FormAdapter<T>;

  const autoSaveConfig = computeAutoSaveConfig(config.autoSave);

  const formInstance = adapter.useForm({
    defaultValues: config.defaultValues as DefaultValues<T>,
    refineCoreProps: {
      ...config.refineCoreProps,
      action: config.action,
      autoSave: autoSaveConfig,
      errorNotification: config.errorNotification,
      id: (["edit", "clone"] as FormAction[]).includes(config.action!)
        ? config.id
        : undefined,
      redirectOnSuccess: false,
      resource: config.resource,
      successNotification: config.successNotification,
    },
    validationSchema: config.validationSchema,
  });

  const autoSaveProps = shouldUseRefine
    ? "refineCore" in formInstance
      ? formInstance.refineCore.autoSaveProps
      : undefined
    : undefined;

  const isActiveDialog =
    !!(
      currentDialog?.formConfig &&
      currentDialog.formConfig.formId === config.formId
    ) && isInDialog;

  // Implement forceRerender mechanism
  useSharedForceRerender(config.forceRerender);

  useEffect(() => {
    if (!setFormInstance) return;
    if (isActiveDialog) {
      setFormInstance(formInstance);
    }
    return () => {
      // clear on unmount or when dialog closes
      try {
        setFormInstance(undefined as any);
      } catch {}
    };
  }, [formInstance, setFormInstance, isActiveDialog]);

  const cConfig = { ...config };

  if (cConfig.footerClassName === undefined) {
    cConfig.footerClassName = defaultFooterCss;
  }

  if (cConfig.footerClassName === false) {
    cConfig.footerClassName = undefined;
  }

  const finalConfig: FormConfig<T> | FormDialogConfig<T> = useMemo(
    () =>
      isActiveDialog ? { ...currentDialog!, formConfig: cConfig } : cConfig,
    [isActiveDialog, currentDialog, cConfig],
  );

  // Implement forceRerender mechanism
  useSharedForceRerender(config.forceRerender);

  const isRefineWithAutosave = shouldUseRefine && autoSaveConfig?.enabled;

  return (
    <FormProvider<T>
      adapter={adapterName}
      autoSave={autoSaveProps}
      config={cConfig}
      formInstance={formInstance}>
      <AdapterFormProvider
        {...(formInstance as unknown as UnifiedFormReturnType<FieldValues>)}>
        <form
          className={cn(cConfig.formClassName, {
            "flex flex-col space-y-4":
              cConfig.layout === "vertical" || !cConfig.layout,
            "flex flex-row items-end gap-4": cConfig.layout === "horizontal",
            "grid gap-4": cConfig.layout === "grid",
            "space-y-4": cConfig.layout !== "grid",
          })}
          onSubmit={formInstance.handleSubmit(async () => {
            await handleFormSubmission({
              closeDialog,
              config: cConfig,
              currentDialog,
              formMethods: formInstance,
              isStep: isStepFormConfig(cConfig),
              onError: async (error) => {
                if (adapterName !== "refine" && cConfig.errorNotification) {
                  const notification =
                    typeof cConfig.errorNotification === "function"
                      ? cConfig.errorNotification(error)
                      : cConfig.errorNotification;
                  openNotification?.(notification);
                }
              },
              onSubmit: async (data) =>
                adapter.submitHandler(cConfig, formInstance),
            });
          })}>
          {renderHeader({
            actions: cConfig.actions,
            className: "form-header",
            description: cConfig.description,
            header: cConfig.header,
            isDialog: isActiveDialog,
            title: cConfig.title,
            unifiedHeaderConfig: cConfig,
          })}
          <FormRenderer fields={cConfig.fields} groups={cConfig.groups} />
          {renderFooter(
            cConfig.footer,
            {
              className: cConfig.footerClassName,
              closeDialog,
              config: finalConfig,
              formMethods: formInstance,
            },
            isActiveDialog,
            currentDialog,
          )}
          {isRefineWithAutosave && (
            <AutoSaveIndicator
              {...autoSaveProps!}
              elements={cConfig.autoSaveStates}
            />
          )}
        </form>
      </AdapterFormProvider>
    </FormProvider>
  );
}

// Helper function to render footer based on configuration
function renderFooter(
  footerConfig: any,
  footerProps: any,
  isInDialog: boolean,
  currentDialog?: DialogConfig,
): React.ReactNode {
  // If footer is undefined, check if we're in a dialog context
  if (footerConfig === undefined) {
    const { config, formMethods, closeDialog } = footerProps;
    const isSubmitting = formMethods?.formState?.isSubmitting || false;

    const footerEnvironment = Environment.footer();

    if (isInDialog) {
      footerEnvironment.dialog({
        dialogConfig: currentDialog,
        onClose: config.onCancel || closeDialog,
      });
    } else {
      footerEnvironment.standalone();
    }
    footerEnvironment.simpleForm({
      isSubmitting,
      methods: formMethods,
    });

    return (
      <UnifiedFooter
        className={footerProps.className}
        config={{ ...config }}
        environment={footerEnvironment.build()}
      />
    );
  }

  // If footer is false, render nothing
  if (footerConfig === false) {
    return null;
  }

  // If footer is a React element or functional component, render it
  if (isElement(footerConfig) || isValidElementType(footerConfig)) {
    // If it's a valid element, render it directly
    if (isElement(footerConfig)) {
      return footerConfig;
    }
    // If it's a valid component type, instantiate it with footerProps
    if (isValidElementType(footerConfig)) {
      const FooterComponent = footerConfig as React.ComponentType<any>;
      return <FooterComponent {...footerProps} />;
    }
  }

  // For any other case, render default unified footer
  const footerEnvironment = Environment.footer()
    .standalone()
    .simpleForm({
      isSubmitting: footerProps.formMethods?.formState?.isSubmitting || false,
      methods: footerProps.formMethods,
    })
    .build();
  return (
    <UnifiedFooter
      className={footerProps.className}
      config={footerProps.config}
      environment={footerEnvironment}
    />
  );
}
