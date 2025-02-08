import type { CaseStatus } from "@/types/case";

import { StatusSwitch } from "@/ui/components/case-management/StatusSwitch";
import { Button } from "@lumeweb/portal-framework-ui-core";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@lumeweb/portal-framework-ui-core";
import { Textarea } from "@lumeweb/portal-framework-ui-core";
import { useNotification } from "@refinedev/core";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";

interface UpdateStatusDialogProps {
  caseId: number;
  currentStatus: CaseStatus;
  onStatusChange: (status: CaseStatus, comment: string) => Promise<void>;
}

export function UpdateStatusDialog({
  currentStatus,
  onStatusChange,
}: UpdateStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<CaseStatus>(currentStatus);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { open: openNotification } = useNotification();

  const handleSubmit = async () => {
    if (status === currentStatus) {
      openNotification({
        description: "The status is already set to this value.",
        message: "No change",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onStatusChange(status, comment);
      openNotification({
        description: `Case status has been updated to ${status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}.`,
        message: "Status updated",
        type: "success",
      });
      setOpen(false);
    } catch (_) {
      openNotification({
        description:
          "There was an error updating the case status. Please try again.",
        message: "Failed to update status",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button className="w-full">Update Status</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Case Status</DialogTitle>
          <DialogDescription>
            Change the status of this case and provide a reason for the change.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Status</label>
            <StatusSwitch
              onChange={async (newStatus) => {
                setStatus(newStatus);
                return Promise.resolve();
              }}
              value={status}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="comment">
              Comment (Optional)
            </label>
            <Textarea
              className="min-h-[100px]"
              id="comment"
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment about this status change..."
              value={comment}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={isSubmitting}
            onClick={() => setOpen(false)}
            variant="outline">
            Cancel
          </Button>
          <Button disabled={isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Status"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
