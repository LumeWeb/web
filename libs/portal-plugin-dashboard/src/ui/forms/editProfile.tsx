import { type FormConfig, FormFieldType } from "@lumeweb/portal-framework-ui";

export default function editProfileForm(): FormConfig {
  return {
    action: "edit",
    actionButtons: false,
    autoSave: true,
    autoSaveStates: {
      idle: <></>,
    },
    fields: [
      {
        label: "First Name",
        name: "first_name",
        type: FormFieldType.TEXT,
      },
      {
        label: "Last Name",
        name: "last_name",
        type: FormFieldType.TEXT,
      },
      {
        className: "col-span-2",
        label: "Email Address",
        name: "email",
        type: "core:dashboard:account.email",
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
