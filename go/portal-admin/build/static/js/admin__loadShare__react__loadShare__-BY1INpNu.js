import { getDefaultExportFromCjs } from './_commonjsHelpers-BILit0S-.js';
import { admin__mf_v__runtimeInit__mf_v__ } from './admin__mf_v__runtimeInit__mf_v__-B2PJI9hS.js';

function _mergeNamespaces(n, m) {
  for (var i = 0; i < m.length; i++) {
    const e = m[i];
    if (typeof e !== 'string' && !Array.isArray(e)) { for (const k in e) {
      if (k !== 'default' && !(k in n)) {
        const d = Object.getOwnPropertyDescriptor(e, k);
        if (d) {
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: () => e[k]
          });
        }
      }
    } }
  }
  return Object.freeze(Object.defineProperty(n, Symbol.toStringTag, { value: 'Module' }));
}

// dev uses dynamic import to separate chunks
    
    const {initPromise} = admin__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(runtime => runtime.loadShare("react", {
      customShareInfo: {shareConfig:{
        singleton: true,
        strictVersion: false,
        requiredVersion: "^19.2.3"
      }}
    }));
    const exportModule = await res.then(factory => factory());
    var admin__loadShare__react__loadShare__ = exportModule;

const React = /*@__PURE__*/getDefaultExportFromCjs(admin__loadShare__react__loadShare__);

const React4 = /*#__PURE__*/_mergeNamespaces({
  __proto__: null,
  default: React
}, [admin__loadShare__react__loadShare__]);

export { React, React4, admin__loadShare__react__loadShare__ };
