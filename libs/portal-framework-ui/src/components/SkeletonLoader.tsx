import {
  cn,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@lumeweb/portal-framework-ui-core";
import { BaseRecord, HttpError } from "@refinedev/core";
import { UseTableReturnType } from "@refinedev/react-table";
import { flexRender } from "@tanstack/react-table";
import React, { type JSX } from "react";

type LayoutType = "card" | "custom" | "default" | "list" | "profile" | "table";

interface SkeletonLoaderProps<TData extends BaseRecord> {
  className?: string;
  cols?: number;
  layout?: LayoutType;
  rows?: number;
  showHeader?: boolean;
  table?: UseTableReturnType<TData, HttpError>;
}

export function SkeletonLoader<TData extends BaseRecord>({
  className,
  cols = 3,
  layout = "default",
  rows = 3,
  showHeader = true,
  table,
}: SkeletonLoaderProps<TData>): JSX.Element {
  const renderTableSkeleton = (): JSX.Element => {
    if (!table) {
      console.warn("Table object is required for table layout");
      return <></>;
    }

    return (
      <Table className={cn("w-full border-collapse", className)}>
        {showHeader && (
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className={"border-none"} key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    className={"border-none"}
                    key={header.id}
                    style={{ width: header.getSize() }}>
                    {header.isPlaceholder ? (
                      <Skeleton className="h-4 w-full" />
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
        )}
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow className={"border-none"} key={rowIndex}>
              {table.getAllColumns().map((column) => (
                <TableCell className={"border-none"} key={column.id}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderCardSkeleton = (): JSX.Element => (
    <div className={cn("space-y-2", className)}>
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );

  const renderListSkeleton = (): JSX.Element => (
    <div className={cn("flex items-center space-x-4", className)}>
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
    </div>
  );

  const renderProfileSkeleton = (): JSX.Element => (
    <div className={cn("space-y-4", className)}>
      <Skeleton className="h-20 w-20 rounded-full" />
      <Skeleton className="h-4 w-[150px]" />
      <Skeleton className="h-4 w-[200px]" />
    </div>
  );

  const renderCustomSkeleton = (): JSX.Element => (
    <div className={cn(`grid grid-cols-${cols} gap-4`, className)}>
      {Array.from({ length: cols * rows }).map((_, index) => (
        <Skeleton className="h-4 w-full" key={index} />
      ))}
    </div>
  );

  const renderDefaultSkeleton = (): JSX.Element => (
    <div className={cn("space-y-2", className)}>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  );

  switch (layout) {
    case "card":
      return renderCardSkeleton();
    case "custom":
      return renderCustomSkeleton();
    case "list":
      return renderListSkeleton();
    case "profile":
      return renderProfileSkeleton();
    case "table":
      return renderTableSkeleton();
    default:
      return renderDefaultSkeleton();
  }
}
