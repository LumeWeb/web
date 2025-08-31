import { type Identity } from "@lumeweb/portal-framework-core";
import { useSdk, withTheme } from "@lumeweb/portal-framework-ui";
import { Button } from "@lumeweb/portal-framework-ui-core";
import { logoPng, lumeBgPng } from "@lumeweb/portal-framework-ui/images";
import { useGetIdentity, useGo, useIsAuthenticated } from "@refinedev/core";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { useEmailVerification } from "src/ui/hooks/useEmailVerification";

interface VerificationStatusProps {
  alreadyVerified: boolean;
  error?: unknown;
  isAuthenticated?: boolean;
  isError: boolean;
  isLoading: boolean;
  isResendingVerification: boolean;
  isVerified: boolean;
  onRedirect: () => void;
  onResend: () => void;
}

const VerificationStatus = ({
  alreadyVerified,
  error,
  isAuthenticated,
  isError,
  isLoading,
  isResendingVerification,
  isVerified,
  onRedirect,
  onResend,
}: VerificationStatusProps) => {
  if (isLoading && !alreadyVerified) {
    return <VerificationLoading />;
  }
  if (isVerified && !alreadyVerified) {
    return (
      <NewVerificationSuccess
        isAuthenticated={isAuthenticated}
        onRedirect={onRedirect}
      />
    );
  }
  if (alreadyVerified) {
    return (
      <AlreadyVerified
        isAuthenticated={isAuthenticated}
        onRedirect={onRedirect}
      />
    );
  }
  if (isError) {
    return (
      <VerificationError
        error={error}
        isResending={isResendingVerification}
        onResend={onResend}
      />
    );
  }
  return <VerificationDefault onResend={onResend} />;
};

const VerificationLoading = () => (
  <div className="flex flex-col items-center">
    <h1 className="mb-4 text-2xl">Verifying your email</h1>
    <p className="opacity-60">Please wait while we verify your email...</p>
  </div>
);

const NewVerificationSuccess = ({
  isAuthenticated,
  onRedirect,
}: {
  isAuthenticated?: boolean;
  onRedirect: () => void;
}) => (
  <div className="flex flex-col items-center">
    <h1 className="mb-4 text-2xl">Your email has been verified</h1>
    <p className="mb-4 opacity-60">
      Your email has been verified successfully.
    </p>
    <Button onClick={onRedirect}>
      {isAuthenticated ? "Go to Dashboard" : "Go to Login"}
    </Button>
  </div>
);

const AlreadyVerified = ({
  isAuthenticated,
  onRedirect,
}: {
  isAuthenticated?: boolean;
  onRedirect: () => void;
}) => (
  <div className="flex flex-col items-center">
    <h1 className="mb-4 text-2xl">Email already verified</h1>
    <p className="mb-4 opacity-60">This email address was already verified.</p>
    <Button onClick={onRedirect}>
      {isAuthenticated ? "Go to Dashboard" : "Go to Login"}
    </Button>
  </div>
);

const VerificationError = ({
  error,
  isResending,
  onResend,
}: {
  error?: unknown;
  isResending: boolean;
  onResend: () => void;
}) => (
  <div className="flex flex-col items-center">
    <h1 className="mb-4 text-2xl">Something went wrong</h1>
    <p className="mb-4 opacity-60">
      {typeof error === "string"
        ? error
        : ((error as any)?.message ?? "An unexpected error occurred")}
    </p>
    <Button disabled={isResending} onClick={onResend}>
      {isResending ? "Sending..." : "Send verification email again"}
    </Button>
  </div>
);

const VerificationDefault = ({ onResend }: { onResend: () => void }) => (
  <div className="flex flex-col items-center">
    <h1 className="mb-4 text-2xl">Verify your email</h1>
    <p className="mb-4 opacity-60">
      Click below to receive a new verification email
    </p>
    <Button onClick={onResend}>Send verification email</Button>
  </div>
);

const MissingParametersError = ({
  email,
  onResend,
  token,
}: {
  email: null | string;
  onResend: () => void;
  token: null | string;
}) => {
  const go = useGo();

  let message = "The verification link is missing required information.";
  if (!email && !token) {
    message =
      "The verification link is missing both email and verification code.";
  } else if (!email) {
    message = "The verification link is missing the email address.";
  } else if (!token) {
    message = "The verification link is missing the verification code.";
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="mb-4 text-2xl">Invalid verification link</h1>
      <p className="mb-4 opacity-60">{message}</p>
      {!token && email ? (
        <Button onClick={onResend}>Resend Verification Email</Button>
      ) : (
        <Button onClick={() => go({ to: "/dashboard" })}>
          Go to Dashboard
        </Button>
      )}
    </div>
  );
};

function AccountVerify() {
  const go = useGo();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const sdk = useSdk()!;
  const user = useGetIdentity<Identity>();
  const [isVerified, setIsVerified] = useState(false);
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const {
    alreadyVerified: emailAlreadyVerified,
    isLoading: isResendingVerification,
    resendVerification,
  } = useEmailVerification();

  useEffect(() => {
    if (emailAlreadyVerified) {
      setAlreadyVerified(true);
    }
  }, [emailAlreadyVerified]);
  const {
    data: isAuthenticated,
    isLoading: isAuthLoading,
    refetch: refetchAuth,
  } = useIsAuthenticated();
  const userEmail = email || user.data?.email;

  const exchangeToken = useQuery({
    enabled:
      !isAuthLoading &&
      !!userEmail &&
      !!token &&
      !alreadyVerified &&
      !emailAlreadyVerified,
    queryFn: async () => {
      const ret = await sdk.account().verifyEmail({
        email: userEmail!,
        token: token!,
      }, true);

      if (ret.error) {
        // Handle 409 Conflict as "already verified"
        if (ret.error.statusCode === 409) {
          setAlreadyVerified(true);
          return ret;
        }
        return Promise.reject(ret.error);
      }

      setIsVerified(true);
      // Ensure SDK token and UI auth state are up-to-date post auto-login
      await Promise.all([sdk.account().ping(), refetchAuth()]);
      setAlreadyVerified(false);
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
  if (isAuthLoading) {
    return <div>Loading...</div>;
  }

  if (!userEmail || !token) {
    return (
      <div className="relative h-screen p-10">
        <header>
          <img alt="Lume logo" className="h-10" src={logoPng} />
        </header>
        <main className="flex h-full flex-col items-center justify-center">
          <MissingParametersError
            email={userEmail}
            onResend={resendVerification}
            token={token}
          />
        </main>
        <div className="fixed inset-0 -z-10 overflow-clip">
          <img
            alt="Lume background"
            className="absolute left-0 right-0 top-0 z-[-1] object-cover"
            src={lumeBgPng}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen p-10">
      <header>
        <img alt="Lume logo" className="h-10" src={logoPng} />
      </header>
      <main className="flex h-full flex-col items-center justify-center">
        <VerificationStatus
          alreadyVerified={alreadyVerified}
          error={exchangeToken.error}
          isAuthenticated={isAuthenticated}
          isError={exchangeToken.isError}
          isLoading={exchangeToken.isLoading}
          isResendingVerification={isResendingVerification}
          isVerified={isVerified}
          onRedirect={handleRedirect}
          onResend={resendVerification}
        />
      </main>
      <div className="fixed inset-0 -z-10 overflow-clip">
        <img
          alt="Lume background"
          className="absolute left-0 right-0 top-0 z-[-1] object-cover"
          src={lumeBgPng}
        />
      </div>
    </div>
  );
}

export default withTheme(AccountVerify);
