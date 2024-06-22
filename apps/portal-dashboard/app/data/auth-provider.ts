import type {AuthProvider, HttpError, UpdatePasswordFormTypes} from "@refinedev/core"

import type {
    AuthActionResponse,
    CheckResponse,
    IdentityResponse,
    OnErrorResponse,
    SuccessNotificationResponse
    // @ts-ignore
} from "@refinedev/core/dist/interfaces/bindings/auth"
import {Sdk, AccountError} from "@lumeweb/portal-sdk";
import type {AccountInfoResponse} from "@lumeweb/portal-sdk";


export type AuthFormRequest = {
    email: string;
    password: string;
    rememberMe: boolean;
    redirectTo?: string;
}

export type RegisterFormRequest = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export type Identity = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    verified: boolean;
}

export interface UpdatePasswordFormRequest extends UpdatePasswordFormTypes {
    currentPassword: string;
}

export const createPortalAuthProvider = (sdk: Sdk): AuthProvider => {
    const maybeSetupAuth = (): void => {
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

    type ResponseResult = {
        ret: boolean | Error;
        successNotification?: SuccessNotificationResponse;
        redirectToSuccess?: string;
        redirectToError?: string;
        successCb?: () => void;
    }

    interface CheckResponseResult extends ResponseResult {
        authenticated?: boolean;
    }

    const handleResponse = (result: ResponseResult): AuthActionResponse => {
        if (result.ret) {
            if (result.ret instanceof AccountError) {
                return {
                    success: true,
                    error: result.ret satisfies HttpError,
                    redirectTo: result.redirectToError
                }
            }

            result.successCb?.();

            return {
                success: true,
                successNotification: result.successNotification,
                redirectTo: result.redirectToSuccess,
            }
        }

        return {
            success: true,
            redirectTo: result.redirectToError
        }
    }

    const handleCheckResponse = (result: CheckResponseResult): CheckResponse => {
        const response = handleResponse(result);
        const success = response.success;
        delete response.success;

        return {
            ...response,
            authenticated: success
        }
    }

    return {
        async login(params: AuthFormRequest): Promise<AuthActionResponse> {
            const ret = await sdk.account().login({
                email: params.email,
                password: params.password,
            });

            maybeSetupAuth();

            return handleResponse({
                ret, redirectToSuccess: "/dashboard", redirectToError: "/login", successCb: () => {
                    sdk.setAuthToken(sdk.account().jwtToken);
                }, successNotification: {
                    message: "Login Successful",
                    description: "You have successfully logged in."

                }
            });
        },

        async logout(params: any): Promise<AuthActionResponse> {
            let ret = await sdk.account().logout();

            if (ret){
                if (import.meta.env.DEV) {
                    localStorage.removeItem("jwt");
                }
            }

            return handleResponse({ret, redirectToSuccess: "/login"});
        },

        async check(params?: any): Promise<CheckResponse> {
            maybeSetupAuth();
            const ret = await sdk.account().ping();
            maybeSetupAuth();

            return handleCheckResponse({ret, redirectToError: "/login", successCb: maybeSetupAuth});
        },

        async onError(error: any): Promise<OnErrorResponse> {
            return {};
        },

        async register(params: RegisterFormRequest): Promise<AuthActionResponse> {
            const ret = await sdk.account().register({
                email: params.email,
                password: params.password,
                first_name: params.firstName,
                last_name: params.lastName,
            });
            return handleResponse({
                ret, redirectToSuccess: "/login", successNotification: {
                    message: "Registration Successful",
                    description: "You have successfully registered. Please check your email to verify your account.",
                }
            });
        },

        async forgotPassword(params: any): Promise<AuthActionResponse> {
            return {success: true};
        },

        async updatePassword(params: UpdatePasswordFormRequest): Promise<AuthActionResponse> {
            maybeSetupAuth();
            const ret = await sdk.account().updatePassword(params.currentPassword, params.password as string);

            return handleResponse({
                ret, successNotification: {
                    message: "Password Updated",
                    description: "Your password has been updated successfully.",
                }
            });
        },

        async getPermissions(params?: Record<string, any>): Promise<AuthActionResponse> {
            return {success: true};
        },

        async getIdentity(params?: Identity): Promise<IdentityResponse> {
            maybeSetupAuth();
            const ret = await sdk.account().info();

            if (!ret) {
                return {identity: null};
            }

            const acct = ret as AccountInfoResponse;

            return {
                id: acct.id,
                firstName: acct.first_name,
                lastName: acct.last_name,
                email: acct.email,
                verified: acct.verified,
            };
        },
    };
};
