import { core_core__mf_v__runtimeInit__mf_v__ } from './core_core__mf_v__runtimeInit__mf_v__-CaHQvixA.js';

// dev uses dynamic import to separate chunks
    
    const {initPromise} = core_core__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(runtime => runtime.loadShare("react", {
      customShareInfo: {shareConfig:{
        singleton: true,
        strictVersion: false,
        requiredVersion: "^19.2.3"
      }}
    }));
    const exportModule = await res.then(factory => factory());
    var core_core__loadShare__react__loadShare__ = exportModule;

export { core_core__loadShare__react__loadShare__ };
