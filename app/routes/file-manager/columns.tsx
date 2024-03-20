import { DrawingPinIcon, TrashIcon } from "@radix-ui/react-icons";
import type { ColumnDef, RowData } from "@tanstack/react-table";
import { FileIcon, MoreIcon } from "~/components/icons";
import { Checkbox } from "~/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { cn } from "~/utils";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type File = {
    name: string;
    cid: string;
    size: string;
    createdOn: string;
};

declare module '@tanstack/table-core' {
  interface TableMeta<TData extends RowData> {
      hoveredRowId: string,
  }
}

export const columns: ColumnDef<File>[] = [
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
        )
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
        accessorKey: "createdOn",
        size: 200,
        header: "Created On",
        cell: ({ row }) => (
          <div className="flex items-center justify-between">
            {row.getValue("createdOn")}
              <DropdownMenu>
              <DropdownMenuTrigger className={
                cn("hidden group-hover:block data-[state=open]:block", row.getIsSelected() && "block")
              }>
                <MoreIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <DrawingPinIcon className="mr-2" />
                    Ping CID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">
                    <TrashIcon className="mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
    }
];