// Custom hook for email verification
import useSdk from "@/hooks/useSdk.js";
import { useNotification } from "@refinedev/core";
import { useMutation } from "@tanstack/react-query";
import { Sdk } from "@lumeweb/portal-sdk";
import { useState } from "react";

export default function useEmailVerification() {
  const sdk = useSdk() as Sdk;
  const { open } = useNotification();

  const [alreadyVerified, setAlreadyVerified] = useState(false);

  const verifyAgain = useMutation({
    mutationFn: async () => {
      let ret = await sdk.account!().requestEmailVerification();
      if (ret instanceof Error) {
        throw ret;
      }
    },
    onSuccess() {
      open?.({
        type: "success",
        message: "Email sent",
        description: "Please check your email inbox and click the link",
      });
    },
    onError(error) {
      if (error?.toString().toLowerCase().includes("already verified")) {
        setAlreadyVerified(true);
        open?.({
          type: "error",
          message: "Email already verified",
          description: "You can now login",
        });
        return;
      }
      open?.({
        type: "error",
        message: "Failed to send email",
        description: "Please try again later",
      });
    },
  });

  const handleResendVerification = async () => verifyAgain.mutate();

  return {
    alreadyVerified,
    resendVerification: handleResendVerification,
    isLoading: verifyAgain.isLoading,
  };
}
