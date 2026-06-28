import {
  DataTable,
  formatFileSize,
  GeneralLayout,
  ToolbarConfig,
  ToolbarItemAlignment,
  useDialog,
} from "@lumeweb/portal-framework-ui";
import { format } from "date-fns";
import { lazyIcon } from "@lumeweb/portal-framework-ui-core";

import { createColumnHelper } from "@tanstack/react-table";
import { Authenticated, useDelete } from "@refinedev/core";

import { createUnpinDialogConfig } from "@/ui/dialogs";
import { PinItem } from "@/ui/components/toolbar";
import type { StreamResponse } from "@/client";
const Trash2 = lazyIcon("Trash2");


const columnHelper = createColumnHelper<StreamResponse>();

const columns = [
  columnHelper.accessor("sd_hash", {
    cell: (info) => (
      <span className="text-muted-foreground font-mono text-xs">
        {info.getValue()}
      </span>
    ),
    header: "SD Hash",
  }),
  columnHelper.accessor("suggested_file_name", {
    cell: (info) => (
      <span className="font-medium text-white">
        {info.getValue() || "Unnamed"}
      </span>
    ),
    header: "Name",
  }),
  columnHelper.accessor("created_at", {
    cell: (info) => (
      <span className="text-sm text-gray-400">
        {format(new Date(info.getValue()), "MMM d, yyyy h:mm a")}
      </span>
    ),
    header: "Created",
  }),
  columnHelper.accessor("size", {
    cell: (info) => {
      const size = info.getValue();
      return size != null ? formatFileSize(size) : "—";
    },
    header: "Size",
  }),
];

const toolbarConfig: ToolbarConfig<StreamResponse> = {
  defaultAlignment: ToolbarItemAlignment.RIGHT,
  justifyBetween: true,
  items: [PinItem()],
};

export default function StreamsPage() {
  const { openDialog } = useDialog();
  const { mutate: deletePin } = useDelete();

  return (
    <Authenticated key="lbry-streams">
      <GeneralLayout>
        <div className="space-y-6">
          <div className="flex-1 p-6">
            <div className="space-y-4">
              <div>
                <h1 className="text-foreground text-2xl font-semibold">
                  LBRY Streams
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage your LBRY streams
                </p>
              </div>

              {/* Streams Table */}
              <div className="bg-background border-border rounded-lg border">
                <DataTable
                  actionMenu={{
                    items: [
                      {
                        icon: <Trash2 className="mr-2 h-4 w-4" />,
                        label: "Unpin",
                        onClick: (row) => {
                          openDialog(
                            createUnpinDialogConfig(
                              row.sd_hash,
                              row.stream_name,
                              async (sdHash) => {
                                const displayName =
                                  row.stream_name || row.sd_hash;
                                await deletePin({
                                  id: sdHash,
                                  resource: "lbry/streams",
                                  successNotification: () => ({
                                    description: `The stream "${displayName}" has been unpinned.`,
                                    message: "Stream Unpinned",
                                    type: "success",
                                  }),
                                });
                              },
                              openDialog,
                            ),
                          );
                        },
                      },
                    ],
                  }}
                  columns={columns}
                  emptyStateMessage="No streams found. Pin your first stream to get started."
                  pagination={true}
                  resource="lbry/streams"
                  responsive={true}
                  toolbar={toolbarConfig}
                />
              </div>
            </div>
          </div>
        </div>
      </GeneralLayout>
    </Authenticated>
  );
}
