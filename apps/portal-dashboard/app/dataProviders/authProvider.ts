import type { AccountInfoResponse } from "@lumeweb/portal-sdk";
import { AccountError, Sdk } from "@lumeweb/portal-sdk";
import type {
  AuthProvider,
  HttpError,
  UpdatePasswordFormTypes,
} from "@refinedev/core";

// Type definitions
export type AuthFormRequest = {
  email: string;
  password: string;
  remember: boolean;
  redirectTo?: string;
};

export type OTPFormRequest = {
  otp: string;
  redirectTo?: string;
};

export type RegisterFormRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type Identity = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  verified: boolean;
};

export interface UpdatePasswordFormRequest extends UpdatePasswordFormTypes {
  currentPassword: string;
}

type ResponseResult = {
  ret: boolean | Error;
  successNotification?: any;
  redirectToSuccess?: string;
  redirectToError?: string;
  successCb?: () => void;
};

interface CheckResponseResult extends ResponseResult {
  authenticated?: boolean;
}

type LoginResponse = {
  token: string;
  otp: boolean;
};

// Helper functions
const maybeSetupAuth = (sdk: Sdk): void => {
  let jwt = sdk.account().jwtToken;
  if (jwt) {
    sdk.setAuthToken(jwt);
    if (import.meta.env.DEV) {
      localStorage.setItem("jwt", jwt);
    }
  }

  if (import.meta.env.DEV) {
    let jwt = localStorage.getItem("jwt");
    if (jwt) {
      sdk.setAuthToken(jwt);
    }
  }
};

const handleResponse = (result: ResponseResult): any => {
  if (result.ret instanceof AccountError) {
    return {
      success: false,
      error: result.ret as HttpError,
      redirectTo: result.redirectToError,
    };
  }

  if (result.ret) {
    result.successCb?.();
    return {
      success: true,
      successNotification: result.successNotification,
      redirectTo: result.redirectToSuccess,
    };
  }

  return {
    success: false,
    redirectTo: result.redirectToError,
  };
};

const handleCheckResponse = (result: CheckResponseResult): any => {
  const response = handleResponse(result);
  const success = response.success;
  delete response.success;

  return {
    ...response,
    authenticated: success,
  };
};

export const createPortalAuthProvider = (sdk: Sdk): AuthProvider => {
  return {
    async login(params: AuthFormRequest | OTPFormRequest): Promise<any> {
      try {
        if ("otp" in params) {
          // OTP verification
          const response = await sdk.account().validateOtp({ otp: params.otp });

          if (response?.token) {
            sdk.setAuthToken(response.token);
            return handleResponse({
              ret: true,
              redirectToSuccess: params.redirectTo ?? "/dashboard",
              successCb: () => {
                sdk.setAuthToken(response.token);
              },
              successNotification: {
                message: "Login Successful",
                description: "You have successfully logged in with 2FA.",
              },
            });
          } else {
            return handleResponse({
              ret: new AccountError("Invalid OTP", 400),
              redirectToError: "/otp",
            });
          }
        } else {
          // Initial login
          const response = await sdk.account().login(params);
          const loginResponse = response as unknown as LoginResponse;

          if (response instanceof AccountError) {
            return handleResponse({
              ret: loginResponse as unknown as Error,
            });
          }

          if (loginResponse.otp) {
            return handleResponse({
              ret: true,
              redirectToSuccess: `/otp?to=${encodeURIComponent(params.redirectTo ?? "/dashboard")}`,
              successNotification: {
                message: "Two-Factor Authentication Required",
                description: "Please enter your 2FA code to complete login.",
              },
            });
          } else {
            sdk.setAuthToken(loginResponse.token);
            return handleResponse({
              ret: true,
              redirectToSuccess: params.redirectTo ?? "/dashboard",
              successCb: () => {
                sdk.setAuthToken(loginResponse.token);
              },
              successNotification: {
                message: "Login Successful",
                description: "You have successfully logged in.",
              },
            });
          }
        }
      } catch (error) {
        return handleResponse({
          ret: error as AccountError,
          redirectToError: "/login",
        });
      }
    },

    async logout(): Promise<any> {
      const ret = await sdk.account().logout();

      if (ret && import.meta.env.DEV) {
        localStorage.removeItem("jwt");
      }

      return handleResponse({ ret, redirectToSuccess: "/login" });
    },

    async check(): Promise<any> {
      maybeSetupAuth(sdk);
      const ret = await sdk.account().ping();
      maybeSetupAuth(sdk);

      return handleCheckResponse({
        ret,
        redirectToError: "/login",
        successCb: () => maybeSetupAuth(sdk),
      });
    },

    async onError(): Promise<any> {
      return {};
    },

    async register(params: RegisterFormRequest): Promise<any> {
      const ret = await sdk.account().register({
        email: params.email,
        password: params.password,
        first_name: params.firstName,
        last_name: params.lastName,
      });

      return handleResponse({
        ret,
        redirectToSuccess: "/login",
        successNotification: {
          message: "Registration Successful",
          description:
            "You have successfully registered. Please check your email to verify your account.",
        },
      });
    },

    async forgotPassword(): Promise<any> {
      return { success: true };
    },

    async updatePassword(params: UpdatePasswordFormRequest): Promise<any> {
      maybeSetupAuth(sdk);
      const ret = await sdk
        .account()
        .updatePassword(params.currentPassword, params.password as string);

      return handleResponse({
        ret,
        successNotification: {
          message: "Password Updated",
          description: "Your password has been updated successfully.",
        },
      });
    },

    async getPermissions(): Promise<any> {
      return { success: true };
    },

    async getIdentity(): Promise<any> {
      maybeSetupAuth(sdk);
      const ret = await sdk.account().info();

      if (!ret) {
        return { identity: null };
      }

      const acct = ret as AccountInfoResponse;

      return {
        id: acct.id,
        firstName: acct.first_name,
        lastName: acct.last_name,
        email: acct.email,
        verified: acct.verified,
        otp: acct.otp,
      };
    },
  };
};
