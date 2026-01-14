import { getDefaultExportFromCjs } from './_commonjsHelpers-BILit0S-.js';
import { dashboard__mf_v__runtimeInit__mf_v__ } from './dashboard__mf_v__runtimeInit__mf_v__-BgQBwuY5.js';

// dev uses dynamic import to separate chunks
    
    const {initPromise} = dashboard__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(runtime => runtime.loadShare("react-dom", {
      customShareInfo: {shareConfig:{
        singleton: true,
        strictVersion: false,
        requiredVersion: "^19.2.3"
      }}
    }));
    const exportModule = await res.then(factory => factory());
    var dashboard__loadShare__react_mf_2_dom__loadShare__ = exportModule;

const ReactDOM = /*@__PURE__*/getDefaultExportFromCjs(dashboard__loadShare__react_mf_2_dom__loadShare__);

export { ReactDOM, dashboard__loadShare__react_mf_2_dom__loadShare__ };
