import { getDefaultExportFromCjs } from './_commonjsHelpers-BILit0S-.js';
import { core_dashboard__mf_v__runtimeInit__mf_v__, index_cjs } from './core_dashboard__mf_v__runtimeInit__mf_v__-DlJLrLht.js';

// dev uses dynamic import to separate chunks
    
    const {loadShare} = index_cjs;
    const {initPromise} = core_dashboard__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(_ => loadShare("react-dom", {
    customShareInfo: {shareConfig:{
      singleton: true,
      strictVersion: false,
      requiredVersion: "^18.3.1"
    }}}));
    const exportModule = await res.then(factory => factory());
    var core_dashboard__loadShare__react_mf_2_dom__loadShare__ = exportModule;

const ReactDOM = /*@__PURE__*/getDefaultExportFromCjs(core_dashboard__loadShare__react_mf_2_dom__loadShare__);

export { ReactDOM, core_dashboard__loadShare__react_mf_2_dom__loadShare__ };
