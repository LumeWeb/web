import { jsxRuntimeExports } from './jsx-runtime-dlxeb5L7.js';
import { STATUS_BADGE_CONFIG, PRIORITY_BADGE_CONFIG } from './badge-configs-B5Ptjltb.js';
import { core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__ } from './core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__-qcw4tOvU.js';
import { core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ } from './core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__-CZ-6RiII.js';
import { core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__-QzxGLbUR.js';
import { core_abuse__loadShare__react__loadShare__ } from './core_abuse__loadShare__react__loadShare__-BrHXNZXB.js';
import { RefineResource } from './index-Bms_1MiW.js';
import { FileText } from './file-text-lxKDeUfn.js';
import { createLucideIcon } from './createLucideIcon-Bv-P5XEu.js';
import { ChevronLeft, ChevronRight } from './chevron-right-CUiuyDQp.js';
import { format } from './format-AJBx0DHd.js';

/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]
];
const ExternalLink = createLucideIcon("external-link", __iconNode);

function RelatedCasesPanel({
  entityId,
  entityType
}) {
  const [currentPage, setCurrentPage] = core_abuse__loadShare__react__loadShare__.useState(1);
  const pageSize = 5;
  const resource = entityType === RefineResource.Reporter ? RefineResource.ReporterCase : RefineResource.SubjectCase;
  const { data, isLoading } = core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useList({
    filters: [
      {
        field: `${entityType}Id`,
        operator: "eq",
        value: entityId
      }
    ],
    pagination: {
      current: currentPage,
      pageSize
    },
    resource
  });
  const cases = data?.data || [];
  const total = data?.total || 0;
  const pageCount = Math.ceil(total / pageSize);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.CardTitle, { className: "text-base font-medium flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-muted-foreground" }),
      "Related Cases"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.CardContent, { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: Array.from({ length: 3 }).map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "h-10 bg-muted/50 rounded animate-pulse"
      },
      index
    )) }) : cases.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-6 text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No related cases found." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableHead, { children: "Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableHead, { children: "Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableHead, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableHead, { children: "Priority" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableHead, { children: "Created" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableHead, { className: "w-[50px]" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableBody, { children: cases.map((caseItem) => /* @__PURE__ */ jsxRuntimeExports.jsxs(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableCell, { className: "font-medium", children: caseItem.referenceNumber }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableCell, { className: "capitalize", children: caseItem.type.replace("_", " ") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.ComplexBadge,
            {
              className: "capitalize",
              config: STATUS_BADGE_CONFIG,
              value: caseItem.status
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.ComplexBadge,
            {
              className: "capitalize",
              config: PRIORITY_BADGE_CONFIG,
              value: caseItem.priority
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableCell, { children: format(new Date(caseItem.createdAt), "MMM d, yyyy") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, { asChild: true, size: "icon", variant: "ghost", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__.Link,
            {
              go: {
                to: {
                  action: "show",
                  id: caseItem.id,
                  resource: RefineResource.Case
                }
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "View case" })
              ]
            }
          ) }) })
        ] }, caseItem.id)) })
      ] }),
      pageCount > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          "Showing ",
          (currentPage - 1) * pageSize + 1,
          "-",
          Math.min(currentPage * pageSize, total),
          " of ",
          total
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button,
            {
              disabled: currentPage === 1,
              onClick: () => setCurrentPage((prev) => Math.max(prev - 1, 1)),
              size: "icon",
              variant: "outline",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button,
            {
              disabled: currentPage === pageCount,
              onClick: () => setCurrentPage((prev) => Math.min(prev + 1, pageCount)),
              size: "icon",
              variant: "outline",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
            }
          )
        ] })
      ] })
    ] }) })
  ] });
}

export { RelatedCasesPanel };
