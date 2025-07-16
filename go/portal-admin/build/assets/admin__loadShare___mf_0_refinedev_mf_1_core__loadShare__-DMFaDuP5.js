import { a as admin__mf_v__runtimeInit__mf_v__, i as index_cjs } from "./admin__mf_v__runtimeInit__mf_v__-CrLwvomy.js";
const { loadShare: loadShare$1 } = index_cjs;
const { initPromise: initPromise$1 } = admin__mf_v__runtimeInit__mf_v__;
const res$1 = initPromise$1.then((_) => loadShare$1("@lumeweb/portal-framework-core", {
  customShareInfo: { shareConfig: {
    singleton: true,
    strictVersion: false,
    requiredVersion: "^0.0.0"
  } }
}));
const exportModule$1 = await res$1.then((factory) => factory());
var admin__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__ = exportModule$1;
const { loadShare } = index_cjs;
const { initPromise } = admin__mf_v__runtimeInit__mf_v__;
const res = initPromise.then((_) => loadShare("@refinedev/core", {
  customShareInfo: { shareConfig: {
    singleton: true,
    strictVersion: false,
    requiredVersion: "^4.57.9"
  } }
}));
const exportModule = await res.then((factory) => factory());
var admin__loadShare___mf_0_refinedev_mf_1_core__loadShare__ = exportModule;
export {
  admin__loadShare___mf_0_refinedev_mf_1_core__loadShare__ as a,
  admin__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__ as b
};
