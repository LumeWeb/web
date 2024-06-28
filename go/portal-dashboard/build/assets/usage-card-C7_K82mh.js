import { r as reactExports, j as jsxRuntimeExports } from "./index-DVnsepjX.js";
import { T as $cddcb0b647441e34$export$be92b6f5f03c0fe9, U as $cddcb0b647441e34$export$3e431a229df88919, V as $cddcb0b647441e34$export$fb8d7f40caaeea67, A as AddIcon, W as Progress } from "./general-layout-G1oBOHXP.js";
import { c as cn } from "./utils-DrdLlttq.js";
import { B as Button } from "./button-hVCKfBoZ.js";
const Avatar = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  $cddcb0b647441e34$export$be92b6f5f03c0fe9,
  {
    ref,
    className: cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    ),
    ...props
  }
));
Avatar.displayName = $cddcb0b647441e34$export$be92b6f5f03c0fe9.displayName;
const AvatarImage = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  $cddcb0b647441e34$export$3e431a229df88919,
  {
    ref,
    className: cn("aspect-square h-full w-full", className),
    ...props
  }
));
AvatarImage.displayName = $cddcb0b647441e34$export$3e431a229df88919.displayName;
const AvatarFallback = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  $cddcb0b647441e34$export$fb8d7f40caaeea67,
  {
    ref,
    className: cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    ),
    ...props
  }
));
AvatarFallback.displayName = $cddcb0b647441e34$export$fb8d7f40caaeea67.displayName;
const UsageCard = ({ label, monthlyUsage, currentUsage, icon, button }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 border rounded-lg w-full", children: [
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
      !button ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "gap-x-2 h-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
        "Add More"
      ] }) : button
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
    ] })
  ] });
};
export {
  Avatar as A,
  UsageCard as U
};
