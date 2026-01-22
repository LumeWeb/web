import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__, jsxRuntimeExports } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__-D-EDec9Y.js';
import { Card } from './Card-Ns8xFd4u.js';
import { User } from './user-BKMQEmug.js';

function editProfileForm() {
  return {
    formId: "edit_profile",
    action: "edit",
    actionButtons: false,
    autoSave: true,
    autoSaveStates: {
      idle: /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {})
    },
    fields: [
      {
        className: "col-span-2 md:col-span-1",
        label: "First Name",
        name: "first_name",
        type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormFieldType.TEXT
      },
      {
        className: "col-span-2 md:col-span-1",
        label: "Last Name",
        name: "last_name",
        type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormFieldType.TEXT
      },
      {
        className: "col-span-2",
        label: "Email Address",
        name: "email",
        type: "dashboard:account.email"
      }
    ],
    footerClassName: "",
    formClassName: "grid-cols-1 md:grid-cols-2 gap-4",
    id: "",
    layout: "grid",
    refine: true,
    resource: "account"
  };
}

function Profile() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Card,
    {
      description: "Update your personal information",
      icon: User,
      title: "Profile Information",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.SchemaForm, { config: editProfileForm() })
    }
  );
}

export { Profile as default };
