import { core_dashboard__mf_v__runtimeInit__mf_v__, index_cjs } from './core_dashboard__mf_v__runtimeInit__mf_v__-DlJLrLht.js';

// dev uses dynamic import to separate chunks
    
    const {loadShare} = index_cjs;
    const {initPromise} = core_dashboard__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(_ => loadShare("@lumeweb/portal-framework-ui", {
    customShareInfo: {shareConfig:{
      singleton: true,
      strictVersion: false,
      requiredVersion: "^0.0.0"
    }}}));
    const exportModule = await res.then(factory => factory());
    var core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__ = exportModule;

export { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__ };
