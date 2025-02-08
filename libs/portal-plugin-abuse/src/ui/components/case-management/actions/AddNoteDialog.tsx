import {
  CommunicationDirection,
  CommunicationType,
} from "@/types/communication";
import { RefineResource } from "@/types/resources";
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Textarea,
} from "@lumeweb/portal-framework-ui-core";
import { useCreate, useNotification } from "@refinedev/core";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";

interface AddNoteDialogProps {
  caseId: number;
  onSuccess?: () => void;
}

export function AddNoteDialog({ caseId, onSuccess }: AddNoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { open: openNotification } = useNotification();
  const { mutate } = useCreate();

  const handleSubmit = async () => {
    if (!content.trim()) {
      openNotification({
        description: "Please enter some content for the note.",
        message: "Note is empty",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await mutate(
        {
          resource: RefineResource.Communication,
          values: {
            caseId,
            content,
            direction: CommunicationDirection.Internal,
            metadata: {
              isImportant,
            },
            senderId: 1, // Current user ID would be used in a real app
            type: CommunicationType.Note,
          },
        },
        {
          onError: () => {
            throw new Error("Failed to add note");
          },
          onSuccess: () => {
            openNotification({
              description: "Your note has been added to the case.",
              message: "Note added",
              type: "success",
            });
            setContent("");
            setIsImportant(false);
            setOpen(false);
            if (onSuccess) {
              onSuccess();
            }
          },
        },
      );
    } catch (_) {
      openNotification({
        description: "There was an error adding your note. Please try again.",
        message: "Failed to add note",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          Add Note
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Internal Note</DialogTitle>
          <DialogDescription>
            Add a note to this case that will be visible to internal team
            members only.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            className="min-h-[200px]"
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your note here..."
            value={content}
          />
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={isImportant}
              id="important"
              onCheckedChange={(checked) => setIsImportant(checked === true)}
            />
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="important">
              Mark as important
            </label>
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
                Adding...
              </>
            ) : (
              "Add Note"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
