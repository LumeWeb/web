import { jsxRuntimeExports } from './jsx-runtime-BpMlpgXU.js';
import { core_abuse_mf_2_report__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ } from './core_abuse_mf_2_report__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__-CxWo1El1.js';
import { React } from './core_abuse_mf_2_report__loadShare__react__loadShare__-BEUTMMR1.js';
import { createLucideIcon } from './createLucideIcon-DFjvw4h5.js';

/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]
];
const ArrowRight = createLucideIcon("arrow-right", __iconNode);

const ReportButton = React.forwardRef(
  ({ className, showArrow = true, children, size = "default", variant = "default", ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      core_abuse_mf_2_report__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button,
      {
        className: core_abuse_mf_2_report__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn(
          "group rounded-full bg-button hover:bg-button-hover text-foreground h-14 px-8",
          className
        ),
        ref,
        size,
        variant,
        ...props,
        children: [
          children,
          showArrow && /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-2 group-hover:translate-x-1 transition-transform" })
        ]
      }
    );
  }
);
ReportButton.displayName = "ReportButton";

export { ReportButton };
