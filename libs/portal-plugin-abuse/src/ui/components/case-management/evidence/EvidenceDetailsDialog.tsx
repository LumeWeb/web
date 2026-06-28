import { type EvidenceResponse, EvidenceSource } from "@/types/evidence";
import { formatFileSize } from "@/ui/util";
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, lazyIcon } from "@lumeweb/portal-framework-ui-core";
import { format } from "date-fns";

import React from "react";
const Download = lazyIcon("Download");
const FileIcon = lazyIcon("FileIcon");
const FileText = lazyIcon("FileText");
const Image = lazyIcon("Image");


interface EvidenceDetailsDialogProps {
  evidence: EvidenceResponse;
  onDownload: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function EvidenceDetailsDialog({
  evidence,
  onDownload,
  onOpenChange,
  open,
}: EvidenceDetailsDialogProps) {
  const getSourceLabel = (source: EvidenceSource) => {
    switch (source) {
      case EvidenceSource.API:
        return "API";
      case EvidenceSource.Email:
        return "Email";
      case EvidenceSource.System:
        return "System";
      case EvidenceSource.WebUpload:
        return "Web Upload";
      default:
        return source;
    }
  };

  const getFileTypeIcon = (contentType: string) => {
    if (contentType.startsWith("image/")) {
      return <Image className="h-12 w-12 text-blue-500" />;
    } else if (contentType.startsWith("text/")) {
      return <FileText className="h-12 w-12 text-green-500" />;
    } else {
      return <FileIcon className="h-12 w-12 text-gray-500" />;
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Evidence Details</DialogTitle>
          <DialogDescription>
            Detailed information about the evidence file.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="flex items-start gap-4">
            <div className="bg-muted p-4 rounded-md">
              {getFileTypeIcon(evidence.contentType)}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-1">{evidence.fileName}</h3>
              <p className="text-sm text-muted-foreground">
                {evidence.contentType}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(evidence.fileSize)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Source</h4>
              <p className="text-sm">{getSourceLabel(evidence.source)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Uploaded</h4>
              <p className="text-sm">
                {format(new Date(evidence.createdAt), "MMM d, yyyy h:mm a")}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Submitter ID</h4>
              <p className="text-sm">{evidence.submitterId}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Storage Hash</h4>
              <p className="text-sm font-mono text-xs truncate">
                {evidence.storageHash}
              </p>
            </div>
          </div>

          {evidence.description && (
            <div>
              <h4 className="text-sm font-medium mb-1">Description</h4>
              <p className="text-sm whitespace-pre-line">
                {evidence.description}
              </p>
            </div>
          )}

          {evidence.metadata && Object.keys(evidence.metadata).length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-1">Metadata</h4>
              <pre className="text-xs bg-muted p-2 rounded-md overflow-auto max-h-[200px]">
                {JSON.stringify(evidence.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Close
          </Button>
          <Button className="flex items-center gap-2" onClick={onDownload}>
            <Download className="h-4 w-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
