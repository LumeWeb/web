import { TrashIcon } from "@radix-ui/react-icons";
import type { ColumnDef } from "@tanstack/react-table";
import { DownloadIcon, FileIcon, MoreIcon } from "~/components/icons";
import { Checkbox } from "~/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { cn } from "~/utils";
import type { FileItem } from "~/data/file-provider";
import { usePinning } from "~/hooks/usePinning";
import filesize from "~/components/lib/filesize";
import { Button } from "~/components/ui/button";


// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type File = {
  name: string;
  cid: string;
  size: string;
  createdOn: string;
};

export const columns: ColumnDef<FileItem>[] = [
  // {
  //   id: "select",
  //   size: 20,
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "cid",
    header: "CID",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        <FileIcon />
        {row.getValue("name") ?? row.getValue("cid")}
      </div>
    ),
  },
  {
    accessorKey: "size",
    header: "Size",
    cell: ({ row }) => {
      const size = row.getValue("size");
      return size ? filesize(size as number, 2) : "";
    },
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
    cell: ({ row }) => {
      const { unpin } = usePinning();
      const downloadFile = () => {
        // TODO: @pcfreak30 download file
        const cid = row.getValue("cid");
        console.log(cid);
      };
      return (
        <div className="flex space-x-2 w-10 items-center justify-between">
          <Button size={"icon"} variant="ghost" onClick={downloadFile}>
            <DownloadIcon className="w-5"/>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100",
                row.getIsSelected() && "block",
              )}>
              <MoreIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    unpin(row.getValue("cid"));
                  }}>
                  <TrashIcon className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
