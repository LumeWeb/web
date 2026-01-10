import React, {
  createContext,
  useContext,
  useMemo,
} from "react";
import type { BaseRecord } from "@refinedev/core";
import { ToolbarConfig, ToolbarRefineContext } from "../DataTable.types";

export interface TableConfigContextValue<TData extends BaseRecord> {
  toolbarConfig?: ToolbarConfig<TData>;
  refineContext?: ToolbarRefineContext<TData>;
}

const TableConfigContext = createContext<TableConfigContextValue<any> | undefined>(
  undefined,
);

export interface TableConfigProviderProps<TData extends BaseRecord> {
  children: React.ReactNode;
  toolbarConfig?: ToolbarConfig<TData>;
  refineContext?: ToolbarRefineContext<TData>;
}

export function TableConfigProvider<TData extends BaseRecord>({
  children,
  toolbarConfig,
  refineContext,
}: TableConfigProviderProps<TData>) {
  const value = useMemo(() => {
    return {
      toolbarConfig,
      refineContext,
    };
  }, [toolbarConfig, refineContext]);

  return (
    <TableConfigContext.Provider value={value}>
      {children}
    </TableConfigContext.Provider>
  );
}

export const useTableConfig = <TData extends BaseRecord>() => {
  const context = useContext(TableConfigContext);
  if (context === undefined) {
    throw new Error("useTableConfig must be used within a TableConfigProvider");
  }
  return context as TableConfigContextValue<TData>;
};

export const useTableConfigOptional = <TData extends BaseRecord>() => {
  const context = useContext(TableConfigContext);
  return context as TableConfigContextValue<TData> | undefined;
};
