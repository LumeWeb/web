import { jsxRuntimeExports } from './jsx-runtime-dlxeb5L7.js';
import { RelatedCasesPanel } from './RelatedCasesPanel-Y4FSNVaX.js';
import { core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ } from './core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__-CZ-6RiII.js';
import { User } from './user-S2yq91K-.js';
import { Mail } from './mail-C-nC00Av.js';
import { Clock } from './clock-DbY6-WNS.js';
import { format } from './format-AJBx0DHd.js';
import { core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__-QzxGLbUR.js';
import { RefineResource } from './index-C3iL_nDr.js';
import { ArrowLeft, SquarePen } from './square-pen-Bs3GwhB_.js';

function ReporterInfoCard({ reporter }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.CardTitle, { className: "text-base font-medium flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4 text-muted-foreground" }),
      "Reporter Information"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: reporter.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Badge,
            {
              className: "capitalize",
              variant: reporter.verificationStatus === "verified" ? "success" : reporter.verificationStatus === "pending" ? "warning" : "destructive",
              children: reporter.verificationStatus
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3.5 w-3.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: reporter.email })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "User ID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: reporter.userId })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Registration Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3 text-muted-foreground" }),
            format(new Date(reporter.created_at), "MMM d, yyyy")
          ] })
        ] })
      ] }),
      reporter.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: reporter.notes })
      ] })
    ] })
  ] });
}

function CaseView() {
  const params = core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useParsed();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ReporterViewContent, { id: params.id });
}
function ReporterViewContent({ id }) {
  const { queryResult } = core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useShow({
    id,
    resource: RefineResource.Reporter
  });
  const { goBack } = core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useNavigation();
  const { data, isLoading } = queryResult;
  const record = data?.data;
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container mx-auto py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex animate-pulse flex-col gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-1/4 rounded bg-gray-200 dark:bg-gray-700" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-64 rounded bg-gray-200 dark:bg-gray-700" })
    ] }) });
  }
  if (!record) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container mx-auto py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-card p-6 text-center shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: "Reporter not found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: "The reporter you are looking for does not exist or has been removed." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, { className: "mt-4", onClick: () => goBack(), children: "Go Back" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto py-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button,
          {
            className: "h-9 w-9",
            onClick: () => goBack(),
            size: "icon",
            variant: "outline",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold text-background", children: record.name })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, { className: "flex items-center gap-1", variant: "outline", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "h-4 w-4" }),
        "Edit"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReporterInfoCard, { reporter: record }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RelatedCasesPanel, { entityId: record.id, entityType: "reporter" }) })
    ] })
  ] });
}

export { CaseView as default };
