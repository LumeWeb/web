import { a as admin__mf_v__runtimeInit__mf_v__, i as index_cjs } from "./admin__mf_v__runtimeInit__mf_v__-CrLwvomy.js";
import { c as createLucideIcon } from "./createLucideIcon-BzDmmRa9.js";
const { loadShare } = index_cjs;
const { initPromise } = admin__mf_v__runtimeInit__mf_v__;
const res = initPromise.then((_) => loadShare("react-router", {
  customShareInfo: { shareConfig: {
    singleton: true,
    strictVersion: false,
    requiredVersion: "^7.6.0"
  } }
}));
const exportModule = await res.then((factory) => factory());
var admin__loadShare__react_mf_2_router__loadShare__ = exportModule;
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
];
const CircleAlert = createLucideIcon("circle-alert", __iconNode);
export {
  CircleAlert as C,
  admin__loadShare__react_mf_2_router__loadShare__ as a
};
