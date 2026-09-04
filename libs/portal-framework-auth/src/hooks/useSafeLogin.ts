import type {
  AuthActionResponse,
  RefineError,
} from "@refinedev/core";
import {
  useInvalidateAuthStore,
  useLogin,
  useNotification,
} from "@refinedev/core";

import type { AuthFormRequest, OTPFormRequest } from "@/dataProviders/auth";
import { useNavigateToRedirect } from "@/hooks/useNavigateToRedirect";

/**
 * Portable subset of Refine's `useLogin` mutation result (Refine does not
 * re-export `UseLoginReturnType`, which makes the full type non-portable for
 * .d.ts generation). Forms interact with `mutate`/`isPending` only.
 */
export interface SafeLoginState {
  isPending: boolean;
  mutate: (
    variables: AuthFormRequest | OTPFormRequest,
    options?: {
      onError?: (error: Error | RefineError) => void;
      onSuccess?: (data: AuthActionResponse) => void;
    },
  ) => void;
}

/**
 * Wraps Refine's `useLogin` with a single, consistent destination decision
 * point.
 *
 * The built-in `useLogin` onSuccess prefers the raw request params'
 * `to` (from `useParsed().params`, which is double-decoded and unsanitized)
 * over the auth provider response's `redirectTo`, and `go()`s to absolute
 * URLs as if they were relative paths. We override the hook-level
 * `mutationOptions.onSuccess` entirely so that the destination authority is
 * always the auth provider's sanitized `redirectTo`:
 *
 * - `redirectTo` from the provider is navigated via the shared
 *   `navigateToRedirect` helper (external → window.location.href,
 *   internal → go({ to, type: "replace" }));
 * - OTP-enabled responses (`success: true` + `redirectTo: "/otp?to=…"`)
 *   therefore can never be bypassed in favor of an external `to` param;
 * - Refine's notification + 32ms auth-store invalidation behavior is
 *   preserved (only the redirect decision is replaced).
 */
export function useSafeLogin(): SafeLoginState {
  const { close, open } = useNotification();
  const invalidateAuthStore = useInvalidateAuthStore();
  const navigateToRedirect = useNavigateToRedirect();

  return useLogin<AuthFormRequest | OTPFormRequest>({
    mutationOptions: {
      onSuccess: (data) => {
        const { error, redirectTo, success, successNotification } = data;

        if (success) {
          close?.("login-error");
          if (successNotification) {
            open?.({
              description: successNotification.description,
              key: "login-success",
              message: successNotification.message,
              type: "success",
            });
          }
        }
        if (error || !success) {
          open?.({
            description: error?.message || "Invalid credentials",
            key: "login-error",
            message: error?.name || "Login Error",
            type: "error",
          });
        }

        if (success) {
          setTimeout(() => {
            invalidateAuthStore();
          }, 32);

          // Destination authority = the provider's sanitized redirectTo —
          // never the raw `parsed.params.to`. Empty/absent `redirectTo`
          // deliberately skips navigation (nothing trustworthy to go to).
          if (redirectTo && redirectTo.length > 0) {
            navigateToRedirect(redirectTo, "/dashboard", "replace");
          }
        }
      },
    },
  });
}
