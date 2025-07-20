import { a as abuse__loadShare__react__loadShare__ } from "./abuse__loadShare__react__loadShare__-C6wwnR7P.js";
import { g as getDefaultExportFromCjs } from "./_commonjsHelpers-DWwsNxpa.js";
import { a as abuse__mf_v__runtimeInit__mf_v__, i as index_cjs } from "./abuse__mf_v__runtimeInit__mf_v__-D-IlhcC-.js";
var jsxRuntime = { exports: {} };
var reactJsxRuntime_production_min = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var f = abuse__loadShare__react__loadShare__, k = Symbol.for("react.element"), l = Symbol.for("react.fragment"), m = Object.prototype.hasOwnProperty, n = f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, p = { key: true, ref: true, __self: true, __source: true };
function q(c, a, g) {
  var b, d = {}, e = null, h = null;
  void 0 !== g && (e = "" + g);
  void 0 !== a.key && (e = "" + a.key);
  void 0 !== a.ref && (h = a.ref);
  for (b in a) m.call(a, b) && !p.hasOwnProperty(b) && (d[b] = a[b]);
  if (c && c.defaultProps) for (b in a = c.defaultProps, a) void 0 === d[b] && (d[b] = a[b]);
  return { $$typeof: k, type: c, key: e, ref: h, props: d, _owner: n.current };
}
reactJsxRuntime_production_min.Fragment = l;
reactJsxRuntime_production_min.jsx = q;
reactJsxRuntime_production_min.jsxs = q;
{
  jsxRuntime.exports = reactJsxRuntime_production_min;
}
var jsxRuntimeExports = jsxRuntime.exports;
const { loadShare } = index_cjs;
const { initPromise } = abuse__mf_v__runtimeInit__mf_v__;
const res = initPromise.then((_) => loadShare("react-dom", {
  customShareInfo: { shareConfig: {
    singleton: true,
    strictVersion: false,
    requiredVersion: "^18.3.1"
  } }
}));
const exportModule = await res.then((factory) => factory());
var abuse__loadShare__react_mf_2_dom__loadShare__ = exportModule;
const ReactDOM = /* @__PURE__ */ getDefaultExportFromCjs(abuse__loadShare__react_mf_2_dom__loadShare__);
export {
  ReactDOM as R,
  abuse__loadShare__react_mf_2_dom__loadShare__ as a,
  jsxRuntimeExports as j
};
