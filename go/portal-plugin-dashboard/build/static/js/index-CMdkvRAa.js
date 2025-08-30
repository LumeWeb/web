import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__-BjauFvDm.js';
import { createAuthProvider, DATA_PROVIDER_NAME } from './auth-BIgtohDr.js';
import './resetPassword.schema-Dp8aq7MN.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__, React, jsxRuntimeExports } from './jsx-runtime-D_0QkpWj.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__-CFuxgGnQ.js';
import { core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__-CUREaEX2.js';
import './core_dashboard__loadShare__react_mf_2_router__loadShare__-CShhB-Ww.js';
import { z } from './index-DESmQ-Cl.js';
import { Mail } from './mail-CUVyKsOG.js';
import { createLucideIcon } from './createLucideIcon-BcyKBqCx.js';
import { User } from './user-CtKcqqQe.js';
import { Key } from './key-qRiY-pBO.js';

//#region src/capabilities/refineConfig.ts
var Capability$2 = class Capability {
	dependencies = ["core:core:sdk-auth"];
	id = "core:core:refine-config-auth";
	status;
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

//#region src/types.ts
/**
* Standard error type for account-related operations
*/
var AccountError = class extends Error {
	details;
	constructor(message, statusCode, details) {
		super(message);
		this.statusCode = statusCode;
		this.name = "AccountError";
		this.details = details;
	}
	toJSON() {
		return {
			name: this.name,
			message: this.message,
			statusCode: this.statusCode,
			details: this.details
		};
	}
};
/**
* Convert a failed fetch Response to an AccountError
* @param response The failed Response object
* @returns A properly formatted AccountError
*/
async function handleFetchError(response) {
	const statusCode = response.status;
	let errorMessage;
	let errorDetails = null;
	try {
		const data = await response.json();
		if (data && typeof data === "object") if (data.error) if (typeof data.error === "string") errorMessage = data.error;
		else if (data.error.message) {
			errorMessage = data.error.message;
			errorDetails = data.error.details || null;
		} else errorMessage = JSON.stringify(data.error);
		else if (data.message) {
			errorMessage = data.message;
			errorDetails = data.details || null;
		} else errorMessage = JSON.stringify(data);
		else if (typeof data === "string") errorMessage = data;
		else errorMessage = "Unknown error occurred";
	} catch (parseError) {
		errorMessage = await response.text() || response.statusText;
	}
	const error = new AccountError(errorMessage, statusCode);
	if (errorDetails) error.details = errorDetails;
	return error;
}
/**
* Convert an unknown error to an AccountError
* @param e The unknown error
* @returns A properly formatted AccountError
*/
function handleUnknownError(e) {
	if (e instanceof Error) return new AccountError(e.message, 500);
	if (typeof e === "object" && e !== null) return new AccountError(JSON.stringify(e), 500);
	return new AccountError(String(e), 500);
}

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
  * @returns Result indicating success or failure
  */
  async verifyEmail(verifyEmailRequest) {
    return this.fetchJson("/api/account/verify-email", {
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
  * @param {string} input - The API endpoint path
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
      const contentLength = response.headers.get("content-length");
      if (contentLength === "0" || response.status === 204) return {
        data: void 0,
        success: true
      };
      const rawBody = await response.text();
      if (!rawBody || rawBody.trim().length === 0) return {
        data: void 0,
        success: true
      };
      let responseBody;
      try {
        responseBody = JSON.parse(rawBody);
      } catch {
        const errorDetails = {
          note: "invalid JSON response",
          status: response.status
        };
        if (undefined                                       === "true") ;
        return {
          error: new AccountError("Failed to parse JSON response", response.status, errorDetails),
          success: false
        };
      }
      if (responseBody && typeof responseBody === "object") {
        if ("error" in responseBody) {
          const message = typeof responseBody.error === "string" ? responseBody.error : responseBody.error?.message || "Unknown error";
          return {
            error: new AccountError(message, response.status, responseBody.error),
            success: false
          };
        }
        if ("data" in responseBody) return {
          data: responseBody.data,
          success: true
        };
      }
      return {
        data: responseBody,
        success: true
      };
    } catch (e) {
      return {
        error: handleUnknownError(e),
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
			const apiUrl = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.getApiBaseUrl({ currentUrl: framework.portalUrl });
			if (apiUrl === false) throw new Error("Invalid API URL configuration");
			this.#sdk = new Sdk(apiUrl);
		} catch (error) {
			throw new Error(`SDK initialization failed: ${error instanceof Error ? error.message : String(error)}`);
		}
	}
};

/**
 * @license lucide-react v0.525.0 - ISC
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
 * @license lucide-react v0.525.0 - ISC
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
 * @license lucide-react v0.525.0 - ISC
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

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
  password_confirm: z.string()
}).superRefine((data, ctx) => {
  if (data.password !== data.password_confirm) {
    return ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords do not match",
      path: ["password_confirm"]
    });
  }
  return true;
});

function updateEmailForm() {
  return {
    actionButtonsLayout: "horizontal",
    validationSchema: schema,
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
    ]
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
    type: "form"
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
        className: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("flex items-center gap-2 w-full", className),
        ref,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Input,
            {
              className: "text-white w-full",
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
              className: "hover:text-white bg-transparent",
              onClick: (e) => {
                e.preventDefault();
                openDialog(updateEmailDialogConfig(customHook, refetch));
              },
              size: "sm",
              variant: "outline",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "w-4 h-4" })
            }
          )
        ]
      }
    );
  }
);
function registerInput() {
  core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.registerFormComponent("core:dashboard:account.email", AccountEmail);
}

//#region src/utils/mapOperator.ts
const mapOperator = (operator) => {
	const mapping = {
		and: "and",
		eq: "",
		ne: "ne",
		lt: "lt",
		gt: "gt",
		lte: "lte",
		gte: "gte",
		in: "in",
		nin: "nin",
		contains: "contains",
		ncontains: "ncontains",
		containss: "containss",
		ncontainss: "ncontainss",
		between: "between",
		nbetween: "nbetween",
		null: "null",
		nnull: "nnull",
		startswith: "startswith",
		nstartswith: "nstartswith",
		startswiths: "startswiths",
		nstartswiths: "nstartswiths",
		endswith: "endswith",
		nendswith: "nendswith",
		endswiths: "endswiths",
		nendswiths: "nendswiths",
		ina: "ina",
		nina: "nina",
		or: ""
	};
	const mapped = mapping[operator];
	if (mapped === void 0) throw new Error(`Unsupported operator: ${operator}`);
	return mapped;
};

//#region src/utils/generateFilter.ts
const processCondition = (condition) => {
	if (condition.field === "q") return {
		path: ["q"],
		value: encodeURIComponent(String(condition.value))
	};
	const operator = mapOperator(condition.operator);
	let value = condition.value;
	if (Array.isArray(value)) {
		value = value.map((v) => String(v)).join(",");
		value = encodeURIComponent(value);
	} else if (condition.operator === "null" || condition.operator === "nnull") value = "";
	else value = encodeURIComponent(String(value));
	if (!condition.field) return null;
	const path = [condition.field];
	if (operator) path.push(operator);
	return {
		path,
		value
	};
};
const processOrCondition = (filter, basePath, query) => {
	if (filter.operator === "or" && Array.isArray(filter.value)) filter.value.forEach((condition, index) => {
		const conditionPath = [
			...basePath,
			"or",
			String(index)
		];
		if ("operator" in condition && condition.operator === "and" && Array.isArray(condition.value)) condition.value.forEach((subCondition, subIndex) => {
			const subConditionPath = [
				...conditionPath,
				"and",
				String(subIndex)
			];
			const processedCondition = processCondition(subCondition);
			if (processedCondition) {
				const finalPath = [...subConditionPath, ...processedCondition.path];
				const key = finalPath.reduce((acc, segment) => {
					return acc ? `${acc}[${segment}]` : segment;
				}, "");
				query[key] = processedCondition.value;
			}
		});
		else {
			const processedCondition = processCondition(condition);
			if (processedCondition) {
				const finalPath = [...conditionPath, ...processedCondition.path];
				const key = finalPath.reduce((acc, segment) => {
					return acc ? `${acc}[${segment}]` : segment;
				}, "");
				query[key] = processedCondition.value;
			}
		}
	});
};
const generateFilter = (filters) => {
	const query = {};
	let hasGlobalSearch = false;
	filters?.forEach((filter) => {
		if (filter.operator === "or") processOrCondition(filter, ["filters"], query);
		else if ("field" in filter && filter.field === "q") {
			if (hasGlobalSearch) {
				console.warn("Only one global search (q) filter allowed");
				return;
			}
			hasGlobalSearch = true;
			const processedCondition = processCondition(filter);
			if (processedCondition) query[processedCondition.path.join("")] = processedCondition.value;
		} else {
			const processedCondition = processCondition(filter);
			if (processedCondition) {
				const finalPath = ["filters", ...processedCondition.path];
				const key = finalPath.reduce((acc, segment) => {
					return acc ? `${acc}[${segment}]` : segment;
				}, "");
				query[key] = processedCondition.value;
			}
		}
	});
	return query;
};

//#region src/utils/generateSort.ts
const generateSort = (sorters) => {
	if (!sorters?.length) return {};
	const validSorters = sorters.filter((s) => s.field && (s.order === void 0 || ["asc", "desc"].includes(s.order.toLowerCase())));
	if (!validSorters.length) return {};
	return {
		_sort: validSorters.map((s) => encodeURIComponent(s.field)).join(","),
		_order: validSorters.map((s) => encodeURIComponent(s.order?.toLowerCase() || "asc")).join(",")
	};
};

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

function pupa(template, data, {ignoreMissing = false, transform = ({value}) => value} = {}) {
	if (typeof template !== 'string') {
		throw new TypeError(`Expected a \`string\` in the first argument, got \`${typeof template}\``);
	}

	if (typeof data !== 'object') {
		throw new TypeError(`Expected an \`object\` or \`Array\` in the second argument, got \`${typeof data}\``);
	}

	const replace = (placeholder, key) => {
		let value = data;
		for (const property of key.split('.')) {
			value = value ? value[property] : undefined;
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

	const composeHtmlEscape = replacer => (...args) => htmlEscape(replacer(...args));

	// The regex tries to match either a number inside `{{ }}` or a valid JS identifier or key path.
	const doubleBraceRegex = /{{(\d+|[a-z$_][\w\-$]*?(?:\.[\w\-$]*?)*?)}}/gi;

	if (doubleBraceRegex.test(template)) {
		template = template.replace(doubleBraceRegex, composeHtmlEscape(replace));
	}

	const braceRegex = /{(\d+|[a-z$_][\w\-$]*?(?:\.[\w\-$]*?)*?)}/gi;

	return template.replace(braceRegex, replace);
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
		const encodedParams = Object.fromEntries(Object.entries(params).map(([k, v]) => [k, encodeURIComponent(v)]));
		resolvedPath = pupa(template, encodedParams);
	} catch (error) {
		if (error instanceof Error && error.message.startsWith("Missing a value")) {
			const paramMatch = /placeholder: (\w+)/.exec(error.message);
			if (paramMatch) throw new NestedParamError(paramMatch[1]);
		}
		throw new TemplateResolutionError(template, error);
	}
	const invalidMarkers = resolvedPath.match(/[{}]/g) || [];
	if (invalidMarkers.length > 0) throw new TemplateResolutionError(template);
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
        const title = response.statusText || '';
        const status = `${code} ${title}`.trim();
        const reason = status ? `status code ${status}` : 'an unknown error';
        super(`Request failed with ${reason}: ${request.method} ${request.url}`);
        this.name = 'HTTPError';
        this.response = response;
        this.request = request;
        this.options = options;
    }
}

class TimeoutError extends Error {
    request;
    constructor(request) {
        super(`Request timed out: ${request.method} ${request.url}`);
        this.name = 'TimeoutError';
        this.request = request;
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
};
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
    dispatcher: true,
    duplex: true,
    priority: true,
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
const streamResponse = (response, onDownloadProgress) => {
    const totalBytes = Number(response.headers.get('content-length')) || 0;
    let transferredBytes = 0;
    if (response.status === 204) {
        if (onDownloadProgress) {
            onDownloadProgress({ percent: 1, totalBytes, transferredBytes }, new Uint8Array());
        }
        return new Response(null, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        });
    }
    return new Response(new ReadableStream({
        async start(controller) {
            const reader = response.body.getReader();
            if (onDownloadProgress) {
                onDownloadProgress({ percent: 0, transferredBytes: 0, totalBytes }, new Uint8Array());
            }
            async function read() {
                const { done, value } = await reader.read();
                if (done) {
                    controller.close();
                    return;
                }
                if (onDownloadProgress) {
                    transferredBytes += value.byteLength;
                    const percent = totalBytes === 0 ? 0 : transferredBytes / totalBytes;
                    onDownloadProgress({ percent, transferredBytes, totalBytes }, value);
                }
                controller.enqueue(value);
                await read();
            }
            await read();
        },
    }), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
    });
};
const streamRequest = (request, onUploadProgress) => {
    const totalBytes = getBodySize(request.body);
    let transferredBytes = 0;
    return new Request(request, {
        // @ts-expect-error - Types are outdated.
        duplex: 'half',
        body: new ReadableStream({
            async start(controller) {
                const reader = request.body instanceof ReadableStream ? request.body.getReader() : new Response('').body.getReader();
                async function read() {
                    const { done, value } = await reader.read();
                    if (done) {
                        // Ensure 100% progress is reported when the upload is complete
                        if (onUploadProgress) {
                            onUploadProgress({ percent: 1, transferredBytes, totalBytes: Math.max(totalBytes, transferredBytes) }, new Uint8Array());
                        }
                        controller.close();
                        return;
                    }
                    transferredBytes += value.byteLength;
                    let percent = totalBytes === 0 ? 0 : transferredBytes / totalBytes;
                    if (totalBytes < transferredBytes || percent === 1) {
                        percent = 0.99;
                    }
                    if (onUploadProgress) {
                        onUploadProgress({ percent: Number(percent.toFixed(2)), transferredBytes, totalBytes }, value);
                    }
                    controller.enqueue(value);
                    await read();
                }
                await read();
            },
        }),
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
// TODO: Make this strongly-typed (no `any`).
const deepMerge = (...sources) => {
    let returnValue = {};
    let headers = {};
    let hooks = {};
    for (const source of sources) {
        if (Array.isArray(source)) {
            if (!Array.isArray(returnValue)) {
                returnValue = [];
            }
            returnValue = [...returnValue, ...source];
        }
        else if (isObject(source)) {
            for (let [key, value] of Object.entries(source)) {
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
    if (retry.statusCodes && !Array.isArray(retry.statusCodes)) {
        throw new Error('retry.statusCodes must be an array');
    }
    return {
        ...defaultRetryOptions,
        ...retry,
    };
};

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
        if (!(key in requestOptionsRegistry) && !(key in kyOptionKeys) && !(key in request)) {
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

class Ky {
    static create(input, options) {
        const ky = new Ky(input, options);
        const function_ = async () => {
            if (typeof ky._options.timeout === 'number' && ky._options.timeout > maxSafeTimeout) {
                throw new RangeError(`The \`timeout\` option cannot be greater than ${maxSafeTimeout}`);
            }
            // Delay the fetch so that body method shortcuts can set the Accept header
            await Promise.resolve();
            // Before using ky.request, _fetch clones it and saves the clone for future retries to use.
            // If retry is not needed, close the cloned request's ReadableStream for memory safety.
            let response = await ky._fetch();
            for (const hook of ky._options.hooks.afterResponse) {
                // eslint-disable-next-line no-await-in-loop
                const modifiedResponse = await hook(ky.request, ky._options, ky._decorateResponse(response.clone()));
                if (modifiedResponse instanceof globalThis.Response) {
                    response = modifiedResponse;
                }
            }
            ky._decorateResponse(response);
            if (!response.ok && ky._options.throwHttpErrors) {
                let error = new HTTPError(response, ky.request, ky._options);
                for (const hook of ky._options.hooks.beforeError) {
                    // eslint-disable-next-line no-await-in-loop
                    error = await hook(error);
                }
                throw error;
            }
            // If `onDownloadProgress` is passed, it uses the stream API internally
            if (ky._options.onDownloadProgress) {
                if (typeof ky._options.onDownloadProgress !== 'function') {
                    throw new TypeError('The `onDownloadProgress` option must be a function');
                }
                if (!supportsResponseStreams) {
                    throw new Error('Streams are not supported in your environment. `ReadableStream` is missing.');
                }
                return streamResponse(response.clone(), ky._options.onDownloadProgress);
            }
            return response;
        };
        const isRetriableMethod = ky._options.retry.methods.includes(ky.request.method.toLowerCase());
        const result = (isRetriableMethod ? ky._retry(function_) : function_())
            .finally(async () => {
            // Now that we know a retry is not needed, close the ReadableStream of the cloned request.
            if (!ky.request.bodyUsed) {
                await ky.request.body?.cancel();
            }
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
                    const arrayBuffer = await response.clone().arrayBuffer();
                    const responseSize = arrayBuffer.byteLength;
                    if (responseSize === 0) {
                        return '';
                    }
                    if (options.parseJson) {
                        return options.parseJson(await response.text());
                    }
                }
                return response[type]();
            };
        }
        return result;
    }
    request;
    abortController;
    _retryCount = 0;
    _input;
    _options;
    // eslint-disable-next-line complexity
    constructor(input, options = {}) {
        this._input = input;
        this._options = {
            ...options,
            headers: mergeHeaders(this._input.headers, options.headers),
            hooks: mergeHooks({
                beforeRequest: [],
                beforeRetry: [],
                beforeError: [],
                afterResponse: [],
            }, options.hooks),
            method: normalizeRequestMethod(options.method ?? this._input.method ?? 'GET'),
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            prefixUrl: String(options.prefixUrl || ''),
            retry: normalizeRetryOptions(options.retry),
            throwHttpErrors: options.throwHttpErrors !== false,
            timeout: options.timeout ?? 10_000,
            fetch: options.fetch ?? globalThis.fetch.bind(globalThis),
        };
        if (typeof this._input !== 'string' && !(this._input instanceof URL || this._input instanceof globalThis.Request)) {
            throw new TypeError('`input` must be a string, URL, or Request');
        }
        if (this._options.prefixUrl && typeof this._input === 'string') {
            if (this._input.startsWith('/')) {
                throw new Error('`input` must not begin with a slash when using `prefixUrl`');
            }
            if (!this._options.prefixUrl.endsWith('/')) {
                this._options.prefixUrl += '/';
            }
            this._input = this._options.prefixUrl + this._input;
        }
        if (supportsAbortController && supportsAbortSignal) {
            const originalSignal = this._options.signal ?? this._input.signal;
            this.abortController = new globalThis.AbortController();
            this._options.signal = originalSignal ? AbortSignal.any([originalSignal, this.abortController.signal]) : this.abortController.signal;
        }
        if (supportsRequestStreams) {
            // @ts-expect-error - Types are outdated.
            this._options.duplex = 'half';
        }
        if (this._options.json !== undefined) {
            this._options.body = this._options.stringifyJson?.(this._options.json) ?? JSON.stringify(this._options.json);
            this._options.headers.set('content-type', this._options.headers.get('content-type') ?? 'application/json');
        }
        this.request = new globalThis.Request(this._input, this._options);
        if (hasSearchParameters(this._options.searchParams)) {
            // eslint-disable-next-line unicorn/prevent-abbreviations
            const textSearchParams = typeof this._options.searchParams === 'string'
                ? this._options.searchParams.replace(/^\?/, '')
                : new URLSearchParams(this._options.searchParams).toString();
            // eslint-disable-next-line unicorn/prevent-abbreviations
            const searchParams = '?' + textSearchParams;
            const url = this.request.url.replace(/(?:\?.*?)?(?=#|$)/, searchParams);
            // To provide correct form boundary, Content-Type header should be deleted each time when new Request instantiated from another one
            if (((supportsFormData && this._options.body instanceof globalThis.FormData)
                || this._options.body instanceof URLSearchParams) && !(this._options.headers && this._options.headers['content-type'])) {
                this.request.headers.delete('content-type');
            }
            // The spread of `this.request` is required as otherwise it misses the `duplex` option for some reason and throws.
            this.request = new globalThis.Request(new globalThis.Request(url, { ...this.request }), this._options);
        }
        // If `onUploadProgress` is passed, it uses the stream API internally
        if (this._options.onUploadProgress) {
            if (typeof this._options.onUploadProgress !== 'function') {
                throw new TypeError('The `onUploadProgress` option must be a function');
            }
            if (!supportsRequestStreams) {
                throw new Error('Request streams are not supported in your environment. The `duplex` option for `Request` is not available.');
            }
            const originalBody = this.request.body;
            if (originalBody) {
                this.request = streamRequest(this.request, this._options.onUploadProgress);
            }
        }
    }
    _calculateRetryDelay(error) {
        this._retryCount++;
        if (this._retryCount > this._options.retry.limit || error instanceof TimeoutError) {
            throw error;
        }
        if (error instanceof HTTPError) {
            if (!this._options.retry.statusCodes.includes(error.response.status)) {
                throw error;
            }
            const retryAfter = error.response.headers.get('Retry-After')
                ?? error.response.headers.get('RateLimit-Reset')
                ?? error.response.headers.get('X-RateLimit-Reset') // GitHub
                ?? error.response.headers.get('X-Rate-Limit-Reset'); // Twitter
            if (retryAfter && this._options.retry.afterStatusCodes.includes(error.response.status)) {
                let after = Number(retryAfter) * 1000;
                if (Number.isNaN(after)) {
                    after = Date.parse(retryAfter) - Date.now();
                }
                else if (after >= Date.parse('2024-01-01')) {
                    // A large number is treated as a timestamp (fixed threshold protects against clock skew)
                    after -= Date.now();
                }
                const max = this._options.retry.maxRetryAfter ?? after;
                return after < max ? after : max;
            }
            if (error.response.status === 413) {
                throw error;
            }
        }
        const retryDelay = this._options.retry.delay(this._retryCount);
        return Math.min(this._options.retry.backoffLimit, retryDelay);
    }
    _decorateResponse(response) {
        if (this._options.parseJson) {
            response.json = async () => this._options.parseJson(await response.text());
        }
        return response;
    }
    async _retry(function_) {
        try {
            return await function_();
        }
        catch (error) {
            const ms = Math.min(this._calculateRetryDelay(error), maxSafeTimeout);
            if (this._retryCount < 1) {
                throw error;
            }
            await delay(ms, { signal: this._options.signal });
            for (const hook of this._options.hooks.beforeRetry) {
                // eslint-disable-next-line no-await-in-loop
                const hookResult = await hook({
                    request: this.request,
                    options: this._options,
                    error: error,
                    retryCount: this._retryCount,
                });
                // If `stop` is returned from the hook, the retry process is stopped
                if (hookResult === stop) {
                    return;
                }
            }
            return this._retry(function_);
        }
    }
    async _fetch() {
        for (const hook of this._options.hooks.beforeRequest) {
            // eslint-disable-next-line no-await-in-loop
            const result = await hook(this.request, this._options);
            if (result instanceof Request) {
                this.request = result;
                break;
            }
            if (result instanceof Response) {
                return result;
            }
        }
        const nonRequestOptions = findUnknownOptions(this.request, this._options);
        // Cloning is done here to prepare in advance for retries
        const mainRequest = this.request;
        this.request = mainRequest.clone();
        if (this._options.timeout === false) {
            return this._options.fetch(mainRequest, nonRequestOptions);
        }
        return timeout(mainRequest, nonRequestOptions, this.abortController, this._options);
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
    return ky;
};
const ky = createInstance();

//#region src/utils/kyInstance.ts
const httpClient = (apiBase) => ky.extend({
	hooks: {
		afterResponse: [async (request, options, response) => {
			if (!response.ok) {
				const errorBody = await response.clone().json().catch(() => ({}));
				const error = {
					message: errorBody.message || "An error occurred while processing the request",
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

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

var encode = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return Object.keys(obj).map(function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (Array.isArray(obj[k])) {
        return obj[k].map(function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).filter(Boolean).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var stringify;
stringify = encode;

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
const addParam = (key, value, queryParams) => {
	if (value !== void 0) queryParams[key] = value;
};
const dataProvider = (apiUrl) => {
	let authToken = null;
	const setAuthToken = (token) => {
		authToken = token;
	};
	const baseFetch = async (url, method, payload, queryParams, headers) => {
		const searchParams = queryParams ? `?${stringify(queryParams)}` : "";
		const fullUrl = `${url}${searchParams}`;
		const options = {
			headers: {
				"Content-Type": "application/json",
				...authToken ? { Authorization: `Bearer ${authToken}` } : {},
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
			const url = generateNestedUrl({
				apiBase: apiUrl,
				meta,
				resource
			});
			const headers = meta?.headers ?? {};
			const response = await baseFetch(url, "POST", variables, void 0, headers);
			const data = await parseResponse(response);
			return { data };
		},
		custom: async ({ filters, meta, method, payload, sorters, url: operation }) => {
			const headers = meta?.headers ?? {};
			const baseUrl = generateNestedUrl({
				apiBase: apiUrl,
				meta,
				operation
			});
			const filterParams = generateFilter(filters);
			const sortParams = generateSort(sorters);
			const queryParams = {};
			Object.entries(filterParams).forEach(([key, value]) => addParam(key, value, queryParams));
			Object.entries(sortParams).forEach(([key, value]) => addParam(key, value, queryParams));
			const response = await baseFetch(baseUrl, method.toUpperCase(), payload, queryParams, headers);
			const data = await parseResponse(response);
			return { data };
		},
		deleteOne: async ({ id, meta, resource, variables }) => {
			const url = generateNestedUrl({
				apiBase: apiUrl,
				id,
				meta,
				resource
			});
			const headers = meta?.headers ?? {};
			const response = await baseFetch(url, "DELETE", variables, void 0, headers);
			if (response instanceof Response && !response.ok) try {
				const errorBody = await response.json();
				throw new Error(errorBody.message || `HTTP error ${response.status}`);
			} catch (jsonError) {
				throw new Error(`HTTP error ${response.status}: Could not parse error body`);
			}
			const responseText = await response.text();
			if (!responseText.trim()) return { data: null };
			try {
				const data = JSON.parse(responseText);
				return { data };
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
			const filterParams = generateFilter(filters);
			const sortParams = generateSort(sorters);
			const queryParams = {};
			Object.entries(filterParams).forEach(([key, value]) => addParam(key, value, queryParams));
			Object.entries(sortParams).forEach(([key, value]) => addParam(key, value, queryParams));
			if (pagination) {
				const { current = 1, pageSize = 10 } = pagination;
				const start = (current - 1) * pageSize;
				const end = start + pageSize;
				addParam("_start", start, queryParams);
				addParam("_end", end, queryParams);
			}
			const response = await baseFetch(url, "GET", void 0, queryParams, headers);
			const data = await parseResponse(response);
			let total = Number(response.headers.get("x-total-count"));
			if (Number.isNaN(total) || total === 0) if (data && typeof data.total === "number") total = data.total;
			else {
				total = 0;
				console.warn("Total count not found in headers or data.");
			}
			if (data && Array.isArray(data.data)) return {
				data: data.data,
				total
			};
			return {
				data: [],
				total: 0
			};
		},
		getOne: async ({ id, meta, resource }) => {
			const url = generateNestedUrl({
				apiBase: apiUrl,
				id,
				meta,
				resource
			});
			const headers = meta?.headers ?? {};
			const response = await baseFetch(url, "GET", void 0, void 0, headers);
			const data = await parseResponse(response);
			return { data };
		},
		setAuthToken,
		update: async ({ id, meta, resource, variables }) => {
			const url = generateNestedUrl({
				apiBase: apiUrl,
				id,
				meta,
				resource
			});
			const headers = meta?.headers ?? {};
			const response = await baseFetch(url, "PATCH", variables, void 0, headers);
			const data = await parseResponse(response);
			return { data };
		}
	};
};

//#region src/index.ts
var src_default = dataProvider;

class Capability {
  id = "core:dashboard:refine-config";
  status;
  type = "core:refine-config";
  version;
  #apiUrl;
  async destroy() {
  }
  getConfig(existing) {
    const token = localStorage.getItem("jwt");
    const acctProvider = src_default(this.#apiUrl);
    if (token) {
      acctProvider.setAuthToken(token);
    }
    const authProvider = existing?.authProvider;
    if (authProvider) {
      authProvider.on("authCheckSuccess", (params) => {
        acctProvider.setAuthToken(params.token);
      });
    }
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
      label: "Dashboard"
    },
    path: "/dashboard"
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
      linkable: false
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
    id: "core:dashboard:header"
  },
  {
    grid: {
      columns: 12,
      gap: 16,
      rowHeight: "auto"
    },
    id: "core:dashboard:profile"
  },
  {
    grid: {
      columns: 12,
      gap: 16,
      rowHeight: "auto"
    },
    id: "core:dashboard:security"
  }
];
const widgetRegistrations = [
  {
    areaId: "core:dashboard:header",
    componentName: "widgets/account/emailVerificationBanner",
    id: "core:dashboard:email-verification",
    position: {
      size: {
        height: 1,
        width: 12
      }
    }
  },
  {
    areaId: "core:dashboard:profile",
    componentName: "widgets/account/bio",
    id: "core:dashboard:bio",
    order: 0,
    position: {
      size: {
        height: 1,
        width: 4
      }
    }
  },
  {
    areaId: "core:dashboard:profile",
    componentName: "widgets/account/profile",
    id: "core:dashboard:profile",
    order: 1,
    position: {
      size: {
        height: 1,
        width: 8
      }
    }
  },
  {
    areaId: "core:dashboard:profile",
    componentName: "widgets/account/delete",
    id: "core:dashboard:delete",
    order: 2,
    position: {
      size: {
        height: 1,
        width: 4
      }
    }
  },
  {
    areaId: "core:dashboard:security",
    componentName: "widgets/account/password",
    id: "core:dashboard:password",
    position: {
      size: {
        height: 2,
        width: 6
      }
    }
  },
  {
    areaId: "core:dashboard:security",
    componentName: "widgets/account/2fa",
    id: "core:dashboard:2fa",
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

function index() {
  return {
    capabilities: [
      new Capability$2(),
      new Capability$1(),
      new Capability()
    ],
    async destroy(_framework) {
      console.log("Plugin Dashboard destroyed");
    },
    id: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.createNamespacedId("core", "dashboard"),
    async initialize(_framework) {
      console.log("Plugin Dashboard initialized");
      registerInput();
    },
    routes,
    widgets: dashboardWidgets
  };
}

export { index as default };
