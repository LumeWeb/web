import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__, jsxRuntimeExports } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__-D-EDec9Y.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__-BRPNVk8X.js';
import { core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__-ImaNZ9yu.js';
import { object, string } from './schemas-BzkPIUef.js';
import { ZodIssueCode } from './compat-CL8KLCd1.js';
import { Card } from './Card-Ns8xFd4u.js';
import { Key } from './key-BrIpUL_0.js';

const schema = object({
  current_password: string(),
  new_password: string(),
  retype_password: string()
}).superRefine((data, ctx) => {
  if (data.new_password !== data.retype_password) {
    return ctx.addIssue({
      code: ZodIssueCode.custom,
      message: "Passwords do not match",
      path: ["retype_password"]
    });
  }
  return true;
});

function updateEmailForm() {
  return {
    actionButtonsLayout: "horizontal",
    fields: [
      {
        label: "Current Password",
        name: "current_password",
        type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormFieldType.PASSWORD
      },
      {
        label: "New Password",
        name: "new_password",
        type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormFieldType.PASSWORD
      },
      {
        label: "Retype Password",
        name: "retype_password",
        type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormFieldType.PASSWORD
      }
    ],
    validationSchema: schema
  };
}

function updatePasswordDialogConfig(updatePasswordHook) {
  return {
    formConfig: updateEmailForm(),
    onSubmit: (req) => {
      return updatePasswordHook({
        currentPassword: req.current_password,
        password: req.new_password
      });
    },
    onSuccess: () => void 0,
    title: "Change Password",
    type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogTypes.FORM
  };
}

function Password() {
  const { mutateAsync: updatePassword } = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useUpdatePassword();
  const { openDialog } = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.useDialog();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      border: true,
      description: "Manage your account password",
      icon: Key,
      title: "Password",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1", children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-muted h-2 w-2 rounded-full" }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "••••••••" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button,
          {
            className: "h-11 w-full whitespace-normal md:h-9 md:whitespace-nowrap",
            onClick: (e) => {
              e.preventDefault();
              openDialog(updatePasswordDialogConfig(updatePassword));
            },
            children: "Change Password"
          }
        )
      ]
    }
  );
}

export { Password as default };
