import type { Identity } from "@lumeweb/portal-framework-core";

import { DATA_PROVIDER_NAME } from "@lumeweb/portal-framework-auth";
import { useDialog } from "@lumeweb/portal-framework-ui";
import { Button, lazyIcon } from "@lumeweb/portal-framework-ui-core";
import { OTPDisableRequest, OTPVerifyRequest } from "@lumeweb/portal-sdk";
import {
  useCustomMutation,
  useGetIdentity,
  useInvalidateAuthStore,
} from "@refinedev/core";

import { Card } from "@/ui/components/Card";
import { disable2faDialogConfig } from "@/ui/dialogs/disable2fa";
import { enable2faDialogConfig } from "@/ui/dialogs/enable2fa";
import { OTPDisableHandler } from "@/ui/forms/disable2fa";
import { OTPEnableHandler } from "@/ui/forms/enable2fa";
const Smartphone = lazyIcon("Smartphone");


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
    <Card
      border
      description="Add an extra layer of security to your account"
      icon={Smartphone}
      title="Two-Factor Authentication">
      <Button
        className="h-11 w-full whitespace-normal md:h-9 md:whitespace-nowrap"
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
    </Card>
  );
}
