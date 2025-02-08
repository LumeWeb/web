import { Identity } from "@lumeweb/portal-framework-core";
import { useSdk } from "@lumeweb/portal-framework-ui";
import { Sdk } from "@lumeweb/portal-sdk";
import { useGetIdentity, useNotification } from "@refinedev/core";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

export function useEmailVerification() {
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
      open?.({
        description: "Please try again later",
        message: "Failed to send email",
        type: "error",
      });
    },
    onSuccess() {
      open?.({
        description: "Please check your email inbox and click the link",
        message: "Email sent",
        type: "success",
      });
    },
  });

  const handleResendVerification = async () => verifyAgain.mutate();

  return {
    alreadyVerified,
    isLoading: verifyAgain.isPending || user.isLoading,
    resendVerification: handleResendVerification,
  };
}
