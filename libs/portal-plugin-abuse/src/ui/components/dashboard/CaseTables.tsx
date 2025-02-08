import {
  PRIORITY_BADGE_CONFIG,
  STATUS_BADGE_CONFIG,
} from "@/types/badge-configs";
import { CaseResponse } from "@/types/case";
import { RefineResource } from "@/types/resources";
import {
  type ColumnDef,
  CoreTable,
  ThemedBadge,
} from "@lumeweb/portal-framework-ui";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@lumeweb/portal-framework-ui-core";
import { createColumnHelper } from "@tanstack/react-table";
import { differenceInDays, format, subDays } from "date-fns";
import React from "react";
import { type CrudFilter, GetListResponse, Link } from "@refinedev/core";
import { AlertTriangle } from "lucide-react";

interface CaseTablesProps {
  caseTypeFilter: any;
  timeRange: any;
}

interface CaseItem extends CaseResponse {
  days_open?: number;
  is_stale?: boolean;
}

export function CaseTables({ caseTypeFilter, timeRange }: CaseTablesProps) {
  // Calculate the start date based on the timeRange
  const startDate = subDays(new Date(), getTimeRangeDays(timeRange));

  // Function to get the number of days for the time range
  function getTimeRangeDays(timeRange: string): number {
    switch (timeRange) {
      case "7d":
        return 7;
      case "30d":
        return 30;
      case "24h":
        return 1;
      default:
        return 7; // Default to 7 days
    }
  }

  const highPriorityFilters: CrudFilter[] = [
    {
      field: "priority",
      operator: "eq",
      value: "critical", // Or "high" if you want both
    },
    ...(caseTypeFilter !== "all"
      ? [
          {
            field: "type",
            operator: "eq" as const, // Use the string literal "eq" and type assertion
            value: caseTypeFilter,
          },
        ]
      : []),
    {
      field: "created_at",
      operator: "gte" as const, // Use the string literal "gte" and type assertion
      value: startDate.toISOString(),
    },
  ];

  const longestOpenFilters: CrudFilter[] = [
    ...(caseTypeFilter !== "all"
      ? [
          {
            field: "type",
            operator: "eq" as const, // Use the string literal "eq" and type assertion
            value: caseTypeFilter,
          },
        ]
      : []),
    {
      field: "created_at",
      operator: "gte" as const, // Use the string literal "gte" and type assertion
      value: startDate.toISOString(),
    },
  ];

  const columnHelper = createColumnHelper<CaseItem>();

  // Column definitions for High Priority Cases
  const highPriorityColumns: ColumnDef<CaseItem>[] = [
    columnHelper.accessor("reference_number", {
      header: "Case ID",
      cell: ({ row }) => (
        <Link
          className="font-medium text-primary hover:underline flex items-center gap-1"
          go={{
            to: {
              action: "show",
              id: row.original.id,
              resource: RefineResource.Case,
            },
          }}>
          {row.original.reference_number}
          {row.original.priority === "critical" && (
            <ThemedBadge
              className="ml-1 text-xs py-0 px-1.5"
              config={PRIORITY_BADGE_CONFIG}
              value={row.original.priority}
            />
          )}
        </Link>
      ),
    }),
    columnHelper.accessor("subject_id", {
      header: "Subject ID",
      cell: ({ row }) => (
        <div className="max-w-[150px] truncate">{row.original.subject_id}</div>
      ),
    }),
    columnHelper.accessor("updated_at", {
      header: "Last Updated",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground break-keep">
          {format(new Date(row.original.updated_at), "h:mm a")}
        </span>
      ),
    }),
    columnHelper.accessor("priority", {
      header: "Priority",
      cell: ({ row }) => (
        <ThemedBadge
          className="capitalize"
          config={PRIORITY_BADGE_CONFIG}
          value={row.original.priority}
        />
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ row }) => (
        <ThemedBadge
          className="capitalize"
          config={STATUS_BADGE_CONFIG}
          value={row.original.status}
        />
      ),
    }),
  ];

  // Column definitions for Longest Open Cases
  const longestOpenColumns: ColumnDef<CaseItem>[] = [
    columnHelper.accessor("days_open", {
      header: "Days Open",
      cell: ({ row }) => (
        <div className="font-medium flex items-center gap-1">
          {row.original.days_open}
          {row.original.is_stale && (
            <span title="Stale case (>7 days)">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </span>
          )}
        </div>
      ),
    }),
    columnHelper.accessor("reference_number", {
      header: "Case ID",
      cell: ({ row }) => (
        <Link
          className="font-medium text-primary hover:underline"
          go={{
            to: {
              action: "show",
              id: row.original.id,
              resource: RefineResource.Case,
            },
          }}>
          {row.original.reference_number}
        </Link>
      ),
    }),
    columnHelper.accessor("type", {
      header: "Type",
      cell: ({ row }) => <div className="capitalize">{row.original.type}</div>,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ row }) => (
        <ThemedBadge
          className="capitalize"
          config={STATUS_BADGE_CONFIG}
          value={row.original.status}
        />
      ),
    }),
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* High Priority Case Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            High Priority Cases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CoreTable
            resource={RefineResource.Case}
            columns={highPriorityColumns}
            enableColumnFilters
            enableSorting={false}
            enableRowSelection={false}
            filters={highPriorityFilters}
            queryOptions={{
              select: (data: GetListResponse<CaseResponse>) => {
                return data?.data
                  ? {
                      ...data,
                      data: data?.data?.map((item) => {
                        const createdAt = new Date(item.created_at);
                        const days_open = differenceInDays(
                          new Date(),
                          createdAt,
                        );
                        const is_stale = days_open > 7;

                        return {
                          ...item,
                          days_open,
                          is_stale,
                        };
                      }),
                    }
                  : data;
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Longest Open Case Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            Longest Open Cases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CoreTable
            resource={RefineResource.Case}
            columns={longestOpenColumns}
            enableColumnFilters
            enableSorting={false}
            enableRowSelection={false}
            filters={longestOpenFilters}
            sorters={[{ field: "created_at", order: "asc" }]}
            queryOptions={{
              select: (data: GetListResponse<CaseResponse>) => {
                return {
                  ...data,
                  data: data?.data?.map((item) => {
                    const createdAt = new Date(item.created_at);
                    const days_open = differenceInDays(new Date(), createdAt);
                    const is_stale = days_open > 7;

                    return {
                      ...item,
                      days_open,
                      is_stale,
                    };
                  }),
                };
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
