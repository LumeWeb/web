import { ColumnDef } from "@tanstack/react-table";
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

const FileIcon = ({ className }: { className?: string }) => {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M10.791 13.7082H3.20768C2.56339 13.7082 2.04102 13.1858 2.04102 12.5415V1.45817C2.04102 0.813879 2.56339 0.291504 3.20768 0.291504H8.74147C8.74206 0.291504 8.74293 0.291504 8.74352 0.291504H8.74935C8.84268 0.291504 8.92231 0.338462 8.97568 0.406712L11.8425 3.2735C11.911 3.32688 11.9577 3.4065 11.9577 3.49984V3.50596C11.9577 3.50655 11.9577 3.50684 11.9577 3.50742V12.5415C11.9577 13.1858 11.4353 13.7082 10.791 13.7082ZM9.04102 1.27763V3.20817H10.9716L9.04102 1.27763ZM11.3743 3.7915H8.74935C8.58806 3.7915 8.45768 3.66084 8.45768 3.49984V0.874837H3.20768C2.88568 0.874837 2.62435 1.13617 2.62435 1.45817V12.5415C2.62435 12.8635 2.88568 13.1248 3.20768 13.1248H10.791C11.113 13.1248 11.3743 12.8635 11.3743 12.5415V3.7915ZM9.62435 11.3748H4.37435C4.21306 11.3748 4.08268 11.2445 4.08268 11.0832C4.08268 10.9222 4.21306 10.7915 4.37435 10.7915H9.62435C9.78564 10.7915 9.91602 10.9222 9.91602 11.0832C9.91602 11.2445 9.78564 11.3748 9.62435 11.3748ZM9.62435 9.0415H4.37435C4.21306 9.0415 4.08268 8.91113 4.08268 8.74984C4.08268 8.58884 4.21306 8.45817 4.37435 8.45817H9.62435C9.78564 8.45817 9.91602 8.58884 9.91602 8.74984C9.91602 8.91113 9.78564 9.0415 9.62435 9.0415ZM9.62435 6.70817H4.37435C4.21306 6.70817 4.08268 6.5778 4.08268 6.4165C4.08268 6.2555 4.21306 6.12484 4.37435 6.12484H9.62435C9.78564 6.12484 9.91602 6.2555 9.91602 6.4165C9.91602 6.5778 9.78564 6.70817 9.62435 6.70817Z"
                fill="currentColor"
            />
        </svg>
    );
};

const MoreIcon = ({ className }: { className?: string }) => {
  return (
      <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
      >
          <path
              d="M19 8H5C4.73478 8 4.48043 7.89464 4.29289 7.70711C4.10536 7.51957 4 7.26522 4 7C4 6.73478 4.10536 6.48043 4.29289 6.29289C4.48043 6.10536 4.73478 6 5 6H19C19.2652 6 19.5196 6.10536 19.7071 6.29289C19.8946 6.48043 20 6.73478 20 7C20 7.26522 19.8946 7.51957 19.7071 7.70711C19.5196 7.89464 19.2652 8 19 8Z"
              fill="currentColor"
          />
          <path
              d="M19 13H5C4.73478 13 4.48043 12.8946 4.29289 12.7071C4.10536 12.5196 4 12.2652 4 12C4 11.7348 4.10536 11.4804 4.29289 11.2929C4.48043 11.1054 4.73478 11 5 11H19C19.2652 11 19.5196 11.1054 19.7071 11.2929C19.8946 11.4804 20 11.7348 20 12C20 12.2652 19.8946 12.5196 19.7071 12.7071C19.5196 12.8946 19.2652 13 19 13Z"
              fill="currentColor"
          />
          <path
              d="M19 18H5C4.73478 18 4.48043 17.8946 4.29289 17.7071C4.10536 17.5196 4 17.2652 4 17C4 16.7348 4.10536 16.4804 4.29289 16.2929C4.48043 16.1054 4.73478 16 5 16H19C19.2652 16 19.5196 16.1054 19.7071 16.2929C19.8946 16.4804 20 16.7348 20 17C20 17.2652 19.8946 17.5196 19.7071 17.7071C19.5196 17.8946 19.2652 18 19 18Z"
              fill="currentColor"
          />
      </svg>
  );
};
