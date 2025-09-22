import { core_dashboard__mf_v__runtimeInit__mf_v__, index_cjs } from './core_dashboard__mf_v__runtimeInit__mf_v__-DeI6jfgm.js';

// dev uses dynamic import to separate chunks
    
    const {loadShare} = index_cjs;
    const {initPromise} = core_dashboard__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(_ => loadShare("react-router", {
    customShareInfo: {shareConfig:{
      singleton: true,
      strictVersion: false,
      requiredVersion: "^7.5.2"
    }}}));
    const exportModule = await res.then(factory => factory());
    var core_dashboard__loadShare__react_mf_2_router__loadShare__ = exportModule;

export { core_dashboard__loadShare__react_mf_2_router__loadShare__ };
