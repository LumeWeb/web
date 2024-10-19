import { j as jsxRuntimeExports, r as reactExports } from "./index-DqVokHLY.js";
import { L as Link } from "./components-BEb6BnMw.js";
import { c as createContextScope, u as useComposedRefs, P as Primitive, e as composeEventHandlers, b as Presence, U as ReactRemoveScroll, S as Slot, Q as hideOthers, T as useFocusGuards, V as FocusScope, W as DismissableLayer, a8 as createContext2, a as useControllableState, X as useId, f as Portal$1, i as cn, C as Cross2Icon, j as cva, a9 as EyeOpenIcon, aa as EyeNoneIcon, a7 as useSize, a0 as CheckIcon, H as usePortalMeta } from "./createLucideIcon-eCGisUfw.js";
const discordLogoPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAANLSURBVHgB7VhNTttAFP7GJFGlSjQ3qDlBwwkIP5VY5gaFXQVITU9AOAGJBKg70hukOxaFujfIDWpO0BS6qJLg6fdMbBxj1+OYQhZ8kiXPzBv788y8771nhQg232t7XMYHz8MWm1U8LgYK6JXLODhrKzfoVIiQGy7gG29tPC3cxTKWe201kIYV9I4WsI+nJyewr0c4DBohQQ1/W+cC5NII7i3MJ8LzP68EQzwTLIq5J1jCjFAKfXrbd+XhtVZ3Xjdlo9HTFi4ptitao4YZMAvBLsl90R7eKAs1IcC+A3hw75jRC2+vFX6AyEaH0clRC2iR7DvkQB6CrqWwzZdVuRq2V0HHmah9Fjb2dJ2HaWuxhObgD1pWjohlTlDh89cj5WAGTOY5dYZT55Ny13Z1h+1Dk7nGTuKV0EVBCDn/WWX/WUarb0qw60QyjKLwj4ZCx8TWiKA4BR4YfLFjaJeJwfmR6iUNNJq6Wm9qO22ijIlN0tjkXLooSlD0Lql/fU83rkb4YfHa2NX3Dvz6rj6VMdr8FNvkh2fvTCZBEeOUIckf/dWh1DV9KZlA7qfSN+3b3oeX/PG5CKadFWph4ZJAxDvLJpPg2EuVg9ALGR36UY2Ue+kL2vyYZI99kS01mQSdE5W4DRfHqu3dYMnTWD4/Vsvxcelj5Fml5i1dnKhu4rNvI5GLfyB3LH67o2svK3ClqAmENw3RVRVvvh6jnqYIachcwc2YjIy45VdjNMVLhWzWfJGatR29fzVE86Y0feakkkRGeRuWnYyPOsXGrZSxehaLJL6nahxK8sC0qs9MxeV2/5Ixbu0rOoC8WGwudQWNeGIh82l/ipSkgUfI52ayxfaQesYV60aL6tIYLutofwWZD9pMv0J4kU/la6qloU+iL9v8e8wUjbJDmzoMYLKCcbic5NJYyJlKzWBy2Yb2uVYwDlvnL/CrmPFXynPRVBTPBBNglEkHCAmmpVUPDT9GK1aBhoiuoPGkIhB5YnXXNiUZEpzEyI8wyHILwo/JF0eqRbbbWcYq3sHYWWWUqDFU2fhP8Cy4ziSRqDOeMzRKnTylk4FQK8wBpF6OF/MBwbmQGUnbmFuuIuF4zY0O+iT585znMle++CRY29Ot4P4vqT5BEfjRYpQAAAAASUVORK5CYII=";
const lumeColorLogoPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAoCAYAAACFFRgXAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAQUSURBVHgB7ZhdaBRXFMfPuTMbd7Wm1FpItjHrF1j6UksFSyktpbQG2r7Ypi3RbK3a3ZoWH9o+tLToltLH9kHaSGIkGJMoiaA+CHlQEcUPBEFEMaKuyUaNGD8xrpvszD2ejZnJKDGTndxZEPMjy9x758y9/3Pn3nNPBkExq3oa5mclHQKgkAnyx5bI982gEAGKGZTmKgIqIYAXBYgYKEa5YIE4xSqjo6ysf3jGmBTsN8+X4Mq2Nm1l3+bpUEA8C472bHw1uPhOVzZt3q3uqvsBCoRnwUTaZ3wp4x9yN2uhQHgXLOEFu4Jy2qg2RAiKUb7pJNLASI1CoBj1UcLAcyMVXPB1alsYFOJZMCI5nkWySkTGUQR7lgMB6v83drV1JihCB49wnhAhSybBTat9/pzr55Op8BEufjB886tM9v5H0e76/YhwzdkHSeyVIBubZ8d7YZx4Ery8q66U91NFTumQeIEnrXsJTMhocuOvoGt7+PbMR/7QDL58YTtowS+GnXiLS5/DONETRCJ55f+XSC/W3IwxSwEpB1/n5fAXv/u5Vrs0cbvTrmnumuNV3bWLNQrsIKSFOBT6ntIniXLIA/1id8O3hEV/o5lxFcwTFOKRp4FjpniGzmfSxfuftG2N1CSrTtV+qL8c+Jiy8CWHvtfYuBidoQ5FLzv+G+QBVnfVp9l/T+GHR+40MsYnrQtqklAgBHt9GPKF6Davx1oDjHcKKTaHHpgqlmbSRoUmNfc1LIg1Ct7pRmrrvFgK8mDFpcag1IwlIOk9KbBUELiOJzn6mCQ3bJsT77Q1gM8kKCEuXAp/KjT8k6PFG/mOycaHmyKxd626a1jL5QMrrzaWDaAcOSgyAEEds/p14079onh6rOeTl8tqUJP/sNgi8AAfT4856OrtslTd70LierZ0vELK/fXz4ZFkIQdD02Fd/Yz43SefrUo2RHRNdrJ10B4Q2V2is7y+sm5j83O3eOn8sSXy3YlxCV52bEOxKA1xbkAlMHbPfRIg3jI7ttPZXJ3a1MLiqoZHMoDw54y4t6l91k8PwCNj5hItb6+9xzO4D9xAeEUgtEavNLz5WLOkRY7a3nnlq/+biNgcbskP4ZRg3ByQ7wukJdYPUK8QApbz++1gGzlsG6Ss+UvlmTZ7rfL6szM1Ph07EogSJojrpttaEr3Pl4Oj3aukRHuwJ1zHS2LFsKqlouj2Oi5dHKoTTLVsTaA+UMCE8uF2TAyiTusdTcFAABeOZouGIFDAhBP4pnA8xUmXHSE4V5gFPqLkPw5OZ+wQxQeE5xx7PPj7IYWo3yqhRrdAAb7OBgntG0FyDefEHTdODxwABfgquLl89S6OFLs5TivZcDn8/7amUGyOya+XfjMp2G+UCOYc1Y63/NVASc7wNB4CjTF1TGpQc3sAAAAASUVORK5CYII=";
const logoPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPYAAABNCAYAAACVH5l+AAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAASGSURBVHgB7d1NiFZVHMfx/5RFLzZNJaJD4ZQQ9EJa2KI2iQQtWkTRoldoUVEQ7aIWFWOrFm1MKoIghBa1KCIIes/IhQilVGJR4dCLjq8zvqCi4vF3vKI+M885jvf9Hr4f+HMu9zn3uc/A/LjPc+4995q1lHNukWrCneaXlxmA7lKIf3fT7TAA3aQAz3NhCw1A1HnWThdFXrvMAES1NdgACiDYQIIINpAggg0kiGADCSLYQIIINpAggg0kiGADCSLYQIIaCbZzbpYvA1CJWoOtMF+oekeLB1RHtPyJaoEB6C6F+I0+s7W+79NvJDK7a7EBaA+F8kAgrCNT+hFsoIC6f2NfHFg/zwCUhlFxIEEEG0hQW4N9OPJa7O4qAKy9wd6q2h947VoDENXKYA8MDDg144GX7zAAUW3+jf1jYP3jOuV1hQEIanOwVwfWD6neNQDN01F2buSik5v79B9S7Ylss0F1uwGYps6JGDdGXpucukK/sycV3BVafCWwzSLVOvVZr3aj6m+L2636TO87ZgDKoQCuDBx590a28Uft3a4846rrDEBxCtN81b+BsP1wlm3vduX6woDEVT54piBdruZt1dWBLp/GttdX52/ULLfy3GQA8jt5tN0QOXoec1NmdkXe6zHV/6649QYk7sTgmf7Z71TzkOoaK8eVqlssOzUVs2qmg1nq94E+5xotjqoetfwDfysNSNyAP6qq/covW70mVLflGaXWZx5Ws1S1TOUfq+u/5vupn7Gw/6N6S/t704DUKSQ/uWY8aQCqoYAddPV70QBURyHb5OrjT3ndYwCqpaA95aq3VfWq6hIDULkTA2YK3CNqnlPNt3LsUf1i2WWeX2rAaq3VSH/PHDWzLRtMK+Oy2XF/iasBqI+CPKi6X7VKtdlVY9QA1EOBe0G1y9XjeQNQHYVsWPWtq9fXBnRAJ5+f5bLLUP0TREasXrMN6IDCwXbZJA8/N3o40u2oartqiwah/rJi+ztfzUdWf6i9Dw1InUK20J37YNWEyx7G97Dl4LLTZk14z4COKHR9uP7Zf1Zzq+U3pnpWR/EZzZHW/vwkld9Ug5Fuf6g+V21S7bRybNRn/NOA1Clkc1x5XpvhPp+OvMdO1X0GID+F6CqXzacuy1mnU6rPmsj2NxiA4hSm71y5nons61LVocB27xuAcihQC1RrXXn8nUmHAvtaEtluqQE4pZSbK7jszp9zI138g/QuUPnfwPda/FTVcg1UjfbZxwNqPu63gfrXfZMIAGdSQGepXo8cff3psME+2z0R6P+fAehR+yN+dHA9qnrJwo/p8V/Fl9jM7TMAPZp8dpcPdyiU3IwBKKCxYJ+c3xyaVHG9Acit6adtrgusX2wAcms62NsMQOna/HxsADkRbCBBKQT7iAHo0aVgjwXW/2oAenQm2Do9ttqmX1LqT5m9bAB6dOqeZwr3g/7SUi3eZdm9y1do3WYD0B6R678JK1AAo+JAggg2kCCCDSSIYAMJIthAggg2kCCCDSSIYAMJIthAggg2kCCCDSSo6WDvCqyfNAAAcNpxd1XglbBqdCEAAAAASUVORK5CYII=";
function LumeLogo() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "flex items-center space-x-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: logoPng, alt: "Lume logo", className: "h-10" }) });
}
var DIALOG_NAME = "Dialog";
var [createDialogContext, createDialogScope] = createContextScope(DIALOG_NAME);
var [DialogProvider, useDialogContext] = createDialogContext(DIALOG_NAME);
var Dialog = (props) => {
  const {
    __scopeDialog,
    children,
    open: openProp,
    defaultOpen,
    onOpenChange,
    modal = true
  } = props;
  const triggerRef = reactExports.useRef(null);
  const contentRef = reactExports.useRef(null);
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DialogProvider,
    {
      scope: __scopeDialog,
      triggerRef,
      contentRef,
      contentId: useId(),
      titleId: useId(),
      descriptionId: useId(),
      open,
      onOpenChange: setOpen,
      onOpenToggle: reactExports.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen]),
      modal,
      children
    }
  );
};
Dialog.displayName = DIALOG_NAME;
var TRIGGER_NAME = "DialogTrigger";
var DialogTrigger = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...triggerProps } = props;
    const context = useDialogContext(TRIGGER_NAME, __scopeDialog);
    const composedTriggerRef = useComposedRefs(forwardedRef, context.triggerRef);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": context.open,
        "aria-controls": context.contentId,
        "data-state": getState$1(context.open),
        ...triggerProps,
        ref: composedTriggerRef,
        onClick: composeEventHandlers(props.onClick, context.onOpenToggle)
      }
    );
  }
);
DialogTrigger.displayName = TRIGGER_NAME;
var PORTAL_NAME = "DialogPortal";
var [PortalProvider, usePortalContext] = createDialogContext(PORTAL_NAME, {
  forceMount: void 0
});
var DialogPortal = (props) => {
  const { __scopeDialog, forceMount, children, container } = props;
  const context = useDialogContext(PORTAL_NAME, __scopeDialog);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PortalProvider, { scope: __scopeDialog, forceMount, children: reactExports.Children.map(children, (child) => /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Portal$1, { asChild: true, container, children: child }) })) });
};
DialogPortal.displayName = PORTAL_NAME;
var OVERLAY_NAME = "DialogOverlay";
var DialogOverlay = reactExports.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext(OVERLAY_NAME, props.__scopeDialog);
    const { forceMount = portalContext.forceMount, ...overlayProps } = props;
    const context = useDialogContext(OVERLAY_NAME, props.__scopeDialog);
    return context.modal ? /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogOverlayImpl, { ...overlayProps, ref: forwardedRef }) }) : null;
  }
);
DialogOverlay.displayName = OVERLAY_NAME;
var DialogOverlayImpl = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...overlayProps } = props;
    const context = useDialogContext(OVERLAY_NAME, __scopeDialog);
    return (
      // Make sure `Content` is scrollable even when it doesn't live inside `RemoveScroll`
      // ie. when `Overlay` and `Content` are siblings
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReactRemoveScroll, { as: Slot, allowPinchZoom: true, shards: [context.contentRef], children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Primitive.div,
        {
          "data-state": getState$1(context.open),
          ...overlayProps,
          ref: forwardedRef,
          style: { pointerEvents: "auto", ...overlayProps.style }
        }
      ) })
    );
  }
);
var CONTENT_NAME = "DialogContent";
var DialogContent = reactExports.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext(CONTENT_NAME, props.__scopeDialog);
    const { forceMount = portalContext.forceMount, ...contentProps } = props;
    const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: context.modal ? /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContentModal, { ...contentProps, ref: forwardedRef }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContentNonModal, { ...contentProps, ref: forwardedRef }) });
  }
);
DialogContent.displayName = CONTENT_NAME;
var DialogContentModal = reactExports.forwardRef(
  (props, forwardedRef) => {
    const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
    const contentRef = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, context.contentRef, contentRef);
    reactExports.useEffect(() => {
      const content = contentRef.current;
      if (content) return hideOthers(content);
    }, []);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      DialogContentImpl,
      {
        ...props,
        ref: composedRefs,
        trapFocus: context.open,
        disableOutsidePointerEvents: true,
        onCloseAutoFocus: composeEventHandlers(props.onCloseAutoFocus, (event) => {
          var _a;
          event.preventDefault();
          (_a = context.triggerRef.current) == null ? void 0 : _a.focus();
        }),
        onPointerDownOutside: composeEventHandlers(props.onPointerDownOutside, (event) => {
          const originalEvent = event.detail.originalEvent;
          const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
          const isRightClick = originalEvent.button === 2 || ctrlLeftClick;
          if (isRightClick) event.preventDefault();
        }),
        onFocusOutside: composeEventHandlers(
          props.onFocusOutside,
          (event) => event.preventDefault()
        )
      }
    );
  }
);
var DialogContentNonModal = reactExports.forwardRef(
  (props, forwardedRef) => {
    const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
    const hasInteractedOutsideRef = reactExports.useRef(false);
    const hasPointerDownOutsideRef = reactExports.useRef(false);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      DialogContentImpl,
      {
        ...props,
        ref: forwardedRef,
        trapFocus: false,
        disableOutsidePointerEvents: false,
        onCloseAutoFocus: (event) => {
          var _a, _b;
          (_a = props.onCloseAutoFocus) == null ? void 0 : _a.call(props, event);
          if (!event.defaultPrevented) {
            if (!hasInteractedOutsideRef.current) (_b = context.triggerRef.current) == null ? void 0 : _b.focus();
            event.preventDefault();
          }
          hasInteractedOutsideRef.current = false;
          hasPointerDownOutsideRef.current = false;
        },
        onInteractOutside: (event) => {
          var _a, _b;
          (_a = props.onInteractOutside) == null ? void 0 : _a.call(props, event);
          if (!event.defaultPrevented) {
            hasInteractedOutsideRef.current = true;
            if (event.detail.originalEvent.type === "pointerdown") {
              hasPointerDownOutsideRef.current = true;
            }
          }
          const target = event.target;
          const targetIsTrigger = (_b = context.triggerRef.current) == null ? void 0 : _b.contains(target);
          if (targetIsTrigger) event.preventDefault();
          if (event.detail.originalEvent.type === "focusin" && hasPointerDownOutsideRef.current) {
            event.preventDefault();
          }
        }
      }
    );
  }
);
var DialogContentImpl = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, trapFocus, onOpenAutoFocus, onCloseAutoFocus, ...contentProps } = props;
    const context = useDialogContext(CONTENT_NAME, __scopeDialog);
    const contentRef = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, contentRef);
    useFocusGuards();
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        FocusScope,
        {
          asChild: true,
          loop: true,
          trapped: trapFocus,
          onMountAutoFocus: onOpenAutoFocus,
          onUnmountAutoFocus: onCloseAutoFocus,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            DismissableLayer,
            {
              role: "dialog",
              id: context.contentId,
              "aria-describedby": context.descriptionId,
              "aria-labelledby": context.titleId,
              "data-state": getState$1(context.open),
              ...contentProps,
              ref: composedRefs,
              onDismiss: () => context.onOpenChange(false)
            }
          )
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TitleWarning, { titleId: context.titleId }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DescriptionWarning, { contentRef, descriptionId: context.descriptionId })
      ] })
    ] });
  }
);
var TITLE_NAME = "DialogTitle";
var DialogTitle = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...titleProps } = props;
    const context = useDialogContext(TITLE_NAME, __scopeDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.h2, { id: context.titleId, ...titleProps, ref: forwardedRef });
  }
);
DialogTitle.displayName = TITLE_NAME;
var DESCRIPTION_NAME = "DialogDescription";
var DialogDescription = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...descriptionProps } = props;
    const context = useDialogContext(DESCRIPTION_NAME, __scopeDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.p, { id: context.descriptionId, ...descriptionProps, ref: forwardedRef });
  }
);
DialogDescription.displayName = DESCRIPTION_NAME;
var CLOSE_NAME = "DialogClose";
var DialogClose = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...closeProps } = props;
    const context = useDialogContext(CLOSE_NAME, __scopeDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        type: "button",
        ...closeProps,
        ref: forwardedRef,
        onClick: composeEventHandlers(props.onClick, () => context.onOpenChange(false))
      }
    );
  }
);
DialogClose.displayName = CLOSE_NAME;
function getState$1(open) {
  return open ? "open" : "closed";
}
var TITLE_WARNING_NAME = "DialogTitleWarning";
var [WarningProvider, useWarningContext] = createContext2(TITLE_WARNING_NAME, {
  contentName: CONTENT_NAME,
  titleName: TITLE_NAME,
  docsSlug: "dialog"
});
var TitleWarning = ({ titleId }) => {
  const titleWarningContext = useWarningContext(TITLE_WARNING_NAME);
  const MESSAGE = `\`${titleWarningContext.contentName}\` requires a \`${titleWarningContext.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${titleWarningContext.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${titleWarningContext.docsSlug}`;
  reactExports.useEffect(() => {
    if (titleId) {
      const hasTitle = document.getElementById(titleId);
      if (!hasTitle) console.error(MESSAGE);
    }
  }, [MESSAGE, titleId]);
  return null;
};
var DESCRIPTION_WARNING_NAME = "DialogDescriptionWarning";
var DescriptionWarning = ({ contentRef, descriptionId }) => {
  const descriptionWarningContext = useWarningContext(DESCRIPTION_WARNING_NAME);
  const MESSAGE = `Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${descriptionWarningContext.contentName}}.`;
  reactExports.useEffect(() => {
    var _a;
    const describedById = (_a = contentRef.current) == null ? void 0 : _a.getAttribute("aria-describedby");
    if (descriptionId && describedById) {
      const hasDescription = document.getElementById(descriptionId);
      if (!hasDescription) console.warn(MESSAGE);
    }
  }, [MESSAGE, contentRef, descriptionId]);
  return null;
};
var Root$2 = Dialog;
var Trigger = DialogTrigger;
var Portal = DialogPortal;
var Overlay = DialogOverlay;
var Content = DialogContent;
var Title = DialogTitle;
var Description = DialogDescription;
var Close = DialogClose;
const Sheet = Root$2;
const SheetTrigger = Trigger;
const SheetPortal = Portal;
const SheetOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
SheetOverlay.displayName = Overlay.displayName;
const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-md",
        right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-md"
      }
    },
    defaultVariants: {
      side: "right"
    }
  }
);
const SheetContent = reactExports.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(SheetOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Content,
    {
      ref,
      className: cn(sheetVariants({ side }), className),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Cross2Icon, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
SheetContent.displayName = Content.displayName;
const SheetHeader = ({
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    className: cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    ),
    ...props
  }
);
SheetHeader.displayName = "SheetHeader";
const SheetTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Title,
  {
    ref,
    className: cn("text-lg font-semibold text-foreground", className),
    ...props
  }
));
SheetTitle.displayName = Title.displayName;
const SheetDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
SheetDescription.displayName = Description.displayName;
var NAME = "Label";
var Label = reactExports.forwardRef((props, forwardedRef) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Primitive.label,
    {
      ...props,
      ref: forwardedRef,
      onMouseDown: (event) => {
        var _a;
        const target = event.target;
        if (target.closest("button, input, select, textarea")) return;
        (_a = props.onMouseDown) == null ? void 0 : _a.call(props, event);
        if (!event.defaultPrevented && event.detail > 1) event.preventDefault();
      }
    }
  );
});
Label.displayName = NAME;
var Root$1 = Label;
function usePrevious(value) {
  const ref = reactExports.useRef({ value, previous: value });
  return reactExports.useMemo(() => {
    if (ref.current.value !== value) {
      ref.current.previous = ref.current.value;
      ref.current.value = value;
    }
    return ref.current.previous;
  }, [value]);
}
const Input = reactExports.forwardRef(
  ({ className, type, fullWidth, leftIcon, ...props }, ref) => {
    const [showPassword, setShowPassword] = reactExports.useState(false);
    const [mask, setMask] = reactExports.useState(false);
    const toggleShowPassword = () => {
      setShowPassword((show) => !show);
      setMask((mask2) => !mask2);
    };
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative ${fullWidth ? "w-full" : ""}`, children: [
      leftIcon && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-4 top-1/2 -translate-y-1/2", children: leftIcon }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: type && !mask ? type : "text",
          className: cn(
            "flex h-14 w-full bg-secondary rounded-md border border-input px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-input-placeholder focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className,
            leftIcon && "pl-10"
          ),
          ref,
          ...props
        }
      ),
      type === "password" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: "absolute right-4 top-5 text-ring",
          onClick: toggleShowPassword,
          onKeyDown: toggleShowPassword,
          children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOpenIcon, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(EyeNoneIcon, {})
        }
      ) : null,
      props.after
    ] });
  }
);
Input.displayName = "Input";
function getFormElement(formId) {
  return document.forms.namedItem(formId);
}
function getFieldElements(form, name) {
  var field = form === null || form === void 0 ? void 0 : form.elements.namedItem(name);
  var elements = !field ? [] : field instanceof Element ? [field] : Array.from(field.values());
  return elements.filter((element) => element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement);
}
function getEventTarget(form, name, value) {
  var _elements$;
  var elements = getFieldElements(form, name);
  if (elements.length > 1) {
    var options = value;
    for (var element of elements) {
      if (typeof options !== "undefined" && element instanceof HTMLInputElement && element.type === "checkbox" && (element.checked ? options.includes(element.value) : !options.includes(element.value))) {
        continue;
      }
      return element;
    }
  }
  return (_elements$ = elements[0]) !== null && _elements$ !== void 0 ? _elements$ : null;
}
function createDummySelect(form, name, value) {
  var select = document.createElement("select");
  var options = typeof value === "string" ? [value] : value !== null && value !== void 0 ? value : [];
  select.name = name;
  select.multiple = true;
  select.dataset.conform = "true";
  select.setAttribute("aria-hidden", "true");
  select.tabIndex = -1;
  select.style.position = "absolute";
  select.style.width = "1px";
  select.style.height = "1px";
  select.style.padding = "0";
  select.style.margin = "-1px";
  select.style.overflow = "hidden";
  select.style.clip = "rect(0,0,0,0)";
  select.style.whiteSpace = "nowrap";
  select.style.border = "0";
  for (var option of options) {
    select.options.add(new Option(option, option, true, true));
  }
  form.appendChild(select);
  return select;
}
function isDummySelect(element) {
  return element.dataset.conform === "true";
}
function updateFieldValue(element, value) {
  if (element instanceof HTMLInputElement && (element.type === "checkbox" || element.type === "radio")) {
    element.checked = Array.isArray(value) ? value.includes(element.value) : element.value === value;
  } else if (element instanceof HTMLSelectElement && element.multiple) {
    var selectedValue = Array.isArray(value) ? [...value] : [value];
    for (var option of element.options) {
      var index = selectedValue.indexOf(option.value);
      var selected = index > -1;
      option.selected = selected;
      if (selected) {
        selectedValue.splice(index, 1);
      }
    }
    if (isDummySelect(element)) {
      for (var _option of selectedValue) {
        element.options.add(new Option(_option, _option, false, true));
      }
    }
  } else if (element.value !== value) {
    var {
      set: valueSetter
    } = Object.getOwnPropertyDescriptor(element, "value") || {};
    var prototype = Object.getPrototypeOf(element);
    var {
      set: prototypeValueSetter
    } = Object.getOwnPropertyDescriptor(prototype, "value") || {};
    if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter.call(element, value);
    } else {
      if (valueSetter) {
        valueSetter.call(element, value);
      } else {
        throw new Error("The given element does not have a value setter");
      }
    }
  }
}
function useInputEvent() {
  var ref = reactExports.useRef(null);
  var eventDispatched = reactExports.useRef({
    change: false,
    focus: false,
    blur: false
  });
  reactExports.useEffect(() => {
    var createEventListener = (listener) => {
      return (event) => {
        var element = ref.current;
        if (element && event.target === element) {
          eventDispatched.current[listener] = true;
        }
      };
    };
    var inputHandler = createEventListener("change");
    var focusHandler = createEventListener("focus");
    var blurHandler = createEventListener("blur");
    document.addEventListener("input", inputHandler, true);
    document.addEventListener("focusin", focusHandler, true);
    document.addEventListener("focusout", blurHandler, true);
    return () => {
      document.removeEventListener("input", inputHandler, true);
      document.removeEventListener("focusin", focusHandler, true);
      document.removeEventListener("focusout", blurHandler, true);
    };
  }, [ref]);
  return reactExports.useMemo(() => {
    return {
      change(value) {
        if (!eventDispatched.current.change) {
          eventDispatched.current.change = true;
          var element = ref.current;
          if (element) {
            updateFieldValue(element, value);
            element.dispatchEvent(new InputEvent("input", {
              bubbles: true
            }));
            element.dispatchEvent(new Event("change", {
              bubbles: true
            }));
          }
        }
        eventDispatched.current.change = false;
      },
      focus() {
        if (!eventDispatched.current.focus) {
          eventDispatched.current.focus = true;
          var element = ref.current;
          if (element) {
            element.dispatchEvent(new FocusEvent("focusin", {
              bubbles: true
            }));
            element.dispatchEvent(new FocusEvent("focus"));
          }
        }
        eventDispatched.current.focus = false;
      },
      blur() {
        if (!eventDispatched.current.blur) {
          eventDispatched.current.blur = true;
          var element = ref.current;
          if (element) {
            element.dispatchEvent(new FocusEvent("focusout", {
              bubbles: true
            }));
            element.dispatchEvent(new FocusEvent("blur"));
          }
        }
        eventDispatched.current.blur = false;
      },
      register(element) {
        ref.current = element;
      }
    };
  }, []);
}
function useInputValue(options) {
  var initializeValue = () => {
    var _options$initialValue;
    if (typeof options.initialValue === "string") {
      return options.initialValue;
    }
    return (_options$initialValue = options.initialValue) === null || _options$initialValue === void 0 ? void 0 : _options$initialValue.map((value2) => value2 !== null && value2 !== void 0 ? value2 : "");
  };
  var [key, setKey] = reactExports.useState(options.key);
  var [value, setValue] = reactExports.useState(initializeValue);
  if (key !== options.key) {
    setValue(initializeValue);
    setKey(options.key);
  }
  return [value, setValue];
}
function useInputControl(meta) {
  var [value, setValue] = useInputValue(meta);
  var initializedRef = reactExports.useRef(false);
  var {
    register,
    change,
    focus,
    blur
  } = useInputEvent();
  reactExports.useEffect(() => {
    var form = getFormElement(meta.formId);
    if (!form) {
      console.warn("useInputControl is unable to find form#".concat(meta.formId, " and identify if a dummy input is required"));
      return;
    }
    var element = getEventTarget(form, meta.name);
    if (!element && typeof value !== "undefined" && (!Array.isArray(value) || value.length > 0)) {
      element = createDummySelect(form, meta.name, value);
    }
    register(element);
    if (!initializedRef.current) {
      initializedRef.current = true;
    } else {
      change(value !== null && value !== void 0 ? value : "");
    }
    return () => {
      register(null);
      var elements = getFieldElements(form, meta.name);
      for (var _element of elements) {
        if (isDummySelect(_element)) {
          _element.remove();
        }
      }
    };
  }, [meta.formId, meta.name, value, change, register]);
  return {
    value,
    change: setValue,
    focus,
    blur
  };
}
var CHECKBOX_NAME = "Checkbox";
var [createCheckboxContext, createCheckboxScope] = createContextScope(CHECKBOX_NAME);
var [CheckboxProvider, useCheckboxContext] = createCheckboxContext(CHECKBOX_NAME);
var Checkbox$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeCheckbox,
      name,
      checked: checkedProp,
      defaultChecked,
      required,
      disabled,
      value = "on",
      onCheckedChange,
      ...checkboxProps
    } = props;
    const [button, setButton] = reactExports.useState(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setButton(node));
    const hasConsumerStoppedPropagationRef = reactExports.useRef(false);
    const isFormControl = button ? Boolean(button.closest("form")) : true;
    const [checked = false, setChecked] = useControllableState({
      prop: checkedProp,
      defaultProp: defaultChecked,
      onChange: onCheckedChange
    });
    const initialCheckedStateRef = reactExports.useRef(checked);
    reactExports.useEffect(() => {
      const form = button == null ? void 0 : button.form;
      if (form) {
        const reset = () => setChecked(initialCheckedStateRef.current);
        form.addEventListener("reset", reset);
        return () => form.removeEventListener("reset", reset);
      }
    }, [button, setChecked]);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(CheckboxProvider, { scope: __scopeCheckbox, state: checked, disabled, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Primitive.button,
        {
          type: "button",
          role: "checkbox",
          "aria-checked": isIndeterminate(checked) ? "mixed" : checked,
          "aria-required": required,
          "data-state": getState(checked),
          "data-disabled": disabled ? "" : void 0,
          disabled,
          value,
          ...checkboxProps,
          ref: composedRefs,
          onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
            if (event.key === "Enter") event.preventDefault();
          }),
          onClick: composeEventHandlers(props.onClick, (event) => {
            setChecked((prevChecked) => isIndeterminate(prevChecked) ? true : !prevChecked);
            if (isFormControl) {
              hasConsumerStoppedPropagationRef.current = event.isPropagationStopped();
              if (!hasConsumerStoppedPropagationRef.current) event.stopPropagation();
            }
          })
        }
      ),
      isFormControl && /* @__PURE__ */ jsxRuntimeExports.jsx(
        BubbleInput,
        {
          control: button,
          bubbles: !hasConsumerStoppedPropagationRef.current,
          name,
          value,
          checked,
          required,
          disabled,
          style: { transform: "translateX(-100%)" }
        }
      )
    ] });
  }
);
Checkbox$1.displayName = CHECKBOX_NAME;
var INDICATOR_NAME = "CheckboxIndicator";
var CheckboxIndicator = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeCheckbox, forceMount, ...indicatorProps } = props;
    const context = useCheckboxContext(INDICATOR_NAME, __scopeCheckbox);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || isIndeterminate(context.state) || context.state === true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.span,
      {
        "data-state": getState(context.state),
        "data-disabled": context.disabled ? "" : void 0,
        ...indicatorProps,
        ref: forwardedRef,
        style: { pointerEvents: "none", ...props.style }
      }
    ) });
  }
);
CheckboxIndicator.displayName = INDICATOR_NAME;
var BubbleInput = (props) => {
  const { control, checked, bubbles = true, ...inputProps } = props;
  const ref = reactExports.useRef(null);
  const prevChecked = usePrevious(checked);
  const controlSize = useSize(control);
  reactExports.useEffect(() => {
    const input = ref.current;
    const inputProto = window.HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(inputProto, "checked");
    const setChecked = descriptor.set;
    if (prevChecked !== checked && setChecked) {
      const event = new Event("click", { bubbles });
      input.indeterminate = isIndeterminate(checked);
      setChecked.call(input, isIndeterminate(checked) ? false : checked);
      input.dispatchEvent(event);
    }
  }, [prevChecked, checked, bubbles]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "input",
    {
      type: "checkbox",
      "aria-hidden": true,
      defaultChecked: isIndeterminate(checked) ? false : checked,
      ...inputProps,
      tabIndex: -1,
      ref,
      style: {
        ...props.style,
        ...controlSize,
        position: "absolute",
        pointerEvents: "none",
        opacity: 0,
        margin: 0
      }
    }
  );
};
function isIndeterminate(checked) {
  return checked === "indeterminate";
}
function getState(checked) {
  return isIndeterminate(checked) ? "indeterminate" : checked ? "checked" : "unchecked";
}
var Root = Checkbox$1;
var Indicator = CheckboxIndicator;
const Checkbox = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Root,
  {
    ref,
    className: cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-border shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-border data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Indicator,
      {
        className: cn("flex items-center justify-center text-current"),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, { className: "h-4 w-4" })
      }
    )
  }
));
Checkbox.displayName = Root.displayName;
const Textarea = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
const Field = ({
  inputProps,
  labelProps,
  errors,
  className
}) => {
  const fallbackId = reactExports.useId();
  const id = inputProps.id ?? fallbackId;
  const errorId = (errors == null ? void 0 : errors.length) ? `${id}-error` : void 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Label,
      {
        ...labelProps,
        htmlFor: id,
        className: "font-semibold text-sm text-secondary-foreground"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Input,
      {
        ...inputProps,
        className: "mt-4 bg-input border-border placeholder-input-placeholder",
        id,
        "aria-invalid": errorId ? true : void 0,
        "aria-describedby": errorId
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-[32px] px-4 pb-3 pt-1", children: errorId ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorList, { id: errorId, errors }) : null })
  ] });
};
const FieldCheckbox = ({
  inputProps,
  labelProps,
  errors,
  className
}) => {
  const { key, defaultChecked, ...checkboxProps } = inputProps;
  const checkedValue = inputProps.value ?? "on";
  const input = useInputControl({
    key,
    name: inputProps.name,
    formId: inputProps.form,
    initialValue: defaultChecked ? checkedValue : void 0
  });
  const fallbackId = reactExports.useId();
  const id = inputProps.id ?? fallbackId;
  const errorId = (errors == null ? void 0 : errors.length) ? `${id}-error` : void 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: cn(
          "space-x-2 flex items-center text-foreground",
          className
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              ...checkboxProps,
              id,
              "aria-invalid": errorId ? true : void 0,
              "aria-describedby": errorId,
              checked: input.value === checkedValue,
              onCheckedChange: (state) => {
                var _a;
                input.change(state.valueOf() ? checkedValue : "");
                (_a = inputProps.onCheckedChange) == null ? void 0 : _a.call(inputProps, state);
              },
              onFocus: (event) => {
                var _a;
                input.focus();
                (_a = inputProps.onFocus) == null ? void 0 : _a.call(inputProps, event);
              },
              onBlur: (event) => {
                var _a;
                input.blur();
                (_a = inputProps.onBlur) == null ? void 0 : _a.call(inputProps, event);
              },
              type: "button"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { ...labelProps, htmlFor: id })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-[32px] px-4 pb-3 pt-1", children: errorId ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorList, { id: errorId, errors }) : null })
  ] });
};
function ErrorList({
  id,
  errors
}) {
  const errorsToRender = errors == null ? void 0 : errors.filter(Boolean);
  if (!(errorsToRender == null ? void 0 : errorsToRender.length)) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { id, className: "flex flex-col gap-1", children: errorsToRender.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-[12px] text-destructive-foreground", children: e }, e)) });
}
function useFeatureFlag(featureName) {
  var _a;
  const portalMeta = usePortalMeta();
  return ((_a = portalMeta == null ? void 0 : portalMeta.feature_flags) == null ? void 0 : _a[featureName.toUpperCase()]) ?? false;
}
export {
  Content as C,
  Description as D,
  ErrorList as E,
  Field as F,
  Input as I,
  LumeLogo as L,
  Overlay as O,
  Portal as P,
  Root$2 as R,
  Sheet as S,
  Title as T,
  Close as a,
  Checkbox as b,
  Textarea as c,
  FieldCheckbox as d,
  SheetTrigger as e,
  SheetContent as f,
  SheetHeader as g,
  SheetTitle as h,
  discordLogoPng as i,
  Root$1 as j,
  usePrevious as k,
  lumeColorLogoPng as l,
  SheetDescription as m,
  useFeatureFlag as u
};
