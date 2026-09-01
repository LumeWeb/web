import { isAbsoluteRedirect } from "@/dataProviders/auth";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";
import { useSafeRedirectTo } from "@/hooks/useSafeRedirectTo";
import { useLogin } from "@refinedev/core";
import React, { useCallback, useState } from "react";
import { useSearchParams } from "react-router";

import type { AuthFormRequest } from "@/dataProviders/auth";
import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
} from "@lumeweb/portal-framework-ui-core";

/* ─── Inline SVG icons ─── */

const LockIcon = () => (
  <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const AppIcon = () => (
  <svg className="w-7 h-7 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-6 h-6 text-muted-foreground flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

function AppLoginIndex() {
  const [searchParams] = useSearchParams();
  const appName = searchParams.get("app") || "an application";
  const redirectTo = useSafeRedirectTo();

  useRedirectIfAuthenticated("/dashboard", redirectTo);

  const { mutate: login, isPending } = useLogin<AuthFormRequest>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!email || !password) {
        setError("Please enter both email and password.");
        return;
      }

      login(
        {
          email,
          password,
          redirectTo: redirectTo ?? "/dashboard",
          remember: false,
        },
        {
          onSuccess: (result) => {
            if (result.success && redirectTo && isAbsoluteRedirect(redirectTo)) {
              window.location.replace(redirectTo);
            }
          },
          onError: (err: any) => {
            setError(
              err?.response?.data?.message ||
              err?.message ||
              "Login failed. Please check your credentials and try again.",
            );
          },
        },
      );
    },
    [email, password, redirectTo, login],
  );

  const handleCancel = () => {
    if (redirectTo && isAbsoluteRedirect(redirectTo)) {
      window.location.replace(redirectTo);
    } else if (window.history.length > 1) {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center relative overflow-hidden">
      {/* Aurora background */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-secondary rounded-full opacity-40 blur-[100px]" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[800px] h-[600px] bg-secondary-1 rounded-full opacity-30 blur-[120px]" />
      {/* Left sidebar gradient */}
      <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-primary-dark to-transparent pointer-events-none" />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-[560px] mx-4">
        <Card className="rounded-2xl p-10 border border-border">
          <CardContent className="p-0 space-y-0">

            {/* Header */}
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <LockIcon />
                <span className="text-[15px] font-normal text-muted-foreground">Connect application</span>
              </div>
              <span className="text-[15px] font-medium text-foreground">Step 1 of 2</span>
            </div>

            {/* App identity */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-xl bg-muted border border-border flex items-center justify-center">
                <AppIcon />
              </div>
              <h2 className="text-2xl font-bold text-foreground mt-5">{appName}</h2>
              <h1 className="text-[32px] font-bold text-primary-foreground mt-6 leading-tight">
                Sign in to connect {appName}
              </h1>
            </div>

            {/* Description */}
            <p className="text-base text-muted-foreground leading-relaxed text-center max-w-[380px] mx-auto mb-8">
              {appName} wants to connect to your account.
              <br />
              Sign in to continue and review the requested access.
            </p>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-3 rounded-lg bg-destructive/20 border border-destructive/50 text-destructive-foreground text-sm text-center">
                {error}
              </div>
            )}

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-primary-1-foreground">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="username"
                  fullWidth
                />
              </div>

              <div className="space-y-2">
                <Label className="text-primary-1-foreground">Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  fullWidth
                />
              </div>

              {/* Buttons */}
              <div className="space-y-3 pt-2">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-primary hover:bg-primary-1 disabled:opacity-60 text-primary-foreground font-semibold text-base h-14 rounded-xl transition-colors"
                >
                  {isPending ? "Signing in…" : "Sign in and continue"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="w-full border-border hover:border-primary hover:bg-primary/5 text-primary font-semibold text-base h-14 rounded-xl transition-all"
                >
                  Cancel and return to {appName}
                </Button>
              </div>
            </form>

            {/* Security notice */}
            <div className="flex items-start gap-3 pt-6">
              <ShieldIcon />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your password is entered only on this portal and is never shared with {appName}.
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-border/50 my-6" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AppLoginIndex;
