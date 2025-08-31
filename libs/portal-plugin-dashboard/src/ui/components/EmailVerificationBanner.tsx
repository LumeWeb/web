import { Identity, useFramework } from "@lumeweb/portal-framework-core";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
} from "@lumeweb/portal-framework-ui-core";
import { useGetIdentity } from "@refinedev/core";
import { Loader2, Mail } from "lucide-react";
import React from "react";

import { useEmailVerification } from "@/ui/hooks/useEmailVerification";

function EmailVerificationBanner() {
  const { getAppName } = useFramework();
  const { data: identity } = useGetIdentity<Identity>();
  const { isLoading, resendVerification } = useEmailVerification();

  if (getAppName() != "dashboard") {
    return null;
  }
  if (!identity) {
    return null;
  }

  if (!identity?.verified) {
    return (
      <Alert className="bg-secondary text-foreground mb-4" variant="default">
        <Mail className="h-4 w-4" />
        <AlertTitle>Verify Your Email</AlertTitle>
        <AlertDescription className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <span className="mb-2 sm:mb-0">
            We&apos;ve sent you a verification email. Please click the link to
            start using the platform.
          </span>
          <Button
            className="self-start sm:self-center"
            disabled={isLoading}
            onClick={resendVerification}
            size="sm"
            variant="outline">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Resend Verification Email"
            )}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

export default EmailVerificationBanner;
