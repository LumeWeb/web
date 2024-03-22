import { DrawingPinIcon, TrashIcon } from "@radix-ui/react-icons";
import type { ColumnDef, RowData } from "@tanstack/react-table";
import { FileIcon, MoreIcon } from "~/components/icons";
import { Checkbox } from "~/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/utils";
import type { FileItem } from "~/data/file-provider";

declare module "@tanstack/table-core" {
  interface TableMeta<TData extends RowData> {
    hoveredRowId: string;
  }
}

export const columns: ColumnDef<FileItem>[] = [
  {
    id: "select",
    size: 20,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        <FileIcon />
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "cid",
    header: "CID",
  },
  {
    accessorKey: "size",
    header: "Size",
  },
  {
    accessorKey: "pinned",
    header: "Pinned On",
    cell: ({ row }) => new Date(row.getValue("pinned")).toLocaleString(),
  },
  {
    accessorKey: "actions",
    header: () => null,
    size: 20,
    cell: ({ row }) => (
      <div className="flex w-5 items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "hidden group-hover:block data-[state=open]:block",
              row.getIsSelected() && "block",
            )}>
            <MoreIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive">
                <TrashIcon className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
