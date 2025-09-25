import { TableCell, TableRow } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { SkeletonLoader } from "@/components";
import { useTableInstance } from "./contexts";
import type { UseTableReturnType } from "@refinedev/react-table";

export interface TableLoadingStateProps {
  /** Custom loading content */
  children?: React.ReactNode;
  /** Number of columns to span */
  colSpan: number;
  /** Default loading message */
  message?: string;
}

export function TableLoadingState({
  children,
  colSpan,
  message = "Loading data...",
}: TableLoadingStateProps) {
  const { table } = useTableInstance();

  // Check if table has refineCore property to determine the correct type
  const refineTable =
    table && "refineCore" in table
      ? (table as UseTableReturnType<any, any>)
      : undefined;
  const skeletonTable = refineTable ?? table;

  if (children) {
    return (
      <TableRow>
        <TableCell className="py-8 text-center" colSpan={colSpan}>
          {children}
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      <TableRow>
        <TableCell className="pb-4 text-center" colSpan={colSpan}>
          {message}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className="py-8" colSpan={colSpan}>
          <SkeletonLoader
            layout="table"
            table={skeletonTable as UseTableReturnType}
          />
        </TableCell>
      </TableRow>
    </>
  );
}
