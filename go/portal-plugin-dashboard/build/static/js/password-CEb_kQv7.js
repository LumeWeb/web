import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__, jsxRuntimeExports } from './jsx-runtime-D_0QkpWj.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__-CFuxgGnQ.js';
import { core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__-DOYraqnS.js';
import { z } from './index-DESmQ-Cl.js';
import { Card } from './Card-Dhqiz4WT.js';
import { Key } from './key-qRiY-pBO.js';

const schema = z.object({
  current_password: z.string(),
  new_password: z.string(),
  retype_password: z.string()
}).superRefine((data, ctx) => {
  if (data.new_password !== data.retype_password) {
    return ctx.addIssue({
      code: z.ZodIssueCode.custom,
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
