import { jsxRuntimeExports } from './jsx-runtime-dlxeb5L7.js';
import { CaseStatus, CaseType, CasePriority, STATUS_BADGE_CONFIG, PRIORITY_BADGE_CONFIG } from './badge-configs-Dz2iTeCH.js';
import { RefineResource } from './index-C3iL_nDr.js';
import { core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__ } from './core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__-qcw4tOvU.js';
import { core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__-QzxGLbUR.js';
import { createColumnHelper } from './index-BHHcI-E1.js';
import { format } from './format-AJBx0DHd.js';

function CaseTable() {
  const columnHelper = createColumnHelper();
  const filterFields = [
    {
      field: "status",
      label: "Status",
      operators: ["eq", "ne"],
      options: Object.values(CaseStatus).map((status) => ({
        label: status.replace("_", " "),
        value: status
      })),
      priority: "high",
      type: "select"
    },
    {
      field: "type",
      label: "Type",
      options: Object.values(CaseType).map((type) => ({
        label: type.charAt(0).toUpperCase() + type.slice(1),
        value: type
      })),
      priority: "high",
      type: "select"
    },
    {
      field: "priority",
      label: "Priority",
      options: Object.values(CasePriority).map((priority) => ({
        label: priority.charAt(0).toUpperCase() + priority.slice(1),
        value: priority
      })),
      priority: "medium",
      type: "select"
    },
    {
      field: "needsReview",
      label: "Needs Review",
      priority: "medium",
      type: "boolean"
    },
    {
      field: "createdAt",
      label: "Created Date",
      operators: ["gte", "lte", "eq"],
      priority: "high",
      type: "date"
    }
  ];
  const columns = [
    columnHelper.accessor("id", {
      cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-[60px]", children: row.original.id }),
      header: "ID"
    }),
    columnHelper.accessor("reference_number", {
      cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__.Link,
        {
          className: "font-medium text-primary hover:underline",
          go: {
            to: {
              action: "show",
              id: row.original.id,
              resource: RefineResource.Case
            }
          },
          children: row.original.reference_number
        }
      ),
      header: "Reference"
    }),
    columnHelper.accessor("type", {
      cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "capitalize", children: row.original.type.replace("_", " ") }),
      header: "Type"
    }),
    columnHelper.accessor("status", {
      cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.ThemedBadge,
        {
          className: "capitalize",
          config: STATUS_BADGE_CONFIG,
          value: row.original.status
        }
      ),
      header: "Status"
    }),
    columnHelper.accessor("priority", {
      cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.ThemedBadge,
        {
          className: "capitalize",
          config: PRIORITY_BADGE_CONFIG,
          value: row.original.priority
        }
      ),
      header: "Priority"
    }),
    columnHelper.accessor("needs_review", {
      cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: row.original.needs_review ? "Yes" : "No" }),
      header: "Needs Review"
    }),
    columnHelper.accessor("created_at", {
      cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: format(new Date(row.original.created_at), "MMM d, yyyy") }),
      header: "Created At"
    })
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.CrudTable,
    {
      ariaLabel: "Case management table",
      columns,
      defaultSort: [{ desc: true, id: "createdAt" }],
      enableAdvancedFilters: true,
      enableExport: true,
      enableQuickFilters: true,
      errorComponent: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-destructive", children: "Error loading cases" }),
      exportOptions: {
        fileName: "cases-export",
        formats: ["csv"]
      },
      fields: filterFields,
      onError: (error) => console.error("Case table error:", error),
      persistState: true,
      resourceName: RefineResource.Case
    }
  );
}

function List() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto py-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold text-background", children: "Case Management" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Manage and view all cases in the system" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.TableContainer, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CaseTable, {}) }) })
  ] });
}

export { List as default };
