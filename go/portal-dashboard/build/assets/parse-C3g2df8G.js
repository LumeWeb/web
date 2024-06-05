import { r as reactExports } from "./index-BIsqO_uY.js";
function ownKeys$2(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2$2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys$2(Object(t), true).forEach(function(r2) {
      _defineProperty$2(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$2(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function _defineProperty$2(obj, key, value) {
  key = _toPropertyKey$2(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPrimitive$2(input, hint) {
  if (typeof input !== "object" || input === null)
    return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (typeof res !== "object")
      return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
function _toPropertyKey$2(arg) {
  var key = _toPrimitive$2(arg, "string");
  return typeof key === "symbol" ? key : String(key);
}
function getFormData(form, submitter) {
  var payload = new FormData(form, submitter);
  if (submitter && submitter.type === "submit" && submitter.name !== "") {
    var entries = payload.getAll(submitter.name);
    if (!entries.includes(submitter.value)) {
      payload.append(submitter.name, submitter.value);
    }
  }
  return payload;
}
function getPaths(name) {
  if (!name) {
    return [];
  }
  return name.split(/\.|(\[\d*\])/).reduce((result, segment) => {
    if (typeof segment !== "undefined" && segment !== "") {
      if (segment.startsWith("[") && segment.endsWith("]")) {
        var index = segment.slice(1, -1);
        result.push(Number(index));
      } else {
        result.push(segment);
      }
    }
    return result;
  }, []);
}
function formatPaths(paths) {
  return paths.reduce((name, path) => {
    if (typeof path === "number") {
      return "".concat(name, "[").concat(Number.isNaN(path) ? "" : path, "]");
    }
    if (name === "" || path === "") {
      return [name, path].join("");
    }
    return [name, path].join(".");
  }, "");
}
function isPrefix(name, prefix) {
  var paths = getPaths(name);
  var prefixPaths = getPaths(prefix);
  return paths.length >= prefixPaths.length && prefixPaths.every((path, index) => paths[index] === path);
}
function setValue(target, name, valueFn) {
  var paths = getPaths(name);
  var length = paths.length;
  var lastIndex = length - 1;
  var index = -1;
  var pointer = target;
  while (pointer != null && ++index < length) {
    var _pointer$key;
    var key = paths[index];
    var nextKey = paths[index + 1];
    var newValue = index != lastIndex ? (_pointer$key = pointer[key]) !== null && _pointer$key !== void 0 ? _pointer$key : typeof nextKey === "number" ? [] : {} : valueFn(pointer[key]);
    pointer[key] = newValue;
    pointer = pointer[key];
  }
}
function getValue(target, name) {
  var pointer = target;
  for (var path of getPaths(name)) {
    if (typeof pointer === "undefined" || pointer == null) {
      break;
    }
    if (isPlainObject(pointer) && typeof path === "string") {
      pointer = pointer[path];
    } else if (Array.isArray(pointer) && typeof path === "number") {
      pointer = pointer[path];
    } else {
      return;
    }
  }
  return pointer;
}
function isPlainObject(obj) {
  return !!obj && obj.constructor === Object && Object.getPrototypeOf(obj) === Object.prototype;
}
function isFile(obj) {
  if (typeof File === "undefined") {
    return false;
  }
  return obj instanceof File;
}
function normalize(value) {
  var acceptFile = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
  if (isPlainObject(value)) {
    var obj = Object.keys(value).sort().reduce((result, key) => {
      var data = normalize(value[key], acceptFile);
      if (typeof data !== "undefined") {
        result[key] = data;
      }
      return result;
    }, {});
    if (Object.keys(obj).length === 0) {
      return;
    }
    return obj;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return void 0;
    }
    return value.map((item) => normalize(item, acceptFile));
  }
  if (typeof value === "string" && value === "" || value === null || isFile(value) && (!acceptFile || value.size === 0)) {
    return;
  }
  return value;
}
function flatten(data, options) {
  var _options$resolve;
  var result = {};
  var resolve = (_options$resolve = options === null || options === void 0 ? void 0 : options.resolve) !== null && _options$resolve !== void 0 ? _options$resolve : (data2) => data2;
  function setResult(data2, name) {
    var value = normalize(resolve(data2));
    if (typeof value !== "undefined") {
      result[name] = value;
    }
  }
  function processObject(obj, prefix2) {
    setResult(obj, prefix2);
    for (var [key, _value] of Object.entries(obj)) {
      var name = prefix2 ? "".concat(prefix2, ".").concat(key) : key;
      if (Array.isArray(_value)) {
        processArray(_value, name);
      } else if (_value && isPlainObject(_value)) {
        processObject(_value, name);
      } else {
        setResult(_value, name);
      }
    }
  }
  function processArray(array, prefix2) {
    setResult(array, prefix2);
    for (var i = 0; i < array.length; i++) {
      var item = array[i];
      var name = "".concat(prefix2, "[").concat(i, "]");
      if (Array.isArray(item)) {
        processArray(item, name);
      } else if (item && isPlainObject(item)) {
        processObject(item, name);
      } else {
        setResult(item, name);
      }
    }
  }
  if (data) {
    var _options$prefix;
    var prefix = (_options$prefix = options === null || options === void 0 ? void 0 : options.prefix) !== null && _options$prefix !== void 0 ? _options$prefix : "";
    if (Array.isArray(data)) {
      processArray(data, prefix);
    } else {
      processObject(data, prefix);
    }
  }
  return result;
}
function invariant(expectedCondition, message) {
  if (!expectedCondition) {
    throw new Error(message);
  }
}
function generateId() {
  return (Date.now() * Math.random()).toString(36);
}
function clone(data) {
  return JSON.parse(JSON.stringify(data));
}
function isFormControl(element) {
  return element instanceof Element && (element.tagName === "INPUT" || element.tagName === "SELECT" || element.tagName === "TEXTAREA" || element.tagName === "BUTTON");
}
function isFieldElement(element) {
  return isFormControl(element) && element.type !== "submit" && element.type !== "button" && element.type !== "reset";
}
function getFormAction(event) {
  var _ref, _submitter$getAttribu;
  var form = event.target;
  var submitter = event.submitter;
  return (_ref = (_submitter$getAttribu = submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("formaction")) !== null && _submitter$getAttribu !== void 0 ? _submitter$getAttribu : form.getAttribute("action")) !== null && _ref !== void 0 ? _ref : "".concat(location.pathname).concat(location.search);
}
function getFormEncType(event) {
  var _submitter$getAttribu2;
  var form = event.target;
  var submitter = event.submitter;
  var encType = (_submitter$getAttribu2 = submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("formenctype")) !== null && _submitter$getAttribu2 !== void 0 ? _submitter$getAttribu2 : form.enctype;
  if (encType === "multipart/form-data") {
    return encType;
  }
  return "application/x-www-form-urlencoded";
}
function getFormMethod(event) {
  var _ref2, _submitter$getAttribu3;
  var form = event.target;
  var submitter = event.submitter;
  var method = (_ref2 = (_submitter$getAttribu3 = submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("formmethod")) !== null && _submitter$getAttribu3 !== void 0 ? _submitter$getAttribu3 : form.getAttribute("method")) === null || _ref2 === void 0 ? void 0 : _ref2.toUpperCase();
  switch (method) {
    case "POST":
    case "PUT":
    case "PATCH":
    case "DELETE":
      return method;
  }
  return "GET";
}
function requestSubmit(form, submitter) {
  invariant(!!form, "Failed to submit the form. The element provided is null or undefined.");
  if (typeof form.requestSubmit === "function") {
    form.requestSubmit(submitter);
  } else {
    var event = new SubmitEvent("submit", {
      bubbles: true,
      cancelable: true,
      submitter
    });
    form.dispatchEvent(event);
  }
}
var INTENT = "__intent__";
var STATE = "__state__";
function getSubmissionContext(body) {
  var intent = body.get(INTENT);
  var state = body.get(STATE);
  invariant((typeof intent === "string" || intent === null) && (typeof state === "string" || state === null), 'The input name "'.concat(INTENT, '" and "').concat(STATE, '" are reserved by Conform. Please use another name for your input.'));
  var context = {
    payload: {},
    fields: /* @__PURE__ */ new Set(),
    intent: getIntent(intent)
  };
  if (state) {
    context.state = JSON.parse(state);
  }
  var _loop = function _loop2(next2) {
    if (name === INTENT || name === STATE) {
      return 1;
    }
    context.fields.add(name);
    setValue(context.payload, name, (prev) => {
      if (!prev) {
        return next2;
      } else if (Array.isArray(prev)) {
        return prev.concat(next2);
      } else {
        return [prev, next2];
      }
    });
  };
  for (var [name, next] of body.entries()) {
    if (_loop(next))
      continue;
  }
  return context;
}
function parse(payload, options) {
  var context = getSubmissionContext(payload);
  var intent = context.intent;
  if (intent) {
    switch (intent.type) {
      case "update": {
        var {
          name
        } = intent.payload;
        var _value = serialize(intent.payload.value);
        if (typeof _value !== "undefined") {
          if (name) {
            setValue(context.payload, name, () => _value);
          } else {
            context.payload = _value;
          }
        }
        break;
      }
      case "reset": {
        var {
          name: _name
        } = intent.payload;
        if (_name) {
          setValue(context.payload, _name, () => void 0);
        } else {
          context.payload = {};
        }
        break;
      }
      case "insert": {
        setListValue(context.payload, {
          type: intent.type,
          payload: _objectSpread2$2(_objectSpread2$2({}, intent.payload), {}, {
            defaultValue: serialize(intent.payload.defaultValue)
          })
        });
        break;
      }
      case "remove":
      case "reorder": {
        setListValue(context.payload, intent);
        break;
      }
    }
  }
  var result = options.resolve(context.payload, intent);
  var mergeResolveResult = (resolved) => createSubmission(_objectSpread2$2(_objectSpread2$2({}, context), {}, {
    value: resolved.value,
    error: resolved.error
  }));
  if (result instanceof Promise) {
    return result.then(mergeResolveResult);
  }
  return mergeResolveResult(result);
}
function createSubmission(context) {
  if (context.intent || !context.value || context.error) {
    return {
      status: !context.intent ? "error" : void 0,
      payload: context.payload,
      error: typeof context.error !== "undefined" ? context.error : {},
      reply(options) {
        return replySubmission(context, options);
      }
    };
  }
  return {
    status: "success",
    payload: context.payload,
    value: context.value,
    reply(options) {
      return replySubmission(context, options);
    }
  };
}
function replySubmission(context) {
  var _context$intent, _context$intent$paylo, _options$formErrors, _normalize;
  var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
  if ("resetForm" in options && options.resetForm || ((_context$intent = context.intent) === null || _context$intent === void 0 ? void 0 : _context$intent.type) === "reset" && ((_context$intent$paylo = context.intent.payload.name) !== null && _context$intent$paylo !== void 0 ? _context$intent$paylo : "") === "") {
    return {
      initialValue: null
    };
  }
  if ("hideFields" in options && options.hideFields) {
    for (var name of options.hideFields) {
      var _value2 = getValue(context.payload, name);
      if (typeof _value2 !== "undefined") {
        setValue(context.payload, name, () => void 0);
      }
    }
  }
  var extraError = "formErrors" in options || "fieldErrors" in options ? normalize(_objectSpread2$2({
    "": (_options$formErrors = options.formErrors) !== null && _options$formErrors !== void 0 ? _options$formErrors : null
  }, options.fieldErrors)) : null;
  var error = context.error || extraError ? _objectSpread2$2(_objectSpread2$2({}, context.error), extraError) : void 0;
  return {
    status: context.intent ? void 0 : error ? "error" : "success",
    intent: context.intent ? context.intent : void 0,
    initialValue: (_normalize = normalize(
      context.payload,
      // We can't serialize the file and send it back from the server, but we can preserve it in the client
      typeof document !== "undefined"
    )) !== null && _normalize !== void 0 ? _normalize : {},
    error,
    state: context.state,
    fields: Array.from(context.fields)
  };
}
function getIntent(serializedIntent) {
  if (!serializedIntent) {
    return null;
  }
  var control = JSON.parse(serializedIntent);
  if (typeof control.type !== "string" || typeof control.payload === "undefined") {
    throw new Error("Unknown form control intent");
  }
  return control;
}
function serializeIntent(intent) {
  return JSON.stringify(intent);
}
function updateList(list, intent) {
  var _intent$payload$index;
  invariant(Array.isArray(list), "Failed to update list. The value is not an array.");
  switch (intent.type) {
    case "insert":
      list.splice((_intent$payload$index = intent.payload.index) !== null && _intent$payload$index !== void 0 ? _intent$payload$index : list.length, 0, intent.payload.defaultValue);
      break;
    case "remove":
      list.splice(intent.payload.index, 1);
      break;
    case "reorder":
      list.splice(intent.payload.to, 0, ...list.splice(intent.payload.from, 1));
      break;
    default:
      throw new Error("Unknown list intent received");
  }
}
function setListValue(data, intent) {
  setValue(data, intent.payload.name, (value) => {
    var list = value !== null && value !== void 0 ? value : [];
    updateList(list, intent);
    return list;
  });
}
var root = Symbol.for("root");
function setState(state, name, valueFn) {
  var keys2 = Object.keys(state).sort((prev, next) => next.localeCompare(prev));
  var target = {};
  var _loop2 = function _loop22() {
    var value = state[key];
    if (isPrefix(key, name) && key !== name) {
      setValue(target, key, (currentValue) => {
        if (typeof currentValue === "undefined") {
          return value;
        }
        currentValue[root] = value;
        return currentValue;
      });
      delete state[key];
    }
  };
  for (var key of keys2) {
    _loop2();
  }
  var result = valueFn(getValue(target, name));
  Object.assign(
    state,
    // @ts-expect-error FIXME flatten should be more flexible
    flatten(result, {
      resolve(data) {
        if (isPlainObject(data) || Array.isArray(data)) {
          var _data$root;
          return (_data$root = data[root]) !== null && _data$root !== void 0 ? _data$root : null;
        }
        return data;
      },
      prefix: name
    })
  );
}
function setListState(state, intent, getDefaultValue) {
  setState(state, intent.payload.name, (value) => {
    var list = value !== null && value !== void 0 ? value : [];
    switch (intent.type) {
      case "insert":
        updateList(list, {
          type: intent.type,
          payload: _objectSpread2$2(_objectSpread2$2({}, intent.payload), {}, {
            defaultValue: getDefaultValue === null || getDefaultValue === void 0 ? void 0 : getDefaultValue(intent.payload.defaultValue)
          })
        });
        break;
      default:
        updateList(list, intent);
        break;
    }
    return list;
  });
}
function serialize(defaultValue) {
  if (isPlainObject(defaultValue)) {
    return Object.entries(defaultValue).reduce((result, _ref) => {
      var [key, value] = _ref;
      result[key] = serialize(value);
      return result;
    }, {});
  } else if (Array.isArray(defaultValue)) {
    return defaultValue.map(serialize);
  } else if (
    // @ts-ignore-error FIXME
    defaultValue instanceof Date
  ) {
    return defaultValue.toISOString();
  } else if (typeof defaultValue === "boolean") {
    return defaultValue ? "on" : void 0;
  } else if (typeof defaultValue === "number") {
    return defaultValue.toString();
  } else {
    return defaultValue !== null && defaultValue !== void 0 ? defaultValue : void 0;
  }
}
function createFormMeta(options, initialized) {
  var _lastResult$initialVa, _options$constraint, _lastResult$state$val, _lastResult$state, _ref;
  var lastResult = !initialized ? options.lastResult : void 0;
  var defaultValue = options.defaultValue ? serialize(options.defaultValue) : {};
  var initialValue = (_lastResult$initialVa = lastResult === null || lastResult === void 0 ? void 0 : lastResult.initialValue) !== null && _lastResult$initialVa !== void 0 ? _lastResult$initialVa : defaultValue;
  var result = {
    submissionStatus: lastResult === null || lastResult === void 0 ? void 0 : lastResult.status,
    defaultValue,
    initialValue,
    value: initialValue,
    constraint: (_options$constraint = options.constraint) !== null && _options$constraint !== void 0 ? _options$constraint : {},
    validated: (_lastResult$state$val = lastResult === null || lastResult === void 0 || (_lastResult$state = lastResult.state) === null || _lastResult$state === void 0 ? void 0 : _lastResult$state.validated) !== null && _lastResult$state$val !== void 0 ? _lastResult$state$val : {},
    key: !initialized ? getDefaultKey(defaultValue) : _objectSpread2$2({
      "": generateId()
    }, getDefaultKey(defaultValue)),
    // The `lastResult` should comes from the server which we won't expect the error to be null
    // We can consider adding a warning if it happens
    error: (_ref = lastResult === null || lastResult === void 0 ? void 0 : lastResult.error) !== null && _ref !== void 0 ? _ref : {}
  };
  handleIntent(result, lastResult === null || lastResult === void 0 ? void 0 : lastResult.intent, lastResult === null || lastResult === void 0 ? void 0 : lastResult.fields);
  return result;
}
function getDefaultKey(defaultValue, prefix) {
  return Object.entries(flatten(defaultValue, {
    prefix
  })).reduce((result, _ref2) => {
    var [key, value] = _ref2;
    if (Array.isArray(value)) {
      for (var i = 0; i < value.length; i++) {
        result[formatPaths([...getPaths(key), i])] = generateId();
      }
    }
    return result;
  }, {});
}
function setFieldsValidated(meta, fields) {
  for (var _name of Object.keys(meta.error).concat(fields !== null && fields !== void 0 ? fields : [])) {
    meta.validated[_name] = true;
  }
}
function handleIntent(meta, intent, fields, initialized) {
  if (!intent) {
    setFieldsValidated(meta, fields);
    return;
  }
  switch (intent.type) {
    case "validate": {
      if (intent.payload.name) {
        meta.validated[intent.payload.name] = true;
      } else {
        setFieldsValidated(meta, fields);
      }
      break;
    }
    case "update": {
      var {
        name: _name2,
        validated,
        value
      } = intent.payload;
      if (typeof value !== "undefined") {
        updateValue(meta, _name2 !== null && _name2 !== void 0 ? _name2 : "", serialize(value));
      }
      if (typeof validated !== "undefined") {
        if (_name2) {
          setState(meta.validated, _name2, () => void 0);
        } else {
          meta.validated = {};
        }
        if (validated) {
          if (isPlainObject(value) || Array.isArray(value)) {
            Object.assign(meta.validated, flatten(value, {
              resolve() {
                return true;
              },
              prefix: _name2
            }));
          }
          meta.validated[_name2 !== null && _name2 !== void 0 ? _name2 : ""] = true;
        } else if (_name2) {
          delete meta.validated[_name2];
        }
      }
      break;
    }
    case "reset": {
      var _intent$payload$name;
      var _name3 = (_intent$payload$name = intent.payload.name) !== null && _intent$payload$name !== void 0 ? _intent$payload$name : "";
      var _value = getValue(meta.defaultValue, _name3);
      updateValue(meta, _name3, _value);
      if (_name3) {
        setState(meta.validated, _name3, () => void 0);
        delete meta.validated[_name3];
      } else {
        meta.validated = {};
      }
      break;
    }
    case "insert":
    case "remove":
    case "reorder": {
      if (initialized) {
        meta.initialValue = clone(meta.initialValue);
        meta.key = clone(meta.key);
        setListState(meta.key, intent, (defaultValue) => {
          if (!Array.isArray(defaultValue) && !isPlainObject(defaultValue)) {
            return generateId();
          }
          return Object.assign(getDefaultKey(defaultValue), {
            [root]: generateId()
          });
        });
        setListValue(meta.initialValue, intent);
      }
      setListState(meta.validated, intent);
      meta.validated[intent.payload.name] = true;
      break;
    }
  }
  meta.error = Object.entries(meta.error).reduce((result, _ref3) => {
    var [name, error] = _ref3;
    if (meta.validated[name]) {
      result[name] = error;
    }
    return result;
  }, {});
}
function updateValue(meta, name, value) {
  if (name === "") {
    meta.initialValue = value;
    meta.value = value;
    meta.key = getDefaultKey(value);
    return;
  }
  meta.initialValue = clone(meta.initialValue);
  meta.value = clone(meta.value);
  meta.key = clone(meta.key);
  setValue(meta.initialValue, name, () => value);
  setValue(meta.value, name, () => value);
  if (isPlainObject(value) || Array.isArray(value)) {
    setState(meta.key, name, () => void 0);
    Object.assign(meta.key, getDefaultKey(value, name));
  }
  meta.key[name] = generateId();
}
function createStateProxy(fn) {
  var cache = {};
  return new Proxy(cache, {
    get(_, name, receiver) {
      var _cache$name;
      if (typeof name !== "string") {
        return;
      }
      return (_cache$name = cache[name]) !== null && _cache$name !== void 0 ? _cache$name : cache[name] = fn(name, receiver);
    }
  });
}
function createValueProxy(value) {
  var val = normalize(value);
  return createStateProxy((name, proxy) => {
    if (name === "") {
      return val;
    }
    var paths = getPaths(name);
    var basename = formatPaths(paths.slice(0, -1));
    var key = formatPaths(paths.slice(-1));
    var parentValue = proxy[basename];
    return getValue(parentValue, key);
  });
}
function createConstraintProxy(constraint) {
  return createStateProxy((name, proxy) => {
    var _result;
    var result = constraint[name];
    if (!result) {
      var paths = getPaths(name);
      for (var i = paths.length - 1; i >= 0; i--) {
        var path = paths[i];
        if (typeof path === "number" && !Number.isNaN(path)) {
          paths[i] = Number.NaN;
          break;
        }
      }
      var alternative = formatPaths(paths);
      if (name !== alternative) {
        result = proxy[alternative];
      }
    }
    return (_result = result) !== null && _result !== void 0 ? _result : {};
  });
}
function createKeyProxy(key) {
  return createStateProxy((name, proxy) => {
    var currentKey = key[name];
    var paths = getPaths(name);
    if (paths.length === 0) {
      return currentKey;
    }
    var parentKey = proxy[formatPaths(paths.slice(0, -1))];
    if (typeof parentKey === "undefined") {
      return currentKey;
    }
    return "".concat(parentKey, "/").concat(currentKey !== null && currentKey !== void 0 ? currentKey : paths.at(-1));
  });
}
function createValidProxy(error) {
  return createStateProxy((name) => {
    var keys2 = Object.keys(error);
    if (name === "") {
      return keys2.length === 0;
    }
    for (var key of keys2) {
      if (isPrefix(key, name) && typeof error[key] !== "undefined") {
        return false;
      }
    }
    return true;
  });
}
function createDirtyProxy(defaultValue, value, shouldDirtyConsider) {
  return createStateProxy((name) => JSON.stringify(defaultValue[name]) !== JSON.stringify(value[name], (key, value2) => {
    if (name === "" && key === "" && value2) {
      return Object.entries(value2).reduce((result, _ref4) => {
        var [name2, value3] = _ref4;
        if (!shouldDirtyConsider(name2)) {
          return result;
        }
        return Object.assign(result !== null && result !== void 0 ? result : {}, {
          [name2]: value3
        });
      }, void 0);
    }
    return value2;
  }));
}
function shouldNotify(prev, next, cache, scope) {
  var compareFn = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : (prev2, next2) => JSON.stringify(prev2) !== JSON.stringify(next2);
  if (scope && prev !== next) {
    var _scope$prefix, _scope$name;
    var prefixes = (_scope$prefix = scope.prefix) !== null && _scope$prefix !== void 0 ? _scope$prefix : [];
    var names = (_scope$name = scope.name) !== null && _scope$name !== void 0 ? _scope$name : [];
    var list = prefixes.length === 0 ? names : Array.from(/* @__PURE__ */ new Set([...Object.keys(prev), ...Object.keys(next)]));
    var _loop = function _loop2(_name42) {
      if (prefixes.length === 0 || names.includes(_name42) || prefixes.some((prefix) => isPrefix(_name42, prefix))) {
        var _cache$_name;
        (_cache$_name = cache[_name42]) !== null && _cache$_name !== void 0 ? _cache$_name : cache[_name42] = compareFn(prev[_name42], next[_name42]);
        if (cache[_name42]) {
          return {
            v: true
          };
        }
      }
    }, _ret;
    for (var _name4 of list) {
      _ret = _loop(_name4);
      if (_ret)
        return _ret.v;
    }
  }
  return false;
}
function createFormContext$1(options) {
  var subscribers = [];
  var latestOptions = options;
  var meta = createFormMeta(options);
  var state = createFormState(meta);
  function getFormElement() {
    return document.forms.namedItem(latestOptions.formId);
  }
  function createFormState(next) {
    var prev = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : next;
    var state2 = arguments.length > 2 ? arguments[2] : void 0;
    var defaultValue = !state2 || prev.defaultValue !== next.defaultValue ? createValueProxy(next.defaultValue) : state2.defaultValue;
    var initialValue = next.initialValue === next.defaultValue ? defaultValue : !state2 || prev.initialValue !== next.initialValue ? createValueProxy(next.initialValue) : state2.initialValue;
    var value = next.value === next.initialValue ? initialValue : !state2 || prev.value !== next.value ? createValueProxy(next.value) : state2.value;
    return {
      submissionStatus: next.submissionStatus,
      defaultValue,
      initialValue,
      value,
      error: !state2 || prev.error !== next.error ? next.error : state2.error,
      validated: next.validated,
      constraint: !state2 || prev.constraint !== next.constraint ? createConstraintProxy(next.constraint) : state2.constraint,
      key: !state2 || prev.key !== next.key ? createKeyProxy(next.key) : state2.key,
      valid: !state2 || prev.error !== next.error ? createValidProxy(next.error) : state2.valid,
      dirty: !state2 || prev.defaultValue !== next.defaultValue || prev.value !== next.value ? createDirtyProxy(defaultValue, value, (key) => {
        var _latestOptions$should, _latestOptions$should2;
        return (_latestOptions$should = (_latestOptions$should2 = latestOptions.shouldDirtyConsider) === null || _latestOptions$should2 === void 0 ? void 0 : _latestOptions$should2.call(latestOptions, key)) !== null && _latestOptions$should !== void 0 ? _latestOptions$should : true;
      }) : state2.dirty
    };
  }
  function updateFormMeta(nextMeta) {
    var prevMeta = meta;
    var prevState = state;
    var nextState = createFormState(nextMeta, prevMeta, prevState);
    meta = nextMeta;
    state = nextState;
    var cache = {
      value: {},
      error: {},
      initialValue: {},
      key: {},
      valid: {},
      dirty: {}
    };
    for (var subscriber of subscribers) {
      var _subscriber$getSubjec;
      var subject = (_subscriber$getSubjec = subscriber.getSubject) === null || _subscriber$getSubjec === void 0 ? void 0 : _subscriber$getSubjec.call(subscriber);
      if (!subject || subject.status && prevState.submissionStatus !== nextState.submissionStatus || shouldNotify(prevState.error, nextState.error, cache.error, subject.error) || shouldNotify(prevState.initialValue, nextState.initialValue, cache.initialValue, subject.initialValue) || shouldNotify(prevState.key, nextState.key, cache.key, subject.key, (prev, next) => prev !== next) || shouldNotify(prevState.valid, nextState.valid, cache.valid, subject.valid, compareBoolean) || shouldNotify(prevState.dirty, nextState.dirty, cache.dirty, subject.dirty, compareBoolean) || shouldNotify(prevState.value, nextState.value, cache.value, subject.value)) {
        subscriber.callback();
      }
    }
  }
  function compareBoolean() {
    var prev = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : false;
    var next = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
    return prev !== next;
  }
  function getSerializedState() {
    return JSON.stringify({
      validated: meta.validated
    });
  }
  function submit(event) {
    var form = event.target;
    var submitter = event.submitter;
    invariant(form === getFormElement(), "The submit event is dispatched by form#".concat(form.id, " instead of form#").concat(latestOptions.formId));
    var formData = getFormData(form, submitter);
    var result = {
      formData,
      action: getFormAction(event),
      encType: getFormEncType(event),
      method: getFormMethod(event)
    };
    if (typeof (latestOptions === null || latestOptions === void 0 ? void 0 : latestOptions.onValidate) === "undefined") {
      return result;
    }
    var submission = latestOptions.onValidate({
      form,
      formData,
      submitter
    });
    if (submission.status !== "success" && submission.error !== null) {
      report(submission.reply());
    }
    return _objectSpread2$2(_objectSpread2$2({}, result), {}, {
      submission
    });
  }
  function resolveTarget(event) {
    var form = getFormElement();
    var element = event.target;
    if (!form || !isFieldElement(element) || element.form !== form || !element.form.isConnected || element.name === "") {
      return null;
    }
    return element;
  }
  function willValidate(element, eventName) {
    var {
      shouldValidate = "onSubmit",
      shouldRevalidate = shouldValidate
    } = latestOptions;
    var validated = meta.validated[element.name];
    return validated ? shouldRevalidate === eventName : shouldValidate === eventName;
  }
  function onInput(event) {
    var element = resolveTarget(event);
    if (!element || !element.form) {
      return;
    }
    if (event.defaultPrevented || !willValidate(element, "onInput")) {
      var formData = new FormData(element.form);
      var result = getSubmissionContext(formData);
      updateFormMeta(_objectSpread2$2(_objectSpread2$2({}, meta), {}, {
        value: result.payload
      }));
    } else {
      dispatch({
        type: "validate",
        payload: {
          name: element.name
        }
      });
    }
  }
  function onBlur(event) {
    var element = resolveTarget(event);
    if (!element || event.defaultPrevented || !willValidate(element, "onBlur")) {
      return;
    }
    dispatch({
      type: "validate",
      payload: {
        name: element.name
      }
    });
  }
  function onReset(event) {
    var element = getFormElement();
    if (event.type !== "reset" || event.target !== element || event.defaultPrevented) {
      return;
    }
    updateFormMeta(createFormMeta(latestOptions, true));
  }
  function report(result) {
    var _result$error, _result$state;
    var formElement = getFormElement();
    if (!result.initialValue) {
      formElement === null || formElement === void 0 || formElement.reset();
      return;
    }
    var error = Object.entries((_result$error = result.error) !== null && _result$error !== void 0 ? _result$error : {}).reduce((result2, _ref5) => {
      var [name, newError] = _ref5;
      var error2 = newError === null ? meta.error[name] : newError;
      if (error2) {
        result2[name] = error2;
      }
      return result2;
    }, {});
    var update = _objectSpread2$2(_objectSpread2$2({}, meta), {}, {
      submissionStatus: result.status,
      value: result.initialValue,
      validated: _objectSpread2$2(_objectSpread2$2({}, meta.validated), (_result$state = result.state) === null || _result$state === void 0 ? void 0 : _result$state.validated),
      error
    });
    handleIntent(update, result.intent, result.fields, true);
    updateFormMeta(update);
    if (formElement && result.status === "error") {
      for (var element of formElement.elements) {
        if (isFieldElement(element) && meta.error[element.name]) {
          element.focus();
          break;
        }
      }
    }
  }
  function onUpdate(options2) {
    var currentFormId = latestOptions.formId;
    var currentResult = latestOptions.lastResult;
    Object.assign(latestOptions, options2);
    if (latestOptions.formId !== currentFormId) {
      var _getFormElement;
      (_getFormElement = getFormElement()) === null || _getFormElement === void 0 || _getFormElement.reset();
    } else if (options2.lastResult && options2.lastResult !== currentResult) {
      report(options2.lastResult);
    }
  }
  function subscribe(callback, getSubject) {
    var subscriber = {
      callback,
      getSubject
    };
    subscribers.push(subscriber);
    return () => {
      subscribers = subscribers.filter((current) => current !== subscriber);
    };
  }
  function getState() {
    return state;
  }
  function dispatch(intent) {
    var form = getFormElement();
    var submitter = document.createElement("button");
    var buttonProps = getControlButtonProps(intent);
    submitter.name = buttonProps.name;
    submitter.value = buttonProps.value;
    submitter.hidden = true;
    submitter.formNoValidate = true;
    form === null || form === void 0 || form.appendChild(submitter);
    requestSubmit(form, submitter);
    form === null || form === void 0 || form.removeChild(submitter);
  }
  function getControlButtonProps(intent) {
    return {
      name: INTENT,
      value: serializeIntent(intent),
      form: latestOptions.formId,
      formNoValidate: true
    };
  }
  function createFormControl(type) {
    var control = function control2() {
      var payload = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      return dispatch({
        type,
        payload
      });
    };
    return Object.assign(control, {
      getButtonProps() {
        var payload = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        return getControlButtonProps({
          type,
          payload
        });
      }
    });
  }
  return {
    get formId() {
      return latestOptions.formId;
    },
    submit,
    onReset,
    onInput,
    onBlur,
    onUpdate,
    validate: createFormControl("validate"),
    reset: createFormControl("reset"),
    update: createFormControl("update"),
    insert: createFormControl("insert"),
    remove: createFormControl("remove"),
    reorder: createFormControl("reorder"),
    subscribe,
    getState,
    getSerializedState
  };
}
function ownKeys$1(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2$1(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys$1(Object(t), true).forEach(function(r2) {
      _defineProperty$1(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function _defineProperty$1(obj, key, value) {
  key = _toPropertyKey$1(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null)
    return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0)
      continue;
    target[key] = source[key];
  }
  return target;
}
function _objectWithoutProperties(source, excluded) {
  if (source == null)
    return {};
  var target = _objectWithoutPropertiesLoose(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0)
        continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key))
        continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _toPrimitive$1(input, hint) {
  if (typeof input !== "object" || input === null)
    return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (typeof res !== "object")
      return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
function _toPropertyKey$1(arg) {
  var key = _toPrimitive$1(arg, "string");
  return typeof key === "symbol" ? key : String(key);
}
var _excluded$1 = ["onSubmit"];
var wrappedSymbol = Symbol("wrapped");
function useFormState(form, subjectRef) {
  var subscribe = reactExports.useCallback((callback) => form.subscribe(callback, () => subjectRef === null || subjectRef === void 0 ? void 0 : subjectRef.current), [form, subjectRef]);
  return reactExports.useSyncExternalStore(subscribe, form.getState, form.getState);
}
function useSubjectRef() {
  var initialSubject = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
  var subjectRef = reactExports.useRef(initialSubject);
  subjectRef.current = initialSubject;
  return subjectRef;
}
function updateSubjectRef(ref, name, subject, scope) {
  if (subject === "status") {
    ref.current[subject] = true;
  } else {
    var _ref$current$subject$, _ref$current$subject;
    ref.current[subject] = _objectSpread2$1(_objectSpread2$1({}, ref.current[subject]), {}, {
      [scope]: ((_ref$current$subject$ = (_ref$current$subject = ref.current[subject]) === null || _ref$current$subject === void 0 ? void 0 : _ref$current$subject[scope]) !== null && _ref$current$subject$ !== void 0 ? _ref$current$subject$ : []).concat(name)
    });
  }
}
function getMetadata(formId, state, subjectRef) {
  var name = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "";
  var id = name ? "".concat(formId, "-").concat(name) : formId;
  return new Proxy({
    id,
    name,
    errorId: "".concat(id, "-error"),
    descriptionId: "".concat(id, "-description"),
    get initialValue() {
      return state.initialValue[name];
    },
    get value() {
      return state.value[name];
    },
    get errors() {
      return state.error[name];
    },
    get key() {
      return state.key[name];
    },
    get valid() {
      return state.valid[name];
    },
    get dirty() {
      return state.dirty[name];
    },
    get allErrors() {
      if (name === "") {
        return state.error;
      }
      var result = {};
      for (var [key, error] of Object.entries(state.error)) {
        if (isPrefix(key, name)) {
          result[key] = error;
        }
      }
      return result;
    },
    get getFieldset() {
      return () => new Proxy({}, {
        get(target, key, receiver) {
          if (typeof key === "string") {
            return getFieldMetadata(formId, state, subjectRef, name, key);
          }
          return Reflect.get(target, key, receiver);
        }
      });
    }
  }, {
    get(target, key, receiver) {
      switch (key) {
        case "key":
        case "initialValue":
        case "value":
        case "valid":
        case "dirty":
          updateSubjectRef(subjectRef, name, key, "name");
          break;
        case "errors":
        case "allErrors":
          updateSubjectRef(subjectRef, name, "error", key === "errors" ? "name" : "prefix");
          break;
      }
      return Reflect.get(target, key, receiver);
    }
  });
}
function getFieldMetadata(formId, state, subjectRef) {
  var prefix = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "";
  var key = arguments.length > 4 ? arguments[4] : void 0;
  var name = typeof key === "undefined" ? prefix : formatPaths([...getPaths(prefix), key]);
  var metadata = getMetadata(formId, state, subjectRef, name);
  return new Proxy({}, {
    get(_, key2, receiver) {
      var _state$constraint$nam;
      switch (key2) {
        case "formId":
          return formId;
        case "required":
        case "minLength":
        case "maxLength":
        case "min":
        case "max":
        case "pattern":
        case "step":
        case "multiple":
          return (_state$constraint$nam = state.constraint[name]) === null || _state$constraint$nam === void 0 ? void 0 : _state$constraint$nam[key2];
        case "getFieldList": {
          return () => {
            var _state$initialValue$n;
            var initialValue = (_state$initialValue$n = state.initialValue[name]) !== null && _state$initialValue$n !== void 0 ? _state$initialValue$n : [];
            updateSubjectRef(subjectRef, name, "initialValue", "name");
            if (!Array.isArray(initialValue)) {
              throw new Error("The initial value at the given name is not a list");
            }
            return Array(initialValue.length).fill(0).map((_2, index) => getFieldMetadata(formId, state, subjectRef, name, index));
          };
        }
      }
      return Reflect.get(metadata, key2, receiver);
    }
  });
}
function getFormMetadata(formId, state, subjectRef, context, noValidate) {
  var metadata = getMetadata(formId, state, subjectRef);
  return new Proxy({}, {
    get(_, key, receiver) {
      switch (key) {
        case "context":
          return {
            [wrappedSymbol]: context
          };
        case "status":
          return state.submissionStatus;
        case "validate":
        case "update":
        case "reset":
        case "insert":
        case "remove":
        case "reorder":
          return context[key];
        case "onSubmit":
          return context.submit;
        case "noValidate":
          return noValidate;
      }
      return Reflect.get(metadata, key, receiver);
    }
  });
}
function createFormContext(options) {
  var {
    onSubmit
  } = options, rest = _objectWithoutProperties(options, _excluded$1);
  var context = createFormContext$1(rest);
  return _objectSpread2$1(_objectSpread2$1({}, context), {}, {
    submit(event) {
      var submitEvent = event.nativeEvent;
      var result = context.submit(submitEvent);
      if (result.submission && result.submission.status !== "success" && result.submission.error !== null) {
        event.preventDefault();
      } else {
        var _onSubmit;
        (_onSubmit = onSubmit) === null || _onSubmit === void 0 || _onSubmit(event, result);
      }
    },
    onUpdate(options2) {
      onSubmit = options2.onSubmit;
      context.onUpdate(options2);
    }
  });
}
var _excluded = ["id"];
var useSafeLayoutEffect = typeof document === "undefined" ? reactExports.useEffect : reactExports.useLayoutEffect;
function useFormId(preferredId) {
  var id = reactExports.useId();
  return preferredId !== null && preferredId !== void 0 ? preferredId : id;
}
function useNoValidate() {
  var defaultNoValidate = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : true;
  var [noValidate, setNoValidate] = reactExports.useState(defaultNoValidate);
  useSafeLayoutEffect(() => {
    if (!noValidate) {
      setNoValidate(true);
    }
  }, [noValidate]);
  return noValidate;
}
function useForm(options) {
  var {
    id
  } = options, formConfig = _objectWithoutProperties(options, _excluded);
  var formId = useFormId(id);
  var [context] = reactExports.useState(() => createFormContext(_objectSpread2$1(_objectSpread2$1({}, formConfig), {}, {
    formId
  })));
  useSafeLayoutEffect(() => {
    document.addEventListener("input", context.onInput);
    document.addEventListener("focusout", context.onBlur);
    document.addEventListener("reset", context.onReset);
    return () => {
      document.removeEventListener("input", context.onInput);
      document.removeEventListener("focusout", context.onBlur);
      document.removeEventListener("reset", context.onReset);
    };
  }, [context]);
  useSafeLayoutEffect(() => {
    context.onUpdate(_objectSpread2$1(_objectSpread2$1({}, formConfig), {}, {
      formId
    }));
  });
  var subjectRef = useSubjectRef();
  var state = useFormState(context, subjectRef);
  var noValidate = useNoValidate(options.defaultNoValidate);
  var form = getFormMetadata(formId, state, subjectRef, context, noValidate);
  return [form, form.getFieldset()];
}
function simplify(props) {
  for (var key in props) {
    if (props[key] === void 0) {
      delete props[key];
    }
  }
  return props;
}
function getAriaAttributes(metadata) {
  var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
  if (typeof options.ariaAttributes !== "undefined" && !options.ariaAttributes) {
    return {};
  }
  var invalid = options.ariaInvalid === "allErrors" ? !metadata.valid : typeof metadata.errors !== "undefined";
  var ariaDescribedBy = options.ariaDescribedBy;
  return simplify({
    "aria-invalid": invalid || void 0,
    "aria-describedby": invalid ? "".concat(metadata.errorId, " ").concat(ariaDescribedBy !== null && ariaDescribedBy !== void 0 ? ariaDescribedBy : "").trim() : ariaDescribedBy
  });
}
function getFormProps(metadata, options) {
  return simplify(_objectSpread2$1({
    id: metadata.id,
    onSubmit: metadata.onSubmit,
    noValidate: metadata.noValidate
  }, getAriaAttributes(metadata, options)));
}
var util;
(function(util2) {
  util2.assertEqual = (val) => val;
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys2 = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys2.push(key);
      }
    }
    return keys2;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
const ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
const getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};
const ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
const quotelessJson = (obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
};
class ZodError extends Error {
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  get errors() {
    return this.issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
        fieldErrors[sub.path[0]].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
}
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};
const errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
let overrideErrorMap = errorMap;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}
const makeIssue = (params) => {
  const { data, path, errorMaps, issueData } = params;
  const fullPath = [...path, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: issueData.message || errorMessage
  };
};
const EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      ctx.schemaErrorMap,
      getErrorMap(),
      errorMap
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
class ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      syncPairs.push({
        key: await pair.key,
        value: await pair.value
      });
    }
    return ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
}
const INVALID = Object.freeze({
  status: "aborted"
});
const DIRTY = (value) => ({ status: "dirty", value });
const OK = (value) => ({ status: "valid", value });
const isAborted = (x) => x.status === "aborted";
const isDirty = (x) => x.status === "dirty";
const isValid = (x) => x.status === "valid";
const isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message === null || message === void 0 ? void 0 : message.message;
})(errorUtil || (errorUtil = {}));
class ParseInputLazyPath {
  constructor(parent, value, path, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (this._key instanceof Array) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
}
const handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    if (typeof ctx.data === "undefined") {
      return { message: required_error !== null && required_error !== void 0 ? required_error : ctx.defaultError };
    }
    return { message: invalid_type_error !== null && invalid_type_error !== void 0 ? invalid_type_error : ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
class ZodType {
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
  }
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    var _a;
    const ctx = {
      common: {
        issues: [],
        async: (_a = params === null || params === void 0 ? void 0 : params.async) !== null && _a !== void 0 ? _a : false,
        contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap
      },
      path: (params === null || params === void 0 ? void 0 : params.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap,
        async: true
      },
      path: (params === null || params === void 0 ? void 0 : params.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this, this._def);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
const cuidRegex = /^c[^\s-]{8,}$/i;
const cuid2Regex = /^[a-z][a-z0-9]*$/;
const ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/;
const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
const emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_+-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
const _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
let emojiRegex;
const ipv4Regex = /^(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))$/;
const ipv6Regex = /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/;
const datetimeRegex = (args) => {
  if (args.precision) {
    if (args.offset) {
      return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${args.precision}}(([+-]\\d{2}(:?\\d{2})?)|Z)$`);
    } else {
      return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${args.precision}}Z$`);
    }
  } else if (args.precision === 0) {
    if (args.offset) {
      return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(([+-]\\d{2}(:?\\d{2})?)|Z)$`);
    } else {
      return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$`);
    }
  } else {
    if (args.offset) {
      return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?(([+-]\\d{2}(:?\\d{2})?)|Z)$`);
    } else {
      return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?Z$`);
    }
  }
};
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
class ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(
        ctx2,
        {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.string,
          received: ctx2.parsedType
        }
        //
      );
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch (_a) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    var _a;
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof (options === null || options === void 0 ? void 0 : options.precision) === "undefined" ? null : options === null || options === void 0 ? void 0 : options.precision,
      offset: (_a = options === null || options === void 0 ? void 0 : options.offset) !== null && _a !== void 0 ? _a : false,
      ...errorUtil.errToObj(options === null || options === void 0 ? void 0 : options.message)
    });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options === null || options === void 0 ? void 0 : options.position,
      ...errorUtil.errToObj(options === null || options === void 0 ? void 0 : options.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * @deprecated Use z.string().min(1) instead.
   * @see {@link ZodString.min}
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
}
ZodString.create = (params) => {
  var _a;
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: (_a = params === null || params === void 0 ? void 0 : params.coerce) !== null && _a !== void 0 ? _a : false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / Math.pow(10, decCount);
}
class ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null, min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
}
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
    ...processCreateParams(params)
  });
};
class ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = BigInt(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.bigint,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
}
ZodBigInt.create = (params) => {
  var _a;
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: (_a = params === null || params === void 0 ? void 0 : params.coerce) !== null && _a !== void 0 ? _a : false,
    ...processCreateParams(params)
  });
};
class ZodBoolean extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
    ...processCreateParams(params)
  });
};
class ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
}
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
class ZodSymbol extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
class ZodUndefined extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
class ZodNull extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
class ZodAny extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
}
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
class ZodUnknown extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
}
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
class ZodNever extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
}
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
class ZodVoid extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
class ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
}
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
class ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys2 = util.objectKeys(shape);
    return this._cached = { shape, keys: keys2 };
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip")
        ;
      else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          syncPairs.push({
            key,
            value: await pair.value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: (issue, ctx) => {
          var _a, _b, _c, _d;
          const defaultError = (_c = (_b = (_a = this._def).errorMap) === null || _b === void 0 ? void 0 : _b.call(_a, issue, ctx).message) !== null && _c !== void 0 ? _c : ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: (_d = errorUtil.errToObj(message).message) !== null && _d !== void 0 ? _d : defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    util.objectKeys(mask).forEach((key) => {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    });
    return new ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    util.objectKeys(this.shape).forEach((key) => {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    });
    return new ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    util.objectKeys(this.shape).forEach((key) => {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    });
    return new ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    util.objectKeys(this.shape).forEach((key) => {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    });
    return new ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
}
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
class ZodUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
}
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
const getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return Object.keys(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else {
    return null;
  }
};
class ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
}
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
class ZodIntersection extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
}
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
class ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new ZodTuple({
      ...this._def,
      rest
    });
  }
}
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
class ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key))
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
}
class ZodMap extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
}
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
class ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
}
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
class ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [
          ctx.common.contextualErrorMap,
          ctx.schemaErrorMap,
          getErrorMap(),
          errorMap
        ].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [
          ctx.common.contextualErrorMap,
          ctx.schemaErrorMap,
          getErrorMap(),
          errorMap
        ].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
}
class ZodLazy extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
}
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
class ZodLiteral extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
}
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
class ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (this._def.values.indexOf(input.data) === -1) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values) {
    return ZodEnum.create(values);
  }
  exclude(values) {
    return ZodEnum.create(this.options.filter((opt) => !values.includes(opt)));
  }
}
ZodEnum.create = createZodEnum;
class ZodNativeEnum extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (nativeEnumValues.indexOf(input.data) === -1) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
}
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
class ZodPromise extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
}
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
class ZodEffects extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.issues.length) {
        return {
          status: "dirty",
          value: ctx.data
        };
      }
      if (ctx.common.async) {
        return Promise.resolve(processed).then((processed2) => {
          return this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
        });
      } else {
        return this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return base;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return base;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({ status: status.value, value: result }));
        });
      }
    }
    util.assertNever(effect);
  }
}
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
class ZodOptional extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
class ZodNullable extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
class ZodDefault extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
}
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
class ZodCatch extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
}
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
class ZodNaN extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
}
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
const BRAND = Symbol("zod_brand");
class ZodBranded extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
}
class ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
}
class ZodReadonly extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    if (isValid(result)) {
      result.value = Object.freeze(result.value);
    }
    return result;
  }
}
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
const custom = (check, params = {}, fatal) => {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      var _a, _b;
      if (!check(data)) {
        const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
        const _fatal = (_b = (_a = p.fatal) !== null && _a !== void 0 ? _a : fatal) !== null && _b !== void 0 ? _b : true;
        const p2 = typeof p === "string" ? { message: p } : p;
        ctx.addIssue({ code: "custom", ...p2, fatal: _fatal });
      }
    });
  return ZodAny.create();
};
const late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
const instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
const stringType = ZodString.create;
const numberType = ZodNumber.create;
const nanType = ZodNaN.create;
const bigIntType = ZodBigInt.create;
const booleanType = ZodBoolean.create;
const dateType = ZodDate.create;
const symbolType = ZodSymbol.create;
const undefinedType = ZodUndefined.create;
const nullType = ZodNull.create;
const anyType = ZodAny.create;
const unknownType = ZodUnknown.create;
const neverType = ZodNever.create;
const voidType = ZodVoid.create;
const arrayType = ZodArray.create;
const objectType = ZodObject.create;
const strictObjectType = ZodObject.strictCreate;
const unionType = ZodUnion.create;
const discriminatedUnionType = ZodDiscriminatedUnion.create;
const intersectionType = ZodIntersection.create;
const tupleType = ZodTuple.create;
const recordType = ZodRecord.create;
const mapType = ZodMap.create;
const setType = ZodSet.create;
const functionType = ZodFunction.create;
const lazyType = ZodLazy.create;
const literalType = ZodLiteral.create;
const enumType = ZodEnum.create;
const nativeEnumType = ZodNativeEnum.create;
const promiseType = ZodPromise.create;
const effectsType = ZodEffects.create;
const optionalType = ZodOptional.create;
const nullableType = ZodNullable.create;
const preprocessType = ZodEffects.createWithPreprocess;
const pipelineType = ZodPipeline.create;
const ostring = () => stringType().optional();
const onumber = () => numberType().optional();
const oboolean = () => booleanType().optional();
const coerce = {
  string: (arg) => ZodString.create({ ...arg, coerce: true }),
  number: (arg) => ZodNumber.create({ ...arg, coerce: true }),
  boolean: (arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  }),
  bigint: (arg) => ZodBigInt.create({ ...arg, coerce: true }),
  date: (arg) => ZodDate.create({ ...arg, coerce: true })
};
const NEVER = INVALID;
var z = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  defaultErrorMap: errorMap,
  setErrorMap,
  getErrorMap,
  makeIssue,
  EMPTY_PATH,
  addIssueToContext,
  ParseStatus,
  INVALID,
  DIRTY,
  OK,
  isAborted,
  isDirty,
  isValid,
  isAsync,
  get util() {
    return util;
  },
  get objectUtil() {
    return objectUtil;
  },
  ZodParsedType,
  getParsedType,
  ZodType,
  ZodString,
  ZodNumber,
  ZodBigInt,
  ZodBoolean,
  ZodDate,
  ZodSymbol,
  ZodUndefined,
  ZodNull,
  ZodAny,
  ZodUnknown,
  ZodNever,
  ZodVoid,
  ZodArray,
  ZodObject,
  ZodUnion,
  ZodDiscriminatedUnion,
  ZodIntersection,
  ZodTuple,
  ZodRecord,
  ZodMap,
  ZodSet,
  ZodFunction,
  ZodLazy,
  ZodLiteral,
  ZodEnum,
  ZodNativeEnum,
  ZodPromise,
  ZodEffects,
  ZodTransformer: ZodEffects,
  ZodOptional,
  ZodNullable,
  ZodDefault,
  ZodCatch,
  ZodNaN,
  BRAND,
  ZodBranded,
  ZodPipeline,
  ZodReadonly,
  custom,
  Schema: ZodType,
  ZodSchema: ZodType,
  late,
  get ZodFirstPartyTypeKind() {
    return ZodFirstPartyTypeKind;
  },
  coerce,
  any: anyType,
  array: arrayType,
  bigint: bigIntType,
  boolean: booleanType,
  date: dateType,
  discriminatedUnion: discriminatedUnionType,
  effect: effectsType,
  "enum": enumType,
  "function": functionType,
  "instanceof": instanceOfType,
  intersection: intersectionType,
  lazy: lazyType,
  literal: literalType,
  map: mapType,
  nan: nanType,
  nativeEnum: nativeEnumType,
  never: neverType,
  "null": nullType,
  nullable: nullableType,
  number: numberType,
  object: objectType,
  oboolean,
  onumber,
  optional: optionalType,
  ostring,
  pipeline: pipelineType,
  preprocess: preprocessType,
  promise: promiseType,
  record: recordType,
  set: setType,
  strictObject: strictObjectType,
  string: stringType,
  symbol: symbolType,
  transformer: effectsType,
  tuple: tupleType,
  "undefined": undefinedType,
  union: unionType,
  unknown: unknownType,
  "void": voidType,
  NEVER,
  ZodIssueCode,
  quotelessJson,
  ZodError
});
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
      _defineProperty(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPrimitive(input, hint) {
  if (typeof input !== "object" || input === null)
    return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (typeof res !== "object")
      return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return typeof key === "symbol" ? key : String(key);
}
var keys = ["required", "minLength", "maxLength", "min", "max", "step", "multiple", "pattern"];
function getZodConstraint(schema) {
  function updateConstraint(schema2, data) {
    var _data$name;
    var name = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "";
    var constraint = name !== "" ? (_data$name = data[name]) !== null && _data$name !== void 0 ? _data$name : data[name] = {
      required: true
    } : {};
    if (schema2 instanceof ZodObject) {
      for (var key in schema2.shape) {
        updateConstraint(schema2.shape[key], data, name ? "".concat(name, ".").concat(key) : key);
      }
    } else if (schema2 instanceof ZodEffects) {
      updateConstraint(schema2.innerType(), data, name);
    } else if (schema2 instanceof ZodPipeline) {
      updateConstraint(schema2._def.out, data, name);
    } else if (schema2 instanceof ZodIntersection) {
      var leftResult = {};
      var rightResult = {};
      updateConstraint(schema2._def.left, leftResult, name);
      updateConstraint(schema2._def.right, rightResult, name);
      Object.assign(data, leftResult, rightResult);
    } else if (schema2 instanceof ZodUnion || schema2 instanceof ZodDiscriminatedUnion) {
      Object.assign(data, schema2.options.map((option) => {
        var result2 = {};
        updateConstraint(option, result2, name);
        return result2;
      }).reduce((prev, next) => {
        var list = /* @__PURE__ */ new Set([...Object.keys(prev), ...Object.keys(next)]);
        var result2 = {};
        for (var _name of list) {
          var prevConstraint = prev[_name];
          var nextConstraint = next[_name];
          if (prevConstraint && nextConstraint) {
            var _constraint = {};
            result2[_name] = _constraint;
            for (var _key of keys) {
              if (typeof prevConstraint[_key] !== "undefined" && typeof nextConstraint[_key] !== "undefined" && prevConstraint[_key] === nextConstraint[_key]) {
                _constraint[_key] = prevConstraint[_key];
              }
            }
          } else {
            result2[_name] = _objectSpread2(_objectSpread2(_objectSpread2({}, prevConstraint), nextConstraint), {}, {
              required: false
            });
          }
        }
        return result2;
      }));
    } else if (name === "") {
      throw new Error("Unsupported schema");
    } else if (schema2 instanceof ZodArray) {
      constraint.multiple = true;
      updateConstraint(schema2.element, data, "".concat(name, "[]"));
    } else if (schema2 instanceof ZodString) {
      if (schema2.minLength !== null) {
        constraint.minLength = schema2.minLength;
      }
      if (schema2.maxLength !== null) {
        constraint.maxLength = schema2.maxLength;
      }
    } else if (schema2 instanceof ZodOptional) {
      constraint.required = false;
      updateConstraint(schema2.unwrap(), data, name);
    } else if (schema2 instanceof ZodDefault) {
      constraint.required = false;
      updateConstraint(schema2.removeDefault(), data, name);
    } else if (schema2 instanceof ZodNumber) {
      if (schema2.minValue !== null) {
        constraint.min = schema2.minValue;
      }
      if (schema2.maxValue !== null) {
        constraint.max = schema2.maxValue;
      }
    } else if (schema2 instanceof ZodEnum) {
      constraint.pattern = schema2.options.map((option) => (
        // To escape unsafe characters on regex
        option.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d")
      )).join("|");
    } else if (schema2 instanceof ZodTuple) {
      for (var i = 0; i < schema2.items.length; i++) {
        updateConstraint(schema2.items[i], data, "".concat(name, "[").concat(i, "]"));
      }
    } else
      ;
  }
  var result = {};
  updateConstraint(schema, result);
  return result;
}
function coerceString(value, transform) {
  if (typeof value !== "string") {
    return value;
  }
  if (value === "") {
    return void 0;
  }
  if (typeof transform !== "function") {
    return value;
  }
  return transform(value);
}
function coerceFile(file) {
  if (typeof File !== "undefined" && file instanceof File && file.name === "" && file.size === 0) {
    return void 0;
  }
  return file;
}
function isFileSchema(schema) {
  if (typeof File === "undefined") {
    return false;
  }
  return schema._def.effect.type === "refinement" && schema.innerType() instanceof ZodAny && schema.safeParse(new File([], "")).success && !schema.safeParse("").success;
}
function enableTypeCoercion(type) {
  var cache = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : /* @__PURE__ */ new Map();
  var result = cache.get(type);
  if (result) {
    return result;
  }
  var schema = type;
  if (type instanceof ZodString || type instanceof ZodLiteral || type instanceof ZodEnum || type instanceof ZodNativeEnum) {
    schema = anyType().transform((value) => coerceString(value)).pipe(type);
  } else if (type instanceof ZodNumber) {
    schema = anyType().transform((value) => coerceString(value, (text) => text.trim() === "" ? Number.NaN : Number(text))).pipe(type);
  } else if (type instanceof ZodBoolean) {
    schema = anyType().transform((value) => coerceString(value, (text) => text === "on" ? true : text)).pipe(type);
  } else if (type instanceof ZodDate) {
    schema = anyType().transform((value) => coerceString(value, (timestamp) => {
      var date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return timestamp;
      }
      return date;
    })).pipe(type);
  } else if (type instanceof ZodBigInt) {
    schema = anyType().transform((value) => coerceString(value, BigInt)).pipe(type);
  } else if (type instanceof ZodArray) {
    schema = anyType().transform((value) => {
      if (Array.isArray(value)) {
        return value;
      }
      if (typeof value === "undefined" || typeof coerceFile(coerceString(value)) === "undefined") {
        return [];
      }
      return [value];
    }).pipe(new ZodArray(_objectSpread2(_objectSpread2({}, type._def), {}, {
      type: enableTypeCoercion(type.element, cache)
    })));
  } else if (type instanceof ZodObject) {
    var _shape = Object.fromEntries(Object.entries(type.shape).map((_ref) => {
      var [key, def] = _ref;
      return [
        key,
        // @ts-expect-error see message above
        enableTypeCoercion(def, cache)
      ];
    }));
    schema = new ZodObject(_objectSpread2(_objectSpread2({}, type._def), {}, {
      shape: () => _shape
    }));
  } else if (type instanceof ZodEffects) {
    if (isFileSchema(type)) {
      schema = anyType().transform((value) => coerceFile(value)).pipe(type);
    } else {
      schema = new ZodEffects(_objectSpread2(_objectSpread2({}, type._def), {}, {
        schema: enableTypeCoercion(type.innerType(), cache)
      }));
    }
  } else if (type instanceof ZodOptional) {
    schema = anyType().transform((value) => coerceFile(coerceString(value))).pipe(new ZodOptional(_objectSpread2(_objectSpread2({}, type._def), {}, {
      innerType: enableTypeCoercion(type.unwrap(), cache)
    })));
  } else if (type instanceof ZodDefault) {
    schema = anyType().transform((value) => coerceFile(coerceString(value))).pipe(new ZodDefault(_objectSpread2(_objectSpread2({}, type._def), {}, {
      innerType: enableTypeCoercion(type.removeDefault(), cache)
    })));
  } else if (type instanceof ZodCatch) {
    schema = new ZodCatch(_objectSpread2(_objectSpread2({}, type._def), {}, {
      innerType: enableTypeCoercion(type.removeCatch(), cache)
    }));
  } else if (type instanceof ZodIntersection) {
    schema = new ZodIntersection(_objectSpread2(_objectSpread2({}, type._def), {}, {
      left: enableTypeCoercion(type._def.left, cache),
      right: enableTypeCoercion(type._def.right, cache)
    }));
  } else if (type instanceof ZodUnion) {
    schema = new ZodUnion(_objectSpread2(_objectSpread2({}, type._def), {}, {
      options: type.options.map((option) => enableTypeCoercion(option, cache))
    }));
  } else if (type instanceof ZodDiscriminatedUnion) {
    schema = new ZodDiscriminatedUnion(_objectSpread2(_objectSpread2({}, type._def), {}, {
      options: type.options.map((option) => enableTypeCoercion(option, cache)),
      optionsMap: new Map(Array.from(type.optionsMap.entries()).map((_ref2) => {
        var [discriminator, option] = _ref2;
        return [discriminator, enableTypeCoercion(option, cache)];
      }))
    }));
  } else if (type instanceof ZodTuple) {
    schema = new ZodTuple(_objectSpread2(_objectSpread2({}, type._def), {}, {
      items: type.items.map((item) => enableTypeCoercion(item, cache))
    }));
  } else if (type instanceof ZodNullable) {
    schema = new ZodNullable(_objectSpread2(_objectSpread2({}, type._def), {}, {
      innerType: enableTypeCoercion(type.unwrap(), cache)
    }));
  } else if (type instanceof ZodPipeline) {
    schema = new ZodPipeline(_objectSpread2(_objectSpread2({}, type._def), {}, {
      in: enableTypeCoercion(type._def.in, cache),
      out: enableTypeCoercion(type._def.out, cache)
    }));
  } else if (type instanceof ZodLazy) {
    schema = lazyType(() => enableTypeCoercion(type.schema, cache));
  }
  if (type !== schema) {
    cache.set(type, schema);
  }
  return schema;
}
function getError(zodError, formatError) {
  var result = {};
  for (var issue of zodError.errors) {
    var name = formatPaths(issue.path);
    switch (issue.message) {
      case conformZodMessage.VALIDATION_UNDEFINED:
        return null;
      case conformZodMessage.VALIDATION_SKIPPED:
        result[name] = null;
        break;
      default: {
        var _issues = result[name];
        if (_issues !== null) {
          if (_issues) {
            result[name] = _issues.concat(issue);
          } else {
            result[name] = [issue];
          }
        }
        break;
      }
    }
  }
  return Object.entries(result).reduce((result2, _ref) => {
    var [name2, issues] = _ref;
    result2[name2] = issues ? formatError(issues) : null;
    return result2;
  }, {});
}
function parseWithZod(payload, options) {
  return parse(payload, {
    resolve(payload2, intent) {
      var errorMap2 = options.errorMap;
      var schema = enableTypeCoercion(typeof options.schema === "function" ? options.schema(intent) : options.schema);
      var resolveSubmission = (result) => {
        var _options$formatError;
        return {
          value: result.success ? result.data : void 0,
          error: !result.success ? getError(result.error, (_options$formatError = options.formatError) !== null && _options$formatError !== void 0 ? _options$formatError : (issues) => issues.map((issue) => issue.message)) : void 0
        };
      };
      return options.async ? schema.safeParseAsync(payload2, {
        errorMap: errorMap2
      }).then((result) => resolveSubmission(result)) : resolveSubmission(schema.safeParse(payload2, {
        errorMap: errorMap2
      }));
    }
  });
}
var conformZodMessage = {
  VALIDATION_SKIPPED: "__skipped__",
  VALIDATION_UNDEFINED: "__undefined__"
};
export {
  getFormProps as a,
  getZodConstraint as g,
  parseWithZod as p,
  useForm as u,
  z
};
