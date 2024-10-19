import { g as getDefaultExportFromCjs$1, r as reactExports, R as React } from "./jsx-runtime-IZdvEyt_.js";
import { z } from "./index-BpxO7BrF.js";
var noop$1 = function() {
};
var _undefined$1 = noop$1();
var isValue$6 = function(val) {
  return val !== _undefined$1 && val !== null;
};
var isValue$5 = isValue$6;
var forEach$2 = Array.prototype.forEach, create$1 = Object.create;
var process$2 = function(src, obj) {
  var key;
  for (key in src) obj[key] = src[key];
};
var normalizeOptions = function(opts1) {
  var result = create$1(null);
  forEach$2.call(arguments, function(options) {
    if (!isValue$5(options)) return;
    process$2(Object(options), result);
  });
  return result;
};
var isImplemented$7 = function() {
  var sign2 = Math.sign;
  if (typeof sign2 !== "function") return false;
  return sign2(10) === 1 && sign2(-20) === -1;
};
var shim$6;
var hasRequiredShim$5;
function requireShim$5() {
  if (hasRequiredShim$5) return shim$6;
  hasRequiredShim$5 = 1;
  shim$6 = function(value2) {
    value2 = Number(value2);
    if (isNaN(value2) || value2 === 0) return value2;
    return value2 > 0 ? 1 : -1;
  };
  return shim$6;
}
var sign$1 = isImplemented$7() ? Math.sign : requireShim$5();
var sign = sign$1, abs = Math.abs, floor = Math.floor;
var toInteger$1 = function(value2) {
  if (isNaN(value2)) return 0;
  value2 = Number(value2);
  if (value2 === 0 || !isFinite(value2)) return value2;
  return sign(value2) * floor(abs(value2));
};
var toInteger = toInteger$1, max$1 = Math.max;
var toPosInteger = function(value2) {
  return max$1(0, toInteger(value2));
};
var toPosInt$1 = toPosInteger;
var resolveLength$2 = function(optsLength, fnLength, isAsync) {
  var length;
  if (isNaN(optsLength)) {
    length = fnLength;
    if (!(length >= 0)) return 1;
    if (isAsync && length) return length - 1;
    return length;
  }
  if (optsLength === false) return false;
  return toPosInt$1(optsLength);
};
var validCallable = function(fn) {
  if (typeof fn !== "function") throw new TypeError(fn + " is not a function");
  return fn;
};
var isValue$4 = isValue$6;
var validValue = function(value2) {
  if (!isValue$4(value2)) throw new TypeError("Cannot use null or undefined");
  return value2;
};
var callable$3 = validCallable, value = validValue, bind = Function.prototype.bind, call$1 = Function.prototype.call, keys$1 = Object.keys, objPropertyIsEnumerable = Object.prototype.propertyIsEnumerable;
var _iterate = function(method, defVal) {
  return function(obj, cb) {
    var list, thisArg = arguments[2], compareFn = arguments[3];
    obj = Object(value(obj));
    callable$3(cb);
    list = keys$1(obj);
    if (compareFn) {
      list.sort(typeof compareFn === "function" ? bind.call(compareFn, obj) : void 0);
    }
    if (typeof method !== "function") method = list[method];
    return call$1.call(method, list, function(key, index) {
      if (!objPropertyIsEnumerable.call(obj, key)) return defVal;
      return call$1.call(cb, thisArg, obj[key], key, obj, index);
    });
  };
};
var forEach$1 = _iterate("forEach");
var registeredExtensions = {};
var custom = { exports: {} };
var isImplemented$6 = function() {
  var assign2 = Object.assign, obj;
  if (typeof assign2 !== "function") return false;
  obj = { foo: "raz" };
  assign2(obj, { bar: "dwa" }, { trzy: "trzy" });
  return obj.foo + obj.bar + obj.trzy === "razdwatrzy";
};
var isImplemented$5;
var hasRequiredIsImplemented$4;
function requireIsImplemented$4() {
  if (hasRequiredIsImplemented$4) return isImplemented$5;
  hasRequiredIsImplemented$4 = 1;
  isImplemented$5 = function() {
    try {
      Object.keys("primitive");
      return true;
    } catch (e2) {
      return false;
    }
  };
  return isImplemented$5;
}
var shim$5;
var hasRequiredShim$4;
function requireShim$4() {
  if (hasRequiredShim$4) return shim$5;
  hasRequiredShim$4 = 1;
  var isValue2 = isValue$6;
  var keys2 = Object.keys;
  shim$5 = function(object) {
    return keys2(isValue2(object) ? Object(object) : object);
  };
  return shim$5;
}
var keys;
var hasRequiredKeys;
function requireKeys() {
  if (hasRequiredKeys) return keys;
  hasRequiredKeys = 1;
  keys = requireIsImplemented$4()() ? Object.keys : requireShim$4();
  return keys;
}
var shim$4;
var hasRequiredShim$3;
function requireShim$3() {
  if (hasRequiredShim$3) return shim$4;
  hasRequiredShim$3 = 1;
  var keys2 = requireKeys(), value2 = validValue, max2 = Math.max;
  shim$4 = function(dest, src) {
    var error, i, length = max2(arguments.length, 2), assign2;
    dest = Object(value2(dest));
    assign2 = function(key) {
      try {
        dest[key] = src[key];
      } catch (e2) {
        if (!error) error = e2;
      }
    };
    for (i = 1; i < length; ++i) {
      src = arguments[i];
      keys2(src).forEach(assign2);
    }
    if (error !== void 0) throw error;
    return dest;
  };
  return shim$4;
}
var assign$1 = isImplemented$6() ? Object.assign : requireShim$3();
var isValue$3 = isValue$6;
var map$1 = { function: true, object: true };
var isObject$1 = function(value2) {
  return isValue$3(value2) && map$1[typeof value2] || false;
};
(function(module) {
  var assign2 = assign$1, isObject2 = isObject$1, isValue2 = isValue$6, captureStackTrace = Error.captureStackTrace;
  module.exports = function(message) {
    var err = new Error(message), code = arguments[1], ext = arguments[2];
    if (!isValue2(ext)) {
      if (isObject2(code)) {
        ext = code;
        code = null;
      }
    }
    if (isValue2(ext)) assign2(err, ext);
    if (isValue2(code)) err.code = code;
    if (captureStackTrace) captureStackTrace(err, module.exports);
    return err;
  };
})(custom);
var customExports = custom.exports;
var _defineLength = { exports: {} };
var mixin$1;
var hasRequiredMixin;
function requireMixin() {
  if (hasRequiredMixin) return mixin$1;
  hasRequiredMixin = 1;
  var value2 = validValue, defineProperty2 = Object.defineProperty, getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor, getOwnPropertyNames = Object.getOwnPropertyNames, getOwnPropertySymbols = Object.getOwnPropertySymbols;
  mixin$1 = function(target, source) {
    var error, sourceObject = Object(value2(source));
    target = Object(value2(target));
    getOwnPropertyNames(sourceObject).forEach(function(name) {
      try {
        defineProperty2(target, name, getOwnPropertyDescriptor(source, name));
      } catch (e2) {
        error = e2;
      }
    });
    if (typeof getOwnPropertySymbols === "function") {
      getOwnPropertySymbols(sourceObject).forEach(function(symbol) {
        try {
          defineProperty2(target, symbol, getOwnPropertyDescriptor(source, symbol));
        } catch (e2) {
          error = e2;
        }
      });
    }
    if (error !== void 0) throw error;
    return target;
  };
  return mixin$1;
}
var toPosInt = toPosInteger;
var test = function(arg1, arg2) {
  return arg2;
};
var desc, defineProperty, generate, mixin;
try {
  Object.defineProperty(test, "length", {
    configurable: true,
    writable: false,
    enumerable: false,
    value: 1
  });
} catch (ignore) {
}
if (test.length === 1) {
  desc = { configurable: true, writable: false, enumerable: false };
  defineProperty = Object.defineProperty;
  _defineLength.exports = function(fn, length) {
    length = toPosInt(length);
    if (fn.length === length) return fn;
    desc.value = length;
    return defineProperty(fn, "length", desc);
  };
} else {
  mixin = requireMixin();
  generate = /* @__PURE__ */ function() {
    var cache = [];
    return function(length) {
      var args, i = 0;
      if (cache[length]) return cache[length];
      args = [];
      while (length--) args.push("a" + (++i).toString(36));
      return new Function(
        "fn",
        "return function (" + args.join(", ") + ") { return fn.apply(this, arguments); };"
      );
    };
  }();
  _defineLength.exports = function(src, length) {
    var target;
    length = toPosInt(length);
    if (src.length === length) return src;
    target = generate(length)(src);
    try {
      mixin(target, src);
    } catch (ignore) {
    }
    return target;
  };
}
var _defineLengthExports = _defineLength.exports;
var d$2 = { exports: {} };
var _undefined = void 0;
var is$4 = function(value2) {
  return value2 !== _undefined && value2 !== null;
};
var isValue$2 = is$4;
var possibleTypes = {
  "object": true,
  "function": true,
  "undefined": true
  /* document.all */
};
var is$3 = function(value2) {
  if (!isValue$2(value2)) return false;
  return hasOwnProperty.call(possibleTypes, typeof value2);
};
var isObject = is$3;
var is$2 = function(value2) {
  if (!isObject(value2)) return false;
  try {
    if (!value2.constructor) return false;
    return value2.constructor.prototype === value2;
  } catch (error) {
    return false;
  }
};
var isPrototype = is$2;
var is$1 = function(value2) {
  if (typeof value2 !== "function") return false;
  if (!hasOwnProperty.call(value2, "length")) return false;
  try {
    if (typeof value2.length !== "number") return false;
    if (typeof value2.call !== "function") return false;
    if (typeof value2.apply !== "function") return false;
  } catch (error) {
    return false;
  }
  return !isPrototype(value2);
};
var isFunction$1 = is$1;
var classRe = /^\s*class[\s{/}]/, functionToString = Function.prototype.toString;
var is = function(value2) {
  if (!isFunction$1(value2)) return false;
  if (classRe.test(functionToString.call(value2))) return false;
  return true;
};
var str = "razdwatrzy";
var isImplemented$4 = function() {
  if (typeof str.contains !== "function") return false;
  return str.contains("dwa") === true && str.contains("foo") === false;
};
var shim$3;
var hasRequiredShim$2;
function requireShim$2() {
  if (hasRequiredShim$2) return shim$3;
  hasRequiredShim$2 = 1;
  var indexOf = String.prototype.indexOf;
  shim$3 = function(searchString) {
    return indexOf.call(this, searchString, arguments[1]) > -1;
  };
  return shim$3;
}
var contains$1 = isImplemented$4() ? String.prototype.contains : requireShim$2();
var isValue$1 = is$4, isPlainFunction = is, assign = assign$1, normalizeOpts$1 = normalizeOptions, contains = contains$1;
var d$1 = d$2.exports = function(dscr, value2) {
  var c, e2, w2, options, desc2;
  if (arguments.length < 2 || typeof dscr !== "string") {
    options = value2;
    value2 = dscr;
    dscr = null;
  } else {
    options = arguments[2];
  }
  if (isValue$1(dscr)) {
    c = contains.call(dscr, "c");
    e2 = contains.call(dscr, "e");
    w2 = contains.call(dscr, "w");
  } else {
    c = w2 = true;
    e2 = false;
  }
  desc2 = { value: value2, configurable: c, enumerable: e2, writable: w2 };
  return !options ? desc2 : assign(normalizeOpts$1(options), desc2);
};
d$1.gs = function(dscr, get2, set) {
  var c, e2, options, desc2;
  if (typeof dscr !== "string") {
    options = set;
    set = get2;
    get2 = dscr;
    dscr = null;
  } else {
    options = arguments[3];
  }
  if (!isValue$1(get2)) {
    get2 = void 0;
  } else if (!isPlainFunction(get2)) {
    options = get2;
    get2 = set = void 0;
  } else if (!isValue$1(set)) {
    set = void 0;
  } else if (!isPlainFunction(set)) {
    options = set;
    set = void 0;
  }
  if (isValue$1(dscr)) {
    c = contains.call(dscr, "c");
    e2 = contains.call(dscr, "e");
  } else {
    c = true;
    e2 = false;
  }
  desc2 = { get: get2, set, configurable: c, enumerable: e2 };
  return !options ? desc2 : assign(normalizeOpts$1(options), desc2);
};
var dExports = d$2.exports;
var eventEmitter = { exports: {} };
(function(module, exports) {
  var d2 = dExports, callable2 = validCallable, apply2 = Function.prototype.apply, call2 = Function.prototype.call, create2 = Object.create, defineProperty2 = Object.defineProperty, defineProperties2 = Object.defineProperties, hasOwnProperty2 = Object.prototype.hasOwnProperty, descriptor = { configurable: true, enumerable: false, writable: true }, on2, once, off, emit2, methods, descriptors, base;
  on2 = function(type, listener) {
    var data;
    callable2(listener);
    if (!hasOwnProperty2.call(this, "__ee__")) {
      data = descriptor.value = create2(null);
      defineProperty2(this, "__ee__", descriptor);
      descriptor.value = null;
    } else {
      data = this.__ee__;
    }
    if (!data[type]) data[type] = listener;
    else if (typeof data[type] === "object") data[type].push(listener);
    else data[type] = [data[type], listener];
    return this;
  };
  once = function(type, listener) {
    var once2, self3;
    callable2(listener);
    self3 = this;
    on2.call(this, type, once2 = function() {
      off.call(self3, type, once2);
      apply2.call(listener, this, arguments);
    });
    once2.__eeOnceListener__ = listener;
    return this;
  };
  off = function(type, listener) {
    var data, listeners, candidate, i;
    callable2(listener);
    if (!hasOwnProperty2.call(this, "__ee__")) return this;
    data = this.__ee__;
    if (!data[type]) return this;
    listeners = data[type];
    if (typeof listeners === "object") {
      for (i = 0; candidate = listeners[i]; ++i) {
        if (candidate === listener || candidate.__eeOnceListener__ === listener) {
          if (listeners.length === 2) data[type] = listeners[i ? 0 : 1];
          else listeners.splice(i, 1);
        }
      }
    } else {
      if (listeners === listener || listeners.__eeOnceListener__ === listener) {
        delete data[type];
      }
    }
    return this;
  };
  emit2 = function(type) {
    var i, l2, listener, listeners, args;
    if (!hasOwnProperty2.call(this, "__ee__")) return;
    listeners = this.__ee__[type];
    if (!listeners) return;
    if (typeof listeners === "object") {
      l2 = arguments.length;
      args = new Array(l2 - 1);
      for (i = 1; i < l2; ++i) args[i - 1] = arguments[i];
      listeners = listeners.slice();
      for (i = 0; listener = listeners[i]; ++i) {
        apply2.call(listener, this, args);
      }
    } else {
      switch (arguments.length) {
        case 1:
          call2.call(listeners, this);
          break;
        case 2:
          call2.call(listeners, this, arguments[1]);
          break;
        case 3:
          call2.call(listeners, this, arguments[1], arguments[2]);
          break;
        default:
          l2 = arguments.length;
          args = new Array(l2 - 1);
          for (i = 1; i < l2; ++i) {
            args[i - 1] = arguments[i];
          }
          apply2.call(listeners, this, args);
      }
    }
  };
  methods = {
    on: on2,
    once,
    off,
    emit: emit2
  };
  descriptors = {
    on: d2(on2),
    once: d2(once),
    off: d2(off),
    emit: d2(emit2)
  };
  base = defineProperties2({}, descriptors);
  module.exports = exports = function(o) {
    return o == null ? create2(base) : defineProperties2(Object(o), descriptors);
  };
  exports.methods = methods;
})(eventEmitter, eventEmitter.exports);
var eventEmitterExports = eventEmitter.exports;
var isImplemented$3;
var hasRequiredIsImplemented$3;
function requireIsImplemented$3() {
  if (hasRequiredIsImplemented$3) return isImplemented$3;
  hasRequiredIsImplemented$3 = 1;
  isImplemented$3 = function() {
    var from2 = Array.from, arr, result;
    if (typeof from2 !== "function") return false;
    arr = ["raz", "dwa"];
    result = from2(arr);
    return Boolean(result && result !== arr && result[1] === "dwa");
  };
  return isImplemented$3;
}
var isImplemented$2;
var hasRequiredIsImplemented$2;
function requireIsImplemented$2() {
  if (hasRequiredIsImplemented$2) return isImplemented$2;
  hasRequiredIsImplemented$2 = 1;
  isImplemented$2 = function() {
    if (typeof globalThis !== "object") return false;
    if (!globalThis) return false;
    return globalThis.Array === Array;
  };
  return isImplemented$2;
}
var implementation;
var hasRequiredImplementation;
function requireImplementation() {
  if (hasRequiredImplementation) return implementation;
  hasRequiredImplementation = 1;
  var naiveFallback = function() {
    if (typeof self === "object" && self) return self;
    if (typeof window === "object" && window) return window;
    throw new Error("Unable to resolve global `this`");
  };
  implementation = function() {
    if (this) return this;
    try {
      Object.defineProperty(Object.prototype, "__global__", {
        get: function() {
          return this;
        },
        configurable: true
      });
    } catch (error) {
      return naiveFallback();
    }
    try {
      if (!__global__) return naiveFallback();
      return __global__;
    } finally {
      delete Object.prototype.__global__;
    }
  }();
  return implementation;
}
var globalThis_1;
var hasRequiredGlobalThis;
function requireGlobalThis() {
  if (hasRequiredGlobalThis) return globalThis_1;
  hasRequiredGlobalThis = 1;
  globalThis_1 = requireIsImplemented$2()() ? globalThis : requireImplementation();
  return globalThis_1;
}
var isImplemented$1;
var hasRequiredIsImplemented$1;
function requireIsImplemented$1() {
  if (hasRequiredIsImplemented$1) return isImplemented$1;
  hasRequiredIsImplemented$1 = 1;
  var global = requireGlobalThis(), validTypes = { object: true, symbol: true };
  isImplemented$1 = function() {
    var Symbol = global.Symbol;
    var symbol;
    if (typeof Symbol !== "function") return false;
    symbol = Symbol("test symbol");
    try {
      String(symbol);
    } catch (e2) {
      return false;
    }
    if (!validTypes[typeof Symbol.iterator]) return false;
    if (!validTypes[typeof Symbol.toPrimitive]) return false;
    if (!validTypes[typeof Symbol.toStringTag]) return false;
    return true;
  };
  return isImplemented$1;
}
var isSymbol;
var hasRequiredIsSymbol;
function requireIsSymbol() {
  if (hasRequiredIsSymbol) return isSymbol;
  hasRequiredIsSymbol = 1;
  isSymbol = function(value2) {
    if (!value2) return false;
    if (typeof value2 === "symbol") return true;
    if (!value2.constructor) return false;
    if (value2.constructor.name !== "Symbol") return false;
    return value2[value2.constructor.toStringTag] === "Symbol";
  };
  return isSymbol;
}
var validateSymbol;
var hasRequiredValidateSymbol;
function requireValidateSymbol() {
  if (hasRequiredValidateSymbol) return validateSymbol;
  hasRequiredValidateSymbol = 1;
  var isSymbol2 = requireIsSymbol();
  validateSymbol = function(value2) {
    if (!isSymbol2(value2)) throw new TypeError(value2 + " is not a symbol");
    return value2;
  };
  return validateSymbol;
}
var generateName;
var hasRequiredGenerateName;
function requireGenerateName() {
  if (hasRequiredGenerateName) return generateName;
  hasRequiredGenerateName = 1;
  var d2 = dExports;
  var create2 = Object.create, defineProperty2 = Object.defineProperty, objPrototype = Object.prototype;
  var created = create2(null);
  generateName = function(desc2) {
    var postfix = 0, name, ie11BugWorkaround;
    while (created[desc2 + (postfix || "")]) ++postfix;
    desc2 += postfix || "";
    created[desc2] = true;
    name = "@@" + desc2;
    defineProperty2(
      objPrototype,
      name,
      d2.gs(null, function(value2) {
        if (ie11BugWorkaround) return;
        ie11BugWorkaround = true;
        defineProperty2(this, name, d2(value2));
        ie11BugWorkaround = false;
      })
    );
    return name;
  };
  return generateName;
}
var standardSymbols;
var hasRequiredStandardSymbols;
function requireStandardSymbols() {
  if (hasRequiredStandardSymbols) return standardSymbols;
  hasRequiredStandardSymbols = 1;
  var d2 = dExports, NativeSymbol = requireGlobalThis().Symbol;
  standardSymbols = function(SymbolPolyfill) {
    return Object.defineProperties(SymbolPolyfill, {
      // To ensure proper interoperability with other native functions (e.g. Array.from)
      // fallback to eventual native implementation of given symbol
      hasInstance: d2(
        "",
        NativeSymbol && NativeSymbol.hasInstance || SymbolPolyfill("hasInstance")
      ),
      isConcatSpreadable: d2(
        "",
        NativeSymbol && NativeSymbol.isConcatSpreadable || SymbolPolyfill("isConcatSpreadable")
      ),
      iterator: d2("", NativeSymbol && NativeSymbol.iterator || SymbolPolyfill("iterator")),
      match: d2("", NativeSymbol && NativeSymbol.match || SymbolPolyfill("match")),
      replace: d2("", NativeSymbol && NativeSymbol.replace || SymbolPolyfill("replace")),
      search: d2("", NativeSymbol && NativeSymbol.search || SymbolPolyfill("search")),
      species: d2("", NativeSymbol && NativeSymbol.species || SymbolPolyfill("species")),
      split: d2("", NativeSymbol && NativeSymbol.split || SymbolPolyfill("split")),
      toPrimitive: d2(
        "",
        NativeSymbol && NativeSymbol.toPrimitive || SymbolPolyfill("toPrimitive")
      ),
      toStringTag: d2(
        "",
        NativeSymbol && NativeSymbol.toStringTag || SymbolPolyfill("toStringTag")
      ),
      unscopables: d2(
        "",
        NativeSymbol && NativeSymbol.unscopables || SymbolPolyfill("unscopables")
      )
    });
  };
  return standardSymbols;
}
var symbolRegistry;
var hasRequiredSymbolRegistry;
function requireSymbolRegistry() {
  if (hasRequiredSymbolRegistry) return symbolRegistry;
  hasRequiredSymbolRegistry = 1;
  var d2 = dExports, validateSymbol2 = requireValidateSymbol();
  var registry = /* @__PURE__ */ Object.create(null);
  symbolRegistry = function(SymbolPolyfill) {
    return Object.defineProperties(SymbolPolyfill, {
      for: d2(function(key) {
        if (registry[key]) return registry[key];
        return registry[key] = SymbolPolyfill(String(key));
      }),
      keyFor: d2(function(symbol) {
        var key;
        validateSymbol2(symbol);
        for (key in registry) {
          if (registry[key] === symbol) return key;
        }
        return void 0;
      })
    });
  };
  return symbolRegistry;
}
var polyfill;
var hasRequiredPolyfill;
function requirePolyfill() {
  if (hasRequiredPolyfill) return polyfill;
  hasRequiredPolyfill = 1;
  var d2 = dExports, validateSymbol2 = requireValidateSymbol(), NativeSymbol = requireGlobalThis().Symbol, generateName2 = requireGenerateName(), setupStandardSymbols = requireStandardSymbols(), setupSymbolRegistry = requireSymbolRegistry();
  var create2 = Object.create, defineProperties2 = Object.defineProperties, defineProperty2 = Object.defineProperty;
  var SymbolPolyfill, HiddenSymbol, isNativeSafe;
  if (typeof NativeSymbol === "function") {
    try {
      String(NativeSymbol());
      isNativeSafe = true;
    } catch (ignore) {
    }
  } else {
    NativeSymbol = null;
  }
  HiddenSymbol = function Symbol(description) {
    if (this instanceof HiddenSymbol) throw new TypeError("Symbol is not a constructor");
    return SymbolPolyfill(description);
  };
  polyfill = SymbolPolyfill = function Symbol(description) {
    var symbol;
    if (this instanceof Symbol) throw new TypeError("Symbol is not a constructor");
    if (isNativeSafe) return NativeSymbol(description);
    symbol = create2(HiddenSymbol.prototype);
    description = description === void 0 ? "" : String(description);
    return defineProperties2(symbol, {
      __description__: d2("", description),
      __name__: d2("", generateName2(description))
    });
  };
  setupStandardSymbols(SymbolPolyfill);
  setupSymbolRegistry(SymbolPolyfill);
  defineProperties2(HiddenSymbol.prototype, {
    constructor: d2(SymbolPolyfill),
    toString: d2("", function() {
      return this.__name__;
    })
  });
  defineProperties2(SymbolPolyfill.prototype, {
    toString: d2(function() {
      return "Symbol (" + validateSymbol2(this).__description__ + ")";
    }),
    valueOf: d2(function() {
      return validateSymbol2(this);
    })
  });
  defineProperty2(
    SymbolPolyfill.prototype,
    SymbolPolyfill.toPrimitive,
    d2("", function() {
      var symbol = validateSymbol2(this);
      if (typeof symbol === "symbol") return symbol;
      return symbol.toString();
    })
  );
  defineProperty2(SymbolPolyfill.prototype, SymbolPolyfill.toStringTag, d2("c", "Symbol"));
  defineProperty2(
    HiddenSymbol.prototype,
    SymbolPolyfill.toStringTag,
    d2("c", SymbolPolyfill.prototype[SymbolPolyfill.toStringTag])
  );
  defineProperty2(
    HiddenSymbol.prototype,
    SymbolPolyfill.toPrimitive,
    d2("c", SymbolPolyfill.prototype[SymbolPolyfill.toPrimitive])
  );
  return polyfill;
}
var es6Symbol;
var hasRequiredEs6Symbol;
function requireEs6Symbol() {
  if (hasRequiredEs6Symbol) return es6Symbol;
  hasRequiredEs6Symbol = 1;
  es6Symbol = requireIsImplemented$1()() ? requireGlobalThis().Symbol : requirePolyfill();
  return es6Symbol;
}
var isArguments;
var hasRequiredIsArguments;
function requireIsArguments() {
  if (hasRequiredIsArguments) return isArguments;
  hasRequiredIsArguments = 1;
  var objToString = Object.prototype.toString, id = objToString.call(/* @__PURE__ */ function() {
    return arguments;
  }());
  isArguments = function(value2) {
    return objToString.call(value2) === id;
  };
  return isArguments;
}
var isFunction;
var hasRequiredIsFunction;
function requireIsFunction() {
  if (hasRequiredIsFunction) return isFunction;
  hasRequiredIsFunction = 1;
  var objToString = Object.prototype.toString, isFunctionStringTag = RegExp.prototype.test.bind(/^[object [A-Za-z0-9]*Function]$/);
  isFunction = function(value2) {
    return typeof value2 === "function" && isFunctionStringTag(objToString.call(value2));
  };
  return isFunction;
}
var isString;
var hasRequiredIsString;
function requireIsString() {
  if (hasRequiredIsString) return isString;
  hasRequiredIsString = 1;
  var objToString = Object.prototype.toString, id = objToString.call("");
  isString = function(value2) {
    return typeof value2 === "string" || value2 && typeof value2 === "object" && (value2 instanceof String || objToString.call(value2) === id) || false;
  };
  return isString;
}
var shim$2;
var hasRequiredShim$1;
function requireShim$1() {
  if (hasRequiredShim$1) return shim$2;
  hasRequiredShim$1 = 1;
  var iteratorSymbol = requireEs6Symbol().iterator, isArguments2 = requireIsArguments(), isFunction2 = requireIsFunction(), toPosInt2 = toPosInteger, callable2 = validCallable, validValue$1 = validValue, isValue2 = isValue$6, isString2 = requireIsString(), isArray2 = Array.isArray, call2 = Function.prototype.call, desc2 = { configurable: true, enumerable: true, writable: true, value: null }, defineProperty2 = Object.defineProperty;
  shim$2 = function(arrayLike) {
    var mapFn = arguments[1], thisArg = arguments[2], Context, i, j, arr, length, code, iterator, result, getIterator, value2;
    arrayLike = Object(validValue$1(arrayLike));
    if (isValue2(mapFn)) callable2(mapFn);
    if (!this || this === Array || !isFunction2(this)) {
      if (!mapFn) {
        if (isArguments2(arrayLike)) {
          length = arrayLike.length;
          if (length !== 1) return Array.apply(null, arrayLike);
          arr = new Array(1);
          arr[0] = arrayLike[0];
          return arr;
        }
        if (isArray2(arrayLike)) {
          arr = new Array(length = arrayLike.length);
          for (i = 0; i < length; ++i) arr[i] = arrayLike[i];
          return arr;
        }
      }
      arr = [];
    } else {
      Context = this;
    }
    if (!isArray2(arrayLike)) {
      if ((getIterator = arrayLike[iteratorSymbol]) !== void 0) {
        iterator = callable2(getIterator).call(arrayLike);
        if (Context) arr = new Context();
        result = iterator.next();
        i = 0;
        while (!result.done) {
          value2 = mapFn ? call2.call(mapFn, thisArg, result.value, i) : result.value;
          if (Context) {
            desc2.value = value2;
            defineProperty2(arr, i, desc2);
          } else {
            arr[i] = value2;
          }
          result = iterator.next();
          ++i;
        }
        length = i;
      } else if (isString2(arrayLike)) {
        length = arrayLike.length;
        if (Context) arr = new Context();
        for (i = 0, j = 0; i < length; ++i) {
          value2 = arrayLike[i];
          if (i + 1 < length) {
            code = value2.charCodeAt(0);
            if (code >= 55296 && code <= 56319) value2 += arrayLike[++i];
          }
          value2 = mapFn ? call2.call(mapFn, thisArg, value2, j) : value2;
          if (Context) {
            desc2.value = value2;
            defineProperty2(arr, j, desc2);
          } else {
            arr[j] = value2;
          }
          ++j;
        }
        length = j;
      }
    }
    if (length === void 0) {
      length = toPosInt2(arrayLike.length);
      if (Context) arr = new Context(length);
      for (i = 0; i < length; ++i) {
        value2 = mapFn ? call2.call(mapFn, thisArg, arrayLike[i], i) : arrayLike[i];
        if (Context) {
          desc2.value = value2;
          defineProperty2(arr, i, desc2);
        } else {
          arr[i] = value2;
        }
      }
    }
    if (Context) {
      desc2.value = null;
      arr.length = length;
    }
    return arr;
  };
  return shim$2;
}
var from$1;
var hasRequiredFrom;
function requireFrom() {
  if (hasRequiredFrom) return from$1;
  hasRequiredFrom = 1;
  from$1 = requireIsImplemented$3()() ? Array.from : requireShim$1();
  return from$1;
}
var from = requireFrom(), isArray = Array.isArray;
var toArray$1 = function(arrayLike) {
  return isArray(arrayLike) ? arrayLike : from(arrayLike);
};
var toArray = toArray$1, isValue = isValue$6, callable$2 = validCallable;
var slice = Array.prototype.slice, resolveArgs;
resolveArgs = function(args) {
  return this.map(function(resolve, i) {
    return resolve ? resolve(args[i]) : args[i];
  }).concat(
    slice.call(args, this.length)
  );
};
var resolveResolve$1 = function(resolvers) {
  resolvers = toArray(resolvers);
  resolvers.forEach(function(resolve) {
    if (isValue(resolve)) callable$2(resolve);
  });
  return resolveArgs.bind(resolvers);
};
var callable$1 = validCallable;
var resolveNormalize$1 = function(userNormalizer) {
  var normalizer;
  if (typeof userNormalizer === "function") return { set: userNormalizer, get: userNormalizer };
  normalizer = { get: callable$1(userNormalizer.get) };
  if (userNormalizer.set !== void 0) {
    normalizer.set = callable$1(userNormalizer.set);
    if (userNormalizer.delete) normalizer.delete = callable$1(userNormalizer.delete);
    if (userNormalizer.clear) normalizer.clear = callable$1(userNormalizer.clear);
    return normalizer;
  }
  normalizer.set = normalizer.get;
  return normalizer;
};
var customError = customExports, defineLength = _defineLengthExports, d = dExports, ee = eventEmitterExports.methods, resolveResolve = resolveResolve$1, resolveNormalize = resolveNormalize$1;
var apply = Function.prototype.apply, call = Function.prototype.call, create = Object.create, defineProperties = Object.defineProperties, on = ee.on, emit = ee.emit;
var configureMap = function(original, length, options) {
  var cache = create(null), conf, memLength, get2, set, del, clear, extDel, extGet, extHas, normalizer, getListeners, setListeners, deleteListeners, memoized, resolve;
  if (length !== false) memLength = length;
  else if (isNaN(original.length)) memLength = 1;
  else memLength = original.length;
  if (options.normalizer) {
    normalizer = resolveNormalize(options.normalizer);
    get2 = normalizer.get;
    set = normalizer.set;
    del = normalizer.delete;
    clear = normalizer.clear;
  }
  if (options.resolvers != null) resolve = resolveResolve(options.resolvers);
  if (get2) {
    memoized = defineLength(function(arg) {
      var id, result, args = arguments;
      if (resolve) args = resolve(args);
      id = get2(args);
      if (id !== null) {
        if (hasOwnProperty.call(cache, id)) {
          if (getListeners) conf.emit("get", id, args, this);
          return cache[id];
        }
      }
      if (args.length === 1) result = call.call(original, this, args[0]);
      else result = apply.call(original, this, args);
      if (id === null) {
        id = get2(args);
        if (id !== null) throw customError("Circular invocation", "CIRCULAR_INVOCATION");
        id = set(args);
      } else if (hasOwnProperty.call(cache, id)) {
        throw customError("Circular invocation", "CIRCULAR_INVOCATION");
      }
      cache[id] = result;
      if (setListeners) conf.emit("set", id, null, result);
      return result;
    }, memLength);
  } else if (length === 0) {
    memoized = function() {
      var result;
      if (hasOwnProperty.call(cache, "data")) {
        if (getListeners) conf.emit("get", "data", arguments, this);
        return cache.data;
      }
      if (arguments.length) result = apply.call(original, this, arguments);
      else result = call.call(original, this);
      if (hasOwnProperty.call(cache, "data")) {
        throw customError("Circular invocation", "CIRCULAR_INVOCATION");
      }
      cache.data = result;
      if (setListeners) conf.emit("set", "data", null, result);
      return result;
    };
  } else {
    memoized = function(arg) {
      var result, args = arguments, id;
      if (resolve) args = resolve(arguments);
      id = String(args[0]);
      if (hasOwnProperty.call(cache, id)) {
        if (getListeners) conf.emit("get", id, args, this);
        return cache[id];
      }
      if (args.length === 1) result = call.call(original, this, args[0]);
      else result = apply.call(original, this, args);
      if (hasOwnProperty.call(cache, id)) {
        throw customError("Circular invocation", "CIRCULAR_INVOCATION");
      }
      cache[id] = result;
      if (setListeners) conf.emit("set", id, null, result);
      return result;
    };
  }
  conf = {
    original,
    memoized,
    profileName: options.profileName,
    get: function(args) {
      if (resolve) args = resolve(args);
      if (get2) return get2(args);
      return String(args[0]);
    },
    has: function(id) {
      return hasOwnProperty.call(cache, id);
    },
    delete: function(id) {
      var result;
      if (!hasOwnProperty.call(cache, id)) return;
      if (del) del(id);
      result = cache[id];
      delete cache[id];
      if (deleteListeners) conf.emit("delete", id, result);
    },
    clear: function() {
      var oldCache = cache;
      if (clear) clear();
      cache = create(null);
      conf.emit("clear", oldCache);
    },
    on: function(type, listener) {
      if (type === "get") getListeners = true;
      else if (type === "set") setListeners = true;
      else if (type === "delete") deleteListeners = true;
      return on.call(this, type, listener);
    },
    emit,
    updateEnv: function() {
      original = conf.original;
    }
  };
  if (get2) {
    extDel = defineLength(function(arg) {
      var id, args = arguments;
      if (resolve) args = resolve(args);
      id = get2(args);
      if (id === null) return;
      conf.delete(id);
    }, memLength);
  } else if (length === 0) {
    extDel = function() {
      return conf.delete("data");
    };
  } else {
    extDel = function(arg) {
      if (resolve) arg = resolve(arguments)[0];
      return conf.delete(arg);
    };
  }
  extGet = defineLength(function() {
    var id, args = arguments;
    if (length === 0) return cache.data;
    if (resolve) args = resolve(args);
    if (get2) id = get2(args);
    else id = String(args[0]);
    return cache[id];
  });
  extHas = defineLength(function() {
    var id, args = arguments;
    if (length === 0) return conf.has("data");
    if (resolve) args = resolve(args);
    if (get2) id = get2(args);
    else id = String(args[0]);
    if (id === null) return false;
    return conf.has(id);
  });
  defineProperties(memoized, {
    __memoized__: d(true),
    delete: d(extDel),
    clear: d(conf.clear),
    _get: d(extGet),
    _has: d(extHas)
  });
  return conf;
};
var callable = validCallable, forEach = forEach$1, extensions = registeredExtensions, configure = configureMap, resolveLength$1 = resolveLength$2;
var plain$1 = function self2(fn) {
  var options, length, conf;
  callable(fn);
  options = Object(arguments[1]);
  if (options.async && options.promise) {
    throw new Error("Options 'async' and 'promise' cannot be used together");
  }
  if (hasOwnProperty.call(fn, "__memoized__") && !options.force) return fn;
  length = resolveLength$1(options.length, fn.length, options.async && extensions.async);
  conf = configure(fn, length, options);
  forEach(extensions, function(extFn, name) {
    if (options[name]) extFn(options[name], conf, options);
  });
  if (self2.__profiler__) self2.__profiler__(conf);
  conf.updateEnv();
  return conf.memoized;
};
var primitive;
var hasRequiredPrimitive;
function requirePrimitive() {
  if (hasRequiredPrimitive) return primitive;
  hasRequiredPrimitive = 1;
  primitive = function(args) {
    var id, i, length = args.length;
    if (!length) return "";
    id = String(args[i = 0]);
    while (--length) id += "" + args[++i];
    return id;
  };
  return primitive;
}
var getPrimitiveFixed;
var hasRequiredGetPrimitiveFixed;
function requireGetPrimitiveFixed() {
  if (hasRequiredGetPrimitiveFixed) return getPrimitiveFixed;
  hasRequiredGetPrimitiveFixed = 1;
  getPrimitiveFixed = function(length) {
    if (!length) {
      return function() {
        return "";
      };
    }
    return function(args) {
      var id = String(args[0]), i = 0, currentLength = length;
      while (--currentLength) {
        id += "" + args[++i];
      }
      return id;
    };
  };
  return getPrimitiveFixed;
}
var isImplemented;
var hasRequiredIsImplemented;
function requireIsImplemented() {
  if (hasRequiredIsImplemented) return isImplemented;
  hasRequiredIsImplemented = 1;
  isImplemented = function() {
    var numberIsNaN = Number.isNaN;
    if (typeof numberIsNaN !== "function") return false;
    return !numberIsNaN({}) && numberIsNaN(NaN) && !numberIsNaN(34);
  };
  return isImplemented;
}
var shim$1;
var hasRequiredShim;
function requireShim() {
  if (hasRequiredShim) return shim$1;
  hasRequiredShim = 1;
  shim$1 = function(value2) {
    return value2 !== value2;
  };
  return shim$1;
}
var isNan;
var hasRequiredIsNan;
function requireIsNan() {
  if (hasRequiredIsNan) return isNan;
  hasRequiredIsNan = 1;
  isNan = requireIsImplemented()() ? Number.isNaN : requireShim();
  return isNan;
}
var eIndexOf;
var hasRequiredEIndexOf;
function requireEIndexOf() {
  if (hasRequiredEIndexOf) return eIndexOf;
  hasRequiredEIndexOf = 1;
  var numberIsNaN = requireIsNan(), toPosInt2 = toPosInteger, value2 = validValue, indexOf = Array.prototype.indexOf, objHasOwnProperty = Object.prototype.hasOwnProperty, abs2 = Math.abs, floor2 = Math.floor;
  eIndexOf = function(searchElement) {
    var i, length, fromIndex, val;
    if (!numberIsNaN(searchElement)) return indexOf.apply(this, arguments);
    length = toPosInt2(value2(this).length);
    fromIndex = arguments[1];
    if (isNaN(fromIndex)) fromIndex = 0;
    else if (fromIndex >= 0) fromIndex = floor2(fromIndex);
    else fromIndex = toPosInt2(this.length) - floor2(abs2(fromIndex));
    for (i = fromIndex; i < length; ++i) {
      if (objHasOwnProperty.call(this, i)) {
        val = this[i];
        if (numberIsNaN(val)) return i;
      }
    }
    return -1;
  };
  return eIndexOf;
}
var get;
var hasRequiredGet;
function requireGet() {
  if (hasRequiredGet) return get;
  hasRequiredGet = 1;
  var indexOf = requireEIndexOf();
  var create2 = Object.create;
  get = function() {
    var lastId = 0, map2 = [], cache = create2(null);
    return {
      get: function(args) {
        var index = 0, set = map2, i, length = args.length;
        if (length === 0) return set[length] || null;
        if (set = set[length]) {
          while (index < length - 1) {
            i = indexOf.call(set[0], args[index]);
            if (i === -1) return null;
            set = set[1][i];
            ++index;
          }
          i = indexOf.call(set[0], args[index]);
          if (i === -1) return null;
          return set[1][i] || null;
        }
        return null;
      },
      set: function(args) {
        var index = 0, set = map2, i, length = args.length;
        if (length === 0) {
          set[length] = ++lastId;
        } else {
          if (!set[length]) {
            set[length] = [[], []];
          }
          set = set[length];
          while (index < length - 1) {
            i = indexOf.call(set[0], args[index]);
            if (i === -1) {
              i = set[0].push(args[index]) - 1;
              set[1].push([[], []]);
            }
            set = set[1][i];
            ++index;
          }
          i = indexOf.call(set[0], args[index]);
          if (i === -1) {
            i = set[0].push(args[index]) - 1;
          }
          set[1][i] = ++lastId;
        }
        cache[lastId] = args;
        return lastId;
      },
      delete: function(id) {
        var index = 0, set = map2, i, args = cache[id], length = args.length, path = [];
        if (length === 0) {
          delete set[length];
        } else if (set = set[length]) {
          while (index < length - 1) {
            i = indexOf.call(set[0], args[index]);
            if (i === -1) {
              return;
            }
            path.push(set, i);
            set = set[1][i];
            ++index;
          }
          i = indexOf.call(set[0], args[index]);
          if (i === -1) {
            return;
          }
          id = set[1][i];
          set[0].splice(i, 1);
          set[1].splice(i, 1);
          while (!set[0].length && path.length) {
            i = path.pop();
            set = path.pop();
            set[0].splice(i, 1);
            set[1].splice(i, 1);
          }
        }
        delete cache[id];
      },
      clear: function() {
        map2 = [];
        cache = create2(null);
      }
    };
  };
  return get;
}
var get1;
var hasRequiredGet1;
function requireGet1() {
  if (hasRequiredGet1) return get1;
  hasRequiredGet1 = 1;
  var indexOf = requireEIndexOf();
  get1 = function() {
    var lastId = 0, argsMap = [], cache = [];
    return {
      get: function(args) {
        var index = indexOf.call(argsMap, args[0]);
        return index === -1 ? null : cache[index];
      },
      set: function(args) {
        argsMap.push(args[0]);
        cache.push(++lastId);
        return lastId;
      },
      delete: function(id) {
        var index = indexOf.call(cache, id);
        if (index !== -1) {
          argsMap.splice(index, 1);
          cache.splice(index, 1);
        }
      },
      clear: function() {
        argsMap = [];
        cache = [];
      }
    };
  };
  return get1;
}
var getFixed;
var hasRequiredGetFixed;
function requireGetFixed() {
  if (hasRequiredGetFixed) return getFixed;
  hasRequiredGetFixed = 1;
  var indexOf = requireEIndexOf(), create2 = Object.create;
  getFixed = function(length) {
    var lastId = 0, map2 = [[], []], cache = create2(null);
    return {
      get: function(args) {
        var index = 0, set = map2, i;
        while (index < length - 1) {
          i = indexOf.call(set[0], args[index]);
          if (i === -1) return null;
          set = set[1][i];
          ++index;
        }
        i = indexOf.call(set[0], args[index]);
        if (i === -1) return null;
        return set[1][i] || null;
      },
      set: function(args) {
        var index = 0, set = map2, i;
        while (index < length - 1) {
          i = indexOf.call(set[0], args[index]);
          if (i === -1) {
            i = set[0].push(args[index]) - 1;
            set[1].push([[], []]);
          }
          set = set[1][i];
          ++index;
        }
        i = indexOf.call(set[0], args[index]);
        if (i === -1) {
          i = set[0].push(args[index]) - 1;
        }
        set[1][i] = ++lastId;
        cache[lastId] = args;
        return lastId;
      },
      delete: function(id) {
        var index = 0, set = map2, i, path = [], args = cache[id];
        while (index < length - 1) {
          i = indexOf.call(set[0], args[index]);
          if (i === -1) {
            return;
          }
          path.push(set, i);
          set = set[1][i];
          ++index;
        }
        i = indexOf.call(set[0], args[index]);
        if (i === -1) {
          return;
        }
        id = set[1][i];
        set[0].splice(i, 1);
        set[1].splice(i, 1);
        while (!set[0].length && path.length) {
          i = path.pop();
          set = path.pop();
          set[0].splice(i, 1);
          set[1].splice(i, 1);
        }
        delete cache[id];
      },
      clear: function() {
        map2 = [[], []];
        cache = create2(null);
      }
    };
  };
  return getFixed;
}
var async = {};
var map;
var hasRequiredMap;
function requireMap() {
  if (hasRequiredMap) return map;
  hasRequiredMap = 1;
  var callable2 = validCallable, forEach2 = forEach$1, call2 = Function.prototype.call;
  map = function(obj, cb) {
    var result = {}, thisArg = arguments[2];
    callable2(cb);
    forEach2(obj, function(value2, key, targetObj, index) {
      result[key] = call2.call(cb, thisArg, value2, key, targetObj, index);
    });
    return result;
  };
  return map;
}
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var browser = { exports: {} };
var process = browser.exports = {};
var cachedSetTimeout;
var cachedClearTimeout;
function defaultSetTimout() {
  throw new Error("setTimeout has not been defined");
}
function defaultClearTimeout() {
  throw new Error("clearTimeout has not been defined");
}
(function() {
  try {
    if (typeof setTimeout === "function") {
      cachedSetTimeout = setTimeout;
    } else {
      cachedSetTimeout = defaultSetTimout;
    }
  } catch (e2) {
    cachedSetTimeout = defaultSetTimout;
  }
  try {
    if (typeof clearTimeout === "function") {
      cachedClearTimeout = clearTimeout;
    } else {
      cachedClearTimeout = defaultClearTimeout;
    }
  } catch (e2) {
    cachedClearTimeout = defaultClearTimeout;
  }
})();
function runTimeout(fun) {
  if (cachedSetTimeout === setTimeout) {
    return setTimeout(fun, 0);
  }
  if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
    cachedSetTimeout = setTimeout;
    return setTimeout(fun, 0);
  }
  try {
    return cachedSetTimeout(fun, 0);
  } catch (e2) {
    try {
      return cachedSetTimeout.call(null, fun, 0);
    } catch (e22) {
      return cachedSetTimeout.call(this, fun, 0);
    }
  }
}
function runClearTimeout(marker) {
  if (cachedClearTimeout === clearTimeout) {
    return clearTimeout(marker);
  }
  if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
    cachedClearTimeout = clearTimeout;
    return clearTimeout(marker);
  }
  try {
    return cachedClearTimeout(marker);
  } catch (e2) {
    try {
      return cachedClearTimeout.call(null, marker);
    } catch (e22) {
      return cachedClearTimeout.call(this, marker);
    }
  }
}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;
function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }
  draining = false;
  if (currentQueue.length) {
    queue = currentQueue.concat(queue);
  } else {
    queueIndex = -1;
  }
  if (queue.length) {
    drainQueue();
  }
}
function drainQueue() {
  if (draining) {
    return;
  }
  var timeout = runTimeout(cleanUpNextTick);
  draining = true;
  var len = queue.length;
  while (len) {
    currentQueue = queue;
    queue = [];
    while (++queueIndex < len) {
      if (currentQueue) {
        currentQueue[queueIndex].run();
      }
    }
    queueIndex = -1;
    len = queue.length;
  }
  currentQueue = null;
  draining = false;
  runClearTimeout(timeout);
}
process.nextTick = function(fun) {
  var args = new Array(arguments.length - 1);
  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
  }
  queue.push(new Item(fun, args));
  if (queue.length === 1 && !draining) {
    runTimeout(drainQueue);
  }
};
function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}
Item.prototype.run = function() {
  this.fun.apply(null, this.array);
};
process.title = "browser";
process.browser = true;
process.env = {};
process.argv = [];
process.version = "";
process.versions = {};
function noop() {
}
process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;
process.listeners = function(name) {
  return [];
};
process.binding = function(name) {
  throw new Error("process.binding is not supported");
};
process.cwd = function() {
  return "/";
};
process.chdir = function(dir) {
  throw new Error("process.chdir is not supported");
};
process.umask = function() {
  return 0;
};
var browserExports = browser.exports;
const process$1 = /* @__PURE__ */ getDefaultExportFromCjs(browserExports);
var nextTick;
var hasRequiredNextTick;
function requireNextTick() {
  if (hasRequiredNextTick) return nextTick;
  hasRequiredNextTick = 1;
  var ensureCallable = function(fn) {
    if (typeof fn !== "function") throw new TypeError(fn + " is not a function");
    return fn;
  };
  var byObserver = function(Observer) {
    var node = document.createTextNode(""), queue2, currentQueue2, i = 0;
    new Observer(function() {
      var callback;
      if (!queue2) {
        if (!currentQueue2) return;
        queue2 = currentQueue2;
      } else if (currentQueue2) {
        queue2 = currentQueue2.concat(queue2);
      }
      currentQueue2 = queue2;
      queue2 = null;
      if (typeof currentQueue2 === "function") {
        callback = currentQueue2;
        currentQueue2 = null;
        callback();
        return;
      }
      node.data = i = ++i % 2;
      while (currentQueue2) {
        callback = currentQueue2.shift();
        if (!currentQueue2.length) currentQueue2 = null;
        callback();
      }
    }).observe(node, { characterData: true });
    return function(fn) {
      ensureCallable(fn);
      if (queue2) {
        if (typeof queue2 === "function") queue2 = [queue2, fn];
        else queue2.push(fn);
        return;
      }
      queue2 = fn;
      node.data = i = ++i % 2;
    };
  };
  nextTick = function() {
    if (typeof process$1 === "object" && process$1 && typeof process$1.nextTick === "function") {
      return process$1.nextTick;
    }
    if (typeof queueMicrotask === "function") {
      return function(cb) {
        queueMicrotask(ensureCallable(cb));
      };
    }
    if (typeof document === "object" && document) {
      if (typeof MutationObserver === "function") return byObserver(MutationObserver);
      if (typeof WebKitMutationObserver === "function") return byObserver(WebKitMutationObserver);
    }
    if (typeof setImmediate === "function") {
      return function(cb) {
        setImmediate(ensureCallable(cb));
      };
    }
    if (typeof setTimeout === "function" || typeof setTimeout === "object") {
      return function(cb) {
        setTimeout(ensureCallable(cb), 0);
      };
    }
    return null;
  }();
  return nextTick;
}
var hasRequiredAsync;
function requireAsync() {
  if (hasRequiredAsync) return async;
  hasRequiredAsync = 1;
  var aFrom = requireFrom(), objectMap = requireMap(), mixin2 = requireMixin(), defineLength2 = _defineLengthExports, nextTick2 = requireNextTick();
  var slice2 = Array.prototype.slice, apply2 = Function.prototype.apply, create2 = Object.create;
  registeredExtensions.async = function(tbi, conf) {
    var waiting = create2(null), cache = create2(null), base = conf.memoized, original = conf.original, currentCallback, currentContext, currentArgs;
    conf.memoized = defineLength2(function(arg) {
      var args = arguments, last = args[args.length - 1];
      if (typeof last === "function") {
        currentCallback = last;
        args = slice2.call(args, 0, -1);
      }
      return base.apply(currentContext = this, currentArgs = args);
    }, base);
    try {
      mixin2(conf.memoized, base);
    } catch (ignore) {
    }
    conf.on("get", function(id) {
      var cb, context, args;
      if (!currentCallback) return;
      if (waiting[id]) {
        if (typeof waiting[id] === "function") waiting[id] = [waiting[id], currentCallback];
        else waiting[id].push(currentCallback);
        currentCallback = null;
        return;
      }
      cb = currentCallback;
      context = currentContext;
      args = currentArgs;
      currentCallback = currentContext = currentArgs = null;
      nextTick2(function() {
        var data;
        if (hasOwnProperty.call(cache, id)) {
          data = cache[id];
          conf.emit("getasync", id, args, context);
          apply2.call(cb, data.context, data.args);
        } else {
          currentCallback = cb;
          currentContext = context;
          currentArgs = args;
          base.apply(context, args);
        }
      });
    });
    conf.original = function() {
      var args, cb, origCb, result;
      if (!currentCallback) return apply2.call(original, this, arguments);
      args = aFrom(arguments);
      cb = function self3(err) {
        var cb2, args2, id = self3.id;
        if (id == null) {
          nextTick2(apply2.bind(self3, this, arguments));
          return void 0;
        }
        delete self3.id;
        cb2 = waiting[id];
        delete waiting[id];
        if (!cb2) {
          return void 0;
        }
        args2 = aFrom(arguments);
        if (conf.has(id)) {
          if (err) {
            conf.delete(id);
          } else {
            cache[id] = { context: this, args: args2 };
            conf.emit("setasync", id, typeof cb2 === "function" ? 1 : cb2.length);
          }
        }
        if (typeof cb2 === "function") {
          result = apply2.call(cb2, this, args2);
        } else {
          cb2.forEach(function(cb3) {
            result = apply2.call(cb3, this, args2);
          }, this);
        }
        return result;
      };
      origCb = currentCallback;
      currentCallback = currentContext = currentArgs = null;
      args.push(cb);
      result = apply2.call(original, this, args);
      cb.cb = origCb;
      currentCallback = cb;
      return result;
    };
    conf.on("set", function(id) {
      if (!currentCallback) {
        conf.delete(id);
        return;
      }
      if (waiting[id]) {
        if (typeof waiting[id] === "function") waiting[id] = [waiting[id], currentCallback.cb];
        else waiting[id].push(currentCallback.cb);
      } else {
        waiting[id] = currentCallback.cb;
      }
      delete currentCallback.cb;
      currentCallback.id = id;
      currentCallback = null;
    });
    conf.on("delete", function(id) {
      var result;
      if (hasOwnProperty.call(waiting, id)) return;
      if (!cache[id]) return;
      result = cache[id];
      delete cache[id];
      conf.emit("deleteasync", id, slice2.call(result.args, 1));
    });
    conf.on("clear", function() {
      var oldCache = cache;
      cache = create2(null);
      conf.emit(
        "clearasync",
        objectMap(oldCache, function(data) {
          return slice2.call(data.args, 1);
        })
      );
    });
  };
  return async;
}
var promise = {};
var primitiveSet;
var hasRequiredPrimitiveSet;
function requirePrimitiveSet() {
  if (hasRequiredPrimitiveSet) return primitiveSet;
  hasRequiredPrimitiveSet = 1;
  var forEach2 = Array.prototype.forEach, create2 = Object.create;
  primitiveSet = function(arg) {
    var set = create2(null);
    forEach2.call(arguments, function(name) {
      set[name] = true;
    });
    return set;
  };
  return primitiveSet;
}
var isCallable;
var hasRequiredIsCallable;
function requireIsCallable() {
  if (hasRequiredIsCallable) return isCallable;
  hasRequiredIsCallable = 1;
  isCallable = function(obj) {
    return typeof obj === "function";
  };
  return isCallable;
}
var validateStringifiable;
var hasRequiredValidateStringifiable;
function requireValidateStringifiable() {
  if (hasRequiredValidateStringifiable) return validateStringifiable;
  hasRequiredValidateStringifiable = 1;
  var isCallable2 = requireIsCallable();
  validateStringifiable = function(stringifiable) {
    try {
      if (stringifiable && isCallable2(stringifiable.toString)) return stringifiable.toString();
      return String(stringifiable);
    } catch (e2) {
      throw new TypeError("Passed argument cannot be stringifed");
    }
  };
  return validateStringifiable;
}
var validateStringifiableValue;
var hasRequiredValidateStringifiableValue;
function requireValidateStringifiableValue() {
  if (hasRequiredValidateStringifiableValue) return validateStringifiableValue;
  hasRequiredValidateStringifiableValue = 1;
  var ensureValue = validValue, stringifiable = requireValidateStringifiable();
  validateStringifiableValue = function(value2) {
    return stringifiable(ensureValue(value2));
  };
  return validateStringifiableValue;
}
var safeToString;
var hasRequiredSafeToString;
function requireSafeToString() {
  if (hasRequiredSafeToString) return safeToString;
  hasRequiredSafeToString = 1;
  var isCallable2 = requireIsCallable();
  safeToString = function(value2) {
    try {
      if (value2 && isCallable2(value2.toString)) return value2.toString();
      return String(value2);
    } catch (e2) {
      return "<Non-coercible to string value>";
    }
  };
  return safeToString;
}
var toShortStringRepresentation;
var hasRequiredToShortStringRepresentation;
function requireToShortStringRepresentation() {
  if (hasRequiredToShortStringRepresentation) return toShortStringRepresentation;
  hasRequiredToShortStringRepresentation = 1;
  var safeToString2 = requireSafeToString();
  var reNewLine = /[\n\r\u2028\u2029]/g;
  toShortStringRepresentation = function(value2) {
    var string = safeToString2(value2);
    if (string.length > 100) string = string.slice(0, 99) + "…";
    string = string.replace(reNewLine, function(char) {
      return JSON.stringify(char).slice(1, -1);
    });
    return string;
  };
  return toShortStringRepresentation;
}
var isPromise = { exports: {} };
var hasRequiredIsPromise;
function requireIsPromise() {
  if (hasRequiredIsPromise) return isPromise.exports;
  hasRequiredIsPromise = 1;
  isPromise.exports = isPromise$1;
  isPromise.exports.default = isPromise$1;
  function isPromise$1(obj) {
    return !!obj && (typeof obj === "object" || typeof obj === "function") && typeof obj.then === "function";
  }
  return isPromise.exports;
}
var hasRequiredPromise;
function requirePromise() {
  if (hasRequiredPromise) return promise;
  hasRequiredPromise = 1;
  var objectMap = requireMap(), primitiveSet2 = requirePrimitiveSet(), ensureString = requireValidateStringifiableValue(), toShortString = requireToShortStringRepresentation(), isPromise2 = requireIsPromise(), nextTick2 = requireNextTick();
  var create2 = Object.create, supportedModes = primitiveSet2("then", "then:finally", "done", "done:finally");
  registeredExtensions.promise = function(mode, conf) {
    var waiting = create2(null), cache = create2(null), promises = create2(null);
    if (mode === true) {
      mode = null;
    } else {
      mode = ensureString(mode);
      if (!supportedModes[mode]) {
        throw new TypeError("'" + toShortString(mode) + "' is not valid promise mode");
      }
    }
    conf.on("set", function(id, ignore, promise2) {
      var isFailed = false;
      if (!isPromise2(promise2)) {
        cache[id] = promise2;
        conf.emit("setasync", id, 1);
        return;
      }
      waiting[id] = 1;
      promises[id] = promise2;
      var onSuccess = function(result) {
        var count = waiting[id];
        if (isFailed) {
          throw new Error(
            "Memoizee error: Detected unordered then|done & finally resolution, which in turn makes proper detection of success/failure impossible (when in 'done:finally' mode)\nConsider to rely on 'then' or 'done' mode instead."
          );
        }
        if (!count) return;
        delete waiting[id];
        cache[id] = result;
        conf.emit("setasync", id, count);
      };
      var onFailure = function() {
        isFailed = true;
        if (!waiting[id]) return;
        delete waiting[id];
        delete promises[id];
        conf.delete(id);
      };
      var resolvedMode = mode;
      if (!resolvedMode) resolvedMode = "then";
      if (resolvedMode === "then") {
        var nextTickFailure = function() {
          nextTick2(onFailure);
        };
        promise2 = promise2.then(function(result) {
          nextTick2(onSuccess.bind(this, result));
        }, nextTickFailure);
        if (typeof promise2.finally === "function") {
          promise2.finally(nextTickFailure);
        }
      } else if (resolvedMode === "done") {
        if (typeof promise2.done !== "function") {
          throw new Error(
            "Memoizee error: Retrieved promise does not implement 'done' in 'done' mode"
          );
        }
        promise2.done(onSuccess, onFailure);
      } else if (resolvedMode === "done:finally") {
        if (typeof promise2.done !== "function") {
          throw new Error(
            "Memoizee error: Retrieved promise does not implement 'done' in 'done:finally' mode"
          );
        }
        if (typeof promise2.finally !== "function") {
          throw new Error(
            "Memoizee error: Retrieved promise does not implement 'finally' in 'done:finally' mode"
          );
        }
        promise2.done(onSuccess);
        promise2.finally(onFailure);
      }
    });
    conf.on("get", function(id, args, context) {
      var promise2;
      if (waiting[id]) {
        ++waiting[id];
        return;
      }
      promise2 = promises[id];
      var emit2 = function() {
        conf.emit("getasync", id, args, context);
      };
      if (isPromise2(promise2)) {
        if (typeof promise2.done === "function") promise2.done(emit2);
        else {
          promise2.then(function() {
            nextTick2(emit2);
          });
        }
      } else {
        emit2();
      }
    });
    conf.on("delete", function(id) {
      delete promises[id];
      if (waiting[id]) {
        delete waiting[id];
        return;
      }
      if (!hasOwnProperty.call(cache, id)) return;
      var result = cache[id];
      delete cache[id];
      conf.emit("deleteasync", id, [result]);
    });
    conf.on("clear", function() {
      var oldCache = cache;
      cache = create2(null);
      waiting = create2(null);
      promises = create2(null);
      conf.emit("clearasync", objectMap(oldCache, function(data) {
        return [data];
      }));
    });
  };
  return promise;
}
var dispose = {};
var hasRequiredDispose;
function requireDispose() {
  if (hasRequiredDispose) return dispose;
  hasRequiredDispose = 1;
  var callable2 = validCallable, forEach2 = forEach$1, extensions2 = registeredExtensions, apply2 = Function.prototype.apply;
  extensions2.dispose = function(dispose2, conf, options) {
    var del;
    callable2(dispose2);
    if (options.async && extensions2.async || options.promise && extensions2.promise) {
      conf.on(
        "deleteasync",
        del = function(id, resultArray) {
          apply2.call(dispose2, null, resultArray);
        }
      );
      conf.on("clearasync", function(cache) {
        forEach2(cache, function(result, id) {
          del(id, result);
        });
      });
      return;
    }
    conf.on("delete", del = function(id, result) {
      dispose2(result);
    });
    conf.on("clear", function(cache) {
      forEach2(cache, function(result, id) {
        del(id, result);
      });
    });
  };
  return dispose;
}
var maxAge = {};
var maxTimeout;
var hasRequiredMaxTimeout;
function requireMaxTimeout() {
  if (hasRequiredMaxTimeout) return maxTimeout;
  hasRequiredMaxTimeout = 1;
  maxTimeout = 2147483647;
  return maxTimeout;
}
var validTimeout;
var hasRequiredValidTimeout;
function requireValidTimeout() {
  if (hasRequiredValidTimeout) return validTimeout;
  hasRequiredValidTimeout = 1;
  var toPosInt2 = toPosInteger, maxTimeout2 = requireMaxTimeout();
  validTimeout = function(value2) {
    value2 = toPosInt2(value2);
    if (value2 > maxTimeout2) throw new TypeError(value2 + " exceeds maximum possible timeout");
    return value2;
  };
  return validTimeout;
}
var hasRequiredMaxAge;
function requireMaxAge() {
  if (hasRequiredMaxAge) return maxAge;
  hasRequiredMaxAge = 1;
  var aFrom = requireFrom(), forEach2 = forEach$1, nextTick2 = requireNextTick(), isPromise2 = requireIsPromise(), timeout = requireValidTimeout(), extensions2 = registeredExtensions;
  var noop2 = Function.prototype, max2 = Math.max, min = Math.min, create2 = Object.create;
  extensions2.maxAge = function(maxAge2, conf, options) {
    var timeouts, postfix, preFetchAge, preFetchTimeouts;
    maxAge2 = timeout(maxAge2);
    if (!maxAge2) return;
    timeouts = create2(null);
    postfix = options.async && extensions2.async || options.promise && extensions2.promise ? "async" : "";
    conf.on("set" + postfix, function(id) {
      timeouts[id] = setTimeout(function() {
        conf.delete(id);
      }, maxAge2);
      if (typeof timeouts[id].unref === "function") timeouts[id].unref();
      if (!preFetchTimeouts) return;
      if (preFetchTimeouts[id]) {
        if (preFetchTimeouts[id] !== "nextTick") clearTimeout(preFetchTimeouts[id]);
      }
      preFetchTimeouts[id] = setTimeout(function() {
        delete preFetchTimeouts[id];
      }, preFetchAge);
      if (typeof preFetchTimeouts[id].unref === "function") preFetchTimeouts[id].unref();
    });
    conf.on("delete" + postfix, function(id) {
      clearTimeout(timeouts[id]);
      delete timeouts[id];
      if (!preFetchTimeouts) return;
      if (preFetchTimeouts[id] !== "nextTick") clearTimeout(preFetchTimeouts[id]);
      delete preFetchTimeouts[id];
    });
    if (options.preFetch) {
      if (options.preFetch === true || isNaN(options.preFetch)) {
        preFetchAge = 0.333;
      } else {
        preFetchAge = max2(min(Number(options.preFetch), 1), 0);
      }
      if (preFetchAge) {
        preFetchTimeouts = {};
        preFetchAge = (1 - preFetchAge) * maxAge2;
        conf.on("get" + postfix, function(id, args, context) {
          if (!preFetchTimeouts[id]) {
            preFetchTimeouts[id] = "nextTick";
            nextTick2(function() {
              var result;
              if (preFetchTimeouts[id] !== "nextTick") return;
              delete preFetchTimeouts[id];
              conf.delete(id);
              if (options.async) {
                args = aFrom(args);
                args.push(noop2);
              }
              result = conf.memoized.apply(context, args);
              if (options.promise) {
                if (isPromise2(result)) {
                  if (typeof result.done === "function") result.done(noop2, noop2);
                  else result.then(noop2, noop2);
                }
              }
            });
          }
        });
      }
    }
    conf.on("clear" + postfix, function() {
      forEach2(timeouts, function(id) {
        clearTimeout(id);
      });
      timeouts = {};
      if (preFetchTimeouts) {
        forEach2(preFetchTimeouts, function(id) {
          if (id !== "nextTick") clearTimeout(id);
        });
        preFetchTimeouts = {};
      }
    });
  };
  return maxAge;
}
var max = {};
var lruQueue;
var hasRequiredLruQueue;
function requireLruQueue() {
  if (hasRequiredLruQueue) return lruQueue;
  hasRequiredLruQueue = 1;
  var toPosInt2 = toPosInteger, create2 = Object.create, hasOwnProperty2 = Object.prototype.hasOwnProperty;
  lruQueue = function(limit) {
    var size = 0, base = 1, queue2 = create2(null), map2 = create2(null), index = 0, del;
    limit = toPosInt2(limit);
    return {
      hit: function(id) {
        var oldIndex = map2[id], nuIndex = ++index;
        queue2[nuIndex] = id;
        map2[id] = nuIndex;
        if (!oldIndex) {
          ++size;
          if (size <= limit) return;
          id = queue2[base];
          del(id);
          return id;
        }
        delete queue2[oldIndex];
        if (base !== oldIndex) return;
        while (!hasOwnProperty2.call(queue2, ++base)) continue;
      },
      delete: del = function(id) {
        var oldIndex = map2[id];
        if (!oldIndex) return;
        delete queue2[oldIndex];
        delete map2[id];
        --size;
        if (base !== oldIndex) return;
        if (!size) {
          index = 0;
          base = 1;
          return;
        }
        while (!hasOwnProperty2.call(queue2, ++base)) continue;
      },
      clear: function() {
        size = 0;
        base = 1;
        queue2 = create2(null);
        map2 = create2(null);
        index = 0;
      }
    };
  };
  return lruQueue;
}
var hasRequiredMax;
function requireMax() {
  if (hasRequiredMax) return max;
  hasRequiredMax = 1;
  var toPosInteger$1 = toPosInteger, lruQueue2 = requireLruQueue(), extensions2 = registeredExtensions;
  extensions2.max = function(max2, conf, options) {
    var postfix, queue2, hit;
    max2 = toPosInteger$1(max2);
    if (!max2) return;
    queue2 = lruQueue2(max2);
    postfix = options.async && extensions2.async || options.promise && extensions2.promise ? "async" : "";
    conf.on(
      "set" + postfix,
      hit = function(id) {
        id = queue2.hit(id);
        if (id === void 0) return;
        conf.delete(id);
      }
    );
    conf.on("get" + postfix, hit);
    conf.on("delete" + postfix, queue2.delete);
    conf.on("clear" + postfix, queue2.clear);
  };
  return max;
}
var refCounter = {};
var hasRequiredRefCounter;
function requireRefCounter() {
  if (hasRequiredRefCounter) return refCounter;
  hasRequiredRefCounter = 1;
  var d2 = dExports, extensions2 = registeredExtensions, create2 = Object.create, defineProperties2 = Object.defineProperties;
  extensions2.refCounter = function(ignore, conf, options) {
    var cache, postfix;
    cache = create2(null);
    postfix = options.async && extensions2.async || options.promise && extensions2.promise ? "async" : "";
    conf.on("set" + postfix, function(id, length) {
      cache[id] = length || 1;
    });
    conf.on("get" + postfix, function(id) {
      ++cache[id];
    });
    conf.on("delete" + postfix, function(id) {
      delete cache[id];
    });
    conf.on("clear" + postfix, function() {
      cache = {};
    });
    defineProperties2(conf.memoized, {
      deleteRef: d2(function() {
        var id = conf.get(arguments);
        if (id === null) return null;
        if (!cache[id]) return null;
        if (!--cache[id]) {
          conf.delete(id);
          return true;
        }
        return false;
      }),
      getRefCount: d2(function() {
        var id = conf.get(arguments);
        if (id === null) return 0;
        if (!cache[id]) return 0;
        return cache[id];
      })
    });
  };
  return refCounter;
}
var normalizeOpts = normalizeOptions, resolveLength = resolveLength$2, plain = plain$1;
var memoizee = function(fn) {
  var options = normalizeOpts(arguments[1]), length;
  if (!options.normalizer) {
    length = options.length = resolveLength(options.length, fn.length, options.async);
    if (length !== 0) {
      if (options.primitive) {
        if (length === false) {
          options.normalizer = requirePrimitive();
        } else if (length > 1) {
          options.normalizer = requireGetPrimitiveFixed()(length);
        }
      } else if (length === false) options.normalizer = requireGet()();
      else if (length === 1) options.normalizer = requireGet1()();
      else options.normalizer = requireGetFixed()(length);
    }
  }
  if (options.async) requireAsync();
  if (options.promise) requirePromise();
  if (options.dispose) requireDispose();
  if (options.maxAge) requireMaxAge();
  if (options.max) requireMax();
  if (options.refCounter) requireRefCounter();
  return plain(fn, options);
};
const memoize = /* @__PURE__ */ getDefaultExportFromCjs$1(memoizee);
const IPLoopbackRegex = /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/;
function getApiBaseUrl() {
  const currentUrl = window.location.href;
  const urlObject = new URL(currentUrl);
  if (urlObject.hostname === "localhost" || urlObject.hostname.match(IPLoopbackRegex)) {
    return false;
  }
  if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(urlObject.hostname)) {
    return `${urlObject.protocol}//${urlObject.hostname}`;
  }
  const hostParts = urlObject.hostname.split(".");
  if (hostParts.length > 2) {
    const left = hostParts.length - 1;
    const rootDomain = hostParts.slice(-left).join(".");
    return `${urlObject.protocol}//${rootDomain}`;
  }
  return `${urlObject.protocol}//${urlObject.hostname}`;
}
const _fetchPortalMeta = memoize(
  async function(portalUrl) {
    const endpoint = "/api/meta";
    const baseUrl = getApiBaseUrl();
    let fullEndpoint = "";
    if (baseUrl) {
      fullEndpoint = `${baseUrl}${endpoint}`;
    }
    if (portalUrl) {
      fullEndpoint = `${portalUrl}${endpoint}`;
      if (!fullEndpoint.startsWith("http")) {
        fullEndpoint = `https://${fullEndpoint}`;
      }
    } else {
      if (!baseUrl) {
        throw new Error("Could not detect portal API endpoint");
      }
    }
    try {
      const response = await fetch(fullEndpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!data.domain) {
        throw new Error("Response does not contain required 'domain' property");
      }
      return data;
    } catch (error) {
      console.error("Failed to fetch portal url:", error);
      throw error;
    }
  },
  { promise: true }
);
function fetchPortalMeta(portalUrl) {
  return _fetchPortalMeta(portalUrl);
}
const __vite_import_meta_env__$2 = { "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SSR": false };
const createStoreImpl = (createState) => {
  let state;
  const listeners = /* @__PURE__ */ new Set();
  const setState = (partial, replace) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, previousState));
    }
  };
  const getState = () => state;
  const getInitialState = () => initialState;
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const destroy = () => {
    if ((__vite_import_meta_env__$2 ? "production" : void 0) !== "production") {
      console.warn(
        "[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."
      );
    }
    listeners.clear();
  };
  const api = { setState, getState, getInitialState, subscribe, destroy };
  const initialState = state = createState(setState, getState, api);
  return api;
};
const createStore = (createState) => createState ? createStoreImpl(createState) : createStoreImpl;
var withSelector = { exports: {} };
var withSelector_production_min = {};
var shim = { exports: {} };
var useSyncExternalStoreShim_production_min = {};
/**
 * @license React
 * use-sync-external-store-shim.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var e = reactExports;
function h$1(a, b) {
  return a === b && (0 !== a || 1 / a === 1 / b) || a !== a && b !== b;
}
var k = "function" === typeof Object.is ? Object.is : h$1, l = e.useState, m = e.useEffect, n$1 = e.useLayoutEffect, p$1 = e.useDebugValue;
function q$1(a, b) {
  var d2 = b(), f = l({ inst: { value: d2, getSnapshot: b } }), c = f[0].inst, g = f[1];
  n$1(function() {
    c.value = d2;
    c.getSnapshot = b;
    r$1(c) && g({ inst: c });
  }, [a, d2, b]);
  m(function() {
    r$1(c) && g({ inst: c });
    return a(function() {
      r$1(c) && g({ inst: c });
    });
  }, [a]);
  p$1(d2);
  return d2;
}
function r$1(a) {
  var b = a.getSnapshot;
  a = a.value;
  try {
    var d2 = b();
    return !k(a, d2);
  } catch (f) {
    return true;
  }
}
function t$1(a, b) {
  return b();
}
var u$1 = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? t$1 : q$1;
useSyncExternalStoreShim_production_min.useSyncExternalStore = void 0 !== e.useSyncExternalStore ? e.useSyncExternalStore : u$1;
{
  shim.exports = useSyncExternalStoreShim_production_min;
}
var shimExports = shim.exports;
/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var h = reactExports, n = shimExports;
function p(a, b) {
  return a === b && (0 !== a || 1 / a === 1 / b) || a !== a && b !== b;
}
var q = "function" === typeof Object.is ? Object.is : p, r = n.useSyncExternalStore, t = h.useRef, u = h.useEffect, v = h.useMemo, w = h.useDebugValue;
withSelector_production_min.useSyncExternalStoreWithSelector = function(a, b, e2, l2, g) {
  var c = t(null);
  if (null === c.current) {
    var f = { hasValue: false, value: null };
    c.current = f;
  } else f = c.current;
  c = v(function() {
    function a2(a3) {
      if (!c2) {
        c2 = true;
        d3 = a3;
        a3 = l2(a3);
        if (void 0 !== g && f.hasValue) {
          var b2 = f.value;
          if (g(b2, a3)) return k2 = b2;
        }
        return k2 = a3;
      }
      b2 = k2;
      if (q(d3, a3)) return b2;
      var e3 = l2(a3);
      if (void 0 !== g && g(b2, e3)) return b2;
      d3 = a3;
      return k2 = e3;
    }
    var c2 = false, d3, k2, m2 = void 0 === e2 ? null : e2;
    return [function() {
      return a2(b());
    }, null === m2 ? void 0 : function() {
      return a2(m2());
    }];
  }, [b, e2, l2, g]);
  var d2 = r(a, c[0], c[1]);
  u(function() {
    f.hasValue = true;
    f.value = d2;
  }, [d2]);
  w(d2);
  return d2;
};
{
  withSelector.exports = withSelector_production_min;
}
var withSelectorExports = withSelector.exports;
const useSyncExternalStoreExports = /* @__PURE__ */ getDefaultExportFromCjs$1(withSelectorExports);
const __vite_import_meta_env__$1 = { "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SSR": false };
const { useDebugValue } = React;
const { useSyncExternalStoreWithSelector } = useSyncExternalStoreExports;
let didWarnAboutEqualityFn = false;
const identity = (arg) => arg;
function useStore(api, selector = identity, equalityFn) {
  if ((__vite_import_meta_env__$1 ? "production" : void 0) !== "production" && equalityFn && !didWarnAboutEqualityFn) {
    console.warn(
      "[DEPRECATED] Use `createWithEqualityFn` instead of `create` or use `useStoreWithEqualityFn` instead of `useStore`. They can be imported from 'zustand/traditional'. https://github.com/pmndrs/zustand/discussions/1937"
    );
    didWarnAboutEqualityFn = true;
  }
  const slice2 = useSyncExternalStoreWithSelector(
    api.subscribe,
    api.getState,
    api.getServerState || api.getInitialState,
    selector,
    equalityFn
  );
  useDebugValue(slice2);
  return slice2;
}
var define_process_env_default = {};
function createEnv(opts) {
  const runtimeEnv = opts.runtimeEnvStrict ?? opts.runtimeEnv ?? define_process_env_default;
  {
    for (const [key, value2] of Object.entries(runtimeEnv)) {
      if (value2 === "") {
        delete runtimeEnv[key];
      }
    }
  }
  const skip = !!opts.skipValidation;
  if (skip) return runtimeEnv;
  const _client = typeof opts.client === "object" ? opts.client : {};
  const _server = typeof opts.server === "object" ? opts.server : {};
  const _shared = typeof opts.shared === "object" ? opts.shared : {};
  const client = z.object(_client);
  const server = z.object(_server);
  const shared = z.object(_shared);
  const isServer = opts.isServer ?? typeof window === "undefined";
  const allClient = client.merge(shared);
  const allServer = server.merge(shared).merge(client);
  const parsed = isServer ? allServer.safeParse(runtimeEnv) : allClient.safeParse(runtimeEnv);
  const onValidationError = opts.onValidationError ?? ((error) => {
    console.error("❌ Invalid environment variables:", error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  });
  const onInvalidAccess = opts.onInvalidAccess ?? ((_variable) => {
    throw new Error("❌ Attempted to access a server-side environment variable on the client");
  });
  if (parsed.success === false) {
    return onValidationError(parsed.error);
  }
  const isServerAccess = (prop) => {
    if (!opts.clientPrefix) return true;
    return !prop.startsWith(opts.clientPrefix) && !(prop in shared.shape);
  };
  const isValidServerAccess = (prop) => {
    return isServer || !isServerAccess(prop);
  };
  const ignoreProp = (prop) => {
    return prop === "__esModule" || prop === "$$typeof";
  };
  const extendedObj = (opts.extends ?? []).reduce((acc, curr) => {
    return Object.assign(acc, curr);
  }, {});
  const fullObj = Object.assign(parsed.data, extendedObj);
  const env2 = new Proxy(fullObj, {
    get(target, prop) {
      if (typeof prop !== "string") return void 0;
      if (ignoreProp(prop)) return void 0;
      if (!isValidServerAccess(prop)) return onInvalidAccess(prop);
      return Reflect.get(target, prop);
    }
  });
  return env2;
}
const __vite_import_meta_env__ = { "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SSR": false };
const env = createEnv({
  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: "VITE_",
  client: {
    VITE_PORTAL_DOMAIN: z.string().includes(".").optional()
  },
  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: __vite_import_meta_env__,
  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true
});
const baseStore = createStore((set, get2) => ({
  sdk: void 0,
  meta: void 0,
  setMeta: (meta) => set({ meta }),
  theme: "theme-eclipse",
  menuItems: [],
  setSdk: (sdk) => set({ sdk }),
  portalUrl: env.VITE_PORTAL_DOMAIN,
  setPortalUrl: (portalUrl) => set({ portalUrl }),
  setTheme: (theme) => set({ theme }),
  addMenuItem: (newItem, parentKey) => set((state) => {
    if (!parentKey) {
      if (!state.menuItems.some((item) => item.key === newItem.key)) {
        return { menuItems: [...state.menuItems, newItem] };
      }
      return state;
    }
    const updatedMenuItems = findAndModifyMenuItem(
      state.menuItems,
      parentKey,
      (item) => {
        var _a;
        if (!((_a = item.children) == null ? void 0 : _a.some((child) => child.key === newItem.key))) {
          return {
            ...item,
            children: [...item.children || [], newItem]
          };
        }
        return item;
      }
    );
    return { menuItems: updatedMenuItems };
  }),
  removeMenuItem: (key) => set((state) => {
    const removeItem = (items) => items.filter((item) => {
      if (item.key === key) return false;
      if (item.children) {
        item.children = removeItem(item.children);
      }
      return true;
    });
    return { menuItems: removeItem(state.menuItems) };
  }),
  getMenuItems: () => get2().menuItems
}));
const useBaseStore = (selector) => useStore(baseStore, selector);
function findAndModifyMenuItem(items, key, modifier) {
  return items.map((item) => {
    if (item.key === key) {
      return modifier(item);
    }
    if (item.children) {
      return {
        ...item,
        children: findAndModifyMenuItem(item.children, key, modifier)
      };
    }
    return item;
  });
}
function usePortalUrl() {
  let portalUrl = useBaseStore((state) => state.portalUrl);
  const setPortalUrl = useBaseStore((state) => state.setPortalUrl);
  reactExports.useEffect(() => {
    fetchPortalMeta(portalUrl).then((data) => {
      if (!portalUrl) {
        setPortalUrl(`https://${data.domain}`);
      }
    });
  }, []);
  if (portalUrl && !(portalUrl == null ? void 0 : portalUrl.startsWith("http"))) {
    portalUrl = `https://${portalUrl}`;
  }
  return portalUrl;
}
export {
  useStore as a,
  baseStore as b,
  createStore as c,
  usePortalUrl as d,
  fetchPortalMeta as f,
  process$1 as p,
  useBaseStore as u
};
