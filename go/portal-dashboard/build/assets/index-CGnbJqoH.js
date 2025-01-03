import { r as reactExports, R as React } from "./jsx-runtime-CzXAEjbZ.js";
import { h as castPath, t as toKey, j as isLength, k as isIndex, n as isArray, r as isArguments, u as ge, v as $, w as vt, A as ah, C as Rr, E as get, F as Ae, Y, T as Te, L as Le, H as Pt, I as rR } from "./index-xFQL_PNe.js";
import { g as useForm } from "./form-B0KDmX57.js";
function hasPath(object, path, hasFunc) {
  path = castPath(path, object);
  var index = -1, length = path.length, result = false;
  while (++index < length) {
    var key = toKey(path[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result || ++index != length) {
    return result;
  }
  length = object == null ? 0 : object.length;
  return !!length && isLength(length) && isIndex(key, length) && (isArray(object) || isArguments(object));
}
var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
function baseHas(object, key) {
  return object != null && hasOwnProperty.call(object, key);
}
function has(object, path) {
  return object != null && hasPath(object, path, baseHas);
}
var L = Object.defineProperty;
var F = (t, a) => L(t, "name", { value: a, configurable: true });
var C = F(({ refineCoreProps: t, warnWhenUnsavedChanges: a, disableServerSideValidation: c = false, ...g } = {}) => {
  let { options: R } = ge(), S = (R == null ? void 0 : R.disableServerSideValidation) || c, h = $(), { warnWhenUnsavedChanges: U, setWarnWhen: b } = vt(), f = a ?? U, o = useForm({ ...g }), { watch: m, setValue: y, getValues: i, handleSubmit: n, setError: E } = o, x = ah({ ...t, onMutationError: (r, s, e) => {
    var v, H;
    if (S) {
      (v = t == null ? void 0 : t.onMutationError) == null || v.call(t, r, s, e);
      return;
    }
    let u = r == null ? void 0 : r.errors;
    for (let V in u) {
      if (!Object.keys(Rr(s)).includes(V)) continue;
      let p = u[V], D = "";
      Array.isArray(p) && (D = p.join(" ")), typeof p == "string" && (D = p), typeof p == "boolean" && p && (D = "Field is not valid."), typeof p == "object" && "key" in p && (D = h(p.key, p.message)), E(V, { message: D });
    }
    (H = t == null ? void 0 : t.onMutationError) == null || H.call(t, r, s, e);
  } }), { query: l, onFinish: d, formLoading: B, onFinishAutoSave: M } = x;
  reactExports.useEffect(() => {
    var e;
    let r = (e = l == null ? void 0 : l.data) == null ? void 0 : e.data;
    if (!r) return;
    Object.keys(Rr(i())).forEach((u) => {
      let v = has(r, u), H = get(r, u);
      v && y(u, H);
    });
  }, [l == null ? void 0 : l.data, y, i]), reactExports.useEffect(() => {
    let r = m((s, { type: e }) => {
      e === "change" && W(s);
    });
    return () => r.unsubscribe();
  }, [m]);
  let W = F((r) => {
    var s;
    if (f && b(true), t != null && t.autoSave) {
      b(false);
      let e = ((s = t.autoSave) == null ? void 0 : s.onFinish) ?? ((u) => u);
      return M(e(r)).catch((u) => u);
    }
    return r;
  }, "onValuesChange"), Q = F((r, s) => async (e) => (b(false), n(r, s)(e)), "handleSubmit");
  return { ...o, handleSubmit: Q, refineCore: x, saveButtonProps: { disabled: B, onClick: (r) => {
    Q((s) => d(s).catch(() => {
    }), () => false)(r);
  } } };
}, "useForm");
var le = F(({ stepsProps: t, ...a } = {}) => {
  let { defaultStep: c = 0, isBackValidate: g = false } = t ?? {}, [R, S] = reactExports.useState(c), h = C({ ...a }), { trigger: U, getValues: b, setValue: f, formState: { dirtyFields: o }, refineCore: { query: m } } = h;
  reactExports.useEffect(() => {
    var x;
    let n = (x = m == null ? void 0 : m.data) == null ? void 0 : x.data;
    if (!n) return;
    let E = Object.keys(b());
    console.log({ dirtyFields: o, registeredFields: E, data: n }), Object.entries(n).forEach(([l, d]) => {
      let B = l;
      E.includes(B) && (get(o, B) || f(B, d));
    });
  }, [m == null ? void 0 : m.data, R, f, b]);
  let y = F((n) => {
    let E = n;
    n < 0 && (E = 0), S(E);
  }, "go");
  return { ...h, steps: { currentStep: R, gotoStep: F(async (n) => {
    if (n === R) return;
    if (n < R && !g) {
      y(n);
      return;
    }
    await U() && y(n);
  }, "gotoStep") } };
}, "useStepsForm");
var xe = F(({ modalProps: t, refineCoreProps: a, syncWithLocation: c, ...g } = {}) => {
  var A, N;
  let R = Ae(), [S, h] = React.useState(false), U = $(), { resource: b, action: f } = a ?? {}, { resource: o, action: m, identifier: y } = Y(b), i = Te(), n = Le(), E = Pt(), x = f ?? m ?? "", l = !(typeof c == "object" && (c == null ? void 0 : c.syncId) === false), d = typeof c == "object" && "key" in c ? c.key : o && x && c ? `modal-${y}-${x}` : void 0, { defaultVisible: B = false, autoSubmitClose: M = true, autoResetForm: W = true } = t ?? {}, Q = C({ refineCoreProps: { ...a, meta: { ...d ? { [d]: void 0 } : {}, ...a == null ? void 0 : a.meta } }, ...g }), { reset: $$1, refineCore: { onFinish: r, id: s, setId: e, autoSaveProps: u }, saveButtonProps: v, handleSubmit: H } = Q, { visible: V, show: k, close: p } = rR({ defaultVisible: B });
  React.useEffect(() => {
    var T, j, K, I;
    if (S === false && d) {
      let w = (j = (T = i == null ? void 0 : i.params) == null ? void 0 : T[d]) == null ? void 0 : j.open;
      if (typeof w == "boolean" ? w && k() : typeof w == "string" && w === "true" && k(), l) {
        let G = (I = (K = i == null ? void 0 : i.params) == null ? void 0 : K[d]) == null ? void 0 : I.id;
        G && (e == null || e(G));
      }
      h(true);
    }
  }, [d, i, l, e]), React.useEffect(() => {
    var T;
    S === true && (V && d ? n({ query: { [d]: { ...(T = i == null ? void 0 : i.params) == null ? void 0 : T[d], open: true, ...l && s && { id: s } } }, options: { keepQuery: true }, type: "replace" }) : d && !V && n({ query: { [d]: void 0 }, options: { keepQuery: true }, type: "replace" }));
  }, [s, V, k, d, l]);
  let D = F(async (T) => {
    await r(T), M && p(), W && $$1();
  }, "submit"), { warnWhen: O, setWarnWhen: X } = vt(), Z = reactExports.useCallback(() => {
    var T;
    if (u.status === "success" && ((T = a == null ? void 0 : a.autoSave) != null && T.invalidateOnClose) && R({ id: s, invalidates: a.invalidates || ["list", "many", "detail"], dataProviderName: a.dataProviderName, resource: y }), O) if (window.confirm(U("warnWhenUnsavedChanges", "Are you sure you want to leave? You have unsaved changes."))) X(false);
    else return;
    e == null || e(void 0), p();
  }, [O, u.status]), _ = reactExports.useCallback((T) => {
    typeof T < "u" && (e == null || e(T)), (!(x === "edit" || x === "clone") || (typeof T < "u" || typeof s < "u")) && k();
  }, [s]), q = U(`${y}.titles.${f}`, void 0, `${E(`${f} ${((A = o == null ? void 0 : o.meta) == null ? void 0 : A.label) ?? ((N = o == null ? void 0 : o.options) == null ? void 0 : N.label) ?? (o == null ? void 0 : o.label) ?? y}`, "singular")}`);
  return { modal: { submit: D, close: Z, show: _, visible: V, title: q }, ...Q, saveButtonProps: { ...v, onClick: (T) => H(D)(T) } };
}, "useModalForm");
export {
  C,
  le as l,
  xe as x
};
