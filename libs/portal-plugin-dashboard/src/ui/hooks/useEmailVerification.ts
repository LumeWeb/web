import { Identity } from "@lumeweb/portal-framework-core";
import { useSdk } from "@lumeweb/portal-framework-ui";
import { useGetIdentity, useNotification } from "@refinedev/core";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

export function useEmailVerification() {
  const sdk = useSdk();
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
      const emailToVerify = user.data?.email ?? email;

      if (!emailToVerify) {
        open?.({
          description: "No email address found",
          message: "Email verification failed",
          type: "error",
        });
        return;
      }

      try {
        const ret = await sdk.account().requestEmailVerification({
          email: emailToVerify,
        });

        if (ret instanceof Error) {
          throw ret;
        }
      } catch (error) {
        open?.({
          description: "Please try again later",
          message: "Failed to send email",
          type: "error",
        });
        throw error;
      }
    },
    onError(error) {
      if (error?.toString().toLowerCase().includes("already verified")) {
        setAlreadyVerified(true);
        open?.({
          description: "You can now login",
          message: "Email already verified",
          type: "error",
        });
        return;
      }
      // Error notification is handled in mutationFn, so we don't need to show it again here
    },
    onSuccess() {
      open?.({
        description: "Please check your email inbox and click the link",
        message: "Email sent",
        type: "success",
      });
    },
  });

  if (!sdk) {
    return {};
  }

  const handleResendVerification = async () => verifyAgain.mutate();

  return {
    alreadyVerified,
    isLoading: verifyAgain.isLoading || user.isLoading,
    resendVerification: handleResendVerification,
  };
}
