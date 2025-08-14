import type { Identity } from "@lumeweb/portal-framework-core";

import { DATA_PROVIDER_NAME, OTPEnableHandler } from "@lumeweb/portal-framework-auth";
import { useDialog } from "@lumeweb/portal-framework-ui";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lumeweb/portal-framework-ui-core";
import { OTPDisableRequest, OTPVerifyRequest } from "@lumeweb/portal-sdk";
import {
  useCustomMutation,
  useGetIdentity,
  useInvalidateAuthStore,
} from "@refinedev/core";
import { Smartphone } from "lucide-react";

import { disable2faDialogConfig } from "@/ui/dialogs/disable2fa";
import { enable2faDialogConfig } from "@/ui/dialogs/enable2fa";

export default function TwoFA() {
  const { openDialog } = useDialog();
  const { data: identity } = useGetIdentity<Identity>();
  const { mutateAsync: verifyOtp } = useCustomMutation<OTPVerifyRequest>();
  const { mutateAsync: disableOtp } = useCustomMutation<OTPDisableRequest>({});
  const invalidateAuth = useInvalidateAuthStore();

  const handleDisableOtp: OTPDisableHandler = (data: OTPDisableRequest) => {
    return disableOtp({
      dataProviderName: DATA_PROVIDER_NAME,
      errorNotification: {
        description: "Failed to disable two-factor authentication", 
        message: "Error",
        type: "error",
      },
      method: "post",
      successNotification: {
        description: "Two-factor authentication has been disabled",
        message: "Success",
        type: "success",
      },
      url: `/auth/otp/disable`,
      values: data,
    });
  };

  const handleVerifyOtp: OTPEnableHandler = (values: OTPVerifyRequest) => {
    return verifyOtp({
      dataProviderName: DATA_PROVIDER_NAME,
      errorNotification: {
        description: "Please check the code and try again.",
        message: "OTP verification failed",
        type: "error",
      },
      method: "post",
      successNotification: {
        description: "Your account is now more secure.",
        message: "Two-factor authentication setup successful!",
        type: "success",
      },
      url: `/auth/otp/verify`,
      values,
    });
  };
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-primary" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          className="w-full"
          onClick={(e) => {
            e.preventDefault();
            openDialog(
              identity?.otp
                ? disable2faDialogConfig(handleDisableOtp, invalidateAuth)
                : enable2faDialogConfig(handleVerifyOtp, invalidateAuth),
            );
          }}>
          {identity?.otp && "Disable Two-Factor Authorization"}
          {!identity?.otp && "Enable Two-Factor Authentication"}
        </Button>
      </CardContent>
    </Card>
  );
}
