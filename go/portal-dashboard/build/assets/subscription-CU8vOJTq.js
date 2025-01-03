import { r as reactExports, j as jsxRuntimeExports, R as React } from "./jsx-runtime-CzXAEjbZ.js";
import { S as Skeleton } from "./skeleton-DaJxHvFz.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-N4hUChmK.js";
import { u as useSubscription, b as useIsPaidBillingEnabled, a as useApiUrl } from "./useSubscription-BUn1Y-e1.js";
import { u as usePluginMeta } from "./usePluginMeta-DuNGe9eG.js";
import { c as $e$1, p as pi, s as shimExports, z as zt, a as ii } from "./index-xFQL_PNe.js";
import { t } from "./zod-BlhIUxtz.js";
import { b as cn$1, B as Button, u as useComposedRefs, e as Slottable, d as buttonVariants } from "./button-jedbwRXf.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent, d as CardFooter } from "./card-CfGpM6tx.js";
import { a as FormField, b as FormItem, e as FormLabel, c as FormControl, d as FormMessage, u as useForm, F as Form } from "./form-B0KDmX57.js";
import { I as Input } from "./input-Sza_mO8a.js";
import { T as Textarea } from "./textarea-CO5zMSog.js";
import { R as Root, P as Portal, O as Overlay, C as Content, c as createContextScope, d as createDialogScope, b as Trigger, W as WarningProvider, T as Title, D as Description, a as Close } from "./index-DVyQH_Qd.js";
import { P as Primitive } from "./react-icons.esm-o-P2jf_4.js";
import { u as useId } from "./component-Da1x9Q9K.js";
import "./dialog-e2EjNOoC.js";
import { S as Search } from "./search-BNA3F8Pn.js";
import { P as Popover, a as PopoverTrigger, b as PopoverContent } from "./index-DO2s7-z0.js";
import { c as createLucideIcon } from "./createLucideIcon-DFCINFSp.js";
import { C as Check } from "./check-Cgx-PNK3.js";
import { z as z$1 } from "./index-BpxO7BrF.js";
import { b as composeEventHandlers } from "./index-DpbAjMft.js";
import { d as CloudIcon, f as CloudUploadIcon, D as DownloadIcon } from "./icons-3kvdaKde.js";
import { P as Progress, f as filesize } from "./progress-DqLuAjsp.js";
import { a as useSearchParams } from "./index-QWRrEtKK.js";
import "./index-DdpwiKzx.js";
import "./index-COfyDwxK.js";
import "./index-CxTzuwWC.js";
import "./index-CJ8FhmRo.js";
import "./useFeatureFlag-BpxbgP9R.js";
import "./usePortalMeta-iFy40cTW.js";
import "./usePortalUrl-CWejBXEP.js";
import "./label-DTm3nVMD.js";
import "./createLucideIcon-B7dNuMLx.js";
import "./index-5ukv8M2q.js";
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
var k$2 = 0.99, m$1 = /[\\\/_+.#"@\[\(\{&]/, B$1 = /[\\\/_+.#"@\[\(\{&]/g, K$1 = /[\s-]/, X = /[\s-]/g;
function G$2(_2, C, h, P2, A2, f, O2) {
  if (f === C.length) return A2 === _2.length ? U$1 : k$2;
  var T2 = `${A2},${f}`;
  if (O2[T2] !== void 0) return O2[T2];
  for (var L2 = P2.charAt(f), c = h.indexOf(L2, A2), S2 = 0, E2, N2, R2, M2; c >= 0; ) E2 = G$2(_2, C, h, P2, c + 1, f + 1, O2), E2 > S2 && (c === A2 ? E2 *= U$1 : m$1.test(_2.charAt(c - 1)) ? (E2 *= H$1, R2 = _2.slice(A2, c - 1).match(B$1), R2 && A2 > 0 && (E2 *= Math.pow(u, R2.length))) : K$1.test(_2.charAt(c - 1)) ? (E2 *= Y$2, M2 = _2.slice(A2, c - 1).match(X), M2 && A2 > 0 && (E2 *= Math.pow(u, M2.length))) : (E2 *= J, A2 > 0 && (E2 *= Math.pow(u, c - A2))), _2.charAt(c) !== C.charAt(f) && (E2 *= $)), (E2 < p$1 && h.charAt(c - 1) === P2.charAt(f + 1) || P2.charAt(f + 1) === P2.charAt(f) && h.charAt(c - 1) !== P2.charAt(f)) && (N2 = G$2(_2, C, h, P2, c + 1, f + 2, O2), N2 * p$1 > E2 && (E2 = N2 * p$1)), E2 > S2 && (S2 = E2), c = h.indexOf(L2, c + 1);
  return O2[T2] = S2, S2;
}
function D(_2) {
  return _2.toLowerCase().replace(X, " ");
}
function W(_2, C, h) {
  return _2 = h && h.length > 0 ? `${_2 + " " + h.join(" ")}` : _2, G$2(_2, C, D(_2), D(C), 0, 0, {});
}
var N$1 = '[cmdk-group=""]', Q$1 = '[cmdk-group-items=""]', be = '[cmdk-group-heading=""]', Z$1 = '[cmdk-item=""]', le$1 = `${Z$1}:not([aria-disabled="true"])`, Y$1 = "cmdk-item-select", I$1 = "data-value", he = (r, o, t2) => W(r, o, t2), ue = reactExports.createContext(void 0), K = () => reactExports.useContext(ue), de = reactExports.createContext(void 0), ee = () => reactExports.useContext(de), fe$1 = reactExports.createContext(void 0);
var me = reactExports.forwardRef((r, o) => {
  let t2 = k$1(() => {
    var e, s2;
    return { search: "", value: (s2 = (e = r.value) != null ? e : r.defaultValue) != null ? s2 : "", filtered: { count: 0, items: /* @__PURE__ */ new Map(), groups: /* @__PURE__ */ new Set() } };
  }), u2 = k$1(() => /* @__PURE__ */ new Set()), c = k$1(() => /* @__PURE__ */ new Map()), d2 = k$1(() => /* @__PURE__ */ new Map()), f = k$1(() => /* @__PURE__ */ new Set()), p2 = pe$1(r), { label: v2, children: b2, value: l, onValueChange: y2, filter: E2, shouldFilter: C, loop: H2, disablePointerSelection: ge = false, vimBindings: $2 = true, ...O2 } = r, te = useId(), B2 = useId(), F = useId(), x = reactExports.useRef(null), R2 = Te();
  M$1(() => {
    if (l !== void 0) {
      let e = l.trim();
      t2.current.value = e, h.emit();
    }
  }, [l]), M$1(() => {
    R2(6, re);
  }, []);
  let h = reactExports.useMemo(() => ({ subscribe: (e) => (f.current.add(e), () => f.current.delete(e)), snapshot: () => t2.current, setState: (e, s2, i) => {
    var a2, m2, g2;
    if (!Object.is(t2.current[e], s2)) {
      if (t2.current[e] = s2, e === "search") W2(), U2(), R2(1, z2);
      else if (e === "value" && (i || R2(5, re), ((a2 = p2.current) == null ? void 0 : a2.value) !== void 0)) {
        let S2 = s2 != null ? s2 : "";
        (g2 = (m2 = p2.current).onValueChange) == null || g2.call(m2, S2);
        return;
      }
      h.emit();
    }
  }, emit: () => {
    f.current.forEach((e) => e());
  } }), []), q2 = reactExports.useMemo(() => ({ value: (e, s2, i) => {
    var a2;
    s2 !== ((a2 = d2.current.get(e)) == null ? void 0 : a2.value) && (d2.current.set(e, { value: s2, keywords: i }), t2.current.filtered.items.set(e, ne(s2, i)), R2(2, () => {
      U2(), h.emit();
    }));
  }, item: (e, s2) => (u2.current.add(e), s2 && (c.current.has(s2) ? c.current.get(s2).add(e) : c.current.set(s2, /* @__PURE__ */ new Set([e]))), R2(3, () => {
    W2(), U2(), t2.current.value || z2(), h.emit();
  }), () => {
    d2.current.delete(e), u2.current.delete(e), t2.current.filtered.items.delete(e);
    let i = A2();
    R2(4, () => {
      W2(), (i == null ? void 0 : i.getAttribute("id")) === e && z2(), h.emit();
    });
  }), group: (e) => (c.current.has(e) || c.current.set(e, /* @__PURE__ */ new Set()), () => {
    d2.current.delete(e), c.current.delete(e);
  }), filter: () => p2.current.shouldFilter, label: v2 || r["aria-label"], getDisablePointerSelection: () => p2.current.disablePointerSelection, listId: te, inputId: F, labelId: B2, listInnerRef: x }), []);
  function ne(e, s2) {
    var a2, m2;
    let i = (m2 = (a2 = p2.current) == null ? void 0 : a2.filter) != null ? m2 : he;
    return e ? i(e, t2.current.search, s2) : 0;
  }
  function U2() {
    if (!t2.current.search || p2.current.shouldFilter === false) return;
    let e = t2.current.filtered.items, s2 = [];
    t2.current.filtered.groups.forEach((a2) => {
      let m2 = c.current.get(a2), g2 = 0;
      m2.forEach((S2) => {
        let P2 = e.get(S2);
        g2 = Math.max(P2, g2);
      }), s2.push([a2, g2]);
    });
    let i = x.current;
    _2().sort((a2, m2) => {
      var P2, V2;
      let g2 = a2.getAttribute("id"), S2 = m2.getAttribute("id");
      return ((P2 = e.get(S2)) != null ? P2 : 0) - ((V2 = e.get(g2)) != null ? V2 : 0);
    }).forEach((a2) => {
      let m2 = a2.closest(Q$1);
      m2 ? m2.appendChild(a2.parentElement === m2 ? a2 : a2.closest(`${Q$1} > *`)) : i.appendChild(a2.parentElement === i ? a2 : a2.closest(`${Q$1} > *`));
    }), s2.sort((a2, m2) => m2[1] - a2[1]).forEach((a2) => {
      var g2;
      let m2 = (g2 = x.current) == null ? void 0 : g2.querySelector(`${N$1}[${I$1}="${encodeURIComponent(a2[0])}"]`);
      m2 == null || m2.parentElement.appendChild(m2);
    });
  }
  function z2() {
    let e = _2().find((i) => i.getAttribute("aria-disabled") !== "true"), s2 = e == null ? void 0 : e.getAttribute(I$1);
    h.setState("value", s2 || void 0);
  }
  function W2() {
    var s2, i, a2, m2;
    if (!t2.current.search || p2.current.shouldFilter === false) {
      t2.current.filtered.count = u2.current.size;
      return;
    }
    t2.current.filtered.groups = /* @__PURE__ */ new Set();
    let e = 0;
    for (let g2 of u2.current) {
      let S2 = (i = (s2 = d2.current.get(g2)) == null ? void 0 : s2.value) != null ? i : "", P2 = (m2 = (a2 = d2.current.get(g2)) == null ? void 0 : a2.keywords) != null ? m2 : [], V2 = ne(S2, P2);
      t2.current.filtered.items.set(g2, V2), V2 > 0 && e++;
    }
    for (let [g2, S2] of c.current) for (let P2 of S2) if (t2.current.filtered.items.get(P2) > 0) {
      t2.current.filtered.groups.add(g2);
      break;
    }
    t2.current.filtered.count = e;
  }
  function re() {
    var s2, i, a2;
    let e = A2();
    e && (((s2 = e.parentElement) == null ? void 0 : s2.firstChild) === e && ((a2 = (i = e.closest(N$1)) == null ? void 0 : i.querySelector(be)) == null || a2.scrollIntoView({ block: "nearest" })), e.scrollIntoView({ block: "nearest" }));
  }
  function A2() {
    var e;
    return (e = x.current) == null ? void 0 : e.querySelector(`${Z$1}[aria-selected="true"]`);
  }
  function _2() {
    var e;
    return Array.from(((e = x.current) == null ? void 0 : e.querySelectorAll(le$1)) || []);
  }
  function J2(e) {
    let i = _2()[e];
    i && h.setState("value", i.getAttribute(I$1));
  }
  function X2(e) {
    var g2;
    let s2 = A2(), i = _2(), a2 = i.findIndex((S2) => S2 === s2), m2 = i[a2 + e];
    (g2 = p2.current) != null && g2.loop && (m2 = a2 + e < 0 ? i[i.length - 1] : a2 + e === i.length ? i[0] : i[a2 + e]), m2 && h.setState("value", m2.getAttribute(I$1));
  }
  function oe(e) {
    let s2 = A2(), i = s2 == null ? void 0 : s2.closest(N$1), a2;
    for (; i && !a2; ) i = e > 0 ? Ie$1(i, N$1) : Me(i, N$1), a2 = i == null ? void 0 : i.querySelector(le$1);
    a2 ? h.setState("value", a2.getAttribute(I$1)) : X2(e);
  }
  let ie2 = () => J2(_2().length - 1), ae = (e) => {
    e.preventDefault(), e.metaKey ? ie2() : e.altKey ? oe(1) : X2(1);
  }, se = (e) => {
    e.preventDefault(), e.metaKey ? J2(0) : e.altKey ? oe(-1) : X2(-1);
  };
  return reactExports.createElement(Primitive.div, { ref: o, tabIndex: -1, ...O2, "cmdk-root": "", onKeyDown: (e) => {
    var s2;
    if ((s2 = O2.onKeyDown) == null || s2.call(O2, e), !e.defaultPrevented) switch (e.key) {
      case "n":
      case "j": {
        $2 && e.ctrlKey && ae(e);
        break;
      }
      case "ArrowDown": {
        ae(e);
        break;
      }
      case "p":
      case "k": {
        $2 && e.ctrlKey && se(e);
        break;
      }
      case "ArrowUp": {
        se(e);
        break;
      }
      case "Home": {
        e.preventDefault(), J2(0);
        break;
      }
      case "End": {
        e.preventDefault(), ie2();
        break;
      }
      case "Enter":
        if (!e.nativeEvent.isComposing && e.keyCode !== 229) {
          e.preventDefault();
          let i = A2();
          if (i) {
            let a2 = new Event(Y$1);
            i.dispatchEvent(a2);
          }
        }
    }
  } }, reactExports.createElement("label", { "cmdk-label": "", htmlFor: q2.inputId, id: q2.labelId, style: Le$1 }, v2), j$1(r, (e) => reactExports.createElement(de.Provider, { value: h }, reactExports.createElement(ue.Provider, { value: q2 }, e))));
}), ye$1 = reactExports.forwardRef((r, o) => {
  var F, x;
  let t2 = useId(), u2 = reactExports.useRef(null), c = reactExports.useContext(fe$1), d2 = K(), f = pe$1(r), p2 = (x = (F = f.current) == null ? void 0 : F.forceMount) != null ? x : c == null ? void 0 : c.forceMount;
  M$1(() => {
    if (!p2) return d2.item(t2, c == null ? void 0 : c.id);
  }, [p2]);
  let v2 = ve$1(t2, u2, [r.value, r.children, u2], r.keywords), b2 = ee(), l = T$1((R2) => R2.value && R2.value === v2.current), y2 = T$1((R2) => p2 || d2.filter() === false ? true : R2.search ? R2.filtered.items.get(t2) > 0 : true);
  reactExports.useEffect(() => {
    let R2 = u2.current;
    if (!(!R2 || r.disabled)) return R2.addEventListener(Y$1, E2), () => R2.removeEventListener(Y$1, E2);
  }, [y2, r.onSelect, r.disabled]);
  function E2() {
    var R2, h;
    C(), (h = (R2 = f.current).onSelect) == null || h.call(R2, v2.current);
  }
  function C() {
    b2.setState("value", v2.current, true);
  }
  if (!y2) return null;
  let { disabled: H2, value: ge, onSelect: $2, forceMount: O2, keywords: te, ...B2 } = r;
  return reactExports.createElement(Primitive.div, { ref: G$1([u2, o]), ...B2, id: t2, "cmdk-item": "", role: "option", "aria-disabled": !!H2, "aria-selected": !!l, "data-disabled": !!H2, "data-selected": !!l, onPointerMove: H2 || d2.getDisablePointerSelection() ? void 0 : C, onClick: H2 ? void 0 : E2 }, r.children);
}), Se = reactExports.forwardRef((r, o) => {
  let { heading: t2, children: u2, forceMount: c, ...d2 } = r, f = useId(), p2 = reactExports.useRef(null), v2 = reactExports.useRef(null), b2 = useId(), l = K(), y2 = T$1((C) => c || l.filter() === false ? true : C.search ? C.filtered.groups.has(f) : true);
  M$1(() => l.group(f), []), ve$1(f, p2, [r.value, r.heading, v2]);
  let E2 = reactExports.useMemo(() => ({ id: f, forceMount: c }), [c]);
  return reactExports.createElement(Primitive.div, { ref: G$1([p2, o]), ...d2, "cmdk-group": "", role: "presentation", hidden: y2 ? void 0 : true }, t2 && reactExports.createElement("div", { ref: v2, "cmdk-group-heading": "", "aria-hidden": true, id: b2 }, t2), j$1(r, (C) => reactExports.createElement("div", { "cmdk-group-items": "", role: "group", "aria-labelledby": t2 ? b2 : void 0 }, reactExports.createElement(fe$1.Provider, { value: E2 }, C))));
}), Ee = reactExports.forwardRef((r, o) => {
  let { alwaysRender: t2, ...u2 } = r, c = reactExports.useRef(null), d2 = T$1((f) => !f.search);
  return !t2 && !d2 ? null : reactExports.createElement(Primitive.div, { ref: G$1([c, o]), ...u2, "cmdk-separator": "", role: "separator" });
}), Ce$1 = reactExports.forwardRef((r, o) => {
  let { onValueChange: t2, ...u2 } = r, c = r.value != null, d2 = ee(), f = T$1((l) => l.search), p2 = T$1((l) => l.value), v2 = K(), b2 = reactExports.useMemo(() => {
    var y2;
    let l = (y2 = v2.listInnerRef.current) == null ? void 0 : y2.querySelector(`${Z$1}[${I$1}="${encodeURIComponent(p2)}"]`);
    return l == null ? void 0 : l.getAttribute("id");
  }, []);
  return reactExports.useEffect(() => {
    r.value != null && d2.setState("search", r.value);
  }, [r.value]), reactExports.createElement(Primitive.input, { ref: o, ...u2, "cmdk-input": "", autoComplete: "off", autoCorrect: "off", spellCheck: false, "aria-autocomplete": "list", role: "combobox", "aria-expanded": true, "aria-controls": v2.listId, "aria-labelledby": v2.labelId, "aria-activedescendant": b2, id: v2.inputId, type: "text", value: c ? r.value : f, onChange: (l) => {
    c || d2.setState("search", l.target.value), t2 == null || t2(l.target.value);
  } });
}), xe = reactExports.forwardRef((r, o) => {
  let { children: t2, label: u2 = "Suggestions", ...c } = r, d2 = reactExports.useRef(null), f = reactExports.useRef(null), p2 = K();
  return reactExports.useEffect(() => {
    if (f.current && d2.current) {
      let v2 = f.current, b2 = d2.current, l, y2 = new ResizeObserver(() => {
        l = requestAnimationFrame(() => {
          let E2 = v2.offsetHeight;
          b2.style.setProperty("--cmdk-list-height", E2.toFixed(1) + "px");
        });
      });
      return y2.observe(v2), () => {
        cancelAnimationFrame(l), y2.unobserve(v2);
      };
    }
  }, []), reactExports.createElement(Primitive.div, { ref: G$1([d2, o]), ...c, "cmdk-list": "", role: "listbox", "aria-label": u2, id: p2.listId }, j$1(r, (v2) => reactExports.createElement("div", { ref: G$1([f, p2.listInnerRef]), "cmdk-list-sizer": "" }, v2)));
}), Pe = reactExports.forwardRef((r, o) => {
  let { open: t2, onOpenChange: u2, overlayClassName: c, contentClassName: d2, container: f, ...p2 } = r;
  return reactExports.createElement(Root, { open: t2, onOpenChange: u2 }, reactExports.createElement(Portal, { container: f }, reactExports.createElement(Overlay, { "cmdk-overlay": "", className: c }), reactExports.createElement(Content, { "aria-label": r.label, "cmdk-dialog": "", className: d2 }, reactExports.createElement(me, { ref: o, ...p2 }))));
}), we = reactExports.forwardRef((r, o) => T$1((u2) => u2.filtered.count === 0) ? reactExports.createElement(Primitive.div, { ref: o, ...r, "cmdk-empty": "", role: "presentation" }) : null), De$1 = reactExports.forwardRef((r, o) => {
  let { progress: t2, children: u2, label: c = "Loading...", ...d2 } = r;
  return reactExports.createElement(Primitive.div, { ref: o, ...d2, "cmdk-loading": "", role: "progressbar", "aria-valuenow": t2, "aria-valuemin": 0, "aria-valuemax": 100, "aria-label": c }, j$1(r, (f) => reactExports.createElement("div", { "aria-hidden": true }, f)));
}), Ve = Object.assign(me, { List: xe, Item: ye$1, Input: Ce$1, Group: Se, Separator: Ee, Dialog: Pe, Empty: we, Loading: De$1 });
function Ie$1(r, o) {
  let t2 = r.nextElementSibling;
  for (; t2; ) {
    if (t2.matches(o)) return t2;
    t2 = t2.nextElementSibling;
  }
}
function Me(r, o) {
  let t2 = r.previousElementSibling;
  for (; t2; ) {
    if (t2.matches(o)) return t2;
    t2 = t2.previousElementSibling;
  }
}
function pe$1(r) {
  let o = reactExports.useRef(r);
  return M$1(() => {
    o.current = r;
  }), o;
}
var M$1 = typeof window == "undefined" ? reactExports.useEffect : reactExports.useLayoutEffect;
function k$1(r) {
  let o = reactExports.useRef();
  return o.current === void 0 && (o.current = r()), o;
}
function G$1(r) {
  return (o) => {
    r.forEach((t2) => {
      typeof t2 == "function" ? t2(o) : t2 != null && (t2.current = o);
    });
  };
}
function T$1(r) {
  let o = ee(), t2 = () => r(o.snapshot());
  return shimExports.useSyncExternalStore(o.subscribe, t2, t2);
}
function ve$1(r, o, t2, u2 = []) {
  let c = reactExports.useRef(), d2 = K();
  return M$1(() => {
    var v2;
    let f = (() => {
      var b2;
      for (let l of t2) {
        if (typeof l == "string") return l.trim();
        if (typeof l == "object" && "current" in l) return l.current ? (b2 = l.current.textContent) == null ? void 0 : b2.trim() : c.current;
      }
    })(), p2 = u2.map((b2) => b2.trim());
    d2.value(r, f, p2), (v2 = o.current) == null || v2.setAttribute(I$1, f), c.current = f;
  }), c;
}
var Te = () => {
  let [r, o] = reactExports.useState(), t2 = k$1(() => /* @__PURE__ */ new Map());
  return M$1(() => {
    t2.current.forEach((u2) => u2()), t2.current = /* @__PURE__ */ new Map();
  }, [r]), (u2, c) => {
    t2.current.set(u2, c), o({});
  };
};
function ke(r) {
  let o = r.type;
  return typeof o == "function" ? o(r.props) : "render" in o ? o.render(r.props) : r;
}
function j$1({ asChild: r, children: o }, t2) {
  return r && reactExports.isValidElement(o) ? reactExports.cloneElement(ke(o), { ref: o.ref }, t2(o.props.children)) : t2(o);
}
var Le$1 = { position: "absolute", width: "1px", height: "1px", padding: "0", margin: "-1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", borderWidth: "0" };
const Command = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Ve,
  {
    ref,
    className: cn$1(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className
    ),
    ...props
  }
));
Command.displayName = Ve.displayName;
const CommandInput = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center border-b px-3", "cmdk-input-wrapper": "", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "mr-2 h-4 w-4 shrink-0 opacity-50" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(
    Ve.Input,
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
CommandInput.displayName = Ve.Input.displayName;
const CommandList = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Ve.List,
  {
    ref,
    className: cn$1("max-h-[300px] overflow-y-auto overflow-x-hidden", className),
    ...props
  }
));
CommandList.displayName = Ve.List.displayName;
const CommandEmpty = reactExports.forwardRef((props, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Ve.Empty,
  {
    ref,
    className: "py-6 text-center text-sm",
    ...props
  }
));
CommandEmpty.displayName = Ve.Empty.displayName;
const CommandGroup = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Ve.Group,
  {
    ref,
    className: cn$1(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className
    ),
    ...props
  }
));
CommandGroup.displayName = Ve.Group.displayName;
const CommandSeparator = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Ve.Separator,
  {
    ref,
    className: cn$1("-mx-1 h-px bg-border", className),
    ...props
  }
));
CommandSeparator.displayName = Ve.Separator.displayName;
const CommandItem = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Ve.Item,
  {
    ref,
    className: cn$1(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50",
      className
    ),
    ...props
  }
));
CommandItem.displayName = Ve.Item.displayName;
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
        var i = u2.elements(n), y2 = i.update, p2 = i.getElement, d2 = i.fetchUpdates, c = i.create, x = { options: t2, update: y2, getElement: p2, fetchUpdates: d2, create: c }, N2 = t2.clientSecret, F = u2.confirmPayment, g2 = u2.confirmCardPayment, J2 = u2.retrievePaymentIntent, K2 = u2.paymentRequest, V2 = {
          clientSecret: N2,
          confirmPayment: F,
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
