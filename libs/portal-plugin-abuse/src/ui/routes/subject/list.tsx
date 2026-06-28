import { lazyIcon } from "@lumeweb/portal-framework-ui-core";

import React from "react";
import { format } from "date-fns";
import { CoreTable, ThemedBadge } from "@lumeweb/portal-framework-ui";
import { RefineResource } from "@/types/resources";
import { createColumnHelper } from "@tanstack/react-table";
import { Link } from "@refinedev/core";
import { SubjectResponse } from "@/types/subject";
const AlertTriangle = lazyIcon("AlertTriangle");
const Eye = lazyIcon("Eye");


export default function List() {
  const columnHelper = createColumnHelper<SubjectResponse>();

  const columns = [
    columnHelper.accessor("identifier", {
      header: "Identifier",
      cell: ({ row }) => (
        <Link
          go={{
            to: {
              action: "show",
              id: row.original.id,
              resource: RefineResource.Subject,
            },
          }}>
          <div className="font-medium">{row.original.identifier}</div>
        </Link>
      ),
    }),
    /*    columnHelper.accessor("type", {
      header: "Type",
      cell: ({ row }) => (
        <div className="capitalize">{row.original.type.replace("_", " ")}</div>
      ),
    }),*/
    columnHelper.accessor("created_at", {
      header: "First Seen",
      cell: ({ row }) =>
        format(new Date(row.original.created_at), "MMM d, yyyy"),
    }) /*
    columnHelper.accessor("last_scan_result", {
      header: "Scan Result",
      cell: ({ row }) => {
        const getScanBadgeVariant = (result?: string) => {
          if (!result) return "outline";
          switch (result) {
            case "clean":
              return "success";
            case "malicious":
              return "destructive";
            case "suspicious":
              return "warning";
            default:
              return "secondary";
          }
        };

        return row.original.last_scan_result ? (
          <ThemedBadge
            className="capitalize"
            variant={getScanBadgeVariant(row.original.last_scan_result)}>
            {row.original.last_scan_result}
          </ThemedBadge>
        ) : (
          <span className="text-muted-foreground">Not scanned</span>
        );
      },
    }),
    columnHelper.accessor("risk_score", {
      header: "Risk Score",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{row.original.risk_score}/100</span>
        </div>
      ),
    }),
    columnHelper.accessor("total_associated_cases", {
      header: "Cases",
    }),
    columnHelper.accessor("id", {
      header: "Actions",
      cell: ({ row }) => (
        <Link
          className="font-medium text-primary hover:underline"
          go={{
            to: {
              action: "show",
              id: row.original.id,
              resource: RefineResource.Subject,
            },
          }}>
          <Eye className="h-4 w-4" />
          <span className="sr-only">View subject</span>
        </Link>
      ),
    }),*/,
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-background">Subjects</h1>
        <p className="text-muted-foreground">
          Manage and view all subjects in the system
        </p>
      </div>

      <CoreTable<SubjectResponse>
        columns={columns}
        resource={RefineResource.Subject}
        enableAdvancedFilters
        enableColumnFilters
        enableSorting
      />
    </div>
  );
}
