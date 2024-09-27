import React, { useCallback, useEffect, useState } from "react";
import { useStepsForm } from "@refinedev/react-hook-form";
import {
  useCustomMutation,
  useGetIdentity,
  useInvalidateAuthStore,
  useNotification,
} from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import useApiUrl from "@/hooks/useApiUrl.js";
import { OPTGenerateResponse } from "@/dataProviders/accountProvider";
import QRCode from "qrcode";
import * as OTPAuth from "otpauth";
import usePortalMeta from "@/hooks/usePortalMeta";
import { Identity } from "@/dataProviders/authProvider";

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

  const { mutate: generateOtp, isLoading: isGeneratingOtp } =
    useCustomMutation<OPTGenerateResponse>();

  const generateNewOtp = useCallback(() => {
    generateOtp(
      {
        url: `${apiUrl}/api/auth/otp/generate`,
        method: "post",
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

  const { mutate: verifyOtp, isLoading: isVerifyingOtp } = useCustomMutation();

  const handleVerifyOtp = (values: any) => {
    verifyOtp(
      {
        url: `${apiUrl}/api/auth/otp/verify`,
        method: "post",
        values,
      },
      {
        onSuccess: (data) => {
          open?.({
            type: "success",
            message: "Two-factor authentication setup successful!",
            description: "Your account is now more secure.",
          });
          invalidateAuth();
          close();
        },
        onError: (error) => {
          open?.({
            type: "error",
            message: "OTP verification failed",
            description: "Please check the code and try again.",
          });
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
              onSubmit={(e) => {
                e.preventDefault();
                gotoStep(1);
              }}
              className="space-y-8">
              <FormItem>
                <div className="p-6 flex justify-center border bg-secondary-2">
                  {qrCodeSvg && (
                    <div
                      dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                      className="w-3/4"
                    />
                  )}
                </div>
                <FormDescription className="font-semibold">
                  Don't have access to scan? Use this code instead.
                </FormDescription>
                <FormControl>
                  <div className="p-4 border text-center font-bold">
                    {otp || "Loading..."}
                  </div>
                </FormControl>
              </FormItem>
              <Button
                type="submit"
                className="w-full h-14"
                disabled={isGeneratingOtp}>
                Continue
              </Button>
            </form>
          </Form>
        );
      case 1:
        return (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleVerifyOtp)}
              className="space-y-8">
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
                type="submit"
                className="w-full h-14"
                disabled={isVerifyingOtp}>
                Confirm
              </Button>
              <Button
                type="button"
                className="w-full h-14 mt-2"
                onClick={() => gotoStep(0)}
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
