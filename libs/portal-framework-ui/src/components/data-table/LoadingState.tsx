import { TableCell, TableRow } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { SkeletonLoader } from "../SkeletonLoader";
import { useTable } from "./Table.context";

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
  const { table } = useTable();

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
          <SkeletonLoader layout="table" table={table} />
        </TableCell>
      </TableRow>
    </>
  );
}
