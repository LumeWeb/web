import { core_abuse__mf_v__runtimeInit__mf_v__, index_cjs } from './core_abuse__mf_v__runtimeInit__mf_v__-BhTJRpXJ.js';

// dev uses dynamic import to separate chunks
    
    const {loadShare} = index_cjs;
    const {initPromise} = core_abuse__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(_ => loadShare("@lumeweb/portal-framework-ui-core", {
    customShareInfo: {shareConfig:{
      singleton: true,
      strictVersion: false,
      requiredVersion: "^0.0.0"
    }}}));
    const exportModule = await res.then(factory => factory());
    var core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ = exportModule;

export { core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ };
