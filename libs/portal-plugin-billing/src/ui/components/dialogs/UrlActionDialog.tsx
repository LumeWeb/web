import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@lumeweb/portal-framework-ui-core";
import { Button } from "@lumeweb/portal-framework-ui-core";
import { useEffect } from "react";

interface UrlActionDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  url: string;
  confirmText?: string;
  cancelText?: string;
}

export function UrlActionDialog({
  open,
  onClose,
  title,
  description,
  url,
  confirmText = "Continue",
  cancelText = "Cancel",
}: UrlActionDialogProps) {
  const handleConfirm = () => {
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen: boolean) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button onClick={handleConfirm}>{confirmText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
