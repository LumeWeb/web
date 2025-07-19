import { core_abuse__mf_v__runtimeInit__mf_v__, index_cjs } from './core_abuse__mf_v__runtimeInit__mf_v__-BhTJRpXJ.js';

// dev uses dynamic import to separate chunks
    
    const {loadShare} = index_cjs;
    const {initPromise} = core_abuse__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(_ => loadShare("react-router", {
    customShareInfo: {shareConfig:{
      singleton: true,
      strictVersion: false,
      requiredVersion: "^7.5.0"
    }}}));
    const exportModule = await res.then(factory => factory());
    var core_abuse__loadShare__react_mf_2_router__loadShare__ = exportModule;

export { core_abuse__loadShare__react_mf_2_router__loadShare__ };
