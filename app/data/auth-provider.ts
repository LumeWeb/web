import type {AuthProvider} from "@refinedev/core"

// @ts-ignore
import type {AuthActionResponse, CheckResponse, OnErrorResponse} from "@refinedev/core/dist/interfaces/bindings/auth"
import {Sdk} from "@lumeweb/portal-sdk";
import Cookies from 'universal-cookie';

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

export class PortalAuthProvider implements RequiredAuthProvider {
    private sdk: Sdk;

    constructor(apiUrl: string) {
        this.sdk = Sdk.create(apiUrl);

        const methods: Array<keyof AuthProvider> = [
            'login',
            'logout',
            'check',
            'onError',
            'register',
            'forgotPassword',
            'updatePassword',
            'getPermissions',
            'getIdentity',
        ];

        methods.forEach((method) => {
            this[method] = this[method]?.bind(this) as any;
        });
    }

    async login(params: AuthFormRequest): Promise<AuthActionResponse> {
        const cookies = new Cookies();
        const ret = await this.sdk.account().login({
            email: params.email,
            password: params.password,
        })

        let redirectTo:string | undefined;

        if (ret) {
            cookies.set('jwt', this.sdk.account().jwtToken, { path: '/' });
            redirectTo = params.redirectTo;
            if (!redirectTo) {
                redirectTo = ret ? "/dashboard" : "/login";
            }
        }

        return {
            success: ret,
            redirectTo,
        };
    }

    async logout(params: any): Promise<AuthActionResponse> {
        let ret = await this.sdk.account().logout();
        if (ret) {
            const cookies = new Cookies();
            cookies.remove('jwt');
        }
        return {success: ret, redirectTo: "/login"};
    }

    async check(params?: any): Promise<CheckResponse> {
        const cookies = new Cookies();

        const jwtCookie = cookies.get('jwt');

        if (jwtCookie) {
            this.sdk.setAuthToken(jwtCookie);
        }

        const ret = await this.sdk.account().ping();

        if (!ret) {
            cookies.remove('jwt');
        }

        return {authenticated: ret, redirectTo: ret ? undefined: "/login"};
    }

    async onError(error: any): Promise<OnErrorResponse> {
        return {logout: true};
    }

    async register(params: RegisterFormRequest): Promise<AuthActionResponse> {
        const ret = await this.sdk.account().register({
            email: params.email,
            password: params.password,
            first_name: params.firstName,
            last_name: params.lastName,
        });
        return {success: ret, redirectTo: ret ? "/dashboard" : undefined};
    }

    async forgotPassword(params: any): Promise<AuthActionResponse> {
        return {success: true};
    }

    async updatePassword(params: any): Promise<AuthActionResponse> {
        return {success: true};
    }

    async getPermissions(params?: Record<string, any>): Promise<AuthActionResponse> {
        return {success: true};
    }

    async getIdentity(params?: any): Promise<AuthActionResponse> {
        return {id: "1", fullName: "John Doe", avatar: "https://via.placeholder.com/150"};
    }

    public static create(apiUrl: string): AuthProvider {
        return new PortalAuthProvider(apiUrl);
    }
}

interface RequiredAuthProvider extends AuthProvider {
    login: AuthProvider['login'];
    logout: AuthProvider['logout'];
    check: AuthProvider['check'];
    onError: AuthProvider['onError'];
    register: AuthProvider['register'];
    forgotPassword: AuthProvider['forgotPassword'];
    updatePassword: AuthProvider['updatePassword'];
    getPermissions: AuthProvider['getPermissions'];
    getIdentity: AuthProvider['getIdentity'];
}
