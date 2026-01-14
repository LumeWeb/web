import { core_core__mf_v__runtimeInit__mf_v__, index_cjs } from './core_core__mf_v__runtimeInit__mf_v__-DD48BdU6.js';

// dev uses dynamic import to separate chunks
    
    const {loadShare} = index_cjs;
    const {initPromise} = core_core__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(_ => loadShare("react", {
    customShareInfo: {shareConfig:{
      singleton: true,
      strictVersion: false,
      requiredVersion: "^18.3.1"
    }}}));
    const exportModule = await res.then(factory => factory());
    var core_core__loadShare__react__loadShare__ = exportModule;

export { core_core__loadShare__react__loadShare__ };
