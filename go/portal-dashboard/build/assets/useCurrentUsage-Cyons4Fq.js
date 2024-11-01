import { r as reactExports, j as jsxRuntimeExports } from "./jsx-runtime-IZdvEyt_.js";
import { A as AddIcon } from "./icons-DXepPAEW.js";
import { b as cn, B as Button } from "./button-CxRLgqWQ.js";
import { P as Progress, I as Indicator, f as filesize } from "./progress-CxS0Yg7S.js";
import { b as useIsPaidBillingEnabled, a as useApiUrl } from "./useSubscription-C-dlgiPr.js";
import { L as Link } from "./components-XyVy0HiW.js";
import { a as ii } from "./index-C-G3KncW.js";
const IndeterminateProgress = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { ref, className: cn("indeterminate", className), ...props, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  Indicator,
  {
    className: "h-full w-full flex-1 bg-primary bg-striped-indeterminate",
    style: { transform: "translateX(-75%)" }
  }
) }));
IndeterminateProgress.displayName = "IndeterminateProgress";
const UsageCard = ({
  label,
  maxUsage,
  currentUsage,
  icon,
  button
}) => {
  const limitEnabled = maxUsage > -1;
  const paidBillingEnabled = useIsPaidBillingEnabled();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 border border-border/30 bg-secondary/50 rounded-lg w-full ", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-foreground text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-x-2 text-lg font-bold text-foreground mb-2", children: [
          icon,
          label
        ] }),
        limitEnabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-foreground/60", children: [
          "Monthly ",
          label.toLocaleLowerCase(),
          " limit is ",
          filesize(maxUsage)
        ] })
      ] }),
      limitEnabled && paidBillingEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: " hidden lg:flex  mt-4 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/account/subscription", children: !button ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "gap-x-2 h-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
        "Add More"
      ] }) : button }) })
    ] }),
    limitEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { max: maxUsage, value: currentUsage }),
    !limitEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx(IndeterminateProgress, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-4 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground", children: [
        filesize(currentUsage),
        " used"
      ] }),
      limitEnabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground", children: [
        filesize(maxUsage - currentUsage),
        " left"
      ] })
    ] }),
    limitEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: " flex lg:hidden items-center justify-end mt-4 text-sm", children: !button ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "gap-x-2 h-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
      "Add More"
    ] }) : button })
  ] });
};
function useCurrentUsage() {
  const apiUrl = useApiUrl();
  const { data, isLoading, isError, error } = ii({
    url: `${apiUrl}/api/account/usage/current`,
    method: "get",
    queryOptions: {
      retry: (failureCount, error2) => {
        if ((error2 == null ? void 0 : error2.statusCode) === 404) {
          return false;
        }
        return failureCount < 3;
      }
    }
  });
  if ((error == null ? void 0 : error.statusCode) === 404) {
    return {
      upload: 0,
      download: 0,
      storage: 0,
      isLoading: false,
      isError: true
    };
  }
  return {
    upload: data == null ? void 0 : data.data.upload,
    download: data == null ? void 0 : data.data.download,
    storage: data == null ? void 0 : data.data.storage,
    isLoading,
    isError
  };
}
export {
  UsageCard as U,
  useCurrentUsage as u
};
