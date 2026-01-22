import { getDefaultExportFromCjs } from './_commonjsHelpers-BILit0S-.js';
import { admin__mf_v__runtimeInit__mf_v__ } from './admin__mf_v__runtimeInit__mf_v__-B2PJI9hS.js';

// dev uses dynamic import to separate chunks
    
    const {initPromise} = admin__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(runtime => runtime.loadShare("react-dom", {
      customShareInfo: {shareConfig:{
        singleton: true,
        strictVersion: false,
        requiredVersion: "^19.2.3"
      }}
    }));
    const exportModule = await res.then(factory => factory());
    var admin__loadShare__react_mf_2_dom__loadShare__ = exportModule;

const ReactDOM = /*@__PURE__*/getDefaultExportFromCjs(admin__loadShare__react_mf_2_dom__loadShare__);

export { ReactDOM, admin__loadShare__react_mf_2_dom__loadShare__ };
