import { j as jsxRuntimeExports } from "./index-D_nKaDFf.js";
import { s as AddIcon, Y as Progress } from "./general-layout-oTCHiDI9.js";
import { B as Button } from "./button-C80IS_oC.js";
const UsageCard = ({ label, monthlyUsage, currentUsage, icon, button }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 border border-border/30 bg-secondary/50 rounded-lg w-full ", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-foreground text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-x-2 text-lg font-bold text-foreground mb-2", children: [
          icon,
          label
        ] }),
        "Monthly ",
        label.toLocaleLowerCase(),
        " limit is ",
        monthlyUsage,
        " GB"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: " hidden lg:flex  mt-4 text-sm", children: !button ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "gap-x-2 h-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
        "Add More"
      ] }) : button })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { max: monthlyUsage, value: currentUsage }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-4 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground", children: [
        currentUsage,
        " GB used"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground", children: [
        monthlyUsage - currentUsage,
        " GB left"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: " flex lg:hidden items-center justify-end mt-4 text-sm", children: !button ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "gap-x-2 h-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
      "Add More"
    ] }) : button })
  ] });
};
export {
  UsageCard as U
};
