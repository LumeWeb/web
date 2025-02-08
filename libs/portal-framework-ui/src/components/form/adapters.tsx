import { zodResolver } from "@hookform/resolvers/zod";
import { BaseRecord, HttpError, FormAction } from "@refinedev/core"; // Add FormAction import
import {
  type UseFormProps as RefineUseFormProps,
  useForm as useRefineForm,
} from "@refinedev/react-hook-form";
import {
  FieldValues,
  Controller as RHFController,
  FormProvider as RHFFormProvider,
  type UseFormProps as RHFUseFormProps,
  type UseFormReturn,
  useForm as useRHFForm,
} from "react-hook-form";
import * as z from "zod";

import type { FormConfig } from "./types";

export interface FormAdapter<T extends FieldValues = FieldValues> {
  Controller: typeof RHFController;
  FormProvider: typeof RHFFormProvider<T>;
  submitHandler: (
    config: FormConfig<T>,
    methods: UseFormReturn<T, any>,
  ) => Promise<void>;
  useForm: (options: BaseUseFormOptions<T>) => UseFormReturn<T, any>;
}

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
