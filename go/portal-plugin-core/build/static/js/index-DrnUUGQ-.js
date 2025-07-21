import { React, core_core__loadShare__react__loadShare__ } from './core_core__loadShare__react__loadShare__-Dp0YNvAn.js';
import { getDefaultExportFromCjs } from './_commonjsHelpers-BILit0S-.js';
import { core_core__mf_v__runtimeInit__mf_v__, index_cjs } from './core_core__mf_v__runtimeInit__mf_v__-DHIRDVBI.js';
import { MapCache, Symbol as Symbol$1, isArray, isArguments, getNative, isLength, isFunction, isObjectLike, root, arrayMap, isSymbol, isObject, ListCache, Map, eq, baseGetTag, freeGlobal, isIndex, toSource, baseGet, isKey, toKey, Dn, get } from './index-BHrwmvBf.js';

var errorStackParser$1 = {exports: {}};

var stackframe$1 = {exports: {}};

var stackframe = stackframe$1.exports;

var hasRequiredStackframe;

function requireStackframe () {
	if (hasRequiredStackframe) return stackframe$1.exports;
	hasRequiredStackframe = 1;
	(function (module, exports) {
		(function(root, factory) {
		    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

		    /* istanbul ignore next */
		    {
		        module.exports = factory();
		    }
		}(stackframe, function() {
		    function _isNumber(n) {
		        return !isNaN(parseFloat(n)) && isFinite(n);
		    }

		    function _capitalize(str) {
		        return str.charAt(0).toUpperCase() + str.substring(1);
		    }

		    function _getter(p) {
		        return function() {
		            return this[p];
		        };
		    }

		    var booleanProps = ['isConstructor', 'isEval', 'isNative', 'isToplevel'];
		    var numericProps = ['columnNumber', 'lineNumber'];
		    var stringProps = ['fileName', 'functionName', 'source'];
		    var arrayProps = ['args'];
		    var objectProps = ['evalOrigin'];

		    var props = booleanProps.concat(numericProps, stringProps, arrayProps, objectProps);

		    function StackFrame(obj) {
		        if (!obj) return;
		        for (var i = 0; i < props.length; i++) {
		            if (obj[props[i]] !== undefined) {
		                this['set' + _capitalize(props[i])](obj[props[i]]);
		            }
		        }
		    }

		    StackFrame.prototype = {
		        getArgs: function() {
		            return this.args;
		        },
		        setArgs: function(v) {
		            if (Object.prototype.toString.call(v) !== '[object Array]') {
		                throw new TypeError('Args must be an Array');
		            }
		            this.args = v;
		        },

		        getEvalOrigin: function() {
		            return this.evalOrigin;
		        },
		        setEvalOrigin: function(v) {
		            if (v instanceof StackFrame) {
		                this.evalOrigin = v;
		            } else if (v instanceof Object) {
		                this.evalOrigin = new StackFrame(v);
		            } else {
		                throw new TypeError('Eval Origin must be an Object or StackFrame');
		            }
		        },

		        toString: function() {
		            var fileName = this.getFileName() || '';
		            var lineNumber = this.getLineNumber() || '';
		            var columnNumber = this.getColumnNumber() || '';
		            var functionName = this.getFunctionName() || '';
		            if (this.getIsEval()) {
		                if (fileName) {
		                    return '[eval] (' + fileName + ':' + lineNumber + ':' + columnNumber + ')';
		                }
		                return '[eval]:' + lineNumber + ':' + columnNumber;
		            }
		            if (functionName) {
		                return functionName + ' (' + fileName + ':' + lineNumber + ':' + columnNumber + ')';
		            }
		            return fileName + ':' + lineNumber + ':' + columnNumber;
		        }
		    };

		    StackFrame.fromString = function StackFrame$$fromString(str) {
		        var argsStartIndex = str.indexOf('(');
		        var argsEndIndex = str.lastIndexOf(')');

		        var functionName = str.substring(0, argsStartIndex);
		        var args = str.substring(argsStartIndex + 1, argsEndIndex).split(',');
		        var locationString = str.substring(argsEndIndex + 1);

		        if (locationString.indexOf('@') === 0) {
		            var parts = /@(.+?)(?::(\d+))?(?::(\d+))?$/.exec(locationString, '');
		            var fileName = parts[1];
		            var lineNumber = parts[2];
		            var columnNumber = parts[3];
		        }

		        return new StackFrame({
		            functionName: functionName,
		            args: args || undefined,
		            fileName: fileName,
		            lineNumber: lineNumber || undefined,
		            columnNumber: columnNumber || undefined
		        });
		    };

		    for (var i = 0; i < booleanProps.length; i++) {
		        StackFrame.prototype['get' + _capitalize(booleanProps[i])] = _getter(booleanProps[i]);
		        StackFrame.prototype['set' + _capitalize(booleanProps[i])] = (function(p) {
		            return function(v) {
		                this[p] = Boolean(v);
		            };
		        })(booleanProps[i]);
		    }

		    for (var j = 0; j < numericProps.length; j++) {
		        StackFrame.prototype['get' + _capitalize(numericProps[j])] = _getter(numericProps[j]);
		        StackFrame.prototype['set' + _capitalize(numericProps[j])] = (function(p) {
		            return function(v) {
		                if (!_isNumber(v)) {
		                    throw new TypeError(p + ' must be a Number');
		                }
		                this[p] = Number(v);
		            };
		        })(numericProps[j]);
		    }

		    for (var k = 0; k < stringProps.length; k++) {
		        StackFrame.prototype['get' + _capitalize(stringProps[k])] = _getter(stringProps[k]);
		        StackFrame.prototype['set' + _capitalize(stringProps[k])] = (function(p) {
		            return function(v) {
		                this[p] = String(v);
		            };
		        })(stringProps[k]);
		    }

		    return StackFrame;
		})); 
	} (stackframe$1));
	return stackframe$1.exports;
}

var errorStackParser = errorStackParser$1.exports;

(function (module, exports) {
	(function(root, factory) {
	    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

	    /* istanbul ignore next */
	    {
	        module.exports = factory(requireStackframe());
	    }
	}(errorStackParser, function ErrorStackParser(StackFrame) {

	    var FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+:\d+/;
	    var CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+:\d+|\(native\))/m;
	    var SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code])?$/;

	    return {
	        /**
	         * Given an Error object, extract the most information from it.
	         *
	         * @param {Error} error object
	         * @return {Array} of StackFrames
	         */
	        parse: function ErrorStackParser$$parse(error) {
	            if (typeof error.stacktrace !== 'undefined' || typeof error['opera#sourceloc'] !== 'undefined') {
	                return this.parseOpera(error);
	            } else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
	                return this.parseV8OrIE(error);
	            } else if (error.stack) {
	                return this.parseFFOrSafari(error);
	            } else {
	                throw new Error('Cannot parse given Error object');
	            }
	        },

	        // Separate line and column numbers from a string of the form: (URI:Line:Column)
	        extractLocation: function ErrorStackParser$$extractLocation(urlLike) {
	            // Fail-fast but return locations like "(native)"
	            if (urlLike.indexOf(':') === -1) {
	                return [urlLike];
	            }

	            var regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/;
	            var parts = regExp.exec(urlLike.replace(/[()]/g, ''));
	            return [parts[1], parts[2] || undefined, parts[3] || undefined];
	        },

	        parseV8OrIE: function ErrorStackParser$$parseV8OrIE(error) {
	            var filtered = error.stack.split('\n').filter(function(line) {
	                return !!line.match(CHROME_IE_STACK_REGEXP);
	            }, this);

	            return filtered.map(function(line) {
	                if (line.indexOf('(eval ') > -1) {
	                    // Throw away eval information until we implement stacktrace.js/stackframe#8
	                    line = line.replace(/eval code/g, 'eval').replace(/(\(eval at [^()]*)|(,.*$)/g, '');
	                }
	                var sanitizedLine = line.replace(/^\s+/, '').replace(/\(eval code/g, '(').replace(/^.*?\s+/, '');

	                // capture and preseve the parenthesized location "(/foo/my bar.js:12:87)" in
	                // case it has spaces in it, as the string is split on \s+ later on
	                var location = sanitizedLine.match(/ (\(.+\)$)/);

	                // remove the parenthesized location from the line, if it was matched
	                sanitizedLine = location ? sanitizedLine.replace(location[0], '') : sanitizedLine;

	                // if a location was matched, pass it to extractLocation() otherwise pass all sanitizedLine
	                // because this line doesn't have function name
	                var locationParts = this.extractLocation(location ? location[1] : sanitizedLine);
	                var functionName = location && sanitizedLine || undefined;
	                var fileName = ['eval', '<anonymous>'].indexOf(locationParts[0]) > -1 ? undefined : locationParts[0];

	                return new StackFrame({
	                    functionName: functionName,
	                    fileName: fileName,
	                    lineNumber: locationParts[1],
	                    columnNumber: locationParts[2],
	                    source: line
	                });
	            }, this);
	        },

	        parseFFOrSafari: function ErrorStackParser$$parseFFOrSafari(error) {
	            var filtered = error.stack.split('\n').filter(function(line) {
	                return !line.match(SAFARI_NATIVE_CODE_REGEXP);
	            }, this);

	            return filtered.map(function(line) {
	                // Throw away eval information until we implement stacktrace.js/stackframe#8
	                if (line.indexOf(' > eval') > -1) {
	                    line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ':$1');
	                }

	                if (line.indexOf('@') === -1 && line.indexOf(':') === -1) {
	                    // Safari eval frames only have function names and nothing else
	                    return new StackFrame({
	                        functionName: line
	                    });
	                } else {
	                    var functionNameRegex = /((.*".+"[^@]*)?[^@]*)(?:@)/;
	                    var matches = line.match(functionNameRegex);
	                    var functionName = matches && matches[1] ? matches[1] : undefined;
	                    var locationParts = this.extractLocation(line.replace(functionNameRegex, ''));

	                    return new StackFrame({
	                        functionName: functionName,
	                        fileName: locationParts[0],
	                        lineNumber: locationParts[1],
	                        columnNumber: locationParts[2],
	                        source: line
	                    });
	                }
	            }, this);
	        },

	        parseOpera: function ErrorStackParser$$parseOpera(e) {
	            if (!e.stacktrace || (e.message.indexOf('\n') > -1 &&
	                e.message.split('\n').length > e.stacktrace.split('\n').length)) {
	                return this.parseOpera9(e);
	            } else if (!e.stack) {
	                return this.parseOpera10(e);
	            } else {
	                return this.parseOpera11(e);
	            }
	        },

	        parseOpera9: function ErrorStackParser$$parseOpera9(e) {
	            var lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
	            var lines = e.message.split('\n');
	            var result = [];

	            for (var i = 2, len = lines.length; i < len; i += 2) {
	                var match = lineRE.exec(lines[i]);
	                if (match) {
	                    result.push(new StackFrame({
	                        fileName: match[2],
	                        lineNumber: match[1],
	                        source: lines[i]
	                    }));
	                }
	            }

	            return result;
	        },

	        parseOpera10: function ErrorStackParser$$parseOpera10(e) {
	            var lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
	            var lines = e.stacktrace.split('\n');
	            var result = [];

	            for (var i = 0, len = lines.length; i < len; i += 2) {
	                var match = lineRE.exec(lines[i]);
	                if (match) {
	                    result.push(
	                        new StackFrame({
	                            functionName: match[3] || undefined,
	                            fileName: match[2],
	                            lineNumber: match[1],
	                            source: lines[i]
	                        })
	                    );
	                }
	            }

	            return result;
	        },

	        // Opera 10.65+ Error.stack very similar to FF/Safari
	        parseOpera11: function ErrorStackParser$$parseOpera11(error) {
	            var filtered = error.stack.split('\n').filter(function(line) {
	                return !!line.match(FIREFOX_SAFARI_STACK_REGEXP) && !line.match(/^Error created at/);
	            }, this);

	            return filtered.map(function(line) {
	                var tokens = line.split('@');
	                var locationParts = this.extractLocation(tokens.pop());
	                var functionCall = (tokens.shift() || '');
	                var functionName = functionCall
	                    .replace(/<anonymous function(: (\w+))?>/, '$2')
	                    .replace(/\([^)]*\)/g, '') || undefined;
	                var argsRaw;
	                if (functionCall.match(/\(([^)]*)\)/)) {
	                    argsRaw = functionCall.replace(/^[^(]+\(([^)]*)\)$/, '$1');
	                }
	                var args = (argsRaw === undefined || argsRaw === '[arguments not available]') ?
	                    undefined : argsRaw.split(',');

	                return new StackFrame({
	                    functionName: functionName,
	                    args: args,
	                    fileName: locationParts[0],
	                    lineNumber: locationParts[1],
	                    columnNumber: locationParts[2],
	                    source: line
	                });
	            }, this);
	        }
	    };
	})); 
} (errorStackParser$1));

var errorStackParserExports = errorStackParser$1.exports;
const I$1 = /*@__PURE__*/getDefaultExportFromCjs(errorStackParserExports);

var c=(t=>(t.RELOAD="devtools:reload",t.DEVTOOLS_INIT="devtools:init",t.DEVTOOLS_ALREADY_CONNECTED="devtools:already-connected",t.ACTIVITY="devtools:send-activity",t.DEVTOOLS_ACTIVITY_UPDATE="devtools:activity-update",t.DEVTOOLS_CONNECTED_APP="devtools:connected-app",t.DEVTOOLS_DISCONNECTED_APP="devtools:disconnected-app",t.DEVTOOLS_HIGHLIGHT_IN_MONITOR="devtools:highlight-in-monitor",t.DEVTOOLS_HIGHLIGHT_IN_MONITOR_ACTION="devtools:highlight-in-monitor-action",t.DEVTOOLS_LOGIN_SUCCESS="devtools:login-success",t.DEVTOOLS_DISPLAY_LOGIN_FAILURE="devtools:display-login-failure",t.DEVTOOLS_LOGIN_FAILURE="devtools:login-failure",t.DEVTOOLS_RELOAD_AFTER_LOGIN="devtools:reload-after-login",t.DEVTOOLS_INVALIDATE_QUERY="devtools:invalidate-query",t.DEVTOOLS_INVALIDATE_QUERY_ACTION="devtools:invalidate-query-action",t))(c||{});var T$1={useCan:"access-control",useLog:"audit-log",useLogList:"audit-log",useCreate:"data",useCreateMany:"data",useCustom:"data",useCustomMutation:"data",useDelete:"data",useDeleteMany:"data",useInfiniteList:"data",useList:"data",useMany:"data",useOne:"data",useUpdate:"data",useUpdateMany:"data",useForgotPassword:"auth",useGetIdentity:"auth",useIsAuthenticated:"auth",useLogin:"auth",useLogout:"auth",useOnError:"auth",usePermissions:"auth",useRegister:"auth",useUpdatePassword:"auth"};Object.entries(T$1).reduce((e,[o,s])=>(e[s]||(e[s]=[]),e[s].push(o),e),{});async function d$1(e,o,s){if(e.readyState!==e.OPEN){await new Promise(n=>{let r=()=>{e.send(JSON.stringify({event:o,payload:s})),n(),e.removeEventListener("open",r);};e.addEventListener("open",r);});return}e.send(JSON.stringify({event:o,payload:s}));}var p$1=React.createContext({__devtools:false,httpUrl:"http://localhost:5001",wsUrl:"ws://localhost:5001",ws:null});function _(e,o,s){let n=r=>{let{event:i,payload:y}=JSON.parse(r.data);o===i&&s(y);};return e.addEventListener("message",n),()=>{e.removeEventListener("message",n);}}

var define_process_env_default$1 = {};
var T = "renderWithHooks", y = (r) => {
  let e = r.findIndex((n) => n.functionName === T);
  return e !== -1 ? r.slice(0, e) : r;
};
var f = define_process_env_default$1.NODE_ENV !== "development" ? /node_modules\/refinedev\/(?<name>.*?)\// : /\/refine\/packages\/(?<name>.*?)\//;
var d = (r) => r ? !!r.match(f) : false;
var m = (r) => {
  var o;
  if (!r) return;
  let e = r.match(f), n = (o = e == null ? void 0 : e.groups) == null ? void 0 : o.name;
  if (n) return `@refinedev/${n}`;
};
function p(r) {
  if (define_process_env_default$1.NODE_ENV !== "development") return [];
  try {
    let e = new Error(), n = I$1.parse(e);
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
  if (define_process_env_default$1.NODE_ENV !== "development") return { hookName: "", trace: [], resourcePath: null, legacyKey: false };
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
var b = {}, x = () => b, C = define_process_env_default$1.NODE_ENV !== "development" ? x : (r) => {
  let { ws: e } = core_core__loadShare__react__loadShare__.useContext(p$1), n = React.useRef(), o = React.useRef();
  return React.useEffect(() => {
    if (!e) return () => 0;
    let s = r.getQueryCache(), t = R(e);
    return s.getAll().forEach(t), n.current = s.subscribe(({ query: a, type: c }) => (c === "added" || c === "updated") && t(a)), () => {
      var a;
      (a = n.current) == null || a.call(n);
    };
  }, [e, r]), React.useEffect(() => {
    if (!e) return () => 0;
    let s = r.getMutationCache(), t = g(e);
    return s.getAll().forEach(t), o.current = s.subscribe(({ mutation: a, type: c }) => (c === "added" || c === "updated") && t(a)), () => {
      var a;
      (a = o.current) == null || a.call(o);
    };
  }, [e, r]), React.useEffect(() => e ? _(e, c.DEVTOOLS_INVALIDATE_QUERY_ACTION, ({ queryKey: t }) => {
    t && r.invalidateQueries(t);
  }) : () => 0, [e, r]), {};
};

// dev uses dynamic import to separate chunks
    
    const {loadShare} = index_cjs;
    const {initPromise} = core_core__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(_ => loadShare("@tanstack/react-query", {
    customShareInfo: {shareConfig:{
      singleton: true,
      strictVersion: false,
      requiredVersion: "^4.36.1"
    }}}));
    const exportModule = await res.then(factory => factory());
    var core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__ = exportModule;

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
  return isArray(value) || isArguments(value) ||
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

var define_process_env_default = {};
const DEV = define_process_env_default.NODE_ENV !== "production";
const warnings = /* @__PURE__ */ new Set();
function warnOnce(condition, ...rest) {
  if (DEV && condition) {
    const key = rest.join(" ");
    if (warnings.has(key)) {
      return;
    }
    warnings.add(key);
    console.warn(...rest);
  }
}
var warnOnce_1 = warnOnce;

const $u = /*@__PURE__*/getDefaultExportFromCjs(warnOnce_1);

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

function commonjsRequire(path) {
	throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}

var pluralize$1 = {exports: {}};

/* global define */
var pluralize = pluralize$1.exports;

(function (module, exports) {
	(function (root, pluralize) {
	  /* istanbul ignore else */
	  if (typeof commonjsRequire === 'function' && 'object' === 'object' && 'object' === 'object') {
	    // Node.
	    module.exports = pluralize();
	  } else {
	    // Browser global.
	    root.pluralize = pluralize();
	  }
	})(pluralize, function () {
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
} (pluralize$1));

var pluralizeExports = pluralize$1.exports;
const us = /*@__PURE__*/getDefaultExportFromCjs(pluralizeExports);

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
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
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
  var isArr = isArray(value),
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
function keys(object) {
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
  return baseGetAllKeys(object, keys, getSymbols);
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
var WeakMap = getNative(root, 'WeakMap');

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
    weakMapCtorString = toSource(WeakMap);

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
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
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
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
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
	((e,t)=>{module.exports=t();})(papaparse_min,function r(){var n="undefined"!=typeof self?self:"undefined"!=typeof window?window:void 0!==n?n:{};var d,s=!n.document&&!!n.postMessage,a=n.IS_PAPA_WORKER||false,o={},h=0,v={};function u(e){this._handle=null,this._finished=false,this._completed=false,this._halted=false,this._input=null,this._baseIndex=0,this._partialLine="",this._rowCount=0,this._start=0,this._nextChunk=null,this.isFirstChunk=true,this._completeResults={data:[],errors:[],meta:{}},function(e){var t=b(e);t.chunkSize=parseInt(t.chunkSize),e.step||e.chunk||(t.chunkSize=null);this._handle=new i(t),(this._handle.streamer=this)._config=t;}.call(this,e),this.parseChunk=function(t,e){var i=parseInt(this._config.skipFirstNLines)||0;if(this.isFirstChunk&&0<i){let e=this._config.newline;e||(r=this._config.quoteChar||'"',e=this._handle.guessLineEndings(t,r)),t=[...t.split(e).slice(i)].join(e);}this.isFirstChunk&&U(this._config.beforeFirstChunk)&&void 0!==(r=this._config.beforeFirstChunk(t))&&(t=r),this.isFirstChunk=false,this._halted=false;var i=this._partialLine+t,r=(this._partialLine="",this._handle.parse(i,this._baseIndex,!this._finished));if(!this._handle.paused()&&!this._handle.aborted()){t=r.meta.cursor,i=(this._finished||(this._partialLine=i.substring(t-this._baseIndex),this._baseIndex=t),r&&r.data&&(this._rowCount+=r.data.length),this._finished||this._config.preview&&this._rowCount>=this._config.preview);if(a)n.postMessage({results:r,workerId:v.WORKER_ID,finished:i});else if(U(this._config.chunk)&&!e){if(this._config.chunk(r,this._handle),this._handle.paused()||this._handle.aborted())return void(this._halted=true);this._completeResults=r=void 0;}return this._config.step||this._config.chunk||(this._completeResults.data=this._completeResults.data.concat(r.data),this._completeResults.errors=this._completeResults.errors.concat(r.errors),this._completeResults.meta=r.meta),this._completed||!i||!U(this._config.complete)||r&&r.meta.aborted||(this._config.complete(this._completeResults,this._input),this._completed=true),i||r&&r.meta.paused||this._nextChunk(),r}this._halted=true;},this._sendError=function(e){U(this._config.error)?this._config.error(e):a&&this._config.error&&n.postMessage({workerId:v.WORKER_ID,error:e,finished:false});};}function f(e){var r;(e=e||{}).chunkSize||(e.chunkSize=v.RemoteChunkSize),u.call(this,e),this._nextChunk=s?function(){this._readChunk(),this._chunkLoaded();}:function(){this._readChunk();},this.stream=function(e){this._input=e,this._nextChunk();},this._readChunk=function(){if(this._finished)this._chunkLoaded();else {if(r=new XMLHttpRequest,this._config.withCredentials&&(r.withCredentials=this._config.withCredentials),s||(r.onload=y(this._chunkLoaded,this),r.onerror=y(this._chunkError,this)),r.open(this._config.downloadRequestBody?"POST":"GET",this._input,!s),this._config.downloadRequestHeaders){var e,t=this._config.downloadRequestHeaders;for(e in t)r.setRequestHeader(e,t[e]);}var i;this._config.chunkSize&&(i=this._start+this._config.chunkSize-1,r.setRequestHeader("Range","bytes="+this._start+"-"+i));try{r.send(this._config.downloadRequestBody);}catch(e){this._chunkError(e.message);}s&&0===r.status&&this._chunkError();}},this._chunkLoaded=function(){4===r.readyState&&(r.status<200||400<=r.status?this._chunkError():(this._start+=this._config.chunkSize||r.responseText.length,this._finished=!this._config.chunkSize||this._start>=(e=>null!==(e=e.getResponseHeader("Content-Range"))?parseInt(e.substring(e.lastIndexOf("/")+1)):-1)(r),this.parseChunk(r.responseText)));},this._chunkError=function(e){e=r.statusText||e;this._sendError(new Error(e));};}function l(e){(e=e||{}).chunkSize||(e.chunkSize=v.LocalChunkSize),u.call(this,e);var i,r,n="undefined"!=typeof FileReader;this.stream=function(e){this._input=e,r=e.slice||e.webkitSlice||e.mozSlice,n?((i=new FileReader).onload=y(this._chunkLoaded,this),i.onerror=y(this._chunkError,this)):i=new FileReaderSync,this._nextChunk();},this._nextChunk=function(){this._finished||this._config.preview&&!(this._rowCount<this._config.preview)||this._readChunk();},this._readChunk=function(){var e=this._input,t=(this._config.chunkSize&&(t=Math.min(this._start+this._config.chunkSize,this._input.size),e=r.call(e,this._start,t)),i.readAsText(e,this._config.encoding));n||this._chunkLoaded({target:{result:t}});},this._chunkLoaded=function(e){this._start+=this._config.chunkSize,this._finished=!this._config.chunkSize||this._start>=this._input.size,this.parseChunk(e.target.result);},this._chunkError=function(){this._sendError(i.error);};}function c(e){var i;u.call(this,e=e||{}),this.stream=function(e){return i=e,this._nextChunk()},this._nextChunk=function(){var e,t;if(!this._finished)return e=this._config.chunkSize,i=e?(t=i.substring(0,e),i.substring(e)):(t=i,""),this._finished=!i,this.parseChunk(t)};}function p(e){u.call(this,e=e||{});var t=[],i=true,r=false;this.pause=function(){u.prototype.pause.apply(this,arguments),this._input.pause();},this.resume=function(){u.prototype.resume.apply(this,arguments),this._input.resume();},this.stream=function(e){this._input=e,this._input.on("data",this._streamData),this._input.on("end",this._streamEnd),this._input.on("error",this._streamError);},this._checkIsFinished=function(){r&&1===t.length&&(this._finished=true);},this._nextChunk=function(){this._checkIsFinished(),t.length?this.parseChunk(t.shift()):i=true;},this._streamData=y(function(e){try{t.push("string"==typeof e?e:e.toString(this._config.encoding)),i&&(i=!1,this._checkIsFinished(),this.parseChunk(t.shift()));}catch(e){this._streamError(e);}},this),this._streamError=y(function(e){this._streamCleanUp(),this._sendError(e);},this),this._streamEnd=y(function(){this._streamCleanUp(),r=true,this._streamData("");},this),this._streamCleanUp=y(function(){this._input.removeListener("data",this._streamData),this._input.removeListener("end",this._streamEnd),this._input.removeListener("error",this._streamError);},this);}function i(m){var n,s,a,t,o=Math.pow(2,53),h=-o,u=/^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/,d=/^((\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)))$/,i=this,r=0,f=0,l=false,e=false,c=[],p={data:[],errors:[],meta:{}};function y(e){return "greedy"===m.skipEmptyLines?""===e.join("").trim():1===e.length&&0===e[0].length}function g(){if(p&&a&&(k("Delimiter","UndetectableDelimiter","Unable to auto-detect delimiting character; defaulted to '"+v.DefaultDelimiter+"'"),a=false),m.skipEmptyLines&&(p.data=p.data.filter(function(e){return !y(e)})),_()){if(p)if(Array.isArray(p.data[0])){for(var e=0;_()&&e<p.data.length;e++)p.data[e].forEach(t);p.data.splice(0,1);}else p.data.forEach(t);function t(e,t){U(m.transformHeader)&&(e=m.transformHeader(e,t)),c.push(e);}}function i(e,t){for(var i=m.header?{}:[],r=0;r<e.length;r++){var n=r,s=e[r],s=((e,t)=>(e=>(m.dynamicTypingFunction&&void 0===m.dynamicTyping[e]&&(m.dynamicTyping[e]=m.dynamicTypingFunction(e)),true===(m.dynamicTyping[e]||m.dynamicTyping)))(e)?"true"===t||"TRUE"===t||"false"!==t&&"FALSE"!==t&&((e=>{if(u.test(e)){e=parseFloat(e);if(h<e&&e<o)return 1}})(t)?parseFloat(t):d.test(t)?new Date(t):""===t?null:t):t)(n=m.header?r>=c.length?"__parsed_extra":c[r]:n,s=m.transform?m.transform(s,n):s);"__parsed_extra"===n?(i[n]=i[n]||[],i[n].push(s)):i[n]=s;}return m.header&&(r>c.length?k("FieldMismatch","TooManyFields","Too many fields: expected "+c.length+" fields but parsed "+r,f+t):r<c.length&&k("FieldMismatch","TooFewFields","Too few fields: expected "+c.length+" fields but parsed "+r,f+t)),i}var r;p&&(m.header||m.dynamicTyping||m.transform)&&(r=1,!p.data.length||Array.isArray(p.data[0])?(p.data=p.data.map(i),r=p.data.length):p.data=i(p.data,0),m.header&&p.meta&&(p.meta.fields=c),f+=r);}function _(){return m.header&&0===c.length}function k(e,t,i,r){e={type:e,code:t,message:i};void 0!==r&&(e.row=r),p.errors.push(e);}U(m.step)&&(t=m.step,m.step=function(e){p=e,_()?g():(g(),0!==p.data.length&&(r+=e.data.length,m.preview&&r>m.preview?s.abort():(p.data=p.data[0],t(p,i))));}),this.parse=function(e,t,i){var r=m.quoteChar||'"',r=(m.newline||(m.newline=this.guessLineEndings(e,r)),a=false,m.delimiter?U(m.delimiter)&&(m.delimiter=m.delimiter(e),p.meta.delimiter=m.delimiter):((r=((e,t,i,r,n)=>{var s,a,o,h;n=n||[",","\t","|",";",v.RECORD_SEP,v.UNIT_SEP];for(var u=0;u<n.length;u++){for(var d,f=n[u],l=0,c=0,p=0,g=(o=void 0,new E({comments:r,delimiter:f,newline:t,preview:10}).parse(e)),_=0;_<g.data.length;_++)i&&y(g.data[_])?p++:(d=g.data[_].length,c+=d,void 0===o?o=d:0<d&&(l+=Math.abs(d-o),o=d));0<g.data.length&&(c/=g.data.length-p),(void 0===a||l<=a)&&(void 0===h||h<c)&&1.99<c&&(a=l,s=f,h=c);}return {successful:!!(m.delimiter=s),bestDelimiter:s}})(e,m.newline,m.skipEmptyLines,m.comments,m.delimitersToGuess)).successful?m.delimiter=r.bestDelimiter:(a=true,m.delimiter=v.DefaultDelimiter),p.meta.delimiter=m.delimiter),b(m));return m.preview&&m.header&&r.preview++,n=e,s=new E(r),p=s.parse(n,t,i),g(),l?{meta:{paused:true}}:p||{meta:{paused:false}}},this.paused=function(){return l},this.pause=function(){l=true,s.abort(),n=U(m.chunk)?"":n.substring(s.getCharIndex());},this.resume=function(){i.streamer._halted?(l=false,i.streamer.parseChunk(n,true)):setTimeout(i.resume,3);},this.aborted=function(){return e},this.abort=function(){e=true,s.abort(),p.meta.aborted=true,U(m.complete)&&m.complete(p),n="";},this.guessLineEndings=function(e,t){e=e.substring(0,1048576);var t=new RegExp(P(t)+"([^]*?)"+P(t),"gm"),i=(e=e.replace(t,"")).split("\r"),t=e.split("\n"),e=1<t.length&&t[0].length<i[0].length;if(1===i.length||e)return "\n";for(var r=0,n=0;n<i.length;n++)"\n"===i[n][0]&&r++;return r>=i.length/2?"\r\n":"\r"};}function P(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function E(C){var S=(C=C||{}).delimiter,O=C.newline,x=C.comments,I=C.step,A=C.preview,T=C.fastMode,D=null,L=false,F=null==C.quoteChar?'"':C.quoteChar,j=F;if(void 0!==C.escapeChar&&(j=C.escapeChar),("string"!=typeof S||-1<v.BAD_DELIMITERS.indexOf(S))&&(S=","),x===S)throw new Error("Comment character same as delimiter");true===x?x="#":("string"!=typeof x||-1<v.BAD_DELIMITERS.indexOf(x))&&(x=false),"\n"!==O&&"\r"!==O&&"\r\n"!==O&&(O="\n");var z=0,M=false;this.parse=function(i,t,r){if("string"!=typeof i)throw new Error("Input must be a string");var n=i.length,e=S.length,s=O.length,a=x.length,o=U(I),h=[],u=[],d=[],f=z=0;if(!i)return w();if(T||false!==T&&-1===i.indexOf(F)){for(var l=i.split(O),c=0;c<l.length;c++){if(d=l[c],z+=d.length,c!==l.length-1)z+=O.length;else if(r)return w();if(!x||d.substring(0,a)!==x){if(o){if(h=[],k(d.split(S)),R(),M)return w()}else k(d.split(S));if(A&&A<=c)return h=h.slice(0,A),w(true)}}return w()}for(var p=i.indexOf(S,z),g=i.indexOf(O,z),_=new RegExp(P(j)+P(F),"g"),m=i.indexOf(F,z);;)if(i[z]===F)for(m=z,z++;;){if(-1===(m=i.indexOf(F,m+1)))return r||u.push({type:"Quotes",code:"MissingQuotes",message:"Quoted field unterminated",row:h.length,index:z}),E();if(m===n-1)return E(i.substring(z,m).replace(_,F));if(F===j&&i[m+1]===j)m++;else if(F===j||0===m||i[m-1]!==j){ -1!==p&&p<m+1&&(p=i.indexOf(S,m+1));var y=v(-1===(g=-1!==g&&g<m+1?i.indexOf(O,m+1):g)?p:Math.min(p,g));if(i.substr(m+1+y,e)===S){d.push(i.substring(z,m).replace(_,F)),i[z=m+1+y+e]!==F&&(m=i.indexOf(F,z)),p=i.indexOf(S,z),g=i.indexOf(O,z);break}y=v(g);if(i.substring(m+1+y,m+1+y+s)===O){if(d.push(i.substring(z,m).replace(_,F)),b(m+1+y+s),p=i.indexOf(S,z),m=i.indexOf(F,z),o&&(R(),M))return w();if(A&&h.length>=A)return w(true);break}u.push({type:"Quotes",code:"InvalidQuotes",message:"Trailing quote on quoted field is malformed",row:h.length,index:z}),m++;}}else if(x&&0===d.length&&i.substring(z,z+a)===x){if(-1===g)return w();z=g+s,g=i.indexOf(O,z),p=i.indexOf(S,z);}else if(-1!==p&&(p<g||-1===g))d.push(i.substring(z,p)),z=p+e,p=i.indexOf(S,z);else {if(-1===g)break;if(d.push(i.substring(z,g)),b(g+s),o&&(R(),M))return w();if(A&&h.length>=A)return w(true)}return E();function k(e){h.push(e),f=z;}function v(e){var t=0;return t=-1!==e&&(e=i.substring(m+1,e))&&""===e.trim()?e.length:t}function E(e){return r||(void 0===e&&(e=i.substring(z)),d.push(e),z=n,k(d),o&&R()),w()}function b(e){z=e,k(d),d=[],g=i.indexOf(O,z);}function w(e){if(C.header&&!t&&h.length&&!L){var s=h[0],a=Object.create(null),o=new Set(s);let n=false;for(let r=0;r<s.length;r++){let i=s[r];if(a[i=U(C.transformHeader)?C.transformHeader(i,r):i]){let e,t=a[i];for(;e=i+"_"+t,t++,o.has(e););o.add(e),s[r]=e,a[i]++,n=true,(D=null===D?{}:D)[e]=i;}else a[i]=1,s[r]=i;o.add(i);}n&&console.warn("Duplicate headers found and renamed."),L=true;}return {data:h,errors:u,meta:{delimiter:S,linebreak:O,aborted:M,truncated:!!e,cursor:f+(t||0),renamedHeaders:D}}}function R(){I(w()),h=[],u=[];}},this.abort=function(){M=true;},this.getCharIndex=function(){return z};}function g(e){var t=e.data,i=o[t.workerId],r=false;if(t.error)i.userError(t.error,t.file);else if(t.results&&t.results.data){var n={abort:function(){r=true,_(t.workerId,{data:[],errors:[],meta:{aborted:true}});},pause:m,resume:m};if(U(i.userStep)){for(var s=0;s<t.results.data.length&&(i.userStep({data:t.results.data[s],errors:t.results.errors,meta:t.results.meta},n),!r);s++);delete t.results;}else U(i.userChunk)&&(i.userChunk(t.results,n,t.file),delete t.results);}t.finished&&!r&&_(t.workerId,t.results);}function _(e,t){var i=o[e];U(i.userComplete)&&i.userComplete(t),i.terminate(),delete o[e];}function m(){throw new Error("Not implemented.")}function b(e){if("object"!=typeof e||null===e)return e;var t,i=Array.isArray(e)?[]:{};for(t in e)i[t]=b(e[t]);return i}function y(e,t){return function(){e.apply(t,arguments);}}function U(e){return "function"==typeof e}return v.parse=function(e,t){var i=(t=t||{}).dynamicTyping||false;U(i)&&(t.dynamicTypingFunction=i,i={});if(t.dynamicTyping=i,t.transform=!!U(t.transform)&&t.transform,!t.worker||!v.WORKERS_SUPPORTED)return i=null,v.NODE_STREAM_INPUT,"string"==typeof e?(e=(e=>65279!==e.charCodeAt(0)?e:e.slice(1))(e),i=new(t.download?f:c)(t)):true===e.readable&&U(e.read)&&U(e.on)?i=new p(t):(n.File&&e instanceof File||e instanceof Object)&&(i=new l(t)),i.stream(e);(i=(()=>{var e;return !!v.WORKERS_SUPPORTED&&(e=(()=>{var e=n.URL||n.webkitURL||null,t=r.toString();return v.BLOB_URL||(v.BLOB_URL=e.createObjectURL(new Blob(["var global = (function() { if (typeof self !== 'undefined') { return self; } if (typeof window !== 'undefined') { return window; } if (typeof global !== 'undefined') { return global; } return {}; })(); global.IS_PAPA_WORKER=true; ","(",t,")();"],{type:"text/javascript"})))})(),(e=new n.Worker(e)).onmessage=g,e.id=h++,o[e.id]=e)})()).userStep=t.step,i.userChunk=t.chunk,i.userComplete=t.complete,i.userError=t.error,t.step=U(t.step),t.chunk=U(t.chunk),t.complete=U(t.complete),t.error=U(t.error),delete t.worker,i.postMessage({input:e,config:t,workerId:i.id});},v.unparse=function(e,t){var n=false,_=true,m=",",y="\r\n",s='"',a=s+s,i=false,r=null,o=false,h=((()=>{if("object"==typeof t){if("string"!=typeof t.delimiter||v.BAD_DELIMITERS.filter(function(e){return  -1!==t.delimiter.indexOf(e)}).length||(m=t.delimiter),"boolean"!=typeof t.quotes&&"function"!=typeof t.quotes&&!Array.isArray(t.quotes)||(n=t.quotes),"boolean"!=typeof t.skipEmptyLines&&"string"!=typeof t.skipEmptyLines||(i=t.skipEmptyLines),"string"==typeof t.newline&&(y=t.newline),"string"==typeof t.quoteChar&&(s=t.quoteChar),"boolean"==typeof t.header&&(_=t.header),Array.isArray(t.columns)){if(0===t.columns.length)throw new Error("Option columns is empty");r=t.columns;} void 0!==t.escapeChar&&(a=t.escapeChar+s),t.escapeFormulae instanceof RegExp?o=t.escapeFormulae:"boolean"==typeof t.escapeFormulae&&t.escapeFormulae&&(o=/^[=+\-@\t\r].*$/);}})(),new RegExp(P(s),"g"));"string"==typeof e&&(e=JSON.parse(e));if(Array.isArray(e)){if(!e.length||Array.isArray(e[0]))return u(null,e,i);if("object"==typeof e[0])return u(r||Object.keys(e[0]),e,i)}else if("object"==typeof e)return "string"==typeof e.data&&(e.data=JSON.parse(e.data)),Array.isArray(e.data)&&(e.fields||(e.fields=e.meta&&e.meta.fields||r),e.fields||(e.fields=Array.isArray(e.data[0])?e.fields:"object"==typeof e.data[0]?Object.keys(e.data[0]):[]),Array.isArray(e.data[0])||"object"==typeof e.data[0]||(e.data=[e.data])),u(e.fields||[],e.data||[],i);throw new Error("Unable to serialize unrecognized input");function u(e,t,i){var r="",n=("string"==typeof e&&(e=JSON.parse(e)),"string"==typeof t&&(t=JSON.parse(t)),Array.isArray(e)&&0<e.length),s=!Array.isArray(t[0]);if(n&&_){for(var a=0;a<e.length;a++)0<a&&(r+=m),r+=k(e[a],a);0<t.length&&(r+=y);}for(var o=0;o<t.length;o++){var h=(n?e:t[o]).length,u=false,d=n?0===Object.keys(t[o]).length:0===t[o].length;if(i&&!n&&(u="greedy"===i?""===t[o].join("").trim():1===t[o].length&&0===t[o][0].length),"greedy"===i&&n){for(var f=[],l=0;l<h;l++){var c=s?e[l]:l;f.push(t[o][c]);}u=""===f.join("").trim();}if(!u){for(var p=0;p<h;p++){0<p&&!d&&(r+=m);var g=n&&s?e[p]:p;r+=k(t[o][g],p);}o<t.length-1&&(!i||0<h&&!d)&&(r+=y);}}return r}function k(e,t){var i,r;return null==e?"":e.constructor===Date?JSON.stringify(e).slice(1,25):(r=false,o&&"string"==typeof e&&o.test(e)&&(e="'"+e,r=true),i=e.toString().replace(h,a),(r=r||true===n||"function"==typeof n&&n(e,t)||Array.isArray(n)&&n[t]||((e,t)=>{for(var i=0;i<t.length;i++)if(-1<e.indexOf(t[i]))return  true;return  false})(i,v.BAD_DELIMITERS)||-1<i.indexOf(m)||" "===i.charAt(0)||" "===i.charAt(i.length-1))?s+i+s:i)}},v.RECORD_SEP=String.fromCharCode(30),v.UNIT_SEP=String.fromCharCode(31),v.BYTE_ORDER_MARK="\ufeff",v.BAD_DELIMITERS=["\r","\n",'"',v.BYTE_ORDER_MARK],v.WORKERS_SUPPORTED=!s&&!!n.Worker,v.NODE_STREAM_INPUT=1,v.LocalChunkSize=10485760,v.RemoteChunkSize=5242880,v.DefaultDelimiter=",",v.Parser=E,v.ParserHandle=i,v.NetworkStreamer=f,v.FileStreamer=l,v.StringStreamer=c,v.ReadableStreamStreamer=p,n.jQuery&&((d=n.jQuery).fn.parse=function(o){var i=o.config||{},h=[];return this.each(function(e){if(!("INPUT"===d(this).prop("tagName").toUpperCase()&&"file"===d(this).attr("type").toLowerCase()&&n.FileReader)||!this.files||0===this.files.length)return  true;for(var t=0;t<this.files.length;t++)h.push({file:this.files[t],inputElem:this,instanceConfig:d.extend({},i)});}),e(),this;function e(){if(0===h.length)U(o.complete)&&o.complete();else {var e,t,i,r,n=h[0];if(U(o.before)){var s=o.before(n.file,n.inputElem);if("object"==typeof s){if("abort"===s.action)return e="AbortError",t=n.file,i=n.inputElem,r=s.reason,void(U(o.error)&&o.error({name:e},t,i,r));if("skip"===s.action)return void u();"object"==typeof s.config&&(n.instanceConfig=d.extend(n.instanceConfig,s.config));}else if("skip"===s)return void u()}var a=n.instanceConfig.complete;n.instanceConfig.complete=function(e){U(a)&&a(e,n.file,n.inputElem),u();},v.parse(n.file,n.instanceConfig);}}function u(){h.splice(0,1),e();}}),a&&(n.onmessage=function(e){e=e.data;void 0===v.WORKER_ID&&e&&(v.WORKER_ID=e.workerId);"string"==typeof e.input?n.postMessage({workerId:v.WORKER_ID,results:v.parse(e.input,e.config),finished:true}):(n.File&&e.input instanceof File||e.input instanceof Object)&&(e=v.parse(e.input,e.config))&&n.postMessage({workerId:v.WORKER_ID,results:e,finished:true});}),(f.prototype=Object.create(u.prototype)).constructor=f,(l.prototype=Object.create(u.prototype)).constructor=l,(c.prototype=Object.create(c.prototype)).constructor=c,(p.prototype=Object.create(u.prototype)).constructor=p,v}); 
} (papaparse_min$1));

var papaparse_minExports = papaparse_min$1.exports;
const bu = /*@__PURE__*/getDefaultExportFromCjs(papaparse_minExports);

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

var na=Object.defineProperty;var o=(e,t)=>na(e,"name",{value:t,configurable:true});var Xo=React.createContext({}),Zo=o(({children:e,isProvided:t,...r})=>{let{replace:s}=he(),n=o(async c=>{var p;try{return await((p=r.login)==null?void 0:p.call(r,c))}catch(l){return Promise.reject(l)}},"loginFunc"),i=o(async c=>{var p;try{return await((p=r.register)==null?void 0:p.call(r,c))}catch(l){return Promise.reject(l)}},"registerFunc"),a=o(async c=>{var p;try{return await((p=r.logout)==null?void 0:p.call(r,c))}catch(l){return Promise.reject(l)}},"logoutFunc"),u=o(async c=>{var p;try{return await((p=r.checkAuth)==null?void 0:p.call(r,c)),Promise.resolve()}catch(l){return l!=null&&l.redirectPath&&s(l.redirectPath),Promise.reject(l)}},"checkAuthFunc");return React.createElement(Xo.Provider,{value:{...r,login:n,logout:a,checkAuth:u,register:i,isProvided:t}},e)},"LegacyAuthContextProvider"),Yo=React.createContext({}),Jo=o(({children:e,isProvided:t,...r})=>{let s=o(async p=>{var l;try{return await((l=r.login)==null?void 0:l.call(r,p))}catch(m){return console.warn("Unhandled Error in login: refine always expects a resolved promise.",m),Promise.reject(m)}},"handleLogin"),n=o(async p=>{var l;try{return await((l=r.register)==null?void 0:l.call(r,p))}catch(m){return console.warn("Unhandled Error in register: refine always expects a resolved promise.",m),Promise.reject(m)}},"handleRegister"),i=o(async p=>{var l;try{return await((l=r.logout)==null?void 0:l.call(r,p))}catch(m){return console.warn("Unhandled Error in logout: refine always expects a resolved promise.",m),Promise.reject(m)}},"handleLogout"),a=o(async p=>{var l;try{let m=await((l=r.check)==null?void 0:l.call(r,p));return Promise.resolve(m)}catch(m){return console.warn("Unhandled Error in check: refine always expects a resolved promise.",m),Promise.reject(m)}},"handleCheck"),u=o(async p=>{var l;try{let m=await((l=r.forgotPassword)==null?void 0:l.call(r,p));return Promise.resolve(m)}catch(m){return console.warn("Unhandled Error in forgotPassword: refine always expects a resolved promise.",m),Promise.reject(m)}},"handleForgotPassword"),c=o(async p=>{var l;try{let m=await((l=r.updatePassword)==null?void 0:l.call(r,p));return Promise.resolve(m)}catch(m){return console.warn("Unhandled Error in updatePassword: refine always expects a resolved promise.",m),Promise.reject(m)}},"handleUpdatePassword");return React.createElement(Yo.Provider,{value:{...r,login:s,logout:i,check:a,register:n,forgotPassword:u,updatePassword:c,isProvided:t}},e)},"AuthBindingsContextProvider"),xe=o(()=>React.useContext(Xo),"useLegacyAuthContext"),Ue=o(()=>React.useContext(Yo),"useAuthBindingsContext");var Bt=o(e=>e/1e3,"userFriendlySecond");var sr=o((e,t=r=>r)=>{let[r,...s]=e;return s.map(n=>fromPairs(zip(r,n))).map((n,i,a)=>t.call(void 0,n,i,a))},"importCSVMapper");var nr=o((e="",t)=>{let r=Kt(e);return t==="singular"?us.singular(r):us.plural(r)},"userFriendlyResourceName");var es=o((e={})=>e!=null&&e.id?{...e,id:decodeURIComponent(e.id)}:e,"handleUseParams");function pt(e,t){return e.findIndex((r,s)=>s<=e.length-t.length&&t.every((n,i)=>e[s+i]===n))}o(pt,"arrayFindIndex");function ua(e){if(e[0]==="data"){let t=e.slice(1);if(t[2]==="many")t[2]="getMany";else if(t[2]==="infinite")t[2]="list";else if(t[2]==="one")t[2]="detail";else if(t[1]==="custom"){let r={...t[2]};return delete r.method,delete r.url,[t[0],t[1],t[2].method,t[2].url,r]}return t}if(e[0]==="audit"&&e[2]==="list")return ["logList",e[1],e[3]];if(e[0]==="access"&&e.length===4)return ["useCan",{resource:e[1],action:e[2],...e[3]}];if(e[0]==="auth"){if(pt(e,["auth","login"])!==-1)return ["useLogin"];if(pt(e,["auth","logout"])!==-1)return ["useLogout"];if(pt(e,["auth","identity"])!==-1)return ["getUserIdentity"];if(pt(e,["auth","register"])!==-1)return ["useRegister"];if(pt(e,["auth","forgotPassword"])!==-1)return ["useForgotPassword"];if(pt(e,["auth","check"])!==-1)return ["useAuthenticated",e[2]];if(pt(e,["auth","onError"])!==-1)return ["useCheckError"];if(pt(e,["auth","permissions"])!==-1)return ["usePermissions"];if(pt(e,["auth","updatePassword"])!==-1)return ["useUpdatePassword"]}return e}o(ua,"convertToLegacy");var Oe=class{constructor(t=[]){this.segments=[];this.segments=t;}key(){return this.segments}legacy(){return ua(this.segments)}get(t){return t?this.legacy():this.segments}};o(Oe,"BaseKeyBuilder");var st=class extends Oe{params(t){return new Oe([...this.segments,t])}};o(st,"ParamsKeyBuilder");var ar=class extends Oe{id(t){return new st([...this.segments,t?String(t):void 0])}};o(ar,"DataIdRequiringKeyBuilder");var ir=class extends Oe{ids(...t){return new st([...this.segments,...t.length?[t.map(r=>String(r))]:[]])}};o(ir,"DataIdsRequiringKeyBuilder");var ur=class extends Oe{action(t){if(t==="one")return new ar([...this.segments,t]);if(t==="many")return new ir([...this.segments,t]);if(["list","infinite"].includes(t))return new st([...this.segments,t]);throw new Error("Invalid action type")}};o(ur,"DataResourceKeyBuilder");var cr=class extends Oe{resource(t){return new ur([...this.segments,t])}mutation(t){return new st([...t==="custom"?this.segments:[this.segments[0]],t])}};o(cr,"DataKeyBuilder");var pr=class extends Oe{action(t){return new st([...this.segments,t])}};o(pr,"AuthKeyBuilder");var dr=class extends Oe{action(t){return new st([...this.segments,t])}};o(dr,"AccessResourceKeyBuilder");var lr=class extends Oe{resource(t){return new dr([...this.segments,t])}};o(lr,"AccessKeyBuilder");var mr=class extends Oe{action(t){return new st([...this.segments,t])}};o(mr,"AuditActionKeyBuilder");var fr=class extends Oe{resource(t){return new mr([...this.segments,t])}action(t){return new st([...this.segments,t])}};o(fr,"AuditKeyBuilder");var wt=class extends Oe{data(t){return new cr(["data",t||"default"])}auth(){return new pr(["auth"])}access(){return new lr(["access"])}audit(){return new fr(["audit"])}};o(wt,"KeyBuilder");var nt=o(()=>new wt([]),"keys");var I=o((...e)=>e.find(t=>typeof t<"u"),"pickNotDeprecated");var ts=o((e,t,r,s)=>{let n=t||"default",i={all:[n],resourceAll:[n,e||""],list:a=>[...i.resourceAll,"list",{...a,...I(r,s)||{}}],many:a=>[...i.resourceAll,"getMany",a==null?void 0:a.map(String),{...I(r,s)||{}}].filter(u=>u!==void 0),detail:a=>[...i.resourceAll,"detail",a==null?void 0:a.toString(),{...I(r,s)||{}}],logList:a=>["logList",e,a,s].filter(u=>u!==void 0)};return i},"queryKeys"),dt=o(e=>(t,r,s,n)=>{let i=r||"default";return {all:nt().data(i).get(e),resourceAll:nt().data(r).resource(t??"").get(e),list:u=>nt().data(r).resource(t??"").action("list").params({...u,...I(s,n)||{}}).get(e),many:u=>nt().data(r).resource(t??"").action("many").ids(...u??[]).params({...I(s,n)||{}}).get(e),detail:u=>nt().data(r).resource(t??"").action("one").id(u??"").params({...I(s,n)||{}}).get(e),logList:u=>[...nt().audit().resource(t).action("list").params(u).get(e),n].filter(c=>c!==void 0)}},"queryKeysReplacement");var Xr=o((e,t)=>!e||!t?false:!!e.find(r=>r===t),"hasPermission");var It=o(e=>e.startsWith(":"),"isParameter");var it=o(e=>e.split("/").filter(r=>r!==""),"splitToSegments");var rs=o((e,t)=>{let r=it(e),s=it(t);return r.length===s.length},"isSegmentCountsSame");var ke=o(e=>e.replace(/^\/|\/$/g,""),"removeLeadingTrailingSlashes");var os=o((e,t)=>{let r=ke(e),s=ke(t);if(!rs(r,s))return  false;let n=it(r);return it(s).every((a,u)=>It(a)||a===n[u])},"checkBySegments");var ss=o((e,t,r)=>{let s=ke(r||""),n=`${s}${s?"/":""}${e}`;return t==="list"?n=`${n}`:t==="create"?n=`${n}/create`:t==="edit"?n=`${n}/edit/:id`:t==="show"?n=`${n}/show/:id`:t==="clone"&&(n=`${n}/clone/:id`),`/${n.replace(/^\//,"")}`},"getDefaultActionPath");var ze=o((e,t)=>{var n,i;let r=I((n=e.meta)==null?void 0:n.parent,(i=e.options)==null?void 0:i.parent,e.parentName);return r?t.find(a=>(a.identifier??a.name)===r)??{name:r}:void 0},"getParentResource");var Gt=o((e,t,r)=>{let s=[],n=ze(e,t);for(;n;)s.push(n),n=ze(n,t);if(s.length!==0)return `/${s.reverse().map(i=>{var u;let a=r?((u=i.options)==null?void 0:u.route)??i.name:i.name;return ke(a)}).join("/")}`},"getParentPrefixForResource");var Se=o((e,t,r)=>{let s=[],n=["list","show","edit","create","clone"],i=Gt(e,t,r);return n.forEach(a=>{var p,l;let u=r&&a==="clone"?e.create:e[a],c;typeof u=="function"||r?c=ss(r?((p=e.meta)==null?void 0:p.route)??((l=e.options)==null?void 0:l.route)??e.name:e.name,a,r?i:void 0):typeof u=="string"?c=u:typeof u=="object"&&(c=u.path),c&&s.push({action:a,resource:e,route:`/${c.replace(/^\//,"")}`});}),s},"getActionRoutesFromResource");var ns=o(e=>{var n;if(e.length===0)return;if(e.length===1)return e[0];let t=e.map(i=>({...i,splitted:it(ke(i.route))})),r=((n=t[0])==null?void 0:n.splitted.length)??0,s=[...t];for(let i=0;i<r;i++){let a=s.filter(u=>!It(u.splitted[i]));if(a.length!==0){if(a.length===1){s=a;break}s=a;}}return s[0]},"pickMatchedRoute");var as=o((e,t)=>{let s=t.flatMap(i=>Se(i,t)).filter(i=>os(e,i.route)),n=ns(s);return {found:!!n,resource:n==null?void 0:n.resource,action:n==null?void 0:n.action,matchedRoute:n==null?void 0:n.route}},"matchResourceFromRoute");var yr=o((e,t)=>{var n;let r,s=Gt(e,t,true);if(s){let i=I(e.meta,e.options);r=`${s}/${(i==null?void 0:i.route)??e.name}`;}else r=((n=e.options)==null?void 0:n.route)??e.name;return `/${r.replace(/^\//,"")}`},"routeGenerator");var is=o(e=>{var a;let t=[],r={},s={},n,i;for(let u=0;u<e.length;u++){n=e[u];let c=n.route??((a=I(n==null?void 0:n.meta,n.options))==null?void 0:a.route)??"";r[c]=n,r[c].children=[],s[n.name]=n,s[n.name].children=[];}for(let u in r)Object.hasOwn(r,u)&&(i=r[u],i.parentName&&s[i.parentName]?s[i.parentName].children.push(i):t.push(i));return t},"createTreeView");var Kt=o(e=>(e=e.replace(/([a-z]{1})([A-Z]{1})/g,"$1-$2"),e=e.replace(/([A-Z]{1})([A-Z]{1})([a-z]{1})/g,"$1-$2$3"),e=e.toLowerCase().replace(/[_-]+/g," ").replace(/\s{2,}/g," ").trim(),e=e.charAt(0).toUpperCase()+e.slice(1),e),"humanizeString");var Zr=o(({children:e})=>React.createElement("div",null,e),"DefaultLayout");var pa={icon:React.createElement("svg",{width:24,height:24,viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg","data-testid":"refine-logo",id:"refine-default-logo"},React.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M13.7889 0.422291C12.6627 -0.140764 11.3373 -0.140764 10.2111 0.422291L2.21115 4.42229C0.85601 5.09986 0 6.48491 0 8V16C0 17.5151 0.85601 18.9001 2.21115 19.5777L10.2111 23.5777C11.3373 24.1408 12.6627 24.1408 13.7889 23.5777L21.7889 19.5777C23.144 18.9001 24 17.5151 24 16V8C24 6.48491 23.144 5.09986 21.7889 4.42229L13.7889 0.422291ZM8 8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8V16C16 18.2091 14.2091 20 12 20C9.79086 20 8 18.2091 8 16V8Z",fill:"currentColor"}),React.createElement("path",{d:"M14 8C14 9.10457 13.1046 10 12 10C10.8954 10 10 9.10457 10 8C10 6.89543 10.8954 6 12 6C13.1046 6 14 6.89543 14 8Z",fill:"currentColor"})),text:"Refine Project"},Fe={mutationMode:"pessimistic",syncWithLocation:false,undoableTimeout:5e3,warnWhenUnsavedChanges:false,liveMode:"off",redirect:{afterCreate:"list",afterClone:"list",afterEdit:"list"},overtime:{enabled:true,interval:1e3},textTransformers:{humanize:Kt,plural:us.plural,singular:us.singular},disableServerSideValidation:false,title:pa},Qe=React.createContext({hasDashboard:false,mutationMode:"pessimistic",warnWhenUnsavedChanges:false,syncWithLocation:false,undoableTimeout:5e3,Title:void 0,Sider:void 0,Header:void 0,Footer:void 0,Layout:Zr,OffLayoutArea:void 0,liveMode:"off",onLiveEvent:void 0,options:Fe}),cs=o(({hasDashboard:e,mutationMode:t,warnWhenUnsavedChanges:r,syncWithLocation:s,undoableTimeout:n,children:i,DashboardPage:a,Title:u,Layout:c=Zr,Header:p,Sider:l,Footer:m,OffLayoutArea:y,LoginPage:d=Yr,catchAll:T,liveMode:x="off",onLiveEvent:v,options:f})=>React.createElement(Qe.Provider,{value:{__initialized:true,hasDashboard:e,mutationMode:t,warnWhenUnsavedChanges:r,syncWithLocation:s,Title:u,undoableTimeout:n,Layout:c,Header:p,Sider:l,Footer:m,OffLayoutArea:y,DashboardPage:a,LoginPage:d,catchAll:T,liveMode:x,onLiveEvent:v,options:f}},i),"RefineContextProvider");var Jr=o(({options:e,disableTelemetry:t,liveMode:r,mutationMode:s,reactQueryClientConfig:n,reactQueryDevtoolConfig:i,syncWithLocation:a,undoableTimeout:u,warnWhenUnsavedChanges:c}={})=>{var y,d,T,x,v,f,P,M,Q,g,C,h;let p={breadcrumb:e==null?void 0:e.breadcrumb,mutationMode:(e==null?void 0:e.mutationMode)??s??Fe.mutationMode,undoableTimeout:(e==null?void 0:e.undoableTimeout)??u??Fe.undoableTimeout,syncWithLocation:(e==null?void 0:e.syncWithLocation)??a??Fe.syncWithLocation,warnWhenUnsavedChanges:(e==null?void 0:e.warnWhenUnsavedChanges)??c??Fe.warnWhenUnsavedChanges,liveMode:(e==null?void 0:e.liveMode)??r??Fe.liveMode,redirect:{afterCreate:((y=e==null?void 0:e.redirect)==null?void 0:y.afterCreate)??Fe.redirect.afterCreate,afterClone:((d=e==null?void 0:e.redirect)==null?void 0:d.afterClone)??Fe.redirect.afterClone,afterEdit:((T=e==null?void 0:e.redirect)==null?void 0:T.afterEdit)??Fe.redirect.afterEdit},overtime:(e==null?void 0:e.overtime)??Fe.overtime,textTransformers:{humanize:((x=e==null?void 0:e.textTransformers)==null?void 0:x.humanize)??Fe.textTransformers.humanize,plural:((v=e==null?void 0:e.textTransformers)==null?void 0:v.plural)??Fe.textTransformers.plural,singular:((f=e==null?void 0:e.textTransformers)==null?void 0:f.singular)??Fe.textTransformers.singular},disableServerSideValidation:(e==null?void 0:e.disableServerSideValidation)??Fe.disableServerSideValidation,projectId:e==null?void 0:e.projectId,useNewQueryKeys:e==null?void 0:e.useNewQueryKeys,title:{icon:typeof((P=e==null?void 0:e.title)==null?void 0:P.icon)>"u"?Fe.title.icon:(M=e==null?void 0:e.title)==null?void 0:M.icon,text:typeof((Q=e==null?void 0:e.title)==null?void 0:Q.text)>"u"?Fe.title.text:(g=e==null?void 0:e.title)==null?void 0:g.text}},l=(e==null?void 0:e.disableTelemetry)??t??false,m={clientConfig:((C=e==null?void 0:e.reactQuery)==null?void 0:C.clientConfig)??n??{},devtoolConfig:((h=e==null?void 0:e.reactQuery)==null?void 0:h.devtoolConfig)??i??{}};return {optionsWithDefaults:p,disableTelemetryWithDefault:l,reactQueryWithDefaults:m}},"handleRefineOptions");var qr=o(({redirectFromProps:e,action:t,redirectOptions:r})=>{if(e||e===false)return e;switch(t){case "clone":return r.afterClone;case "create":return r.afterCreate;case "edit":return r.afterEdit;default:return  false}},"redirectPage");var gr=o(async(e,t,r)=>{let s=[];for(let[n,i]of e.entries())try{let a=await i();s.push(t(a,n));}catch(a){s.push(r(a,n));}return s},"sequentialPromises");var Ee=o((e,t=[],r=false)=>{if(!e)return;if(r){let n=t.find(a=>ke(a.route??"")===ke(e));return n||t.find(a=>a.name===e)}let s=t.find(n=>n.identifier===e);return s||(s=t.find(n=>n.name===e)),s},"pickResource");var ee=o((e,t,r)=>{if(t)return t;let s=Ee(e,r),n=I(s==null?void 0:s.meta,s==null?void 0:s.options);return n!=null&&n.dataProviderName?n.dataProviderName:"default"},"pickDataProvider");var lt=o(async e=>({data:(await Promise.all(e)).map(t=>t.data)}),"handleMultiple");var Tr=o(e=>{let{pagination:t,cursor:r}=e;if(r!=null&&r.next)return r.next;let s=(t==null?void 0:t.current)||1,n=(t==null?void 0:t.pageSize)||10,i=Math.ceil((e.total||0)/n);return s<i?Number(s)+1:void 0},"getNextPageParam"),xr=o(e=>{let{pagination:t,cursor:r}=e;if(r!=null&&r.prev)return r.prev;let s=(t==null?void 0:t.current)||1;return s===1?void 0:s-1},"getPreviousPageParam");var hr=o(e=>{let t=[];return e.forEach(r=>{var s,n;t.push({...r,label:((s=r.meta)==null?void 0:s.label)??((n=r.options)==null?void 0:n.label),route:yr(r,e),canCreate:!!r.create,canEdit:!!r.edit,canShow:!!r.show,canDelete:r.canDelete});}),t},"legacyResourceTransform");var ps=o(e=>it(ke(e)).flatMap(r=>It(r)?[r.slice(1)]:[]),"pickRouteParams");var ds=o((e,t={})=>e.reduce((r,s)=>{let n=t[s];return typeof n<"u"&&(r[s]=n),r},{}),"prepareRouteParams");var We=o((e,t={},r={},s={})=>{let n=ps(e),i=ds(n,{...t,...typeof(r==null?void 0:r.id)<"u"?{id:r.id}:{},...typeof(r==null?void 0:r.action)<"u"?{action:r.action}:{},...typeof(r==null?void 0:r.resource)<"u"?{resource:r.resource}:{},...r==null?void 0:r.params,...s});return e.replace(/:([^\/]+)/g,(a,u)=>{let c=i[u];return typeof c<"u"?`${c}`:a})},"composeRoute");var ie=o(()=>{let e=xe(),t=Ue();return t.isProvided?{isLegacy:false,...t}:e.isProvided?{isLegacy:true,...e,check:e.checkAuth,onError:e.checkError,getIdentity:e.getUserIdentity}:null},"useActiveAuthProvider");var Wt=o(({hasPagination:e,pagination:t,configPagination:r}={})=>{let s=e===false?"off":"server",n=(t==null?void 0:t.mode)??s,i=I(t==null?void 0:t.current,r==null?void 0:r.current)??1,a=I(t==null?void 0:t.pageSize,r==null?void 0:r.pageSize)??10;return {current:i,pageSize:a,mode:n}},"handlePaginationParams");var Pr=o(e=>{let[t,r]=core_core__loadShare__react__loadShare__.useState(false);return core_core__loadShare__react__loadShare__.useEffect(()=>{let s=window.matchMedia(e);s.matches!==t&&r(s.matches);let n=o(()=>r(s.matches),"listener");return window.addEventListener("resize",n),()=>window.removeEventListener("resize",n)},[t,e]),t},"useMediaQuery");var Rr=o((e,t,r,s)=>{let n=s?e(t,s,r):e(t,r),i=r??t;return n===t||typeof n>"u"?i:n},"safeTranslate");function ls(e,t,r,s,n){var y;let i={create:"Create new ",clone:`#${s??""} Clone `,edit:`#${s??""} Edit `,show:`#${s??""} Show `,list:""},a=(t==null?void 0:t.identifier)??(t==null?void 0:t.name),u=(t==null?void 0:t.label)??((y=t==null?void 0:t.meta)==null?void 0:y.label)??nr(a,r==="list"?"plural":"singular"),c=n??u,p=Rr(e,"documentTitle.default","Refine"),l=Rr(e,"documentTitle.suffix"," | Refine"),m=p;return r&&a&&(m=Rr(e,`documentTitle.${a}.${r}`,`${i[r]??""}${c}${l}`,{id:s})),m}o(ls,"generateDefaultDocumentTitle");var _e=o((e,t)=>{let{mutationMode:r,undoableTimeout:s}=core_core__loadShare__react__loadShare__.useContext(Qe);return {mutationMode:e??r,undoableTimeout:t??s}},"useMutationMode");var eo=React.createContext({}),fs=o(({children:e})=>{let[t,r]=core_core__loadShare__react__loadShare__.useState(false);return React.createElement(eo.Provider,{value:{warnWhen:t,setWarnWhen:r}},e)},"UnsavedWarnContextProvider");var vt=o(()=>{let{warnWhenUnsavedChanges:e}=core_core__loadShare__react__loadShare__.useContext(Qe),{warnWhen:t,setWarnWhen:r}=core_core__loadShare__react__loadShare__.useContext(eo);return {warnWhenUnsavedChanges:e,warnWhen:!!t,setWarnWhen:r??(()=>{})}},"useWarnAboutChange");var to=o(()=>{let{syncWithLocation:e}=core_core__loadShare__react__loadShare__.useContext(Qe);return {syncWithLocation:e}},"useSyncWithLocation");var Ta=o(()=>{let{Title:e}=core_core__loadShare__react__loadShare__.useContext(Qe);return e},"useTitle");var ge=o(()=>{let{Footer:e,Header:t,Layout:r,OffLayoutArea:s,Sider:n,Title:i,hasDashboard:a,mutationMode:u,syncWithLocation:c,undoableTimeout:p,warnWhenUnsavedChanges:l,DashboardPage:m,LoginPage:y,catchAll:d,options:T,__initialized:x}=core_core__loadShare__react__loadShare__.useContext(Qe);return {__initialized:x,Footer:e,Header:t,Layout:r,OffLayoutArea:s,Sider:n,Title:i,hasDashboard:a,mutationMode:u,syncWithLocation:c,undoableTimeout:p,warnWhenUnsavedChanges:l,DashboardPage:m,LoginPage:y,catchAll:d,options:T}},"useRefineContext");var ht=o(()=>{let{options:{textTransformers:e}}=ge();return o((r="",s)=>{let n=e.humanize(r);return s==="singular"?e.singular(n):e.plural(n)},"getFriendlyName")},"useUserFriendlyName");var gs=o(e=>typeof e=="object"&&e!==null,"isNested"),ha=o(e=>Array.isArray(e),"isArray"),Cr=o((e,t="")=>gs(e)?Object.keys(e).reduce((r,s)=>{let n=t.length?`${t}.`:"";return gs(e[s])&&Object.keys(e[s]).length&&(ha(e[s])&&e[s].length?e[s].forEach((i,a)=>{Object.assign(r,Cr(i,`${n+s}.${a}`));}):Object.assign(r,Cr(e[s],n+s))),r[n+s]=e[s],r},{}):{[t]:e},"flattenObjectKeys");var Ts=o(e=>e.split(".").map(t=>Number.isNaN(Number(t))?t:Number(t)),"propertyPathToArray");var ro=o((e,t,r)=>{if(typeof window>"u")return;let s=new Blob([t],{type:r}),n=document.createElement("a");n.setAttribute("visibility","hidden"),n.download=e;let i=URL.createObjectURL(s);n.href=i,document.body.appendChild(n),n.click(),document.body.removeChild(n),setTimeout(()=>{URL.revokeObjectURL(i);});},"downloadInBrowser");var br=o(e=>{setTimeout(e,0);},"deferExecution");var oo=o((e,t=1e3,r)=>{let s=[],n=o(()=>{s.forEach(u=>{var c;return (c=u.reject)==null?void 0:c.call(u,r)}),s=[];},"cancelPrevious"),i=debounce((...u)=>{let{resolve:c,reject:p}=s.pop()||{};Promise.resolve(e(...u)).then(c).catch(p);},t),a=o((...u)=>new Promise((c,p)=>{n(),s.push({resolve:c,reject:p}),i(...u);}),"runner");return a.flush=()=>i.flush(),a.cancel=()=>{i.cancel(),n();},a},"asyncDebounce");var je=o(e=>{let t={queryKey:e.queryKey,pageParam:e.pageParam};return Object.defineProperty(t,"signal",{enumerable:true,get:()=>e.signal}),t},"prepareQueryContext");var vr=o(e=>{let{current:t,pageSize:r,sorter:s,sorters:n,filters:i}=Dn.parse(e.substring(1));return {parsedCurrent:t&&Number(t),parsedPageSize:r&&Number(r),parsedSorter:I(n,s)??[],parsedFilters:i??[]}},"parseTableParams"),Ca=o(e=>{let t=Dn.stringify(e);return vr(`/${t}`)},"parseTableParamsFromQuery"),Dr=o(e=>{let t={skipNulls:true,arrayFormat:"indices",encode:false},{pagination:r,sorter:s,sorters:n,filters:i,...a}=e;return Dn.stringify({...a,...r||{},sorters:I(n,s),filters:i},t)},"stringifyTableParams"),Ps=o((e,t)=>e.operator!=="and"&&e.operator!=="or"&&t.operator!=="and"&&t.operator!=="or"?("field"in e?e.field:void 0)===("field"in t?t.field:void 0)&&e.operator===t.operator:("key"in e?e.key:void 0)===("key"in t?t.key:void 0)&&e.operator===t.operator,"compareFilters"),Rs=o((e,t)=>e.field===t.field,"compareSorters"),St=o((e,t,r=[])=>(t.filter(n=>(n.operator==="or"||n.operator==="and")&&!n.key).length>1&&$u(true,`[conditionalFilters]: You have created multiple Conditional Filters at the top level, this requires the key parameter. 
For more information, see https://refine.dev/docs/advanced-tutorials/data-provider/handling-filters/#top-level-multiple-conditional-filters-usage`),unionWith(e,t,r,Ps).filter(n=>n.value!==void 0&&n.value!==null&&(n.operator!=="or"||n.operator==="or"&&n.value.length!==0)&&(n.operator!=="and"||n.operator==="and"&&n.value.length!==0))),"unionFilters"),Ur=o((e,t)=>unionWith(e,t,Rs).filter(r=>r.order!==void 0&&r.order!==null),"unionSorters"),Er=o((e,t)=>[...differenceWith(t,e,Ps),...e],"setInitialFilters"),Lr=o((e,t)=>[...differenceWith(t,e,Rs),...e],"setInitialSorters"),ba=o((e,t)=>{if(!t)return;let r=t.find(s=>s.field===e);if(r)return r.order},"getDefaultSortOrder"),va=o((e,t,r="eq")=>{let s=t==null?void 0:t.find(n=>{if(n.operator!=="or"&&n.operator!=="and"&&"field"in n){let{operator:i,field:a}=n;return a===e&&i===r}});if(s)return s.value||[]},"getDefaultFilter");var Da=o(e=>new Promise((t,r)=>{let s=new FileReader,n=o(()=>{s.result&&(s.removeEventListener("load",n,false),t(s.result));},"resultHandler");s.addEventListener("load",n,false),s.readAsDataURL(e.originFileObj),s.onerror=i=>(s.removeEventListener("load",n,false),r(i));}),"file2Base64");var Z=o(()=>{let{options:{useNewQueryKeys:e}}=ge();return {keys:nt,preferLegacyKeys:!e}},"useKeys");function Ua({v3LegacyAuthProviderCompatible:e=false,options:t,params:r}={}){let{getPermissions:s}=xe(),{getPermissions:n}=Ue(),{keys:i,preferLegacyKeys:a}=Z(),u=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQuery({queryKey:i().auth().action("permissions").get(a),queryFn:n?()=>n(r):()=>Promise.resolve(void 0),enabled:!e&&!!n,...e?{}:t,meta:{...e?{}:t==null?void 0:t.meta,...k("usePermissions",a)}}),c=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQuery({queryKey:[...i().auth().action("permissions").get(a),"v3LegacyAuthProviderCompatible"],queryFn:s?()=>s(r):()=>Promise.resolve(void 0),enabled:e&&!!s,...e?t:{},meta:{...e?t==null?void 0:t.meta:{},...k("usePermissions",a)}});return e?c:u}o(Ua,"usePermissions");function no({v3LegacyAuthProviderCompatible:e=false,queryOptions:t}={}){let{getUserIdentity:r}=xe(),{getIdentity:s}=Ue(),{keys:n,preferLegacyKeys:i}=Z(),a=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQuery({queryKey:n().auth().action("identity").get(i),queryFn:s??(()=>Promise.resolve({})),enabled:!e&&!!s,retry:false,...e===true?{}:t,meta:{...e===true?{}:t==null?void 0:t.meta,...k("useGetIdentity",i)}}),u=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQuery({queryKey:[...n().auth().action("identity").get(i),"v3LegacyAuthProviderCompatible"],queryFn:r??(()=>Promise.resolve({})),enabled:e&&!!r,retry:false,...e?t:{},meta:{...e?t==null?void 0:t.meta:{},...k("useGetIdentity",i)}});return e?u:a}o(no,"useGetIdentity");var Dt=o(()=>{let e=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQueryClient(),{keys:t,preferLegacyKeys:r}=Z();return o(async()=>{await Promise.all(["check","identity","permissions"].map(n=>e.invalidateQueries(t().auth().action(n).get(r))));},"invalidate")},"useInvalidateAuthStore");function Mr({v3LegacyAuthProviderCompatible:e,mutationOptions:t}={}){let r=Dt(),s=oe(),n=Pe(),{push:i}=he(),{open:a,close:u}=He(),{logout:c}=xe(),{logout:p}=Ue(),{keys:l,preferLegacyKeys:m}=Z(),y=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({mutationKey:l().auth().action("logout").get(m),mutationFn:p,onSuccess:async(T,x)=>{let{success:v,error:f,redirectTo:P,successNotification:M}=T,{redirectPath:Q}=x??{},g=Q??P;v&&(u==null||u("useLogout-error"),M&&(a==null||a(La(M)))),(f||!v)&&(a==null||a(ao(f))),g!==false&&(s==="legacy"?i(g??"/login"):g&&n({to:g})),await r();},onError:T=>{a==null||a(ao(T));},...e===true?{}:t,meta:{...e===true?{}:t==null?void 0:t.meta,...k("useLogout",m)}}),d=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({mutationKey:[...l().auth().action("logout").get(m),"v3LegacyAuthProviderCompatible"],mutationFn:c,onSuccess:async(T,x)=>{let v=(x==null?void 0:x.redirectPath)??T;if(v!==false){if(v){s==="legacy"?i(v):n({to:v});return}s==="legacy"?i("/login"):n({to:"/login"}),await r();}},onError:T=>{a==null||a(ao(T));},...e?t:{},meta:{...e?t==null?void 0:t.meta:{},...k("useLogout",m)}});return e?d:y}o(Mr,"useLogout");var ao=o(e=>({key:"useLogout-error",type:"error",message:(e==null?void 0:e.name)||"Logout Error",description:(e==null?void 0:e.message)||"Something went wrong during logout"}),"buildNotification"),La=o(e=>({message:e.message,description:e.description,key:"logout-success",type:"success"}),"buildSuccessNotification");function Ht({v3LegacyAuthProviderCompatible:e,mutationOptions:t}={}){let r=Dt(),s=oe(),n=Pe(),{replace:i}=he(),a=Te(),{useLocation:u}=pe(),{search:c}=u(),{close:p,open:l}=He(),{login:m}=xe(),{login:y}=Ue(),{keys:d,preferLegacyKeys:T}=Z(),x=React.useMemo(()=>{var P;return s==="legacy"?Dn.parse(c,{ignoreQueryPrefix:true}).to:(P=a.params)==null?void 0:P.to},[s,a.params,c]),v=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({mutationKey:d().auth().action("login").get(T),mutationFn:y,onSuccess:async({success:P,redirectTo:M,error:Q,successNotification:g})=>{P&&(p==null||p("login-error"),g&&(l==null||l(Ia(g)))),(Q||!P)&&(l==null||l(io(Q))),x&&P?s==="legacy"?i(x):n({to:x,type:"replace"}):M?s==="legacy"?i(M):n({to:M,type:"replace"}):s==="legacy"&&i("/"),setTimeout(()=>{r();},32);},onError:P=>{l==null||l(io(P));},...e===true?{}:t,meta:{...e===true?{}:t==null?void 0:t.meta,...k("useLogin",T)}}),f=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({mutationKey:[...d().auth().action("login").get(T),"v3LegacyAuthProviderCompatible"],mutationFn:m,onSuccess:async P=>{x&&i(x),P!==false&&!x&&(typeof P=="string"?s==="legacy"?i(P):n({to:P,type:"replace"}):s==="legacy"?i("/"):n({to:"/",type:"replace"})),setTimeout(()=>{r();},32),p==null||p("login-error");},onError:P=>{l==null||l(io(P));},...e?t:{},meta:{...e?t==null?void 0:t.meta:{},...k("useLogin",T)}});return e?f:v}o(Ht,"useLogin");var io=o(e=>({message:(e==null?void 0:e.name)||"Login Error",description:(e==null?void 0:e.message)||"Invalid credentials",key:"login-error",type:"error"}),"buildNotification"),Ia=o(e=>({message:e.message,description:e.description,key:"login-success",type:"success"}),"buildSuccessNotification");function co({v3LegacyAuthProviderCompatible:e,mutationOptions:t}={}){let r=Dt(),s=oe(),n=Pe(),{replace:i}=he(),{register:a}=xe(),{register:u}=Ue(),{close:c,open:p}=He(),{keys:l,preferLegacyKeys:m}=Z(),y=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({mutationKey:l().auth().action("register").get(m),mutationFn:u,onSuccess:async({success:T,redirectTo:x,error:v,successNotification:f})=>{T&&(c==null||c("register-error"),f&&(p==null||p(Sa(f))),await r()),(v||!T)&&(p==null||p(uo(v))),x?s==="legacy"?i(x):n({to:x,type:"replace"}):s==="legacy"&&i("/");},onError:T=>{p==null||p(uo(T));},...e===true?{}:t,meta:{...e===true?{}:t==null?void 0:t.meta,...k("useRegister",m)}}),d=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({mutationKey:[...l().auth().action("register").get(m),"v3LegacyAuthProviderCompatible"],mutationFn:a,onSuccess:async T=>{T!==false&&(T?s==="legacy"?i(T):n({to:T,type:"replace"}):s==="legacy"?i("/"):n({to:"/",type:"replace"}),await r(),c==null||c("register-error"));},onError:T=>{p==null||p(uo(T));},...e?t:{},meta:{...e?t==null?void 0:t.meta:{},...k("useRegister",m)}});return e?d:y}o(co,"useRegister");var uo=o(e=>({message:(e==null?void 0:e.name)||"Register Error",description:(e==null?void 0:e.message)||"Error while registering",key:"register-error",type:"error"}),"buildNotification"),Sa=o(e=>({message:e.message,description:e.description,key:"register-success",type:"success"}),"buildSuccessNotification");function lo({v3LegacyAuthProviderCompatible:e,mutationOptions:t}={}){let r=oe(),s=Pe(),{replace:n}=he(),{forgotPassword:i}=xe(),{forgotPassword:a}=Ue(),{close:u,open:c}=He(),{keys:p,preferLegacyKeys:l}=Z(),m=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({mutationKey:p().auth().action("forgotPassword").get(l),mutationFn:a,onSuccess:({success:d,redirectTo:T,error:x,successNotification:v})=>{d&&(u==null||u("forgot-password-error"),v&&(c==null||c(Aa(v)))),(x||!d)&&(c==null||c(po(x))),T&&(r==="legacy"?n(T):s({to:T,type:"replace"}));},onError:d=>{c==null||c(po(d));},...e===true?{}:t,meta:{...e===true?{}:t==null?void 0:t.meta,...k("useForgotPassword",l)}}),y=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({mutationKey:[...p().auth().action("forgotPassword").get(l),"v3LegacyAuthProviderCompatible"],mutationFn:i,onSuccess:d=>{d!==false&&d&&(r==="legacy"?n(d):s({to:d,type:"replace"})),u==null||u("forgot-password-error");},onError:d=>{c==null||c(po(d));},...e?t:{},meta:{...e?t==null?void 0:t.meta:{},...k("useForgotPassword",l)}});return e?y:m}o(lo,"useForgotPassword");var po=o(e=>({message:(e==null?void 0:e.name)||"Forgot Password Error",description:(e==null?void 0:e.message)||"Error while resetting password",key:"forgot-password-error",type:"error"}),"buildNotification"),Aa=o(e=>({message:e.message,description:e.description,key:"forgot-password-success",type:"success"}),"buildSuccessNotification");function fo({v3LegacyAuthProviderCompatible:e,mutationOptions:t}={}){let r=oe(),s=Pe(),{replace:n}=he(),{updatePassword:i}=xe(),{updatePassword:a}=Ue(),{close:u,open:c}=He(),{keys:p,preferLegacyKeys:l}=Z(),m=Te(),{useLocation:y}=pe(),{search:d}=y(),T=React.useMemo(()=>r==="legacy"?Dn.parse(d,{ignoreQueryPrefix:true})??{}:m.params??{},[d,m,r]),x=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({mutationKey:p().auth().action("updatePassword").get(l),mutationFn:async f=>a==null?void 0:a({...T,...f}),onSuccess:({success:f,redirectTo:P,error:M,successNotification:Q})=>{f&&(u==null||u("update-password-error"),Q&&(c==null||c(Qa(Q)))),(M||!f)&&(c==null||c(mo(M))),P&&(r==="legacy"?n(P):s({to:P,type:"replace"}));},onError:f=>{c==null||c(mo(f));},...e===true?{}:t,meta:{...e===true?{}:t==null?void 0:t.meta,...k("useUpdatePassword",l)}}),v=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({mutationKey:[...p().auth().action("updatePassword").get(l),"v3LegacyAuthProviderCompatible"],mutationFn:async f=>i==null?void 0:i({...T,...f}),onSuccess:f=>{f!==false&&f&&(r==="legacy"?n(f):s({to:f,type:"replace"})),u==null||u("update-password-error");},onError:f=>{c==null||c(mo(f));},...e?t:{},meta:{...e?t==null?void 0:t.meta:{},...k("useUpdatePassword",l)}});return e?v:x}o(fo,"useUpdatePassword");var mo=o(e=>({message:(e==null?void 0:e.name)||"Update Password Error",description:(e==null?void 0:e.message)||"Error while updating password",key:"update-password-error",type:"error"}),"buildNotification"),Qa=o(e=>({message:e.message,description:e.description,key:"update-password-success",type:"success"}),"buildSuccessNotification");function wr({v3LegacyAuthProviderCompatible:e=false,params:t}={}){let{checkAuth:r}=xe(),{check:s}=Ue(),{keys:n,preferLegacyKeys:i}=Z(),a=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQuery({queryKey:n().auth().action("check").params(t).get(i),queryFn:async()=>await(s==null?void 0:s(t))??{},retry:false,enabled:!e,meta:{...k("useIsAuthenticated",i)}}),u=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQuery({queryKey:[...n().auth().action("check").params(t).get(i),"v3LegacyAuthProviderCompatible"],queryFn:async()=>await(r==null?void 0:r(t))??{},retry:false,enabled:e,meta:{...k("useIsAuthenticated",i)}});return e?u:a}o(wr,"useIsAuthenticated");var Va=wr;function Re({v3LegacyAuthProviderCompatible:e=false}={}){let t=oe(),r=Pe(),{replace:s}=he(),{checkError:n}=xe(),{onError:i}=Ue(),{keys:a,preferLegacyKeys:u}=Z(),{mutate:c}=Mr({v3LegacyAuthProviderCompatible:!!e}),{mutate:p}=Mr({v3LegacyAuthProviderCompatible:!!e}),l=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({mutationKey:a().auth().action("onError").get(u),...i?{mutationFn:i,onSuccess:({logout:y,redirectTo:d})=>{if(y){p({redirectPath:d});return}if(d){t==="legacy"?s(d):r({to:d,type:"replace"});return}}}:{mutationFn:()=>({})},meta:{...k("useOnError",u)}}),m=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({mutationKey:[...a().auth().action("onError").get(u),"v3LegacyAuthProviderCompatible"],mutationFn:n,onError:y=>{c({redirectPath:y});},meta:{...k("useOnError",u)}});return e?m:l}o(Re,"useOnError");var Na=Re;var yo=o(()=>{let{isProvided:e}=xe(),{isProvided:t}=Ue();return !!(t||e)},"useIsExistAuthentication");var fe=o(({enabled:e,isLoading:t,interval:r,onInterval:s})=>{let[n,i]=core_core__loadShare__react__loadShare__.useState(void 0),{options:a}=ge(),{overtime:u}=a,c=r??u.interval,p=s??(u==null?void 0:u.onInterval),l=typeof e<"u"?e:typeof u.enabled<"u"?u.enabled:true;return core_core__loadShare__react__loadShare__.useEffect(()=>{let m;return l&&t&&(m=setInterval(()=>{i(y=>y===void 0?c:y+c);},c)),()=>{typeof m<"u"&&clearInterval(m),i(void 0);}},[t,c,l]),core_core__loadShare__react__loadShare__.useEffect(()=>{p&&n&&p(n);},[n]),{elapsedTime:n}},"useLoadingOvertime");var $t=o(({resource:e,config:t,filters:r,hasPagination:s,pagination:n,sorters:i,queryOptions:a,successNotification:u,errorNotification:c,meta:p,metaData:l,liveMode:m,onLiveEvent:y,liveParams:d,dataProviderName:T,overtimeOptions:x}={})=>{let{resources:v,resource:f,identifier:P}=q(e),M=le(),Q=z(),g=ie(),{mutate:C}=Re({v3LegacyAuthProviderCompatible:!!(g!=null&&g.isLegacy)}),h=Ce(),D=ue(),{keys:k$1,preferLegacyKeys:E}=Z(),L=ee(P,T,v),U=I(p,l),w=I(r,t==null?void 0:t.filters),N=I(i,t==null?void 0:t.sort),b=I(s,t==null?void 0:t.hasPagination),F=Wt({pagination:n,configPagination:t==null?void 0:t.pagination,hasPagination:b}),V=F.mode==="server",G=D({resource:f,meta:U}),W={meta:G,metaData:G,filters:w,hasPagination:V,pagination:F,sorters:N,config:{...t,sort:N}},K=(a==null?void 0:a.enabled)===void 0||(a==null?void 0:a.enabled)===true,{getList:j}=M(L);Pt({resource:P,types:["*"],params:{meta:G,metaData:G,pagination:F,hasPagination:V,sort:N,sorters:N,filters:w,subscriptionType:"useList",...d},channel:`resources/${f==null?void 0:f.name}`,enabled:K,liveMode:m,onLiveEvent:y,dataProviderName:L,meta:{...p,dataProviderName:T}});let re=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQuery({queryKey:k$1().data(L).resource(P??"").action("list").params({...U||{},filters:w,hasPagination:V,...V&&{pagination:F},...i&&{sorters:i},...(t==null?void 0:t.sort)&&{sort:t==null?void 0:t.sort}}).get(E),queryFn:R=>{let S={...G,queryContext:je(R)};return j({resource:(f==null?void 0:f.name)??"",pagination:F,hasPagination:V,filters:w,sort:N,sorters:N,meta:S,metaData:S})},...a,enabled:typeof(a==null?void 0:a.enabled)<"u"?a==null?void 0:a.enabled:!!(f!=null&&f.name),select:R=>{var X;let S=R,{current:B,mode:H,pageSize:$}=F;return H==="client"&&(S={...S,data:S.data.slice((B-1)*$,B*$),total:S.total}),a!=null&&a.select?(X=a==null?void 0:a.select)==null?void 0:X.call(a,S):S},onSuccess:R=>{var B;(B=a==null?void 0:a.onSuccess)==null||B.call(a,R);let S=typeof u=="function"?u(R,W,P):u;h(S);},onError:R=>{var B;C(R),(B=a==null?void 0:a.onError)==null||B.call(a,R);let S=typeof c=="function"?c(R,W,P):c;h(S,{key:`${P}-useList-notification`,message:Q("notifications.error",{statusCode:R.statusCode},`Error (status code: ${R.statusCode})`),description:R.message,type:"error"});},meta:{...a==null?void 0:a.meta,...k("useList",E,f==null?void 0:f.name)}}),{elapsedTime:te}=fe({...x,isLoading:re.isFetching});return {...re,overtime:{elapsedTime:te}}},"useList");var zt=o(({resource:e,id:t,queryOptions:r,successNotification:s,errorNotification:n,meta:i,metaData:a,liveMode:u,onLiveEvent:c,liveParams:p,dataProviderName:l,overtimeOptions:m})=>{let{resources:y,resource:d,identifier:T}=q(e),x=le(),v=z(),f=ie(),{mutate:P}=Re({v3LegacyAuthProviderCompatible:!!(f!=null&&f.isLegacy)}),M=Ce(),Q=ue(),{keys:g,preferLegacyKeys:C}=Z(),h=I(i,a),D=ee(T,l,y),{getOne:k$1}=x(D),E=Q({resource:d,meta:h});Pt({resource:T,types:["*"],channel:`resources/${d==null?void 0:d.name}`,params:{ids:t?[t]:[],id:t,meta:E,metaData:E,subscriptionType:"useOne",...p},enabled:typeof(r==null?void 0:r.enabled)<"u"?r==null?void 0:r.enabled:typeof(d==null?void 0:d.name)<"u"&&typeof t<"u",liveMode:u,onLiveEvent:c,dataProviderName:D,meta:{...i,dataProviderName:l}});let L=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQuery({queryKey:g().data(D).resource(T??"").action("one").id(t??"").params({...h||{}}).get(C),queryFn:w=>k$1({resource:(d==null?void 0:d.name)??"",id:t,meta:{...E,queryContext:je(w)},metaData:{...E,queryContext:je(w)}}),...r,enabled:typeof(r==null?void 0:r.enabled)<"u"?r==null?void 0:r.enabled:typeof t<"u",onSuccess:w=>{var b;(b=r==null?void 0:r.onSuccess)==null||b.call(r,w);let N=typeof s=="function"?s(w,{id:t,...E},T):s;M(N);},onError:w=>{var b;P(w),(b=r==null?void 0:r.onError)==null||b.call(r,w);let N=typeof n=="function"?n(w,{id:t,...E},T):n;M(N,{key:`${t}-${T}-getOne-notification`,message:v("notifications.error",{statusCode:w.statusCode},`Error (status code: ${w.statusCode})`),description:w.message,type:"error"});},meta:{...r==null?void 0:r.meta,...k("useOne",C,d==null?void 0:d.name)}}),{elapsedTime:U}=fe({...m,isLoading:L.isFetching});return {...L,overtime:{elapsedTime:U}}},"useOne");var go=o(({resource:e,ids:t,queryOptions:r,successNotification:s,errorNotification:n,meta:i,metaData:a,liveMode:u,onLiveEvent:c,liveParams:p,dataProviderName:l,overtimeOptions:m})=>{let{resources:y,resource:d,identifier:T}=q(e),x=le(),v=z(),f=ie(),{mutate:P}=Re({v3LegacyAuthProviderCompatible:!!(f!=null&&f.isLegacy)}),M=Ce(),Q=ue(),{keys:g,preferLegacyKeys:C}=Z(),h=I(i,a),D=ee(T,l,y),k$1=(r==null?void 0:r.enabled)===void 0||(r==null?void 0:r.enabled)===true,{getMany:E,getOne:L}=x(D),U=Q({resource:d,meta:h}),w=Array.isArray(t),N=!!(d!=null&&d.name),b=(r==null?void 0:r.enabled)===true;$u(!w&&!b,za(t,d==null?void 0:d.name)),$u(!N&&!b,_a()),Pt({resource:T,types:["*"],params:{ids:t??[],meta:U,metaData:U,subscriptionType:"useMany",...p},channel:`resources/${(d==null?void 0:d.name)??""}`,enabled:k$1,liveMode:u,onLiveEvent:c,dataProviderName:D,meta:{...i,dataProviderName:l}});let F=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQuery({queryKey:g().data(D).resource(T).action("many").ids(...t??[]).params({...h||{}}).get(C),queryFn:G=>{let W={...U,queryContext:je(G)};return E?E({resource:d==null?void 0:d.name,ids:t,meta:W,metaData:W}):lt(t.map(K=>L({resource:d==null?void 0:d.name,id:K,meta:W,metaData:W})))},enabled:w&&N,...r,onSuccess:G=>{var K;(K=r==null?void 0:r.onSuccess)==null||K.call(r,G);let W=typeof s=="function"?s(G,t,T):s;M(W);},onError:G=>{var K;P(G),(K=r==null?void 0:r.onError)==null||K.call(r,G);let W=typeof n=="function"?n(G,t,T):n;M(W,{key:`${t[0]}-${T}-getMany-notification`,message:v("notifications.error",{statusCode:G.statusCode},`Error (status code: ${G.statusCode})`),description:G.message,type:"error"});},meta:{...r==null?void 0:r.meta,...k("useMany",C,d==null?void 0:d.name)}}),{elapsedTime:V}=fe({...m,isLoading:F.isFetching});return {...F,overtime:{elapsedTime:V}}},"useMany"),za=o((e,t)=>`[useMany]: Missing "ids" prop. Expected an array of ids, but got "${typeof e}". Resource: "${t}"

See https://refine.dev/docs/data/hooks/use-many/#ids-`,"idsWarningMessage"),_a=o(()=>`[useMany]: Missing "resource" prop. Expected a string, but got undefined.

See https://refine.dev/docs/data/hooks/use-many/#resource-`,"resourceWarningMessage");var Os=(s=>(s.ADD="ADD",s.REMOVE="REMOVE",s.DECREASE_NOTIFICATION_SECOND="DECREASE_NOTIFICATION_SECOND",s))(Os||{});var To=o(({id:e,resource:t,values:r,dataProviderName:s,successNotification:n,errorNotification:i,meta:a,metaData:u,mutationMode:c,undoableTimeout:p,onCancel:l,optimisticUpdateMap:m,invalidates:y,mutationOptions:d,overtimeOptions:T}={})=>{let{resources:x,select:v}=q(),f=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQueryClient(),P=le(),{mutationMode:M,undoableTimeout:Q}=_e(),g=z(),C=ie(),{mutate:h}=Re({v3LegacyAuthProviderCompatible:!!(C!=null&&C.isLegacy)}),D=Ye(),{log:k$1}=Je(),{notificationDispatch:E}=ut(),L=Ce(),U=Ae(),w=ue(),{options:{textTransformers:N}}=ge(),{keys:b,preferLegacyKeys:F}=Z(),V=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({mutationFn:({id:R=e,values:S=r,resource:B=t,mutationMode:H=c,undoableTimeout:$=p,onCancel:X=l,meta:ne=a,metaData:Y=u,dataProviderName:O=s})=>{if(typeof R>"u")throw jt;if(!S)throw Ir;if(!B)throw _t;let{resource:_,identifier:ae}=v(B),J=w({resource:_,meta:I(ne,Y)}),we=H??M,ye=$??Q;return we!=="undoable"?P(ee(ae,O,x)).update({resource:_.name,id:R,variables:S,meta:J,metaData:J}):new Promise((Ne,se)=>{let me=o(()=>{P(ee(ae,O,x)).update({resource:_.name,id:R,variables:S,meta:J,metaData:J}).then(ve=>Ne(ve)).catch(ve=>se(ve));},"doMutation"),ce=o(()=>{se({message:"mutationCancelled"});},"cancelMutation");X&&X(ce),E({type:"ADD",payload:{id:R,resource:ae,cancelMutation:ce,doMutation:me,seconds:ye,isSilent:!!X}});})},onMutate:async({resource:R=t,id:S=e,mutationMode:B=c,values:H=r,dataProviderName:$=s,meta:X=a,metaData:ne=u,optimisticUpdateMap:Y=m??{list:true,many:true,detail:true}})=>{if(typeof S>"u")throw jt;if(!H)throw Ir;if(!R)throw _t;let{identifier:O}=v(R),{gqlMutation:_,gqlQuery:ae,...J}=I(X,ne)??{},we=dt(F)(O,ee(O,$,x),J),ye=b().data(ee(O,$,x)).resource(O),Ve=f.getQueriesData(ye.get(F)),Ne=B??M;return await f.cancelQueries(ye.get(F),void 0,{silent:true}),Ne!=="pessimistic"&&(Y.list&&f.setQueriesData(ye.action("list").params(J??{}).get(F),se=>{if(typeof Y.list=="function")return Y.list(se,H,S);if(!se)return null;let me=se.data.map(ce=>{var ve;return ((ve=ce.id)==null?void 0:ve.toString())===(S==null?void 0:S.toString())?{id:S,...ce,...H}:ce});return {...se,data:me}}),Y.many&&f.setQueriesData(ye.action("many").get(F),se=>{if(typeof Y.many=="function")return Y.many(se,H,S);if(!se)return null;let me=se.data.map(ce=>{var ve;return ((ve=ce.id)==null?void 0:ve.toString())===(S==null?void 0:S.toString())&&(ce={id:S,...ce,...H}),ce});return {...se,data:me}}),Y.detail&&f.setQueriesData(ye.action("one").id(S).params(J??{}).get(F),se=>typeof Y.detail=="function"?Y.detail(se,H,S):se?{...se,data:{...se.data,...H}}:null)),{previousQueries:Ve,queryKey:we}},onSettled:(R,S,B,H)=>{var _;let{id:$=e,resource:X=t,dataProviderName:ne=s,invalidates:Y=y??["list","many","detail"]}=B;if(typeof $>"u")throw jt;if(!X)throw _t;let{identifier:O}=v(X);U({resource:O,dataProviderName:ee(O,ne,x),invalidates:Y,id:$}),E({type:"REMOVE",payload:{id:$,resource:O}}),(_=d==null?void 0:d.onSettled)==null||_.call(d,R,S,B,H);},onSuccess:(R,S,B)=>{var Ke,Ct;let{id:H=e,resource:$=t,successNotification:X=n,dataProviderName:ne=s,values:Y=r,meta:O=a,metaData:_=u}=S;if(typeof H>"u")throw jt;if(!Y)throw Ir;if(!$)throw _t;let{resource:ae,identifier:J}=v($),we=N.singular(J),ye=ee(J,ne,x),Ve=w({resource:ae,meta:I(O,_)}),Ne=typeof X=="function"?X(R,{id:H,values:Y},J):X;L(Ne,{key:`${H}-${J}-notification`,description:g("notifications.success","Successful"),message:g("notifications.editSuccess",{resource:g(`${J}.${J}`,we)},`Successfully updated ${we}`),type:"success"}),D==null||D({channel:`resources/${ae.name}`,type:"updated",payload:{ids:(Ke=R.data)!=null&&Ke.id?[R.data.id]:void 0},date:new Date,meta:{...Ve,dataProviderName:ye}});let se;if(B){let Ge=f.getQueryData(B.queryKey.detail(H));se=Object.keys(Y||{}).reduce((Tt,xt)=>{var bt;return Tt[xt]=(bt=Ge==null?void 0:Ge.data)==null?void 0:bt[xt],Tt},{});}let{fields:me,operation:ce,variables:ve,...rt}=Ve||{};k$1==null||k$1.mutate({action:"update",resource:ae.name,data:Y,previousData:se,meta:{id:H,dataProviderName:ye,...rt}}),(Ct=d==null?void 0:d.onSuccess)==null||Ct.call(d,R,S,B);},onError:(R,S,B)=>{var O;let{id:H=e,resource:$=t,errorNotification:X=i,values:ne=r}=S;if(typeof H>"u")throw jt;if(!ne)throw Ir;if(!$)throw _t;let{identifier:Y}=v($);if(B)for(let _ of B.previousQueries)f.setQueryData(_[0],_[1]);if(R.message!=="mutationCancelled"){h==null||h(R);let _=N.singular(Y),ae=typeof X=="function"?X(R,{id:H,values:ne},Y):X;L(ae,{key:`${H}-${Y}-notification`,message:g("notifications.editError",{resource:g(`${Y}.${Y}`,_),statusCode:R.statusCode},`Error when updating ${_} (status code: ${R.statusCode})`),description:R.message,type:"error"});}(O=d==null?void 0:d.onError)==null||O.call(d,R,S,B);},mutationKey:b().data().mutation("update").get(F),...d,meta:{...d==null?void 0:d.meta,...k("useUpdate",F)}}),{mutate:G,mutateAsync:W,...K}=V,{elapsedTime:j}=fe({...T,isLoading:K.isLoading});return {...K,mutate:o((R,S)=>G(R||{},S),"handleMutation"),mutateAsync:o((R,S)=>W(R||{},S),"handleMutateAsync"),overtime:{elapsedTime:j}}},"useUpdate"),_t=new Error("[useUpdate]: `resource` is not defined or not matched but is required"),jt=new Error("[useUpdate]: `id` is not defined but is required in edit and clone actions"),Ir=new Error("[useUpdate]: `values` is not provided but is required");var Xt=o(({resource:e,values:t,dataProviderName:r,successNotification:s,errorNotification:n,invalidates:i,meta:a,metaData:u,mutationOptions:c,overtimeOptions:p}={})=>{let l=ie(),{mutate:m}=Re({v3LegacyAuthProviderCompatible:!!(l!=null&&l.isLegacy)}),y=le(),d=Ae(),{resources:T,select:x}=q(),v=z(),f=Ye(),{log:P}=Je(),M=Ce(),Q=ue(),{options:{textTransformers:g}}=ge(),{keys:C,preferLegacyKeys:h}=Z(),D=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({mutationFn:({resource:b=e,values:F=t,meta:V=a,metaData:G=u,dataProviderName:W=r})=>{if(!F)throw ho;if(!b)throw xo;let{resource:K,identifier:j}=x(b),re=Q({resource:K,meta:I(V,G)});return y(ee(j,W,T)).create({resource:K.name,variables:F,meta:re,metaData:re})},onSuccess:(b,F,V)=>{var J,we,ye;let{resource:G=e,successNotification:W=s,dataProviderName:K=r,invalidates:j=i??["list","many"],values:re=t,meta:te=a,metaData:R=u}=F;if(!re)throw ho;if(!G)throw xo;let{resource:S,identifier:B}=x(G),H=g.singular(B),$=ee(B,K,T),X=Q({resource:S,meta:I(te,R)}),ne=typeof W=="function"?W(b,re,B):W;M(ne,{key:`create-${B}-notification`,message:v("notifications.createSuccess",{resource:v(`${B}.${B}`,H)},`Successfully created ${H}`),description:v("notifications.success","Success"),type:"success"}),d({resource:B,dataProviderName:$,invalidates:j}),f==null||f({channel:`resources/${S.name}`,type:"created",payload:{ids:(J=b==null?void 0:b.data)!=null&&J.id?[b.data.id]:void 0},date:new Date,meta:{...X,dataProviderName:$}});let{fields:Y,operation:O,variables:_,...ae}=X||{};P==null||P.mutate({action:"create",resource:S.name,data:re,meta:{dataProviderName:$,id:((we=b==null?void 0:b.data)==null?void 0:we.id)??void 0,...ae}}),(ye=c==null?void 0:c.onSuccess)==null||ye.call(c,b,F,V);},onError:(b,F,V)=>{var R;let{resource:G=e,errorNotification:W=n,values:K=t}=F;if(!K)throw ho;if(!G)throw xo;m(b);let{identifier:j}=x(G),re=g.singular(j),te=typeof W=="function"?W(b,K,j):W;M(te,{key:`create-${j}-notification`,description:b.message,message:v("notifications.createError",{resource:v(`${j}.${j}`,re),statusCode:b.statusCode},`There was an error creating ${re} (status code: ${b.statusCode})`),type:"error"}),(R=c==null?void 0:c.onError)==null||R.call(c,b,F,V);},mutationKey:C().data().mutation("create").get(h),...c,meta:{...c==null?void 0:c.meta,...k("useCreate",h)}}),{mutate:k$1,mutateAsync:E,...L}=D,{elapsedTime:U}=fe({...p,isLoading:L.isLoading});return {...L,mutate:o((b,F)=>k$1(b||{},F),"handleMutation"),mutateAsync:o((b,F)=>E(b||{},F),"handleMutateAsync"),overtime:{elapsedTime:U}}},"useCreate"),xo=new Error("[useCreate]: `resource` is not defined or not matched but is required"),ho=new Error("[useCreate]: `values` is not provided but is required");var Po=o(({mutationOptions:e,overtimeOptions:t}={})=>{let r=ie(),{mutate:s}=Re({v3LegacyAuthProviderCompatible:!!(r!=null&&r.isLegacy)}),n=le(),{resources:i,select:a}=q(),u=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQueryClient(),{mutationMode:c,undoableTimeout:p}=_e(),{notificationDispatch:l}=ut(),m=z(),y=Ye(),{log:d}=Je(),T=Ce(),x=Ae(),v=ue(),{options:{textTransformers:f}}=ge(),{keys:P,preferLegacyKeys:M}=Z(),Q=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({mutationFn:({id:C,mutationMode:h,undoableTimeout:D,resource:k,onCancel:E,meta:L,metaData:U,dataProviderName:w,values:N})=>{let{resource:b,identifier:F}=a(k),V=v({resource:b,meta:I(L,U)}),G=h??c,W=D??p;return G!=="undoable"?n(ee(F,w,i)).deleteOne({resource:b.name,id:C,meta:V,metaData:V,variables:N}):new Promise((j,re)=>{let te=o(()=>{n(ee(F,w,i)).deleteOne({resource:b.name,id:C,meta:V,metaData:V,variables:N}).then(S=>j(S)).catch(S=>re(S));},"doMutation"),R=o(()=>{re({message:"mutationCancelled"});},"cancelMutation");E&&E(R),l({type:"ADD",payload:{id:C,resource:F,cancelMutation:R,doMutation:te,seconds:W,isSilent:!!E}});})},onMutate:async({id:C,resource:h,mutationMode:D,dataProviderName:k,meta:E,metaData:L})=>{let{identifier:U}=a(h),{gqlMutation:w,gqlQuery:N,...b}=I(E,L)??{},F=dt(M)(U,ee(U,k,i),b),V=P().data(ee(U,k,i)).resource(U),G=D??c;await u.cancelQueries(V.get(M),void 0,{silent:true});let W=u.getQueriesData(V.get(M));return G!=="pessimistic"&&(u.setQueriesData(V.action("list").params(b??{}).get(M),K=>K?{data:K.data.filter(re=>{var te;return ((te=re.id)==null?void 0:te.toString())!==C.toString()}),total:K.total-1}:null),u.setQueriesData(V.action("many").get(M),K=>{if(!K)return null;let j=K.data.filter(re=>{var te;return ((te=re.id)==null?void 0:te.toString())!==(C==null?void 0:C.toString())});return {...K,data:j}})),{previousQueries:W,queryKey:F}},onSettled:(C,h,{id:D,resource:k,dataProviderName:E,invalidates:L=["list","many"]})=>{let{identifier:U}=a(k);x({resource:U,dataProviderName:ee(U,E,i),invalidates:L}),l({type:"REMOVE",payload:{id:D,resource:U}});},onSuccess:(C,{id:h,resource:D,successNotification:k,dataProviderName:E,meta:L,metaData:U},w)=>{let{resource:N,identifier:b}=a(D),F=f.singular(b),V=ee(b,E,i),G=v({resource:N,meta:I(L,U)});u.removeQueries(w==null?void 0:w.queryKey.detail(h));let W=typeof k=="function"?k(C,h,b):k;T(W,{key:`${h}-${b}-notification`,description:m("notifications.success","Success"),message:m("notifications.deleteSuccess",{resource:m(`${b}.${b}`,F)},`Successfully deleted a ${F}`),type:"success"}),y==null||y({channel:`resources/${N.name}`,type:"deleted",payload:{ids:[h]},date:new Date,meta:{...G,dataProviderName:V}});let{fields:K,operation:j,variables:re,...te}=G||{};d==null||d.mutate({action:"delete",resource:N.name,meta:{id:h,dataProviderName:V,...te}}),u.removeQueries(w==null?void 0:w.queryKey.detail(h));},onError:(C,{id:h,resource:D,errorNotification:k},E)=>{let{identifier:L}=a(D);if(E)for(let U of E.previousQueries)u.setQueryData(U[0],U[1]);if(C.message!=="mutationCancelled"){s(C);let U=f.singular(L),w=typeof k=="function"?k(C,h,L):k;T(w,{key:`${h}-${L}-notification`,message:m("notifications.deleteError",{resource:U,statusCode:C.statusCode},`Error (status code: ${C.statusCode})`),description:C.message,type:"error"});}},mutationKey:P().data().mutation("delete").get(M),...e,meta:{...e==null?void 0:e.meta,...k("useDelete",M)}}),{elapsedTime:g}=fe({...t,isLoading:Q.isLoading});return {...Q,overtime:{elapsedTime:g}}},"useDelete");var bo=o(({resource:e,values:t,dataProviderName:r,successNotification:s,errorNotification:n,meta:i,metaData:a,invalidates:u,mutationOptions:c,overtimeOptions:p}={})=>{let l=le(),{resources:m,select:y}=q(),d=z(),T=Ye(),x=Ce(),v=Ae(),{log:f}=Je(),P=ue(),{options:{textTransformers:M}}=ge(),{keys:Q,preferLegacyKeys:g}=Z(),C=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({mutationFn:({resource:w=e,values:N=t,meta:b=i,metaData:F=a,dataProviderName:V=r})=>{if(!N)throw Co;if(!w)throw Ro;let{resource:G,identifier:W}=y(w),K=P({resource:G,meta:I(b,F)}),j=l(ee(W,V,m));return j.createMany?j.createMany({resource:G.name,variables:N,meta:K,metaData:K}):lt(N.map(re=>j.create({resource:G.name,variables:re,meta:K,metaData:K})))},onSuccess:(w,N,b)=>{var ae;let{resource:F=e,successNotification:V=s,dataProviderName:G=r,invalidates:W=u??["list","many"],values:K=t,meta:j=i,metaData:re=a}=N;if(!K)throw Co;if(!F)throw Ro;let{resource:te,identifier:R}=y(F),S=M.plural(R),B=ee(R,G,m),H=P({resource:te,meta:I(j,re)}),$=typeof V=="function"?V(w,K,R):V;x($,{key:`createMany-${R}-notification`,message:d("notifications.createSuccess",{resource:d(`${R}.${R}`,R)},`Successfully created ${S}`),description:d("notifications.success","Success"),type:"success"}),v({resource:R,dataProviderName:B,invalidates:W});let X=w==null?void 0:w.data.filter(J=>(J==null?void 0:J.id)!==void 0).map(J=>J.id);T==null||T({channel:`resources/${te.name}`,type:"created",payload:{ids:X},date:new Date,meta:{...H,dataProviderName:B}});let{fields:ne,operation:Y,variables:O,..._}=H||{};f==null||f.mutate({action:"createMany",resource:te.name,data:K,meta:{dataProviderName:B,ids:X,..._}}),(ae=c==null?void 0:c.onSuccess)==null||ae.call(c,w,N,b);},onError:(w,N,b)=>{var j;let{resource:F=e,errorNotification:V=n,values:G=t}=N;if(!G)throw Co;if(!F)throw Ro;let{identifier:W}=y(F),K=typeof V=="function"?V(w,G,W):V;x(K,{key:`createMany-${W}-notification`,description:w.message,message:d("notifications.createError",{resource:d(`${W}.${W}`,W),statusCode:w.statusCode},`There was an error creating ${W} (status code: ${w.statusCode}`),type:"error"}),(j=c==null?void 0:c.onError)==null||j.call(c,w,N,b);},mutationKey:Q().data().mutation("createMany").get(g),...c,meta:{...c==null?void 0:c.meta,...k("useCreateMany",g)}}),{mutate:h,mutateAsync:D,...k$1}=C,{elapsedTime:E}=fe({...p,isLoading:k$1.isLoading});return {...k$1,mutate:o((w,N)=>h(w||{},N),"handleMutation"),mutateAsync:o((w,N)=>D(w||{},N),"handleMutateAsync"),overtime:{elapsedTime:E}}},"useCreateMany"),Ro=new Error("[useCreateMany]: `resource` is not defined or not matched but is required"),Co=new Error("[useCreateMany]: `values` is not provided but is required");var ii=o(({ids:e,resource:t,values:r,dataProviderName:s,successNotification:n,errorNotification:i,meta:a,metaData:u,mutationMode:c,undoableTimeout:p,onCancel:l,optimisticUpdateMap:m,invalidates:y,mutationOptions:d,overtimeOptions:T}={})=>{let{resources:x,select:v}=q(),f=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQueryClient(),P=le(),M=z(),{mutationMode:Q,undoableTimeout:g}=_e(),C=ie(),{mutate:h}=Re({v3LegacyAuthProviderCompatible:!!(C!=null&&C.isLegacy)}),{notificationDispatch:D}=ut(),k$1=Ye(),E=Ce(),L=Ae(),{log:U}=Je(),w=ue(),{options:{textTransformers:N}}=ge(),{keys:b,preferLegacyKeys:F}=Z(),V=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({mutationFn:({ids:R=e,values:S=r,resource:B=t,onCancel:H=l,mutationMode:$=c,undoableTimeout:X=p,meta:ne=a,metaData:Y=u,dataProviderName:O=s})=>{if(!R)throw Yt;if(!S)throw Sr;if(!B)throw Zt;let{resource:_,identifier:ae}=v(B),J=w({resource:_,meta:I(ne,Y)}),we=$??Q,ye=X??g,Ve=P(ee(ae,O,x)),Ne=o(()=>Ve.updateMany?Ve.updateMany({resource:_.name,ids:R,variables:S,meta:J,metaData:J}):lt(R.map(me=>Ve.update({resource:_.name,id:me,variables:S,meta:J,metaData:J}))),"mutationFn");return we!=="undoable"?Ne():new Promise((me,ce)=>{let ve=o(()=>{Ne().then(Ke=>me(Ke)).catch(Ke=>ce(Ke));},"doMutation"),rt=o(()=>{ce({message:"mutationCancelled"});},"cancelMutation");H&&H(rt),D({type:"ADD",payload:{id:R,resource:ae,cancelMutation:rt,doMutation:ve,seconds:ye,isSilent:!!H}});})},onMutate:async({resource:R=t,ids:S=e,values:B=r,mutationMode:H=c,dataProviderName:$=s,meta:X=a,metaData:ne=u,optimisticUpdateMap:Y=m??{list:true,many:true,detail:true}})=>{if(!S)throw Yt;if(!B)throw Sr;if(!R)throw Zt;let{identifier:O}=v(R),{gqlMutation:_,gqlQuery:ae,...J}=I(X,ne)??{},we=dt(F)(O,ee(O,$,x),J),ye=b().data(ee(O,$,x)).resource(O),Ve=H??Q;await f.cancelQueries(ye.get(F),void 0,{silent:true});let Ne=f.getQueriesData(ye.get(F));if(Ve!=="pessimistic"&&(Y.list&&f.setQueriesData(ye.action("list").params(J??{}).get(F),se=>{if(typeof Y.list=="function")return Y.list(se,B,S);if(!se)return null;let me=se.data.map(ce=>ce.id!==void 0&&S.filter(ve=>ve!==void 0).map(String).includes(ce.id.toString())?{...ce,...B}:ce);return {...se,data:me}}),Y.many&&f.setQueriesData(ye.action("many").get(F),se=>{if(typeof Y.many=="function")return Y.many(se,B,S);if(!se)return null;let me=se.data.map(ce=>ce.id!==void 0&&S.filter(ve=>ve!==void 0).map(String).includes(ce.id.toString())?{...ce,...B}:ce);return {...se,data:me}}),Y.detail))for(let se of S)f.setQueriesData(ye.action("one").id(se).params(J??{}).get(F),me=>{if(typeof Y.detail=="function")return Y.detail(me,B,se);if(!me)return null;let ce={...me.data,...B};return {...me,data:ce}});return {previousQueries:Ne,queryKey:we}},onSettled:(R,S,B,H)=>{var _;let{ids:$=e,resource:X=t,dataProviderName:ne=s,invalidates:Y=y}=B;if(!$)throw Yt;if(!X)throw Zt;let{identifier:O}=v(X);L({resource:O,invalidates:Y??["list","many"],dataProviderName:ee(O,ne,x)}),$.forEach(ae=>L({resource:O,invalidates:Y??["detail"],dataProviderName:ee(O,ne,x),id:ae})),D({type:"REMOVE",payload:{id:$,resource:O}}),(_=d==null?void 0:d.onSettled)==null||_.call(d,R,S,B,H);},onSuccess:(R,S,B)=>{var Ke;let{ids:H=e,resource:$=t,values:X=r,meta:ne=a,metaData:Y=u,dataProviderName:O=s,successNotification:_=n}=S;if(!H)throw Yt;if(!X)throw Sr;if(!$)throw Zt;let{resource:ae,identifier:J}=v($),we=N.singular(J),ye=ee(J,O,x),Ve=w({resource:ae,meta:I(ne,Y)}),Ne=typeof _=="function"?_(R,{ids:H,values:X},J):_;E(Ne,{key:`${H}-${J}-notification`,description:M("notifications.success","Successful"),message:M("notifications.editSuccess",{resource:M(`${J}.${J}`,J)},`Successfully updated ${we}`),type:"success"}),k$1==null||k$1({channel:`resources/${ae.name}`,type:"updated",payload:{ids:H.map(String)},date:new Date,meta:{...Ve,dataProviderName:ye}});let se=[];B&&H.forEach(Ct=>{let Ge=f.getQueryData(B.queryKey.detail(Ct));se.push(Object.keys(X||{}).reduce((Tt,xt)=>{var bt;return Tt[xt]=(bt=Ge==null?void 0:Ge.data)==null?void 0:bt[xt],Tt},{}));});let{fields:me,operation:ce,variables:ve,...rt}=Ve||{};U==null||U.mutate({action:"updateMany",resource:ae.name,data:X,previousData:se,meta:{ids:H,dataProviderName:ye,...rt}}),(Ke=d==null?void 0:d.onSuccess)==null||Ke.call(d,R,S,B);},onError:(R,S,B)=>{var O;let{ids:H=e,resource:$=t,errorNotification:X=i,values:ne=r}=S;if(!H)throw Yt;if(!ne)throw Sr;if(!$)throw Zt;let{identifier:Y}=v($);if(B)for(let _ of B.previousQueries)f.setQueryData(_[0],_[1]);if(R.message!=="mutationCancelled"){h==null||h(R);let _=N.singular(Y),ae=typeof X=="function"?X(R,{ids:H,values:ne},Y):X;E(ae,{key:`${H}-${Y}-updateMany-error-notification`,message:M("notifications.editError",{resource:_,statusCode:R.statusCode},`Error when updating ${_} (status code: ${R.statusCode})`),description:R.message,type:"error"});}(O=d==null?void 0:d.onError)==null||O.call(d,R,S,B);},mutationKey:b().data().mutation("updateMany").get(F),...d,meta:{...d==null?void 0:d.meta,...k("useUpdateMany",F)}}),{mutate:G,mutateAsync:W,...K}=V,{elapsedTime:j}=fe({...T,isLoading:K.isLoading});return {...K,mutate:o((R,S)=>G(R||{},S),"handleMutation"),mutateAsync:o((R,S)=>W(R||{},S),"handleMutateAsync"),overtime:{elapsedTime:j}}},"useUpdateMany"),Zt=new Error("[useUpdateMany]: `resource` is not defined or not matched but is required"),Yt=new Error("[useUpdateMany]: `id` is not defined but is required in edit and clone actions"),Sr=new Error("[useUpdateMany]: `values` is not provided but is required");var di=o(({mutationOptions:e,overtimeOptions:t}={})=>{let r=ie(),{mutate:s}=Re({v3LegacyAuthProviderCompatible:!!(r!=null&&r.isLegacy)}),{mutationMode:n,undoableTimeout:i}=_e(),a=le(),{notificationDispatch:u}=ut(),c=z(),p=Ye(),l=Ce(),m=Ae(),{log:y}=Je(),{resources:d,select:T}=q(),x=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQueryClient(),v=ue(),{options:{textTransformers:f}}=ge(),{keys:P,preferLegacyKeys:M}=Z(),Q=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({mutationFn:({resource:C,ids:h,mutationMode:D,undoableTimeout:k,onCancel:E,meta:L,metaData:U,dataProviderName:w,values:N})=>{let{resource:b,identifier:F}=T(C),V=v({resource:b,meta:I(L,U)}),G=D??n,W=k??i,K=a(ee(F,w,d)),j=o(()=>K.deleteMany?K.deleteMany({resource:b.name,ids:h,meta:V,metaData:V,variables:N}):lt(h.map(te=>K.deleteOne({resource:b.name,id:te,meta:V,metaData:V,variables:N}))),"mutationFn");return G!=="undoable"?j():new Promise((te,R)=>{let S=o(()=>{j().then(H=>te(H)).catch(H=>R(H));},"doMutation"),B=o(()=>{R({message:"mutationCancelled"});},"cancelMutation");E&&E(B),u({type:"ADD",payload:{id:h,resource:F,cancelMutation:B,doMutation:S,seconds:W,isSilent:!!E}});})},onMutate:async({ids:C,resource:h,mutationMode:D,dataProviderName:k,meta:E,metaData:L})=>{let{identifier:U}=T(h),{gqlMutation:w,gqlQuery:N,...b}=I(E,L)??{},F=dt(M)(U,ee(U,k,d),b),V=P().data(ee(U,k,d)).resource(U),G=D??n;await x.cancelQueries(V.get(M),void 0,{silent:true});let W=x.getQueriesData(V.get(M));if(G!=="pessimistic"){x.setQueriesData(V.action("list").params(b??{}).get(M),K=>K?{data:K.data.filter(re=>re.id&&!C.map(String).includes(re.id.toString())),total:K.total-1}:null),x.setQueriesData(V.action("many").get(M),K=>{if(!K)return null;let j=K.data.filter(re=>re.id?!C.map(String).includes(re.id.toString()):false);return {...K,data:j}});for(let K of C)x.setQueriesData(V.action("one").id(K).params(b).get(M),j=>!j||j.data.id===K?null:{...j});}return {previousQueries:W,queryKey:F}},onSettled:(C,h,{resource:D,ids:k,dataProviderName:E,invalidates:L=["list","many"]})=>{let{identifier:U}=T(D);m({resource:U,dataProviderName:ee(U,E,d),invalidates:L}),u({type:"REMOVE",payload:{id:k,resource:U}});},onSuccess:(C,{ids:h,resource:D,meta:k,metaData:E,dataProviderName:L,successNotification:U},w)=>{let{resource:N,identifier:b}=T(D),F=ee(b,L,d),V=v({resource:N,meta:I(k,E)});h.forEach(te=>x.removeQueries(w==null?void 0:w.queryKey.detail(te)));let G=typeof U=="function"?U(C,h,b):U;l(G,{key:`${h}-${b}-notification`,description:c("notifications.success","Success"),message:c("notifications.deleteSuccess",{resource:c(`${b}.${b}`,b)},`Successfully deleted ${b}`),type:"success"}),p==null||p({channel:`resources/${N.name}`,type:"deleted",payload:{ids:h},date:new Date,meta:{...V,dataProviderName:F}});let{fields:W,operation:K,variables:j,...re}=V||{};y==null||y.mutate({action:"deleteMany",resource:N.name,meta:{ids:h,dataProviderName:F,...re}}),h.forEach(te=>x.removeQueries(w==null?void 0:w.queryKey.detail(te)));},onError:(C,{ids:h,resource:D,errorNotification:k},E)=>{let{identifier:L}=T(D);if(E)for(let U of E.previousQueries)x.setQueryData(U[0],U[1]);if(C.message!=="mutationCancelled"){s(C);let U=f.singular(L),w=typeof k=="function"?k(C,h,L):k;l(w,{key:`${h}-${L}-notification`,message:c("notifications.deleteError",{resource:U,statusCode:C.statusCode},`Error (status code: ${C.statusCode})`),description:C.message,type:"error"});}},mutationKey:P().data().mutation("deleteMany").get(M),...e,meta:{...e==null?void 0:e.meta,...k("useDeleteMany",M)}}),{elapsedTime:g}=fe({...t,isLoading:Q.isLoading});return {...Q,overtime:{elapsedTime:g}}},"useDeleteMany");var li=o(e=>{var n;let t=le(),{resource:r}=q(),{getApiUrl:s}=t(e??((n=I(r==null?void 0:r.meta,r==null?void 0:r.options))==null?void 0:n.dataProviderName));return s()},"useApiUrl");var yi=o(({url:e,method:t,config:r,queryOptions:s,successNotification:n,errorNotification:i,meta:a,metaData:u,dataProviderName:c,overtimeOptions:p})=>{let l=le(),m=ie(),{mutate:y}=Re({v3LegacyAuthProviderCompatible:!!(m!=null&&m.isLegacy)}),d=z(),T=Ce(),x=ue(),{keys:v,preferLegacyKeys:f}=Z(),P=I(a,u),{custom:M}=l(c),Q=x({meta:P});if(M){let g=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQuery({queryKey:v().data(c).mutation("custom").params({method:t,url:e,...r,...P||{}}).get(f),queryFn:h=>M({url:e,method:t,...r,meta:{...Q,queryContext:je(h)},metaData:{...Q,queryContext:je(h)}}),...s,onSuccess:h=>{var k;(k=s==null?void 0:s.onSuccess)==null||k.call(s,h);let D=typeof n=="function"?n(h,{...r,...Q}):n;T(D);},onError:h=>{var k;y(h),(k=s==null?void 0:s.onError)==null||k.call(s,h);let D=typeof i=="function"?i(h,{...r,...Q}):i;T(D,{key:`${t}-notification`,message:d("notifications.error",{statusCode:h.statusCode},`Error (status code: ${h.statusCode})`),description:h.message,type:"error"});},meta:{...s==null?void 0:s.meta,...k("useCustom",f)}}),{elapsedTime:C}=fe({...p,isLoading:g.isFetching});return {...g,overtime:{elapsedTime:C}}}throw Error("Not implemented custom on data provider.")},"useCustom");var xi=o(({mutationOptions:e,overtimeOptions:t}={})=>{let r=ie(),{mutate:s}=Re({v3LegacyAuthProviderCompatible:!!(r!=null&&r.isLegacy)}),n=Ce(),i=le(),a=z(),u=ue(),{keys:c,preferLegacyKeys:p}=Z(),l=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation(({url:y,method:d,values:T,meta:x,metaData:v,dataProviderName:f,config:P})=>{let M=u({meta:I(x,v)}),{custom:Q}=i(f);if(Q)return Q({url:y,method:d,payload:T,meta:M,metaData:M,headers:{...P==null?void 0:P.headers}});throw Error("Not implemented custom on data provider.")},{onSuccess:(y,{successNotification:d,config:T,meta:x,metaData:v})=>{let f=typeof d=="function"?d(y,{...T,...I(x,v)||{}}):d;n(f);},onError:(y,{errorNotification:d,method:T,config:x,meta:v,metaData:f})=>{s(y);let P=typeof d=="function"?d(y,{...x,...I(v,f)||{}}):d;n(P,{key:`${T}-notification`,message:a("notifications.error",{statusCode:y.statusCode},`Error (status code: ${y.statusCode})`),description:y.message,type:"error"});},mutationKey:c().data().mutation("customMutation").get(p),...e,meta:{...e==null?void 0:e.meta,...k("useCustomMutation",p)}}),{elapsedTime:m}=fe({...t,isLoading:l.isLoading});return {...l,overtime:{elapsedTime:m}}},"useCustomMutation");var Hs={default:{}},Jt=React.createContext(Hs),$s=o(({children:e,dataProvider:t})=>{let r=Hs;return t&&(!("default"in t)&&("getList"in t||"getOne"in t)?r={default:t}:r=t),React.createElement(Jt.Provider,{value:r},e)},"DataContextProvider");var le=o(()=>{let e=core_core__loadShare__react__loadShare__.useContext(Jt);return core_core__loadShare__react__loadShare__.useCallback(r=>{if(r){let s=e==null?void 0:e[r];if(!s)throw new Error(`"${r}" Data provider not found`);if(s&&!(e!=null&&e.default))throw new Error("If you have multiple data providers, you must provide default data provider property");return e[r]}if(e.default)return e.default;throw new Error('There is no "default" data provider. Please pass dataProviderName.')},[e])},"useDataProvider");var bi=o(({resource:e,config:t,filters:r,hasPagination:s,pagination:n,sorters:i,queryOptions:a,successNotification:u,errorNotification:c,meta:p,metaData:l,liveMode:m,onLiveEvent:y,liveParams:d,dataProviderName:T,overtimeOptions:x})=>{let{resources:v,resource:f,identifier:P}=q(e),M=le(),Q=z(),g=ie(),{mutate:C}=Re({v3LegacyAuthProviderCompatible:!!(g!=null&&g.isLegacy)}),h=Ce(),D=ue(),{keys:k$1,preferLegacyKeys:E}=Z(),L=ee(P,T,v),U=I(p,l),w=I(r,t==null?void 0:t.filters),N=I(i,t==null?void 0:t.sort),b=I(s,t==null?void 0:t.hasPagination),F=Wt({pagination:n,configPagination:t==null?void 0:t.pagination,hasPagination:b}),V=F.mode==="server",G={meta:U,metaData:U,filters:w,hasPagination:V,pagination:F,sorters:N,config:{...t,sort:N}},W=(a==null?void 0:a.enabled)===void 0||(a==null?void 0:a.enabled)===true,K=D({resource:f,meta:U}),{getList:j}=M(L);Pt({resource:P,types:["*"],params:{meta:K,metaData:K,pagination:F,hasPagination:V,sort:N,sorters:N,filters:w,subscriptionType:"useList",...d},channel:`resources/${f.name}`,enabled:W,liveMode:m,onLiveEvent:y,dataProviderName:L,meta:{...K,dataProviderName:T}});let re=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useInfiniteQuery({queryKey:k$1().data(L).resource(P).action("infinite").params({...U||{},filters:w,hasPagination:V,...V&&{pagination:F},...i&&{sorters:i},...(t==null?void 0:t.sort)&&{sort:t==null?void 0:t.sort}}).get(E),queryFn:R=>{let S={...F,current:R.pageParam},B={...K,queryContext:je(R)};return j({resource:f.name,pagination:S,hasPagination:V,filters:w,sort:N,sorters:N,meta:B,metaData:B}).then(({data:H,total:$,...X})=>({data:H,total:$,pagination:S,...X}))},getNextPageParam:R=>Tr(R),getPreviousPageParam:R=>xr(R),...a,onSuccess:R=>{var B;(B=a==null?void 0:a.onSuccess)==null||B.call(a,R);let S=typeof u=="function"?u(R,G,P):u;h(S);},onError:R=>{var B;C(R),(B=a==null?void 0:a.onError)==null||B.call(a,R);let S=typeof c=="function"?c(R,G,P):c;h(S,{key:`${P}-useInfiniteList-notification`,message:Q("notifications.error",{statusCode:R.statusCode},`Error (status code: ${R.statusCode})`),description:R.message,type:"error"});},meta:{...a==null?void 0:a.meta,...k("useInfiniteList",E,f==null?void 0:f.name)}}),{elapsedTime:te}=fe({...x,isLoading:re.isFetching});return {...re,overtime:{elapsedTime:te}}},"useInfiniteList");var mt=React.createContext({}),_s=o(({liveProvider:e,children:t})=>React.createElement(mt.Provider,{value:{liveProvider:e}},t),"LiveContextProvider");var Ae=o(()=>{let{resources:e}=q(),t=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQueryClient(),{keys:r,preferLegacyKeys:s}=Z();return core_core__loadShare__react__loadShare__.useCallback(async({resource:i,dataProviderName:a,invalidates:u,id:c,invalidationFilters:p={type:"all",refetchType:"active"},invalidationOptions:l={cancelRefetch:false}})=>{if(u===false)return;let m=ee(i,a,e),y=r().data(m).resource(i??"");await Promise.all(u.map(d=>{switch(d){case "all":return t.invalidateQueries(r().data(m).get(s),p,l);case "list":return t.invalidateQueries(y.action("list").get(s),p,l);case "many":return t.invalidateQueries(y.action("many").get(s),p,l);case "resourceAll":return t.invalidateQueries(y.get(s),p,l);case "detail":return t.invalidateQueries(y.action("one").id(c||"").get(s),p,l);default:return}}));},[])},"useInvalidate");var js=o(e=>{let t=core_core__loadShare__react__loadShare__.useRef(e);return isEqual(t.current,e)||(t.current=e),t.current},"useMemoized");var Ar=o((e,t)=>{let r=js(t);return core_core__loadShare__react__loadShare__.useMemo(e,r)},"useDeepMemo");var Rt=React.createContext({resources:[]}),Zs=o(({resources:e,children:t})=>{let r=Ar(()=>hr(e??[]),[e]);return React.createElement(Rt.Provider,{value:{resources:r}},t)},"ResourceContextProvider");var Js=React.createContext("new"),qs=Js.Provider,oe=o(()=>React.useContext(Js),"useRouterType");var en={},ft=core_core__loadShare__react__loadShare__.createContext(en),tn=o(({children:e,router:t})=>React.createElement(ft.Provider,{value:t??en},e),"RouterContextProvider");var vo=o(()=>{let e=core_core__loadShare__react__loadShare__.useContext(ft);return React.useMemo(()=>(e==null?void 0:e.parse)??(()=>()=>({})),[e==null?void 0:e.parse])()},"useParse");var Te=o(()=>{let e=vo();return React.useMemo(()=>e(),[e])},"useParsed");function q(e){let{resources:t}=core_core__loadShare__react__loadShare__.useContext(Rt),r=oe(),s=Te(),n={resourceName:e&&typeof e!="string"?e.resourceName:e,resourceNameOrRouteName:e&&typeof e!="string"?e.resourceNameOrRouteName:e,recordItemId:e&&typeof e!="string"?e.recordItemId:void 0},i=o((m,y=true)=>{let T=Ee(m,t,r==="legacy");if(T)return {resource:T,identifier:T.identifier??T.name};if(y){let x={name:m,identifier:m},v=x.identifier??x.name;return {resource:x,identifier:v}}},"select"),a=rn(),{useParams:u}=pe(),c=u();if(r==="legacy"){let m=n.resourceNameOrRouteName?n.resourceNameOrRouteName:c.resource,y=m?a(m):void 0,d=(n==null?void 0:n.recordItemId)??c.id,T=c.action,x=(n==null?void 0:n.resourceName)??(y==null?void 0:y.name),v=(y==null?void 0:y.identifier)??(y==null?void 0:y.name);return {resources:t,resource:y,resourceName:x,id:d,action:T,select:i,identifier:v}}let p,l=typeof e=="string"?e:n==null?void 0:n.resourceNameOrRouteName;if(l){let m=Ee(l,t);m?p=m:p={name:l};}else s!=null&&s.resource&&(p=s.resource);return {resources:t,resource:p,resourceName:p==null?void 0:p.name,id:s.id,action:s.action,select:i,identifier:(p==null?void 0:p.identifier)??(p==null?void 0:p.name)}}o(q,"useResource");var rn=o(()=>{let{resources:e}=core_core__loadShare__react__loadShare__.useContext(Rt);return core_core__loadShare__react__loadShare__.useCallback(r=>{let s=Ee(r,e,true);return s||{name:r,route:r}},[e])},"useResourceWithRoute");var Pt=o(({resource:e,params:t,channel:r,types:s,enabled:n=true,liveMode:i,onLiveEvent:a,dataProviderName:u,meta:c})=>{var f;let{resource:p,identifier:l}=q(e),{liveProvider:m}=core_core__loadShare__react__loadShare__.useContext(mt),{liveMode:y,onLiveEvent:d}=core_core__loadShare__react__loadShare__.useContext(Qe),T=i??y,x=Ae(),v=u??(c==null?void 0:c.dataProviderName)??((f=p==null?void 0:p.meta)==null?void 0:f.dataProviderName);core_core__loadShare__react__loadShare__.useEffect(()=>{let P,M=o(Q=>{T==="auto"&&x({resource:l,dataProviderName:v,invalidates:["resourceAll"],invalidationFilters:{type:"active",refetchType:"active"},invalidationOptions:{cancelRefetch:false}}),a==null||a(Q),d==null||d(Q);},"callback");return T&&T!=="off"&&n&&(P=m==null?void 0:m.subscribe({channel:r,params:{resource:p==null?void 0:p.name,...t},types:s,callback:M,dataProviderName:v,meta:{...c,dataProviderName:v}})),()=>{P&&(m==null||m.unsubscribe(P));}},[n]);},"useResourceSubscription");var sn=o(e=>{let{liveMode:t}=core_core__loadShare__react__loadShare__.useContext(Qe);return e??t},"useLiveMode");var ph=o(({params:e,channel:t,types:r=["*"],enabled:s=true,onLiveEvent:n,dataProviderName:i="default",meta:a})=>{let{liveProvider:u}=core_core__loadShare__react__loadShare__.useContext(mt);core_core__loadShare__react__loadShare__.useEffect(()=>{let c;return s&&(c=u==null?void 0:u.subscribe({channel:t,params:e,types:r,callback:n,dataProviderName:i,meta:{...a,dataProviderName:i}})),()=>{c&&(u==null||u.unsubscribe(c));}},[s]);},"useSubscription");var Ye=o(()=>{let{liveProvider:e}=core_core__loadShare__react__loadShare__.useContext(mt);return e==null?void 0:e.publish},"usePublish");var Uo=core_core__loadShare__react__loadShare__.createContext({notifications:[],notificationDispatch:()=>false}),Hi=[],$i=o((e,t)=>{switch(t.type){case "ADD":return [...e.filter(s=>!(isEqual(s.id,t.payload.id)&&s.resource===t.payload.resource)),{...t.payload,isRunning:true}];case "REMOVE":return e.filter(r=>!(isEqual(r.id,t.payload.id)&&r.resource===t.payload.resource));case "DECREASE_NOTIFICATION_SECOND":return e.map(r=>isEqual(r.id,t.payload.id)&&r.resource===t.payload.resource?{...r,seconds:t.payload.seconds-1e3}:r);default:return e}},"undoableQueueReducer"),an=o(({children:e})=>{let[t,r]=core_core__loadShare__react__loadShare__.useReducer($i,Hi),s={notifications:t,notificationDispatch:r};return React.createElement(Uo.Provider,{value:s},e,typeof window<"u"?t.map(n=>React.createElement(un,{key:`${n.id}-${n.resource}-queue`,notification:n})):null)},"UndoableQueueContextProvider");var ut=o(()=>{let{notifications:e,notificationDispatch:t}=core_core__loadShare__react__loadShare__.useContext(Uo);return {notifications:e,notificationDispatch:t}},"useCancelNotification");var qt=core_core__loadShare__react__loadShare__.createContext({}),cn=o(({open:e,close:t,children:r})=>React.createElement(qt.Provider,{value:{open:e,close:t}},r),"NotificationContextProvider");var He=o(()=>{let{open:e,close:t}=core_core__loadShare__react__loadShare__.useContext(qt);return {open:e,close:t}},"useNotification");var Ce=o(()=>{let{open:e}=He();return core_core__loadShare__react__loadShare__.useCallback((r,s)=>{r!==false&&(r?e==null||e(r):s&&(e==null||e(s)));},[])},"useHandleNotification");var Xe=React.createContext({}),dn=o(({children:e,i18nProvider:t})=>React.createElement(Xe.Provider,{value:{i18nProvider:t}},e),"I18nContextProvider");var Eo=o(()=>{let{i18nProvider:e}=core_core__loadShare__react__loadShare__.useContext(Xe);return core_core__loadShare__react__loadShare__.useCallback(t=>e==null?void 0:e.changeLocale(t),[])},"useSetLocale");var z=o(()=>{let{i18nProvider:e}=core_core__loadShare__react__loadShare__.useContext(Xe);return core_core__loadShare__react__loadShare__.useMemo(()=>{function r(s,n,i){return (e==null?void 0:e.translate(s,n,i))??i??(typeof n=="string"&&typeof i>"u"?n:s)}return o(r,"translate"),r},[e])},"useTranslate");var Lo=o(()=>{let{i18nProvider:e}=core_core__loadShare__react__loadShare__.useContext(Xe);return core_core__loadShare__react__loadShare__.useCallback(()=>e==null?void 0:e.getLocale(),[])},"useGetLocale");var tP=o(()=>{let e=z(),t=Eo(),r=Lo();return {translate:e,changeLocale:t,getLocale:r}},"useTranslation");var fP=o(({resourceName:e,resource:t,sorter:r,sorters:s,filters:n,maxItemCount:i,pageSize:a=20,mapData:u=o(x=>x,"mapData"),exportOptions:c,unparseConfig:p,meta:l,metaData:m,dataProviderName:y,onError:d,download:T}={})=>{let[x,v]=core_core__loadShare__react__loadShare__.useState(false),f=le(),P=ue(),{resource:M,resources:Q,identifier:g}=q(I(t,e)),h=`${ht()(g,"plural")}-${new Date().toLocaleString()}`,{getList:D}=f(ee(g,y,Q)),k=P({resource:M,meta:I(l,m)});return {isLoading:x,triggerExport:o(async()=>{v(true);let L=[],U=1,w=true;for(;w;)try{let{data:V,total:G}=await D({resource:(M==null?void 0:M.name)??"",filters:n,sort:I(s,r),sorters:I(s,r),pagination:{current:U,pageSize:a,mode:"server"},meta:k,metaData:k});U++,L.push(...V),i&&L.length>=i&&(L=L.slice(0,i),w=!1),G===L.length&&(w=!1);}catch(V){v(false),w=false,d==null||d(V);return}let N=typeof p<"u"&&p!==null;$u(N&&typeof c<"u"&&c!==null,`[useExport]: resource: "${g}" 

Both \`unparseConfig\` and \`exportOptions\` are set, \`unparseConfig\` will take precedence`);let b={filename:h,useKeysAsHeaders:true,useBom:true,title:"My Generated Report",quoteStrings:'"',...c};$u((c==null?void 0:c.decimalSeparator)!==void 0,`[useExport]: resource: "${g}" 

Use of \`decimalSeparator\` no longer supported, please use \`mapData\` instead.

See https://refine.dev/docs/api-reference/core/hooks/import-export/useExport/`),N?p={quotes:true,...p}:p={columns:b.useKeysAsHeaders?void 0:b.headers,delimiter:b.fieldSeparator,header:b.showLabels||b.useKeysAsHeaders,quoteChar:b.quoteStrings,quotes:true};let F=bu.unparse(L.map(u),p);if(b.showTitle&&(F=`${b.title}\r

${F}`),typeof window<"u"&&F.length>0&&(T??true)){let V=b.useTextFile?".txt":".csv",G=`text/${b.useTextFile?"plain":"csv"};charset=utf8;`,W=`${(b.filename??"download").replace(/ /g,"_")}${V}`;ro(W,`${b!=null&&b.useBom?"\uFEFF":""}${F}`,G);}return v(false),F},"triggerExport")}},"useExport");var RP=o((e={})=>{var K,j,re;let t=ue(),r=Ae(),{redirect:s}=At(),{mutationMode:n}=_e(),{setWarnWhen:i}=vt(),a=fn(),u=I(e.meta,e.metaData),c=e.mutationMode??n,{id:p,setId:l,resource:m,identifier:y,formAction:d}=qe({resource:e.resource,id:e.id,action:e.action}),[T,x]=React.useState(false),v=d==="edit",f=d==="clone",P=d==="create",M=t({resource:m,meta:u}),Q=(v||f)&&!!e.resource,g=typeof e.id<"u",C=((K=e.queryOptions)==null?void 0:K.enabled)===false;$u(Q&&!g&&!C,pu(d,y,p));let h=qr({redirectFromProps:e.redirect,action:d,redirectOptions:s}),D=o((te=v?"list":"edit",R=p,S={})=>{a({redirect:te,resource:m,id:R,meta:{...u,...S}});},"redirect"),k=zt({resource:y,id:p,queryOptions:{enabled:!P&&p!==void 0,...e.queryOptions},liveMode:e.liveMode,onLiveEvent:e.onLiveEvent,liveParams:e.liveParams,meta:{...M,...e.queryMeta},dataProviderName:e.dataProviderName,overtimeOptions:{enabled:false}}),E=Xt({mutationOptions:e.createMutationOptions,overtimeOptions:{enabled:false}}),L=To({mutationOptions:e.updateMutationOptions,overtimeOptions:{enabled:false}}),U=v?L:E,N=U.isLoading||k.isFetching,{elapsedTime:b}=fe({...e.overtimeOptions,isLoading:N});React.useEffect(()=>()=>{var te;(te=e.autoSave)!=null&&te.invalidateOnUnmount&&T&&y&&typeof p<"u"&&r({id:p,invalidates:e.invalidates||["list","many","detail"],dataProviderName:e.dataProviderName,resource:y});},[(j=e.autoSave)==null?void 0:j.invalidateOnUnmount,T]);let F=o(async(te,{isAutosave:R=false}={})=>{let S=c==="pessimistic";i(false);let B=o($=>D(h,$),"onSuccessRedirect");return new Promise(($,X)=>{if(!m)return X(au);if(f&&!p)return X(iu);if(!te)return X(uu);if(R&&!v)return X(cu);!S&&!R&&(br(()=>B()),$());let ne={values:te,resource:y??m.name,meta:{...M,...e.mutationMeta},metaData:{...M,...e.mutationMeta},dataProviderName:e.dataProviderName,invalidates:R?[]:e.invalidates,successNotification:R?false:e.successNotification,errorNotification:R?false:e.errorNotification,...v?{id:p??"",mutationMode:c,undoableTimeout:e.undoableTimeout,optimisticUpdateMap:e.optimisticUpdateMap}:{}},{mutateAsync:Y}=v?L:E;Y(ne,{onSuccess:e.onMutationSuccess?(O,_,ae)=>{var J;(J=e.onMutationSuccess)==null||J.call(e,O,te,ae,R);}:void 0,onError:e.onMutationError?(O,_,ae)=>{var J;(J=e.onMutationError)==null||J.call(e,O,te,ae,R);}:void 0}).then(O=>{S&&!R&&br(()=>{var _;return B((_=O==null?void 0:O.data)==null?void 0:_.id)}),R&&x(true),$(O);}).catch(X);})},"onFinish"),V=oo(te=>F(te,{isAutosave:true}),((re=e.autoSave)==null?void 0:re.debounce)||1e3,"Cancelled by debounce"),G={elapsedTime:b},W={status:L.status,data:L.data,error:L.error};return {onFinish:F,onFinishAutoSave:V,formLoading:N,mutationResult:U,mutation:U,queryResult:k,query:k,autoSaveProps:W,id:p,setId:l,redirect:D,overtime:G}},"useForm"),au=new Error("[useForm]: `resource` is not defined or not matched but is required"),iu=new Error("[useForm]: `id` is not defined but is required in edit and clone actions"),uu=new Error("[useForm]: `values` is not provided but is required"),cu=new Error("[useForm]: `autoSave` is only allowed in edit action"),pu=o((e,t,r)=>`[useForm]: action: "${e}", resource: "${t}", id: ${r}

If you don't use the \`setId\` method to set the \`id\`, you should pass the \`id\` prop to \`useForm\`. Otherwise, \`useForm\` will not be able to infer the \`id\` from the current URL with custom resource provided.

See https://refine.dev/docs/data/hooks/use-form/#id-`,"idWarningMessage");var fn=o(()=>{let{show:e,edit:t,list:r,create:s}=he();return core_core__loadShare__react__loadShare__.useCallback(({redirect:i,resource:a,id:u,meta:c={}})=>{if(i&&a)return a.show&&i==="show"&&u?e(a,u,void 0,c):a.edit&&i==="edit"&&u?t(a,u,void 0,c):a.create&&i==="create"?s(a,void 0,c):r(a,"push",c)},[])},"useRedirectionAfterSubmission");var Mo=o(()=>{let e=core_core__loadShare__react__loadShare__.useContext(ft);return React.useMemo(()=>(e==null?void 0:e.back)??(()=>()=>{}),[e==null?void 0:e.back])()},"useBack");var Ut=o(()=>{let e=oe(),{resource:t,resources:r}=q(),s=Te();return React.useCallback(({resource:i,action:a,meta:u})=>{var y;let c=i||t;if(!c)return;let l=(y=Se(c,r,e==="legacy").find(d=>d.action===a))==null?void 0:y.route;return l?We(l,c==null?void 0:c.meta,s,u):void 0},[r,t,s])},"useGetToPath");var Pe=o(()=>{let e=core_core__loadShare__react__loadShare__.useContext(ft),{select:t}=q(),r=Ut(),n=React.useMemo(()=>(e==null?void 0:e.go)??(()=>()=>{}),[e==null?void 0:e.go])();return core_core__loadShare__react__loadShare__.useCallback(a=>{if(typeof a.to!="object")return n({...a,to:a.to});let{resource:u}=t(a.to.resource);xu(a.to,u);let c=r({resource:u,action:a.to.action,meta:{id:a.to.id,...a.to.meta}});return n({...a,to:c})},[t,n])},"useGo"),xu=o((e,t)=>{if(!(e!=null&&e.action)||!(e!=null&&e.resource))throw new Error('[useGo]: "action" or "resource" is required.');if(["edit","show","clone"].includes(e==null?void 0:e.action)&&!e.id)throw new Error(`[useGo]: [action: ${e.action}] requires an "id" for resource [resource: ${e.resource}]`);if(!t[e.action])throw new Error(`[useGo]: [action: ${e.action}] is not defined for [resource: ${e.resource}]`)},"handleResourceErrors");var he=o(()=>{let{resources:e}=q(),t=oe(),{useHistory:r}=pe(),s=r(),n=Te(),i=Pe(),a=Mo(),u=o((g,C="push")=>{t==="legacy"?s[C](g):i({to:g,type:C});},"handleUrl"),c=o((g,C={})=>{var k;if(t==="legacy"){let E=typeof g=="string"?Ee(g,e,true)??{name:g,route:g}:g,L=Se(E,e,true).find(U=>U.action==="create");return L?We(L.route,E==null?void 0:E.meta,n,C):""}let h=typeof g=="string"?Ee(g,e)??{name:g}:g,D=(k=Se(h,e).find(E=>E.action==="create"))==null?void 0:k.route;return D?i({to:We(D,h==null?void 0:h.meta,n,C),type:"path",query:C.query}):""},"createUrl"),p=o((g,C,h={})=>{var L;let D=encodeURIComponent(C);if(t==="legacy"){let U=typeof g=="string"?Ee(g,e,true)??{name:g,route:g}:g,w=Se(U,e,true).find(N=>N.action==="edit");return w?We(w.route,U==null?void 0:U.meta,n,{...h,id:D}):""}let k=typeof g=="string"?Ee(g,e)??{name:g}:g,E=(L=Se(k,e).find(U=>U.action==="edit"))==null?void 0:L.route;return E?i({to:We(E,k==null?void 0:k.meta,n,{...h,id:D}),type:"path",query:h.query}):""},"editUrl"),l=o((g,C,h={})=>{var L;let D=encodeURIComponent(C);if(t==="legacy"){let U=typeof g=="string"?Ee(g,e,true)??{name:g,route:g}:g,w=Se(U,e,true).find(N=>N.action==="clone");return w?We(w.route,U==null?void 0:U.meta,n,{...h,id:D}):""}let k=typeof g=="string"?Ee(g,e)??{name:g}:g,E=(L=Se(k,e).find(U=>U.action==="clone"))==null?void 0:L.route;return E?i({to:We(E,k==null?void 0:k.meta,n,{...h,id:D}),type:"path",query:h.query}):""},"cloneUrl"),m=o((g,C,h={})=>{var L;let D=encodeURIComponent(C);if(t==="legacy"){let U=typeof g=="string"?Ee(g,e,true)??{name:g,route:g}:g,w=Se(U,e,true).find(N=>N.action==="show");return w?We(w.route,U==null?void 0:U.meta,n,{...h,id:D}):""}let k=typeof g=="string"?Ee(g,e)??{name:g}:g,E=(L=Se(k,e).find(U=>U.action==="show"))==null?void 0:L.route;return E?i({to:We(E,k==null?void 0:k.meta,n,{...h,id:D}),type:"path",query:h.query}):""},"showUrl"),y=o((g,C={})=>{var k;if(t==="legacy"){let E=typeof g=="string"?Ee(g,e,true)??{name:g,route:g}:g,L=Se(E,e,true).find(U=>U.action==="list");return L?We(L.route,E==null?void 0:E.meta,n,C):""}let h=typeof g=="string"?Ee(g,e)??{name:g}:g,D=(k=Se(h,e).find(E=>E.action==="list"))==null?void 0:k.route;return D?i({to:We(D,h==null?void 0:h.meta,n,C),type:"path",query:C.query}):""},"listUrl");return {create:o((g,C="push",h={})=>{u(c(g,h),C);},"create"),createUrl:c,edit:o((g,C,h="push",D={})=>{u(p(g,C,D),h);},"edit"),editUrl:p,clone:o((g,C,h="push",D={})=>{u(l(g,C,D),h);},"clone"),cloneUrl:l,show:o((g,C,h="push",D={})=>{u(m(g,C,D),h);},"show"),showUrl:m,list:o((g,C="push",h={})=>{u(y(g,h),C);},"list"),listUrl:y,push:o((g,...C)=>{t==="legacy"?s.push(g,...C):i({to:g,type:"push"});},"push"),replace:o((g,...C)=>{t==="legacy"?s.replace(g,...C):i({to:g,type:"replace"});},"replace"),goBack:o(()=>{t==="legacy"?s.goBack():a();},"goBack")}},"useNavigation");var nR=o(({resource:e,id:t,meta:r,metaData:s,queryOptions:n,overtimeOptions:i,...a}={})=>{let{resource:u,identifier:c,id:p,setId:l}=qe({id:t,resource:e}),y=ue()({resource:u,meta:I(r,s)});$u(!!e&&!p,Pu(c,p));let d=zt({resource:c,id:p??"",queryOptions:{enabled:p!==void 0,...n},meta:y,metaData:y,overtimeOptions:i,...a});return {queryResult:d,query:d,showId:p,setShowId:l,overtime:d.overtime}},"useShow"),Pu=o((e,t)=>`[useShow]: resource: "${e}", id: ${t} 

If you don't use the \`setShowId\` method to set the \`showId\`, you should pass the \`id\` prop to \`useShow\`. Otherwise, \`useShow\` will not be able to infer the \`id\` from the current URL. 

See https://refine.dev/docs/data/hooks/use-show/#resource`,"idWarningMessage");var mR=o(({resourceName:e,resource:t,mapData:r=o(l=>l,"mapData"),paparseOptions:s,batchSize:n=Number.MAX_SAFE_INTEGER,onFinish:i,meta:a,metaData:u,onProgress:c,dataProviderName:p}={})=>{let[l,m]=core_core__loadShare__react__loadShare__.useState(0),[y,d]=core_core__loadShare__react__loadShare__.useState(0),[T,x]=core_core__loadShare__react__loadShare__.useState(false),{resource:v,identifier:f}=q(t??e),P=ue(),M=bo(),Q=Xt(),g=P({resource:v,meta:I(a,u)}),C;n===1?C=Q:C=M;let h=o(()=>{d(0),m(0),x(false);},"handleCleanup"),D=o(E=>{let L={succeeded:E.filter(U=>U.type==="success"),errored:E.filter(U=>U.type==="error")};i==null||i(L),x(false);},"handleFinish");core_core__loadShare__react__loadShare__.useEffect(()=>{c==null||c({totalAmount:y,processedAmount:l});},[y,l]);let k=o(({file:E})=>(h(),new Promise(L=>{x(true),bu.parse(E,{complete:async({data:U})=>{let w=sr(U,r);if(d(w.length),n===1){let N=w.map(F=>o(async()=>({response:await Q.mutateAsync({resource:f??"",values:F,successNotification:false,errorNotification:false,dataProviderName:p,meta:g,metaData:g}),value:F}),"fn")),b=await gr(N,({response:F,value:V})=>(m(G=>G+1),{response:[F.data],type:"success",request:[V]}),(F,V)=>({response:[F],type:"error",request:[w[V]]}));L(b);}else {let N=chunk(w,n),b=N.map(V=>o(async()=>({response:await M.mutateAsync({resource:f??"",values:V,successNotification:false,errorNotification:false,dataProviderName:p,meta:g,metaData:g}),value:V,currentBatchLength:V.length}),"fn")),F=await gr(b,({response:V,currentBatchLength:G,value:W})=>(m(K=>K+G),{response:V.data,type:"success",request:W}),(V,G)=>({response:[V],type:"error",request:N[G]}));L(F);}},...s});}).then(L=>(D(L),L))),"handleChange");return {inputProps:{type:"file",accept:".csv",onChange:E=>{E.target.files&&E.target.files.length>0&&k({file:E.target.files[0]});}},mutationResult:C,isLoading:T,handleChange:k}},"useImport");var TR=o(({defaultVisible:e=false}={})=>{let[t,r]=core_core__loadShare__react__loadShare__.useState(e),s=core_core__loadShare__react__loadShare__.useCallback(()=>r(true),[t]),n=core_core__loadShare__react__loadShare__.useCallback(()=>r(false),[t]);return {visible:t,show:s,close:n}},"useModal");var Du=o(({resource:e,action:t,meta:r,legacy:s})=>Ut()({resource:e,action:t,meta:r,legacy:s}),"useToPath");var Mu=o((e,t)=>{let r=core_core__loadShare__react__loadShare__.useContext(ft),s=r==null?void 0:r.Link,n=Pe(),i="";return "go"in e&&(r!=null&&r.go||$u(true,"[Link]: `routerProvider` is not found. To use `go`, Please make sure that you have provided the `routerProvider` for `<Refine />` https://refine.dev/docs/routing/router-provider/ \n"),i=n({...e.go,type:"path"})),"to"in e&&(i=e.to),s?React.createElement(s,{ref:t,...e,to:i,go:void 0}):React.createElement("a",{ref:t,href:i,...e,to:void 0,go:void 0})},"LinkComponent"),Io=core_core__loadShare__react__loadShare__.forwardRef(Mu);var yt=o(()=>Io,"useLink");var gt={useHistory:()=>false,useLocation:()=>false,useParams:()=>({}),Prompt:()=>null,Link:()=>null},er=React.createContext(gt),xn=o(({children:e,useHistory:t,useLocation:r,useParams:s,Prompt:n,Link:i,routes:a})=>React.createElement(er.Provider,{value:{useHistory:t??gt.useHistory,useLocation:r??gt.useLocation,useParams:s??gt.useParams,Prompt:n??gt.Prompt,Link:i??gt.Link,routes:a??gt.routes}},e),"LegacyRouterContextProvider");var pe=o(()=>{let e=core_core__loadShare__react__loadShare__.useContext(er),{useHistory:t,useLocation:r,useParams:s,Prompt:n,Link:i,routes:a}=e??gt;return {useHistory:t,useLocation:r,useParams:s,Prompt:n,Link:i,routes:a}},"useRouterContext");var ct=React.createContext({options:{buttons:{enableAccessControl:true,hideIfUnauthorized:false}}}),Pn=o(({can:e,children:t,options:r})=>React.createElement(ct.Provider,{value:{can:e,options:r?{...r,buttons:{enableAccessControl:true,hideIfUnauthorized:false,...r.buttons}}:{buttons:{enableAccessControl:true,hideIfUnauthorized:false},queryOptions:void 0}}},t),"AccessControlContextProvider");var kt=o(e=>{if(!e)return;let{icon:t,list:r,edit:s,create:n,show:i,clone:a,children:u,meta:c,options:p,...l}=e,{icon:m,...y}=c??{},{icon:d,...T}=p??{};return {...l,...c?{meta:y}:{},...p?{options:T}:{}}},"sanitizeResource");var kr=o(({action:e,resource:t,params:r,queryOptions:s})=>{let{can:n,options:i}=core_core__loadShare__react__loadShare__.useContext(ct),{keys:a,preferLegacyKeys:u}=Z(),{queryOptions:c}=i||{},p={...c,...s},{resource:l,...m}=r??{},y=kt(l),d=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQuery({queryKey:a().access().resource(t).action(e).params({params:{...m,resource:y},enabled:p==null?void 0:p.enabled}).get(u),queryFn:()=>(n==null?void 0:n({action:e,resource:t,params:{...m,resource:y}}))??Promise.resolve({can:true}),enabled:typeof n<"u",...p,meta:{...p==null?void 0:p.meta,...k("useCan",u,t,["useButtonCanAccess","useNavigationButton"])},retry:false});return typeof n>"u"?{data:{can:true}}:d},"useCan");var cC=o(()=>{let{can:e}=React.useContext(ct);return {can:React.useMemo(()=>e?o(async({params:s,...n})=>{let i=s!=null&&s.resource?kt(s.resource):void 0;return e({...n,...s?{params:{...s,resource:i}}:{}})},"canWithSanitizedResource"):void 0,[e])}},"useCanWithoutCache");var PC=o(e=>{let[t,r]=core_core__loadShare__react__loadShare__.useState([]),[s,n]=core_core__loadShare__react__loadShare__.useState([]),[i,a]=core_core__loadShare__react__loadShare__.useState([]),{resource:u,sort:c,sorters:p,filters:l=[],optionLabel:m="title",optionValue:y="id",searchField:d=typeof m=="string"?m:"title",debounce:T=300,successNotification:x,errorNotification:v,defaultValueQueryOptions:f,queryOptions:P,fetchSize:M,pagination:Q,hasPagination:g=false,liveMode:C,defaultValue:h=[],selectedOptionsOrder:D="in-place",onLiveEvent:k,onSearch:E,liveParams:L,meta:U,metaData:w,dataProviderName:N,overtimeOptions:b}=e,F=core_core__loadShare__react__loadShare__.useCallback(O=>typeof m=="string"?get(O,m):m(O),[m]),V=core_core__loadShare__react__loadShare__.useCallback(O=>typeof y=="string"?get(O,y):y(O),[y]),{resource:G,identifier:W}=q(u),j=ue()({resource:G,meta:I(U,w)}),re=Array.isArray(h)?h:[h],te=core_core__loadShare__react__loadShare__.useCallback(O=>{a(O.data.map(_=>({label:F(_),value:V(_)})));},[m,y]),R=f??P,S=go({resource:W,ids:re,queryOptions:{...R,enabled:re.length>0&&((R==null?void 0:R.enabled)??true),onSuccess:O=>{var _;te(O),(_=R==null?void 0:R.onSuccess)==null||_.call(R,O);}},overtimeOptions:{enabled:false},meta:j,metaData:j,liveMode:"off",dataProviderName:N}),B=core_core__loadShare__react__loadShare__.useCallback(O=>{n(O.data.map(_=>({label:F(_),value:V(_)})));},[m,y]),H=$t({resource:W,sorters:I(p,c),filters:l.concat(t),pagination:{current:Q==null?void 0:Q.current,pageSize:(Q==null?void 0:Q.pageSize)??M,mode:Q==null?void 0:Q.mode},hasPagination:g,queryOptions:{...P,onSuccess:O=>{var _;B(O),(_=P==null?void 0:P.onSuccess)==null||_.call(P,O);}},overtimeOptions:{enabled:false},successNotification:x,errorNotification:v,meta:j,metaData:j,liveMode:C,liveParams:L,onLiveEvent:k,dataProviderName:N}),{elapsedTime:$}=fe({...b,isLoading:H.isFetching||S.isFetching}),X=core_core__loadShare__react__loadShare__.useMemo(()=>uniqBy(D==="in-place"?[...s,...i]:[...i,...s],"value"),[s,i]),ne=core_core__loadShare__react__loadShare__.useRef(E),Y=core_core__loadShare__react__loadShare__.useMemo(()=>debounce(O=>{if(ne.current){r(ne.current(O));return}if(!O){r([]);return}r([{field:d,operator:"contains",value:O}]);},T),[d,T]);return core_core__loadShare__react__loadShare__.useEffect(()=>{ne.current=E;},[E]),{queryResult:H,defaultValueQueryResult:S,query:H,defaultValueQuery:S,options:X,onSearch:Y,overtime:{elapsedTime:$}}},"useSelect");var Un=[],En=[];function IC({initialCurrent:e,initialPageSize:t,hasPagination:r=true,pagination:s,initialSorter:n,permanentSorter:i=En,defaultSetFilterBehavior:a,initialFilter:u,permanentFilter:c=Un,filters:p,sorters:l,syncWithLocation:m,resource:y,successNotification:d,errorNotification:T,queryOptions:x,liveMode:v,onLiveEvent:f,liveParams:P,meta:M,metaData:Q,dataProviderName:g,overtimeOptions:C}={}){var Wo,Ho,$o,zo,_o;let{syncWithLocation:h}=to(),D=m??h,k=sn(v),E=oe(),{useLocation:L}=pe(),{search:U,pathname:w}=L(),N=ue(),b=Te(),F=((p==null?void 0:p.mode)||"server")==="server",V=((l==null?void 0:l.mode)||"server")==="server",G=r===false?"off":"server",W=((s==null?void 0:s.mode)??G)!=="off",K=I(s==null?void 0:s.current,e),j=I(s==null?void 0:s.pageSize,t),re=I(M,Q),{parsedCurrent:te,parsedPageSize:R,parsedSorter:S,parsedFilters:B}=vr(U??"?"),H=I(p==null?void 0:p.initial,u),$=I(p==null?void 0:p.permanent,c)??Un,X=I(l==null?void 0:l.initial,n),ne=I(l==null?void 0:l.permanent,i)??En,Y=I(p==null?void 0:p.defaultBehavior,a)??"merge",O,_,ae,J;D?(O=((Wo=b==null?void 0:b.params)==null?void 0:Wo.current)||te||K||1,_=((Ho=b==null?void 0:b.params)==null?void 0:Ho.pageSize)||R||j||10,ae=(($o=b==null?void 0:b.params)==null?void 0:$o.sorters)||(S.length?S:X),J=((zo=b==null?void 0:b.params)==null?void 0:zo.filters)||(B.length?B:H)):(O=K||1,_=j||10,ae=X,J=H);let{replace:we}=he(),ye=Pe(),{resource:Ve,identifier:Ne}=q(y),se=N({resource:Ve,meta:re});React.useEffect(()=>{$u(typeof Ne>"u","useTable: `resource` is not defined.");},[Ne]);let[me,ce]=core_core__loadShare__react__loadShare__.useState(Lr(ne,ae??[])),[ve,rt]=core_core__loadShare__react__loadShare__.useState(Er($,J??[])),[Ke,Ct]=core_core__loadShare__react__loadShare__.useState(O),[Ge,Tt]=core_core__loadShare__react__loadShare__.useState(_),xt=o(()=>{if(E==="new"){let{sorters:jo,filters:Nc,pageSize:Bc,current:Kc,...sa}=(b==null?void 0:b.params)??{};return sa}let{sorter:Ie,filters:ot,pageSize:zr,current:_r,...jr}=Dn.parse(U,{ignoreQueryPrefix:true});return jr},"getCurrentQueryParams"),bt=o(({pagination:{current:Ie,pageSize:ot},sorter:zr,filters:_r})=>{if(E==="new")return ye({type:"path",options:{keepHash:true,keepQuery:true},query:{...W?{current:Ie,pageSize:ot}:{},sorters:zr,filters:_r,...xt()}})??"";let jr=Dn.parse(U==null?void 0:U.substring(1)),jo=Dr({pagination:{pageSize:ot,current:Ie},sorters:me??zr,filters:_r,...jr});return `${w??""}?${jo??""}`},"createLinkForSyncWithLocation");core_core__loadShare__react__loadShare__.useEffect(()=>{U===""&&(Ct(O),Tt(_),ce(Lr(ne,ae??[])),rt(Er($,J??[])));},[U]),core_core__loadShare__react__loadShare__.useEffect(()=>{if(D){let Ie=xt();if(E==="new")ye({type:"replace",options:{keepQuery:true},query:{...W?{pageSize:Ge,current:Ke}:{},sorters:differenceWith(me,ne,isEqual),filters:differenceWith(ve,$,isEqual)}});else {let ot=Dr({...W?{pagination:{pageSize:Ge,current:Ke}}:{},sorters:differenceWith(me,ne,isEqual),filters:differenceWith(ve,$,isEqual),...Ie});return we==null?void 0:we(`${w}?${ot}`,void 0,{shallow:true})}}},[D,Ke,Ge,me,ve]);let or=$t({resource:Ne,hasPagination:r,pagination:{current:Ke,pageSize:Ge,mode:s==null?void 0:s.mode},filters:F?St($,ve):void 0,sorters:V?Ur(ne,me):void 0,queryOptions:x,overtimeOptions:C,successNotification:d,errorNotification:T,meta:se,metaData:se,liveMode:k,liveParams:P,onLiveEvent:f,dataProviderName:g}),Bo=core_core__loadShare__react__loadShare__.useCallback(Ie=>{rt(ot=>St($,Ie,ot));},[$]),Ko=core_core__loadShare__react__loadShare__.useCallback(Ie=>{rt(St($,Ie));},[$]),Go=core_core__loadShare__react__loadShare__.useCallback(Ie=>{rt(ot=>St($,Ie(ot)));},[$]),oa=core_core__loadShare__react__loadShare__.useCallback((Ie,ot=Y)=>{typeof Ie=="function"?Go(Ie):ot==="replace"?Ko(Ie):Bo(Ie);},[Go,Ko,Bo]),Oo=core_core__loadShare__react__loadShare__.useCallback(Ie=>{ce(()=>Ur(ne,Ie));},[ne]);return {tableQueryResult:or,tableQuery:or,sorters:me,setSorters:Oo,sorter:me,setSorter:Oo,filters:ve,setFilters:oa,current:Ke,setCurrent:Ct,pageSize:Ge,setPageSize:Tt,pageCount:Ge?Math.ceil((((_o=or.data)==null?void 0:_o.total)??0)/Ge):1,createLinkForSyncWithLocation:bt,overtime:or.overtime}}o(IC,"useTable");var Et=React.createContext({}),Mn=o(({create:e,get:t,update:r,children:s})=>React.createElement(Et.Provider,{value:{create:e,get:t,update:r}},s),"AuditLogContextProvider");var Je=o(({logMutationOptions:e,renameMutationOptions:t}={})=>{let r=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQueryClient(),s=core_core__loadShare__react__loadShare__.useContext(Et),{keys:n,preferLegacyKeys:i}=Z(),a=ie(),{resources:u}=core_core__loadShare__react__loadShare__.useContext(Rt),{data:c,refetch:p,isLoading:l}=no({v3LegacyAuthProviderCompatible:!!(a!=null&&a.isLegacy),queryOptions:{enabled:!!(s!=null&&s.create)}}),m=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation(async d=>{var f,P,M,Q,g;let T=Ee(d.resource,u),x=I((f=T==null?void 0:T.meta)==null?void 0:f.audit,(P=T==null?void 0:T.options)==null?void 0:P.audit,(Q=(M=T==null?void 0:T.options)==null?void 0:M.auditLog)==null?void 0:Q.permissions);if(x&&!Xr(x,d.action))return;let v;return l&&(s!=null&&s.create)&&(v=await p()),await((g=s.create)==null?void 0:g.call(s,{...d,author:c??(v==null?void 0:v.data)}))},{mutationKey:n().audit().action("log").get(),...e,meta:{...e==null?void 0:e.meta,...k("useLog",i)}}),y=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation(async d=>{var T;return await((T=s.update)==null?void 0:T.call(s,d))},{onSuccess:d=>{d!=null&&d.resource&&r.invalidateQueries(n().audit().resource((d==null?void 0:d.resource)??"").action("list").get(i));},mutationKey:n().audit().action("rename").get(),...t,meta:{...t==null?void 0:t.meta,...k("useLog",i)}});return {log:m,rename:y}},"useLog");var eb=o(({resource:e,action:t,meta:r,author:s,metaData:n,queryOptions:i})=>{let{get:a}=core_core__loadShare__react__loadShare__.useContext(Et),{keys:u,preferLegacyKeys:c}=Z();return core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQuery({queryKey:u().audit().resource(e).action("list").params(r).get(c),queryFn:()=>(a==null?void 0:a({resource:e,action:t,author:s,meta:r,metaData:n}))??Promise.resolve([]),enabled:typeof a<"u",...i,retry:false,meta:{...i==null?void 0:i.meta,...k("useLogList",c,e)}})},"useLogList");var fb=o(({meta:e={}}={})=>{let t=oe(),{i18nProvider:r}=core_core__loadShare__react__loadShare__.useContext(Xe),s=Te(),n=z(),{resources:i,resource:a,action:u}=q(),{options:{textTransformers:c}}=ge(),p=[];if(!(a!=null&&a.name))return {breadcrumbs:p};let l=o(m=>{var d,T,x,v,f,P;let y=typeof m=="string"?Ee(m,i,t==="legacy")??{name:m}:m;if(y){let M=I((d=y==null?void 0:y.meta)==null?void 0:d.parent,y==null?void 0:y.parentName);M&&l(M);let Q=Se(y,i,t==="legacy").find(h=>h.action==="list"),g=(T=Q==null?void 0:Q.resource)!=null&&T.list?Q==null?void 0:Q.route:void 0,C=g?t==="legacy"?g:We(g,y==null?void 0:y.meta,s,e):void 0;p.push({label:I((x=y.meta)==null?void 0:x.label,(v=y.options)==null?void 0:v.label)??n(`${y.name}.${y.name}`,c.humanize(y.name)),href:C,icon:I((f=y.meta)==null?void 0:f.icon,(P=y.options)==null?void 0:P.icon,y.icon)});}},"addBreadcrumb");if(l(a),u&&u!=="list"){let m=`actions.${u}`,y=n(m);typeof r<"u"&&y===m?($u(true,`[useBreadcrumb]: Breadcrumb missing translate key for the "${u}" action. Please add "actions.${u}" key to your translation file.
For more information, see https://refine.dev/docs/api-reference/core/hooks/useBreadcrumb/#i18n-support`),p.push({label:n(`buttons.${u}`,c.humanize(u))})):p.push({label:n(m,c.humanize(u))});}return {breadcrumbs:p}},"useBreadcrumb");var Ft=o((e,t,r=false)=>{let s=[],n=ze(e,t);for(;n;)s.push(n),n=ze(n,t);return s.reverse(),`/${[...s,e].map(a=>ke((r?a.route:void 0)??a.identifier??a.name)).join("/").replace(/^\//,"")}`},"createResourceKey");var An=o((e,t=false)=>{let r={item:{name:"__root__"},children:{}};e.forEach(n=>{let i=[],a=ze(n,e);for(;a;)i.push(a),a=ze(a,e);i.reverse();let u=r;i.forEach(p=>{let l=(t?p.route:void 0)??p.identifier??p.name;u.children[l]||(u.children[l]={item:p,children:{}}),u=u.children[l];});let c=(t?n.route:void 0)??n.identifier??n.name;u.children[c]||(u.children[c]={item:n,children:{}});});let s=o(n=>{let i=[];return Object.keys(n.children).forEach(a=>{let u=Ft(n.children[a].item,e,t),c={...n.children[a].item,key:u,children:s(n.children[a])};i.push(c);}),i},"flatten");return s(r)},"createTree");var kn=o(e=>e.split("?")[0].split("#")[0].replace(/(.+)(\/$)/,"$1"),"getCleanPath"),zu=o(({meta:e,hideOnMissingParameter:t=true}={hideOnMissingParameter:true})=>{let r=z(),s=Ut(),n=oe(),{resource:i,resources:a}=q(),{pathname:u}=Te(),{useLocation:c}=pe(),{pathname:p}=c(),l=ht(),y=`/${((n==="legacy"?kn(p):u?kn(u):void 0)??"").replace(/^\//,"")}`,d=i?Ft(i,a,n==="legacy"):y??"",T=React.useMemo(()=>{if(!i)return [];let f=ze(i,a),P=[Ft(i,a)];for(;f;)P.push(Ft(f,a)),f=ze(f,a);return P},[]),x=React.useCallback(f=>{var M,Q,g,C,h,D;if(I((M=f==null?void 0:f.meta)==null?void 0:M.hide,(Q=f==null?void 0:f.options)==null?void 0:Q.hide)||!(f!=null&&f.list)&&f.children.length===0)return;let P=f.list?s({resource:f,action:"list",legacy:n==="legacy",meta:e}):void 0;if(!(t&&P&&P.match(/(\/|^):(.+?)(\/|$){1}/)))return {...f,route:P,icon:I((g=f.meta)==null?void 0:g.icon,(C=f.options)==null?void 0:C.icon,f.icon),label:I((h=f==null?void 0:f.meta)==null?void 0:h.label,(D=f==null?void 0:f.options)==null?void 0:D.label)??r(`${f.name}.${f.name}`,l(f.name,"plural"))}},[n,e,s,r,t]),v=React.useMemo(()=>{let f=An(a,n==="legacy"),P=o(M=>M.flatMap(Q=>{let g=P(Q.children),C=x({...Q,children:g});return C?[C]:[]}),"prepare");return P(f)},[a,n,x]);return {defaultOpenKeys:T,selectedKey:d,menuItems:v}},"useMenu");var ko=core_core__loadShare__react__loadShare__.createContext({}),Zu=o(({children:e,value:t})=>{let r=Br(),s=core_core__loadShare__react__loadShare__.useMemo(()=>({...r,...t}),[r,t]);return React.createElement(ko.Provider,{value:s},e)},"MetaContextProvider"),Br=o(()=>{if(!core_core__loadShare__react__loadShare__.useContext(ko))throw new Error("useMetaContext must be used within a MetaContextProvider");return core_core__loadShare__react__loadShare__.useContext(ko)},"useMetaContext");var ue=o(()=>{let{params:e}=Te(),t=Br();return o(({resource:s,meta:n}={})=>{let{meta:i}=kt(s)??{meta:{}},{filters:a,sorters:u,current:c,pageSize:p,...l}=e??{},m={...i,...l,...n};return t!=null&&t.tenantId&&(m.tenantId=t.tenantId),m},"getMetaFn")},"useMeta");var At=o(()=>{let{options:e}=React.useContext(Qe);return e},"useRefineOptions");var Qn=o(e=>{let t=oe(),{useParams:r}=pe(),s=Te(),n=r(),i=t==="legacy"?n.id:s.id;return e??i},"useId");var Vn=o(e=>{let t=oe(),{useParams:r}=pe(),s=Te(),n=r(),i=t==="legacy"?n.action:s.action;return e??i},"useAction");function qe(e){let{select:t,identifier:r}=q(),s=(e==null?void 0:e.resource)??r,{identifier:n=void 0,resource:i=void 0}=s?t(s,true):{},a=r===n,u=Qn(),c=Vn(e==null?void 0:e.action),p=React.useMemo(()=>a?(e==null?void 0:e.id)??u:e==null?void 0:e.id,[a,e==null?void 0:e.id,u]),[l,m]=React.useState(p);React.useMemo(()=>m(p),[p]);let y=React.useMemo(()=>!a&&!(e!=null&&e.action)?"create":c==="edit"||c==="clone"?c:"create",[c,a,e==null?void 0:e.action]);return {id:l,setId:m,resource:i,action:c,identifier:n,formAction:y}}o(qe,"useResourceParams");function Gr({type:e}){let t=z(),{textTransformers:{humanize:r}}=At(),s=`buttons.${e}`,n=r(e);return {label:t(s,n)}}o(Gr,"useActionableButton");var Or=o(e=>{var p,l,m;let t=z(),r=React.useContext(ct),s=((p=e.accessControl)==null?void 0:p.enabled)??r.options.buttons.enableAccessControl,n=((l=e.accessControl)==null?void 0:l.hideIfUnauthorized)??r.options.buttons.hideIfUnauthorized,{data:i}=kr({resource:(m=e.resource)==null?void 0:m.name,action:e.action==="clone"?"create":e.action,params:{id:e.id,resource:e.resource},queryOptions:{enabled:s}}),a=React.useMemo(()=>i!=null&&i.can?"":i!=null&&i.reason?i.reason:t("buttons.notAccessTitle","You don't have permission to access"),[i==null?void 0:i.can,i==null?void 0:i.reason,t]),u=s&&n&&!(i!=null&&i.can),c=(i==null?void 0:i.can)===false;return {title:a,hidden:u,disabled:c,canAccess:i}},"useButtonCanAccess");function Qt(e){var P;let t=he(),r=oe(),s=yt(),{Link:n}=pe(),i=z(),a=ht(),{textTransformers:{humanize:u}}=At(),{id:c,resource:p,identifier:l}=qe({resource:e.resource,id:e.action==="create"?void 0:e.id}),{canAccess:m,title:y,hidden:d,disabled:T}=Or({action:e.action,accessControl:e.accessControl,id:c,resource:p}),x=r==="legacy"?n:s,v=React.useMemo(()=>{if(!p)return "";switch(e.action){case "create":case "list":return t[`${e.action}Url`](p,e.meta);default:return c?t[`${e.action}Url`](p,c,e.meta):""}},[p,c,e.meta,t[`${e.action}Url`]]),f=e.action==="list"?i(`${l??e.resource}.titles.list`,a(((P=p==null?void 0:p.meta)==null?void 0:P.label)??(p==null?void 0:p.label)??l??e.resource,"plural")):i(`buttons.${e.action}`,u(e.action));return {to:v,label:f,title:y,disabled:T,hidden:d,canAccess:m,LinkComponent:x}}o(Qt,"useNavigationButton");function qu(e){let t=z(),{mutate:r,isLoading:s,variables:n}=Po(),{setWarnWhen:i}=vt(),{mutationMode:a}=_e(e.mutationMode),{id:u,resource:c,identifier:p}=qe({resource:e.resource,id:e.id}),{title:l,disabled:m,hidden:y,canAccess:d}=Or({action:"delete",accessControl:e.accessControl,id:u,resource:c}),T=t("buttons.delete","Delete"),x=t("buttons.delete","Delete"),v=t("buttons.confirm","Are you sure?"),f=t("buttons.cancel","Cancel"),P=u===(n==null?void 0:n.id)&&s;return {label:T,title:l,hidden:y,disabled:m,canAccess:d,loading:P,confirmOkLabel:x,cancelLabel:f,confirmTitle:v,onConfirm:o(()=>{u&&p&&(i(false),r({id:u,resource:p,mutationMode:a,successNotification:e.successNotification,errorNotification:e.errorNotification,meta:e.meta,metaData:e.meta,dataProviderName:e.dataProviderName,invalidates:e.invalidates},{onSuccess:e.onSuccess}));},"onConfirm")}}o(qu,"useDeleteButton");function tc(e){let t=z(),{keys:r,preferLegacyKeys:s}=Z(),n=core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQueryClient(),i=Ae(),{identifier:a,id:u}=qe({resource:e.resource,id:e.id}),{resources:c}=q(),p=!!n.isFetching({queryKey:r().data(ee(a,e.dataProviderName,c)).resource(a).action("one").get(s)}),l=o(()=>{i({id:u,invalidates:["detail"],dataProviderName:e.dataProviderName,resource:a});},"onClick"),m=t("buttons.refresh","Refresh");return {onClick:l,label:m,loading:p}}o(tc,"useRefreshButton");var Zv=o(e=>Qt({...e,action:"show"}),"useShowButton"),Yv=o(e=>Qt({...e,action:"edit"}),"useEditButton"),Jv=o(e=>Qt({...e,action:"clone"}),"useCloneButton"),qv=o(e=>Qt({...e,action:"create"}),"useCreateButton"),eD=o(e=>Qt({...e,action:"list"}),"useListButton"),tD=o(()=>Gr({type:"save"}),"useSaveButton"),rD=o(()=>Gr({type:"export"}),"useExportButton"),oD=o(()=>Gr({type:"import"}),"useImportButton");var sc=o(()=>{let[e,t]=core_core__loadShare__react__loadShare__.useState(),r=z(),{push:s}=he(),n=Pe(),i=oe(),{resource:a,action:u}=q();return core_core__loadShare__react__loadShare__.useEffect(()=>{a&&u&&t(r("pages.error.info",{action:u,resource:a.name},`You may have forgotten to add the "${u}" component to "${a.name}" resource.`));},[a,u]),React.createElement(React.Fragment,null,React.createElement("h1",null,r("pages.error.404",void 0,"Sorry, the page you visited does not exist.")),e&&React.createElement("p",null,e),React.createElement("button",{onClick:()=>{i==="legacy"?s("/"):n({to:"/"});}},r("pages.error.backHome",void 0,"Back Home")))},"ErrorComponent");var Yr=o(()=>{let[e,t]=core_core__loadShare__react__loadShare__.useState(""),[r,s]=core_core__loadShare__react__loadShare__.useState(""),n=z(),i=ie(),{mutate:a}=Ht({v3LegacyAuthProviderCompatible:!!(i!=null&&i.isLegacy)});return React.createElement(React.Fragment,null,React.createElement("h1",null,n("pages.login.title","Sign in your account")),React.createElement("form",{onSubmit:u=>{u.preventDefault(),a({username:e,password:r});}},React.createElement("table",null,React.createElement("tbody",null,React.createElement("tr",null,React.createElement("td",null,n("pages.login.username",void 0,"username"),":"),React.createElement("td",null,React.createElement("input",{type:"text",size:20,autoCorrect:"off",spellCheck:false,autoCapitalize:"off",autoFocus:true,required:true,value:e,onChange:u=>t(u.target.value)}))),React.createElement("tr",null,React.createElement("td",null,n("pages.login.password",void 0,"password"),":"),React.createElement("td",null,React.createElement("input",{type:"password",required:true,size:20,value:r,onChange:u=>s(u.target.value)}))))),React.createElement("br",null),React.createElement("input",{type:"submit",value:"login"})))},"LoginPage");var Kn=o(({providers:e,registerLink:t,forgotPasswordLink:r,rememberMe:s,contentProps:n,wrapperProps:i,renderContent:a,formProps:u,title:c=void 0,hideForm:p,mutationVariables:l})=>{let m=oe(),y=yt(),{Link:d}=pe(),T=m==="legacy"?d:y,[x,v]=core_core__loadShare__react__loadShare__.useState(""),[f,P]=core_core__loadShare__react__loadShare__.useState(""),[M,Q]=core_core__loadShare__react__loadShare__.useState(false),g=z(),C=ie(),{mutate:h}=Ht({v3LegacyAuthProviderCompatible:!!(C!=null&&C.isLegacy)}),D=o((L,U)=>React.createElement(T,{to:L},U),"renderLink"),k=o(()=>e?e.map(L=>React.createElement("div",{key:L.name,style:{display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"1rem"}},React.createElement("button",{onClick:()=>h({...l,providerName:L.name}),style:{display:"flex",alignItems:"center"}},L==null?void 0:L.icon,L.label??React.createElement("label",null,L.label)))):null,"renderProviders"),E=React.createElement("div",{...n},React.createElement("h1",{style:{textAlign:"center"}},g("pages.login.title","Sign in to your account")),k(),!p&&React.createElement(React.Fragment,null,React.createElement("hr",null),React.createElement("form",{onSubmit:L=>{L.preventDefault(),h({...l,email:x,password:f,remember:M});},...u},React.createElement("div",{style:{display:"flex",flexDirection:"column",padding:25}},React.createElement("label",{htmlFor:"email-input"},g("pages.login.fields.email","Email")),React.createElement("input",{id:"email-input",name:"email",type:"text",size:20,autoCorrect:"off",spellCheck:false,autoCapitalize:"off",required:true,value:x,onChange:L=>v(L.target.value)}),React.createElement("label",{htmlFor:"password-input"},g("pages.login.fields.password","Password")),React.createElement("input",{id:"password-input",type:"password",name:"password",required:true,size:20,value:f,onChange:L=>P(L.target.value)}),s??React.createElement(React.Fragment,null,React.createElement("label",{htmlFor:"remember-me-input"},g("pages.login.buttons.rememberMe","Remember me"),React.createElement("input",{id:"remember-me-input",name:"remember",type:"checkbox",size:20,checked:M,value:M.toString(),onChange:()=>{Q(!M);}}))),React.createElement("br",null),r??D("/forgot-password",g("pages.login.buttons.forgotPassword","Forgot password?")),React.createElement("input",{type:"submit",value:g("pages.login.signin","Sign in")}),t??React.createElement("span",null,g("pages.login.buttons.noAccount","Don\u2019t have an account?")," ",D("/register",g("pages.login.register","Sign up")))))),t!==false&&p&&React.createElement("div",{style:{textAlign:"center"}},g("pages.login.buttons.noAccount","Don\u2019t have an account?")," ",D("/register",g("pages.login.register","Sign up"))));return React.createElement("div",{...i},a?a(E,c):E)},"LoginPage");var On=o(({providers:e,loginLink:t,wrapperProps:r,contentProps:s,renderContent:n,formProps:i,title:a=void 0,hideForm:u,mutationVariables:c})=>{let p=oe(),l=yt(),{Link:m}=pe(),y=p==="legacy"?m:l,[d,T]=core_core__loadShare__react__loadShare__.useState(""),[x,v]=core_core__loadShare__react__loadShare__.useState(""),f=z(),P=ie(),{mutate:M,isLoading:Q}=co({v3LegacyAuthProviderCompatible:!!(P!=null&&P.isLegacy)}),g=o((D,k)=>React.createElement(y,{to:D},k),"renderLink"),C=o(()=>e?e.map(D=>React.createElement("div",{key:D.name,style:{display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"1rem"}},React.createElement("button",{onClick:()=>M({...c,providerName:D.name}),style:{display:"flex",alignItems:"center"}},D==null?void 0:D.icon,D.label??React.createElement("label",null,D.label)))):null,"renderProviders"),h=React.createElement("div",{...s},React.createElement("h1",{style:{textAlign:"center"}},f("pages.register.title","Sign up for your account")),C(),!u&&React.createElement(React.Fragment,null,React.createElement("hr",null),React.createElement("form",{onSubmit:D=>{D.preventDefault(),M({...c,email:d,password:x});},...i},React.createElement("div",{style:{display:"flex",flexDirection:"column",padding:25}},React.createElement("label",{htmlFor:"email-input"},f("pages.register.fields.email","Email")),React.createElement("input",{id:"email-input",name:"email",type:"email",size:20,autoCorrect:"off",spellCheck:false,autoCapitalize:"off",required:true,value:d,onChange:D=>T(D.target.value)}),React.createElement("label",{htmlFor:"password-input"},f("pages.register.fields.password","Password")),React.createElement("input",{id:"password-input",name:"password",type:"password",required:true,size:20,value:x,onChange:D=>v(D.target.value)}),React.createElement("input",{type:"submit",value:f("pages.register.buttons.submit","Sign up"),disabled:Q}),t??React.createElement(React.Fragment,null,React.createElement("span",null,f("pages.login.buttons.haveAccount","Have an account?")," ",g("/login",f("pages.login.signin","Sign in"))))))),t!==false&&u&&React.createElement("div",{style:{textAlign:"center"}},f("pages.login.buttons.haveAccount","Have an account?")," ",g("/login",f("pages.login.signin","Sign in"))));return React.createElement("div",{...r},n?n(h,a):h)},"RegisterPage");var Wn=o(({loginLink:e,wrapperProps:t,contentProps:r,renderContent:s,formProps:n,title:i=void 0,mutationVariables:a})=>{let u=z(),c=oe(),p=yt(),{Link:l}=pe(),m=c==="legacy"?l:p,[y,d]=core_core__loadShare__react__loadShare__.useState(""),{mutate:T,isLoading:x}=lo(),v=o((P,M)=>React.createElement(m,{to:P},M),"renderLink"),f=React.createElement("div",{...r},React.createElement("h1",{style:{textAlign:"center"}},u("pages.forgotPassword.title","Forgot your password?")),React.createElement("hr",null),React.createElement("form",{onSubmit:P=>{P.preventDefault(),T({...a,email:y});},...n},React.createElement("div",{style:{display:"flex",flexDirection:"column",padding:25}},React.createElement("label",{htmlFor:"email-input"},u("pages.forgotPassword.fields.email","Email")),React.createElement("input",{id:"email-input",name:"email",type:"mail",autoCorrect:"off",spellCheck:false,autoCapitalize:"off",required:true,value:y,onChange:P=>d(P.target.value)}),React.createElement("input",{type:"submit",disabled:x,value:u("pages.forgotPassword.buttons.submit","Send reset instructions")}),React.createElement("br",null),e??React.createElement("span",null,u("pages.register.buttons.haveAccount","Have an account? ")," ",v("/login",u("pages.login.signin","Sign in"))))));return React.createElement("div",{...t},s?s(f,i):f)},"ForgotPasswordPage");var $n=o(({wrapperProps:e,contentProps:t,renderContent:r,formProps:s,title:n=void 0,mutationVariables:i})=>{let a=z(),u=ie(),{mutate:c,isLoading:p}=fo({v3LegacyAuthProviderCompatible:!!(u!=null&&u.isLegacy)}),[l,m]=core_core__loadShare__react__loadShare__.useState(""),[y,d]=core_core__loadShare__react__loadShare__.useState(""),T=React.createElement("div",{...t},React.createElement("h1",{style:{textAlign:"center"}},a("pages.updatePassword.title","Update Password")),React.createElement("hr",null),React.createElement("form",{onSubmit:x=>{x.preventDefault(),c({...i,password:l,confirmPassword:y});},...s},React.createElement("div",{style:{display:"flex",flexDirection:"column",padding:25}},React.createElement("label",{htmlFor:"password-input"},a("pages.updatePassword.fields.password","New Password")),React.createElement("input",{id:"password-input",name:"password",type:"password",required:true,size:20,value:l,onChange:x=>m(x.target.value)}),React.createElement("label",{htmlFor:"confirm-password-input"},a("pages.updatePassword.fields.confirmPassword","Confirm New Password")),React.createElement("input",{id:"confirm-password-input",name:"confirmPassword",type:"password",required:true,size:20,value:y,onChange:x=>d(x.target.value)}),React.createElement("input",{type:"submit",disabled:p,value:a("pages.updatePassword.buttons.submit","Update")}))));return React.createElement("div",{...e},r?r(T,n):T)},"UpdatePasswordPage");var ac=o(e=>{let{type:t}=e;return React.createElement(React.Fragment,null,o(()=>{switch(t){case "register":return React.createElement(On,{...e});case "forgotPassword":return React.createElement(Wn,{...e});case "updatePassword":return React.createElement($n,{...e});default:return React.createElement(Kn,{...e})}},"renderView")())},"AuthPage");var Qo=o(()=>React.createElement(React.Fragment,null,React.createElement("h1",null,"Welcome on board"),React.createElement("p",null,"Your configuration is completed."),React.createElement("p",null,"Now you can get started by adding your resources to the"," ",React.createElement("code",null,"`resources`")," property of ",React.createElement("code",null,"`<Refine>`")),React.createElement("div",{style:{display:"flex",gap:8}},React.createElement("a",{href:"https://refine.dev",target:"_blank",rel:"noreferrer"},React.createElement("button",null,"Documentation")),React.createElement("a",{href:"https://refine.dev/examples",target:"_blank",rel:"noreferrer"},React.createElement("button",null,"Examples")),React.createElement("a",{href:"https://discord.gg/refine",target:"_blank",rel:"noreferrer"},React.createElement("button",null,"Community")))),"ReadyPage");var uc=[{title:"Documentation",description:"Learn about the technical details of using Refine in your projects.",link:"https://refine.dev/docs",iconUrl:"https://refine.ams3.cdn.digitaloceanspaces.com/welcome-page/book.svg"},{title:"Tutorial",description:"Learn how to use Refine by building a fully-functioning CRUD app, from scratch to full launch.",link:"https://refine.dev/tutorial",iconUrl:"https://refine.ams3.cdn.digitaloceanspaces.com/welcome-page/hat.svg"},{title:"Templates",description:"Explore a range of pre-built templates, perfect everything from admin panels to dashboards and CRMs.",link:"https://refine.dev/templates",iconUrl:"https://refine.ams3.cdn.digitaloceanspaces.com/welcome-page/application.svg"},{title:"Community",description:"Join our Discord community and keep up with the latest news.",link:"https://discord.gg/refine",iconUrl:"https://refine.ams3.cdn.digitaloceanspaces.com/welcome-page/discord.svg"}],zn=o(()=>{let e=Pr("(max-width: 1010px)"),t=Pr("(max-width: 650px)"),r=o(()=>t?"1, 280px":e?"2, 280px":"4, 1fr","getGridTemplateColumns"),s=o(()=>t?"32px":e?"40px":"48px","getHeaderFontSize"),n=o(()=>t?"16px":e?"20px":"24px","getSubHeaderFontSize");return React.createElement("div",{style:{position:"fixed",zIndex:10,inset:0,overflow:"auto",width:"100dvw",height:"100dvh"}},React.createElement("div",{style:{overflow:"hidden",position:"relative",backgroundSize:"cover",backgroundRepeat:"no-repeat",background:t?"url(https://refine.ams3.cdn.digitaloceanspaces.com/website/static/assets/landing-noise.webp), radial-gradient(88.89% 50% at 50% 100%, rgba(38, 217, 127, 0.10) 0%, rgba(38, 217, 127, 0.00) 100%), radial-gradient(88.89% 50% at 50% 0%, rgba(71, 235, 235, 0.15) 0%, rgba(71, 235, 235, 0.00) 100%), #1D1E30":e?"url(https://refine.ams3.cdn.digitaloceanspaces.com/website/static/assets/landing-noise.webp), radial-gradient(66.67% 50% at 50% 100%, rgba(38, 217, 127, 0.10) 0%, rgba(38, 217, 127, 0.00) 100%), radial-gradient(66.67% 50% at 50% 0%, rgba(71, 235, 235, 0.15) 0%, rgba(71, 235, 235, 0.00) 100%), #1D1E30":"url(https://refine.ams3.cdn.digitaloceanspaces.com/website/static/assets/landing-noise.webp), radial-gradient(35.56% 50% at 50% 100%, rgba(38, 217, 127, 0.12) 0%, rgba(38, 217, 127, 0) 100%), radial-gradient(35.56% 50% at 50% 0%, rgba(71, 235, 235, 0.18) 0%, rgba(71, 235, 235, 0) 100%), #1D1E30",minHeight:"100%",minWidth:"100%",fontFamily:"Arial",color:"#FFFFFF"}},React.createElement("div",{style:{zIndex:2,position:"absolute",width:t?"400px":"800px",height:"552px",opacity:"0.5",background:"url(https://refine.ams3.cdn.digitaloceanspaces.com/assets/welcome-page-hexagon.png)",backgroundRepeat:"no-repeat",backgroundSize:"contain",top:"0",left:"50%",transform:"translateX(-50%)"}}),React.createElement("div",{style:{height:t?"40px":"80px"}}),React.createElement("div",{style:{display:"flex",justifyContent:"center"}},React.createElement("div",{style:{backgroundRepeat:"no-repeat",backgroundSize:t?"112px 58px":"224px 116px",backgroundImage:"url(https://refine.ams3.cdn.digitaloceanspaces.com/assets/refine-logo.svg)",width:t?112:224,height:t?58:116}})),React.createElement("div",{style:{height:t?"120px":e?"200px":"30vh",minHeight:t?"120px":"200px"}}),React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:"16px",textAlign:"center"}},React.createElement("h1",{style:{fontSize:s(),fontWeight:700,margin:"0px"}},"Welcome Aboard!"),React.createElement("h4",{style:{fontSize:n(),fontWeight:400,margin:"0px"}},"Your configuration is completed.")),React.createElement("div",{style:{height:"64px"}}),React.createElement("div",{style:{display:"grid",gridTemplateColumns:`repeat(${r()})`,justifyContent:"center",gap:"48px",paddingRight:"16px",paddingLeft:"16px",paddingBottom:"32px",maxWidth:"976px",margin:"auto"}},uc.map(i=>React.createElement(cc,{key:`welcome-page-${i.title}`,card:i})))))},"ConfigSuccessPage"),cc=o(({card:e})=>{let{title:t,description:r,iconUrl:s,link:n}=e,[i,a]=core_core__loadShare__react__loadShare__.useState(false);return React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:"16px"}},React.createElement("div",{style:{display:"flex",alignItems:"center"}},React.createElement("a",{onPointerEnter:()=>a(true),onPointerLeave:()=>a(false),style:{display:"flex",alignItems:"center",color:"#fff",textDecoration:"none"},href:n},React.createElement("div",{style:{width:"16px",height:"16px",backgroundPosition:"center",backgroundSize:"contain",backgroundRepeat:"no-repeat",backgroundImage:`url(${s})`}}),React.createElement("span",{style:{fontSize:"16px",fontWeight:700,marginLeft:"13px",marginRight:"14px"}},t),React.createElement("svg",{style:{transition:"transform 0.5s ease-in-out, opacity 0.2s ease-in-out",...i&&{transform:"translateX(4px)",opacity:1}},width:"12",height:"8",fill:"none",opacity:"0.5",xmlns:"http://www.w3.org/2000/svg"},React.createElement("path",{d:"M7.293.293a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1 0 1.414l-3 3a1 1 0 0 1-1.414-1.414L8.586 5H1a1 1 0 0 1 0-2h7.586L7.293 1.707a1 1 0 0 1 0-1.414Z",fill:"#fff"})))),React.createElement("span",{style:{fontSize:"12px",opacity:.5,lineHeight:"16px"}},r))},"Card");var _n=o(()=>React.createElement("div",{style:{position:"fixed",zIndex:11,inset:0,overflow:"auto",width:"100dvw",height:"100dvh"}},React.createElement("div",{style:{width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center",padding:"24px",background:"#14141FBF",backdropFilter:"blur(3px)"}},React.createElement("div",{style:{maxWidth:"640px",width:"100%",background:"#1D1E30",borderRadius:"16px",border:"1px solid #303450",boxShadow:"0px 0px 120px -24px #000000"}},React.createElement("div",{style:{padding:"16px 20px",borderBottom:"1px solid #303450",display:"flex",alignItems:"center",gap:"8px",position:"relative"}},React.createElement(dc,{style:{position:"absolute",left:0,top:0}}),React.createElement("div",{style:{lineHeight:"24px",fontSize:"16px",color:"#FFFFFF",display:"flex",alignItems:"center",gap:"16px"}},React.createElement(lc,null),React.createElement("span",{style:{fontWeight:400}},"Configuration Error"))),React.createElement("div",{style:{padding:"20px",color:"#A3ADC2",lineHeight:"20px",fontSize:"14px",display:"flex",flexDirection:"column",gap:"20px"}},React.createElement("p",{style:{margin:0,padding:0,lineHeight:"28px",fontSize:"16px"}},React.createElement("code",{style:{display:"inline-block",background:"#30345080",padding:"0 4px",lineHeight:"24px",fontSize:"16px",borderRadius:"4px",color:"#FFFFFF"}},"<Refine />")," ","is not initialized. Please make sure you have it mounted in your app and placed your components inside it."),React.createElement("div",null,React.createElement(pc,null)))))),"ConfigErrorPage"),pc=o(()=>React.createElement("pre",{style:{display:"block",overflowX:"auto",borderRadius:"8px",fontSize:"14px",lineHeight:"24px",backgroundColor:"#14141F",color:"#E5ECF2",padding:"16px",margin:"0",maxHeight:"400px",overflow:"auto"}},React.createElement("span",{style:{color:"#FF7B72"}},"import")," ","{"," Refine, WelcomePage"," ","}"," ",React.createElement("span",{style:{color:"#FF7B72"}},"from")," ",React.createElement("span",{style:{color:"#A5D6FF"}},'"@refinedev/core"'),";",`
`,`
`,React.createElement("span",{style:{color:"#FF7B72"}},"export")," ",React.createElement("span",{style:{color:"#FF7B72"}},"default")," ",React.createElement("span",null,React.createElement("span",{style:{color:"#FF7B72"}},"function")," ",React.createElement("span",{style:{color:"#FFA657"}},"App"),"(",React.createElement("span",{style:{color:"rgb(222, 147, 95)"}}),")"," "),"{",`
`,"  ",React.createElement("span",{style:{color:"#FF7B72"}},"return")," (",`
`,"    ",React.createElement("span",null,React.createElement("span",{style:{color:"#79C0FF"}},"<",React.createElement("span",{style:{color:"#79C0FF"}},"Refine"),`
`,"      ",React.createElement("span",{style:{color:"#E5ECF2",opacity:.6}},"// ",React.createElement("span",null,"...")),`
`,"    ",">"),`
`,"      ",React.createElement("span",{style:{opacity:.6}},"{","/* ... */","}"),`
`,"      ",React.createElement("span",{style:{color:"#79C0FF"}},"<",React.createElement("span",{style:{color:"#79C0FF"}},"WelcomePage")," />"),`
`,"      ",React.createElement("span",{style:{opacity:.6}},"{","/* ... */","}"),`
`,"    ",React.createElement("span",{style:{color:"#79C0FF"}},"</",React.createElement("span",{style:{color:"#79C0FF"}},"Refine"),">")),`
`,"  ",");",`
`,"}"),"ExampleImplementation"),dc=o(e=>React.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",width:204,height:56,viewBox:"0 0 204 56",fill:"none",...e},React.createElement("path",{fill:"url(#welcome-page-error-gradient-a)",d:"M12 0H0v12L12 0Z"}),React.createElement("path",{fill:"url(#welcome-page-error-gradient-b)",d:"M28 0h-8L0 20v8L28 0Z"}),React.createElement("path",{fill:"url(#welcome-page-error-gradient-c)",d:"M36 0h8L0 44v-8L36 0Z"}),React.createElement("path",{fill:"url(#welcome-page-error-gradient-d)",d:"M60 0h-8L0 52v4h4L60 0Z"}),React.createElement("path",{fill:"url(#welcome-page-error-gradient-e)",d:"M68 0h8L20 56h-8L68 0Z"}),React.createElement("path",{fill:"url(#welcome-page-error-gradient-f)",d:"M92 0h-8L28 56h8L92 0Z"}),React.createElement("path",{fill:"url(#welcome-page-error-gradient-g)",d:"M100 0h8L52 56h-8l56-56Z"}),React.createElement("path",{fill:"url(#welcome-page-error-gradient-h)",d:"M124 0h-8L60 56h8l56-56Z"}),React.createElement("path",{fill:"url(#welcome-page-error-gradient-i)",d:"M140 0h-8L76 56h8l56-56Z"}),React.createElement("path",{fill:"url(#welcome-page-error-gradient-j)",d:"M132 0h8L84 56h-8l56-56Z"}),React.createElement("path",{fill:"url(#welcome-page-error-gradient-k)",d:"M156 0h-8L92 56h8l56-56Z"}),React.createElement("path",{fill:"url(#welcome-page-error-gradient-l)",d:"M164 0h8l-56 56h-8l56-56Z"}),React.createElement("path",{fill:"url(#welcome-page-error-gradient-m)",d:"M188 0h-8l-56 56h8l56-56Z"}),React.createElement("path",{fill:"url(#welcome-page-error-gradient-n)",d:"M204 0h-8l-56 56h8l56-56Z"}),React.createElement("defs",null,React.createElement("radialGradient",{id:"welcome-page-error-gradient-a",cx:0,cy:0,r:1,gradientTransform:"scale(124)",gradientUnits:"userSpaceOnUse"},React.createElement("stop",{stopColor:"#FF4C4D",stopOpacity:.1}),React.createElement("stop",{offset:1,stopColor:"#FF4C4D",stopOpacity:0})),React.createElement("radialGradient",{id:"welcome-page-error-gradient-b",cx:0,cy:0,r:1,gradientTransform:"scale(124)",gradientUnits:"userSpaceOnUse"},React.createElement("stop",{stopColor:"#FF4C4D",stopOpacity:.1}),React.createElement("stop",{offset:1,stopColor:"#FF4C4D",stopOpacity:0})),React.createElement("radialGradient",{id:"welcome-page-error-gradient-c",cx:0,cy:0,r:1,gradientTransform:"scale(124)",gradientUnits:"userSpaceOnUse"},React.createElement("stop",{stopColor:"#FF4C4D",stopOpacity:.1}),React.createElement("stop",{offset:1,stopColor:"#FF4C4D",stopOpacity:0})),React.createElement("radialGradient",{id:"welcome-page-error-gradient-d",cx:0,cy:0,r:1,gradientTransform:"scale(124)",gradientUnits:"userSpaceOnUse"},React.createElement("stop",{stopColor:"#FF4C4D",stopOpacity:.1}),React.createElement("stop",{offset:1,stopColor:"#FF4C4D",stopOpacity:0})),React.createElement("radialGradient",{id:"welcome-page-error-gradient-e",cx:0,cy:0,r:1,gradientTransform:"scale(124)",gradientUnits:"userSpaceOnUse"},React.createElement("stop",{stopColor:"#FF4C4D",stopOpacity:.1}),React.createElement("stop",{offset:1,stopColor:"#FF4C4D",stopOpacity:0})),React.createElement("radialGradient",{id:"welcome-page-error-gradient-f",cx:0,cy:0,r:1,gradientTransform:"scale(124)",gradientUnits:"userSpaceOnUse"},React.createElement("stop",{stopColor:"#FF4C4D",stopOpacity:.1}),React.createElement("stop",{offset:1,stopColor:"#FF4C4D",stopOpacity:0})),React.createElement("radialGradient",{id:"welcome-page-error-gradient-g",cx:0,cy:0,r:1,gradientTransform:"scale(124)",gradientUnits:"userSpaceOnUse"},React.createElement("stop",{stopColor:"#FF4C4D",stopOpacity:.1}),React.createElement("stop",{offset:1,stopColor:"#FF4C4D",stopOpacity:0})),React.createElement("radialGradient",{id:"welcome-page-error-gradient-h",cx:0,cy:0,r:1,gradientTransform:"scale(124)",gradientUnits:"userSpaceOnUse"},React.createElement("stop",{stopColor:"#FF4C4D",stopOpacity:.1}),React.createElement("stop",{offset:1,stopColor:"#FF4C4D",stopOpacity:0})),React.createElement("radialGradient",{id:"welcome-page-error-gradient-i",cx:0,cy:0,r:1,gradientTransform:"scale(124)",gradientUnits:"userSpaceOnUse"},React.createElement("stop",{stopColor:"#FF4C4D",stopOpacity:.1}),React.createElement("stop",{offset:1,stopColor:"#FF4C4D",stopOpacity:0})),React.createElement("radialGradient",{id:"welcome-page-error-gradient-j",cx:0,cy:0,r:1,gradientTransform:"scale(124)",gradientUnits:"userSpaceOnUse"},React.createElement("stop",{stopColor:"#FF4C4D",stopOpacity:.1}),React.createElement("stop",{offset:1,stopColor:"#FF4C4D",stopOpacity:0})),React.createElement("radialGradient",{id:"welcome-page-error-gradient-k",cx:0,cy:0,r:1,gradientTransform:"scale(124)",gradientUnits:"userSpaceOnUse"},React.createElement("stop",{stopColor:"#FF4C4D",stopOpacity:.1}),React.createElement("stop",{offset:1,stopColor:"#FF4C4D",stopOpacity:0})),React.createElement("radialGradient",{id:"welcome-page-error-gradient-l",cx:0,cy:0,r:1,gradientTransform:"scale(124)",gradientUnits:"userSpaceOnUse"},React.createElement("stop",{stopColor:"#FF4C4D",stopOpacity:.1}),React.createElement("stop",{offset:1,stopColor:"#FF4C4D",stopOpacity:0})),React.createElement("radialGradient",{id:"welcome-page-error-gradient-m",cx:0,cy:0,r:1,gradientTransform:"scale(124)",gradientUnits:"userSpaceOnUse"},React.createElement("stop",{stopColor:"#FF4C4D",stopOpacity:.1}),React.createElement("stop",{offset:1,stopColor:"#FF4C4D",stopOpacity:0})),React.createElement("radialGradient",{id:"welcome-page-error-gradient-n",cx:0,cy:0,r:1,gradientTransform:"scale(124)",gradientUnits:"userSpaceOnUse"},React.createElement("stop",{stopColor:"#FF4C4D",stopOpacity:.1}),React.createElement("stop",{offset:1,stopColor:"#FF4C4D",stopOpacity:0})))),"ErrorGradient"),lc=o(e=>React.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",width:16,height:16,viewBox:"0 0 16 16",fill:"none",...e},React.createElement("path",{fill:"#FF4C4D",fillRule:"evenodd",d:"M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16Z",clipRule:"evenodd"}),React.createElement("path",{fill:"#fff",fillRule:"evenodd",d:"M7 8a1 1 0 1 0 2 0V5a1 1 0 1 0-2 0v3Zm0 3a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z",clipRule:"evenodd"})),"ErrorIcon");var mc=o(()=>{let{__initialized:e}=ge();return React.createElement(React.Fragment,null,React.createElement(zn,null),!e&&React.createElement(_n,null))},"WelcomePage");var fc="4.57.9",jn=o(()=>{var P;let e=yo(),t=core_core__loadShare__react__loadShare__.useContext(Et),{liveProvider:r}=core_core__loadShare__react__loadShare__.useContext(mt),s=core_core__loadShare__react__loadShare__.useContext(er),n=core_core__loadShare__react__loadShare__.useContext(Jt),{i18nProvider:i}=core_core__loadShare__react__loadShare__.useContext(Xe),a=core_core__loadShare__react__loadShare__.useContext(qt),u=core_core__loadShare__react__loadShare__.useContext(ct),{resources:c}=q(),p=ge(),l=!!t.create||!!t.get||!!t.update,m=!!(r!=null&&r.publish)||!!(r!=null&&r.subscribe)||!!(r!=null&&r.unsubscribe),y=!!s.useHistory||!!s.Link||!!s.Prompt||!!s.useLocation||!!s.useParams,d=!!n,T=!!(i!=null&&i.changeLocale)||!!(i!=null&&i.getLocale)||!!(i!=null&&i.translate),x=!!a.close||!!a.open,v=!!u.can,f=(P=p==null?void 0:p.options)==null?void 0:P.projectId;return {providers:{auth:e,auditLog:l,live:m,router:y,data:d,i18n:T,notification:x,accessControl:v},version:fc,resourceCount:c.length,projectId:f}},"useTelemetryData");var yc=o(e=>{try{let t=JSON.stringify(e||{});return typeof btoa<"u"?btoa(t):Buffer.from(t).toString("base64")}catch{return}},"encode"),gc=o(e=>{let t=new Image;t.src=e;},"throughImage"),Tc=o(e=>{fetch(e);},"throughFetch"),xc=o(e=>{typeof Image<"u"?gc(e):typeof fetch<"u"&&Tc(e);},"transport"),Zn=o(()=>{let e=jn(),t=React.useRef(false);return React.useEffect(()=>{if(t.current)return;let r=yc(e);r&&(xc(`https://telemetry.refine.dev/telemetry?payload=${r}`),t.current=true);},[]),null},"Telemetry");var Yn=o(e=>{let t=["go","parse","back","Link"],r=Object.keys(e).filter(n=>!t.includes(n));return r.length>0?(console.warn(`Unsupported properties are found in \`routerProvider\` prop. You provided \`${r.join(", ")}\`. Supported properties are \`${t.join(", ")}\`. You may wanted to use \`legacyRouterProvider\` prop instead.`),true):false},"checkRouterPropMisuse");var qn=o(e=>{let t=React.useRef(false);React.useEffect(()=>{t.current===false&&e&&Yn(e)&&(t.current=true);},[e]);},"useRouterMisuseWarning");var Rc=o(({legacyAuthProvider:e,authProvider:t,dataProvider:r,legacyRouterProvider:s,routerProvider:n,notificationProvider:i,accessControlProvider:a,auditLogProvider:u,resources:c,DashboardPage:p,ReadyPage:l,LoginPage:m,catchAll:y,children:d,liveProvider:T,i18nProvider:x,Title:v,Layout:f,Sider:P,Header:M,Footer:Q,OffLayoutArea:g,onLiveEvent:C$1,options:h})=>{let{optionsWithDefaults:D,disableTelemetryWithDefault:k,reactQueryWithDefaults:E}=Jr({options:h}),L=Ar(()=>{var b;return E.clientConfig instanceof core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.QueryClient?E.clientConfig:new core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.QueryClient({...E.clientConfig,defaultOptions:{...E.clientConfig.defaultOptions,queries:{refetchOnWindowFocus:false,keepPreviousData:true,...(b=E.clientConfig.defaultOptions)==null?void 0:b.queries}}})},[E.clientConfig]);C(L);let w=React.useMemo(()=>typeof i=="function"?i:()=>i,[i])();if(qn(n),s&&!n&&(c??[]).length===0)return l?React.createElement(l,null):React.createElement(Qo,null);let{RouterComponent:N=React.Fragment}=n?{}:s??{};return React.createElement(core_core__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.QueryClientProvider,{client:L},React.createElement(cn,{...w},React.createElement(Zo,{...e??{},isProvided:!!e},React.createElement(Jo,{...t??{},isProvided:!!t},React.createElement($s,{dataProvider:r},React.createElement(_s,{liveProvider:T},React.createElement(qs,{value:s&&!n?"legacy":"new"},React.createElement(tn,{router:n},React.createElement(xn,{...s},React.createElement(Zs,{resources:c??[]},React.createElement(dn,{i18nProvider:x},React.createElement(Pn,{...a??{}},React.createElement(Mn,{...u??{}},React.createElement(an,null,React.createElement(cs,{mutationMode:D.mutationMode,warnWhenUnsavedChanges:D.warnWhenUnsavedChanges,syncWithLocation:D.syncWithLocation,Title:v,undoableTimeout:D.undoableTimeout,catchAll:y,DashboardPage:p,LoginPage:m,Layout:f,Sider:P,Footer:Q,Header:M,OffLayoutArea:g,hasDashboard:!!p,liveMode:D.liveMode,onLiveEvent:C$1,options:D},React.createElement(fs,null,React.createElement(N,null,d,!k&&React.createElement(Zn,null),React.createElement(Vo,null))))))))))))))))))},"Refine");var un=o(({notification:e})=>{let t=z(),{notificationDispatch:r}=ut(),{open:s}=He(),[n,i]=core_core__loadShare__react__loadShare__.useState(),a=o(()=>{if(e.isRunning===true&&(e.seconds===0&&e.doMutation(),e.isSilent||s==null||s({key:`${e.id}-${e.resource}-notification`,type:"progress",message:t("notifications.undoable",{seconds:Bt(e.seconds)},`You have ${Bt(e.seconds)} seconds to undo`),cancelMutation:e.cancelMutation,undoableTimeout:Bt(e.seconds)}),e.seconds>0)){n&&clearTimeout(n);let u=setTimeout(()=>{r({type:"DECREASE_NOTIFICATION_SECOND",payload:{id:e.id,seconds:e.seconds,resource:e.resource}});},1e3);i(u);}},"cancelNotification");return core_core__loadShare__react__loadShare__.useEffect(()=>{a();},[e]),null},"UndoableQueue");var Dc=o(({children:e,Layout:t,Sider:r,Header:s,Title:n,Footer:i,OffLayoutArea:a})=>{let{Layout:u,Footer:c,Header:p,Sider:l,Title:m,OffLayoutArea:y}=ge();return React.createElement(t??u,{Sider:r??l,Header:s??p,Footer:i??c,Title:n??m,OffLayoutArea:a??y},e,React.createElement(Uc,null))},"LayoutWrapper"),Uc=o(()=>{let{Prompt:e}=pe(),t=z(),{warnWhen:r,setWarnWhen:s}=vt(),n=o(i=>(i.preventDefault(),i.returnValue=t("warnWhenUnsavedChanges","Are you sure you want to leave? You have unsaved changes."),i.returnValue),"warnWhenListener");return core_core__loadShare__react__loadShare__.useEffect(()=>(r&&window.addEventListener("beforeunload",n),window.removeEventListener("beforeunload",n)),[r]),React.createElement(e,{when:r,message:t("warnWhenUnsavedChanges","Are you sure you want to leave? You have unsaved changes."),setWarnWhen:s})},"UnsavedPrompt");function Ec({redirectOnFail:e=true,appendCurrentPathToQuery:t=true,children:r,fallback:s,loading:n,params:i}){var C;let a=ie(),u=oe(),c=!!(a!=null&&a.isProvided),p=!!(a!=null&&a.isLegacy),l=u==="legacy",m=Te(),y=Pe(),{useLocation:d}=pe(),T=d(),{isFetching:x,isSuccess:v,data:{authenticated:f,redirectTo:P}={}}=wr({v3LegacyAuthProviderCompatible:p,params:i}),M=c?p?v:f:true;if(!c)return React.createElement(React.Fragment,null,r??null);if(x)return React.createElement(React.Fragment,null,n??null);if(M)return React.createElement(React.Fragment,null,r??null);if(typeof s<"u")return React.createElement(React.Fragment,null,s??null);let Q=p?typeof e=="string"?e:"/login":typeof e=="string"?e:P,g=`${l?T==null?void 0:T.pathname:m.pathname}`.replace(/(\?.*|#.*)$/,"");if(Q){if(l){let D=t?`?to=${encodeURIComponent(g)}`:"";return React.createElement(Mc,{to:`${Q}${D}`})}let h=(C=m.params)!=null&&C.to?m.params.to:y({to:g,options:{keepQuery:true},type:"path"});return React.createElement(Lc,{config:{to:Q,query:t&&(h??"").length>1?{to:h}:void 0,type:"replace"}})}return null}o(Ec,"Authenticated");var Lc=o(({config:e})=>{let t=Pe();return React.useEffect(()=>{t(e);},[t,e]),null},"Redirect"),Mc=o(({to:e})=>{let{replace:t}=he();return React.useEffect(()=>{t(e);},[t,e]),null},"RedirectLegacy");var Vo=o(()=>{let{useLocation:e}=pe(),{checkAuth:t}=xe(),r=e();return core_core__loadShare__react__loadShare__.useEffect(()=>{t==null||t().catch(()=>false);},[r==null?void 0:r.pathname]),null},"RouteChangeHandler");var Sc=o(({resource:e,action:t,params:r,fallback:s,onUnauthorized:n,children:i,queryOptions:a,...u})=>{let{id:c,resource:p,action:l=""}=qe({resource:e,id:r==null?void 0:r.id}),m=t??l,y=r??{id:c,resource:p},{data:d}=kr({resource:p==null?void 0:p.name,action:m,params:y,queryOptions:a});return core_core__loadShare__react__loadShare__.useEffect(()=>{n&&(d==null?void 0:d.can)===false&&n({resource:p==null?void 0:p.name,action:m,reason:d==null?void 0:d.reason,params:y});},[d==null?void 0:d.can]),d!=null&&d.can?React.isValidElement(i)?React.cloneElement(i,u):React.createElement(React.Fragment,null,i):(d==null?void 0:d.can)===false?React.createElement(React.Fragment,null,s??null):null},"CanAccess");var ta=[`
    .bg-top-announcement {
        border-bottom: 1px solid rgba(71, 235, 235, 0.15);
        background: radial-gradient(
                218.19% 111.8% at 0% 0%,
                rgba(71, 235, 235, 0.1) 0%,
                rgba(71, 235, 235, 0.2) 100%
            ),
            #14141f;
    }
    `,`
    .top-announcement-mask {
        mask-image: url(https://refine.ams3.cdn.digitaloceanspaces.com/website/static/assets/hexagon.svg);
        -webkit-mask-image: url(https://refine.ams3.cdn.digitaloceanspaces.com/website/static/assets/hexagon.svg);
        mask-repeat: repeat;
        -webkit-mask-repeat: repeat;
        background: rgba(71, 235, 235, 0.25);
    }
    `,`
    .banner {
        display: flex;
        @media (max-width: 1000px) {
            display: none;
        }
    }`,`
    .gh-link, .gh-link:hover, .gh-link:active, .gh-link:visited, .gh-link:focus {
        text-decoration: none;
        z-index: 9;
    }
    `,`
    @keyframes top-announcement-glow {
        0% {
            opacity: 1;
        }

        100% {
            opacity: 0;
        }
    }
    `];var kc="If you find Refine useful, you can contribute to its growth by giving it a star on GitHub",Fc=o(({containerStyle:e})=>(core_core__loadShare__react__loadShare__.useEffect(()=>{let t=document.createElement("style");document.head.appendChild(t),ta.forEach(r=>{var s;return (s=t.sheet)==null?void 0:s.insertRule(r,t.sheet.cssRules.length)});},[]),React.createElement("div",{className:"banner bg-top-announcement",style:{width:"100%",height:"48px"}},React.createElement("div",{style:{position:"relative",display:"flex",justifyContent:"center",alignItems:"center",paddingLeft:"200px",width:"100%",maxWidth:"100vw",height:"100%",borderBottom:"1px solid #47ebeb26",...e}},React.createElement("div",{className:"top-announcement-mask",style:{position:"absolute",left:0,top:0,width:"100%",height:"100%",borderBottom:"1px solid #47ebeb26"}},React.createElement("div",{style:{position:"relative",width:"960px",height:"100%",display:"flex",justifyContent:"space-between",margin:"0 auto"}},React.createElement("div",{style:{width:"calc(50% - 300px)",height:"100%",position:"relative"}},React.createElement(Hr,{style:{animationDelay:"1.5s",position:"absolute",top:"2px",right:"220px"},id:"1"}),React.createElement(Hr,{style:{animationDelay:"1s",position:"absolute",top:"8px",right:"100px",transform:"rotate(180deg)"},id:"2"}),React.createElement(ra,{style:{position:"absolute",right:"10px"},id:"3"})),React.createElement("div",{style:{width:"calc(50% - 300px)",height:"100%",position:"relative"}},React.createElement(Hr,{style:{animationDelay:"2s",position:"absolute",top:"6px",right:"180px",transform:"rotate(180deg)"},id:"4"}),React.createElement(Hr,{style:{animationDelay:"0.5s",transitionDelay:"1.3s",position:"absolute",top:"2px",right:"40px"},id:"5"}),React.createElement(ra,{style:{position:"absolute",right:"-70px"},id:"6"})))),React.createElement(Qc,{text:kc})))),"GitHubBanner"),Qc=o(({text:e})=>React.createElement("a",{className:"gh-link",href:"https://s.refine.dev/github-support",target:"_blank",rel:"noreferrer",style:{position:"absolute",height:"100%",padding:"0 60px",display:"flex",flexWrap:"nowrap",whiteSpace:"nowrap",justifyContent:"center",alignItems:"center",backgroundImage:"linear-gradient(90deg, rgba(31, 63, 72, 0.00) 0%, #1F3F48 10%, #1F3F48 90%, rgba(31, 63, 72, 0.00) 100%)"}},React.createElement("div",{style:{color:"#fff",display:"flex",flexDirection:"row",gap:"8px"}},React.createElement("span",{style:{display:"flex",flexDirection:"row",justifyContent:"center",alignItems:"center"}},"\u2B50\uFE0F"),React.createElement("span",{className:"text",style:{fontSize:"16px",lineHeight:"24px"}},e),React.createElement("span",{style:{display:"flex",flexDirection:"row",justifyContent:"center",alignItems:"center"}},"\u2B50\uFE0F"))),"Text"),Hr=o(({style:e,...t})=>React.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",width:80,height:40,fill:"none",style:{opacity:1,animation:"top-announcement-glow 1s ease-in-out infinite alternate",...e}},React.createElement("circle",{cx:40,r:40,fill:`url(#${t.id}-a)`,fillOpacity:.5}),React.createElement("defs",null,React.createElement("radialGradient",{id:`${t.id}-a`,cx:0,cy:0,r:1,gradientTransform:"matrix(0 40 -40 0 40 0)",gradientUnits:"userSpaceOnUse"},React.createElement("stop",{stopColor:"#47EBEB"}),React.createElement("stop",{offset:1,stopColor:"#47EBEB",stopOpacity:0})))),"GlowSmall"),ra=o(({style:e,...t})=>React.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",width:120,height:48,fill:"none",...t,style:{opacity:1,animation:"top-announcement-glow 1s ease-in-out infinite alternate",...e}},React.createElement("circle",{cx:60,cy:24,r:60,fill:`url(#${t.id}-a)`,fillOpacity:.5}),React.createElement("defs",null,React.createElement("radialGradient",{id:`${t.id}-a`,cx:0,cy:0,r:1,gradientTransform:"matrix(0 60 -60 0 60 24)",gradientUnits:"userSpaceOnUse"},React.createElement("stop",{stopColor:"#47EBEB"}),React.createElement("stop",{offset:1,stopColor:"#47EBEB",stopOpacity:0})))),"GlowBig");var Vc=o(({status:e,elements:{success:t=React.createElement($r,{translationKey:"autoSave.success",defaultMessage:"saved"}),error:r=React.createElement($r,{translationKey:"autoSave.error",defaultMessage:"auto save failure"}),loading:s=React.createElement($r,{translationKey:"autoSave.loading",defaultMessage:"saving..."}),idle:n=React.createElement($r,{translationKey:"autoSave.idle",defaultMessage:"waiting for changes"})}={}})=>{switch(e){case "success":return React.createElement(React.Fragment,null,t);case "error":return React.createElement(React.Fragment,null,r);case "loading":return React.createElement(React.Fragment,null,s);default:return React.createElement(React.Fragment,null,n)}},"AutoSaveIndicator"),$r=o(({translationKey:e,defaultMessage:t})=>{let r=z();return React.createElement("span",null,r(e,t))},"Message");

export { ct as AccessControlContext, Os as ActionTypes, ac as AuthPage, Ec as Authenticated, Vc as AutoSaveIndicator, Sc as CanAccess, sc as ErrorComponent, Fc as GitHubBanner, Xe as I18nContext, wt as KeyBuilder, Dc as LayoutWrapper, Io as Link, Yr as LoginPage, Zu as MetaContextProvider, Qo as ReadyPage, Rc as Refine, Rt as ResourceContext, Vo as RouteChangeHandler, Xe as TranslationContext, un as UndoableQueue, mc as WelcomePage, is as createTreeView, Da as file2Base64, Cr as flattenObjectKeys, ls as generateDefaultDocumentTitle, va as getDefaultFilter, ba as getDefaultSortOrder, Tr as getNextPageParam, xr as getPreviousPageParam, es as handleUseParams, sr as importCSVMapper, nt as keys, hr as legacyResourceTransform, as as matchResourceFromRoute, vr as parseTableParams, Ca as parseTableParamsFromQuery, ee as pickDataProvider, I as pickNotDeprecated, Ts as propertyPathToArray, ts as queryKeys, yr as routeGenerator, Er as setInitialFilters, Lr as setInitialSorters, Dr as stringifyTableParams, St as unionFilters, Ur as unionSorters, ie as useActiveAuthProvider, li as useApiUrl, Va as useAuthenticated, Mo as useBack, fb as useBreadcrumb, kr as useCan, cC as useCanWithoutCache, ut as useCancelNotification, Na as useCheckError, Jv as useCloneButton, Xt as useCreate, qv as useCreateButton, bo as useCreateMany, yi as useCustom, xi as useCustomMutation, le as useDataProvider, Po as useDelete, qu as useDeleteButton, di as useDeleteMany, Yv as useEditButton, fP as useExport, rD as useExportButton, lo as useForgotPassword, RP as useForm, no as useGetIdentity, Lo as useGetLocale, Ut as useGetToPath, Pe as useGo, Ce as useHandleNotification, mR as useImport, oD as useImportButton, bi as useInfiniteList, Ae as useInvalidate, Dt as useInvalidateAuthStore, wr as useIsAuthenticated, yo as useIsExistAuthentication, Z as useKeys, yt as useLink, $t as useList, eD as useListButton, sn as useLiveMode, fe as useLoadingOvertime, Je as useLog, eb as useLogList, Ht as useLogin, Mr as useLogout, go as useMany, zu as useMenu, ue as useMeta, Br as useMetaContext, TR as useModal, _e as useMutationMode, he as useNavigation, He as useNotification, Re as useOnError, zt as useOne, vo as useParse, Te as useParsed, Ua as usePermissions, Ye as usePublish, fn as useRedirectionAfterSubmission, ge as useRefineContext, At as useRefineOptions, tc as useRefreshButton, co as useRegister, q as useResource, qe as useResourceParams, Pt as useResourceSubscription, rn as useResourceWithRoute, pe as useRouterContext, oe as useRouterType, tD as useSaveButton, PC as useSelect, Eo as useSetLocale, nR as useShow, Zv as useShowButton, ph as useSubscription, to as useSyncWithLocation, IC as useTable, Ta as useTitle, Du as useToPath, z as useTranslate, tP as useTranslation, To as useUpdate, ii as useUpdateMany, fo as useUpdatePassword, ht as useUserFriendlyName, vt as useWarnAboutChange, nr as userFriendlyResourceName };
