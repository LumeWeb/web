import { AuthProviders } from "@/ui/components/common/AuthProviders";

/**
 * Login-page wrapper around the shared AuthProviders slot. Kept as a named
 * export for the login flow; register uses AuthProviders directly.
 */
export function SocialLogin() {
  return <AuthProviders dividerLabel="Or continue with email" />;
}
