import { core_dashboard__mf_v__runtimeInit__mf_v__ } from './core_dashboard__mf_v__runtimeInit__mf_v__-BS5DE-ec.js';

// dev uses dynamic import to separate chunks
    
    const {initPromise} = core_dashboard__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(runtime => runtime.loadShare("react-router", {
      customShareInfo: {shareConfig:{
        singleton: true,
        strictVersion: false,
        requiredVersion: "^7.12.0"
      }}
    }));
    const exportModule = await res.then(factory => factory());
    var core_dashboard__loadShare__react_mf_2_router__loadShare__ = exportModule;

export { core_dashboard__loadShare__react_mf_2_router__loadShare__ };
