import { RefineResource } from "@/types/resources";
import { CoreTable } from "@lumeweb/portal-framework-ui";
import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import React from "react";
import { ReporterResponse } from "@/types/reporter";
import { Link } from "@refinedev/core";

export default function List() {
  const columnHelper = createColumnHelper<ReporterResponse>();

  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: ({ row }) => {
        return (
          <Link
            go={{
              to: {
                action: "show",
                id: row.original.id,
                resource: RefineResource.Reporter,
              },
            }}>
            <div className="font-medium">{row.original.name}</div>
          </Link>
        );
      },
    }),
    columnHelper.accessor("email", {
      header: "Email",
      cell: ({ row }) => (
        <Link
          go={{
            to: {
              action: "show",
              id: row.original.id,
              resource: RefineResource.Reporter,
            },
          }}>
          {row.original.email}
        </Link>
      ),
    }),
    /*    columnHelper.accessor("user_type", {
      header: "User Type",
      cell: ({ row }) => (
        <div className="capitalize">
          {row.original.user_type.replace("_", " ")}
        </div>
      ),
    }),*/
    columnHelper.accessor("created_at", {
      header: "Registration Date",
      cell: ({ row }) =>
        format(new Date(row.original.created_at), "MMM d, yyyy"),
    }),
    /*    columnHelper.accessor("verification_status", {
      header: "Verification",
      cell: ({ row }) => (
        <ThemedBadge
          className="capitalize"
          config={VERIFICATION_BADGE_CONFIG}
          value={row.original.verification_status}
        />
      ),
    }),*/
    /*    columnHelper.accessor("trust_score", {
      header: "Trust Score",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <ProgressBar value={row.original.trust_score} />
        </div>
      ),
    }),*/
    columnHelper.accessor("total_reported_cases", {
      header: "Cases",
    }),
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-background">Reporters</h1>
        <p className="text-muted-foreground">
          Manage and view all reporters in the system
        </p>
      </div>

      <CoreTable<ReporterResponse>
        columns={columns}
        resource={RefineResource.Reporter}
        enableAdvancedFilters
        enableColumnFilters
        enableSorting
      />
    </div>
  );
}
