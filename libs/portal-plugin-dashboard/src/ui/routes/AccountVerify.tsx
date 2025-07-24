import { type Identity } from "@lumeweb/portal-framework-core";
import { Button } from "@lumeweb/portal-framework-ui-core";
import { logoPng, lumeBgPng } from "@lumeweb/portal-framework-ui/images";

import { useSdk } from "@lumeweb/portal-framework-ui";
import { Sdk } from "@lumeweb/portal-sdk";
import { useGetIdentity, useGo, useIsAuthenticated } from "@refinedev/core";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { useEmailVerification } from "src/ui/hooks/useEmailVerification";

function AccountVerify() {
  const go = useGo();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const sdk = useSdk() as Sdk;
  const user = useGetIdentity<Identity>();
  const [isVerified, setIsVerified] = useState(false);
  const {
    alreadyVerified,
    isLoading: isResendingVerification,
    resendVerification,
  } = useEmailVerification();
  const { data: isAuthenticated, isLoading: isAuthLoading } =
    useIsAuthenticated();
  const userEmail = user.data?.email || email;

  const exchangeToken = useQuery({
    enabled: !isAuthLoading && !!userEmail && !!token,
    queryFn: async () => {
      const ret = await sdk.account!().verifyEmail({
        email: userEmail as string,
        token: token!,
      });

      if (ret instanceof Error) {
        return Promise.reject(ret);
      }

      setIsVerified(true);
      return ret;
    },
    queryKey: ["exchange-token", token],
    retry: false,
  });

  const handleRedirect = () => {
    if (isAuthenticated) {
      go({ to: "/dashboard" });
    } else {
      go({ to: "/login" });
    }
  };

  useEffect(() => {
    if (alreadyVerified) {
      setIsVerified(true);
    }
  }, [alreadyVerified]);

  if (isAuthLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-10 h-screen relative">
      <header>
        <img alt="Lume logo" className="h-10" src={logoPng} />
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
              disabled={isResendingVerification}
              onClick={resendVerification}>
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
            <Button onClick={handleRedirect}>
              {isAuthenticated ? "Go to Dashboard" : "Go to Login"}
            </Button>
          </div>
        )}
      </main>
      <div className="fixed inset-0 -z-10 overflow-clip">
        <img
          alt="Lume background"
          className="absolute top-0 left-0 right-0 object-cover z-[-1]"
          src={lumeBgPng}
        />
      </div>
    </div>
  );
}

export default AccountVerify;
