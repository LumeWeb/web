import { jsxRuntimeExports } from './jsx-runtime-dlxeb5L7.js';
import { RefineResource } from './index-Bms_1MiW.js';
import { RelatedCasesPanel } from './RelatedCasesPanel-CfuZLRYW.js';
import { core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ } from './core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__-CZ-6RiII.js';
import { Link2 } from './link-2-DBKrVJU1.js';
import { core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__-QzxGLbUR.js';
import { ArrowLeft, SquarePen } from './square-pen-Bs3GwhB_.js';

function SubjectInfoCard({ subject }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.CardTitle, { className: "text-base font-medium flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "h-4 w-4 text-muted-foreground" }),
      "Subject Information"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: subject.identifier }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: subject.type?.replace("_", " ") }) })
      ] }),
      subject.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: subject.notes })
      ] })
    ] })
  ] });
}

function View() {
  const params = core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useParsed();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Subject, { id: params.id });
}
function Subject({ id }) {
  const { queryResult } = core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useShow({
    id
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: "Subject not found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: "The subject you are looking for does not exist or has been removed." }),
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
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold text-background", children: record.identifier })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, { className: "flex items-center gap-1", variant: "outline", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "h-4 w-4" }),
        "Edit"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SubjectInfoCard, { subject: record }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        RelatedCasesPanel,
        {
          entityId: record.id,
          entityType: RefineResource.Subject
        }
      ) })
    ] })
  ] });
}

export { View as default };
