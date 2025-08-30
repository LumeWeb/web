import { dashboard__mf_v__runtimeInit__mf_v__, index_cjs } from './dashboard__mf_v__runtimeInit__mf_v__-CrvQyIUV.js';

// dev uses dynamic import to separate chunks
    
    const {loadShare: loadShare$1} = index_cjs;
    const {initPromise: initPromise$1} = dashboard__mf_v__runtimeInit__mf_v__;
    const res$1 = initPromise$1.then(_ => loadShare$1("@lumeweb/portal-framework-ui-core", {
    customShareInfo: {shareConfig:{
      singleton: true,
      strictVersion: false,
      requiredVersion: "^0.0.0"
    }}}));
    const exportModule$1 = await res$1.then(factory => factory());
    var dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ = exportModule$1;

// dev uses dynamic import to separate chunks
    
    const {loadShare} = index_cjs;
    const {initPromise} = dashboard__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(_ => loadShare("react-router", {
    customShareInfo: {shareConfig:{
      singleton: true,
      strictVersion: false,
      requiredVersion: "^7.8.2"
    }}}));
    const exportModule = await res.then(factory => factory());
    var dashboard__loadShare__react_mf_2_router__loadShare__ = exportModule;

export { dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__, dashboard__loadShare__react_mf_2_router__loadShare__ };
