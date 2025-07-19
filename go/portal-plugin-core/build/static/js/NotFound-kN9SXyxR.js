import { jsxRuntimeExports } from './jsx-runtime-CP8sJthG.js';
import { core_core__mf_v__runtimeInit__mf_v__, index_cjs } from './core_core__mf_v__runtimeInit__mf_v__-DHIRDVBI.js';
import { core_core__loadShare__react_mf_2_router__loadShare__ } from './core_core__loadShare__react_mf_2_router__loadShare__-BHct9UD3.js';

// dev uses dynamic import to separate chunks
    
    const {loadShare} = index_cjs;
    const {initPromise} = core_core__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(_ => loadShare("@lumeweb/portal-framework-ui", {
    customShareInfo: {shareConfig:{
      singleton: true,
      strictVersion: false,
      requiredVersion: "^0.0.0"
    }}}));
    const exportModule = await res.then(factory => factory());
    var core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__ = exportModule;

function NotFound() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold mb-4", children: "404 Not Found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-4", children: "Sorry, the page you requested could not be found." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(core_core__loadShare__react_mf_2_router__loadShare__.Link, { className: "text-blue-500 hover:underline", to: "/", children: "Go to Home Page" })
  ] });
}
const NotFound$1 = core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.withTheme(NotFound);

export { NotFound$1 as default };
