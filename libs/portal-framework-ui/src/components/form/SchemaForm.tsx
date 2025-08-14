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
import React, { useEffect } from "react";

import { FormDialogConfig, useDialog } from "../dialog";
import { adapters, FormAdapter, UnifiedFormReturnType } from "./adapters";
import { FormProvider } from "./context";
import { FormFooter } from "./FormFooter";
import { FormRenderer } from "./FormRenderer";
import { type FormConfig, isStepFormConfig } from "./types";
import { computeAutoSaveConfig } from "./utils/autoSave";

const defaultFooterCss = "pt-4 mt-4 border-t";

export interface SchemaFormProps<
  TRequest extends FieldValues = FieldValues,
  TResponse extends BaseRecord = any,
> {
  closeDialog?: () => void;
  config: FormConfig<TRequest, TResponse>;
}

export function SchemaForm<T extends FieldValues = FieldValues>({
  closeDialog = () => void 0,
  config,
}: SchemaFormProps<T>) {
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
      id: (["edit", "clone"] as FormAction[]).includes(config.action!)
        ? config.id
        : undefined,
      resource: config.resource,
    },
    validationSchema: config.validationSchema,
  });

  const autoSaveProps = shouldUseRefine
    ? "refineCore" in formInstance
      ? formInstance.refineCore.autoSaveProps
      : undefined
    : undefined;

  useEffect(() => {
    if (setFormInstance) {
      setFormInstance(formInstance);
    }
  }, [formInstance, setFormInstance]);

  const cConfig = { ...config };

  if (cConfig.footerClassName === undefined) {
    cConfig.footerClassName = defaultFooterCss;
  }

  if (cConfig.footerClassName === false) {
    cConfig.footerClassName = undefined;
  }

  const finalConfig: FormConfig<T> | FormDialogConfig<T> = currentDialog
    ? { ...currentDialog, formConfig: cConfig }
    : cConfig;

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
            "flex flex-row gap-4 items-end": cConfig.layout === "horizontal",
            "grid gap-4": cConfig.layout === "grid",
            "space-y-4": cConfig.layout !== "grid",
          })}
          onSubmit={formInstance.handleSubmit(async () => {
            try {
              const response = await adapter.submitHandler(
                cConfig,
                formInstance,
              );
              // Unwrap nested response data if present
              const responseData =
                typeof response === "object" &&
                response !== null &&
                "data" in response
                  ? (response as Record<string, unknown>).data
                  : response;

              if (!isStepFormConfig(cConfig) && cConfig.onSuccess) {
                cConfig.onSuccess(responseData, formInstance.getValues());
              }
              if (currentDialog?.type === "form" && currentDialog.onSuccess) {
                currentDialog.onSuccess(responseData, formInstance.getValues());
              }

              if (cConfig.closeOnSubmit ?? true) {
                closeDialog?.();
              }
              await new Promise((resolve) => setTimeout(resolve, 100));
            } catch (error) {
              cConfig.onError?.(error as Error);

              if (adapterName !== "refine" && cConfig.errorNotification) {
                const notification =
                  typeof cConfig.errorNotification === "function"
                    ? cConfig.errorNotification(error)
                    : cConfig.errorNotification;
                openNotification?.(notification);
              }
            }
          })}>
          <FormRenderer fields={cConfig.fields} />
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

