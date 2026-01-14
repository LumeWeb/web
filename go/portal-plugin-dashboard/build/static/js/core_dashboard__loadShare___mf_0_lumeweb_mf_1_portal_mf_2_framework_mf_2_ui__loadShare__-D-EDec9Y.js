import { core_dashboard__mf_v__runtimeInit__mf_v__ } from './core_dashboard__mf_v__runtimeInit__mf_v__-BS5DE-ec.js';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

// dev uses dynamic import to separate chunks
    
    const {initPromise: initPromise$1} = core_dashboard__mf_v__runtimeInit__mf_v__;
    const res$1 = initPromise$1.then(runtime => runtime.loadShare("react", {
      customShareInfo: {shareConfig:{
        singleton: true,
        strictVersion: false,
        requiredVersion: "^19.2.3"
      }}
    }));
    const exportModule$1 = await res$1.then(factory => factory());
    var core_dashboard__loadShare__react__loadShare__ = exportModule$1;

const React = /*@__PURE__*/getDefaultExportFromCjs(core_dashboard__loadShare__react__loadShare__);

var jsxRuntime = {exports: {}};

var reactJsxRuntime_production = {};

/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactJsxRuntime_production;

function requireReactJsxRuntime_production () {
	if (hasRequiredReactJsxRuntime_production) return reactJsxRuntime_production;
	hasRequiredReactJsxRuntime_production = 1;
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"),
	  REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	function jsxProd(type, config, maybeKey) {
	  var key = null;
	  void 0 !== maybeKey && (key = "" + maybeKey);
	  void 0 !== config.key && (key = "" + config.key);
	  if ("key" in config) {
	    maybeKey = {};
	    for (var propName in config)
	      "key" !== propName && (maybeKey[propName] = config[propName]);
	  } else maybeKey = config;
	  config = maybeKey.ref;
	  return {
	    $$typeof: REACT_ELEMENT_TYPE,
	    type: type,
	    key: key,
	    ref: void 0 !== config ? config : null,
	    props: maybeKey
	  };
	}
	reactJsxRuntime_production.Fragment = REACT_FRAGMENT_TYPE;
	reactJsxRuntime_production.jsx = jsxProd;
	reactJsxRuntime_production.jsxs = jsxProd;
	return reactJsxRuntime_production;
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
	 * Copyright (c) Meta Platforms, Inc. and affiliates.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */
	"production" !== define_process_env_default.NODE_ENV && (function() {
	  function getComponentNameFromType(type) {
	    if (null == type) return null;
	    if ("function" === typeof type)
	      return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
	    if ("string" === typeof type) return type;
	    switch (type) {
	      case REACT_FRAGMENT_TYPE:
	        return "Fragment";
	      case REACT_PROFILER_TYPE:
	        return "Profiler";
	      case REACT_STRICT_MODE_TYPE:
	        return "StrictMode";
	      case REACT_SUSPENSE_TYPE:
	        return "Suspense";
	      case REACT_SUSPENSE_LIST_TYPE:
	        return "SuspenseList";
	      case REACT_ACTIVITY_TYPE:
	        return "Activity";
	    }
	    if ("object" === typeof type)
	      switch ("number" === typeof type.tag && console.error(
	        "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
	      ), type.$$typeof) {
	        case REACT_PORTAL_TYPE:
	          return "Portal";
	        case REACT_CONTEXT_TYPE:
	          return type.displayName || "Context";
	        case REACT_CONSUMER_TYPE:
	          return (type._context.displayName || "Context") + ".Consumer";
	        case REACT_FORWARD_REF_TYPE:
	          var innerType = type.render;
	          type = type.displayName;
	          type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
	          return type;
	        case REACT_MEMO_TYPE:
	          return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
	        case REACT_LAZY_TYPE:
	          innerType = type._payload;
	          type = type._init;
	          try {
	            return getComponentNameFromType(type(innerType));
	          } catch (x) {
	          }
	      }
	    return null;
	  }
	  function testStringCoercion(value) {
	    return "" + value;
	  }
	  function checkKeyStringCoercion(value) {
	    try {
	      testStringCoercion(value);
	      var JSCompiler_inline_result = false;
	    } catch (e) {
	      JSCompiler_inline_result = true;
	    }
	    if (JSCompiler_inline_result) {
	      JSCompiler_inline_result = console;
	      var JSCompiler_temp_const = JSCompiler_inline_result.error;
	      var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
	      JSCompiler_temp_const.call(
	        JSCompiler_inline_result,
	        "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
	        JSCompiler_inline_result$jscomp$0
	      );
	      return testStringCoercion(value);
	    }
	  }
	  function getTaskName(type) {
	    if (type === REACT_FRAGMENT_TYPE) return "<>";
	    if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE)
	      return "<...>";
	    try {
	      var name = getComponentNameFromType(type);
	      return name ? "<" + name + ">" : "<...>";
	    } catch (x) {
	      return "<...>";
	    }
	  }
	  function getOwner() {
	    var dispatcher = ReactSharedInternals.A;
	    return null === dispatcher ? null : dispatcher.getOwner();
	  }
	  function UnknownOwner() {
	    return Error("react-stack-top-frame");
	  }
	  function hasValidKey(config) {
	    if (hasOwnProperty.call(config, "key")) {
	      var getter = Object.getOwnPropertyDescriptor(config, "key").get;
	      if (getter && getter.isReactWarning) return false;
	    }
	    return void 0 !== config.key;
	  }
	  function defineKeyPropWarningGetter(props, displayName) {
	    function warnAboutAccessingKey() {
	      specialPropKeyWarningShown || (specialPropKeyWarningShown = true, console.error(
	        "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
	        displayName
	      ));
	    }
	    warnAboutAccessingKey.isReactWarning = true;
	    Object.defineProperty(props, "key", {
	      get: warnAboutAccessingKey,
	      configurable: true
	    });
	  }
	  function elementRefGetterWithDeprecationWarning() {
	    var componentName = getComponentNameFromType(this.type);
	    didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = true, console.error(
	      "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
	    ));
	    componentName = this.props.ref;
	    return void 0 !== componentName ? componentName : null;
	  }
	  function ReactElement(type, key, props, owner, debugStack, debugTask) {
	    var refProp = props.ref;
	    type = {
	      $$typeof: REACT_ELEMENT_TYPE,
	      type,
	      key,
	      props,
	      _owner: owner
	    };
	    null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
	      enumerable: false,
	      get: elementRefGetterWithDeprecationWarning
	    }) : Object.defineProperty(type, "ref", { enumerable: false, value: null });
	    type._store = {};
	    Object.defineProperty(type._store, "validated", {
	      configurable: false,
	      enumerable: false,
	      writable: true,
	      value: 0
	    });
	    Object.defineProperty(type, "_debugInfo", {
	      configurable: false,
	      enumerable: false,
	      writable: true,
	      value: null
	    });
	    Object.defineProperty(type, "_debugStack", {
	      configurable: false,
	      enumerable: false,
	      writable: true,
	      value: debugStack
	    });
	    Object.defineProperty(type, "_debugTask", {
	      configurable: false,
	      enumerable: false,
	      writable: true,
	      value: debugTask
	    });
	    Object.freeze && (Object.freeze(type.props), Object.freeze(type));
	    return type;
	  }
	  function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
	    var children = config.children;
	    if (void 0 !== children)
	      if (isStaticChildren)
	        if (isArrayImpl(children)) {
	          for (isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)
	            validateChildKeys(children[isStaticChildren]);
	          Object.freeze && Object.freeze(children);
	        } else
	          console.error(
	            "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
	          );
	      else validateChildKeys(children);
	    if (hasOwnProperty.call(config, "key")) {
	      children = getComponentNameFromType(type);
	      var keys = Object.keys(config).filter(function(k) {
	        return "key" !== k;
	      });
	      isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
	      didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error(
	        'A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />',
	        isStaticChildren,
	        children,
	        keys,
	        children
	      ), didWarnAboutKeySpread[children + isStaticChildren] = true);
	    }
	    children = null;
	    void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
	    hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
	    if ("key" in config) {
	      maybeKey = {};
	      for (var propName in config)
	        "key" !== propName && (maybeKey[propName] = config[propName]);
	    } else maybeKey = config;
	    children && defineKeyPropWarningGetter(
	      maybeKey,
	      "function" === typeof type ? type.displayName || type.name || "Unknown" : type
	    );
	    return ReactElement(
	      type,
	      children,
	      maybeKey,
	      getOwner(),
	      debugStack,
	      debugTask
	    );
	  }
	  function validateChildKeys(node) {
	    isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
	  }
	  function isValidElement(object) {
	    return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
	  }
	  var React = core_dashboard__loadShare__react__loadShare__, REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
	    return null;
	  };
	  React = {
	    react_stack_bottom_frame: function(callStackForError) {
	      return callStackForError();
	    }
	  };
	  var specialPropKeyWarningShown;
	  var didWarnAboutElementRef = {};
	  var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(
	    React,
	    UnknownOwner
	  )();
	  var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
	  var didWarnAboutKeySpread = {};
	  reactJsxRuntime_development.Fragment = REACT_FRAGMENT_TYPE;
	  reactJsxRuntime_development.jsx = function(type, config, maybeKey) {
	    var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
	    return jsxDEVImpl(
	      type,
	      config,
	      maybeKey,
	      false,
	      trackActualOwner ? Error("react-stack-top-frame") : unknownOwnerDebugStack,
	      trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask
	    );
	  };
	  reactJsxRuntime_development.jsxs = function(type, config, maybeKey) {
	    var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
	    return jsxDEVImpl(
	      type,
	      config,
	      maybeKey,
	      true,
	      trackActualOwner ? Error("react-stack-top-frame") : unknownOwnerDebugStack,
	      trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask
	    );
	  };
	})();
	return reactJsxRuntime_development;
}

var define_process_env_default = {};
if (define_process_env_default.NODE_ENV === "production") {
  jsxRuntime.exports = requireReactJsxRuntime_production();
} else {
  jsxRuntime.exports = requireReactJsxRuntime_development();
}

var jsxRuntimeExports = jsxRuntime.exports;

// dev uses dynamic import to separate chunks
    
    const {initPromise} = core_dashboard__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(runtime => runtime.loadShare("@lumeweb/portal-framework-ui", {
      customShareInfo: {shareConfig:{
        singleton: true,
        strictVersion: false,
        requiredVersion: "^0.1.0"
      }}
    }));
    const exportModule = await res.then(factory => factory());
    var core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__ = exportModule;

export { React, commonjsGlobal, core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__, core_dashboard__loadShare__react__loadShare__, getDefaultExportFromCjs, jsxRuntimeExports };
