import { jsxRuntimeExports } from './jsx-runtime-dlxeb5L7.js';
import { core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__ } from './core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__-qcw4tOvU.js';
import { RefineResource } from './index-Bms_1MiW.js';
import { core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__-QzxGLbUR.js';
import { createColumnHelper } from './index-BHHcI-E1.js';
import { format } from './format-AJBx0DHd.js';

function List() {
  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("identifier", {
      header: "Identifier",
      cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__.Link,
        {
          go: {
            to: {
              action: "show",
              id: row.original.id,
              resource: RefineResource.Subject
            }
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: row.original.identifier })
        }
      )
    }),
    /*    columnHelper.accessor("type", {
      header: "Type",
      cell: ({ row }) => (
        <div className="capitalize">{row.original.type.replace("_", " ")}</div>
      ),
    }),*/
    columnHelper.accessor("created_at", {
      header: "First Seen",
      cell: ({ row }) => format(new Date(row.original.created_at), "MMM d, yyyy")
    })
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto py-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold text-background", children: "Subjects" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Manage and view all subjects in the system" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.CoreTable,
      {
        columns,
        resource: RefineResource.Subject,
        enableAdvancedFilters: true,
        enableColumnFilters: true,
        enableSorting: true
      }
    )
  ] });
}

export { List as default };
