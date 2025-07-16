import { a as admin__mf_v__runtimeInit__mf_v__, i as index_cjs } from "./admin__mf_v__runtimeInit__mf_v__-CrLwvomy.js";
const { loadShare } = index_cjs;
const { initPromise } = admin__mf_v__runtimeInit__mf_v__;
const res = initPromise.then((_) => loadShare("react-hook-form", {
  customShareInfo: { shareConfig: {
    singleton: true,
    strictVersion: false,
    requiredVersion: "^7.54.0"
  } }
}));
const exportModule = await res.then((factory) => factory());
var admin__loadShare__react_mf_2_hook_mf_2_form__loadShare__ = exportModule;
export {
  admin__loadShare__react_mf_2_hook_mf_2_form__loadShare__ as a
};
