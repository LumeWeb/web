import { SortingState } from "@tanstack/react-table";
import React from "react";

import type { CoreTableProps } from "./CoreTable";

import { CoreTable } from "./CoreTable";
import { EmptyState } from "./data-table/EmptyState";

export interface DataTableProps<TData, TError extends Error = Error>
  extends Omit<CoreTableProps<TData, TError>, "emptyState"> {
  /**
   * Default sorting state for the table
   */
  defaultSort?: SortingState;
  /**
   * Custom empty state configuration
   */
  emptyState?: {
    actions?: React.ReactNode;
    className?: string;
    illustration?: React.ReactNode;
    message?: string;
  };
  /**
   * Custom error message component
   */
  errorComponent?: React.ReactNode;
  /**
   * Active filter chips to display
   */
  /**
   * The resource name for refine operations
   */
  resourceName: string;
}

/**
 * Base table component that provides common configuration and functionality
 * for all tables in the application. Wraps the CoreTable component with
 * sensible defaults and error handling.
 */
export function DataTable<TData extends object, TError extends Error = Error>({
  defaultSort = [],
  errorComponent,
  resourceName,
  ...props
}: DataTableProps<TData, TError>) {
  return (
    <CoreTable<TData, TError>
      {...props}
      emptyState={
        props.emptyState ? (
          <EmptyState
            className={props.emptyState.className}
            description={
              props.emptyState.actions ? (
                <div className="mt-4">{props.emptyState.actions}</div>
              ) : undefined
            }
            illustration={props.emptyState.illustration}
            title={props.emptyState.message || ""}
          />
        ) : undefined
      }
      enableKeyboardShortcuts={true}
      enableSavedFilters={true}
      errorState={errorComponent}
      initialDensity="compact"
      initialState={{
        ...props.initialState,
        sorting: defaultSort,
      }}
      queryOptions={{
        refetchOnReconnect: true,
        refetchOnWindowFocus: true,
      }}
      resource={resourceName}
      showDensityToggle={true}
    />
  );
}
