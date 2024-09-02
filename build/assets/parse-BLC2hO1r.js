import { r as reactExports } from "./index-CZkutDaP.js";
import { a as anyType, Z as ZodArray, b as ZodObject, c as ZodEffects, d as ZodOptional, e as ZodDefault, f as ZodCatch, g as ZodIntersection, h as ZodUnion, i as ZodDiscriminatedUnion, j as ZodTuple, k as ZodNullable, l as ZodPipeline, m as lazyType } from "./index-D3-297m7.js";
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
  if (typeof input !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (typeof res !== "object") return res;
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
    if (typeof segment !== "undefined" && segment !== "" && segment !== "__proto__" && segment !== "constructor" && segment !== "prototype") {
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
function formatName(prefix, path) {
  return typeof path !== "undefined" ? formatPaths([...getPaths(prefix), path]) : prefix !== null && prefix !== void 0 ? prefix : "";
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
    var key = paths[index];
    var nextKey = paths[index + 1];
    var newValue = index != lastIndex ? Object.prototype.hasOwnProperty.call(pointer, key) && pointer[key] !== null ? pointer[key] : typeof nextKey === "number" ? [] : {} : valueFn(pointer[key]);
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
    if (!Object.prototype.hasOwnProperty.call(pointer, path)) {
      return;
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
function flatten(data) {
  var _options$resolve;
  var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
  var result = {};
  var resolve = (_options$resolve = options.resolve) !== null && _options$resolve !== void 0 ? _options$resolve : (data2) => data2;
  function process(data2, prefix) {
    var value = normalize(resolve(data2));
    if (typeof value !== "undefined") {
      result[prefix] = value;
    }
    if (Array.isArray(data2)) {
      for (var i = 0; i < data2.length; i++) {
        process(data2[i], "".concat(prefix, "[").concat(i, "]"));
      }
    } else if (isPlainObject(data2)) {
      for (var [key, _value] of Object.entries(data2)) {
        process(_value, prefix ? "".concat(prefix, ".").concat(key) : key);
      }
    }
  }
  if (data) {
    var _options$prefix;
    process(data, (_options$prefix = options.prefix) !== null && _options$prefix !== void 0 ? _options$prefix : "");
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
    if (_loop(next)) continue;
  }
  return context;
}
function parse(payload, options) {
  var context = getSubmissionContext(payload);
  var intent = context.intent;
  if (intent) {
    switch (intent.type) {
      case "update": {
        var name = formatName(intent.payload.name, intent.payload.index);
        var _value = intent.payload.value;
        if (typeof intent.payload.value !== "undefined") {
          if (name) {
            setValue(context.payload, name, () => _value);
          } else {
            context.payload = _value;
          }
        }
        break;
      }
      case "reset": {
        var _name = formatName(intent.payload.name, intent.payload.index);
        if (_name) {
          setValue(context.payload, _name, () => void 0);
        } else {
          context.payload = {};
        }
        break;
      }
      case "insert":
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
  switch (intent.type) {
    case "insert":
      return JSON.stringify({
        type: intent.type,
        payload: _objectSpread2$2(_objectSpread2$2({}, intent.payload), {}, {
          defaultValue: serialize(intent.payload.defaultValue)
        })
      });
    case "update":
      return JSON.stringify({
        type: intent.type,
        payload: _objectSpread2$2(_objectSpread2$2({}, intent.payload), {}, {
          value: serialize(intent.payload.value)
        })
      });
    default:
      return JSON.stringify(intent);
  }
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
  Object.assign(state, flatten(result, {
    resolve(data) {
      if (isPlainObject(data) || Array.isArray(data)) {
        var _data$root;
        return (_data$root = data[root]) !== null && _data$root !== void 0 ? _data$root : null;
      }
      return data;
    },
    prefix: name
  }));
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
  } else if (defaultValue instanceof Date) {
    return defaultValue.toISOString();
  } else if (typeof defaultValue === "boolean") {
    return defaultValue ? "on" : void 0;
  } else if (typeof defaultValue === "number" || typeof defaultValue === "bigint") {
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
    formId: options.formId,
    isValueUpdated: false,
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
        result[formatName(key, i)] = generateId();
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
  var _fields$filter;
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
        validated,
        value
      } = intent.payload;
      var _name2 = formatName(intent.payload.name, intent.payload.index);
      if (typeof value !== "undefined") {
        updateValue(meta, _name2 !== null && _name2 !== void 0 ? _name2 : "", value);
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
      var _name3 = formatName(intent.payload.name, intent.payload.index);
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
  var validatedFields = (_fields$filter = fields === null || fields === void 0 ? void 0 : fields.filter((name) => meta.validated[name])) !== null && _fields$filter !== void 0 ? _fields$filter : [];
  meta.error = Object.entries(meta.error).reduce((result, _ref3) => {
    var [name, error] = _ref3;
    if (meta.validated[name] || validatedFields.some((field) => isPrefix(name, field))) {
      result[name] = error;
    }
    return result;
  }, {});
}
function updateValue(meta, name, value) {
  if (name === "") {
    meta.initialValue = value;
    meta.value = value;
    meta.key = _objectSpread2$2(_objectSpread2$2({}, getDefaultKey(value)), {}, {
      "": generateId()
    });
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
      if (_ret) return _ret.v;
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
      if (!subject || subject.formId && prevMeta.formId !== nextMeta.formId || subject.status && prevState.submissionStatus !== nextState.submissionStatus || shouldNotify(prevState.error, nextState.error, cache.error, subject.error) || shouldNotify(prevState.initialValue, nextState.initialValue, cache.initialValue, subject.initialValue) || shouldNotify(prevState.key, nextState.key, cache.key, subject.key, (prev, next) => prev !== next) || shouldNotify(prevState.valid, nextState.valid, cache.valid, subject.valid, compareBoolean) || shouldNotify(prevState.dirty, nextState.dirty, cache.dirty, subject.dirty, compareBoolean) || shouldNotify(prevState.value, nextState.value, cache.value, subject.value)) {
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
    if (submission.status === "success" || submission.error !== null) {
      var _result2 = submission.reply();
      report(_objectSpread2$2(_objectSpread2$2({}, _result2), {}, {
        status: _result2.status !== "success" ? _result2.status : void 0
      }));
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
    return validated ? shouldRevalidate === eventName && (eventName === "onInput" || meta.isValueUpdated) : shouldValidate === eventName;
  }
  function updateFormValue(form) {
    var formData = new FormData(form);
    var result = getSubmissionContext(formData);
    updateFormMeta(_objectSpread2$2(_objectSpread2$2({}, meta), {}, {
      isValueUpdated: true,
      value: result.payload
    }));
  }
  function onInput(event) {
    var element = resolveTarget(event);
    if (!element || !element.form) {
      return;
    }
    if (event.defaultPrevented || !willValidate(element, "onInput")) {
      updateFormValue(element.form);
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
  function reset() {
    updateFormMeta(createFormMeta(latestOptions, true));
  }
  function onReset(event) {
    var element = getFormElement();
    if (event.type !== "reset" || event.target !== element || event.defaultPrevented) {
      return;
    }
    reset();
  }
  function report(result) {
    var _result$error, _result$state;
    var formElement = getFormElement();
    if (!result.initialValue) {
      reset();
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
      isValueUpdated: false,
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
      reset();
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
  function observe() {
    var observer = new MutationObserver((mutations) => {
      var form = getFormElement();
      if (!form) {
        return;
      }
      for (var mutation of mutations) {
        var nodes = mutation.type === "childList" ? [...mutation.addedNodes, ...mutation.removedNodes] : [mutation.target];
        for (var node of nodes) {
          var element = isFieldElement(node) ? node : node instanceof HTMLElement ? node.querySelector("input,select,textarea") : null;
          if ((element === null || element === void 0 ? void 0 : element.form) === form) {
            updateFormValue(form);
            return;
          }
        }
      }
    });
    observer.observe(document, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["form", "name"]
    });
    return () => {
      observer.disconnect();
    };
  }
  return {
    getFormId() {
      return meta.formId;
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
    getSerializedState,
    observe
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
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = _objectWithoutPropertiesLoose(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _toPrimitive$1(input, hint) {
  if (typeof input !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (typeof res !== "object") return res;
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
function updateSubjectRef(ref, subject, scope, name) {
  if (subject === "status" || subject === "formId") {
    ref.current[subject] = true;
  } else if (typeof scope !== "undefined" && typeof name !== "undefined") {
    var _ref$current$subject$, _ref$current$subject;
    ref.current[subject] = _objectSpread2$1(_objectSpread2$1({}, ref.current[subject]), {}, {
      [scope]: ((_ref$current$subject$ = (_ref$current$subject = ref.current[subject]) === null || _ref$current$subject === void 0 ? void 0 : _ref$current$subject[scope]) !== null && _ref$current$subject$ !== void 0 ? _ref$current$subject$ : []).concat(name)
    });
  }
}
function getMetadata(context, subjectRef, stateSnapshot) {
  var name = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "";
  var id = name ? "".concat(context.getFormId(), "-").concat(name) : context.getFormId();
  var state = context.getState();
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
            return getFieldMetadata(context, subjectRef, stateSnapshot, name, key);
          }
          return Reflect.get(target, key, receiver);
        }
      });
    }
  }, {
    get(target, key, receiver) {
      if (state === stateSnapshot) {
        switch (key) {
          case "id":
          case "errorId":
          case "descriptionId":
            updateSubjectRef(subjectRef, "formId");
            break;
          case "key":
          case "initialValue":
          case "value":
          case "valid":
          case "dirty":
            updateSubjectRef(subjectRef, key, "name", name);
            break;
          case "errors":
          case "allErrors":
            updateSubjectRef(subjectRef, "error", key === "errors" ? "name" : "prefix", name);
            break;
        }
      }
      return Reflect.get(target, key, receiver);
    }
  });
}
function getFieldMetadata(context, subjectRef, stateSnapshot) {
  var prefix = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "";
  var key = arguments.length > 4 ? arguments[4] : void 0;
  var name = typeof key === "undefined" ? prefix : formatPaths([...getPaths(prefix), key]);
  return new Proxy({}, {
    get(_, key2, receiver) {
      var _state$constraint$nam;
      var metadata = getMetadata(context, subjectRef, stateSnapshot, name);
      var state = context.getState();
      switch (key2) {
        case "formId":
          if (state === stateSnapshot) {
            updateSubjectRef(subjectRef, "formId");
          }
          return context.getFormId();
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
            if (state === stateSnapshot) {
              updateSubjectRef(subjectRef, "initialValue", "name", name);
            }
            if (!Array.isArray(initialValue)) {
              throw new Error("The initial value at the given name is not a list");
            }
            return Array(initialValue.length).fill(0).map((_2, index) => getFieldMetadata(context, subjectRef, stateSnapshot, name, index));
          };
        }
      }
      return Reflect.get(metadata, key2, receiver);
    }
  });
}
function getFormMetadata(context, subjectRef, stateSnapshot, noValidate) {
  return new Proxy({}, {
    get(_, key, receiver) {
      var metadata = getMetadata(context, subjectRef, stateSnapshot);
      var state = context.getState();
      switch (key) {
        case "context":
          return {
            [wrappedSymbol]: context
          };
        case "status":
          if (state === stateSnapshot) {
            updateSubjectRef(subjectRef, "status");
          }
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
      if (!result.submission || result.submission.status === "success" || result.submission.error === null) {
        if (!result.formData.has(INTENT)) {
          var _onSubmit;
          (_onSubmit = onSubmit) === null || _onSubmit === void 0 || _onSubmit(event, result);
        }
      } else {
        event.preventDefault();
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
    var disconnect = context.observe();
    document.addEventListener("input", context.onInput);
    document.addEventListener("focusout", context.onBlur);
    document.addEventListener("reset", context.onReset);
    return () => {
      disconnect();
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
  var stateSnapshot = useFormState(context, subjectRef);
  var noValidate = useNoValidate(options.defaultNoValidate);
  var form = getFormMetadata(context, subjectRef, stateSnapshot, noValidate);
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
  if (typeof input !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (typeof res !== "object") return res;
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
    var def = schema2["_def"];
    if (def.typeName === "ZodObject") {
      for (var key in def.shape()) {
        updateConstraint(def.shape()[key], data, name ? "".concat(name, ".").concat(key) : key);
      }
    } else if (def.typeName === "ZodEffects") {
      updateConstraint(def.schema, data, name);
    } else if (def.typeName === "ZodPipeline") {
      updateConstraint(def.out, data, name);
    } else if (def.typeName === "ZodIntersection") {
      var leftResult = {};
      var rightResult = {};
      updateConstraint(def.left, leftResult, name);
      updateConstraint(def.right, rightResult, name);
      Object.assign(data, leftResult, rightResult);
    } else if (def.typeName === "ZodUnion" || def.typeName === "ZodDiscriminatedUnion") {
      Object.assign(data, def.options.map((option) => {
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
    } else if (def.typeName === "ZodArray") {
      constraint.multiple = true;
      updateConstraint(def.type, data, "".concat(name, "[]"));
    } else if (def.typeName === "ZodString") {
      var _schema = schema2;
      if (_schema.minLength !== null) {
        var _schema$minLength;
        constraint.minLength = (_schema$minLength = _schema.minLength) !== null && _schema$minLength !== void 0 ? _schema$minLength : void 0;
      }
      if (_schema.maxLength !== null) {
        constraint.maxLength = _schema.maxLength;
      }
    } else if (def.typeName === "ZodOptional") {
      constraint.required = false;
      updateConstraint(def.innerType, data, name);
    } else if (def.typeName === "ZodDefault") {
      constraint.required = false;
      updateConstraint(def.innerType, data, name);
    } else if (def.typeName === "ZodNumber") {
      var _schema2 = schema2;
      if (_schema2.minValue !== null) {
        constraint.min = _schema2.minValue;
      }
      if (_schema2.maxValue !== null) {
        constraint.max = _schema2.maxValue;
      }
    } else if (def.typeName === "ZodEnum") {
      constraint.pattern = def.values.map((option) => (
        // To escape unsafe characters on regex
        option.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d")
      )).join("|");
    } else if (def.typeName === "ZodTuple") {
      for (var i = 0; i < def.items.length; i++) {
        updateConstraint(def.items[i], data, "".concat(name, "[").concat(i, "]"));
      }
    } else if (def.typeName === "ZodLazy") ;
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
  return schema._def.effect.type === "refinement" && schema.innerType()._def.typeName === "ZodAny" && schema.safeParse(new File([], "")).success && !schema.safeParse("").success;
}
function enableTypeCoercion(type) {
  var cache = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : /* @__PURE__ */ new Map();
  var result = cache.get(type);
  if (result) {
    return result;
  }
  var schema = type;
  var def = type._def;
  if (def.typeName === "ZodString" || def.typeName === "ZodLiteral" || def.typeName === "ZodEnum" || def.typeName === "ZodNativeEnum") {
    schema = anyType().transform((value) => coerceString(value)).pipe(type);
  } else if (def.typeName === "ZodNumber") {
    schema = anyType().transform((value) => coerceString(value, (text) => text.trim() === "" ? Number.NaN : Number(text))).pipe(type);
  } else if (def.typeName === "ZodBoolean") {
    schema = anyType().transform((value) => coerceString(value, (text) => text === "on" ? true : text)).pipe(type);
  } else if (def.typeName === "ZodDate") {
    schema = anyType().transform((value) => coerceString(value, (timestamp) => {
      var date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return timestamp;
      }
      return date;
    })).pipe(type);
  } else if (def.typeName === "ZodBigInt") {
    schema = anyType().transform((value) => coerceString(value, BigInt)).pipe(type);
  } else if (def.typeName === "ZodArray") {
    schema = anyType().transform((value) => {
      if (Array.isArray(value)) {
        return value;
      }
      if (typeof value === "undefined" || typeof coerceFile(coerceString(value)) === "undefined") {
        return [];
      }
      return [value];
    }).pipe(new ZodArray(_objectSpread2(_objectSpread2({}, def), {}, {
      type: enableTypeCoercion(def.type, cache)
    })));
  } else if (def.typeName === "ZodObject") {
    var _shape = Object.fromEntries(Object.entries(def.shape()).map((_ref) => {
      var [key, def2] = _ref;
      return [
        key,
        // @ts-expect-error see message above
        enableTypeCoercion(def2, cache)
      ];
    }));
    schema = new ZodObject(_objectSpread2(_objectSpread2({}, def), {}, {
      shape: () => _shape
    }));
  } else if (def.typeName === "ZodEffects") {
    if (isFileSchema(type)) {
      schema = anyType().transform((value) => coerceFile(value)).pipe(type);
    } else {
      schema = new ZodEffects(_objectSpread2(_objectSpread2({}, def), {}, {
        schema: enableTypeCoercion(def.schema, cache)
      }));
    }
  } else if (def.typeName === "ZodOptional") {
    schema = anyType().transform((value) => coerceFile(coerceString(value))).pipe(new ZodOptional(_objectSpread2(_objectSpread2({}, def), {}, {
      innerType: enableTypeCoercion(def.innerType, cache)
    })));
  } else if (def.typeName === "ZodDefault") {
    schema = anyType().transform((value) => coerceFile(coerceString(value))).pipe(new ZodDefault(_objectSpread2(_objectSpread2({}, def), {}, {
      innerType: enableTypeCoercion(def.innerType, cache)
    })));
  } else if (def.typeName === "ZodCatch") {
    schema = new ZodCatch(_objectSpread2(_objectSpread2({}, def), {}, {
      innerType: enableTypeCoercion(def.innerType, cache)
    }));
  } else if (def.typeName === "ZodIntersection") {
    schema = new ZodIntersection(_objectSpread2(_objectSpread2({}, def), {}, {
      left: enableTypeCoercion(def.left, cache),
      right: enableTypeCoercion(def.right, cache)
    }));
  } else if (def.typeName === "ZodUnion") {
    schema = new ZodUnion(_objectSpread2(_objectSpread2({}, def), {}, {
      options: def.options.map((option) => enableTypeCoercion(option, cache))
    }));
  } else if (def.typeName === "ZodDiscriminatedUnion") {
    schema = new ZodDiscriminatedUnion(_objectSpread2(_objectSpread2({}, def), {}, {
      options: def.options.map((option) => enableTypeCoercion(option, cache)),
      optionsMap: new Map(Array.from(def.optionsMap.entries()).map((_ref2) => {
        var [discriminator, option] = _ref2;
        return [discriminator, enableTypeCoercion(option, cache)];
      }))
    }));
  } else if (def.typeName === "ZodTuple") {
    schema = new ZodTuple(_objectSpread2(_objectSpread2({}, def), {}, {
      items: def.items.map((item) => enableTypeCoercion(item, cache))
    }));
  } else if (def.typeName === "ZodNullable") {
    schema = new ZodNullable(_objectSpread2(_objectSpread2({}, def), {}, {
      innerType: enableTypeCoercion(def.innerType, cache)
    }));
  } else if (def.typeName === "ZodPipeline") {
    schema = new ZodPipeline(_objectSpread2(_objectSpread2({}, def), {}, {
      in: enableTypeCoercion(def.in, cache),
      out: enableTypeCoercion(def.out, cache)
    }));
  } else if (def.typeName === "ZodLazy") {
    var inner = def.getter();
    schema = lazyType(() => enableTypeCoercion(inner, cache));
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
      var errorMap = options.errorMap;
      var schema = enableTypeCoercion(typeof options.schema === "function" ? options.schema(intent) : options.schema);
      var resolveSubmission = (result) => {
        var _options$formatError;
        return {
          value: result.success ? result.data : void 0,
          error: !result.success ? getError(result.error, (_options$formatError = options.formatError) !== null && _options$formatError !== void 0 ? _options$formatError : (issues) => issues.map((issue) => issue.message)) : void 0
        };
      };
      return options.async ? schema.safeParseAsync(payload2, {
        errorMap
      }).then((result) => resolveSubmission(result)) : resolveSubmission(schema.safeParse(payload2, {
        errorMap
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
  useForm as u
};
