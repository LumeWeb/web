import { OTPGenerateResponse } from "@lumeweb/portal-framework-auth";
import { Identity } from "@lumeweb/portal-framework-core";
import {
  FormFieldType,
  type StepFormConfig,
  useFormContext,
  usePortalMeta,
} from "@lumeweb/portal-framework-ui";
import { OTPVerifyRequest } from "@lumeweb/portal-sdk";
import {
  CreateResponse,
  useCustomMutation,
  useGetIdentity,
} from "@refinedev/core";
import * as OTPAuth from "otpauth";
import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect } from "react";
import { z } from "zod";
export type { Enable2faFormValues as FormValues } from "./enable2fa.schema";

export type InvalidateAuthHandler = () => Promise<void>;

export type OTPEnableHandler = (
  values: OTPVerifyRequest,
) => Promise<CreateResponse<OTPVerifyRequest>>;

interface QRCodeProps {
  name: string;
  value: string;
}
export function enable2faForm(
  otpHandler: OTPEnableHandler,
  invalidateAuth: InvalidateAuthHandler,
): StepFormConfig {
  return {
    steps: [
      {
        fields: [
          {
            component: QRCode,
            description:
              "Dont have access to scan? Use the above code instead.",
            name: "qrcode",
            type: FormFieldType.CUSTOM,
          },
        ],
        title: "Scan QR Code",
      },
      {
        fields: [
          {
            description:
              "Enter the authentication code generated in your two-factor application to confirm your setup.",
            label: "Authentication Code",
            name: "otp",
            placeholder: "Enter OTP",
            required: true,
            type: FormFieldType.TEXT,
          },
        ],
        async onStepSubmit(data) {
          return otpHandler(data);
        },
        async onStepSuccess() {
          await invalidateAuth();
        },
        title: "Enter QR Code",

        validationSchema: z.object({
          otp: z.string().min(6, "OTP must be at least 6 characters"),
        }),
      },
    ],
  };
}

// Module-level state
let generatedOtpCache: null | string = null;

const QRCodeComponent = ({ name, value }: QRCodeProps) => {
  const portalMeta = usePortalMeta();
  const identity = useGetIdentity<Identity>();
  const formContext = useFormContext();
  const { isLoading: isGeneratingOtp, mutate: generateOtp } =
    useCustomMutation<OTPGenerateResponse>({
      mutationOptions: {},
    });

  const generateOtpCallback = useCallback(() => {
    generateOtp(
      {
        dataProviderName: "account",
        method: "post",
        url: `/auth/otp/generate`,
        values: {},
      },
      {
        onSuccess(data) {
          const otp = data.data.otp;
          generatedOtpCache = otp;
          formContext.formInstance.setValue(name, otp);
        },
      },
    );
  }, [generateOtp, formContext.formInstance, name]);

  useEffect(() => {
    if (!generatedOtpCache) {
      generateOtpCallback();
    }

    return () => {
      generatedOtpCache = null;
    };
  }, [name]);

  if (isGeneratingOtp || !generatedOtpCache) {
    return null;
  }

  return (
    <>
      <QRCodeSVG
        className={"mx-auto"}
        size={256}
        value={new OTPAuth.TOTP({
          issuer: portalMeta?.domain,
          label: `${portalMeta?.domain}:${identity.data?.email}`,
          secret: generatedOtpCache,
        }).toString()}
      />
      <div className="border p-4 text-center font-bold">
        {generatedOtpCache}
      </div>
    </>
  );
};

const QRCode = (props: QRCodeProps) => <QRCodeComponent {...props} />;
