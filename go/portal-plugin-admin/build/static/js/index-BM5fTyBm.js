import { core_admin__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__ } from './resetPassword.schema-CG15ztgC.js';
import './core_admin__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__-BpzM45b_.js';

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

function isErrorResult(result) {
	return !result.success;
}
const createAuthResponse = (params) => ({ ...params });
const processValidationError = (error) => {
	if (error?.message === VALIDATION_ERROR_NAME && error?.fields) {
		const fields = error.fields;
		const candidate = fields.$first ?? Object.values(fields)[0];
		const first = Array.isArray(candidate) ? candidate[0] : candidate;
		if (typeof first === "string") {
			const idx = first.indexOf(":");
			const errorMessage = idx >= 0 ? first.slice(idx + 1).trim() : first;
			const cleaned = errorMessage.replace(/^(string|bool|number|time|slice|struct)\s+/i, "");
			const finalMsg = cleaned.length > 0 ? cleaned : errorMessage;
			return finalMsg.charAt(0).toUpperCase() + finalMsg.slice(1);
		}
	}
};
const createStandardError = (error, name) => {
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
const processApiError = (error, name) => {
	const validationMessage = processValidationError(error);
	if (validationMessage) {
		const e = createStandardError(error, name);
		e.message = validationMessage;
		return e;
	}
	return createStandardError(error, name);
};
const LOGIN_ERROR_NAME = "Login Error";
const REGISTRATION_ERROR_NAME = "Registration Error";
const LOGOUT_ERROR_NAME = "Logout Error";
const PASSWORD_RESET_ERROR_NAME = "Password Reset Error";
const UPDATE_PASSWORD_ERROR_NAME = "Update Password Error";
const VALIDATION_ERROR_NAME = "validation failed";
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
			const baseUrl = core_admin__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.getApiBaseUrl();
			if (!(!!baseUrl && new URL(baseUrl).hostname === "localhost")) return;
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
					...isErrorResult(response) && { error: processApiError(response.error, PASSWORD_RESET_ERROR_NAME) },
					...response.success && { successNotification: {
						description: "If an account exists for this email, you will receive password reset instructions.",
						message: "Password Reset Requested"
					} }
				});
			} catch (error) {
				return createAuthResponse({
					error: processApiError(error, PASSWORD_RESET_ERROR_NAME),
					success: false
				});
			}
		},
		async getIdentity() {
			maybeSetupAuth();
			const response = await sdk.account().info();
			if (isErrorResult(response)) return null;
			const { avatar, created_at, email, first_name, id, last_name, otp, verified } = response.data;
			return {
				avatar,
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
						error: processApiError(response$1.error, LOGIN_ERROR_NAME),
						redirectTo: `${OTP_PATH}${params.redirectTo ? `?to=${encodeURIComponent(sanitizeRedirectUrl(params.redirectTo))}` : ""}`,
						success: false
					});
					if (response$1.data.token) {
						sdk.setAuthToken(response$1.data.token);
						emitter.emit("authCheckSuccess", { token: response$1.data.token });
						const baseUrl = core_admin__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.getApiBaseUrl();
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
					error: processApiError(response.error, LOGIN_ERROR_NAME),
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
					const baseUrl = core_admin__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.getApiBaseUrl();
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
					error: /* @__PURE__ */ new Error("Invalid login response"),
					success: false
				});
			} catch (error) {
				return createAuthResponse({
					error: processApiError(error, LOGIN_ERROR_NAME),
					redirectTo: LOGIN_PATH,
					success: false
				});
			}
		},
		async logout() {
			const response = await sdk.account().logout();
			if (response.success) {
				const baseUrl = core_admin__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.getApiBaseUrl();
				if (baseUrl) try {
					if (new URL(baseUrl).hostname === "localhost") {
						if (typeof window !== "undefined") window.localStorage?.removeItem("jwt");
					}
				} catch {}
			}
			return createAuthResponse({
				redirectTo: LOGIN_PATH,
				success: response.success,
				...isErrorResult(response) && { error: processApiError(response.error, LOGOUT_ERROR_NAME) }
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
				...isErrorResult(response) && { error: processApiError(response.error, REGISTRATION_ERROR_NAME) },
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
				...isErrorResult(response) && { error: processApiError(response.error, UPDATE_PASSWORD_ERROR_NAME) },
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
	dependencies = ["core:sdk-auth"];
	id = "core:refine-config-auth";
	status = "inactive";
	type = "core:refine-config";
	#authProvider;
	async destroy() {
		this.#authProvider = void 0;
		this.status = "inactive";
	}
	getAuthProvider() {
		if (!this.#authProvider) throw new Error("Auth provider not initialized");
		return this.#authProvider;
	}
	getConfig() {
		return { authProvider: this.getAuthProvider() };
	}
	async initialize(framework) {
		this.#authProvider = createAuthProvider(await core_admin__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.getSdk(framework));
		this.status = "active";
	}
};

//#region src/types.ts
/**
* Standard error type for account-related operations
*/
var AccountError = class extends Error {
	details;
	fields;
	constructor(message, statusCode, details, fields) {
		super(message);
		this.statusCode = statusCode;
		this.name = "AccountError";
		this.details = details;
		this.fields = fields;
	}
	toJSON() {
		return {
			details: this.details,
			fields: this.fields,
			message: this.message,
			statusCode: this.statusCode
		};
	}
};
/**
* Helper function to normalize field values
*/
function normalizeFields(fields) {
	if (!fields) return void 0;
	const normalized = {};
	for (const [key, value] of Object.entries(fields)) if (Array.isArray(value)) normalized[key] = value.join(", ");
	else if (value === null || value === void 0) normalized[key] = "";
	else if (typeof value === "object") normalized[key] = JSON.stringify(value);
	else normalized[key] = String(value);
	return normalized;
}
/**
* Extract error details from a response JSON object
*/
function extractErrorDetails(data) {
	let result = {
		message: "",
		details: void 0,
		fields: void 0
	};
	if (data?.error) {
		if (typeof data.error === "string") result.message = data.error;
		else if (data.error?.message) {
			result.message = data.error.message;
			result.details = data.error.details;
			result.fields = normalizeFields(data.error.fields);
		}
	} else if (data?.message) {
		result.message = data.message;
		result.details = data.details;
		result.fields = normalizeFields(data.fields);
	} else result.message = JSON.stringify(data);
	if (!result.fields) result.fields = normalizeFields(data?.fields) || normalizeFields(data?.error?.fields);
	return result;
}
/**
* Convert a failed fetch Response to an AccountError
* @param response The failed Response object
* @returns A properly formatted AccountError
*/
async function handleFetchError(response) {
	try {
		const isJson = response.headers.get("content-type")?.toLowerCase()?.includes("json");
		const clone = response.clone();
		let errorData;
		if (isJson) try {
			errorData = await response.json();
		} catch {
			errorData = await clone.text().catch(() => "") || response.statusText;
		}
		else {
			errorData = await response.text();
			if (!errorData) errorData = response.statusText;
		}
		const { message, details, fields } = typeof errorData === "string" ? { message: errorData } : extractErrorDetails(errorData);
		return new AccountError(message || "Unknown error", response.status, details, fields);
	} catch (e) {
		return new AccountError(response.statusText || "Unknown error", response.status, { cause: e });
	}
}
/**
* Convert an unknown error to an AccountError
* @param e The unknown error
* @returns A properly formatted AccountError
*/
function handleUnknownError(e) {
	if (e instanceof AccountError) return e;
	if (e instanceof Error) return new AccountError(e.message, 500, { cause: e });
	if (typeof e === "object" && e !== null) {
		let msg;
		try {
			msg = JSON.stringify(e);
		} catch {
			msg = String(e);
		}
		return new AccountError(msg, 500, { cause: e });
	}
	return new AccountError(String(e), 500);
}

//#region src/http-utils.ts
/**
* Creates a promise that resolves after a specified delay
* @param ms Delay in milliseconds
* @returns Promise that resolves after the delay
*/
function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
* Polls a fetch function until a condition is met or timeout occurs
* @template T The type of data returned by the fetch function
* @param fetchFn Function that fetches the current state
* @param shouldStop Predicate function that determines when to stop polling
* @param options Polling options (interval, timeout)
* @returns Promise resolving to the final fetch result
*/
async function poll(fetchFn, shouldStop, options = {}) {
	const { interval = 2e3, timeout = 3e5 } = options;
	const startTime = Date.now();
	const timeoutMs = timeout;
	const pollInternal = async () => {
		if (Date.now() - startTime >= timeoutMs) return {
			error: new AccountError(`Polling timed out after ${timeout}ms`, 408),
			success: false
		};
		const result = await fetchFn();
		if (!result.success) return result;
		if (result.data && shouldStop(result.data)) return result;
		const remainingTime = timeoutMs - (Date.now() - startTime);
		await delay(Math.min(interval, remainingTime));
		return pollInternal();
	};
	return pollInternal();
}
/**
* Checks if a response has an empty body based on status code or content-length header
* @param {Response} response - The response to check
* @returns {boolean} True if the response is empty, false otherwise
*/
function isEmptyResponse(response) {
	if ([
		204,
		205,
		304
	].includes(response.status)) return true;
	const contentLength = response.headers.get("content-length");
	return !!(contentLength === "0" || contentLength && parseInt(contentLength, 10) === 0);
}
/**
* Safely parses a response body, handling empty responses
* @param {Response} response - The response to parse
* @returns {Promise<T>} The parsed data or undefined for empty responses
*/
async function parseResponse(response) {
	if (isEmptyResponse(response)) return;
	try {
		return await response.json();
	} catch (error) {
		if (isEmptyResponse(response)) return;
		throw error;
	}
}

//#region src/operators.ts
/**
* Logical operators for conditional filters (including "not" to match Go implementation)
*/
const LOGICAL_OPERATORS = {
	AND: "and",
	OR: "or",
	NOT: "not"
};
/**
* Comparison operators for field filters
*/
const COMPARISON_OPERATORS = {
	NE: "ne",
	LT: "lt",
	GT: "gt",
	LTE: "lte",
	GTE: "gte",
	IN: "in",
	NIN: "nin",
	CONTAINS: "contains",
	NCONTAINS: "ncontains",
	CONTAINSS: "containss",
	NCONTAINSS: "ncontainss",
	BETWEEN: "between",
	NBETWEEN: "nbetween",
	NULL: "null",
	NNULL: "nnull",
	STARTSWITH: "startswith",
	NSTARTSWITH: "nstartswith",
	STARTSWITHS: "startswiths",
	NSTARTSWITHS: "nstartswiths",
	ENDSWITH: "endswith",
	NENDSWITH: "nendswith",
	ENDSWITHS: "endswiths",
	NENDSWITHS: "nendswiths",
	INA: "ina",
	NINA: "nina"
};
/**
* Maps Refine operators to query parameter format
* Empty string means the operator is omitted in the query params (default to eq)
*/
function mapOperator(operator) {
	const mapped = {
		and: LOGICAL_OPERATORS.AND,
		or: LOGICAL_OPERATORS.OR,
		not: LOGICAL_OPERATORS.NOT,
		eq: "",
		ne: COMPARISON_OPERATORS.NE,
		lt: COMPARISON_OPERATORS.LT,
		gt: COMPARISON_OPERATORS.GT,
		lte: COMPARISON_OPERATORS.LTE,
		gte: COMPARISON_OPERATORS.GTE,
		in: COMPARISON_OPERATORS.IN,
		nin: COMPARISON_OPERATORS.NIN,
		contains: COMPARISON_OPERATORS.CONTAINS,
		ncontains: COMPARISON_OPERATORS.NCONTAINS,
		containss: COMPARISON_OPERATORS.CONTAINSS,
		ncontainss: COMPARISON_OPERATORS.NCONTAINSS,
		between: COMPARISON_OPERATORS.BETWEEN,
		nbetween: COMPARISON_OPERATORS.NBETWEEN,
		null: COMPARISON_OPERATORS.NULL,
		nnull: COMPARISON_OPERATORS.NNULL,
		startswith: COMPARISON_OPERATORS.STARTSWITH,
		nstartswith: COMPARISON_OPERATORS.NSTARTSWITH,
		startswiths: COMPARISON_OPERATORS.STARTSWITHS,
		nstartswiths: COMPARISON_OPERATORS.NSTARTSWITHS,
		endswith: COMPARISON_OPERATORS.ENDSWITH,
		nendswith: COMPARISON_OPERATORS.NENDSWITH,
		endswiths: COMPARISON_OPERATORS.ENDSWITHS,
		nendswiths: COMPARISON_OPERATORS.NENDSWITHS,
		ina: COMPARISON_OPERATORS.INA,
		nina: COMPARISON_OPERATORS.NINA
	}[operator];
	if (mapped === void 0) throw new Error(`Unsupported operator: ${operator}`);
	return mapped;
}
/**
* Operators that require array values
*/
const ARRAY_OPERATORS = new Set([
	COMPARISON_OPERATORS.IN,
	COMPARISON_OPERATORS.NIN,
	COMPARISON_OPERATORS.INA,
	COMPARISON_OPERATORS.NINA,
	COMPARISON_OPERATORS.BETWEEN,
	COMPARISON_OPERATORS.NBETWEEN
]);
/**
* Check if an operator requires array values
*/
function isArrayOperator(operator) {
	return ARRAY_OPERATORS.has(operator);
}

//#region src/serializer.ts
/**
* Serializes Refine filters and sorters to URL query parameters
*/
function serializeQueryParams(input) {
	const params = {};
	if (input.filters) {
		const filterParams = serializeFilters(input.filters);
		Object.assign(params, filterParams);
	}
	if (input.sorters) {
		const sortParams = serializeSorters(input.sorters);
		Object.assign(params, sortParams);
	}
	if (input.pagination) {
		const paginationParams = serializePagination(input.pagination);
		Object.assign(params, paginationParams);
	}
	return params;
}
/**
* Serializes array operator with indexed parameters
*/
function serializeArrayOperator(field, operator, values, basePath, params) {
	const arrayBasePath = [
		...basePath,
		field,
		operator
	];
	for (let i = 0; i < values.length; i++) {
		const key = buildPath([...arrayBasePath, String(i)]);
		params[key] = encodeURIComponent(String(values[i]));
	}
}
/**
* Serializes filters to query parameters
*/
function serializeFilters(filters) {
	const params = {};
	let hasGlobalSearch = false;
	for (const filter of filters) if (filter.operator === LOGICAL_OPERATORS.OR) serializeOrCondition(filter, params);
	else if (filter.operator === LOGICAL_OPERATORS.AND) serializeAndCondition(filter, params);
	else if (filter.operator === LOGICAL_OPERATORS.NOT) serializeNotCondition(filter, params);
	else if ("field" in filter) if (filter.field === "q") {
		if (hasGlobalSearch) {
			console.warn("Only one global search (q) filter allowed");
			continue;
		}
		hasGlobalSearch = true;
		const processed = processCondition(filter);
		if (processed) params[processed.path.join("")] = processed.value;
	} else if (isArrayOperator(filter.operator) && Array.isArray(filter.value)) serializeArrayOperator(filter.field, filter.operator, filter.value, ["filters"], params);
	else {
		const processed = processCondition(filter);
		if (processed) {
			const key = buildPath(["filters", ...processed.path]);
			params[key] = processed.value;
		}
	}
	return params;
}
/**
* Serializes a logical condition (AND, OR, NOT)
*/
function serializeLogicalCondition(filter, operator, params) {
	if (filter.operator !== operator || !Array.isArray(filter.value)) return;
	const basePath = ["filters", operator];
	const startIndex = 0;
	for (let i = 0; i < filter.value.length; i++) {
		const condition = filter.value[i];
		serializeCondition(condition, [...basePath, String(startIndex + i)], params);
	}
}
/**
* Serializes a condition (field filter or nested logical)
*/
function serializeCondition(condition, basePath, params) {
	if ("operator" in condition && isArrayOperator(condition.operator) && Array.isArray(condition.value)) serializeArrayOperator(condition.field, condition.operator, condition.value, basePath, params);
	else if ("operator" in condition && Array.isArray(condition.value)) serializeNestedCondition(condition, basePath, params);
	else {
		const processed = processCondition(condition);
		if (processed) {
			const key = buildPath([...basePath, ...processed.path]);
			params[key] = processed.value;
		}
	}
}
/**
* Serializes an OR condition
*/
function serializeOrCondition(filter, params) {
	serializeLogicalCondition(filter, LOGICAL_OPERATORS.OR, params);
}
/**
* Serializes an AND condition
*/
function serializeAndCondition(filter, params) {
	serializeLogicalCondition(filter, LOGICAL_OPERATORS.AND, params);
}
/**
* Serializes a NOT condition
*/
function serializeNotCondition(filter, params) {
	serializeLogicalCondition(filter, LOGICAL_OPERATORS.NOT, params);
}
/**
* Serializes a nested condition (AND, OR, NOT) within another condition
*/
function serializeNestedCondition(filter, basePath, params) {
	if (!("operator" in filter) || !Array.isArray(filter.value)) return;
	const op = filter.operator;
	if (op !== LOGICAL_OPERATORS.AND && op !== LOGICAL_OPERATORS.OR && op !== LOGICAL_OPERATORS.NOT) return;
	const conditionPath = [...basePath, op];
	for (let i = 0; i < filter.value.length; i++) {
		const condition = filter.value[i];
		const subConditionPath = [...conditionPath, String(i)];
		if ("field" in condition && "operator" in condition && isArrayOperator(condition.operator) && Array.isArray(condition.value)) {
			const basePath2 = [
				...subConditionPath,
				condition.field,
				condition.operator
			];
			for (let j = 0; j < condition.value.length; j++) {
				const key = buildPath([...basePath2, String(j)]);
				params[key] = encodeURIComponent(String(condition.value[j]));
			}
		} else if ("operator" in condition && Array.isArray(condition.value)) serializeNestedCondition(condition, subConditionPath, params);
		else if ("field" in condition) {
			const processed = processCondition(condition);
			if (processed) {
				const key = buildPath([...subConditionPath, ...processed.path]);
				params[key] = processed.value;
			}
		}
	}
}
/**
* Processes a single filter condition
*/
function processCondition(condition) {
	if ("operator" in condition && Array.isArray(condition.value)) {
		const op = condition.operator;
		if (op === LOGICAL_OPERATORS.AND || op === LOGICAL_OPERATORS.OR || op === LOGICAL_OPERATORS.NOT) return null;
	}
	if (condition.field === "q") return {
		path: ["q"],
		value: encodeURIComponent(String(condition.value))
	};
	if (!condition.field) return null;
	let value = condition.value;
	const path = [condition.field];
	try {
		const operator = mapOperator(condition.operator);
		if (operator) path.push(operator);
	} catch (e) {
		if (condition.operator) path.push(String(condition.operator));
	}
	if (condition.operator === "null" || condition.operator === "nnull") value = "";
	else value = encodeURIComponent(String(value));
	return {
		path,
		value
	};
}
/**
* Builds a bracketed path from segments
*/
function buildPath(segments) {
	return segments.reduce((acc, segment) => {
		return acc ? `${acc}[${segment}]` : segment;
	}, "");
}
/**
* Serializes sorters to query parameters
*/
function serializeSorters(sorters) {
	if (!sorters?.length) return {};
	const validSorters = sorters.filter((s) => s.field && (s.order === void 0 || ["asc", "desc"].includes(s.order.toLowerCase())));
	if (!validSorters.length) return {};
	return {
		_sort: validSorters.map((s) => encodeURIComponent(s.field)).join(","),
		_order: validSorters.map((s) => encodeURIComponent(s.order?.toLowerCase() || "asc")).join(",")
	};
}
/**
* Serializes pagination to query parameters
*/
function serializePagination(pagination) {
	if (!pagination) return {};
	const params = {};
	if (pagination.start !== void 0) params._start = String(pagination.start);
	if (pagination.end !== void 0) params._end = String(pagination.end);
	return params;
}

//#region src/query-utils.ts
/**
* Builds URL query parameters for operations API
*
* Serializes query-builder parameters to the API's expected format:
* - filters → filters[field][operator]=value
* - sorters → _sort=field&_order=direction
* - pagination → _start=0&_end=20
* - search → search=value
*
* @param params - Query parameters using query-builder helpers
* @returns URLSearchParams object ready to use with fetch
*
* @example
* ```ts
* const searchParams = buildOperationsQueryParams({
*   filters: [
*     { field: "status", operator: "eq", value: "completed" },
*     { field: "operation", operator: "in", value: ["upload", "download"] }
*   ],
*   sorters: [{ field: "id", order: "desc" }],
*   pagination: { start: 0, end: 20, page: 1, pageSize: 20 },
*   search: "myfile"
* });
*
* // Result URL: ?filters[status][eq]=completed&filters[operation][in][0]=upload&filters[operation][in][1]=download&_sort=id&_order=desc&_start=0&_end=20&search=myfile
* ```
*/
function buildOperationsQueryParams(params) {
	const queryString = serializeQueryParams({
		filters: params.filters,
		sorters: params.sorters,
		pagination: params.pagination
	});
	const searchParams = new URLSearchParams(queryString);
	if (params.search) searchParams.set("search", params.search);
	return searchParams;
}

//#region src/account.ts
/**
* Operation status constants
*/
const OPERATION_STATUS = {
	COMPLETED: "completed",
	FAILED: "failed",
	ERROR: "error"};
/**
* Default settled states for operations
*/
const DEFAULT_SETTLED_STATES = [
	OPERATION_STATUS.COMPLETED,
	OPERATION_STATUS.FAILED,
	OPERATION_STATUS.ERROR
];
var AccountApi = class {
	_jwtToken;
	apiUrl;
	/**
	* Gets the current JWT token
	* @returns {string|undefined} The current JWT token or undefined if not set
	*/
	get jwtToken() {
		return this._jwtToken;
	}
	/**
	* Creates a new AccountApi instance
	* @param {string} apiUrl - The base API URL
	*/
	constructor(apiUrl) {
		const apiUrlParsed = new URL(apiUrl);
		apiUrlParsed.hostname = `account.${apiUrlParsed.hostname}`;
		this.apiUrl = apiUrlParsed.toString();
	}
	/**
	* Clears the current JWT token
	*/
	clearToken() {
		this._jwtToken = void 0;
	}
	/**
	* Confirm a password reset
	* @param passwordResetVerifyRequest Password reset verification details
	* @returns Result indicating success or failure
	*/
	async confirmPasswordReset(passwordResetVerifyRequest) {
		return this.fetchJson("/api/account/password-reset/confirm", {
			body: JSON.stringify(passwordResetVerifyRequest),
			method: "POST"
		});
	}
	/**
	* Disable OTP for two-factor authentication
	* @param otpDisableRequest OTP disable request details
	* @returns Result indicating success or failure
	*/
	async disableOtp(otpDisableRequest) {
		return this.fetchJson("/api/auth/otp/disable", {
			body: JSON.stringify(otpDisableRequest),
			method: "POST"
		});
	}
	/**
	* Generate OTP for two-factor authentication
	* @returns Result containing OTP response
	*/
	async generateOtp() {
		return this.fetchJson("/api/auth/otp/generate", { method: "GET" });
	}
	/**
	* Get account information
	* @returns Result containing account info
	*/
	async info() {
		return this.fetchJson("/api/account", { method: "GET" });
	}
	/**
	* Login to the account service
	* @param loginRequest Login credentials
	* @returns Result containing login response or error
	*/
	async login(loginRequest) {
		const result = await this.fetchJson("/api/auth/login", {
			body: JSON.stringify(loginRequest),
			method: "POST"
		});
		if (result.success && result.data?.token) this.setToken(result.data.token);
		return result;
	}
	/**
	* Logout from the account service
	* @returns Result indicating success or failure
	*/
	async logout() {
		const result = await this.fetchJson("/api/auth/logout", { method: "POST" });
		if (result.success) this.clearToken();
		return result;
	}
	/**
	* Check authentication status
	* @returns Result containing ping response
	*/
	async ping() {
		const result = await this.fetchJson("/api/auth/ping", { method: "POST" });
		if (result.success && result.data?.token) this.setToken(result.data.token);
		return result;
	}
	/**
	* Register a new account
	* @param registerRequest Registration details
	* @returns Result indicating success or failure
	*/
	async register(registerRequest) {
		return this.fetchJson("/api/auth/register", {
			body: JSON.stringify(registerRequest),
			method: "POST"
		});
	}
	/**
	* Request account deletion
	* @returns Result indicating success or failure
	*/
	async requestAccountDeletion() {
		return this.fetchJson("/api/account/delete", { method: "DELETE" });
	}
	/**
	* Request email verification to be resent
	* @param resendRequest Email details for verification
	* @returns Result indicating success or failure
	*/
	async requestEmailVerification(resendRequest) {
		return this.fetchJson("/api/account/verify-email/resend", {
			body: JSON.stringify(resendRequest),
			method: "POST"
		});
	}
	/**
	* Request a password reset
	* @param passwordResetRequest Password reset request details
	* @returns Result indicating success or failure
	*/
	async requestPasswordReset(passwordResetRequest) {
		return this.fetchJson("/api/account/password-reset/request", {
			body: JSON.stringify(passwordResetRequest),
			method: "POST"
		});
	}
	/**
	* Sets the JWT token for authentication
	* @param {string} token - The JWT token to set
	*/
	setToken(token) {
		this._jwtToken = token;
	}
	/**
	* Update account email address
	* @param email New email address
	* @param password Current password for verification
	* @returns Result indicating success or failure
	*/
	async updateEmail(email, password) {
		return this.fetchJson("/api/account/update-email", {
			body: JSON.stringify({
				email,
				password
			}),
			method: "POST"
		});
	}
	/**
	* Update account password
	* @param currentPassword Current password for verification
	* @param newPassword New password to set
	* @returns Result indicating success or failure
	*/
	async updatePassword(currentPassword, newPassword) {
		return this.fetchJson("/api/account/update-password", {
			body: JSON.stringify({
				current_password: currentPassword,
				new_password: newPassword
			}),
			method: "POST"
		});
	}
	/**
	* Get upload limit information
	* @returns Result containing upload limit info
	*/
	async uploadLimit() {
		return this.fetchJson("/api/upload-limit", { method: "GET" });
	}
	/**
	* Validate OTP for two-factor authentication login
	* @param otpValidateRequest OTP validation details
	* @returns Result containing login response
	*/
	async validateOtp(otpValidateRequest) {
		const result = await this.fetchJson("/api/auth/otp/validate", {
			body: JSON.stringify(otpValidateRequest),
			method: "POST"
		});
		if (result.success && result.data?.token) this.setToken(result.data.token);
		return result;
	}
	/**
	* Verify email address
	* @param verifyEmailRequest Email verification details
	* @param login Optional flag to enable auto-login after verification
	* @returns Result indicating success or failure
	*/
	async verifyEmail(verifyEmailRequest, login) {
		const url = new URL("/api/account/verify-email", this.apiUrl);
		if (login === true) url.searchParams.set("login", "true");
		return this.fetchJson(url.toString(), {
			body: JSON.stringify(verifyEmailRequest),
			method: "POST"
		});
	}
	/**
	* Verify OTP for enabling two-factor authentication
	* @param otpVerifyRequest OTP verification details
	* @returns Result indicating success or failure
	*/
	async verifyOtp(otpVerifyRequest) {
		return this.fetchJson("/api/auth/otp/verify", {
			body: JSON.stringify(otpVerifyRequest),
			method: "POST"
		});
	}
	/**
	* List operations with filtering, searching, and pagination
	* 
	* @param params Query parameters using query-builder helpers
	* @returns Result containing list of operations
	* 
	* @example
	* ```ts
	* const result = await accountApi.listOperations({
	*   filters: [
	*     { field: "status", operator: "eq", value: "completed" },
	*     { field: "operation", operator: "in", value: ["upload", "download"] }
	*   ],
	*   sorters: [{ field: "id", order: "desc" }],
	*   pagination: { start: 0, end: 20, page: 1, pageSize: 20 },
	*   search: "myfile"
	* });
	* ```
	*/
	async listOperations(params) {
		const url = new URL("/api/operations", this.apiUrl);
		if (params) buildOperationsQueryParams(params).forEach((value, key) => {
			url.searchParams.append(key, value);
		});
		return this.fetchJson(url.toString(), { method: "GET" });
	}
	/**
	* Get detailed information for a specific operation
	* @param id The operation ID
	* @returns Result containing operation details
	*/
	async getOperation(id) {
		return this.fetchJson(`/api/operations/${id}`, { method: "GET" });
	}
	/**
	* Get available filter values for operations
	* @returns Result containing filter options
	*/
	async getOperationFilters() {
		return this.fetchJson("/api/operations/filters", { method: "GET" });
	}
	/**
	* Wait for an operation to complete or reach a settled state
	* @param id The operation ID to wait for
	* @param options Polling options (interval, timeout, settledStates)
	* @returns Result containing the final operation details
	*/
	async waitForOperation(id, options = {}) {
		const { interval = 2e3, timeout = 3e5, settledStates = DEFAULT_SETTLED_STATES } = options;
		const settledStatesSet = new Set(settledStates);
		return poll(() => this.getOperation(id), (operation) => {
			return !!(operation.status && settledStatesSet.has(operation.status.toLowerCase()));
		}, {
			interval,
			timeout
		});
	}
	/**
	* Builds fetch options with authorization headers
	* @param {RequestInit} [init] - Optional initial request options
	* @returns {RequestInit} The constructed request options
	* @private
	*/
	buildOptions(init = {}) {
		const headers = {
			"Content-Type": "application/json",
			...init.headers
		};
		if (this.jwtToken) headers.Authorization = `Bearer ${this.jwtToken}`;
		return {
			...init,
			credentials: "include",
			headers
		};
	}
	/**
	* Makes a JSON request to the API
	* @template T
	* @param {string} input - The API endpoint path or absolute URL
	* @param {RequestInit} [init] - Optional request initialization
	* @returns {Promise<Result<T>>} Promise resolving to the result
	* @private
	*/
	async fetchJson(input, init = {}) {
		try {
			const response = await fetch(new URL(input, this.apiUrl).toString(), this.buildOptions(init));
			if (!response.ok) return {
				error: await handleFetchError(response),
				success: false
			};
			return {
				data: await parseResponse(response),
				success: true
			};
		} catch (e) {
			let error;
			if (e instanceof Response) error = await handleFetchError(e);
			else error = await handleUnknownError(e);
			return {
				error,
				success: false
			};
		}
	}
};

//#region src/sdk.ts
var Sdk = class {
	accountApi;
	constructor(apiUrl) {
		if (!apiUrl) throw new Error("API URL is required");
		this.accountApi = new AccountApi(apiUrl);
	}
	account() {
		return this.accountApi;
	}
	setAuthToken(token) {
		this.accountApi.setToken(token);
	}
};

//#region src/capabilities/sdk.ts
var Capability = class {
	id = "core:sdk-auth";
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
			const apiUrl = core_admin__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.getApiBaseUrl({ currentUrl: framework.portalUrl });
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
