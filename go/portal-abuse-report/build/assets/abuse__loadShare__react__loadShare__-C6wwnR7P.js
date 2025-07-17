import { g as getDefaultExportFromCjs } from "./_commonjsHelpers-DWwsNxpa.js";
import { a as abuse__mf_v__runtimeInit__mf_v__, i as index_cjs } from "./abuse__mf_v__runtimeInit__mf_v__-D-IlhcC-.js";
function _mergeNamespaces(n, m) {
  for (var i = 0; i < m.length; i++) {
    const e = m[i];
    if (typeof e !== "string" && !Array.isArray(e)) {
      for (const k in e) {
        if (k !== "default" && !(k in n)) {
          const d = Object.getOwnPropertyDescriptor(e, k);
          if (d) {
            Object.defineProperty(n, k, d.get ? d : {
              enumerable: true,
              get: () => e[k]
            });
          }
        }
      }
    }
  }
  return Object.freeze(Object.defineProperty(n, Symbol.toStringTag, { value: "Module" }));
}
const { loadShare } = index_cjs;
const { initPromise } = abuse__mf_v__runtimeInit__mf_v__;
const res = initPromise.then((_) => loadShare("react", {
  customShareInfo: { shareConfig: {
    singleton: true,
    strictVersion: false,
    requiredVersion: "^18.3.1"
  } }
}));
const exportModule = await res.then((factory) => factory());
var abuse__loadShare__react__loadShare__ = exportModule;
const React = /* @__PURE__ */ getDefaultExportFromCjs(abuse__loadShare__react__loadShare__);
const React$1 = /* @__PURE__ */ _mergeNamespaces({
  __proto__: null,
  default: React
}, [abuse__loadShare__react__loadShare__]);
export {
  React as R,
  abuse__loadShare__react__loadShare__ as a,
  React$1 as b
};
