import { core_lbry__mf_v__runtimeInit__mf_v__ } from './core_lbry__mf_v__runtimeInit__mf_v__-fO1FuTHm.js';

// dev uses dynamic import to separate chunks
    
    const {initPromise} = core_lbry__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(runtime => runtime.loadShare("@lumeweb/portal-framework-core", {
      customShareInfo: {shareConfig:{
        singleton: true,
        strictVersion: false,
        requiredVersion: "^0.1.0"
      }}
    }));
    const exportModule = await res.then(factory => factory());
    var core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__ = exportModule;

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

const SUBDOMAIN = "lbry";
const DATA_PROVIDER_NAME = "lbry";
class RefineConfig {
  id = "lbry:refine-config";
  status = "inactive";
  type = "core:refine-config";
  #apiUrl;
  async destroy() {
  }
  getConfig(existing) {
    const lbryProvider = src_default(this.#apiUrl, true);
    core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.syncAuthProviderWithDataProvider(lbryProvider, existing?.authProvider);
    const providers = { [DATA_PROVIDER_NAME]: lbryProvider };
    const resources = [
      {
        meta: {
          dataProviderName: DATA_PROVIDER_NAME,
          template: "/devices"
        },
        name: "lbry/devices"
      },
      {
        meta: {
          dataProviderName: DATA_PROVIDER_NAME,
          template: "/streams"
        },
        name: "lbry/streams"
      }
    ];
    return core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.mergeRefineConfig(existing, providers, resources);
  }
  async initialize(framework) {
    const apiUrl = core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.getApiBaseUrl({
      currentUrl: framework.portalUrl,
      preserveSubdomain: !core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.env.VITE_PORTAL_DOMAIN_IS_ROOT
    });
    if (!apiUrl) {
      throw new Error("Failed to get API base URL");
    }
    try {
      const apiDomain = new URL(apiUrl);
      const hostWithPort = apiDomain.port ? `${apiDomain.hostname}:${apiDomain.port}` : apiDomain.hostname;
      this.#apiUrl = `${apiDomain.protocol}//${SUBDOMAIN}.${hostWithPort}/api`;
    } catch (error) {
      throw new Error(`Failed to construct API URL: ${error.message}`);
    }
  }
}

export { DATA_PROVIDER_NAME, RefineConfig, core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__ };
