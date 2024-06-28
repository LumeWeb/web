import { r as reactExports, j as jsxRuntimeExports } from "./index-D_nKaDFf.js";
import { U as Root, V as Image, W as Fallback, r as AddIcon, X as Progress } from "./general-layout-jof5o2lh.js";
import { c as cn } from "./utils-Cugm_gHJ.js";
import { B as Button } from "./button-DkhPxfS-.js";
const Avatar = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Root,
  {
    ref,
    className: cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    ),
    ...props
  }
));
Avatar.displayName = Root.displayName;
const AvatarImage = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Image,
  {
    ref,
    className: cn("aspect-square h-full w-full", className),
    ...props
  }
));
AvatarImage.displayName = Image.displayName;
const AvatarFallback = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Fallback,
  {
    ref,
    className: cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    ),
    ...props
  }
));
AvatarFallback.displayName = Fallback.displayName;
const UsageCard = ({ label, monthlyUsage, currentUsage, icon, button }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 border rounded-lg w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-primary-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-x-2 text-lg font-bold text-white mb-2", children: [
          icon,
          label
        ] }),
        "Montly ",
        label.toLocaleLowerCase(),
        " limit is ",
        monthlyUsage,
        " GB"
      ] }),
      !button ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "gap-x-2 h-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
        "Add More"
      ] }) : button
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { max: monthlyUsage, value: currentUsage }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-4 font-semibold text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary-2", children: [
        currentUsage,
        " GB used"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-white", children: [
        monthlyUsage - currentUsage,
        " GB left"
      ] })
    ] })
  ] });
};
export {
  Avatar as A,
  UsageCard as U
};
