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
import { getApiBaseUrl } from "@lumeweb/portal-framework-core";

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

export interface OPTGenerateResponse {
  otp: string;
}

export interface OTPFormRequest extends OTPValidateRequest {
  redirectTo?: string;
}

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

export const createAuthProvider = (sdk: Sdk): AuthProvider => {
  const maybeSetupAuth = () => {
    const token = localStorage.getItem("jwt");
    if (token) {
      sdk.setAuthToken(token);
    }
  };

  return {
    async check(): Promise<CheckResponse> {
      maybeSetupAuth();
      const response = await sdk.account().ping();

      if (isErrorResult(response)) {
        return {
          authenticated: false,
          error: response.error,
          redirectTo: "/login",
        };
      }

      if (response.data.token) {
        sdk.setAuthToken(response.data.token);
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
            email: params.email as string,
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
          email: params.email as string,
        });

        return createAuthResponse({
          success: response.success,
          ...(isErrorResult(response) && { error: response.error }),
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
          error: error as Error,
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

      const { email, first_name, id, last_name, verified, created_at } =
        response.data;
      return {
        email,
        firstName: first_name,
        id,
        lastName: last_name,
        verified,
        created_at,
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
              error: response.error,
              redirectTo: "/otp",
              success: false,
            });
          }

          if (response.data.token) {
            sdk.setAuthToken(response.data.token);
            const baseUrl = getApiBaseUrl();
            if (baseUrl) {
              try {
                if (new URL(baseUrl).hostname === "localhost") {
                  localStorage.setItem("jwt", response.data.token);
                }
              } catch {
                // Silently ignore URL parse errors
              }
            }
            return createAuthResponse({
              redirectTo: params.redirectTo ?? "/dashboard",
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
            error: response.error,
            success: false,
          });
        }

        if (response.data.otp) {
          return createAuthResponse({
            redirectTo: `/otp?to=${encodeURIComponent(
              params.redirectTo ?? "/dashboard",
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
                localStorage.setItem("jwt", response.data.token);
              }
            } catch {
              // Silently ignore URL parse errors
            }
          }
          return createAuthResponse({
            redirectTo: params.redirectTo ?? "/dashboard",
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
          error: error as Error,
          redirectTo: "/login",
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
              localStorage.removeItem("jwt");
            }
          } catch {
            // Silently ignore URL parse errors
          }
        }
      }

      return createAuthResponse({
        redirectTo: "/login",
        success: response.success,
        ...(isErrorResult(response) && { error: response.error }),
      });
    },

    async onError(): Promise<{ logout?: boolean; redirectTo?: string }> {
      return {};
    },

    async register(params: RegisterFormRequest): Promise<AuthActionResponse> {
      const response = await sdk.account().register({
        email: params.email,
        first_name: params.firstName,
        last_name: params.lastName,
        password: params.password,
      });

      return createAuthResponse({
        redirectTo: "/login",
        success: response.success,
        ...(isErrorResult(response) && { error: response.error }),
        ...(response.success && {
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
        ...(isErrorResult(response) && { error: response.error }),
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
