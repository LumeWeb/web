import { jsxRuntimeExports } from './jsx-runtime-dlxeb5L7.js';
import { RefineResource } from './index-Bms_1MiW.js';
import { core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__ } from './core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__-qcw4tOvU.js';
import { core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__-QzxGLbUR.js';
import { createColumnHelper } from './index-BHHcI-E1.js';
import { format } from './format-AJBx0DHd.js';

function List() {
  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: ({ row }) => {
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__.Link,
          {
            go: {
              to: {
                action: "show",
                id: row.original.id,
                resource: RefineResource.Reporter
              }
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: row.original.name })
          }
        );
      }
    }),
    columnHelper.accessor("email", {
      header: "Email",
      cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__.Link,
        {
          go: {
            to: {
              action: "show",
              id: row.original.id,
              resource: RefineResource.Reporter
            }
          },
          children: row.original.email
        }
      )
    }),
    /*    columnHelper.accessor("user_type", {
      header: "User Type",
      cell: ({ row }) => (
        <div className="capitalize">
          {row.original.user_type.replace("_", " ")}
        </div>
      ),
    }),*/
    columnHelper.accessor("created_at", {
      header: "Registration Date",
      cell: ({ row }) => format(new Date(row.original.created_at), "MMM d, yyyy")
    }),
    /*    columnHelper.accessor("verification_status", {
      header: "Verification",
      cell: ({ row }) => (
        <ThemedBadge
          className="capitalize"
          config={VERIFICATION_BADGE_CONFIG}
          value={row.original.verification_status}
        />
      ),
    }),*/
    /*    columnHelper.accessor("trust_score", {
      header: "Trust Score",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <ProgressBar value={row.original.trust_score} />
        </div>
      ),
    }),*/
    columnHelper.accessor("total_reported_cases", {
      header: "Cases"
    })
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto py-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold text-background", children: "Reporters" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Manage and view all reporters in the system" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.CoreTable,
      {
        columns,
        resource: RefineResource.Reporter,
        enableAdvancedFilters: true,
        enableColumnFilters: true,
        enableSorting: true
      }
    )
  ] });
}

export { List as default };
