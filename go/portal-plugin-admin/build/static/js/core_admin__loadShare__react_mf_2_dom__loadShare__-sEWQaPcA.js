import { getDefaultExportFromCjs } from './_commonjsHelpers-BILit0S-.js';
import { core_admin__mf_v__runtimeInit__mf_v__, index_cjs } from './core_admin__mf_v__runtimeInit__mf_v__-DfW_aMyq.js';

// dev uses dynamic import to separate chunks
    
    const {loadShare} = index_cjs;
    const {initPromise} = core_admin__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(_ => loadShare("react-dom", {
    customShareInfo: {shareConfig:{
      singleton: true,
      strictVersion: false,
      requiredVersion: "^18.3.1"
    }}}));
    const exportModule = await res.then(factory => factory());
    var core_admin__loadShare__react_mf_2_dom__loadShare__ = exportModule;

const ReactDOM = /*@__PURE__*/getDefaultExportFromCjs(core_admin__loadShare__react_mf_2_dom__loadShare__);

export { ReactDOM, core_admin__loadShare__react_mf_2_dom__loadShare__ };
