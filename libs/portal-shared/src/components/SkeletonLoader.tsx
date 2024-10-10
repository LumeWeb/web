import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { UseTableReturnType } from "@refinedev/react-table";
import { BaseRecord, HttpError } from "@refinedev/core";
import { flexRender } from "@tanstack/react-table";

type LayoutType = "default" | "card" | "list" | "table" | "profile" | "custom";

interface SkeletonLoaderProps<TData extends BaseRecord> {
  layout?: LayoutType;
  rows?: number;
  cols?: number;
  showHeader?: boolean;
  className?: string;
  table?: UseTableReturnType<TData, HttpError>;
}

export function SkeletonLoader<TData extends BaseRecord>({
  layout = "default",
  rows = 3,
  cols = 3,
  showHeader = true,
  className,
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
              <TableRow key={headerGroup.id} className={"border-none"}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className={"border-none"}>
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
            <TableRow key={rowIndex} className={"border-none"}>
              {table.getAllColumns().map((column) => (
                <TableCell key={column.id} className={"border-none"}>
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
        <Skeleton key={index} className="h-4 w-full" />
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
    case "table":
      return renderTableSkeleton();
    case "card":
      return renderCardSkeleton();
    case "list":
      return renderListSkeleton();
    case "profile":
      return renderProfileSkeleton();
    case "custom":
      return renderCustomSkeleton();
    default:
      return renderDefaultSkeleton();
  }
}
