import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__-BjauFvDm.js';

let createNanoEvents = () => ({
  emit(event, ...args) {
    for (
      let callbacks = this.events[event] || [],
        i = 0,
        length = callbacks.length;
      i < length;
      i++
    ) {
      callbacks[i](...args);
    }
  },
  events: {},
  on(event, cb) {
(this.events[event] ||= []).push(cb);
    return () => {
      this.events[event] = this.events[event]?.filter(i => cb !== i);
    }
  }
});

//#region src/dataProviders/auth.ts
const DATA_PROVIDER_NAME = "account";
function isErrorResult(result) {
	return !result.success;
}
const createAuthResponse = (params) => ({ ...params });
const wrapErrorWithName = (error, name) => {
	const original = error instanceof Error ? error : new Error(String(error));
	const e = new Error(original.message);
	e.name = name;
	e.stack = original.stack;
	if (original.cause) e.cause = original.cause;
	Object.keys(original).forEach((key) => {
		if (!(key in e)) e[key] = original[key];
	});
	return e;
};
const LOGIN_ERROR_NAME = "Login Error";
const REGISTRATION_ERROR_NAME = "Registration Error";
const LOGOUT_ERROR_NAME = "Logout Error";
const PASSWORD_RESET_ERROR_NAME = "Password Reset Error";
const UPDATE_PASSWORD_ERROR_NAME = "Update Password Error";
const LOGIN_PATH = "/login";
const OTP_PATH = "/otp";
const DASHBOARD_PATH = "/dashboard";
const sanitizeRedirectUrl = (url) => {
	if (!url) return DASHBOARD_PATH;
	try {
		if (url.startsWith("/")) return url;
		const parsedUrl = new URL(url);
		if (parsedUrl.hostname === "localhost" || parsedUrl.hostname === "127.0.0.1") return url;
		return DASHBOARD_PATH;
	} catch {
		return DASHBOARD_PATH;
	}
};
const createAuthProvider = (sdk) => {
	const emitter = createNanoEvents();
	const maybeSetupAuth = () => {
		if (typeof window === "undefined") return;
		try {
			const baseUrl = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.getApiBaseUrl();
			const isLocal = !!baseUrl && new URL(baseUrl).hostname === "localhost";
			if (!isLocal) return;
			const token = window.localStorage?.getItem("jwt");
			if (token) sdk.setAuthToken(token);
		} catch {}
	};
	return {
		async check() {
			maybeSetupAuth();
			const response = await sdk.account().ping();
			if (isErrorResult(response)) {
				emitter.emit("authCheckFailed", { error: response.error });
				return {
					authenticated: false,
					error: response.error,
					redirectTo: LOGIN_PATH
				};
			}
			if (response.data.token) {
				sdk.setAuthToken(response.data.token);
				emitter.emit("authCheckSuccess", { token: response.data.token });
			}
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
					...isErrorResult(response) && { error: wrapErrorWithName(response.error, PASSWORD_RESET_ERROR_NAME) },
					...response.success && { successNotification: {
						description: "If an account exists for this email, you will receive password reset instructions.",
						message: "Password Reset Requested"
					} }
				});
			} catch (error) {
				return createAuthResponse({
					error: wrapErrorWithName(error, PASSWORD_RESET_ERROR_NAME),
					success: false
				});
			}
		},
		async getIdentity() {
			maybeSetupAuth();
			const response = await sdk.account().info();
			if (isErrorResult(response)) return null;
			const { created_at, email, first_name, id, last_name, otp, verified } = response.data;
			return {
				created_at,
				email,
				firstName: first_name,
				id,
				lastName: last_name,
				otp,
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
						error: wrapErrorWithName(response$1.error, LOGIN_ERROR_NAME),
						redirectTo: `${OTP_PATH}${params.redirectTo ? `?to=${encodeURIComponent(sanitizeRedirectUrl(params.redirectTo))}` : ""}`,
						success: false
					});
					if (response$1.data.token) {
						sdk.setAuthToken(response$1.data.token);
						emitter.emit("authCheckSuccess", { token: response$1.data.token });
						const baseUrl = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.getApiBaseUrl();
						if (baseUrl) try {
							if (new URL(baseUrl).hostname === "localhost") {
								if (typeof window !== "undefined") window.localStorage?.setItem("jwt", response$1.data.token);
							}
						} catch {}
						return createAuthResponse({
							redirectTo: sanitizeRedirectUrl(params.redirectTo) ?? DASHBOARD_PATH,
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
					error: wrapErrorWithName(response.error, LOGIN_ERROR_NAME),
					success: false
				});
				if (response.data.otp) return createAuthResponse({
					redirectTo: `${OTP_PATH}?to=${encodeURIComponent(sanitizeRedirectUrl(params.redirectTo) ?? DASHBOARD_PATH)}`,
					success: true,
					successNotification: {
						description: "Please enter your 2FA code to complete login.",
						message: "Two-Factor Authentication Required"
					}
				});
				if (response.data.token) {
					sdk.setAuthToken(response.data.token);
					const baseUrl = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.getApiBaseUrl();
					if (baseUrl) try {
						if (new URL(baseUrl).hostname === "localhost") {
							if (typeof window !== "undefined") window.localStorage?.setItem("jwt", response.data.token);
						}
					} catch {}
					return createAuthResponse({
						redirectTo: sanitizeRedirectUrl(params.redirectTo) ?? DASHBOARD_PATH,
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
					error: wrapErrorWithName(error, LOGIN_ERROR_NAME),
					redirectTo: LOGIN_PATH,
					success: false
				});
			}
		},
		async logout() {
			const response = await sdk.account().logout();
			if (response.success) {
				const baseUrl = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.getApiBaseUrl();
				if (baseUrl) try {
					if (new URL(baseUrl).hostname === "localhost") {
						if (typeof window !== "undefined") window.localStorage?.removeItem("jwt");
					}
				} catch {}
			}
			return createAuthResponse({
				redirectTo: LOGIN_PATH,
				success: response.success,
				...isErrorResult(response) && { error: wrapErrorWithName(response.error, LOGOUT_ERROR_NAME) }
			});
		},
		on(event, callback) {
			return emitter.on(event, callback);
		},
		async onError() {
			return {};
		},
		async register(params) {
			emitter.emit("registerAttempt", {
				email: params.email,
				firstName: params.firstName
			});
			const response = await sdk.account().register({
				email: params.email,
				first_name: params.firstName,
				last_name: params.lastName,
				password: params.password
			});
			return createAuthResponse({
				success: response.success,
				...isErrorResult(response) && { error: wrapErrorWithName(response.error, REGISTRATION_ERROR_NAME) },
				...response.success && {
					redirectTo: LOGIN_PATH,
					successNotification: {
						description: "You have successfully registered. Please check your email to verify your account.",
						message: "Registration Successful"
					}
				}
			});
		},
		async updatePassword(params) {
			maybeSetupAuth();
			const response = await sdk.account().updatePassword(params.currentPassword, params.password);
			return createAuthResponse({
				success: response.success,
				...isErrorResult(response) && { error: wrapErrorWithName(response.error, UPDATE_PASSWORD_ERROR_NAME) },
				...response.success && { successNotification: {
					description: "Your password has been updated successfully.",
					message: "Password Updated"
				} }
			});
		}
	};
};

export { DATA_PROVIDER_NAME, createAuthProvider };
