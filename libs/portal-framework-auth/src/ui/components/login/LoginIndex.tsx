import {
  useFeatureFlag,
  useRegisterUrl,
  withTheme,
} from "@lumeweb/portal-framework-ui";
import React, { lazy, Suspense } from "react";
import { useSearchParams } from "react-router";

import { useBrand } from "@lumeweb/portal-framework-core";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";
import { AuthConsentNotice } from "@/ui/components/common/AuthConsentNotice";
import { AuthPage } from "@/ui/components/common/AuthPage";
import { AuthPageTitle } from "@/ui/components/common/AuthPageTitle";

import { LoginForm } from "./LoginForm";
import { resolveLoginErrorNotice } from "./loginErrorNotice";
import { SocialLogin } from "./SocialLogin";

// Dynamically imported so the viem/wagmi dependency tree (and the
// wagmi config singleton that triggers EIP-6963 discovery) only loads when
// the wallet_login flag is actually on — prod never pays for it.
const WalletLogin = lazy(() => import("@/ui/components/common/WalletLogin"));

function LoginIndex() {
  // Renders only when the social_login flag is set AND the dashboard reports
  // at least one enabled provider (AuthProviders renders null otherwise).
  const socialLoginEnabled = useFeatureFlag("social_login");
  // Wallet (SIWX) login is gated by its own flag — default OFF so the option
  // stays invisible until the backend wallet endpoints + meta land.
  const walletLoginEnabled = useFeatureFlag("wallet_login");
  const registerUrl = useRegisterUrl();
  const [searchParams] = useSearchParams();
  const brand = useBrand();

  const to = searchParams.get("to");
  const registerUrlWithTo = to
    ? `${registerUrl}?to=${encodeURIComponent(to)}`
    : registerUrl;

  // Deep-linkable SSO error surface (same once-decoded reading style as the
  // `to` param handling). Unknown error values produce no notice at all.
  const errorNotice = resolveLoginErrorNotice(
    searchParams.get("error"),
    searchParams.get("provider"),
  );

  useRedirectIfAuthenticated("/dashboard", to);

  return (
    <AuthPage
      beforeLink={
        <>
          <AuthPageTitle>Welcome back!</AuthPageTitle>
          {errorNotice && (
            <div
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert">
              {errorNotice}
            </div>
          )}
        </>
      }
      brand={brand}
      linkLabel="New user?"
      linkText="Create an account →"
      linkUrl={registerUrlWithTo}
      variant="login">
      {walletLoginEnabled && (
        <div className="mb-5 w-full">
          <Suspense fallback={null}>
            <WalletLogin />
          </Suspense>
          {/* Wallet sign-in has no consent checkbox, so the wallet slot
              carries the ToS/Privacy disclosure when the social slot won't
              render one. With the social flag on, AuthProviders owns the
              single shared AuthConsentNotice even if no providers are live. */}
          {!socialLoginEnabled && <AuthConsentNotice className="mt-4" />}
        </div>
      )}
      {socialLoginEnabled && (
        <div className="mb-5 w-full">
          <SocialLogin />
        </div>
      )}
      <LoginForm />
    </AuthPage>
  );
}

export default withTheme(LoginIndex);
