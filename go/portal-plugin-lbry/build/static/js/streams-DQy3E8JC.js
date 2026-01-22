import { createLucideIcon, core_lbry__loadShare__react__loadShare__, jsxRuntimeExports } from './createLucideIcon-BXTHeo5K.js';
import { core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__, core_lbry__loadShare___mf_0_refinedev_mf_1_core__loadShare__, core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__, createPinDialogConfig, createColumnHelper, Trash2, format } from './updateDevice.schema-tg5433Ro.js';
import { DATA_PROVIDER_NAME } from './refineConfig-CJpDC7Fp.js';

/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode = [
  ["path", { d: "M12 17v5", key: "bb1du9" }],
  [
    "path",
    {
      d: "M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z",
      key: "1nkz8b"
    }
  ]
];
const Pin = createLucideIcon("pin", __iconNode);

function createUnpinDialogConfig(sdHash, streamName, onUnpin, open) {
  const displayName = streamName || sdHash;
  return {
    type: core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogTypes.CONFIRM,
    title: "Unpin Stream",
    description: `Are you sure you want to unpin "${displayName}"? This action cannot be undone.`,
    confirmText: "Unpin",
    cancelText: "Cancel",
    onConfirm: async () => {
      try {
        await onUnpin(sdHash);
      } catch (error) {
        open?.({
          type: "error",
          message: "Failed to Unpin Stream",
          description: "An error occurred while unpinning the stream"
        });
        throw error;
      }
    },
    variant: "destructive",
    size: core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.ComponentSize.MD
  };
}

function useLbryPinning() {
  const { mutateAsync: customMutate, mutation } = core_lbry__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useCustomMutation();
  const { open } = core_lbry__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useNotification();
  const isMutating = mutation.isPending;
  const pinStreams = core_lbry__loadShare__react__loadShare__.useCallback(
    async (sdHashes) => {
      if (sdHashes.length === 0) {
        open?.({
          type: "error",
          message: "No Streams to Pin",
          description: "Please provide at least one SD hash to pin."
        });
        return;
      }
      try {
        const success = [];
        const failed = [];
        if (sdHashes.length > 1) {
          open?.({
            type: "progress",
            message: "Pinning Streams",
            description: `Processing ${sdHashes.length} stream(s)...`
          });
        }
        for (const sdHash of sdHashes) {
          try {
            await customMutate({
              url: "pin",
              method: "post",
              values: { sd_hash: sdHash },
              meta: {
                resource: "streams"
              },
              dataProviderName: DATA_PROVIDER_NAME,
              successNotification: false,
              errorNotification: false
            });
            success.push(sdHash);
            if (sdHashes.length === 1) {
              open?.({
                type: "success",
                message: "Stream Pinned",
                description: `Stream ${sdHash.slice(0, 8)}...${sdHash.slice(-8)} has been pinned.`
              });
            }
          } catch (error) {
            failed.push(sdHash);
          }
        }
        if (sdHashes.length > 1) {
          const failedList = failed.map((h) => `${h.slice(0, 8)}...${h.slice(-8)}`).join(", ");
          open?.({
            type: failed.length === 0 ? "success" : "error",
            message: failed.length === 0 ? "All Streams Pinned" : "Pinning Partially Complete",
            description: failed.length === 0 ? `Successfully pinned ${success.length} streams.` : `Successfully pinned ${success.length} of ${sdHashes.length} streams. Failed: ${failedList}`
          });
        }
      } catch (error) {
        if (sdHashes.length === 1) {
          open?.({
            type: "error",
            message: "Pinning Failed",
            description: "An error occurred while pinning the stream."
          });
        }
      }
    },
    [customMutate, open]
  );
  return {
    pinStreams,
    isMutating
  };
}

function PinItem() {
  return {
    id: "add-pin",
    type: core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.ToolbarItemType.CUSTOM,
    component: () => {
      const { openDialog } = core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.useDialog();
      const { open } = core_lbry__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useNotification();
      const { pinStreams, isMutating } = useLbryPinning();
      const handleClick = () => {
        const dialogConfig = createPinDialogConfig(
          async (sdHashes) => {
            await pinStreams(sdHashes);
          },
          open
        );
        openDialog(dialogConfig);
      };
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button,
        {
          onClick: handleClick,
          title: "Add new stream pins to LBRY",
          size: "sm",
          variant: "outline",
          disabled: isMutating,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pin, { className: "mr-2 h-4 w-4" }),
            "Add Pin"
          ]
        }
      );
    }
  };
}

const columnHelper = createColumnHelper();
const columns = [
  columnHelper.accessor("sd_hash", {
    cell: (info) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-mono text-xs", children: info.getValue() }),
    header: "SD Hash"
  }),
  columnHelper.accessor("suggested_file_name", {
    cell: (info) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-white", children: info.getValue() || "Unnamed" }),
    header: "Name"
  }),
  columnHelper.accessor("created_at", {
    cell: (info) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-400", children: format(new Date(info.getValue()), "MMM d, yyyy h:mm a") }),
    header: "Created"
  }),
  columnHelper.accessor("size", {
    cell: (info) => {
      const size = info.getValue();
      return size != null ? core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.formatFileSize(size) : "—";
    },
    header: "Size"
  })
];
const toolbarConfig = {
  defaultAlignment: core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.ToolbarItemAlignment.RIGHT,
  justifyBetween: true,
  items: [PinItem()]
};
function StreamsPage() {
  const { openDialog } = core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.useDialog();
  const { mutate: deletePin } = core_lbry__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useDelete();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(core_lbry__loadShare___mf_0_refinedev_mf_1_core__loadShare__.Authenticated, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.GeneralLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-foreground text-2xl font-semibold", children: "LBRY Streams" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: "Manage your LBRY streams" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-background border-border rounded-lg border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DataTable,
      {
        actionMenu: {
          items: [
            {
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "mr-2 h-4 w-4" }),
              label: "Unpin",
              onClick: (row) => {
                openDialog(
                  createUnpinDialogConfig(
                    row.sd_hash,
                    row.stream_name,
                    async (sdHash) => {
                      const displayName = row.stream_name || row.sd_hash;
                      await deletePin({
                        id: sdHash,
                        resource: "lbry/streams",
                        successNotification: () => ({
                          description: `The stream "${displayName}" has been unpinned.`,
                          message: "Stream Unpinned",
                          type: "success"
                        })
                      });
                    },
                    openDialog
                  )
                );
              }
            }
          ]
        },
        columns,
        emptyStateMessage: "No streams found. Pin your first stream to get started.",
        pagination: true,
        resource: "lbry/streams",
        responsive: true,
        toolbar: toolbarConfig
      }
    ) })
  ] }) }) }) }) }, "lbry-streams");
}

export { StreamsPage as default };
