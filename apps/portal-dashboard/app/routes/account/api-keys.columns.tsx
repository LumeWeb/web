import { createColumnHelper } from "@tanstack/react-table";

export interface APIKey {
  uuid: string;
  name: string;
  created_at: string;
}

const columnHelper = createColumnHelper<APIKey>();

export const apiKeyColumns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("created_at", {
    header: "Created",
    cell: (info) => {
      const date = new Date(info.getValue());
      return date.toLocaleDateString();
    },
  }),
];
