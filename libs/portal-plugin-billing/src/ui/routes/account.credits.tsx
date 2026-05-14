import {
  DataTable,
  FilterOperator,
  FilterType,
  GeneralLayout,
  PageHeader,
  ToolbarItemType,
  withTheme,
} from "@lumeweb/portal-framework-ui";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@lumeweb/portal-framework-ui-core";
import { Authenticated } from "@refinedev/core";
import { format } from "date-fns";
import type { UserCreditItem } from "@/types/subscription";
import { formatAmount } from "@/utils/formatAmount";

type CreditListItem = Omit<UserCreditItem, "id"> & { id: string };

const columnHelper = createColumnHelper<CreditListItem>();

const directionOptions = [
  { label: "Credit", value: "credit" },
  { label: "Debit", value: "debit" },
];

const typeOptions = [
  { label: "Purchase", value: "purchase" },
  { label: "Top-up", value: "topup" },
  { label: "Refund", value: "refund" },
  { label: "Adjustment", value: "adjustment" },
  { label: "Usage", value: "usage" },
];

const columns = [
  columnHelper.accessor("type", {
    cell: (info) => {
      const type = info.getValue();
      const getTypeColor = (t: string) => {
        switch (t.toLowerCase()) {
          case "purchase":
            return "bg-blue-500/20 text-blue-400 border-blue-500/30";
          case "topup":
            return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
          case "refund":
            return "bg-amber-500/20 text-amber-400 border-amber-500/30";
          case "adjustment":
            return "bg-purple-500/20 text-purple-400 border-purple-500/30";
          case "usage":
            return "bg-gray-500/20 text-gray-400 border-gray-500/30";
          default:
            return "bg-gray-500/20 text-gray-400 border-gray-500/30";
        }
      };
      return (
        <Badge className={`${getTypeColor(type)} border-0 text-white capitalize`}>
          {type}
        </Badge>
      );
    },
    header: "Type",
  }),
  columnHelper.accessor("description", {
    cell: (info) => (
      <span className="text-gray-400">{info.getValue() ?? "-"}</span>
    ),
    header: "Description",
  }),
  columnHelper.accessor("direction", {
    cell: (info) => {
      const direction = info.getValue();
      const isCredit = direction === "credit";
      return (
        <span className={isCredit ? "text-green-400" : "text-red-400"}>
          {isCredit ? "Credit" : "Debit"}
        </span>
      );
    },
    header: "Direction",
  }),
  columnHelper.accessor("amount", {
    cell: (info) => (
      <span className="font-medium text-white">
        {formatAmount(info.getValue() as unknown as string | number)}
      </span>
    ),
    header: "Amount",
  }),
  columnHelper.accessor("created_at", {
    cell: (info) => {
      const val = info.getValue();
      if (!val) return <span className="text-gray-400">-</span>;
      return (
        <span className="text-gray-400">
          {format(new Date(val), "MMM d, yyyy, hh:mm a")}
        </span>
      );
    },
    header: "Date",
  }),
];

function AccountCreditsInner() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Credits"
        description="View your credit history and transactions"
      />
      <DataTable
        columns={columns as ColumnDef<CreditListItem>[]}
        emptyStateMessage="No credit transactions found."
        pagination={true}
        resource="billing-credits"
        responsive={true}
        toolbar={{
          items: [
            {
              type: ToolbarItemType.FILTER_GROUP,
              id: "credits-filters",
              label: "Filters",
              dropdownStyle: true,
              items: [
                {
                  type: ToolbarItemType.FILTER,
                  id: "direction",
                  field: "direction",
                  label: "Direction",
                  config: {
                    id: "direction",
                    label: "Direction",
                    field: "direction",
                    type: FilterType.SELECT,
                    operator: FilterOperator.EQ,
                    options: directionOptions,
                    includeAllOption: true,
                  },
                },
                {
                  type: ToolbarItemType.FILTER,
                  id: "type",
                  field: "type",
                  label: "Type",
                  config: {
                    id: "type",
                    label: "Type",
                    field: "type",
                    type: FilterType.SELECT,
                    operator: FilterOperator.EQ,
                    options: typeOptions,
                    includeAllOption: true,
                  },
                },
              ],
            },
          ],
        }}
      />
    </div>
  );
}

function AccountCredits() {
  return (
    <Authenticated key="credits">
      <GeneralLayout>
        <AccountCreditsInner />
      </GeneralLayout>
    </Authenticated>
  );
}

export default withTheme(AccountCredits);
