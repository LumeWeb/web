import { TableCell, TableRow } from "@lumeweb/portal-framework-ui-core";
import React from "react";

export interface TableEmptyStateProps {
  /** Custom empty state content */
  children?: React.ReactNode;
  /** Number of columns to span */
  colSpan: number;
  /** Default empty state message */
  message?: string;
}

export function TableEmptyState({
  children,
  colSpan,
  message = "No data available",
}: TableEmptyStateProps) {
  return (
    <TableRow>
      <TableCell className="py-8 text-center" colSpan={colSpan}>
        {children || message}
      </TableCell>
    </TableRow>
  );
}
