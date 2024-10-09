import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import useEmailVerification from "@/hooks/useEmailVerification";

interface VerificationNoticeContentProps {
  emailVerification: ReturnType<typeof useEmailVerification>;
  className?: string;
}

export default function VerificationNoticeContent({
  emailVerification,
  className = "",
}: VerificationNoticeContentProps) {
  return (
    <div className={`flex items-start ${className}`}>
      <div className="flex-shrink-0 pt-1">
        <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />
      </div>
      <div className="ml-3">
        <p className="text-sm text-amber-700">
          Your account needs to be verified before you can upload files. Please
          check your email and complete the verification process to gain access
          to this feature.
        </p>
        <div className="mt-4">
          <Button
            onClick={emailVerification.resendVerification}
            variant="outline"
            size="sm"
            className="bg-amber-100 text-amber-800 hover:bg-amber-200 focus:ring-amber-500 border-amber-300">
            Resend Verification Email
          </Button>
        </div>
      </div>
    </div>
  );
}
