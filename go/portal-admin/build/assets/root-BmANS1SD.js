import { u as useLocation, d as useMatches, r as reactExports, j as jsxRuntimeExports, e as useNavigate, f as useParams, R as React, O as Outlet } from "./index-C3JligFb.js";
import { G, R as Rt, q as qo, i as ic } from "./index-C2KIIWov.js";
import { c as createContextScope, u as useComposedRefs, P as Primitive, a as useControllableState, b as Presence, d as useCallbackRef, e as composeEventHandlers, f as useLayoutEffect2, g as dispatchDiscreteCustomEvent, h as cn, C as Cross2Icon, i as cva, j as createLucideIcon, k as useBaseStore } from "./createLucideIcon-BCL4v026.js";
import { h as useRemixContext, j as useScrollRestoration, _ as _extends, r as reactDomExports, L as Link, M as Meta, k as Links, S as Scripts } from "./components-Dv2u7XfC.js";
import { c as createCollection, B as Branch, V as VisuallyHidden, R as Root$1, P as Portal, A as AccountError, a as axios, C as ClockIcon, w as withTheme, u as useSdk } from "./useTheme-BwPuTtGa.js";
import { S as Skeleton } from "./skeleton-DWR3wprT.js";
import { u as useProtocolDomain } from "./useProtocolDomain-CjDCIJH5.js";
/**
 * @remix-run/react v2.10.3
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
let STORAGE_KEY = "positions";
function ScrollRestoration({
  getKey,
  ...props
}) {
  let {
    isSpaMode
  } = useRemixContext();
  let location = useLocation();
  let matches = useMatches();
  useScrollRestoration({
    getKey,
    storageKey: STORAGE_KEY
  });
  let key = reactExports.useMemo(
    () => {
      if (!getKey) return null;
      let userKey = getKey(location, matches);
      return userKey !== location.key ? userKey : null;
    },
    // Nah, we only need this the first time for the SSR render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  if (isSpaMode) {
    return null;
  }
  let restoreScroll = ((STORAGE_KEY2, restoreKey) => {
    if (!window.history.state || !window.history.state.key) {
      let key2 = Math.random().toString(32).slice(2);
      window.history.replaceState({
        key: key2
      }, "");
    }
    try {
      let positions = JSON.parse(sessionStorage.getItem(STORAGE_KEY2) || "{}");
      let storedY = positions[restoreKey || window.history.state.key];
      if (typeof storedY === "number") {
        window.scrollTo(0, storedY);
      }
    } catch (error) {
      console.error(error);
      sessionStorage.removeItem(STORAGE_KEY2);
    }
  }).toString();
  return /* @__PURE__ */ reactExports.createElement("script", _extends({}, props, {
    suppressHydrationWarning: true,
    dangerouslySetInnerHTML: {
      __html: `(${restoreScroll})(${JSON.stringify(STORAGE_KEY)}, ${JSON.stringify(key)})`
    }
  }));
}
const stylesheet = "/assets/tailwind-DDLNfSv4.css";
var PROVIDER_NAME = "ToastProvider";
var [Collection, useCollection, createCollectionScope] = createCollection("Toast");
var [createToastContext, createToastScope] = createContextScope("Toast", [createCollectionScope]);
var [ToastProviderProvider, useToastProviderContext] = createToastContext(PROVIDER_NAME);
var ToastProvider$1 = (props) => {
  const {
    __scopeToast,
    label = "Notification",
    duration = 5e3,
    swipeDirection = "right",
    swipeThreshold = 50,
    children
  } = props;
  const [viewport, setViewport] = reactExports.useState(null);
  const [toastCount, setToastCount] = reactExports.useState(0);
  const isFocusedToastEscapeKeyDownRef = reactExports.useRef(false);
  const isClosePausedRef = reactExports.useRef(false);
  if (!label.trim()) {
    console.error(
      `Invalid prop \`label\` supplied to \`${PROVIDER_NAME}\`. Expected non-empty \`string\`.`
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Provider, { scope: __scopeToast, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    ToastProviderProvider,
    {
      scope: __scopeToast,
      label,
      duration,
      swipeDirection,
      swipeThreshold,
      toastCount,
      viewport,
      onViewportChange: setViewport,
      onToastAdd: reactExports.useCallback(() => setToastCount((prevCount) => prevCount + 1), []),
      onToastRemove: reactExports.useCallback(() => setToastCount((prevCount) => prevCount - 1), []),
      isFocusedToastEscapeKeyDownRef,
      isClosePausedRef,
      children
    }
  ) });
};
ToastProvider$1.displayName = PROVIDER_NAME;
var VIEWPORT_NAME = "ToastViewport";
var VIEWPORT_DEFAULT_HOTKEY = ["F8"];
var VIEWPORT_PAUSE = "toast.viewportPause";
var VIEWPORT_RESUME = "toast.viewportResume";
var ToastViewport$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeToast,
      hotkey = VIEWPORT_DEFAULT_HOTKEY,
      label = "Notifications ({hotkey})",
      ...viewportProps
    } = props;
    const context = useToastProviderContext(VIEWPORT_NAME, __scopeToast);
    const getItems = useCollection(__scopeToast);
    const wrapperRef = reactExports.useRef(null);
    const headFocusProxyRef = reactExports.useRef(null);
    const tailFocusProxyRef = reactExports.useRef(null);
    const ref = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref, context.onViewportChange);
    const hotkeyLabel = hotkey.join("+").replace(/Key/g, "").replace(/Digit/g, "");
    const hasToasts = context.toastCount > 0;
    reactExports.useEffect(() => {
      const handleKeyDown = (event) => {
        var _a;
        const isHotkeyPressed = hotkey.every((key) => event[key] || event.code === key);
        if (isHotkeyPressed) (_a = ref.current) == null ? void 0 : _a.focus();
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [hotkey]);
    reactExports.useEffect(() => {
      const wrapper = wrapperRef.current;
      const viewport = ref.current;
      if (hasToasts && wrapper && viewport) {
        const handlePause = () => {
          if (!context.isClosePausedRef.current) {
            const pauseEvent = new CustomEvent(VIEWPORT_PAUSE);
            viewport.dispatchEvent(pauseEvent);
            context.isClosePausedRef.current = true;
          }
        };
        const handleResume = () => {
          if (context.isClosePausedRef.current) {
            const resumeEvent = new CustomEvent(VIEWPORT_RESUME);
            viewport.dispatchEvent(resumeEvent);
            context.isClosePausedRef.current = false;
          }
        };
        const handleFocusOutResume = (event) => {
          const isFocusMovingOutside = !wrapper.contains(event.relatedTarget);
          if (isFocusMovingOutside) handleResume();
        };
        const handlePointerLeaveResume = () => {
          const isFocusInside = wrapper.contains(document.activeElement);
          if (!isFocusInside) handleResume();
        };
        wrapper.addEventListener("focusin", handlePause);
        wrapper.addEventListener("focusout", handleFocusOutResume);
        wrapper.addEventListener("pointermove", handlePause);
        wrapper.addEventListener("pointerleave", handlePointerLeaveResume);
        window.addEventListener("blur", handlePause);
        window.addEventListener("focus", handleResume);
        return () => {
          wrapper.removeEventListener("focusin", handlePause);
          wrapper.removeEventListener("focusout", handleFocusOutResume);
          wrapper.removeEventListener("pointermove", handlePause);
          wrapper.removeEventListener("pointerleave", handlePointerLeaveResume);
          window.removeEventListener("blur", handlePause);
          window.removeEventListener("focus", handleResume);
        };
      }
    }, [hasToasts, context.isClosePausedRef]);
    const getSortedTabbableCandidates = reactExports.useCallback(
      ({ tabbingDirection }) => {
        const toastItems = getItems();
        const tabbableCandidates = toastItems.map((toastItem) => {
          const toastNode = toastItem.ref.current;
          const toastTabbableCandidates = [toastNode, ...getTabbableCandidates(toastNode)];
          return tabbingDirection === "forwards" ? toastTabbableCandidates : toastTabbableCandidates.reverse();
        });
        return (tabbingDirection === "forwards" ? tabbableCandidates.reverse() : tabbableCandidates).flat();
      },
      [getItems]
    );
    reactExports.useEffect(() => {
      const viewport = ref.current;
      if (viewport) {
        const handleKeyDown = (event) => {
          var _a, _b, _c;
          const isMetaKey = event.altKey || event.ctrlKey || event.metaKey;
          const isTabKey = event.key === "Tab" && !isMetaKey;
          if (isTabKey) {
            const focusedElement = document.activeElement;
            const isTabbingBackwards = event.shiftKey;
            const targetIsViewport = event.target === viewport;
            if (targetIsViewport && isTabbingBackwards) {
              (_a = headFocusProxyRef.current) == null ? void 0 : _a.focus();
              return;
            }
            const tabbingDirection = isTabbingBackwards ? "backwards" : "forwards";
            const sortedCandidates = getSortedTabbableCandidates({ tabbingDirection });
            const index = sortedCandidates.findIndex((candidate) => candidate === focusedElement);
            if (focusFirst(sortedCandidates.slice(index + 1))) {
              event.preventDefault();
            } else {
              isTabbingBackwards ? (_b = headFocusProxyRef.current) == null ? void 0 : _b.focus() : (_c = tailFocusProxyRef.current) == null ? void 0 : _c.focus();
            }
          }
        };
        viewport.addEventListener("keydown", handleKeyDown);
        return () => viewport.removeEventListener("keydown", handleKeyDown);
      }
    }, [getItems, getSortedTabbableCandidates]);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Branch,
      {
        ref: wrapperRef,
        role: "region",
        "aria-label": label.replace("{hotkey}", hotkeyLabel),
        tabIndex: -1,
        style: { pointerEvents: hasToasts ? void 0 : "none" },
        children: [
          hasToasts && /* @__PURE__ */ jsxRuntimeExports.jsx(
            FocusProxy,
            {
              ref: headFocusProxyRef,
              onFocusFromOutsideViewport: () => {
                const tabbableCandidates = getSortedTabbableCandidates({
                  tabbingDirection: "forwards"
                });
                focusFirst(tabbableCandidates);
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Slot, { scope: __scopeToast, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.ol, { tabIndex: -1, ...viewportProps, ref: composedRefs }) }),
          hasToasts && /* @__PURE__ */ jsxRuntimeExports.jsx(
            FocusProxy,
            {
              ref: tailFocusProxyRef,
              onFocusFromOutsideViewport: () => {
                const tabbableCandidates = getSortedTabbableCandidates({
                  tabbingDirection: "backwards"
                });
                focusFirst(tabbableCandidates);
              }
            }
          )
        ]
      }
    );
  }
);
ToastViewport$1.displayName = VIEWPORT_NAME;
var FOCUS_PROXY_NAME = "ToastFocusProxy";
var FocusProxy = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeToast, onFocusFromOutsideViewport, ...proxyProps } = props;
    const context = useToastProviderContext(FOCUS_PROXY_NAME, __scopeToast);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      VisuallyHidden,
      {
        "aria-hidden": true,
        tabIndex: 0,
        ...proxyProps,
        ref: forwardedRef,
        style: { position: "fixed" },
        onFocus: (event) => {
          var _a;
          const prevFocusedElement = event.relatedTarget;
          const isFocusFromOutsideViewport = !((_a = context.viewport) == null ? void 0 : _a.contains(prevFocusedElement));
          if (isFocusFromOutsideViewport) onFocusFromOutsideViewport();
        }
      }
    );
  }
);
FocusProxy.displayName = FOCUS_PROXY_NAME;
var TOAST_NAME = "Toast";
var TOAST_SWIPE_START = "toast.swipeStart";
var TOAST_SWIPE_MOVE = "toast.swipeMove";
var TOAST_SWIPE_CANCEL = "toast.swipeCancel";
var TOAST_SWIPE_END = "toast.swipeEnd";
var Toast$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { forceMount, open: openProp, defaultOpen, onOpenChange, ...toastProps } = props;
    const [open = true, setOpen] = useControllableState({
      prop: openProp,
      defaultProp: defaultOpen,
      onChange: onOpenChange
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || open, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      ToastImpl,
      {
        open,
        ...toastProps,
        ref: forwardedRef,
        onClose: () => setOpen(false),
        onPause: useCallbackRef(props.onPause),
        onResume: useCallbackRef(props.onResume),
        onSwipeStart: composeEventHandlers(props.onSwipeStart, (event) => {
          event.currentTarget.setAttribute("data-swipe", "start");
        }),
        onSwipeMove: composeEventHandlers(props.onSwipeMove, (event) => {
          const { x: x2, y } = event.detail.delta;
          event.currentTarget.setAttribute("data-swipe", "move");
          event.currentTarget.style.setProperty("--radix-toast-swipe-move-x", `${x2}px`);
          event.currentTarget.style.setProperty("--radix-toast-swipe-move-y", `${y}px`);
        }),
        onSwipeCancel: composeEventHandlers(props.onSwipeCancel, (event) => {
          event.currentTarget.setAttribute("data-swipe", "cancel");
          event.currentTarget.style.removeProperty("--radix-toast-swipe-move-x");
          event.currentTarget.style.removeProperty("--radix-toast-swipe-move-y");
          event.currentTarget.style.removeProperty("--radix-toast-swipe-end-x");
          event.currentTarget.style.removeProperty("--radix-toast-swipe-end-y");
        }),
        onSwipeEnd: composeEventHandlers(props.onSwipeEnd, (event) => {
          const { x: x2, y } = event.detail.delta;
          event.currentTarget.setAttribute("data-swipe", "end");
          event.currentTarget.style.removeProperty("--radix-toast-swipe-move-x");
          event.currentTarget.style.removeProperty("--radix-toast-swipe-move-y");
          event.currentTarget.style.setProperty("--radix-toast-swipe-end-x", `${x2}px`);
          event.currentTarget.style.setProperty("--radix-toast-swipe-end-y", `${y}px`);
          setOpen(false);
        })
      }
    ) });
  }
);
Toast$1.displayName = TOAST_NAME;
var [ToastInteractiveProvider, useToastInteractiveContext] = createToastContext(TOAST_NAME, {
  onClose() {
  }
});
var ToastImpl = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeToast,
      type = "foreground",
      duration: durationProp,
      open,
      onClose,
      onEscapeKeyDown,
      onPause,
      onResume,
      onSwipeStart,
      onSwipeMove,
      onSwipeCancel,
      onSwipeEnd,
      ...toastProps
    } = props;
    const context = useToastProviderContext(TOAST_NAME, __scopeToast);
    const [node, setNode] = reactExports.useState(null);
    const composedRefs = useComposedRefs(forwardedRef, (node2) => setNode(node2));
    const pointerStartRef = reactExports.useRef(null);
    const swipeDeltaRef = reactExports.useRef(null);
    const duration = durationProp || context.duration;
    const closeTimerStartTimeRef = reactExports.useRef(0);
    const closeTimerRemainingTimeRef = reactExports.useRef(duration);
    const closeTimerRef = reactExports.useRef(0);
    const { onToastAdd, onToastRemove } = context;
    const handleClose = useCallbackRef(() => {
      var _a;
      const isFocusInToast = node == null ? void 0 : node.contains(document.activeElement);
      if (isFocusInToast) (_a = context.viewport) == null ? void 0 : _a.focus();
      onClose();
    });
    const startTimer = reactExports.useCallback(
      (duration2) => {
        if (!duration2 || duration2 === Infinity) return;
        window.clearTimeout(closeTimerRef.current);
        closeTimerStartTimeRef.current = (/* @__PURE__ */ new Date()).getTime();
        closeTimerRef.current = window.setTimeout(handleClose, duration2);
      },
      [handleClose]
    );
    reactExports.useEffect(() => {
      const viewport = context.viewport;
      if (viewport) {
        const handleResume = () => {
          startTimer(closeTimerRemainingTimeRef.current);
          onResume == null ? void 0 : onResume();
        };
        const handlePause = () => {
          const elapsedTime = (/* @__PURE__ */ new Date()).getTime() - closeTimerStartTimeRef.current;
          closeTimerRemainingTimeRef.current = closeTimerRemainingTimeRef.current - elapsedTime;
          window.clearTimeout(closeTimerRef.current);
          onPause == null ? void 0 : onPause();
        };
        viewport.addEventListener(VIEWPORT_PAUSE, handlePause);
        viewport.addEventListener(VIEWPORT_RESUME, handleResume);
        return () => {
          viewport.removeEventListener(VIEWPORT_PAUSE, handlePause);
          viewport.removeEventListener(VIEWPORT_RESUME, handleResume);
        };
      }
    }, [context.viewport, duration, onPause, onResume, startTimer]);
    reactExports.useEffect(() => {
      if (open && !context.isClosePausedRef.current) startTimer(duration);
    }, [open, duration, context.isClosePausedRef, startTimer]);
    reactExports.useEffect(() => {
      onToastAdd();
      return () => onToastRemove();
    }, [onToastAdd, onToastRemove]);
    const announceTextContent = reactExports.useMemo(() => {
      return node ? getAnnounceTextContent(node) : null;
    }, [node]);
    if (!context.viewport) return null;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      announceTextContent && /* @__PURE__ */ jsxRuntimeExports.jsx(
        ToastAnnounce,
        {
          __scopeToast,
          role: "status",
          "aria-live": type === "foreground" ? "assertive" : "polite",
          "aria-atomic": true,
          children: announceTextContent
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToastInteractiveProvider, { scope: __scopeToast, onClose: handleClose, children: reactDomExports.createPortal(
        /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.ItemSlot, { scope: __scopeToast, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Root$1,
          {
            asChild: true,
            onEscapeKeyDown: composeEventHandlers(onEscapeKeyDown, () => {
              if (!context.isFocusedToastEscapeKeyDownRef.current) handleClose();
              context.isFocusedToastEscapeKeyDownRef.current = false;
            }),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Primitive.li,
              {
                role: "status",
                "aria-live": "off",
                "aria-atomic": true,
                tabIndex: 0,
                "data-state": open ? "open" : "closed",
                "data-swipe-direction": context.swipeDirection,
                ...toastProps,
                ref: composedRefs,
                style: { userSelect: "none", touchAction: "none", ...props.style },
                onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
                  if (event.key !== "Escape") return;
                  onEscapeKeyDown == null ? void 0 : onEscapeKeyDown(event.nativeEvent);
                  if (!event.nativeEvent.defaultPrevented) {
                    context.isFocusedToastEscapeKeyDownRef.current = true;
                    handleClose();
                  }
                }),
                onPointerDown: composeEventHandlers(props.onPointerDown, (event) => {
                  if (event.button !== 0) return;
                  pointerStartRef.current = { x: event.clientX, y: event.clientY };
                }),
                onPointerMove: composeEventHandlers(props.onPointerMove, (event) => {
                  if (!pointerStartRef.current) return;
                  const x2 = event.clientX - pointerStartRef.current.x;
                  const y = event.clientY - pointerStartRef.current.y;
                  const hasSwipeMoveStarted = Boolean(swipeDeltaRef.current);
                  const isHorizontalSwipe = ["left", "right"].includes(context.swipeDirection);
                  const clamp = ["left", "up"].includes(context.swipeDirection) ? Math.min : Math.max;
                  const clampedX = isHorizontalSwipe ? clamp(0, x2) : 0;
                  const clampedY = !isHorizontalSwipe ? clamp(0, y) : 0;
                  const moveStartBuffer = event.pointerType === "touch" ? 10 : 2;
                  const delta = { x: clampedX, y: clampedY };
                  const eventDetail = { originalEvent: event, delta };
                  if (hasSwipeMoveStarted) {
                    swipeDeltaRef.current = delta;
                    handleAndDispatchCustomEvent(TOAST_SWIPE_MOVE, onSwipeMove, eventDetail, {
                      discrete: false
                    });
                  } else if (isDeltaInDirection(delta, context.swipeDirection, moveStartBuffer)) {
                    swipeDeltaRef.current = delta;
                    handleAndDispatchCustomEvent(TOAST_SWIPE_START, onSwipeStart, eventDetail, {
                      discrete: false
                    });
                    event.target.setPointerCapture(event.pointerId);
                  } else if (Math.abs(x2) > moveStartBuffer || Math.abs(y) > moveStartBuffer) {
                    pointerStartRef.current = null;
                  }
                }),
                onPointerUp: composeEventHandlers(props.onPointerUp, (event) => {
                  const delta = swipeDeltaRef.current;
                  const target = event.target;
                  if (target.hasPointerCapture(event.pointerId)) {
                    target.releasePointerCapture(event.pointerId);
                  }
                  swipeDeltaRef.current = null;
                  pointerStartRef.current = null;
                  if (delta) {
                    const toast2 = event.currentTarget;
                    const eventDetail = { originalEvent: event, delta };
                    if (isDeltaInDirection(delta, context.swipeDirection, context.swipeThreshold)) {
                      handleAndDispatchCustomEvent(TOAST_SWIPE_END, onSwipeEnd, eventDetail, {
                        discrete: true
                      });
                    } else {
                      handleAndDispatchCustomEvent(
                        TOAST_SWIPE_CANCEL,
                        onSwipeCancel,
                        eventDetail,
                        {
                          discrete: true
                        }
                      );
                    }
                    toast2.addEventListener("click", (event2) => event2.preventDefault(), {
                      once: true
                    });
                  }
                })
              }
            )
          }
        ) }),
        context.viewport
      ) })
    ] });
  }
);
var ToastAnnounce = (props) => {
  const { __scopeToast, children, ...announceProps } = props;
  const context = useToastProviderContext(TOAST_NAME, __scopeToast);
  const [renderAnnounceText, setRenderAnnounceText] = reactExports.useState(false);
  const [isAnnounced, setIsAnnounced] = reactExports.useState(false);
  useNextFrame(() => setRenderAnnounceText(true));
  reactExports.useEffect(() => {
    const timer = window.setTimeout(() => setIsAnnounced(true), 1e3);
    return () => window.clearTimeout(timer);
  }, []);
  return isAnnounced ? null : /* @__PURE__ */ jsxRuntimeExports.jsx(Portal, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(VisuallyHidden, { ...announceProps, children: renderAnnounceText && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    context.label,
    " ",
    children
  ] }) }) });
};
var TITLE_NAME = "ToastTitle";
var ToastTitle$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeToast, ...titleProps } = props;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.div, { ...titleProps, ref: forwardedRef });
  }
);
ToastTitle$1.displayName = TITLE_NAME;
var DESCRIPTION_NAME = "ToastDescription";
var ToastDescription$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeToast, ...descriptionProps } = props;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.div, { ...descriptionProps, ref: forwardedRef });
  }
);
ToastDescription$1.displayName = DESCRIPTION_NAME;
var ACTION_NAME = "ToastAction";
var ToastAction$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { altText, ...actionProps } = props;
    if (!altText.trim()) {
      console.error(
        `Invalid prop \`altText\` supplied to \`${ACTION_NAME}\`. Expected non-empty \`string\`.`
      );
      return null;
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ToastAnnounceExclude, { altText, asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ToastClose$1, { ...actionProps, ref: forwardedRef }) });
  }
);
ToastAction$1.displayName = ACTION_NAME;
var CLOSE_NAME = "ToastClose";
var ToastClose$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeToast, ...closeProps } = props;
    const interactiveContext = useToastInteractiveContext(CLOSE_NAME, __scopeToast);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ToastAnnounceExclude, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        type: "button",
        ...closeProps,
        ref: forwardedRef,
        onClick: composeEventHandlers(props.onClick, interactiveContext.onClose)
      }
    ) });
  }
);
ToastClose$1.displayName = CLOSE_NAME;
var ToastAnnounceExclude = reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeToast, altText, ...announceExcludeProps } = props;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Primitive.div,
    {
      "data-radix-toast-announce-exclude": "",
      "data-radix-toast-announce-alt": altText || void 0,
      ...announceExcludeProps,
      ref: forwardedRef
    }
  );
});
function getAnnounceTextContent(container) {
  const textContent = [];
  const childNodes = Array.from(container.childNodes);
  childNodes.forEach((node) => {
    if (node.nodeType === node.TEXT_NODE && node.textContent) textContent.push(node.textContent);
    if (isHTMLElement(node)) {
      const isHidden = node.ariaHidden || node.hidden || node.style.display === "none";
      const isExcluded = node.dataset.radixToastAnnounceExclude === "";
      if (!isHidden) {
        if (isExcluded) {
          const altText = node.dataset.radixToastAnnounceAlt;
          if (altText) textContent.push(altText);
        } else {
          textContent.push(...getAnnounceTextContent(node));
        }
      }
    }
  });
  return textContent;
}
function handleAndDispatchCustomEvent(name, handler, detail, { discrete }) {
  const currentTarget = detail.originalEvent.currentTarget;
  const event = new CustomEvent(name, { bubbles: true, cancelable: true, detail });
  if (handler) currentTarget.addEventListener(name, handler, { once: true });
  if (discrete) {
    dispatchDiscreteCustomEvent(currentTarget, event);
  } else {
    currentTarget.dispatchEvent(event);
  }
}
var isDeltaInDirection = (delta, direction, threshold = 0) => {
  const deltaX = Math.abs(delta.x);
  const deltaY = Math.abs(delta.y);
  const isDeltaX = deltaX > deltaY;
  if (direction === "left" || direction === "right") {
    return isDeltaX && deltaX > threshold;
  } else {
    return !isDeltaX && deltaY > threshold;
  }
};
function useNextFrame(callback = () => {
}) {
  const fn = useCallbackRef(callback);
  useLayoutEffect2(() => {
    let raf1 = 0;
    let raf2 = 0;
    raf1 = window.requestAnimationFrame(() => raf2 = window.requestAnimationFrame(fn));
    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
    };
  }, [fn]);
}
function isHTMLElement(node) {
  return node.nodeType === node.ELEMENT_NODE;
}
function getTabbableCandidates(container) {
  const nodes = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => {
      const isHiddenInput = node.tagName === "INPUT" && node.type === "hidden";
      if (node.disabled || node.hidden || isHiddenInput) return NodeFilter.FILTER_SKIP;
      return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}
function focusFirst(candidates) {
  const previouslyFocusedElement = document.activeElement;
  return candidates.some((candidate) => {
    if (candidate === previouslyFocusedElement) return true;
    candidate.focus();
    return document.activeElement !== previouslyFocusedElement;
  });
}
var Provider = ToastProvider$1;
var Viewport = ToastViewport$1;
var Root2 = Toast$1;
var Title = ToastTitle$1;
var Description = ToastDescription$1;
var Action = ToastAction$1;
var Close = ToastClose$1;
const ToastProvider = Provider;
const ToastViewport = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Viewport,
  {
    ref,
    className: cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    ),
    ...props
  }
));
ToastViewport.displayName = Viewport.displayName;
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive: "destructive group border-destructive bg-destructive text-destructive-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
const Toast = reactExports.forwardRef(({ className, variant, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Root2,
    {
      ref,
      className: cn(toastVariants({ variant }), className),
      ...props
    }
  );
});
Toast.displayName = Root2.displayName;
const ToastAction = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Action,
  {
    ref,
    className: cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    ),
    ...props
  }
));
ToastAction.displayName = Action.displayName;
const ToastClose = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Close,
  {
    ref,
    className: cn(
      "absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    ),
    "toast-close": "",
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Cross2Icon, { className: "h-4 w-4" })
  }
));
ToastClose.displayName = Close.displayName;
const ToastTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Title,
  {
    ref,
    className: cn("text-sm font-semibold [&+div]:text-xs", className),
    ...props
  }
));
ToastTitle.displayName = Title.displayName;
const ToastDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Description,
  {
    ref,
    className: cn("text-sm opacity-90", className),
    ...props
  }
));
ToastDescription.displayName = Description.displayName;
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1e6;
let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}
const toastTimeouts = /* @__PURE__ */ new Map();
const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId
    });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(toastId, timeout);
};
const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
      };
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map(
          (t) => t.id === action.toast.id ? { ...t, ...action.toast } : t
        )
      };
    case "DISMISS_TOAST": {
      const { toastId } = action;
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast2) => {
          addToRemoveQueue(toast2.id);
        });
      }
      return {
        ...state,
        toasts: state.toasts.map(
          (t) => t.id === toastId || toastId === void 0 ? {
            ...t,
            open: false
          } : t
        )
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === void 0) {
        return {
          ...state,
          toasts: []
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId)
      };
  }
};
const listeners = [];
let memoryState = { toasts: [] };
function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}
function toast({ ...props }) {
  const id = genId();
  const update = (props2) => dispatch({
    type: "UPDATE_TOAST",
    toast: { ...props2, id }
  });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      }
    }
  });
  return {
    id,
    dismiss,
    update
  };
}
function useToast() {
  const [state, setState] = reactExports.useState(memoryState);
  reactExports.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);
  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId })
  };
}
function Toaster() {
  const { toasts } = useToast();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(ToastProvider, { children: [
    toasts.map(
      ({ id, title, description, action, cancelMutation, ...props }) => {
        const undoButton = cancelMutation ? /* @__PURE__ */ jsxRuntimeExports.jsx(ToastAction, { altText: "Undo", onClick: cancelMutation, children: "Undo" }) : void 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Toast, { ...props, variant: "default", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1", children: [
            title && /* @__PURE__ */ jsxRuntimeExports.jsx(ToastTitle, { children: title }),
            description && /* @__PURE__ */ jsxRuntimeExports.jsx(ToastDescription, { children: description })
          ] }),
          action,
          undoButton,
          /* @__PURE__ */ jsxRuntimeExports.jsx(ToastClose, {})
        ] }, id);
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ToastViewport, {})
  ] });
}
var g$1 = (e, r) => {
  let t = {}, a = r.replace(/^\/|\/$/g, ""), n = e.replace(/^\/|\/$/g, ""), o = a.split("/"), u = n.split("/");
  return o.forEach((i, s) => {
    var p;
    i.startsWith(":") && ((p = u[s]) == null ? void 0 : p.length) > 0 && (t[i.replace(":", "")] = u[s]);
  }), t;
};
var h$1 = (e) => {
  if (typeof e > "u") return e;
  let r = Number(e);
  return `${r}` === e ? r : e;
};
var x = { addQueryPrefix: true, skipNulls: true, arrayFormat: "indices", encode: false, encodeValuesOnly: true }, E = { go: () => {
  let { search: e, hash: r } = useLocation(), t = useNavigate();
  return reactExports.useCallback(({ to: n, type: o, query: u, hash: i, options: { keepQuery: s, keepHash: p } = {} }) => {
    let c = { ...s && e && G.parse(e, { ignoreQueryPrefix: true }), ...u };
    c.to && (c.to = encodeURIComponent(`${c.to}`));
    let f2 = Object.keys(c).length > 0, l = `#${(i || p && r || "").replace(/^#/, "")}`, T = l.length > 1, C = `${n || ""}${f2 ? G.stringify(c, x) : ""}${T ? l : ""}`;
    return o === "path" ? C : t(C, { replace: o === "replace" });
  }, [r, e, t]);
}, back: () => {
  let e = useNavigate();
  return () => {
    e(-1);
  };
}, parse: () => {
  let e = useParams(), { pathname: r, search: t } = useLocation(), { resources: a } = reactExports.useContext(Rt), { resource: n, action: o, matchedRoute: u } = React.useMemo(() => qo(r, a), [a, r]), i = u && r ? g$1(r, u) : {}, s = i.id;
  return reactExports.useCallback(() => {
    let c = G.parse(t, { ignoreQueryPrefix: true }), f2 = { ...i, ...e, ...c };
    return { ...n && { resource: n }, ...o && { action: o }, ...s && { id: decodeURIComponent(s) }, ...(e == null ? void 0 : e.id) && { id: decodeURIComponent(e.id) }, pathname: r, params: { ...f2, current: h$1(f2.current), pageSize: h$1(f2.pageSize), to: f2.to ? decodeURIComponent(f2.to) : void 0 } };
  }, [r, t, e, n, o, i, s]);
}, Link: React.forwardRef(function(r, t) {
  return React.createElement(Link, { ...r, ref: t });
}) };
const notificationProvider = () => {
  return {
    open: ({
      key,
      message,
      description,
      undoableTimeout,
      cancelMutation,
      action,
      type
    }) => {
      toast({
        variant: type,
        key,
        title: message,
        description,
        duration: undoableTimeout,
        action,
        cancelMutation
      });
    },
    close: () => {
    }
  };
};
const createAccountProvider = (sdk, restProvider) => {
  return {
    ...restProvider,
    async update(params) {
      if (params.resource === "account") {
        if (params.variables.email && params.variables.password) {
          const ret = await (sdk == null ? void 0 : sdk.account().updateEmail(params.variables.email, params.variables.password));
          if (ret instanceof Error) {
            return Promise.reject(ret);
          }
          return {
            data: {
              email: params.variables.email
            }
          };
        }
        return {
          data: {}
        };
      }
      return restProvider.update(params);
    },
    async deleteOne(params) {
      if (params.resource === "account") {
        const ret = await (sdk == null ? void 0 : sdk.account().requestAccountDeletion());
        if (ret instanceof Error) {
          return Promise.reject(ret);
        }
        return {
          data: {}
        };
      }
      return restProvider.deleteOne(params);
    },
    getApiUrl: () => sdk.account().apiUrl,
    custom: async (params) => {
      const { url, method, payload, headers } = params;
      if (url.includes("/subscription") || url.includes("/otp") || url.includes("/usage") || url.includes("/key")) {
        return restProvider.custom({
          url,
          method,
          payload,
          headers: {
            Authorization: `Bearer ${sdk.account().jwtToken}`,
            ...headers
          }
        });
      }
      throw new Error("Unsupported custom operation");
    }
  };
};
const maybeSetupAuth = (sdk) => {
  let jwt = sdk.account().jwtToken;
  if (jwt) {
    sdk.setAuthToken(jwt);
  }
};
const handleResponse = (result) => {
  var _a;
  if (result.ret instanceof AccountError) {
    return {
      success: false,
      error: result.ret,
      redirectTo: result.redirectToError
    };
  }
  if (result.ret) {
    (_a = result.successCb) == null ? void 0 : _a.call(result);
    return {
      success: true,
      successNotification: result.successNotification,
      redirectTo: result.redirectToSuccess
    };
  }
  return {
    success: false,
    redirectTo: result.redirectToError
  };
};
const handleCheckResponse = (result) => {
  const response = handleResponse(result);
  const success = response.success;
  delete response.success;
  return {
    ...response,
    authenticated: success
  };
};
const createPortalAuthProvider = (sdk) => {
  return {
    async login(params) {
      try {
        if ("otp" in params) {
          const response = await sdk.account().validateOtp({ otp: params.otp });
          if (response == null ? void 0 : response.token) {
            sdk.setAuthToken(response.token);
            return handleResponse({
              ret: true,
              redirectToSuccess: params.redirectTo ?? "/dashboard",
              successCb: () => {
                sdk.setAuthToken(response.token);
              },
              successNotification: {
                message: "Login Successful",
                description: "You have successfully logged in with 2FA."
              }
            });
          } else {
            return handleResponse({
              ret: new AccountError("Invalid OTP", 400),
              redirectToError: "/otp"
            });
          }
        } else {
          const response = await sdk.account().login(params);
          const loginResponse = response;
          if (response instanceof AccountError) {
            return handleResponse({
              ret: loginResponse
            });
          }
          if (loginResponse.otp) {
            return handleResponse({
              ret: true,
              redirectToSuccess: `/otp?to=${encodeURIComponent(params.redirectTo ?? "/dashboard")}`,
              successNotification: {
                message: "Two-Factor Authentication Required",
                description: "Please enter your 2FA code to complete login."
              }
            });
          } else {
            sdk.setAuthToken(loginResponse.token);
            return handleResponse({
              ret: true,
              redirectToSuccess: params.redirectTo ?? "/dashboard",
              successCb: () => {
                sdk.setAuthToken(loginResponse.token);
              },
              successNotification: {
                message: "Login Successful",
                description: "You have successfully logged in."
              }
            });
          }
        }
      } catch (error) {
        return handleResponse({
          ret: error,
          redirectToError: "/login"
        });
      }
    },
    async logout() {
      const ret = await sdk.account().logout();
      if (ret && false) {
        localStorage.removeItem("jwt");
      }
      return handleResponse({ ret, redirectToSuccess: "/login" });
    },
    async check() {
      maybeSetupAuth(sdk);
      const ret = await sdk.account().ping();
      maybeSetupAuth(sdk);
      return handleCheckResponse({
        ret,
        redirectToError: "/login",
        successCb: () => maybeSetupAuth(sdk)
      });
    },
    async onError() {
      return {};
    },
    async register(params) {
      const ret = await sdk.account().register({
        email: params.email,
        password: params.password,
        first_name: params.firstName,
        last_name: params.lastName
      });
      return handleResponse({
        ret,
        redirectToSuccess: "/login",
        successNotification: {
          message: "Registration Successful",
          description: "You have successfully registered. Please check your email to verify your account."
        }
      });
    },
    async forgotPassword(params) {
      try {
        let ret;
        if (params && params.password) {
          ret = await sdk.account().confirmPasswordReset({
            token: params.token,
            password: params.password,
            email: params.email
          });
          return handleResponse({
            ret,
            successNotification: {
              message: "Password Reset Successful",
              description: "Your password has been successfully reset. You can now log in with your new password."
            }
          });
        } else {
          ret = await sdk.account().requestPasswordReset({ email: params.email });
          return handleResponse({
            ret,
            successNotification: {
              message: "Password Reset Requested",
              description: "If an account exists for this email, you will receive password reset instructions. If it doesn't appear within a few minutes, check your spam folder."
            }
          });
        }
      } catch (error) {
        return handleResponse({
          ret: error
        });
      }
    },
    async updatePassword(params) {
      maybeSetupAuth(sdk);
      const ret = await sdk.account().updatePassword(params.currentPassword, params.password);
      return handleResponse({
        ret,
        successNotification: {
          message: "Password Updated",
          description: "Your password has been updated successfully."
        }
      });
    },
    async getPermissions() {
      return { success: true };
    },
    async getIdentity() {
      maybeSetupAuth(sdk);
      const ret = await sdk.account().info();
      if (!ret) {
        return { identity: null };
      }
      const acct = ret;
      return {
        id: acct.id,
        firstName: acct.first_name,
        lastName: acct.last_name,
        email: acct.email,
        verified: acct.verified,
        otp: acct.otp
      };
    }
  };
};
function areInputsEqual(newInputs, lastInputs) {
  if (newInputs.length !== lastInputs.length) {
    return false;
  }
  for (var i = 0; i < newInputs.length; i++) {
    if (newInputs[i] !== lastInputs[i]) {
      return false;
    }
  }
  return true;
}
function useMemoOne(getResult, inputs) {
  var initial = reactExports.useState(function() {
    return {
      inputs,
      result: getResult()
    };
  })[0];
  var isFirstRun = reactExports.useRef(true);
  var committed = reactExports.useRef(initial);
  var useCache = isFirstRun.current || Boolean(inputs && committed.current.inputs && areInputsEqual(inputs, committed.current.inputs));
  var cache = useCache ? committed.current : {
    inputs,
    result: getResult()
  };
  reactExports.useEffect(function() {
    isFirstRun.current = false;
    committed.current = cache;
  }, [cache]);
  return cache.result;
}
function useCallbackOne(callback, inputs) {
  return useMemoOne(function() {
    return callback;
  }, inputs);
}
var useMemo = useMemoOne;
var useCallback = useCallbackOne;
function useAuthProvider(sdk) {
  return useMemo(() => {
    if (!sdk) return void 0;
    return createPortalAuthProvider(sdk);
  }, [sdk]);
}
var queryString = {};
var strictUriEncode = (str) => encodeURIComponent(str).replace(/[!'()*]/g, (x2) => `%${x2.charCodeAt(0).toString(16).toUpperCase()}`);
var token = "%[a-f0-9]{2}";
var singleMatcher = new RegExp("(" + token + ")|([^%]+?)", "gi");
var multiMatcher = new RegExp("(" + token + ")+", "gi");
function decodeComponents(components, split) {
  try {
    return [decodeURIComponent(components.join(""))];
  } catch (err) {
  }
  if (components.length === 1) {
    return components;
  }
  split = split || 1;
  var left = components.slice(0, split);
  var right = components.slice(split);
  return Array.prototype.concat.call([], decodeComponents(left), decodeComponents(right));
}
function decode(input) {
  try {
    return decodeURIComponent(input);
  } catch (err) {
    var tokens = input.match(singleMatcher) || [];
    for (var i = 1; i < tokens.length; i++) {
      input = decodeComponents(tokens, i).join("");
      tokens = input.match(singleMatcher) || [];
    }
    return input;
  }
}
function customDecodeURIComponent(input) {
  var replaceMap = {
    "%FE%FF": "��",
    "%FF%FE": "��"
  };
  var match = multiMatcher.exec(input);
  while (match) {
    try {
      replaceMap[match[0]] = decodeURIComponent(match[0]);
    } catch (err) {
      var result = decode(match[0]);
      if (result !== match[0]) {
        replaceMap[match[0]] = result;
      }
    }
    match = multiMatcher.exec(input);
  }
  replaceMap["%C2"] = "�";
  var entries = Object.keys(replaceMap);
  for (var i = 0; i < entries.length; i++) {
    var key = entries[i];
    input = input.replace(new RegExp(key, "g"), replaceMap[key]);
  }
  return input;
}
var decodeUriComponent = function(encodedURI) {
  if (typeof encodedURI !== "string") {
    throw new TypeError("Expected `encodedURI` to be of type `string`, got `" + typeof encodedURI + "`");
  }
  try {
    encodedURI = encodedURI.replace(/\+/g, " ");
    return decodeURIComponent(encodedURI);
  } catch (err) {
    return customDecodeURIComponent(encodedURI);
  }
};
var splitOnFirst = (string, separator) => {
  if (!(typeof string === "string" && typeof separator === "string")) {
    throw new TypeError("Expected the arguments to be of type `string`");
  }
  if (separator === "") {
    return [string];
  }
  const separatorIndex = string.indexOf(separator);
  if (separatorIndex === -1) {
    return [string];
  }
  return [
    string.slice(0, separatorIndex),
    string.slice(separatorIndex + separator.length)
  ];
};
var filterObj = function(obj, predicate) {
  var ret = {};
  var keys = Object.keys(obj);
  var isArr = Array.isArray(predicate);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var val = obj[key];
    if (isArr ? predicate.indexOf(key) !== -1 : predicate(key, val, obj)) {
      ret[key] = val;
    }
  }
  return ret;
};
(function(exports) {
  const strictUriEncode$1 = strictUriEncode;
  const decodeComponent = decodeUriComponent;
  const splitOnFirst$1 = splitOnFirst;
  const filterObject = filterObj;
  const isNullOrUndefined = (value) => value === null || value === void 0;
  const encodeFragmentIdentifier = Symbol("encodeFragmentIdentifier");
  function encoderForArrayFormat(options) {
    switch (options.arrayFormat) {
      case "index":
        return (key) => (result, value) => {
          const index = result.length;
          if (value === void 0 || options.skipNull && value === null || options.skipEmptyString && value === "") {
            return result;
          }
          if (value === null) {
            return [...result, [encode(key, options), "[", index, "]"].join("")];
          }
          return [
            ...result,
            [encode(key, options), "[", encode(index, options), "]=", encode(value, options)].join("")
          ];
        };
      case "bracket":
        return (key) => (result, value) => {
          if (value === void 0 || options.skipNull && value === null || options.skipEmptyString && value === "") {
            return result;
          }
          if (value === null) {
            return [...result, [encode(key, options), "[]"].join("")];
          }
          return [...result, [encode(key, options), "[]=", encode(value, options)].join("")];
        };
      case "colon-list-separator":
        return (key) => (result, value) => {
          if (value === void 0 || options.skipNull && value === null || options.skipEmptyString && value === "") {
            return result;
          }
          if (value === null) {
            return [...result, [encode(key, options), ":list="].join("")];
          }
          return [...result, [encode(key, options), ":list=", encode(value, options)].join("")];
        };
      case "comma":
      case "separator":
      case "bracket-separator": {
        const keyValueSep = options.arrayFormat === "bracket-separator" ? "[]=" : "=";
        return (key) => (result, value) => {
          if (value === void 0 || options.skipNull && value === null || options.skipEmptyString && value === "") {
            return result;
          }
          value = value === null ? "" : value;
          if (result.length === 0) {
            return [[encode(key, options), keyValueSep, encode(value, options)].join("")];
          }
          return [[result, encode(value, options)].join(options.arrayFormatSeparator)];
        };
      }
      default:
        return (key) => (result, value) => {
          if (value === void 0 || options.skipNull && value === null || options.skipEmptyString && value === "") {
            return result;
          }
          if (value === null) {
            return [...result, encode(key, options)];
          }
          return [...result, [encode(key, options), "=", encode(value, options)].join("")];
        };
    }
  }
  function parserForArrayFormat(options) {
    let result;
    switch (options.arrayFormat) {
      case "index":
        return (key, value, accumulator) => {
          result = /\[(\d*)\]$/.exec(key);
          key = key.replace(/\[\d*\]$/, "");
          if (!result) {
            accumulator[key] = value;
            return;
          }
          if (accumulator[key] === void 0) {
            accumulator[key] = {};
          }
          accumulator[key][result[1]] = value;
        };
      case "bracket":
        return (key, value, accumulator) => {
          result = /(\[\])$/.exec(key);
          key = key.replace(/\[\]$/, "");
          if (!result) {
            accumulator[key] = value;
            return;
          }
          if (accumulator[key] === void 0) {
            accumulator[key] = [value];
            return;
          }
          accumulator[key] = [].concat(accumulator[key], value);
        };
      case "colon-list-separator":
        return (key, value, accumulator) => {
          result = /(:list)$/.exec(key);
          key = key.replace(/:list$/, "");
          if (!result) {
            accumulator[key] = value;
            return;
          }
          if (accumulator[key] === void 0) {
            accumulator[key] = [value];
            return;
          }
          accumulator[key] = [].concat(accumulator[key], value);
        };
      case "comma":
      case "separator":
        return (key, value, accumulator) => {
          const isArray = typeof value === "string" && value.includes(options.arrayFormatSeparator);
          const isEncodedArray = typeof value === "string" && !isArray && decode2(value, options).includes(options.arrayFormatSeparator);
          value = isEncodedArray ? decode2(value, options) : value;
          const newValue = isArray || isEncodedArray ? value.split(options.arrayFormatSeparator).map((item) => decode2(item, options)) : value === null ? value : decode2(value, options);
          accumulator[key] = newValue;
        };
      case "bracket-separator":
        return (key, value, accumulator) => {
          const isArray = /(\[\])$/.test(key);
          key = key.replace(/\[\]$/, "");
          if (!isArray) {
            accumulator[key] = value ? decode2(value, options) : value;
            return;
          }
          const arrayValue = value === null ? [] : value.split(options.arrayFormatSeparator).map((item) => decode2(item, options));
          if (accumulator[key] === void 0) {
            accumulator[key] = arrayValue;
            return;
          }
          accumulator[key] = [].concat(accumulator[key], arrayValue);
        };
      default:
        return (key, value, accumulator) => {
          if (accumulator[key] === void 0) {
            accumulator[key] = value;
            return;
          }
          accumulator[key] = [].concat(accumulator[key], value);
        };
    }
  }
  function validateArrayFormatSeparator(value) {
    if (typeof value !== "string" || value.length !== 1) {
      throw new TypeError("arrayFormatSeparator must be single character string");
    }
  }
  function encode(value, options) {
    if (options.encode) {
      return options.strict ? strictUriEncode$1(value) : encodeURIComponent(value);
    }
    return value;
  }
  function decode2(value, options) {
    if (options.decode) {
      return decodeComponent(value);
    }
    return value;
  }
  function keysSorter(input) {
    if (Array.isArray(input)) {
      return input.sort();
    }
    if (typeof input === "object") {
      return keysSorter(Object.keys(input)).sort((a, b) => Number(a) - Number(b)).map((key) => input[key]);
    }
    return input;
  }
  function removeHash(input) {
    const hashStart = input.indexOf("#");
    if (hashStart !== -1) {
      input = input.slice(0, hashStart);
    }
    return input;
  }
  function getHash(url) {
    let hash = "";
    const hashStart = url.indexOf("#");
    if (hashStart !== -1) {
      hash = url.slice(hashStart);
    }
    return hash;
  }
  function extract(input) {
    input = removeHash(input);
    const queryStart = input.indexOf("?");
    if (queryStart === -1) {
      return "";
    }
    return input.slice(queryStart + 1);
  }
  function parseValue(value, options) {
    if (options.parseNumbers && !Number.isNaN(Number(value)) && (typeof value === "string" && value.trim() !== "")) {
      value = Number(value);
    } else if (options.parseBooleans && value !== null && (value.toLowerCase() === "true" || value.toLowerCase() === "false")) {
      value = value.toLowerCase() === "true";
    }
    return value;
  }
  function parse(query, options) {
    options = Object.assign({
      decode: true,
      sort: true,
      arrayFormat: "none",
      arrayFormatSeparator: ",",
      parseNumbers: false,
      parseBooleans: false
    }, options);
    validateArrayFormatSeparator(options.arrayFormatSeparator);
    const formatter = parserForArrayFormat(options);
    const ret = /* @__PURE__ */ Object.create(null);
    if (typeof query !== "string") {
      return ret;
    }
    query = query.trim().replace(/^[?#&]/, "");
    if (!query) {
      return ret;
    }
    for (const param of query.split("&")) {
      if (param === "") {
        continue;
      }
      let [key, value] = splitOnFirst$1(options.decode ? param.replace(/\+/g, " ") : param, "=");
      value = value === void 0 ? null : ["comma", "separator", "bracket-separator"].includes(options.arrayFormat) ? value : decode2(value, options);
      formatter(decode2(key, options), value, ret);
    }
    for (const key of Object.keys(ret)) {
      const value = ret[key];
      if (typeof value === "object" && value !== null) {
        for (const k of Object.keys(value)) {
          value[k] = parseValue(value[k], options);
        }
      } else {
        ret[key] = parseValue(value, options);
      }
    }
    if (options.sort === false) {
      return ret;
    }
    return (options.sort === true ? Object.keys(ret).sort() : Object.keys(ret).sort(options.sort)).reduce((result, key) => {
      const value = ret[key];
      if (Boolean(value) && typeof value === "object" && !Array.isArray(value)) {
        result[key] = keysSorter(value);
      } else {
        result[key] = value;
      }
      return result;
    }, /* @__PURE__ */ Object.create(null));
  }
  exports.extract = extract;
  exports.parse = parse;
  exports.stringify = (object, options) => {
    if (!object) {
      return "";
    }
    options = Object.assign({
      encode: true,
      strict: true,
      arrayFormat: "none",
      arrayFormatSeparator: ","
    }, options);
    validateArrayFormatSeparator(options.arrayFormatSeparator);
    const shouldFilter = (key) => options.skipNull && isNullOrUndefined(object[key]) || options.skipEmptyString && object[key] === "";
    const formatter = encoderForArrayFormat(options);
    const objectCopy = {};
    for (const key of Object.keys(object)) {
      if (!shouldFilter(key)) {
        objectCopy[key] = object[key];
      }
    }
    const keys = Object.keys(objectCopy);
    if (options.sort !== false) {
      keys.sort(options.sort);
    }
    return keys.map((key) => {
      const value = object[key];
      if (value === void 0) {
        return "";
      }
      if (value === null) {
        return encode(key, options);
      }
      if (Array.isArray(value)) {
        if (value.length === 0 && options.arrayFormat === "bracket-separator") {
          return encode(key, options) + "[]";
        }
        return value.reduce(formatter(key), []).join("&");
      }
      return encode(key, options) + "=" + encode(value, options);
    }).filter((x2) => x2.length > 0).join("&");
  };
  exports.parseUrl = (url, options) => {
    options = Object.assign({
      decode: true
    }, options);
    const [url_, hash] = splitOnFirst$1(url, "#");
    return Object.assign(
      {
        url: url_.split("?")[0] || "",
        query: parse(extract(url), options)
      },
      options && options.parseFragmentIdentifier && hash ? { fragmentIdentifier: decode2(hash, options) } : {}
    );
  };
  exports.stringifyUrl = (object, options) => {
    options = Object.assign({
      encode: true,
      strict: true,
      [encodeFragmentIdentifier]: true
    }, options);
    const url = removeHash(object.url).split("?")[0] || "";
    const queryFromUrl = exports.extract(object.url);
    const parsedQueryFromUrl = exports.parse(queryFromUrl, { sort: false });
    const query = Object.assign(parsedQueryFromUrl, object.query);
    let queryString2 = exports.stringify(query, options);
    if (queryString2) {
      queryString2 = `?${queryString2}`;
    }
    let hash = getHash(object.url);
    if (object.fragmentIdentifier) {
      hash = `#${options[encodeFragmentIdentifier] ? encode(object.fragmentIdentifier, options) : object.fragmentIdentifier}`;
    }
    return `${url}${queryString2}${hash}`;
  };
  exports.pick = (input, filter, options) => {
    options = Object.assign({
      parseFragmentIdentifier: true,
      [encodeFragmentIdentifier]: false
    }, options);
    const { url, query, fragmentIdentifier } = exports.parseUrl(input, options);
    return exports.stringifyUrl({
      url,
      query: filterObject(query, filter),
      fragmentIdentifier
    }, options);
  };
  exports.exclude = (input, filter, options) => {
    const exclusionFilter = Array.isArray(filter) ? (key) => !filter.includes(key) : (key, value) => !filter(key, value);
    return exports.pick(input, exclusionFilter, options);
  };
})(queryString);
var M = (r) => {
  switch (r) {
    case "ne":
    case "gte":
    case "lte":
      return `_${r}`;
    case "contains":
      return "_like";
    default:
      return "";
  }
};
var f = (r) => {
  if (r && r.length > 0) {
    let s = [], e = [];
    return r.map((t) => {
      s.push(t.field), e.push(t.order);
    }), { _sort: s, _order: e };
  }
};
var g = (r) => {
  let s = {};
  return r && r.map((e) => {
    if (e.operator === "or" || e.operator === "and") throw new Error(`[@refinedev/simple-rest]: \`operator: ${e.operator}\` is not supported. You can create custom data provider. https://refine.dev/docs/api-reference/core/providers/data-provider/#creating-a-data-provider`);
    if ("field" in e) {
      let { field: t, operator: o, value: n } = e;
      if (t === "q") {
        s[t] = n;
        return;
      }
      let d = M(o);
      s[`${t}${d}`] = n;
    }
  }), s;
};
var h = axios.create();
h.interceptors.response.use((r) => r, (r) => {
  var e, t, o;
  let s = { ...r, message: (t = (e = r.response) == null ? void 0 : e.data) == null ? void 0 : t.message, statusCode: (o = r.response) == null ? void 0 : o.status };
  return Promise.reject(s);
});
var q = (r, s = h) => ({ getList: async ({ resource: e, pagination: t, filters: o, sorters: n, meta: d }) => {
  let i = `${r}/${e}`, { current: c = 1, pageSize: a = 10, mode: p = "server" } = t ?? {}, { headers: $, method: m } = d ?? {}, x2 = m ?? "get", v = g(o), u = {};
  p === "server" && (u._start = (c - 1) * a, u._end = c * a);
  let l = f(n);
  if (l) {
    let { _sort: T, _order: b } = l;
    u._sort = T.join(","), u._order = b.join(",");
  }
  let _ = { ...u, ...v }, O = Object.keys(_).length ? `${i}?${queryString.stringify(_)}` : i, { data: w, headers: F } = await s[x2](O, { headers: $ }), S = +F["x-total-count"];
  return { data: w, total: S || w.length };
}, getMany: async ({ resource: e, ids: t, meta: o }) => {
  let { headers: n, method: d } = o ?? {}, i = d ?? "get", { data: c } = await s[i](`${r}/${e}?${queryString.stringify({ id: t })}`, { headers: n });
  return { data: c };
}, create: async ({ resource: e, variables: t, meta: o }) => {
  let n = `${r}/${e}`, { headers: d, method: i } = o ?? {}, c = i ?? "post", { data: a } = await s[c](n, t, { headers: d });
  return { data: a };
}, update: async ({ resource: e, id: t, variables: o, meta: n }) => {
  let d = `${r}/${e}/${t}`, { headers: i, method: c } = n ?? {}, a = c ?? "patch", { data: p } = await s[a](d, o, { headers: i });
  return { data: p };
}, getOne: async ({ resource: e, id: t, meta: o }) => {
  let n = `${r}/${e}/${t}`, { headers: d, method: i } = o ?? {}, c = i ?? "get", { data: a } = await s[c](n, { headers: d });
  return { data: a };
}, deleteOne: async ({ resource: e, id: t, variables: o, meta: n }) => {
  let d = `${r}/${e}/${t}`, { headers: i, method: c } = n ?? {}, a = c ?? "delete", { data: p } = await s[a](d, { data: o, headers: i });
  return { data: p };
}, getApiUrl: () => r, custom: async ({ url: e, method: t, filters: o, sorters: n, payload: d, query: i, headers: c }) => {
  let a = `${e}?`;
  if (n) {
    let m = f(n);
    if (m) {
      let { _sort: x2, _order: v } = m, u = { _sort: x2.join(","), _order: v.join(",") };
      a = `${a}&${queryString.stringify(u)}`;
    }
  }
  if (o) {
    let m = g(o);
    a = `${a}&${queryString.stringify(m)}`;
  }
  i && (a = `${a}&${queryString.stringify(i)}`);
  let p;
  switch (t) {
    case "put":
    case "post":
    case "patch":
      p = await s[t](e, d, { headers: c });
      break;
    case "delete":
      p = await s.delete(e, { data: d, headers: c });
      break;
    default:
      p = await s.get(a, { headers: c });
      break;
  }
  let { data: $ } = p;
  return Promise.resolve({ data: $ });
} });
var N = q;
function useCheckAuth(authProvider) {
  return useCallback(async () => {
    if (!authProvider) return false;
    try {
      const ret = await authProvider.check();
      return ret.authenticated;
    } catch {
      return false;
    }
  }, [authProvider]);
}
/**
 * @license lucide-react v0.396.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const LayoutDashboard = createLucideIcon("LayoutDashboard", [
  ["rect", { width: "7", height: "9", x: "3", y: "3", rx: "1", key: "10lvy0" }],
  ["rect", { width: "7", height: "5", x: "14", y: "3", rx: "1", key: "16une8" }],
  ["rect", { width: "7", height: "9", x: "14", y: "12", rx: "1", key: "1hutg5" }],
  ["rect", { width: "7", height: "5", x: "3", y: "16", rx: "1", key: "ldoo1y" }]
]);
/**
 * @license lucide-react v0.396.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Settings = createLucideIcon("Settings", [
  [
    "path",
    {
      d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
      key: "1qme2f"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
]);
const menuConfig = [
  {
    key: "main",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/"
  },
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
    path: "/settings"
  },
  {
    key: "cron",
    label: "Cron",
    icon: ClockIcon,
    path: "/cron"
  }
];
function useAppInitialization(sdk, authProvider) {
  const [isInitialized, setIsInitialized] = reactExports.useState(false);
  const [providers, setProviders] = reactExports.useState({});
  const [resources, setResources] = reactExports.useState([]);
  const checkAuth = useCheckAuth(authProvider);
  const baseStore = useBaseStore((state) => state);
  const initializeApp = reactExports.useCallback(async () => {
    if (!sdk || !authProvider || isInitialized) return;
    const isAuth = await checkAuth();
    if (isAuth) {
      menuConfig.forEach((menu) => {
        registerMenuItem(menu, baseStore);
      });
    }
    setIsInitialized(true);
  }, [sdk, authProvider, isInitialized, checkAuth]);
  reactExports.useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (sdk && isMounted && !isInitialized) {
        await initializeApp();
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, [sdk, isInitialized, initializeApp]);
  return {
    isInitialized,
    providers,
    resources,
    setIsInitialized
  };
}
function registerMenuItem(menu, baseStore) {
  var _a;
  baseStore.addMenuItem(menu);
  (_a = menu.children) == null ? void 0 : _a.forEach((item) => {
    baseStore.addMenuItem(item, menu.key);
  });
}
const links = () => [{
  rel: "stylesheet",
  href: stylesheet
}];
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxRuntimeExports.jsxs("head", {
      children: [/* @__PURE__ */ jsxRuntimeExports.jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsxRuntimeExports.jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsxRuntimeExports.jsx(Meta, {}), /* @__PURE__ */ jsxRuntimeExports.jsx(Links, {})]
    }), /* @__PURE__ */ jsxRuntimeExports.jsxs("body", {
      className: "max-h-screen",
      children: [children, /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollRestoration, {}), /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})]
    })]
  });
}
function App() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, {
    children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}), /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, {})]
  });
}
function Root() {
  var _a, _b, _c;
  const sdk = useSdk();
  const authProvider = useAuthProvider(sdk);
  const adminDomain = useProtocolDomain("admin");
  const {
    isInitialized,
    providers,
    resources,
    setIsInitialized
  } = useAppInitialization(sdk, authProvider);
  const wrappedAuthProvider = reactExports.useMemo(() => {
    if (!authProvider) return null;
    return {
      ...authProvider,
      login: async (params) => {
        const result = await authProvider.login(params);
        setIsInitialized(false);
        return result;
      },
      logout: async (params) => {
        const result = await authProvider.logout(params);
        setIsInitialized(false);
        return result;
      }
    };
  }, [authProvider, setIsInitialized]);
  if (!isInitialized) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonLoader, {});
  }
  const resourceAuthHeaders = {
    Authorization: `Bearer ${(_a = sdk == null ? void 0 : sdk.account()) == null ? void 0 : _a.jwtToken}`
  };
  const allResources = [...resources, {
    name: "cron/jobs",
    meta: {
      dataProviderName: "admin",
      authHeaders: resourceAuthHeaders
    }
  }, {
    name: "settings",
    list: "settings",
    show: "settings/:id",
    meta: {
      dataProviderName: "admin",
      authHeaders: resourceAuthHeaders
    }
  }];
  const adminDataProvider = N(`https://${adminDomain}/api`);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ic, {
    authProvider: wrappedAuthProvider,
    routerProvider: E,
    dataProvider: {
      ...providers,
      default: createAccountProvider(sdk, N(
        // @ts-ignore
        ((_c = (_b = sdk.account()) == null ? void 0 : _b.apiUrl) == null ? void 0 : _c.replace(/\/+$/, "")) + "/api"
      )),
      admin: adminDataProvider
    },
    notificationProvider,
    resources: allResources,
    options: {
      disableTelemetry: true,
      warnWhenUnsavedChanges: true
    },
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {})
  });
}
const root = withTheme(Root);
function HydrateFallback() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonLoader, {});
}
const SkeletonLoader = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    className: "flex items-start justify-center min-h-screen p-4 pt-60",
    children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      className: "w-full max-w-md space-y-2",
      children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, {
        className: "h-4 w-3/4 mx-auto"
      }), /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, {
        className: "h-4 w-full"
      }), /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, {
        className: "h-4 w-5/6 mx-auto"
      }), /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, {
        className: "h-4 w-2/3 mx-auto"
      })]
    })
  });
};
export {
  HydrateFallback,
  Layout,
  root as default,
  links
};
