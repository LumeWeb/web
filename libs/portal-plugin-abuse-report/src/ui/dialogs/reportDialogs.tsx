import type { AbuseReportRequest } from "@/types";
import type { DialogConfig } from "@lumeweb/portal-framework-ui";

import { ActionItemType, FormFieldType } from "@lumeweb/portal-framework-ui";
import { useGo } from "@refinedev/core";
import React from "react";
import { AbuseReportResponse } from "src/client/index.schemas";
import { z } from "zod";

import { DIALOG_IDS } from "./dialog-ids";

const schema = {
  abuse_type: z.string().min(1, "Abuse type is required"),
  additional_details: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  email: z.string().email("Please enter a valid email address"),
  location: z.string().min(1, "Location details are required"),
} satisfies z.ZodRawShape;

interface ReportDialogArgs {
  errorNotification: (error: any) => {
    description: string;
    message: string;
    type: "error";
  };
  go: ReturnType<typeof useGo>;
  icon: React.ReactNode;
  onCancel: () => void;
  onSuccess: (data: AbuseReportResponse) => void;
  replaceDialog: (config: DialogConfig<AbuseReportRequest>) => void;
}

export const getReportDialogConfig = (
  args: ReportDialogArgs,
): DialogConfig<AbuseReportRequest, AbuseReportResponse> => ({
  classNames: {
    content: "bg-modal-background border-none overflow-hidden sm:max-w-[516px]",
    header: "p-6 pb-5 border-b border-modal-border",
  },
  formConfig: {
    actionButtons: [
      {
        className:
          "h-10 px-8 rounded-full border border-foreground/20 bg-transparent hover:bg-modal-input text-foreground",
        label: "Cancel",
        type: ActionItemType.CANCEL,
      },
      {
        className:
          "h-10 px-8 rounded-full bg-button hover:bg-button-hover text-foreground",
        label: "Submit Report",
        type: ActionItemType.SUBMIT,
      },
    ],
    closeOnSubmit: false,
    errorNotification: args.errorNotification,
    fields: [
      {
        className: "space-y-3",
        inputClassName:
          "h-14 border border-input bg-modal-input placeholder:text-foreground/50",
        label: "Your email",
        name: "email",
        placeholder: "Your email",
        required: true,
        type: FormFieldType.TEXT,
      },
      {
        className: "space-y-3",
        description: "Select the category that best matches your report",
        inputClassName:
          "h-14 border-none bg-modal-input text-foreground placeholder:text-foreground/50",
        label: "What type of abuse are you reporting?",
        name: "abuse_type",
        options: [
          { label: "Spam", value: "spam" },
          { label: "Harassment", value: "harassment" },
          { label: "Malware", value: "malware" },
          { label: "Phishing", value: "phishing" },
          { label: "Copyright Violation", value: "copyright_violation" },
          { label: "Resource Abuse", value: "resource_abuse" },
          {
            label: "Illegal/Harmful Content",
            value: "illegal_or_harmful_content",
          },
          { label: "Other", value: "other" },
        ],
        placeholder: "Type of abuse",
        required: true,
        type: FormFieldType.SELECT,
      },
      {
        className: "space-y-3",
        inputClassName:
          "min-h-[120px] border border-input bg-modal-input placeholder:text-foreground/50 resize-none p-4",
        label: "Describe what's happening",
        name: "description",
        placeholder: "Enter your description",
        required: true,
        type: FormFieldType.TEXTAREA,
      },
      {
        className: "space-y-3",
        description:
          "Provide specific location details like URL, IP address, or resource identifier",
        inputClassName:
          "h-14 border border-input bg-modal-input placeholder:text-foreground/50",
        label: "Where is this happening?",
        name: "location",
        placeholder: "Enter URL, IP, or identifier",
        required: true,
        type: FormFieldType.TEXT,
      },
      {
        className: "space-y-3",
        description: "Any other information that might help us investigate",
        inputClassName:
          "min-h-[180px] border-none bg-modal-input placeholder:text-foreground/50 resize-none p-4",
        label: "Additional details (optional)",
        name: "additional_details",
        required: false,
        type: FormFieldType.TEXTAREA,
      },
    ],
    formClassName: "space-y-8",
    refine: true,
    validationSchema: z.object(schema),
  },
  icon: args.icon,
  id: DIALOG_IDS.REPORT_FORM,
  onCancel: args.onCancel,
  onSuccess: args.onSuccess,
  preventCloseOnOutsideClick: "dirty",
  title: "Report an abuse",
  type: "form",
});

export { getConfirmationDialogConfig } from "@/ui/dialogs/confirmationDialog";
