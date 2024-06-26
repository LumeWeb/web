import { r as reactExports, j as jsxRuntimeExports } from "./index-CZkutDaP.js";
import { _ as _extends, c as cn, $ as $6ed0406888f73fc4$export$c7b2cbe3552a0d05 } from "./utils-CrxSwyC8.js";
import { a as $8927f6f2acc4f386$export$250ffa63cdc0d034, p as EyeOpenIcon, q as EyeNoneIcon, f as $9f79659886946c16$export$e5c5a5f917a5871c, $ as $c512c27ab02ef895$export$50c7b4e9d9f19c1, b as $71cd76cc60e0454e$export$6f32135080cb4c3, e as $e42e1063c40fb3ef$export$b9ecd428b558ff10, c as $921a889cee6df7e8$export$99c2b779aa4e8b8b, k as CheckIcon } from "./index-BZHzSmil.js";
const $b73a6c6685e72184$export$b04be29aa201d4f5 = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  return /* @__PURE__ */ reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.label, _extends({}, props, {
    ref: forwardedRef,
    onMouseDown: (event) => {
      var _props$onMouseDown;
      (_props$onMouseDown = props.onMouseDown) === null || _props$onMouseDown === void 0 || _props$onMouseDown.call(props, event);
      if (!event.defaultPrevented && event.detail > 1) event.preventDefault();
    }
  }));
});
const Input = reactExports.forwardRef(
  ({ className, type, fullWidth, leftIcon, ...props }, ref) => {
    const [showPassword, setShowPassword] = reactExports.useState(false);
    const [mask, setMask] = reactExports.useState(false);
    const toggleShowPassword = () => {
      setShowPassword((show) => !show);
      setMask((mask2) => !mask2);
    };
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative ${fullWidth ? "w-full" : ""}`, children: [
      leftIcon && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-4 top-1/2 -translate-y-1/2", children: leftIcon }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: type && !mask ? type : "text",
          className: cn(
            "flex h-14 w-full rounded-md border border-input px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-input-placeholder focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className,
            leftIcon && "pl-10"
          ),
          ref,
          ...props
        }
      ),
      type === "password" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: "absolute right-4 top-5 text-ring",
          onClick: toggleShowPassword,
          onKeyDown: toggleShowPassword,
          children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOpenIcon, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(EyeNoneIcon, {})
        }
      ) : null
    ] });
  }
);
Input.displayName = "Input";
function getFormElement(formId) {
  return document.forms.namedItem(formId);
}
function getFieldElements(form, name) {
  var field = form === null || form === void 0 ? void 0 : form.elements.namedItem(name);
  var elements = !field ? [] : field instanceof Element ? [field] : Array.from(field.values());
  return elements.filter((element) => element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement);
}
function getEventTarget(form, name, value) {
  var _elements$;
  var elements = getFieldElements(form, name);
  if (elements.length > 1) {
    var options = value;
    for (var element of elements) {
      if (typeof options !== "undefined" && element instanceof HTMLInputElement && element.type === "checkbox" && (element.checked ? options.includes(element.value) : !options.includes(element.value))) {
        continue;
      }
      return element;
    }
  }
  return (_elements$ = elements[0]) !== null && _elements$ !== void 0 ? _elements$ : null;
}
function createDummySelect(form, name, value) {
  var select = document.createElement("select");
  var options = typeof value === "string" ? [value] : value !== null && value !== void 0 ? value : [];
  select.name = name;
  select.multiple = true;
  select.dataset.conform = "true";
  select.setAttribute("aria-hidden", "true");
  select.tabIndex = -1;
  select.style.position = "absolute";
  select.style.width = "1px";
  select.style.height = "1px";
  select.style.padding = "0";
  select.style.margin = "-1px";
  select.style.overflow = "hidden";
  select.style.clip = "rect(0,0,0,0)";
  select.style.whiteSpace = "nowrap";
  select.style.border = "0";
  for (var option of options) {
    select.options.add(new Option(option, option, true, true));
  }
  form.appendChild(select);
  return select;
}
function isDummySelect(element) {
  return element.dataset.conform === "true";
}
function updateFieldValue(element, value) {
  if (element instanceof HTMLInputElement && (element.type === "checkbox" || element.type === "radio")) {
    element.checked = Array.isArray(value) ? value.includes(element.value) : element.value === value;
  } else if (element instanceof HTMLSelectElement && element.multiple) {
    var selectedValue = Array.isArray(value) ? [...value] : [value];
    for (var option of element.options) {
      var index = selectedValue.indexOf(option.value);
      var selected = index > -1;
      option.selected = selected;
      if (selected) {
        selectedValue.splice(index, 1);
      }
    }
    if (isDummySelect(element)) {
      for (var _option of selectedValue) {
        element.options.add(new Option(_option, _option, false, true));
      }
    }
  } else if (element.value !== value) {
    var {
      set: valueSetter
    } = Object.getOwnPropertyDescriptor(element, "value") || {};
    var prototype = Object.getPrototypeOf(element);
    var {
      set: prototypeValueSetter
    } = Object.getOwnPropertyDescriptor(prototype, "value") || {};
    if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter.call(element, value);
    } else {
      if (valueSetter) {
        valueSetter.call(element, value);
      } else {
        throw new Error("The given element does not have a value setter");
      }
    }
  }
}
function useInputEvent() {
  var ref = reactExports.useRef(null);
  var eventDispatched = reactExports.useRef({
    change: false,
    focus: false,
    blur: false
  });
  reactExports.useEffect(() => {
    var createEventListener = (listener) => {
      return (event) => {
        var element = ref.current;
        if (element && event.target === element) {
          eventDispatched.current[listener] = true;
        }
      };
    };
    var inputHandler = createEventListener("change");
    var focusHandler = createEventListener("focus");
    var blurHandler = createEventListener("blur");
    document.addEventListener("input", inputHandler, true);
    document.addEventListener("focusin", focusHandler, true);
    document.addEventListener("focusout", blurHandler, true);
    return () => {
      document.removeEventListener("input", inputHandler, true);
      document.removeEventListener("focusin", focusHandler, true);
      document.removeEventListener("focusout", blurHandler, true);
    };
  }, [ref]);
  return reactExports.useMemo(() => {
    return {
      change(value) {
        if (!eventDispatched.current.change) {
          eventDispatched.current.change = true;
          var element = ref.current;
          if (element) {
            updateFieldValue(element, value);
            element.dispatchEvent(new InputEvent("input", {
              bubbles: true
            }));
            element.dispatchEvent(new Event("change", {
              bubbles: true
            }));
          }
        }
        eventDispatched.current.change = false;
      },
      focus() {
        if (!eventDispatched.current.focus) {
          eventDispatched.current.focus = true;
          var element = ref.current;
          if (element) {
            element.dispatchEvent(new FocusEvent("focusin", {
              bubbles: true
            }));
            element.dispatchEvent(new FocusEvent("focus"));
          }
        }
        eventDispatched.current.focus = false;
      },
      blur() {
        if (!eventDispatched.current.blur) {
          eventDispatched.current.blur = true;
          var element = ref.current;
          if (element) {
            element.dispatchEvent(new FocusEvent("focusout", {
              bubbles: true
            }));
            element.dispatchEvent(new FocusEvent("blur"));
          }
        }
        eventDispatched.current.blur = false;
      },
      register(element) {
        ref.current = element;
      }
    };
  }, []);
}
function useInputValue(options) {
  var initializeValue = () => {
    var _options$initialValue;
    if (typeof options.initialValue === "string") {
      return options.initialValue;
    }
    return (_options$initialValue = options.initialValue) === null || _options$initialValue === void 0 ? void 0 : _options$initialValue.map((value2) => value2 !== null && value2 !== void 0 ? value2 : "");
  };
  var [key, setKey] = reactExports.useState(options.key);
  var [value, setValue] = reactExports.useState(initializeValue);
  if (key !== options.key) {
    setValue(initializeValue);
    setKey(options.key);
  }
  return [value, setValue];
}
function useInputControl(meta) {
  var [value, setValue] = useInputValue(meta);
  var initializedRef = reactExports.useRef(false);
  var {
    register,
    change,
    focus,
    blur
  } = useInputEvent();
  reactExports.useEffect(() => {
    var form = getFormElement(meta.formId);
    if (!form) {
      console.warn("useInputControl is unable to find form#".concat(meta.formId, " and identify if a dummy input is required"));
      return;
    }
    var element = getEventTarget(form, meta.name);
    if (!element && typeof value !== "undefined" && (!Array.isArray(value) || value.length > 0)) {
      element = createDummySelect(form, meta.name, value);
    }
    register(element);
    if (!initializedRef.current) {
      initializedRef.current = true;
    } else {
      change(value !== null && value !== void 0 ? value : "");
    }
    return () => {
      register(null);
      var elements = getFieldElements(form, meta.name);
      for (var _element of elements) {
        if (isDummySelect(_element)) {
          _element.remove();
        }
      }
    };
  }, [meta.formId, meta.name, value, change, register]);
  return {
    value,
    change: setValue,
    focus,
    blur
  };
}
function $010c2913dbd2fe3d$export$5cae361ad82dce8b(value) {
  const ref = reactExports.useRef({
    value,
    previous: value
  });
  return reactExports.useMemo(() => {
    if (ref.current.value !== value) {
      ref.current.previous = ref.current.value;
      ref.current.value = value;
    }
    return ref.current.previous;
  }, [
    value
  ]);
}
function $db6c3485150b8e66$export$1ab7ae714698c4b8(element) {
  const [size, setSize] = reactExports.useState(void 0);
  $9f79659886946c16$export$e5c5a5f917a5871c(() => {
    if (element) {
      setSize({
        width: element.offsetWidth,
        height: element.offsetHeight
      });
      const resizeObserver = new ResizeObserver((entries) => {
        if (!Array.isArray(entries)) return;
        if (!entries.length) return;
        const entry = entries[0];
        let width;
        let height;
        if ("borderBoxSize" in entry) {
          const borderSizeEntry = entry["borderBoxSize"];
          const borderSize = Array.isArray(borderSizeEntry) ? borderSizeEntry[0] : borderSizeEntry;
          width = borderSize["inlineSize"];
          height = borderSize["blockSize"];
        } else {
          width = element.offsetWidth;
          height = element.offsetHeight;
        }
        setSize({
          width,
          height
        });
      });
      resizeObserver.observe(element, {
        box: "border-box"
      });
      return () => resizeObserver.unobserve(element);
    } else
      setSize(void 0);
  }, [
    element
  ]);
  return size;
}
const $e698a72e93240346$var$CHECKBOX_NAME = "Checkbox";
const [$e698a72e93240346$var$createCheckboxContext, $e698a72e93240346$export$b566c4ff5488ea01] = $c512c27ab02ef895$export$50c7b4e9d9f19c1($e698a72e93240346$var$CHECKBOX_NAME);
const [$e698a72e93240346$var$CheckboxProvider, $e698a72e93240346$var$useCheckboxContext] = $e698a72e93240346$var$createCheckboxContext($e698a72e93240346$var$CHECKBOX_NAME);
const $e698a72e93240346$export$48513f6b9f8ce62d = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeCheckbox, name, checked: checkedProp, defaultChecked, required, disabled, value = "on", onCheckedChange, ...checkboxProps } = props;
  const [button, setButton] = reactExports.useState(null);
  const composedRefs = $6ed0406888f73fc4$export$c7b2cbe3552a0d05(
    forwardedRef,
    (node) => setButton(node)
  );
  const hasConsumerStoppedPropagationRef = reactExports.useRef(false);
  const isFormControl = button ? Boolean(button.closest("form")) : true;
  const [checked = false, setChecked] = $71cd76cc60e0454e$export$6f32135080cb4c3({
    prop: checkedProp,
    defaultProp: defaultChecked,
    onChange: onCheckedChange
  });
  const initialCheckedStateRef = reactExports.useRef(checked);
  reactExports.useEffect(() => {
    const form = button === null || button === void 0 ? void 0 : button.form;
    if (form) {
      const reset = () => setChecked(initialCheckedStateRef.current);
      form.addEventListener("reset", reset);
      return () => form.removeEventListener("reset", reset);
    }
  }, [
    button,
    setChecked
  ]);
  return /* @__PURE__ */ reactExports.createElement($e698a72e93240346$var$CheckboxProvider, {
    scope: __scopeCheckbox,
    state: checked,
    disabled
  }, /* @__PURE__ */ reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.button, _extends({
    type: "button",
    role: "checkbox",
    "aria-checked": $e698a72e93240346$var$isIndeterminate(checked) ? "mixed" : checked,
    "aria-required": required,
    "data-state": $e698a72e93240346$var$getState(checked),
    "data-disabled": disabled ? "" : void 0,
    disabled,
    value
  }, checkboxProps, {
    ref: composedRefs,
    onKeyDown: $e42e1063c40fb3ef$export$b9ecd428b558ff10(props.onKeyDown, (event) => {
      if (event.key === "Enter") event.preventDefault();
    }),
    onClick: $e42e1063c40fb3ef$export$b9ecd428b558ff10(props.onClick, (event) => {
      setChecked(
        (prevChecked) => $e698a72e93240346$var$isIndeterminate(prevChecked) ? true : !prevChecked
      );
      if (isFormControl) {
        hasConsumerStoppedPropagationRef.current = event.isPropagationStopped();
        if (!hasConsumerStoppedPropagationRef.current) event.stopPropagation();
      }
    })
  })), isFormControl && /* @__PURE__ */ reactExports.createElement($e698a72e93240346$var$BubbleInput, {
    control: button,
    bubbles: !hasConsumerStoppedPropagationRef.current,
    name,
    value,
    checked,
    required,
    disabled,
    style: {
      transform: "translateX(-100%)"
    }
  }));
});
const $e698a72e93240346$var$INDICATOR_NAME = "CheckboxIndicator";
const $e698a72e93240346$export$59aad738f51d1c05 = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeCheckbox, forceMount, ...indicatorProps } = props;
  const context = $e698a72e93240346$var$useCheckboxContext($e698a72e93240346$var$INDICATOR_NAME, __scopeCheckbox);
  return /* @__PURE__ */ reactExports.createElement($921a889cee6df7e8$export$99c2b779aa4e8b8b, {
    present: forceMount || $e698a72e93240346$var$isIndeterminate(context.state) || context.state === true
  }, /* @__PURE__ */ reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.span, _extends({
    "data-state": $e698a72e93240346$var$getState(context.state),
    "data-disabled": context.disabled ? "" : void 0
  }, indicatorProps, {
    ref: forwardedRef,
    style: {
      pointerEvents: "none",
      ...props.style
    }
  })));
});
const $e698a72e93240346$var$BubbleInput = (props) => {
  const { control, checked, bubbles = true, ...inputProps } = props;
  const ref = reactExports.useRef(null);
  const prevChecked = $010c2913dbd2fe3d$export$5cae361ad82dce8b(checked);
  const controlSize = $db6c3485150b8e66$export$1ab7ae714698c4b8(control);
  reactExports.useEffect(() => {
    const input = ref.current;
    const inputProto = window.HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(inputProto, "checked");
    const setChecked = descriptor.set;
    if (prevChecked !== checked && setChecked) {
      const event = new Event("click", {
        bubbles
      });
      input.indeterminate = $e698a72e93240346$var$isIndeterminate(checked);
      setChecked.call(input, $e698a72e93240346$var$isIndeterminate(checked) ? false : checked);
      input.dispatchEvent(event);
    }
  }, [
    prevChecked,
    checked,
    bubbles
  ]);
  return /* @__PURE__ */ reactExports.createElement("input", _extends({
    type: "checkbox",
    "aria-hidden": true,
    defaultChecked: $e698a72e93240346$var$isIndeterminate(checked) ? false : checked
  }, inputProps, {
    tabIndex: -1,
    ref,
    style: {
      ...props.style,
      ...controlSize,
      position: "absolute",
      pointerEvents: "none",
      opacity: 0,
      margin: 0
    }
  }));
};
function $e698a72e93240346$var$isIndeterminate(checked) {
  return checked === "indeterminate";
}
function $e698a72e93240346$var$getState(checked) {
  return $e698a72e93240346$var$isIndeterminate(checked) ? "indeterminate" : checked ? "checked" : "unchecked";
}
const $e698a72e93240346$export$be92b6f5f03c0fe9 = $e698a72e93240346$export$48513f6b9f8ce62d;
const $e698a72e93240346$export$adb584737d712b70 = $e698a72e93240346$export$59aad738f51d1c05;
const Checkbox = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  $e698a72e93240346$export$be92b6f5f03c0fe9,
  {
    ref,
    className: cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-border shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-border data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      $e698a72e93240346$export$adb584737d712b70,
      {
        className: cn("flex items-center justify-center text-current"),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, { className: "h-4 w-4" })
      }
    )
  }
));
Checkbox.displayName = $e698a72e93240346$export$be92b6f5f03c0fe9.displayName;
const Textarea = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
const Field = ({
  inputProps,
  labelProps,
  errors,
  className
}) => {
  const fallbackId = reactExports.useId();
  const id = inputProps.id ?? fallbackId;
  const errorId = (errors == null ? void 0 : errors.length) ? `${id}-error` : void 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx($b73a6c6685e72184$export$b04be29aa201d4f5, { ...labelProps, htmlFor: id, className: "font-semibold text-sm text-secondary-foreground" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Input,
      {
        ...inputProps,
        className: "mt-4 bg-input border-border placeholder-input-placeholder",
        id,
        "aria-invalid": errorId ? true : void 0,
        "aria-describedby": errorId
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-[32px] px-4 pb-3 pt-1", children: errorId ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorList, { id: errorId, errors }) : null })
  ] });
};
const FieldCheckbox = ({
  inputProps,
  labelProps,
  errors,
  className
}) => {
  const { key, defaultChecked, ...checkboxProps } = inputProps;
  const checkedValue = inputProps.value ?? "on";
  const input = useInputControl({
    key,
    name: inputProps.name,
    formId: inputProps.form,
    initialValue: defaultChecked ? checkedValue : void 0
  });
  const fallbackId = reactExports.useId();
  const id = inputProps.id ?? fallbackId;
  const errorId = (errors == null ? void 0 : errors.length) ? `${id}-error` : void 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: cn("space-x-2 flex items-center text-foreground", className),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              ...checkboxProps,
              id,
              "aria-invalid": errorId ? true : void 0,
              "aria-describedby": errorId,
              checked: input.value === checkedValue,
              onCheckedChange: (state) => {
                var _a;
                input.change(state.valueOf() ? checkedValue : "");
                (_a = inputProps.onCheckedChange) == null ? void 0 : _a.call(inputProps, state);
              },
              onFocus: (event) => {
                var _a;
                input.focus();
                (_a = inputProps.onFocus) == null ? void 0 : _a.call(inputProps, event);
              },
              onBlur: (event) => {
                var _a;
                input.blur();
                (_a = inputProps.onBlur) == null ? void 0 : _a.call(inputProps, event);
              },
              type: "button"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx($b73a6c6685e72184$export$b04be29aa201d4f5, { ...labelProps, htmlFor: id })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-[32px] px-4 pb-3 pt-1", children: errorId ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorList, { id: errorId, errors }) : null })
  ] });
};
function TextareaField({
  labelProps,
  textareaProps,
  errors,
  className
}) {
  const fallbackId = reactExports.useId();
  const id = textareaProps.id ?? textareaProps.name ?? fallbackId;
  const errorId = (errors == null ? void 0 : errors.length) ? `${id}-error` : void 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx($b73a6c6685e72184$export$b04be29aa201d4f5, { htmlFor: id, ...labelProps }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Textarea,
      {
        id,
        "aria-invalid": errorId ? true : void 0,
        "aria-describedby": errorId,
        ...textareaProps
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-[32px] pb-1 pt-1", children: errorId ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorList, { id: errorId, errors }) : null })
  ] });
}
function ErrorList({
  id,
  errors
}) {
  const errorsToRender = errors == null ? void 0 : errors.filter(Boolean);
  if (!(errorsToRender == null ? void 0 : errorsToRender.length)) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { id, className: "flex flex-col gap-1", children: errorsToRender.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-[12px] text-destructive-foreground", children: e }, e)) });
}
export {
  $010c2913dbd2fe3d$export$5cae361ad82dce8b as $,
  ErrorList as E,
  Field as F,
  Input as I,
  TextareaField as T,
  FieldCheckbox as a,
  $db6c3485150b8e66$export$1ab7ae714698c4b8 as b
};
