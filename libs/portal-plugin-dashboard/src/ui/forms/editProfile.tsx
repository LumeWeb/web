import { type FormConfig, FormFieldType } from "@lumeweb/portal-framework-ui";

export default function editProfileForm(): FormConfig {
  return {
    formId: "edit_profile",
    action: "edit",
    actionButtons: false,
    autoSave: true,
    autoSaveStates: {
      idle: <></>,
    },
    fields: [
      {
        className: "col-span-2 md:col-span-1",
        label: "First Name",
        name: "first_name",
        type: FormFieldType.TEXT,
      },
      {
        className: "col-span-2 md:col-span-1",
        label: "Last Name",
        name: "last_name",
        type: FormFieldType.TEXT,
      },
      {
        className: "col-span-2",
        label: "Email Address",
        name: "email",
        type: "dashboard:account.email",
      },
    ],
    footerClassName: "",
    formClassName: "grid-cols-1 md:grid-cols-2 gap-4",
    id: "",
    layout: "grid",
    refine: true,
    resource: "account",
  };
}
