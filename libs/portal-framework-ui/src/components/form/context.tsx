import type { FieldValues } from "react-hook-form";

import React, { createContext, ReactNode, useContext } from "react";

import { adapters } from "./adapters";
import { FormConfig } from "./types";

interface FormContextType<TFieldValues extends FieldValues = FieldValues> {
  adapter: keyof typeof adapters;
  config: FormConfig<TFieldValues>;
  methods?: any;
}

const FormContext = createContext<FormContextType<any> | undefined>(undefined);

export function FormProvider<TFieldValues extends FieldValues = FieldValues>({
  adapter,
  children,
  config,
}: {
  adapter: keyof typeof adapters;
  children: ReactNode;
  config: FormConfig<TFieldValues>;
}) {
  return (
    <FormContext.Provider value={{ adapter, config }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext<TFieldValues extends FieldValues = FieldValues>() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context as FormContextType<TFieldValues>;
}
