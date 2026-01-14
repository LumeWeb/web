import { core_dashboard__mf_v__runtimeInit__mf_v__ } from './core_dashboard__mf_v__runtimeInit__mf_v__-BS5DE-ec.js';

// dev uses dynamic import to separate chunks
    
    const {initPromise} = core_dashboard__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(runtime => runtime.loadShare("@lumeweb/portal-framework-ui-core", {
      customShareInfo: {shareConfig:{
        singleton: true,
        strictVersion: false,
        requiredVersion: "^0.1.0"
      }}
    }));
    const exportModule = await res.then(factory => factory());
    var core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ = exportModule;

export { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ };
