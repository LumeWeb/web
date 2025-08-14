import { zodResolver } from "@hookform/resolvers/zod";
import { BaseRecord, HttpError } from "@refinedev/core"; // Add FormAction import
import {
  useForm as useRefineForm,
  type UseFormProps as RefineUseFormProps,
  UseFormReturnType,
} from "@refinedev/react-hook-form";
import {
  Controller as RHFController,
  FieldValues,
  FormProvider as RHFFormProvider,
  useForm as useRHFForm,
  type UseFormProps as RHFUseFormProps,
  type UseFormReturn,
} from "react-hook-form";
import * as z from "zod";

import type { FormConfig } from "./types";

export interface FormAdapter<T extends FieldValues = FieldValues> {
  Controller: typeof RHFController;
  FormProvider: typeof RHFFormProvider<T>;
  submitHandler: (
    config: FormConfig<T>,
    methods: UnifiedFormReturnType<T>,
  ) => Promise<void>;
  useForm: (options: BaseUseFormOptions<T>) => UnifiedFormReturnType<T>;
}

export type UnifiedFormReturnType<T extends FieldValues> =
  | UseFormReturn<T, any>
  | UseFormReturnType<T>;

interface BaseUseFormOptions<TFieldValues extends FieldValues = FieldValues> {
  defaultValues?: RHFUseFormProps<TFieldValues>["defaultValues"];
  refineCoreProps?: RefineUseFormProps<
    TFieldValues,
    HttpError,
    TFieldValues
  >["refineCoreProps"];
  validationSchema?: z.ZodSchema<TFieldValues>;
}

export const adapters: Record<string, FormAdapter<any>> = {
  refine: {
    Controller: RHFController,
    FormProvider: RHFFormProvider,
    submitHandler: async <
      TRequest extends FieldValues,
      TResponse extends BaseRecord = any,
    >(
      config: FormConfig<TRequest, TResponse>,
      methods: UseFormReturn<TRequest, any>,
    ) => {
      const values = methods.getValues();
      const refineResult = await (
        methods as ReturnType<typeof useRefineForm>
      ).refineCore.onFinish({
        ...values,
      });

      if (config.onSubmit) {
        const submitResult = await config.onSubmit(values);
        return (submitResult ?? refineResult) as unknown as TResponse;
      }
      return refineResult as unknown as TResponse;
    },
    useForm: <TFieldValues extends FieldValues>(
      options: BaseUseFormOptions<TFieldValues>,
    ) => {
      return useRefineForm<TFieldValues, HttpError, TFieldValues>({
        defaultValues: options.defaultValues,
        refineCoreProps: {
          autoSave: {
            enabled: false,
          },
          ...(options.refineCoreProps ?? {}),
        },
        resolver: options.validationSchema
          ? zodResolver(options.validationSchema)
          : undefined,
      });
    },
  },
  rhf: {
    Controller: RHFController,
    FormProvider: RHFFormProvider,
    submitHandler: async <
      TRequest extends FieldValues,
      TResponse extends BaseRecord = any,
    >(
      config: FormConfig<TRequest, TResponse>,
      methods: UseFormReturn<TRequest, any>,
    ): Promise<TResponse> => {
      if (!config.onSubmit)
        throw new Error("onSubmit required for RHF adapter");
      return (await config.onSubmit(
        methods.getValues(),
      )) as unknown as TResponse;
    },
    useForm: <TFieldValues extends FieldValues>(
      options: BaseUseFormOptions<TFieldValues>,
    ) =>
      useRHFForm({
        defaultValues: options.defaultValues,
        resolver: options.validationSchema
          ? zodResolver(options.validationSchema)
          : undefined,
      }),
  },
};
