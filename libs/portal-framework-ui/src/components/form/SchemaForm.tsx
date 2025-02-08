import type {
  DefaultValues,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";

import {
  Form as AdapterFormProvider,
  cn,
} from "@lumeweb/portal-framework-ui-core";
import { BaseRecord, useNotification } from "@refinedev/core";
import React, { useEffect } from "react";

import { ActionListRenderer } from "../actions";
import { useDialog } from "../dialog";
import { adapters, FormAdapter } from "./adapters";
import { FormProvider } from "./context";
import { FormRenderer } from "./FormRenderer";
import { type FormConfig } from "./types";

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
  const { currentDialog, setFormMethods } = useDialog();
  const { open: openNotification } = useNotification();
  if (!config) throw new Error("SchemaForm requires a form config");

  // Determine adapter - prioritize explicit config, then refine resource presence
  const shouldUseRefine =
    config.adapter === "refine" ||
    config.refine ||
    Boolean(config.refineCoreProps?.resource);
  const adapterName = shouldUseRefine ? "refine" : (config.adapter ?? "rhf");
  const adapter = adapters[adapterName] as FormAdapter<T>;

  const methods = adapter.useForm({
    defaultValues: config.defaultValues as DefaultValues<T>,
    refineCoreProps: {
      ...config.refineCoreProps,
      resource: config.resource,
    },
    validationSchema: config.validationSchema,
  });

  useEffect(() => {
    if (setFormMethods) {
      setFormMethods(methods);
    }
  }, [methods, setFormMethods]);

  const cConfig = { ...config };

  if (cConfig.footerClassName === undefined) {
    cConfig.footerClassName = defaultFooterCss;
  }

  if (cConfig.footerClassName === false) {
    cConfig.footerClassName = undefined;
  }

  return (
    <FormProvider<T>
      adapter={adapterName as keyof typeof adapters}
      config={cConfig}>
      <AdapterFormProvider {...(methods as UseFormReturn<FieldValues>)}>
        <form
          className={cn("space-y-4", cConfig.formClassName, {
            "flex flex-col space-y-4":
              cConfig.layout === "vertical" || !cConfig.layout,
            "flex flex-row gap-4 items-end": cConfig.layout === "horizontal",
            "grid gap-4": cConfig.layout === "grid",
          })}
          onSubmit={methods.handleSubmit(async (data) => {
            try {
              const response = await adapter.submitHandler(cConfig, methods);
              // Unwrap nested response data if present
              const responseData =
                typeof response === "object" &&
                response !== null &&
                "data" in response
                  ? (response as Record<string, unknown>).data
                  : response;
              if (cConfig.onSuccess) {
                cConfig.onSuccess(responseData, methods.getValues());
              }
              if (currentDialog?.type === "form" && currentDialog.onSuccess) {
                currentDialog.onSuccess(responseData, methods.getValues());
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
            cConfig.footer(methods, closeDialog)
          ) : (
            <div className={cConfig.footerClassName}>
              <ActionListRenderer
                actions={
                  cConfig.actionButtons ||
                  (Array.isArray(cConfig.footer) ? cConfig.footer : [])
                }
                closeDialog={closeDialog}
                isSubmitting={methods.formState.isSubmitting}
                layout={
                  cConfig.actionButtonsLayout ??
                  (cConfig.actionButtons ? "horizontal" : undefined)
                }
              />
            </div>
          )}
        </form>
      </AdapterFormProvider>
    </FormProvider>
  );
}
