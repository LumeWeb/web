import type { OPTGenerateResponse } from "@/dataProviders/auth";

import { Identity } from "@lumeweb/portal-framework-core";
import {
  Button,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@lumeweb/portal-framework-ui-core";
import { useApiUrl, usePortalMeta } from "@lumeweb/portal-framework-ui";
import {
  useCustomMutation,
  useGetIdentity,
  useInvalidateAuthStore,
  useNotification,
} from "@refinedev/core";
import { useStepsForm } from "@refinedev/react-hook-form";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import React, { useCallback, useEffect, useState } from "react";

export default function SetupTwoFactorDialog({ close }: { close: () => void }) {
  const [otp, setOtp] = useState("");
  const [qrCodeSvg, setQrCodeSvg] = useState("");

  const apiUrl = useApiUrl();
  const form = useStepsForm();
  const invalidateAuth = useInvalidateAuthStore();
  const portalMeta = usePortalMeta();
  const identity = useGetIdentity<Identity>();

  const {
    steps: { currentStep, gotoStep },
  } = form;

  const { open } = useNotification();

  // @ts-ignore
  const { isLoading: isGeneratingOtp, mutate: generateOtp } =
    useCustomMutation<OPTGenerateResponse>();

  const generateNewOtp = useCallback(() => {
    generateOtp(
      {
        method: "post",
        url: `${apiUrl}/api/auth/otp/generate`,
        values: {},
      },
      {
        async onSuccess(data) {
          setOtp(data.data.otp);
          let totp = new OTPAuth.TOTP({
            // Provider or service the account is associated with.
            issuer: portalMeta?.domain,
            // Account identifier.
            label: `${portalMeta?.domain}:${identity.data?.email}`,
            secret: data.data.otp,
          });

          const svg = await QRCode.toString(totp.toString(), { type: "svg" });
          setQrCodeSvg(svg);
        },
      },
    );
  }, [generateOtp, apiUrl]);

  useEffect(() => {
    if (currentStep === 0) {
      generateNewOtp();
    }
  }, [currentStep, generateNewOtp]);

  // @ts-ignore
  const { isLoading: isVerifyingOtp, mutate: verifyOtp } = useCustomMutation();

  const handleVerifyOtp = (values: any) => {
    verifyOtp(
      {
        method: "post",
        url: `${apiUrl}/api/auth/otp/verify`,
        values,
      },
      {
        onError: (_error) => {
          open?.({
            description: "Please check the code and try again.",
            message: "OTP verification failed",
            type: "error",
          });
        },
        onSuccess: (_data) => {
          open?.({
            description: "Your account is now more secure.",
            message: "Two-factor authentication setup successful!",
            type: "success",
          });
          invalidateAuth();
          close();
        },
      },
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form {...form}>
            <form
              className="space-y-8"
              onSubmit={(e) => {
                e.preventDefault();
                gotoStep(1);
              }}>
              <FormItem>
                <div className="p-6 flex justify-center border bg-secondary-2">
                  {qrCodeSvg && (
                    <div
                      className="w-3/4"
                      dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                    />
                  )}
                </div>
                <FormDescription className="font-semibold">
                  Don&apos;t have access to scan? Use this code instead.
                </FormDescription>
                <FormControl>
                  <div className="p-4 border text-center font-bold">
                    {otp || "Loading..."}
                  </div>
                </FormControl>
              </FormItem>
              <Button
                className="w-full h-14"
                disabled={isGeneratingOtp}
                type="submit">
                Continue
              </Button>
            </form>
          </Form>
        );
      case 1:
        return (
          <Form {...form}>
            <form
              className="space-y-8"
              onSubmit={form.handleSubmit(handleVerifyOtp)}>
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Authentication Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter OTP" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the authentication code generated in your two-factor
                      application to confirm your setup.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                className="w-full h-14"
                disabled={isVerifyingOtp}
                type="submit">
                Confirm
              </Button>
              <Button
                className="w-full h-14 mt-2"
                onClick={() => gotoStep(0)}
                type="button"
                variant="outline">
                Back
              </Button>
            </form>
          </Form>
        );
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="mb-8">Setup Two-Factor</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-y-6">{renderStep()}</div>
    </>
  );
}
