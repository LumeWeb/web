import { a as admin__mf_v__runtimeInit__mf_v__, i as index_cjs } from "./admin__mf_v__runtimeInit__mf_v__-CrLwvomy.js";
const { loadShare } = index_cjs;
const { initPromise } = admin__mf_v__runtimeInit__mf_v__;
const res = initPromise.then((_) => loadShare("@tanstack/react-query", {
  customShareInfo: { shareConfig: {
    singleton: true,
    strictVersion: false,
    requiredVersion: "^4.36.1"
  } }
}));
const exportModule = await res.then((factory) => factory());
var admin__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__ = exportModule;
export {
  admin__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__ as a
};
