import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "portal-shared/components/ui/dialog";
import VerificationNoticeContent from "./VerificationNoticeContent";
import useEmailVerification from "@/hooks/useEmailVerification";

interface UnverifiedUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UnverifiedUserModal({
  isOpen,
  onClose,
}: UnverifiedUserModalProps): React.ReactElement {
  const emailVerification = useEmailVerification();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>Account Verification Required</DialogTitle>
        <div className="mt-4">
          <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg shadow-sm">
            <VerificationNoticeContent
              emailVerification={emailVerification}
              className="p-4"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
