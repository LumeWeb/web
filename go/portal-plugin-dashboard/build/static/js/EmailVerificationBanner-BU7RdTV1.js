import { jsxRuntimeExports } from './jsx-runtime-ta0kGoHj.js';
import { useEmailVerification } from './useEmailVerification-Cq2zbvCo.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__-YjtT0XC7.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__-CequMnfU.js';
import { core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__-2mQxKAcF.js';
import { createLucideIcon } from './createLucideIcon-t7U8xzo8.js';

/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode = [
  ["path", { d: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7", key: "132q7q" }],
  ["rect", { x: "2", y: "4", width: "20", height: "16", rx: "2", key: "izxlao" }]
];
const Mail = createLucideIcon("mail", __iconNode);

function EmailVerificationBanner() {
  const framework = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.useFramework();
  const { data: identity } = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useGetIdentity();
  const { isLoading, resendVerification } = useEmailVerification();
  if (framework.appName != "dashboard") {
    return null;
  }
  if (!identity) {
    return null;
  }
  if (!identity?.verified) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Alert, { className: "bg-secondary text-foreground mb-4", variant: "default", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.AlertTitle, { children: "Verify Your Email" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.AlertDescription, { className: "mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-2 sm:mb-0", children: "We've sent you a verification email. Please click the link to start using the platform." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Button,
          {
            className: "self-start sm:self-center",
            disabled: isLoading,
            onClick: resendVerification,
            size: "sm",
            variant: "outline",
            children: isLoading ? "Sending..." : "Resend Verification Email"
          }
        )
      ] })
    ] });
  }
  return null;
}
const EmailVerificationBanner$1 = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.createBridgeComponent(EmailVerificationBanner);

export { EmailVerificationBanner$1 as default };
