import { d as dashboard__mf_v__runtimeInit__mf_v__, i as index_cjs } from "./dashboard__mf_v__runtimeInit__mf_v__-C0jw-Lkn.js";
const { loadShare } = index_cjs;
const { initPromise } = dashboard__mf_v__runtimeInit__mf_v__;
const res = initPromise.then((_) => loadShare("react-hook-form", {
  customShareInfo: { shareConfig: {
    singleton: true,
    strictVersion: false,
    requiredVersion: "^7.54.0"
  } }
}));
const exportModule = await res.then((factory) => factory());
var dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__ = exportModule;
export {
  dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__ as d
};
