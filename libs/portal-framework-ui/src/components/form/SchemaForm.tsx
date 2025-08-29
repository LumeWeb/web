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

import { FormDialogConfig, useDialog } from "../dialog";
import { adapters, FormAdapter, UnifiedFormReturnType } from "./adapters";
import { FormProvider } from "./context";
import { FormFooter } from "./FormFooter";
import { FormRenderer } from "./FormRenderer";
import { handleFormSubmission } from "./handlers/core";
import { type FormConfig, isStepFormConfig } from "./types";
import { computeAutoSaveConfig } from "./utils/autoSave";

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
  const { currentDialog, setFormMethods: setFormInstance } = useDialog();
  const { open: openNotification } = useNotification();
  if (!config) throw new Error("SchemaForm requires a form config");

  // Determine adapter - prioritize explicit config, then refine resource presence
  const shouldUseRefine =
    config.adapter === "refine" ||
    config.refine ||
    Boolean(config.refineCoreProps?.resource);
  const adapterName = shouldUseRefine ? "refine" : (config.adapter ?? "rhf");
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

  const isActiveDialog = !!currentDialog?.formConfig;

  useEffect(() => {
    if (!setFormInstance) return;
    if (isActiveDialog) {
      setFormInstance(formInstance);
    }
    return () => {
      // clear on unmount or when dialog closes
      try { setFormInstance(undefined as any); } catch {}
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
    () => (isActiveDialog ? { ...currentDialog!, formConfig: cConfig } : cConfig),
    [isActiveDialog, currentDialog, cConfig],
  );

  const isRefineWithAutosave = shouldUseRefine && autoSaveConfig?.enabled;

  return (
    <FormProvider<T>
      adapter={adapterName as keyof typeof adapters}
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
          {cConfig.header && (
            <div className="form-header">
              {typeof cConfig.header === "function"
                ? cConfig.header(formInstance)
                : cConfig.header}
            </div>
          )}
          <FormRenderer fields={cConfig.fields} groups={cConfig.groups} />
          {cConfig.footer !== false && (
            <FormFooter
              className={cConfig.footerClassName}
              closeDialog={closeDialog}
              config={finalConfig}
              formMethods={formInstance}
            />
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
