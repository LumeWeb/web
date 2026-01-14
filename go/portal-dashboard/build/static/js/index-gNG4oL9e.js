import { React3, dashboard__loadShare__react__loadShare__ } from './dashboard__loadShare__react__loadShare__-A-_ogCU6.js';
import { dashboard__mf_v__runtimeInit__mf_v__, index_cjs } from './dashboard__mf_v__runtimeInit__mf_v__-CrvQyIUV.js';
import { MapCache, Symbol as Symbol$1, isArray as isArray$4, isArguments, getNative, isLength, isFunction, isObjectLike, root, arrayMap, isSymbol, isObject, ListCache, Map, eq, baseGetTag, freeGlobal, isIndex, toSource, baseGet, isKey, toKey, get } from './isLength-BjcVZakP.js';
import './_commonjsHelpers-BILit0S-.js';

const FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+:\d+/;
const CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+:\d+|\(native\))/m;
const SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code\])?$/;
function parse$2(error, options) {
  if (typeof error.stacktrace !== "undefined" || typeof error["opera#sourceloc"] !== "undefined")
    return parseOpera(error);
  else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP))
    return parseV8OrIE(error);
  else if (error.stack)
    return parseFFOrSafari(error);
  else throw new Error("Cannot parse given Error object");
}
function extractLocation(urlLike) {
  if (!urlLike.includes(":"))
    return [urlLike, undefined, undefined];
  const regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/;
  const parts = regExp.exec(urlLike.replace(/[()]/g, ""));
  return [parts[1], parts[2] || undefined, parts[3] || undefined];
}
function applySlice(lines, options) {
  return lines;
}
function parseV8OrIE(error, options) {
  return parseV8OrIeString(error.stack);
}
function parseV8OrIeString(stack, options) {
  const filtered = applySlice(
    stack.split("\n").filter((line) => {
      return !!line.match(CHROME_IE_STACK_REGEXP);
    }));
  return filtered.map((line) => {
    if (line.includes("(eval ")) {
      line = line.replace(/eval code/g, "eval").replace(/(\(eval at [^()]*)|(,.*$)/g, "");
    }
    let sanitizedLine = line.replace(/^\s+/, "").replace(/\(eval code/g, "(").replace(/^.*?\s+/, "");
    const location = sanitizedLine.match(/ (\(.+\)$)/);
    sanitizedLine = location ? sanitizedLine.replace(location[0], "") : sanitizedLine;
    const locationParts = extractLocation(location ? location[1] : sanitizedLine);
    const functionName = location && sanitizedLine || undefined;
    const fileName = ["eval", "<anonymous>"].includes(locationParts[0]) ? undefined : locationParts[0];
    return {
      function: functionName,
      file: fileName,
      line: locationParts[1] ? +locationParts[1] : undefined,
      col: locationParts[2] ? +locationParts[2] : undefined,
      raw: line
    };
  });
}
function parseFFOrSafari(error, options) {
  return parseFFOrSafariString(error.stack);
}
function parseFFOrSafariString(stack, options) {
  const filtered = applySlice(
    stack.split("\n").filter((line) => {
      return !line.match(SAFARI_NATIVE_CODE_REGEXP);
    }));
  return filtered.map((line) => {
    if (line.includes(" > eval"))
      line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ":$1");
    if (!line.includes("@") && !line.includes(":")) {
      return {
        function: line
      };
    } else {
      const functionNameRegex = /(([^\n\r"\u2028\u2029]*".[^\n\r"\u2028\u2029]*"[^\n\r@\u2028\u2029]*(?:@[^\n\r"\u2028\u2029]*"[^\n\r@\u2028\u2029]*)*(?:[\n\r\u2028\u2029][^@]*)?)?[^@]*)@/;
      const matches = line.match(functionNameRegex);
      const functionName = matches && matches[1] ? matches[1] : undefined;
      const locationParts = extractLocation(line.replace(functionNameRegex, ""));
      return {
        function: functionName,
        file: locationParts[0],
        line: locationParts[1] ? +locationParts[1] : undefined,
        col: locationParts[2] ? +locationParts[2] : undefined,
        raw: line
      };
    }
  });
}
function parseOpera(e, options) {
  if (!e.stacktrace || e.message.includes("\n") && e.message.split("\n").length > e.stacktrace.split("\n").length)
    return parseOpera9(e);
  else if (!e.stack)
    return parseOpera10(e);
  else
    return parseOpera11(e);
}
function parseOpera9(e, options) {
  const lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
  const lines = e.message.split("\n");
  const result = [];
  for (let i = 2, len = lines.length; i < len; i += 2) {
    const match = lineRE.exec(lines[i]);
    if (match) {
      result.push({
        file: match[2],
        line: +match[1],
        raw: lines[i]
      });
    }
  }
  return applySlice(result);
}
function parseOpera10(e, options) {
  const lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
  const lines = e.stacktrace.split("\n");
  const result = [];
  for (let i = 0, len = lines.length; i < len; i += 2) {
    const match = lineRE.exec(lines[i]);
    if (match) {
      result.push({
        function: match[3] || undefined,
        file: match[2],
        line: match[1] ? +match[1] : undefined,
        raw: lines[i]
      });
    }
  }
  return applySlice(result);
}
function parseOpera11(error, options) {
  const filtered = applySlice(
    // @ts-expect-error missing stack property
    error.stack.split("\n").filter((line) => {
      return !!line.match(FIREFOX_SAFARI_STACK_REGEXP) && !line.match(/^Error created at/);
    }));
  return filtered.map((line) => {
    const tokens = line.split("@");
    const locationParts = extractLocation(tokens.pop());
    const functionCall = tokens.shift() || "";
    const functionName = functionCall.replace(/<anonymous function(: (\w+))?>/, "$2").replace(/\([^)]*\)/g, "") || undefined;
    let argsRaw;
    if (functionCall.match(/\(([^)]*)\)/))
      argsRaw = functionCall.replace(/^[^(]+\(([^)]*)\)$/, "$1");
    const args = argsRaw === undefined || argsRaw === "[arguments not available]" ? undefined : argsRaw.split(",");
    return {
      function: functionName,
      args,
      file: locationParts[0],
      line: locationParts[1] ? +locationParts[1] : undefined,
      col: locationParts[2] ? +locationParts[2] : undefined,
      raw: line
    };
  });
}

function stackframesLiteToStackframes(liteStackframes) {
  return liteStackframes.map((liteStackframe) => {
    return {
      functionName: liteStackframe.function,
      args: liteStackframe.args,
      fileName: liteStackframe.file,
      lineNumber: liteStackframe.line,
      columnNumber: liteStackframe.col,
      source: liteStackframe.raw
    };
  });
}
function parse$1(error, options) {
  return stackframesLiteToStackframes(parse$2(error));
}

var c=(t=>(t.RELOAD="devtools:reload",t.DEVTOOLS_INIT="devtools:init",t.DEVTOOLS_ALREADY_CONNECTED="devtools:already-connected",t.ACTIVITY="devtools:send-activity",t.DEVTOOLS_ACTIVITY_UPDATE="devtools:activity-update",t.DEVTOOLS_CONNECTED_APP="devtools:connected-app",t.DEVTOOLS_DISCONNECTED_APP="devtools:disconnected-app",t.DEVTOOLS_HIGHLIGHT_IN_MONITOR="devtools:highlight-in-monitor",t.DEVTOOLS_HIGHLIGHT_IN_MONITOR_ACTION="devtools:highlight-in-monitor-action",t.DEVTOOLS_LOGIN_SUCCESS="devtools:login-success",t.DEVTOOLS_DISPLAY_LOGIN_FAILURE="devtools:display-login-failure",t.DEVTOOLS_LOGIN_FAILURE="devtools:login-failure",t.DEVTOOLS_RELOAD_AFTER_LOGIN="devtools:reload-after-login",t.DEVTOOLS_INVALIDATE_QUERY="devtools:invalidate-query",t.DEVTOOLS_INVALIDATE_QUERY_ACTION="devtools:invalidate-query-action",t))(c||{});var T$1={useCan:"access-control",useLog:"audit-log",useLogList:"audit-log",useCreate:"data",useCreateMany:"data",useCustom:"data",useCustomMutation:"data",useDelete:"data",useDeleteMany:"data",useInfiniteList:"data",useList:"data",useMany:"data",useOne:"data",useUpdate:"data",useUpdateMany:"data",useForgotPassword:"auth",useGetIdentity:"auth",useIsAuthenticated:"auth",useLogin:"auth",useLogout:"auth",useOnError:"auth",usePermissions:"auth",useRegister:"auth",useUpdatePassword:"auth"};Object.entries(T$1).reduce((e,[o,s])=>(e[s]||(e[s]=[]),e[s].push(o),e),{});async function d$1(e,o,s){if(e.readyState!==e.OPEN){await new Promise(n=>{let r=()=>{e.send(JSON.stringify({event:o,payload:s})),n(),e.removeEventListener("open",r);};e.addEventListener("open",r);});return}e.send(JSON.stringify({event:o,payload:s}));}var p$1=React3.createContext({__devtools:false,httpUrl:"http://localhost:5001",wsUrl:"ws://localhost:5001",ws:null});function _(e,o,s){let n=r=>{let{event:i,payload:y}=JSON.parse(r.data);o===i&&s(y);};return e.addEventListener("message",n),()=>{e.removeEventListener("message",n);}}

var T = "renderWithHooks", y = (r) => {
  let e = r.findIndex((n) => n.functionName === T);
  return e !== -1 ? r.slice(0, e) : r;
};
var f = /\/refine\/packages\/(?<name>.*?)\//;
var d = (r) => r ? !!r.match(f) : false;
var m = (r) => {
  var o;
  if (!r) return;
  let e = r.match(f), n = (o = e == null ? void 0 : e.groups) == null ? void 0 : o.name;
  if (n) return `@refinedev/${n}`;
};
function p(r) {
  try {
    let e = new Error(), n = parse$1(e);
    return y(n).map((t) => ({ file: t.fileName, line: t.lineNumber, column: t.columnNumber, function: t.functionName, isRefine: d(t.fileName), packageName: m(t.fileName) })).filter((t) => t.function).filter((t) => !(r != null && r.includes(t.function ?? ""))).slice(1);
  } catch {
    return [];
  }
}
var E = (r, e) => {
  if (T$1[r] === "auth") return null;
  if (r === "useCan") return e ? "key[1].resource" : "key[1]";
  if (T$1[r] === "audit-log") return r === "useLog" ? "variables.resource" : "key[1]";
  if (T$1[r] === "data") {
    if (r === "useCustom" || r === "useCustomMutation") return null;
    switch (r) {
      case "useList":
      case "useInfiniteList":
      case "useOne":
      case "useMany":
        return e ? "key[1]" : "key[2]";
      case "useCreate":
      case "useCreateMany":
      case "useDelete":
      case "useDeleteMany":
      case "useUpdate":
      case "useUpdateMany":
        return "variables.resource";
    }
  }
  return null;
};
function k(r, e, n, o) {
  let s = p(o).slice(1), t = E(r, e);
  return { hookName: r, trace: s, resourcePath: t, legacyKey: e, resourceName: n };
}
var l = (r, e) => {
  let n = e == null ? void 0 : e.map((s) => `${s.file}:${s.line}:${s.column}#${s.function}-${s.packageName}-${s.isRefine ? 1 : 0}`);
  return JSON.stringify([...r ?? [], ...n ?? []]);
};
var g = (r) => (e) => {
  var o;
  if (!((o = e == null ? void 0 : e.meta) != null && o.trace)) return;
  let n = e == null ? void 0 : e.meta;
  new Promise((s) => {
    var t, a;
    d$1(r, c.ACTIVITY, { type: "mutation", identifier: l(e == null ? void 0 : e.options.mutationKey, (t = e == null ? void 0 : e.meta) == null ? void 0 : t.trace), key: e == null ? void 0 : e.options.mutationKey, status: e == null ? void 0 : e.state.status, state: e == null ? void 0 : e.state, variables: (a = e == null ? void 0 : e.state) == null ? void 0 : a.variables, ...n }), s();
  });
}, R = (r) => (e) => {
  var o;
  if (!((o = e == null ? void 0 : e.meta) != null && o.trace)) return;
  let n = e == null ? void 0 : e.meta;
  new Promise((s) => {
    var t;
    d$1(r, c.ACTIVITY, { type: "query", identifier: l(e.queryKey, (t = e.meta) == null ? void 0 : t.trace), key: e.queryKey, status: e.state.status, state: e.state, ...n }), s();
  });
};
var C = (r) => {
  let { ws: e } = dashboard__loadShare__react__loadShare__.useContext(p$1), n = React3.useRef(), o = React3.useRef();
  return React3.useEffect(() => {
    if (!e) return () => 0;
    let s = r.getQueryCache(), t = R(e);
    return s.getAll().forEach(t), n.current = s.subscribe(({ query: a, type: c }) => (c === "added" || c === "updated") && t(a)), () => {
      var a;
      (a = n.current) == null || a.call(n);
    };
  }, [e, r]), React3.useEffect(() => {
    if (!e) return () => 0;
    let s = r.getMutationCache(), t = g(e);
    return s.getAll().forEach(t), o.current = s.subscribe(({ mutation: a, type: c }) => (c === "added" || c === "updated") && t(a)), () => {
      var a;
      (a = o.current) == null || a.call(o);
    };
  }, [e, r]), React3.useEffect(() => e ? _(e, c.DEVTOOLS_INVALIDATE_QUERY_ACTION, ({ queryKey: t }) => {
    t && r.invalidateQueries(t);
  }) : () => 0, [e, r]), {};
};

// dev uses dynamic import to separate chunks
    
    const {loadShare} = index_cjs;
    const {initPromise} = dashboard__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(_ => loadShare("@tanstack/react-query", {
    customShareInfo: {shareConfig:{
      singleton: true,
      strictVersion: false,
      requiredVersion: "^4.36.1"
    }}}));
    const exportModule = await res.then(factory => factory());
    var dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__ = exportModule;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values == null ? 0 : values.length;

  this.__data__ = new MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (-1);

  while ((++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */
function baseIsNaN(value) {
  return value !== value;
}

/**
 * A specialized version of `_.indexOf` which performs strict equality
 * comparisons of values, i.e. `===`.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function strictIndexOf(array, value, fromIndex) {
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  return value === value
    ? strictIndexOf(array, value, fromIndex)
    : baseFindIndex(array, baseIsNaN, fromIndex);
}

/**
 * A specialized version of `_.includes` for arrays without support for
 * specifying an index to search from.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludes(array, value) {
  var length = array == null ? 0 : array.length;
  return !!length && baseIndexOf(array, value, 0) > -1;
}

/**
 * This function is like `arrayIncludes` except that it accepts a comparator.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @param {Function} comparator The comparator invoked per element.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludesWith(array, value, comparator) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (comparator(value, array[index])) {
      return true;
    }
  }
  return false;
}

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/**
 * Checks if a `cache` value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE$2 = 200;

/**
 * The base implementation of methods like `_.difference` without support
 * for excluding multiple arrays or iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Array} values The values to exclude.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new array of filtered values.
 */
function baseDifference(array, values, iteratee, comparator) {
  var index = -1,
      includes = arrayIncludes,
      isCommon = true,
      length = array.length,
      result = [],
      valuesLength = values.length;

  if (!length) {
    return result;
  }
  if (comparator) {
    includes = arrayIncludesWith;
    isCommon = false;
  }
  else if (values.length >= LARGE_ARRAY_SIZE$2) {
    includes = cacheHas;
    isCommon = false;
    values = new SetCache(values);
  }
  outer:
  while (++index < length) {
    var value = array[index],
        computed = value ;

    value = (comparator || value !== 0) ? value : 0;
    if (isCommon && computed === computed) {
      var valuesIndex = valuesLength;
      while (valuesIndex--) {
        if (values[valuesIndex] === computed) {
          continue outer;
        }
      }
      result.push(value);
    }
    else if (!includes(values, computed, comparator)) {
      result.push(value);
    }
  }
  return result;
}

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

/** Built-in value references. */
var spreadableSymbol = Symbol$1 ? Symbol$1.isConcatSpreadable : undefined;

/**
 * Checks if `value` is a flattenable `arguments` object or array.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
 */
function isFlattenable(value) {
  return isArray$4(value) || isArguments(value) ||
    !!(spreadableSymbol && value && value[spreadableSymbol]);
}

/**
 * The base implementation of `_.flatten` with support for restricting flattening.
 *
 * @private
 * @param {Array} array The array to flatten.
 * @param {number} depth The maximum recursion depth.
 * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
 * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
 * @param {Array} [result=[]] The initial result value.
 * @returns {Array} Returns the new flattened array.
 */
function baseFlatten(array, depth, predicate, isStrict, result) {
  var index = -1,
      length = array.length;

  predicate || (predicate = isFlattenable);
  result || (result = []);

  while (++index < length) {
    var value = array[index];
    if (predicate(value)) {
      {
        arrayPush(result, value);
      }
    }
  }
  return result;
}

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax$3 = Math.max;

/**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */
function overRest(func, start, transform) {
  start = nativeMax$3(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax$3(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}

/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant(value) {
  return function() {
    return value;
  };
}

var defineProperty = (function() {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var baseSetToString = !defineProperty ? identity : function(func, string) {
  return defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant(string),
    'writable': true
  });
};

/** Used to detect hot functions by number of calls within a span of milliseconds. */
var HOT_COUNT = 800,
    HOT_SPAN = 16;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeNow = Date.now;

/**
 * Creates a function that'll short out and invoke `identity` instead
 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
 * milliseconds.
 *
 * @private
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new shortable function.
 */
function shortOut(func) {
  var count = 0,
      lastCalled = 0;

  return function() {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);

    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}

/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var setToString = shortOut(baseSetToString);

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  return setToString(overRest(func, start, identity), func + '');
}

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Gets the last element of `array`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to query.
 * @returns {*} Returns the last element of `array`.
 * @example
 *
 * _.last([1, 2, 3]);
 * // => 3
 */
function last(array) {
  var length = array == null ? 0 : array.length;
  return length ? array[length - 1] : undefined;
}

/**
 * This method is like `_.difference` except that it accepts `comparator`
 * which is invoked to compare elements of `array` to `values`. The order and
 * references of result values are determined by the first array. The comparator
 * is invoked with two arguments: (arrVal, othVal).
 *
 * **Note:** Unlike `_.pullAllWith`, this method returns a new array.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {...Array} [values] The values to exclude.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new array of filtered values.
 * @example
 *
 * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
 *
 * _.differenceWith(objects, [{ 'x': 1, 'y': 2 }], _.isEqual);
 * // => [{ 'x': 2, 'y': 1 }]
 */
var differenceWith = baseRest(function(array, values) {
  var comparator = last(values);
  if (isArrayLikeObject(comparator)) {
    comparator = undefined;
  }
  return isArrayLikeObject(array)
    ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject), undefined, comparator)
    : [];
});

/* Built-in method references that are verified to be native. */
var Set$1 = getNative(root, 'Set');

/**
 * This method returns `undefined`.
 *
 * @static
 * @memberOf _
 * @since 2.3.0
 * @category Util
 * @example
 *
 * _.times(2, _.noop);
 * // => [undefined, undefined]
 */
function noop() {
  // No operation performed.
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/** Used as references for various `Number` constants. */
var INFINITY$1 = 1 / 0;

/**
 * Creates a set object of `values`.
 *
 * @private
 * @param {Array} values The values to add to the set.
 * @returns {Object} Returns the new set.
 */
var createSet = !(Set$1 && (1 / setToArray(new Set$1([,-0]))[1]) == INFINITY$1) ? noop : function(values) {
  return new Set$1(values);
};

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE$1 = 200;

/**
 * The base implementation of `_.uniqBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 */
function baseUniq(array, iteratee, comparator) {
  var index = -1,
      includes = arrayIncludes,
      length = array.length,
      isCommon = true,
      result = [],
      seen = result;

  if (comparator) {
    isCommon = false;
    includes = arrayIncludesWith;
  }
  else if (length >= LARGE_ARRAY_SIZE$1) {
    var set = iteratee ? null : createSet(array);
    if (set) {
      return setToArray(set);
    }
    isCommon = false;
    includes = cacheHas;
    seen = new SetCache;
  }
  else {
    seen = iteratee ? [] : result;
  }
  outer:
  while (++index < length) {
    var value = array[index],
        computed = iteratee ? iteratee(value) : value;

    value = (comparator || value !== 0) ? value : 0;
    if (isCommon && computed === computed) {
      var seenIndex = seen.length;
      while (seenIndex--) {
        if (seen[seenIndex] === computed) {
          continue outer;
        }
      }
      if (iteratee) {
        seen.push(computed);
      }
      result.push(value);
    }
    else if (!includes(seen, computed, comparator)) {
      if (seen !== result) {
        seen.push(computed);
      }
      result.push(value);
    }
  }
  return result;
}

/**
 * This method is like `_.union` except that it accepts `comparator` which
 * is invoked to compare elements of `arrays`. Result values are chosen from
 * the first array in which the value occurs. The comparator is invoked
 * with two arguments: (arrVal, othVal).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Array
 * @param {...Array} [arrays] The arrays to inspect.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new array of combined values.
 * @example
 *
 * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
 * var others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }];
 *
 * _.unionWith(objects, others, _.isEqual);
 * // => [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }, { 'x': 1, 'y': 1 }]
 */
var unionWith = baseRest(function(arrays) {
  var comparator = last(arrays);
  comparator = typeof comparator == 'function' ? comparator : undefined;
  return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject), undefined, comparator);
});

const replace = String.prototype.replace;
const percentTwenties = /%20/g;

const Format = {
  RFC1738: 'RFC1738',
  RFC3986: 'RFC3986',
};

const formatters = {
  RFC1738: function (value) {
    return replace.call(value, percentTwenties, '+')
  },
  RFC3986: function (value) {
    return String(value)
  },
};
const RFC1738 = Format.RFC1738;

const formats = Format.RFC3986;

const has$2 = Object.prototype.hasOwnProperty;
const isArray$3 = Array.isArray;

const hexTable = (function () {
  const array = [];
  for (let i = 0; i < 256; ++i) {
    array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
  }

  return array
})();

const compactQueue = function compactQueue(queue) {
  while (queue.length > 1) {
    const item = queue.pop();
    const obj = item.obj[item.prop];

    if (isArray$3(obj)) {
      const compacted = [];

      for (let j = 0; j < obj.length; ++j) {
        if (typeof obj[j] !== 'undefined') {
          compacted.push(obj[j]);
        }
      }

      item.obj[item.prop] = compacted;
    }
  }
};

const arrayToObject = function arrayToObject(source, options) {
  const obj = options && options.plainObjects ? Object.create(null) : {};
  for (let i = 0; i < source.length; ++i) {
    if (typeof source[i] !== 'undefined') {
      obj[i] = source[i];
    }
  }

  return obj
};

const merge = function merge(target, source, options) {
  /* eslint no-param-reassign: 0 */
  if (!source) {
    return target
  }

  if (typeof source !== 'object') {
    if (isArray$3(target)) {
      target.push(source);
    } else if (target && typeof target === 'object') {
      if (
        (options && (options.plainObjects || options.allowPrototypes)) ||
        !has$2.call(Object.prototype, source)
      ) {
        target[source] = true;
      }
    } else {
      return [target, source]
    }

    return target
  }

  if (!target || typeof target !== 'object') {
    return [target].concat(source)
  }

  let mergeTarget = target;
  if (isArray$3(target) && !isArray$3(source)) {
    mergeTarget = arrayToObject(target, options);
  }

  if (isArray$3(target) && isArray$3(source)) {
    source.forEach(function (item, i) {
      if (has$2.call(target, i)) {
        const targetItem = target[i];
        if (targetItem && typeof targetItem === 'object' && item && typeof item === 'object') {
          target[i] = merge(targetItem, item, options);
        } else {
          target.push(item);
        }
      } else {
        target[i] = item;
      }
    });
    return target
  }

  return Object.keys(source).reduce(function (acc, key) {
    const value = source[key];

    if (has$2.call(acc, key)) {
      acc[key] = merge(acc[key], value, options);
    } else {
      acc[key] = value;
    }
    return acc
  }, mergeTarget)
};

const decode = function (str, decoder, charset) {
  const strWithoutPlus = str.replace(/\+/g, ' ');
  if (charset === 'iso-8859-1') {
    // unescape never throws, no try...catch needed:
    return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape)
  }
  // utf-8
  try {
    return decodeURIComponent(strWithoutPlus)
  } catch (e) {
    return strWithoutPlus
  }
};

const limit = 1024;

const encode$1 = function encode(str, defaultEncoder, charset, kind, format) {
  // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
  // It has been adapted here for stricter adherence to RFC 3986
  if (str.length === 0) {
    return str
  }

  let string = str;
  if (typeof str === 'symbol') {
    string = Symbol.prototype.toString.call(str);
  } else if (typeof str !== 'string') {
    string = String(str);
  }

  if (charset === 'iso-8859-1') {
    return escape(string).replace(/%u[0-9a-f]{4}/gi, function ($0) {
      return '%26%23' + parseInt($0.slice(2), 16) + '%3B'
    })
  }

  let out = '';
  for (let j = 0; j < string.length; j += limit) {
    const segment = string.length >= limit ? string.slice(j, j + limit) : string;
    const arr = [];

    for (let i = 0; i < segment.length; ++i) {
      let c = segment.charCodeAt(i);
      if (
        c === 0x2d || // -
        c === 0x2e || // .
        c === 0x5f || // _
        c === 0x7e || // ~
        (c >= 0x30 && c <= 0x39) || // 0-9
        (c >= 0x41 && c <= 0x5a) || // a-z
        (c >= 0x61 && c <= 0x7a) || // A-Z
        (format === RFC1738 && (c === 0x28 || c === 0x29)) // ( )
      ) {
        arr[arr.length] = segment.charAt(i);
        continue
      }

      if (c < 0x80) {
        arr[arr.length] = hexTable[c];
        continue
      }

      if (c < 0x800) {
        arr[arr.length] = hexTable[0xc0 | (c >> 6)] + hexTable[0x80 | (c & 0x3f)];
        continue
      }

      if (c < 0xd800 || c >= 0xe000) {
        arr[arr.length] =
          hexTable[0xe0 | (c >> 12)] +
          hexTable[0x80 | ((c >> 6) & 0x3f)] +
          hexTable[0x80 | (c & 0x3f)];
        continue
      }

      i += 1;
      c = 0x10000 + (((c & 0x3ff) << 10) | (segment.charCodeAt(i) & 0x3ff));

      arr[arr.length] =
        hexTable[0xf0 | (c >> 18)] +
        hexTable[0x80 | ((c >> 12) & 0x3f)] +
        hexTable[0x80 | ((c >> 6) & 0x3f)] +
        hexTable[0x80 | (c & 0x3f)];
    }

    out += arr.join('');
  }

  return out
};

const compact = function compact(value) {
  const queue = [{ obj: { o: value }, prop: 'o' }];
  const refs = [];

  for (let i = 0; i < queue.length; ++i) {
    const item = queue[i];
    const obj = item.obj[item.prop];

    const keys = Object.keys(obj);
    for (let j = 0; j < keys.length; ++j) {
      const key = keys[j];
      const val = obj[key];
      if (typeof val === 'object' && val !== null && refs.indexOf(val) === -1) {
        queue.push({ obj: obj, prop: key });
        refs.push(val);
      }
    }
  }

  compactQueue(queue);

  return value
};

const isRegExp = function isRegExp(obj) {
  return Object.prototype.toString.call(obj) === '[object RegExp]'
};

const isBuffer$1 = function isBuffer(obj) {
  if (!obj || typeof obj !== 'object') {
    return false
  }

  return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj))
};

const combine = function combine(a, b) {
  return [].concat(a, b)
};

const maybeMap = function maybeMap(val, fn) {
  if (isArray$3(val)) {
    const mapped = [];
    for (let i = 0; i < val.length; i += 1) {
      mapped.push(fn(val[i]));
    }
    return mapped
  }
  return fn(val)
};

const has$1 = Object.prototype.hasOwnProperty;

const arrayPrefixGenerators = {
  brackets: function brackets(prefix) {
    return prefix + '[]'
  },
  comma: 'comma',
  indices: function indices(prefix, key) {
    return prefix + '[' + key + ']'
  },
  repeat: function repeat(prefix) {
    return prefix
  },
};

const isArray$2 = Array.isArray;
const push = Array.prototype.push;
const pushToArray = function (arr, valueOrArray) {
  push.apply(arr, isArray$2(valueOrArray) ? valueOrArray : [valueOrArray]);
};

const toISO = Date.prototype.toISOString;

const defaultFormat = formats;
const defaults$1 = {
  addQueryPrefix: false,
  allowDots: false,
  allowEmptyArrays: false,
  arrayFormat: 'indices',
  charset: 'utf-8',
  charsetSentinel: false,
  delimiter: '&',
  encode: true,
  encodeDotInKeys: false,
  encoder: encode$1,
  encodeValuesOnly: false,
  format: defaultFormat,
  formatter: formatters[defaultFormat],
  // deprecated
  indices: false,
  serializeDate: function serializeDate(date) {
    return toISO.call(date)
  },
  skipNulls: false,
  strictNullHandling: false,
};

const isNonNullishPrimitive = function isNonNullishPrimitive(v) {
  return (
    typeof v === 'string' ||
    typeof v === 'number' ||
    typeof v === 'boolean' ||
    typeof v === 'symbol' ||
    typeof v === 'bigint'
  )
};

const sentinel = {};

const _stringify = function stringify(
  object,
  prefix,
  generateArrayPrefix,
  commaRoundTrip,
  allowEmptyArrays,
  strictNullHandling,
  skipNulls,
  encodeDotInKeys,
  encoder,
  filter,
  sort,
  allowDots,
  serializeDate,
  format,
  formatter,
  encodeValuesOnly,
  charset,
  sideChannel,
) {
  let obj = object;

  let tmpSc = sideChannel;
  let step = 0;
  let findFlag = false;
  while ((tmpSc = tmpSc.get(sentinel)) !== void 0 && !findFlag) {
    // Where object last appeared in the ref tree
    const pos = tmpSc.get(object);
    step += 1;
    if (typeof pos !== 'undefined') {
      if (pos === step) {
        throw new RangeError('Cyclic object value')
      } else {
        findFlag = true; // Break while
      }
    }
    if (typeof tmpSc.get(sentinel) === 'undefined') {
      step = 0;
    }
  }

  if (typeof filter === 'function') {
    obj = filter(prefix, obj);
  } else if (obj instanceof Date) {
    obj = serializeDate(obj);
  } else if (generateArrayPrefix === 'comma' && isArray$2(obj)) {
    obj = maybeMap(obj, function (value) {
      if (value instanceof Date) {
        return serializeDate(value)
      }
      return value
    });
  }

  if (obj === null) {
    if (strictNullHandling) {
      return encoder && !encodeValuesOnly
        ? encoder(prefix, defaults$1.encoder, charset, 'key', format)
        : prefix
    }

    obj = '';
  }

  if (isNonNullishPrimitive(obj) || isBuffer$1(obj)) {
    if (encoder) {
      const keyValue = encodeValuesOnly
        ? prefix
        : encoder(prefix, defaults$1.encoder, charset, 'key', format);
      return [
        formatter(keyValue) +
          '=' +
          formatter(encoder(obj, defaults$1.encoder, charset, 'value', format)),
      ]
    }
    return [formatter(prefix) + '=' + formatter(String(obj))]
  }

  const values = [];

  if (typeof obj === 'undefined') {
    return values
  }

  let objKeys;
  if (generateArrayPrefix === 'comma' && isArray$2(obj)) {
    // we need to join elements in
    if (encodeValuesOnly && encoder) {
      obj = maybeMap(obj, encoder);
    }
    objKeys = [{ value: obj.length > 0 ? obj.join(',') || null : void 0 }];
  } else if (isArray$2(filter)) {
    objKeys = filter;
  } else {
    const keys = Object.keys(obj);
    objKeys = sort ? keys.sort(sort) : keys;
  }

  const encodedPrefix = encodeDotInKeys ? prefix.replace(/\./g, '%2E') : prefix;

  const adjustedPrefix =
    commaRoundTrip && isArray$2(obj) && obj.length === 1 ? encodedPrefix + '[]' : encodedPrefix;

  if (allowEmptyArrays && isArray$2(obj) && obj.length === 0) {
    return adjustedPrefix + '[]'
  }

  for (let j = 0; j < objKeys.length; ++j) {
    const key = objKeys[j];
    const value = typeof key === 'object' && typeof key.value !== 'undefined' ? key.value : obj[key];

    if (skipNulls && value === null) {
      continue
    }

    const encodedKey = allowDots && encodeDotInKeys ? key.replace(/\./g, '%2E') : key;
    const keyPrefix = isArray$2(obj)
      ? typeof generateArrayPrefix === 'function'
        ? generateArrayPrefix(adjustedPrefix, encodedKey)
        : adjustedPrefix
      : adjustedPrefix + (allowDots ? '.' + encodedKey : '[' + encodedKey + ']');

    sideChannel.set(object, step);
    const valueSideChannel = new WeakMap();
    valueSideChannel.set(sentinel, sideChannel);
    pushToArray(
      values,
      _stringify(
        value,
        keyPrefix,
        generateArrayPrefix,
        commaRoundTrip,
        allowEmptyArrays,
        strictNullHandling,
        skipNulls,
        encodeDotInKeys,
        generateArrayPrefix === 'comma' && encodeValuesOnly && isArray$2(obj) ? null : encoder,
        filter,
        sort,
        allowDots,
        serializeDate,
        format,
        formatter,
        encodeValuesOnly,
        charset,
        valueSideChannel,
      ),
    );
  }

  return values
};

const normalizeStringifyOptions = function normalizeStringifyOptions(opts) {
  if (!opts) {
    return defaults$1
  }

  if (typeof opts.allowEmptyArrays !== 'undefined' && typeof opts.allowEmptyArrays !== 'boolean') {
    throw new TypeError('`allowEmptyArrays` option can only be `true` or `false`, when provided')
  }

  if (typeof opts.encodeDotInKeys !== 'undefined' && typeof opts.encodeDotInKeys !== 'boolean') {
    throw new TypeError('`encodeDotInKeys` option can only be `true` or `false`, when provided')
  }

  if (
    opts.encoder !== null &&
    typeof opts.encoder !== 'undefined' &&
    typeof opts.encoder !== 'function'
  ) {
    throw new TypeError('Encoder has to be a function.')
  }

  const charset = opts.charset || defaults$1.charset;
  if (
    typeof opts.charset !== 'undefined' &&
    opts.charset !== 'utf-8' &&
    opts.charset !== 'iso-8859-1'
  ) {
    throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined')
  }

  let format = formats;
  if (typeof opts.format !== 'undefined') {
    if (!has$1.call(formatters, opts.format)) {
      throw new TypeError('Unknown format option provided.')
    }
    format = opts.format;
  }
  const formatter = formatters[format];

  let filter = defaults$1.filter;
  if (typeof opts.filter === 'function' || isArray$2(opts.filter)) {
    filter = opts.filter;
  }

  let arrayFormat;
  if (opts.arrayFormat in arrayPrefixGenerators) {
    arrayFormat = opts.arrayFormat;
  } else if ('indices' in opts) {
    arrayFormat = opts.indices ? 'indices' : 'repeat';
  } else {
    arrayFormat = defaults$1.arrayFormat;
  }

  if ('commaRoundTrip' in opts && typeof opts.commaRoundTrip !== 'boolean') {
    throw new TypeError('`commaRoundTrip` must be a boolean, or absent')
  }

  const allowDots =
    typeof opts.allowDots === 'undefined'
      ? opts.encodeDotInKeys === true
        ? true
        : defaults$1.allowDots
      : !!opts.allowDots;

  return {
    addQueryPrefix:
      typeof opts.addQueryPrefix === 'boolean' ? opts.addQueryPrefix : defaults$1.addQueryPrefix,
    allowDots: allowDots,
    allowEmptyArrays:
      typeof opts.allowEmptyArrays === 'boolean'
        ? !!opts.allowEmptyArrays
        : defaults$1.allowEmptyArrays,
    arrayFormat: arrayFormat,
    charset: charset,
    charsetSentinel:
      typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults$1.charsetSentinel,
    commaRoundTrip: opts.commaRoundTrip,
    delimiter: typeof opts.delimiter === 'undefined' ? defaults$1.delimiter : opts.delimiter,
    encode: typeof opts.encode === 'boolean' ? opts.encode : defaults$1.encode,
    encodeDotInKeys:
      typeof opts.encodeDotInKeys === 'boolean' ? opts.encodeDotInKeys : defaults$1.encodeDotInKeys,
    encoder: typeof opts.encoder === 'function' ? opts.encoder : defaults$1.encoder,
    encodeValuesOnly:
      typeof opts.encodeValuesOnly === 'boolean'
        ? opts.encodeValuesOnly
        : defaults$1.encodeValuesOnly,
    filter: filter,
    format: format,
    formatter: formatter,
    serializeDate:
      typeof opts.serializeDate === 'function' ? opts.serializeDate : defaults$1.serializeDate,
    skipNulls: typeof opts.skipNulls === 'boolean' ? opts.skipNulls : defaults$1.skipNulls,
    sort: typeof opts.sort === 'function' ? opts.sort : null,
    strictNullHandling:
      typeof opts.strictNullHandling === 'boolean'
        ? opts.strictNullHandling
        : defaults$1.strictNullHandling,
  }
};

function stringify(object, opts) {
  let obj = object;
  const options = normalizeStringifyOptions(opts);

  let objKeys;
  let filter;

  if (typeof options.filter === 'function') {
    filter = options.filter;
    obj = filter('', obj);
  } else if (isArray$2(options.filter)) {
    filter = options.filter;
    objKeys = filter;
  }

  const keys = [];

  if (typeof obj !== 'object' || obj === null) {
    return ''
  }

  const generateArrayPrefix = arrayPrefixGenerators[options.arrayFormat];
  const commaRoundTrip = generateArrayPrefix === 'comma' && options.commaRoundTrip;

  if (!objKeys) {
    objKeys = Object.keys(obj);
  }

  if (options.sort) {
    objKeys.sort(options.sort);
  }

  const sideChannel = new WeakMap();
  for (let i = 0; i < objKeys.length; ++i) {
    const key = objKeys[i];

    if (options.skipNulls && obj[key] === null) {
      continue
    }
    pushToArray(
      keys,
      _stringify(
        obj[key],
        key,
        generateArrayPrefix,
        commaRoundTrip,
        options.allowEmptyArrays,
        options.strictNullHandling,
        options.skipNulls,
        options.encodeDotInKeys,
        options.encode ? options.encoder : null,
        options.filter,
        options.sort,
        options.allowDots,
        options.serializeDate,
        options.format,
        options.formatter,
        options.encodeValuesOnly,
        options.charset,
        sideChannel,
      ),
    );
  }

  const joined = keys.join(options.delimiter);
  let prefix = options.addQueryPrefix === true ? '?' : '';

  if (options.charsetSentinel) {
    if (options.charset === 'iso-8859-1') {
      // encodeURIComponent('&#10003;'), the "numeric entity" representation of a checkmark
      prefix += 'utf8=%26%2310003%3B&';
    } else {
      // encodeURIComponent('✓')
      prefix += 'utf8=%E2%9C%93&';
    }
  }

  return joined.length > 0 ? prefix + joined : ''
}

const has = Object.prototype.hasOwnProperty;
const isArray$1 = Array.isArray;

const defaults = {
  allowDots: false,
  allowEmptyArrays: false,
  allowPrototypes: false,
  allowSparse: false,
  arrayLimit: 20,
  charset: 'utf-8',
  charsetSentinel: false,
  comma: false,
  decodeDotInKeys: false,
  decoder: decode,
  delimiter: '&',
  depth: 5,
  duplicates: 'combine',
  ignoreQueryPrefix: false,
  interpretNumericEntities: false,
  parameterLimit: 1000,
  parseArrays: true,
  plainObjects: false,
  strictNullHandling: false,
};

const interpretNumericEntities = function (str) {
  return str.replace(/&#(\d+);/g, function ($0, numberStr) {
    return String.fromCharCode(parseInt(numberStr, 10))
  })
};

const parseArrayValue = function (val, options) {
  if (val && typeof val === 'string' && options.comma && val.indexOf(',') > -1) {
    return val.split(',')
  }

  return val
};

// This is what browsers will submit when the ✓ character occurs in an
// application/x-www-form-urlencoded body and the encoding of the page containing
// the form is iso-8859-1, or when the submitted form has an accept-charset
// attribute of iso-8859-1. Presumably also with other charsets that do not contain
// the ✓ character, such as us-ascii.
const isoSentinel = 'utf8=%26%2310003%3B'; // encodeURIComponent('&#10003;')

// These are the percent-encoded utf-8 octets representing a checkmark, indicating that the request actually is utf-8 encoded.
const charsetSentinel = 'utf8=%E2%9C%93'; // encodeURIComponent('✓')

const parseValues = function parseQueryStringValues(str, options) {
  const obj = { __proto__: null };

  const cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, '') : str;
  const limit = options.parameterLimit === Infinity ? undefined : options.parameterLimit;
  const parts = cleanStr.split(options.delimiter, limit);
  let skipIndex = -1; // Keep track of where the utf8 sentinel was found
  let i;

  let charset = options.charset;
  if (options.charsetSentinel) {
    for (i = 0; i < parts.length; ++i) {
      if (parts[i].indexOf('utf8=') === 0) {
        if (parts[i] === charsetSentinel) {
          charset = 'utf-8';
        } else if (parts[i] === isoSentinel) {
          charset = 'iso-8859-1';
        }
        skipIndex = i;
        i = parts.length; // The eslint settings do not allow break;
      }
    }
  }

  for (i = 0; i < parts.length; ++i) {
    if (i === skipIndex) {
      continue
    }
    const part = parts[i];

    const bracketEqualsPos = part.indexOf(']=');
    const pos = bracketEqualsPos === -1 ? part.indexOf('=') : bracketEqualsPos + 1;

    let key, val;
    if (pos === -1) {
      key = options.decoder(part, defaults.decoder, charset, 'key');
      val = options.strictNullHandling ? null : '';
    } else {
      key = options.decoder(part.slice(0, pos), defaults.decoder, charset, 'key');
      val = maybeMap(parseArrayValue(part.slice(pos + 1), options), function (encodedVal) {
        return options.decoder(encodedVal, defaults.decoder, charset, 'value')
      });
    }

    if (val && options.interpretNumericEntities && charset === 'iso-8859-1') {
      val = interpretNumericEntities(val);
    }

    if (part.indexOf('[]=') > -1) {
      val = isArray$1(val) ? [val] : val;
    }

    const existing = has.call(obj, key);
    if (existing && options.duplicates === 'combine') {
      obj[key] = combine(obj[key], val);
    } else if (!existing || options.duplicates === 'last') {
      obj[key] = val;
    }
  }

  return obj
};

const parseObject = function (chain, val, options, valuesParsed) {
  let leaf = valuesParsed ? val : parseArrayValue(val, options);

  for (let i = chain.length - 1; i >= 0; --i) {
    let obj;
    const root = chain[i];

    if (root === '[]' && options.parseArrays) {
      obj = options.allowEmptyArrays && leaf === '' ? [] : [].concat(leaf);
    } else {
      obj = options.plainObjects ? Object.create(null) : {};
      const cleanRoot =
        root.charAt(0) === '[' && root.charAt(root.length - 1) === ']' ? root.slice(1, -1) : root;
      const decodedRoot = options.decodeDotInKeys ? cleanRoot.replace(/%2E/g, '.') : cleanRoot;
      const index = parseInt(decodedRoot, 10);
      if (!options.parseArrays && decodedRoot === '') {
        obj = { 0: leaf };
      } else if (
        !isNaN(index) &&
        root !== decodedRoot &&
        String(index) === decodedRoot &&
        index >= 0 &&
        options.parseArrays &&
        index <= options.arrayLimit
      ) {
        obj = [];
        obj[index] = leaf;
      } else if (decodedRoot !== '__proto__') {
        obj[decodedRoot] = leaf;
      }
    }

    leaf = obj;
  }

  return leaf
};

const parseKeys = function parseQueryStringKeys(givenKey, val, options, valuesParsed) {
  if (!givenKey) {
    return
  }

  // Transform dot notation to bracket notation
  const key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, '[$1]') : givenKey;

  // The regex chunks

  const brackets = /(\[[^[\]]*])/;
  const child = /(\[[^[\]]*])/g;

  // Get the parent

  let segment = options.depth > 0 && brackets.exec(key);
  const parent = segment ? key.slice(0, segment.index) : key;

  // Stash the parent if it exists

  const keys = [];
  if (parent) {
    // If we aren't using plain objects, optionally prefix keys that would overwrite object prototype properties
    if (!options.plainObjects && has.call(Object.prototype, parent)) {
      if (!options.allowPrototypes) {
        return
      }
    }

    keys.push(parent);
  }

  // Loop through children appending to the array until we hit depth

  let i = 0;
  while (options.depth > 0 && (segment = child.exec(key)) !== null && i < options.depth) {
    i += 1;
    if (!options.plainObjects && has.call(Object.prototype, segment[1].slice(1, -1))) {
      if (!options.allowPrototypes) {
        return
      }
    }
    keys.push(segment[1]);
  }

  // If there's a remainder, just add whatever is left

  if (segment) {
    keys.push('[' + key.slice(segment.index) + ']');
  }

  return parseObject(keys, val, options, valuesParsed)
};

const normalizeParseOptions = function normalizeParseOptions(opts) {
  if (!opts) {
    return defaults
  }

  if (typeof opts.allowEmptyArrays !== 'undefined' && typeof opts.allowEmptyArrays !== 'boolean') {
    throw new TypeError('`allowEmptyArrays` option can only be `true` or `false`, when provided')
  }

  if (typeof opts.decodeDotInKeys !== 'undefined' && typeof opts.decodeDotInKeys !== 'boolean') {
    throw new TypeError('`decodeDotInKeys` option can only be `true` or `false`, when provided')
  }

  if (
    opts.decoder !== null &&
    typeof opts.decoder !== 'undefined' &&
    typeof opts.decoder !== 'function'
  ) {
    throw new TypeError('Decoder has to be a function.')
  }

  if (
    typeof opts.charset !== 'undefined' &&
    opts.charset !== 'utf-8' &&
    opts.charset !== 'iso-8859-1'
  ) {
    throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined')
  }
  const charset = typeof opts.charset === 'undefined' ? defaults.charset : opts.charset;

  const duplicates = typeof opts.duplicates === 'undefined' ? defaults.duplicates : opts.duplicates;

  if (duplicates !== 'combine' && duplicates !== 'first' && duplicates !== 'last') {
    throw new TypeError('The duplicates option must be either combine, first, or last')
  }

  const allowDots =
    typeof opts.allowDots === 'undefined'
      ? opts.decodeDotInKeys === true
        ? true
        : defaults.allowDots
      : !!opts.allowDots;

  return {
    allowDots: allowDots,
    allowEmptyArrays:
      typeof opts.allowEmptyArrays === 'boolean'
        ? !!opts.allowEmptyArrays
        : defaults.allowEmptyArrays,
    allowPrototypes:
      typeof opts.allowPrototypes === 'boolean' ? opts.allowPrototypes : defaults.allowPrototypes,
    allowSparse: typeof opts.allowSparse === 'boolean' ? opts.allowSparse : defaults.allowSparse,
    arrayLimit: typeof opts.arrayLimit === 'number' ? opts.arrayLimit : defaults.arrayLimit,
    charset: charset,
    charsetSentinel:
      typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
    comma: typeof opts.comma === 'boolean' ? opts.comma : defaults.comma,
    decodeDotInKeys:
      typeof opts.decodeDotInKeys === 'boolean' ? opts.decodeDotInKeys : defaults.decodeDotInKeys,
    decoder: typeof opts.decoder === 'function' ? opts.decoder : defaults.decoder,
    delimiter:
      typeof opts.delimiter === 'string' || isRegExp(opts.delimiter)
        ? opts.delimiter
        : defaults.delimiter,
    // eslint-disable-next-line no-implicit-coercion, no-extra-parens
    depth: typeof opts.depth === 'number' || opts.depth === false ? +opts.depth : defaults.depth,
    duplicates: duplicates,
    ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
    interpretNumericEntities:
      typeof opts.interpretNumericEntities === 'boolean'
        ? opts.interpretNumericEntities
        : defaults.interpretNumericEntities,
    parameterLimit:
      typeof opts.parameterLimit === 'number' ? opts.parameterLimit : defaults.parameterLimit,
    parseArrays: opts.parseArrays !== false,
    plainObjects:
      typeof opts.plainObjects === 'boolean' ? opts.plainObjects : defaults.plainObjects,
    strictNullHandling:
      typeof opts.strictNullHandling === 'boolean'
        ? opts.strictNullHandling
        : defaults.strictNullHandling,
  }
};

function parse(str, opts) {
  const options = normalizeParseOptions(opts);

  if (str === '' || str === null || typeof str === 'undefined') {
    return options.plainObjects ? Object.create(null) : {}
  }

  const tempObj = typeof str === 'string' ? parseValues(str, options) : str;
  let obj = options.plainObjects ? Object.create(null) : {};

  // Iterate over the keys and setup the new object

  const keys = Object.keys(tempObj);
  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i];
    const newObj = parseKeys(key, tempObj[key], options, typeof str === 'string');
    obj = merge(obj, newObj, options);
  }

  if (options.allowSparse === true) {
    return obj
  }

  return compact(obj)
}

const warnings = /* @__PURE__ */ new Set();
function warnOnce(condition, ...rest) {
  if (condition) {
    const key = rest.join(" ");
    if (warnings.has(key)) {
      return;
    }
    warnings.add(key);
    console.warn(...rest);
  }
}

/**
 * The inverse of `_.toPairs`; this method returns an object composed
 * from key-value `pairs`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Array
 * @param {Array} pairs The key-value pairs.
 * @returns {Object} Returns the new object.
 * @example
 *
 * _.fromPairs([['a', 1], ['b', 2]]);
 * // => { 'a': 1, 'b': 2 }
 */
function fromPairs(pairs) {
  var index = -1,
      length = pairs == null ? 0 : pairs.length,
      result = {};

  while (++index < length) {
    var pair = pairs[index];
    result[pair[0]] = pair[1];
  }
  return result;
}

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax$2 = Math.max;

/**
 * This method is like `_.zip` except that it accepts an array of grouped
 * elements and creates an array regrouping the elements to their pre-zip
 * configuration.
 *
 * @static
 * @memberOf _
 * @since 1.2.0
 * @category Array
 * @param {Array} array The array of grouped elements to process.
 * @returns {Array} Returns the new array of regrouped elements.
 * @example
 *
 * var zipped = _.zip(['a', 'b'], [1, 2], [true, false]);
 * // => [['a', 1, true], ['b', 2, false]]
 *
 * _.unzip(zipped);
 * // => [['a', 'b'], [1, 2], [true, false]]
 */
function unzip(array) {
  if (!(array && array.length)) {
    return [];
  }
  var length = 0;
  array = arrayFilter(array, function(group) {
    if (isArrayLikeObject(group)) {
      length = nativeMax$2(group.length, length);
      return true;
    }
  });
  return baseTimes(length, function(index) {
    return arrayMap(array, baseProperty(index));
  });
}

/**
 * Creates an array of grouped elements, the first of which contains the
 * first elements of the given arrays, the second of which contains the
 * second elements of the given arrays, and so on.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {...Array} [arrays] The arrays to process.
 * @returns {Array} Returns the new array of grouped elements.
 * @example
 *
 * _.zip(['a', 'b'], [1, 2], [true, false]);
 * // => [['a', 1, true], ['b', 2, false]]
 */
var zip = baseRest(unzip);

/* global define */

let tmp = undefined || {};

(function(root, pluralize) {
  /* istanbul ignore else */
  if (typeof require === 'function' && typeof exports$1 === 'object' && typeof module === 'object') {
    // Node (CommonJS)
    module.exports = pluralize();
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(function() {
      return pluralize();
    });
  } else {
    // Browser global
    root.pluralize = pluralize();
  }
})(tmp, function() {
  // Rule storage - pluralize and singularize need to be run sequentially,
  // while other rules can be optimized using an object for instant lookups.
  var pluralRules = [];
  var singularRules = [];
  var uncountables = {};
  var irregularPlurals = {};
  var irregularSingles = {};

  /**
   * Sanitize a pluralization rule to a usable regular expression.
   *
   * @param  {(RegExp|string)} rule
   * @return {RegExp}
   */
  function sanitizeRule (rule) {
    if (typeof rule === 'string') {
      return new RegExp('^' + rule + '$', 'i');
    }

    return rule;
  }

  /**
   * Pass in a word token to produce a function that can replicate the case on
   * another word.
   *
   * @param  {string}   word
   * @param  {string}   token
   * @return {Function}
   */
  function restoreCase (word, token) {
    // Tokens are an exact match.
    if (word === token) return token;

    // Lower cased words. E.g. "hello".
    if (word === word.toLowerCase()) return token.toLowerCase();

    // Upper cased words. E.g. "WHISKY".
    if (word === word.toUpperCase()) return token.toUpperCase();

    // Title cased words. E.g. "Title".
    if (word[0] === word[0].toUpperCase()) {
      return token.charAt(0).toUpperCase() + token.substr(1).toLowerCase();
    }

    // Lower cased words. E.g. "test".
    return token.toLowerCase();
  }

  /**
   * Interpolate a regexp string.
   *
   * @param  {string} str
   * @param  {Array}  args
   * @return {string}
   */
  function interpolate (str, args) {
    return str.replace(/\$(\d{1,2})/g, function (match, index) {
      return args[index] || '';
    });
  }

  /**
   * Replace a word using a rule.
   *
   * @param  {string} word
   * @param  {Array}  rule
   * @return {string}
   */
  function replace (word, rule) {
    return word.replace(rule[0], function (match, index) {
      var result = interpolate(rule[1], arguments);

      if (match === '') {
        return restoreCase(word[index - 1], result);
      }

      return restoreCase(match, result);
    });
  }

  /**
   * Sanitize a word by passing in the word and sanitization rules.
   *
   * @param  {string}   token
   * @param  {string}   word
   * @param  {Array}    rules
   * @return {string}
   */
  function sanitizeWord (token, word, rules) {
    // Empty string or doesn't need fixing.
    if (!token.length || uncountables.hasOwnProperty(token)) {
      return word;
    }

    var len = rules.length;

    // Iterate over the sanitization rules and use the first one to match.
    while (len--) {
      var rule = rules[len];

      if (rule[0].test(word)) return replace(word, rule);
    }

    return word;
  }

  /**
   * Replace a word with the updated word.
   *
   * @param  {Object}   replaceMap
   * @param  {Object}   keepMap
   * @param  {Array}    rules
   * @return {Function}
   */
  function replaceWord (replaceMap, keepMap, rules) {
    return function (word) {
      // Get the correct token and case restoration functions.
      var token = word.toLowerCase();

      // Check against the keep object map.
      if (keepMap.hasOwnProperty(token)) {
        return restoreCase(word, token);
      }

      // Check against the replacement map for a direct word replacement.
      if (replaceMap.hasOwnProperty(token)) {
        return restoreCase(word, replaceMap[token]);
      }

      // Run all the rules against the word.
      return sanitizeWord(token, word, rules);
    };
  }

  /**
   * Check if a word is part of the map.
   */
  function checkWord (replaceMap, keepMap, rules, bool) {
    return function (word) {
      var token = word.toLowerCase();

      if (keepMap.hasOwnProperty(token)) return true;
      if (replaceMap.hasOwnProperty(token)) return false;

      return sanitizeWord(token, token, rules) === token;
    };
  }

  /**
   * Pluralize or singularize a word based on the passed in count.
   *
   * @param  {string}  word      The word to pluralize
   * @param  {number}  count     How many of the word exist
   * @param  {boolean} inclusive Whether to prefix with the number (e.g. 3 ducks)
   * @return {string}
   */
  function pluralize (word, count, inclusive) {
    var pluralized = count === 1
      ? pluralize.singular(word) : pluralize.plural(word);

    return (inclusive ? count + ' ' : '') + pluralized;
  }

  /**
   * Pluralize a word.
   *
   * @type {Function}
   */
  pluralize.plural = replaceWord(
    irregularSingles, irregularPlurals, pluralRules
  );

  /**
   * Check if a word is plural.
   *
   * @type {Function}
   */
  pluralize.isPlural = checkWord(
    irregularSingles, irregularPlurals, pluralRules
  );

  /**
   * Singularize a word.
   *
   * @type {Function}
   */
  pluralize.singular = replaceWord(
    irregularPlurals, irregularSingles, singularRules
  );

  /**
   * Check if a word is singular.
   *
   * @type {Function}
   */
  pluralize.isSingular = checkWord(
    irregularPlurals, irregularSingles, singularRules
  );

  /**
   * Add a pluralization rule to the collection.
   *
   * @param {(string|RegExp)} rule
   * @param {string}          replacement
   */
  pluralize.addPluralRule = function (rule, replacement) {
    pluralRules.push([sanitizeRule(rule), replacement]);
  };

  /**
   * Add a singularization rule to the collection.
   *
   * @param {(string|RegExp)} rule
   * @param {string}          replacement
   */
  pluralize.addSingularRule = function (rule, replacement) {
    singularRules.push([sanitizeRule(rule), replacement]);
  };

  /**
   * Add an uncountable word rule.
   *
   * @param {(string|RegExp)} word
   */
  pluralize.addUncountableRule = function (word) {
    if (typeof word === 'string') {
      uncountables[word.toLowerCase()] = true;
      return;
    }

    // Set singular and plural references for the word.
    pluralize.addPluralRule(word, '$0');
    pluralize.addSingularRule(word, '$0');
  };

  /**
   * Add an irregular word definition.
   *
   * @param {string} single
   * @param {string} plural
   */
  pluralize.addIrregularRule = function (single, plural) {
    plural = plural.toLowerCase();
    single = single.toLowerCase();

    irregularSingles[single] = plural;
    irregularPlurals[plural] = single;
  };

  /**
   * Irregular rules.
   */
  [
    // Pronouns.
    ['I', 'we'],
    ['me', 'us'],
    ['he', 'they'],
    ['she', 'they'],
    ['them', 'them'],
    ['myself', 'ourselves'],
    ['yourself', 'yourselves'],
    ['itself', 'themselves'],
    ['herself', 'themselves'],
    ['himself', 'themselves'],
    ['themself', 'themselves'],
    ['is', 'are'],
    ['was', 'were'],
    ['has', 'have'],
    ['this', 'these'],
    ['that', 'those'],
    // Words ending in with a consonant and `o`.
    ['echo', 'echoes'],
    ['dingo', 'dingoes'],
    ['volcano', 'volcanoes'],
    ['tornado', 'tornadoes'],
    ['torpedo', 'torpedoes'],
    // Ends with `us`.
    ['genus', 'genera'],
    ['viscus', 'viscera'],
    // Ends with `ma`.
    ['stigma', 'stigmata'],
    ['stoma', 'stomata'],
    ['dogma', 'dogmata'],
    ['lemma', 'lemmata'],
    ['schema', 'schemata'],
    ['anathema', 'anathemata'],
    // Other irregular rules.
    ['ox', 'oxen'],
    ['axe', 'axes'],
    ['die', 'dice'],
    ['yes', 'yeses'],
    ['foot', 'feet'],
    ['eave', 'eaves'],
    ['goose', 'geese'],
    ['tooth', 'teeth'],
    ['quiz', 'quizzes'],
    ['human', 'humans'],
    ['proof', 'proofs'],
    ['carve', 'carves'],
    ['valve', 'valves'],
    ['looey', 'looies'],
    ['thief', 'thieves'],
    ['groove', 'grooves'],
    ['pickaxe', 'pickaxes'],
    ['passerby', 'passersby']
  ].forEach(function (rule) {
    return pluralize.addIrregularRule(rule[0], rule[1]);
  });

  /**
   * Pluralization rules.
   */
  [
    [/s?$/i, 's'],
    [/[^\u0000-\u007F]$/i, '$0'],
    [/([^aeiou]ese)$/i, '$1'],
    [/(ax|test)is$/i, '$1es'],
    [/(alias|[^aou]us|t[lm]as|gas|ris)$/i, '$1es'],
    [/(e[mn]u)s?$/i, '$1s'],
    [/([^l]ias|[aeiou]las|[ejzr]as|[iu]am)$/i, '$1'],
    [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, '$1i'],
    [/(alumn|alg|vertebr)(?:a|ae)$/i, '$1ae'],
    [/(seraph|cherub)(?:im)?$/i, '$1im'],
    [/(her|at|gr)o$/i, '$1oes'],
    [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|automat|quor)(?:a|um)$/i, '$1a'],
    [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)(?:a|on)$/i, '$1a'],
    [/sis$/i, 'ses'],
    [/(?:(kni|wi|li)fe|(ar|l|ea|eo|oa|hoo)f)$/i, '$1$2ves'],
    [/([^aeiouy]|qu)y$/i, '$1ies'],
    [/([^ch][ieo][ln])ey$/i, '$1ies'],
    [/(x|ch|ss|sh|zz)$/i, '$1es'],
    [/(matr|cod|mur|sil|vert|ind|append)(?:ix|ex)$/i, '$1ices'],
    [/\b((?:tit)?m|l)(?:ice|ouse)$/i, '$1ice'],
    [/(pe)(?:rson|ople)$/i, '$1ople'],
    [/(child)(?:ren)?$/i, '$1ren'],
    [/eaux$/i, '$0'],
    [/m[ae]n$/i, 'men'],
    ['thou', 'you']
  ].forEach(function (rule) {
    return pluralize.addPluralRule(rule[0], rule[1]);
  });

  /**
   * Singularization rules.
   */
  [
    [/s$/i, ''],
    [/(ss)$/i, '$1'],
    [/(wi|kni|(?:after|half|high|low|mid|non|night|[^\w]|^)li)ves$/i, '$1fe'],
    [/(ar|(?:wo|[ae])l|[eo][ao])ves$/i, '$1f'],
    [/ies$/i, 'y'],
    [/\b([pl]|zomb|(?:neck|cross)?t|coll|faer|food|gen|goon|group|lass|talk|goal|cut)ies$/i, '$1ie'],
    [/\b(mon|smil)ies$/i, '$1ey'],
    [/\b((?:tit)?m|l)ice$/i, '$1ouse'],
    [/(seraph|cherub)im$/i, '$1'],
    [/(x|ch|ss|sh|zz|tto|go|cho|alias|[^aou]us|t[lm]as|gas|(?:her|at|gr)o|[aeiou]ris)(?:es)?$/i, '$1'],
    [/(analy|diagno|parenthe|progno|synop|the|empha|cri|ne)(?:sis|ses)$/i, '$1sis'],
    [/(movie|twelve|abuse|e[mn]u)s$/i, '$1'],
    [/(test)(?:is|es)$/i, '$1is'],
    [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, '$1us'],
    [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|quor)a$/i, '$1um'],
    [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)a$/i, '$1on'],
    [/(alumn|alg|vertebr)ae$/i, '$1a'],
    [/(cod|mur|sil|vert|ind)ices$/i, '$1ex'],
    [/(matr|append)ices$/i, '$1ix'],
    [/(pe)(rson|ople)$/i, '$1rson'],
    [/(child)ren$/i, '$1'],
    [/(eau)x?$/i, '$1'],
    [/men$/i, 'man']
  ].forEach(function (rule) {
    return pluralize.addSingularRule(rule[0], rule[1]);
  });

  /**
   * Uncountable rules.
   */
  [
    // Singular words with no plurals.
    'adulthood',
    'advice',
    'agenda',
    'aid',
    'aircraft',
    'alcohol',
    'ammo',
    'analytics',
    'anime',
    'athletics',
    'audio',
    'bison',
    'blood',
    'bream',
    'buffalo',
    'butter',
    'carp',
    'cash',
    'chassis',
    'chess',
    'clothing',
    'cod',
    'commerce',
    'cooperation',
    'corps',
    'debris',
    'diabetes',
    'digestion',
    'elk',
    'energy',
    'equipment',
    'excretion',
    'expertise',
    'firmware',
    'flounder',
    'fun',
    'gallows',
    'garbage',
    'graffiti',
    'hardware',
    'headquarters',
    'health',
    'herpes',
    'highjinks',
    'homework',
    'housework',
    'information',
    'jeans',
    'justice',
    'kudos',
    'labour',
    'literature',
    'machinery',
    'mackerel',
    'mail',
    'media',
    'mews',
    'moose',
    'music',
    'mud',
    'manga',
    'news',
    'only',
    'personnel',
    'pike',
    'plankton',
    'pliers',
    'police',
    'pollution',
    'premises',
    'rain',
    'research',
    'rice',
    'salmon',
    'scissors',
    'series',
    'sewage',
    'shambles',
    'shrimp',
    'software',
    'species',
    'staff',
    'swine',
    'tennis',
    'traffic',
    'transportation',
    'trout',
    'tuna',
    'wealth',
    'welfare',
    'whiting',
    'wildebeest',
    'wildlife',
    'you',
    /pok[eé]mon$/i,
    // Regexes.
    /[^aeiou]ese$/i, // "chinese", "japanese"
    /deer$/i, // "deer", "reindeer"
    /fish$/i, // "fish", "blowfish", "angelfish"
    /measles$/i,
    /o[iu]s$/i, // "carnivorous"
    /pox$/i, // "chickpox", "smallpox"
    /sheep$/i
  ].forEach(pluralize.addUncountableRule);

  return pluralize;
});

const exports$1 = tmp.pluralize;

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
var now = function() {
  return root.Date.now();
};

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
function trimmedEndIndex(string) {
  var index = string.length;

  while (index-- && reWhitespace.test(string.charAt(index))) {}
  return index;
}

/** Used to match leading whitespace. */
var reTrimStart = /^\s+/;

/**
 * The base implementation of `_.trim`.
 *
 * @private
 * @param {string} string The string to trim.
 * @returns {string} Returns the trimmed string.
 */
function baseTrim(string) {
  return string
    ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, '')
    : string;
}

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
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
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

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax$1 = Math.max,
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
function debounce(func, wait, options) {
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
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax$1(toNumber(options.maxWait) || 0, wait) : maxWait;
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

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
  this.size = 0;
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$3 = 1,
    COMPARE_UNORDERED_FLAG$1 = 2;

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Check that cyclic values are equal.
  var arrStacked = stack.get(array);
  var othStacked = stack.get(other);
  if (arrStacked && othStacked) {
    return arrStacked == other && othStacked == array;
  }
  var index = -1,
      result = true,
      seen = (bitmask & COMPARE_UNORDERED_FLAG$1) ? new SetCache : undefined;

  stack.set(array, other);
  stack.set(other, array);

  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, arrValue, index, other, array, stack)
        : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!arraySome(other, function(othValue, othIndex) {
            if (!cacheHas(seen, othIndex) &&
                (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
              return seen.push(othIndex);
            }
          })) {
        result = false;
        break;
      }
    } else if (!(
          arrValue === othValue ||
            equalFunc(arrValue, othValue, bitmask, customizer, stack)
        )) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  stack['delete'](other);
  return result;
}

/** Built-in value references. */
var Uint8Array = root.Uint8Array;

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$2 = 1,
    COMPARE_UNORDERED_FLAG = 2;

/** `Object#toString` result references. */
var boolTag$1 = '[object Boolean]',
    dateTag$1 = '[object Date]',
    errorTag$1 = '[object Error]',
    mapTag$2 = '[object Map]',
    numberTag$1 = '[object Number]',
    regexpTag$1 = '[object RegExp]',
    setTag$2 = '[object Set]',
    stringTag$1 = '[object String]',
    symbolTag = '[object Symbol]';

var arrayBufferTag$1 = '[object ArrayBuffer]',
    dataViewTag$2 = '[object DataView]';

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag$2:
      if ((object.byteLength != other.byteLength) ||
          (object.byteOffset != other.byteOffset)) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag$1:
      if ((object.byteLength != other.byteLength) ||
          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
        return false;
      }
      return true;

    case boolTag$1:
    case dateTag$1:
    case numberTag$1:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq(+object, +other);

    case errorTag$1:
      return object.name == other.name && object.message == other.message;

    case regexpTag$1:
    case stringTag$1:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == (other + '');

    case mapTag$2:
      var convert = mapToArray;

    case setTag$2:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$2;
      convert || (convert = setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG;

      // Recursively compare objects (susceptible to call stack limits).
      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack['delete'](object);
      return result;

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray$4(object) ? result : arrayPush(result, symbolsFunc(object));
}

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

/** Used for built-in method references. */
var objectProto$5 = Object.prototype;

/** Built-in value references. */
var propertyIsEnumerable = objectProto$5.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

/** Detect free variable `exports`. */
var freeExports$1 = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule$1 = freeExports$1 && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;

/** Built-in value references. */
var Buffer$1 = moduleExports$1 ? root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer$1 ? Buffer$1.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

/** `Object#toString` result references. */
var argsTag$1 = '[object Arguments]',
    arrayTag$1 = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag$1 = '[object Map]',
    numberTag = '[object Number]',
    objectTag$2 = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag$1 = '[object Set]',
    stringTag = '[object String]',
    weakMapTag$1 = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag$1 = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag$1] = typedArrayTags[arrayTag$1] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag$1] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag$1] = typedArrayTags[numberTag] =
typedArrayTags[objectTag$2] = typedArrayTags[regexpTag] =
typedArrayTags[setTag$1] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag$1] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    // Use `util.types` for Node.js 10+.
    var types = freeModule && freeModule.require && freeModule.require('util').types;

    if (types) {
      return types;
    }

    // Legacy `process.binding('util')` for Node.js < 10.
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

/** Used for built-in method references. */
var objectProto$4 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$3 = objectProto$4.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray$4(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((hasOwnProperty$3.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

/** Used for built-in method references. */
var objectProto$3 = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$3;

  return value === proto;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);

/** Used for built-in method references. */
var objectProto$2 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$2 = objectProto$2.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$2.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys$1(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return baseGetAllKeys(object, keys$1, getSymbols);
}

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$1 = 1;

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$1 = objectProto$1.hasOwnProperty;

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$1,
      objProps = getAllKeys(object),
      objLength = objProps.length,
      othProps = getAllKeys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty$1.call(other, key))) {
      return false;
    }
  }
  // Check that cyclic values are equal.
  var objStacked = stack.get(object);
  var othStacked = stack.get(other);
  if (objStacked && othStacked) {
    return objStacked == other && othStacked == object;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, objValue, key, other, object, stack)
        : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined
          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
          : compared
        )) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView');

/* Built-in method references that are verified to be native. */
var Promise$1 = getNative(root, 'Promise');

/* Built-in method references that are verified to be native. */
var WeakMap$1 = getNative(root, 'WeakMap');

/** `Object#toString` result references. */
var mapTag = '[object Map]',
    objectTag$1 = '[object Object]',
    promiseTag = '[object Promise]',
    setTag = '[object Set]',
    weakMapTag = '[object WeakMap]';

var dataViewTag = '[object DataView]';

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise$1),
    setCtorString = toSource(Set$1),
    weakMapCtorString = toSource(WeakMap$1);

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise$1 && getTag(Promise$1.resolve()) != promiseTag) ||
    (Set$1 && getTag(new Set$1) != setTag) ||
    (WeakMap$1 && getTag(new WeakMap$1) != weakMapTag)) {
  getTag = function(value) {
    var result = baseGetTag(value),
        Ctor = result == objectTag$1 ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    objectTag = '[object Object]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray$4(object),
      othIsArr = isArray$4(other),
      objTag = objIsArr ? arrayTag : getTag(object),
      othTag = othIsArr ? arrayTag : getTag(other);

  objTag = objTag == argsTag ? objectTag : objTag;
  othTag = othTag == argsTag ? objectTag : othTag;

  var objIsObj = objTag == objectTag,
      othIsObj = othTag == objectTag,
      isSameTag = objTag == othTag;

  if (isSameTag && isBuffer(object)) {
    if (!isBuffer(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack);
    return (objIsArr || isTypedArray(object))
      ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
      : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new Stack);
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack);
  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Unordered comparison
 *  2 - Partial comparison
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}

/**
 * Performs a deep comparison between two values to determine if they are
 * equivalent.
 *
 * **Note:** This method supports comparing arrays, array buffers, booleans,
 * date objects, error objects, maps, numbers, `Object` objects, regexes,
 * sets, strings, symbols, and typed arrays. `Object` objects are compared
 * by their own, not inherited, enumerable properties. Functions and DOM
 * nodes are compared by strict equality, i.e. `===`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.isEqual(object, other);
 * // => true
 *
 * object === other;
 * // => false
 */
function isEqual(value, other) {
  return baseIsEqual(value, other);
}

var papaparse_min$1 = {exports: {}};

/* @license
Papa Parse
v5.5.3
https://github.com/mholt/PapaParse
License: MIT
*/
var papaparse_min = papaparse_min$1.exports;

(function (module, exports) {
	(function (root, factory) {
	  {
	    // CommonJS/Node
	    module.exports = factory();
	  }
	})(papaparse_min,function r(){var n="undefined"!=typeof self?self:"undefined"!=typeof window?window:void 0!==n?n:{};var d,s=!n.document&&!!n.postMessage,a=n.IS_PAPA_WORKER||false,o={},h=0,v={};function u(e){this._handle=null,this._finished=false,this._completed=false,this._halted=false,this._input=null,this._baseIndex=0,this._partialLine="",this._rowCount=0,this._start=0,this._nextChunk=null,this.isFirstChunk=true,this._completeResults={data:[],errors:[],meta:{}},function(e){var t=b(e);t.chunkSize=parseInt(t.chunkSize),e.step||e.chunk||(t.chunkSize=null);this._handle=new i(t),(this._handle.streamer=this)._config=t;}.call(this,e),this.parseChunk=function(t,e){var i=parseInt(this._config.skipFirstNLines)||0;if(this.isFirstChunk&&0<i){let e=this._config.newline;e||(r=this._config.quoteChar||'"',e=this._handle.guessLineEndings(t,r)),t=[...t.split(e).slice(i)].join(e);}this.isFirstChunk&&U(this._config.beforeFirstChunk)&&void 0!==(r=this._config.beforeFirstChunk(t))&&(t=r),this.isFirstChunk=false,this._halted=false;var i=this._partialLine+t,r=(this._partialLine="",this._handle.parse(i,this._baseIndex,!this._finished));if(!this._handle.paused()&&!this._handle.aborted()){t=r.meta.cursor,i=(this._finished||(this._partialLine=i.substring(t-this._baseIndex),this._baseIndex=t),r&&r.data&&(this._rowCount+=r.data.length),this._finished||this._config.preview&&this._rowCount>=this._config.preview);if(a)n.postMessage({results:r,workerId:v.WORKER_ID,finished:i});else if(U(this._config.chunk)&&!e){if(this._config.chunk(r,this._handle),this._handle.paused()||this._handle.aborted())return void(this._halted=true);this._completeResults=r=void 0;}return this._config.step||this._config.chunk||(this._completeResults.data=this._completeResults.data.concat(r.data),this._completeResults.errors=this._completeResults.errors.concat(r.errors),this._completeResults.meta=r.meta),this._completed||!i||!U(this._config.complete)||r&&r.meta.aborted||(this._config.complete(this._completeResults,this._input),this._completed=true),i||r&&r.meta.paused||this._nextChunk(),r}this._halted=true;},this._sendError=function(e){U(this._config.error)?this._config.error(e):a&&this._config.error&&n.postMessage({workerId:v.WORKER_ID,error:e,finished:false});};}function f(e){var r;(e=e||{}).chunkSize||(e.chunkSize=v.RemoteChunkSize),u.call(this,e),this._nextChunk=s?function(){this._readChunk(),this._chunkLoaded();}:function(){this._readChunk();},this.stream=function(e){this._input=e,this._nextChunk();},this._readChunk=function(){if(this._finished)this._chunkLoaded();else {if(r=new XMLHttpRequest,this._config.withCredentials&&(r.withCredentials=this._config.withCredentials),s||(r.onload=y(this._chunkLoaded,this),r.onerror=y(this._chunkError,this)),r.open(this._config.downloadRequestBody?"POST":"GET",this._input,!s),this._config.downloadRequestHeaders){var e,t=this._config.downloadRequestHeaders;for(e in t)r.setRequestHeader(e,t[e]);}var i;this._config.chunkSize&&(i=this._start+this._config.chunkSize-1,r.setRequestHeader("Range","bytes="+this._start+"-"+i));try{r.send(this._config.downloadRequestBody);}catch(e){this._chunkError(e.message);}s&&0===r.status&&this._chunkError();}},this._chunkLoaded=function(){4===r.readyState&&(r.status<200||400<=r.status?this._chunkError():(this._start+=this._config.chunkSize||r.responseText.length,this._finished=!this._config.chunkSize||this._start>=(e=>null!==(e=e.getResponseHeader("Content-Range"))?parseInt(e.substring(e.lastIndexOf("/")+1)):-1)(r),this.parseChunk(r.responseText)));},this._chunkError=function(e){e=r.statusText||e;this._sendError(new Error(e));};}function l(e){(e=e||{}).chunkSize||(e.chunkSize=v.LocalChunkSize),u.call(this,e);var i,r,n="undefined"!=typeof FileReader;this.stream=function(e){this._input=e,r=e.slice||e.webkitSlice||e.mozSlice,n?((i=new FileReader).onload=y(this._chunkLoaded,this),i.onerror=y(this._chunkError,this)):i=new FileReaderSync,this._nextChunk();},this._nextChunk=function(){this._finished||this._config.preview&&!(this._rowCount<this._config.preview)||this._readChunk();},this._readChunk=function(){var e=this._input,t=(this._config.chunkSize&&(t=Math.min(this._start+this._config.chunkSize,this._input.size),e=r.call(e,this._start,t)),i.readAsText(e,this._config.encoding));n||this._chunkLoaded({target:{result:t}});},this._chunkLoaded=function(e){this._start+=this._config.chunkSize,this._finished=!this._config.chunkSize||this._start>=this._input.size,this.parseChunk(e.target.result);},this._chunkError=function(){this._sendError(i.error);};}function c(e){var i;u.call(this,e=e||{}),this.stream=function(e){return i=e,this._nextChunk()},this._nextChunk=function(){var e,t;if(!this._finished)return e=this._config.chunkSize,i=e?(t=i.substring(0,e),i.substring(e)):(t=i,""),this._finished=!i,this.parseChunk(t)};}function p(e){u.call(this,e=e||{});var t=[],i=true,r=false;this.pause=function(){u.prototype.pause.apply(this,arguments),this._input.pause();},this.resume=function(){u.prototype.resume.apply(this,arguments),this._input.resume();},this.stream=function(e){this._input=e,this._input.on("data",this._streamData),this._input.on("end",this._streamEnd),this._input.on("error",this._streamError);},this._checkIsFinished=function(){r&&1===t.length&&(this._finished=true);},this._nextChunk=function(){this._checkIsFinished(),t.length?this.parseChunk(t.shift()):i=true;},this._streamData=y(function(e){try{t.push("string"==typeof e?e:e.toString(this._config.encoding)),i&&(i=!1,this._checkIsFinished(),this.parseChunk(t.shift()));}catch(e){this._streamError(e);}},this),this._streamError=y(function(e){this._streamCleanUp(),this._sendError(e);},this),this._streamEnd=y(function(){this._streamCleanUp(),r=true,this._streamData("");},this),this._streamCleanUp=y(function(){this._input.removeListener("data",this._streamData),this._input.removeListener("end",this._streamEnd),this._input.removeListener("error",this._streamError);},this);}function i(m){var n,s,a,t,o=Math.pow(2,53),h=-o,u=/^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/,d=/^((\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)))$/,i=this,r=0,f=0,l=false,e=false,c=[],p={data:[],errors:[],meta:{}};function y(e){return "greedy"===m.skipEmptyLines?""===e.join("").trim():1===e.length&&0===e[0].length}function g(){if(p&&a&&(k("Delimiter","UndetectableDelimiter","Unable to auto-detect delimiting character; defaulted to '"+v.DefaultDelimiter+"'"),a=false),m.skipEmptyLines&&(p.data=p.data.filter(function(e){return !y(e)})),_()){if(p)if(Array.isArray(p.data[0])){for(var e=0;_()&&e<p.data.length;e++)p.data[e].forEach(t);p.data.splice(0,1);}else p.data.forEach(t);function t(e,t){U(m.transformHeader)&&(e=m.transformHeader(e,t)),c.push(e);}}function i(e,t){for(var i=m.header?{}:[],r=0;r<e.length;r++){var n=r,s=e[r],s=((e,t)=>(e=>(m.dynamicTypingFunction&&void 0===m.dynamicTyping[e]&&(m.dynamicTyping[e]=m.dynamicTypingFunction(e)),true===(m.dynamicTyping[e]||m.dynamicTyping)))(e)?"true"===t||"TRUE"===t||"false"!==t&&"FALSE"!==t&&((e=>{if(u.test(e)){e=parseFloat(e);if(h<e&&e<o)return 1}})(t)?parseFloat(t):d.test(t)?new Date(t):""===t?null:t):t)(n=m.header?r>=c.length?"__parsed_extra":c[r]:n,s=m.transform?m.transform(s,n):s);"__parsed_extra"===n?(i[n]=i[n]||[],i[n].push(s)):i[n]=s;}return m.header&&(r>c.length?k("FieldMismatch","TooManyFields","Too many fields: expected "+c.length+" fields but parsed "+r,f+t):r<c.length&&k("FieldMismatch","TooFewFields","Too few fields: expected "+c.length+" fields but parsed "+r,f+t)),i}var r;p&&(m.header||m.dynamicTyping||m.transform)&&(r=1,!p.data.length||Array.isArray(p.data[0])?(p.data=p.data.map(i),r=p.data.length):p.data=i(p.data,0),m.header&&p.meta&&(p.meta.fields=c),f+=r);}function _(){return m.header&&0===c.length}function k(e,t,i,r){e={type:e,code:t,message:i};void 0!==r&&(e.row=r),p.errors.push(e);}U(m.step)&&(t=m.step,m.step=function(e){p=e,_()?g():(g(),0!==p.data.length&&(r+=e.data.length,m.preview&&r>m.preview?s.abort():(p.data=p.data[0],t(p,i))));}),this.parse=function(e,t,i){var r=m.quoteChar||'"',r=(m.newline||(m.newline=this.guessLineEndings(e,r)),a=false,m.delimiter?U(m.delimiter)&&(m.delimiter=m.delimiter(e),p.meta.delimiter=m.delimiter):((r=((e,t,i,r,n)=>{var s,a,o,h;n=n||[",","\t","|",";",v.RECORD_SEP,v.UNIT_SEP];for(var u=0;u<n.length;u++){for(var d,f=n[u],l=0,c=0,p=0,g=(o=void 0,new E({comments:r,delimiter:f,newline:t,preview:10}).parse(e)),_=0;_<g.data.length;_++)i&&y(g.data[_])?p++:(d=g.data[_].length,c+=d,void 0===o?o=d:0<d&&(l+=Math.abs(d-o),o=d));0<g.data.length&&(c/=g.data.length-p),(void 0===a||l<=a)&&(void 0===h||h<c)&&1.99<c&&(a=l,s=f,h=c);}return {successful:!!(m.delimiter=s),bestDelimiter:s}})(e,m.newline,m.skipEmptyLines,m.comments,m.delimitersToGuess)).successful?m.delimiter=r.bestDelimiter:(a=true,m.delimiter=v.DefaultDelimiter),p.meta.delimiter=m.delimiter),b(m));return m.preview&&m.header&&r.preview++,n=e,s=new E(r),p=s.parse(n,t,i),g(),l?{meta:{paused:true}}:p||{meta:{paused:false}}},this.paused=function(){return l},this.pause=function(){l=true,s.abort(),n=U(m.chunk)?"":n.substring(s.getCharIndex());},this.resume=function(){i.streamer._halted?(l=false,i.streamer.parseChunk(n,true)):setTimeout(i.resume,3);},this.aborted=function(){return e},this.abort=function(){e=true,s.abort(),p.meta.aborted=true,U(m.complete)&&m.complete(p),n="";},this.guessLineEndings=function(e,t){e=e.substring(0,1048576);var t=new RegExp(P(t)+"([^]*?)"+P(t),"gm"),i=(e=e.replace(t,"")).split("\r"),t=e.split("\n"),e=1<t.length&&t[0].length<i[0].length;if(1===i.length||e)return "\n";for(var r=0,n=0;n<i.length;n++)"\n"===i[n][0]&&r++;return r>=i.length/2?"\r\n":"\r"};}function P(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function E(C){var S=(C=C||{}).delimiter,O=C.newline,x=C.comments,I=C.step,A=C.preview,T=C.fastMode,D=null,L=false,F=null==C.quoteChar?'"':C.quoteChar,j=F;if(void 0!==C.escapeChar&&(j=C.escapeChar),("string"!=typeof S||-1<v.BAD_DELIMITERS.indexOf(S))&&(S=","),x===S)throw new Error("Comment character same as delimiter");true===x?x="#":("string"!=typeof x||-1<v.BAD_DELIMITERS.indexOf(x))&&(x=false),"\n"!==O&&"\r"!==O&&"\r\n"!==O&&(O="\n");var z=0,M=false;this.parse=function(i,t,r){if("string"!=typeof i)throw new Error("Input must be a string");var n=i.length,e=S.length,s=O.length,a=x.length,o=U(I),h=[],u=[],d=[],f=z=0;if(!i)return w();if(T||false!==T&&-1===i.indexOf(F)){for(var l=i.split(O),c=0;c<l.length;c++){if(d=l[c],z+=d.length,c!==l.length-1)z+=O.length;else if(r)return w();if(!x||d.substring(0,a)!==x){if(o){if(h=[],k(d.split(S)),R(),M)return w()}else k(d.split(S));if(A&&A<=c)return h=h.slice(0,A),w(true)}}return w()}for(var p=i.indexOf(S,z),g=i.indexOf(O,z),_=new RegExp(P(j)+P(F),"g"),m=i.indexOf(F,z);;)if(i[z]===F)for(m=z,z++;;){if(-1===(m=i.indexOf(F,m+1)))return r||u.push({type:"Quotes",code:"MissingQuotes",message:"Quoted field unterminated",row:h.length,index:z}),E();if(m===n-1)return E(i.substring(z,m).replace(_,F));if(F===j&&i[m+1]===j)m++;else if(F===j||0===m||i[m-1]!==j){ -1!==p&&p<m+1&&(p=i.indexOf(S,m+1));var y=v(-1===(g=-1!==g&&g<m+1?i.indexOf(O,m+1):g)?p:Math.min(p,g));if(i.substr(m+1+y,e)===S){d.push(i.substring(z,m).replace(_,F)),i[z=m+1+y+e]!==F&&(m=i.indexOf(F,z)),p=i.indexOf(S,z),g=i.indexOf(O,z);break}y=v(g);if(i.substring(m+1+y,m+1+y+s)===O){if(d.push(i.substring(z,m).replace(_,F)),b(m+1+y+s),p=i.indexOf(S,z),m=i.indexOf(F,z),o&&(R(),M))return w();if(A&&h.length>=A)return w(true);break}u.push({type:"Quotes",code:"InvalidQuotes",message:"Trailing quote on quoted field is malformed",row:h.length,index:z}),m++;}}else if(x&&0===d.length&&i.substring(z,z+a)===x){if(-1===g)return w();z=g+s,g=i.indexOf(O,z),p=i.indexOf(S,z);}else if(-1!==p&&(p<g||-1===g))d.push(i.substring(z,p)),z=p+e,p=i.indexOf(S,z);else {if(-1===g)break;if(d.push(i.substring(z,g)),b(g+s),o&&(R(),M))return w();if(A&&h.length>=A)return w(true)}return E();function k(e){h.push(e),f=z;}function v(e){var t=0;return t=-1!==e&&(e=i.substring(m+1,e))&&""===e.trim()?e.length:t}function E(e){return r||(void 0===e&&(e=i.substring(z)),d.push(e),z=n,k(d),o&&R()),w()}function b(e){z=e,k(d),d=[],g=i.indexOf(O,z);}function w(e){if(C.header&&!t&&h.length&&!L){var s=h[0],a=Object.create(null),o=new Set(s);let n=false;for(let r=0;r<s.length;r++){let i=s[r];if(a[i=U(C.transformHeader)?C.transformHeader(i,r):i]){let e,t=a[i];for(;e=i+"_"+t,t++,o.has(e););o.add(e),s[r]=e,a[i]++,n=true,(D=null===D?{}:D)[e]=i;}else a[i]=1,s[r]=i;o.add(i);}n&&console.warn("Duplicate headers found and renamed."),L=true;}return {data:h,errors:u,meta:{delimiter:S,linebreak:O,aborted:M,truncated:!!e,cursor:f+(t||0),renamedHeaders:D}}}function R(){I(w()),h=[],u=[];}},this.abort=function(){M=true;},this.getCharIndex=function(){return z};}function g(e){var t=e.data,i=o[t.workerId],r=false;if(t.error)i.userError(t.error,t.file);else if(t.results&&t.results.data){var n={abort:function(){r=true,_(t.workerId,{data:[],errors:[],meta:{aborted:true}});},pause:m,resume:m};if(U(i.userStep)){for(var s=0;s<t.results.data.length&&(i.userStep({data:t.results.data[s],errors:t.results.errors,meta:t.results.meta},n),!r);s++);delete t.results;}else U(i.userChunk)&&(i.userChunk(t.results,n,t.file),delete t.results);}t.finished&&!r&&_(t.workerId,t.results);}function _(e,t){var i=o[e];U(i.userComplete)&&i.userComplete(t),i.terminate(),delete o[e];}function m(){throw new Error("Not implemented.")}function b(e){if("object"!=typeof e||null===e)return e;var t,i=Array.isArray(e)?[]:{};for(t in e)i[t]=b(e[t]);return i}function y(e,t){return function(){e.apply(t,arguments);}}function U(e){return "function"==typeof e}return v.parse=function(e,t){var i=(t=t||{}).dynamicTyping||false;U(i)&&(t.dynamicTypingFunction=i,i={});if(t.dynamicTyping=i,t.transform=!!U(t.transform)&&t.transform,!t.worker||!v.WORKERS_SUPPORTED)return i=null,v.NODE_STREAM_INPUT,"string"==typeof e?(e=(e=>65279!==e.charCodeAt(0)?e:e.slice(1))(e),i=new(t.download?f:c)(t)):true===e.readable&&U(e.read)&&U(e.on)?i=new p(t):(n.File&&e instanceof File||e instanceof Object)&&(i=new l(t)),i.stream(e);(i=(()=>{var e;return !!v.WORKERS_SUPPORTED&&(e=(()=>{var e=n.URL||n.webkitURL||null,t=r.toString();return v.BLOB_URL||(v.BLOB_URL=e.createObjectURL(new Blob(["var global = (function() { if (typeof self !== 'undefined') { return self; } if (typeof window !== 'undefined') { return window; } if (typeof global !== 'undefined') { return global; } return {}; })(); global.IS_PAPA_WORKER=true; ","(",t,")();"],{type:"text/javascript"})))})(),(e=new n.Worker(e)).onmessage=g,e.id=h++,o[e.id]=e)})()).userStep=t.step,i.userChunk=t.chunk,i.userComplete=t.complete,i.userError=t.error,t.step=U(t.step),t.chunk=U(t.chunk),t.complete=U(t.complete),t.error=U(t.error),delete t.worker,i.postMessage({input:e,config:t,workerId:i.id});},v.unparse=function(e,t){var n=false,_=true,m=",",y="\r\n",s='"',a=s+s,i=false,r=null,o=false,h=((()=>{if("object"==typeof t){if("string"!=typeof t.delimiter||v.BAD_DELIMITERS.filter(function(e){return  -1!==t.delimiter.indexOf(e)}).length||(m=t.delimiter),"boolean"!=typeof t.quotes&&"function"!=typeof t.quotes&&!Array.isArray(t.quotes)||(n=t.quotes),"boolean"!=typeof t.skipEmptyLines&&"string"!=typeof t.skipEmptyLines||(i=t.skipEmptyLines),"string"==typeof t.newline&&(y=t.newline),"string"==typeof t.quoteChar&&(s=t.quoteChar),"boolean"==typeof t.header&&(_=t.header),Array.isArray(t.columns)){if(0===t.columns.length)throw new Error("Option columns is empty");r=t.columns;} void 0!==t.escapeChar&&(a=t.escapeChar+s),t.escapeFormulae instanceof RegExp?o=t.escapeFormulae:"boolean"==typeof t.escapeFormulae&&t.escapeFormulae&&(o=/^[=+\-@\t\r].*$/);}})(),new RegExp(P(s),"g"));"string"==typeof e&&(e=JSON.parse(e));if(Array.isArray(e)){if(!e.length||Array.isArray(e[0]))return u(null,e,i);if("object"==typeof e[0])return u(r||Object.keys(e[0]),e,i)}else if("object"==typeof e)return "string"==typeof e.data&&(e.data=JSON.parse(e.data)),Array.isArray(e.data)&&(e.fields||(e.fields=e.meta&&e.meta.fields||r),e.fields||(e.fields=Array.isArray(e.data[0])?e.fields:"object"==typeof e.data[0]?Object.keys(e.data[0]):[]),Array.isArray(e.data[0])||"object"==typeof e.data[0]||(e.data=[e.data])),u(e.fields||[],e.data||[],i);throw new Error("Unable to serialize unrecognized input");function u(e,t,i){var r="",n=("string"==typeof e&&(e=JSON.parse(e)),"string"==typeof t&&(t=JSON.parse(t)),Array.isArray(e)&&0<e.length),s=!Array.isArray(t[0]);if(n&&_){for(var a=0;a<e.length;a++)0<a&&(r+=m),r+=k(e[a],a);0<t.length&&(r+=y);}for(var o=0;o<t.length;o++){var h=(n?e:t[o]).length,u=false,d=n?0===Object.keys(t[o]).length:0===t[o].length;if(i&&!n&&(u="greedy"===i?""===t[o].join("").trim():1===t[o].length&&0===t[o][0].length),"greedy"===i&&n){for(var f=[],l=0;l<h;l++){var c=s?e[l]:l;f.push(t[o][c]);}u=""===f.join("").trim();}if(!u){for(var p=0;p<h;p++){0<p&&!d&&(r+=m);var g=n&&s?e[p]:p;r+=k(t[o][g],p);}o<t.length-1&&(!i||0<h&&!d)&&(r+=y);}}return r}function k(e,t){var i,r;return null==e?"":e.constructor===Date?JSON.stringify(e).slice(1,25):(r=false,o&&"string"==typeof e&&o.test(e)&&(e="'"+e,r=true),i=e.toString().replace(h,a),(r=r||true===n||"function"==typeof n&&n(e,t)||Array.isArray(n)&&n[t]||((e,t)=>{for(var i=0;i<t.length;i++)if(-1<e.indexOf(t[i]))return  true;return  false})(i,v.BAD_DELIMITERS)||-1<i.indexOf(m)||" "===i.charAt(0)||" "===i.charAt(i.length-1))?s+i+s:i)}},v.RECORD_SEP=String.fromCharCode(30),v.UNIT_SEP=String.fromCharCode(31),v.BYTE_ORDER_MARK="\ufeff",v.BAD_DELIMITERS=["\r","\n",'"',v.BYTE_ORDER_MARK],v.WORKERS_SUPPORTED=!s&&!!n.Worker,v.NODE_STREAM_INPUT=1,v.LocalChunkSize=10485760,v.RemoteChunkSize=5242880,v.DefaultDelimiter=",",v.Parser=E,v.ParserHandle=i,v.NetworkStreamer=f,v.FileStreamer=l,v.StringStreamer=c,v.ReadableStreamStreamer=p,n.jQuery&&((d=n.jQuery).fn.parse=function(o){var i=o.config||{},h=[];return this.each(function(e){if(!("INPUT"===d(this).prop("tagName").toUpperCase()&&"file"===d(this).attr("type").toLowerCase()&&n.FileReader)||!this.files||0===this.files.length)return  true;for(var t=0;t<this.files.length;t++)h.push({file:this.files[t],inputElem:this,instanceConfig:d.extend({},i)});}),e(),this;function e(){if(0===h.length)U(o.complete)&&o.complete();else {var e,t,i,r,n=h[0];if(U(o.before)){var s=o.before(n.file,n.inputElem);if("object"==typeof s){if("abort"===s.action)return e="AbortError",t=n.file,i=n.inputElem,r=s.reason,void(U(o.error)&&o.error({name:e},t,i,r));if("skip"===s.action)return void u();"object"==typeof s.config&&(n.instanceConfig=d.extend(n.instanceConfig,s.config));}else if("skip"===s)return void u()}var a=n.instanceConfig.complete;n.instanceConfig.complete=function(e){U(a)&&a(e,n.file,n.inputElem),u();},v.parse(n.file,n.instanceConfig);}}function u(){h.splice(0,1),e();}}),a&&(n.onmessage=function(e){e=e.data;void 0===v.WORKER_ID&&e&&(v.WORKER_ID=e.workerId);"string"==typeof e.input?n.postMessage({workerId:v.WORKER_ID,results:v.parse(e.input,e.config),finished:true}):(n.File&&e.input instanceof File||e.input instanceof Object)&&(e=v.parse(e.input,e.config))&&n.postMessage({workerId:v.WORKER_ID,results:e,finished:true});}),(f.prototype=Object.create(u.prototype)).constructor=f,(l.prototype=Object.create(u.prototype)).constructor=l,(c.prototype=Object.create(c.prototype)).constructor=c,(p.prototype=Object.create(u.prototype)).constructor=p,v}); 
} (papaparse_min$1));

var papaparse_minExports = papaparse_min$1.exports;

/**
 * The base implementation of `_.slice` without an iteratee call guard.
 *
 * @private
 * @param {Array} array The array to slice.
 * @param {number} [start=0] The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the slice of `array`.
 */
function baseSlice(array, start, end) {
  var index = -1,
      length = array.length;

  if (start < 0) {
    start = -start > length ? 0 : (length + start);
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : ((end - start) >>> 0);
  start >>>= 0;

  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0,
    MAX_INTEGER = 1.7976931348623157e+308;

/**
 * Converts `value` to a finite number.
 *
 * @static
 * @memberOf _
 * @since 4.12.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted number.
 * @example
 *
 * _.toFinite(3.2);
 * // => 3.2
 *
 * _.toFinite(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toFinite(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toFinite('3.2');
 * // => 3.2
 */
function toFinite(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = toNumber(value);
  if (value === INFINITY || value === -Infinity) {
    var sign = (value < 0 ? -1 : 1);
    return sign * MAX_INTEGER;
  }
  return value === value ? value : 0;
}

/**
 * Converts `value` to an integer.
 *
 * **Note:** This method is loosely based on
 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted integer.
 * @example
 *
 * _.toInteger(3.2);
 * // => 3
 *
 * _.toInteger(Number.MIN_VALUE);
 * // => 0
 *
 * _.toInteger(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toInteger('3.2');
 * // => 3
 */
function toInteger(value) {
  var result = toFinite(value),
      remainder = result % 1;

  return result === result ? (remainder ? result - remainder : result) : 0;
}

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeCeil = Math.ceil,
    nativeMax = Math.max;

/**
 * Creates an array of elements split into groups the length of `size`.
 * If `array` can't be split evenly, the final chunk will be the remaining
 * elements.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Array
 * @param {Array} array The array to process.
 * @param {number} [size=1] The length of each chunk
 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
 * @returns {Array} Returns the new array of chunks.
 * @example
 *
 * _.chunk(['a', 'b', 'c', 'd'], 2);
 * // => [['a', 'b'], ['c', 'd']]
 *
 * _.chunk(['a', 'b', 'c', 'd'], 3);
 * // => [['a', 'b', 'c'], ['d']]
 */
function chunk(array, size, guard) {
  if ((size === undefined)) {
    size = 1;
  } else {
    size = nativeMax(toInteger(size), 0);
  }
  var length = array == null ? 0 : array.length;
  if (!length || size < 1) {
    return [];
  }
  var index = 0,
      resIndex = 0,
      result = Array(nativeCeil(length / size));

  while (index < length) {
    result[resIndex++] = baseSlice(array, index, (index += size));
  }
  return result;
}

/**
 * A specialized version of `baseProperty` which supports deep paths.
 *
 * @private
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function basePropertyDeep(path) {
  return function(object) {
    return baseGet(object, path);
  };
}

/**
 * Creates a function that returns the value at `path` of a given object.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 * @example
 *
 * var objects = [
 *   { 'a': { 'b': 2 } },
 *   { 'a': { 'b': 1 } }
 * ];
 *
 * _.map(objects, _.property('a.b'));
 * // => [2, 1]
 *
 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
 * // => [1, 2]
 */
function property(path) {
  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
}

/**
 * The base implementation of `_.iteratee`.
 *
 * @private
 * @param {*} [value=_.identity] The value to convert to an iteratee.
 * @returns {Function} Returns the iteratee.
 */
function baseIteratee(value) {
  return property(value);
}

/**
 * This method is like `_.uniq` except that it accepts `iteratee` which is
 * invoked for each element in `array` to generate the criterion by which
 * uniqueness is computed. The order of result values is determined by the
 * order they occur in the array. The iteratee is invoked with one argument:
 * (value).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 * @example
 *
 * _.uniqBy([2.1, 1.2, 2.3], Math.floor);
 * // => [2.1, 1.2]
 *
 * // The `_.property` iteratee shorthand.
 * _.uniqBy([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
 * // => [{ 'x': 1 }, { 'x': 2 }]
 */
function uniqBy(array, iteratee) {
  return (array && array.length) ? baseUniq(array, baseIteratee(iteratee)) : [];
}

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var LegacyAuthContext = React3.createContext({});
var LegacyAuthContextProvider = /* @__PURE__ */ __name(({ children, isProvided, ...authOperations }) => {
  const { replace } = useNavigation();
  const loginFunc = /* @__PURE__ */ __name(async (params) => {
    var _a;
    try {
      const result = await ((_a = authOperations.login) == null ? void 0 : _a.call(authOperations, params));
      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  }, "loginFunc");
  const registerFunc = /* @__PURE__ */ __name(async (params) => {
    var _a;
    try {
      const result = await ((_a = authOperations.register) == null ? void 0 : _a.call(authOperations, params));
      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  }, "registerFunc");
  const logoutFunc = /* @__PURE__ */ __name(async (params) => {
    var _a;
    try {
      const redirectPath = await ((_a = authOperations.logout) == null ? void 0 : _a.call(authOperations, params));
      return redirectPath;
    } catch (error) {
      return Promise.reject(error);
    }
  }, "logoutFunc");
  const checkAuthFunc = /* @__PURE__ */ __name(async (params) => {
    var _a;
    try {
      await ((_a = authOperations.checkAuth) == null ? void 0 : _a.call(authOperations, params));
      return Promise.resolve();
    } catch (error) {
      if (error == null ? void 0 : error.redirectPath) {
        replace(error.redirectPath);
      }
      return Promise.reject(error);
    }
  }, "checkAuthFunc");
  return /* @__PURE__ */ React3.createElement(
    LegacyAuthContext.Provider,
    {
      value: {
        ...authOperations,
        login: loginFunc,
        logout: logoutFunc,
        checkAuth: checkAuthFunc,
        register: registerFunc,
        isProvided
      }
    },
    children
  );
}, "LegacyAuthContextProvider");
var AuthBindingsContext = React3.createContext(
  {}
);
var AuthBindingsContextProvider = /* @__PURE__ */ __name(({ children, isProvided, ...authBindings }) => {
  const handleLogin = /* @__PURE__ */ __name(async (params) => {
    var _a;
    try {
      const result = await ((_a = authBindings.login) == null ? void 0 : _a.call(authBindings, params));
      return result;
    } catch (error) {
      console.warn(
        "Unhandled Error in login: refine always expects a resolved promise.",
        error
      );
      return Promise.reject(error);
    }
  }, "handleLogin");
  const handleRegister = /* @__PURE__ */ __name(async (params) => {
    var _a;
    try {
      const result = await ((_a = authBindings.register) == null ? void 0 : _a.call(authBindings, params));
      return result;
    } catch (error) {
      console.warn(
        "Unhandled Error in register: refine always expects a resolved promise.",
        error
      );
      return Promise.reject(error);
    }
  }, "handleRegister");
  const handleLogout = /* @__PURE__ */ __name(async (params) => {
    var _a;
    try {
      const result = await ((_a = authBindings.logout) == null ? void 0 : _a.call(authBindings, params));
      return result;
    } catch (error) {
      console.warn(
        "Unhandled Error in logout: refine always expects a resolved promise.",
        error
      );
      return Promise.reject(error);
    }
  }, "handleLogout");
  const handleCheck = /* @__PURE__ */ __name(async (params) => {
    var _a;
    try {
      const result = await ((_a = authBindings.check) == null ? void 0 : _a.call(authBindings, params));
      return Promise.resolve(result);
    } catch (error) {
      console.warn(
        "Unhandled Error in check: refine always expects a resolved promise.",
        error
      );
      return Promise.reject(error);
    }
  }, "handleCheck");
  const handleForgotPassword = /* @__PURE__ */ __name(async (params) => {
    var _a;
    try {
      const result = await ((_a = authBindings.forgotPassword) == null ? void 0 : _a.call(authBindings, params));
      return Promise.resolve(result);
    } catch (error) {
      console.warn(
        "Unhandled Error in forgotPassword: refine always expects a resolved promise.",
        error
      );
      return Promise.reject(error);
    }
  }, "handleForgotPassword");
  const handleUpdatePassword = /* @__PURE__ */ __name(async (params) => {
    var _a;
    try {
      const result = await ((_a = authBindings.updatePassword) == null ? void 0 : _a.call(authBindings, params));
      return Promise.resolve(result);
    } catch (error) {
      console.warn(
        "Unhandled Error in updatePassword: refine always expects a resolved promise.",
        error
      );
      return Promise.reject(error);
    }
  }, "handleUpdatePassword");
  return /* @__PURE__ */ React3.createElement(
    AuthBindingsContext.Provider,
    {
      value: {
        ...authBindings,
        login: handleLogin,
        logout: handleLogout,
        check: handleCheck,
        register: handleRegister,
        forgotPassword: handleForgotPassword,
        updatePassword: handleUpdatePassword,
        isProvided
      }
    },
    children
  );
}, "AuthBindingsContextProvider");
var useLegacyAuthContext = /* @__PURE__ */ __name(() => {
  const context = React3.useContext(LegacyAuthContext);
  return context;
}, "useLegacyAuthContext");
var useAuthBindingsContext = /* @__PURE__ */ __name(() => {
  const context = React3.useContext(AuthBindingsContext);
  return context;
}, "useAuthBindingsContext");

// src/definitions/helpers/userFriendlySeconds/index.ts
var userFriendlySecond = /* @__PURE__ */ __name((miliseconds) => {
  return miliseconds / 1e3;
}, "userFriendlySecond");
var importCSVMapper = /* @__PURE__ */ __name((data, mapData = (item) => item) => {
  const [headers, ...body] = data;
  return body.map((entry) => fromPairs(zip(headers, entry))).map(
    (item, index, array) => mapData.call(void 0, item, index, array)
  );
}, "importCSVMapper");
var userFriendlyResourceName = /* @__PURE__ */ __name((resource = "", type) => {
  const humanizeResource = humanizeString(resource);
  if (type === "singular") {
    return undefined(humanizeResource);
  }
  return undefined(humanizeResource);
}, "userFriendlyResourceName");

// src/definitions/helpers/handleUseParams/index.tsx
var handleUseParams = /* @__PURE__ */ __name((params = {}) => {
  if (params == null ? void 0 : params.id) {
    return {
      ...params,
      id: decodeURIComponent(params.id)
    };
  }
  return params;
}, "handleUseParams");

// src/definitions/helpers/keys/index.ts
function arrayFindIndex(array, slice) {
  return array.findIndex(
    (item, index) => index <= array.length - slice.length && slice.every(
      (sliceItem, sliceIndex) => array[index + sliceIndex] === sliceItem
    )
  );
}
__name(arrayFindIndex, "arrayFindIndex");
function convertToLegacy(segments) {
  if (segments[0] === "data") {
    const newSegments = segments.slice(1);
    if (newSegments[2] === "many") {
      newSegments[2] = "getMany";
    } else if (newSegments[2] === "infinite") {
      newSegments[2] = "list";
    } else if (newSegments[2] === "one") {
      newSegments[2] = "detail";
    } else if (newSegments[1] === "custom") {
      const newParams = {
        ...newSegments[2]
      };
      delete newParams.method;
      delete newParams.url;
      return [
        newSegments[0],
        newSegments[1],
        newSegments[2].method,
        newSegments[2].url,
        newParams
      ];
    }
    return newSegments;
  }
  if (segments[0] === "audit") {
    if (segments[2] === "list") {
      return ["logList", segments[1], segments[3]];
    }
  }
  if (segments[0] === "access") {
    if (segments.length === 4) {
      return [
        "useCan",
        {
          resource: segments[1],
          action: segments[2],
          ...segments[3]
          // params: { params, enabled }
        }
      ];
    }
  }
  if (segments[0] === "auth") {
    if (arrayFindIndex(segments, ["auth", "login"]) !== -1) {
      return ["useLogin"];
    }
    if (arrayFindIndex(segments, ["auth", "logout"]) !== -1) {
      return ["useLogout"];
    }
    if (arrayFindIndex(segments, ["auth", "identity"]) !== -1) {
      return ["getUserIdentity"];
    }
    if (arrayFindIndex(segments, ["auth", "register"]) !== -1) {
      return ["useRegister"];
    }
    if (arrayFindIndex(segments, ["auth", "forgotPassword"]) !== -1) {
      return ["useForgotPassword"];
    }
    if (arrayFindIndex(segments, ["auth", "check"]) !== -1) {
      return ["useAuthenticated", segments[2]];
    }
    if (arrayFindIndex(segments, ["auth", "onError"]) !== -1) {
      return ["useCheckError"];
    }
    if (arrayFindIndex(segments, ["auth", "permissions"]) !== -1) {
      return ["usePermissions"];
    }
    if (arrayFindIndex(segments, ["auth", "updatePassword"]) !== -1) {
      return ["useUpdatePassword"];
    }
  }
  return segments;
}
__name(convertToLegacy, "convertToLegacy");
var BaseKeyBuilder = class {
  constructor(segments = []) {
    this.segments = [];
    this.segments = segments;
  }
  key() {
    return this.segments;
  }
  legacy() {
    return convertToLegacy(this.segments);
  }
  get(legacy) {
    return legacy ? this.legacy() : this.segments;
  }
};
__name(BaseKeyBuilder, "BaseKeyBuilder");
var ParamsKeyBuilder = class extends BaseKeyBuilder {
  params(paramsValue) {
    return new BaseKeyBuilder([...this.segments, paramsValue]);
  }
};
__name(ParamsKeyBuilder, "ParamsKeyBuilder");
var DataIdRequiringKeyBuilder = class extends BaseKeyBuilder {
  id(idValue) {
    return new ParamsKeyBuilder([
      ...this.segments,
      idValue ? String(idValue) : void 0
    ]);
  }
};
__name(DataIdRequiringKeyBuilder, "DataIdRequiringKeyBuilder");
var DataIdsRequiringKeyBuilder = class extends BaseKeyBuilder {
  ids(...idsValue) {
    return new ParamsKeyBuilder([
      ...this.segments,
      ...idsValue.length ? [idsValue.map((el) => String(el))] : []
    ]);
  }
};
__name(DataIdsRequiringKeyBuilder, "DataIdsRequiringKeyBuilder");
var DataResourceKeyBuilder = class extends BaseKeyBuilder {
  action(actionType) {
    if (actionType === "one") {
      return new DataIdRequiringKeyBuilder([...this.segments, actionType]);
    }
    if (actionType === "many") {
      return new DataIdsRequiringKeyBuilder([...this.segments, actionType]);
    }
    if (["list", "infinite"].includes(actionType)) {
      return new ParamsKeyBuilder([...this.segments, actionType]);
    }
    throw new Error("Invalid action type");
  }
};
__name(DataResourceKeyBuilder, "DataResourceKeyBuilder");
var DataKeyBuilder = class extends BaseKeyBuilder {
  resource(resourceName) {
    return new DataResourceKeyBuilder([...this.segments, resourceName]);
  }
  mutation(mutationName) {
    return new ParamsKeyBuilder([
      ...mutationName === "custom" ? this.segments : [this.segments[0]],
      mutationName
    ]);
  }
};
__name(DataKeyBuilder, "DataKeyBuilder");
var AuthKeyBuilder = class extends BaseKeyBuilder {
  action(actionType) {
    return new ParamsKeyBuilder([...this.segments, actionType]);
  }
};
__name(AuthKeyBuilder, "AuthKeyBuilder");
var AccessResourceKeyBuilder = class extends BaseKeyBuilder {
  action(resourceName) {
    return new ParamsKeyBuilder([...this.segments, resourceName]);
  }
};
__name(AccessResourceKeyBuilder, "AccessResourceKeyBuilder");
var AccessKeyBuilder = class extends BaseKeyBuilder {
  resource(resourceName) {
    return new AccessResourceKeyBuilder([...this.segments, resourceName]);
  }
};
__name(AccessKeyBuilder, "AccessKeyBuilder");
var AuditActionKeyBuilder = class extends BaseKeyBuilder {
  action(actionType) {
    return new ParamsKeyBuilder([...this.segments, actionType]);
  }
};
__name(AuditActionKeyBuilder, "AuditActionKeyBuilder");
var AuditKeyBuilder = class extends BaseKeyBuilder {
  resource(resourceName) {
    return new AuditActionKeyBuilder([...this.segments, resourceName]);
  }
  action(actionType) {
    return new ParamsKeyBuilder([...this.segments, actionType]);
  }
};
__name(AuditKeyBuilder, "AuditKeyBuilder");
var KeyBuilder = class extends BaseKeyBuilder {
  data(name) {
    return new DataKeyBuilder(["data", name || "default"]);
  }
  auth() {
    return new AuthKeyBuilder(["auth"]);
  }
  access() {
    return new AccessKeyBuilder(["access"]);
  }
  audit() {
    return new AuditKeyBuilder(["audit"]);
  }
};
__name(KeyBuilder, "KeyBuilder");
var keys = /* @__PURE__ */ __name(() => new KeyBuilder([]), "keys");

// src/definitions/helpers/pickNotDeprecated/index.ts
var pickNotDeprecated = /* @__PURE__ */ __name((...args) => {
  return args.find((arg) => typeof arg !== "undefined");
}, "pickNotDeprecated");

// src/definitions/helpers/queryKeys/index.ts
var queryKeys = /* @__PURE__ */ __name((resource, dataProviderName, meta, metaData) => {
  const providerName = dataProviderName || "default";
  const keys2 = {
    all: [providerName],
    resourceAll: [providerName, resource || ""],
    list: (config) => [
      ...keys2.resourceAll,
      "list",
      {
        ...config,
        ...pickNotDeprecated(meta, metaData) || {}
      }
    ],
    many: (ids) => [
      ...keys2.resourceAll,
      "getMany",
      ids == null ? void 0 : ids.map(String),
      { ...pickNotDeprecated(meta, metaData) || {} }
    ].filter((item) => item !== void 0),
    detail: (id) => [
      ...keys2.resourceAll,
      "detail",
      id == null ? void 0 : id.toString(),
      { ...pickNotDeprecated(meta, metaData) || {} }
    ],
    logList: (meta2) => ["logList", resource, meta2, metaData].filter(
      (item) => item !== void 0
    )
  };
  return keys2;
}, "queryKeys");
var queryKeysReplacement = /* @__PURE__ */ __name((preferLegacyKeys) => {
  return (resource, dataProviderName, meta, metaData) => {
    const providerName = dataProviderName || "default";
    const keys2 = {
      all: keys().data(providerName).get(preferLegacyKeys),
      resourceAll: keys().data(dataProviderName).resource(resource ?? "").get(preferLegacyKeys),
      list: (config) => keys().data(dataProviderName).resource(resource ?? "").action("list").params({
        ...config,
        ...pickNotDeprecated(meta, metaData) || {}
      }).get(preferLegacyKeys),
      many: (ids) => keys().data(dataProviderName).resource(resource ?? "").action("many").ids(...ids ?? []).params({
        ...pickNotDeprecated(meta, metaData) || {}
      }).get(preferLegacyKeys),
      detail: (id) => keys().data(dataProviderName).resource(resource ?? "").action("one").id(id ?? "").params({
        ...pickNotDeprecated(meta, metaData) || {}
      }).get(preferLegacyKeys),
      logList: (meta2) => [
        ...keys().audit().resource(resource).action("list").params(meta2).get(preferLegacyKeys),
        metaData
      ].filter((item) => item !== void 0)
    };
    return keys2;
  };
}, "queryKeysReplacement");

// src/definitions/helpers/hasPermission/index.ts
var hasPermission = /* @__PURE__ */ __name((permissions, action) => {
  if (!permissions || !action) {
    return false;
  }
  return !!permissions.find((i) => i === action);
}, "hasPermission");

// src/definitions/helpers/router/is-parameter.ts
var isParameter = /* @__PURE__ */ __name((segment) => {
  return segment.startsWith(":");
}, "isParameter");

// src/definitions/helpers/router/split-to-segments.ts
var splitToSegments = /* @__PURE__ */ __name((path) => {
  const segments = path.split("/").filter((segment) => segment !== "");
  return segments;
}, "splitToSegments");

// src/definitions/helpers/router/is-segment-counts-same.ts
var isSegmentCountsSame = /* @__PURE__ */ __name((route, resourceRoute) => {
  const routeSegments = splitToSegments(route);
  const resourceRouteSegments = splitToSegments(resourceRoute);
  return routeSegments.length === resourceRouteSegments.length;
}, "isSegmentCountsSame");

// src/definitions/helpers/router/remove-leading-trailing-slashes.ts
var removeLeadingTrailingSlashes = /* @__PURE__ */ __name((route) => {
  return route.replace(/^\/|\/$/g, "");
}, "removeLeadingTrailingSlashes");

// src/definitions/helpers/router/check-by-segments.ts
var checkBySegments = /* @__PURE__ */ __name((route, resourceRoute) => {
  const stdRoute = removeLeadingTrailingSlashes(route);
  const stdResourceRoute = removeLeadingTrailingSlashes(resourceRoute);
  if (!isSegmentCountsSame(stdRoute, stdResourceRoute)) {
    return false;
  }
  const routeSegments = splitToSegments(stdRoute);
  const resourceRouteSegments = splitToSegments(stdResourceRoute);
  return resourceRouteSegments.every((segment, index) => {
    return isParameter(segment) || segment === routeSegments[index];
  });
}, "checkBySegments");

// src/definitions/helpers/router/get-default-action-path.ts
var getDefaultActionPath = /* @__PURE__ */ __name((resourceName, action, parentPrefix) => {
  const cleanParentPrefix = removeLeadingTrailingSlashes(parentPrefix || "");
  let path = `${cleanParentPrefix}${cleanParentPrefix ? "/" : ""}${resourceName}`;
  if (action === "list") {
    path = `${path}`;
  } else if (action === "create") {
    path = `${path}/create`;
  } else if (action === "edit") {
    path = `${path}/edit/:id`;
  } else if (action === "show") {
    path = `${path}/show/:id`;
  } else if (action === "clone") {
    path = `${path}/clone/:id`;
  }
  return `/${path.replace(/^\//, "")}`;
}, "getDefaultActionPath");

// src/definitions/helpers/router/get-parent-resource.ts
var getParentResource = /* @__PURE__ */ __name((resource, resources) => {
  var _a, _b;
  const parentName = pickNotDeprecated(
    (_a = resource.meta) == null ? void 0 : _a.parent,
    (_b = resource.options) == null ? void 0 : _b.parent,
    resource.parentName
  );
  if (!parentName) {
    return void 0;
  }
  const parentResource = resources.find(
    (resource2) => (resource2.identifier ?? resource2.name) === parentName
  );
  return parentResource ?? { name: parentName };
}, "getParentResource");

// src/definitions/helpers/router/get-parent-prefix-for-resource.ts
var getParentPrefixForResource = /* @__PURE__ */ __name((resource, resources, legacy) => {
  const parents = [];
  let parent = getParentResource(resource, resources);
  while (parent) {
    parents.push(parent);
    parent = getParentResource(parent, resources);
  }
  if (parents.length === 0) {
    return void 0;
  }
  return `/${parents.reverse().map((parent2) => {
    var _a;
    const v = legacy ? ((_a = parent2.options) == null ? void 0 : _a.route) ?? parent2.name : parent2.name;
    return removeLeadingTrailingSlashes(v);
  }).join("/")}`;
}, "getParentPrefixForResource");

// src/definitions/helpers/router/get-action-routes-from-resource.ts
var getActionRoutesFromResource = /* @__PURE__ */ __name((resource, resources, legacy) => {
  const actions = [];
  const actionList = ["list", "show", "edit", "create", "clone"];
  const parentPrefix = getParentPrefixForResource(resource, resources, legacy);
  actionList.forEach((action) => {
    var _a, _b;
    const item = legacy && action === "clone" ? resource.create : resource[action];
    let route = void 0;
    if (typeof item === "function" || legacy) {
      route = getDefaultActionPath(
        legacy ? ((_a = resource.meta) == null ? void 0 : _a.route) ?? ((_b = resource.options) == null ? void 0 : _b.route) ?? resource.name : resource.name,
        action,
        legacy ? parentPrefix : void 0
      );
    } else if (typeof item === "string") {
      route = item;
    } else if (typeof item === "object") {
      route = item.path;
    }
    if (route) {
      actions.push({
        action,
        resource,
        route: `/${route.replace(/^\//, "")}`
      });
    }
  });
  return actions;
}, "getActionRoutesFromResource");

// src/definitions/helpers/router/pick-matched-route.ts
var pickMatchedRoute = /* @__PURE__ */ __name((routes) => {
  var _a;
  if (routes.length === 0) {
    return void 0;
  }
  if (routes.length === 1) {
    return routes[0];
  }
  const sanitizedRoutes = routes.map((route) => ({
    ...route,
    splitted: splitToSegments(removeLeadingTrailingSlashes(route.route))
  }));
  const segmentsCount = ((_a = sanitizedRoutes[0]) == null ? void 0 : _a.splitted.length) ?? 0;
  let eligibleRoutes = [
    ...sanitizedRoutes
  ];
  for (let i = 0; i < segmentsCount; i++) {
    const nonParametrizedRoutes = eligibleRoutes.filter(
      (route) => !isParameter(route.splitted[i])
    );
    if (nonParametrizedRoutes.length === 0) {
      continue;
    }
    if (nonParametrizedRoutes.length === 1) {
      eligibleRoutes = nonParametrizedRoutes;
      break;
    }
    eligibleRoutes = nonParametrizedRoutes;
  }
  return eligibleRoutes[0];
}, "pickMatchedRoute");

// src/definitions/helpers/router/match-resource-from-route.ts
var matchResourceFromRoute = /* @__PURE__ */ __name((route, resources) => {
  const allActionRoutes = resources.flatMap((resource) => {
    return getActionRoutesFromResource(resource, resources);
  });
  const allFound = allActionRoutes.filter((actionRoute) => {
    return checkBySegments(route, actionRoute.route);
  });
  const mostEligible = pickMatchedRoute(allFound);
  return {
    found: !!mostEligible,
    resource: mostEligible == null ? void 0 : mostEligible.resource,
    action: mostEligible == null ? void 0 : mostEligible.action,
    matchedRoute: mostEligible == null ? void 0 : mostEligible.route
  };
}, "matchResourceFromRoute");

// src/definitions/helpers/routeGenerator/index.ts
var routeGenerator = /* @__PURE__ */ __name((item, resourcesFromProps) => {
  var _a;
  let route;
  const parentPrefix = getParentPrefixForResource(
    item,
    resourcesFromProps,
    true
  );
  if (parentPrefix) {
    const meta = pickNotDeprecated(item.meta, item.options);
    route = `${parentPrefix}/${(meta == null ? void 0 : meta.route) ?? item.name}`;
  } else {
    route = ((_a = item.options) == null ? void 0 : _a.route) ?? item.name;
  }
  return `/${route.replace(/^\//, "")}`;
}, "routeGenerator");

// src/definitions/helpers/treeView/createTreeView/index.ts
var createTreeView = /* @__PURE__ */ __name((resources) => {
  var _a;
  const tree = [];
  const resourcesRouteObject = {};
  const resourcesNameObject = {};
  let parent;
  let child;
  for (let i = 0; i < resources.length; i++) {
    parent = resources[i];
    const route = parent.route ?? ((_a = pickNotDeprecated(parent == null ? void 0 : parent.meta, parent.options)) == null ? void 0 : _a.route) ?? "";
    resourcesRouteObject[route] = parent;
    resourcesRouteObject[route]["children"] = [];
    resourcesNameObject[parent.name] = parent;
    resourcesNameObject[parent.name]["children"] = [];
  }
  for (const name in resourcesRouteObject) {
    if (Object.hasOwn(resourcesRouteObject, name)) {
      child = resourcesRouteObject[name];
      if (child.parentName && resourcesNameObject[child.parentName]) {
        resourcesNameObject[child.parentName]["children"].push(child);
      } else {
        tree.push(child);
      }
    }
  }
  return tree;
}, "createTreeView");

// src/definitions/helpers/humanizeString/index.ts
var humanizeString = /* @__PURE__ */ __name((text2) => {
  text2 = text2.replace(/([a-z]{1})([A-Z]{1})/g, "$1-$2");
  text2 = text2.replace(/([A-Z]{1})([A-Z]{1})([a-z]{1})/g, "$1-$2$3");
  text2 = text2.toLowerCase().replace(/[_-]+/g, " ").replace(/\s{2,}/g, " ").trim();
  text2 = text2.charAt(0).toUpperCase() + text2.slice(1);
  return text2;
}, "humanizeString");
var DefaultLayout = /* @__PURE__ */ __name(({ children }) => {
  return /* @__PURE__ */ React3.createElement("div", null, children);
}, "DefaultLayout");

// src/contexts/refine/index.tsx
var defaultTitle = {
  icon: /* @__PURE__ */ React3.createElement(
    "svg",
    {
      width: 24,
      height: 24,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      "data-testid": "refine-logo",
      id: "refine-default-logo"
    },
    /* @__PURE__ */ React3.createElement(
      "path",
      {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M13.7889 0.422291C12.6627 -0.140764 11.3373 -0.140764 10.2111 0.422291L2.21115 4.42229C0.85601 5.09986 0 6.48491 0 8V16C0 17.5151 0.85601 18.9001 2.21115 19.5777L10.2111 23.5777C11.3373 24.1408 12.6627 24.1408 13.7889 23.5777L21.7889 19.5777C23.144 18.9001 24 17.5151 24 16V8C24 6.48491 23.144 5.09986 21.7889 4.42229L13.7889 0.422291ZM8 8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8V16C16 18.2091 14.2091 20 12 20C9.79086 20 8 18.2091 8 16V8Z",
        fill: "currentColor"
      }
    ),
    /* @__PURE__ */ React3.createElement(
      "path",
      {
        d: "M14 8C14 9.10457 13.1046 10 12 10C10.8954 10 10 9.10457 10 8C10 6.89543 10.8954 6 12 6C13.1046 6 14 6.89543 14 8Z",
        fill: "currentColor"
      }
    )
  ),
  text: "Refine Project"
};
var defaultRefineOptions = {
  mutationMode: "pessimistic",
  syncWithLocation: false,
  undoableTimeout: 5e3,
  warnWhenUnsavedChanges: false,
  liveMode: "off",
  redirect: {
    afterCreate: "list",
    afterClone: "list",
    afterEdit: "list"
  },
  overtime: {
    enabled: true,
    interval: 1e3
  },
  textTransformers: {
    humanize: humanizeString,
    plural: exports$1.plural,
    singular: exports$1.singular
  },
  disableServerSideValidation: false,
  title: defaultTitle
};
var RefineContext = React3.createContext({
  hasDashboard: false,
  mutationMode: "pessimistic",
  warnWhenUnsavedChanges: false,
  syncWithLocation: false,
  undoableTimeout: 5e3,
  Title: void 0,
  Sider: void 0,
  Header: void 0,
  Footer: void 0,
  Layout: DefaultLayout,
  OffLayoutArea: void 0,
  liveMode: "off",
  onLiveEvent: void 0,
  options: defaultRefineOptions
});
var RefineContextProvider = /* @__PURE__ */ __name(({
  hasDashboard,
  mutationMode,
  warnWhenUnsavedChanges,
  syncWithLocation,
  undoableTimeout,
  children,
  DashboardPage,
  Title,
  Layout = DefaultLayout,
  Header,
  Sider,
  Footer,
  OffLayoutArea,
  LoginPage: LoginPage3 = LoginPage,
  catchAll,
  liveMode = "off",
  onLiveEvent,
  options
}) => {
  return /* @__PURE__ */ React3.createElement(
    RefineContext.Provider,
    {
      value: {
        __initialized: true,
        hasDashboard,
        mutationMode,
        warnWhenUnsavedChanges,
        syncWithLocation,
        Title,
        undoableTimeout,
        Layout,
        Header,
        Sider,
        Footer,
        OffLayoutArea,
        DashboardPage,
        LoginPage: LoginPage3,
        catchAll,
        liveMode,
        onLiveEvent,
        options
      }
    },
    children
  );
}, "RefineContextProvider");

// src/definitions/helpers/handleRefineOptions/index.ts
var handleRefineOptions = /* @__PURE__ */ __name(({
  options,
  disableTelemetry,
  liveMode,
  mutationMode,
  reactQueryClientConfig,
  reactQueryDevtoolConfig,
  syncWithLocation,
  undoableTimeout,
  warnWhenUnsavedChanges
} = {}) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
  const optionsWithDefaults = {
    breadcrumb: options == null ? void 0 : options.breadcrumb,
    mutationMode: (options == null ? void 0 : options.mutationMode) ?? mutationMode ?? defaultRefineOptions.mutationMode,
    undoableTimeout: (options == null ? void 0 : options.undoableTimeout) ?? undoableTimeout ?? defaultRefineOptions.undoableTimeout,
    syncWithLocation: (options == null ? void 0 : options.syncWithLocation) ?? syncWithLocation ?? defaultRefineOptions.syncWithLocation,
    warnWhenUnsavedChanges: (options == null ? void 0 : options.warnWhenUnsavedChanges) ?? warnWhenUnsavedChanges ?? defaultRefineOptions.warnWhenUnsavedChanges,
    liveMode: (options == null ? void 0 : options.liveMode) ?? liveMode ?? defaultRefineOptions.liveMode,
    redirect: {
      afterCreate: ((_a = options == null ? void 0 : options.redirect) == null ? void 0 : _a.afterCreate) ?? defaultRefineOptions.redirect.afterCreate,
      afterClone: ((_b = options == null ? void 0 : options.redirect) == null ? void 0 : _b.afterClone) ?? defaultRefineOptions.redirect.afterClone,
      afterEdit: ((_c = options == null ? void 0 : options.redirect) == null ? void 0 : _c.afterEdit) ?? defaultRefineOptions.redirect.afterEdit
    },
    overtime: (options == null ? void 0 : options.overtime) ?? defaultRefineOptions.overtime,
    textTransformers: {
      humanize: ((_d = options == null ? void 0 : options.textTransformers) == null ? void 0 : _d.humanize) ?? defaultRefineOptions.textTransformers.humanize,
      plural: ((_e = options == null ? void 0 : options.textTransformers) == null ? void 0 : _e.plural) ?? defaultRefineOptions.textTransformers.plural,
      singular: ((_f = options == null ? void 0 : options.textTransformers) == null ? void 0 : _f.singular) ?? defaultRefineOptions.textTransformers.singular
    },
    disableServerSideValidation: (options == null ? void 0 : options.disableServerSideValidation) ?? defaultRefineOptions.disableServerSideValidation,
    projectId: options == null ? void 0 : options.projectId,
    useNewQueryKeys: options == null ? void 0 : options.useNewQueryKeys,
    title: {
      icon: typeof ((_g = options == null ? void 0 : options.title) == null ? void 0 : _g.icon) === "undefined" ? defaultRefineOptions.title.icon : (_h = options == null ? void 0 : options.title) == null ? void 0 : _h.icon,
      text: typeof ((_i = options == null ? void 0 : options.title) == null ? void 0 : _i.text) === "undefined" ? defaultRefineOptions.title.text : (_j = options == null ? void 0 : options.title) == null ? void 0 : _j.text
    }
  };
  const disableTelemetryWithDefault = (options == null ? void 0 : options.disableTelemetry) ?? disableTelemetry ?? false;
  const reactQueryWithDefaults = {
    clientConfig: ((_k = options == null ? void 0 : options.reactQuery) == null ? void 0 : _k.clientConfig) ?? reactQueryClientConfig ?? {},
    devtoolConfig: ((_l = options == null ? void 0 : options.reactQuery) == null ? void 0 : _l.devtoolConfig) ?? reactQueryDevtoolConfig ?? {}
  };
  return {
    optionsWithDefaults,
    disableTelemetryWithDefault,
    reactQueryWithDefaults
  };
}, "handleRefineOptions");

// src/definitions/helpers/redirectPage/index.ts
var redirectPage = /* @__PURE__ */ __name(({
  redirectFromProps,
  action,
  redirectOptions
}) => {
  if (redirectFromProps || redirectFromProps === false) {
    return redirectFromProps;
  }
  switch (action) {
    case "clone":
      return redirectOptions.afterClone;
    case "create":
      return redirectOptions.afterCreate;
    case "edit":
      return redirectOptions.afterEdit;
    default:
      return false;
  }
}, "redirectPage");

// src/definitions/helpers/sequentialPromises/index.ts
var sequentialPromises = /* @__PURE__ */ __name(async (promises, onEachResolve, onEachReject) => {
  const results = [];
  for (const [index, promise] of promises.entries()) {
    try {
      const result = await promise();
      results.push(onEachResolve(result, index));
    } catch (error) {
      results.push(onEachReject(error, index));
    }
  }
  return results;
}, "sequentialPromises");

// src/definitions/helpers/pick-resource/index.ts
var pickResource = /* @__PURE__ */ __name((identifier, resources = [], legacy = false) => {
  if (!identifier) {
    return void 0;
  }
  if (legacy) {
    const resourceByRoute = resources.find(
      (r) => removeLeadingTrailingSlashes(r.route ?? "") === removeLeadingTrailingSlashes(identifier)
    );
    const resource2 = resourceByRoute ? resourceByRoute : resources.find((r) => r.name === identifier);
    return resource2;
  }
  let resource = resources.find((r) => r.identifier === identifier);
  if (!resource) {
    resource = resources.find((r) => r.name === identifier);
  }
  return resource;
}, "pickResource");

// src/definitions/helpers/pickDataProvider/index.ts
var pickDataProvider = /* @__PURE__ */ __name((resourceName, dataProviderName, resources) => {
  if (dataProviderName) {
    return dataProviderName;
  }
  const resource = pickResource(resourceName, resources);
  const meta = pickNotDeprecated(resource == null ? void 0 : resource.meta, resource == null ? void 0 : resource.options);
  if (meta == null ? void 0 : meta.dataProviderName) {
    return meta.dataProviderName;
  }
  return "default";
}, "pickDataProvider");

// src/definitions/helpers/handleMultiple/index.ts
var handleMultiple = /* @__PURE__ */ __name(async (promises) => {
  return {
    data: (await Promise.all(promises)).map((res) => res.data)
  };
}, "handleMultiple");

// src/definitions/helpers/useInfinitePagination/index.ts
var getNextPageParam = /* @__PURE__ */ __name((lastPage) => {
  const { pagination, cursor } = lastPage;
  if (cursor == null ? void 0 : cursor.next) {
    return cursor.next;
  }
  const current = (pagination == null ? void 0 : pagination.current) || 1;
  const pageSize = (pagination == null ? void 0 : pagination.pageSize) || 10;
  const totalPages = Math.ceil((lastPage.total || 0) / pageSize);
  return current < totalPages ? Number(current) + 1 : void 0;
}, "getNextPageParam");
var getPreviousPageParam = /* @__PURE__ */ __name((lastPage) => {
  const { pagination, cursor } = lastPage;
  if (cursor == null ? void 0 : cursor.prev) {
    return cursor.prev;
  }
  const current = (pagination == null ? void 0 : pagination.current) || 1;
  return current === 1 ? void 0 : current - 1;
}, "getPreviousPageParam");

// src/definitions/helpers/legacy-resource-transform/index.ts
var legacyResourceTransform = /* @__PURE__ */ __name((resources) => {
  const _resources = [];
  resources.forEach((resource) => {
    var _a, _b;
    _resources.push({
      ...resource,
      label: ((_a = resource.meta) == null ? void 0 : _a.label) ?? ((_b = resource.options) == null ? void 0 : _b.label),
      route: routeGenerator(resource, resources),
      canCreate: !!resource.create,
      canEdit: !!resource.edit,
      canShow: !!resource.show,
      canDelete: resource.canDelete
    });
  });
  return _resources;
}, "legacyResourceTransform");

// src/definitions/helpers/router/pick-route-params.ts
var pickRouteParams = /* @__PURE__ */ __name((route) => {
  const segments = splitToSegments(removeLeadingTrailingSlashes(route));
  return segments.flatMap((s) => {
    if (isParameter(s)) {
      return [s.slice(1)];
    }
    return [];
  });
}, "pickRouteParams");

// src/definitions/helpers/router/prepare-route-params.ts
var prepareRouteParams = /* @__PURE__ */ __name((routeParams, meta = {}) => {
  return routeParams.reduce(
    (acc, key) => {
      const value = meta[key];
      if (typeof value !== "undefined") {
        acc[key] = value;
      }
      return acc;
    },
    {}
  );
}, "prepareRouteParams");

// src/definitions/helpers/router/compose-route.ts
var composeRoute = /* @__PURE__ */ __name((designatedRoute, resourceMeta = {}, parsed = {}, meta = {}) => {
  const routeParams = pickRouteParams(designatedRoute);
  const preparedRouteParams = prepareRouteParams(routeParams, {
    ...resourceMeta,
    ...typeof (parsed == null ? void 0 : parsed.id) !== "undefined" ? { id: parsed.id } : {},
    ...typeof (parsed == null ? void 0 : parsed.action) !== "undefined" ? { action: parsed.action } : {},
    ...typeof (parsed == null ? void 0 : parsed.resource) !== "undefined" ? { resource: parsed.resource } : {},
    ...parsed == null ? void 0 : parsed.params,
    ...meta
  });
  return designatedRoute.replace(/:([^\/]+)/g, (match, key) => {
    const fromParams = preparedRouteParams[key];
    if (typeof fromParams !== "undefined") {
      return `${fromParams}`;
    }
    return match;
  });
}, "composeRoute");

// src/definitions/helpers/useActiveAuthProvider/index.ts
var useActiveAuthProvider = /* @__PURE__ */ __name(() => {
  const legacyAuthProvider = useLegacyAuthContext();
  const authProvider = useAuthBindingsContext();
  if (authProvider.isProvided) {
    return { isLegacy: false, ...authProvider };
  }
  if (legacyAuthProvider.isProvided) {
    return {
      isLegacy: true,
      ...legacyAuthProvider,
      check: legacyAuthProvider.checkAuth,
      onError: legacyAuthProvider.checkError,
      getIdentity: legacyAuthProvider.getUserIdentity
    };
  }
  return null;
}, "useActiveAuthProvider");

// src/definitions/helpers/handlePaginationParams/index.ts
var handlePaginationParams = /* @__PURE__ */ __name(({
  hasPagination,
  pagination,
  configPagination
} = {}) => {
  const hasPaginationString = hasPagination === false ? "off" : "server";
  const mode = (pagination == null ? void 0 : pagination.mode) ?? hasPaginationString;
  const current = pickNotDeprecated(pagination == null ? void 0 : pagination.current, configPagination == null ? void 0 : configPagination.current) ?? 1;
  const pageSize = pickNotDeprecated(pagination == null ? void 0 : pagination.pageSize, configPagination == null ? void 0 : configPagination.pageSize) ?? 10;
  return {
    current,
    pageSize,
    mode
  };
}, "handlePaginationParams");
var useMediaQuery = /* @__PURE__ */ __name((query) => {
  const [matches, setMatches] = dashboard__loadShare__react__loadShare__.useState(false);
  dashboard__loadShare__react__loadShare__.useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = /* @__PURE__ */ __name(() => setMatches(media.matches), "listener");
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [matches, query]);
  return matches;
}, "useMediaQuery");

// src/definitions/helpers/safe-translate/index.ts
var safeTranslate = /* @__PURE__ */ __name((translate, key, defaultMessage, options) => {
  const translated = options ? translate(key, options, defaultMessage) : translate(key, defaultMessage);
  const fallback = defaultMessage ?? key;
  if (translated === key || typeof translated === "undefined") {
    return fallback;
  }
  return translated;
}, "safeTranslate");

// src/definitions/helpers/generateDocumentTitle/index.ts
function generateDefaultDocumentTitle(translate, resource, action, id, resourceName) {
  var _a;
  const actionPrefixMatcher = {
    create: "Create new ",
    clone: `#${id ?? ""} Clone `,
    edit: `#${id ?? ""} Edit `,
    show: `#${id ?? ""} Show `,
    list: ""
  };
  const identifier = (resource == null ? void 0 : resource.identifier) ?? (resource == null ? void 0 : resource.name);
  const resourceNameFallback = (resource == null ? void 0 : resource.label) ?? ((_a = resource == null ? void 0 : resource.meta) == null ? void 0 : _a.label) ?? userFriendlyResourceName(
    identifier,
    action === "list" ? "plural" : "singular"
  );
  const resourceNameWithFallback = resourceName ?? resourceNameFallback;
  const defaultTitle2 = safeTranslate(
    translate,
    "documentTitle.default",
    "Refine"
  );
  const suffix = safeTranslate(translate, "documentTitle.suffix", " | Refine");
  let autoGeneratedTitle = defaultTitle2;
  if (action && identifier) {
    autoGeneratedTitle = safeTranslate(
      translate,
      `documentTitle.${identifier}.${action}`,
      `${actionPrefixMatcher[action] ?? ""}${resourceNameWithFallback}${suffix}`,
      { id }
    );
  }
  return autoGeneratedTitle;
}
__name(generateDefaultDocumentTitle, "generateDefaultDocumentTitle");
var useMutationMode = /* @__PURE__ */ __name((preferredMutationMode, preferredUndoableTimeout) => {
  const { mutationMode, undoableTimeout } = dashboard__loadShare__react__loadShare__.useContext(RefineContext);
  return {
    mutationMode: preferredMutationMode ?? mutationMode,
    undoableTimeout: preferredUndoableTimeout ?? undoableTimeout
  };
}, "useMutationMode");
var UnsavedWarnContext = React3.createContext({});
var UnsavedWarnContextProvider = /* @__PURE__ */ __name(({
  children
}) => {
  const [warnWhen, setWarnWhen] = dashboard__loadShare__react__loadShare__.useState(false);
  return /* @__PURE__ */ React3.createElement(UnsavedWarnContext.Provider, { value: { warnWhen, setWarnWhen } }, children);
}, "UnsavedWarnContextProvider");

// src/hooks/refine/useWarnAboutChange/index.ts
var useWarnAboutChange = /* @__PURE__ */ __name(() => {
  const { warnWhenUnsavedChanges } = dashboard__loadShare__react__loadShare__.useContext(RefineContext);
  const { warnWhen, setWarnWhen } = dashboard__loadShare__react__loadShare__.useContext(UnsavedWarnContext);
  return {
    warnWhenUnsavedChanges,
    warnWhen: Boolean(warnWhen),
    setWarnWhen: setWarnWhen ?? (() => void 0)
  };
}, "useWarnAboutChange");
var useSyncWithLocation = /* @__PURE__ */ __name(() => {
  const { syncWithLocation } = dashboard__loadShare__react__loadShare__.useContext(RefineContext);
  return { syncWithLocation };
}, "useSyncWithLocation");
var useTitle = /* @__PURE__ */ __name(() => {
  const { Title } = dashboard__loadShare__react__loadShare__.useContext(RefineContext);
  return Title;
}, "useTitle");
var useRefineContext = /* @__PURE__ */ __name(() => {
  const {
    Footer,
    Header,
    Layout,
    OffLayoutArea,
    Sider,
    Title,
    hasDashboard,
    mutationMode,
    syncWithLocation,
    undoableTimeout,
    warnWhenUnsavedChanges,
    DashboardPage,
    LoginPage: LoginPage3,
    catchAll,
    options,
    __initialized
  } = dashboard__loadShare__react__loadShare__.useContext(RefineContext);
  return {
    __initialized,
    Footer,
    Header,
    Layout,
    OffLayoutArea,
    Sider,
    Title,
    hasDashboard,
    mutationMode,
    syncWithLocation,
    undoableTimeout,
    warnWhenUnsavedChanges,
    DashboardPage,
    LoginPage: LoginPage3,
    catchAll,
    options
  };
}, "useRefineContext");

// src/definitions/helpers/useUserFriendlyName/index.ts
var useUserFriendlyName = /* @__PURE__ */ __name(() => {
  const {
    options: { textTransformers }
  } = useRefineContext();
  const getFriendlyName = /* @__PURE__ */ __name((name = "", type) => {
    const humanizeName = textTransformers.humanize(name);
    if (type === "singular") {
      return textTransformers.singular(humanizeName);
    }
    return textTransformers.plural(humanizeName);
  }, "getFriendlyName");
  return getFriendlyName;
}, "useUserFriendlyName");

// src/definitions/helpers/flatten-object-keys/index.ts
var isNested = /* @__PURE__ */ __name((obj) => typeof obj === "object" && obj !== null, "isNested");
var isArray = /* @__PURE__ */ __name((obj) => Array.isArray(obj), "isArray");
var flattenObjectKeys = /* @__PURE__ */ __name((obj, prefix = "") => {
  if (!isNested(obj)) {
    return {
      [prefix]: obj
    };
  }
  return Object.keys(obj).reduce(
    (acc, key) => {
      const currentPrefix = prefix.length ? `${prefix}.` : "";
      if (isNested(obj[key]) && Object.keys(obj[key]).length) {
        if (isArray(obj[key]) && obj[key].length) {
          obj[key].forEach((item, index) => {
            Object.assign(
              acc,
              flattenObjectKeys(item, `${currentPrefix + key}.${index}`)
            );
          });
        } else {
          Object.assign(acc, flattenObjectKeys(obj[key], currentPrefix + key));
        }
        acc[currentPrefix + key] = obj[key];
      } else {
        acc[currentPrefix + key] = obj[key];
      }
      return acc;
    },
    {}
  );
}, "flattenObjectKeys");

// src/definitions/helpers/property-path-to-array/index.ts
var propertyPathToArray = /* @__PURE__ */ __name((propertyPath) => {
  return propertyPath.split(".").map((item) => !Number.isNaN(Number(item)) ? Number(item) : item);
}, "propertyPathToArray");

// src/definitions/helpers/downloadInBrowser/index.ts
var downloadInBrowser = /* @__PURE__ */ __name((filename, content, type) => {
  if (typeof window === "undefined") {
    return;
  }
  const blob = new Blob([content], { type });
  const link = document.createElement("a");
  link.setAttribute("visibility", "hidden");
  link.download = filename;
  const blobUrl = URL.createObjectURL(blob);
  link.href = blobUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  });
}, "downloadInBrowser");

// src/definitions/helpers/defer-execution/index.ts
var deferExecution = /* @__PURE__ */ __name((fn) => {
  setTimeout(fn, 0);
}, "deferExecution");
var asyncDebounce = /* @__PURE__ */ __name((func, wait = 1e3, cancelReason) => {
  let callbacks = [];
  const cancelPrevious = /* @__PURE__ */ __name(() => {
    callbacks.forEach((cb) => {
      var _a;
      return (_a = cb.reject) == null ? void 0 : _a.call(cb, cancelReason);
    });
    callbacks = [];
  }, "cancelPrevious");
  const debouncedFunc = debounce((...args) => {
    const { resolve, reject } = callbacks.pop() || {};
    Promise.resolve(func(...args)).then(resolve).catch(reject);
  }, wait);
  const runner = /* @__PURE__ */ __name((...args) => {
    return new Promise((resolve, reject) => {
      cancelPrevious();
      callbacks.push({
        resolve,
        reject
      });
      debouncedFunc(...args);
    });
  }, "runner");
  runner.flush = () => debouncedFunc.flush();
  runner.cancel = () => {
    debouncedFunc.cancel();
    cancelPrevious();
  };
  return runner;
}, "asyncDebounce");

// src/definitions/helpers/prepare-query-context/index.ts
var prepareQueryContext = /* @__PURE__ */ __name((context) => {
  const queryContext = {
    queryKey: context.queryKey,
    pageParam: context.pageParam
  };
  Object.defineProperty(queryContext, "signal", {
    enumerable: true,
    get: () => {
      return context.signal;
    }
  });
  return queryContext;
}, "prepareQueryContext");

// src/definitions/table/index.ts
var parseTableParams = /* @__PURE__ */ __name((url) => {
  const { current, pageSize, sorter, sorters, filters } = parse(
    url.substring(1)
    // remove first ? character
  );
  return {
    parsedCurrent: current && Number(current),
    parsedPageSize: pageSize && Number(pageSize),
    parsedSorter: pickNotDeprecated(sorters, sorter) ?? [],
    parsedFilters: filters ?? []
  };
}, "parseTableParams");
var parseTableParamsFromQuery = /* @__PURE__ */ __name((params) => {
  const url = stringify(params);
  return parseTableParams(`/${url}`);
}, "parseTableParamsFromQuery");
var stringifyTableParams = /* @__PURE__ */ __name((params) => {
  const options = {
    skipNulls: true,
    arrayFormat: "indices",
    encode: false
  };
  const { pagination, sorter, sorters, filters, ...rest } = params;
  const queryString = stringify(
    {
      ...rest,
      ...pagination ? pagination : {},
      sorters: pickNotDeprecated(sorters, sorter),
      filters
    },
    options
  );
  return queryString;
}, "stringifyTableParams");
var compareFilters = /* @__PURE__ */ __name((left, right) => {
  if (left.operator !== "and" && left.operator !== "or" && right.operator !== "and" && right.operator !== "or") {
    return ("field" in left ? left.field : void 0) === ("field" in right ? right.field : void 0) && left.operator === right.operator;
  }
  return ("key" in left ? left.key : void 0) === ("key" in right ? right.key : void 0) && left.operator === right.operator;
}, "compareFilters");
var compareSorters = /* @__PURE__ */ __name((left, right) => left.field === right.field, "compareSorters");
var unionFilters = /* @__PURE__ */ __name((permanentFilter, newFilters, prevFilters = []) => {
  const isKeyRequired = newFilters.filter(
    (f) => (f.operator === "or" || f.operator === "and") && !f.key
  );
  if (isKeyRequired.length > 1) {
    warnOnce(
      true,
      "[conditionalFilters]: You have created multiple Conditional Filters at the top level, this requires the key parameter. \nFor more information, see https://refine.dev/docs/advanced-tutorials/data-provider/handling-filters/#top-level-multiple-conditional-filters-usage"
    );
  }
  return unionWith(
    permanentFilter,
    newFilters,
    prevFilters,
    compareFilters
  ).filter(
    (crudFilter) => crudFilter.value !== void 0 && crudFilter.value !== null && (crudFilter.operator !== "or" || crudFilter.operator === "or" && crudFilter.value.length !== 0) && (crudFilter.operator !== "and" || crudFilter.operator === "and" && crudFilter.value.length !== 0)
  );
}, "unionFilters");
var unionSorters = /* @__PURE__ */ __name((permanentSorter, newSorters) => unionWith(permanentSorter, newSorters, compareSorters).filter(
  (crudSorter) => crudSorter.order !== void 0 && crudSorter.order !== null
), "unionSorters");
var setInitialFilters = /* @__PURE__ */ __name((permanentFilter, defaultFilter) => [
  ...differenceWith(defaultFilter, permanentFilter, compareFilters),
  ...permanentFilter
], "setInitialFilters");
var setInitialSorters = /* @__PURE__ */ __name((permanentSorter, defaultSorter) => [
  ...differenceWith(defaultSorter, permanentSorter, compareSorters),
  ...permanentSorter
], "setInitialSorters");
var getDefaultSortOrder = /* @__PURE__ */ __name((columnName, sorter) => {
  if (!sorter) {
    return void 0;
  }
  const sortItem = sorter.find((item) => item.field === columnName);
  if (sortItem) {
    return sortItem.order;
  }
  return void 0;
}, "getDefaultSortOrder");
var getDefaultFilter = /* @__PURE__ */ __name((columnName, filters, operatorType = "eq") => {
  const filter = filters == null ? void 0 : filters.find((filter2) => {
    if (filter2.operator !== "or" && filter2.operator !== "and" && "field" in filter2) {
      const { operator, field } = filter2;
      return field === columnName && operator === operatorType;
    }
    return void 0;
  });
  if (filter) {
    return filter.value || [];
  }
  return void 0;
}, "getDefaultFilter");

// src/definitions/upload/file2Base64/index.ts
var file2Base64 = /* @__PURE__ */ __name((file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const resultHandler = /* @__PURE__ */ __name(() => {
      if (reader.result) {
        reader.removeEventListener("load", resultHandler, false);
        resolve(reader.result);
      }
    }, "resultHandler");
    reader.addEventListener("load", resultHandler, false);
    reader.readAsDataURL(file.originFileObj);
    reader.onerror = (error) => {
      reader.removeEventListener("load", resultHandler, false);
      return reject(error);
    };
  });
}, "file2Base64");

// src/hooks/useKeys/index.tsx
var useKeys = /* @__PURE__ */ __name(() => {
  const {
    options: { useNewQueryKeys }
  } = useRefineContext();
  return {
    keys,
    preferLegacyKeys: !useNewQueryKeys
  };
}, "useKeys");

// src/hooks/auth/usePermissions/index.ts
function usePermissions({
  v3LegacyAuthProviderCompatible = false,
  options,
  params
} = {}) {
  const { getPermissions: legacyGetPermission } = useLegacyAuthContext();
  const { getPermissions } = useAuthBindingsContext();
  const { keys: keys2, preferLegacyKeys } = useKeys();
  const queryResponse = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQuery({
    queryKey: keys2().auth().action("permissions").get(preferLegacyKeys),
    // Enabled check for `getPermissions` is enough to be sure that it's defined in the query function but TS is not smart enough to know that.
    queryFn: getPermissions ? () => getPermissions(params) : () => Promise.resolve(void 0),
    enabled: !v3LegacyAuthProviderCompatible && !!getPermissions,
    ...v3LegacyAuthProviderCompatible ? {} : options,
    meta: {
      ...v3LegacyAuthProviderCompatible ? {} : options == null ? void 0 : options.meta,
      ...k("usePermissions", preferLegacyKeys)
    }
  });
  const legacyQueryResponse = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQuery({
    queryKey: [
      ...keys2().auth().action("permissions").get(preferLegacyKeys),
      "v3LegacyAuthProviderCompatible"
    ],
    // Enabled check for `getPermissions` is enough to be sure that it's defined in the query function but TS is not smart enough to know that.
    queryFn: legacyGetPermission ? () => legacyGetPermission(params) : () => Promise.resolve(void 0),
    enabled: v3LegacyAuthProviderCompatible && !!legacyGetPermission,
    ...v3LegacyAuthProviderCompatible ? options : {},
    meta: {
      ...v3LegacyAuthProviderCompatible ? options == null ? void 0 : options.meta : {},
      ...k("usePermissions", preferLegacyKeys)
    }
  });
  return v3LegacyAuthProviderCompatible ? legacyQueryResponse : queryResponse;
}
__name(usePermissions, "usePermissions");
function useGetIdentity({
  v3LegacyAuthProviderCompatible = false,
  queryOptions
} = {}) {
  const { getUserIdentity: legacyGetUserIdentity } = useLegacyAuthContext();
  const { getIdentity } = useAuthBindingsContext();
  const { keys: keys2, preferLegacyKeys } = useKeys();
  const queryResponse = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQuery({
    queryKey: keys2().auth().action("identity").get(preferLegacyKeys),
    // Enabled check for `getIdentity` is enough to be sure that it's defined in the query function but TS is not smart enough to know that.
    queryFn: getIdentity ?? (() => Promise.resolve({})),
    enabled: !v3LegacyAuthProviderCompatible && !!getIdentity,
    retry: false,
    ...v3LegacyAuthProviderCompatible === true ? {} : queryOptions,
    meta: {
      ...v3LegacyAuthProviderCompatible === true ? {} : queryOptions == null ? void 0 : queryOptions.meta,
      ...k("useGetIdentity", preferLegacyKeys)
    }
  });
  const legacyQueryResponse = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQuery({
    queryKey: [
      ...keys2().auth().action("identity").get(preferLegacyKeys),
      "v3LegacyAuthProviderCompatible"
    ],
    // Enabled check for `getUserIdentity` is enough to be sure that it's defined in the query function but TS is not smart enough to know that.
    queryFn: legacyGetUserIdentity ?? (() => Promise.resolve({})),
    enabled: v3LegacyAuthProviderCompatible && !!legacyGetUserIdentity,
    retry: false,
    ...v3LegacyAuthProviderCompatible ? queryOptions : {},
    meta: {
      ...v3LegacyAuthProviderCompatible ? queryOptions == null ? void 0 : queryOptions.meta : {},
      ...k("useGetIdentity", preferLegacyKeys)
    }
  });
  return v3LegacyAuthProviderCompatible ? legacyQueryResponse : queryResponse;
}
__name(useGetIdentity, "useGetIdentity");
var useInvalidateAuthStore = /* @__PURE__ */ __name(() => {
  const queryClient = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQueryClient();
  const { keys: keys2, preferLegacyKeys } = useKeys();
  const invalidate = /* @__PURE__ */ __name(async () => {
    await Promise.all(
      ["check", "identity", "permissions"].map(
        (action) => queryClient.invalidateQueries(
          keys2().auth().action(action).get(preferLegacyKeys)
        )
      )
    );
  }, "invalidate");
  return invalidate;
}, "useInvalidateAuthStore");

// src/hooks/auth/useLogout/index.ts
function useLogout({
  v3LegacyAuthProviderCompatible,
  mutationOptions
} = {}) {
  const invalidateAuthStore = useInvalidateAuthStore();
  const routerType = useRouterType();
  const go = useGo();
  const { push } = useNavigation();
  const { open, close } = useNotification();
  const { logout: legacyLogoutFromContext } = useLegacyAuthContext();
  const { logout: logoutFromContext } = useAuthBindingsContext();
  const { keys: keys2, preferLegacyKeys } = useKeys();
  const mutation = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({
    mutationKey: keys2().auth().action("logout").get(preferLegacyKeys),
    mutationFn: logoutFromContext,
    onSuccess: async (data, variables) => {
      const { success, error, redirectTo, successNotification } = data;
      const { redirectPath } = variables ?? {};
      const redirect = redirectPath ?? redirectTo;
      if (success) {
        close == null ? void 0 : close("useLogout-error");
        if (successNotification) {
          open == null ? void 0 : open(buildSuccessNotification(successNotification));
        }
      }
      if (error || !success) {
        open == null ? void 0 : open(buildNotification(error));
      }
      if (redirect !== false) {
        if (routerType === "legacy") {
          push(redirect ?? "/login");
        } else {
          if (redirect) {
            go({ to: redirect });
          }
        }
      }
      await invalidateAuthStore();
    },
    onError: (error) => {
      open == null ? void 0 : open(buildNotification(error));
    },
    ...v3LegacyAuthProviderCompatible === true ? {} : mutationOptions,
    meta: {
      ...v3LegacyAuthProviderCompatible === true ? {} : mutationOptions == null ? void 0 : mutationOptions.meta,
      ...k("useLogout", preferLegacyKeys)
    }
  });
  const v3LegacyAuthProviderCompatibleMutation = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({
    mutationKey: [
      ...keys2().auth().action("logout").get(preferLegacyKeys),
      "v3LegacyAuthProviderCompatible"
    ],
    mutationFn: legacyLogoutFromContext,
    onSuccess: async (data, variables) => {
      const redirectPath = (variables == null ? void 0 : variables.redirectPath) ?? data;
      if (redirectPath === false) {
        return;
      }
      if (redirectPath) {
        if (routerType === "legacy") {
          push(redirectPath);
        } else {
          go({ to: redirectPath });
        }
        return;
      }
      if (routerType === "legacy") {
        push("/login");
      } else {
        go({ to: "/login" });
      }
      await invalidateAuthStore();
    },
    onError: (error) => {
      open == null ? void 0 : open(buildNotification(error));
    },
    ...v3LegacyAuthProviderCompatible ? mutationOptions : {},
    meta: {
      ...v3LegacyAuthProviderCompatible ? mutationOptions == null ? void 0 : mutationOptions.meta : {},
      ...k("useLogout", preferLegacyKeys)
    }
  });
  return v3LegacyAuthProviderCompatible ? v3LegacyAuthProviderCompatibleMutation : mutation;
}
__name(useLogout, "useLogout");
var buildNotification = /* @__PURE__ */ __name((error) => {
  return {
    key: "useLogout-error",
    type: "error",
    message: (error == null ? void 0 : error.name) || "Logout Error",
    description: (error == null ? void 0 : error.message) || "Something went wrong during logout"
  };
}, "buildNotification");
var buildSuccessNotification = /* @__PURE__ */ __name((successNotification) => {
  return {
    message: successNotification.message,
    description: successNotification.description,
    key: "logout-success",
    type: "success"
  };
}, "buildSuccessNotification");
function useLogin({
  v3LegacyAuthProviderCompatible,
  mutationOptions
} = {}) {
  const invalidateAuthStore = useInvalidateAuthStore();
  const routerType = useRouterType();
  const go = useGo();
  const { replace } = useNavigation();
  const parsed = useParsed();
  const { useLocation } = useRouterContext();
  const { search } = useLocation();
  const { close, open } = useNotification();
  const { login: legacyLoginFromContext } = useLegacyAuthContext();
  const { login: loginFromContext } = useAuthBindingsContext();
  const { keys: keys2, preferLegacyKeys } = useKeys();
  const to = React3.useMemo(() => {
    var _a;
    if (routerType === "legacy") {
      const legacySearch = parse(search, {
        ignoreQueryPrefix: true
      });
      return legacySearch.to;
    }
    return (_a = parsed.params) == null ? void 0 : _a.to;
  }, [routerType, parsed.params, search]);
  const mutation = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({
    mutationKey: keys2().auth().action("login").get(preferLegacyKeys),
    mutationFn: loginFromContext,
    onSuccess: async ({ success, redirectTo, error, successNotification }) => {
      if (success) {
        close == null ? void 0 : close("login-error");
        if (successNotification) {
          open == null ? void 0 : open(buildSuccessNotification2(successNotification));
        }
      }
      if (error || !success) {
        open == null ? void 0 : open(buildNotification2(error));
      }
      if (to && success) {
        if (routerType === "legacy") {
          replace(to);
        } else {
          go({ to, type: "replace" });
        }
      } else if (redirectTo) {
        if (routerType === "legacy") {
          replace(redirectTo);
        } else {
          go({ to: redirectTo, type: "replace" });
        }
      } else {
        if (routerType === "legacy") {
          replace("/");
        }
      }
      setTimeout(() => {
        invalidateAuthStore();
      }, 32);
    },
    onError: (error) => {
      open == null ? void 0 : open(buildNotification2(error));
    },
    ...v3LegacyAuthProviderCompatible === true ? {} : mutationOptions,
    meta: {
      ...v3LegacyAuthProviderCompatible === true ? {} : mutationOptions == null ? void 0 : mutationOptions.meta,
      ...k("useLogin", preferLegacyKeys)
    }
  });
  const v3LegacyAuthProviderCompatibleMutation = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({
    mutationKey: [
      ...keys2().auth().action("login").get(preferLegacyKeys),
      "v3LegacyAuthProviderCompatible"
    ],
    mutationFn: legacyLoginFromContext,
    onSuccess: async (redirectPathFromAuth) => {
      if (to) {
        replace(to);
      }
      if (redirectPathFromAuth !== false && !to) {
        if (typeof redirectPathFromAuth === "string") {
          if (routerType === "legacy") {
            replace(redirectPathFromAuth);
          } else {
            go({ to: redirectPathFromAuth, type: "replace" });
          }
        } else {
          if (routerType === "legacy") {
            replace("/");
          } else {
            go({ to: "/", type: "replace" });
          }
        }
      }
      setTimeout(() => {
        invalidateAuthStore();
      }, 32);
      close == null ? void 0 : close("login-error");
    },
    onError: (error) => {
      open == null ? void 0 : open(buildNotification2(error));
    },
    ...v3LegacyAuthProviderCompatible ? mutationOptions : {},
    meta: {
      ...v3LegacyAuthProviderCompatible ? mutationOptions == null ? void 0 : mutationOptions.meta : {},
      ...k("useLogin", preferLegacyKeys)
    }
  });
  return v3LegacyAuthProviderCompatible ? v3LegacyAuthProviderCompatibleMutation : mutation;
}
__name(useLogin, "useLogin");
var buildNotification2 = /* @__PURE__ */ __name((error) => {
  return {
    message: (error == null ? void 0 : error.name) || "Login Error",
    description: (error == null ? void 0 : error.message) || "Invalid credentials",
    key: "login-error",
    type: "error"
  };
}, "buildNotification");
var buildSuccessNotification2 = /* @__PURE__ */ __name((successNotification) => {
  return {
    message: successNotification.message,
    description: successNotification.description,
    key: "login-success",
    type: "success"
  };
}, "buildSuccessNotification");
function useRegister({
  v3LegacyAuthProviderCompatible,
  mutationOptions
} = {}) {
  const invalidateAuthStore = useInvalidateAuthStore();
  const routerType = useRouterType();
  const go = useGo();
  const { replace } = useNavigation();
  const { register: legacyRegisterFromContext } = useLegacyAuthContext();
  const { register: registerFromContext } = useAuthBindingsContext();
  const { close, open } = useNotification();
  const { keys: keys2, preferLegacyKeys } = useKeys();
  const mutation = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({
    mutationKey: keys2().auth().action("register").get(preferLegacyKeys),
    mutationFn: registerFromContext,
    onSuccess: async ({ success, redirectTo, error, successNotification }) => {
      if (success) {
        close == null ? void 0 : close("register-error");
        if (successNotification) {
          open == null ? void 0 : open(buildSuccessNotification3(successNotification));
        }
        await invalidateAuthStore();
      }
      if (error || !success) {
        open == null ? void 0 : open(buildNotification3(error));
      }
      if (redirectTo) {
        if (routerType === "legacy") {
          replace(redirectTo);
        } else {
          go({ to: redirectTo, type: "replace" });
        }
      } else {
        if (routerType === "legacy") {
          replace("/");
        }
      }
    },
    onError: (error) => {
      open == null ? void 0 : open(buildNotification3(error));
    },
    ...v3LegacyAuthProviderCompatible === true ? {} : mutationOptions,
    meta: {
      ...v3LegacyAuthProviderCompatible === true ? {} : mutationOptions == null ? void 0 : mutationOptions.meta,
      ...k("useRegister", preferLegacyKeys)
    }
  });
  const v3LegacyAuthProviderCompatibleMutation = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({
    mutationKey: [
      ...keys2().auth().action("register").get(preferLegacyKeys),
      "v3LegacyAuthProviderCompatible"
    ],
    mutationFn: legacyRegisterFromContext,
    onSuccess: async (redirectPathFromAuth) => {
      if (redirectPathFromAuth !== false) {
        if (redirectPathFromAuth) {
          if (routerType === "legacy") {
            replace(redirectPathFromAuth);
          } else {
            go({ to: redirectPathFromAuth, type: "replace" });
          }
        } else {
          if (routerType === "legacy") {
            replace("/");
          } else {
            go({ to: "/", type: "replace" });
          }
        }
        await invalidateAuthStore();
        close == null ? void 0 : close("register-error");
      }
    },
    onError: (error) => {
      open == null ? void 0 : open(buildNotification3(error));
    },
    ...v3LegacyAuthProviderCompatible ? mutationOptions : {},
    meta: {
      ...v3LegacyAuthProviderCompatible ? mutationOptions == null ? void 0 : mutationOptions.meta : {},
      ...k("useRegister", preferLegacyKeys)
    }
  });
  return v3LegacyAuthProviderCompatible ? v3LegacyAuthProviderCompatibleMutation : mutation;
}
__name(useRegister, "useRegister");
var buildNotification3 = /* @__PURE__ */ __name((error) => {
  return {
    message: (error == null ? void 0 : error.name) || "Register Error",
    description: (error == null ? void 0 : error.message) || "Error while registering",
    key: "register-error",
    type: "error"
  };
}, "buildNotification");
var buildSuccessNotification3 = /* @__PURE__ */ __name((successNotification) => {
  return {
    message: successNotification.message,
    description: successNotification.description,
    key: "register-success",
    type: "success"
  };
}, "buildSuccessNotification");
function useForgotPassword({
  v3LegacyAuthProviderCompatible,
  mutationOptions
} = {}) {
  const routerType = useRouterType();
  const go = useGo();
  const { replace } = useNavigation();
  const {
    forgotPassword: v3LegacyAuthProviderCompatibleForgotPasswordFromContext
  } = useLegacyAuthContext();
  const { forgotPassword: forgotPasswordFromContext } = useAuthBindingsContext();
  const { close, open } = useNotification();
  const { keys: keys2, preferLegacyKeys } = useKeys();
  const mutation = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({
    mutationKey: keys2().auth().action("forgotPassword").get(preferLegacyKeys),
    mutationFn: forgotPasswordFromContext,
    onSuccess: ({ success, redirectTo, error, successNotification }) => {
      if (success) {
        close == null ? void 0 : close("forgot-password-error");
        if (successNotification) {
          open == null ? void 0 : open(buildSuccessNotification4(successNotification));
        }
      }
      if (error || !success) {
        open == null ? void 0 : open(buildNotification4(error));
      }
      if (redirectTo) {
        if (routerType === "legacy") {
          replace(redirectTo);
        } else {
          go({ to: redirectTo, type: "replace" });
        }
      }
    },
    onError: (error) => {
      open == null ? void 0 : open(buildNotification4(error));
    },
    ...v3LegacyAuthProviderCompatible === true ? {} : mutationOptions,
    meta: {
      ...v3LegacyAuthProviderCompatible === true ? {} : mutationOptions == null ? void 0 : mutationOptions.meta,
      ...k("useForgotPassword", preferLegacyKeys)
    }
  });
  const v3LegacyAuthProviderCompatibleMutation = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({
    mutationKey: [
      ...keys2().auth().action("forgotPassword").get(preferLegacyKeys),
      "v3LegacyAuthProviderCompatible"
    ],
    mutationFn: v3LegacyAuthProviderCompatibleForgotPasswordFromContext,
    onSuccess: (redirectPathFromAuth) => {
      if (redirectPathFromAuth !== false) {
        if (redirectPathFromAuth) {
          if (routerType === "legacy") {
            replace(redirectPathFromAuth);
          } else {
            go({ to: redirectPathFromAuth, type: "replace" });
          }
        }
      }
      close == null ? void 0 : close("forgot-password-error");
    },
    onError: (error) => {
      open == null ? void 0 : open(buildNotification4(error));
    },
    ...v3LegacyAuthProviderCompatible ? mutationOptions : {},
    meta: {
      ...v3LegacyAuthProviderCompatible ? mutationOptions == null ? void 0 : mutationOptions.meta : {},
      ...k("useForgotPassword", preferLegacyKeys)
    }
  });
  return v3LegacyAuthProviderCompatible ? v3LegacyAuthProviderCompatibleMutation : mutation;
}
__name(useForgotPassword, "useForgotPassword");
var buildNotification4 = /* @__PURE__ */ __name((error) => {
  return {
    message: (error == null ? void 0 : error.name) || "Forgot Password Error",
    description: (error == null ? void 0 : error.message) || "Error while resetting password",
    key: "forgot-password-error",
    type: "error"
  };
}, "buildNotification");
var buildSuccessNotification4 = /* @__PURE__ */ __name((successNotification) => {
  return {
    message: successNotification.message,
    description: successNotification.description,
    key: "forgot-password-success",
    type: "success"
  };
}, "buildSuccessNotification");
function useUpdatePassword({
  v3LegacyAuthProviderCompatible,
  mutationOptions
} = {}) {
  const routerType = useRouterType();
  const go = useGo();
  const { replace } = useNavigation();
  const { updatePassword: legacyUpdatePasswordFromContext } = useLegacyAuthContext();
  const { updatePassword: updatePasswordFromContext } = useAuthBindingsContext();
  const { close, open } = useNotification();
  const { keys: keys2, preferLegacyKeys } = useKeys();
  const parsed = useParsed();
  const { useLocation } = useRouterContext();
  const { search } = useLocation();
  const params = React3.useMemo(() => {
    if (routerType === "legacy") {
      const queryStrings = parse(search, {
        ignoreQueryPrefix: true
      });
      return queryStrings ?? {};
    }
    return parsed.params ?? {};
  }, [search, parsed, routerType]);
  const mutation = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({
    mutationKey: keys2().auth().action("updatePassword").get(preferLegacyKeys),
    mutationFn: async (variables) => {
      return updatePasswordFromContext == null ? void 0 : updatePasswordFromContext({
        ...params,
        ...variables
      });
    },
    onSuccess: ({ success, redirectTo, error, successNotification }) => {
      if (success) {
        close == null ? void 0 : close("update-password-error");
        if (successNotification) {
          open == null ? void 0 : open(buildSuccessNotification5(successNotification));
        }
      }
      if (error || !success) {
        open == null ? void 0 : open(buildNotification5(error));
      }
      if (redirectTo) {
        if (routerType === "legacy") {
          replace(redirectTo);
        } else {
          go({ to: redirectTo, type: "replace" });
        }
      }
    },
    onError: (error) => {
      open == null ? void 0 : open(buildNotification5(error));
    },
    ...v3LegacyAuthProviderCompatible === true ? {} : mutationOptions,
    meta: {
      ...v3LegacyAuthProviderCompatible === true ? {} : mutationOptions == null ? void 0 : mutationOptions.meta,
      ...k("useUpdatePassword", preferLegacyKeys)
    }
  });
  const v3LegacyAuthProviderCompatibleMutation = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({
    mutationKey: [
      ...keys2().auth().action("updatePassword").get(preferLegacyKeys),
      "v3LegacyAuthProviderCompatible"
    ],
    mutationFn: async (variables) => {
      return legacyUpdatePasswordFromContext == null ? void 0 : legacyUpdatePasswordFromContext({
        ...params,
        ...variables
      });
    },
    onSuccess: (redirectPathFromAuth) => {
      if (redirectPathFromAuth !== false) {
        if (redirectPathFromAuth) {
          if (routerType === "legacy") {
            replace(redirectPathFromAuth);
          } else {
            go({ to: redirectPathFromAuth, type: "replace" });
          }
        }
      }
      close == null ? void 0 : close("update-password-error");
    },
    onError: (error) => {
      open == null ? void 0 : open(buildNotification5(error));
    },
    ...v3LegacyAuthProviderCompatible ? mutationOptions : {},
    meta: {
      ...v3LegacyAuthProviderCompatible ? mutationOptions == null ? void 0 : mutationOptions.meta : {},
      ...k("useUpdatePassword", preferLegacyKeys)
    }
  });
  return v3LegacyAuthProviderCompatible ? v3LegacyAuthProviderCompatibleMutation : mutation;
}
__name(useUpdatePassword, "useUpdatePassword");
var buildNotification5 = /* @__PURE__ */ __name((error) => {
  return {
    message: (error == null ? void 0 : error.name) || "Update Password Error",
    description: (error == null ? void 0 : error.message) || "Error while updating password",
    key: "update-password-error",
    type: "error"
  };
}, "buildNotification");
var buildSuccessNotification5 = /* @__PURE__ */ __name((successNotification) => {
  return {
    message: successNotification.message,
    description: successNotification.description,
    key: "update-password-success",
    type: "success"
  };
}, "buildSuccessNotification");
function useIsAuthenticated({
  v3LegacyAuthProviderCompatible = false,
  params
} = {}) {
  const { checkAuth } = useLegacyAuthContext();
  const { check } = useAuthBindingsContext();
  const { keys: keys2, preferLegacyKeys } = useKeys();
  const queryResponse = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQuery({
    queryKey: keys2().auth().action("check").params(params).get(preferLegacyKeys),
    queryFn: async () => await (check == null ? void 0 : check(params)) ?? {},
    retry: false,
    enabled: !v3LegacyAuthProviderCompatible,
    meta: {
      ...k("useIsAuthenticated", preferLegacyKeys)
    }
  });
  const legacyQueryResponse = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQuery({
    queryKey: [
      ...keys2().auth().action("check").params(params).get(preferLegacyKeys),
      "v3LegacyAuthProviderCompatible"
    ],
    queryFn: async () => await (checkAuth == null ? void 0 : checkAuth(params)) ?? {},
    retry: false,
    enabled: v3LegacyAuthProviderCompatible,
    meta: {
      ...k("useIsAuthenticated", preferLegacyKeys)
    }
  });
  return v3LegacyAuthProviderCompatible ? legacyQueryResponse : queryResponse;
}
__name(useIsAuthenticated, "useIsAuthenticated");
var useAuthenticated = useIsAuthenticated;
function useOnError({
  v3LegacyAuthProviderCompatible = false
} = {}) {
  const routerType = useRouterType();
  const go = useGo();
  const { replace } = useNavigation();
  const { checkError: legacyCheckErrorFromContext } = useLegacyAuthContext();
  const { onError: onErrorFromContext } = useAuthBindingsContext();
  const { keys: keys2, preferLegacyKeys } = useKeys();
  const { mutate: legacyLogout } = useLogout({
    v3LegacyAuthProviderCompatible: Boolean(v3LegacyAuthProviderCompatible)
  });
  const { mutate: logout } = useLogout({
    v3LegacyAuthProviderCompatible: Boolean(v3LegacyAuthProviderCompatible)
  });
  const mutation = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({
    mutationKey: keys2().auth().action("onError").get(preferLegacyKeys),
    ...onErrorFromContext ? {
      mutationFn: onErrorFromContext,
      onSuccess: ({ logout: shouldLogout, redirectTo }) => {
        if (shouldLogout) {
          logout({ redirectPath: redirectTo });
          return;
        }
        if (redirectTo) {
          if (routerType === "legacy") {
            replace(redirectTo);
          } else {
            go({ to: redirectTo, type: "replace" });
          }
          return;
        }
      }
    } : {
      mutationFn: () => ({})
    },
    meta: {
      ...k("useOnError", preferLegacyKeys)
    }
  });
  const v3LegacyAuthProviderCompatibleMutation = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({
    mutationKey: [
      ...keys2().auth().action("onError").get(preferLegacyKeys),
      "v3LegacyAuthProviderCompatible"
    ],
    mutationFn: legacyCheckErrorFromContext,
    onError: (redirectPath) => {
      legacyLogout({ redirectPath });
    },
    meta: {
      ...k("useOnError", preferLegacyKeys)
    }
  });
  return v3LegacyAuthProviderCompatible ? v3LegacyAuthProviderCompatibleMutation : mutation;
}
__name(useOnError, "useOnError");
var useCheckError = useOnError;

// src/hooks/auth/useIsExistAuthentication/index.ts
var useIsExistAuthentication = /* @__PURE__ */ __name(() => {
  const { isProvided: legacyIsProvided } = useLegacyAuthContext();
  const { isProvided } = useAuthBindingsContext();
  return Boolean(isProvided || legacyIsProvided);
}, "useIsExistAuthentication");
var useLoadingOvertime = /* @__PURE__ */ __name(({
  enabled: enabledProp,
  isLoading,
  interval: intervalProp,
  onInterval: onIntervalProp
}) => {
  const [elapsedTime, setElapsedTime] = dashboard__loadShare__react__loadShare__.useState(void 0);
  const { options } = useRefineContext();
  const { overtime } = options;
  const interval = intervalProp ?? overtime.interval;
  const onInterval = onIntervalProp ?? (overtime == null ? void 0 : overtime.onInterval);
  const enabled = typeof enabledProp !== "undefined" ? enabledProp : typeof overtime.enabled !== "undefined" ? overtime.enabled : true;
  dashboard__loadShare__react__loadShare__.useEffect(() => {
    let intervalFn;
    if (enabled && isLoading) {
      intervalFn = setInterval(() => {
        setElapsedTime((prevElapsedTime) => {
          if (prevElapsedTime === void 0) {
            return interval;
          }
          return prevElapsedTime + interval;
        });
      }, interval);
    }
    return () => {
      if (typeof intervalFn !== "undefined") {
        clearInterval(intervalFn);
      }
      setElapsedTime(void 0);
    };
  }, [isLoading, interval, enabled]);
  dashboard__loadShare__react__loadShare__.useEffect(() => {
    if (onInterval && elapsedTime) {
      onInterval(elapsedTime);
    }
  }, [elapsedTime]);
  return {
    elapsedTime
  };
}, "useLoadingOvertime");

// src/hooks/data/useList.ts
var useList = /* @__PURE__ */ __name(({
  resource: resourceFromProp,
  config,
  filters,
  hasPagination,
  pagination,
  sorters,
  queryOptions,
  successNotification,
  errorNotification,
  meta,
  metaData,
  liveMode,
  onLiveEvent,
  liveParams,
  dataProviderName,
  overtimeOptions
} = {}) => {
  const { resources, resource, identifier } = useResource(resourceFromProp);
  const dataProvider = useDataProvider();
  const translate = useTranslate();
  const authProvider = useActiveAuthProvider();
  const { mutate: checkError } = useOnError({
    v3LegacyAuthProviderCompatible: Boolean(authProvider == null ? void 0 : authProvider.isLegacy)
  });
  const handleNotification = useHandleNotification();
  const getMeta = useMeta();
  const { keys: keys2, preferLegacyKeys } = useKeys();
  const pickedDataProvider = pickDataProvider(
    identifier,
    dataProviderName,
    resources
  );
  const preferredMeta = pickNotDeprecated(meta, metaData);
  const prefferedFilters = pickNotDeprecated(filters, config == null ? void 0 : config.filters);
  const prefferedSorters = pickNotDeprecated(sorters, config == null ? void 0 : config.sort);
  const prefferedHasPagination = pickNotDeprecated(
    hasPagination,
    config == null ? void 0 : config.hasPagination
  );
  const prefferedPagination = handlePaginationParams({
    pagination,
    configPagination: config == null ? void 0 : config.pagination,
    hasPagination: prefferedHasPagination
  });
  const isServerPagination = prefferedPagination.mode === "server";
  const combinedMeta = getMeta({ resource, meta: preferredMeta });
  const notificationValues = {
    meta: combinedMeta,
    metaData: combinedMeta,
    filters: prefferedFilters,
    hasPagination: isServerPagination,
    pagination: prefferedPagination,
    sorters: prefferedSorters,
    config: {
      ...config,
      sort: prefferedSorters
    }
  };
  const isEnabled = (queryOptions == null ? void 0 : queryOptions.enabled) === void 0 || (queryOptions == null ? void 0 : queryOptions.enabled) === true;
  const { getList } = dataProvider(pickedDataProvider);
  useResourceSubscription({
    resource: identifier,
    types: ["*"],
    params: {
      meta: combinedMeta,
      metaData: combinedMeta,
      pagination: prefferedPagination,
      hasPagination: isServerPagination,
      sort: prefferedSorters,
      sorters: prefferedSorters,
      filters: prefferedFilters,
      subscriptionType: "useList",
      ...liveParams
    },
    channel: `resources/${resource == null ? void 0 : resource.name}`,
    enabled: isEnabled,
    liveMode,
    onLiveEvent,
    dataProviderName: pickedDataProvider,
    meta: {
      ...meta,
      dataProviderName
    }
  });
  const queryResponse = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQuery({
    queryKey: keys2().data(pickedDataProvider).resource(identifier ?? "").action("list").params({
      ...preferredMeta || {},
      filters: prefferedFilters,
      hasPagination: isServerPagination,
      ...isServerPagination && {
        pagination: prefferedPagination
      },
      ...sorters && {
        sorters
      },
      ...(config == null ? void 0 : config.sort) && {
        sort: config == null ? void 0 : config.sort
      }
    }).get(preferLegacyKeys),
    queryFn: (context) => {
      const meta2 = {
        ...combinedMeta,
        queryContext: prepareQueryContext(context)
      };
      return getList({
        resource: (resource == null ? void 0 : resource.name) ?? "",
        pagination: prefferedPagination,
        hasPagination: isServerPagination,
        filters: prefferedFilters,
        sort: prefferedSorters,
        sorters: prefferedSorters,
        meta: meta2,
        metaData: meta2
      });
    },
    ...queryOptions,
    enabled: typeof (queryOptions == null ? void 0 : queryOptions.enabled) !== "undefined" ? queryOptions == null ? void 0 : queryOptions.enabled : !!(resource == null ? void 0 : resource.name),
    select: (rawData) => {
      var _a;
      let data = rawData;
      const { current, mode, pageSize } = prefferedPagination;
      if (mode === "client") {
        data = {
          ...data,
          data: data.data.slice((current - 1) * pageSize, current * pageSize),
          total: data.total
        };
      }
      if (queryOptions == null ? void 0 : queryOptions.select) {
        return (_a = queryOptions == null ? void 0 : queryOptions.select) == null ? void 0 : _a.call(queryOptions, data);
      }
      return data;
    },
    onSuccess: (data) => {
      var _a;
      (_a = queryOptions == null ? void 0 : queryOptions.onSuccess) == null ? void 0 : _a.call(queryOptions, data);
      const notificationConfig = typeof successNotification === "function" ? successNotification(data, notificationValues, identifier) : successNotification;
      handleNotification(notificationConfig);
    },
    onError: (err) => {
      var _a;
      checkError(err);
      (_a = queryOptions == null ? void 0 : queryOptions.onError) == null ? void 0 : _a.call(queryOptions, err);
      const notificationConfig = typeof errorNotification === "function" ? errorNotification(err, notificationValues, identifier) : errorNotification;
      handleNotification(notificationConfig, {
        key: `${identifier}-useList-notification`,
        message: translate(
          "notifications.error",
          { statusCode: err.statusCode },
          `Error (status code: ${err.statusCode})`
        ),
        description: err.message,
        type: "error"
      });
    },
    meta: {
      ...queryOptions == null ? void 0 : queryOptions.meta,
      ...k("useList", preferLegacyKeys, resource == null ? void 0 : resource.name)
    }
  });
  const { elapsedTime } = useLoadingOvertime({
    ...overtimeOptions,
    isLoading: queryResponse.isFetching
  });
  return { ...queryResponse, overtime: { elapsedTime } };
}, "useList");
var useOne = /* @__PURE__ */ __name(({
  resource: resourceFromProp,
  id,
  queryOptions,
  successNotification,
  errorNotification,
  meta,
  metaData,
  liveMode,
  onLiveEvent,
  liveParams,
  dataProviderName,
  overtimeOptions
}) => {
  const { resources, resource, identifier } = useResource(resourceFromProp);
  const dataProvider = useDataProvider();
  const translate = useTranslate();
  const authProvider = useActiveAuthProvider();
  const { mutate: checkError } = useOnError({
    v3LegacyAuthProviderCompatible: Boolean(authProvider == null ? void 0 : authProvider.isLegacy)
  });
  const handleNotification = useHandleNotification();
  const getMeta = useMeta();
  const { keys: keys2, preferLegacyKeys } = useKeys();
  const preferredMeta = pickNotDeprecated(meta, metaData);
  const pickedDataProvider = pickDataProvider(
    identifier,
    dataProviderName,
    resources
  );
  const { getOne } = dataProvider(pickedDataProvider);
  const combinedMeta = getMeta({ resource, meta: preferredMeta });
  useResourceSubscription({
    resource: identifier,
    types: ["*"],
    channel: `resources/${resource == null ? void 0 : resource.name}`,
    params: {
      ids: id ? [id] : [],
      id,
      meta: combinedMeta,
      metaData: combinedMeta,
      subscriptionType: "useOne",
      ...liveParams
    },
    enabled: typeof (queryOptions == null ? void 0 : queryOptions.enabled) !== "undefined" ? queryOptions == null ? void 0 : queryOptions.enabled : typeof (resource == null ? void 0 : resource.name) !== "undefined" && typeof id !== "undefined",
    liveMode,
    onLiveEvent,
    dataProviderName: pickedDataProvider,
    meta: {
      ...meta,
      dataProviderName
    }
  });
  const queryResponse = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQuery({
    queryKey: keys2().data(pickedDataProvider).resource(identifier ?? "").action("one").id(id ?? "").params({
      ...preferredMeta || {}
    }).get(preferLegacyKeys),
    queryFn: (context) => getOne({
      resource: (resource == null ? void 0 : resource.name) ?? "",
      id,
      meta: {
        ...combinedMeta,
        queryContext: prepareQueryContext(context)
      },
      metaData: {
        ...combinedMeta,
        queryContext: prepareQueryContext(context)
      }
    }),
    ...queryOptions,
    enabled: typeof (queryOptions == null ? void 0 : queryOptions.enabled) !== "undefined" ? queryOptions == null ? void 0 : queryOptions.enabled : typeof id !== "undefined",
    onSuccess: (data) => {
      var _a;
      (_a = queryOptions == null ? void 0 : queryOptions.onSuccess) == null ? void 0 : _a.call(queryOptions, data);
      const notificationConfig = typeof successNotification === "function" ? successNotification(
        data,
        {
          id,
          ...combinedMeta
        },
        identifier
      ) : successNotification;
      handleNotification(notificationConfig);
    },
    onError: (err) => {
      var _a;
      checkError(err);
      (_a = queryOptions == null ? void 0 : queryOptions.onError) == null ? void 0 : _a.call(queryOptions, err);
      const notificationConfig = typeof errorNotification === "function" ? errorNotification(
        err,
        {
          id,
          ...combinedMeta
        },
        identifier
      ) : errorNotification;
      handleNotification(notificationConfig, {
        key: `${id}-${identifier}-getOne-notification`,
        message: translate(
          "notifications.error",
          { statusCode: err.statusCode },
          `Error (status code: ${err.statusCode})`
        ),
        description: err.message,
        type: "error"
      });
    },
    meta: {
      ...queryOptions == null ? void 0 : queryOptions.meta,
      ...k("useOne", preferLegacyKeys, resource == null ? void 0 : resource.name)
    }
  });
  const { elapsedTime } = useLoadingOvertime({
    ...overtimeOptions,
    isLoading: queryResponse.isFetching
  });
  return { ...queryResponse, overtime: { elapsedTime } };
}, "useOne");
var useMany = /* @__PURE__ */ __name(({
  resource: resourceFromProp,
  ids,
  queryOptions,
  successNotification,
  errorNotification,
  meta,
  metaData,
  liveMode,
  onLiveEvent,
  liveParams,
  dataProviderName,
  overtimeOptions
}) => {
  const { resources, resource, identifier } = useResource(resourceFromProp);
  const dataProvider = useDataProvider();
  const translate = useTranslate();
  const authProvider = useActiveAuthProvider();
  const { mutate: checkError } = useOnError({
    v3LegacyAuthProviderCompatible: Boolean(authProvider == null ? void 0 : authProvider.isLegacy)
  });
  const handleNotification = useHandleNotification();
  const getMeta = useMeta();
  const { keys: keys2, preferLegacyKeys } = useKeys();
  const preferredMeta = pickNotDeprecated(meta, metaData);
  const pickedDataProvider = pickDataProvider(
    identifier,
    dataProviderName,
    resources
  );
  const isEnabled = (queryOptions == null ? void 0 : queryOptions.enabled) === void 0 || (queryOptions == null ? void 0 : queryOptions.enabled) === true;
  const { getMany, getOne } = dataProvider(pickedDataProvider);
  const combinedMeta = getMeta({ resource, meta: preferredMeta });
  const hasIds = Array.isArray(ids);
  const hasResource = Boolean(resource == null ? void 0 : resource.name);
  const manuallyEnabled = (queryOptions == null ? void 0 : queryOptions.enabled) === true;
  warnOnce(!hasIds && !manuallyEnabled, idsWarningMessage(ids, resource == null ? void 0 : resource.name));
  warnOnce(!hasResource && !manuallyEnabled, resourceWarningMessage());
  useResourceSubscription({
    resource: identifier,
    types: ["*"],
    params: {
      ids: ids ?? [],
      meta: combinedMeta,
      metaData: combinedMeta,
      subscriptionType: "useMany",
      ...liveParams
    },
    channel: `resources/${(resource == null ? void 0 : resource.name) ?? ""}`,
    enabled: isEnabled,
    liveMode,
    onLiveEvent,
    dataProviderName: pickedDataProvider,
    meta: {
      ...meta,
      dataProviderName
    }
  });
  const queryResponse = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQuery({
    queryKey: keys2().data(pickedDataProvider).resource(identifier).action("many").ids(...ids ?? []).params({
      ...preferredMeta || {}
    }).get(preferLegacyKeys),
    queryFn: (context) => {
      const meta2 = {
        ...combinedMeta,
        queryContext: prepareQueryContext(context)
      };
      if (getMany) {
        return getMany({
          resource: resource == null ? void 0 : resource.name,
          ids,
          meta: meta2,
          metaData: meta2
        });
      }
      return handleMultiple(
        ids.map(
          (id) => getOne({
            resource: resource == null ? void 0 : resource.name,
            id,
            meta: meta2,
            metaData: meta2
          })
        )
      );
    },
    enabled: hasIds && hasResource,
    ...queryOptions,
    onSuccess: (data) => {
      var _a;
      (_a = queryOptions == null ? void 0 : queryOptions.onSuccess) == null ? void 0 : _a.call(queryOptions, data);
      const notificationConfig = typeof successNotification === "function" ? successNotification(data, ids, identifier) : successNotification;
      handleNotification(notificationConfig);
    },
    onError: (err) => {
      var _a;
      checkError(err);
      (_a = queryOptions == null ? void 0 : queryOptions.onError) == null ? void 0 : _a.call(queryOptions, err);
      const notificationConfig = typeof errorNotification === "function" ? errorNotification(err, ids, identifier) : errorNotification;
      handleNotification(notificationConfig, {
        key: `${ids[0]}-${identifier}-getMany-notification`,
        message: translate(
          "notifications.error",
          { statusCode: err.statusCode },
          `Error (status code: ${err.statusCode})`
        ),
        description: err.message,
        type: "error"
      });
    },
    meta: {
      ...queryOptions == null ? void 0 : queryOptions.meta,
      ...k("useMany", preferLegacyKeys, resource == null ? void 0 : resource.name)
    }
  });
  const { elapsedTime } = useLoadingOvertime({
    ...overtimeOptions,
    isLoading: queryResponse.isFetching
  });
  return { ...queryResponse, overtime: { elapsedTime } };
}, "useMany");
var idsWarningMessage = /* @__PURE__ */ __name((ids, resource) => `[useMany]: Missing "ids" prop. Expected an array of ids, but got "${typeof ids}". Resource: "${resource}"

See https://refine.dev/docs/data/hooks/use-many/#ids-`, "idsWarningMessage");
var resourceWarningMessage = /* @__PURE__ */ __name(() => `[useMany]: Missing "resource" prop. Expected a string, but got undefined.

See https://refine.dev/docs/data/hooks/use-many/#resource-`, "resourceWarningMessage");

// src/contexts/undoableQueue/types.ts
var ActionTypes = /* @__PURE__ */ ((ActionTypes2) => {
  ActionTypes2["ADD"] = "ADD";
  ActionTypes2["REMOVE"] = "REMOVE";
  ActionTypes2["DECREASE_NOTIFICATION_SECOND"] = "DECREASE_NOTIFICATION_SECOND";
  return ActionTypes2;
})(ActionTypes || {});

// src/hooks/data/useUpdate.ts
var useUpdate = /* @__PURE__ */ __name(({
  id: idFromProps,
  resource: resourceFromProps,
  values: valuesFromProps,
  dataProviderName: dataProviderNameFromProps,
  successNotification: successNotificationFromProps,
  errorNotification: errorNotificationFromProps,
  meta: metaFromProps,
  metaData: metaDataFromProps,
  mutationMode: mutationModeFromProps,
  undoableTimeout: undoableTimeoutFromProps,
  onCancel: onCancelFromProps,
  optimisticUpdateMap: optimisticUpdateMapFromProps,
  invalidates: invalidatesFromProps,
  mutationOptions,
  overtimeOptions
} = {}) => {
  const { resources, select } = useResource();
  const queryClient = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQueryClient();
  const dataProvider = useDataProvider();
  const {
    mutationMode: mutationModeContext,
    undoableTimeout: undoableTimeoutContext
  } = useMutationMode();
  const translate = useTranslate();
  const authProvider = useActiveAuthProvider();
  const { mutate: checkError } = useOnError({
    v3LegacyAuthProviderCompatible: Boolean(authProvider == null ? void 0 : authProvider.isLegacy)
  });
  const publish = usePublish();
  const { log } = useLog();
  const { notificationDispatch } = useCancelNotification();
  const handleNotification = useHandleNotification();
  const invalidateStore = useInvalidate();
  const getMeta = useMeta();
  const {
    options: { textTransformers }
  } = useRefineContext();
  const { keys: keys2, preferLegacyKeys } = useKeys();
  const mutationResult = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({
    mutationFn: ({
      id = idFromProps,
      values = valuesFromProps,
      resource: resourceName = resourceFromProps,
      mutationMode = mutationModeFromProps,
      undoableTimeout = undoableTimeoutFromProps,
      onCancel = onCancelFromProps,
      meta = metaFromProps,
      metaData = metaDataFromProps,
      dataProviderName = dataProviderNameFromProps
    }) => {
      if (typeof id === "undefined")
        throw missingIdError;
      if (!values)
        throw missingValuesError;
      if (!resourceName)
        throw missingResourceError;
      const { resource, identifier } = select(resourceName);
      const combinedMeta = getMeta({
        resource,
        meta: pickNotDeprecated(meta, metaData)
      });
      const mutationModePropOrContext = mutationMode ?? mutationModeContext;
      const undoableTimeoutPropOrContext = undoableTimeout ?? undoableTimeoutContext;
      if (!(mutationModePropOrContext === "undoable")) {
        return dataProvider(
          pickDataProvider(identifier, dataProviderName, resources)
        ).update({
          resource: resource.name,
          id,
          variables: values,
          meta: combinedMeta,
          metaData: combinedMeta
        });
      }
      const updatePromise = new Promise(
        (resolve, reject) => {
          const doMutation = /* @__PURE__ */ __name(() => {
            dataProvider(
              pickDataProvider(identifier, dataProviderName, resources)
            ).update({
              resource: resource.name,
              id,
              variables: values,
              meta: combinedMeta,
              metaData: combinedMeta
            }).then((result) => resolve(result)).catch((err) => reject(err));
          }, "doMutation");
          const cancelMutation = /* @__PURE__ */ __name(() => {
            reject({ message: "mutationCancelled" });
          }, "cancelMutation");
          if (onCancel) {
            onCancel(cancelMutation);
          }
          notificationDispatch({
            type: "ADD" /* ADD */,
            payload: {
              id,
              resource: identifier,
              cancelMutation,
              doMutation,
              seconds: undoableTimeoutPropOrContext,
              isSilent: !!onCancel
            }
          });
        }
      );
      return updatePromise;
    },
    onMutate: async ({
      resource: resourceName = resourceFromProps,
      id = idFromProps,
      mutationMode = mutationModeFromProps,
      values = valuesFromProps,
      dataProviderName = dataProviderNameFromProps,
      meta = metaFromProps,
      metaData = metaDataFromProps,
      optimisticUpdateMap = optimisticUpdateMapFromProps ?? {
        list: true,
        many: true,
        detail: true
      }
    }) => {
      if (typeof id === "undefined")
        throw missingIdError;
      if (!values)
        throw missingValuesError;
      if (!resourceName)
        throw missingResourceError;
      const { identifier } = select(resourceName);
      const {
        gqlMutation: _,
        gqlQuery: __,
        ...preferredMeta
      } = pickNotDeprecated(meta, metaData) ?? {};
      const queryKey = queryKeysReplacement(preferLegacyKeys)(
        identifier,
        pickDataProvider(identifier, dataProviderName, resources),
        preferredMeta
      );
      const resourceKeys = keys2().data(pickDataProvider(identifier, dataProviderName, resources)).resource(identifier);
      const previousQueries = queryClient.getQueriesData(resourceKeys.get(preferLegacyKeys));
      const mutationModePropOrContext = mutationMode ?? mutationModeContext;
      await queryClient.cancelQueries(
        resourceKeys.get(preferLegacyKeys),
        void 0,
        {
          silent: true
        }
      );
      if (mutationModePropOrContext !== "pessimistic") {
        if (optimisticUpdateMap.list) {
          queryClient.setQueriesData(
            resourceKeys.action("list").params(preferredMeta ?? {}).get(preferLegacyKeys),
            (previous) => {
              if (typeof optimisticUpdateMap.list === "function") {
                return optimisticUpdateMap.list(previous, values, id);
              }
              if (!previous) {
                return null;
              }
              const data = previous.data.map((record) => {
                var _a;
                if (((_a = record.id) == null ? void 0 : _a.toString()) === (id == null ? void 0 : id.toString())) {
                  return {
                    id,
                    ...record,
                    ...values
                  };
                }
                return record;
              });
              return {
                ...previous,
                data
              };
            }
          );
        }
        if (optimisticUpdateMap.many) {
          queryClient.setQueriesData(
            resourceKeys.action("many").get(preferLegacyKeys),
            (previous) => {
              if (typeof optimisticUpdateMap.many === "function") {
                return optimisticUpdateMap.many(previous, values, id);
              }
              if (!previous) {
                return null;
              }
              const data = previous.data.map((record) => {
                var _a;
                if (((_a = record.id) == null ? void 0 : _a.toString()) === (id == null ? void 0 : id.toString())) {
                  record = {
                    id,
                    ...record,
                    ...values
                  };
                }
                return record;
              });
              return {
                ...previous,
                data
              };
            }
          );
        }
        if (optimisticUpdateMap.detail) {
          queryClient.setQueriesData(
            resourceKeys.action("one").id(id).params(preferredMeta ?? {}).get(preferLegacyKeys),
            (previous) => {
              if (typeof optimisticUpdateMap.detail === "function") {
                return optimisticUpdateMap.detail(previous, values, id);
              }
              if (!previous) {
                return null;
              }
              return {
                ...previous,
                data: {
                  ...previous.data,
                  ...values
                }
              };
            }
          );
        }
      }
      return {
        previousQueries,
        queryKey
      };
    },
    onSettled: (data, error, variables, context) => {
      var _a;
      const {
        id = idFromProps,
        resource: resourceName = resourceFromProps,
        dataProviderName = dataProviderNameFromProps,
        invalidates = invalidatesFromProps ?? ["list", "many", "detail"]
      } = variables;
      if (typeof id === "undefined")
        throw missingIdError;
      if (!resourceName)
        throw missingResourceError;
      const { identifier } = select(resourceName);
      invalidateStore({
        resource: identifier,
        dataProviderName: pickDataProvider(
          identifier,
          dataProviderName,
          resources
        ),
        invalidates,
        id
      });
      notificationDispatch({
        type: "REMOVE" /* REMOVE */,
        payload: { id, resource: identifier }
      });
      (_a = mutationOptions == null ? void 0 : mutationOptions.onSettled) == null ? void 0 : _a.call(mutationOptions, data, error, variables, context);
    },
    onSuccess: (data, variables, context) => {
      var _a, _b;
      const {
        id = idFromProps,
        resource: resourceName = resourceFromProps,
        successNotification = successNotificationFromProps,
        dataProviderName: dataProviderNameFromProp = dataProviderNameFromProps,
        values = valuesFromProps,
        meta = metaFromProps,
        metaData = metaDataFromProps
      } = variables;
      if (typeof id === "undefined")
        throw missingIdError;
      if (!values)
        throw missingValuesError;
      if (!resourceName)
        throw missingResourceError;
      const { resource, identifier } = select(resourceName);
      const resourceSingular = textTransformers.singular(identifier);
      const dataProviderName = pickDataProvider(
        identifier,
        dataProviderNameFromProp,
        resources
      );
      const combinedMeta = getMeta({
        resource,
        meta: pickNotDeprecated(meta, metaData)
      });
      const notificationConfig = typeof successNotification === "function" ? successNotification(data, { id, values }, identifier) : successNotification;
      handleNotification(notificationConfig, {
        key: `${id}-${identifier}-notification`,
        description: translate("notifications.success", "Successful"),
        message: translate(
          "notifications.editSuccess",
          {
            resource: translate(
              `${identifier}.${identifier}`,
              resourceSingular
            )
          },
          `Successfully updated ${resourceSingular}`
        ),
        type: "success"
      });
      publish == null ? void 0 : publish({
        channel: `resources/${resource.name}`,
        type: "updated",
        payload: {
          ids: ((_a = data.data) == null ? void 0 : _a.id) ? [data.data.id] : void 0
        },
        date: /* @__PURE__ */ new Date(),
        meta: {
          ...combinedMeta,
          dataProviderName
        }
      });
      let previousData;
      if (context) {
        const queryData = queryClient.getQueryData(
          context.queryKey.detail(id)
        );
        previousData = Object.keys(values || {}).reduce((acc, item) => {
          var _a2;
          acc[item] = (_a2 = queryData == null ? void 0 : queryData.data) == null ? void 0 : _a2[item];
          return acc;
        }, {});
      }
      const {
        fields: _fields,
        operation: _operation,
        variables: _variables,
        ...rest
      } = combinedMeta || {};
      log == null ? void 0 : log.mutate({
        action: "update",
        resource: resource.name,
        data: values,
        previousData,
        meta: {
          id,
          dataProviderName,
          ...rest
        }
      });
      (_b = mutationOptions == null ? void 0 : mutationOptions.onSuccess) == null ? void 0 : _b.call(mutationOptions, data, variables, context);
    },
    onError: (err, variables, context) => {
      var _a;
      const {
        id = idFromProps,
        resource: resourceName = resourceFromProps,
        errorNotification = errorNotificationFromProps,
        values = valuesFromProps
      } = variables;
      if (typeof id === "undefined")
        throw missingIdError;
      if (!values)
        throw missingValuesError;
      if (!resourceName)
        throw missingResourceError;
      const { identifier } = select(resourceName);
      if (context) {
        for (const query of context.previousQueries) {
          queryClient.setQueryData(query[0], query[1]);
        }
      }
      if (err.message !== "mutationCancelled") {
        checkError == null ? void 0 : checkError(err);
        const resourceSingular = textTransformers.singular(identifier);
        const notificationConfig = typeof errorNotification === "function" ? errorNotification(err, { id, values }, identifier) : errorNotification;
        handleNotification(notificationConfig, {
          key: `${id}-${identifier}-notification`,
          message: translate(
            "notifications.editError",
            {
              resource: translate(
                `${identifier}.${identifier}`,
                resourceSingular
              ),
              statusCode: err.statusCode
            },
            `Error when updating ${resourceSingular} (status code: ${err.statusCode})`
          ),
          description: err.message,
          type: "error"
        });
      }
      (_a = mutationOptions == null ? void 0 : mutationOptions.onError) == null ? void 0 : _a.call(mutationOptions, err, variables, context);
    },
    mutationKey: keys2().data().mutation("update").get(preferLegacyKeys),
    ...mutationOptions,
    meta: {
      ...mutationOptions == null ? void 0 : mutationOptions.meta,
      ...k("useUpdate", preferLegacyKeys)
    }
  });
  const { mutate, mutateAsync, ...mutation } = mutationResult;
  const { elapsedTime } = useLoadingOvertime({
    ...overtimeOptions,
    isLoading: mutation.isLoading
  });
  const handleMutation = /* @__PURE__ */ __name((variables, options) => {
    return mutate(variables || {}, options);
  }, "handleMutation");
  const handleMutateAsync = /* @__PURE__ */ __name((variables, options) => {
    return mutateAsync(variables || {}, options);
  }, "handleMutateAsync");
  return {
    ...mutation,
    mutate: handleMutation,
    mutateAsync: handleMutateAsync,
    overtime: { elapsedTime }
  };
}, "useUpdate");
var missingResourceError = new Error(
  "[useUpdate]: `resource` is not defined or not matched but is required"
);
var missingIdError = new Error(
  "[useUpdate]: `id` is not defined but is required in edit and clone actions"
);
var missingValuesError = new Error(
  "[useUpdate]: `values` is not provided but is required"
);
var useCreate = /* @__PURE__ */ __name(({
  resource: resourceFromProps,
  values: valuesFromProps,
  dataProviderName: dataProviderNameFromProps,
  successNotification: successNotificationFromProps,
  errorNotification: errorNotificationFromProps,
  invalidates: invalidatesFromProps,
  meta: metaFromProps,
  metaData: metaDataFromProps,
  mutationOptions,
  overtimeOptions
} = {}) => {
  const authProvider = useActiveAuthProvider();
  const { mutate: checkError } = useOnError({
    v3LegacyAuthProviderCompatible: Boolean(authProvider == null ? void 0 : authProvider.isLegacy)
  });
  const dataProvider = useDataProvider();
  const invalidateStore = useInvalidate();
  const { resources, select } = useResource();
  const translate = useTranslate();
  const publish = usePublish();
  const { log } = useLog();
  const handleNotification = useHandleNotification();
  const getMeta = useMeta();
  const {
    options: { textTransformers }
  } = useRefineContext();
  const { keys: keys2, preferLegacyKeys } = useKeys();
  const mutationResult = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({
    mutationFn: ({
      resource: resourceName = resourceFromProps,
      values = valuesFromProps,
      meta = metaFromProps,
      metaData = metaDataFromProps,
      dataProviderName = dataProviderNameFromProps
    }) => {
      if (!values)
        throw missingValuesError2;
      if (!resourceName)
        throw missingResourceError2;
      const { resource, identifier } = select(resourceName);
      const combinedMeta = getMeta({
        resource,
        meta: pickNotDeprecated(meta, metaData)
      });
      return dataProvider(
        pickDataProvider(identifier, dataProviderName, resources)
      ).create({
        resource: resource.name,
        variables: values,
        meta: combinedMeta,
        metaData: combinedMeta
      });
    },
    onSuccess: (data, variables, context) => {
      var _a, _b, _c;
      const {
        resource: resourceName = resourceFromProps,
        successNotification: successNotificationFromProp = successNotificationFromProps,
        dataProviderName: dataProviderNameFromProp = dataProviderNameFromProps,
        invalidates = invalidatesFromProps ?? ["list", "many"],
        values = valuesFromProps,
        meta = metaFromProps,
        metaData = metaDataFromProps
      } = variables;
      if (!values)
        throw missingValuesError2;
      if (!resourceName)
        throw missingResourceError2;
      const { resource, identifier } = select(resourceName);
      const resourceSingular = textTransformers.singular(identifier);
      const dataProviderName = pickDataProvider(
        identifier,
        dataProviderNameFromProp,
        resources
      );
      const combinedMeta = getMeta({
        resource,
        meta: pickNotDeprecated(meta, metaData)
      });
      const notificationConfig = typeof successNotificationFromProp === "function" ? successNotificationFromProp(data, values, identifier) : successNotificationFromProp;
      handleNotification(notificationConfig, {
        key: `create-${identifier}-notification`,
        message: translate(
          "notifications.createSuccess",
          {
            resource: translate(
              `${identifier}.${identifier}`,
              resourceSingular
            )
          },
          `Successfully created ${resourceSingular}`
        ),
        description: translate("notifications.success", "Success"),
        type: "success"
      });
      invalidateStore({
        resource: identifier,
        dataProviderName,
        invalidates
      });
      publish == null ? void 0 : publish({
        channel: `resources/${resource.name}`,
        type: "created",
        payload: {
          ids: ((_a = data == null ? void 0 : data.data) == null ? void 0 : _a.id) ? [data.data.id] : void 0
        },
        date: /* @__PURE__ */ new Date(),
        meta: {
          ...combinedMeta,
          dataProviderName
        }
      });
      const {
        fields: _fields,
        operation: _operation,
        variables: _variables,
        ...rest
      } = combinedMeta || {};
      log == null ? void 0 : log.mutate({
        action: "create",
        resource: resource.name,
        data: values,
        meta: {
          dataProviderName,
          id: ((_b = data == null ? void 0 : data.data) == null ? void 0 : _b.id) ?? void 0,
          ...rest
        }
      });
      (_c = mutationOptions == null ? void 0 : mutationOptions.onSuccess) == null ? void 0 : _c.call(mutationOptions, data, variables, context);
    },
    onError: (err, variables, context) => {
      var _a;
      const {
        resource: resourceName = resourceFromProps,
        errorNotification: errorNotificationFromProp = errorNotificationFromProps,
        values = valuesFromProps
      } = variables;
      if (!values)
        throw missingValuesError2;
      if (!resourceName)
        throw missingResourceError2;
      checkError(err);
      const { identifier } = select(resourceName);
      const resourceSingular = textTransformers.singular(identifier);
      const notificationConfig = typeof errorNotificationFromProp === "function" ? errorNotificationFromProp(err, values, identifier) : errorNotificationFromProp;
      handleNotification(notificationConfig, {
        key: `create-${identifier}-notification`,
        description: err.message,
        message: translate(
          "notifications.createError",
          {
            resource: translate(
              `${identifier}.${identifier}`,
              resourceSingular
            ),
            statusCode: err.statusCode
          },
          `There was an error creating ${resourceSingular} (status code: ${err.statusCode})`
        ),
        type: "error"
      });
      (_a = mutationOptions == null ? void 0 : mutationOptions.onError) == null ? void 0 : _a.call(mutationOptions, err, variables, context);
    },
    mutationKey: keys2().data().mutation("create").get(preferLegacyKeys),
    ...mutationOptions,
    meta: {
      ...mutationOptions == null ? void 0 : mutationOptions.meta,
      ...k("useCreate", preferLegacyKeys)
    }
  });
  const { mutate, mutateAsync, ...mutation } = mutationResult;
  const { elapsedTime } = useLoadingOvertime({
    ...overtimeOptions,
    isLoading: mutation.isLoading
  });
  const handleMutation = /* @__PURE__ */ __name((variables, options) => {
    return mutate(variables || {}, options);
  }, "handleMutation");
  const handleMutateAsync = /* @__PURE__ */ __name((variables, options) => {
    return mutateAsync(variables || {}, options);
  }, "handleMutateAsync");
  return {
    ...mutation,
    mutate: handleMutation,
    mutateAsync: handleMutateAsync,
    overtime: { elapsedTime }
  };
}, "useCreate");
var missingResourceError2 = new Error(
  "[useCreate]: `resource` is not defined or not matched but is required"
);
var missingValuesError2 = new Error(
  "[useCreate]: `values` is not provided but is required"
);
var useDelete = /* @__PURE__ */ __name(({
  mutationOptions,
  overtimeOptions
} = {}) => {
  const authProvider = useActiveAuthProvider();
  const { mutate: checkError } = useOnError({
    v3LegacyAuthProviderCompatible: Boolean(authProvider == null ? void 0 : authProvider.isLegacy)
  });
  const dataProvider = useDataProvider();
  const { resources, select } = useResource();
  const queryClient = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQueryClient();
  const {
    mutationMode: mutationModeContext,
    undoableTimeout: undoableTimeoutContext
  } = useMutationMode();
  const { notificationDispatch } = useCancelNotification();
  const translate = useTranslate();
  const publish = usePublish();
  const { log } = useLog();
  const handleNotification = useHandleNotification();
  const invalidateStore = useInvalidate();
  const getMeta = useMeta();
  const {
    options: { textTransformers }
  } = useRefineContext();
  const { keys: keys2, preferLegacyKeys } = useKeys();
  const mutation = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({
    mutationFn: ({
      id,
      mutationMode,
      undoableTimeout,
      resource: resourceName,
      onCancel,
      meta,
      metaData,
      dataProviderName,
      values
    }) => {
      const { resource, identifier } = select(resourceName);
      const combinedMeta = getMeta({
        resource,
        meta: pickNotDeprecated(meta, metaData)
      });
      const mutationModePropOrContext = mutationMode ?? mutationModeContext;
      const undoableTimeoutPropOrContext = undoableTimeout ?? undoableTimeoutContext;
      if (!(mutationModePropOrContext === "undoable")) {
        return dataProvider(
          pickDataProvider(identifier, dataProviderName, resources)
        ).deleteOne({
          resource: resource.name,
          id,
          meta: combinedMeta,
          metaData: combinedMeta,
          variables: values
        });
      }
      const deletePromise = new Promise(
        (resolve, reject) => {
          const doMutation = /* @__PURE__ */ __name(() => {
            dataProvider(
              pickDataProvider(identifier, dataProviderName, resources)
            ).deleteOne({
              resource: resource.name,
              id,
              meta: combinedMeta,
              metaData: combinedMeta,
              variables: values
            }).then((result) => resolve(result)).catch((err) => reject(err));
          }, "doMutation");
          const cancelMutation = /* @__PURE__ */ __name(() => {
            reject({ message: "mutationCancelled" });
          }, "cancelMutation");
          if (onCancel) {
            onCancel(cancelMutation);
          }
          notificationDispatch({
            type: "ADD" /* ADD */,
            payload: {
              id,
              resource: identifier,
              cancelMutation,
              doMutation,
              seconds: undoableTimeoutPropOrContext,
              isSilent: !!onCancel
            }
          });
        }
      );
      return deletePromise;
    },
    onMutate: async ({
      id,
      resource: resourceName,
      mutationMode,
      dataProviderName,
      meta,
      metaData
    }) => {
      const { identifier } = select(resourceName);
      const {
        gqlMutation: _,
        gqlQuery: __,
        ...preferredMeta
      } = pickNotDeprecated(meta, metaData) ?? {};
      const queryKey = queryKeysReplacement(preferLegacyKeys)(
        identifier,
        pickDataProvider(identifier, dataProviderName, resources),
        preferredMeta
      );
      const resourceKeys = keys2().data(pickDataProvider(identifier, dataProviderName, resources)).resource(identifier);
      const mutationModePropOrContext = mutationMode ?? mutationModeContext;
      await queryClient.cancelQueries(
        resourceKeys.get(preferLegacyKeys),
        void 0,
        {
          silent: true
        }
      );
      const previousQueries = queryClient.getQueriesData(resourceKeys.get(preferLegacyKeys));
      if (mutationModePropOrContext !== "pessimistic") {
        queryClient.setQueriesData(
          resourceKeys.action("list").params(preferredMeta ?? {}).get(preferLegacyKeys),
          (previous) => {
            if (!previous) {
              return null;
            }
            const data = previous.data.filter(
              (record) => {
                var _a;
                return ((_a = record.id) == null ? void 0 : _a.toString()) !== id.toString();
              }
            );
            return {
              data,
              total: previous.total - 1
            };
          }
        );
        queryClient.setQueriesData(
          resourceKeys.action("many").get(preferLegacyKeys),
          (previous) => {
            if (!previous) {
              return null;
            }
            const data = previous.data.filter((record) => {
              var _a;
              return ((_a = record.id) == null ? void 0 : _a.toString()) !== (id == null ? void 0 : id.toString());
            });
            return {
              ...previous,
              data
            };
          }
        );
      }
      return {
        previousQueries,
        queryKey
      };
    },
    onSettled: (_data, _error, {
      id,
      resource: resourceName,
      dataProviderName,
      invalidates = ["list", "many"]
    }) => {
      const { identifier } = select(resourceName);
      invalidateStore({
        resource: identifier,
        dataProviderName: pickDataProvider(
          identifier,
          dataProviderName,
          resources
        ),
        invalidates
      });
      notificationDispatch({
        type: "REMOVE" /* REMOVE */,
        payload: { id, resource: identifier }
      });
    },
    onSuccess: (_data, {
      id,
      resource: resourceName,
      successNotification,
      dataProviderName: dataProviderNameFromProp,
      meta,
      metaData
    }, context) => {
      const { resource, identifier } = select(resourceName);
      const resourceSingular = textTransformers.singular(identifier);
      const dataProviderName = pickDataProvider(
        identifier,
        dataProviderNameFromProp,
        resources
      );
      const combinedMeta = getMeta({
        resource,
        meta: pickNotDeprecated(meta, metaData)
      });
      queryClient.removeQueries(context == null ? void 0 : context.queryKey.detail(id));
      const notificationConfig = typeof successNotification === "function" ? successNotification(_data, id, identifier) : successNotification;
      handleNotification(notificationConfig, {
        key: `${id}-${identifier}-notification`,
        description: translate("notifications.success", "Success"),
        message: translate(
          "notifications.deleteSuccess",
          {
            resource: translate(
              `${identifier}.${identifier}`,
              resourceSingular
            )
          },
          `Successfully deleted a ${resourceSingular}`
        ),
        type: "success"
      });
      publish == null ? void 0 : publish({
        channel: `resources/${resource.name}`,
        type: "deleted",
        payload: {
          ids: [id]
        },
        date: /* @__PURE__ */ new Date(),
        meta: {
          ...combinedMeta,
          dataProviderName
        }
      });
      const {
        fields: _fields,
        operation: _operation,
        variables: _variables,
        ...rest
      } = combinedMeta || {};
      log == null ? void 0 : log.mutate({
        action: "delete",
        resource: resource.name,
        meta: {
          id,
          dataProviderName,
          ...rest
        }
      });
      queryClient.removeQueries(context == null ? void 0 : context.queryKey.detail(id));
    },
    onError: (err, { id, resource: resourceName, errorNotification }, context) => {
      const { identifier } = select(resourceName);
      if (context) {
        for (const query of context.previousQueries) {
          queryClient.setQueryData(query[0], query[1]);
        }
      }
      if (err.message !== "mutationCancelled") {
        checkError(err);
        const resourceSingular = textTransformers.singular(identifier);
        const notificationConfig = typeof errorNotification === "function" ? errorNotification(err, id, identifier) : errorNotification;
        handleNotification(notificationConfig, {
          key: `${id}-${identifier}-notification`,
          message: translate(
            "notifications.deleteError",
            {
              resource: resourceSingular,
              statusCode: err.statusCode
            },
            `Error (status code: ${err.statusCode})`
          ),
          description: err.message,
          type: "error"
        });
      }
    },
    mutationKey: keys2().data().mutation("delete").get(preferLegacyKeys),
    ...mutationOptions,
    meta: {
      ...mutationOptions == null ? void 0 : mutationOptions.meta,
      ...k("useDelete", preferLegacyKeys)
    }
  });
  const { elapsedTime } = useLoadingOvertime({
    ...overtimeOptions,
    isLoading: mutation.isLoading
  });
  return { ...mutation, overtime: { elapsedTime } };
}, "useDelete");
var useCreateMany = /* @__PURE__ */ __name(({
  resource: resourceFromProps,
  values: valuesFromProps,
  dataProviderName: dataProviderNameFromProps,
  successNotification: successNotificationFromProps,
  errorNotification: errorNotificationFromProps,
  meta: metaFromProps,
  metaData: metaDataFromProps,
  invalidates: invalidatesFromProps,
  mutationOptions,
  overtimeOptions
} = {}) => {
  const dataProvider = useDataProvider();
  const { resources, select } = useResource();
  const translate = useTranslate();
  const publish = usePublish();
  const handleNotification = useHandleNotification();
  const invalidateStore = useInvalidate();
  const { log } = useLog();
  const getMeta = useMeta();
  const {
    options: { textTransformers }
  } = useRefineContext();
  const { keys: keys2, preferLegacyKeys } = useKeys();
  const mutationResult = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({
    mutationFn: ({
      resource: resourceName = resourceFromProps,
      values = valuesFromProps,
      meta = metaFromProps,
      metaData = metaDataFromProps,
      dataProviderName = dataProviderNameFromProps
    }) => {
      if (!values)
        throw missingValuesError3;
      if (!resourceName)
        throw missingResourceError3;
      const { resource, identifier } = select(resourceName);
      const combinedMeta = getMeta({
        resource,
        meta: pickNotDeprecated(meta, metaData)
      });
      const selectedDataProvider = dataProvider(
        pickDataProvider(identifier, dataProviderName, resources)
      );
      if (selectedDataProvider.createMany) {
        return selectedDataProvider.createMany({
          resource: resource.name,
          variables: values,
          meta: combinedMeta,
          metaData: combinedMeta
        });
      }
      return handleMultiple(
        values.map(
          (val) => selectedDataProvider.create({
            resource: resource.name,
            variables: val,
            meta: combinedMeta,
            metaData: combinedMeta
          })
        )
      );
    },
    onSuccess: (response, variables, context) => {
      var _a;
      const {
        resource: resourceName = resourceFromProps,
        successNotification = successNotificationFromProps,
        dataProviderName: dataProviderNameFromProp = dataProviderNameFromProps,
        invalidates = invalidatesFromProps ?? ["list", "many"],
        values = valuesFromProps,
        meta = metaFromProps,
        metaData = metaDataFromProps
      } = variables;
      if (!values)
        throw missingValuesError3;
      if (!resourceName)
        throw missingResourceError3;
      const { resource, identifier } = select(resourceName);
      const resourcePlural = textTransformers.plural(identifier);
      const dataProviderName = pickDataProvider(
        identifier,
        dataProviderNameFromProp,
        resources
      );
      const combinedMeta = getMeta({
        resource,
        meta: pickNotDeprecated(meta, metaData)
      });
      const notificationConfig = typeof successNotification === "function" ? successNotification(response, values, identifier) : successNotification;
      handleNotification(notificationConfig, {
        key: `createMany-${identifier}-notification`,
        message: translate(
          "notifications.createSuccess",
          {
            resource: translate(`${identifier}.${identifier}`, identifier)
          },
          `Successfully created ${resourcePlural}`
        ),
        description: translate("notifications.success", "Success"),
        type: "success"
      });
      invalidateStore({
        resource: identifier,
        dataProviderName,
        invalidates
      });
      const ids = response == null ? void 0 : response.data.filter((item) => (item == null ? void 0 : item.id) !== void 0).map((item) => item.id);
      publish == null ? void 0 : publish({
        channel: `resources/${resource.name}`,
        type: "created",
        payload: {
          ids
        },
        date: /* @__PURE__ */ new Date(),
        meta: {
          ...combinedMeta,
          dataProviderName
        }
      });
      const {
        fields: _fields,
        operation: _operation,
        variables: _variables,
        ...rest
      } = combinedMeta || {};
      log == null ? void 0 : log.mutate({
        action: "createMany",
        resource: resource.name,
        data: values,
        meta: {
          dataProviderName,
          ids,
          ...rest
        }
      });
      (_a = mutationOptions == null ? void 0 : mutationOptions.onSuccess) == null ? void 0 : _a.call(mutationOptions, response, variables, context);
    },
    onError: (err, variables, context) => {
      var _a;
      const {
        resource: resourceName = resourceFromProps,
        errorNotification = errorNotificationFromProps,
        values = valuesFromProps
      } = variables;
      if (!values)
        throw missingValuesError3;
      if (!resourceName)
        throw missingResourceError3;
      const { identifier } = select(resourceName);
      const notificationConfig = typeof errorNotification === "function" ? errorNotification(err, values, identifier) : errorNotification;
      handleNotification(notificationConfig, {
        key: `createMany-${identifier}-notification`,
        description: err.message,
        message: translate(
          "notifications.createError",
          {
            resource: translate(`${identifier}.${identifier}`, identifier),
            statusCode: err.statusCode
          },
          `There was an error creating ${identifier} (status code: ${err.statusCode}`
        ),
        type: "error"
      });
      (_a = mutationOptions == null ? void 0 : mutationOptions.onError) == null ? void 0 : _a.call(mutationOptions, err, variables, context);
    },
    mutationKey: keys2().data().mutation("createMany").get(preferLegacyKeys),
    ...mutationOptions,
    meta: {
      ...mutationOptions == null ? void 0 : mutationOptions.meta,
      ...k("useCreateMany", preferLegacyKeys)
    }
  });
  const { mutate, mutateAsync, ...mutation } = mutationResult;
  const { elapsedTime } = useLoadingOvertime({
    ...overtimeOptions,
    isLoading: mutation.isLoading
  });
  const handleMutation = /* @__PURE__ */ __name((variables, options) => {
    return mutate(variables || {}, options);
  }, "handleMutation");
  const handleMutateAsync = /* @__PURE__ */ __name((variables, options) => {
    return mutateAsync(variables || {}, options);
  }, "handleMutateAsync");
  return {
    ...mutation,
    mutate: handleMutation,
    mutateAsync: handleMutateAsync,
    overtime: { elapsedTime }
  };
}, "useCreateMany");
var missingResourceError3 = new Error(
  "[useCreateMany]: `resource` is not defined or not matched but is required"
);
var missingValuesError3 = new Error(
  "[useCreateMany]: `values` is not provided but is required"
);
var useUpdateMany = /* @__PURE__ */ __name(({
  ids: idsFromProps,
  resource: resourceFromProps,
  values: valuesFromProps,
  dataProviderName: dataProviderNameFromProps,
  successNotification: successNotificationFromProps,
  errorNotification: errorNotificationFromProps,
  meta: metaFromProps,
  metaData: metaDataFromProps,
  mutationMode: mutationModeFromProps,
  undoableTimeout: undoableTimeoutFromProps,
  onCancel: onCancelFromProps,
  optimisticUpdateMap: optimisticUpdateMapFromProps,
  invalidates: invalidatesFromProps,
  mutationOptions,
  overtimeOptions
} = {}) => {
  const { resources, select } = useResource();
  const queryClient = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQueryClient();
  const dataProvider = useDataProvider();
  const translate = useTranslate();
  const {
    mutationMode: mutationModeContext,
    undoableTimeout: undoableTimeoutContext
  } = useMutationMode();
  const authProvider = useActiveAuthProvider();
  const { mutate: checkError } = useOnError({
    v3LegacyAuthProviderCompatible: Boolean(authProvider == null ? void 0 : authProvider.isLegacy)
  });
  const { notificationDispatch } = useCancelNotification();
  const publish = usePublish();
  const handleNotification = useHandleNotification();
  const invalidateStore = useInvalidate();
  const { log } = useLog();
  const getMeta = useMeta();
  const {
    options: { textTransformers }
  } = useRefineContext();
  const { keys: keys2, preferLegacyKeys } = useKeys();
  const mutationResult = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({
    mutationFn: ({
      ids = idsFromProps,
      values = valuesFromProps,
      resource: resourceName = resourceFromProps,
      onCancel = onCancelFromProps,
      mutationMode = mutationModeFromProps,
      undoableTimeout = undoableTimeoutFromProps,
      meta = metaFromProps,
      metaData = metaDataFromProps,
      dataProviderName = dataProviderNameFromProps
    }) => {
      if (!ids)
        throw missingIdError2;
      if (!values)
        throw missingValuesError4;
      if (!resourceName)
        throw missingResourceError4;
      const { resource, identifier } = select(resourceName);
      const combinedMeta = getMeta({
        resource,
        meta: pickNotDeprecated(meta, metaData)
      });
      const mutationModePropOrContext = mutationMode ?? mutationModeContext;
      const undoableTimeoutPropOrContext = undoableTimeout ?? undoableTimeoutContext;
      const selectedDataProvider = dataProvider(
        pickDataProvider(identifier, dataProviderName, resources)
      );
      const mutationFn = /* @__PURE__ */ __name(() => {
        if (selectedDataProvider.updateMany) {
          return selectedDataProvider.updateMany({
            resource: resource.name,
            ids,
            variables: values,
            meta: combinedMeta,
            metaData: combinedMeta
          });
        }
        return handleMultiple(
          ids.map(
            (id) => selectedDataProvider.update({
              resource: resource.name,
              id,
              variables: values,
              meta: combinedMeta,
              metaData: combinedMeta
            })
          )
        );
      }, "mutationFn");
      if (!(mutationModePropOrContext === "undoable")) {
        return mutationFn();
      }
      const updatePromise = new Promise(
        (resolve, reject) => {
          const doMutation = /* @__PURE__ */ __name(() => {
            mutationFn().then((result) => resolve(result)).catch((err) => reject(err));
          }, "doMutation");
          const cancelMutation = /* @__PURE__ */ __name(() => {
            reject({ message: "mutationCancelled" });
          }, "cancelMutation");
          if (onCancel) {
            onCancel(cancelMutation);
          }
          notificationDispatch({
            type: "ADD" /* ADD */,
            payload: {
              id: ids,
              resource: identifier,
              cancelMutation,
              doMutation,
              seconds: undoableTimeoutPropOrContext,
              isSilent: !!onCancel
            }
          });
        }
      );
      return updatePromise;
    },
    onMutate: async ({
      resource: resourceName = resourceFromProps,
      ids = idsFromProps,
      values = valuesFromProps,
      mutationMode = mutationModeFromProps,
      dataProviderName = dataProviderNameFromProps,
      meta = metaFromProps,
      metaData = metaDataFromProps,
      optimisticUpdateMap = optimisticUpdateMapFromProps ?? {
        list: true,
        many: true,
        detail: true
      }
    }) => {
      if (!ids)
        throw missingIdError2;
      if (!values)
        throw missingValuesError4;
      if (!resourceName)
        throw missingResourceError4;
      const { identifier } = select(resourceName);
      const {
        gqlMutation: _,
        gqlQuery: __,
        ...preferredMeta
      } = pickNotDeprecated(meta, metaData) ?? {};
      const queryKey = queryKeysReplacement(preferLegacyKeys)(
        identifier,
        pickDataProvider(identifier, dataProviderName, resources),
        preferredMeta
      );
      const resourceKeys = keys2().data(pickDataProvider(identifier, dataProviderName, resources)).resource(identifier);
      const mutationModePropOrContext = mutationMode ?? mutationModeContext;
      await queryClient.cancelQueries(
        resourceKeys.get(preferLegacyKeys),
        void 0,
        {
          silent: true
        }
      );
      const previousQueries = queryClient.getQueriesData(
        resourceKeys.get(preferLegacyKeys)
      );
      if (mutationModePropOrContext !== "pessimistic") {
        if (optimisticUpdateMap.list) {
          queryClient.setQueriesData(
            resourceKeys.action("list").params(preferredMeta ?? {}).get(preferLegacyKeys),
            (previous) => {
              if (typeof optimisticUpdateMap.list === "function") {
                return optimisticUpdateMap.list(previous, values, ids);
              }
              if (!previous) {
                return null;
              }
              const data = previous.data.map((record) => {
                if (record.id !== void 0 && ids.filter((id) => id !== void 0).map(String).includes(record.id.toString())) {
                  return {
                    ...record,
                    ...values
                  };
                }
                return record;
              });
              return {
                ...previous,
                data
              };
            }
          );
        }
        if (optimisticUpdateMap.many) {
          queryClient.setQueriesData(
            resourceKeys.action("many").get(preferLegacyKeys),
            (previous) => {
              if (typeof optimisticUpdateMap.many === "function") {
                return optimisticUpdateMap.many(previous, values, ids);
              }
              if (!previous) {
                return null;
              }
              const data = previous.data.map((record) => {
                if (record.id !== void 0 && ids.filter((id) => id !== void 0).map(String).includes(record.id.toString())) {
                  return {
                    ...record,
                    ...values
                  };
                }
                return record;
              });
              return {
                ...previous,
                data
              };
            }
          );
        }
        if (optimisticUpdateMap.detail) {
          for (const id of ids) {
            queryClient.setQueriesData(
              resourceKeys.action("one").id(id).params(preferredMeta ?? {}).get(preferLegacyKeys),
              (previous) => {
                if (typeof optimisticUpdateMap.detail === "function") {
                  return optimisticUpdateMap.detail(previous, values, id);
                }
                if (!previous) {
                  return null;
                }
                const data = {
                  ...previous.data,
                  ...values
                };
                return {
                  ...previous,
                  data
                };
              }
            );
          }
        }
      }
      return {
        previousQueries,
        queryKey
      };
    },
    onSettled: (data, error, variables, context) => {
      var _a;
      const {
        ids = idsFromProps,
        resource: resourceName = resourceFromProps,
        dataProviderName = dataProviderNameFromProps,
        invalidates = invalidatesFromProps
      } = variables;
      if (!ids)
        throw missingIdError2;
      if (!resourceName)
        throw missingResourceError4;
      const { identifier } = select(resourceName);
      invalidateStore({
        resource: identifier,
        invalidates: invalidates ?? ["list", "many"],
        dataProviderName: pickDataProvider(
          identifier,
          dataProviderName,
          resources
        )
      });
      ids.forEach(
        (id) => invalidateStore({
          resource: identifier,
          invalidates: invalidates ?? ["detail"],
          dataProviderName: pickDataProvider(
            identifier,
            dataProviderName,
            resources
          ),
          id
        })
      );
      notificationDispatch({
        type: "REMOVE" /* REMOVE */,
        payload: { id: ids, resource: identifier }
      });
      (_a = mutationOptions == null ? void 0 : mutationOptions.onSettled) == null ? void 0 : _a.call(mutationOptions, data, error, variables, context);
    },
    onSuccess: (data, variables, context) => {
      var _a;
      const {
        ids = idsFromProps,
        resource: resourceName = resourceFromProps,
        values = valuesFromProps,
        meta = metaFromProps,
        metaData = metaDataFromProps,
        dataProviderName: dataProviderNameFromProp = dataProviderNameFromProps,
        successNotification = successNotificationFromProps
      } = variables;
      if (!ids)
        throw missingIdError2;
      if (!values)
        throw missingValuesError4;
      if (!resourceName)
        throw missingResourceError4;
      const { resource, identifier } = select(resourceName);
      const resourceSingular = textTransformers.singular(identifier);
      const dataProviderName = pickDataProvider(
        identifier,
        dataProviderNameFromProp,
        resources
      );
      const combinedMeta = getMeta({
        resource,
        meta: pickNotDeprecated(meta, metaData)
      });
      const notificationConfig = typeof successNotification === "function" ? successNotification(data, { ids, values }, identifier) : successNotification;
      handleNotification(notificationConfig, {
        key: `${ids}-${identifier}-notification`,
        description: translate("notifications.success", "Successful"),
        message: translate(
          "notifications.editSuccess",
          {
            resource: translate(`${identifier}.${identifier}`, identifier)
          },
          `Successfully updated ${resourceSingular}`
        ),
        type: "success"
      });
      publish == null ? void 0 : publish({
        channel: `resources/${resource.name}`,
        type: "updated",
        payload: {
          ids: ids.map(String)
        },
        date: /* @__PURE__ */ new Date(),
        meta: {
          ...combinedMeta,
          dataProviderName
        }
      });
      const previousData = [];
      if (context) {
        ids.forEach((id) => {
          const queryData = queryClient.getQueryData(
            context.queryKey.detail(id)
          );
          previousData.push(
            Object.keys(values || {}).reduce((acc, item) => {
              var _a2;
              acc[item] = (_a2 = queryData == null ? void 0 : queryData.data) == null ? void 0 : _a2[item];
              return acc;
            }, {})
          );
        });
      }
      const {
        fields: _fields,
        operation: _operation,
        variables: _variables,
        ...rest
      } = combinedMeta || {};
      log == null ? void 0 : log.mutate({
        action: "updateMany",
        resource: resource.name,
        data: values,
        previousData,
        meta: {
          ids,
          dataProviderName,
          ...rest
        }
      });
      (_a = mutationOptions == null ? void 0 : mutationOptions.onSuccess) == null ? void 0 : _a.call(mutationOptions, data, variables, context);
    },
    onError: (err, variables, context) => {
      var _a;
      const {
        ids = idsFromProps,
        resource: resourceName = resourceFromProps,
        errorNotification = errorNotificationFromProps,
        values = valuesFromProps
      } = variables;
      if (!ids)
        throw missingIdError2;
      if (!values)
        throw missingValuesError4;
      if (!resourceName)
        throw missingResourceError4;
      const { identifier } = select(resourceName);
      if (context) {
        for (const query of context.previousQueries) {
          queryClient.setQueryData(query[0], query[1]);
        }
      }
      if (err.message !== "mutationCancelled") {
        checkError == null ? void 0 : checkError(err);
        const resourceSingular = textTransformers.singular(identifier);
        const notificationConfig = typeof errorNotification === "function" ? errorNotification(err, { ids, values }, identifier) : errorNotification;
        handleNotification(notificationConfig, {
          key: `${ids}-${identifier}-updateMany-error-notification`,
          message: translate(
            "notifications.editError",
            {
              resource: resourceSingular,
              statusCode: err.statusCode
            },
            `Error when updating ${resourceSingular} (status code: ${err.statusCode})`
          ),
          description: err.message,
          type: "error"
        });
      }
      (_a = mutationOptions == null ? void 0 : mutationOptions.onError) == null ? void 0 : _a.call(mutationOptions, err, variables, context);
    },
    mutationKey: keys2().data().mutation("updateMany").get(preferLegacyKeys),
    ...mutationOptions,
    meta: {
      ...mutationOptions == null ? void 0 : mutationOptions.meta,
      ...k("useUpdateMany", preferLegacyKeys)
    }
  });
  const { mutate, mutateAsync, ...mutation } = mutationResult;
  const { elapsedTime } = useLoadingOvertime({
    ...overtimeOptions,
    isLoading: mutation.isLoading
  });
  const handleMutation = /* @__PURE__ */ __name((variables, options) => {
    return mutate(variables || {}, options);
  }, "handleMutation");
  const handleMutateAsync = /* @__PURE__ */ __name((variables, options) => {
    return mutateAsync(variables || {}, options);
  }, "handleMutateAsync");
  return {
    ...mutation,
    mutate: handleMutation,
    mutateAsync: handleMutateAsync,
    overtime: { elapsedTime }
  };
}, "useUpdateMany");
var missingResourceError4 = new Error(
  "[useUpdateMany]: `resource` is not defined or not matched but is required"
);
var missingIdError2 = new Error(
  "[useUpdateMany]: `id` is not defined but is required in edit and clone actions"
);
var missingValuesError4 = new Error(
  "[useUpdateMany]: `values` is not provided but is required"
);
var useDeleteMany = /* @__PURE__ */ __name(({
  mutationOptions,
  overtimeOptions
} = {}) => {
  const authProvider = useActiveAuthProvider();
  const { mutate: checkError } = useOnError({
    v3LegacyAuthProviderCompatible: Boolean(authProvider == null ? void 0 : authProvider.isLegacy)
  });
  const {
    mutationMode: mutationModeContext,
    undoableTimeout: undoableTimeoutContext
  } = useMutationMode();
  const dataProvider = useDataProvider();
  const { notificationDispatch } = useCancelNotification();
  const translate = useTranslate();
  const publish = usePublish();
  const handleNotification = useHandleNotification();
  const invalidateStore = useInvalidate();
  const { log } = useLog();
  const { resources, select } = useResource();
  const queryClient = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQueryClient();
  const getMeta = useMeta();
  const {
    options: { textTransformers }
  } = useRefineContext();
  const { keys: keys2, preferLegacyKeys } = useKeys();
  const mutation = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({
    mutationFn: ({
      resource: resourceName,
      ids,
      mutationMode,
      undoableTimeout,
      onCancel,
      meta,
      metaData,
      dataProviderName,
      values
    }) => {
      const { resource, identifier } = select(resourceName);
      const combinedMeta = getMeta({
        resource,
        meta: pickNotDeprecated(meta, metaData)
      });
      const mutationModePropOrContext = mutationMode ?? mutationModeContext;
      const undoableTimeoutPropOrContext = undoableTimeout ?? undoableTimeoutContext;
      const selectedDataProvider = dataProvider(
        pickDataProvider(identifier, dataProviderName, resources)
      );
      const mutationFn = /* @__PURE__ */ __name(() => {
        if (selectedDataProvider.deleteMany) {
          return selectedDataProvider.deleteMany({
            resource: resource.name,
            ids,
            meta: combinedMeta,
            metaData: combinedMeta,
            variables: values
          });
        }
        return handleMultiple(
          ids.map(
            (id) => selectedDataProvider.deleteOne({
              resource: resource.name,
              id,
              meta: combinedMeta,
              metaData: combinedMeta,
              variables: values
            })
          )
        );
      }, "mutationFn");
      if (!(mutationModePropOrContext === "undoable")) {
        return mutationFn();
      }
      const updatePromise = new Promise(
        (resolve, reject) => {
          const doMutation = /* @__PURE__ */ __name(() => {
            mutationFn().then((result) => resolve(result)).catch((err) => reject(err));
          }, "doMutation");
          const cancelMutation = /* @__PURE__ */ __name(() => {
            reject({ message: "mutationCancelled" });
          }, "cancelMutation");
          if (onCancel) {
            onCancel(cancelMutation);
          }
          notificationDispatch({
            type: "ADD" /* ADD */,
            payload: {
              id: ids,
              resource: identifier,
              cancelMutation,
              doMutation,
              seconds: undoableTimeoutPropOrContext,
              isSilent: !!onCancel
            }
          });
        }
      );
      return updatePromise;
    },
    onMutate: async ({
      ids,
      resource: resourceName,
      mutationMode,
      dataProviderName,
      meta,
      metaData
    }) => {
      const { identifier } = select(resourceName);
      const {
        gqlMutation: _,
        gqlQuery: __,
        ...preferredMeta
      } = pickNotDeprecated(meta, metaData) ?? {};
      const queryKey = queryKeysReplacement(preferLegacyKeys)(
        identifier,
        pickDataProvider(identifier, dataProviderName, resources),
        preferredMeta
      );
      const resourceKeys = keys2().data(pickDataProvider(identifier, dataProviderName, resources)).resource(identifier);
      const mutationModePropOrContext = mutationMode ?? mutationModeContext;
      await queryClient.cancelQueries(
        resourceKeys.get(preferLegacyKeys),
        void 0,
        {
          silent: true
        }
      );
      const previousQueries = queryClient.getQueriesData(resourceKeys.get(preferLegacyKeys));
      if (mutationModePropOrContext !== "pessimistic") {
        queryClient.setQueriesData(
          resourceKeys.action("list").params(preferredMeta ?? {}).get(preferLegacyKeys),
          (previous) => {
            if (!previous) {
              return null;
            }
            const data = previous.data.filter(
              (item) => item.id && !ids.map(String).includes(item.id.toString())
            );
            return {
              data,
              total: previous.total - 1
            };
          }
        );
        queryClient.setQueriesData(
          resourceKeys.action("many").get(preferLegacyKeys),
          (previous) => {
            if (!previous) {
              return null;
            }
            const data = previous.data.filter((record) => {
              if (record.id) {
                return !ids.map(String).includes(record.id.toString());
              }
              return false;
            });
            return {
              ...previous,
              data
            };
          }
        );
        for (const id of ids) {
          queryClient.setQueriesData(
            resourceKeys.action("one").id(id).params(preferredMeta).get(preferLegacyKeys),
            (previous) => {
              if (!previous || previous.data.id === id) {
                return null;
              }
              return {
                ...previous
              };
            }
          );
        }
      }
      return {
        previousQueries,
        queryKey
      };
    },
    // Always refetch after error or success:
    onSettled: (_data, _error, {
      resource: resourceName,
      ids,
      dataProviderName,
      invalidates = ["list", "many"]
    }) => {
      const { identifier } = select(resourceName);
      invalidateStore({
        resource: identifier,
        dataProviderName: pickDataProvider(
          identifier,
          dataProviderName,
          resources
        ),
        invalidates
      });
      notificationDispatch({
        type: "REMOVE" /* REMOVE */,
        payload: { id: ids, resource: identifier }
      });
    },
    onSuccess: (_data, {
      ids,
      resource: resourceName,
      meta,
      metaData,
      dataProviderName: dataProviderNameFromProp,
      successNotification
    }, context) => {
      const { resource, identifier } = select(resourceName);
      const dataProviderName = pickDataProvider(
        identifier,
        dataProviderNameFromProp,
        resources
      );
      const combinedMeta = getMeta({
        resource,
        meta: pickNotDeprecated(meta, metaData)
      });
      ids.forEach(
        (id) => queryClient.removeQueries(context == null ? void 0 : context.queryKey.detail(id))
      );
      const notificationConfig = typeof successNotification === "function" ? successNotification(_data, ids, identifier) : successNotification;
      handleNotification(notificationConfig, {
        key: `${ids}-${identifier}-notification`,
        description: translate("notifications.success", "Success"),
        message: translate(
          "notifications.deleteSuccess",
          {
            resource: translate(`${identifier}.${identifier}`, identifier)
          },
          `Successfully deleted ${identifier}`
        ),
        type: "success"
      });
      publish == null ? void 0 : publish({
        channel: `resources/${resource.name}`,
        type: "deleted",
        payload: { ids },
        date: /* @__PURE__ */ new Date(),
        meta: {
          ...combinedMeta,
          dataProviderName
        }
      });
      const {
        fields: _fields,
        operation: _operation,
        variables: _variables,
        ...rest
      } = combinedMeta || {};
      log == null ? void 0 : log.mutate({
        action: "deleteMany",
        resource: resource.name,
        meta: {
          ids,
          dataProviderName,
          ...rest
        }
      });
      ids.forEach(
        (id) => queryClient.removeQueries(context == null ? void 0 : context.queryKey.detail(id))
      );
    },
    onError: (err, { ids, resource: resourceName, errorNotification }, context) => {
      const { identifier } = select(resourceName);
      if (context) {
        for (const query of context.previousQueries) {
          queryClient.setQueryData(query[0], query[1]);
        }
      }
      if (err.message !== "mutationCancelled") {
        checkError(err);
        const resourceSingular = textTransformers.singular(identifier);
        const notificationConfig = typeof errorNotification === "function" ? errorNotification(err, ids, identifier) : errorNotification;
        handleNotification(notificationConfig, {
          key: `${ids}-${identifier}-notification`,
          message: translate(
            "notifications.deleteError",
            {
              resource: resourceSingular,
              statusCode: err.statusCode
            },
            `Error (status code: ${err.statusCode})`
          ),
          description: err.message,
          type: "error"
        });
      }
    },
    mutationKey: keys2().data().mutation("deleteMany").get(preferLegacyKeys),
    ...mutationOptions,
    meta: {
      ...mutationOptions == null ? void 0 : mutationOptions.meta,
      ...k("useDeleteMany", preferLegacyKeys)
    }
  });
  const { elapsedTime } = useLoadingOvertime({
    ...overtimeOptions,
    isLoading: mutation.isLoading
  });
  return { ...mutation, overtime: { elapsedTime } };
}, "useDeleteMany");

// src/hooks/data/useApiUrl.ts
var useApiUrl = /* @__PURE__ */ __name((dataProviderName) => {
  var _a;
  const dataProvider = useDataProvider();
  const { resource } = useResource();
  const { getApiUrl } = dataProvider(
    dataProviderName ?? ((_a = pickNotDeprecated(resource == null ? void 0 : resource.meta, resource == null ? void 0 : resource.options)) == null ? void 0 : _a.dataProviderName)
  );
  return getApiUrl();
}, "useApiUrl");
var useCustom = /* @__PURE__ */ __name(({
  url,
  method,
  config,
  queryOptions,
  successNotification,
  errorNotification,
  meta,
  metaData,
  dataProviderName,
  overtimeOptions
}) => {
  const dataProvider = useDataProvider();
  const authProvider = useActiveAuthProvider();
  const { mutate: checkError } = useOnError({
    v3LegacyAuthProviderCompatible: Boolean(authProvider == null ? void 0 : authProvider.isLegacy)
  });
  const translate = useTranslate();
  const handleNotification = useHandleNotification();
  const getMeta = useMeta();
  const { keys: keys2, preferLegacyKeys } = useKeys();
  const preferredMeta = pickNotDeprecated(meta, metaData);
  const { custom } = dataProvider(dataProviderName);
  const combinedMeta = getMeta({ meta: preferredMeta });
  if (custom) {
    const queryResponse = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQuery({
      queryKey: keys2().data(dataProviderName).mutation("custom").params({
        method,
        url,
        ...config,
        ...preferredMeta || {}
      }).get(preferLegacyKeys),
      queryFn: (context) => custom({
        url,
        method,
        ...config,
        meta: {
          ...combinedMeta,
          queryContext: prepareQueryContext(context)
        },
        metaData: {
          ...combinedMeta,
          queryContext: prepareQueryContext(context)
        }
      }),
      ...queryOptions,
      onSuccess: (data) => {
        var _a;
        (_a = queryOptions == null ? void 0 : queryOptions.onSuccess) == null ? void 0 : _a.call(queryOptions, data);
        const notificationConfig = typeof successNotification === "function" ? successNotification(data, {
          ...config,
          ...combinedMeta
        }) : successNotification;
        handleNotification(notificationConfig);
      },
      onError: (err) => {
        var _a;
        checkError(err);
        (_a = queryOptions == null ? void 0 : queryOptions.onError) == null ? void 0 : _a.call(queryOptions, err);
        const notificationConfig = typeof errorNotification === "function" ? errorNotification(err, {
          ...config,
          ...combinedMeta
        }) : errorNotification;
        handleNotification(notificationConfig, {
          key: `${method}-notification`,
          message: translate(
            "notifications.error",
            { statusCode: err.statusCode },
            `Error (status code: ${err.statusCode})`
          ),
          description: err.message,
          type: "error"
        });
      },
      meta: {
        ...queryOptions == null ? void 0 : queryOptions.meta,
        ...k("useCustom", preferLegacyKeys)
      }
    });
    const { elapsedTime } = useLoadingOvertime({
      ...overtimeOptions,
      isLoading: queryResponse.isFetching
    });
    return { ...queryResponse, overtime: { elapsedTime } };
  }
  throw Error("Not implemented custom on data provider.");
}, "useCustom");
var useCustomMutation = /* @__PURE__ */ __name(({
  mutationOptions,
  overtimeOptions
} = {}) => {
  const authProvider = useActiveAuthProvider();
  const { mutate: checkError } = useOnError({
    v3LegacyAuthProviderCompatible: Boolean(authProvider == null ? void 0 : authProvider.isLegacy)
  });
  const handleNotification = useHandleNotification();
  const dataProvider = useDataProvider();
  const translate = useTranslate();
  const getMeta = useMeta();
  const { keys: keys2, preferLegacyKeys } = useKeys();
  const mutation = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation(
    ({
      url,
      method,
      values,
      meta,
      metaData,
      dataProviderName,
      config
    }) => {
      const combinedMeta = getMeta({
        meta: pickNotDeprecated(meta, metaData)
      });
      const { custom } = dataProvider(dataProviderName);
      if (custom) {
        return custom({
          url,
          method,
          payload: values,
          meta: combinedMeta,
          metaData: combinedMeta,
          headers: { ...config == null ? void 0 : config.headers }
        });
      }
      throw Error("Not implemented custom on data provider.");
    },
    {
      onSuccess: (data, {
        successNotification: successNotificationFromProp,
        config,
        meta,
        metaData
      }) => {
        const notificationConfig = typeof successNotificationFromProp === "function" ? successNotificationFromProp(data, {
          ...config,
          ...pickNotDeprecated(meta, metaData) || {}
        }) : successNotificationFromProp;
        handleNotification(notificationConfig);
      },
      onError: (err, {
        errorNotification: errorNotificationFromProp,
        method,
        config,
        meta,
        metaData
      }) => {
        checkError(err);
        const notificationConfig = typeof errorNotificationFromProp === "function" ? errorNotificationFromProp(err, {
          ...config,
          ...pickNotDeprecated(meta, metaData) || {}
        }) : errorNotificationFromProp;
        handleNotification(notificationConfig, {
          key: `${method}-notification`,
          message: translate(
            "notifications.error",
            { statusCode: err.statusCode },
            `Error (status code: ${err.statusCode})`
          ),
          description: err.message,
          type: "error"
        });
      },
      mutationKey: keys2().data().mutation("customMutation").get(preferLegacyKeys),
      ...mutationOptions,
      meta: {
        ...mutationOptions == null ? void 0 : mutationOptions.meta,
        ...k("useCustomMutation", preferLegacyKeys)
      }
    }
  );
  const { elapsedTime } = useLoadingOvertime({
    ...overtimeOptions,
    isLoading: mutation.isLoading
  });
  return { ...mutation, overtime: { elapsedTime } };
}, "useCustomMutation");
var defaultDataProvider = {
  default: {}
};
var DataContext = React3.createContext(defaultDataProvider);
var DataContextProvider = /* @__PURE__ */ __name(({
  children,
  dataProvider
}) => {
  let providerValue = defaultDataProvider;
  if (dataProvider) {
    if (!("default" in dataProvider) && ("getList" in dataProvider || "getOne" in dataProvider)) {
      providerValue = {
        default: dataProvider
      };
    } else {
      providerValue = dataProvider;
    }
  }
  return /* @__PURE__ */ React3.createElement(DataContext.Provider, { value: providerValue }, children);
}, "DataContextProvider");

// src/hooks/data/useDataProvider.tsx
var useDataProvider = /* @__PURE__ */ __name(() => {
  const context = dashboard__loadShare__react__loadShare__.useContext(DataContext);
  const handleDataProvider = dashboard__loadShare__react__loadShare__.useCallback(
    (dataProviderName) => {
      if (dataProviderName) {
        const dataProvider = context == null ? void 0 : context[dataProviderName];
        if (!dataProvider) {
          throw new Error(`"${dataProviderName}" Data provider not found`);
        }
        if (dataProvider && !(context == null ? void 0 : context.default)) {
          throw new Error(
            "If you have multiple data providers, you must provide default data provider property"
          );
        }
        return context[dataProviderName];
      }
      if (context.default) {
        return context.default;
      }
      throw new Error(
        `There is no "default" data provider. Please pass dataProviderName.`
      );
    },
    [context]
  );
  return handleDataProvider;
}, "useDataProvider");
var useInfiniteList = /* @__PURE__ */ __name(({
  resource: resourceFromProp,
  config,
  filters,
  hasPagination,
  pagination,
  sorters,
  queryOptions,
  successNotification,
  errorNotification,
  meta,
  metaData,
  liveMode,
  onLiveEvent,
  liveParams,
  dataProviderName,
  overtimeOptions
}) => {
  const { resources, resource, identifier } = useResource(resourceFromProp);
  const dataProvider = useDataProvider();
  const translate = useTranslate();
  const authProvider = useActiveAuthProvider();
  const { mutate: checkError } = useOnError({
    v3LegacyAuthProviderCompatible: Boolean(authProvider == null ? void 0 : authProvider.isLegacy)
  });
  const handleNotification = useHandleNotification();
  const getMeta = useMeta();
  const { keys: keys2, preferLegacyKeys } = useKeys();
  const pickedDataProvider = pickDataProvider(
    identifier,
    dataProviderName,
    resources
  );
  const preferredMeta = pickNotDeprecated(meta, metaData);
  const prefferedFilters = pickNotDeprecated(filters, config == null ? void 0 : config.filters);
  const prefferedSorters = pickNotDeprecated(sorters, config == null ? void 0 : config.sort);
  const prefferedHasPagination = pickNotDeprecated(
    hasPagination,
    config == null ? void 0 : config.hasPagination
  );
  const prefferedPagination = handlePaginationParams({
    pagination,
    configPagination: config == null ? void 0 : config.pagination,
    hasPagination: prefferedHasPagination
  });
  const isServerPagination = prefferedPagination.mode === "server";
  const notificationValues = {
    meta: preferredMeta,
    metaData: preferredMeta,
    filters: prefferedFilters,
    hasPagination: isServerPagination,
    pagination: prefferedPagination,
    sorters: prefferedSorters,
    config: {
      ...config,
      sort: prefferedSorters
    }
  };
  const isEnabled = (queryOptions == null ? void 0 : queryOptions.enabled) === void 0 || (queryOptions == null ? void 0 : queryOptions.enabled) === true;
  const combinedMeta = getMeta({ resource, meta: preferredMeta });
  const { getList } = dataProvider(pickedDataProvider);
  useResourceSubscription({
    resource: identifier,
    types: ["*"],
    params: {
      meta: combinedMeta,
      metaData: combinedMeta,
      pagination: prefferedPagination,
      hasPagination: isServerPagination,
      sort: prefferedSorters,
      sorters: prefferedSorters,
      filters: prefferedFilters,
      subscriptionType: "useList",
      ...liveParams
    },
    channel: `resources/${resource.name}`,
    enabled: isEnabled,
    liveMode,
    onLiveEvent,
    dataProviderName: pickedDataProvider,
    meta: {
      ...combinedMeta,
      dataProviderName
    }
  });
  const queryResponse = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useInfiniteQuery({
    queryKey: keys2().data(pickedDataProvider).resource(identifier).action("infinite").params({
      ...preferredMeta || {},
      filters: prefferedFilters,
      hasPagination: isServerPagination,
      ...isServerPagination && {
        pagination: prefferedPagination
      },
      ...sorters && {
        sorters
      },
      ...(config == null ? void 0 : config.sort) && {
        sort: config == null ? void 0 : config.sort
      }
    }).get(preferLegacyKeys),
    queryFn: (context) => {
      const paginationProperties = {
        ...prefferedPagination,
        current: context.pageParam
      };
      const meta2 = {
        ...combinedMeta,
        queryContext: prepareQueryContext(context)
      };
      return getList({
        resource: resource.name,
        pagination: paginationProperties,
        hasPagination: isServerPagination,
        filters: prefferedFilters,
        sort: prefferedSorters,
        sorters: prefferedSorters,
        meta: meta2,
        metaData: meta2
      }).then(({ data, total, ...rest }) => {
        return {
          data,
          total,
          pagination: paginationProperties,
          ...rest
        };
      });
    },
    getNextPageParam: (lastPage) => getNextPageParam(lastPage),
    getPreviousPageParam: (lastPage) => getPreviousPageParam(lastPage),
    ...queryOptions,
    onSuccess: (data) => {
      var _a;
      (_a = queryOptions == null ? void 0 : queryOptions.onSuccess) == null ? void 0 : _a.call(queryOptions, data);
      const notificationConfig = typeof successNotification === "function" ? successNotification(data, notificationValues, identifier) : successNotification;
      handleNotification(notificationConfig);
    },
    onError: (err) => {
      var _a;
      checkError(err);
      (_a = queryOptions == null ? void 0 : queryOptions.onError) == null ? void 0 : _a.call(queryOptions, err);
      const notificationConfig = typeof errorNotification === "function" ? errorNotification(err, notificationValues, identifier) : errorNotification;
      handleNotification(notificationConfig, {
        key: `${identifier}-useInfiniteList-notification`,
        message: translate(
          "notifications.error",
          { statusCode: err.statusCode },
          `Error (status code: ${err.statusCode})`
        ),
        description: err.message,
        type: "error"
      });
    },
    meta: {
      ...queryOptions == null ? void 0 : queryOptions.meta,
      ...k("useInfiniteList", preferLegacyKeys, resource == null ? void 0 : resource.name)
    }
  });
  const { elapsedTime } = useLoadingOvertime({
    ...overtimeOptions,
    isLoading: queryResponse.isFetching
  });
  return { ...queryResponse, overtime: { elapsedTime } };
}, "useInfiniteList");
var LiveContext = React3.createContext({});
var LiveContextProvider = /* @__PURE__ */ __name(({
  liveProvider,
  children
}) => {
  return /* @__PURE__ */ React3.createElement(LiveContext.Provider, { value: { liveProvider } }, children);
}, "LiveContextProvider");
var useInvalidate = /* @__PURE__ */ __name(() => {
  const { resources } = useResource();
  const queryClient = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQueryClient();
  const { keys: keys2, preferLegacyKeys } = useKeys();
  const invalidate = dashboard__loadShare__react__loadShare__.useCallback(
    async ({
      resource,
      dataProviderName,
      invalidates,
      id,
      invalidationFilters = { type: "all", refetchType: "active" },
      invalidationOptions = { cancelRefetch: false }
    }) => {
      if (invalidates === false) {
        return;
      }
      const dp = pickDataProvider(resource, dataProviderName, resources);
      const queryKey = keys2().data(dp).resource(resource ?? "");
      await Promise.all(
        invalidates.map((key) => {
          switch (key) {
            case "all":
              return queryClient.invalidateQueries(
                keys2().data(dp).get(preferLegacyKeys),
                invalidationFilters,
                invalidationOptions
              );
            case "list":
              return queryClient.invalidateQueries(
                queryKey.action("list").get(preferLegacyKeys),
                invalidationFilters,
                invalidationOptions
              );
            case "many":
              return queryClient.invalidateQueries(
                queryKey.action("many").get(preferLegacyKeys),
                invalidationFilters,
                invalidationOptions
              );
            case "resourceAll":
              return queryClient.invalidateQueries(
                queryKey.get(preferLegacyKeys),
                invalidationFilters,
                invalidationOptions
              );
            case "detail":
              return queryClient.invalidateQueries(
                queryKey.action("one").id(id || "").get(preferLegacyKeys),
                invalidationFilters,
                invalidationOptions
              );
            default:
              return;
          }
        })
      );
      return;
    },
    []
  );
  return invalidate;
}, "useInvalidate");
var useMemoized = /* @__PURE__ */ __name((value) => {
  const ref = dashboard__loadShare__react__loadShare__.useRef(value);
  if (!isEqual(ref.current, value)) {
    ref.current = value;
  }
  return ref.current;
}, "useMemoized");

// src/hooks/deepMemo/index.tsx
var useDeepMemo = /* @__PURE__ */ __name((fn, dependencies) => {
  const memoizedDependencies = useMemoized(dependencies);
  const value = dashboard__loadShare__react__loadShare__.useMemo(fn, memoizedDependencies);
  return value;
}, "useDeepMemo");

// src/contexts/resource/index.tsx
var ResourceContext = React3.createContext({
  resources: []
});
var ResourceContextProvider = /* @__PURE__ */ __name(({ resources: providedResources, children }) => {
  const resources = useDeepMemo(() => {
    return legacyResourceTransform(providedResources ?? []);
  }, [providedResources]);
  return /* @__PURE__ */ React3.createElement(ResourceContext.Provider, { value: { resources } }, children);
}, "ResourceContextProvider");
var RouterPickerContext = React3.createContext("new");
var RouterPickerProvider = RouterPickerContext.Provider;
var useRouterType = /* @__PURE__ */ __name(() => {
  const value = React3.useContext(RouterPickerContext);
  return value;
}, "useRouterType");
var defaultRouterProvider = {};
var RouterContext = dashboard__loadShare__react__loadShare__.createContext(
  defaultRouterProvider
);
var RouterContextProvider = /* @__PURE__ */ __name(({ children, router }) => {
  return /* @__PURE__ */ React3.createElement(RouterContext.Provider, { value: router ?? defaultRouterProvider }, children);
}, "RouterContextProvider");
var useParse = /* @__PURE__ */ __name(() => {
  const routerContext = dashboard__loadShare__react__loadShare__.useContext(RouterContext);
  const useParse2 = React3.useMemo(
    () => (routerContext == null ? void 0 : routerContext.parse) ?? (() => () => {
      return {};
    }),
    [routerContext == null ? void 0 : routerContext.parse]
  );
  const parse6 = useParse2();
  return parse6;
}, "useParse");

// src/hooks/router/use-parsed/index.tsx
var useParsed = /* @__PURE__ */ __name(() => {
  const parse6 = useParse();
  const parsed = React3.useMemo(() => parse6(), [parse6]);
  return parsed;
}, "useParsed");

// src/hooks/resource/useResource/index.ts
function useResource(args) {
  const { resources } = dashboard__loadShare__react__loadShare__.useContext(ResourceContext);
  const routerType = useRouterType();
  const params = useParsed();
  const oldProps = {
    resourceName: args && typeof args !== "string" ? args.resourceName : args,
    resourceNameOrRouteName: args && typeof args !== "string" ? args.resourceNameOrRouteName : args,
    recordItemId: args && typeof args !== "string" ? args.recordItemId : void 0
  };
  const select = /* @__PURE__ */ __name((resourceName, force = true) => {
    const isLegacy = routerType === "legacy";
    const pickedResource = pickResource(resourceName, resources, isLegacy);
    if (pickedResource) {
      return {
        resource: pickedResource,
        identifier: pickedResource.identifier ?? pickedResource.name
      };
    }
    if (force) {
      const resource2 = {
        name: resourceName,
        identifier: resourceName
      };
      const identifier2 = resource2.identifier ?? resource2.name;
      return {
        resource: resource2,
        identifier: identifier2
      };
    }
    return void 0;
  }, "select");
  const resourceWithRoute = useResourceWithRoute();
  const { useParams } = useRouterContext();
  const legacyParams = useParams();
  if (routerType === "legacy") {
    const resourceKeyToCheck = oldProps.resourceNameOrRouteName ? oldProps.resourceNameOrRouteName : legacyParams.resource;
    const legacyResource = resourceKeyToCheck ? resourceWithRoute(resourceKeyToCheck) : void 0;
    const legacyId = (oldProps == null ? void 0 : oldProps.recordItemId) ?? legacyParams.id;
    const legacyAction = legacyParams.action;
    const legacyResourceName = (oldProps == null ? void 0 : oldProps.resourceName) ?? (legacyResource == null ? void 0 : legacyResource.name);
    const legacyIdentifier = (legacyResource == null ? void 0 : legacyResource.identifier) ?? (legacyResource == null ? void 0 : legacyResource.name);
    return {
      resources,
      resource: legacyResource,
      resourceName: legacyResourceName,
      id: legacyId,
      action: legacyAction,
      select,
      identifier: legacyIdentifier
    };
  }
  let resource = void 0;
  const identifier = typeof args === "string" ? args : oldProps == null ? void 0 : oldProps.resourceNameOrRouteName;
  if (identifier) {
    const pickedFromProps = pickResource(identifier, resources);
    if (pickedFromProps) {
      resource = pickedFromProps;
    } else {
      resource = {
        name: identifier
      };
    }
  } else if (params == null ? void 0 : params.resource) {
    resource = params.resource;
  }
  return {
    resources,
    resource,
    resourceName: resource == null ? void 0 : resource.name,
    id: params.id,
    action: params.action,
    select,
    identifier: (resource == null ? void 0 : resource.identifier) ?? (resource == null ? void 0 : resource.name)
  };
}
__name(useResource, "useResource");
var useResourceWithRoute = /* @__PURE__ */ __name(() => {
  const { resources } = dashboard__loadShare__react__loadShare__.useContext(ResourceContext);
  const resourceWithRoute = dashboard__loadShare__react__loadShare__.useCallback(
    (route) => {
      const picked = pickResource(route, resources, true);
      if (picked) {
        return picked;
      }
      return { name: route, route };
    },
    [resources]
  );
  return resourceWithRoute;
}, "useResourceWithRoute");

// src/hooks/live/useResourceSubscription/index.ts
var useResourceSubscription = /* @__PURE__ */ __name(({
  resource: resourceFromProp,
  params,
  channel,
  types,
  enabled = true,
  liveMode: liveModeFromProp,
  onLiveEvent,
  dataProviderName: dataProviderNameFromProps,
  meta
}) => {
  var _a;
  const { resource, identifier } = useResource(resourceFromProp);
  const { liveProvider } = dashboard__loadShare__react__loadShare__.useContext(LiveContext);
  const {
    liveMode: liveModeFromContext,
    onLiveEvent: onLiveEventContextCallback
  } = dashboard__loadShare__react__loadShare__.useContext(RefineContext);
  const liveMode = liveModeFromProp ?? liveModeFromContext;
  const invalidate = useInvalidate();
  const dataProviderName = dataProviderNameFromProps ?? (meta == null ? void 0 : meta.dataProviderName) ?? ((_a = resource == null ? void 0 : resource.meta) == null ? void 0 : _a.dataProviderName);
  dashboard__loadShare__react__loadShare__.useEffect(() => {
    let subscription;
    const callback = /* @__PURE__ */ __name((event) => {
      if (liveMode === "auto") {
        invalidate({
          resource: identifier,
          dataProviderName,
          invalidates: ["resourceAll"],
          invalidationFilters: {
            type: "active",
            refetchType: "active"
          },
          invalidationOptions: { cancelRefetch: false }
        });
      }
      onLiveEvent == null ? void 0 : onLiveEvent(event);
      onLiveEventContextCallback == null ? void 0 : onLiveEventContextCallback(event);
    }, "callback");
    if (liveMode && liveMode !== "off" && enabled) {
      subscription = liveProvider == null ? void 0 : liveProvider.subscribe({
        channel,
        params: {
          resource: resource == null ? void 0 : resource.name,
          ...params
        },
        types,
        callback,
        dataProviderName,
        meta: {
          ...meta,
          dataProviderName
        }
      });
    }
    return () => {
      if (subscription) {
        liveProvider == null ? void 0 : liveProvider.unsubscribe(subscription);
      }
    };
  }, [enabled]);
}, "useResourceSubscription");
var useLiveMode = /* @__PURE__ */ __name((liveMode) => {
  const { liveMode: liveModeFromContext } = dashboard__loadShare__react__loadShare__.useContext(RefineContext);
  return liveMode ?? liveModeFromContext;
}, "useLiveMode");
var useSubscription = /* @__PURE__ */ __name(({
  params,
  channel,
  types = ["*"],
  enabled = true,
  onLiveEvent,
  dataProviderName = "default",
  meta
}) => {
  const { liveProvider } = dashboard__loadShare__react__loadShare__.useContext(LiveContext);
  dashboard__loadShare__react__loadShare__.useEffect(() => {
    let subscription;
    if (enabled) {
      subscription = liveProvider == null ? void 0 : liveProvider.subscribe({
        channel,
        params,
        types,
        callback: onLiveEvent,
        dataProviderName,
        meta: {
          ...meta,
          dataProviderName
        }
      });
    }
    return () => {
      if (subscription) {
        liveProvider == null ? void 0 : liveProvider.unsubscribe(subscription);
      }
    };
  }, [enabled]);
}, "useSubscription");
var usePublish = /* @__PURE__ */ __name(() => {
  const { liveProvider } = dashboard__loadShare__react__loadShare__.useContext(LiveContext);
  return liveProvider == null ? void 0 : liveProvider.publish;
}, "usePublish");
var UndoableQueueContext = dashboard__loadShare__react__loadShare__.createContext({
  notifications: [],
  notificationDispatch: () => false
});
var initialState = [];
var undoableQueueReducer = /* @__PURE__ */ __name((state, action) => {
  switch (action.type) {
    case "ADD" /* ADD */: {
      const newState = state.filter((notificationItem) => {
        return !(isEqual(notificationItem.id, action.payload.id) && notificationItem.resource === action.payload.resource);
      });
      return [
        ...newState,
        {
          ...action.payload,
          isRunning: true
        }
      ];
    }
    case "REMOVE" /* REMOVE */:
      return state.filter(
        (notificationItem) => !(isEqual(notificationItem.id, action.payload.id) && notificationItem.resource === action.payload.resource)
      );
    case "DECREASE_NOTIFICATION_SECOND" /* DECREASE_NOTIFICATION_SECOND */:
      return state.map((notificationItem) => {
        if (isEqual(notificationItem.id, action.payload.id) && notificationItem.resource === action.payload.resource) {
          return {
            ...notificationItem,
            seconds: action.payload.seconds - 1e3
          };
        }
        return notificationItem;
      });
    default:
      return state;
  }
}, "undoableQueueReducer");
var UndoableQueueContextProvider = /* @__PURE__ */ __name(({
  children
}) => {
  const [notifications, notificationDispatch] = dashboard__loadShare__react__loadShare__.useReducer(
    undoableQueueReducer,
    initialState
  );
  const notificationData = { notifications, notificationDispatch };
  return /* @__PURE__ */ React3.createElement(UndoableQueueContext.Provider, { value: notificationData }, children, typeof window !== "undefined" ? notifications.map((notification) => /* @__PURE__ */ React3.createElement(
    UndoableQueue,
    {
      key: `${notification.id}-${notification.resource}-queue`,
      notification
    }
  )) : null);
}, "UndoableQueueContextProvider");

// src/hooks/notification/useCancelNotification/index.tsx
var useCancelNotification = /* @__PURE__ */ __name(() => {
  const { notifications, notificationDispatch } = dashboard__loadShare__react__loadShare__.useContext(UndoableQueueContext);
  return { notifications, notificationDispatch };
}, "useCancelNotification");
var NotificationContext = dashboard__loadShare__react__loadShare__.createContext({});
var NotificationContextProvider = /* @__PURE__ */ __name(({ open, close, children }) => {
  return /* @__PURE__ */ React3.createElement(NotificationContext.Provider, { value: { open, close } }, children);
}, "NotificationContextProvider");

// src/hooks/notification/useNotification/index.ts
var useNotification = /* @__PURE__ */ __name(() => {
  const { open, close } = dashboard__loadShare__react__loadShare__.useContext(NotificationContext);
  return { open, close };
}, "useNotification");
var useHandleNotification = /* @__PURE__ */ __name(() => {
  const { open } = useNotification();
  const handleNotification = dashboard__loadShare__react__loadShare__.useCallback(
    (notification, fallbackNotification) => {
      if (notification !== false) {
        if (notification) {
          open == null ? void 0 : open(notification);
        } else if (fallbackNotification) {
          open == null ? void 0 : open(fallbackNotification);
        }
      }
    },
    []
  );
  return handleNotification;
}, "useHandleNotification");
var I18nContext = React3.createContext({});
var I18nContextProvider = /* @__PURE__ */ __name(({
  children,
  i18nProvider
}) => {
  return /* @__PURE__ */ React3.createElement(
    I18nContext.Provider,
    {
      value: {
        i18nProvider
      }
    },
    children
  );
}, "I18nContextProvider");

// src/hooks/i18n/useSetLocale.ts
var useSetLocale = /* @__PURE__ */ __name(() => {
  const { i18nProvider } = dashboard__loadShare__react__loadShare__.useContext(I18nContext);
  return dashboard__loadShare__react__loadShare__.useCallback((lang) => i18nProvider == null ? void 0 : i18nProvider.changeLocale(lang), []);
}, "useSetLocale");
var useTranslate = /* @__PURE__ */ __name(() => {
  const { i18nProvider } = dashboard__loadShare__react__loadShare__.useContext(I18nContext);
  const fn = dashboard__loadShare__react__loadShare__.useMemo(() => {
    function translate(key, options, defaultMessage) {
      return (i18nProvider == null ? void 0 : i18nProvider.translate(key, options, defaultMessage)) ?? defaultMessage ?? (typeof options === "string" && typeof defaultMessage === "undefined" ? options : key);
    }
    __name(translate, "translate");
    return translate;
  }, [i18nProvider]);
  return fn;
}, "useTranslate");
var useGetLocale = /* @__PURE__ */ __name(() => {
  const { i18nProvider } = dashboard__loadShare__react__loadShare__.useContext(I18nContext);
  return dashboard__loadShare__react__loadShare__.useCallback(() => i18nProvider == null ? void 0 : i18nProvider.getLocale(), []);
}, "useGetLocale");

// src/hooks/i18n/useTranslation.tsx
var useTranslation = /* @__PURE__ */ __name(() => {
  const translate = useTranslate();
  const changeLocale = useSetLocale();
  const getLocale = useGetLocale();
  return {
    translate,
    changeLocale,
    getLocale
  };
}, "useTranslation");
var useExport = /* @__PURE__ */ __name(({
  resourceName,
  resource: resourceFromProps,
  sorter,
  sorters,
  filters,
  maxItemCount,
  pageSize = 20,
  mapData = /* @__PURE__ */ __name((item) => item, "mapData"),
  exportOptions,
  unparseConfig,
  meta,
  metaData,
  dataProviderName,
  onError,
  download
} = {}) => {
  const [isLoading, setIsLoading] = dashboard__loadShare__react__loadShare__.useState(false);
  const dataProvider = useDataProvider();
  const getMeta = useMeta();
  const { resource, resources, identifier } = useResource(
    pickNotDeprecated(resourceFromProps, resourceName)
  );
  const getFriendlyName = useUserFriendlyName();
  const filename = `${getFriendlyName(
    identifier,
    "plural"
  )}-${(/* @__PURE__ */ new Date()).toLocaleString()}`;
  const { getList } = dataProvider(
    pickDataProvider(identifier, dataProviderName, resources)
  );
  const combinedMeta = getMeta({
    resource,
    meta: pickNotDeprecated(meta, metaData)
  });
  const triggerExport = /* @__PURE__ */ __name(async () => {
    setIsLoading(true);
    let rawData = [];
    let current = 1;
    let preparingData = true;
    while (preparingData) {
      try {
        const { data, total } = await getList({
          resource: (resource == null ? void 0 : resource.name) ?? "",
          filters,
          sort: pickNotDeprecated(sorters, sorter),
          sorters: pickNotDeprecated(sorters, sorter),
          pagination: {
            current,
            pageSize,
            mode: "server"
          },
          meta: combinedMeta,
          metaData: combinedMeta
        });
        current++;
        rawData.push(...data);
        if (maxItemCount && rawData.length >= maxItemCount) {
          rawData = rawData.slice(0, maxItemCount);
          preparingData = false;
        }
        if (total === rawData.length) {
          preparingData = false;
        }
      } catch (error) {
        setIsLoading(false);
        preparingData = false;
        onError == null ? void 0 : onError(error);
        return;
      }
    }
    const hasUnparseConfig = typeof unparseConfig !== "undefined" && unparseConfig !== null;
    warnOnce(
      hasUnparseConfig && typeof exportOptions !== "undefined" && exportOptions !== null,
      `[useExport]: resource: "${identifier}" 

Both \`unparseConfig\` and \`exportOptions\` are set, \`unparseConfig\` will take precedence`
    );
    const options = {
      filename,
      useKeysAsHeaders: true,
      useBom: true,
      // original default
      title: "My Generated Report",
      // original default
      quoteStrings: '"',
      // original default
      ...exportOptions
    };
    warnOnce(
      (exportOptions == null ? void 0 : exportOptions.decimalSeparator) !== void 0,
      `[useExport]: resource: "${identifier}" 

Use of \`decimalSeparator\` no longer supported, please use \`mapData\` instead.

See https://refine.dev/docs/api-reference/core/hooks/import-export/useExport/`
    );
    if (!hasUnparseConfig) {
      unparseConfig = {
        // useKeysAsHeaders takes priority over options.headers
        columns: options.useKeysAsHeaders ? void 0 : options.headers,
        delimiter: options.fieldSeparator,
        header: options.showLabels || options.useKeysAsHeaders,
        quoteChar: options.quoteStrings,
        quotes: true
      };
    } else {
      unparseConfig = {
        // Set to force quote for better compatibility
        quotes: true,
        ...unparseConfig
      };
    }
    let csv = papaparse_minExports.unparse(rawData.map(mapData), unparseConfig);
    if (options.showTitle) {
      csv = `${options.title}\r

${csv}`;
    }
    if (typeof window !== "undefined" && csv.length > 0 && (download ?? true)) {
      const fileExtension = options.useTextFile ? ".txt" : ".csv";
      const fileType = `text/${options.useTextFile ? "plain" : "csv"};charset=utf8;`;
      const downloadFilename = `${(options.filename ?? "download").replace(
        / /g,
        "_"
      )}${fileExtension}`;
      downloadInBrowser(
        downloadFilename,
        `${(options == null ? void 0 : options.useBom) ? "\uFEFF" : ""}${csv}`,
        fileType
      );
    }
    setIsLoading(false);
    return csv;
  }, "triggerExport");
  return {
    isLoading,
    triggerExport
  };
}, "useExport");
var useForm = /* @__PURE__ */ __name((props = {}) => {
  var _a, _b, _c;
  const getMeta = useMeta();
  const invalidate = useInvalidate();
  const { redirect: defaultRedirect } = useRefineOptions();
  const { mutationMode: defaultMutationMode } = useMutationMode();
  const { setWarnWhen } = useWarnAboutChange();
  const handleSubmitWithRedirect = useRedirectionAfterSubmission();
  const pickedMeta = pickNotDeprecated(props.meta, props.metaData);
  const mutationMode = props.mutationMode ?? defaultMutationMode;
  const {
    id,
    setId,
    resource,
    identifier,
    formAction: action
  } = useResourceParams({
    resource: props.resource,
    id: props.id,
    action: props.action
  });
  const [autosaved, setAutosaved] = React3.useState(false);
  const isEdit = action === "edit";
  const isClone = action === "clone";
  const isCreate = action === "create";
  const combinedMeta = getMeta({
    resource,
    meta: pickedMeta
  });
  const isIdRequired = (isEdit || isClone) && Boolean(props.resource);
  const isIdDefined = typeof props.id !== "undefined";
  const isQueryDisabled = ((_a = props.queryOptions) == null ? void 0 : _a.enabled) === false;
  warnOnce(
    isIdRequired && !isIdDefined && !isQueryDisabled,
    idWarningMessage(action, identifier, id)
  );
  const redirectAction = redirectPage({
    redirectFromProps: props.redirect,
    action,
    redirectOptions: defaultRedirect
  });
  const redirect = /* @__PURE__ */ __name((redirect2 = isEdit ? "list" : "edit", redirectId = id, routeParams = {}) => {
    handleSubmitWithRedirect({
      redirect: redirect2,
      resource,
      id: redirectId,
      meta: { ...pickedMeta, ...routeParams }
    });
  }, "redirect");
  const queryResult = useOne({
    resource: identifier,
    id,
    queryOptions: {
      // Only enable the query if it's not a create action and the `id` is defined
      enabled: !isCreate && id !== void 0,
      ...props.queryOptions
    },
    liveMode: props.liveMode,
    onLiveEvent: props.onLiveEvent,
    liveParams: props.liveParams,
    meta: { ...combinedMeta, ...props.queryMeta },
    dataProviderName: props.dataProviderName,
    overtimeOptions: { enabled: false }
  });
  const createMutation = useCreate({
    mutationOptions: props.createMutationOptions,
    overtimeOptions: { enabled: false }
  });
  const updateMutation = useUpdate({
    mutationOptions: props.updateMutationOptions,
    overtimeOptions: { enabled: false }
  });
  const mutationResult = isEdit ? updateMutation : createMutation;
  const isMutationLoading = mutationResult.isLoading;
  const formLoading = isMutationLoading || queryResult.isFetching;
  const { elapsedTime } = useLoadingOvertime({
    ...props.overtimeOptions,
    isLoading: formLoading
  });
  React3.useEffect(() => {
    return () => {
      var _a2;
      if (((_a2 = props.autoSave) == null ? void 0 : _a2.invalidateOnUnmount) && autosaved && identifier && typeof id !== "undefined") {
        invalidate({
          id,
          invalidates: props.invalidates || ["list", "many", "detail"],
          dataProviderName: props.dataProviderName,
          resource: identifier
        });
      }
    };
  }, [(_b = props.autoSave) == null ? void 0 : _b.invalidateOnUnmount, autosaved]);
  const onFinish = /* @__PURE__ */ __name(async (values, { isAutosave = false } = {}) => {
    const isPessimistic = mutationMode === "pessimistic";
    setWarnWhen(false);
    const onSuccessRedirect = /* @__PURE__ */ __name((id2) => redirect(redirectAction, id2), "onSuccessRedirect");
    const submissionPromise = new Promise((resolve, reject) => {
      if (!resource)
        return reject(missingResourceError5);
      if (isClone && !id)
        return reject(missingIdError3);
      if (!values)
        return reject(missingValuesError5);
      if (isAutosave && !isEdit)
        return reject(autosaveOnNonEditError);
      if (!isPessimistic && !isAutosave) {
        if (props.redirectOnSuccess !== false) {
          deferExecution(() => onSuccessRedirect());
        }
        resolve();
      }
      const variables = {
        values,
        resource: identifier ?? resource.name,
        meta: { ...combinedMeta, ...props.mutationMeta },
        metaData: { ...combinedMeta, ...props.mutationMeta },
        dataProviderName: props.dataProviderName,
        invalidates: isAutosave ? [] : props.invalidates,
        successNotification: isAutosave ? false : props.successNotification,
        errorNotification: isAutosave ? false : props.errorNotification,
        // Update specific variables
        ...isEdit ? {
          id: id ?? "",
          mutationMode,
          undoableTimeout: props.undoableTimeout,
          optimisticUpdateMap: props.optimisticUpdateMap
        } : {}
      };
      const { mutateAsync } = isEdit ? updateMutation : createMutation;
      mutateAsync(variables, {
        // Call user-defined `onMutationSuccess` and `onMutationError` callbacks if provided
        // These callbacks will not have an effect on the submission promise
        onSuccess: props.onMutationSuccess ? (data, _, context) => {
          var _a2;
          (_a2 = props.onMutationSuccess) == null ? void 0 : _a2.call(props, data, values, context, isAutosave);
        } : void 0,
        onError: props.onMutationError ? (error, _, context) => {
          var _a2;
          (_a2 = props.onMutationError) == null ? void 0 : _a2.call(props, error, values, context, isAutosave);
        } : void 0
      }).then((data) => {
        if (isPessimistic && !isAutosave && props.redirectOnSuccess !== false) {
          deferExecution(() => {
            var _a2;
            return onSuccessRedirect((_a2 = data == null ? void 0 : data.data) == null ? void 0 : _a2.id);
          });
        }
        if (isAutosave) {
          setAutosaved(true);
        }
        resolve(data);
      }).catch(reject);
    });
    return submissionPromise;
  }, "onFinish");
  const onFinishAutoSave = asyncDebounce(
    (values) => onFinish(values, { isAutosave: true }),
    ((_c = props.autoSave) == null ? void 0 : _c.debounce) || 1e3,
    "Cancelled by debounce"
  );
  const overtime = {
    elapsedTime
  };
  const autoSaveProps = {
    status: updateMutation.status,
    data: updateMutation.data,
    error: updateMutation.error
  };
  return {
    onFinish,
    onFinishAutoSave,
    formLoading,
    mutationResult,
    mutation: mutationResult,
    queryResult,
    query: queryResult,
    autoSaveProps,
    id,
    setId,
    redirect,
    overtime
  };
}, "useForm");
var missingResourceError5 = new Error(
  "[useForm]: `resource` is not defined or not matched but is required"
);
var missingIdError3 = new Error(
  "[useForm]: `id` is not defined but is required in edit and clone actions"
);
var missingValuesError5 = new Error(
  "[useForm]: `values` is not provided but is required"
);
var autosaveOnNonEditError = new Error(
  "[useForm]: `autoSave` is only allowed in edit action"
);
var idWarningMessage = /* @__PURE__ */ __name((action, identifier, id) => `[useForm]: action: "${action}", resource: "${identifier}", id: ${id}

If you don't use the \`setId\` method to set the \`id\`, you should pass the \`id\` prop to \`useForm\`. Otherwise, \`useForm\` will not be able to infer the \`id\` from the current URL with custom resource provided.

See https://refine.dev/docs/data/hooks/use-form/#id-`, "idWarningMessage");
var useRedirectionAfterSubmission = /* @__PURE__ */ __name(() => {
  const { show, edit, list, create } = useNavigation();
  const handleSubmitWithRedirect = dashboard__loadShare__react__loadShare__.useCallback(
    ({
      redirect,
      resource,
      id,
      meta = {}
    }) => {
      if (redirect && resource) {
        if (!!resource.show && redirect === "show" && id) {
          return show(resource, id, void 0, meta);
        }
        if (!!resource.edit && redirect === "edit" && id) {
          return edit(resource, id, void 0, meta);
        }
        if (!!resource.create && redirect === "create") {
          return create(resource, void 0, meta);
        }
        return list(resource, "push", meta);
      }
      return;
    },
    []
  );
  return handleSubmitWithRedirect;
}, "useRedirectionAfterSubmission");
var useBack = /* @__PURE__ */ __name(() => {
  const routerContext = dashboard__loadShare__react__loadShare__.useContext(RouterContext);
  const useBack2 = React3.useMemo(
    () => (routerContext == null ? void 0 : routerContext.back) ?? (() => () => void 0),
    [routerContext == null ? void 0 : routerContext.back]
  );
  const back = useBack2();
  return back;
}, "useBack");
var useGetToPath = /* @__PURE__ */ __name(() => {
  const routerType = useRouterType();
  const { resource: resourceFromRoute, resources } = useResource();
  const parsed = useParsed();
  const fn = React3.useCallback(
    ({ resource, action, meta }) => {
      var _a;
      const selectedResource = resource || resourceFromRoute;
      if (!selectedResource) {
        return void 0;
      }
      const actionRoutes = getActionRoutesFromResource(
        selectedResource,
        resources,
        routerType === "legacy"
      );
      const actionRoute = (_a = actionRoutes.find(
        (item) => item.action === action
      )) == null ? void 0 : _a.route;
      if (!actionRoute) {
        return void 0;
      }
      const composed = composeRoute(
        actionRoute,
        selectedResource == null ? void 0 : selectedResource.meta,
        parsed,
        meta
      );
      return composed;
    },
    [resources, resourceFromRoute, parsed]
  );
  return fn;
}, "useGetToPath");

// src/hooks/router/use-go/index.tsx
var useGo = /* @__PURE__ */ __name(() => {
  const routerContext = dashboard__loadShare__react__loadShare__.useContext(RouterContext);
  const { select: resourceSelect } = useResource();
  const getToPath = useGetToPath();
  const useGo2 = React3.useMemo(
    () => (routerContext == null ? void 0 : routerContext.go) ?? (() => () => void 0),
    [routerContext == null ? void 0 : routerContext.go]
  );
  const goFromRouter = useGo2();
  const go = dashboard__loadShare__react__loadShare__.useCallback(
    (config) => {
      if (typeof config.to !== "object") {
        return goFromRouter({ ...config, to: config.to });
      }
      const { resource } = resourceSelect(config.to.resource);
      handleResourceErrors(config.to, resource);
      const newTo = getToPath({
        resource,
        action: config.to.action,
        meta: {
          id: config.to.id,
          ...config.to.meta
        }
      });
      return goFromRouter({
        ...config,
        to: newTo
      });
    },
    [resourceSelect, goFromRouter]
  );
  return go;
}, "useGo");
var handleResourceErrors = /* @__PURE__ */ __name((to, resource) => {
  if (!(to == null ? void 0 : to.action) || !(to == null ? void 0 : to.resource)) {
    throw new Error(`[useGo]: "action" or "resource" is required.`);
  }
  if (["edit", "show", "clone"].includes(to == null ? void 0 : to.action) && !to.id) {
    throw new Error(
      `[useGo]: [action: ${to.action}] requires an "id" for resource [resource: ${to.resource}]`
    );
  }
  const actionUrl = resource[to.action];
  if (!actionUrl) {
    throw new Error(
      `[useGo]: [action: ${to.action}] is not defined for [resource: ${to.resource}]`
    );
  }
}, "handleResourceErrors");

// src/hooks/navigation/index.ts
var useNavigation = /* @__PURE__ */ __name(() => {
  const { resources } = useResource();
  const routerType = useRouterType();
  const { useHistory } = useRouterContext();
  const history = useHistory();
  const parsed = useParsed();
  const go = useGo();
  const back = useBack();
  const handleUrl = /* @__PURE__ */ __name((url, type = "push") => {
    if (routerType === "legacy") {
      history[type](url);
    } else {
      go({ to: url, type });
    }
  }, "handleUrl");
  const createUrl = /* @__PURE__ */ __name((resource, meta = {}) => {
    var _a;
    if (routerType === "legacy") {
      const resourceItem2 = typeof resource === "string" ? pickResource(resource, resources, true) ?? {
        name: resource,
        route: resource
      } : resource;
      const createActionRoute2 = getActionRoutesFromResource(
        resourceItem2,
        resources,
        true
      ).find((r) => r.action === "create");
      if (!createActionRoute2) {
        return "";
      }
      return composeRoute(
        createActionRoute2.route,
        resourceItem2 == null ? void 0 : resourceItem2.meta,
        parsed,
        meta
      );
    }
    const resourceItem = typeof resource === "string" ? pickResource(resource, resources) ?? { name: resource } : resource;
    const createActionRoute = (_a = getActionRoutesFromResource(
      resourceItem,
      resources
    ).find((r) => r.action === "create")) == null ? void 0 : _a.route;
    if (!createActionRoute) {
      return "";
    }
    return go({
      to: composeRoute(createActionRoute, resourceItem == null ? void 0 : resourceItem.meta, parsed, meta),
      type: "path",
      query: meta.query
    });
  }, "createUrl");
  const editUrl = /* @__PURE__ */ __name((resource, id, meta = {}) => {
    var _a;
    const encodedId = encodeURIComponent(id);
    if (routerType === "legacy") {
      const resourceItem2 = typeof resource === "string" ? pickResource(resource, resources, true) ?? {
        name: resource,
        route: resource
      } : resource;
      const editActionRoute2 = getActionRoutesFromResource(
        resourceItem2,
        resources,
        true
      ).find((r) => r.action === "edit");
      if (!editActionRoute2) {
        return "";
      }
      return composeRoute(editActionRoute2.route, resourceItem2 == null ? void 0 : resourceItem2.meta, parsed, {
        ...meta,
        id: encodedId
      });
    }
    const resourceItem = typeof resource === "string" ? pickResource(resource, resources) ?? { name: resource } : resource;
    const editActionRoute = (_a = getActionRoutesFromResource(
      resourceItem,
      resources
    ).find((r) => r.action === "edit")) == null ? void 0 : _a.route;
    if (!editActionRoute) {
      return "";
    }
    return go({
      to: composeRoute(editActionRoute, resourceItem == null ? void 0 : resourceItem.meta, parsed, {
        ...meta,
        id: encodedId
      }),
      type: "path",
      query: meta.query
    });
  }, "editUrl");
  const cloneUrl = /* @__PURE__ */ __name((resource, id, meta = {}) => {
    var _a;
    const encodedId = encodeURIComponent(id);
    if (routerType === "legacy") {
      const resourceItem2 = typeof resource === "string" ? pickResource(resource, resources, true) ?? {
        name: resource,
        route: resource
      } : resource;
      const cloneActionRoute2 = getActionRoutesFromResource(
        resourceItem2,
        resources,
        true
      ).find((r) => r.action === "clone");
      if (!cloneActionRoute2) {
        return "";
      }
      return composeRoute(cloneActionRoute2.route, resourceItem2 == null ? void 0 : resourceItem2.meta, parsed, {
        ...meta,
        id: encodedId
      });
    }
    const resourceItem = typeof resource === "string" ? pickResource(resource, resources) ?? { name: resource } : resource;
    const cloneActionRoute = (_a = getActionRoutesFromResource(
      resourceItem,
      resources
    ).find((r) => r.action === "clone")) == null ? void 0 : _a.route;
    if (!cloneActionRoute) {
      return "";
    }
    return go({
      to: composeRoute(cloneActionRoute, resourceItem == null ? void 0 : resourceItem.meta, parsed, {
        ...meta,
        id: encodedId
      }),
      type: "path",
      query: meta.query
    });
  }, "cloneUrl");
  const showUrl = /* @__PURE__ */ __name((resource, id, meta = {}) => {
    var _a;
    const encodedId = encodeURIComponent(id);
    if (routerType === "legacy") {
      const resourceItem2 = typeof resource === "string" ? pickResource(resource, resources, true) ?? {
        name: resource,
        route: resource
      } : resource;
      const showActionRoute2 = getActionRoutesFromResource(
        resourceItem2,
        resources,
        true
      ).find((r) => r.action === "show");
      if (!showActionRoute2) {
        return "";
      }
      return composeRoute(showActionRoute2.route, resourceItem2 == null ? void 0 : resourceItem2.meta, parsed, {
        ...meta,
        id: encodedId
      });
    }
    const resourceItem = typeof resource === "string" ? pickResource(resource, resources) ?? { name: resource } : resource;
    const showActionRoute = (_a = getActionRoutesFromResource(
      resourceItem,
      resources
    ).find((r) => r.action === "show")) == null ? void 0 : _a.route;
    if (!showActionRoute) {
      return "";
    }
    return go({
      to: composeRoute(showActionRoute, resourceItem == null ? void 0 : resourceItem.meta, parsed, {
        ...meta,
        id: encodedId
      }),
      type: "path",
      query: meta.query
    });
  }, "showUrl");
  const listUrl = /* @__PURE__ */ __name((resource, meta = {}) => {
    var _a;
    if (routerType === "legacy") {
      const resourceItem2 = typeof resource === "string" ? pickResource(resource, resources, true) ?? {
        name: resource,
        route: resource
      } : resource;
      const listActionRoute2 = getActionRoutesFromResource(
        resourceItem2,
        resources,
        true
      ).find((r) => r.action === "list");
      if (!listActionRoute2) {
        return "";
      }
      return composeRoute(
        listActionRoute2.route,
        resourceItem2 == null ? void 0 : resourceItem2.meta,
        parsed,
        meta
      );
    }
    const resourceItem = typeof resource === "string" ? pickResource(resource, resources) ?? { name: resource } : resource;
    const listActionRoute = (_a = getActionRoutesFromResource(
      resourceItem,
      resources
    ).find((r) => r.action === "list")) == null ? void 0 : _a.route;
    if (!listActionRoute) {
      return "";
    }
    return go({
      to: composeRoute(listActionRoute, resourceItem == null ? void 0 : resourceItem.meta, parsed, meta),
      type: "path",
      query: meta.query
    });
  }, "listUrl");
  const create = /* @__PURE__ */ __name((resource, type = "push", meta = {}) => {
    handleUrl(createUrl(resource, meta), type);
  }, "create");
  const edit = /* @__PURE__ */ __name((resource, id, type = "push", meta = {}) => {
    handleUrl(editUrl(resource, id, meta), type);
  }, "edit");
  const clone = /* @__PURE__ */ __name((resource, id, type = "push", meta = {}) => {
    handleUrl(cloneUrl(resource, id, meta), type);
  }, "clone");
  const show = /* @__PURE__ */ __name((resource, id, type = "push", meta = {}) => {
    handleUrl(showUrl(resource, id, meta), type);
  }, "show");
  const list = /* @__PURE__ */ __name((resource, type = "push", meta = {}) => {
    handleUrl(listUrl(resource, meta), type);
  }, "list");
  const push = /* @__PURE__ */ __name((path, ...rest) => {
    if (routerType === "legacy") {
      history.push(path, ...rest);
    } else {
      go({ to: path, type: "push" });
    }
  }, "push");
  const replace = /* @__PURE__ */ __name((path, ...rest) => {
    if (routerType === "legacy") {
      history.replace(path, ...rest);
    } else {
      go({ to: path, type: "replace" });
    }
  }, "replace");
  const goBack = /* @__PURE__ */ __name(() => {
    if (routerType === "legacy") {
      history.goBack();
    } else {
      back();
    }
  }, "goBack");
  return {
    create,
    createUrl,
    edit,
    editUrl,
    clone,
    cloneUrl,
    show,
    showUrl,
    list,
    listUrl,
    push,
    replace,
    goBack
  };
}, "useNavigation");
var useShow = /* @__PURE__ */ __name(({
  resource: resourceFromProp,
  id,
  meta,
  metaData,
  queryOptions,
  overtimeOptions,
  ...useOneProps
} = {}) => {
  const {
    resource,
    identifier,
    id: showId,
    setId: setShowId
  } = useResourceParams({
    id,
    resource: resourceFromProp
  });
  const getMeta = useMeta();
  const combinedMeta = getMeta({
    resource,
    meta: pickNotDeprecated(meta, metaData)
  });
  warnOnce(
    Boolean(resourceFromProp) && !showId,
    idWarningMessage2(identifier, showId)
  );
  const queryResult = useOne({
    resource: identifier,
    id: showId ?? "",
    queryOptions: {
      enabled: showId !== void 0,
      ...queryOptions
    },
    meta: combinedMeta,
    metaData: combinedMeta,
    overtimeOptions,
    ...useOneProps
  });
  return {
    queryResult,
    query: queryResult,
    showId,
    setShowId,
    overtime: queryResult.overtime
  };
}, "useShow");
var idWarningMessage2 = /* @__PURE__ */ __name((identifier, id) => `[useShow]: resource: "${identifier}", id: ${id} 

If you don't use the \`setShowId\` method to set the \`showId\`, you should pass the \`id\` prop to \`useShow\`. Otherwise, \`useShow\` will not be able to infer the \`id\` from the current URL. 

See https://refine.dev/docs/data/hooks/use-show/#resource`, "idWarningMessage");
var useImport = /* @__PURE__ */ __name(({
  resourceName,
  resource: resourceFromProps,
  mapData = /* @__PURE__ */ __name((item) => item, "mapData"),
  paparseOptions,
  batchSize = Number.MAX_SAFE_INTEGER,
  onFinish,
  meta,
  metaData,
  onProgress,
  dataProviderName
} = {}) => {
  const [processedAmount, setProcessedAmount] = dashboard__loadShare__react__loadShare__.useState(0);
  const [totalAmount, setTotalAmount] = dashboard__loadShare__react__loadShare__.useState(0);
  const [isLoading, setIsLoading] = dashboard__loadShare__react__loadShare__.useState(false);
  const { resource, identifier } = useResource(
    resourceFromProps ?? resourceName
  );
  const getMeta = useMeta();
  const createMany = useCreateMany();
  const create = useCreate();
  const combinedMeta = getMeta({
    resource,
    meta: pickNotDeprecated(meta, metaData)
  });
  let mutationResult;
  if (batchSize === 1) {
    mutationResult = create;
  } else {
    mutationResult = createMany;
  }
  const handleCleanup = /* @__PURE__ */ __name(() => {
    setTotalAmount(0);
    setProcessedAmount(0);
    setIsLoading(false);
  }, "handleCleanup");
  const handleFinish = /* @__PURE__ */ __name((createdValues) => {
    const result = {
      succeeded: createdValues.filter(
        (item) => item.type === "success"
      ),
      errored: createdValues.filter(
        (item) => item.type === "error"
      )
    };
    onFinish == null ? void 0 : onFinish(result);
    setIsLoading(false);
  }, "handleFinish");
  dashboard__loadShare__react__loadShare__.useEffect(() => {
    onProgress == null ? void 0 : onProgress({ totalAmount, processedAmount });
  }, [totalAmount, processedAmount]);
  const handleChange = /* @__PURE__ */ __name(({ file }) => {
    handleCleanup();
    return new Promise((resolve) => {
      setIsLoading(true);
      papaparse_minExports.parse(file, {
        complete: async ({ data }) => {
          const values = importCSVMapper(data, mapData);
          setTotalAmount(values.length);
          if (batchSize === 1) {
            const valueFns = values.map((value) => {
              const fn = /* @__PURE__ */ __name(async () => {
                const response = await create.mutateAsync({
                  resource: identifier ?? "",
                  values: value,
                  successNotification: false,
                  errorNotification: false,
                  dataProviderName,
                  meta: combinedMeta,
                  metaData: combinedMeta
                });
                return { response, value };
              }, "fn");
              return fn;
            });
            const createdValues = await sequentialPromises(
              valueFns,
              ({ response, value }) => {
                setProcessedAmount((currentAmount) => {
                  return currentAmount + 1;
                });
                return {
                  response: [response.data],
                  type: "success",
                  request: [value]
                };
              },
              (error, index) => {
                return {
                  response: [error],
                  type: "error",
                  request: [values[index]]
                };
              }
            );
            resolve(createdValues);
          } else {
            const chunks = chunk(values, batchSize);
            const chunkedFns = chunks.map((chunkedValues) => {
              const fn = /* @__PURE__ */ __name(async () => {
                const response = await createMany.mutateAsync({
                  resource: identifier ?? "",
                  values: chunkedValues,
                  successNotification: false,
                  errorNotification: false,
                  dataProviderName,
                  meta: combinedMeta,
                  metaData: combinedMeta
                });
                return {
                  response,
                  value: chunkedValues,
                  currentBatchLength: chunkedValues.length
                };
              }, "fn");
              return fn;
            });
            const createdValues = await sequentialPromises(
              chunkedFns,
              ({ response, currentBatchLength, value }) => {
                setProcessedAmount((currentAmount) => {
                  return currentAmount + currentBatchLength;
                });
                return {
                  response: response.data,
                  type: "success",
                  request: value
                };
              },
              (error, index) => {
                return {
                  response: [error],
                  type: "error",
                  request: chunks[index]
                };
              }
            );
            resolve(createdValues);
          }
        },
        ...paparseOptions
      });
    }).then((createdValues) => {
      handleFinish(createdValues);
      return createdValues;
    });
  }, "handleChange");
  return {
    inputProps: {
      type: "file",
      accept: ".csv",
      onChange: (event) => {
        if (event.target.files && event.target.files.length > 0) {
          handleChange({ file: event.target.files[0] });
        }
      }
    },
    mutationResult,
    isLoading,
    handleChange
  };
}, "useImport");
var useModal = /* @__PURE__ */ __name(({
  defaultVisible = false
} = {}) => {
  const [visible, setVisible] = dashboard__loadShare__react__loadShare__.useState(defaultVisible);
  const show = dashboard__loadShare__react__loadShare__.useCallback(() => setVisible(true), [visible]);
  const close = dashboard__loadShare__react__loadShare__.useCallback(() => setVisible(false), [visible]);
  return {
    visible,
    show,
    close
  };
}, "useModal");

// src/hooks/router/use-to-path/index.ts
var useToPath = /* @__PURE__ */ __name(({
  resource,
  action,
  meta,
  legacy
}) => {
  const getToPath = useGetToPath();
  return getToPath({ resource, action, meta, legacy });
}, "useToPath");
var LinkComponent = /* @__PURE__ */ __name((props, ref) => {
  const routerContext = dashboard__loadShare__react__loadShare__.useContext(RouterContext);
  const LinkFromContext = routerContext == null ? void 0 : routerContext.Link;
  const goFunction = useGo();
  let resolvedTo = "";
  if ("go" in props) {
    if (!(routerContext == null ? void 0 : routerContext.go)) {
      warnOnce(
        true,
        "[Link]: `routerProvider` is not found. To use `go`, Please make sure that you have provided the `routerProvider` for `<Refine />` https://refine.dev/docs/routing/router-provider/ \n"
      );
    }
    resolvedTo = goFunction({ ...props.go, type: "path" });
  }
  if ("to" in props) {
    resolvedTo = props.to;
  }
  if (LinkFromContext) {
    return /* @__PURE__ */ React3.createElement(
      LinkFromContext,
      {
        ref,
        ...props,
        to: resolvedTo,
        go: void 0
      }
    );
  }
  return /* @__PURE__ */ React3.createElement(
    "a",
    {
      ref,
      href: resolvedTo,
      ...props,
      to: void 0,
      go: void 0
    }
  );
}, "LinkComponent");
var Link = dashboard__loadShare__react__loadShare__.forwardRef(LinkComponent);

// src/hooks/router/use-link/index.tsx
var useLink = /* @__PURE__ */ __name(() => {
  return Link;
}, "useLink");
var defaultProvider = {
  useHistory: () => false,
  useLocation: () => false,
  useParams: () => ({}),
  Prompt: () => null,
  Link: () => null
};
var LegacyRouterContext = React3.createContext(defaultProvider);
var LegacyRouterContextProvider = /* @__PURE__ */ __name(({
  children,
  useHistory,
  useLocation,
  useParams,
  Prompt,
  Link: Link2,
  routes
}) => {
  return /* @__PURE__ */ React3.createElement(
    LegacyRouterContext.Provider,
    {
      value: {
        useHistory: useHistory ?? defaultProvider.useHistory,
        useLocation: useLocation ?? defaultProvider.useLocation,
        useParams: useParams ?? defaultProvider.useParams,
        Prompt: Prompt ?? defaultProvider.Prompt,
        Link: Link2 ?? defaultProvider.Link,
        routes: routes ?? defaultProvider.routes
      }
    },
    children
  );
}, "LegacyRouterContextProvider");

// src/hooks/legacy-router/useRouterContext.ts
var useRouterContext = /* @__PURE__ */ __name(() => {
  const routerContextValues = dashboard__loadShare__react__loadShare__.useContext(LegacyRouterContext);
  const { useHistory, useLocation, useParams, Prompt, Link: Link2, routes } = routerContextValues ?? defaultProvider;
  return {
    useHistory,
    useLocation,
    useParams,
    Prompt,
    Link: Link2,
    routes
  };
}, "useRouterContext");
var AccessControlContext = React3.createContext({
  options: {
    buttons: { enableAccessControl: true, hideIfUnauthorized: false }
  }
});
var AccessControlContextProvider = /* @__PURE__ */ __name(({ can, children, options }) => {
  return /* @__PURE__ */ React3.createElement(
    AccessControlContext.Provider,
    {
      value: {
        can,
        options: options ? {
          ...options,
          buttons: {
            enableAccessControl: true,
            hideIfUnauthorized: false,
            ...options.buttons
          }
        } : {
          buttons: {
            enableAccessControl: true,
            hideIfUnauthorized: false
          },
          queryOptions: void 0
        }
      }
    },
    children
  );
}, "AccessControlContextProvider");

// src/definitions/helpers/sanitize-resource/index.ts
var sanitizeResource = /* @__PURE__ */ __name((resource) => {
  if (!resource) {
    return void 0;
  }
  const {
    icon,
    list,
    edit,
    create,
    show,
    clone,
    children,
    meta,
    options,
    ...restResource
  } = resource;
  const { icon: _metaIcon, ...restMeta } = meta ?? {};
  const { icon: _optionsIcon, ...restOptions } = options ?? {};
  return {
    ...restResource,
    ...meta ? { meta: restMeta } : {},
    ...options ? { options: restOptions } : {}
  };
}, "sanitizeResource");

// src/hooks/accessControl/useCan/index.ts
var useCan = /* @__PURE__ */ __name(({
  action,
  resource,
  params,
  queryOptions: hookQueryOptions
}) => {
  const { can, options: globalOptions } = dashboard__loadShare__react__loadShare__.useContext(AccessControlContext);
  const { keys: keys2, preferLegacyKeys } = useKeys();
  const { queryOptions: globalQueryOptions } = globalOptions || {};
  const mergedQueryOptions = {
    ...globalQueryOptions,
    ...hookQueryOptions
  };
  const { resource: _resource, ...paramsRest } = params ?? {};
  const sanitizedResource = sanitizeResource(_resource);
  const queryResponse = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQuery({
    queryKey: keys2().access().resource(resource).action(action).params({
      params: { ...paramsRest, resource: sanitizedResource },
      enabled: mergedQueryOptions == null ? void 0 : mergedQueryOptions.enabled
    }).get(preferLegacyKeys),
    // Enabled check for `can` is enough to be sure that it's defined in the query function but TS is not smart enough to know that.
    queryFn: () => (can == null ? void 0 : can({
      action,
      resource,
      params: { ...paramsRest, resource: sanitizedResource }
    })) ?? Promise.resolve({ can: true }),
    enabled: typeof can !== "undefined",
    ...mergedQueryOptions,
    meta: {
      ...mergedQueryOptions == null ? void 0 : mergedQueryOptions.meta,
      ...k("useCan", preferLegacyKeys, resource, [
        "useButtonCanAccess",
        "useNavigationButton"
      ])
    },
    retry: false
  });
  return typeof can === "undefined" ? { data: { can: true } } : queryResponse;
}, "useCan");
var useCanWithoutCache = /* @__PURE__ */ __name(() => {
  const { can: canFromContext } = React3.useContext(AccessControlContext);
  const can = React3.useMemo(() => {
    if (!canFromContext) {
      return void 0;
    }
    const canWithSanitizedResource = /* @__PURE__ */ __name(async ({ params, ...rest }) => {
      const sanitizedResource = (params == null ? void 0 : params.resource) ? sanitizeResource(params.resource) : void 0;
      return canFromContext({
        ...rest,
        ...params ? {
          params: {
            ...params,
            resource: sanitizedResource
          }
        } : {}
      });
    }, "canWithSanitizedResource");
    return canWithSanitizedResource;
  }, [canFromContext]);
  return { can };
}, "useCanWithoutCache");
var useSelect = /* @__PURE__ */ __name((props) => {
  const [search, setSearch] = dashboard__loadShare__react__loadShare__.useState([]);
  const [options, setOptions] = dashboard__loadShare__react__loadShare__.useState([]);
  const [selectedOptions, setSelectedOptions] = dashboard__loadShare__react__loadShare__.useState([]);
  const {
    resource: resourceFromProps,
    sort,
    sorters,
    filters = [],
    optionLabel = "title",
    optionValue = "id",
    searchField = typeof optionLabel === "string" ? optionLabel : "title",
    debounce: debounceValue = 300,
    successNotification,
    errorNotification,
    defaultValueQueryOptions: defaultValueQueryOptionsFromProps,
    queryOptions,
    fetchSize,
    pagination,
    hasPagination = false,
    liveMode,
    defaultValue = [],
    selectedOptionsOrder = "in-place",
    onLiveEvent,
    onSearch: onSearchFromProp,
    liveParams,
    meta,
    metaData,
    dataProviderName,
    overtimeOptions
  } = props;
  const getOptionLabel = dashboard__loadShare__react__loadShare__.useCallback(
    (item) => {
      if (typeof optionLabel === "string") {
        return get(item, optionLabel);
      }
      return optionLabel(item);
    },
    [optionLabel]
  );
  const getOptionValue = dashboard__loadShare__react__loadShare__.useCallback(
    (item) => {
      if (typeof optionValue === "string") {
        return get(item, optionValue);
      }
      return optionValue(item);
    },
    [optionValue]
  );
  const { resource, identifier } = useResource(resourceFromProps);
  const getMeta = useMeta();
  const combinedMeta = getMeta({
    resource,
    meta: pickNotDeprecated(meta, metaData)
  });
  const defaultValues = Array.isArray(defaultValue) ? defaultValue : [defaultValue];
  const defaultValueQueryOnSuccess = dashboard__loadShare__react__loadShare__.useCallback(
    (data) => {
      setSelectedOptions(
        data.data.map(
          (item) => ({
            label: getOptionLabel(item),
            value: getOptionValue(item)
          })
        )
      );
    },
    [optionLabel, optionValue]
  );
  const defaultValueQueryOptions = defaultValueQueryOptionsFromProps ?? queryOptions;
  const defaultValueQueryResult = useMany({
    resource: identifier,
    ids: defaultValues,
    queryOptions: {
      ...defaultValueQueryOptions,
      enabled: defaultValues.length > 0 && ((defaultValueQueryOptions == null ? void 0 : defaultValueQueryOptions.enabled) ?? true),
      onSuccess: (data) => {
        var _a;
        defaultValueQueryOnSuccess(data);
        (_a = defaultValueQueryOptions == null ? void 0 : defaultValueQueryOptions.onSuccess) == null ? void 0 : _a.call(defaultValueQueryOptions, data);
      }
    },
    overtimeOptions: { enabled: false },
    meta: combinedMeta,
    metaData: combinedMeta,
    liveMode: "off",
    dataProviderName
  });
  const defaultQueryOnSuccess = dashboard__loadShare__react__loadShare__.useCallback(
    (data) => {
      setOptions(
        data.data.map(
          (item) => ({
            label: getOptionLabel(item),
            value: getOptionValue(item)
          })
        )
      );
    },
    [optionLabel, optionValue]
  );
  const queryResult = useList({
    resource: identifier,
    sorters: pickNotDeprecated(sorters, sort),
    filters: filters.concat(search),
    pagination: {
      current: pagination == null ? void 0 : pagination.current,
      pageSize: (pagination == null ? void 0 : pagination.pageSize) ?? fetchSize,
      mode: pagination == null ? void 0 : pagination.mode
    },
    hasPagination,
    queryOptions: {
      ...queryOptions,
      onSuccess: (data) => {
        var _a;
        defaultQueryOnSuccess(data);
        (_a = queryOptions == null ? void 0 : queryOptions.onSuccess) == null ? void 0 : _a.call(queryOptions, data);
      }
    },
    overtimeOptions: { enabled: false },
    successNotification,
    errorNotification,
    meta: combinedMeta,
    metaData: combinedMeta,
    liveMode,
    liveParams,
    onLiveEvent,
    dataProviderName
  });
  const { elapsedTime } = useLoadingOvertime({
    ...overtimeOptions,
    isLoading: queryResult.isFetching || defaultValueQueryResult.isFetching
  });
  const combinedOptions = dashboard__loadShare__react__loadShare__.useMemo(
    () => uniqBy(
      selectedOptionsOrder === "in-place" ? [...options, ...selectedOptions] : [...selectedOptions, ...options],
      "value"
    ),
    [options, selectedOptions]
  );
  const onSearchFromPropRef = dashboard__loadShare__react__loadShare__.useRef(onSearchFromProp);
  const onSearch = dashboard__loadShare__react__loadShare__.useMemo(() => {
    return debounce((value) => {
      if (onSearchFromPropRef.current) {
        setSearch(onSearchFromPropRef.current(value));
        return;
      }
      if (!value) {
        setSearch([]);
        return;
      }
      setSearch([
        {
          field: searchField,
          operator: "contains",
          value
        }
      ]);
    }, debounceValue);
  }, [searchField, debounceValue]);
  dashboard__loadShare__react__loadShare__.useEffect(() => {
    onSearchFromPropRef.current = onSearchFromProp;
  }, [onSearchFromProp]);
  return {
    queryResult,
    defaultValueQueryResult,
    query: queryResult,
    defaultValueQuery: defaultValueQueryResult,
    options: combinedOptions,
    onSearch,
    overtime: { elapsedTime }
  };
}, "useSelect");
var defaultPermanentFilter = [];
var defaultPermanentSorter = [];
function useTable({
  initialCurrent,
  initialPageSize,
  hasPagination = true,
  pagination,
  initialSorter,
  permanentSorter = defaultPermanentSorter,
  defaultSetFilterBehavior,
  initialFilter,
  permanentFilter = defaultPermanentFilter,
  filters: filtersFromProp,
  sorters: sortersFromProp,
  syncWithLocation: syncWithLocationProp,
  resource: resourceFromProp,
  successNotification,
  errorNotification,
  queryOptions,
  liveMode: liveModeFromProp,
  onLiveEvent,
  liveParams,
  meta,
  metaData,
  dataProviderName,
  overtimeOptions
} = {}) {
  var _a, _b, _c, _d, _e;
  const { syncWithLocation: syncWithLocationContext } = useSyncWithLocation();
  const syncWithLocation = syncWithLocationProp ?? syncWithLocationContext;
  const liveMode = useLiveMode(liveModeFromProp);
  const routerType = useRouterType();
  const { useLocation } = useRouterContext();
  const { search, pathname } = useLocation();
  const getMeta = useMeta();
  const parsedParams = useParsed();
  const isServerSideFilteringEnabled = ((filtersFromProp == null ? void 0 : filtersFromProp.mode) || "server") === "server";
  const isServerSideSortingEnabled = ((sortersFromProp == null ? void 0 : sortersFromProp.mode) || "server") === "server";
  const hasPaginationString = hasPagination === false ? "off" : "server";
  const isPaginationEnabled = ((pagination == null ? void 0 : pagination.mode) ?? hasPaginationString) !== "off";
  const prefferedCurrent = pickNotDeprecated(
    pagination == null ? void 0 : pagination.current,
    initialCurrent
  );
  const prefferedPageSize = pickNotDeprecated(
    pagination == null ? void 0 : pagination.pageSize,
    initialPageSize
  );
  const preferredMeta = pickNotDeprecated(meta, metaData);
  const { parsedCurrent, parsedPageSize, parsedSorter, parsedFilters } = parseTableParams(search ?? "?");
  const preferredInitialFilters = pickNotDeprecated(
    filtersFromProp == null ? void 0 : filtersFromProp.initial,
    initialFilter
  );
  const preferredPermanentFilters = pickNotDeprecated(filtersFromProp == null ? void 0 : filtersFromProp.permanent, permanentFilter) ?? defaultPermanentFilter;
  const preferredInitialSorters = pickNotDeprecated(
    sortersFromProp == null ? void 0 : sortersFromProp.initial,
    initialSorter
  );
  const preferredPermanentSorters = pickNotDeprecated(sortersFromProp == null ? void 0 : sortersFromProp.permanent, permanentSorter) ?? defaultPermanentSorter;
  const prefferedFilterBehavior = pickNotDeprecated(
    filtersFromProp == null ? void 0 : filtersFromProp.defaultBehavior,
    defaultSetFilterBehavior
  ) ?? "merge";
  let defaultCurrent;
  let defaultPageSize;
  let defaultSorter;
  let defaultFilter;
  if (syncWithLocation) {
    defaultCurrent = ((_a = parsedParams == null ? void 0 : parsedParams.params) == null ? void 0 : _a.current) || parsedCurrent || prefferedCurrent || 1;
    defaultPageSize = ((_b = parsedParams == null ? void 0 : parsedParams.params) == null ? void 0 : _b.pageSize) || parsedPageSize || prefferedPageSize || 10;
    defaultSorter = ((_c = parsedParams == null ? void 0 : parsedParams.params) == null ? void 0 : _c.sorters) || (parsedSorter.length ? parsedSorter : preferredInitialSorters);
    defaultFilter = ((_d = parsedParams == null ? void 0 : parsedParams.params) == null ? void 0 : _d.filters) || (parsedFilters.length ? parsedFilters : preferredInitialFilters);
  } else {
    defaultCurrent = prefferedCurrent || 1;
    defaultPageSize = prefferedPageSize || 10;
    defaultSorter = preferredInitialSorters;
    defaultFilter = preferredInitialFilters;
  }
  const { replace } = useNavigation();
  const go = useGo();
  const { resource, identifier } = useResource(resourceFromProp);
  const combinedMeta = getMeta({
    resource,
    meta: preferredMeta
  });
  React3.useEffect(() => {
    warnOnce(
      typeof identifier === "undefined",
      "useTable: `resource` is not defined."
    );
  }, [identifier]);
  const [sorters, setSorters] = dashboard__loadShare__react__loadShare__.useState(
    setInitialSorters(preferredPermanentSorters, defaultSorter ?? [])
  );
  const [filters, setFilters] = dashboard__loadShare__react__loadShare__.useState(
    setInitialFilters(preferredPermanentFilters, defaultFilter ?? [])
  );
  const [current, setCurrent] = dashboard__loadShare__react__loadShare__.useState(defaultCurrent);
  const [pageSize, setPageSize] = dashboard__loadShare__react__loadShare__.useState(defaultPageSize);
  const getCurrentQueryParams = /* @__PURE__ */ __name(() => {
    if (routerType === "new") {
      const { sorters: sorters2, filters: filters3, pageSize: pageSize3, current: current3, ...rest2 } = (parsedParams == null ? void 0 : parsedParams.params) ?? {};
      return rest2;
    }
    const { sorter, filters: filters2, pageSize: pageSize2, current: current2, ...rest } = parse(search, {
      ignoreQueryPrefix: true
    });
    return rest;
  }, "getCurrentQueryParams");
  const createLinkForSyncWithLocation = /* @__PURE__ */ __name(({
    pagination: { current: current2, pageSize: pageSize2 },
    sorter,
    filters: filters2
  }) => {
    if (routerType === "new") {
      return go({
        type: "path",
        options: {
          keepHash: true,
          keepQuery: true
        },
        query: {
          ...isPaginationEnabled ? { current: current2, pageSize: pageSize2 } : {},
          sorters: sorter,
          filters: filters2,
          ...getCurrentQueryParams()
        }
      }) ?? "";
    }
    const currentQueryParams = parse(search == null ? void 0 : search.substring(1));
    const stringifyParams = stringifyTableParams({
      pagination: {
        pageSize: pageSize2,
        current: current2
      },
      sorters: sorters ?? sorter,
      filters: filters2,
      ...currentQueryParams
    });
    return `${pathname ?? ""}?${stringifyParams ?? ""}`;
  }, "createLinkForSyncWithLocation");
  dashboard__loadShare__react__loadShare__.useEffect(() => {
    if (search === "") {
      setCurrent(defaultCurrent);
      setPageSize(defaultPageSize);
      setSorters(
        setInitialSorters(preferredPermanentSorters, defaultSorter ?? [])
      );
      setFilters(
        setInitialFilters(preferredPermanentFilters, defaultFilter ?? [])
      );
    }
  }, [search]);
  dashboard__loadShare__react__loadShare__.useEffect(() => {
    if (syncWithLocation) {
      const queryParams = getCurrentQueryParams();
      if (routerType === "new") {
        go({
          type: "replace",
          options: {
            keepQuery: true
          },
          query: {
            ...isPaginationEnabled ? { pageSize, current } : {},
            sorters: differenceWith(
              sorters,
              preferredPermanentSorters,
              isEqual
            ),
            filters: differenceWith(
              filters,
              preferredPermanentFilters,
              isEqual
            )
            // ...queryParams,
          }
        });
      } else {
        const stringifyParams = stringifyTableParams({
          ...isPaginationEnabled ? {
            pagination: {
              pageSize,
              current
            }
          } : {},
          sorters: differenceWith(sorters, preferredPermanentSorters, isEqual),
          filters: differenceWith(filters, preferredPermanentFilters, isEqual),
          ...queryParams
        });
        return replace == null ? void 0 : replace(`${pathname}?${stringifyParams}`, void 0, {
          shallow: true
        });
      }
    }
  }, [syncWithLocation, current, pageSize, sorters, filters]);
  const queryResult = useList({
    resource: identifier,
    hasPagination,
    pagination: { current, pageSize, mode: pagination == null ? void 0 : pagination.mode },
    filters: isServerSideFilteringEnabled ? unionFilters(preferredPermanentFilters, filters) : void 0,
    sorters: isServerSideSortingEnabled ? unionSorters(preferredPermanentSorters, sorters) : void 0,
    queryOptions,
    overtimeOptions,
    successNotification,
    errorNotification,
    meta: combinedMeta,
    metaData: combinedMeta,
    liveMode,
    liveParams,
    onLiveEvent,
    dataProviderName
  });
  const setFiltersAsMerge = dashboard__loadShare__react__loadShare__.useCallback(
    (newFilters) => {
      setFilters(
        (prevFilters) => unionFilters(preferredPermanentFilters, newFilters, prevFilters)
      );
    },
    [preferredPermanentFilters]
  );
  const setFiltersAsReplace = dashboard__loadShare__react__loadShare__.useCallback(
    (newFilters) => {
      setFilters(unionFilters(preferredPermanentFilters, newFilters));
    },
    [preferredPermanentFilters]
  );
  const setFiltersWithSetter = dashboard__loadShare__react__loadShare__.useCallback(
    (setter) => {
      setFilters(
        (prev) => unionFilters(preferredPermanentFilters, setter(prev))
      );
    },
    [preferredPermanentFilters]
  );
  const setFiltersFn = dashboard__loadShare__react__loadShare__.useCallback(
    (setterOrFilters, behavior = prefferedFilterBehavior) => {
      if (typeof setterOrFilters === "function") {
        setFiltersWithSetter(setterOrFilters);
      } else {
        if (behavior === "replace") {
          setFiltersAsReplace(setterOrFilters);
        } else {
          setFiltersAsMerge(setterOrFilters);
        }
      }
    },
    [setFiltersWithSetter, setFiltersAsReplace, setFiltersAsMerge]
  );
  const setSortWithUnion = dashboard__loadShare__react__loadShare__.useCallback(
    (newSorter) => {
      setSorters(() => unionSorters(preferredPermanentSorters, newSorter));
    },
    [preferredPermanentSorters]
  );
  return {
    tableQueryResult: queryResult,
    tableQuery: queryResult,
    sorters,
    setSorters: setSortWithUnion,
    sorter: sorters,
    setSorter: setSortWithUnion,
    filters,
    setFilters: setFiltersFn,
    current,
    setCurrent,
    pageSize,
    setPageSize,
    pageCount: pageSize ? Math.ceil((((_e = queryResult.data) == null ? void 0 : _e.total) ?? 0) / pageSize) : 1,
    createLinkForSyncWithLocation,
    overtime: queryResult.overtime
  };
}
__name(useTable, "useTable");
var AuditLogContext = React3.createContext({});
var AuditLogContextProvider = /* @__PURE__ */ __name(({ create, get: get2, update, children }) => {
  return /* @__PURE__ */ React3.createElement(AuditLogContext.Provider, { value: { create, get: get2, update } }, children);
}, "AuditLogContextProvider");

// src/hooks/auditLog/useLog/index.ts
var useLog = /* @__PURE__ */ __name(({
  logMutationOptions,
  renameMutationOptions
} = {}) => {
  const queryClient = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQueryClient();
  const auditLogContext = dashboard__loadShare__react__loadShare__.useContext(AuditLogContext);
  const { keys: keys2, preferLegacyKeys } = useKeys();
  const authProvider = useActiveAuthProvider();
  const { resources } = dashboard__loadShare__react__loadShare__.useContext(ResourceContext);
  const {
    data: identityData,
    refetch,
    isLoading
  } = useGetIdentity({
    v3LegacyAuthProviderCompatible: Boolean(authProvider == null ? void 0 : authProvider.isLegacy),
    queryOptions: {
      enabled: !!(auditLogContext == null ? void 0 : auditLogContext.create)
    }
  });
  const log = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation(
    async (params) => {
      var _a, _b, _c, _d, _e;
      const resource = pickResource(params.resource, resources);
      const logPermissions = pickNotDeprecated(
        (_a = resource == null ? void 0 : resource.meta) == null ? void 0 : _a.audit,
        (_b = resource == null ? void 0 : resource.options) == null ? void 0 : _b.audit,
        (_d = (_c = resource == null ? void 0 : resource.options) == null ? void 0 : _c.auditLog) == null ? void 0 : _d.permissions
      );
      if (logPermissions) {
        if (!hasPermission(logPermissions, params.action)) {
          return;
        }
      }
      let authorData;
      if (isLoading && !!(auditLogContext == null ? void 0 : auditLogContext.create)) {
        authorData = await refetch();
      }
      return await ((_e = auditLogContext.create) == null ? void 0 : _e.call(auditLogContext, {
        ...params,
        author: identityData ?? (authorData == null ? void 0 : authorData.data)
      }));
    },
    {
      mutationKey: keys2().audit().action("log").get(),
      ...logMutationOptions,
      meta: {
        ...logMutationOptions == null ? void 0 : logMutationOptions.meta,
        ...k("useLog", preferLegacyKeys)
      }
    }
  );
  const rename = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation(
    async (params) => {
      var _a;
      return await ((_a = auditLogContext.update) == null ? void 0 : _a.call(auditLogContext, params));
    },
    {
      onSuccess: (data) => {
        if (data == null ? void 0 : data.resource) {
          queryClient.invalidateQueries(
            keys2().audit().resource((data == null ? void 0 : data.resource) ?? "").action("list").get(preferLegacyKeys)
          );
        }
      },
      mutationKey: keys2().audit().action("rename").get(),
      ...renameMutationOptions,
      meta: {
        ...renameMutationOptions == null ? void 0 : renameMutationOptions.meta,
        ...k("useLog", preferLegacyKeys)
      }
    }
  );
  return { log, rename };
}, "useLog");
var useLogList = /* @__PURE__ */ __name(({
  resource,
  action,
  meta,
  author,
  metaData,
  queryOptions
}) => {
  const { get: get2 } = dashboard__loadShare__react__loadShare__.useContext(AuditLogContext);
  const { keys: keys2, preferLegacyKeys } = useKeys();
  const queryResponse = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQuery({
    queryKey: keys2().audit().resource(resource).action("list").params(meta).get(preferLegacyKeys),
    queryFn: () => (get2 == null ? void 0 : get2({
      resource,
      action,
      author,
      meta,
      metaData
    })) ?? Promise.resolve([]),
    enabled: typeof get2 !== "undefined",
    ...queryOptions,
    retry: false,
    meta: {
      ...queryOptions == null ? void 0 : queryOptions.meta,
      ...k("useLogList", preferLegacyKeys, resource)
    }
  });
  return queryResponse;
}, "useLogList");
var useBreadcrumb = /* @__PURE__ */ __name(({
  meta: metaFromProps = {}
} = {}) => {
  const routerType = useRouterType();
  const { i18nProvider } = dashboard__loadShare__react__loadShare__.useContext(I18nContext);
  const parsed = useParsed();
  const translate = useTranslate();
  const { resources, resource, action } = useResource();
  const {
    options: { textTransformers }
  } = useRefineContext();
  const breadcrumbs = [];
  if (!(resource == null ? void 0 : resource.name)) {
    return { breadcrumbs };
  }
  const addBreadcrumb = /* @__PURE__ */ __name((parentName) => {
    var _a, _b, _c, _d, _e, _f;
    const parentResource = typeof parentName === "string" ? pickResource(parentName, resources, routerType === "legacy") ?? {
      name: parentName
    } : parentName;
    if (parentResource) {
      const grandParentName = pickNotDeprecated(
        (_a = parentResource == null ? void 0 : parentResource.meta) == null ? void 0 : _a.parent,
        parentResource == null ? void 0 : parentResource.parentName
      );
      if (grandParentName) {
        addBreadcrumb(grandParentName);
      }
      const listActionOfResource = getActionRoutesFromResource(
        parentResource,
        resources,
        routerType === "legacy"
      ).find((r) => r.action === "list");
      const hrefRaw = ((_b = listActionOfResource == null ? void 0 : listActionOfResource.resource) == null ? void 0 : _b.list) ? listActionOfResource == null ? void 0 : listActionOfResource.route : void 0;
      const href = hrefRaw ? routerType === "legacy" ? hrefRaw : composeRoute(hrefRaw, parentResource == null ? void 0 : parentResource.meta, parsed, metaFromProps) : void 0;
      breadcrumbs.push({
        label: pickNotDeprecated(
          (_c = parentResource.meta) == null ? void 0 : _c.label,
          (_d = parentResource.options) == null ? void 0 : _d.label
        ) ?? translate(
          `${parentResource.name}.${parentResource.name}`,
          textTransformers.humanize(parentResource.name)
        ),
        href,
        icon: pickNotDeprecated(
          (_e = parentResource.meta) == null ? void 0 : _e.icon,
          (_f = parentResource.options) == null ? void 0 : _f.icon,
          parentResource.icon
        )
      });
    }
  }, "addBreadcrumb");
  addBreadcrumb(resource);
  if (action && action !== "list") {
    const key = `actions.${action}`;
    const actionLabel = translate(key);
    if (typeof i18nProvider !== "undefined" && actionLabel === key) {
      warnOnce(
        true,
        `[useBreadcrumb]: Breadcrumb missing translate key for the "${action}" action. Please add "actions.${action}" key to your translation file.
For more information, see https://refine.dev/docs/api-reference/core/hooks/useBreadcrumb/#i18n-support`
      );
      breadcrumbs.push({
        label: translate(
          `buttons.${action}`,
          textTransformers.humanize(action)
        )
      });
    } else {
      breadcrumbs.push({
        label: translate(key, textTransformers.humanize(action))
      });
    }
  }
  return {
    breadcrumbs
  };
}, "useBreadcrumb");

// src/definitions/helpers/menu/create-resource-key.ts
var createResourceKey = /* @__PURE__ */ __name((resource, resources, legacy = false) => {
  const parents = [];
  let currentParentResource = getParentResource(resource, resources);
  while (currentParentResource) {
    parents.push(currentParentResource);
    currentParentResource = getParentResource(currentParentResource, resources);
  }
  parents.reverse();
  const key = [...parents, resource].map(
    (r) => removeLeadingTrailingSlashes(
      (legacy ? r.route : void 0) ?? r.identifier ?? r.name
    )
  ).join("/");
  return `/${key.replace(/^\//, "")}`;
}, "createResourceKey");

// src/definitions/helpers/menu/create-tree.ts
var createTree = /* @__PURE__ */ __name((resources, legacy = false) => {
  const root = {
    item: {
      name: "__root__"
    },
    children: {}
  };
  resources.forEach((resource) => {
    const parents = [];
    let currentParent = getParentResource(resource, resources);
    while (currentParent) {
      parents.push(currentParent);
      currentParent = getParentResource(currentParent, resources);
    }
    parents.reverse();
    let currentTree = root;
    parents.forEach((parent) => {
      const key2 = (legacy ? parent.route : void 0) ?? parent.identifier ?? parent.name;
      if (!currentTree.children[key2]) {
        currentTree.children[key2] = {
          item: parent,
          children: {}
        };
      }
      currentTree = currentTree.children[key2];
    });
    const key = (legacy ? resource.route : void 0) ?? resource.identifier ?? resource.name;
    if (!currentTree.children[key]) {
      currentTree.children[key] = {
        item: resource,
        children: {}
      };
    }
  });
  const flatten = /* @__PURE__ */ __name((tree) => {
    const items = [];
    Object.keys(tree.children).forEach((key) => {
      const itemKey = createResourceKey(
        tree.children[key].item,
        resources,
        legacy
      );
      const item = {
        ...tree.children[key].item,
        key: itemKey,
        children: flatten(tree.children[key])
      };
      items.push(item);
    });
    return items;
  }, "flatten");
  return flatten(root);
}, "createTree");

// src/hooks/menu/useMenu.tsx
var getCleanPath = /* @__PURE__ */ __name((pathname) => {
  return pathname.split("?")[0].split("#")[0].replace(/(.+)(\/$)/, "$1");
}, "getCleanPath");
var useMenu = /* @__PURE__ */ __name(({ meta, hideOnMissingParameter = true } = {
  hideOnMissingParameter: true
}) => {
  const translate = useTranslate();
  const getToPath = useGetToPath();
  const routerType = useRouterType();
  const { resource, resources } = useResource();
  const { pathname } = useParsed();
  const { useLocation } = useRouterContext();
  const { pathname: legacyPath } = useLocation();
  const getFriendlyName = useUserFriendlyName();
  const cleanPathname = routerType === "legacy" ? getCleanPath(legacyPath) : pathname ? getCleanPath(pathname) : void 0;
  const cleanRoute = `/${(cleanPathname ?? "").replace(/^\//, "")}`;
  const selectedKey = resource ? createResourceKey(resource, resources, routerType === "legacy") : cleanRoute ?? "";
  const defaultOpenKeys = React3.useMemo(() => {
    if (!resource)
      return [];
    let parent = getParentResource(resource, resources);
    const keys2 = [createResourceKey(resource, resources)];
    while (parent) {
      keys2.push(createResourceKey(parent, resources));
      parent = getParentResource(parent, resources);
    }
    return keys2;
  }, []);
  const prepareItem = React3.useCallback(
    (item) => {
      var _a, _b, _c, _d, _e, _f;
      if (pickNotDeprecated((_a = item == null ? void 0 : item.meta) == null ? void 0 : _a.hide, (_b = item == null ? void 0 : item.options) == null ? void 0 : _b.hide)) {
        return void 0;
      }
      if (!(item == null ? void 0 : item.list) && item.children.length === 0)
        return void 0;
      const composed = item.list ? getToPath({
        resource: item,
        action: "list",
        legacy: routerType === "legacy",
        meta
      }) : void 0;
      if (hideOnMissingParameter && composed && composed.match(/(\/|^):(.+?)(\/|$){1}/))
        return void 0;
      return {
        ...item,
        route: composed,
        icon: pickNotDeprecated((_c = item.meta) == null ? void 0 : _c.icon, (_d = item.options) == null ? void 0 : _d.icon, item.icon),
        label: pickNotDeprecated((_e = item == null ? void 0 : item.meta) == null ? void 0 : _e.label, (_f = item == null ? void 0 : item.options) == null ? void 0 : _f.label) ?? translate(
          `${item.name}.${item.name}`,
          getFriendlyName(item.name, "plural")
        )
      };
    },
    [routerType, meta, getToPath, translate, hideOnMissingParameter]
  );
  const treeItems = React3.useMemo(() => {
    const treeMenuItems = createTree(resources, routerType === "legacy");
    const prepare = /* @__PURE__ */ __name((items) => {
      return items.flatMap((item) => {
        const preparedNodes = prepare(item.children);
        const newItem = prepareItem({
          ...item,
          children: preparedNodes
        });
        if (!newItem)
          return [];
        return [newItem];
      });
    }, "prepare");
    return prepare(treeMenuItems);
  }, [resources, routerType, prepareItem]);
  return {
    defaultOpenKeys,
    selectedKey,
    menuItems: treeItems
  };
}, "useMenu");
var MetaContext = dashboard__loadShare__react__loadShare__.createContext({});
var MetaContextProvider = /* @__PURE__ */ __name(({
  children,
  value
}) => {
  const currentValue = useMetaContext();
  const metaContext = dashboard__loadShare__react__loadShare__.useMemo(() => {
    return {
      ...currentValue,
      ...value
    };
  }, [currentValue, value]);
  return /* @__PURE__ */ React3.createElement(MetaContext.Provider, { value: metaContext }, children);
}, "MetaContextProvider");
var useMetaContext = /* @__PURE__ */ __name(() => {
  const context = dashboard__loadShare__react__loadShare__.useContext(MetaContext);
  if (!context) {
    throw new Error("useMetaContext must be used within a MetaContextProvider");
  }
  return dashboard__loadShare__react__loadShare__.useContext(MetaContext);
}, "useMetaContext");

// src/hooks/useMeta/index.ts
var useMeta = /* @__PURE__ */ __name(() => {
  const { params } = useParsed();
  const metaContext = useMetaContext();
  const getMetaFn = /* @__PURE__ */ __name(({
    resource,
    meta: metaFromProp
  } = {}) => {
    const { meta } = sanitizeResource(resource) ?? { meta: {} };
    const {
      filters: _filters,
      sorters: _sorters,
      current: _current,
      pageSize: _pageSize,
      ...additionalParams
    } = params ?? {};
    const result = {
      ...meta,
      ...additionalParams,
      ...metaFromProp
    };
    if (metaContext == null ? void 0 : metaContext.tenantId) {
      result["tenantId"] = metaContext.tenantId;
    }
    return result;
  }, "getMetaFn");
  return getMetaFn;
}, "useMeta");
var useRefineOptions = /* @__PURE__ */ __name(() => {
  const { options } = React3.useContext(RefineContext);
  return options;
}, "useRefineOptions");

// src/hooks/use-resource-params/use-id/index.tsx
var useId = /* @__PURE__ */ __name((id) => {
  const routerType = useRouterType();
  const { useParams } = useRouterContext();
  const parsed = useParsed();
  const legacyParams = useParams();
  const inferredId = routerType === "legacy" ? legacyParams.id : parsed.id;
  return id ?? inferredId;
}, "useId");

// src/hooks/use-resource-params/use-action/index.tsx
var useAction = /* @__PURE__ */ __name((action) => {
  const routerType = useRouterType();
  const { useParams } = useRouterContext();
  const parsed = useParsed();
  const legacyParams = useParams();
  const inferredAction = routerType === "legacy" ? legacyParams.action : parsed.action;
  return action ?? inferredAction;
}, "useAction");

// src/hooks/use-resource-params/index.ts
function useResourceParams(props) {
  const { select, identifier: inferredIdentifier } = useResource();
  const resourceToCheck = (props == null ? void 0 : props.resource) ?? inferredIdentifier;
  const { identifier = void 0, resource = void 0 } = resourceToCheck ? select(resourceToCheck, true) : {};
  const isSameResource = inferredIdentifier === identifier;
  const inferredId = useId();
  const action = useAction(props == null ? void 0 : props.action);
  const defaultId = React3.useMemo(() => {
    if (!isSameResource)
      return props == null ? void 0 : props.id;
    return (props == null ? void 0 : props.id) ?? inferredId;
  }, [isSameResource, props == null ? void 0 : props.id, inferredId]);
  const [id, setId] = React3.useState(defaultId);
  React3.useMemo(() => setId(defaultId), [defaultId]);
  const formAction = React3.useMemo(() => {
    if (!isSameResource && !(props == null ? void 0 : props.action)) {
      return "create";
    }
    if (action === "edit" || action === "clone") {
      return action;
    }
    return "create";
  }, [action, isSameResource, props == null ? void 0 : props.action]);
  return {
    id,
    setId,
    resource,
    action,
    identifier,
    formAction
  };
}
__name(useResourceParams, "useResourceParams");

// src/hooks/button/actionable-button/index.tsx
function useActionableButton({
  type
}) {
  const translate = useTranslate();
  const {
    textTransformers: { humanize }
  } = useRefineOptions();
  const key = `buttons.${type}`;
  const fallback = humanize(type);
  const label = translate(key, fallback);
  return { label };
}
__name(useActionableButton, "useActionableButton");
var useButtonCanAccess = /* @__PURE__ */ __name((props) => {
  var _a, _b, _c;
  const translate = useTranslate();
  const accessControlContext = React3.useContext(AccessControlContext);
  const accessControlEnabled = ((_a = props.accessControl) == null ? void 0 : _a.enabled) ?? accessControlContext.options.buttons.enableAccessControl;
  const hideIfUnauthorized = ((_b = props.accessControl) == null ? void 0 : _b.hideIfUnauthorized) ?? accessControlContext.options.buttons.hideIfUnauthorized;
  const { data: canAccess } = useCan({
    resource: (_c = props.resource) == null ? void 0 : _c.name,
    action: props.action === "clone" ? "create" : props.action,
    params: { meta: props.meta, id: props.id, resource: props.resource },
    queryOptions: {
      enabled: accessControlEnabled
    }
  });
  const title = React3.useMemo(() => {
    if (canAccess == null ? void 0 : canAccess.can)
      return "";
    if (canAccess == null ? void 0 : canAccess.reason)
      return canAccess.reason;
    return translate(
      "buttons.notAccessTitle",
      "You don't have permission to access"
    );
  }, [canAccess == null ? void 0 : canAccess.can, canAccess == null ? void 0 : canAccess.reason, translate]);
  const hidden = accessControlEnabled && hideIfUnauthorized && !(canAccess == null ? void 0 : canAccess.can);
  const disabled = (canAccess == null ? void 0 : canAccess.can) === false;
  return {
    title,
    hidden,
    disabled,
    canAccess
  };
}, "useButtonCanAccess");

// src/hooks/button/navigation-button/index.tsx
function useNavigationButton(props) {
  var _a;
  const navigation = useNavigation();
  const routerType = useRouterType();
  const Link2 = useLink();
  const { Link: LegacyLink } = useRouterContext();
  const translate = useTranslate();
  const getUserFriendlyName = useUserFriendlyName();
  const {
    textTransformers: { humanize }
  } = useRefineOptions();
  const { id, resource, identifier } = useResourceParams({
    resource: props.resource,
    id: props.action === "create" ? void 0 : props.id
  });
  const { canAccess, title, hidden, disabled } = useButtonCanAccess({
    action: props.action,
    accessControl: props.accessControl,
    meta: props.meta,
    id,
    resource
  });
  const LinkComponent2 = routerType === "legacy" ? LegacyLink : Link2;
  const to = React3.useMemo(() => {
    if (!resource)
      return "";
    switch (props.action) {
      case "create":
      case "list":
        return navigation[`${props.action}Url`](resource, props.meta);
      default:
        if (!id)
          return "";
        return navigation[`${props.action}Url`](resource, id, props.meta);
    }
  }, [resource, id, props.meta, navigation[`${props.action}Url`]]);
  const label = props.action === "list" ? translate(
    `${identifier ?? props.resource}.titles.list`,
    getUserFriendlyName(
      ((_a = resource == null ? void 0 : resource.meta) == null ? void 0 : _a.label) ?? (resource == null ? void 0 : resource.label) ?? identifier ?? props.resource,
      "plural"
    )
  ) : translate(`buttons.${props.action}`, humanize(props.action));
  return {
    to,
    label,
    title,
    disabled,
    hidden,
    canAccess,
    LinkComponent: LinkComponent2
  };
}
__name(useNavigationButton, "useNavigationButton");

// src/hooks/button/delete-button/index.tsx
function useDeleteButton(props) {
  const translate = useTranslate();
  const { mutate, isLoading, variables } = useDelete();
  const { setWarnWhen } = useWarnAboutChange();
  const { mutationMode } = useMutationMode(props.mutationMode);
  const { id, resource, identifier } = useResourceParams({
    resource: props.resource,
    id: props.id
  });
  const { title, disabled, hidden, canAccess } = useButtonCanAccess({
    action: "delete",
    accessControl: props.accessControl,
    id,
    resource
  });
  const label = translate("buttons.delete", "Delete");
  const confirmOkLabel = translate("buttons.delete", "Delete");
  const confirmTitle = translate("buttons.confirm", "Are you sure?");
  const cancelLabel = translate("buttons.cancel", "Cancel");
  const loading = id === (variables == null ? void 0 : variables.id) && isLoading;
  const onConfirm = /* @__PURE__ */ __name(() => {
    if (id && identifier) {
      setWarnWhen(false);
      mutate(
        {
          id,
          resource: identifier,
          mutationMode,
          successNotification: props.successNotification,
          errorNotification: props.errorNotification,
          meta: props.meta,
          metaData: props.meta,
          dataProviderName: props.dataProviderName,
          invalidates: props.invalidates
        },
        {
          onSuccess: props.onSuccess
        }
      );
    }
  }, "onConfirm");
  return {
    label,
    title,
    hidden,
    disabled,
    canAccess,
    loading,
    confirmOkLabel,
    cancelLabel,
    confirmTitle,
    onConfirm
  };
}
__name(useDeleteButton, "useDeleteButton");
function useRefreshButton(props) {
  const translate = useTranslate();
  const { keys: keys2, preferLegacyKeys } = useKeys();
  const queryClient = dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQueryClient();
  const invalidates = useInvalidate();
  const { identifier, id } = useResourceParams({
    resource: props.resource,
    id: props.id
  });
  const { resources } = useResource();
  const loading = !!queryClient.isFetching({
    queryKey: keys2().data(pickDataProvider(identifier, props.dataProviderName, resources)).resource(identifier).action("one").get(preferLegacyKeys)
  });
  const onClick = /* @__PURE__ */ __name(() => {
    invalidates({
      id,
      invalidates: ["detail"],
      dataProviderName: props.dataProviderName,
      resource: identifier
    });
  }, "onClick");
  const label = translate("buttons.refresh", "Refresh");
  return {
    onClick,
    label,
    loading
  };
}
__name(useRefreshButton, "useRefreshButton");

// src/hooks/button/index.tsx
var useShowButton = /* @__PURE__ */ __name((props) => useNavigationButton({ ...props, action: "show" }), "useShowButton");
var useEditButton = /* @__PURE__ */ __name((props) => useNavigationButton({ ...props, action: "edit" }), "useEditButton");
var useCloneButton = /* @__PURE__ */ __name((props) => useNavigationButton({ ...props, action: "clone" }), "useCloneButton");
var useCreateButton = /* @__PURE__ */ __name((props) => useNavigationButton({ ...props, action: "create" }), "useCreateButton");
var useListButton = /* @__PURE__ */ __name((props) => useNavigationButton({ ...props, action: "list" }), "useListButton");
var useSaveButton = /* @__PURE__ */ __name(() => useActionableButton({ type: "save" }), "useSaveButton");
var useExportButton = /* @__PURE__ */ __name(() => useActionableButton({ type: "export" }), "useExportButton");
var useImportButton = /* @__PURE__ */ __name(() => useActionableButton({ type: "import" }), "useImportButton");

// src/components/pages/error/index.tsx
var ErrorComponent = /* @__PURE__ */ __name(() => {
  const [errorMessage, setErrorMessage] = dashboard__loadShare__react__loadShare__.useState();
  const translate = useTranslate();
  const { push } = useNavigation();
  const go = useGo();
  const routerType = useRouterType();
  const { resource, action } = useResource();
  dashboard__loadShare__react__loadShare__.useEffect(() => {
    if (resource && action) {
      setErrorMessage(
        translate(
          "pages.error.info",
          {
            action,
            resource: resource.name
          },
          `You may have forgotten to add the "${action}" component to "${resource.name}" resource.`
        )
      );
    }
  }, [resource, action]);
  return /* @__PURE__ */ React3.createElement(React3.Fragment, null, /* @__PURE__ */ React3.createElement("h1", null, translate(
    "pages.error.404",
    void 0,
    "Sorry, the page you visited does not exist."
  )), errorMessage && /* @__PURE__ */ React3.createElement("p", null, errorMessage), /* @__PURE__ */ React3.createElement(
    "button",
    {
      onClick: () => {
        if (routerType === "legacy") {
          push("/");
        } else {
          go({ to: "/" });
        }
      }
    },
    translate("pages.error.backHome", void 0, "Back Home")
  ));
}, "ErrorComponent");
var LoginPage = /* @__PURE__ */ __name(() => {
  const [username, setUsername] = dashboard__loadShare__react__loadShare__.useState("");
  const [password, setPassword] = dashboard__loadShare__react__loadShare__.useState("");
  const translate = useTranslate();
  const authProvider = useActiveAuthProvider();
  const { mutate: login } = useLogin({
    v3LegacyAuthProviderCompatible: Boolean(authProvider == null ? void 0 : authProvider.isLegacy)
  });
  return /* @__PURE__ */ React3.createElement(React3.Fragment, null, /* @__PURE__ */ React3.createElement("h1", null, translate("pages.login.title", "Sign in your account")), /* @__PURE__ */ React3.createElement(
    "form",
    {
      onSubmit: (e) => {
        e.preventDefault();
        login({ username, password });
      }
    },
    /* @__PURE__ */ React3.createElement("table", null, /* @__PURE__ */ React3.createElement("tbody", null, /* @__PURE__ */ React3.createElement("tr", null, /* @__PURE__ */ React3.createElement("td", null, translate("pages.login.username", void 0, "username"), ":"), /* @__PURE__ */ React3.createElement("td", null, /* @__PURE__ */ React3.createElement(
      "input",
      {
        type: "text",
        size: 20,
        autoCorrect: "off",
        spellCheck: false,
        autoCapitalize: "off",
        autoFocus: true,
        required: true,
        value: username,
        onChange: (e) => setUsername(e.target.value)
      }
    ))), /* @__PURE__ */ React3.createElement("tr", null, /* @__PURE__ */ React3.createElement("td", null, translate("pages.login.password", void 0, "password"), ":"), /* @__PURE__ */ React3.createElement("td", null, /* @__PURE__ */ React3.createElement(
      "input",
      {
        type: "password",
        required: true,
        size: 20,
        value: password,
        onChange: (e) => setPassword(e.target.value)
      }
    ))))),
    /* @__PURE__ */ React3.createElement("br", null),
    /* @__PURE__ */ React3.createElement("input", { type: "submit", value: "login" })
  ));
}, "LoginPage");
var LoginPage2 = /* @__PURE__ */ __name(({
  providers,
  registerLink,
  forgotPasswordLink,
  rememberMe,
  contentProps,
  wrapperProps,
  renderContent,
  formProps,
  title = void 0,
  hideForm,
  mutationVariables
}) => {
  const routerType = useRouterType();
  const Link2 = useLink();
  const { Link: LegacyLink } = useRouterContext();
  const ActiveLink = routerType === "legacy" ? LegacyLink : Link2;
  const [email, setEmail] = dashboard__loadShare__react__loadShare__.useState("");
  const [password, setPassword] = dashboard__loadShare__react__loadShare__.useState("");
  const [remember, setRemember] = dashboard__loadShare__react__loadShare__.useState(false);
  const translate = useTranslate();
  const authProvider = useActiveAuthProvider();
  const { mutate: login } = useLogin({
    v3LegacyAuthProviderCompatible: Boolean(authProvider == null ? void 0 : authProvider.isLegacy)
  });
  const renderLink = /* @__PURE__ */ __name((link, text2) => {
    return /* @__PURE__ */ React3.createElement(ActiveLink, { to: link }, text2);
  }, "renderLink");
  const renderProviders = /* @__PURE__ */ __name(() => {
    if (providers) {
      return providers.map((provider) => /* @__PURE__ */ React3.createElement(
        "div",
        {
          key: provider.name,
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1rem"
          }
        },
        /* @__PURE__ */ React3.createElement(
          "button",
          {
            onClick: () => login({
              ...mutationVariables,
              providerName: provider.name
            }),
            style: {
              display: "flex",
              alignItems: "center"
            }
          },
          provider == null ? void 0 : provider.icon,
          provider.label ?? /* @__PURE__ */ React3.createElement("label", null, provider.label)
        )
      ));
    }
    return null;
  }, "renderProviders");
  const content = /* @__PURE__ */ React3.createElement("div", { ...contentProps }, /* @__PURE__ */ React3.createElement("h1", { style: { textAlign: "center" } }, translate("pages.login.title", "Sign in to your account")), renderProviders(), !hideForm && /* @__PURE__ */ React3.createElement(React3.Fragment, null, /* @__PURE__ */ React3.createElement("hr", null), /* @__PURE__ */ React3.createElement(
    "form",
    {
      onSubmit: (e) => {
        e.preventDefault();
        login({ ...mutationVariables, email, password, remember });
      },
      ...formProps
    },
    /* @__PURE__ */ React3.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          padding: 25
        }
      },
      /* @__PURE__ */ React3.createElement("label", { htmlFor: "email-input" }, translate("pages.login.fields.email", "Email")),
      /* @__PURE__ */ React3.createElement(
        "input",
        {
          id: "email-input",
          name: "email",
          type: "text",
          size: 20,
          autoCorrect: "off",
          spellCheck: false,
          autoCapitalize: "off",
          required: true,
          value: email,
          onChange: (e) => setEmail(e.target.value)
        }
      ),
      /* @__PURE__ */ React3.createElement("label", { htmlFor: "password-input" }, translate("pages.login.fields.password", "Password")),
      /* @__PURE__ */ React3.createElement(
        "input",
        {
          id: "password-input",
          type: "password",
          name: "password",
          required: true,
          size: 20,
          value: password,
          onChange: (e) => setPassword(e.target.value)
        }
      ),
      rememberMe ?? /* @__PURE__ */ React3.createElement(React3.Fragment, null, /* @__PURE__ */ React3.createElement("label", { htmlFor: "remember-me-input" }, translate("pages.login.buttons.rememberMe", "Remember me"), /* @__PURE__ */ React3.createElement(
        "input",
        {
          id: "remember-me-input",
          name: "remember",
          type: "checkbox",
          size: 20,
          checked: remember,
          value: remember.toString(),
          onChange: () => {
            setRemember(!remember);
          }
        }
      ))),
      /* @__PURE__ */ React3.createElement("br", null),
      forgotPasswordLink ?? renderLink(
        "/forgot-password",
        translate(
          "pages.login.buttons.forgotPassword",
          "Forgot password?"
        )
      ),
      /* @__PURE__ */ React3.createElement(
        "input",
        {
          type: "submit",
          value: translate("pages.login.signin", "Sign in")
        }
      ),
      registerLink ?? /* @__PURE__ */ React3.createElement("span", null, translate(
        "pages.login.buttons.noAccount",
        "Don\u2019t have an account?"
      ), " ", renderLink(
        "/register",
        translate("pages.login.register", "Sign up")
      ))
    )
  )), registerLink !== false && hideForm && /* @__PURE__ */ React3.createElement("div", { style: { textAlign: "center" } }, translate("pages.login.buttons.noAccount", "Don\u2019t have an account?"), " ", renderLink(
    "/register",
    translate("pages.login.register", "Sign up")
  )));
  return /* @__PURE__ */ React3.createElement("div", { ...wrapperProps }, renderContent ? renderContent(content, title) : content);
}, "LoginPage");
var RegisterPage = /* @__PURE__ */ __name(({
  providers,
  loginLink,
  wrapperProps,
  contentProps,
  renderContent,
  formProps,
  title = void 0,
  hideForm,
  mutationVariables
}) => {
  const routerType = useRouterType();
  const Link2 = useLink();
  const { Link: LegacyLink } = useRouterContext();
  const ActiveLink = routerType === "legacy" ? LegacyLink : Link2;
  const [email, setEmail] = dashboard__loadShare__react__loadShare__.useState("");
  const [password, setPassword] = dashboard__loadShare__react__loadShare__.useState("");
  const translate = useTranslate();
  const authProvider = useActiveAuthProvider();
  const { mutate: register, isLoading } = useRegister({
    v3LegacyAuthProviderCompatible: Boolean(authProvider == null ? void 0 : authProvider.isLegacy)
  });
  const renderLink = /* @__PURE__ */ __name((link, text2) => {
    return /* @__PURE__ */ React3.createElement(ActiveLink, { to: link }, text2);
  }, "renderLink");
  const renderProviders = /* @__PURE__ */ __name(() => {
    if (providers) {
      return providers.map((provider) => /* @__PURE__ */ React3.createElement(
        "div",
        {
          key: provider.name,
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1rem"
          }
        },
        /* @__PURE__ */ React3.createElement(
          "button",
          {
            onClick: () => register({
              ...mutationVariables,
              providerName: provider.name
            }),
            style: {
              display: "flex",
              alignItems: "center"
            }
          },
          provider == null ? void 0 : provider.icon,
          provider.label ?? /* @__PURE__ */ React3.createElement("label", null, provider.label)
        )
      ));
    }
    return null;
  }, "renderProviders");
  const content = /* @__PURE__ */ React3.createElement("div", { ...contentProps }, /* @__PURE__ */ React3.createElement("h1", { style: { textAlign: "center" } }, translate("pages.register.title", "Sign up for your account")), renderProviders(), !hideForm && /* @__PURE__ */ React3.createElement(React3.Fragment, null, /* @__PURE__ */ React3.createElement("hr", null), /* @__PURE__ */ React3.createElement(
    "form",
    {
      onSubmit: (e) => {
        e.preventDefault();
        register({ ...mutationVariables, email, password });
      },
      ...formProps
    },
    /* @__PURE__ */ React3.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          padding: 25
        }
      },
      /* @__PURE__ */ React3.createElement("label", { htmlFor: "email-input" }, translate("pages.register.fields.email", "Email")),
      /* @__PURE__ */ React3.createElement(
        "input",
        {
          id: "email-input",
          name: "email",
          type: "email",
          size: 20,
          autoCorrect: "off",
          spellCheck: false,
          autoCapitalize: "off",
          required: true,
          value: email,
          onChange: (e) => setEmail(e.target.value)
        }
      ),
      /* @__PURE__ */ React3.createElement("label", { htmlFor: "password-input" }, translate("pages.register.fields.password", "Password")),
      /* @__PURE__ */ React3.createElement(
        "input",
        {
          id: "password-input",
          name: "password",
          type: "password",
          required: true,
          size: 20,
          value: password,
          onChange: (e) => setPassword(e.target.value)
        }
      ),
      /* @__PURE__ */ React3.createElement(
        "input",
        {
          type: "submit",
          value: translate("pages.register.buttons.submit", "Sign up"),
          disabled: isLoading
        }
      ),
      loginLink ?? /* @__PURE__ */ React3.createElement(React3.Fragment, null, /* @__PURE__ */ React3.createElement("span", null, translate(
        "pages.login.buttons.haveAccount",
        "Have an account?"
      ), " ", renderLink(
        "/login",
        translate("pages.login.signin", "Sign in")
      )))
    )
  )), loginLink !== false && hideForm && /* @__PURE__ */ React3.createElement("div", { style: { textAlign: "center" } }, translate("pages.login.buttons.haveAccount", "Have an account?"), " ", renderLink("/login", translate("pages.login.signin", "Sign in"))));
  return /* @__PURE__ */ React3.createElement("div", { ...wrapperProps }, renderContent ? renderContent(content, title) : content);
}, "RegisterPage");
var ForgotPasswordPage = /* @__PURE__ */ __name(({
  loginLink,
  wrapperProps,
  contentProps,
  renderContent,
  formProps,
  title = void 0,
  mutationVariables
}) => {
  const translate = useTranslate();
  const routerType = useRouterType();
  const Link2 = useLink();
  const { Link: LegacyLink } = useRouterContext();
  const ActiveLink = routerType === "legacy" ? LegacyLink : Link2;
  const [email, setEmail] = dashboard__loadShare__react__loadShare__.useState("");
  const { mutate: forgotPassword, isLoading } = useForgotPassword();
  const renderLink = /* @__PURE__ */ __name((link, text2) => {
    return /* @__PURE__ */ React3.createElement(ActiveLink, { to: link }, text2);
  }, "renderLink");
  const content = /* @__PURE__ */ React3.createElement("div", { ...contentProps }, /* @__PURE__ */ React3.createElement("h1", { style: { textAlign: "center" } }, translate("pages.forgotPassword.title", "Forgot your password?")), /* @__PURE__ */ React3.createElement("hr", null), /* @__PURE__ */ React3.createElement(
    "form",
    {
      onSubmit: (e) => {
        e.preventDefault();
        forgotPassword({ ...mutationVariables, email });
      },
      ...formProps
    },
    /* @__PURE__ */ React3.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          padding: 25
        }
      },
      /* @__PURE__ */ React3.createElement("label", { htmlFor: "email-input" }, translate("pages.forgotPassword.fields.email", "Email")),
      /* @__PURE__ */ React3.createElement(
        "input",
        {
          id: "email-input",
          name: "email",
          type: "mail",
          autoCorrect: "off",
          spellCheck: false,
          autoCapitalize: "off",
          required: true,
          value: email,
          onChange: (e) => setEmail(e.target.value)
        }
      ),
      /* @__PURE__ */ React3.createElement(
        "input",
        {
          type: "submit",
          disabled: isLoading,
          value: translate(
            "pages.forgotPassword.buttons.submit",
            "Send reset instructions"
          )
        }
      ),
      /* @__PURE__ */ React3.createElement("br", null),
      loginLink ?? /* @__PURE__ */ React3.createElement("span", null, translate(
        "pages.register.buttons.haveAccount",
        "Have an account? "
      ), " ", renderLink("/login", translate("pages.login.signin", "Sign in")))
    )
  ));
  return /* @__PURE__ */ React3.createElement("div", { ...wrapperProps }, renderContent ? renderContent(content, title) : content);
}, "ForgotPasswordPage");
var UpdatePasswordPage = /* @__PURE__ */ __name(({
  wrapperProps,
  contentProps,
  renderContent,
  formProps,
  title = void 0,
  mutationVariables
}) => {
  const translate = useTranslate();
  const authProvider = useActiveAuthProvider();
  const { mutate: updatePassword, isLoading } = useUpdatePassword({
    v3LegacyAuthProviderCompatible: Boolean(authProvider == null ? void 0 : authProvider.isLegacy)
  });
  const [newPassword, setNewPassword] = dashboard__loadShare__react__loadShare__.useState("");
  const [confirmPassword, setConfirmPassword] = dashboard__loadShare__react__loadShare__.useState("");
  const content = /* @__PURE__ */ React3.createElement("div", { ...contentProps }, /* @__PURE__ */ React3.createElement("h1", { style: { textAlign: "center" } }, translate("pages.updatePassword.title", "Update Password")), /* @__PURE__ */ React3.createElement("hr", null), /* @__PURE__ */ React3.createElement(
    "form",
    {
      onSubmit: (e) => {
        e.preventDefault();
        updatePassword({
          ...mutationVariables,
          password: newPassword,
          confirmPassword
        });
      },
      ...formProps
    },
    /* @__PURE__ */ React3.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          padding: 25
        }
      },
      /* @__PURE__ */ React3.createElement("label", { htmlFor: "password-input" }, translate("pages.updatePassword.fields.password", "New Password")),
      /* @__PURE__ */ React3.createElement(
        "input",
        {
          id: "password-input",
          name: "password",
          type: "password",
          required: true,
          size: 20,
          value: newPassword,
          onChange: (e) => setNewPassword(e.target.value)
        }
      ),
      /* @__PURE__ */ React3.createElement("label", { htmlFor: "confirm-password-input" }, translate(
        "pages.updatePassword.fields.confirmPassword",
        "Confirm New Password"
      )),
      /* @__PURE__ */ React3.createElement(
        "input",
        {
          id: "confirm-password-input",
          name: "confirmPassword",
          type: "password",
          required: true,
          size: 20,
          value: confirmPassword,
          onChange: (e) => setConfirmPassword(e.target.value)
        }
      ),
      /* @__PURE__ */ React3.createElement(
        "input",
        {
          type: "submit",
          disabled: isLoading,
          value: translate("pages.updatePassword.buttons.submit", "Update")
        }
      )
    )
  ));
  return /* @__PURE__ */ React3.createElement("div", { ...wrapperProps }, renderContent ? renderContent(content, title) : content);
}, "UpdatePasswordPage");

// src/components/pages/auth/index.tsx
var AuthPage = /* @__PURE__ */ __name((props) => {
  const { type } = props;
  const renderView = /* @__PURE__ */ __name(() => {
    switch (type) {
      case "register":
        return /* @__PURE__ */ React3.createElement(RegisterPage, { ...props });
      case "forgotPassword":
        return /* @__PURE__ */ React3.createElement(ForgotPasswordPage, { ...props });
      case "updatePassword":
        return /* @__PURE__ */ React3.createElement(UpdatePasswordPage, { ...props });
      default:
        return /* @__PURE__ */ React3.createElement(LoginPage2, { ...props });
    }
  }, "renderView");
  return /* @__PURE__ */ React3.createElement(React3.Fragment, null, renderView());
}, "AuthPage");
var ReadyPage = /* @__PURE__ */ __name(() => {
  return /* @__PURE__ */ React3.createElement(React3.Fragment, null, /* @__PURE__ */ React3.createElement("h1", null, "Welcome on board"), /* @__PURE__ */ React3.createElement("p", null, "Your configuration is completed."), /* @__PURE__ */ React3.createElement("p", null, "Now you can get started by adding your resources to the", " ", /* @__PURE__ */ React3.createElement("code", null, "`resources`"), " property of ", /* @__PURE__ */ React3.createElement("code", null, "`<Refine>`")), /* @__PURE__ */ React3.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React3.createElement("a", { href: "https://refine.dev", target: "_blank", rel: "noreferrer" }, /* @__PURE__ */ React3.createElement("button", null, "Documentation")), /* @__PURE__ */ React3.createElement("a", { href: "https://refine.dev/examples", target: "_blank", rel: "noreferrer" }, /* @__PURE__ */ React3.createElement("button", null, "Examples")), /* @__PURE__ */ React3.createElement("a", { href: "https://discord.gg/refine", target: "_blank", rel: "noreferrer" }, /* @__PURE__ */ React3.createElement("button", null, "Community"))));
}, "ReadyPage");
var cards = [
  {
    title: "Documentation",
    description: "Learn about the technical details of using Refine in your projects.",
    link: "https://refine.dev/docs",
    iconUrl: "https://refine.ams3.cdn.digitaloceanspaces.com/welcome-page/book.svg"
  },
  {
    title: "Tutorial",
    description: "Learn how to use Refine by building a fully-functioning CRUD app, from scratch to full launch.",
    link: "https://refine.dev/tutorial",
    iconUrl: "https://refine.ams3.cdn.digitaloceanspaces.com/welcome-page/hat.svg"
  },
  {
    title: "Templates",
    description: "Explore a range of pre-built templates, perfect everything from admin panels to dashboards and CRMs.",
    link: "https://refine.dev/templates",
    iconUrl: "https://refine.ams3.cdn.digitaloceanspaces.com/welcome-page/application.svg"
  },
  {
    title: "Community",
    description: "Join our Discord community and keep up with the latest news.",
    link: "https://discord.gg/refine",
    iconUrl: "https://refine.ams3.cdn.digitaloceanspaces.com/welcome-page/discord.svg"
  }
];
var ConfigSuccessPage = /* @__PURE__ */ __name(() => {
  const isTablet = useMediaQuery("(max-width: 1010px)");
  const isMobile = useMediaQuery("(max-width: 650px)");
  const getGridTemplateColumns = /* @__PURE__ */ __name(() => {
    if (isMobile) {
      return "1, 280px";
    }
    if (isTablet) {
      return "2, 280px";
    }
    return "4, 1fr";
  }, "getGridTemplateColumns");
  const getHeaderFontSize = /* @__PURE__ */ __name(() => {
    if (isMobile) {
      return "32px";
    }
    if (isTablet) {
      return "40px";
    }
    return "48px";
  }, "getHeaderFontSize");
  const getSubHeaderFontSize = /* @__PURE__ */ __name(() => {
    if (isMobile) {
      return "16px";
    }
    if (isTablet) {
      return "20px";
    }
    return "24px";
  }, "getSubHeaderFontSize");
  return /* @__PURE__ */ React3.createElement(
    "div",
    {
      style: {
        position: "fixed",
        zIndex: 10,
        inset: 0,
        overflow: "auto",
        width: "100dvw",
        height: "100dvh"
      }
    },
    /* @__PURE__ */ React3.createElement(
      "div",
      {
        style: {
          overflow: "hidden",
          position: "relative",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          background: isMobile ? "url(https://refine.ams3.cdn.digitaloceanspaces.com/website/static/assets/landing-noise.webp), radial-gradient(88.89% 50% at 50% 100%, rgba(38, 217, 127, 0.10) 0%, rgba(38, 217, 127, 0.00) 100%), radial-gradient(88.89% 50% at 50% 0%, rgba(71, 235, 235, 0.15) 0%, rgba(71, 235, 235, 0.00) 100%), #1D1E30" : isTablet ? "url(https://refine.ams3.cdn.digitaloceanspaces.com/website/static/assets/landing-noise.webp), radial-gradient(66.67% 50% at 50% 100%, rgba(38, 217, 127, 0.10) 0%, rgba(38, 217, 127, 0.00) 100%), radial-gradient(66.67% 50% at 50% 0%, rgba(71, 235, 235, 0.15) 0%, rgba(71, 235, 235, 0.00) 100%), #1D1E30" : "url(https://refine.ams3.cdn.digitaloceanspaces.com/website/static/assets/landing-noise.webp), radial-gradient(35.56% 50% at 50% 100%, rgba(38, 217, 127, 0.12) 0%, rgba(38, 217, 127, 0) 100%), radial-gradient(35.56% 50% at 50% 0%, rgba(71, 235, 235, 0.18) 0%, rgba(71, 235, 235, 0) 100%), #1D1E30",
          minHeight: "100%",
          minWidth: "100%",
          fontFamily: "Arial",
          color: "#FFFFFF"
        }
      },
      /* @__PURE__ */ React3.createElement(
        "div",
        {
          style: {
            zIndex: 2,
            position: "absolute",
            width: isMobile ? "400px" : "800px",
            height: "552px",
            opacity: "0.5",
            background: "url(https://refine.ams3.cdn.digitaloceanspaces.com/assets/welcome-page-hexagon.png)",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            top: "0",
            left: "50%",
            transform: "translateX(-50%)"
          }
        }
      ),
      /* @__PURE__ */ React3.createElement("div", { style: { height: isMobile ? "40px" : "80px" } }),
      /* @__PURE__ */ React3.createElement("div", { style: { display: "flex", justifyContent: "center" } }, /* @__PURE__ */ React3.createElement(
        "div",
        {
          style: {
            backgroundRepeat: "no-repeat",
            backgroundSize: isMobile ? "112px 58px" : "224px 116px",
            backgroundImage: "url(https://refine.ams3.cdn.digitaloceanspaces.com/assets/refine-logo.svg)",
            width: isMobile ? 112 : 224,
            height: isMobile ? 58 : 116
          }
        }
      )),
      /* @__PURE__ */ React3.createElement(
        "div",
        {
          style: {
            height: isMobile ? "120px" : isTablet ? "200px" : "30vh",
            minHeight: isMobile ? "120px" : isTablet ? "200px" : "200px"
          }
        }
      ),
      /* @__PURE__ */ React3.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            textAlign: "center"
          }
        },
        /* @__PURE__ */ React3.createElement(
          "h1",
          {
            style: {
              fontSize: getHeaderFontSize(),
              fontWeight: 700,
              margin: "0px"
            }
          },
          "Welcome Aboard!"
        ),
        /* @__PURE__ */ React3.createElement(
          "h4",
          {
            style: {
              fontSize: getSubHeaderFontSize(),
              fontWeight: 400,
              margin: "0px"
            }
          },
          "Your configuration is completed."
        )
      ),
      /* @__PURE__ */ React3.createElement("div", { style: { height: "64px" } }),
      /* @__PURE__ */ React3.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: `repeat(${getGridTemplateColumns()})`,
            justifyContent: "center",
            gap: "48px",
            paddingRight: "16px",
            paddingLeft: "16px",
            paddingBottom: "32px",
            maxWidth: "976px",
            margin: "auto"
          }
        },
        cards.map((card) => /* @__PURE__ */ React3.createElement(Card, { key: `welcome-page-${card.title}`, card }))
      )
    )
  );
}, "ConfigSuccessPage");
var Card = /* @__PURE__ */ __name(({ card }) => {
  const { title, description, iconUrl, link } = card;
  const [isHover, setIsHover] = dashboard__loadShare__react__loadShare__.useState(false);
  return /* @__PURE__ */ React3.createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: "16px"
      }
    },
    /* @__PURE__ */ React3.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center"
        }
      },
      /* @__PURE__ */ React3.createElement(
        "a",
        {
          onPointerEnter: () => setIsHover(true),
          onPointerLeave: () => setIsHover(false),
          style: {
            display: "flex",
            alignItems: "center",
            color: "#fff",
            textDecoration: "none"
          },
          href: link
        },
        /* @__PURE__ */ React3.createElement(
          "div",
          {
            style: {
              width: "16px",
              height: "16px",
              backgroundPosition: "center",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundImage: `url(${iconUrl})`
            }
          }
        ),
        /* @__PURE__ */ React3.createElement(
          "span",
          {
            style: {
              fontSize: "16px",
              fontWeight: 700,
              marginLeft: "13px",
              marginRight: "14px"
            }
          },
          title
        ),
        /* @__PURE__ */ React3.createElement(
          "svg",
          {
            style: {
              transition: "transform 0.5s ease-in-out, opacity 0.2s ease-in-out",
              ...isHover && {
                transform: "translateX(4px)",
                opacity: 1
              }
            },
            width: "12",
            height: "8",
            fill: "none",
            opacity: "0.5",
            xmlns: "http://www.w3.org/2000/svg"
          },
          /* @__PURE__ */ React3.createElement(
            "path",
            {
              d: "M7.293.293a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1 0 1.414l-3 3a1 1 0 0 1-1.414-1.414L8.586 5H1a1 1 0 0 1 0-2h7.586L7.293 1.707a1 1 0 0 1 0-1.414Z",
              fill: "#fff"
            }
          )
        )
      )
    ),
    /* @__PURE__ */ React3.createElement(
      "span",
      {
        style: {
          fontSize: "12px",
          opacity: 0.5,
          lineHeight: "16px"
        }
      },
      description
    )
  );
}, "Card");
var ConfigErrorPage = /* @__PURE__ */ __name(() => {
  return /* @__PURE__ */ React3.createElement(
    "div",
    {
      style: {
        position: "fixed",
        zIndex: 11,
        inset: 0,
        overflow: "auto",
        width: "100dvw",
        height: "100dvh"
      }
    },
    /* @__PURE__ */ React3.createElement(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "24px",
          background: "#14141FBF",
          backdropFilter: "blur(3px)"
        }
      },
      /* @__PURE__ */ React3.createElement(
        "div",
        {
          style: {
            maxWidth: "640px",
            width: "100%",
            background: "#1D1E30",
            borderRadius: "16px",
            border: "1px solid #303450",
            boxShadow: "0px 0px 120px -24px #000000"
          }
        },
        /* @__PURE__ */ React3.createElement(
          "div",
          {
            style: {
              padding: "16px 20px",
              borderBottom: "1px solid #303450",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              position: "relative"
            }
          },
          /* @__PURE__ */ React3.createElement(
            ErrorGradient,
            {
              style: {
                position: "absolute",
                left: 0,
                top: 0
              }
            }
          ),
          /* @__PURE__ */ React3.createElement(
            "div",
            {
              style: {
                lineHeight: "24px",
                fontSize: "16px",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                gap: "16px"
              }
            },
            /* @__PURE__ */ React3.createElement(ErrorIcon, null),
            /* @__PURE__ */ React3.createElement(
              "span",
              {
                style: {
                  fontWeight: 400
                }
              },
              "Configuration Error"
            )
          )
        ),
        /* @__PURE__ */ React3.createElement(
          "div",
          {
            style: {
              padding: "20px",
              color: "#A3ADC2",
              lineHeight: "20px",
              fontSize: "14px",
              display: "flex",
              flexDirection: "column",
              gap: "20px"
            }
          },
          /* @__PURE__ */ React3.createElement(
            "p",
            {
              style: {
                margin: 0,
                padding: 0,
                lineHeight: "28px",
                fontSize: "16px"
              }
            },
            /* @__PURE__ */ React3.createElement(
              "code",
              {
                style: {
                  display: "inline-block",
                  background: "#30345080",
                  padding: "0 4px",
                  lineHeight: "24px",
                  fontSize: "16px",
                  borderRadius: "4px",
                  color: "#FFFFFF"
                }
              },
              "<Refine />"
            ),
            " ",
            "is not initialized. Please make sure you have it mounted in your app and placed your components inside it."
          ),
          /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement(ExampleImplementation, null))
        )
      )
    )
  );
}, "ConfigErrorPage");
var ExampleImplementation = /* @__PURE__ */ __name(() => {
  return /* @__PURE__ */ React3.createElement(
    "pre",
    {
      style: {
        display: "block",
        overflowX: "auto",
        borderRadius: "8px",
        fontSize: "14px",
        lineHeight: "24px",
        backgroundColor: "#14141F",
        color: "#E5ECF2",
        padding: "16px",
        margin: "0",
        maxHeight: "400px",
        overflow: "auto"
      }
    },
    /* @__PURE__ */ React3.createElement("span", { style: { color: "#FF7B72" } }, "import"),
    " ",
    "{",
    " Refine, WelcomePage",
    " ",
    "}",
    " ",
    /* @__PURE__ */ React3.createElement("span", { style: { color: "#FF7B72" } }, "from"),
    " ",
    /* @__PURE__ */ React3.createElement("span", { style: { color: "#A5D6FF" } }, '"@refinedev/core"'),
    ";",
    "\n",
    "\n",
    /* @__PURE__ */ React3.createElement("span", { style: { color: "#FF7B72" } }, "export"),
    " ",
    /* @__PURE__ */ React3.createElement("span", { style: { color: "#FF7B72" } }, "default"),
    " ",
    /* @__PURE__ */ React3.createElement("span", null, /* @__PURE__ */ React3.createElement("span", { style: { color: "#FF7B72" } }, "function"), " ", /* @__PURE__ */ React3.createElement("span", { style: { color: "#FFA657" } }, "App"), "(", /* @__PURE__ */ React3.createElement("span", { style: { color: "rgb(222, 147, 95)" } }), ")", " "),
    "{",
    "\n",
    "  ",
    /* @__PURE__ */ React3.createElement("span", { style: { color: "#FF7B72" } }, "return"),
    " (",
    "\n",
    "    ",
    /* @__PURE__ */ React3.createElement("span", null, /* @__PURE__ */ React3.createElement("span", { style: { color: "#79C0FF" } }, "<", /* @__PURE__ */ React3.createElement("span", { style: { color: "#79C0FF" } }, "Refine"), "\n", "      ", /* @__PURE__ */ React3.createElement("span", { style: { color: "#E5ECF2", opacity: 0.6 } }, "// ", /* @__PURE__ */ React3.createElement("span", null, "...")), "\n", "    ", ">"), "\n", "      ", /* @__PURE__ */ React3.createElement("span", { style: { opacity: 0.6 } }, "{", "/* ... */", "}"), "\n", "      ", /* @__PURE__ */ React3.createElement("span", { style: { color: "#79C0FF" } }, "<", /* @__PURE__ */ React3.createElement("span", { style: { color: "#79C0FF" } }, "WelcomePage"), " />"), "\n", "      ", /* @__PURE__ */ React3.createElement("span", { style: { opacity: 0.6 } }, "{", "/* ... */", "}"), "\n", "    ", /* @__PURE__ */ React3.createElement("span", { style: { color: "#79C0FF" } }, "</", /* @__PURE__ */ React3.createElement("span", { style: { color: "#79C0FF" } }, "Refine"), ">")),
    "\n",
    "  ",
    ");",
    "\n",
    "}"
  );
}, "ExampleImplementation");
var ErrorGradient = /* @__PURE__ */ __name((props) => /* @__PURE__ */ React3.createElement(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    width: 204,
    height: 56,
    viewBox: "0 0 204 56",
    fill: "none",
    ...props
  },
  /* @__PURE__ */ React3.createElement("path", { fill: "url(#welcome-page-error-gradient-a)", d: "M12 0H0v12L12 0Z" }),
  /* @__PURE__ */ React3.createElement(
    "path",
    {
      fill: "url(#welcome-page-error-gradient-b)",
      d: "M28 0h-8L0 20v8L28 0Z"
    }
  ),
  /* @__PURE__ */ React3.createElement(
    "path",
    {
      fill: "url(#welcome-page-error-gradient-c)",
      d: "M36 0h8L0 44v-8L36 0Z"
    }
  ),
  /* @__PURE__ */ React3.createElement(
    "path",
    {
      fill: "url(#welcome-page-error-gradient-d)",
      d: "M60 0h-8L0 52v4h4L60 0Z"
    }
  ),
  /* @__PURE__ */ React3.createElement(
    "path",
    {
      fill: "url(#welcome-page-error-gradient-e)",
      d: "M68 0h8L20 56h-8L68 0Z"
    }
  ),
  /* @__PURE__ */ React3.createElement(
    "path",
    {
      fill: "url(#welcome-page-error-gradient-f)",
      d: "M92 0h-8L28 56h8L92 0Z"
    }
  ),
  /* @__PURE__ */ React3.createElement(
    "path",
    {
      fill: "url(#welcome-page-error-gradient-g)",
      d: "M100 0h8L52 56h-8l56-56Z"
    }
  ),
  /* @__PURE__ */ React3.createElement(
    "path",
    {
      fill: "url(#welcome-page-error-gradient-h)",
      d: "M124 0h-8L60 56h8l56-56Z"
    }
  ),
  /* @__PURE__ */ React3.createElement(
    "path",
    {
      fill: "url(#welcome-page-error-gradient-i)",
      d: "M140 0h-8L76 56h8l56-56Z"
    }
  ),
  /* @__PURE__ */ React3.createElement(
    "path",
    {
      fill: "url(#welcome-page-error-gradient-j)",
      d: "M132 0h8L84 56h-8l56-56Z"
    }
  ),
  /* @__PURE__ */ React3.createElement(
    "path",
    {
      fill: "url(#welcome-page-error-gradient-k)",
      d: "M156 0h-8L92 56h8l56-56Z"
    }
  ),
  /* @__PURE__ */ React3.createElement(
    "path",
    {
      fill: "url(#welcome-page-error-gradient-l)",
      d: "M164 0h8l-56 56h-8l56-56Z"
    }
  ),
  /* @__PURE__ */ React3.createElement(
    "path",
    {
      fill: "url(#welcome-page-error-gradient-m)",
      d: "M188 0h-8l-56 56h8l56-56Z"
    }
  ),
  /* @__PURE__ */ React3.createElement(
    "path",
    {
      fill: "url(#welcome-page-error-gradient-n)",
      d: "M204 0h-8l-56 56h8l56-56Z"
    }
  ),
  /* @__PURE__ */ React3.createElement("defs", null, /* @__PURE__ */ React3.createElement(
    "radialGradient",
    {
      id: "welcome-page-error-gradient-a",
      cx: 0,
      cy: 0,
      r: 1,
      gradientTransform: "scale(124)",
      gradientUnits: "userSpaceOnUse"
    },
    /* @__PURE__ */ React3.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }),
    /* @__PURE__ */ React3.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })
  ), /* @__PURE__ */ React3.createElement(
    "radialGradient",
    {
      id: "welcome-page-error-gradient-b",
      cx: 0,
      cy: 0,
      r: 1,
      gradientTransform: "scale(124)",
      gradientUnits: "userSpaceOnUse"
    },
    /* @__PURE__ */ React3.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }),
    /* @__PURE__ */ React3.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })
  ), /* @__PURE__ */ React3.createElement(
    "radialGradient",
    {
      id: "welcome-page-error-gradient-c",
      cx: 0,
      cy: 0,
      r: 1,
      gradientTransform: "scale(124)",
      gradientUnits: "userSpaceOnUse"
    },
    /* @__PURE__ */ React3.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }),
    /* @__PURE__ */ React3.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })
  ), /* @__PURE__ */ React3.createElement(
    "radialGradient",
    {
      id: "welcome-page-error-gradient-d",
      cx: 0,
      cy: 0,
      r: 1,
      gradientTransform: "scale(124)",
      gradientUnits: "userSpaceOnUse"
    },
    /* @__PURE__ */ React3.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }),
    /* @__PURE__ */ React3.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })
  ), /* @__PURE__ */ React3.createElement(
    "radialGradient",
    {
      id: "welcome-page-error-gradient-e",
      cx: 0,
      cy: 0,
      r: 1,
      gradientTransform: "scale(124)",
      gradientUnits: "userSpaceOnUse"
    },
    /* @__PURE__ */ React3.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }),
    /* @__PURE__ */ React3.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })
  ), /* @__PURE__ */ React3.createElement(
    "radialGradient",
    {
      id: "welcome-page-error-gradient-f",
      cx: 0,
      cy: 0,
      r: 1,
      gradientTransform: "scale(124)",
      gradientUnits: "userSpaceOnUse"
    },
    /* @__PURE__ */ React3.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }),
    /* @__PURE__ */ React3.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })
  ), /* @__PURE__ */ React3.createElement(
    "radialGradient",
    {
      id: "welcome-page-error-gradient-g",
      cx: 0,
      cy: 0,
      r: 1,
      gradientTransform: "scale(124)",
      gradientUnits: "userSpaceOnUse"
    },
    /* @__PURE__ */ React3.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }),
    /* @__PURE__ */ React3.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })
  ), /* @__PURE__ */ React3.createElement(
    "radialGradient",
    {
      id: "welcome-page-error-gradient-h",
      cx: 0,
      cy: 0,
      r: 1,
      gradientTransform: "scale(124)",
      gradientUnits: "userSpaceOnUse"
    },
    /* @__PURE__ */ React3.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }),
    /* @__PURE__ */ React3.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })
  ), /* @__PURE__ */ React3.createElement(
    "radialGradient",
    {
      id: "welcome-page-error-gradient-i",
      cx: 0,
      cy: 0,
      r: 1,
      gradientTransform: "scale(124)",
      gradientUnits: "userSpaceOnUse"
    },
    /* @__PURE__ */ React3.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }),
    /* @__PURE__ */ React3.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })
  ), /* @__PURE__ */ React3.createElement(
    "radialGradient",
    {
      id: "welcome-page-error-gradient-j",
      cx: 0,
      cy: 0,
      r: 1,
      gradientTransform: "scale(124)",
      gradientUnits: "userSpaceOnUse"
    },
    /* @__PURE__ */ React3.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }),
    /* @__PURE__ */ React3.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })
  ), /* @__PURE__ */ React3.createElement(
    "radialGradient",
    {
      id: "welcome-page-error-gradient-k",
      cx: 0,
      cy: 0,
      r: 1,
      gradientTransform: "scale(124)",
      gradientUnits: "userSpaceOnUse"
    },
    /* @__PURE__ */ React3.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }),
    /* @__PURE__ */ React3.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })
  ), /* @__PURE__ */ React3.createElement(
    "radialGradient",
    {
      id: "welcome-page-error-gradient-l",
      cx: 0,
      cy: 0,
      r: 1,
      gradientTransform: "scale(124)",
      gradientUnits: "userSpaceOnUse"
    },
    /* @__PURE__ */ React3.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }),
    /* @__PURE__ */ React3.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })
  ), /* @__PURE__ */ React3.createElement(
    "radialGradient",
    {
      id: "welcome-page-error-gradient-m",
      cx: 0,
      cy: 0,
      r: 1,
      gradientTransform: "scale(124)",
      gradientUnits: "userSpaceOnUse"
    },
    /* @__PURE__ */ React3.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }),
    /* @__PURE__ */ React3.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })
  ), /* @__PURE__ */ React3.createElement(
    "radialGradient",
    {
      id: "welcome-page-error-gradient-n",
      cx: 0,
      cy: 0,
      r: 1,
      gradientTransform: "scale(124)",
      gradientUnits: "userSpaceOnUse"
    },
    /* @__PURE__ */ React3.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }),
    /* @__PURE__ */ React3.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })
  ))
), "ErrorGradient");
var ErrorIcon = /* @__PURE__ */ __name((props) => /* @__PURE__ */ React3.createElement(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    width: 16,
    height: 16,
    viewBox: "0 0 16 16",
    fill: "none",
    ...props
  },
  /* @__PURE__ */ React3.createElement(
    "path",
    {
      fill: "#FF4C4D",
      fillRule: "evenodd",
      d: "M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16Z",
      clipRule: "evenodd"
    }
  ),
  /* @__PURE__ */ React3.createElement(
    "path",
    {
      fill: "#fff",
      fillRule: "evenodd",
      d: "M7 8a1 1 0 1 0 2 0V5a1 1 0 1 0-2 0v3Zm0 3a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z",
      clipRule: "evenodd"
    }
  )
), "ErrorIcon");

// src/components/pages/welcome/index.tsx
var WelcomePage = /* @__PURE__ */ __name(() => {
  const { __initialized } = useRefineContext();
  return /* @__PURE__ */ React3.createElement(React3.Fragment, null, /* @__PURE__ */ React3.createElement(ConfigSuccessPage, null), !__initialized && /* @__PURE__ */ React3.createElement(ConfigErrorPage, null));
}, "WelcomePage");
var REFINE_VERSION = "4.57.10";
var useTelemetryData = /* @__PURE__ */ __name(() => {
  var _a;
  const auth = useIsExistAuthentication();
  const auditLogContext = dashboard__loadShare__react__loadShare__.useContext(AuditLogContext);
  const { liveProvider } = dashboard__loadShare__react__loadShare__.useContext(LiveContext);
  const routerContext = dashboard__loadShare__react__loadShare__.useContext(LegacyRouterContext);
  const dataContext = dashboard__loadShare__react__loadShare__.useContext(DataContext);
  const { i18nProvider } = dashboard__loadShare__react__loadShare__.useContext(I18nContext);
  const notificationContext = dashboard__loadShare__react__loadShare__.useContext(NotificationContext);
  const accessControlContext = dashboard__loadShare__react__loadShare__.useContext(AccessControlContext);
  const { resources } = useResource();
  const refineOptions = useRefineContext();
  const auditLog = !!auditLogContext.create || !!auditLogContext.get || !!auditLogContext.update;
  const live = !!(liveProvider == null ? void 0 : liveProvider.publish) || !!(liveProvider == null ? void 0 : liveProvider.subscribe) || !!(liveProvider == null ? void 0 : liveProvider.unsubscribe);
  const router = !!routerContext.useHistory || !!routerContext.Link || !!routerContext.Prompt || !!routerContext.useLocation || !!routerContext.useParams;
  const data = !!dataContext;
  const i18n = !!(i18nProvider == null ? void 0 : i18nProvider.changeLocale) || !!(i18nProvider == null ? void 0 : i18nProvider.getLocale) || !!(i18nProvider == null ? void 0 : i18nProvider.translate);
  const notification = !!notificationContext.close || !!notificationContext.open;
  const accessControl = !!accessControlContext.can;
  const projectId = (_a = refineOptions == null ? void 0 : refineOptions.options) == null ? void 0 : _a.projectId;
  return {
    providers: {
      auth,
      auditLog,
      live,
      router,
      data,
      i18n,
      notification,
      accessControl
    },
    version: REFINE_VERSION,
    resourceCount: resources.length,
    projectId
  };
}, "useTelemetryData");

// src/components/telemetry/index.tsx
var encode = /* @__PURE__ */ __name((payload) => {
  try {
    const stringifiedPayload = JSON.stringify(payload || {});
    if (typeof btoa !== "undefined") {
      return btoa(stringifiedPayload);
    }
    return Buffer.from(stringifiedPayload).toString("base64");
  } catch (err) {
    return void 0;
  }
}, "encode");
var throughImage = /* @__PURE__ */ __name((src) => {
  const img = new Image();
  img.src = src;
}, "throughImage");
var throughFetch = /* @__PURE__ */ __name((src) => {
  fetch(src);
}, "throughFetch");
var transport = /* @__PURE__ */ __name((src) => {
  if (typeof Image !== "undefined") {
    throughImage(src);
  } else if (typeof fetch !== "undefined") {
    throughFetch(src);
  }
}, "transport");
var Telemetry = /* @__PURE__ */ __name(() => {
  const payload = useTelemetryData();
  const sent = React3.useRef(false);
  React3.useEffect(() => {
    if (sent.current) {
      return;
    }
    const encoded = encode(payload);
    if (!encoded) {
      return;
    }
    transport(`https://telemetry.refine.dev/telemetry?payload=${encoded}`);
    sent.current = true;
  }, []);
  return null;
}, "Telemetry");

// src/definitions/helpers/check-router-prop-misuse/index.ts
var checkRouterPropMisuse = /* @__PURE__ */ __name((value) => {
  const bindings = ["go", "parse", "back", "Link"];
  const otherProps = Object.keys(value).filter(
    (key) => !bindings.includes(key)
  );
  const hasOtherProps = otherProps.length > 0;
  if (hasOtherProps) {
    console.warn(
      `Unsupported properties are found in \`routerProvider\` prop. You provided \`${otherProps.join(
        ", "
      )}\`. Supported properties are \`${bindings.join(
        ", "
      )}\`. You may wanted to use \`legacyRouterProvider\` prop instead.`
    );
    return true;
  }
  return false;
}, "checkRouterPropMisuse");
var useRouterMisuseWarning = /* @__PURE__ */ __name((value) => {
  const warned = React3.useRef(false);
  React3.useEffect(() => {
    if (warned.current === false) {
      if (value) {
        const warn = checkRouterPropMisuse(value);
        if (warn) {
          warned.current = true;
        }
      }
    }
  }, [value]);
}, "useRouterMisuseWarning");

// src/components/containers/refine/index.tsx
var Refine = /* @__PURE__ */ __name(({
  legacyAuthProvider,
  authProvider,
  dataProvider,
  legacyRouterProvider,
  routerProvider,
  notificationProvider,
  accessControlProvider,
  auditLogProvider,
  resources,
  DashboardPage,
  ReadyPage: ReadyPage2,
  LoginPage: LoginPage3,
  catchAll,
  children,
  liveProvider,
  i18nProvider,
  Title,
  Layout,
  Sider,
  Header,
  Footer,
  OffLayoutArea,
  onLiveEvent,
  options
}) => {
  const {
    optionsWithDefaults,
    disableTelemetryWithDefault,
    reactQueryWithDefaults
  } = handleRefineOptions({
    options
  });
  const queryClient = useDeepMemo(() => {
    var _a;
    if (reactQueryWithDefaults.clientConfig instanceof dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.QueryClient) {
      return reactQueryWithDefaults.clientConfig;
    }
    return new dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.QueryClient({
      ...reactQueryWithDefaults.clientConfig,
      defaultOptions: {
        ...reactQueryWithDefaults.clientConfig.defaultOptions,
        queries: {
          refetchOnWindowFocus: false,
          keepPreviousData: true,
          ...(_a = reactQueryWithDefaults.clientConfig.defaultOptions) == null ? void 0 : _a.queries
        }
      }
    });
  }, [reactQueryWithDefaults.clientConfig]);
  C(queryClient);
  const useNotificationProviderValues = React3.useMemo(() => {
    return typeof notificationProvider === "function" ? notificationProvider : () => notificationProvider;
  }, [notificationProvider]);
  const notificationProviderContextValues = useNotificationProviderValues();
  useRouterMisuseWarning(routerProvider);
  if (legacyRouterProvider && !routerProvider && (resources ?? []).length === 0) {
    return ReadyPage2 ? /* @__PURE__ */ React3.createElement(ReadyPage2, null) : /* @__PURE__ */ React3.createElement(ReadyPage, null);
  }
  const { RouterComponent = React3.Fragment } = !routerProvider ? legacyRouterProvider ?? {} : {};
  return /* @__PURE__ */ React3.createElement(dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.QueryClientProvider, { client: queryClient }, /* @__PURE__ */ React3.createElement(NotificationContextProvider, { ...notificationProviderContextValues }, /* @__PURE__ */ React3.createElement(
    LegacyAuthContextProvider,
    {
      ...legacyAuthProvider ?? {},
      isProvided: Boolean(legacyAuthProvider)
    },
    /* @__PURE__ */ React3.createElement(
      AuthBindingsContextProvider,
      {
        ...authProvider ?? {},
        isProvided: Boolean(authProvider)
      },
      /* @__PURE__ */ React3.createElement(DataContextProvider, { dataProvider }, /* @__PURE__ */ React3.createElement(LiveContextProvider, { liveProvider }, /* @__PURE__ */ React3.createElement(
        RouterPickerProvider,
        {
          value: legacyRouterProvider && !routerProvider ? "legacy" : "new"
        },
        /* @__PURE__ */ React3.createElement(RouterContextProvider, { router: routerProvider }, /* @__PURE__ */ React3.createElement(LegacyRouterContextProvider, { ...legacyRouterProvider }, /* @__PURE__ */ React3.createElement(ResourceContextProvider, { resources: resources ?? [] }, /* @__PURE__ */ React3.createElement(I18nContextProvider, { i18nProvider }, /* @__PURE__ */ React3.createElement(
          AccessControlContextProvider,
          {
            ...accessControlProvider ?? {}
          },
          /* @__PURE__ */ React3.createElement(
            AuditLogContextProvider,
            {
              ...auditLogProvider ?? {}
            },
            /* @__PURE__ */ React3.createElement(UndoableQueueContextProvider, null, /* @__PURE__ */ React3.createElement(
              RefineContextProvider,
              {
                mutationMode: optionsWithDefaults.mutationMode,
                warnWhenUnsavedChanges: optionsWithDefaults.warnWhenUnsavedChanges,
                syncWithLocation: optionsWithDefaults.syncWithLocation,
                Title,
                undoableTimeout: optionsWithDefaults.undoableTimeout,
                catchAll,
                DashboardPage,
                LoginPage: LoginPage3,
                Layout,
                Sider,
                Footer,
                Header,
                OffLayoutArea,
                hasDashboard: !!DashboardPage,
                liveMode: optionsWithDefaults.liveMode,
                onLiveEvent,
                options: optionsWithDefaults
              },
              /* @__PURE__ */ React3.createElement(UnsavedWarnContextProvider, null, /* @__PURE__ */ React3.createElement(RouterComponent, null, children, !disableTelemetryWithDefault && /* @__PURE__ */ React3.createElement(Telemetry, null), /* @__PURE__ */ React3.createElement(RouteChangeHandler, null)))
            ))
          )
        )))))
      )))
    )
  )));
}, "Refine");
var UndoableQueue = /* @__PURE__ */ __name(({ notification }) => {
  const translate = useTranslate();
  const { notificationDispatch } = useCancelNotification();
  const { open } = useNotification();
  const [timeoutId, setTimeoutId] = dashboard__loadShare__react__loadShare__.useState();
  const cancelNotification = /* @__PURE__ */ __name(() => {
    if (notification.isRunning === true) {
      if (notification.seconds === 0) {
        notification.doMutation();
      }
      if (!notification.isSilent) {
        open == null ? void 0 : open({
          key: `${notification.id}-${notification.resource}-notification`,
          type: "progress",
          message: translate(
            "notifications.undoable",
            {
              seconds: userFriendlySecond(notification.seconds)
            },
            `You have ${userFriendlySecond(
              notification.seconds
            )} seconds to undo`
          ),
          cancelMutation: notification.cancelMutation,
          undoableTimeout: userFriendlySecond(notification.seconds)
        });
      }
      if (notification.seconds > 0) {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        const newTimeoutId = setTimeout(() => {
          notificationDispatch({
            type: "DECREASE_NOTIFICATION_SECOND" /* DECREASE_NOTIFICATION_SECOND */,
            payload: {
              id: notification.id,
              seconds: notification.seconds,
              resource: notification.resource
            }
          });
        }, 1e3);
        setTimeoutId(newTimeoutId);
      }
    }
  }, "cancelNotification");
  dashboard__loadShare__react__loadShare__.useEffect(() => {
    cancelNotification();
  }, [notification]);
  return null;
}, "UndoableQueue");
var LayoutWrapper = /* @__PURE__ */ __name(({
  children,
  Layout: LayoutFromProps,
  Sider: SiderFromProps,
  Header: HeaderFromProps,
  Title: TitleFromProps,
  Footer: FooterFromProps,
  OffLayoutArea: OffLayoutAreaFromProps
}) => {
  const { Layout, Footer, Header, Sider, Title, OffLayoutArea } = useRefineContext();
  const LayoutToRender = LayoutFromProps ?? Layout;
  return /* @__PURE__ */ React3.createElement(
    LayoutToRender,
    {
      Sider: SiderFromProps ?? Sider,
      Header: HeaderFromProps ?? Header,
      Footer: FooterFromProps ?? Footer,
      Title: TitleFromProps ?? Title,
      OffLayoutArea: OffLayoutAreaFromProps ?? OffLayoutArea
    },
    children,
    /* @__PURE__ */ React3.createElement(UnsavedPrompt, null)
  );
}, "LayoutWrapper");
var UnsavedPrompt = /* @__PURE__ */ __name(() => {
  const { Prompt } = useRouterContext();
  const translate = useTranslate();
  const { warnWhen, setWarnWhen } = useWarnAboutChange();
  const warnWhenListener = /* @__PURE__ */ __name((e) => {
    e.preventDefault();
    e.returnValue = translate(
      "warnWhenUnsavedChanges",
      "Are you sure you want to leave? You have unsaved changes."
    );
    return e.returnValue;
  }, "warnWhenListener");
  dashboard__loadShare__react__loadShare__.useEffect(() => {
    if (warnWhen) {
      window.addEventListener("beforeunload", warnWhenListener);
    }
    return window.removeEventListener("beforeunload", warnWhenListener);
  }, [warnWhen]);
  return /* @__PURE__ */ React3.createElement(
    Prompt,
    {
      when: warnWhen,
      message: translate(
        "warnWhenUnsavedChanges",
        "Are you sure you want to leave? You have unsaved changes."
      ),
      setWarnWhen
    }
  );
}, "UnsavedPrompt");
function Authenticated({
  redirectOnFail = true,
  appendCurrentPathToQuery = true,
  children,
  fallback: fallbackContent,
  loading: loadingContent,
  params
}) {
  var _a;
  const activeAuthProvider = useActiveAuthProvider();
  const routerType = useRouterType();
  const hasAuthProvider = Boolean(activeAuthProvider == null ? void 0 : activeAuthProvider.isProvided);
  const isLegacyAuth = Boolean(activeAuthProvider == null ? void 0 : activeAuthProvider.isLegacy);
  const isLegacyRouter = routerType === "legacy";
  const parsed = useParsed();
  const go = useGo();
  const { useLocation } = useRouterContext();
  const legacyLocation = useLocation();
  const {
    isFetching,
    isSuccess,
    data: {
      authenticated: isAuthenticatedStatus,
      redirectTo: authenticatedRedirect
    } = {}
  } = useIsAuthenticated({
    v3LegacyAuthProviderCompatible: isLegacyAuth,
    params
  });
  const isAuthenticated = hasAuthProvider ? isLegacyAuth ? isSuccess : isAuthenticatedStatus : true;
  if (!hasAuthProvider) {
    return /* @__PURE__ */ React3.createElement(React3.Fragment, null, children ?? null);
  }
  if (isFetching) {
    return /* @__PURE__ */ React3.createElement(React3.Fragment, null, loadingContent ?? null);
  }
  if (isAuthenticated) {
    return /* @__PURE__ */ React3.createElement(React3.Fragment, null, children ?? null);
  }
  if (typeof fallbackContent !== "undefined") {
    return /* @__PURE__ */ React3.createElement(React3.Fragment, null, fallbackContent ?? null);
  }
  const appliedRedirect = isLegacyAuth ? typeof redirectOnFail === "string" ? redirectOnFail : "/login" : typeof redirectOnFail === "string" ? redirectOnFail : authenticatedRedirect;
  const pathname = `${isLegacyRouter ? legacyLocation == null ? void 0 : legacyLocation.pathname : parsed.pathname}`.replace(/(\?.*|#.*)$/, "");
  if (appliedRedirect) {
    if (isLegacyRouter) {
      const toQuery = appendCurrentPathToQuery ? `?to=${encodeURIComponent(pathname)}` : "";
      return /* @__PURE__ */ React3.createElement(RedirectLegacy, { to: `${appliedRedirect}${toQuery}` });
    }
    const queryToValue = ((_a = parsed.params) == null ? void 0 : _a.to) ? parsed.params.to : go({
      to: pathname,
      options: { keepQuery: true },
      type: "path"
    });
    return /* @__PURE__ */ React3.createElement(
      Redirect,
      {
        config: {
          to: appliedRedirect,
          query: appendCurrentPathToQuery && (queryToValue ?? "").length > 1 ? {
            to: queryToValue
          } : void 0,
          type: "replace"
        }
      }
    );
  }
  return null;
}
__name(Authenticated, "Authenticated");
var Redirect = /* @__PURE__ */ __name(({ config }) => {
  const go = useGo();
  React3.useEffect(() => {
    go(config);
  }, [go, config]);
  return null;
}, "Redirect");
var RedirectLegacy = /* @__PURE__ */ __name(({ to }) => {
  const { replace } = useNavigation();
  React3.useEffect(() => {
    replace(to);
  }, [replace, to]);
  return null;
}, "RedirectLegacy");
var RouteChangeHandler = /* @__PURE__ */ __name(() => {
  const { useLocation } = useRouterContext();
  const { checkAuth } = useLegacyAuthContext();
  const location = useLocation();
  dashboard__loadShare__react__loadShare__.useEffect(() => {
    checkAuth == null ? void 0 : checkAuth().catch(() => false);
  }, [location == null ? void 0 : location.pathname]);
  return null;
}, "RouteChangeHandler");
var CanAccess = /* @__PURE__ */ __name(({
  resource: resourceFromProp,
  action: actionFromProp,
  params: paramsFromProp,
  fallback,
  onUnauthorized,
  children,
  queryOptions: componentQueryOptions,
  ...rest
}) => {
  const {
    id,
    resource,
    action: fallbackAction = ""
  } = useResourceParams({
    resource: resourceFromProp,
    id: paramsFromProp == null ? void 0 : paramsFromProp.id
  });
  const action = actionFromProp ?? fallbackAction;
  const params = paramsFromProp ?? {
    id,
    resource
  };
  const { data } = useCan({
    resource: resource == null ? void 0 : resource.name,
    action,
    params,
    queryOptions: componentQueryOptions
  });
  dashboard__loadShare__react__loadShare__.useEffect(() => {
    if (onUnauthorized && (data == null ? void 0 : data.can) === false) {
      onUnauthorized({
        resource: resource == null ? void 0 : resource.name,
        action,
        reason: data == null ? void 0 : data.reason,
        params
      });
    }
  }, [data == null ? void 0 : data.can]);
  if (data == null ? void 0 : data.can) {
    if (React3.isValidElement(children)) {
      const Children = React3.cloneElement(children, rest);
      return Children;
    }
    return /* @__PURE__ */ React3.createElement(React3.Fragment, null, children);
  }
  if ((data == null ? void 0 : data.can) === false) {
    return /* @__PURE__ */ React3.createElement(React3.Fragment, null, fallback ?? null);
  }
  return null;
}, "CanAccess");

// src/components/gh-banner/styles.ts
var CSSRules = [
  `
    .bg-top-announcement {
        border-bottom: 1px solid rgba(71, 235, 235, 0.15);
        background: radial-gradient(
                218.19% 111.8% at 0% 0%,
                rgba(71, 235, 235, 0.1) 0%,
                rgba(71, 235, 235, 0.2) 100%
            ),
            #14141f;
    }
    `,
  `
    .top-announcement-mask {
        mask-image: url(https://refine.ams3.cdn.digitaloceanspaces.com/website/static/assets/hexagon.svg);
        -webkit-mask-image: url(https://refine.ams3.cdn.digitaloceanspaces.com/website/static/assets/hexagon.svg);
        mask-repeat: repeat;
        -webkit-mask-repeat: repeat;
        background: rgba(71, 235, 235, 0.25);
    }
    `,
  `
    .banner {
        display: flex;
        @media (max-width: 1000px) {
            display: none;
        }
    }`,
  `
    .gh-link, .gh-link:hover, .gh-link:active, .gh-link:visited, .gh-link:focus {
        text-decoration: none;
        z-index: 9;
    }
    `,
  `
    @keyframes top-announcement-glow {
        0% {
            opacity: 1;
        }

        100% {
            opacity: 0;
        }
    }
    `
];

// src/components/gh-banner/index.tsx
var text = "If you find Refine useful, you can contribute to its growth by giving it a star on GitHub";
var GitHubBanner = /* @__PURE__ */ __name(({ containerStyle }) => {
  dashboard__loadShare__react__loadShare__.useEffect(() => {
    const styleTag = document.createElement("style");
    document.head.appendChild(styleTag);
    CSSRules.forEach(
      (rule) => {
        var _a;
        return (_a = styleTag.sheet) == null ? void 0 : _a.insertRule(rule, styleTag.sheet.cssRules.length);
      }
    );
  }, []);
  return /* @__PURE__ */ React3.createElement(
    "div",
    {
      className: "banner bg-top-announcement",
      style: {
        width: "100%",
        height: "48px"
      }
    },
    /* @__PURE__ */ React3.createElement(
      "div",
      {
        style: {
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          paddingLeft: "200px",
          width: "100%",
          maxWidth: "100vw",
          height: "100%",
          borderBottom: "1px solid #47ebeb26",
          ...containerStyle
        }
      },
      /* @__PURE__ */ React3.createElement(
        "div",
        {
          className: "top-announcement-mask",
          style: {
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            borderBottom: "1px solid #47ebeb26"
          }
        },
        /* @__PURE__ */ React3.createElement(
          "div",
          {
            style: {
              position: "relative",
              width: "960px",
              height: "100%",
              display: "flex",
              justifyContent: "space-between",
              margin: "0 auto"
            }
          },
          /* @__PURE__ */ React3.createElement(
            "div",
            {
              style: {
                width: "calc(50% - 300px)",
                height: "100%",
                position: "relative"
              }
            },
            /* @__PURE__ */ React3.createElement(
              GlowSmall,
              {
                style: {
                  animationDelay: "1.5s",
                  position: "absolute",
                  top: "2px",
                  right: "220px"
                },
                id: "1"
              }
            ),
            /* @__PURE__ */ React3.createElement(
              GlowSmall,
              {
                style: {
                  animationDelay: "1s",
                  position: "absolute",
                  top: "8px",
                  right: "100px",
                  transform: "rotate(180deg)"
                },
                id: "2"
              }
            ),
            /* @__PURE__ */ React3.createElement(
              GlowBig,
              {
                style: {
                  position: "absolute",
                  right: "10px"
                },
                id: "3"
              }
            )
          ),
          /* @__PURE__ */ React3.createElement(
            "div",
            {
              style: {
                width: "calc(50% - 300px)",
                height: "100%",
                position: "relative"
              }
            },
            /* @__PURE__ */ React3.createElement(
              GlowSmall,
              {
                style: {
                  animationDelay: "2s",
                  position: "absolute",
                  top: "6px",
                  right: "180px",
                  transform: "rotate(180deg)"
                },
                id: "4"
              }
            ),
            /* @__PURE__ */ React3.createElement(
              GlowSmall,
              {
                style: {
                  animationDelay: "0.5s",
                  transitionDelay: "1.3s",
                  position: "absolute",
                  top: "2px",
                  right: "40px"
                },
                id: "5"
              }
            ),
            /* @__PURE__ */ React3.createElement(
              GlowBig,
              {
                style: {
                  position: "absolute",
                  right: "-70px"
                },
                id: "6"
              }
            )
          )
        )
      ),
      /* @__PURE__ */ React3.createElement(Text, { text })
    )
  );
}, "GitHubBanner");
var Text = /* @__PURE__ */ __name(({ text: text2 }) => {
  return /* @__PURE__ */ React3.createElement(
    "a",
    {
      className: "gh-link",
      href: "https://s.refine.dev/github-support",
      target: "_blank",
      rel: "noreferrer",
      style: {
        position: "absolute",
        height: "100%",
        padding: "0 60px",
        display: "flex",
        flexWrap: "nowrap",
        whiteSpace: "nowrap",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: "linear-gradient(90deg, rgba(31, 63, 72, 0.00) 0%, #1F3F48 10%, #1F3F48 90%, rgba(31, 63, 72, 0.00) 100%)"
      }
    },
    /* @__PURE__ */ React3.createElement(
      "div",
      {
        style: {
          color: "#fff",
          display: "flex",
          flexDirection: "row",
          gap: "8px"
        }
      },
      /* @__PURE__ */ React3.createElement(
        "span",
        {
          style: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center"
          }
        },
        "\u2B50\uFE0F"
      ),
      /* @__PURE__ */ React3.createElement(
        "span",
        {
          className: "text",
          style: {
            fontSize: "16px",
            lineHeight: "24px"
          }
        },
        text2
      ),
      /* @__PURE__ */ React3.createElement(
        "span",
        {
          style: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center"
          }
        },
        "\u2B50\uFE0F"
      )
    )
  );
}, "Text");
var GlowSmall = /* @__PURE__ */ __name(({ style, ...props }) => {
  return /* @__PURE__ */ React3.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: 80,
      height: 40,
      fill: "none",
      style: {
        opacity: 1,
        animation: "top-announcement-glow 1s ease-in-out infinite alternate",
        ...style
      }
    },
    /* @__PURE__ */ React3.createElement("circle", { cx: 40, r: 40, fill: `url(#${props.id}-a)`, fillOpacity: 0.5 }),
    /* @__PURE__ */ React3.createElement("defs", null, /* @__PURE__ */ React3.createElement(
      "radialGradient",
      {
        id: `${props.id}-a`,
        cx: 0,
        cy: 0,
        r: 1,
        gradientTransform: "matrix(0 40 -40 0 40 0)",
        gradientUnits: "userSpaceOnUse"
      },
      /* @__PURE__ */ React3.createElement("stop", { stopColor: "#47EBEB" }),
      /* @__PURE__ */ React3.createElement("stop", { offset: 1, stopColor: "#47EBEB", stopOpacity: 0 })
    ))
  );
}, "GlowSmall");
var GlowBig = /* @__PURE__ */ __name(({ style, ...props }) => /* @__PURE__ */ React3.createElement(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    width: 120,
    height: 48,
    fill: "none",
    ...props,
    style: {
      opacity: 1,
      animation: "top-announcement-glow 1s ease-in-out infinite alternate",
      ...style
    }
  },
  /* @__PURE__ */ React3.createElement(
    "circle",
    {
      cx: 60,
      cy: 24,
      r: 60,
      fill: `url(#${props.id}-a)`,
      fillOpacity: 0.5
    }
  ),
  /* @__PURE__ */ React3.createElement("defs", null, /* @__PURE__ */ React3.createElement(
    "radialGradient",
    {
      id: `${props.id}-a`,
      cx: 0,
      cy: 0,
      r: 1,
      gradientTransform: "matrix(0 60 -60 0 60 24)",
      gradientUnits: "userSpaceOnUse"
    },
    /* @__PURE__ */ React3.createElement("stop", { stopColor: "#47EBEB" }),
    /* @__PURE__ */ React3.createElement("stop", { offset: 1, stopColor: "#47EBEB", stopOpacity: 0 })
  ))
), "GlowBig");
var AutoSaveIndicator = /* @__PURE__ */ __name(({
  status,
  elements: {
    success = /* @__PURE__ */ React3.createElement(Message, { translationKey: "autoSave.success", defaultMessage: "saved" }),
    error = /* @__PURE__ */ React3.createElement(
      Message,
      {
        translationKey: "autoSave.error",
        defaultMessage: "auto save failure"
      }
    ),
    loading = /* @__PURE__ */ React3.createElement(Message, { translationKey: "autoSave.loading", defaultMessage: "saving..." }),
    idle = /* @__PURE__ */ React3.createElement(
      Message,
      {
        translationKey: "autoSave.idle",
        defaultMessage: "waiting for changes"
      }
    )
  } = {}
}) => {
  switch (status) {
    case "success":
      return /* @__PURE__ */ React3.createElement(React3.Fragment, null, success);
    case "error":
      return /* @__PURE__ */ React3.createElement(React3.Fragment, null, error);
    case "loading":
      return /* @__PURE__ */ React3.createElement(React3.Fragment, null, loading);
    default:
      return /* @__PURE__ */ React3.createElement(React3.Fragment, null, idle);
  }
}, "AutoSaveIndicator");
var Message = /* @__PURE__ */ __name(({
  translationKey,
  defaultMessage
}) => {
  const translate = useTranslate();
  return /* @__PURE__ */ React3.createElement("span", null, translate(translationKey, defaultMessage));
}, "Message");

export { AccessControlContext, ActionTypes, AuditLogContext, AuthBindingsContext, AuthPage, Authenticated, AutoSaveIndicator, CanAccess, DataContext, ErrorComponent, GitHubBanner, I18nContext, KeyBuilder, LayoutWrapper, LegacyAuthContext, LegacyRouterContext, Link, LiveContext, LoginPage, MetaContext, MetaContextProvider, NotificationContext, ReadyPage, Refine, RefineContext, ResourceContext, RouteChangeHandler, RouterContext, I18nContext as TranslationContext, UndoableQueue, UndoableQueueContext, WelcomePage, createTreeView, file2Base64, flattenObjectKeys, generateDefaultDocumentTitle, getDefaultFilter, getDefaultSortOrder, getNextPageParam, getPreviousPageParam, handleUseParams, importCSVMapper, keys, legacyResourceTransform, matchResourceFromRoute, parseTableParams, parseTableParamsFromQuery, pickDataProvider, pickNotDeprecated, propertyPathToArray, queryKeys, routeGenerator, setInitialFilters, setInitialSorters, stringifyTableParams, unionFilters, unionSorters, useActiveAuthProvider, useApiUrl, useAuthenticated, useBack, useBreadcrumb, useCan, useCanWithoutCache, useCancelNotification, useCheckError, useCloneButton, useCreate, useCreateButton, useCreateMany, useCustom, useCustomMutation, useDataProvider, useDelete, useDeleteButton, useDeleteMany, useEditButton, useExport, useExportButton, useForgotPassword, useForm, useGetIdentity, useGetLocale, useGetToPath, useGo, useHandleNotification, useImport, useImportButton, useInfiniteList, useInvalidate, useInvalidateAuthStore, useIsAuthenticated, useIsExistAuthentication, useKeys, useLink, useList, useListButton, useLiveMode, useLoadingOvertime, useLog, useLogList, useLogin, useLogout, useMany, useMenu, useMeta, useMetaContext, useModal, useMutationMode, useNavigation, useNotification, useOnError, useOne, useParse, useParsed, usePermissions, usePublish, useRedirectionAfterSubmission, useRefineContext, useRefineOptions, useRefreshButton, useRegister, useResource, useResourceParams, useResourceSubscription, useResourceWithRoute, useRouterContext, useRouterType, useSaveButton, useSelect, useSetLocale, useShow, useShowButton, useSubscription, useSyncWithLocation, useTable, useTitle, useToPath, useTranslate, useTranslation, useUpdate, useUpdateMany, useUpdatePassword, useUserFriendlyName, useWarnAboutChange, userFriendlyResourceName };
