import { type FormConfig, FormFieldType } from "@lumeweb/portal-framework-ui";

export default function editProfileForm(): FormConfig {
  return {
    layout: "grid",
    formClassName: "grid-cols-1 md:grid-cols-2 gap-4", // Add md:grid-cols-2 back
    footerClassName: "",
    autoSave: true,
    autoSaveStates: {
      idle: <></>,
    },
    resource: "account",
    refine: true,
    id: "",
    action: "edit",
    fields: [
      {
        name: "first_name",
        type: FormFieldType.TEXT,
        label: "First Name",
      },
      {
        name: "last_name",
        type: FormFieldType.TEXT,
        label: "Last Name",
      },
      {
        name: "email",
        type: "core:dashboard:account.email",
        label: "Email Address",
        className: "col-span-2",
      },
    ],
  };
}
