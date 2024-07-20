import React from "react";
import { DataTable } from "~/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

type CronJob = {
  id: number;
  uuid: string;
  function: string;
  args: string;
  lastRun: string | null;
  failures: number;
  created_at: string;
  updated_at: string;
};

const DATE_FORMAT = "M-d-yy h:mm a";

const columns: ColumnDef<CronJob>[] = [
  {
    id: "uuid",
    accessorKey: "uuid",
    header: "UUID",
  },
  {
    id: "function",
    accessorKey: "function",
    header: "Function",
  },
  {
    id: "args",
    accessorKey: "args",
    header: "Arguments",
    cell: ({ row }) => {
      const args = row.original.args;
      return (
        <span title={args}>
          {args?.length > 20 ? `${args.substring(0, 20)}...` : args}
        </span>
      );
    },
  },
  {
    id: "last_run",
    accessorKey: "last_run",
    header: "Last Run",
    cell: ({ row }) => {
      const lastRun = row.original.lastRun;
      return lastRun
        ? format(new Date(lastRun), "yyyy-MM-dd HH:mm:ss")
        : "Never";
    },
  },
  {
    id: "failures",
    accessorKey: "failures",
    header: "Failures",
  },
  {
    id: "created_at",
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      return format(new Date(row.original.created_at), DATE_FORMAT);
    },
  },
  {
    id: "updated_at",
    accessorKey: "created_at",
    header: "Updated At",
    cell: ({ row }) => {
      return format(new Date(row.original.created_at), DATE_FORMAT);
    },
  },
];

export const CronTable: React.FC = () => {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Cron Tasks</h1>
      <DataTable columns={columns} resource="cron/jobs" />
    </div>
  );
};

export default CronTable;
