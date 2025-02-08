import { createColumnHelper } from "@tanstack/react-table";

export interface APIKey {
  created_at: string;
  name: string;
  uuid: string;
}

const columnHelper = createColumnHelper<APIKey>();

export const apiKeyColumns = [
  columnHelper.accessor("name", {
    cell: (info) => info.getValue(),
    header: "Name",
  }),
  columnHelper.accessor("created_at", {
    cell: (info) => {
      const date = new Date(info.getValue());
      return date.toLocaleDateString();
    },
    header: "Created",
  }),
];
