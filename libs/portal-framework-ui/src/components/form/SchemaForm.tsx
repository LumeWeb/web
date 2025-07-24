import type {
  DefaultValues,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";

import {
  cn,
  Form as AdapterFormProvider,
} from "@lumeweb/portal-framework-ui-core";
import {
  AutoSaveIndicator,
  BaseRecord,
  useNotification,
  type FormAction,
} from "@refinedev/core";
import React, { useEffect } from "react";

import { ActionListRenderer } from "../actions";
import { useDialog } from "../dialog";
import { adapters, FormAdapter, UnifiedFormReturnType } from "./adapters";
import { FormProvider } from "./context";
import { FormRenderer } from "./FormRenderer";
import { FormAutosaveConfig, type FormConfig } from "./types";
import { UseFormReturnType } from "@refinedev/react-hook-form";

const defaultFooterCss = "pt-4 mt-4 border-t";

export interface SchemaFormProps<
  TRequest extends FieldValues = FieldValues,
  TResponse extends BaseRecord = any,
> {
  closeDialog?: () => void;
  config: FormConfig<TRequest, TResponse>;
}

function computeAutoSaveConfig<T extends FieldValues>(
  autoSave: FormConfig<T>["autoSave"],
): FormAutosaveConfig<T> | { enabled: false } {
  if (autoSave === true) {
    return { enabled: true, debounce: 1000 };
  }

  if (typeof autoSave === "object" && autoSave !== null && autoSave.enabled) {
    return {
      enabled: true,
      debounce: autoSave.debounce ?? 1000,
    };
  }

  return { enabled: false };
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
      resource: config.resource,
      action: config.action,
      id: (["edit", "clone"] as FormAction[]).includes(config.action!)
        ? config.id
        : undefined,
      autoSave: autoSaveConfig,
    },
    validationSchema: config.validationSchema,
  });

  const autoSaveProps = shouldUseRefine
    ? "refineCore" in formInstance
      ? (formInstance as UseFormReturnType<T>).refineCore.autoSaveProps
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
            "space-y-4": cConfig.layout !== "grid",
            "flex flex-col space-y-4":
              cConfig.layout === "vertical" || !cConfig.layout,
            "flex flex-row gap-4 items-end": cConfig.layout === "horizontal",
            "grid gap-4": cConfig.layout === "grid",
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
              if (cConfig.onSuccess) {
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
          {cConfig.footer && typeof cConfig.footer === "function" ? (
            cConfig.footer(formInstance, closeDialog)
          ) : (
            <div className={cConfig.footerClassName}>
              <ActionListRenderer
                actions={
                  cConfig.actionButtons ||
                  (Array.isArray(cConfig.footer) ? cConfig.footer : [])
                }
                closeDialog={closeDialog}
                isSubmitting={formInstance.formState.isSubmitting}
                layout={
                  cConfig.actionButtonsLayout ??
                  (cConfig.actionButtons ? "horizontal" : undefined)
                }
              />
            </div>
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
