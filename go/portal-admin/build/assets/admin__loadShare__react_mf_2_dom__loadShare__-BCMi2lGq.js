import { g as getDefaultExportFromCjs } from "./_commonjsHelpers-DWwsNxpa.js";
import { a as admin__mf_v__runtimeInit__mf_v__, i as index_cjs } from "./admin__mf_v__runtimeInit__mf_v__-CrLwvomy.js";
const { loadShare } = index_cjs;
const { initPromise } = admin__mf_v__runtimeInit__mf_v__;
const res = initPromise.then((_) => loadShare("react-dom", {
  customShareInfo: { shareConfig: {
    singleton: true,
    strictVersion: false,
    requiredVersion: "^18.3.1"
  } }
}));
const exportModule = await res.then((factory) => factory());
var admin__loadShare__react_mf_2_dom__loadShare__ = exportModule;
const ReactDOM = /* @__PURE__ */ getDefaultExportFromCjs(admin__loadShare__react_mf_2_dom__loadShare__);
export {
  ReactDOM as R,
  admin__loadShare__react_mf_2_dom__loadShare__ as a
};
