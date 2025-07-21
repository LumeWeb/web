import { j as jsxRuntimeExports } from "./abuse__loadShare__react_mf_2_dom__loadShare__-CpomVz3Y.js";
import { R as React } from "./abuse__loadShare__react__loadShare__-C6wwnR7P.js";
import { c as createEnv, a as createRoot } from "./index-DcPQr_uN.js";
import { a as abuse__mf_v__runtimeInit__mf_v__, i as index_cjs } from "./abuse__mf_v__runtimeInit__mf_v__-D-IlhcC-.js";
import { z } from "./index-Dq110QZ7.js";
import "./_commonjsHelpers-DWwsNxpa.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const { loadShare } = index_cjs;
const { initPromise } = abuse__mf_v__runtimeInit__mf_v__;
const res = initPromise.then((_) => loadShare("@lumeweb/portal-framework-ui", {
  customShareInfo: { shareConfig: {
    singleton: true,
    strictVersion: false,
    requiredVersion: "^0.0.0"
  } }
}));
const exportModule = await res.then((factory) => factory());
var abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__ = exportModule;
const __vite_import_meta_env__ = { "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SSR": false, "VITE_PORTAL_APP_NAME": "abuse", "VITE_PORTAL_APP_TITLE": "Abuse Report", "VITE_PORTAL_DOMAIN": "abuse-demo.lumeweb.com", "VITE_PORTAL_DOMAIN_IS_ROOT": "true" };
const env = createEnv({
  client: {
    VITE_PORTAL_APP_DISABLE_NAV: z.string().optional(),
    VITE_PORTAL_APP_DISABLE_ROUTING: z.string().optional(),
    VITE_PORTAL_APP_NAME: z.string(),
    VITE_PORTAL_APP_TITLE: z.string(),
    VITE_PORTAL_DOMAIN_IS_ROOT: z.string().optional()
  },
  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: "VITE_",
  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  // @ts-ignore
  runtimeEnv: __vite_import_meta_env__
});
function App() {
  const opts = {
    name: env.VITE_PORTAL_APP_NAME
  };
  if (env.VITE_PORTAL_APP_DISABLE_NAV) {
    opts.loadNavigation = false;
  }
  if (env.VITE_PORTAL_APP_DISABLE_ROUTING) {
    opts.loadNavigation = false;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.AppComponent, { ...opts });
}
const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) })
);
