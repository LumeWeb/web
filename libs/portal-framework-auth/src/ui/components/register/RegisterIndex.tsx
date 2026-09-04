import {
  SchemaForm,
  useFeatureFlag,
  useLoginUrl,
  withTheme,
} from "@lumeweb/portal-framework-ui";
import { useRegister } from "@refinedev/core";
import { lazy, Suspense } from "react";
import { useSearchParams } from "react-router";

import { useBrand } from "@lumeweb/portal-framework-core";
import { RegisterFormRequest } from "@/dataProviders/auth";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";
import { AuthConsentNotice } from "@/ui/components/common/AuthConsentNotice";
import { AuthPage } from "@/ui/components/common/AuthPage";
import { AuthProviders } from "@/ui/components/common/AuthProviders";
import { AuthPageTitle } from "@/ui/components/common/AuthPageTitle";
import { getRegisterForm } from "@/ui/forms/register";

// Dynamically imported so the viem/wagmi dependency tree (and the
// wagmi config singleton that triggers EIP-6963 discovery) only loads when
// the wallet_login flag is actually on — prod never pays for it.
const WalletLogin = lazy(() => import("@/ui/components/common/WalletLogin"));

function RegisterIndex() {
  // Same social slot as login — only when the social_login flag is set AND
  // the dashboard reports at least one enabled provider (AuthProviders
  // renders null otherwise). Placed above the email form fields.
  const socialLoginEnabled = useFeatureFlag("social_login");
  // Wallet (SIWX) login is gated by its own flag — default OFF so the option
  // stays invisible until the backend wallet endpoints + meta land.
  const walletLoginEnabled = useFeatureFlag("wallet_login");
  const register = useRegister<RegisterFormRequest>();
  const loginUrl = useLoginUrl();
  const [searchParams] = useSearchParams();
  const brand = useBrand();

  const to = searchParams.get("to");
  const loginUrlWithTo = to
    ? `${loginUrl}?to=${encodeURIComponent(to)}`
    : loginUrl;

  useRedirectIfAuthenticated("/dashboard", to);

  const onSubmit = async (values: any) => {
    await register.mutateAsync({
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      password: values.password,
      redirectTo: to ?? undefined,
    });
  };

  const finalRegisterFormConfig = getRegisterForm(onSubmit, brand);

  return (
    <AuthPage
      beforeLink={
        <>
          <AuthPageTitle>Create your account</AuthPageTitle>
          <p className="mb-5 text-sm text-muted-foreground">
            We'll create your account if you don't have one.
          </p>
        </>
      }
      brand={brand}
      linkLabel="Already have an account?"
      linkText="Login here →"
      linkUrl={loginUrlWithTo}
      variant="register">
      {walletLoginEnabled && (
        <div className="mb-5 w-full">
          <Suspense fallback={null}>
            <WalletLogin />
          </Suspense>
          {/* Wallet sign-in bypasses the register form's consent checkbox;
              when the social slot won't render the shared AuthConsentNotice
              (social flag off), the wallet slot carries it here instead —
              never both (AuthProviders renders the only copy otherwise). */}
          {!socialLoginEnabled && <AuthConsentNotice className="mt-4" />}
        </div>
      )}
      {socialLoginEnabled && (
        <div className="mb-5 w-full">
          <AuthProviders dividerLabel="Or continue with email" />
        </div>
      )}
      <SchemaForm config={finalRegisterFormConfig} />
    </AuthPage>
  );
}

export default withTheme(RegisterIndex);
