import { UPLOAD_TYPE_AVATAR, UPLOAD_TYPE_MAIN, UploadStatus, isDirectoryFile, isFolderBundle } from './upload-Cr_MDl4Y.js';
import { getDefaultExportFromCjs, commonjsGlobal } from './jsx-runtime-D_0QkpWj.js';

function hasProperty(object, key) {
    return Object.hasOwn(object, key);
}

class NetworkError extends Error {
    cause;
    isNetworkError;
    request;
    constructor(error, xhr = null) {
        super(`This looks like a network error, the endpoint might be blocked by an internet provider or a firewall.`);
        this.cause = error;
        this.isNetworkError = true;
        this.request = xhr;
    }
}

/**
 * Helper to abort upload requests if there has not been any progress for `timeout` ms.
 * Create an instance using `timer = new ProgressTimeout(10000, onTimeout)`
 * Call `timer.progress()` to signal that there has been progress of any kind.
 * Call `timer.done()` when the upload has completed.
 */
class ProgressTimeout {
    #aliveTimer;
    #isDone = false;
    #onTimedOut;
    #timeout;
    constructor(timeout, timeoutHandler) {
        this.#timeout = timeout;
        this.#onTimedOut = () => timeoutHandler(timeout);
    }
    progress() {
        // Some browsers fire another progress event when the upload is
        // cancelled, so we have to ignore progress after the timer was
        // told to stop.
        if (this.#isDone)
            return;
        if (this.#timeout > 0) {
            clearTimeout(this.#aliveTimer);
            this.#aliveTimer = setTimeout(this.#onTimedOut, this.#timeout);
        }
    }
    done() {
        if (!this.#isDone) {
            clearTimeout(this.#aliveTimer);
            this.#aliveTimer = undefined;
            this.#isDone = true;
        }
    }
}

const noop = () => { };
/**
 * Fetches data from a specified URL using XMLHttpRequest, with optional retry functionality and progress tracking.
 *
 * @param url The URL to send the request to.
 * @param options Optional settings for the fetch operation.
 */
function fetcher(url, options = {}) {
    const { body = null, headers = {}, method = 'GET', onBeforeRequest = noop, onUploadProgress = noop, shouldRetry = () => true, onAfterResponse = noop, onTimeout = noop, responseType, retries = 3, signal = null, timeout = 30_000, withCredentials = false, } = options;
    // 300 ms, 600 ms, 1200 ms, 2400 ms, 4800 ms
    const delay = (attempt) => 0.3 * 2 ** (attempt - 1) * 1000;
    const timer = new ProgressTimeout(timeout, onTimeout);
    function requestWithRetry(retryCount = 0) {
        // biome-ignore lint/suspicious/noAsyncPromiseExecutor: it's fine
        return new Promise(async (resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const onError = (error) => {
                if (shouldRetry(xhr) && retryCount < retries) {
                    setTimeout(() => {
                        requestWithRetry(retryCount + 1).then(resolve, reject);
                    }, delay(retryCount));
                }
                else {
                    timer.done();
                    reject(error);
                }
            };
            xhr.open(method, url, true);
            xhr.withCredentials = withCredentials;
            if (responseType) {
                xhr.responseType = responseType;
            }
            signal?.addEventListener('abort', () => {
                xhr.abort();
                // Using DOMException for abort errors aligns with
                // the convention established by the Fetch API.
                reject(new DOMException('Aborted', 'AbortError'));
            });
            xhr.onload = async () => {
                try {
                    await onAfterResponse(xhr, retryCount);
                }
                catch (err) {
                    // This is important as we need to emit the xhr
                    // over the upload-error event.
                    err.request = xhr;
                    onError(err);
                    return;
                }
                if (xhr.status >= 200 && xhr.status < 300) {
                    timer.done();
                    resolve(xhr);
                }
                else if (shouldRetry(xhr) && retryCount < retries) {
                    setTimeout(() => {
                        requestWithRetry(retryCount + 1).then(resolve, reject);
                    }, delay(retryCount));
                }
                else {
                    timer.done();
                    reject(new NetworkError(xhr.statusText, xhr));
                }
            };
            xhr.onerror = () => onError(new NetworkError(xhr.statusText, xhr));
            xhr.upload.onprogress = (event) => {
                timer.progress();
                onUploadProgress(event);
            };
            if (headers) {
                Object.keys(headers).forEach((key) => {
                    xhr.setRequestHeader(key, headers[key]);
                });
            }
            await onBeforeRequest(xhr, retryCount);
            xhr.send(body);
        });
    }
    return requestWithRetry();
}

function filterNonFailedFiles(files) {
    const hasError = (file) => 'error' in file && !!file.error;
    return files.filter((file) => !hasError(file));
}
// Don't double-emit upload-started for Golden Retriever-restored files that were already started
function filterFilesToEmitUploadStarted(files) {
    return files.filter((file) => !file.progress?.uploadStarted || !file.isRestored);
}

/**
 * Takes a full filename string and returns an object {name, extension}
 */
function getFileNameAndExtension(fullFileName) {
    const lastDot = fullFileName.lastIndexOf('.');
    // these count as no extension: "no-dot", "trailing-dot."
    if (lastDot === -1 || lastDot === fullFileName.length - 1) {
        return {
            name: fullFileName,
            extension: undefined,
        };
    }
    return {
        name: fullFileName.slice(0, lastDot),
        extension: fullFileName.slice(lastDot + 1),
    };
}

// ___Why not add the mime-types package?
//    It's 19.7kB gzipped, and we only need mime types for well-known extensions (for file previews).
// ___Where to take new extensions from?
//    https://github.com/jshttp/mime-db/blob/master/db.json
const mimeTypes = {
    __proto__: null,
    md: 'text/markdown',
    markdown: 'text/markdown',
    mp4: 'video/mp4',
    mp3: 'audio/mp3',
    svg: 'image/svg+xml',
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    heic: 'image/heic',
    heif: 'image/heif',
    yaml: 'text/yaml',
    yml: 'text/yaml',
    csv: 'text/csv',
    tsv: 'text/tab-separated-values',
    tab: 'text/tab-separated-values',
    avi: 'video/x-msvideo',
    mks: 'video/x-matroska',
    mkv: 'video/x-matroska',
    mov: 'video/quicktime',
    dicom: 'application/dicom',
    doc: 'application/msword',
    msg: 'application/vnd.ms-outlook',
    docm: 'application/vnd.ms-word.document.macroenabled.12',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    dot: 'application/msword',
    dotm: 'application/vnd.ms-word.template.macroenabled.12',
    dotx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
    xla: 'application/vnd.ms-excel',
    xlam: 'application/vnd.ms-excel.addin.macroenabled.12',
    xlc: 'application/vnd.ms-excel',
    xlf: 'application/x-xliff+xml',
    xlm: 'application/vnd.ms-excel',
    xls: 'application/vnd.ms-excel',
    xlsb: 'application/vnd.ms-excel.sheet.binary.macroenabled.12',
    xlsm: 'application/vnd.ms-excel.sheet.macroenabled.12',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xlt: 'application/vnd.ms-excel',
    xltm: 'application/vnd.ms-excel.template.macroenabled.12',
    xltx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
    xlw: 'application/vnd.ms-excel',
    txt: 'text/plain',
    text: 'text/plain',
    conf: 'text/plain',
    log: 'text/plain',
    pdf: 'application/pdf',
    zip: 'application/zip',
    '7z': 'application/x-7z-compressed',
    rar: 'application/x-rar-compressed',
    tar: 'application/x-tar',
    gz: 'application/gzip',
    dmg: 'application/x-apple-diskimage',
};

function getFileType(file) {
    if (file.type)
        return file.type;
    const fileExtension = file.name
        ? getFileNameAndExtension(file.name).extension?.toLowerCase()
        : null;
    if (fileExtension && fileExtension in mimeTypes) {
        // else, see if we can map extension to a mime type
        return mimeTypes[fileExtension];
    }
    // if all fails, fall back to a generic byte stream type
    return 'application/octet-stream';
}

function encodeCharacter(character) {
    return character.charCodeAt(0).toString(32);
}
function encodeFilename(name) {
    let suffix = '';
    return (name.replace(/[^A-Z0-9]/gi, (character) => {
        suffix += `-${encodeCharacter(character)}`;
        return '/';
    }) + suffix);
}
/**
 * Takes a file object and turns it into fileID, by converting file.name to lowercase,
 * removing extra characters and adding type, size and lastModified
 */
function generateFileID(file, instanceId) {
    // It's tempting to do `[items].filter(Boolean).join('-')` here, but that
    // is slower! simple string concatenation is fast
    let id = instanceId || 'uppy';
    if (typeof file.name === 'string') {
        id += `-${encodeFilename(file.name.toLowerCase())}`;
    }
    if (file.type !== undefined) {
        id += `-${file.type}`;
    }
    if (file.meta && typeof file.meta.relativePath === 'string') {
        id += `-${encodeFilename(file.meta.relativePath.toLowerCase())}`;
    }
    if (file.data.size !== undefined) {
        id += `-${file.data.size}`;
    }
    if (file.data.lastModified !== undefined) {
        id += `-${file.data.lastModified}`;
    }
    return id;
}
// If the provider has a stable, unique ID, then we can use that to identify the file.
// Then we don't have to generate our own ID, and we can add the same file many times if needed (different path)
function hasFileStableId(file) {
    if (!file.isRemote || !file.remote)
        return false;
    // These are the providers that it seems like have stable IDs for their files. The other's I haven't checked yet.
    const stableIdProviders = new Set([
        'box',
        'dropbox',
        'drive',
        'facebook',
        'unsplash',
    ]);
    return stableIdProviders.has(file.remote.provider);
}
function getSafeFileId(file, instanceId) {
    if (hasFileStableId(file))
        return file.id;
    const fileType = getFileType(file);
    return generateFileID({
        ...file,
        type: fileType,
    }, instanceId);
}

function getAllowedMetaFields(fields, meta) {
    if (fields === true) {
        return Object.keys(meta);
    }
    if (Array.isArray(fields)) {
        return fields;
    }
    return [];
}

/**
 * Adds zero to strings shorter than two characters.
 */
function pad(number) {
    return number < 10 ? `0${number}` : number.toString();
}
/**
 * Returns a timestamp in the format of `hours:minutes:seconds`
 */
function getTimeStamp() {
    const date = new Date();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${hours}:${minutes}:${seconds}`;
}

function isNetworkError(xhr) {
    if (!xhr) {
        return false;
    }
    return (xhr.readyState !== 0 && xhr.readyState !== 4) || xhr.status === 0;
}

function createCancelError(cause) {
    return new Error('Cancelled', { cause });
}
function abortOn(signal) {
    if (signal != null) {
        const abortPromise = () => this.abort(signal.reason);
        signal.addEventListener('abort', abortPromise, { once: true });
        const removeAbortListener = () => {
            signal.removeEventListener('abort', abortPromise);
        };
        this.then?.(removeAbortListener, removeAbortListener);
    }
    return this;
}
class RateLimitedQueue {
    #activeRequests = 0;
    #queuedHandlers = [];
    #paused = false;
    #pauseTimer;
    #downLimit = 1;
    #upperLimit;
    #rateLimitingTimer;
    limit;
    constructor(limit) {
        if (typeof limit !== 'number' || limit === 0) {
            this.limit = Infinity;
        }
        else {
            this.limit = limit;
        }
    }
    #call(fn) {
        this.#activeRequests += 1;
        let done = false;
        let cancelActive;
        try {
            cancelActive = fn();
        }
        catch (err) {
            this.#activeRequests -= 1;
            throw err;
        }
        return {
            abort: (cause) => {
                if (done)
                    return;
                done = true;
                this.#activeRequests -= 1;
                cancelActive?.(cause);
                this.#queueNext();
            },
            done: () => {
                if (done)
                    return;
                done = true;
                this.#activeRequests -= 1;
                this.#queueNext();
            },
        };
    }
    #queueNext() {
        // Do it soon but not immediately, this allows clearing out the entire queue synchronously
        // one by one without continuously _advancing_ it (and starting new tasks before immediately
        // aborting them)
        queueMicrotask(() => this.#next());
    }
    #next() {
        if (this.#paused || this.#activeRequests >= this.limit) {
            return;
        }
        if (this.#queuedHandlers.length === 0) {
            return;
        }
        // Dispatch the next request, and update the abort/done handlers
        // so that cancelling it does the Right Thing (and doesn't just try
        // to dequeue an already-running request).
        const next = this.#queuedHandlers.shift();
        if (next == null) {
            throw new Error('Invariant violation: next is null');
        }
        const handler = this.#call(next.fn);
        next.abort = handler.abort;
        next.done = handler.done;
    }
    #queue(fn, options) {
        const handler = {
            fn,
            priority: options?.priority || 0,
            abort: () => {
                this.#dequeue(handler);
            },
            done: () => {
                throw new Error('Cannot mark a queued request as done: this indicates a bug');
            },
        };
        const index = this.#queuedHandlers.findIndex((other) => {
            return handler.priority > other.priority;
        });
        if (index === -1) {
            this.#queuedHandlers.push(handler);
        }
        else {
            this.#queuedHandlers.splice(index, 0, handler);
        }
        return handler;
    }
    #dequeue(handler) {
        const index = this.#queuedHandlers.indexOf(handler);
        if (index !== -1) {
            this.#queuedHandlers.splice(index, 1);
        }
    }
    run(fn, queueOptions) {
        if (!this.#paused && this.#activeRequests < this.limit) {
            return this.#call(fn);
        }
        return this.#queue(fn, queueOptions);
    }
    wrapSyncFunction(fn, queueOptions) {
        return (...args) => {
            const queuedRequest = this.run(() => {
                fn(...args);
                queueMicrotask(() => queuedRequest.done());
                return () => { };
            }, queueOptions);
            return {
                abortOn,
                abort() {
                    queuedRequest.abort();
                },
            };
        };
    }
    wrapPromiseFunction(fn, queueOptions) {
        return (...args) => {
            let queuedRequest;
            const outerPromise = new Promise((resolve, reject) => {
                queuedRequest = this.run(() => {
                    let cancelError;
                    let innerPromise;
                    try {
                        innerPromise = Promise.resolve(fn(...args));
                    }
                    catch (err) {
                        innerPromise = Promise.reject(err);
                    }
                    innerPromise.then((result) => {
                        if (cancelError) {
                            reject(cancelError);
                        }
                        else {
                            queuedRequest.done();
                            resolve(result);
                        }
                    }, (err) => {
                        if (cancelError) {
                            reject(cancelError);
                        }
                        else {
                            queuedRequest.done();
                            reject(err);
                        }
                    });
                    return (cause) => {
                        cancelError = createCancelError(cause);
                    };
                }, queueOptions);
            });
            outerPromise.abort = (cause) => {
                queuedRequest.abort(cause);
            };
            outerPromise.abortOn = abortOn;
            return outerPromise;
        };
    }
    resume() {
        this.#paused = false;
        clearTimeout(this.#pauseTimer);
        for (let i = 0; i < this.limit; i++) {
            this.#queueNext();
        }
    }
    #resume = () => this.resume();
    /**
     * Freezes the queue for a while or indefinitely.
     *
     * @param {number | null } [duration] Duration for the pause to happen, in milliseconds.
     *                                    If omitted, the queue won't resume automatically.
     */
    pause(duration = null) {
        this.#paused = true;
        clearTimeout(this.#pauseTimer);
        if (duration != null) {
            this.#pauseTimer = setTimeout(this.#resume, duration);
        }
    }
    /**
     * Pauses the queue for a duration, and lower the limit of concurrent requests
     * when the queue resumes. When the queue resumes, it tries to progressively
     * increase the limit in `this.#increaseLimit` until another call is made to
     * `this.rateLimit`.
     * Call this function when using the RateLimitedQueue for network requests and
     * the remote server responds with 429 HTTP code.
     *
     * @param {number} duration in milliseconds.
     */
    rateLimit(duration) {
        clearTimeout(this.#rateLimitingTimer);
        this.pause(duration);
        if (this.limit > 1 && Number.isFinite(this.limit)) {
            this.#upperLimit = this.limit - 1;
            this.limit = this.#downLimit;
            this.#rateLimitingTimer = setTimeout(this.#increaseLimit, duration);
        }
    }
    #increaseLimit = () => {
        if (this.#paused) {
            this.#rateLimitingTimer = setTimeout(this.#increaseLimit, 0);
            return;
        }
        this.#downLimit = this.limit;
        this.limit = Math.ceil((this.#upperLimit + this.#downLimit) / 2);
        for (let i = this.#downLimit; i <= this.limit; i++) {
            this.#queueNext();
        }
        if (this.#upperLimit - this.#downLimit > 3) {
            this.#rateLimitingTimer = setTimeout(this.#increaseLimit, 2000);
        }
        else {
            this.#downLimit = Math.floor(this.#downLimit / 2);
        }
    };
    get isPaused() {
        return this.#paused;
    }
}
const internalRateLimitedQueue = Symbol('__queue');

function insertReplacement(source, rx, replacement) {
    const newParts = [];
    source.forEach((chunk) => {
        // When the source contains multiple placeholders for interpolation,
        // we should ignore chunks that are not strings, because those
        // can be JSX objects and will be otherwise incorrectly turned into strings.
        // Without this condition we’d get this: [object Object] hello [object Object] my <button>
        if (typeof chunk !== 'string') {
            return newParts.push(chunk);
        }
        return rx[Symbol.split](chunk).forEach((raw, i, list) => {
            if (raw !== '') {
                newParts.push(raw);
            }
            // Interlace with the `replacement` value
            if (i < list.length - 1) {
                newParts.push(replacement);
            }
        });
    });
    return newParts;
}
/**
 * Takes a string with placeholder variables like `%{smart_count} file selected`
 * and replaces it with values from options `{smart_count: 5}`
 *
 * @license https://github.com/airbnb/polyglot.js/blob/master/LICENSE
 * taken from https://github.com/airbnb/polyglot.js/blob/master/lib/polyglot.js#L299
 *
 * @param phrase that needs interpolation, with placeholders
 * @param options with values that will be used to replace placeholders
 */
function interpolate(phrase, options) {
    const dollarRegex = /\$/g;
    const dollarBillsYall = '$$$$';
    let interpolated = [phrase];
    if (options == null)
        return interpolated;
    for (const arg of Object.keys(options)) {
        if (arg !== '_') {
            // Ensure replacement value is escaped to prevent special $-prefixed
            // regex replace tokens. the "$$$$" is needed because each "$" needs to
            // be escaped with "$" itself, and we need two in the resulting output.
            let replacement = options[arg];
            if (typeof replacement === 'string') {
                replacement = dollarRegex[Symbol.replace](replacement, dollarBillsYall);
            }
            // We create a new `RegExp` each time instead of using a more-efficient
            // string replace so that the same argument can be replaced multiple times
            // in the same phrase.
            interpolated = insertReplacement(interpolated, new RegExp(`%\\{${arg}\\}`, 'g'), replacement);
        }
    }
    return interpolated;
}
const defaultOnMissingKey = (key) => {
    throw new Error(`missing string: ${key}`);
};
/**
 * Translates strings with interpolation & pluralization support.
 * Extensible with custom dictionaries and pluralization functions.
 *
 * Borrows heavily from and inspired by Polyglot https://github.com/airbnb/polyglot.js,
 * basically a stripped-down version of it. Differences: pluralization functions are not hardcoded
 * and can be easily added among with dictionaries, nested objects are used for pluralization
 * as opposed to `||||` delimeter
 *
 * Usage example: `translator.translate('files_chosen', {smart_count: 3})`
 */
class Translator {
    locale;
    constructor(locales, { onMissingKey = defaultOnMissingKey } = {}) {
        this.locale = {
            strings: {},
            pluralize(n) {
                if (n === 1) {
                    return 0;
                }
                return 1;
            },
        };
        if (Array.isArray(locales)) {
            locales.forEach(this.#apply, this);
        }
        else {
            this.#apply(locales);
        }
        this.#onMissingKey = onMissingKey;
    }
    #onMissingKey;
    #apply(locale) {
        if (!locale?.strings) {
            return;
        }
        const prevLocale = this.locale;
        Object.assign(this.locale, {
            strings: { ...prevLocale.strings, ...locale.strings },
            pluralize: locale.pluralize || prevLocale.pluralize,
        });
    }
    /**
     * Public translate method
     *
     * @param key
     * @param options with values that will be used later to replace placeholders in string
     * @returns string translated (and interpolated)
     */
    translate(key, options) {
        return this.translateArray(key, options).join('');
    }
    /**
     * Get a translation and return the translated and interpolated parts as an array.
     *
     * @returns The translated and interpolated parts, in order.
     */
    translateArray(key, options) {
        let string = this.locale.strings[key];
        if (string == null) {
            this.#onMissingKey(key);
            string = key;
        }
        const hasPluralForms = typeof string === 'object';
        if (hasPluralForms) {
            if (options && typeof options.smart_count !== 'undefined') {
                const plural = this.locale.pluralize(options.smart_count);
                return interpolate(string[plural], options);
            }
            throw new Error('Attempted to use a string with plural forms, but no value was given for %{smart_count}');
        }
        if (typeof string !== 'string') {
            throw new Error(`string was not a string`);
        }
        return interpolate(string, options);
    }
}

/**
 * Core plugin logic that all plugins share.
 *
 * BasePlugin does not contain DOM rendering so it can be used for plugins
 * without a user interface.
 *
 * See `Plugin` for the extended version with Preact rendering for interfaces.
 */
class BasePlugin {
    uppy;
    opts;
    id;
    defaultLocale;
    i18n;
    i18nArray;
    type;
    VERSION;
    constructor(uppy, opts) {
        this.uppy = uppy;
        this.opts = opts ?? {};
    }
    getPluginState() {
        const { plugins } = this.uppy.getState();
        return (plugins?.[this.id] || {});
    }
    setPluginState(update) {
        const { plugins } = this.uppy.getState();
        this.uppy.setState({
            plugins: {
                ...plugins,
                [this.id]: {
                    ...plugins[this.id],
                    ...update,
                },
            },
        });
    }
    setOptions(newOpts) {
        this.opts = { ...this.opts, ...newOpts };
        this.setPluginState(undefined); // so that UI re-renders with new options
        this.i18nInit();
    }
    i18nInit() {
        const translator = new Translator([
            this.defaultLocale,
            this.uppy.locale,
            this.opts.locale,
        ]);
        this.i18n = translator.translate.bind(translator);
        this.i18nArray = translator.translateArray.bind(translator);
        this.setPluginState(undefined); // so that UI re-renders and we see the updated locale
    }
    /**
     * Extendable methods
     * ==================
     * These methods are here to serve as an overview of the extendable methods as well as
     * making them not conditional in use, such as `if (this.afterUpdate)`.
     */
    addTarget(plugin) {
        throw new Error("Extend the addTarget method to add your plugin to another plugin's target");
    }
    install() { }
    uninstall() { }
    update(state) { }
    // Called after every state update, after everything's mounted. Debounced.
    afterUpdate() { }
}

/**
 * Create a wrapper around an event emitter with a `remove` method to remove
 * all events that were added using the wrapped emitter.
 */
class EventManager {
    #uppy;
    #events = [];
    constructor(uppy) {
        this.#uppy = uppy;
    }
    on(event, fn) {
        this.#events.push([event, fn]);
        return this.#uppy.on(event, fn);
    }
    remove() {
        for (const [event, fn] of this.#events.splice(0)) {
            this.#uppy.off(event, fn);
        }
    }
    onFilePause(fileID, cb) {
        this.on('upload-pause', (file, isPaused) => {
            if (fileID === file?.id) {
                cb(isPaused);
            }
        });
    }
    onFileRemove(fileID, cb) {
        this.on('file-removed', (file) => {
            if (fileID === file.id)
                cb(file.id);
        });
    }
    onPause(fileID, cb) {
        this.on('upload-pause', (file, isPaused) => {
            if (fileID === file?.id) {
                // const isPaused = this.#uppy.pauseResume(fileID)
                cb(isPaused);
            }
        });
    }
    onRetry(fileID, cb) {
        this.on('upload-retry', (file) => {
            if (fileID === file?.id) {
                cb();
            }
        });
    }
    onRetryAll(fileID, cb) {
        this.on('retry-all', () => {
            if (!this.#uppy.getFile(fileID))
                return;
            cb();
        });
    }
    onPauseAll(fileID, cb) {
        this.on('pause-all', () => {
            if (!this.#uppy.getFile(fileID))
                return;
            cb();
        });
    }
    onCancelAll(fileID, eventHandler) {
        this.on('cancel-all', (...args) => {
            if (!this.#uppy.getFile(fileID))
                return;
            eventHandler(...args);
        });
    }
    onResumeAll(fileID, cb) {
        this.on('resume-all', () => {
            if (!this.#uppy.getFile(fileID))
                return;
            cb();
        });
    }
}

// Swallow all logs, except errors.
// default if logger is not set or debug: false
const justErrorsLogger = {
    debug: () => { },
    warn: () => { },
    error: (...args) => console.error(`[Uppy] [${getTimeStamp()}]`, ...args),
};
// Print logs to console with namespace + timestamp,
// set by logger: Uppy.debugLogger or debug: true
const debugLogger = {
    debug: (...args) => console.debug(`[Uppy] [${getTimeStamp()}]`, ...args),
    warn: (...args) => console.warn(`[Uppy] [${getTimeStamp()}]`, ...args),
    error: (...args) => console.error(`[Uppy] [${getTimeStamp()}]`, ...args),
};

var prettierBytes = function prettierBytes(input) {
    if (typeof input !== 'number' || Number.isNaN(input)) {
        throw new TypeError(`Expected a number, got ${typeof input}`);
    }
    const neg = input < 0;
    let num = Math.abs(input);
    if (neg) {
        num = -num;
    }
    if (num === 0) {
        return '0 B';
    }
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const exponent = Math.min(Math.floor(Math.log(num) / Math.log(1024)), units.length - 1);
    const value = Number(num / 1024 ** exponent);
    const unit = units[exponent];
    return `${value >= 10 || value % 1 === 0 ? Math.round(value) : value.toFixed(1)} ${unit}`;
};


const prettierBytes$1 = /*@__PURE__*/getDefaultExportFromCjs(prettierBytes);

/* jshint node: true */

/**
  # wildcard

  Very simple wildcard matching, which is designed to provide the same
  functionality that is found in the
  [eve](https://github.com/adobe-webplatform/eve) eventing library.

  ## Usage

  It works with strings:

  <<< examples/strings.js

  Arrays:

  <<< examples/arrays.js

  Objects (matching against keys):

  <<< examples/objects.js

  While the library works in Node, if you are are looking for file-based
  wildcard matching then you should have a look at:

  <https://github.com/isaacs/node-glob>
**/

function WildcardMatcher(text, separator) {
  this.text = text = text || '';
  this.hasWild = ~text.indexOf('*');
  this.separator = separator;
  this.parts = text.split(separator);
}

WildcardMatcher.prototype.match = function(input) {
  var matches = true;
  var parts = this.parts;
  var ii;
  var partsCount = parts.length;
  var testParts;

  if (typeof input == 'string' || input instanceof String) {
    if (!this.hasWild && this.text != input) {
      matches = false;
    } else {
      testParts = (input || '').split(this.separator);
      for (ii = 0; matches && ii < partsCount; ii++) {
        if (parts[ii] === '*')  {
          continue;
        } else if (ii < testParts.length) {
          matches = parts[ii] === testParts[ii];
        } else {
          matches = false;
        }
      }

      // If matches, then return the component parts
      matches = matches && testParts;
    }
  }
  else if (typeof input.splice == 'function') {
    matches = [];

    for (ii = input.length; ii--; ) {
      if (this.match(input[ii])) {
        matches[matches.length] = input[ii];
      }
    }
  }
  else if (typeof input == 'object') {
    matches = {};

    for (var key in input) {
      if (this.match(key)) {
        matches[key] = input[key];
      }
    }
  }

  return matches;
};

var wildcard$1 = function(text, test, separator) {
  var matcher = new WildcardMatcher(text, separator || /[\/\.]/);
  if (typeof test != 'undefined') {
    return matcher.match(test);
  }

  return matcher;
};

var wildcard = wildcard$1;
var reMimePartSplit = /[\/\+\.]/;

/**
  # mime-match

  A simple function to checker whether a target mime type matches a mime-type
  pattern (e.g. image/jpeg matches image/jpeg OR image/*).

  ## Example Usage

  <<< example.js

**/
var mimeMatch = function(target, pattern) {
  function test(pattern) {
    var result = wildcard(pattern, target, reMimePartSplit);

    // ensure that we have a valid mime type (should have two parts)
    return result && result.length >= 2;
  }

  return pattern ? test(pattern.split(';')[0]) : test;
};

const match = /*@__PURE__*/getDefaultExportFromCjs(mimeMatch);

const defaultOptions$4 = {
    maxFileSize: null,
    minFileSize: null,
    maxTotalFileSize: null,
    maxNumberOfFiles: null,
    minNumberOfFiles: null,
    allowedFileTypes: null,
    requiredMetaFields: [],
};
class RestrictionError extends Error {
    isUserFacing;
    file;
    constructor(message, opts) {
        super(message);
        this.isUserFacing = opts?.isUserFacing ?? true;
        if (opts?.file) {
            this.file = opts.file; // only some restriction errors are related to a particular file
        }
    }
    isRestriction = true;
}
class Restricter {
    getI18n;
    getOpts;
    constructor(getOpts, getI18n) {
        this.getI18n = getI18n;
        this.getOpts = () => {
            const opts = getOpts();
            if (opts.restrictions?.allowedFileTypes != null &&
                !Array.isArray(opts.restrictions.allowedFileTypes)) {
                throw new TypeError('`restrictions.allowedFileTypes` must be an array');
            }
            return opts;
        };
    }
    // Because these operations are slow, we cannot run them for every file (if we are adding multiple files)
    validateAggregateRestrictions(existingFiles, addingFiles) {
        const { maxTotalFileSize, maxNumberOfFiles } = this.getOpts().restrictions;
        if (maxNumberOfFiles) {
            const nonGhostFiles = existingFiles.filter((f) => !f.isGhost);
            if (nonGhostFiles.length + addingFiles.length > maxNumberOfFiles) {
                throw new RestrictionError(`${this.getI18n()('youCanOnlyUploadX', {
                    smart_count: maxNumberOfFiles,
                })}`);
            }
        }
        if (maxTotalFileSize) {
            const totalFilesSize = [...existingFiles, ...addingFiles].reduce((total, f) => total + (f.size ?? 0), 0);
            if (totalFilesSize > maxTotalFileSize) {
                throw new RestrictionError(this.getI18n()('aggregateExceedsSize', {
                    sizeAllowed: prettierBytes$1(maxTotalFileSize),
                    size: prettierBytes$1(totalFilesSize),
                }));
            }
        }
    }
    validateSingleFile(file) {
        const { maxFileSize, minFileSize, allowedFileTypes } = this.getOpts().restrictions;
        if (allowedFileTypes) {
            const isCorrectFileType = allowedFileTypes.some((type) => {
                // check if this is a mime-type
                if (type.includes('/')) {
                    if (!file.type)
                        return false;
                    return match(file.type.replace(/;.*?$/, ''), type);
                }
                // otherwise this is likely an extension
                if (type[0] === '.' && file.extension) {
                    return file.extension.toLowerCase() === type.slice(1).toLowerCase();
                }
                return false;
            });
            if (!isCorrectFileType) {
                const allowedFileTypesString = allowedFileTypes.join(', ');
                throw new RestrictionError(this.getI18n()('youCanOnlyUploadFileTypes', {
                    types: allowedFileTypesString,
                }), { file });
            }
        }
        // We can't check maxFileSize if the size is unknown.
        if (maxFileSize && file.size != null && file.size > maxFileSize) {
            throw new RestrictionError(this.getI18n()('exceedsSize', {
                size: prettierBytes$1(maxFileSize),
                file: file.name ?? this.getI18n()('unnamed'),
            }), { file });
        }
        // We can't check minFileSize if the size is unknown.
        if (minFileSize && file.size != null && file.size < minFileSize) {
            throw new RestrictionError(this.getI18n()('inferiorSize', {
                size: prettierBytes$1(minFileSize),
            }), { file });
        }
    }
    validate(existingFiles, addingFiles) {
        addingFiles.forEach((addingFile) => {
            this.validateSingleFile(addingFile);
        });
        this.validateAggregateRestrictions(existingFiles, addingFiles);
    }
    validateMinNumberOfFiles(files) {
        const { minNumberOfFiles } = this.getOpts().restrictions;
        if (minNumberOfFiles && Object.keys(files).length < minNumberOfFiles) {
            throw new RestrictionError(this.getI18n()('youHaveToAtLeastSelectX', {
                smart_count: minNumberOfFiles,
            }));
        }
    }
    getMissingRequiredMetaFields(file) {
        const error = new RestrictionError(this.getI18n()('missingRequiredMetaFieldOnFile', {
            fileName: file.name ?? this.getI18n()('unnamed'),
        }));
        const { requiredMetaFields } = this.getOpts().restrictions;
        const missingFields = [];
        for (const field of requiredMetaFields) {
            if (!Object.hasOwn(file.meta, field) || file.meta[field] === '') {
                missingFields.push(field);
            }
        }
        return { missingFields, error };
    }
}

const version$5 = "5.0.0";
const packageJson$4 = {
  version: version$5};

/**
 * Default store that keeps state in a simple object.
 */
class DefaultStore {
    static VERSION = packageJson$4.version;
    state = {};
    #callbacks = new Set();
    getState() {
        return this.state;
    }
    setState(patch) {
        const prevState = { ...this.state };
        const nextState = { ...this.state, ...patch };
        this.state = nextState;
        this.#publish(prevState, nextState, patch);
    }
    subscribe(listener) {
        this.#callbacks.add(listener);
        return () => {
            this.#callbacks.delete(listener);
        };
    }
    #publish(...args) {
        this.#callbacks.forEach((listener) => {
            listener(...args);
        });
    }
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */

function isObject$3(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

var isObject_1 = isObject$3;

/** Detect free variable `global` from Node.js. */

var freeGlobal$1 = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

var _freeGlobal = freeGlobal$1;

var freeGlobal = _freeGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root$2 = freeGlobal || freeSelf || Function('return this')();

var _root = root$2;

var root$1 = _root;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now$1 = function() {
  return root$1.Date.now();
};

var now_1 = now$1;

/** Used to match a single whitespace character. */

var reWhitespace = /\s/;

/**
 * Used by `_.trim` and `_.trimEnd` to get the index of the last non-whitespace
 * character of `string`.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {number} Returns the index of the last non-whitespace character.
 */
function trimmedEndIndex$1(string) {
  var index = string.length;

  while (index-- && reWhitespace.test(string.charAt(index))) {}
  return index;
}

var _trimmedEndIndex = trimmedEndIndex$1;

var trimmedEndIndex = _trimmedEndIndex;

/** Used to match leading whitespace. */
var reTrimStart = /^\s+/;

/**
 * The base implementation of `_.trim`.
 *
 * @private
 * @param {string} string The string to trim.
 * @returns {string} Returns the trimmed string.
 */
function baseTrim$1(string) {
  return string
    ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, '')
    : string;
}

var _baseTrim = baseTrim$1;

var root = _root;

/** Built-in value references. */
var Symbol$3 = root.Symbol;

var _Symbol = Symbol$3;

var Symbol$2 = _Symbol;

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto$1.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$1.toString;

/** Built-in value references. */
var symToStringTag$1 = Symbol$2 ? Symbol$2.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag$1(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag$1),
      tag = value[symToStringTag$1];

  try {
    value[symToStringTag$1] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString$1.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}

var _getRawTag = getRawTag$1;

/** Used for built-in method references. */

var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString$1(value) {
  return nativeObjectToString.call(value);
}

var _objectToString = objectToString$1;

var Symbol$1 = _Symbol,
    getRawTag = _getRawTag,
    objectToString = _objectToString;

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag$1(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

var _baseGetTag = baseGetTag$1;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */

function isObjectLike$1(value) {
  return value != null && typeof value == 'object';
}

var isObjectLike_1 = isObjectLike$1;

var baseGetTag = _baseGetTag,
    isObjectLike = isObjectLike_1;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol$1(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

var isSymbol_1 = isSymbol$1;

var baseTrim = _baseTrim,
    isObject$2 = isObject_1,
    isSymbol = isSymbol_1;

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber$1(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject$2(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject$2(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = baseTrim(value);
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

var toNumber_1 = toNumber$1;

var isObject$1 = isObject_1,
    now = now_1,
    toNumber = toNumber_1;

/** Error message constants. */
var FUNC_ERROR_TEXT$1 = 'Expected a function';

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce$1(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT$1);
  }
  wait = toNumber(wait) || 0;
  if (isObject$1(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        timeWaiting = wait - timeSinceLastCall;

    return maxing
      ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        clearTimeout(timerId);
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

var debounce_1 = debounce$1;

var debounce = debounce_1,
    isObject = isObject_1;

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed `func` invocations and a `flush` method to
 * immediately invoke them. Provide `options` to indicate whether `func`
 * should be invoked on the leading and/or trailing edge of the `wait`
 * timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the throttled function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=true]
 *  Specify invoking on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // Avoid excessively updating the position while scrolling.
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
 * jQuery(element).on('click', throttled);
 *
 * // Cancel the trailing throttled invocation.
 * jQuery(window).on('popstate', throttled.cancel);
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    'leading': leading,
    'maxWait': wait,
    'trailing': trailing
  });
}

var throttle_1 = throttle;

const throttle$1 = /*@__PURE__*/getDefaultExportFromCjs(throttle_1);

/**
* Create an event emitter with namespaces
* @name createNamespaceEmitter
* @example
* var emitter = require('./index')()
*
* emitter.on('*', function () {
*   console.log('all events emitted', this.event)
* })
*
* emitter.on('example', function () {
*   console.log('example event emitted')
* })
*/

var namespaceEmitter = function createNamespaceEmitter () {
  var emitter = {};
  var _fns = emitter._fns = {};

  /**
  * Emit an event. Optionally namespace the event. Handlers are fired in the order in which they were added with exact matches taking precedence. Separate the namespace and event with a `:`
  * @name emit
  * @param {String} event – the name of the event, with optional namespace
  * @param {...*} data – up to 6 arguments that are passed to the event listener
  * @example
  * emitter.emit('example')
  * emitter.emit('demo:test')
  * emitter.emit('data', { example: true}, 'a string', 1)
  */
  emitter.emit = function emit (event, arg1, arg2, arg3, arg4, arg5, arg6) {
    var toEmit = getListeners(event);

    if (toEmit.length) {
      emitAll(event, toEmit, [arg1, arg2, arg3, arg4, arg5, arg6]);
    }
  };

  /**
  * Create en event listener.
  * @name on
  * @param {String} event
  * @param {Function} fn
  * @example
  * emitter.on('example', function () {})
  * emitter.on('demo', function () {})
  */
  emitter.on = function on (event, fn) {
    if (!_fns[event]) {
      _fns[event] = [];
    }

    _fns[event].push(fn);
  };

  /**
  * Create en event listener that fires once.
  * @name once
  * @param {String} event
  * @param {Function} fn
  * @example
  * emitter.once('example', function () {})
  * emitter.once('demo', function () {})
  */
  emitter.once = function once (event, fn) {
    function one () {
      fn.apply(this, arguments);
      emitter.off(event, one);
    }
    this.on(event, one);
  };

  /**
  * Stop listening to an event. Stop all listeners on an event by only passing the event name. Stop a single listener by passing that event handler as a callback.
  * You must be explicit about what will be unsubscribed: `emitter.off('demo')` will unsubscribe an `emitter.on('demo')` listener,
  * `emitter.off('demo:example')` will unsubscribe an `emitter.on('demo:example')` listener
  * @name off
  * @param {String} event
  * @param {Function} [fn] – the specific handler
  * @example
  * emitter.off('example')
  * emitter.off('demo', function () {})
  */
  emitter.off = function off (event, fn) {
    var keep = [];

    if (event && fn) {
      var fns = this._fns[event];
      var i = 0;
      var l = fns ? fns.length : 0;

      for (i; i < l; i++) {
        if (fns[i] !== fn) {
          keep.push(fns[i]);
        }
      }
    }

    keep.length ? this._fns[event] = keep : delete this._fns[event];
  };

  function getListeners (e) {
    var out = _fns[e] ? _fns[e] : [];
    var idx = e.indexOf(':');
    var args = (idx === -1) ? [e] : [e.substring(0, idx), e.substring(idx + 1)];

    var keys = Object.keys(_fns);
    var i = 0;
    var l = keys.length;

    for (i; i < l; i++) {
      var key = keys[i];
      if (key === '*') {
        out = out.concat(_fns[key]);
      }

      if (args.length === 2 && args[0] === key) {
        out = out.concat(_fns[key]);
        break
      }
    }

    return out
  }

  function emitAll (e, fns, args) {
    var i = 0;
    var l = fns.length;

    for (i; i < l; i++) {
      if (!fns[i]) break
      fns[i].event = e;
      fns[i].apply(fns[i], args);
    }
  }

  return emitter
};

const ee = /*@__PURE__*/getDefaultExportFromCjs(namespaceEmitter);

/* @ts-self-types="./index.d.ts" */
let urlAlphabet =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';
let nanoid = (size = 21) => {
  let id = '';
  let i = size | 0;
  while (i--) {
    id += urlAlphabet[(Math.random() * 64) | 0];
  }
  return id
};

const version$4 = "5.0.2";
const packageJson$3 = {
  version: version$4};

function getFileName(fileType, fileDescriptor) {
    if (fileDescriptor.name) {
        return fileDescriptor.name;
    }
    if (fileType.split('/')[0] === 'image') {
        return `${fileType.split('/')[0]}.${fileType.split('/')[1]}`;
    }
    return 'noname';
}

function getFilePlugins(fileDescriptor) {
    return fileDescriptor.plugins || [];
}

const locale$1 = {
    strings: {
        addBulkFilesFailed: {
            0: 'Failed to add %{smart_count} file due to an internal error',
            1: 'Failed to add %{smart_count} files due to internal errors',
        },
        youCanOnlyUploadX: {
            0: 'You can only upload %{smart_count} file',
            1: 'You can only upload %{smart_count} files',
        },
        youHaveToAtLeastSelectX: {
            0: 'You have to select at least %{smart_count} file',
            1: 'You have to select at least %{smart_count} files',
        },
        aggregateExceedsSize: 'You selected %{size} of files, but maximum allowed size is %{sizeAllowed}',
        exceedsSize: '%{file} exceeds maximum allowed size of %{size}',
        missingRequiredMetaField: 'Missing required meta fields',
        missingRequiredMetaFieldOnFile: 'Missing required meta fields in %{fileName}',
        inferiorSize: 'This file is smaller than the allowed size of %{size}',
        youCanOnlyUploadFileTypes: 'You can only upload: %{types}',
        noMoreFilesAllowed: 'Cannot add more files',
        noDuplicates: "Cannot add the duplicate file '%{fileName}', it already exists",
        companionError: 'Connection with Companion failed',
        authAborted: 'Authentication aborted',
        companionUnauthorizeHint: 'To unauthorize to your %{provider} account, please go to %{url}',
        failedToUpload: 'Failed to upload %{file}',
        noInternetConnection: 'No Internet connection',
        connectedToInternet: 'Connected to the Internet',
        // Strings for remote providers
        noFilesFound: 'You have no files or folders here',
        noSearchResults: 'Unfortunately, there are no results for this search',
        selectX: {
            0: 'Select %{smart_count}',
            1: 'Select %{smart_count}',
        },
        allFilesFromFolderNamed: 'All files from folder %{name}',
        openFolderNamed: 'Open folder %{name}',
        cancel: 'Cancel',
        logOut: 'Log out',
        logIn: 'Log in',
        pickFiles: 'Pick files',
        pickPhotos: 'Pick photos',
        filter: 'Filter',
        resetFilter: 'Reset filter',
        loading: 'Loading...',
        loadedXFiles: 'Loaded %{numFiles} files',
        authenticateWithTitle: 'Please authenticate with %{pluginName} to select files',
        authenticateWith: 'Connect to %{pluginName}',
        signInWithGoogle: 'Sign in with Google',
        searchImages: 'Search for images',
        enterTextToSearch: 'Enter text to search for images',
        search: 'Search',
        resetSearch: 'Reset search',
        emptyFolderAdded: 'No files were added from empty folder',
        addedNumFiles: 'Added %{numFiles} file(s)',
        folderAlreadyAdded: 'The folder "%{folder}" was already added',
        folderAdded: {
            0: 'Added %{smart_count} file from %{folder}',
            1: 'Added %{smart_count} files from %{folder}',
        },
        additionalRestrictionsFailed: '%{count} additional restrictions were not fulfilled',
        unnamed: 'Unnamed',
        pleaseWait: 'Please wait',
    },
};

// Edge 15.x does not fire 'progress' events on uploads.
// See https://github.com/transloadit/uppy/issues/945
// And https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/12224510/
function supportsUploadProgress(userAgent) {
    // Allow passing in userAgent for tests
    if (userAgent == null && typeof navigator !== 'undefined') {
        userAgent = navigator.userAgent;
    }
    // Assume it works because basically everything supports progress events.
    if (!userAgent)
        return true;
    const m = /Edge\/(\d+\.\d+)/.exec(userAgent);
    if (!m)
        return true;
    const edgeVersion = m[1];
    const version = edgeVersion.split('.', 2);
    const major = parseInt(version[0], 10);
    const minor = parseInt(version[1], 10);
    // Worked before:
    // Edge 40.15063.0.0
    // Microsoft EdgeHTML 15.15063
    if (major < 15 || (major === 15 && minor < 15063)) {
        return true;
    }
    // Fixed in:
    // Microsoft EdgeHTML 18.18218
    if (major > 18 || (major === 18 && minor >= 18218)) {
        return true;
    }
    // other versions don't work.
    return false;
}

/* global AggregateError */
const defaultUploadState = {
    totalProgress: 0,
    allowNewUpload: true,
    error: null,
    recoveredState: null,
};
/**
 * Uppy Core module.
 * Manages plugins, state updates, acts as an event bus,
 * adds/removes files and metadata.
 */
class Uppy {
    static VERSION = packageJson$3.version;
    #plugins = Object.create(null);
    #restricter;
    #storeUnsubscribe;
    #emitter = ee();
    #preProcessors = new Set();
    #uploaders = new Map();
    #postProcessors = new Set();
    #installingPlugin;
    defaultLocale;
    locale;
    // The user optionally passes in options, but we set defaults for missing options.
    // We consider all options present after the contructor has run.
    opts;
    store;
    // Warning: do not use this from a plugin, as it will cause the plugins' translations to be missing
    i18n;
    i18nArray;
    scheduledAutoProceed = null;
    wasOffline = false;
    /**
     * Instantiate Uppy
     */
    constructor(opts) {
        this.defaultLocale = locale$1;
        const defaultOptions = {
            id: 'uppy',
            autoProceed: false,
            allowMultipleUploadBatches: true,
            debug: false,
            restrictions: defaultOptions$4,
            meta: {},
            onBeforeFileAdded: (file, files) => !Object.hasOwn(files, file.id),
            onBeforeUpload: (files) => files,
            store: new DefaultStore(),
            logger: justErrorsLogger,
            infoTimeout: 5000,
        };
        const merged = { ...defaultOptions, ...opts };
        // Merge default options with the ones set by user,
        // making sure to merge restrictions too
        this.opts = {
            ...merged,
            restrictions: {
                ...defaultOptions.restrictions,
                ...opts?.restrictions,
            },
        };
        // Support debug: true for backwards-compatability, unless logger is set in opts
        // opts instead of this.opts to avoid comparing objects — we set logger: justErrorsLogger in defaultOptions
        if (opts?.logger && opts.debug) {
            this.log('You are using a custom `logger`, but also set `debug: true`, which uses built-in logger to output logs to console. Ignoring `debug: true` and using your custom `logger`.', 'warning');
        }
        else if (opts?.debug) {
            this.opts.logger = debugLogger;
        }
        this.log(`Using Core v${Uppy.VERSION}`);
        this.i18nInit();
        this.store = this.opts.store;
        this.setState({
            ...defaultUploadState,
            plugins: {},
            files: {},
            currentUploads: {},
            capabilities: {
                uploadProgress: supportsUploadProgress(),
                individualCancellation: true,
                resumableUploads: false,
            },
            meta: { ...this.opts.meta },
            info: [],
        });
        this.#restricter = new Restricter(() => this.opts, () => this.i18n);
        this.#storeUnsubscribe = this.store.subscribe((prevState, nextState, patch) => {
            this.emit('state-update', prevState, nextState, patch);
            this.updateAll(nextState);
        });
        // Exposing uppy object on window for debugging and testing
        if (this.opts.debug && typeof window !== 'undefined') {
            // @ts-ignore Mutating the global object for debug purposes
            window[this.opts.id] = this;
        }
        this.#addListeners();
    }
    emit(event, ...args) {
        this.#emitter.emit(event, ...args);
    }
    on(event, callback) {
        this.#emitter.on(event, callback);
        return this;
    }
    once(event, callback) {
        this.#emitter.once(event, callback);
        return this;
    }
    off(event, callback) {
        this.#emitter.off(event, callback);
        return this;
    }
    /**
     * Iterate on all plugins and run `update` on them.
     * Called each time state changes.
     *
     */
    updateAll(state) {
        this.iteratePlugins((plugin) => {
            plugin.update(state);
        });
    }
    /**
     * Updates state with a patch
     */
    setState(patch) {
        this.store.setState(patch);
    }
    /**
     * Returns current state.
     */
    getState() {
        return this.store.getState();
    }
    patchFilesState(filesWithNewState) {
        const existingFilesState = this.getState().files;
        this.setState({
            files: {
                ...existingFilesState,
                ...Object.fromEntries(Object.entries(filesWithNewState).map(([fileID, newFileState]) => [
                    fileID,
                    {
                        ...existingFilesState[fileID],
                        ...newFileState,
                    },
                ])),
            },
        });
    }
    /**
     * Shorthand to set state for a specific file.
     */
    setFileState(fileID, state) {
        if (!this.getState().files[fileID]) {
            throw new Error(`Can’t set state for ${fileID} (the file could have been removed)`);
        }
        this.patchFilesState({ [fileID]: state });
    }
    i18nInit() {
        const onMissingKey = (key) => this.log(`Missing i18n string: ${key}`, 'error');
        const translator = new Translator([this.defaultLocale, this.opts.locale], {
            onMissingKey,
        });
        this.i18n = translator.translate.bind(translator);
        this.i18nArray = translator.translateArray.bind(translator);
        this.locale = translator.locale;
    }
    setOptions(newOpts) {
        this.opts = {
            ...this.opts,
            ...newOpts,
            restrictions: {
                ...this.opts.restrictions,
                ...newOpts?.restrictions,
            },
        };
        if (newOpts.meta) {
            this.setMeta(newOpts.meta);
        }
        this.i18nInit();
        if (newOpts.locale) {
            this.iteratePlugins((plugin) => {
                plugin.setOptions(newOpts);
            });
        }
        // Note: this is not the preact `setState`, it's an internal function that has the same name.
        this.setState(undefined); // so that UI re-renders with new options
    }
    resetProgress() {
        const defaultProgress = {
            percentage: 0,
            bytesUploaded: false,
            uploadComplete: false,
            uploadStarted: null,
        };
        const files = { ...this.getState().files };
        const updatedFiles = Object.create(null);
        Object.keys(files).forEach((fileID) => {
            updatedFiles[fileID] = {
                ...files[fileID],
                progress: {
                    ...files[fileID].progress,
                    ...defaultProgress,
                },
                // @ts-expect-error these typed are inserted
                // into the namespace in their respective packages
                // but core isn't ware of those
                tus: undefined,
                transloadit: undefined,
            };
        });
        this.setState({ files: updatedFiles, ...defaultUploadState });
    }
    clear() {
        const { capabilities, currentUploads } = this.getState();
        if (Object.keys(currentUploads).length > 0 &&
            !capabilities.individualCancellation) {
            throw new Error('The installed uploader plugin does not allow removing files during an upload.');
        }
        this.setState({ ...defaultUploadState, files: {} });
    }
    addPreProcessor(fn) {
        this.#preProcessors.add(fn);
    }
    removePreProcessor(fn) {
        return this.#preProcessors.delete(fn);
    }
    addPostProcessor(fn) {
        this.#postProcessors.add(fn);
    }
    removePostProcessor(fn) {
        return this.#postProcessors.delete(fn);
    }
    addUploader(fn) {
        this.#uploaders.set(fn, this.#installingPlugin ?? '');
    }
    removeUploader(fn) {
        return this.#uploaders.delete(fn);
    }
    setMeta(data) {
        const updatedMeta = { ...this.getState().meta, ...data };
        const updatedFiles = { ...this.getState().files };
        Object.keys(updatedFiles).forEach((fileID) => {
            updatedFiles[fileID] = {
                ...updatedFiles[fileID],
                meta: { ...updatedFiles[fileID].meta, ...data },
            };
        });
        this.log('Adding metadata:');
        this.log(data);
        this.setState({
            meta: updatedMeta,
            files: updatedFiles,
        });
    }
    setFileMeta(fileID, data) {
        const updatedFiles = { ...this.getState().files };
        if (!updatedFiles[fileID]) {
            this.log(`Was trying to set metadata for a file that has been removed: ${fileID}`);
            return;
        }
        const newMeta = { ...updatedFiles[fileID].meta, ...data };
        updatedFiles[fileID] = { ...updatedFiles[fileID], meta: newMeta };
        this.setState({ files: updatedFiles });
    }
    /**
     * Get a file object.
     */
    getFile(fileID) {
        return this.getState().files[fileID];
    }
    /**
     * Get all files in an array.
     */
    getFiles() {
        const { files } = this.getState();
        return Object.values(files);
    }
    getFilesByIds(ids) {
        return ids.map((id) => this.getFile(id));
    }
    getObjectOfFilesPerState() {
        const { files: filesObject, totalProgress, error } = this.getState();
        const files = Object.values(filesObject);
        const inProgressFiles = [];
        const newFiles = [];
        const startedFiles = [];
        const uploadStartedFiles = [];
        const pausedFiles = [];
        const completeFiles = [];
        const erroredFiles = [];
        const inProgressNotPausedFiles = [];
        const processingFiles = [];
        for (const file of files) {
            const { progress } = file;
            if (!progress.uploadComplete && progress.uploadStarted) {
                inProgressFiles.push(file);
                if (!file.isPaused) {
                    inProgressNotPausedFiles.push(file);
                }
            }
            if (!progress.uploadStarted) {
                newFiles.push(file);
            }
            if (progress.uploadStarted ||
                progress.preprocess ||
                progress.postprocess) {
                startedFiles.push(file);
            }
            if (progress.uploadStarted) {
                uploadStartedFiles.push(file);
            }
            if (file.isPaused) {
                pausedFiles.push(file);
            }
            if (progress.uploadComplete) {
                completeFiles.push(file);
            }
            if (file.error) {
                erroredFiles.push(file);
            }
            if (progress.preprocess || progress.postprocess) {
                processingFiles.push(file);
            }
        }
        return {
            newFiles,
            startedFiles,
            uploadStartedFiles,
            pausedFiles,
            completeFiles,
            erroredFiles,
            inProgressFiles,
            inProgressNotPausedFiles,
            processingFiles,
            isUploadStarted: uploadStartedFiles.length > 0,
            isAllComplete: totalProgress === 100 &&
                completeFiles.length === files.length &&
                processingFiles.length === 0,
            isAllErrored: !!error && erroredFiles.length === files.length,
            isAllPaused: inProgressFiles.length !== 0 &&
                pausedFiles.length === inProgressFiles.length,
            isUploadInProgress: inProgressFiles.length > 0,
            isSomeGhost: files.some((file) => file.isGhost),
        };
    }
    #informAndEmit(errors) {
        for (const error of errors) {
            if (error.isRestriction) {
                this.emit('restriction-failed', error.file, error);
            }
            else {
                this.emit('error', error, error.file);
            }
            this.log(error, 'warning');
        }
        const userFacingErrors = errors.filter((error) => error.isUserFacing);
        // don't flood the user: only show the first 4 toasts
        const maxNumToShow = 4;
        const firstErrors = userFacingErrors.slice(0, maxNumToShow);
        const additionalErrors = userFacingErrors.slice(maxNumToShow);
        firstErrors.forEach(({ message, details = '' }) => {
            this.info({ message, details }, 'error', this.opts.infoTimeout);
        });
        if (additionalErrors.length > 0) {
            this.info({
                message: this.i18n('additionalRestrictionsFailed', {
                    count: additionalErrors.length,
                }),
            });
        }
    }
    validateRestrictions(file, files = this.getFiles()) {
        try {
            this.#restricter.validate(files, [file]);
        }
        catch (err) {
            return err;
        }
        return null;
    }
    validateSingleFile(file) {
        try {
            this.#restricter.validateSingleFile(file);
        }
        catch (err) {
            return err.message;
        }
        return null;
    }
    validateAggregateRestrictions(files) {
        const existingFiles = this.getFiles();
        try {
            this.#restricter.validateAggregateRestrictions(existingFiles, files);
        }
        catch (err) {
            return err.message;
        }
        return null;
    }
    #checkRequiredMetaFieldsOnFile(file) {
        const { missingFields, error } = this.#restricter.getMissingRequiredMetaFields(file);
        if (missingFields.length > 0) {
            this.setFileState(file.id, {
                missingRequiredMetaFields: missingFields,
                error: error.message,
            });
            this.log(error.message);
            this.emit('restriction-failed', file, error);
            return false;
        }
        if (missingFields.length === 0 && file.missingRequiredMetaFields) {
            this.setFileState(file.id, {
                missingRequiredMetaFields: [],
            });
        }
        return true;
    }
    #checkRequiredMetaFields(files) {
        let success = true;
        for (const file of Object.values(files)) {
            if (!this.#checkRequiredMetaFieldsOnFile(file)) {
                success = false;
            }
        }
        return success;
    }
    #assertNewUploadAllowed(file) {
        const { allowNewUpload } = this.getState();
        if (allowNewUpload === false) {
            const error = new RestrictionError(this.i18n('noMoreFilesAllowed'), {
                file,
            });
            this.#informAndEmit([error]);
            throw error;
        }
    }
    checkIfFileAlreadyExists(fileID) {
        const { files } = this.getState();
        if (files[fileID] && !files[fileID].isGhost) {
            return true;
        }
        return false;
    }
    /**
     * Create a file state object based on user-provided `addFile()` options.
     */
    #transformFile(fileDescriptorOrFile) {
        // Uppy expects files in { name, type, size, data } format.
        // If the actual File object is passed from input[type=file] or drag-drop,
        // we normalize it to match Uppy file object
        const file = (fileDescriptorOrFile instanceof File
            ? {
                name: fileDescriptorOrFile.name,
                type: fileDescriptorOrFile.type,
                size: fileDescriptorOrFile.size,
                data: fileDescriptorOrFile,
            }
            : fileDescriptorOrFile);
        const fileType = getFileType(file);
        const fileName = getFileName(fileType, file);
        const filePlugins = getFilePlugins(file);
        const fileExtension = getFileNameAndExtension(fileName).extension;
        const id = getSafeFileId(file, this.getID());
        const meta = file.meta || {};
        meta.name = fileName;
        meta.type = fileType;
        // `null` means the size is unknown.
        const size = Number.isFinite(file.data.size)
            ? file.data.size
            : null;
        return {
            source: file.source || '',
            id,
            name: fileName,
            plugins: filePlugins,
            extension: fileExtension || '',
            meta: {
                ...this.getState().meta,
                ...meta,
            },
            type: fileType,
            data: file.data,
            progress: {
                percentage: 0,
                bytesUploaded: false,
                bytesTotal: size,
                uploadComplete: false,
                uploadStarted: null,
            },
            size,
            isGhost: false,
            isRemote: file.isRemote || false,
            remote: file.remote,
            preview: file.preview,
        };
    }
    // Schedule an upload if `autoProceed` is enabled.
    #startIfAutoProceed() {
        if (this.opts.autoProceed && !this.scheduledAutoProceed) {
            this.scheduledAutoProceed = setTimeout(() => {
                this.scheduledAutoProceed = null;
                this.upload().catch((err) => {
                    if (!err.isRestriction) {
                        this.log(err.stack || err.message || err);
                    }
                });
            }, 4);
        }
    }
    #checkAndUpdateFileState(filesToAdd) {
        let { files: existingFiles } = this.getState();
        // create a copy of the files object only once
        let nextFilesState = { ...existingFiles };
        const validFilesToAdd = [];
        const errors = [];
        for (const fileToAdd of filesToAdd) {
            try {
                let newFile = this.#transformFile(fileToAdd);
                // If a file has been recovered (Golden Retriever), but we were unable to recover its data (probably too large),
                // users are asked to re-select these half-recovered files and then this method will be called again.
                // In order to keep the progress, meta and everything else, we keep the existing file,
                // but we replace `data`, and we remove `isGhost`, because the file is no longer a ghost now
                const isGhost = existingFiles[newFile.id]?.isGhost;
                if (isGhost) {
                    const existingFileState = existingFiles[newFile.id];
                    newFile = {
                        ...existingFileState,
                        isGhost: false,
                        data: fileToAdd.data,
                    };
                    this.log(`Replaced the blob in the restored ghost file: ${newFile.name}, ${newFile.id}`);
                }
                const onBeforeFileAddedResult = this.opts.onBeforeFileAdded(newFile, nextFilesState);
                // update state after onBeforeFileAdded
                existingFiles = this.getState().files;
                nextFilesState = { ...existingFiles, ...nextFilesState };
                if (!onBeforeFileAddedResult &&
                    this.checkIfFileAlreadyExists(newFile.id)) {
                    throw new RestrictionError(this.i18n('noDuplicates', {
                        fileName: newFile.name ?? this.i18n('unnamed'),
                    }), { file: fileToAdd });
                }
                // Pass through reselected files from Golden Retriever
                if (onBeforeFileAddedResult === false && !isGhost) {
                    // Don’t show UI info for this error, as it should be done by the developer
                    throw new RestrictionError('Cannot add the file because onBeforeFileAdded returned false.', { isUserFacing: false, file: fileToAdd });
                }
                else if (typeof onBeforeFileAddedResult === 'object' &&
                    onBeforeFileAddedResult !== null) {
                    newFile = onBeforeFileAddedResult;
                }
                this.#restricter.validateSingleFile(newFile);
                // need to add it to the new local state immediately, so we can use the state to validate the next files too
                nextFilesState[newFile.id] = newFile;
                validFilesToAdd.push(newFile);
            }
            catch (err) {
                errors.push(err);
            }
        }
        try {
            // need to run this separately because it's much more slow, so if we run it inside the for-loop it will be very slow
            // when many files are added
            this.#restricter.validateAggregateRestrictions(Object.values(existingFiles), validFilesToAdd);
        }
        catch (err) {
            errors.push(err);
            // If we have any aggregate error, don't allow adding this batch
            return {
                nextFilesState: existingFiles,
                validFilesToAdd: [],
                errors,
            };
        }
        return {
            nextFilesState,
            validFilesToAdd,
            errors,
        };
    }
    /**
     * Add a new file to `state.files`. This will run `onBeforeFileAdded`,
     * try to guess file type in a clever way, check file against restrictions,
     * and start an upload if `autoProceed === true`.
     */
    addFile(file) {
        this.#assertNewUploadAllowed(file);
        const { nextFilesState, validFilesToAdd, errors } = this.#checkAndUpdateFileState([file]);
        const restrictionErrors = errors.filter((error) => error.isRestriction);
        this.#informAndEmit(restrictionErrors);
        if (errors.length > 0)
            throw errors[0];
        this.setState({ files: nextFilesState });
        const [firstValidFileToAdd] = validFilesToAdd;
        this.emit('file-added', firstValidFileToAdd);
        this.emit('files-added', validFilesToAdd);
        this.log(`Added file: ${firstValidFileToAdd.name}, ${firstValidFileToAdd.id}, mime type: ${firstValidFileToAdd.type}`);
        this.#startIfAutoProceed();
        return firstValidFileToAdd.id;
    }
    /**
     * Add multiple files to `state.files`. See the `addFile()` documentation.
     *
     * If an error occurs while adding a file, it is logged and the user is notified.
     * This is good for UI plugins, but not for programmatic use.
     * Programmatic users should usually still use `addFile()` on individual files.
     */
    addFiles(fileDescriptors) {
        this.#assertNewUploadAllowed();
        const { nextFilesState, validFilesToAdd, errors } = this.#checkAndUpdateFileState(fileDescriptors);
        const restrictionErrors = errors.filter((error) => error.isRestriction);
        this.#informAndEmit(restrictionErrors);
        const nonRestrictionErrors = errors.filter((error) => !error.isRestriction);
        if (nonRestrictionErrors.length > 0) {
            let message = 'Multiple errors occurred while adding files:\n';
            nonRestrictionErrors.forEach((subError) => {
                message += `\n * ${subError.message}`;
            });
            this.info({
                message: this.i18n('addBulkFilesFailed', {
                    smart_count: nonRestrictionErrors.length,
                }),
                details: message,
            }, 'error', this.opts.infoTimeout);
            if (typeof AggregateError === 'function') {
                throw new AggregateError(nonRestrictionErrors, message);
            }
            else {
                const err = new Error(message);
                // @ts-expect-error fallback when AggregateError is not available
                err.errors = nonRestrictionErrors;
                throw err;
            }
        }
        // OK, we haven't thrown an error, we can start updating state and emitting events now:
        this.setState({ files: nextFilesState });
        validFilesToAdd.forEach((file) => {
            this.emit('file-added', file);
        });
        this.emit('files-added', validFilesToAdd);
        if (validFilesToAdd.length > 5) {
            this.log(`Added batch of ${validFilesToAdd.length} files`);
        }
        else {
            Object.values(validFilesToAdd).forEach((file) => {
                this.log(`Added file: ${file.name}\n id: ${file.id}\n type: ${file.type}`);
            });
        }
        if (validFilesToAdd.length > 0) {
            this.#startIfAutoProceed();
        }
    }
    removeFiles(fileIDs) {
        const { files, currentUploads } = this.getState();
        const updatedFiles = { ...files };
        const updatedUploads = { ...currentUploads };
        const removedFiles = Object.create(null);
        fileIDs.forEach((fileID) => {
            if (files[fileID]) {
                removedFiles[fileID] = files[fileID];
                delete updatedFiles[fileID];
            }
        });
        // Remove files from the `fileIDs` list in each upload.
        function fileIsNotRemoved(uploadFileID) {
            return removedFiles[uploadFileID] === undefined;
        }
        Object.keys(updatedUploads).forEach((uploadID) => {
            const newFileIDs = currentUploads[uploadID].fileIDs.filter(fileIsNotRemoved);
            // Remove the upload if no files are associated with it anymore.
            if (newFileIDs.length === 0) {
                delete updatedUploads[uploadID];
                return;
            }
            const { capabilities } = this.getState();
            if (newFileIDs.length !== currentUploads[uploadID].fileIDs.length &&
                !capabilities.individualCancellation) {
                throw new Error('The installed uploader plugin does not allow removing files during an upload.');
            }
            updatedUploads[uploadID] = {
                ...currentUploads[uploadID],
                fileIDs: newFileIDs,
            };
        });
        const stateUpdate = {
            currentUploads: updatedUploads,
            files: updatedFiles,
        };
        // If all files were removed - allow new uploads,
        // and clear recoveredState
        if (Object.keys(updatedFiles).length === 0) {
            stateUpdate.allowNewUpload = true;
            stateUpdate.error = null;
            stateUpdate.recoveredState = null;
        }
        this.setState(stateUpdate);
        this.#updateTotalProgressThrottled();
        const removedFileIDs = Object.keys(removedFiles);
        removedFileIDs.forEach((fileID) => {
            this.emit('file-removed', removedFiles[fileID]);
        });
        if (removedFileIDs.length > 5) {
            this.log(`Removed ${removedFileIDs.length} files`);
        }
        else {
            this.log(`Removed files: ${removedFileIDs.join(', ')}`);
        }
    }
    removeFile(fileID) {
        this.removeFiles([fileID]);
    }
    pauseResume(fileID) {
        if (!this.getState().capabilities.resumableUploads ||
            this.getFile(fileID).progress.uploadComplete) {
            return undefined;
        }
        const file = this.getFile(fileID);
        const wasPaused = file.isPaused || false;
        const isPaused = !wasPaused;
        this.setFileState(fileID, {
            isPaused,
        });
        this.emit('upload-pause', file, isPaused);
        return isPaused;
    }
    pauseAll() {
        const updatedFiles = { ...this.getState().files };
        const inProgressUpdatedFiles = Object.keys(updatedFiles).filter((file) => {
            return (!updatedFiles[file].progress.uploadComplete &&
                updatedFiles[file].progress.uploadStarted);
        });
        inProgressUpdatedFiles.forEach((file) => {
            const updatedFile = { ...updatedFiles[file], isPaused: true };
            updatedFiles[file] = updatedFile;
        });
        this.setState({ files: updatedFiles });
        this.emit('pause-all');
    }
    resumeAll() {
        const updatedFiles = { ...this.getState().files };
        const inProgressUpdatedFiles = Object.keys(updatedFiles).filter((file) => {
            return (!updatedFiles[file].progress.uploadComplete &&
                updatedFiles[file].progress.uploadStarted);
        });
        inProgressUpdatedFiles.forEach((file) => {
            const updatedFile = {
                ...updatedFiles[file],
                isPaused: false,
                error: null,
            };
            updatedFiles[file] = updatedFile;
        });
        this.setState({ files: updatedFiles });
        this.emit('resume-all');
    }
    #getFilesToRetry() {
        const { files } = this.getState();
        return Object.keys(files).filter((fileId) => {
            const file = files[fileId];
            // Only retry files that have errors AND don't have missing required metadata
            return (file.error &&
                (!file.missingRequiredMetaFields ||
                    file.missingRequiredMetaFields.length === 0));
        });
    }
    async #doRetryAll() {
        const filesToRetry = this.#getFilesToRetry();
        const updatedFiles = { ...this.getState().files };
        filesToRetry.forEach((fileID) => {
            updatedFiles[fileID] = {
                ...updatedFiles[fileID],
                isPaused: false,
                error: null,
            };
        });
        this.setState({
            files: updatedFiles,
            error: null,
        });
        this.emit('retry-all', this.getFilesByIds(filesToRetry));
        if (filesToRetry.length === 0) {
            return {
                successful: [],
                failed: [],
            };
        }
        const uploadID = this.#createUpload(filesToRetry, {
            forceAllowNewUpload: true, // create new upload even if allowNewUpload: false
        });
        return this.#runUpload(uploadID);
    }
    async retryAll() {
        const result = await this.#doRetryAll();
        this.emit('complete', result);
        return result;
    }
    cancelAll() {
        this.emit('cancel-all');
        const { files } = this.getState();
        const fileIDs = Object.keys(files);
        if (fileIDs.length) {
            this.removeFiles(fileIDs);
        }
        this.setState(defaultUploadState);
    }
    retryUpload(fileID) {
        this.setFileState(fileID, {
            error: null,
            isPaused: false,
        });
        this.emit('upload-retry', this.getFile(fileID));
        const uploadID = this.#createUpload([fileID], {
            forceAllowNewUpload: true, // create new upload even if allowNewUpload: false
        });
        return this.#runUpload(uploadID);
    }
    logout() {
        this.iteratePlugins((plugin) => {
            plugin.provider?.logout?.();
        });
    }
    #handleUploadProgress = (file, progress) => {
        const fileInState = file ? this.getFile(file.id) : undefined;
        if (file == null || !fileInState) {
            this.log(`Not setting progress for a file that has been removed: ${file?.id}`);
            return;
        }
        if (fileInState.progress.percentage === 100) {
            this.log(`Not setting progress for a file that has been already uploaded: ${file.id}`);
            return;
        }
        const newProgress = {
            bytesTotal: progress.bytesTotal,
            // bytesTotal may be null or zero; in that case we can't divide by it
            percentage: progress.bytesTotal != null &&
                Number.isFinite(progress.bytesTotal) &&
                progress.bytesTotal > 0
                ? Math.round((progress.bytesUploaded / progress.bytesTotal) * 100)
                : undefined,
        };
        if (fileInState.progress.uploadStarted != null) {
            this.setFileState(file.id, {
                progress: {
                    ...fileInState.progress,
                    ...newProgress,
                    bytesUploaded: progress.bytesUploaded,
                },
            });
        }
        else {
            this.setFileState(file.id, {
                progress: {
                    ...fileInState.progress,
                    ...newProgress,
                },
            });
        }
        this.#updateTotalProgressThrottled();
    };
    #updateTotalProgress() {
        const totalProgress = this.#calculateTotalProgress();
        let totalProgressPercent = null;
        if (totalProgress != null) {
            totalProgressPercent = Math.round(totalProgress * 100);
            if (totalProgressPercent > 100)
                totalProgressPercent = 100;
            else if (totalProgressPercent < 0)
                totalProgressPercent = 0;
        }
        this.emit('progress', totalProgressPercent ?? 0);
        this.setState({
            totalProgress: totalProgressPercent ?? 0,
        });
    }
    // ___Why throttle at 500ms?
    //    - We must throttle at >250ms for superfocus in Dashboard to work well
    //    (because animation takes 0.25s, and we want to wait for all animations to be over before refocusing).
    //    [Practical Check]: if thottle is at 100ms, then if you are uploading a file,
    //    and click 'ADD MORE FILES', - focus won't activate in Firefox.
    //    - We must throttle at around >500ms to avoid performance lags.
    //    [Practical Check] Firefox, try to upload a big file for a prolonged period of time. Laptop will start to heat up.
    #updateTotalProgressThrottled = throttle$1(() => this.#updateTotalProgress(), 500, { leading: true, trailing: true });
    [Symbol.for('uppy test: updateTotalProgress')]() {
        return this.#updateTotalProgress();
    }
    #calculateTotalProgress() {
        // calculate total progress, using the number of files currently uploading,
        // between 0 and 1 and sum of individual progress of each file
        const files = this.getFiles();
        // note: also includes files that have completed uploading:
        const filesInProgress = files.filter((file) => {
            return (file.progress.uploadStarted ||
                file.progress.preprocess ||
                file.progress.postprocess);
        });
        if (filesInProgress.length === 0) {
            return 0;
        }
        if (filesInProgress.every((file) => file.progress.uploadComplete)) {
            // If every uploading file is complete, and we're still getting progress, it probably means
            // there's a bug somewhere in some progress reporting code (maybe not even our code)
            // and we're still getting progress, so let's just assume it means a 100% progress
            return 1;
        }
        const isSizedFile = (file) => file.progress.bytesTotal != null && file.progress.bytesTotal !== 0;
        const sizedFilesInProgress = filesInProgress.filter(isSizedFile);
        const unsizedFilesInProgress = filesInProgress.filter((file) => !isSizedFile(file));
        if (sizedFilesInProgress.every((file) => file.progress.uploadComplete) &&
            unsizedFilesInProgress.length > 0 &&
            !unsizedFilesInProgress.every((file) => file.progress.uploadComplete)) {
            // we are done with uploading all files of known size, however
            // there is at least one file with unknown size still uploading,
            // and we cannot say anything about their progress
            // In any case, return null because it doesn't make any sense to show a progress
            return null;
        }
        const totalFilesSize = sizedFilesInProgress.reduce((acc, file) => acc + (file.progress.bytesTotal ?? 0), 0);
        const totalUploadedSize = sizedFilesInProgress.reduce((acc, file) => acc + (file.progress.bytesUploaded || 0), 0);
        return totalFilesSize === 0 ? 0 : totalUploadedSize / totalFilesSize;
    }
    /**
     * Registers listeners for all global actions, like:
     * `error`, `file-removed`, `upload-progress`
     */
    #addListeners() {
        // Type inference only works for inline functions so we have to type it again
        const errorHandler = (error, file, response) => {
            let errorMsg = error.message || 'Unknown error';
            if (error.details) {
                errorMsg += `: ${error.details}`;
            }
            this.setState({ error: errorMsg });
            if (file != null && file.id in this.getState().files) {
                this.setFileState(file.id, {
                    error: errorMsg,
                    response,
                });
            }
        };
        this.on('error', errorHandler);
        this.on('upload-error', (file, error, response) => {
            if (typeof error === 'object' && error.message) {
                this.log(error.message, 'error');
                const newError = new Error(this.i18n('failedToUpload', { file: file?.name ?? '' })); // we may want a new custom error here
                newError.isUserFacing = true; // todo maybe don't do this with all errors?
                newError.details = error.message;
                if (error.details) {
                    newError.details += ` ${error.details}`;
                }
                // @ts-expect-error
                newError.request = error.request;
                this.emit('modify-upload-error', file, newError, response);
                this.#informAndEmit([newError]);
                errorHandler(newError, file, response);
            }
            else {
                this.emit('modify-upload-error', file, error, response);
                this.#informAndEmit([error]);
                errorHandler(error, file, response);
            }
        });
        let uploadStalledWarningRecentlyEmitted = null;
        this.on('upload-stalled', (error, files) => {
            const { message } = error;
            const details = files.map((file) => file.meta.name).join(', ');
            if (!uploadStalledWarningRecentlyEmitted) {
                this.info({ message, details }, 'warning', this.opts.infoTimeout);
                uploadStalledWarningRecentlyEmitted = setTimeout(() => {
                    uploadStalledWarningRecentlyEmitted = null;
                }, this.opts.infoTimeout);
            }
            this.log(`${message} ${details}`.trim(), 'warning');
        });
        this.on('upload', () => {
            this.setState({ error: null });
        });
        const onUploadStarted = (files) => {
            const filesFiltered = files.filter((file) => {
                const exists = file != null && this.getFile(file.id);
                if (!exists)
                    this.log(`Not setting progress for a file that has been removed: ${file?.id}`);
                return exists;
            });
            const filesState = Object.fromEntries(filesFiltered.map((file) => [
                file.id,
                {
                    progress: {
                        uploadStarted: Date.now(),
                        uploadComplete: false,
                        bytesUploaded: 0,
                        bytesTotal: file.size,
                    },
                },
            ]));
            this.patchFilesState(filesState);
        };
        this.on('upload-start', onUploadStarted);
        this.on('upload-progress', this.#handleUploadProgress);
        this.on('upload-success', (file, uploadResp) => {
            if (file == null || !this.getFile(file.id)) {
                this.log(`Not setting progress for a file that has been removed: ${file?.id}`);
                return;
            }
            const currentProgress = this.getFile(file.id).progress;
            this.setFileState(file.id, {
                progress: {
                    ...currentProgress,
                    postprocess: this.#postProcessors.size > 0
                        ? {
                            mode: 'indeterminate',
                        }
                        : undefined,
                    uploadComplete: true,
                    percentage: 100,
                    bytesUploaded: currentProgress.bytesTotal,
                },
                response: uploadResp,
                uploadURL: uploadResp.uploadURL,
                isPaused: false,
            });
            // Remote providers sometimes don't tell us the file size,
            // but we can know how many bytes we uploaded once the upload is complete.
            if (file.size == null) {
                this.setFileState(file.id, {
                    size: uploadResp.bytesUploaded || currentProgress.bytesTotal,
                });
            }
            this.#updateTotalProgressThrottled();
        });
        this.on('preprocess-progress', (file, progress) => {
            if (file == null || !this.getFile(file.id)) {
                this.log(`Not setting progress for a file that has been removed: ${file?.id}`);
                return;
            }
            this.setFileState(file.id, {
                progress: { ...this.getFile(file.id).progress, preprocess: progress },
            });
        });
        this.on('preprocess-complete', (file) => {
            if (file == null || !this.getFile(file.id)) {
                this.log(`Not setting progress for a file that has been removed: ${file?.id}`);
                return;
            }
            const files = { ...this.getState().files };
            files[file.id] = {
                ...files[file.id],
                progress: { ...files[file.id].progress },
            };
            delete files[file.id].progress.preprocess;
            this.setState({ files });
        });
        this.on('postprocess-progress', (file, progress) => {
            if (file == null || !this.getFile(file.id)) {
                this.log(`Not setting progress for a file that has been removed: ${file?.id}`);
                return;
            }
            this.setFileState(file.id, {
                progress: {
                    ...this.getState().files[file.id].progress,
                    postprocess: progress,
                },
            });
        });
        this.on('postprocess-complete', (file) => {
            if (file == null || !this.getFile(file.id)) {
                this.log(`Not setting progress for a file that has been removed: ${file?.id}`);
                return;
            }
            const files = {
                ...this.getState().files,
            };
            files[file.id] = {
                ...files[file.id],
                progress: {
                    ...files[file.id].progress,
                },
            };
            delete files[file.id].progress.postprocess;
            this.setState({ files });
        });
        this.on('restored', () => {
            // Files may have changed--ensure progress is still accurate.
            this.#updateTotalProgressThrottled();
        });
        // @ts-expect-error should fix itself when dashboard it typed (also this doesn't belong here)
        this.on('dashboard:file-edit-complete', (file) => {
            if (file) {
                this.#checkRequiredMetaFieldsOnFile(file);
            }
        });
        // show informer if offline
        if (typeof window !== 'undefined' && window.addEventListener) {
            window.addEventListener('online', this.#updateOnlineStatus);
            window.addEventListener('offline', this.#updateOnlineStatus);
            setTimeout(this.#updateOnlineStatus, 3000);
        }
    }
    updateOnlineStatus() {
        const online = window.navigator.onLine ?? true;
        if (!online) {
            this.emit('is-offline');
            this.info(this.i18n('noInternetConnection'), 'error', 0);
            this.wasOffline = true;
        }
        else {
            this.emit('is-online');
            if (this.wasOffline) {
                this.emit('back-online');
                this.info(this.i18n('connectedToInternet'), 'success', 3000);
                this.wasOffline = false;
            }
        }
    }
    #updateOnlineStatus = this.updateOnlineStatus.bind(this);
    getID() {
        return this.opts.id;
    }
    /**
     * Registers a plugin with Core.
     */
    use(Plugin, 
    // We want to let the plugin decide whether `opts` is optional or not
    // so we spread the argument rather than defining `opts:` ourselves.
    ...args) {
        if (typeof Plugin !== 'function') {
            const msg = `Expected a plugin class, but got ${Plugin === null ? 'null' : typeof Plugin}.` +
                ' Please verify that the plugin was imported and spelled correctly.';
            throw new TypeError(msg);
        }
        // Instantiate
        const plugin = new Plugin(this, ...args);
        const pluginId = plugin.id;
        if (!pluginId) {
            throw new Error('Your plugin must have an id');
        }
        if (!plugin.type) {
            throw new Error('Your plugin must have a type');
        }
        const existsPluginAlready = this.getPlugin(pluginId);
        if (existsPluginAlready) {
            const msg = `Already found a plugin named '${existsPluginAlready.id}'. ` +
                `Tried to use: '${pluginId}'.\n` +
                'Uppy plugins must have unique `id` options.';
            throw new Error(msg);
        }
        // @ts-expect-error does exist
        if (Plugin.VERSION) {
            // @ts-expect-error does exist
            this.log(`Using ${pluginId} v${Plugin.VERSION}`);
        }
        if (plugin.type in this.#plugins) {
            this.#plugins[plugin.type].push(plugin);
        }
        else {
            this.#plugins[plugin.type] = [plugin];
        }
        this.#installingPlugin = pluginId;
        plugin.install();
        this.#installingPlugin = undefined;
        this.emit('plugin-added', plugin);
        return this;
    }
    /**
     * Find one Plugin by name.
     */
    getPlugin(id) {
        for (const plugins of Object.values(this.#plugins)) {
            const foundPlugin = plugins.find((plugin) => plugin.id === id);
            if (foundPlugin != null)
                return foundPlugin;
        }
        return undefined;
    }
    [Symbol.for('uppy test: getPlugins')](type) {
        return this.#plugins[type];
    }
    /**
     * Iterate through all `use`d plugins.
     *
     */
    iteratePlugins(method) {
        Object.values(this.#plugins).flat(1).forEach(method);
    }
    /**
     * Uninstall and remove a plugin.
     *
     * @param {object} instance The plugin instance to remove.
     */
    removePlugin(instance) {
        this.log(`Removing plugin ${instance.id}`);
        this.emit('plugin-remove', instance);
        if (instance.uninstall) {
            instance.uninstall();
        }
        const list = this.#plugins[instance.type];
        // list.indexOf failed here, because Vue3 converted the plugin instance
        // to a Proxy object, which failed the strict comparison test:
        // obj !== objProxy
        const index = list.findIndex((item) => item.id === instance.id);
        if (index !== -1) {
            list.splice(index, 1);
        }
        const state = this.getState();
        const updatedState = {
            plugins: {
                ...state.plugins,
                [instance.id]: undefined,
            },
        };
        this.setState(updatedState);
    }
    /**
     * Uninstall all plugins and close down this Uppy instance.
     */
    destroy() {
        this.log(`Closing Uppy instance ${this.opts.id}: removing all files and uninstalling plugins`);
        this.cancelAll();
        this.#storeUnsubscribe();
        this.iteratePlugins((plugin) => {
            this.removePlugin(plugin);
        });
        if (typeof window !== 'undefined' && window.removeEventListener) {
            window.removeEventListener('online', this.#updateOnlineStatus);
            window.removeEventListener('offline', this.#updateOnlineStatus);
        }
    }
    hideInfo() {
        const { info } = this.getState();
        this.setState({ info: info.slice(1) });
        this.emit('info-hidden');
    }
    /**
     * Set info message in `state.info`, so that UI plugins like `Informer`
     * can display the message.
     */
    info(message, type = 'info', duration = 3000) {
        const isComplexMessage = typeof message === 'object';
        this.setState({
            info: [
                ...this.getState().info,
                {
                    type,
                    message: isComplexMessage ? message.message : message,
                    details: isComplexMessage ? message.details : null,
                },
            ],
        });
        setTimeout(() => this.hideInfo(), duration);
        this.emit('info-visible');
    }
    /**
     * Passes messages to a function, provided in `opts.logger`.
     * If `opts.logger: Uppy.debugLogger` or `opts.debug: true`, logs to the browser console.
     */
    log(message, type) {
        const { logger } = this.opts;
        switch (type) {
            case 'error':
                logger.error(message);
                break;
            case 'warning':
                logger.warn(message);
                break;
            default:
                logger.debug(message);
                break;
        }
    }
    // We need to store request clients by a unique ID, so we can share RequestClient instances across files
    // this allows us to do rate limiting and synchronous operations like refreshing provider tokens
    // example: refreshing tokens: if each file has their own requestclient,
    // we don't have any way to synchronize all requests in order to
    // - block all requests
    // - refresh the token
    // - unblock all requests and allow them to run with a the new access token
    // back when we had a requestclient per file, once an access token expired,
    // all 6 files would go ahead and refresh the token at the same time
    // (calling /refresh-token up to 6 times), which will probably fail for some providers
    #requestClientById = new Map();
    registerRequestClient(id, client) {
        this.#requestClientById.set(id, client);
    }
    /** @protected */
    getRequestClientForFile(file) {
        if (!file.remote)
            throw new Error(`Tried to get RequestClient for a non-remote file ${file.id}`);
        const requestClient = this.#requestClientById.get(file.remote.requestClientId);
        if (requestClient == null)
            throw new Error(`requestClientId "${file.remote.requestClientId}" not registered for file "${file.id}"`);
        return requestClient;
    }
    /**
     * Restore an upload by its ID.
     */
    async restore(uploadID) {
        this.log(`Core: attempting to restore upload "${uploadID}"`);
        if (!this.getState().currentUploads[uploadID]) {
            this.#removeUpload(uploadID);
            throw new Error('Nonexistent upload');
        }
        const result = await this.#runUpload(uploadID);
        this.emit('complete', result);
        return result;
    }
    /**
     * Create an upload for a bunch of files.
     *
     */
    #createUpload(fileIDs, opts = {}) {
        // uppy.retryAll sets this to true — when retrying we want to ignore `allowNewUpload: false`
        const { forceAllowNewUpload = false } = opts;
        const { allowNewUpload, currentUploads } = this.getState();
        if (!allowNewUpload && !forceAllowNewUpload) {
            throw new Error('Cannot create a new upload: already uploading.');
        }
        const uploadID = nanoid();
        this.emit('upload', uploadID, this.getFilesByIds(fileIDs));
        this.setState({
            allowNewUpload: this.opts.allowMultipleUploadBatches !== false &&
                this.opts.allowMultipleUploads !== false,
            currentUploads: {
                ...currentUploads,
                [uploadID]: {
                    fileIDs,
                    step: 0,
                    result: {},
                },
            },
        });
        return uploadID;
    }
    [Symbol.for('uppy test: createUpload')](...args) {
        // @ts-expect-error https://github.com/microsoft/TypeScript/issues/47595
        return this.#createUpload(...args);
    }
    #getUpload(uploadID) {
        const { currentUploads } = this.getState();
        return currentUploads[uploadID];
    }
    /**
     * Add data to an upload's result object.
     */
    addResultData(uploadID, data) {
        if (!this.#getUpload(uploadID)) {
            this.log(`Not setting result for an upload that has been removed: ${uploadID}`);
            return;
        }
        const { currentUploads } = this.getState();
        const currentUpload = {
            ...currentUploads[uploadID],
            result: { ...currentUploads[uploadID].result, ...data },
        };
        this.setState({
            currentUploads: { ...currentUploads, [uploadID]: currentUpload },
        });
    }
    /**
     * Remove an upload, eg. if it has been canceled or completed.
     *
     */
    #removeUpload(uploadID) {
        const currentUploads = { ...this.getState().currentUploads };
        delete currentUploads[uploadID];
        this.setState({
            currentUploads,
        });
    }
    /**
     * Run an upload. This picks up where it left off in case the upload is being restored.
     */
    async #runUpload(uploadID) {
        const getCurrentUpload = () => {
            const { currentUploads } = this.getState();
            return currentUploads[uploadID];
        };
        let currentUpload = getCurrentUpload();
        const steps = [
            ...this.#preProcessors,
            ...this.#uploaders.keys(),
            ...this.#postProcessors,
        ];
        try {
            for (let step = currentUpload.step || 0; step < steps.length; step++) {
                if (!currentUpload) {
                    break;
                }
                const fn = steps[step];
                this.setState({
                    currentUploads: {
                        ...this.getState().currentUploads,
                        [uploadID]: {
                            ...currentUpload,
                            step,
                        },
                    },
                });
                const { fileIDs } = currentUpload;
                let uploaderFileIds = fileIDs;
                const uploaderPlugin = this.#uploaders.get(fn);
                if (uploaderPlugin) {
                    const files = this.getFilesByIds(uploaderFileIds);
                    uploaderFileIds = files
                        .filter((file) => file.plugins?.includes(uploaderPlugin) ||
                        file.plugins?.length === 0)
                        .map((file) => file.id);
                }
                // TODO give this the `updatedUpload` object as its only parameter maybe?
                // Otherwise when more metadata may be added to the upload this would keep getting more parameters
                await fn(uploaderFileIds, uploadID);
                // Update currentUpload value in case it was modified asynchronously.
                currentUpload = getCurrentUpload();
            }
        }
        catch (err) {
            this.#removeUpload(uploadID);
            throw err;
        }
        // Set result data.
        if (currentUpload) {
            // Mark postprocessing step as complete if necessary; this addresses a case where we might get
            // stuck in the postprocessing UI while the upload is fully complete.
            // If the postprocessing steps do not do any work, they may not emit postprocessing events at
            // all, and never mark the postprocessing as complete. This is fine on its own but we
            // introduced code in the @uppy/core upload-success handler to prepare postprocessing progress
            // state if any postprocessors are registered. That is to avoid a "flash of completed state"
            // before the postprocessing plugins can emit events.
            //
            // So, just in case an upload with postprocessing plugins *has* completed *without* emitting
            // postprocessing completion, we do it instead.
            currentUpload.fileIDs.forEach((fileID) => {
                const file = this.getFile(fileID);
                if (file?.progress.postprocess) {
                    this.emit('postprocess-complete', file);
                }
            });
            const files = currentUpload.fileIDs.map((fileID) => this.getFile(fileID));
            const successful = files.filter((file) => !file.error);
            const failed = files.filter((file) => file.error);
            this.addResultData(uploadID, { successful, failed, uploadID });
            // Update currentUpload value in case it was modified asynchronously.
            currentUpload = getCurrentUpload();
        }
        // Emit completion events.
        // This is in a separate function so that the `currentUploads` variable
        // always refers to the latest state. In the handler right above it refers
        // to an outdated object without the `.result` property.
        let result;
        if (currentUpload) {
            result = currentUpload.result;
            this.#removeUpload(uploadID);
        }
        if (result == null) {
            this.log(`Not setting result for an upload that has been removed: ${uploadID}`);
            result = {
                successful: [],
                failed: [],
                uploadID,
            };
        }
        return result;
    }
    /**
     * Start an upload for all the files that are not currently being uploaded.
     */
    async upload() {
        if (!this.#plugins.uploader?.length) {
            this.log('No uploader type plugins are used', 'warning');
        }
        let { files } = this.getState();
        // retry any failed files from a previous upload() call
        const filesToRetry = this.#getFilesToRetry();
        if (filesToRetry.length > 0) {
            const retryResult = await this.#doRetryAll(); // we don't want the complete event to fire
            const hasNewFiles = this.getFiles().filter((file) => file.progress.uploadStarted == null)
                .length > 0;
            // if no new files, make it idempotent and return
            if (!hasNewFiles) {
                this.emit('complete', retryResult);
                return retryResult;
            }
            ({ files } = this.getState());
        }
        // If no files to retry, proceed with original upload() behavior for new files
        const onBeforeUploadResult = this.opts.onBeforeUpload(files);
        if (onBeforeUploadResult === false) {
            return Promise.reject(new Error('Not starting the upload because onBeforeUpload returned false'));
        }
        if (onBeforeUploadResult && typeof onBeforeUploadResult === 'object') {
            files = onBeforeUploadResult;
            // Updating files in state, because uploader plugins receive file IDs,
            // and then fetch the actual file object from state
            this.setState({
                files,
            });
        }
        return Promise.resolve()
            .then(() => this.#restricter.validateMinNumberOfFiles(files))
            .catch((err) => {
            this.#informAndEmit([err]);
            throw err;
        })
            .then(() => {
            if (!this.#checkRequiredMetaFields(files)) {
                throw new RestrictionError(this.i18n('missingRequiredMetaField'));
            }
        })
            .catch((err) => {
            // Doing this in a separate catch because we already emited and logged
            // all the errors in `checkRequiredMetaFields` so we only throw a generic
            // missing fields error here.
            throw err;
        })
            .then(async () => {
            const { currentUploads } = this.getState();
            // get a list of files that are currently assigned to uploads
            const currentlyUploadingFiles = Object.values(currentUploads).flatMap((curr) => curr.fileIDs);
            const waitingFileIDs = [];
            Object.keys(files).forEach((fileID) => {
                const file = this.getFile(fileID);
                // if the file hasn't started uploading and hasn't already been assigned to an upload..
                if (!file.progress.uploadStarted &&
                    currentlyUploadingFiles.indexOf(fileID) === -1) {
                    waitingFileIDs.push(file.id);
                }
            });
            const uploadID = this.#createUpload(waitingFileIDs);
            const result = await this.#runUpload(uploadID);
            this.emit('complete', result);
            return result;
        })
            .catch((err) => {
            this.emit('error', err);
            this.log(err, 'error');
            throw err;
        });
    }
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
const version$3 = '3.7.8';
/**
 * @deprecated use lowercase `version`.
 */
const VERSION = version$3;
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
const encode$1 = (src, urlsafe = false) => urlsafe
    ? _mkUriSafe(_encode(src))
    : _encode(src);
/**
 * converts a UTF-8-encoded string to URL-safe Base64 RFC4648 §5.
 * @returns {string} Base64 string
 */
const encodeURI = (src) => encode$1(src, true);
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
    _add('toBase64', function (urlsafe) { return encode$1(this, urlsafe); });
    _add('toBase64URI', function () { return encode$1(this, true); });
    _add('toBase64URL', function () { return encode$1(this, true); });
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
    version: version$3,
    VERSION: VERSION,
    atob: _atob,
    atobPolyfill: atobPolyfill,
    btoa: _btoa,
    btoaPolyfill: btoaPolyfill,
    fromBase64: decode$1,
    toBase64: encode$1,
    encode: encode$1,
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
function encode(input) {
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

      key = encode(key);
      value = encode(value);

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

const URL = /*@__PURE__*/getDefaultExportFromCjs(urlParse);

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
var defaultOptions$3 = {
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
  return new URL(link, origin).toString();
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
BaseUpload.defaultOptions = defaultOptions$3;

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
      return new Request(method, url);
    }
  }, {
    key: "getName",
    value: function getName() {
      return 'XHRHttpStack';
    }
  }]);
}();
var Request = /*#__PURE__*/function () {
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
          resolve(new Response(_this._xhr));
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
var Response = /*#__PURE__*/function () {
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
var defaultOptions$2 = _objectSpread(_objectSpread({}, BaseUpload.defaultOptions), {}, {
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
    options = _objectSpread(_objectSpread({}, defaultOptions$2), options);
    return _callSuper(this, Upload, [file, options]);
  }
  _inherits(Upload, _BaseUpload);
  return _createClass(Upload, null, [{
    key: "terminate",
    value: function terminate(url) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options = _objectSpread(_objectSpread({}, defaultOptions$2), options);
      return BaseUpload.terminate(url, options);
    }
  }]);
}(BaseUpload); // Note: We don't reference `window` here because these classes also exist in a Web Worker's context.

const version$2 = "5.0.1";
const packageJson$2 = {
  version: version$2};

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
            return defaultOptions$2.fingerprint(file, options);
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
const defaultOptions$1 = {
    limit: 20,
    retryDelays: tusDefaultOptions.retryDelays,
    withCredentials: false,
    allowedMetaFields: true,
};
/**
 * Tus resumable file uploader
 */
class Tus extends BasePlugin {
    static VERSION = packageJson$2.version;
    #retryDelayIterator;
    requests;
    uploaders;
    uploaderEvents;
    constructor(uppy, opts) {
        super(uppy, { ...defaultOptions$1, ...opts });
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

const version$1 = "5.0.1";
const packageJson$1 = {
  version: version$1};

const locale = {
    strings: {
        // Shown in the Informer if an upload is being canceled because it stalled for too long.
        uploadStalled: 'Upload has not made any progress for %{seconds} seconds. You may want to retry it.',
    },
};

function buildResponseError(xhr, err) {
    let error = err;
    // No error message
    if (!error)
        error = new Error('Upload error');
    // Got an error message string
    if (typeof error === 'string')
        error = new Error(error);
    // Got something else
    if (!(error instanceof Error)) {
        error = Object.assign(new Error('Upload error'), { data: error });
    }
    if (isNetworkError(xhr)) {
        error = new NetworkError(error, xhr);
        return error;
    }
    // @ts-expect-error request can only be set on NetworkError
    // but we use NetworkError to distinguish between errors.
    error.request = xhr;
    return error;
}
/**
 * Set `data.type` in the blob to `file.meta.type`,
 * because we might have detected a more accurate file type in Uppy
 * https://stackoverflow.com/a/50875615
 */
function setTypeInBlob(file) {
    const dataWithUpdatedType = file.data.slice(0, file.data.size, file.meta.type);
    return dataWithUpdatedType;
}
const defaultOptions = {
    formData: true,
    fieldName: 'file',
    method: 'post',
    allowedMetaFields: true,
    bundle: false,
    headers: {},
    timeout: 30 * 1000,
    limit: 5,
    withCredentials: false,
    responseType: '',
};
class XHRUpload extends BasePlugin {
    static VERSION = packageJson$1.version;
    #getFetcher;
    requests;
    uploaderEvents;
    constructor(uppy, opts) {
        super(uppy, {
            ...defaultOptions,
            fieldName: opts.bundle ? 'files[]' : 'file',
            ...opts,
        });
        this.type = 'uploader';
        this.id = this.opts.id || 'XHRUpload';
        this.defaultLocale = locale;
        this.i18nInit();
        // Simultaneous upload limiting is shared across all uploads with this plugin.
        if (internalRateLimitedQueue in this.opts) {
            // @ts-ignore untyped internal
            this.requests = this.opts[internalRateLimitedQueue];
        }
        else {
            this.requests = new RateLimitedQueue(this.opts.limit);
        }
        if (this.opts.bundle && !this.opts.formData) {
            throw new Error('`opts.formData` must be true when `opts.bundle` is enabled.');
        }
        if (this.opts.bundle && typeof this.opts.headers === 'function') {
            throw new Error('`opts.headers` can not be a function when the `bundle: true` option is set.');
        }
        if (opts?.allowedMetaFields === undefined && 'metaFields' in this.opts) {
            throw new Error('The `metaFields` option has been renamed to `allowedMetaFields`.');
        }
        this.uploaderEvents = Object.create(null);
        /**
         * xhr-upload wrapper for `fetcher` to handle user options
         * `validateStatus`, `getResponseError`, `getResponseData`
         * and to emit `upload-progress`, `upload-error`, and `upload-success` events.
         */
        this.#getFetcher = (files) => {
            return async (url, options) => {
                try {
                    const res = await fetcher(url, {
                        ...options,
                        onBeforeRequest: (xhr, retryCount) => this.opts.onBeforeRequest?.(xhr, retryCount, files),
                        shouldRetry: this.opts.shouldRetry,
                        onAfterResponse: this.opts.onAfterResponse,
                        onTimeout: (timeout) => {
                            const seconds = Math.ceil(timeout / 1000);
                            const error = new Error(this.i18n('uploadStalled', { seconds }));
                            this.uppy.emit('upload-stalled', error, files);
                        },
                        onUploadProgress: (event) => {
                            if (event.lengthComputable) {
                                for (const { id } of files) {
                                    const file = this.uppy.getFile(id);
                                    this.uppy.emit('upload-progress', file, {
                                        uploadStarted: file.progress.uploadStarted ?? 0,
                                        bytesUploaded: (event.loaded / event.total) * file.size,
                                        bytesTotal: file.size,
                                    });
                                }
                            }
                        },
                    });
                    let body = await this.opts.getResponseData?.(res);
                    if (res.responseType === 'json') {
                        body ??= res.response;
                    }
                    else {
                        try {
                            body ??= JSON.parse(res.responseText);
                        }
                        catch (cause) {
                            throw new Error('@uppy/xhr-upload expects a JSON response (with a `url` property). To parse non-JSON responses, use `getResponseData` to turn your response into JSON.', { cause });
                        }
                    }
                    const uploadURL = typeof body?.url === 'string' ? body.url : undefined;
                    for (const { id } of files) {
                        this.uppy.emit('upload-success', this.uppy.getFile(id), {
                            status: res.status,
                            body,
                            uploadURL,
                        });
                    }
                    return res;
                }
                catch (error) {
                    if (error.name === 'AbortError') {
                        return undefined;
                    }
                    const request = error.request;
                    for (const file of files) {
                        this.uppy.emit('upload-error', this.uppy.getFile(file.id), buildResponseError(request, error), request);
                    }
                    throw error;
                }
            };
        };
    }
    getOptions(file) {
        const overrides = this.uppy.getState().xhrUpload;
        const { headers } = this.opts;
        const opts = {
            ...this.opts,
            ...(overrides || {}),
            ...(file.xhrUpload || {}),
            headers: {},
        };
        // Support for `headers` as a function, only in the XHRUpload settings.
        // Options set by other plugins in Uppy state or on the files themselves are still merged in afterward.
        //
        // ```js
        // headers: (file) => ({ expires: file.meta.expires })
        // ```
        if (typeof headers === 'function') {
            opts.headers = headers(file);
        }
        else {
            Object.assign(opts.headers, this.opts.headers);
        }
        if (overrides) {
            Object.assign(opts.headers, overrides.headers);
        }
        if (file.xhrUpload) {
            Object.assign(opts.headers, file.xhrUpload.headers);
        }
        return opts;
    }
    addMetadata(formData, meta, opts) {
        const allowedMetaFields = getAllowedMetaFields(opts.allowedMetaFields, meta);
        allowedMetaFields.forEach((item) => {
            const value = meta[item];
            if (Array.isArray(value)) {
                // In this case we don't transform `item` to add brackets, it's up to
                // the user to add the brackets so it won't be overridden.
                value.forEach((subItem) => formData.append(item, subItem));
            }
            else {
                formData.append(item, value);
            }
        });
    }
    createFormDataUpload(file, opts) {
        const formPost = new FormData();
        this.addMetadata(formPost, file.meta, opts);
        const dataWithUpdatedType = setTypeInBlob(file);
        if (file.name) {
            formPost.append(opts.fieldName, dataWithUpdatedType, file.meta.name);
        }
        else {
            formPost.append(opts.fieldName, dataWithUpdatedType);
        }
        return formPost;
    }
    createBundledUpload(files, opts) {
        const formPost = new FormData();
        const { meta } = this.uppy.getState();
        this.addMetadata(formPost, meta, opts);
        files.forEach((file) => {
            const options = this.getOptions(file);
            const dataWithUpdatedType = setTypeInBlob(file);
            if (file.name) {
                formPost.append(options.fieldName, dataWithUpdatedType, file.name);
            }
            else {
                formPost.append(options.fieldName, dataWithUpdatedType);
            }
        });
        return formPost;
    }
    async #uploadLocalFile(file) {
        const events = new EventManager(this.uppy);
        const controller = new AbortController();
        const uppyFetch = this.requests.wrapPromiseFunction(async () => {
            const opts = this.getOptions(file);
            const fetch = this.#getFetcher([file]);
            const body = opts.formData
                ? this.createFormDataUpload(file, opts)
                : file.data;
            const endpoint = typeof opts.endpoint === 'string'
                ? opts.endpoint
                : await opts.endpoint(file);
            return fetch(endpoint, {
                ...opts,
                body,
                signal: controller.signal,
            });
        });
        events.onFileRemove(file.id, () => controller.abort());
        events.onCancelAll(file.id, () => {
            controller.abort();
        });
        try {
            await uppyFetch().abortOn(controller.signal);
        }
        catch (error) {
            // TODO: create formal error with name 'AbortError' (this comes from RateLimitedQueue)
            if (error.message !== 'Cancelled') {
                throw error;
            }
        }
        finally {
            events.remove();
        }
    }
    async #uploadBundle(files) {
        const controller = new AbortController();
        const uppyFetch = this.requests.wrapPromiseFunction(async () => {
            const optsFromState = this.uppy.getState().xhrUpload ?? {};
            const fetch = this.#getFetcher(files);
            const body = this.createBundledUpload(files, {
                ...this.opts,
                ...optsFromState,
            });
            const endpoint = typeof this.opts.endpoint === 'string'
                ? this.opts.endpoint
                : await this.opts.endpoint(files);
            return fetch(endpoint, {
                // headers can't be a function with bundle: true
                ...this.opts,
                body,
                signal: controller.signal,
            });
        });
        function abort() {
            controller.abort();
        }
        // We only need to abort on cancel all because
        // individual cancellations are not possible with bundle: true
        this.uppy.once('cancel-all', abort);
        try {
            await uppyFetch().abortOn(controller.signal);
        }
        catch (error) {
            // TODO: create formal error with name 'AbortError' (this comes from RateLimitedQueue)
            if (error.message !== 'Cancelled') {
                throw error;
            }
        }
        finally {
            this.uppy.off('cancel-all', abort);
        }
    }
    #getCompanionClientArgs(file) {
        const opts = this.getOptions(file);
        const allowedMetaFields = getAllowedMetaFields(opts.allowedMetaFields, file.meta);
        return {
            ...file.remote?.body,
            protocol: 'multipart',
            endpoint: opts.endpoint,
            size: file.data.size,
            fieldname: opts.fieldName,
            metadata: Object.fromEntries(allowedMetaFields.map((name) => [name, file.meta[name]])),
            httpMethod: opts.method,
            useFormData: opts.formData,
            headers: opts.headers,
        };
    }
    async #uploadFiles(files) {
        await Promise.allSettled(files.map((file) => {
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
            this.uppy.log('[XHRUpload] No files to upload!');
            return;
        }
        // No limit configured by the user, and no RateLimitedQueue passed in by a "parent" plugin
        // (basically just AwsS3) using the internal symbol
        // @ts-ignore untyped internal
        if (this.opts.limit === 0 && !this.opts[internalRateLimitedQueue]) {
            this.uppy.log('[XHRUpload] When uploading multiple files at once, consider setting the `limit` option (to `10` for example), to limit the number of concurrent uploads, which helps prevent memory and network issues: https://uppy.io/docs/xhr-upload/#limit-0', 'warning');
        }
        this.uppy.log('[XHRUpload] Uploading...');
        const files = this.uppy.getFilesByIds(fileIDs);
        const filesFiltered = filterNonFailedFiles(files);
        const filesToEmit = filterFilesToEmitUploadStarted(filesFiltered);
        this.uppy.emit('upload-start', filesToEmit);
        if (this.opts.bundle) {
            // if bundle: true, we don’t support remote uploads
            const isSomeFileRemote = filesFiltered.some((file) => file.isRemote);
            if (isSomeFileRemote) {
                throw new Error('Can’t upload remote files when the `bundle: true` option is set');
            }
            if (typeof this.opts.headers === 'function') {
                throw new TypeError('`headers` may not be a function when the `bundle: true` option is set');
            }
            await this.#uploadBundle(filesFiltered);
        }
        else {
            await this.#uploadFiles(filesFiltered);
        }
    };
    install() {
        if (this.opts.bundle) {
            const { capabilities } = this.uppy.getState();
            this.uppy.setState({
                capabilities: {
                    ...capabilities,
                    individualCancellation: false,
                },
            });
        }
        this.uppy.addUploader(this.#handleUpload);
    }
    uninstall() {
        if (this.opts.bundle) {
            const { capabilities } = this.uppy.getState();
            this.uppy.setState({
                capabilities: {
                    ...capabilities,
                    individualCancellation: true,
                },
            });
        }
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
  getUploadLimit() {
    return this.#uploadLimit;
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
      id: plugin.name,
      uploadManager: this
      // Pass upload manager instance
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
      this.#uploadLimit = uploadLimitResponse?.data?.limit;
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
        const allFiles = this.#uppy.getFiles();
        const folderFiles = allFiles.filter((f) => {
          const webkitRelativePath = f.data.webkitRelativePath || "";
          return webkitRelativePath.startsWith(`${folderName}/`);
        });
        const totalSize = folderFiles.reduce((sum, f) => sum + (f.size ?? 0), 0) + (file.size ?? 0);
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
          size: totalSize,
          // Use the calculated total size
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

export { DEFAULT_AVATAR_CONFIG, Manager, XHRUpload, createLargeFilePlugin, createSmallFilePlugin };
