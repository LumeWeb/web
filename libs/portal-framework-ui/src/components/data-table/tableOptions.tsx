import { Table } from "@tanstack/react-table";
import React from "react";

import { BaseTableCommonProps, BaseTablePaginationConfig } from "./BaseTable";
import { DefaultPagination } from "./DefaultPagination";
import { TableEmptyState } from "./EmptyState";
import { TableLoadingState } from "./LoadingState";

export interface NormalizedTableOptions<TData> {
  emptyState: React.ReactNode;
  loadingState: React.ReactNode;
  pagination: {
    component?: React.ReactNode;
    enabled: boolean;
  };
}

export function normalizeTableOptions<TData>(
  pagination: BaseTablePaginationConfig | boolean | undefined,
  emptyState: BaseTableCommonProps<TData>["emptyState"],
  emptyStateMessage: BaseTableCommonProps<TData>["emptyStateMessage"],
  loadingState: BaseTableCommonProps<TData>["loadingState"],
  loadingStateMessage: BaseTableCommonProps<TData>["loadingStateMessage"],
  table: Table<TData>,
): NormalizedTableOptions<TData> {
  let paginationComponent: React.ReactNode = null;
  const paginationEnabled =
    pagination !== false &&
    (pagination === true || (typeof pagination === "object" && pagination.enabled === true));
  const colSpan = table.getAllColumns().length;

  if (paginationEnabled) {
    if (typeof pagination === "object" && pagination.component) {
      paginationComponent = pagination.component;
    } else {
      paginationComponent = <DefaultPagination />;
    }
  }

  let normalizedEmptyState: React.ReactNode;
  if (!emptyState) {
    normalizedEmptyState = (
      <TableEmptyState colSpan={colSpan} message={emptyStateMessage} />
    );
  } else if (typeof emptyState === "function") {
    normalizedEmptyState = emptyState(colSpan);
  } else {
    normalizedEmptyState = emptyState;
  }

  let normalizedLoadingState: React.ReactNode;
  if (!loadingState) {
    normalizedLoadingState = (
      <TableLoadingState colSpan={colSpan} message={loadingStateMessage} />
    );
  } else if (typeof loadingState === "function") {
    normalizedLoadingState = loadingState(colSpan);
  } else {
    normalizedLoadingState = loadingState;
  }

  return {
    emptyState: normalizedEmptyState,
    loadingState: normalizedLoadingState,
    pagination: {
      component: paginationComponent,
      enabled: paginationEnabled,
    },
  };
}
