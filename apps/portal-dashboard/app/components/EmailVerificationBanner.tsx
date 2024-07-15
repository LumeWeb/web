import { useGetIdentity } from "@refinedev/core";
import { Identity } from "portal-shared/dataProviders/authProvider";
import useEmailVerification from "@/hooks/useEmailVerification.js";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "portal-shared/components/ui/alert";
import { Mail } from "lucide-react";
import { Button } from "portal-shared/components/ui/button.js";

export default function EmailVerificationBanner() {
  const { data: identity } = useGetIdentity<Identity>();
  const { resendVerification, isLoading } = useEmailVerification();

  if (!identity) {
    return null;
  }

  if (!identity?.verified) {
    return (
      <Alert variant="default" className="bg-secondary text-foreground mb-4">
        <Mail className="h-4 w-4" />
        <AlertTitle>Verify Your Email</AlertTitle>
        <AlertDescription className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <span className="mb-2 sm:mb-0">
            We've sent you a verification email. Please click the link to start
            using the platform.
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={resendVerification}
            disabled={isLoading}
            className="self-start sm:self-center">
            {isLoading ? "Sending..." : "Resend Verification Email"}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
