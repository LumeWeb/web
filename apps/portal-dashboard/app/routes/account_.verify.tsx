import {
  Authenticated,
  HttpError,
  useGetIdentity,
  useGo,
  useNotification,
} from "@refinedev/core";
import type { MetaFunction } from "@remix-run/node";
import { useSearchParams } from "@remix-run/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSdk } from "~/components/lib/sdk-context.js";
import { Button } from "~/components/ui/button.js";
import type { Identity } from "~/data/auth-provider.js";
import lumeBgPng from "~/images/lume-bg-image.png?url";
import logoPng from "~/images/lume-logo.png?url";

export const meta: MetaFunction = () => {
  return [{ title: "Verify Email" }];
};

export default function Verify() {
  return (
    <Authenticated v3LegacyAuthProviderCompatible key={""}>
      <VerifyAuthenticated />
    </Authenticated>
  );
}

function VerifyAuthenticated() {
  const go = useGo();
  const { open } = useNotification();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const sdk = useSdk();
  const user = useGetIdentity<Identity>();

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

      return ret;
    },
  });

  const verifyAgain = useMutation({
    mutationFn: () => {
      return sdk.account!().requestEmailVerification();
    },
    onMutate() {
      open?.({
        type: "success",
        message: "Email sent",
        description: "Please check your email inbox and click the link",
      });
    },
  });

  useEffect(() => {
    if (exchangeToken.isSuccess) {
      go({ to: "/dashboard" });
    }
  }, [go, exchangeToken.isSuccess]);

  return (
    <div className="p-10 h-screen relative">
      <header>
        <img src={logoPng} alt="Lume logo" className="h-10" />
      </header>
      <main className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl">
          {exchangeToken.isLoading ? "Verifying your email." : null}

          {exchangeToken.isSuccess && !exchangeToken.isLoading
            ? "Your email has been verified"
            : null}
          {exchangeToken.isError && !exchangeToken.isLoading
            ? "Something went wrong, please try again"
            : null}
        </h1>
        {exchangeToken.isError ? (
          <div className="flex flex-col gap-2 my-4 w-full max-w-md">
            <p className="opacity-60">{exchangeToken.error.message}</p>
            <Button
              onClick={() => {
                verifyAgain.mutate();
              }}>
              Send verification email again
            </Button>
          </div>
        ) : null}
        {exchangeToken.isSuccess ? (
          <p className="opacity-60">Redirecting to your dashboard</p>
        ) : null}
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
