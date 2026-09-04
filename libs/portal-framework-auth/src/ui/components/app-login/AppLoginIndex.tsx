import { useBrand } from "@lumeweb/portal-framework-core";
import { SchemaForm, useFeatureFlag } from "@lumeweb/portal-framework-ui";
import { Button, cn, Input, Label } from "@lumeweb/portal-framework-ui-core";
import { useRegister } from "@refinedev/core";
import { lazy, Suspense, useCallback, useState } from "react";
import { useSearchParams } from "react-router";

import type { RefineError } from "@refinedev/core";

import { type RegisterFormRequest } from "@/dataProviders/auth";
import { useNavigateToRedirect } from "@/hooks/useNavigateToRedirect";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";
import { useSafeLogin } from "@/hooks/useSafeLogin";
import { useSafeRedirectTarget } from "@/hooks/useSafeRedirectTarget";
import { SecurityNotice } from "@/ui/components/app-login/SecurityNotice";
import { AuthConsentNotice } from "@/ui/components/common/AuthConsentNotice";
import { AuthPage } from "@/ui/components/common/AuthPage";
import { AuthPageTitle } from "@/ui/components/common/AuthPageTitle";
import { SocialLogin } from "@/ui/components/login/SocialLogin";
import { getRegisterForm } from "@/ui/forms/register";

/** Register return target: current /app-login path + query minus the step
 * param, kept byte-identical so `to` is never re-encoded. */
const appLoginChainUrl = (): string =>
  window.location.pathname + stripStepParam(window.location.search);

type AppLoginStep = "login" | "register";

interface RegisterValues {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

/* ─── Page ─── */

function AppLoginIndex() {
  const [searchParams] = useSearchParams();
  const appName = searchParams.get("app") || "an application";

  const [step, setStep] = useState<AppLoginStep>(
    searchParams.get(STEP_PARAM) === "register" ? "register" : "login",
  );

  // Decode + sanitize `to` once here; both auth redirect and cancel use it.
  const { redirectTo } = useSafeRedirectTarget();

  useRedirectIfAuthenticated("/dashboard", redirectTo);

  // Toggles step and rewrites the raw search string via history.replaceState:
  // never via router navigation, which would re-encode `to`/`app` params.
  const setStepAndUrl = useCallback((next: AppLoginStep) => {
    setStep(next);
    const stripped = stripStepParam(window.location.search);
    const nextSearch =
      next === "register"
        ? `${stripped || "?"}${stripped ? "&" : ""}mode=register`
        : stripped;
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${nextSearch}`,
    );
  }, []);

  const brand = useBrand();

  return (
    <AuthPage
      appIdentity={{
        name: appName,
        requestedAction: `${appName} wants to connect to your account.`,
      }}
      beforeLink={
        <>
          <div className="flex items-center gap-2">
            <LockIcon />
            <span className="text-sm text-muted-foreground">
              Connect application
            </span>
          </div>
          {/* min-h reserves one spare title line: the register face wraps
              while the login face does not, and reservation keeps the toggle
              from shifting on step changes. */}
          <AuthPageTitle className="min-h-16" size="compact">
            {step === "register"
              ? `Create an account to connect ${appName}`
              : `Sign in to connect ${appName}`}
          </AuthPageTitle>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {step === "register"
              ? `Sign up in a few seconds, then connect ${appName} to your account.`
              : "Sign in to continue and review the requested access, or create an account to get started."}
          </p>
          <div className="mt-5">
            <StepToggle current={step} onChange={setStepAndUrl} />
          </div>
        </>
      }
      brand={brand}
      securityNotice={
        <>
          <div className="h-px bg-border/50" />
          <div className="pt-6">
            <SecurityNotice appName={appName} />
          </div>
        </>
      }
      variant="applogin">
      {/* Fixed-height step body: the login face (wallet + social + form)
          is taller than the register face; reserving its height keeps the
          page from shifting when the toggle swaps faces. */}
      <div className="flex min-h-[628px] flex-col">
        {step === "login" ? (
          <AppLoginStep appName={appName} />
        ) : (
          <AppRegisterStep brand={brand} />
        )}
      </div>
    </AuthPage>
  );
}

/* ─── Step 1: email/password login (+ flag-gated wallet/social slots) ─── */

function AppLoginStep({ appName }: { appName: string }) {
  // useParsed double-decodes `params.to`; useSafeRedirectTarget does not.
  const { redirectTo } = useSafeRedirectTarget();
  const navigateToRedirect = useNavigateToRedirect();
  const { isPending, mutate: login } = useSafeLogin();
  const socialLoginEnabled = useFeatureFlag("social_login");
  const walletLoginEnabled = useFeatureFlag("wallet_login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<null | string>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!email || !password) {
        setError("Please enter both email and password.");
        return;
      }

      // Destination is set by useSafeLogin's sanitized redirectTo handler;
      // this callback only surfaces errors.
      login(
        {
          email,
          password,
          redirectTo: redirectTo ?? "/dashboard",
          remember: false,
        },
        {
          onError: (err: Error | RefineError) => {
            const loginErr = err as {
              message?: string;
              response?: { data?: { message?: string } };
            };
            setError(
              loginErr?.response?.data?.message ||
                loginErr?.message ||
                "Login failed. Please check your credentials and try again.",
            );
          },
        },
      );
    },
    [email, password, redirectTo, login],
  );

  const handleCancel = useCallback(() => {
    // Terminal nav back to the requesting app; /onboarding is never valid
    // inside an app-login chain.
    if (redirectTo) {
      navigateToRedirect(redirectTo);
      return;
    }
    if (window.history.length > 1) {
      window.history.back();
    }
  }, [navigateToRedirect, redirectTo]);

  return (
    <>
      {/* Flag-gated slots; each reads `to` from the URL via its own hooks. */}
      {walletLoginEnabled && (
        <div className="mb-5 w-full">
          <Suspense fallback={null}>
            <WalletLogin />
          </Suspense>
          {/* Wallet sign-in bypasses any consent checkbox; when the social
              slot won't render the shared AuthConsentNotice (social flag
              off), the wallet slot carries it — at most one copy per page. */}
          {!socialLoginEnabled && <AuthConsentNotice className="mt-4" />}
        </div>
      )}
      {socialLoginEnabled && (
        <div className="mb-5 w-full">
          <SocialLogin />
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/20 p-3 text-center text-sm text-destructive-foreground">
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            autoComplete="username"
            fullWidth
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            type="email"
            value={email}
          />
        </div>

        <div className="space-y-2">
          <Label>Password</Label>
          <Input
            autoComplete="current-password"
            fullWidth
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            type="password"
            value={password}
          />
        </div>

        <div className="space-y-3 pt-2">
          <Button
            className="h-14 w-full rounded-xl bg-primary font-semibold text-base text-background transition-colors hover:bg-primary-1 hover:text-background disabled:opacity-60"
            disabled={isPending}
            type="submit">
            {isPending ? "Signing in…" : "Sign in and continue"}
          </Button>

          <Button
            className="h-14 w-full rounded-xl border-border font-semibold text-base text-primary transition-all hover:border-primary hover:bg-primary/5"
            onClick={handleCancel}
            type="button"
            variant="outline">
            Cancel and return to {appName}
          </Button>
        </div>
      </form>
    </>
  );
}

/* ─── Step 2: standard register form (shared schema + form config) ─── */

function AppRegisterStep({ brand }: { brand: ReturnType<typeof useBrand> }) {
  const register = useRegister<RegisterFormRequest>();

  const onSubmit = useCallback(
    async (values: RegisterValues) => {
      await register.mutateAsync({
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        password: values.password,
        // Return into this page's chain, not the raw external `to`, which
        // the auth provider would reroute through /login.
        redirectTo: appLoginChainUrl(),
      });
    },
    [register],
  );

  return <SchemaForm config={getRegisterForm(onSubmit, brand)} />;
}

const LockIcon = () => (
  <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path
      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      strokeLinecap="round"
      strokeLinejoin="round" />
  </svg>
);

/** Transient query param recording which stepper face is active. */
const STEP_PARAM = "mode";

/* ─── Stepper: [Login | Create account] ─── */

/**
 * [Login | Create account] segmented control on a `bg-muted` container. The
 * active face is a filled `bg-primary` pill with `text-background` — primary
 * is a saturated mid-teal, so neither `text-white` (~3:1) nor the light-mint
 * `text-primary-foreground` (~2.4:1) token meets AA on it, while the dark
 * background token lands ~6:1 — and `hover:text-background` pins it against
 * the ghost variant's low-contrast `hover:text-secondary-foreground`.
 */
function StepToggle({
  current,
  onChange,
}: {
  current: AppLoginStep;
  onChange: (next: AppLoginStep) => void;
}) {
  return (
    <div
      aria-label="Sign in or create an account"
      className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1"
      role="tablist">
      <Button
        aria-selected={current === "login"}
        className={cn(
          current === "login" &&
            "bg-primary text-background hover:bg-primary hover:text-background",
        )}
        onClick={() => onChange("login")}
        role="tab"
        type="button"
        variant="ghost">
        Login
      </Button>
      <Button
        aria-selected={current === "register"}
        className={cn(
          current === "register" &&
            "bg-primary text-background hover:bg-primary hover:text-background",
        )}
        onClick={() => onChange("register")}
        role="tab"
        type="button"
        variant="ghost">
        Create account
      </Button>
    </div>
  );
}

/**
 * Remove the transient step param from a raw query string without
 * re-serializing it: existing params (notably the exactly-once-encoded
 * `to`) keep their exact byte representation. Surgical string ops only —
 * URLSearchParams.toString() would re-encode `%xx` sequences and corrupt
 * the redirect-encoding contract.
 */
const stripStepParam = (search: string): string =>
  search.replace(/([?&])mode=[^&]*&?/g, "$1").replace(/[?&]+$/, "");

/**
 * Dynamically imported so the viem/wagmi dependency tree only loads
 * when the wallet_login flag is actually on — same lazy slot as
 * LoginIndex/RegisterIndex.
 */
const WalletLogin = lazy(() => import("@/ui/components/common/WalletLogin"));

export default AppLoginIndex;
