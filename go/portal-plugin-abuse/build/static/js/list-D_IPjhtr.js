import { jsxRuntimeExports } from './jsx-runtime-dlxeb5L7.js';
import { BlockSource, BlockSeverity, BlockReason, BlockAction, REASON_BADGE_CONFIG, SEVERITY_BADGE_CONFIG, ACTION_BADGE_CONFIG, SOURCE_BADGE_CONFIG } from './badge-configs-BNOpu3VO.js';
import { RefineResource } from './index-C3iL_nDr.js';
import { File, formatFileSize } from './util-B4AIY5au.js';
import { core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__ } from './core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__-qcw4tOvU.js';
import { core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__-QzxGLbUR.js';
import { z } from './index-DESmQ-Cl.js';
import { core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ } from './core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__-CZ-6RiII.js';
import { createLucideIcon } from './createLucideIcon-Bv-P5XEu.js';
import { format } from './format-AJBx0DHd.js';
import { Eye, Trash2 } from './trash-2-DUO5TTSl.js';
import { createColumnHelper } from './index-BHHcI-E1.js';
import { Plus } from './plus-BPHmrKQ_.js';

/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode = [
  ["path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71", key: "1cjeqo" }],
  ["path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71", key: "19qd67" }]
];
const Link = createLucideIcon("link", __iconNode);

const AddBlockConfig = {
  formDefaults: {
    action: BlockAction.Reject,
    description: "",
    fileName: "",
    hash: "",
    mimeType: "",
    reason: BlockReason.Manual,
    severity: BlockSeverity.Medium,
    size: 0,
    source: BlockSource.Admin
  },
  formLayout: {
    action: {
      className: "col-span-1",
      label: "Action",
      options: Object.values(BlockAction),
      required: true,
      type: "select"
    },
    caseId: {
      className: "col-span-1",
      inputType: "number",
      label: "Case ID",
      placeholder: "Optional case reference",
      type: "input"
    },
    description: {
      className: "col-span-2",
      label: "Description",
      placeholder: "Block reason details",
      required: true,
      type: "textarea"
    },
    expiresAt: {
      className: "col-span-2",
      label: "Expiration Date",
      placeholder: "Select expiration date",
      type: "date"
    },
    fileName: {
      className: "col-span-2",
      label: "File Name",
      placeholder: "Original file name",
      required: true,
      type: "input"
    },
    hash: {
      className: "col-span-2",
      inputType: "text",
      label: "Hash",
      placeholder: "Content hash",
      required: true,
      type: "input"
    },
    mimeType: {
      className: "col-span-2",
      label: "MIME Type",
      placeholder: "e.g. image/jpeg",
      required: true,
      type: "input"
    },
    reason: {
      className: "col-span-1",
      label: "Reason",
      options: Object.values(BlockReason),
      required: true,
      type: "select"
    },
    severity: {
      className: "col-span-1",
      label: "Severity",
      options: Object.values(BlockSeverity),
      required: true,
      type: "select"
    },
    size: {
      className: "col-span-2",
      inputType: "number",
      label: "Size (bytes)",
      placeholder: "File size in bytes",
      required: true,
      type: "input"
    },
    source: {
      className: "col-span-1",
      label: "Source",
      options: Object.values(BlockSource),
      required: true,
      type: "select"
    },
    uploaderId: {
      className: "col-span-1",
      inputType: "number",
      label: "Uploader ID",
      placeholder: "Optional uploader ID",
      type: "input"
    }
  },
  formSchema: z.object({
    action: z.nativeEnum(BlockAction),
    caseId: z.number().optional(),
    description: z.string().min(1, "Description is required"),
    expiresAt: z.string().optional(),
    fileName: z.string().min(1, "File name is required"),
    hash: z.string().min(1, "Hash is required"),
    mimeType: z.string().min(1, "MIME type is required"),
    reason: z.nativeEnum(BlockReason),
    severity: z.nativeEnum(BlockSeverity),
    size: z.number().min(1, "File size is required"),
    source: z.nativeEnum(BlockSource),
    uploaderId: z.number().optional()
  }),
  refineCoreProps: {
    errorNotification: (error) => ({
      description: error.message,
      message: "Error adding block",
      type: "error"
    }),
    meta: {
      // Any additional API metadata if needed
    },
    successNotification: (data, values) => ({
      description: `${values.fileName} has been added to the blocklist`,
      message: "Block added successfully",
      type: "success"
    })
  },
  resource: RefineResource.Blocklist,
  title: "Add Content to Blocklist",
  type: "form"
};

function BlockDetailsContent({ block }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-muted p-4 rounded-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(File, { className: "h-12 w-12 text-muted-foreground" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-lg mb-1", children: block.fileName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: block.mimeType }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: formatFileSize(block.size) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-medium mb-1", children: "Hash" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-mono break-all", children: block.hash })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-medium mb-1", children: "Created At" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: format(new Date(block.createdAt), "PPP p") })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-medium mb-1", children: "Reason" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.ComplexBadge, { config: REASON_BADGE_CONFIG, value: block.reason })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-medium mb-1", children: "Severity" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.ComplexBadge, { config: SEVERITY_BADGE_CONFIG, value: block.severity })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-medium mb-1", children: "Action" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.ComplexBadge, { config: ACTION_BADGE_CONFIG, value: block.action })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-medium mb-1", children: "Source" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.ComplexBadge, { config: SOURCE_BADGE_CONFIG, value: block.source })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-medium mb-1", children: "Description" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm whitespace-pre-line", children: block.description })
    ] }),
    block.caseId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-medium mb-1", children: "Related Case" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, { asChild: true, size: "sm", variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__.Link,
        {
          className: "flex items-center gap-1",
          go: {
            to: {
              action: "show",
              resource: RefineResource.Blocklist
            }
          },
          to: `/cases/${block.caseId}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "h-3.5 w-3.5" }),
            "View Case #",
            block.caseId
          ]
        }
      ) })
    ] }),
    block.uploaderId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-medium mb-1", children: "Uploader ID" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: block.uploaderId })
    ] }),
    block.expiresAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-medium mb-1", children: "Expires At" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: format(new Date(block.expiresAt), "PPP p") })
    ] }),
    block.reviewedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-medium mb-1", children: "Reviewed At" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: format(new Date(block.reviewedAt), "PPP p") })
    ] }),
    block.metadata && Object.keys(block.metadata).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-medium mb-1", children: "Metadata" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "text-xs bg-muted p-2 rounded-md overflow-auto max-h-[200px]", children: JSON.stringify(block.metadata, null, 2) })
    ] })
  ] });
}

function BlocklistTable() {
  const { openDialog } = core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.useDialog();
  const { open: openNotification } = core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useNotification();
  const { mutate: deleteMany } = core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useDeleteMany();
  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("fileName", {
      cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-[200px] truncate font-medium", children: row.original.fileName }),
      header: "File Name"
    }),
    columnHelper.accessor("hash", {
      cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-[120px] truncate font-mono text-xs", children: row.original.hash }),
      header: "Hash"
    }),
    columnHelper.accessor("mimeType", {
      cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-xs", children: row.original.mimeType }),
      header: "MIME Type"
    }),
    columnHelper.accessor("reason", {
      cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.ComplexBadge,
        {
          config: REASON_BADGE_CONFIG,
          value: row.original.reason
        }
      ),
      header: "Reason"
    }),
    columnHelper.accessor("severity", {
      cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.ComplexBadge,
        {
          config: SEVERITY_BADGE_CONFIG,
          value: row.original.severity
        }
      ),
      header: "Severity"
    }),
    columnHelper.accessor("action", {
      cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.ComplexBadge,
        {
          config: ACTION_BADGE_CONFIG,
          value: row.original.action
        }
      ),
      header: "Action"
    }),
    columnHelper.accessor("source", {
      cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.ComplexBadge,
        {
          config: SOURCE_BADGE_CONFIG,
          value: row.original.source
        }
      ),
      header: "Source"
    }),
    columnHelper.accessor("size", {
      cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: formatFileSize(row.original.size) }),
      header: "Size"
    }),
    columnHelper.accessor("createdAt", {
      cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: format(new Date(row.original.createdAt), "MMM d, yyyy") }),
      header: "Created At"
    })
  ];
  const handleBulkDelete = async (selectedRows) => {
    const selectedIds = selectedRows.map((row) => row.id);
    deleteMany(
      {
        ids: selectedIds,
        resource: RefineResource.Blocklist
      },
      {
        onError: () => {
          openNotification({
            description: "There was an error removing the content from the blocklist.",
            message: "Delete failed",
            type: "error"
          });
        },
        onSuccess: () => {
          openNotification({
            description: `${selectedIds.length} items have been successfully removed from the blocklist.`,
            message: "Blocks deleted",
            type: "success"
          });
        }
      }
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.CrudTable,
    {
      addButtonProps: {
        label: "Add to Blocklist",
        onClick: () => openDialog({
          ...AddBlockConfig
        })
      },
      ariaLabel: "Blocklist table",
      bulkActions: [
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
          label: "Delete",
          onClick: handleBulkDelete,
          render: (label, count) => /* @__PURE__ */ jsxRuntimeExports.jsxs(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Button, { className: "h-8", size: "sm", variant: "destructive", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 mr-1" }),
            label,
            " (",
            count,
            ")"
          ] })
        }
      ],
      columns,
      defaultSort: [{ desc: true, id: "createdAt" }],
      enableAdvancedFilters: true,
      enableExport: true,
      enableRowSelection: true,
      resourceName: RefineResource.Blocklist,
      rowActions: [
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }),
          label: "View Details",
          onClick: (row) => {
            openDialog({
              content: /* @__PURE__ */ jsxRuntimeExports.jsx(BlockDetailsContent, { block: row.original }),
              size: "lg",
              title: "Block Details",
              type: "custom"
            });
            return false;
          }
        },
        {
          destructive: true,
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }),
          label: "Delete",
          onClick: (row) => handleBulkDelete([row.original])
        }
      ]
    }
  ) });
}

function List() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto py-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold text-background", children: "Content Blocklist" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Manage blocked content across the platform" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button,
        {
          className: "flex items-center gap-1",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
            "Add Block"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border bg-card p-6 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BlocklistTable, {}) })
  ] });
}

export { List as default };
