import { core_dashboard__mf_v__runtimeInit__mf_v__ } from './core_dashboard__mf_v__runtimeInit__mf_v__-BS5DE-ec.js';

// dev uses dynamic import to separate chunks
    
    const {initPromise} = core_dashboard__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(runtime => runtime.loadShare("@refinedev/core", {
      customShareInfo: {shareConfig:{
        singleton: true,
        strictVersion: false,
        requiredVersion: "^5.0.8"
      }}
    }));
    const exportModule = await res.then(factory => factory());
    var core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__ = exportModule;

export { core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__ };
