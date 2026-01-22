import { core_lbry__mf_v__runtimeInit__mf_v__ } from './core_lbry__mf_v__runtimeInit__mf_v__-fO1FuTHm.js';

// dev uses dynamic import to separate chunks
    
    const {initPromise} = core_lbry__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(runtime => runtime.loadShare("react", {
      customShareInfo: {shareConfig:{
        singleton: true,
        strictVersion: false,
        requiredVersion: "^19.2.3"
      }}
    }));
    const exportModule = await res.then(factory => factory());
    var core_lbry__loadShare__react__loadShare__ = exportModule;

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
	  var React = core_lbry__loadShare__react__loadShare__, REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
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

/**
 * @license lucide-react v0.562.0 - ISC
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
 * @license lucide-react v0.562.0 - ISC
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
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Icon = core_lbry__loadShare__react__loadShare__.forwardRef(
  ({
    color = "currentColor",
    size = 24,
    strokeWidth = 2,
    absoluteStrokeWidth,
    className = "",
    children,
    iconNode,
    ...rest
  }, ref) => core_lbry__loadShare__react__loadShare__.createElement(
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
      ...iconNode.map(([tag, attrs]) => core_lbry__loadShare__react__loadShare__.createElement(tag, attrs)),
      ...Array.isArray(children) ? children : [children]
    ]
  )
);

/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const createLucideIcon = (iconName, iconNode) => {
  const Component = core_lbry__loadShare__react__loadShare__.forwardRef(
    ({ className, ...props }, ref) => core_lbry__loadShare__react__loadShare__.createElement(Icon, {
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

export { core_lbry__loadShare__react__loadShare__, createLucideIcon, jsxRuntimeExports };
