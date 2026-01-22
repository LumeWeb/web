import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__, jsxRuntimeExports } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__-D-EDec9Y.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__-BRPNVk8X.js';
import { core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__-ImaNZ9yu.js';
import { Card } from './Card-Ns8xFd4u.js';
import { DATA_PROVIDER_NAME } from './auth-D5nujfuN.js';
import './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__-CQeXjHLK.js';
import './resetPassword.schema-C_7aDFoR.js';
import './core_dashboard__loadShare__react_mf_2_router__loadShare__-BFaT_n3N.js';
import { object, literal } from './schemas-BzkPIUef.js';
import { createLucideIcon } from './createLucideIcon-a23Vw1TY.js';

/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode = [
  [
    "path",
    {
      d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
      key: "wmoenq"
    }
  ],
  ["path", { d: "M12 9v4", key: "juzpu7" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
];
const TriangleAlert = createLucideIcon("triangle-alert", __iconNode);

const stepOneSchema = object({
  confirmText: literal("DELETE", {
    errorMap: () => ({ message: "Please type DELETE to confirm" })
  })
});
const stepTwoSchema = object({
  confirmText: literal("I UNDERSTAND", {
    errorMap: () => ({ message: "Please type I UNDERSTAND to confirm" })
  })
});

function deleteAccountForm() {
  return {
    steps: [
      {
        fields: [
          {
            description: "Are you sure you want to delete your account? This action cannot be undone.",
            label: 'Type "DELETE" to confirm:',
            name: "confirmText",
            placeholder: "DELETE",
            required: true,
            type: "text"
          }
        ],
        title: "Confirm Deletion",
        validationSchema: stepOneSchema
      },
      {
        fields: [
          {
            description: "This is your final chance to reconsider. Your account will be permanently deleted.",
            label: 'Type "I UNDERSTAND" to proceed:',
            name: "confirmText",
            placeholder: "I UNDERSTAND",
            required: true,
            type: "text"
          }
        ],
        title: "Final Confirmation",
        validationSchema: stepTwoSchema
      }
    ]
  };
}

function deleteAccountDialogConfig(deleteMutation, logout, openDialog) {
  return {
    formConfig: deleteAccountForm(),
    onSubmit: async () => {
      try {
        return await deleteMutation.mutateAsync({
          resource: DATA_PROVIDER_NAME,
          successNotification: false
        });
      } catch (error) {
        console.error("Failed to delete account:", error);
        throw new Error(
          "Failed to delete account. Please try again or contact support."
        );
      }
    },
    onSuccess: () => {
      openDialog({
        description: "Your account will be deleted within 48 hours. If this is an error, please contact support immediately.",
        onConfirm: () => logout(),
        title: "Account Deletion Scheduled",
        type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogTypes.ALERT,
        variant: "success"
      });
      return true;
    },
    title: "Delete Account",
    type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogTypes.FORM
  };
}

function DeleteAccount() {
  const { openDialog } = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.useDialog();
  const { mutateAsync: logout } = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useLogout();
  const deleteMutator = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useDelete();
  const handleDeleteClick = () => {
    openDialog(deleteAccountDialogConfig(deleteMutator, logout, openDialog));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Card,
    {
      border: true,
      description: "Permanently delete your account and all data",
      icon: TriangleAlert,
      title: "Delete Account",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button,
        {
          className: "h-11 w-full whitespace-normal md:h-9 md:whitespace-nowrap",
          onClick: handleDeleteClick,
          variant: "destructive",
          children: "Delete Account"
        }
      )
    }
  );
}

export { DeleteAccount as default };
