import { r as reactExports, j as jsxRuntimeExports } from "./index-BIsqO_uY.js";
import { $ as $c512c27ab02ef895$export$50c7b4e9d9f19c1, a as $8927f6f2acc4f386$export$250ffa63cdc0d034, b as $71cd76cc60e0454e$export$6f32135080cb4c3, c as $921a889cee6df7e8$export$99c2b779aa4e8b8b, d as $b1b2314f5f9a1d84$export$25bec8c6f54ee79a, e as $e42e1063c40fb3ef$export$b9ecd428b558ff10, f as $8927f6f2acc4f386$export$6d1a0317bde7de7f, g as $9f79659886946c16$export$e5c5a5f917a5871c, C as Cross2Icon } from "./index-CVPXomLy.js";
import { $ as $6ed0406888f73fc4$export$c7b2cbe3552a0d05, _ as _extends, c as cn, a as cva } from "./utils-Hh79uNMy.js";
import { r as reactDomExports } from "./index-BVHF9LaM.js";
import { $ as $e02a7d9cb1dc128c$export$c74125a8e3af6bb2, a as $5cb92bef7577960e$export$aecb2ddcb55c95be, b as $ea1ef594cf570d83$export$439d29a4e110a164, c as $5cb92bef7577960e$export$be92b6f5f03c0fe9, d as $f1701beae083dbae$export$602eac185826482c } from "./index-Q-HFwQgP.js";
const $054eb8030ebde76e$var$PROVIDER_NAME = "ToastProvider";
const [$054eb8030ebde76e$var$Collection, $054eb8030ebde76e$var$useCollection, $054eb8030ebde76e$var$createCollectionScope] = $e02a7d9cb1dc128c$export$c74125a8e3af6bb2("Toast");
const [$054eb8030ebde76e$var$createToastContext, $054eb8030ebde76e$export$8a359da18fbc9073] = $c512c27ab02ef895$export$50c7b4e9d9f19c1("Toast", [
  $054eb8030ebde76e$var$createCollectionScope
]);
const [$054eb8030ebde76e$var$ToastProviderProvider, $054eb8030ebde76e$var$useToastProviderContext] = $054eb8030ebde76e$var$createToastContext($054eb8030ebde76e$var$PROVIDER_NAME);
const $054eb8030ebde76e$export$f5d03d415824e0e = (props) => {
  const { __scopeToast, label = "Notification", duration = 5e3, swipeDirection = "right", swipeThreshold = 50, children } = props;
  const [viewport, setViewport] = reactExports.useState(null);
  const [toastCount, setToastCount] = reactExports.useState(0);
  const isFocusedToastEscapeKeyDownRef = reactExports.useRef(false);
  const isClosePausedRef = reactExports.useRef(false);
  return /* @__PURE__ */ reactExports.createElement($054eb8030ebde76e$var$Collection.Provider, {
    scope: __scopeToast
  }, /* @__PURE__ */ reactExports.createElement($054eb8030ebde76e$var$ToastProviderProvider, {
    scope: __scopeToast,
    label,
    duration,
    swipeDirection,
    swipeThreshold,
    toastCount,
    viewport,
    onViewportChange: setViewport,
    onToastAdd: reactExports.useCallback(
      () => setToastCount(
        (prevCount) => prevCount + 1
      ),
      []
    ),
    onToastRemove: reactExports.useCallback(
      () => setToastCount(
        (prevCount) => prevCount - 1
      ),
      []
    ),
    isFocusedToastEscapeKeyDownRef,
    isClosePausedRef
  }, children));
};
$054eb8030ebde76e$export$f5d03d415824e0e.propTypes = {
  label(props) {
    if (props.label && typeof props.label === "string" && !props.label.trim()) {
      const error = `Invalid prop \`label\` supplied to \`${$054eb8030ebde76e$var$PROVIDER_NAME}\`. Expected non-empty \`string\`.`;
      return new Error(error);
    }
    return null;
  }
};
const $054eb8030ebde76e$var$VIEWPORT_NAME = "ToastViewport";
const $054eb8030ebde76e$var$VIEWPORT_DEFAULT_HOTKEY = [
  "F8"
];
const $054eb8030ebde76e$var$VIEWPORT_PAUSE = "toast.viewportPause";
const $054eb8030ebde76e$var$VIEWPORT_RESUME = "toast.viewportResume";
const $054eb8030ebde76e$export$6192c2425ecfd989 = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeToast, hotkey = $054eb8030ebde76e$var$VIEWPORT_DEFAULT_HOTKEY, label = "Notifications ({hotkey})", ...viewportProps } = props;
  const context = $054eb8030ebde76e$var$useToastProviderContext($054eb8030ebde76e$var$VIEWPORT_NAME, __scopeToast);
  const getItems = $054eb8030ebde76e$var$useCollection(__scopeToast);
  const wrapperRef = reactExports.useRef(null);
  const headFocusProxyRef = reactExports.useRef(null);
  const tailFocusProxyRef = reactExports.useRef(null);
  const ref = reactExports.useRef(null);
  const composedRefs = $6ed0406888f73fc4$export$c7b2cbe3552a0d05(forwardedRef, ref, context.onViewportChange);
  const hotkeyLabel = hotkey.join("+").replace(/Key/g, "").replace(/Digit/g, "");
  const hasToasts = context.toastCount > 0;
  reactExports.useEffect(() => {
    const handleKeyDown = (event) => {
      var _ref$current;
      const isHotkeyPressed = hotkey.every(
        (key) => event[key] || event.code === key
      );
      if (isHotkeyPressed)
        (_ref$current = ref.current) === null || _ref$current === void 0 || _ref$current.focus();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    hotkey
  ]);
  reactExports.useEffect(() => {
    const wrapper = wrapperRef.current;
    const viewport = ref.current;
    if (hasToasts && wrapper && viewport) {
      const handlePause = () => {
        if (!context.isClosePausedRef.current) {
          const pauseEvent = new CustomEvent($054eb8030ebde76e$var$VIEWPORT_PAUSE);
          viewport.dispatchEvent(pauseEvent);
          context.isClosePausedRef.current = true;
        }
      };
      const handleResume = () => {
        if (context.isClosePausedRef.current) {
          const resumeEvent = new CustomEvent($054eb8030ebde76e$var$VIEWPORT_RESUME);
          viewport.dispatchEvent(resumeEvent);
          context.isClosePausedRef.current = false;
        }
      };
      const handleFocusOutResume = (event) => {
        const isFocusMovingOutside = !wrapper.contains(event.relatedTarget);
        if (isFocusMovingOutside)
          handleResume();
      };
      const handlePointerLeaveResume = () => {
        const isFocusInside = wrapper.contains(document.activeElement);
        if (!isFocusInside)
          handleResume();
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
  }, [
    hasToasts,
    context.isClosePausedRef
  ]);
  const getSortedTabbableCandidates = reactExports.useCallback(({ tabbingDirection }) => {
    const toastItems = getItems();
    const tabbableCandidates = toastItems.map((toastItem) => {
      const toastNode = toastItem.ref.current;
      const toastTabbableCandidates = [
        toastNode,
        ...$054eb8030ebde76e$var$getTabbableCandidates(toastNode)
      ];
      return tabbingDirection === "forwards" ? toastTabbableCandidates : toastTabbableCandidates.reverse();
    });
    return (tabbingDirection === "forwards" ? tabbableCandidates.reverse() : tabbableCandidates).flat();
  }, [
    getItems
  ]);
  reactExports.useEffect(() => {
    const viewport = ref.current;
    if (viewport) {
      const handleKeyDown = (event) => {
        const isMetaKey = event.altKey || event.ctrlKey || event.metaKey;
        const isTabKey = event.key === "Tab" && !isMetaKey;
        if (isTabKey) {
          const focusedElement = document.activeElement;
          const isTabbingBackwards = event.shiftKey;
          const targetIsViewport = event.target === viewport;
          if (targetIsViewport && isTabbingBackwards) {
            var _headFocusProxyRef$cu;
            (_headFocusProxyRef$cu = headFocusProxyRef.current) === null || _headFocusProxyRef$cu === void 0 || _headFocusProxyRef$cu.focus();
            return;
          }
          const tabbingDirection = isTabbingBackwards ? "backwards" : "forwards";
          const sortedCandidates = getSortedTabbableCandidates({
            tabbingDirection
          });
          const index = sortedCandidates.findIndex(
            (candidate) => candidate === focusedElement
          );
          if ($054eb8030ebde76e$var$focusFirst(sortedCandidates.slice(index + 1)))
            event.preventDefault();
          else {
            var _headFocusProxyRef$cu2, _tailFocusProxyRef$cu;
            isTabbingBackwards ? (_headFocusProxyRef$cu2 = headFocusProxyRef.current) === null || _headFocusProxyRef$cu2 === void 0 || _headFocusProxyRef$cu2.focus() : (_tailFocusProxyRef$cu = tailFocusProxyRef.current) === null || _tailFocusProxyRef$cu === void 0 || _tailFocusProxyRef$cu.focus();
          }
        }
      };
      viewport.addEventListener("keydown", handleKeyDown);
      return () => viewport.removeEventListener("keydown", handleKeyDown);
    }
  }, [
    getItems,
    getSortedTabbableCandidates
  ]);
  return /* @__PURE__ */ reactExports.createElement($5cb92bef7577960e$export$aecb2ddcb55c95be, {
    ref: wrapperRef,
    role: "region",
    "aria-label": label.replace("{hotkey}", hotkeyLabel),
    tabIndex: -1,
    style: {
      pointerEvents: hasToasts ? void 0 : "none"
    }
  }, hasToasts && /* @__PURE__ */ reactExports.createElement($054eb8030ebde76e$var$FocusProxy, {
    ref: headFocusProxyRef,
    onFocusFromOutsideViewport: () => {
      const tabbableCandidates = getSortedTabbableCandidates({
        tabbingDirection: "forwards"
      });
      $054eb8030ebde76e$var$focusFirst(tabbableCandidates);
    }
  }), /* @__PURE__ */ reactExports.createElement($054eb8030ebde76e$var$Collection.Slot, {
    scope: __scopeToast
  }, /* @__PURE__ */ reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.ol, _extends({
    tabIndex: -1
  }, viewportProps, {
    ref: composedRefs
  }))), hasToasts && /* @__PURE__ */ reactExports.createElement($054eb8030ebde76e$var$FocusProxy, {
    ref: tailFocusProxyRef,
    onFocusFromOutsideViewport: () => {
      const tabbableCandidates = getSortedTabbableCandidates({
        tabbingDirection: "backwards"
      });
      $054eb8030ebde76e$var$focusFirst(tabbableCandidates);
    }
  }));
});
const $054eb8030ebde76e$var$FOCUS_PROXY_NAME = "ToastFocusProxy";
const $054eb8030ebde76e$var$FocusProxy = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeToast, onFocusFromOutsideViewport, ...proxyProps } = props;
  const context = $054eb8030ebde76e$var$useToastProviderContext($054eb8030ebde76e$var$FOCUS_PROXY_NAME, __scopeToast);
  return /* @__PURE__ */ reactExports.createElement($ea1ef594cf570d83$export$439d29a4e110a164, _extends({
    "aria-hidden": true,
    tabIndex: 0
  }, proxyProps, {
    ref: forwardedRef,
    style: {
      position: "fixed"
    },
    onFocus: (event) => {
      var _context$viewport;
      const prevFocusedElement = event.relatedTarget;
      const isFocusFromOutsideViewport = !((_context$viewport = context.viewport) !== null && _context$viewport !== void 0 && _context$viewport.contains(prevFocusedElement));
      if (isFocusFromOutsideViewport)
        onFocusFromOutsideViewport();
    }
  }));
});
const $054eb8030ebde76e$var$TOAST_NAME = "Toast";
const $054eb8030ebde76e$var$TOAST_SWIPE_START = "toast.swipeStart";
const $054eb8030ebde76e$var$TOAST_SWIPE_MOVE = "toast.swipeMove";
const $054eb8030ebde76e$var$TOAST_SWIPE_CANCEL = "toast.swipeCancel";
const $054eb8030ebde76e$var$TOAST_SWIPE_END = "toast.swipeEnd";
const $054eb8030ebde76e$export$8d8dc7d5f743331b = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const { forceMount, open: openProp, defaultOpen, onOpenChange, ...toastProps } = props;
  const [open = true, setOpen] = $71cd76cc60e0454e$export$6f32135080cb4c3({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange
  });
  return /* @__PURE__ */ reactExports.createElement($921a889cee6df7e8$export$99c2b779aa4e8b8b, {
    present: forceMount || open
  }, /* @__PURE__ */ reactExports.createElement($054eb8030ebde76e$var$ToastImpl, _extends({
    open
  }, toastProps, {
    ref: forwardedRef,
    onClose: () => setOpen(false),
    onPause: $b1b2314f5f9a1d84$export$25bec8c6f54ee79a(props.onPause),
    onResume: $b1b2314f5f9a1d84$export$25bec8c6f54ee79a(props.onResume),
    onSwipeStart: $e42e1063c40fb3ef$export$b9ecd428b558ff10(props.onSwipeStart, (event) => {
      event.currentTarget.setAttribute("data-swipe", "start");
    }),
    onSwipeMove: $e42e1063c40fb3ef$export$b9ecd428b558ff10(props.onSwipeMove, (event) => {
      const { x, y } = event.detail.delta;
      event.currentTarget.setAttribute("data-swipe", "move");
      event.currentTarget.style.setProperty("--radix-toast-swipe-move-x", `${x}px`);
      event.currentTarget.style.setProperty("--radix-toast-swipe-move-y", `${y}px`);
    }),
    onSwipeCancel: $e42e1063c40fb3ef$export$b9ecd428b558ff10(props.onSwipeCancel, (event) => {
      event.currentTarget.setAttribute("data-swipe", "cancel");
      event.currentTarget.style.removeProperty("--radix-toast-swipe-move-x");
      event.currentTarget.style.removeProperty("--radix-toast-swipe-move-y");
      event.currentTarget.style.removeProperty("--radix-toast-swipe-end-x");
      event.currentTarget.style.removeProperty("--radix-toast-swipe-end-y");
    }),
    onSwipeEnd: $e42e1063c40fb3ef$export$b9ecd428b558ff10(props.onSwipeEnd, (event) => {
      const { x, y } = event.detail.delta;
      event.currentTarget.setAttribute("data-swipe", "end");
      event.currentTarget.style.removeProperty("--radix-toast-swipe-move-x");
      event.currentTarget.style.removeProperty("--radix-toast-swipe-move-y");
      event.currentTarget.style.setProperty("--radix-toast-swipe-end-x", `${x}px`);
      event.currentTarget.style.setProperty("--radix-toast-swipe-end-y", `${y}px`);
      setOpen(false);
    })
  })));
});
const [$054eb8030ebde76e$var$ToastInteractiveProvider, $054eb8030ebde76e$var$useToastInteractiveContext] = $054eb8030ebde76e$var$createToastContext($054eb8030ebde76e$var$TOAST_NAME, {
  onClose() {
  }
});
const $054eb8030ebde76e$var$ToastImpl = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeToast, type = "foreground", duration: durationProp, open, onClose, onEscapeKeyDown, onPause, onResume, onSwipeStart, onSwipeMove, onSwipeCancel, onSwipeEnd, ...toastProps } = props;
  const context = $054eb8030ebde76e$var$useToastProviderContext($054eb8030ebde76e$var$TOAST_NAME, __scopeToast);
  const [node1, setNode] = reactExports.useState(null);
  const composedRefs = $6ed0406888f73fc4$export$c7b2cbe3552a0d05(
    forwardedRef,
    (node) => setNode(node)
  );
  const pointerStartRef = reactExports.useRef(null);
  const swipeDeltaRef = reactExports.useRef(null);
  const duration1 = durationProp || context.duration;
  const closeTimerStartTimeRef = reactExports.useRef(0);
  const closeTimerRemainingTimeRef = reactExports.useRef(duration1);
  const closeTimerRef = reactExports.useRef(0);
  const { onToastAdd, onToastRemove } = context;
  const handleClose = $b1b2314f5f9a1d84$export$25bec8c6f54ee79a(() => {
    var _context$viewport2;
    const isFocusInToast = node1 === null || node1 === void 0 ? void 0 : node1.contains(document.activeElement);
    if (isFocusInToast)
      (_context$viewport2 = context.viewport) === null || _context$viewport2 === void 0 || _context$viewport2.focus();
    onClose();
  });
  const startTimer = reactExports.useCallback((duration) => {
    if (!duration || duration === Infinity)
      return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerStartTimeRef.current = (/* @__PURE__ */ new Date()).getTime();
    closeTimerRef.current = window.setTimeout(handleClose, duration);
  }, [
    handleClose
  ]);
  reactExports.useEffect(() => {
    const viewport = context.viewport;
    if (viewport) {
      const handleResume = () => {
        startTimer(closeTimerRemainingTimeRef.current);
        onResume === null || onResume === void 0 || onResume();
      };
      const handlePause = () => {
        const elapsedTime = (/* @__PURE__ */ new Date()).getTime() - closeTimerStartTimeRef.current;
        closeTimerRemainingTimeRef.current = closeTimerRemainingTimeRef.current - elapsedTime;
        window.clearTimeout(closeTimerRef.current);
        onPause === null || onPause === void 0 || onPause();
      };
      viewport.addEventListener($054eb8030ebde76e$var$VIEWPORT_PAUSE, handlePause);
      viewport.addEventListener($054eb8030ebde76e$var$VIEWPORT_RESUME, handleResume);
      return () => {
        viewport.removeEventListener($054eb8030ebde76e$var$VIEWPORT_PAUSE, handlePause);
        viewport.removeEventListener($054eb8030ebde76e$var$VIEWPORT_RESUME, handleResume);
      };
    }
  }, [
    context.viewport,
    duration1,
    onPause,
    onResume,
    startTimer
  ]);
  reactExports.useEffect(() => {
    if (open && !context.isClosePausedRef.current)
      startTimer(duration1);
  }, [
    open,
    duration1,
    context.isClosePausedRef,
    startTimer
  ]);
  reactExports.useEffect(() => {
    onToastAdd();
    return () => onToastRemove();
  }, [
    onToastAdd,
    onToastRemove
  ]);
  const announceTextContent = reactExports.useMemo(() => {
    return node1 ? $054eb8030ebde76e$var$getAnnounceTextContent(node1) : null;
  }, [
    node1
  ]);
  if (!context.viewport)
    return null;
  return /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, announceTextContent && /* @__PURE__ */ reactExports.createElement($054eb8030ebde76e$var$ToastAnnounce, {
    __scopeToast,
    role: "status",
    "aria-live": type === "foreground" ? "assertive" : "polite",
    "aria-atomic": true
  }, announceTextContent), /* @__PURE__ */ reactExports.createElement($054eb8030ebde76e$var$ToastInteractiveProvider, {
    scope: __scopeToast,
    onClose: handleClose
  }, /* @__PURE__ */ reactDomExports.createPortal(/* @__PURE__ */ reactExports.createElement($054eb8030ebde76e$var$Collection.ItemSlot, {
    scope: __scopeToast
  }, /* @__PURE__ */ reactExports.createElement($5cb92bef7577960e$export$be92b6f5f03c0fe9, {
    asChild: true,
    onEscapeKeyDown: $e42e1063c40fb3ef$export$b9ecd428b558ff10(onEscapeKeyDown, () => {
      if (!context.isFocusedToastEscapeKeyDownRef.current)
        handleClose();
      context.isFocusedToastEscapeKeyDownRef.current = false;
    })
  }, /* @__PURE__ */ reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.li, _extends({
    // Ensure toasts are announced as status list or status when focused
    role: "status",
    "aria-live": "off",
    "aria-atomic": true,
    tabIndex: 0,
    "data-state": open ? "open" : "closed",
    "data-swipe-direction": context.swipeDirection
  }, toastProps, {
    ref: composedRefs,
    style: {
      userSelect: "none",
      touchAction: "none",
      ...props.style
    },
    onKeyDown: $e42e1063c40fb3ef$export$b9ecd428b558ff10(props.onKeyDown, (event) => {
      if (event.key !== "Escape")
        return;
      onEscapeKeyDown === null || onEscapeKeyDown === void 0 || onEscapeKeyDown(event.nativeEvent);
      if (!event.nativeEvent.defaultPrevented) {
        context.isFocusedToastEscapeKeyDownRef.current = true;
        handleClose();
      }
    }),
    onPointerDown: $e42e1063c40fb3ef$export$b9ecd428b558ff10(props.onPointerDown, (event) => {
      if (event.button !== 0)
        return;
      pointerStartRef.current = {
        x: event.clientX,
        y: event.clientY
      };
    }),
    onPointerMove: $e42e1063c40fb3ef$export$b9ecd428b558ff10(props.onPointerMove, (event) => {
      if (!pointerStartRef.current)
        return;
      const x = event.clientX - pointerStartRef.current.x;
      const y = event.clientY - pointerStartRef.current.y;
      const hasSwipeMoveStarted = Boolean(swipeDeltaRef.current);
      const isHorizontalSwipe = [
        "left",
        "right"
      ].includes(context.swipeDirection);
      const clamp = [
        "left",
        "up"
      ].includes(context.swipeDirection) ? Math.min : Math.max;
      const clampedX = isHorizontalSwipe ? clamp(0, x) : 0;
      const clampedY = !isHorizontalSwipe ? clamp(0, y) : 0;
      const moveStartBuffer = event.pointerType === "touch" ? 10 : 2;
      const delta = {
        x: clampedX,
        y: clampedY
      };
      const eventDetail = {
        originalEvent: event,
        delta
      };
      if (hasSwipeMoveStarted) {
        swipeDeltaRef.current = delta;
        $054eb8030ebde76e$var$handleAndDispatchCustomEvent($054eb8030ebde76e$var$TOAST_SWIPE_MOVE, onSwipeMove, eventDetail, {
          discrete: false
        });
      } else if ($054eb8030ebde76e$var$isDeltaInDirection(delta, context.swipeDirection, moveStartBuffer)) {
        swipeDeltaRef.current = delta;
        $054eb8030ebde76e$var$handleAndDispatchCustomEvent($054eb8030ebde76e$var$TOAST_SWIPE_START, onSwipeStart, eventDetail, {
          discrete: false
        });
        event.target.setPointerCapture(event.pointerId);
      } else if (Math.abs(x) > moveStartBuffer || Math.abs(y) > moveStartBuffer)
        pointerStartRef.current = null;
    }),
    onPointerUp: $e42e1063c40fb3ef$export$b9ecd428b558ff10(props.onPointerUp, (event1) => {
      const delta = swipeDeltaRef.current;
      const target = event1.target;
      if (target.hasPointerCapture(event1.pointerId))
        target.releasePointerCapture(event1.pointerId);
      swipeDeltaRef.current = null;
      pointerStartRef.current = null;
      if (delta) {
        const toast = event1.currentTarget;
        const eventDetail = {
          originalEvent: event1,
          delta
        };
        if ($054eb8030ebde76e$var$isDeltaInDirection(delta, context.swipeDirection, context.swipeThreshold))
          $054eb8030ebde76e$var$handleAndDispatchCustomEvent($054eb8030ebde76e$var$TOAST_SWIPE_END, onSwipeEnd, eventDetail, {
            discrete: true
          });
        else
          $054eb8030ebde76e$var$handleAndDispatchCustomEvent($054eb8030ebde76e$var$TOAST_SWIPE_CANCEL, onSwipeCancel, eventDetail, {
            discrete: true
          });
        toast.addEventListener(
          "click",
          (event) => event.preventDefault(),
          {
            once: true
          }
        );
      }
    })
  })))), context.viewport)));
});
$054eb8030ebde76e$var$ToastImpl.propTypes = {
  type(props) {
    if (props.type && ![
      "foreground",
      "background"
    ].includes(props.type)) {
      const error = `Invalid prop \`type\` supplied to \`${$054eb8030ebde76e$var$TOAST_NAME}\`. Expected \`foreground | background\`.`;
      return new Error(error);
    }
    return null;
  }
};
const $054eb8030ebde76e$var$ToastAnnounce = (props) => {
  const { __scopeToast, children, ...announceProps } = props;
  const context = $054eb8030ebde76e$var$useToastProviderContext($054eb8030ebde76e$var$TOAST_NAME, __scopeToast);
  const [renderAnnounceText, setRenderAnnounceText] = reactExports.useState(false);
  const [isAnnounced, setIsAnnounced] = reactExports.useState(false);
  $054eb8030ebde76e$var$useNextFrame(
    () => setRenderAnnounceText(true)
  );
  reactExports.useEffect(() => {
    const timer = window.setTimeout(
      () => setIsAnnounced(true),
      1e3
    );
    return () => window.clearTimeout(timer);
  }, []);
  return isAnnounced ? null : /* @__PURE__ */ reactExports.createElement($f1701beae083dbae$export$602eac185826482c, {
    asChild: true
  }, /* @__PURE__ */ reactExports.createElement($ea1ef594cf570d83$export$439d29a4e110a164, announceProps, renderAnnounceText && /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, context.label, " ", children)));
};
const $054eb8030ebde76e$export$16d42d7c29b95a4 = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeToast, ...titleProps } = props;
  return /* @__PURE__ */ reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.div, _extends({}, titleProps, {
    ref: forwardedRef
  }));
});
const $054eb8030ebde76e$export$ecddd96c53621d9a = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeToast, ...descriptionProps } = props;
  return /* @__PURE__ */ reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.div, _extends({}, descriptionProps, {
    ref: forwardedRef
  }));
});
const $054eb8030ebde76e$var$ACTION_NAME = "ToastAction";
const $054eb8030ebde76e$export$3019feecfda683d2 = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const { altText, ...actionProps } = props;
  if (!altText)
    return null;
  return /* @__PURE__ */ reactExports.createElement($054eb8030ebde76e$var$ToastAnnounceExclude, {
    altText,
    asChild: true
  }, /* @__PURE__ */ reactExports.createElement($054eb8030ebde76e$export$811e70f61c205839, _extends({}, actionProps, {
    ref: forwardedRef
  })));
});
$054eb8030ebde76e$export$3019feecfda683d2.propTypes = {
  altText(props) {
    if (!props.altText)
      return new Error(`Missing prop \`altText\` expected on \`${$054eb8030ebde76e$var$ACTION_NAME}\``);
    return null;
  }
};
const $054eb8030ebde76e$var$CLOSE_NAME = "ToastClose";
const $054eb8030ebde76e$export$811e70f61c205839 = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeToast, ...closeProps } = props;
  const interactiveContext = $054eb8030ebde76e$var$useToastInteractiveContext($054eb8030ebde76e$var$CLOSE_NAME, __scopeToast);
  return /* @__PURE__ */ reactExports.createElement($054eb8030ebde76e$var$ToastAnnounceExclude, {
    asChild: true
  }, /* @__PURE__ */ reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.button, _extends({
    type: "button"
  }, closeProps, {
    ref: forwardedRef,
    onClick: $e42e1063c40fb3ef$export$b9ecd428b558ff10(props.onClick, interactiveContext.onClose)
  })));
});
const $054eb8030ebde76e$var$ToastAnnounceExclude = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeToast, altText, ...announceExcludeProps } = props;
  return /* @__PURE__ */ reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.div, _extends({
    "data-radix-toast-announce-exclude": "",
    "data-radix-toast-announce-alt": altText || void 0
  }, announceExcludeProps, {
    ref: forwardedRef
  }));
});
function $054eb8030ebde76e$var$getAnnounceTextContent(container) {
  const textContent = [];
  const childNodes = Array.from(container.childNodes);
  childNodes.forEach((node) => {
    if (node.nodeType === node.TEXT_NODE && node.textContent)
      textContent.push(node.textContent);
    if ($054eb8030ebde76e$var$isHTMLElement(node)) {
      const isHidden = node.ariaHidden || node.hidden || node.style.display === "none";
      const isExcluded = node.dataset.radixToastAnnounceExclude === "";
      if (!isHidden) {
        if (isExcluded) {
          const altText = node.dataset.radixToastAnnounceAlt;
          if (altText)
            textContent.push(altText);
        } else
          textContent.push(...$054eb8030ebde76e$var$getAnnounceTextContent(node));
      }
    }
  });
  return textContent;
}
function $054eb8030ebde76e$var$handleAndDispatchCustomEvent(name, handler, detail, { discrete }) {
  const currentTarget = detail.originalEvent.currentTarget;
  const event = new CustomEvent(name, {
    bubbles: true,
    cancelable: true,
    detail
  });
  if (handler)
    currentTarget.addEventListener(name, handler, {
      once: true
    });
  if (discrete)
    $8927f6f2acc4f386$export$6d1a0317bde7de7f(currentTarget, event);
  else
    currentTarget.dispatchEvent(event);
}
const $054eb8030ebde76e$var$isDeltaInDirection = (delta, direction, threshold = 0) => {
  const deltaX = Math.abs(delta.x);
  const deltaY = Math.abs(delta.y);
  const isDeltaX = deltaX > deltaY;
  if (direction === "left" || direction === "right")
    return isDeltaX && deltaX > threshold;
  else
    return !isDeltaX && deltaY > threshold;
};
function $054eb8030ebde76e$var$useNextFrame(callback = () => {
}) {
  const fn = $b1b2314f5f9a1d84$export$25bec8c6f54ee79a(callback);
  $9f79659886946c16$export$e5c5a5f917a5871c(() => {
    let raf1 = 0;
    let raf2 = 0;
    raf1 = window.requestAnimationFrame(
      () => raf2 = window.requestAnimationFrame(fn)
    );
    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
    };
  }, [
    fn
  ]);
}
function $054eb8030ebde76e$var$isHTMLElement(node) {
  return node.nodeType === node.ELEMENT_NODE;
}
function $054eb8030ebde76e$var$getTabbableCandidates(container) {
  const nodes = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => {
      const isHiddenInput = node.tagName === "INPUT" && node.type === "hidden";
      if (node.disabled || node.hidden || isHiddenInput)
        return NodeFilter.FILTER_SKIP;
      return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  while (walker.nextNode())
    nodes.push(walker.currentNode);
  return nodes;
}
function $054eb8030ebde76e$var$focusFirst(candidates) {
  const previouslyFocusedElement = document.activeElement;
  return candidates.some((candidate) => {
    if (candidate === previouslyFocusedElement)
      return true;
    candidate.focus();
    return document.activeElement !== previouslyFocusedElement;
  });
}
const $054eb8030ebde76e$export$2881499e37b75b9a = $054eb8030ebde76e$export$f5d03d415824e0e;
const $054eb8030ebde76e$export$d5c6c08dc2d3ca7 = $054eb8030ebde76e$export$6192c2425ecfd989;
const $054eb8030ebde76e$export$be92b6f5f03c0fe9 = $054eb8030ebde76e$export$8d8dc7d5f743331b;
const $054eb8030ebde76e$export$f99233281efd08a0 = $054eb8030ebde76e$export$16d42d7c29b95a4;
const $054eb8030ebde76e$export$393edc798c47379d = $054eb8030ebde76e$export$ecddd96c53621d9a;
const $054eb8030ebde76e$export$e19cd5f9376f8cee = $054eb8030ebde76e$export$3019feecfda683d2;
const $054eb8030ebde76e$export$f39c2d165cd861fe = $054eb8030ebde76e$export$811e70f61c205839;
const ToastProvider = $054eb8030ebde76e$export$2881499e37b75b9a;
const ToastViewport = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  $054eb8030ebde76e$export$d5c6c08dc2d3ca7,
  {
    ref,
    className: cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    ),
    ...props
  }
));
ToastViewport.displayName = $054eb8030ebde76e$export$d5c6c08dc2d3ca7.displayName;
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
    $054eb8030ebde76e$export$be92b6f5f03c0fe9,
    {
      ref,
      className: cn(toastVariants({ variant }), className),
      ...props
    }
  );
});
Toast.displayName = $054eb8030ebde76e$export$be92b6f5f03c0fe9.displayName;
const ToastAction = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  $054eb8030ebde76e$export$e19cd5f9376f8cee,
  {
    ref,
    className: cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    ),
    ...props
  }
));
ToastAction.displayName = $054eb8030ebde76e$export$e19cd5f9376f8cee.displayName;
const ToastClose = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  $054eb8030ebde76e$export$f39c2d165cd861fe,
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
ToastClose.displayName = $054eb8030ebde76e$export$f39c2d165cd861fe.displayName;
const ToastTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  $054eb8030ebde76e$export$f99233281efd08a0,
  {
    ref,
    className: cn("text-sm font-semibold [&+div]:text-xs", className),
    ...props
  }
));
ToastTitle.displayName = $054eb8030ebde76e$export$f99233281efd08a0.displayName;
const ToastDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  $054eb8030ebde76e$export$393edc798c47379d,
  {
    ref,
    className: cn("text-sm opacity-90", className),
    ...props
  }
));
ToastDescription.displayName = $054eb8030ebde76e$export$393edc798c47379d.displayName;
export {
  ToastProvider as T,
  Toast as a,
  ToastTitle as b,
  ToastDescription as c,
  ToastClose as d,
  ToastViewport as e,
  ToastAction as f
};
