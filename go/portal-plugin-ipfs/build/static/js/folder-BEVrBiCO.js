import { core_ipfs__mf_v__runtimeInit__mf_v__, index_cjs } from './core_ipfs__mf_v__runtimeInit__mf_v__-CAc0Zb6r.js';

// dev uses dynamic import to separate chunks
    
    const {loadShare: loadShare$1} = index_cjs;
    const {initPromise: initPromise$1} = core_ipfs__mf_v__runtimeInit__mf_v__;
    const res$1 = initPromise$1.then(_ => loadShare$1("@lumeweb/portal-framework-core", {
    customShareInfo: {shareConfig:{
      singleton: true,
      strictVersion: false,
      requiredVersion: "^0.0.0"
    }}}));
    const exportModule$1 = await res$1.then(factory => factory());
    var core_ipfs__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__ = exportModule$1;

var jsxRuntime = {exports: {}};

var reactJsxRuntime_production_min = {};

// dev uses dynamic import to separate chunks
    
    const {loadShare} = index_cjs;
    const {initPromise} = core_ipfs__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(_ => loadShare("react", {
    customShareInfo: {shareConfig:{
      singleton: true,
      strictVersion: false,
      requiredVersion: "^18.3.1"
    }}}));
    const exportModule = await res.then(factory => factory());
    var core_ipfs__loadShare__react__loadShare__ = exportModule;

/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactJsxRuntime_production_min;

function requireReactJsxRuntime_production_min () {
	if (hasRequiredReactJsxRuntime_production_min) return reactJsxRuntime_production_min;
	hasRequiredReactJsxRuntime_production_min = 1;
var f=core_ipfs__loadShare__react__loadShare__,k=Symbol.for("react.element"),l=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,n=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:true,ref:true,__self:true,__source:true};
	function q(c,a,g){var b,d={},e=null,h=null;void 0!==g&&(e=""+g);void 0!==a.key&&(e=""+a.key);void 0!==a.ref&&(h=a.ref);for(b in a)m.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps,a) void 0===d[b]&&(d[b]=a[b]);return {$$typeof:k,type:c,key:e,ref:h,props:d,_owner:n.current}}reactJsxRuntime_production_min.Fragment=l;reactJsxRuntime_production_min.jsx=q;reactJsxRuntime_production_min.jsxs=q;
	return reactJsxRuntime_production_min;
}

var reactJsxRuntime_development = {};

var hasRequiredReactJsxRuntime_development;

function requireReactJsxRuntime_development () {
	if (hasRequiredReactJsxRuntime_development) return reactJsxRuntime_development;
	hasRequiredReactJsxRuntime_development = 1;
	var define_process_env_default = {};
	/**
	 * @license React
	 * react-jsx-runtime.development.js
	 *
	 * Copyright (c) Facebook, Inc. and its affiliates.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */
	if (define_process_env_default.NODE_ENV !== "production") {
	  (function() {
	    var React = core_ipfs__loadShare__react__loadShare__;
	    var REACT_ELEMENT_TYPE = Symbol.for("react.element");
	    var REACT_PORTAL_TYPE = Symbol.for("react.portal");
	    var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	    var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
	    var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
	    var REACT_PROVIDER_TYPE = Symbol.for("react.provider");
	    var REACT_CONTEXT_TYPE = Symbol.for("react.context");
	    var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
	    var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
	    var REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
	    var REACT_MEMO_TYPE = Symbol.for("react.memo");
	    var REACT_LAZY_TYPE = Symbol.for("react.lazy");
	    var REACT_OFFSCREEN_TYPE = Symbol.for("react.offscreen");
	    var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
	    var FAUX_ITERATOR_SYMBOL = "@@iterator";
	    function getIteratorFn(maybeIterable) {
	      if (maybeIterable === null || typeof maybeIterable !== "object") {
	        return null;
	      }
	      var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
	      if (typeof maybeIterator === "function") {
	        return maybeIterator;
	      }
	      return null;
	    }
	    var ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
	    function error(format) {
	      {
	        {
	          for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
	            args[_key2 - 1] = arguments[_key2];
	          }
	          printWarning("error", format, args);
	        }
	      }
	    }
	    function printWarning(level, format, args) {
	      {
	        var ReactDebugCurrentFrame2 = ReactSharedInternals.ReactDebugCurrentFrame;
	        var stack = ReactDebugCurrentFrame2.getStackAddendum();
	        if (stack !== "") {
	          format += "%s";
	          args = args.concat([stack]);
	        }
	        var argsWithFormat = args.map(function(item) {
	          return String(item);
	        });
	        argsWithFormat.unshift("Warning: " + format);
	        Function.prototype.apply.call(console[level], console, argsWithFormat);
	      }
	    }
	    var enableScopeAPI = false;
	    var enableCacheElement = false;
	    var enableTransitionTracing = false;
	    var enableLegacyHidden = false;
	    var enableDebugTracing = false;
	    var REACT_MODULE_REFERENCE;
	    {
	      REACT_MODULE_REFERENCE = Symbol.for("react.module.reference");
	    }
	    function isValidElementType(type) {
	      if (typeof type === "string" || typeof type === "function") {
	        return true;
	      }
	      if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden || type === REACT_OFFSCREEN_TYPE || enableScopeAPI || enableCacheElement || enableTransitionTracing) {
	        return true;
	      }
	      if (typeof type === "object" && type !== null) {
	        if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
	        // types supported by any Flight configuration anywhere since
	        // we don't know which Flight build this will end up being used
	        // with.
	        type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== void 0) {
	          return true;
	        }
	      }
	      return false;
	    }
	    function getWrappedName(outerType, innerType, wrapperName) {
	      var displayName = outerType.displayName;
	      if (displayName) {
	        return displayName;
	      }
	      var functionName = innerType.displayName || innerType.name || "";
	      return functionName !== "" ? wrapperName + "(" + functionName + ")" : wrapperName;
	    }
	    function getContextName(type) {
	      return type.displayName || "Context";
	    }
	    function getComponentNameFromType(type) {
	      if (type == null) {
	        return null;
	      }
	      {
	        if (typeof type.tag === "number") {
	          error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue.");
	        }
	      }
	      if (typeof type === "function") {
	        return type.displayName || type.name || null;
	      }
	      if (typeof type === "string") {
	        return type;
	      }
	      switch (type) {
	        case REACT_FRAGMENT_TYPE:
	          return "Fragment";
	        case REACT_PORTAL_TYPE:
	          return "Portal";
	        case REACT_PROFILER_TYPE:
	          return "Profiler";
	        case REACT_STRICT_MODE_TYPE:
	          return "StrictMode";
	        case REACT_SUSPENSE_TYPE:
	          return "Suspense";
	        case REACT_SUSPENSE_LIST_TYPE:
	          return "SuspenseList";
	      }
	      if (typeof type === "object") {
	        switch (type.$$typeof) {
	          case REACT_CONTEXT_TYPE:
	            var context = type;
	            return getContextName(context) + ".Consumer";
	          case REACT_PROVIDER_TYPE:
	            var provider = type;
	            return getContextName(provider._context) + ".Provider";
	          case REACT_FORWARD_REF_TYPE:
	            return getWrappedName(type, type.render, "ForwardRef");
	          case REACT_MEMO_TYPE:
	            var outerName = type.displayName || null;
	            if (outerName !== null) {
	              return outerName;
	            }
	            return getComponentNameFromType(type.type) || "Memo";
	          case REACT_LAZY_TYPE: {
	            var lazyComponent = type;
	            var payload = lazyComponent._payload;
	            var init = lazyComponent._init;
	            try {
	              return getComponentNameFromType(init(payload));
	            } catch (x) {
	              return null;
	            }
	          }
	        }
	      }
	      return null;
	    }
	    var assign = Object.assign;
	    var disabledDepth = 0;
	    var prevLog;
	    var prevInfo;
	    var prevWarn;
	    var prevError;
	    var prevGroup;
	    var prevGroupCollapsed;
	    var prevGroupEnd;
	    function disabledLog() {
	    }
	    disabledLog.__reactDisabledLog = true;
	    function disableLogs() {
	      {
	        if (disabledDepth === 0) {
	          prevLog = console.log;
	          prevInfo = console.info;
	          prevWarn = console.warn;
	          prevError = console.error;
	          prevGroup = console.group;
	          prevGroupCollapsed = console.groupCollapsed;
	          prevGroupEnd = console.groupEnd;
	          var props = {
	            configurable: true,
	            enumerable: true,
	            value: disabledLog,
	            writable: true
	          };
	          Object.defineProperties(console, {
	            info: props,
	            log: props,
	            warn: props,
	            error: props,
	            group: props,
	            groupCollapsed: props,
	            groupEnd: props
	          });
	        }
	        disabledDepth++;
	      }
	    }
	    function reenableLogs() {
	      {
	        disabledDepth--;
	        if (disabledDepth === 0) {
	          var props = {
	            configurable: true,
	            enumerable: true,
	            writable: true
	          };
	          Object.defineProperties(console, {
	            log: assign({}, props, {
	              value: prevLog
	            }),
	            info: assign({}, props, {
	              value: prevInfo
	            }),
	            warn: assign({}, props, {
	              value: prevWarn
	            }),
	            error: assign({}, props, {
	              value: prevError
	            }),
	            group: assign({}, props, {
	              value: prevGroup
	            }),
	            groupCollapsed: assign({}, props, {
	              value: prevGroupCollapsed
	            }),
	            groupEnd: assign({}, props, {
	              value: prevGroupEnd
	            })
	          });
	        }
	        if (disabledDepth < 0) {
	          error("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
	        }
	      }
	    }
	    var ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher;
	    var prefix;
	    function describeBuiltInComponentFrame(name, source, ownerFn) {
	      {
	        if (prefix === void 0) {
	          try {
	            throw Error();
	          } catch (x) {
	            var match = x.stack.trim().match(/\n( *(at )?)/);
	            prefix = match && match[1] || "";
	          }
	        }
	        return "\n" + prefix + name;
	      }
	    }
	    var reentry = false;
	    var componentFrameCache;
	    {
	      var PossiblyWeakMap = typeof WeakMap === "function" ? WeakMap : Map;
	      componentFrameCache = new PossiblyWeakMap();
	    }
	    function describeNativeComponentFrame(fn, construct) {
	      if (!fn || reentry) {
	        return "";
	      }
	      {
	        var frame = componentFrameCache.get(fn);
	        if (frame !== void 0) {
	          return frame;
	        }
	      }
	      var control;
	      reentry = true;
	      var previousPrepareStackTrace = Error.prepareStackTrace;
	      Error.prepareStackTrace = void 0;
	      var previousDispatcher;
	      {
	        previousDispatcher = ReactCurrentDispatcher.current;
	        ReactCurrentDispatcher.current = null;
	        disableLogs();
	      }
	      try {
	        if (construct) {
	          var Fake = function() {
	            throw Error();
	          };
	          Object.defineProperty(Fake.prototype, "props", {
	            set: function() {
	              throw Error();
	            }
	          });
	          if (typeof Reflect === "object" && Reflect.construct) {
	            try {
	              Reflect.construct(Fake, []);
	            } catch (x) {
	              control = x;
	            }
	            Reflect.construct(fn, [], Fake);
	          } else {
	            try {
	              Fake.call();
	            } catch (x) {
	              control = x;
	            }
	            fn.call(Fake.prototype);
	          }
	        } else {
	          try {
	            throw Error();
	          } catch (x) {
	            control = x;
	          }
	          fn();
	        }
	      } catch (sample) {
	        if (sample && control && typeof sample.stack === "string") {
	          var sampleLines = sample.stack.split("\n");
	          var controlLines = control.stack.split("\n");
	          var s = sampleLines.length - 1;
	          var c = controlLines.length - 1;
	          while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
	            c--;
	          }
	          for (; s >= 1 && c >= 0; s--, c--) {
	            if (sampleLines[s] !== controlLines[c]) {
	              if (s !== 1 || c !== 1) {
	                do {
	                  s--;
	                  c--;
	                  if (c < 0 || sampleLines[s] !== controlLines[c]) {
	                    var _frame = "\n" + sampleLines[s].replace(" at new ", " at ");
	                    if (fn.displayName && _frame.includes("<anonymous>")) {
	                      _frame = _frame.replace("<anonymous>", fn.displayName);
	                    }
	                    {
	                      if (typeof fn === "function") {
	                        componentFrameCache.set(fn, _frame);
	                      }
	                    }
	                    return _frame;
	                  }
	                } while (s >= 1 && c >= 0);
	              }
	              break;
	            }
	          }
	        }
	      } finally {
	        reentry = false;
	        {
	          ReactCurrentDispatcher.current = previousDispatcher;
	          reenableLogs();
	        }
	        Error.prepareStackTrace = previousPrepareStackTrace;
	      }
	      var name = fn ? fn.displayName || fn.name : "";
	      var syntheticFrame = name ? describeBuiltInComponentFrame(name) : "";
	      {
	        if (typeof fn === "function") {
	          componentFrameCache.set(fn, syntheticFrame);
	        }
	      }
	      return syntheticFrame;
	    }
	    function describeFunctionComponentFrame(fn, source, ownerFn) {
	      {
	        return describeNativeComponentFrame(fn, false);
	      }
	    }
	    function shouldConstruct(Component) {
	      var prototype = Component.prototype;
	      return !!(prototype && prototype.isReactComponent);
	    }
	    function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {
	      if (type == null) {
	        return "";
	      }
	      if (typeof type === "function") {
	        {
	          return describeNativeComponentFrame(type, shouldConstruct(type));
	        }
	      }
	      if (typeof type === "string") {
	        return describeBuiltInComponentFrame(type);
	      }
	      switch (type) {
	        case REACT_SUSPENSE_TYPE:
	          return describeBuiltInComponentFrame("Suspense");
	        case REACT_SUSPENSE_LIST_TYPE:
	          return describeBuiltInComponentFrame("SuspenseList");
	      }
	      if (typeof type === "object") {
	        switch (type.$$typeof) {
	          case REACT_FORWARD_REF_TYPE:
	            return describeFunctionComponentFrame(type.render);
	          case REACT_MEMO_TYPE:
	            return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);
	          case REACT_LAZY_TYPE: {
	            var lazyComponent = type;
	            var payload = lazyComponent._payload;
	            var init = lazyComponent._init;
	            try {
	              return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
	            } catch (x) {
	            }
	          }
	        }
	      }
	      return "";
	    }
	    var hasOwnProperty = Object.prototype.hasOwnProperty;
	    var loggedTypeFailures = {};
	    var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
	    function setCurrentlyValidatingElement(element) {
	      {
	        if (element) {
	          var owner = element._owner;
	          var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
	          ReactDebugCurrentFrame.setExtraStackFrame(stack);
	        } else {
	          ReactDebugCurrentFrame.setExtraStackFrame(null);
	        }
	      }
	    }
	    function checkPropTypes(typeSpecs, values, location, componentName, element) {
	      {
	        var has = Function.call.bind(hasOwnProperty);
	        for (var typeSpecName in typeSpecs) {
	          if (has(typeSpecs, typeSpecName)) {
	            var error$1 = void 0;
	            try {
	              if (typeof typeSpecs[typeSpecName] !== "function") {
	                var err = Error((componentName || "React class") + ": " + location + " type `" + typeSpecName + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof typeSpecs[typeSpecName] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
	                err.name = "Invariant Violation";
	                throw err;
	              }
	              error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
	            } catch (ex) {
	              error$1 = ex;
	            }
	            if (error$1 && !(error$1 instanceof Error)) {
	              setCurrentlyValidatingElement(element);
	              error("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", componentName || "React class", location, typeSpecName, typeof error$1);
	              setCurrentlyValidatingElement(null);
	            }
	            if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
	              loggedTypeFailures[error$1.message] = true;
	              setCurrentlyValidatingElement(element);
	              error("Failed %s type: %s", location, error$1.message);
	              setCurrentlyValidatingElement(null);
	            }
	          }
	        }
	      }
	    }
	    var isArrayImpl = Array.isArray;
	    function isArray(a) {
	      return isArrayImpl(a);
	    }
	    function typeName(value) {
	      {
	        var hasToStringTag = typeof Symbol === "function" && Symbol.toStringTag;
	        var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
	        return type;
	      }
	    }
	    function willCoercionThrow(value) {
	      {
	        try {
	          testStringCoercion(value);
	          return false;
	        } catch (e) {
	          return true;
	        }
	      }
	    }
	    function testStringCoercion(value) {
	      return "" + value;
	    }
	    function checkKeyStringCoercion(value) {
	      {
	        if (willCoercionThrow(value)) {
	          error("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", typeName(value));
	          return testStringCoercion(value);
	        }
	      }
	    }
	    var ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;
	    var RESERVED_PROPS = {
	      key: true,
	      ref: true,
	      __self: true,
	      __source: true
	    };
	    var specialPropKeyWarningShown;
	    var specialPropRefWarningShown;
	    function hasValidRef(config) {
	      {
	        if (hasOwnProperty.call(config, "ref")) {
	          var getter = Object.getOwnPropertyDescriptor(config, "ref").get;
	          if (getter && getter.isReactWarning) {
	            return false;
	          }
	        }
	      }
	      return config.ref !== void 0;
	    }
	    function hasValidKey(config) {
	      {
	        if (hasOwnProperty.call(config, "key")) {
	          var getter = Object.getOwnPropertyDescriptor(config, "key").get;
	          if (getter && getter.isReactWarning) {
	            return false;
	          }
	        }
	      }
	      return config.key !== void 0;
	    }
	    function warnIfStringRefCannotBeAutoConverted(config, self) {
	      {
	        if (typeof config.ref === "string" && ReactCurrentOwner.current && self) ;
	      }
	    }
	    function defineKeyPropWarningGetter(props, displayName) {
	      {
	        var warnAboutAccessingKey = function() {
	          if (!specialPropKeyWarningShown) {
	            specialPropKeyWarningShown = true;
	            error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
	          }
	        };
	        warnAboutAccessingKey.isReactWarning = true;
	        Object.defineProperty(props, "key", {
	          get: warnAboutAccessingKey,
	          configurable: true
	        });
	      }
	    }
	    function defineRefPropWarningGetter(props, displayName) {
	      {
	        var warnAboutAccessingRef = function() {
	          if (!specialPropRefWarningShown) {
	            specialPropRefWarningShown = true;
	            error("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
	          }
	        };
	        warnAboutAccessingRef.isReactWarning = true;
	        Object.defineProperty(props, "ref", {
	          get: warnAboutAccessingRef,
	          configurable: true
	        });
	      }
	    }
	    var ReactElement = function(type, key, ref, self, source, owner, props) {
	      var element = {
	        // This tag allows us to uniquely identify this as a React Element
	        $$typeof: REACT_ELEMENT_TYPE,
	        // Built-in properties that belong on the element
	        type,
	        key,
	        ref,
	        props,
	        // Record the component responsible for creating this element.
	        _owner: owner
	      };
	      {
	        element._store = {};
	        Object.defineProperty(element._store, "validated", {
	          configurable: false,
	          enumerable: false,
	          writable: true,
	          value: false
	        });
	        Object.defineProperty(element, "_self", {
	          configurable: false,
	          enumerable: false,
	          writable: false,
	          value: self
	        });
	        Object.defineProperty(element, "_source", {
	          configurable: false,
	          enumerable: false,
	          writable: false,
	          value: source
	        });
	        if (Object.freeze) {
	          Object.freeze(element.props);
	          Object.freeze(element);
	        }
	      }
	      return element;
	    };
	    function jsxDEV(type, config, maybeKey, source, self) {
	      {
	        var propName;
	        var props = {};
	        var key = null;
	        var ref = null;
	        if (maybeKey !== void 0) {
	          {
	            checkKeyStringCoercion(maybeKey);
	          }
	          key = "" + maybeKey;
	        }
	        if (hasValidKey(config)) {
	          {
	            checkKeyStringCoercion(config.key);
	          }
	          key = "" + config.key;
	        }
	        if (hasValidRef(config)) {
	          ref = config.ref;
	          warnIfStringRefCannotBeAutoConverted(config, self);
	        }
	        for (propName in config) {
	          if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
	            props[propName] = config[propName];
	          }
	        }
	        if (type && type.defaultProps) {
	          var defaultProps = type.defaultProps;
	          for (propName in defaultProps) {
	            if (props[propName] === void 0) {
	              props[propName] = defaultProps[propName];
	            }
	          }
	        }
	        if (key || ref) {
	          var displayName = typeof type === "function" ? type.displayName || type.name || "Unknown" : type;
	          if (key) {
	            defineKeyPropWarningGetter(props, displayName);
	          }
	          if (ref) {
	            defineRefPropWarningGetter(props, displayName);
	          }
	        }
	        return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
	      }
	    }
	    var ReactCurrentOwner$1 = ReactSharedInternals.ReactCurrentOwner;
	    var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;
	    function setCurrentlyValidatingElement$1(element) {
	      {
	        if (element) {
	          var owner = element._owner;
	          var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
	          ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
	        } else {
	          ReactDebugCurrentFrame$1.setExtraStackFrame(null);
	        }
	      }
	    }
	    var propTypesMisspellWarningShown;
	    {
	      propTypesMisspellWarningShown = false;
	    }
	    function isValidElement(object) {
	      {
	        return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
	      }
	    }
	    function getDeclarationErrorAddendum() {
	      {
	        if (ReactCurrentOwner$1.current) {
	          var name = getComponentNameFromType(ReactCurrentOwner$1.current.type);
	          if (name) {
	            return "\n\nCheck the render method of `" + name + "`.";
	          }
	        }
	        return "";
	      }
	    }
	    function getSourceInfoErrorAddendum(source) {
	      {
	        return "";
	      }
	    }
	    var ownerHasKeyUseWarning = {};
	    function getCurrentComponentErrorInfo(parentType) {
	      {
	        var info = getDeclarationErrorAddendum();
	        if (!info) {
	          var parentName = typeof parentType === "string" ? parentType : parentType.displayName || parentType.name;
	          if (parentName) {
	            info = "\n\nCheck the top-level render call using <" + parentName + ">.";
	          }
	        }
	        return info;
	      }
	    }
	    function validateExplicitKey(element, parentType) {
	      {
	        if (!element._store || element._store.validated || element.key != null) {
	          return;
	        }
	        element._store.validated = true;
	        var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);
	        if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
	          return;
	        }
	        ownerHasKeyUseWarning[currentComponentErrorInfo] = true;
	        var childOwner = "";
	        if (element && element._owner && element._owner !== ReactCurrentOwner$1.current) {
	          childOwner = " It was passed a child from " + getComponentNameFromType(element._owner.type) + ".";
	        }
	        setCurrentlyValidatingElement$1(element);
	        error('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);
	        setCurrentlyValidatingElement$1(null);
	      }
	    }
	    function validateChildKeys(node, parentType) {
	      {
	        if (typeof node !== "object") {
	          return;
	        }
	        if (isArray(node)) {
	          for (var i = 0; i < node.length; i++) {
	            var child = node[i];
	            if (isValidElement(child)) {
	              validateExplicitKey(child, parentType);
	            }
	          }
	        } else if (isValidElement(node)) {
	          if (node._store) {
	            node._store.validated = true;
	          }
	        } else if (node) {
	          var iteratorFn = getIteratorFn(node);
	          if (typeof iteratorFn === "function") {
	            if (iteratorFn !== node.entries) {
	              var iterator = iteratorFn.call(node);
	              var step;
	              while (!(step = iterator.next()).done) {
	                if (isValidElement(step.value)) {
	                  validateExplicitKey(step.value, parentType);
	                }
	              }
	            }
	          }
	        }
	      }
	    }
	    function validatePropTypes(element) {
	      {
	        var type = element.type;
	        if (type === null || type === void 0 || typeof type === "string") {
	          return;
	        }
	        var propTypes;
	        if (typeof type === "function") {
	          propTypes = type.propTypes;
	        } else if (typeof type === "object" && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
	        // Inner props are checked in the reconciler.
	        type.$$typeof === REACT_MEMO_TYPE)) {
	          propTypes = type.propTypes;
	        } else {
	          return;
	        }
	        if (propTypes) {
	          var name = getComponentNameFromType(type);
	          checkPropTypes(propTypes, element.props, "prop", name, element);
	        } else if (type.PropTypes !== void 0 && !propTypesMisspellWarningShown) {
	          propTypesMisspellWarningShown = true;
	          var _name = getComponentNameFromType(type);
	          error("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", _name || "Unknown");
	        }
	        if (typeof type.getDefaultProps === "function" && !type.getDefaultProps.isReactClassApproved) {
	          error("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
	        }
	      }
	    }
	    function validateFragmentProps(fragment) {
	      {
	        var keys = Object.keys(fragment.props);
	        for (var i = 0; i < keys.length; i++) {
	          var key = keys[i];
	          if (key !== "children" && key !== "key") {
	            setCurrentlyValidatingElement$1(fragment);
	            error("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", key);
	            setCurrentlyValidatingElement$1(null);
	            break;
	          }
	        }
	        if (fragment.ref !== null) {
	          setCurrentlyValidatingElement$1(fragment);
	          error("Invalid attribute `ref` supplied to `React.Fragment`.");
	          setCurrentlyValidatingElement$1(null);
	        }
	      }
	    }
	    var didWarnAboutKeySpread = {};
	    function jsxWithValidation(type, props, key, isStaticChildren, source, self) {
	      {
	        var validType = isValidElementType(type);
	        if (!validType) {
	          var info = "";
	          if (type === void 0 || typeof type === "object" && type !== null && Object.keys(type).length === 0) {
	            info += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.";
	          }
	          var sourceInfo = getSourceInfoErrorAddendum();
	          if (sourceInfo) {
	            info += sourceInfo;
	          } else {
	            info += getDeclarationErrorAddendum();
	          }
	          var typeString;
	          if (type === null) {
	            typeString = "null";
	          } else if (isArray(type)) {
	            typeString = "array";
	          } else if (type !== void 0 && type.$$typeof === REACT_ELEMENT_TYPE) {
	            typeString = "<" + (getComponentNameFromType(type.type) || "Unknown") + " />";
	            info = " Did you accidentally export a JSX literal instead of a component?";
	          } else {
	            typeString = typeof type;
	          }
	          error("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", typeString, info);
	        }
	        var element = jsxDEV(type, props, key, source, self);
	        if (element == null) {
	          return element;
	        }
	        if (validType) {
	          var children = props.children;
	          if (children !== void 0) {
	            if (isStaticChildren) {
	              if (isArray(children)) {
	                for (var i = 0; i < children.length; i++) {
	                  validateChildKeys(children[i], type);
	                }
	                if (Object.freeze) {
	                  Object.freeze(children);
	                }
	              } else {
	                error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
	              }
	            } else {
	              validateChildKeys(children, type);
	            }
	          }
	        }
	        {
	          if (hasOwnProperty.call(props, "key")) {
	            var componentName = getComponentNameFromType(type);
	            var keys = Object.keys(props).filter(function(k) {
	              return k !== "key";
	            });
	            var beforeExample = keys.length > 0 ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
	            if (!didWarnAboutKeySpread[componentName + beforeExample]) {
	              var afterExample = keys.length > 0 ? "{" + keys.join(": ..., ") + ": ...}" : "{}";
	              error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', beforeExample, componentName, afterExample, componentName);
	              didWarnAboutKeySpread[componentName + beforeExample] = true;
	            }
	          }
	        }
	        if (type === REACT_FRAGMENT_TYPE) {
	          validateFragmentProps(element);
	        } else {
	          validatePropTypes(element);
	        }
	        return element;
	      }
	    }
	    function jsxWithValidationStatic(type, props, key) {
	      {
	        return jsxWithValidation(type, props, key, true);
	      }
	    }
	    function jsxWithValidationDynamic(type, props, key) {
	      {
	        return jsxWithValidation(type, props, key, false);
	      }
	    }
	    var jsx = jsxWithValidationDynamic;
	    var jsxs = jsxWithValidationStatic;
	    reactJsxRuntime_development.Fragment = REACT_FRAGMENT_TYPE;
	    reactJsxRuntime_development.jsx = jsx;
	    reactJsxRuntime_development.jsxs = jsxs;
	  })();
	}
	return reactJsxRuntime_development;
}

var define_process_env_default = {};
if (define_process_env_default.NODE_ENV === "production") {
  jsxRuntime.exports = requireReactJsxRuntime_production_min();
} else {
  jsxRuntime.exports = requireReactJsxRuntime_development();
}

var jsxRuntimeExports = jsxRuntime.exports;

const empty = new Uint8Array(0);
function fromHex(hex) {
    const hexes = hex.match(/../g);
    return hexes != null ? new Uint8Array(hexes.map(b => parseInt(b, 16))) : empty;
}
function equals$1(aa, bb) {
    if (aa === bb) {
        return true;
    }
    if (aa.byteLength !== bb.byteLength) {
        return false;
    }
    for (let ii = 0; ii < aa.byteLength; ii++) {
        if (aa[ii] !== bb[ii]) {
            return false;
        }
    }
    return true;
}
function coerce(o) {
    if (o instanceof Uint8Array && o.constructor.name === 'Uint8Array') {
        return o;
    }
    if (o instanceof ArrayBuffer) {
        return new Uint8Array(o);
    }
    if (ArrayBuffer.isView(o)) {
        return new Uint8Array(o.buffer, o.byteOffset, o.byteLength);
    }
    throw new Error('Unknown type, must be binary type');
}
function fromString(str) {
    return new TextEncoder().encode(str);
}
function toString(b) {
    return new TextDecoder().decode(b);
}

/* eslint-disable */
// base-x encoding / decoding
// Copyright (c) 2018 base-x contributors
// Copyright (c) 2014-2018 The Bitcoin Core developers (base58.cpp)
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.
/**
 * @param {string} ALPHABET
 * @param {any} name
 */
function base(ALPHABET, name) {
    if (ALPHABET.length >= 255) {
        throw new TypeError('Alphabet too long');
    }
    var BASE_MAP = new Uint8Array(256);
    for (var j = 0; j < BASE_MAP.length; j++) {
        BASE_MAP[j] = 255;
    }
    for (var i = 0; i < ALPHABET.length; i++) {
        var x = ALPHABET.charAt(i);
        var xc = x.charCodeAt(0);
        if (BASE_MAP[xc] !== 255) {
            throw new TypeError(x + ' is ambiguous');
        }
        BASE_MAP[xc] = i;
    }
    var BASE = ALPHABET.length;
    var LEADER = ALPHABET.charAt(0);
    var FACTOR = Math.log(BASE) / Math.log(256); // log(BASE) / log(256), rounded up
    var iFACTOR = Math.log(256) / Math.log(BASE); // log(256) / log(BASE), rounded up
    /**
     * @param {any[] | Iterable<number>} source
     */
    function encode(source) {
        // @ts-ignore
        if (source instanceof Uint8Array)
            ;
        else if (ArrayBuffer.isView(source)) {
            source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
        }
        else if (Array.isArray(source)) {
            source = Uint8Array.from(source);
        }
        if (!(source instanceof Uint8Array)) {
            throw new TypeError('Expected Uint8Array');
        }
        if (source.length === 0) {
            return '';
        }
        // Skip & count leading zeroes.
        var zeroes = 0;
        var length = 0;
        var pbegin = 0;
        var pend = source.length;
        while (pbegin !== pend && source[pbegin] === 0) {
            pbegin++;
            zeroes++;
        }
        // Allocate enough space in big-endian base58 representation.
        var size = ((pend - pbegin) * iFACTOR + 1) >>> 0;
        var b58 = new Uint8Array(size);
        // Process the bytes.
        while (pbegin !== pend) {
            var carry = source[pbegin];
            // Apply "b58 = b58 * 256 + ch".
            var i = 0;
            for (var it1 = size - 1; (carry !== 0 || i < length) && (it1 !== -1); it1--, i++) {
                carry += (256 * b58[it1]) >>> 0;
                b58[it1] = (carry % BASE) >>> 0;
                carry = (carry / BASE) >>> 0;
            }
            if (carry !== 0) {
                throw new Error('Non-zero carry');
            }
            length = i;
            pbegin++;
        }
        // Skip leading zeroes in base58 result.
        var it2 = size - length;
        while (it2 !== size && b58[it2] === 0) {
            it2++;
        }
        // Translate the result into a string.
        var str = LEADER.repeat(zeroes);
        for (; it2 < size; ++it2) {
            str += ALPHABET.charAt(b58[it2]);
        }
        return str;
    }
    /**
     * @param {string | string[]} source
     */
    function decodeUnsafe(source) {
        if (typeof source !== 'string') {
            throw new TypeError('Expected String');
        }
        if (source.length === 0) {
            return new Uint8Array();
        }
        var psz = 0;
        // Skip leading spaces.
        if (source[psz] === ' ') {
            return;
        }
        // Skip and count leading '1's.
        var zeroes = 0;
        var length = 0;
        while (source[psz] === LEADER) {
            zeroes++;
            psz++;
        }
        // Allocate enough space in big-endian base256 representation.
        var size = (((source.length - psz) * FACTOR) + 1) >>> 0; // log(58) / log(256), rounded up.
        var b256 = new Uint8Array(size);
        // Process the characters.
        while (source[psz]) {
            // Decode character
            var carry = BASE_MAP[source.charCodeAt(psz)];
            // Invalid character
            if (carry === 255) {
                return;
            }
            var i = 0;
            for (var it3 = size - 1; (carry !== 0 || i < length) && (it3 !== -1); it3--, i++) {
                carry += (BASE * b256[it3]) >>> 0;
                b256[it3] = (carry % 256) >>> 0;
                carry = (carry / 256) >>> 0;
            }
            if (carry !== 0) {
                throw new Error('Non-zero carry');
            }
            length = i;
            psz++;
        }
        // Skip trailing spaces.
        if (source[psz] === ' ') {
            return;
        }
        // Skip leading zeroes in b256.
        var it4 = size - length;
        while (it4 !== size && b256[it4] === 0) {
            it4++;
        }
        var vch = new Uint8Array(zeroes + (size - it4));
        var j = zeroes;
        while (it4 !== size) {
            vch[j++] = b256[it4++];
        }
        return vch;
    }
    /**
     * @param {string | string[]} string
     */
    function decode(string) {
        var buffer = decodeUnsafe(string);
        if (buffer) {
            return buffer;
        }
        throw new Error(`Non-${name} character`);
    }
    return {
        encode: encode,
        decodeUnsafe: decodeUnsafe,
        decode: decode
    };
}
var src = base;
var _brrp__multiformats_scope_baseX = src;

/**
 * Class represents both BaseEncoder and MultibaseEncoder meaning it
 * can be used to encode to multibase or base encode without multibase
 * prefix.
 */
class Encoder {
    name;
    prefix;
    baseEncode;
    constructor(name, prefix, baseEncode) {
        this.name = name;
        this.prefix = prefix;
        this.baseEncode = baseEncode;
    }
    encode(bytes) {
        if (bytes instanceof Uint8Array) {
            return `${this.prefix}${this.baseEncode(bytes)}`;
        }
        else {
            throw Error('Unknown type, must be binary type');
        }
    }
}
/**
 * Class represents both BaseDecoder and MultibaseDecoder so it could be used
 * to decode multibases (with matching prefix) or just base decode strings
 * with corresponding base encoding.
 */
class Decoder {
    name;
    prefix;
    baseDecode;
    prefixCodePoint;
    constructor(name, prefix, baseDecode) {
        this.name = name;
        this.prefix = prefix;
        const prefixCodePoint = prefix.codePointAt(0);
        /* c8 ignore next 3 */
        if (prefixCodePoint === undefined) {
            throw new Error('Invalid prefix character');
        }
        this.prefixCodePoint = prefixCodePoint;
        this.baseDecode = baseDecode;
    }
    decode(text) {
        if (typeof text === 'string') {
            if (text.codePointAt(0) !== this.prefixCodePoint) {
                throw Error(`Unable to decode multibase string ${JSON.stringify(text)}, ${this.name} decoder only supports inputs prefixed with ${this.prefix}`);
            }
            return this.baseDecode(text.slice(this.prefix.length));
        }
        else {
            throw Error('Can only multibase decode strings');
        }
    }
    or(decoder) {
        return or(this, decoder);
    }
}
class ComposedDecoder {
    decoders;
    constructor(decoders) {
        this.decoders = decoders;
    }
    or(decoder) {
        return or(this, decoder);
    }
    decode(input) {
        const prefix = input[0];
        const decoder = this.decoders[prefix];
        if (decoder != null) {
            return decoder.decode(input);
        }
        else {
            throw RangeError(`Unable to decode multibase string ${JSON.stringify(input)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`);
        }
    }
}
function or(left, right) {
    return new ComposedDecoder({
        ...(left.decoders ?? { [left.prefix]: left }),
        ...(right.decoders ?? { [right.prefix]: right })
    });
}
class Codec {
    name;
    prefix;
    baseEncode;
    baseDecode;
    encoder;
    decoder;
    constructor(name, prefix, baseEncode, baseDecode) {
        this.name = name;
        this.prefix = prefix;
        this.baseEncode = baseEncode;
        this.baseDecode = baseDecode;
        this.encoder = new Encoder(name, prefix, baseEncode);
        this.decoder = new Decoder(name, prefix, baseDecode);
    }
    encode(input) {
        return this.encoder.encode(input);
    }
    decode(input) {
        return this.decoder.decode(input);
    }
}
function from({ name, prefix, encode, decode }) {
    return new Codec(name, prefix, encode, decode);
}
function baseX({ name, prefix, alphabet }) {
    const { encode, decode } = _brrp__multiformats_scope_baseX(alphabet, name);
    return from({
        prefix,
        name,
        encode,
        decode: (text) => coerce(decode(text))
    });
}
function decode$3(string, alphabetIdx, bitsPerChar, name) {
    // Count the padding bytes:
    let end = string.length;
    while (string[end - 1] === '=') {
        --end;
    }
    // Allocate the output:
    const out = new Uint8Array((end * bitsPerChar / 8) | 0);
    // Parse the data:
    let bits = 0; // Number of bits currently in the buffer
    let buffer = 0; // Bits waiting to be written out, MSB first
    let written = 0; // Next byte to write
    for (let i = 0; i < end; ++i) {
        // Read one character from the string:
        const value = alphabetIdx[string[i]];
        if (value === undefined) {
            throw new SyntaxError(`Non-${name} character`);
        }
        // Append the bits to the buffer:
        buffer = (buffer << bitsPerChar) | value;
        bits += bitsPerChar;
        // Write out some bits if the buffer has a byte's worth:
        if (bits >= 8) {
            bits -= 8;
            out[written++] = 0xff & (buffer >> bits);
        }
    }
    // Verify that we have received just enough bits:
    if (bits >= bitsPerChar || (0xff & (buffer << (8 - bits))) !== 0) {
        throw new SyntaxError('Unexpected end of data');
    }
    return out;
}
function encode$1(data, alphabet, bitsPerChar) {
    const pad = alphabet[alphabet.length - 1] === '=';
    const mask = (1 << bitsPerChar) - 1;
    let out = '';
    let bits = 0; // Number of bits currently in the buffer
    let buffer = 0; // Bits waiting to be written out, MSB first
    for (let i = 0; i < data.length; ++i) {
        // Slurp data into the buffer:
        buffer = (buffer << 8) | data[i];
        bits += 8;
        // Write out as much as we can:
        while (bits > bitsPerChar) {
            bits -= bitsPerChar;
            out += alphabet[mask & (buffer >> bits)];
        }
    }
    // Partial character:
    if (bits !== 0) {
        out += alphabet[mask & (buffer << (bitsPerChar - bits))];
    }
    // Add padding characters until we hit a byte boundary:
    if (pad) {
        while (((out.length * bitsPerChar) & 7) !== 0) {
            out += '=';
        }
    }
    return out;
}
function createAlphabetIdx(alphabet) {
    // Build the character lookup table:
    const alphabetIdx = {};
    for (let i = 0; i < alphabet.length; ++i) {
        alphabetIdx[alphabet[i]] = i;
    }
    return alphabetIdx;
}
/**
 * RFC4648 Factory
 */
function rfc4648({ name, prefix, bitsPerChar, alphabet }) {
    const alphabetIdx = createAlphabetIdx(alphabet);
    return from({
        prefix,
        name,
        encode(input) {
            return encode$1(input, alphabet, bitsPerChar);
        },
        decode(input) {
            return decode$3(input, alphabetIdx, bitsPerChar, name);
        }
    });
}

const base32 = rfc4648({
    prefix: 'b',
    name: 'base32',
    alphabet: 'abcdefghijklmnopqrstuvwxyz234567',
    bitsPerChar: 5
});
const base32upper = rfc4648({
    prefix: 'B',
    name: 'base32upper',
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
    bitsPerChar: 5
});
const base32pad = rfc4648({
    prefix: 'c',
    name: 'base32pad',
    alphabet: 'abcdefghijklmnopqrstuvwxyz234567=',
    bitsPerChar: 5
});
const base32padupper = rfc4648({
    prefix: 'C',
    name: 'base32padupper',
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=',
    bitsPerChar: 5
});
const base32hex = rfc4648({
    prefix: 'v',
    name: 'base32hex',
    alphabet: '0123456789abcdefghijklmnopqrstuv',
    bitsPerChar: 5
});
const base32hexupper = rfc4648({
    prefix: 'V',
    name: 'base32hexupper',
    alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUV',
    bitsPerChar: 5
});
const base32hexpad = rfc4648({
    prefix: 't',
    name: 'base32hexpad',
    alphabet: '0123456789abcdefghijklmnopqrstuv=',
    bitsPerChar: 5
});
const base32hexpadupper = rfc4648({
    prefix: 'T',
    name: 'base32hexpadupper',
    alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUV=',
    bitsPerChar: 5
});
const base32z = rfc4648({
    prefix: 'h',
    name: 'base32z',
    alphabet: 'ybndrfg8ejkmcpqxot1uwisza345h769',
    bitsPerChar: 5
});

const base32$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  base32,
  base32hex,
  base32hexpad,
  base32hexpadupper,
  base32hexupper,
  base32pad,
  base32padupper,
  base32upper,
  base32z
}, Symbol.toStringTag, { value: 'Module' }));

const base36 = baseX({
    prefix: 'k',
    name: 'base36',
    alphabet: '0123456789abcdefghijklmnopqrstuvwxyz'
});
const base36upper = baseX({
    prefix: 'K',
    name: 'base36upper',
    alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
});

const base36$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  base36,
  base36upper
}, Symbol.toStringTag, { value: 'Module' }));

const base58btc = baseX({
    name: 'base58btc',
    prefix: 'z',
    alphabet: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
});
const base58flickr = baseX({
    name: 'base58flickr',
    prefix: 'Z',
    alphabet: '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
});

const base58 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  base58btc,
  base58flickr
}, Symbol.toStringTag, { value: 'Module' }));

/* eslint-disable */
var encode_1 = encode;
var MSB = 0x80, MSBALL = -128, INT = Math.pow(2, 31);
/**
 * @param {number} num
 * @param {number[]} out
 * @param {number} offset
 */
function encode(num, out, offset) {
    out = out || [];
    offset = offset || 0;
    var oldOffset = offset;
    while (num >= INT) {
        out[offset++] = (num & 0xFF) | MSB;
        num /= 128;
    }
    while (num & MSBALL) {
        out[offset++] = (num & 0xFF) | MSB;
        num >>>= 7;
    }
    out[offset] = num | 0;
    // @ts-ignore
    encode.bytes = offset - oldOffset + 1;
    return out;
}
var decode$2 = read;
var MSB$1 = 0x80, REST$1 = 0x7F;
/**
 * @param {string | any[]} buf
 * @param {number} offset
 */
function read(buf, offset) {
    var res = 0, offset = offset || 0, shift = 0, counter = offset, b, l = buf.length;
    do {
        if (counter >= l) {
            // @ts-ignore
            read.bytes = 0;
            throw new RangeError('Could not decode varint');
        }
        b = buf[counter++];
        res += shift < 28
            ? (b & REST$1) << shift
            : (b & REST$1) * Math.pow(2, shift);
        shift += 7;
    } while (b >= MSB$1);
    // @ts-ignore
    read.bytes = counter - offset;
    return res;
}
var N1 = Math.pow(2, 7);
var N2 = Math.pow(2, 14);
var N3 = Math.pow(2, 21);
var N4 = Math.pow(2, 28);
var N5 = Math.pow(2, 35);
var N6 = Math.pow(2, 42);
var N7 = Math.pow(2, 49);
var N8 = Math.pow(2, 56);
var N9 = Math.pow(2, 63);
var length = function (/** @type {number} */ value) {
    return (value < N1 ? 1
        : value < N2 ? 2
            : value < N3 ? 3
                : value < N4 ? 4
                    : value < N5 ? 5
                        : value < N6 ? 6
                            : value < N7 ? 7
                                : value < N8 ? 8
                                    : value < N9 ? 9
                                        : 10);
};
var varint = {
    encode: encode_1,
    decode: decode$2,
    encodingLength: length
};
var _brrp_varint = varint;

function decode$1(data, offset = 0) {
    const code = _brrp_varint.decode(data, offset);
    return [code, _brrp_varint.decode.bytes];
}
function encodeTo(int, target, offset = 0) {
    _brrp_varint.encode(int, target, offset);
    return target;
}
function encodingLength(int) {
    return _brrp_varint.encodingLength(int);
}

/**
 * Creates a multihash digest.
 */
function create(code, digest) {
    const size = digest.byteLength;
    const sizeOffset = encodingLength(code);
    const digestOffset = sizeOffset + encodingLength(size);
    const bytes = new Uint8Array(digestOffset + size);
    encodeTo(code, bytes, 0);
    encodeTo(size, bytes, sizeOffset);
    bytes.set(digest, digestOffset);
    return new Digest(code, size, digest, bytes);
}
/**
 * Turns bytes representation of multihash digest into an instance.
 */
function decode(multihash) {
    const bytes = coerce(multihash);
    const [code, sizeOffset] = decode$1(bytes);
    const [size, digestOffset] = decode$1(bytes.subarray(sizeOffset));
    const digest = bytes.subarray(sizeOffset + digestOffset);
    if (digest.byteLength !== size) {
        throw new Error('Incorrect length');
    }
    return new Digest(code, size, digest, bytes);
}
function equals(a, b) {
    if (a === b) {
        return true;
    }
    else {
        const data = b;
        return (a.code === data.code &&
            a.size === data.size &&
            data.bytes instanceof Uint8Array &&
            equals$1(a.bytes, data.bytes));
    }
}
/**
 * Represents a multihash digest which carries information about the
 * hashing algorithm and an actual hash digest.
 */
class Digest {
    code;
    size;
    digest;
    bytes;
    /**
     * Creates a multihash digest.
     */
    constructor(code, size, digest, bytes) {
        this.code = code;
        this.size = size;
        this.digest = digest;
        this.bytes = bytes;
    }
}

function format(link, base) {
    const { bytes, version } = link;
    switch (version) {
        case 0:
            return toStringV0(bytes, baseCache(link), base ?? base58btc.encoder);
        default:
            return toStringV1(bytes, baseCache(link), (base ?? base32.encoder));
    }
}
const cache = new WeakMap();
function baseCache(cid) {
    const baseCache = cache.get(cid);
    if (baseCache == null) {
        const baseCache = new Map();
        cache.set(cid, baseCache);
        return baseCache;
    }
    return baseCache;
}
class CID {
    code;
    version;
    multihash;
    bytes;
    '/';
    /**
     * @param version - Version of the CID
     * @param code - Code of the codec content is encoded in, see https://github.com/multiformats/multicodec/blob/master/table.csv
     * @param multihash - (Multi)hash of the of the content.
     */
    constructor(version, code, multihash, bytes) {
        this.code = code;
        this.version = version;
        this.multihash = multihash;
        this.bytes = bytes;
        // flag to serializers that this is a CID and
        // should be treated specially
        this['/'] = bytes;
    }
    /**
     * Signalling `cid.asCID === cid` has been replaced with `cid['/'] === cid.bytes`
     * please either use `CID.asCID(cid)` or switch to new signalling mechanism
     *
     * @deprecated
     */
    get asCID() {
        return this;
    }
    // ArrayBufferView
    get byteOffset() {
        return this.bytes.byteOffset;
    }
    // ArrayBufferView
    get byteLength() {
        return this.bytes.byteLength;
    }
    toV0() {
        switch (this.version) {
            case 0: {
                return this;
            }
            case 1: {
                const { code, multihash } = this;
                if (code !== DAG_PB_CODE) {
                    throw new Error('Cannot convert a non dag-pb CID to CIDv0');
                }
                // sha2-256
                if (multihash.code !== SHA_256_CODE) {
                    throw new Error('Cannot convert non sha2-256 multihash CID to CIDv0');
                }
                return (CID.createV0(multihash));
            }
            default: {
                throw Error(`Can not convert CID version ${this.version} to version 0. This is a bug please report`);
            }
        }
    }
    toV1() {
        switch (this.version) {
            case 0: {
                const { code, digest } = this.multihash;
                const multihash = create(code, digest);
                return (CID.createV1(this.code, multihash));
            }
            case 1: {
                return this;
            }
            default: {
                throw Error(`Can not convert CID version ${this.version} to version 1. This is a bug please report`);
            }
        }
    }
    equals(other) {
        return CID.equals(this, other);
    }
    static equals(self, other) {
        const unknown = other;
        return (unknown != null &&
            self.code === unknown.code &&
            self.version === unknown.version &&
            equals(self.multihash, unknown.multihash));
    }
    toString(base) {
        return format(this, base);
    }
    toJSON() {
        return { '/': format(this) };
    }
    link() {
        return this;
    }
    [Symbol.toStringTag] = 'CID';
    // Legacy
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return `CID(${this.toString()})`;
    }
    /**
     * Takes any input `value` and returns a `CID` instance if it was
     * a `CID` otherwise returns `null`. If `value` is instanceof `CID`
     * it will return value back. If `value` is not instance of this CID
     * class, but is compatible CID it will return new instance of this
     * `CID` class. Otherwise returns null.
     *
     * This allows two different incompatible versions of CID library to
     * co-exist and interop as long as binary interface is compatible.
     */
    static asCID(input) {
        if (input == null) {
            return null;
        }
        const value = input;
        if (value instanceof CID) {
            // If value is instance of CID then we're all set.
            return value;
        }
        else if ((value['/'] != null && value['/'] === value.bytes) || value.asCID === value) {
            // If value isn't instance of this CID class but `this.asCID === this` or
            // `value['/'] === value.bytes` is true it is CID instance coming from a
            // different implementation (diff version or duplicate). In that case we
            // rebase it to this `CID` implementation so caller is guaranteed to get
            // instance with expected API.
            const { version, code, multihash, bytes } = value;
            return new CID(version, code, multihash, bytes ?? encodeCID(version, code, multihash.bytes));
        }
        else if (value[cidSymbol] === true) {
            // If value is a CID from older implementation that used to be tagged via
            // symbol we still rebase it to the this `CID` implementation by
            // delegating that to a constructor.
            const { version, multihash, code } = value;
            const digest = decode(multihash);
            return CID.create(version, code, digest);
        }
        else {
            // Otherwise value is not a CID (or an incompatible version of it) in
            // which case we return `null`.
            return null;
        }
    }
    /**
     * @param version - Version of the CID
     * @param code - Code of the codec content is encoded in, see https://github.com/multiformats/multicodec/blob/master/table.csv
     * @param digest - (Multi)hash of the of the content.
     */
    static create(version, code, digest) {
        if (typeof code !== 'number') {
            throw new Error('String codecs are no longer supported');
        }
        if (!(digest.bytes instanceof Uint8Array)) {
            throw new Error('Invalid digest');
        }
        switch (version) {
            case 0: {
                if (code !== DAG_PB_CODE) {
                    throw new Error(`Version 0 CID must use dag-pb (code: ${DAG_PB_CODE}) block encoding`);
                }
                else {
                    return new CID(version, code, digest, digest.bytes);
                }
            }
            case 1: {
                const bytes = encodeCID(version, code, digest.bytes);
                return new CID(version, code, digest, bytes);
            }
            default: {
                throw new Error('Invalid version');
            }
        }
    }
    /**
     * Simplified version of `create` for CIDv0.
     */
    static createV0(digest) {
        return CID.create(0, DAG_PB_CODE, digest);
    }
    /**
     * Simplified version of `create` for CIDv1.
     *
     * @param code - Content encoding format code.
     * @param digest - Multihash of the content.
     */
    static createV1(code, digest) {
        return CID.create(1, code, digest);
    }
    /**
     * Decoded a CID from its binary representation. The byte array must contain
     * only the CID with no additional bytes.
     *
     * An error will be thrown if the bytes provided do not contain a valid
     * binary representation of a CID.
     */
    static decode(bytes) {
        const [cid, remainder] = CID.decodeFirst(bytes);
        if (remainder.length !== 0) {
            throw new Error('Incorrect length');
        }
        return cid;
    }
    /**
     * Decoded a CID from its binary representation at the beginning of a byte
     * array.
     *
     * Returns an array with the first element containing the CID and the second
     * element containing the remainder of the original byte array. The remainder
     * will be a zero-length byte array if the provided bytes only contained a
     * binary CID representation.
     */
    static decodeFirst(bytes) {
        const specs = CID.inspectBytes(bytes);
        const prefixSize = specs.size - specs.multihashSize;
        const multihashBytes = coerce(bytes.subarray(prefixSize, prefixSize + specs.multihashSize));
        if (multihashBytes.byteLength !== specs.multihashSize) {
            throw new Error('Incorrect length');
        }
        const digestBytes = multihashBytes.subarray(specs.multihashSize - specs.digestSize);
        const digest = new Digest(specs.multihashCode, specs.digestSize, digestBytes, multihashBytes);
        const cid = specs.version === 0
            ? CID.createV0(digest)
            : CID.createV1(specs.codec, digest);
        return [cid, bytes.subarray(specs.size)];
    }
    /**
     * Inspect the initial bytes of a CID to determine its properties.
     *
     * Involves decoding up to 4 varints. Typically this will require only 4 to 6
     * bytes but for larger multicodec code values and larger multihash digest
     * lengths these varints can be quite large. It is recommended that at least
     * 10 bytes be made available in the `initialBytes` argument for a complete
     * inspection.
     */
    static inspectBytes(initialBytes) {
        let offset = 0;
        const next = () => {
            const [i, length] = decode$1(initialBytes.subarray(offset));
            offset += length;
            return i;
        };
        let version = next();
        let codec = DAG_PB_CODE;
        if (version === 18) {
            // CIDv0
            version = 0;
            offset = 0;
        }
        else {
            codec = next();
        }
        if (version !== 0 && version !== 1) {
            throw new RangeError(`Invalid CID version ${version}`);
        }
        const prefixSize = offset;
        const multihashCode = next(); // multihash code
        const digestSize = next(); // multihash length
        const size = offset + digestSize;
        const multihashSize = size - prefixSize;
        return { version, codec, multihashCode, digestSize, multihashSize, size };
    }
    /**
     * Takes cid in a string representation and creates an instance. If `base`
     * decoder is not provided will use a default from the configuration. It will
     * throw an error if encoding of the CID is not compatible with supplied (or
     * a default decoder).
     */
    static parse(source, base) {
        const [prefix, bytes] = parseCIDtoBytes(source, base);
        const cid = CID.decode(bytes);
        if (cid.version === 0 && source[0] !== 'Q') {
            throw Error('Version 0 CID string must not include multibase prefix');
        }
        // Cache string representation to avoid computing it on `this.toString()`
        baseCache(cid).set(prefix, source);
        return cid;
    }
}
function parseCIDtoBytes(source, base) {
    switch (source[0]) {
        // CIDv0 is parsed differently
        case 'Q': {
            const decoder = base ?? base58btc;
            return [
                base58btc.prefix,
                decoder.decode(`${base58btc.prefix}${source}`)
            ];
        }
        case base58btc.prefix: {
            const decoder = base ?? base58btc;
            return [base58btc.prefix, decoder.decode(source)];
        }
        case base32.prefix: {
            const decoder = base ?? base32;
            return [base32.prefix, decoder.decode(source)];
        }
        case base36.prefix: {
            const decoder = base ?? base36;
            return [base36.prefix, decoder.decode(source)];
        }
        default: {
            if (base == null) {
                throw Error('To parse non base32, base36 or base58btc encoded CID multibase decoder must be provided');
            }
            return [source[0], base.decode(source)];
        }
    }
}
function toStringV0(bytes, cache, base) {
    const { prefix } = base;
    if (prefix !== base58btc.prefix) {
        throw Error(`Cannot string encode V0 in ${base.name} encoding`);
    }
    const cid = cache.get(prefix);
    if (cid == null) {
        const cid = base.encode(bytes).slice(1);
        cache.set(prefix, cid);
        return cid;
    }
    else {
        return cid;
    }
}
function toStringV1(bytes, cache, base) {
    const { prefix } = base;
    const cid = cache.get(prefix);
    if (cid == null) {
        const cid = base.encode(bytes);
        cache.set(prefix, cid);
        return cid;
    }
    else {
        return cid;
    }
}
const DAG_PB_CODE = 0x70;
const SHA_256_CODE = 0x12;
function encodeCID(version, code, multihash) {
    const codeOffset = encodingLength(version);
    const hashOffset = codeOffset + encodingLength(code);
    const bytes = new Uint8Array(hashOffset + multihash.byteLength);
    encodeTo(version, bytes, 0);
    encodeTo(code, bytes, codeOffset);
    bytes.set(multihash, hashOffset);
    return bytes;
}
const cidSymbol = Symbol.for('@ipld/js-cid/CID');

/**
 * @license lucide-react v0.543.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */

const toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const toCamelCase = (string) => string.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase()
);
const toPascalCase = (string) => {
  const camelCase = toCamelCase(string);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};
const mergeClasses = (...classes) => classes.filter((className, index, array) => {
  return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();
const hasA11yProp = (props) => {
  for (const prop in props) {
    if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
      return true;
    }
  }
};

/**
 * @license lucide-react v0.543.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */

var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};

/**
 * @license lucide-react v0.543.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Icon = core_ipfs__loadShare__react__loadShare__.forwardRef(
  ({
    color = "currentColor",
    size = 24,
    strokeWidth = 2,
    absoluteStrokeWidth,
    className = "",
    children,
    iconNode,
    ...rest
  }, ref) => core_ipfs__loadShare__react__loadShare__.createElement(
    "svg",
    {
      ref,
      ...defaultAttributes,
      width: size,
      height: size,
      stroke: color,
      strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
      className: mergeClasses("lucide", className),
      ...!children && !hasA11yProp(rest) && { "aria-hidden": "true" },
      ...rest
    },
    [
      ...iconNode.map(([tag, attrs]) => core_ipfs__loadShare__react__loadShare__.createElement(tag, attrs)),
      ...Array.isArray(children) ? children : [children]
    ]
  )
);

/**
 * @license lucide-react v0.543.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const createLucideIcon = (iconName, iconNode) => {
  const Component = core_ipfs__loadShare__react__loadShare__.forwardRef(
    ({ className, ...props }, ref) => core_ipfs__loadShare__react__loadShare__.createElement(Icon, {
      ref,
      iconNode,
      className: mergeClasses(
        `lucide-${toKebabCase(toPascalCase(iconName))}`,
        `lucide-${iconName}`,
        className
      ),
      ...props
    })
  );
  Component.displayName = toPascalCase(iconName);
  return Component;
};

/**
 * @license lucide-react v0.543.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode = [
  [
    "path",
    {
      d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
      key: "1kt360"
    }
  ]
];
const Folder = createLucideIcon("folder", __iconNode);

export { CID, Folder, base32$1 as base32, base32 as base32$1, base32upper, base36$1 as base36, base36 as base36$1, base58, base58btc, baseX, coerce, core_ipfs__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__, core_ipfs__loadShare__react__loadShare__, create, createLucideIcon, decode, from, fromHex, fromString, jsxRuntimeExports, rfc4648, toString };
