import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@lumeweb/portal-framework-ui-core";
import { X } from "lucide-react";
import React, { type FunctionComponent } from "react";

interface KeyboardShortcutDialogProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  shortcuts: Record<string, string | string[]>;
}

export const KeyboardShortcutDialog: FunctionComponent<
  KeyboardShortcutDialogProps
> = ({ onOpenChange, open, shortcuts }) => {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <div className="absolute right-4 top-4">
          <Button
            className="h-8 w-8"
            onClick={() => onOpenChange(false)}
            size="icon"
            variant="ghost">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          {Object.entries(shortcuts).map(([action, keys]) => (
            <div className="flex items-center justify-between" key={action}>
              <span className="text-muted-foreground text-sm">{action}</span>
              <div className="flex gap-1">
                {(Array.isArray(keys) ? keys : [keys]).map((key) => (
                  <Badge key={key} variant="outline">
                    {key}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
