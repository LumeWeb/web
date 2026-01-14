import { getDefaultExportFromCjs } from './_commonjsHelpers-BILit0S-.js';
import { dashboard__mf_v__runtimeInit__mf_v__, index_cjs } from './dashboard__mf_v__runtimeInit__mf_v__-CrvQyIUV.js';

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
    
    const {loadShare} = index_cjs;
    const {initPromise} = dashboard__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(_ => loadShare("react", {
    customShareInfo: {shareConfig:{
      singleton: true,
      strictVersion: false,
      requiredVersion: "^18.3.1"
    }}}));
    const exportModule = await res.then(factory => factory());
    var dashboard__loadShare__react__loadShare__ = exportModule;

const React3 = /*@__PURE__*/getDefaultExportFromCjs(dashboard__loadShare__react__loadShare__);

const React5 = /*#__PURE__*/_mergeNamespaces({
  __proto__: null,
  default: React3
}, [dashboard__loadShare__react__loadShare__]);

export { React3, React5, dashboard__loadShare__react__loadShare__ };
