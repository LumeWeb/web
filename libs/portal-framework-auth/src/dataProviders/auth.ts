import type {
  LoginRequest,
  OTPValidateRequest,
  PasswordResetVerifyRequest,
  RegisterRequest,
  Sdk,
} from "@lumeweb/portal-sdk";
import type {
  AuthActionResponse,
  AuthProvider,
  CheckResponse,
} from "@refinedev/core";

import { env, getApiBaseUrl } from "@lumeweb/portal-framework-core";
import { createNanoEvents } from "nanoevents";

export const DATA_PROVIDER_NAME = "account";

export interface AuthFormRequest extends LoginRequest {
  redirectTo?: string;
}

export interface ForgotPasswordConfirmRequest {
  email: string;
  password: string;
  token: string;
}

export interface ForgotPasswordRequest
  extends Partial<PasswordResetVerifyRequest> {
  token?: string;
}

export interface OTPFormRequest extends OTPValidateRequest {
  redirectTo?: string;
}

export type OTPGenerateResponse =
  import("@lumeweb/portal-sdk").OTPGenerateResponse;

export interface RegisterFormRequest
  extends Omit<RegisterRequest, "first_name" | "last_name"> {
  firstName: string;
  lastName: string;
  redirectTo?: string;
}

export interface UpdatePasswordFormRequest {
  currentPassword: string;
  password: string;
}
type Result<T> = { data: T; success: true } | { error: Error; success: false };

// Result type guard
function isErrorResult<T>(
  result: Result<T>,
): result is { error: Error; success: false } {
  return !result.success;
}

const createAuthResponse = (
  params: Partial<AuthActionResponse> & { success: boolean },
): AuthActionResponse => ({
  ...params,
});

// Helper function to process validation errors
const processValidationError = (error: any): string | undefined => {
  if (error?.message === VALIDATION_ERROR_NAME && error?.fields) {
    const fields = error.fields;
    // Use $first field if available, otherwise find first available field error
    const candidate = fields.$first ?? Object.values(fields)[0];
    const first = Array.isArray(candidate) ? candidate[0] : candidate;
    if (typeof first === "string") {
      // Extract the message after the first colon (keep subsequent colons)
      const idx = first.indexOf(":");
      const errorMessage = idx >= 0 ? first.slice(idx + 1).trim() : first;
      // Remove leading type tokens and capitalize first letter
      const cleaned = errorMessage.replace(
        /^(string|bool|number|time|slice|struct)\s+/i,
        "",
      );
      const finalMsg = cleaned.length > 0 ? cleaned : errorMessage;
      return finalMsg.charAt(0).toUpperCase() + finalMsg.slice(1);
    }
  }
  return undefined;
};

// Helper function to create a standardized error with a custom name
const createStandardError = (error: unknown, name: string): Error => {
  const original = error instanceof Error ? error : new Error(String(error));
  const e = new Error(original.message);
  e.name = name;
  e.stack = original.stack;
  if ((original as any).cause) (e as any).cause = (original as any).cause;
  Object.keys(original).forEach((key) => {
    if (!(key in e)) (e as any)[key] = (original as any)[key];
  });
  return e;
};

// Helper function to process API errors and create appropriate error messages
const processApiError = (error: unknown, name: string): Error => {
  // First check if it's a validation error
  const validationMessage = processValidationError(error);
  if (validationMessage) {
    const e = createStandardError(error, name);
    e.message = validationMessage;
    return e;
  }

  // Otherwise use standard error processing
  return createStandardError(error, name);
};

// Error name constants
const LOGIN_ERROR_NAME = "Login Error";
const REGISTRATION_ERROR_NAME = "Registration Error";
const LOGOUT_ERROR_NAME = "Logout Error";
const PASSWORD_RESET_ERROR_NAME = "Password Reset Error";
const UPDATE_PASSWORD_ERROR_NAME = "Update Password Error";
const VALIDATION_ERROR_NAME = "validation failed";

// Redirect paths
const LOGIN_PATH = "/login";
const OTP_PATH = "/otp";
const DASHBOARD_PATH = "/dashboard";

// Get the trusted root domain from configured portal domain, falling back to
// the last two DNS labels only when no portal domain is configured (e.g. dev).
const getRootDomain = (hostname: string): string => {
  const portalDomain = env.VITE_PORTAL_DOMAIN;
  if (portalDomain) return portalDomain;
  const parts = hostname.split(".");
  return parts.length > 2 ? parts.slice(-2).join(".") : hostname;
};

// Check if a URL is on a different origin than the current page
export const isExternalRedirect = (url: string): boolean => {
  try {
    if (url.startsWith("/")) return false;
    const parsed = new URL(url);
    return parsed.origin !== window.location.origin;
  } catch {
    return false;
  }
};

// Utility to sanitize redirect URLs - allow relative paths, localhost, and same-root-domain
export const sanitizeRedirectUrl = (url: string | undefined): string => {
  if (!url) return DASHBOARD_PATH;

  try {
    // If it's a relative path, allow it
    if (url.startsWith("/")) {
      return url;
    }

    const parsedUrl = new URL(url);

    // Allow localhost for development
    if (
      parsedUrl.hostname === "localhost" ||
      parsedUrl.hostname === "127.0.0.1"
    ) {
      return url;
    }

    // Allow same-root-domain (e.g. sia.example.com when on account.example.com)
    const rootDomain = getRootDomain(window.location.hostname);
    if (
      parsedUrl.hostname === rootDomain ||
      parsedUrl.hostname.endsWith(`.${rootDomain}`)
    ) {
      return url;
    }

    // For any other domain, redirect to dashboard
    return DASHBOARD_PATH;
  } catch {
    // If URL parsing fails, redirect to dashboard
    return DASHBOARD_PATH;
  }
};

export interface AuthCheckFailedEvent {
  error: Error;
}

export interface AuthCheckSuccessEvent {
  token: string;
}

export interface AuthEvents {
  authCheckFailed: (params: AuthCheckFailedEvent) => void;
  authCheckSuccess: (params: AuthCheckSuccessEvent) => void;
  registerAttempt: (params: RegisterAttemptEvent) => void;
}

export interface AuthProviderWithEmitter extends AuthProvider {
  on<E extends keyof AuthEvents>(event: E, callback: AuthEvents[E]): () => void;
}

export interface RegisterAttemptEvent {
  email: string;
  firstName: string;
}

export const createAuthProvider = (sdk: Sdk): AuthProviderWithEmitter => {
  const emitter = createNanoEvents<AuthEvents>();
  const maybeSetupAuth = () => {
    if (typeof window === "undefined") return;
    try {
      const baseUrl = getApiBaseUrl();
      const isLocal = !!baseUrl && new URL(baseUrl).hostname === "localhost";
      if (!isLocal) return;
      const token = window.localStorage?.getItem("jwt");
      if (token) sdk.setAuthToken(token);
    } catch {
      /* noop */
    }
  };

  return {
    async check(): Promise<CheckResponse> {
      maybeSetupAuth();
      const response = await sdk.account().ping();

      if (isErrorResult(response)) {
        emitter.emit("authCheckFailed", { error: response.error });
        return {
          authenticated: false,
          error: response.error,
          redirectTo: LOGIN_PATH,
        };
      }

      if (response.data.token) {
        sdk.setAuthToken(response.data.token);
        emitter.emit("authCheckSuccess", { token: response.data.token });
      }

      return {
        authenticated: true,
      };
    },
    async forgotPassword(
      params: ForgotPasswordRequest,
    ): Promise<AuthActionResponse> {
      try {
        if (params.password && params.token) {
          const response = await sdk.account().confirmPasswordReset({
            email: params.email!,
            password: params.password,
            token: params.token,
          });

          return createAuthResponse({
            success: response.success,
            ...(isErrorResult(response) && { error: response.error }),
            ...(response.success && {
              successNotification: {
                description:
                  "Your password has been successfully reset. You can now log in with your new password.",
                message: "Password Reset Successful",
              },
            }),
          });
        }

        const response = await sdk.account().requestPasswordReset({
          email: params.email!,
        });

        return createAuthResponse({
          success: response.success,
          ...(isErrorResult(response) && {
            error: processApiError(response.error, PASSWORD_RESET_ERROR_NAME),
          }),
          ...(response.success && {
            successNotification: {
              description:
                "If an account exists for this email, you will receive password reset instructions.",
              message: "Password Reset Requested",
            },
          }),
        });
      } catch (error) {
        return createAuthResponse({
          error: processApiError(error, PASSWORD_RESET_ERROR_NAME),
          success: false,
        });
      }
    },

    async getIdentity(): Promise<unknown> {
      maybeSetupAuth();
      const response = await sdk.account().info();

      if (isErrorResult(response)) {
        return null;
      }

      const {
        avatar,
        created_at,
        email,
        first_name,
        id,
        last_name,
        otp,
        verified,
      } = response.data;
      return {
        avatar,
        created_at,
        email,
        firstName: first_name,
        id,
        lastName: last_name,
        otp,
        verified,
      };
    },

    async getPermissions(): Promise<unknown> {
      return { authenticated: true };
    },

    async login(
      params: AuthFormRequest | OTPFormRequest,
    ): Promise<AuthActionResponse> {
      try {
        if ("otp" in params) {
          const response = await sdk.account().validateOtp({ otp: params.otp });

          if (isErrorResult(response)) {
            return createAuthResponse({
              error: processApiError(response.error, LOGIN_ERROR_NAME),
              redirectTo: `${OTP_PATH}${
                params.redirectTo
                  ? `?to=${encodeURIComponent(sanitizeRedirectUrl(params.redirectTo))}`
                  : ""
              }`,
              success: false,
            });
          }

          if (response.data.token) {
            sdk.setAuthToken(response.data.token);
            emitter.emit("authCheckSuccess", { token: response.data.token });
            const baseUrl = getApiBaseUrl();
            if (baseUrl) {
              try {
                if (new URL(baseUrl).hostname === "localhost") {
                  if (typeof window !== "undefined") {
                    window.localStorage?.setItem("jwt", response.data.token);
                  }
                }
              } catch {
                // Silently ignore URL parse errors
              }
            }
            return createAuthResponse({
              redirectTo:
                sanitizeRedirectUrl(params.redirectTo) ?? DASHBOARD_PATH,
              success: true,
              successNotification: {
                description: "You have successfully logged in with 2FA.",
                message: "Login Successful",
              },
            });
          }
        }

        const { email, password, remember } = params as AuthFormRequest;
        const response = await sdk
          .account()
          .login({ email, password, remember });

        if (isErrorResult(response)) {
          return createAuthResponse({
            error: processApiError(response.error, LOGIN_ERROR_NAME),
            success: false,
          });
        }

        if (response.data.otp) {
          return createAuthResponse({
            redirectTo: `${OTP_PATH}?to=${encodeURIComponent(
              sanitizeRedirectUrl(params.redirectTo) ?? DASHBOARD_PATH,
            )}`,
            success: true,
            successNotification: {
              description: "Please enter your 2FA code to complete login.",
              message: "Two-Factor Authentication Required",
            },
          });
        }

        if (response.data.token) {
          sdk.setAuthToken(response.data.token);
          const baseUrl = getApiBaseUrl();
          if (baseUrl) {
            try {
              if (new URL(baseUrl).hostname === "localhost") {
                if (typeof window !== "undefined") {
                  window.localStorage?.setItem("jwt", response.data.token);
                }
              }
            } catch {
              // Silently ignore URL parse errors
            }
          }
          return createAuthResponse({
            redirectTo:
              sanitizeRedirectUrl(params.redirectTo) ?? DASHBOARD_PATH,
            success: true,
            successNotification: {
              description: "You have successfully logged in.",
              message: "Login Successful",
            },
          });
        }

        return createAuthResponse({
          error: new Error("Invalid login response"),
          success: false,
        });
      } catch (error) {
        return createAuthResponse({
          error: processApiError(error, LOGIN_ERROR_NAME),
          redirectTo: LOGIN_PATH,
          success: false,
        });
      }
    },

    async logout(): Promise<AuthActionResponse> {
      const response = await sdk.account().logout();

      if (response.success) {
        const baseUrl = getApiBaseUrl();
        if (baseUrl) {
          try {
            if (new URL(baseUrl).hostname === "localhost") {
              if (typeof window !== "undefined") {
                window.localStorage?.removeItem("jwt");
              }
            }
          } catch {
            // Silently ignore URL parse errors
          }
        }
      }

      return createAuthResponse({
        redirectTo: LOGIN_PATH,
        success: response.success,
        ...(isErrorResult(response) && {
          error: processApiError(response.error, LOGOUT_ERROR_NAME),
        }),
      });
    },

    on<E extends keyof AuthEvents>(event: E, callback: AuthEvents[E]) {
      return emitter.on(event, callback);
    },

    async onError(): Promise<{ logout?: boolean; redirectTo?: string }> {
      return {};
    },

    async register(params: RegisterFormRequest): Promise<AuthActionResponse> {
      emitter.emit("registerAttempt", {
        email: params.email,
        firstName: params.firstName,
      });
      const response = await sdk.account().register({
        email: params.email,
        first_name: params.firstName,
        last_name: params.lastName,
        password: params.password,
      });

      return createAuthResponse({
        success: response.success,
        ...(isErrorResult(response) && {
          error: processApiError(response.error, REGISTRATION_ERROR_NAME),
        }),
        ...(response.success && {
          redirectTo: params.redirectTo
            ? `${LOGIN_PATH}?to=${encodeURIComponent(sanitizeRedirectUrl(params.redirectTo))}`
            : LOGIN_PATH,
          successNotification: {
            description:
              "You have successfully registered. Please check your email to verify your account.",
            message: "Registration Successful",
          },
        }),
      });
    },

    async updatePassword(
      params: UpdatePasswordFormRequest,
    ): Promise<AuthActionResponse> {
      maybeSetupAuth();
      const response = await sdk
        .account()
        .updatePassword(params.currentPassword, params.password);

      return createAuthResponse({
        success: response.success,
        ...(isErrorResult(response) && {
          error: processApiError(response.error, UPDATE_PASSWORD_ERROR_NAME),
        }),
        ...(response.success && {
          successNotification: {
            description: "Your password has been updated successfully.",
            message: "Password Updated",
          },
        }),
      });
    },
  };
};
