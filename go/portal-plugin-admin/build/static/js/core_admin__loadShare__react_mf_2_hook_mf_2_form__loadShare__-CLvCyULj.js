import { createLucideIcon } from './createLucideIcon-DUFhQ7bm.js';
import { core_admin__mf_v__runtimeInit__mf_v__, index_cjs } from './core_admin__mf_v__runtimeInit__mf_v__-DfW_aMyq.js';

/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode = [
  ["path", { d: "m21 21-4.34-4.34", key: "14j7rj" }],
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }]
];
const Search = createLucideIcon("search", __iconNode);

// dev uses dynamic import to separate chunks
    
    const {loadShare} = index_cjs;
    const {initPromise} = core_admin__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(_ => loadShare("react-hook-form", {
    customShareInfo: {shareConfig:{
      singleton: true,
      strictVersion: false,
      requiredVersion: "^7.54.0"
    }}}));
    const exportModule = await res.then(factory => factory());
    var core_admin__loadShare__react_mf_2_hook_mf_2_form__loadShare__ = exportModule;

export { Search, core_admin__loadShare__react_mf_2_hook_mf_2_form__loadShare__ };
