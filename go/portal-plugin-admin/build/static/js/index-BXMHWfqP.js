import './core_admin__mf_v__runtimeInit__mf_v__-DfW_aMyq.js';
import { core_admin__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__, Sdk } from './form-DBoeME-b.js';
import './ResetPasswordForm.schema-SSFSt0GT.js';
import './core_admin__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__-DvQP2D35.js';
import './core_admin__loadShare___mf_0_refinedev_mf_1_core__loadShare__-CH-3AM6E.js';
import './core_admin__loadShare__react__loadShare__-Wf-NLjTz.js';
import './index-Bgas403D.js';
import './jsx-runtime-BbmLGbwO.js';
import './core_admin__loadShare__react_mf_2_hook_mf_2_form__loadShare__-CLvCyULj.js';

function isErrorResult(result) {
  return !result.success;
}
const createAuthResponse = (params) => ({ ...params });
const createAuthProvider = (sdk) => {
  const maybeSetupAuth = () => {
    const token = localStorage.getItem("jwt");
    if (token) sdk.setAuthToken(token);
  };
  return {
    async check() {
      maybeSetupAuth();
      const response = await sdk.account().ping();
      if (isErrorResult(response)) return {
        authenticated: false,
        error: response.error,
        redirectTo: "/login"
      };
      if (response.data.token) sdk.setAuthToken(response.data.token);
      return { authenticated: true };
    },
    async forgotPassword(params) {
      try {
        if (params.password && params.token) {
          const response$1 = await sdk.account().confirmPasswordReset({
            email: params.email,
            password: params.password,
            token: params.token
          });
          return createAuthResponse({
            success: response$1.success,
            ...isErrorResult(response$1) && { error: response$1.error },
            ...response$1.success && { successNotification: {
              description: "Your password has been successfully reset. You can now log in with your new password.",
              message: "Password Reset Successful"
            } }
          });
        }
        const response = await sdk.account().requestPasswordReset({ email: params.email });
        return createAuthResponse({
          success: response.success,
          ...isErrorResult(response) && { error: response.error },
          ...response.success && { successNotification: {
            description: "If an account exists for this email, you will receive password reset instructions.",
            message: "Password Reset Requested"
          } }
        });
      } catch (error) {
        return createAuthResponse({
          error,
          success: false
        });
      }
    },
    async getIdentity() {
      maybeSetupAuth();
      const response = await sdk.account().info();
      if (isErrorResult(response)) return null;
      const { email, first_name, id, last_name, verified } = response.data;
      return {
        email,
        firstName: first_name,
        id,
        lastName: last_name,
        verified
      };
    },
    async getPermissions() {
      return { authenticated: true };
    },
    async login(params) {
      try {
        if ("otp" in params) {
          const response$1 = await sdk.account().validateOtp({ otp: params.otp });
          if (isErrorResult(response$1)) return createAuthResponse({
            error: response$1.error,
            redirectTo: "/otp",
            success: false
          });
          if (response$1.data.token) {
            sdk.setAuthToken(response$1.data.token);
            return createAuthResponse({
              redirectTo: params.redirectTo ?? "/dashboard",
              success: true,
              successNotification: {
                description: "You have successfully logged in with 2FA.",
                message: "Login Successful"
              }
            });
          }
        }
        const { email, password, remember } = params;
        const response = await sdk.account().login({
          email,
          password,
          remember
        });
        if (isErrorResult(response)) return createAuthResponse({
          error: response.error,
          success: false
        });
        if (response.data.otp) return createAuthResponse({
          redirectTo: `/otp?to=${encodeURIComponent(params.redirectTo ?? "/dashboard")}`,
          success: true,
          successNotification: {
            description: "Please enter your 2FA code to complete login.",
            message: "Two-Factor Authentication Required"
          }
        });
        if (response.data.token) {
          sdk.setAuthToken(response.data.token);
          return createAuthResponse({
            redirectTo: params.redirectTo ?? "/dashboard",
            success: true,
            successNotification: {
              description: "You have successfully logged in.",
              message: "Login Successful"
            }
          });
        }
        return createAuthResponse({
          error: new Error("Invalid login response"),
          success: false
        });
      } catch (error) {
        return createAuthResponse({
          error,
          redirectTo: "/login",
          success: false
        });
      }
    },
    async logout() {
      const response = await sdk.account().logout();
      if (response.success && false) ;
      return createAuthResponse({
        redirectTo: "/login",
        success: response.success,
        ...isErrorResult(response) && { error: response.error }
      });
    },
    async onError() {
      return {};
    },
    async register(params) {
      const response = await sdk.account().register({
        email: params.email,
        first_name: params.firstName,
        last_name: params.lastName,
        password: params.password
      });
      return createAuthResponse({
        redirectTo: "/login",
        success: response.success,
        ...isErrorResult(response) && { error: response.error },
        ...response.success && { successNotification: {
          description: "You have successfully registered. Please check your email to verify your account.",
          message: "Registration Successful"
        } }
      });
    },
    async updatePassword(params) {
      maybeSetupAuth();
      const response = await sdk.account().updatePassword(params.currentPassword, params.password);
      return createAuthResponse({
        success: response.success,
        ...isErrorResult(response) && { error: response.error },
        ...response.success && { successNotification: {
          description: "Your password has been updated successfully.",
          message: "Password Updated"
        } }
      });
    }
  };
};

//#region src/capabilities/refineConfig.ts
var Capability$1 = class Capability {
	dependencies = ["core:core:sdk-auth"];
	status;
	id = "core:core:refine-config-auth";
	type = "core:refine-config";
	#authProvider;
	async destroy() {
		this.#authProvider = void 0;
	}
	getAuthProvider() {
		if (!this.#authProvider) throw new Error("Auth provider not initialized");
		return this.#authProvider;
	}
	getConfig() {
		return { authProvider: this.getAuthProvider() };
	}
	async initialize(framework) {
		const sdkCaps = await framework.getCapabilitiesByType("core:sdk");
		if (!sdkCaps?.length) throw new Error("SDK not found");
		const sdk = sdkCaps.pop();
		this.#authProvider = createAuthProvider(sdk.getSdk());
	}
};

//#region src/capabilities/sdk.ts
var Capability = class {
	id = "core:core:sdk-auth";
	status;
	type = "core:sdk";
	#sdk;
	async destroy() {
		this.#sdk = void 0;
		this.status = "inactive";
	}
	getSdk() {
		if (!this.#sdk) throw new Error("SDK not initialized");
		return this.#sdk;
	}
	async initialize(framework) {
		try {
			const apiUrl = core_admin__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.getApiBaseUrl({
				currentUrl: framework.portalUrl,
				allowLocalhost: true,
				preserveSubdomain: core_admin__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.env.VITE_PORTAL_DOMAIN_IS_ROOT !== "true"
			});
			if (apiUrl === false) throw new Error("Invalid API URL configuration");
			this.#sdk = new Sdk(apiUrl);
		} catch (error) {
			throw new Error(`SDK initialization failed: ${error instanceof Error ? error.message : String(error)}`);
		}
	}
};

const routes = [
  {
    component: "Index",
    id: "root",
    index: false,
    navigation: {
      label: "Home",
      order: -1
    },
    path: "/"
  },
  {
    component: "Dashboard",
    id: "dashboard",
    index: false,
    path: "dashboard"
  },
  {
    component: "Login",
    id: "login",
    index: false,
    path: "/login"
  }
];

function index() {
  return {
    capabilities: [new Capability$1(), new Capability()],
    async destroy(_framework) {
      console.log("Plugin Admin destroyed");
    },
    id: core_admin__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.createNamespacedId("core", "admin"),
    async initialize(_framework) {
      console.log("Plugin Admin initialized");
    },
    routes
  };
}

export { index as default };
