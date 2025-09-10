import type { BaseRecord } from "@refinedev/core";

import React, { createContext, ReactNode, useContext } from "react";

import type { FooterEnvironment } from "../types/footer";

interface FooterContextProviderProps<T extends BaseRecord = any> {
  children: ReactNode;
  value: Partial<FooterEnvironment<T>>;
}

const FooterContextInternal = createContext<
  Partial<FooterEnvironment<any>> | undefined
>(undefined);

export function FooterContextProvider<T extends BaseRecord = any>({
  children,
  value,
}: FooterContextProviderProps<T>) {
  return (
    <FooterContextInternal.Provider value={value}>
      {children}
    </FooterContextInternal.Provider>
  );
}

export function useFooterContext<
  T extends BaseRecord = any,
>(): FooterEnvironment<T> {
  const context = useContext(FooterContextInternal);
  if (!context) {
    throw new Error(
      "useFooterContext must be used within a FooterContextProvider",
    );
  }
  if (!context.container || !context.form) {
    throw new Error(
      "FooterContext requires both container and form to be provided",
    );
  }
  return context as FooterEnvironment<T>;
}

export function useOptionalFooterContext<T extends BaseRecord = any>():
  | Partial<FooterEnvironment<T>>
  | undefined {
  return useContext(FooterContextInternal) as
    | Partial<FooterEnvironment<T>>
    | undefined;
}
