import type { ColumnDef } from "@tanstack/react-table";
import { FileIcon, MoreIcon } from "~/components/icons";
import { Checkbox } from "~/components/ui/checkbox";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type File = {
    name: string;
    cid: string;
    size: string;
    createdOn: string;
};

export const columns: ColumnDef<File>[] = [
    {
      id: "select",
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
        header: "Created On",
        cell: ({ row }) => (
          <div className="flex items-center justify-between">
            {row.getValue("createdOn")}
            {row.getIsSelected() && <MoreIcon />}
          </div>
        )
    }
];