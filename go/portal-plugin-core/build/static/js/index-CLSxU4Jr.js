import { core_core__mf_v__runtimeInit__mf_v__, index_cjs } from './core_core__mf_v__runtimeInit__mf_v__-DD48BdU6.js';
import { core_core__loadShare__react__loadShare__ } from './core_core__loadShare__react__loadShare__-BicCgRcP.js';

// dev uses dynamic import to separate chunks
    
    const {loadShare: loadShare$1} = index_cjs;
    const {initPromise: initPromise$1} = core_core__mf_v__runtimeInit__mf_v__;
    const res$1 = initPromise$1.then(_ => loadShare$1("@lumeweb/portal-framework-core", {
    customShareInfo: {shareConfig:{
      singleton: true,
      strictVersion: false,
      requiredVersion: "^0.0.0"
    }}}));
    const exportModule$1 = await res$1.then(factory => factory());
    var core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__ = exportModule$1;

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

// dev uses dynamic import to separate chunks
    
    const {loadShare} = index_cjs;
    const {initPromise} = core_core__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(_ => loadShare("@lumeweb/portal-framework-ui-core", {
    customShareInfo: {shareConfig:{
      singleton: true,
      strictVersion: false,
      requiredVersion: "^0.0.0"
    }}}));
    const exportModule = await res.then(factory => factory());
    var core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ = exportModule;

const notificationProvider = () => {
  return {
    open: ({
      key,
      message,
      description,
      undoableTimeout,
      cancelMutation,
      action,
      type
    }) => {
      const variant = type === "error" ? "destructive" : "default";
      core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.toast({
        variant,
        key,
        title: message,
        description,
        duration: undoableTimeout,
        action,
        cancelMutation
      });
    },
    close: () => {
    }
  };
};

class Capability {
  dependencies;
  id;
  status;
  type = "core:refine-config";
  version = "0.1.0";
  #apiUrl;
  async destroy() {
  }
  getConfig(existing) {
    if (!this.#apiUrl) {
      throw new Error("RefineConfigCapability must be initialized before use");
    }
    existing = {
      options: {},
      resources: [],
      ...existing
    };
    return {
      dataProvider: {
        ...existing?.dataProvider,
        default: src_default(this.#apiUrl)
      },
      notificationProvider: notificationProvider()
    };
  }
  async initialize(framework) {
    const apiUrl = core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.getApiBaseUrl({
      currentUrl: framework.portalUrl,
      preserveSubdomain: !core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.env.VITE_PORTAL_DOMAIN_IS_ROOT
    });
    if (!apiUrl) {
      throw new Error("Failed to get API base URL");
    }
    this.#apiUrl = apiUrl;
  }
}

const CHECK_TYPES = {
  DEFINED: Symbol("defined"),
  UNDEFINED_CHECK: Symbol("undefinedCheck")
};
function generateIdFromRoute(route, pluginId) {
  if (route.id && core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.isNamespacedId(route.id)) {
    return route.id;
  }
  const path = route.path || (route.index ? "index" : null);
  if (path) {
    const sanitizedPath = path.replace(/^\/|\/$/g, "").replace(/[^a-zA-Z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (pluginId) {
      return core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.createNamespacedId(
        core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.parseNamespacedId(pluginId).namespace,
        sanitizedPath
      );
    }
    return core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.createNamespacedId("generated", sanitizedPath);
  }
  if (route.component) {
    let componentName = route.component;
    if (core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.isNamespacedId(route.component)) {
      componentName = core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.parseNamespacedId(route.component).name;
    }
    if (pluginId) {
      return core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.createNamespacedId(
        core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.parseNamespacedId(pluginId).namespace,
        componentName
      );
    }
    return core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.createNamespacedId("generated", componentName);
  }
  if (route.navigation?.label) {
    const label = route.navigation.label.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase();
    if (pluginId) {
      return core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.createNamespacedId(
        core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.parseNamespacedId(pluginId).namespace,
        label
      );
    }
    return core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.createNamespacedId("generated", label);
  }
  if (route.parentId) {
    return core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.createNamespacedId(
      core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.parseNamespacedId(route.parentId).namespace,
      "child"
    );
  }
  const routeString = JSON.stringify(route);
  let hash = 0;
  for (let i = 0; i < routeString.length; i++) {
    hash = (hash << 5) - hash + routeString.charCodeAt(i);
    hash |= 0;
  }
  return core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.createNamespacedId(
    "generated",
    `route-${Math.abs(hash).toString(36)}`
  );
}
class Navigation {
  id = core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.createNamespacedId("core", "navigation");
  version = "0.1.0";
  #framework;
  async destroy() {
    this.#framework = void 0;
  }
  getNavigation() {
    if (!this.#framework) {
      throw new Error("Navigation feature not initialized");
    }
    return this.buildNavigation(Array.from(this.#framework.getPlugins()));
  }
  createNavigationItem(route, pluginId) {
    if (!route.navigation) return null;
    const id = generateIdFromRoute(route, pluginId);
    const item = {
      id,
      label: route.navigation.label,
      path: route.path ?? "",
      index: route.index ?? false
    };
    const propMap = {
      badge: CHECK_TYPES.DEFINED,
      disabled: CHECK_TYPES.UNDEFINED_CHECK,
      hidden: CHECK_TYPES.UNDEFINED_CHECK,
      icon: CHECK_TYPES.DEFINED,
      order: CHECK_TYPES.UNDEFINED_CHECK,
      linkable: CHECK_TYPES.UNDEFINED_CHECK,
      show: CHECK_TYPES.DEFINED
    };
    Object.entries(propMap).forEach(([prop, checkType]) => {
      const value = route.navigation[prop];
      if (checkType === CHECK_TYPES.UNDEFINED_CHECK && value !== void 0) {
        item[prop] = value;
      } else if (checkType === CHECK_TYPES.DEFINED && value !== void 0) {
        item[prop] = value;
      }
    });
    return item;
  }
  shouldIncludeRouteInNavigation(route) {
    return !!route.navigation && (!route.index || route.navigation.forceShowInNavigation);
  }
  processRouteForNavigation(route, pluginId) {
    const item = this.createNavigationItem(route, pluginId);
    if (!item) {
      return [];
    }
    const childItems = route.children?.filter((child) => this.shouldIncludeRouteInNavigation(child)).map((child) => {
      const childItem = this.createNavigationItem(child, pluginId);
      if (childItem) {
        childItem.parentId = item.id;
      }
      return childItem;
    }).filter((item2) => item2 !== null) ?? [];
    return [item, ...childItems];
  }
  buildNavigation(plugins) {
    return plugins.flatMap(
      (plugin) => plugin.routes?.filter((route) => this.shouldIncludeRouteInNavigation(route)).flatMap(
        (route) => this.processRouteForNavigation(route, plugin.id)
      ) ?? []
    ).sort((a, b) => {
      if (a.order === void 0 && b.order !== void 0) return 1;
      if (a.order !== void 0 && b.order === void 0) return -1;
      const orderCompare = (a.order ?? 0) - (b.order ?? 0);
      if (orderCompare !== 0) return orderCompare;
      return 0;
    });
  }
  async getRoutes() {
    if (!this.#framework) {
      throw new Error("Navigation feature not initialized");
    }
    return this.buildRoutes(Array.from(this.#framework?.getPlugins()));
  }
  async buildRoutes(plugins) {
    const processRoute = async (route, plugin) => {
      const routeId = route.id ? core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.normalizeId(plugin.id, route.id) : core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.createNamespacedId(
        plugin.id,
        route.path || (route.index ? "index" : "unnamed-route")
      );
      const normalizedComponent = route.component ? core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.normalizeId(plugin.id, route.component) : void 0;
      const componentData = {
        component: normalizedComponent,
        id: routeId,
        pluginId: plugin.id
      };
      const processedChildren = route.children ? await Promise.all(
        route.children.map((child) => processRoute(child, plugin))
      ) : void 0;
      return {
        ...route,
        ...componentData,
        caseSensitive: route.caseSensitive ?? false,
        children: processedChildren,
        component: normalizedComponent,
        id: routeId,
        index: route.index ?? false,
        pluginId: plugin.id
      };
    };
    const routePromises = plugins.flatMap(
      (plugin) => plugin.routes?.map((route) => processRoute(route, plugin)) ?? []
    );
    const routes = await Promise.all(routePromises);
    const notFoundRoute = {
      component: core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.normalizeId(core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.createNamespacedId("core", "core"), "NotFound"),
      id: core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.createNamespacedId("core", "not-found"),
      index: false,
      path: "*",
      pluginId: core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.createNamespacedId("core", "core")
    };
    routes.push({
      ...notFoundRoute
      //   ...notFoundComponentData,
    });
    return this.buildRouteTree(routes);
  }
  async initialize(framework) {
    this.#framework = framework;
  }
  buildRouteTree(routes) {
    const validRoutes = routes.filter((route) => this.validateRoute(route));
    return validRoutes.sort((a, b) => {
      if (a.path === "/" && b.path !== "/") return -1;
      if (b.path === "/" && a.path !== "/") return 1;
      const aSegments = a.path.split("/").filter(Boolean);
      const bSegments = b.path.split("/").filter(Boolean);
      return bSegments.length - aSegments.length;
    });
  }
  async loadRouteComponent(route) {
    if (!this.#framework) {
      throw new Error("Navigation feature not initialized");
    }
    if (route.component) {
      try {
        const normalizedComponent = core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.isNamespacedId(route.component) ? route.component : core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.normalizeId(route.pluginId, route.component);
        const componentPath = core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.parseNamespacedId(normalizedComponent).name;
        const Component = await core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.createRemoteComponentLoader(
          {
            componentPath,
            pluginId: route.pluginId
          },
          this.#framework,
          core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.defaultRemoteOptions
        );
        return {
          element: core_core__loadShare__react__loadShare__.createElement(Component),
          index: route.index ?? false
        };
      } catch (error) {
        console.error(
          `Failed to load component for route ${route.path}:`,
          error
        );
        return {
          element: core_core__loadShare__react__loadShare__.createElement(core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.RouteErrorBoundary)
        };
      }
    }
    return {};
  }
  routeExists(path) {
    return Array.from(this.#framework.getPlugins()).some(
      (plugin) => plugin.routes?.some((route) => route.path === path)
    );
  }
  validateRoute(route) {
    if (!route.path) {
      console.warn(`Route from plugin is missing a path`);
      return false;
    }
    if (!route.component && !route.element) {
      console.warn(`Route from plugin has no component or element`);
      return false;
    }
    if (!route.id) {
      console.warn(`Route from plugin is missing an id`);
      return false;
    }
    return true;
  }
}
function createNavigationFeature() {
  return new Navigation();
}

function index() {
  return {
    capabilities: [new Capability()],
    async destroy(_framework) {
      console.log("Plugin Core destroyed");
    },
    features: [createNavigationFeature()],
    id: core_core__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.createNamespacedId("core", "core"),
    async initialize(_framework) {
      console.log("Plugin Core initialized");
    }
  };
}

export { index as default };
