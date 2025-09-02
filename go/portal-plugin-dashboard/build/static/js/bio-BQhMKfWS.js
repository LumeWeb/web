import { commonjsGlobal, getDefaultExportFromCjs, jsxRuntimeExports, core_dashboard__loadShare__react__loadShare__, core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__ } from './jsx-runtime-D_0QkpWj.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__-CFuxgGnQ.js';
import { core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__-DOYraqnS.js';
import { Card } from './Card-BAALvr3c.js';
import { createLucideIcon } from './createLucideIcon-BcyKBqCx.js';
import { format } from './format-CT9KiSuR.js';

/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$3 = [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }]
];
const Calendar = createLucideIcon("calendar", __iconNode$3);

/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$2 = [
  [
    "path",
    {
      d: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",
      key: "1tc9qg"
    }
  ],
  ["circle", { cx: "12", cy: "13", r: "3", key: "1vg3eu" }]
];
const Camera = createLucideIcon("camera", __iconNode$2);

/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$1 = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]];
const Check = createLucideIcon("check", __iconNode$1);

/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode = [
  ["path", { d: "M12 3v12", key: "1x0j5s" }],
  ["path", { d: "m17 8-5-5-5 5", key: "7q97r8" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }]
];
const Upload = createLucideIcon("upload", __iconNode);

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

const version$3 = "4.3.2";
const packageJson$3 = {
  version: version$3};

/**
 * Default store that keeps state in a simple object.
 */
class DefaultStore {
    static VERSION = packageJson$3.version;
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

const version$2 = "4.5.3";
const packageJson$2 = {
  version: version$2};

function getFileName(fileType, fileDescriptor) {
    if (fileDescriptor.name) {
        return fileDescriptor.name;
    }
    if (fileType.split('/')[0] === 'image') {
        return `${fileType.split('/')[0]}.${fileType.split('/')[1]}`;
    }
    return 'noname';
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

const defaultOptions$1 = {
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
    static VERSION = packageJson$2.version;
    #plugins = Object.create(null);
    #restricter;
    #storeUnsubscribe;
    #emitter = ee();
    #preProcessors = new Set();
    #uploaders = new Set();
    #postProcessors = new Set();
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
            restrictions: defaultOptions$1,
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
        this.#uploaders.add(fn);
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
                errorMsg += ` ${error.details}`;
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
            errorHandler(error, file, response);
            if (typeof error === 'object' && error.message) {
                this.log(error.message, 'error');
                const newError = new Error(this.i18n('failedToUpload', { file: file?.name ?? '' })); // we may want a new custom error here
                newError.isUserFacing = true; // todo maybe don't do this with all errors?
                newError.details = error.message;
                if (error.details) {
                    newError.details += ` ${error.details}`;
                }
                this.#informAndEmit([newError]);
            }
            else {
                this.#informAndEmit([error]);
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
        plugin.install();
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
    restore(uploadID) {
        this.log(`Core: attempting to restore upload "${uploadID}"`);
        if (!this.getState().currentUploads[uploadID]) {
            this.#removeUpload(uploadID);
            return Promise.reject(new Error('Nonexistent upload'));
        }
        return this.#runUpload(uploadID);
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
            ...this.#uploaders,
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
                // TODO give this the `updatedUpload` object as its only parameter maybe?
                // Otherwise when more metadata may be added to the upload this would keep getting more parameters
                await fn(fileIDs, uploadID);
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

const version$1 = "4.0.0";
const packageJson$1 = {
  version: version$1};

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
    static VERSION = packageJson$1.version;
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

function getAllowedMetaFields(fields, meta) {
    if (fields === true) {
        return Object.keys(meta);
    }
    if (Array.isArray(fields)) {
        return fields;
    }
    return [];
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

const version = "4.4.2";
const packageJson = {
  version};

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
    static VERSION = packageJson.version;
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

const ENDPOINT = "/api/account/avatar";
const AvatarUploadContext = core_dashboard__loadShare__react__loadShare__.createContext(null);
function AvatarUpload({
  currentAvatar,
  onSuccess,
  userName
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarUploadProvider, { onSuccess, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarUploadUI, { currentAvatar, userName }) });
}
function AvatarDisplay({
  currentAvatar,
  previewUrl,
  userName
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Avatar, { className: "h-20 w-20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.AvatarImage,
      {
        alt: userName || "User avatar",
        src: previewUrl || currentAvatar
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.AvatarFallback, { className: "bg-primary text-primary-foreground text-xl", children: userName?.trim().charAt(0)?.toUpperCase() || "?" })
  ] }) });
}
function AvatarUploadProvider({
  children,
  onSuccess
}) {
  const [uploading, setUploading] = core_dashboard__loadShare__react__loadShare__.useState(false);
  const [uploadProgress, setUploadProgress] = core_dashboard__loadShare__react__loadShare__.useState(0);
  const [previewUrl, setPreviewUrl] = core_dashboard__loadShare__react__loadShare__.useState(null);
  const fileInputRef = core_dashboard__loadShare__react__loadShare__.useRef(null);
  const containerRef = core_dashboard__loadShare__react__loadShare__.useRef(null);
  const { open } = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useNotification();
  const successTimerRef = core_dashboard__loadShare__react__loadShare__.useRef(null);
  const uppyRef = core_dashboard__loadShare__react__loadShare__.useRef(null);
  const apiUrl = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.useApiUrl();
  const apiDomain = new URL(apiUrl).hostname;
  const apiProto = new URL(apiUrl).protocol;
  const resetState = () => {
    if (uppyRef.current) {
      uppyRef.current.clear();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (previewUrl) {
      try {
        URL.revokeObjectURL(previewUrl);
      } catch {
      }
    }
    setPreviewUrl(null);
    setUploadProgress(0);
  };
  core_dashboard__loadShare__react__loadShare__.useEffect(() => {
    return () => {
      if (previewUrl) {
        try {
          URL.revokeObjectURL(previewUrl);
        } catch {
        }
      }
    };
  }, [previewUrl]);
  core_dashboard__loadShare__react__loadShare__.useEffect(() => {
    uppyRef.current = new Uppy({
      autoProceed: true,
      restrictions: {
        allowedFileTypes: [
          "image/png",
          "image/jpeg",
          "image/webp",
          "image/gif"
        ],
        maxFileSize: 5 * 1024 * 1024,
        // 5MB
        maxNumberOfFiles: 1
      }
    }).use(XHRUpload, {
      endpoint: `${apiProto}//account.${apiDomain}${ENDPOINT}`,
      fieldName: "file",
      formData: true,
      method: "POST",
      responseType: "json",
      timeout: 3e4,
      withCredentials: true
    }).use(DropTarget, {
      target: containerRef.current
    });
    return () => {
      if (successTimerRef.current !== null) {
        clearTimeout(successTimerRef.current);
        successTimerRef.current = null;
      }
      if (uppyRef.current) {
        uppyRef.current.destroy();
      }
    };
  }, [apiProto, apiUrl, containerRef]);
  core_dashboard__loadShare__react__loadShare__.useEffect(() => {
    if (!uppyRef.current) return;
    const handleFileAdded = (file) => {
      setUploading(true);
      const url = URL.createObjectURL(file.data);
      setPreviewUrl(url);
    };
    const handleUploadProgress = (file, progress) => {
      const percentage = progress.bytesTotal > 0 ? progress.bytesUploaded / progress.bytesTotal * 100 : 0;
      setUploadProgress(percentage);
    };
    const handleUploadSuccess = async (file, response) => {
      try {
        setUploadProgress(100);
        successTimerRef.current = window.setTimeout(() => {
          setUploading(false);
          resetState();
          onSuccess();
          open?.({
            description: "Your profile picture has been updated successfully",
            message: "Profile Updated",
            type: "success"
          });
        }, 500);
      } catch (err) {
        console.error("Upload success handler error:", err);
        setUploading(false);
        resetState();
        open?.({
          description: "Failed to process profile picture. Please try again.",
          message: "Processing Error",
          type: "error"
        });
      }
    };
    const handleUploadError = (file, err) => {
      console.error("Upload error:", err);
      setUploading(false);
      setUploadProgress(0);
      resetState();
      open?.({
        description: err.message || "An error occurred while uploading your profile picture",
        message: "Upload Failed",
        type: "error"
      });
    };
    const handleRestrictionFailed = (file, err) => {
      resetState();
      open?.({
        description: "The selected file is invalid: " + err.message,
        message: "Invalid File",
        type: "error"
      });
    };
    uppyRef.current.on("file-added", handleFileAdded);
    uppyRef.current.on("upload-progress", handleUploadProgress);
    uppyRef.current.on("upload-success", handleUploadSuccess);
    uppyRef.current.on("upload-error", handleUploadError);
    uppyRef.current.on("restriction-failed", handleRestrictionFailed);
    return () => {
      if (uppyRef.current) {
        uppyRef.current.off("file-added", handleFileAdded);
        uppyRef.current.off("upload-progress", handleUploadProgress);
        uppyRef.current.off("upload-success", handleUploadSuccess);
        uppyRef.current.off("upload-error", handleUploadError);
        uppyRef.current.off("restriction-failed", handleRestrictionFailed);
      }
    };
  }, [onSuccess, open]);
  const handleFileInput = (e) => {
    if (e.target.files?.[0] && uppyRef.current) {
      const file = e.target.files[0];
      try {
        uppyRef.current.addFile({
          data: file,
          name: file.name,
          type: file.type
        });
      } catch (err) {
        console.error("Error adding file to Uppy:", err);
        open?.({
          description: "Error with the selected file: " + err.message,
          message: "File Error",
          type: "error"
        });
      }
      e.target.value = null;
    }
  };
  const handleFileButtonClick = (e) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    AvatarUploadContext.Provider,
    {
      value: {
        containerRef,
        fileInputRef,
        handleFileButtonClick,
        handleFileInput,
        previewUrl,
        uploading,
        uploadProgress
      },
      children
    }
  );
}
function AvatarUploadUI({
  currentAvatar,
  userName
}) {
  const {
    containerRef,
    fileInputRef,
    handleFileButtonClick,
    handleFileInput,
    previewUrl,
    uploading,
    uploadProgress
  } = useAvatarUpload();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AvatarDisplay,
      {
        currentAvatar,
        previewUrl,
        userName
      }
    ),
    !uploading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "aria-label": "Upload profile picture. Press Enter, Space, or click to choose a file, or drag and drop an image.",
        className: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn(
          "rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          "border-muted hover:border-muted/50"
        ),
        onClick: handleFileButtonClick,
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleFileButtonClick(e);
          }
        },
        ref: containerRef,
        role: "button",
        tabIndex: 0,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              accept: "image/*",
              className: "hidden",
              onChange: handleFileInput,
              ref: fileInputRef,
              type: "file"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "text-muted-foreground mx-auto mb-4 h-8 w-8" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground mb-2", children: "Drag and drop your image here" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-4 text-sm", children: "or" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, { variant: "default", children: "Choose File" })
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(UploadProgress, { uploadProgress })
  ] });
}
function UploadProgress({ uploadProgress }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground text-sm", children: "Uploading..." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground text-sm", children: [
          Math.round(uploadProgress),
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Progress, { className: "h-2", value: uploadProgress })
    ] }),
    uploadProgress === 100 && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "text-success h-5 w-5" })
  ] }) });
}
function useAvatarUpload() {
  const context = core_dashboard__loadShare__react__loadShare__.useContext(AvatarUploadContext);
  if (!context) {
    throw new Error(
      "useAvatarUpload must be used within an AvatarUploadProvider"
    );
  }
  return context;
}

function uploadAvatarDialogConfig(userName, currentAvatar, onSuccess) {
  return {
    content: /* @__PURE__ */ jsxRuntimeExports.jsx(
      AvatarUpload,
      {
        currentAvatar,
        onSuccess,
        userName
      }
    ),
    title: "Update Profile Picture",
    type: "custom"
  };
}

function Bio() {
  const { data: identity, refetch } = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useGetIdentity();
  const { avatarUrl, displayName } = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.useAvatar();
  const { closeDialog, openDialog } = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.useDialog();
  if (!identity) {
    return null;
  }
  const handleAvatarUpdate = () => {
    refetch?.();
    closeDialog();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Avatar, { className: "h-24 w-24", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.AvatarImage, { alt: displayName, src: avatarUrl }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.AvatarFallback, { className: "bg-primary text-primary-foreground text-2xl", children: identity.firstName?.charAt(0) || identity.lastName?.charAt(0) || "?" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button,
        {
          className: "absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0",
          onClick: () => openDialog(
            uploadAvatarDialogConfig(
              displayName,
              avatarUrl,
              handleAvatarUpdate
            )
          ),
          size: "sm",
          variant: "secondary",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-4 w-4" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-foreground text-lg font-semibold", children: displayName }),
      identity.verified && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-success flex h-5 w-5 items-center justify-center rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "text-success-foreground h-3 w-3" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground mt-4 flex w-full flex-col gap-2 text-sm", children: identity.created_at && (() => {
      try {
        const createdDate = new Date(identity.created_at);
        if (isNaN(createdDate.getTime())) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Account created ",
            format(createdDate, "MMMM yyyy")
          ] })
        ] });
      } catch {
        return null;
      }
    })() })
  ] }) });
}

export { Bio as default };
