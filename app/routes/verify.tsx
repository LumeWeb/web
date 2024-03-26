import type { MetaFunction } from "@remix-run/node";
import { Link, useSearchParams } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import logoPng from "~/images/lume-logo.png?url";
import lumeColorLogoPng from "~/images/lume-color-logo.png?url";
import discordLogoPng from "~/images/discord-logo.png?url";
import lumeBgPng from "~/images/lume-bg-image.png?url";
import { Field } from "~/components/forms";
import { getFormProps, useForm } from "@conform-to/react";
import { z } from "zod";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { ToastAction } from "~/components/ui/toast";
import { useGo, useNotification } from "@refinedev/core";
import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

export const meta: MetaFunction = () => {
  return [{ title: "Verify Email" }];
};

export default function Verify() {
  const go = useGo();
  const {open} = useNotification();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const exchangeToken = useQuery({
    queryKey: ["exchange-token", token],
    queryFn: () => {
      // TODO: api call to exchange token goes here
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 5000);
      });
    },
  });

  const verifyAgain = useMutation({
    mutationFn: () => {
      // TODO: api call to verify again goes here
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 5000);
      });
    },
    onMutate() {
        open?.({
            type: "success",
            message: "Email sent",
            description: "Please check your email inbox and click the link",
        })
    }
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
          {exchangeToken.isLoading
            ? "Verifying your email." : null}

         {exchangeToken.isSuccess && !exchangeToken.isLoading ? "Your email has been verified" : null}
         {exchangeToken.isError && !exchangeToken.isLoading ? "Something went wrong, please try again" : null}
        </h1>
        {exchangeToken.isError ? (
            <div>
                <p className="opacity-60">{exchangeToken.error.message}</p>
                <Button onClick={() => {
                    verifyAgain.mutate()
                }}>
                    Send verification email again
                </Button>
            </div>
        ) : null}
        {exchangeToken.isSuccess ? <p className="opacity-60">Redirecting to your dashboard</p> : null}
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
