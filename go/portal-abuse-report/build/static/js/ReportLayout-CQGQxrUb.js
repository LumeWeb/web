import { jsxRuntimeExports } from './jsx-runtime-BpMlpgXU.js';
import { ReportButton } from './ReportButton-BVtGmXUI.js';
import { core_abuse_mf_2_report__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__ } from './core_abuse_mf_2_report__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__-CRXefMZb.js';
import { core_abuse_mf_2_report__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_abuse_mf_2_report__loadShare___mf_0_refinedev_mf_1_core__loadShare__-D5_BW_kK.js';
import { core_abuse_mf_2_report__loadShare__react_mf_2_router__loadShare__ } from './core_abuse_mf_2_report__loadShare__react_mf_2_router__loadShare__-BlY5pJPl.js';

function Footer() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "border-t border-border py-8 mt-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container flex flex-col md:flex-row items-center justify-between gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm tracking-wide text-foreground", children: "© 2024 abuse.webapp. All rights reserved" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-6 text-sm tracking-wide text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { className: "hover:text-primary transition-colors", href: "#", children: "Terms of Use" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { className: "hover:text-primary transition-colors", href: "#", children: "Privacy Policy" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { className: "hover:text-primary transition-colors", href: "#", children: "DMCA Notice" })
    ] })
  ] }) });
}

function FlagIcon(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      fill: "none",
      height: "17",
      viewBox: "0 0 17 17",
      width: "17",
      xmlns: "http://www.w3.org/2000/svg",
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { clipPath: "url(#clip0_flag)", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "path",
            {
              d: "M16.66 1.36V9.86C16.66 9.86 14.8672 10.88 12.58 10.88C8.52414 10.88 7.18454 9.52 4.42 9.52C1.65546 9.52 0.34 10.2 0.34 10.2V1.02C0.34 1.02 1.0489 0.34 4.42 0.34C7.7911 0.34 9.19598 2.38 12.58 2.38C14.7155 2.38 16.3642 1.52014 16.66 1.36Z",
              stroke: "currentColor",
              strokeLinecap: "round",
              strokeMiterlimit: "10",
              strokeWidth: "2"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "path",
            {
              d: "M0.34 1.02V16.66",
              stroke: "currentColor",
              strokeLinecap: "round",
              strokeMiterlimit: "10",
              strokeWidth: "2"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("clipPath", { id: "clip0_flag", children: /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { fill: "white", height: "17", width: "17" }) }) })
      ]
    }
  );
}

function Header({ rightContent }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "border-b border-border py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container flex items-center justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      core_abuse_mf_2_report__loadShare__react_mf_2_router__loadShare__.Link,
      {
        to: {
          pathname: "/"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FlagIcon, { className: "h-6 w-6 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-semibold text-foreground", children: "abuse" })
        ] })
      }
    ),
    rightContent
  ] }) });
}

function _ReportLayout() {
  const go = core_abuse_mf_2_report__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useGo();
  const handleReportClick = () => {
    go({ to: "/report" });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Header,
      {
        rightContent: /* @__PURE__ */ jsxRuntimeExports.jsx(
          core_abuse_mf_2_report__loadShare__react_mf_2_router__loadShare__.Link,
          {
            to: {
              pathname: "/report"
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              ReportButton,
              {
                className: "h-12 py-0 text-base",
                onClick: handleReportClick,
                children: "Report an abuse"
              }
            )
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse_mf_2_report__loadShare__react_mf_2_router__loadShare__.Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
}
const ReportLayout = core_abuse_mf_2_report__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.withTheme(_ReportLayout);

export { ReportLayout };
