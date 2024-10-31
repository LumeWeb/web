const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-C2KIIWov.js","assets/index-C3JligFb.js"])))=>i.map(i=>d[i]);
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { R as React, r as reactExports, g as getDefaultExportFromCjs, h as commonjsGlobal, j as jsxRuntimeExports } from "./index-C3JligFb.js";
import { c as castPath, t as toKey, a as isLength, b as isIndex, d as isArray, e as isArguments, g as ge, $, v as vt, f as ah, h as Rr, j as get$1, A as Ae, Y, T as Te, L as Le, P as Pt, r as rR, O as Ot, z as zt, y as yo, m as mc } from "./index-C2KIIWov.js";
import { L as Label, D as Dialog, a as DialogContent$1, b as DialogTitle$1, c as DialogDescription$1, G as GeneralLayout } from "./GeneralLayout-BMn9QWm5.js";
import { t as toDate, c as constructFrom, S as SkeletonLoader, D as DataTable, a as createColumnHelper } from "./constructFrom-CKVBuakm.js";
import { O as Overlay, C as Content, a as Close, T as Title, D as Description, P as Portal, I as Input, b as Checkbox, c as Textarea } from "./useFeatureFlag-Bpofn-lp.js";
import { k as createLucideIcon, t as twMerge, m as clsx, C as Cross2Icon, i as cn$1, S as Slot, n as Button, z } from "./createLucideIcon-IcTKO2u3.js";
import { P as Popover, b as PopoverTrigger, d as PopoverContent } from "./useTheme-Ba_Lo067.js";
import { S as Search } from "./search-hRx3vwiI.js";
import "./components-Dv2u7XfC.js";
import "./skeleton-CwGSP5ex.js";
function hasPath(object, path, hasFunc) {
  path = castPath(path, object);
  var index = -1, length = path.length, result = false;
  while (++index < length) {
    var key = toKey(path[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result || ++index != length) {
    return result;
  }
  length = object == null ? 0 : object.length;
  return !!length && isLength(length) && isIndex(key, length) && (isArray(object) || isArguments(object));
}
/**
 * @license lucide-react v0.396.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Check = createLucideIcon("Check", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]);
/**
 * @license lucide-react v0.396.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Trash = createLucideIcon("Trash", [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }]
]);
/**
 * @license lucide-react v0.396.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const X = createLucideIcon("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);
var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
function baseHas(object, key) {
  return object != null && hasOwnProperty.call(object, key);
}
function has(object, path) {
  return object != null && hasPath(object, path, baseHas);
}
var isCheckBoxInput = (element) => element.type === "checkbox";
var isDateObject = (value) => value instanceof Date;
var isNullOrUndefined = (value) => value == null;
const isObjectType = (value) => typeof value === "object";
var isObject = (value) => !isNullOrUndefined(value) && !Array.isArray(value) && isObjectType(value) && !isDateObject(value);
var getEventValue = (event) => isObject(event) && event.target ? isCheckBoxInput(event.target) ? event.target.checked : event.target.value : event;
var getNodeParentName = (name) => name.substring(0, name.search(/\.\d+(\.|$)/)) || name;
var isNameInFieldArray = (names2, name) => names2.has(getNodeParentName(name));
var isPlainObject = (tempObject) => {
  const prototypeCopy = tempObject.constructor && tempObject.constructor.prototype;
  return isObject(prototypeCopy) && prototypeCopy.hasOwnProperty("isPrototypeOf");
};
var isWeb = typeof window !== "undefined" && typeof window.HTMLElement !== "undefined" && typeof document !== "undefined";
function cloneObject(data) {
  let copy;
  const isArray2 = Array.isArray(data);
  if (data instanceof Date) {
    copy = new Date(data);
  } else if (data instanceof Set) {
    copy = new Set(data);
  } else if (!(isWeb && (data instanceof Blob || data instanceof FileList)) && (isArray2 || isObject(data))) {
    copy = isArray2 ? [] : {};
    if (!isArray2 && !isPlainObject(data)) {
      copy = data;
    } else {
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          copy[key] = cloneObject(data[key]);
        }
      }
    }
  } else {
    return data;
  }
  return copy;
}
var compact = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
var isUndefined = (val) => val === void 0;
var get = (object, path, defaultValue) => {
  if (!path || !isObject(object)) {
    return defaultValue;
  }
  const result = compact(path.split(/[,[\].]+?/)).reduce((result2, key) => isNullOrUndefined(result2) ? result2 : result2[key], object);
  return isUndefined(result) || result === object ? isUndefined(object[path]) ? defaultValue : object[path] : result;
};
var isBoolean = (value) => typeof value === "boolean";
var isKey = (value) => /^\w*$/.test(value);
var stringToPath = (input) => compact(input.replace(/["|']|\]/g, "").split(/\.|\[/));
var set = (object, path, value) => {
  let index = -1;
  const tempPath = isKey(path) ? [path] : stringToPath(path);
  const length = tempPath.length;
  const lastIndex = length - 1;
  while (++index < length) {
    const key = tempPath[index];
    let newValue = value;
    if (index !== lastIndex) {
      const objValue = object[key];
      newValue = isObject(objValue) || Array.isArray(objValue) ? objValue : !isNaN(+tempPath[index + 1]) ? [] : {};
    }
    if (key === "__proto__") {
      return;
    }
    object[key] = newValue;
    object = object[key];
  }
  return object;
};
const EVENTS = {
  BLUR: "blur",
  FOCUS_OUT: "focusout",
  CHANGE: "change"
};
const VALIDATION_MODE = {
  onBlur: "onBlur",
  onChange: "onChange",
  onSubmit: "onSubmit",
  onTouched: "onTouched",
  all: "all"
};
const INPUT_VALIDATION_RULES = {
  max: "max",
  min: "min",
  maxLength: "maxLength",
  minLength: "minLength",
  pattern: "pattern",
  required: "required",
  validate: "validate"
};
const HookFormContext = React.createContext(null);
const useFormContext = () => React.useContext(HookFormContext);
const FormProvider = (props) => {
  const { children, ...data } = props;
  return React.createElement(HookFormContext.Provider, { value: data }, children);
};
var getProxyFormState = (formState, control, localProxyFormState, isRoot = true) => {
  const result = {
    defaultValues: control._defaultValues
  };
  for (const key in formState) {
    Object.defineProperty(result, key, {
      get: () => {
        const _key = key;
        if (control._proxyFormState[_key] !== VALIDATION_MODE.all) {
          control._proxyFormState[_key] = !isRoot || VALIDATION_MODE.all;
        }
        localProxyFormState && (localProxyFormState[_key] = true);
        return formState[_key];
      }
    });
  }
  return result;
};
var isEmptyObject = (value) => isObject(value) && !Object.keys(value).length;
var shouldRenderFormState = (formStateData, _proxyFormState, updateFormState, isRoot) => {
  updateFormState(formStateData);
  const { name, ...formState } = formStateData;
  return isEmptyObject(formState) || Object.keys(formState).length >= Object.keys(_proxyFormState).length || Object.keys(formState).find((key) => _proxyFormState[key] === (!isRoot || VALIDATION_MODE.all));
};
var convertToArrayPayload = (value) => Array.isArray(value) ? value : [value];
var shouldSubscribeByName = (name, signalName, exact) => !name || !signalName || name === signalName || convertToArrayPayload(name).some((currentName) => currentName && (exact ? currentName === signalName : currentName.startsWith(signalName) || signalName.startsWith(currentName)));
function useSubscribe(props) {
  const _props = React.useRef(props);
  _props.current = props;
  React.useEffect(() => {
    const subscription = !props.disabled && _props.current.subject && _props.current.subject.subscribe({
      next: _props.current.next
    });
    return () => {
      subscription && subscription.unsubscribe();
    };
  }, [props.disabled]);
}
function useFormState(props) {
  const methods = useFormContext();
  const { control = methods.control, disabled, name, exact } = props || {};
  const [formState, updateFormState] = React.useState(control._formState);
  const _mounted = React.useRef(true);
  const _localProxyFormState = React.useRef({
    isDirty: false,
    isLoading: false,
    dirtyFields: false,
    touchedFields: false,
    validatingFields: false,
    isValidating: false,
    isValid: false,
    errors: false
  });
  const _name = React.useRef(name);
  _name.current = name;
  useSubscribe({
    disabled,
    next: (value) => _mounted.current && shouldSubscribeByName(_name.current, value.name, exact) && shouldRenderFormState(value, _localProxyFormState.current, control._updateFormState) && updateFormState({
      ...control._formState,
      ...value
    }),
    subject: control._subjects.state
  });
  React.useEffect(() => {
    _mounted.current = true;
    _localProxyFormState.current.isValid && control._updateValid(true);
    return () => {
      _mounted.current = false;
    };
  }, [control]);
  return getProxyFormState(formState, control, _localProxyFormState.current, false);
}
var isString = (value) => typeof value === "string";
var generateWatchOutput = (names2, _names, formValues, isGlobal, defaultValue) => {
  if (isString(names2)) {
    isGlobal && _names.watch.add(names2);
    return get(formValues, names2, defaultValue);
  }
  if (Array.isArray(names2)) {
    return names2.map((fieldName) => (isGlobal && _names.watch.add(fieldName), get(formValues, fieldName)));
  }
  isGlobal && (_names.watchAll = true);
  return formValues;
};
function useWatch(props) {
  const methods = useFormContext();
  const { control = methods.control, name, defaultValue, disabled, exact } = props || {};
  const _name = React.useRef(name);
  _name.current = name;
  useSubscribe({
    disabled,
    subject: control._subjects.values,
    next: (formState) => {
      if (shouldSubscribeByName(_name.current, formState.name, exact)) {
        updateValue(cloneObject(generateWatchOutput(_name.current, control._names, formState.values || control._formValues, false, defaultValue)));
      }
    }
  });
  const [value, updateValue] = React.useState(control._getWatch(name, defaultValue));
  React.useEffect(() => control._removeUnmounted());
  return value;
}
function useController(props) {
  const methods = useFormContext();
  const { name, disabled, control = methods.control, shouldUnregister } = props;
  const isArrayField = isNameInFieldArray(control._names.array, name);
  const value = useWatch({
    control,
    name,
    defaultValue: get(control._formValues, name, get(control._defaultValues, name, props.defaultValue)),
    exact: true
  });
  const formState = useFormState({
    control,
    name,
    exact: true
  });
  const _registerProps = React.useRef(control.register(name, {
    ...props.rules,
    value,
    ...isBoolean(props.disabled) ? { disabled: props.disabled } : {}
  }));
  React.useEffect(() => {
    const _shouldUnregisterField = control._options.shouldUnregister || shouldUnregister;
    const updateMounted = (name2, value2) => {
      const field = get(control._fields, name2);
      if (field && field._f) {
        field._f.mount = value2;
      }
    };
    updateMounted(name, true);
    if (_shouldUnregisterField) {
      const value2 = cloneObject(get(control._options.defaultValues, name));
      set(control._defaultValues, name, value2);
      if (isUndefined(get(control._formValues, name))) {
        set(control._formValues, name, value2);
      }
    }
    return () => {
      (isArrayField ? _shouldUnregisterField && !control._state.action : _shouldUnregisterField) ? control.unregister(name) : updateMounted(name, false);
    };
  }, [name, control, isArrayField, shouldUnregister]);
  React.useEffect(() => {
    if (get(control._fields, name)) {
      control._updateDisabledField({
        disabled,
        fields: control._fields,
        name,
        value: get(control._fields, name)._f.value
      });
    }
  }, [disabled, name, control]);
  return {
    field: {
      name,
      value,
      ...isBoolean(disabled) || formState.disabled ? { disabled: formState.disabled || disabled } : {},
      onChange: React.useCallback((event) => _registerProps.current.onChange({
        target: {
          value: getEventValue(event),
          name
        },
        type: EVENTS.CHANGE
      }), [name]),
      onBlur: React.useCallback(() => _registerProps.current.onBlur({
        target: {
          value: get(control._formValues, name),
          name
        },
        type: EVENTS.BLUR
      }), [name, control]),
      ref: React.useCallback((elm) => {
        const field = get(control._fields, name);
        if (field && elm) {
          field._f.ref = {
            focus: () => elm.focus(),
            select: () => elm.select(),
            setCustomValidity: (message) => elm.setCustomValidity(message),
            reportValidity: () => elm.reportValidity()
          };
        }
      }, [control._fields, name])
    },
    formState,
    fieldState: Object.defineProperties({}, {
      invalid: {
        enumerable: true,
        get: () => !!get(formState.errors, name)
      },
      isDirty: {
        enumerable: true,
        get: () => !!get(formState.dirtyFields, name)
      },
      isTouched: {
        enumerable: true,
        get: () => !!get(formState.touchedFields, name)
      },
      isValidating: {
        enumerable: true,
        get: () => !!get(formState.validatingFields, name)
      },
      error: {
        enumerable: true,
        get: () => get(formState.errors, name)
      }
    })
  };
}
const Controller = (props) => props.render(useController(props));
var appendErrors = (name, validateAllFieldCriteria, errors2, type2, message) => validateAllFieldCriteria ? {
  ...errors2[name],
  types: {
    ...errors2[name] && errors2[name].types ? errors2[name].types : {},
    [type2]: message || true
  }
} : {};
var getValidationModes = (mode) => ({
  isOnSubmit: !mode || mode === VALIDATION_MODE.onSubmit,
  isOnBlur: mode === VALIDATION_MODE.onBlur,
  isOnChange: mode === VALIDATION_MODE.onChange,
  isOnAll: mode === VALIDATION_MODE.all,
  isOnTouch: mode === VALIDATION_MODE.onTouched
});
var isWatched = (name, _names, isBlurEvent) => !isBlurEvent && (_names.watchAll || _names.watch.has(name) || [..._names.watch].some((watchName) => name.startsWith(watchName) && /^\.\w+/.test(name.slice(watchName.length))));
const iterateFieldsByAction = (fields, action, fieldsNames, abortEarly) => {
  for (const key of fieldsNames || Object.keys(fields)) {
    const field = get(fields, key);
    if (field) {
      const { _f, ...currentField } = field;
      if (_f) {
        if (_f.refs && _f.refs[0] && action(_f.refs[0], key) && !abortEarly) {
          return true;
        } else if (_f.ref && action(_f.ref, _f.name) && !abortEarly) {
          return true;
        } else {
          if (iterateFieldsByAction(currentField, action)) {
            break;
          }
        }
      } else if (isObject(currentField)) {
        if (iterateFieldsByAction(currentField, action)) {
          break;
        }
      }
    }
  }
  return;
};
var updateFieldArrayRootError = (errors2, error2, name) => {
  const fieldArrayErrors = convertToArrayPayload(get(errors2, name));
  set(fieldArrayErrors, "root", error2[name]);
  set(errors2, name, fieldArrayErrors);
  return errors2;
};
var isFileInput = (element) => element.type === "file";
var isFunction = (value) => typeof value === "function";
var isHTMLElement = (value) => {
  if (!isWeb) {
    return false;
  }
  const owner = value ? value.ownerDocument : 0;
  return value instanceof (owner && owner.defaultView ? owner.defaultView.HTMLElement : HTMLElement);
};
var isMessage = (value) => isString(value);
var isRadioInput = (element) => element.type === "radio";
var isRegex = (value) => value instanceof RegExp;
const defaultResult = {
  value: false,
  isValid: false
};
const validResult = { value: true, isValid: true };
var getCheckboxValue = (options) => {
  if (Array.isArray(options)) {
    if (options.length > 1) {
      const values = options.filter((option) => option && option.checked && !option.disabled).map((option) => option.value);
      return { value: values, isValid: !!values.length };
    }
    return options[0].checked && !options[0].disabled ? (
      // @ts-expect-error expected to work in the browser
      options[0].attributes && !isUndefined(options[0].attributes.value) ? isUndefined(options[0].value) || options[0].value === "" ? validResult : { value: options[0].value, isValid: true } : validResult
    ) : defaultResult;
  }
  return defaultResult;
};
const defaultReturn = {
  isValid: false,
  value: null
};
var getRadioValue = (options) => Array.isArray(options) ? options.reduce((previous, option) => option && option.checked && !option.disabled ? {
  isValid: true,
  value: option.value
} : previous, defaultReturn) : defaultReturn;
function getValidateError(result, ref2, type2 = "validate") {
  if (isMessage(result) || Array.isArray(result) && result.every(isMessage) || isBoolean(result) && !result) {
    return {
      type: type2,
      message: isMessage(result) ? result : "",
      ref: ref2
    };
  }
}
var getValueAndMessage = (validationData) => isObject(validationData) && !isRegex(validationData) ? validationData : {
  value: validationData,
  message: ""
};
var validateField = async (field, formValues, validateAllFieldCriteria, shouldUseNativeValidation, isFieldArray) => {
  const { ref: ref2, refs, required: required2, maxLength, minLength, min, max, pattern: pattern2, validate: validate2, name, valueAsNumber, mount, disabled } = field._f;
  const inputValue = get(formValues, name);
  if (!mount || disabled) {
    return {};
  }
  const inputRef = refs ? refs[0] : ref2;
  const setCustomValidity = (message) => {
    if (shouldUseNativeValidation && inputRef.reportValidity) {
      inputRef.setCustomValidity(isBoolean(message) ? "" : message || "");
      inputRef.reportValidity();
    }
  };
  const error2 = {};
  const isRadio = isRadioInput(ref2);
  const isCheckBox = isCheckBoxInput(ref2);
  const isRadioOrCheckbox2 = isRadio || isCheckBox;
  const isEmpty = (valueAsNumber || isFileInput(ref2)) && isUndefined(ref2.value) && isUndefined(inputValue) || isHTMLElement(ref2) && ref2.value === "" || inputValue === "" || Array.isArray(inputValue) && !inputValue.length;
  const appendErrorsCurry = appendErrors.bind(null, name, validateAllFieldCriteria, error2);
  const getMinMaxMessage = (exceedMax, maxLengthMessage, minLengthMessage, maxType = INPUT_VALIDATION_RULES.maxLength, minType = INPUT_VALIDATION_RULES.minLength) => {
    const message = exceedMax ? maxLengthMessage : minLengthMessage;
    error2[name] = {
      type: exceedMax ? maxType : minType,
      message,
      ref: ref2,
      ...appendErrorsCurry(exceedMax ? maxType : minType, message)
    };
  };
  if (isFieldArray ? !Array.isArray(inputValue) || !inputValue.length : required2 && (!isRadioOrCheckbox2 && (isEmpty || isNullOrUndefined(inputValue)) || isBoolean(inputValue) && !inputValue || isCheckBox && !getCheckboxValue(refs).isValid || isRadio && !getRadioValue(refs).isValid)) {
    const { value, message } = isMessage(required2) ? { value: !!required2, message: required2 } : getValueAndMessage(required2);
    if (value) {
      error2[name] = {
        type: INPUT_VALIDATION_RULES.required,
        message,
        ref: inputRef,
        ...appendErrorsCurry(INPUT_VALIDATION_RULES.required, message)
      };
      if (!validateAllFieldCriteria) {
        setCustomValidity(message);
        return error2;
      }
    }
  }
  if (!isEmpty && (!isNullOrUndefined(min) || !isNullOrUndefined(max))) {
    let exceedMax;
    let exceedMin;
    const maxOutput = getValueAndMessage(max);
    const minOutput = getValueAndMessage(min);
    if (!isNullOrUndefined(inputValue) && !isNaN(inputValue)) {
      const valueNumber = ref2.valueAsNumber || (inputValue ? +inputValue : inputValue);
      if (!isNullOrUndefined(maxOutput.value)) {
        exceedMax = valueNumber > maxOutput.value;
      }
      if (!isNullOrUndefined(minOutput.value)) {
        exceedMin = valueNumber < minOutput.value;
      }
    } else {
      const valueDate = ref2.valueAsDate || new Date(inputValue);
      const convertTimeToDate = (time) => /* @__PURE__ */ new Date((/* @__PURE__ */ new Date()).toDateString() + " " + time);
      const isTime = ref2.type == "time";
      const isWeek = ref2.type == "week";
      if (isString(maxOutput.value) && inputValue) {
        exceedMax = isTime ? convertTimeToDate(inputValue) > convertTimeToDate(maxOutput.value) : isWeek ? inputValue > maxOutput.value : valueDate > new Date(maxOutput.value);
      }
      if (isString(minOutput.value) && inputValue) {
        exceedMin = isTime ? convertTimeToDate(inputValue) < convertTimeToDate(minOutput.value) : isWeek ? inputValue < minOutput.value : valueDate < new Date(minOutput.value);
      }
    }
    if (exceedMax || exceedMin) {
      getMinMaxMessage(!!exceedMax, maxOutput.message, minOutput.message, INPUT_VALIDATION_RULES.max, INPUT_VALIDATION_RULES.min);
      if (!validateAllFieldCriteria) {
        setCustomValidity(error2[name].message);
        return error2;
      }
    }
  }
  if ((maxLength || minLength) && !isEmpty && (isString(inputValue) || isFieldArray && Array.isArray(inputValue))) {
    const maxLengthOutput = getValueAndMessage(maxLength);
    const minLengthOutput = getValueAndMessage(minLength);
    const exceedMax = !isNullOrUndefined(maxLengthOutput.value) && inputValue.length > +maxLengthOutput.value;
    const exceedMin = !isNullOrUndefined(minLengthOutput.value) && inputValue.length < +minLengthOutput.value;
    if (exceedMax || exceedMin) {
      getMinMaxMessage(exceedMax, maxLengthOutput.message, minLengthOutput.message);
      if (!validateAllFieldCriteria) {
        setCustomValidity(error2[name].message);
        return error2;
      }
    }
  }
  if (pattern2 && !isEmpty && isString(inputValue)) {
    const { value: patternValue, message } = getValueAndMessage(pattern2);
    if (isRegex(patternValue) && !inputValue.match(patternValue)) {
      error2[name] = {
        type: INPUT_VALIDATION_RULES.pattern,
        message,
        ref: ref2,
        ...appendErrorsCurry(INPUT_VALIDATION_RULES.pattern, message)
      };
      if (!validateAllFieldCriteria) {
        setCustomValidity(message);
        return error2;
      }
    }
  }
  if (validate2) {
    if (isFunction(validate2)) {
      const result = await validate2(inputValue, formValues);
      const validateError = getValidateError(result, inputRef);
      if (validateError) {
        error2[name] = {
          ...validateError,
          ...appendErrorsCurry(INPUT_VALIDATION_RULES.validate, validateError.message)
        };
        if (!validateAllFieldCriteria) {
          setCustomValidity(validateError.message);
          return error2;
        }
      }
    } else if (isObject(validate2)) {
      let validationResult = {};
      for (const key in validate2) {
        if (!isEmptyObject(validationResult) && !validateAllFieldCriteria) {
          break;
        }
        const validateError = getValidateError(await validate2[key](inputValue, formValues), inputRef, key);
        if (validateError) {
          validationResult = {
            ...validateError,
            ...appendErrorsCurry(key, validateError.message)
          };
          setCustomValidity(validateError.message);
          if (validateAllFieldCriteria) {
            error2[name] = validationResult;
          }
        }
      }
      if (!isEmptyObject(validationResult)) {
        error2[name] = {
          ref: inputRef,
          ...validationResult
        };
        if (!validateAllFieldCriteria) {
          return error2;
        }
      }
    }
  }
  setCustomValidity(true);
  return error2;
};
function baseGet(object, updatePath) {
  const length = updatePath.slice(0, -1).length;
  let index = 0;
  while (index < length) {
    object = isUndefined(object) ? index++ : object[updatePath[index++]];
  }
  return object;
}
function isEmptyArray(obj) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && !isUndefined(obj[key])) {
      return false;
    }
  }
  return true;
}
function unset(object, path) {
  const paths = Array.isArray(path) ? path : isKey(path) ? [path] : stringToPath(path);
  const childObject = paths.length === 1 ? object : baseGet(object, paths);
  const index = paths.length - 1;
  const key = paths[index];
  if (childObject) {
    delete childObject[key];
  }
  if (index !== 0 && (isObject(childObject) && isEmptyObject(childObject) || Array.isArray(childObject) && isEmptyArray(childObject))) {
    unset(object, paths.slice(0, -1));
  }
  return object;
}
var createSubject = () => {
  let _observers = [];
  const next2 = (value) => {
    for (const observer of _observers) {
      observer.next && observer.next(value);
    }
  };
  const subscribe = (observer) => {
    _observers.push(observer);
    return {
      unsubscribe: () => {
        _observers = _observers.filter((o2) => o2 !== observer);
      }
    };
  };
  const unsubscribe = () => {
    _observers = [];
  };
  return {
    get observers() {
      return _observers;
    },
    next: next2,
    subscribe,
    unsubscribe
  };
};
var isPrimitive = (value) => isNullOrUndefined(value) || !isObjectType(value);
function deepEqual(object1, object2) {
  if (isPrimitive(object1) || isPrimitive(object2)) {
    return object1 === object2;
  }
  if (isDateObject(object1) && isDateObject(object2)) {
    return object1.getTime() === object2.getTime();
  }
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (const key of keys1) {
    const val1 = object1[key];
    if (!keys2.includes(key)) {
      return false;
    }
    if (key !== "ref") {
      const val2 = object2[key];
      if (isDateObject(val1) && isDateObject(val2) || isObject(val1) && isObject(val2) || Array.isArray(val1) && Array.isArray(val2) ? !deepEqual(val1, val2) : val1 !== val2) {
        return false;
      }
    }
  }
  return true;
}
var isMultipleSelect = (element) => element.type === `select-multiple`;
var isRadioOrCheckbox = (ref2) => isRadioInput(ref2) || isCheckBoxInput(ref2);
var live = (ref2) => isHTMLElement(ref2) && ref2.isConnected;
var objectHasFunction = (data) => {
  for (const key in data) {
    if (isFunction(data[key])) {
      return true;
    }
  }
  return false;
};
function markFieldsDirty(data, fields = {}) {
  const isParentNodeArray = Array.isArray(data);
  if (isObject(data) || isParentNodeArray) {
    for (const key in data) {
      if (Array.isArray(data[key]) || isObject(data[key]) && !objectHasFunction(data[key])) {
        fields[key] = Array.isArray(data[key]) ? [] : {};
        markFieldsDirty(data[key], fields[key]);
      } else if (!isNullOrUndefined(data[key])) {
        fields[key] = true;
      }
    }
  }
  return fields;
}
function getDirtyFieldsFromDefaultValues(data, formValues, dirtyFieldsFromValues) {
  const isParentNodeArray = Array.isArray(data);
  if (isObject(data) || isParentNodeArray) {
    for (const key in data) {
      if (Array.isArray(data[key]) || isObject(data[key]) && !objectHasFunction(data[key])) {
        if (isUndefined(formValues) || isPrimitive(dirtyFieldsFromValues[key])) {
          dirtyFieldsFromValues[key] = Array.isArray(data[key]) ? markFieldsDirty(data[key], []) : { ...markFieldsDirty(data[key]) };
        } else {
          getDirtyFieldsFromDefaultValues(data[key], isNullOrUndefined(formValues) ? {} : formValues[key], dirtyFieldsFromValues[key]);
        }
      } else {
        dirtyFieldsFromValues[key] = !deepEqual(data[key], formValues[key]);
      }
    }
  }
  return dirtyFieldsFromValues;
}
var getDirtyFields = (defaultValues, formValues) => getDirtyFieldsFromDefaultValues(defaultValues, formValues, markFieldsDirty(formValues));
var getFieldValueAs = (value, { valueAsNumber, valueAsDate, setValueAs }) => isUndefined(value) ? value : valueAsNumber ? value === "" ? NaN : value ? +value : value : valueAsDate && isString(value) ? new Date(value) : setValueAs ? setValueAs(value) : value;
function getFieldValue(_f) {
  const ref2 = _f.ref;
  if (_f.refs ? _f.refs.every((ref3) => ref3.disabled) : ref2.disabled) {
    return;
  }
  if (isFileInput(ref2)) {
    return ref2.files;
  }
  if (isRadioInput(ref2)) {
    return getRadioValue(_f.refs).value;
  }
  if (isMultipleSelect(ref2)) {
    return [...ref2.selectedOptions].map(({ value }) => value);
  }
  if (isCheckBoxInput(ref2)) {
    return getCheckboxValue(_f.refs).value;
  }
  return getFieldValueAs(isUndefined(ref2.value) ? _f.ref.value : ref2.value, _f);
}
var getResolverOptions = (fieldsNames, _fields, criteriaMode, shouldUseNativeValidation) => {
  const fields = {};
  for (const name of fieldsNames) {
    const field = get(_fields, name);
    field && set(fields, name, field._f);
  }
  return {
    criteriaMode,
    names: [...fieldsNames],
    fields,
    shouldUseNativeValidation
  };
};
var getRuleValue = (rule) => isUndefined(rule) ? rule : isRegex(rule) ? rule.source : isObject(rule) ? isRegex(rule.value) ? rule.value.source : rule.value : rule;
const ASYNC_FUNCTION = "AsyncFunction";
var hasPromiseValidation = (fieldReference) => (!fieldReference || !fieldReference.validate) && !!(isFunction(fieldReference.validate) && fieldReference.validate.constructor.name === ASYNC_FUNCTION || isObject(fieldReference.validate) && Object.values(fieldReference.validate).find((validateFunction2) => validateFunction2.constructor.name === ASYNC_FUNCTION));
var hasValidation = (options) => options.mount && (options.required || options.min || options.max || options.maxLength || options.minLength || options.pattern || options.validate);
function schemaErrorLookup(errors2, _fields, name) {
  const error2 = get(errors2, name);
  if (error2 || isKey(name)) {
    return {
      error: error2,
      name
    };
  }
  const names2 = name.split(".");
  while (names2.length) {
    const fieldName = names2.join(".");
    const field = get(_fields, fieldName);
    const foundError = get(errors2, fieldName);
    if (field && !Array.isArray(field) && name !== fieldName) {
      return { name };
    }
    if (foundError && foundError.type) {
      return {
        name: fieldName,
        error: foundError
      };
    }
    names2.pop();
  }
  return {
    name
  };
}
var skipValidation = (isBlurEvent, isTouched, isSubmitted, reValidateMode, mode) => {
  if (mode.isOnAll) {
    return false;
  } else if (!isSubmitted && mode.isOnTouch) {
    return !(isTouched || isBlurEvent);
  } else if (isSubmitted ? reValidateMode.isOnBlur : mode.isOnBlur) {
    return !isBlurEvent;
  } else if (isSubmitted ? reValidateMode.isOnChange : mode.isOnChange) {
    return isBlurEvent;
  }
  return true;
};
var unsetEmptyArray = (ref2, name) => !compact(get(ref2, name)).length && unset(ref2, name);
const defaultOptions = {
  mode: VALIDATION_MODE.onSubmit,
  reValidateMode: VALIDATION_MODE.onChange,
  shouldFocusError: true
};
function createFormControl(props = {}) {
  let _options = {
    ...defaultOptions,
    ...props
  };
  let _formState = {
    submitCount: 0,
    isDirty: false,
    isLoading: isFunction(_options.defaultValues),
    isValidating: false,
    isSubmitted: false,
    isSubmitting: false,
    isSubmitSuccessful: false,
    isValid: false,
    touchedFields: {},
    dirtyFields: {},
    validatingFields: {},
    errors: _options.errors || {},
    disabled: _options.disabled || false
  };
  let _fields = {};
  let _defaultValues = isObject(_options.defaultValues) || isObject(_options.values) ? cloneObject(_options.defaultValues || _options.values) || {} : {};
  let _formValues = _options.shouldUnregister ? {} : cloneObject(_defaultValues);
  let _state = {
    action: false,
    mount: false,
    watch: false
  };
  let _names = {
    mount: /* @__PURE__ */ new Set(),
    unMount: /* @__PURE__ */ new Set(),
    array: /* @__PURE__ */ new Set(),
    watch: /* @__PURE__ */ new Set()
  };
  let delayErrorCallback;
  let timer = 0;
  const _proxyFormState = {
    isDirty: false,
    dirtyFields: false,
    validatingFields: false,
    touchedFields: false,
    isValidating: false,
    isValid: false,
    errors: false
  };
  const _subjects = {
    values: createSubject(),
    array: createSubject(),
    state: createSubject()
  };
  const validationModeBeforeSubmit = getValidationModes(_options.mode);
  const validationModeAfterSubmit = getValidationModes(_options.reValidateMode);
  const shouldDisplayAllAssociatedErrors = _options.criteriaMode === VALIDATION_MODE.all;
  const debounce = (callback) => (wait) => {
    clearTimeout(timer);
    timer = setTimeout(callback, wait);
  };
  const _updateValid = async (shouldUpdateValid) => {
    if (!props.disabled && (_proxyFormState.isValid || shouldUpdateValid)) {
      const isValid = _options.resolver ? isEmptyObject((await _executeSchema()).errors) : await executeBuiltInValidation(_fields, true);
      if (isValid !== _formState.isValid) {
        _subjects.state.next({
          isValid
        });
      }
    }
  };
  const _updateIsValidating = (names2, isValidating) => {
    if (!props.disabled && (_proxyFormState.isValidating || _proxyFormState.validatingFields)) {
      (names2 || Array.from(_names.mount)).forEach((name) => {
        if (name) {
          isValidating ? set(_formState.validatingFields, name, isValidating) : unset(_formState.validatingFields, name);
        }
      });
      _subjects.state.next({
        validatingFields: _formState.validatingFields,
        isValidating: !isEmptyObject(_formState.validatingFields)
      });
    }
  };
  const _updateFieldArray = (name, values = [], method, args, shouldSetValues = true, shouldUpdateFieldsAndState = true) => {
    if (args && method && !props.disabled) {
      _state.action = true;
      if (shouldUpdateFieldsAndState && Array.isArray(get(_fields, name))) {
        const fieldValues = method(get(_fields, name), args.argA, args.argB);
        shouldSetValues && set(_fields, name, fieldValues);
      }
      if (shouldUpdateFieldsAndState && Array.isArray(get(_formState.errors, name))) {
        const errors2 = method(get(_formState.errors, name), args.argA, args.argB);
        shouldSetValues && set(_formState.errors, name, errors2);
        unsetEmptyArray(_formState.errors, name);
      }
      if (_proxyFormState.touchedFields && shouldUpdateFieldsAndState && Array.isArray(get(_formState.touchedFields, name))) {
        const touchedFields = method(get(_formState.touchedFields, name), args.argA, args.argB);
        shouldSetValues && set(_formState.touchedFields, name, touchedFields);
      }
      if (_proxyFormState.dirtyFields) {
        _formState.dirtyFields = getDirtyFields(_defaultValues, _formValues);
      }
      _subjects.state.next({
        name,
        isDirty: _getDirty(name, values),
        dirtyFields: _formState.dirtyFields,
        errors: _formState.errors,
        isValid: _formState.isValid
      });
    } else {
      set(_formValues, name, values);
    }
  };
  const updateErrors = (name, error2) => {
    set(_formState.errors, name, error2);
    _subjects.state.next({
      errors: _formState.errors
    });
  };
  const _setErrors = (errors2) => {
    _formState.errors = errors2;
    _subjects.state.next({
      errors: _formState.errors,
      isValid: false
    });
  };
  const updateValidAndValue = (name, shouldSkipSetValueAs, value, ref2) => {
    const field = get(_fields, name);
    if (field) {
      const defaultValue = get(_formValues, name, isUndefined(value) ? get(_defaultValues, name) : value);
      isUndefined(defaultValue) || ref2 && ref2.defaultChecked || shouldSkipSetValueAs ? set(_formValues, name, shouldSkipSetValueAs ? defaultValue : getFieldValue(field._f)) : setFieldValue(name, defaultValue);
      _state.mount && _updateValid();
    }
  };
  const updateTouchAndDirty = (name, fieldValue, isBlurEvent, shouldDirty, shouldRender) => {
    let shouldUpdateField = false;
    let isPreviousDirty = false;
    const output = {
      name
    };
    if (!props.disabled) {
      const disabledField = !!(get(_fields, name) && get(_fields, name)._f && get(_fields, name)._f.disabled);
      if (!isBlurEvent || shouldDirty) {
        if (_proxyFormState.isDirty) {
          isPreviousDirty = _formState.isDirty;
          _formState.isDirty = output.isDirty = _getDirty();
          shouldUpdateField = isPreviousDirty !== output.isDirty;
        }
        const isCurrentFieldPristine = disabledField || deepEqual(get(_defaultValues, name), fieldValue);
        isPreviousDirty = !!(!disabledField && get(_formState.dirtyFields, name));
        isCurrentFieldPristine || disabledField ? unset(_formState.dirtyFields, name) : set(_formState.dirtyFields, name, true);
        output.dirtyFields = _formState.dirtyFields;
        shouldUpdateField = shouldUpdateField || _proxyFormState.dirtyFields && isPreviousDirty !== !isCurrentFieldPristine;
      }
      if (isBlurEvent) {
        const isPreviousFieldTouched = get(_formState.touchedFields, name);
        if (!isPreviousFieldTouched) {
          set(_formState.touchedFields, name, isBlurEvent);
          output.touchedFields = _formState.touchedFields;
          shouldUpdateField = shouldUpdateField || _proxyFormState.touchedFields && isPreviousFieldTouched !== isBlurEvent;
        }
      }
      shouldUpdateField && shouldRender && _subjects.state.next(output);
    }
    return shouldUpdateField ? output : {};
  };
  const shouldRenderByError = (name, isValid, error2, fieldState) => {
    const previousFieldError = get(_formState.errors, name);
    const shouldUpdateValid = _proxyFormState.isValid && isBoolean(isValid) && _formState.isValid !== isValid;
    if (props.delayError && error2) {
      delayErrorCallback = debounce(() => updateErrors(name, error2));
      delayErrorCallback(props.delayError);
    } else {
      clearTimeout(timer);
      delayErrorCallback = null;
      error2 ? set(_formState.errors, name, error2) : unset(_formState.errors, name);
    }
    if ((error2 ? !deepEqual(previousFieldError, error2) : previousFieldError) || !isEmptyObject(fieldState) || shouldUpdateValid) {
      const updatedFormState = {
        ...fieldState,
        ...shouldUpdateValid && isBoolean(isValid) ? { isValid } : {},
        errors: _formState.errors,
        name
      };
      _formState = {
        ..._formState,
        ...updatedFormState
      };
      _subjects.state.next(updatedFormState);
    }
  };
  const _executeSchema = async (name) => {
    _updateIsValidating(name, true);
    const result = await _options.resolver(_formValues, _options.context, getResolverOptions(name || _names.mount, _fields, _options.criteriaMode, _options.shouldUseNativeValidation));
    _updateIsValidating(name);
    return result;
  };
  const executeSchemaAndUpdateState = async (names2) => {
    const { errors: errors2 } = await _executeSchema(names2);
    if (names2) {
      for (const name of names2) {
        const error2 = get(errors2, name);
        error2 ? set(_formState.errors, name, error2) : unset(_formState.errors, name);
      }
    } else {
      _formState.errors = errors2;
    }
    return errors2;
  };
  const executeBuiltInValidation = async (fields, shouldOnlyCheckValid, context = {
    valid: true
  }) => {
    for (const name in fields) {
      const field = fields[name];
      if (field) {
        const { _f, ...fieldValue } = field;
        if (_f) {
          const isFieldArrayRoot = _names.array.has(_f.name);
          const isPromiseFunction = field._f && hasPromiseValidation(field._f);
          if (isPromiseFunction && _proxyFormState.validatingFields) {
            _updateIsValidating([name], true);
          }
          const fieldError = await validateField(field, _formValues, shouldDisplayAllAssociatedErrors, _options.shouldUseNativeValidation && !shouldOnlyCheckValid, isFieldArrayRoot);
          if (isPromiseFunction && _proxyFormState.validatingFields) {
            _updateIsValidating([name]);
          }
          if (fieldError[_f.name]) {
            context.valid = false;
            if (shouldOnlyCheckValid) {
              break;
            }
          }
          !shouldOnlyCheckValid && (get(fieldError, _f.name) ? isFieldArrayRoot ? updateFieldArrayRootError(_formState.errors, fieldError, _f.name) : set(_formState.errors, _f.name, fieldError[_f.name]) : unset(_formState.errors, _f.name));
        }
        !isEmptyObject(fieldValue) && await executeBuiltInValidation(fieldValue, shouldOnlyCheckValid, context);
      }
    }
    return context.valid;
  };
  const _removeUnmounted = () => {
    for (const name of _names.unMount) {
      const field = get(_fields, name);
      field && (field._f.refs ? field._f.refs.every((ref2) => !live(ref2)) : !live(field._f.ref)) && unregister(name);
    }
    _names.unMount = /* @__PURE__ */ new Set();
  };
  const _getDirty = (name, data) => !props.disabled && (name && data && set(_formValues, name, data), !deepEqual(getValues(), _defaultValues));
  const _getWatch = (names2, defaultValue, isGlobal) => generateWatchOutput(names2, _names, {
    ..._state.mount ? _formValues : isUndefined(defaultValue) ? _defaultValues : isString(names2) ? { [names2]: defaultValue } : defaultValue
  }, isGlobal, defaultValue);
  const _getFieldArray = (name) => compact(get(_state.mount ? _formValues : _defaultValues, name, props.shouldUnregister ? get(_defaultValues, name, []) : []));
  const setFieldValue = (name, value, options = {}) => {
    const field = get(_fields, name);
    let fieldValue = value;
    if (field) {
      const fieldReference = field._f;
      if (fieldReference) {
        !fieldReference.disabled && set(_formValues, name, getFieldValueAs(value, fieldReference));
        fieldValue = isHTMLElement(fieldReference.ref) && isNullOrUndefined(value) ? "" : value;
        if (isMultipleSelect(fieldReference.ref)) {
          [...fieldReference.ref.options].forEach((optionRef) => optionRef.selected = fieldValue.includes(optionRef.value));
        } else if (fieldReference.refs) {
          if (isCheckBoxInput(fieldReference.ref)) {
            fieldReference.refs.length > 1 ? fieldReference.refs.forEach((checkboxRef) => (!checkboxRef.defaultChecked || !checkboxRef.disabled) && (checkboxRef.checked = Array.isArray(fieldValue) ? !!fieldValue.find((data) => data === checkboxRef.value) : fieldValue === checkboxRef.value)) : fieldReference.refs[0] && (fieldReference.refs[0].checked = !!fieldValue);
          } else {
            fieldReference.refs.forEach((radioRef) => radioRef.checked = radioRef.value === fieldValue);
          }
        } else if (isFileInput(fieldReference.ref)) {
          fieldReference.ref.value = "";
        } else {
          fieldReference.ref.value = fieldValue;
          if (!fieldReference.ref.type) {
            _subjects.values.next({
              name,
              values: { ..._formValues }
            });
          }
        }
      }
    }
    (options.shouldDirty || options.shouldTouch) && updateTouchAndDirty(name, fieldValue, options.shouldTouch, options.shouldDirty, true);
    options.shouldValidate && trigger(name);
  };
  const setValues = (name, value, options) => {
    for (const fieldKey in value) {
      const fieldValue = value[fieldKey];
      const fieldName = `${name}.${fieldKey}`;
      const field = get(_fields, fieldName);
      (_names.array.has(name) || isObject(fieldValue) || field && !field._f) && !isDateObject(fieldValue) ? setValues(fieldName, fieldValue, options) : setFieldValue(fieldName, fieldValue, options);
    }
  };
  const setValue = (name, value, options = {}) => {
    const field = get(_fields, name);
    const isFieldArray = _names.array.has(name);
    const cloneValue = cloneObject(value);
    set(_formValues, name, cloneValue);
    if (isFieldArray) {
      _subjects.array.next({
        name,
        values: { ..._formValues }
      });
      if ((_proxyFormState.isDirty || _proxyFormState.dirtyFields) && options.shouldDirty) {
        _subjects.state.next({
          name,
          dirtyFields: getDirtyFields(_defaultValues, _formValues),
          isDirty: _getDirty(name, cloneValue)
        });
      }
    } else {
      field && !field._f && !isNullOrUndefined(cloneValue) ? setValues(name, cloneValue, options) : setFieldValue(name, cloneValue, options);
    }
    isWatched(name, _names) && _subjects.state.next({ ..._formState });
    _subjects.values.next({
      name: _state.mount ? name : void 0,
      values: { ..._formValues }
    });
  };
  const onChange = async (event) => {
    _state.mount = true;
    const target = event.target;
    let name = target.name;
    let isFieldValueUpdated = true;
    const field = get(_fields, name);
    const getCurrentFieldValue = () => target.type ? getFieldValue(field._f) : getEventValue(event);
    const _updateIsFieldValueUpdated = (fieldValue) => {
      isFieldValueUpdated = Number.isNaN(fieldValue) || isDateObject(fieldValue) && isNaN(fieldValue.getTime()) || deepEqual(fieldValue, get(_formValues, name, fieldValue));
    };
    if (field) {
      let error2;
      let isValid;
      const fieldValue = getCurrentFieldValue();
      const isBlurEvent = event.type === EVENTS.BLUR || event.type === EVENTS.FOCUS_OUT;
      const shouldSkipValidation = !hasValidation(field._f) && !_options.resolver && !get(_formState.errors, name) && !field._f.deps || skipValidation(isBlurEvent, get(_formState.touchedFields, name), _formState.isSubmitted, validationModeAfterSubmit, validationModeBeforeSubmit);
      const watched = isWatched(name, _names, isBlurEvent);
      set(_formValues, name, fieldValue);
      if (isBlurEvent) {
        field._f.onBlur && field._f.onBlur(event);
        delayErrorCallback && delayErrorCallback(0);
      } else if (field._f.onChange) {
        field._f.onChange(event);
      }
      const fieldState = updateTouchAndDirty(name, fieldValue, isBlurEvent, false);
      const shouldRender = !isEmptyObject(fieldState) || watched;
      !isBlurEvent && _subjects.values.next({
        name,
        type: event.type,
        values: { ..._formValues }
      });
      if (shouldSkipValidation) {
        if (_proxyFormState.isValid) {
          if (props.mode === "onBlur") {
            if (isBlurEvent) {
              _updateValid();
            }
          } else {
            _updateValid();
          }
        }
        return shouldRender && _subjects.state.next({ name, ...watched ? {} : fieldState });
      }
      !isBlurEvent && watched && _subjects.state.next({ ..._formState });
      if (_options.resolver) {
        const { errors: errors2 } = await _executeSchema([name]);
        _updateIsFieldValueUpdated(fieldValue);
        if (isFieldValueUpdated) {
          const previousErrorLookupResult = schemaErrorLookup(_formState.errors, _fields, name);
          const errorLookupResult = schemaErrorLookup(errors2, _fields, previousErrorLookupResult.name || name);
          error2 = errorLookupResult.error;
          name = errorLookupResult.name;
          isValid = isEmptyObject(errors2);
        }
      } else {
        _updateIsValidating([name], true);
        error2 = (await validateField(field, _formValues, shouldDisplayAllAssociatedErrors, _options.shouldUseNativeValidation))[name];
        _updateIsValidating([name]);
        _updateIsFieldValueUpdated(fieldValue);
        if (isFieldValueUpdated) {
          if (error2) {
            isValid = false;
          } else if (_proxyFormState.isValid) {
            isValid = await executeBuiltInValidation(_fields, true);
          }
        }
      }
      if (isFieldValueUpdated) {
        field._f.deps && trigger(field._f.deps);
        shouldRenderByError(name, isValid, error2, fieldState);
      }
    }
  };
  const _focusInput = (ref2, key) => {
    if (get(_formState.errors, key) && ref2.focus) {
      ref2.focus();
      return 1;
    }
    return;
  };
  const trigger = async (name, options = {}) => {
    let isValid;
    let validationResult;
    const fieldNames = convertToArrayPayload(name);
    if (_options.resolver) {
      const errors2 = await executeSchemaAndUpdateState(isUndefined(name) ? name : fieldNames);
      isValid = isEmptyObject(errors2);
      validationResult = name ? !fieldNames.some((name2) => get(errors2, name2)) : isValid;
    } else if (name) {
      validationResult = (await Promise.all(fieldNames.map(async (fieldName) => {
        const field = get(_fields, fieldName);
        return await executeBuiltInValidation(field && field._f ? { [fieldName]: field } : field);
      }))).every(Boolean);
      !(!validationResult && !_formState.isValid) && _updateValid();
    } else {
      validationResult = isValid = await executeBuiltInValidation(_fields);
    }
    _subjects.state.next({
      ...!isString(name) || _proxyFormState.isValid && isValid !== _formState.isValid ? {} : { name },
      ..._options.resolver || !name ? { isValid } : {},
      errors: _formState.errors
    });
    options.shouldFocus && !validationResult && iterateFieldsByAction(_fields, _focusInput, name ? fieldNames : _names.mount);
    return validationResult;
  };
  const getValues = (fieldNames) => {
    const values = {
      ..._state.mount ? _formValues : _defaultValues
    };
    return isUndefined(fieldNames) ? values : isString(fieldNames) ? get(values, fieldNames) : fieldNames.map((name) => get(values, name));
  };
  const getFieldState = (name, formState) => ({
    invalid: !!get((formState || _formState).errors, name),
    isDirty: !!get((formState || _formState).dirtyFields, name),
    error: get((formState || _formState).errors, name),
    isValidating: !!get(_formState.validatingFields, name),
    isTouched: !!get((formState || _formState).touchedFields, name)
  });
  const clearErrors = (name) => {
    name && convertToArrayPayload(name).forEach((inputName) => unset(_formState.errors, inputName));
    _subjects.state.next({
      errors: name ? _formState.errors : {}
    });
  };
  const setError = (name, error2, options) => {
    const ref2 = (get(_fields, name, { _f: {} })._f || {}).ref;
    const currentError = get(_formState.errors, name) || {};
    const { ref: currentRef, message, type: type2, ...restOfErrorTree } = currentError;
    set(_formState.errors, name, {
      ...restOfErrorTree,
      ...error2,
      ref: ref2
    });
    _subjects.state.next({
      name,
      errors: _formState.errors,
      isValid: false
    });
    options && options.shouldFocus && ref2 && ref2.focus && ref2.focus();
  };
  const watch = (name, defaultValue) => isFunction(name) ? _subjects.values.subscribe({
    next: (payload) => name(_getWatch(void 0, defaultValue), payload)
  }) : _getWatch(name, defaultValue, true);
  const unregister = (name, options = {}) => {
    for (const fieldName of name ? convertToArrayPayload(name) : _names.mount) {
      _names.mount.delete(fieldName);
      _names.array.delete(fieldName);
      if (!options.keepValue) {
        unset(_fields, fieldName);
        unset(_formValues, fieldName);
      }
      !options.keepError && unset(_formState.errors, fieldName);
      !options.keepDirty && unset(_formState.dirtyFields, fieldName);
      !options.keepTouched && unset(_formState.touchedFields, fieldName);
      !options.keepIsValidating && unset(_formState.validatingFields, fieldName);
      !_options.shouldUnregister && !options.keepDefaultValue && unset(_defaultValues, fieldName);
    }
    _subjects.values.next({
      values: { ..._formValues }
    });
    _subjects.state.next({
      ..._formState,
      ...!options.keepDirty ? {} : { isDirty: _getDirty() }
    });
    !options.keepIsValid && _updateValid();
  };
  const _updateDisabledField = ({ disabled, name, field, fields, value }) => {
    if (isBoolean(disabled) && _state.mount || !!disabled) {
      const inputValue = disabled ? void 0 : isUndefined(value) ? getFieldValue(field ? field._f : get(fields, name)._f) : value;
      set(_formValues, name, inputValue);
      updateTouchAndDirty(name, inputValue, false, false, true);
    }
  };
  const register = (name, options = {}) => {
    let field = get(_fields, name);
    const disabledIsDefined = isBoolean(options.disabled) || isBoolean(props.disabled);
    set(_fields, name, {
      ...field || {},
      _f: {
        ...field && field._f ? field._f : { ref: { name } },
        name,
        mount: true,
        ...options
      }
    });
    _names.mount.add(name);
    if (field) {
      _updateDisabledField({
        field,
        disabled: isBoolean(options.disabled) ? options.disabled : props.disabled,
        name,
        value: options.value
      });
    } else {
      updateValidAndValue(name, true, options.value);
    }
    return {
      ...disabledIsDefined ? { disabled: options.disabled || props.disabled } : {},
      ..._options.progressive ? {
        required: !!options.required,
        min: getRuleValue(options.min),
        max: getRuleValue(options.max),
        minLength: getRuleValue(options.minLength),
        maxLength: getRuleValue(options.maxLength),
        pattern: getRuleValue(options.pattern)
      } : {},
      name,
      onChange,
      onBlur: onChange,
      ref: (ref2) => {
        if (ref2) {
          register(name, options);
          field = get(_fields, name);
          const fieldRef = isUndefined(ref2.value) ? ref2.querySelectorAll ? ref2.querySelectorAll("input,select,textarea")[0] || ref2 : ref2 : ref2;
          const radioOrCheckbox = isRadioOrCheckbox(fieldRef);
          const refs = field._f.refs || [];
          if (radioOrCheckbox ? refs.find((option) => option === fieldRef) : fieldRef === field._f.ref) {
            return;
          }
          set(_fields, name, {
            _f: {
              ...field._f,
              ...radioOrCheckbox ? {
                refs: [
                  ...refs.filter(live),
                  fieldRef,
                  ...Array.isArray(get(_defaultValues, name)) ? [{}] : []
                ],
                ref: { type: fieldRef.type, name }
              } : { ref: fieldRef }
            }
          });
          updateValidAndValue(name, false, void 0, fieldRef);
        } else {
          field = get(_fields, name, {});
          if (field._f) {
            field._f.mount = false;
          }
          (_options.shouldUnregister || options.shouldUnregister) && !(isNameInFieldArray(_names.array, name) && _state.action) && _names.unMount.add(name);
        }
      }
    };
  };
  const _focusError = () => _options.shouldFocusError && iterateFieldsByAction(_fields, _focusInput, _names.mount);
  const _disableForm = (disabled) => {
    if (isBoolean(disabled)) {
      _subjects.state.next({ disabled });
      iterateFieldsByAction(_fields, (ref2, name) => {
        const currentField = get(_fields, name);
        if (currentField) {
          ref2.disabled = currentField._f.disabled || disabled;
          if (Array.isArray(currentField._f.refs)) {
            currentField._f.refs.forEach((inputRef) => {
              inputRef.disabled = currentField._f.disabled || disabled;
            });
          }
        }
      }, 0, false);
    }
  };
  const handleSubmit = (onValid, onInvalid) => async (e) => {
    let onValidError = void 0;
    if (e) {
      e.preventDefault && e.preventDefault();
      e.persist && e.persist();
    }
    let fieldValues = cloneObject(_formValues);
    _subjects.state.next({
      isSubmitting: true
    });
    if (_options.resolver) {
      const { errors: errors2, values } = await _executeSchema();
      _formState.errors = errors2;
      fieldValues = values;
    } else {
      await executeBuiltInValidation(_fields);
    }
    unset(_formState.errors, "root");
    if (isEmptyObject(_formState.errors)) {
      _subjects.state.next({
        errors: {}
      });
      try {
        await onValid(fieldValues, e);
      } catch (error2) {
        onValidError = error2;
      }
    } else {
      if (onInvalid) {
        await onInvalid({ ..._formState.errors }, e);
      }
      _focusError();
      setTimeout(_focusError);
    }
    _subjects.state.next({
      isSubmitted: true,
      isSubmitting: false,
      isSubmitSuccessful: isEmptyObject(_formState.errors) && !onValidError,
      submitCount: _formState.submitCount + 1,
      errors: _formState.errors
    });
    if (onValidError) {
      throw onValidError;
    }
  };
  const resetField = (name, options = {}) => {
    if (get(_fields, name)) {
      if (isUndefined(options.defaultValue)) {
        setValue(name, cloneObject(get(_defaultValues, name)));
      } else {
        setValue(name, options.defaultValue);
        set(_defaultValues, name, cloneObject(options.defaultValue));
      }
      if (!options.keepTouched) {
        unset(_formState.touchedFields, name);
      }
      if (!options.keepDirty) {
        unset(_formState.dirtyFields, name);
        _formState.isDirty = options.defaultValue ? _getDirty(name, cloneObject(get(_defaultValues, name))) : _getDirty();
      }
      if (!options.keepError) {
        unset(_formState.errors, name);
        _proxyFormState.isValid && _updateValid();
      }
      _subjects.state.next({ ..._formState });
    }
  };
  const _reset = (formValues, keepStateOptions = {}) => {
    const updatedValues = formValues ? cloneObject(formValues) : _defaultValues;
    const cloneUpdatedValues = cloneObject(updatedValues);
    const isEmptyResetValues = isEmptyObject(formValues);
    const values = isEmptyResetValues ? _defaultValues : cloneUpdatedValues;
    if (!keepStateOptions.keepDefaultValues) {
      _defaultValues = updatedValues;
    }
    if (!keepStateOptions.keepValues) {
      if (keepStateOptions.keepDirtyValues) {
        const fieldsToCheck = /* @__PURE__ */ new Set([
          ..._names.mount,
          ...Object.keys(getDirtyFields(_defaultValues, _formValues))
        ]);
        for (const fieldName of Array.from(fieldsToCheck)) {
          get(_formState.dirtyFields, fieldName) ? set(values, fieldName, get(_formValues, fieldName)) : setValue(fieldName, get(values, fieldName));
        }
      } else {
        if (isWeb && isUndefined(formValues)) {
          for (const name of _names.mount) {
            const field = get(_fields, name);
            if (field && field._f) {
              const fieldReference = Array.isArray(field._f.refs) ? field._f.refs[0] : field._f.ref;
              if (isHTMLElement(fieldReference)) {
                const form = fieldReference.closest("form");
                if (form) {
                  form.reset();
                  break;
                }
              }
            }
          }
        }
        _fields = {};
      }
      _formValues = props.shouldUnregister ? keepStateOptions.keepDefaultValues ? cloneObject(_defaultValues) : {} : cloneObject(values);
      _subjects.array.next({
        values: { ...values }
      });
      _subjects.values.next({
        values: { ...values }
      });
    }
    _names = {
      mount: keepStateOptions.keepDirtyValues ? _names.mount : /* @__PURE__ */ new Set(),
      unMount: /* @__PURE__ */ new Set(),
      array: /* @__PURE__ */ new Set(),
      watch: /* @__PURE__ */ new Set(),
      watchAll: false,
      focus: ""
    };
    _state.mount = !_proxyFormState.isValid || !!keepStateOptions.keepIsValid || !!keepStateOptions.keepDirtyValues;
    _state.watch = !!props.shouldUnregister;
    _subjects.state.next({
      submitCount: keepStateOptions.keepSubmitCount ? _formState.submitCount : 0,
      isDirty: isEmptyResetValues ? false : keepStateOptions.keepDirty ? _formState.isDirty : !!(keepStateOptions.keepDefaultValues && !deepEqual(formValues, _defaultValues)),
      isSubmitted: keepStateOptions.keepIsSubmitted ? _formState.isSubmitted : false,
      dirtyFields: isEmptyResetValues ? {} : keepStateOptions.keepDirtyValues ? keepStateOptions.keepDefaultValues && _formValues ? getDirtyFields(_defaultValues, _formValues) : _formState.dirtyFields : keepStateOptions.keepDefaultValues && formValues ? getDirtyFields(_defaultValues, formValues) : keepStateOptions.keepDirty ? _formState.dirtyFields : {},
      touchedFields: keepStateOptions.keepTouched ? _formState.touchedFields : {},
      errors: keepStateOptions.keepErrors ? _formState.errors : {},
      isSubmitSuccessful: keepStateOptions.keepIsSubmitSuccessful ? _formState.isSubmitSuccessful : false,
      isSubmitting: false
    });
  };
  const reset = (formValues, keepStateOptions) => _reset(isFunction(formValues) ? formValues(_formValues) : formValues, keepStateOptions);
  const setFocus = (name, options = {}) => {
    const field = get(_fields, name);
    const fieldReference = field && field._f;
    if (fieldReference) {
      const fieldRef = fieldReference.refs ? fieldReference.refs[0] : fieldReference.ref;
      if (fieldRef.focus) {
        fieldRef.focus();
        options.shouldSelect && fieldRef.select();
      }
    }
  };
  const _updateFormState = (updatedFormState) => {
    _formState = {
      ..._formState,
      ...updatedFormState
    };
  };
  const _resetDefaultValues = () => isFunction(_options.defaultValues) && _options.defaultValues().then((values) => {
    reset(values, _options.resetOptions);
    _subjects.state.next({
      isLoading: false
    });
  });
  return {
    control: {
      register,
      unregister,
      getFieldState,
      handleSubmit,
      setError,
      _executeSchema,
      _getWatch,
      _getDirty,
      _updateValid,
      _removeUnmounted,
      _updateFieldArray,
      _updateDisabledField,
      _getFieldArray,
      _reset,
      _resetDefaultValues,
      _updateFormState,
      _disableForm,
      _subjects,
      _proxyFormState,
      _setErrors,
      get _fields() {
        return _fields;
      },
      get _formValues() {
        return _formValues;
      },
      get _state() {
        return _state;
      },
      set _state(value) {
        _state = value;
      },
      get _defaultValues() {
        return _defaultValues;
      },
      get _names() {
        return _names;
      },
      set _names(value) {
        _names = value;
      },
      get _formState() {
        return _formState;
      },
      set _formState(value) {
        _formState = value;
      },
      get _options() {
        return _options;
      },
      set _options(value) {
        _options = {
          ..._options,
          ...value
        };
      }
    },
    trigger,
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    resetField,
    clearErrors,
    unregister,
    setError,
    setFocus,
    getFieldState
  };
}
function useForm(props = {}) {
  const _formControl = React.useRef();
  const _values = React.useRef();
  const [formState, updateFormState] = React.useState({
    isDirty: false,
    isValidating: false,
    isLoading: isFunction(props.defaultValues),
    isSubmitted: false,
    isSubmitting: false,
    isSubmitSuccessful: false,
    isValid: false,
    submitCount: 0,
    dirtyFields: {},
    touchedFields: {},
    validatingFields: {},
    errors: props.errors || {},
    disabled: props.disabled || false,
    defaultValues: isFunction(props.defaultValues) ? void 0 : props.defaultValues
  });
  if (!_formControl.current) {
    _formControl.current = {
      ...createFormControl(props),
      formState
    };
  }
  const control = _formControl.current.control;
  control._options = props;
  useSubscribe({
    subject: control._subjects.state,
    next: (value) => {
      if (shouldRenderFormState(value, control._proxyFormState, control._updateFormState, true)) {
        updateFormState({ ...control._formState });
      }
    }
  });
  React.useEffect(() => control._disableForm(props.disabled), [control, props.disabled]);
  React.useEffect(() => {
    if (control._proxyFormState.isDirty) {
      const isDirty = control._getDirty();
      if (isDirty !== formState.isDirty) {
        control._subjects.state.next({
          isDirty
        });
      }
    }
  }, [control, formState.isDirty]);
  React.useEffect(() => {
    if (props.values && !deepEqual(props.values, _values.current)) {
      control._reset(props.values, control._options.resetOptions);
      _values.current = props.values;
      updateFormState((state) => ({ ...state }));
    } else {
      control._resetDefaultValues();
    }
  }, [props.values, control]);
  React.useEffect(() => {
    if (props.errors) {
      control._setErrors(props.errors);
    }
  }, [props.errors, control]);
  React.useEffect(() => {
    if (!control._state.mount) {
      control._updateValid();
      control._state.mount = true;
    }
    if (control._state.watch) {
      control._state.watch = false;
      control._subjects.state.next({ ...control._formState });
    }
    control._removeUnmounted();
  });
  React.useEffect(() => {
    props.shouldUnregister && control._subjects.values.next({
      values: control._getWatch()
    });
  }, [props.shouldUnregister, control]);
  React.useEffect(() => {
    if (_formControl.current) {
      _formControl.current.watch = _formControl.current.watch.bind({});
    }
  }, [formState]);
  _formControl.current.formState = getProxyFormState(formState, control);
  return _formControl.current;
}
var L = Object.defineProperty;
var F = (t2, a) => L(t2, "name", { value: a, configurable: true });
var C = F(({ refineCoreProps: t2, warnWhenUnsavedChanges: a, disableServerSideValidation: c = false, ...g } = {}) => {
  let { options: R } = ge(), S = (R == null ? void 0 : R.disableServerSideValidation) || c, h = $(), { warnWhenUnsavedChanges: U, setWarnWhen: b } = vt(), f = a ?? U, o2 = useForm({ ...g }), { watch: m, setValue: y, getValues: i2, handleSubmit: n2, setError: E } = o2, x = ah({ ...t2, onMutationError: (r2, s2, e) => {
    var v, H;
    if (S) {
      (v = t2 == null ? void 0 : t2.onMutationError) == null || v.call(t2, r2, s2, e);
      return;
    }
    let u = r2 == null ? void 0 : r2.errors;
    for (let V in u) {
      if (!Object.keys(Rr(s2)).includes(V)) continue;
      let p = u[V], D = "";
      Array.isArray(p) && (D = p.join(" ")), typeof p == "string" && (D = p), typeof p == "boolean" && p && (D = "Field is not valid."), typeof p == "object" && "key" in p && (D = h(p.key, p.message)), E(V, { message: D });
    }
    (H = t2 == null ? void 0 : t2.onMutationError) == null || H.call(t2, r2, s2, e);
  } }), { query: l, onFinish: d, formLoading: B, onFinishAutoSave: M } = x;
  reactExports.useEffect(() => {
    var e;
    let r2 = (e = l == null ? void 0 : l.data) == null ? void 0 : e.data;
    if (!r2) return;
    Object.keys(Rr(i2())).forEach((u) => {
      let v = has(r2, u), H = get$1(r2, u);
      v && y(u, H);
    });
  }, [l == null ? void 0 : l.data, y, i2]), reactExports.useEffect(() => {
    let r2 = m((s2, { type: e }) => {
      e === "change" && W(s2);
    });
    return () => r2.unsubscribe();
  }, [m]);
  let W = F((r2) => {
    var s2;
    if (f && b(true), t2 != null && t2.autoSave) {
      b(false);
      let e = ((s2 = t2.autoSave) == null ? void 0 : s2.onFinish) ?? ((u) => u);
      return M(e(r2)).catch((u) => u);
    }
    return r2;
  }, "onValuesChange"), Q = F((r2, s2) => async (e) => (b(false), n2(r2, s2)(e)), "handleSubmit");
  return { ...o2, handleSubmit: Q, refineCore: x, saveButtonProps: { disabled: B, onClick: (r2) => {
    Q((s2) => d(s2).catch(() => {
    }), () => false)(r2);
  } } };
}, "useForm");
F(({ stepsProps: t2, ...a } = {}) => {
  let { defaultStep: c = 0, isBackValidate: g = false } = t2 ?? {}, [R, S] = reactExports.useState(c), h = C({ ...a }), { trigger: U, getValues: b, setValue: f, formState: { dirtyFields: o2 }, refineCore: { query: m } } = h;
  reactExports.useEffect(() => {
    var x;
    let n2 = (x = m == null ? void 0 : m.data) == null ? void 0 : x.data;
    if (!n2) return;
    let E = Object.keys(b());
    console.log({ dirtyFields: o2, registeredFields: E, data: n2 }), Object.entries(n2).forEach(([l, d]) => {
      let B = l;
      E.includes(B) && (get$1(o2, B) || f(B, d));
    });
  }, [m == null ? void 0 : m.data, R, f, b]);
  let y = F((n2) => {
    let E = n2;
    n2 < 0 && (E = 0), S(E);
  }, "go");
  return { ...h, steps: { currentStep: R, gotoStep: F(async (n2) => {
    if (n2 === R) return;
    if (n2 < R && !g) {
      y(n2);
      return;
    }
    await U() && y(n2);
  }, "gotoStep") } };
}, "useStepsForm");
F(({ modalProps: t2, refineCoreProps: a, syncWithLocation: c, ...g } = {}) => {
  var A, N;
  let R = Ae(), [S, h] = React.useState(false), U = $(), { resource: b, action: f } = a ?? {}, { resource: o2, action: m, identifier: y } = Y(b), i2 = Te(), n2 = Le(), E = Pt(), x = f ?? m ?? "", l = !(typeof c == "object" && (c == null ? void 0 : c.syncId) === false), d = typeof c == "object" && "key" in c ? c.key : o2 && x && c ? `modal-${y}-${x}` : void 0, { defaultVisible: B = false, autoSubmitClose: M = true, autoResetForm: W = true } = t2 ?? {}, Q = C({ refineCoreProps: { ...a, meta: { ...d ? { [d]: void 0 } : {}, ...a == null ? void 0 : a.meta } }, ...g }), { reset: $$1, refineCore: { onFinish: r2, id: s2, setId: e, autoSaveProps: u }, saveButtonProps: v, handleSubmit: H } = Q, { visible: V, show: k, close: p } = rR({ defaultVisible: B });
  React.useEffect(() => {
    var T, j, K, I;
    if (S === false && d) {
      let w = (j = (T = i2 == null ? void 0 : i2.params) == null ? void 0 : T[d]) == null ? void 0 : j.open;
      if (typeof w == "boolean" ? w && k() : typeof w == "string" && w === "true" && k(), l) {
        let G = (I = (K = i2 == null ? void 0 : i2.params) == null ? void 0 : K[d]) == null ? void 0 : I.id;
        G && (e == null || e(G));
      }
      h(true);
    }
  }, [d, i2, l, e]), React.useEffect(() => {
    var T;
    S === true && (V && d ? n2({ query: { [d]: { ...(T = i2 == null ? void 0 : i2.params) == null ? void 0 : T[d], open: true, ...l && s2 && { id: s2 } } }, options: { keepQuery: true }, type: "replace" }) : d && !V && n2({ query: { [d]: void 0 }, options: { keepQuery: true }, type: "replace" }));
  }, [s2, V, k, d, l]);
  let D = F(async (T) => {
    await r2(T), M && p(), W && $$1();
  }, "submit"), { warnWhen: O, setWarnWhen: X2 } = vt(), Z = reactExports.useCallback(() => {
    var T;
    if (u.status === "success" && ((T = a == null ? void 0 : a.autoSave) != null && T.invalidateOnClose) && R({ id: s2, invalidates: a.invalidates || ["list", "many", "detail"], dataProviderName: a.dataProviderName, resource: y }), O) if (window.confirm(U("warnWhenUnsavedChanges", "Are you sure you want to leave? You have unsaved changes."))) X2(false);
    else return;
    e == null || e(void 0), p();
  }, [O, u.status]), _ = reactExports.useCallback((T) => {
    typeof T < "u" && (e == null || e(T)), (!(x === "edit" || x === "clone") || (typeof T < "u" || typeof s2 < "u")) && k();
  }, [s2]), q = U(`${y}.titles.${f}`, void 0, `${E(`${f} ${((A = o2 == null ? void 0 : o2.meta) == null ? void 0 : A.label) ?? ((N = o2 == null ? void 0 : o2.options) == null ? void 0 : N.label) ?? (o2 == null ? void 0 : o2.label) ?? y}`, "singular")}`);
  return { modal: { submit: D, close: Z, show: _, visible: V, title: q }, ...Q, saveButtonProps: { ...v, onClick: (T) => H(D)(T) } };
}, "useModalForm");
const parseAnyOf = (schema, refs) => {
  return schema.anyOf.length ? schema.anyOf.length === 1 ? parseSchema(schema.anyOf[0], {
    ...refs,
    path: [...refs.path, "anyOf", 0]
  }) : `z.union([${schema.anyOf.map((schema2, i2) => parseSchema(schema2, { ...refs, path: [...refs.path, "anyOf", i2] })).join(", ")}])` : `z.any()`;
};
const parseBoolean = (_schema) => {
  return "z.boolean()";
};
const parseDefault = (_schema) => {
  return "z.any()";
};
const parseMultipleType = (schema, refs) => {
  return `z.union([${schema.type.map((type2) => parseSchema({ ...schema, type: type2 }, refs)).join(", ")}])`;
};
const parseNot = (schema, refs) => {
  return `z.any().refine((value) => !${parseSchema(schema.not, {
    ...refs,
    path: [...refs.path, "not"]
  })}.safeParse(value).success, "Invalid input: Should NOT be valid against schema")`;
};
const parseNull = (_schema) => {
  return "z.null()";
};
const half = (arr) => {
  return [arr.slice(0, arr.length / 2), arr.slice(arr.length / 2)];
};
const originalIndex = Symbol("Original index");
const ensureOriginalIndex = (arr) => {
  let newArr = [];
  for (let i2 = 0; i2 < arr.length; i2++) {
    const item = arr[i2];
    if (typeof item === "boolean") {
      newArr.push(item ? { [originalIndex]: i2 } : { [originalIndex]: i2, not: {} });
    } else if (originalIndex in item) {
      return arr;
    } else {
      newArr.push({ ...item, [originalIndex]: i2 });
    }
  }
  return newArr;
};
function parseAllOf(schema, refs) {
  if (schema.allOf.length === 0) {
    return "z.never()";
  } else if (schema.allOf.length === 1) {
    const item = schema.allOf[0];
    return parseSchema(item, {
      ...refs,
      path: [...refs.path, "allOf", item[originalIndex]]
    });
  } else {
    const [left, right] = half(ensureOriginalIndex(schema.allOf));
    return `z.intersection(${parseAllOf({ allOf: left }, refs)}, ${parseAllOf({
      allOf: right
    }, refs)})`;
  }
}
function withMessage(schema, key, get2) {
  var _a;
  const value = schema[key];
  let r2 = "";
  if (value !== void 0) {
    const got = get2({ value, json: JSON.stringify(value) });
    if (got) {
      const opener = got[0];
      const prefix = got.length === 3 ? got[1] : "";
      const closer = got.length === 3 ? got[2] : got[1];
      r2 += opener;
      if (((_a = schema.errorMessage) == null ? void 0 : _a[key]) !== void 0) {
        r2 += prefix + JSON.stringify(schema.errorMessage[key]);
      }
      r2 += closer;
    }
  }
  return r2;
}
const parseArray = (schema, refs) => {
  if (Array.isArray(schema.items)) {
    return `z.tuple([${schema.items.map((v, i2) => parseSchema(v, { ...refs, path: [...refs.path, "items", i2] }))}])`;
  }
  let r2 = !schema.items ? "z.array(z.any())" : `z.array(${parseSchema(schema.items, {
    ...refs,
    path: [...refs.path, "items"]
  })})`;
  r2 += withMessage(schema, "minItems", ({ json }) => [
    `.min(${json}`,
    ", ",
    ")"
  ]);
  r2 += withMessage(schema, "maxItems", ({ json }) => [
    `.max(${json}`,
    ", ",
    ")"
  ]);
  return r2;
};
const parseConst = (schema) => {
  return `z.literal(${JSON.stringify(schema.const)})`;
};
const parseEnum = (schema) => {
  if (schema.enum.length === 0) {
    return "z.never()";
  } else if (schema.enum.length === 1) {
    return `z.literal(${JSON.stringify(schema.enum[0])})`;
  } else if (schema.enum.every((x) => typeof x === "string")) {
    return `z.enum([${schema.enum.map((x) => JSON.stringify(x))}])`;
  } else {
    return `z.union([${schema.enum.map((x) => `z.literal(${JSON.stringify(x)})`).join(", ")}])`;
  }
};
const parseIfThenElse = (schema, refs) => {
  const $if = parseSchema(schema.if, { ...refs, path: [...refs.path, "if"] });
  const $then = parseSchema(schema.then, {
    ...refs,
    path: [...refs.path, "then"]
  });
  const $else = parseSchema(schema.else, {
    ...refs,
    path: [...refs.path, "else"]
  });
  return `z.union([${$then}, ${$else}]).superRefine((value,ctx) => {
  const result = ${$if}.safeParse(value).success
    ? ${$then}.safeParse(value)
    : ${$else}.safeParse(value);
  if (!result.success) {
    result.error.errors.forEach((error) => ctx.addIssue(error))
  }
})`;
};
const parseNumber = (schema) => {
  let r2 = "z.number()";
  if (schema.type === "integer") {
    r2 += withMessage(schema, "type", () => [".int(", ")"]);
  } else {
    r2 += withMessage(schema, "format", ({ value }) => {
      if (value === "int64") {
        return [".int(", ")"];
      }
    });
  }
  r2 += withMessage(schema, "multipleOf", ({ value, json }) => {
    if (value === 1) {
      if (r2.startsWith("z.number().int(")) {
        return;
      }
      return [".int(", ")"];
    }
    return [`.multipleOf(${json}`, ", ", ")"];
  });
  if (typeof schema.minimum === "number") {
    if (schema.exclusiveMinimum === true) {
      r2 += withMessage(schema, "minimum", ({ json }) => [
        `.gt(${json}`,
        ", ",
        ")"
      ]);
    } else {
      r2 += withMessage(schema, "minimum", ({ json }) => [
        `.gte(${json}`,
        ", ",
        ")"
      ]);
    }
  } else if (typeof schema.exclusiveMinimum === "number") {
    r2 += withMessage(schema, "exclusiveMinimum", ({ json }) => [
      `.gt(${json}`,
      ", ",
      ")"
    ]);
  }
  if (typeof schema.maximum === "number") {
    if (schema.exclusiveMaximum === true) {
      r2 += withMessage(schema, "maximum", ({ json }) => [
        `.lt(${json}`,
        ", ",
        ")"
      ]);
    } else {
      r2 += withMessage(schema, "maximum", ({ json }) => [
        `.lte(${json}`,
        ", ",
        ")"
      ]);
    }
  } else if (typeof schema.exclusiveMaximum === "number") {
    r2 += withMessage(schema, "exclusiveMaximum", ({ json }) => [
      `.lt(${json}`,
      ", ",
      ")"
    ]);
  }
  return r2;
};
const parseOneOf = (schema, refs) => {
  return schema.oneOf.length ? schema.oneOf.length === 1 ? parseSchema(schema.oneOf[0], {
    ...refs,
    path: [...refs.path, "oneOf", 0]
  }) : `z.any().superRefine((x, ctx) => {
    const schemas = [${schema.oneOf.map((schema2, i2) => parseSchema(schema2, {
    ...refs,
    path: [...refs.path, "oneOf", i2]
  })).join(", ")}];
    const errors = schemas.reduce<z.ZodError[]>(
      (errors, schema) =>
        ((result) =>
          result.error ? [...errors, result.error] : errors)(
          schema.safeParse(x),
        ),
      [],
    );
    if (schemas.length - errors.length !== 1) {
      ctx.addIssue({
        path: ctx.path,
        code: "invalid_union",
        unionErrors: errors,
        message: "Invalid input: Should pass single schema",
      });
    }
  })` : "z.any()";
};
function parseObject(objectSchema, refs) {
  let properties2 = void 0;
  if (objectSchema.properties) {
    if (!Object.keys(objectSchema.properties).length) {
      properties2 = "z.object({})";
    } else {
      properties2 = "z.object({ ";
      properties2 += Object.keys(objectSchema.properties).map((key) => {
        const propSchema = objectSchema.properties[key];
        const result = `${JSON.stringify(key)}: ${parseSchema(propSchema, {
          ...refs,
          path: [...refs.path, "properties", key]
        })}`;
        const hasDefault = typeof propSchema === "object" && propSchema.default !== void 0;
        const required2 = Array.isArray(objectSchema.required) ? objectSchema.required.includes(key) : typeof propSchema === "object" && propSchema.required === true;
        const optional = !hasDefault && !required2;
        return optional ? `${result}.optional()` : result;
      }).join(", ");
      properties2 += " })";
    }
  }
  const additionalProperties2 = objectSchema.additionalProperties !== void 0 ? parseSchema(objectSchema.additionalProperties, {
    ...refs,
    path: [...refs.path, "additionalProperties"]
  }) : void 0;
  let patternProperties2 = void 0;
  if (objectSchema.patternProperties) {
    const parsedPatternProperties = Object.fromEntries(Object.entries(objectSchema.patternProperties).map(([key, value]) => {
      return [
        key,
        parseSchema(value, {
          ...refs,
          path: [...refs.path, "patternProperties", key]
        })
      ];
    }, {}));
    patternProperties2 = "";
    if (properties2) {
      if (additionalProperties2) {
        patternProperties2 += `.catchall(z.union([${[
          ...Object.values(parsedPatternProperties),
          additionalProperties2
        ].join(", ")}]))`;
      } else if (Object.keys(parsedPatternProperties).length > 1) {
        patternProperties2 += `.catchall(z.union([${Object.values(parsedPatternProperties).join(", ")}]))`;
      } else {
        patternProperties2 += `.catchall(${Object.values(parsedPatternProperties)})`;
      }
    } else {
      if (additionalProperties2) {
        patternProperties2 += `z.record(z.union([${[
          ...Object.values(parsedPatternProperties),
          additionalProperties2
        ].join(", ")}]))`;
      } else if (Object.keys(parsedPatternProperties).length > 1) {
        patternProperties2 += `z.record(z.union([${Object.values(parsedPatternProperties).join(", ")}]))`;
      } else {
        patternProperties2 += `z.record(${Object.values(parsedPatternProperties)})`;
      }
    }
    patternProperties2 += ".superRefine((value, ctx) => {\n";
    patternProperties2 += "for (const key in value) {\n";
    if (additionalProperties2) {
      if (objectSchema.properties) {
        patternProperties2 += `let evaluated = [${Object.keys(objectSchema.properties).map((key) => JSON.stringify(key)).join(", ")}].includes(key)
`;
      } else {
        patternProperties2 += `let evaluated = false
`;
      }
    }
    for (const key in objectSchema.patternProperties) {
      patternProperties2 += "if (key.match(new RegExp(" + JSON.stringify(key) + "))) {\n";
      if (additionalProperties2) {
        patternProperties2 += "evaluated = true\n";
      }
      patternProperties2 += "const result = " + parsedPatternProperties[key] + ".safeParse(value[key])\n";
      patternProperties2 += "if (!result.success) {\n";
      patternProperties2 += `ctx.addIssue({
          path: [...ctx.path, key],
          code: 'custom',
          message: \`Invalid input: Key matching regex /\${key}/ must match schema\`,
          params: {
            issues: result.error.issues
          }
        })
`;
      patternProperties2 += "}\n";
      patternProperties2 += "}\n";
    }
    if (additionalProperties2) {
      patternProperties2 += "if (!evaluated) {\n";
      patternProperties2 += "const result = " + additionalProperties2 + ".safeParse(value[key])\n";
      patternProperties2 += "if (!result.success) {\n";
      patternProperties2 += `ctx.addIssue({
          path: [...ctx.path, key],
          code: 'custom',
          message: \`Invalid input: must match catchall schema\`,
          params: {
            issues: result.error.issues
          }
        })
`;
      patternProperties2 += "}\n";
      patternProperties2 += "}\n";
    }
    patternProperties2 += "}\n";
    patternProperties2 += "})";
  }
  let output = properties2 ? patternProperties2 ? properties2 + patternProperties2 : additionalProperties2 ? additionalProperties2 === "z.never()" ? properties2 + ".strict()" : properties2 + `.catchall(${additionalProperties2})` : properties2 : patternProperties2 ? patternProperties2 : additionalProperties2 ? `z.record(${additionalProperties2})` : "z.record(z.any())";
  if (its.an.anyOf(objectSchema)) {
    output += `.and(${parseAnyOf({
      ...objectSchema,
      anyOf: objectSchema.anyOf.map((x) => typeof x === "object" && !x.type && (x.properties || x.additionalProperties || x.patternProperties) ? { ...x, type: "object" } : x)
    }, refs)})`;
  }
  if (its.a.oneOf(objectSchema)) {
    output += `.and(${parseOneOf({
      ...objectSchema,
      oneOf: objectSchema.oneOf.map((x) => typeof x === "object" && !x.type && (x.properties || x.additionalProperties || x.patternProperties) ? { ...x, type: "object" } : x)
    }, refs)})`;
  }
  if (its.an.allOf(objectSchema)) {
    output += `.and(${parseAllOf({
      ...objectSchema,
      allOf: objectSchema.allOf.map((x) => typeof x === "object" && !x.type && (x.properties || x.additionalProperties || x.patternProperties) ? { ...x, type: "object" } : x)
    }, refs)})`;
  }
  return output;
}
const parseString = (schema) => {
  let r2 = "z.string()";
  r2 += withMessage(schema, "format", ({ value }) => {
    switch (value) {
      case "email":
        return [".email(", ")"];
      case "ip":
        return [".ip(", ")"];
      case "ipv4":
        return ['.ip({ version: "v4"', ", message: ", " })"];
      case "ipv6":
        return ['.ip({ version: "v6"', ", message: ", " })"];
      case "uri":
        return [".url(", ")"];
      case "uuid":
        return [".uuid(", ")"];
      case "date-time":
        return [".datetime({ offset: true", ", message: ", " })"];
      case "time":
        return [".time(", ")"];
      case "date":
        return [".date(", ")"];
      case "binary":
        return [".base64(", ")"];
      case "duration":
        return [".duration(", ")"];
    }
  });
  r2 += withMessage(schema, "contentEncoding", ({ value }) => {
    if (value === "base64") {
      return [".base64(", ")"];
    }
  });
  r2 += withMessage(schema, "pattern", ({ json }) => [
    `.regex(new RegExp(${json})`,
    ", ",
    ")"
  ]);
  r2 += withMessage(schema, "minLength", ({ json }) => [
    `.min(${json}`,
    ", ",
    ")"
  ]);
  r2 += withMessage(schema, "maxLength", ({ json }) => [
    `.max(${json}`,
    ", ",
    ")"
  ]);
  return r2;
};
const omit = (obj, ...keys) => Object.keys(obj).reduce((acc, key) => {
  if (!keys.includes(key)) {
    acc[key] = obj[key];
  }
  return acc;
}, {});
const parseNullable = (schema, refs) => {
  return `${parseSchema(omit(schema, "nullable"), refs, true)}.nullable()`;
};
const parseSchema = (schema, refs = { seen: /* @__PURE__ */ new Map(), path: [] }, blockMeta) => {
  if (typeof schema !== "object")
    return schema ? "z.any()" : "z.never()";
  if (refs.parserOverride) {
    const custom = refs.parserOverride(schema, refs);
    if (typeof custom === "string") {
      return custom;
    }
  }
  let seen2 = refs.seen.get(schema);
  if (seen2) {
    if (seen2.r !== void 0) {
      return seen2.r;
    }
    if (refs.depth === void 0 || seen2.n >= refs.depth) {
      return "z.any()";
    }
    seen2.n += 1;
  } else {
    seen2 = { r: void 0, n: 0 };
    refs.seen.set(schema, seen2);
  }
  let parsed = selectParser(schema, refs);
  if (!blockMeta) {
    if (!refs.withoutDescribes) {
      parsed = addDescribes(schema, parsed);
    }
    if (!refs.withoutDefaults) {
      parsed = addDefaults(schema, parsed);
    }
    parsed = addAnnotations(schema, parsed);
  }
  seen2.r = parsed;
  return parsed;
};
const addDescribes = (schema, parsed) => {
  if (schema.description) {
    parsed += `.describe(${JSON.stringify(schema.description)})`;
  }
  return parsed;
};
const addDefaults = (schema, parsed) => {
  if (schema.default !== void 0) {
    parsed += `.default(${JSON.stringify(schema.default)})`;
  }
  return parsed;
};
const addAnnotations = (schema, parsed) => {
  if (schema.readOnly) {
    parsed += ".readonly()";
  }
  return parsed;
};
const selectParser = (schema, refs) => {
  if (its.a.nullable(schema)) {
    return parseNullable(schema, refs);
  } else if (its.an.object(schema)) {
    return parseObject(schema, refs);
  } else if (its.an.array(schema)) {
    return parseArray(schema, refs);
  } else if (its.an.anyOf(schema)) {
    return parseAnyOf(schema, refs);
  } else if (its.an.allOf(schema)) {
    return parseAllOf(schema, refs);
  } else if (its.a.oneOf(schema)) {
    return parseOneOf(schema, refs);
  } else if (its.a.not(schema)) {
    return parseNot(schema, refs);
  } else if (its.an.enum(schema)) {
    return parseEnum(schema);
  } else if (its.a.const(schema)) {
    return parseConst(schema);
  } else if (its.a.multipleType(schema)) {
    return parseMultipleType(schema, refs);
  } else if (its.a.primitive(schema, "string")) {
    return parseString(schema);
  } else if (its.a.primitive(schema, "number") || its.a.primitive(schema, "integer")) {
    return parseNumber(schema);
  } else if (its.a.primitive(schema, "boolean")) {
    return parseBoolean();
  } else if (its.a.primitive(schema, "null")) {
    return parseNull();
  } else if (its.a.conditional(schema)) {
    return parseIfThenElse(schema, refs);
  } else {
    return parseDefault();
  }
};
const its = {
  an: {
    object: (x) => x.type === "object",
    array: (x) => x.type === "array",
    anyOf: (x) => x.anyOf !== void 0,
    allOf: (x) => x.allOf !== void 0,
    enum: (x) => x.enum !== void 0
  },
  a: {
    nullable: (x) => x.nullable === true,
    multipleType: (x) => Array.isArray(x.type),
    not: (x) => x.not !== void 0,
    const: (x) => x.const !== void 0,
    primitive: (x, p) => x.type === p,
    conditional: (x) => Boolean("if" in x && x.if && "then" in x && "else" in x && x.then && x.else),
    oneOf: (x) => x.oneOf !== void 0
  }
};
const jsonSchemaToZod = (schema, { module, name, type: type2, noImport, ...rest } = {}) => {
  if (type2 && (!name || module !== "esm")) {
    throw new Error("Option `type` requires `name` to be set and `module` to be `esm`");
  }
  let result = parseSchema(schema, {
    module,
    name,
    path: [],
    seen: /* @__PURE__ */ new Map(),
    ...rest
  });
  if (module === "cjs") {
    result = `module.exports = ${name ? `{ ${JSON.stringify(name)}: ${result} }` : result}
`;
    if (!noImport) {
      result = `const { z } = require("zod")

${result}`;
    }
  } else if (module === "esm") {
    result = `export ${name ? `const ${name} =` : `default`} ${result}
`;
    if (!noImport) {
      result = `import { z } from "zod"

${result}`;
    }
  } else if (name) {
    result = `const ${name} = ${result}`;
  }
  if (type2 && name) {
    let typeName = typeof type2 === "string" ? type2 : `${name[0].toUpperCase()}${name.substring(1)}`;
    result += `export type ${typeName} = z.infer<typeof ${name}>
`;
  }
  return result;
};
const s = (e, s2, o2) => {
  if (e && "reportValidity" in e) {
    const r2 = get(o2, s2);
    e.setCustomValidity(r2 && r2.message || ""), e.reportValidity();
  }
}, o = (t2, e) => {
  for (const o2 in e.fields) {
    const r2 = e.fields[o2];
    r2 && r2.ref && "reportValidity" in r2.ref ? s(r2.ref, o2, t2) : r2.refs && r2.refs.forEach((e2) => s(e2, o2, t2));
  }
}, r = (s2, r2) => {
  r2.shouldUseNativeValidation && o(s2, r2);
  const f = {};
  for (const o2 in s2) {
    const n2 = get(r2.fields, o2), a = Object.assign(s2[o2] || {}, { ref: n2 && n2.ref });
    if (i(r2.names || Object.keys(s2), o2)) {
      const s3 = Object.assign({}, get(f, o2));
      set(s3, "root", a), set(f, o2, s3);
    } else set(f, o2, a);
  }
  return f;
}, i = (t2, e) => t2.some((t3) => t3.startsWith(e + "."));
var n = function(r2, e) {
  for (var n2 = {}; r2.length; ) {
    var t2 = r2[0], s2 = t2.code, i2 = t2.message, a = t2.path.join(".");
    if (!n2[a]) if ("unionErrors" in t2) {
      var u = t2.unionErrors[0].errors[0];
      n2[a] = { message: u.message, type: u.code };
    } else n2[a] = { message: i2, type: s2 };
    if ("unionErrors" in t2 && t2.unionErrors.forEach(function(e2) {
      return e2.errors.forEach(function(e3) {
        return r2.push(e3);
      });
    }), e) {
      var c = n2[a].types, f = c && c[t2.code];
      n2[a] = appendErrors(a, e, n2, s2, f ? [].concat(f, t2.message) : t2.message);
    }
    r2.shift();
  }
  return n2;
}, t = function(o$1, t2, s2) {
  return void 0 === s2 && (s2 = {}), function(i2, a, u) {
    try {
      return Promise.resolve(function(e, n2) {
        try {
          var a2 = Promise.resolve(o$1["sync" === s2.mode ? "parse" : "parseAsync"](i2, t2)).then(function(e2) {
            return u.shouldUseNativeValidation && o({}, u), { errors: {}, values: s2.raw ? i2 : e2 };
          });
        } catch (r2) {
          return n2(r2);
        }
        return a2 && a2.then ? a2.then(void 0, n2) : a2;
      }(0, function(r$1) {
        if (function(r2) {
          return Array.isArray(null == r2 ? void 0 : r2.errors);
        }(r$1)) return { values: {}, errors: r(n(r$1.errors, !u.shouldUseNativeValidation && "all" === u.criteriaMode), u) };
        throw r$1;
      }));
    } catch (r2) {
      return Promise.reject(r2);
    }
  };
};
function isBuffer(obj) {
  return obj && obj.constructor && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj);
}
function keyIdentity(key) {
  return key;
}
function flatten(target, opts) {
  opts = opts || {};
  const delimiter = opts.delimiter || ".";
  const maxDepth = opts.maxDepth;
  const transformKey = opts.transformKey || keyIdentity;
  const output = {};
  function step(object, prev, currentDepth) {
    currentDepth = currentDepth || 1;
    Object.keys(object).forEach(function(key) {
      const value = object[key];
      const isarray = opts.safe && Array.isArray(value);
      const type2 = Object.prototype.toString.call(value);
      const isbuffer = isBuffer(value);
      const isobject = type2 === "[object Object]" || type2 === "[object Array]";
      const newKey = prev ? prev + delimiter + transformKey(key) : transformKey(key);
      if (!isarray && !isbuffer && isobject && Object.keys(value).length && (!opts.maxDepth || currentDepth < maxDepth)) {
        return step(value, newKey, currentDepth + 1);
      }
      output[newKey] = value;
    });
  }
  step(target);
  return output;
}
function unflatten(target, opts) {
  opts = opts || {};
  const delimiter = opts.delimiter || ".";
  const overwrite = opts.overwrite || false;
  const transformKey = opts.transformKey || keyIdentity;
  const result = {};
  const isbuffer = isBuffer(target);
  if (isbuffer || Object.prototype.toString.call(target) !== "[object Object]") {
    return target;
  }
  function getkey(key) {
    const parsedKey = Number(key);
    return isNaN(parsedKey) || key.indexOf(".") !== -1 || opts.object ? key : parsedKey;
  }
  function addKeys(keyPrefix, recipient, target2) {
    return Object.keys(target2).reduce(function(result2, key) {
      result2[keyPrefix + delimiter + key] = target2[key];
      return result2;
    }, recipient);
  }
  function isEmpty(val) {
    const type2 = Object.prototype.toString.call(val);
    const isArray2 = type2 === "[object Array]";
    const isObject2 = type2 === "[object Object]";
    if (!val) {
      return true;
    } else if (isArray2) {
      return !val.length;
    } else if (isObject2) {
      return !Object.keys(val).length;
    }
  }
  target = Object.keys(target).reduce(function(result2, key) {
    const type2 = Object.prototype.toString.call(target[key]);
    const isObject2 = type2 === "[object Object]" || type2 === "[object Array]";
    if (!isObject2 || isEmpty(target[key])) {
      result2[key] = target[key];
      return result2;
    } else {
      return addKeys(
        key,
        result2,
        flatten(target[key], opts)
      );
    }
  }, {});
  Object.keys(target).forEach(function(key) {
    const split = key.split(delimiter).map(transformKey);
    let key1 = getkey(split.shift());
    let key2 = getkey(split[0]);
    let recipient = result;
    while (key2 !== void 0) {
      if (key1 === "__proto__") {
        return;
      }
      const type2 = Object.prototype.toString.call(recipient[key1]);
      const isobject = type2 === "[object Object]" || type2 === "[object Array]";
      if (!overwrite && !isobject && typeof recipient[key1] !== "undefined") {
        return;
      }
      if (overwrite && !isobject || !overwrite && recipient[key1] == null) {
        recipient[key1] = typeof key2 === "number" && !opts.object ? [] : {};
      }
      recipient = recipient[key1];
      if (split.length > 0) {
        key1 = getkey(split.shift());
        key2 = getkey(split[0]);
      }
    }
    recipient[key1] = unflatten(target[key], opts);
  });
  return result;
}
var _2020 = { exports: {} };
var core$3 = {};
var validate = {};
var boolSchema = {};
var errors = {};
var codegen = {};
var code$1 = {};
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.regexpCode = exports.getEsmExportName = exports.getProperty = exports.safeStringify = exports.stringify = exports.strConcat = exports.addCodeArg = exports.str = exports._ = exports.nil = exports._Code = exports.Name = exports.IDENTIFIER = exports._CodeOrName = void 0;
  class _CodeOrName {
  }
  exports._CodeOrName = _CodeOrName;
  exports.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class Name extends _CodeOrName {
    constructor(s2) {
      super();
      if (!exports.IDENTIFIER.test(s2))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = s2;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      return false;
    }
    get names() {
      return { [this.str]: 1 };
    }
  }
  exports.Name = Name;
  class _Code extends _CodeOrName {
    constructor(code2) {
      super();
      this._items = typeof code2 === "string" ? [code2] : code2;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return false;
      const item = this._items[0];
      return item === "" || item === '""';
    }
    get str() {
      var _a;
      return (_a = this._str) !== null && _a !== void 0 ? _a : this._str = this._items.reduce((s2, c) => `${s2}${c}`, "");
    }
    get names() {
      var _a;
      return (_a = this._names) !== null && _a !== void 0 ? _a : this._names = this._items.reduce((names2, c) => {
        if (c instanceof Name)
          names2[c.str] = (names2[c.str] || 0) + 1;
        return names2;
      }, {});
    }
  }
  exports._Code = _Code;
  exports.nil = new _Code("");
  function _(strs, ...args) {
    const code2 = [strs[0]];
    let i2 = 0;
    while (i2 < args.length) {
      addCodeArg(code2, args[i2]);
      code2.push(strs[++i2]);
    }
    return new _Code(code2);
  }
  exports._ = _;
  const plus = new _Code("+");
  function str(strs, ...args) {
    const expr = [safeStringify(strs[0])];
    let i2 = 0;
    while (i2 < args.length) {
      expr.push(plus);
      addCodeArg(expr, args[i2]);
      expr.push(plus, safeStringify(strs[++i2]));
    }
    optimize(expr);
    return new _Code(expr);
  }
  exports.str = str;
  function addCodeArg(code2, arg) {
    if (arg instanceof _Code)
      code2.push(...arg._items);
    else if (arg instanceof Name)
      code2.push(arg);
    else
      code2.push(interpolate(arg));
  }
  exports.addCodeArg = addCodeArg;
  function optimize(expr) {
    let i2 = 1;
    while (i2 < expr.length - 1) {
      if (expr[i2] === plus) {
        const res = mergeExprItems(expr[i2 - 1], expr[i2 + 1]);
        if (res !== void 0) {
          expr.splice(i2 - 1, 3, res);
          continue;
        }
        expr[i2++] = "+";
      }
      i2++;
    }
  }
  function mergeExprItems(a, b) {
    if (b === '""')
      return a;
    if (a === '""')
      return b;
    if (typeof a == "string") {
      if (b instanceof Name || a[a.length - 1] !== '"')
        return;
      if (typeof b != "string")
        return `${a.slice(0, -1)}${b}"`;
      if (b[0] === '"')
        return a.slice(0, -1) + b.slice(1);
      return;
    }
    if (typeof b == "string" && b[0] === '"' && !(a instanceof Name))
      return `"${a}${b.slice(1)}`;
    return;
  }
  function strConcat(c1, c2) {
    return c2.emptyStr() ? c1 : c1.emptyStr() ? c2 : str`${c1}${c2}`;
  }
  exports.strConcat = strConcat;
  function interpolate(x) {
    return typeof x == "number" || typeof x == "boolean" || x === null ? x : safeStringify(Array.isArray(x) ? x.join(",") : x);
  }
  function stringify(x) {
    return new _Code(safeStringify(x));
  }
  exports.stringify = stringify;
  function safeStringify(x) {
    return JSON.stringify(x).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  exports.safeStringify = safeStringify;
  function getProperty(key) {
    return typeof key == "string" && exports.IDENTIFIER.test(key) ? new _Code(`.${key}`) : _`[${key}]`;
  }
  exports.getProperty = getProperty;
  function getEsmExportName(key) {
    if (typeof key == "string" && exports.IDENTIFIER.test(key)) {
      return new _Code(`${key}`);
    }
    throw new Error(`CodeGen: invalid export name: ${key}, use explicit $id name mapping`);
  }
  exports.getEsmExportName = getEsmExportName;
  function regexpCode(rx) {
    return new _Code(rx.toString());
  }
  exports.regexpCode = regexpCode;
})(code$1);
var scope = {};
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.ValueScope = exports.ValueScopeName = exports.Scope = exports.varKinds = exports.UsedValueState = void 0;
  const code_12 = code$1;
  class ValueError extends Error {
    constructor(name) {
      super(`CodeGen: "code" for ${name} not defined`);
      this.value = name.value;
    }
  }
  var UsedValueState;
  (function(UsedValueState2) {
    UsedValueState2[UsedValueState2["Started"] = 0] = "Started";
    UsedValueState2[UsedValueState2["Completed"] = 1] = "Completed";
  })(UsedValueState || (exports.UsedValueState = UsedValueState = {}));
  exports.varKinds = {
    const: new code_12.Name("const"),
    let: new code_12.Name("let"),
    var: new code_12.Name("var")
  };
  class Scope {
    constructor({ prefixes, parent } = {}) {
      this._names = {};
      this._prefixes = prefixes;
      this._parent = parent;
    }
    toName(nameOrPrefix) {
      return nameOrPrefix instanceof code_12.Name ? nameOrPrefix : this.name(nameOrPrefix);
    }
    name(prefix) {
      return new code_12.Name(this._newName(prefix));
    }
    _newName(prefix) {
      const ng = this._names[prefix] || this._nameGroup(prefix);
      return `${prefix}${ng.index++}`;
    }
    _nameGroup(prefix) {
      var _a, _b;
      if (((_b = (_a = this._parent) === null || _a === void 0 ? void 0 : _a._prefixes) === null || _b === void 0 ? void 0 : _b.has(prefix)) || this._prefixes && !this._prefixes.has(prefix)) {
        throw new Error(`CodeGen: prefix "${prefix}" is not allowed in this scope`);
      }
      return this._names[prefix] = { prefix, index: 0 };
    }
  }
  exports.Scope = Scope;
  class ValueScopeName extends code_12.Name {
    constructor(prefix, nameStr) {
      super(nameStr);
      this.prefix = prefix;
    }
    setValue(value, { property, itemIndex }) {
      this.value = value;
      this.scopePath = (0, code_12._)`.${new code_12.Name(property)}[${itemIndex}]`;
    }
  }
  exports.ValueScopeName = ValueScopeName;
  const line = (0, code_12._)`\n`;
  class ValueScope extends Scope {
    constructor(opts) {
      super(opts);
      this._values = {};
      this._scope = opts.scope;
      this.opts = { ...opts, _n: opts.lines ? line : code_12.nil };
    }
    get() {
      return this._scope;
    }
    name(prefix) {
      return new ValueScopeName(prefix, this._newName(prefix));
    }
    value(nameOrPrefix, value) {
      var _a;
      if (value.ref === void 0)
        throw new Error("CodeGen: ref must be passed in value");
      const name = this.toName(nameOrPrefix);
      const { prefix } = name;
      const valueKey = (_a = value.key) !== null && _a !== void 0 ? _a : value.ref;
      let vs = this._values[prefix];
      if (vs) {
        const _name = vs.get(valueKey);
        if (_name)
          return _name;
      } else {
        vs = this._values[prefix] = /* @__PURE__ */ new Map();
      }
      vs.set(valueKey, name);
      const s2 = this._scope[prefix] || (this._scope[prefix] = []);
      const itemIndex = s2.length;
      s2[itemIndex] = value.ref;
      name.setValue(value, { property: prefix, itemIndex });
      return name;
    }
    getValue(prefix, keyOrRef) {
      const vs = this._values[prefix];
      if (!vs)
        return;
      return vs.get(keyOrRef);
    }
    scopeRefs(scopeName, values = this._values) {
      return this._reduceValues(values, (name) => {
        if (name.scopePath === void 0)
          throw new Error(`CodeGen: name "${name}" has no value`);
        return (0, code_12._)`${scopeName}${name.scopePath}`;
      });
    }
    scopeCode(values = this._values, usedValues, getCode) {
      return this._reduceValues(values, (name) => {
        if (name.value === void 0)
          throw new Error(`CodeGen: name "${name}" has no value`);
        return name.value.code;
      }, usedValues, getCode);
    }
    _reduceValues(values, valueCode, usedValues = {}, getCode) {
      let code2 = code_12.nil;
      for (const prefix in values) {
        const vs = values[prefix];
        if (!vs)
          continue;
        const nameSet = usedValues[prefix] = usedValues[prefix] || /* @__PURE__ */ new Map();
        vs.forEach((name) => {
          if (nameSet.has(name))
            return;
          nameSet.set(name, UsedValueState.Started);
          let c = valueCode(name);
          if (c) {
            const def2 = this.opts.es5 ? exports.varKinds.var : exports.varKinds.const;
            code2 = (0, code_12._)`${code2}${def2} ${name} = ${c};${this.opts._n}`;
          } else if (c = getCode === null || getCode === void 0 ? void 0 : getCode(name)) {
            code2 = (0, code_12._)`${code2}${c}${this.opts._n}`;
          } else {
            throw new ValueError(name);
          }
          nameSet.set(name, UsedValueState.Completed);
        });
      }
      return code2;
    }
  }
  exports.ValueScope = ValueScope;
})(scope);
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.or = exports.and = exports.not = exports.CodeGen = exports.operators = exports.varKinds = exports.ValueScopeName = exports.ValueScope = exports.Scope = exports.Name = exports.regexpCode = exports.stringify = exports.getProperty = exports.nil = exports.strConcat = exports.str = exports._ = void 0;
  const code_12 = code$1;
  const scope_1 = scope;
  var code_2 = code$1;
  Object.defineProperty(exports, "_", { enumerable: true, get: function() {
    return code_2._;
  } });
  Object.defineProperty(exports, "str", { enumerable: true, get: function() {
    return code_2.str;
  } });
  Object.defineProperty(exports, "strConcat", { enumerable: true, get: function() {
    return code_2.strConcat;
  } });
  Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
    return code_2.nil;
  } });
  Object.defineProperty(exports, "getProperty", { enumerable: true, get: function() {
    return code_2.getProperty;
  } });
  Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
    return code_2.stringify;
  } });
  Object.defineProperty(exports, "regexpCode", { enumerable: true, get: function() {
    return code_2.regexpCode;
  } });
  Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
    return code_2.Name;
  } });
  var scope_2 = scope;
  Object.defineProperty(exports, "Scope", { enumerable: true, get: function() {
    return scope_2.Scope;
  } });
  Object.defineProperty(exports, "ValueScope", { enumerable: true, get: function() {
    return scope_2.ValueScope;
  } });
  Object.defineProperty(exports, "ValueScopeName", { enumerable: true, get: function() {
    return scope_2.ValueScopeName;
  } });
  Object.defineProperty(exports, "varKinds", { enumerable: true, get: function() {
    return scope_2.varKinds;
  } });
  exports.operators = {
    GT: new code_12._Code(">"),
    GTE: new code_12._Code(">="),
    LT: new code_12._Code("<"),
    LTE: new code_12._Code("<="),
    EQ: new code_12._Code("==="),
    NEQ: new code_12._Code("!=="),
    NOT: new code_12._Code("!"),
    OR: new code_12._Code("||"),
    AND: new code_12._Code("&&"),
    ADD: new code_12._Code("+")
  };
  class Node {
    optimizeNodes() {
      return this;
    }
    optimizeNames(_names, _constants) {
      return this;
    }
  }
  class Def extends Node {
    constructor(varKind, name, rhs) {
      super();
      this.varKind = varKind;
      this.name = name;
      this.rhs = rhs;
    }
    render({ es5, _n }) {
      const varKind = es5 ? scope_1.varKinds.var : this.varKind;
      const rhs = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${varKind} ${this.name}${rhs};` + _n;
    }
    optimizeNames(names2, constants) {
      if (!names2[this.name.str])
        return;
      if (this.rhs)
        this.rhs = optimizeExpr(this.rhs, names2, constants);
      return this;
    }
    get names() {
      return this.rhs instanceof code_12._CodeOrName ? this.rhs.names : {};
    }
  }
  class Assign extends Node {
    constructor(lhs, rhs, sideEffects) {
      super();
      this.lhs = lhs;
      this.rhs = rhs;
      this.sideEffects = sideEffects;
    }
    render({ _n }) {
      return `${this.lhs} = ${this.rhs};` + _n;
    }
    optimizeNames(names2, constants) {
      if (this.lhs instanceof code_12.Name && !names2[this.lhs.str] && !this.sideEffects)
        return;
      this.rhs = optimizeExpr(this.rhs, names2, constants);
      return this;
    }
    get names() {
      const names2 = this.lhs instanceof code_12.Name ? {} : { ...this.lhs.names };
      return addExprNames(names2, this.rhs);
    }
  }
  class AssignOp extends Assign {
    constructor(lhs, op, rhs, sideEffects) {
      super(lhs, rhs, sideEffects);
      this.op = op;
    }
    render({ _n }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + _n;
    }
  }
  class Label2 extends Node {
    constructor(label) {
      super();
      this.label = label;
      this.names = {};
    }
    render({ _n }) {
      return `${this.label}:` + _n;
    }
  }
  class Break extends Node {
    constructor(label) {
      super();
      this.label = label;
      this.names = {};
    }
    render({ _n }) {
      const label = this.label ? ` ${this.label}` : "";
      return `break${label};` + _n;
    }
  }
  class Throw extends Node {
    constructor(error2) {
      super();
      this.error = error2;
    }
    render({ _n }) {
      return `throw ${this.error};` + _n;
    }
    get names() {
      return this.error.names;
    }
  }
  class AnyCode extends Node {
    constructor(code2) {
      super();
      this.code = code2;
    }
    render({ _n }) {
      return `${this.code};` + _n;
    }
    optimizeNodes() {
      return `${this.code}` ? this : void 0;
    }
    optimizeNames(names2, constants) {
      this.code = optimizeExpr(this.code, names2, constants);
      return this;
    }
    get names() {
      return this.code instanceof code_12._CodeOrName ? this.code.names : {};
    }
  }
  class ParentNode extends Node {
    constructor(nodes = []) {
      super();
      this.nodes = nodes;
    }
    render(opts) {
      return this.nodes.reduce((code2, n2) => code2 + n2.render(opts), "");
    }
    optimizeNodes() {
      const { nodes } = this;
      let i2 = nodes.length;
      while (i2--) {
        const n2 = nodes[i2].optimizeNodes();
        if (Array.isArray(n2))
          nodes.splice(i2, 1, ...n2);
        else if (n2)
          nodes[i2] = n2;
        else
          nodes.splice(i2, 1);
      }
      return nodes.length > 0 ? this : void 0;
    }
    optimizeNames(names2, constants) {
      const { nodes } = this;
      let i2 = nodes.length;
      while (i2--) {
        const n2 = nodes[i2];
        if (n2.optimizeNames(names2, constants))
          continue;
        subtractNames(names2, n2.names);
        nodes.splice(i2, 1);
      }
      return nodes.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((names2, n2) => addNames(names2, n2.names), {});
    }
  }
  class BlockNode extends ParentNode {
    render(opts) {
      return "{" + opts._n + super.render(opts) + "}" + opts._n;
    }
  }
  class Root extends ParentNode {
  }
  class Else extends BlockNode {
  }
  Else.kind = "else";
  class If extends BlockNode {
    constructor(condition, nodes) {
      super(nodes);
      this.condition = condition;
    }
    render(opts) {
      let code2 = `if(${this.condition})` + super.render(opts);
      if (this.else)
        code2 += "else " + this.else.render(opts);
      return code2;
    }
    optimizeNodes() {
      super.optimizeNodes();
      const cond = this.condition;
      if (cond === true)
        return this.nodes;
      let e = this.else;
      if (e) {
        const ns = e.optimizeNodes();
        e = this.else = Array.isArray(ns) ? new Else(ns) : ns;
      }
      if (e) {
        if (cond === false)
          return e instanceof If ? e : e.nodes;
        if (this.nodes.length)
          return this;
        return new If(not2(cond), e instanceof If ? [e] : e.nodes);
      }
      if (cond === false || !this.nodes.length)
        return void 0;
      return this;
    }
    optimizeNames(names2, constants) {
      var _a;
      this.else = (_a = this.else) === null || _a === void 0 ? void 0 : _a.optimizeNames(names2, constants);
      if (!(super.optimizeNames(names2, constants) || this.else))
        return;
      this.condition = optimizeExpr(this.condition, names2, constants);
      return this;
    }
    get names() {
      const names2 = super.names;
      addExprNames(names2, this.condition);
      if (this.else)
        addNames(names2, this.else.names);
      return names2;
    }
  }
  If.kind = "if";
  class For extends BlockNode {
  }
  For.kind = "for";
  class ForLoop extends For {
    constructor(iteration) {
      super();
      this.iteration = iteration;
    }
    render(opts) {
      return `for(${this.iteration})` + super.render(opts);
    }
    optimizeNames(names2, constants) {
      if (!super.optimizeNames(names2, constants))
        return;
      this.iteration = optimizeExpr(this.iteration, names2, constants);
      return this;
    }
    get names() {
      return addNames(super.names, this.iteration.names);
    }
  }
  class ForRange extends For {
    constructor(varKind, name, from, to) {
      super();
      this.varKind = varKind;
      this.name = name;
      this.from = from;
      this.to = to;
    }
    render(opts) {
      const varKind = opts.es5 ? scope_1.varKinds.var : this.varKind;
      const { name, from, to } = this;
      return `for(${varKind} ${name}=${from}; ${name}<${to}; ${name}++)` + super.render(opts);
    }
    get names() {
      const names2 = addExprNames(super.names, this.from);
      return addExprNames(names2, this.to);
    }
  }
  class ForIter extends For {
    constructor(loop, varKind, name, iterable) {
      super();
      this.loop = loop;
      this.varKind = varKind;
      this.name = name;
      this.iterable = iterable;
    }
    render(opts) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(opts);
    }
    optimizeNames(names2, constants) {
      if (!super.optimizeNames(names2, constants))
        return;
      this.iterable = optimizeExpr(this.iterable, names2, constants);
      return this;
    }
    get names() {
      return addNames(super.names, this.iterable.names);
    }
  }
  class Func extends BlockNode {
    constructor(name, args, async) {
      super();
      this.name = name;
      this.args = args;
      this.async = async;
    }
    render(opts) {
      const _async = this.async ? "async " : "";
      return `${_async}function ${this.name}(${this.args})` + super.render(opts);
    }
  }
  Func.kind = "func";
  class Return extends ParentNode {
    render(opts) {
      return "return " + super.render(opts);
    }
  }
  Return.kind = "return";
  class Try extends BlockNode {
    render(opts) {
      let code2 = "try" + super.render(opts);
      if (this.catch)
        code2 += this.catch.render(opts);
      if (this.finally)
        code2 += this.finally.render(opts);
      return code2;
    }
    optimizeNodes() {
      var _a, _b;
      super.optimizeNodes();
      (_a = this.catch) === null || _a === void 0 ? void 0 : _a.optimizeNodes();
      (_b = this.finally) === null || _b === void 0 ? void 0 : _b.optimizeNodes();
      return this;
    }
    optimizeNames(names2, constants) {
      var _a, _b;
      super.optimizeNames(names2, constants);
      (_a = this.catch) === null || _a === void 0 ? void 0 : _a.optimizeNames(names2, constants);
      (_b = this.finally) === null || _b === void 0 ? void 0 : _b.optimizeNames(names2, constants);
      return this;
    }
    get names() {
      const names2 = super.names;
      if (this.catch)
        addNames(names2, this.catch.names);
      if (this.finally)
        addNames(names2, this.finally.names);
      return names2;
    }
  }
  class Catch extends BlockNode {
    constructor(error2) {
      super();
      this.error = error2;
    }
    render(opts) {
      return `catch(${this.error})` + super.render(opts);
    }
  }
  Catch.kind = "catch";
  class Finally extends BlockNode {
    render(opts) {
      return "finally" + super.render(opts);
    }
  }
  Finally.kind = "finally";
  class CodeGen {
    constructor(extScope, opts = {}) {
      this._values = {};
      this._blockStarts = [];
      this._constants = {};
      this.opts = { ...opts, _n: opts.lines ? "\n" : "" };
      this._extScope = extScope;
      this._scope = new scope_1.Scope({ parent: extScope });
      this._nodes = [new Root()];
    }
    toString() {
      return this._root.render(this.opts);
    }
    // returns unique name in the internal scope
    name(prefix) {
      return this._scope.name(prefix);
    }
    // reserves unique name in the external scope
    scopeName(prefix) {
      return this._extScope.name(prefix);
    }
    // reserves unique name in the external scope and assigns value to it
    scopeValue(prefixOrName, value) {
      const name = this._extScope.value(prefixOrName, value);
      const vs = this._values[name.prefix] || (this._values[name.prefix] = /* @__PURE__ */ new Set());
      vs.add(name);
      return name;
    }
    getScopeValue(prefix, keyOrRef) {
      return this._extScope.getValue(prefix, keyOrRef);
    }
    // return code that assigns values in the external scope to the names that are used internally
    // (same names that were returned by gen.scopeName or gen.scopeValue)
    scopeRefs(scopeName) {
      return this._extScope.scopeRefs(scopeName, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(varKind, nameOrPrefix, rhs, constant) {
      const name = this._scope.toName(nameOrPrefix);
      if (rhs !== void 0 && constant)
        this._constants[name.str] = rhs;
      this._leafNode(new Def(varKind, name, rhs));
      return name;
    }
    // `const` declaration (`var` in es5 mode)
    const(nameOrPrefix, rhs, _constant) {
      return this._def(scope_1.varKinds.const, nameOrPrefix, rhs, _constant);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(nameOrPrefix, rhs, _constant) {
      return this._def(scope_1.varKinds.let, nameOrPrefix, rhs, _constant);
    }
    // `var` declaration with optional assignment
    var(nameOrPrefix, rhs, _constant) {
      return this._def(scope_1.varKinds.var, nameOrPrefix, rhs, _constant);
    }
    // assignment code
    assign(lhs, rhs, sideEffects) {
      return this._leafNode(new Assign(lhs, rhs, sideEffects));
    }
    // `+=` code
    add(lhs, rhs) {
      return this._leafNode(new AssignOp(lhs, exports.operators.ADD, rhs));
    }
    // appends passed SafeExpr to code or executes Block
    code(c) {
      if (typeof c == "function")
        c();
      else if (c !== code_12.nil)
        this._leafNode(new AnyCode(c));
      return this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...keyValues) {
      const code2 = ["{"];
      for (const [key, value] of keyValues) {
        if (code2.length > 1)
          code2.push(",");
        code2.push(key);
        if (key !== value || this.opts.es5) {
          code2.push(":");
          (0, code_12.addCodeArg)(code2, value);
        }
      }
      code2.push("}");
      return new code_12._Code(code2);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(condition, thenBody, elseBody) {
      this._blockNode(new If(condition));
      if (thenBody && elseBody) {
        this.code(thenBody).else().code(elseBody).endIf();
      } else if (thenBody) {
        this.code(thenBody).endIf();
      } else if (elseBody) {
        throw new Error('CodeGen: "else" body without "then" body');
      }
      return this;
    }
    // `else if` clause - invalid without `if` or after `else` clauses
    elseIf(condition) {
      return this._elseNode(new If(condition));
    }
    // `else` clause - only valid after `if` or `else if` clauses
    else() {
      return this._elseNode(new Else());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(If, Else);
    }
    _for(node, forBody) {
      this._blockNode(node);
      if (forBody)
        this.code(forBody).endFor();
      return this;
    }
    // a generic `for` clause (or statement if `forBody` is passed)
    for(iteration, forBody) {
      return this._for(new ForLoop(iteration), forBody);
    }
    // `for` statement for a range of values
    forRange(nameOrPrefix, from, to, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.let) {
      const name = this._scope.toName(nameOrPrefix);
      return this._for(new ForRange(varKind, name, from, to), () => forBody(name));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(nameOrPrefix, iterable, forBody, varKind = scope_1.varKinds.const) {
      const name = this._scope.toName(nameOrPrefix);
      if (this.opts.es5) {
        const arr = iterable instanceof code_12.Name ? iterable : this.var("_arr", iterable);
        return this.forRange("_i", 0, (0, code_12._)`${arr}.length`, (i2) => {
          this.var(name, (0, code_12._)`${arr}[${i2}]`);
          forBody(name);
        });
      }
      return this._for(new ForIter("of", varKind, name, iterable), () => forBody(name));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(nameOrPrefix, obj, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.const) {
      if (this.opts.ownProperties) {
        return this.forOf(nameOrPrefix, (0, code_12._)`Object.keys(${obj})`, forBody);
      }
      const name = this._scope.toName(nameOrPrefix);
      return this._for(new ForIter("in", varKind, name, obj), () => forBody(name));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(For);
    }
    // `label` statement
    label(label) {
      return this._leafNode(new Label2(label));
    }
    // `break` statement
    break(label) {
      return this._leafNode(new Break(label));
    }
    // `return` statement
    return(value) {
      const node = new Return();
      this._blockNode(node);
      this.code(value);
      if (node.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(Return);
    }
    // `try` statement
    try(tryBody, catchCode, finallyCode) {
      if (!catchCode && !finallyCode)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const node = new Try();
      this._blockNode(node);
      this.code(tryBody);
      if (catchCode) {
        const error2 = this.name("e");
        this._currNode = node.catch = new Catch(error2);
        catchCode(error2);
      }
      if (finallyCode) {
        this._currNode = node.finally = new Finally();
        this.code(finallyCode);
      }
      return this._endBlockNode(Catch, Finally);
    }
    // `throw` statement
    throw(error2) {
      return this._leafNode(new Throw(error2));
    }
    // start self-balancing block
    block(body, nodeCount) {
      this._blockStarts.push(this._nodes.length);
      if (body)
        this.code(body).endBlock(nodeCount);
      return this;
    }
    // end the current self-balancing block
    endBlock(nodeCount) {
      const len = this._blockStarts.pop();
      if (len === void 0)
        throw new Error("CodeGen: not in self-balancing block");
      const toClose = this._nodes.length - len;
      if (toClose < 0 || nodeCount !== void 0 && toClose !== nodeCount) {
        throw new Error(`CodeGen: wrong number of nodes: ${toClose} vs ${nodeCount} expected`);
      }
      this._nodes.length = len;
      return this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(name, args = code_12.nil, async, funcBody) {
      this._blockNode(new Func(name, args, async));
      if (funcBody)
        this.code(funcBody).endFunc();
      return this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(Func);
    }
    optimize(n2 = 1) {
      while (n2-- > 0) {
        this._root.optimizeNodes();
        this._root.optimizeNames(this._root.names, this._constants);
      }
    }
    _leafNode(node) {
      this._currNode.nodes.push(node);
      return this;
    }
    _blockNode(node) {
      this._currNode.nodes.push(node);
      this._nodes.push(node);
    }
    _endBlockNode(N1, N2) {
      const n2 = this._currNode;
      if (n2 instanceof N1 || N2 && n2 instanceof N2) {
        this._nodes.pop();
        return this;
      }
      throw new Error(`CodeGen: not in block "${N2 ? `${N1.kind}/${N2.kind}` : N1.kind}"`);
    }
    _elseNode(node) {
      const n2 = this._currNode;
      if (!(n2 instanceof If)) {
        throw new Error('CodeGen: "else" without "if"');
      }
      this._currNode = n2.else = node;
      return this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      const ns = this._nodes;
      return ns[ns.length - 1];
    }
    set _currNode(node) {
      const ns = this._nodes;
      ns[ns.length - 1] = node;
    }
  }
  exports.CodeGen = CodeGen;
  function addNames(names2, from) {
    for (const n2 in from)
      names2[n2] = (names2[n2] || 0) + (from[n2] || 0);
    return names2;
  }
  function addExprNames(names2, from) {
    return from instanceof code_12._CodeOrName ? addNames(names2, from.names) : names2;
  }
  function optimizeExpr(expr, names2, constants) {
    if (expr instanceof code_12.Name)
      return replaceName(expr);
    if (!canOptimize(expr))
      return expr;
    return new code_12._Code(expr._items.reduce((items2, c) => {
      if (c instanceof code_12.Name)
        c = replaceName(c);
      if (c instanceof code_12._Code)
        items2.push(...c._items);
      else
        items2.push(c);
      return items2;
    }, []));
    function replaceName(n2) {
      const c = constants[n2.str];
      if (c === void 0 || names2[n2.str] !== 1)
        return n2;
      delete names2[n2.str];
      return c;
    }
    function canOptimize(e) {
      return e instanceof code_12._Code && e._items.some((c) => c instanceof code_12.Name && names2[c.str] === 1 && constants[c.str] !== void 0);
    }
  }
  function subtractNames(names2, from) {
    for (const n2 in from)
      names2[n2] = (names2[n2] || 0) - (from[n2] || 0);
  }
  function not2(x) {
    return typeof x == "boolean" || typeof x == "number" || x === null ? !x : (0, code_12._)`!${par(x)}`;
  }
  exports.not = not2;
  const andCode = mappend(exports.operators.AND);
  function and(...args) {
    return args.reduce(andCode);
  }
  exports.and = and;
  const orCode = mappend(exports.operators.OR);
  function or(...args) {
    return args.reduce(orCode);
  }
  exports.or = or;
  function mappend(op) {
    return (x, y) => x === code_12.nil ? y : y === code_12.nil ? x : (0, code_12._)`${par(x)} ${op} ${par(y)}`;
  }
  function par(x) {
    return x instanceof code_12.Name ? x : (0, code_12._)`(${x})`;
  }
})(codegen);
var util = {};
Object.defineProperty(util, "__esModule", { value: true });
util.checkStrictMode = util.getErrorPath = util.Type = util.useFunc = util.setEvaluated = util.evaluatedPropsToName = util.mergeEvaluated = util.eachItem = util.unescapeJsonPointer = util.escapeJsonPointer = util.escapeFragment = util.unescapeFragment = util.schemaRefOrVal = util.schemaHasRulesButRef = util.schemaHasRules = util.checkUnknownRules = util.alwaysValidSchema = util.toHash = void 0;
const codegen_1$z = codegen;
const code_1$a = code$1;
function toHash(arr) {
  const hash = {};
  for (const item of arr)
    hash[item] = true;
  return hash;
}
util.toHash = toHash;
function alwaysValidSchema(it, schema) {
  if (typeof schema == "boolean")
    return schema;
  if (Object.keys(schema).length === 0)
    return true;
  checkUnknownRules(it, schema);
  return !schemaHasRules(schema, it.self.RULES.all);
}
util.alwaysValidSchema = alwaysValidSchema;
function checkUnknownRules(it, schema = it.schema) {
  const { opts, self: self2 } = it;
  if (!opts.strictSchema)
    return;
  if (typeof schema === "boolean")
    return;
  const rules2 = self2.RULES.keywords;
  for (const key in schema) {
    if (!rules2[key])
      checkStrictMode(it, `unknown keyword: "${key}"`);
  }
}
util.checkUnknownRules = checkUnknownRules;
function schemaHasRules(schema, rules2) {
  if (typeof schema == "boolean")
    return !schema;
  for (const key in schema)
    if (rules2[key])
      return true;
  return false;
}
util.schemaHasRules = schemaHasRules;
function schemaHasRulesButRef(schema, RULES) {
  if (typeof schema == "boolean")
    return !schema;
  for (const key in schema)
    if (key !== "$ref" && RULES.all[key])
      return true;
  return false;
}
util.schemaHasRulesButRef = schemaHasRulesButRef;
function schemaRefOrVal({ topSchemaRef, schemaPath }, schema, keyword2, $data) {
  if (!$data) {
    if (typeof schema == "number" || typeof schema == "boolean")
      return schema;
    if (typeof schema == "string")
      return (0, codegen_1$z._)`${schema}`;
  }
  return (0, codegen_1$z._)`${topSchemaRef}${schemaPath}${(0, codegen_1$z.getProperty)(keyword2)}`;
}
util.schemaRefOrVal = schemaRefOrVal;
function unescapeFragment(str) {
  return unescapeJsonPointer(decodeURIComponent(str));
}
util.unescapeFragment = unescapeFragment;
function escapeFragment(str) {
  return encodeURIComponent(escapeJsonPointer(str));
}
util.escapeFragment = escapeFragment;
function escapeJsonPointer(str) {
  if (typeof str == "number")
    return `${str}`;
  return str.replace(/~/g, "~0").replace(/\//g, "~1");
}
util.escapeJsonPointer = escapeJsonPointer;
function unescapeJsonPointer(str) {
  return str.replace(/~1/g, "/").replace(/~0/g, "~");
}
util.unescapeJsonPointer = unescapeJsonPointer;
function eachItem(xs, f) {
  if (Array.isArray(xs)) {
    for (const x of xs)
      f(x);
  } else {
    f(xs);
  }
}
util.eachItem = eachItem;
function makeMergeEvaluated({ mergeNames, mergeToName, mergeValues, resultToName }) {
  return (gen, from, to, toName) => {
    const res = to === void 0 ? from : to instanceof codegen_1$z.Name ? (from instanceof codegen_1$z.Name ? mergeNames(gen, from, to) : mergeToName(gen, from, to), to) : from instanceof codegen_1$z.Name ? (mergeToName(gen, to, from), from) : mergeValues(from, to);
    return toName === codegen_1$z.Name && !(res instanceof codegen_1$z.Name) ? resultToName(gen, res) : res;
  };
}
util.mergeEvaluated = {
  props: makeMergeEvaluated({
    mergeNames: (gen, from, to) => gen.if((0, codegen_1$z._)`${to} !== true && ${from} !== undefined`, () => {
      gen.if((0, codegen_1$z._)`${from} === true`, () => gen.assign(to, true), () => gen.assign(to, (0, codegen_1$z._)`${to} || {}`).code((0, codegen_1$z._)`Object.assign(${to}, ${from})`));
    }),
    mergeToName: (gen, from, to) => gen.if((0, codegen_1$z._)`${to} !== true`, () => {
      if (from === true) {
        gen.assign(to, true);
      } else {
        gen.assign(to, (0, codegen_1$z._)`${to} || {}`);
        setEvaluated(gen, to, from);
      }
    }),
    mergeValues: (from, to) => from === true ? true : { ...from, ...to },
    resultToName: evaluatedPropsToName
  }),
  items: makeMergeEvaluated({
    mergeNames: (gen, from, to) => gen.if((0, codegen_1$z._)`${to} !== true && ${from} !== undefined`, () => gen.assign(to, (0, codegen_1$z._)`${from} === true ? true : ${to} > ${from} ? ${to} : ${from}`)),
    mergeToName: (gen, from, to) => gen.if((0, codegen_1$z._)`${to} !== true`, () => gen.assign(to, from === true ? true : (0, codegen_1$z._)`${to} > ${from} ? ${to} : ${from}`)),
    mergeValues: (from, to) => from === true ? true : Math.max(from, to),
    resultToName: (gen, items2) => gen.var("items", items2)
  })
};
function evaluatedPropsToName(gen, ps) {
  if (ps === true)
    return gen.var("props", true);
  const props = gen.var("props", (0, codegen_1$z._)`{}`);
  if (ps !== void 0)
    setEvaluated(gen, props, ps);
  return props;
}
util.evaluatedPropsToName = evaluatedPropsToName;
function setEvaluated(gen, props, ps) {
  Object.keys(ps).forEach((p) => gen.assign((0, codegen_1$z._)`${props}${(0, codegen_1$z.getProperty)(p)}`, true));
}
util.setEvaluated = setEvaluated;
const snippets = {};
function useFunc(gen, f) {
  return gen.scopeValue("func", {
    ref: f,
    code: snippets[f.code] || (snippets[f.code] = new code_1$a._Code(f.code))
  });
}
util.useFunc = useFunc;
var Type;
(function(Type2) {
  Type2[Type2["Num"] = 0] = "Num";
  Type2[Type2["Str"] = 1] = "Str";
})(Type || (util.Type = Type = {}));
function getErrorPath(dataProp, dataPropType, jsPropertySyntax) {
  if (dataProp instanceof codegen_1$z.Name) {
    const isNumber = dataPropType === Type.Num;
    return jsPropertySyntax ? isNumber ? (0, codegen_1$z._)`"[" + ${dataProp} + "]"` : (0, codegen_1$z._)`"['" + ${dataProp} + "']"` : isNumber ? (0, codegen_1$z._)`"/" + ${dataProp}` : (0, codegen_1$z._)`"/" + ${dataProp}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return jsPropertySyntax ? (0, codegen_1$z.getProperty)(dataProp).toString() : "/" + escapeJsonPointer(dataProp);
}
util.getErrorPath = getErrorPath;
function checkStrictMode(it, msg, mode = it.opts.strictSchema) {
  if (!mode)
    return;
  msg = `strict mode: ${msg}`;
  if (mode === true)
    throw new Error(msg);
  it.self.logger.warn(msg);
}
util.checkStrictMode = checkStrictMode;
var names$1 = {};
Object.defineProperty(names$1, "__esModule", { value: true });
const codegen_1$y = codegen;
const names = {
  // validation function arguments
  data: new codegen_1$y.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new codegen_1$y.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new codegen_1$y.Name("instancePath"),
  parentData: new codegen_1$y.Name("parentData"),
  parentDataProperty: new codegen_1$y.Name("parentDataProperty"),
  rootData: new codegen_1$y.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new codegen_1$y.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new codegen_1$y.Name("vErrors"),
  // null or array of validation errors
  errors: new codegen_1$y.Name("errors"),
  // counter of validation errors
  this: new codegen_1$y.Name("this"),
  // "globals"
  self: new codegen_1$y.Name("self"),
  scope: new codegen_1$y.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new codegen_1$y.Name("json"),
  jsonPos: new codegen_1$y.Name("jsonPos"),
  jsonLen: new codegen_1$y.Name("jsonLen"),
  jsonPart: new codegen_1$y.Name("jsonPart")
};
names$1.default = names;
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.extendErrors = exports.resetErrorsCount = exports.reportExtraError = exports.reportError = exports.keyword$DataError = exports.keywordError = void 0;
  const codegen_12 = codegen;
  const util_12 = util;
  const names_12 = names$1;
  exports.keywordError = {
    message: ({ keyword: keyword2 }) => (0, codegen_12.str)`must pass "${keyword2}" keyword validation`
  };
  exports.keyword$DataError = {
    message: ({ keyword: keyword2, schemaType }) => schemaType ? (0, codegen_12.str)`"${keyword2}" keyword must be ${schemaType} ($data)` : (0, codegen_12.str)`"${keyword2}" keyword is invalid ($data)`
  };
  function reportError(cxt, error2 = exports.keywordError, errorPaths, overrideAllErrors) {
    const { it } = cxt;
    const { gen, compositeRule, allErrors } = it;
    const errObj = errorObjectCode(cxt, error2, errorPaths);
    if (overrideAllErrors !== null && overrideAllErrors !== void 0 ? overrideAllErrors : compositeRule || allErrors) {
      addError(gen, errObj);
    } else {
      returnErrors(it, (0, codegen_12._)`[${errObj}]`);
    }
  }
  exports.reportError = reportError;
  function reportExtraError(cxt, error2 = exports.keywordError, errorPaths) {
    const { it } = cxt;
    const { gen, compositeRule, allErrors } = it;
    const errObj = errorObjectCode(cxt, error2, errorPaths);
    addError(gen, errObj);
    if (!(compositeRule || allErrors)) {
      returnErrors(it, names_12.default.vErrors);
    }
  }
  exports.reportExtraError = reportExtraError;
  function resetErrorsCount(gen, errsCount) {
    gen.assign(names_12.default.errors, errsCount);
    gen.if((0, codegen_12._)`${names_12.default.vErrors} !== null`, () => gen.if(errsCount, () => gen.assign((0, codegen_12._)`${names_12.default.vErrors}.length`, errsCount), () => gen.assign(names_12.default.vErrors, null)));
  }
  exports.resetErrorsCount = resetErrorsCount;
  function extendErrors({ gen, keyword: keyword2, schemaValue, data, errsCount, it }) {
    if (errsCount === void 0)
      throw new Error("ajv implementation error");
    const err = gen.name("err");
    gen.forRange("i", errsCount, names_12.default.errors, (i2) => {
      gen.const(err, (0, codegen_12._)`${names_12.default.vErrors}[${i2}]`);
      gen.if((0, codegen_12._)`${err}.instancePath === undefined`, () => gen.assign((0, codegen_12._)`${err}.instancePath`, (0, codegen_12.strConcat)(names_12.default.instancePath, it.errorPath)));
      gen.assign((0, codegen_12._)`${err}.schemaPath`, (0, codegen_12.str)`${it.errSchemaPath}/${keyword2}`);
      if (it.opts.verbose) {
        gen.assign((0, codegen_12._)`${err}.schema`, schemaValue);
        gen.assign((0, codegen_12._)`${err}.data`, data);
      }
    });
  }
  exports.extendErrors = extendErrors;
  function addError(gen, errObj) {
    const err = gen.const("err", errObj);
    gen.if((0, codegen_12._)`${names_12.default.vErrors} === null`, () => gen.assign(names_12.default.vErrors, (0, codegen_12._)`[${err}]`), (0, codegen_12._)`${names_12.default.vErrors}.push(${err})`);
    gen.code((0, codegen_12._)`${names_12.default.errors}++`);
  }
  function returnErrors(it, errs) {
    const { gen, validateName, schemaEnv } = it;
    if (schemaEnv.$async) {
      gen.throw((0, codegen_12._)`new ${it.ValidationError}(${errs})`);
    } else {
      gen.assign((0, codegen_12._)`${validateName}.errors`, errs);
      gen.return(false);
    }
  }
  const E = {
    keyword: new codegen_12.Name("keyword"),
    schemaPath: new codegen_12.Name("schemaPath"),
    // also used in JTD errors
    params: new codegen_12.Name("params"),
    propertyName: new codegen_12.Name("propertyName"),
    message: new codegen_12.Name("message"),
    schema: new codegen_12.Name("schema"),
    parentSchema: new codegen_12.Name("parentSchema")
  };
  function errorObjectCode(cxt, error2, errorPaths) {
    const { createErrors } = cxt.it;
    if (createErrors === false)
      return (0, codegen_12._)`{}`;
    return errorObject(cxt, error2, errorPaths);
  }
  function errorObject(cxt, error2, errorPaths = {}) {
    const { gen, it } = cxt;
    const keyValues = [
      errorInstancePath(it, errorPaths),
      errorSchemaPath(cxt, errorPaths)
    ];
    extraErrorProps(cxt, error2, keyValues);
    return gen.object(...keyValues);
  }
  function errorInstancePath({ errorPath }, { instancePath }) {
    const instPath = instancePath ? (0, codegen_12.str)`${errorPath}${(0, util_12.getErrorPath)(instancePath, util_12.Type.Str)}` : errorPath;
    return [names_12.default.instancePath, (0, codegen_12.strConcat)(names_12.default.instancePath, instPath)];
  }
  function errorSchemaPath({ keyword: keyword2, it: { errSchemaPath } }, { schemaPath, parentSchema }) {
    let schPath = parentSchema ? errSchemaPath : (0, codegen_12.str)`${errSchemaPath}/${keyword2}`;
    if (schemaPath) {
      schPath = (0, codegen_12.str)`${schPath}${(0, util_12.getErrorPath)(schemaPath, util_12.Type.Str)}`;
    }
    return [E.schemaPath, schPath];
  }
  function extraErrorProps(cxt, { params, message }, keyValues) {
    const { keyword: keyword2, data, schemaValue, it } = cxt;
    const { opts, propertyName, topSchemaRef, schemaPath } = it;
    keyValues.push([E.keyword, keyword2], [E.params, typeof params == "function" ? params(cxt) : params || (0, codegen_12._)`{}`]);
    if (opts.messages) {
      keyValues.push([E.message, typeof message == "function" ? message(cxt) : message]);
    }
    if (opts.verbose) {
      keyValues.push([E.schema, schemaValue], [E.parentSchema, (0, codegen_12._)`${topSchemaRef}${schemaPath}`], [names_12.default.data, data]);
    }
    if (propertyName)
      keyValues.push([E.propertyName, propertyName]);
  }
})(errors);
Object.defineProperty(boolSchema, "__esModule", { value: true });
boolSchema.boolOrEmptySchema = boolSchema.topBoolOrEmptySchema = void 0;
const errors_1$3 = errors;
const codegen_1$x = codegen;
const names_1$9 = names$1;
const boolError = {
  message: "boolean schema is false"
};
function topBoolOrEmptySchema(it) {
  const { gen, schema, validateName } = it;
  if (schema === false) {
    falseSchemaError(it, false);
  } else if (typeof schema == "object" && schema.$async === true) {
    gen.return(names_1$9.default.data);
  } else {
    gen.assign((0, codegen_1$x._)`${validateName}.errors`, null);
    gen.return(true);
  }
}
boolSchema.topBoolOrEmptySchema = topBoolOrEmptySchema;
function boolOrEmptySchema(it, valid) {
  const { gen, schema } = it;
  if (schema === false) {
    gen.var(valid, false);
    falseSchemaError(it);
  } else {
    gen.var(valid, true);
  }
}
boolSchema.boolOrEmptySchema = boolOrEmptySchema;
function falseSchemaError(it, overrideAllErrors) {
  const { gen, data } = it;
  const cxt = {
    gen,
    keyword: "false schema",
    data,
    schema: false,
    schemaCode: false,
    schemaValue: false,
    params: {},
    it
  };
  (0, errors_1$3.reportError)(cxt, boolError, void 0, overrideAllErrors);
}
var dataType = {};
var rules = {};
Object.defineProperty(rules, "__esModule", { value: true });
rules.getRules = rules.isJSONType = void 0;
const _jsonTypes = ["string", "number", "integer", "boolean", "null", "object", "array"];
const jsonTypes = new Set(_jsonTypes);
function isJSONType(x) {
  return typeof x == "string" && jsonTypes.has(x);
}
rules.isJSONType = isJSONType;
function getRules() {
  const groups = {
    number: { type: "number", rules: [] },
    string: { type: "string", rules: [] },
    array: { type: "array", rules: [] },
    object: { type: "object", rules: [] }
  };
  return {
    types: { ...groups, integer: true, boolean: true, null: true },
    rules: [{ rules: [] }, groups.number, groups.string, groups.array, groups.object],
    post: { rules: [] },
    all: {},
    keywords: {}
  };
}
rules.getRules = getRules;
var applicability = {};
Object.defineProperty(applicability, "__esModule", { value: true });
applicability.shouldUseRule = applicability.shouldUseGroup = applicability.schemaHasRulesForType = void 0;
function schemaHasRulesForType({ schema, self: self2 }, type2) {
  const group = self2.RULES.types[type2];
  return group && group !== true && shouldUseGroup(schema, group);
}
applicability.schemaHasRulesForType = schemaHasRulesForType;
function shouldUseGroup(schema, group) {
  return group.rules.some((rule) => shouldUseRule(schema, rule));
}
applicability.shouldUseGroup = shouldUseGroup;
function shouldUseRule(schema, rule) {
  var _a;
  return schema[rule.keyword] !== void 0 || ((_a = rule.definition.implements) === null || _a === void 0 ? void 0 : _a.some((kwd) => schema[kwd] !== void 0));
}
applicability.shouldUseRule = shouldUseRule;
Object.defineProperty(dataType, "__esModule", { value: true });
dataType.reportTypeError = dataType.checkDataTypes = dataType.checkDataType = dataType.coerceAndCheckDataType = dataType.getJSONTypes = dataType.getSchemaTypes = dataType.DataType = void 0;
const rules_1 = rules;
const applicability_1$1 = applicability;
const errors_1$2 = errors;
const codegen_1$w = codegen;
const util_1$u = util;
var DataType;
(function(DataType2) {
  DataType2[DataType2["Correct"] = 0] = "Correct";
  DataType2[DataType2["Wrong"] = 1] = "Wrong";
})(DataType || (dataType.DataType = DataType = {}));
function getSchemaTypes(schema) {
  const types2 = getJSONTypes(schema.type);
  const hasNull = types2.includes("null");
  if (hasNull) {
    if (schema.nullable === false)
      throw new Error("type: null contradicts nullable: false");
  } else {
    if (!types2.length && schema.nullable !== void 0) {
      throw new Error('"nullable" cannot be used without "type"');
    }
    if (schema.nullable === true)
      types2.push("null");
  }
  return types2;
}
dataType.getSchemaTypes = getSchemaTypes;
function getJSONTypes(ts) {
  const types2 = Array.isArray(ts) ? ts : ts ? [ts] : [];
  if (types2.every(rules_1.isJSONType))
    return types2;
  throw new Error("type must be JSONType or JSONType[]: " + types2.join(","));
}
dataType.getJSONTypes = getJSONTypes;
function coerceAndCheckDataType(it, types2) {
  const { gen, data, opts } = it;
  const coerceTo = coerceToTypes(types2, opts.coerceTypes);
  const checkTypes = types2.length > 0 && !(coerceTo.length === 0 && types2.length === 1 && (0, applicability_1$1.schemaHasRulesForType)(it, types2[0]));
  if (checkTypes) {
    const wrongType = checkDataTypes(types2, data, opts.strictNumbers, DataType.Wrong);
    gen.if(wrongType, () => {
      if (coerceTo.length)
        coerceData(it, types2, coerceTo);
      else
        reportTypeError(it);
    });
  }
  return checkTypes;
}
dataType.coerceAndCheckDataType = coerceAndCheckDataType;
const COERCIBLE = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function coerceToTypes(types2, coerceTypes) {
  return coerceTypes ? types2.filter((t2) => COERCIBLE.has(t2) || coerceTypes === "array" && t2 === "array") : [];
}
function coerceData(it, types2, coerceTo) {
  const { gen, data, opts } = it;
  const dataType2 = gen.let("dataType", (0, codegen_1$w._)`typeof ${data}`);
  const coerced = gen.let("coerced", (0, codegen_1$w._)`undefined`);
  if (opts.coerceTypes === "array") {
    gen.if((0, codegen_1$w._)`${dataType2} == 'object' && Array.isArray(${data}) && ${data}.length == 1`, () => gen.assign(data, (0, codegen_1$w._)`${data}[0]`).assign(dataType2, (0, codegen_1$w._)`typeof ${data}`).if(checkDataTypes(types2, data, opts.strictNumbers), () => gen.assign(coerced, data)));
  }
  gen.if((0, codegen_1$w._)`${coerced} !== undefined`);
  for (const t2 of coerceTo) {
    if (COERCIBLE.has(t2) || t2 === "array" && opts.coerceTypes === "array") {
      coerceSpecificType(t2);
    }
  }
  gen.else();
  reportTypeError(it);
  gen.endIf();
  gen.if((0, codegen_1$w._)`${coerced} !== undefined`, () => {
    gen.assign(data, coerced);
    assignParentData(it, coerced);
  });
  function coerceSpecificType(t2) {
    switch (t2) {
      case "string":
        gen.elseIf((0, codegen_1$w._)`${dataType2} == "number" || ${dataType2} == "boolean"`).assign(coerced, (0, codegen_1$w._)`"" + ${data}`).elseIf((0, codegen_1$w._)`${data} === null`).assign(coerced, (0, codegen_1$w._)`""`);
        return;
      case "number":
        gen.elseIf((0, codegen_1$w._)`${dataType2} == "boolean" || ${data} === null
              || (${dataType2} == "string" && ${data} && ${data} == +${data})`).assign(coerced, (0, codegen_1$w._)`+${data}`);
        return;
      case "integer":
        gen.elseIf((0, codegen_1$w._)`${dataType2} === "boolean" || ${data} === null
              || (${dataType2} === "string" && ${data} && ${data} == +${data} && !(${data} % 1))`).assign(coerced, (0, codegen_1$w._)`+${data}`);
        return;
      case "boolean":
        gen.elseIf((0, codegen_1$w._)`${data} === "false" || ${data} === 0 || ${data} === null`).assign(coerced, false).elseIf((0, codegen_1$w._)`${data} === "true" || ${data} === 1`).assign(coerced, true);
        return;
      case "null":
        gen.elseIf((0, codegen_1$w._)`${data} === "" || ${data} === 0 || ${data} === false`);
        gen.assign(coerced, null);
        return;
      case "array":
        gen.elseIf((0, codegen_1$w._)`${dataType2} === "string" || ${dataType2} === "number"
              || ${dataType2} === "boolean" || ${data} === null`).assign(coerced, (0, codegen_1$w._)`[${data}]`);
    }
  }
}
function assignParentData({ gen, parentData, parentDataProperty }, expr) {
  gen.if((0, codegen_1$w._)`${parentData} !== undefined`, () => gen.assign((0, codegen_1$w._)`${parentData}[${parentDataProperty}]`, expr));
}
function checkDataType(dataType2, data, strictNums, correct = DataType.Correct) {
  const EQ = correct === DataType.Correct ? codegen_1$w.operators.EQ : codegen_1$w.operators.NEQ;
  let cond;
  switch (dataType2) {
    case "null":
      return (0, codegen_1$w._)`${data} ${EQ} null`;
    case "array":
      cond = (0, codegen_1$w._)`Array.isArray(${data})`;
      break;
    case "object":
      cond = (0, codegen_1$w._)`${data} && typeof ${data} == "object" && !Array.isArray(${data})`;
      break;
    case "integer":
      cond = numCond((0, codegen_1$w._)`!(${data} % 1) && !isNaN(${data})`);
      break;
    case "number":
      cond = numCond();
      break;
    default:
      return (0, codegen_1$w._)`typeof ${data} ${EQ} ${dataType2}`;
  }
  return correct === DataType.Correct ? cond : (0, codegen_1$w.not)(cond);
  function numCond(_cond = codegen_1$w.nil) {
    return (0, codegen_1$w.and)((0, codegen_1$w._)`typeof ${data} == "number"`, _cond, strictNums ? (0, codegen_1$w._)`isFinite(${data})` : codegen_1$w.nil);
  }
}
dataType.checkDataType = checkDataType;
function checkDataTypes(dataTypes, data, strictNums, correct) {
  if (dataTypes.length === 1) {
    return checkDataType(dataTypes[0], data, strictNums, correct);
  }
  let cond;
  const types2 = (0, util_1$u.toHash)(dataTypes);
  if (types2.array && types2.object) {
    const notObj = (0, codegen_1$w._)`typeof ${data} != "object"`;
    cond = types2.null ? notObj : (0, codegen_1$w._)`!${data} || ${notObj}`;
    delete types2.null;
    delete types2.array;
    delete types2.object;
  } else {
    cond = codegen_1$w.nil;
  }
  if (types2.number)
    delete types2.integer;
  for (const t2 in types2)
    cond = (0, codegen_1$w.and)(cond, checkDataType(t2, data, strictNums, correct));
  return cond;
}
dataType.checkDataTypes = checkDataTypes;
const typeError = {
  message: ({ schema }) => `must be ${schema}`,
  params: ({ schema, schemaValue }) => typeof schema == "string" ? (0, codegen_1$w._)`{type: ${schema}}` : (0, codegen_1$w._)`{type: ${schemaValue}}`
};
function reportTypeError(it) {
  const cxt = getTypeErrorContext(it);
  (0, errors_1$2.reportError)(cxt, typeError);
}
dataType.reportTypeError = reportTypeError;
function getTypeErrorContext(it) {
  const { gen, data, schema } = it;
  const schemaCode = (0, util_1$u.schemaRefOrVal)(it, schema, "type");
  return {
    gen,
    keyword: "type",
    data,
    schema: schema.type,
    schemaCode,
    schemaValue: schemaCode,
    parentSchema: schema,
    params: {},
    it
  };
}
var defaults = {};
Object.defineProperty(defaults, "__esModule", { value: true });
defaults.assignDefaults = void 0;
const codegen_1$v = codegen;
const util_1$t = util;
function assignDefaults(it, ty) {
  const { properties: properties2, items: items2 } = it.schema;
  if (ty === "object" && properties2) {
    for (const key in properties2) {
      assignDefault(it, key, properties2[key].default);
    }
  } else if (ty === "array" && Array.isArray(items2)) {
    items2.forEach((sch, i2) => assignDefault(it, i2, sch.default));
  }
}
defaults.assignDefaults = assignDefaults;
function assignDefault(it, prop, defaultValue) {
  const { gen, compositeRule, data, opts } = it;
  if (defaultValue === void 0)
    return;
  const childData = (0, codegen_1$v._)`${data}${(0, codegen_1$v.getProperty)(prop)}`;
  if (compositeRule) {
    (0, util_1$t.checkStrictMode)(it, `default is ignored for: ${childData}`);
    return;
  }
  let condition = (0, codegen_1$v._)`${childData} === undefined`;
  if (opts.useDefaults === "empty") {
    condition = (0, codegen_1$v._)`${condition} || ${childData} === null || ${childData} === ""`;
  }
  gen.if(condition, (0, codegen_1$v._)`${childData} = ${(0, codegen_1$v.stringify)(defaultValue)}`);
}
var keyword = {};
var code = {};
Object.defineProperty(code, "__esModule", { value: true });
code.validateUnion = code.validateArray = code.usePattern = code.callValidateCode = code.schemaProperties = code.allSchemaProperties = code.noPropertyInData = code.propertyInData = code.isOwnProperty = code.hasPropFunc = code.reportMissingProp = code.checkMissingProp = code.checkReportMissingProp = void 0;
const codegen_1$u = codegen;
const util_1$s = util;
const names_1$8 = names$1;
const util_2$1 = util;
function checkReportMissingProp(cxt, prop) {
  const { gen, data, it } = cxt;
  gen.if(noPropertyInData(gen, data, prop, it.opts.ownProperties), () => {
    cxt.setParams({ missingProperty: (0, codegen_1$u._)`${prop}` }, true);
    cxt.error();
  });
}
code.checkReportMissingProp = checkReportMissingProp;
function checkMissingProp({ gen, data, it: { opts } }, properties2, missing) {
  return (0, codegen_1$u.or)(...properties2.map((prop) => (0, codegen_1$u.and)(noPropertyInData(gen, data, prop, opts.ownProperties), (0, codegen_1$u._)`${missing} = ${prop}`)));
}
code.checkMissingProp = checkMissingProp;
function reportMissingProp(cxt, missing) {
  cxt.setParams({ missingProperty: missing }, true);
  cxt.error();
}
code.reportMissingProp = reportMissingProp;
function hasPropFunc(gen) {
  return gen.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, codegen_1$u._)`Object.prototype.hasOwnProperty`
  });
}
code.hasPropFunc = hasPropFunc;
function isOwnProperty(gen, data, property) {
  return (0, codegen_1$u._)`${hasPropFunc(gen)}.call(${data}, ${property})`;
}
code.isOwnProperty = isOwnProperty;
function propertyInData(gen, data, property, ownProperties) {
  const cond = (0, codegen_1$u._)`${data}${(0, codegen_1$u.getProperty)(property)} !== undefined`;
  return ownProperties ? (0, codegen_1$u._)`${cond} && ${isOwnProperty(gen, data, property)}` : cond;
}
code.propertyInData = propertyInData;
function noPropertyInData(gen, data, property, ownProperties) {
  const cond = (0, codegen_1$u._)`${data}${(0, codegen_1$u.getProperty)(property)} === undefined`;
  return ownProperties ? (0, codegen_1$u.or)(cond, (0, codegen_1$u.not)(isOwnProperty(gen, data, property))) : cond;
}
code.noPropertyInData = noPropertyInData;
function allSchemaProperties(schemaMap) {
  return schemaMap ? Object.keys(schemaMap).filter((p) => p !== "__proto__") : [];
}
code.allSchemaProperties = allSchemaProperties;
function schemaProperties(it, schemaMap) {
  return allSchemaProperties(schemaMap).filter((p) => !(0, util_1$s.alwaysValidSchema)(it, schemaMap[p]));
}
code.schemaProperties = schemaProperties;
function callValidateCode({ schemaCode, data, it: { gen, topSchemaRef, schemaPath, errorPath }, it }, func, context, passSchema) {
  const dataAndSchema = passSchema ? (0, codegen_1$u._)`${schemaCode}, ${data}, ${topSchemaRef}${schemaPath}` : data;
  const valCxt = [
    [names_1$8.default.instancePath, (0, codegen_1$u.strConcat)(names_1$8.default.instancePath, errorPath)],
    [names_1$8.default.parentData, it.parentData],
    [names_1$8.default.parentDataProperty, it.parentDataProperty],
    [names_1$8.default.rootData, names_1$8.default.rootData]
  ];
  if (it.opts.dynamicRef)
    valCxt.push([names_1$8.default.dynamicAnchors, names_1$8.default.dynamicAnchors]);
  const args = (0, codegen_1$u._)`${dataAndSchema}, ${gen.object(...valCxt)}`;
  return context !== codegen_1$u.nil ? (0, codegen_1$u._)`${func}.call(${context}, ${args})` : (0, codegen_1$u._)`${func}(${args})`;
}
code.callValidateCode = callValidateCode;
const newRegExp = (0, codegen_1$u._)`new RegExp`;
function usePattern({ gen, it: { opts } }, pattern2) {
  const u = opts.unicodeRegExp ? "u" : "";
  const { regExp } = opts.code;
  const rx = regExp(pattern2, u);
  return gen.scopeValue("pattern", {
    key: rx.toString(),
    ref: rx,
    code: (0, codegen_1$u._)`${regExp.code === "new RegExp" ? newRegExp : (0, util_2$1.useFunc)(gen, regExp)}(${pattern2}, ${u})`
  });
}
code.usePattern = usePattern;
function validateArray(cxt) {
  const { gen, data, keyword: keyword2, it } = cxt;
  const valid = gen.name("valid");
  if (it.allErrors) {
    const validArr = gen.let("valid", true);
    validateItems(() => gen.assign(validArr, false));
    return validArr;
  }
  gen.var(valid, true);
  validateItems(() => gen.break());
  return valid;
  function validateItems(notValid) {
    const len = gen.const("len", (0, codegen_1$u._)`${data}.length`);
    gen.forRange("i", 0, len, (i2) => {
      cxt.subschema({
        keyword: keyword2,
        dataProp: i2,
        dataPropType: util_1$s.Type.Num
      }, valid);
      gen.if((0, codegen_1$u.not)(valid), notValid);
    });
  }
}
code.validateArray = validateArray;
function validateUnion(cxt) {
  const { gen, schema, keyword: keyword2, it } = cxt;
  if (!Array.isArray(schema))
    throw new Error("ajv implementation error");
  const alwaysValid = schema.some((sch) => (0, util_1$s.alwaysValidSchema)(it, sch));
  if (alwaysValid && !it.opts.unevaluated)
    return;
  const valid = gen.let("valid", false);
  const schValid = gen.name("_valid");
  gen.block(() => schema.forEach((_sch, i2) => {
    const schCxt = cxt.subschema({
      keyword: keyword2,
      schemaProp: i2,
      compositeRule: true
    }, schValid);
    gen.assign(valid, (0, codegen_1$u._)`${valid} || ${schValid}`);
    const merged = cxt.mergeValidEvaluated(schCxt, schValid);
    if (!merged)
      gen.if((0, codegen_1$u.not)(valid));
  }));
  cxt.result(valid, () => cxt.reset(), () => cxt.error(true));
}
code.validateUnion = validateUnion;
Object.defineProperty(keyword, "__esModule", { value: true });
keyword.validateKeywordUsage = keyword.validSchemaType = keyword.funcKeywordCode = keyword.macroKeywordCode = void 0;
const codegen_1$t = codegen;
const names_1$7 = names$1;
const code_1$9 = code;
const errors_1$1 = errors;
function macroKeywordCode(cxt, def2) {
  const { gen, keyword: keyword2, schema, parentSchema, it } = cxt;
  const macroSchema = def2.macro.call(it.self, schema, parentSchema, it);
  const schemaRef = useKeyword(gen, keyword2, macroSchema);
  if (it.opts.validateSchema !== false)
    it.self.validateSchema(macroSchema, true);
  const valid = gen.name("valid");
  cxt.subschema({
    schema: macroSchema,
    schemaPath: codegen_1$t.nil,
    errSchemaPath: `${it.errSchemaPath}/${keyword2}`,
    topSchemaRef: schemaRef,
    compositeRule: true
  }, valid);
  cxt.pass(valid, () => cxt.error(true));
}
keyword.macroKeywordCode = macroKeywordCode;
function funcKeywordCode(cxt, def2) {
  var _a;
  const { gen, keyword: keyword2, schema, parentSchema, $data, it } = cxt;
  checkAsyncKeyword(it, def2);
  const validate2 = !$data && def2.compile ? def2.compile.call(it.self, schema, parentSchema, it) : def2.validate;
  const validateRef = useKeyword(gen, keyword2, validate2);
  const valid = gen.let("valid");
  cxt.block$data(valid, validateKeyword);
  cxt.ok((_a = def2.valid) !== null && _a !== void 0 ? _a : valid);
  function validateKeyword() {
    if (def2.errors === false) {
      assignValid();
      if (def2.modifying)
        modifyData(cxt);
      reportErrs(() => cxt.error());
    } else {
      const ruleErrs = def2.async ? validateAsync() : validateSync();
      if (def2.modifying)
        modifyData(cxt);
      reportErrs(() => addErrs(cxt, ruleErrs));
    }
  }
  function validateAsync() {
    const ruleErrs = gen.let("ruleErrs", null);
    gen.try(() => assignValid((0, codegen_1$t._)`await `), (e) => gen.assign(valid, false).if((0, codegen_1$t._)`${e} instanceof ${it.ValidationError}`, () => gen.assign(ruleErrs, (0, codegen_1$t._)`${e}.errors`), () => gen.throw(e)));
    return ruleErrs;
  }
  function validateSync() {
    const validateErrs = (0, codegen_1$t._)`${validateRef}.errors`;
    gen.assign(validateErrs, null);
    assignValid(codegen_1$t.nil);
    return validateErrs;
  }
  function assignValid(_await = def2.async ? (0, codegen_1$t._)`await ` : codegen_1$t.nil) {
    const passCxt = it.opts.passContext ? names_1$7.default.this : names_1$7.default.self;
    const passSchema = !("compile" in def2 && !$data || def2.schema === false);
    gen.assign(valid, (0, codegen_1$t._)`${_await}${(0, code_1$9.callValidateCode)(cxt, validateRef, passCxt, passSchema)}`, def2.modifying);
  }
  function reportErrs(errors2) {
    var _a2;
    gen.if((0, codegen_1$t.not)((_a2 = def2.valid) !== null && _a2 !== void 0 ? _a2 : valid), errors2);
  }
}
keyword.funcKeywordCode = funcKeywordCode;
function modifyData(cxt) {
  const { gen, data, it } = cxt;
  gen.if(it.parentData, () => gen.assign(data, (0, codegen_1$t._)`${it.parentData}[${it.parentDataProperty}]`));
}
function addErrs(cxt, errs) {
  const { gen } = cxt;
  gen.if((0, codegen_1$t._)`Array.isArray(${errs})`, () => {
    gen.assign(names_1$7.default.vErrors, (0, codegen_1$t._)`${names_1$7.default.vErrors} === null ? ${errs} : ${names_1$7.default.vErrors}.concat(${errs})`).assign(names_1$7.default.errors, (0, codegen_1$t._)`${names_1$7.default.vErrors}.length`);
    (0, errors_1$1.extendErrors)(cxt);
  }, () => cxt.error());
}
function checkAsyncKeyword({ schemaEnv }, def2) {
  if (def2.async && !schemaEnv.$async)
    throw new Error("async keyword in sync schema");
}
function useKeyword(gen, keyword2, result) {
  if (result === void 0)
    throw new Error(`keyword "${keyword2}" failed to compile`);
  return gen.scopeValue("keyword", typeof result == "function" ? { ref: result } : { ref: result, code: (0, codegen_1$t.stringify)(result) });
}
function validSchemaType(schema, schemaType, allowUndefined = false) {
  return !schemaType.length || schemaType.some((st) => st === "array" ? Array.isArray(schema) : st === "object" ? schema && typeof schema == "object" && !Array.isArray(schema) : typeof schema == st || allowUndefined && typeof schema == "undefined");
}
keyword.validSchemaType = validSchemaType;
function validateKeywordUsage({ schema, opts, self: self2, errSchemaPath }, def2, keyword2) {
  if (Array.isArray(def2.keyword) ? !def2.keyword.includes(keyword2) : def2.keyword !== keyword2) {
    throw new Error("ajv implementation error");
  }
  const deps = def2.dependencies;
  if (deps === null || deps === void 0 ? void 0 : deps.some((kwd) => !Object.prototype.hasOwnProperty.call(schema, kwd))) {
    throw new Error(`parent schema must have dependencies of ${keyword2}: ${deps.join(",")}`);
  }
  if (def2.validateSchema) {
    const valid = def2.validateSchema(schema[keyword2]);
    if (!valid) {
      const msg = `keyword "${keyword2}" value is invalid at path "${errSchemaPath}": ` + self2.errorsText(def2.validateSchema.errors);
      if (opts.validateSchema === "log")
        self2.logger.error(msg);
      else
        throw new Error(msg);
    }
  }
}
keyword.validateKeywordUsage = validateKeywordUsage;
var subschema = {};
Object.defineProperty(subschema, "__esModule", { value: true });
subschema.extendSubschemaMode = subschema.extendSubschemaData = subschema.getSubschema = void 0;
const codegen_1$s = codegen;
const util_1$r = util;
function getSubschema(it, { keyword: keyword2, schemaProp, schema, schemaPath, errSchemaPath, topSchemaRef }) {
  if (keyword2 !== void 0 && schema !== void 0) {
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  }
  if (keyword2 !== void 0) {
    const sch = it.schema[keyword2];
    return schemaProp === void 0 ? {
      schema: sch,
      schemaPath: (0, codegen_1$s._)`${it.schemaPath}${(0, codegen_1$s.getProperty)(keyword2)}`,
      errSchemaPath: `${it.errSchemaPath}/${keyword2}`
    } : {
      schema: sch[schemaProp],
      schemaPath: (0, codegen_1$s._)`${it.schemaPath}${(0, codegen_1$s.getProperty)(keyword2)}${(0, codegen_1$s.getProperty)(schemaProp)}`,
      errSchemaPath: `${it.errSchemaPath}/${keyword2}/${(0, util_1$r.escapeFragment)(schemaProp)}`
    };
  }
  if (schema !== void 0) {
    if (schemaPath === void 0 || errSchemaPath === void 0 || topSchemaRef === void 0) {
      throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
    }
    return {
      schema,
      schemaPath,
      topSchemaRef,
      errSchemaPath
    };
  }
  throw new Error('either "keyword" or "schema" must be passed');
}
subschema.getSubschema = getSubschema;
function extendSubschemaData(subschema2, it, { dataProp, dataPropType: dpType, data, dataTypes, propertyName }) {
  if (data !== void 0 && dataProp !== void 0) {
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  }
  const { gen } = it;
  if (dataProp !== void 0) {
    const { errorPath, dataPathArr, opts } = it;
    const nextData = gen.let("data", (0, codegen_1$s._)`${it.data}${(0, codegen_1$s.getProperty)(dataProp)}`, true);
    dataContextProps(nextData);
    subschema2.errorPath = (0, codegen_1$s.str)`${errorPath}${(0, util_1$r.getErrorPath)(dataProp, dpType, opts.jsPropertySyntax)}`;
    subschema2.parentDataProperty = (0, codegen_1$s._)`${dataProp}`;
    subschema2.dataPathArr = [...dataPathArr, subschema2.parentDataProperty];
  }
  if (data !== void 0) {
    const nextData = data instanceof codegen_1$s.Name ? data : gen.let("data", data, true);
    dataContextProps(nextData);
    if (propertyName !== void 0)
      subschema2.propertyName = propertyName;
  }
  if (dataTypes)
    subschema2.dataTypes = dataTypes;
  function dataContextProps(_nextData) {
    subschema2.data = _nextData;
    subschema2.dataLevel = it.dataLevel + 1;
    subschema2.dataTypes = [];
    it.definedProperties = /* @__PURE__ */ new Set();
    subschema2.parentData = it.data;
    subschema2.dataNames = [...it.dataNames, _nextData];
  }
}
subschema.extendSubschemaData = extendSubschemaData;
function extendSubschemaMode(subschema2, { jtdDiscriminator, jtdMetadata, compositeRule, createErrors, allErrors }) {
  if (compositeRule !== void 0)
    subschema2.compositeRule = compositeRule;
  if (createErrors !== void 0)
    subschema2.createErrors = createErrors;
  if (allErrors !== void 0)
    subschema2.allErrors = allErrors;
  subschema2.jtdDiscriminator = jtdDiscriminator;
  subschema2.jtdMetadata = jtdMetadata;
}
subschema.extendSubschemaMode = extendSubschemaMode;
var resolve$2 = {};
var fastDeepEqual = function equal(a, b) {
  if (a === b) return true;
  if (a && b && typeof a == "object" && typeof b == "object") {
    if (a.constructor !== b.constructor) return false;
    var length, i2, keys;
    if (Array.isArray(a)) {
      length = a.length;
      if (length != b.length) return false;
      for (i2 = length; i2-- !== 0; )
        if (!equal(a[i2], b[i2])) return false;
      return true;
    }
    if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;
    for (i2 = length; i2-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(b, keys[i2])) return false;
    for (i2 = length; i2-- !== 0; ) {
      var key = keys[i2];
      if (!equal(a[key], b[key])) return false;
    }
    return true;
  }
  return a !== a && b !== b;
};
var jsonSchemaTraverse = { exports: {} };
var traverse$1 = jsonSchemaTraverse.exports = function(schema, opts, cb) {
  if (typeof opts == "function") {
    cb = opts;
    opts = {};
  }
  cb = opts.cb || cb;
  var pre = typeof cb == "function" ? cb : cb.pre || function() {
  };
  var post = cb.post || function() {
  };
  _traverse(opts, pre, post, schema, "", schema);
};
traverse$1.keywords = {
  additionalItems: true,
  items: true,
  contains: true,
  additionalProperties: true,
  propertyNames: true,
  not: true,
  if: true,
  then: true,
  else: true
};
traverse$1.arrayKeywords = {
  items: true,
  allOf: true,
  anyOf: true,
  oneOf: true
};
traverse$1.propsKeywords = {
  $defs: true,
  definitions: true,
  properties: true,
  patternProperties: true,
  dependencies: true
};
traverse$1.skipKeywords = {
  default: true,
  enum: true,
  const: true,
  required: true,
  maximum: true,
  minimum: true,
  exclusiveMaximum: true,
  exclusiveMinimum: true,
  multipleOf: true,
  maxLength: true,
  minLength: true,
  pattern: true,
  format: true,
  maxItems: true,
  minItems: true,
  uniqueItems: true,
  maxProperties: true,
  minProperties: true
};
function _traverse(opts, pre, post, schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
  if (schema && typeof schema == "object" && !Array.isArray(schema)) {
    pre(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
    for (var key in schema) {
      var sch = schema[key];
      if (Array.isArray(sch)) {
        if (key in traverse$1.arrayKeywords) {
          for (var i2 = 0; i2 < sch.length; i2++)
            _traverse(opts, pre, post, sch[i2], jsonPtr + "/" + key + "/" + i2, rootSchema, jsonPtr, key, schema, i2);
        }
      } else if (key in traverse$1.propsKeywords) {
        if (sch && typeof sch == "object") {
          for (var prop in sch)
            _traverse(opts, pre, post, sch[prop], jsonPtr + "/" + key + "/" + escapeJsonPtr(prop), rootSchema, jsonPtr, key, schema, prop);
        }
      } else if (key in traverse$1.keywords || opts.allKeys && !(key in traverse$1.skipKeywords)) {
        _traverse(opts, pre, post, sch, jsonPtr + "/" + key, rootSchema, jsonPtr, key, schema);
      }
    }
    post(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
  }
}
function escapeJsonPtr(str) {
  return str.replace(/~/g, "~0").replace(/\//g, "~1");
}
var jsonSchemaTraverseExports = jsonSchemaTraverse.exports;
Object.defineProperty(resolve$2, "__esModule", { value: true });
resolve$2.getSchemaRefs = resolve$2.resolveUrl = resolve$2.normalizeId = resolve$2._getFullPath = resolve$2.getFullPath = resolve$2.inlineRef = void 0;
const util_1$q = util;
const equal$3 = fastDeepEqual;
const traverse = jsonSchemaTraverseExports;
const SIMPLE_INLINED = /* @__PURE__ */ new Set([
  "type",
  "format",
  "pattern",
  "maxLength",
  "minLength",
  "maxProperties",
  "minProperties",
  "maxItems",
  "minItems",
  "maximum",
  "minimum",
  "uniqueItems",
  "multipleOf",
  "required",
  "enum",
  "const"
]);
function inlineRef(schema, limit = true) {
  if (typeof schema == "boolean")
    return true;
  if (limit === true)
    return !hasRef(schema);
  if (!limit)
    return false;
  return countKeys(schema) <= limit;
}
resolve$2.inlineRef = inlineRef;
const REF_KEYWORDS = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function hasRef(schema) {
  for (const key in schema) {
    if (REF_KEYWORDS.has(key))
      return true;
    const sch = schema[key];
    if (Array.isArray(sch) && sch.some(hasRef))
      return true;
    if (typeof sch == "object" && hasRef(sch))
      return true;
  }
  return false;
}
function countKeys(schema) {
  let count = 0;
  for (const key in schema) {
    if (key === "$ref")
      return Infinity;
    count++;
    if (SIMPLE_INLINED.has(key))
      continue;
    if (typeof schema[key] == "object") {
      (0, util_1$q.eachItem)(schema[key], (sch) => count += countKeys(sch));
    }
    if (count === Infinity)
      return Infinity;
  }
  return count;
}
function getFullPath(resolver, id2 = "", normalize2) {
  if (normalize2 !== false)
    id2 = normalizeId(id2);
  const p = resolver.parse(id2);
  return _getFullPath(resolver, p);
}
resolve$2.getFullPath = getFullPath;
function _getFullPath(resolver, p) {
  const serialized = resolver.serialize(p);
  return serialized.split("#")[0] + "#";
}
resolve$2._getFullPath = _getFullPath;
const TRAILING_SLASH_HASH = /#\/?$/;
function normalizeId(id2) {
  return id2 ? id2.replace(TRAILING_SLASH_HASH, "") : "";
}
resolve$2.normalizeId = normalizeId;
function resolveUrl(resolver, baseId, id2) {
  id2 = normalizeId(id2);
  return resolver.resolve(baseId, id2);
}
resolve$2.resolveUrl = resolveUrl;
const ANCHOR = /^[a-z_][-a-z0-9._]*$/i;
function getSchemaRefs(schema, baseId) {
  if (typeof schema == "boolean")
    return {};
  const { schemaId, uriResolver } = this.opts;
  const schId = normalizeId(schema[schemaId] || baseId);
  const baseIds = { "": schId };
  const pathPrefix = getFullPath(uriResolver, schId, false);
  const localRefs = {};
  const schemaRefs = /* @__PURE__ */ new Set();
  traverse(schema, { allKeys: true }, (sch, jsonPtr, _, parentJsonPtr) => {
    if (parentJsonPtr === void 0)
      return;
    const fullPath = pathPrefix + jsonPtr;
    let innerBaseId = baseIds[parentJsonPtr];
    if (typeof sch[schemaId] == "string")
      innerBaseId = addRef.call(this, sch[schemaId]);
    addAnchor.call(this, sch.$anchor);
    addAnchor.call(this, sch.$dynamicAnchor);
    baseIds[jsonPtr] = innerBaseId;
    function addRef(ref2) {
      const _resolve = this.opts.uriResolver.resolve;
      ref2 = normalizeId(innerBaseId ? _resolve(innerBaseId, ref2) : ref2);
      if (schemaRefs.has(ref2))
        throw ambiguos(ref2);
      schemaRefs.add(ref2);
      let schOrRef = this.refs[ref2];
      if (typeof schOrRef == "string")
        schOrRef = this.refs[schOrRef];
      if (typeof schOrRef == "object") {
        checkAmbiguosRef(sch, schOrRef.schema, ref2);
      } else if (ref2 !== normalizeId(fullPath)) {
        if (ref2[0] === "#") {
          checkAmbiguosRef(sch, localRefs[ref2], ref2);
          localRefs[ref2] = sch;
        } else {
          this.refs[ref2] = fullPath;
        }
      }
      return ref2;
    }
    function addAnchor(anchor) {
      if (typeof anchor == "string") {
        if (!ANCHOR.test(anchor))
          throw new Error(`invalid anchor "${anchor}"`);
        addRef.call(this, `#${anchor}`);
      }
    }
  });
  return localRefs;
  function checkAmbiguosRef(sch1, sch2, ref2) {
    if (sch2 !== void 0 && !equal$3(sch1, sch2))
      throw ambiguos(ref2);
  }
  function ambiguos(ref2) {
    return new Error(`reference "${ref2}" resolves to more than one schema`);
  }
}
resolve$2.getSchemaRefs = getSchemaRefs;
Object.defineProperty(validate, "__esModule", { value: true });
validate.getData = validate.KeywordCxt = validate.validateFunctionCode = void 0;
const boolSchema_1 = boolSchema;
const dataType_1$1 = dataType;
const applicability_1 = applicability;
const dataType_2 = dataType;
const defaults_1 = defaults;
const keyword_1 = keyword;
const subschema_1 = subschema;
const codegen_1$r = codegen;
const names_1$6 = names$1;
const resolve_1$2 = resolve$2;
const util_1$p = util;
const errors_1 = errors;
function validateFunctionCode(it) {
  if (isSchemaObj(it)) {
    checkKeywords(it);
    if (schemaCxtHasRules(it)) {
      topSchemaObjCode(it);
      return;
    }
  }
  validateFunction(it, () => (0, boolSchema_1.topBoolOrEmptySchema)(it));
}
validate.validateFunctionCode = validateFunctionCode;
function validateFunction({ gen, validateName, schema, schemaEnv, opts }, body) {
  if (opts.code.es5) {
    gen.func(validateName, (0, codegen_1$r._)`${names_1$6.default.data}, ${names_1$6.default.valCxt}`, schemaEnv.$async, () => {
      gen.code((0, codegen_1$r._)`"use strict"; ${funcSourceUrl(schema, opts)}`);
      destructureValCxtES5(gen, opts);
      gen.code(body);
    });
  } else {
    gen.func(validateName, (0, codegen_1$r._)`${names_1$6.default.data}, ${destructureValCxt(opts)}`, schemaEnv.$async, () => gen.code(funcSourceUrl(schema, opts)).code(body));
  }
}
function destructureValCxt(opts) {
  return (0, codegen_1$r._)`{${names_1$6.default.instancePath}="", ${names_1$6.default.parentData}, ${names_1$6.default.parentDataProperty}, ${names_1$6.default.rootData}=${names_1$6.default.data}${opts.dynamicRef ? (0, codegen_1$r._)`, ${names_1$6.default.dynamicAnchors}={}` : codegen_1$r.nil}}={}`;
}
function destructureValCxtES5(gen, opts) {
  gen.if(names_1$6.default.valCxt, () => {
    gen.var(names_1$6.default.instancePath, (0, codegen_1$r._)`${names_1$6.default.valCxt}.${names_1$6.default.instancePath}`);
    gen.var(names_1$6.default.parentData, (0, codegen_1$r._)`${names_1$6.default.valCxt}.${names_1$6.default.parentData}`);
    gen.var(names_1$6.default.parentDataProperty, (0, codegen_1$r._)`${names_1$6.default.valCxt}.${names_1$6.default.parentDataProperty}`);
    gen.var(names_1$6.default.rootData, (0, codegen_1$r._)`${names_1$6.default.valCxt}.${names_1$6.default.rootData}`);
    if (opts.dynamicRef)
      gen.var(names_1$6.default.dynamicAnchors, (0, codegen_1$r._)`${names_1$6.default.valCxt}.${names_1$6.default.dynamicAnchors}`);
  }, () => {
    gen.var(names_1$6.default.instancePath, (0, codegen_1$r._)`""`);
    gen.var(names_1$6.default.parentData, (0, codegen_1$r._)`undefined`);
    gen.var(names_1$6.default.parentDataProperty, (0, codegen_1$r._)`undefined`);
    gen.var(names_1$6.default.rootData, names_1$6.default.data);
    if (opts.dynamicRef)
      gen.var(names_1$6.default.dynamicAnchors, (0, codegen_1$r._)`{}`);
  });
}
function topSchemaObjCode(it) {
  const { schema, opts, gen } = it;
  validateFunction(it, () => {
    if (opts.$comment && schema.$comment)
      commentKeyword(it);
    checkNoDefault(it);
    gen.let(names_1$6.default.vErrors, null);
    gen.let(names_1$6.default.errors, 0);
    if (opts.unevaluated)
      resetEvaluated(it);
    typeAndKeywords(it);
    returnResults(it);
  });
  return;
}
function resetEvaluated(it) {
  const { gen, validateName } = it;
  it.evaluated = gen.const("evaluated", (0, codegen_1$r._)`${validateName}.evaluated`);
  gen.if((0, codegen_1$r._)`${it.evaluated}.dynamicProps`, () => gen.assign((0, codegen_1$r._)`${it.evaluated}.props`, (0, codegen_1$r._)`undefined`));
  gen.if((0, codegen_1$r._)`${it.evaluated}.dynamicItems`, () => gen.assign((0, codegen_1$r._)`${it.evaluated}.items`, (0, codegen_1$r._)`undefined`));
}
function funcSourceUrl(schema, opts) {
  const schId = typeof schema == "object" && schema[opts.schemaId];
  return schId && (opts.code.source || opts.code.process) ? (0, codegen_1$r._)`/*# sourceURL=${schId} */` : codegen_1$r.nil;
}
function subschemaCode(it, valid) {
  if (isSchemaObj(it)) {
    checkKeywords(it);
    if (schemaCxtHasRules(it)) {
      subSchemaObjCode(it, valid);
      return;
    }
  }
  (0, boolSchema_1.boolOrEmptySchema)(it, valid);
}
function schemaCxtHasRules({ schema, self: self2 }) {
  if (typeof schema == "boolean")
    return !schema;
  for (const key in schema)
    if (self2.RULES.all[key])
      return true;
  return false;
}
function isSchemaObj(it) {
  return typeof it.schema != "boolean";
}
function subSchemaObjCode(it, valid) {
  const { schema, gen, opts } = it;
  if (opts.$comment && schema.$comment)
    commentKeyword(it);
  updateContext(it);
  checkAsyncSchema(it);
  const errsCount = gen.const("_errs", names_1$6.default.errors);
  typeAndKeywords(it, errsCount);
  gen.var(valid, (0, codegen_1$r._)`${errsCount} === ${names_1$6.default.errors}`);
}
function checkKeywords(it) {
  (0, util_1$p.checkUnknownRules)(it);
  checkRefsAndKeywords(it);
}
function typeAndKeywords(it, errsCount) {
  if (it.opts.jtd)
    return schemaKeywords(it, [], false, errsCount);
  const types2 = (0, dataType_1$1.getSchemaTypes)(it.schema);
  const checkedTypes = (0, dataType_1$1.coerceAndCheckDataType)(it, types2);
  schemaKeywords(it, types2, !checkedTypes, errsCount);
}
function checkRefsAndKeywords(it) {
  const { schema, errSchemaPath, opts, self: self2 } = it;
  if (schema.$ref && opts.ignoreKeywordsWithRef && (0, util_1$p.schemaHasRulesButRef)(schema, self2.RULES)) {
    self2.logger.warn(`$ref: keywords ignored in schema at path "${errSchemaPath}"`);
  }
}
function checkNoDefault(it) {
  const { schema, opts } = it;
  if (schema.default !== void 0 && opts.useDefaults && opts.strictSchema) {
    (0, util_1$p.checkStrictMode)(it, "default is ignored in the schema root");
  }
}
function updateContext(it) {
  const schId = it.schema[it.opts.schemaId];
  if (schId)
    it.baseId = (0, resolve_1$2.resolveUrl)(it.opts.uriResolver, it.baseId, schId);
}
function checkAsyncSchema(it) {
  if (it.schema.$async && !it.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function commentKeyword({ gen, schemaEnv, schema, errSchemaPath, opts }) {
  const msg = schema.$comment;
  if (opts.$comment === true) {
    gen.code((0, codegen_1$r._)`${names_1$6.default.self}.logger.log(${msg})`);
  } else if (typeof opts.$comment == "function") {
    const schemaPath = (0, codegen_1$r.str)`${errSchemaPath}/$comment`;
    const rootName = gen.scopeValue("root", { ref: schemaEnv.root });
    gen.code((0, codegen_1$r._)`${names_1$6.default.self}.opts.$comment(${msg}, ${schemaPath}, ${rootName}.schema)`);
  }
}
function returnResults(it) {
  const { gen, schemaEnv, validateName, ValidationError: ValidationError2, opts } = it;
  if (schemaEnv.$async) {
    gen.if((0, codegen_1$r._)`${names_1$6.default.errors} === 0`, () => gen.return(names_1$6.default.data), () => gen.throw((0, codegen_1$r._)`new ${ValidationError2}(${names_1$6.default.vErrors})`));
  } else {
    gen.assign((0, codegen_1$r._)`${validateName}.errors`, names_1$6.default.vErrors);
    if (opts.unevaluated)
      assignEvaluated(it);
    gen.return((0, codegen_1$r._)`${names_1$6.default.errors} === 0`);
  }
}
function assignEvaluated({ gen, evaluated, props, items: items2 }) {
  if (props instanceof codegen_1$r.Name)
    gen.assign((0, codegen_1$r._)`${evaluated}.props`, props);
  if (items2 instanceof codegen_1$r.Name)
    gen.assign((0, codegen_1$r._)`${evaluated}.items`, items2);
}
function schemaKeywords(it, types2, typeErrors, errsCount) {
  const { gen, schema, data, allErrors, opts, self: self2 } = it;
  const { RULES } = self2;
  if (schema.$ref && (opts.ignoreKeywordsWithRef || !(0, util_1$p.schemaHasRulesButRef)(schema, RULES))) {
    gen.block(() => keywordCode(it, "$ref", RULES.all.$ref.definition));
    return;
  }
  if (!opts.jtd)
    checkStrictTypes(it, types2);
  gen.block(() => {
    for (const group of RULES.rules)
      groupKeywords(group);
    groupKeywords(RULES.post);
  });
  function groupKeywords(group) {
    if (!(0, applicability_1.shouldUseGroup)(schema, group))
      return;
    if (group.type) {
      gen.if((0, dataType_2.checkDataType)(group.type, data, opts.strictNumbers));
      iterateKeywords(it, group);
      if (types2.length === 1 && types2[0] === group.type && typeErrors) {
        gen.else();
        (0, dataType_2.reportTypeError)(it);
      }
      gen.endIf();
    } else {
      iterateKeywords(it, group);
    }
    if (!allErrors)
      gen.if((0, codegen_1$r._)`${names_1$6.default.errors} === ${errsCount || 0}`);
  }
}
function iterateKeywords(it, group) {
  const { gen, schema, opts: { useDefaults } } = it;
  if (useDefaults)
    (0, defaults_1.assignDefaults)(it, group.type);
  gen.block(() => {
    for (const rule of group.rules) {
      if ((0, applicability_1.shouldUseRule)(schema, rule)) {
        keywordCode(it, rule.keyword, rule.definition, group.type);
      }
    }
  });
}
function checkStrictTypes(it, types2) {
  if (it.schemaEnv.meta || !it.opts.strictTypes)
    return;
  checkContextTypes(it, types2);
  if (!it.opts.allowUnionTypes)
    checkMultipleTypes(it, types2);
  checkKeywordTypes(it, it.dataTypes);
}
function checkContextTypes(it, types2) {
  if (!types2.length)
    return;
  if (!it.dataTypes.length) {
    it.dataTypes = types2;
    return;
  }
  types2.forEach((t2) => {
    if (!includesType(it.dataTypes, t2)) {
      strictTypesError(it, `type "${t2}" not allowed by context "${it.dataTypes.join(",")}"`);
    }
  });
  narrowSchemaTypes(it, types2);
}
function checkMultipleTypes(it, ts) {
  if (ts.length > 1 && !(ts.length === 2 && ts.includes("null"))) {
    strictTypesError(it, "use allowUnionTypes to allow union type keyword");
  }
}
function checkKeywordTypes(it, ts) {
  const rules2 = it.self.RULES.all;
  for (const keyword2 in rules2) {
    const rule = rules2[keyword2];
    if (typeof rule == "object" && (0, applicability_1.shouldUseRule)(it.schema, rule)) {
      const { type: type2 } = rule.definition;
      if (type2.length && !type2.some((t2) => hasApplicableType(ts, t2))) {
        strictTypesError(it, `missing type "${type2.join(",")}" for keyword "${keyword2}"`);
      }
    }
  }
}
function hasApplicableType(schTs, kwdT) {
  return schTs.includes(kwdT) || kwdT === "number" && schTs.includes("integer");
}
function includesType(ts, t2) {
  return ts.includes(t2) || t2 === "integer" && ts.includes("number");
}
function narrowSchemaTypes(it, withTypes) {
  const ts = [];
  for (const t2 of it.dataTypes) {
    if (includesType(withTypes, t2))
      ts.push(t2);
    else if (withTypes.includes("integer") && t2 === "number")
      ts.push("integer");
  }
  it.dataTypes = ts;
}
function strictTypesError(it, msg) {
  const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
  msg += ` at "${schemaPath}" (strictTypes)`;
  (0, util_1$p.checkStrictMode)(it, msg, it.opts.strictTypes);
}
class KeywordCxt {
  constructor(it, def2, keyword2) {
    (0, keyword_1.validateKeywordUsage)(it, def2, keyword2);
    this.gen = it.gen;
    this.allErrors = it.allErrors;
    this.keyword = keyword2;
    this.data = it.data;
    this.schema = it.schema[keyword2];
    this.$data = def2.$data && it.opts.$data && this.schema && this.schema.$data;
    this.schemaValue = (0, util_1$p.schemaRefOrVal)(it, this.schema, keyword2, this.$data);
    this.schemaType = def2.schemaType;
    this.parentSchema = it.schema;
    this.params = {};
    this.it = it;
    this.def = def2;
    if (this.$data) {
      this.schemaCode = it.gen.const("vSchema", getData(this.$data, it));
    } else {
      this.schemaCode = this.schemaValue;
      if (!(0, keyword_1.validSchemaType)(this.schema, def2.schemaType, def2.allowUndefined)) {
        throw new Error(`${keyword2} value must be ${JSON.stringify(def2.schemaType)}`);
      }
    }
    if ("code" in def2 ? def2.trackErrors : def2.errors !== false) {
      this.errsCount = it.gen.const("_errs", names_1$6.default.errors);
    }
  }
  result(condition, successAction, failAction) {
    this.failResult((0, codegen_1$r.not)(condition), successAction, failAction);
  }
  failResult(condition, successAction, failAction) {
    this.gen.if(condition);
    if (failAction)
      failAction();
    else
      this.error();
    if (successAction) {
      this.gen.else();
      successAction();
      if (this.allErrors)
        this.gen.endIf();
    } else {
      if (this.allErrors)
        this.gen.endIf();
      else
        this.gen.else();
    }
  }
  pass(condition, failAction) {
    this.failResult((0, codegen_1$r.not)(condition), void 0, failAction);
  }
  fail(condition) {
    if (condition === void 0) {
      this.error();
      if (!this.allErrors)
        this.gen.if(false);
      return;
    }
    this.gen.if(condition);
    this.error();
    if (this.allErrors)
      this.gen.endIf();
    else
      this.gen.else();
  }
  fail$data(condition) {
    if (!this.$data)
      return this.fail(condition);
    const { schemaCode } = this;
    this.fail((0, codegen_1$r._)`${schemaCode} !== undefined && (${(0, codegen_1$r.or)(this.invalid$data(), condition)})`);
  }
  error(append, errorParams, errorPaths) {
    if (errorParams) {
      this.setParams(errorParams);
      this._error(append, errorPaths);
      this.setParams({});
      return;
    }
    this._error(append, errorPaths);
  }
  _error(append, errorPaths) {
    (append ? errors_1.reportExtraError : errors_1.reportError)(this, this.def.error, errorPaths);
  }
  $dataError() {
    (0, errors_1.reportError)(this, this.def.$dataError || errors_1.keyword$DataError);
  }
  reset() {
    if (this.errsCount === void 0)
      throw new Error('add "trackErrors" to keyword definition');
    (0, errors_1.resetErrorsCount)(this.gen, this.errsCount);
  }
  ok(cond) {
    if (!this.allErrors)
      this.gen.if(cond);
  }
  setParams(obj, assign) {
    if (assign)
      Object.assign(this.params, obj);
    else
      this.params = obj;
  }
  block$data(valid, codeBlock, $dataValid = codegen_1$r.nil) {
    this.gen.block(() => {
      this.check$data(valid, $dataValid);
      codeBlock();
    });
  }
  check$data(valid = codegen_1$r.nil, $dataValid = codegen_1$r.nil) {
    if (!this.$data)
      return;
    const { gen, schemaCode, schemaType, def: def2 } = this;
    gen.if((0, codegen_1$r.or)((0, codegen_1$r._)`${schemaCode} === undefined`, $dataValid));
    if (valid !== codegen_1$r.nil)
      gen.assign(valid, true);
    if (schemaType.length || def2.validateSchema) {
      gen.elseIf(this.invalid$data());
      this.$dataError();
      if (valid !== codegen_1$r.nil)
        gen.assign(valid, false);
    }
    gen.else();
  }
  invalid$data() {
    const { gen, schemaCode, schemaType, def: def2, it } = this;
    return (0, codegen_1$r.or)(wrong$DataType(), invalid$DataSchema());
    function wrong$DataType() {
      if (schemaType.length) {
        if (!(schemaCode instanceof codegen_1$r.Name))
          throw new Error("ajv implementation error");
        const st = Array.isArray(schemaType) ? schemaType : [schemaType];
        return (0, codegen_1$r._)`${(0, dataType_2.checkDataTypes)(st, schemaCode, it.opts.strictNumbers, dataType_2.DataType.Wrong)}`;
      }
      return codegen_1$r.nil;
    }
    function invalid$DataSchema() {
      if (def2.validateSchema) {
        const validateSchemaRef = gen.scopeValue("validate$data", { ref: def2.validateSchema });
        return (0, codegen_1$r._)`!${validateSchemaRef}(${schemaCode})`;
      }
      return codegen_1$r.nil;
    }
  }
  subschema(appl, valid) {
    const subschema2 = (0, subschema_1.getSubschema)(this.it, appl);
    (0, subschema_1.extendSubschemaData)(subschema2, this.it, appl);
    (0, subschema_1.extendSubschemaMode)(subschema2, appl);
    const nextContext = { ...this.it, ...subschema2, items: void 0, props: void 0 };
    subschemaCode(nextContext, valid);
    return nextContext;
  }
  mergeEvaluated(schemaCxt, toName) {
    const { it, gen } = this;
    if (!it.opts.unevaluated)
      return;
    if (it.props !== true && schemaCxt.props !== void 0) {
      it.props = util_1$p.mergeEvaluated.props(gen, schemaCxt.props, it.props, toName);
    }
    if (it.items !== true && schemaCxt.items !== void 0) {
      it.items = util_1$p.mergeEvaluated.items(gen, schemaCxt.items, it.items, toName);
    }
  }
  mergeValidEvaluated(schemaCxt, valid) {
    const { it, gen } = this;
    if (it.opts.unevaluated && (it.props !== true || it.items !== true)) {
      gen.if(valid, () => this.mergeEvaluated(schemaCxt, codegen_1$r.Name));
      return true;
    }
  }
}
validate.KeywordCxt = KeywordCxt;
function keywordCode(it, keyword2, def2, ruleType) {
  const cxt = new KeywordCxt(it, def2, keyword2);
  if ("code" in def2) {
    def2.code(cxt, ruleType);
  } else if (cxt.$data && def2.validate) {
    (0, keyword_1.funcKeywordCode)(cxt, def2);
  } else if ("macro" in def2) {
    (0, keyword_1.macroKeywordCode)(cxt, def2);
  } else if (def2.compile || def2.validate) {
    (0, keyword_1.funcKeywordCode)(cxt, def2);
  }
}
const JSON_POINTER = /^\/(?:[^~]|~0|~1)*$/;
const RELATIVE_JSON_POINTER = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function getData($data, { dataLevel, dataNames, dataPathArr }) {
  let jsonPointer;
  let data;
  if ($data === "")
    return names_1$6.default.rootData;
  if ($data[0] === "/") {
    if (!JSON_POINTER.test($data))
      throw new Error(`Invalid JSON-pointer: ${$data}`);
    jsonPointer = $data;
    data = names_1$6.default.rootData;
  } else {
    const matches = RELATIVE_JSON_POINTER.exec($data);
    if (!matches)
      throw new Error(`Invalid JSON-pointer: ${$data}`);
    const up = +matches[1];
    jsonPointer = matches[2];
    if (jsonPointer === "#") {
      if (up >= dataLevel)
        throw new Error(errorMsg("property/index", up));
      return dataPathArr[dataLevel - up];
    }
    if (up > dataLevel)
      throw new Error(errorMsg("data", up));
    data = dataNames[dataLevel - up];
    if (!jsonPointer)
      return data;
  }
  let expr = data;
  const segments = jsonPointer.split("/");
  for (const segment of segments) {
    if (segment) {
      data = (0, codegen_1$r._)`${data}${(0, codegen_1$r.getProperty)((0, util_1$p.unescapeJsonPointer)(segment))}`;
      expr = (0, codegen_1$r._)`${expr} && ${data}`;
    }
  }
  return expr;
  function errorMsg(pointerType, up) {
    return `Cannot access ${pointerType} ${up} levels up, current level is ${dataLevel}`;
  }
}
validate.getData = getData;
var validation_error = {};
Object.defineProperty(validation_error, "__esModule", { value: true });
class ValidationError extends Error {
  constructor(errors2) {
    super("validation failed");
    this.errors = errors2;
    this.ajv = this.validation = true;
  }
}
validation_error.default = ValidationError;
var ref_error = {};
Object.defineProperty(ref_error, "__esModule", { value: true });
const resolve_1$1 = resolve$2;
class MissingRefError extends Error {
  constructor(resolver, baseId, ref2, msg) {
    super(msg || `can't resolve reference ${ref2} from id ${baseId}`);
    this.missingRef = (0, resolve_1$1.resolveUrl)(resolver, baseId, ref2);
    this.missingSchema = (0, resolve_1$1.normalizeId)((0, resolve_1$1.getFullPath)(resolver, this.missingRef));
  }
}
ref_error.default = MissingRefError;
var compile = {};
Object.defineProperty(compile, "__esModule", { value: true });
compile.resolveSchema = compile.getCompilingSchema = compile.resolveRef = compile.compileSchema = compile.SchemaEnv = void 0;
const codegen_1$q = codegen;
const validation_error_1 = validation_error;
const names_1$5 = names$1;
const resolve_1 = resolve$2;
const util_1$o = util;
const validate_1$1 = validate;
class SchemaEnv {
  constructor(env) {
    var _a;
    this.refs = {};
    this.dynamicAnchors = {};
    let schema;
    if (typeof env.schema == "object")
      schema = env.schema;
    this.schema = env.schema;
    this.schemaId = env.schemaId;
    this.root = env.root || this;
    this.baseId = (_a = env.baseId) !== null && _a !== void 0 ? _a : (0, resolve_1.normalizeId)(schema === null || schema === void 0 ? void 0 : schema[env.schemaId || "$id"]);
    this.schemaPath = env.schemaPath;
    this.localRefs = env.localRefs;
    this.meta = env.meta;
    this.$async = schema === null || schema === void 0 ? void 0 : schema.$async;
    this.refs = {};
  }
}
compile.SchemaEnv = SchemaEnv;
function compileSchema(sch) {
  const _sch = getCompilingSchema.call(this, sch);
  if (_sch)
    return _sch;
  const rootId = (0, resolve_1.getFullPath)(this.opts.uriResolver, sch.root.baseId);
  const { es5, lines } = this.opts.code;
  const { ownProperties } = this.opts;
  const gen = new codegen_1$q.CodeGen(this.scope, { es5, lines, ownProperties });
  let _ValidationError;
  if (sch.$async) {
    _ValidationError = gen.scopeValue("Error", {
      ref: validation_error_1.default,
      code: (0, codegen_1$q._)`require("ajv/dist/runtime/validation_error").default`
    });
  }
  const validateName = gen.scopeName("validate");
  sch.validateName = validateName;
  const schemaCxt = {
    gen,
    allErrors: this.opts.allErrors,
    data: names_1$5.default.data,
    parentData: names_1$5.default.parentData,
    parentDataProperty: names_1$5.default.parentDataProperty,
    dataNames: [names_1$5.default.data],
    dataPathArr: [codegen_1$q.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: gen.scopeValue("schema", this.opts.code.source === true ? { ref: sch.schema, code: (0, codegen_1$q.stringify)(sch.schema) } : { ref: sch.schema }),
    validateName,
    ValidationError: _ValidationError,
    schema: sch.schema,
    schemaEnv: sch,
    rootId,
    baseId: sch.baseId || rootId,
    schemaPath: codegen_1$q.nil,
    errSchemaPath: sch.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, codegen_1$q._)`""`,
    opts: this.opts,
    self: this
  };
  let sourceCode;
  try {
    this._compilations.add(sch);
    (0, validate_1$1.validateFunctionCode)(schemaCxt);
    gen.optimize(this.opts.code.optimize);
    const validateCode = gen.toString();
    sourceCode = `${gen.scopeRefs(names_1$5.default.scope)}return ${validateCode}`;
    if (this.opts.code.process)
      sourceCode = this.opts.code.process(sourceCode, sch);
    const makeValidate = new Function(`${names_1$5.default.self}`, `${names_1$5.default.scope}`, sourceCode);
    const validate2 = makeValidate(this, this.scope.get());
    this.scope.value(validateName, { ref: validate2 });
    validate2.errors = null;
    validate2.schema = sch.schema;
    validate2.schemaEnv = sch;
    if (sch.$async)
      validate2.$async = true;
    if (this.opts.code.source === true) {
      validate2.source = { validateName, validateCode, scopeValues: gen._values };
    }
    if (this.opts.unevaluated) {
      const { props, items: items2 } = schemaCxt;
      validate2.evaluated = {
        props: props instanceof codegen_1$q.Name ? void 0 : props,
        items: items2 instanceof codegen_1$q.Name ? void 0 : items2,
        dynamicProps: props instanceof codegen_1$q.Name,
        dynamicItems: items2 instanceof codegen_1$q.Name
      };
      if (validate2.source)
        validate2.source.evaluated = (0, codegen_1$q.stringify)(validate2.evaluated);
    }
    sch.validate = validate2;
    return sch;
  } catch (e) {
    delete sch.validate;
    delete sch.validateName;
    if (sourceCode)
      this.logger.error("Error compiling schema, function code:", sourceCode);
    throw e;
  } finally {
    this._compilations.delete(sch);
  }
}
compile.compileSchema = compileSchema;
function resolveRef(root, baseId, ref2) {
  var _a;
  ref2 = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, ref2);
  const schOrFunc = root.refs[ref2];
  if (schOrFunc)
    return schOrFunc;
  let _sch = resolve$1.call(this, root, ref2);
  if (_sch === void 0) {
    const schema = (_a = root.localRefs) === null || _a === void 0 ? void 0 : _a[ref2];
    const { schemaId } = this.opts;
    if (schema)
      _sch = new SchemaEnv({ schema, schemaId, root, baseId });
  }
  if (_sch === void 0)
    return;
  return root.refs[ref2] = inlineOrCompile.call(this, _sch);
}
compile.resolveRef = resolveRef;
function inlineOrCompile(sch) {
  if ((0, resolve_1.inlineRef)(sch.schema, this.opts.inlineRefs))
    return sch.schema;
  return sch.validate ? sch : compileSchema.call(this, sch);
}
function getCompilingSchema(schEnv) {
  for (const sch of this._compilations) {
    if (sameSchemaEnv(sch, schEnv))
      return sch;
  }
}
compile.getCompilingSchema = getCompilingSchema;
function sameSchemaEnv(s1, s2) {
  return s1.schema === s2.schema && s1.root === s2.root && s1.baseId === s2.baseId;
}
function resolve$1(root, ref2) {
  let sch;
  while (typeof (sch = this.refs[ref2]) == "string")
    ref2 = sch;
  return sch || this.schemas[ref2] || resolveSchema.call(this, root, ref2);
}
function resolveSchema(root, ref2) {
  const p = this.opts.uriResolver.parse(ref2);
  const refPath = (0, resolve_1._getFullPath)(this.opts.uriResolver, p);
  let baseId = (0, resolve_1.getFullPath)(this.opts.uriResolver, root.baseId, void 0);
  if (Object.keys(root.schema).length > 0 && refPath === baseId) {
    return getJsonPointer.call(this, p, root);
  }
  const id2 = (0, resolve_1.normalizeId)(refPath);
  const schOrRef = this.refs[id2] || this.schemas[id2];
  if (typeof schOrRef == "string") {
    const sch = resolveSchema.call(this, root, schOrRef);
    if (typeof (sch === null || sch === void 0 ? void 0 : sch.schema) !== "object")
      return;
    return getJsonPointer.call(this, p, sch);
  }
  if (typeof (schOrRef === null || schOrRef === void 0 ? void 0 : schOrRef.schema) !== "object")
    return;
  if (!schOrRef.validate)
    compileSchema.call(this, schOrRef);
  if (id2 === (0, resolve_1.normalizeId)(ref2)) {
    const { schema } = schOrRef;
    const { schemaId } = this.opts;
    const schId = schema[schemaId];
    if (schId)
      baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId);
    return new SchemaEnv({ schema, schemaId, root, baseId });
  }
  return getJsonPointer.call(this, p, schOrRef);
}
compile.resolveSchema = resolveSchema;
const PREVENT_SCOPE_CHANGE = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function getJsonPointer(parsedRef, { baseId, schema, root }) {
  var _a;
  if (((_a = parsedRef.fragment) === null || _a === void 0 ? void 0 : _a[0]) !== "/")
    return;
  for (const part of parsedRef.fragment.slice(1).split("/")) {
    if (typeof schema === "boolean")
      return;
    const partSchema = schema[(0, util_1$o.unescapeFragment)(part)];
    if (partSchema === void 0)
      return;
    schema = partSchema;
    const schId = typeof schema === "object" && schema[this.opts.schemaId];
    if (!PREVENT_SCOPE_CHANGE.has(part) && schId) {
      baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId);
    }
  }
  let env;
  if (typeof schema != "boolean" && schema.$ref && !(0, util_1$o.schemaHasRulesButRef)(schema, this.RULES)) {
    const $ref = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schema.$ref);
    env = resolveSchema.call(this, root, $ref);
  }
  const { schemaId } = this.opts;
  env = env || new SchemaEnv({ schema, schemaId, root, baseId });
  if (env.schema !== env.root.schema)
    return env;
  return void 0;
}
const $id$8 = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#";
const description = "Meta-schema for $data reference (JSON AnySchema extension proposal)";
const type$8 = "object";
const required$1 = [
  "$data"
];
const properties$9 = {
  $data: {
    type: "string",
    anyOf: [
      {
        format: "relative-json-pointer"
      },
      {
        format: "json-pointer"
      }
    ]
  }
};
const additionalProperties$1 = false;
const require$$9 = {
  $id: $id$8,
  description,
  type: type$8,
  required: required$1,
  properties: properties$9,
  additionalProperties: additionalProperties$1
};
var uri$1 = {};
var fastUri$1 = { exports: {} };
const HEX$1 = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  a: 10,
  A: 10,
  b: 11,
  B: 11,
  c: 12,
  C: 12,
  d: 13,
  D: 13,
  e: 14,
  E: 14,
  f: 15,
  F: 15
};
var scopedChars = {
  HEX: HEX$1
};
const { HEX } = scopedChars;
function normalizeIPv4$1(host) {
  if (findToken(host, ".") < 3) {
    return { host, isIPV4: false };
  }
  const matches = host.match(/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/u) || [];
  const [address] = matches;
  if (address) {
    return { host: stripLeadingZeros(address, "."), isIPV4: true };
  } else {
    return { host, isIPV4: false };
  }
}
function stringArrayToHexStripped(input, keepZero = false) {
  let acc = "";
  let strip = true;
  for (const c of input) {
    if (HEX[c] === void 0) return void 0;
    if (c !== "0" && strip === true) strip = false;
    if (!strip) acc += c;
  }
  if (keepZero && acc.length === 0) acc = "0";
  return acc;
}
function getIPV6(input) {
  let tokenCount = 0;
  const output = { error: false, address: "", zone: "" };
  const address = [];
  const buffer = [];
  let isZone = false;
  let endipv6Encountered = false;
  let endIpv6 = false;
  function consume() {
    if (buffer.length) {
      if (isZone === false) {
        const hex = stringArrayToHexStripped(buffer);
        if (hex !== void 0) {
          address.push(hex);
        } else {
          output.error = true;
          return false;
        }
      }
      buffer.length = 0;
    }
    return true;
  }
  for (let i2 = 0; i2 < input.length; i2++) {
    const cursor = input[i2];
    if (cursor === "[" || cursor === "]") {
      continue;
    }
    if (cursor === ":") {
      if (endipv6Encountered === true) {
        endIpv6 = true;
      }
      if (!consume()) {
        break;
      }
      tokenCount++;
      address.push(":");
      if (tokenCount > 7) {
        output.error = true;
        break;
      }
      if (i2 - 1 >= 0 && input[i2 - 1] === ":") {
        endipv6Encountered = true;
      }
      continue;
    } else if (cursor === "%") {
      if (!consume()) {
        break;
      }
      isZone = true;
    } else {
      buffer.push(cursor);
      continue;
    }
  }
  if (buffer.length) {
    if (isZone) {
      output.zone = buffer.join("");
    } else if (endIpv6) {
      address.push(buffer.join(""));
    } else {
      address.push(stringArrayToHexStripped(buffer));
    }
  }
  output.address = address.join("");
  return output;
}
function normalizeIPv6$1(host, opts = {}) {
  if (findToken(host, ":") < 2) {
    return { host, isIPV6: false };
  }
  const ipv6 = getIPV6(host);
  if (!ipv6.error) {
    let newHost = ipv6.address;
    let escapedHost = ipv6.address;
    if (ipv6.zone) {
      newHost += "%" + ipv6.zone;
      escapedHost += "%25" + ipv6.zone;
    }
    return { host: newHost, escapedHost, isIPV6: true };
  } else {
    return { host, isIPV6: false };
  }
}
function stripLeadingZeros(str, token) {
  let out = "";
  let skip = true;
  const l = str.length;
  for (let i2 = 0; i2 < l; i2++) {
    const c = str[i2];
    if (c === "0" && skip) {
      if (i2 + 1 <= l && str[i2 + 1] === token || i2 + 1 === l) {
        out += c;
        skip = false;
      }
    } else {
      if (c === token) {
        skip = true;
      } else {
        skip = false;
      }
      out += c;
    }
  }
  return out;
}
function findToken(str, token) {
  let ind = 0;
  for (let i2 = 0; i2 < str.length; i2++) {
    if (str[i2] === token) ind++;
  }
  return ind;
}
const RDS1 = /^\.\.?\//u;
const RDS2 = /^\/\.(?:\/|$)/u;
const RDS3 = /^\/\.\.(?:\/|$)/u;
const RDS5 = /^\/?(?:.|\n)*?(?=\/|$)/u;
function removeDotSegments$1(input) {
  const output = [];
  while (input.length) {
    if (input.match(RDS1)) {
      input = input.replace(RDS1, "");
    } else if (input.match(RDS2)) {
      input = input.replace(RDS2, "/");
    } else if (input.match(RDS3)) {
      input = input.replace(RDS3, "/");
      output.pop();
    } else if (input === "." || input === "..") {
      input = "";
    } else {
      const im = input.match(RDS5);
      if (im) {
        const s2 = im[0];
        input = input.slice(s2.length);
        output.push(s2);
      } else {
        throw new Error("Unexpected dot segment condition");
      }
    }
  }
  return output.join("");
}
function normalizeComponentEncoding$1(components, esc) {
  const func = esc !== true ? escape : unescape;
  if (components.scheme !== void 0) {
    components.scheme = func(components.scheme);
  }
  if (components.userinfo !== void 0) {
    components.userinfo = func(components.userinfo);
  }
  if (components.host !== void 0) {
    components.host = func(components.host);
  }
  if (components.path !== void 0) {
    components.path = func(components.path);
  }
  if (components.query !== void 0) {
    components.query = func(components.query);
  }
  if (components.fragment !== void 0) {
    components.fragment = func(components.fragment);
  }
  return components;
}
function recomposeAuthority$1(components, options) {
  const uriTokens = [];
  if (components.userinfo !== void 0) {
    uriTokens.push(components.userinfo);
    uriTokens.push("@");
  }
  if (components.host !== void 0) {
    let host = unescape(components.host);
    const ipV4res = normalizeIPv4$1(host);
    if (ipV4res.isIPV4) {
      host = ipV4res.host;
    } else {
      const ipV6res = normalizeIPv6$1(ipV4res.host, { isIPV4: false });
      if (ipV6res.isIPV6 === true) {
        host = `[${ipV6res.escapedHost}]`;
      } else {
        host = components.host;
      }
    }
    uriTokens.push(host);
  }
  if (typeof components.port === "number" || typeof components.port === "string") {
    uriTokens.push(":");
    uriTokens.push(String(components.port));
  }
  return uriTokens.length ? uriTokens.join("") : void 0;
}
var utils = {
  recomposeAuthority: recomposeAuthority$1,
  normalizeComponentEncoding: normalizeComponentEncoding$1,
  removeDotSegments: removeDotSegments$1,
  normalizeIPv4: normalizeIPv4$1,
  normalizeIPv6: normalizeIPv6$1,
  stringArrayToHexStripped
};
const UUID_REG = /^[\da-f]{8}\b-[\da-f]{4}\b-[\da-f]{4}\b-[\da-f]{4}\b-[\da-f]{12}$/iu;
const URN_REG = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
function isSecure(wsComponents) {
  return typeof wsComponents.secure === "boolean" ? wsComponents.secure : String(wsComponents.scheme).toLowerCase() === "wss";
}
function httpParse(components) {
  if (!components.host) {
    components.error = components.error || "HTTP URIs must have a host.";
  }
  return components;
}
function httpSerialize(components) {
  const secure = String(components.scheme).toLowerCase() === "https";
  if (components.port === (secure ? 443 : 80) || components.port === "") {
    components.port = void 0;
  }
  if (!components.path) {
    components.path = "/";
  }
  return components;
}
function wsParse(wsComponents) {
  wsComponents.secure = isSecure(wsComponents);
  wsComponents.resourceName = (wsComponents.path || "/") + (wsComponents.query ? "?" + wsComponents.query : "");
  wsComponents.path = void 0;
  wsComponents.query = void 0;
  return wsComponents;
}
function wsSerialize(wsComponents) {
  if (wsComponents.port === (isSecure(wsComponents) ? 443 : 80) || wsComponents.port === "") {
    wsComponents.port = void 0;
  }
  if (typeof wsComponents.secure === "boolean") {
    wsComponents.scheme = wsComponents.secure ? "wss" : "ws";
    wsComponents.secure = void 0;
  }
  if (wsComponents.resourceName) {
    const [path, query] = wsComponents.resourceName.split("?");
    wsComponents.path = path && path !== "/" ? path : void 0;
    wsComponents.query = query;
    wsComponents.resourceName = void 0;
  }
  wsComponents.fragment = void 0;
  return wsComponents;
}
function urnParse(urnComponents, options) {
  if (!urnComponents.path) {
    urnComponents.error = "URN can not be parsed";
    return urnComponents;
  }
  const matches = urnComponents.path.match(URN_REG);
  if (matches) {
    const scheme = options.scheme || urnComponents.scheme || "urn";
    urnComponents.nid = matches[1].toLowerCase();
    urnComponents.nss = matches[2];
    const urnScheme = `${scheme}:${options.nid || urnComponents.nid}`;
    const schemeHandler = SCHEMES$1[urnScheme];
    urnComponents.path = void 0;
    if (schemeHandler) {
      urnComponents = schemeHandler.parse(urnComponents, options);
    }
  } else {
    urnComponents.error = urnComponents.error || "URN can not be parsed.";
  }
  return urnComponents;
}
function urnSerialize(urnComponents, options) {
  const scheme = options.scheme || urnComponents.scheme || "urn";
  const nid = urnComponents.nid.toLowerCase();
  const urnScheme = `${scheme}:${options.nid || nid}`;
  const schemeHandler = SCHEMES$1[urnScheme];
  if (schemeHandler) {
    urnComponents = schemeHandler.serialize(urnComponents, options);
  }
  const uriComponents = urnComponents;
  const nss = urnComponents.nss;
  uriComponents.path = `${nid || options.nid}:${nss}`;
  options.skipEscape = true;
  return uriComponents;
}
function urnuuidParse(urnComponents, options) {
  const uuidComponents = urnComponents;
  uuidComponents.uuid = uuidComponents.nss;
  uuidComponents.nss = void 0;
  if (!options.tolerant && (!uuidComponents.uuid || !UUID_REG.test(uuidComponents.uuid))) {
    uuidComponents.error = uuidComponents.error || "UUID is not valid.";
  }
  return uuidComponents;
}
function urnuuidSerialize(uuidComponents) {
  const urnComponents = uuidComponents;
  urnComponents.nss = (uuidComponents.uuid || "").toLowerCase();
  return urnComponents;
}
const http = {
  scheme: "http",
  domainHost: true,
  parse: httpParse,
  serialize: httpSerialize
};
const https = {
  scheme: "https",
  domainHost: http.domainHost,
  parse: httpParse,
  serialize: httpSerialize
};
const ws = {
  scheme: "ws",
  domainHost: true,
  parse: wsParse,
  serialize: wsSerialize
};
const wss = {
  scheme: "wss",
  domainHost: ws.domainHost,
  parse: ws.parse,
  serialize: ws.serialize
};
const urn = {
  scheme: "urn",
  parse: urnParse,
  serialize: urnSerialize,
  skipNormalize: true
};
const urnuuid = {
  scheme: "urn:uuid",
  parse: urnuuidParse,
  serialize: urnuuidSerialize,
  skipNormalize: true
};
const SCHEMES$1 = {
  http,
  https,
  ws,
  wss,
  urn,
  "urn:uuid": urnuuid
};
var schemes = SCHEMES$1;
const { normalizeIPv6, normalizeIPv4, removeDotSegments, recomposeAuthority, normalizeComponentEncoding } = utils;
const SCHEMES = schemes;
function normalize(uri2, options) {
  if (typeof uri2 === "string") {
    uri2 = serialize(parse(uri2, options), options);
  } else if (typeof uri2 === "object") {
    uri2 = parse(serialize(uri2, options), options);
  }
  return uri2;
}
function resolve(baseURI, relativeURI, options) {
  const schemelessOptions = Object.assign({ scheme: "null" }, options);
  const resolved = resolveComponents(parse(baseURI, schemelessOptions), parse(relativeURI, schemelessOptions), schemelessOptions, true);
  return serialize(resolved, { ...schemelessOptions, skipEscape: true });
}
function resolveComponents(base, relative, options, skipNormalization) {
  const target = {};
  if (!skipNormalization) {
    base = parse(serialize(base, options), options);
    relative = parse(serialize(relative, options), options);
  }
  options = options || {};
  if (!options.tolerant && relative.scheme) {
    target.scheme = relative.scheme;
    target.userinfo = relative.userinfo;
    target.host = relative.host;
    target.port = relative.port;
    target.path = removeDotSegments(relative.path || "");
    target.query = relative.query;
  } else {
    if (relative.userinfo !== void 0 || relative.host !== void 0 || relative.port !== void 0) {
      target.userinfo = relative.userinfo;
      target.host = relative.host;
      target.port = relative.port;
      target.path = removeDotSegments(relative.path || "");
      target.query = relative.query;
    } else {
      if (!relative.path) {
        target.path = base.path;
        if (relative.query !== void 0) {
          target.query = relative.query;
        } else {
          target.query = base.query;
        }
      } else {
        if (relative.path.charAt(0) === "/") {
          target.path = removeDotSegments(relative.path);
        } else {
          if ((base.userinfo !== void 0 || base.host !== void 0 || base.port !== void 0) && !base.path) {
            target.path = "/" + relative.path;
          } else if (!base.path) {
            target.path = relative.path;
          } else {
            target.path = base.path.slice(0, base.path.lastIndexOf("/") + 1) + relative.path;
          }
          target.path = removeDotSegments(target.path);
        }
        target.query = relative.query;
      }
      target.userinfo = base.userinfo;
      target.host = base.host;
      target.port = base.port;
    }
    target.scheme = base.scheme;
  }
  target.fragment = relative.fragment;
  return target;
}
function equal$2(uriA, uriB, options) {
  if (typeof uriA === "string") {
    uriA = unescape(uriA);
    uriA = serialize(normalizeComponentEncoding(parse(uriA, options), true), { ...options, skipEscape: true });
  } else if (typeof uriA === "object") {
    uriA = serialize(normalizeComponentEncoding(uriA, true), { ...options, skipEscape: true });
  }
  if (typeof uriB === "string") {
    uriB = unescape(uriB);
    uriB = serialize(normalizeComponentEncoding(parse(uriB, options), true), { ...options, skipEscape: true });
  } else if (typeof uriB === "object") {
    uriB = serialize(normalizeComponentEncoding(uriB, true), { ...options, skipEscape: true });
  }
  return uriA.toLowerCase() === uriB.toLowerCase();
}
function serialize(cmpts, opts) {
  const components = {
    host: cmpts.host,
    scheme: cmpts.scheme,
    userinfo: cmpts.userinfo,
    port: cmpts.port,
    path: cmpts.path,
    query: cmpts.query,
    nid: cmpts.nid,
    nss: cmpts.nss,
    uuid: cmpts.uuid,
    fragment: cmpts.fragment,
    reference: cmpts.reference,
    resourceName: cmpts.resourceName,
    secure: cmpts.secure,
    error: ""
  };
  const options = Object.assign({}, opts);
  const uriTokens = [];
  const schemeHandler = SCHEMES[(options.scheme || components.scheme || "").toLowerCase()];
  if (schemeHandler && schemeHandler.serialize) schemeHandler.serialize(components, options);
  if (components.path !== void 0) {
    if (!options.skipEscape) {
      components.path = escape(components.path);
      if (components.scheme !== void 0) {
        components.path = components.path.split("%3A").join(":");
      }
    } else {
      components.path = unescape(components.path);
    }
  }
  if (options.reference !== "suffix" && components.scheme) {
    uriTokens.push(components.scheme);
    uriTokens.push(":");
  }
  const authority = recomposeAuthority(components, options);
  if (authority !== void 0) {
    if (options.reference !== "suffix") {
      uriTokens.push("//");
    }
    uriTokens.push(authority);
    if (components.path && components.path.charAt(0) !== "/") {
      uriTokens.push("/");
    }
  }
  if (components.path !== void 0) {
    let s2 = components.path;
    if (!options.absolutePath && (!schemeHandler || !schemeHandler.absolutePath)) {
      s2 = removeDotSegments(s2);
    }
    if (authority === void 0) {
      s2 = s2.replace(/^\/\//u, "/%2F");
    }
    uriTokens.push(s2);
  }
  if (components.query !== void 0) {
    uriTokens.push("?");
    uriTokens.push(components.query);
  }
  if (components.fragment !== void 0) {
    uriTokens.push("#");
    uriTokens.push(components.fragment);
  }
  return uriTokens.join("");
}
const hexLookUp = Array.from({ length: 127 }, (v, k) => /[^!"$&'()*+,\-.;=_`a-z{}~]/u.test(String.fromCharCode(k)));
function nonSimpleDomain(value) {
  let code2 = 0;
  for (let i2 = 0, len = value.length; i2 < len; ++i2) {
    code2 = value.charCodeAt(i2);
    if (code2 > 126 || hexLookUp[code2]) {
      return true;
    }
  }
  return false;
}
const URI_PARSE = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
function parse(uri2, opts) {
  const options = Object.assign({}, opts);
  const parsed = {
    scheme: void 0,
    userinfo: void 0,
    host: "",
    port: void 0,
    path: "",
    query: void 0,
    fragment: void 0
  };
  const gotEncoding = uri2.indexOf("%") !== -1;
  let isIP = false;
  if (options.reference === "suffix") uri2 = (options.scheme ? options.scheme + ":" : "") + "//" + uri2;
  const matches = uri2.match(URI_PARSE);
  if (matches) {
    parsed.scheme = matches[1];
    parsed.userinfo = matches[3];
    parsed.host = matches[4];
    parsed.port = parseInt(matches[5], 10);
    parsed.path = matches[6] || "";
    parsed.query = matches[7];
    parsed.fragment = matches[8];
    if (isNaN(parsed.port)) {
      parsed.port = matches[5];
    }
    if (parsed.host) {
      const ipv4result = normalizeIPv4(parsed.host);
      if (ipv4result.isIPV4 === false) {
        const ipv6result = normalizeIPv6(ipv4result.host, { isIPV4: false });
        parsed.host = ipv6result.host.toLowerCase();
        isIP = ipv6result.isIPV6;
      } else {
        parsed.host = ipv4result.host;
        isIP = true;
      }
    }
    if (parsed.scheme === void 0 && parsed.userinfo === void 0 && parsed.host === void 0 && parsed.port === void 0 && !parsed.path && parsed.query === void 0) {
      parsed.reference = "same-document";
    } else if (parsed.scheme === void 0) {
      parsed.reference = "relative";
    } else if (parsed.fragment === void 0) {
      parsed.reference = "absolute";
    } else {
      parsed.reference = "uri";
    }
    if (options.reference && options.reference !== "suffix" && options.reference !== parsed.reference) {
      parsed.error = parsed.error || "URI is not a " + options.reference + " reference.";
    }
    const schemeHandler = SCHEMES[(options.scheme || parsed.scheme || "").toLowerCase()];
    if (!options.unicodeSupport && (!schemeHandler || !schemeHandler.unicodeSupport)) {
      if (parsed.host && (options.domainHost || schemeHandler && schemeHandler.domainHost) && isIP === false && nonSimpleDomain(parsed.host)) {
        try {
          parsed.host = URL.domainToASCII(parsed.host.toLowerCase());
        } catch (e) {
          parsed.error = parsed.error || "Host's domain name can not be converted to ASCII: " + e;
        }
      }
    }
    if (!schemeHandler || schemeHandler && !schemeHandler.skipNormalize) {
      if (gotEncoding && parsed.scheme !== void 0) {
        parsed.scheme = unescape(parsed.scheme);
      }
      if (gotEncoding && parsed.userinfo !== void 0) {
        parsed.userinfo = unescape(parsed.userinfo);
      }
      if (gotEncoding && parsed.host !== void 0) {
        parsed.host = unescape(parsed.host);
      }
      if (parsed.path !== void 0 && parsed.path.length) {
        parsed.path = escape(unescape(parsed.path));
      }
      if (parsed.fragment !== void 0 && parsed.fragment.length) {
        parsed.fragment = encodeURI(decodeURIComponent(parsed.fragment));
      }
    }
    if (schemeHandler && schemeHandler.parse) {
      schemeHandler.parse(parsed, options);
    }
  } else {
    parsed.error = parsed.error || "URI can not be parsed.";
  }
  return parsed;
}
const fastUri = {
  SCHEMES,
  normalize,
  resolve,
  resolveComponents,
  equal: equal$2,
  serialize,
  parse
};
fastUri$1.exports = fastUri;
fastUri$1.exports.default = fastUri;
fastUri$1.exports.fastUri = fastUri;
var fastUriExports = fastUri$1.exports;
Object.defineProperty(uri$1, "__esModule", { value: true });
const uri = fastUriExports;
uri.code = 'require("ajv/dist/runtime/uri").default';
uri$1.default = uri;
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = void 0;
  var validate_12 = validate;
  Object.defineProperty(exports, "KeywordCxt", { enumerable: true, get: function() {
    return validate_12.KeywordCxt;
  } });
  var codegen_12 = codegen;
  Object.defineProperty(exports, "_", { enumerable: true, get: function() {
    return codegen_12._;
  } });
  Object.defineProperty(exports, "str", { enumerable: true, get: function() {
    return codegen_12.str;
  } });
  Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
    return codegen_12.stringify;
  } });
  Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
    return codegen_12.nil;
  } });
  Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
    return codegen_12.Name;
  } });
  Object.defineProperty(exports, "CodeGen", { enumerable: true, get: function() {
    return codegen_12.CodeGen;
  } });
  const validation_error_12 = validation_error;
  const ref_error_12 = ref_error;
  const rules_12 = rules;
  const compile_12 = compile;
  const codegen_2 = codegen;
  const resolve_12 = resolve$2;
  const dataType_12 = dataType;
  const util_12 = util;
  const $dataRefSchema = require$$9;
  const uri_1 = uri$1;
  const defaultRegExp = (str, flags) => new RegExp(str, flags);
  defaultRegExp.code = "new RegExp";
  const META_IGNORE_OPTIONS = ["removeAdditional", "useDefaults", "coerceTypes"];
  const EXT_SCOPE_NAMES = /* @__PURE__ */ new Set([
    "validate",
    "serialize",
    "parse",
    "wrapper",
    "root",
    "schema",
    "keyword",
    "pattern",
    "formats",
    "validate$data",
    "func",
    "obj",
    "Error"
  ]);
  const removedOptions = {
    errorDataPath: "",
    format: "`validateFormats: false` can be used instead.",
    nullable: '"nullable" keyword is supported by default.',
    jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
    extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
    missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
    processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
    sourceCode: "Use option `code: {source: true}`",
    strictDefaults: "It is default now, see option `strict`.",
    strictKeywords: "It is default now, see option `strict`.",
    uniqueItems: '"uniqueItems" keyword is always validated.',
    unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
    cache: "Map is used as cache, schema object as key.",
    serialize: "Map is used as cache, schema object as key.",
    ajvErrors: "It is default now."
  };
  const deprecatedOptions = {
    ignoreKeywordsWithRef: "",
    jsPropertySyntax: "",
    unicode: '"minLength"/"maxLength" account for unicode characters by default.'
  };
  const MAX_EXPRESSION = 200;
  function requiredOptions(o2) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
    const s2 = o2.strict;
    const _optz = (_a = o2.code) === null || _a === void 0 ? void 0 : _a.optimize;
    const optimize = _optz === true || _optz === void 0 ? 1 : _optz || 0;
    const regExp = (_c = (_b = o2.code) === null || _b === void 0 ? void 0 : _b.regExp) !== null && _c !== void 0 ? _c : defaultRegExp;
    const uriResolver = (_d = o2.uriResolver) !== null && _d !== void 0 ? _d : uri_1.default;
    return {
      strictSchema: (_f = (_e = o2.strictSchema) !== null && _e !== void 0 ? _e : s2) !== null && _f !== void 0 ? _f : true,
      strictNumbers: (_h = (_g = o2.strictNumbers) !== null && _g !== void 0 ? _g : s2) !== null && _h !== void 0 ? _h : true,
      strictTypes: (_k = (_j = o2.strictTypes) !== null && _j !== void 0 ? _j : s2) !== null && _k !== void 0 ? _k : "log",
      strictTuples: (_m = (_l = o2.strictTuples) !== null && _l !== void 0 ? _l : s2) !== null && _m !== void 0 ? _m : "log",
      strictRequired: (_p = (_o = o2.strictRequired) !== null && _o !== void 0 ? _o : s2) !== null && _p !== void 0 ? _p : false,
      code: o2.code ? { ...o2.code, optimize, regExp } : { optimize, regExp },
      loopRequired: (_q = o2.loopRequired) !== null && _q !== void 0 ? _q : MAX_EXPRESSION,
      loopEnum: (_r = o2.loopEnum) !== null && _r !== void 0 ? _r : MAX_EXPRESSION,
      meta: (_s = o2.meta) !== null && _s !== void 0 ? _s : true,
      messages: (_t = o2.messages) !== null && _t !== void 0 ? _t : true,
      inlineRefs: (_u = o2.inlineRefs) !== null && _u !== void 0 ? _u : true,
      schemaId: (_v = o2.schemaId) !== null && _v !== void 0 ? _v : "$id",
      addUsedSchema: (_w = o2.addUsedSchema) !== null && _w !== void 0 ? _w : true,
      validateSchema: (_x = o2.validateSchema) !== null && _x !== void 0 ? _x : true,
      validateFormats: (_y = o2.validateFormats) !== null && _y !== void 0 ? _y : true,
      unicodeRegExp: (_z = o2.unicodeRegExp) !== null && _z !== void 0 ? _z : true,
      int32range: (_0 = o2.int32range) !== null && _0 !== void 0 ? _0 : true,
      uriResolver
    };
  }
  class Ajv2 {
    constructor(opts = {}) {
      this.schemas = {};
      this.refs = {};
      this.formats = {};
      this._compilations = /* @__PURE__ */ new Set();
      this._loading = {};
      this._cache = /* @__PURE__ */ new Map();
      opts = this.opts = { ...opts, ...requiredOptions(opts) };
      const { es5, lines } = this.opts.code;
      this.scope = new codegen_2.ValueScope({ scope: {}, prefixes: EXT_SCOPE_NAMES, es5, lines });
      this.logger = getLogger(opts.logger);
      const formatOpt = opts.validateFormats;
      opts.validateFormats = false;
      this.RULES = (0, rules_12.getRules)();
      checkOptions.call(this, removedOptions, opts, "NOT SUPPORTED");
      checkOptions.call(this, deprecatedOptions, opts, "DEPRECATED", "warn");
      this._metaOpts = getMetaSchemaOptions.call(this);
      if (opts.formats)
        addInitialFormats.call(this);
      this._addVocabularies();
      this._addDefaultMetaSchema();
      if (opts.keywords)
        addInitialKeywords.call(this, opts.keywords);
      if (typeof opts.meta == "object")
        this.addMetaSchema(opts.meta);
      addInitialSchemas.call(this);
      opts.validateFormats = formatOpt;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data, meta, schemaId } = this.opts;
      let _dataRefSchema = $dataRefSchema;
      if (schemaId === "id") {
        _dataRefSchema = { ...$dataRefSchema };
        _dataRefSchema.id = _dataRefSchema.$id;
        delete _dataRefSchema.$id;
      }
      if (meta && $data)
        this.addMetaSchema(_dataRefSchema, _dataRefSchema[schemaId], false);
    }
    defaultMeta() {
      const { meta, schemaId } = this.opts;
      return this.opts.defaultMeta = typeof meta == "object" ? meta[schemaId] || meta : void 0;
    }
    validate(schemaKeyRef, data) {
      let v;
      if (typeof schemaKeyRef == "string") {
        v = this.getSchema(schemaKeyRef);
        if (!v)
          throw new Error(`no schema with key or ref "${schemaKeyRef}"`);
      } else {
        v = this.compile(schemaKeyRef);
      }
      const valid = v(data);
      if (!("$async" in v))
        this.errors = v.errors;
      return valid;
    }
    compile(schema, _meta) {
      const sch = this._addSchema(schema, _meta);
      return sch.validate || this._compileSchemaEnv(sch);
    }
    compileAsync(schema, meta) {
      if (typeof this.opts.loadSchema != "function") {
        throw new Error("options.loadSchema should be a function");
      }
      const { loadSchema } = this.opts;
      return runCompileAsync.call(this, schema, meta);
      async function runCompileAsync(_schema, _meta) {
        await loadMetaSchema.call(this, _schema.$schema);
        const sch = this._addSchema(_schema, _meta);
        return sch.validate || _compileAsync.call(this, sch);
      }
      async function loadMetaSchema($ref) {
        if ($ref && !this.getSchema($ref)) {
          await runCompileAsync.call(this, { $ref }, true);
        }
      }
      async function _compileAsync(sch) {
        try {
          return this._compileSchemaEnv(sch);
        } catch (e) {
          if (!(e instanceof ref_error_12.default))
            throw e;
          checkLoaded.call(this, e);
          await loadMissingSchema.call(this, e.missingSchema);
          return _compileAsync.call(this, sch);
        }
      }
      function checkLoaded({ missingSchema: ref2, missingRef }) {
        if (this.refs[ref2]) {
          throw new Error(`AnySchema ${ref2} is loaded but ${missingRef} cannot be resolved`);
        }
      }
      async function loadMissingSchema(ref2) {
        const _schema = await _loadSchema.call(this, ref2);
        if (!this.refs[ref2])
          await loadMetaSchema.call(this, _schema.$schema);
        if (!this.refs[ref2])
          this.addSchema(_schema, ref2, meta);
      }
      async function _loadSchema(ref2) {
        const p = this._loading[ref2];
        if (p)
          return p;
        try {
          return await (this._loading[ref2] = loadSchema(ref2));
        } finally {
          delete this._loading[ref2];
        }
      }
    }
    // Adds schema to the instance
    addSchema(schema, key, _meta, _validateSchema = this.opts.validateSchema) {
      if (Array.isArray(schema)) {
        for (const sch of schema)
          this.addSchema(sch, void 0, _meta, _validateSchema);
        return this;
      }
      let id2;
      if (typeof schema === "object") {
        const { schemaId } = this.opts;
        id2 = schema[schemaId];
        if (id2 !== void 0 && typeof id2 != "string") {
          throw new Error(`schema ${schemaId} must be string`);
        }
      }
      key = (0, resolve_12.normalizeId)(key || id2);
      this._checkUnique(key);
      this.schemas[key] = this._addSchema(schema, _meta, key, _validateSchema, true);
      return this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(schema, key, _validateSchema = this.opts.validateSchema) {
      this.addSchema(schema, key, true, _validateSchema);
      return this;
    }
    //  Validate schema against its meta-schema
    validateSchema(schema, throwOrLogError) {
      if (typeof schema == "boolean")
        return true;
      let $schema2;
      $schema2 = schema.$schema;
      if ($schema2 !== void 0 && typeof $schema2 != "string") {
        throw new Error("$schema must be a string");
      }
      $schema2 = $schema2 || this.opts.defaultMeta || this.defaultMeta();
      if (!$schema2) {
        this.logger.warn("meta-schema not available");
        this.errors = null;
        return true;
      }
      const valid = this.validate($schema2, schema);
      if (!valid && throwOrLogError) {
        const message = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error(message);
        else
          throw new Error(message);
      }
      return valid;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema(keyRef) {
      let sch;
      while (typeof (sch = getSchEnv.call(this, keyRef)) == "string")
        keyRef = sch;
      if (sch === void 0) {
        const { schemaId } = this.opts;
        const root = new compile_12.SchemaEnv({ schema: {}, schemaId });
        sch = compile_12.resolveSchema.call(this, root, keyRef);
        if (!sch)
          return;
        this.refs[keyRef] = sch;
      }
      return sch.validate || this._compileSchemaEnv(sch);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(schemaKeyRef) {
      if (schemaKeyRef instanceof RegExp) {
        this._removeAllSchemas(this.schemas, schemaKeyRef);
        this._removeAllSchemas(this.refs, schemaKeyRef);
        return this;
      }
      switch (typeof schemaKeyRef) {
        case "undefined":
          this._removeAllSchemas(this.schemas);
          this._removeAllSchemas(this.refs);
          this._cache.clear();
          return this;
        case "string": {
          const sch = getSchEnv.call(this, schemaKeyRef);
          if (typeof sch == "object")
            this._cache.delete(sch.schema);
          delete this.schemas[schemaKeyRef];
          delete this.refs[schemaKeyRef];
          return this;
        }
        case "object": {
          const cacheKey = schemaKeyRef;
          this._cache.delete(cacheKey);
          let id2 = schemaKeyRef[this.opts.schemaId];
          if (id2) {
            id2 = (0, resolve_12.normalizeId)(id2);
            delete this.schemas[id2];
            delete this.refs[id2];
          }
          return this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(definitions) {
      for (const def2 of definitions)
        this.addKeyword(def2);
      return this;
    }
    addKeyword(kwdOrDef, def2) {
      let keyword2;
      if (typeof kwdOrDef == "string") {
        keyword2 = kwdOrDef;
        if (typeof def2 == "object") {
          this.logger.warn("these parameters are deprecated, see docs for addKeyword");
          def2.keyword = keyword2;
        }
      } else if (typeof kwdOrDef == "object" && def2 === void 0) {
        def2 = kwdOrDef;
        keyword2 = def2.keyword;
        if (Array.isArray(keyword2) && !keyword2.length) {
          throw new Error("addKeywords: keyword must be string or non-empty array");
        }
      } else {
        throw new Error("invalid addKeywords parameters");
      }
      checkKeyword.call(this, keyword2, def2);
      if (!def2) {
        (0, util_12.eachItem)(keyword2, (kwd) => addRule.call(this, kwd));
        return this;
      }
      keywordMetaschema.call(this, def2);
      const definition = {
        ...def2,
        type: (0, dataType_12.getJSONTypes)(def2.type),
        schemaType: (0, dataType_12.getJSONTypes)(def2.schemaType)
      };
      (0, util_12.eachItem)(keyword2, definition.type.length === 0 ? (k) => addRule.call(this, k, definition) : (k) => definition.type.forEach((t2) => addRule.call(this, k, definition, t2)));
      return this;
    }
    getKeyword(keyword2) {
      const rule = this.RULES.all[keyword2];
      return typeof rule == "object" ? rule.definition : !!rule;
    }
    // Remove keyword
    removeKeyword(keyword2) {
      const { RULES } = this;
      delete RULES.keywords[keyword2];
      delete RULES.all[keyword2];
      for (const group of RULES.rules) {
        const i2 = group.rules.findIndex((rule) => rule.keyword === keyword2);
        if (i2 >= 0)
          group.rules.splice(i2, 1);
      }
      return this;
    }
    // Add format
    addFormat(name, format2) {
      if (typeof format2 == "string")
        format2 = new RegExp(format2);
      this.formats[name] = format2;
      return this;
    }
    errorsText(errors2 = this.errors, { separator = ", ", dataVar = "data" } = {}) {
      if (!errors2 || errors2.length === 0)
        return "No errors";
      return errors2.map((e) => `${dataVar}${e.instancePath} ${e.message}`).reduce((text, msg) => text + separator + msg);
    }
    $dataMetaSchema(metaSchema2, keywordsJsonPointers) {
      const rules2 = this.RULES.all;
      metaSchema2 = JSON.parse(JSON.stringify(metaSchema2));
      for (const jsonPointer of keywordsJsonPointers) {
        const segments = jsonPointer.split("/").slice(1);
        let keywords = metaSchema2;
        for (const seg of segments)
          keywords = keywords[seg];
        for (const key in rules2) {
          const rule = rules2[key];
          if (typeof rule != "object")
            continue;
          const { $data } = rule.definition;
          const schema = keywords[key];
          if ($data && schema)
            keywords[key] = schemaOrData(schema);
        }
      }
      return metaSchema2;
    }
    _removeAllSchemas(schemas, regex) {
      for (const keyRef in schemas) {
        const sch = schemas[keyRef];
        if (!regex || regex.test(keyRef)) {
          if (typeof sch == "string") {
            delete schemas[keyRef];
          } else if (sch && !sch.meta) {
            this._cache.delete(sch.schema);
            delete schemas[keyRef];
          }
        }
      }
    }
    _addSchema(schema, meta, baseId, validateSchema = this.opts.validateSchema, addSchema = this.opts.addUsedSchema) {
      let id2;
      const { schemaId } = this.opts;
      if (typeof schema == "object") {
        id2 = schema[schemaId];
      } else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        else if (typeof schema != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let sch = this._cache.get(schema);
      if (sch !== void 0)
        return sch;
      baseId = (0, resolve_12.normalizeId)(id2 || baseId);
      const localRefs = resolve_12.getSchemaRefs.call(this, schema, baseId);
      sch = new compile_12.SchemaEnv({ schema, schemaId, meta, baseId, localRefs });
      this._cache.set(sch.schema, sch);
      if (addSchema && !baseId.startsWith("#")) {
        if (baseId)
          this._checkUnique(baseId);
        this.refs[baseId] = sch;
      }
      if (validateSchema)
        this.validateSchema(schema, true);
      return sch;
    }
    _checkUnique(id2) {
      if (this.schemas[id2] || this.refs[id2]) {
        throw new Error(`schema with key or id "${id2}" already exists`);
      }
    }
    _compileSchemaEnv(sch) {
      if (sch.meta)
        this._compileMetaSchema(sch);
      else
        compile_12.compileSchema.call(this, sch);
      if (!sch.validate)
        throw new Error("ajv implementation error");
      return sch.validate;
    }
    _compileMetaSchema(sch) {
      const currentOpts = this.opts;
      this.opts = this._metaOpts;
      try {
        compile_12.compileSchema.call(this, sch);
      } finally {
        this.opts = currentOpts;
      }
    }
  }
  Ajv2.ValidationError = validation_error_12.default;
  Ajv2.MissingRefError = ref_error_12.default;
  exports.default = Ajv2;
  function checkOptions(checkOpts, options, msg, log = "error") {
    for (const key in checkOpts) {
      const opt = key;
      if (opt in options)
        this.logger[log](`${msg}: option ${key}. ${checkOpts[opt]}`);
    }
  }
  function getSchEnv(keyRef) {
    keyRef = (0, resolve_12.normalizeId)(keyRef);
    return this.schemas[keyRef] || this.refs[keyRef];
  }
  function addInitialSchemas() {
    const optsSchemas = this.opts.schemas;
    if (!optsSchemas)
      return;
    if (Array.isArray(optsSchemas))
      this.addSchema(optsSchemas);
    else
      for (const key in optsSchemas)
        this.addSchema(optsSchemas[key], key);
  }
  function addInitialFormats() {
    for (const name in this.opts.formats) {
      const format2 = this.opts.formats[name];
      if (format2)
        this.addFormat(name, format2);
    }
  }
  function addInitialKeywords(defs) {
    if (Array.isArray(defs)) {
      this.addVocabulary(defs);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const keyword2 in defs) {
      const def2 = defs[keyword2];
      if (!def2.keyword)
        def2.keyword = keyword2;
      this.addKeyword(def2);
    }
  }
  function getMetaSchemaOptions() {
    const metaOpts = { ...this.opts };
    for (const opt of META_IGNORE_OPTIONS)
      delete metaOpts[opt];
    return metaOpts;
  }
  const noLogs = { log() {
  }, warn() {
  }, error() {
  } };
  function getLogger(logger) {
    if (logger === false)
      return noLogs;
    if (logger === void 0)
      return console;
    if (logger.log && logger.warn && logger.error)
      return logger;
    throw new Error("logger must implement log, warn and error methods");
  }
  const KEYWORD_NAME = /^[a-z_$][a-z0-9_$:-]*$/i;
  function checkKeyword(keyword2, def2) {
    const { RULES } = this;
    (0, util_12.eachItem)(keyword2, (kwd) => {
      if (RULES.keywords[kwd])
        throw new Error(`Keyword ${kwd} is already defined`);
      if (!KEYWORD_NAME.test(kwd))
        throw new Error(`Keyword ${kwd} has invalid name`);
    });
    if (!def2)
      return;
    if (def2.$data && !("code" in def2 || "validate" in def2)) {
      throw new Error('$data keyword must have "code" or "validate" function');
    }
  }
  function addRule(keyword2, definition, dataType2) {
    var _a;
    const post = definition === null || definition === void 0 ? void 0 : definition.post;
    if (dataType2 && post)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES } = this;
    let ruleGroup = post ? RULES.post : RULES.rules.find(({ type: t2 }) => t2 === dataType2);
    if (!ruleGroup) {
      ruleGroup = { type: dataType2, rules: [] };
      RULES.rules.push(ruleGroup);
    }
    RULES.keywords[keyword2] = true;
    if (!definition)
      return;
    const rule = {
      keyword: keyword2,
      definition: {
        ...definition,
        type: (0, dataType_12.getJSONTypes)(definition.type),
        schemaType: (0, dataType_12.getJSONTypes)(definition.schemaType)
      }
    };
    if (definition.before)
      addBeforeRule.call(this, ruleGroup, rule, definition.before);
    else
      ruleGroup.rules.push(rule);
    RULES.all[keyword2] = rule;
    (_a = definition.implements) === null || _a === void 0 ? void 0 : _a.forEach((kwd) => this.addKeyword(kwd));
  }
  function addBeforeRule(ruleGroup, rule, before) {
    const i2 = ruleGroup.rules.findIndex((_rule) => _rule.keyword === before);
    if (i2 >= 0) {
      ruleGroup.rules.splice(i2, 0, rule);
    } else {
      ruleGroup.rules.push(rule);
      this.logger.warn(`rule ${before} is not defined`);
    }
  }
  function keywordMetaschema(def2) {
    let { metaSchema: metaSchema2 } = def2;
    if (metaSchema2 === void 0)
      return;
    if (def2.$data && this.opts.$data)
      metaSchema2 = schemaOrData(metaSchema2);
    def2.validateSchema = this.compile(metaSchema2, true);
  }
  const $dataRef = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function schemaOrData(schema) {
    return { anyOf: [schema, $dataRef] };
  }
})(core$3);
var draft2020 = {};
var core$2 = {};
var id = {};
Object.defineProperty(id, "__esModule", { value: true });
const def$B = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
id.default = def$B;
var ref = {};
Object.defineProperty(ref, "__esModule", { value: true });
ref.callRef = ref.getValidate = void 0;
const ref_error_1$1 = ref_error;
const code_1$8 = code;
const codegen_1$p = codegen;
const names_1$4 = names$1;
const compile_1$2 = compile;
const util_1$n = util;
const def$A = {
  keyword: "$ref",
  schemaType: "string",
  code(cxt) {
    const { gen, schema: $ref, it } = cxt;
    const { baseId, schemaEnv: env, validateName, opts, self: self2 } = it;
    const { root } = env;
    if (($ref === "#" || $ref === "#/") && baseId === root.baseId)
      return callRootRef();
    const schOrEnv = compile_1$2.resolveRef.call(self2, root, baseId, $ref);
    if (schOrEnv === void 0)
      throw new ref_error_1$1.default(it.opts.uriResolver, baseId, $ref);
    if (schOrEnv instanceof compile_1$2.SchemaEnv)
      return callValidate(schOrEnv);
    return inlineRefSchema(schOrEnv);
    function callRootRef() {
      if (env === root)
        return callRef(cxt, validateName, env, env.$async);
      const rootName = gen.scopeValue("root", { ref: root });
      return callRef(cxt, (0, codegen_1$p._)`${rootName}.validate`, root, root.$async);
    }
    function callValidate(sch) {
      const v = getValidate(cxt, sch);
      callRef(cxt, v, sch, sch.$async);
    }
    function inlineRefSchema(sch) {
      const schName = gen.scopeValue("schema", opts.code.source === true ? { ref: sch, code: (0, codegen_1$p.stringify)(sch) } : { ref: sch });
      const valid = gen.name("valid");
      const schCxt = cxt.subschema({
        schema: sch,
        dataTypes: [],
        schemaPath: codegen_1$p.nil,
        topSchemaRef: schName,
        errSchemaPath: $ref
      }, valid);
      cxt.mergeEvaluated(schCxt);
      cxt.ok(valid);
    }
  }
};
function getValidate(cxt, sch) {
  const { gen } = cxt;
  return sch.validate ? gen.scopeValue("validate", { ref: sch.validate }) : (0, codegen_1$p._)`${gen.scopeValue("wrapper", { ref: sch })}.validate`;
}
ref.getValidate = getValidate;
function callRef(cxt, v, sch, $async) {
  const { gen, it } = cxt;
  const { allErrors, schemaEnv: env, opts } = it;
  const passCxt = opts.passContext ? names_1$4.default.this : codegen_1$p.nil;
  if ($async)
    callAsyncRef();
  else
    callSyncRef();
  function callAsyncRef() {
    if (!env.$async)
      throw new Error("async schema referenced by sync schema");
    const valid = gen.let("valid");
    gen.try(() => {
      gen.code((0, codegen_1$p._)`await ${(0, code_1$8.callValidateCode)(cxt, v, passCxt)}`);
      addEvaluatedFrom(v);
      if (!allErrors)
        gen.assign(valid, true);
    }, (e) => {
      gen.if((0, codegen_1$p._)`!(${e} instanceof ${it.ValidationError})`, () => gen.throw(e));
      addErrorsFrom(e);
      if (!allErrors)
        gen.assign(valid, false);
    });
    cxt.ok(valid);
  }
  function callSyncRef() {
    cxt.result((0, code_1$8.callValidateCode)(cxt, v, passCxt), () => addEvaluatedFrom(v), () => addErrorsFrom(v));
  }
  function addErrorsFrom(source) {
    const errs = (0, codegen_1$p._)`${source}.errors`;
    gen.assign(names_1$4.default.vErrors, (0, codegen_1$p._)`${names_1$4.default.vErrors} === null ? ${errs} : ${names_1$4.default.vErrors}.concat(${errs})`);
    gen.assign(names_1$4.default.errors, (0, codegen_1$p._)`${names_1$4.default.vErrors}.length`);
  }
  function addEvaluatedFrom(source) {
    var _a;
    if (!it.opts.unevaluated)
      return;
    const schEvaluated = (_a = sch === null || sch === void 0 ? void 0 : sch.validate) === null || _a === void 0 ? void 0 : _a.evaluated;
    if (it.props !== true) {
      if (schEvaluated && !schEvaluated.dynamicProps) {
        if (schEvaluated.props !== void 0) {
          it.props = util_1$n.mergeEvaluated.props(gen, schEvaluated.props, it.props);
        }
      } else {
        const props = gen.var("props", (0, codegen_1$p._)`${source}.evaluated.props`);
        it.props = util_1$n.mergeEvaluated.props(gen, props, it.props, codegen_1$p.Name);
      }
    }
    if (it.items !== true) {
      if (schEvaluated && !schEvaluated.dynamicItems) {
        if (schEvaluated.items !== void 0) {
          it.items = util_1$n.mergeEvaluated.items(gen, schEvaluated.items, it.items);
        }
      } else {
        const items2 = gen.var("items", (0, codegen_1$p._)`${source}.evaluated.items`);
        it.items = util_1$n.mergeEvaluated.items(gen, items2, it.items, codegen_1$p.Name);
      }
    }
  }
}
ref.callRef = callRef;
ref.default = def$A;
Object.defineProperty(core$2, "__esModule", { value: true });
const id_1 = id;
const ref_1$2 = ref;
const core$1 = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  id_1.default,
  ref_1$2.default
];
core$2.default = core$1;
var validation$2 = {};
var limitNumber = {};
Object.defineProperty(limitNumber, "__esModule", { value: true });
const codegen_1$o = codegen;
const ops = codegen_1$o.operators;
const KWDs = {
  maximum: { okStr: "<=", ok: ops.LTE, fail: ops.GT },
  minimum: { okStr: ">=", ok: ops.GTE, fail: ops.LT },
  exclusiveMaximum: { okStr: "<", ok: ops.LT, fail: ops.GTE },
  exclusiveMinimum: { okStr: ">", ok: ops.GT, fail: ops.LTE }
};
const error$k = {
  message: ({ keyword: keyword2, schemaCode }) => (0, codegen_1$o.str)`must be ${KWDs[keyword2].okStr} ${schemaCode}`,
  params: ({ keyword: keyword2, schemaCode }) => (0, codegen_1$o._)`{comparison: ${KWDs[keyword2].okStr}, limit: ${schemaCode}}`
};
const def$z = {
  keyword: Object.keys(KWDs),
  type: "number",
  schemaType: "number",
  $data: true,
  error: error$k,
  code(cxt) {
    const { keyword: keyword2, data, schemaCode } = cxt;
    cxt.fail$data((0, codegen_1$o._)`${data} ${KWDs[keyword2].fail} ${schemaCode} || isNaN(${data})`);
  }
};
limitNumber.default = def$z;
var multipleOf = {};
Object.defineProperty(multipleOf, "__esModule", { value: true });
const codegen_1$n = codegen;
const error$j = {
  message: ({ schemaCode }) => (0, codegen_1$n.str)`must be multiple of ${schemaCode}`,
  params: ({ schemaCode }) => (0, codegen_1$n._)`{multipleOf: ${schemaCode}}`
};
const def$y = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: true,
  error: error$j,
  code(cxt) {
    const { gen, data, schemaCode, it } = cxt;
    const prec = it.opts.multipleOfPrecision;
    const res = gen.let("res");
    const invalid = prec ? (0, codegen_1$n._)`Math.abs(Math.round(${res}) - ${res}) > 1e-${prec}` : (0, codegen_1$n._)`${res} !== parseInt(${res})`;
    cxt.fail$data((0, codegen_1$n._)`(${schemaCode} === 0 || (${res} = ${data}/${schemaCode}, ${invalid}))`);
  }
};
multipleOf.default = def$y;
var limitLength = {};
var ucs2length$1 = {};
Object.defineProperty(ucs2length$1, "__esModule", { value: true });
function ucs2length(str) {
  const len = str.length;
  let length = 0;
  let pos = 0;
  let value;
  while (pos < len) {
    length++;
    value = str.charCodeAt(pos++);
    if (value >= 55296 && value <= 56319 && pos < len) {
      value = str.charCodeAt(pos);
      if ((value & 64512) === 56320)
        pos++;
    }
  }
  return length;
}
ucs2length$1.default = ucs2length;
ucs2length.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(limitLength, "__esModule", { value: true });
const codegen_1$m = codegen;
const util_1$m = util;
const ucs2length_1 = ucs2length$1;
const error$i = {
  message({ keyword: keyword2, schemaCode }) {
    const comp = keyword2 === "maxLength" ? "more" : "fewer";
    return (0, codegen_1$m.str)`must NOT have ${comp} than ${schemaCode} characters`;
  },
  params: ({ schemaCode }) => (0, codegen_1$m._)`{limit: ${schemaCode}}`
};
const def$x = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: true,
  error: error$i,
  code(cxt) {
    const { keyword: keyword2, data, schemaCode, it } = cxt;
    const op = keyword2 === "maxLength" ? codegen_1$m.operators.GT : codegen_1$m.operators.LT;
    const len = it.opts.unicode === false ? (0, codegen_1$m._)`${data}.length` : (0, codegen_1$m._)`${(0, util_1$m.useFunc)(cxt.gen, ucs2length_1.default)}(${data})`;
    cxt.fail$data((0, codegen_1$m._)`${len} ${op} ${schemaCode}`);
  }
};
limitLength.default = def$x;
var pattern = {};
Object.defineProperty(pattern, "__esModule", { value: true });
const code_1$7 = code;
const codegen_1$l = codegen;
const error$h = {
  message: ({ schemaCode }) => (0, codegen_1$l.str)`must match pattern "${schemaCode}"`,
  params: ({ schemaCode }) => (0, codegen_1$l._)`{pattern: ${schemaCode}}`
};
const def$w = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: true,
  error: error$h,
  code(cxt) {
    const { data, $data, schema, schemaCode, it } = cxt;
    const u = it.opts.unicodeRegExp ? "u" : "";
    const regExp = $data ? (0, codegen_1$l._)`(new RegExp(${schemaCode}, ${u}))` : (0, code_1$7.usePattern)(cxt, schema);
    cxt.fail$data((0, codegen_1$l._)`!${regExp}.test(${data})`);
  }
};
pattern.default = def$w;
var limitProperties = {};
Object.defineProperty(limitProperties, "__esModule", { value: true });
const codegen_1$k = codegen;
const error$g = {
  message({ keyword: keyword2, schemaCode }) {
    const comp = keyword2 === "maxProperties" ? "more" : "fewer";
    return (0, codegen_1$k.str)`must NOT have ${comp} than ${schemaCode} properties`;
  },
  params: ({ schemaCode }) => (0, codegen_1$k._)`{limit: ${schemaCode}}`
};
const def$v = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: true,
  error: error$g,
  code(cxt) {
    const { keyword: keyword2, data, schemaCode } = cxt;
    const op = keyword2 === "maxProperties" ? codegen_1$k.operators.GT : codegen_1$k.operators.LT;
    cxt.fail$data((0, codegen_1$k._)`Object.keys(${data}).length ${op} ${schemaCode}`);
  }
};
limitProperties.default = def$v;
var required = {};
Object.defineProperty(required, "__esModule", { value: true });
const code_1$6 = code;
const codegen_1$j = codegen;
const util_1$l = util;
const error$f = {
  message: ({ params: { missingProperty } }) => (0, codegen_1$j.str)`must have required property '${missingProperty}'`,
  params: ({ params: { missingProperty } }) => (0, codegen_1$j._)`{missingProperty: ${missingProperty}}`
};
const def$u = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: true,
  error: error$f,
  code(cxt) {
    const { gen, schema, schemaCode, data, $data, it } = cxt;
    const { opts } = it;
    if (!$data && schema.length === 0)
      return;
    const useLoop = schema.length >= opts.loopRequired;
    if (it.allErrors)
      allErrorsMode();
    else
      exitOnErrorMode();
    if (opts.strictRequired) {
      const props = cxt.parentSchema.properties;
      const { definedProperties } = cxt.it;
      for (const requiredKey of schema) {
        if ((props === null || props === void 0 ? void 0 : props[requiredKey]) === void 0 && !definedProperties.has(requiredKey)) {
          const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
          const msg = `required property "${requiredKey}" is not defined at "${schemaPath}" (strictRequired)`;
          (0, util_1$l.checkStrictMode)(it, msg, it.opts.strictRequired);
        }
      }
    }
    function allErrorsMode() {
      if (useLoop || $data) {
        cxt.block$data(codegen_1$j.nil, loopAllRequired);
      } else {
        for (const prop of schema) {
          (0, code_1$6.checkReportMissingProp)(cxt, prop);
        }
      }
    }
    function exitOnErrorMode() {
      const missing = gen.let("missing");
      if (useLoop || $data) {
        const valid = gen.let("valid", true);
        cxt.block$data(valid, () => loopUntilMissing(missing, valid));
        cxt.ok(valid);
      } else {
        gen.if((0, code_1$6.checkMissingProp)(cxt, schema, missing));
        (0, code_1$6.reportMissingProp)(cxt, missing);
        gen.else();
      }
    }
    function loopAllRequired() {
      gen.forOf("prop", schemaCode, (prop) => {
        cxt.setParams({ missingProperty: prop });
        gen.if((0, code_1$6.noPropertyInData)(gen, data, prop, opts.ownProperties), () => cxt.error());
      });
    }
    function loopUntilMissing(missing, valid) {
      cxt.setParams({ missingProperty: missing });
      gen.forOf(missing, schemaCode, () => {
        gen.assign(valid, (0, code_1$6.propertyInData)(gen, data, missing, opts.ownProperties));
        gen.if((0, codegen_1$j.not)(valid), () => {
          cxt.error();
          gen.break();
        });
      }, codegen_1$j.nil);
    }
  }
};
required.default = def$u;
var limitItems = {};
Object.defineProperty(limitItems, "__esModule", { value: true });
const codegen_1$i = codegen;
const error$e = {
  message({ keyword: keyword2, schemaCode }) {
    const comp = keyword2 === "maxItems" ? "more" : "fewer";
    return (0, codegen_1$i.str)`must NOT have ${comp} than ${schemaCode} items`;
  },
  params: ({ schemaCode }) => (0, codegen_1$i._)`{limit: ${schemaCode}}`
};
const def$t = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: true,
  error: error$e,
  code(cxt) {
    const { keyword: keyword2, data, schemaCode } = cxt;
    const op = keyword2 === "maxItems" ? codegen_1$i.operators.GT : codegen_1$i.operators.LT;
    cxt.fail$data((0, codegen_1$i._)`${data}.length ${op} ${schemaCode}`);
  }
};
limitItems.default = def$t;
var uniqueItems = {};
var equal$1 = {};
Object.defineProperty(equal$1, "__esModule", { value: true });
const equal2 = fastDeepEqual;
equal2.code = 'require("ajv/dist/runtime/equal").default';
equal$1.default = equal2;
Object.defineProperty(uniqueItems, "__esModule", { value: true });
const dataType_1 = dataType;
const codegen_1$h = codegen;
const util_1$k = util;
const equal_1$2 = equal$1;
const error$d = {
  message: ({ params: { i: i2, j } }) => (0, codegen_1$h.str)`must NOT have duplicate items (items ## ${j} and ${i2} are identical)`,
  params: ({ params: { i: i2, j } }) => (0, codegen_1$h._)`{i: ${i2}, j: ${j}}`
};
const def$s = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: true,
  error: error$d,
  code(cxt) {
    const { gen, data, $data, schema, parentSchema, schemaCode, it } = cxt;
    if (!$data && !schema)
      return;
    const valid = gen.let("valid");
    const itemTypes = parentSchema.items ? (0, dataType_1.getSchemaTypes)(parentSchema.items) : [];
    cxt.block$data(valid, validateUniqueItems, (0, codegen_1$h._)`${schemaCode} === false`);
    cxt.ok(valid);
    function validateUniqueItems() {
      const i2 = gen.let("i", (0, codegen_1$h._)`${data}.length`);
      const j = gen.let("j");
      cxt.setParams({ i: i2, j });
      gen.assign(valid, true);
      gen.if((0, codegen_1$h._)`${i2} > 1`, () => (canOptimize() ? loopN : loopN2)(i2, j));
    }
    function canOptimize() {
      return itemTypes.length > 0 && !itemTypes.some((t2) => t2 === "object" || t2 === "array");
    }
    function loopN(i2, j) {
      const item = gen.name("item");
      const wrongType = (0, dataType_1.checkDataTypes)(itemTypes, item, it.opts.strictNumbers, dataType_1.DataType.Wrong);
      const indices = gen.const("indices", (0, codegen_1$h._)`{}`);
      gen.for((0, codegen_1$h._)`;${i2}--;`, () => {
        gen.let(item, (0, codegen_1$h._)`${data}[${i2}]`);
        gen.if(wrongType, (0, codegen_1$h._)`continue`);
        if (itemTypes.length > 1)
          gen.if((0, codegen_1$h._)`typeof ${item} == "string"`, (0, codegen_1$h._)`${item} += "_"`);
        gen.if((0, codegen_1$h._)`typeof ${indices}[${item}] == "number"`, () => {
          gen.assign(j, (0, codegen_1$h._)`${indices}[${item}]`);
          cxt.error();
          gen.assign(valid, false).break();
        }).code((0, codegen_1$h._)`${indices}[${item}] = ${i2}`);
      });
    }
    function loopN2(i2, j) {
      const eql = (0, util_1$k.useFunc)(gen, equal_1$2.default);
      const outer = gen.name("outer");
      gen.label(outer).for((0, codegen_1$h._)`;${i2}--;`, () => gen.for((0, codegen_1$h._)`${j} = ${i2}; ${j}--;`, () => gen.if((0, codegen_1$h._)`${eql}(${data}[${i2}], ${data}[${j}])`, () => {
        cxt.error();
        gen.assign(valid, false).break(outer);
      })));
    }
  }
};
uniqueItems.default = def$s;
var _const = {};
Object.defineProperty(_const, "__esModule", { value: true });
const codegen_1$g = codegen;
const util_1$j = util;
const equal_1$1 = equal$1;
const error$c = {
  message: "must be equal to constant",
  params: ({ schemaCode }) => (0, codegen_1$g._)`{allowedValue: ${schemaCode}}`
};
const def$r = {
  keyword: "const",
  $data: true,
  error: error$c,
  code(cxt) {
    const { gen, data, $data, schemaCode, schema } = cxt;
    if ($data || schema && typeof schema == "object") {
      cxt.fail$data((0, codegen_1$g._)`!${(0, util_1$j.useFunc)(gen, equal_1$1.default)}(${data}, ${schemaCode})`);
    } else {
      cxt.fail((0, codegen_1$g._)`${schema} !== ${data}`);
    }
  }
};
_const.default = def$r;
var _enum = {};
Object.defineProperty(_enum, "__esModule", { value: true });
const codegen_1$f = codegen;
const util_1$i = util;
const equal_1 = equal$1;
const error$b = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode }) => (0, codegen_1$f._)`{allowedValues: ${schemaCode}}`
};
const def$q = {
  keyword: "enum",
  schemaType: "array",
  $data: true,
  error: error$b,
  code(cxt) {
    const { gen, data, $data, schema, schemaCode, it } = cxt;
    if (!$data && schema.length === 0)
      throw new Error("enum must have non-empty array");
    const useLoop = schema.length >= it.opts.loopEnum;
    let eql;
    const getEql = () => eql !== null && eql !== void 0 ? eql : eql = (0, util_1$i.useFunc)(gen, equal_1.default);
    let valid;
    if (useLoop || $data) {
      valid = gen.let("valid");
      cxt.block$data(valid, loopEnum);
    } else {
      if (!Array.isArray(schema))
        throw new Error("ajv implementation error");
      const vSchema = gen.const("vSchema", schemaCode);
      valid = (0, codegen_1$f.or)(...schema.map((_x, i2) => equalCode(vSchema, i2)));
    }
    cxt.pass(valid);
    function loopEnum() {
      gen.assign(valid, false);
      gen.forOf("v", schemaCode, (v) => gen.if((0, codegen_1$f._)`${getEql()}(${data}, ${v})`, () => gen.assign(valid, true).break()));
    }
    function equalCode(vSchema, i2) {
      const sch = schema[i2];
      return typeof sch === "object" && sch !== null ? (0, codegen_1$f._)`${getEql()}(${data}, ${vSchema}[${i2}])` : (0, codegen_1$f._)`${data} === ${sch}`;
    }
  }
};
_enum.default = def$q;
Object.defineProperty(validation$2, "__esModule", { value: true });
const limitNumber_1 = limitNumber;
const multipleOf_1 = multipleOf;
const limitLength_1 = limitLength;
const pattern_1 = pattern;
const limitProperties_1 = limitProperties;
const required_1 = required;
const limitItems_1 = limitItems;
const uniqueItems_1 = uniqueItems;
const const_1 = _const;
const enum_1 = _enum;
const validation$1 = [
  // number
  limitNumber_1.default,
  multipleOf_1.default,
  // string
  limitLength_1.default,
  pattern_1.default,
  // object
  limitProperties_1.default,
  required_1.default,
  // array
  limitItems_1.default,
  uniqueItems_1.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  const_1.default,
  enum_1.default
];
validation$2.default = validation$1;
var applicator$1 = {};
var additionalItems = {};
Object.defineProperty(additionalItems, "__esModule", { value: true });
additionalItems.validateAdditionalItems = void 0;
const codegen_1$e = codegen;
const util_1$h = util;
const error$a = {
  message: ({ params: { len } }) => (0, codegen_1$e.str)`must NOT have more than ${len} items`,
  params: ({ params: { len } }) => (0, codegen_1$e._)`{limit: ${len}}`
};
const def$p = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: error$a,
  code(cxt) {
    const { parentSchema, it } = cxt;
    const { items: items2 } = parentSchema;
    if (!Array.isArray(items2)) {
      (0, util_1$h.checkStrictMode)(it, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    validateAdditionalItems(cxt, items2);
  }
};
function validateAdditionalItems(cxt, items2) {
  const { gen, schema, data, keyword: keyword2, it } = cxt;
  it.items = true;
  const len = gen.const("len", (0, codegen_1$e._)`${data}.length`);
  if (schema === false) {
    cxt.setParams({ len: items2.length });
    cxt.pass((0, codegen_1$e._)`${len} <= ${items2.length}`);
  } else if (typeof schema == "object" && !(0, util_1$h.alwaysValidSchema)(it, schema)) {
    const valid = gen.var("valid", (0, codegen_1$e._)`${len} <= ${items2.length}`);
    gen.if((0, codegen_1$e.not)(valid), () => validateItems(valid));
    cxt.ok(valid);
  }
  function validateItems(valid) {
    gen.forRange("i", items2.length, len, (i2) => {
      cxt.subschema({ keyword: keyword2, dataProp: i2, dataPropType: util_1$h.Type.Num }, valid);
      if (!it.allErrors)
        gen.if((0, codegen_1$e.not)(valid), () => gen.break());
    });
  }
}
additionalItems.validateAdditionalItems = validateAdditionalItems;
additionalItems.default = def$p;
var prefixItems = {};
var items = {};
Object.defineProperty(items, "__esModule", { value: true });
items.validateTuple = void 0;
const codegen_1$d = codegen;
const util_1$g = util;
const code_1$5 = code;
const def$o = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(cxt) {
    const { schema, it } = cxt;
    if (Array.isArray(schema))
      return validateTuple(cxt, "additionalItems", schema);
    it.items = true;
    if ((0, util_1$g.alwaysValidSchema)(it, schema))
      return;
    cxt.ok((0, code_1$5.validateArray)(cxt));
  }
};
function validateTuple(cxt, extraItems, schArr = cxt.schema) {
  const { gen, parentSchema, data, keyword: keyword2, it } = cxt;
  checkStrictTuple(parentSchema);
  if (it.opts.unevaluated && schArr.length && it.items !== true) {
    it.items = util_1$g.mergeEvaluated.items(gen, schArr.length, it.items);
  }
  const valid = gen.name("valid");
  const len = gen.const("len", (0, codegen_1$d._)`${data}.length`);
  schArr.forEach((sch, i2) => {
    if ((0, util_1$g.alwaysValidSchema)(it, sch))
      return;
    gen.if((0, codegen_1$d._)`${len} > ${i2}`, () => cxt.subschema({
      keyword: keyword2,
      schemaProp: i2,
      dataProp: i2
    }, valid));
    cxt.ok(valid);
  });
  function checkStrictTuple(sch) {
    const { opts, errSchemaPath } = it;
    const l = schArr.length;
    const fullTuple = l === sch.minItems && (l === sch.maxItems || sch[extraItems] === false);
    if (opts.strictTuples && !fullTuple) {
      const msg = `"${keyword2}" is ${l}-tuple, but minItems or maxItems/${extraItems} are not specified or different at path "${errSchemaPath}"`;
      (0, util_1$g.checkStrictMode)(it, msg, opts.strictTuples);
    }
  }
}
items.validateTuple = validateTuple;
items.default = def$o;
Object.defineProperty(prefixItems, "__esModule", { value: true });
const items_1$1 = items;
const def$n = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (cxt) => (0, items_1$1.validateTuple)(cxt, "items")
};
prefixItems.default = def$n;
var items2020 = {};
Object.defineProperty(items2020, "__esModule", { value: true });
const codegen_1$c = codegen;
const util_1$f = util;
const code_1$4 = code;
const additionalItems_1$1 = additionalItems;
const error$9 = {
  message: ({ params: { len } }) => (0, codegen_1$c.str)`must NOT have more than ${len} items`,
  params: ({ params: { len } }) => (0, codegen_1$c._)`{limit: ${len}}`
};
const def$m = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: error$9,
  code(cxt) {
    const { schema, parentSchema, it } = cxt;
    const { prefixItems: prefixItems2 } = parentSchema;
    it.items = true;
    if ((0, util_1$f.alwaysValidSchema)(it, schema))
      return;
    if (prefixItems2)
      (0, additionalItems_1$1.validateAdditionalItems)(cxt, prefixItems2);
    else
      cxt.ok((0, code_1$4.validateArray)(cxt));
  }
};
items2020.default = def$m;
var contains = {};
Object.defineProperty(contains, "__esModule", { value: true });
const codegen_1$b = codegen;
const util_1$e = util;
const error$8 = {
  message: ({ params: { min, max } }) => max === void 0 ? (0, codegen_1$b.str)`must contain at least ${min} valid item(s)` : (0, codegen_1$b.str)`must contain at least ${min} and no more than ${max} valid item(s)`,
  params: ({ params: { min, max } }) => max === void 0 ? (0, codegen_1$b._)`{minContains: ${min}}` : (0, codegen_1$b._)`{minContains: ${min}, maxContains: ${max}}`
};
const def$l = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: true,
  error: error$8,
  code(cxt) {
    const { gen, schema, parentSchema, data, it } = cxt;
    let min;
    let max;
    const { minContains, maxContains } = parentSchema;
    if (it.opts.next) {
      min = minContains === void 0 ? 1 : minContains;
      max = maxContains;
    } else {
      min = 1;
    }
    const len = gen.const("len", (0, codegen_1$b._)`${data}.length`);
    cxt.setParams({ min, max });
    if (max === void 0 && min === 0) {
      (0, util_1$e.checkStrictMode)(it, `"minContains" == 0 without "maxContains": "contains" keyword ignored`);
      return;
    }
    if (max !== void 0 && min > max) {
      (0, util_1$e.checkStrictMode)(it, `"minContains" > "maxContains" is always invalid`);
      cxt.fail();
      return;
    }
    if ((0, util_1$e.alwaysValidSchema)(it, schema)) {
      let cond = (0, codegen_1$b._)`${len} >= ${min}`;
      if (max !== void 0)
        cond = (0, codegen_1$b._)`${cond} && ${len} <= ${max}`;
      cxt.pass(cond);
      return;
    }
    it.items = true;
    const valid = gen.name("valid");
    if (max === void 0 && min === 1) {
      validateItems(valid, () => gen.if(valid, () => gen.break()));
    } else if (min === 0) {
      gen.let(valid, true);
      if (max !== void 0)
        gen.if((0, codegen_1$b._)`${data}.length > 0`, validateItemsWithCount);
    } else {
      gen.let(valid, false);
      validateItemsWithCount();
    }
    cxt.result(valid, () => cxt.reset());
    function validateItemsWithCount() {
      const schValid = gen.name("_valid");
      const count = gen.let("count", 0);
      validateItems(schValid, () => gen.if(schValid, () => checkLimits(count)));
    }
    function validateItems(_valid, block) {
      gen.forRange("i", 0, len, (i2) => {
        cxt.subschema({
          keyword: "contains",
          dataProp: i2,
          dataPropType: util_1$e.Type.Num,
          compositeRule: true
        }, _valid);
        block();
      });
    }
    function checkLimits(count) {
      gen.code((0, codegen_1$b._)`${count}++`);
      if (max === void 0) {
        gen.if((0, codegen_1$b._)`${count} >= ${min}`, () => gen.assign(valid, true).break());
      } else {
        gen.if((0, codegen_1$b._)`${count} > ${max}`, () => gen.assign(valid, false).break());
        if (min === 1)
          gen.assign(valid, true);
        else
          gen.if((0, codegen_1$b._)`${count} >= ${min}`, () => gen.assign(valid, true));
      }
    }
  }
};
contains.default = def$l;
var dependencies = {};
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.validateSchemaDeps = exports.validatePropertyDeps = exports.error = void 0;
  const codegen_12 = codegen;
  const util_12 = util;
  const code_12 = code;
  exports.error = {
    message: ({ params: { property, depsCount, deps } }) => {
      const property_ies = depsCount === 1 ? "property" : "properties";
      return (0, codegen_12.str)`must have ${property_ies} ${deps} when property ${property} is present`;
    },
    params: ({ params: { property, depsCount, deps, missingProperty } }) => (0, codegen_12._)`{property: ${property},
    missingProperty: ${missingProperty},
    depsCount: ${depsCount},
    deps: ${deps}}`
    // TODO change to reference
  };
  const def2 = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: exports.error,
    code(cxt) {
      const [propDeps, schDeps] = splitDependencies(cxt);
      validatePropertyDeps(cxt, propDeps);
      validateSchemaDeps(cxt, schDeps);
    }
  };
  function splitDependencies({ schema }) {
    const propertyDeps = {};
    const schemaDeps = {};
    for (const key in schema) {
      if (key === "__proto__")
        continue;
      const deps = Array.isArray(schema[key]) ? propertyDeps : schemaDeps;
      deps[key] = schema[key];
    }
    return [propertyDeps, schemaDeps];
  }
  function validatePropertyDeps(cxt, propertyDeps = cxt.schema) {
    const { gen, data, it } = cxt;
    if (Object.keys(propertyDeps).length === 0)
      return;
    const missing = gen.let("missing");
    for (const prop in propertyDeps) {
      const deps = propertyDeps[prop];
      if (deps.length === 0)
        continue;
      const hasProperty = (0, code_12.propertyInData)(gen, data, prop, it.opts.ownProperties);
      cxt.setParams({
        property: prop,
        depsCount: deps.length,
        deps: deps.join(", ")
      });
      if (it.allErrors) {
        gen.if(hasProperty, () => {
          for (const depProp of deps) {
            (0, code_12.checkReportMissingProp)(cxt, depProp);
          }
        });
      } else {
        gen.if((0, codegen_12._)`${hasProperty} && (${(0, code_12.checkMissingProp)(cxt, deps, missing)})`);
        (0, code_12.reportMissingProp)(cxt, missing);
        gen.else();
      }
    }
  }
  exports.validatePropertyDeps = validatePropertyDeps;
  function validateSchemaDeps(cxt, schemaDeps = cxt.schema) {
    const { gen, data, keyword: keyword2, it } = cxt;
    const valid = gen.name("valid");
    for (const prop in schemaDeps) {
      if ((0, util_12.alwaysValidSchema)(it, schemaDeps[prop]))
        continue;
      gen.if(
        (0, code_12.propertyInData)(gen, data, prop, it.opts.ownProperties),
        () => {
          const schCxt = cxt.subschema({ keyword: keyword2, schemaProp: prop }, valid);
          cxt.mergeValidEvaluated(schCxt, valid);
        },
        () => gen.var(valid, true)
        // TODO var
      );
      cxt.ok(valid);
    }
  }
  exports.validateSchemaDeps = validateSchemaDeps;
  exports.default = def2;
})(dependencies);
var propertyNames = {};
Object.defineProperty(propertyNames, "__esModule", { value: true });
const codegen_1$a = codegen;
const util_1$d = util;
const error$7 = {
  message: "property name must be valid",
  params: ({ params }) => (0, codegen_1$a._)`{propertyName: ${params.propertyName}}`
};
const def$k = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: error$7,
  code(cxt) {
    const { gen, schema, data, it } = cxt;
    if ((0, util_1$d.alwaysValidSchema)(it, schema))
      return;
    const valid = gen.name("valid");
    gen.forIn("key", data, (key) => {
      cxt.setParams({ propertyName: key });
      cxt.subschema({
        keyword: "propertyNames",
        data: key,
        dataTypes: ["string"],
        propertyName: key,
        compositeRule: true
      }, valid);
      gen.if((0, codegen_1$a.not)(valid), () => {
        cxt.error(true);
        if (!it.allErrors)
          gen.break();
      });
    });
    cxt.ok(valid);
  }
};
propertyNames.default = def$k;
var additionalProperties = {};
Object.defineProperty(additionalProperties, "__esModule", { value: true });
const code_1$3 = code;
const codegen_1$9 = codegen;
const names_1$3 = names$1;
const util_1$c = util;
const error$6 = {
  message: "must NOT have additional properties",
  params: ({ params }) => (0, codegen_1$9._)`{additionalProperty: ${params.additionalProperty}}`
};
const def$j = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: true,
  trackErrors: true,
  error: error$6,
  code(cxt) {
    const { gen, schema, parentSchema, data, errsCount, it } = cxt;
    if (!errsCount)
      throw new Error("ajv implementation error");
    const { allErrors, opts } = it;
    it.props = true;
    if (opts.removeAdditional !== "all" && (0, util_1$c.alwaysValidSchema)(it, schema))
      return;
    const props = (0, code_1$3.allSchemaProperties)(parentSchema.properties);
    const patProps = (0, code_1$3.allSchemaProperties)(parentSchema.patternProperties);
    checkAdditionalProperties();
    cxt.ok((0, codegen_1$9._)`${errsCount} === ${names_1$3.default.errors}`);
    function checkAdditionalProperties() {
      gen.forIn("key", data, (key) => {
        if (!props.length && !patProps.length)
          additionalPropertyCode(key);
        else
          gen.if(isAdditional(key), () => additionalPropertyCode(key));
      });
    }
    function isAdditional(key) {
      let definedProp;
      if (props.length > 8) {
        const propsSchema = (0, util_1$c.schemaRefOrVal)(it, parentSchema.properties, "properties");
        definedProp = (0, code_1$3.isOwnProperty)(gen, propsSchema, key);
      } else if (props.length) {
        definedProp = (0, codegen_1$9.or)(...props.map((p) => (0, codegen_1$9._)`${key} === ${p}`));
      } else {
        definedProp = codegen_1$9.nil;
      }
      if (patProps.length) {
        definedProp = (0, codegen_1$9.or)(definedProp, ...patProps.map((p) => (0, codegen_1$9._)`${(0, code_1$3.usePattern)(cxt, p)}.test(${key})`));
      }
      return (0, codegen_1$9.not)(definedProp);
    }
    function deleteAdditional(key) {
      gen.code((0, codegen_1$9._)`delete ${data}[${key}]`);
    }
    function additionalPropertyCode(key) {
      if (opts.removeAdditional === "all" || opts.removeAdditional && schema === false) {
        deleteAdditional(key);
        return;
      }
      if (schema === false) {
        cxt.setParams({ additionalProperty: key });
        cxt.error();
        if (!allErrors)
          gen.break();
        return;
      }
      if (typeof schema == "object" && !(0, util_1$c.alwaysValidSchema)(it, schema)) {
        const valid = gen.name("valid");
        if (opts.removeAdditional === "failing") {
          applyAdditionalSchema(key, valid, false);
          gen.if((0, codegen_1$9.not)(valid), () => {
            cxt.reset();
            deleteAdditional(key);
          });
        } else {
          applyAdditionalSchema(key, valid);
          if (!allErrors)
            gen.if((0, codegen_1$9.not)(valid), () => gen.break());
        }
      }
    }
    function applyAdditionalSchema(key, valid, errors2) {
      const subschema2 = {
        keyword: "additionalProperties",
        dataProp: key,
        dataPropType: util_1$c.Type.Str
      };
      if (errors2 === false) {
        Object.assign(subschema2, {
          compositeRule: true,
          createErrors: false,
          allErrors: false
        });
      }
      cxt.subschema(subschema2, valid);
    }
  }
};
additionalProperties.default = def$j;
var properties$8 = {};
Object.defineProperty(properties$8, "__esModule", { value: true });
const validate_1 = validate;
const code_1$2 = code;
const util_1$b = util;
const additionalProperties_1$1 = additionalProperties;
const def$i = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(cxt) {
    const { gen, schema, parentSchema, data, it } = cxt;
    if (it.opts.removeAdditional === "all" && parentSchema.additionalProperties === void 0) {
      additionalProperties_1$1.default.code(new validate_1.KeywordCxt(it, additionalProperties_1$1.default, "additionalProperties"));
    }
    const allProps = (0, code_1$2.allSchemaProperties)(schema);
    for (const prop of allProps) {
      it.definedProperties.add(prop);
    }
    if (it.opts.unevaluated && allProps.length && it.props !== true) {
      it.props = util_1$b.mergeEvaluated.props(gen, (0, util_1$b.toHash)(allProps), it.props);
    }
    const properties2 = allProps.filter((p) => !(0, util_1$b.alwaysValidSchema)(it, schema[p]));
    if (properties2.length === 0)
      return;
    const valid = gen.name("valid");
    for (const prop of properties2) {
      if (hasDefault(prop)) {
        applyPropertySchema(prop);
      } else {
        gen.if((0, code_1$2.propertyInData)(gen, data, prop, it.opts.ownProperties));
        applyPropertySchema(prop);
        if (!it.allErrors)
          gen.else().var(valid, true);
        gen.endIf();
      }
      cxt.it.definedProperties.add(prop);
      cxt.ok(valid);
    }
    function hasDefault(prop) {
      return it.opts.useDefaults && !it.compositeRule && schema[prop].default !== void 0;
    }
    function applyPropertySchema(prop) {
      cxt.subschema({
        keyword: "properties",
        schemaProp: prop,
        dataProp: prop
      }, valid);
    }
  }
};
properties$8.default = def$i;
var patternProperties = {};
Object.defineProperty(patternProperties, "__esModule", { value: true });
const code_1$1 = code;
const codegen_1$8 = codegen;
const util_1$a = util;
const util_2 = util;
const def$h = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(cxt) {
    const { gen, schema, data, parentSchema, it } = cxt;
    const { opts } = it;
    const patterns = (0, code_1$1.allSchemaProperties)(schema);
    const alwaysValidPatterns = patterns.filter((p) => (0, util_1$a.alwaysValidSchema)(it, schema[p]));
    if (patterns.length === 0 || alwaysValidPatterns.length === patterns.length && (!it.opts.unevaluated || it.props === true)) {
      return;
    }
    const checkProperties = opts.strictSchema && !opts.allowMatchingProperties && parentSchema.properties;
    const valid = gen.name("valid");
    if (it.props !== true && !(it.props instanceof codegen_1$8.Name)) {
      it.props = (0, util_2.evaluatedPropsToName)(gen, it.props);
    }
    const { props } = it;
    validatePatternProperties();
    function validatePatternProperties() {
      for (const pat of patterns) {
        if (checkProperties)
          checkMatchingProperties(pat);
        if (it.allErrors) {
          validateProperties(pat);
        } else {
          gen.var(valid, true);
          validateProperties(pat);
          gen.if(valid);
        }
      }
    }
    function checkMatchingProperties(pat) {
      for (const prop in checkProperties) {
        if (new RegExp(pat).test(prop)) {
          (0, util_1$a.checkStrictMode)(it, `property ${prop} matches pattern ${pat} (use allowMatchingProperties)`);
        }
      }
    }
    function validateProperties(pat) {
      gen.forIn("key", data, (key) => {
        gen.if((0, codegen_1$8._)`${(0, code_1$1.usePattern)(cxt, pat)}.test(${key})`, () => {
          const alwaysValid = alwaysValidPatterns.includes(pat);
          if (!alwaysValid) {
            cxt.subschema({
              keyword: "patternProperties",
              schemaProp: pat,
              dataProp: key,
              dataPropType: util_2.Type.Str
            }, valid);
          }
          if (it.opts.unevaluated && props !== true) {
            gen.assign((0, codegen_1$8._)`${props}[${key}]`, true);
          } else if (!alwaysValid && !it.allErrors) {
            gen.if((0, codegen_1$8.not)(valid), () => gen.break());
          }
        });
      });
    }
  }
};
patternProperties.default = def$h;
var not = {};
Object.defineProperty(not, "__esModule", { value: true });
const util_1$9 = util;
const def$g = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: true,
  code(cxt) {
    const { gen, schema, it } = cxt;
    if ((0, util_1$9.alwaysValidSchema)(it, schema)) {
      cxt.fail();
      return;
    }
    const valid = gen.name("valid");
    cxt.subschema({
      keyword: "not",
      compositeRule: true,
      createErrors: false,
      allErrors: false
    }, valid);
    cxt.failResult(valid, () => cxt.reset(), () => cxt.error());
  },
  error: { message: "must NOT be valid" }
};
not.default = def$g;
var anyOf = {};
Object.defineProperty(anyOf, "__esModule", { value: true });
const code_1 = code;
const def$f = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: true,
  code: code_1.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
anyOf.default = def$f;
var oneOf = {};
Object.defineProperty(oneOf, "__esModule", { value: true });
const codegen_1$7 = codegen;
const util_1$8 = util;
const error$5 = {
  message: "must match exactly one schema in oneOf",
  params: ({ params }) => (0, codegen_1$7._)`{passingSchemas: ${params.passing}}`
};
const def$e = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: true,
  error: error$5,
  code(cxt) {
    const { gen, schema, parentSchema, it } = cxt;
    if (!Array.isArray(schema))
      throw new Error("ajv implementation error");
    if (it.opts.discriminator && parentSchema.discriminator)
      return;
    const schArr = schema;
    const valid = gen.let("valid", false);
    const passing = gen.let("passing", null);
    const schValid = gen.name("_valid");
    cxt.setParams({ passing });
    gen.block(validateOneOf);
    cxt.result(valid, () => cxt.reset(), () => cxt.error(true));
    function validateOneOf() {
      schArr.forEach((sch, i2) => {
        let schCxt;
        if ((0, util_1$8.alwaysValidSchema)(it, sch)) {
          gen.var(schValid, true);
        } else {
          schCxt = cxt.subschema({
            keyword: "oneOf",
            schemaProp: i2,
            compositeRule: true
          }, schValid);
        }
        if (i2 > 0) {
          gen.if((0, codegen_1$7._)`${schValid} && ${valid}`).assign(valid, false).assign(passing, (0, codegen_1$7._)`[${passing}, ${i2}]`).else();
        }
        gen.if(schValid, () => {
          gen.assign(valid, true);
          gen.assign(passing, i2);
          if (schCxt)
            cxt.mergeEvaluated(schCxt, codegen_1$7.Name);
        });
      });
    }
  }
};
oneOf.default = def$e;
var allOf$1 = {};
Object.defineProperty(allOf$1, "__esModule", { value: true });
const util_1$7 = util;
const def$d = {
  keyword: "allOf",
  schemaType: "array",
  code(cxt) {
    const { gen, schema, it } = cxt;
    if (!Array.isArray(schema))
      throw new Error("ajv implementation error");
    const valid = gen.name("valid");
    schema.forEach((sch, i2) => {
      if ((0, util_1$7.alwaysValidSchema)(it, sch))
        return;
      const schCxt = cxt.subschema({ keyword: "allOf", schemaProp: i2 }, valid);
      cxt.ok(valid);
      cxt.mergeEvaluated(schCxt);
    });
  }
};
allOf$1.default = def$d;
var _if = {};
Object.defineProperty(_if, "__esModule", { value: true });
const codegen_1$6 = codegen;
const util_1$6 = util;
const error$4 = {
  message: ({ params }) => (0, codegen_1$6.str)`must match "${params.ifClause}" schema`,
  params: ({ params }) => (0, codegen_1$6._)`{failingKeyword: ${params.ifClause}}`
};
const def$c = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: true,
  error: error$4,
  code(cxt) {
    const { gen, parentSchema, it } = cxt;
    if (parentSchema.then === void 0 && parentSchema.else === void 0) {
      (0, util_1$6.checkStrictMode)(it, '"if" without "then" and "else" is ignored');
    }
    const hasThen = hasSchema(it, "then");
    const hasElse = hasSchema(it, "else");
    if (!hasThen && !hasElse)
      return;
    const valid = gen.let("valid", true);
    const schValid = gen.name("_valid");
    validateIf();
    cxt.reset();
    if (hasThen && hasElse) {
      const ifClause = gen.let("ifClause");
      cxt.setParams({ ifClause });
      gen.if(schValid, validateClause("then", ifClause), validateClause("else", ifClause));
    } else if (hasThen) {
      gen.if(schValid, validateClause("then"));
    } else {
      gen.if((0, codegen_1$6.not)(schValid), validateClause("else"));
    }
    cxt.pass(valid, () => cxt.error(true));
    function validateIf() {
      const schCxt = cxt.subschema({
        keyword: "if",
        compositeRule: true,
        createErrors: false,
        allErrors: false
      }, schValid);
      cxt.mergeEvaluated(schCxt);
    }
    function validateClause(keyword2, ifClause) {
      return () => {
        const schCxt = cxt.subschema({ keyword: keyword2 }, schValid);
        gen.assign(valid, schValid);
        cxt.mergeValidEvaluated(schCxt, valid);
        if (ifClause)
          gen.assign(ifClause, (0, codegen_1$6._)`${keyword2}`);
        else
          cxt.setParams({ ifClause: keyword2 });
      };
    }
  }
};
function hasSchema(it, keyword2) {
  const schema = it.schema[keyword2];
  return schema !== void 0 && !(0, util_1$6.alwaysValidSchema)(it, schema);
}
_if.default = def$c;
var thenElse = {};
Object.defineProperty(thenElse, "__esModule", { value: true });
const util_1$5 = util;
const def$b = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: keyword2, parentSchema, it }) {
    if (parentSchema.if === void 0)
      (0, util_1$5.checkStrictMode)(it, `"${keyword2}" without "if" is ignored`);
  }
};
thenElse.default = def$b;
Object.defineProperty(applicator$1, "__esModule", { value: true });
const additionalItems_1 = additionalItems;
const prefixItems_1 = prefixItems;
const items_1 = items;
const items2020_1 = items2020;
const contains_1 = contains;
const dependencies_1$2 = dependencies;
const propertyNames_1 = propertyNames;
const additionalProperties_1 = additionalProperties;
const properties_1 = properties$8;
const patternProperties_1 = patternProperties;
const not_1 = not;
const anyOf_1 = anyOf;
const oneOf_1 = oneOf;
const allOf_1 = allOf$1;
const if_1 = _if;
const thenElse_1 = thenElse;
function getApplicator(draft20202 = false) {
  const applicator2 = [
    // any
    not_1.default,
    anyOf_1.default,
    oneOf_1.default,
    allOf_1.default,
    if_1.default,
    thenElse_1.default,
    // object
    propertyNames_1.default,
    additionalProperties_1.default,
    dependencies_1$2.default,
    properties_1.default,
    patternProperties_1.default
  ];
  if (draft20202)
    applicator2.push(prefixItems_1.default, items2020_1.default);
  else
    applicator2.push(additionalItems_1.default, items_1.default);
  applicator2.push(contains_1.default);
  return applicator2;
}
applicator$1.default = getApplicator;
var dynamic$1 = {};
var dynamicAnchor$1 = {};
Object.defineProperty(dynamicAnchor$1, "__esModule", { value: true });
dynamicAnchor$1.dynamicAnchor = void 0;
const codegen_1$5 = codegen;
const names_1$2 = names$1;
const compile_1$1 = compile;
const ref_1$1 = ref;
const def$a = {
  keyword: "$dynamicAnchor",
  schemaType: "string",
  code: (cxt) => dynamicAnchor(cxt, cxt.schema)
};
function dynamicAnchor(cxt, anchor) {
  const { gen, it } = cxt;
  it.schemaEnv.root.dynamicAnchors[anchor] = true;
  const v = (0, codegen_1$5._)`${names_1$2.default.dynamicAnchors}${(0, codegen_1$5.getProperty)(anchor)}`;
  const validate2 = it.errSchemaPath === "#" ? it.validateName : _getValidate(cxt);
  gen.if((0, codegen_1$5._)`!${v}`, () => gen.assign(v, validate2));
}
dynamicAnchor$1.dynamicAnchor = dynamicAnchor;
function _getValidate(cxt) {
  const { schemaEnv, schema, self: self2 } = cxt.it;
  const { root, baseId, localRefs, meta } = schemaEnv.root;
  const { schemaId } = self2.opts;
  const sch = new compile_1$1.SchemaEnv({ schema, schemaId, root, baseId, localRefs, meta });
  compile_1$1.compileSchema.call(self2, sch);
  return (0, ref_1$1.getValidate)(cxt, sch);
}
dynamicAnchor$1.default = def$a;
var dynamicRef$1 = {};
Object.defineProperty(dynamicRef$1, "__esModule", { value: true });
dynamicRef$1.dynamicRef = void 0;
const codegen_1$4 = codegen;
const names_1$1 = names$1;
const ref_1 = ref;
const def$9 = {
  keyword: "$dynamicRef",
  schemaType: "string",
  code: (cxt) => dynamicRef(cxt, cxt.schema)
};
function dynamicRef(cxt, ref2) {
  const { gen, keyword: keyword2, it } = cxt;
  if (ref2[0] !== "#")
    throw new Error(`"${keyword2}" only supports hash fragment reference`);
  const anchor = ref2.slice(1);
  if (it.allErrors) {
    _dynamicRef();
  } else {
    const valid = gen.let("valid", false);
    _dynamicRef(valid);
    cxt.ok(valid);
  }
  function _dynamicRef(valid) {
    if (it.schemaEnv.root.dynamicAnchors[anchor]) {
      const v = gen.let("_v", (0, codegen_1$4._)`${names_1$1.default.dynamicAnchors}${(0, codegen_1$4.getProperty)(anchor)}`);
      gen.if(v, _callRef(v, valid), _callRef(it.validateName, valid));
    } else {
      _callRef(it.validateName, valid)();
    }
  }
  function _callRef(validate2, valid) {
    return valid ? () => gen.block(() => {
      (0, ref_1.callRef)(cxt, validate2);
      gen.let(valid, true);
    }) : () => (0, ref_1.callRef)(cxt, validate2);
  }
}
dynamicRef$1.dynamicRef = dynamicRef;
dynamicRef$1.default = def$9;
var recursiveAnchor = {};
Object.defineProperty(recursiveAnchor, "__esModule", { value: true });
const dynamicAnchor_1$1 = dynamicAnchor$1;
const util_1$4 = util;
const def$8 = {
  keyword: "$recursiveAnchor",
  schemaType: "boolean",
  code(cxt) {
    if (cxt.schema)
      (0, dynamicAnchor_1$1.dynamicAnchor)(cxt, "");
    else
      (0, util_1$4.checkStrictMode)(cxt.it, "$recursiveAnchor: false is ignored");
  }
};
recursiveAnchor.default = def$8;
var recursiveRef = {};
Object.defineProperty(recursiveRef, "__esModule", { value: true });
const dynamicRef_1$1 = dynamicRef$1;
const def$7 = {
  keyword: "$recursiveRef",
  schemaType: "string",
  code: (cxt) => (0, dynamicRef_1$1.dynamicRef)(cxt, cxt.schema)
};
recursiveRef.default = def$7;
Object.defineProperty(dynamic$1, "__esModule", { value: true });
const dynamicAnchor_1 = dynamicAnchor$1;
const dynamicRef_1 = dynamicRef$1;
const recursiveAnchor_1 = recursiveAnchor;
const recursiveRef_1 = recursiveRef;
const dynamic = [dynamicAnchor_1.default, dynamicRef_1.default, recursiveAnchor_1.default, recursiveRef_1.default];
dynamic$1.default = dynamic;
var next$1 = {};
var dependentRequired = {};
Object.defineProperty(dependentRequired, "__esModule", { value: true });
const dependencies_1$1 = dependencies;
const def$6 = {
  keyword: "dependentRequired",
  type: "object",
  schemaType: "object",
  error: dependencies_1$1.error,
  code: (cxt) => (0, dependencies_1$1.validatePropertyDeps)(cxt)
};
dependentRequired.default = def$6;
var dependentSchemas = {};
Object.defineProperty(dependentSchemas, "__esModule", { value: true });
const dependencies_1 = dependencies;
const def$5 = {
  keyword: "dependentSchemas",
  type: "object",
  schemaType: "object",
  code: (cxt) => (0, dependencies_1.validateSchemaDeps)(cxt)
};
dependentSchemas.default = def$5;
var limitContains = {};
Object.defineProperty(limitContains, "__esModule", { value: true });
const util_1$3 = util;
const def$4 = {
  keyword: ["maxContains", "minContains"],
  type: "array",
  schemaType: "number",
  code({ keyword: keyword2, parentSchema, it }) {
    if (parentSchema.contains === void 0) {
      (0, util_1$3.checkStrictMode)(it, `"${keyword2}" without "contains" is ignored`);
    }
  }
};
limitContains.default = def$4;
Object.defineProperty(next$1, "__esModule", { value: true });
const dependentRequired_1 = dependentRequired;
const dependentSchemas_1 = dependentSchemas;
const limitContains_1 = limitContains;
const next = [dependentRequired_1.default, dependentSchemas_1.default, limitContains_1.default];
next$1.default = next;
var unevaluated$2 = {};
var unevaluatedProperties = {};
Object.defineProperty(unevaluatedProperties, "__esModule", { value: true });
const codegen_1$3 = codegen;
const util_1$2 = util;
const names_1 = names$1;
const error$3 = {
  message: "must NOT have unevaluated properties",
  params: ({ params }) => (0, codegen_1$3._)`{unevaluatedProperty: ${params.unevaluatedProperty}}`
};
const def$3 = {
  keyword: "unevaluatedProperties",
  type: "object",
  schemaType: ["boolean", "object"],
  trackErrors: true,
  error: error$3,
  code(cxt) {
    const { gen, schema, data, errsCount, it } = cxt;
    if (!errsCount)
      throw new Error("ajv implementation error");
    const { allErrors, props } = it;
    if (props instanceof codegen_1$3.Name) {
      gen.if((0, codegen_1$3._)`${props} !== true`, () => gen.forIn("key", data, (key) => gen.if(unevaluatedDynamic(props, key), () => unevaluatedPropCode(key))));
    } else if (props !== true) {
      gen.forIn("key", data, (key) => props === void 0 ? unevaluatedPropCode(key) : gen.if(unevaluatedStatic(props, key), () => unevaluatedPropCode(key)));
    }
    it.props = true;
    cxt.ok((0, codegen_1$3._)`${errsCount} === ${names_1.default.errors}`);
    function unevaluatedPropCode(key) {
      if (schema === false) {
        cxt.setParams({ unevaluatedProperty: key });
        cxt.error();
        if (!allErrors)
          gen.break();
        return;
      }
      if (!(0, util_1$2.alwaysValidSchema)(it, schema)) {
        const valid = gen.name("valid");
        cxt.subschema({
          keyword: "unevaluatedProperties",
          dataProp: key,
          dataPropType: util_1$2.Type.Str
        }, valid);
        if (!allErrors)
          gen.if((0, codegen_1$3.not)(valid), () => gen.break());
      }
    }
    function unevaluatedDynamic(evaluatedProps, key) {
      return (0, codegen_1$3._)`!${evaluatedProps} || !${evaluatedProps}[${key}]`;
    }
    function unevaluatedStatic(evaluatedProps, key) {
      const ps = [];
      for (const p in evaluatedProps) {
        if (evaluatedProps[p] === true)
          ps.push((0, codegen_1$3._)`${key} !== ${p}`);
      }
      return (0, codegen_1$3.and)(...ps);
    }
  }
};
unevaluatedProperties.default = def$3;
var unevaluatedItems = {};
Object.defineProperty(unevaluatedItems, "__esModule", { value: true });
const codegen_1$2 = codegen;
const util_1$1 = util;
const error$2 = {
  message: ({ params: { len } }) => (0, codegen_1$2.str)`must NOT have more than ${len} items`,
  params: ({ params: { len } }) => (0, codegen_1$2._)`{limit: ${len}}`
};
const def$2 = {
  keyword: "unevaluatedItems",
  type: "array",
  schemaType: ["boolean", "object"],
  error: error$2,
  code(cxt) {
    const { gen, schema, data, it } = cxt;
    const items2 = it.items || 0;
    if (items2 === true)
      return;
    const len = gen.const("len", (0, codegen_1$2._)`${data}.length`);
    if (schema === false) {
      cxt.setParams({ len: items2 });
      cxt.fail((0, codegen_1$2._)`${len} > ${items2}`);
    } else if (typeof schema == "object" && !(0, util_1$1.alwaysValidSchema)(it, schema)) {
      const valid = gen.var("valid", (0, codegen_1$2._)`${len} <= ${items2}`);
      gen.if((0, codegen_1$2.not)(valid), () => validateItems(valid, items2));
      cxt.ok(valid);
    }
    it.items = true;
    function validateItems(valid, from) {
      gen.forRange("i", from, len, (i2) => {
        cxt.subschema({ keyword: "unevaluatedItems", dataProp: i2, dataPropType: util_1$1.Type.Num }, valid);
        if (!it.allErrors)
          gen.if((0, codegen_1$2.not)(valid), () => gen.break());
      });
    }
  }
};
unevaluatedItems.default = def$2;
Object.defineProperty(unevaluated$2, "__esModule", { value: true });
const unevaluatedProperties_1 = unevaluatedProperties;
const unevaluatedItems_1 = unevaluatedItems;
const unevaluated$1 = [unevaluatedProperties_1.default, unevaluatedItems_1.default];
unevaluated$2.default = unevaluated$1;
var format$3 = {};
var format$2 = {};
Object.defineProperty(format$2, "__esModule", { value: true });
const codegen_1$1 = codegen;
const error$1 = {
  message: ({ schemaCode }) => (0, codegen_1$1.str)`must match format "${schemaCode}"`,
  params: ({ schemaCode }) => (0, codegen_1$1._)`{format: ${schemaCode}}`
};
const def$1 = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: true,
  error: error$1,
  code(cxt, ruleType) {
    const { gen, data, $data, schema, schemaCode, it } = cxt;
    const { opts, errSchemaPath, schemaEnv, self: self2 } = it;
    if (!opts.validateFormats)
      return;
    if ($data)
      validate$DataFormat();
    else
      validateFormat();
    function validate$DataFormat() {
      const fmts = gen.scopeValue("formats", {
        ref: self2.formats,
        code: opts.code.formats
      });
      const fDef = gen.const("fDef", (0, codegen_1$1._)`${fmts}[${schemaCode}]`);
      const fType = gen.let("fType");
      const format2 = gen.let("format");
      gen.if((0, codegen_1$1._)`typeof ${fDef} == "object" && !(${fDef} instanceof RegExp)`, () => gen.assign(fType, (0, codegen_1$1._)`${fDef}.type || "string"`).assign(format2, (0, codegen_1$1._)`${fDef}.validate`), () => gen.assign(fType, (0, codegen_1$1._)`"string"`).assign(format2, fDef));
      cxt.fail$data((0, codegen_1$1.or)(unknownFmt(), invalidFmt()));
      function unknownFmt() {
        if (opts.strictSchema === false)
          return codegen_1$1.nil;
        return (0, codegen_1$1._)`${schemaCode} && !${format2}`;
      }
      function invalidFmt() {
        const callFormat = schemaEnv.$async ? (0, codegen_1$1._)`(${fDef}.async ? await ${format2}(${data}) : ${format2}(${data}))` : (0, codegen_1$1._)`${format2}(${data})`;
        const validData = (0, codegen_1$1._)`(typeof ${format2} == "function" ? ${callFormat} : ${format2}.test(${data}))`;
        return (0, codegen_1$1._)`${format2} && ${format2} !== true && ${fType} === ${ruleType} && !${validData}`;
      }
    }
    function validateFormat() {
      const formatDef = self2.formats[schema];
      if (!formatDef) {
        unknownFormat();
        return;
      }
      if (formatDef === true)
        return;
      const [fmtType, format2, fmtRef] = getFormat(formatDef);
      if (fmtType === ruleType)
        cxt.pass(validCondition());
      function unknownFormat() {
        if (opts.strictSchema === false) {
          self2.logger.warn(unknownMsg());
          return;
        }
        throw new Error(unknownMsg());
        function unknownMsg() {
          return `unknown format "${schema}" ignored in schema at path "${errSchemaPath}"`;
        }
      }
      function getFormat(fmtDef) {
        const code2 = fmtDef instanceof RegExp ? (0, codegen_1$1.regexpCode)(fmtDef) : opts.code.formats ? (0, codegen_1$1._)`${opts.code.formats}${(0, codegen_1$1.getProperty)(schema)}` : void 0;
        const fmt = gen.scopeValue("formats", { key: schema, ref: fmtDef, code: code2 });
        if (typeof fmtDef == "object" && !(fmtDef instanceof RegExp)) {
          return [fmtDef.type || "string", fmtDef.validate, (0, codegen_1$1._)`${fmt}.validate`];
        }
        return ["string", fmtDef, fmt];
      }
      function validCondition() {
        if (typeof formatDef == "object" && !(formatDef instanceof RegExp) && formatDef.async) {
          if (!schemaEnv.$async)
            throw new Error("async format in sync schema");
          return (0, codegen_1$1._)`await ${fmtRef}(${data})`;
        }
        return typeof format2 == "function" ? (0, codegen_1$1._)`${fmtRef}(${data})` : (0, codegen_1$1._)`${fmtRef}.test(${data})`;
      }
    }
  }
};
format$2.default = def$1;
Object.defineProperty(format$3, "__esModule", { value: true });
const format_1$1 = format$2;
const format$1 = [format_1$1.default];
format$3.default = format$1;
var metadata$1 = {};
Object.defineProperty(metadata$1, "__esModule", { value: true });
metadata$1.contentVocabulary = metadata$1.metadataVocabulary = void 0;
metadata$1.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
metadata$1.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(draft2020, "__esModule", { value: true });
const core_1 = core$2;
const validation_1 = validation$2;
const applicator_1 = applicator$1;
const dynamic_1 = dynamic$1;
const next_1 = next$1;
const unevaluated_1 = unevaluated$2;
const format_1 = format$3;
const metadata_1 = metadata$1;
const draft2020Vocabularies = [
  dynamic_1.default,
  core_1.default,
  validation_1.default,
  (0, applicator_1.default)(true),
  format_1.default,
  metadata_1.metadataVocabulary,
  metadata_1.contentVocabulary,
  next_1.default,
  unevaluated_1.default
];
draft2020.default = draft2020Vocabularies;
var discriminator = {};
var types = {};
Object.defineProperty(types, "__esModule", { value: true });
types.DiscrError = void 0;
var DiscrError;
(function(DiscrError2) {
  DiscrError2["Tag"] = "tag";
  DiscrError2["Mapping"] = "mapping";
})(DiscrError || (types.DiscrError = DiscrError = {}));
Object.defineProperty(discriminator, "__esModule", { value: true });
const codegen_1 = codegen;
const types_1 = types;
const compile_1 = compile;
const ref_error_1 = ref_error;
const util_1 = util;
const error = {
  message: ({ params: { discrError, tagName } }) => discrError === types_1.DiscrError.Tag ? `tag "${tagName}" must be string` : `value of tag "${tagName}" must be in oneOf`,
  params: ({ params: { discrError, tag, tagName } }) => (0, codegen_1._)`{error: ${discrError}, tag: ${tagName}, tagValue: ${tag}}`
};
const def = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error,
  code(cxt) {
    const { gen, data, schema, parentSchema, it } = cxt;
    const { oneOf: oneOf2 } = parentSchema;
    if (!it.opts.discriminator) {
      throw new Error("discriminator: requires discriminator option");
    }
    const tagName = schema.propertyName;
    if (typeof tagName != "string")
      throw new Error("discriminator: requires propertyName");
    if (schema.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!oneOf2)
      throw new Error("discriminator: requires oneOf keyword");
    const valid = gen.let("valid", false);
    const tag = gen.const("tag", (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(tagName)}`);
    gen.if((0, codegen_1._)`typeof ${tag} == "string"`, () => validateMapping(), () => cxt.error(false, { discrError: types_1.DiscrError.Tag, tag, tagName }));
    cxt.ok(valid);
    function validateMapping() {
      const mapping = getMapping();
      gen.if(false);
      for (const tagValue in mapping) {
        gen.elseIf((0, codegen_1._)`${tag} === ${tagValue}`);
        gen.assign(valid, applyTagSchema(mapping[tagValue]));
      }
      gen.else();
      cxt.error(false, { discrError: types_1.DiscrError.Mapping, tag, tagName });
      gen.endIf();
    }
    function applyTagSchema(schemaProp) {
      const _valid = gen.name("valid");
      const schCxt = cxt.subschema({ keyword: "oneOf", schemaProp }, _valid);
      cxt.mergeEvaluated(schCxt, codegen_1.Name);
      return _valid;
    }
    function getMapping() {
      var _a;
      const oneOfMapping = {};
      const topRequired = hasRequired(parentSchema);
      let tagRequired = true;
      for (let i2 = 0; i2 < oneOf2.length; i2++) {
        let sch = oneOf2[i2];
        if ((sch === null || sch === void 0 ? void 0 : sch.$ref) && !(0, util_1.schemaHasRulesButRef)(sch, it.self.RULES)) {
          const ref2 = sch.$ref;
          sch = compile_1.resolveRef.call(it.self, it.schemaEnv.root, it.baseId, ref2);
          if (sch instanceof compile_1.SchemaEnv)
            sch = sch.schema;
          if (sch === void 0)
            throw new ref_error_1.default(it.opts.uriResolver, it.baseId, ref2);
        }
        const propSch = (_a = sch === null || sch === void 0 ? void 0 : sch.properties) === null || _a === void 0 ? void 0 : _a[tagName];
        if (typeof propSch != "object") {
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${tagName}"`);
        }
        tagRequired = tagRequired && (topRequired || hasRequired(sch));
        addMappings(propSch, i2);
      }
      if (!tagRequired)
        throw new Error(`discriminator: "${tagName}" must be required`);
      return oneOfMapping;
      function hasRequired({ required: required2 }) {
        return Array.isArray(required2) && required2.includes(tagName);
      }
      function addMappings(sch, i2) {
        if (sch.const) {
          addMapping(sch.const, i2);
        } else if (sch.enum) {
          for (const tagValue of sch.enum) {
            addMapping(tagValue, i2);
          }
        } else {
          throw new Error(`discriminator: "properties/${tagName}" must have "const" or "enum"`);
        }
      }
      function addMapping(tagValue, i2) {
        if (typeof tagValue != "string" || tagValue in oneOfMapping) {
          throw new Error(`discriminator: "${tagName}" values must be unique strings`);
        }
        oneOfMapping[tagValue] = i2;
      }
    }
  }
};
discriminator.default = def;
var jsonSchema202012 = {};
const $schema$7 = "https://json-schema.org/draft/2020-12/schema";
const $id$7 = "https://json-schema.org/draft/2020-12/schema";
const $vocabulary$7 = {
  "https://json-schema.org/draft/2020-12/vocab/core": true,
  "https://json-schema.org/draft/2020-12/vocab/applicator": true,
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": true,
  "https://json-schema.org/draft/2020-12/vocab/validation": true,
  "https://json-schema.org/draft/2020-12/vocab/meta-data": true,
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": true,
  "https://json-schema.org/draft/2020-12/vocab/content": true
};
const $dynamicAnchor$7 = "meta";
const title$7 = "Core and Validation specifications meta-schema";
const allOf = [
  {
    $ref: "meta/core"
  },
  {
    $ref: "meta/applicator"
  },
  {
    $ref: "meta/unevaluated"
  },
  {
    $ref: "meta/validation"
  },
  {
    $ref: "meta/meta-data"
  },
  {
    $ref: "meta/format-annotation"
  },
  {
    $ref: "meta/content"
  }
];
const type$7 = [
  "object",
  "boolean"
];
const $comment = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.";
const properties$7 = {
  definitions: {
    $comment: '"definitions" has been replaced by "$defs".',
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    deprecated: true,
    "default": {}
  },
  dependencies: {
    $comment: '"dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.',
    type: "object",
    additionalProperties: {
      anyOf: [
        {
          $dynamicRef: "#meta"
        },
        {
          $ref: "meta/validation#/$defs/stringArray"
        }
      ]
    },
    deprecated: true,
    "default": {}
  },
  $recursiveAnchor: {
    $comment: '"$recursiveAnchor" has been replaced by "$dynamicAnchor".',
    $ref: "meta/core#/$defs/anchorString",
    deprecated: true
  },
  $recursiveRef: {
    $comment: '"$recursiveRef" has been replaced by "$dynamicRef".',
    $ref: "meta/core#/$defs/uriReferenceString",
    deprecated: true
  }
};
const require$$0 = {
  $schema: $schema$7,
  $id: $id$7,
  $vocabulary: $vocabulary$7,
  $dynamicAnchor: $dynamicAnchor$7,
  title: title$7,
  allOf,
  type: type$7,
  $comment,
  properties: properties$7
};
const $schema$6 = "https://json-schema.org/draft/2020-12/schema";
const $id$6 = "https://json-schema.org/draft/2020-12/meta/applicator";
const $vocabulary$6 = {
  "https://json-schema.org/draft/2020-12/vocab/applicator": true
};
const $dynamicAnchor$6 = "meta";
const title$6 = "Applicator vocabulary meta-schema";
const type$6 = [
  "object",
  "boolean"
];
const properties$6 = {
  prefixItems: {
    $ref: "#/$defs/schemaArray"
  },
  items: {
    $dynamicRef: "#meta"
  },
  contains: {
    $dynamicRef: "#meta"
  },
  additionalProperties: {
    $dynamicRef: "#meta"
  },
  properties: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    "default": {}
  },
  patternProperties: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    propertyNames: {
      format: "regex"
    },
    "default": {}
  },
  dependentSchemas: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    "default": {}
  },
  propertyNames: {
    $dynamicRef: "#meta"
  },
  "if": {
    $dynamicRef: "#meta"
  },
  then: {
    $dynamicRef: "#meta"
  },
  "else": {
    $dynamicRef: "#meta"
  },
  allOf: {
    $ref: "#/$defs/schemaArray"
  },
  anyOf: {
    $ref: "#/$defs/schemaArray"
  },
  oneOf: {
    $ref: "#/$defs/schemaArray"
  },
  not: {
    $dynamicRef: "#meta"
  }
};
const $defs$2 = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $dynamicRef: "#meta"
    }
  }
};
const require$$1 = {
  $schema: $schema$6,
  $id: $id$6,
  $vocabulary: $vocabulary$6,
  $dynamicAnchor: $dynamicAnchor$6,
  title: title$6,
  type: type$6,
  properties: properties$6,
  $defs: $defs$2
};
const $schema$5 = "https://json-schema.org/draft/2020-12/schema";
const $id$5 = "https://json-schema.org/draft/2020-12/meta/unevaluated";
const $vocabulary$5 = {
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": true
};
const $dynamicAnchor$5 = "meta";
const title$5 = "Unevaluated applicator vocabulary meta-schema";
const type$5 = [
  "object",
  "boolean"
];
const properties$5 = {
  unevaluatedItems: {
    $dynamicRef: "#meta"
  },
  unevaluatedProperties: {
    $dynamicRef: "#meta"
  }
};
const require$$2 = {
  $schema: $schema$5,
  $id: $id$5,
  $vocabulary: $vocabulary$5,
  $dynamicAnchor: $dynamicAnchor$5,
  title: title$5,
  type: type$5,
  properties: properties$5
};
const $schema$4 = "https://json-schema.org/draft/2020-12/schema";
const $id$4 = "https://json-schema.org/draft/2020-12/meta/content";
const $vocabulary$4 = {
  "https://json-schema.org/draft/2020-12/vocab/content": true
};
const $dynamicAnchor$4 = "meta";
const title$4 = "Content vocabulary meta-schema";
const type$4 = [
  "object",
  "boolean"
];
const properties$4 = {
  contentEncoding: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentSchema: {
    $dynamicRef: "#meta"
  }
};
const require$$3 = {
  $schema: $schema$4,
  $id: $id$4,
  $vocabulary: $vocabulary$4,
  $dynamicAnchor: $dynamicAnchor$4,
  title: title$4,
  type: type$4,
  properties: properties$4
};
const $schema$3 = "https://json-schema.org/draft/2020-12/schema";
const $id$3 = "https://json-schema.org/draft/2020-12/meta/core";
const $vocabulary$3 = {
  "https://json-schema.org/draft/2020-12/vocab/core": true
};
const $dynamicAnchor$3 = "meta";
const title$3 = "Core vocabulary meta-schema";
const type$3 = [
  "object",
  "boolean"
];
const properties$3 = {
  $id: {
    $ref: "#/$defs/uriReferenceString",
    $comment: "Non-empty fragments not allowed.",
    pattern: "^[^#]*#?$"
  },
  $schema: {
    $ref: "#/$defs/uriString"
  },
  $ref: {
    $ref: "#/$defs/uriReferenceString"
  },
  $anchor: {
    $ref: "#/$defs/anchorString"
  },
  $dynamicRef: {
    $ref: "#/$defs/uriReferenceString"
  },
  $dynamicAnchor: {
    $ref: "#/$defs/anchorString"
  },
  $vocabulary: {
    type: "object",
    propertyNames: {
      $ref: "#/$defs/uriString"
    },
    additionalProperties: {
      type: "boolean"
    }
  },
  $comment: {
    type: "string"
  },
  $defs: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    }
  }
};
const $defs$1 = {
  anchorString: {
    type: "string",
    pattern: "^[A-Za-z_][-A-Za-z0-9._]*$"
  },
  uriString: {
    type: "string",
    format: "uri"
  },
  uriReferenceString: {
    type: "string",
    format: "uri-reference"
  }
};
const require$$4 = {
  $schema: $schema$3,
  $id: $id$3,
  $vocabulary: $vocabulary$3,
  $dynamicAnchor: $dynamicAnchor$3,
  title: title$3,
  type: type$3,
  properties: properties$3,
  $defs: $defs$1
};
const $schema$2 = "https://json-schema.org/draft/2020-12/schema";
const $id$2 = "https://json-schema.org/draft/2020-12/meta/format-annotation";
const $vocabulary$2 = {
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": true
};
const $dynamicAnchor$2 = "meta";
const title$2 = "Format vocabulary meta-schema for annotation results";
const type$2 = [
  "object",
  "boolean"
];
const properties$2 = {
  format: {
    type: "string"
  }
};
const require$$5 = {
  $schema: $schema$2,
  $id: $id$2,
  $vocabulary: $vocabulary$2,
  $dynamicAnchor: $dynamicAnchor$2,
  title: title$2,
  type: type$2,
  properties: properties$2
};
const $schema$1 = "https://json-schema.org/draft/2020-12/schema";
const $id$1 = "https://json-schema.org/draft/2020-12/meta/meta-data";
const $vocabulary$1 = {
  "https://json-schema.org/draft/2020-12/vocab/meta-data": true
};
const $dynamicAnchor$1 = "meta";
const title$1 = "Meta-data vocabulary meta-schema";
const type$1 = [
  "object",
  "boolean"
];
const properties$1 = {
  title: {
    type: "string"
  },
  description: {
    type: "string"
  },
  "default": true,
  deprecated: {
    type: "boolean",
    "default": false
  },
  readOnly: {
    type: "boolean",
    "default": false
  },
  writeOnly: {
    type: "boolean",
    "default": false
  },
  examples: {
    type: "array",
    items: true
  }
};
const require$$6 = {
  $schema: $schema$1,
  $id: $id$1,
  $vocabulary: $vocabulary$1,
  $dynamicAnchor: $dynamicAnchor$1,
  title: title$1,
  type: type$1,
  properties: properties$1
};
const $schema = "https://json-schema.org/draft/2020-12/schema";
const $id = "https://json-schema.org/draft/2020-12/meta/validation";
const $vocabulary = {
  "https://json-schema.org/draft/2020-12/vocab/validation": true
};
const $dynamicAnchor = "meta";
const title = "Validation vocabulary meta-schema";
const type = [
  "object",
  "boolean"
];
const properties = {
  type: {
    anyOf: [
      {
        $ref: "#/$defs/simpleTypes"
      },
      {
        type: "array",
        items: {
          $ref: "#/$defs/simpleTypes"
        },
        minItems: 1,
        uniqueItems: true
      }
    ]
  },
  "const": true,
  "enum": {
    type: "array",
    items: true
  },
  multipleOf: {
    type: "number",
    exclusiveMinimum: 0
  },
  maximum: {
    type: "number"
  },
  exclusiveMaximum: {
    type: "number"
  },
  minimum: {
    type: "number"
  },
  exclusiveMinimum: {
    type: "number"
  },
  maxLength: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minLength: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  pattern: {
    type: "string",
    format: "regex"
  },
  maxItems: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minItems: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  uniqueItems: {
    type: "boolean",
    "default": false
  },
  maxContains: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minContains: {
    $ref: "#/$defs/nonNegativeInteger",
    "default": 1
  },
  maxProperties: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minProperties: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  required: {
    $ref: "#/$defs/stringArray"
  },
  dependentRequired: {
    type: "object",
    additionalProperties: {
      $ref: "#/$defs/stringArray"
    }
  }
};
const $defs = {
  nonNegativeInteger: {
    type: "integer",
    minimum: 0
  },
  nonNegativeIntegerDefault0: {
    $ref: "#/$defs/nonNegativeInteger",
    "default": 0
  },
  simpleTypes: {
    "enum": [
      "array",
      "boolean",
      "integer",
      "null",
      "number",
      "object",
      "string"
    ]
  },
  stringArray: {
    type: "array",
    items: {
      type: "string"
    },
    uniqueItems: true,
    "default": []
  }
};
const require$$7 = {
  $schema,
  $id,
  $vocabulary,
  $dynamicAnchor,
  title,
  type,
  properties,
  $defs
};
Object.defineProperty(jsonSchema202012, "__esModule", { value: true });
const metaSchema = require$$0;
const applicator = require$$1;
const unevaluated = require$$2;
const content = require$$3;
const core = require$$4;
const format = require$$5;
const metadata = require$$6;
const validation = require$$7;
const META_SUPPORT_DATA = ["/properties"];
function addMetaSchema2020($data) {
  [
    metaSchema,
    applicator,
    unevaluated,
    content,
    core,
    with$data(this, format),
    metadata,
    with$data(this, validation)
  ].forEach((sch) => this.addMetaSchema(sch, void 0, false));
  return this;
  function with$data(ajv, sch) {
    return $data ? ajv.$dataMetaSchema(sch, META_SUPPORT_DATA) : sch;
  }
}
jsonSchema202012.default = addMetaSchema2020;
(function(module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.MissingRefError = exports.ValidationError = exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = exports.Ajv2020 = void 0;
  const core_12 = core$3;
  const draft2020_1 = draft2020;
  const discriminator_1 = discriminator;
  const json_schema_2020_12_1 = jsonSchema202012;
  const META_SCHEMA_ID = "https://json-schema.org/draft/2020-12/schema";
  class Ajv2020 extends core_12.default {
    constructor(opts = {}) {
      super({
        ...opts,
        dynamicRef: true,
        next: true,
        unevaluated: true
      });
    }
    _addVocabularies() {
      super._addVocabularies();
      draft2020_1.default.forEach((v) => this.addVocabulary(v));
      if (this.opts.discriminator)
        this.addKeyword(discriminator_1.default);
    }
    _addDefaultMetaSchema() {
      super._addDefaultMetaSchema();
      const { $data, meta } = this.opts;
      if (!meta)
        return;
      json_schema_2020_12_1.default.call(this, $data);
      this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID;
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : void 0);
    }
  }
  exports.Ajv2020 = Ajv2020;
  module.exports = exports = Ajv2020;
  module.exports.Ajv2020 = Ajv2020;
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.default = Ajv2020;
  var validate_12 = validate;
  Object.defineProperty(exports, "KeywordCxt", { enumerable: true, get: function() {
    return validate_12.KeywordCxt;
  } });
  var codegen_12 = codegen;
  Object.defineProperty(exports, "_", { enumerable: true, get: function() {
    return codegen_12._;
  } });
  Object.defineProperty(exports, "str", { enumerable: true, get: function() {
    return codegen_12.str;
  } });
  Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
    return codegen_12.stringify;
  } });
  Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
    return codegen_12.nil;
  } });
  Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
    return codegen_12.Name;
  } });
  Object.defineProperty(exports, "CodeGen", { enumerable: true, get: function() {
    return codegen_12.CodeGen;
  } });
  var validation_error_12 = validation_error;
  Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function() {
    return validation_error_12.default;
  } });
  var ref_error_12 = ref_error;
  Object.defineProperty(exports, "MissingRefError", { enumerable: true, get: function() {
    return ref_error_12.default;
  } });
})(_2020, _2020.exports);
var _2020Exports = _2020.exports;
const Ajv = /* @__PURE__ */ getDefaultExportFromCjs(_2020Exports);
function addDays(date, amount) {
  const _date = toDate(date);
  if (isNaN(amount)) return constructFrom(date, NaN);
  if (!amount) {
    return _date;
  }
  _date.setDate(_date.getDate() + amount);
  return _date;
}
function addMonths(date, amount) {
  const _date = toDate(date);
  if (isNaN(amount)) return constructFrom(date, NaN);
  if (!amount) {
    return _date;
  }
  const dayOfMonth = _date.getDate();
  const endOfDesiredMonth = constructFrom(date, _date.getTime());
  endOfDesiredMonth.setMonth(_date.getMonth() + amount + 1, 0);
  const daysInMonth = endOfDesiredMonth.getDate();
  if (dayOfMonth >= daysInMonth) {
    return endOfDesiredMonth;
  } else {
    _date.setFullYear(
      endOfDesiredMonth.getFullYear(),
      endOfDesiredMonth.getMonth(),
      dayOfMonth
    );
    return _date;
  }
}
function addYears(date, amount) {
  return addMonths(date, amount * 12);
}
function subDays(date, amount) {
  return addDays(date, -amount);
}
function subMonths(date, amount) {
  return addMonths(date, -amount);
}
function subYears(date, amount) {
  return addYears(date, -amount);
}
const scriptRel = "modulepreload";
const assetsURL = function(dep) {
  return "/" + dep;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (deps && deps.length > 0) {
    document.getElementsByTagName("link");
    const cspNonceMeta = document.querySelector(
      "meta[property=csp-nonce]"
    );
    const cspNonce = (cspNonceMeta == null ? void 0 : cspNonceMeta.nonce) || (cspNonceMeta == null ? void 0 : cspNonceMeta.getAttribute("nonce"));
    promise = Promise.allSettled(
      deps.map((dep) => {
        dep = assetsURL(dep);
        if (dep in seen) return;
        seen[dep] = true;
        const isCss = dep.endsWith(".css");
        const cssSelector = isCss ? '[rel="stylesheet"]' : "";
        if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
          return;
        }
        const link = document.createElement("link");
        link.rel = isCss ? "stylesheet" : scriptRel;
        if (!isCss) {
          link.as = "script";
        }
        link.crossOrigin = "";
        link.href = dep;
        if (cspNonce) {
          link.setAttribute("nonce", cspNonce);
        }
        document.head.appendChild(link);
        if (isCss) {
          return new Promise((res, rej) => {
            link.addEventListener("load", res);
            link.addEventListener(
              "error",
              () => rej(new Error(`Unable to preload CSS for ${dep}`))
            );
          });
        }
      })
    );
  }
  function handlePreloadError(err) {
    const e = new Event("vite:preloadError", {
      cancelable: true
    });
    e.payload = err;
    window.dispatchEvent(e);
    if (!e.defaultPrevented) {
      throw err;
    }
  }
  return promise.then((res) => {
    for (const item of res || []) {
      if (item.status !== "rejected") continue;
      handlePreloadError(item.reason);
    }
    return baseModule().catch(handlePreloadError);
  });
};
var browserPolyfill = {};
var hasRequiredBrowserPolyfill;
function requireBrowserPolyfill() {
  if (hasRequiredBrowserPolyfill) return browserPolyfill;
  hasRequiredBrowserPolyfill = 1;
  (function() {
    (function(self2) {
      (function(exports) {
        var support = {
          searchParams: "URLSearchParams" in self2,
          iterable: "Symbol" in self2 && "iterator" in Symbol,
          blob: "FileReader" in self2 && "Blob" in self2 && function() {
            try {
              new Blob();
              return true;
            } catch (e) {
              return false;
            }
          }(),
          formData: "FormData" in self2,
          arrayBuffer: "ArrayBuffer" in self2
        };
        function isDataView(obj) {
          return obj && DataView.prototype.isPrototypeOf(obj);
        }
        if (support.arrayBuffer) {
          var viewClasses = [
            "[object Int8Array]",
            "[object Uint8Array]",
            "[object Uint8ClampedArray]",
            "[object Int16Array]",
            "[object Uint16Array]",
            "[object Int32Array]",
            "[object Uint32Array]",
            "[object Float32Array]",
            "[object Float64Array]"
          ];
          var isArrayBufferView = ArrayBuffer.isView || function(obj) {
            return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1;
          };
        }
        function normalizeName(name) {
          if (typeof name !== "string") {
            name = String(name);
          }
          if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
            throw new TypeError("Invalid character in header field name");
          }
          return name.toLowerCase();
        }
        function normalizeValue(value) {
          if (typeof value !== "string") {
            value = String(value);
          }
          return value;
        }
        function iteratorFor(items2) {
          var iterator = {
            next: function() {
              var value = items2.shift();
              return { done: value === void 0, value };
            }
          };
          if (support.iterable) {
            iterator[Symbol.iterator] = function() {
              return iterator;
            };
          }
          return iterator;
        }
        function Headers(headers) {
          this.map = {};
          if (headers instanceof Headers) {
            headers.forEach(function(value, name) {
              this.append(name, value);
            }, this);
          } else if (Array.isArray(headers)) {
            headers.forEach(function(header) {
              this.append(header[0], header[1]);
            }, this);
          } else if (headers) {
            Object.getOwnPropertyNames(headers).forEach(function(name) {
              this.append(name, headers[name]);
            }, this);
          }
        }
        Headers.prototype.append = function(name, value) {
          name = normalizeName(name);
          value = normalizeValue(value);
          var oldValue = this.map[name];
          this.map[name] = oldValue ? oldValue + ", " + value : value;
        };
        Headers.prototype["delete"] = function(name) {
          delete this.map[normalizeName(name)];
        };
        Headers.prototype.get = function(name) {
          name = normalizeName(name);
          return this.has(name) ? this.map[name] : null;
        };
        Headers.prototype.has = function(name) {
          return this.map.hasOwnProperty(normalizeName(name));
        };
        Headers.prototype.set = function(name, value) {
          this.map[normalizeName(name)] = normalizeValue(value);
        };
        Headers.prototype.forEach = function(callback, thisArg) {
          for (var name in this.map) {
            if (this.map.hasOwnProperty(name)) {
              callback.call(thisArg, this.map[name], name, this);
            }
          }
        };
        Headers.prototype.keys = function() {
          var items2 = [];
          this.forEach(function(value, name) {
            items2.push(name);
          });
          return iteratorFor(items2);
        };
        Headers.prototype.values = function() {
          var items2 = [];
          this.forEach(function(value) {
            items2.push(value);
          });
          return iteratorFor(items2);
        };
        Headers.prototype.entries = function() {
          var items2 = [];
          this.forEach(function(value, name) {
            items2.push([name, value]);
          });
          return iteratorFor(items2);
        };
        if (support.iterable) {
          Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
        }
        function consumed(body) {
          if (body.bodyUsed) {
            return Promise.reject(new TypeError("Already read"));
          }
          body.bodyUsed = true;
        }
        function fileReaderReady(reader) {
          return new Promise(function(resolve2, reject) {
            reader.onload = function() {
              resolve2(reader.result);
            };
            reader.onerror = function() {
              reject(reader.error);
            };
          });
        }
        function readBlobAsArrayBuffer(blob) {
          var reader = new FileReader();
          var promise = fileReaderReady(reader);
          reader.readAsArrayBuffer(blob);
          return promise;
        }
        function readBlobAsText(blob) {
          var reader = new FileReader();
          var promise = fileReaderReady(reader);
          reader.readAsText(blob);
          return promise;
        }
        function readArrayBufferAsText(buf) {
          var view = new Uint8Array(buf);
          var chars = new Array(view.length);
          for (var i2 = 0; i2 < view.length; i2++) {
            chars[i2] = String.fromCharCode(view[i2]);
          }
          return chars.join("");
        }
        function bufferClone(buf) {
          if (buf.slice) {
            return buf.slice(0);
          } else {
            var view = new Uint8Array(buf.byteLength);
            view.set(new Uint8Array(buf));
            return view.buffer;
          }
        }
        function Body() {
          this.bodyUsed = false;
          this._initBody = function(body) {
            this._bodyInit = body;
            if (!body) {
              this._bodyText = "";
            } else if (typeof body === "string") {
              this._bodyText = body;
            } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
              this._bodyBlob = body;
            } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
              this._bodyFormData = body;
            } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
              this._bodyText = body.toString();
            } else if (support.arrayBuffer && support.blob && isDataView(body)) {
              this._bodyArrayBuffer = bufferClone(body.buffer);
              this._bodyInit = new Blob([this._bodyArrayBuffer]);
            } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
              this._bodyArrayBuffer = bufferClone(body);
            } else {
              this._bodyText = body = Object.prototype.toString.call(body);
            }
            if (!this.headers.get("content-type")) {
              if (typeof body === "string") {
                this.headers.set("content-type", "text/plain;charset=UTF-8");
              } else if (this._bodyBlob && this._bodyBlob.type) {
                this.headers.set("content-type", this._bodyBlob.type);
              } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
                this.headers.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8");
              }
            }
          };
          if (support.blob) {
            this.blob = function() {
              var rejected = consumed(this);
              if (rejected) {
                return rejected;
              }
              if (this._bodyBlob) {
                return Promise.resolve(this._bodyBlob);
              } else if (this._bodyArrayBuffer) {
                return Promise.resolve(new Blob([this._bodyArrayBuffer]));
              } else if (this._bodyFormData) {
                throw new Error("could not read FormData body as blob");
              } else {
                return Promise.resolve(new Blob([this._bodyText]));
              }
            };
            this.arrayBuffer = function() {
              if (this._bodyArrayBuffer) {
                return consumed(this) || Promise.resolve(this._bodyArrayBuffer);
              } else {
                return this.blob().then(readBlobAsArrayBuffer);
              }
            };
          }
          this.text = function() {
            var rejected = consumed(this);
            if (rejected) {
              return rejected;
            }
            if (this._bodyBlob) {
              return readBlobAsText(this._bodyBlob);
            } else if (this._bodyArrayBuffer) {
              return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer));
            } else if (this._bodyFormData) {
              throw new Error("could not read FormData body as text");
            } else {
              return Promise.resolve(this._bodyText);
            }
          };
          if (support.formData) {
            this.formData = function() {
              return this.text().then(decode);
            };
          }
          this.json = function() {
            return this.text().then(JSON.parse);
          };
          return this;
        }
        var methods = ["DELETE", "GET", "HEAD", "OPTIONS", "POST", "PUT"];
        function normalizeMethod(method) {
          var upcased = method.toUpperCase();
          return methods.indexOf(upcased) > -1 ? upcased : method;
        }
        function Request(input, options) {
          options = options || {};
          var body = options.body;
          if (input instanceof Request) {
            if (input.bodyUsed) {
              throw new TypeError("Already read");
            }
            this.url = input.url;
            this.credentials = input.credentials;
            if (!options.headers) {
              this.headers = new Headers(input.headers);
            }
            this.method = input.method;
            this.mode = input.mode;
            this.signal = input.signal;
            if (!body && input._bodyInit != null) {
              body = input._bodyInit;
              input.bodyUsed = true;
            }
          } else {
            this.url = String(input);
          }
          this.credentials = options.credentials || this.credentials || "same-origin";
          if (options.headers || !this.headers) {
            this.headers = new Headers(options.headers);
          }
          this.method = normalizeMethod(options.method || this.method || "GET");
          this.mode = options.mode || this.mode || null;
          this.signal = options.signal || this.signal;
          this.referrer = null;
          if ((this.method === "GET" || this.method === "HEAD") && body) {
            throw new TypeError("Body not allowed for GET or HEAD requests");
          }
          this._initBody(body);
        }
        Request.prototype.clone = function() {
          return new Request(this, { body: this._bodyInit });
        };
        function decode(body) {
          var form = new FormData();
          body.trim().split("&").forEach(function(bytes) {
            if (bytes) {
              var split = bytes.split("=");
              var name = split.shift().replace(/\+/g, " ");
              var value = split.join("=").replace(/\+/g, " ");
              form.append(decodeURIComponent(name), decodeURIComponent(value));
            }
          });
          return form;
        }
        function parseHeaders(rawHeaders) {
          var headers = new Headers();
          var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, " ");
          preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
            var parts = line.split(":");
            var key = parts.shift().trim();
            if (key) {
              var value = parts.join(":").trim();
              headers.append(key, value);
            }
          });
          return headers;
        }
        Body.call(Request.prototype);
        function Response2(bodyInit, options) {
          if (!options) {
            options = {};
          }
          this.type = "default";
          this.status = options.status === void 0 ? 200 : options.status;
          this.ok = this.status >= 200 && this.status < 300;
          this.statusText = "statusText" in options ? options.statusText : "OK";
          this.headers = new Headers(options.headers);
          this.url = options.url || "";
          this._initBody(bodyInit);
        }
        Body.call(Response2.prototype);
        Response2.prototype.clone = function() {
          return new Response2(this._bodyInit, {
            status: this.status,
            statusText: this.statusText,
            headers: new Headers(this.headers),
            url: this.url
          });
        };
        Response2.error = function() {
          var response = new Response2(null, { status: 0, statusText: "" });
          response.type = "error";
          return response;
        };
        var redirectStatuses = [301, 302, 303, 307, 308];
        Response2.redirect = function(url, status) {
          if (redirectStatuses.indexOf(status) === -1) {
            throw new RangeError("Invalid status code");
          }
          return new Response2(null, { status, headers: { location: url } });
        };
        exports.DOMException = self2.DOMException;
        try {
          new exports.DOMException();
        } catch (err) {
          exports.DOMException = function(message, name) {
            this.message = message;
            this.name = name;
            var error2 = Error(message);
            this.stack = error2.stack;
          };
          exports.DOMException.prototype = Object.create(Error.prototype);
          exports.DOMException.prototype.constructor = exports.DOMException;
        }
        function fetch2(input, init) {
          return new Promise(function(resolve2, reject) {
            var request = new Request(input, init);
            if (request.signal && request.signal.aborted) {
              return reject(new exports.DOMException("Aborted", "AbortError"));
            }
            var xhr = new XMLHttpRequest();
            function abortXhr() {
              xhr.abort();
            }
            xhr.onload = function() {
              var options = {
                status: xhr.status,
                statusText: xhr.statusText,
                headers: parseHeaders(xhr.getAllResponseHeaders() || "")
              };
              options.url = "responseURL" in xhr ? xhr.responseURL : options.headers.get("X-Request-URL");
              var body = "response" in xhr ? xhr.response : xhr.responseText;
              resolve2(new Response2(body, options));
            };
            xhr.onerror = function() {
              reject(new TypeError("Network request failed"));
            };
            xhr.ontimeout = function() {
              reject(new TypeError("Network request failed"));
            };
            xhr.onabort = function() {
              reject(new exports.DOMException("Aborted", "AbortError"));
            };
            xhr.open(request.method, request.url, true);
            if (request.credentials === "include") {
              xhr.withCredentials = true;
            } else if (request.credentials === "omit") {
              xhr.withCredentials = false;
            }
            if ("responseType" in xhr && support.blob) {
              xhr.responseType = "blob";
            }
            request.headers.forEach(function(value, name) {
              xhr.setRequestHeader(name, value);
            });
            if (request.signal) {
              request.signal.addEventListener("abort", abortXhr);
              xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                  request.signal.removeEventListener("abort", abortXhr);
                }
              };
            }
            xhr.send(typeof request._bodyInit === "undefined" ? null : request._bodyInit);
          });
        }
        fetch2.polyfill = true;
        if (!self2.fetch) {
          self2.fetch = fetch2;
          self2.Headers = Headers;
          self2.Request = Request;
          self2.Response = Response2;
        }
        exports.Headers = Headers;
        exports.Request = Request;
        exports.Response = Response2;
        exports.fetch = fetch2;
        Object.defineProperty(exports, "__esModule", { value: true });
        return exports;
      })({});
    })(typeof self !== "undefined" ? self : commonjsGlobal);
  })();
  return browserPolyfill;
}
const TaskStatus = {
  TASK_SUCCEEDED: "succeeded",
  TASK_PROCESSING: "processing",
  TASK_FAILED: "failed",
  TASK_ENQUEUED: "enqueued",
  TASK_CANCELED: "canceled"
};
const ErrorStatusCode = {
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#index_creation_failed */
  INDEX_CREATION_FAILED: "index_creation_failed",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#missing_index_uid */
  MISSING_INDEX_UID: "missing_index_uid",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#index_already_exists */
  INDEX_ALREADY_EXISTS: "index_already_exists",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#index_not_found */
  INDEX_NOT_FOUND: "index_not_found",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_index_uid */
  INVALID_INDEX_UID: "invalid_index_uid",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#index_not_accessible */
  INDEX_NOT_ACCESSIBLE: "index_not_accessible",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_index_offset */
  INVALID_INDEX_OFFSET: "invalid_index_offset",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_index_limit */
  INVALID_INDEX_LIMIT: "invalid_index_limit",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_state */
  INVALID_STATE: "invalid_state",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#primary_key_inference_failed */
  PRIMARY_KEY_INFERENCE_FAILED: "primary_key_inference_failed",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#index_primary_key_already_exists */
  INDEX_PRIMARY_KEY_ALREADY_EXISTS: "index_primary_key_already_exists",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_index_primary_key */
  INVALID_INDEX_PRIMARY_KEY: "invalid_index_primary_key",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#max_fields_limit_exceeded */
  DOCUMENTS_FIELDS_LIMIT_REACHED: "document_fields_limit_reached",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#missing_document_id */
  MISSING_DOCUMENT_ID: "missing_document_id",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#missing_document_id */
  INVALID_DOCUMENT_ID: "invalid_document_id",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_content_type */
  INVALID_CONTENT_TYPE: "invalid_content_type",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#missing_content_type */
  MISSING_CONTENT_TYPE: "missing_content_type",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_document_fields */
  INVALID_DOCUMENT_FIELDS: "invalid_document_fields",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_document_limit */
  INVALID_DOCUMENT_LIMIT: "invalid_document_limit",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_document_offset */
  INVALID_DOCUMENT_OFFSET: "invalid_document_offset",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_document_filter */
  INVALID_DOCUMENT_FILTER: "invalid_document_filter",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#missing_document_filter */
  MISSING_DOCUMENT_FILTER: "missing_document_filter",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_document_vectors_field */
  INVALID_DOCUMENT_VECTORS_FIELD: "invalid_document_vectors_field",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#payload_too_large */
  PAYLOAD_TOO_LARGE: "payload_too_large",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#missing_payload */
  MISSING_PAYLOAD: "missing_payload",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#malformed_payload */
  MALFORMED_PAYLOAD: "malformed_payload",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#no_space_left_on_device */
  NO_SPACE_LEFT_ON_DEVICE: "no_space_left_on_device",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_store_file */
  INVALID_STORE_FILE: "invalid_store_file",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_ranking_rules */
  INVALID_RANKING_RULES: "missing_document_id",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_request */
  INVALID_REQUEST: "invalid_request",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_document_geo_field */
  INVALID_DOCUMENT_GEO_FIELD: "invalid_document_geo_field",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_search_q */
  INVALID_SEARCH_Q: "invalid_search_q",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_search_offset */
  INVALID_SEARCH_OFFSET: "invalid_search_offset",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_search_limit */
  INVALID_SEARCH_LIMIT: "invalid_search_limit",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_search_page */
  INVALID_SEARCH_PAGE: "invalid_search_page",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_search_hits_per_page */
  INVALID_SEARCH_HITS_PER_PAGE: "invalid_search_hits_per_page",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_search_attributes_to_retrieve */
  INVALID_SEARCH_ATTRIBUTES_TO_RETRIEVE: "invalid_search_attributes_to_retrieve",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_search_attributes_to_crop */
  INVALID_SEARCH_ATTRIBUTES_TO_CROP: "invalid_search_attributes_to_crop",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_search_crop_length */
  INVALID_SEARCH_CROP_LENGTH: "invalid_search_crop_length",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_search_attributes_to_highlight */
  INVALID_SEARCH_ATTRIBUTES_TO_HIGHLIGHT: "invalid_search_attributes_to_highlight",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_search_show_matches_position */
  INVALID_SEARCH_SHOW_MATCHES_POSITION: "invalid_search_show_matches_position",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_search_filter */
  INVALID_SEARCH_FILTER: "invalid_search_filter",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_search_sort */
  INVALID_SEARCH_SORT: "invalid_search_sort",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_search_facets */
  INVALID_SEARCH_FACETS: "invalid_search_facets",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_search_highlight_pre_tag */
  INVALID_SEARCH_HIGHLIGHT_PRE_TAG: "invalid_search_highlight_pre_tag",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_search_highlight_post_tag */
  INVALID_SEARCH_HIGHLIGHT_POST_TAG: "invalid_search_highlight_post_tag",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_search_crop_marker */
  INVALID_SEARCH_CROP_MARKER: "invalid_search_crop_marker",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_search_matching_strategy */
  INVALID_SEARCH_MATCHING_STRATEGY: "invalid_search_matching_strategy",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_search_vector */
  INVALID_SEARCH_VECTOR: "invalid_search_vector",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_search_attributes_to_search_on */
  INVALID_SEARCH_ATTRIBUTES_TO_SEARCH_ON: "invalid_search_attributes_to_search_on",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#bad_request */
  BAD_REQUEST: "bad_request",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#document_not_found */
  DOCUMENT_NOT_FOUND: "document_not_found",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#internal */
  INTERNAL: "internal",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_api_key */
  INVALID_API_KEY: "invalid_api_key",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_api_key_description */
  INVALID_API_KEY_DESCRIPTION: "invalid_api_key_description",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_api_key_actions */
  INVALID_API_KEY_ACTIONS: "invalid_api_key_actions",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_api_key_indexes */
  INVALID_API_KEY_INDEXES: "invalid_api_key_indexes",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_api_key_expires_at */
  INVALID_API_KEY_EXPIRES_AT: "invalid_api_key_expires_at",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#api_key_not_found */
  API_KEY_NOT_FOUND: "api_key_not_found",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#immutable_api_key_uid */
  IMMUTABLE_API_KEY_UID: "immutable_api_key_uid",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#immutable_api_key_actions */
  IMMUTABLE_API_KEY_ACTIONS: "immutable_api_key_actions",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#immutable_api_key_indexes */
  IMMUTABLE_API_KEY_INDEXES: "immutable_api_key_indexes",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#immutable_api_key_expires_at */
  IMMUTABLE_API_KEY_EXPIRES_AT: "immutable_api_key_expires_at",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#immutable_api_key_created_at */
  IMMUTABLE_API_KEY_CREATED_AT: "immutable_api_key_created_at",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#immutable_api_key_updated_at */
  IMMUTABLE_API_KEY_UPDATED_AT: "immutable_api_key_updated_at",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#missing_authorization_header */
  MISSING_AUTHORIZATION_HEADER: "missing_authorization_header",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#unretrievable_document */
  UNRETRIEVABLE_DOCUMENT: "unretrievable_document",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#database_size_limit_reached */
  MAX_DATABASE_SIZE_LIMIT_REACHED: "database_size_limit_reached",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#task_not_found */
  TASK_NOT_FOUND: "task_not_found",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#dump_process_failed */
  DUMP_PROCESS_FAILED: "dump_process_failed",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#dump_not_found */
  DUMP_NOT_FOUND: "dump_not_found",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_swap_duplicate_index_found */
  INVALID_SWAP_DUPLICATE_INDEX_FOUND: "invalid_swap_duplicate_index_found",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_swap_indexes */
  INVALID_SWAP_INDEXES: "invalid_swap_indexes",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#missing_swap_indexes */
  MISSING_SWAP_INDEXES: "missing_swap_indexes",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#missing_master_key */
  MISSING_MASTER_KEY: "missing_master_key",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_task_types */
  INVALID_TASK_TYPES: "invalid_task_types",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_task_uids */
  INVALID_TASK_UIDS: "invalid_task_uids",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_task_statuses */
  INVALID_TASK_STATUSES: "invalid_task_statuses",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_task_limit */
  INVALID_TASK_LIMIT: "invalid_task_limit",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_task_from */
  INVALID_TASK_FROM: "invalid_task_from",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_task_canceled_by */
  INVALID_TASK_CANCELED_BY: "invalid_task_canceled_by",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#missing_task_filters */
  MISSING_TASK_FILTERS: "missing_task_filters",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#too_many_open_files */
  TOO_MANY_OPEN_FILES: "too_many_open_files",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#io_error */
  IO_ERROR: "io_error",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_task_index_uids */
  INVALID_TASK_INDEX_UIDS: "invalid_task_index_uids",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#immutable_index_uid */
  IMMUTABLE_INDEX_UID: "immutable_index_uid",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#immutable_index_created_at */
  IMMUTABLE_INDEX_CREATED_AT: "immutable_index_created_at",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#immutable_index_updated_at */
  IMMUTABLE_INDEX_UPDATED_AT: "immutable_index_updated_at",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_settings_displayed_attributes */
  INVALID_SETTINGS_DISPLAYED_ATTRIBUTES: "invalid_settings_displayed_attributes",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_settings_searchable_attributes */
  INVALID_SETTINGS_SEARCHABLE_ATTRIBUTES: "invalid_settings_searchable_attributes",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_settings_filterable_attributes */
  INVALID_SETTINGS_FILTERABLE_ATTRIBUTES: "invalid_settings_filterable_attributes",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_settings_sortable_attributes */
  INVALID_SETTINGS_SORTABLE_ATTRIBUTES: "invalid_settings_sortable_attributes",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_settings_ranking_rules */
  INVALID_SETTINGS_RANKING_RULES: "invalid_settings_ranking_rules",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_settings_stop_words */
  INVALID_SETTINGS_STOP_WORDS: "invalid_settings_stop_words",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_settings_synonyms */
  INVALID_SETTINGS_SYNONYMS: "invalid_settings_synonyms",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_settings_distinct_attribute */
  INVALID_SETTINGS_DISTINCT_ATTRIBUTE: "invalid_settings_distinct_attribute",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_settings_typo_tolerance */
  INVALID_SETTINGS_TYPO_TOLERANCE: "invalid_settings_typo_tolerance",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_settings_faceting */
  INVALID_SETTINGS_FACETING: "invalid_settings_faceting",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_settings_pagination */
  INVALID_SETTINGS_PAGINATION: "invalid_settings_pagination",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_settings_search_cutoff_ms */
  INVALID_SETTINGS_SEARCH_CUTOFF_MS: "invalid_settings_search_cutoff_ms",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_task_before_enqueued_at */
  INVALID_TASK_BEFORE_ENQUEUED_AT: "invalid_task_before_enqueued_at",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_task_after_enqueued_at */
  INVALID_TASK_AFTER_ENQUEUED_AT: "invalid_task_after_enqueued_at",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_task_before_started_at */
  INVALID_TASK_BEFORE_STARTED_AT: "invalid_task_before_started_at",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_task_after_started_at */
  INVALID_TASK_AFTER_STARTED_AT: "invalid_task_after_started_at",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_task_before_finished_at */
  INVALID_TASK_BEFORE_FINISHED_AT: "invalid_task_before_finished_at",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_task_after_finished_at */
  INVALID_TASK_AFTER_FINISHED_AT: "invalid_task_after_finished_at",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#missing_api_key_actions */
  MISSING_API_KEY_ACTIONS: "missing_api_key_actions",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#missing_api_key_indexes */
  MISSING_API_KEY_INDEXES: "missing_api_key_indexes",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#missing_api_key_expires_at */
  MISSING_API_KEY_EXPIRES_AT: "missing_api_key_expires_at",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_api_key_limit */
  INVALID_API_KEY_LIMIT: "invalid_api_key_limit",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_api_key_offset */
  INVALID_API_KEY_OFFSET: "invalid_api_key_offset",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_facet_search_facet_name */
  INVALID_FACET_SEARCH_FACET_NAME: "invalid_facet_search_facet_name",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#missing_facet_search_facet_name */
  MISSING_FACET_SEARCH_FACET_NAME: "missing_facet_search_facet_name",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_facet_search_facet_query */
  INVALID_FACET_SEARCH_FACET_QUERY: "invalid_facet_search_facet_query",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_search_ranking_score_threshold */
  INVALID_SEARCH_RANKING_SCORE_THRESHOLD: "invalid_search_ranking_score_threshold",
  /** @see https://www.meilisearch.com/docs/reference/errors/error_codes#invalid_similar_ranking_score_threshold */
  INVALID_SIMILAR_RANKING_SCORE_THRESHOLD: "invalid_similar_ranking_score_threshold"
};
class MeiliSearchError extends Error {
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, MeiliSearchError.prototype);
    this.name = "MeiliSearchError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MeiliSearchError);
    }
  }
}
class MeiliSearchCommunicationError extends MeiliSearchError {
  constructor(message, body, url, stack) {
    var _a, _b, _c;
    super(message);
    __publicField(this, "statusCode");
    __publicField(this, "errno");
    __publicField(this, "code");
    __publicField(this, "stack");
    Object.setPrototypeOf(this, MeiliSearchCommunicationError.prototype);
    this.name = "MeiliSearchCommunicationError";
    if (body instanceof Response) {
      this.message = body.statusText;
      this.statusCode = body.status;
    }
    if (body instanceof Error) {
      this.errno = body.errno;
      this.code = body.code;
    }
    if (stack) {
      this.stack = stack;
      this.stack = (_a = this.stack) == null ? void 0 : _a.replace(/(TypeError|FetchError)/, this.name);
      this.stack = (_b = this.stack) == null ? void 0 : _b.replace("Failed to fetch", `request to ${url} failed, reason: connect ECONNREFUSED`);
      this.stack = (_c = this.stack) == null ? void 0 : _c.replace("Not Found", `Not Found: ${url}`);
    } else {
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, MeiliSearchCommunicationError);
      }
    }
  }
}
const MeiliSearchApiError = class extends MeiliSearchError {
  constructor(error2, status) {
    super(error2.message);
    __publicField(this, "httpStatus");
    __publicField(this, "code");
    __publicField(this, "link");
    __publicField(this, "type");
    __publicField(this, "stack");
    Object.setPrototypeOf(this, MeiliSearchApiError.prototype);
    this.name = "MeiliSearchApiError";
    this.code = error2.code;
    this.type = error2.type;
    this.link = error2.link;
    this.message = error2.message;
    this.httpStatus = status;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MeiliSearchApiError);
    }
  }
};
async function httpResponseErrorHandler(response) {
  if (!response.ok) {
    let responseBody;
    try {
      responseBody = await response.json();
    } catch (e) {
      throw new MeiliSearchCommunicationError(response.statusText, response, response.url);
    }
    throw new MeiliSearchApiError(responseBody, response.status);
  }
  return response;
}
function httpErrorHandler(response, stack, url) {
  if (response.name !== "MeiliSearchApiError") {
    throw new MeiliSearchCommunicationError(response.message, response, url, stack);
  }
  throw response;
}
class MeiliSearchTimeOutError extends MeiliSearchError {
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, MeiliSearchTimeOutError.prototype);
    this.name = "MeiliSearchTimeOutError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MeiliSearchTimeOutError);
    }
  }
}
function versionErrorHintMessage(message, method) {
  return `${message}
Hint: It might not be working because maybe you're not up to date with the Meilisearch version that ${method} call requires.`;
}
function removeUndefinedFromObject(obj) {
  return Object.entries(obj).reduce((acc, curEntry) => {
    const [key, val] = curEntry;
    if (val !== void 0)
      acc[key] = val;
    return acc;
  }, {});
}
async function sleep(ms) {
  return await new Promise((resolve2) => setTimeout(resolve2, ms));
}
function addProtocolIfNotPresent(host) {
  if (!(host.startsWith("https://") || host.startsWith("http://"))) {
    return `http://${host}`;
  }
  return host;
}
function addTrailingSlash(url) {
  if (!url.endsWith("/")) {
    url += "/";
  }
  return url;
}
function validateUuid4(uuid) {
  const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
  return regexExp.test(uuid);
}
const PACKAGE_VERSION = "0.41.0";
function toQueryParams(parameters) {
  const params = Object.keys(parameters);
  const queryParams = params.reduce((acc, key) => {
    const value = parameters[key];
    if (value === void 0) {
      return acc;
    } else if (Array.isArray(value)) {
      return { ...acc, [key]: value.join(",") };
    } else if (value instanceof Date) {
      return { ...acc, [key]: value.toISOString() };
    }
    return { ...acc, [key]: value };
  }, {});
  return queryParams;
}
function constructHostURL(host) {
  try {
    host = addProtocolIfNotPresent(host);
    host = addTrailingSlash(host);
    return host;
  } catch (e) {
    throw new MeiliSearchError("The provided host is not valid.");
  }
}
function cloneAndParseHeaders(headers) {
  if (Array.isArray(headers)) {
    return headers.reduce((acc, headerPair) => {
      acc[headerPair[0]] = headerPair[1];
      return acc;
    }, {});
  } else if ("has" in headers) {
    const clonedHeaders = {};
    headers.forEach((value, key) => clonedHeaders[key] = value);
    return clonedHeaders;
  } else {
    return Object.assign({}, headers);
  }
}
function createHeaders(config) {
  var _a;
  const agentHeader = "X-Meilisearch-Client";
  const packageAgent = `Meilisearch JavaScript (v${PACKAGE_VERSION})`;
  const contentType = "Content-Type";
  const authorization = "Authorization";
  const headers = cloneAndParseHeaders(((_a = config.requestConfig) == null ? void 0 : _a.headers) ?? {});
  if (config.apiKey && !headers[authorization]) {
    headers[authorization] = `Bearer ${config.apiKey}`;
  }
  if (!headers[contentType]) {
    headers["Content-Type"] = "application/json";
  }
  if (config.clientAgents && Array.isArray(config.clientAgents)) {
    const clients = config.clientAgents.concat(packageAgent);
    headers[agentHeader] = clients.join(" ; ");
  } else if (config.clientAgents && !Array.isArray(config.clientAgents)) {
    throw new MeiliSearchError(`Meilisearch: The header "${agentHeader}" should be an array of string(s).
`);
  } else {
    headers[agentHeader] = packageAgent;
  }
  return headers;
}
class HttpRequests {
  constructor(config) {
    __publicField(this, "headers");
    __publicField(this, "url");
    __publicField(this, "requestConfig");
    __publicField(this, "httpClient");
    __publicField(this, "requestTimeout");
    this.headers = createHeaders(config);
    this.requestConfig = config.requestConfig;
    this.httpClient = config.httpClient;
    this.requestTimeout = config.timeout;
    try {
      const host = constructHostURL(config.host);
      this.url = new URL(host);
    } catch (e) {
      throw new MeiliSearchError("The provided host is not valid.");
    }
  }
  async request({ method, url, params, body, config = {} }) {
    var _a;
    if (typeof fetch === "undefined") {
      requireBrowserPolyfill();
    }
    const constructURL = new URL(url, this.url);
    if (params) {
      const queryParams = new URLSearchParams();
      Object.keys(params).filter((x) => params[x] !== null).map((x) => queryParams.set(x, params[x]));
      constructURL.search = queryParams.toString();
    }
    if (!((_a = config.headers) == null ? void 0 : _a["Content-Type"])) {
      body = JSON.stringify(body);
    }
    const headers = { ...this.headers, ...config.headers };
    try {
      const result = this.fetchWithTimeout(constructURL.toString(), {
        ...config,
        ...this.requestConfig,
        method,
        body,
        headers
      }, this.requestTimeout);
      if (this.httpClient) {
        return await result;
      }
      const response = await result.then((res) => httpResponseErrorHandler(res));
      const parsedBody = await response.json().catch(() => void 0);
      return parsedBody;
    } catch (e) {
      const stack = e.stack;
      httpErrorHandler(e, stack, constructURL.toString());
    }
  }
  async fetchWithTimeout(url, options, timeout) {
    return new Promise((resolve2, reject) => {
      const fetchFn = this.httpClient ? this.httpClient : fetch;
      const fetchPromise = fetchFn(url, options);
      const promises = [fetchPromise];
      let timeoutId;
      if (timeout) {
        const timeoutPromise = new Promise((_, reject2) => {
          timeoutId = setTimeout(() => {
            reject2(new Error("Error: Request Timed Out"));
          }, timeout);
        });
        promises.push(timeoutPromise);
      }
      Promise.race(promises).then(resolve2).catch(reject).finally(() => {
        clearTimeout(timeoutId);
      });
    });
  }
  async get(url, params, config) {
    return await this.request({
      method: "GET",
      url,
      params,
      config
    });
  }
  async post(url, data, params, config) {
    return await this.request({
      method: "POST",
      url,
      body: data,
      params,
      config
    });
  }
  async put(url, data, params, config) {
    return await this.request({
      method: "PUT",
      url,
      body: data,
      params,
      config
    });
  }
  async patch(url, data, params, config) {
    return await this.request({
      method: "PATCH",
      url,
      body: data,
      params,
      config
    });
  }
  async delete(url, data, params, config) {
    return await this.request({
      method: "DELETE",
      url,
      body: data,
      params,
      config
    });
  }
}
class EnqueuedTask {
  constructor(task) {
    __publicField(this, "taskUid");
    __publicField(this, "indexUid");
    __publicField(this, "status");
    __publicField(this, "type");
    __publicField(this, "enqueuedAt");
    this.taskUid = task.taskUid;
    this.indexUid = task.indexUid;
    this.status = task.status;
    this.type = task.type;
    this.enqueuedAt = new Date(task.enqueuedAt);
  }
}
class Task {
  constructor(task) {
    __publicField(this, "indexUid");
    __publicField(this, "status");
    __publicField(this, "type");
    __publicField(this, "uid");
    __publicField(this, "canceledBy");
    __publicField(this, "details");
    __publicField(this, "error");
    __publicField(this, "duration");
    __publicField(this, "startedAt");
    __publicField(this, "enqueuedAt");
    __publicField(this, "finishedAt");
    this.indexUid = task.indexUid;
    this.status = task.status;
    this.type = task.type;
    this.uid = task.uid;
    this.details = task.details;
    this.canceledBy = task.canceledBy;
    this.error = task.error;
    this.duration = task.duration;
    this.startedAt = new Date(task.startedAt);
    this.enqueuedAt = new Date(task.enqueuedAt);
    this.finishedAt = new Date(task.finishedAt);
  }
}
class TaskClient {
  constructor(config) {
    __publicField(this, "httpRequest");
    this.httpRequest = new HttpRequests(config);
  }
  /**
   * Get one task
   *
   * @param uid - Unique identifier of the task
   * @returns
   */
  async getTask(uid) {
    const url = `tasks/${uid}`;
    const taskItem = await this.httpRequest.get(url);
    return new Task(taskItem);
  }
  /**
   * Get tasks
   *
   * @param parameters - Parameters to browse the tasks
   * @returns Promise containing all tasks
   */
  async getTasks(parameters = {}) {
    const url = `tasks`;
    const tasks = await this.httpRequest.get(url, toQueryParams(parameters));
    return {
      ...tasks,
      results: tasks.results.map((task) => new Task(task))
    };
  }
  /**
   * Wait for a task to be processed.
   *
   * @param taskUid - Task identifier
   * @param options - Additional configuration options
   * @returns Promise returning a task after it has been processed
   */
  async waitForTask(taskUid, { timeOutMs = 5e3, intervalMs = 50 } = {}) {
    const startingTime = Date.now();
    while (Date.now() - startingTime < timeOutMs) {
      const response = await this.getTask(taskUid);
      if (![
        TaskStatus.TASK_ENQUEUED,
        TaskStatus.TASK_PROCESSING
      ].includes(response.status))
        return response;
      await sleep(intervalMs);
    }
    throw new MeiliSearchTimeOutError(`timeout of ${timeOutMs}ms has exceeded on process ${taskUid} when waiting a task to be resolved.`);
  }
  /**
   * Waits for multiple tasks to be processed
   *
   * @param taskUids - Tasks identifier list
   * @param options - Wait options
   * @returns Promise returning a list of tasks after they have been processed
   */
  async waitForTasks(taskUids, { timeOutMs = 5e3, intervalMs = 50 } = {}) {
    const tasks = [];
    for (const taskUid of taskUids) {
      const task = await this.waitForTask(taskUid, {
        timeOutMs,
        intervalMs
      });
      tasks.push(task);
    }
    return tasks;
  }
  /**
   * Cancel a list of enqueued or processing tasks.
   *
   * @param parameters - Parameters to filter the tasks.
   * @returns Promise containing an EnqueuedTask
   */
  async cancelTasks(parameters = {}) {
    const url = `tasks/cancel`;
    const task = await this.httpRequest.post(url, {}, toQueryParams(parameters));
    return new EnqueuedTask(task);
  }
  /**
   * Delete a list tasks.
   *
   * @param parameters - Parameters to filter the tasks.
   * @returns Promise containing an EnqueuedTask
   */
  async deleteTasks(parameters = {}) {
    const url = `tasks`;
    const task = await this.httpRequest.delete(url, {}, toQueryParams(parameters));
    return new EnqueuedTask(task);
  }
}
class Index {
  /**
   * @param config - Request configuration options
   * @param uid - UID of the index
   * @param primaryKey - Primary Key of the index
   */
  constructor(config, uid, primaryKey) {
    __publicField(this, "uid");
    __publicField(this, "primaryKey");
    __publicField(this, "createdAt");
    __publicField(this, "updatedAt");
    __publicField(this, "httpRequest");
    __publicField(this, "tasks");
    this.uid = uid;
    this.primaryKey = primaryKey;
    this.httpRequest = new HttpRequests(config);
    this.tasks = new TaskClient(config);
  }
  ///
  /// SEARCH
  ///
  /**
   * Search for documents into an index
   *
   * @param query - Query string
   * @param options - Search options
   * @param config - Additional request configuration options
   * @returns Promise containing the search response
   */
  async search(query, options, config) {
    const url = `indexes/${this.uid}/search`;
    return await this.httpRequest.post(url, removeUndefinedFromObject({ q: query, ...options }), void 0, config);
  }
  /**
   * Search for documents into an index using the GET method
   *
   * @param query - Query string
   * @param options - Search options
   * @param config - Additional request configuration options
   * @returns Promise containing the search response
   */
  async searchGet(query, options, config) {
    var _a, _b, _c, _d, _e, _f, _g;
    const url = `indexes/${this.uid}/search`;
    const parseFilter = (filter) => {
      if (typeof filter === "string")
        return filter;
      else if (Array.isArray(filter))
        throw new MeiliSearchError("The filter query parameter should be in string format when using searchGet");
      else
        return void 0;
    };
    const getParams = {
      q: query,
      ...options,
      filter: parseFilter(options == null ? void 0 : options.filter),
      sort: (_a = options == null ? void 0 : options.sort) == null ? void 0 : _a.join(","),
      facets: (_b = options == null ? void 0 : options.facets) == null ? void 0 : _b.join(","),
      attributesToRetrieve: (_c = options == null ? void 0 : options.attributesToRetrieve) == null ? void 0 : _c.join(","),
      attributesToCrop: (_d = options == null ? void 0 : options.attributesToCrop) == null ? void 0 : _d.join(","),
      attributesToHighlight: (_e = options == null ? void 0 : options.attributesToHighlight) == null ? void 0 : _e.join(","),
      vector: (_f = options == null ? void 0 : options.vector) == null ? void 0 : _f.join(","),
      attributesToSearchOn: (_g = options == null ? void 0 : options.attributesToSearchOn) == null ? void 0 : _g.join(",")
    };
    return await this.httpRequest.get(url, removeUndefinedFromObject(getParams), config);
  }
  /**
   * Search for facet values
   *
   * @param params - Parameters used to search on the facets
   * @param config - Additional request configuration options
   * @returns Promise containing the search response
   */
  async searchForFacetValues(params, config) {
    const url = `indexes/${this.uid}/facet-search`;
    return await this.httpRequest.post(url, removeUndefinedFromObject(params), void 0, config);
  }
  /**
   * Search for similar documents
   *
   * @param params - Parameters used to search for similar documents
   * @returns Promise containing the search response
   */
  async searchSimilarDocuments(params) {
    const url = `indexes/${this.uid}/similar`;
    return await this.httpRequest.post(url, removeUndefinedFromObject(params), void 0);
  }
  ///
  /// INDEX
  ///
  /**
   * Get index information.
   *
   * @returns Promise containing index information
   */
  async getRawInfo() {
    const url = `indexes/${this.uid}`;
    const res = await this.httpRequest.get(url);
    this.primaryKey = res.primaryKey;
    this.updatedAt = new Date(res.updatedAt);
    this.createdAt = new Date(res.createdAt);
    return res;
  }
  /**
   * Fetch and update Index information.
   *
   * @returns Promise to the current Index object with updated information
   */
  async fetchInfo() {
    await this.getRawInfo();
    return this;
  }
  /**
   * Get Primary Key.
   *
   * @returns Promise containing the Primary Key of the index
   */
  async fetchPrimaryKey() {
    this.primaryKey = (await this.getRawInfo()).primaryKey;
    return this.primaryKey;
  }
  /**
   * Create an index.
   *
   * @param uid - Unique identifier of the Index
   * @param options - Index options
   * @param config - Request configuration options
   * @returns Newly created Index object
   */
  static async create(uid, options = {}, config) {
    const url = `indexes`;
    const req = new HttpRequests(config);
    const task = await req.post(url, { ...options, uid });
    return new EnqueuedTask(task);
  }
  /**
   * Update an index.
   *
   * @param data - Data to update
   * @returns Promise to the current Index object with updated information
   */
  async update(data) {
    const url = `indexes/${this.uid}`;
    const task = await this.httpRequest.patch(url, data);
    task.enqueuedAt = new Date(task.enqueuedAt);
    return task;
  }
  /**
   * Delete an index.
   *
   * @returns Promise which resolves when index is deleted successfully
   */
  async delete() {
    const url = `indexes/${this.uid}`;
    const task = await this.httpRequest.delete(url);
    return new EnqueuedTask(task);
  }
  ///
  /// TASKS
  ///
  /**
   * Get the list of all the tasks of the index.
   *
   * @param parameters - Parameters to browse the tasks
   * @returns Promise containing all tasks
   */
  async getTasks(parameters = {}) {
    return await this.tasks.getTasks({ ...parameters, indexUids: [this.uid] });
  }
  /**
   * Get one task of the index.
   *
   * @param taskUid - Task identifier
   * @returns Promise containing a task
   */
  async getTask(taskUid) {
    return await this.tasks.getTask(taskUid);
  }
  /**
   * Wait for multiple tasks to be processed.
   *
   * @param taskUids - Tasks identifier
   * @param waitOptions - Options on timeout and interval
   * @returns Promise containing an array of tasks
   */
  async waitForTasks(taskUids, { timeOutMs = 5e3, intervalMs = 50 } = {}) {
    return await this.tasks.waitForTasks(taskUids, {
      timeOutMs,
      intervalMs
    });
  }
  /**
   * Wait for a task to be processed.
   *
   * @param taskUid - Task identifier
   * @param waitOptions - Options on timeout and interval
   * @returns Promise containing an array of tasks
   */
  async waitForTask(taskUid, { timeOutMs = 5e3, intervalMs = 50 } = {}) {
    return await this.tasks.waitForTask(taskUid, {
      timeOutMs,
      intervalMs
    });
  }
  ///
  /// STATS
  ///
  /**
   * Get stats of an index
   *
   * @returns Promise containing object with stats of the index
   */
  async getStats() {
    const url = `indexes/${this.uid}/stats`;
    return await this.httpRequest.get(url);
  }
  ///
  /// DOCUMENTS
  ///
  /**
   * Get documents of an index.
   *
   * @param parameters - Parameters to browse the documents. Parameters can
   *   contain the `filter` field only available in Meilisearch v1.2 and newer
   * @returns Promise containing the returned documents
   */
  async getDocuments(parameters = {}) {
    var _a;
    parameters = removeUndefinedFromObject(parameters);
    if (parameters.filter !== void 0) {
      try {
        const url = `indexes/${this.uid}/documents/fetch`;
        return await this.httpRequest.post(url, parameters);
      } catch (e) {
        if (e instanceof MeiliSearchCommunicationError) {
          e.message = versionErrorHintMessage(e.message, "getDocuments");
        } else if (e instanceof MeiliSearchApiError) {
          e.message = versionErrorHintMessage(e.message, "getDocuments");
        }
        throw e;
      }
    } else {
      const url = `indexes/${this.uid}/documents`;
      const fields = Array.isArray(parameters == null ? void 0 : parameters.fields) ? { fields: (_a = parameters == null ? void 0 : parameters.fields) == null ? void 0 : _a.join(",") } : {};
      return await this.httpRequest.get(url, {
        ...parameters,
        ...fields
      });
    }
  }
  /**
   * Get one document
   *
   * @param documentId - Document ID
   * @param parameters - Parameters applied on a document
   * @returns Promise containing Document response
   */
  async getDocument(documentId, parameters) {
    const url = `indexes/${this.uid}/documents/${documentId}`;
    const fields = (() => {
      var _a;
      if (Array.isArray(parameters == null ? void 0 : parameters.fields)) {
        return (_a = parameters == null ? void 0 : parameters.fields) == null ? void 0 : _a.join(",");
      }
      return void 0;
    })();
    return await this.httpRequest.get(url, removeUndefinedFromObject({
      ...parameters,
      fields
    }));
  }
  /**
   * Add or replace multiples documents to an index
   *
   * @param documents - Array of Document objects to add/replace
   * @param options - Options on document addition
   * @returns Promise containing an EnqueuedTask
   */
  async addDocuments(documents, options) {
    const url = `indexes/${this.uid}/documents`;
    const task = await this.httpRequest.post(url, documents, options);
    return new EnqueuedTask(task);
  }
  /**
   * Add or replace multiples documents in a string format to an index. It only
   * supports csv, ndjson and json formats.
   *
   * @param documents - Documents provided in a string to add/replace
   * @param contentType - Content type of your document:
   *   'text/csv'|'application/x-ndjson'|'application/json'
   * @param options - Options on document addition
   * @returns Promise containing an EnqueuedTask
   */
  async addDocumentsFromString(documents, contentType, queryParams) {
    const url = `indexes/${this.uid}/documents`;
    const task = await this.httpRequest.post(url, documents, queryParams, {
      headers: {
        "Content-Type": contentType
      }
    });
    return new EnqueuedTask(task);
  }
  /**
   * Add or replace multiples documents to an index in batches
   *
   * @param documents - Array of Document objects to add/replace
   * @param batchSize - Size of the batch
   * @param options - Options on document addition
   * @returns Promise containing array of enqueued task objects for each batch
   */
  async addDocumentsInBatches(documents, batchSize = 1e3, options) {
    const updates = [];
    for (let i2 = 0; i2 < documents.length; i2 += batchSize) {
      updates.push(await this.addDocuments(documents.slice(i2, i2 + batchSize), options));
    }
    return updates;
  }
  /**
   * Add or update multiples documents to an index
   *
   * @param documents - Array of Document objects to add/update
   * @param options - Options on document update
   * @returns Promise containing an EnqueuedTask
   */
  async updateDocuments(documents, options) {
    const url = `indexes/${this.uid}/documents`;
    const task = await this.httpRequest.put(url, documents, options);
    return new EnqueuedTask(task);
  }
  /**
   * Add or update multiples documents to an index in batches
   *
   * @param documents - Array of Document objects to add/update
   * @param batchSize - Size of the batch
   * @param options - Options on document update
   * @returns Promise containing array of enqueued task objects for each batch
   */
  async updateDocumentsInBatches(documents, batchSize = 1e3, options) {
    const updates = [];
    for (let i2 = 0; i2 < documents.length; i2 += batchSize) {
      updates.push(await this.updateDocuments(documents.slice(i2, i2 + batchSize), options));
    }
    return updates;
  }
  /**
   * Add or update multiples documents in a string format to an index. It only
   * supports csv, ndjson and json formats.
   *
   * @param documents - Documents provided in a string to add/update
   * @param contentType - Content type of your document:
   *   'text/csv'|'application/x-ndjson'|'application/json'
   * @param queryParams - Options on raw document addition
   * @returns Promise containing an EnqueuedTask
   */
  async updateDocumentsFromString(documents, contentType, queryParams) {
    const url = `indexes/${this.uid}/documents`;
    const task = await this.httpRequest.put(url, documents, queryParams, {
      headers: {
        "Content-Type": contentType
      }
    });
    return new EnqueuedTask(task);
  }
  /**
   * Delete one document
   *
   * @param documentId - Id of Document to delete
   * @returns Promise containing an EnqueuedTask
   */
  async deleteDocument(documentId) {
    const url = `indexes/${this.uid}/documents/${documentId}`;
    const task = await this.httpRequest.delete(url);
    task.enqueuedAt = new Date(task.enqueuedAt);
    return task;
  }
  /**
   * Delete multiples documents of an index.
   *
   * @param params - Params value can be:
   *
   *   - DocumentsDeletionQuery: An object containing the parameters to customize
   *       your document deletion. Only available in Meilisearch v1.2 and newer
   *   - DocumentsIds: An array of document ids to delete
   *
   * @returns Promise containing an EnqueuedTask
   */
  async deleteDocuments(params) {
    const isDocumentsDeletionQuery = !Array.isArray(params) && typeof params === "object";
    const endpoint = isDocumentsDeletionQuery ? "documents/delete" : "documents/delete-batch";
    const url = `indexes/${this.uid}/${endpoint}`;
    try {
      const task = await this.httpRequest.post(url, params);
      return new EnqueuedTask(task);
    } catch (e) {
      if (e instanceof MeiliSearchCommunicationError && isDocumentsDeletionQuery) {
        e.message = versionErrorHintMessage(e.message, "deleteDocuments");
      } else if (e instanceof MeiliSearchApiError) {
        e.message = versionErrorHintMessage(e.message, "deleteDocuments");
      }
      throw e;
    }
  }
  /**
   * Delete all documents of an index
   *
   * @returns Promise containing an EnqueuedTask
   */
  async deleteAllDocuments() {
    const url = `indexes/${this.uid}/documents`;
    const task = await this.httpRequest.delete(url);
    task.enqueuedAt = new Date(task.enqueuedAt);
    return task;
  }
  ///
  /// SETTINGS
  ///
  /**
   * Retrieve all settings
   *
   * @returns Promise containing Settings object
   */
  async getSettings() {
    const url = `indexes/${this.uid}/settings`;
    return await this.httpRequest.get(url);
  }
  /**
   * Update all settings Any parameters not provided will be left unchanged.
   *
   * @param settings - Object containing parameters with their updated values
   * @returns Promise containing an EnqueuedTask
   */
  async updateSettings(settings) {
    const url = `indexes/${this.uid}/settings`;
    const task = await this.httpRequest.patch(url, settings);
    task.enqueued = new Date(task.enqueuedAt);
    return task;
  }
  /**
   * Reset settings.
   *
   * @returns Promise containing an EnqueuedTask
   */
  async resetSettings() {
    const url = `indexes/${this.uid}/settings`;
    const task = await this.httpRequest.delete(url);
    task.enqueuedAt = new Date(task.enqueuedAt);
    return task;
  }
  ///
  /// PAGINATION SETTINGS
  ///
  /**
   * Get the pagination settings.
   *
   * @returns Promise containing object of pagination settings
   */
  async getPagination() {
    const url = `indexes/${this.uid}/settings/pagination`;
    return await this.httpRequest.get(url);
  }
  /**
   * Update the pagination settings.
   *
   * @param pagination - Pagination object
   * @returns Promise containing an EnqueuedTask
   */
  async updatePagination(pagination) {
    const url = `indexes/${this.uid}/settings/pagination`;
    const task = await this.httpRequest.patch(url, pagination);
    return new EnqueuedTask(task);
  }
  /**
   * Reset the pagination settings.
   *
   * @returns Promise containing an EnqueuedTask
   */
  async resetPagination() {
    const url = `indexes/${this.uid}/settings/pagination`;
    const task = await this.httpRequest.delete(url);
    return new EnqueuedTask(task);
  }
  ///
  /// SYNONYMS
  ///
  /**
   * Get the list of all synonyms
   *
   * @returns Promise containing object of synonym mappings
   */
  async getSynonyms() {
    const url = `indexes/${this.uid}/settings/synonyms`;
    return await this.httpRequest.get(url);
  }
  /**
   * Update the list of synonyms. Overwrite the old list.
   *
   * @param synonyms - Mapping of synonyms with their associated words
   * @returns Promise containing an EnqueuedTask
   */
  async updateSynonyms(synonyms) {
    const url = `indexes/${this.uid}/settings/synonyms`;
    const task = await this.httpRequest.put(url, synonyms);
    return new EnqueuedTask(task);
  }
  /**
   * Reset the synonym list to be empty again
   *
   * @returns Promise containing an EnqueuedTask
   */
  async resetSynonyms() {
    const url = `indexes/${this.uid}/settings/synonyms`;
    const task = await this.httpRequest.delete(url);
    task.enqueuedAt = new Date(task.enqueuedAt);
    return task;
  }
  ///
  /// STOP WORDS
  ///
  /**
   * Get the list of all stop-words
   *
   * @returns Promise containing array of stop-words
   */
  async getStopWords() {
    const url = `indexes/${this.uid}/settings/stop-words`;
    return await this.httpRequest.get(url);
  }
  /**
   * Update the list of stop-words. Overwrite the old list.
   *
   * @param stopWords - Array of strings that contains the stop-words.
   * @returns Promise containing an EnqueuedTask
   */
  async updateStopWords(stopWords) {
    const url = `indexes/${this.uid}/settings/stop-words`;
    const task = await this.httpRequest.put(url, stopWords);
    return new EnqueuedTask(task);
  }
  /**
   * Reset the stop-words list to be empty again
   *
   * @returns Promise containing an EnqueuedTask
   */
  async resetStopWords() {
    const url = `indexes/${this.uid}/settings/stop-words`;
    const task = await this.httpRequest.delete(url);
    task.enqueuedAt = new Date(task.enqueuedAt);
    return task;
  }
  ///
  /// RANKING RULES
  ///
  /**
   * Get the list of all ranking-rules
   *
   * @returns Promise containing array of ranking-rules
   */
  async getRankingRules() {
    const url = `indexes/${this.uid}/settings/ranking-rules`;
    return await this.httpRequest.get(url);
  }
  /**
   * Update the list of ranking-rules. Overwrite the old list.
   *
   * @param rankingRules - Array that contain ranking rules sorted by order of
   *   importance.
   * @returns Promise containing an EnqueuedTask
   */
  async updateRankingRules(rankingRules) {
    const url = `indexes/${this.uid}/settings/ranking-rules`;
    const task = await this.httpRequest.put(url, rankingRules);
    return new EnqueuedTask(task);
  }
  /**
   * Reset the ranking rules list to its default value
   *
   * @returns Promise containing an EnqueuedTask
   */
  async resetRankingRules() {
    const url = `indexes/${this.uid}/settings/ranking-rules`;
    const task = await this.httpRequest.delete(url);
    task.enqueuedAt = new Date(task.enqueuedAt);
    return task;
  }
  ///
  /// DISTINCT ATTRIBUTE
  ///
  /**
   * Get the distinct-attribute
   *
   * @returns Promise containing the distinct-attribute of the index
   */
  async getDistinctAttribute() {
    const url = `indexes/${this.uid}/settings/distinct-attribute`;
    return await this.httpRequest.get(url);
  }
  /**
   * Update the distinct-attribute.
   *
   * @param distinctAttribute - Field name of the distinct-attribute
   * @returns Promise containing an EnqueuedTask
   */
  async updateDistinctAttribute(distinctAttribute) {
    const url = `indexes/${this.uid}/settings/distinct-attribute`;
    const task = await this.httpRequest.put(url, distinctAttribute);
    return new EnqueuedTask(task);
  }
  /**
   * Reset the distinct-attribute.
   *
   * @returns Promise containing an EnqueuedTask
   */
  async resetDistinctAttribute() {
    const url = `indexes/${this.uid}/settings/distinct-attribute`;
    const task = await this.httpRequest.delete(url);
    task.enqueuedAt = new Date(task.enqueuedAt);
    return task;
  }
  ///
  /// FILTERABLE ATTRIBUTES
  ///
  /**
   * Get the filterable-attributes
   *
   * @returns Promise containing an array of filterable-attributes
   */
  async getFilterableAttributes() {
    const url = `indexes/${this.uid}/settings/filterable-attributes`;
    return await this.httpRequest.get(url);
  }
  /**
   * Update the filterable-attributes.
   *
   * @param filterableAttributes - Array of strings containing the attributes
   *   that can be used as filters at query time
   * @returns Promise containing an EnqueuedTask
   */
  async updateFilterableAttributes(filterableAttributes) {
    const url = `indexes/${this.uid}/settings/filterable-attributes`;
    const task = await this.httpRequest.put(url, filterableAttributes);
    return new EnqueuedTask(task);
  }
  /**
   * Reset the filterable-attributes.
   *
   * @returns Promise containing an EnqueuedTask
   */
  async resetFilterableAttributes() {
    const url = `indexes/${this.uid}/settings/filterable-attributes`;
    const task = await this.httpRequest.delete(url);
    task.enqueuedAt = new Date(task.enqueuedAt);
    return task;
  }
  ///
  /// SORTABLE ATTRIBUTES
  ///
  /**
   * Get the sortable-attributes
   *
   * @returns Promise containing array of sortable-attributes
   */
  async getSortableAttributes() {
    const url = `indexes/${this.uid}/settings/sortable-attributes`;
    return await this.httpRequest.get(url);
  }
  /**
   * Update the sortable-attributes.
   *
   * @param sortableAttributes - Array of strings containing the attributes that
   *   can be used to sort search results at query time
   * @returns Promise containing an EnqueuedTask
   */
  async updateSortableAttributes(sortableAttributes) {
    const url = `indexes/${this.uid}/settings/sortable-attributes`;
    const task = await this.httpRequest.put(url, sortableAttributes);
    return new EnqueuedTask(task);
  }
  /**
   * Reset the sortable-attributes.
   *
   * @returns Promise containing an EnqueuedTask
   */
  async resetSortableAttributes() {
    const url = `indexes/${this.uid}/settings/sortable-attributes`;
    const task = await this.httpRequest.delete(url);
    task.enqueuedAt = new Date(task.enqueuedAt);
    return task;
  }
  ///
  /// SEARCHABLE ATTRIBUTE
  ///
  /**
   * Get the searchable-attributes
   *
   * @returns Promise containing array of searchable-attributes
   */
  async getSearchableAttributes() {
    const url = `indexes/${this.uid}/settings/searchable-attributes`;
    return await this.httpRequest.get(url);
  }
  /**
   * Update the searchable-attributes.
   *
   * @param searchableAttributes - Array of strings that contains searchable
   *   attributes sorted by order of importance(most to least important)
   * @returns Promise containing an EnqueuedTask
   */
  async updateSearchableAttributes(searchableAttributes) {
    const url = `indexes/${this.uid}/settings/searchable-attributes`;
    const task = await this.httpRequest.put(url, searchableAttributes);
    return new EnqueuedTask(task);
  }
  /**
   * Reset the searchable-attributes.
   *
   * @returns Promise containing an EnqueuedTask
   */
  async resetSearchableAttributes() {
    const url = `indexes/${this.uid}/settings/searchable-attributes`;
    const task = await this.httpRequest.delete(url);
    task.enqueuedAt = new Date(task.enqueuedAt);
    return task;
  }
  ///
  /// DISPLAYED ATTRIBUTE
  ///
  /**
   * Get the displayed-attributes
   *
   * @returns Promise containing array of displayed-attributes
   */
  async getDisplayedAttributes() {
    const url = `indexes/${this.uid}/settings/displayed-attributes`;
    return await this.httpRequest.get(url);
  }
  /**
   * Update the displayed-attributes.
   *
   * @param displayedAttributes - Array of strings that contains attributes of
   *   an index to display
   * @returns Promise containing an EnqueuedTask
   */
  async updateDisplayedAttributes(displayedAttributes) {
    const url = `indexes/${this.uid}/settings/displayed-attributes`;
    const task = await this.httpRequest.put(url, displayedAttributes);
    return new EnqueuedTask(task);
  }
  /**
   * Reset the displayed-attributes.
   *
   * @returns Promise containing an EnqueuedTask
   */
  async resetDisplayedAttributes() {
    const url = `indexes/${this.uid}/settings/displayed-attributes`;
    const task = await this.httpRequest.delete(url);
    task.enqueuedAt = new Date(task.enqueuedAt);
    return task;
  }
  ///
  /// TYPO TOLERANCE
  ///
  /**
   * Get the typo tolerance settings.
   *
   * @returns Promise containing the typo tolerance settings.
   */
  async getTypoTolerance() {
    const url = `indexes/${this.uid}/settings/typo-tolerance`;
    return await this.httpRequest.get(url);
  }
  /**
   * Update the typo tolerance settings.
   *
   * @param typoTolerance - Object containing the custom typo tolerance
   *   settings.
   * @returns Promise containing object of the enqueued update
   */
  async updateTypoTolerance(typoTolerance) {
    const url = `indexes/${this.uid}/settings/typo-tolerance`;
    const task = await this.httpRequest.patch(url, typoTolerance);
    task.enqueuedAt = new Date(task.enqueuedAt);
    return task;
  }
  /**
   * Reset the typo tolerance settings.
   *
   * @returns Promise containing object of the enqueued update
   */
  async resetTypoTolerance() {
    const url = `indexes/${this.uid}/settings/typo-tolerance`;
    const task = await this.httpRequest.delete(url);
    task.enqueuedAt = new Date(task.enqueuedAt);
    return task;
  }
  ///
  /// FACETING
  ///
  /**
   * Get the faceting settings.
   *
   * @returns Promise containing object of faceting index settings
   */
  async getFaceting() {
    const url = `indexes/${this.uid}/settings/faceting`;
    return await this.httpRequest.get(url);
  }
  /**
   * Update the faceting settings.
   *
   * @param faceting - Faceting index settings object
   * @returns Promise containing an EnqueuedTask
   */
  async updateFaceting(faceting) {
    const url = `indexes/${this.uid}/settings/faceting`;
    const task = await this.httpRequest.patch(url, faceting);
    return new EnqueuedTask(task);
  }
  /**
   * Reset the faceting settings.
   *
   * @returns Promise containing an EnqueuedTask
   */
  async resetFaceting() {
    const url = `indexes/${this.uid}/settings/faceting`;
    const task = await this.httpRequest.delete(url);
    return new EnqueuedTask(task);
  }
  ///
  /// SEPARATOR TOKENS
  ///
  /**
   * Get the list of all separator tokens.
   *
   * @returns Promise containing array of separator tokens
   */
  async getSeparatorTokens() {
    const url = `indexes/${this.uid}/settings/separator-tokens`;
    return await this.httpRequest.get(url);
  }
  /**
   * Update the list of separator tokens. Overwrite the old list.
   *
   * @param separatorTokens - Array that contains separator tokens.
   * @returns Promise containing an EnqueuedTask or null
   */
  async updateSeparatorTokens(separatorTokens) {
    const url = `indexes/${this.uid}/settings/separator-tokens`;
    const task = await this.httpRequest.put(url, separatorTokens);
    return new EnqueuedTask(task);
  }
  /**
   * Reset the separator tokens list to its default value
   *
   * @returns Promise containing an EnqueuedTask
   */
  async resetSeparatorTokens() {
    const url = `indexes/${this.uid}/settings/separator-tokens`;
    const task = await this.httpRequest.delete(url);
    task.enqueuedAt = new Date(task.enqueuedAt);
    return task;
  }
  ///
  /// NON-SEPARATOR TOKENS
  ///
  /**
   * Get the list of all non-separator tokens.
   *
   * @returns Promise containing array of non-separator tokens
   */
  async getNonSeparatorTokens() {
    const url = `indexes/${this.uid}/settings/non-separator-tokens`;
    return await this.httpRequest.get(url);
  }
  /**
   * Update the list of non-separator tokens. Overwrite the old list.
   *
   * @param nonSeparatorTokens - Array that contains non-separator tokens.
   * @returns Promise containing an EnqueuedTask or null
   */
  async updateNonSeparatorTokens(nonSeparatorTokens) {
    const url = `indexes/${this.uid}/settings/non-separator-tokens`;
    const task = await this.httpRequest.put(url, nonSeparatorTokens);
    return new EnqueuedTask(task);
  }
  /**
   * Reset the non-separator tokens list to its default value
   *
   * @returns Promise containing an EnqueuedTask
   */
  async resetNonSeparatorTokens() {
    const url = `indexes/${this.uid}/settings/non-separator-tokens`;
    const task = await this.httpRequest.delete(url);
    task.enqueuedAt = new Date(task.enqueuedAt);
    return task;
  }
  ///
  /// DICTIONARY
  ///
  /**
   * Get the dictionary settings of a Meilisearch index.
   *
   * @returns Promise containing the dictionary settings
   */
  async getDictionary() {
    const url = `indexes/${this.uid}/settings/dictionary`;
    return await this.httpRequest.get(url);
  }
  /**
   * Update the dictionary settings. Overwrite the old settings.
   *
   * @param dictionary - Array that contains the new dictionary settings.
   * @returns Promise containing an EnqueuedTask or null
   */
  async updateDictionary(dictionary) {
    const url = `indexes/${this.uid}/settings/dictionary`;
    const task = await this.httpRequest.put(url, dictionary);
    return new EnqueuedTask(task);
  }
  /**
   * Reset the dictionary settings to its default value
   *
   * @returns Promise containing an EnqueuedTask
   */
  async resetDictionary() {
    const url = `indexes/${this.uid}/settings/dictionary`;
    const task = await this.httpRequest.delete(url);
    task.enqueuedAt = new Date(task.enqueuedAt);
    return task;
  }
  ///
  /// PROXIMITY PRECISION
  ///
  /**
   * Get the proximity precision settings of a Meilisearch index.
   *
   * @returns Promise containing the proximity precision settings
   */
  async getProximityPrecision() {
    const url = `indexes/${this.uid}/settings/proximity-precision`;
    return await this.httpRequest.get(url);
  }
  /**
   * Update the proximity precision settings. Overwrite the old settings.
   *
   * @param proximityPrecision - String that contains the new proximity
   *   precision settings.
   * @returns Promise containing an EnqueuedTask or null
   */
  async updateProximityPrecision(proximityPrecision) {
    const url = `indexes/${this.uid}/settings/proximity-precision`;
    const task = await this.httpRequest.put(url, proximityPrecision);
    return new EnqueuedTask(task);
  }
  /**
   * Reset the proximity precision settings to its default value
   *
   * @returns Promise containing an EnqueuedTask
   */
  async resetProximityPrecision() {
    const url = `indexes/${this.uid}/settings/proximity-precision`;
    const task = await this.httpRequest.delete(url);
    task.enqueuedAt = new Date(task.enqueuedAt);
    return task;
  }
  ///
  /// EMBEDDERS
  ///
  /**
   * Get the embedders settings of a Meilisearch index.
   *
   * @returns Promise containing the embedders settings
   */
  async getEmbedders() {
    const url = `indexes/${this.uid}/settings/embedders`;
    return await this.httpRequest.get(url);
  }
  /**
   * Update the embedders settings. Overwrite the old settings.
   *
   * @param embedders - Object that contains the new embedders settings.
   * @returns Promise containing an EnqueuedTask or null
   */
  async updateEmbedders(embedders) {
    const url = `indexes/${this.uid}/settings/embedders`;
    const task = await this.httpRequest.patch(url, embedders);
    return new EnqueuedTask(task);
  }
  /**
   * Reset the embedders settings to its default value
   *
   * @returns Promise containing an EnqueuedTask
   */
  async resetEmbedders() {
    const url = `indexes/${this.uid}/settings/embedders`;
    const task = await this.httpRequest.delete(url);
    task.enqueuedAt = new Date(task.enqueuedAt);
    return task;
  }
  ///
  /// SEARCHCUTOFFMS SETTINGS
  ///
  /**
   * Get the SearchCutoffMs settings.
   *
   * @returns Promise containing object of SearchCutoffMs settings
   */
  async getSearchCutoffMs() {
    const url = `indexes/${this.uid}/settings/search-cutoff-ms`;
    return await this.httpRequest.get(url);
  }
  /**
   * Update the SearchCutoffMs settings.
   *
   * @param searchCutoffMs - Object containing SearchCutoffMsSettings
   * @returns Promise containing an EnqueuedTask
   */
  async updateSearchCutoffMs(searchCutoffMs) {
    const url = `indexes/${this.uid}/settings/search-cutoff-ms`;
    const task = await this.httpRequest.put(url, searchCutoffMs);
    return new EnqueuedTask(task);
  }
  /**
   * Reset the SearchCutoffMs settings.
   *
   * @returns Promise containing an EnqueuedTask
   */
  async resetSearchCutoffMs() {
    const url = `indexes/${this.uid}/settings/search-cutoff-ms`;
    const task = await this.httpRequest.delete(url);
    return new EnqueuedTask(task);
  }
}
class Client {
  /**
   * Creates new MeiliSearch instance
   *
   * @param config - Configuration object
   */
  constructor(config) {
    __publicField(this, "config");
    __publicField(this, "httpRequest");
    __publicField(this, "tasks");
    this.config = config;
    this.httpRequest = new HttpRequests(config);
    this.tasks = new TaskClient(config);
  }
  /**
   * Return an Index instance
   *
   * @param indexUid - The index UID
   * @returns Instance of Index
   */
  index(indexUid) {
    return new Index(this.config, indexUid);
  }
  /**
   * Gather information about an index by calling MeiliSearch and return an
   * Index instance with the gathered information
   *
   * @param indexUid - The index UID
   * @returns Promise returning Index instance
   */
  async getIndex(indexUid) {
    return new Index(this.config, indexUid).fetchInfo();
  }
  /**
   * Gather information about an index by calling MeiliSearch and return the raw
   * JSON response
   *
   * @param indexUid - The index UID
   * @returns Promise returning index information
   */
  async getRawIndex(indexUid) {
    return new Index(this.config, indexUid).getRawInfo();
  }
  /**
   * Get all the indexes as Index instances.
   *
   * @param parameters - Parameters to browse the indexes
   * @returns Promise returning array of raw index information
   */
  async getIndexes(parameters = {}) {
    const rawIndexes = await this.getRawIndexes(parameters);
    const indexes = rawIndexes.results.map((index) => new Index(this.config, index.uid, index.primaryKey));
    return { ...rawIndexes, results: indexes };
  }
  /**
   * Get all the indexes in their raw value (no Index instances).
   *
   * @param parameters - Parameters to browse the indexes
   * @returns Promise returning array of raw index information
   */
  async getRawIndexes(parameters = {}) {
    const url = `indexes`;
    return await this.httpRequest.get(url, parameters);
  }
  /**
   * Create a new index
   *
   * @param uid - The index UID
   * @param options - Index options
   * @returns Promise returning Index instance
   */
  async createIndex(uid, options = {}) {
    return await Index.create(uid, options, this.config);
  }
  /**
   * Update an index
   *
   * @param uid - The index UID
   * @param options - Index options to update
   * @returns Promise returning Index instance after updating
   */
  async updateIndex(uid, options = {}) {
    return await new Index(this.config, uid).update(options);
  }
  /**
   * Delete an index
   *
   * @param uid - The index UID
   * @returns Promise which resolves when index is deleted successfully
   */
  async deleteIndex(uid) {
    return await new Index(this.config, uid).delete();
  }
  /**
   * Deletes an index if it already exists.
   *
   * @param uid - The index UID
   * @returns Promise which resolves to true when index exists and is deleted
   *   successfully, otherwise false if it does not exist
   */
  async deleteIndexIfExists(uid) {
    try {
      await this.deleteIndex(uid);
      return true;
    } catch (e) {
      if (e.code === ErrorStatusCode.INDEX_NOT_FOUND) {
        return false;
      }
      throw e;
    }
  }
  /**
   * Swaps a list of index tuples.
   *
   * @param params - List of indexes tuples to swap.
   * @returns Promise returning object of the enqueued task
   */
  async swapIndexes(params) {
    const url = "/swap-indexes";
    return await this.httpRequest.post(url, params);
  }
  ///
  /// Multi Search
  ///
  /**
   * Perform multiple search queries.
   *
   * It is possible to make multiple search queries on the same index or on
   * different ones
   *
   * @example
   *
   * ```ts
   * client.multiSearch({
   *   queries: [
   *     { indexUid: 'movies', q: 'wonder' },
   *     { indexUid: 'books', q: 'flower' },
   *   ],
   * });
   * ```
   *
   * @param queries - Search queries
   * @param config - Additional request configuration options
   * @returns Promise containing the search responses
   */
  async multiSearch(queries, config) {
    const url = `multi-search`;
    return await this.httpRequest.post(url, queries, void 0, config);
  }
  ///
  /// TASKS
  ///
  /**
   * Get the list of all client tasks
   *
   * @param parameters - Parameters to browse the tasks
   * @returns Promise returning all tasks
   */
  async getTasks(parameters = {}) {
    return await this.tasks.getTasks(parameters);
  }
  /**
   * Get one task on the client scope
   *
   * @param taskUid - Task identifier
   * @returns Promise returning a task
   */
  async getTask(taskUid) {
    return await this.tasks.getTask(taskUid);
  }
  /**
   * Wait for multiple tasks to be finished.
   *
   * @param taskUids - Tasks identifier
   * @param waitOptions - Options on timeout and interval
   * @returns Promise returning an array of tasks
   */
  async waitForTasks(taskUids, { timeOutMs = 5e3, intervalMs = 50 } = {}) {
    return await this.tasks.waitForTasks(taskUids, {
      timeOutMs,
      intervalMs
    });
  }
  /**
   * Wait for a task to be finished.
   *
   * @param taskUid - Task identifier
   * @param waitOptions - Options on timeout and interval
   * @returns Promise returning an array of tasks
   */
  async waitForTask(taskUid, { timeOutMs = 5e3, intervalMs = 50 } = {}) {
    return await this.tasks.waitForTask(taskUid, {
      timeOutMs,
      intervalMs
    });
  }
  /**
   * Cancel a list of enqueued or processing tasks.
   *
   * @param parameters - Parameters to filter the tasks.
   * @returns Promise containing an EnqueuedTask
   */
  async cancelTasks(parameters) {
    return await this.tasks.cancelTasks(parameters);
  }
  /**
   * Delete a list of tasks.
   *
   * @param parameters - Parameters to filter the tasks.
   * @returns Promise containing an EnqueuedTask
   */
  async deleteTasks(parameters = {}) {
    return await this.tasks.deleteTasks(parameters);
  }
  ///
  /// KEYS
  ///
  /**
   * Get all API keys
   *
   * @param parameters - Parameters to browse the indexes
   * @returns Promise returning an object with keys
   */
  async getKeys(parameters = {}) {
    const url = `keys`;
    const keys = await this.httpRequest.get(url, parameters);
    keys.results = keys.results.map((key) => ({
      ...key,
      createdAt: new Date(key.createdAt),
      updatedAt: new Date(key.updatedAt)
    }));
    return keys;
  }
  /**
   * Get one API key
   *
   * @param keyOrUid - Key or uid of the API key
   * @returns Promise returning a key
   */
  async getKey(keyOrUid) {
    const url = `keys/${keyOrUid}`;
    return await this.httpRequest.get(url);
  }
  /**
   * Create one API key
   *
   * @param options - Key options
   * @returns Promise returning a key
   */
  async createKey(options) {
    const url = `keys`;
    return await this.httpRequest.post(url, options);
  }
  /**
   * Update one API key
   *
   * @param keyOrUid - Key
   * @param options - Key options
   * @returns Promise returning a key
   */
  async updateKey(keyOrUid, options) {
    const url = `keys/${keyOrUid}`;
    return await this.httpRequest.patch(url, options);
  }
  /**
   * Delete one API key
   *
   * @param keyOrUid - Key
   * @returns
   */
  async deleteKey(keyOrUid) {
    const url = `keys/${keyOrUid}`;
    return await this.httpRequest.delete(url);
  }
  ///
  /// HEALTH
  ///
  /**
   * Checks if the server is healthy, otherwise an error will be thrown.
   *
   * @returns Promise returning an object with health details
   */
  async health() {
    const url = `health`;
    return await this.httpRequest.get(url);
  }
  /**
   * Checks if the server is healthy, return true or false.
   *
   * @returns Promise returning a boolean
   */
  async isHealthy() {
    try {
      const url = `health`;
      await this.httpRequest.get(url);
      return true;
    } catch (e) {
      return false;
    }
  }
  ///
  /// STATS
  ///
  /**
   * Get the stats of all the database
   *
   * @returns Promise returning object of all the stats
   */
  async getStats() {
    const url = `stats`;
    return await this.httpRequest.get(url);
  }
  ///
  /// VERSION
  ///
  /**
   * Get the version of MeiliSearch
   *
   * @returns Promise returning object with version details
   */
  async getVersion() {
    const url = `version`;
    return await this.httpRequest.get(url);
  }
  ///
  /// DUMPS
  ///
  /**
   * Creates a dump
   *
   * @returns Promise returning object of the enqueued task
   */
  async createDump() {
    const url = `dumps`;
    const task = await this.httpRequest.post(url);
    return new EnqueuedTask(task);
  }
  ///
  /// SNAPSHOTS
  ///
  /**
   * Creates a snapshot
   *
   * @returns Promise returning object of the enqueued task
   */
  async createSnapshot() {
    const url = `snapshots`;
    const task = await this.httpRequest.post(url);
    return new EnqueuedTask(task);
  }
  ///
  /// TOKENS
  ///
  /**
   * Generate a tenant token
   *
   * @param apiKeyUid - The uid of the api key used as issuer of the token.
   * @param searchRules - Search rules that are applied to every search.
   * @param options - Token options to customize some aspect of the token.
   * @returns The token in JWT format.
   */
  generateTenantToken(_apiKeyUid, _searchRules, _options) {
    const error2 = new Error();
    error2.message = `Meilisearch: failed to generate a tenant token. Generation of a token only works in a node environment 
 ${error2.stack}.`;
    return Promise.reject(error2);
  }
}
function encode64(data) {
  return Buffer.from(JSON.stringify(data)).toString("base64");
}
async function sign(apiKey, encodedHeader, encodedPayload) {
  const { createHmac } = await __vitePreload(async () => {
    const { createHmac: createHmac2 } = await import("./index-C2KIIWov.js").then((n2) => n2._);
    return { createHmac: createHmac2 };
  }, true ? __vite__mapDeps([0,1]) : void 0);
  return createHmac("sha256", apiKey).update(`${encodedHeader}.${encodedPayload}`).digest("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function createHeader() {
  const header = {
    alg: "HS256",
    typ: "JWT"
  };
  return encode64(header).replace(/=/g, "");
}
function validateTokenParameters(tokenParams) {
  const { searchRules, uid, apiKey, expiresAt } = tokenParams;
  if (expiresAt) {
    if (!(expiresAt instanceof Date)) {
      throw new MeiliSearchError(`Meilisearch: The expiredAt field must be an instance of Date.`);
    } else if (expiresAt.getTime() < Date.now()) {
      throw new MeiliSearchError(`Meilisearch: The expiresAt field must be a date in the future.`);
    }
  }
  if (searchRules) {
    if (!(typeof searchRules === "object" || Array.isArray(searchRules))) {
      throw new MeiliSearchError(`Meilisearch: The search rules added in the token generation must be of type array or object.`);
    }
  }
  if (!apiKey || typeof apiKey !== "string") {
    throw new MeiliSearchError(`Meilisearch: The API key used for the token generation must exist and be of type string.`);
  }
  if (!uid || typeof uid !== "string") {
    throw new MeiliSearchError(`Meilisearch: The uid of the api key used for the token generation must exist, be of type string and comply to the uuid4 format.`);
  }
  if (!validateUuid4(uid)) {
    throw new MeiliSearchError(`Meilisearch: The uid of your key is not a valid uuid4. To find out the uid of your key use getKey().`);
  }
}
function createPayload(payloadParams) {
  const { searchRules, uid, expiresAt } = payloadParams;
  const payload = {
    searchRules,
    apiKeyUid: uid,
    exp: expiresAt ? Math.floor(expiresAt.getTime() / 1e3) : void 0
  };
  return encode64(payload).replace(/=/g, "");
}
class Token {
  constructor(config) {
    __publicField(this, "config");
    this.config = config;
  }
  /**
   * Generate a tenant token
   *
   * @param apiKeyUid - The uid of the api key used as issuer of the token.
   * @param searchRules - Search rules that are applied to every search.
   * @param options - Token options to customize some aspect of the token.
   * @returns The token in JWT format.
   */
  async generateTenantToken(apiKeyUid, searchRules, options) {
    const apiKey = (options == null ? void 0 : options.apiKey) || this.config.apiKey || "";
    const uid = apiKeyUid || "";
    const expiresAt = options == null ? void 0 : options.expiresAt;
    validateTokenParameters({ apiKey, uid, expiresAt, searchRules });
    const encodedHeader = createHeader();
    const encodedPayload = createPayload({ searchRules, uid, expiresAt });
    const signature = await sign(apiKey, encodedHeader, encodedPayload);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }
}
class MeiliSearch extends Client {
  constructor(config) {
    super(config);
    __publicField(this, "tokens");
    this.tokens = new Token(config);
  }
  /**
   * Generate a tenant token
   *
   * @param apiKeyUid - The uid of the api key used as issuer of the token.
   * @param searchRules - Search rules that are applied to every search.
   * @param options - Token options to customize some aspect of the token.
   * @returns The token in JWT format.
   */
  async generateTenantToken(apiKeyUid, searchRules, options) {
    if (typeof window === "undefined") {
      return await this.tokens.generateTenantToken(apiKeyUid, searchRules, options);
    }
    return await super.generateTenantToken(apiKeyUid, searchRules, options);
  }
}
new MeiliSearch({ host: "http://melli:7700" });
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
[
  { value: 0, label: "All Times" },
  { value: subDays(/* @__PURE__ */ new Date(), 1), label: "1d ago" },
  { value: subDays(/* @__PURE__ */ new Date(), 7), label: "7d ago" },
  { value: subDays(/* @__PURE__ */ new Date(), 15), label: "15d ago" },
  { value: subMonths(/* @__PURE__ */ new Date(), 1), label: "1m ago" },
  { value: subMonths(/* @__PURE__ */ new Date(), 6), label: "6m ago" },
  { value: subYears(/* @__PURE__ */ new Date(), 1), label: "1y ago" }
];
const DialogPortal = Portal;
const DialogOverlay = reactExports.forwardRef(({ className, ...props }, ref2) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Overlay,
  {
    ref: ref2,
    className: cn(
      "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = Overlay.displayName;
const DialogContent = reactExports.forwardRef(({ className, children, ...props }, ref2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Content,
    {
      ref: ref2,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Cross2Icon, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = Content.displayName;
const DialogHeader = ({
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    className: cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    ),
    ...props
  }
);
DialogHeader.displayName = "DialogHeader";
const DialogTitle = reactExports.forwardRef(({ className, ...props }, ref2) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Title,
  {
    ref: ref2,
    className: cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    ),
    ...props
  }
));
DialogTitle.displayName = Title.displayName;
const DialogDescription = reactExports.forwardRef(({ className, ...props }, ref2) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Description,
  {
    ref: ref2,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = Description.displayName;
const Form = FormProvider;
const FormFieldContext = reactExports.createContext(
  {}
);
const FormField = ({
  ...props
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(FormFieldContext.Provider, { value: { name: props.name }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Controller, { ...props }) });
};
const useFormField = () => {
  const fieldContext = reactExports.useContext(FormFieldContext);
  const itemContext = reactExports.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(fieldContext.name, formState);
  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }
  const { id: id2 } = itemContext;
  return {
    id: id2,
    name: fieldContext.name,
    formItemId: `${id2}-form-item`,
    formDescriptionId: `${id2}-form-item-description`,
    formMessageId: `${id2}-form-item-message`,
    ...fieldState
  };
};
const FormItemContext = reactExports.createContext(
  {}
);
const FormItem = reactExports.forwardRef(({ className, ...props }, ref2) => {
  const id2 = reactExports.useId();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(FormItemContext.Provider, { value: { id: id2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: ref2, className: cn$1("space-y-2", className), ...props }) });
});
FormItem.displayName = "FormItem";
const FormLabel = reactExports.forwardRef(({ className, ...props }, ref2) => {
  const { error: error2, formItemId } = useFormField();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Label,
    {
      ref: ref2,
      className: cn$1(error2 && "text-destructive", className),
      htmlFor: formItemId,
      ...props
    }
  );
});
FormLabel.displayName = "FormLabel";
const FormControl = reactExports.forwardRef(({ ...props }, ref2) => {
  const { error: error2, formItemId, formDescriptionId, formMessageId } = useFormField();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Slot,
    {
      ref: ref2,
      id: formItemId,
      "aria-describedby": !error2 ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`,
      "aria-invalid": !!error2,
      ...props
    }
  );
});
FormControl.displayName = "FormControl";
const FormDescription = reactExports.forwardRef(({ className, ...props }, ref2) => {
  const { formDescriptionId } = useFormField();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "p",
    {
      ref: ref2,
      id: formDescriptionId,
      className: cn$1("text-[0.8rem] text-muted-foreground", className),
      ...props
    }
  );
});
FormDescription.displayName = "FormDescription";
const FormMessage = reactExports.forwardRef(({ className, children, ...props }, ref2) => {
  const { error: error2, formMessageId } = useFormField();
  const body = error2 ? String(error2 == null ? void 0 : error2.message) : children;
  if (!body) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "p",
    {
      ref: ref2,
      id: formMessageId,
      className: cn$1("text-[0.8rem] font-medium text-destructive", className),
      ...props,
      children: body
    }
  );
});
FormMessage.displayName = "FormMessage";
function parseDuration(durationString) {
  const regex = /^(\d+(\.\d+)?)(ns|us|µs|ms|s|m|h)$/;
  const parts = durationString.match(/(\d+(\.\d+)?[nµumsh])/g);
  if (!parts) return null;
  let totalMs = 0;
  for (const part of parts) {
    const match = part.match(regex);
    if (!match) return null;
    const value = parseFloat(match[1]);
    const unit = match[3];
    const unitToMs = {
      ns: value / 1e6,
      us: value / 1e3,
      µs: value / 1e3,
      ms: value,
      s: value * 1e3,
      m: value * 60 * 1e3,
      h: value * 60 * 60 * 1e3
    };
    totalMs += unitToMs[unit] || 0;
  }
  return totalMs;
}
function formatDuration(ms) {
  const units = [
    { value: 60 * 60 * 1e3, label: "h" },
    { value: 60 * 1e3, label: "m" },
    { value: 1e3, label: "s" },
    { value: 1, label: "ms" },
    { value: 1e-3, label: "µs" },
    { value: 1e-6, label: "ns" }
  ];
  let result = "";
  let remainingMs = ms;
  for (const unit of units) {
    if (remainingMs >= unit.value || result !== "") {
      const count = Math.floor(remainingMs / unit.value);
      if (count > 0) {
        result += `${count}${unit.label} `;
        remainingMs %= unit.value;
      }
    }
  }
  return result.trim() || "0ns";
}
function formatDurationString(durationString) {
  const ms = parseDuration(durationString);
  if (ms === null) return durationString;
  return formatDuration(ms);
}
function GoDurationInput({
  value,
  onChange,
  onBlur,
  label,
  ...field
}) {
  const [inputValue, setInputValue] = reactExports.useState("");
  const [error2, setError] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (typeof value === "string") {
      setInputValue(value);
    } else if (typeof value === "number") {
      setInputValue(formatDuration(value));
    }
  }, [value]);
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (newValue === "") {
      setError("Duration cannot be empty");
      onChange(value);
    } else {
      const parsedValue = parseDuration(newValue);
      if (parsedValue !== null) {
        setError("");
        onChange(newValue);
      } else {
        setError("Invalid duration format");
        onChange(value);
      }
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    label && /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex space-x-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Input,
      {
        ...field,
        value: inputValue,
        onChange: handleInputChange,
        onBlur,
        placeholder: "e.g., 5m, 2h30m, 10s",
        className: error2 ? "border-red-500" : ""
      }
    ) }),
    error2 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-500", children: error2 })
  ] });
}
function ArrayEditor({ control, name }) {
  const [newItemValue, setNewItemValue] = reactExports.useState("");
  const [isOpen, setIsOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    FormField,
    {
      control,
      name,
      render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open: isOpen, onOpenChange: setIsOpen, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "w-full justify-start", children: field.value.length > 0 ? field.value[field.value.length - 1] : "Select or add an item" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { className: "w-80", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            field.value.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex items-center justify-between",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "ghost",
                      onClick: () => {
                        const newArray = field.value.filter(
                          (v) => v !== item
                        );
                        field.onChange(newArray);
                      },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash, { className: "h-4 w-4" })
                    }
                  )
                ]
              },
              index
            )),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex space-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: newItemValue,
                  onChange: (e) => setNewItemValue(e.target.value),
                  className: "bg-background w-full",
                  placeholder: "New item value"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  onClick: () => {
                    if (newItemValue) {
                      const newArray = [...field.value, newItemValue];
                      field.onChange(newArray);
                      setNewItemValue("");
                    }
                  },
                  children: "Add"
                }
              )
            ] })
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] })
    }
  );
}
function DisabledSetting({ value, type: type2 }) {
  const renderValue = () => {
    switch (type2) {
      case "string":
        return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: value });
      case "number":
        return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: value });
      case "boolean":
        return value ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-muted-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 text-muted-foreground" });
      case "array":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          "[",
          value.map((item) => JSON.stringify(item)).join(", "),
          "]"
        ] });
      case "duration":
        return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: formatDurationString(value) });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground italic", children: JSON.stringify(value) });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center space-x-2", children: renderValue() });
}
function SettingRow({ setting, onUpdate }) {
  const [isEditing, setIsEditing] = reactExports.useState(false);
  const [error2, setError] = reactExports.useState(null);
  const form = C({
    refineCoreProps: {
      resource: "settings",
      action: "edit",
      id: setting.key
    },
    defaultValues: {
      value: setting.value
    }
  });
  const {
    refineCore: { onFinish },
    handleSubmit,
    control
  } = form;
  const handleFormSubmit = async (data) => {
    try {
      await onFinish(data);
      onUpdate == null ? void 0 : onUpdate(setting.key, data.value);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError("Failed to update setting. Please try again.");
      console.error("Error updating setting:", err);
    }
  };
  const renderInput = () => {
    switch (setting.type) {
      case "string":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormField,
          {
            control,
            name: "value",
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  ...field,
                  className: "h-9 border border-border/30 bg-background"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
            ] })
          }
        );
      case "number":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormField,
          {
            control,
            name: "value",
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  ...field,
                  type: "number",
                  className: "h-9 border border-border/30 bg-background"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
            ] })
          }
        );
      case "boolean":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormField,
          {
            control,
            name: "value",
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Checkbox,
                {
                  checked: field.value,
                  onCheckedChange: field.onChange
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
            ] })
          }
        );
      case "array":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ArrayEditor, { control, name: "value" });
      case "duration":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormField,
          {
            control,
            name: "value",
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(GoDurationInput, { ...field }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
            ] })
          }
        );
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(DisabledSetting, { value: setting.value, type: setting.type });
    }
  };
  if (!setting.editable) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DisabledSetting, { value: setting.value, type: setting.type });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Form, { ...form, children: /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSubmit(handleFormSubmit), children: isEditing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    renderInput(),
    error2 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-red-500", children: error2 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", children: "Save" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", onClick: () => setIsEditing(false), children: "Cancel" })
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DisabledSetting, { value: setting.value, type: setting.type }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", onClick: () => setIsEditing(true), children: "Edit" })
  ] }) }) });
}
const SettingsEditor = () => {
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [filters, setFilters] = reactExports.useState([]);
  const [jsonData, setJsonData] = reactExports.useState({});
  const [jsonEditorValue, setJsonEditorValue] = reactExports.useState("");
  const [editableFields, setEditableFields] = reactExports.useState(/* @__PURE__ */ new Set());
  const [isErrorModalOpen, setIsErrorModalOpen] = reactExports.useState(false);
  const [errorMessage, setErrorMessage] = reactExports.useState("");
  const [totalCount, setTotalCount] = reactExports.useState(void 0);
  const [isDataLoaded, setIsDataLoaded] = reactExports.useState(false);
  const ajv = reactExports.useRef(new Ajv());
  const { data: schemaData, isLoading: isSchemaLoading } = Ot({
    resource: "settings",
    id: "schema"
  });
  const { data: settingsData, refetch: refetchSettings } = zt({
    resource: "settings",
    pagination: {
      pageSize: totalCount || 10,
      mode: "server"
    }
  });
  const { mutate: updateSetting } = yo();
  reactExports.useEffect(() => {
    if ((settingsData == null ? void 0 : settingsData.data) && settingsData.data.length === totalCount) {
      const settings = settingsData.data.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});
      const unflattened = unflatten(settings);
      setJsonData(unflattened);
      setJsonEditorValue(JSON.stringify(unflattened, null, 2));
      const editableKeys = settingsData.data.filter((setting) => setting.editable).map((setting) => setting.key);
      setEditableFields(new Set(editableKeys));
      setIsDataLoaded(true);
    }
  }, [settingsData == null ? void 0 : settingsData.data, totalCount]);
  reactExports.useEffect(() => {
    if (schemaData == null ? void 0 : schemaData.data) {
      ajv.current.removeSchema();
      ajv.current.addSchema(
        schemaData.data,
        "settings"
      );
    }
  }, [isSchemaLoading]);
  reactExports.useEffect(() => {
    if (settingsData == null ? void 0 : settingsData.total) {
      setTotalCount(settingsData.total);
    }
  }, [settingsData == null ? void 0 : settingsData.total]);
  const getSchemaForKey = reactExports.useCallback(
    (key) => {
      const ret = ajv.current.getSchema("settings");
      if (!ret) {
        return null;
      }
      const schema = ret.schema;
      const parts = key.split(".");
      let currentSchema = schema;
      for (const part of parts) {
        if (currentSchema.type === "object" && currentSchema.properties && part in currentSchema.properties) {
          currentSchema = currentSchema.properties[part];
        } else if (currentSchema.type === "array" && currentSchema.items) {
          if (/^\d+$/.test(part)) {
            currentSchema = Array.isArray(currentSchema.items) ? currentSchema.items[Number(part)] || currentSchema.items[0] : currentSchema.items;
          } else {
            currentSchema = currentSchema.items;
          }
        } else {
          return null;
        }
      }
      return currentSchema;
    },
    []
  );
  const getZodSchemaForKey = reactExports.useCallback(
    (key) => {
      const jsonSchema = getSchemaForKey(key);
      if (!jsonSchema) return z.any();
      return jsonSchemaToZod(jsonSchema);
    },
    [getSchemaForKey]
  );
  const formSchema = reactExports.useMemo(() => {
    if (!(schemaData == null ? void 0 : schemaData.data)) return z.object({});
    const schemaEntries = Object.entries(schemaData.data.properties).map(
      ([key]) => [key, getZodSchemaForKey(key)]
    );
    return z.object(Object.fromEntries(schemaEntries));
  }, [schemaData, getZodSchemaForKey]);
  C({
    refineCoreProps: {
      resource: "settings",
      action: "edit"
    },
    resolver: t(formSchema)
  });
  const columnHelper = createColumnHelper();
  const columns = reactExports.useMemo(
    () => [
      columnHelper.accessor("key", {
        header: "Setting",
        cell: (info) => info.getValue()
      }),
      columnHelper.accessor("value", {
        header: "Value",
        cell: ({ row }) => {
          const schema = getSchemaForKey(row.original.key);
          const type2 = (schema == null ? void 0 : schema.type) || typeof row.original.value;
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            SettingRow,
            {
              setting: {
                ...row.original,
                editable: editableFields.has(row.original.key),
                type: type2
              }
            }
          );
        }
      }),
      columnHelper.accessor(
        (row) => {
          const fieldSchema = getSchemaForKey(row.key);
          return (fieldSchema == null ? void 0 : fieldSchema.type) || typeof row.value;
        },
        {
          id: "type",
          header: "Type",
          cell: (info) => info.getValue()
        }
      )
    ],
    [editableFields, getSchemaForKey, updateSetting]
  );
  const updateFilters = reactExports.useCallback((term) => {
    if (term) {
      setFilters([{ field: "key", operator: "contains", value: term }]);
    } else {
      setFilters([]);
    }
  }, []);
  const handleSearch = reactExports.useCallback(
    (e) => {
      const term = e.target.value;
      setSearchTerm(term);
      updateFilters(term);
    },
    [updateFilters]
  );
  const clearSearch = reactExports.useCallback(() => {
    setSearchTerm("");
    updateFilters("");
  }, [updateFilters]);
  const handleJsonEditorChange = (e) => {
    setJsonEditorValue(e.target.value);
  };
  const applyJsonChanges = () => {
    try {
      const newJsonData = JSON.parse(jsonEditorValue);
      const valid = ajv.current.validate("settings", newJsonData);
      if (!valid) {
        console.error("JSON validation failed:", ajv.current.errors);
        setErrorMessage(JSON.stringify(ajv.current.errors, null, 2));
        setIsErrorModalOpen(true);
        return;
      }
      const flattenedNewData = flatten(newJsonData);
      const flattenedOldData = flatten(jsonData);
      const changedKeys = Object.keys(flattenedNewData).filter(
        (key) => flattenedNewData[key] !== flattenedOldData[key] && editableFields.has(key)
      );
      changedKeys.forEach((key) => {
        updateSetting(
          {
            id: key,
            values: { value: flattenedNewData[key] }
          },
          {
            onSuccess: () => {
              console.log(`Successfully updated ${key}`);
            },
            onError: (error2) => {
              console.error(`Failed to update ${key}:`, error2);
            }
          }
        );
      });
      const editableNewData = Object.fromEntries(
        Object.entries(flattenedNewData).filter(
          ([key]) => editableFields.has(key)
        )
      );
      const editableOldData = Object.fromEntries(
        Object.entries(flattenedOldData).filter(
          ([key]) => !editableFields.has(key)
        )
      );
      const updatedData = { ...editableOldData, ...editableNewData };
      const unflattened = unflatten(updatedData);
      setJsonData(unflattened);
      setJsonEditorValue(JSON.stringify(unflattened, null, 2));
      refetchSettings();
    } catch (error2) {
      console.error("Failed to parse JSON:", error2);
      setErrorMessage(`Failed to parse JSON: ${error2 == null ? void 0 : error2.message}`);
      setIsErrorModalOpen(true);
    }
  };
  if (isSchemaLoading || !isDataLoaded) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonLoader, {});
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "text",
            placeholder: "Search settings...",
            value: searchTerm,
            onChange: handleSearch,
            className: "w-full pl-10 pr-10 py-2 rounded-md bg-secondary"
          }
        ),
        searchTerm && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "ghost",
            size: "sm",
            className: "absolute right-2 top-1/2 transform -translate-y-1/2",
            onClick: clearSearch,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DataTable, { columns, filters })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: "JSON Editor" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          value: jsonEditorValue,
          onChange: handleJsonEditorChange,
          className: "font-mono h-[calc(100vh-200px)] min-h-[300px] w-full"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: applyJsonChanges, className: "w-full", children: "Apply Changes" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isErrorModalOpen, onOpenChange: setIsErrorModalOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent$1, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle$1, { children: "JSON Error" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription$1, { children: "There was an error processing your JSON input:" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "bg-gray-100 p-2 rounded", children: errorMessage }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setIsErrorModalOpen(false), children: "Close" })
    ] }) })
  ] });
};
function Settings() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(mc, {
    v3LegacyAuthProviderCompatible: true,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(GeneralLayout, {
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: "p-4 space-y-6",
        children: [/* @__PURE__ */ jsxRuntimeExports.jsx("h1", {
          className: "text-2xl font-bold mb-6",
          children: "Settings"
        }), /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsEditor, {})]
      })
    })
  }, "settings");
}
export {
  Settings as default
};
