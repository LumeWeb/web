import {
  PRIORITY_BADGE_CONFIG,
  STATUS_BADGE_CONFIG,
} from "@/types/badge-configs";
import { CasePriority, CaseResponse, CaseStatus, CaseType } from "@/types/case";
import { RefineResource } from "@/types/resources";
import {
  ThemedBadge,
  CrudTable,
  FilterField,
} from "@lumeweb/portal-framework-ui";
import { Link, useNavigation } from "@refinedev/core";
import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import React from "react";

export function CaseTable() {
  const columnHelper = createColumnHelper<CaseResponse>();

  // Define case-specific filter fields
  const filterFields: FilterField[] = [
    {
      field: "status",
      label: "Status",
      operators: ["eq", "ne"],
      options: Object.values(CaseStatus).map((status) => ({
        label: status.replace("_", " "),
        value: status,
      })),
      priority: "high",
      type: "select",
    },
    {
      field: "type",
      label: "Type",
      options: Object.values(CaseType).map((type) => ({
        label: type.charAt(0).toUpperCase() + type.slice(1),
        value: type,
      })),
      priority: "high",
      type: "select",
    },
    {
      field: "priority",
      label: "Priority",
      options: Object.values(CasePriority).map((priority) => ({
        label: priority.charAt(0).toUpperCase() + priority.slice(1),
        value: priority,
      })),
      priority: "medium",
      type: "select",
    },
    {
      field: "needsReview",
      label: "Needs Review",
      priority: "medium",
      type: "boolean",
    },
    {
      field: "createdAt",
      label: "Created Date",
      operators: ["gte", "lte", "eq"],
      priority: "high",
      type: "date",
    },
  ];

  const columns = [
    columnHelper.accessor("id", {
      cell: ({ row }) => <div className="w-[60px]">{row.original.id}</div>,
      header: "ID",
    }),
    columnHelper.accessor("reference_number", {
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
      header: "Reference",
    }),
    columnHelper.accessor("type", {
      cell: ({ row }) => (
        <div className="capitalize">{row.original.type.replace("_", " ")}</div>
      ),
      header: "Type",
    }),
    columnHelper.accessor("status", {
      cell: ({ row }) => (
        <ThemedBadge
          className="capitalize"
          config={STATUS_BADGE_CONFIG}
          value={row.original.status}
        />
      ),
      header: "Status",
    }),
    columnHelper.accessor("priority", {
      cell: ({ row }) => (
        <ThemedBadge
          className="capitalize"
          config={PRIORITY_BADGE_CONFIG}
          value={row.original.priority}
        />
      ),
      header: "Priority",
    }),
    columnHelper.accessor("needs_review", {
      cell: ({ row }) => <div>{row.original.needs_review ? "Yes" : "No"}</div>,
      header: "Needs Review",
    }),
    columnHelper.accessor("created_at", {
      cell: ({ row }) => (
        <div>{format(new Date(row.original.created_at), "MMM d, yyyy")}</div>
      ),
      header: "Created At",
    }),
  ];

  return (
    <CrudTable<CaseResponse>
      ariaLabel="Case management table"
      columns={columns}
      defaultSort={[{ desc: true, id: "createdAt" }]}
      enableAdvancedFilters
      enableExport
      enableQuickFilters
      errorComponent={
        <div className="text-destructive">Error loading cases</div>
      }
      exportOptions={{
        fileName: "cases-export",
        formats: ["csv"],
      }}
      fields={filterFields}
      onError={(error) => console.error("Case table error:", error)}
      persistState={true}
      resourceName={RefineResource.Case}
    />
  );
}
