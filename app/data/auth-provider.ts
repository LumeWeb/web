import type {AuthProvider, UpdatePasswordFormTypes} from "@refinedev/core"

import type {
    AuthActionResponse,
    CheckResponse,
    IdentityResponse,
    OnErrorResponse
    // @ts-ignore
} from "@refinedev/core/dist/interfaces/bindings/auth"
import {Sdk} from "@lumeweb/portal-sdk";
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
}

export interface UpdatePasswordFormRequest extends UpdatePasswordFormTypes{
    currentPassword: string;
}

export const createPortalAuthProvider = (sdk: Sdk): AuthProvider => {
    const maybeSetupAuth = (): void => {
        const jwt = sdk.account().jwtToken;
        if (jwt) {
            sdk.setAuthToken(jwt);
        }
    };

    return {
        async login(params: AuthFormRequest): Promise<AuthActionResponse> {
            const ret = await sdk.account().login({
                email: params.email,
                password: params.password,
            });

            let redirectTo: string | undefined;

            if (ret) {
                redirectTo = params.redirectTo;
                if (!redirectTo) {
                    redirectTo = ret ? "/dashboard" : "/login";
                }
                sdk.setAuthToken(sdk.account().jwtToken);
            }

            return {
                success: ret,
                redirectTo,
            };
        },

        async logout(params: any): Promise<AuthActionResponse> {
            let ret = await sdk.account().logout();
            return {success: ret, redirectTo: "/login"};
        },

        async check(params?: any): Promise<CheckResponse> {
            const ret = await sdk.account().ping();

            if (ret) {
                maybeSetupAuth();
            }

            return {authenticated: ret, redirectTo: ret ? undefined : "/login"};
        },

        async onError(error: any): Promise<OnErrorResponse> {
            return {logout: true};
        },

        async register(params: RegisterFormRequest): Promise<AuthActionResponse> {
            const ret = await sdk.account().register({
                email: params.email,
                password: params.password,
                first_name: params.firstName,
                last_name: params.lastName,
            });
            return {success: ret, redirectTo: ret ? "/dashboard" : undefined};
        },

        async forgotPassword(params: any): Promise<AuthActionResponse> {
            return {success: true};
        },

        async updatePassword(params: UpdatePasswordFormRequest): Promise<AuthActionResponse> {
            maybeSetupAuth();
            const ret = await sdk.account().updatePassword(params.currentPassword, params.password as string);

            if (ret) {
                if (ret instanceof Error) {
                    return {
                        success: false,
                        error: ret
                    }
                }

                return {
                    success: true
                }
            } else {
                return {
                    success: false
                }
            }
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
            };
        },
    };
};
