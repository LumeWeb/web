import type { AbuseReportResponse } from "@/types";
import type { DialogConfig } from "@lumeweb/portal-framework-ui";

import confirmMemeImg from "@/images/confirm-meme.gif";
import { ActionItemType } from "@lumeweb/portal-framework-ui";
import { Button, lazyIcon } from "@lumeweb/portal-framework-ui-core";

import { DIALOG_IDS } from "./dialog-ids";
const Copy = lazyIcon("Copy");
const Flag = lazyIcon("Flag");


interface ConfirmationDialogArgs {
  data: AbuseReportResponse;
  onCancel: () => void;
  onViewCase: () => void;
}

const handleCopy = async (textToCopy: string) => {
  try {
    await navigator.clipboard.writeText(textToCopy);
    console.log("Copied to clipboard:", textToCopy);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
};

export const getConfirmationDialogConfig = (
  args: ConfirmationDialogArgs,
): DialogConfig => ({
  actionButtons: [
    {
      className:
        "h-10 rounded-full bg-button hover:bg-button-hover text-foreground px-8 w-full",
      label: "View Case Status",
      onClick: args.onViewCase,
      type: ActionItemType.CUSTOM,
    },
    {
      className:
        "h-10 rounded-full border border-foreground/20 bg-transparent hover:bg-button text-foreground px-8 w-full",
      label: "Back to Site",
      type: ActionItemType.CANCEL,
    },
  ],
  actionButtonsLayout: "vertical",
  classNames: {
    content: "sm:max-w-[515px] border-none report-confirmation-dialog p-0",
    footer: "p-6",
    header: "p-6 pb-5 border-b border-border text-left",
  },
  content: (
    <div className="flex flex-col items-center space-y-8">
      <div className="w-[450px] max-w-full h-auto overflow-hidden">
        <img
          alt="Thank you image showing a person nodding in approval"
          className="w-full h-full object-cover"
          src={confirmMemeImg}
        />
      </div>

      <div className="text-center space-y-4">
        <h3 className="text-[30px] font-medium tracking-tight text-primary">
          Thanks for doing your part.
        </h3>
        <p className="text-sm text-foreground leading-relaxed tracking-wide">
          Your report has been submitted successfully. Please save your access
          information below to check the status of your report later.
        </p>
      </div>

      <div className="w-full space-y-4">
        <div className="flex items-center justify-between px-4 py-3 rounded-md border border-border bg-card">
          <div>
            <p className="text-xs text-foreground/70 mb-1">Case Reference</p>
            <p className="text-sm font-semibold tracking-wider text-foreground">
              {args.data.case_reference}
            </p>
          </div>
          <Button
            aria-label="Copy reference number"
            className="h-8 w-8 hover:bg-accent hover:text-accent-foreground"
            onClick={() => handleCopy(args.data.case_reference)}
            size="icon"
            variant="ghost">
            <Copy className="h-4 w-4" />
            <span className="sr-only">Copy reference number</span>
          </Button>
        </div>

        <div className="flex items-center justify-between px-4 py-3 rounded-md border border-border bg-card">
          <div>
            <p className="text-xs text-foreground/70 mb-1">Access Key</p>
            <p className="text-sm font-semibold tracking-wider text-foreground">
              {args.data.access_token}
            </p>
          </div>
          <Button
            aria-label="Copy access key"
            className="h-8 w-8 hover:bg-accent hover:text-accent-foreground"
            onClick={() => handleCopy(args.data.access_token)}
            size="icon"
            variant="ghost">
            <Copy className="h-4 w-4" />
            <span className="sr-only">Copy access key</span>
          </Button>
        </div>
      </div>
    </div>
  ),
  dismissable: true,
  icon: <Flag aria-hidden="true" className="h-6 w-6 text-primary" />,
  id: DIALOG_IDS.REPORT_CONFIRMATION,
  onCancel: args.onCancel,
  size: "md",
  title: "Report an abuse",
  type: "custom",
});
