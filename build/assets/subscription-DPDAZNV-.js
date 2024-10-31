import { r as reactExports, $ as $2AODx$react, j as jsxRuntimeExports, R as React } from "./jsx-runtime-IZdvEyt_.js";
import { S as Skeleton } from "./skeleton-Cez4AWj1.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-DMdyRxkb.js";
import { u as useSubscription, b as useIsPaidBillingEnabled, a as useApiUrl } from "./useSubscription-BLaytgnB.js";
import { u as usePluginMeta } from "./usePluginMeta-aNbgo9DI.js";
import { c as $e$1, p as pi, z as zt, a as ii } from "./index-C-G3KncW.js";
import { t } from "./zod-Bk9KP5Qk.js";
import { b as cn$1, B as Button, u as useComposedRefs, S as Slot, e as Slottable, d as buttonVariants } from "./button-CxRLgqWQ.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent, d as CardFooter } from "./card-BWCUyTYa.js";
import { a as FormField, b as FormItem, e as FormLabel, c as FormControl, d as FormMessage, u as useForm, F as Form } from "./form-CB2qhI_6.js";
import { I as Input } from "./input-B5SdZGo1.js";
import { T as Textarea } from "./textarea-CojA7Bd2.js";
import { r as reactDomExports, R as ReactDOM } from "./index-DzjV6XGT.js";
import { c as createLucideIcon, d as createSidecarMedium, _ as __rest, e as useMergeRefs, f as __assign, g as fullWidthClassName, z as zeroRightClassName, s as styleSingleton, i as __spreadArray, j as RemoveScrollBar, k as exportSidecar, h as hideOthers, l as useEscapeKeydown, F as FocusScope, u as useId } from "./Combination-px7rCmli.js";
import "./dialog-bMhe1ZLy.js";
import { S as Search } from "./search-BVDfxcu5.js";
import { P as Popover, a as PopoverTrigger, b as PopoverContent } from "./index-C6Wr53b0.js";
import { C as Check } from "./check-BawgaJVu.js";
import { z as z$1 } from "./index-BpxO7BrF.js";
import { b as composeEventHandlers, a as useCallbackRef, d as useLayoutEffect2, u as useControllableState } from "./index-bnQotRZh.js";
import { P as Primitive, d as dispatchDiscreteCustomEvent } from "./react-icons.esm-BJVio-o0.js";
import { d as CloudIcon, f as CloudUploadIcon, D as DownloadIcon } from "./icons-DXepPAEW.js";
import { P as Progress, f as filesize } from "./progress-CxS0Yg7S.js";
import { a as useSearchParams } from "./index-CVd92JJe.js";
import "./index-DKrFfig3.js";
import "./index-gIJO3bJT.js";
import "./useFeatureFlag-CZhDezMF.js";
import "./usePortalMeta-Bj0hVK70.js";
import "./usePortalUrl-QWoAKYQr.js";
import "./label-GoC-rw9-.js";
import "./index-BNJrySUY.js";
import "./index-v7sdPLyF.js";
/**
 * @license lucide-react v0.396.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ChevronsUpDown = createLucideIcon("ChevronsUpDown", [
  ["path", { d: "m7 15 5 5 5-5", key: "1hf1tw" }],
  ["path", { d: "m7 9 5-5 5 5", key: "sgt6xg" }]
]);
function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function(n) {
    for (var e = 1; e < arguments.length; e++) {
      var t2 = arguments[e];
      for (var r in t2) ({}).hasOwnProperty.call(t2, r) && (n[r] = t2[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}
function useOnFreePlan() {
  const { subscriptionData } = useSubscription();
  const freePlanName = usePluginMeta("billing", "free_plan_name");
  const paidBillingEnabled = useIsPaidBillingEnabled();
  return paidBillingEnabled && freePlanName && (subscriptionData == null ? void 0 : subscriptionData.plan.name) === freePlanName;
}
function useBillingInfo() {
  const { subscriptionData, subscriptionIsLoading } = useSubscription();
  return {
    billingInfo: subscriptionData == null ? void 0 : subscriptionData.billing_info,
    isLoading: subscriptionIsLoading
  };
}
function useSubmitBillingInfo() {
  const apiUrl = useApiUrl();
  const { open } = $e$1();
  const { mutate, isLoading: isSubmitting } = pi();
  const { refetchSubscription } = useSubscription();
  const submitBillingInfo = reactExports.useCallback(
    async (billingInfo) => {
      return new Promise((resolve, reject) => {
        mutate(
          {
            url: `${apiUrl}/api/account/subscription/billing`,
            method: "post",
            values: billingInfo,
            errorNotification: false
          },
          {
            onSuccess() {
              open == null ? void 0 : open({
                type: "success",
                message: "Billing info updated successfully"
              });
              refetchSubscription();
              resolve(null);
            },
            onError(error) {
              var _a;
              if (((_a = error.response) == null ? void 0 : _a.status) === 400 && error.response.data) {
                const errorData = error.response.data;
                if (errorData.errors && Array.isArray(errorData.errors)) {
                  const formattedErrors = errorData.errors.reduce((acc, err) => {
                    acc[err.field] = err.message;
                    return acc;
                  }, {});
                  reject(formattedErrors);
                } else {
                  open == null ? void 0 : open({
                    type: "error",
                    message: "Unexpected error format from server"
                  });
                  reject(new Error("Unexpected error format"));
                }
              } else {
                open == null ? void 0 : open({
                  type: "error",
                  message: `Failed to update billing info: ${error.message}`
                });
                reject(error);
              }
            }
          }
        );
      });
    },
    [mutate, open, apiUrl, refetchSubscription]
  );
  return {
    isSubmitting,
    submitBillingInfo
  };
}
var U$1 = 1, Y$2 = 0.9, H$1 = 0.8, J = 0.17, p$1 = 0.1, u = 0.999, $ = 0.9999;
var k$2 = 0.99, m$1 = /[\\\/_+.#"@\[\(\{&]/, B$1 = /[\\\/_+.#"@\[\(\{&]/g, K = /[\s-]/, X$1 = /[\s-]/g;
function G$2(_2, C, h, P2, A2, f, O2) {
  if (f === C.length) return A2 === _2.length ? U$1 : k$2;
  var T2 = `${A2},${f}`;
  if (O2[T2] !== void 0) return O2[T2];
  for (var L2 = P2.charAt(f), c = h.indexOf(L2, A2), S2 = 0, E2, N2, R2, M2; c >= 0; ) E2 = G$2(_2, C, h, P2, c + 1, f + 1, O2), E2 > S2 && (c === A2 ? E2 *= U$1 : m$1.test(_2.charAt(c - 1)) ? (E2 *= H$1, R2 = _2.slice(A2, c - 1).match(B$1), R2 && A2 > 0 && (E2 *= Math.pow(u, R2.length))) : K.test(_2.charAt(c - 1)) ? (E2 *= Y$2, M2 = _2.slice(A2, c - 1).match(X$1), M2 && A2 > 0 && (E2 *= Math.pow(u, M2.length))) : (E2 *= J, A2 > 0 && (E2 *= Math.pow(u, c - A2))), _2.charAt(c) !== C.charAt(f) && (E2 *= $)), (E2 < p$1 && h.charAt(c - 1) === P2.charAt(f + 1) || P2.charAt(f + 1) === P2.charAt(f) && h.charAt(c - 1) !== P2.charAt(f)) && (N2 = G$2(_2, C, h, P2, c + 1, f + 2, O2), N2 * p$1 > E2 && (E2 = N2 * p$1)), E2 > S2 && (S2 = E2), c = h.indexOf(L2, c + 1);
  return O2[T2] = S2, S2;
}
function D$1(_2) {
  return _2.toLowerCase().replace(X$1, " ");
}
function W(_2, C, h) {
  return _2 = h && h.length > 0 ? `${_2 + " " + h.join(" ")}` : _2, G$2(_2, C, D$1(_2), D$1(C), 0, 0, {});
}
function $e42e1063c40fb3ef$export$b9ecd428b558ff10(originalEventHandler, ourEventHandler, { checkForDefaultPrevented = true } = {}) {
  return function handleEvent(event) {
    originalEventHandler === null || originalEventHandler === void 0 || originalEventHandler(event);
    if (checkForDefaultPrevented === false || !event.defaultPrevented) return ourEventHandler === null || ourEventHandler === void 0 ? void 0 : ourEventHandler(event);
  };
}
function $6ed0406888f73fc4$var$setRef(ref, value) {
  if (typeof ref === "function") ref(value);
  else if (ref !== null && ref !== void 0) ref.current = value;
}
function $6ed0406888f73fc4$export$43e446d32b3d21af(...refs) {
  return (node) => refs.forEach(
    (ref) => $6ed0406888f73fc4$var$setRef(ref, node)
  );
}
function $6ed0406888f73fc4$export$c7b2cbe3552a0d05(...refs) {
  return reactExports.useCallback($6ed0406888f73fc4$export$43e446d32b3d21af(...refs), refs);
}
function $c512c27ab02ef895$export$50c7b4e9d9f19c1(scopeName, createContextScopeDeps = []) {
  let defaultContexts = [];
  function $c512c27ab02ef895$export$fd42f52fd3ae1109(rootComponentName, defaultContext) {
    const BaseContext = /* @__PURE__ */ reactExports.createContext(defaultContext);
    const index = defaultContexts.length;
    defaultContexts = [
      ...defaultContexts,
      defaultContext
    ];
    function Provider(props) {
      const { scope, children, ...context } = props;
      const Context = (scope === null || scope === void 0 ? void 0 : scope[scopeName][index]) || BaseContext;
      const value = reactExports.useMemo(
        () => context,
        Object.values(context)
      );
      return /* @__PURE__ */ reactExports.createElement(Context.Provider, {
        value
      }, children);
    }
    function useContext(consumerName, scope) {
      const Context = (scope === null || scope === void 0 ? void 0 : scope[scopeName][index]) || BaseContext;
      const context = reactExports.useContext(Context);
      if (context) return context;
      if (defaultContext !== void 0) return defaultContext;
      throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
    }
    Provider.displayName = rootComponentName + "Provider";
    return [
      Provider,
      useContext
    ];
  }
  const createScope = () => {
    const scopeContexts = defaultContexts.map((defaultContext) => {
      return /* @__PURE__ */ reactExports.createContext(defaultContext);
    });
    return function useScope(scope) {
      const contexts = (scope === null || scope === void 0 ? void 0 : scope[scopeName]) || scopeContexts;
      return reactExports.useMemo(
        () => ({
          [`__scope${scopeName}`]: {
            ...scope,
            [scopeName]: contexts
          }
        }),
        [
          scope,
          contexts
        ]
      );
    };
  };
  createScope.scopeName = scopeName;
  return [
    $c512c27ab02ef895$export$fd42f52fd3ae1109,
    $c512c27ab02ef895$var$composeContextScopes(createScope, ...createContextScopeDeps)
  ];
}
function $c512c27ab02ef895$var$composeContextScopes(...scopes) {
  const baseScope = scopes[0];
  if (scopes.length === 1) return baseScope;
  const createScope1 = () => {
    const scopeHooks = scopes.map(
      (createScope) => ({
        useScope: createScope(),
        scopeName: createScope.scopeName
      })
    );
    return function useComposedScopes(overrideScopes) {
      const nextScopes1 = scopeHooks.reduce((nextScopes, { useScope, scopeName }) => {
        const scopeProps = useScope(overrideScopes);
        const currentScope = scopeProps[`__scope${scopeName}`];
        return {
          ...nextScopes,
          ...currentScope
        };
      }, {});
      return reactExports.useMemo(
        () => ({
          [`__scope${baseScope.scopeName}`]: nextScopes1
        }),
        [
          nextScopes1
        ]
      );
    };
  };
  createScope1.scopeName = baseScope.scopeName;
  return createScope1;
}
const $9f79659886946c16$export$e5c5a5f917a5871c = Boolean(globalThis === null || globalThis === void 0 ? void 0 : globalThis.document) ? reactExports.useLayoutEffect : () => {
};
const $1746a345f3d73bb7$var$useReactId = $2AODx$react["useId".toString()] || (() => void 0);
let $1746a345f3d73bb7$var$count = 0;
function $1746a345f3d73bb7$export$f680877a34711e37(deterministicId) {
  const [id, setId] = reactExports.useState($1746a345f3d73bb7$var$useReactId());
  $9f79659886946c16$export$e5c5a5f917a5871c(() => {
    if (!deterministicId) setId(
      (reactId) => reactId !== null && reactId !== void 0 ? reactId : String($1746a345f3d73bb7$var$count++)
    );
  }, [
    deterministicId
  ]);
  return deterministicId || (id ? `radix-${id}` : "");
}
function $b1b2314f5f9a1d84$export$25bec8c6f54ee79a(callback) {
  const callbackRef = reactExports.useRef(callback);
  reactExports.useEffect(() => {
    callbackRef.current = callback;
  });
  return reactExports.useMemo(
    () => (...args) => {
      var _callbackRef$current;
      return (_callbackRef$current = callbackRef.current) === null || _callbackRef$current === void 0 ? void 0 : _callbackRef$current.call(callbackRef, ...args);
    },
    []
  );
}
function $71cd76cc60e0454e$export$6f32135080cb4c3({ prop, defaultProp, onChange = () => {
} }) {
  const [uncontrolledProp, setUncontrolledProp] = $71cd76cc60e0454e$var$useUncontrolledState({
    defaultProp,
    onChange
  });
  const isControlled = prop !== void 0;
  const value1 = isControlled ? prop : uncontrolledProp;
  const handleChange = $b1b2314f5f9a1d84$export$25bec8c6f54ee79a(onChange);
  const setValue = reactExports.useCallback((nextValue) => {
    if (isControlled) {
      const setter = nextValue;
      const value = typeof nextValue === "function" ? setter(prop) : nextValue;
      if (value !== prop) handleChange(value);
    } else setUncontrolledProp(nextValue);
  }, [
    isControlled,
    prop,
    setUncontrolledProp,
    handleChange
  ]);
  return [
    value1,
    setValue
  ];
}
function $71cd76cc60e0454e$var$useUncontrolledState({ defaultProp, onChange }) {
  const uncontrolledState = reactExports.useState(defaultProp);
  const [value] = uncontrolledState;
  const prevValueRef = reactExports.useRef(value);
  const handleChange = $b1b2314f5f9a1d84$export$25bec8c6f54ee79a(onChange);
  reactExports.useEffect(() => {
    if (prevValueRef.current !== value) {
      handleChange(value);
      prevValueRef.current = value;
    }
  }, [
    value,
    prevValueRef,
    handleChange
  ]);
  return uncontrolledState;
}
const $5e63c961fc1ce211$export$8c6ed5c666ac1360 = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const { children, ...slotProps } = props;
  const childrenArray = reactExports.Children.toArray(children);
  const slottable = childrenArray.find($5e63c961fc1ce211$var$isSlottable);
  if (slottable) {
    const newElement = slottable.props.children;
    const newChildren = childrenArray.map((child) => {
      if (child === slottable) {
        if (reactExports.Children.count(newElement) > 1) return reactExports.Children.only(null);
        return /* @__PURE__ */ reactExports.isValidElement(newElement) ? newElement.props.children : null;
      } else return child;
    });
    return /* @__PURE__ */ reactExports.createElement($5e63c961fc1ce211$var$SlotClone, _extends({}, slotProps, {
      ref: forwardedRef
    }), /* @__PURE__ */ reactExports.isValidElement(newElement) ? /* @__PURE__ */ reactExports.cloneElement(newElement, void 0, newChildren) : null);
  }
  return /* @__PURE__ */ reactExports.createElement($5e63c961fc1ce211$var$SlotClone, _extends({}, slotProps, {
    ref: forwardedRef
  }), children);
});
$5e63c961fc1ce211$export$8c6ed5c666ac1360.displayName = "Slot";
const $5e63c961fc1ce211$var$SlotClone = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const { children, ...slotProps } = props;
  if (/* @__PURE__ */ reactExports.isValidElement(children)) return /* @__PURE__ */ reactExports.cloneElement(children, {
    ...$5e63c961fc1ce211$var$mergeProps(slotProps, children.props),
    ref: forwardedRef ? $6ed0406888f73fc4$export$43e446d32b3d21af(forwardedRef, children.ref) : children.ref
  });
  return reactExports.Children.count(children) > 1 ? reactExports.Children.only(null) : null;
});
$5e63c961fc1ce211$var$SlotClone.displayName = "SlotClone";
const $5e63c961fc1ce211$export$d9f1ccf0bdb05d45 = ({ children }) => {
  return /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, children);
};
function $5e63c961fc1ce211$var$isSlottable(child) {
  return /* @__PURE__ */ reactExports.isValidElement(child) && child.type === $5e63c961fc1ce211$export$d9f1ccf0bdb05d45;
}
function $5e63c961fc1ce211$var$mergeProps(slotProps, childProps) {
  const overrideProps = {
    ...childProps
  };
  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];
    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      if (slotPropValue && childPropValue) overrideProps[propName] = (...args) => {
        childPropValue(...args);
        slotPropValue(...args);
      };
      else if (slotPropValue) overrideProps[propName] = slotPropValue;
    } else if (propName === "style") overrideProps[propName] = {
      ...slotPropValue,
      ...childPropValue
    };
    else if (propName === "className") overrideProps[propName] = [
      slotPropValue,
      childPropValue
    ].filter(Boolean).join(" ");
  }
  return {
    ...slotProps,
    ...overrideProps
  };
}
const $8927f6f2acc4f386$var$NODES = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "span",
  "svg",
  "ul"
];
const $8927f6f2acc4f386$export$250ffa63cdc0d034 = $8927f6f2acc4f386$var$NODES.reduce((primitive, node) => {
  const Node = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
    const { asChild, ...primitiveProps } = props;
    const Comp = asChild ? $5e63c961fc1ce211$export$8c6ed5c666ac1360 : node;
    reactExports.useEffect(() => {
      window[Symbol.for("radix-ui")] = true;
    }, []);
    return /* @__PURE__ */ reactExports.createElement(Comp, _extends({}, primitiveProps, {
      ref: forwardedRef
    }));
  });
  Node.displayName = `Primitive.${node}`;
  return {
    ...primitive,
    [node]: Node
  };
}, {});
function $8927f6f2acc4f386$export$6d1a0317bde7de7f(target, event) {
  if (target) reactDomExports.flushSync(
    () => target.dispatchEvent(event)
  );
}
function $addc16e1bbe58fd0$export$3a72a57244d6e765(onEscapeKeyDownProp, ownerDocument = globalThis === null || globalThis === void 0 ? void 0 : globalThis.document) {
  const onEscapeKeyDown = $b1b2314f5f9a1d84$export$25bec8c6f54ee79a(onEscapeKeyDownProp);
  reactExports.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onEscapeKeyDown(event);
    };
    ownerDocument.addEventListener("keydown", handleKeyDown);
    return () => ownerDocument.removeEventListener("keydown", handleKeyDown);
  }, [
    onEscapeKeyDown,
    ownerDocument
  ]);
}
const $5cb92bef7577960e$var$CONTEXT_UPDATE = "dismissableLayer.update";
const $5cb92bef7577960e$var$POINTER_DOWN_OUTSIDE = "dismissableLayer.pointerDownOutside";
const $5cb92bef7577960e$var$FOCUS_OUTSIDE = "dismissableLayer.focusOutside";
let $5cb92bef7577960e$var$originalBodyPointerEvents;
const $5cb92bef7577960e$var$DismissableLayerContext = /* @__PURE__ */ reactExports.createContext({
  layers: /* @__PURE__ */ new Set(),
  layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
  branches: /* @__PURE__ */ new Set()
});
const $5cb92bef7577960e$export$177fb62ff3ec1f22 = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  var _node$ownerDocument;
  const { disableOutsidePointerEvents = false, onEscapeKeyDown, onPointerDownOutside, onFocusOutside, onInteractOutside, onDismiss, ...layerProps } = props;
  const context = reactExports.useContext($5cb92bef7577960e$var$DismissableLayerContext);
  const [node1, setNode] = reactExports.useState(null);
  const ownerDocument = (_node$ownerDocument = node1 === null || node1 === void 0 ? void 0 : node1.ownerDocument) !== null && _node$ownerDocument !== void 0 ? _node$ownerDocument : globalThis === null || globalThis === void 0 ? void 0 : globalThis.document;
  const [, force] = reactExports.useState({});
  const composedRefs = $6ed0406888f73fc4$export$c7b2cbe3552a0d05(
    forwardedRef,
    (node) => setNode(node)
  );
  const layers = Array.from(context.layers);
  const [highestLayerWithOutsidePointerEventsDisabled] = [
    ...context.layersWithOutsidePointerEventsDisabled
  ].slice(-1);
  const highestLayerWithOutsidePointerEventsDisabledIndex = layers.indexOf(highestLayerWithOutsidePointerEventsDisabled);
  const index = node1 ? layers.indexOf(node1) : -1;
  const isBodyPointerEventsDisabled = context.layersWithOutsidePointerEventsDisabled.size > 0;
  const isPointerEventsEnabled = index >= highestLayerWithOutsidePointerEventsDisabledIndex;
  const pointerDownOutside = $5cb92bef7577960e$var$usePointerDownOutside((event) => {
    const target = event.target;
    const isPointerDownOnBranch = [
      ...context.branches
    ].some(
      (branch) => branch.contains(target)
    );
    if (!isPointerEventsEnabled || isPointerDownOnBranch) return;
    onPointerDownOutside === null || onPointerDownOutside === void 0 || onPointerDownOutside(event);
    onInteractOutside === null || onInteractOutside === void 0 || onInteractOutside(event);
    if (!event.defaultPrevented) onDismiss === null || onDismiss === void 0 || onDismiss();
  }, ownerDocument);
  const focusOutside = $5cb92bef7577960e$var$useFocusOutside((event) => {
    const target = event.target;
    const isFocusInBranch = [
      ...context.branches
    ].some(
      (branch) => branch.contains(target)
    );
    if (isFocusInBranch) return;
    onFocusOutside === null || onFocusOutside === void 0 || onFocusOutside(event);
    onInteractOutside === null || onInteractOutside === void 0 || onInteractOutside(event);
    if (!event.defaultPrevented) onDismiss === null || onDismiss === void 0 || onDismiss();
  }, ownerDocument);
  $addc16e1bbe58fd0$export$3a72a57244d6e765((event) => {
    const isHighestLayer = index === context.layers.size - 1;
    if (!isHighestLayer) return;
    onEscapeKeyDown === null || onEscapeKeyDown === void 0 || onEscapeKeyDown(event);
    if (!event.defaultPrevented && onDismiss) {
      event.preventDefault();
      onDismiss();
    }
  }, ownerDocument);
  reactExports.useEffect(() => {
    if (!node1) return;
    if (disableOutsidePointerEvents) {
      if (context.layersWithOutsidePointerEventsDisabled.size === 0) {
        $5cb92bef7577960e$var$originalBodyPointerEvents = ownerDocument.body.style.pointerEvents;
        ownerDocument.body.style.pointerEvents = "none";
      }
      context.layersWithOutsidePointerEventsDisabled.add(node1);
    }
    context.layers.add(node1);
    $5cb92bef7577960e$var$dispatchUpdate();
    return () => {
      if (disableOutsidePointerEvents && context.layersWithOutsidePointerEventsDisabled.size === 1) ownerDocument.body.style.pointerEvents = $5cb92bef7577960e$var$originalBodyPointerEvents;
    };
  }, [
    node1,
    ownerDocument,
    disableOutsidePointerEvents,
    context
  ]);
  reactExports.useEffect(() => {
    return () => {
      if (!node1) return;
      context.layers.delete(node1);
      context.layersWithOutsidePointerEventsDisabled.delete(node1);
      $5cb92bef7577960e$var$dispatchUpdate();
    };
  }, [
    node1,
    context
  ]);
  reactExports.useEffect(() => {
    const handleUpdate = () => force({});
    document.addEventListener($5cb92bef7577960e$var$CONTEXT_UPDATE, handleUpdate);
    return () => document.removeEventListener($5cb92bef7577960e$var$CONTEXT_UPDATE, handleUpdate);
  }, []);
  return /* @__PURE__ */ reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.div, _extends({}, layerProps, {
    ref: composedRefs,
    style: {
      pointerEvents: isBodyPointerEventsDisabled ? isPointerEventsEnabled ? "auto" : "none" : void 0,
      ...props.style
    },
    onFocusCapture: $e42e1063c40fb3ef$export$b9ecd428b558ff10(props.onFocusCapture, focusOutside.onFocusCapture),
    onBlurCapture: $e42e1063c40fb3ef$export$b9ecd428b558ff10(props.onBlurCapture, focusOutside.onBlurCapture),
    onPointerDownCapture: $e42e1063c40fb3ef$export$b9ecd428b558ff10(props.onPointerDownCapture, pointerDownOutside.onPointerDownCapture)
  }));
});
function $5cb92bef7577960e$var$usePointerDownOutside(onPointerDownOutside, ownerDocument = globalThis === null || globalThis === void 0 ? void 0 : globalThis.document) {
  const handlePointerDownOutside = $b1b2314f5f9a1d84$export$25bec8c6f54ee79a(onPointerDownOutside);
  const isPointerInsideReactTreeRef = reactExports.useRef(false);
  const handleClickRef = reactExports.useRef(() => {
  });
  reactExports.useEffect(() => {
    const handlePointerDown = (event) => {
      if (event.target && !isPointerInsideReactTreeRef.current) {
        let handleAndDispatchPointerDownOutsideEvent = function() {
          $5cb92bef7577960e$var$handleAndDispatchCustomEvent($5cb92bef7577960e$var$POINTER_DOWN_OUTSIDE, handlePointerDownOutside, eventDetail, {
            discrete: true
          });
        };
        const eventDetail = {
          originalEvent: event
        };
        if (event.pointerType === "touch") {
          ownerDocument.removeEventListener("click", handleClickRef.current);
          handleClickRef.current = handleAndDispatchPointerDownOutsideEvent;
          ownerDocument.addEventListener("click", handleClickRef.current, {
            once: true
          });
        } else handleAndDispatchPointerDownOutsideEvent();
      } else
        ownerDocument.removeEventListener("click", handleClickRef.current);
      isPointerInsideReactTreeRef.current = false;
    };
    const timerId = window.setTimeout(() => {
      ownerDocument.addEventListener("pointerdown", handlePointerDown);
    }, 0);
    return () => {
      window.clearTimeout(timerId);
      ownerDocument.removeEventListener("pointerdown", handlePointerDown);
      ownerDocument.removeEventListener("click", handleClickRef.current);
    };
  }, [
    ownerDocument,
    handlePointerDownOutside
  ]);
  return {
    // ensures we check React component tree (not just DOM tree)
    onPointerDownCapture: () => isPointerInsideReactTreeRef.current = true
  };
}
function $5cb92bef7577960e$var$useFocusOutside(onFocusOutside, ownerDocument = globalThis === null || globalThis === void 0 ? void 0 : globalThis.document) {
  const handleFocusOutside = $b1b2314f5f9a1d84$export$25bec8c6f54ee79a(onFocusOutside);
  const isFocusInsideReactTreeRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    const handleFocus = (event) => {
      if (event.target && !isFocusInsideReactTreeRef.current) {
        const eventDetail = {
          originalEvent: event
        };
        $5cb92bef7577960e$var$handleAndDispatchCustomEvent($5cb92bef7577960e$var$FOCUS_OUTSIDE, handleFocusOutside, eventDetail, {
          discrete: false
        });
      }
    };
    ownerDocument.addEventListener("focusin", handleFocus);
    return () => ownerDocument.removeEventListener("focusin", handleFocus);
  }, [
    ownerDocument,
    handleFocusOutside
  ]);
  return {
    onFocusCapture: () => isFocusInsideReactTreeRef.current = true,
    onBlurCapture: () => isFocusInsideReactTreeRef.current = false
  };
}
function $5cb92bef7577960e$var$dispatchUpdate() {
  const event = new CustomEvent($5cb92bef7577960e$var$CONTEXT_UPDATE);
  document.dispatchEvent(event);
}
function $5cb92bef7577960e$var$handleAndDispatchCustomEvent(name, handler, detail, { discrete }) {
  const target = detail.originalEvent.target;
  const event = new CustomEvent(name, {
    bubbles: false,
    cancelable: true,
    detail
  });
  if (handler) target.addEventListener(name, handler, {
    once: true
  });
  if (discrete) $8927f6f2acc4f386$export$6d1a0317bde7de7f(target, event);
  else target.dispatchEvent(event);
}
const $d3863c46a17e8a28$var$AUTOFOCUS_ON_MOUNT = "focusScope.autoFocusOnMount";
const $d3863c46a17e8a28$var$AUTOFOCUS_ON_UNMOUNT = "focusScope.autoFocusOnUnmount";
const $d3863c46a17e8a28$var$EVENT_OPTIONS = {
  bubbles: false,
  cancelable: true
};
const $d3863c46a17e8a28$export$20e40289641fbbb6 = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const { loop = false, trapped = false, onMountAutoFocus: onMountAutoFocusProp, onUnmountAutoFocus: onUnmountAutoFocusProp, ...scopeProps } = props;
  const [container1, setContainer] = reactExports.useState(null);
  const onMountAutoFocus = $b1b2314f5f9a1d84$export$25bec8c6f54ee79a(onMountAutoFocusProp);
  const onUnmountAutoFocus = $b1b2314f5f9a1d84$export$25bec8c6f54ee79a(onUnmountAutoFocusProp);
  const lastFocusedElementRef = reactExports.useRef(null);
  const composedRefs = $6ed0406888f73fc4$export$c7b2cbe3552a0d05(
    forwardedRef,
    (node) => setContainer(node)
  );
  const focusScope = reactExports.useRef({
    paused: false,
    pause() {
      this.paused = true;
    },
    resume() {
      this.paused = false;
    }
  }).current;
  reactExports.useEffect(() => {
    if (trapped) {
      let handleFocusIn = function(event) {
        if (focusScope.paused || !container1) return;
        const target = event.target;
        if (container1.contains(target)) lastFocusedElementRef.current = target;
        else $d3863c46a17e8a28$var$focus(lastFocusedElementRef.current, {
          select: true
        });
      }, handleFocusOut = function(event) {
        if (focusScope.paused || !container1) return;
        const relatedTarget = event.relatedTarget;
        if (relatedTarget === null) return;
        if (!container1.contains(relatedTarget)) $d3863c46a17e8a28$var$focus(lastFocusedElementRef.current, {
          select: true
        });
      }, handleMutations = function(mutations) {
        const focusedElement = document.activeElement;
        if (focusedElement !== document.body) return;
        for (const mutation of mutations) if (mutation.removedNodes.length > 0) $d3863c46a17e8a28$var$focus(container1);
      };
      document.addEventListener("focusin", handleFocusIn);
      document.addEventListener("focusout", handleFocusOut);
      const mutationObserver = new MutationObserver(handleMutations);
      if (container1) mutationObserver.observe(container1, {
        childList: true,
        subtree: true
      });
      return () => {
        document.removeEventListener("focusin", handleFocusIn);
        document.removeEventListener("focusout", handleFocusOut);
        mutationObserver.disconnect();
      };
    }
  }, [
    trapped,
    container1,
    focusScope.paused
  ]);
  reactExports.useEffect(() => {
    if (container1) {
      $d3863c46a17e8a28$var$focusScopesStack.add(focusScope);
      const previouslyFocusedElement = document.activeElement;
      const hasFocusedCandidate = container1.contains(previouslyFocusedElement);
      if (!hasFocusedCandidate) {
        const mountEvent = new CustomEvent($d3863c46a17e8a28$var$AUTOFOCUS_ON_MOUNT, $d3863c46a17e8a28$var$EVENT_OPTIONS);
        container1.addEventListener($d3863c46a17e8a28$var$AUTOFOCUS_ON_MOUNT, onMountAutoFocus);
        container1.dispatchEvent(mountEvent);
        if (!mountEvent.defaultPrevented) {
          $d3863c46a17e8a28$var$focusFirst($d3863c46a17e8a28$var$removeLinks($d3863c46a17e8a28$var$getTabbableCandidates(container1)), {
            select: true
          });
          if (document.activeElement === previouslyFocusedElement) $d3863c46a17e8a28$var$focus(container1);
        }
      }
      return () => {
        container1.removeEventListener($d3863c46a17e8a28$var$AUTOFOCUS_ON_MOUNT, onMountAutoFocus);
        setTimeout(() => {
          const unmountEvent = new CustomEvent($d3863c46a17e8a28$var$AUTOFOCUS_ON_UNMOUNT, $d3863c46a17e8a28$var$EVENT_OPTIONS);
          container1.addEventListener($d3863c46a17e8a28$var$AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus);
          container1.dispatchEvent(unmountEvent);
          if (!unmountEvent.defaultPrevented) $d3863c46a17e8a28$var$focus(previouslyFocusedElement !== null && previouslyFocusedElement !== void 0 ? previouslyFocusedElement : document.body, {
            select: true
          });
          container1.removeEventListener($d3863c46a17e8a28$var$AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus);
          $d3863c46a17e8a28$var$focusScopesStack.remove(focusScope);
        }, 0);
      };
    }
  }, [
    container1,
    onMountAutoFocus,
    onUnmountAutoFocus,
    focusScope
  ]);
  const handleKeyDown = reactExports.useCallback((event) => {
    if (!loop && !trapped) return;
    if (focusScope.paused) return;
    const isTabKey = event.key === "Tab" && !event.altKey && !event.ctrlKey && !event.metaKey;
    const focusedElement = document.activeElement;
    if (isTabKey && focusedElement) {
      const container = event.currentTarget;
      const [first, last] = $d3863c46a17e8a28$var$getTabbableEdges(container);
      const hasTabbableElementsInside = first && last;
      if (!hasTabbableElementsInside) {
        if (focusedElement === container) event.preventDefault();
      } else {
        if (!event.shiftKey && focusedElement === last) {
          event.preventDefault();
          if (loop) $d3863c46a17e8a28$var$focus(first, {
            select: true
          });
        } else if (event.shiftKey && focusedElement === first) {
          event.preventDefault();
          if (loop) $d3863c46a17e8a28$var$focus(last, {
            select: true
          });
        }
      }
    }
  }, [
    loop,
    trapped,
    focusScope.paused
  ]);
  return /* @__PURE__ */ reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.div, _extends({
    tabIndex: -1
  }, scopeProps, {
    ref: composedRefs,
    onKeyDown: handleKeyDown
  }));
});
function $d3863c46a17e8a28$var$focusFirst(candidates, { select = false } = {}) {
  const previouslyFocusedElement = document.activeElement;
  for (const candidate of candidates) {
    $d3863c46a17e8a28$var$focus(candidate, {
      select
    });
    if (document.activeElement !== previouslyFocusedElement) return;
  }
}
function $d3863c46a17e8a28$var$getTabbableEdges(container) {
  const candidates = $d3863c46a17e8a28$var$getTabbableCandidates(container);
  const first = $d3863c46a17e8a28$var$findVisible(candidates, container);
  const last = $d3863c46a17e8a28$var$findVisible(candidates.reverse(), container);
  return [
    first,
    last
  ];
}
function $d3863c46a17e8a28$var$getTabbableCandidates(container) {
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
function $d3863c46a17e8a28$var$findVisible(elements, container) {
  for (const element of elements) {
    if (!$d3863c46a17e8a28$var$isHidden(element, {
      upTo: container
    })) return element;
  }
}
function $d3863c46a17e8a28$var$isHidden(node, { upTo }) {
  if (getComputedStyle(node).visibility === "hidden") return true;
  while (node) {
    if (upTo !== void 0 && node === upTo) return false;
    if (getComputedStyle(node).display === "none") return true;
    node = node.parentElement;
  }
  return false;
}
function $d3863c46a17e8a28$var$isSelectableInput(element) {
  return element instanceof HTMLInputElement && "select" in element;
}
function $d3863c46a17e8a28$var$focus(element, { select = false } = {}) {
  if (element && element.focus) {
    const previouslyFocusedElement = document.activeElement;
    element.focus({
      preventScroll: true
    });
    if (element !== previouslyFocusedElement && $d3863c46a17e8a28$var$isSelectableInput(element) && select) element.select();
  }
}
const $d3863c46a17e8a28$var$focusScopesStack = $d3863c46a17e8a28$var$createFocusScopesStack();
function $d3863c46a17e8a28$var$createFocusScopesStack() {
  let stack = [];
  return {
    add(focusScope) {
      const activeFocusScope = stack[0];
      if (focusScope !== activeFocusScope) activeFocusScope === null || activeFocusScope === void 0 || activeFocusScope.pause();
      stack = $d3863c46a17e8a28$var$arrayRemove(stack, focusScope);
      stack.unshift(focusScope);
    },
    remove(focusScope) {
      var _stack$;
      stack = $d3863c46a17e8a28$var$arrayRemove(stack, focusScope);
      (_stack$ = stack[0]) === null || _stack$ === void 0 || _stack$.resume();
    }
  };
}
function $d3863c46a17e8a28$var$arrayRemove(array, item) {
  const updatedArray = [
    ...array
  ];
  const index = updatedArray.indexOf(item);
  if (index !== -1) updatedArray.splice(index, 1);
  return updatedArray;
}
function $d3863c46a17e8a28$var$removeLinks(items) {
  return items.filter(
    (item) => item.tagName !== "A"
  );
}
const $f1701beae083dbae$export$602eac185826482c = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  var _globalThis$document;
  const { container = globalThis === null || globalThis === void 0 ? void 0 : (_globalThis$document = globalThis.document) === null || _globalThis$document === void 0 ? void 0 : _globalThis$document.body, ...portalProps } = props;
  return container ? /* @__PURE__ */ ReactDOM.createPortal(/* @__PURE__ */ reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.div, _extends({}, portalProps, {
    ref: forwardedRef
  })), container) : null;
});
function $fe963b355347cc68$export$3e6543de14f8614f(initialState, machine) {
  return reactExports.useReducer((state, event) => {
    const nextState = machine[state][event];
    return nextState !== null && nextState !== void 0 ? nextState : state;
  }, initialState);
}
const $921a889cee6df7e8$export$99c2b779aa4e8b8b = (props) => {
  const { present, children } = props;
  const presence = $921a889cee6df7e8$var$usePresence(present);
  const child = typeof children === "function" ? children({
    present: presence.isPresent
  }) : reactExports.Children.only(children);
  const ref = $6ed0406888f73fc4$export$c7b2cbe3552a0d05(presence.ref, child.ref);
  const forceMount = typeof children === "function";
  return forceMount || presence.isPresent ? /* @__PURE__ */ reactExports.cloneElement(child, {
    ref
  }) : null;
};
$921a889cee6df7e8$export$99c2b779aa4e8b8b.displayName = "Presence";
function $921a889cee6df7e8$var$usePresence(present) {
  const [node1, setNode] = reactExports.useState();
  const stylesRef = reactExports.useRef({});
  const prevPresentRef = reactExports.useRef(present);
  const prevAnimationNameRef = reactExports.useRef("none");
  const initialState = present ? "mounted" : "unmounted";
  const [state, send] = $fe963b355347cc68$export$3e6543de14f8614f(initialState, {
    mounted: {
      UNMOUNT: "unmounted",
      ANIMATION_OUT: "unmountSuspended"
    },
    unmountSuspended: {
      MOUNT: "mounted",
      ANIMATION_END: "unmounted"
    },
    unmounted: {
      MOUNT: "mounted"
    }
  });
  reactExports.useEffect(() => {
    const currentAnimationName = $921a889cee6df7e8$var$getAnimationName(stylesRef.current);
    prevAnimationNameRef.current = state === "mounted" ? currentAnimationName : "none";
  }, [
    state
  ]);
  $9f79659886946c16$export$e5c5a5f917a5871c(() => {
    const styles = stylesRef.current;
    const wasPresent = prevPresentRef.current;
    const hasPresentChanged = wasPresent !== present;
    if (hasPresentChanged) {
      const prevAnimationName = prevAnimationNameRef.current;
      const currentAnimationName = $921a889cee6df7e8$var$getAnimationName(styles);
      if (present) send("MOUNT");
      else if (currentAnimationName === "none" || (styles === null || styles === void 0 ? void 0 : styles.display) === "none")
        send("UNMOUNT");
      else {
        const isAnimating = prevAnimationName !== currentAnimationName;
        if (wasPresent && isAnimating) send("ANIMATION_OUT");
        else send("UNMOUNT");
      }
      prevPresentRef.current = present;
    }
  }, [
    present,
    send
  ]);
  $9f79659886946c16$export$e5c5a5f917a5871c(() => {
    if (node1) {
      const handleAnimationEnd = (event) => {
        const currentAnimationName = $921a889cee6df7e8$var$getAnimationName(stylesRef.current);
        const isCurrentAnimation = currentAnimationName.includes(event.animationName);
        if (event.target === node1 && isCurrentAnimation)
          reactDomExports.flushSync(
            () => send("ANIMATION_END")
          );
      };
      const handleAnimationStart = (event) => {
        if (event.target === node1)
          prevAnimationNameRef.current = $921a889cee6df7e8$var$getAnimationName(stylesRef.current);
      };
      node1.addEventListener("animationstart", handleAnimationStart);
      node1.addEventListener("animationcancel", handleAnimationEnd);
      node1.addEventListener("animationend", handleAnimationEnd);
      return () => {
        node1.removeEventListener("animationstart", handleAnimationStart);
        node1.removeEventListener("animationcancel", handleAnimationEnd);
        node1.removeEventListener("animationend", handleAnimationEnd);
      };
    } else
      send("ANIMATION_END");
  }, [
    node1,
    send
  ]);
  return {
    isPresent: [
      "mounted",
      "unmountSuspended"
    ].includes(state),
    ref: reactExports.useCallback((node) => {
      if (node) stylesRef.current = getComputedStyle(node);
      setNode(node);
    }, [])
  };
}
function $921a889cee6df7e8$var$getAnimationName(styles) {
  return (styles === null || styles === void 0 ? void 0 : styles.animationName) || "none";
}
let $3db38b7d1fb3fe6a$var$count = 0;
function $3db38b7d1fb3fe6a$export$b7ece24a22aeda8c() {
  reactExports.useEffect(() => {
    var _edgeGuards$, _edgeGuards$2;
    const edgeGuards = document.querySelectorAll("[data-radix-focus-guard]");
    document.body.insertAdjacentElement("afterbegin", (_edgeGuards$ = edgeGuards[0]) !== null && _edgeGuards$ !== void 0 ? _edgeGuards$ : $3db38b7d1fb3fe6a$var$createFocusGuard());
    document.body.insertAdjacentElement("beforeend", (_edgeGuards$2 = edgeGuards[1]) !== null && _edgeGuards$2 !== void 0 ? _edgeGuards$2 : $3db38b7d1fb3fe6a$var$createFocusGuard());
    $3db38b7d1fb3fe6a$var$count++;
    return () => {
      if ($3db38b7d1fb3fe6a$var$count === 1) document.querySelectorAll("[data-radix-focus-guard]").forEach(
        (node) => node.remove()
      );
      $3db38b7d1fb3fe6a$var$count--;
    };
  }, []);
}
function $3db38b7d1fb3fe6a$var$createFocusGuard() {
  const element = document.createElement("span");
  element.setAttribute("data-radix-focus-guard", "");
  element.tabIndex = 0;
  element.style.cssText = "outline: none; opacity: 0; position: fixed; pointer-events: none";
  return element;
}
var effectCar$1 = createSidecarMedium();
var nothing$1 = function() {
  return;
};
var RemoveScroll$1 = reactExports.forwardRef(function(props, parentRef) {
  var ref = reactExports.useRef(null);
  var _a = reactExports.useState({
    onScrollCapture: nothing$1,
    onWheelCapture: nothing$1,
    onTouchMoveCapture: nothing$1
  }), callbacks = _a[0], setCallbacks = _a[1];
  var forwardProps = props.forwardProps, children = props.children, className = props.className, removeScrollBar = props.removeScrollBar, enabled = props.enabled, shards = props.shards, sideCar = props.sideCar, noIsolation = props.noIsolation, inert = props.inert, allowPinchZoom = props.allowPinchZoom, _b = props.as, Container = _b === void 0 ? "div" : _b, rest = __rest(props, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noIsolation", "inert", "allowPinchZoom", "as"]);
  var SideCar2 = sideCar;
  var containerRef = useMergeRefs([ref, parentRef]);
  var containerProps = __assign(__assign({}, rest), callbacks);
  return reactExports.createElement(
    reactExports.Fragment,
    null,
    enabled && reactExports.createElement(SideCar2, { sideCar: effectCar$1, removeScrollBar, shards, noIsolation, inert, setCallbacks, allowPinchZoom: !!allowPinchZoom, lockRef: ref }),
    forwardProps ? reactExports.cloneElement(reactExports.Children.only(children), __assign(__assign({}, containerProps), { ref: containerRef })) : reactExports.createElement(Container, __assign({}, containerProps, { className, ref: containerRef }), children)
  );
});
RemoveScroll$1.defaultProps = {
  enabled: true,
  removeScrollBar: true,
  inert: false
};
RemoveScroll$1.classNames = {
  fullWidth: fullWidthClassName,
  zeroRight: zeroRightClassName
};
var passiveSupported$1 = false;
if (typeof window !== "undefined") {
  try {
    var options$1 = Object.defineProperty({}, "passive", {
      get: function() {
        passiveSupported$1 = true;
        return true;
      }
    });
    window.addEventListener("test", options$1, options$1);
    window.removeEventListener("test", options$1, options$1);
  } catch (err) {
    passiveSupported$1 = false;
  }
}
var nonPassive$1 = passiveSupported$1 ? { passive: false } : false;
var alwaysContainsScroll$1 = function(node) {
  return node.tagName === "TEXTAREA";
};
var elementCanBeScrolled$1 = function(node, overflow) {
  var styles = window.getComputedStyle(node);
  return (
    // not-not-scrollable
    styles[overflow] !== "hidden" && // contains scroll inside self
    !(styles.overflowY === styles.overflowX && !alwaysContainsScroll$1(node) && styles[overflow] === "visible")
  );
};
var elementCouldBeVScrolled$1 = function(node) {
  return elementCanBeScrolled$1(node, "overflowY");
};
var elementCouldBeHScrolled$1 = function(node) {
  return elementCanBeScrolled$1(node, "overflowX");
};
var locationCouldBeScrolled$1 = function(axis, node) {
  var current = node;
  do {
    if (typeof ShadowRoot !== "undefined" && current instanceof ShadowRoot) {
      current = current.host;
    }
    var isScrollable = elementCouldBeScrolled$1(axis, current);
    if (isScrollable) {
      var _a = getScrollVariables$1(axis, current), s2 = _a[1], d2 = _a[2];
      if (s2 > d2) {
        return true;
      }
    }
    current = current.parentNode;
  } while (current && current !== document.body);
  return false;
};
var getVScrollVariables$1 = function(_a) {
  var scrollTop = _a.scrollTop, scrollHeight = _a.scrollHeight, clientHeight = _a.clientHeight;
  return [
    scrollTop,
    scrollHeight,
    clientHeight
  ];
};
var getHScrollVariables$1 = function(_a) {
  var scrollLeft = _a.scrollLeft, scrollWidth = _a.scrollWidth, clientWidth = _a.clientWidth;
  return [
    scrollLeft,
    scrollWidth,
    clientWidth
  ];
};
var elementCouldBeScrolled$1 = function(axis, node) {
  return axis === "v" ? elementCouldBeVScrolled$1(node) : elementCouldBeHScrolled$1(node);
};
var getScrollVariables$1 = function(axis, node) {
  return axis === "v" ? getVScrollVariables$1(node) : getHScrollVariables$1(node);
};
var getDirectionFactor$1 = function(axis, direction) {
  return axis === "h" && direction === "rtl" ? -1 : 1;
};
var handleScroll$1 = function(axis, endTarget, event, sourceDelta, noOverscroll) {
  var directionFactor = getDirectionFactor$1(axis, window.getComputedStyle(endTarget).direction);
  var delta = directionFactor * sourceDelta;
  var target = event.target;
  var targetInLock = endTarget.contains(target);
  var shouldCancelScroll = false;
  var isDeltaPositive = delta > 0;
  var availableScroll = 0;
  var availableScrollTop = 0;
  do {
    var _a = getScrollVariables$1(axis, target), position = _a[0], scroll_1 = _a[1], capacity = _a[2];
    var elementScroll = scroll_1 - capacity - directionFactor * position;
    if (position || elementScroll) {
      if (elementCouldBeScrolled$1(axis, target)) {
        availableScroll += elementScroll;
        availableScrollTop += position;
      }
    }
    target = target.parentNode;
  } while (
    // portaled content
    !targetInLock && target !== document.body || // self content
    targetInLock && (endTarget.contains(target) || endTarget === target)
  );
  if (isDeltaPositive && (availableScroll === 0 || !noOverscroll)) {
    shouldCancelScroll = true;
  } else if (!isDeltaPositive && (availableScrollTop === 0 || !noOverscroll)) {
    shouldCancelScroll = true;
  }
  return shouldCancelScroll;
};
var getTouchXY$1 = function(event) {
  return "changedTouches" in event ? [event.changedTouches[0].clientX, event.changedTouches[0].clientY] : [0, 0];
};
var getDeltaXY$1 = function(event) {
  return [event.deltaX, event.deltaY];
};
var extractRef$1 = function(ref) {
  return ref && "current" in ref ? ref.current : ref;
};
var deltaCompare$1 = function(x, y2) {
  return x[0] === y2[0] && x[1] === y2[1];
};
var generateStyle$1 = function(id) {
  return "\n  .block-interactivity-".concat(id, " {pointer-events: none;}\n  .allow-interactivity-").concat(id, " {pointer-events: all;}\n");
};
var idCounter$1 = 0;
var lockStack$1 = [];
function RemoveScrollSideCar$1(props) {
  var shouldPreventQueue = reactExports.useRef([]);
  var touchStartRef = reactExports.useRef([0, 0]);
  var activeAxis = reactExports.useRef();
  var id = reactExports.useState(idCounter$1++)[0];
  var Style = reactExports.useState(function() {
    return styleSingleton();
  })[0];
  var lastProps = reactExports.useRef(props);
  reactExports.useEffect(function() {
    lastProps.current = props;
  }, [props]);
  reactExports.useEffect(function() {
    if (props.inert) {
      document.body.classList.add("block-interactivity-".concat(id));
      var allow_1 = __spreadArray([props.lockRef.current], (props.shards || []).map(extractRef$1), true).filter(Boolean);
      allow_1.forEach(function(el) {
        return el.classList.add("allow-interactivity-".concat(id));
      });
      return function() {
        document.body.classList.remove("block-interactivity-".concat(id));
        allow_1.forEach(function(el) {
          return el.classList.remove("allow-interactivity-".concat(id));
        });
      };
    }
    return;
  }, [props.inert, props.lockRef.current, props.shards]);
  var shouldCancelEvent = reactExports.useCallback(function(event, parent) {
    if ("touches" in event && event.touches.length === 2) {
      return !lastProps.current.allowPinchZoom;
    }
    var touch = getTouchXY$1(event);
    var touchStart = touchStartRef.current;
    var deltaX = "deltaX" in event ? event.deltaX : touchStart[0] - touch[0];
    var deltaY = "deltaY" in event ? event.deltaY : touchStart[1] - touch[1];
    var currentAxis;
    var target = event.target;
    var moveDirection = Math.abs(deltaX) > Math.abs(deltaY) ? "h" : "v";
    if ("touches" in event && moveDirection === "h" && target.type === "range") {
      return false;
    }
    var canBeScrolledInMainDirection = locationCouldBeScrolled$1(moveDirection, target);
    if (!canBeScrolledInMainDirection) {
      return true;
    }
    if (canBeScrolledInMainDirection) {
      currentAxis = moveDirection;
    } else {
      currentAxis = moveDirection === "v" ? "h" : "v";
      canBeScrolledInMainDirection = locationCouldBeScrolled$1(moveDirection, target);
    }
    if (!canBeScrolledInMainDirection) {
      return false;
    }
    if (!activeAxis.current && "changedTouches" in event && (deltaX || deltaY)) {
      activeAxis.current = currentAxis;
    }
    if (!currentAxis) {
      return true;
    }
    var cancelingAxis = activeAxis.current || currentAxis;
    return handleScroll$1(cancelingAxis, parent, event, cancelingAxis === "h" ? deltaX : deltaY, true);
  }, []);
  var shouldPrevent = reactExports.useCallback(function(_event) {
    var event = _event;
    if (!lockStack$1.length || lockStack$1[lockStack$1.length - 1] !== Style) {
      return;
    }
    var delta = "deltaY" in event ? getDeltaXY$1(event) : getTouchXY$1(event);
    var sourceEvent = shouldPreventQueue.current.filter(function(e) {
      return e.name === event.type && e.target === event.target && deltaCompare$1(e.delta, delta);
    })[0];
    if (sourceEvent && sourceEvent.should) {
      if (event.cancelable) {
        event.preventDefault();
      }
      return;
    }
    if (!sourceEvent) {
      var shardNodes = (lastProps.current.shards || []).map(extractRef$1).filter(Boolean).filter(function(node) {
        return node.contains(event.target);
      });
      var shouldStop = shardNodes.length > 0 ? shouldCancelEvent(event, shardNodes[0]) : !lastProps.current.noIsolation;
      if (shouldStop) {
        if (event.cancelable) {
          event.preventDefault();
        }
      }
    }
  }, []);
  var shouldCancel = reactExports.useCallback(function(name, delta, target, should) {
    var event = { name, delta, target, should };
    shouldPreventQueue.current.push(event);
    setTimeout(function() {
      shouldPreventQueue.current = shouldPreventQueue.current.filter(function(e) {
        return e !== event;
      });
    }, 1);
  }, []);
  var scrollTouchStart = reactExports.useCallback(function(event) {
    touchStartRef.current = getTouchXY$1(event);
    activeAxis.current = void 0;
  }, []);
  var scrollWheel = reactExports.useCallback(function(event) {
    shouldCancel(event.type, getDeltaXY$1(event), event.target, shouldCancelEvent(event, props.lockRef.current));
  }, []);
  var scrollTouchMove = reactExports.useCallback(function(event) {
    shouldCancel(event.type, getTouchXY$1(event), event.target, shouldCancelEvent(event, props.lockRef.current));
  }, []);
  reactExports.useEffect(function() {
    lockStack$1.push(Style);
    props.setCallbacks({
      onScrollCapture: scrollWheel,
      onWheelCapture: scrollWheel,
      onTouchMoveCapture: scrollTouchMove
    });
    document.addEventListener("wheel", shouldPrevent, nonPassive$1);
    document.addEventListener("touchmove", shouldPrevent, nonPassive$1);
    document.addEventListener("touchstart", scrollTouchStart, nonPassive$1);
    return function() {
      lockStack$1 = lockStack$1.filter(function(inst) {
        return inst !== Style;
      });
      document.removeEventListener("wheel", shouldPrevent, nonPassive$1);
      document.removeEventListener("touchmove", shouldPrevent, nonPassive$1);
      document.removeEventListener("touchstart", scrollTouchStart, nonPassive$1);
    };
  }, []);
  var removeScrollBar = props.removeScrollBar, inert = props.inert;
  return reactExports.createElement(
    reactExports.Fragment,
    null,
    inert ? reactExports.createElement(Style, { styles: generateStyle$1(id) }) : null,
    removeScrollBar ? reactExports.createElement(RemoveScrollBar, { gapMode: "margin" }) : null
  );
}
const SideCar$1 = exportSidecar(effectCar$1, RemoveScrollSideCar$1);
var ReactRemoveScroll$1 = reactExports.forwardRef(function(props, ref) {
  return reactExports.createElement(RemoveScroll$1, __assign({}, props, { ref, sideCar: SideCar$1 }));
});
ReactRemoveScroll$1.classNames = RemoveScroll$1.classNames;
const $5d3850c4d0b4e6c7$var$DIALOG_NAME = "Dialog";
const [$5d3850c4d0b4e6c7$var$createDialogContext, $5d3850c4d0b4e6c7$export$cc702773b8ea3e41] = $c512c27ab02ef895$export$50c7b4e9d9f19c1($5d3850c4d0b4e6c7$var$DIALOG_NAME);
const [$5d3850c4d0b4e6c7$var$DialogProvider, $5d3850c4d0b4e6c7$var$useDialogContext] = $5d3850c4d0b4e6c7$var$createDialogContext($5d3850c4d0b4e6c7$var$DIALOG_NAME);
const $5d3850c4d0b4e6c7$export$3ddf2d174ce01153 = (props) => {
  const { __scopeDialog, children, open: openProp, defaultOpen, onOpenChange, modal = true } = props;
  const triggerRef = reactExports.useRef(null);
  const contentRef = reactExports.useRef(null);
  const [open = false, setOpen] = $71cd76cc60e0454e$export$6f32135080cb4c3({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange
  });
  return /* @__PURE__ */ reactExports.createElement($5d3850c4d0b4e6c7$var$DialogProvider, {
    scope: __scopeDialog,
    triggerRef,
    contentRef,
    contentId: $1746a345f3d73bb7$export$f680877a34711e37(),
    titleId: $1746a345f3d73bb7$export$f680877a34711e37(),
    descriptionId: $1746a345f3d73bb7$export$f680877a34711e37(),
    open,
    onOpenChange: setOpen,
    onOpenToggle: reactExports.useCallback(
      () => setOpen(
        (prevOpen) => !prevOpen
      ),
      [
        setOpen
      ]
    ),
    modal
  }, children);
};
const $5d3850c4d0b4e6c7$var$PORTAL_NAME = "DialogPortal";
const [$5d3850c4d0b4e6c7$var$PortalProvider, $5d3850c4d0b4e6c7$var$usePortalContext] = $5d3850c4d0b4e6c7$var$createDialogContext($5d3850c4d0b4e6c7$var$PORTAL_NAME, {
  forceMount: void 0
});
const $5d3850c4d0b4e6c7$export$dad7c95542bacce0 = (props) => {
  const { __scopeDialog, forceMount, children, container } = props;
  const context = $5d3850c4d0b4e6c7$var$useDialogContext($5d3850c4d0b4e6c7$var$PORTAL_NAME, __scopeDialog);
  return /* @__PURE__ */ reactExports.createElement($5d3850c4d0b4e6c7$var$PortalProvider, {
    scope: __scopeDialog,
    forceMount
  }, reactExports.Children.map(
    children,
    (child) => /* @__PURE__ */ reactExports.createElement($921a889cee6df7e8$export$99c2b779aa4e8b8b, {
      present: forceMount || context.open
    }, /* @__PURE__ */ reactExports.createElement($f1701beae083dbae$export$602eac185826482c, {
      asChild: true,
      container
    }, child))
  ));
};
const $5d3850c4d0b4e6c7$var$OVERLAY_NAME = "DialogOverlay";
const $5d3850c4d0b4e6c7$export$bd1d06c79be19e17 = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const portalContext = $5d3850c4d0b4e6c7$var$usePortalContext($5d3850c4d0b4e6c7$var$OVERLAY_NAME, props.__scopeDialog);
  const { forceMount = portalContext.forceMount, ...overlayProps } = props;
  const context = $5d3850c4d0b4e6c7$var$useDialogContext($5d3850c4d0b4e6c7$var$OVERLAY_NAME, props.__scopeDialog);
  return context.modal ? /* @__PURE__ */ reactExports.createElement($921a889cee6df7e8$export$99c2b779aa4e8b8b, {
    present: forceMount || context.open
  }, /* @__PURE__ */ reactExports.createElement($5d3850c4d0b4e6c7$var$DialogOverlayImpl, _extends({}, overlayProps, {
    ref: forwardedRef
  }))) : null;
});
const $5d3850c4d0b4e6c7$var$DialogOverlayImpl = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeDialog, ...overlayProps } = props;
  const context = $5d3850c4d0b4e6c7$var$useDialogContext($5d3850c4d0b4e6c7$var$OVERLAY_NAME, __scopeDialog);
  return (
    // Make sure `Content` is scrollable even when it doesn't live inside `RemoveScroll`
    // ie. when `Overlay` and `Content` are siblings
    /* @__PURE__ */ reactExports.createElement(ReactRemoveScroll$1, {
      as: $5e63c961fc1ce211$export$8c6ed5c666ac1360,
      allowPinchZoom: true,
      shards: [
        context.contentRef
      ]
    }, /* @__PURE__ */ reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.div, _extends({
      "data-state": $5d3850c4d0b4e6c7$var$getState(context.open)
    }, overlayProps, {
      ref: forwardedRef,
      style: {
        pointerEvents: "auto",
        ...overlayProps.style
      }
    })))
  );
});
const $5d3850c4d0b4e6c7$var$CONTENT_NAME = "DialogContent";
const $5d3850c4d0b4e6c7$export$b6d9565de1e068cf = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const portalContext = $5d3850c4d0b4e6c7$var$usePortalContext($5d3850c4d0b4e6c7$var$CONTENT_NAME, props.__scopeDialog);
  const { forceMount = portalContext.forceMount, ...contentProps } = props;
  const context = $5d3850c4d0b4e6c7$var$useDialogContext($5d3850c4d0b4e6c7$var$CONTENT_NAME, props.__scopeDialog);
  return /* @__PURE__ */ reactExports.createElement($921a889cee6df7e8$export$99c2b779aa4e8b8b, {
    present: forceMount || context.open
  }, context.modal ? /* @__PURE__ */ reactExports.createElement($5d3850c4d0b4e6c7$var$DialogContentModal, _extends({}, contentProps, {
    ref: forwardedRef
  })) : /* @__PURE__ */ reactExports.createElement($5d3850c4d0b4e6c7$var$DialogContentNonModal, _extends({}, contentProps, {
    ref: forwardedRef
  })));
});
/* @__PURE__ */ Object.assign($5d3850c4d0b4e6c7$export$b6d9565de1e068cf, {
  displayName: $5d3850c4d0b4e6c7$var$CONTENT_NAME
});
const $5d3850c4d0b4e6c7$var$DialogContentModal = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const context = $5d3850c4d0b4e6c7$var$useDialogContext($5d3850c4d0b4e6c7$var$CONTENT_NAME, props.__scopeDialog);
  const contentRef = reactExports.useRef(null);
  const composedRefs = $6ed0406888f73fc4$export$c7b2cbe3552a0d05(forwardedRef, context.contentRef, contentRef);
  reactExports.useEffect(() => {
    const content = contentRef.current;
    if (content) return hideOthers(content);
  }, []);
  return /* @__PURE__ */ reactExports.createElement($5d3850c4d0b4e6c7$var$DialogContentImpl, _extends({}, props, {
    ref: composedRefs,
    trapFocus: context.open,
    disableOutsidePointerEvents: true,
    onCloseAutoFocus: $e42e1063c40fb3ef$export$b9ecd428b558ff10(props.onCloseAutoFocus, (event) => {
      var _context$triggerRef$c;
      event.preventDefault();
      (_context$triggerRef$c = context.triggerRef.current) === null || _context$triggerRef$c === void 0 || _context$triggerRef$c.focus();
    }),
    onPointerDownOutside: $e42e1063c40fb3ef$export$b9ecd428b558ff10(props.onPointerDownOutside, (event) => {
      const originalEvent = event.detail.originalEvent;
      const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
      const isRightClick = originalEvent.button === 2 || ctrlLeftClick;
      if (isRightClick) event.preventDefault();
    }),
    onFocusOutside: $e42e1063c40fb3ef$export$b9ecd428b558ff10(
      props.onFocusOutside,
      (event) => event.preventDefault()
    )
  }));
});
const $5d3850c4d0b4e6c7$var$DialogContentNonModal = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const context = $5d3850c4d0b4e6c7$var$useDialogContext($5d3850c4d0b4e6c7$var$CONTENT_NAME, props.__scopeDialog);
  const hasInteractedOutsideRef = reactExports.useRef(false);
  const hasPointerDownOutsideRef = reactExports.useRef(false);
  return /* @__PURE__ */ reactExports.createElement($5d3850c4d0b4e6c7$var$DialogContentImpl, _extends({}, props, {
    ref: forwardedRef,
    trapFocus: false,
    disableOutsidePointerEvents: false,
    onCloseAutoFocus: (event) => {
      var _props$onCloseAutoFoc;
      (_props$onCloseAutoFoc = props.onCloseAutoFocus) === null || _props$onCloseAutoFoc === void 0 || _props$onCloseAutoFoc.call(props, event);
      if (!event.defaultPrevented) {
        var _context$triggerRef$c2;
        if (!hasInteractedOutsideRef.current) (_context$triggerRef$c2 = context.triggerRef.current) === null || _context$triggerRef$c2 === void 0 || _context$triggerRef$c2.focus();
        event.preventDefault();
      }
      hasInteractedOutsideRef.current = false;
      hasPointerDownOutsideRef.current = false;
    },
    onInteractOutside: (event) => {
      var _props$onInteractOuts, _context$triggerRef$c3;
      (_props$onInteractOuts = props.onInteractOutside) === null || _props$onInteractOuts === void 0 || _props$onInteractOuts.call(props, event);
      if (!event.defaultPrevented) {
        hasInteractedOutsideRef.current = true;
        if (event.detail.originalEvent.type === "pointerdown") hasPointerDownOutsideRef.current = true;
      }
      const target = event.target;
      const targetIsTrigger = (_context$triggerRef$c3 = context.triggerRef.current) === null || _context$triggerRef$c3 === void 0 ? void 0 : _context$triggerRef$c3.contains(target);
      if (targetIsTrigger) event.preventDefault();
      if (event.detail.originalEvent.type === "focusin" && hasPointerDownOutsideRef.current) event.preventDefault();
    }
  }));
});
const $5d3850c4d0b4e6c7$var$DialogContentImpl = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeDialog, trapFocus, onOpenAutoFocus, onCloseAutoFocus, ...contentProps } = props;
  const context = $5d3850c4d0b4e6c7$var$useDialogContext($5d3850c4d0b4e6c7$var$CONTENT_NAME, __scopeDialog);
  const contentRef = reactExports.useRef(null);
  const composedRefs = $6ed0406888f73fc4$export$c7b2cbe3552a0d05(forwardedRef, contentRef);
  $3db38b7d1fb3fe6a$export$b7ece24a22aeda8c();
  return /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement($d3863c46a17e8a28$export$20e40289641fbbb6, {
    asChild: true,
    loop: true,
    trapped: trapFocus,
    onMountAutoFocus: onOpenAutoFocus,
    onUnmountAutoFocus: onCloseAutoFocus
  }, /* @__PURE__ */ reactExports.createElement($5cb92bef7577960e$export$177fb62ff3ec1f22, _extends({
    role: "dialog",
    id: context.contentId,
    "aria-describedby": context.descriptionId,
    "aria-labelledby": context.titleId,
    "data-state": $5d3850c4d0b4e6c7$var$getState(context.open)
  }, contentProps, {
    ref: composedRefs,
    onDismiss: () => context.onOpenChange(false)
  }))), false);
});
const $5d3850c4d0b4e6c7$var$TITLE_NAME = "DialogTitle";
const $5d3850c4d0b4e6c7$export$16f7638e4a34b909 = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeDialog, ...titleProps } = props;
  const context = $5d3850c4d0b4e6c7$var$useDialogContext($5d3850c4d0b4e6c7$var$TITLE_NAME, __scopeDialog);
  return /* @__PURE__ */ reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.h2, _extends({
    id: context.titleId
  }, titleProps, {
    ref: forwardedRef
  }));
});
/* @__PURE__ */ Object.assign($5d3850c4d0b4e6c7$export$16f7638e4a34b909, {
  displayName: $5d3850c4d0b4e6c7$var$TITLE_NAME
});
const $5d3850c4d0b4e6c7$var$DESCRIPTION_NAME = "DialogDescription";
const $5d3850c4d0b4e6c7$export$94e94c2ec2c954d5 = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeDialog, ...descriptionProps } = props;
  const context = $5d3850c4d0b4e6c7$var$useDialogContext($5d3850c4d0b4e6c7$var$DESCRIPTION_NAME, __scopeDialog);
  return /* @__PURE__ */ reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.p, _extends({
    id: context.descriptionId
  }, descriptionProps, {
    ref: forwardedRef
  }));
});
/* @__PURE__ */ Object.assign($5d3850c4d0b4e6c7$export$94e94c2ec2c954d5, {
  displayName: $5d3850c4d0b4e6c7$var$DESCRIPTION_NAME
});
const $5d3850c4d0b4e6c7$var$CLOSE_NAME = "DialogClose";
const $5d3850c4d0b4e6c7$export$fba2fb7cd781b7ac = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeDialog, ...closeProps } = props;
  const context = $5d3850c4d0b4e6c7$var$useDialogContext($5d3850c4d0b4e6c7$var$CLOSE_NAME, __scopeDialog);
  return /* @__PURE__ */ reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.button, _extends({
    type: "button"
  }, closeProps, {
    ref: forwardedRef,
    onClick: $e42e1063c40fb3ef$export$b9ecd428b558ff10(
      props.onClick,
      () => context.onOpenChange(false)
    )
  }));
});
/* @__PURE__ */ Object.assign($5d3850c4d0b4e6c7$export$fba2fb7cd781b7ac, {
  displayName: $5d3850c4d0b4e6c7$var$CLOSE_NAME
});
function $5d3850c4d0b4e6c7$var$getState(open) {
  return open ? "open" : "closed";
}
const $5d3850c4d0b4e6c7$export$be92b6f5f03c0fe9 = $5d3850c4d0b4e6c7$export$3ddf2d174ce01153;
const $5d3850c4d0b4e6c7$export$602eac185826482c = $5d3850c4d0b4e6c7$export$dad7c95542bacce0;
const $5d3850c4d0b4e6c7$export$c6fdb837b070b4ff = $5d3850c4d0b4e6c7$export$bd1d06c79be19e17;
const $5d3850c4d0b4e6c7$export$7c6e2c02157bb7d2 = $5d3850c4d0b4e6c7$export$b6d9565de1e068cf;
var V$1 = '[cmdk-group=""]', X = '[cmdk-group-items=""]', ge = '[cmdk-group-heading=""]', Y$1 = '[cmdk-item=""]', le$1 = `${Y$1}:not([aria-disabled="true"])`, Q$1 = "cmdk-item-select", M$1 = "data-value", Re = (r, o, n) => W(r, o, n), ue = reactExports.createContext(void 0), G$1 = () => reactExports.useContext(ue), de = reactExports.createContext(void 0), Z$1 = () => reactExports.useContext(de), fe$1 = reactExports.createContext(void 0), me = reactExports.forwardRef((r, o) => {
  let n = k$1(() => {
    var e, s2;
    return { search: "", value: (s2 = (e = r.value) != null ? e : r.defaultValue) != null ? s2 : "", filtered: { count: 0, items: /* @__PURE__ */ new Map(), groups: /* @__PURE__ */ new Set() } };
  }), u2 = k$1(() => /* @__PURE__ */ new Set()), c = k$1(() => /* @__PURE__ */ new Map()), d2 = k$1(() => /* @__PURE__ */ new Map()), f = k$1(() => /* @__PURE__ */ new Set()), p2 = pe$1(r), { label: v2, children: b2, value: l, onValueChange: y2, filter: S2, shouldFilter: C, loop: L2, disablePointerSelection: ee = false, vimBindings: j2 = true, ...H2 } = r, te = reactExports.useId(), $2 = reactExports.useId(), K2 = reactExports.useId(), x = reactExports.useRef(null), g2 = Me();
  T$1(() => {
    if (l !== void 0) {
      let e = l.trim();
      n.current.value = e, h.emit();
    }
  }, [l]), T$1(() => {
    g2(6, re);
  }, []);
  let h = reactExports.useMemo(() => ({ subscribe: (e) => (f.current.add(e), () => f.current.delete(e)), snapshot: () => n.current, setState: (e, s2, i) => {
    var a2, m2, R2;
    if (!Object.is(n.current[e], s2)) {
      if (n.current[e] = s2, e === "search") z2(), q2(), g2(1, U2);
      else if (e === "value" && (i || g2(5, re), ((a2 = p2.current) == null ? void 0 : a2.value) !== void 0)) {
        let E2 = s2 != null ? s2 : "";
        (R2 = (m2 = p2.current).onValueChange) == null || R2.call(m2, E2);
        return;
      }
      h.emit();
    }
  }, emit: () => {
    f.current.forEach((e) => e());
  } }), []), B2 = reactExports.useMemo(() => ({ value: (e, s2, i) => {
    var a2;
    s2 !== ((a2 = d2.current.get(e)) == null ? void 0 : a2.value) && (d2.current.set(e, { value: s2, keywords: i }), n.current.filtered.items.set(e, ne(s2, i)), g2(2, () => {
      q2(), h.emit();
    }));
  }, item: (e, s2) => (u2.current.add(e), s2 && (c.current.has(s2) ? c.current.get(s2).add(e) : c.current.set(s2, /* @__PURE__ */ new Set([e]))), g2(3, () => {
    z2(), q2(), n.current.value || U2(), h.emit();
  }), () => {
    d2.current.delete(e), u2.current.delete(e), n.current.filtered.items.delete(e);
    let i = O2();
    g2(4, () => {
      z2(), (i == null ? void 0 : i.getAttribute("id")) === e && U2(), h.emit();
    });
  }), group: (e) => (c.current.has(e) || c.current.set(e, /* @__PURE__ */ new Set()), () => {
    d2.current.delete(e), c.current.delete(e);
  }), filter: () => p2.current.shouldFilter, label: v2 || r["aria-label"], disablePointerSelection: ee, listId: te, inputId: K2, labelId: $2, listInnerRef: x }), []);
  function ne(e, s2) {
    var a2, m2;
    let i = (m2 = (a2 = p2.current) == null ? void 0 : a2.filter) != null ? m2 : Re;
    return e ? i(e, n.current.search, s2) : 0;
  }
  function q2() {
    if (!n.current.search || p2.current.shouldFilter === false) return;
    let e = n.current.filtered.items, s2 = [];
    n.current.filtered.groups.forEach((a2) => {
      let m2 = c.current.get(a2), R2 = 0;
      m2.forEach((E2) => {
        let P2 = e.get(E2);
        R2 = Math.max(P2, R2);
      }), s2.push([a2, R2]);
    });
    let i = x.current;
    A2().sort((a2, m2) => {
      var P2, _2;
      let R2 = a2.getAttribute("id"), E2 = m2.getAttribute("id");
      return ((P2 = e.get(E2)) != null ? P2 : 0) - ((_2 = e.get(R2)) != null ? _2 : 0);
    }).forEach((a2) => {
      let m2 = a2.closest(X);
      m2 ? m2.appendChild(a2.parentElement === m2 ? a2 : a2.closest(`${X} > *`)) : i.appendChild(a2.parentElement === i ? a2 : a2.closest(`${X} > *`));
    }), s2.sort((a2, m2) => m2[1] - a2[1]).forEach((a2) => {
      let m2 = x.current.querySelector(`${V$1}[${M$1}="${encodeURIComponent(a2[0])}"]`);
      m2 == null || m2.parentElement.appendChild(m2);
    });
  }
  function U2() {
    let e = A2().find((i) => i.getAttribute("aria-disabled") !== "true"), s2 = e == null ? void 0 : e.getAttribute(M$1);
    h.setState("value", s2 || void 0);
  }
  function z2() {
    var s2, i, a2, m2;
    if (!n.current.search || p2.current.shouldFilter === false) {
      n.current.filtered.count = u2.current.size;
      return;
    }
    n.current.filtered.groups = /* @__PURE__ */ new Set();
    let e = 0;
    for (let R2 of u2.current) {
      let E2 = (i = (s2 = d2.current.get(R2)) == null ? void 0 : s2.value) != null ? i : "", P2 = (m2 = (a2 = d2.current.get(R2)) == null ? void 0 : a2.keywords) != null ? m2 : [], _2 = ne(E2, P2);
      n.current.filtered.items.set(R2, _2), _2 > 0 && e++;
    }
    for (let [R2, E2] of c.current) for (let P2 of E2) if (n.current.filtered.items.get(P2) > 0) {
      n.current.filtered.groups.add(R2);
      break;
    }
    n.current.filtered.count = e;
  }
  function re() {
    var s2, i, a2;
    let e = O2();
    e && (((s2 = e.parentElement) == null ? void 0 : s2.firstChild) === e && ((a2 = (i = e.closest(V$1)) == null ? void 0 : i.querySelector(ge)) == null || a2.scrollIntoView({ block: "nearest" })), e.scrollIntoView({ block: "nearest" }));
  }
  function O2() {
    var e;
    return (e = x.current) == null ? void 0 : e.querySelector(`${Y$1}[aria-selected="true"]`);
  }
  function A2() {
    var e;
    return Array.from((e = x.current) == null ? void 0 : e.querySelectorAll(le$1));
  }
  function W2(e) {
    let i = A2()[e];
    i && h.setState("value", i.getAttribute(M$1));
  }
  function J2(e) {
    var R2;
    let s2 = O2(), i = A2(), a2 = i.findIndex((E2) => E2 === s2), m2 = i[a2 + e];
    (R2 = p2.current) != null && R2.loop && (m2 = a2 + e < 0 ? i[i.length - 1] : a2 + e === i.length ? i[0] : i[a2 + e]), m2 && h.setState("value", m2.getAttribute(M$1));
  }
  function oe(e) {
    let s2 = O2(), i = s2 == null ? void 0 : s2.closest(V$1), a2;
    for (; i && !a2; ) i = e > 0 ? we(i, V$1) : Ie$1(i, V$1), a2 = i == null ? void 0 : i.querySelector(le$1);
    a2 ? h.setState("value", a2.getAttribute(M$1)) : J2(e);
  }
  let ie2 = () => W2(A2().length - 1), ae = (e) => {
    e.preventDefault(), e.metaKey ? ie2() : e.altKey ? oe(1) : J2(1);
  }, se = (e) => {
    e.preventDefault(), e.metaKey ? W2(0) : e.altKey ? oe(-1) : J2(-1);
  };
  return reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.div, { ref: o, tabIndex: -1, ...H2, "cmdk-root": "", onKeyDown: (e) => {
    var s2;
    if ((s2 = H2.onKeyDown) == null || s2.call(H2, e), !e.defaultPrevented) switch (e.key) {
      case "n":
      case "j": {
        j2 && e.ctrlKey && ae(e);
        break;
      }
      case "ArrowDown": {
        ae(e);
        break;
      }
      case "p":
      case "k": {
        j2 && e.ctrlKey && se(e);
        break;
      }
      case "ArrowUp": {
        se(e);
        break;
      }
      case "Home": {
        e.preventDefault(), W2(0);
        break;
      }
      case "End": {
        e.preventDefault(), ie2();
        break;
      }
      case "Enter":
        if (!e.nativeEvent.isComposing && e.keyCode !== 229) {
          e.preventDefault();
          let i = O2();
          if (i) {
            let a2 = new Event(Q$1);
            i.dispatchEvent(a2);
          }
        }
    }
  } }, reactExports.createElement("label", { "cmdk-label": "", htmlFor: B2.inputId, id: B2.labelId, style: De$1 }, v2), F(r, (e) => reactExports.createElement(de.Provider, { value: h }, reactExports.createElement(ue.Provider, { value: B2 }, e))));
}), be = reactExports.forwardRef((r, o) => {
  var K2, x;
  let n = reactExports.useId(), u2 = reactExports.useRef(null), c = reactExports.useContext(fe$1), d2 = G$1(), f = pe$1(r), p2 = (x = (K2 = f.current) == null ? void 0 : K2.forceMount) != null ? x : c == null ? void 0 : c.forceMount;
  T$1(() => {
    if (!p2) return d2.item(n, c == null ? void 0 : c.id);
  }, [p2]);
  let v2 = ve$1(n, u2, [r.value, r.children, u2], r.keywords), b2 = Z$1(), l = D((g2) => g2.value && g2.value === v2.current), y2 = D((g2) => p2 || d2.filter() === false ? true : g2.search ? g2.filtered.items.get(n) > 0 : true);
  reactExports.useEffect(() => {
    let g2 = u2.current;
    if (!(!g2 || r.disabled)) return g2.addEventListener(Q$1, S2), () => g2.removeEventListener(Q$1, S2);
  }, [y2, r.onSelect, r.disabled]);
  function S2() {
    var g2, h;
    C(), (h = (g2 = f.current).onSelect) == null || h.call(g2, v2.current);
  }
  function C() {
    b2.setState("value", v2.current, true);
  }
  if (!y2) return null;
  let { disabled: L2, value: ee, onSelect: j2, forceMount: H2, keywords: te, ...$2 } = r;
  return reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.div, { ref: N$1([u2, o]), ...$2, id: n, "cmdk-item": "", role: "option", "aria-disabled": !!L2, "aria-selected": !!l, "data-disabled": !!L2, "data-selected": !!l, onPointerMove: L2 || d2.disablePointerSelection ? void 0 : C, onClick: L2 ? void 0 : S2 }, r.children);
}), he = reactExports.forwardRef((r, o) => {
  let { heading: n, children: u2, forceMount: c, ...d2 } = r, f = reactExports.useId(), p2 = reactExports.useRef(null), v2 = reactExports.useRef(null), b2 = reactExports.useId(), l = G$1(), y2 = D((C) => c || l.filter() === false ? true : C.search ? C.filtered.groups.has(f) : true);
  T$1(() => l.group(f), []), ve$1(f, p2, [r.value, r.heading, v2]);
  let S2 = reactExports.useMemo(() => ({ id: f, forceMount: c }), [c]);
  return reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.div, { ref: N$1([p2, o]), ...d2, "cmdk-group": "", role: "presentation", hidden: y2 ? void 0 : true }, n && reactExports.createElement("div", { ref: v2, "cmdk-group-heading": "", "aria-hidden": true, id: b2 }, n), F(r, (C) => reactExports.createElement("div", { "cmdk-group-items": "", role: "group", "aria-labelledby": n ? b2 : void 0 }, reactExports.createElement(fe$1.Provider, { value: S2 }, C))));
}), ye$1 = reactExports.forwardRef((r, o) => {
  let { alwaysRender: n, ...u2 } = r, c = reactExports.useRef(null), d2 = D((f) => !f.search);
  return !n && !d2 ? null : reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.div, { ref: N$1([c, o]), ...u2, "cmdk-separator": "", role: "separator" });
}), Ee = reactExports.forwardRef((r, o) => {
  let { onValueChange: n, ...u2 } = r, c = r.value != null, d2 = Z$1(), f = D((l) => l.search), p2 = D((l) => l.value), v2 = G$1(), b2 = reactExports.useMemo(() => {
    var y2;
    let l = (y2 = v2.listInnerRef.current) == null ? void 0 : y2.querySelector(`${Y$1}[${M$1}="${encodeURIComponent(p2)}"]`);
    return l == null ? void 0 : l.getAttribute("id");
  }, []);
  return reactExports.useEffect(() => {
    r.value != null && d2.setState("search", r.value);
  }, [r.value]), reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.input, { ref: o, ...u2, "cmdk-input": "", autoComplete: "off", autoCorrect: "off", spellCheck: false, "aria-autocomplete": "list", role: "combobox", "aria-expanded": true, "aria-controls": v2.listId, "aria-labelledby": v2.labelId, "aria-activedescendant": b2, id: v2.inputId, type: "text", value: c ? r.value : f, onChange: (l) => {
    c || d2.setState("search", l.target.value), n == null || n(l.target.value);
  } });
}), Se = reactExports.forwardRef((r, o) => {
  let { children: n, label: u2 = "Suggestions", ...c } = r, d2 = reactExports.useRef(null), f = reactExports.useRef(null), p2 = G$1();
  return reactExports.useEffect(() => {
    if (f.current && d2.current) {
      let v2 = f.current, b2 = d2.current, l, y2 = new ResizeObserver(() => {
        l = requestAnimationFrame(() => {
          let S2 = v2.offsetHeight;
          b2.style.setProperty("--cmdk-list-height", S2.toFixed(1) + "px");
        });
      });
      return y2.observe(v2), () => {
        cancelAnimationFrame(l), y2.unobserve(v2);
      };
    }
  }, []), reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.div, { ref: N$1([d2, o]), ...c, "cmdk-list": "", role: "listbox", "aria-label": u2, id: p2.listId }, F(r, (v2) => reactExports.createElement("div", { ref: N$1([f, p2.listInnerRef]), "cmdk-list-sizer": "" }, v2)));
}), Ce$1 = reactExports.forwardRef((r, o) => {
  let { open: n, onOpenChange: u2, overlayClassName: c, contentClassName: d2, container: f, ...p2 } = r;
  return reactExports.createElement($5d3850c4d0b4e6c7$export$be92b6f5f03c0fe9, { open: n, onOpenChange: u2 }, reactExports.createElement($5d3850c4d0b4e6c7$export$602eac185826482c, { container: f }, reactExports.createElement($5d3850c4d0b4e6c7$export$c6fdb837b070b4ff, { "cmdk-overlay": "", className: c }), reactExports.createElement($5d3850c4d0b4e6c7$export$7c6e2c02157bb7d2, { "aria-label": r.label, "cmdk-dialog": "", className: d2 }, reactExports.createElement(me, { ref: o, ...p2 }))));
}), xe = reactExports.forwardRef((r, o) => D((u2) => u2.filtered.count === 0) ? reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.div, { ref: o, ...r, "cmdk-empty": "", role: "presentation" }) : null), Pe = reactExports.forwardRef((r, o) => {
  let { progress: n, children: u2, label: c = "Loading...", ...d2 } = r;
  return reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.div, { ref: o, ...d2, "cmdk-loading": "", role: "progressbar", "aria-valuenow": n, "aria-valuemin": 0, "aria-valuemax": 100, "aria-label": c }, F(r, (f) => reactExports.createElement("div", { "aria-hidden": true }, f)));
}), He$1 = Object.assign(me, { List: Se, Item: be, Input: Ee, Group: he, Separator: ye$1, Dialog: Ce$1, Empty: xe, Loading: Pe });
function we(r, o) {
  let n = r.nextElementSibling;
  for (; n; ) {
    if (n.matches(o)) return n;
    n = n.nextElementSibling;
  }
}
function Ie$1(r, o) {
  let n = r.previousElementSibling;
  for (; n; ) {
    if (n.matches(o)) return n;
    n = n.previousElementSibling;
  }
}
function pe$1(r) {
  let o = reactExports.useRef(r);
  return T$1(() => {
    o.current = r;
  }), o;
}
var T$1 = typeof window == "undefined" ? reactExports.useEffect : reactExports.useLayoutEffect;
function k$1(r) {
  let o = reactExports.useRef();
  return o.current === void 0 && (o.current = r()), o;
}
function N$1(r) {
  return (o) => {
    r.forEach((n) => {
      typeof n == "function" ? n(o) : n != null && (n.current = o);
    });
  };
}
function D(r) {
  let o = Z$1(), n = () => r(o.snapshot());
  return reactExports.useSyncExternalStore(o.subscribe, n, n);
}
function ve$1(r, o, n, u2 = []) {
  let c = reactExports.useRef(), d2 = G$1();
  return T$1(() => {
    var v2;
    let f = (() => {
      var b2;
      for (let l of n) {
        if (typeof l == "string") return l.trim();
        if (typeof l == "object" && "current" in l) return l.current ? (b2 = l.current.textContent) == null ? void 0 : b2.trim() : c.current;
      }
    })(), p2 = u2.map((b2) => b2.trim());
    d2.value(r, f, p2), (v2 = o.current) == null || v2.setAttribute(M$1, f), c.current = f;
  }), c;
}
var Me = () => {
  let [r, o] = reactExports.useState(), n = k$1(() => /* @__PURE__ */ new Map());
  return T$1(() => {
    n.current.forEach((u2) => u2()), n.current = /* @__PURE__ */ new Map();
  }, [r]), (u2, c) => {
    n.current.set(u2, c), o({});
  };
};
function Te(r) {
  let o = r.type;
  return typeof o == "function" ? o(r.props) : "render" in o ? o.render(r.props) : r;
}
function F({ asChild: r, children: o }, n) {
  return r && reactExports.isValidElement(o) ? reactExports.cloneElement(Te(o), { ref: o.ref }, n(o.props.children)) : n(o);
}
var De$1 = { position: "absolute", width: "1px", height: "1px", padding: "0", margin: "-1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", borderWidth: "0" };
const Command = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  He$1,
  {
    ref,
    className: cn$1(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className
    ),
    ...props
  }
));
Command.displayName = He$1.displayName;
const CommandInput = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center border-b px-3", "cmdk-input-wrapper": "", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "mr-2 h-4 w-4 shrink-0 opacity-50" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(
    He$1.Input,
    {
      ref,
      className: cn$1(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props
    }
  )
] }));
CommandInput.displayName = He$1.Input.displayName;
const CommandList = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  He$1.List,
  {
    ref,
    className: cn$1("max-h-[300px] overflow-y-auto overflow-x-hidden", className),
    ...props
  }
));
CommandList.displayName = He$1.List.displayName;
const CommandEmpty = reactExports.forwardRef((props, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  He$1.Empty,
  {
    ref,
    className: "py-6 text-center text-sm",
    ...props
  }
));
CommandEmpty.displayName = He$1.Empty.displayName;
const CommandGroup = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  He$1.Group,
  {
    ref,
    className: cn$1(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className
    ),
    ...props
  }
));
CommandGroup.displayName = He$1.Group.displayName;
const CommandSeparator = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  He$1.Separator,
  {
    ref,
    className: cn$1("-mx-1 h-px bg-border", className),
    ...props
  }
));
CommandSeparator.displayName = He$1.Separator.displayName;
const CommandItem = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  He$1.Item,
  {
    ref,
    className: cn$1(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50",
      className
    ),
    ...props
  }
));
CommandItem.displayName = He$1.Item.displayName;
function BillingAddressComboBox({
  name,
  control,
  label,
  placeholder,
  useList,
  onSelectionChange,
  disabled = false
}) {
  const { data, isLoading } = useList();
  const [open, setOpen] = reactExports.useState(false);
  const [showFreeForm, setShowFreeForm] = reactExports.useState(false);
  const items = (data == null ? void 0 : data.data) || [];
  reactExports.useEffect(() => {
    setShowFreeForm(items.length === 0 && !isLoading);
  }, [items, isLoading]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    FormField,
    {
      control,
      name,
      render: ({ field }) => {
        var _a;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { className: "flex flex-col", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: label }),
          showFreeForm ? /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: `Enter ${label.toLowerCase()}`,
              ...field,
              disabled
            }
          ) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open, onOpenChange: setOpen, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                role: "combobox",
                disabled: disabled || isLoading,
                className: cn$1(
                  "w-full justify-between bg-secondary border border-input h-14",
                  !field.value && "text-muted-foreground"
                ),
                children: [
                  isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-[100px]" }) : field.value ? (_a = items == null ? void 0 : items.find((item) => item.code === field.value)) == null ? void 0 : _a.name : placeholder,
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUpDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50" })
                ]
              }
            ) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { className: "w-full p-0", align: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Command,
              {
                filter: (value, search) => {
                  var _a2, _b;
                  const name2 = (_a2 = items == null ? void 0 : items.find(
                    (item) => item.code.toLowerCase() === value.toLowerCase()
                  )) == null ? void 0 : _a2.name;
                  if (value.includes(search) || ((_b = name2 == null ? void 0 : name2.toLowerCase()) == null ? void 0 : _b.includes(search.toLowerCase()))) {
                    return 1;
                  }
                  return 0;
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CommandInput, { placeholder: `Search ${label}...` }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandList, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandEmpty, { children: [
                      "No ",
                      label,
                      " found."
                    ] }),
                    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(CommandItem, { disabled: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }) }) : items == null ? void 0 : items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      CommandItem,
                      {
                        value: item.code,
                        onSelect: () => {
                          field.onChange(item.code);
                          if (onSelectionChange) {
                            onSelectionChange(item.code);
                          }
                          setOpen(false);
                        },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Check,
                            {
                              className: cn$1(
                                "mr-2 h-4 w-4",
                                item.code === field.value ? "opacity-100" : "opacity-0"
                              )
                            }
                          ),
                          item.name
                        ]
                      },
                      item.code
                    ))
                  ] })
                ]
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
        ] });
      }
    }
  );
}
const baseSchema = {
  name: z$1.string().min(2, "Name must be at least 2 characters").max(100, "Name must not exceed 100 characters"),
  country: z$1.string().min(2, "Country must be at least 2 characters").max(56, "Country must not exceed 56 characters")
};
const conditionalFields = {
  address: z$1.string().min(5, "Address must be at least 5 characters").max(200, "Address must not exceed 200 characters"),
  city: z$1.string().min(2, "City must be at least 2 characters").max(100, "City must not exceed 100 characters"),
  state: z$1.string().min(2, "State must be at least 2 characters").max(50, "State must not exceed 50 characters"),
  zip: z$1.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"),
  organization: z$1.union([
    z$1.string().min(2, "Organization must be at least 2 characters"),
    z$1.string().max(100, "Organization must not exceed 100 characters")
  ]).optional().transform((e) => e === "" ? void 0 : e),
  dependentLocality: z$1.string().min(2, "Dependent locality must be at least 2 characters").max(100, "Dependent locality must not exceed 100 characters"),
  sortingCode: z$1.string().min(2, "Sorting code must be at least 2 characters").max(20, "Sorting code must not exceed 20 characters")
};
const fieldMapping = {
  O: "organization",
  A: "address",
  C: "city",
  S: "state",
  Z: "zip",
  D: "dependentLocality",
  X: "sortingCode"
};
const createBillingInfoSchema = (supportedEntities = []) => {
  const schema = { ...baseSchema };
  supportedEntities.forEach((entity) => {
    const field = fieldMapping[entity];
    if (field) {
      schema[field] = conditionalFields[field];
    }
  });
  return z$1.object(schema);
};
function BillingInformation() {
  const { billingInfo, isLoading: isBillingInfoLoading } = useBillingInfo();
  const { submitBillingInfo, isSubmitting } = useSubmitBillingInfo();
  const [isInitialized, setIsInitialized] = reactExports.useState(false);
  const [supportedEntities, setSupportedEntities] = reactExports.useState([]);
  const useCountryList = () => zt({ resource: "account/subscription/billing/countries" });
  const { data: countryData } = useCountryList();
  const form = useForm({
    resolver: t(createBillingInfoSchema([])),
    defaultValues: {
      name: "",
      country: ""
    },
    mode: "onBlur"
  });
  const useStateList = () => zt({
    resource: "account/subscription/billing/states",
    filters: [
      { field: "country", operator: "eq", value: form.watch("country") }
    ]
  });
  const useCityList = () => zt({
    resource: "account/subscription/billing/cities",
    filters: [
      { field: "country", operator: "eq", value: form.watch("country") },
      { field: "state", operator: "eq", value: form.watch("state") }
    ]
  });
  console.log({ formState: form.formState, errors: form.formState.errors });
  reactExports.useEffect(() => {
    if (billingInfo && !isInitialized) {
      console.log("Billing info loaded:", billingInfo);
      form.reset(billingInfo);
      setIsInitialized(true);
    }
  }, [billingInfo, form, isInitialized]);
  reactExports.useEffect(() => {
    const selectedCountry = form.watch("country");
    const selectedCountryData = countryData == null ? void 0 : countryData.data.find(
      (country) => country.code === selectedCountry
    );
    const entities = (selectedCountryData == null ? void 0 : selectedCountryData.supported_entities) || [];
    setSupportedEntities(entities);
  }, [form.watch("country"), countryData]);
  const onSubmit = async (data) => {
    try {
      await submitBillingInfo(data);
    } catch (error) {
      if (typeof error === "object" && error !== null) {
        Object.entries(error).forEach(([field, message]) => {
          form.setError(field, {
            type: "manual",
            message
          });
        });
      } else {
        console.error("Error submitting billing info:", error);
      }
    }
  };
  const handleCountryChange = () => {
    form.setValue("state", void 0);
    form.setValue("city", void 0);
  };
  const handleStateChange = () => {
    form.setValue("city", void 0);
  };
  if (isBillingInfoLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-center min-h-screen p-4 pt-60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-3/4 mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-5/6 mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-2/3 mx-auto" })
    ] }) });
  }
  const renderField = (fieldName) => {
    const entityCode = Object.keys(fieldMapping).find(
      (key) => fieldMapping[key] === fieldName
    );
    if (!supportedEntities.includes(entityCode)) {
      return null;
    }
    switch (fieldName) {
      case "address":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormField,
          {
            control: form.control,
            name: "address",
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "Address" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { ...field, rows: 3 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
            ] })
          }
        );
      case "city":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          BillingAddressComboBox,
          {
            name: "city",
            control: form.control,
            label: "City",
            placeholder: "Select City",
            useList: useCityList,
            disabled: !form.watch("state")
          }
        );
      case "state":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          BillingAddressComboBox,
          {
            name: "state",
            control: form.control,
            label: "State",
            placeholder: "Select State",
            useList: useStateList,
            onSelectionChange: handleStateChange,
            disabled: !form.watch("country")
          }
        );
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormField,
          {
            control: form.control,
            name: fieldName,
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: fieldName.charAt(0).toUpperCase() + fieldName.slice(1) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...field }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
            ] })
          }
        );
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-secondary/20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Billing Information" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form, { ...form, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        FormField,
        {
          control: form.control,
          name: "name",
          render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...field }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        BillingAddressComboBox,
        {
          name: "country",
          control: form.control,
          label: "Country",
          placeholder: "Select Country",
          useList: useCountryList,
          onSelectionChange: handleCountryChange
        }
      ),
      Object.keys(fieldMapping).map(
        (key) => renderField(fieldMapping[key])
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardFooter, { className: "px-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "submit",
          className: "ml-auto",
          disabled: isSubmitting || !form.formState.isValid,
          children: isSubmitting ? "Saving..." : "Save"
        }
      ) })
    ] }) }) })
  ] });
}
function createContext2(rootComponentName, defaultContext) {
  const Context = reactExports.createContext(defaultContext);
  const Provider = (props) => {
    const { children, ...context } = props;
    const value = reactExports.useMemo(() => context, Object.values(context));
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Context.Provider, { value, children });
  };
  Provider.displayName = rootComponentName + "Provider";
  function useContext2(consumerName) {
    const context = reactExports.useContext(Context);
    if (context) return context;
    if (defaultContext !== void 0) return defaultContext;
    throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
  }
  return [Provider, useContext2];
}
function createContextScope(scopeName, createContextScopeDeps = []) {
  let defaultContexts = [];
  function createContext3(rootComponentName, defaultContext) {
    const BaseContext = reactExports.createContext(defaultContext);
    const index = defaultContexts.length;
    defaultContexts = [...defaultContexts, defaultContext];
    const Provider = (props) => {
      var _a;
      const { scope, children, ...context } = props;
      const Context = ((_a = scope == null ? void 0 : scope[scopeName]) == null ? void 0 : _a[index]) || BaseContext;
      const value = reactExports.useMemo(() => context, Object.values(context));
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Context.Provider, { value, children });
    };
    Provider.displayName = rootComponentName + "Provider";
    function useContext2(consumerName, scope) {
      var _a;
      const Context = ((_a = scope == null ? void 0 : scope[scopeName]) == null ? void 0 : _a[index]) || BaseContext;
      const context = reactExports.useContext(Context);
      if (context) return context;
      if (defaultContext !== void 0) return defaultContext;
      throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
    }
    return [Provider, useContext2];
  }
  const createScope = () => {
    const scopeContexts = defaultContexts.map((defaultContext) => {
      return reactExports.createContext(defaultContext);
    });
    return function useScope(scope) {
      const contexts = (scope == null ? void 0 : scope[scopeName]) || scopeContexts;
      return reactExports.useMemo(
        () => ({ [`__scope${scopeName}`]: { ...scope, [scopeName]: contexts } }),
        [scope, contexts]
      );
    };
  };
  createScope.scopeName = scopeName;
  return [createContext3, composeContextScopes(createScope, ...createContextScopeDeps)];
}
function composeContextScopes(...scopes) {
  const baseScope = scopes[0];
  if (scopes.length === 1) return baseScope;
  const createScope = () => {
    const scopeHooks = scopes.map((createScope2) => ({
      useScope: createScope2(),
      scopeName: createScope2.scopeName
    }));
    return function useComposedScopes(overrideScopes) {
      const nextScopes = scopeHooks.reduce((nextScopes2, { useScope, scopeName }) => {
        const scopeProps = useScope(overrideScopes);
        const currentScope = scopeProps[`__scope${scopeName}`];
        return { ...nextScopes2, ...currentScope };
      }, {});
      return reactExports.useMemo(() => ({ [`__scope${baseScope.scopeName}`]: nextScopes }), [nextScopes]);
    };
  };
  createScope.scopeName = baseScope.scopeName;
  return createScope;
}
var DISMISSABLE_LAYER_NAME = "DismissableLayer";
var CONTEXT_UPDATE = "dismissableLayer.update";
var POINTER_DOWN_OUTSIDE = "dismissableLayer.pointerDownOutside";
var FOCUS_OUTSIDE = "dismissableLayer.focusOutside";
var originalBodyPointerEvents;
var DismissableLayerContext = reactExports.createContext({
  layers: /* @__PURE__ */ new Set(),
  layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
  branches: /* @__PURE__ */ new Set()
});
var DismissableLayer = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      disableOutsidePointerEvents = false,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      onDismiss,
      ...layerProps
    } = props;
    const context = reactExports.useContext(DismissableLayerContext);
    const [node, setNode] = reactExports.useState(null);
    const ownerDocument = (node == null ? void 0 : node.ownerDocument) ?? (globalThis == null ? void 0 : globalThis.document);
    const [, force] = reactExports.useState({});
    const composedRefs = useComposedRefs(forwardedRef, (node2) => setNode(node2));
    const layers = Array.from(context.layers);
    const [highestLayerWithOutsidePointerEventsDisabled] = [...context.layersWithOutsidePointerEventsDisabled].slice(-1);
    const highestLayerWithOutsidePointerEventsDisabledIndex = layers.indexOf(highestLayerWithOutsidePointerEventsDisabled);
    const index = node ? layers.indexOf(node) : -1;
    const isBodyPointerEventsDisabled = context.layersWithOutsidePointerEventsDisabled.size > 0;
    const isPointerEventsEnabled = index >= highestLayerWithOutsidePointerEventsDisabledIndex;
    const pointerDownOutside = usePointerDownOutside((event) => {
      const target = event.target;
      const isPointerDownOnBranch = [...context.branches].some((branch) => branch.contains(target));
      if (!isPointerEventsEnabled || isPointerDownOnBranch) return;
      onPointerDownOutside == null ? void 0 : onPointerDownOutside(event);
      onInteractOutside == null ? void 0 : onInteractOutside(event);
      if (!event.defaultPrevented) onDismiss == null ? void 0 : onDismiss();
    }, ownerDocument);
    const focusOutside = useFocusOutside((event) => {
      const target = event.target;
      const isFocusInBranch = [...context.branches].some((branch) => branch.contains(target));
      if (isFocusInBranch) return;
      onFocusOutside == null ? void 0 : onFocusOutside(event);
      onInteractOutside == null ? void 0 : onInteractOutside(event);
      if (!event.defaultPrevented) onDismiss == null ? void 0 : onDismiss();
    }, ownerDocument);
    useEscapeKeydown((event) => {
      const isHighestLayer = index === context.layers.size - 1;
      if (!isHighestLayer) return;
      onEscapeKeyDown == null ? void 0 : onEscapeKeyDown(event);
      if (!event.defaultPrevented && onDismiss) {
        event.preventDefault();
        onDismiss();
      }
    }, ownerDocument);
    reactExports.useEffect(() => {
      if (!node) return;
      if (disableOutsidePointerEvents) {
        if (context.layersWithOutsidePointerEventsDisabled.size === 0) {
          originalBodyPointerEvents = ownerDocument.body.style.pointerEvents;
          ownerDocument.body.style.pointerEvents = "none";
        }
        context.layersWithOutsidePointerEventsDisabled.add(node);
      }
      context.layers.add(node);
      dispatchUpdate();
      return () => {
        if (disableOutsidePointerEvents && context.layersWithOutsidePointerEventsDisabled.size === 1) {
          ownerDocument.body.style.pointerEvents = originalBodyPointerEvents;
        }
      };
    }, [node, ownerDocument, disableOutsidePointerEvents, context]);
    reactExports.useEffect(() => {
      return () => {
        if (!node) return;
        context.layers.delete(node);
        context.layersWithOutsidePointerEventsDisabled.delete(node);
        dispatchUpdate();
      };
    }, [node, context]);
    reactExports.useEffect(() => {
      const handleUpdate = () => force({});
      document.addEventListener(CONTEXT_UPDATE, handleUpdate);
      return () => document.removeEventListener(CONTEXT_UPDATE, handleUpdate);
    }, []);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.div,
      {
        ...layerProps,
        ref: composedRefs,
        style: {
          pointerEvents: isBodyPointerEventsDisabled ? isPointerEventsEnabled ? "auto" : "none" : void 0,
          ...props.style
        },
        onFocusCapture: composeEventHandlers(props.onFocusCapture, focusOutside.onFocusCapture),
        onBlurCapture: composeEventHandlers(props.onBlurCapture, focusOutside.onBlurCapture),
        onPointerDownCapture: composeEventHandlers(
          props.onPointerDownCapture,
          pointerDownOutside.onPointerDownCapture
        )
      }
    );
  }
);
DismissableLayer.displayName = DISMISSABLE_LAYER_NAME;
var BRANCH_NAME = "DismissableLayerBranch";
var DismissableLayerBranch = reactExports.forwardRef((props, forwardedRef) => {
  const context = reactExports.useContext(DismissableLayerContext);
  const ref = reactExports.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  reactExports.useEffect(() => {
    const node = ref.current;
    if (node) {
      context.branches.add(node);
      return () => {
        context.branches.delete(node);
      };
    }
  }, [context.branches]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.div, { ...props, ref: composedRefs });
});
DismissableLayerBranch.displayName = BRANCH_NAME;
function usePointerDownOutside(onPointerDownOutside, ownerDocument = globalThis == null ? void 0 : globalThis.document) {
  const handlePointerDownOutside = useCallbackRef(onPointerDownOutside);
  const isPointerInsideReactTreeRef = reactExports.useRef(false);
  const handleClickRef = reactExports.useRef(() => {
  });
  reactExports.useEffect(() => {
    const handlePointerDown = (event) => {
      if (event.target && !isPointerInsideReactTreeRef.current) {
        let handleAndDispatchPointerDownOutsideEvent2 = function() {
          handleAndDispatchCustomEvent(
            POINTER_DOWN_OUTSIDE,
            handlePointerDownOutside,
            eventDetail,
            { discrete: true }
          );
        };
        const eventDetail = { originalEvent: event };
        if (event.pointerType === "touch") {
          ownerDocument.removeEventListener("click", handleClickRef.current);
          handleClickRef.current = handleAndDispatchPointerDownOutsideEvent2;
          ownerDocument.addEventListener("click", handleClickRef.current, { once: true });
        } else {
          handleAndDispatchPointerDownOutsideEvent2();
        }
      } else {
        ownerDocument.removeEventListener("click", handleClickRef.current);
      }
      isPointerInsideReactTreeRef.current = false;
    };
    const timerId = window.setTimeout(() => {
      ownerDocument.addEventListener("pointerdown", handlePointerDown);
    }, 0);
    return () => {
      window.clearTimeout(timerId);
      ownerDocument.removeEventListener("pointerdown", handlePointerDown);
      ownerDocument.removeEventListener("click", handleClickRef.current);
    };
  }, [ownerDocument, handlePointerDownOutside]);
  return {
    // ensures we check React component tree (not just DOM tree)
    onPointerDownCapture: () => isPointerInsideReactTreeRef.current = true
  };
}
function useFocusOutside(onFocusOutside, ownerDocument = globalThis == null ? void 0 : globalThis.document) {
  const handleFocusOutside = useCallbackRef(onFocusOutside);
  const isFocusInsideReactTreeRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    const handleFocus = (event) => {
      if (event.target && !isFocusInsideReactTreeRef.current) {
        const eventDetail = { originalEvent: event };
        handleAndDispatchCustomEvent(FOCUS_OUTSIDE, handleFocusOutside, eventDetail, {
          discrete: false
        });
      }
    };
    ownerDocument.addEventListener("focusin", handleFocus);
    return () => ownerDocument.removeEventListener("focusin", handleFocus);
  }, [ownerDocument, handleFocusOutside]);
  return {
    onFocusCapture: () => isFocusInsideReactTreeRef.current = true,
    onBlurCapture: () => isFocusInsideReactTreeRef.current = false
  };
}
function dispatchUpdate() {
  const event = new CustomEvent(CONTEXT_UPDATE);
  document.dispatchEvent(event);
}
function handleAndDispatchCustomEvent(name, handler, detail, { discrete }) {
  const target = detail.originalEvent.target;
  const event = new CustomEvent(name, { bubbles: false, cancelable: true, detail });
  if (handler) target.addEventListener(name, handler, { once: true });
  if (discrete) {
    dispatchDiscreteCustomEvent(target, event);
  } else {
    target.dispatchEvent(event);
  }
}
var PORTAL_NAME$2 = "Portal";
var Portal$1 = reactExports.forwardRef((props, forwardedRef) => {
  var _a;
  const { container: containerProp, ...portalProps } = props;
  const [mounted, setMounted] = reactExports.useState(false);
  useLayoutEffect2(() => setMounted(true), []);
  const container = containerProp || mounted && ((_a = globalThis == null ? void 0 : globalThis.document) == null ? void 0 : _a.body);
  return container ? ReactDOM.createPortal(/* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.div, { ...portalProps, ref: forwardedRef }), container) : null;
});
Portal$1.displayName = PORTAL_NAME$2;
function useStateMachine(initialState, machine) {
  return reactExports.useReducer((state, event) => {
    const nextState = machine[state][event];
    return nextState ?? state;
  }, initialState);
}
var Presence = (props) => {
  const { present, children } = props;
  const presence = usePresence(present);
  const child = typeof children === "function" ? children({ present: presence.isPresent }) : reactExports.Children.only(children);
  const ref = useComposedRefs(presence.ref, getElementRef(child));
  const forceMount = typeof children === "function";
  return forceMount || presence.isPresent ? reactExports.cloneElement(child, { ref }) : null;
};
Presence.displayName = "Presence";
function usePresence(present) {
  const [node, setNode] = reactExports.useState();
  const stylesRef = reactExports.useRef({});
  const prevPresentRef = reactExports.useRef(present);
  const prevAnimationNameRef = reactExports.useRef("none");
  const initialState = present ? "mounted" : "unmounted";
  const [state, send] = useStateMachine(initialState, {
    mounted: {
      UNMOUNT: "unmounted",
      ANIMATION_OUT: "unmountSuspended"
    },
    unmountSuspended: {
      MOUNT: "mounted",
      ANIMATION_END: "unmounted"
    },
    unmounted: {
      MOUNT: "mounted"
    }
  });
  reactExports.useEffect(() => {
    const currentAnimationName = getAnimationName(stylesRef.current);
    prevAnimationNameRef.current = state === "mounted" ? currentAnimationName : "none";
  }, [state]);
  useLayoutEffect2(() => {
    const styles = stylesRef.current;
    const wasPresent = prevPresentRef.current;
    const hasPresentChanged = wasPresent !== present;
    if (hasPresentChanged) {
      const prevAnimationName = prevAnimationNameRef.current;
      const currentAnimationName = getAnimationName(styles);
      if (present) {
        send("MOUNT");
      } else if (currentAnimationName === "none" || (styles == null ? void 0 : styles.display) === "none") {
        send("UNMOUNT");
      } else {
        const isAnimating = prevAnimationName !== currentAnimationName;
        if (wasPresent && isAnimating) {
          send("ANIMATION_OUT");
        } else {
          send("UNMOUNT");
        }
      }
      prevPresentRef.current = present;
    }
  }, [present, send]);
  useLayoutEffect2(() => {
    if (node) {
      let timeoutId;
      const ownerWindow = node.ownerDocument.defaultView ?? window;
      const handleAnimationEnd = (event) => {
        const currentAnimationName = getAnimationName(stylesRef.current);
        const isCurrentAnimation = currentAnimationName.includes(event.animationName);
        if (event.target === node && isCurrentAnimation) {
          send("ANIMATION_END");
          if (!prevPresentRef.current) {
            const currentFillMode = node.style.animationFillMode;
            node.style.animationFillMode = "forwards";
            timeoutId = ownerWindow.setTimeout(() => {
              if (node.style.animationFillMode === "forwards") {
                node.style.animationFillMode = currentFillMode;
              }
            });
          }
        }
      };
      const handleAnimationStart = (event) => {
        if (event.target === node) {
          prevAnimationNameRef.current = getAnimationName(stylesRef.current);
        }
      };
      node.addEventListener("animationstart", handleAnimationStart);
      node.addEventListener("animationcancel", handleAnimationEnd);
      node.addEventListener("animationend", handleAnimationEnd);
      return () => {
        ownerWindow.clearTimeout(timeoutId);
        node.removeEventListener("animationstart", handleAnimationStart);
        node.removeEventListener("animationcancel", handleAnimationEnd);
        node.removeEventListener("animationend", handleAnimationEnd);
      };
    } else {
      send("ANIMATION_END");
    }
  }, [node, send]);
  return {
    isPresent: ["mounted", "unmountSuspended"].includes(state),
    ref: reactExports.useCallback((node2) => {
      if (node2) stylesRef.current = getComputedStyle(node2);
      setNode(node2);
    }, [])
  };
}
function getAnimationName(styles) {
  return (styles == null ? void 0 : styles.animationName) || "none";
}
function getElementRef(element) {
  var _a, _b;
  let getter = (_a = Object.getOwnPropertyDescriptor(element.props, "ref")) == null ? void 0 : _a.get;
  let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.ref;
  }
  getter = (_b = Object.getOwnPropertyDescriptor(element, "ref")) == null ? void 0 : _b.get;
  mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.props.ref;
  }
  return element.props.ref || element.ref;
}
var count = 0;
function useFocusGuards() {
  reactExports.useEffect(() => {
    const edgeGuards = document.querySelectorAll("[data-radix-focus-guard]");
    document.body.insertAdjacentElement("afterbegin", edgeGuards[0] ?? createFocusGuard());
    document.body.insertAdjacentElement("beforeend", edgeGuards[1] ?? createFocusGuard());
    count++;
    return () => {
      if (count === 1) {
        document.querySelectorAll("[data-radix-focus-guard]").forEach((node) => node.remove());
      }
      count--;
    };
  }, []);
}
function createFocusGuard() {
  const element = document.createElement("span");
  element.setAttribute("data-radix-focus-guard", "");
  element.tabIndex = 0;
  element.style.outline = "none";
  element.style.opacity = "0";
  element.style.position = "fixed";
  element.style.pointerEvents = "none";
  return element;
}
var effectCar = createSidecarMedium();
var nothing = function() {
  return;
};
var RemoveScroll = reactExports.forwardRef(function(props, parentRef) {
  var ref = reactExports.useRef(null);
  var _a = reactExports.useState({
    onScrollCapture: nothing,
    onWheelCapture: nothing,
    onTouchMoveCapture: nothing
  }), callbacks = _a[0], setCallbacks = _a[1];
  var forwardProps = props.forwardProps, children = props.children, className = props.className, removeScrollBar = props.removeScrollBar, enabled = props.enabled, shards = props.shards, sideCar = props.sideCar, noIsolation = props.noIsolation, inert = props.inert, allowPinchZoom = props.allowPinchZoom, _b = props.as, Container = _b === void 0 ? "div" : _b, gapMode = props.gapMode, rest = __rest(props, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]);
  var SideCar2 = sideCar;
  var containerRef = useMergeRefs([ref, parentRef]);
  var containerProps = __assign(__assign({}, rest), callbacks);
  return reactExports.createElement(
    reactExports.Fragment,
    null,
    enabled && reactExports.createElement(SideCar2, { sideCar: effectCar, removeScrollBar, shards, noIsolation, inert, setCallbacks, allowPinchZoom: !!allowPinchZoom, lockRef: ref, gapMode }),
    forwardProps ? reactExports.cloneElement(reactExports.Children.only(children), __assign(__assign({}, containerProps), { ref: containerRef })) : reactExports.createElement(Container, __assign({}, containerProps, { className, ref: containerRef }), children)
  );
});
RemoveScroll.defaultProps = {
  enabled: true,
  removeScrollBar: true,
  inert: false
};
RemoveScroll.classNames = {
  fullWidth: fullWidthClassName,
  zeroRight: zeroRightClassName
};
var passiveSupported = false;
if (typeof window !== "undefined") {
  try {
    var options = Object.defineProperty({}, "passive", {
      get: function() {
        passiveSupported = true;
        return true;
      }
    });
    window.addEventListener("test", options, options);
    window.removeEventListener("test", options, options);
  } catch (err) {
    passiveSupported = false;
  }
}
var nonPassive = passiveSupported ? { passive: false } : false;
var alwaysContainsScroll = function(node) {
  return node.tagName === "TEXTAREA";
};
var elementCanBeScrolled = function(node, overflow) {
  if (!(node instanceof Element)) {
    return false;
  }
  var styles = window.getComputedStyle(node);
  return (
    // not-not-scrollable
    styles[overflow] !== "hidden" && // contains scroll inside self
    !(styles.overflowY === styles.overflowX && !alwaysContainsScroll(node) && styles[overflow] === "visible")
  );
};
var elementCouldBeVScrolled = function(node) {
  return elementCanBeScrolled(node, "overflowY");
};
var elementCouldBeHScrolled = function(node) {
  return elementCanBeScrolled(node, "overflowX");
};
var locationCouldBeScrolled = function(axis, node) {
  var ownerDocument = node.ownerDocument;
  var current = node;
  do {
    if (typeof ShadowRoot !== "undefined" && current instanceof ShadowRoot) {
      current = current.host;
    }
    var isScrollable = elementCouldBeScrolled(axis, current);
    if (isScrollable) {
      var _a = getScrollVariables(axis, current), scrollHeight = _a[1], clientHeight = _a[2];
      if (scrollHeight > clientHeight) {
        return true;
      }
    }
    current = current.parentNode;
  } while (current && current !== ownerDocument.body);
  return false;
};
var getVScrollVariables = function(_a) {
  var scrollTop = _a.scrollTop, scrollHeight = _a.scrollHeight, clientHeight = _a.clientHeight;
  return [
    scrollTop,
    scrollHeight,
    clientHeight
  ];
};
var getHScrollVariables = function(_a) {
  var scrollLeft = _a.scrollLeft, scrollWidth = _a.scrollWidth, clientWidth = _a.clientWidth;
  return [
    scrollLeft,
    scrollWidth,
    clientWidth
  ];
};
var elementCouldBeScrolled = function(axis, node) {
  return axis === "v" ? elementCouldBeVScrolled(node) : elementCouldBeHScrolled(node);
};
var getScrollVariables = function(axis, node) {
  return axis === "v" ? getVScrollVariables(node) : getHScrollVariables(node);
};
var getDirectionFactor = function(axis, direction) {
  return axis === "h" && direction === "rtl" ? -1 : 1;
};
var handleScroll = function(axis, endTarget, event, sourceDelta, noOverscroll) {
  var directionFactor = getDirectionFactor(axis, window.getComputedStyle(endTarget).direction);
  var delta = directionFactor * sourceDelta;
  var target = event.target;
  var targetInLock = endTarget.contains(target);
  var shouldCancelScroll = false;
  var isDeltaPositive = delta > 0;
  var availableScroll = 0;
  var availableScrollTop = 0;
  do {
    var _a = getScrollVariables(axis, target), position = _a[0], scroll_1 = _a[1], capacity = _a[2];
    var elementScroll = scroll_1 - capacity - directionFactor * position;
    if (position || elementScroll) {
      if (elementCouldBeScrolled(axis, target)) {
        availableScroll += elementScroll;
        availableScrollTop += position;
      }
    }
    if (target instanceof ShadowRoot) {
      target = target.host;
    } else {
      target = target.parentNode;
    }
  } while (
    // portaled content
    !targetInLock && target !== document.body || // self content
    targetInLock && (endTarget.contains(target) || endTarget === target)
  );
  if (isDeltaPositive && (Math.abs(availableScroll) < 1 || !noOverscroll)) {
    shouldCancelScroll = true;
  } else if (!isDeltaPositive && (Math.abs(availableScrollTop) < 1 || !noOverscroll)) {
    shouldCancelScroll = true;
  }
  return shouldCancelScroll;
};
var getTouchXY = function(event) {
  return "changedTouches" in event ? [event.changedTouches[0].clientX, event.changedTouches[0].clientY] : [0, 0];
};
var getDeltaXY = function(event) {
  return [event.deltaX, event.deltaY];
};
var extractRef = function(ref) {
  return ref && "current" in ref ? ref.current : ref;
};
var deltaCompare = function(x, y2) {
  return x[0] === y2[0] && x[1] === y2[1];
};
var generateStyle = function(id) {
  return "\n  .block-interactivity-".concat(id, " {pointer-events: none;}\n  .allow-interactivity-").concat(id, " {pointer-events: all;}\n");
};
var idCounter = 0;
var lockStack = [];
function RemoveScrollSideCar(props) {
  var shouldPreventQueue = reactExports.useRef([]);
  var touchStartRef = reactExports.useRef([0, 0]);
  var activeAxis = reactExports.useRef();
  var id = reactExports.useState(idCounter++)[0];
  var Style = reactExports.useState(styleSingleton)[0];
  var lastProps = reactExports.useRef(props);
  reactExports.useEffect(function() {
    lastProps.current = props;
  }, [props]);
  reactExports.useEffect(function() {
    if (props.inert) {
      document.body.classList.add("block-interactivity-".concat(id));
      var allow_1 = __spreadArray([props.lockRef.current], (props.shards || []).map(extractRef), true).filter(Boolean);
      allow_1.forEach(function(el) {
        return el.classList.add("allow-interactivity-".concat(id));
      });
      return function() {
        document.body.classList.remove("block-interactivity-".concat(id));
        allow_1.forEach(function(el) {
          return el.classList.remove("allow-interactivity-".concat(id));
        });
      };
    }
    return;
  }, [props.inert, props.lockRef.current, props.shards]);
  var shouldCancelEvent = reactExports.useCallback(function(event, parent) {
    if ("touches" in event && event.touches.length === 2 || event.type === "wheel" && event.ctrlKey) {
      return !lastProps.current.allowPinchZoom;
    }
    var touch = getTouchXY(event);
    var touchStart = touchStartRef.current;
    var deltaX = "deltaX" in event ? event.deltaX : touchStart[0] - touch[0];
    var deltaY = "deltaY" in event ? event.deltaY : touchStart[1] - touch[1];
    var currentAxis;
    var target = event.target;
    var moveDirection = Math.abs(deltaX) > Math.abs(deltaY) ? "h" : "v";
    if ("touches" in event && moveDirection === "h" && target.type === "range") {
      return false;
    }
    var canBeScrolledInMainDirection = locationCouldBeScrolled(moveDirection, target);
    if (!canBeScrolledInMainDirection) {
      return true;
    }
    if (canBeScrolledInMainDirection) {
      currentAxis = moveDirection;
    } else {
      currentAxis = moveDirection === "v" ? "h" : "v";
      canBeScrolledInMainDirection = locationCouldBeScrolled(moveDirection, target);
    }
    if (!canBeScrolledInMainDirection) {
      return false;
    }
    if (!activeAxis.current && "changedTouches" in event && (deltaX || deltaY)) {
      activeAxis.current = currentAxis;
    }
    if (!currentAxis) {
      return true;
    }
    var cancelingAxis = activeAxis.current || currentAxis;
    return handleScroll(cancelingAxis, parent, event, cancelingAxis === "h" ? deltaX : deltaY, true);
  }, []);
  var shouldPrevent = reactExports.useCallback(function(_event) {
    var event = _event;
    if (!lockStack.length || lockStack[lockStack.length - 1] !== Style) {
      return;
    }
    var delta = "deltaY" in event ? getDeltaXY(event) : getTouchXY(event);
    var sourceEvent = shouldPreventQueue.current.filter(function(e) {
      return e.name === event.type && (e.target === event.target || event.target === e.shadowParent) && deltaCompare(e.delta, delta);
    })[0];
    if (sourceEvent && sourceEvent.should) {
      if (event.cancelable) {
        event.preventDefault();
      }
      return;
    }
    if (!sourceEvent) {
      var shardNodes = (lastProps.current.shards || []).map(extractRef).filter(Boolean).filter(function(node) {
        return node.contains(event.target);
      });
      var shouldStop = shardNodes.length > 0 ? shouldCancelEvent(event, shardNodes[0]) : !lastProps.current.noIsolation;
      if (shouldStop) {
        if (event.cancelable) {
          event.preventDefault();
        }
      }
    }
  }, []);
  var shouldCancel = reactExports.useCallback(function(name, delta, target, should) {
    var event = { name, delta, target, should, shadowParent: getOutermostShadowParent(target) };
    shouldPreventQueue.current.push(event);
    setTimeout(function() {
      shouldPreventQueue.current = shouldPreventQueue.current.filter(function(e) {
        return e !== event;
      });
    }, 1);
  }, []);
  var scrollTouchStart = reactExports.useCallback(function(event) {
    touchStartRef.current = getTouchXY(event);
    activeAxis.current = void 0;
  }, []);
  var scrollWheel = reactExports.useCallback(function(event) {
    shouldCancel(event.type, getDeltaXY(event), event.target, shouldCancelEvent(event, props.lockRef.current));
  }, []);
  var scrollTouchMove = reactExports.useCallback(function(event) {
    shouldCancel(event.type, getTouchXY(event), event.target, shouldCancelEvent(event, props.lockRef.current));
  }, []);
  reactExports.useEffect(function() {
    lockStack.push(Style);
    props.setCallbacks({
      onScrollCapture: scrollWheel,
      onWheelCapture: scrollWheel,
      onTouchMoveCapture: scrollTouchMove
    });
    document.addEventListener("wheel", shouldPrevent, nonPassive);
    document.addEventListener("touchmove", shouldPrevent, nonPassive);
    document.addEventListener("touchstart", scrollTouchStart, nonPassive);
    return function() {
      lockStack = lockStack.filter(function(inst) {
        return inst !== Style;
      });
      document.removeEventListener("wheel", shouldPrevent, nonPassive);
      document.removeEventListener("touchmove", shouldPrevent, nonPassive);
      document.removeEventListener("touchstart", scrollTouchStart, nonPassive);
    };
  }, []);
  var removeScrollBar = props.removeScrollBar, inert = props.inert;
  return reactExports.createElement(
    reactExports.Fragment,
    null,
    inert ? reactExports.createElement(Style, { styles: generateStyle(id) }) : null,
    removeScrollBar ? reactExports.createElement(RemoveScrollBar, { gapMode: props.gapMode }) : null
  );
}
function getOutermostShadowParent(node) {
  var shadowParent = null;
  while (node !== null) {
    if (node instanceof ShadowRoot) {
      shadowParent = node.host;
      node = node.host;
    }
    node = node.parentNode;
  }
  return shadowParent;
}
const SideCar = exportSidecar(effectCar, RemoveScrollSideCar);
var ReactRemoveScroll = reactExports.forwardRef(function(props, ref) {
  return reactExports.createElement(RemoveScroll, __assign({}, props, { ref, sideCar: SideCar }));
});
ReactRemoveScroll.classNames = RemoveScroll.classNames;
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
var TRIGGER_NAME$1 = "DialogTrigger";
var DialogTrigger = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...triggerProps } = props;
    const context = useDialogContext(TRIGGER_NAME$1, __scopeDialog);
    const composedTriggerRef = useComposedRefs(forwardedRef, context.triggerRef);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": context.open,
        "aria-controls": context.contentId,
        "data-state": getState(context.open),
        ...triggerProps,
        ref: composedTriggerRef,
        onClick: composeEventHandlers(props.onClick, context.onOpenToggle)
      }
    );
  }
);
DialogTrigger.displayName = TRIGGER_NAME$1;
var PORTAL_NAME$1 = "DialogPortal";
var [PortalProvider, usePortalContext] = createDialogContext(PORTAL_NAME$1, {
  forceMount: void 0
});
var DialogPortal = (props) => {
  const { __scopeDialog, forceMount, children, container } = props;
  const context = useDialogContext(PORTAL_NAME$1, __scopeDialog);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PortalProvider, { scope: __scopeDialog, forceMount, children: reactExports.Children.map(children, (child) => /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Portal$1, { asChild: true, container, children: child }) })) });
};
DialogPortal.displayName = PORTAL_NAME$1;
var OVERLAY_NAME$1 = "DialogOverlay";
var DialogOverlay = reactExports.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext(OVERLAY_NAME$1, props.__scopeDialog);
    const { forceMount = portalContext.forceMount, ...overlayProps } = props;
    const context = useDialogContext(OVERLAY_NAME$1, props.__scopeDialog);
    return context.modal ? /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogOverlayImpl, { ...overlayProps, ref: forwardedRef }) }) : null;
  }
);
DialogOverlay.displayName = OVERLAY_NAME$1;
var DialogOverlayImpl = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...overlayProps } = props;
    const context = useDialogContext(OVERLAY_NAME$1, __scopeDialog);
    return (
      // Make sure `Content` is scrollable even when it doesn't live inside `RemoveScroll`
      // ie. when `Overlay` and `Content` are siblings
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReactRemoveScroll, { as: Slot, allowPinchZoom: true, shards: [context.contentRef], children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Primitive.div,
        {
          "data-state": getState(context.open),
          ...overlayProps,
          ref: forwardedRef,
          style: { pointerEvents: "auto", ...overlayProps.style }
        }
      ) })
    );
  }
);
var CONTENT_NAME$1 = "DialogContent";
var DialogContent = reactExports.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext(CONTENT_NAME$1, props.__scopeDialog);
    const { forceMount = portalContext.forceMount, ...contentProps } = props;
    const context = useDialogContext(CONTENT_NAME$1, props.__scopeDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: context.modal ? /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContentModal, { ...contentProps, ref: forwardedRef }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContentNonModal, { ...contentProps, ref: forwardedRef }) });
  }
);
DialogContent.displayName = CONTENT_NAME$1;
var DialogContentModal = reactExports.forwardRef(
  (props, forwardedRef) => {
    const context = useDialogContext(CONTENT_NAME$1, props.__scopeDialog);
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
    const context = useDialogContext(CONTENT_NAME$1, props.__scopeDialog);
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
    const context = useDialogContext(CONTENT_NAME$1, __scopeDialog);
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
              "data-state": getState(context.open),
              ...contentProps,
              ref: composedRefs,
              onDismiss: () => context.onOpenChange(false)
            }
          )
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TitleWarning, { titleId: context.titleId }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DescriptionWarning$1, { contentRef, descriptionId: context.descriptionId })
      ] })
    ] });
  }
);
var TITLE_NAME$1 = "DialogTitle";
var DialogTitle = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...titleProps } = props;
    const context = useDialogContext(TITLE_NAME$1, __scopeDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.h2, { id: context.titleId, ...titleProps, ref: forwardedRef });
  }
);
DialogTitle.displayName = TITLE_NAME$1;
var DESCRIPTION_NAME$1 = "DialogDescription";
var DialogDescription = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...descriptionProps } = props;
    const context = useDialogContext(DESCRIPTION_NAME$1, __scopeDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.p, { id: context.descriptionId, ...descriptionProps, ref: forwardedRef });
  }
);
DialogDescription.displayName = DESCRIPTION_NAME$1;
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
function getState(open) {
  return open ? "open" : "closed";
}
var TITLE_WARNING_NAME = "DialogTitleWarning";
var [WarningProvider, useWarningContext] = createContext2(TITLE_WARNING_NAME, {
  contentName: CONTENT_NAME$1,
  titleName: TITLE_NAME$1,
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
var DescriptionWarning$1 = ({ contentRef, descriptionId }) => {
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
var Root = Dialog;
var Trigger = DialogTrigger;
var Portal = DialogPortal;
var Overlay = DialogOverlay;
var Content = DialogContent;
var Title = DialogTitle;
var Description = DialogDescription;
var Close = DialogClose;
var ROOT_NAME = "AlertDialog";
var [createAlertDialogContext, createAlertDialogScope] = createContextScope(ROOT_NAME, [
  createDialogScope
]);
var useDialogScope = createDialogScope();
var AlertDialog$1 = (props) => {
  const { __scopeAlertDialog, ...alertDialogProps } = props;
  const dialogScope = useDialogScope(__scopeAlertDialog);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Root, { ...dialogScope, ...alertDialogProps, modal: true });
};
AlertDialog$1.displayName = ROOT_NAME;
var TRIGGER_NAME = "AlertDialogTrigger";
var AlertDialogTrigger = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...triggerProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Trigger, { ...dialogScope, ...triggerProps, ref: forwardedRef });
  }
);
AlertDialogTrigger.displayName = TRIGGER_NAME;
var PORTAL_NAME = "AlertDialogPortal";
var AlertDialogPortal$1 = (props) => {
  const { __scopeAlertDialog, ...portalProps } = props;
  const dialogScope = useDialogScope(__scopeAlertDialog);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Portal, { ...dialogScope, ...portalProps });
};
AlertDialogPortal$1.displayName = PORTAL_NAME;
var OVERLAY_NAME = "AlertDialogOverlay";
var AlertDialogOverlay$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...overlayProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Overlay, { ...dialogScope, ...overlayProps, ref: forwardedRef });
  }
);
AlertDialogOverlay$1.displayName = OVERLAY_NAME;
var CONTENT_NAME = "AlertDialogContent";
var [AlertDialogContentProvider, useAlertDialogContentContext] = createAlertDialogContext(CONTENT_NAME);
var AlertDialogContent$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, children, ...contentProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    const contentRef = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, contentRef);
    const cancelRef = reactExports.useRef(null);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      WarningProvider,
      {
        contentName: CONTENT_NAME,
        titleName: TITLE_NAME,
        docsSlug: "alert-dialog",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogContentProvider, { scope: __scopeAlertDialog, cancelRef, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Content,
          {
            role: "alertdialog",
            ...dialogScope,
            ...contentProps,
            ref: composedRefs,
            onOpenAutoFocus: composeEventHandlers(contentProps.onOpenAutoFocus, (event) => {
              var _a;
              event.preventDefault();
              (_a = cancelRef.current) == null ? void 0 : _a.focus({ preventScroll: true });
            }),
            onPointerDownOutside: (event) => event.preventDefault(),
            onInteractOutside: (event) => event.preventDefault(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Slottable, { children }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(DescriptionWarning, { contentRef })
            ]
          }
        ) })
      }
    );
  }
);
AlertDialogContent$1.displayName = CONTENT_NAME;
var TITLE_NAME = "AlertDialogTitle";
var AlertDialogTitle$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...titleProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Title, { ...dialogScope, ...titleProps, ref: forwardedRef });
  }
);
AlertDialogTitle$1.displayName = TITLE_NAME;
var DESCRIPTION_NAME = "AlertDialogDescription";
var AlertDialogDescription$1 = reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeAlertDialog, ...descriptionProps } = props;
  const dialogScope = useDialogScope(__scopeAlertDialog);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Description, { ...dialogScope, ...descriptionProps, ref: forwardedRef });
});
AlertDialogDescription$1.displayName = DESCRIPTION_NAME;
var ACTION_NAME = "AlertDialogAction";
var AlertDialogAction$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...actionProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Close, { ...dialogScope, ...actionProps, ref: forwardedRef });
  }
);
AlertDialogAction$1.displayName = ACTION_NAME;
var CANCEL_NAME = "AlertDialogCancel";
var AlertDialogCancel$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...cancelProps } = props;
    const { cancelRef } = useAlertDialogContentContext(CANCEL_NAME, __scopeAlertDialog);
    const dialogScope = useDialogScope(__scopeAlertDialog);
    const ref = useComposedRefs(forwardedRef, cancelRef);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Close, { ...dialogScope, ...cancelProps, ref });
  }
);
AlertDialogCancel$1.displayName = CANCEL_NAME;
var DescriptionWarning = ({ contentRef }) => {
  const MESSAGE = `\`${CONTENT_NAME}\` requires a description for the component to be accessible for screen reader users.

You can add a description to the \`${CONTENT_NAME}\` by passing a \`${DESCRIPTION_NAME}\` component as a child, which also benefits sighted users by adding visible context to the dialog.

Alternatively, you can use your own component as a description by assigning it an \`id\` and passing the same value to the \`aria-describedby\` prop in \`${CONTENT_NAME}\`. If the description is confusing or duplicative for sighted users, you can use the \`@radix-ui/react-visually-hidden\` primitive as a wrapper around your description component.

For more information, see https://radix-ui.com/primitives/docs/components/alert-dialog`;
  reactExports.useEffect(() => {
    var _a;
    const hasDescription = document.getElementById(
      (_a = contentRef.current) == null ? void 0 : _a.getAttribute("aria-describedby")
    );
    if (!hasDescription) console.warn(MESSAGE);
  }, [MESSAGE, contentRef]);
  return null;
};
var Root2 = AlertDialog$1;
var Portal2 = AlertDialogPortal$1;
var Overlay2 = AlertDialogOverlay$1;
var Content2 = AlertDialogContent$1;
var Action = AlertDialogAction$1;
var Cancel = AlertDialogCancel$1;
var Title2 = AlertDialogTitle$1;
var Description2 = AlertDialogDescription$1;
const AlertDialog = Root2;
const AlertDialogPortal = Portal2;
const AlertDialogOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Overlay2,
  {
    className: cn$1(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
AlertDialogOverlay.displayName = Overlay2.displayName;
const AlertDialogContent = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsx(
    Content2,
    {
      ref,
      className: cn$1(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      ),
      ...props
    }
  )
] }));
AlertDialogContent.displayName = Content2.displayName;
const AlertDialogHeader = ({
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    className: cn$1(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    ),
    ...props
  }
);
AlertDialogHeader.displayName = "AlertDialogHeader";
const AlertDialogFooter = ({
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    className: cn$1(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    ),
    ...props
  }
);
AlertDialogFooter.displayName = "AlertDialogFooter";
const AlertDialogTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Title2,
  {
    ref,
    className: cn$1("text-lg font-semibold", className),
    ...props
  }
));
AlertDialogTitle.displayName = Title2.displayName;
const AlertDialogDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Description2,
  {
    ref,
    className: cn$1("text-sm text-muted-foreground", className),
    ...props
  }
));
AlertDialogDescription.displayName = Description2.displayName;
const AlertDialogAction = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Action,
  {
    ref,
    className: cn$1(buttonVariants(), className),
    ...props
  }
));
AlertDialogAction.displayName = Action.displayName;
const AlertDialogCancel = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Cancel,
  {
    ref,
    className: cn$1(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    ),
    ...props
  }
));
AlertDialogCancel.displayName = Cancel.displayName;
function De(e, n) {
}
function $e() {
}
function Ue() {
}
function je(e) {
}
function Ie() {
}
function qe() {
}
function He(e) {
}
function Ge() {
}
function Ke() {
}
var le = { on: De, collapse: $e, blur: Ue, update: je, destroy: Ie, unmount: qe, mount: He, focus: Ge, clear: Ke };
function Le(e) {
  if (typeof e == "boolean") return e;
}
function ze(e) {
  if (e === null) return null;
}
function Qe(e) {
  if (typeof e == "string") return e;
}
function Ye(e) {
  if (typeof e == "number") return e;
}
function Ze(e) {
  if (typeof e == "object" && !Array.isArray(e) && e !== null) return e;
}
function en(e) {
  if (Array.isArray(e)) return e;
}
var v = { bool: Le, $$null: ze, string: Qe, $$float: Ye, object: Ze, array: en };
function L(e, n, o) {
  for (var t2 = new Array(o), r = 0, a2 = n; r < o; ) t2[r] = e[a2], r = r + 1 | 0, a2 = a2 + 1 | 0;
  return t2;
}
function ce(e, n) {
  for (; ; ) {
    var o = n, t2 = e, r = t2.length, a2 = r === 0 ? 1 : r, m2 = o.length, l = a2 - m2 | 0;
    if (l === 0) return t2.apply(null, o);
    if (l >= 0) return /* @__PURE__ */ function(f, u2) {
      return function(i) {
        return ce(f, u2.concat([i]));
      };
    }(t2, o);
    n = L(o, a2, -l | 0), e = t2.apply(null, L(o, 0, a2));
  }
}
function rn(e, n) {
  var o = e.length;
  if (o === 1) return e(n);
  switch (o) {
    case 1:
      return e(n);
    case 2:
      return function(t2) {
        return e(n, t2);
      };
    case 3:
      return function(t2, r) {
        return e(n, t2, r);
      };
    case 4:
      return function(t2, r, a2) {
        return e(n, t2, r, a2);
      };
    case 5:
      return function(t2, r, a2, m2) {
        return e(n, t2, r, a2, m2);
      };
    case 6:
      return function(t2, r, a2, m2, l) {
        return e(n, t2, r, a2, m2, l);
      };
    case 7:
      return function(t2, r, a2, m2, l, f) {
        return e(n, t2, r, a2, m2, l, f);
      };
    default:
      return ce(e, [n]);
  }
}
function U(e) {
  var n = e.length;
  return n === 1 ? e : function(o) {
    return rn(e, o);
  };
}
function P$1(e) {
  return e === void 0 ? { BS_PRIVATE_NESTED_SOME_NONE: 0 } : e !== null && e.BS_PRIVATE_NESTED_SOME_NONE !== void 0 ? { BS_PRIVATE_NESTED_SOME_NONE: e.BS_PRIVATE_NESTED_SOME_NONE + 1 | 0 } : e;
}
function j(e) {
  if (!(e !== null && e.BS_PRIVATE_NESTED_SOME_NONE !== void 0)) return e;
  var n = e.BS_PRIVATE_NESTED_SOME_NONE;
  if (n !== 0) return { BS_PRIVATE_NESTED_SOME_NONE: n - 1 | 0 };
}
function on(e, n) {
  if (e !== void 0) return n(j(e));
}
function R$1(e, n) {
  return on(e, U(n));
}
function _(e, n) {
  return e !== void 0 ? j(e) : n;
}
function mn(e) {
  return Promise.resolve({});
}
function ln(e, n, o) {
  return Promise.resolve({});
}
function cn(e) {
  return Promise.resolve({});
}
function fe(e) {
  return e;
}
var b$1 = { clientSecret: "", confirmPayment: mn, confirmCardPayment: ln, retrievePaymentIntent: cn, paymentRequest: fe }, O = reactExports.createContext(b$1), sn = O.Provider, q = { make: sn }, z = { ephemeralKey: "", paymentRequest: fe }, Q = reactExports.createContext(z);
Q.Provider;
function k(e, n, o) {
  return _(R$1(e[n], v.string), o);
}
function H(e) {
  var n = _(v.object(e), {});
  return {
    fonts: _(R$1(n.fonts, v.array), []),
    locale: k(n, "locale", ""),
    clientSecret: k(n, "clientSecret", ""),
    appearance: _(R$1(n.appearance, v.object), {}),
    loader: k(n, "loader", "auto")
  };
}
function pe(e) {
}
function ye(e) {
}
function Ce() {
  return new Promise(function(e, n) {
    setTimeout(function() {
      e({});
    }, 1e3);
  });
}
function ve(e, n) {
  return le;
}
var dn = { fonts: [], locale: "", clientSecret: "", appearance: {}, loader: "" }, B = { options: dn, update: pe, getElement: ye, fetchUpdates: Ce, create: ve }, S$1 = reactExports.createContext(B), pn = S$1.Provider, G = { make: pn };
var yn = { fonts: [], locale: "", ephemeralKey: "", appearance: {}, loader: "" }, Y = { options: yn, update: pe, getElement: ye, fetchUpdates: Ce, create: ve }, Z = reactExports.createContext(Y);
Z.Provider;
function vn(e) {
  var n = e.onClick, o = e.onBlur, t2 = e.onFocus, r = e.componentType, a2 = e.onReady, m2 = e.onChange, l = e.options, f = e.id, u2 = f !== void 0 ? f : "payment-Element", i = reactExports.useContext(O), y2 = reactExports.useContext(S$1), p2 = reactExports.useRef(null), d2 = y2.create(r, l);
  return reactExports.useEffect(function() {
    var c = y2.create(r, l);
    c.mount("#orca-elements-payment-element-" + u2);
  }, [p2, y2]), reactExports.useEffect(function() {
    d2.on("ready", a2), d2.on("focus", t2), d2.on("blur", o), d2.on("clickTriggered", n), d2.on("change", m2);
  }, [y2, i]), jsxRuntimeExports.jsx("div", {
    ref: P$1(p2),
    id: "orca-elements-payment-element-" + u2
  });
}
var s$1 = vn;
function w(e, n) {
  return n.then(U(e));
}
function Mn(e) {
  var n = e.options, o = e.hyper, t2 = H(n), r = reactExports.useState(function() {
    return b$1;
  }), a2 = r[1], m2 = reactExports.useState(function() {
    return B;
  }), l = m2[1];
  return reactExports.useEffect(function() {
    (function(f) {
      return w(function(u2) {
        var i = u2.elements(n), y2 = i.update, p2 = i.getElement, d2 = i.fetchUpdates, c = i.create, x = { options: t2, update: y2, getElement: p2, fetchUpdates: d2, create: c }, N2 = t2.clientSecret, F2 = u2.confirmPayment, g2 = u2.confirmCardPayment, J2 = u2.retrievePaymentIntent, K2 = u2.paymentRequest, V2 = {
          clientSecret: N2,
          confirmPayment: F2,
          confirmCardPayment: g2,
          retrievePaymentIntent: J2,
          paymentRequest: K2
        };
        return a2(function(X2) {
          return V2;
        }), l(function(X2) {
          return x;
        }), Promise.resolve(V2);
      }, f);
    })(o);
  }, []), jsxRuntimeExports.jsx(q.make, { value: r[0], children: jsxRuntimeExports.jsx(G.make, { value: m2[0], children: e.children }) });
}
var Oe = Mn;
function Jn(e) {
  return jsxRuntimeExports.jsx(s$1, {
    id: e.id,
    options: e.options,
    onChange: e.onChange,
    onReady: e.onReady,
    componentType: "payment",
    onFocus: e.onFocus,
    onBlur: e.onBlur,
    onClick: e.onClick
  });
}
var ie = Jn;
function Hn() {
  return reactExports.useContext(O);
}
function Xn() {
  return console.warn("useElements() is deprecated. Use useWidgets() instead"), reactExports.useContext(S$1);
}
var zn = Oe, Yn = ie;
function useSubscriptionPlans() {
  const apiUrl = useApiUrl();
  const { data: plansData, isLoading: plansAreLoading } = ii({
    url: `${apiUrl}/api/account/subscription/plans`,
    method: "get"
  });
  return { plansData, plansAreLoading };
}
function useSubmitSubscriptionChange(fromContext = false) {
  const apiUrl = useApiUrl();
  const { open } = $e$1();
  const { refetchSubscription } = fromContext ? useSubscription() : useSubscriptionContext();
  const { mutate, isLoading: isPlanChanging } = pi();
  const submitPlanChange = (
    //useCallback(
    async (plan, paymentMethodId) => {
      const values = {
        plan: plan.identifier
      };
      if (paymentMethodId) {
        values.payment_method_id = paymentMethodId;
      }
      mutate(
        {
          url: `${apiUrl}/api/account/subscription/change`,
          method: "post",
          values
        },
        {
          async onSuccess() {
            open == null ? void 0 : open({
              type: "success",
              message: "Subscription change initiated"
            });
            refetchSubscription();
          },
          onError(error) {
            open == null ? void 0 : open({
              type: "error",
              message: `Failed to change subscription: ${error.message}`
            });
          }
        }
      );
    }
  );
  return {
    isPlanChanging,
    submitPlanChange
  };
}
function p(r, n, e) {
  for (var t2 = new Array(e), i = 0, u2 = n; i < e; )
    t2[i] = r[u2], i = i + 1 | 0, u2 = u2 + 1 | 0;
  return t2;
}
function m(r, n) {
  for (; ; ) {
    var e = n, t2 = r, i = t2.length, u2 = i === 0 ? 1 : i, o = e.length, f = u2 - o | 0;
    if (f === 0) return t2.apply(null, e);
    if (f >= 0)
      return /* @__PURE__ */ function(l, c) {
        return function(_2) {
          return m(l, c.concat([_2]));
        };
      }(t2, e);
    n = p(e, u2, -f | 0), r = t2.apply(null, p(e, 0, u2));
  }
}
function d(r, n, e, t2) {
  var i = r.length;
  if (i === 3) return r(n, e, t2);
  switch (i) {
    case 1:
      return m(r(n), [e, t2]);
    case 2:
      return m(r(n, e), [t2]);
    case 3:
      return r(n, e, t2);
    case 4:
      return function(u2) {
        return r(n, e, t2, u2);
      };
    case 5:
      return function(u2, o) {
        return r(n, e, t2, u2, o);
      };
    case 6:
      return function(u2, o, f) {
        return r(n, e, t2, u2, o, f);
      };
    case 7:
      return function(u2, o, f, l) {
        return r(n, e, t2, u2, o, f, l);
      };
    default:
      return m(r, [n, e, t2]);
  }
}
function a(r) {
  return r === void 0 ? { BS_PRIVATE_NESTED_SOME_NONE: 0 } : r !== null && r.BS_PRIVATE_NESTED_SOME_NONE !== void 0 ? { BS_PRIVATE_NESTED_SOME_NONE: r.BS_PRIVATE_NESTED_SOME_NONE + 1 | 0 } : r;
}
function s(r) {
  if (!(r !== null && r.BS_PRIVATE_NESTED_SOME_NONE !== void 0)) return r;
  var n = r.BS_PRIVATE_NESTED_SOME_NONE;
  if (n !== 0) return { BS_PRIVATE_NESTED_SOME_NONE: n - 1 | 0 };
}
function A(r, n) {
  if (n in r) return a(r[n]);
}
function I(r) {
  for (var n = {}, e = r.length, t2 = 0; t2 < e; ++t2) {
    var i = r[t2];
    n[i[0]] = i[1];
  }
  return n;
}
function N(r) {
  if (typeof r == "string") return r;
}
function S(r) {
  if (typeof r == "object" && !Array.isArray(r) && r !== null) return a(r);
}
var y = 2147483647, g = -2147483648;
function M(r) {
  return r > y ? y : r < g ? g : Math.floor(r);
}
function E(r, n) {
  return M(Math.random() * (n - r | 0)) + r | 0;
}
function P(r, n) {
  for (var e = new Array(r), t2 = 0; t2 < r; ++t2) e[t2] = n;
  return e;
}
function b(r, n) {
  return r !== void 0 ? s(r) : n;
}
function T(r) {
  var n = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return P(32, 0).reduce(function(e, t2) {
    var i = E(0, n.length), u2 = n.charAt(i);
    return e + u2;
  }, "");
}
function R(r) {
  var n = r !== void 0 ? b(S(s(r)), {}) : {}, e = A(n, "env");
  if (e === void 0) return "";
  var t2 = N(s(e));
  return t2 !== void 0 ? t2 : "";
}
function V(r, n) {
  return new Promise(function(e, t2) {
    var i = T(), u2 = Date.now(), o = R(n), f;
    switch (o) {
      case "PROD":
        f = "https://checkout.hyperswitch.io/v0/HyperLoader.js";
        break;
      case "SANDBOX":
        f = "https://beta.hyperswitch.io/v1/HyperLoader.js";
        break;
      default:
        f = r.startsWith("pk_prd_") ? "https://checkout.hyperswitch.io/v0/HyperLoader.js" : "https://beta.hyperswitch.io/v1/HyperLoader.js";
    }
    var l = I([
      ["sessionID", i],
      ["timeStamp", String(u2)]
    ]);
    if (document.querySelectorAll('script[src="' + f + '"]').length === 0) {
      var c = document.createElement("script");
      c.src = f, c.onload = function(w2) {
        var C = window.Hyper;
        if (C != null) return e(d(C, r, n, l));
      }, c.onerror = function(w2) {
        t2(w2);
      }, document.body.appendChild(c);
      return;
    }
    console.warn(
      "INTEGRATION WARNING: There is already an existing script tag for " + f + ". Multiple additions of HyperLoader.js is not permitted, please add it on the top level only once."
    );
    var _2 = window.Hyper;
    if (_2 != null) return e(d(_2, r, n, l));
  });
}
const defaultContextValue = {
  subscription: void 0,
  isLoading: false,
  plans: [],
  selectedPlan: null,
  handlePlanSelection: () => {
  },
  isPlanChanging: false,
  submitPlanChange: async () => {
  },
  refetchSubscription: async () => ({}),
  // This is a placeholder and will be overwritten in the provider
  hyperState: {
    isHyperLoaded: false,
    error: null
  },
  setEphemeralKey: (key) => {
  }
};
const SubscriptionContext = reactExports.createContext(defaultContextValue);
function useSubscriptionContext() {
  const context = reactExports.useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscriptionContext must be used within a SubscriptionProvider"
    );
  }
  return context;
}
function SubscriptionProvider({ children }) {
  var _a;
  const { subscriptionData, subscriptionIsLoading, refetchSubscription } = useSubscription();
  const { plansData, plansAreLoading } = useSubscriptionPlans();
  const { isPlanChanging, submitPlanChange } = useSubmitSubscriptionChange(true);
  const [selectedPlan, setSelectedPlan] = reactExports.useState(
    null
  );
  const [ephemeralKey, setEphemeralKey] = reactExports.useState(null);
  const handlePlanSelection = (plan) => {
    setSelectedPlan(plan);
  };
  const hyperPromiseRef = reactExports.useRef(null);
  const [hyperState, setHyperState] = reactExports.useState({
    isHyperLoaded: false,
    error: null
  });
  const initializeHyper = reactExports.useCallback(() => {
    var _a2;
    if ((_a2 = subscriptionData == null ? void 0 : subscriptionData.payment_info) == null ? void 0 : _a2.publishable_key) {
      setHyperState((prev) => ({ ...prev, isLoading: true, error: null }));
      const promise = V(subscriptionData.payment_info.publishable_key, {
        env: "SANDBOX",
        ephemeralKey
      });
      if (promise) {
        hyperPromiseRef.current = promise;
        promise.then(() => {
          setHyperState((prev) => ({
            ...prev,
            isLoading: false,
            isHyperLoaded: true
          }));
        }).catch((error) => {
          console.error("Failed to load Hyper instance:", error);
          hyperPromiseRef.current = null;
          setHyperState((prev) => ({ ...prev, isLoading: false, error }));
        });
      } else {
        setHyperState((prev) => ({ ...prev, isLoading: false }));
      }
    }
  }, [subscriptionIsLoading]);
  reactExports.useEffect(() => {
    if (!hyperPromiseRef.current) {
      initializeHyper();
    }
  }, [initializeHyper]);
  reactExports.useEffect(() => {
    refetchSubscription();
  }, [refetchSubscription]);
  const value = {
    subscription: subscriptionData,
    isLoading: subscriptionIsLoading || plansAreLoading,
    plans: ((_a = plansData == null ? void 0 : plansData.data) == null ? void 0 : _a.plans) ?? [],
    selectedPlan,
    isPlanChanging,
    handlePlanSelection,
    submitPlanChange,
    refetchSubscription,
    hyperState: {
      isHyperLoaded: hyperState.isHyperLoaded,
      error: hyperState.error
    },
    hyperPromise: hyperPromiseRef.current,
    setEphemeralKey
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SubscriptionContext.Provider, { value, children });
}
function useRequestPaymentMethodChange() {
  const apiUrl = useApiUrl();
  const [clientSecret, setClientSecret] = reactExports.useState();
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const { mutateAsync } = pi();
  const requestPaymentMethodChange = reactExports.useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await mutateAsync({
        url: `${apiUrl}/api/account/subscription/request-payment-method-change`,
        method: "post",
        values: {}
      });
      setClientSecret(data.client_secret);
    } catch (error) {
      console.error("Failed to request payment method change:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [mutateAsync, apiUrl]);
  return {
    requestPaymentMethodChange,
    clientSecret,
    isLoading
  };
}
function HyperPayment({
  onPaymentSuccess,
  mode = "subscribe"
}) {
  const { subscription, hyperPromise, hyperState } = useSubscriptionContext();
  const [clientSecret, setClientSecret] = reactExports.useState();
  const {
    requestPaymentMethodChange,
    isLoading: isRequestingPaymentMethodChange,
    clientSecret: changePaymentClientSecret
  } = useRequestPaymentMethodChange();
  const paymentRequestChangeMode = reactExports.useRef(false);
  reactExports.useEffect(() => {
    var _a;
    if (mode === "change_payment" && !clientSecret) {
      if (!isRequestingPaymentMethodChange && !paymentRequestChangeMode.current) {
        paymentRequestChangeMode.current = true;
        requestPaymentMethodChange();
      }
      if (changePaymentClientSecret) {
        setClientSecret(changePaymentClientSecret);
      }
    }
    if (mode === "subscribe" && !clientSecret) {
      setClientSecret((_a = subscription == null ? void 0 : subscription.payment_info) == null ? void 0 : _a.client_secret);
    }
  }, [
    mode,
    clientSecret,
    isRequestingPaymentMethodChange,
    paymentRequestChangeMode.current,
    changePaymentClientSecret,
    requestPaymentMethodChange
  ]);
  if (!hyperState.isHyperLoaded || !clientSecret || mode === "change_payment" && isRequestingPaymentMethodChange) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(StyledPaymentSkeleton, {});
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative min-h-[300px] w-full max-w-md mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    zn,
    {
      options: {
        manual_retry_allowed: true,
        clientSecret
      },
      hyper: hyperPromise,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Yn,
          {
            options: {
              displaySavedPaymentMethods: false,
              displaySavedPaymentMethodsCheckbox: false,
              hideCardNicknameField: true,
              layout: {
                type: "accordion"
              }
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          PaymentConfirmationButton,
          {
            onPaymentSuccess,
            mode
          }
        )
      ]
    }
  ) });
}
const PaymentConfirmationButton = ({
  onPaymentSuccess,
  mode
}) => {
  const hyper = Hn();
  const elements = Xn();
  const [isProcessing, setIsProcessing] = reactExports.useState(false);
  const [paymentError, setPaymentError] = reactExports.useState(null);
  const handlePayment = async () => {
    var _a;
    if (!hyper || !elements) {
      console.error("Hyper or elements not initialized");
      return;
    }
    setIsProcessing(true);
    setPaymentError(null);
    try {
      const result = await hyper.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href.toString()
        },
        redirect: "if_required"
      });
      if ((result == null ? void 0 : result.status) === "failed" || result.error) {
        setPaymentError(
          ((_a = result.error) == null ? void 0 : _a.message) || "An error occurred during payment"
        );
        console.error("Payment failed:", result.error);
      } else {
        console.log("Payment succeeded:", result);
        onPaymentSuccess(result.payment_method_id);
      }
    } catch (error) {
      setPaymentError("An unexpected error occurred");
      console.error("Error confirming payment:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        onClick: handlePayment,
        disabled: isProcessing,
        className: "w-full py-2 px-4 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
        children: isProcessing ? "Processing..." : mode === "subscribe" ? "Subscribe" : "Update Payment Method"
      }
    ),
    paymentError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-red-500 mt-2", children: paymentError })
  ] });
};
const StyledPaymentSkeleton = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-center min-h-[300px] p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-3/4 mx-auto" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-5/6 mx-auto" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-2/3 mx-auto" })
  ] }) });
};
function useSubmitSubscriptionConnect() {
  const apiUrl = useApiUrl();
  const { open } = $e$1();
  const { mutate, isLoading: isSubmitting } = pi();
  const { refetchSubscription } = useSubscriptionContext();
  const connectPaymentMethod = reactExports.useCallback(
    async (paymentMethodId, onSuccess) => {
      mutate(
        {
          url: `${apiUrl}/api/account/subscription/connect`,
          method: "post",
          values: { payment_method_id: paymentMethodId }
        },
        {
          onSuccess() {
            open == null ? void 0 : open({
              type: "success",
              message: "Payment method connected successfully"
            });
            refetchSubscription == null ? void 0 : refetchSubscription();
            onSuccess();
          },
          onError(error) {
            open == null ? void 0 : open({
              type: "error",
              message: `Failed to connect payment method: ${error.message}`
            });
          }
        }
      );
    },
    [mutate, open, apiUrl]
  );
  return {
    isSubmitting,
    connectPaymentMethod
  };
}
function ChangePaymentMethod() {
  const [showDialog, setShowDialog] = React.useState(false);
  const { connectPaymentMethod } = useSubmitSubscriptionConnect();
  const handleSuccess = (paymentMethodId) => {
    setShowDialog(false);
    connectPaymentMethod(paymentMethodId, () => {
      setShowDialog(false);
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Change Payment Method" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outline",
          className: "w-full",
          onClick: () => setShowDialog(true),
          children: "Change Payment Method"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: showDialog, onOpenChange: setShowDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Change Payment Method" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          HyperPayment,
          {
            onPaymentSuccess: handleSuccess,
            mode: "change_payment"
          }
        ) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Close" }) })
    ] }) })
  ] });
}
function useSubmitSubscriptionCancellation() {
  const apiUrl = useApiUrl();
  const { open } = $e$1();
  const { mutate, isLoading: isSubmitting } = pi();
  const { refetchSubscription } = useSubscriptionContext();
  const cancelSubscription = reactExports.useCallback(
    async (onSuccess) => {
      mutate(
        {
          url: `${apiUrl}/api/account/subscription/cancel`,
          method: "post",
          values: {}
        },
        {
          onSuccess() {
            open == null ? void 0 : open({
              type: "success",
              message: "Subscription cancelled successfully"
            });
            refetchSubscription == null ? void 0 : refetchSubscription();
            onSuccess();
          },
          onError(error) {
            open == null ? void 0 : open({
              type: "error",
              message: `Failed to cancel subscription: ${error.message}`
            });
          }
        }
      );
    },
    [mutate, open, apiUrl]
  );
  return {
    isSubmitting,
    cancelSubscription
  };
}
function SubscriptionHistory() {
  var _a;
  const [showDialog, setShowDialog] = React.useState(false);
  const { subscription } = useSubscriptionContext();
  const { cancelSubscription } = useSubmitSubscriptionCancellation();
  const doAction = () => {
    cancelSubscription(() => {
      setShowDialog(true);
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "h-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Subscription History" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, {}),
      (subscription == null ? void 0 : subscription.plan) && /* @__PURE__ */ jsxRuntimeExports.jsx(CardFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outline",
          className: "w-full",
          onClick: () => setShowDialog(true),
          children: "Cancel Subscription"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: showDialog, onOpenChange: setShowDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Cancel Subscription" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: `Are you sure you want to cancel your subscription to the ${(_a = subscription == null ? void 0 : subscription.plan) == null ? void 0 : _a.name} plan?` }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: doAction, children: "Cancel Subscription" })
      ] })
    ] }) })
  ] });
}
function SubscribePayment() {
  const [showDialog, setShowDialog] = React.useState(true);
  const { selectedPlan } = useSubscriptionContext();
  const { connectPaymentMethod } = useSubmitSubscriptionConnect();
  const handleSuccess = (paymentMethodId) => {
    connectPaymentMethod(paymentMethodId, () => {
      setShowDialog(false);
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: showDialog, onOpenChange: setShowDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Complete Payment" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        `Please complete your payment to subscribe to the ${selectedPlan == null ? void 0 : selectedPlan.name} plan.`,
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          HyperPayment,
          {
            mode: "subscribe",
            onPaymentSuccess: handleSuccess
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Close" }) })
  ] }) });
}
function PricingPlans() {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
  const {
    subscription,
    plans,
    selectedPlan,
    handlePlanSelection,
    isPlanChanging,
    submitPlanChange,
    isLoading
  } = useSubscriptionContext();
  const [showBillingDialog, setShowBillingDialog] = reactExports.useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = reactExports.useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = reactExports.useState(false);
  const paymentExpired = new Date(((_a = subscription == null ? void 0 : subscription.payment_info) == null ? void 0 : _a.payment_expires) ?? "") <= /* @__PURE__ */ new Date();
  const planPending = ((_b = subscription == null ? void 0 : subscription.plan) == null ? void 0 : _b.status) === "PENDING";
  const showPayment = !!((_c = subscription == null ? void 0 : subscription.payment_info) == null ? void 0 : _c.payment_id) && !!((_d = subscription == null ? void 0 : subscription.payment_info) == null ? void 0 : _d.client_secret) && planPending && !paymentExpired && !!((_e = subscription == null ? void 0 : subscription.plan) == null ? void 0 : _e.is_free);
  const isBillingComplete = ((_f = subscription == null ? void 0 : subscription.billing_info) == null ? void 0 : _f.name) && ((_g = subscription == null ? void 0 : subscription.billing_info) == null ? void 0 : _g.address) && ((_h = subscription == null ? void 0 : subscription.billing_info) == null ? void 0 : _h.city) && ((_i = subscription == null ? void 0 : subscription.billing_info) == null ? void 0 : _i.state) && ((_j = subscription == null ? void 0 : subscription.billing_info) == null ? void 0 : _j.zip) && ((_k = subscription == null ? void 0 : subscription.billing_info) == null ? void 0 : _k.country);
  const onFreePlan = useOnFreePlan();
  const handleChoosePlan = (plan2) => {
    handlePlanSelection(plan2);
    if (!isBillingComplete) {
      setShowBillingDialog(true);
    } else {
      setShowConfirmDialog(true);
    }
  };
  const handleConfirmPlanChange = async () => {
    setShowConfirmDialog(false);
    if (selectedPlan) {
      await submitPlanChange(selectedPlan);
    }
  };
  reactExports.useEffect(() => {
    if (showPayment) {
      setShowPaymentDialog(true);
    }
  }, [showPayment]);
  reactExports.useEffect(() => {
    if (paymentExpired && planPending) {
      submitPlanChange(subscription == null ? void 0 : subscription.plan);
    }
  }, [paymentExpired, planPending, submitPlanChange, subscription == null ? void 0 : subscription.plan]);
  if (isLoading || isPlanChanging) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-[200px] w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-[400px]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-[400px]" })
      ] })
    ] });
  }
  const plan = subscription == null ? void 0 : subscription.plan;
  const storageUsed = 1e9;
  const storagePercent = plan ? storageUsed / ((plan == null ? void 0 : plan.storage) ?? 0) * 100 : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    plan && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mb-8 bg-transparent border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { children: [
          "Current Plan: ",
          plan.name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-4xl font-medium", children: [
          "$",
          plan == null ? void 0 : plan.price,
          "/",
          (plan == null ? void 0 : plan.period) === "MONTH" ? "mo" : "yr"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Storage Used" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            formatStorage(storageUsed),
            " / ",
            formatStorage(plan.storage)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: storagePercent }),
        storagePercent > 80 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm mt-1", children: "Running low on storage! Consider upgrading." })
      ] }) }) })
    ] }),
    !subscription ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-[400px]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-[400px]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-[400px]" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-3 gap-8", children: plans.map((plan2, index) => {
      var _a2;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: cn$1(
            "md:col-span-1",
            {
              "ring-2 ring-primary rounded-xl": [
                (_a2 = subscription == null ? void 0 : subscription.plan) == null ? void 0 : _a2.identifier,
                selectedPlan == null ? void 0 : selectedPlan.identifier
              ].includes(plan2.identifier)
            },
            {
              "md:col-span-3": index === plans.length - 1 && plans.length % 3 === 1,
              "md:col-span-2": index === plans.length - 1 && plans.length % 3 === 2
            }
          ),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            PlanCard,
            {
              plan: plan2,
              subscription,
              selectedPlan,
              onChoosePlan: handleChoosePlan,
              onFreePlan
            }
          )
        },
        plan2.identifier
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: showBillingDialog, onOpenChange: setShowBillingDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Complete Billing Information" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: (subscription == null ? void 0 : subscription.plan) ? "Please complete your billing information before changing your plan." : "Please complete your billing information before subscribing." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { children: "Ok" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: showConfirmDialog, onOpenChange: setShowConfirmDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: (subscription == null ? void 0 : subscription.plan) ? "Confirm Plan Change" : "Confirm Subscription" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: (subscription == null ? void 0 : subscription.plan) && selectedPlan ? `Are you sure you want to ${onFreePlan ? "Subscribe" : selectedPlan.price > subscription.plan.price ? "Upgrade" : "Downgrade"} to the ${selectedPlan == null ? void 0 : selectedPlan.name} plan?` : `Are you sure you want to subscribe to the ${selectedPlan == null ? void 0 : selectedPlan.name} plan?` })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: handleConfirmPlanChange, children: "Confirm" })
      ] })
    ] }) }),
    showPaymentDialog && /* @__PURE__ */ jsxRuntimeExports.jsx(SubscribePayment, {})
  ] });
}
const formatStorage = (storage) => filesize(storage, 0).toUpperCase();
const formatBandwidth = (bandwidth) => filesize(bandwidth, 0).toUpperCase();
function PlanCard(props) {
  var _a, _b;
  const { plan, subscription, onChoosePlan, onFreePlan } = props;
  const getChangeType = (currentPlan, newPlan) => {
    if (onFreePlan) {
      return "Subscribe";
    }
    return newPlan.price > currentPlan.price ? "Upgrade" : "Downgrade";
  };
  const planPending = ((_a = subscription == null ? void 0 : subscription.plan) == null ? void 0 : _a.status) === "PENDING";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-4xl font-bold", children: plan.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-5xl", children: [
        "$",
        plan.price,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-lg font-normal text-muted-foreground", children: [
          "/",
          plan.period === "MONTH" ? "month" : "year"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CloudIcon, { className: "size-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Storage:" }),
            " ",
            formatStorage(plan.storage)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CloudUploadIcon, { className: "size-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Upload:" }),
            " ",
            formatBandwidth(plan.upload),
            "/month"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DownloadIcon, { className: "size-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Download:" }),
            " ",
            formatBandwidth(plan.download),
            "/month"
          ] })
        ] })
      ] }),
      !(subscription == null ? void 0 : subscription.plan) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", onClick: () => onChoosePlan(plan), children: "Subscribe" }),
      (subscription == null ? void 0 : subscription.plan) && plan.identifier !== subscription.plan.identifier && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full bg-muted-foreground text-black hover:bg-muted-foreground/80", onClick: () => onChoosePlan(plan), children: getChangeType(subscription.plan, plan) }),
      plan.identifier === ((_b = subscription == null ? void 0 : subscription.plan) == null ? void 0 : _b.identifier) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-primary font-semibold text-center", children: planPending ? "Pending Plan" : "Current Plan" })
    ] })
  ] });
}
function Subscription() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SubscriptionProvider, {
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(SubscriptionContent, {})
  });
}
const TABS = {
  BILLING: "billing",
  PAYMENT_HISTORY: "payment-history",
  PAYMENT_METHOD: "payment-method",
  ADDONS: "addons"
};
function SubscriptionContent() {
  const {
    isLoading
  } = useSubscriptionContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const paidBillingEnabled = useIsPaidBillingEnabled();
  const onFreePlan = useOnFreePlan();
  const searchTab = TABS[searchParams.get("tab")] ?? TABS.BILLING;
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonSubscription, {});
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    className: "grid lg:grid-cols-3 gap-6 pt-4",
    children: [/* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      className: "lg:col-span-3",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(PricingPlans, {})
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      className: "lg:col-span-3 border-t border-border/30 pt-4",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, {
        defaultValue: searchTab,
        onValueChange: (value) => setSearchParams({
          tab: value
        }),
        className: "space-y-4",
        children: [/* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, {
          children: [paidBillingEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, {
            value: "billing",
            children: "Billing Information"
          }), paidBillingEnabled && !onFreePlan && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, {
            value: "payment-history",
            children: "Payment History"
          }), paidBillingEnabled && !onFreePlan && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, {
            value: "payment-method",
            children: "Payment Method"
          }), false]
        }), paidBillingEnabled && !onFreePlan && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, {
          value: "payment-history",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(SubscriptionHistory, {})
        }), paidBillingEnabled && !onFreePlan && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, {
          value: "payment-method",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChangePaymentMethod, {})
        }), paidBillingEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, {
          value: "billing",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(BillingInformation, {})
        }), false]
      })
    })]
  });
}
function SkeletonSubscription() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    className: "grid lg:grid-cols-3 gap-6",
    children: [/* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      className: "lg:col-span-1 flex flex-col gap-6",
      children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, {
        className: "h-48"
      }), /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, {
        className: "h-48"
      }), /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, {
        className: "h-48"
      })]
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      className: "lg:col-span-2",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, {
        className: "h-48"
      })
    })]
  });
}
export {
  Subscription as default
};
