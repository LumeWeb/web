// Custom hook for email verification
import useSdk from "@/hooks/useSdk.js";
import { useGetIdentity, useNotification } from "@refinedev/core";
import { useMutation } from "@tanstack/react-query";
import { AccountInfoResponse, Sdk } from "@lumeweb/portal-sdk";
import { useEffect, useState } from "react";
import { useSearchParams } from "@remix-run/react";
import { Identity } from "@/dataProviders/authProvider";

export default function useEmailVerification() {
  const sdk = useSdk() as Sdk;
  const { open } = useNotification();

  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const user = useGetIdentity<Identity>();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    if (user.data?.verified) {
      setAlreadyVerified(true);
    }
  }, [user.data?.verified]);

  const verifyAgain = useMutation({
    mutationFn: async () => {
      let ret = await sdk.account!().requestEmailVerification({
        email: user.data!.email || email!,
      });
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
    isLoading: verifyAgain.isLoading || user.isLoading,
  };
}
