import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__-CQeXjHLK.js';
import { createAuthProvider, DATA_PROVIDER_NAME } from './auth-D5nujfuN.js';
import './resetPassword.schema-7ukd_c3p.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__, React, jsxRuntimeExports } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__-D-EDec9Y.js';
import { core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__-ImaNZ9yu.js';
import './core_dashboard__loadShare__react_mf_2_router__loadShare__-BFaT_n3N.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__-BRPNVk8X.js';
import { Manager, createSmallFilePlugin, createLargeFilePlugin } from './Manager-Pgymjjj8.js';
import { UPLOAD_TYPE_MAIN } from './upload-Cr_MDl4Y.js';
import { object, string } from './schemas-BzkPIUef.js';
import { ZodIssueCode } from './compat-CL8KLCd1.js';
import { Mail } from './mail-BKATm_cn.js';
import { createLucideIcon } from './createLucideIcon-a23Vw1TY.js';
import { User } from './user-BKMQEmug.js';
import { Key } from './key-BrIpUL_0.js';

/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$3 = [
  [
    "path",
    {
      d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",
      key: "169zse"
    }
  ]
];
const Activity = createLucideIcon("activity", __iconNode$3);

/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$2 = [
  ["rect", { width: "7", height: "9", x: "3", y: "3", rx: "1", key: "10lvy0" }],
  ["rect", { width: "7", height: "5", x: "14", y: "3", rx: "1", key: "16une8" }],
  ["rect", { width: "7", height: "9", x: "14", y: "12", rx: "1", key: "1hutg5" }],
  ["rect", { width: "7", height: "5", x: "3", y: "16", rx: "1", key: "ldoo1y" }]
];
const LayoutDashboard = createLucideIcon("layout-dashboard", __iconNode$2);

/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$1 = [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ]
];
const Shield = createLucideIcon("shield", __iconNode$1);

/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode = [
  ["path", { d: "M10 15H6a4 4 0 0 0-4 4v2", key: "1nfge6" }],
  ["path", { d: "m14.305 16.53.923-.382", key: "1itpsq" }],
  ["path", { d: "m15.228 13.852-.923-.383", key: "eplpkm" }],
  ["path", { d: "m16.852 12.228-.383-.923", key: "13v3q0" }],
  ["path", { d: "m16.852 17.772-.383.924", key: "1i8mnm" }],
  ["path", { d: "m19.148 12.228.383-.923", key: "1q8j1v" }],
  ["path", { d: "m19.53 18.696-.382-.924", key: "vk1qj3" }],
  ["path", { d: "m20.772 13.852.924-.383", key: "n880s0" }],
  ["path", { d: "m20.772 16.148.924.383", key: "1g6xey" }],
  ["circle", { cx: "18", cy: "15", r: "3", key: "gjjjvw" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
];
const UserCog = createLucideIcon("user-cog", __iconNode);

//#region src/capabilities/refineConfig.ts
var Capability$2 = class Capability {
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
		this.#authProvider = createAuthProvider(await core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.getSdk(framework));
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
function delay$1(ms) {
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
		await delay$1(Math.min(interval, remainingTime));
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
async function parseResponse$1(response) {
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

//#region src/pagination.ts
/**
* Calculates pagination from page and pageSize
*/
function calculatePagination(page, pageSize) {
	return {
		start: (page - 1) * pageSize,
		end: page * pageSize,
		page,
		pageSize
	};
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
				data: await parseResponse$1(response),
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
var Capability$1 = class Capability {
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
			const apiUrl = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.getApiBaseUrl({ currentUrl: framework.portalUrl });
			if (apiUrl === false) throw new Error("Invalid API URL configuration");
			this.#sdk = new Sdk(apiUrl);
		} catch (error) {
			throw new Error(`SDK initialization failed: ${error instanceof Error ? error.message : String(error)}`);
		}
	}
};

const PROTOCOL_CAPABILITY_TYPE = "core:protocol";
const UPLOAD_CAPABILITY_TYPE = "core:upload";
class Feature {
  id = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.createNamespacedId("dashboard", "upload");
  status;
  version = "0.1.0";
  #uploadManager;
  addEvent(event, callback) {
    return this.#uploadManager.addEvent(event, callback);
  }
  // Expose upload manager methods
  addFile(file, serviceId) {
    return this.#uploadManager.addFile(file, serviceId);
  }
  cancelAll() {
    return this.#uploadManager.cancelAll();
  }
  clearErrors() {
    return this.#uploadManager.clearErrors();
  }
  async destroy(framework) {
    this.#uploadManager.reset();
  }
  getFiles() {
    return this.#uploadManager.getFiles();
  }
  getManager() {
    return this.#uploadManager;
  }
  /**
   * Get all protocol capabilities that have associated upload capabilities
   */
  async getProtocolsWithUpload(framework) {
    const protocols = [];
    const protocolCapabilities = await framework.getCapabilitiesByType(
      PROTOCOL_CAPABILITY_TYPE
    );
    for (const protocol of protocolCapabilities) {
      const associatedIds = await framework.getAssociatedCapabilities(
        protocol.id
      );
      const associatedCaps = await Promise.all(
        associatedIds.map((id) => framework.getCapability(id))
      );
      if (associatedCaps.some((cap) => cap && cap.type === UPLOAD_CAPABILITY_TYPE)) {
        protocols.push(protocol);
      }
    }
    return protocols;
  }
  getServices() {
    return this.#uploadManager.getServices();
  }
  serviceSupportsFolderUpload(serviceId) {
    return this.#uploadManager.serviceSupportsFolderUpload(serviceId);
  }
  /**
   * Get upload capabilities associated with a specific protocol
   */
  async getUploadCapabilitiesForProtocol(framework, protocolId) {
    const associatedIds = await framework.getAssociatedCapabilities(protocolId);
    const associatedCaps = await Promise.all(
      associatedIds.map((id) => framework.getCapability(id))
    );
    return associatedCaps.filter(
      (cap) => cap && cap.type === UPLOAD_CAPABILITY_TYPE
    );
  }
  getUploadedFiles() {
    return this.#uploadManager.getUploadedFiles();
  }
  getUploadErrors() {
    return this.#uploadManager.getUploadErrors();
  }
  getUploadProgress() {
    return this.#uploadManager.getUploadProgress();
  }
  getUploadStatus() {
    return this.#uploadManager.getUploadStatus();
  }
  async initialize(framework) {
    const sdk = await core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.getSdk(framework);
    this.#uploadManager = new Manager({ sdk, type: UPLOAD_TYPE_MAIN });
    await this.#uploadManager.init();
    const protocolCapabilities = await this.getProtocolsWithUpload(framework);
    for (const protocol of protocolCapabilities) {
      const uploadCapabilities = await this.getUploadCapabilitiesForProtocol(
        framework,
        protocol.id
      );
      if (uploadCapabilities.length > 0) {
        const uploadCapability = uploadCapabilities[0];
        const additionalPlugins = uploadCapability.getAdditionalPlugins();
        const folderBundlerPlugin = additionalPlugins.find(
          (plugin) => plugin.name === "FolderBundler"
        );
        const serviceConfig = {
          id: protocol.id,
          largeFilePlugin: createLargeFilePlugin(
            uploadCapability.getLargeFileUploadConfig(),
            protocol.id,
            uploadCapability.getLargeFilePlugin?.()
          ),
          name: protocol.id,
          smallFilePlugin: createSmallFilePlugin(
            uploadCapability.getSmallFileUploadConfig(),
            protocol.id,
            uploadCapability.getSmallFilePlugin?.()
          ),
          ...folderBundlerPlugin && {
            folderBundlerPlugin: {
              module: folderBundlerPlugin.module,
              options: folderBundlerPlugin.options || {}
            }
          }
        };
        this.#uploadManager.registerService(serviceConfig);
        for (const plugin of additionalPlugins) {
          if (plugin.name !== "FolderBundler") {
            this.#uploadManager.registerAdditionalPlugin(plugin);
          }
        }
      }
    }
  }
  off(event, callback) {
    return this.#uploadManager.off(event, callback);
  }
  // Expose Uppy's event system directly
  on(event, callback) {
    return this.#uploadManager.on(event, callback);
  }
  removeFile(id) {
    return this.#uploadManager.removeFile(id);
  }
  setUIDropTarget(target, serviceId) {
    return this.#uploadManager.setUIDropTarget(target, serviceId);
  }
  start() {
    return this.#uploadManager.start();
  }
}

const schema = object({
  email: string().email(),
  password: string(),
  password_confirm: string()
}).superRefine((data, ctx) => {
  if (data.password !== data.password_confirm) {
    return ctx.addIssue({
      code: ZodIssueCode.custom,
      message: "Passwords do not match",
      path: ["password_confirm"]
    });
  }
  return true;
});

function updateEmailForm() {
  return {
    formId: "update_email",
    actionButtonsLayout: "horizontal",
    fields: [
      {
        label: "New Email Address",
        name: "email",
        type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormFieldType.TEXT
      },
      {
        label: "Password",
        name: "password",
        type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormFieldType.PASSWORD
      },
      {
        label: "Retype Password",
        name: "password_confirm",
        type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormFieldType.PASSWORD
      }
    ],
    validationSchema: schema
  };
}

function updateEmailDialogConfig(updateEmailHook, refetch) {
  let onSuccess = async () => {
  };
  if (refetch) {
    onSuccess = async () => {
      return refetch();
    };
  }
  return {
    formConfig: updateEmailForm(),
    onSubmit: (req) => {
      return updateEmailHook.mutateAsync({
        dataProviderName: "account",
        errorNotification: (error) => {
          return {
            description: error?.message || "Please check your password and try again",
            message: "Failed to Update Email",
            type: "error"
          };
        },
        method: "post",
        successNotification: () => {
          return {
            description: "Your email address has been changed",
            message: "Email Updated Successfully",
            type: "success"
          };
        },
        url: "/account/update-email",
        values: {
          email: req.email,
          password: req.password
        }
      });
    },
    onSuccess,
    title: "Change Email",
    type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogTypes.FORM
  };
}

const AccountEmail = React.forwardRef(
  ({ className = "", value }, ref) => {
    const { openDialog } = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.useDialog();
    const { formInstance } = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.useFormContext();
    const refetch = "refineCore" in formInstance && formInstance.refineCore?.queryResult?.refetch ? formInstance.refineCore.queryResult.refetch : void 0;
    const customHook = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useCustomMutation();
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("flex w-full items-center gap-2", className),
        ref,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Input,
            {
              className: "w-full text-white",
              fullWidth: true,
              id: "email",
              readOnly: true,
              type: "email",
              value
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button,
            {
              className: "bg-transparent hover:text-white",
              onClick: (e) => {
                e.preventDefault();
                openDialog(updateEmailDialogConfig(customHook, refetch));
              },
              size: "sm",
              variant: "outline",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4" })
            }
          )
        ]
      }
    );
  }
);
function registerInput() {
  core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.registerFormComponent("dashboard:account.email", AccountEmail);
}

const _htmlEscape = string => string
	.replace(/&/g, '&amp;')
	.replace(/"/g, '&quot;')
	.replace(/'/g, '&#39;')
	.replace(/</g, '&lt;')
	.replace(/>/g, '&gt;');

function htmlEscape(strings, ...values) {
	if (typeof strings === 'string') {
		return _htmlEscape(strings);
	}

	let output = strings[0];
	for (const [index, value] of values.entries()) {
		output = output + _htmlEscape(String(value)) + strings[index + 1];
	}

	return output;
}

class MissingValueError extends Error {
	constructor(key) {
		super(`Missing a value for ${key ? `the placeholder: ${key}` : 'a placeholder'}`, key);
		this.name = 'MissingValueError';
		this.key = key;
	}
}

class MissingFilterError extends Error {
	constructor(filterName) {
		super(`Missing filter: ${filterName}`);
		this.name = 'MissingFilterError';
		this.filterName = filterName;
	}
}

function pupa(template, data, {ignoreMissing = false, transform = ({value}) => value, filters = {}} = {}) {
	if (typeof template !== 'string') {
		throw new TypeError(`Expected a \`string\` in the first argument, got \`${typeof template}\``);
	}

	if (typeof data !== 'object') {
		throw new TypeError(`Expected an \`object\` or \`Array\` in the second argument, got \`${typeof data}\``);
	}

	// Handle escape sequences for literal braces
	const escapedLeftBrace = '\uE000\uE001\uE002'; // Private use characters as temporary marker
	const escapedRightBrace = '\uE003\uE004\uE005'; // Private use characters as temporary marker

	template = template.replace(/\\{/g, escapedLeftBrace);
	template = template.replace(/\\}/g, escapedRightBrace);

	const parseKeyPath = key => {
		const segments = [];
		let segment = '';

		for (let index = 0; index < key.length; index++) {
			if (key[index] === '\\' && key[index + 1] === '.') {
				segment += '.';
				index++; // Skip escaped dot
			} else if (key[index] === '.') {
				segments.push(segment);
				segment = '';
			} else {
				segment += key[index];
			}
		}

		segments.push(segment);
		return segments;
	};

	const replace = (placeholder, keyWithFilters) => {
		// Parse filters from the key (e.g., "name | capitalize | upper")
		const parts = keyWithFilters.split('|').map(part => part.trim());
		const key = parts[0];
		const filterChain = parts.slice(1);

		// Navigate object path
		const segments = parseKeyPath(key);
		let value = data;
		for (const property of segments) {
			/// value = value?.[property];

			if (value) {
				value = value[property];
			}
		}

		// Apply filters
		for (const filterName of filterChain) {
			const filter = filters[filterName];

			if (!filter) {
				if (ignoreMissing) {
					return placeholder;
				}

				throw new MissingFilterError(filterName);
			}

			if (value !== undefined) {
				value = filter(value);
			}
		}

		const transformedValue = transform({value, key});
		if (transformedValue === undefined) {
			if (ignoreMissing) {
				return placeholder;
			}

			throw new MissingValueError(key);
		}

		return String(transformedValue);
	};

	// ReDoS-safe regex to capture keys with optional filters
	// Matches: {key} or {key | filter} or {key | filter1 | filter2}
	const keyPattern = '(\\d+|[a-z$_][\\w\\-.$\\\\]*)';
	const filterPattern = '(?:\\|\\s*[a-z$_][\\w$]*\\s*)*';
	const keyWithFiltersPattern = `(${keyPattern}\\s*${filterPattern})`;

	const doubleBraceRegex = new RegExp(`{{${keyWithFiltersPattern}}}`, 'gi');
	const singleBraceRegex = new RegExp(`{${keyWithFiltersPattern}}`, 'gi');

	template = template.replace(doubleBraceRegex, (...arguments_) => htmlEscape(replace(...arguments_)));

	template = template.replace(singleBraceRegex, replace);

	// Replace temporary markers with literal braces
	template = template.replace(new RegExp(escapedLeftBrace, 'g'), '{');
	template = template.replace(new RegExp(escapedRightBrace, 'g'), '}');

	return template;
}

//#region src/utils/generateUrl.ts
var NestedParamError = class extends Error {
	constructor(missingParam) {
		super(`Missing required "${missingParam}" in meta.params`);
		this.name = "NestedParamError";
	}
};
var TemplateResolutionError = class extends Error {
	constructor(template, originalError) {
		super(`Failed to resolve template '${template}': ${originalError?.message || "Invalid template syntax"}`);
		this.name = "TemplateResolutionError";
	}
};
function generateNestedUrl({ apiBase = "", id, meta = {}, operation, resource = meta.resource }) {
	const template = meta?.template || (resource ? resource.split(".").map((part, index, arr) => index < arr.length - 1 ? `${part}/{${part}}` : part).join("/") : "");
	const params = meta?.params || meta?.paramsMap || {};
	if (meta?.paramsMap) console.warn("paramsMap is deprecated - use params instead");
	let resolvedPath;
	try {
		resolvedPath = pupa(template, Object.fromEntries(Object.entries(params).map(([k, v]) => [k, encodeURIComponent(v)])));
	} catch (error) {
		if (error instanceof Error && error.message.startsWith("Missing a value")) {
			const paramMatch = /placeholder: (\w+)/.exec(error.message);
			if (paramMatch) throw new NestedParamError(paramMatch[1]);
		}
		throw new TemplateResolutionError(template, error);
	}
	if ((resolvedPath.match(/[{}]/g) || []).length > 0) throw new TemplateResolutionError(template);
	if (id) resolvedPath += `/${id}`;
	if (operation) resolvedPath = `${resolvedPath}/${operation}`.replace(/\/\/+/g, "/");
	return `${resolvedPath.replace(/^\/+/, "")}`;
}

class HTTPError extends Error {
    response;
    request;
    options;
    constructor(response, request, options) {
        const code = (response.status || response.status === 0) ? response.status : '';
        const title = response.statusText ?? '';
        const status = `${code} ${title}`.trim();
        const reason = status ? `status code ${status}` : 'an unknown error';
        super(`Request failed with ${reason}: ${request.method} ${request.url}`);
        this.name = 'HTTPError';
        this.response = response;
        this.request = request;
        this.options = options;
    }
}

/**
Wrapper for non-Error values that were thrown.

In JavaScript, any value can be thrown (not just Error instances). This class wraps such values to ensure consistent error handling.
*/
class NonError extends Error {
    name = 'NonError';
    value;
    constructor(value) {
        let message = 'Non-error value was thrown';
        // Intentionally minimal as this error is just an edge-case.
        try {
            if (typeof value === 'string') {
                message = value;
            }
            else if (value && typeof value === 'object' && 'message' in value && typeof value.message === 'string') {
                message = value.message;
            }
        }
        catch {
            // Use default message if accessing properties throws
        }
        super(message);
        this.value = value;
    }
}

/**
Internal error used to signal a forced retry from afterResponse hooks.
This is thrown when a user returns ky.retry() from an afterResponse hook.
*/
class ForceRetryError extends Error {
    name = 'ForceRetryError';
    customDelay;
    code;
    customRequest;
    constructor(options) {
        // Runtime protection: wrap non-Error causes in NonError
        // TypeScript type is Error for guidance, but JS users can pass anything
        const cause = options?.cause
            ? (options.cause instanceof Error ? options.cause : new NonError(options.cause))
            : undefined;
        super(options?.code ? `Forced retry: ${options.code}` : 'Forced retry', cause ? { cause } : undefined);
        this.customDelay = options?.delay;
        this.code = options?.code;
        this.customRequest = options?.request;
    }
}

const supportsRequestStreams = (() => {
    let duplexAccessed = false;
    let hasContentType = false;
    const supportsReadableStream = typeof globalThis.ReadableStream === 'function';
    const supportsRequest = typeof globalThis.Request === 'function';
    if (supportsReadableStream && supportsRequest) {
        try {
            hasContentType = new globalThis.Request('https://empty.invalid', {
                body: new globalThis.ReadableStream(),
                method: 'POST',
                // @ts-expect-error - Types are outdated.
                get duplex() {
                    duplexAccessed = true;
                    return 'half';
                },
            }).headers.has('Content-Type');
        }
        catch (error) {
            // QQBrowser on iOS throws "unsupported BodyInit type" error (see issue #581)
            if (error instanceof Error && error.message === 'unsupported BodyInit type') {
                return false;
            }
            throw error;
        }
    }
    return duplexAccessed && !hasContentType;
})();
const supportsAbortController = typeof globalThis.AbortController === 'function';
const supportsAbortSignal = typeof globalThis.AbortSignal === 'function' && typeof globalThis.AbortSignal.any === 'function';
const supportsResponseStreams = typeof globalThis.ReadableStream === 'function';
const supportsFormData = typeof globalThis.FormData === 'function';
const requestMethods = ['get', 'post', 'put', 'patch', 'head', 'delete'];
const responseTypes = {
    json: 'application/json',
    text: 'text/*',
    formData: 'multipart/form-data',
    arrayBuffer: '*/*',
    blob: '*/*',
    // Supported in modern Fetch implementations (for example, browsers and recent Node.js/undici).
    // We still feature-check at runtime before exposing the shortcut.
    bytes: '*/*',
};
// The maximum value of a 32bit int (see issue #117)
const maxSafeTimeout = 2_147_483_647;
// Size in bytes of a typical form boundary, used to help estimate upload size
const usualFormBoundarySize = new TextEncoder().encode('------WebKitFormBoundaryaxpyiPgbbPti10Rw').length;
const stop = Symbol('stop');
/**
Marker returned by ky.retry() to signal a forced retry from afterResponse hooks.
*/
class RetryMarker {
    options;
    constructor(options) {
        this.options = options;
    }
}
/**
Force a retry from an `afterResponse` hook.

This allows you to retry a request based on the response content, even if the response has a successful status code. The retry will respect the `retry.limit` option and skip the `shouldRetry` check. The forced retry is observable in `beforeRetry` hooks, where the error will be a `ForceRetryError`.

@param options - Optional configuration for the retry.

@example
```
import ky, {isForceRetryError} from 'ky';

const api = ky.extend({
    hooks: {
        afterResponse: [
            async (request, options, response) => {
                // Retry based on response body content
                if (response.status === 200) {
                    const data = await response.clone().json();

                    // Simple retry with default delay
                    if (data.error?.code === 'TEMPORARY_ERROR') {
                        return ky.retry();
                    }

                    // Retry with custom delay from API response
                    if (data.error?.code === 'RATE_LIMIT') {
                        return ky.retry({
                            delay: data.error.retryAfter * 1000,
                            code: 'RATE_LIMIT'
                        });
                    }

                    // Retry with a modified request (e.g., fallback endpoint)
                    if (data.error?.code === 'FALLBACK_TO_BACKUP') {
                        return ky.retry({
                            request: new Request('https://backup-api.com/endpoint', {
                                method: request.method,
                                headers: request.headers,
                            }),
                            code: 'BACKUP_ENDPOINT'
                        });
                    }

                    // Retry with refreshed authentication
                    if (data.error?.code === 'TOKEN_REFRESH' && data.newToken) {
                        return ky.retry({
                            request: new Request(request, {
                                headers: {
                                    ...Object.fromEntries(request.headers),
                                    'Authorization': `Bearer ${data.newToken}`
                                }
                            }),
                            code: 'TOKEN_REFRESHED'
                        });
                    }

                    // Retry with cause to preserve error chain
                    try {
                        validateResponse(data);
                    } catch (error) {
                        return ky.retry({
                            code: 'VALIDATION_FAILED',
                            cause: error
                        });
                    }
                }
            }
        ],
        beforeRetry: [
            ({error, retryCount}) => {
                // Observable in beforeRetry hooks
                if (isForceRetryError(error)) {
                    console.log(`Forced retry #${retryCount}: ${error.message}`);
                    // Example output: "Forced retry #1: Forced retry: RATE_LIMIT"
                }
            }
        ]
    }
});

const response = await api.get('https://example.com/api');
```
*/
const retry = (options) => new RetryMarker(options);
const kyOptionKeys = {
    json: true,
    parseJson: true,
    stringifyJson: true,
    searchParams: true,
    prefixUrl: true,
    retry: true,
    timeout: true,
    hooks: true,
    throwHttpErrors: true,
    onDownloadProgress: true,
    onUploadProgress: true,
    fetch: true,
    context: true,
};
// Vendor-specific fetch options that should always be passed to fetch()
// even if they appear on the Request object due to vendor patching.
// See: https://github.com/sindresorhus/ky/issues/541
const vendorSpecificOptions = {
    next: true, // Next.js cache revalidation (revalidate, tags)
};
// Standard RequestInit options that should NOT be passed separately to fetch()
// because they're already applied to the Request object.
// Note: `dispatcher` and `priority` are NOT included here - they're fetch-only
// options that the Request constructor doesn't accept, so they need to be passed
// separately to fetch().
const requestOptionsRegistry = {
    method: true,
    headers: true,
    body: true,
    mode: true,
    credentials: true,
    cache: true,
    redirect: true,
    referrer: true,
    referrerPolicy: true,
    integrity: true,
    keepalive: true,
    signal: true,
    window: true,
    duplex: true,
};

// eslint-disable-next-line @typescript-eslint/ban-types
const getBodySize = (body) => {
    if (!body) {
        return 0;
    }
    if (body instanceof FormData) {
        // This is an approximation, as FormData size calculation is not straightforward
        let size = 0;
        for (const [key, value] of body) {
            size += usualFormBoundarySize;
            size += new TextEncoder().encode(`Content-Disposition: form-data; name="${key}"`).length;
            size += typeof value === 'string'
                ? new TextEncoder().encode(value).length
                : value.size;
        }
        return size;
    }
    if (body instanceof Blob) {
        return body.size;
    }
    if (body instanceof ArrayBuffer) {
        return body.byteLength;
    }
    if (typeof body === 'string') {
        return new TextEncoder().encode(body).length;
    }
    if (body instanceof URLSearchParams) {
        return new TextEncoder().encode(body.toString()).length;
    }
    if ('byteLength' in body) {
        return (body).byteLength;
    }
    if (typeof body === 'object' && body !== null) {
        try {
            const jsonString = JSON.stringify(body);
            return new TextEncoder().encode(jsonString).length;
        }
        catch {
            return 0;
        }
    }
    return 0; // Default case, unable to determine size
};
const withProgress = (stream, totalBytes, onProgress) => {
    let previousChunk;
    let transferredBytes = 0;
    return stream.pipeThrough(new TransformStream({
        transform(currentChunk, controller) {
            controller.enqueue(currentChunk);
            if (previousChunk) {
                transferredBytes += previousChunk.byteLength;
                let percent = totalBytes === 0 ? 0 : transferredBytes / totalBytes;
                // Avoid reporting 100% progress before the stream is actually finished (in case totalBytes is inaccurate)
                if (percent >= 1) {
                    // Epsilon is used here to get as close as possible to 100% without reaching it.
                    // If we were to use 0.99 here, percent could potentially go backwards.
                    percent = 1 - Number.EPSILON;
                }
                onProgress?.({ percent, totalBytes: Math.max(totalBytes, transferredBytes), transferredBytes }, previousChunk);
            }
            previousChunk = currentChunk;
        },
        flush() {
            if (previousChunk) {
                transferredBytes += previousChunk.byteLength;
                onProgress?.({ percent: 1, totalBytes: Math.max(totalBytes, transferredBytes), transferredBytes }, previousChunk);
            }
        },
    }));
};
const streamResponse = (response, onDownloadProgress) => {
    if (!response.body) {
        return response;
    }
    if (response.status === 204) {
        return new Response(null, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        });
    }
    const totalBytes = Math.max(0, Number(response.headers.get('content-length')) || 0);
    return new Response(withProgress(response.body, totalBytes, onDownloadProgress), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
    });
};
// eslint-disable-next-line @typescript-eslint/ban-types
const streamRequest = (request, onUploadProgress, originalBody) => {
    if (!request.body) {
        return request;
    }
    // Use original body for size calculation since request.body is already a stream
    const totalBytes = getBodySize(originalBody ?? request.body);
    return new Request(request, {
        // @ts-expect-error - Types are outdated.
        duplex: 'half',
        body: withProgress(request.body, totalBytes, onUploadProgress),
    });
};

// eslint-disable-next-line @typescript-eslint/ban-types
const isObject = (value) => value !== null && typeof value === 'object';

const validateAndMerge = (...sources) => {
    for (const source of sources) {
        if ((!isObject(source) || Array.isArray(source)) && source !== undefined) {
            throw new TypeError('The `options` argument must be an object');
        }
    }
    return deepMerge({}, ...sources);
};
const mergeHeaders = (source1 = {}, source2 = {}) => {
    const result = new globalThis.Headers(source1);
    const isHeadersInstance = source2 instanceof globalThis.Headers;
    const source = new globalThis.Headers(source2);
    for (const [key, value] of source.entries()) {
        if ((isHeadersInstance && value === 'undefined') || value === undefined) {
            result.delete(key);
        }
        else {
            result.set(key, value);
        }
    }
    return result;
};
function newHookValue(original, incoming, property) {
    return (Object.hasOwn(incoming, property) && incoming[property] === undefined)
        ? []
        : deepMerge(original[property] ?? [], incoming[property] ?? []);
}
const mergeHooks = (original = {}, incoming = {}) => ({
    beforeRequest: newHookValue(original, incoming, 'beforeRequest'),
    beforeRetry: newHookValue(original, incoming, 'beforeRetry'),
    afterResponse: newHookValue(original, incoming, 'afterResponse'),
    beforeError: newHookValue(original, incoming, 'beforeError'),
});
const appendSearchParameters = (target, source) => {
    const result = new URLSearchParams();
    for (const input of [target, source]) {
        if (input === undefined) {
            continue;
        }
        if (input instanceof URLSearchParams) {
            for (const [key, value] of input.entries()) {
                result.append(key, value);
            }
        }
        else if (Array.isArray(input)) {
            for (const pair of input) {
                if (!Array.isArray(pair) || pair.length !== 2) {
                    throw new TypeError('Array search parameters must be provided in [[key, value], ...] format');
                }
                result.append(String(pair[0]), String(pair[1]));
            }
        }
        else if (isObject(input)) {
            for (const [key, value] of Object.entries(input)) {
                if (value !== undefined) {
                    result.append(key, String(value));
                }
            }
        }
        else {
            // String
            const parameters = new URLSearchParams(input);
            for (const [key, value] of parameters.entries()) {
                result.append(key, value);
            }
        }
    }
    return result;
};
// TODO: Make this strongly-typed (no `any`).
const deepMerge = (...sources) => {
    let returnValue = {};
    let headers = {};
    let hooks = {};
    let searchParameters;
    const signals = [];
    for (const source of sources) {
        if (Array.isArray(source)) {
            if (!Array.isArray(returnValue)) {
                returnValue = [];
            }
            returnValue = [...returnValue, ...source];
        }
        else if (isObject(source)) {
            for (let [key, value] of Object.entries(source)) {
                // Special handling for AbortSignal instances
                if (key === 'signal' && value instanceof globalThis.AbortSignal) {
                    signals.push(value);
                    continue;
                }
                // Special handling for context - shallow merge only
                if (key === 'context') {
                    if (value !== undefined && value !== null && (!isObject(value) || Array.isArray(value))) {
                        throw new TypeError('The `context` option must be an object');
                    }
                    // Shallow merge: always create a new object to prevent mutation bugs
                    returnValue = {
                        ...returnValue,
                        context: (value === undefined || value === null)
                            ? {}
                            : { ...returnValue.context, ...value },
                    };
                    continue;
                }
                // Special handling for searchParams
                if (key === 'searchParams') {
                    if (value === undefined || value === null) {
                        // Explicit undefined or null removes searchParams
                        searchParameters = undefined;
                    }
                    else {
                        // First source: keep as-is to preserve type (string/object/URLSearchParams)
                        // Subsequent sources: merge and convert to URLSearchParams
                        searchParameters = searchParameters === undefined ? value : appendSearchParameters(searchParameters, value);
                    }
                    continue;
                }
                if (isObject(value) && key in returnValue) {
                    value = deepMerge(returnValue[key], value);
                }
                returnValue = { ...returnValue, [key]: value };
            }
            if (isObject(source.hooks)) {
                hooks = mergeHooks(hooks, source.hooks);
                returnValue.hooks = hooks;
            }
            if (isObject(source.headers)) {
                headers = mergeHeaders(headers, source.headers);
                returnValue.headers = headers;
            }
        }
    }
    if (searchParameters !== undefined) {
        returnValue.searchParams = searchParameters;
    }
    if (signals.length > 0) {
        if (signals.length === 1) {
            returnValue.signal = signals[0];
        }
        else if (supportsAbortSignal) {
            returnValue.signal = AbortSignal.any(signals);
        }
        else {
            // When AbortSignal.any is not available, use the last signal
            // This maintains the previous behavior before signal merging was added
            // This can be remove when the `supportsAbortSignal` check is removed.`
            returnValue.signal = signals.at(-1);
        }
    }
    if (returnValue.context === undefined) {
        returnValue.context = {};
    }
    return returnValue;
};

const normalizeRequestMethod = (input) => requestMethods.includes(input) ? input.toUpperCase() : input;
const retryMethods = ['get', 'put', 'head', 'delete', 'options', 'trace'];
const retryStatusCodes = [408, 413, 429, 500, 502, 503, 504];
const retryAfterStatusCodes = [413, 429, 503];
const defaultRetryOptions = {
    limit: 2,
    methods: retryMethods,
    statusCodes: retryStatusCodes,
    afterStatusCodes: retryAfterStatusCodes,
    maxRetryAfter: Number.POSITIVE_INFINITY,
    backoffLimit: Number.POSITIVE_INFINITY,
    delay: attemptCount => 0.3 * (2 ** (attemptCount - 1)) * 1000,
    jitter: undefined,
    retryOnTimeout: false,
};
const normalizeRetryOptions = (retry = {}) => {
    if (typeof retry === 'number') {
        return {
            ...defaultRetryOptions,
            limit: retry,
        };
    }
    if (retry.methods && !Array.isArray(retry.methods)) {
        throw new Error('retry.methods must be an array');
    }
    retry.methods &&= retry.methods.map(method => method.toLowerCase());
    if (retry.statusCodes && !Array.isArray(retry.statusCodes)) {
        throw new Error('retry.statusCodes must be an array');
    }
    const normalizedRetry = Object.fromEntries(Object.entries(retry).filter(([, value]) => value !== undefined));
    return {
        ...defaultRetryOptions,
        ...normalizedRetry,
    };
};

class TimeoutError extends Error {
    request;
    constructor(request) {
        super(`Request timed out: ${request.method} ${request.url}`);
        this.name = 'TimeoutError';
        this.request = request;
    }
}

// `Promise.race()` workaround (#91)
async function timeout(request, init, abortController, options) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            if (abortController) {
                abortController.abort();
            }
            reject(new TimeoutError(request));
        }, options.timeout);
        void options
            .fetch(request, init)
            .then(resolve)
            .catch(reject)
            .then(() => {
            clearTimeout(timeoutId);
        });
    });
}

// https://github.com/sindresorhus/delay/tree/ab98ae8dfcb38e1593286c94d934e70d14a4e111
async function delay(ms, { signal }) {
    return new Promise((resolve, reject) => {
        if (signal) {
            signal.throwIfAborted();
            signal.addEventListener('abort', abortHandler, { once: true });
        }
        function abortHandler() {
            clearTimeout(timeoutId);
            reject(signal.reason);
        }
        const timeoutId = setTimeout(() => {
            signal?.removeEventListener('abort', abortHandler);
            resolve();
        }, ms);
    });
}

const findUnknownOptions = (request, options) => {
    const unknownOptions = {};
    for (const key in options) {
        // Skip inherited properties
        if (!Object.hasOwn(options, key)) {
            continue;
        }
        // An option is passed to fetch() if:
        // 1. It's not a standard RequestInit option (not in requestOptionsRegistry)
        // 2. It's not a ky-specific option (not in kyOptionKeys)
        // 3. Either:
        //    a. It's not on the Request object, OR
        //    b. It's a vendor-specific option that should always be passed (in vendorSpecificOptions)
        if (!(key in requestOptionsRegistry) && !(key in kyOptionKeys) && (!(key in request) || key in vendorSpecificOptions)) {
            unknownOptions[key] = options[key];
        }
    }
    return unknownOptions;
};
const hasSearchParameters = (search) => {
    if (search === undefined) {
        return false;
    }
    // The `typeof array` still gives "object", so we need different checking for array.
    if (Array.isArray(search)) {
        return search.length > 0;
    }
    if (search instanceof URLSearchParams) {
        return search.size > 0;
    }
    // Record
    if (typeof search === 'object') {
        return Object.keys(search).length > 0;
    }
    if (typeof search === 'string') {
        return search.trim().length > 0;
    }
    return Boolean(search);
};

/**
Type guard to check if an error is an HTTPError.

@param error - The error to check
@returns `true` if the error is an HTTPError, `false` otherwise

@example
```
import ky, {isHTTPError} from 'ky';
try {
    const response = await ky.get('/api/data');
} catch (error) {
    if (isHTTPError(error)) {
        console.log('HTTP error status:', error.response.status);
    }
}
```
*/
function isHTTPError(error) {
    return error instanceof HTTPError || (error?.name === HTTPError.name);
}
/**
Type guard to check if an error is a TimeoutError.

@param error - The error to check
@returns `true` if the error is a TimeoutError, `false` otherwise

@example
```
import ky, {isTimeoutError} from 'ky';
try {
    const response = await ky.get('/api/data', { timeout: 1000 });
} catch (error) {
    if (isTimeoutError(error)) {
        console.log('Request timed out:', error.request.url);
    }
}
```
*/
function isTimeoutError(error) {
    return error instanceof TimeoutError || (error?.name === TimeoutError.name);
}

class Ky {
    static create(input, options) {
        const ky = new Ky(input, options);
        const function_ = async () => {
            if (typeof ky.#options.timeout === 'number' && ky.#options.timeout > maxSafeTimeout) {
                throw new RangeError(`The \`timeout\` option cannot be greater than ${maxSafeTimeout}`);
            }
            // Delay the fetch so that body method shortcuts can set the Accept header
            await Promise.resolve();
            // Before using ky.request, _fetch clones it and saves the clone for future retries to use.
            // If retry is not needed, close the cloned request's ReadableStream for memory safety.
            let response = await ky.#fetch();
            for (const hook of ky.#options.hooks.afterResponse) {
                // Clone the response before passing to hook so we can cancel it if needed
                const clonedResponse = ky.#decorateResponse(response.clone());
                let modifiedResponse;
                try {
                    // eslint-disable-next-line no-await-in-loop
                    modifiedResponse = await hook(ky.request, ky.#getNormalizedOptions(), clonedResponse, { retryCount: ky.#retryCount });
                }
                catch (error) {
                    // Cancel both responses to prevent memory leaks when hook throws
                    ky.#cancelResponseBody(clonedResponse);
                    ky.#cancelResponseBody(response);
                    throw error;
                }
                if (modifiedResponse instanceof RetryMarker) {
                    // Cancel both the cloned response passed to the hook and the current response to prevent resource leaks (especially important in Deno/Bun).
                    // Do not await cancellation since hooks can clone the response, leaving extra tee branches that keep cancel promises pending per the Streams spec.
                    ky.#cancelResponseBody(clonedResponse);
                    ky.#cancelResponseBody(response);
                    throw new ForceRetryError(modifiedResponse.options);
                }
                // Determine which response to use going forward
                const nextResponse = modifiedResponse instanceof globalThis.Response ? modifiedResponse : response;
                // Cancel any response bodies we won't use to prevent memory leaks.
                // Uses fire-and-forget since hooks may have cloned the response, creating tee branches that block cancellation.
                if (clonedResponse !== nextResponse) {
                    ky.#cancelResponseBody(clonedResponse);
                }
                if (response !== nextResponse) {
                    ky.#cancelResponseBody(response);
                }
                response = nextResponse;
            }
            ky.#decorateResponse(response);
            if (!response.ok && (typeof ky.#options.throwHttpErrors === 'function'
                ? ky.#options.throwHttpErrors(response.status)
                : ky.#options.throwHttpErrors)) {
                let error = new HTTPError(response, ky.request, ky.#getNormalizedOptions());
                for (const hook of ky.#options.hooks.beforeError) {
                    // eslint-disable-next-line no-await-in-loop
                    error = await hook(error, { retryCount: ky.#retryCount });
                }
                throw error;
            }
            // If `onDownloadProgress` is passed, it uses the stream API internally
            if (ky.#options.onDownloadProgress) {
                if (typeof ky.#options.onDownloadProgress !== 'function') {
                    throw new TypeError('The `onDownloadProgress` option must be a function');
                }
                if (!supportsResponseStreams) {
                    throw new Error('Streams are not supported in your environment. `ReadableStream` is missing.');
                }
                const progressResponse = response.clone();
                ky.#cancelResponseBody(response);
                return streamResponse(progressResponse, ky.#options.onDownloadProgress);
            }
            return response;
        };
        // Always wrap in #retry to catch forced retries from afterResponse hooks
        // Method retriability is checked in #calculateRetryDelay for non-forced retries
        const result = ky.#retry(function_)
            .finally(() => {
            const originalRequest = ky.#originalRequest;
            // Ignore cancellation errors from already-locked or already-consumed streams.
            ky.#cancelBody(originalRequest?.body ?? undefined);
            ky.#cancelBody(ky.request.body ?? undefined);
        });
        for (const [type, mimeType] of Object.entries(responseTypes)) {
            // Only expose `.bytes()` when the environment implements it.
            if (type === 'bytes'
                && typeof globalThis.Response?.prototype?.bytes !== 'function') {
                continue;
            }
            result[type] = async () => {
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                ky.request.headers.set('accept', ky.request.headers.get('accept') || mimeType);
                const response = await result;
                if (type === 'json') {
                    if (response.status === 204) {
                        return '';
                    }
                    const text = await response.text();
                    if (text === '') {
                        return '';
                    }
                    if (options.parseJson) {
                        return options.parseJson(text);
                    }
                    return JSON.parse(text);
                }
                return response[type]();
            };
        }
        return result;
    }
    // eslint-disable-next-line unicorn/prevent-abbreviations
    static #normalizeSearchParams(searchParams) {
        // Filter out undefined values from plain objects
        if (searchParams && typeof searchParams === 'object' && !Array.isArray(searchParams) && !(searchParams instanceof URLSearchParams)) {
            return Object.fromEntries(Object.entries(searchParams).filter(([, value]) => value !== undefined));
        }
        return searchParams;
    }
    request;
    #abortController;
    #retryCount = 0;
    // eslint-disable-next-line @typescript-eslint/prefer-readonly -- False positive: #input is reassigned on line 202
    #input;
    #options;
    #originalRequest;
    #userProvidedAbortSignal;
    #cachedNormalizedOptions;
    // eslint-disable-next-line complexity
    constructor(input, options = {}) {
        this.#input = input;
        this.#options = {
            ...options,
            headers: mergeHeaders(this.#input.headers, options.headers),
            hooks: mergeHooks({
                beforeRequest: [],
                beforeRetry: [],
                beforeError: [],
                afterResponse: [],
            }, options.hooks),
            method: normalizeRequestMethod(options.method ?? this.#input.method ?? 'GET'),
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            prefixUrl: String(options.prefixUrl || ''),
            retry: normalizeRetryOptions(options.retry),
            throwHttpErrors: options.throwHttpErrors ?? true,
            timeout: options.timeout ?? 10_000,
            fetch: options.fetch ?? globalThis.fetch.bind(globalThis),
            context: options.context ?? {},
        };
        if (typeof this.#input !== 'string' && !(this.#input instanceof URL || this.#input instanceof globalThis.Request)) {
            throw new TypeError('`input` must be a string, URL, or Request');
        }
        if (this.#options.prefixUrl && typeof this.#input === 'string') {
            if (this.#input.startsWith('/')) {
                throw new Error('`input` must not begin with a slash when using `prefixUrl`');
            }
            if (!this.#options.prefixUrl.endsWith('/')) {
                this.#options.prefixUrl += '/';
            }
            this.#input = this.#options.prefixUrl + this.#input;
        }
        if (supportsAbortController && supportsAbortSignal) {
            this.#userProvidedAbortSignal = this.#options.signal ?? this.#input.signal;
            this.#abortController = new globalThis.AbortController();
            this.#options.signal = this.#userProvidedAbortSignal ? AbortSignal.any([this.#userProvidedAbortSignal, this.#abortController.signal]) : this.#abortController.signal;
        }
        if (supportsRequestStreams) {
            // @ts-expect-error - Types are outdated.
            this.#options.duplex = 'half';
        }
        if (this.#options.json !== undefined) {
            this.#options.body = this.#options.stringifyJson?.(this.#options.json) ?? JSON.stringify(this.#options.json);
            this.#options.headers.set('content-type', this.#options.headers.get('content-type') ?? 'application/json');
        }
        // To provide correct form boundary, Content-Type header should be deleted when creating Request from another Request with FormData/URLSearchParams body
        // Only delete if user didn't explicitly provide a custom content-type
        const userProvidedContentType = options.headers && new globalThis.Headers(options.headers).has('content-type');
        if (this.#input instanceof globalThis.Request
            && ((supportsFormData && this.#options.body instanceof globalThis.FormData) || this.#options.body instanceof URLSearchParams)
            && !userProvidedContentType) {
            this.#options.headers.delete('content-type');
        }
        this.request = new globalThis.Request(this.#input, this.#options);
        if (hasSearchParameters(this.#options.searchParams)) {
            // eslint-disable-next-line unicorn/prevent-abbreviations
            const textSearchParams = typeof this.#options.searchParams === 'string'
                ? this.#options.searchParams.replace(/^\?/, '')
                : new URLSearchParams(Ky.#normalizeSearchParams(this.#options.searchParams)).toString();
            // eslint-disable-next-line unicorn/prevent-abbreviations
            const searchParams = '?' + textSearchParams;
            const url = this.request.url.replace(/(?:\?.*?)?(?=#|$)/, searchParams);
            // Recreate request with the updated URL. We already have all options in this.#options, including duplex.
            this.request = new globalThis.Request(url, this.#options);
        }
        // If `onUploadProgress` is passed, it uses the stream API internally
        if (this.#options.onUploadProgress) {
            if (typeof this.#options.onUploadProgress !== 'function') {
                throw new TypeError('The `onUploadProgress` option must be a function');
            }
            if (!supportsRequestStreams) {
                throw new Error('Request streams are not supported in your environment. The `duplex` option for `Request` is not available.');
            }
            this.request = this.#wrapRequestWithUploadProgress(this.request, this.#options.body ?? undefined);
        }
    }
    #calculateDelay() {
        const retryDelay = this.#options.retry.delay(this.#retryCount);
        let jitteredDelay = retryDelay;
        if (this.#options.retry.jitter === true) {
            jitteredDelay = Math.random() * retryDelay;
        }
        else if (typeof this.#options.retry.jitter === 'function') {
            jitteredDelay = this.#options.retry.jitter(retryDelay);
            if (!Number.isFinite(jitteredDelay) || jitteredDelay < 0) {
                jitteredDelay = retryDelay;
            }
        }
        // Handle undefined backoffLimit by treating it as no limit (Infinity)
        const backoffLimit = this.#options.retry.backoffLimit ?? Number.POSITIVE_INFINITY;
        return Math.min(backoffLimit, jitteredDelay);
    }
    async #calculateRetryDelay(error) {
        this.#retryCount++;
        if (this.#retryCount > this.#options.retry.limit) {
            throw error;
        }
        // Wrap non-Error throws to ensure consistent error handling
        const errorObject = error instanceof Error ? error : new NonError(error);
        // Handle forced retry from afterResponse hook - skip method check and shouldRetry
        if (errorObject instanceof ForceRetryError) {
            return errorObject.customDelay ?? this.#calculateDelay();
        }
        // Check if method is retriable for non-forced retries
        if (!this.#options.retry.methods.includes(this.request.method.toLowerCase())) {
            throw error;
        }
        // User-provided shouldRetry function takes precedence over all other checks
        if (this.#options.retry.shouldRetry !== undefined) {
            const result = await this.#options.retry.shouldRetry({ error: errorObject, retryCount: this.#retryCount });
            // Strict boolean checking - only exact true/false are handled specially
            if (result === false) {
                throw error;
            }
            if (result === true) {
                // Force retry - skip all other validation and return delay
                return this.#calculateDelay();
            }
            // If undefined or any other value, fall through to default behavior
        }
        // Default timeout behavior
        if (isTimeoutError(error) && !this.#options.retry.retryOnTimeout) {
            throw error;
        }
        if (isHTTPError(error)) {
            if (!this.#options.retry.statusCodes.includes(error.response.status)) {
                throw error;
            }
            const retryAfter = error.response.headers.get('Retry-After')
                ?? error.response.headers.get('RateLimit-Reset')
                ?? error.response.headers.get('X-RateLimit-Retry-After') // Symfony-based services
                ?? error.response.headers.get('X-RateLimit-Reset') // GitHub
                ?? error.response.headers.get('X-Rate-Limit-Reset'); // Twitter
            if (retryAfter && this.#options.retry.afterStatusCodes.includes(error.response.status)) {
                let after = Number(retryAfter) * 1000;
                if (Number.isNaN(after)) {
                    after = Date.parse(retryAfter) - Date.now();
                }
                else if (after >= Date.parse('2024-01-01')) {
                    // A large number is treated as a timestamp (fixed threshold protects against clock skew)
                    after -= Date.now();
                }
                const max = this.#options.retry.maxRetryAfter ?? after;
                // Don't apply jitter when server provides explicit retry timing
                return after < max ? after : max;
            }
            if (error.response.status === 413) {
                throw error;
            }
        }
        return this.#calculateDelay();
    }
    #decorateResponse(response) {
        if (this.#options.parseJson) {
            response.json = async () => this.#options.parseJson(await response.text());
        }
        return response;
    }
    #cancelBody(body) {
        if (!body) {
            return;
        }
        // Ignore cancellation failures from already-locked or already-consumed streams.
        void body.cancel().catch(() => undefined);
    }
    #cancelResponseBody(response) {
        // Ignore cancellation failures from already-locked or already-consumed streams.
        this.#cancelBody(response.body ?? undefined);
    }
    async #retry(function_) {
        try {
            return await function_();
        }
        catch (error) {
            const ms = Math.min(await this.#calculateRetryDelay(error), maxSafeTimeout);
            if (this.#retryCount < 1) {
                throw error;
            }
            // Only use user-provided signal for delay, not our internal abortController
            await delay(ms, this.#userProvidedAbortSignal ? { signal: this.#userProvidedAbortSignal } : {});
            // Apply custom request from forced retry before beforeRetry hooks
            // Ensure the custom request has the correct managed signal for timeouts and user aborts
            if (error instanceof ForceRetryError && error.customRequest) {
                const managedRequest = this.#options.signal
                    ? new globalThis.Request(error.customRequest, { signal: this.#options.signal })
                    : new globalThis.Request(error.customRequest);
                this.#assignRequest(managedRequest);
            }
            for (const hook of this.#options.hooks.beforeRetry) {
                // eslint-disable-next-line no-await-in-loop
                const hookResult = await hook({
                    request: this.request,
                    options: this.#getNormalizedOptions(),
                    error: error,
                    retryCount: this.#retryCount,
                });
                if (hookResult instanceof globalThis.Request) {
                    this.#assignRequest(hookResult);
                    break;
                }
                // If a Response is returned, use it and skip the retry
                if (hookResult instanceof globalThis.Response) {
                    return hookResult;
                }
                // If `stop` is returned from the hook, the retry process is stopped
                if (hookResult === stop) {
                    return;
                }
            }
            return this.#retry(function_);
        }
    }
    async #fetch() {
        // Reset abortController if it was aborted (happens on timeout retry)
        if (this.#abortController?.signal.aborted) {
            this.#abortController = new globalThis.AbortController();
            this.#options.signal = this.#userProvidedAbortSignal ? AbortSignal.any([this.#userProvidedAbortSignal, this.#abortController.signal]) : this.#abortController.signal;
            // Recreate request with new signal
            this.request = new globalThis.Request(this.request, { signal: this.#options.signal });
        }
        for (const hook of this.#options.hooks.beforeRequest) {
            // eslint-disable-next-line no-await-in-loop
            const result = await hook(this.request, this.#getNormalizedOptions(), { retryCount: this.#retryCount });
            if (result instanceof Response) {
                return result;
            }
            if (result instanceof globalThis.Request) {
                this.#assignRequest(result);
                break;
            }
        }
        const nonRequestOptions = findUnknownOptions(this.request, this.#options);
        // Cloning is done here to prepare in advance for retries
        this.#originalRequest = this.request;
        this.request = this.#originalRequest.clone();
        if (this.#options.timeout === false) {
            return this.#options.fetch(this.#originalRequest, nonRequestOptions);
        }
        return timeout(this.#originalRequest, nonRequestOptions, this.#abortController, this.#options);
    }
    #getNormalizedOptions() {
        if (!this.#cachedNormalizedOptions) {
            const { hooks, ...normalizedOptions } = this.#options;
            this.#cachedNormalizedOptions = Object.freeze(normalizedOptions);
        }
        return this.#cachedNormalizedOptions;
    }
    #assignRequest(request) {
        this.#cachedNormalizedOptions = undefined;
        this.request = this.#wrapRequestWithUploadProgress(request);
    }
    #wrapRequestWithUploadProgress(request, originalBody) {
        if (!this.#options.onUploadProgress || !request.body) {
            return request;
        }
        return streamRequest(request, this.#options.onUploadProgress, originalBody ?? this.#options.body ?? undefined);
    }
}

/*! MIT License © Sindre Sorhus */
const createInstance = (defaults) => {
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    const ky = (input, options) => Ky.create(input, validateAndMerge(defaults, options));
    for (const method of requestMethods) {
        // eslint-disable-next-line @typescript-eslint/promise-function-async
        ky[method] = (input, options) => Ky.create(input, validateAndMerge(defaults, options, { method }));
    }
    ky.create = (newDefaults) => createInstance(validateAndMerge(newDefaults));
    ky.extend = (newDefaults) => {
        if (typeof newDefaults === 'function') {
            newDefaults = newDefaults(defaults ?? {});
        }
        return createInstance(validateAndMerge(defaults, newDefaults));
    };
    ky.stop = stop;
    ky.retry = retry;
    return ky;
};
const ky = createInstance();
// Intentionally not exporting this for now as it's just an implementation detail and we don't want to commit to a certain API yet at least.
// export {NonError} from './errors/NonError.js';

//#region src/utils/kyInstance.ts
const httpClient = (apiBase) => ky.extend({
	hooks: {
		afterResponse: [async (request, options, response) => {
			if (!response.ok) {
				const error = {
					message: (await response.clone().json().catch(() => ({}))).message || "An error occurred while processing the request",
					statusCode: response.status
				};
				return new Response(JSON.stringify(error), { status: response.status });
			}
		}],
		beforeRequest: [(request) => {
			const url = new URL(request.url);
			if (/{\w+}/.exec(url.pathname)) throw new NestedParamError(`Unresolved parameters in URL: ${url.pathname}`);
		}]
	},
	prefixUrl: apiBase
});

//#region src/utils/parseListResponse.ts
/**
* Parse list response data and extract array and total count
* Handles various response patterns:
* 1. Direct array responses: { data: [...] }
* 2. Nested array responses: { data: { data: [...] } }
* 3. Object responses with array properties: { items: [...], total: 100 }
* 4. Direct array as root: [...]
* 5. Object with array at different property names
* 6. Object responses without known array properties: return the object itself
*/
const parseListResponse = (data, totalCount) => {
	let dataArray = [];
	if (Array.isArray(data)) dataArray = data;
	else if (data && typeof data === "object") if (Array.isArray(data.data)) dataArray = data.data;
	else if (data.data && typeof data.data === "object" && Array.isArray(data.data.data)) dataArray = data.data.data;
	else if (Array.isArray(data.items)) dataArray = data.items;
	else if (Array.isArray(data.results)) dataArray = data.results;
	else if (Array.isArray(data.records)) dataArray = data.records;
	else {
		let currentData = data;
		while (currentData && typeof currentData === "object" && !Array.isArray(currentData) && currentData.data) currentData = currentData.data;
		dataArray = currentData && typeof currentData !== "object" ? currentData : data;
	}
	else dataArray = [];
	let total = typeof totalCount === "number" && !Number.isNaN(totalCount) ? totalCount : typeof data?.total === "number" ? data.total : dataArray.length || 0;
	return {
		data: dataArray,
		total
	};
};

//#region src/utils/parseSingleResponse.ts
const parseSingleResponse = (data) => {
	if (data && typeof data === "object" && data.data !== void 0) return { data: data.data };
	return { data };
};

//#region src/provider.ts
const parseResponse = async (response) => {
	if (response instanceof Response && !response.ok) try {
		const errorBody = await response.json();
		throw new Error(errorBody.message || `HTTP error ${response.status}`);
	} catch (jsonError) {
		throw new Error(`HTTP error ${response.status}: Could not parse error body`);
	}
	const responseText = await response.text();
	if (!responseText.trim()) return null;
	try {
		return JSON.parse(responseText);
	} catch (e) {
		return responseText;
	}
};
const dataProvider = (apiUrl, needsAuth = false) => {
	let authToken = null;
	let tokenPromise = null;
	let tokenResolve = null;
	const setAuthToken = (token) => {
		authToken = token;
		if (tokenResolve) {
			tokenResolve(token);
			tokenPromise = null;
			tokenResolve = null;
		}
	};
	const waitForToken = () => {
		if (authToken !== null) return Promise.resolve(authToken);
		if (!tokenPromise) {
			tokenPromise = Promise.withResolvers ? Promise.withResolvers() : (() => {
				let resolve;
				return {
					promise: new Promise((res) => {
						resolve = res;
					}),
					resolve
				};
			})();
			tokenResolve = tokenPromise.resolve || tokenPromise[1];
			tokenPromise = tokenPromise.promise || tokenPromise[0];
		}
		return tokenPromise;
	};
	const baseFetch = async (url, method, payload, queryParams, headers, needsAuthFlag = needsAuth) => {
		const fullUrl = url;
		let authHeader = {};
		if (needsAuthFlag) {
			const token = await waitForToken();
			if (!token) throw new Error("Authentication required but no token available");
			authHeader = { Authorization: `Bearer ${token}` };
		}
		const options = {
			headers: {
				"Content-Type": "application/json",
				...authHeader,
				...headers
			},
			...payload ? { json: payload } : {},
			searchParams: queryParams,
			throwHttpErrors: false
		};
		try {
			let response;
			switch (method.toUpperCase()) {
				case "DELETE":
					response = await httpClient(apiUrl).delete(fullUrl, options);
					break;
				case "GET":
					response = await httpClient(apiUrl).get(fullUrl, options);
					break;
				case "PATCH":
					response = await httpClient(apiUrl).patch(fullUrl, options);
					break;
				case "POST":
					response = await httpClient(apiUrl).post(fullUrl, options);
					break;
				case "PUT":
					response = await httpClient(apiUrl).put(fullUrl, options);
					break;
				default: throw new Error(`Unsupported HTTP method: ${method}`);
			}
			if (response instanceof Response && !response.ok) try {
				const errorBody = await response.json();
				throw new Error(errorBody.message || `HTTP error ${response.status}`);
			} catch (jsonError) {
				throw new Error(`HTTP error ${response.status}: Could not parse error body`);
			}
			return response;
		} catch (error) {
			console.error(`Fetch error for ${method} ${fullUrl}:`, error);
			return Promise.reject(error);
		}
	};
	return {
		create: async ({ meta, resource, variables }) => {
			return parseSingleResponse(await parseResponse(await baseFetch(generateNestedUrl({
				apiBase: apiUrl,
				meta,
				resource
			}), "POST", variables, void 0, meta?.headers ?? {}, meta?.needsAuth ?? needsAuth)));
		},
		custom: async ({ filters, meta, method, payload, sorters, url: operation }) => {
			const headers = meta?.headers ?? {};
			const baseUrl = generateNestedUrl({
				apiBase: apiUrl,
				meta,
				operation
			});
			const queryParams = serializeQueryParams({
				filters,
				sorters
			});
			return { data: await parseResponse(await baseFetch(baseUrl, method.toUpperCase(), payload, queryParams, headers, meta?.needsAuth ?? needsAuth)) };
		},
		deleteOne: async ({ id, meta, resource, variables }) => {
			const response = await baseFetch(generateNestedUrl({
				apiBase: apiUrl,
				id,
				meta,
				resource
			}), "DELETE", variables, void 0, meta?.headers ?? {}, meta?.needsAuth ?? needsAuth);
			if (response instanceof Response && !response.ok) try {
				const errorBody = await response.json();
				throw new Error(errorBody.message || `HTTP error ${response.status}`);
			} catch (jsonError) {
				throw new Error(`HTTP error ${response.status}: Could not parse error body`);
			}
			const responseText = await response.text();
			if (!responseText.trim()) return { data: null };
			try {
				return { data: JSON.parse(responseText) };
			} catch (e) {
				return { data: responseText };
			}
		},
		getApiUrl: () => apiUrl,
		getList: async ({ filters, meta: _meta, pagination, resource, sorters }) => {
			const meta = _meta?.paramsMap ? {
				..._meta,
				params: _meta.paramsMap,
				paramsMap: void 0
			} : _meta;
			const url = generateNestedUrl({
				apiBase: apiUrl,
				meta,
				resource
			});
			const headers = meta?.headers ?? {};
			const response = await baseFetch(url, "GET", void 0, serializeQueryParams({
				filters,
				sorters,
				pagination: pagination ? calculatePagination(pagination.currentPage || 1, pagination.pageSize || 10) : void 0
			}), headers, meta?.needsAuth ?? needsAuth);
			return parseListResponse(await parseResponse(response), Number(response.headers.get("x-total-count")));
		},
		getOne: async ({ id, meta, resource }) => {
			return parseSingleResponse(await parseResponse(await baseFetch(generateNestedUrl({
				apiBase: apiUrl,
				id,
				meta,
				resource
			}), "GET", void 0, void 0, meta?.headers ?? {}, meta?.needsAuth ?? needsAuth)));
		},
		setAuthToken,
		update: async ({ id, meta, resource, variables }) => {
			return parseSingleResponse(await parseResponse(await baseFetch(generateNestedUrl({
				apiBase: apiUrl,
				id,
				meta,
				resource
			}), "PATCH", variables, void 0, meta?.headers ?? {}, meta?.needsAuth ?? needsAuth)));
		}
	};
};

//#region src/index.ts
/**
* Nested REST Data Provider for Refine with Ky
*
* @remarks
* Provides CRUD operations for nested REST resources using dot-notation and template URLs.
* Configure resources through meta properties in request parameters.
*
* @example
* ```ts
* // Explicit template with parameter map
* dataProvider.getList({
*   resource: 'cases',
*   meta: {
*     template: 'tenants/{tenant}/projects/{project}/cases',
*     params: {
*       tenant: '123',
*       project: '456'
*     }
*   }
* })
* // URL: /tenants/123/projects/456/cases
* ```
*
* ### Key Features
*
* - **Template-based URLs** - Explicit path templates in meta.template
* - **Parameter Mapping** - Simple key/value store for template params:
*   ```ts
*   meta: { paramsMap: { [key: string]: string } }
*   ```
* - **Dot Notation** - Resource can use dot notation for nested resources:
*   ```ts
*   resource: 'tenant.project.case' // auto-converted to template
*   ```
* - **ID Handling** - Current resource ID automatically appended to URL
* - **Custom Operations** - Support for custom endpoints via `custom` method
*
* ### Template Resolution Rules
*
* 1. Templates can be defined in meta.template or derived from resource name
* 2. Required parameters are validated before making requests
* 3. IDs are automatically appended to the resolved URL path
* 4. Operations create nested endpoints under the resource path
*
* Example for "tenant.project.case" with ID:
* ```ts
* dataProvider.getOne({
*   resource: 'tenant.project.case',
*   id: '789',
*   meta: {
*     template: 'tenants/{tenant}/projects/{project}/cases',
*     paramsMap: {
*       tenant: '123',
*       project: '456'
*     }
*   }
* })
* // URL: /tenants/123/projects/456/cases/789
* ```
*
* ### Parameter Propagation
*
* Parent parameters are explicitly passed through the `paramsMap`:
* ```ts
* dataProvider.getList({
*   resource: 'project.case',
*   meta: {
*     template: 'projects/{project}/cases',
*     paramsMap: {
*       project: '456' // From previous context
*     }
*   }
* })
* // URL: /projects/456/cases
* ```
*
* For complex hierarchies, compose parameters from multiple sources:
* ```ts
* dataProvider.getOne({
*   resource: 'company.tenant.project.case',
*   id: '789',
*   meta: {
*     template: 'companies/{company}/tenants/{tenant}/projects/{project}/cases',
*     paramsMap: {
*       company: '101112', // From organization context
*       tenant: '123',     // From user selection
*       project: '456'     // From parent resource
*     }
*   }
* })
* // URL: /companies/101112/tenants/123/projects/456/cases/789
* ```
*
* @packageDocumentation
*/
var src_default = dataProvider;

class Capability {
  id = "dashboard:refine-config";
  status;
  type = "core:refine-config";
  version;
  #apiUrl;
  async destroy() {
  }
  getConfig(existing) {
    const token = localStorage.getItem("jwt");
    const acctProvider = src_default(this.#apiUrl, true);
    if (token) {
      acctProvider.setAuthToken(token);
    }
    core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.syncAuthProviderWithDataProvider(acctProvider, existing?.authProvider);
    return core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.mergeRefineConfig(existing, { [DATA_PROVIDER_NAME]: acctProvider }, [
      {
        meta: { template: "/account" },
        name: DATA_PROVIDER_NAME
      },
      {
        meta: {
          dataProviderName: DATA_PROVIDER_NAME,
          template: "/account/keys"
        },
        name: "api-keys"
      },
      {
        meta: {
          dataProviderName: DATA_PROVIDER_NAME,
          template: "/operations"
        },
        name: "operations"
      },
      {
        meta: {
          dataProviderName: DATA_PROVIDER_NAME,
          template: "operations/filters"
        },
        name: "operations.filters"
      }
    ]);
  }
  async initialize(framework) {
    const apiUrl = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.getApiBaseUrl({
      currentUrl: framework.portalUrl,
      preserveSubdomain: !core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.env.VITE_PORTAL_DOMAIN_IS_ROOT
    });
    if (!apiUrl) {
      throw new Error("Failed to get API base URL");
    }
    const subdomain = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.getPluginMeta(framework.meta, "dashboard", "subdomain");
    if (!subdomain) {
      throw new Error("Failed to get subdomain from plugin metadata");
    }
    try {
      const apiDomain = new URL(apiUrl);
      this.#apiUrl = `${apiDomain.protocol}//${subdomain}.${apiDomain.hostname}/api`;
    } catch (error) {
      throw new Error(`Failed to construct API URL: ${error.message}`);
    }
  }
}

const routes = [
  {
    component: "index",
    id: "root",
    path: "/"
  },
  {
    component: "dashboard",
    id: "dashboard",
    navigation: {
      icon: LayoutDashboard,
      label: "Dashboard",
      order: 0
    },
    path: "/dashboard"
  },
  {
    component: "operations",
    id: "operations",
    navigation: {
      icon: Activity,
      label: "Operations",
      order: 2
    },
    path: "/operations"
  },
  {
    children: [
      {
        component: "account/profile",
        id: "account_index",
        index: true,
        navigation: {
          forceShowInNavigation: true,
          icon: User,
          label: "Profile"
        },
        path: ""
      },
      {
        component: "account/security",
        id: "account_security",
        navigation: {
          icon: Shield,
          label: "Security"
        },
        path: "security"
      },
      {
        component: "account/api-keys",
        id: "account_api_keys",
        navigation: {
          icon: Key,
          label: "API Keys"
        },
        path: "api-keys"
      }
    ],
    component: "account/layout",
    id: "account_layout",
    navigation: {
      icon: UserCog,
      label: "My Account",
      linkable: false,
      order: 3
    },
    path: "/account"
  },
  {
    component: "account/verify",
    id: "account_verify",
    path: "account/verify"
  },
  {
    component: "loginIndex",
    id: "login_index",
    path: "login"
  },
  {
    component: "registerIndex",
    id: "register_index",
    path: "register"
  },
  {
    children: [
      {
        component: "resetPassword/reset",
        id: "reset_password_index",
        index: true,
        path: ""
      },
      {
        component: "resetPassword/confirm",
        id: "reset_password_confirm",
        path: "confirm"
      }
    ],
    component: "resetPassword/layout",
    id: "reset_password_layout",
    path: "reset-password"
  },
  {
    component: "loginOtp",
    id: "otp_login",
    path: "otp"
  }
];

const widgetAreas = [
  {
    grid: {
      columns: 12,
      gap: 16,
      rowHeight: "auto"
    },
    id: "dashboard:header"
  },
  {
    grid: {
      columns: 12,
      gap: 16,
      rowHeight: "auto"
    },
    id: "dashboard:profile"
  },
  {
    grid: {
      columns: 12,
      gap: 16,
      rowHeight: "auto"
    },
    id: "dashboard:security"
  }
];
const widgetRegistrations = [
  {
    areaId: "dashboard:header",
    componentName: "widgets/account/emailVerificationBanner",
    id: "dashboard:email-verification",
    position: {
      size: {
        height: 1,
        width: 12
      }
    },
    visibilityHook() {
      const { data: identity } = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useGetIdentity();
      if (!identity) {
        return false;
      }
      return !identity?.verified;
    }
  },
  {
    areaId: "dashboard:profile",
    componentName: "widgets/account/bio",
    id: "dashboard:bio",
    order: 0,
    position: {
      size: {
        height: 1,
        width: 4
      }
    }
  },
  {
    areaId: "dashboard:profile",
    componentName: "widgets/account/profile",
    id: "dashboard:profile",
    order: 1,
    position: {
      size: {
        height: 1,
        width: 8
      }
    }
  },
  {
    areaId: "dashboard:profile",
    componentName: "widgets/account/delete",
    id: "dashboard:delete",
    order: 2,
    position: {
      size: {
        height: 1,
        width: 4
      }
    }
  },
  {
    areaId: "dashboard:security",
    componentName: "widgets/account/password",
    id: "dashboard:password",
    position: {
      size: {
        height: 2,
        width: 6
      }
    }
  },
  {
    areaId: "dashboard:security",
    componentName: "widgets/account/2fa",
    id: "dashboard:2fa",
    position: {
      size: {
        height: 2,
        width: 6
      }
    }
  },
  {
    areaId: "core:desktop-sidebar",
    componentName: "widgets/upload/button",
    id: "dashboard:upload-button",
    position: {
      size: {
        height: 2,
        width: 6
      }
    }
  }
];
const dashboardWidgets = {
  areas: widgetAreas,
  widgets: widgetRegistrations
};

function plugin() {
  return {
    capabilities: [
      new Capability$2(),
      new Capability$1(),
      new Capability()
    ],
    async destroy(_framework) {
      console.log("Plugin Dashboard destroyed");
    },
    features: [new Feature()],
    id: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.createNamespacedId("core", "dashboard"),
    async initialize(_framework) {
      console.log("Plugin Dashboard initialized");
      registerInput();
    },
    routes,
    widgets: dashboardWidgets
  };
}

export { plugin as default };
