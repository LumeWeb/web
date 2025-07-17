import { core_abuse_mf_2_report__mf_v__runtimeInit__mf_v__, index_cjs } from './core_abuse_mf_2_report__mf_v__runtimeInit__mf_v__-BXpB7fOH.js';

// dev uses dynamic import to separate chunks
    
    const {loadShare} = index_cjs;
    const {initPromise} = core_abuse_mf_2_report__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(_ => loadShare("@refinedev/core", {
    customShareInfo: {shareConfig:{
      singleton: true,
      strictVersion: false,
      requiredVersion: "^4.57.9"
    }}}));
    const exportModule = await res.then(factory => factory());
    var core_abuse_mf_2_report__loadShare___mf_0_refinedev_mf_1_core__loadShare__ = exportModule;

export { core_abuse_mf_2_report__loadShare___mf_0_refinedev_mf_1_core__loadShare__ };
