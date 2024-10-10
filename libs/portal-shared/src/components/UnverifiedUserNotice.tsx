import React from "react";
import VerificationNoticeContent from "@/components/VerificationNoticeContent";
import useEmailVerification from "@/hooks/useEmailVerification";

export default function UnverifiedUserNotice() {
  const emailVerification = useEmailVerification();

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-lg shadow-md">
      <VerificationNoticeContent emailVerification={emailVerification} />
    </div>
  );
}
