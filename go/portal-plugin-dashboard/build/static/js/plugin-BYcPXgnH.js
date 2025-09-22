import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__-BjauFvDm.js';
import { createAuthProvider, DATA_PROVIDER_NAME } from './auth-C5ewMkbH.js';
import './resetPassword.schema-BdPzDz_P.js';
import { getDefaultExportFromCjs, commonjsGlobal, core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__, React, jsxRuntimeExports } from './jsx-runtime-D_0QkpWj.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__-CFuxgGnQ.js';
import { core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__-DOYraqnS.js';
import './core_dashboard__loadShare__react_mf_2_router__loadShare__-BAqyw0OF.js';
import { BasePlugin, RateLimitedQueue, getAllowedMetaFields, EventManager, filterNonFailedFiles, filterFilesToEmitUploadStarted, isNetworkError, NetworkError, XHRUpload, Uppy } from './index-BJRwIKY-.js';
import { UPLOAD_TYPE_MAIN, UPLOAD_TYPE_AVATAR, UploadStatus, isDirectoryFile, isFolderBundle } from './upload-Dami3hzH.js';
import { z } from './index-DESmQ-Cl.js';
import { Mail } from './mail-CUVyKsOG.js';
import { createLucideIcon } from './createLucideIcon-BcyKBqCx.js';
import { User } from './user-CtKcqqQe.js';
import { Key } from './key-qRiY-pBO.js';

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
		const sdk = await core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.getSdk(framework);
		this.#authProvider = createAuthProvider(sdk);
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
		const contentType = response.headers.get("content-type");
		const isJson = contentType?.toLowerCase()?.includes("json");
		const clone = response.clone();
		let errorData;
		if (isJson) try {
			errorData = await response.json();
		} catch {
			const txt = await clone.text().catch(() => "");
			errorData = txt || response.statusText;
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

//#region src/account.ts
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
			if (this.isResponseEmpty(response)) return {
				data: void 0,
				success: true
			};
			try {
				const data = await response.json();
				return {
					data,
					success: true
				};
			} catch (parseError) {
				if (this.isResponseEmpty(response)) return {
					data: void 0,
					success: true
				};
				throw parseError;
			}
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
	/**
	* Checks if a response has an empty body based on status code or content-length header
	* @param {Response} response - The response to check
	* @returns {boolean} True if the response is empty, false otherwise
	* @private
	*/
	isResponseEmpty(response) {
		if (response.status === 204 || response.status === 205 || response.status === 304) return true;
		const contentLength = response.headers.get("content-length");
		return contentLength === "0" || contentLength && parseInt(contentLength, 10) === 0;
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

function hasProperty(object, key) {
    return Object.hasOwn(object, key);
}

function _typeof$8(o) { "@babel/helpers - typeof"; return _typeof$8 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof$8(o); }
function _createClass$8(Constructor, protoProps, staticProps) { Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _classCallCheck$8(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _callSuper$1(t, o, e) { return o = _getPrototypeOf$1(o), _possibleConstructorReturn$1(t, _isNativeReflectConstruct$1() ? Reflect.construct(o, e || [], _getPrototypeOf$1(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn$1(self, call) { if (call && (_typeof$8(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized$1(self); }
function _assertThisInitialized$1(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _inherits$1(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf$1(subClass, superClass); }
function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf$1(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf$1(Wrapper, Class); }; return _wrapNativeSuper(Class); }
function _construct(t, e, r) { if (_isNativeReflectConstruct$1()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf$1(p, r.prototype), p; }
function _isNativeReflectConstruct$1() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct$1 = function _isNativeReflectConstruct() { return !!t; })(); }
function _isNativeFunction(fn) { try { return Function.toString.call(fn).indexOf("[native code]") !== -1; } catch (e) { return typeof fn === "function"; } }
function _setPrototypeOf$1(o, p) { _setPrototypeOf$1 = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf$1(o, p); }
function _getPrototypeOf$1(o) { _getPrototypeOf$1 = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf$1(o); }
var DetailedError = /*#__PURE__*/function (_Error) {
  function DetailedError(message) {
    var _this;
    var causingErr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var req = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var res = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    _classCallCheck$8(this, DetailedError);
    _this = _callSuper$1(this, DetailedError, [message]);
    _this.originalRequest = req;
    _this.originalResponse = res;
    _this.causingError = causingErr;
    if (causingErr != null) {
      message += ", caused by ".concat(causingErr.toString());
    }
    if (req != null) {
      var requestId = req.getHeader('X-Request-ID') || 'n/a';
      var method = req.getMethod();
      var url = req.getURL();
      var status = res ? res.getStatus() : 'n/a';
      var body = res ? res.getBody() || '' : 'n/a';
      message += ", originated from request (method: ".concat(method, ", url: ").concat(url, ", response code: ").concat(status, ", response text: ").concat(body, ", request id: ").concat(requestId, ")");
    }
    _this.message = message;
    return _this;
  }
  _inherits$1(DetailedError, _Error);
  return _createClass$8(DetailedError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

function log(msg) {
  return;
}

function _typeof$7(o) { "@babel/helpers - typeof"; return _typeof$7 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof$7(o); }
function _classCallCheck$7(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties$7(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey$7(descriptor.key), descriptor); } }
function _createClass$7(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$7(Constructor.prototype, protoProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey$7(t) { var i = _toPrimitive$7(t, "string"); return "symbol" == _typeof$7(i) ? i : i + ""; }
function _toPrimitive$7(t, r) { if ("object" != _typeof$7(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != _typeof$7(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return (String )(t); }
var NoopUrlStorage = /*#__PURE__*/function () {
  function NoopUrlStorage() {
    _classCallCheck$7(this, NoopUrlStorage);
  }
  return _createClass$7(NoopUrlStorage, [{
    key: "listAllUploads",
    value: function listAllUploads() {
      return Promise.resolve([]);
    }
  }, {
    key: "findUploadsByFingerprint",
    value: function findUploadsByFingerprint(_fingerprint) {
      return Promise.resolve([]);
    }
  }, {
    key: "removeUpload",
    value: function removeUpload(_urlStorageKey) {
      return Promise.resolve();
    }
  }, {
    key: "addUpload",
    value: function addUpload(_fingerprint, _upload) {
      return Promise.resolve(null);
    }
  }]);
}();

/**
 *  base64.ts
 *
 *  Licensed under the BSD 3-Clause License.
 *    http://opensource.org/licenses/BSD-3-Clause
 *
 *  References:
 *    http://en.wikipedia.org/wiki/Base64
 *
 * @author Dan Kogai (https://github.com/dankogai)
 */
const version$2 = '3.7.8';
/**
 * @deprecated use lowercase `version`.
 */
const VERSION = version$2;
const _hasBuffer = typeof Buffer === 'function';
const _TD = typeof TextDecoder === 'function' ? new TextDecoder() : undefined;
const _TE = typeof TextEncoder === 'function' ? new TextEncoder() : undefined;
const b64ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const b64chs = Array.prototype.slice.call(b64ch);
const b64tab = ((a) => {
    let tab = {};
    a.forEach((c, i) => tab[c] = i);
    return tab;
})(b64chs);
const b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;
const _fromCC = String.fromCharCode.bind(String);
const _U8Afrom = typeof Uint8Array.from === 'function'
    ? Uint8Array.from.bind(Uint8Array)
    : (it) => new Uint8Array(Array.prototype.slice.call(it, 0));
const _mkUriSafe = (src) => src
    .replace(/=/g, '').replace(/[+\/]/g, (m0) => m0 == '+' ? '-' : '_');
const _tidyB64 = (s) => s.replace(/[^A-Za-z0-9\+\/]/g, '');
/**
 * polyfill version of `btoa`
 */
const btoaPolyfill = (bin) => {
    // console.log('polyfilled');
    let u32, c0, c1, c2, asc = '';
    const pad = bin.length % 3;
    for (let i = 0; i < bin.length;) {
        if ((c0 = bin.charCodeAt(i++)) > 255 ||
            (c1 = bin.charCodeAt(i++)) > 255 ||
            (c2 = bin.charCodeAt(i++)) > 255)
            throw new TypeError('invalid character found');
        u32 = (c0 << 16) | (c1 << 8) | c2;
        asc += b64chs[u32 >> 18 & 63]
            + b64chs[u32 >> 12 & 63]
            + b64chs[u32 >> 6 & 63]
            + b64chs[u32 & 63];
    }
    return pad ? asc.slice(0, pad - 3) + "===".substring(pad) : asc;
};
/**
 * does what `window.btoa` of web browsers do.
 * @param {String} bin binary string
 * @returns {string} Base64-encoded string
 */
const _btoa = typeof btoa === 'function' ? (bin) => btoa(bin)
    : _hasBuffer ? (bin) => Buffer.from(bin, 'binary').toString('base64')
        : btoaPolyfill;
const _fromUint8Array = _hasBuffer
    ? (u8a) => Buffer.from(u8a).toString('base64')
    : (u8a) => {
        // cf. https://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string/12713326#12713326
        const maxargs = 0x1000;
        let strs = [];
        for (let i = 0, l = u8a.length; i < l; i += maxargs) {
            strs.push(_fromCC.apply(null, u8a.subarray(i, i + maxargs)));
        }
        return _btoa(strs.join(''));
    };
/**
 * converts a Uint8Array to a Base64 string.
 * @param {boolean} [urlsafe] URL-and-filename-safe a la RFC4648 §5
 * @returns {string} Base64 string
 */
const fromUint8Array = (u8a, urlsafe = false) => urlsafe ? _mkUriSafe(_fromUint8Array(u8a)) : _fromUint8Array(u8a);
// This trick is found broken https://github.com/dankogai/js-base64/issues/130
// const utob = (src: string) => unescape(encodeURIComponent(src));
// reverting good old fationed regexp
const cb_utob = (c) => {
    if (c.length < 2) {
        var cc = c.charCodeAt(0);
        return cc < 0x80 ? c
            : cc < 0x800 ? (_fromCC(0xc0 | (cc >>> 6))
                + _fromCC(0x80 | (cc & 0x3f)))
                : (_fromCC(0xe0 | ((cc >>> 12) & 0x0f))
                    + _fromCC(0x80 | ((cc >>> 6) & 0x3f))
                    + _fromCC(0x80 | (cc & 0x3f)));
    }
    else {
        var cc = 0x10000
            + (c.charCodeAt(0) - 0xD800) * 0x400
            + (c.charCodeAt(1) - 0xDC00);
        return (_fromCC(0xf0 | ((cc >>> 18) & 0x07))
            + _fromCC(0x80 | ((cc >>> 12) & 0x3f))
            + _fromCC(0x80 | ((cc >>> 6) & 0x3f))
            + _fromCC(0x80 | (cc & 0x3f)));
    }
};
const re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
/**
 * @deprecated should have been internal use only.
 * @param {string} src UTF-8 string
 * @returns {string} UTF-16 string
 */
const utob = (u) => u.replace(re_utob, cb_utob);
//
const _encode = _hasBuffer
    ? (s) => Buffer.from(s, 'utf8').toString('base64')
    : _TE
        ? (s) => _fromUint8Array(_TE.encode(s))
        : (s) => _btoa(utob(s));
/**
 * converts a UTF-8-encoded string to a Base64 string.
 * @param {boolean} [urlsafe] if `true` make the result URL-safe
 * @returns {string} Base64 string
 */
const encode$2 = (src, urlsafe = false) => urlsafe
    ? _mkUriSafe(_encode(src))
    : _encode(src);
/**
 * converts a UTF-8-encoded string to URL-safe Base64 RFC4648 §5.
 * @returns {string} Base64 string
 */
const encodeURI = (src) => encode$2(src, true);
// This trick is found broken https://github.com/dankogai/js-base64/issues/130
// const btou = (src: string) => decodeURIComponent(escape(src));
// reverting good old fationed regexp
const re_btou = /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g;
const cb_btou = (cccc) => {
    switch (cccc.length) {
        case 4:
            var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
                | ((0x3f & cccc.charCodeAt(1)) << 12)
                | ((0x3f & cccc.charCodeAt(2)) << 6)
                | (0x3f & cccc.charCodeAt(3)), offset = cp - 0x10000;
            return (_fromCC((offset >>> 10) + 0xD800)
                + _fromCC((offset & 0x3FF) + 0xDC00));
        case 3:
            return _fromCC(((0x0f & cccc.charCodeAt(0)) << 12)
                | ((0x3f & cccc.charCodeAt(1)) << 6)
                | (0x3f & cccc.charCodeAt(2)));
        default:
            return _fromCC(((0x1f & cccc.charCodeAt(0)) << 6)
                | (0x3f & cccc.charCodeAt(1)));
    }
};
/**
 * @deprecated should have been internal use only.
 * @param {string} src UTF-16 string
 * @returns {string} UTF-8 string
 */
const btou = (b) => b.replace(re_btou, cb_btou);
/**
 * polyfill version of `atob`
 */
const atobPolyfill = (asc) => {
    // console.log('polyfilled');
    asc = asc.replace(/\s+/g, '');
    if (!b64re.test(asc))
        throw new TypeError('malformed base64.');
    asc += '=='.slice(2 - (asc.length & 3));
    let u24, r1, r2;
    let binArray = []; // use array to avoid minor gc in loop
    for (let i = 0; i < asc.length;) {
        u24 = b64tab[asc.charAt(i++)] << 18
            | b64tab[asc.charAt(i++)] << 12
            | (r1 = b64tab[asc.charAt(i++)]) << 6
            | (r2 = b64tab[asc.charAt(i++)]);
        if (r1 === 64) {
            binArray.push(_fromCC(u24 >> 16 & 255));
        }
        else if (r2 === 64) {
            binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255));
        }
        else {
            binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255, u24 & 255));
        }
    }
    return binArray.join('');
};
/**
 * does what `window.atob` of web browsers do.
 * @param {String} asc Base64-encoded string
 * @returns {string} binary string
 */
const _atob = typeof atob === 'function' ? (asc) => atob(_tidyB64(asc))
    : _hasBuffer ? (asc) => Buffer.from(asc, 'base64').toString('binary')
        : atobPolyfill;
//
const _toUint8Array = _hasBuffer
    ? (a) => _U8Afrom(Buffer.from(a, 'base64'))
    : (a) => _U8Afrom(_atob(a).split('').map(c => c.charCodeAt(0)));
/**
 * converts a Base64 string to a Uint8Array.
 */
const toUint8Array = (a) => _toUint8Array(_unURI(a));
//
const _decode = _hasBuffer
    ? (a) => Buffer.from(a, 'base64').toString('utf8')
    : _TD
        ? (a) => _TD.decode(_toUint8Array(a))
        : (a) => btou(_atob(a));
const _unURI = (a) => _tidyB64(a.replace(/[-_]/g, (m0) => m0 == '-' ? '+' : '/'));
/**
 * converts a Base64 string to a UTF-8 string.
 * @param {String} src Base64 string.  Both normal and URL-safe are supported
 * @returns {string} UTF-8 string
 */
const decode$1 = (src) => _decode(_unURI(src));
/**
 * check if a value is a valid Base64 string
 * @param {String} src a value to check
  */
const isValid = (src) => {
    if (typeof src !== 'string')
        return false;
    const s = src.replace(/\s+/g, '').replace(/={0,2}$/, '');
    return !/[^\s0-9a-zA-Z\+/]/.test(s) || !/[^\s0-9a-zA-Z\-_]/.test(s);
};
//
const _noEnum = (v) => {
    return {
        value: v, enumerable: false, writable: true, configurable: true
    };
};
/**
 * extend String.prototype with relevant methods
 */
const extendString = function () {
    const _add = (name, body) => Object.defineProperty(String.prototype, name, _noEnum(body));
    _add('fromBase64', function () { return decode$1(this); });
    _add('toBase64', function (urlsafe) { return encode$2(this, urlsafe); });
    _add('toBase64URI', function () { return encode$2(this, true); });
    _add('toBase64URL', function () { return encode$2(this, true); });
    _add('toUint8Array', function () { return toUint8Array(this); });
};
/**
 * extend Uint8Array.prototype with relevant methods
 */
const extendUint8Array = function () {
    const _add = (name, body) => Object.defineProperty(Uint8Array.prototype, name, _noEnum(body));
    _add('toBase64', function (urlsafe) { return fromUint8Array(this, urlsafe); });
    _add('toBase64URI', function () { return fromUint8Array(this, true); });
    _add('toBase64URL', function () { return fromUint8Array(this, true); });
};
/**
 * extend Builtin prototypes with relevant methods
 */
const extendBuiltins = () => {
    extendString();
    extendUint8Array();
};
const gBase64 = {
    version: version$2,
    VERSION: VERSION,
    atob: _atob,
    atobPolyfill: atobPolyfill,
    btoa: _btoa,
    btoaPolyfill: btoaPolyfill,
    fromBase64: decode$1,
    toBase64: encode$2,
    encode: encode$2,
    encodeURI: encodeURI,
    encodeURL: encodeURI,
    utob: utob,
    btou: btou,
    decode: decode$1,
    isValid: isValid,
    fromUint8Array: fromUint8Array,
    toUint8Array: toUint8Array,
    extendString: extendString,
    extendUint8Array: extendUint8Array,
    extendBuiltins: extendBuiltins
};

/**
 * Check if we're required to add a port number.
 *
 * @see https://url.spec.whatwg.org/#default-port
 * @param {Number|String} port Port number we need to check
 * @param {String} protocol Protocol we need to check against.
 * @returns {Boolean} Is it a default port for the given protocol
 * @api private
 */
var requiresPort = function required(port, protocol) {
  protocol = protocol.split(':')[0];
  port = +port;

  if (!port) return false;

  switch (protocol) {
    case 'http':
    case 'ws':
    return port !== 80;

    case 'https':
    case 'wss':
    return port !== 443;

    case 'ftp':
    return port !== 21;

    case 'gopher':
    return port !== 70;

    case 'file':
    return false;
  }

  return port !== 0;
};

var querystringify$1 = {};

var has = Object.prototype.hasOwnProperty
  , undef;

/**
 * Decode a URI encoded string.
 *
 * @param {String} input The URI encoded string.
 * @returns {String|Null} The decoded string.
 * @api private
 */
function decode(input) {
  try {
    return decodeURIComponent(input.replace(/\+/g, ' '));
  } catch (e) {
    return null;
  }
}

/**
 * Attempts to encode a given input.
 *
 * @param {String} input The string that needs to be encoded.
 * @returns {String|Null} The encoded string.
 * @api private
 */
function encode$1(input) {
  try {
    return encodeURIComponent(input);
  } catch (e) {
    return null;
  }
}

/**
 * Simple query string parser.
 *
 * @param {String} query The query string that needs to be parsed.
 * @returns {Object}
 * @api public
 */
function querystring(query) {
  var parser = /([^=?#&]+)=?([^&]*)/g
    , result = {}
    , part;

  while (part = parser.exec(query)) {
    var key = decode(part[1])
      , value = decode(part[2]);

    //
    // Prevent overriding of existing properties. This ensures that build-in
    // methods like `toString` or __proto__ are not overriden by malicious
    // querystrings.
    //
    // In the case if failed decoding, we want to omit the key/value pairs
    // from the result.
    //
    if (key === null || value === null || key in result) continue;
    result[key] = value;
  }

  return result;
}

/**
 * Transform a query string to an object.
 *
 * @param {Object} obj Object that should be transformed.
 * @param {String} prefix Optional prefix.
 * @returns {String}
 * @api public
 */
function querystringify(obj, prefix) {
  prefix = prefix || '';

  var pairs = []
    , value
    , key;

  //
  // Optionally prefix with a '?' if needed
  //
  if ('string' !== typeof prefix) prefix = '?';

  for (key in obj) {
    if (has.call(obj, key)) {
      value = obj[key];

      //
      // Edge cases where we actually want to encode the value to an empty
      // string instead of the stringified value.
      //
      if (!value && (value === null || value === undef || isNaN(value))) {
        value = '';
      }

      key = encode$1(key);
      value = encode$1(value);

      //
      // If we failed to encode the strings, we should bail out as we don't
      // want to add invalid strings to the query.
      //
      if (key === null || value === null) continue;
      pairs.push(key +'='+ value);
    }
  }

  return pairs.length ? prefix + pairs.join('&') : '';
}

//
// Expose the module.
//
querystringify$1.stringify = querystringify;
querystringify$1.parse = querystring;

var required = requiresPort
  , qs = querystringify$1
  , controlOrWhitespace = /^[\x00-\x20\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/
  , CRHTLF = /[\n\r\t]/g
  , slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//
  , port = /:\d+$/
  , protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\\/]+)?([\S\s]*)/i
  , windowsDriveLetter = /^[a-zA-Z]:/;

/**
 * Remove control characters and whitespace from the beginning of a string.
 *
 * @param {Object|String} str String to trim.
 * @returns {String} A new string representing `str` stripped of control
 *     characters and whitespace from its beginning.
 * @public
 */
function trimLeft(str) {
  return (str ? str : '').toString().replace(controlOrWhitespace, '');
}

/**
 * These are the parse rules for the URL parser, it informs the parser
 * about:
 *
 * 0. The char it Needs to parse, if it's a string it should be done using
 *    indexOf, RegExp using exec and NaN means set as current value.
 * 1. The property we should set when parsing this value.
 * 2. Indication if it's backwards or forward parsing, when set as number it's
 *    the value of extra chars that should be split off.
 * 3. Inherit from location if non existing in the parser.
 * 4. `toLowerCase` the resulting value.
 */
var rules = [
  ['#', 'hash'],                        // Extract from the back.
  ['?', 'query'],                       // Extract from the back.
  function sanitize(address, url) {     // Sanitize what is left of the address
    return isSpecial(url.protocol) ? address.replace(/\\/g, '/') : address;
  },
  ['/', 'pathname'],                    // Extract from the back.
  ['@', 'auth', 1],                     // Extract from the front.
  [NaN, 'host', undefined, 1, 1],       // Set left over value.
  [/:(\d*)$/, 'port', undefined, 1],    // RegExp the back.
  [NaN, 'hostname', undefined, 1, 1]    // Set left over.
];

/**
 * These properties should not be copied or inherited from. This is only needed
 * for all non blob URL's as a blob URL does not include a hash, only the
 * origin.
 *
 * @type {Object}
 * @private
 */
var ignore = { hash: 1, query: 1 };

/**
 * The location object differs when your code is loaded through a normal page,
 * Worker or through a worker using a blob. And with the blobble begins the
 * trouble as the location object will contain the URL of the blob, not the
 * location of the page where our code is loaded in. The actual origin is
 * encoded in the `pathname` so we can thankfully generate a good "default"
 * location from it so we can generate proper relative URL's again.
 *
 * @param {Object|String} loc Optional default location object.
 * @returns {Object} lolcation object.
 * @public
 */
function lolcation(loc) {
  var globalVar;

  if (typeof window !== 'undefined') globalVar = window;
  else if (typeof commonjsGlobal !== 'undefined') globalVar = commonjsGlobal;
  else if (typeof self !== 'undefined') globalVar = self;
  else globalVar = {};

  var location = globalVar.location || {};
  loc = loc || location;

  var finaldestination = {}
    , type = typeof loc
    , key;

  if ('blob:' === loc.protocol) {
    finaldestination = new Url(unescape(loc.pathname), {});
  } else if ('string' === type) {
    finaldestination = new Url(loc, {});
    for (key in ignore) delete finaldestination[key];
  } else if ('object' === type) {
    for (key in loc) {
      if (key in ignore) continue;
      finaldestination[key] = loc[key];
    }

    if (finaldestination.slashes === undefined) {
      finaldestination.slashes = slashes.test(loc.href);
    }
  }

  return finaldestination;
}

/**
 * Check whether a protocol scheme is special.
 *
 * @param {String} The protocol scheme of the URL
 * @return {Boolean} `true` if the protocol scheme is special, else `false`
 * @private
 */
function isSpecial(scheme) {
  return (
    scheme === 'file:' ||
    scheme === 'ftp:' ||
    scheme === 'http:' ||
    scheme === 'https:' ||
    scheme === 'ws:' ||
    scheme === 'wss:'
  );
}

/**
 * @typedef ProtocolExtract
 * @type Object
 * @property {String} protocol Protocol matched in the URL, in lowercase.
 * @property {Boolean} slashes `true` if protocol is followed by "//", else `false`.
 * @property {String} rest Rest of the URL that is not part of the protocol.
 */

/**
 * Extract protocol information from a URL with/without double slash ("//").
 *
 * @param {String} address URL we want to extract from.
 * @param {Object} location
 * @return {ProtocolExtract} Extracted information.
 * @private
 */
function extractProtocol(address, location) {
  address = trimLeft(address);
  address = address.replace(CRHTLF, '');
  location = location || {};

  var match = protocolre.exec(address);
  var protocol = match[1] ? match[1].toLowerCase() : '';
  var forwardSlashes = !!match[2];
  var otherSlashes = !!match[3];
  var slashesCount = 0;
  var rest;

  if (forwardSlashes) {
    if (otherSlashes) {
      rest = match[2] + match[3] + match[4];
      slashesCount = match[2].length + match[3].length;
    } else {
      rest = match[2] + match[4];
      slashesCount = match[2].length;
    }
  } else {
    if (otherSlashes) {
      rest = match[3] + match[4];
      slashesCount = match[3].length;
    } else {
      rest = match[4];
    }
  }

  if (protocol === 'file:') {
    if (slashesCount >= 2) {
      rest = rest.slice(2);
    }
  } else if (isSpecial(protocol)) {
    rest = match[4];
  } else if (protocol) {
    if (forwardSlashes) {
      rest = rest.slice(2);
    }
  } else if (slashesCount >= 2 && isSpecial(location.protocol)) {
    rest = match[4];
  }

  return {
    protocol: protocol,
    slashes: forwardSlashes || isSpecial(protocol),
    slashesCount: slashesCount,
    rest: rest
  };
}

/**
 * Resolve a relative URL pathname against a base URL pathname.
 *
 * @param {String} relative Pathname of the relative URL.
 * @param {String} base Pathname of the base URL.
 * @return {String} Resolved pathname.
 * @private
 */
function resolve(relative, base) {
  if (relative === '') return base;

  var path = (base || '/').split('/').slice(0, -1).concat(relative.split('/'))
    , i = path.length
    , last = path[i - 1]
    , unshift = false
    , up = 0;

  while (i--) {
    if (path[i] === '.') {
      path.splice(i, 1);
    } else if (path[i] === '..') {
      path.splice(i, 1);
      up++;
    } else if (up) {
      if (i === 0) unshift = true;
      path.splice(i, 1);
      up--;
    }
  }

  if (unshift) path.unshift('');
  if (last === '.' || last === '..') path.push('');

  return path.join('/');
}

/**
 * The actual URL instance. Instead of returning an object we've opted-in to
 * create an actual constructor as it's much more memory efficient and
 * faster and it pleases my OCD.
 *
 * It is worth noting that we should not use `URL` as class name to prevent
 * clashes with the global URL instance that got introduced in browsers.
 *
 * @constructor
 * @param {String} address URL we want to parse.
 * @param {Object|String} [location] Location defaults for relative paths.
 * @param {Boolean|Function} [parser] Parser for the query string.
 * @private
 */
function Url(address, location, parser) {
  address = trimLeft(address);
  address = address.replace(CRHTLF, '');

  if (!(this instanceof Url)) {
    return new Url(address, location, parser);
  }

  var relative, extracted, parse, instruction, index, key
    , instructions = rules.slice()
    , type = typeof location
    , url = this
    , i = 0;

  //
  // The following if statements allows this module two have compatibility with
  // 2 different API:
  //
  // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
  //    where the boolean indicates that the query string should also be parsed.
  //
  // 2. The `URL` interface of the browser which accepts a URL, object as
  //    arguments. The supplied object will be used as default values / fall-back
  //    for relative paths.
  //
  if ('object' !== type && 'string' !== type) {
    parser = location;
    location = null;
  }

  if (parser && 'function' !== typeof parser) parser = qs.parse;

  location = lolcation(location);

  //
  // Extract protocol information before running the instructions.
  //
  extracted = extractProtocol(address || '', location);
  relative = !extracted.protocol && !extracted.slashes;
  url.slashes = extracted.slashes || relative && location.slashes;
  url.protocol = extracted.protocol || location.protocol || '';
  address = extracted.rest;

  //
  // When the authority component is absent the URL starts with a path
  // component.
  //
  if (
    extracted.protocol === 'file:' && (
      extracted.slashesCount !== 2 || windowsDriveLetter.test(address)) ||
    (!extracted.slashes &&
      (extracted.protocol ||
        extracted.slashesCount < 2 ||
        !isSpecial(url.protocol)))
  ) {
    instructions[3] = [/(.*)/, 'pathname'];
  }

  for (; i < instructions.length; i++) {
    instruction = instructions[i];

    if (typeof instruction === 'function') {
      address = instruction(address, url);
      continue;
    }

    parse = instruction[0];
    key = instruction[1];

    if (parse !== parse) {
      url[key] = address;
    } else if ('string' === typeof parse) {
      index = parse === '@'
        ? address.lastIndexOf(parse)
        : address.indexOf(parse);

      if (~index) {
        if ('number' === typeof instruction[2]) {
          url[key] = address.slice(0, index);
          address = address.slice(index + instruction[2]);
        } else {
          url[key] = address.slice(index);
          address = address.slice(0, index);
        }
      }
    } else if ((index = parse.exec(address))) {
      url[key] = index[1];
      address = address.slice(0, index.index);
    }

    url[key] = url[key] || (
      relative && instruction[3] ? location[key] || '' : ''
    );

    //
    // Hostname, host and protocol should be lowercased so they can be used to
    // create a proper `origin`.
    //
    if (instruction[4]) url[key] = url[key].toLowerCase();
  }

  //
  // Also parse the supplied query string in to an object. If we're supplied
  // with a custom parser as function use that instead of the default build-in
  // parser.
  //
  if (parser) url.query = parser(url.query);

  //
  // If the URL is relative, resolve the pathname against the base URL.
  //
  if (
      relative
    && location.slashes
    && url.pathname.charAt(0) !== '/'
    && (url.pathname !== '' || location.pathname !== '')
  ) {
    url.pathname = resolve(url.pathname, location.pathname);
  }

  //
  // Default to a / for pathname if none exists. This normalizes the URL
  // to always have a /
  //
  if (url.pathname.charAt(0) !== '/' && isSpecial(url.protocol)) {
    url.pathname = '/' + url.pathname;
  }

  //
  // We should not add port numbers if they are already the default port number
  // for a given protocol. As the host also contains the port number we're going
  // override it with the hostname which contains no port number.
  //
  if (!required(url.port, url.protocol)) {
    url.host = url.hostname;
    url.port = '';
  }

  //
  // Parse down the `auth` for the username and password.
  //
  url.username = url.password = '';

  if (url.auth) {
    index = url.auth.indexOf(':');

    if (~index) {
      url.username = url.auth.slice(0, index);
      url.username = encodeURIComponent(decodeURIComponent(url.username));

      url.password = url.auth.slice(index + 1);
      url.password = encodeURIComponent(decodeURIComponent(url.password));
    } else {
      url.username = encodeURIComponent(decodeURIComponent(url.auth));
    }

    url.auth = url.password ? url.username +':'+ url.password : url.username;
  }

  url.origin = url.protocol !== 'file:' && isSpecial(url.protocol) && url.host
    ? url.protocol +'//'+ url.host
    : 'null';

  //
  // The href is just the compiled result.
  //
  url.href = url.toString();
}

/**
 * This is convenience method for changing properties in the URL instance to
 * insure that they all propagate correctly.
 *
 * @param {String} part          Property we need to adjust.
 * @param {Mixed} value          The newly assigned value.
 * @param {Boolean|Function} fn  When setting the query, it will be the function
 *                               used to parse the query.
 *                               When setting the protocol, double slash will be
 *                               removed from the final url if it is true.
 * @returns {URL} URL instance for chaining.
 * @public
 */
function set(part, value, fn) {
  var url = this;

  switch (part) {
    case 'query':
      if ('string' === typeof value && value.length) {
        value = (fn || qs.parse)(value);
      }

      url[part] = value;
      break;

    case 'port':
      url[part] = value;

      if (!required(value, url.protocol)) {
        url.host = url.hostname;
        url[part] = '';
      } else if (value) {
        url.host = url.hostname +':'+ value;
      }

      break;

    case 'hostname':
      url[part] = value;

      if (url.port) value += ':'+ url.port;
      url.host = value;
      break;

    case 'host':
      url[part] = value;

      if (port.test(value)) {
        value = value.split(':');
        url.port = value.pop();
        url.hostname = value.join(':');
      } else {
        url.hostname = value;
        url.port = '';
      }

      break;

    case 'protocol':
      url.protocol = value.toLowerCase();
      url.slashes = !fn;
      break;

    case 'pathname':
    case 'hash':
      if (value) {
        var char = part === 'pathname' ? '/' : '#';
        url[part] = value.charAt(0) !== char ? char + value : value;
      } else {
        url[part] = value;
      }
      break;

    case 'username':
    case 'password':
      url[part] = encodeURIComponent(value);
      break;

    case 'auth':
      var index = value.indexOf(':');

      if (~index) {
        url.username = value.slice(0, index);
        url.username = encodeURIComponent(decodeURIComponent(url.username));

        url.password = value.slice(index + 1);
        url.password = encodeURIComponent(decodeURIComponent(url.password));
      } else {
        url.username = encodeURIComponent(decodeURIComponent(value));
      }
  }

  for (var i = 0; i < rules.length; i++) {
    var ins = rules[i];

    if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
  }

  url.auth = url.password ? url.username +':'+ url.password : url.username;

  url.origin = url.protocol !== 'file:' && isSpecial(url.protocol) && url.host
    ? url.protocol +'//'+ url.host
    : 'null';

  url.href = url.toString();

  return url;
}

/**
 * Transform the properties back in to a valid and full URL string.
 *
 * @param {Function} stringify Optional query stringify function.
 * @returns {String} Compiled version of the URL.
 * @public
 */
function toString(stringify) {
  if (!stringify || 'function' !== typeof stringify) stringify = qs.stringify;

  var query
    , url = this
    , host = url.host
    , protocol = url.protocol;

  if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';

  var result =
    protocol +
    ((url.protocol && url.slashes) || isSpecial(url.protocol) ? '//' : '');

  if (url.username) {
    result += url.username;
    if (url.password) result += ':'+ url.password;
    result += '@';
  } else if (url.password) {
    result += ':'+ url.password;
    result += '@';
  } else if (
    url.protocol !== 'file:' &&
    isSpecial(url.protocol) &&
    !host &&
    url.pathname !== '/'
  ) {
    //
    // Add back the empty userinfo, otherwise the original invalid URL
    // might be transformed into a valid one with `url.pathname` as host.
    //
    result += '@';
  }

  //
  // Trailing colon is removed from `url.host` when it is parsed. If it still
  // ends with a colon, then add back the trailing colon that was removed. This
  // prevents an invalid URL from being transformed into a valid one.
  //
  if (host[host.length - 1] === ':' || (port.test(url.hostname) && !url.port)) {
    host += ':';
  }

  result += host + url.pathname;

  query = 'object' === typeof url.query ? stringify(url.query) : url.query;
  if (query) result += '?' !== query.charAt(0) ? '?'+ query : query;

  if (url.hash) result += url.hash;

  return result;
}

Url.prototype = { set: set, toString: toString };

//
// Expose the URL parser and some additional properties that might be useful for
// others or testing.
//
Url.extractProtocol = extractProtocol;
Url.location = lolcation;
Url.trimLeft = trimLeft;
Url.qs = qs;

var urlParse = Url;

const URL$1 = /*@__PURE__*/getDefaultExportFromCjs(urlParse);

/**
 * Generate a UUID v4 based on random numbers. We intentioanlly use the less
 * secure Math.random function here since the more secure crypto.getRandomNumbers
 * is not available on all platforms.
 * This is not a problem for us since we use the UUID only for generating a
 * request ID, so we can correlate server logs to client errors.
 *
 * This function is taken from following site:
 * https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 *
 * @return {string} The generate UUID
 */
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0;
    var v = c === 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
}

function _regeneratorRuntime$1() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime$1 = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: true, configurable: true, writable: true }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof$6(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: true }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(true); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = false, next; return next.value = t, next.done = true, next; }; return i.next = i; } } throw new TypeError(_typeof$6(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: true }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: true }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = false, next; } return next.done = true, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = false, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = true; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, true); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, true); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep$1(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator$1(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep$1(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep$1(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = true, o = false; try { if (i = (t = t.call(r)).next, 0 === l) ; else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = true, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _typeof$6(o) { "@babel/helpers - typeof"; return _typeof$6 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof$6(o); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike) { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function ownKeys$1(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread$1(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys$1(Object(t), true).forEach(function (r) { _defineProperty$1(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty$1(obj, key, value) { key = _toPropertyKey$6(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _classCallCheck$6(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties$6(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey$6(descriptor.key), descriptor); } }
function _createClass$6(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$6(Constructor.prototype, protoProps); if (staticProps) _defineProperties$6(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey$6(t) { var i = _toPrimitive$6(t, "string"); return "symbol" == _typeof$6(i) ? i : i + ""; }
function _toPrimitive$6(t, r) { if ("object" != _typeof$6(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != _typeof$6(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return (String )(t); }
var PROTOCOL_TUS_V1 = 'tus-v1';
var PROTOCOL_IETF_DRAFT_03 = 'ietf-draft-03';
var PROTOCOL_IETF_DRAFT_05 = 'ietf-draft-05';
var defaultOptions$2 = {
  endpoint: null,
  uploadUrl: null,
  metadata: {},
  metadataForPartialUploads: {},
  fingerprint: null,
  uploadSize: null,
  onProgress: null,
  onChunkComplete: null,
  onSuccess: null,
  onError: null,
  onUploadUrlAvailable: null,
  overridePatchMethod: false,
  headers: {},
  addRequestId: false,
  onBeforeRequest: null,
  onAfterResponse: null,
  onShouldRetry: defaultOnShouldRetry,
  chunkSize: Number.POSITIVE_INFINITY,
  retryDelays: [0, 1000, 3000, 5000],
  parallelUploads: 1,
  parallelUploadBoundaries: null,
  storeFingerprintForResuming: true,
  removeFingerprintOnSuccess: false,
  uploadLengthDeferred: false,
  uploadDataDuringCreation: false,
  urlStorage: null,
  fileReader: null,
  httpStack: null,
  protocol: PROTOCOL_TUS_V1
};
var BaseUpload = /*#__PURE__*/function () {
  function BaseUpload(file, options) {
    _classCallCheck$6(this, BaseUpload);
    // Warn about removed options from previous versions
    if ('resume' in options) {
      console.log('tus: The `resume` option has been removed in tus-js-client v2. Please use the URL storage API instead.');
    }

    // The default options will already be added from the wrapper classes.
    this.options = options;

    // Cast chunkSize to integer
    this.options.chunkSize = Number(this.options.chunkSize);

    // The storage module used to store URLs
    this._urlStorage = this.options.urlStorage;

    // The underlying File/Blob object
    this.file = file;

    // The URL against which the file will be uploaded
    this.url = null;

    // The underlying request object for the current PATCH request
    this._req = null;

    // The fingerpinrt for the current file (set after start())
    this._fingerprint = null;

    // The key that the URL storage returned when saving an URL with a fingerprint,
    this._urlStorageKey = null;

    // The offset used in the current PATCH request
    this._offset = null;

    // True if the current PATCH request has been aborted
    this._aborted = false;

    // The file's size in bytes
    this._size = null;

    // The Source object which will wrap around the given file and provides us
    // with a unified interface for getting its size and slice chunks from its
    // content allowing us to easily handle Files, Blobs, Buffers and Streams.
    this._source = null;

    // The current count of attempts which have been made. Zero indicates none.
    this._retryAttempt = 0;

    // The timeout's ID which is used to delay the next retry
    this._retryTimeout = null;

    // The offset of the remote upload before the latest attempt was started.
    this._offsetBeforeRetry = 0;

    // An array of BaseUpload instances which are used for uploading the different
    // parts, if the parallelUploads option is used.
    this._parallelUploads = null;

    // An array of upload URLs which are used for uploading the different
    // parts, if the parallelUploads option is used.
    this._parallelUploadUrls = null;
  }

  /**
   * Use the Termination extension to delete an upload from the server by sending a DELETE
   * request to the specified upload URL. This is only possible if the server supports the
   * Termination extension. If the `options.retryDelays` property is set, the method will
   * also retry if an error ocurrs.
   *
   * @param {String} url The upload's URL which will be terminated.
   * @param {object} options Optional options for influencing HTTP requests.
   * @return {Promise} The Promise will be resolved/rejected when the requests finish.
   */
  return _createClass$6(BaseUpload, [{
    key: "findPreviousUploads",
    value: function findPreviousUploads() {
      var _this = this;
      return this.options.fingerprint(this.file, this.options).then(function (fingerprint) {
        return _this._urlStorage.findUploadsByFingerprint(fingerprint);
      });
    }
  }, {
    key: "resumeFromPreviousUpload",
    value: function resumeFromPreviousUpload(previousUpload) {
      this.url = previousUpload.uploadUrl || null;
      this._parallelUploadUrls = previousUpload.parallelUploadUrls || null;
      this._urlStorageKey = previousUpload.urlStorageKey;
    }
  }, {
    key: "start",
    value: function start() {
      var _this2 = this;
      var file = this.file;
      if (!file) {
        this._emitError(new Error('tus: no file or stream to upload provided'));
        return;
      }
      if (![PROTOCOL_TUS_V1, PROTOCOL_IETF_DRAFT_03, PROTOCOL_IETF_DRAFT_05].includes(this.options.protocol)) {
        this._emitError(new Error("tus: unsupported protocol ".concat(this.options.protocol)));
        return;
      }
      if (!this.options.endpoint && !this.options.uploadUrl && !this.url) {
        this._emitError(new Error('tus: neither an endpoint or an upload URL is provided'));
        return;
      }
      var retryDelays = this.options.retryDelays;
      if (retryDelays != null && Object.prototype.toString.call(retryDelays) !== '[object Array]') {
        this._emitError(new Error('tus: the `retryDelays` option must either be an array or null'));
        return;
      }
      if (this.options.parallelUploads > 1) {
        // Test which options are incompatible with parallel uploads.
        for (var _i = 0, _arr = ['uploadUrl', 'uploadSize', 'uploadLengthDeferred']; _i < _arr.length; _i++) {
          var optionName = _arr[_i];
          if (this.options[optionName]) {
            this._emitError(new Error("tus: cannot use the ".concat(optionName, " option when parallelUploads is enabled")));
            return;
          }
        }
      }
      if (this.options.parallelUploadBoundaries) {
        if (this.options.parallelUploads <= 1) {
          this._emitError(new Error('tus: cannot use the `parallelUploadBoundaries` option when `parallelUploads` is disabled'));
          return;
        }
        if (this.options.parallelUploads !== this.options.parallelUploadBoundaries.length) {
          this._emitError(new Error('tus: the `parallelUploadBoundaries` must have the same length as the value of `parallelUploads`'));
          return;
        }
      }
      this.options.fingerprint(file, this.options).then(function (fingerprint) {
        _this2._fingerprint = fingerprint;
        if (_this2._source) {
          return _this2._source;
        }
        return _this2.options.fileReader.openFile(file, _this2.options.chunkSize);
      }).then(function (source) {
        _this2._source = source;

        // First, we look at the uploadLengthDeferred option.
        // Next, we check if the caller has supplied a manual upload size.
        // Finally, we try to use the calculated size from the source object.
        if (_this2.options.uploadLengthDeferred) {
          _this2._size = null;
        } else if (_this2.options.uploadSize != null) {
          _this2._size = Number(_this2.options.uploadSize);
          if (Number.isNaN(_this2._size)) {
            _this2._emitError(new Error('tus: cannot convert `uploadSize` option into a number'));
            return;
          }
        } else {
          _this2._size = _this2._source.size;
          if (_this2._size == null) {
            _this2._emitError(new Error("tus: cannot automatically derive upload's size from input. Specify it manually using the `uploadSize` option or use the `uploadLengthDeferred` option"));
            return;
          }
        }

        // If the upload was configured to use multiple requests or if we resume from
        // an upload which used multiple requests, we start a parallel upload.
        if (_this2.options.parallelUploads > 1 || _this2._parallelUploadUrls != null) {
          _this2._startParallelUpload();
        } else {
          _this2._startSingleUpload();
        }
      })["catch"](function (err) {
        _this2._emitError(err);
      });
    }

    /**
     * Initiate the uploading procedure for a parallelized upload, where one file is split into
     * multiple request which are run in parallel.
     *
     * @api private
     */
  }, {
    key: "_startParallelUpload",
    value: function _startParallelUpload() {
      var _this$options$paralle,
        _this3 = this;
      var totalSize = this._size;
      var totalProgress = 0;
      this._parallelUploads = [];
      var partCount = this._parallelUploadUrls != null ? this._parallelUploadUrls.length : this.options.parallelUploads;

      // The input file will be split into multiple slices which are uploaded in separate
      // requests. Here we get the start and end position for the slices.
      var parts = (_this$options$paralle = this.options.parallelUploadBoundaries) !== null && _this$options$paralle !== void 0 ? _this$options$paralle : splitSizeIntoParts(this._source.size, partCount);

      // Attach URLs from previous uploads, if available.
      if (this._parallelUploadUrls) {
        parts.forEach(function (part, index) {
          part.uploadUrl = _this3._parallelUploadUrls[index] || null;
        });
      }

      // Create an empty list for storing the upload URLs
      this._parallelUploadUrls = new Array(parts.length);

      // Generate a promise for each slice that will be resolve if the respective
      // upload is completed.
      var uploads = parts.map(function (part, index) {
        var lastPartProgress = 0;
        return _this3._source.slice(part.start, part.end).then(function (_ref) {
          var value = _ref.value;
          return new Promise(function (resolve, reject) {
            // Merge with the user supplied options but overwrite some values.
            var options = _objectSpread$1(_objectSpread$1({}, _this3.options), {}, {
              // If available, the partial upload should be resumed from a previous URL.
              uploadUrl: part.uploadUrl || null,
              // We take manually care of resuming for partial uploads, so they should
              // not be stored in the URL storage.
              storeFingerprintForResuming: false,
              removeFingerprintOnSuccess: false,
              // Reset the parallelUploads option to not cause recursion.
              parallelUploads: 1,
              // Reset this option as we are not doing a parallel upload.
              parallelUploadBoundaries: null,
              metadata: _this3.options.metadataForPartialUploads,
              // Add the header to indicate the this is a partial upload.
              headers: _objectSpread$1(_objectSpread$1({}, _this3.options.headers), {}, {
                'Upload-Concat': 'partial'
              }),
              // Reject or resolve the promise if the upload errors or completes.
              onSuccess: resolve,
              onError: reject,
              // Based in the progress for this partial upload, calculate the progress
              // for the entire final upload.
              onProgress: function onProgress(newPartProgress) {
                totalProgress = totalProgress - lastPartProgress + newPartProgress;
                lastPartProgress = newPartProgress;
                _this3._emitProgress(totalProgress, totalSize);
              },
              // Wait until every partial upload has an upload URL, so we can add
              // them to the URL storage.
              onUploadUrlAvailable: function onUploadUrlAvailable() {
                _this3._parallelUploadUrls[index] = upload.url;
                // Test if all uploads have received an URL
                if (_this3._parallelUploadUrls.filter(function (u) {
                  return Boolean(u);
                }).length === parts.length) {
                  _this3._saveUploadInUrlStorage();
                }
              }
            });
            var upload = new BaseUpload(value, options);
            upload.start();

            // Store the upload in an array, so we can later abort them if necessary.
            _this3._parallelUploads.push(upload);
          });
        });
      });
      var req;
      // Wait until all partial uploads are finished and we can send the POST request for
      // creating the final upload.
      Promise.all(uploads).then(function () {
        req = _this3._openRequest('POST', _this3.options.endpoint);
        req.setHeader('Upload-Concat', "final;".concat(_this3._parallelUploadUrls.join(' ')));

        // Add metadata if values have been added
        var metadata = encodeMetadata(_this3.options.metadata);
        if (metadata !== '') {
          req.setHeader('Upload-Metadata', metadata);
        }
        return _this3._sendRequest(req, null);
      }).then(function (res) {
        if (!inStatusCategory(res.getStatus(), 200)) {
          _this3._emitHttpError(req, res, 'tus: unexpected response while creating upload');
          return;
        }
        var location = res.getHeader('Location');
        if (location == null) {
          _this3._emitHttpError(req, res, 'tus: invalid or missing Location header');
          return;
        }
        _this3.url = resolveUrl(_this3.options.endpoint, location);
        log("Created upload at ".concat(_this3.url));
        _this3._emitSuccess(res);
      })["catch"](function (err) {
        _this3._emitError(err);
      });
    }

    /**
     * Initiate the uploading procedure for a non-parallel upload. Here the entire file is
     * uploaded in a sequential matter.
     *
     * @api private
     */
  }, {
    key: "_startSingleUpload",
    value: function _startSingleUpload() {
      // Reset the aborted flag when the upload is started or else the
      // _performUpload will stop before sending a request if the upload has been
      // aborted previously.
      this._aborted = false;

      // The upload had been started previously and we should reuse this URL.
      if (this.url != null) {
        log("Resuming upload from previous URL: ".concat(this.url));
        this._resumeUpload();
        return;
      }

      // A URL has manually been specified, so we try to resume
      if (this.options.uploadUrl != null) {
        log("Resuming upload from provided URL: ".concat(this.options.uploadUrl));
        this.url = this.options.uploadUrl;
        this._resumeUpload();
        return;
      }
      this._createUpload();
    }

    /**
     * Abort any running request and stop the current upload. After abort is called, no event
     * handler will be invoked anymore. You can use the `start` method to resume the upload
     * again.
     * If `shouldTerminate` is true, the `terminate` function will be called to remove the
     * current upload from the server.
     *
     * @param {boolean} shouldTerminate True if the upload should be deleted from the server.
     * @return {Promise} The Promise will be resolved/rejected when the requests finish.
     */
  }, {
    key: "abort",
    value: function abort(shouldTerminate) {
      var _this4 = this;
      // Stop any parallel partial uploads, that have been started in _startParallelUploads.
      if (this._parallelUploads != null) {
        var _iterator = _createForOfIteratorHelper(this._parallelUploads),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var upload = _step.value;
            upload.abort(shouldTerminate);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }

      // Stop any current running request.
      if (this._req !== null) {
        this._req.abort();
        // Note: We do not close the file source here, so the user can resume in the future.
      }
      this._aborted = true;

      // Stop any timeout used for initiating a retry.
      if (this._retryTimeout != null) {
        clearTimeout(this._retryTimeout);
        this._retryTimeout = null;
      }
      if (!shouldTerminate || this.url == null) {
        return Promise.resolve();
      }
      return BaseUpload.terminate(this.url, this.options)
      // Remove entry from the URL storage since the upload URL is no longer valid.
      .then(function () {
        return _this4._removeFromUrlStorage();
      });
    }
  }, {
    key: "_emitHttpError",
    value: function _emitHttpError(req, res, message, causingErr) {
      this._emitError(new DetailedError(message, causingErr, req, res));
    }
  }, {
    key: "_emitError",
    value: function _emitError(err) {
      var _this5 = this;
      // Do not emit errors, e.g. from aborted HTTP requests, if the upload has been stopped.
      if (this._aborted) return;

      // Check if we should retry, when enabled, before sending the error to the user.
      if (this.options.retryDelays != null) {
        // We will reset the attempt counter if
        // - we were already able to connect to the server (offset != null) and
        // - we were able to upload a small chunk of data to the server
        var shouldResetDelays = this._offset != null && this._offset > this._offsetBeforeRetry;
        if (shouldResetDelays) {
          this._retryAttempt = 0;
        }
        if (shouldRetry(err, this._retryAttempt, this.options)) {
          var delay = this.options.retryDelays[this._retryAttempt++];
          this._offsetBeforeRetry = this._offset;
          this._retryTimeout = setTimeout(function () {
            _this5.start();
          }, delay);
          return;
        }
      }
      if (typeof this.options.onError === 'function') {
        this.options.onError(err);
      } else {
        throw err;
      }
    }

    /**
     * Publishes notification if the upload has been successfully completed.
     *
     * @param {object} lastResponse Last HTTP response.
     * @api private
     */
  }, {
    key: "_emitSuccess",
    value: function _emitSuccess(lastResponse) {
      if (this.options.removeFingerprintOnSuccess) {
        // Remove stored fingerprint and corresponding endpoint. This causes
        // new uploads of the same file to be treated as a different file.
        this._removeFromUrlStorage();
      }
      if (typeof this.options.onSuccess === 'function') {
        this.options.onSuccess({
          lastResponse: lastResponse
        });
      }
    }

    /**
     * Publishes notification when data has been sent to the server. This
     * data may not have been accepted by the server yet.
     *
     * @param {number} bytesSent  Number of bytes sent to the server.
     * @param {number} bytesTotal Total number of bytes to be sent to the server.
     * @api private
     */
  }, {
    key: "_emitProgress",
    value: function _emitProgress(bytesSent, bytesTotal) {
      if (typeof this.options.onProgress === 'function') {
        this.options.onProgress(bytesSent, bytesTotal);
      }
    }

    /**
     * Publishes notification when a chunk of data has been sent to the server
     * and accepted by the server.
     * @param {number} chunkSize  Size of the chunk that was accepted by the server.
     * @param {number} bytesAccepted Total number of bytes that have been
     *                                accepted by the server.
     * @param {number} bytesTotal Total number of bytes to be sent to the server.
     * @api private
     */
  }, {
    key: "_emitChunkComplete",
    value: function _emitChunkComplete(chunkSize, bytesAccepted, bytesTotal) {
      if (typeof this.options.onChunkComplete === 'function') {
        this.options.onChunkComplete(chunkSize, bytesAccepted, bytesTotal);
      }
    }

    /**
     * Create a new upload using the creation extension by sending a POST
     * request to the endpoint. After successful creation the file will be
     * uploaded
     *
     * @api private
     */
  }, {
    key: "_createUpload",
    value: function _createUpload() {
      var _this6 = this;
      if (!this.options.endpoint) {
        this._emitError(new Error('tus: unable to create upload because no endpoint is provided'));
        return;
      }
      var req = this._openRequest('POST', this.options.endpoint);
      if (this.options.uploadLengthDeferred) {
        req.setHeader('Upload-Defer-Length', '1');
      } else {
        req.setHeader('Upload-Length', "".concat(this._size));
      }

      // Add metadata if values have been added
      var metadata = encodeMetadata(this.options.metadata);
      if (metadata !== '') {
        req.setHeader('Upload-Metadata', metadata);
      }
      var promise;
      if (this.options.uploadDataDuringCreation && !this.options.uploadLengthDeferred) {
        this._offset = 0;
        promise = this._addChunkToRequest(req);
      } else {
        if (this.options.protocol === PROTOCOL_IETF_DRAFT_03 || this.options.protocol === PROTOCOL_IETF_DRAFT_05) {
          req.setHeader('Upload-Complete', '?0');
        }
        promise = this._sendRequest(req, null);
      }
      promise.then(function (res) {
        if (!inStatusCategory(res.getStatus(), 200)) {
          _this6._emitHttpError(req, res, 'tus: unexpected response while creating upload');
          return;
        }
        var location = res.getHeader('Location');
        if (location == null) {
          _this6._emitHttpError(req, res, 'tus: invalid or missing Location header');
          return;
        }
        _this6.url = resolveUrl(_this6.options.endpoint, location);
        log("Created upload at ".concat(_this6.url));
        if (typeof _this6.options.onUploadUrlAvailable === 'function') {
          _this6.options.onUploadUrlAvailable();
        }
        if (_this6._size === 0) {
          // Nothing to upload and file was successfully created
          _this6._emitSuccess(res);
          _this6._source.close();
          return;
        }
        _this6._saveUploadInUrlStorage().then(function () {
          if (_this6.options.uploadDataDuringCreation) {
            _this6._handleUploadResponse(req, res);
          } else {
            _this6._offset = 0;
            _this6._performUpload();
          }
        });
      })["catch"](function (err) {
        _this6._emitHttpError(req, null, 'tus: failed to create upload', err);
      });
    }

    /*
     * Try to resume an existing upload. First a HEAD request will be sent
     * to retrieve the offset. If the request fails a new upload will be
     * created. In the case of a successful response the file will be uploaded.
     *
     * @api private
     */
  }, {
    key: "_resumeUpload",
    value: function _resumeUpload() {
      var _this7 = this;
      var req = this._openRequest('HEAD', this.url);
      var promise = this._sendRequest(req, null);
      promise.then(function (res) {
        var status = res.getStatus();
        if (!inStatusCategory(status, 200)) {
          // If the upload is locked (indicated by the 423 Locked status code), we
          // emit an error instead of directly starting a new upload. This way the
          // retry logic can catch the error and will retry the upload. An upload
          // is usually locked for a short period of time and will be available
          // afterwards.
          if (status === 423) {
            _this7._emitHttpError(req, res, 'tus: upload is currently locked; retry later');
            return;
          }
          if (inStatusCategory(status, 400)) {
            // Remove stored fingerprint and corresponding endpoint,
            // on client errors since the file can not be found
            _this7._removeFromUrlStorage();
          }
          if (!_this7.options.endpoint) {
            // Don't attempt to create a new upload if no endpoint is provided.
            _this7._emitHttpError(req, res, 'tus: unable to resume upload (new upload cannot be created without an endpoint)');
            return;
          }

          // Try to create a new upload
          _this7.url = null;
          _this7._createUpload();
          return;
        }
        var offset = Number.parseInt(res.getHeader('Upload-Offset'), 10);
        if (Number.isNaN(offset)) {
          _this7._emitHttpError(req, res, 'tus: invalid or missing offset value');
          return;
        }
        var length = Number.parseInt(res.getHeader('Upload-Length'), 10);
        if (Number.isNaN(length) && !_this7.options.uploadLengthDeferred && _this7.options.protocol === PROTOCOL_TUS_V1) {
          _this7._emitHttpError(req, res, 'tus: invalid or missing length value');
          return;
        }
        if (typeof _this7.options.onUploadUrlAvailable === 'function') {
          _this7.options.onUploadUrlAvailable();
        }
        _this7._saveUploadInUrlStorage().then(function () {
          // Upload has already been completed and we do not need to send additional
          // data to the server
          if (offset === length) {
            _this7._emitProgress(length, length);
            _this7._emitSuccess(res);
            return;
          }
          _this7._offset = offset;
          _this7._performUpload();
        });
      })["catch"](function (err) {
        _this7._emitHttpError(req, null, 'tus: failed to resume upload', err);
      });
    }

    /**
     * Start uploading the file using PATCH requests. The file will be divided
     * into chunks as specified in the chunkSize option. During the upload
     * the onProgress event handler may be invoked multiple times.
     *
     * @api private
     */
  }, {
    key: "_performUpload",
    value: function _performUpload() {
      var _this8 = this;
      // If the upload has been aborted, we will not send the next PATCH request.
      // This is important if the abort method was called during a callback, such
      // as onChunkComplete or onProgress.
      if (this._aborted) {
        return;
      }
      var req;

      // Some browser and servers may not support the PATCH method. For those
      // cases, you can tell tus-js-client to use a POST request with the
      // X-HTTP-Method-Override header for simulating a PATCH request.
      if (this.options.overridePatchMethod) {
        req = this._openRequest('POST', this.url);
        req.setHeader('X-HTTP-Method-Override', 'PATCH');
      } else {
        req = this._openRequest('PATCH', this.url);
      }
      req.setHeader('Upload-Offset', "".concat(this._offset));
      var promise = this._addChunkToRequest(req);
      promise.then(function (res) {
        if (!inStatusCategory(res.getStatus(), 200)) {
          _this8._emitHttpError(req, res, 'tus: unexpected response while uploading chunk');
          return;
        }
        _this8._handleUploadResponse(req, res);
      })["catch"](function (err) {
        // Don't emit an error if the upload was aborted manually
        if (_this8._aborted) {
          return;
        }
        _this8._emitHttpError(req, null, "tus: failed to upload chunk at offset ".concat(_this8._offset), err);
      });
    }

    /**
     * _addChunktoRequest reads a chunk from the source and sends it using the
     * supplied request object. It will not handle the response.
     *
     * @api private
     */
  }, {
    key: "_addChunkToRequest",
    value: function _addChunkToRequest(req) {
      var _this9 = this;
      var start = this._offset;
      var end = this._offset + this.options.chunkSize;
      req.setProgressHandler(function (bytesSent) {
        _this9._emitProgress(start + bytesSent, _this9._size);
      });
      if (this.options.protocol === PROTOCOL_TUS_V1) {
        req.setHeader('Content-Type', 'application/offset+octet-stream');
      } else if (this.options.protocol === PROTOCOL_IETF_DRAFT_05) {
        req.setHeader('Content-Type', 'application/partial-upload');
      }

      // The specified chunkSize may be Infinity or the calcluated end position
      // may exceed the file's size. In both cases, we limit the end position to
      // the input's total size for simpler calculations and correctness.
      if ((end === Number.POSITIVE_INFINITY || end > this._size) && !this.options.uploadLengthDeferred) {
        end = this._size;
      }
      return this._source.slice(start, end).then(function (_ref2) {
        var value = _ref2.value,
          done = _ref2.done;
        var valueSize = value !== null && value !== void 0 && value.size ? value.size : 0;

        // If the upload length is deferred, the upload size was not specified during
        // upload creation. So, if the file reader is done reading, we know the total
        // upload size and can tell the tus server.
        if (_this9.options.uploadLengthDeferred && done) {
          _this9._size = _this9._offset + valueSize;
          req.setHeader('Upload-Length', "".concat(_this9._size));
        }

        // The specified uploadSize might not match the actual amount of data that a source
        // provides. In these cases, we cannot successfully complete the upload, so we
        // rather error out and let the user know. If not, tus-js-client will be stuck
        // in a loop of repeating empty PATCH requests.
        // See https://community.transloadit.com/t/how-to-abort-hanging-companion-uploads/16488/13
        var newSize = _this9._offset + valueSize;
        if (!_this9.options.uploadLengthDeferred && done && newSize !== _this9._size) {
          return Promise.reject(new Error("upload was configured with a size of ".concat(_this9._size, " bytes, but the source is done after ").concat(newSize, " bytes")));
        }
        if (value === null) {
          return _this9._sendRequest(req);
        }
        if (_this9.options.protocol === PROTOCOL_IETF_DRAFT_03 || _this9.options.protocol === PROTOCOL_IETF_DRAFT_05) {
          req.setHeader('Upload-Complete', done ? '?1' : '?0');
        }
        _this9._emitProgress(_this9._offset, _this9._size);
        return _this9._sendRequest(req, value);
      });
    }

    /**
     * _handleUploadResponse is used by requests that haven been sent using _addChunkToRequest
     * and already have received a response.
     *
     * @api private
     */
  }, {
    key: "_handleUploadResponse",
    value: function _handleUploadResponse(req, res) {
      var offset = Number.parseInt(res.getHeader('Upload-Offset'), 10);
      if (Number.isNaN(offset)) {
        this._emitHttpError(req, res, 'tus: invalid or missing offset value');
        return;
      }
      this._emitProgress(offset, this._size);
      this._emitChunkComplete(offset - this._offset, offset, this._size);
      this._offset = offset;
      if (offset === this._size) {
        // Yay, finally done :)
        this._emitSuccess(res);
        this._source.close();
        return;
      }
      this._performUpload();
    }

    /**
     * Create a new HTTP request object with the given method and URL.
     *
     * @api private
     */
  }, {
    key: "_openRequest",
    value: function _openRequest(method, url) {
      var req = openRequest(method, url, this.options);
      this._req = req;
      return req;
    }

    /**
     * Remove the entry in the URL storage, if it has been saved before.
     *
     * @api private
     */
  }, {
    key: "_removeFromUrlStorage",
    value: function _removeFromUrlStorage() {
      var _this10 = this;
      if (!this._urlStorageKey) return;
      this._urlStorage.removeUpload(this._urlStorageKey)["catch"](function (err) {
        _this10._emitError(err);
      });
      this._urlStorageKey = null;
    }

    /**
     * Add the upload URL to the URL storage, if possible.
     *
     * @api private
     */
  }, {
    key: "_saveUploadInUrlStorage",
    value: function _saveUploadInUrlStorage() {
      var _this11 = this;
      // We do not store the upload URL
      // - if it was disabled in the option, or
      // - if no fingerprint was calculated for the input (i.e. a stream), or
      // - if the URL is already stored (i.e. key is set alread).
      if (!this.options.storeFingerprintForResuming || !this._fingerprint || this._urlStorageKey !== null) {
        return Promise.resolve();
      }
      var storedUpload = {
        size: this._size,
        metadata: this.options.metadata,
        creationTime: new Date().toString()
      };
      if (this._parallelUploads) {
        // Save multiple URLs if the parallelUploads option is used ...
        storedUpload.parallelUploadUrls = this._parallelUploadUrls;
      } else {
        // ... otherwise we just save the one available URL.
        storedUpload.uploadUrl = this.url;
      }
      return this._urlStorage.addUpload(this._fingerprint, storedUpload).then(function (urlStorageKey) {
        _this11._urlStorageKey = urlStorageKey;
      });
    }

    /**
     * Send a request with the provided body.
     *
     * @api private
     */
  }, {
    key: "_sendRequest",
    value: function _sendRequest(req) {
      var body = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      return sendRequest(req, body, this.options);
    }
  }], [{
    key: "terminate",
    value: function terminate(url) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var req = openRequest('DELETE', url, options);
      return sendRequest(req, null, options).then(function (res) {
        // A 204 response indicates a successfull request
        if (res.getStatus() === 204) {
          return;
        }
        throw new DetailedError('tus: unexpected response while terminating upload', null, req, res);
      })["catch"](function (err) {
        if (!(err instanceof DetailedError)) {
          err = new DetailedError('tus: failed to terminate upload', err, req, null);
        }
        if (!shouldRetry(err, 0, options)) {
          throw err;
        }

        // Instead of keeping track of the retry attempts, we remove the first element from the delays
        // array. If the array is empty, all retry attempts are used up and we will bubble up the error.
        // We recursively call the terminate function will removing elements from the retryDelays array.
        var delay = options.retryDelays[0];
        var remainingDelays = options.retryDelays.slice(1);
        var newOptions = _objectSpread$1(_objectSpread$1({}, options), {}, {
          retryDelays: remainingDelays
        });
        return new Promise(function (resolve) {
          return setTimeout(resolve, delay);
        }).then(function () {
          return BaseUpload.terminate(url, newOptions);
        });
      });
    }
  }]);
}();
function encodeMetadata(metadata) {
  return Object.entries(metadata).map(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
      key = _ref4[0],
      value = _ref4[1];
    return "".concat(key, " ").concat(gBase64.encode(String(value)));
  }).join(',');
}

/**
 * Checks whether a given status is in the range of the expected category.
 * For example, only a status between 200 and 299 will satisfy the category 200.
 *
 * @api private
 */
function inStatusCategory(status, category) {
  return status >= category && status < category + 100;
}

/**
 * Create a new HTTP request with the specified method and URL.
 * The necessary headers that are included in every request
 * will be added, including the request ID.
 *
 * @api private
 */
function openRequest(method, url, options) {
  var req = options.httpStack.createRequest(method, url);
  if (options.protocol === PROTOCOL_IETF_DRAFT_03) {
    req.setHeader('Upload-Draft-Interop-Version', '5');
  } else if (options.protocol === PROTOCOL_IETF_DRAFT_05) {
    req.setHeader('Upload-Draft-Interop-Version', '6');
  } else {
    req.setHeader('Tus-Resumable', '1.0.0');
  }
  var headers = options.headers || {};
  for (var _i2 = 0, _Object$entries = Object.entries(headers); _i2 < _Object$entries.length; _i2++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i2], 2),
      name = _Object$entries$_i[0],
      value = _Object$entries$_i[1];
    req.setHeader(name, value);
  }
  if (options.addRequestId) {
    var requestId = uuid();
    req.setHeader('X-Request-ID', requestId);
  }
  return req;
}

/**
 * Send a request with the provided body while invoking the onBeforeRequest
 * and onAfterResponse callbacks.
 *
 * @api private
 */
function sendRequest(_x, _x2, _x3) {
  return _sendRequest2.apply(this, arguments);
}
/**
 * Checks whether the browser running this code has internet access.
 * This function will always return true in the node.js environment
 *
 * @api private
 */
function _sendRequest2() {
  _sendRequest2 = _asyncToGenerator$1( /*#__PURE__*/_regeneratorRuntime$1().mark(function _callee(req, body, options) {
    var res;
    return _regeneratorRuntime$1().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          if (!(typeof options.onBeforeRequest === 'function')) {
            _context.next = 3;
            break;
          }
          _context.next = 3;
          return options.onBeforeRequest(req);
        case 3:
          _context.next = 5;
          return req.send(body);
        case 5:
          res = _context.sent;
          if (!(typeof options.onAfterResponse === 'function')) {
            _context.next = 9;
            break;
          }
          _context.next = 9;
          return options.onAfterResponse(req, res);
        case 9:
          return _context.abrupt("return", res);
        case 10:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return _sendRequest2.apply(this, arguments);
}
function isOnline() {
  var online = true;
  // Note: We don't reference `window` here because the navigator object also exists
  // in a Web Worker's context.
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    online = false;
  }
  return online;
}

/**
 * Checks whether or not it is ok to retry a request.
 * @param {Error|DetailedError} err the error returned from the last request
 * @param {number} retryAttempt the number of times the request has already been retried
 * @param {object} options tus Upload options
 *
 * @api private
 */
function shouldRetry(err, retryAttempt, options) {
  // We only attempt a retry if
  // - retryDelays option is set
  // - we didn't exceed the maxium number of retries, yet, and
  // - this error was caused by a request or it's response and
  // - the error is server error (i.e. not a status 4xx except a 409 or 423) or
  // a onShouldRetry is specified and returns true
  // - the browser does not indicate that we are offline
  if (options.retryDelays == null || retryAttempt >= options.retryDelays.length || err.originalRequest == null) {
    return false;
  }
  if (options && typeof options.onShouldRetry === 'function') {
    return options.onShouldRetry(err, retryAttempt, options);
  }
  return defaultOnShouldRetry(err);
}

/**
 * determines if the request should be retried. Will only retry if not a status 4xx except a 409 or 423
 * @param {DetailedError} err
 * @returns {boolean}
 */
function defaultOnShouldRetry(err) {
  var status = err.originalResponse ? err.originalResponse.getStatus() : 0;
  return (!inStatusCategory(status, 400) || status === 409 || status === 423) && isOnline();
}

/**
 * Resolve a relative link given the origin as source. For example,
 * if a HTTP request to http://example.com/files/ returns a Location
 * header with the value /upload/abc, the resolved URL will be:
 * http://example.com/upload/abc
 */
function resolveUrl(origin, link) {
  return new URL$1(link, origin).toString();
}

/**
 * Calculate the start and end positions for the parts if an upload
 * is split into multiple parallel requests.
 *
 * @param {number} totalSize The byte size of the upload, which will be split.
 * @param {number} partCount The number in how many parts the upload will be split.
 * @return {object[]}
 * @api private
 */
function splitSizeIntoParts(totalSize, partCount) {
  var partSize = Math.floor(totalSize / partCount);
  var parts = [];
  for (var i = 0; i < partCount; i++) {
    parts.push({
      start: partSize * i,
      end: partSize * (i + 1)
    });
  }
  parts[partCount - 1].end = totalSize;
  return parts;
}
BaseUpload.defaultOptions = defaultOptions$2;

var isReactNative$1 = function isReactNative() {
  return typeof navigator !== 'undefined' && typeof navigator.product === 'string' && navigator.product.toLowerCase() === 'reactnative';
};

/**
 * uriToBlob resolves a URI to a Blob object. This is used for
 * React Native to retrieve a file (identified by a file://
 * URI) as a blob.
 */
function uriToBlob(uri) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function () {
      var blob = xhr.response;
      resolve(blob);
    };
    xhr.onerror = function (err) {
      reject(err);
    };
    xhr.open('GET', uri);
    xhr.send();
  });
}

var isCordova$1 = function isCordova() {
  return typeof window !== 'undefined' && (typeof window.PhoneGap !== 'undefined' || typeof window.Cordova !== 'undefined' || typeof window.cordova !== 'undefined');
};

/**
 * readAsByteArray converts a File object to a Uint8Array.
 * This function is only used on the Apache Cordova platform.
 * See https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/index.html#read-a-file
 */
function readAsByteArray(chunk) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onload = function () {
      var value = new Uint8Array(reader.result);
      resolve({
        value: value
      });
    };
    reader.onerror = function (err) {
      reject(err);
    };
    reader.readAsArrayBuffer(chunk);
  });
}

function _typeof$5(o) { "@babel/helpers - typeof"; return _typeof$5 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof$5(o); }
function _classCallCheck$5(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties$5(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey$5(descriptor.key), descriptor); } }
function _createClass$5(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$5(Constructor.prototype, protoProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey$5(t) { var i = _toPrimitive$5(t, "string"); return "symbol" == _typeof$5(i) ? i : i + ""; }
function _toPrimitive$5(t, r) { if ("object" != _typeof$5(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != _typeof$5(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return (String )(t); }
var FileSource = /*#__PURE__*/function () {
  // Make this.size a method
  function FileSource(file) {
    _classCallCheck$5(this, FileSource);
    this._file = file;
    this.size = file.size;
  }
  return _createClass$5(FileSource, [{
    key: "slice",
    value: function slice(start, end) {
      // In Apache Cordova applications, a File must be resolved using
      // FileReader instances, see
      // https://cordova.apache.org/docs/en/8.x/reference/cordova-plugin-file/index.html#read-a-file
      if (isCordova$1()) {
        return readAsByteArray(this._file.slice(start, end));
      }
      var value = this._file.slice(start, end);
      var done = end >= this.size;
      return Promise.resolve({
        value: value,
        done: done
      });
    }
  }, {
    key: "close",
    value: function close() {
      // Nothing to do here since we don't need to release any resources.
    }
  }]);
}();

function _typeof$4(o) { "@babel/helpers - typeof"; return _typeof$4 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof$4(o); }
function _classCallCheck$4(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties$4(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey$4(descriptor.key), descriptor); } }
function _createClass$4(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$4(Constructor.prototype, protoProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey$4(t) { var i = _toPrimitive$4(t, "string"); return "symbol" == _typeof$4(i) ? i : i + ""; }
function _toPrimitive$4(t, r) { if ("object" != _typeof$4(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != _typeof$4(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return (String )(t); }
function len(blobOrArray) {
  if (blobOrArray === undefined) return 0;
  if (blobOrArray.size !== undefined) return blobOrArray.size;
  return blobOrArray.length;
}

/*
  Typed arrays and blobs don't have a concat method.
  This function helps StreamSource accumulate data to reach chunkSize.
*/
function concat(a, b) {
  if (a.concat) {
    // Is `a` an Array?
    return a.concat(b);
  }
  if (a instanceof Blob) {
    return new Blob([a, b], {
      type: a.type
    });
  }
  if (a.set) {
    // Is `a` a typed array?
    var c = new a.constructor(a.length + b.length);
    c.set(a);
    c.set(b, a.length);
    return c;
  }
  throw new Error('Unknown data type');
}
var StreamSource = /*#__PURE__*/function () {
  function StreamSource(reader) {
    _classCallCheck$4(this, StreamSource);
    this._buffer = undefined;
    this._bufferOffset = 0;
    this._reader = reader;
    this._done = false;
  }
  return _createClass$4(StreamSource, [{
    key: "slice",
    value: function slice(start, end) {
      if (start < this._bufferOffset) {
        return Promise.reject(new Error("Requested data is before the reader's current offset"));
      }
      return this._readUntilEnoughDataOrDone(start, end);
    }
  }, {
    key: "_readUntilEnoughDataOrDone",
    value: function _readUntilEnoughDataOrDone(start, end) {
      var _this = this;
      var hasEnoughData = end <= this._bufferOffset + len(this._buffer);
      if (this._done || hasEnoughData) {
        var value = this._getDataFromBuffer(start, end);
        var done = value == null ? this._done : false;
        return Promise.resolve({
          value: value,
          done: done
        });
      }
      return this._reader.read().then(function (_ref) {
        var value = _ref.value,
          done = _ref.done;
        if (done) {
          _this._done = true;
        } else if (_this._buffer === undefined) {
          _this._buffer = value;
        } else {
          _this._buffer = concat(_this._buffer, value);
        }
        return _this._readUntilEnoughDataOrDone(start, end);
      });
    }
  }, {
    key: "_getDataFromBuffer",
    value: function _getDataFromBuffer(start, end) {
      // Remove data from buffer before `start`.
      // Data might be reread from the buffer if an upload fails, so we can only
      // safely delete data when it comes *before* what is currently being read.
      if (start > this._bufferOffset) {
        this._buffer = this._buffer.slice(start - this._bufferOffset);
        this._bufferOffset = start;
      }
      // If the buffer is empty after removing old data, all data has been read.
      var hasAllDataBeenRead = len(this._buffer) === 0;
      if (this._done && hasAllDataBeenRead) {
        return null;
      }
      // We already removed data before `start`, so we just return the first
      // chunk from the buffer.
      return this._buffer.slice(0, end - start);
    }
  }, {
    key: "close",
    value: function close() {
      if (this._reader.cancel) {
        this._reader.cancel();
      }
    }
  }]);
}();

function _typeof$3(o) { "@babel/helpers - typeof"; return _typeof$3 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof$3(o); }
function _regeneratorRuntime() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: true, configurable: true, writable: true }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof$3(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: true }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(true); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = false, next; return next.value = t, next.done = true, next; }; return i.next = i; } } throw new TypeError(_typeof$3(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: true }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: true }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = false, next; } return next.done = true, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = false, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = true; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, true); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, true); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _classCallCheck$3(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties$3(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey$3(descriptor.key), descriptor); } }
function _createClass$3(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$3(Constructor.prototype, protoProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey$3(t) { var i = _toPrimitive$3(t, "string"); return "symbol" == _typeof$3(i) ? i : i + ""; }
function _toPrimitive$3(t, r) { if ("object" != _typeof$3(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != _typeof$3(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return (String )(t); }
var FileReader$1 = /*#__PURE__*/function () {
  function FileReader() {
    _classCallCheck$3(this, FileReader);
  }
  return _createClass$3(FileReader, [{
    key: "openFile",
    value: function () {
      var _openFile = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(input, chunkSize) {
        var blob;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (!(isReactNative$1() && input && typeof input.uri !== 'undefined')) {
                _context.next = 11;
                break;
              }
              _context.prev = 1;
              _context.next = 4;
              return uriToBlob(input.uri);
            case 4:
              blob = _context.sent;
              return _context.abrupt("return", new FileSource(blob));
            case 8:
              _context.prev = 8;
              _context.t0 = _context["catch"](1);
              throw new Error("tus: cannot fetch `file.uri` as Blob, make sure the uri is correct and accessible. ".concat(_context.t0));
            case 11:
              if (!(typeof input.slice === 'function' && typeof input.size !== 'undefined')) {
                _context.next = 13;
                break;
              }
              return _context.abrupt("return", Promise.resolve(new FileSource(input)));
            case 13:
              if (!(typeof input.read === 'function')) {
                _context.next = 18;
                break;
              }
              chunkSize = Number(chunkSize);
              if (Number.isFinite(chunkSize)) {
                _context.next = 17;
                break;
              }
              return _context.abrupt("return", Promise.reject(new Error('cannot create source for stream without a finite value for the `chunkSize` option')));
            case 17:
              return _context.abrupt("return", Promise.resolve(new StreamSource(input, chunkSize)));
            case 18:
              return _context.abrupt("return", Promise.reject(new Error('source object may only be an instance of File, Blob, or Reader in this environment')));
            case 19:
            case "end":
              return _context.stop();
          }
        }, _callee, null, [[1, 8]]);
      }));
      function openFile(_x, _x2) {
        return _openFile.apply(this, arguments);
      }
      return openFile;
    }()
  }]);
}();

// TODO: Differenciate between input types

/**
 * Generate a fingerprint for a file which will be used the store the endpoint
 *
 * @param {File} file
 * @param {Object} options
 * @param {Function} callback
 */
function fingerprint(file, options) {
  if (isReactNative$1()) {
    return Promise.resolve(reactNativeFingerprint(file, options));
  }
  return Promise.resolve(['tus-br', file.name, file.type, file.size, file.lastModified, options.endpoint].join('-'));
}
function reactNativeFingerprint(file, options) {
  var exifHash = file.exif ? hashCode(JSON.stringify(file.exif)) : 'noexif';
  return ['tus-rn', file.name || 'noname', file.size || 'nosize', exifHash, options.endpoint].join('/');
}
function hashCode(str) {
  // from https://stackoverflow.com/a/8831937/151666
  var hash = 0;
  if (str.length === 0) {
    return hash;
  }
  for (var i = 0; i < str.length; i++) {
    var _char = str.charCodeAt(i);
    hash = (hash << 5) - hash + _char;
    hash &= hash; // Convert to 32bit integer
  }
  return hash;
}

function _typeof$2(o) { "@babel/helpers - typeof"; return _typeof$2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof$2(o); }
function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties$2(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey$2(descriptor.key), descriptor); } }
function _createClass$2(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$2(Constructor.prototype, protoProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey$2(t) { var i = _toPrimitive$2(t, "string"); return "symbol" == _typeof$2(i) ? i : i + ""; }
function _toPrimitive$2(t, r) { if ("object" != _typeof$2(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != _typeof$2(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return (String )(t); }
var XHRHttpStack = /*#__PURE__*/function () {
  function XHRHttpStack() {
    _classCallCheck$2(this, XHRHttpStack);
  }
  return _createClass$2(XHRHttpStack, [{
    key: "createRequest",
    value: function createRequest(method, url) {
      return new Request$1(method, url);
    }
  }, {
    key: "getName",
    value: function getName() {
      return 'XHRHttpStack';
    }
  }]);
}();
var Request$1 = /*#__PURE__*/function () {
  function Request(method, url) {
    _classCallCheck$2(this, Request);
    this._xhr = new XMLHttpRequest();
    this._xhr.open(method, url, true);
    this._method = method;
    this._url = url;
    this._headers = {};
  }
  return _createClass$2(Request, [{
    key: "getMethod",
    value: function getMethod() {
      return this._method;
    }
  }, {
    key: "getURL",
    value: function getURL() {
      return this._url;
    }
  }, {
    key: "setHeader",
    value: function setHeader(header, value) {
      this._xhr.setRequestHeader(header, value);
      this._headers[header] = value;
    }
  }, {
    key: "getHeader",
    value: function getHeader(header) {
      return this._headers[header];
    }
  }, {
    key: "setProgressHandler",
    value: function setProgressHandler(progressHandler) {
      // Test support for progress events before attaching an event listener
      if (!('upload' in this._xhr)) {
        return;
      }
      this._xhr.upload.onprogress = function (e) {
        if (!e.lengthComputable) {
          return;
        }
        progressHandler(e.loaded);
      };
    }
  }, {
    key: "send",
    value: function send() {
      var _this = this;
      var body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      return new Promise(function (resolve, reject) {
        _this._xhr.onload = function () {
          resolve(new Response$1(_this._xhr));
        };
        _this._xhr.onerror = function (err) {
          reject(err);
        };
        _this._xhr.send(body);
      });
    }
  }, {
    key: "abort",
    value: function abort() {
      this._xhr.abort();
      return Promise.resolve();
    }
  }, {
    key: "getUnderlyingObject",
    value: function getUnderlyingObject() {
      return this._xhr;
    }
  }]);
}();
var Response$1 = /*#__PURE__*/function () {
  function Response(xhr) {
    _classCallCheck$2(this, Response);
    this._xhr = xhr;
  }
  return _createClass$2(Response, [{
    key: "getStatus",
    value: function getStatus() {
      return this._xhr.status;
    }
  }, {
    key: "getHeader",
    value: function getHeader(header) {
      return this._xhr.getResponseHeader(header);
    }
  }, {
    key: "getBody",
    value: function getBody() {
      return this._xhr.responseText;
    }
  }, {
    key: "getUnderlyingObject",
    value: function getUnderlyingObject() {
      return this._xhr;
    }
  }]);
}();

function _typeof$1(o) { "@babel/helpers - typeof"; return _typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof$1(o); }
function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties$1(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey$1(descriptor.key), descriptor); } }
function _createClass$1(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$1(Constructor.prototype, protoProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey$1(t) { var i = _toPrimitive$1(t, "string"); return "symbol" == _typeof$1(i) ? i : i + ""; }
function _toPrimitive$1(t, r) { if ("object" != _typeof$1(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != _typeof$1(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return (String )(t); }
var hasStorage = false;
try {
  // Note: localStorage does not exist in the Web Worker's context, so we must use window here.
  hasStorage = 'localStorage' in window;

  // Attempt to store and read entries from the local storage to detect Private
  // Mode on Safari on iOS (see #49)
  // If the key was not used before, we remove it from local storage again to
  // not cause confusion where the entry came from.
  var key = 'tusSupport';
  var originalValue = localStorage.getItem(key);
  localStorage.setItem(key, originalValue);
  if (originalValue === null) localStorage.removeItem(key);
} catch (e) {
  // If we try to access localStorage inside a sandboxed iframe, a SecurityError
  // is thrown. When in private mode on iOS Safari, a QuotaExceededError is
  // thrown (see #49)
  if (e.code === e.SECURITY_ERR || e.code === e.QUOTA_EXCEEDED_ERR) {
    hasStorage = false;
  } else {
    throw e;
  }
}
var canStoreURLs = hasStorage;
var WebStorageUrlStorage = /*#__PURE__*/function () {
  function WebStorageUrlStorage() {
    _classCallCheck$1(this, WebStorageUrlStorage);
  }
  return _createClass$1(WebStorageUrlStorage, [{
    key: "findAllUploads",
    value: function findAllUploads() {
      var results = this._findEntries('tus::');
      return Promise.resolve(results);
    }
  }, {
    key: "findUploadsByFingerprint",
    value: function findUploadsByFingerprint(fingerprint) {
      var results = this._findEntries("tus::".concat(fingerprint, "::"));
      return Promise.resolve(results);
    }
  }, {
    key: "removeUpload",
    value: function removeUpload(urlStorageKey) {
      localStorage.removeItem(urlStorageKey);
      return Promise.resolve();
    }
  }, {
    key: "addUpload",
    value: function addUpload(fingerprint, upload) {
      var id = Math.round(Math.random() * 1e12);
      var key = "tus::".concat(fingerprint, "::").concat(id);
      localStorage.setItem(key, JSON.stringify(upload));
      return Promise.resolve(key);
    }
  }, {
    key: "_findEntries",
    value: function _findEntries(prefix) {
      var results = [];
      for (var i = 0; i < localStorage.length; i++) {
        var _key = localStorage.key(i);
        if (_key.indexOf(prefix) !== 0) continue;
        try {
          var upload = JSON.parse(localStorage.getItem(_key));
          upload.urlStorageKey = _key;
          results.push(upload);
        } catch (_e) {
          // The JSON parse error is intentionally ignored here, so a malformed
          // entry in the storage cannot prevent an upload.
        }
      }
      return results;
    }
  }]);
}();

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), true).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var defaultOptions$1 = _objectSpread(_objectSpread({}, BaseUpload.defaultOptions), {}, {
  httpStack: new XHRHttpStack(),
  fileReader: new FileReader$1(),
  urlStorage: canStoreURLs ? new WebStorageUrlStorage() : new NoopUrlStorage(),
  fingerprint: fingerprint
});
var Upload = /*#__PURE__*/function (_BaseUpload) {
  function Upload() {
    var file = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    _classCallCheck(this, Upload);
    options = _objectSpread(_objectSpread({}, defaultOptions$1), options);
    return _callSuper(this, Upload, [file, options]);
  }
  _inherits(Upload, _BaseUpload);
  return _createClass(Upload, null, [{
    key: "terminate",
    value: function terminate(url) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options = _objectSpread(_objectSpread({}, defaultOptions$1), options);
      return BaseUpload.terminate(url, options);
    }
  }]);
}(BaseUpload); // Note: We don't reference `window` here because these classes also exist in a Web Worker's context.

const version$1 = "5.0.1";
const packageJson$1 = {
  version: version$1};

function isCordova() {
    return (typeof window !== 'undefined' &&
        // @ts-expect-error may exist
        (typeof window.PhoneGap !== 'undefined' ||
            // @ts-expect-error may exist
            typeof window.Cordova !== 'undefined' ||
            // @ts-expect-error may exist
            typeof window.cordova !== 'undefined'));
}
function isReactNative() {
    return (typeof navigator !== 'undefined' &&
        typeof navigator.product === 'string' &&
        navigator.product.toLowerCase() === 'reactnative');
}
// We override tus fingerprint to uppy’s `file.id`, since the `file.id`
// now also includes `relativePath` for files added from folders.
// This means you can add 2 identical files, if one is in folder a,
// the other in folder b — `a/file.jpg` and `b/file.jpg`, when added
// together with a folder, will be treated as 2 separate files.
//
// For React Native and Cordova, we let tus-js-client’s default
// fingerprint handling take charge.
function getFingerprint(uppyFile) {
    return (file, options) => {
        if (isCordova() || isReactNative()) {
            return defaultOptions$1.fingerprint(file, options);
        }
        const uppyFingerprint = ['tus', uppyFile.id, options.endpoint].join('-');
        return Promise.resolve(uppyFingerprint);
    };
}

/**
 * Extracted from https://github.com/tus/tus-js-client/blob/master/lib/upload.js#L13
 * excepted we removed 'fingerprint' key to avoid adding more dependencies
 */
const tusDefaultOptions = {
    endpoint: '',
    uploadUrl: null,
    metadata: {},
    uploadSize: null,
    onProgress: null,
    onChunkComplete: null,
    onSuccess: null,
    onError: null,
    overridePatchMethod: false,
    headers: {},
    addRequestId: false,
    chunkSize: Infinity,
    retryDelays: [100, 1000, 3000, 5000],
    parallelUploads: 1,
    removeFingerprintOnSuccess: false,
    uploadLengthDeferred: false,
    uploadDataDuringCreation: false,
};
const defaultOptions = {
    limit: 20,
    retryDelays: tusDefaultOptions.retryDelays,
    withCredentials: false,
    allowedMetaFields: true,
};
/**
 * Tus resumable file uploader
 */
class Tus extends BasePlugin {
    static VERSION = packageJson$1.version;
    #retryDelayIterator;
    requests;
    uploaders;
    uploaderEvents;
    constructor(uppy, opts) {
        super(uppy, { ...defaultOptions, ...opts });
        this.type = 'uploader';
        this.id = this.opts.id || 'Tus';
        if (opts?.allowedMetaFields === undefined && 'metaFields' in this.opts) {
            throw new Error('The `metaFields` option has been renamed to `allowedMetaFields`.');
        }
        if ('autoRetry' in opts) {
            throw new Error('The `autoRetry` option was deprecated and has been removed.');
        }
        /**
         * Simultaneous upload limiting is shared across all uploads with this plugin.
         *
         * @type {RateLimitedQueue}
         */
        this.requests =
            this.opts.rateLimitedQueue ?? new RateLimitedQueue(this.opts.limit);
        this.#retryDelayIterator = this.opts.retryDelays?.values();
        this.uploaders = Object.create(null);
        this.uploaderEvents = Object.create(null);
    }
    /**
     * Clean up all references for a file's upload: the tus.Upload instance,
     * any events related to the file, and the Companion WebSocket connection.
     */
    resetUploaderReferences(fileID, opts) {
        const uploader = this.uploaders[fileID];
        if (uploader) {
            uploader.abort();
            if (opts?.abort) {
                uploader.abort(true);
            }
            this.uploaders[fileID] = null;
        }
        if (this.uploaderEvents[fileID]) {
            this.uploaderEvents[fileID].remove();
            this.uploaderEvents[fileID] = null;
        }
    }
    /**
     * Create a new Tus upload.
     *
     * A lot can happen during an upload, so this is quite hard to follow!
     * - First, the upload is started. If the file was already paused by the time the upload starts, nothing should happen.
     *   If the `limit` option is used, the upload must be queued onto the `this.requests` queue.
     *   When an upload starts, we store the tus.Upload instance, and an EventManager instance that manages the event listeners
     *   for pausing, cancellation, removal, etc.
     * - While the upload is in progress, it may be paused or cancelled.
     *   Pausing aborts the underlying tus.Upload, and removes the upload from the `this.requests` queue. All other state is
     *   maintained.
     *   Cancelling removes the upload from the `this.requests` queue, and completely aborts the upload-- the `tus.Upload`
     *   instance is aborted and discarded, the EventManager instance is destroyed (removing all listeners).
     *   Resuming the upload uses the `this.requests` queue as well, to prevent selectively pausing and resuming uploads from
     *   bypassing the limit.
     * - After completing an upload, the tus.Upload and EventManager instances are cleaned up, and the upload is marked as done
     *   in the `this.requests` queue.
     * - When an upload completed with an error, the same happens as on successful completion, but the `upload()` promise is
     *   rejected.
     *
     * When working on this function, keep in mind:
     *  - When an upload is completed or cancelled for any reason, the tus.Upload and EventManager instances need to be cleaned
     *    up using this.resetUploaderReferences().
     *  - When an upload is cancelled or paused, for any reason, it needs to be removed from the `this.requests` queue using
     *    `queuedRequest.abort()`.
     *  - When an upload is completed for any reason, including errors, it needs to be marked as such using
     *    `queuedRequest.done()`.
     *  - When an upload is started or resumed, it needs to go through the `this.requests` queue. The `queuedRequest` variable
     *    must be updated so the other uses of it are valid.
     *  - Before replacing the `queuedRequest` variable, the previous `queuedRequest` must be aborted, else it will keep taking
     *    up a spot in the queue.
     *
     */
    #uploadLocalFile(file) {
        this.resetUploaderReferences(file.id);
        // Create a new tus upload
        return new Promise((resolve, reject) => {
            let queuedRequest;
            // biome-ignore lint/style/useConst: ...
            let qRequest;
            // biome-ignore lint/style/useConst: ...
            let upload;
            const opts = {
                ...this.opts,
                ...(file.tus || {}),
            };
            if (typeof opts.headers === 'function') {
                opts.headers = opts.headers(file);
            }
            const { onShouldRetry, onBeforeRequest, ...commonOpts } = opts;
            const uploadOptions = {
                ...tusDefaultOptions,
                ...commonOpts,
            };
            // We override tus fingerprint to uppy’s `file.id`, since the `file.id`
            // now also includes `relativePath` for files added from folders.
            // This means you can add 2 identical files, if one is in folder a,
            // the other in folder b.
            uploadOptions.fingerprint = getFingerprint(file);
            uploadOptions.onBeforeRequest = async (req) => {
                const xhr = req.getUnderlyingObject();
                xhr.withCredentials = !!opts.withCredentials;
                let userProvidedPromise;
                if (typeof onBeforeRequest === 'function') {
                    userProvidedPromise = onBeforeRequest(req, file);
                }
                if (hasProperty(queuedRequest, 'shouldBeRequeued')) {
                    if (!queuedRequest.shouldBeRequeued)
                        return Promise.reject();
                    // TODO: switch to `Promise.withResolvers` on the next major if available.
                    let done;
                    const p = new Promise((res) => {
                        done = res;
                    });
                    queuedRequest = this.requests.run(() => {
                        if (file.isPaused) {
                            queuedRequest.abort();
                        }
                        done();
                        return () => { };
                    });
                    // If the request has been requeued because it was rate limited by the
                    // remote server, we want to wait for `RateLimitedQueue` to dispatch
                    // the re-try request.
                    // Therefore we create a promise that the queue will resolve when
                    // enough time has elapsed to expect not to be rate-limited again.
                    // This means we can hold the Tus retry here with a `Promise.all`,
                    // together with the returned value of the user provided
                    // `onBeforeRequest` option callback (in case it returns a promise).
                    // @ts-expect-error it's fine
                    await Promise.all([p, userProvidedPromise]);
                    return undefined;
                }
                // @ts-expect-error it's fine
                return userProvidedPromise;
            };
            uploadOptions.onError = (err) => {
                this.uppy.log(err);
                const xhr = err.originalRequest != null
                    ? err.originalRequest.getUnderlyingObject()
                    : null;
                if (isNetworkError(xhr)) {
                    err = new NetworkError(err, xhr);
                }
                this.resetUploaderReferences(file.id);
                queuedRequest?.abort();
                if (typeof opts.onError === 'function') {
                    opts.onError(err);
                }
                reject(err);
            };
            uploadOptions.onProgress = (bytesUploaded, bytesTotal) => {
                this.onReceiveUploadUrl(file, upload.url);
                if (typeof opts.onProgress === 'function') {
                    opts.onProgress(bytesUploaded, bytesTotal);
                }
                const latestFile = this.uppy.getFile(file.id);
                this.uppy.emit('upload-progress', latestFile, {
                    uploadStarted: latestFile.progress.uploadStarted ?? 0,
                    bytesUploaded,
                    bytesTotal,
                });
            };
            uploadOptions.onSuccess = (payload) => {
                const uploadResp = {
                    uploadURL: upload.url ?? undefined,
                    status: 200,
                    body: {
                        // We have to put `as XMLHttpRequest` because tus-js-client
                        // returns `any`, as the type differs in Node.js and the browser.
                        // In the browser it's always `XMLHttpRequest`.
                        xhr: payload.lastResponse.getUnderlyingObject(),
                        // Body extends Record<string, unknown> and thus `xhr` is not known
                        // but we export the `TusBody` type, which people pass as a generic into the Uppy class,
                        // so on the implementer side it works as expected.
                    },
                };
                this.uppy.emit('upload-success', this.uppy.getFile(file.id), uploadResp);
                this.resetUploaderReferences(file.id);
                queuedRequest.done();
                if (upload.url) {
                    // @ts-expect-error not typed in tus-js-client
                    const { name } = upload.file;
                    this.uppy.log(`Download ${name} from ${upload.url}`);
                }
                if (typeof opts.onSuccess === 'function') {
                    opts.onSuccess(payload);
                }
                resolve(upload);
            };
            const defaultOnShouldRetry = (err) => {
                const status = err?.originalResponse?.getStatus();
                if (status === 429) {
                    // HTTP 429 Too Many Requests => to avoid the whole download to fail, pause all requests.
                    if (!this.requests.isPaused) {
                        const next = this.#retryDelayIterator?.next();
                        if (next == null || next.done) {
                            return false;
                        }
                        this.requests.rateLimit(next.value);
                    }
                }
                else if (status != null &&
                    status >= 400 &&
                    status < 500 &&
                    status !== 409 &&
                    status !== 423) {
                    // HTTP 4xx, the server won't send anything, it's doesn't make sense to retry
                    // HTTP 409 Conflict (happens if the Upload-Offset header does not match the one on the server)
                    // HTTP 423 Locked (happens when a paused download is resumed too quickly)
                    return false;
                }
                else if (typeof navigator !== 'undefined' &&
                    navigator.onLine === false) {
                    // The navigator is offline, let's wait for it to come back online.
                    if (!this.requests.isPaused) {
                        this.requests.pause();
                        window.addEventListener('online', () => {
                            this.requests.resume();
                        }, { once: true });
                    }
                }
                queuedRequest.abort();
                queuedRequest = {
                    shouldBeRequeued: true,
                    abort() {
                        this.shouldBeRequeued = false;
                    },
                    done() {
                        throw new Error('Cannot mark a queued request as done: this indicates a bug');
                    },
                    fn() {
                        throw new Error('Cannot run a queued request: this indicates a bug');
                    },
                };
                return true;
            };
            if (onShouldRetry != null) {
                uploadOptions.onShouldRetry = (error, retryAttempt) => onShouldRetry(error, retryAttempt, opts, defaultOnShouldRetry);
            }
            else {
                uploadOptions.onShouldRetry = defaultOnShouldRetry;
            }
            const copyProp = (obj, srcProp, destProp) => {
                if (hasProperty(obj, srcProp) && !hasProperty(obj, destProp)) {
                    obj[destProp] = obj[srcProp];
                }
            };
            // We can't use `allowedMetaFields` to index generic M
            // and we also don't care about the type specifically here,
            // we just want to pass the meta fields along.
            const meta = {};
            const allowedMetaFields = getAllowedMetaFields(opts.allowedMetaFields, file.meta);
            allowedMetaFields.forEach((item) => {
                // tus type definition for metadata only accepts `Record<string, string>`
                // but in reality (at runtime) it accepts `Record<string, unknown>`
                // tus internally converts everything into a string, but let's do it here instead to be explicit.
                // because Uppy can have anything inside meta values, (for example relativePath: null is often sent by uppy)
                meta[item] = String(file.meta[item]);
            });
            // tusd uses metadata fields 'filetype' and 'filename'
            copyProp(meta, 'type', 'filetype');
            copyProp(meta, 'name', 'filename');
            uploadOptions.metadata = meta;
            upload = new Upload(file.data, uploadOptions);
            this.uploaders[file.id] = upload;
            const eventManager = new EventManager(this.uppy);
            this.uploaderEvents[file.id] = eventManager;
            qRequest = () => {
                if (!file.isPaused) {
                    upload.start();
                }
                // Don't do anything here, the caller will take care of cancelling the upload itself
                // using resetUploaderReferences(). This is because resetUploaderReferences() has to be
                // called when this request is still in the queue, and has not been started yet, too. At
                // that point this cancellation function is not going to be called.
                // Also, we need to remove the request from the queue _without_ destroying everything
                // related to this upload to handle pauses.
                return () => { };
            };
            upload.findPreviousUploads().then((previousUploads) => {
                const previousUpload = previousUploads[0];
                if (previousUpload) {
                    this.uppy.log(`[Tus] Resuming upload of ${file.id} started at ${previousUpload.creationTime}`);
                    upload.resumeFromPreviousUpload(previousUpload);
                }
                queuedRequest = this.requests.run(qRequest);
            });
            eventManager.onFileRemove(file.id, (targetFileID) => {
                queuedRequest.abort();
                this.resetUploaderReferences(file.id, { abort: !!upload.url });
                resolve(`upload ${targetFileID} was removed`);
            });
            eventManager.onPause(file.id, (isPaused) => {
                queuedRequest.abort();
                if (isPaused) {
                    // Remove this file from the queue so another file can start in its place.
                    upload.abort();
                }
                else {
                    // Resuming an upload should be queued, else you could pause and then
                    // resume a queued upload to make it skip the queue.
                    queuedRequest = this.requests.run(qRequest);
                }
            });
            eventManager.onPauseAll(file.id, () => {
                queuedRequest.abort();
                upload.abort();
            });
            eventManager.onCancelAll(file.id, () => {
                queuedRequest.abort();
                this.resetUploaderReferences(file.id, { abort: !!upload.url });
                resolve(`upload ${file.id} was canceled`);
            });
            eventManager.onResumeAll(file.id, () => {
                queuedRequest.abort();
                if (file.error) {
                    upload.abort();
                }
                queuedRequest = this.requests.run(qRequest);
            });
        }).catch((err) => {
            this.uppy.emit('upload-error', file, err);
            throw err;
        });
    }
    /**
     * Store the uploadUrl on the file options, so that when Golden Retriever
     * restores state, we will continue uploading to the correct URL.
     */
    onReceiveUploadUrl(file, uploadURL) {
        const currentFile = this.uppy.getFile(file.id);
        if (!currentFile)
            return;
        // Only do the update if we didn't have an upload URL yet.
        if (!currentFile.tus || currentFile.tus.uploadUrl !== uploadURL) {
            this.uppy.log('[Tus] Storing upload url');
            this.uppy.setFileState(currentFile.id, {
                tus: { ...currentFile.tus, uploadUrl: uploadURL },
            });
        }
    }
    #getCompanionClientArgs(file) {
        const opts = { ...this.opts };
        if (file.tus) {
            // Install file-specific upload overrides.
            Object.assign(opts, file.tus);
        }
        if (typeof opts.headers === 'function') {
            opts.headers = opts.headers(file);
        }
        return {
            ...file.remote?.body,
            endpoint: opts.endpoint,
            uploadUrl: opts.uploadUrl,
            protocol: 'tus',
            size: file.data.size,
            headers: opts.headers,
            metadata: file.meta,
        };
    }
    async #uploadFiles(files) {
        const filesFiltered = filterNonFailedFiles(files);
        const filesToEmit = filterFilesToEmitUploadStarted(filesFiltered);
        this.uppy.emit('upload-start', filesToEmit);
        await Promise.allSettled(filesFiltered.map((file) => {
            if (file.isRemote) {
                const getQueue = () => this.requests;
                const controller = new AbortController();
                const removedHandler = (removedFile) => {
                    if (removedFile.id === file.id)
                        controller.abort();
                };
                this.uppy.on('file-removed', removedHandler);
                const uploadPromise = this.uppy
                    .getRequestClientForFile(file)
                    .uploadRemoteFile(file, this.#getCompanionClientArgs(file), {
                    signal: controller.signal,
                    getQueue,
                });
                this.requests.wrapSyncFunction(() => {
                    this.uppy.off('file-removed', removedHandler);
                }, { priority: -1 })();
                return uploadPromise;
            }
            return this.#uploadLocalFile(file);
        }));
    }
    #handleUpload = async (fileIDs) => {
        if (fileIDs.length === 0) {
            this.uppy.log('[Tus] No files to upload');
            return;
        }
        if (this.opts.limit === 0) {
            this.uppy.log('[Tus] When uploading multiple files at once, consider setting the `limit` option (to `10` for example), to limit the number of concurrent uploads, which helps prevent memory and network issues: https://uppy.io/docs/tus/#limit-0', 'warning');
        }
        this.uppy.log('[Tus] Uploading...');
        const filesToUpload = this.uppy.getFilesByIds(fileIDs);
        await this.#uploadFiles(filesToUpload);
    };
    install() {
        this.uppy.setState({
            capabilities: {
                ...this.uppy.getState().capabilities,
                resumableUploads: true,
            },
        });
        this.uppy.addUploader(this.#handleUpload);
    }
    uninstall() {
        this.uppy.setState({
            capabilities: {
                ...this.uppy.getState().capabilities,
                resumableUploads: false,
            },
        });
        this.uppy.removeUploader(this.#handleUpload);
    }
}

const SMALL_PLUGIN_SUFFIX = "-small";
const LARGE_PLUGIN_SUFFIX = "-large";
const DEFAULT_PLUGIN_OPTIONS = {
  withCredentials: true,
  chunkSize: 10 * 1024 * 1024,
  removeFingerprintOnSuccess: true
};
function createLargeFilePlugin(config, serviceId, module) {
  if (!serviceId) {
    throw new Error("Service ID is required for createLargeFilePlugin");
  }
  return {
    module: module ?? Tus,
    name: `${serviceId}${LARGE_PLUGIN_SUFFIX}`,
    options: { ...DEFAULT_PLUGIN_OPTIONS, ...config }
  };
}
function createSmallFilePlugin(config, serviceId, module) {
  if (!serviceId) {
    throw new Error("Service ID is required for createSmallFilePlugin");
  }
  return {
    module: module ?? XHRUpload,
    name: `${serviceId}${SMALL_PLUGIN_SUFFIX}`,
    options: { ...DEFAULT_PLUGIN_OPTIONS, ...config }
  };
}

/**
 * Converts list into array
 */
const toArray = Array.from;

// .files fallback, should be implemented in any browser
function fallbackApi(dataTransfer) {
    const files = toArray(dataTransfer.files);
    return Promise.resolve(files);
}

/**
 * Recursive function, calls the original callback() when the directory is entirely parsed.
 */
function getFilesAndDirectoriesFromDirectory(directoryReader, oldEntries, logDropError, { onSuccess }) {
    directoryReader.readEntries((entries) => {
        const newEntries = [...oldEntries, ...entries];
        // According to the FileSystem API spec, getFilesAndDirectoriesFromDirectory()
        // must be called until it calls the onSuccess with an empty array.
        if (entries.length) {
            queueMicrotask(() => {
                getFilesAndDirectoriesFromDirectory(directoryReader, newEntries, logDropError, { onSuccess });
            });
            // Done iterating this particular directory
        }
        else {
            onSuccess(newEntries);
        }
    }, 
    // Make sure we resolve on error anyway, it's fine if only one directory couldn't be parsed!
    (error) => {
        logDropError(error);
        onSuccess(oldEntries);
    });
}

/**
 * Polyfill for the new (experimental) getAsFileSystemHandle API (using the popular webkitGetAsEntry behind the scenes)
 * so that we can switch to the getAsFileSystemHandle API once it (hopefully) becomes standard
 */
function getAsFileSystemHandleFromEntry(entry, logDropError) {
    if (entry == null)
        return entry;
    return {
        kind: entry.isFile
            ? 'file'
            : entry.isDirectory
                ? 'directory'
                : undefined,
        name: entry.name,
        getFile() {
            return new Promise((resolve, reject) => entry.file(resolve, reject));
        },
        async *values() {
            // If the file is a directory.
            const directoryReader = entry.createReader();
            const entries = await new Promise((resolve) => {
                getFilesAndDirectoriesFromDirectory(directoryReader, [], logDropError, {
                    onSuccess: (dirEntries) => resolve(dirEntries.map((file) => getAsFileSystemHandleFromEntry(file, logDropError))),
                });
            });
            yield* entries;
        },
        isSameEntry: undefined,
    };
}
async function* createPromiseToAddFileOrParseDirectory(entry, relativePath, lastResortFile = undefined) {
    const getNextRelativePath = () => `${relativePath}/${entry.name}`;
    // For each dropped item, - make sure it's a file/directory, and start deepening in!
    if (entry.kind === 'file') {
        const file = await entry.getFile();
        if (file != null) {
            file.relativePath = relativePath ? getNextRelativePath() : null;
            yield file;
        }
        else if (lastResortFile != null)
            yield lastResortFile;
    }
    else if (entry.kind === 'directory') {
        for await (const handle of entry.values()) {
            // Recurse on the directory, appending the dir name to the relative path
            yield* createPromiseToAddFileOrParseDirectory(handle, relativePath ? getNextRelativePath() : entry.name);
        }
    }
    else if (lastResortFile != null)
        yield lastResortFile;
}
/**
 * Load all files from data transfer, and recursively read any directories.
 * Note that IE is not supported for drag-drop, because IE doesn't support Data Transfers
 *
 * @param {DataTransfer} dataTransfer
 * @param {*} logDropError on error
 */
async function* getFilesFromDataTransfer(dataTransfer, logDropError) {
    // Retrieving the dropped items must happen synchronously
    // otherwise only the first item gets treated and the other ones are garbage collected.
    // https://github.com/transloadit/uppy/pull/3998
    const fileSystemHandles = await Promise.all(Array.from(dataTransfer.items, async (item) => {
        // biome-ignore lint/style/useConst: ...
        let fileSystemHandle;
        // TODO enable getAsFileSystemHandle API once we can get it working with subdirectories
        // IMPORTANT: Need to check isSecureContext *before* calling getAsFileSystemHandle
        // or else Chrome will crash when running in HTTP: https://github.com/transloadit/uppy/issues/4133
        // if (window.isSecureContext && item.getAsFileSystemHandle != null)
        // fileSystemHandle = await item.getAsFileSystemHandle()
        // `webkitGetAsEntry` exists in all popular browsers (including non-WebKit browsers),
        // however it may be renamed to getAsEntry() in the future, so you should code defensively, looking for both.
        // from https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem/webkitGetAsEntry
        const getAsEntry = () => typeof item.getAsEntry === 'function'
            ? item.getAsEntry()
            : item.webkitGetAsEntry();
        fileSystemHandle ??= getAsFileSystemHandleFromEntry(getAsEntry(), logDropError);
        return {
            fileSystemHandle,
            lastResortFile: item.getAsFile(), // can be used as a fallback in case other methods fail
        };
    }));
    for (const { lastResortFile, fileSystemHandle } of fileSystemHandles) {
        // fileSystemHandle and lastResortFile can be null when we drop an url.
        if (fileSystemHandle != null) {
            try {
                yield* createPromiseToAddFileOrParseDirectory(fileSystemHandle, '', lastResortFile);
            }
            catch (err) {
                // Example: If dropping a symbolic link, Chromium will throw:
                // "DOMException: A requested file or directory could not be found at the time an operation was processed.",
                // So we will use lastResortFile instead. See https://github.com/transloadit/uppy/issues/3505.
                if (lastResortFile != null) {
                    yield lastResortFile;
                }
                else {
                    logDropError(err);
                }
            }
        }
        else if (lastResortFile != null)
            yield lastResortFile;
    }
}

/**
 * Returns a promise that resolves to the array of dropped files (if a folder is
 * dropped, and browser supports folder parsing - promise resolves to the flat
 * array of all files in all directories).
 * Each file has .relativePath prop appended to it (e.g. "/docs/Prague/ticket_from_prague_to_ufa.pdf")
 * if browser supports it. Otherwise it's undefined.
 *
 * @param dataTransfer
 * @param options
 * @param options.logDropError - a function that's called every time some
 * folder or some file error out (e.g. because of the folder name being too long
 * on Windows). Notice that resulting promise will always be resolved anyway.
 *
 * @returns {Promise} - Array<File>
 */
async function getDroppedFiles(dataTransfer, options) {
    // Get all files from all subdirs. Works (at least) in Chrome, Mozilla, and Safari
    const logDropError = options?.logDropError ?? Function.prototype;
    try {
        const accumulator = [];
        for await (const file of getFilesFromDataTransfer(dataTransfer, logDropError)) {
            accumulator.push(file);
        }
        return accumulator;
        // Otherwise just return all first-order files
    }
    catch {
        return fallbackApi(dataTransfer);
    }
}

const version = "4.0.0";
const packageJson = {
  version};

// Default options
const defaultOpts = {
    target: null,
};
function isFileTransfer(event) {
    return event.dataTransfer?.types?.some((type) => type === 'Files') ?? false;
}
/**
 * Drop Target plugin
 *
 */
class DropTarget extends BasePlugin {
    static VERSION = packageJson.version;
    nodes;
    constructor(uppy, opts) {
        super(uppy, { ...defaultOpts, ...opts });
        this.type = 'acquirer';
        this.id = this.opts.id || 'DropTarget';
    }
    addFiles = (files) => {
        const descriptors = files.map((file) => ({
            source: this.id,
            name: file.name,
            type: file.type,
            data: file,
            meta: {
                // path of the file relative to the ancestor directory the user selected.
                // e.g. 'docs/Old Prague/airbnb.pdf'
                relativePath: file.relativePath || null,
            },
        }));
        try {
            this.uppy.addFiles(descriptors);
        }
        catch (err) {
            this.uppy.log(err);
        }
    };
    handleDrop = async (event) => {
        if (!isFileTransfer(event)) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget?.classList.remove('uppy-is-drag-over');
        this.setPluginState({ isDraggingOver: false });
        // Let any acquirer plugin (Url/Webcam/etc.) handle drops to the root
        this.uppy.iteratePlugins((plugin) => {
            if (plugin.type === 'acquirer') {
                // @ts-expect-error Every Plugin with .type acquirer can define handleRootDrop(event)
                plugin.handleRootDrop?.(event);
            }
        });
        // Add all dropped files, handle errors
        let executedDropErrorOnce = false;
        const logDropError = (error) => {
            this.uppy.log(error, 'error');
            // In practice all drop errors are most likely the same,
            // so let's just show one to avoid overwhelming the user
            if (!executedDropErrorOnce) {
                this.uppy.info(error.message, 'error');
                executedDropErrorOnce = true;
            }
        };
        const files = await getDroppedFiles(event.dataTransfer, { logDropError });
        if (files.length > 0) {
            this.uppy.log('[DropTarget] Files were dropped');
            this.addFiles(files);
        }
        this.opts.onDrop?.(event);
    };
    handleDragOver = (event) => {
        if (!isFileTransfer(event)) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        // Add a small (+) icon on drop
        // (and prevent browsers from interpreting this as files being _moved_ into the browser,
        // https://github.com/transloadit/uppy/issues/1978)
        event.dataTransfer.dropEffect = 'copy';
        event.currentTarget.classList.add('uppy-is-drag-over');
        this.setPluginState({ isDraggingOver: true });
        this.opts.onDragOver?.(event);
    };
    handleDragLeave = (event) => {
        if (!isFileTransfer(event)) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        this.setPluginState({ isDraggingOver: false });
        event.currentTarget?.classList.remove('uppy-is-drag-over');
        this.opts.onDragLeave?.(event);
    };
    addListeners = () => {
        const { target } = this.opts;
        if (target instanceof Element) {
            this.nodes = [target];
        }
        else if (typeof target === 'string') {
            this.nodes = toArray(document.querySelectorAll(target));
        }
        if (!this.nodes || this.nodes.length === 0) {
            throw new Error(`"${target}" does not match any HTML elements`);
        }
        this.nodes.forEach((node) => {
            node.addEventListener('dragover', this.handleDragOver, false);
            node.addEventListener('dragleave', this.handleDragLeave, false);
            node.addEventListener('drop', this.handleDrop, false);
        });
    };
    removeListeners = () => {
        if (this.nodes) {
            this.nodes.forEach((node) => {
                node.removeEventListener('dragover', this.handleDragOver, false);
                node.removeEventListener('dragleave', this.handleDragLeave, false);
                node.removeEventListener('drop', this.handleDrop, false);
            });
        }
    };
    install() {
        this.setPluginState({ isDraggingOver: false });
        this.addListeners();
    }
    uninstall() {
        this.removeListeners();
    }
}

const E_CANCELED = new Error('request for lock canceled');

var __awaiter$2 = function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Semaphore {
    constructor(_value, _cancelError = E_CANCELED) {
        this._value = _value;
        this._cancelError = _cancelError;
        this._queue = [];
        this._weightedWaiters = [];
    }
    acquire(weight = 1, priority = 0) {
        if (weight <= 0)
            throw new Error(`invalid weight ${weight}: must be positive`);
        return new Promise((resolve, reject) => {
            const task = { resolve, reject, weight, priority };
            const i = findIndexFromEnd(this._queue, (other) => priority <= other.priority);
            if (i === -1 && weight <= this._value) {
                // Needs immediate dispatch, skip the queue
                this._dispatchItem(task);
            }
            else {
                this._queue.splice(i + 1, 0, task);
            }
        });
    }
    runExclusive(callback_1) {
        return __awaiter$2(this, arguments, void 0, function* (callback, weight = 1, priority = 0) {
            const [value, release] = yield this.acquire(weight, priority);
            try {
                return yield callback(value);
            }
            finally {
                release();
            }
        });
    }
    waitForUnlock(weight = 1, priority = 0) {
        if (weight <= 0)
            throw new Error(`invalid weight ${weight}: must be positive`);
        if (this._couldLockImmediately(weight, priority)) {
            return Promise.resolve();
        }
        else {
            return new Promise((resolve) => {
                if (!this._weightedWaiters[weight - 1])
                    this._weightedWaiters[weight - 1] = [];
                insertSorted(this._weightedWaiters[weight - 1], { resolve, priority });
            });
        }
    }
    isLocked() {
        return this._value <= 0;
    }
    getValue() {
        return this._value;
    }
    setValue(value) {
        this._value = value;
        this._dispatchQueue();
    }
    release(weight = 1) {
        if (weight <= 0)
            throw new Error(`invalid weight ${weight}: must be positive`);
        this._value += weight;
        this._dispatchQueue();
    }
    cancel() {
        this._queue.forEach((entry) => entry.reject(this._cancelError));
        this._queue = [];
    }
    _dispatchQueue() {
        this._drainUnlockWaiters();
        while (this._queue.length > 0 && this._queue[0].weight <= this._value) {
            this._dispatchItem(this._queue.shift());
            this._drainUnlockWaiters();
        }
    }
    _dispatchItem(item) {
        const previousValue = this._value;
        this._value -= item.weight;
        item.resolve([previousValue, this._newReleaser(item.weight)]);
    }
    _newReleaser(weight) {
        let called = false;
        return () => {
            if (called)
                return;
            called = true;
            this.release(weight);
        };
    }
    _drainUnlockWaiters() {
        if (this._queue.length === 0) {
            for (let weight = this._value; weight > 0; weight--) {
                const waiters = this._weightedWaiters[weight - 1];
                if (!waiters)
                    continue;
                waiters.forEach((waiter) => waiter.resolve());
                this._weightedWaiters[weight - 1] = [];
            }
        }
        else {
            const queuedPriority = this._queue[0].priority;
            for (let weight = this._value; weight > 0; weight--) {
                const waiters = this._weightedWaiters[weight - 1];
                if (!waiters)
                    continue;
                const i = waiters.findIndex((waiter) => waiter.priority <= queuedPriority);
                (i === -1 ? waiters : waiters.splice(0, i))
                    .forEach((waiter => waiter.resolve()));
            }
        }
    }
    _couldLockImmediately(weight, priority) {
        return (this._queue.length === 0 || this._queue[0].priority < priority) &&
            weight <= this._value;
    }
}
function insertSorted(a, v) {
    const i = findIndexFromEnd(a, (other) => v.priority <= other.priority);
    a.splice(i + 1, 0, v);
}
function findIndexFromEnd(a, predicate) {
    for (let i = a.length - 1; i >= 0; i--) {
        if (predicate(a[i])) {
            return i;
        }
    }
    return -1;
}

var __awaiter$1 = function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Mutex {
    constructor(cancelError) {
        this._semaphore = new Semaphore(1, cancelError);
    }
    acquire() {
        return __awaiter$1(this, arguments, void 0, function* (priority = 0) {
            const [, releaser] = yield this._semaphore.acquire(1, priority);
            return releaser;
        });
    }
    runExclusive(callback, priority = 0) {
        return this._semaphore.runExclusive(() => callback(), 1, priority);
    }
    isLocked() {
        return this._semaphore.isLocked();
    }
    waitForUnlock(priority = 0) {
        return this._semaphore.waitForUnlock(1, priority);
    }
    release() {
        if (this._semaphore.isLocked())
            this._semaphore.release();
    }
    cancel() {
        return this._semaphore.cancel();
    }
}

class ServiceConfigValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ServiceConfigValidationError";
  }
}
function validateServiceConfig(config) {
  if (!config) {
    throw new ServiceConfigValidationError("Service config is required");
  }
  if (!config.id || typeof config.id !== "string") {
    throw new ServiceConfigValidationError("Service config must have a valid id");
  }
  if (!config.name || typeof config.name !== "string") {
    throw new ServiceConfigValidationError("Service config must have a valid name");
  }
  if (!config.smallFilePlugin) {
    throw new ServiceConfigValidationError("Service config must have a smallFilePlugin");
  }
  if (!config.largeFilePlugin) {
    throw new ServiceConfigValidationError("Service config must have a largeFilePlugin");
  }
  if (!config.smallFilePlugin.module) {
    throw new ServiceConfigValidationError("Small file plugin must have a valid plugin module");
  }
  if (!config.largeFilePlugin.module) {
    throw new ServiceConfigValidationError("Large file plugin must have a valid plugin module");
  }
  if (!config.smallFilePlugin.options || typeof config.smallFilePlugin.options !== "object") {
    throw new ServiceConfigValidationError("Small file plugin must have valid options");
  }
  if (!config.largeFilePlugin.options || typeof config.largeFilePlugin.options !== "object") {
    throw new ServiceConfigValidationError("Large file plugin must have valid options");
  }
}

const DEFAULT_MAIN_CONFIG = {
  autoProceed: false,
  maxNumberOfFiles: void 0,
  type: UPLOAD_TYPE_MAIN
};
const DEFAULT_AVATAR_CONFIG = {
  allowedFileTypes: ["image/*"],
  autoProceed: true,
  maxNumberOfFiles: 1,
  type: UPLOAD_TYPE_AVATAR
};
class Manager {
  #additionalPlugins = [];
  #config;
  #dropTargetServiceId;
  #folderMutex = new Mutex();
  #sdk;
  #services = /* @__PURE__ */ new Map();
  #storageInfo = null;
  #uploadErrors = [];
  #uploadLimit = null;
  #uppy;
  constructor(config) {
    this.#config = {
      ...config.type === UPLOAD_TYPE_MAIN ? DEFAULT_MAIN_CONFIG : DEFAULT_AVATAR_CONFIG,
      ...config
    };
    this.#sdk = this.#config.sdk;
    this.#uppy = new Uppy({
      autoProceed: this.#config.autoProceed,
      restrictions: {
        allowedFileTypes: this.#config.allowedFileTypes,
        maxFileSize: this.#config.maxFileSize,
        maxNumberOfFiles: this.#config.maxNumberOfFiles
      }
    });
    this.#setupEventHooks();
  }
  addEvent(event, callback) {
    return this.#uppy.on(event, callback);
  }
  async addFile(file, serviceId) {
    const isFolderFile = this.#isFolder(file);
    const hasRelativePath = "webkitRelativePath" in file && file.webkitRelativePath;
    const isInFolder = hasRelativePath && file.webkitRelativePath.includes("/");
    if (isFolderFile || isInFolder) {
      if (isInFolder) {
        await this.#handleFolderFile(file, serviceId);
      } else {
        let pluginId2;
        if (serviceId) {
          pluginId2 = await this.getFilePluginId(file, serviceId);
        }
        this.#uppy.addFile({
          data: file,
          meta: {
            bundleName: file.name,
            displayAsFolder: true,
            isVirtualBundle: true,
            originalFiles: []
          },
          name: file.name,
          plugins: pluginId2 ? [pluginId2] : void 0,
          type: "application/x-folder-bundle"
        });
        return;
      }
    }
    let pluginId;
    if (serviceId) {
      pluginId = await this.getFilePluginId(file, serviceId);
    }
    this.#uppy.addFile({
      data: file,
      name: file.name,
      plugins: pluginId ? [pluginId] : void 0,
      type: file.type
    });
  }
  cancelAll() {
    this.#uppy.cancelAll();
    this.#uploadErrors = [];
  }
  clearErrors() {
    this.#uploadErrors = [];
  }
  clearFiles() {
    this.cancelAll();
  }
  clearUIDropTarget() {
    this.#uppy.iteratePlugins(
      (plugin) => plugin.id === "DropTarget" && this.#uppy.removePlugin(plugin)
    );
  }
  getConfig() {
    return this.#config;
  }
  async getFilePluginId(file, serviceId) {
    const service = this.#services.get(serviceId);
    if (!service) {
      throw new Error(`Service ${serviceId} not registered`);
    }
    if (this.#uploadLimit === null) {
      await this.#fetchUploadLimit();
      if (this.#uploadLimit === null) {
        return `${serviceId}${SMALL_PLUGIN_SUFFIX}`;
      }
    }
    return file.size >= this.#uploadLimit ? `${serviceId}${LARGE_PLUGIN_SUFFIX}` : `${serviceId}${SMALL_PLUGIN_SUFFIX}`;
  }
  getFiles() {
    const files = this.#uppy.getFiles();
    return files.filter((file) => !this.#isFolderFile(file));
  }
  getServices() {
    return Array.from(this.#services.values());
  }
  getStorageInfo() {
    return this.#storageInfo;
  }
  getUploadedFiles() {
    const files = this.getFiles();
    const uploadedFiles = files.filter((file) => file.progress.uploadComplete);
    return uploadedFiles.map((file) => this.#enhanceFileData(file));
  }
  getUploadErrors() {
    return this.#uploadErrors;
  }
  getUploadProgress() {
    const files = this.#uppy.getFiles();
    let totalBytes = 0;
    let uploadedBytes = 0;
    files.forEach((file) => {
      const meta = file.meta;
      if (meta?.isVirtualBundle && meta?.displayAsFolder) {
        if (file.size) {
          totalBytes += file.size;
        }
        if (file.progress.bytesUploaded) {
          uploadedBytes += file.progress.bytesUploaded;
        }
      } else {
        if (file.progress.bytesTotal) {
          totalBytes += file.progress.bytesTotal;
        }
        if (file.progress.bytesUploaded) {
          uploadedBytes += file.progress.bytesUploaded;
        }
      }
    });
    if (totalBytes > 0) {
      return Math.round(uploadedBytes / totalBytes * 100);
    }
    return this.#uppy.getState().totalProgress;
  }
  getUploadStatus() {
    const { totalProgress } = this.#uppy.getState();
    const hasErrors = this.#uppy.getFiles().some((file) => file.error);
    if (hasErrors) {
      return UploadStatus.ERROR;
    }
    if (totalProgress === 0) {
      return UploadStatus.PENDING;
    }
    if (totalProgress === 100) {
      return UploadStatus.COMPLETED;
    }
    return UploadStatus.UPLOADING;
  }
  getUppy() {
    return this.#uppy;
  }
  async init() {
    if (!this.#sdk) {
      this.#uploadLimit = null;
      return;
    }
    await this.#fetchStorageInfo();
    await this.#fetchUploadLimit();
  }
  iteratePlugins(method) {
    this.#uppy.iteratePlugins(method);
  }
  off(event, callback) {
    this.#uppy.off(event, callback);
  }
  // Expose Uppy's event system directly
  on(event, callback) {
    this.#uppy.on(event, callback);
    return () => {
      this.off(event, callback);
    };
  }
  patchFilesState(filesWithNewState) {
    this.#uppy.patchFilesState(filesWithNewState);
  }
  registerAdditionalPlugin(plugin) {
    this.#additionalPlugins.push(plugin);
    this.#uppy.use(plugin.module, {
      ...plugin.options,
      id: plugin.name
    });
  }
  registerService(config) {
    validateServiceConfig(config);
    this.#services.set(config.id, config);
    if (config.smallFilePlugin) {
      this.#uppy.use(config.smallFilePlugin.module, {
        id: `${config.id}${SMALL_PLUGIN_SUFFIX}`,
        ...config.smallFilePlugin.options
      });
    }
    if (config.largeFilePlugin) {
      this.#uppy.use(config.largeFilePlugin.module, {
        id: `${config.id}${LARGE_PLUGIN_SUFFIX}`,
        ...config.largeFilePlugin.options
      });
    }
  }
  removeAdditionalPlugin(plugin) {
    const index = this.#additionalPlugins.findIndex(
      (p) => typeof plugin === "string" ? p.name === plugin : p === plugin
    );
    if (index === -1) {
      return false;
    }
    const pluginToRemove = this.#additionalPlugins[index];
    this.#additionalPlugins.splice(index, 1);
    let removedFromUppy = false;
    this.#uppy.iteratePlugins((uppyPlugin) => {
      if (uppyPlugin.id === pluginToRemove.name) {
        this.#uppy.removePlugin(uppyPlugin);
        removedFromUppy = true;
      }
    });
    return removedFromUppy;
  }
  removeCompletedUploads() {
    this.#uppy.getFiles().forEach((file) => {
      if (file.progress.uploadComplete) {
        this.#uppy.removeFile(file.id);
      }
    });
  }
  removeEvent(event, callback) {
    return this.#uppy.off(event, callback);
  }
  removeFile(id) {
    this.#uppy.removeFile(id);
  }
  removePlugin(plugin) {
    this.#uppy.removePlugin(plugin);
  }
  reset() {
    this.#uppy.cancelAll();
    this.#services = /* @__PURE__ */ new Map();
    this.#additionalPlugins = [];
    this.#uppy.iteratePlugins((plugin) => {
      this.#uppy.removePlugin(plugin);
    });
    this.#uploadErrors = [];
  }
  retryFile(file) {
    this.#uppy.retryUpload(file.id);
    this.#uploadErrors = [];
  }
  setUIDropTarget(target, serviceId) {
    this.clearUIDropTarget();
    this.#dropTargetServiceId = serviceId;
    const dropTargetOptions = {
      target
    };
    this.#uppy.use(DropTarget, dropTargetOptions);
  }
  start() {
    this.#uploadErrors = [];
    return this.#uppy.upload();
  }
  usePlugin(plugin, opts) {
    this.#uppy.use(plugin, opts);
  }
  // Helper function to enhance file data with bundle information and CID
  #enhanceFileData(file) {
    const meta = file.meta;
    const isBundle = meta?.isVirtualBundle && meta?.displayAsFolder;
    const newMeta = {
      ...meta,
      bundleId: isBundle ? file.id : void 0,
      isBundle
    };
    const cidProps = ["CID", "cid"];
    let cid;
    for (const prop of cidProps) {
      cid = file.response?.body?.[prop] || file.response?.[prop];
      if (cid) {
        newMeta.cid = cid;
        break;
      }
    }
    if (!cid) {
      cid = file.meta?.cid;
      if (cid) {
        newMeta.cid = cid;
      }
    }
    return {
      ...file,
      id: file.response?.body?.id || file.id,
      meta: newMeta,
      name: file.name,
      size: file.size,
      type: isBundle ? "folder" : file.type
    };
  }
  async #fetchStorageInfo() {
    if (!this.#sdk) {
      return;
    }
    try {
      if (typeof this.#sdk.account === "function") {
        const accountInfo = await this.#sdk.account().info();
        const storage = accountInfo.storage;
        if (storage) {
          this.#storageInfo = {
            available: storage.available,
            total: storage.total,
            used: storage.used,
            usedPercentage: storage.usedPercentage
          };
        }
      }
    } catch (error) {
      console.error("Failed to fetch storage info:", error);
    }
  }
  async #fetchUploadLimit() {
    try {
      const uploadLimitResponse = await this.#sdk.account().uploadLimit();
      this.#uploadLimit = uploadLimitResponse.data.limit;
    } catch (error) {
      console.warn(
        "Failed to fetch upload limit, defaulting to small file handling:",
        error
      );
      this.#uploadLimit = null;
    }
  }
  async #handleFolderFile(file, serviceId) {
    const relativePath = file.webkitRelativePath;
    const pathParts = relativePath.split("/");
    const folderName = pathParts[0];
    await this.#folderMutex.runExclusive(async () => {
      const existingFolderBundle = this.#uppy.getFiles().find(
        (f) => f.meta?.isVirtualBundle && f.meta?.bundleName === folderName
      );
      if (!existingFolderBundle) {
        let pluginId;
        if (serviceId) {
          pluginId = await this.getFilePluginId(file, serviceId);
        }
        const bundleMeta = {
          bundleName: folderName,
          displayAsFolder: true,
          isVirtualBundle: true,
          originalFiles: [file]
        };
        this.#uppy.addFile({
          data: new File([], folderName, { type: "" }),
          meta: bundleMeta,
          name: folderName,
          plugins: pluginId ? [pluginId] : void 0,
          size: file.size,
          // Use the built-in size field
          type: "application/x-folder-bundle"
        });
      } else {
        const updatedOriginalFiles = [
          ...existingFolderBundle.meta.originalFiles || [],
          file
        ];
        const currentTotalSize = existingFolderBundle.size || 0;
        this.#uppy.setFileState(existingFolderBundle.id, {
          meta: {
            ...existingFolderBundle.meta,
            originalFiles: updatedOriginalFiles
          },
          size: currentTotalSize + file.size
        });
      }
    });
  }
  #isFolder(file) {
    const webkitRelativePath = file.webkitRelativePath;
    return webkitRelativePath?.endsWith("/") || file.type === "" && file.size === 0;
  }
  #isFolderFile(file) {
    return isDirectoryFile(file) && !isFolderBundle(file);
  }
  #isVirtualBundle(file) {
    return isFolderBundle(file);
  }
  #setupEventHooks() {
    this.addEvent("file-added", (file) => {
      if (!file?.plugins?.length && this.#dropTargetServiceId) {
        this.patchFilesState({
          [file.id]: {
            plugins: [this.#dropTargetServiceId]
          }
        });
      }
    });
    this.addEvent("complete", (result) => {
      result.successful.forEach((file) => {
        const cid = file.response?.body?.cid;
        if (cid) {
          this.patchFilesState({
            [file.id]: {
              meta: {
                ...file.meta,
                cid
              }
            }
          });
        }
      });
    });
    this.addEvent("error", (error) => {
      this.#uploadErrors.push(error);
    });
    this.addEvent("upload-error", (file, error) => {
      this.#uploadErrors.push(error);
      const meta = file.meta;
      if (meta?.isVirtualBundle && meta?.displayAsFolder) {
        const bundleError = new Error(
          `Failed to upload folder "${meta.bundleName}": ${error.message || "Unknown error occurred"}`
        );
        this.#uploadErrors.push(bundleError);
      }
    });
    this.addEvent("modify-upload-error", function(file, error) {
      if (error.request) {
        const xhr = error.request;
        if (xhr.status === 507) {
          error.details = "Upload quota exceeded";
        } else if (xhr.responseText.toLowerCase().includes("is not verified")) {
          error.details = "Please verify your email to upload files";
        }
      }
    });
  }
}

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
        const serviceConfig = {
          id: protocol.id,
          largeFilePlugin: createLargeFilePlugin(
            uploadCapability.getLargeFileUploadConfig(),
            protocol.id,
            uploadCapability.getLargeFilePlugin?.()
          ),
          name: protocol.getName(),
          smallFilePlugin: createSmallFilePlugin(
            uploadCapability.getSmallFileUploadConfig(),
            protocol.id,
            uploadCapability.getSmallFilePlugin?.()
          )
        };
        this.#uploadManager.registerService(serviceConfig);
        const additionalPlugins = uploadCapability.getAdditionalPlugins();
        for (const plugin of additionalPlugins) {
          this.#uploadManager.registerAdditionalPlugin(plugin);
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
    type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogType.FORM
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
  id = "dashboard:refine-config";
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
