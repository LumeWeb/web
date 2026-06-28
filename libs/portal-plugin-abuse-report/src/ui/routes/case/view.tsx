import { type Case, CaseStatus, RefineResource } from "@/types";
import { CASE_TYPE_THEME } from "@/types/badge";
import { UppyUploader } from "@/ui/components/file-uploader/UppyUploader";
import { Timeline, TimelineMessage } from "@/ui/components/timeline";
import { formatFileSize } from "@/ui/util";
import {
  ActionItemType,
  BADGE_THEME,
  FormFieldType,
  SchemaForm,
  ThemedBadge,
  useDialog,
} from "@lumeweb/portal-framework-ui";
import { Button, Card, lazyIcon } from "@lumeweb/portal-framework-ui-core";
import { useShow } from "@refinedev/core";
import { format, parseISO } from "date-fns";

import React from "react";
import * as z from "zod";
const FileText = lazyIcon("FileText");
const Lock = lazyIcon("Lock");
const Upload = lazyIcon("Upload");


interface UploadDialogProps {
  onClose: () => void;
  referenceNumber: string;
  refetch: () => void;
}

function _View({ openUploadDialog }: { openUploadDialog: () => void }) {
  const { queryResult } = useShow<Case>();
  const { data, isError, isLoading } = queryResult;
  const caseData = data?.data;

  if (isLoading) return <div>Loading case details...</div>;
  if (isError || !caseData) return <div>Error loading case details</div>;

  const isCaseClosed = caseData.status === CaseStatus.closed;
  const attachments = caseData.attachments || [];

  const communicationSchema = z.object({
    content: z.string().min(1, "Content is required"),
  });

  const formConfig = {
    actionButtons: [
      {
        disabled: (methods) =>
          methods.formState.isSubmitting ||
          !methods.formState.dirtyFields.content,
        label: "Send Response",
        onClick: () => (methods) => methods.handleSubmit(),
        type: ActionItemType.SUBMIT,
      },
    ],
    actionButtonsLayout: "horizontal",
    fields: [
      {
        label: "Response",
        name: "content",
        required: true,
        type: FormFieldType.RICH_TEXT,
      },
    ],
    refine: true,
    refineCoreProps: {
      errorNotification: (error) => ({
        message: `Failed to send response: ${error.message}`,
        type: "error",
      }),
      meta: {
        paramsMap: {
          case: caseData.reference_number,
        },
      },
      successNotification: () => ({
        message: "Response sent successfully",
        type: "success",
      }),
    },
    resource: `${RefineResource.Case}.communications`,
    validationSchema: communicationSchema,
  };

  const statusVariant = () => {
    switch (caseData.status) {
      case CaseStatus.closed:
        return "destructive";
      case CaseStatus.in_progress:
        return "secondary";
      case CaseStatus.resolved:
        return "success";
      default:
        return "default";
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">
          Case #{caseData.reference_number}
        </h1>
        <ThemedBadge
          config={BADGE_THEME}
          value={caseData.status}
          variant={statusVariant()}
        />
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
          <div>
            <h3 className="text-sm text-muted-foreground pb-2">Case Type</h3>
            <ThemedBadge config={CASE_TYPE_THEME} value={caseData.type} />
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground">Date Reported</h3>
            <p className="text-lg">
              {format(parseISO(caseData.created_at), "MMM d, yyyy, h:mm a")}
            </p>
          </div>
        </div>
      </Card>

      {/* Description */}
      <Card className="border-none bg-card p-6 mb-8">
        <h2 className="text-xl font-medium text-foreground mb-4">
          Description
        </h2>
        <p className="text-foreground">{caseData.description}</p>
      </Card>

      {/* Attachments */}
      <Card className="border-none bg-card p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-foreground">Attachments</h2>
          {!isCaseClosed ? (
            <Button
              className="rounded-full border-border bg-transparent hover:bg-button text-foreground flex items-center gap-2"
              onClick={openUploadDialog}
              variant="outline">
              <Upload className="h-4 w-4" />
              Upload Files
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-foreground/60">
              <Lock className="h-4 w-4" />
              <span className="text-sm">Uploads disabled</span>
            </div>
          )}
        </div>

        {attachments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attachments.map((attachment) => (
              <div
                className="bg-background p-4 rounded-lg flex items-center gap-3"
                key={attachment.id}>
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {attachment.filename}
                  </p>
                  <p className="text-xs text-foreground/60">
                    {formatFileSize(attachment.size)} •{" "}
                    {format(parseISO(attachment.uploaded_at), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-foreground/70">No attachments yet.</p>
        )}
      </Card>

      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Communications</h2>
          <Timeline>
            {caseData.communications?.map((comm: any) => (
              <TimelineMessage
                content={comm.content}
                direction={comm.direction}
                key={comm.id}
                sender={comm.direction === "incoming" ? "Support Agent" : "You"}
                timestamp={format(
                  parseISO(comm.created_at),
                  "MMM d, yyyy, h:mm a",
                )}
                type={comm.type === "note" ? "note" : "message"}
              />
            ))}
          </Timeline>
        </div>
      </Card>

      <Card className="mt-6">
        <div className="p-6">
          <SchemaForm config={formConfig} />
        </div>
      </Card>
    </div>
  );
}

function UploadDialog({
  onClose,
  referenceNumber,
  refetch,
}: UploadDialogProps) {
  const accessToken = localStorage.getItem("caseAccessToken") || "";

  const handleUploadSuccess = async () => {
    await refetch();
    onClose();
  };

  return (
    <div className="space-y-4">
      <UppyUploader
        accessToken={accessToken}
        onUploadError={(error) => console.error("Upload failed:", error)}
        onUploadSuccess={handleUploadSuccess}
        referenceNumber={referenceNumber}
      />
      <div className="flex justify-end gap-2">
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </div>
    </div>
  );
}

function View() {
  const { closeDialog, openDialog } = useDialog();
  const { queryResult } = useShow<Case>();
  const { refetch } = queryResult;
  const caseData = queryResult.data?.data;

  function openUploadDialog() {
    openDialog({
      classNames: {
        content: "sm:max-w-[800px] bg-modal-background border-modal-border",
      },
      content: (
        <UploadDialog
          onClose={() => closeDialog()}
          referenceNumber={caseData?.reference_number || ""}
          refetch={refetch}
        />
      ),
      dismissable: false,
      title: "Upload Files",
      type: "custom",
    });
  }

  return <_View openUploadDialog={openUploadDialog} />;
}

export default View;
