import { type StepFormConfig } from "@lumeweb/portal-framework-ui";

import { stepOneSchema, stepTwoSchema } from "./deleteAccount.schema";

export default function deleteAccountForm(): StepFormConfig {
  return {
    steps: [
      {
        fields: [
          {
            description:
              "Are you sure you want to delete your account? This action cannot be undone.",
            label: 'Type "DELETE" to confirm:',
            name: "confirmText",
            placeholder: "DELETE",
            required: true,
            type: "text",
          },
        ],
        title: "Confirm Deletion",
        validationSchema: stepOneSchema,
      },
      {
        fields: [
          {
            description:
              "This is your final chance to reconsider. Your account will be permanently deleted.",
            label: 'Type "I UNDERSTAND" to proceed:',
            name: "confirmText",
            placeholder: "I UNDERSTAND",
            required: true,
            type: "text",
          },
        ],
        title: "Final Confirmation",
        validationSchema: stepTwoSchema,
      },
    ],
  };
}
