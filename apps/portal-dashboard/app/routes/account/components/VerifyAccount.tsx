import { useSearchParams } from "@remix-run/react";
import { Button } from "@/components/ui/button.js";
import { useGetIdentity, useGo } from "@refinedev/core";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Identity } from "@/dataProviders/authProvider";
import logoPng from "@/images/lume-logo.png?url";
import lumeBgPng from "@/images/lume-bg-image.png?url";
import useSdk from "@/hooks/useSdk";
import { Sdk } from "@lumeweb/portal-sdk";
import useEmailVerification from "@/hooks/useEmailVerification";

export default function VerifyAuthenticated() {
  const go = useGo();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const sdk = useSdk() as Sdk;
  const user = useGetIdentity<Identity>();
  const [isVerified, setIsVerified] = useState(false);
  const {
    resendVerification,
    isLoading: isResendingVerification,
    alreadyVerified,
  } = useEmailVerification();

  const exchangeToken = useQuery({
    queryKey: ["exchange-token", token],
    retry: false,
    enabled: !!user.data?.email && !!token,
    queryFn: async () => {
      const ret = await sdk.account!().verifyEmail({
        email: user.data?.email as string,
        token: token!,
      });

      if (ret instanceof Error) {
        return Promise.reject(ret);
      }

      setIsVerified(true);
      return ret;
    },
  });

  const handleGoToDashboard = () => {
    go({ to: "/dashboard" });
  };

  useEffect(() => {
    if (alreadyVerified) {
      setIsVerified(true);
    }
  }, [alreadyVerified]);

  return (
    <div className="p-10 h-screen relative">
      <header>
        <img src={logoPng} alt="Lume logo" className="h-10" />
      </header>
      <main className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl mb-4">
          {exchangeToken.isLoading ? "Verifying your email." : null}
          {isVerified ? "Your email has been verified" : null}
          {!isVerified && exchangeToken.isError
            ? "Something went wrong, please try again"
            : null}
        </h1>
        {!isVerified && exchangeToken.isError && (
          <div className="flex flex-col items-center">
            <p className="opacity-60 mb-4">{exchangeToken.error.message}</p>
            <Button
              onClick={resendVerification}
              disabled={isResendingVerification}>
              {isResendingVerification
                ? "Sending..."
                : "Send verification email again"}
            </Button>
          </div>
        )}
        {isVerified && (
          <div className="flex flex-col items-center">
            <p className="opacity-60 mb-4">
              Your email has been verified successfully.
            </p>
            <Button onClick={handleGoToDashboard}>Go to Dashboard</Button>
          </div>
        )}
      </main>
      <div className="fixed inset-0 -z-10 overflow-clip">
        <img
          src={lumeBgPng}
          alt="Lume background"
          className="absolute top-0 left-0 right-0 object-cover z-[-1]"
        />
      </div>
    </div>
  );
}
