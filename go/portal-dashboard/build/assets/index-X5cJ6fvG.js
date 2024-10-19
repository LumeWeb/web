import { r as reactExports, j as jsxRuntimeExports } from "./jsx-runtime-IZdvEyt_.js";
import { m as mc } from "./index-DU1IfKY5.js";
import { G as GeneralLayout } from "./GeneralLayout-DFAD2LNJ.js";
import { d as getServiceIds, c as getServiceById } from "./index-7xjrsmwg.js";
import { c as createContextScope, u as useControllableState, b as composeEventHandlers, P as Presence } from "./index-C-2rzX6a.js";
import { q as createRovingFocusGroupScope, R as Root, I as Item } from "./useTheme-Wun3lQOi.js";
import { P as Primitive } from "./index-DiXcXsr5.js";
import { u as useDirection } from "./index-BTwtRxOU.js";
import { u as useId } from "./Combination-BC6FEbU4.js";
import { c as cn } from "./button-CzfLTIHt.js";
import { D as DataTable } from "./DataTable-BaPF79vq.js";
import "./avatar-BEvRnn4D.js";
import "./useFeatureFlag-PPzt5-ch.js";
import "./usePortalMeta-BrKLDHxF.js";
import "./usePortalUrl-Bjyn0q0k.js";
import "./index-BpxO7BrF.js";
import "./LumeLogo-UyKObroS.js";
import "./lume-logo-ChvyOqr_.js";
import "./components-DMYkXxdw.js";
import "./index-CfDxhBvB.js";
import "./index-BquAYmyk.js";
import "./index-O1NGHMyc.js";
import "./sheet-BiOScmXk.js";
import "./index-DUTfRgmH.js";
import "./icons-DfV8n6Ey.js";
import "./dialog-D6SmLySg.js";
import "./label-DPLqB6Bj.js";
import "./input-B6UnxZyR.js";
import "./select-DonCKqC4.js";
import "./index-CXs_k2So.js";
import "./index-B2actZrY.js";
import "./index-WXDFwduM.js";
import "./filesize-DaDW_CYa.js";
import "./Forms-BYhGkaay.js";
import "./textarea-C63kCrGx.js";
import "./useEmailVerification-CG_UnQY0.js";
import "./useSdk-Bk9IxULM.js";
import "./alert-BS46AoM-.js";
import "./popover-Dc2H5Ola.js";
import "./usePluginMeta-BNkMCdOH.js";
import "./index-Dv9Lz1jY.js";
import "./skeleton-DwNK_yGs.js";
var TABS_NAME = "Tabs";
var [createTabsContext, createTabsScope] = createContextScope(TABS_NAME, [
  createRovingFocusGroupScope
]);
var useRovingFocusGroupScope = createRovingFocusGroupScope();
var [TabsProvider, useTabsContext] = createTabsContext(TABS_NAME);
var Tabs$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeTabs,
      value: valueProp,
      onValueChange,
      defaultValue,
      orientation = "horizontal",
      dir,
      activationMode = "automatic",
      ...tabsProps
    } = props;
    const direction = useDirection(dir);
    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: onValueChange,
      defaultProp: defaultValue
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      TabsProvider,
      {
        scope: __scopeTabs,
        baseId: useId(),
        value,
        onValueChange: setValue,
        orientation,
        dir: direction,
        activationMode,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.div,
          {
            dir: direction,
            "data-orientation": orientation,
            ...tabsProps,
            ref: forwardedRef
          }
        )
      }
    );
  }
);
Tabs$1.displayName = TABS_NAME;
var TAB_LIST_NAME = "TabsList";
var TabsList$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTabs, loop = true, ...listProps } = props;
    const context = useTabsContext(TAB_LIST_NAME, __scopeTabs);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeTabs);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Root,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        orientation: context.orientation,
        dir: context.dir,
        loop,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.div,
          {
            role: "tablist",
            "aria-orientation": context.orientation,
            ...listProps,
            ref: forwardedRef
          }
        )
      }
    );
  }
);
TabsList$1.displayName = TAB_LIST_NAME;
var TRIGGER_NAME = "TabsTrigger";
var TabsTrigger$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTabs, value, disabled = false, ...triggerProps } = props;
    const context = useTabsContext(TRIGGER_NAME, __scopeTabs);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeTabs);
    const triggerId = makeTriggerId(context.baseId, value);
    const contentId = makeContentId(context.baseId, value);
    const isSelected = value === context.value;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Item,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        focusable: !disabled,
        active: isSelected,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.button,
          {
            type: "button",
            role: "tab",
            "aria-selected": isSelected,
            "aria-controls": contentId,
            "data-state": isSelected ? "active" : "inactive",
            "data-disabled": disabled ? "" : void 0,
            disabled,
            id: triggerId,
            ...triggerProps,
            ref: forwardedRef,
            onMouseDown: composeEventHandlers(props.onMouseDown, (event) => {
              if (!disabled && event.button === 0 && event.ctrlKey === false) {
                context.onValueChange(value);
              } else {
                event.preventDefault();
              }
            }),
            onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
              if ([" ", "Enter"].includes(event.key)) context.onValueChange(value);
            }),
            onFocus: composeEventHandlers(props.onFocus, () => {
              const isAutomaticActivation = context.activationMode !== "manual";
              if (!isSelected && !disabled && isAutomaticActivation) {
                context.onValueChange(value);
              }
            })
          }
        )
      }
    );
  }
);
TabsTrigger$1.displayName = TRIGGER_NAME;
var CONTENT_NAME = "TabsContent";
var TabsContent$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTabs, value, forceMount, children, ...contentProps } = props;
    const context = useTabsContext(CONTENT_NAME, __scopeTabs);
    const triggerId = makeTriggerId(context.baseId, value);
    const contentId = makeContentId(context.baseId, value);
    const isSelected = value === context.value;
    const isMountAnimationPreventedRef = reactExports.useRef(isSelected);
    reactExports.useEffect(() => {
      const rAF = requestAnimationFrame(() => isMountAnimationPreventedRef.current = false);
      return () => cancelAnimationFrame(rAF);
    }, []);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || isSelected, children: ({ present }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.div,
      {
        "data-state": isSelected ? "active" : "inactive",
        "data-orientation": context.orientation,
        role: "tabpanel",
        "aria-labelledby": triggerId,
        hidden: !present,
        id: contentId,
        tabIndex: 0,
        ...contentProps,
        ref: forwardedRef,
        style: {
          ...props.style,
          animationDuration: isMountAnimationPreventedRef.current ? "0s" : void 0
        },
        children: present && children
      }
    ) });
  }
);
TabsContent$1.displayName = CONTENT_NAME;
function makeTriggerId(baseId, value) {
  return `${baseId}-trigger-${value}`;
}
function makeContentId(baseId, value) {
  return `${baseId}-content-${value}`;
}
var Root2 = Tabs$1;
var List = TabsList$1;
var Trigger = TabsTrigger$1;
var Content = TabsContent$1;
const Tabs = Root2;
const TabsList = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  List,
  {
    ref,
    className: cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-primary-dark p-1 text-muted-foreground",
      className
    ),
    ...props
  }
));
TabsList.displayName = List.displayName;
const TabsTrigger = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Trigger,
  {
    ref,
    className: cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-primary-1 data-[state=active]:shadow",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = Trigger.displayName;
const TabsContent = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content,
  {
    ref,
    className: cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    ),
    ...props
  }
));
TabsContent.displayName = Content.displayName;
function Manager() {
  const serviceIds = getServiceIds().sort();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: serviceIds[0], children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsList, { className: "mb-6", children: serviceIds.map((serviceId) => {
      const service = getServiceById(serviceId);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: serviceId, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground", children: [
        " ",
        service == null ? void 0 : service.name()
      ] }) }, "activeService") });
    }) }),
    serviceIds.map((serviceId) => {
      const service = getServiceById(serviceId);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: serviceId, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-4 text-xl font-semibold", children: "IPFS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataTable,
          {
            className: "min-w-full border border-gray-700 border-x-1",
            columns: (service == null ? void 0 : service.UIUploadQueueColumns()) || [],
            resource: (service == null ? void 0 : service.id()) || "",
            dataProviderName: (service == null ? void 0 : service.id()) || "",
            autoRefresh: true,
            autoRefreshInterval: 5e3
          }
        ) })
      ] }) }, "activeService") });
    })
  ] });
}
function Uploads() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(mc, {
    v3LegacyAuthProviderCompatible: false,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(GeneralLayout, {
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Manager, {})
    })
  }, "uploads");
}
export {
  Uploads as default
};
