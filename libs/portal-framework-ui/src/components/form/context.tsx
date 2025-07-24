import type { FieldValues } from "react-hook-form";

import React, { createContext, useContext } from "react";

import { adapters, UnifiedFormReturnType } from "./adapters";
import { FormConfig } from "./types";

interface FormContextType<TFieldValues extends FieldValues = FieldValues> {
  adapter: keyof typeof adapters;
  config: FormConfig<TFieldValues>;
  autoSave?: {
    status: "loading" | "error" | "idle" | "success";
    error: any;
    data: any;
  };
  formInstance: UnifiedFormReturnType<TFieldValues>;
}

const FormContext = createContext<FormContextType<any> | undefined>(undefined);

export function FormProvider<TFieldValues extends FieldValues = FieldValues>({
  adapter,
  children,
  config,
  autoSave,
  formInstance,
}: FormContextType & React.FC) {
  return (
    <FormContext.Provider value={{ adapter, config, autoSave, formInstance }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext<
  TFieldValues extends FieldValues = FieldValues,
>() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context as FormContextType<TFieldValues>;
}
