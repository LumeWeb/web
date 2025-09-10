import type { BaseRecord } from "@refinedev/core";

import React, { createContext, ReactNode, useContext } from "react";

import type { HeaderEnvironment } from "../types/header";

interface HeaderContextProviderProps<T extends BaseRecord = any> {
  children: ReactNode;
  value: HeaderEnvironment<T>;
}

const HeaderContextInternal = createContext<HeaderEnvironment<any> | undefined>(
  undefined,
);

export function HeaderContextProvider<T extends BaseRecord = any>({
  children,
  value,
}: HeaderContextProviderProps<T>) {
  return (
    <HeaderContextInternal.Provider value={value}>
      {children}
    </HeaderContextInternal.Provider>
  );
}

export function useHeaderContext<
  T extends BaseRecord = any,
>(): HeaderEnvironment<T> {
  const context = useContext(HeaderContextInternal);
  if (!context) {
    throw new Error(
      "useHeaderContext must be used within a HeaderContextProvider",
    );
  }
  return context as HeaderEnvironment<T>;
}

export function useOptionalHeaderContext<T extends BaseRecord = any>():
  | HeaderEnvironment<T>
  | undefined {
  return useContext(HeaderContextInternal) as HeaderEnvironment<T> | undefined;
}
