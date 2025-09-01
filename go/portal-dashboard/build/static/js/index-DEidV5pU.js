import { dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__, dashboard__loadShare__react_mf_2_router__loadShare__ } from './dashboard__loadShare__react_mf_2_router__loadShare__-GzYn9uIj.js';
import { dashboard__loadShare__react__loadShare__, React3 } from './dashboard__loadShare__react__loadShare__-A-_ogCU6.js';
import { jsxRuntimeExports } from './jsx-runtime-Rqu4CMEU.js';
import { dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__, ReloadIcon, FontBoldIcon, FontItalicIcon, UnderlineIcon, get_1, ChevronLeft, ChevronRight, _baseIsEqual } from './_baseIsEqual-C0d_jX9e.js';
import { castPath, toKey, isLength, isIndex, isArray as isArray$4, isArguments, get as get$1 } from './isLength-BjcVZakP.js';
import { dashboard__mf_v__runtimeInit__mf_v__, index_cjs } from './dashboard__mf_v__runtimeInit__mf_v__-CrvQyIUV.js';
import { commonjsGlobal, getDefaultExportFromCjs } from './_commonjsHelpers-BILit0S-.js';
import { dashboard__loadShare__react_mf_2_dom__loadShare__ } from './dashboard__loadShare__react_mf_2_dom__loadShare__-sIXfFKrj.js';
import { shimExports } from './index-CAhUWRmj.js';
import { createLucideIcon } from './createLucideIcon-CcrG3Oz3.js';

//#region src/components/actions/types.ts
let ActionItemType = /* @__PURE__ */ function(ActionItemType$1) {
	ActionItemType$1["BUTTON"] = "button";
	ActionItemType$1["CANCEL"] = "cancel";
	ActionItemType$1["CUSTOM"] = "custom";
	ActionItemType$1["CUSTOM_COMPONENT"] = "custom-component";
	ActionItemType$1["DATE"] = "date";
	ActionItemType$1["FILE"] = "file";
	ActionItemType$1["LINK"] = "link";
	ActionItemType$1["SUBMIT"] = "submit";
	return ActionItemType$1;
}({});

//#region src/components/actions/registry.ts
const actionItemRegistry = /* @__PURE__ */ new Map();
function getActionItemComponent(type) {
	return actionItemRegistry.get(type);
}
function registerActionItemComponent(type, component) {
	if (actionItemRegistry.has(type)) console.warn(`ActionItemComponent type "${type}" is already registered. Overwriting.`);
	actionItemRegistry.set(type, component);
}
/**
* Clears the action item registry.
* Use ONLY for testing purposes.
*/
function resetRegistryForTesting() {
	actionItemRegistry.clear();
}

//#region src/components/actions/ActionListRenderer.tsx
const ActionListRenderer = ({ actions = [], className, closeDialog, isSubmitting, layout = "horizontal" }) => {
	if (!actions || actions.length === 0) return null;
	return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
		className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("flex w-full", layout === "vertical" ? "flex-col space-y-3" : "flex-row flex-wrap justify-end items-center gap-4", className),
		children: actions.map((action, index) => {
			if (action.type === ActionItemType.CUSTOM_COMPONENT) {
				const CustomComponent = action.component;
				return /* @__PURE__ */ jsxRuntimeExports.jsx(CustomComponent, {
					...action.props,
					closeDialog,
					isSubmitting
				}, action.key ?? index);
			}
			const ActionComponent = getActionItemComponent(action.type);
			if (!ActionComponent) {
				console.warn(`No component registered for action type: ${action.type}`);
				return null;
			}
			const key = action.key ?? index;
			return /* @__PURE__ */ jsxRuntimeExports.jsx(ActionComponent, {
				closeDialog,
				config: action,
				isSubmitting
			}, key);
		})
	});
};

//#region src/components/actions/items/CancelActionItem.tsx
const CancelActionItem = ({ closeDialog, config, isSubmitting }) => {
	const handleClick = () => {
		if (closeDialog) closeDialog();
		if (config.onClick) config.onClick?.();
	};
	return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
		className: config.className,
		disabled: isSubmitting ?? config.disabled,
		onClick: handleClick,
		type: "button",
		variant: "outline",
		children: config.label ?? config.children ?? "Cancel"
	});
};
function registerCancelActionItem() {
	registerActionItemComponent(ActionItemType.CANCEL, CancelActionItem);
}

//#region src/components/actions/items/CustomActionItem.tsx
const CustomActionItem = ({ config, isSubmitting }) => {
	if (!config.onClick) {
		console.error("CustomActionItem requires an onClick handler in its config.", config);
		return null;
	}
	return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
		className: config.className,
		disabled: isSubmitting || config.disabled,
		onClick: config.onClick,
		type: "button",
		children: config.label ?? config.children
	});
};
function registerCustomActionItem() {
	registerActionItemComponent(ActionItemType.CUSTOM, CustomActionItem);
}

//#region src/components/actions/items/LinkActionItem.tsx
const LinkActionItem = ({ config }) => {
	const commonProps = {
		children: config.label || config.children,
		className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", "text-primary underline-offset-4 hover:underline", config.className),
		target: config.target
	};
	if (config.target === "_blank" || config.reloadDocument || config.to.startsWith("http")) return /* @__PURE__ */ jsxRuntimeExports.jsx("a", {
		href: config.to,
		...commonProps,
		rel: config.target === "_blank" ? "noopener noreferrer" : void 0,
		children: commonProps.children
	});
	return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare__react_mf_2_router__loadShare__.Link, {
		to: config.to,
		...commonProps,
		children: commonProps.children
	});
};
function registerLinkActionItem() {
	registerActionItemComponent(ActionItemType.LINK, LinkActionItem);
}

//#region src/components/actions/items/SubmitActionItem.tsx
const SubmitActionItem = ({ config, isSubmitting }) => {
	return /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
		className: config.className,
		disabled: isSubmitting || config.disabled,
		onClick: config.onClick,
		type: "submit",
		children: [isSubmitting && /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Spinner, {
			className: "mr-2",
			size: "small"
		}), config.label ?? config.children ?? "Submit"]
	});
};
function registerSubmitActionItem() {
	registerActionItemComponent(ActionItemType.SUBMIT, SubmitActionItem);
}

//#region src/components/actions/register.ts
function registerAllActionItems() {
	registerSubmitActionItem();
	registerCancelActionItem();
	registerCustomActionItem();
	registerLinkActionItem();
}

const r$3=(t,r,o)=>{if(t&&"reportValidity"in t){const s=dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__.get(o,r);t.setCustomValidity(s&&s.message||""),t.reportValidity();}},o$4=(e,t)=>{for(const o in t.fields){const s=t.fields[o];s&&s.ref&&"reportValidity"in s.ref?r$3(s.ref,o,e):s&&s.refs&&s.refs.forEach(t=>r$3(t,o,e));}},s$4=(r,s)=>{s.shouldUseNativeValidation&&o$4(r,s);const n={};for(const o in r){const f=dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__.get(s.fields,o),c=Object.assign(r[o]||{},{ref:f&&f.ref});if(i$2(s.names||Object.keys(r),o)){const r=Object.assign({},dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__.get(n,o));dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__.set(r,"root",c),dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__.set(n,o,r);}else dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__.set(n,o,c);}return n},i$2=(e,t)=>{const r=n$5(t);return e.some(e=>n$5(e).match(`^${r}\\.\\d+`))};function n$5(e){return e.replace(/\]|\[/g,"")}

function n$4(r,e){for(var n={};r.length;){var s=r[0],t=s.code,i=s.message,a=s.path.join(".");if(!n[a])if("unionErrors"in s){var u=s.unionErrors[0].errors[0];n[a]={message:u.message,type:u.code};}else n[a]={message:i,type:t};if("unionErrors"in s&&s.unionErrors.forEach(function(e){return e.errors.forEach(function(e){return r.push(e)})}),e){var c=n[a].types,f=c&&c[s.code];n[a]=dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__.appendErrors(a,e,n,t,f?[].concat(f,s.message):s.message);}r.shift();}return n}function s$3(o,s,t){return void 0===t&&(t={}),function(i,a,u){try{return Promise.resolve(function(e,n){try{var a=Promise.resolve(o["sync"===t.mode?"parse":"parseAsync"](i,s)).then(function(e){return u.shouldUseNativeValidation&&o$4({},u),{errors:{},values:t.raw?Object.assign({},i):e}});}catch(r){return n(r)}return a&&a.then?a.then(void 0,n):a}(0,function(r){if(function(r){return Array.isArray(null==r?void 0:r.errors)}(r))return {values:{},errors:s$4(n$4(r.errors,!u.shouldUseNativeValidation&&"all"===u.criteriaMode),u)};throw r}))}catch(r){return Promise.reject(r)}}}

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.has` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */
function baseHas(object, key) {
  return object != null && hasOwnProperty.call(object, key);
}

/**
 * Checks if `path` exists on `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @param {Function} hasFunc The function to check properties.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 */
function hasPath(object, path, hasFunc) {
  path = castPath(path, object);

  var index = -1,
      length = path.length,
      result = false;

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
  return !!length && isLength(length) && isIndex(key, length) &&
    (isArray$4(object) || isArguments(object));
}

/**
 * Checks if `path` is a direct property of `object`.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = { 'a': { 'b': 2 } };
 * var other = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.has(object, 'a');
 * // => true
 *
 * _.has(object, 'a.b');
 * // => true
 *
 * _.has(object, ['a', 'b']);
 * // => true
 *
 * _.has(other, 'a');
 * // => false
 */
function has$4(object, path) {
  return object != null && hasPath(object, path, baseHas);
}

// dev uses dynamic import to separate chunks
    
    const {loadShare: loadShare$1} = index_cjs;
    const {initPromise: initPromise$1} = dashboard__mf_v__runtimeInit__mf_v__;
    const res$1 = initPromise$1.then(_ => loadShare$1("@refinedev/core", {
    customShareInfo: {shareConfig:{
      singleton: true,
      strictVersion: false,
      requiredVersion: "^4.57.10"
    }}}));
    const exportModule$1 = await res$1.then(factory => factory());
    var dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__ = exportModule$1;

var ee$1=Object.defineProperty;var R$5=(e,a)=>ee$1(e,"name",{value:a,configurable:true});var k$4=R$5(({refineCoreProps:e,warnWhenUnsavedChanges:a,disableServerSideValidation:c=false,...H}={})=>{let{options:y}=dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useRefineContext(),h=(y==null?void 0:y.disableServerSideValidation)||c,S=dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useTranslate(),{warnWhenUnsavedChanges:U,setWarnWhen:f}=dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useWarnAboutChange(),V=a??U,o=dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__.useForm({...H}),{watch:m,setValue:E,getValues:u,handleSubmit:n,setError:x}=o,b=dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useForm({...e,onMutationError:(t,i,r)=>{var F,v;if(h){(F=e==null?void 0:e.onMutationError)==null||F.call(e,t,i,r);return}let s=t==null?void 0:t.errors;for(let g in s){if(!Object.keys(dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.flattenObjectKeys(i)).includes(g))continue;let l=s[g],D="";Array.isArray(l)&&(D=l.join(" ")),typeof l=="string"&&(D=l),typeof l=="boolean"&&l&&(D="Field is not valid."),typeof l=="object"&&"key"in l&&(D=S(l.key,l.message)),x(g,{message:D});}(v=e==null?void 0:e.onMutationError)==null||v.call(e,t,i,r);}}),{query:p,onFinish:d,formLoading:B,onFinishAutoSave:M}=b;dashboard__loadShare__react__loadShare__.useEffect(()=>{var r;let t=(r=p==null?void 0:p.data)==null?void 0:r.data;if(!t)return;Object.keys(dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.flattenObjectKeys(u())).forEach(s=>{let F=has$4(t,s),v=get$1(t,s);F&&E(s,v);});},[p==null?void 0:p.data,E,u]),dashboard__loadShare__react__loadShare__.useEffect(()=>{let t=m((i,{type:r})=>{r==="change"&&W(i);});return ()=>t.unsubscribe()},[m]);let W=R$5(t=>{var i,r;if(V&&f(true),(i=e==null?void 0:e.autoSave)!=null&&i.enabled){f(false);let s=((r=e.autoSave)==null?void 0:r.onFinish)??(F=>F);return M(s(t)).catch(F=>F)}return t},"onValuesChange"),C=R$5((t,i)=>async r=>(f(false),n(t,i)(r)),"handleSubmit");return {...o,handleSubmit:C,refineCore:b,saveButtonProps:{disabled:B,onClick:t=>{C(i=>d(i).catch(()=>{}),()=>false)(t);}}}},"useForm");R$5(({stepsProps:e,...a}={})=>{let{defaultStep:c=0,isBackValidate:H=false}=e??{},[y,h]=dashboard__loadShare__react__loadShare__.useState(c),S=k$4({...a}),{trigger:U,getValues:f,setValue:V,formState:{dirtyFields:o},refineCore:{query:m}}=S;dashboard__loadShare__react__loadShare__.useEffect(()=>{var b;let n=(b=m==null?void 0:m.data)==null?void 0:b.data;if(!n)return;let x=Object.keys(f());console.log({dirtyFields:o,registeredFields:x,data:n}),Object.entries(n).forEach(([p,d])=>{let B=p;x.includes(B)&&(get$1(o,B)||V(B,d));});},[m==null?void 0:m.data,y,V,f]);let E=R$5(n=>{let x=n;n<0&&(x=0),h(x);},"go");return {...S,steps:{currentStep:y,gotoStep:R$5(async n=>{if(n===y)return;if(n<y&&!H){E(n);return}await U()&&E(n);},"gotoStep")}}},"useStepsForm");R$5(({modalProps:e,refineCoreProps:a,syncWithLocation:c,...H}={})=>{var N,I;let y=dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useInvalidate(),[h,S]=React3.useState(false),U=dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useTranslate(),{resource:f,action:V}=a??{},{resource:o,action:m,identifier:E}=dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useResource(f),u=dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useParsed(),n=dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useGo(),x=dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useUserFriendlyName(),b=V??m??"",p=!(typeof c=="object"&&(c==null?void 0:c.syncId)===false),d=typeof c=="object"&&"key"in c?c.key:o&&b&&c?`modal-${E}-${b}`:void 0,{defaultVisible:B=false,autoSubmitClose:M=true,autoResetForm:W=true,autoResetFormWhenClose:C=true}=e??{},O=k$4({refineCoreProps:{...a,meta:{...d?{[d]:void 0}:{},...a==null?void 0:a.meta}},...H}),{reset:t,refineCore:{onFinish:i,id:r,setId:s,autoSaveProps:F},saveButtonProps:v,handleSubmit:g}=O,{visible:Q,show:l,close:D}=dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useModal({defaultVisible:B});React3.useEffect(()=>{var T,j,P,G;if(h===false&&d){let w=(j=(T=u==null?void 0:u.params)==null?void 0:T[d])==null?void 0:j.open;if(typeof w=="boolean"?w&&l():typeof w=="string"&&w==="true"&&l(),p){let Y=(G=(P=u==null?void 0:u.params)==null?void 0:P[d])==null?void 0:G.id;Y&&(s==null||s(Y));}S(true);}},[d,u,p,s]),React3.useEffect(()=>{var T;h===true&&(Q&&d?n({query:{[d]:{...(T=u==null?void 0:u.params)==null?void 0:T[d],open:true,...p&&r&&{id:r}}},options:{keepQuery:true},type:"replace"}):d&&!Q&&n({query:{[d]:void 0},options:{keepQuery:true},type:"replace"}));},[r,Q,l,d,p]);let K=R$5(async T=>{await i(T),M&&D(),W&&t();},"submit"),{warnWhen:A,setWarnWhen:Z}=dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useWarnAboutChange(),_=dashboard__loadShare__react__loadShare__.useCallback(()=>{var T;if(F.status==="success"&&((T=a==null?void 0:a.autoSave)!=null&&T.invalidateOnClose)&&y({id:r,invalidates:a.invalidates||["list","many","detail"],dataProviderName:a.dataProviderName,resource:E}),A)if(window.confirm(U("warnWhenUnsavedChanges","Are you sure you want to leave? You have unsaved changes.")))Z(false);else return;s==null||s(void 0),D(),C&&t();},[A,F.status]),q=dashboard__loadShare__react__loadShare__.useCallback(T=>{typeof T<"u"&&(s==null||s(T)),(!(b==="edit"||b==="clone")||(typeof T<"u"||typeof r<"u"))&&l();},[r]),L=U(`${E}.titles.${V}`,void 0,`${x(`${V} ${((N=o==null?void 0:o.meta)==null?void 0:N.label)??((I=o==null?void 0:o.options)==null?void 0:I.label)??(o==null?void 0:o.label)??E}`,"singular")}`);return {modal:{submit:K,close:_,show:q,visible:Q,title:L},...O,saveButtonProps:{...v,onClick:T=>g(K)(T)}}},"useModalForm");

//#region src/components/form/adapters.tsx
const adapters = {
	refine: {
		Controller: dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__.Controller,
		FormProvider: dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__.FormProvider,
		submitHandler: async (config, methods) => {
			const values = methods.getValues();
			const refineResult = await methods.refineCore.onFinish({ ...values });
			if (config.onSubmit) {
				const submitResult = await config.onSubmit(values);
				return submitResult ?? refineResult;
			}
			return refineResult;
		},
		useForm: (options) => {
			return k$4({
				defaultValues: options.defaultValues,
				refineCoreProps: {
					autoSave: { enabled: false },
					...options.refineCoreProps ?? {}
				},
				resolver: options.validationSchema ? s$3(options.validationSchema) : void 0
			});
		}
	},
	rhf: {
		Controller: dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__.Controller,
		FormProvider: dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__.FormProvider,
		submitHandler: async (config, methods) => {
			if (!config.onSubmit) throw new Error("onSubmit required for RHF adapter");
			return await config.onSubmit(methods.getValues());
		},
		useForm: (options) => dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__.useForm({
			defaultValues: options.defaultValues,
			resolver: options.validationSchema ? s$3(options.validationSchema) : void 0
		})
	}
};

//#region src/components/form/context.tsx
const FormContext = dashboard__loadShare__react__loadShare__.createContext(void 0);
function FormProvider({ adapter, autoSave, children, config, formInstance }) {
	return /* @__PURE__ */ jsxRuntimeExports.jsx(FormContext.Provider, {
		value: {
			adapter,
			autoSave,
			config,
			formInstance
		},
		children
	});
}
function useFormContext() {
	const context = dashboard__loadShare__react__loadShare__.useContext(FormContext);
	if (context === void 0) throw new Error("useFormContext must be used within a FormProvider");
	return context;
}

//#region src/components/form/fields/registry.ts
const componentRegistry = /* @__PURE__ */ new Map();
function getFormComponent(type) {
	return componentRegistry.get(type);
}
function registerFormComponent(type, component, metadata) {
	componentRegistry.set(type, {
		component,
		handlesLabel: metadata?.handlesLabel
	});
}

//#region src/components/form/fields/types.ts
let FormFieldType = /* @__PURE__ */ function(FormFieldType$1) {
	FormFieldType$1["CHECKBOX"] = "checkbox";
	FormFieldType$1["CUSTOM"] = "custom";
	FormFieldType$1["DATE"] = "date";
	FormFieldType$1["EMAIL"] = "email";
	FormFieldType$1["FILE"] = "file";
	FormFieldType$1["PASSWORD"] = "password";
	FormFieldType$1["RADIO"] = "radio";
	FormFieldType$1["RICH_TEXT"] = "rich_text";
	FormFieldType$1["SELECT"] = "select";
	FormFieldType$1["SLIDER"] = "slider";
	FormFieldType$1["SWITCH"] = "switch";
	FormFieldType$1["TEXT"] = "text";
	FormFieldType$1["TEXTAREA"] = "textarea";
	return FormFieldType$1;
}({});

//#region src/components/form/fields/EmailInput.tsx
const EmailInput = React3.forwardRef(({ autocomplete,...props }, ref) => {
	return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Input, {
		ref,
		type: "email",
		autoComplete: autocomplete,
		...props
	});
});
EmailInput.displayName = "EmailInput";
function registerEmailInput() {
	registerFormComponent(FormFieldType.EMAIL, EmailInput);
}

//#region src/components/form/fields/FileInput.tsx
const FileInput = React3.forwardRef(({ autocomplete,...props }, ref) => {
	return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Input, {
		disabled: props.disabled,
		name: props.name,
		onBlur: props.onBlur,
		onChange: (e) => props.onChange?.(e.target.files),
		ref,
		type: "file",
		autoComplete: autocomplete
	});
});
FileInput.displayName = "FileInput";
function registerFileInput() {
	registerFormComponent(FormFieldType.FILE, FileInput);
}

//#region src/components/form/fields/Input.tsx
const Input = React3.forwardRef(({ inputClassName, onChange, placeholder, type, value, autocomplete, autoComplete: htmlAutoComplete,...props }, ref) => {
	return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Input, {
		className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("border-none bg-input h-14", inputClassName),
		onChange,
		placeholder,
		ref,
		type,
		value: value ?? "",
		autoComplete: autocomplete ?? htmlAutoComplete,
		...props
	});
});
Input.displayName = "Input";
function registerInput() {
	registerFormComponent(FormFieldType.TEXT, Input);
	registerFormComponent(FormFieldType.PASSWORD, Input);
}

//#region src/components/form/fields/RadioGroup.tsx
function slugify(str) {
	return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
const RadioGroup = React3.forwardRef(({ options, autocomplete,...props }, ref) => {
	return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.RadioGroup, {
		disabled: props.disabled,
		name: props.name,
		onBlur: props.onBlur,
		onValueChange: props.onChange,
		ref,
		value: props.value,
		children: options.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
			className: "radio-option",
			children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.RadioGroupItem, {
				id: `${props.name}-${slugify(option)}`,
				value: option,
				...autocomplete ? { autoComplete: autocomplete } : {}
			}), /* @__PURE__ */ jsxRuntimeExports.jsx("label", {
				className: props.labelClassName,
				htmlFor: `${props.name}-${slugify(option)}`,
				children: option
			})]
		}, option))
	});
});
RadioGroup.displayName = "RadioGroup";
function registerRadioGroup() {
	registerFormComponent(FormFieldType.RADIO, RadioGroup);
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const r$2=dashboard__loadShare__react__loadShare__.createContext(null);function t$2(n,e){return {getTheme:function(){return null!=e?e:null}}}function o$3(){const n=dashboard__loadShare__react__loadShare__.useContext(r$2);return null==n&&function(n,...e){const r=new URL("https://lexical.dev/docs/error"),t=new URLSearchParams;t.append("code",n);for(const n of e)t.append("v",n);throw r.search=t.toString(),Error(`Minified Lexical error #${n}; visit ${r.toString()} for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`)}(8),n}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

function t$1(t,...e){const n=new URL("https://lexical.dev/docs/error"),r=new URLSearchParams;r.append("code",t);for(const t of e)r.append("v",t);throw n.search=r.toString(),Error(`Minified Lexical error #${t}; visit ${n.toString()} for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`)}const e$1="undefined"!=typeof window&&void 0!==window.document&&void 0!==window.document.createElement,n$3=e$1&&"documentMode"in document?document.documentMode:null,r$1=e$1&&/Mac|iPod|iPhone|iPad/.test(navigator.platform),i$1=e$1&&/^(?!.*Seamonkey)(?=.*Firefox).*/i.test(navigator.userAgent),s$2=!(!e$1||!("InputEvent"in window)||n$3)&&"getTargetRanges"in new window.InputEvent("input"),o$2=e$1&&/Version\/[\d.]+.*Safari/.test(navigator.userAgent),l=e$1&&/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream,c$3=e$1&&/Android/.test(navigator.userAgent),a$4=e$1&&/^(?=.*Chrome).*/i.test(navigator.userAgent),u$3=e$1&&c$3&&a$4,f$5=e$1&&/AppleWebKit\/[\d.]+/.test(navigator.userAgent)&&!a$4;function d$3(...t){const e=[];for(const n of t)if(n&&"string"==typeof n)for(const[t]of n.matchAll(/\S+/g))e.push(t);return e}const h$6=1,g$5=3,_$3=9,p$3=11,y$4=0,m$5=1,x$6=2,C$2=0,S$2=1,v$4=2,b$2=4,N$2=8,A$4=128,O$3=1792|(112|(3|b$2|N$2)|A$4),D$5=1,P$4=2,F$1=3,L$2=4,I$4=5,z$5=6,K$3=o$2||l||f$5?" ":"​",B$5="\n\n",R$4=i$1?" ":K$3,W$3="֑-߿יִ-﷽ﹰ-ﻼ",J$5="A-Za-zÀ-ÖØ-öø-ʸ̀-֐ࠀ-῿‎Ⰰ-﬜︀-﹯﻽-￿",U$3=new RegExp("^[^"+J$5+"]*["+W$3+"]"),$$1=new RegExp("^[^"+W$3+"]*["+J$5+"]"),j$3={bold:1,capitalize:1024,code:16,highlight:A$4,italic:2,lowercase:256,strikethrough:b$2,subscript:32,superscript:64,underline:N$2,uppercase:512},V$3={directionless:1,unmergeable:2},Y$3={center:P$4,end:z$5,justify:L$2,left:D$5,right:F$1,start:I$4},H$2={[P$4]:"center",[z$5]:"end",[L$2]:"justify",[D$5]:"left",[F$1]:"right",[I$4]:"start"},q$2={normal:0,segmented:2,token:1},G$2={[C$2]:"normal",[v$4]:"segmented",[S$2]:"token"},X$4="$";function Q$2(t,e,n,r,i,s){let o=t.getFirstChild();for(;null!==o;){const t=o.__key;o.__parent===e&&(di(o)&&Q$2(o,t,n,r,i,s),n.has(t)||s.delete(t),i.push(t)),o=o.getNextSibling();}}const Z$4=100;let tt$3=false,et$4=0;function nt$3(t){et$4=t.timeStamp;}function rt$3(t,e,n){const r="BR"===t.nodeName,i=e.__lexicalLineBreak;return i&&(t===i||r&&t.previousSibling===i)||r&&void 0!==fs(t,n)}function it$3(t,e,n){const r=oo(Gs(n));let i=null,s=null;null!==r&&r.anchorNode===t&&(i=r.anchorOffset,s=r.focusOffset);const o=t.nodeValue;null!==o&&bs(e,o,i,s,false);}function st$2(t,e,n){if(cr(t)){const e=t.anchor.getNode();if(e.is(n)&&t.format!==e.getFormat())return  false}return Zi(e)&&n.isAttached()}function ot$2(t,e,n,r){for(let i=t;i&&!bo(i);i=Us(i)){const t=fs(i,e);if(void 0!==t){const e=as(t,n);if(e)return _i(e)||!uo(i)?void 0:[i,e]}else if(i===r)return [r,ps(n)]}}function lt$2(t,e,n){tt$3=true;const r=performance.now()-et$4>Z$4;try{ci(t,(()=>{const s=Nr()||function(t){return t.getEditorState().read((()=>{const t=Nr();return null!==t?t.clone():null}))}(t),o=new Map,l=t.getRootElement(),c=t._editorState,a=t._blockCursorElement;let u=!1,f="";for(let n=0;n<e.length;n++){const d=e[n],h=d.type,g=d.target,_=ot$2(g,t,c,l);if(!_)continue;const[p,y]=_;if("characterData"===h)r&&Qn(y)&&Zi(g)&&st$2(s,g,y)&&it$3(g,y,t);else if("childList"===h){u=!0;const e=d.addedNodes;for(let n=0;n<e.length;n++){const r=e[n],s=us(r),o=r.parentNode;if(null!=o&&r!==a&&null===s&&!rt$3(r,o,t)){if(i$1){const t=(uo(r)?r.innerText:null)||r.nodeValue;t&&(f+=t);}o.removeChild(r);}}const n=d.removedNodes,r=n.length;if(r>0){let e=0;for(let i=0;i<r;i++){const r=n[i];(rt$3(r,g,t)||a===r)&&(g.appendChild(r),e++);}r!==e&&o.set(p,y);}}}if(o.size>0)for(const[e,n]of o)n.reconcileObservedMutation(e,t);const d=n.takeRecords();if(d.length>0){for(let e=0;e<d.length;e++){const n=d[e],r=n.addedNodes,i=n.target;for(let e=0;e<r.length;e++){const n=r[e],s=n.parentNode;null==s||"BR"!==n.nodeName||rt$3(n,i,t)||s.removeChild(n);}}n.takeRecords();}null!==s&&(u&&ys(s),i$1&&Bs(t)&&s.insertRawText(f));}));}finally{tt$3=false;}}function ct$3(t){const e=t._observer;if(null!==e){lt$2(t,e.takeRecords(),e);}}function at$2(t){!function(t){0===et$4&&Gs(t).addEventListener("textInput",nt$3,true);}(t),t._observer=new MutationObserver(((e,n)=>{lt$2(t,e,n);}));}let pt$3 = class pt{constructor(t,e=new Map,n=void 0,r=new Map,i=void 0){this.node=t,this.sharedConfigMap=e,this.unknownState=n,this.knownState=r;const s=void 0!==i?i:function(t,e,n){let r=n.size;if(e)for(const i in e){const e=t.get(i);e&&n.has(e)||r++;}return r}(e,n,r);this.size=s;}getValue(t){const e=this.knownState.get(t);if(void 0!==e)return e;this.sharedConfigMap.set(t.key,t);let n=t.defaultValue;if(this.unknownState&&t.key in this.unknownState){const e=this.unknownState[t.key];void 0!==e&&(n=t.parse(e)),this.updateFromKnown(t,n);}return n}getInternalState(){return [this.unknownState,this.knownState]}toJSON(){const t={...this.unknownState};for(const[e,n]of this.knownState)e.isEqual(n,e.defaultValue)?delete t[e.key]:t[e.key]=e.unparse(n);return yt$4(t)?{[X$4]:t}:{}}getWritable(t){if(this.node===t)return this;const e=new Map(this.knownState),n=yt$4(r=this.unknownState)&&{...r};var r;if(n)for(const t of e.keys())delete n[t.key];return new pt(t,this.sharedConfigMap,yt$4(n),e,this.size)}updateFromKnown(t,e){const n=t.key;this.sharedConfigMap.set(n,t);const{knownState:r,unknownState:i}=this;r.has(t)||i&&n in i||this.size++,r.set(t,e);}updateFromUnknown(t,e){const n=this.sharedConfigMap.get(t);n?this.updateFromKnown(n,n.parse(e)):(this.unknownState=this.unknownState||{},t in this.unknownState||this.size++,this.unknownState[t]=e);}updateFromJSON(t){const{knownState:e}=this;for(const t of e.keys())e.set(t,t.defaultValue);if(this.size=e.size,this.unknownState={},t)for(const[e,n]of Object.entries(t))this.updateFromUnknown(e,n);this.unknownState=yt$4(this.unknownState);}};function yt$4(t){if(t)for(const e in t)return t}function mt$3(t){const e=t.getWritable(),n=e.__state?e.__state.getWritable(e):new pt$3(e);return e.__state=n,n}function xt$2(t,e){const n=t.__mode,r=t.__format,i=t.__style,s=e.__mode,o=e.__format,l=e.__style,c=t.__state,a=e.__state;return (null===n||n===s)&&(null===r||r===o)&&(null===i||i===l)&&(null===t.__state||c===a||function(t,e){if(t===e)return  true;if(t&&e&&t.size!==e.size)return  false;const n=new Set,r=(t,e)=>{for(const[r,i]of t.knownState){if(n.has(r.key))continue;n.add(r.key);const t=e?e.getValue(r):r.defaultValue;if(t!==i&&!r.isEqual(t,i))return  true}return  false},i=(t,e)=>{const{unknownState:r}=t,i=e?e.unknownState:void 0;if(r)for(const[t,e]of Object.entries(r))if(!n.has(t)&&(n.add(t),e!==(i?i[t]:void 0)))return  true;return  false};return !(t&&r(t,e)||e&&r(e,t)||t&&i(t,e)||e&&i(e,t))}(c,a))}function Ct$3(t,e){const n=t.mergeWithSibling(e),r=qr()._normalizedNodes;return r.add(t.__key),r.add(e.__key),n}function St$2(t){let e,n,r=t;if(""!==r.__text||!r.isSimpleText()||r.isUnmergeable()){for(;null!==(e=r.getPreviousSibling())&&Qn(e)&&e.isSimpleText()&&!e.isUnmergeable();){if(""!==e.__text){if(xt$2(e,r)){r=Ct$3(e,r);break}break}e.remove();}for(;null!==(n=r.getNextSibling())&&Qn(n)&&n.isSimpleText()&&!n.isUnmergeable();){if(""!==n.__text){if(xt$2(r,n)){r=Ct$3(r,n);break}break}n.remove();}}else r.remove();}function vt$4(t){return kt$1(t.anchor),kt$1(t.focus),t}function kt$1(t){for(;"element"===t.type;){const e=t.getNode(),n=t.offset;let r,i;if(n===e.getChildrenSize()?(r=e.getChildAtIndex(n-1),i=true):(r=e.getChildAtIndex(n),i=false),Qn(r)){t.set(r.__key,i?r.getTextContentSize():0,"text",true);break}if(!di(r))break;t.set(r.__key,i?r.getChildrenSize():0,"element",true);}}let Tt$3,bt$1,Nt$2,wt$3,Et$1,Mt$3,At$1,Ot$1,Dt$1,Pt$3,Ft$2="",Lt$2="",It$2=null,zt="",Kt="",Bt$1=false,Rt$1=false,Wt=null;function Jt(t,e){const n=At$1.get(t);if(null!==e){const n=se(t);n.parentNode===e&&e.removeChild(n);}if(Ot$1.has(t)||bt$1._keyToDOMMap.delete(t),di(n)){const t=te(n,At$1);Ut(t,0,t.length-1,null);} void 0!==n&&Ls(Pt$3,Nt$2,wt$3,n,"destroyed");}function Ut(t,e,n,r){let i=e;for(;i<=n;++i){const e=t[i];void 0!==e&&Jt(e,r);}}function $t$1(t,e){t.setProperty("text-align",e);}const jt$1="40px";function Vt(t,e){const n=Tt$3.theme.indent;if("string"==typeof n){const r=t.classList.contains(n);e>0&&!r?t.classList.add(n):e<1&&r&&t.classList.remove(n);}const r=getComputedStyle(t).getPropertyValue("--lexical-indent-base-value")||jt$1;t.style.setProperty("padding-inline-start",0===e?"":`calc(${e} * ${r})`);}function Yt(t,e){const n=t.style;0===e?$t$1(n,""):e===D$5?$t$1(n,"left"):e===P$4?$t$1(n,"center"):e===F$1?$t$1(n,"right"):e===L$2?$t$1(n,"justify"):e===I$4?$t$1(n,"start"):e===z$5&&$t$1(n,"end");}function Ht(e,n){const r=Ot$1.get(e);void 0===r&&t$1(60);const i=r.createDOM(Tt$3,bt$1);if(function(t,e,n){const r=n._keyToDOMMap;((function(t,e,n){const r=`__lexicalKey_${e._key}`;t[r]=n;}))(e,n,t),r.set(t,e);}(e,i,bt$1),Qn(r)?i.setAttribute("data-lexical-text","true"):_i(r)&&i.setAttribute("data-lexical-decorator","true"),di(r)){const t=r.__indent,e=r.__size;if(0!==t&&Vt(i,t),0!==e){const t=e-1;!function(t,e,n,r){const i=Lt$2;Lt$2="",qt(t,n,0,e,n.getDOMSlot(r)),Qt(n,r),Lt$2=i;}(te(r,Ot$1),t,r,i);}const n=r.__format;0!==n&&Yt(i,n),r.isInline()||Xt(null,r,i),Ws(r)&&(Ft$2+=B$5,Kt+=B$5);}else {const t=r.getTextContent();if(_i(r)){const t=r.decorate(bt$1,Tt$3);null!==t&&ne(e,t),i.contentEditable="false";}else Qn(r)&&(r.isDirectionless()||(Lt$2+=t));Ft$2+=t,Kt+=t;}return null!==n&&n.insertChild(i),Ls(Pt$3,Nt$2,wt$3,r,"created"),i}function qt(t,e,n,r,i){const s=Ft$2;Ft$2="";let o=n;for(;o<=r;++o){Ht(t[o],i);const e=Ot$1.get(t[o]);null!==e&&Qn(e)&&(null===It$2&&(It$2=e.getFormat()),""===zt&&(zt=e.getStyle()));}Ws(e)&&(Ft$2+=B$5);i.element.__lexicalTextContent=Ft$2,Ft$2=s+Ft$2;}function Gt(t,e){if(t){const n=t.__last;if(n){const t=e.get(n);if(t)return Fn(t)?"line-break":_i(t)&&t.isInline()?"decorator":null}return "empty"}return null}function Xt(t,e,n){const r=Gt(t,At$1),i=Gt(e,Ot$1);r!==i&&e.getDOMSlot(n).setManagedLineBreak(i);}function Qt(t,e){const n=e.__lexicalDirTextContent||"",r=e.__lexicalDir||"";if(n!==Lt$2||r!==Wt){const n=""===Lt$2,i=n?Wt:function(t){if(U$3.test(t))return "rtl";if($$1.test(t))return "ltr";return null}(Lt$2);if(i!==r){const s=e.classList,o=Tt$3.theme;let l=null!==r?o[r]:void 0,c=null!==i?o[i]:void 0;if(void 0!==l){if("string"==typeof l){const t=d$3(l);l=o[r]=t;}s.remove(...l);}if(null===i||n&&"ltr"===i)e.removeAttribute("dir");else {if(void 0!==c){if("string"==typeof c){const t=d$3(c);c=o[i]=t;} void 0!==c&&s.add(...c);}e.dir=i;}if(!Rt$1){t.getWritable().__dir=i;}}Wt=i,e.__lexicalDirTextContent=Lt$2,e.__lexicalDir=i;}}function Zt(e,n,r){const i=Lt$2;var s;Lt$2="",It$2=null,zt="",function(e,n,r){const i=Ft$2,s=e.__size,o=n.__size;Ft$2="";const l=r.element;if(1===s&&1===o){const t=e.__first,r=n.__first;if(t===r)ee(t,l);else {const e=se(t),n=Ht(r,null);try{l.replaceChild(n,e);}catch(i){if("object"==typeof i&&null!=i){const s=`${i.toString()} Parent: ${l.tagName}, new child: {tag: ${n.tagName} key: ${r}}, old child: {tag: ${e.tagName}, key: ${t}}.`;throw new Error(s)}throw i}Jt(t,null);}const i=Ot$1.get(r);Qn(i)&&(null===It$2&&(It$2=i.getFormat()),""===zt&&(zt=i.getStyle()));}else {const i=te(e,At$1),c=te(n,Ot$1);if(i.length!==s&&t$1(227),c.length!==o&&t$1(228),0===s)0!==o&&qt(c,n,0,o-1,r);else if(0===o){if(0!==s){const t=null==r.after&&null==r.before&&null==r.element.__lexicalLineBreak;Ut(i,0,s-1,t?null:l),t&&(l.textContent="");}}else !function(t,e,n,r,i,s){const o=r-1,l=i-1;let c,a,u=s.getFirstChild(),f=0,d=0;for(;f<=o&&d<=l;){const t=e[f],r=n[d];if(t===r)u=re(ee(r,s.element)),f++,d++;else { void 0===c&&(c=new Set(e)),void 0===a&&(a=new Set(n));const i=a.has(t),o=c.has(r);if(i)if(o){const t=Js(bt$1,r);t===u?u=re(ee(r,s.element)):(s.withBefore(u).insertChild(t),ee(r,s.element)),f++,d++;}else Ht(r,s.withBefore(u)),d++;else u=re(se(t)),Jt(t,s.element),f++;}const i=Ot$1.get(r);null!==i&&Qn(i)&&(null===It$2&&(It$2=i.getFormat()),""===zt&&(zt=i.getStyle()));}const h=f>o,g=d>l;if(h&&!g){const e=n[l+1],r=void 0===e?null:bt$1.getElementByKey(e);qt(n,t,d,l,s.withBefore(r));}else g&&!h&&Ut(e,f,o,s.element);}(n,i,c,s,o,r);}Ws(n)&&(Ft$2+=B$5);l.__lexicalTextContent=Ft$2,Ft$2=i+Ft$2;}(e,n,n.getDOMSlot(r)),Qt(n,r),s=n,null==It$2||It$2===s.__textFormat||Rt$1||s.setTextFormat(It$2),function(t){""===zt||zt===t.__textStyle||Rt$1||t.setTextStyle(zt);}(n),Lt$2=i;}function te(e,n){const r=[];let i=e.__first;for(;null!==i;){const e=n.get(i);void 0===e&&t$1(101),r.push(i),i=e.__next;}return r}function ee(e,n){const r=At$1.get(e);let i=Ot$1.get(e);void 0!==r&&void 0!==i||t$1(61);const s=Bt$1||Mt$3.has(e)||Et$1.has(e),o=Js(bt$1,e);if(r===i&&!s){if(di(r)){const t=o.__lexicalTextContent;void 0!==t&&(Ft$2+=t,Kt+=t);const e=o.__lexicalDirTextContent;void 0!==e&&(Lt$2+=e);}else {const t=r.getTextContent();Qn(r)&&!r.isDirectionless()&&(Lt$2+=t),Kt+=t,Ft$2+=t;}return o}if(r!==i&&s&&Ls(Pt$3,Nt$2,wt$3,i,"updated"),i.updateDOM(r,o,Tt$3)){const r=Ht(e,null);return null===n&&t$1(62),n.replaceChild(r,o),Jt(e,null),r}if(di(r)&&di(i)){const t=i.__indent;t!==r.__indent&&Vt(o,t);const e=i.__format;e!==r.__format&&Yt(o,e),s&&(Zt(r,i,o),yi(i)||i.isInline()||Xt(r,i,o)),Ws(i)&&(Ft$2+=B$5,Kt+=B$5);}else {const t=i.getTextContent();if(_i(i)){const t=i.decorate(bt$1,Tt$3);null!==t&&ne(e,t);}else Qn(i)&&!i.isDirectionless()&&(Lt$2+=t);Ft$2+=t,Kt+=t;}if(!Rt$1&&yi(i)&&i.__cachedText!==Kt){const t=i.getWritable();t.__cachedText=Kt,i=t;}return o}function ne(t,e){let n=bt$1._pendingDecorators;const r=bt$1._decorators;if(null===n){if(r[t]===e)return;n=hs(bt$1);}n[t]=e;}function re(t){let e=t.nextSibling;return null!==e&&e===bt$1._blockCursorElement&&(e=e.nextSibling),e}function ie(t,e,n,r,i,s){Ft$2="",Kt="",Lt$2="",Bt$1=r===x$6,Wt=null,bt$1=n,Tt$3=n._config,Nt$2=n._nodes,wt$3=bt$1._listeners.mutation,Et$1=i,Mt$3=s,At$1=t._nodeMap,Ot$1=e._nodeMap,Rt$1=e._readOnly,Dt$1=new Map(n._keyToDOMMap);const o=new Map;return Pt$3=o,ee("root",null),bt$1=void 0,Nt$2=void 0,Et$1=void 0,Mt$3=void 0,At$1=void 0,Ot$1=void 0,Tt$3=void 0,Dt$1=void 0,Pt$3=void 0,o}function se(e){const n=Dt$1.get(e);return void 0===n&&t$1(75,e),n}function oe(t){return {type:t}}const le=oe("SELECTION_CHANGE_COMMAND"),ce=oe("SELECTION_INSERT_CLIPBOARD_NODES_COMMAND"),ae=oe("CLICK_COMMAND"),ue=oe("DELETE_CHARACTER_COMMAND"),fe=oe("INSERT_LINE_BREAK_COMMAND"),de=oe("INSERT_PARAGRAPH_COMMAND"),he=oe("CONTROLLED_TEXT_INSERTION_COMMAND"),ge=oe("PASTE_COMMAND"),_e=oe("REMOVE_TEXT_COMMAND"),pe=oe("DELETE_WORD_COMMAND"),ye=oe("DELETE_LINE_COMMAND"),me=oe("FORMAT_TEXT_COMMAND"),xe=oe("UNDO_COMMAND"),Ce=oe("REDO_COMMAND"),Se=oe("KEYDOWN_COMMAND"),ve=oe("KEY_ARROW_RIGHT_COMMAND"),ke=oe("MOVE_TO_END"),Te=oe("KEY_ARROW_LEFT_COMMAND"),be=oe("MOVE_TO_START"),Ne=oe("KEY_ARROW_UP_COMMAND"),we=oe("KEY_ARROW_DOWN_COMMAND"),Ee=oe("KEY_ENTER_COMMAND"),Me=oe("KEY_SPACE_COMMAND"),Ae=oe("KEY_BACKSPACE_COMMAND"),Oe=oe("KEY_ESCAPE_COMMAND"),De=oe("KEY_DELETE_COMMAND"),Pe=oe("KEY_TAB_COMMAND"),Fe=oe("INSERT_TAB_COMMAND"),Le=oe("INDENT_CONTENT_COMMAND"),Ie=oe("OUTDENT_CONTENT_COMMAND"),ze=oe("DROP_COMMAND"),Ke=oe("FORMAT_ELEMENT_COMMAND"),Be=oe("DRAGSTART_COMMAND"),Re=oe("DRAGOVER_COMMAND"),We=oe("DRAGEND_COMMAND"),Je=oe("COPY_COMMAND"),Ue=oe("CUT_COMMAND"),$e=oe("SELECT_ALL_COMMAND"),je=oe("CLEAR_EDITOR_COMMAND"),Ve=oe("CLEAR_HISTORY_COMMAND"),Ye=oe("CAN_REDO_COMMAND"),He=oe("CAN_UNDO_COMMAND"),qe=oe("FOCUS_COMMAND"),Ge=oe("BLUR_COMMAND"),Xe=oe("KEY_MODIFIER_COMMAND"),Qe=Object.freeze({}),Ze=30,tn=[["keydown",function(t,e){if(en=t.timeStamp,nn=t.key,e.isComposing())return;if(Rs(e,Se,t))return;if(null==t.key)return;if(fn&&Os(t))return ci(e,(()=>{Sn(e,dn);})),fn=false,void(dn="");if(function(t){return Es(t,"ArrowRight",{shiftKey:"any"})}(t))Rs(e,ve,t);else if(function(t){return Es(t,"ArrowRight",Ms)}(t))Rs(e,ke,t);else if(function(t){return Es(t,"ArrowLeft",{shiftKey:"any"})}(t))Rs(e,Te,t);else if(function(t){return Es(t,"ArrowLeft",Ms)}(t))Rs(e,be,t);else if(function(t){return Es(t,"ArrowUp",{altKey:"any",shiftKey:"any"})}(t))Rs(e,Ne,t);else if(function(t){return Es(t,"ArrowDown",{altKey:"any",shiftKey:"any"})}(t))Rs(e,we,t);else if(function(t){return Es(t,"Enter",{altKey:"any",ctrlKey:"any",metaKey:"any",shiftKey:true})}(t))an=true,Rs(e,Ee,t);else if(function(t){return " "===t.key}(t))Rs(e,Me,t);else if(function(t){return r$1&&Es(t,"o",{ctrlKey:true})}(t))t.preventDefault(),an=true,Rs(e,fe,true);else if(function(t){return Es(t,"Enter",{altKey:"any",ctrlKey:"any",metaKey:"any"})}(t))an=false,Rs(e,Ee,t);else if(function(t){return Es(t,"Backspace",{shiftKey:"any"})||r$1&&Es(t,"h",{ctrlKey:true})}(t))Os(t)?Rs(e,Ae,t):(t.preventDefault(),Rs(e,ue,true));else if(function(t){return "Escape"===t.key}(t))Rs(e,Oe,t);else if(function(t){return Es(t,"Delete",{})||r$1&&Es(t,"d",{ctrlKey:true})}(t))!function(t){return "Delete"===t.key}(t)?(t.preventDefault(),Rs(e,ue,false)):Rs(e,De,t);else if(function(t){return Es(t,"Backspace",As)}(t))t.preventDefault(),Rs(e,pe,true);else if(function(t){return Es(t,"Delete",As)}(t))t.preventDefault(),Rs(e,pe,false);else if(function(t){return r$1&&Es(t,"Backspace",{metaKey:true})}(t))t.preventDefault(),Rs(e,ye,true);else if(function(t){return r$1&&(Es(t,"Delete",{metaKey:true})||Es(t,"k",{ctrlKey:true}))}(t))t.preventDefault(),Rs(e,ye,false);else if(function(t){return Es(t,"b",Ms)}(t))t.preventDefault(),Rs(e,me,"bold");else if(function(t){return Es(t,"u",Ms)}(t))t.preventDefault(),Rs(e,me,"underline");else if(function(t){return Es(t,"i",Ms)}(t))t.preventDefault(),Rs(e,me,"italic");else if(function(t){return Es(t,"Tab",{shiftKey:"any"})}(t))Rs(e,Pe,t);else if(function(t){return Es(t,"z",Ms)}(t))t.preventDefault(),Rs(e,xe,void 0);else if(function(t){if(r$1)return Es(t,"z",{metaKey:true,shiftKey:true});return Es(t,"y",{ctrlKey:true})||Es(t,"z",{ctrlKey:true,shiftKey:true})}(t))t.preventDefault(),Rs(e,Ce,void 0);else {const n=e._editorState._selection;null===n||cr(n)?!i$1&&Ds(t)&&(t.preventDefault(),Rs(e,$e,t)):!function(t){return Es(t,"c",Ms)}(t)?!function(t){return Es(t,"x",Ms)}(t)?Ds(t)&&(t.preventDefault(),Rs(e,$e,t)):(t.preventDefault(),Rs(e,Ue,t)):(t.preventDefault(),Rs(e,Je,t));}(function(t){return t.ctrlKey||t.shiftKey||t.altKey||t.metaKey})(t)&&Rs(e,Xe,t);}],["pointerdown",function(t,e){const n=t.target,r=t.pointerType;fo(n)&&"touch"!==r&&0===t.button&&ci(e,(()=>{Vi(n)||(cn=true);}));}],["compositionstart",function(t,e){ci(e,(()=>{const n=Nr();if(cr(n)&&!e.isComposing()){const r=n.anchor,i=n.anchor.getNode();ls(r.key),(t.timeStamp<en+Ze||"element"===r.type||!n.isCollapsed()||i.getFormat()!==n.format||Qn(i)&&i.getStyle()!==n.style)&&Rs(e,he,R$4);}}));}],["compositionend",function(t,e){i$1?un=true:l||!o$2&&!f$5?ci(e,(()=>{Sn(e,t.data);})):(fn=true,dn=t.data);}],["input",function(t,e){t.stopPropagation(),ci(e,(()=>{if(uo(t.target)&&Vi(t.target))return;const n=Nr(),r=t.data,c=Cn(t);if(null!=r&&cr(n)&&_n(n,c,r,t.timeStamp,false)){un&&(Sn(e,r),un=false);const c=n.anchor.getNode(),a=oo(Gs(e));if(null===a)return;const u=n.isBackward(),d=u?n.anchor.offset:n.focus.offset,h=u?n.focus.offset:n.anchor.offset;s$2&&!n.isCollapsed()&&Qn(c)&&null!==a.anchorNode&&c.getTextContent().slice(0,d)+r+c.getTextContent().slice(d+h)===ks(a.anchorNode)||Rs(e,he,r);const g=r.length;i$1&&g>1&&"insertCompositionText"===t.inputType&&!e.isComposing()&&(n.anchor.offset-=g),o$2||l||f$5||!e.isComposing()||(en=0,ls(null));}else {Ts(false,e,null!==r?r:void 0),un&&(Sn(e,r||void 0),un=false);}!function(){Vr();const t=qr();ct$3(t);}();}),{event:t}),sn=null;}],["click",function(t,e){ci(e,(()=>{const n=Nr(),r=oo(Gs(e)),i=wr();if(r)if(cr(n)){const e=n.anchor,s=e.getNode();if("element"===e.type&&0===e.offset&&n.isCollapsed()&&!yi(s)&&1===_s().getChildrenSize()&&s.getTopLevelElementOrThrow().isEmpty()&&null!==i&&n.is(i))r.removeAllRanges(),n.dirty=true;else if(3===t.detail&&!n.isCollapsed()){if(s!==n.focus.getNode()){const t=function(t,e){let n=t;for(;n!==_s()&&null!=n;){if(e(n))return n;n=n.getParent();}return null}(s,(t=>di(t)&&!t.isInline()));di(t)&&t.select(0);}}}else if("touch"===t.pointerType){const n=r.anchorNode;if(uo(n)||Zi(n)){ys(br(i,r,e,t));}}Rs(e,ae,t);}));}],["cut",Qe],["copy",Qe],["dragstart",Qe],["dragover",Qe],["dragend",Qe],["paste",Qe],["focus",Qe],["blur",Qe],["drop",Qe]];s$2&&tn.push(["beforeinput",(e,n)=>function(e,n){const r=e.inputType,s=Cn(e);if("deleteCompositionText"===r||i$1&&Bs(n))return;if("insertCompositionText"===r)return;ci(n,(()=>{const i=Nr();if("deleteContentBackward"===r){if(null===i){const t=wr();if(!cr(t))return;ys(t.clone());}if(cr(i)){const r=i.anchor.key===i.focus.key;if(o=e.timeStamp,"MediaLast"===nn&&o<en+Ze&&n.isComposing()&&r){if(ls(null),en=0,setTimeout((()=>{ci(n,(()=>{ls(null);}));}),Ze),cr(i)){const e=i.anchor.getNode();e.markDirty(),Qn(e)||t$1(142),xn(i,e);}}else {ls(null),e.preventDefault();const t=i.anchor.getNode(),s=t.getTextContent(),o=t.canInsertTextAfter(),l=0===i.anchor.offset&&i.focus.offset===s.length;let c=u$3&&r&&!l&&o;if(c&&i.isCollapsed()&&(c=!_i(Ks(i.anchor,true))),!c){Rs(n,ue,true);const t=Nr();u$3&&cr(t)&&t.isCollapsed()&&(hn=t,setTimeout((()=>hn=null)));}}return}}var o;if(!cr(i))return;const c=e.data;null!==sn&&Ts(false,n,sn),i.dirty&&null===sn||!i.isCollapsed()||yi(i.anchor.getNode())||null===s||i.applyDOMRange(s),sn=null;const a=i.anchor,f=i.focus,d=a.getNode(),h=f.getNode();if("insertText"!==r&&"insertTranspose"!==r)switch(e.preventDefault(),r){case "insertFromYank":case "insertFromDrop":case "insertReplacementText":Rs(n,he,e);break;case "insertFromComposition":ls(null),Rs(n,he,e);break;case "insertLineBreak":ls(null),Rs(n,fe,false);break;case "insertParagraph":ls(null),an&&!l?(an=false,Rs(n,fe,false)):Rs(n,de,void 0);break;case "insertFromPaste":case "insertFromPasteAsQuotation":Rs(n,ge,e);break;case "deleteByComposition":(function(t,e){return t!==e||di(t)||di(e)||!t.isToken()||!e.isToken()})(d,h)&&Rs(n,_e,e);break;case "deleteByDrag":case "deleteByCut":Rs(n,_e,e);break;case "deleteContent":Rs(n,ue,false);break;case "deleteWordBackward":Rs(n,pe,true);break;case "deleteWordForward":Rs(n,pe,false);break;case "deleteHardLineBackward":case "deleteSoftLineBackward":Rs(n,ye,true);break;case "deleteContentForward":case "deleteHardLineForward":case "deleteSoftLineForward":Rs(n,ye,false);break;case "formatStrikeThrough":Rs(n,me,"strikethrough");break;case "formatBold":Rs(n,me,"bold");break;case "formatItalic":Rs(n,me,"italic");break;case "formatUnderline":Rs(n,me,"underline");break;case "historyUndo":Rs(n,xe,void 0);break;case "historyRedo":Rs(n,Ce,void 0);}else {if("\n"===c)e.preventDefault(),Rs(n,fe,false);else if(c===B$5)e.preventDefault(),Rs(n,de,void 0);else if(null==c&&e.dataTransfer){const t=e.dataTransfer.getData("text/plain");e.preventDefault(),i.insertRawText(t);}else null!=c&&_n(i,s,c,e.timeStamp,true)?(e.preventDefault(),Rs(n,he,c)):sn=c;rn=e.timeStamp;}}));}(e,n)]);let en=0,nn=null,rn=0,sn=null;const on=new WeakMap;let ln=false,cn=false,an=false,un=false,fn=false,dn="",hn=null,gn=[0,"",0,"root",0];function _n(t,e,n,r,i){const o=t.anchor,l=t.focus,c=o.getNode(),a=qr(),u=oo(Gs(a)),f=null!==u?u.anchorNode:null,d=o.key,h=a.getElementByKey(d),g=n.length;return d!==l.key||!Qn(c)||(!i&&(!s$2||rn<r+50)||c.isDirty()&&g<2||Cs(n))&&o.offset!==l.offset&&!c.isComposing()||Qi(c)||c.isDirty()&&g>1||(i||!s$2)&&null!==h&&!c.isComposing()&&f!==es(h)||null!==u&&null!==e&&(!e.collapsed||e.startContainer!==u.anchorNode||e.startOffset!==u.anchorOffset)||c.getFormat()!==t.format||c.getStyle()!==t.style||function(t,e){if(e.isSegmented())return  true;if(!t.isCollapsed())return  false;const n=t.anchor.offset,r=e.getParentOrThrow(),i=e.isToken();return 0===n?!e.canInsertTextBefore()||!r.canInsertTextBefore()&&!e.isComposing()||i||function(t){const e=t.getPreviousSibling();return (Qn(e)||di(e)&&e.isInline())&&!e.canInsertTextAfter()}(e):n===e.getTextContentSize()&&(!e.canInsertTextAfter()||!r.canInsertTextAfter()&&!e.isComposing()||i)}(t,c)}function pn(t,e){return Zi(t)&&null!==t.nodeValue&&0!==e&&e!==t.nodeValue.length}function yn(e,n,r){const{anchorNode:i,anchorOffset:s,focusNode:o,focusOffset:l}=e;ln&&(ln=false,pn(i,s)&&pn(o,l)&&!hn)||ci(n,(()=>{if(!r)return void ys(null);if(!Hi(n,i,o))return;let c=Nr();if(hn&&cr(c)&&c.isCollapsed()){const t=c.anchor,e=hn.anchor;(t.key===e.key&&t.offset===e.offset+1||1===t.offset&&e.getNode().is(t.getNode().getPreviousSibling()))&&(c=hn.clone(),ys(c));}if(hn=null,cr(c)){const r=c.anchor,i=r.getNode();if(c.isCollapsed()){"Range"===e.type&&e.anchorNode===e.focusNode&&(c.dirty=true);const s=Gs(n).event,o=s?s.timeStamp:performance.now(),[l,a,u,f,d]=gn,h=_s(),g=false===n.isComposing()&&""===h.getTextContent();if(o<d+200&&r.offset===u&&r.key===f)mn(c,l,a);else if("text"===r.type)Qn(i)||t$1(141),xn(c,i);else if("element"===r.type&&!g){di(i)||t$1(259);const e=r.getNode();e.isEmpty()?function(t,e){const n=e.getTextFormat(),r=e.getTextStyle();mn(t,n,r);}(c,e):mn(c,0,"");}}else {const t=r.key,e=c.focus.key,n=c.getNodes(),i=n.length,o=c.isBackward(),a=o?l:s,u=o?s:l,f=o?e:t,d=o?t:e;let h=O$3,g=false;for(let t=0;t<i;t++){const e=n[t],r=e.getTextContentSize();if(Qn(e)&&0!==r&&!(0===t&&e.__key===f&&a===r||t===i-1&&e.__key===d&&0===u)&&(g=true,h&=e.getFormat(),0===h))break}c.format=g?h:0;}}Rs(n,le,void 0);}));}function mn(t,e,n){t.format===e&&t.style===n||(t.format=e,t.style=n,t.dirty=true);}function xn(t,e){mn(t,e.getFormat(),e.getStyle());}function Cn(t){if(!t.getTargetRanges)return null;const e=t.getTargetRanges();return 0===e.length?null:e[0]}function Sn(t,e){const n=t._compositionKey;if(ls(null),null!==n&&null!=e){if(""===e){const e=as(n),r=es(t.getElementByKey(n));return void(null!==r&&null!==r.nodeValue&&Qn(e)&&bs(e,r.nodeValue,null,null,true))}if("\n"===e[e.length-1]){const e=Nr();if(cr(e)){const n=e.focus;return e.anchor.set(n.key,n.offset,n.type),void Rs(t,Ee,null)}}}Ts(true,t,e);}function vn(t){let e=t.__lexicalEventHandles;return void 0===e&&(e=[],t.__lexicalEventHandles=e),e}const kn=new Map;function Tn(t){const e=lo(t.target);if(null===e)return;const n=Gi(e.anchorNode);if(null===n)return;cn&&(cn=false,ci(n,(()=>{const r=wr(),i=e.anchorNode;if(uo(i)||Zi(i)){ys(br(r,e,n,t));}})));const r=Ss(n),i=r[r.length-1],s=i._key,o=kn.get(s),l=o||i;l!==n&&yn(e,l,false),yn(e,n,true),n!==i?kn.set(s,n):o&&kn.delete(s);}function bn(t){t._lexicalHandled=true;}function Nn(t){return  true===t._lexicalHandled}function En(e){const n=e.ownerDocument,r=on.get(n);if(void 0===r)return void 0;const i=r-1;i>=0||t$1(164),on.set(n,i),0===i&&n.removeEventListener("selectionchange",Tn);const s=Xi(e);qi(s)?(!function(t){if(null!==t._parentEditor){const e=Ss(t),n=e[e.length-1]._key;kn.get(n)===t&&kn.delete(n);}else kn.delete(t._key);}(s),e.__lexicalEditor=null):s&&t$1(198);const o=vn(e);for(let t=0;t<o.length;t++)o[t]();e.__lexicalEventHandles=[];}function Mn(t,e,n){Vr();const r=t.__key,i=t.getParent();if(null===i)return;const s=function(t){const e=Nr();if(!cr(e)||!di(t))return e;const{anchor:n,focus:r}=e,i=n.getNode(),s=r.getNode();Hs(i,t)&&n.set(t.__key,0,"element");Hs(s,t)&&r.set(t.__key,0,"element");return e}(t);let o=false;if(cr(s)&&e){const e=s.anchor,n=s.focus;e.key===r&&(Ar(e,t,i,t.getPreviousSibling(),t.getNextSibling()),o=true),n.key===r&&(Ar(n,t,i,t.getPreviousSibling(),t.getNextSibling()),o=true);}else ur(s)&&e&&t.isSelected()&&t.selectPrevious();if(cr(s)&&e&&!o){const e=t.getIndexWithinParent();ss(t),Er(s,i,e,-1);}else ss(t);n||Zs(i)||i.canBeEmpty()||!i.isEmpty()||Mn(i,e),e&&s&&yi(i)&&i.isEmpty()&&i.selectEnd();}class An{static getType(){t$1(64,this.name);}static clone(e){t$1(65,this.name);}afterCloneFrom(t){this.__parent=t.__parent,this.__next=t.__next,this.__prev=t.__prev,this.__state=t.__state;}constructor(t){this.__type=this.constructor.getType(),this.__parent=null,this.__prev=null,this.__next=null,Object.defineProperty(this,"__state",{configurable:true,enumerable:false,value:void 0,writable:true}),is$1(this,t);}getType(){return this.__type}isInline(){t$1(137,this.constructor.name);}isAttached(){let t=this.__key;for(;null!==t;){if("root"===t)return  true;const e=as(t);if(null===e)break;t=e.__parent;}return  false}isSelected(t){const e=t||Nr();if(null==e)return  false;const n=e.getNodes().some((t=>t.__key===this.__key));if(Qn(this))return n;if(cr(e)&&"element"===e.anchor.type&&"element"===e.focus.type){if(e.isCollapsed())return  false;const t=this.getParent();if(_i(this)&&this.isInline()&&t){const n=e.isBackward()?e.focus:e.anchor;if(t.is(n.getNode())&&n.offset===t.getChildrenSize()&&this.is(t.getLastChild()))return  false}}return n}getKey(){return this.__key}getIndexWithinParent(){const t=this.getParent();if(null===t)return  -1;let e=t.getFirstChild(),n=0;for(;null!==e;){if(this.is(e))return n;n++,e=e.getNextSibling();}return  -1}getParent(){const t=this.getLatest().__parent;return null===t?null:as(t)}getParentOrThrow(){const e=this.getParent();return null===e&&t$1(66,this.__key),e}getTopLevelElement(){let e=this;for(;null!==e;){const n=e.getParent();if(Zs(n))return di(e)||e===this&&_i(e)||t$1(194),e;e=n;}return null}getTopLevelElementOrThrow(){const e=this.getTopLevelElement();return null===e&&t$1(67,this.__key),e}getParents(){const t=[];let e=this.getParent();for(;null!==e;)t.push(e),e=e.getParent();return t}getParentKeys(){const t=[];let e=this.getParent();for(;null!==e;)t.push(e.__key),e=e.getParent();return t}getPreviousSibling(){const t=this.getLatest().__prev;return null===t?null:as(t)}getPreviousSiblings(){const t=[],e=this.getParent();if(null===e)return t;let n=e.getFirstChild();for(;null!==n&&!n.is(this);)t.push(n),n=n.getNextSibling();return t}getNextSibling(){const t=this.getLatest().__next;return null===t?null:as(t)}getNextSiblings(){const t=[];let e=this.getNextSibling();for(;null!==e;)t.push(e),e=e.getNextSibling();return t}getCommonAncestor(t){const e=di(this)?this:this.getParent(),n=di(t)?t:t.getParent(),r=e&&n?sl(e,n):null;return r?r.commonAncestor:null}is(t){return null!=t&&this.__key===t.__key}isBefore(e){const n=sl(this,e);return null!==n&&("descendant"===n.type||("branch"===n.type?-1===nl(n):("same"!==n.type&&"ancestor"!==n.type&&t$1(279),false)))}isParentOf(t){const e=sl(this,t);return null!==e&&"ancestor"===e.type}getNodesBetween(e){const n=this.isBefore(e),r=[],i=new Set;let s=this;for(;null!==s;){const o=s.__key;if(i.has(o)||(i.add(o),r.push(s)),s===e)break;const l=di(s)?n?s.getFirstChild():s.getLastChild():null;if(null!==l){s=l;continue}const c=n?s.getNextSibling():s.getPreviousSibling();if(null!==c){s=c;continue}const a=s.getParentOrThrow();if(i.has(a.__key)||r.push(a),a===e)break;let u=null,f=a;do{if(null===f&&t$1(68),u=n?f.getNextSibling():f.getPreviousSibling(),f=f.getParent(),null===f)break;null!==u||i.has(f.__key)||r.push(f);}while(null===u);s=u;}return n||r.reverse(),r}isDirty(){const t=qr()._dirtyLeaves;return null!==t&&t.has(this.__key)}getLatest(){const e=as(this.__key);return null===e&&t$1(113),e}getWritable(){Vr();const t=Hr(),e=qr(),n=t._nodeMap,r=this.__key,i=this.getLatest(),s=e._cloneNotNeeded,o=Nr();if(null!==o&&o.setCachedNodes(null),s.has(r))return os(i),i;const l=vo(i);return s.add(r),os(l),n.set(r,l),l}getTextContent(){return ""}getTextContentSize(){return this.getTextContent().length}createDOM(e,n){t$1(70);}updateDOM(e,n,r){t$1(71);}exportDOM(t){return {element:this.createDOM(t._config,t)}}exportJSON(){const t=this.__state?this.__state.toJSON():void 0;return {type:this.__type,version:1,...t}}static importJSON(e){t$1(18,this.name);}updateFromJSON(t){return function(t,e){const n=t.getWritable();return (e||n.__state)&&mt$3(t).updateFromJSON(e),n}(this,t.$)}static transform(){return null}remove(t){Mn(this,true,t);}replace(e,n){Vr();let r=Nr();null!==r&&(r=r.clone()),no(this,e);const i=this.getLatest(),s=this.__key,o=e.__key,l=e.getWritable(),c=this.getParentOrThrow().getWritable(),a=c.__size;ss(l);const u=i.getPreviousSibling(),f=i.getNextSibling(),d=i.__prev,h=i.__next,g=i.__parent;if(Mn(i,false,true),null===u)c.__first=o;else {u.getWritable().__next=o;}if(l.__prev=d,null===f)c.__last=o;else {f.getWritable().__prev=o;}if(l.__next=h,l.__parent=g,c.__size=a,n&&(di(this)&&di(l)||t$1(139),this.getChildren().forEach((t=>{l.append(t);}))),cr(r)){ys(r);const t=r.anchor,e=r.focus;t.key===s&&or(t,l),e.key===s&&or(e,l);}return cs()===s&&ls(o),l}insertAfter(t,e=true){Vr(),no(this,t);const n=this.getWritable(),r=t.getWritable(),i=r.getParent(),s=Nr();let o=false,l=false;if(null!==i){const e=t.getIndexWithinParent();if(ss(r),cr(s)){const t=i.__key,n=s.anchor,r=s.focus;o="element"===n.type&&n.key===t&&n.offset===e+1,l="element"===r.type&&r.key===t&&r.offset===e+1;}}const c=this.getNextSibling(),a=this.getParentOrThrow().getWritable(),u=r.__key,f=n.__next;if(null===c)a.__last=u;else {c.getWritable().__prev=u;}if(a.__size++,n.__next=u,r.__next=f,r.__prev=n.__key,r.__parent=n.__parent,e&&cr(s)){const t=this.getIndexWithinParent();Er(s,a,t+1);const e=a.__key;o&&s.anchor.set(e,t+2,"element"),l&&s.focus.set(e,t+2,"element");}return t}insertBefore(t,e=true){Vr(),no(this,t);const n=this.getWritable(),r=t.getWritable(),i=r.__key;ss(r);const s=this.getPreviousSibling(),o=this.getParentOrThrow().getWritable(),l=n.__prev,c=this.getIndexWithinParent();if(null===s)o.__first=i;else {s.getWritable().__next=i;}o.__size++,n.__prev=i,r.__prev=l,r.__next=n.__key,r.__parent=n.__parent;const a=Nr();if(e&&cr(a)){Er(a,this.getParentOrThrow(),c);}return t}isParentRequired(){return  false}createParentElementNode(){return Pi()}selectStart(){return this.selectPrevious()}selectEnd(){return this.selectNext(0,0)}selectPrevious(t,e){Vr();const n=this.getPreviousSibling(),r=this.getParentOrThrow();if(null===n)return r.select(0,0);if(di(n))return n.select();if(!Qn(n)){const t=n.getIndexWithinParent()+1;return r.select(t,t)}return n.select(t,e)}selectNext(t,e){Vr();const n=this.getNextSibling(),r=this.getParentOrThrow();if(null===n)return r.select();if(di(n))return n.select(0,0);if(!Qn(n)){const t=n.getIndexWithinParent();return r.select(t,t)}return n.select(t,e)}markDirty(){this.getWritable();}reconcileObservedMutation(t,e){this.markDirty();}}class On extends An{static getType(){return "linebreak"}static clone(t){return new On(t.__key)}constructor(t){super(t);}getTextContent(){return "\n"}createDOM(){return document.createElement("br")}updateDOM(){return  false}isInline(){return  true}static importDOM(){return {br:t=>function(t){const e=t.parentElement;if(null!==e&&_o(e)){const n=e.firstChild;if(n===t||n.nextSibling===t&&Ln(n)){const n=e.lastChild;if(n===t||n.previousSibling===t&&Ln(n))return  true}}return  false}(t)||function(t){const e=t.parentElement;if(null!==e&&_o(e)){const n=e.firstChild;if(n===t||n.nextSibling===t&&Ln(n))return  false;const r=e.lastChild;if(r===t||r.previousSibling===t&&Ln(r))return  true}return  false}(t)?null:{conversion:Dn,priority:0}}}static importJSON(t){return Pn().updateFromJSON(t)}}function Dn(t){return {node:Pn()}}function Pn(){return eo(new On)}function Fn(t){return t instanceof On}function Ln(t){return Zi(t)&&/^( |\t|\r?\n)+$/.test(t.textContent||"")}function In(t,e){return 16&e?"code":e&A$4?"mark":32&e?"sub":64&e?"sup":null}function zn(t,e){return 1&e?"strong":2&e?"em":"span"}function Kn(t,e,n,r,i){const s=r.classList;let o=Fs(i,"base");void 0!==o&&s.add(...o),o=Fs(i,"underlineStrikethrough");let l=false;const c=e&N$2&&e&b$2;void 0!==o&&(n&N$2&&n&b$2?(l=true,c||s.add(...o)):c&&s.remove(...o));for(const t in j$3){const r=j$3[t];if(o=Fs(i,t),void 0!==o)if(n&r){if(l&&("underline"===t||"strikethrough"===t)){e&r&&s.remove(...o);continue}e&r&&(!c||"underline"!==t)&&"strikethrough"!==t||s.add(...o);}else e&r&&s.remove(...o);}}function Bn(t,e,n){const r=e.firstChild,s=n.isComposing(),o=t+(s?K$3:"");if(null==r)e.textContent=o;else {const t=r.nodeValue;if(t!==o)if(s||i$1){const[e,n,i]=function(t,e){const n=t.length,r=e.length;let i=0,s=0;for(;i<n&&i<r&&t[i]===e[i];)i++;for(;s+i<n&&s+i<r&&t[n-s-1]===e[r-s-1];)s++;return [i,n-i-s,e.slice(i,r-s)]}(t,o);0!==n&&r.deleteData(e,n),r.insertData(e,i);}else r.nodeValue=o;}}function Rn(t,e,n,r,i,s){Bn(i,t,e);const o=s.theme.text;void 0!==o&&Kn(0,0,r,t,o);}function Wn(t,e){const n=document.createElement(e);return n.appendChild(t),n}class Jn extends An{static getType(){return "text"}static clone(t){return new Jn(t.__text,t.__key)}afterCloneFrom(t){super.afterCloneFrom(t),this.__text=t.__text,this.__format=t.__format,this.__style=t.__style,this.__mode=t.__mode,this.__detail=t.__detail;}constructor(t="",e){super(e),this.__text=t,this.__format=0,this.__style="",this.__mode=0,this.__detail=0;}getFormat(){return this.getLatest().__format}getDetail(){return this.getLatest().__detail}getMode(){const t=this.getLatest();return G$2[t.__mode]}getStyle(){return this.getLatest().__style}isToken(){return 1===this.getLatest().__mode}isComposing(){return this.__key===cs()}isSegmented(){return 2===this.getLatest().__mode}isDirectionless(){return !!(1&this.getLatest().__detail)}isUnmergeable(){return !!(2&this.getLatest().__detail)}hasFormat(t){const e=j$3[t];return !!(this.getFormat()&e)}isSimpleText(){return "text"===this.__type&&0===this.__mode}getTextContent(){return this.getLatest().__text}getFormatFlags(t,e){return ns(this.getLatest().__format,t,e)}canHaveFormat(){return  true}isInline(){return  true}createDOM(t,e){const n=this.__format,r=In(0,n),i=zn(0,n),s=null===r?i:r,o=document.createElement(s);let l=o;this.hasFormat("code")&&o.setAttribute("spellcheck","false"),null!==r&&(l=document.createElement(i),o.appendChild(l));Rn(l,this,0,n,this.__text,t);const c=this.__style;return ""!==c&&(o.style.cssText=c),o}updateDOM(e,n,r){const i=this.__text,s=e.__format,o=this.__format,l=In(0,s),c=In(0,o),a=zn(0,s),u=zn(0,o);if((null===l?a:l)!==(null===c?u:c))return  true;if(l===c&&a!==u){const e=n.firstChild;null==e&&t$1(48);const s=document.createElement(u);return Rn(s,this,0,o,i,r),n.replaceChild(s,e),false}let f=n;null!==c&&null!==l&&(f=n.firstChild,null==f&&t$1(49)),Bn(i,f,this);const d=r.theme.text;void 0!==d&&s!==o&&Kn(0,s,o,f,d);const h=e.__style,g=this.__style;return h!==g&&(n.style.cssText=g),false}static importDOM(){return {"#text":()=>({conversion:Yn,priority:0}),b:()=>({conversion:$n,priority:0}),code:()=>({conversion:Gn,priority:0}),em:()=>({conversion:Gn,priority:0}),i:()=>({conversion:Gn,priority:0}),mark:()=>({conversion:Gn,priority:0}),s:()=>({conversion:Gn,priority:0}),span:()=>({conversion:Un,priority:0}),strong:()=>({conversion:Gn,priority:0}),sub:()=>({conversion:Gn,priority:0}),sup:()=>({conversion:Gn,priority:0}),u:()=>({conversion:Gn,priority:0})}}static importJSON(t){return Xn().updateFromJSON(t)}updateFromJSON(t){return super.updateFromJSON(t).setTextContent(t.text).setFormat(t.format).setDetail(t.detail).setMode(t.mode).setStyle(t.style)}exportDOM(e){let{element:n}=super.exportDOM(e);return uo(n)||t$1(132),n.style.whiteSpace="pre-wrap",this.hasFormat("lowercase")?n.style.textTransform="lowercase":this.hasFormat("uppercase")?n.style.textTransform="uppercase":this.hasFormat("capitalize")&&(n.style.textTransform="capitalize"),this.hasFormat("bold")&&(n=Wn(n,"b")),this.hasFormat("italic")&&(n=Wn(n,"i")),this.hasFormat("strikethrough")&&(n=Wn(n,"s")),this.hasFormat("underline")&&(n=Wn(n,"u")),{element:n}}exportJSON(){return {detail:this.getDetail(),format:this.getFormat(),mode:this.getMode(),style:this.getStyle(),text:this.getTextContent(),...super.exportJSON()}}selectionTransform(t,e){}setFormat(t){const e=this.getWritable();return e.__format="string"==typeof t?j$3[t]:t,e}setDetail(t){const e=this.getWritable();return e.__detail="string"==typeof t?V$3[t]:t,e}setStyle(t){const e=this.getWritable();return e.__style=t,e}toggleFormat(t){const e=ns(this.getFormat(),t,null);return this.setFormat(e)}toggleDirectionless(){const t=this.getWritable();return t.__detail^=1,t}toggleUnmergeable(){const t=this.getWritable();return t.__detail^=2,t}setMode(t){const e=q$2[t];if(this.__mode===e)return this;const n=this.getWritable();return n.__mode=e,n}setTextContent(t){if(this.__text===t)return this;const e=this.getWritable();return e.__text=t,e}select(t,e){Vr();let n=t,r=e;const i=Nr(),s=this.getTextContent(),o=this.__key;if("string"==typeof s){const t=s.length;void 0===n&&(n=t),void 0===r&&(r=t);}else n=0,r=0;if(!cr(i))return Sr(o,n,o,r,"text","text");{const t=cs();t!==i.anchor.key&&t!==i.focus.key||ls(o),i.setTextNodeRange(this,n,this,r);}return i}selectStart(){return this.select(0,0)}selectEnd(){const t=this.getTextContentSize();return this.select(t,t)}spliceText(t,e,n,r){const i=this.getWritable(),s=i.__text,o=n.length;let l=t;l<0&&(l=o+l,l<0&&(l=0));const c=Nr();if(r&&cr(c)){const e=t+o;c.setTextNodeRange(i,e,i,e);}const a=s.slice(0,l)+n+s.slice(l+e);return i.__text=a,i}canInsertTextBefore(){return  true}canInsertTextAfter(){return  true}splitText(...t){Vr();const e=this.getLatest(),n=e.getTextContent();if(""===n)return [];const r=e.__key,i=cs(),s=n.length;t.sort(((t,e)=>t-e)),t.push(s);const o=[],l=t.length;for(let e=0,r=0;e<s&&r<=l;r++){const i=t[r];i>e&&(o.push(n.slice(e,i)),e=i);}const c=o.length;if(1===c)return [e];const a=o[0],u=e.getParent();let f;const d=e.getFormat(),h=e.getStyle(),g=e.__detail;let _=false,p=null,y=null;const m=Nr();if(cr(m)){const[t,e]=m.isBackward()?[m.focus,m.anchor]:[m.anchor,m.focus];"text"===t.type&&t.key===r&&(p=t),"text"===e.type&&e.key===r&&(y=e);}e.isSegmented()?(f=Xn(a),f.__format=d,f.__style=h,f.__detail=g,_=true):(f=e.getWritable(),f.__text=a);const x=[f];for(let t=1;t<c;t++){const e=Xn(o[t]);e.__format=d,e.__style=h,e.__detail=g;const n=e.__key;i===r&&ls(n),x.push(e);}const C=p?p.offset:null,S=y?y.offset:null;let v=0;for(const t of x){if(!p&&!y)break;const e=v+t.getTextContentSize();if(null!==p&&null!==C&&C<=e&&C>=v&&(p.set(t.getKey(),C-v,"text"),C<e&&(p=null)),null!==y&&null!==S&&S<=e&&S>=v){y.set(t.getKey(),S-v,"text");break}v=e;}if(null!==u){!function(t){const e=t.getPreviousSibling(),n=t.getNextSibling();null!==e&&os(e);null!==n&&os(n);}(this);const t=u.getWritable(),e=this.getIndexWithinParent();_?(t.splice(e,0,x),this.remove()):t.splice(e,1,x),cr(m)&&Er(m,u,e,c-1);}return x}mergeWithSibling(e){const n=e===this.getPreviousSibling();n||e===this.getNextSibling()||t$1(50);const r=this.__key,i=e.__key,s=this.__text,o=s.length;cs()===i&&ls(r);const l=Nr();if(cr(l)){const t=l.anchor,s=l.focus;null!==t&&t.key===i&&Or(t,n,r,e,o),null!==s&&s.key===i&&Or(s,n,r,e,o);}const c=e.__text,a=n?c+s:s+c;this.setTextContent(a);const u=this.getWritable();return e.remove(),u}isTextEntity(){return  false}}function Un(t){return {forChild:Zn(t.style),node:null}}function $n(t){const e=t,n="normal"===e.style.fontWeight;return {forChild:Zn(e.style,n?void 0:"bold"),node:null}}const jn=new WeakMap;function Vn(t){if(!uo(t))return  false;if("PRE"===t.nodeName)return  true;const e=t.style.whiteSpace;return "string"==typeof e&&e.startsWith("pre")}function Yn(e){const n=e;null===e.parentElement&&t$1(129);let r=n.textContent||"";if(null!==function(t){let e,n=t.parentNode;const r=[t];for(;null!==n&&void 0===(e=jn.get(n))&&!Vn(n);)r.push(n),n=n.parentNode;const i=void 0===e?n:e;for(let t=0;t<r.length;t++)jn.set(r[t],i);return i}(n)){const t=r.split(/(\r?\n|\t)/),e=[],n=t.length;for(let r=0;r<n;r++){const n=t[r];"\n"===n||"\r\n"===n?e.push(Pn()):"\t"===n?e.push(er()):""!==n&&e.push(Xn(n));}return {node:e}}if(r=r.replace(/\r/g,"").replace(/[ \t\n]+/g," "),""===r)return {node:null};if(" "===r[0]){let t=n,e=true;for(;null!==t&&null!==(t=Hn(t,false));){const n=t.textContent||"";if(n.length>0){/[ \t\n]$/.test(n)&&(r=r.slice(1)),e=false;break}}e&&(r=r.slice(1));}if(" "===r[r.length-1]){let t=n,e=true;for(;null!==t&&null!==(t=Hn(t,true));){if((t.textContent||"").replace(/^( |\t|\r?\n)+/,"").length>0){e=false;break}}e&&(r=r.slice(0,r.length-1));}return ""===r?{node:null}:{node:Xn(r)}}function Hn(t,e){let n=t;for(;;){let t;for(;null===(t=e?n.nextSibling:n.previousSibling);){const t=n.parentElement;if(null===t)return null;n=t;}if(n=t,uo(n)){const t=n.style.display;if(""===t&&!go(n)||""!==t&&!t.startsWith("inline"))return null}let r=n;for(;null!==(r=e?n.firstChild:n.lastChild);)n=r;if(Zi(n))return n;if("BR"===n.nodeName)return null}}const qn={code:"code",em:"italic",i:"italic",mark:"highlight",s:"strikethrough",strong:"bold",sub:"subscript",sup:"superscript",u:"underline"};function Gn(t){const e=qn[t.nodeName.toLowerCase()];return void 0===e?{node:null}:{forChild:Zn(t.style,e),node:null}}function Xn(t=""){return eo(new Jn(t))}function Qn(t){return t instanceof Jn}function Zn(t,e){const n=t.fontWeight,r=t.textDecoration.split(" "),i="700"===n||"bold"===n,s=r.includes("line-through"),o="italic"===t.fontStyle,l=r.includes("underline"),c=t.verticalAlign;return t=>Qn(t)?(i&&!t.hasFormat("bold")&&t.toggleFormat("bold"),s&&!t.hasFormat("strikethrough")&&t.toggleFormat("strikethrough"),o&&!t.hasFormat("italic")&&t.toggleFormat("italic"),l&&!t.hasFormat("underline")&&t.toggleFormat("underline"),"sub"!==c||t.hasFormat("subscript")||t.toggleFormat("subscript"),"super"!==c||t.hasFormat("superscript")||t.toggleFormat("superscript"),e&&!t.hasFormat(e)&&t.toggleFormat(e),t):t}class tr extends Jn{static getType(){return "tab"}static clone(t){return new tr(t.__key)}constructor(t){super("\t",t),this.__detail=2;}static importDOM(){return null}createDOM(t){const e=super.createDOM(t),n=Fs(t.theme,"tab");if(void 0!==n){e.classList.add(...n);}return e}static importJSON(t){return er().updateFromJSON(t)}setTextContent(e){return "\t"!==e&&""!==e&&t$1(126),super.setTextContent(e)}setDetail(e){return 2!==e&&t$1(127),this}setMode(e){return "normal"!==e&&t$1(128),this}canInsertTextBefore(){return  false}canInsertTextAfter(){return  false}}function er(){return eo(new tr)}function nr(t){return t instanceof tr}class rr{constructor(t,e,n){this._selection=null,this.key=t,this.offset=e,this.type=n;}is(t){return this.key===t.key&&this.offset===t.offset&&this.type===t.type}isBefore(t){if(this.key===t.key)return this.offset<t.offset;return el(_l(ol(this,"next")),_l(ol(t,"next")))<0}getNode(){const e=as(this.key);return null===e&&t$1(20),e}set(t,e,n,r){const i=this._selection,s=this.key;r&&this.key===t&&this.offset===e&&this.type===n||(this.key=t,this.offset=e,this.type=n,jr()||(cs()===s&&ls(t),null!==i&&(i.setCachedNodes(null),i.dirty=true)));}}function ir(t,e,n){return new rr(t,e,n)}function sr(t,e){let n=e.__key,r=t.offset,i="element";if(Qn(e)){i="text";const t=e.getTextContentSize();r>t&&(r=t);}else if(!di(e)){const t=e.getNextSibling();if(Qn(t))n=t.__key,r=0,i="text";else {const t=e.getParent();t&&(n=t.__key,r=e.getIndexWithinParent()+1);}}t.set(n,r,i);}function or(t,e){if(di(e)){const n=e.getLastDescendant();di(n)||Qn(n)?sr(t,n):sr(t,e);}else sr(t,e);}class lr{constructor(t){this._cachedNodes=null,this._nodes=t,this.dirty=false;}getCachedNodes(){return this._cachedNodes}setCachedNodes(t){this._cachedNodes=t;}is(t){if(!ur(t))return  false;const e=this._nodes,n=t._nodes;return e.size===n.size&&Array.from(e).every((t=>n.has(t)))}isCollapsed(){return  false}isBackward(){return  false}getStartEndPoints(){return null}add(t){this.dirty=true,this._nodes.add(t),this._cachedNodes=null;}delete(t){this.dirty=true,this._nodes.delete(t),this._cachedNodes=null;}clear(){this.dirty=true,this._nodes.clear(),this._cachedNodes=null;}has(t){return this._nodes.has(t)}clone(){return new lr(new Set(this._nodes))}extract(){return this.getNodes()}insertRawText(t){}insertText(){}insertNodes(t){const e=this.getNodes(),n=e.length,r=e[n-1];let i;if(Qn(r))i=r.select();else {const t=r.getIndexWithinParent()+1;i=r.getParentOrThrow().select(t,t);}i.insertNodes(t);for(let t=0;t<n;t++)e[t].remove();}getNodes(){const t=this._cachedNodes;if(null!==t)return t;const e=this._nodes,n=[];for(const t of e){const e=as(t);null!==e&&n.push(e);}return jr()||(this._cachedNodes=n),n}getTextContent(){const t=this.getNodes();let e="";for(let n=0;n<t.length;n++)e+=t[n].getTextContent();return e}deleteNodes(){const t=this.getNodes();if((Nr()||wr())===this&&t[0]){const e=Wo(t[0],"next");cl(Zo(e,e));}for(const e of t)e.remove();}}function cr(t){return t instanceof ar}class ar{constructor(t,e,n,r){this.anchor=t,this.focus=e,t._selection=this,e._selection=this,this._cachedNodes=null,this.format=n,this.style=r,this.dirty=false;}getCachedNodes(){return this._cachedNodes}setCachedNodes(t){this._cachedNodes=t;}is(t){return !!cr(t)&&(this.anchor.is(t.anchor)&&this.focus.is(t.focus)&&this.format===t.format&&this.style===t.style)}isCollapsed(){return this.anchor.is(this.focus)}getNodes(){const t=this._cachedNodes;if(null!==t)return t;const e=function(t){const e=[],[n,r]=t.getTextSlices();n&&e.push(n.caret.origin);const i=new Set,s=new Set;for(const n of t)if(zo(n)){const{origin:t}=n;0===e.length?i.add(t):(s.add(t),e.push(t));}else {const{origin:t}=n;di(t)&&s.has(t)||e.push(t);}r&&e.push(r.caret.origin);if(Io(t.focus)&&di(t.focus.origin)&&null===t.focus.getNodeAtCaret())for(let n=jo(t.focus.origin,"previous");zo(n)&&i.has(n.origin)&&!n.origin.isEmpty()&&n.origin.is(e[e.length-1]);n=Yo(n))i.delete(n.origin),e.pop();for(;e.length>1;){const t=e[e.length-1];if(!di(t)||s.has(t)||t.isEmpty()||i.has(t))break;e.pop();}if(0===e.length&&t.isCollapsed()){const n=_l(t.anchor),r=_l(t.anchor.getFlipped()),i=t=>Fo(t)?t.origin:t.getNodeAtCaret(),s=i(n)||i(r)||(t.anchor.getNodeAtCaret()?n.origin:r.origin);e.push(s);}return e}(ml(ul(this),"next"));return jr()||(this._cachedNodes=e),e}setTextNodeRange(t,e,n,r){this.anchor.set(t.__key,e,"text"),this.focus.set(n.__key,r,"text");}getTextContent(){const t=this.getNodes();if(0===t.length)return "";const e=t[0],n=t[t.length-1],r=this.anchor,i=this.focus,s=r.isBefore(i),[o,l]=dr(this);let c="",a=true;for(let u=0;u<t.length;u++){const f=t[u];if(di(f)&&!f.isInline())a||(c+="\n"),a=!f.isEmpty();else if(a=false,Qn(f)){let t=f.getTextContent();f===e?f===n?"element"===r.type&&"element"===i.type&&i.offset!==r.offset||(t=o<l?t.slice(o,l):t.slice(l,o)):t=s?t.slice(o):t.slice(l):f===n&&(t=s?t.slice(0,l):t.slice(0,o)),c+=t;}else !_i(f)&&!Fn(f)||f===n&&this.isCollapsed()||(c+=f.getTextContent());}return c}applyDOMRange(t){const e=qr(),n=e.getEditorState()._selection,r=xr(t.startContainer,t.startOffset,t.endContainer,t.endOffset,e,n);if(null===r)return;const[i,s]=r;this.anchor.set(i.key,i.offset,i.type,true),this.focus.set(s.key,s.offset,s.type,true),vt$4(this);}clone(){const t=this.anchor,e=this.focus;return new ar(ir(t.key,t.offset,t.type),ir(e.key,e.offset,e.type),this.format,this.style)}toggleFormat(t){this.format=ns(this.format,t,null),this.dirty=true;}setStyle(t){this.style=t,this.dirty=true;}hasFormat(t){const e=j$3[t];return !!(this.format&e)}insertRawText(t){const e=t.split(/(\r?\n|\t)/),n=[],r=e.length;for(let t=0;t<r;t++){const r=e[t];"\n"===r||"\r\n"===r?n.push(Pn()):"\t"===r?n.push(er()):n.push(Xn(r));}this.insertNodes(n);}insertText(e){const n=this.anchor,r=this.focus,i=this.format,s=this.style;let o=n,l=r;!this.isCollapsed()&&r.isBefore(n)&&(o=r,l=n),"element"===o.type&&function(t,e,n,r){const i=t.getNode(),s=i.getChildAtIndex(t.offset),o=Xn(),l=yi(i)?Pi().append(o):o;o.setFormat(n),o.setStyle(r),null===s?i.append(l):s.insertBefore(l),t.is(e)&&e.set(o.__key,0,"text"),t.set(o.__key,0,"text");}(o,l,i,s),"element"===l.type&&ll(l,_l(ol(l,"next")));const c=o.offset;let a=l.offset;const u=this.getNodes(),f=u.length;let d=u[0];Qn(d)||t$1(26);const h=d.getTextContent().length,g=d.getParentOrThrow();let _=u[f-1];if(1===f&&"element"===l.type&&(a=h,l.set(o.key,a,"text")),this.isCollapsed()&&c===h&&(d.isSegmented()||d.isToken()||!d.canInsertTextAfter()||!g.canInsertTextAfter()&&null===d.getNextSibling())){let t=d.getNextSibling();if(Qn(t)&&t.canInsertTextBefore()&&!Qi(t)||(t=Xn(),t.setFormat(i),t.setStyle(s),g.canInsertTextAfter()?d.insertAfter(t):g.insertAfter(t)),t.select(0,0),d=t,""!==e)return void this.insertText(e)}else if(this.isCollapsed()&&0===c&&(d.isSegmented()||d.isToken()||!d.canInsertTextBefore()||!g.canInsertTextBefore()&&null===d.getPreviousSibling())){let t=d.getPreviousSibling();if(Qn(t)&&!Qi(t)||(t=Xn(),t.setFormat(i),g.canInsertTextBefore()?d.insertBefore(t):g.insertBefore(t)),t.select(),d=t,""!==e)return void this.insertText(e)}else if(d.isSegmented()&&c!==h){const t=Xn(d.getTextContent());t.setFormat(i),d.replace(t),d=t;}else if(!this.isCollapsed()&&""!==e){const t=_.getParent();if(!g.canInsertTextBefore()||!g.canInsertTextAfter()||di(t)&&(!t.canInsertTextBefore()||!t.canInsertTextAfter()))return this.insertText(""),mr(this.anchor,this.focus,null),void this.insertText(e)}if(1===f){if(d.isToken()){const t=Xn(e);return t.select(),void d.replace(t)}const t=d.getFormat(),n=d.getStyle();if(c!==a||t===i&&n===s){if(nr(d)){const t=Xn(e);return t.setFormat(i),t.setStyle(s),t.select(),void d.replace(t)}}else {if(""!==d.getTextContent()){const t=Xn(e);if(t.setFormat(i),t.setStyle(s),t.select(),0===c)d.insertBefore(t,false);else {const[e]=d.splitText(c);e.insertAfter(t,false);}return void(t.isComposing()&&"text"===this.anchor.type&&(this.anchor.offset-=e.length))}d.setFormat(i),d.setStyle(s);}const r=a-c;d=d.spliceText(c,r,e,true),""===d.getTextContent()?d.remove():"text"===this.anchor.type&&(d.isComposing()?this.anchor.offset-=e.length:(this.format=t,this.style=n));}else {const t=new Set([...d.getParentKeys(),..._.getParentKeys()]),n=di(d)?d:d.getParentOrThrow();let r=di(_)?_:_.getParentOrThrow(),i=_;if(!n.is(r)&&r.isInline())do{i=r,r=r.getParentOrThrow();}while(r.isInline());if("text"===l.type&&(0!==a||""===_.getTextContent())||"element"===l.type&&_.getIndexWithinParent()<a)if(Qn(_)&&!_.isToken()&&a!==_.getTextContentSize()){if(_.isSegmented()){const t=Xn(_.getTextContent());_.replace(t),_=t;}yi(l.getNode())||"text"!==l.type||(_=_.spliceText(0,a,"")),t.add(_.__key);}else {const t=_.getParentOrThrow();t.canBeEmpty()||1!==t.getChildrenSize()?_.remove():t.remove();}else t.add(_.__key);const s=r.getChildren(),o=new Set(u),g=n.is(r),p=n.isInline()&&null===d.getNextSibling()?n:d;for(let t=s.length-1;t>=0;t--){const e=s[t];if(e.is(d)||di(e)&&e.isParentOf(d))break;e.isAttached()&&(!o.has(e)||e.is(i)?g||p.insertAfter(e,false):e.remove());}if(!g){let e=r,n=null;for(;null!==e;){const r=e.getChildren(),i=r.length;(0===i||r[i-1].is(n))&&(t.delete(e.__key),n=e),e=e.getParent();}}if(d.isToken())if(c===h)d.select();else {const t=Xn(e);t.select(),d.replace(t);}else d=d.spliceText(c,h-c,e,true),""===d.getTextContent()?d.remove():d.isComposing()&&"text"===this.anchor.type&&(this.anchor.offset-=e.length);for(let e=1;e<f;e++){const n=u[e],r=n.__key;t.has(r)||n.remove();}}}removeText(){const t=Nr()===this;al(this,gl(ul(this))),t&&Nr()!==this&&ys(this);}formatText(t,e=null){if(this.isCollapsed())return this.toggleFormat(t),void ls(null);const n=this.getNodes(),r=[];for(const t of n)Qn(t)&&r.push(t);const i=e=>{n.forEach((n=>{if(di(n)){const r=n.getFormatFlags(t,e);n.setTextFormat(r);}}));},s=r.length;if(0===s)return this.toggleFormat(t),ls(null),void i(e);const o=this.anchor,l=this.focus,c=this.isBackward(),a=c?l:o,u=c?o:l;let f=0,d=r[0],h="element"===a.type?0:a.offset;if("text"===a.type&&h===d.getTextContentSize()&&(f=1,d=r[1],h=0),null==d)return;const g=d.getFormatFlags(t,e);i(g);const _=s-1;let p=r[_];const y="text"===u.type?u.offset:p.getTextContentSize();if(d.is(p)){if(h===y)return;if(Qi(d)||0===h&&y===d.getTextContentSize())d.setFormat(g);else {const t=d.splitText(h,y),e=0===h?t[0]:t[1];e.setFormat(g),"text"===a.type&&a.set(e.__key,0,"text"),"text"===u.type&&u.set(e.__key,y-h,"text");}return void(this.format=g)}0===h||Qi(d)||([,d]=d.splitText(h),h=0),d.setFormat(g);const m=p.getFormatFlags(t,g);y>0&&(y===p.getTextContentSize()||Qi(p)||([p]=p.splitText(y)),p.setFormat(m));for(let e=f+1;e<_;e++){const n=r[e],i=n.getFormatFlags(t,m);n.setFormat(i);}"text"===a.type&&a.set(d.__key,h,"text"),"text"===u.type&&u.set(p.__key,y,"text"),this.format=g|m;}insertNodes(e){if(0===e.length)return;if(this.isCollapsed()||this.removeText(),"root"===this.anchor.key){this.insertParagraph();const n=Nr();return cr(n)||t$1(134),n.insertNodes(e)}const n=(this.isBackward()?this.focus:this.anchor).getNode(),r=yo(n,po),i=e[e.length-1];if(di(r)&&"__language"in r){if("__language"in e[0])this.insertText(e[0].getTextContent());else {const t=Ir(this);r.splice(t,0,e),i.selectEnd();}return}if(!e.some((t=>(di(t)||_i(t))&&!t.isInline()))){di(r)||t$1(211,n.constructor.name,n.getType());const s=Ir(this);return r.splice(s,0,e),void i.selectEnd()}const s=function(t){const e=Pi();let n=null;for(let r=0;r<t.length;r++){const i=t[r],s=Fn(i);if(s||_i(i)&&i.isInline()||di(i)&&i.isInline()||Qn(i)||i.isParentRequired()){if(null===n&&(n=i.createParentElementNode(),e.append(n),s))continue;null!==n&&n.append(i);}else e.append(i),n=null;}return e}(e),o=s.getLastDescendant(),l=s.getChildren(),c=!di(r)||!r.isEmpty()?this.insertParagraph():null,a=l[l.length-1];let u=l[0];var f;di(f=u)&&po(f)&&!f.isEmpty()&&di(r)&&(!r.isEmpty()||r.canMergeWhenEmpty())&&(di(r)||t$1(211,n.constructor.name,n.getType()),r.append(...u.getChildren()),u=l[1]),u&&(null===r&&t$1(212,n.constructor.name,n.getType()),function(e,n,r){const i=n.getParentOrThrow().getLastChild();let s=n;const o=[n];for(;s!==i;)s.getNextSibling()||t$1(140),s=s.getNextSibling(),o.push(s);let l=e;for(const t of o)l=l.insertAfter(t);}(r,u));const d=yo(o,po);c&&di(d)&&(c.canMergeWhenEmpty()||po(a))&&(d.append(...c.getChildren()),c.remove()),di(r)&&r.isEmpty()&&r.remove(),o.selectEnd();const h=di(r)?r.getLastChild():null;Fn(h)&&d!==r&&h.remove();}insertParagraph(){if("root"===this.anchor.key){const t=Pi();return _s().splice(this.anchor.offset,0,[t]),t.select(),t}const e=Ir(this),n=yo(this.anchor.getNode(),po);di(n)||t$1(213);const r=n.getChildAtIndex(e),i=r?[r,...r.getNextSiblings()]:[],s=n.insertNewAfter(this,false);return s?(s.append(...i),s.selectStart(),s):null}insertLineBreak(t){const e=Pn();if(this.insertNodes([e]),t){const t=e.getParentOrThrow(),n=e.getIndexWithinParent();t.select(n,n);}}extract(){const t=this.getNodes(),e=t.length,n=e-1,r=this.anchor,i=this.focus;let s=t[0],o=t[n];const[l,c]=dr(this);if(0===e)return [];if(1===e){if(Qn(s)&&!this.isCollapsed()){const t=l>c?c:l,e=l>c?l:c,n=s.splitText(t,e),r=0===t?n[0]:n[1];return null!=r?[r]:[]}return [s]}const a=r.isBefore(i);if(Qn(s)){const e=a?l:c;e===s.getTextContentSize()?t.shift():0!==e&&([,s]=s.splitText(e),t[0]=s);}if(Qn(o)){const e=o.getTextContent().length,r=a?c:l;0===r?t.pop():r!==e&&([o]=o.splitText(r),t[n]=o);}return t}modify(t,e,n){if(Kr(this,t,e,n))return;const r="move"===t,i=qr(),s=oo(Gs(i));if(!s)return;const o=i._blockCursorElement,l=i._rootElement,c=this.focus.getNode();if(null===l||null===o||!di(c)||c.isInline()||c.canBeEmpty()||so(o,i,l),this.dirty){let t=Js(i,this.anchor.key),e=Js(i,this.focus.key);"text"===this.anchor.type&&(t=es(t)),"text"===this.focus.type&&(e=es(e)),t&&e&&Dr(s,t,this.anchor.offset,e,this.focus.offset);}if(function(t,e,n,r){t.modify(e,n,r);}(s,t,e?"backward":"forward",n),s.rangeCount>0){const t=s.getRangeAt(0),n=this.anchor.getNode(),i=yi(n)?n:Qs(n);if(this.applyDOMRange(t),this.dirty=true,!r){const n=this.getNodes(),r=[];let o=false;for(let t=0;t<n.length;t++){const e=n[t];Hs(e,i)?r.push(e):o=true;}if(o&&r.length>0)if(e){const t=r[0];di(t)?t.selectStart():t.getParentOrThrow().selectStart();}else {const t=r[r.length-1];di(t)?t.selectEnd():t.getParentOrThrow().selectEnd();}s.anchorNode===t.startContainer&&s.anchorOffset===t.startOffset||function(t){const e=t.focus,n=t.anchor,r=n.key,i=n.offset,s=n.type;n.set(e.key,e.offset,e.type,true),e.set(r,i,s,true);}(this);}}"lineboundary"===n&&Kr(this,t,e,n,"decorators");}forwardDeletion(t,e,n){if(!n&&("element"===t.type&&di(e)&&t.offset===e.getChildrenSize()||"text"===t.type&&t.offset===e.getTextContentSize())){const t=e.getParent(),n=e.getNextSibling()||(null===t?null:t.getNextSibling());if(di(n)&&n.isShadowRoot())return  true}return  false}deleteCharacter(t){const e=this.isCollapsed();if(this.isCollapsed()){const e=this.anchor;let n=e.getNode();if(this.forwardDeletion(e,n,t))return;const r=Xo(ol(e,t?"previous":"next"));if(r.getTextSlices().every((t=>null===t||0===t.distance))){let t={type:"initial"};for(const e of r.iterNodeCarets("shadowRoot"))if(zo(e))if(e.origin.isInline());else {if(e.origin.isShadowRoot()){if("merge-block"===t.type)break;if(di(r.anchor.origin)&&r.anchor.origin.isEmpty()){const t=_l(e);al(this,Zo(t,t)),r.anchor.origin.remove();}return}"merge-next-block"!==t.type&&"merge-block"!==t.type||(t={block:t.block,caret:e,type:"merge-block"});}else {if("merge-block"===t.type)break;if(Io(e)){if(di(e.origin)){if(e.origin.isInline()){if(!e.origin.isParentOf(r.anchor.origin))break}else t={block:e.origin,type:"merge-next-block"};continue}if(_i(e.origin)){if(e.origin.isIsolated());else if("merge-next-block"===t.type&&(e.origin.isKeyboardSelectable()||!e.origin.isInline())&&di(r.anchor.origin)&&r.anchor.origin.isEmpty()){r.anchor.origin.remove();const t=kr();t.add(e.origin.getKey()),ys(t);}else e.origin.remove();return}break}}if("merge-block"===t.type){const{caret:e,block:n}=t;return al(this,Zo(!e.origin.isEmpty()&&n.isEmpty()?fl(Wo(n,e.direction)):r.anchor,e)),this.removeText()}}const i=this.focus;if(this.modify("extend",t,"character"),this.isCollapsed()){if(t&&0===e.offset&&hr(this,e.getNode()))return}else {const r="text"===i.type?i.getNode():null;if(n="text"===e.type?e.getNode():null,null!==r&&r.isSegmented()){const e=i.offset,s=r.getTextContentSize();if(r.is(n)||t&&e!==s||!t&&0!==e)return void _r(r,t,e)}else if(null!==n&&n.isSegmented()){const i=e.offset,s=n.getTextContentSize();if(n.is(r)||t&&0!==i||!t&&i!==s)return void _r(n,t,i)}!function(t,e){const n=t.anchor,r=t.focus,i=n.getNode(),s=r.getNode();if(i===s&&"text"===n.type&&"text"===r.type){const t=n.offset,s=r.offset,o=t<s,l=o?t:s,c=o?s:t,a=c-1;if(l!==a){(function(t){return !(Cs(t)||gr(t))})(i.getTextContent().slice(l,c))&&(e?r.set(r.key,a,r.type):n.set(n.key,a,n.type));}}}(this,t);}}if(this.removeText(),t&&!e&&this.isCollapsed()&&"element"===this.anchor.type&&0===this.anchor.offset){const t=this.anchor.getNode();t.isEmpty()&&yi(t.getParent())&&null===t.getPreviousSibling()&&hr(this,t);}}deleteLine(t){this.isCollapsed()&&this.modify("extend",t,"lineboundary"),this.isCollapsed()?this.deleteCharacter(t):this.removeText();}deleteWord(t){if(this.isCollapsed()){const e=this.anchor,n=e.getNode();if(this.forwardDeletion(e,n,t))return;this.modify("extend",t,"word");}this.removeText();}isBackward(){return this.focus.isBefore(this.anchor)}getStartEndPoints(){return [this.anchor,this.focus]}}function ur(t){return t instanceof lr}function fr(t){const e=t.offset;if("text"===t.type)return e;const n=t.getNode();return e===n.getChildrenSize()?n.getTextContent().length:0}function dr(t){const e=t.getStartEndPoints();if(null===e)return [0,0];const[n,r]=e;return "element"===n.type&&"element"===r.type&&n.key===r.key&&n.offset===r.offset?[0,0]:[fr(n),fr(r)]}function hr(t,e){for(let n=e;n;n=n.getParent()){if(di(n)){if(n.collapseAtStart(t))return  true;if(Zs(n))break}if(n.getPreviousSibling())break}return  false}const gr=(()=>{try{const t=new RegExp("\\p{Emoji}","u"),e=t.test.bind(t);if(e("❤️")&&e("#️⃣")&&e("👍"))return e}catch(t){}return ()=>false})();function _r(t,e,n){const r=t,i=r.getTextContent().split(/(?=\s)/g),s=i.length;let o=0,l=0;for(let t=0;t<s;t++){const r=t===s-1;if(l=o,o+=i[t].length,e&&o===n||o>n||r){i.splice(t,1),r&&(l=void 0);break}}const c=i.join("").trim();""===c?r.remove():(r.setTextContent(c),r.select(l,l));}function pr(e,n,r,i){let s,o=n;if(uo(e)){let l=false;const c=e.childNodes,a=c.length,u=i._blockCursorElement;o===a&&(l=true,o=a-1);let f=c[o],d=false;if(f===u)f=c[o+1],d=true;else if(null!==u){const t=u.parentNode;if(e===t){n>Array.prototype.indexOf.call(t.children,u)&&o--;}}if(s=ms(f),Qn(s))o=xs(s,l);else {let c=ms(e);if(null===c)return null;if(di(c)){const a=i.getElementByKey(c.getKey());null===a&&t$1(214);const u=c.getDOMSlot(a);[c,o]=u.resolveChildIndex(c,a,e,n),di(c)||t$1(215),l&&o>=c.getChildrenSize()&&(o=Math.max(0,c.getChildrenSize()-1));let f=c.getChildAtIndex(o);if(di(f)&&function(t,e,n){const r=t.getParent();return null===n||null===r||!r.canBeEmpty()||r!==n.getNode()}(f,0,r)){const t=l?f.getLastDescendant():f.getFirstDescendant();null===t?c=f:(f=t,c=di(f)?f:f.getParentOrThrow()),o=0;}Qn(f)?(s=f,c=null,o=xs(f,l)):f!==c&&l&&!d&&(di(c)||t$1(216),o=Math.min(c.getChildrenSize(),o+1));}else {const t=c.getIndexWithinParent();o=0===n&&_i(c)&&ms(e)===c?t:t+1,c=c.getParentOrThrow();}if(di(c))return ir(c.__key,o,"element")}}else s=ms(e);return Qn(s)?ir(s.__key,o,"text"):null}function yr(t,e,n){const r=t.offset,i=t.getNode();if(0===r){const r=i.getPreviousSibling(),s=i.getParent();if(e){if((n||!e)&&null===r&&di(s)&&s.isInline()){const e=s.getPreviousSibling();Qn(e)&&t.set(e.__key,e.getTextContent().length,"text");}}else di(r)&&!n&&r.isInline()?t.set(r.__key,r.getChildrenSize(),"element"):Qn(r)&&t.set(r.__key,r.getTextContent().length,"text");}else if(r===i.getTextContent().length){const r=i.getNextSibling(),s=i.getParent();if(e&&di(r)&&r.isInline())t.set(r.__key,0,"element");else if((n||e)&&null===r&&di(s)&&s.isInline()&&!s.canInsertTextAfter()){const e=s.getNextSibling();Qn(e)&&t.set(e.__key,0,"text");}}}function mr(t,e,n){if("text"===t.type&&"text"===e.type){const r=t.isBefore(e),i=t.is(e);yr(t,r,i),yr(e,!r,i),i&&e.set(t.key,t.offset,t.type);const s=qr();if(s.isComposing()&&s._compositionKey!==t.key&&cr(n)){const r=n.anchor,i=n.focus;t.set(r.key,r.offset,r.type,true),e.set(i.key,i.offset,i.type,true);}}}function xr(t,e,n,r,i,s){if(null===t||null===n||!Hi(i,t,n))return null;const o=pr(t,e,cr(s)?s.anchor:null,i);if(null===o)return null;const l=pr(n,r,cr(s)?s.focus:null,i);if(null===l)return null;if("element"===o.type&&"element"===l.type){const e=ms(t),r=ms(n);if(_i(e)&&_i(r))return null}return mr(o,l,s),[o,l]}function Cr(t){return di(t)&&!t.isInline()}function Sr(t,e,n,r,i,s){const o=Hr(),l=new ar(ir(t,e,i),ir(n,r,s),0,"");return l.dirty=true,o._selection=l,l}function vr(){const t=ir("root",0,"element"),e=ir("root",0,"element");return new ar(t,e,0,"")}function kr(){return new lr(new Set)}function br(t,e,n,r){const i=n._window;if(null===i)return null;const s=r||i.event,o=s?s.type:void 0,l="selectionchange"===o,c=!tt$3&&(l||"beforeinput"===o||"compositionstart"===o||"compositionend"===o||"click"===o&&s&&3===s.detail||"drop"===o||void 0===o);let a,u,f,d;if(cr(t)&&!c)return t.clone();if(null===e)return null;if(a=e.anchorNode,u=e.focusNode,f=e.anchorOffset,d=e.focusOffset,l&&cr(t)&&!Hi(n,a,u))return t.clone();const h=xr(a,f,u,d,n,t);if(null===h)return null;const[g,_]=h;return new ar(g,_,cr(t)?t.format:0,cr(t)?t.style:"")}function Nr(){return Hr()._selection}function wr(){return qr()._editorState._selection}function Er(t,e,n,r=1){const i=t.anchor,s=t.focus,o=i.getNode(),l=s.getNode();if(!e.is(o)&&!e.is(l))return;const c=e.__key;if(t.isCollapsed()){const e=i.offset;if(n<=e&&r>0||n<e&&r<0){const n=Math.max(0,e+r);i.set(c,n,"element"),s.set(c,n,"element"),Mr(t);}}else {const o=t.isBackward(),l=o?s:i,a=l.getNode(),u=o?i:s,f=u.getNode();if(e.is(a)){const t=l.offset;(n<=t&&r>0||n<t&&r<0)&&l.set(c,Math.max(0,t+r),"element");}if(e.is(f)){const t=u.offset;(n<=t&&r>0||n<t&&r<0)&&u.set(c,Math.max(0,t+r),"element");}}Mr(t);}function Mr(t){const e=t.anchor,n=e.offset,r=t.focus,i=r.offset,s=e.getNode(),o=r.getNode();if(t.isCollapsed()){if(!di(s))return;const t=s.getChildrenSize(),i=n>=t,o=i?s.getChildAtIndex(t-1):s.getChildAtIndex(n);if(Qn(o)){let t=0;i&&(t=o.getTextContentSize()),e.set(o.__key,t,"text"),r.set(o.__key,t,"text");}}else {if(di(s)){const t=s.getChildrenSize(),r=n>=t,i=r?s.getChildAtIndex(t-1):s.getChildAtIndex(n);if(Qn(i)){let t=0;r&&(t=i.getTextContentSize()),e.set(i.__key,t,"text");}}if(di(o)){const t=o.getChildrenSize(),e=i>=t,n=e?o.getChildAtIndex(t-1):o.getChildAtIndex(i);if(Qn(n)){let t=0;e&&(t=n.getTextContentSize()),r.set(n.__key,t,"text");}}}}function Ar(t,e,n,r,i){let s=null,o=0,l=null;null!==r?(s=r.__key,Qn(r)?(o=r.getTextContentSize(),l="text"):di(r)&&(o=r.getChildrenSize(),l="element")):null!==i&&(s=i.__key,Qn(i)?l="text":di(i)&&(l="element")),null!==s&&null!==l?t.set(s,o,l):(o=e.getIndexWithinParent(),-1===o&&(o=n.getChildrenSize()),t.set(n.__key,o,"element"));}function Or(t,e,n,r,i){"text"===t.type?t.set(n,t.offset+(e?0:i),"text"):t.offset>r.getIndexWithinParent()&&t.set(t.key,t.offset-1,"element");}function Dr(t,e,n,r,i){try{t.setBaseAndExtent(e,n,r,i);}catch(t){}}function Pr(t,e,n,r,i,s,o){const l=r.anchorNode,c=r.focusNode,a=r.anchorOffset,u=r.focusOffset,f=document.activeElement;if(i.has(Ni)&&f!==s||null!==f&&Yi(f))return;if(!cr(e))return void(null!==t&&Hi(n,l,c)&&r.removeAllRanges());const d=e.anchor,h=e.focus,g=d.key,_=h.key,p=Js(n,g),y=Js(n,_),m=d.offset,x=h.offset,C=e.format,S=e.style,v=e.isCollapsed();let k=p,T=y,b=false;if("text"===d.type){k=es(p);const t=d.getNode();b=t.getFormat()!==C||t.getStyle()!==S;}else cr(t)&&"text"===t.anchor.type&&(b=true);var N,w,E,M,A;if(("text"===h.type&&(T=es(y)),null!==k&&null!==T)&&(v&&(null===t||b||cr(t)&&(t.format!==C||t.style!==S))&&(N=C,w=S,E=m,M=g,A=performance.now(),gn=[N,w,E,M,A]),a!==m||u!==x||l!==k||c!==T||"Range"===r.type&&v||(null!==f&&s.contains(f)||s.focus({preventScroll:true}),"element"===d.type))){if(Dr(r,k,m,T,x),!i.has(Ei)&&e.isCollapsed()&&null!==s&&s===document.activeElement){const t=cr(e)&&"element"===e.anchor.type?k.childNodes[m]||null:r.rangeCount>0?r.getRangeAt(0):null;if(null!==t){let e;if(t instanceof Text){const n=document.createRange();n.selectNode(t),e=n.getBoundingClientRect();}else e=t.getBoundingClientRect();!function(t,e,n){const r=$s(n),i=qs(r);if(null===r||null===i)return;let{top:s,bottom:o}=e,l=0,c=0,a=n;for(;null!==a;){const e=a===r.body;if(e)l=0,c=Gs(t).innerHeight;else {const t=a.getBoundingClientRect();l=t.top,c=t.bottom;}let n=0;if(s<l?n=-(l-s):o>c&&(n=o-c),0!==n)if(e)i.scrollBy(0,n);else {const t=a.scrollTop;a.scrollTop+=n;const e=a.scrollTop-t;s-=e,o-=e;}if(e)break;a=Us(a);}}(n,e,s);}}ln=true;}}function Fr(t){let e=Nr()||wr();null===e&&(e=_s().selectEnd()),e.insertNodes(t);}function Ir(e){let n=e;e.isCollapsed()||n.removeText();const r=Nr();cr(r)&&(n=r),cr(n)||t$1(161);const i=n.anchor;let s=i.getNode(),o=i.offset;for(;!po(s);){const t=s;if([s,o]=zr(s,o),t.is(s))break}return o}function zr(t,e){const n=t.getParent();if(!n){const t=Pi();return _s().append(t),t.select(),[_s(),0]}if(Qn(t)){const r=t.splitText(e);if(0===r.length)return [n,t.getIndexWithinParent()];const i=0===e?0:1;return [n,r[0].getIndexWithinParent()+i]}if(!di(t)||0===e)return [n,t.getIndexWithinParent()];const r=t.getChildAtIndex(e);if(r){const n=new ar(ir(t.__key,e,"element"),ir(t.__key,e,"element"),0,""),i=t.insertNewAfter(n);i&&i.append(r,...r.getNextSiblings());}return [n,t.getIndexWithinParent()+1]}function Kr(t,e,n,r,i="decorators-and-blocks"){if("move"===e&&"character"===r&&!t.isCollapsed()){const[e,r]=n===t.isBackward()?[t.focus,t.anchor]:[t.anchor,t.focus];return r.set(e.key,e.offset,e.type),true}const s=ol(t.focus,n?"previous":"next"),o="lineboundary"===r,l="move"===e;let c=s,a="decorators-and-blocks"===i;if(!pl(c)){for(const t of c){a=false;const{origin:e}=t;if(!_i(e)||e.isIsolated()||(c=t,!o||!e.isInline()))break}if(a)for(const t of Xo(s).iterNodeCarets("extend"===e?"shadowRoot":"root")){if(zo(t))t.origin.isInline()||(c=t);else {if(di(t.origin))continue;_i(t.origin)&&!t.origin.isInline()&&(c=t);}break}}if(c===s)return  false;if(l&&!o&&_i(c.origin)&&c.origin.isKeyboardSelectable()){const t=kr();return t.add(c.origin.getKey()),ys(t),true}return c=_l(c),l&&ll(t.anchor,c),ll(t.focus,c),a||!o}let Br=null,Rr=null,Wr=false,Jr=false,Ur=0;const $r={characterData:true,childList:true,subtree:true};function jr(){return Wr||null!==Br&&Br._readOnly}function Vr(){Wr&&t$1(13);}function Yr(){Ur>99&&t$1(14);}function Hr(){return null===Br&&t$1(195,Gr()),Br}function qr(){return null===Rr&&t$1(196,Gr()),Rr}function Gr(){let t=0;const e=new Set,n=Ji.version;if("undefined"!=typeof window)for(const r of document.querySelectorAll("[contenteditable]")){const i=Xi(r);if(qi(i))t++;else if(i){let t=String(i.constructor.version||"<0.17.1");t===n&&(t+=" (separately built, likely a bundler configuration issue)"),e.add(t);}}let r=` Detected on the page: ${t} compatible editor(s) with version ${n}`;return e.size&&(r+=` and incompatible editors with versions ${Array.from(e).join(", ")}`),r}function Xr(){return Rr}function Qr(e,n,r){const i=n.__type,s=function(e,n){const r=e._nodes.get(n);void 0===r&&t$1(30,n);return r}(e,i);let o=r.get(i);void 0===o&&(o=Array.from(s.transforms),r.set(i,o));const l=o.length;for(let t=0;t<l&&(o[t](n),n.isAttached());t++);}function Zr(t,e){return void 0!==t&&t.__key!==e&&t.isAttached()}function ti(t,e){if(!e)return;const n=t._updateTags;let r=e;Array.isArray(e)||(r=[e]);for(const t of r)n.add(t);}function ei(t){return ni(t,qr()._nodes)}function ni(e,n){const r=e.type,i=n.get(r);void 0===i&&t$1(17,r);const s=i.klass;e.type!==s.getType()&&t$1(18,s.name);const o=s.importJSON(e),l=e.children;if(di(o)&&Array.isArray(l))for(let t=0;t<l.length;t++){const e=ni(l[t],n);o.append(e);}return o}function ri(t,e,n){const r=Br,i=Wr,s=Rr;Br=e,Wr=true,Rr=t;try{return n()}finally{Br=r,Wr=i,Rr=s;}}function ii(t,e){const n=t._pendingEditorState,r=t._rootElement,i=t._headless||null===r;if(null===n)return;const s=t._editorState,o=s._selection,l=n._selection,c=t._dirtyType!==y$4,a=Br,u=Wr,f=Rr,h=t._updating,g=t._observer;let _=null;if(t._pendingEditorState=null,t._editorState=n,!i&&c&&null!==g){Rr=t,Br=n,Wr=false,t._updating=true;try{const e=t._dirtyType,r=t._dirtyElements,i=t._dirtyLeaves;g.disconnect(),_=ie(s,n,t,e,r,i);}catch(e){if(e instanceof Error&&t._onError(e),Jr)throw e;return Ri(t,null,r,n),at$2(t),t._dirtyType=x$6,Jr=true,ii(t,s),void(Jr=false)}finally{g.observe(r,$r),t._updating=h,Br=a,Wr=u,Rr=f;}}n._readOnly||(n._readOnly=true);const p=t._dirtyLeaves,m=t._dirtyElements,C=t._normalizedNodes,S=t._updateTags,v=t._deferred;c&&(t._dirtyType=y$4,t._cloneNotNeeded.clear(),t._dirtyLeaves=new Set,t._dirtyElements=new Map,t._normalizedNodes=new Set,t._updateTags=new Set),function(t,e){const n=t._decorators;let r=t._pendingDecorators||n;const i=e._nodeMap;let s;for(s in r)i.has(s)||(r===n&&(r=hs(t)),delete r[s]);}(t,n);const k=i?null:oo(Gs(t));if(t._editable&&null!==k&&(c||null===l||l.dirty)&&null!==r&&!S.has(Mi)){Rr=t,Br=n;try{if(null!==g&&g.disconnect(),c||null===l||l.dirty){const e=t._blockCursorElement;null!==e&&so(e,t,r),Pr(o,l,t,k,S,r);}!function(t,e,n){let r=t._blockCursorElement;if(cr(n)&&n.isCollapsed()&&"element"===n.anchor.type&&e.contains(document.activeElement)){const i=n.anchor,s=i.getNode(),o=i.offset;let l=!1,c=null;if(o===s.getChildrenSize()){io(s.getChildAtIndex(o-1))&&(l=!0);}else {const e=s.getChildAtIndex(o);if(null!==e&&io(e)){const n=e.getPreviousSibling();(null===n||io(n))&&(l=!0,c=t.getElementByKey(e.__key));}}if(l){const n=t.getElementByKey(s.__key);return null===r&&(t._blockCursorElement=r=function(t){const e=t.theme,n=document.createElement("div");n.contentEditable="false",n.setAttribute("data-lexical-cursor","true");let r=e.blockCursor;if(void 0!==r){if("string"==typeof r){const t=d$3(r);r=e.blockCursor=t;}void 0!==r&&n.classList.add(...r);}return n}(t._config)),e.style.caretColor="transparent",void(null===c?n.appendChild(r):n.insertBefore(r,c))}}null!==r&&so(r,t,e);}(t,r,l);}finally{null!==g&&g.observe(r,$r),Rr=f,Br=a;}}null!==_&&function(t,e,n,r,i){const s=Array.from(t._listeners.mutation),o=s.length;for(let t=0;t<o;t++){const[o,l]=s[t],c=e.get(l);void 0!==c&&o(c,{dirtyLeaves:r,prevEditorState:i,updateTags:n});}}(t,_,S,p,s),cr(l)||null===l||null!==o&&o.is(l)||t.dispatchCommand(le,void 0);const T=t._pendingDecorators;null!==T&&(t._decorators=T,t._pendingDecorators=null,si("decorator",t,true,T)),function(t,e,n){const r=gs(e),i=gs(n);r!==i&&si("textcontent",t,true,i);}(t,e||s,n),si("update",t,true,{dirtyElements:m,dirtyLeaves:p,editorState:n,mutatedNodes:_,normalizedNodes:C,prevEditorState:e||s,tags:S}),function(t,e){if(t._deferred=[],0!==e.length){const n=t._updating;t._updating=true;try{for(let t=0;t<e.length;t++)e[t]();}finally{t._updating=n;}}}(t,v),function(t){const e=t._updates;if(0!==e.length){const n=e.shift();if(n){const[e,r]=n;li(t,e,r);}}}(t);}function si(t,e,n,...r){const i=e._updating;e._updating=n;try{const n=Array.from(e._listeners[t]);for(let t=0;t<n.length;t++)n[t].apply(null,r);}finally{e._updating=i;}}function oi(e,n){const r=e._updates;let i=n||false;for(;0!==r.length;){const n=r.shift();if(n){const[r,s]=n;let o;if(void 0!==s){if(o=s.onUpdate,s.skipTransforms&&(i=true),s.discrete){const n=e._pendingEditorState;null===n&&t$1(191),n._flushSync=true;}o&&e._deferred.push(o),ti(e,s.tag);}r();}}return i}function li(e,n,r){const i=e._updateTags;let s,o=false,l=false;void 0!==r&&(s=r.onUpdate,ti(e,r.tag),o=r.skipTransforms||false,l=r.discrete||false),s&&e._deferred.push(s);const c=e._editorState;let a=e._pendingEditorState,u=false;(null===a||a._readOnly)&&(a=e._pendingEditorState=mi(a||c),u=true),a._flushSync=l;const f=Br,d=Wr,h=Rr,g=e._updating;Br=a,Wr=false,e._updating=true,Rr=e;const _=e._headless||null===e.getRootElement();try{u&&(_?null!==c._selection&&(a._selection=c._selection.clone()):a._selection=function(t,e){const n=t.getEditorState()._selection,r=oo(Gs(t));return cr(n)||null==n?br(n,r,t,e):n.clone()}(e,r&&r.event||null));const i=e._compositionKey;n(),o=oi(e,o),function(t,e){const n=e.getEditorState()._selection,r=t._selection;if(cr(r)){const t=r.anchor,e=r.focus;let i;if("text"===t.type&&(i=t.getNode(),i.selectionTransform(n,r)),"text"===e.type){const t=e.getNode();i!==t&&t.selectionTransform(n,r);}}}(a,e),e._dirtyType!==y$4&&(o?function(t,e){const n=e._dirtyLeaves,r=t._nodeMap;for(const t of n){const e=r.get(t);Qn(e)&&e.isAttached()&&e.isSimpleText()&&!e.isUnmergeable()&&St$2(e);}}(a,e):function(t,e){const n=e._dirtyLeaves,r=e._dirtyElements,i=t._nodeMap,s=cs(),o=new Map;let l=n,c=l.size,a=r,u=a.size;for(;c>0||u>0;){if(c>0){e._dirtyLeaves=new Set;for(const t of l){const r=i.get(t);Qn(r)&&r.isAttached()&&r.isSimpleText()&&!r.isUnmergeable()&&St$2(r),void 0!==r&&Zr(r,s)&&Qr(e,r,o),n.add(t);}if(l=e._dirtyLeaves,c=l.size,c>0){Ur++;continue}}e._dirtyLeaves=new Set,e._dirtyElements=new Map,a.delete("root")&&a.set("root",!0);for(const t of a){const n=t[0],l=t[1];if(r.set(n,l),!l)continue;const c=i.get(n);void 0!==c&&Zr(c,s)&&Qr(e,c,o);}l=e._dirtyLeaves,c=l.size,a=e._dirtyElements,u=a.size,Ur++;}e._dirtyLeaves=n,e._dirtyElements=r;}(a,e),oi(e),function(t,e,n,r){const i=t._nodeMap,s=e._nodeMap,o=[];for(const[t]of r){const e=s.get(t);void 0!==e&&(e.isAttached()||(di(e)&&Q$2(e,t,i,s,o,r),i.has(t)||r.delete(t),o.push(t)));}for(const t of o)s.delete(t);for(const t of n){const e=s.get(t);void 0===e||e.isAttached()||(i.has(t)||n.delete(t),s.delete(t));}}(c,a,e._dirtyLeaves,e._dirtyElements));i!==e._compositionKey&&(a._flushSync=!0);const s=a._selection;if(cr(s)){const e=a._nodeMap,n=s.anchor.key,r=s.focus.key;void 0!==e.get(n)&&void 0!==e.get(r)||t$1(19);}else ur(s)&&0===s._nodes.size&&(a._selection=null);}catch(t){return t instanceof Error&&e._onError(t),e._pendingEditorState=c,e._dirtyType=x$6,e._cloneNotNeeded.clear(),e._dirtyLeaves=new Set,e._dirtyElements.clear(),void ii(e)}finally{Br=f,Wr=d,Rr=h,e._updating=g,Ur=0;}const p=e._dirtyType!==y$4||e._deferred.length>0||function(t,e){const n=e.getEditorState()._selection,r=t._selection;if(null!==r){if(r.dirty||!r.is(n))return  true}else if(null!==n)return  true;return  false}(a,e);p?a._flushSync?(a._flushSync=false,ii(e)):u&&ji((()=>{ii(e);})):(a._flushSync=false,u&&(i.clear(),e._deferred=[],e._pendingEditorState=null));}function ci(t,e,n){Rr===t&&void 0===n?e():li(t,e,n);}class ai{constructor(t,e,n){this.element=t,this.before=e||null,this.after=n||null;}withBefore(t){return new ai(this.element,t,this.after)}withAfter(t){return new ai(this.element,this.before,t)}withElement(t){return this.element===t?this:new ai(t,this.before,this.after)}insertChild(e){const n=this.before||this.getManagedLineBreak();return null!==n&&n.parentElement!==this.element&&t$1(222),this.element.insertBefore(e,n),this}removeChild(e){return e.parentElement!==this.element&&t$1(223),this.element.removeChild(e),this}replaceChild(e,n){return n.parentElement!==this.element&&t$1(224),this.element.replaceChild(e,n),this}getFirstChild(){const t=this.after?this.after.nextSibling:this.element.firstChild;return t===this.before||t===this.getManagedLineBreak()?null:t}getManagedLineBreak(){return this.element.__lexicalLineBreak||null}setManagedLineBreak(t){if(null===t)this.removeManagedLineBreak();else {const e="decorator"===t&&(l||o$2);this.insertManagedLineBreak(e);}}removeManagedLineBreak(){const t=this.getManagedLineBreak();if(t){const e=this.element,n="IMG"===t.nodeName?t.nextSibling:null;n&&e.removeChild(n),e.removeChild(t),e.__lexicalLineBreak=void 0;}}insertManagedLineBreak(t){const e=this.getManagedLineBreak();if(e){if(t===("IMG"===e.nodeName))return;this.removeManagedLineBreak();}const n=this.element,r=this.before,i=document.createElement("br");if(n.insertBefore(i,r),t){const t=document.createElement("img");t.setAttribute("data-lexical-linebreak","true"),t.style.cssText="display: inline !important; border: 0px !important; margin: 0px !important;",t.alt="",n.insertBefore(t,i),n.__lexicalLineBreak=t;}else n.__lexicalLineBreak=i;}getFirstChildOffset(){let t=0;for(let e=this.after;null!==e;e=e.previousSibling)t++;return t}resolveChildIndex(t,e,n,r){if(n===this.element){const e=this.getFirstChildOffset();return [t,Math.min(e+t.getChildrenSize(),Math.max(e,r))]}const i=ui(e,n);i.push(r);const s=ui(e,this.element);let o=t.getIndexWithinParent();for(let t=0;t<s.length;t++){const e=i[t],n=s[t];if(void 0===e||e<n)break;if(e>n){o+=1;break}}return [t.getParentOrThrow(),o]}}function ui(e,n){const r=[];let i=n;for(;i!==e&&null!==i;i=i.parentNode){let t=0;for(let e=i.previousSibling;null!==e;e=e.previousSibling)t++;r.push(t);}return i!==e&&t$1(225),r.reverse()}class fi extends An{constructor(t){super(t),this.__first=null,this.__last=null,this.__size=0,this.__format=0,this.__style="",this.__indent=0,this.__dir=null,this.__textFormat=0,this.__textStyle="";}afterCloneFrom(t){super.afterCloneFrom(t),this.__first=t.__first,this.__last=t.__last,this.__size=t.__size,this.__indent=t.__indent,this.__format=t.__format,this.__style=t.__style,this.__dir=t.__dir,this.__textFormat=t.__textFormat,this.__textStyle=t.__textStyle;}getFormat(){return this.getLatest().__format}getFormatType(){const t=this.getFormat();return H$2[t]||""}getStyle(){return this.getLatest().__style}getIndent(){return this.getLatest().__indent}getChildren(){const t=[];let e=this.getFirstChild();for(;null!==e;)t.push(e),e=e.getNextSibling();return t}getChildrenKeys(){const t=[];let e=this.getFirstChild();for(;null!==e;)t.push(e.__key),e=e.getNextSibling();return t}getChildrenSize(){return this.getLatest().__size}isEmpty(){return 0===this.getChildrenSize()}isDirty(){const t=qr()._dirtyElements;return null!==t&&t.has(this.__key)}isLastChild(){const t=this.getLatest(),e=this.getParentOrThrow().getLastChild();return null!==e&&e.is(t)}getAllTextNodes(){const t=[];let e=this.getFirstChild();for(;null!==e;){if(Qn(e)&&t.push(e),di(e)){const n=e.getAllTextNodes();t.push(...n);}e=e.getNextSibling();}return t}getFirstDescendant(){let t=this.getFirstChild();for(;di(t);){const e=t.getFirstChild();if(null===e)break;t=e;}return t}getLastDescendant(){let t=this.getLastChild();for(;di(t);){const e=t.getLastChild();if(null===e)break;t=e;}return t}getDescendantByIndex(t){const e=this.getChildren(),n=e.length;if(t>=n){const t=e[n-1];return di(t)&&t.getLastDescendant()||t||null}const r=e[t];return di(r)&&r.getFirstDescendant()||r||null}getFirstChild(){const t=this.getLatest().__first;return null===t?null:as(t)}getFirstChildOrThrow(){const e=this.getFirstChild();return null===e&&t$1(45,this.__key),e}getLastChild(){const t=this.getLatest().__last;return null===t?null:as(t)}getLastChildOrThrow(){const e=this.getLastChild();return null===e&&t$1(96,this.__key),e}getChildAtIndex(t){const e=this.getChildrenSize();let n,r;if(t<e/2){for(n=this.getFirstChild(),r=0;null!==n&&r<=t;){if(r===t)return n;n=n.getNextSibling(),r++;}return null}for(n=this.getLastChild(),r=e-1;null!==n&&r>=t;){if(r===t)return n;n=n.getPreviousSibling(),r--;}return null}getTextContent(){let t="";const e=this.getChildren(),n=e.length;for(let r=0;r<n;r++){const i=e[r];t+=i.getTextContent(),di(i)&&r!==n-1&&!i.isInline()&&(t+=B$5);}return t}getTextContentSize(){let t=0;const e=this.getChildren(),n=e.length;for(let r=0;r<n;r++){const i=e[r];t+=i.getTextContentSize(),di(i)&&r!==n-1&&!i.isInline()&&(t+=B$5.length);}return t}getDirection(){return this.getLatest().__dir}getTextFormat(){return this.getLatest().__textFormat}hasFormat(t){if(""!==t){const e=Y$3[t];return !!(this.getFormat()&e)}return  false}hasTextFormat(t){const e=j$3[t];return !!(this.getTextFormat()&e)}getFormatFlags(t,e){return ns(this.getLatest().__textFormat,t,e)}getTextStyle(){return this.getLatest().__textStyle}select(t,e){Vr();const n=Nr();let r=t,i=e;const s=this.getChildrenSize();if(!this.canBeEmpty())if(0===t&&0===e){const t=this.getFirstChild();if(Qn(t)||di(t))return t.select(0,0)}else if(!(void 0!==t&&t!==s||void 0!==e&&e!==s)){const t=this.getLastChild();if(Qn(t)||di(t))return t.select()} void 0===r&&(r=s),void 0===i&&(i=s);const o=this.__key;return cr(n)?(n.anchor.set(o,r,"element"),n.focus.set(o,i,"element"),n.dirty=true,n):Sr(o,r,o,i,"element","element")}selectStart(){const t=this.getFirstDescendant();return t?t.selectStart():this.select()}selectEnd(){const t=this.getLastDescendant();return t?t.selectEnd():this.select()}clear(){const t=this.getWritable();return this.getChildren().forEach((t=>t.remove())),t}append(...t){return this.splice(this.getChildrenSize(),0,t)}setDirection(t){const e=this.getWritable();return e.__dir=t,e}setFormat(t){return this.getWritable().__format=""!==t?Y$3[t]:0,this}setStyle(t){return this.getWritable().__style=t||"",this}setTextFormat(t){const e=this.getWritable();return e.__textFormat=t,e}setTextStyle(t){const e=this.getWritable();return e.__textStyle=t,e}setIndent(t){return this.getWritable().__indent=t,this}splice(e,n,r){const i=r.length,s=this.getChildrenSize(),o=this.getWritable();e+n<=s||t$1(226,String(e),String(n),String(s));const l=o.__key,c=[],a=[],u=this.getChildAtIndex(e+n);let f=null,d=s-n+i;if(0!==e)if(e===s)f=this.getLastChild();else {const t=this.getChildAtIndex(e);null!==t&&(f=t.getPreviousSibling());}if(n>0){let e=null===f?this.getFirstChild():f.getNextSibling();for(let r=0;r<n;r++){null===e&&t$1(100);const n=e.getNextSibling(),r=e.__key;ss(e.getWritable()),a.push(r),e=n;}}let h=f;for(let e=0;e<i;e++){const n=r[e];null!==h&&n.is(h)&&(f=h=h.getPreviousSibling());const i=n.getWritable();i.__parent===l&&d--,ss(i);const s=n.__key;if(null===h)o.__first=s,i.__prev=null;else {const t=h.getWritable();t.__next=s,i.__prev=t.__key;}n.__key===l&&t$1(76),i.__parent=l,c.push(s),h=n;}if(e+n===s){if(null!==h){h.getWritable().__next=null,o.__last=h.__key;}}else if(null!==u){const t=u.getWritable();if(null!==h){const e=h.getWritable();t.__prev=h.__key,e.__next=u.__key;}else t.__prev=null;}if(o.__size=d,a.length){const t=Nr();if(cr(t)){const e=new Set(a),n=new Set(c),{anchor:r,focus:i}=t;hi(r,e,n)&&Ar(r,r.getNode(),this,f,u),hi(i,e,n)&&Ar(i,i.getNode(),this,f,u),0!==d||this.canBeEmpty()||Zs(this)||this.remove();}}return o}getDOMSlot(t){return new ai(t)}exportDOM(t){const{element:e}=super.exportDOM(t);if(uo(e)){const t=this.getIndent();t>0&&(e.style.paddingInlineStart=40*t+"px");const n=this.getDirection();n&&(e.dir=n);}return {element:e}}exportJSON(){const t={children:[],direction:this.getDirection(),format:this.getFormatType(),indent:this.getIndent(),...super.exportJSON()},e=this.getTextFormat(),n=this.getTextStyle();return 0!==e&&(t.textFormat=e),""!==n&&(t.textStyle=n),t}updateFromJSON(t){return super.updateFromJSON(t).setFormat(t.format).setIndent(t.indent).setDirection(t.direction).setTextFormat(t.textFormat||0).setTextStyle(t.textStyle||"")}insertNewAfter(t,e){return null}canIndent(){return  true}collapseAtStart(t){return  false}excludeFromCopy(t){return  false}canReplaceWith(t){return  true}canInsertAfter(t){return  true}canBeEmpty(){return  true}canInsertTextBefore(){return  true}canInsertTextAfter(){return  true}isInline(){return  false}isShadowRoot(){return  false}canMergeWith(t){return  false}extractWithChild(t,e,n){return  false}canMergeWhenEmpty(){return  false}reconcileObservedMutation(t,e){const n=this.getDOMSlot(t);let r=n.getFirstChild();for(let t=this.getFirstChild();t;t=t.getNextSibling()){const i=e.getElementByKey(t.getKey());null!==i&&(null==r?(n.insertChild(i),r=i):r!==i&&n.replaceChild(i,r),r=r.nextSibling);}}}function di(t){return t instanceof fi}function hi(t,e,n){let r=t.getNode();for(;r;){const t=r.__key;if(e.has(t)&&!n.has(t))return  true;r=r.getParent();}return  false}class gi extends An{decorate(e,n){t$1(47);}isIsolated(){return  false}isInline(){return  true}isKeyboardSelectable(){return  true}}function _i(t){return t instanceof gi}class pi extends fi{static getType(){return "root"}static clone(){return new pi}constructor(){super("root"),this.__cachedText=null;}getTopLevelElementOrThrow(){t$1(51);}getTextContent(){const t=this.__cachedText;return !jr()&&qr()._dirtyType!==y$4||null===t?super.getTextContent():t}remove(){t$1(52);}replace(e){t$1(53);}insertBefore(e){t$1(54);}insertAfter(e){t$1(55);}updateDOM(t,e){return  false}splice(e,n,r){for(const e of r)di(e)||_i(e)||t$1(282);return super.splice(e,n,r)}static importJSON(t){return _s().updateFromJSON(t)}collapseAtStart(){return  true}}function yi(t){return t instanceof pi}function mi(t){return new Si(new Map(t._nodeMap))}function xi(){return new Si(new Map([["root",new pi]]))}function Ci(e){const n=e.exportJSON(),r=e.constructor;if(n.type!==r.getType()&&t$1(130,r.name),di(e)){const i=n.children;Array.isArray(i)||t$1(59,r.name);const s=e.getChildren();for(let t=0;t<s.length;t++){const e=Ci(s[t]);i.push(e);}}return n}class Si{constructor(t,e){this._nodeMap=t,this._selection=e||null,this._flushSync=false,this._readOnly=false;}isEmpty(){return 1===this._nodeMap.size&&null===this._selection}read(t,e){return ri(e&&e.editor||null,this,t)}clone(t){const e=new Si(this._nodeMap,void 0===t?this._selection:t);return e._readOnly=true,e}toJSON(){return ri(null,this,(()=>({root:Ci(_s())})))}}const vi="historic",ki="history-push",Ti="history-merge",bi="paste",Ni="collaboration",Ei="skip-scroll-into-view",Mi="skip-dom-selection";class Ai extends fi{static getType(){return "artificial"}createDOM(t){return document.createElement("div")}}class Oi extends fi{static getType(){return "paragraph"}static clone(t){return new Oi(t.__key)}createDOM(t){const e=document.createElement("p"),n=Fs(t.theme,"paragraph");if(void 0!==n){e.classList.add(...n);}return e}updateDOM(t,e,n){return  false}static importDOM(){return {p:t=>({conversion:Di,priority:0})}}exportDOM(t){const{element:e}=super.exportDOM(t);if(uo(e)){this.isEmpty()&&e.append(document.createElement("br"));const t=this.getFormatType();t&&(e.style.textAlign=t);}return {element:e}}static importJSON(t){return Pi().updateFromJSON(t)}exportJSON(){return {...super.exportJSON(),textFormat:this.getTextFormat(),textStyle:this.getTextStyle()}}insertNewAfter(t,e){const n=Pi();n.setTextFormat(t.format),n.setTextStyle(t.style);const r=this.getDirection();return n.setDirection(r),n.setFormat(this.getFormatType()),n.setStyle(this.getStyle()),this.insertAfter(n,e),n}collapseAtStart(){const t=this.getChildren();if(0===t.length||Qn(t[0])&&""===t[0].getTextContent().trim()){if(null!==this.getNextSibling())return this.selectNext(),this.remove(),true;if(null!==this.getPreviousSibling())return this.selectPrevious(),this.remove(),true}return  false}}function Di(t){const e=Pi();return t.style&&(e.setFormat(t.style.textAlign),ko(t,e)),{node:e}}function Pi(){return eo(new Oi)}function Fi(t){return t instanceof Oi}const Li=0,Ii=1,Bi=4;function Ri(t,e,n,r){const i=t._keyToDOMMap;i.clear(),t._editorState=xi(),t._pendingEditorState=r,t._compositionKey=null,t._dirtyType=y$4,t._cloneNotNeeded.clear(),t._dirtyLeaves=new Set,t._dirtyElements.clear(),t._normalizedNodes=new Set,t._updateTags=new Set,t._updates=[],t._blockCursorElement=null;const s=t._observer;null!==s&&(s.disconnect(),t._observer=null),null!==e&&(e.textContent=""),null!==n&&(n.textContent="",i.set("root",n));}function Wi(t){const e=t||{},n=Xr(),r=e.theme||{},i=void 0===t?n:e.parentEditor||null,s=e.disableEvents||false,o=xi(),l=e.namespace||(null!==i?i._config.namespace:vs()),c=e.editorState,a=[pi,Jn,On,tr,Oi,Ai,...e.nodes||[]],{onError:u,html:f}=e,d=void 0===e.editable||e.editable;let h;if(void 0===t&&null!==n)h=n._nodes;else {h=new Map;for(let t=0;t<a.length;t++){let e=a[t],n=null,r=null;if("function"!=typeof e){const t=e;e=t.replace,n=t.with,r=t.withKlass||null;}const i=e.getType(),s=e.transform(),o=new Set;null!==s&&o.add(s),h.set(i,{exportDOM:f&&f.export?f.export.get(e):void 0,klass:e,replace:n,replaceWithKlass:r,transforms:o});}}const g=new Ji(o,i,h,{disableEvents:s,namespace:l,theme:r},u||console.error,function(t,e){const n=new Map,r=new Set,i=t=>{Object.keys(t).forEach((e=>{let r=n.get(e);void 0===r&&(r=[],n.set(e,r)),r.push(t[e]);}));};return t.forEach((t=>{const e=t.klass.importDOM;if(null==e||r.has(e))return;r.add(e);const n=e.call(t.klass);null!==n&&i(n);})),e&&i(e),n}(h,f?f.import:void 0),d,t);return void 0!==c&&(g._pendingEditorState=c,g._dirtyType=x$6),g}class Ji{constructor(t,e,n,r,i,s,o,l){this._createEditorArgs=l,this._parentEditor=e,this._rootElement=null,this._editorState=t,this._pendingEditorState=null,this._compositionKey=null,this._deferred=[],this._keyToDOMMap=new Map,this._updates=[],this._updating=false,this._listeners={decorator:new Set,editable:new Set,mutation:new Map,root:new Set,textcontent:new Set,update:new Set},this._commands=new Map,this._config=r,this._nodes=n,this._decorators={},this._pendingDecorators=null,this._dirtyType=y$4,this._cloneNotNeeded=new Set,this._dirtyLeaves=new Set,this._dirtyElements=new Map,this._normalizedNodes=new Set,this._updateTags=new Set,this._observer=null,this._key=vs(),this._onError=i,this._htmlConversions=s,this._editable=o,this._headless=null!==e&&e._headless,this._window=null,this._blockCursorElement=null;}isComposing(){return null!=this._compositionKey}registerUpdateListener(t){const e=this._listeners.update;return e.add(t),()=>{e.delete(t);}}registerEditableListener(t){const e=this._listeners.editable;return e.add(t),()=>{e.delete(t);}}registerDecoratorListener(t){const e=this._listeners.decorator;return e.add(t),()=>{e.delete(t);}}registerTextContentListener(t){const e=this._listeners.textcontent;return e.add(t),()=>{e.delete(t);}}registerRootListener(t){const e=this._listeners.root;return t(this._rootElement,null),e.add(t),()=>{t(null,this._rootElement),e.delete(t);}}registerCommand(e,n,r){ void 0===r&&t$1(35);const i=this._commands;i.has(e)||i.set(e,[new Set,new Set,new Set,new Set,new Set]);const s=i.get(e);void 0===s&&t$1(36,String(e));const o=s[r];return o.add(n),()=>{o.delete(n),s.every((t=>0===t.size))&&i.delete(e);}}registerMutationListener(t,e,n){const r=this.resolveRegisteredNodeAfterReplacements(this.getRegisteredNode(t)).klass,i=this._listeners.mutation;i.set(e,r);const s=n&&n.skipInitialization;return void 0!==s&&s||this.initializeMutationListener(e,r),()=>{i.delete(e);}}getRegisteredNode(e){const n=this._nodes.get(e.getType());return void 0===n&&t$1(37,e.name),n}resolveRegisteredNodeAfterReplacements(t){for(;t.replaceWithKlass;)t=this.getRegisteredNode(t.replaceWithKlass);return t}initializeMutationListener(t,e){const n=this._editorState,r=So(n).get(e.getType());if(!r)return;const i=new Map;for(const t of r.keys())i.set(t,"created");i.size>0&&t(i,{dirtyLeaves:new Set,prevEditorState:n,updateTags:new Set(["registerMutationListener"])});}registerNodeTransformToKlass(t,e){const n=this.getRegisteredNode(t);return n.transforms.add(e),n}registerNodeTransform(t,e){const n=this.registerNodeTransformToKlass(t,e),r=[n],i=n.replaceWithKlass;if(null!=i){const t=this.registerNodeTransformToKlass(i,e);r.push(t);}return function(t,e){const n=So(t.getEditorState()),r=[];for(const t of e){const e=n.get(t);e&&r.push(e);}if(0===r.length)return;t.update((()=>{for(const t of r)for(const e of t.keys()){const t=as(e);t&&t.markDirty();}}),null===t._pendingEditorState?{tag:Ti}:void 0);}(this,r.map((t=>t.klass.getType()))),()=>{r.forEach((t=>t.transforms.delete(e)));}}hasNode(t){return this._nodes.has(t.getType())}hasNodes(t){return t.every(this.hasNode.bind(this))}dispatchCommand(t,e){return Rs(this,t,e)}getDecorators(){return this._decorators}getRootElement(){return this._rootElement}getKey(){return this._key}setRootElement(t){const e=this._rootElement;if(t!==e){const n=Fs(this._config.theme,"root"),r=this._pendingEditorState||this._editorState;if(this._rootElement=t,Ri(this,e,t,r),null!==e&&(this._config.disableEvents||En(e),null!=n&&e.classList.remove(...n)),null!==t){const e=qs(t),r=t.style;r.userSelect="text",r.whiteSpace="pre-wrap",r.wordBreak="break-word",t.setAttribute("data-lexical-editor","true"),this._window=e,this._dirtyType=x$6,at$2(this),this._updateTags.add(Ti),ii(this),this._config.disableEvents||function(t,e){const n=t.ownerDocument,r=on.get(n);(void 0===r||r<1)&&n.addEventListener("selectionchange",Tn),on.set(n,(r||0)+1),t.__lexicalEditor=e;const i=vn(t);for(let n=0;n<tn.length;n++){const[r,s]=tn[n],o="function"==typeof s?t=>{Nn(t)||(bn(t),(e.isEditable()||"click"===r)&&s(t,e));}:t=>{if(Nn(t))return;bn(t);const n=e.isEditable();switch(r){case "cut":return n&&Rs(e,Ue,t);case "copy":return Rs(e,Je,t);case "paste":return n&&Rs(e,ge,t);case "dragstart":return n&&Rs(e,Be,t);case "dragover":return n&&Rs(e,Re,t);case "dragend":return n&&Rs(e,We,t);case "focus":return n&&Rs(e,qe,t);case "blur":return n&&Rs(e,Ge,t);case "drop":return n&&Rs(e,ze,t)}};t.addEventListener(r,o),i.push((()=>{t.removeEventListener(r,o);}));}}(t,this),null!=n&&t.classList.add(...n);}else this._window=null,this._updateTags.add(Ti),ii(this);si("root",this,false,t,e);}}getElementByKey(t){return this._keyToDOMMap.get(t)||null}getEditorState(){return this._editorState}setEditorState(e,n){e.isEmpty()&&t$1(38);let r=e;r._readOnly&&(r=mi(e),r._selection=e._selection?e._selection.clone():null),ct$3(this);const i=this._pendingEditorState,s=this._updateTags,o=void 0!==n?n.tag:null;null===i||i.isEmpty()||(null!=o&&s.add(o),ii(this)),this._pendingEditorState=r,this._dirtyType=x$6,this._dirtyElements.set("root",false),this._compositionKey=null,null!=o&&s.add(o),this._updating||ii(this);}parseEditorState(t,e){return function(t,e,n){const r=xi(),i=Br,s=Wr,o=Rr,l=e._dirtyElements,c=e._dirtyLeaves,a=e._cloneNotNeeded,u=e._dirtyType;e._dirtyElements=new Map,e._dirtyLeaves=new Set,e._cloneNotNeeded=new Set,e._dirtyType=0,Br=r,Wr=false,Rr=e;try{const i=e._nodes;ni(t.root,i),n&&n(),r._readOnly=!0;}catch(t){t instanceof Error&&e._onError(t);}finally{e._dirtyElements=l,e._dirtyLeaves=c,e._cloneNotNeeded=a,e._dirtyType=u,Br=i,Wr=s,Rr=o;}return r}("string"==typeof t?JSON.parse(t):t,this,e)}read(t){return ii(this),this.getEditorState().read(t,{editor:this})}update(t,e){!function(t,e,n){t._updating?t._updates.push([e,n]):li(t,e,n);}(this,t,e);}focus(t,e={}){const n=this._rootElement;null!==n&&(n.setAttribute("autocapitalize","off"),ci(this,(()=>{const r=Nr(),i=_s();null!==r?r.dirty||ys(r.clone()):0!==i.getChildrenSize()&&("rootStart"===e.defaultSelection?i.selectStart():i.selectEnd()),Vs("focus"),Ys((()=>{n.removeAttribute("autocapitalize"),t&&t();}));})),null===this._pendingEditorState&&n.removeAttribute("autocapitalize"));}blur(){const t=this._rootElement;null!==t&&t.blur();const e=oo(this._window);null!==e&&e.removeAllRanges();}isEditable(){return this._editable}setEditable(t){this._editable!==t&&(this._editable=t,si("editable",this,true,t));}toJSON(){return {editorState:this._editorState.toJSON()}}}Ji.version="0.31.2+prod.esm";let Ui=1;const ji="function"==typeof queueMicrotask?queueMicrotask:t=>{Promise.resolve().then(t);};function Vi(t){return _i(ds(t))}function Yi(t){const e=document.activeElement;if(!uo(e))return  false;const n=e.nodeName;return _i(ds(t))&&("INPUT"===n||"TEXTAREA"===n||"true"===e.contentEditable&&null==Xi(e))}function Hi(t,e,n){const r=t.getRootElement();try{return null!==r&&r.contains(e)&&r.contains(n)&&null!==e&&!Yi(e)&&Gi(e)===t}catch(t){return  false}}function qi(t){return t instanceof Ji}function Gi(t){let e=t;for(;null!=e;){const t=Xi(e);if(qi(t))return t;e=Us(e);}return null}function Xi(t){return t?t.__lexicalEditor:null}function Qi(t){return t.isToken()||t.isSegmented()}function Zi(t){return fo(t)&&t.nodeType===g$5}function ts(t){return fo(t)&&t.nodeType===_$3}function es(t){let e=t;for(;null!=e;){if(Zi(e))return e;e=e.firstChild;}return null}function ns(t,e,n){const r=j$3[e];if(null!==n&&(t&r)==(n&r))return t;let i=t^r;return "subscript"===e?i&=-65:"superscript"===e?i&=-33:"lowercase"===e?(i&=-513,i&=-1025):"uppercase"===e?(i&=-257,i&=-1025):"capitalize"===e&&(i&=-257,i&=-513),i}function rs(t){return Qn(t)||Fn(t)||_i(t)}function is$1(t,e){if(null!=e)return void(t.__key=e);Vr(),Yr();const n=qr(),r=Hr(),i=""+Ui++;r._nodeMap.set(i,t),di(t)?n._dirtyElements.set(i,true):n._dirtyLeaves.add(i),n._cloneNotNeeded.add(i),n._dirtyType=m$5,t.__key=i;}function ss(t){const e=t.getParent();if(null!==e){const n=t.getWritable(),r=e.getWritable(),i=t.getPreviousSibling(),s=t.getNextSibling(),o=null!==s?s.__key:null,l=null!==i?i.__key:null,c=null!==i?i.getWritable():null,a=null!==s?s.getWritable():null;null===i&&(r.__first=o),null===s&&(r.__last=l),null!==c&&(c.__next=o),null!==a&&(a.__prev=l),n.__prev=null,n.__next=null,n.__parent=null,r.__size--;}}function os(t){Yr();const e=t.getLatest(),n=e.__parent,r=Hr(),i=qr(),s=r._nodeMap,o=i._dirtyElements;null!==n&&function(t,e,n){let r=t;for(;null!==r;){if(n.has(r))return;const t=e.get(r);if(void 0===t)break;n.set(r,false),r=t.__parent;}}(n,s,o);const l=e.__key;i._dirtyType=m$5,di(t)?o.set(l,true):i._dirtyLeaves.add(l);}function ls(t){Vr();const e=qr(),n=e._compositionKey;if(t!==n){if(e._compositionKey=t,null!==n){const t=as(n);null!==t&&t.getWritable();}if(null!==t){const e=as(t);null!==e&&e.getWritable();}}}function cs(){if(jr())return null;return qr()._compositionKey}function as(t,e){const n=(e||Hr())._nodeMap.get(t);return void 0===n?null:n}function us(t,e){const n=fs(t,qr());return void 0!==n?as(n,e):null}function fs(t,e){return t[`__lexicalKey_${e._key}`]}function ds(t,e){let n=t;for(;null!=n;){const t=us(n,e);if(null!==t)return t;n=Us(n);}return null}function hs(t){const e=t._decorators,n=Object.assign({},e);return t._pendingDecorators=n,n}function gs(t){return t.read((()=>_s().getTextContent()))}function _s(){return ps(Hr())}function ps(t){return t._nodeMap.get("root")}function ys(t){Vr();const e=Hr();null!==t&&(t.dirty=true,t.setCachedNodes(null)),e._selection=t;}function ms(t){const e=qr(),n=function(t,e){let n=t;for(;null!=n;){const t=fs(n,e);if(void 0!==t)return t;n=Us(n);}return null}(t,e);if(null===n){return t===e.getRootElement()?as("root"):null}return as(n)}function xs(t,e){return e?t.getTextContentSize():0}function Cs(t){return /[\uD800-\uDBFF][\uDC00-\uDFFF]/g.test(t)}function Ss(t){const e=[];let n=t;for(;null!==n;)e.push(n),n=n._parentEditor;return e}function vs(){return Math.random().toString(36).replace(/[^a-z]+/g,"").substring(0,5)}function ks(t){return Zi(t)?t.nodeValue:null}function Ts(t,e,n){const r=oo(Gs(e));if(null===r)return;const i=r.anchorNode;let{anchorOffset:s,focusOffset:o}=r;if(null!==i){let e=ks(i);const r=ds(i);if(null!==e&&Qn(r)){if(e===K$3&&n){const t=n.length;e=n,s=t,o=t;}null!==e&&bs(r,e,s,o,t);}}}function bs(t,e,n,r,i){let s=t;if(s.isAttached()&&(i||!s.isDirty())){const c=s.isComposing();let a=e;(c||i)&&e[e.length-1]===K$3&&(a=e.slice(0,-1));const u=s.getTextContent();if(i||a!==u){if(""===a){if(ls(null),o$2||l||f$5)s.remove();else {const t=qr();setTimeout((()=>{t.update((()=>{s.isAttached()&&s.remove();}));}),20);}return}const e=s.getParent(),i=wr(),u=s.getTextContentSize(),d=cs(),h=s.getKey();if(s.isToken()||null!==d&&h===d&&!c||cr(i)&&(null!==e&&!e.canInsertTextBefore()&&0===i.anchor.offset||i.anchor.key===t.__key&&0===i.anchor.offset&&!s.canInsertTextBefore()&&!c||i.focus.key===t.__key&&i.focus.offset===u&&!s.canInsertTextAfter()&&!c))return void s.markDirty();const g=Nr();if(!cr(g)||null===n||null===r)return void s.setTextContent(a);if(g.setTextNodeRange(s,n,s,r),s.isSegmented()){const t=Xn(s.getTextContent());s.replace(t),s=t;}s.setTextContent(a);}}}function Ns(t,e,n){const r=e[n]||false;return "any"===r||r===t[n]}function ws(t,e){return Ns(t,e,"altKey")&&Ns(t,e,"ctrlKey")&&Ns(t,e,"shiftKey")&&Ns(t,e,"metaKey")}function Es(t,e,n){return ws(t,n)&&t.key.toLowerCase()===e.toLowerCase()}const Ms={ctrlKey:!r$1,metaKey:r$1},As={altKey:r$1,ctrlKey:!r$1};function Os(t){return "Backspace"===t.key}function Ds(t){return Es(t,"a",Ms)}function Ps(t){const e=_s();if(cr(t)){const e=t.anchor,n=t.focus,r=e.getNode().getTopLevelElementOrThrow().getParentOrThrow();return e.set(r.getKey(),0,"element"),n.set(r.getKey(),r.getChildrenSize(),"element"),vt$4(t),t}{const t=e.select(0,e.getChildrenSize());return ys(vt$4(t)),t}}function Fs(t,e){ void 0===t.__lexicalClassNameCache&&(t.__lexicalClassNameCache={});const n=t.__lexicalClassNameCache,r=n[e];if(void 0!==r)return r;const i=t[e];if("string"==typeof i){const t=d$3(i);return n[e]=t,t}return i}function Ls(e,n,r,i,s){if(0===r.size)return;const o=i.__type,l=i.__key,c=n.get(o);void 0===c&&t$1(33,o);const a=c.klass;let u=e.get(a);void 0===u&&(u=new Map,e.set(a,u));const f=u.get(l),d="destroyed"===f&&"created"===s;(void 0===f||d)&&u.set(l,d?"updated":s);}function zs(t,e,n){const r=t.getParent();let i=n,s=t;return null!==r&&(e&&0===n?(i=s.getIndexWithinParent(),s=r):e||n!==s.getChildrenSize()||(i=s.getIndexWithinParent()+1,s=r)),s.getChildAtIndex(e?i-1:i)}function Ks(t,e){const n=t.offset;if("element"===t.type){return zs(t.getNode(),e,n)}{const r=t.getNode();if(e&&0===n||!e&&n===r.getTextContentSize()){const t=e?r.getPreviousSibling():r.getNextSibling();return null===t?zs(r.getParentOrThrow(),e,r.getIndexWithinParent()+(e?0:1)):t}}return null}function Bs(t){const e=Gs(t).event,n=e&&e.inputType;return "insertFromPaste"===n||"insertFromPasteAsQuotation"===n}function Rs(t,e,n){return function(t,e,n){const r=Ss(t);for(let i=4;i>=0;i--)for(let s=0;s<r.length;s++){const o=r[s],l=o._commands.get(e);if(void 0!==l){const e=l[i];if(void 0!==e){const r=Array.from(e),i=r.length;let s=false;if(ci(o,(()=>{for(let e=0;e<i;e++)if(r[e](n,t))return void(s=true)})),s)return s}}}return  false}(t,e,n)}function Ws(t){return !yi(t)&&!t.isLastChild()&&!t.isInline()}function Js(e,n){const r=e._keyToDOMMap.get(n);return void 0===r&&t$1(75,n),r}function Us(t){const e=t.assignedSlot||t.parentElement;return ho(e)?e.host:e}function $s(t){return ts(t)?t:uo(t)?t.ownerDocument:null}function Vs(t){Vr();qr()._updateTags.add(t);}function Ys(t){Vr();qr()._deferred.push(t);}function Hs(t,e){let n=t.getParent();for(;null!==n;){if(n.is(e))return  true;n=n.getParent();}return  false}function qs(t){const e=$s(t);return e?e.defaultView:null}function Gs(e){const n=e._window;return null===n&&t$1(78),n}function Qs(t){let e=t.getParentOrThrow();for(;null!==e;){if(Zs(e))return e;e=e.getParentOrThrow();}return e}function Zs(t){return yi(t)||di(t)&&t.isShadowRoot()}function eo(e){const n=qr(),r=e.constructor.getType(),i=n._nodes.get(r);void 0===i&&t$1(200,e.constructor.name,r);const{replace:s,replaceWithKlass:o}=i;if(null!==s){const n=s(e),i=n.constructor;return null!==o?n instanceof o||t$1(201,o.name,o.getType(),i.name,i.getType(),e.constructor.name,r):n instanceof e.constructor&&i!==e.constructor||t$1(202,i.name,i.getType(),e.constructor.name,r),n.__key===e.__key&&t$1(203,e.constructor.name,r,i.name,i.getType()),n}return e}function no(e,n){!yi(e.getParent())||di(n)||_i(n)||t$1(99);}function ro(e){const n=as(e);return null===n&&t$1(63,e),n}function io(t){return (_i(t)||di(t)&&!t.canBeEmpty())&&!t.isInline()}function so(t,e,n){n.style.removeProperty("caret-color"),e._blockCursorElement=null;const r=t.parentElement;null!==r&&r.removeChild(t);}function oo(t){return e$1?(t||window).getSelection():null}function lo(t){const e=qs(t);return e?e.getSelection():null}function ao(t){return uo(t)&&"A"===t.tagName}function uo(t){return fo(t)&&t.nodeType===h$6}function fo(t){return "object"==typeof t&&null!==t&&"nodeType"in t&&"number"==typeof t.nodeType}function ho(t){return fo(t)&&t.nodeType===p$3}function go(t){const e=new RegExp(/^(a|abbr|acronym|b|cite|code|del|em|i|ins|kbd|label|mark|output|q|ruby|s|samp|span|strong|sub|sup|time|u|tt|var|#text)$/,"i");return null!==t.nodeName.match(e)}function _o(t){const e=new RegExp(/^(address|article|aside|blockquote|canvas|dd|div|dl|dt|fieldset|figcaption|figure|footer|form|h1|h2|h3|h4|h5|h6|header|hr|li|main|nav|noscript|ol|p|pre|section|table|td|tfoot|ul|video)$/,"i");return null!==t.nodeName.match(e)}function po(t){if(_i(t)&&!t.isInline())return  true;if(!di(t)||Zs(t))return  false;const e=t.getFirstChild(),n=null===e||Fn(e)||Qn(e)||e.isInline();return !t.isInline()&&false!==t.canBeEmpty()&&n}function yo(t,e){let n=t;for(;null!==n&&null!==n.getParent()&&!e(n);)n=n.getParentOrThrow();return e(n)?n:null}function mo(){return qr()}const xo=new WeakMap,Co=new Map;function So(e){if(!e._readOnly&&e.isEmpty())return Co;e._readOnly||t$1(192);let n=xo.get(e);return n||(n=function(t){const e=new Map;for(const[n,r]of t._nodeMap){const t=r.__type;let i=e.get(t);i||(i=new Map,e.set(t,i)),i.set(n,r);}return e}(e),xo.set(e,n)),n}function vo(t){const e=t.constructor.clone(t);return e.afterCloneFrom(t),e}function ko(t,e){const n=parseInt(t.style.paddingInlineStart,10)||0,r=Math.round(n/40);e.setIndent(r);}function bo(t){return  true===t.__lexicalUnmanaged}const No={next:"previous",previous:"next"};class wo{constructor(t){this.origin=t;}[Symbol.iterator](){return tl({hasNext:Io,initial:this.getAdjacentCaret(),map:t=>t,step:t=>t.getAdjacentCaret()})}getAdjacentCaret(){return Wo(this.getNodeAtCaret(),this.direction)}getSiblingCaret(){return Wo(this.origin,this.direction)}remove(){const t=this.getNodeAtCaret();return t&&t.remove(),this}replaceOrInsert(t,e){const n=this.getNodeAtCaret();return t.is(this.origin)||t.is(n)||(null===n?this.insert(t):n.replace(t,e)),this}splice(e,n,r="next"){const i=r===this.direction?n:Array.from(n).reverse();let s=this;const o=this.getParentAtCaret(),l=new Map;for(let t=s.getAdjacentCaret();null!==t&&l.size<e;t=t.getAdjacentCaret()){const e=t.origin.getWritable();l.set(e.getKey(),e);}for(const e of i){if(l.size>0){const n=s.getNodeAtCaret();if(n)if(l.delete(n.getKey()),l.delete(e.getKey()),n.is(e)||s.origin.is(e));else {const t=e.getParent();t&&t.is(o)&&e.remove(),n.replace(e);}else null===n&&t$1(263,Array.from(l).join(" "));}else s.insert(e);s=Wo(e,this.direction);}for(const t of l.values())t.remove();return this}}class Eo extends wo{type="child";getLatest(){const t=this.origin.getLatest();return t===this.origin?this:jo(t,this.direction)}getParentCaret(t="root"){return Wo(Oo(this.getParentAtCaret(),t),this.direction)}getFlipped(){const t=Ao(this.direction);return Wo(this.getNodeAtCaret(),t)||jo(this.origin,t)}getParentAtCaret(){return this.origin}getChildCaret(){return this}isSameNodeCaret(t){return t instanceof Eo&&this.direction===t.direction&&this.origin.is(t.origin)}isSamePointCaret(t){return this.isSameNodeCaret(t)}}const Mo={root:yi,shadowRoot:Zs};function Ao(t){return No[t]}function Oo(t,e="root"){return Mo[e](t)?null:t}class Do extends wo{type="sibling";getLatest(){const t=this.origin.getLatest();return t===this.origin?this:Wo(t,this.direction)}getSiblingCaret(){return this}getParentAtCaret(){return this.origin.getParent()}getChildCaret(){return di(this.origin)?jo(this.origin,this.direction):null}getParentCaret(t="root"){return Wo(Oo(this.getParentAtCaret(),t),this.direction)}getFlipped(){const t=Ao(this.direction);return Wo(this.getNodeAtCaret(),t)||jo(this.origin.getParentOrThrow(),t)}isSamePointCaret(t){return t instanceof Do&&this.direction===t.direction&&this.origin.is(t.origin)}isSameNodeCaret(t){return (t instanceof Do||t instanceof Po)&&this.direction===t.direction&&this.origin.is(t.origin)}}class Po extends wo{type="text";constructor(t,e){super(t),this.offset=e;}getLatest(){const t=this.origin.getLatest();return t===this.origin?this:Jo(t,this.direction,this.offset)}getParentAtCaret(){return this.origin.getParent()}getChildCaret(){return null}getParentCaret(t="root"){return Wo(Oo(this.getParentAtCaret(),t),this.direction)}getFlipped(){return Jo(this.origin,Ao(this.direction),this.offset)}isSamePointCaret(t){return t instanceof Po&&this.direction===t.direction&&this.origin.is(t.origin)&&this.offset===t.offset}isSameNodeCaret(t){return (t instanceof Do||t instanceof Po)&&this.direction===t.direction&&this.origin.is(t.origin)}getSiblingCaret(){return Wo(this.origin,this.direction)}}function Fo(t){return t instanceof Po}function Io(t){return t instanceof Do}function zo(t){return t instanceof Eo}const Ko={next:class extends Po{direction="next";getNodeAtCaret(){return this.origin.getNextSibling()}insert(t){return this.origin.insertAfter(t),this}},previous:class extends Po{direction="previous";getNodeAtCaret(){return this.origin.getPreviousSibling()}insert(t){return this.origin.insertBefore(t),this}}},Bo={next:class extends Do{direction="next";getNodeAtCaret(){return this.origin.getNextSibling()}insert(t){return this.origin.insertAfter(t),this}},previous:class extends Do{direction="previous";getNodeAtCaret(){return this.origin.getPreviousSibling()}insert(t){return this.origin.insertBefore(t),this}}},Ro={next:class extends Eo{direction="next";getNodeAtCaret(){return this.origin.getFirstChild()}insert(t){return this.origin.splice(0,0,[t]),this}},previous:class extends Eo{direction="previous";getNodeAtCaret(){return this.origin.getLastChild()}insert(t){return this.origin.splice(this.origin.getChildrenSize(),0,[t]),this}}};function Wo(t,e){return t?new Bo[e](t):null}function Jo(t,e,n){return t?new Ko[e](t,Uo(t,n)):null}function Uo(t,e){const n=t.getTextContentSize();let r="next"===e?n:"previous"===e?0:e;return (r<0||r>n)&&(!function(t,...e){const n=new URL("https://lexical.dev/docs/error"),r=new URLSearchParams;r.append("code",t);for(const t of e)r.append("v",t);n.search=r.toString(),console.warn(`Minified Lexical warning #${t}; visit ${n.toString()} for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`);}(284,String(e),String(n),t.getKey()),r=r<0?0:n),r}function $o(t,e){return new qo(t,e)}function jo(t,e){return di(t)?new Ro[e](t):null}function Vo(t){return t&&t.getChildCaret()||t}function Yo(t){return t&&Vo(t.getAdjacentCaret())}class Ho{type="node-caret-range";constructor(t,e,n){this.anchor=t,this.focus=e,this.direction=n;}getLatest(){const t=this.anchor.getLatest(),e=this.focus.getLatest();return t===this.anchor&&e===this.focus?this:new Ho(t,e,this.direction)}isCollapsed(){return this.anchor.isSamePointCaret(this.focus)}getTextSlices(){const t=t=>{const e=this[t].getLatest();return Fo(e)?function(t,e){const{direction:n,origin:r}=t,i=Uo(r,"focus"===e?Ao(n):n);return $o(t,i-t.offset)}(e,t):null},e=t("anchor"),n=t("focus");if(e&&n){const{caret:t}=e,{caret:r}=n;if(t.isSameNodeCaret(r))return [$o(t,r.offset-t.offset),null]}return [e,n]}iterNodeCarets(t="root"){const e=Fo(this.anchor)?this.anchor.getSiblingCaret():this.anchor.getLatest(),n=this.focus.getLatest(),r=Fo(n),i=e=>e.isSameNodeCaret(n)?null:Yo(e)||e.getParentCaret(t);return tl({hasNext:t=>null!==t&&!(r&&n.isSameNodeCaret(t)),initial:e.isSameNodeCaret(n)?null:i(e),map:t=>t,step:i})}[Symbol.iterator](){return this.iterNodeCarets("root")}}class qo{type="slice";constructor(t,e){this.caret=t,this.distance=e;}getSliceIndices(){const{distance:t,caret:{offset:e}}=this,n=e+t;return n<e?[n,e]:[e,n]}getTextContent(){const[t,e]=this.getSliceIndices();return this.caret.origin.getTextContent().slice(t,e)}getTextContentSize(){return Math.abs(this.distance)}removeTextSlice(){const{caret:{origin:t,direction:e}}=this,[n,r]=this.getSliceIndices(),i=t.getTextContent();return Jo(t.setTextContent(i.slice(0,n)+i.slice(r)),e,n)}}function Xo(t){return Zo(t,Wo(_s(),t.direction))}function Qo(t){return Zo(t,t)}function Zo(e,n){return e.direction!==n.direction&&t$1(265),new Ho(e,n,e.direction)}function tl(t){const{initial:e,hasNext:n,step:r,map:i}=t;let s=e;return {[Symbol.iterator](){return this},next(){if(!n(s))return {done:true,value:void 0};const t={done:false,value:i(s)};return s=r(s),t}}}function el(e,n){const r=sl(e.origin,n.origin);switch(null===r&&t$1(275,e.origin.getKey(),n.origin.getKey()),r.type){case "same":{const t="text"===e.type,r="text"===n.type;return t&&r?function(t,e){return Math.sign(t-e)}(e.offset,n.offset):e.type===n.type?0:t?-1:r?1:"child"===e.type?-1:1}case "ancestor":return "child"===e.type?-1:1;case "descendant":return "child"===n.type?1:-1;case "branch":return nl(r)}}function nl(t){const{a:e,b:n}=t,r=e.__key,i=n.__key;let s=e,o=n;for(;s&&o;s=s.getNextSibling(),o=o.getNextSibling()){if(s.__key===i)return  -1;if(o.__key===r)return 1}return null===s?1:-1}function rl(t,e){return e.is(t)}function il(t){return di(t)?[t.getLatest(),null]:[t.getParent(),t.getLatest()]}function sl(e,n){if(e.is(n))return {commonAncestor:e,type:"same"};const r=new Map;for(let[t,n]=il(e);t;n=t,t=t.getParent())r.set(t,n);for(let[i,s]=il(n);i;s=i,i=i.getParent()){const o=r.get(i);if(void 0!==o)return null===o?(rl(e,i)||t$1(276),{commonAncestor:i,type:"ancestor"}):null===s?(rl(n,i)||t$1(277),{commonAncestor:i,type:"descendant"}):((di(o)||rl(e,o))&&(di(s)||rl(n,s))&&i.is(o.getParent())&&i.is(s.getParent())||t$1(278),{a:o,b:s,commonAncestor:i,type:"branch"})}return null}function ol(e,n){const{type:r,key:i,offset:s}=e,o=ro(e.key);return "text"===r?(Qn(o)||t$1(266,o.getType(),i),Jo(o,n,s)):(di(o)||t$1(267,o.getType(),i),xl(o,e.offset,n))}function ll(e,n){const{origin:r,direction:i}=n,s="next"===i;Fo(n)?e.set(r.getKey(),n.offset,"text"):Io(n)?Qn(r)?e.set(r.getKey(),Uo(r,i),"text"):e.set(r.getParentOrThrow().getKey(),r.getIndexWithinParent()+(s?1:0),"element"):(zo(n)&&di(r)||t$1(268),e.set(r.getKey(),s?0:r.getChildrenSize(),"element"));}function cl(t){const e=Nr(),n=cr(e)?e:vr();return al(n,t),ys(n),n}function al(t,e){ll(t.anchor,e.anchor),ll(t.focus,e.focus);}function ul(t){const{anchor:e,focus:n}=t,r=ol(e,"next"),i=ol(n,"next"),s=el(r,i)<=0?"next":"previous";return Zo(yl(r,s),yl(i,s))}function fl(t){const{direction:e,origin:n}=t,r=Wo(n,Ao(e)).getNodeAtCaret();return r?Wo(r,e):jo(n.getParentOrThrow(),e)}function dl(t,e="root"){const n=[t];for(let r=zo(t)?t.getParentCaret(e):t.getSiblingCaret();null!==r;r=r.getParentCaret(e))n.push(fl(r));return n}function hl(t){return !!t&&t.origin.isAttached()}function gl(e,n="removeEmptySlices"){if(e.isCollapsed())return e;const r="root",i="next";let s=n;const o=ml(e,i),l=dl(o.anchor,r),c=dl(o.focus.getFlipped(),r),a=new Set,u=[];for(const t of o.iterNodeCarets(r))if(zo(t))a.add(t.origin.getKey());else if(Io(t)){const{origin:e}=t;di(e)&&!a.has(e.getKey())||u.push(e);}for(const t of u)t.remove();for(const t of o.getTextSlices()){if(!t)continue;const{origin:e}=t.caret,n=e.getTextContentSize(),r=fl(Wo(e,i)),o=e.getMode();if(Math.abs(t.distance)===n&&"removeEmptySlices"===s||"token"===o&&0!==t.distance)r.remove();else if(0!==t.distance){s="removeEmptySlices";let e=t.removeTextSlice();const n=t.caret.origin;if("segmented"===o){const t=e.origin,n=Xn(t.getTextContent()).setStyle(t.getStyle()).setFormat(t.getFormat());r.replaceOrInsert(n),e=Jo(n,i,e.offset);}n.is(l[0].origin)&&(l[0]=e),n.is(c[0].origin)&&(c[0]=e.getFlipped());}}let f,d;for(const t of l)if(hl(t)){f=_l(t);break}for(const t of c)if(hl(t)){d=_l(t);break}const h=function(t,e,n){if(!t||!e)return null;const r=t.getParentAtCaret(),i=e.getParentAtCaret();if(!r||!i)return null;const s=r.getParents().reverse();s.push(r);const o=i.getParents().reverse();o.push(i);const l=Math.min(s.length,o.length);let c;for(c=0;c<l&&s[c]===o[c];c++);const a=(t,e)=>{let n;for(let r=c;r<t.length;r++){const i=t[r];if(Zs(i))return;!n&&e(i)&&(n=i);}return n},u=a(s,po),f=u&&a(o,(t=>n.has(t.getKey())&&po(t)));return u&&f?[u,f]:null}(f,d,a);if(h){const[t,e]=h;jo(t,"previous").splice(0,e.getChildren()),e.remove();}const g=[f,d,...l,...c].find(hl);if(g){return Qo(yl(_l(g),e.direction))}t$1(269,JSON.stringify(l.map((t=>t.origin.__key))));}function _l(t){const e=function(t){let e=t;for(;zo(e);){const t=Yo(e);if(!zo(t))break;e=t;}return e}(t.getLatest()),{direction:n}=e;if(Qn(e.origin))return Fo(e)?e:Jo(e.origin,n,n);const r=e.getAdjacentCaret();return Io(r)&&Qn(r.origin)?Jo(r.origin,n,Ao(n)):e}function pl(t){return Fo(t)&&t.offset!==Uo(t.origin,t.direction)}function yl(t,e){return t.direction===e?t:t.getFlipped()}function ml(t,e){return t.direction===e?t:Zo(yl(t.focus,e),yl(t.anchor,e))}function xl(t,e,n){let r=jo(t,"next");for(let t=0;t<e;t++){const t=r.getAdjacentCaret();if(null===t)break;r=t;}return yl(r,n)}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const C$1=new Map;function I$3(e){const t={};if(!e)return t;const n=e.split(";");for(const e of n)if(""!==e){const[n,o]=e.split(/:([^]+)/);n&&o&&(t[n.trim()]=o.trim());}return t}function B$4(e){let t=C$1.get(e);return void 0===t&&(t=I$3(e),C$1.set(e,t)),t}function b$1(e,n){const o=e.getStartEndPoints();if(n.isSelected(e)&&!n.isSegmented()&&!n.isToken()&&null!==o){const[r,l]=o,s=e.isBackward(),i=r.getNode(),c=l.getNode(),f=n.is(i),u=n.is(c);if(f||u){const[o,r]=dr(e),l=i.is(c),f=n.is(s?c:i),u=n.is(s?i:c);let g,a=0;if(l)a=o>r?r:o,g=o>r?o:r;else if(f){a=s?r:o,g=void 0;}else if(u){a=0,g=s?o:r;}return n.__text=n.__text.slice(a,g),n}}return n}function z$4(e){const t=e.getStyle(),n=I$3(t);C$1.set(t,n);}function D$4(e,t){const n=e.getFormatType(),o=e.getIndent();n!==t.getFormatType()&&t.setFormat(n),o!==t.getIndent()&&t.setIndent(o);}function _$2(e,t,o=D$4){if(null===e)return;const r=e.getStartEndPoints(),l=new Map;let s=null;if(r){const[e,t]=r;s=vr(),s.anchor.set(e.key,e.offset,e.type),s.focus.set(t.key,t.offset,t.type);const o=Z$3(e.getNode(),po),i=Z$3(t.getNode(),po);di(o)&&l.set(o.getKey(),o),di(i)&&l.set(i.getKey(),i);}for(const t of e.getNodes())di(t)&&po(t)&&l.set(t.getKey(),t);for(const[e,n]of l){const r=t();o(n,r),n.replace(r,true),s&&(e===s.anchor.key&&s.anchor.set(r.getKey(),s.anchor.offset,s.anchor.type),e===s.focus.key&&s.focus.set(r.getKey(),s.focus.offset,s.focus.type));}s&&e.is(Nr())&&ys(s);}function W$2(e){const t=e.anchor.getNode(),n=yi(t)?t:t.getParentOrThrow(),r=mo().getElementByKey(n.getKey());if(null===r)return  false;const l=r.ownerDocument.defaultView;if(null===l)return  false;return "vertical-rl"===l.getComputedStyle(r).writingMode}function X$3(e,t){const o=W$2(e)?!t:t,r=ol(e.focus,o?"previous":"next");if(pl(r))return  false;for(const e of Xo(r)){if(zo(e))return !e.origin.isInline();if(!di(e.origin)){if(_i(e.origin))return  true;break}}return  false}function q$1(e,t,n,o){e.modify(t?"extend":"move",n,o);}function G$1(e){const t=e.anchor.getNode();return "rtl"===(yi(t)?t:t.getParentOrThrow()).getDirection()}function J$4(e,t,n){const o=G$1(e);let r;r=W$2(e)||o?!n:n,q$1(e,t,r,"character");}function Z$3(e,t){let n=e;for(;null!==n&&null!==n.getParent()&&!t(n);)n=n.getParentOrThrow();return t(n)?n:null}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

function P$3(t,...e){const n=new URL("https://lexical.dev/docs/error"),o=new URLSearchParams;o.append("code",t);for(const t of e)o.append("v",t);throw n.search=o.toString(),Error(`Minified Lexical error #${t}; visit ${n.toString()} for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`)}const M$5="undefined"!=typeof window&&void 0!==window.document&&void 0!==window.document.createElement,R$3=M$5&&"documentMode"in document?document.documentMode:null,B$3=M$5&&/^(?!.*Seamonkey)(?=.*Firefox).*/i.test(navigator.userAgent);!(!M$5||!("InputEvent"in window)||R$3)&&"getTargetRanges"in new window.InputEvent("input");function I$2(...t){const e=[];for(const n of t)if(n&&"string"==typeof n)for(const[t]of n.matchAll(/\S+/g))e.push(t);return e}function j$2(...t){return ()=>{for(let e=t.length-1;e>=0;e--)t[e]();t.length=0;}}const J$3=M$5,et$3=B$3;function rt$2(t,...e){const n=I$2(...e);n.length>0&&t.classList.add(...n);}function it$2(t,...e){const n=I$2(...e);n.length>0&&t.classList.remove(...n);}function ct$2(t){return t?t.getAdjacentCaret():null}function vt$3(t,e){let n=t;for(;null!=n;){if(n instanceof e)return n;n=n.getParent();}return null}function yt$3(t){const e=wt$2(t,(t=>di(t)&&!t.isInline()));return di(e)||P$3(4,t.__key),e}const wt$2=(t,e)=>{let n=t;for(;n!==_s()&&null!=n;){if(e(n))return n;n=n.getParent();}return null};function Lt$1(t,e){return null!==t&&Object.getPrototypeOf(t).constructor.name===e.name}let Pt$2=!(et$3||!J$3)&&void 0;function Mt$2(t){let e=1;if(function(){if(void 0===Pt$2){const t=document.createElement("div");t.style.cssText="position: absolute; opacity: 0; width: 100px; left: -1000px;",document.body.appendChild(t);const e=t.getBoundingClientRect();t.style.setProperty("zoom","2"),Pt$2=t.getBoundingClientRect().width===e.width,document.body.removeChild(t);}return Pt$2}())for(;t;)e*=Number(window.getComputedStyle(t).getPropertyValue("zoom")),t=t.parentElement;return e}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

function h$5(e,n){const t=n.body?n.body.childNodes:[];let o=[];const l=[];for(let n=0;n<t.length;n++){const r=t[n];if(!x$5.has(r.nodeName)){const n=y$3(r,e,l,false);null!==n&&(o=o.concat(n));}}return function(e){for(const n of e)n.getNextSibling()instanceof Ai&&n.insertAfter(Pn());for(const n of e){const e=n.getChildren();for(const t of e)n.insertBefore(t);n.remove();}}(l),o}function m$4(e,n){if("undefined"==typeof document||"undefined"==typeof window&&void 0===global.window)throw new Error("To use $generateHtmlFromNodes in headless mode please initialize a headless browser implementation such as JSDom before calling this function.");const t=document.createElement("div"),l=_s().getChildren();for(let o=0;o<l.length;o++){g$4(e,l[o],t,n);}return t.innerHTML}function g$4(t,o,c,u=null){let f=null===u||o.isSelected(u);const a=di(o)&&o.excludeFromCopy("html");let d=o;if(null!==u){let n=vo(o);n=Qn(n)&&null!==u?b$1(u,n):n,d=n;}const p=di(d)?d.getChildren():[],h=t._nodes.get(d.getType());let m;m=h&&void 0!==h.exportDOM?h.exportDOM(t,d):d.exportDOM(t);const{element:x,after:y}=m;if(!x)return  false;const w=document.createDocumentFragment();for(let e=0;e<p.length;e++){const n=p[e],r=g$4(t,n,w,u);!f&&di(o)&&r&&o.extractWithChild(n,u,"html")&&(f=true);}if(f&&!a){if((uo(x)||ho(x))&&x.append(w),c.append(x),y){const e=y.call(d,x);e&&(ho(x)?x.replaceChildren(e):x.replaceWith(e));}}else c.append(w);return f}const x$5=new Set(["STYLE","SCRIPT"]);function y$3(e,n,o,r,i=new Map,s){let h=[];if(x$5.has(e.nodeName))return h;let m=null;const g=function(e,n){const{nodeName:t}=e,o=n._htmlConversions.get(t.toLowerCase());let l=null;if(void 0!==o)for(const n of o){const t=n(e);null!==t&&(null===l||(l.priority||0)<=(t.priority||0))&&(l=t);}return null!==l?l.conversion:null}(e,n),b=g?g(e):null;let C=null;if(null!==b){C=b.after;const n=b.node;if(m=Array.isArray(n)?n[n.length-1]:n,null!==m){for(const[,e]of i)if(m=e(m,s),!m)break;m&&h.push(...Array.isArray(n)?n:[m]);}null!=b.forChild&&i.set(e.nodeName,b.forChild);}const S=e.childNodes;let v=[];const N=(null==m||!Zs(m))&&(null!=m&&Cr(m)||r);for(let e=0;e<S.length;e++)v.push(...y$3(S[e],n,o,N,new Map(i),m));return null!=C&&(v=C(v)),_o(e)&&(v=w$2(e,v,N?()=>{const e=new Ai;return o.push(e),e}:Pi)),null==m?v.length>0?h=h.concat(v):_o(e)&&function(e){if(null==e.nextSibling||null==e.previousSibling)return  false;return go(e.nextSibling)&&go(e.previousSibling)}(e)&&(h=h.concat(Pn())):di(m)&&m.append(...v),h}function w$2(e,n,t){const o=e.style.textAlign,l=[];let r=[];for(let e=0;e<n.length;e++){const i=n[e];if(Cr(i))o&&!i.getFormat()&&i.setFormat(o),l.push(i);else if(r.push(i),e===n.length-1||e<n.length-1&&Cr(n[e+1])){const e=t();e.setFormat(o),e.append(...r),l.push(e),r=[];}}return l}

/*! @license DOMPurify 3.2.6 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.2.6/LICENSE */

const {
  entries,
  setPrototypeOf,
  isFrozen,
  getPrototypeOf,
  getOwnPropertyDescriptor
} = Object;
let {
  freeze,
  seal,
  create
} = Object; // eslint-disable-line import/no-mutable-exports
let {
  apply,
  construct
} = typeof Reflect !== 'undefined' && Reflect;
if (!freeze) {
  freeze = function freeze(x) {
    return x;
  };
}
if (!seal) {
  seal = function seal(x) {
    return x;
  };
}
if (!apply) {
  apply = function apply(fun, thisValue, args) {
    return fun.apply(thisValue, args);
  };
}
if (!construct) {
  construct = function construct(Func, args) {
    return new Func(...args);
  };
}
const arrayForEach = unapply(Array.prototype.forEach);
const arrayLastIndexOf = unapply(Array.prototype.lastIndexOf);
const arrayPop = unapply(Array.prototype.pop);
const arrayPush = unapply(Array.prototype.push);
const arraySplice = unapply(Array.prototype.splice);
const stringToLowerCase = unapply(String.prototype.toLowerCase);
const stringToString = unapply(String.prototype.toString);
const stringMatch = unapply(String.prototype.match);
const stringReplace = unapply(String.prototype.replace);
const stringIndexOf = unapply(String.prototype.indexOf);
const stringTrim = unapply(String.prototype.trim);
const objectHasOwnProperty = unapply(Object.prototype.hasOwnProperty);
const regExpTest = unapply(RegExp.prototype.test);
const typeErrorCreate = unconstruct(TypeError);
/**
 * Creates a new function that calls the given function with a specified thisArg and arguments.
 *
 * @param func - The function to be wrapped and called.
 * @returns A new function that calls the given function with a specified thisArg and arguments.
 */
function unapply(func) {
  return function (thisArg) {
    if (thisArg instanceof RegExp) {
      thisArg.lastIndex = 0;
    }
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    return apply(func, thisArg, args);
  };
}
/**
 * Creates a new function that constructs an instance of the given constructor function with the provided arguments.
 *
 * @param func - The constructor function to be wrapped and called.
 * @returns A new function that constructs an instance of the given constructor function with the provided arguments.
 */
function unconstruct(func) {
  return function () {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    return construct(func, args);
  };
}
/**
 * Add properties to a lookup table
 *
 * @param set - The set to which elements will be added.
 * @param array - The array containing elements to be added to the set.
 * @param transformCaseFunc - An optional function to transform the case of each element before adding to the set.
 * @returns The modified set with added elements.
 */
function addToSet(set, array) {
  let transformCaseFunc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : stringToLowerCase;
  if (setPrototypeOf) {
    // Make 'in' and truthy checks like Boolean(set.constructor)
    // independent of any properties defined on Object.prototype.
    // Prevent prototype setters from intercepting set as a this value.
    setPrototypeOf(set, null);
  }
  let l = array.length;
  while (l--) {
    let element = array[l];
    if (typeof element === 'string') {
      const lcElement = transformCaseFunc(element);
      if (lcElement !== element) {
        // Config presets (e.g. tags.js, attrs.js) are immutable.
        if (!isFrozen(array)) {
          array[l] = lcElement;
        }
        element = lcElement;
      }
    }
    set[element] = true;
  }
  return set;
}
/**
 * Clean up an array to harden against CSPP
 *
 * @param array - The array to be cleaned.
 * @returns The cleaned version of the array
 */
function cleanArray(array) {
  for (let index = 0; index < array.length; index++) {
    const isPropertyExist = objectHasOwnProperty(array, index);
    if (!isPropertyExist) {
      array[index] = null;
    }
  }
  return array;
}
/**
 * Shallow clone an object
 *
 * @param object - The object to be cloned.
 * @returns A new object that copies the original.
 */
function clone(object) {
  const newObject = create(null);
  for (const [property, value] of entries(object)) {
    const isPropertyExist = objectHasOwnProperty(object, property);
    if (isPropertyExist) {
      if (Array.isArray(value)) {
        newObject[property] = cleanArray(value);
      } else if (value && typeof value === 'object' && value.constructor === Object) {
        newObject[property] = clone(value);
      } else {
        newObject[property] = value;
      }
    }
  }
  return newObject;
}
/**
 * This method automatically checks if the prop is function or getter and behaves accordingly.
 *
 * @param object - The object to look up the getter function in its prototype chain.
 * @param prop - The property name for which to find the getter function.
 * @returns The getter function found in the prototype chain or a fallback function.
 */
function lookupGetter(object, prop) {
  while (object !== null) {
    const desc = getOwnPropertyDescriptor(object, prop);
    if (desc) {
      if (desc.get) {
        return unapply(desc.get);
      }
      if (typeof desc.value === 'function') {
        return unapply(desc.value);
      }
    }
    object = getPrototypeOf(object);
  }
  function fallbackValue() {
    return null;
  }
  return fallbackValue;
}

const html$1 = freeze(['a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'content', 'data', 'datalist', 'dd', 'decorator', 'del', 'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt', 'element', 'em', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meter', 'nav', 'nobr', 'ol', 'optgroup', 'option', 'output', 'p', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'section', 'select', 'shadow', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr']);
const svg$1 = freeze(['svg', 'a', 'altglyph', 'altglyphdef', 'altglyphitem', 'animatecolor', 'animatemotion', 'animatetransform', 'circle', 'clippath', 'defs', 'desc', 'ellipse', 'filter', 'font', 'g', 'glyph', 'glyphref', 'hkern', 'image', 'line', 'lineargradient', 'marker', 'mask', 'metadata', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialgradient', 'rect', 'stop', 'style', 'switch', 'symbol', 'text', 'textpath', 'title', 'tref', 'tspan', 'view', 'vkern']);
const svgFilters = freeze(['feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feDropShadow', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence']);
// List of SVG elements that are disallowed by default.
// We still need to know them so that we can do namespace
// checks properly in case one wants to add them to
// allow-list.
const svgDisallowed = freeze(['animate', 'color-profile', 'cursor', 'discard', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignobject', 'hatch', 'hatchpath', 'mesh', 'meshgradient', 'meshpatch', 'meshrow', 'missing-glyph', 'script', 'set', 'solidcolor', 'unknown', 'use']);
const mathMl$1 = freeze(['math', 'menclose', 'merror', 'mfenced', 'mfrac', 'mglyph', 'mi', 'mlabeledtr', 'mmultiscripts', 'mn', 'mo', 'mover', 'mpadded', 'mphantom', 'mroot', 'mrow', 'ms', 'mspace', 'msqrt', 'mstyle', 'msub', 'msup', 'msubsup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder', 'munderover', 'mprescripts']);
// Similarly to SVG, we want to know all MathML elements,
// even those that we disallow by default.
const mathMlDisallowed = freeze(['maction', 'maligngroup', 'malignmark', 'mlongdiv', 'mscarries', 'mscarry', 'msgroup', 'mstack', 'msline', 'msrow', 'semantics', 'annotation', 'annotation-xml', 'mprescripts', 'none']);
const text$1 = freeze(['#text']);

const html = freeze(['accept', 'action', 'align', 'alt', 'autocapitalize', 'autocomplete', 'autopictureinpicture', 'autoplay', 'background', 'bgcolor', 'border', 'capture', 'cellpadding', 'cellspacing', 'checked', 'cite', 'class', 'clear', 'color', 'cols', 'colspan', 'controls', 'controlslist', 'coords', 'crossorigin', 'datetime', 'decoding', 'default', 'dir', 'disabled', 'disablepictureinpicture', 'disableremoteplayback', 'download', 'draggable', 'enctype', 'enterkeyhint', 'face', 'for', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'id', 'inputmode', 'integrity', 'ismap', 'kind', 'label', 'lang', 'list', 'loading', 'loop', 'low', 'max', 'maxlength', 'media', 'method', 'min', 'minlength', 'multiple', 'muted', 'name', 'nonce', 'noshade', 'novalidate', 'nowrap', 'open', 'optimum', 'pattern', 'placeholder', 'playsinline', 'popover', 'popovertarget', 'popovertargetaction', 'poster', 'preload', 'pubdate', 'radiogroup', 'readonly', 'rel', 'required', 'rev', 'reversed', 'role', 'rows', 'rowspan', 'spellcheck', 'scope', 'selected', 'shape', 'size', 'sizes', 'span', 'srclang', 'start', 'src', 'srcset', 'step', 'style', 'summary', 'tabindex', 'title', 'translate', 'type', 'usemap', 'valign', 'value', 'width', 'wrap', 'xmlns', 'slot']);
const svg = freeze(['accent-height', 'accumulate', 'additive', 'alignment-baseline', 'amplitude', 'ascent', 'attributename', 'attributetype', 'azimuth', 'basefrequency', 'baseline-shift', 'begin', 'bias', 'by', 'class', 'clip', 'clippathunits', 'clip-path', 'clip-rule', 'color', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'cx', 'cy', 'd', 'dx', 'dy', 'diffuseconstant', 'direction', 'display', 'divisor', 'dur', 'edgemode', 'elevation', 'end', 'exponent', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'filterunits', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'fx', 'fy', 'g1', 'g2', 'glyph-name', 'glyphref', 'gradientunits', 'gradienttransform', 'height', 'href', 'id', 'image-rendering', 'in', 'in2', 'intercept', 'k', 'k1', 'k2', 'k3', 'k4', 'kerning', 'keypoints', 'keysplines', 'keytimes', 'lang', 'lengthadjust', 'letter-spacing', 'kernelmatrix', 'kernelunitlength', 'lighting-color', 'local', 'marker-end', 'marker-mid', 'marker-start', 'markerheight', 'markerunits', 'markerwidth', 'maskcontentunits', 'maskunits', 'max', 'mask', 'media', 'method', 'mode', 'min', 'name', 'numoctaves', 'offset', 'operator', 'opacity', 'order', 'orient', 'orientation', 'origin', 'overflow', 'paint-order', 'path', 'pathlength', 'patterncontentunits', 'patterntransform', 'patternunits', 'points', 'preservealpha', 'preserveaspectratio', 'primitiveunits', 'r', 'rx', 'ry', 'radius', 'refx', 'refy', 'repeatcount', 'repeatdur', 'restart', 'result', 'rotate', 'scale', 'seed', 'shape-rendering', 'slope', 'specularconstant', 'specularexponent', 'spreadmethod', 'startoffset', 'stddeviation', 'stitchtiles', 'stop-color', 'stop-opacity', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke', 'stroke-width', 'style', 'surfacescale', 'systemlanguage', 'tabindex', 'tablevalues', 'targetx', 'targety', 'transform', 'transform-origin', 'text-anchor', 'text-decoration', 'text-rendering', 'textlength', 'type', 'u1', 'u2', 'unicode', 'values', 'viewbox', 'visibility', 'version', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'width', 'word-spacing', 'wrap', 'writing-mode', 'xchannelselector', 'ychannelselector', 'x', 'x1', 'x2', 'xmlns', 'y', 'y1', 'y2', 'z', 'zoomandpan']);
const mathMl = freeze(['accent', 'accentunder', 'align', 'bevelled', 'close', 'columnsalign', 'columnlines', 'columnspan', 'denomalign', 'depth', 'dir', 'display', 'displaystyle', 'encoding', 'fence', 'frame', 'height', 'href', 'id', 'largeop', 'length', 'linethickness', 'lspace', 'lquote', 'mathbackground', 'mathcolor', 'mathsize', 'mathvariant', 'maxsize', 'minsize', 'movablelimits', 'notation', 'numalign', 'open', 'rowalign', 'rowlines', 'rowspacing', 'rowspan', 'rspace', 'rquote', 'scriptlevel', 'scriptminsize', 'scriptsizemultiplier', 'selection', 'separator', 'separators', 'stretchy', 'subscriptshift', 'supscriptshift', 'symmetric', 'voffset', 'width', 'xmlns']);
const xml = freeze(['xlink:href', 'xml:id', 'xlink:title', 'xml:space', 'xmlns:xlink']);

// eslint-disable-next-line unicorn/better-regex
const MUSTACHE_EXPR = seal(/\{\{[\w\W]*|[\w\W]*\}\}/gm); // Specify template detection regex for SAFE_FOR_TEMPLATES mode
const ERB_EXPR = seal(/<%[\w\W]*|[\w\W]*%>/gm);
const TMPLIT_EXPR = seal(/\$\{[\w\W]*/gm); // eslint-disable-line unicorn/better-regex
const DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]+$/); // eslint-disable-line no-useless-escape
const ARIA_ATTR = seal(/^aria-[\-\w]+$/); // eslint-disable-line no-useless-escape
const IS_ALLOWED_URI = seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i // eslint-disable-line no-useless-escape
);
const IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
const ATTR_WHITESPACE = seal(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g // eslint-disable-line no-control-regex
);
const DOCTYPE_NAME = seal(/^html$/i);
const CUSTOM_ELEMENT = seal(/^[a-z][.\w]*(-[.\w]+)+$/i);

var EXPRESSIONS = /*#__PURE__*/Object.freeze({
  __proto__: null,
  ARIA_ATTR: ARIA_ATTR,
  ATTR_WHITESPACE: ATTR_WHITESPACE,
  CUSTOM_ELEMENT: CUSTOM_ELEMENT,
  DATA_ATTR: DATA_ATTR,
  DOCTYPE_NAME: DOCTYPE_NAME,
  ERB_EXPR: ERB_EXPR,
  IS_ALLOWED_URI: IS_ALLOWED_URI,
  IS_SCRIPT_OR_DATA: IS_SCRIPT_OR_DATA,
  MUSTACHE_EXPR: MUSTACHE_EXPR,
  TMPLIT_EXPR: TMPLIT_EXPR
});

/* eslint-disable @typescript-eslint/indent */
// https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
const NODE_TYPE = {
  element: 1,
  text: 3,
  // Deprecated
  progressingInstruction: 7,
  comment: 8,
  document: 9};
const getGlobal = function getGlobal() {
  return typeof window === 'undefined' ? null : window;
};
/**
 * Creates a no-op policy for internal use only.
 * Don't export this function outside this module!
 * @param trustedTypes The policy factory.
 * @param purifyHostElement The Script element used to load DOMPurify (to determine policy name suffix).
 * @return The policy created (or null, if Trusted Types
 * are not supported or creating the policy failed).
 */
const _createTrustedTypesPolicy = function _createTrustedTypesPolicy(trustedTypes, purifyHostElement) {
  if (typeof trustedTypes !== 'object' || typeof trustedTypes.createPolicy !== 'function') {
    return null;
  }
  // Allow the callers to control the unique policy name
  // by adding a data-tt-policy-suffix to the script element with the DOMPurify.
  // Policy creation with duplicate names throws in Trusted Types.
  let suffix = null;
  const ATTR_NAME = 'data-tt-policy-suffix';
  if (purifyHostElement && purifyHostElement.hasAttribute(ATTR_NAME)) {
    suffix = purifyHostElement.getAttribute(ATTR_NAME);
  }
  const policyName = 'dompurify' + (suffix ? '#' + suffix : '');
  try {
    return trustedTypes.createPolicy(policyName, {
      createHTML(html) {
        return html;
      },
      createScriptURL(scriptUrl) {
        return scriptUrl;
      }
    });
  } catch (_) {
    // Policy creation failed (most likely another DOMPurify script has
    // already run). Skip creating the policy, as this will only cause errors
    // if TT are enforced.
    console.warn('TrustedTypes policy ' + policyName + ' could not be created.');
    return null;
  }
};
const _createHooksMap = function _createHooksMap() {
  return {
    afterSanitizeAttributes: [],
    afterSanitizeElements: [],
    afterSanitizeShadowDOM: [],
    beforeSanitizeAttributes: [],
    beforeSanitizeElements: [],
    beforeSanitizeShadowDOM: [],
    uponSanitizeAttribute: [],
    uponSanitizeElement: [],
    uponSanitizeShadowNode: []
  };
};
function createDOMPurify() {
  let window = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getGlobal();
  const DOMPurify = root => createDOMPurify(root);
  DOMPurify.version = '3.2.6';
  DOMPurify.removed = [];
  if (!window || !window.document || window.document.nodeType !== NODE_TYPE.document || !window.Element) {
    // Not running in a browser, provide a factory function
    // so that you can pass your own Window
    DOMPurify.isSupported = false;
    return DOMPurify;
  }
  let {
    document
  } = window;
  const originalDocument = document;
  const currentScript = originalDocument.currentScript;
  const {
    DocumentFragment,
    HTMLTemplateElement,
    Node,
    Element,
    NodeFilter,
    NamedNodeMap = window.NamedNodeMap || window.MozNamedAttrMap,
    HTMLFormElement,
    DOMParser,
    trustedTypes
  } = window;
  const ElementPrototype = Element.prototype;
  const cloneNode = lookupGetter(ElementPrototype, 'cloneNode');
  const remove = lookupGetter(ElementPrototype, 'remove');
  const getNextSibling = lookupGetter(ElementPrototype, 'nextSibling');
  const getChildNodes = lookupGetter(ElementPrototype, 'childNodes');
  const getParentNode = lookupGetter(ElementPrototype, 'parentNode');
  // As per issue #47, the web-components registry is inherited by a
  // new document created via createHTMLDocument. As per the spec
  // (http://w3c.github.io/webcomponents/spec/custom/#creating-and-passing-registries)
  // a new empty registry is used when creating a template contents owner
  // document, so we use that as our parent document to ensure nothing
  // is inherited.
  if (typeof HTMLTemplateElement === 'function') {
    const template = document.createElement('template');
    if (template.content && template.content.ownerDocument) {
      document = template.content.ownerDocument;
    }
  }
  let trustedTypesPolicy;
  let emptyHTML = '';
  const {
    implementation,
    createNodeIterator,
    createDocumentFragment,
    getElementsByTagName
  } = document;
  const {
    importNode
  } = originalDocument;
  let hooks = _createHooksMap();
  /**
   * Expose whether this browser supports running the full DOMPurify.
   */
  DOMPurify.isSupported = typeof entries === 'function' && typeof getParentNode === 'function' && implementation && implementation.createHTMLDocument !== undefined;
  const {
    MUSTACHE_EXPR,
    ERB_EXPR,
    TMPLIT_EXPR,
    DATA_ATTR,
    ARIA_ATTR,
    IS_SCRIPT_OR_DATA,
    ATTR_WHITESPACE,
    CUSTOM_ELEMENT
  } = EXPRESSIONS;
  let {
    IS_ALLOWED_URI: IS_ALLOWED_URI$1
  } = EXPRESSIONS;
  /**
   * We consider the elements and attributes below to be safe. Ideally
   * don't add any new ones but feel free to remove unwanted ones.
   */
  /* allowed element names */
  let ALLOWED_TAGS = null;
  const DEFAULT_ALLOWED_TAGS = addToSet({}, [...html$1, ...svg$1, ...svgFilters, ...mathMl$1, ...text$1]);
  /* Allowed attribute names */
  let ALLOWED_ATTR = null;
  const DEFAULT_ALLOWED_ATTR = addToSet({}, [...html, ...svg, ...mathMl, ...xml]);
  /*
   * Configure how DOMPurify should handle custom elements and their attributes as well as customized built-in elements.
   * @property {RegExp|Function|null} tagNameCheck one of [null, regexPattern, predicate]. Default: `null` (disallow any custom elements)
   * @property {RegExp|Function|null} attributeNameCheck one of [null, regexPattern, predicate]. Default: `null` (disallow any attributes not on the allow list)
   * @property {boolean} allowCustomizedBuiltInElements allow custom elements derived from built-ins if they pass CUSTOM_ELEMENT_HANDLING.tagNameCheck. Default: `false`.
   */
  let CUSTOM_ELEMENT_HANDLING = Object.seal(create(null, {
    tagNameCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    },
    attributeNameCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    },
    allowCustomizedBuiltInElements: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: false
    }
  }));
  /* Explicitly forbidden tags (overrides ALLOWED_TAGS/ADD_TAGS) */
  let FORBID_TAGS = null;
  /* Explicitly forbidden attributes (overrides ALLOWED_ATTR/ADD_ATTR) */
  let FORBID_ATTR = null;
  /* Decide if ARIA attributes are okay */
  let ALLOW_ARIA_ATTR = true;
  /* Decide if custom data attributes are okay */
  let ALLOW_DATA_ATTR = true;
  /* Decide if unknown protocols are okay */
  let ALLOW_UNKNOWN_PROTOCOLS = false;
  /* Decide if self-closing tags in attributes are allowed.
   * Usually removed due to a mXSS issue in jQuery 3.0 */
  let ALLOW_SELF_CLOSE_IN_ATTR = true;
  /* Output should be safe for common template engines.
   * This means, DOMPurify removes data attributes, mustaches and ERB
   */
  let SAFE_FOR_TEMPLATES = false;
  /* Output should be safe even for XML used within HTML and alike.
   * This means, DOMPurify removes comments when containing risky content.
   */
  let SAFE_FOR_XML = true;
  /* Decide if document with <html>... should be returned */
  let WHOLE_DOCUMENT = false;
  /* Track whether config is already set on this instance of DOMPurify. */
  let SET_CONFIG = false;
  /* Decide if all elements (e.g. style, script) must be children of
   * document.body. By default, browsers might move them to document.head */
  let FORCE_BODY = false;
  /* Decide if a DOM `HTMLBodyElement` should be returned, instead of a html
   * string (or a TrustedHTML object if Trusted Types are supported).
   * If `WHOLE_DOCUMENT` is enabled a `HTMLHtmlElement` will be returned instead
   */
  let RETURN_DOM = false;
  /* Decide if a DOM `DocumentFragment` should be returned, instead of a html
   * string  (or a TrustedHTML object if Trusted Types are supported) */
  let RETURN_DOM_FRAGMENT = false;
  /* Try to return a Trusted Type object instead of a string, return a string in
   * case Trusted Types are not supported  */
  let RETURN_TRUSTED_TYPE = false;
  /* Output should be free from DOM clobbering attacks?
   * This sanitizes markups named with colliding, clobberable built-in DOM APIs.
   */
  let SANITIZE_DOM = true;
  /* Achieve full DOM Clobbering protection by isolating the namespace of named
   * properties and JS variables, mitigating attacks that abuse the HTML/DOM spec rules.
   *
   * HTML/DOM spec rules that enable DOM Clobbering:
   *   - Named Access on Window (§7.3.3)
   *   - DOM Tree Accessors (§3.1.5)
   *   - Form Element Parent-Child Relations (§4.10.3)
   *   - Iframe srcdoc / Nested WindowProxies (§4.8.5)
   *   - HTMLCollection (§4.2.10.2)
   *
   * Namespace isolation is implemented by prefixing `id` and `name` attributes
   * with a constant string, i.e., `user-content-`
   */
  let SANITIZE_NAMED_PROPS = false;
  const SANITIZE_NAMED_PROPS_PREFIX = 'user-content-';
  /* Keep element content when removing element? */
  let KEEP_CONTENT = true;
  /* If a `Node` is passed to sanitize(), then performs sanitization in-place instead
   * of importing it into a new Document and returning a sanitized copy */
  let IN_PLACE = false;
  /* Allow usage of profiles like html, svg and mathMl */
  let USE_PROFILES = {};
  /* Tags to ignore content of when KEEP_CONTENT is true */
  let FORBID_CONTENTS = null;
  const DEFAULT_FORBID_CONTENTS = addToSet({}, ['annotation-xml', 'audio', 'colgroup', 'desc', 'foreignobject', 'head', 'iframe', 'math', 'mi', 'mn', 'mo', 'ms', 'mtext', 'noembed', 'noframes', 'noscript', 'plaintext', 'script', 'style', 'svg', 'template', 'thead', 'title', 'video', 'xmp']);
  /* Tags that are safe for data: URIs */
  let DATA_URI_TAGS = null;
  const DEFAULT_DATA_URI_TAGS = addToSet({}, ['audio', 'video', 'img', 'source', 'image', 'track']);
  /* Attributes safe for values like "javascript:" */
  let URI_SAFE_ATTRIBUTES = null;
  const DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, ['alt', 'class', 'for', 'id', 'label', 'name', 'pattern', 'placeholder', 'role', 'summary', 'title', 'value', 'style', 'xmlns']);
  const MATHML_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
  const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
  const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
  /* Document namespace */
  let NAMESPACE = HTML_NAMESPACE;
  let IS_EMPTY_INPUT = false;
  /* Allowed XHTML+XML namespaces */
  let ALLOWED_NAMESPACES = null;
  const DEFAULT_ALLOWED_NAMESPACES = addToSet({}, [MATHML_NAMESPACE, SVG_NAMESPACE, HTML_NAMESPACE], stringToString);
  let MATHML_TEXT_INTEGRATION_POINTS = addToSet({}, ['mi', 'mo', 'mn', 'ms', 'mtext']);
  let HTML_INTEGRATION_POINTS = addToSet({}, ['annotation-xml']);
  // Certain elements are allowed in both SVG and HTML
  // namespace. We need to specify them explicitly
  // so that they don't get erroneously deleted from
  // HTML namespace.
  const COMMON_SVG_AND_HTML_ELEMENTS = addToSet({}, ['title', 'style', 'font', 'a', 'script']);
  /* Parsing of strict XHTML documents */
  let PARSER_MEDIA_TYPE = null;
  const SUPPORTED_PARSER_MEDIA_TYPES = ['application/xhtml+xml', 'text/html'];
  const DEFAULT_PARSER_MEDIA_TYPE = 'text/html';
  let transformCaseFunc = null;
  /* Keep a reference to config to pass to hooks */
  let CONFIG = null;
  /* Ideally, do not touch anything below this line */
  /* ______________________________________________ */
  const formElement = document.createElement('form');
  const isRegexOrFunction = function isRegexOrFunction(testValue) {
    return testValue instanceof RegExp || testValue instanceof Function;
  };
  /**
   * _parseConfig
   *
   * @param cfg optional config literal
   */
  // eslint-disable-next-line complexity
  const _parseConfig = function _parseConfig() {
    let cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (CONFIG && CONFIG === cfg) {
      return;
    }
    /* Shield configuration object from tampering */
    if (!cfg || typeof cfg !== 'object') {
      cfg = {};
    }
    /* Shield configuration object from prototype pollution */
    cfg = clone(cfg);
    PARSER_MEDIA_TYPE =
    // eslint-disable-next-line unicorn/prefer-includes
    SUPPORTED_PARSER_MEDIA_TYPES.indexOf(cfg.PARSER_MEDIA_TYPE) === -1 ? DEFAULT_PARSER_MEDIA_TYPE : cfg.PARSER_MEDIA_TYPE;
    // HTML tags and attributes are not case-sensitive, converting to lowercase. Keeping XHTML as is.
    transformCaseFunc = PARSER_MEDIA_TYPE === 'application/xhtml+xml' ? stringToString : stringToLowerCase;
    /* Set configuration parameters */
    ALLOWED_TAGS = objectHasOwnProperty(cfg, 'ALLOWED_TAGS') ? addToSet({}, cfg.ALLOWED_TAGS, transformCaseFunc) : DEFAULT_ALLOWED_TAGS;
    ALLOWED_ATTR = objectHasOwnProperty(cfg, 'ALLOWED_ATTR') ? addToSet({}, cfg.ALLOWED_ATTR, transformCaseFunc) : DEFAULT_ALLOWED_ATTR;
    ALLOWED_NAMESPACES = objectHasOwnProperty(cfg, 'ALLOWED_NAMESPACES') ? addToSet({}, cfg.ALLOWED_NAMESPACES, stringToString) : DEFAULT_ALLOWED_NAMESPACES;
    URI_SAFE_ATTRIBUTES = objectHasOwnProperty(cfg, 'ADD_URI_SAFE_ATTR') ? addToSet(clone(DEFAULT_URI_SAFE_ATTRIBUTES), cfg.ADD_URI_SAFE_ATTR, transformCaseFunc) : DEFAULT_URI_SAFE_ATTRIBUTES;
    DATA_URI_TAGS = objectHasOwnProperty(cfg, 'ADD_DATA_URI_TAGS') ? addToSet(clone(DEFAULT_DATA_URI_TAGS), cfg.ADD_DATA_URI_TAGS, transformCaseFunc) : DEFAULT_DATA_URI_TAGS;
    FORBID_CONTENTS = objectHasOwnProperty(cfg, 'FORBID_CONTENTS') ? addToSet({}, cfg.FORBID_CONTENTS, transformCaseFunc) : DEFAULT_FORBID_CONTENTS;
    FORBID_TAGS = objectHasOwnProperty(cfg, 'FORBID_TAGS') ? addToSet({}, cfg.FORBID_TAGS, transformCaseFunc) : clone({});
    FORBID_ATTR = objectHasOwnProperty(cfg, 'FORBID_ATTR') ? addToSet({}, cfg.FORBID_ATTR, transformCaseFunc) : clone({});
    USE_PROFILES = objectHasOwnProperty(cfg, 'USE_PROFILES') ? cfg.USE_PROFILES : false;
    ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false; // Default true
    ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false; // Default true
    ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false; // Default false
    ALLOW_SELF_CLOSE_IN_ATTR = cfg.ALLOW_SELF_CLOSE_IN_ATTR !== false; // Default true
    SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false; // Default false
    SAFE_FOR_XML = cfg.SAFE_FOR_XML !== false; // Default true
    WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false; // Default false
    RETURN_DOM = cfg.RETURN_DOM || false; // Default false
    RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false; // Default false
    RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false; // Default false
    FORCE_BODY = cfg.FORCE_BODY || false; // Default false
    SANITIZE_DOM = cfg.SANITIZE_DOM !== false; // Default true
    SANITIZE_NAMED_PROPS = cfg.SANITIZE_NAMED_PROPS || false; // Default false
    KEEP_CONTENT = cfg.KEEP_CONTENT !== false; // Default true
    IN_PLACE = cfg.IN_PLACE || false; // Default false
    IS_ALLOWED_URI$1 = cfg.ALLOWED_URI_REGEXP || IS_ALLOWED_URI;
    NAMESPACE = cfg.NAMESPACE || HTML_NAMESPACE;
    MATHML_TEXT_INTEGRATION_POINTS = cfg.MATHML_TEXT_INTEGRATION_POINTS || MATHML_TEXT_INTEGRATION_POINTS;
    HTML_INTEGRATION_POINTS = cfg.HTML_INTEGRATION_POINTS || HTML_INTEGRATION_POINTS;
    CUSTOM_ELEMENT_HANDLING = cfg.CUSTOM_ELEMENT_HANDLING || {};
    if (cfg.CUSTOM_ELEMENT_HANDLING && isRegexOrFunction(cfg.CUSTOM_ELEMENT_HANDLING.tagNameCheck)) {
      CUSTOM_ELEMENT_HANDLING.tagNameCheck = cfg.CUSTOM_ELEMENT_HANDLING.tagNameCheck;
    }
    if (cfg.CUSTOM_ELEMENT_HANDLING && isRegexOrFunction(cfg.CUSTOM_ELEMENT_HANDLING.attributeNameCheck)) {
      CUSTOM_ELEMENT_HANDLING.attributeNameCheck = cfg.CUSTOM_ELEMENT_HANDLING.attributeNameCheck;
    }
    if (cfg.CUSTOM_ELEMENT_HANDLING && typeof cfg.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements === 'boolean') {
      CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements = cfg.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements;
    }
    if (SAFE_FOR_TEMPLATES) {
      ALLOW_DATA_ATTR = false;
    }
    if (RETURN_DOM_FRAGMENT) {
      RETURN_DOM = true;
    }
    /* Parse profile info */
    if (USE_PROFILES) {
      ALLOWED_TAGS = addToSet({}, text$1);
      ALLOWED_ATTR = [];
      if (USE_PROFILES.html === true) {
        addToSet(ALLOWED_TAGS, html$1);
        addToSet(ALLOWED_ATTR, html);
      }
      if (USE_PROFILES.svg === true) {
        addToSet(ALLOWED_TAGS, svg$1);
        addToSet(ALLOWED_ATTR, svg);
        addToSet(ALLOWED_ATTR, xml);
      }
      if (USE_PROFILES.svgFilters === true) {
        addToSet(ALLOWED_TAGS, svgFilters);
        addToSet(ALLOWED_ATTR, svg);
        addToSet(ALLOWED_ATTR, xml);
      }
      if (USE_PROFILES.mathMl === true) {
        addToSet(ALLOWED_TAGS, mathMl$1);
        addToSet(ALLOWED_ATTR, mathMl);
        addToSet(ALLOWED_ATTR, xml);
      }
    }
    /* Merge configuration parameters */
    if (cfg.ADD_TAGS) {
      if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
        ALLOWED_TAGS = clone(ALLOWED_TAGS);
      }
      addToSet(ALLOWED_TAGS, cfg.ADD_TAGS, transformCaseFunc);
    }
    if (cfg.ADD_ATTR) {
      if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
        ALLOWED_ATTR = clone(ALLOWED_ATTR);
      }
      addToSet(ALLOWED_ATTR, cfg.ADD_ATTR, transformCaseFunc);
    }
    if (cfg.ADD_URI_SAFE_ATTR) {
      addToSet(URI_SAFE_ATTRIBUTES, cfg.ADD_URI_SAFE_ATTR, transformCaseFunc);
    }
    if (cfg.FORBID_CONTENTS) {
      if (FORBID_CONTENTS === DEFAULT_FORBID_CONTENTS) {
        FORBID_CONTENTS = clone(FORBID_CONTENTS);
      }
      addToSet(FORBID_CONTENTS, cfg.FORBID_CONTENTS, transformCaseFunc);
    }
    /* Add #text in case KEEP_CONTENT is set to true */
    if (KEEP_CONTENT) {
      ALLOWED_TAGS['#text'] = true;
    }
    /* Add html, head and body to ALLOWED_TAGS in case WHOLE_DOCUMENT is true */
    if (WHOLE_DOCUMENT) {
      addToSet(ALLOWED_TAGS, ['html', 'head', 'body']);
    }
    /* Add tbody to ALLOWED_TAGS in case tables are permitted, see #286, #365 */
    if (ALLOWED_TAGS.table) {
      addToSet(ALLOWED_TAGS, ['tbody']);
      delete FORBID_TAGS.tbody;
    }
    if (cfg.TRUSTED_TYPES_POLICY) {
      if (typeof cfg.TRUSTED_TYPES_POLICY.createHTML !== 'function') {
        throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
      }
      if (typeof cfg.TRUSTED_TYPES_POLICY.createScriptURL !== 'function') {
        throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
      }
      // Overwrite existing TrustedTypes policy.
      trustedTypesPolicy = cfg.TRUSTED_TYPES_POLICY;
      // Sign local variables required by `sanitize`.
      emptyHTML = trustedTypesPolicy.createHTML('');
    } else {
      // Uninitialized policy, attempt to initialize the internal dompurify policy.
      if (trustedTypesPolicy === undefined) {
        trustedTypesPolicy = _createTrustedTypesPolicy(trustedTypes, currentScript);
      }
      // If creating the internal policy succeeded sign internal variables.
      if (trustedTypesPolicy !== null && typeof emptyHTML === 'string') {
        emptyHTML = trustedTypesPolicy.createHTML('');
      }
    }
    // Prevent further manipulation of configuration.
    // Not available in IE8, Safari 5, etc.
    if (freeze) {
      freeze(cfg);
    }
    CONFIG = cfg;
  };
  /* Keep track of all possible SVG and MathML tags
   * so that we can perform the namespace checks
   * correctly. */
  const ALL_SVG_TAGS = addToSet({}, [...svg$1, ...svgFilters, ...svgDisallowed]);
  const ALL_MATHML_TAGS = addToSet({}, [...mathMl$1, ...mathMlDisallowed]);
  /**
   * @param element a DOM element whose namespace is being checked
   * @returns Return false if the element has a
   *  namespace that a spec-compliant parser would never
   *  return. Return true otherwise.
   */
  const _checkValidNamespace = function _checkValidNamespace(element) {
    let parent = getParentNode(element);
    // In JSDOM, if we're inside shadow DOM, then parentNode
    // can be null. We just simulate parent in this case.
    if (!parent || !parent.tagName) {
      parent = {
        namespaceURI: NAMESPACE,
        tagName: 'template'
      };
    }
    const tagName = stringToLowerCase(element.tagName);
    const parentTagName = stringToLowerCase(parent.tagName);
    if (!ALLOWED_NAMESPACES[element.namespaceURI]) {
      return false;
    }
    if (element.namespaceURI === SVG_NAMESPACE) {
      // The only way to switch from HTML namespace to SVG
      // is via <svg>. If it happens via any other tag, then
      // it should be killed.
      if (parent.namespaceURI === HTML_NAMESPACE) {
        return tagName === 'svg';
      }
      // The only way to switch from MathML to SVG is via`
      // svg if parent is either <annotation-xml> or MathML
      // text integration points.
      if (parent.namespaceURI === MATHML_NAMESPACE) {
        return tagName === 'svg' && (parentTagName === 'annotation-xml' || MATHML_TEXT_INTEGRATION_POINTS[parentTagName]);
      }
      // We only allow elements that are defined in SVG
      // spec. All others are disallowed in SVG namespace.
      return Boolean(ALL_SVG_TAGS[tagName]);
    }
    if (element.namespaceURI === MATHML_NAMESPACE) {
      // The only way to switch from HTML namespace to MathML
      // is via <math>. If it happens via any other tag, then
      // it should be killed.
      if (parent.namespaceURI === HTML_NAMESPACE) {
        return tagName === 'math';
      }
      // The only way to switch from SVG to MathML is via
      // <math> and HTML integration points
      if (parent.namespaceURI === SVG_NAMESPACE) {
        return tagName === 'math' && HTML_INTEGRATION_POINTS[parentTagName];
      }
      // We only allow elements that are defined in MathML
      // spec. All others are disallowed in MathML namespace.
      return Boolean(ALL_MATHML_TAGS[tagName]);
    }
    if (element.namespaceURI === HTML_NAMESPACE) {
      // The only way to switch from SVG to HTML is via
      // HTML integration points, and from MathML to HTML
      // is via MathML text integration points
      if (parent.namespaceURI === SVG_NAMESPACE && !HTML_INTEGRATION_POINTS[parentTagName]) {
        return false;
      }
      if (parent.namespaceURI === MATHML_NAMESPACE && !MATHML_TEXT_INTEGRATION_POINTS[parentTagName]) {
        return false;
      }
      // We disallow tags that are specific for MathML
      // or SVG and should never appear in HTML namespace
      return !ALL_MATHML_TAGS[tagName] && (COMMON_SVG_AND_HTML_ELEMENTS[tagName] || !ALL_SVG_TAGS[tagName]);
    }
    // For XHTML and XML documents that support custom namespaces
    if (PARSER_MEDIA_TYPE === 'application/xhtml+xml' && ALLOWED_NAMESPACES[element.namespaceURI]) {
      return true;
    }
    // The code should never reach this place (this means
    // that the element somehow got namespace that is not
    // HTML, SVG, MathML or allowed via ALLOWED_NAMESPACES).
    // Return false just in case.
    return false;
  };
  /**
   * _forceRemove
   *
   * @param node a DOM node
   */
  const _forceRemove = function _forceRemove(node) {
    arrayPush(DOMPurify.removed, {
      element: node
    });
    try {
      // eslint-disable-next-line unicorn/prefer-dom-node-remove
      getParentNode(node).removeChild(node);
    } catch (_) {
      remove(node);
    }
  };
  /**
   * _removeAttribute
   *
   * @param name an Attribute name
   * @param element a DOM node
   */
  const _removeAttribute = function _removeAttribute(name, element) {
    try {
      arrayPush(DOMPurify.removed, {
        attribute: element.getAttributeNode(name),
        from: element
      });
    } catch (_) {
      arrayPush(DOMPurify.removed, {
        attribute: null,
        from: element
      });
    }
    element.removeAttribute(name);
    // We void attribute values for unremovable "is" attributes
    if (name === 'is') {
      if (RETURN_DOM || RETURN_DOM_FRAGMENT) {
        try {
          _forceRemove(element);
        } catch (_) {}
      } else {
        try {
          element.setAttribute(name, '');
        } catch (_) {}
      }
    }
  };
  /**
   * _initDocument
   *
   * @param dirty - a string of dirty markup
   * @return a DOM, filled with the dirty markup
   */
  const _initDocument = function _initDocument(dirty) {
    /* Create a HTML document */
    let doc = null;
    let leadingWhitespace = null;
    if (FORCE_BODY) {
      dirty = '<remove></remove>' + dirty;
    } else {
      /* If FORCE_BODY isn't used, leading whitespace needs to be preserved manually */
      const matches = stringMatch(dirty, /^[\r\n\t ]+/);
      leadingWhitespace = matches && matches[0];
    }
    if (PARSER_MEDIA_TYPE === 'application/xhtml+xml' && NAMESPACE === HTML_NAMESPACE) {
      // Root of XHTML doc must contain xmlns declaration (see https://www.w3.org/TR/xhtml1/normative.html#strict)
      dirty = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + dirty + '</body></html>';
    }
    const dirtyPayload = trustedTypesPolicy ? trustedTypesPolicy.createHTML(dirty) : dirty;
    /*
     * Use the DOMParser API by default, fallback later if needs be
     * DOMParser not work for svg when has multiple root element.
     */
    if (NAMESPACE === HTML_NAMESPACE) {
      try {
        doc = new DOMParser().parseFromString(dirtyPayload, PARSER_MEDIA_TYPE);
      } catch (_) {}
    }
    /* Use createHTMLDocument in case DOMParser is not available */
    if (!doc || !doc.documentElement) {
      doc = implementation.createDocument(NAMESPACE, 'template', null);
      try {
        doc.documentElement.innerHTML = IS_EMPTY_INPUT ? emptyHTML : dirtyPayload;
      } catch (_) {
        // Syntax error if dirtyPayload is invalid xml
      }
    }
    const body = doc.body || doc.documentElement;
    if (dirty && leadingWhitespace) {
      body.insertBefore(document.createTextNode(leadingWhitespace), body.childNodes[0] || null);
    }
    /* Work on whole document or just its body */
    if (NAMESPACE === HTML_NAMESPACE) {
      return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? 'html' : 'body')[0];
    }
    return WHOLE_DOCUMENT ? doc.documentElement : body;
  };
  /**
   * Creates a NodeIterator object that you can use to traverse filtered lists of nodes or elements in a document.
   *
   * @param root The root element or node to start traversing on.
   * @return The created NodeIterator
   */
  const _createNodeIterator = function _createNodeIterator(root) {
    return createNodeIterator.call(root.ownerDocument || root, root,
    // eslint-disable-next-line no-bitwise
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT | NodeFilter.SHOW_PROCESSING_INSTRUCTION | NodeFilter.SHOW_CDATA_SECTION, null);
  };
  /**
   * _isClobbered
   *
   * @param element element to check for clobbering attacks
   * @return true if clobbered, false if safe
   */
  const _isClobbered = function _isClobbered(element) {
    return element instanceof HTMLFormElement && (typeof element.nodeName !== 'string' || typeof element.textContent !== 'string' || typeof element.removeChild !== 'function' || !(element.attributes instanceof NamedNodeMap) || typeof element.removeAttribute !== 'function' || typeof element.setAttribute !== 'function' || typeof element.namespaceURI !== 'string' || typeof element.insertBefore !== 'function' || typeof element.hasChildNodes !== 'function');
  };
  /**
   * Checks whether the given object is a DOM node.
   *
   * @param value object to check whether it's a DOM node
   * @return true is object is a DOM node
   */
  const _isNode = function _isNode(value) {
    return typeof Node === 'function' && value instanceof Node;
  };
  function _executeHooks(hooks, currentNode, data) {
    arrayForEach(hooks, hook => {
      hook.call(DOMPurify, currentNode, data, CONFIG);
    });
  }
  /**
   * _sanitizeElements
   *
   * @protect nodeName
   * @protect textContent
   * @protect removeChild
   * @param currentNode to check for permission to exist
   * @return true if node was killed, false if left alive
   */
  const _sanitizeElements = function _sanitizeElements(currentNode) {
    let content = null;
    /* Execute a hook if present */
    _executeHooks(hooks.beforeSanitizeElements, currentNode, null);
    /* Check if element is clobbered or can clobber */
    if (_isClobbered(currentNode)) {
      _forceRemove(currentNode);
      return true;
    }
    /* Now let's check the element's type and name */
    const tagName = transformCaseFunc(currentNode.nodeName);
    /* Execute a hook if present */
    _executeHooks(hooks.uponSanitizeElement, currentNode, {
      tagName,
      allowedTags: ALLOWED_TAGS
    });
    /* Detect mXSS attempts abusing namespace confusion */
    if (SAFE_FOR_XML && currentNode.hasChildNodes() && !_isNode(currentNode.firstElementChild) && regExpTest(/<[/\w!]/g, currentNode.innerHTML) && regExpTest(/<[/\w!]/g, currentNode.textContent)) {
      _forceRemove(currentNode);
      return true;
    }
    /* Remove any occurrence of processing instructions */
    if (currentNode.nodeType === NODE_TYPE.progressingInstruction) {
      _forceRemove(currentNode);
      return true;
    }
    /* Remove any kind of possibly harmful comments */
    if (SAFE_FOR_XML && currentNode.nodeType === NODE_TYPE.comment && regExpTest(/<[/\w]/g, currentNode.data)) {
      _forceRemove(currentNode);
      return true;
    }
    /* Remove element if anything forbids its presence */
    if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
      /* Check if we have a custom element to handle */
      if (!FORBID_TAGS[tagName] && _isBasicCustomElement(tagName)) {
        if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, tagName)) {
          return false;
        }
        if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(tagName)) {
          return false;
        }
      }
      /* Keep content except for bad-listed elements */
      if (KEEP_CONTENT && !FORBID_CONTENTS[tagName]) {
        const parentNode = getParentNode(currentNode) || currentNode.parentNode;
        const childNodes = getChildNodes(currentNode) || currentNode.childNodes;
        if (childNodes && parentNode) {
          const childCount = childNodes.length;
          for (let i = childCount - 1; i >= 0; --i) {
            const childClone = cloneNode(childNodes[i], true);
            childClone.__removalCount = (currentNode.__removalCount || 0) + 1;
            parentNode.insertBefore(childClone, getNextSibling(currentNode));
          }
        }
      }
      _forceRemove(currentNode);
      return true;
    }
    /* Check whether element has a valid namespace */
    if (currentNode instanceof Element && !_checkValidNamespace(currentNode)) {
      _forceRemove(currentNode);
      return true;
    }
    /* Make sure that older browsers don't get fallback-tag mXSS */
    if ((tagName === 'noscript' || tagName === 'noembed' || tagName === 'noframes') && regExpTest(/<\/no(script|embed|frames)/i, currentNode.innerHTML)) {
      _forceRemove(currentNode);
      return true;
    }
    /* Sanitize element content to be template-safe */
    if (SAFE_FOR_TEMPLATES && currentNode.nodeType === NODE_TYPE.text) {
      /* Get the element's text content */
      content = currentNode.textContent;
      arrayForEach([MUSTACHE_EXPR, ERB_EXPR, TMPLIT_EXPR], expr => {
        content = stringReplace(content, expr, ' ');
      });
      if (currentNode.textContent !== content) {
        arrayPush(DOMPurify.removed, {
          element: currentNode.cloneNode()
        });
        currentNode.textContent = content;
      }
    }
    /* Execute a hook if present */
    _executeHooks(hooks.afterSanitizeElements, currentNode, null);
    return false;
  };
  /**
   * _isValidAttribute
   *
   * @param lcTag Lowercase tag name of containing element.
   * @param lcName Lowercase attribute name.
   * @param value Attribute value.
   * @return Returns true if `value` is valid, otherwise false.
   */
  // eslint-disable-next-line complexity
  const _isValidAttribute = function _isValidAttribute(lcTag, lcName, value) {
    /* Make sure attribute cannot clobber */
    if (SANITIZE_DOM && (lcName === 'id' || lcName === 'name') && (value in document || value in formElement)) {
      return false;
    }
    /* Allow valid data-* attributes: At least one character after "-"
        (https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes)
        XML-compatible (https://html.spec.whatwg.org/multipage/infrastructure.html#xml-compatible and http://www.w3.org/TR/xml/#d0e804)
        We don't need to check the value; it's always URI safe. */
    if (ALLOW_DATA_ATTR && !FORBID_ATTR[lcName] && regExpTest(DATA_ATTR, lcName)) ; else if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR, lcName)) ; else if (!ALLOWED_ATTR[lcName] || FORBID_ATTR[lcName]) {
      if (
      // First condition does a very basic check if a) it's basically a valid custom element tagname AND
      // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
      // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
      _isBasicCustomElement(lcTag) && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, lcTag) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(lcTag)) && (CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.attributeNameCheck, lcName) || CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.attributeNameCheck(lcName)) ||
      // Alternative, second condition checks if it's an `is`-attribute, AND
      // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
      lcName === 'is' && CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, value) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(value))) ; else {
        return false;
      }
      /* Check value is safe. First, is attr inert? If so, is safe */
    } else if (URI_SAFE_ATTRIBUTES[lcName]) ; else if (regExpTest(IS_ALLOWED_URI$1, stringReplace(value, ATTR_WHITESPACE, ''))) ; else if ((lcName === 'src' || lcName === 'xlink:href' || lcName === 'href') && lcTag !== 'script' && stringIndexOf(value, 'data:') === 0 && DATA_URI_TAGS[lcTag]) ; else if (ALLOW_UNKNOWN_PROTOCOLS && !regExpTest(IS_SCRIPT_OR_DATA, stringReplace(value, ATTR_WHITESPACE, ''))) ; else if (value) {
      return false;
    } else ;
    return true;
  };
  /**
   * _isBasicCustomElement
   * checks if at least one dash is included in tagName, and it's not the first char
   * for more sophisticated checking see https://github.com/sindresorhus/validate-element-name
   *
   * @param tagName name of the tag of the node to sanitize
   * @returns Returns true if the tag name meets the basic criteria for a custom element, otherwise false.
   */
  const _isBasicCustomElement = function _isBasicCustomElement(tagName) {
    return tagName !== 'annotation-xml' && stringMatch(tagName, CUSTOM_ELEMENT);
  };
  /**
   * _sanitizeAttributes
   *
   * @protect attributes
   * @protect nodeName
   * @protect removeAttribute
   * @protect setAttribute
   *
   * @param currentNode to sanitize
   */
  const _sanitizeAttributes = function _sanitizeAttributes(currentNode) {
    /* Execute a hook if present */
    _executeHooks(hooks.beforeSanitizeAttributes, currentNode, null);
    const {
      attributes
    } = currentNode;
    /* Check if we have attributes; if not we might have a text node */
    if (!attributes || _isClobbered(currentNode)) {
      return;
    }
    const hookEvent = {
      attrName: '',
      attrValue: '',
      keepAttr: true,
      allowedAttributes: ALLOWED_ATTR,
      forceKeepAttr: undefined
    };
    let l = attributes.length;
    /* Go backwards over all attributes; safely remove bad ones */
    while (l--) {
      const attr = attributes[l];
      const {
        name,
        namespaceURI,
        value: attrValue
      } = attr;
      const lcName = transformCaseFunc(name);
      const initValue = attrValue;
      let value = name === 'value' ? initValue : stringTrim(initValue);
      /* Execute a hook if present */
      hookEvent.attrName = lcName;
      hookEvent.attrValue = value;
      hookEvent.keepAttr = true;
      hookEvent.forceKeepAttr = undefined; // Allows developers to see this is a property they can set
      _executeHooks(hooks.uponSanitizeAttribute, currentNode, hookEvent);
      value = hookEvent.attrValue;
      /* Full DOM Clobbering protection via namespace isolation,
       * Prefix id and name attributes with `user-content-`
       */
      if (SANITIZE_NAMED_PROPS && (lcName === 'id' || lcName === 'name')) {
        // Remove the attribute with this value
        _removeAttribute(name, currentNode);
        // Prefix the value and later re-create the attribute with the sanitized value
        value = SANITIZE_NAMED_PROPS_PREFIX + value;
      }
      /* Work around a security issue with comments inside attributes */
      if (SAFE_FOR_XML && regExpTest(/((--!?|])>)|<\/(style|title)/i, value)) {
        _removeAttribute(name, currentNode);
        continue;
      }
      /* Did the hooks approve of the attribute? */
      if (hookEvent.forceKeepAttr) {
        continue;
      }
      /* Did the hooks approve of the attribute? */
      if (!hookEvent.keepAttr) {
        _removeAttribute(name, currentNode);
        continue;
      }
      /* Work around a security issue in jQuery 3.0 */
      if (!ALLOW_SELF_CLOSE_IN_ATTR && regExpTest(/\/>/i, value)) {
        _removeAttribute(name, currentNode);
        continue;
      }
      /* Sanitize attribute content to be template-safe */
      if (SAFE_FOR_TEMPLATES) {
        arrayForEach([MUSTACHE_EXPR, ERB_EXPR, TMPLIT_EXPR], expr => {
          value = stringReplace(value, expr, ' ');
        });
      }
      /* Is `value` valid for this attribute? */
      const lcTag = transformCaseFunc(currentNode.nodeName);
      if (!_isValidAttribute(lcTag, lcName, value)) {
        _removeAttribute(name, currentNode);
        continue;
      }
      /* Handle attributes that require Trusted Types */
      if (trustedTypesPolicy && typeof trustedTypes === 'object' && typeof trustedTypes.getAttributeType === 'function') {
        if (namespaceURI) ; else {
          switch (trustedTypes.getAttributeType(lcTag, lcName)) {
            case 'TrustedHTML':
              {
                value = trustedTypesPolicy.createHTML(value);
                break;
              }
            case 'TrustedScriptURL':
              {
                value = trustedTypesPolicy.createScriptURL(value);
                break;
              }
          }
        }
      }
      /* Handle invalid data-* attribute set by try-catching it */
      if (value !== initValue) {
        try {
          if (namespaceURI) {
            currentNode.setAttributeNS(namespaceURI, name, value);
          } else {
            /* Fallback to setAttribute() for browser-unrecognized namespaces e.g. "x-schema". */
            currentNode.setAttribute(name, value);
          }
          if (_isClobbered(currentNode)) {
            _forceRemove(currentNode);
          } else {
            arrayPop(DOMPurify.removed);
          }
        } catch (_) {
          _removeAttribute(name, currentNode);
        }
      }
    }
    /* Execute a hook if present */
    _executeHooks(hooks.afterSanitizeAttributes, currentNode, null);
  };
  /**
   * _sanitizeShadowDOM
   *
   * @param fragment to iterate over recursively
   */
  const _sanitizeShadowDOM = function _sanitizeShadowDOM(fragment) {
    let shadowNode = null;
    const shadowIterator = _createNodeIterator(fragment);
    /* Execute a hook if present */
    _executeHooks(hooks.beforeSanitizeShadowDOM, fragment, null);
    while (shadowNode = shadowIterator.nextNode()) {
      /* Execute a hook if present */
      _executeHooks(hooks.uponSanitizeShadowNode, shadowNode, null);
      /* Sanitize tags and elements */
      _sanitizeElements(shadowNode);
      /* Check attributes next */
      _sanitizeAttributes(shadowNode);
      /* Deep shadow DOM detected */
      if (shadowNode.content instanceof DocumentFragment) {
        _sanitizeShadowDOM(shadowNode.content);
      }
    }
    /* Execute a hook if present */
    _executeHooks(hooks.afterSanitizeShadowDOM, fragment, null);
  };
  // eslint-disable-next-line complexity
  DOMPurify.sanitize = function (dirty) {
    let cfg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let body = null;
    let importedNode = null;
    let currentNode = null;
    let returnNode = null;
    /* Make sure we have a string to sanitize.
      DO NOT return early, as this will return the wrong type if
      the user has requested a DOM object rather than a string */
    IS_EMPTY_INPUT = !dirty;
    if (IS_EMPTY_INPUT) {
      dirty = '<!-->';
    }
    /* Stringify, in case dirty is an object */
    if (typeof dirty !== 'string' && !_isNode(dirty)) {
      if (typeof dirty.toString === 'function') {
        dirty = dirty.toString();
        if (typeof dirty !== 'string') {
          throw typeErrorCreate('dirty is not a string, aborting');
        }
      } else {
        throw typeErrorCreate('toString is not a function');
      }
    }
    /* Return dirty HTML if DOMPurify cannot run */
    if (!DOMPurify.isSupported) {
      return dirty;
    }
    /* Assign config vars */
    if (!SET_CONFIG) {
      _parseConfig(cfg);
    }
    /* Clean up removed elements */
    DOMPurify.removed = [];
    /* Check if dirty is correctly typed for IN_PLACE */
    if (typeof dirty === 'string') {
      IN_PLACE = false;
    }
    if (IN_PLACE) {
      /* Do some early pre-sanitization to avoid unsafe root nodes */
      if (dirty.nodeName) {
        const tagName = transformCaseFunc(dirty.nodeName);
        if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
          throw typeErrorCreate('root node is forbidden and cannot be sanitized in-place');
        }
      }
    } else if (dirty instanceof Node) {
      /* If dirty is a DOM element, append to an empty document to avoid
         elements being stripped by the parser */
      body = _initDocument('<!---->');
      importedNode = body.ownerDocument.importNode(dirty, true);
      if (importedNode.nodeType === NODE_TYPE.element && importedNode.nodeName === 'BODY') {
        /* Node is already a body, use as is */
        body = importedNode;
      } else if (importedNode.nodeName === 'HTML') {
        body = importedNode;
      } else {
        // eslint-disable-next-line unicorn/prefer-dom-node-append
        body.appendChild(importedNode);
      }
    } else {
      /* Exit directly if we have nothing to do */
      if (!RETURN_DOM && !SAFE_FOR_TEMPLATES && !WHOLE_DOCUMENT &&
      // eslint-disable-next-line unicorn/prefer-includes
      dirty.indexOf('<') === -1) {
        return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(dirty) : dirty;
      }
      /* Initialize the document to work on */
      body = _initDocument(dirty);
      /* Check we have a DOM node from the data */
      if (!body) {
        return RETURN_DOM ? null : RETURN_TRUSTED_TYPE ? emptyHTML : '';
      }
    }
    /* Remove first element node (ours) if FORCE_BODY is set */
    if (body && FORCE_BODY) {
      _forceRemove(body.firstChild);
    }
    /* Get node iterator */
    const nodeIterator = _createNodeIterator(IN_PLACE ? dirty : body);
    /* Now start iterating over the created document */
    while (currentNode = nodeIterator.nextNode()) {
      /* Sanitize tags and elements */
      _sanitizeElements(currentNode);
      /* Check attributes next */
      _sanitizeAttributes(currentNode);
      /* Shadow DOM detected, sanitize it */
      if (currentNode.content instanceof DocumentFragment) {
        _sanitizeShadowDOM(currentNode.content);
      }
    }
    /* If we sanitized `dirty` in-place, return it. */
    if (IN_PLACE) {
      return dirty;
    }
    /* Return sanitized string or DOM */
    if (RETURN_DOM) {
      if (RETURN_DOM_FRAGMENT) {
        returnNode = createDocumentFragment.call(body.ownerDocument);
        while (body.firstChild) {
          // eslint-disable-next-line unicorn/prefer-dom-node-append
          returnNode.appendChild(body.firstChild);
        }
      } else {
        returnNode = body;
      }
      if (ALLOWED_ATTR.shadowroot || ALLOWED_ATTR.shadowrootmode) {
        /*
          AdoptNode() is not used because internal state is not reset
          (e.g. the past names map of a HTMLFormElement), this is safe
          in theory but we would rather not risk another attack vector.
          The state that is cloned by importNode() is explicitly defined
          by the specs.
        */
        returnNode = importNode.call(originalDocument, returnNode, true);
      }
      return returnNode;
    }
    let serializedHTML = WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;
    /* Serialize doctype if allowed */
    if (WHOLE_DOCUMENT && ALLOWED_TAGS['!doctype'] && body.ownerDocument && body.ownerDocument.doctype && body.ownerDocument.doctype.name && regExpTest(DOCTYPE_NAME, body.ownerDocument.doctype.name)) {
      serializedHTML = '<!DOCTYPE ' + body.ownerDocument.doctype.name + '>\n' + serializedHTML;
    }
    /* Sanitize final string template-safe */
    if (SAFE_FOR_TEMPLATES) {
      arrayForEach([MUSTACHE_EXPR, ERB_EXPR, TMPLIT_EXPR], expr => {
        serializedHTML = stringReplace(serializedHTML, expr, ' ');
      });
    }
    return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(serializedHTML) : serializedHTML;
  };
  DOMPurify.setConfig = function () {
    let cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _parseConfig(cfg);
    SET_CONFIG = true;
  };
  DOMPurify.clearConfig = function () {
    CONFIG = null;
    SET_CONFIG = false;
  };
  DOMPurify.isValidAttribute = function (tag, attr, value) {
    /* Initialize shared config vars if necessary. */
    if (!CONFIG) {
      _parseConfig({});
    }
    const lcTag = transformCaseFunc(tag);
    const lcName = transformCaseFunc(attr);
    return _isValidAttribute(lcTag, lcName, value);
  };
  DOMPurify.addHook = function (entryPoint, hookFunction) {
    if (typeof hookFunction !== 'function') {
      return;
    }
    arrayPush(hooks[entryPoint], hookFunction);
  };
  DOMPurify.removeHook = function (entryPoint, hookFunction) {
    if (hookFunction !== undefined) {
      const index = arrayLastIndexOf(hooks[entryPoint], hookFunction);
      return index === -1 ? undefined : arraySplice(hooks[entryPoint], index, 1)[0];
    }
    return arrayPop(hooks[entryPoint]);
  };
  DOMPurify.removeHooks = function (entryPoint) {
    hooks[entryPoint] = [];
  };
  DOMPurify.removeAllHooks = function () {
    hooks = _createHooksMap();
  };
  return DOMPurify;
}
var purify = createDOMPurify();

//#region src/components/editor/Preview.tsx
const Preview = function() {
	const [editor] = o$3();
	return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
		className: "p-4 min-h-[150px] whitespace-pre-wrap text-foreground",
		dangerouslySetInnerHTML: { __html: editor.read(() => purify.sanitize(m$4(editor))) }
	});
};

// dev uses dynamic import to separate chunks
    
    const {loadShare} = index_cjs;
    const {initPromise} = dashboard__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(_ => loadShare("@lumeweb/portal-framework-core", {
    customShareInfo: {shareConfig:{
      singleton: true,
      strictVersion: false,
      requiredVersion: "^0.0.0"
    }}}));
    const exportModule = await res.then(factory => factory());
    var dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__ = exportModule;

//#region src/components/editor/ToolbarContext.tsx
const blockTypeToBlockName = {
	bullet: "Bulleted List",
	check: "Check List",
	code: "Code Block",
	h1: "Heading 1",
	h2: "Heading 2",
	h3: "Heading 3",
	h4: "Heading 4",
	h5: "Heading 5",
	h6: "Heading 6",
	number: "Numbered List",
	paragraph: "Normal",
	quote: "Quote"
};
const Context = dashboard__loadShare__react__loadShare__.createContext(void 0);
dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.registerBridgedContext(Context, "MarkdownToolbarContext");
const ToolbarProvider = ({ children }) => {
	const [toolbarState, setToolbarState] = dashboard__loadShare__react__loadShare__.useState({
		blockType: "paragraph",
		isBold: false,
		isClear: false,
		isItalic: false,
		isStrikethrough: false,
		isSubscript: false,
		isSuperscript: false,
		isUnderline: false
	});
	const updateToolbarState = dashboard__loadShare__react__loadShare__.useCallback((key, value) => {
		setToolbarState((prev) => ({
			...prev,
			[key]: value
		}));
	}, []);
	const contextValue = dashboard__loadShare__react__loadShare__.useMemo(() => ({
		toolbarState,
		updateToolbarState
	}), [toolbarState, updateToolbarState]);
	return /* @__PURE__ */ jsxRuntimeExports.jsx(Context.Provider, {
		value: contextValue,
		children
	});
};
const useToolbarState = () => {
	const context = dashboard__loadShare__react__loadShare__.useContext(Context);
	if (context === void 0) throw new Error("useToolbarState must be used within a ToolbarProvider");
	return context;
};

var prism = {exports: {}};

(function (module) {
	/* **********************************************
	     Begin prism-core.js
	********************************************** */

	/// <reference lib="WebWorker"/>

	var _self = (typeof window !== 'undefined')
		? window   // if in browser
		: (
			(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
				? self // if in worker
				: {}   // if in node js
		);

	/**
	 * Prism: Lightweight, robust, elegant syntax highlighting
	 *
	 * @license MIT <https://opensource.org/licenses/MIT>
	 * @author Lea Verou <https://lea.verou.me>
	 * @namespace
	 * @public
	 */
	var Prism = (function (_self) {

		// Private helper vars
		var lang = /(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i;
		var uniqueId = 0;

		// The grammar object for plaintext
		var plainTextGrammar = {};


		var _ = {
			/**
			 * By default, Prism will attempt to highlight all code elements (by calling {@link Prism.highlightAll}) on the
			 * current page after the page finished loading. This might be a problem if e.g. you wanted to asynchronously load
			 * additional languages or plugins yourself.
			 *
			 * By setting this value to `true`, Prism will not automatically highlight all code elements on the page.
			 *
			 * You obviously have to change this value before the automatic highlighting started. To do this, you can add an
			 * empty Prism object into the global scope before loading the Prism script like this:
			 *
			 * ```js
			 * window.Prism = window.Prism || {};
			 * Prism.manual = true;
			 * // add a new <script> to load Prism's script
			 * ```
			 *
			 * @default false
			 * @type {boolean}
			 * @memberof Prism
			 * @public
			 */
			manual: _self.Prism && _self.Prism.manual,
			/**
			 * By default, if Prism is in a web worker, it assumes that it is in a worker it created itself, so it uses
			 * `addEventListener` to communicate with its parent instance. However, if you're using Prism manually in your
			 * own worker, you don't want it to do this.
			 *
			 * By setting this value to `true`, Prism will not add its own listeners to the worker.
			 *
			 * You obviously have to change this value before Prism executes. To do this, you can add an
			 * empty Prism object into the global scope before loading the Prism script like this:
			 *
			 * ```js
			 * window.Prism = window.Prism || {};
			 * Prism.disableWorkerMessageHandler = true;
			 * // Load Prism's script
			 * ```
			 *
			 * @default false
			 * @type {boolean}
			 * @memberof Prism
			 * @public
			 */
			disableWorkerMessageHandler: _self.Prism && _self.Prism.disableWorkerMessageHandler,

			/**
			 * A namespace for utility methods.
			 *
			 * All function in this namespace that are not explicitly marked as _public_ are for __internal use only__ and may
			 * change or disappear at any time.
			 *
			 * @namespace
			 * @memberof Prism
			 */
			util: {
				encode: function encode(tokens) {
					if (tokens instanceof Token) {
						return new Token(tokens.type, encode(tokens.content), tokens.alias);
					} else if (Array.isArray(tokens)) {
						return tokens.map(encode);
					} else {
						return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
					}
				},

				/**
				 * Returns the name of the type of the given value.
				 *
				 * @param {any} o
				 * @returns {string}
				 * @example
				 * type(null)      === 'Null'
				 * type(undefined) === 'Undefined'
				 * type(123)       === 'Number'
				 * type('foo')     === 'String'
				 * type(true)      === 'Boolean'
				 * type([1, 2])    === 'Array'
				 * type({})        === 'Object'
				 * type(String)    === 'Function'
				 * type(/abc+/)    === 'RegExp'
				 */
				type: function (o) {
					return Object.prototype.toString.call(o).slice(8, -1);
				},

				/**
				 * Returns a unique number for the given object. Later calls will still return the same number.
				 *
				 * @param {Object} obj
				 * @returns {number}
				 */
				objId: function (obj) {
					if (!obj['__id']) {
						Object.defineProperty(obj, '__id', { value: ++uniqueId });
					}
					return obj['__id'];
				},

				/**
				 * Creates a deep clone of the given object.
				 *
				 * The main intended use of this function is to clone language definitions.
				 *
				 * @param {T} o
				 * @param {Record<number, any>} [visited]
				 * @returns {T}
				 * @template T
				 */
				clone: function deepClone(o, visited) {
					visited = visited || {};

					var clone; var id;
					switch (_.util.type(o)) {
						case 'Object':
							id = _.util.objId(o);
							if (visited[id]) {
								return visited[id];
							}
							clone = /** @type {Record<string, any>} */ ({});
							visited[id] = clone;

							for (var key in o) {
								if (o.hasOwnProperty(key)) {
									clone[key] = deepClone(o[key], visited);
								}
							}

							return /** @type {any} */ (clone);

						case 'Array':
							id = _.util.objId(o);
							if (visited[id]) {
								return visited[id];
							}
							clone = [];
							visited[id] = clone;

							(/** @type {Array} */(/** @type {any} */(o))).forEach(function (v, i) {
								clone[i] = deepClone(v, visited);
							});

							return /** @type {any} */ (clone);

						default:
							return o;
					}
				},

				/**
				 * Returns the Prism language of the given element set by a `language-xxxx` or `lang-xxxx` class.
				 *
				 * If no language is set for the element or the element is `null` or `undefined`, `none` will be returned.
				 *
				 * @param {Element} element
				 * @returns {string}
				 */
				getLanguage: function (element) {
					while (element) {
						var m = lang.exec(element.className);
						if (m) {
							return m[1].toLowerCase();
						}
						element = element.parentElement;
					}
					return 'none';
				},

				/**
				 * Sets the Prism `language-xxxx` class of the given element.
				 *
				 * @param {Element} element
				 * @param {string} language
				 * @returns {void}
				 */
				setLanguage: function (element, language) {
					// remove all `language-xxxx` classes
					// (this might leave behind a leading space)
					element.className = element.className.replace(RegExp(lang, 'gi'), '');

					// add the new `language-xxxx` class
					// (using `classList` will automatically clean up spaces for us)
					element.classList.add('language-' + language);
				},

				/**
				 * Returns the script element that is currently executing.
				 *
				 * This does __not__ work for line script element.
				 *
				 * @returns {HTMLScriptElement | null}
				 */
				currentScript: function () {
					if (typeof document === 'undefined') {
						return null;
					}
					if (document.currentScript && document.currentScript.tagName === 'SCRIPT' && 1 < 2 /* hack to trip TS' flow analysis */) {
						return /** @type {any} */ (document.currentScript);
					}

					// IE11 workaround
					// we'll get the src of the current script by parsing IE11's error stack trace
					// this will not work for inline scripts

					try {
						throw new Error();
					} catch (err) {
						// Get file src url from stack. Specifically works with the format of stack traces in IE.
						// A stack will look like this:
						//
						// Error
						//    at _.util.currentScript (http://localhost/components/prism-core.js:119:5)
						//    at Global code (http://localhost/components/prism-core.js:606:1)

						var src = (/at [^(\r\n]*\((.*):[^:]+:[^:]+\)$/i.exec(err.stack) || [])[1];
						if (src) {
							var scripts = document.getElementsByTagName('script');
							for (var i in scripts) {
								if (scripts[i].src == src) {
									return scripts[i];
								}
							}
						}
						return null;
					}
				},

				/**
				 * Returns whether a given class is active for `element`.
				 *
				 * The class can be activated if `element` or one of its ancestors has the given class and it can be deactivated
				 * if `element` or one of its ancestors has the negated version of the given class. The _negated version_ of the
				 * given class is just the given class with a `no-` prefix.
				 *
				 * Whether the class is active is determined by the closest ancestor of `element` (where `element` itself is
				 * closest ancestor) that has the given class or the negated version of it. If neither `element` nor any of its
				 * ancestors have the given class or the negated version of it, then the default activation will be returned.
				 *
				 * In the paradoxical situation where the closest ancestor contains __both__ the given class and the negated
				 * version of it, the class is considered active.
				 *
				 * @param {Element} element
				 * @param {string} className
				 * @param {boolean} [defaultActivation=false]
				 * @returns {boolean}
				 */
				isActive: function (element, className, defaultActivation) {
					var no = 'no-' + className;

					while (element) {
						var classList = element.classList;
						if (classList.contains(className)) {
							return true;
						}
						if (classList.contains(no)) {
							return false;
						}
						element = element.parentElement;
					}
					return !!defaultActivation;
				}
			},

			/**
			 * This namespace contains all currently loaded languages and the some helper functions to create and modify languages.
			 *
			 * @namespace
			 * @memberof Prism
			 * @public
			 */
			languages: {
				/**
				 * The grammar for plain, unformatted text.
				 */
				plain: plainTextGrammar,
				plaintext: plainTextGrammar,
				text: plainTextGrammar,
				txt: plainTextGrammar,

				/**
				 * Creates a deep copy of the language with the given id and appends the given tokens.
				 *
				 * If a token in `redef` also appears in the copied language, then the existing token in the copied language
				 * will be overwritten at its original position.
				 *
				 * ## Best practices
				 *
				 * Since the position of overwriting tokens (token in `redef` that overwrite tokens in the copied language)
				 * doesn't matter, they can technically be in any order. However, this can be confusing to others that trying to
				 * understand the language definition because, normally, the order of tokens matters in Prism grammars.
				 *
				 * Therefore, it is encouraged to order overwriting tokens according to the positions of the overwritten tokens.
				 * Furthermore, all non-overwriting tokens should be placed after the overwriting ones.
				 *
				 * @param {string} id The id of the language to extend. This has to be a key in `Prism.languages`.
				 * @param {Grammar} redef The new tokens to append.
				 * @returns {Grammar} The new language created.
				 * @public
				 * @example
				 * Prism.languages['css-with-colors'] = Prism.languages.extend('css', {
				 *     // Prism.languages.css already has a 'comment' token, so this token will overwrite CSS' 'comment' token
				 *     // at its original position
				 *     'comment': { ... },
				 *     // CSS doesn't have a 'color' token, so this token will be appended
				 *     'color': /\b(?:red|green|blue)\b/
				 * });
				 */
				extend: function (id, redef) {
					var lang = _.util.clone(_.languages[id]);

					for (var key in redef) {
						lang[key] = redef[key];
					}

					return lang;
				},

				/**
				 * Inserts tokens _before_ another token in a language definition or any other grammar.
				 *
				 * ## Usage
				 *
				 * This helper method makes it easy to modify existing languages. For example, the CSS language definition
				 * not only defines CSS highlighting for CSS documents, but also needs to define highlighting for CSS embedded
				 * in HTML through `<style>` elements. To do this, it needs to modify `Prism.languages.markup` and add the
				 * appropriate tokens. However, `Prism.languages.markup` is a regular JavaScript object literal, so if you do
				 * this:
				 *
				 * ```js
				 * Prism.languages.markup.style = {
				 *     // token
				 * };
				 * ```
				 *
				 * then the `style` token will be added (and processed) at the end. `insertBefore` allows you to insert tokens
				 * before existing tokens. For the CSS example above, you would use it like this:
				 *
				 * ```js
				 * Prism.languages.insertBefore('markup', 'cdata', {
				 *     'style': {
				 *         // token
				 *     }
				 * });
				 * ```
				 *
				 * ## Special cases
				 *
				 * If the grammars of `inside` and `insert` have tokens with the same name, the tokens in `inside`'s grammar
				 * will be ignored.
				 *
				 * This behavior can be used to insert tokens after `before`:
				 *
				 * ```js
				 * Prism.languages.insertBefore('markup', 'comment', {
				 *     'comment': Prism.languages.markup.comment,
				 *     // tokens after 'comment'
				 * });
				 * ```
				 *
				 * ## Limitations
				 *
				 * The main problem `insertBefore` has to solve is iteration order. Since ES2015, the iteration order for object
				 * properties is guaranteed to be the insertion order (except for integer keys) but some browsers behave
				 * differently when keys are deleted and re-inserted. So `insertBefore` can't be implemented by temporarily
				 * deleting properties which is necessary to insert at arbitrary positions.
				 *
				 * To solve this problem, `insertBefore` doesn't actually insert the given tokens into the target object.
				 * Instead, it will create a new object and replace all references to the target object with the new one. This
				 * can be done without temporarily deleting properties, so the iteration order is well-defined.
				 *
				 * However, only references that can be reached from `Prism.languages` or `insert` will be replaced. I.e. if
				 * you hold the target object in a variable, then the value of the variable will not change.
				 *
				 * ```js
				 * var oldMarkup = Prism.languages.markup;
				 * var newMarkup = Prism.languages.insertBefore('markup', 'comment', { ... });
				 *
				 * assert(oldMarkup !== Prism.languages.markup);
				 * assert(newMarkup === Prism.languages.markup);
				 * ```
				 *
				 * @param {string} inside The property of `root` (e.g. a language id in `Prism.languages`) that contains the
				 * object to be modified.
				 * @param {string} before The key to insert before.
				 * @param {Grammar} insert An object containing the key-value pairs to be inserted.
				 * @param {Object<string, any>} [root] The object containing `inside`, i.e. the object that contains the
				 * object to be modified.
				 *
				 * Defaults to `Prism.languages`.
				 * @returns {Grammar} The new grammar object.
				 * @public
				 */
				insertBefore: function (inside, before, insert, root) {
					root = root || /** @type {any} */ (_.languages);
					var grammar = root[inside];
					/** @type {Grammar} */
					var ret = {};

					for (var token in grammar) {
						if (grammar.hasOwnProperty(token)) {

							if (token == before) {
								for (var newToken in insert) {
									if (insert.hasOwnProperty(newToken)) {
										ret[newToken] = insert[newToken];
									}
								}
							}

							// Do not insert token which also occur in insert. See #1525
							if (!insert.hasOwnProperty(token)) {
								ret[token] = grammar[token];
							}
						}
					}

					var old = root[inside];
					root[inside] = ret;

					// Update references in other language definitions
					_.languages.DFS(_.languages, function (key, value) {
						if (value === old && key != inside) {
							this[key] = ret;
						}
					});

					return ret;
				},

				// Traverse a language definition with Depth First Search
				DFS: function DFS(o, callback, type, visited) {
					visited = visited || {};

					var objId = _.util.objId;

					for (var i in o) {
						if (o.hasOwnProperty(i)) {
							callback.call(o, i, o[i], type || i);

							var property = o[i];
							var propertyType = _.util.type(property);

							if (propertyType === 'Object' && !visited[objId(property)]) {
								visited[objId(property)] = true;
								DFS(property, callback, null, visited);
							} else if (propertyType === 'Array' && !visited[objId(property)]) {
								visited[objId(property)] = true;
								DFS(property, callback, i, visited);
							}
						}
					}
				}
			},

			plugins: {},

			/**
			 * This is the most high-level function in Prism’s API.
			 * It fetches all the elements that have a `.language-xxxx` class and then calls {@link Prism.highlightElement} on
			 * each one of them.
			 *
			 * This is equivalent to `Prism.highlightAllUnder(document, async, callback)`.
			 *
			 * @param {boolean} [async=false] Same as in {@link Prism.highlightAllUnder}.
			 * @param {HighlightCallback} [callback] Same as in {@link Prism.highlightAllUnder}.
			 * @memberof Prism
			 * @public
			 */
			highlightAll: function (async, callback) {
				_.highlightAllUnder(document, async, callback);
			},

			/**
			 * Fetches all the descendants of `container` that have a `.language-xxxx` class and then calls
			 * {@link Prism.highlightElement} on each one of them.
			 *
			 * The following hooks will be run:
			 * 1. `before-highlightall`
			 * 2. `before-all-elements-highlight`
			 * 3. All hooks of {@link Prism.highlightElement} for each element.
			 *
			 * @param {ParentNode} container The root element, whose descendants that have a `.language-xxxx` class will be highlighted.
			 * @param {boolean} [async=false] Whether each element is to be highlighted asynchronously using Web Workers.
			 * @param {HighlightCallback} [callback] An optional callback to be invoked on each element after its highlighting is done.
			 * @memberof Prism
			 * @public
			 */
			highlightAllUnder: function (container, async, callback) {
				var env = {
					callback: callback,
					container: container,
					selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
				};

				_.hooks.run('before-highlightall', env);

				env.elements = Array.prototype.slice.apply(env.container.querySelectorAll(env.selector));

				_.hooks.run('before-all-elements-highlight', env);

				for (var i = 0, element; (element = env.elements[i++]);) {
					_.highlightElement(element, async === true, env.callback);
				}
			},

			/**
			 * Highlights the code inside a single element.
			 *
			 * The following hooks will be run:
			 * 1. `before-sanity-check`
			 * 2. `before-highlight`
			 * 3. All hooks of {@link Prism.highlight}. These hooks will be run by an asynchronous worker if `async` is `true`.
			 * 4. `before-insert`
			 * 5. `after-highlight`
			 * 6. `complete`
			 *
			 * Some the above hooks will be skipped if the element doesn't contain any text or there is no grammar loaded for
			 * the element's language.
			 *
			 * @param {Element} element The element containing the code.
			 * It must have a class of `language-xxxx` to be processed, where `xxxx` is a valid language identifier.
			 * @param {boolean} [async=false] Whether the element is to be highlighted asynchronously using Web Workers
			 * to improve performance and avoid blocking the UI when highlighting very large chunks of code. This option is
			 * [disabled by default](https://prismjs.com/faq.html#why-is-asynchronous-highlighting-disabled-by-default).
			 *
			 * Note: All language definitions required to highlight the code must be included in the main `prism.js` file for
			 * asynchronous highlighting to work. You can build your own bundle on the
			 * [Download page](https://prismjs.com/download.html).
			 * @param {HighlightCallback} [callback] An optional callback to be invoked after the highlighting is done.
			 * Mostly useful when `async` is `true`, since in that case, the highlighting is done asynchronously.
			 * @memberof Prism
			 * @public
			 */
			highlightElement: function (element, async, callback) {
				// Find language
				var language = _.util.getLanguage(element);
				var grammar = _.languages[language];

				// Set language on the element, if not present
				_.util.setLanguage(element, language);

				// Set language on the parent, for styling
				var parent = element.parentElement;
				if (parent && parent.nodeName.toLowerCase() === 'pre') {
					_.util.setLanguage(parent, language);
				}

				var code = element.textContent;

				var env = {
					element: element,
					language: language,
					grammar: grammar,
					code: code
				};

				function insertHighlightedCode(highlightedCode) {
					env.highlightedCode = highlightedCode;

					_.hooks.run('before-insert', env);

					env.element.innerHTML = env.highlightedCode;

					_.hooks.run('after-highlight', env);
					_.hooks.run('complete', env);
					callback && callback.call(env.element);
				}

				_.hooks.run('before-sanity-check', env);

				// plugins may change/add the parent/element
				parent = env.element.parentElement;
				if (parent && parent.nodeName.toLowerCase() === 'pre' && !parent.hasAttribute('tabindex')) {
					parent.setAttribute('tabindex', '0');
				}

				if (!env.code) {
					_.hooks.run('complete', env);
					callback && callback.call(env.element);
					return;
				}

				_.hooks.run('before-highlight', env);

				if (!env.grammar) {
					insertHighlightedCode(_.util.encode(env.code));
					return;
				}

				if (async && _self.Worker) {
					var worker = new Worker(_.filename);

					worker.onmessage = function (evt) {
						insertHighlightedCode(evt.data);
					};

					worker.postMessage(JSON.stringify({
						language: env.language,
						code: env.code,
						immediateClose: true
					}));
				} else {
					insertHighlightedCode(_.highlight(env.code, env.grammar, env.language));
				}
			},

			/**
			 * Low-level function, only use if you know what you’re doing. It accepts a string of text as input
			 * and the language definitions to use, and returns a string with the HTML produced.
			 *
			 * The following hooks will be run:
			 * 1. `before-tokenize`
			 * 2. `after-tokenize`
			 * 3. `wrap`: On each {@link Token}.
			 *
			 * @param {string} text A string with the code to be highlighted.
			 * @param {Grammar} grammar An object containing the tokens to use.
			 *
			 * Usually a language definition like `Prism.languages.markup`.
			 * @param {string} language The name of the language definition passed to `grammar`.
			 * @returns {string} The highlighted HTML.
			 * @memberof Prism
			 * @public
			 * @example
			 * Prism.highlight('var foo = true;', Prism.languages.javascript, 'javascript');
			 */
			highlight: function (text, grammar, language) {
				var env = {
					code: text,
					grammar: grammar,
					language: language
				};
				_.hooks.run('before-tokenize', env);
				if (!env.grammar) {
					throw new Error('The language "' + env.language + '" has no grammar.');
				}
				env.tokens = _.tokenize(env.code, env.grammar);
				_.hooks.run('after-tokenize', env);
				return Token.stringify(_.util.encode(env.tokens), env.language);
			},

			/**
			 * This is the heart of Prism, and the most low-level function you can use. It accepts a string of text as input
			 * and the language definitions to use, and returns an array with the tokenized code.
			 *
			 * When the language definition includes nested tokens, the function is called recursively on each of these tokens.
			 *
			 * This method could be useful in other contexts as well, as a very crude parser.
			 *
			 * @param {string} text A string with the code to be highlighted.
			 * @param {Grammar} grammar An object containing the tokens to use.
			 *
			 * Usually a language definition like `Prism.languages.markup`.
			 * @returns {TokenStream} An array of strings and tokens, a token stream.
			 * @memberof Prism
			 * @public
			 * @example
			 * let code = `var foo = 0;`;
			 * let tokens = Prism.tokenize(code, Prism.languages.javascript);
			 * tokens.forEach(token => {
			 *     if (token instanceof Prism.Token && token.type === 'number') {
			 *         console.log(`Found numeric literal: ${token.content}`);
			 *     }
			 * });
			 */
			tokenize: function (text, grammar) {
				var rest = grammar.rest;
				if (rest) {
					for (var token in rest) {
						grammar[token] = rest[token];
					}

					delete grammar.rest;
				}

				var tokenList = new LinkedList();
				addAfter(tokenList, tokenList.head, text);

				matchGrammar(text, tokenList, grammar, tokenList.head, 0);

				return toArray(tokenList);
			},

			/**
			 * @namespace
			 * @memberof Prism
			 * @public
			 */
			hooks: {
				all: {},

				/**
				 * Adds the given callback to the list of callbacks for the given hook.
				 *
				 * The callback will be invoked when the hook it is registered for is run.
				 * Hooks are usually directly run by a highlight function but you can also run hooks yourself.
				 *
				 * One callback function can be registered to multiple hooks and the same hook multiple times.
				 *
				 * @param {string} name The name of the hook.
				 * @param {HookCallback} callback The callback function which is given environment variables.
				 * @public
				 */
				add: function (name, callback) {
					var hooks = _.hooks.all;

					hooks[name] = hooks[name] || [];

					hooks[name].push(callback);
				},

				/**
				 * Runs a hook invoking all registered callbacks with the given environment variables.
				 *
				 * Callbacks will be invoked synchronously and in the order in which they were registered.
				 *
				 * @param {string} name The name of the hook.
				 * @param {Object<string, any>} env The environment variables of the hook passed to all callbacks registered.
				 * @public
				 */
				run: function (name, env) {
					var callbacks = _.hooks.all[name];

					if (!callbacks || !callbacks.length) {
						return;
					}

					for (var i = 0, callback; (callback = callbacks[i++]);) {
						callback(env);
					}
				}
			},

			Token: Token
		};
		_self.Prism = _;


		// Typescript note:
		// The following can be used to import the Token type in JSDoc:
		//
		//   @typedef {InstanceType<import("./prism-core")["Token"]>} Token

		/**
		 * Creates a new token.
		 *
		 * @param {string} type See {@link Token#type type}
		 * @param {string | TokenStream} content See {@link Token#content content}
		 * @param {string|string[]} [alias] The alias(es) of the token.
		 * @param {string} [matchedStr=""] A copy of the full string this token was created from.
		 * @class
		 * @global
		 * @public
		 */
		function Token(type, content, alias, matchedStr) {
			/**
			 * The type of the token.
			 *
			 * This is usually the key of a pattern in a {@link Grammar}.
			 *
			 * @type {string}
			 * @see GrammarToken
			 * @public
			 */
			this.type = type;
			/**
			 * The strings or tokens contained by this token.
			 *
			 * This will be a token stream if the pattern matched also defined an `inside` grammar.
			 *
			 * @type {string | TokenStream}
			 * @public
			 */
			this.content = content;
			/**
			 * The alias(es) of the token.
			 *
			 * @type {string|string[]}
			 * @see GrammarToken
			 * @public
			 */
			this.alias = alias;
			// Copy of the full string this token was created from
			this.length = (matchedStr || '').length | 0;
		}

		/**
		 * A token stream is an array of strings and {@link Token Token} objects.
		 *
		 * Token streams have to fulfill a few properties that are assumed by most functions (mostly internal ones) that process
		 * them.
		 *
		 * 1. No adjacent strings.
		 * 2. No empty strings.
		 *
		 *    The only exception here is the token stream that only contains the empty string and nothing else.
		 *
		 * @typedef {Array<string | Token>} TokenStream
		 * @global
		 * @public
		 */

		/**
		 * Converts the given token or token stream to an HTML representation.
		 *
		 * The following hooks will be run:
		 * 1. `wrap`: On each {@link Token}.
		 *
		 * @param {string | Token | TokenStream} o The token or token stream to be converted.
		 * @param {string} language The name of current language.
		 * @returns {string} The HTML representation of the token or token stream.
		 * @memberof Token
		 * @static
		 */
		Token.stringify = function stringify(o, language) {
			if (typeof o == 'string') {
				return o;
			}
			if (Array.isArray(o)) {
				var s = '';
				o.forEach(function (e) {
					s += stringify(e, language);
				});
				return s;
			}

			var env = {
				type: o.type,
				content: stringify(o.content, language),
				tag: 'span',
				classes: ['token', o.type],
				attributes: {},
				language: language
			};

			var aliases = o.alias;
			if (aliases) {
				if (Array.isArray(aliases)) {
					Array.prototype.push.apply(env.classes, aliases);
				} else {
					env.classes.push(aliases);
				}
			}

			_.hooks.run('wrap', env);

			var attributes = '';
			for (var name in env.attributes) {
				attributes += ' ' + name + '="' + (env.attributes[name] || '').replace(/"/g, '&quot;') + '"';
			}

			return '<' + env.tag + ' class="' + env.classes.join(' ') + '"' + attributes + '>' + env.content + '</' + env.tag + '>';
		};

		/**
		 * @param {RegExp} pattern
		 * @param {number} pos
		 * @param {string} text
		 * @param {boolean} lookbehind
		 * @returns {RegExpExecArray | null}
		 */
		function matchPattern(pattern, pos, text, lookbehind) {
			pattern.lastIndex = pos;
			var match = pattern.exec(text);
			if (match && lookbehind && match[1]) {
				// change the match to remove the text matched by the Prism lookbehind group
				var lookbehindLength = match[1].length;
				match.index += lookbehindLength;
				match[0] = match[0].slice(lookbehindLength);
			}
			return match;
		}

		/**
		 * @param {string} text
		 * @param {LinkedList<string | Token>} tokenList
		 * @param {any} grammar
		 * @param {LinkedListNode<string | Token>} startNode
		 * @param {number} startPos
		 * @param {RematchOptions} [rematch]
		 * @returns {void}
		 * @private
		 *
		 * @typedef RematchOptions
		 * @property {string} cause
		 * @property {number} reach
		 */
		function matchGrammar(text, tokenList, grammar, startNode, startPos, rematch) {
			for (var token in grammar) {
				if (!grammar.hasOwnProperty(token) || !grammar[token]) {
					continue;
				}

				var patterns = grammar[token];
				patterns = Array.isArray(patterns) ? patterns : [patterns];

				for (var j = 0; j < patterns.length; ++j) {
					if (rematch && rematch.cause == token + ',' + j) {
						return;
					}

					var patternObj = patterns[j];
					var inside = patternObj.inside;
					var lookbehind = !!patternObj.lookbehind;
					var greedy = !!patternObj.greedy;
					var alias = patternObj.alias;

					if (greedy && !patternObj.pattern.global) {
						// Without the global flag, lastIndex won't work
						var flags = patternObj.pattern.toString().match(/[imsuy]*$/)[0];
						patternObj.pattern = RegExp(patternObj.pattern.source, flags + 'g');
					}

					/** @type {RegExp} */
					var pattern = patternObj.pattern || patternObj;

					for ( // iterate the token list and keep track of the current token/string position
						var currentNode = startNode.next, pos = startPos;
						currentNode !== tokenList.tail;
						pos += currentNode.value.length, currentNode = currentNode.next
					) {

						if (rematch && pos >= rematch.reach) {
							break;
						}

						var str = currentNode.value;

						if (tokenList.length > text.length) {
							// Something went terribly wrong, ABORT, ABORT!
							return;
						}

						if (str instanceof Token) {
							continue;
						}

						var removeCount = 1; // this is the to parameter of removeBetween
						var match;

						if (greedy) {
							match = matchPattern(pattern, pos, text, lookbehind);
							if (!match || match.index >= text.length) {
								break;
							}

							var from = match.index;
							var to = match.index + match[0].length;
							var p = pos;

							// find the node that contains the match
							p += currentNode.value.length;
							while (from >= p) {
								currentNode = currentNode.next;
								p += currentNode.value.length;
							}
							// adjust pos (and p)
							p -= currentNode.value.length;
							pos = p;

							// the current node is a Token, then the match starts inside another Token, which is invalid
							if (currentNode.value instanceof Token) {
								continue;
							}

							// find the last node which is affected by this match
							for (
								var k = currentNode;
								k !== tokenList.tail && (p < to || typeof k.value === 'string');
								k = k.next
							) {
								removeCount++;
								p += k.value.length;
							}
							removeCount--;

							// replace with the new match
							str = text.slice(pos, p);
							match.index -= pos;
						} else {
							match = matchPattern(pattern, 0, str, lookbehind);
							if (!match) {
								continue;
							}
						}

						// eslint-disable-next-line no-redeclare
						var from = match.index;
						var matchStr = match[0];
						var before = str.slice(0, from);
						var after = str.slice(from + matchStr.length);

						var reach = pos + str.length;
						if (rematch && reach > rematch.reach) {
							rematch.reach = reach;
						}

						var removeFrom = currentNode.prev;

						if (before) {
							removeFrom = addAfter(tokenList, removeFrom, before);
							pos += before.length;
						}

						removeRange(tokenList, removeFrom, removeCount);

						var wrapped = new Token(token, inside ? _.tokenize(matchStr, inside) : matchStr, alias, matchStr);
						currentNode = addAfter(tokenList, removeFrom, wrapped);

						if (after) {
							addAfter(tokenList, currentNode, after);
						}

						if (removeCount > 1) {
							// at least one Token object was removed, so we have to do some rematching
							// this can only happen if the current pattern is greedy

							/** @type {RematchOptions} */
							var nestedRematch = {
								cause: token + ',' + j,
								reach: reach
							};
							matchGrammar(text, tokenList, grammar, currentNode.prev, pos, nestedRematch);

							// the reach might have been extended because of the rematching
							if (rematch && nestedRematch.reach > rematch.reach) {
								rematch.reach = nestedRematch.reach;
							}
						}
					}
				}
			}
		}

		/**
		 * @typedef LinkedListNode
		 * @property {T} value
		 * @property {LinkedListNode<T> | null} prev The previous node.
		 * @property {LinkedListNode<T> | null} next The next node.
		 * @template T
		 * @private
		 */

		/**
		 * @template T
		 * @private
		 */
		function LinkedList() {
			/** @type {LinkedListNode<T>} */
			var head = { value: null, prev: null, next: null };
			/** @type {LinkedListNode<T>} */
			var tail = { value: null, prev: head, next: null };
			head.next = tail;

			/** @type {LinkedListNode<T>} */
			this.head = head;
			/** @type {LinkedListNode<T>} */
			this.tail = tail;
			this.length = 0;
		}

		/**
		 * Adds a new node with the given value to the list.
		 *
		 * @param {LinkedList<T>} list
		 * @param {LinkedListNode<T>} node
		 * @param {T} value
		 * @returns {LinkedListNode<T>} The added node.
		 * @template T
		 */
		function addAfter(list, node, value) {
			// assumes that node != list.tail && values.length >= 0
			var next = node.next;

			var newNode = { value: value, prev: node, next: next };
			node.next = newNode;
			next.prev = newNode;
			list.length++;

			return newNode;
		}
		/**
		 * Removes `count` nodes after the given node. The given node will not be removed.
		 *
		 * @param {LinkedList<T>} list
		 * @param {LinkedListNode<T>} node
		 * @param {number} count
		 * @template T
		 */
		function removeRange(list, node, count) {
			var next = node.next;
			for (var i = 0; i < count && next !== list.tail; i++) {
				next = next.next;
			}
			node.next = next;
			next.prev = node;
			list.length -= i;
		}
		/**
		 * @param {LinkedList<T>} list
		 * @returns {T[]}
		 * @template T
		 */
		function toArray(list) {
			var array = [];
			var node = list.head.next;
			while (node !== list.tail) {
				array.push(node.value);
				node = node.next;
			}
			return array;
		}


		if (!_self.document) {
			if (!_self.addEventListener) {
				// in Node.js
				return _;
			}

			if (!_.disableWorkerMessageHandler) {
				// In worker
				_self.addEventListener('message', function (evt) {
					var message = JSON.parse(evt.data);
					var lang = message.language;
					var code = message.code;
					var immediateClose = message.immediateClose;

					_self.postMessage(_.highlight(code, _.languages[lang], lang));
					if (immediateClose) {
						_self.close();
					}
				}, false);
			}

			return _;
		}

		// Get current script and highlight
		var script = _.util.currentScript();

		if (script) {
			_.filename = script.src;

			if (script.hasAttribute('data-manual')) {
				_.manual = true;
			}
		}

		function highlightAutomaticallyCallback() {
			if (!_.manual) {
				_.highlightAll();
			}
		}

		if (!_.manual) {
			// If the document state is "loading", then we'll use DOMContentLoaded.
			// If the document state is "interactive" and the prism.js script is deferred, then we'll also use the
			// DOMContentLoaded event because there might be some plugins or languages which have also been deferred and they
			// might take longer one animation frame to execute which can create a race condition where only some plugins have
			// been loaded when Prism.highlightAll() is executed, depending on how fast resources are loaded.
			// See https://github.com/PrismJS/prism/issues/2102
			var readyState = document.readyState;
			if (readyState === 'loading' || readyState === 'interactive' && script && script.defer) {
				document.addEventListener('DOMContentLoaded', highlightAutomaticallyCallback);
			} else {
				if (window.requestAnimationFrame) {
					window.requestAnimationFrame(highlightAutomaticallyCallback);
				} else {
					window.setTimeout(highlightAutomaticallyCallback, 16);
				}
			}
		}

		return _;

	}(_self));

	if (module.exports) {
		module.exports = Prism;
	}

	// hack for components to work correctly in node.js
	if (typeof commonjsGlobal !== 'undefined') {
		commonjsGlobal.Prism = Prism;
	}

	// some additional documentation/types

	/**
	 * The expansion of a simple `RegExp` literal to support additional properties.
	 *
	 * @typedef GrammarToken
	 * @property {RegExp} pattern The regular expression of the token.
	 * @property {boolean} [lookbehind=false] If `true`, then the first capturing group of `pattern` will (effectively)
	 * behave as a lookbehind group meaning that the captured text will not be part of the matched text of the new token.
	 * @property {boolean} [greedy=false] Whether the token is greedy.
	 * @property {string|string[]} [alias] An optional alias or list of aliases.
	 * @property {Grammar} [inside] The nested grammar of this token.
	 *
	 * The `inside` grammar will be used to tokenize the text value of each token of this kind.
	 *
	 * This can be used to make nested and even recursive language definitions.
	 *
	 * Note: This can cause infinite recursion. Be careful when you embed different languages or even the same language into
	 * each another.
	 * @global
	 * @public
	 */

	/**
	 * @typedef Grammar
	 * @type {Object<string, RegExp | GrammarToken | Array<RegExp | GrammarToken>>}
	 * @property {Grammar} [rest] An optional grammar object that will be appended to this grammar.
	 * @global
	 * @public
	 */

	/**
	 * A function which will invoked after an element was successfully highlighted.
	 *
	 * @callback HighlightCallback
	 * @param {Element} element The element successfully highlighted.
	 * @returns {void}
	 * @global
	 * @public
	 */

	/**
	 * @callback HookCallback
	 * @param {Object<string, any>} env The environment variables of the hook.
	 * @returns {void}
	 * @global
	 * @public
	 */


	/* **********************************************
	     Begin prism-markup.js
	********************************************** */

	Prism.languages.markup = {
		'comment': {
			pattern: /<!--(?:(?!<!--)[\s\S])*?-->/,
			greedy: true
		},
		'prolog': {
			pattern: /<\?[\s\S]+?\?>/,
			greedy: true
		},
		'doctype': {
			// https://www.w3.org/TR/xml/#NT-doctypedecl
			pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,
			greedy: true,
			inside: {
				'internal-subset': {
					pattern: /(^[^\[]*\[)[\s\S]+(?=\]>$)/,
					lookbehind: true,
					greedy: true,
					inside: null // see below
				},
				'string': {
					pattern: /"[^"]*"|'[^']*'/,
					greedy: true
				},
				'punctuation': /^<!|>$|[[\]]/,
				'doctype-tag': /^DOCTYPE/i,
				'name': /[^\s<>'"]+/
			}
		},
		'cdata': {
			pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
			greedy: true
		},
		'tag': {
			pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,
			greedy: true,
			inside: {
				'tag': {
					pattern: /^<\/?[^\s>\/]+/,
					inside: {
						'punctuation': /^<\/?/,
						'namespace': /^[^\s>\/:]+:/
					}
				},
				'special-attr': [],
				'attr-value': {
					pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,
					inside: {
						'punctuation': [
							{
								pattern: /^=/,
								alias: 'attr-equals'
							},
							{
								pattern: /^(\s*)["']|["']$/,
								lookbehind: true
							}
						]
					}
				},
				'punctuation': /\/?>/,
				'attr-name': {
					pattern: /[^\s>\/]+/,
					inside: {
						'namespace': /^[^\s>\/:]+:/
					}
				}

			}
		},
		'entity': [
			{
				pattern: /&[\da-z]{1,8};/i,
				alias: 'named-entity'
			},
			/&#x?[\da-f]{1,8};/i
		]
	};

	Prism.languages.markup['tag'].inside['attr-value'].inside['entity'] =
		Prism.languages.markup['entity'];
	Prism.languages.markup['doctype'].inside['internal-subset'].inside = Prism.languages.markup;

	// Plugin to make entity title show the real entity, idea by Roman Komarov
	Prism.hooks.add('wrap', function (env) {

		if (env.type === 'entity') {
			env.attributes['title'] = env.content.replace(/&amp;/, '&');
		}
	});

	Object.defineProperty(Prism.languages.markup.tag, 'addInlined', {
		/**
		 * Adds an inlined language to markup.
		 *
		 * An example of an inlined language is CSS with `<style>` tags.
		 *
		 * @param {string} tagName The name of the tag that contains the inlined language. This name will be treated as
		 * case insensitive.
		 * @param {string} lang The language key.
		 * @example
		 * addInlined('style', 'css');
		 */
		value: function addInlined(tagName, lang) {
			var includedCdataInside = {};
			includedCdataInside['language-' + lang] = {
				pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
				lookbehind: true,
				inside: Prism.languages[lang]
			};
			includedCdataInside['cdata'] = /^<!\[CDATA\[|\]\]>$/i;

			var inside = {
				'included-cdata': {
					pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
					inside: includedCdataInside
				}
			};
			inside['language-' + lang] = {
				pattern: /[\s\S]+/,
				inside: Prism.languages[lang]
			};

			var def = {};
			def[tagName] = {
				pattern: RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g, function () { return tagName; }), 'i'),
				lookbehind: true,
				greedy: true,
				inside: inside
			};

			Prism.languages.insertBefore('markup', 'cdata', def);
		}
	});
	Object.defineProperty(Prism.languages.markup.tag, 'addAttribute', {
		/**
		 * Adds an pattern to highlight languages embedded in HTML attributes.
		 *
		 * An example of an inlined language is CSS with `style` attributes.
		 *
		 * @param {string} attrName The name of the tag that contains the inlined language. This name will be treated as
		 * case insensitive.
		 * @param {string} lang The language key.
		 * @example
		 * addAttribute('style', 'css');
		 */
		value: function (attrName, lang) {
			Prism.languages.markup.tag.inside['special-attr'].push({
				pattern: RegExp(
					/(^|["'\s])/.source + '(?:' + attrName + ')' + /\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,
					'i'
				),
				lookbehind: true,
				inside: {
					'attr-name': /^[^\s=]+/,
					'attr-value': {
						pattern: /=[\s\S]+/,
						inside: {
							'value': {
								pattern: /(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,
								lookbehind: true,
								alias: [lang, 'language-' + lang],
								inside: Prism.languages[lang]
							},
							'punctuation': [
								{
									pattern: /^=/,
									alias: 'attr-equals'
								},
								/"|'/
							]
						}
					}
				}
			});
		}
	});

	Prism.languages.html = Prism.languages.markup;
	Prism.languages.mathml = Prism.languages.markup;
	Prism.languages.svg = Prism.languages.markup;

	Prism.languages.xml = Prism.languages.extend('markup', {});
	Prism.languages.ssml = Prism.languages.xml;
	Prism.languages.atom = Prism.languages.xml;
	Prism.languages.rss = Prism.languages.xml;


	/* **********************************************
	     Begin prism-css.js
	********************************************** */

	(function (Prism) {

		var string = /(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/;

		Prism.languages.css = {
			'comment': /\/\*[\s\S]*?\*\//,
			'atrule': {
				pattern: RegExp('@[\\w-](?:' + /[^;{\s"']|\s+(?!\s)/.source + '|' + string.source + ')*?' + /(?:;|(?=\s*\{))/.source),
				inside: {
					'rule': /^@[\w-]+/,
					'selector-function-argument': {
						pattern: /(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/,
						lookbehind: true,
						alias: 'selector'
					},
					'keyword': {
						pattern: /(^|[^\w-])(?:and|not|only|or)(?![\w-])/,
						lookbehind: true
					}
					// See rest below
				}
			},
			'url': {
				// https://drafts.csswg.org/css-values-3/#urls
				pattern: RegExp('\\burl\\((?:' + string.source + '|' + /(?:[^\\\r\n()"']|\\[\s\S])*/.source + ')\\)', 'i'),
				greedy: true,
				inside: {
					'function': /^url/i,
					'punctuation': /^\(|\)$/,
					'string': {
						pattern: RegExp('^' + string.source + '$'),
						alias: 'url'
					}
				}
			},
			'selector': {
				pattern: RegExp('(^|[{}\\s])[^{}\\s](?:[^{};"\'\\s]|\\s+(?![\\s{])|' + string.source + ')*(?=\\s*\\{)'),
				lookbehind: true
			},
			'string': {
				pattern: string,
				greedy: true
			},
			'property': {
				pattern: /(^|[^-\w\xA0-\uFFFF])(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i,
				lookbehind: true
			},
			'important': /!important\b/i,
			'function': {
				pattern: /(^|[^-a-z0-9])[-a-z0-9]+(?=\()/i,
				lookbehind: true
			},
			'punctuation': /[(){};:,]/
		};

		Prism.languages.css['atrule'].inside.rest = Prism.languages.css;

		var markup = Prism.languages.markup;
		if (markup) {
			markup.tag.addInlined('style', 'css');
			markup.tag.addAttribute('style', 'css');
		}

	}(Prism));


	/* **********************************************
	     Begin prism-clike.js
	********************************************** */

	Prism.languages.clike = {
		'comment': [
			{
				pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
				lookbehind: true,
				greedy: true
			},
			{
				pattern: /(^|[^\\:])\/\/.*/,
				lookbehind: true,
				greedy: true
			}
		],
		'string': {
			pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
			greedy: true
		},
		'class-name': {
			pattern: /(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,
			lookbehind: true,
			inside: {
				'punctuation': /[.\\]/
			}
		},
		'keyword': /\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/,
		'boolean': /\b(?:false|true)\b/,
		'function': /\b\w+(?=\()/,
		'number': /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
		'operator': /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
		'punctuation': /[{}[\];(),.:]/
	};


	/* **********************************************
	     Begin prism-javascript.js
	********************************************** */

	Prism.languages.javascript = Prism.languages.extend('clike', {
		'class-name': [
			Prism.languages.clike['class-name'],
			{
				pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,
				lookbehind: true
			}
		],
		'keyword': [
			{
				pattern: /((?:^|\})\s*)catch\b/,
				lookbehind: true
			},
			{
				pattern: /(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
				lookbehind: true
			},
		],
		// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
		'function': /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
		'number': {
			pattern: RegExp(
				/(^|[^\w$])/.source +
				'(?:' +
				(
					// constant
					/NaN|Infinity/.source +
					'|' +
					// binary integer
					/0[bB][01]+(?:_[01]+)*n?/.source +
					'|' +
					// octal integer
					/0[oO][0-7]+(?:_[0-7]+)*n?/.source +
					'|' +
					// hexadecimal integer
					/0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source +
					'|' +
					// decimal bigint
					/\d+(?:_\d+)*n/.source +
					'|' +
					// decimal number (integer or float) but no bigint
					/(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/.source
				) +
				')' +
				/(?![\w$])/.source
			),
			lookbehind: true
		},
		'operator': /--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/
	});

	Prism.languages.javascript['class-name'][0].pattern = /(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/;

	Prism.languages.insertBefore('javascript', 'keyword', {
		'regex': {
			pattern: RegExp(
				// lookbehind
				// eslint-disable-next-line regexp/no-dupe-characters-character-class
				/((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)/.source +
				// Regex pattern:
				// There are 2 regex patterns here. The RegExp set notation proposal added support for nested character
				// classes if the `v` flag is present. Unfortunately, nested CCs are both context-free and incompatible
				// with the only syntax, so we have to define 2 different regex patterns.
				/\//.source +
				'(?:' +
				/(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}/.source +
				'|' +
				// `v` flag syntax. This supports 3 levels of nested character classes.
				/(?:\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7}/.source +
				')' +
				// lookahead
				/(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/.source
			),
			lookbehind: true,
			greedy: true,
			inside: {
				'regex-source': {
					pattern: /^(\/)[\s\S]+(?=\/[a-z]*$)/,
					lookbehind: true,
					alias: 'language-regex',
					inside: Prism.languages.regex
				},
				'regex-delimiter': /^\/|\/$/,
				'regex-flags': /^[a-z]+$/,
			}
		},
		// This must be declared before keyword because we use "function" inside the look-forward
		'function-variable': {
			pattern: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,
			alias: 'function'
		},
		'parameter': [
			{
				pattern: /(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,
				lookbehind: true,
				inside: Prism.languages.javascript
			},
			{
				pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,
				lookbehind: true,
				inside: Prism.languages.javascript
			},
			{
				pattern: /(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,
				lookbehind: true,
				inside: Prism.languages.javascript
			},
			{
				pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,
				lookbehind: true,
				inside: Prism.languages.javascript
			}
		],
		'constant': /\b[A-Z](?:[A-Z_]|\dx?)*\b/
	});

	Prism.languages.insertBefore('javascript', 'string', {
		'hashbang': {
			pattern: /^#!.*/,
			greedy: true,
			alias: 'comment'
		},
		'template-string': {
			pattern: /`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,
			greedy: true,
			inside: {
				'template-punctuation': {
					pattern: /^`|`$/,
					alias: 'string'
				},
				'interpolation': {
					pattern: /((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,
					lookbehind: true,
					inside: {
						'interpolation-punctuation': {
							pattern: /^\$\{|\}$/,
							alias: 'punctuation'
						},
						rest: Prism.languages.javascript
					}
				},
				'string': /[\s\S]+/
			}
		},
		'string-property': {
			pattern: /((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,
			lookbehind: true,
			greedy: true,
			alias: 'property'
		}
	});

	Prism.languages.insertBefore('javascript', 'operator', {
		'literal-property': {
			pattern: /((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,
			lookbehind: true,
			alias: 'property'
		},
	});

	if (Prism.languages.markup) {
		Prism.languages.markup.tag.addInlined('script', 'javascript');

		// add attribute support for all DOM events.
		// https://developer.mozilla.org/en-US/docs/Web/Events#Standard_events
		Prism.languages.markup.tag.addAttribute(
			/on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source,
			'javascript'
		);
	}

	Prism.languages.js = Prism.languages.javascript;


	/* **********************************************
	     Begin prism-file-highlight.js
	********************************************** */

	(function () {

		if (typeof Prism === 'undefined' || typeof document === 'undefined') {
			return;
		}

		// https://developer.mozilla.org/en-US/docs/Web/API/Element/matches#Polyfill
		if (!Element.prototype.matches) {
			Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
		}

		var LOADING_MESSAGE = 'Loading…';
		var FAILURE_MESSAGE = function (status, message) {
			return '✖ Error ' + status + ' while fetching file: ' + message;
		};
		var FAILURE_EMPTY_MESSAGE = '✖ Error: File does not exist or is empty';

		var EXTENSIONS = {
			'js': 'javascript',
			'py': 'python',
			'rb': 'ruby',
			'ps1': 'powershell',
			'psm1': 'powershell',
			'sh': 'bash',
			'bat': 'batch',
			'h': 'c',
			'tex': 'latex'
		};

		var STATUS_ATTR = 'data-src-status';
		var STATUS_LOADING = 'loading';
		var STATUS_LOADED = 'loaded';
		var STATUS_FAILED = 'failed';

		var SELECTOR = 'pre[data-src]:not([' + STATUS_ATTR + '="' + STATUS_LOADED + '"])'
			+ ':not([' + STATUS_ATTR + '="' + STATUS_LOADING + '"])';

		/**
		 * Loads the given file.
		 *
		 * @param {string} src The URL or path of the source file to load.
		 * @param {(result: string) => void} success
		 * @param {(reason: string) => void} error
		 */
		function loadFile(src, success, error) {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', src, true);
			xhr.onreadystatechange = function () {
				if (xhr.readyState == 4) {
					if (xhr.status < 400 && xhr.responseText) {
						success(xhr.responseText);
					} else {
						if (xhr.status >= 400) {
							error(FAILURE_MESSAGE(xhr.status, xhr.statusText));
						} else {
							error(FAILURE_EMPTY_MESSAGE);
						}
					}
				}
			};
			xhr.send(null);
		}

		/**
		 * Parses the given range.
		 *
		 * This returns a range with inclusive ends.
		 *
		 * @param {string | null | undefined} range
		 * @returns {[number, number | undefined] | undefined}
		 */
		function parseRange(range) {
			var m = /^\s*(\d+)\s*(?:(,)\s*(?:(\d+)\s*)?)?$/.exec(range || '');
			if (m) {
				var start = Number(m[1]);
				var comma = m[2];
				var end = m[3];

				if (!comma) {
					return [start, start];
				}
				if (!end) {
					return [start, undefined];
				}
				return [start, Number(end)];
			}
			return undefined;
		}

		Prism.hooks.add('before-highlightall', function (env) {
			env.selector += ', ' + SELECTOR;
		});

		Prism.hooks.add('before-sanity-check', function (env) {
			var pre = /** @type {HTMLPreElement} */ (env.element);
			if (pre.matches(SELECTOR)) {
				env.code = ''; // fast-path the whole thing and go to complete

				pre.setAttribute(STATUS_ATTR, STATUS_LOADING); // mark as loading

				// add code element with loading message
				var code = pre.appendChild(document.createElement('CODE'));
				code.textContent = LOADING_MESSAGE;

				var src = pre.getAttribute('data-src');

				var language = env.language;
				if (language === 'none') {
					// the language might be 'none' because there is no language set;
					// in this case, we want to use the extension as the language
					var extension = (/\.(\w+)$/.exec(src) || [, 'none'])[1];
					language = EXTENSIONS[extension] || extension;
				}

				// set language classes
				Prism.util.setLanguage(code, language);
				Prism.util.setLanguage(pre, language);

				// preload the language
				var autoloader = Prism.plugins.autoloader;
				if (autoloader) {
					autoloader.loadLanguages(language);
				}

				// load file
				loadFile(
					src,
					function (text) {
						// mark as loaded
						pre.setAttribute(STATUS_ATTR, STATUS_LOADED);

						// handle data-range
						var range = parseRange(pre.getAttribute('data-range'));
						if (range) {
							var lines = text.split(/\r\n?|\n/g);

							// the range is one-based and inclusive on both ends
							var start = range[0];
							var end = range[1] == null ? lines.length : range[1];

							if (start < 0) { start += lines.length; }
							start = Math.max(0, Math.min(start - 1, lines.length));
							if (end < 0) { end += lines.length; }
							end = Math.max(0, Math.min(end, lines.length));

							text = lines.slice(start, end).join('\n');

							// add data-start for line numbers
							if (!pre.hasAttribute('data-start')) {
								pre.setAttribute('data-start', String(start + 1));
							}
						}

						// highlight code
						code.textContent = text;
						Prism.highlightElement(code);
					},
					function (error) {
						// mark as failed
						pre.setAttribute(STATUS_ATTR, STATUS_FAILED);

						code.textContent = error;
					}
				);
			}
		});

		Prism.plugins.fileHighlight = {
			/**
			 * Executes the File Highlight plugin for all matching `pre` elements under the given container.
			 *
			 * Note: Elements which are already loaded or currently loading will not be touched by this method.
			 *
			 * @param {ParentNode} [container=document]
			 */
			highlight: function highlight(container) {
				var elements = (container || document).querySelectorAll(SELECTOR);

				for (var i = 0, element; (element = elements[i++]);) {
					Prism.highlightElement(element);
				}
			}
		};

		var logged = false;
		/** @deprecated Use `Prism.plugins.fileHighlight.highlight` instead. */
		Prism.fileHighlight = function () {
			if (!logged) {
				console.warn('Prism.fileHighlight is deprecated. Use `Prism.plugins.fileHighlight.highlight` instead.');
				logged = true;
			}
			Prism.plugins.fileHighlight.highlight.apply(this, arguments);
		};

	}()); 
} (prism));

Prism.languages.clike = {
	'comment': [
		{
			pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
			lookbehind: true,
			greedy: true
		},
		{
			pattern: /(^|[^\\:])\/\/.*/,
			lookbehind: true,
			greedy: true
		}
	],
	'string': {
		pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
		greedy: true
	},
	'class-name': {
		pattern: /(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,
		lookbehind: true,
		inside: {
			'punctuation': /[.\\]/
		}
	},
	'keyword': /\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/,
	'boolean': /\b(?:false|true)\b/,
	'function': /\b\w+(?=\()/,
	'number': /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
	'operator': /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
	'punctuation': /[{}[\];(),.:]/
};

Prism.languages.javascript = Prism.languages.extend('clike', {
	'class-name': [
		Prism.languages.clike['class-name'],
		{
			pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,
			lookbehind: true
		}
	],
	'keyword': [
		{
			pattern: /((?:^|\})\s*)catch\b/,
			lookbehind: true
		},
		{
			pattern: /(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
			lookbehind: true
		},
	],
	// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
	'function': /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
	'number': {
		pattern: RegExp(
			/(^|[^\w$])/.source +
			'(?:' +
			(
				// constant
				/NaN|Infinity/.source +
				'|' +
				// binary integer
				/0[bB][01]+(?:_[01]+)*n?/.source +
				'|' +
				// octal integer
				/0[oO][0-7]+(?:_[0-7]+)*n?/.source +
				'|' +
				// hexadecimal integer
				/0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source +
				'|' +
				// decimal bigint
				/\d+(?:_\d+)*n/.source +
				'|' +
				// decimal number (integer or float) but no bigint
				/(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/.source
			) +
			')' +
			/(?![\w$])/.source
		),
		lookbehind: true
	},
	'operator': /--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/
});

Prism.languages.javascript['class-name'][0].pattern = /(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/;

Prism.languages.insertBefore('javascript', 'keyword', {
	'regex': {
		pattern: RegExp(
			// lookbehind
			// eslint-disable-next-line regexp/no-dupe-characters-character-class
			/((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)/.source +
			// Regex pattern:
			// There are 2 regex patterns here. The RegExp set notation proposal added support for nested character
			// classes if the `v` flag is present. Unfortunately, nested CCs are both context-free and incompatible
			// with the only syntax, so we have to define 2 different regex patterns.
			/\//.source +
			'(?:' +
			/(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}/.source +
			'|' +
			// `v` flag syntax. This supports 3 levels of nested character classes.
			/(?:\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7}/.source +
			')' +
			// lookahead
			/(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/.source
		),
		lookbehind: true,
		greedy: true,
		inside: {
			'regex-source': {
				pattern: /^(\/)[\s\S]+(?=\/[a-z]*$)/,
				lookbehind: true,
				alias: 'language-regex',
				inside: Prism.languages.regex
			},
			'regex-delimiter': /^\/|\/$/,
			'regex-flags': /^[a-z]+$/,
		}
	},
	// This must be declared before keyword because we use "function" inside the look-forward
	'function-variable': {
		pattern: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,
		alias: 'function'
	},
	'parameter': [
		{
			pattern: /(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,
			lookbehind: true,
			inside: Prism.languages.javascript
		},
		{
			pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,
			lookbehind: true,
			inside: Prism.languages.javascript
		},
		{
			pattern: /(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,
			lookbehind: true,
			inside: Prism.languages.javascript
		},
		{
			pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,
			lookbehind: true,
			inside: Prism.languages.javascript
		}
	],
	'constant': /\b[A-Z](?:[A-Z_]|\dx?)*\b/
});

Prism.languages.insertBefore('javascript', 'string', {
	'hashbang': {
		pattern: /^#!.*/,
		greedy: true,
		alias: 'comment'
	},
	'template-string': {
		pattern: /`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,
		greedy: true,
		inside: {
			'template-punctuation': {
				pattern: /^`|`$/,
				alias: 'string'
			},
			'interpolation': {
				pattern: /((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,
				lookbehind: true,
				inside: {
					'interpolation-punctuation': {
						pattern: /^\$\{|\}$/,
						alias: 'punctuation'
					},
					rest: Prism.languages.javascript
				}
			},
			'string': /[\s\S]+/
		}
	},
	'string-property': {
		pattern: /((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,
		lookbehind: true,
		greedy: true,
		alias: 'property'
	}
});

Prism.languages.insertBefore('javascript', 'operator', {
	'literal-property': {
		pattern: /((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,
		lookbehind: true,
		alias: 'property'
	},
});

if (Prism.languages.markup) {
	Prism.languages.markup.tag.addInlined('script', 'javascript');

	// add attribute support for all DOM events.
	// https://developer.mozilla.org/en-US/docs/Web/Events#Standard_events
	Prism.languages.markup.tag.addAttribute(
		/on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source,
		'javascript'
	);
}

Prism.languages.js = Prism.languages.javascript;

Prism.languages.markup = {
	'comment': {
		pattern: /<!--(?:(?!<!--)[\s\S])*?-->/,
		greedy: true
	},
	'prolog': {
		pattern: /<\?[\s\S]+?\?>/,
		greedy: true
	},
	'doctype': {
		// https://www.w3.org/TR/xml/#NT-doctypedecl
		pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,
		greedy: true,
		inside: {
			'internal-subset': {
				pattern: /(^[^\[]*\[)[\s\S]+(?=\]>$)/,
				lookbehind: true,
				greedy: true,
				inside: null // see below
			},
			'string': {
				pattern: /"[^"]*"|'[^']*'/,
				greedy: true
			},
			'punctuation': /^<!|>$|[[\]]/,
			'doctype-tag': /^DOCTYPE/i,
			'name': /[^\s<>'"]+/
		}
	},
	'cdata': {
		pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
		greedy: true
	},
	'tag': {
		pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,
		greedy: true,
		inside: {
			'tag': {
				pattern: /^<\/?[^\s>\/]+/,
				inside: {
					'punctuation': /^<\/?/,
					'namespace': /^[^\s>\/:]+:/
				}
			},
			'special-attr': [],
			'attr-value': {
				pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,
				inside: {
					'punctuation': [
						{
							pattern: /^=/,
							alias: 'attr-equals'
						},
						{
							pattern: /^(\s*)["']|["']$/,
							lookbehind: true
						}
					]
				}
			},
			'punctuation': /\/?>/,
			'attr-name': {
				pattern: /[^\s>\/]+/,
				inside: {
					'namespace': /^[^\s>\/:]+:/
				}
			}

		}
	},
	'entity': [
		{
			pattern: /&[\da-z]{1,8};/i,
			alias: 'named-entity'
		},
		/&#x?[\da-f]{1,8};/i
	]
};

Prism.languages.markup['tag'].inside['attr-value'].inside['entity'] =
	Prism.languages.markup['entity'];
Prism.languages.markup['doctype'].inside['internal-subset'].inside = Prism.languages.markup;

// Plugin to make entity title show the real entity, idea by Roman Komarov
Prism.hooks.add('wrap', function (env) {

	if (env.type === 'entity') {
		env.attributes['title'] = env.content.replace(/&amp;/, '&');
	}
});

Object.defineProperty(Prism.languages.markup.tag, 'addInlined', {
	/**
	 * Adds an inlined language to markup.
	 *
	 * An example of an inlined language is CSS with `<style>` tags.
	 *
	 * @param {string} tagName The name of the tag that contains the inlined language. This name will be treated as
	 * case insensitive.
	 * @param {string} lang The language key.
	 * @example
	 * addInlined('style', 'css');
	 */
	value: function addInlined(tagName, lang) {
		var includedCdataInside = {};
		includedCdataInside['language-' + lang] = {
			pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
			lookbehind: true,
			inside: Prism.languages[lang]
		};
		includedCdataInside['cdata'] = /^<!\[CDATA\[|\]\]>$/i;

		var inside = {
			'included-cdata': {
				pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
				inside: includedCdataInside
			}
		};
		inside['language-' + lang] = {
			pattern: /[\s\S]+/,
			inside: Prism.languages[lang]
		};

		var def = {};
		def[tagName] = {
			pattern: RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g, function () { return tagName; }), 'i'),
			lookbehind: true,
			greedy: true,
			inside: inside
		};

		Prism.languages.insertBefore('markup', 'cdata', def);
	}
});
Object.defineProperty(Prism.languages.markup.tag, 'addAttribute', {
	/**
	 * Adds an pattern to highlight languages embedded in HTML attributes.
	 *
	 * An example of an inlined language is CSS with `style` attributes.
	 *
	 * @param {string} attrName The name of the tag that contains the inlined language. This name will be treated as
	 * case insensitive.
	 * @param {string} lang The language key.
	 * @example
	 * addAttribute('style', 'css');
	 */
	value: function (attrName, lang) {
		Prism.languages.markup.tag.inside['special-attr'].push({
			pattern: RegExp(
				/(^|["'\s])/.source + '(?:' + attrName + ')' + /\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,
				'i'
			),
			lookbehind: true,
			inside: {
				'attr-name': /^[^\s=]+/,
				'attr-value': {
					pattern: /=[\s\S]+/,
					inside: {
						'value': {
							pattern: /(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,
							lookbehind: true,
							alias: [lang, 'language-' + lang],
							inside: Prism.languages[lang]
						},
						'punctuation': [
							{
								pattern: /^=/,
								alias: 'attr-equals'
							},
							/"|'/
						]
					}
				}
			}
		});
	}
});

Prism.languages.html = Prism.languages.markup;
Prism.languages.mathml = Prism.languages.markup;
Prism.languages.svg = Prism.languages.markup;

Prism.languages.xml = Prism.languages.extend('markup', {});
Prism.languages.ssml = Prism.languages.xml;
Prism.languages.atom = Prism.languages.xml;
Prism.languages.rss = Prism.languages.xml;

(function (Prism) {

	// Allow only one line break
	var inner = /(?:\\.|[^\\\n\r]|(?:\n|\r\n?)(?![\r\n]))/.source;

	/**
	 * This function is intended for the creation of the bold or italic pattern.
	 *
	 * This also adds a lookbehind group to the given pattern to ensure that the pattern is not backslash-escaped.
	 *
	 * _Note:_ Keep in mind that this adds a capturing group.
	 *
	 * @param {string} pattern
	 * @returns {RegExp}
	 */
	function createInline(pattern) {
		pattern = pattern.replace(/<inner>/g, function () { return inner; });
		return RegExp(/((?:^|[^\\])(?:\\{2})*)/.source + '(?:' + pattern + ')');
	}


	var tableCell = /(?:\\.|``(?:[^`\r\n]|`(?!`))+``|`[^`\r\n]+`|[^\\|\r\n`])+/.source;
	var tableRow = /\|?__(?:\|__)+\|?(?:(?:\n|\r\n?)|(?![\s\S]))/.source.replace(/__/g, function () { return tableCell; });
	var tableLine = /\|?[ \t]*:?-{3,}:?[ \t]*(?:\|[ \t]*:?-{3,}:?[ \t]*)+\|?(?:\n|\r\n?)/.source;


	Prism.languages.markdown = Prism.languages.extend('markup', {});
	Prism.languages.insertBefore('markdown', 'prolog', {
		'front-matter-block': {
			pattern: /(^(?:\s*[\r\n])?)---(?!.)[\s\S]*?[\r\n]---(?!.)/,
			lookbehind: true,
			greedy: true,
			inside: {
				'punctuation': /^---|---$/,
				'front-matter': {
					pattern: /\S+(?:\s+\S+)*/,
					alias: ['yaml', 'language-yaml'],
					inside: Prism.languages.yaml
				}
			}
		},
		'blockquote': {
			// > ...
			pattern: /^>(?:[\t ]*>)*/m,
			alias: 'punctuation'
		},
		'table': {
			pattern: RegExp('^' + tableRow + tableLine + '(?:' + tableRow + ')*', 'm'),
			inside: {
				'table-data-rows': {
					pattern: RegExp('^(' + tableRow + tableLine + ')(?:' + tableRow + ')*$'),
					lookbehind: true,
					inside: {
						'table-data': {
							pattern: RegExp(tableCell),
							inside: Prism.languages.markdown
						},
						'punctuation': /\|/
					}
				},
				'table-line': {
					pattern: RegExp('^(' + tableRow + ')' + tableLine + '$'),
					lookbehind: true,
					inside: {
						'punctuation': /\||:?-{3,}:?/
					}
				},
				'table-header-row': {
					pattern: RegExp('^' + tableRow + '$'),
					inside: {
						'table-header': {
							pattern: RegExp(tableCell),
							alias: 'important',
							inside: Prism.languages.markdown
						},
						'punctuation': /\|/
					}
				}
			}
		},
		'code': [
			{
				// Prefixed by 4 spaces or 1 tab and preceded by an empty line
				pattern: /((?:^|\n)[ \t]*\n|(?:^|\r\n?)[ \t]*\r\n?)(?: {4}|\t).+(?:(?:\n|\r\n?)(?: {4}|\t).+)*/,
				lookbehind: true,
				alias: 'keyword'
			},
			{
				// ```optional language
				// code block
				// ```
				pattern: /^```[\s\S]*?^```$/m,
				greedy: true,
				inside: {
					'code-block': {
						pattern: /^(```.*(?:\n|\r\n?))[\s\S]+?(?=(?:\n|\r\n?)^```$)/m,
						lookbehind: true
					},
					'code-language': {
						pattern: /^(```).+/,
						lookbehind: true
					},
					'punctuation': /```/
				}
			}
		],
		'title': [
			{
				// title 1
				// =======

				// title 2
				// -------
				pattern: /\S.*(?:\n|\r\n?)(?:==+|--+)(?=[ \t]*$)/m,
				alias: 'important',
				inside: {
					punctuation: /==+$|--+$/
				}
			},
			{
				// # title 1
				// ###### title 6
				pattern: /(^\s*)#.+/m,
				lookbehind: true,
				alias: 'important',
				inside: {
					punctuation: /^#+|#+$/
				}
			}
		],
		'hr': {
			// ***
			// ---
			// * * *
			// -----------
			pattern: /(^\s*)([*-])(?:[\t ]*\2){2,}(?=\s*$)/m,
			lookbehind: true,
			alias: 'punctuation'
		},
		'list': {
			// * item
			// + item
			// - item
			// 1. item
			pattern: /(^\s*)(?:[*+-]|\d+\.)(?=[\t ].)/m,
			lookbehind: true,
			alias: 'punctuation'
		},
		'url-reference': {
			// [id]: http://example.com "Optional title"
			// [id]: http://example.com 'Optional title'
			// [id]: http://example.com (Optional title)
			// [id]: <http://example.com> "Optional title"
			pattern: /!?\[[^\]]+\]:[\t ]+(?:\S+|<(?:\\.|[^>\\])+>)(?:[\t ]+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?/,
			inside: {
				'variable': {
					pattern: /^(!?\[)[^\]]+/,
					lookbehind: true
				},
				'string': /(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))$/,
				'punctuation': /^[\[\]!:]|[<>]/
			},
			alias: 'url'
		},
		'bold': {
			// **strong**
			// __strong__

			// allow one nested instance of italic text using the same delimiter
			pattern: createInline(/\b__(?:(?!_)<inner>|_(?:(?!_)<inner>)+_)+__\b|\*\*(?:(?!\*)<inner>|\*(?:(?!\*)<inner>)+\*)+\*\*/.source),
			lookbehind: true,
			greedy: true,
			inside: {
				'content': {
					pattern: /(^..)[\s\S]+(?=..$)/,
					lookbehind: true,
					inside: {} // see below
				},
				'punctuation': /\*\*|__/
			}
		},
		'italic': {
			// *em*
			// _em_

			// allow one nested instance of bold text using the same delimiter
			pattern: createInline(/\b_(?:(?!_)<inner>|__(?:(?!_)<inner>)+__)+_\b|\*(?:(?!\*)<inner>|\*\*(?:(?!\*)<inner>)+\*\*)+\*/.source),
			lookbehind: true,
			greedy: true,
			inside: {
				'content': {
					pattern: /(^.)[\s\S]+(?=.$)/,
					lookbehind: true,
					inside: {} // see below
				},
				'punctuation': /[*_]/
			}
		},
		'strike': {
			// ~~strike through~~
			// ~strike~
			// eslint-disable-next-line regexp/strict
			pattern: createInline(/(~~?)(?:(?!~)<inner>)+\2/.source),
			lookbehind: true,
			greedy: true,
			inside: {
				'content': {
					pattern: /(^~~?)[\s\S]+(?=\1$)/,
					lookbehind: true,
					inside: {} // see below
				},
				'punctuation': /~~?/
			}
		},
		'code-snippet': {
			// `code`
			// ``code``
			pattern: /(^|[^\\`])(?:``[^`\r\n]+(?:`[^`\r\n]+)*``(?!`)|`[^`\r\n]+`(?!`))/,
			lookbehind: true,
			greedy: true,
			alias: ['code', 'keyword']
		},
		'url': {
			// [example](http://example.com "Optional title")
			// [example][id]
			// [example] [id]
			pattern: createInline(/!?\[(?:(?!\])<inner>)+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)|[ \t]?\[(?:(?!\])<inner>)+\])/.source),
			lookbehind: true,
			greedy: true,
			inside: {
				'operator': /^!/,
				'content': {
					pattern: /(^\[)[^\]]+(?=\])/,
					lookbehind: true,
					inside: {} // see below
				},
				'variable': {
					pattern: /(^\][ \t]?\[)[^\]]+(?=\]$)/,
					lookbehind: true
				},
				'url': {
					pattern: /(^\]\()[^\s)]+/,
					lookbehind: true
				},
				'string': {
					pattern: /(^[ \t]+)"(?:\\.|[^"\\])*"(?=\)$)/,
					lookbehind: true
				}
			}
		}
	});

	['url', 'bold', 'italic', 'strike'].forEach(function (token) {
		['url', 'bold', 'italic', 'strike', 'code-snippet'].forEach(function (inside) {
			if (token !== inside) {
				Prism.languages.markdown[token].inside.content.inside[inside] = Prism.languages.markdown[inside];
			}
		});
	});

	Prism.hooks.add('after-tokenize', function (env) {
		if (env.language !== 'markdown' && env.language !== 'md') {
			return;
		}

		function walkTokens(tokens) {
			if (!tokens || typeof tokens === 'string') {
				return;
			}

			for (var i = 0, l = tokens.length; i < l; i++) {
				var token = tokens[i];

				if (token.type !== 'code') {
					walkTokens(token.content);
					continue;
				}

				/*
				 * Add the correct `language-xxxx` class to this code block. Keep in mind that the `code-language` token
				 * is optional. But the grammar is defined so that there is only one case we have to handle:
				 *
				 * token.content = [
				 *     <span class="punctuation">```</span>,
				 *     <span class="code-language">xxxx</span>,
				 *     '\n', // exactly one new lines (\r or \n or \r\n)
				 *     <span class="code-block">...</span>,
				 *     '\n', // exactly one new lines again
				 *     <span class="punctuation">```</span>
				 * ];
				 */

				var codeLang = token.content[1];
				var codeBlock = token.content[3];

				if (codeLang && codeBlock &&
					codeLang.type === 'code-language' && codeBlock.type === 'code-block' &&
					typeof codeLang.content === 'string') {

					// this might be a language that Prism does not support

					// do some replacements to support C++, C#, and F#
					var lang = codeLang.content.replace(/\b#/g, 'sharp').replace(/\b\+\+/g, 'pp');
					// only use the first word
					lang = (/[a-z][\w-]*/i.exec(lang) || [''])[0].toLowerCase();
					var alias = 'language-' + lang;

					// add alias
					if (!codeBlock.alias) {
						codeBlock.alias = [alias];
					} else if (typeof codeBlock.alias === 'string') {
						codeBlock.alias = [codeBlock.alias, alias];
					} else {
						codeBlock.alias.push(alias);
					}
				}
			}
		}

		walkTokens(env.tokens);
	});

	Prism.hooks.add('wrap', function (env) {
		if (env.type !== 'code-block') {
			return;
		}

		var codeLang = '';
		for (var i = 0, l = env.classes.length; i < l; i++) {
			var cls = env.classes[i];
			var match = /language-(.+)/.exec(cls);
			if (match) {
				codeLang = match[1];
				break;
			}
		}

		var grammar = Prism.languages[codeLang];

		if (!grammar) {
			if (codeLang && codeLang !== 'none' && Prism.plugins.autoloader) {
				var id = 'md-' + new Date().valueOf() + '-' + Math.floor(Math.random() * 1e16);
				env.attributes['id'] = id;

				Prism.plugins.autoloader.loadLanguages(codeLang, function () {
					var ele = document.getElementById(id);
					if (ele) {
						ele.innerHTML = Prism.highlight(ele.textContent, Prism.languages[codeLang], codeLang);
					}
				});
			}
		} else {
			env.content = Prism.highlight(textContent(env.content), grammar, codeLang);
		}
	});

	var tagPattern = RegExp(Prism.languages.markup.tag.pattern.source, 'gi');

	/**
	 * A list of known entity names.
	 *
	 * This will always be incomplete to save space. The current list is the one used by lowdash's unescape function.
	 *
	 * @see {@link https://github.com/lodash/lodash/blob/2da024c3b4f9947a48517639de7560457cd4ec6c/unescape.js#L2}
	 */
	var KNOWN_ENTITY_NAMES = {
		'amp': '&',
		'lt': '<',
		'gt': '>',
		'quot': '"',
	};

	// IE 11 doesn't support `String.fromCodePoint`
	var fromCodePoint = String.fromCodePoint || String.fromCharCode;

	/**
	 * Returns the text content of a given HTML source code string.
	 *
	 * @param {string} html
	 * @returns {string}
	 */
	function textContent(html) {
		// remove all tags
		var text = html.replace(tagPattern, '');

		// decode known entities
		text = text.replace(/&(\w{1,8}|#x?[\da-f]{1,8});/gi, function (m, code) {
			code = code.toLowerCase();

			if (code[0] === '#') {
				var value;
				if (code[1] === 'x') {
					value = parseInt(code.slice(2), 16);
				} else {
					value = Number(code.slice(1));
				}

				return fromCodePoint(value);
			} else {
				var known = KNOWN_ENTITY_NAMES[code];
				if (known) {
					return known;
				}

				// unable to decode
				return m;
			}
		});

		return text;
	}

	Prism.languages.md = Prism.languages.markdown;

}(Prism));

Prism.languages.c = Prism.languages.extend('clike', {
	'comment': {
		pattern: /\/\/(?:[^\r\n\\]|\\(?:\r\n?|\n|(?![\r\n])))*|\/\*[\s\S]*?(?:\*\/|$)/,
		greedy: true
	},
	'string': {
		// https://en.cppreference.com/w/c/language/string_literal
		pattern: /"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"/,
		greedy: true
	},
	'class-name': {
		pattern: /(\b(?:enum|struct)\s+(?:__attribute__\s*\(\([\s\S]*?\)\)\s*)?)\w+|\b[a-z]\w*_t\b/,
		lookbehind: true
	},
	'keyword': /\b(?:_Alignas|_Alignof|_Atomic|_Bool|_Complex|_Generic|_Imaginary|_Noreturn|_Static_assert|_Thread_local|__attribute__|asm|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|inline|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|typeof|union|unsigned|void|volatile|while)\b/,
	'function': /\b[a-z_]\w*(?=\s*\()/i,
	'number': /(?:\b0x(?:[\da-f]+(?:\.[\da-f]*)?|\.[\da-f]+)(?:p[+-]?\d+)?|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?)[ful]{0,4}/i,
	'operator': />>=?|<<=?|->|([-+&|:])\1|[?:~]|[-+*/%&|^!=<>]=?/
});

Prism.languages.insertBefore('c', 'string', {
	'char': {
		// https://en.cppreference.com/w/c/language/character_constant
		pattern: /'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n]){0,32}'/,
		greedy: true
	}
});

Prism.languages.insertBefore('c', 'string', {
	'macro': {
		// allow for multiline macro definitions
		// spaces after the # character compile fine with gcc
		pattern: /(^[\t ]*)#\s*[a-z](?:[^\r\n\\/]|\/(?!\*)|\/\*(?:[^*]|\*(?!\/))*\*\/|\\(?:\r\n|[\s\S]))*/im,
		lookbehind: true,
		greedy: true,
		alias: 'property',
		inside: {
			'string': [
				{
					// highlight the path of the include statement as a string
					pattern: /^(#\s*include\s*)<[^>]+>/,
					lookbehind: true
				},
				Prism.languages.c['string']
			],
			'char': Prism.languages.c['char'],
			'comment': Prism.languages.c['comment'],
			'macro-name': [
				{
					pattern: /(^#\s*define\s+)\w+\b(?!\()/i,
					lookbehind: true
				},
				{
					pattern: /(^#\s*define\s+)\w+\b(?=\()/i,
					lookbehind: true,
					alias: 'function'
				}
			],
			// highlight macro directives as keywords
			'directive': {
				pattern: /^(#\s*)[a-z]+/,
				lookbehind: true,
				alias: 'keyword'
			},
			'directive-hash': /^#/,
			'punctuation': /##|\\(?=[\r\n])/,
			'expression': {
				pattern: /\S[\s\S]*/,
				inside: Prism.languages.c
			}
		}
	}
});

Prism.languages.insertBefore('c', 'function', {
	// highlight predefined macros as constants
	'constant': /\b(?:EOF|NULL|SEEK_CUR|SEEK_END|SEEK_SET|__DATE__|__FILE__|__LINE__|__TIMESTAMP__|__TIME__|__func__|stderr|stdin|stdout)\b/
});

delete Prism.languages.c['boolean'];

(function (Prism) {

	var string = /(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/;

	Prism.languages.css = {
		'comment': /\/\*[\s\S]*?\*\//,
		'atrule': {
			pattern: RegExp('@[\\w-](?:' + /[^;{\s"']|\s+(?!\s)/.source + '|' + string.source + ')*?' + /(?:;|(?=\s*\{))/.source),
			inside: {
				'rule': /^@[\w-]+/,
				'selector-function-argument': {
					pattern: /(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/,
					lookbehind: true,
					alias: 'selector'
				},
				'keyword': {
					pattern: /(^|[^\w-])(?:and|not|only|or)(?![\w-])/,
					lookbehind: true
				}
				// See rest below
			}
		},
		'url': {
			// https://drafts.csswg.org/css-values-3/#urls
			pattern: RegExp('\\burl\\((?:' + string.source + '|' + /(?:[^\\\r\n()"']|\\[\s\S])*/.source + ')\\)', 'i'),
			greedy: true,
			inside: {
				'function': /^url/i,
				'punctuation': /^\(|\)$/,
				'string': {
					pattern: RegExp('^' + string.source + '$'),
					alias: 'url'
				}
			}
		},
		'selector': {
			pattern: RegExp('(^|[{}\\s])[^{}\\s](?:[^{};"\'\\s]|\\s+(?![\\s{])|' + string.source + ')*(?=\\s*\\{)'),
			lookbehind: true
		},
		'string': {
			pattern: string,
			greedy: true
		},
		'property': {
			pattern: /(^|[^-\w\xA0-\uFFFF])(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i,
			lookbehind: true
		},
		'important': /!important\b/i,
		'function': {
			pattern: /(^|[^-a-z0-9])[-a-z0-9]+(?=\()/i,
			lookbehind: true
		},
		'punctuation': /[(){};:,]/
	};

	Prism.languages.css['atrule'].inside.rest = Prism.languages.css;

	var markup = Prism.languages.markup;
	if (markup) {
		markup.tag.addInlined('style', 'css');
		markup.tag.addAttribute('style', 'css');
	}

}(Prism));

Prism.languages.objectivec = Prism.languages.extend('c', {
	'string': {
		pattern: /@?"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"/,
		greedy: true
	},
	'keyword': /\b(?:asm|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|in|inline|int|long|register|return|self|short|signed|sizeof|static|struct|super|switch|typedef|typeof|union|unsigned|void|volatile|while)\b|(?:@interface|@end|@implementation|@protocol|@class|@public|@protected|@private|@property|@try|@catch|@finally|@throw|@synthesize|@dynamic|@selector)\b/,
	'operator': /-[->]?|\+\+?|!=?|<<?=?|>>?=?|==?|&&?|\|\|?|[~^%?*\/@]/
});

delete Prism.languages.objectivec['class-name'];

Prism.languages.objc = Prism.languages.objectivec;

Prism.languages.sql = {
	'comment': {
		pattern: /(^|[^\\])(?:\/\*[\s\S]*?\*\/|(?:--|\/\/|#).*)/,
		lookbehind: true
	},
	'variable': [
		{
			pattern: /@(["'`])(?:\\[\s\S]|(?!\1)[^\\])+\1/,
			greedy: true
		},
		/@[\w.$]+/
	],
	'string': {
		pattern: /(^|[^@\\])("|')(?:\\[\s\S]|(?!\2)[^\\]|\2\2)*\2/,
		greedy: true,
		lookbehind: true
	},
	'identifier': {
		pattern: /(^|[^@\\])`(?:\\[\s\S]|[^`\\]|``)*`/,
		greedy: true,
		lookbehind: true,
		inside: {
			'punctuation': /^`|`$/
		}
	},
	'function': /\b(?:AVG|COUNT|FIRST|FORMAT|LAST|LCASE|LEN|MAX|MID|MIN|MOD|NOW|ROUND|SUM|UCASE)(?=\s*\()/i, // Should we highlight user defined functions too?
	'keyword': /\b(?:ACTION|ADD|AFTER|ALGORITHM|ALL|ALTER|ANALYZE|ANY|APPLY|AS|ASC|AUTHORIZATION|AUTO_INCREMENT|BACKUP|BDB|BEGIN|BERKELEYDB|BIGINT|BINARY|BIT|BLOB|BOOL|BOOLEAN|BREAK|BROWSE|BTREE|BULK|BY|CALL|CASCADED?|CASE|CHAIN|CHAR(?:ACTER|SET)?|CHECK(?:POINT)?|CLOSE|CLUSTERED|COALESCE|COLLATE|COLUMNS?|COMMENT|COMMIT(?:TED)?|COMPUTE|CONNECT|CONSISTENT|CONSTRAINT|CONTAINS(?:TABLE)?|CONTINUE|CONVERT|CREATE|CROSS|CURRENT(?:_DATE|_TIME|_TIMESTAMP|_USER)?|CURSOR|CYCLE|DATA(?:BASES?)?|DATE(?:TIME)?|DAY|DBCC|DEALLOCATE|DEC|DECIMAL|DECLARE|DEFAULT|DEFINER|DELAYED|DELETE|DELIMITERS?|DENY|DESC|DESCRIBE|DETERMINISTIC|DISABLE|DISCARD|DISK|DISTINCT|DISTINCTROW|DISTRIBUTED|DO|DOUBLE|DROP|DUMMY|DUMP(?:FILE)?|DUPLICATE|ELSE(?:IF)?|ENABLE|ENCLOSED|END|ENGINE|ENUM|ERRLVL|ERRORS|ESCAPED?|EXCEPT|EXEC(?:UTE)?|EXISTS|EXIT|EXPLAIN|EXTENDED|FETCH|FIELDS|FILE|FILLFACTOR|FIRST|FIXED|FLOAT|FOLLOWING|FOR(?: EACH ROW)?|FORCE|FOREIGN|FREETEXT(?:TABLE)?|FROM|FULL|FUNCTION|GEOMETRY(?:COLLECTION)?|GLOBAL|GOTO|GRANT|GROUP|HANDLER|HASH|HAVING|HOLDLOCK|HOUR|IDENTITY(?:COL|_INSERT)?|IF|IGNORE|IMPORT|INDEX|INFILE|INNER|INNODB|INOUT|INSERT|INT|INTEGER|INTERSECT|INTERVAL|INTO|INVOKER|ISOLATION|ITERATE|JOIN|KEYS?|KILL|LANGUAGE|LAST|LEAVE|LEFT|LEVEL|LIMIT|LINENO|LINES|LINESTRING|LOAD|LOCAL|LOCK|LONG(?:BLOB|TEXT)|LOOP|MATCH(?:ED)?|MEDIUM(?:BLOB|INT|TEXT)|MERGE|MIDDLEINT|MINUTE|MODE|MODIFIES|MODIFY|MONTH|MULTI(?:LINESTRING|POINT|POLYGON)|NATIONAL|NATURAL|NCHAR|NEXT|NO|NONCLUSTERED|NULLIF|NUMERIC|OFF?|OFFSETS?|ON|OPEN(?:DATASOURCE|QUERY|ROWSET)?|OPTIMIZE|OPTION(?:ALLY)?|ORDER|OUT(?:ER|FILE)?|OVER|PARTIAL|PARTITION|PERCENT|PIVOT|PLAN|POINT|POLYGON|PRECEDING|PRECISION|PREPARE|PREV|PRIMARY|PRINT|PRIVILEGES|PROC(?:EDURE)?|PUBLIC|PURGE|QUICK|RAISERROR|READS?|REAL|RECONFIGURE|REFERENCES|RELEASE|RENAME|REPEAT(?:ABLE)?|REPLACE|REPLICATION|REQUIRE|RESIGNAL|RESTORE|RESTRICT|RETURN(?:ING|S)?|REVOKE|RIGHT|ROLLBACK|ROUTINE|ROW(?:COUNT|GUIDCOL|S)?|RTREE|RULE|SAVE(?:POINT)?|SCHEMA|SECOND|SELECT|SERIAL(?:IZABLE)?|SESSION(?:_USER)?|SET(?:USER)?|SHARE|SHOW|SHUTDOWN|SIMPLE|SMALLINT|SNAPSHOT|SOME|SONAME|SQL|START(?:ING)?|STATISTICS|STATUS|STRIPED|SYSTEM_USER|TABLES?|TABLESPACE|TEMP(?:ORARY|TABLE)?|TERMINATED|TEXT(?:SIZE)?|THEN|TIME(?:STAMP)?|TINY(?:BLOB|INT|TEXT)|TOP?|TRAN(?:SACTIONS?)?|TRIGGER|TRUNCATE|TSEQUAL|TYPES?|UNBOUNDED|UNCOMMITTED|UNDEFINED|UNION|UNIQUE|UNLOCK|UNPIVOT|UNSIGNED|UPDATE(?:TEXT)?|USAGE|USE|USER|USING|VALUES?|VAR(?:BINARY|CHAR|CHARACTER|YING)|VIEW|WAITFOR|WARNINGS|WHEN|WHERE|WHILE|WITH(?: ROLLUP|IN)?|WORK|WRITE(?:TEXT)?|YEAR)\b/i,
	'boolean': /\b(?:FALSE|NULL|TRUE)\b/i,
	'number': /\b0x[\da-f]+\b|\b\d+(?:\.\d*)?|\B\.\d+\b/i,
	'operator': /[-+*\/=%^~]|&&?|\|\|?|!=?|<(?:=>?|<|>)?|>[>=]?|\b(?:AND|BETWEEN|DIV|ILIKE|IN|IS|LIKE|NOT|OR|REGEXP|RLIKE|SOUNDS LIKE|XOR)\b/i,
	'punctuation': /[;[\]()`,.]/
};

(function (Prism) {

	var powershell = Prism.languages.powershell = {
		'comment': [
			{
				pattern: /(^|[^`])<#[\s\S]*?#>/,
				lookbehind: true
			},
			{
				pattern: /(^|[^`])#.*/,
				lookbehind: true
			}
		],
		'string': [
			{
				pattern: /"(?:`[\s\S]|[^`"])*"/,
				greedy: true,
				inside: null // see below
			},
			{
				pattern: /'(?:[^']|'')*'/,
				greedy: true
			}
		],
		// Matches name spaces as well as casts, attribute decorators. Force starting with letter to avoid matching array indices
		// Supports two levels of nested brackets (e.g. `[OutputType([System.Collections.Generic.List[int]])]`)
		'namespace': /\[[a-z](?:\[(?:\[[^\]]*\]|[^\[\]])*\]|[^\[\]])*\]/i,
		'boolean': /\$(?:false|true)\b/i,
		'variable': /\$\w+\b/,
		// Cmdlets and aliases. Aliases should come last, otherwise "write" gets preferred over "write-host" for example
		// Get-Command | ?{ $_.ModuleName -match "Microsoft.PowerShell.(Util|Core|Management)" }
		// Get-Alias | ?{ $_.ReferencedCommand.Module.Name -match "Microsoft.PowerShell.(Util|Core|Management)" }
		'function': [
			/\b(?:Add|Approve|Assert|Backup|Block|Checkpoint|Clear|Close|Compare|Complete|Compress|Confirm|Connect|Convert|ConvertFrom|ConvertTo|Copy|Debug|Deny|Disable|Disconnect|Dismount|Edit|Enable|Enter|Exit|Expand|Export|Find|ForEach|Format|Get|Grant|Group|Hide|Import|Initialize|Install|Invoke|Join|Limit|Lock|Measure|Merge|Move|New|Open|Optimize|Out|Ping|Pop|Protect|Publish|Push|Read|Receive|Redo|Register|Remove|Rename|Repair|Request|Reset|Resize|Resolve|Restart|Restore|Resume|Revoke|Save|Search|Select|Send|Set|Show|Skip|Sort|Split|Start|Step|Stop|Submit|Suspend|Switch|Sync|Tee|Test|Trace|Unblock|Undo|Uninstall|Unlock|Unprotect|Unpublish|Unregister|Update|Use|Wait|Watch|Where|Write)-[a-z]+\b/i,
			/\b(?:ac|cat|chdir|clc|cli|clp|clv|compare|copy|cp|cpi|cpp|cvpa|dbp|del|diff|dir|ebp|echo|epal|epcsv|epsn|erase|fc|fl|ft|fw|gal|gbp|gc|gci|gcs|gdr|gi|gl|gm|gp|gps|group|gsv|gu|gv|gwmi|iex|ii|ipal|ipcsv|ipsn|irm|iwmi|iwr|kill|lp|ls|measure|mi|mount|move|mp|mv|nal|ndr|ni|nv|ogv|popd|ps|pushd|pwd|rbp|rd|rdr|ren|ri|rm|rmdir|rni|rnp|rp|rv|rvpa|rwmi|sal|saps|sasv|sbp|sc|select|set|shcm|si|sl|sleep|sls|sort|sp|spps|spsv|start|sv|swmi|tee|trcm|type|write)\b/i
		],
		// per http://technet.microsoft.com/en-us/library/hh847744.aspx
		'keyword': /\b(?:Begin|Break|Catch|Class|Continue|Data|Define|Do|DynamicParam|Else|ElseIf|End|Exit|Filter|Finally|For|ForEach|From|Function|If|InlineScript|Parallel|Param|Process|Return|Sequence|Switch|Throw|Trap|Try|Until|Using|Var|While|Workflow)\b/i,
		'operator': {
			pattern: /(^|\W)(?:!|-(?:b?(?:and|x?or)|as|(?:Not)?(?:Contains|In|Like|Match)|eq|ge|gt|is(?:Not)?|Join|le|lt|ne|not|Replace|sh[lr])\b|-[-=]?|\+[+=]?|[*\/%]=?)/i,
			lookbehind: true
		},
		'punctuation': /[|{}[\];(),.]/
	};

	// Variable interpolation inside strings, and nested expressions
	powershell.string[0].inside = {
		'function': {
			// Allow for one level of nesting
			pattern: /(^|[^`])\$\((?:\$\([^\r\n()]*\)|(?!\$\()[^\r\n)])*\)/,
			lookbehind: true,
			inside: powershell
		},
		'boolean': powershell.boolean,
		'variable': powershell.variable,
	};

}(Prism));

Prism.languages.python = {
	'comment': {
		pattern: /(^|[^\\])#.*/,
		lookbehind: true,
		greedy: true
	},
	'string-interpolation': {
		pattern: /(?:f|fr|rf)(?:("""|''')[\s\S]*?\1|("|')(?:\\.|(?!\2)[^\\\r\n])*\2)/i,
		greedy: true,
		inside: {
			'interpolation': {
				// "{" <expression> <optional "!s", "!r", or "!a"> <optional ":" format specifier> "}"
				pattern: /((?:^|[^{])(?:\{\{)*)\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}])+\})+\})+\}/,
				lookbehind: true,
				inside: {
					'format-spec': {
						pattern: /(:)[^:(){}]+(?=\}$)/,
						lookbehind: true
					},
					'conversion-option': {
						pattern: /![sra](?=[:}]$)/,
						alias: 'punctuation'
					},
					rest: null
				}
			},
			'string': /[\s\S]+/
		}
	},
	'triple-quoted-string': {
		pattern: /(?:[rub]|br|rb)?("""|''')[\s\S]*?\1/i,
		greedy: true,
		alias: 'string'
	},
	'string': {
		pattern: /(?:[rub]|br|rb)?("|')(?:\\.|(?!\1)[^\\\r\n])*\1/i,
		greedy: true
	},
	'function': {
		pattern: /((?:^|\s)def[ \t]+)[a-zA-Z_]\w*(?=\s*\()/g,
		lookbehind: true
	},
	'class-name': {
		pattern: /(\bclass\s+)\w+/i,
		lookbehind: true
	},
	'decorator': {
		pattern: /(^[\t ]*)@\w+(?:\.\w+)*/m,
		lookbehind: true,
		alias: ['annotation', 'punctuation'],
		inside: {
			'punctuation': /\./
		}
	},
	'keyword': /\b(?:_(?=\s*:)|and|as|assert|async|await|break|case|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|match|nonlocal|not|or|pass|print|raise|return|try|while|with|yield)\b/,
	'builtin': /\b(?:__import__|abs|all|any|apply|ascii|basestring|bin|bool|buffer|bytearray|bytes|callable|chr|classmethod|cmp|coerce|compile|complex|delattr|dict|dir|divmod|enumerate|eval|execfile|file|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|intern|isinstance|issubclass|iter|len|list|locals|long|map|max|memoryview|min|next|object|oct|open|ord|pow|property|range|raw_input|reduce|reload|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|unichr|unicode|vars|xrange|zip)\b/,
	'boolean': /\b(?:False|None|True)\b/,
	'number': /\b0(?:b(?:_?[01])+|o(?:_?[0-7])+|x(?:_?[a-f0-9])+)\b|(?:\b\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\B\.\d+(?:_\d+)*)(?:e[+-]?\d+(?:_\d+)*)?j?(?!\w)/i,
	'operator': /[-+%=]=?|!=|:=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[&|^~]/,
	'punctuation': /[{}[\];(),.:]/
};

Prism.languages.python['string-interpolation'].inside['interpolation'].inside.rest = Prism.languages.python;

Prism.languages.py = Prism.languages.python;

(function (Prism) {

	var multilineComment = /\/\*(?:[^*/]|\*(?!\/)|\/(?!\*)|<self>)*\*\//.source;
	for (var i = 0; i < 2; i++) {
		// support 4 levels of nested comments
		multilineComment = multilineComment.replace(/<self>/g, function () { return multilineComment; });
	}
	multilineComment = multilineComment.replace(/<self>/g, function () { return /[^\s\S]/.source; });


	Prism.languages.rust = {
		'comment': [
			{
				pattern: RegExp(/(^|[^\\])/.source + multilineComment),
				lookbehind: true,
				greedy: true
			},
			{
				pattern: /(^|[^\\:])\/\/.*/,
				lookbehind: true,
				greedy: true
			}
		],
		'string': {
			pattern: /b?"(?:\\[\s\S]|[^\\"])*"|b?r(#*)"(?:[^"]|"(?!\1))*"\1/,
			greedy: true
		},
		'char': {
			pattern: /b?'(?:\\(?:x[0-7][\da-fA-F]|u\{(?:[\da-fA-F]_*){1,6}\}|.)|[^\\\r\n\t'])'/,
			greedy: true
		},
		'attribute': {
			pattern: /#!?\[(?:[^\[\]"]|"(?:\\[\s\S]|[^\\"])*")*\]/,
			greedy: true,
			alias: 'attr-name',
			inside: {
				'string': null // see below
			}
		},

		// Closure params should not be confused with bitwise OR |
		'closure-params': {
			pattern: /([=(,:]\s*|\bmove\s*)\|[^|]*\||\|[^|]*\|(?=\s*(?:\{|->))/,
			lookbehind: true,
			greedy: true,
			inside: {
				'closure-punctuation': {
					pattern: /^\||\|$/,
					alias: 'punctuation'
				},
				rest: null // see below
			}
		},

		'lifetime-annotation': {
			pattern: /'\w+/,
			alias: 'symbol'
		},

		'fragment-specifier': {
			pattern: /(\$\w+:)[a-z]+/,
			lookbehind: true,
			alias: 'punctuation'
		},
		'variable': /\$\w+/,

		'function-definition': {
			pattern: /(\bfn\s+)\w+/,
			lookbehind: true,
			alias: 'function'
		},
		'type-definition': {
			pattern: /(\b(?:enum|struct|trait|type|union)\s+)\w+/,
			lookbehind: true,
			alias: 'class-name'
		},
		'module-declaration': [
			{
				pattern: /(\b(?:crate|mod)\s+)[a-z][a-z_\d]*/,
				lookbehind: true,
				alias: 'namespace'
			},
			{
				pattern: /(\b(?:crate|self|super)\s*)::\s*[a-z][a-z_\d]*\b(?:\s*::(?:\s*[a-z][a-z_\d]*\s*::)*)?/,
				lookbehind: true,
				alias: 'namespace',
				inside: {
					'punctuation': /::/
				}
			}
		],
		'keyword': [
			// https://github.com/rust-lang/reference/blob/master/src/keywords.md
			/\b(?:Self|abstract|as|async|await|become|box|break|const|continue|crate|do|dyn|else|enum|extern|final|fn|for|if|impl|in|let|loop|macro|match|mod|move|mut|override|priv|pub|ref|return|self|static|struct|super|trait|try|type|typeof|union|unsafe|unsized|use|virtual|where|while|yield)\b/,
			// primitives and str
			// https://doc.rust-lang.org/stable/rust-by-example/primitives.html
			/\b(?:bool|char|f(?:32|64)|[ui](?:8|16|32|64|128|size)|str)\b/
		],

		// functions can technically start with an upper-case letter, but this will introduce a lot of false positives
		// and Rust's naming conventions recommend snake_case anyway.
		// https://doc.rust-lang.org/1.0.0/style/style/naming/README.html
		'function': /\b[a-z_]\w*(?=\s*(?:::\s*<|\())/,
		'macro': {
			pattern: /\b\w+!/,
			alias: 'property'
		},
		'constant': /\b[A-Z_][A-Z_\d]+\b/,
		'class-name': /\b[A-Z]\w*\b/,

		'namespace': {
			pattern: /(?:\b[a-z][a-z_\d]*\s*::\s*)*\b[a-z][a-z_\d]*\s*::(?!\s*<)/,
			inside: {
				'punctuation': /::/
			}
		},

		// Hex, oct, bin, dec numbers with visual separators and type suffix
		'number': /\b(?:0x[\dA-Fa-f](?:_?[\dA-Fa-f])*|0o[0-7](?:_?[0-7])*|0b[01](?:_?[01])*|(?:(?:\d(?:_?\d)*)?\.)?\d(?:_?\d)*(?:[Ee][+-]?\d+)?)(?:_?(?:f32|f64|[iu](?:8|16|32|64|size)?))?\b/,
		'boolean': /\b(?:false|true)\b/,
		'punctuation': /->|\.\.=|\.{1,3}|::|[{}[\];(),:]/,
		'operator': /[-+*\/%!^]=?|=[=>]?|&[&=]?|\|[|=]?|<<?=?|>>?=?|[@?]/
	};

	Prism.languages.rust['closure-params'].inside.rest = Prism.languages.rust;
	Prism.languages.rust['attribute'].inside['string'] = Prism.languages.rust['string'];

}(Prism));

Prism.languages.swift = {
	'comment': {
		// Nested comments are supported up to 2 levels
		pattern: /(^|[^\\:])(?:\/\/.*|\/\*(?:[^/*]|\/(?!\*)|\*(?!\/)|\/\*(?:[^*]|\*(?!\/))*\*\/)*\*\/)/,
		lookbehind: true,
		greedy: true
	},
	'string-literal': [
		// https://docs.swift.org/swift-book/LanguageGuide/StringsAndCharacters.html
		{
			pattern: RegExp(
				/(^|[^"#])/.source
				+ '(?:'
				// single-line string
				+ /"(?:\\(?:\((?:[^()]|\([^()]*\))*\)|\r\n|[^(])|[^\\\r\n"])*"/.source
				+ '|'
				// multi-line string
				+ /"""(?:\\(?:\((?:[^()]|\([^()]*\))*\)|[^(])|[^\\"]|"(?!""))*"""/.source
				+ ')'
				+ /(?!["#])/.source
			),
			lookbehind: true,
			greedy: true,
			inside: {
				'interpolation': {
					pattern: /(\\\()(?:[^()]|\([^()]*\))*(?=\))/,
					lookbehind: true,
					inside: null // see below
				},
				'interpolation-punctuation': {
					pattern: /^\)|\\\($/,
					alias: 'punctuation'
				},
				'punctuation': /\\(?=[\r\n])/,
				'string': /[\s\S]+/
			}
		},
		{
			pattern: RegExp(
				/(^|[^"#])(#+)/.source
				+ '(?:'
				// single-line string
				+ /"(?:\\(?:#+\((?:[^()]|\([^()]*\))*\)|\r\n|[^#])|[^\\\r\n])*?"/.source
				+ '|'
				// multi-line string
				+ /"""(?:\\(?:#+\((?:[^()]|\([^()]*\))*\)|[^#])|[^\\])*?"""/.source
				+ ')'
				+ '\\2'
			),
			lookbehind: true,
			greedy: true,
			inside: {
				'interpolation': {
					pattern: /(\\#+\()(?:[^()]|\([^()]*\))*(?=\))/,
					lookbehind: true,
					inside: null // see below
				},
				'interpolation-punctuation': {
					pattern: /^\)|\\#+\($/,
					alias: 'punctuation'
				},
				'string': /[\s\S]+/
			}
		},
	],

	'directive': {
		// directives with conditions
		pattern: RegExp(
			/#/.source
			+ '(?:'
			+ (
				/(?:elseif|if)\b/.source
				+ '(?:[ \t]*'
				// This regex is a little complex. It's equivalent to this:
				//   (?:![ \t]*)?(?:\b\w+\b(?:[ \t]*<round>)?|<round>)(?:[ \t]*(?:&&|\|\|))?
				// where <round> is a general parentheses expression.
				+ /(?:![ \t]*)?(?:\b\w+\b(?:[ \t]*\((?:[^()]|\([^()]*\))*\))?|\((?:[^()]|\([^()]*\))*\))(?:[ \t]*(?:&&|\|\|))?/.source
				+ ')+'
			)
			+ '|'
			+ /(?:else|endif)\b/.source
			+ ')'
		),
		alias: 'property',
		inside: {
			'directive-name': /^#\w+/,
			'boolean': /\b(?:false|true)\b/,
			'number': /\b\d+(?:\.\d+)*\b/,
			'operator': /!|&&|\|\||[<>]=?/,
			'punctuation': /[(),]/
		}
	},
	'literal': {
		pattern: /#(?:colorLiteral|column|dsohandle|file(?:ID|Literal|Path)?|function|imageLiteral|line)\b/,
		alias: 'constant'
	},
	'other-directive': {
		pattern: /#\w+\b/,
		alias: 'property'
	},

	'attribute': {
		pattern: /@\w+/,
		alias: 'atrule'
	},

	'function-definition': {
		pattern: /(\bfunc\s+)\w+/,
		lookbehind: true,
		alias: 'function'
	},
	'label': {
		// https://docs.swift.org/swift-book/LanguageGuide/ControlFlow.html#ID141
		pattern: /\b(break|continue)\s+\w+|\b[a-zA-Z_]\w*(?=\s*:\s*(?:for|repeat|while)\b)/,
		lookbehind: true,
		alias: 'important'
	},

	'keyword': /\b(?:Any|Protocol|Self|Type|actor|as|assignment|associatedtype|associativity|async|await|break|case|catch|class|continue|convenience|default|defer|deinit|didSet|do|dynamic|else|enum|extension|fallthrough|fileprivate|final|for|func|get|guard|higherThan|if|import|in|indirect|infix|init|inout|internal|is|isolated|lazy|left|let|lowerThan|mutating|none|nonisolated|nonmutating|open|operator|optional|override|postfix|precedencegroup|prefix|private|protocol|public|repeat|required|rethrows|return|right|safe|self|set|some|static|struct|subscript|super|switch|throw|throws|try|typealias|unowned|unsafe|var|weak|where|while|willSet)\b/,
	'boolean': /\b(?:false|true)\b/,
	'nil': {
		pattern: /\bnil\b/,
		alias: 'constant'
	},

	'short-argument': /\$\d+\b/,
	'omit': {
		pattern: /\b_\b/,
		alias: 'keyword'
	},
	'number': /\b(?:[\d_]+(?:\.[\de_]+)?|0x[a-f0-9_]+(?:\.[a-f0-9p_]+)?|0b[01_]+|0o[0-7_]+)\b/i,

	// A class name must start with an upper-case letter and be either 1 letter long or contain a lower-case letter.
	'class-name': /\b[A-Z](?:[A-Z_\d]*[a-z]\w*)?\b/,
	'function': /\b[a-z_]\w*(?=\s*\()/i,
	'constant': /\b(?:[A-Z_]{2,}|k[A-Z][A-Za-z_]+)\b/,

	// Operators are generic in Swift. Developers can even create new operators (e.g. +++).
	// https://docs.swift.org/swift-book/ReferenceManual/zzSummaryOfTheGrammar.html#ID481
	// This regex only supports ASCII operators.
	'operator': /[-+*/%=!<>&|^~?]+|\.[.\-+*/%=!<>&|^~?]+/,
	'punctuation': /[{}[\]();,.:\\]/
};

Prism.languages.swift['string-literal'].forEach(function (rule) {
	rule.inside['interpolation'].inside = Prism.languages.swift;
});

(function (Prism) {

	Prism.languages.typescript = Prism.languages.extend('javascript', {
		'class-name': {
			pattern: /(\b(?:class|extends|implements|instanceof|interface|new|type)\s+)(?!keyof\b)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?:\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>)?/,
			lookbehind: true,
			greedy: true,
			inside: null // see below
		},
		'builtin': /\b(?:Array|Function|Promise|any|boolean|console|never|number|string|symbol|unknown)\b/,
	});

	// The keywords TypeScript adds to JavaScript
	Prism.languages.typescript.keyword.push(
		/\b(?:abstract|declare|is|keyof|readonly|require)\b/,
		// keywords that have to be followed by an identifier
		/\b(?:asserts|infer|interface|module|namespace|type)\b(?=\s*(?:[{_$a-zA-Z\xA0-\uFFFF]|$))/,
		// This is for `import type *, {}`
		/\btype\b(?=\s*(?:[\{*]|$))/
	);

	// doesn't work with TS because TS is too complex
	delete Prism.languages.typescript['parameter'];
	delete Prism.languages.typescript['literal-property'];

	// a version of typescript specifically for highlighting types
	var typeInside = Prism.languages.extend('typescript', {});
	delete typeInside['class-name'];

	Prism.languages.typescript['class-name'].inside = typeInside;

	Prism.languages.insertBefore('typescript', 'function', {
		'decorator': {
			pattern: /@[$\w\xA0-\uFFFF]+/,
			inside: {
				'at': {
					pattern: /^@/,
					alias: 'operator'
				},
				'function': /^[\s\S]+/
			}
		},
		'generic-function': {
			// e.g. foo<T extends "bar" | "baz">( ...
			pattern: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>(?=\s*\()/,
			greedy: true,
			inside: {
				'function': /^#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*/,
				'generic': {
					pattern: /<[\s\S]+/, // everything after the first <
					alias: 'class-name',
					inside: typeInside
				}
			}
		}
	});

	Prism.languages.ts = Prism.languages.typescript;

}(Prism));

(function (Prism) {

	var keywords = /\b(?:abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|exports|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|module|native|new|non-sealed|null|open|opens|package|permits|private|protected|provides|public|record(?!\s*[(){}[\]<>=%~.:,;?+\-*/&|^])|requires|return|sealed|short|static|strictfp|super|switch|synchronized|this|throw|throws|to|transient|transitive|try|uses|var|void|volatile|while|with|yield)\b/;

	// full package (optional) + parent classes (optional)
	var classNamePrefix = /(?:[a-z]\w*\s*\.\s*)*(?:[A-Z]\w*\s*\.\s*)*/.source;

	// based on the java naming conventions
	var className = {
		pattern: RegExp(/(^|[^\w.])/.source + classNamePrefix + /[A-Z](?:[\d_A-Z]*[a-z]\w*)?\b/.source),
		lookbehind: true,
		inside: {
			'namespace': {
				pattern: /^[a-z]\w*(?:\s*\.\s*[a-z]\w*)*(?:\s*\.)?/,
				inside: {
					'punctuation': /\./
				}
			},
			'punctuation': /\./
		}
	};

	Prism.languages.java = Prism.languages.extend('clike', {
		'string': {
			pattern: /(^|[^\\])"(?:\\.|[^"\\\r\n])*"/,
			lookbehind: true,
			greedy: true
		},
		'class-name': [
			className,
			{
				// variables, parameters, and constructor references
				// this to support class names (or generic parameters) which do not contain a lower case letter (also works for methods)
				pattern: RegExp(/(^|[^\w.])/.source + classNamePrefix + /[A-Z]\w*(?=\s+\w+\s*[;,=()]|\s*(?:\[[\s,]*\]\s*)?::\s*new\b)/.source),
				lookbehind: true,
				inside: className.inside
			},
			{
				// class names based on keyword
				// this to support class names (or generic parameters) which do not contain a lower case letter (also works for methods)
				pattern: RegExp(/(\b(?:class|enum|extends|implements|instanceof|interface|new|record|throws)\s+)/.source + classNamePrefix + /[A-Z]\w*\b/.source),
				lookbehind: true,
				inside: className.inside
			}
		],
		'keyword': keywords,
		'function': [
			Prism.languages.clike.function,
			{
				pattern: /(::\s*)[a-z_]\w*/,
				lookbehind: true
			}
		],
		'number': /\b0b[01][01_]*L?\b|\b0x(?:\.[\da-f_p+-]+|[\da-f_]+(?:\.[\da-f_p+-]+)?)\b|(?:\b\d[\d_]*(?:\.[\d_]*)?|\B\.\d[\d_]*)(?:e[+-]?\d[\d_]*)?[dfl]?/i,
		'operator': {
			pattern: /(^|[^.])(?:<<=?|>>>?=?|->|--|\+\+|&&|\|\||::|[?:~]|[-+*/%&|^!=<>]=?)/m,
			lookbehind: true
		},
		'constant': /\b[A-Z][A-Z_\d]+\b/
	});

	Prism.languages.insertBefore('java', 'string', {
		'triple-quoted-string': {
			// http://openjdk.java.net/jeps/355#Description
			pattern: /"""[ \t]*[\r\n](?:(?:"|"")?(?:\\.|[^"\\]))*"""/,
			greedy: true,
			alias: 'string'
		},
		'char': {
			pattern: /'(?:\\.|[^'\\\r\n]){1,6}'/,
			greedy: true
		}
	});

	Prism.languages.insertBefore('java', 'class-name', {
		'annotation': {
			pattern: /(^|[^.])@\w+(?:\s*\.\s*\w+)*/,
			lookbehind: true,
			alias: 'punctuation'
		},
		'generics': {
			pattern: /<(?:[\w\s,.?]|&(?!&)|<(?:[\w\s,.?]|&(?!&)|<(?:[\w\s,.?]|&(?!&)|<(?:[\w\s,.?]|&(?!&))*>)*>)*>)*>/,
			inside: {
				'class-name': className,
				'keyword': keywords,
				'punctuation': /[<>(),.:]/,
				'operator': /[?&|]/
			}
		},
		'import': [
			{
				pattern: RegExp(/(\bimport\s+)/.source + classNamePrefix + /(?:[A-Z]\w*|\*)(?=\s*;)/.source),
				lookbehind: true,
				inside: {
					'namespace': className.inside.namespace,
					'punctuation': /\./,
					'operator': /\*/,
					'class-name': /\w+/
				}
			},
			{
				pattern: RegExp(/(\bimport\s+static\s+)/.source + classNamePrefix + /(?:\w+|\*)(?=\s*;)/.source),
				lookbehind: true,
				alias: 'static',
				inside: {
					'namespace': className.inside.namespace,
					'static': /\b\w+$/,
					'punctuation': /\./,
					'operator': /\*/,
					'class-name': /\w+/
				}
			}
		],
		'namespace': {
			pattern: RegExp(
				/(\b(?:exports|import(?:\s+static)?|module|open|opens|package|provides|requires|to|transitive|uses|with)\s+)(?!<keyword>)[a-z]\w*(?:\.[a-z]\w*)*\.?/
					.source.replace(/<keyword>/g, function () { return keywords.source; })),
			lookbehind: true,
			inside: {
				'punctuation': /\./,
			}
		}
	});
}(Prism));

(function (Prism) {

	var keyword = /\b(?:alignas|alignof|asm|auto|bool|break|case|catch|char|char16_t|char32_t|char8_t|class|co_await|co_return|co_yield|compl|concept|const|const_cast|consteval|constexpr|constinit|continue|decltype|default|delete|do|double|dynamic_cast|else|enum|explicit|export|extern|final|float|for|friend|goto|if|import|inline|int|int16_t|int32_t|int64_t|int8_t|long|module|mutable|namespace|new|noexcept|nullptr|operator|override|private|protected|public|register|reinterpret_cast|requires|return|short|signed|sizeof|static|static_assert|static_cast|struct|switch|template|this|thread_local|throw|try|typedef|typeid|typename|uint16_t|uint32_t|uint64_t|uint8_t|union|unsigned|using|virtual|void|volatile|wchar_t|while)\b/;
	var modName = /\b(?!<keyword>)\w+(?:\s*\.\s*\w+)*\b/.source.replace(/<keyword>/g, function () { return keyword.source; });

	Prism.languages.cpp = Prism.languages.extend('c', {
		'class-name': [
			{
				pattern: RegExp(/(\b(?:class|concept|enum|struct|typename)\s+)(?!<keyword>)\w+/.source
					.replace(/<keyword>/g, function () { return keyword.source; })),
				lookbehind: true
			},
			// This is intended to capture the class name of method implementations like:
			//   void foo::bar() const {}
			// However! The `foo` in the above example could also be a namespace, so we only capture the class name if
			// it starts with an uppercase letter. This approximation should give decent results.
			/\b[A-Z]\w*(?=\s*::\s*\w+\s*\()/,
			// This will capture the class name before destructors like:
			//   Foo::~Foo() {}
			/\b[A-Z_]\w*(?=\s*::\s*~\w+\s*\()/i,
			// This also intends to capture the class name of method implementations but here the class has template
			// parameters, so it can't be a namespace (until C++ adds generic namespaces).
			/\b\w+(?=\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>\s*::\s*\w+\s*\()/
		],
		'keyword': keyword,
		'number': {
			pattern: /(?:\b0b[01']+|\b0x(?:[\da-f']+(?:\.[\da-f']*)?|\.[\da-f']+)(?:p[+-]?[\d']+)?|(?:\b[\d']+(?:\.[\d']*)?|\B\.[\d']+)(?:e[+-]?[\d']+)?)[ful]{0,4}/i,
			greedy: true
		},
		'operator': />>=?|<<=?|->|--|\+\+|&&|\|\||[?:~]|<=>|[-+*/%&|^!=<>]=?|\b(?:and|and_eq|bitand|bitor|not|not_eq|or|or_eq|xor|xor_eq)\b/,
		'boolean': /\b(?:false|true)\b/
	});

	Prism.languages.insertBefore('cpp', 'string', {
		'module': {
			// https://en.cppreference.com/w/cpp/language/modules
			pattern: RegExp(
				/(\b(?:import|module)\s+)/.source +
				'(?:' +
				// header-name
				/"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|<[^<>\r\n]*>/.source +
				'|' +
				// module name or partition or both
				/<mod-name>(?:\s*:\s*<mod-name>)?|:\s*<mod-name>/.source.replace(/<mod-name>/g, function () { return modName; }) +
				')'
			),
			lookbehind: true,
			greedy: true,
			inside: {
				'string': /^[<"][\s\S]+/,
				'operator': /:/,
				'punctuation': /\./
			}
		},
		'raw-string': {
			pattern: /R"([^()\\ ]{0,16})\([\s\S]*?\)\1"/,
			alias: 'string',
			greedy: true
		}
	});

	Prism.languages.insertBefore('cpp', 'keyword', {
		'generic-function': {
			pattern: /\b(?!operator\b)[a-z_]\w*\s*<(?:[^<>]|<[^<>]*>)*>(?=\s*\()/i,
			inside: {
				'function': /^\w+/,
				'generic': {
					pattern: /<[\s\S]+/,
					alias: 'class-name',
					inside: Prism.languages.cpp
				}
			}
		}
	});

	Prism.languages.insertBefore('cpp', 'operator', {
		'double-colon': {
			pattern: /::/,
			alias: 'punctuation'
		}
	});

	Prism.languages.insertBefore('cpp', 'class-name', {
		// the base clause is an optional list of parent classes
		// https://en.cppreference.com/w/cpp/language/class
		'base-clause': {
			pattern: /(\b(?:class|struct)\s+\w+\s*:\s*)[^;{}"'\s]+(?:\s+[^;{}"'\s]+)*(?=\s*[;{])/,
			lookbehind: true,
			greedy: true,
			inside: Prism.languages.extend('cpp', {})
		}
	});

	Prism.languages.insertBefore('inside', 'double-colon', {
		// All untokenized words that are not namespaces should be class names
		'class-name': /\b[a-z_]\w*\b(?!\s*::)/i
	}, Prism.languages.cpp['base-clause']);

}(Prism));

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const k$3=globalThis.Prism||window.Prism,L$1=t=>{try{return !!t&&k$3.languages.hasOwnProperty(t)}catch(t){return  false}};function A$3(e,n){for(const r of e.childNodes){if(uo(r)&&r.tagName===n)return  true;A$3(r,n);}return  false}const H$1="data-language",D$3="data-highlight-language";let M$4 = class M extends fi{static getType(){return "code"}static clone(t){return new M(t.__language,t.__key)}constructor(t,e){super(e),this.__language=t||void 0,this.__isSyntaxHighlightSupported=L$1(t);}createDOM(t){const n=document.createElement("code");rt$2(n,t.theme.code),n.setAttribute("spellcheck","false");const r=this.getLanguage();return r&&(n.setAttribute(H$1,r),this.getIsSyntaxHighlightSupported()&&n.setAttribute(D$3,r)),n}updateDOM(t,e,n){const r=this.__language,o=t.__language;return r?r!==o&&(e.setAttribute(H$1,r),this.__isSyntaxHighlightSupported&&e.setAttribute(D$3,r)):o&&(e.removeAttribute(H$1),t.__isSyntaxHighlightSupported&&e.removeAttribute(D$3)),false}exportDOM(t){const n=document.createElement("pre");rt$2(n,t._config.theme.code),n.setAttribute("spellcheck","false");const r=this.getLanguage();return r&&(n.setAttribute(H$1,r),this.getIsSyntaxHighlightSupported()&&n.setAttribute(D$3,r)),{element:n}}static importDOM(){return {code:t=>null!=t.textContent&&(/\r?\n/.test(t.textContent)||A$3(t,"BR"))?{conversion:E$4,priority:1}:null,div:()=>({conversion:F,priority:1}),pre:()=>({conversion:E$4,priority:0}),table:t=>K$2(t)?{conversion:B$2,priority:3}:null,td:t=>{const e=t,n=e.closest("table");return e.classList.contains("js-file-line")||n&&K$2(n)?{conversion:R$2,priority:3}:null},tr:t=>{const e=t.closest("table");return e&&K$2(e)?{conversion:R$2,priority:3}:null}}}static importJSON(t){return z$3().updateFromJSON(t)}updateFromJSON(t){return super.updateFromJSON(t).setLanguage(t.language)}exportJSON(){return {...super.exportJSON(),language:this.getLanguage()}}insertNewAfter(t,e=true){const n=this.getChildren(),r=n.length;if(r>=2&&"\n"===n[r-1].getTextContent()&&"\n"===n[r-2].getTextContent()&&t.isCollapsed()&&t.anchor.key===this.__key&&t.anchor.offset===r){n[r-1].remove(),n[r-2].remove();const t=Pi();return this.insertAfter(t,e),t}const{anchor:o,focus:i}=t,a=(o.isBefore(i)?o:i).getNode();if(Qn(a)){let t=nt$2(a);const e=[];for(;;)if(nr(t))e.push(er()),t=t.getNextSibling();else {if(!tt$2(t))break;{let n=0;const r=t.getTextContent(),o=t.getTextContentSize();for(;n<o&&" "===r[n];)n++;if(0!==n&&e.push(Z$2(" ".repeat(n))),n!==o)break;t=t.getNextSibling();}}const n=a.splitText(o.offset)[0],r=0===o.offset?0:1,i=n.getIndexWithinParent()+r,s=a.getParentOrThrow(),l=[Pn(),...e];s.splice(i,0,l);const p=e[e.length-1];p?p.select():0===o.offset?n.selectPrevious():n.getNextSibling().selectNext(0,0);}if(J$2(a)){const{offset:e}=t.anchor;a.splice(e,0,[Pn()]),a.select(e+1,e+1);}return null}canIndent(){return  false}collapseAtStart(){const t=Pi();return this.getChildren().forEach((e=>t.append(e))),this.replace(t),true}setLanguage(t){const e=this.getWritable();return e.__language=t||void 0,e.__isSyntaxHighlightSupported=L$1(t),e}getLanguage(){return this.getLatest().__language}getIsSyntaxHighlightSupported(){return this.getLatest().__isSyntaxHighlightSupported}};function z$3(t){return eo(new M$4(t))}function J$2(t){return t instanceof M$4}function E$4(t){return {node:z$3(t.getAttribute(H$1))}}function F(t){const e=t,n=I$1(e);return n||function(t){let e=t.parentElement;for(;null!==e;){if(I$1(e))return  true;e=e.parentElement;}return  false}(e)?{node:n?z$3():null}:{node:null}}function B$2(){return {node:z$3()}}function R$2(){return {node:null}}function I$1(t){return null!==t.style.fontFamily.match("monospace")}function K$2(t){return t.classList.contains("js-file-line-container")}let V$2 = class V extends Jn{constructor(t="",e,n){super(t,n),this.__highlightType=e;}static getType(){return "code-highlight"}static clone(t){return new V(t.__text,t.__highlightType||void 0,t.__key)}getHighlightType(){return this.getLatest().__highlightType}setHighlightType(t){const e=this.getWritable();return e.__highlightType=t||void 0,e}canHaveFormat(){return  false}createDOM(t){const n=super.createDOM(t),r=Y$2(t.theme,this.__highlightType);return rt$2(n,r),n}updateDOM(t,r,o){const i=super.updateDOM(t,r,o),s=Y$2(o.theme,t.__highlightType),l=Y$2(o.theme,this.__highlightType);return s!==l&&(s&&it$2(r,s),l&&rt$2(r,l)),i}static importJSON(t){return Z$2().updateFromJSON(t)}updateFromJSON(t){return super.updateFromJSON(t).setHighlightType(t.highlightType)}exportJSON(){return {...super.exportJSON(),highlightType:this.getHighlightType()}}setFormat(t){return this}isParentRequired(){return  true}createParentElementNode(){return z$3()}};function Y$2(t,e){return e&&t&&t.codeHighlight&&t.codeHighlight[e]}function Z$2(t="",e){return eo(new V$2(t,e))}function tt$2(t){return t instanceof V$2}function et$2(t,e){let n=t;for(let o=Wo(t,e);o&&(tt$2(o.origin)||nr(o.origin));o=ct$2(o))n=o.origin;return n}function nt$2(t){return et$2(t,"previous")}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

function I(t,...e){const n=new URL("https://lexical.dev/docs/error"),r=new URLSearchParams;r.append("code",t);for(const t of e)r.append("v",t);throw n.search=r.toString(),Error(`Minified Lexical error #${t}; visit ${n.toString()} for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`)}function w$1(t){let e=1,n=t.getParent();for(;null!=n;){if(nt$1(n)){const t=n.getParent();if(at$1(t)){e++,n=t.getParent();continue}I(40);}return e}return e}function D$2(t){let e=t.getParent();at$1(e)||I(40);let n=e;for(;null!==n;)n=n.getParent(),at$1(n)&&(e=n);return e}function M$3(t){let e=[];const n=t.getChildren().filter(nt$1);for(let t=0;t<n.length;t++){const r=n[t],i=r.getFirstChild();at$1(i)?e=e.concat(M$3(i)):e.push(r);}return e}function R$1(t){return nt$1(t)&&at$1(t.getFirstChild())}function J$1(t){return et$1().append(t)}function B$1(t,e){return nt$1(t)&&(0===e.length||1===e.length&&t.is(e[0])&&0===t.getChildrenSize())}function W$1(t){const e=Nr();if(null!==e){let n=e.getNodes();if(cr(e)){const r=e.getStartEndPoints();null===r&&I(143);const[i]=r,s=i.getNode(),o=s.getParent();if(Zs(s)){const t=s.getFirstChild();if(t)n=t.selectStart().getNodes();else {const t=Pi();s.append(t),n=t.select().getNodes();}}else if(B$1(s,n)){const e=ct$1(t);if(Zs(o)){s.replace(e);const t=et$1();di(s)&&(t.setFormat(s.getFormatType()),t.setIndent(s.getIndent())),e.append(t);}else if(nt$1(s)){const t=s.getParentOrThrow();K$1(e,t.getChildren()),t.replace(e);}return}}const r=new Set;for(let e=0;e<n.length;e++){const i=n[e];if(di(i)&&i.isEmpty()&&!nt$1(i)&&!r.has(i.getKey())){U$2(i,t);continue}let s=rs(i)?i.getParent():nt$1(i)&&i.isEmpty()?i:null;for(;null!=s;){const e=s.getKey();if(at$1(s)){if(!r.has(e)){const n=ct$1(t);K$1(n,s.getChildren()),s.replace(n),r.add(e);}break}{const n=s.getParent();if(Zs(n)&&!r.has(e)){r.add(e),U$2(s,t);break}s=n;}}}}}function K$1(t,e){t.splice(t.getChildrenSize(),0,e);}function U$2(t,e){if(at$1(t))return t;const n=t.getPreviousSibling(),r=t.getNextSibling(),i=et$1();let s;if(K$1(i,t.getChildren()),at$1(n)&&e===n.getListType())n.append(i),at$1(r)&&e===r.getListType()&&(K$1(n,r.getChildren()),r.remove()),s=n;else if(at$1(r)&&e===r.getListType())r.getFirstChildOrThrow().insertBefore(i),s=r;else {const n=ct$1(e);n.append(i),t.replace(n),s=n;}return i.setFormat(t.getFormatType()),i.setIndent(t.getIndent()),t.remove(),s}function V$1(t,e){const n=t.getLastChild(),r=e.getFirstChild();n&&r&&R$1(n)&&R$1(r)&&(V$1(n.getFirstChild(),r.getFirstChild()),r.remove());const i=e.getChildren();i.length>0&&t.append(...i),e.remove();}function z$2(){const e=Nr();if(cr(e)){const n=new Set,r=e.getNodes(),i=e.anchor.getNode();if(B$1(i,r))n.add(D$2(i));else for(let e=0;e<r.length;e++){const i=r[e];if(rs(i)){const e=vt$3(i,G);null!=e&&n.add(D$2(e));}}for(const t of n){let n=t;const r=M$3(t);for(const t of r){const r=Pi().setTextStyle(e.style).setTextFormat(e.format);K$1(r,t.getChildren()),n.insertAfter(r),n=r,t.__key===e.anchor.key&&ll(e.anchor,_l(jo(r,"next"))),t.__key===e.focus.key&&ll(e.focus,_l(jo(r,"next"))),t.remove();}t.remove();}}}function $(t){const e=new Set;if(R$1(t)||e.has(t.getKey()))return;const n=t.getParent(),r=t.getNextSibling(),i=t.getPreviousSibling();if(R$1(r)&&R$1(i)){const n=i.getFirstChild();if(at$1(n)){n.append(t);const i=r.getFirstChild();if(at$1(i)){K$1(n,i.getChildren()),r.remove(),e.add(r.getKey());}}}else if(R$1(r)){const e=r.getFirstChild();if(at$1(e)){const n=e.getFirstChild();null!==n&&n.insertBefore(t);}}else if(R$1(i)){const e=i.getFirstChild();at$1(e)&&e.append(t);}else if(at$1(n)){const e=et$1().setTextFormat(t.getTextFormat()).setTextStyle(t.getTextStyle()),s=ct$1(n.getListType()).setTextFormat(n.getTextFormat()).setTextStyle(n.getTextStyle());e.append(s),s.append(t),i?i.insertAfter(e):r?r.insertBefore(e):n.append(e);}}function q(t){if(R$1(t))return;const e=t.getParent(),n=e?e.getParent():void 0;if(at$1(n?n.getParent():void 0)&&nt$1(n)&&at$1(e)){const r=e?e.getFirstChild():void 0,i=e?e.getLastChild():void 0;if(t.is(r))n.insertBefore(t),e.isEmpty()&&n.remove();else if(t.is(i))n.insertAfter(t),e.isEmpty()&&n.remove();else {const r=e.getListType(),i=et$1(),s=ct$1(r);i.append(s),t.getPreviousSiblings().forEach((t=>s.append(t)));const o=et$1(),l=ct$1(r);o.append(l),K$1(l,t.getNextSiblings()),n.insertBefore(i),n.insertAfter(o),n.replace(t);}}}function H(){const t=Nr();if(!cr(t)||!t.isCollapsed())return  false;const e=t.anchor.getNode();if(!nt$1(e)||0!==e.getChildrenSize())return  false;const n=D$2(e),r=e.getParent();at$1(r)||I(40);const i=r.getParent();let s;if(Zs(i))s=Pi(),n.insertAfter(s);else {if(!nt$1(i))return  false;s=et$1(),i.insertAfter(s);}s.setTextStyle(t.style).setTextFormat(t.format).select();const o=e.getNextSiblings();if(o.length>0){const t=ct$1(r.getListType());if(nt$1(s)){const e=et$1();e.append(t),s.insertAfter(e);}else s.insertAfter(t);t.append(...o);}return function(t){let e=t;for(;null==e.getNextSibling()&&null==e.getPreviousSibling();){const t=e.getParent();if(null==t||!nt$1(t)&&!at$1(t))break;e=t;}e.remove();}(e),true}function X$2(...t){const e=[];for(const n of t)if(n&&"string"==typeof n)for(const[t]of n.matchAll(/\S+/g))e.push(t);return e}function j$1(t,e,n){const r=B$4(e.__textStyle);for(const e in r)t.style.setProperty(`--listitem-marker-${e}`,r[e]);if(n)for(const e in B$4(n.__textStyle))e in r||t.style.removeProperty(`--listitem-marker-${e}`);}class G extends fi{static getType(){return "listitem"}static clone(t){return new G(t.__value,t.__checked,t.__key)}constructor(t,e,n){super(n),this.__value=void 0===t?1:t,this.__checked=e;}createDOM(t){const e=document.createElement("li"),n=this.getParent();at$1(n)&&"check"===n.getListType()&&Y$1(e,this,null),e.value=this.__value,Q$1(e,t.theme,this);const r=this.__style;return r&&(e.style.cssText=r),j$1(e,this,null),e}updateDOM(t,e,n){const r=this.getParent();at$1(r)&&"check"===r.getListType()&&Y$1(e,this,t),e.value=this.__value,Q$1(e,n.theme,this);const i=t.__style,s=this.__style;return i!==s&&(""===s?e.removeAttribute("style"):e.style.cssText=s),j$1(e,this,t),false}static transform(){return t=>{if(nt$1(t)||I(144),null==t.__checked)return;const e=t.getParent();at$1(e)&&"check"!==e.getListType()&&null!=t.getChecked()&&t.setChecked(void 0);}}static importDOM(){return {li:()=>({conversion:Z$1,priority:0})}}static importJSON(t){return et$1().updateFromJSON(t)}updateFromJSON(t){return super.updateFromJSON(t).setValue(t.value).setChecked(t.checked)}exportDOM(t){const e=this.createDOM(t._config),n=this.getFormatType();n&&(e.style.textAlign=n);const r=this.getDirection();return r&&(e.dir=r),{element:e}}exportJSON(){return {...super.exportJSON(),checked:this.getChecked(),value:this.getValue()}}append(...t){for(let e=0;e<t.length;e++){const n=t[e];if(di(n)&&this.canMergeWith(n)){const t=n.getChildren();this.append(...t),n.remove();}else super.append(n);}return this}replace(t,e){if(nt$1(t))return super.replace(t);this.setIndent(0);const n=this.getParentOrThrow();if(!at$1(n))return t;if(n.__first===this.getKey())n.insertBefore(t);else if(n.__last===this.getKey())n.insertAfter(t);else {const e=ct$1(n.getListType());let r=this.getNextSibling();for(;r;){const t=r;r=r.getNextSibling(),e.append(t);}n.insertAfter(t),t.insertAfter(e);}return e&&(di(t)||I(139),this.getChildren().forEach((e=>{t.append(e);}))),this.remove(),0===n.getChildrenSize()&&n.remove(),t}insertAfter(t,e=true){const n=this.getParentOrThrow();if(at$1(n)||I(39),nt$1(t))return super.insertAfter(t,e);const r=this.getNextSiblings();if(n.insertAfter(t,e),0!==r.length){const i=ct$1(n.getListType());r.forEach((t=>i.append(t))),t.insertAfter(i,e);}return t}remove(t){const e=this.getPreviousSibling(),n=this.getNextSibling();super.remove(t),e&&n&&R$1(e)&&R$1(n)&&(V$1(e.getFirstChild(),n.getFirstChild()),n.remove());}insertNewAfter(t,e=true){const n=et$1().updateFromJSON(this.exportJSON()).setChecked(!this.getChecked()&&void 0);return this.insertAfter(n,e),n}collapseAtStart(t){const e=Pi();this.getChildren().forEach((t=>e.append(t)));const n=this.getParentOrThrow(),r=n.getParentOrThrow(),i=nt$1(r);if(1===n.getChildrenSize())if(i)n.remove(),r.select();else {n.insertBefore(e),n.remove();const r=t.anchor,i=t.focus,s=e.getKey();"element"===r.type&&r.getNode().is(this)&&r.set(s,r.offset,"element"),"element"===i.type&&i.getNode().is(this)&&i.set(s,i.offset,"element");}else n.insertBefore(e),this.remove();return  true}getValue(){return this.getLatest().__value}setValue(t){const e=this.getWritable();return e.__value=t,e}getChecked(){const t=this.getLatest();let e;const n=this.getParent();return at$1(n)&&(e=n.getListType()),"check"===e?Boolean(t.__checked):void 0}setChecked(t){const e=this.getWritable();return e.__checked=t,e}toggleChecked(){const t=this.getWritable();return t.setChecked(!t.__checked)}getIndent(){const t=this.getParent();if(null===t||!this.isAttached())return this.getLatest().__indent;let e=t.getParentOrThrow(),n=0;for(;nt$1(e);)e=e.getParentOrThrow().getParentOrThrow(),n++;return n}setIndent(t){"number"!=typeof t&&I(117),(t=Math.floor(t))>=0||I(199);let e=this.getIndent();for(;e!==t;)e<t?($(this),e++):(q(this),e--);return this}canInsertAfter(t){return nt$1(t)}canReplaceWith(t){return nt$1(t)}canMergeWith(t){return nt$1(t)||Fi(t)}extractWithChild(t,e){if(!cr(e))return  false;const n=e.anchor.getNode(),r=e.focus.getNode();return this.isParentOf(n)&&this.isParentOf(r)&&this.getTextContent().length===e.getTextContent().length}isParentRequired(){return  true}createParentElementNode(){return ct$1("bullet")}canMergeWhenEmpty(){return  true}}function Q$1(t,r,i){const s=[],o=[],l=r.list,c=l?l.listitem:void 0;let a;if(l&&l.nested&&(a=l.nested.listitem),void 0!==c&&s.push(...X$2(c)),l){const t=i.getParent(),e=at$1(t)&&"check"===t.getListType(),n=i.getChecked();e&&!n||o.push(l.listitemUnchecked),e&&n||o.push(l.listitemChecked),e&&s.push(n?l.listitemChecked:l.listitemUnchecked);}if(void 0!==a){const t=X$2(a);i.getChildren().some((t=>at$1(t)))?s.push(...t):o.push(...t);}o.length>0&&it$2(t,...o),s.length>0&&rt$2(t,...s);}function Y$1(t,e,n,r){at$1(e.getFirstChild())?(t.removeAttribute("role"),t.removeAttribute("tabIndex"),t.removeAttribute("aria-checked")):(t.setAttribute("role","checkbox"),t.setAttribute("tabIndex","-1"),n&&e.__checked===n.__checked||t.setAttribute("aria-checked",e.getChecked()?"true":"false"));}function Z$1(t){if(t.classList.contains("task-list-item"))for(const e of t.children)if("INPUT"===e.tagName)return tt$1(e);const e=t.getAttribute("aria-checked");return {node:et$1("true"===e||"false"!==e&&void 0)}}function tt$1(t){if(!("checkbox"===t.getAttribute("type")))return {node:null};return {node:et$1(t.hasAttribute("checked"))}}function et$1(t){return eo(new G(void 0,t))}function nt$1(t){return t instanceof G}let rt$1 = class rt extends fi{static getType(){return "list"}static clone(t){const e=t.__listType||lt$1[t.__tag];return new rt(e,t.__start,t.__key)}constructor(t="number",e=1,n){super(n);const r=lt$1[t]||t;this.__listType=r,this.__tag="number"===r?"ol":"ul",this.__start=e;}getTag(){return this.__tag}setListType(t){const e=this.getWritable();return e.__listType=t,e.__tag="number"===t?"ol":"ul",e}getListType(){return this.__listType}getStart(){return this.__start}setStart(t){const e=this.getWritable();return e.__start=t,e}createDOM(t,e){const n=this.__tag,r=document.createElement(n);return 1!==this.__start&&r.setAttribute("start",String(this.__start)),r.__lexicalListType=this.__listType,it$1(r,t.theme,this),r}updateDOM(t,e,n){return t.__tag!==this.__tag||(it$1(e,n.theme,this),false)}static transform(){return t=>{at$1(t)||I(163),function(t){const e=t.getNextSibling();at$1(e)&&t.getListType()===e.getListType()&&V$1(t,e);}(t),function(t){const e="check"!==t.getListType();let n=t.getStart();for(const r of t.getChildren())nt$1(r)&&(r.getValue()!==n&&r.setValue(n),e&&null!=r.getLatest().__checked&&r.setChecked(void 0),at$1(r.getFirstChild())||n++);}(t);}}static importDOM(){return {ol:()=>({conversion:ot$1,priority:0}),ul:()=>({conversion:ot$1,priority:0})}}static importJSON(t){return ct$1().updateFromJSON(t)}updateFromJSON(t){return super.updateFromJSON(t).setListType(t.listType).setStart(t.start)}exportDOM(t){const e=this.createDOM(t._config,t);return uo(e)&&(1!==this.__start&&e.setAttribute("start",String(this.__start)),"check"===this.__listType&&e.setAttribute("__lexicalListType","check")),{element:e}}exportJSON(){return {...super.exportJSON(),listType:this.getListType(),start:this.getStart(),tag:this.getTag()}}canBeEmpty(){return  false}canIndent(){return  false}splice(t,e,n){let r=n;for(let t=0;t<n.length;t++){const e=n[t];nt$1(e)||(r===n&&(r=[...n]),r[t]=et$1().append(!di(e)||at$1(e)||e.isInline()?e:Xn(e.getTextContent())));}return super.splice(t,e,r)}extractWithChild(t){return nt$1(t)}};function it$1(t,r,i){const s=[],o=[],l=r.list;if(void 0!==l){const t=l[`${i.__tag}Depth`]||[],e=w$1(i)-1,n=e%t.length,r=t[n],c=l[i.__tag];let a;const u=l.nested,g=l.checklist;if(void 0!==u&&u.list&&(a=u.list),void 0!==c&&s.push(c),void 0!==g&&"check"===i.__listType&&s.push(g),void 0!==r){s.push(...X$2(r));for(let e=0;e<t.length;e++)e!==n&&o.push(i.__tag+e);}if(void 0!==a){const t=X$2(a);e>1?s.push(...t):o.push(...t);}}o.length>0&&it$2(t,...o),s.length>0&&rt$2(t,...s);}function st$1(t){const e=[];for(let n=0;n<t.length;n++){const r=t[n];if(nt$1(r)){e.push(r);const t=r.getChildren();t.length>1&&t.forEach((t=>{at$1(t)&&e.push(J$1(t));}));}else e.push(J$1(r));}return e}function ot$1(t){const e=t.nodeName.toLowerCase();let n=null;if("ol"===e){n=ct$1("number",t.start);}else "ul"===e&&(n=function(t){if("check"===t.getAttribute("__lexicallisttype")||t.classList.contains("contains-task-list"))return  true;for(const e of t.childNodes)if(uo(e)&&e.hasAttribute("aria-checked"))return  true;return  false}(t)?ct$1("check"):ct$1("bullet"));return {after:st$1,node:n}}const lt$1={ol:"number",ul:"bullet"};function ct$1(t="number",e=1){return eo(new rt$1(t,e))}function at$1(t){return t instanceof rt$1}const ut$1=oe("INSERT_CHECK_LIST_COMMAND");function gt$2(t){return j$2(t.registerCommand(ut$1,(()=>(W$1("check"),true)),Ii),t.registerCommand(we,(e=>mt$2(e,t,false)),Ii),t.registerCommand(Ne,(e=>mt$2(e,t,true)),Ii),t.registerCommand(Oe,(()=>{if(null!=pt$2()){const e=t.getRootElement();return null!=e&&e.focus(),true}return  false}),Ii),t.registerCommand(Me,(e=>{const n=pt$2();return !(null==n||!t.isEditable())&&(t.update((()=>{const t=ds(n);nt$1(t)&&(e.preventDefault(),t.toggleChecked());})),true)}),Ii),t.registerCommand(Te,(e=>t.getEditorState().read((()=>{const n=Nr();if(cr(n)&&n.isCollapsed()){const{anchor:r}=n,i="element"===r.type;if(i||0===r.offset){const n=r.getNode(),o=wt$2(n,(t=>di(t)&&!t.isInline()));if(nt$1(o)){const r=o.getParent();if(at$1(r)&&"check"===r.getListType()&&(i||o.getFirstDescendant()===n)){const n=t.getElementByKey(o.__key);if(null!=n&&document.activeElement!==n)return n.focus(),e.preventDefault(),true}}}}return  false}))),Ii),t.registerRootListener(((t,e)=>{null!==t&&(t.addEventListener("click",ft$2),t.addEventListener("pointerdown",dt$2)),null!==e&&(e.removeEventListener("click",ft$2),e.removeEventListener("pointerdown",dt$2));})))}function ht$2(t,e){const n=t.target;if(!uo(n))return;const i=n.firstChild;if(uo(i)&&("UL"===i.tagName||"OL"===i.tagName))return;const s=n.parentNode;if(!s||"check"!==s.__lexicalListType)return;const l=n.getBoundingClientRect(),c=t.pageX/Mt$2(n);("rtl"===n.dir?c<l.right&&c>l.right-20:c>l.left&&c<l.left+20)&&e();}function ft$2(t){ht$2(t,(()=>{if(uo(t.target)){const e=t.target,n=Gi(e);null!=n&&n.isEditable()&&n.update((()=>{const t=ds(e);nt$1(t)&&(e.focus(),t.toggleChecked());}));}}));}function dt$2(t){ht$2(t,(()=>{t.preventDefault();}));}function pt$2(){const t=document.activeElement;return uo(t)&&"LI"===t.tagName&&null!=t.parentNode&&"check"===t.parentNode.__lexicalListType?t:null}function mt$2(t,e,n){const r=pt$2();return null!=r&&e.update((()=>{const i=ds(r);if(!nt$1(i))return;const s=function(t,e){let n=e?t.getPreviousSibling():t.getNextSibling(),r=t;for(;null==n&&nt$1(r);)r=r.getParentOrThrow().getParent(),null!=r&&(n=e?r.getPreviousSibling():r.getNextSibling());for(;nt$1(n);){const t=e?n.getLastChild():n.getFirstChild();if(!at$1(t))return n;n=e?t.getLastChild():t.getFirstChild();}return null}(i,n);if(null!=s){s.selectStart();const n=e.getElementByKey(s.__key);null!=n&&(t.preventDefault(),setTimeout((()=>{n.focus();}),0));}})),false}const _t$2=oe("INSERT_UNORDERED_LIST_COMMAND"),yt$2=oe("INSERT_ORDERED_LIST_COMMAND"),Ct$2=oe("REMOVE_LIST_COMMAND");function Tt$2(t){return j$2(t.registerCommand(yt$2,(()=>(W$1("number"),true)),Ii),t.registerCommand(_t$2,(()=>(W$1("bullet"),true)),Ii),t.registerCommand(Ct$2,(()=>(z$2(),true)),Ii),t.registerCommand(de,(()=>H()),Ii),t.registerNodeTransform(G,(t=>{const e=t.getFirstChild();if(e){if(Qn(e)){const n=e.getStyle(),r=e.getFormat();t.getTextStyle()!==n&&t.setTextStyle(n),t.getTextFormat()!==r&&t.setTextFormat(r);}}else {const e=Nr();cr(e)&&(e.style!==t.getTextStyle()||e.format!==t.getTextFormat())&&e.isCollapsed()&&t.is(e.anchor.getNode())&&t.setTextStyle(e.style).setTextFormat(e.format);}})),t.registerNodeTransform(Jn,(t=>{const e=t.getParent();if(nt$1(e)&&t.is(e.getFirstChild())){const n=t.getStyle(),r=t.getFormat();n===e.getTextStyle()&&r===e.getTextFormat()||e.setTextStyle(n).setTextFormat(r);}})))}function vt$2(t){const e=t=>{const e=t.getParent();if(at$1(t.getFirstChild())||!at$1(e))return;const n=wt$2(t,(t=>nt$1(t)&&at$1(t.getParent())&&nt$1(t.getPreviousSibling())));if(null===n&&t.getIndent()>0)t.setIndent(0);else if(nt$1(n)){const r=n.getPreviousSibling();if(nt$1(r)){const n=function(t){let e=t,n=e.getFirstChild();for(;at$1(n);){const t=n.getLastChild();if(!nt$1(t))break;e=t,n=e.getFirstChild();}return e}(r),i=n.getParent();if(at$1(i)){const n=w$1(i);n+1<w$1(e)&&t.setIndent(n);}}}};return t.registerNodeTransform(rt$1,(t=>{const n=[t];for(;n.length>0;){const t=n.shift();if(at$1(t))for(const r of t.getChildren())if(nt$1(r)){e(r);const t=r.getFirstChild();at$1(t)&&n.push(t);}}}))}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

function y$2(t,...e){const n=new URL("https://lexical.dev/docs/error"),o=new URLSearchParams;o.append("code",t);for(const t of e)o.append("v",t);throw n.search=o.toString(),Error(`Minified Lexical error #${t}; visit ${n.toString()} for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`)}function T(e,n=Nr()){return null==n&&y$2(166),cr(n)&&n.isCollapsed()||0===n.getNodes().length?"":m$4(e,n)}function v$3(t,e=Nr()){return null==e&&y$2(166),cr(e)&&e.isCollapsed()||0===e.getNodes().length?null:JSON.stringify(R(t,e))}function D$1(t,n,o){const r=t.getData("application/x-lexical-editor");if(r)try{const t=JSON.parse(r);if(t.namespace===o._config.namespace&&Array.isArray(t.nodes)){return N$1(o,A$2(t.nodes),n)}}catch(t){}const c=t.getData("text/html"),a=t.getData("text/plain");if(c&&a!==c)try{const t=(new DOMParser).parseFromString(function(t){if(window.trustedTypes&&window.trustedTypes.createPolicy){return window.trustedTypes.createPolicy("lexical",{createHTML:t=>t}).createHTML(t)}return t}(c),"text/html");return N$1(o,h$5(o,t),n)}catch(t){}const u=a||t.getData("text/uri-list");if(null!=u)if(cr(n)){const t=u.split(/(\r?\n|\t)/);""===t[t.length-1]&&t.pop();for(let e=0;e<t.length;e++){const n=Nr();if(cr(n)){const o=t[e];"\n"===o||"\r\n"===o?n.insertParagraph():"\t"===o?n.insertNodes([er()]):n.insertText(o);}}}else n.insertRawText(u);}function N$1(t,e,n){t.dispatchCommand(ce,{nodes:e,selection:n})||n.insertNodes(e);}function S$1(t,e,n,r=[]){let i=null===e||n.isSelected(e);const l=di(n)&&n.excludeFromCopy("html");let s=n;if(null!==e){let t=vo(n);t=Qn(t)&&null!==e?b$1(e,t):t,s=t;}const c=di(s)?s.getChildren():[],a=function(t){const e=t.exportJSON(),n=t.constructor;if(e.type!==n.getType()&&y$2(58,n.name),di(t)){const t=e.children;Array.isArray(t)||y$2(59,n.name);}return e}(s);if(Qn(s)){const t=s.__text;t.length>0?a.text=t:i=false;}for(let o=0;o<c.length;o++){const r=c[o],l=S$1(t,e,r,a.children);!i&&di(n)&&l&&n.extractWithChild(r,e,"clone")&&(i=true);}if(i&&!l)r.push(a);else if(Array.isArray(a.children))for(let t=0;t<a.children.length;t++){const e=a.children[t];r.push(e);}return i}function R(t,e){const n=[],o=_s().getChildren();for(let r=0;r<o.length;r++){S$1(t,e,o[r],n);}return {namespace:t._config.namespace,nodes:n}}function A$2(t){const e=[];for(let o=0;o<t.length;o++){const r=t[o],i=ei(r);Qn(i)&&z$4(i),e.push(i);}return e}let P$2=null;async function _$1(t,e,n){if(null!==P$2)return  false;if(null!==e)return new Promise(((o,r)=>{t.update((()=>{o(E$3(t,e,n));}));}));const o=t.getRootElement(),i=t._window||window,l=window.document,s=oo(i);if(null===o||null===s)return  false;const c=l.createElement("span");c.style.cssText="position: fixed; top: -1000px;",c.append(l.createTextNode("#")),o.append(c);const a=new Range;return a.setStart(c,0),a.setEnd(c,1),s.removeAllRanges(),s.addRange(a),new Promise(((e,o)=>{const i=t.registerCommand(Je,(o=>(Lt$1(o,ClipboardEvent)&&(i(),null!==P$2&&(window.clearTimeout(P$2),P$2=null),e(E$3(t,o,n))),true)),Bi);P$2=window.setTimeout((()=>{i(),P$2=null,e(false);}),50),l.execCommand("copy"),c.remove();}))}function E$3(t,e,n){if(void 0===n){const e=oo(t._window);if(!e)return  false;const o=e.anchorNode,r=e.focusNode;if(null!==o&&null!==r&&!Hi(t,o,r))return  false;const i=Nr();if(null===i)return  false;n=M$2(i);}e.preventDefault();const o=e.clipboardData;return null!==o&&(O$2(o,n),true)}const L=[["text/html",T],["application/x-lexical-editor",v$3]];function M$2(t=Nr()){const e={"text/plain":t?t.getTextContent():""};if(t){const n=mo();for(const[o,r]of L){const i=r(n,t);null!==i&&(e[o]=i);}}return e}function O$2(t,e){for(const n in e){const o=e[n];void 0!==o&&t.setData(n,o);}}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

function dt$1(t,e){if(void 0!==document.caretRangeFromPoint){const n=document.caretRangeFromPoint(t,e);return null===n?null:{node:n.startContainer,offset:n.startOffset}}if("undefined"!==document.caretPositionFromPoint){const n=document.caretPositionFromPoint(t,e);return null===n?null:{node:n.offsetNode,offset:n.offset}}return null}const mt$1="undefined"!=typeof window&&void 0!==window.document&&void 0!==window.document.createElement,ft$1=mt$1&&"documentMode"in document?document.documentMode:null,gt$1=!(!mt$1||!("InputEvent"in window)||ft$1)&&"getTargetRanges"in new window.InputEvent("input"),pt$1=mt$1&&/Version\/[\d.]+.*Safari/.test(navigator.userAgent),ht$1=mt$1&&/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream,Ct$1=mt$1&&/^(?=.*Chrome).*/i.test(navigator.userAgent),vt$1=mt$1&&/AppleWebKit\/[\d.]+/.test(navigator.userAgent)&&!Ct$1,yt$1=oe("DRAG_DROP_PASTE_FILE");class Dt extends fi{static getType(){return "quote"}static clone(t){return new Dt(t.__key)}createDOM(t){const e=document.createElement("blockquote");return rt$2(e,t.theme.quote),e}updateDOM(t,e){return  false}static importDOM(){return {blockquote:t=>({conversion:Tt$1,priority:0})}}exportDOM(t){const{element:e}=super.exportDOM(t);if(uo(e)){this.isEmpty()&&e.append(document.createElement("br"));const t=this.getFormatType();t&&(e.style.textAlign=t);const n=this.getDirection();n&&(e.dir=n);}return {element:e}}static importJSON(t){return xt$1().updateFromJSON(t)}insertNewAfter(t,e){const n=Pi(),r=this.getDirection();return n.setDirection(r),this.insertAfter(n,e),n}collapseAtStart(){const t=Pi();return this.getChildren().forEach((e=>t.append(e))),this.replace(t),true}canMergeWhenEmpty(){return  true}}function xt$1(){return eo(new Dt)}function wt$1(t){return t instanceof Dt}let Nt$1 = class Nt extends fi{static getType(){return "heading"}static clone(t){return new Nt(t.__tag,t.__key)}constructor(t,e){super(e),this.__tag=t;}getTag(){return this.__tag}setTag(t){const e=this.getWritable();return this.__tag=t,e}createDOM(t){const e=this.__tag,n=document.createElement(e),r=t.theme.heading;if(void 0!==r){const t=r[e];rt$2(n,t);}return n}updateDOM(t,e,n){return t.__tag!==this.__tag}static importDOM(){return {h1:t=>({conversion:Ot,priority:0}),h2:t=>({conversion:Ot,priority:0}),h3:t=>({conversion:Ot,priority:0}),h4:t=>({conversion:Ot,priority:0}),h5:t=>({conversion:Ot,priority:0}),h6:t=>({conversion:Ot,priority:0}),p:t=>{const e=t.firstChild;return null!==e&&Et(e)?{conversion:()=>({node:null}),priority:3}:null},span:t=>Et(t)?{conversion:t=>({node:_t$1("h1")}),priority:3}:null}}exportDOM(t){const{element:e}=super.exportDOM(t);if(uo(e)){this.isEmpty()&&e.append(document.createElement("br"));const t=this.getFormatType();t&&(e.style.textAlign=t);const n=this.getDirection();n&&(e.dir=n);}return {element:e}}static importJSON(t){return _t$1(t.tag).updateFromJSON(t)}updateFromJSON(t){return super.updateFromJSON(t).setTag(t.tag)}exportJSON(){return {...super.exportJSON(),tag:this.getTag()}}insertNewAfter(t,e=true){const n=t?t.anchor.offset:0,r=this.getLastDescendant(),o=!r||t&&t.anchor.key===r.getKey()&&n===r.getTextContentSize()||!t?Pi():_t$1(this.getTag()),i=this.getDirection();if(o.setDirection(i),this.insertAfter(o,e),0===n&&!this.isEmpty()&&t){const t=Pi();t.select(),this.replace(t,true);}return o}collapseAtStart(){const t=this.isEmpty()?Pi():_t$1(this.getTag());return this.getChildren().forEach((e=>t.append(e))),this.replace(t),true}extractWithChild(){return  true}};function Et(t){return "span"===t.nodeName.toLowerCase()&&"26pt"===t.style.fontSize}function Ot(t){const e=t.nodeName.toLowerCase();let n=null;return "h1"!==e&&"h2"!==e&&"h3"!==e&&"h4"!==e&&"h5"!==e&&"h6"!==e||(n=_t$1(e),null!==t.style&&(ko(t,n),n.setFormat(t.style.textAlign))),{node:n}}function Tt$1(t){const e=xt$1();return null!==t.style&&(e.setFormat(t.style.textAlign),ko(t,e)),{node:e}}function _t$1(t="h1"){return eo(new Nt$1(t))}function At(t){return t instanceof Nt$1}function Ft$1(t){let e=null;if(Lt$1(t,DragEvent)?e=t.dataTransfer:Lt$1(t,ClipboardEvent)&&(e=t.clipboardData),null===e)return [false,[],false];const n=e.types,r=n.includes("Files"),o=n.includes("text/html")||n.includes("text/plain");return [r,Array.from(e.files),o]}function St$1(t){const e=Nr();if(!cr(e))return  false;const n=new Set,r=e.getNodes();for(let e=0;e<r.length;e++){const o=r[e],i=o.getKey();if(n.has(i))continue;const s=wt$2(o,(t=>di(t)&&!t.isInline()));if(null===s)continue;const a=s.getKey();s.canIndent()&&!n.has(a)&&(n.add(a),t(s));}return n.size>0}function It$1(t){const e=ds(t);return _i(e)}function Pt$1(t){for(const e of ["lowercase","uppercase","capitalize"])t.hasFormat(e)&&t.toggleFormat(e);}function Mt$1(o){return j$2(o.registerCommand(ae,(t=>{const e=Nr();return !!ur(e)&&(e.clear(),true)}),0),o.registerCommand(ue,(t=>{const e=Nr();return cr(e)?(e.deleteCharacter(t),true):!!ur(e)&&(e.deleteNodes(),true)}),Li),o.registerCommand(pe,(t=>{const e=Nr();return !!cr(e)&&(e.deleteWord(t),true)}),Li),o.registerCommand(ye,(t=>{const e=Nr();return !!cr(e)&&(e.deleteLine(t),true)}),Li),o.registerCommand(he,(e=>{const n=Nr();if("string"==typeof e)null!==n&&n.insertText(e);else {if(null===n)return  false;const r=e.dataTransfer;if(null!=r)D$1(r,n,o);else if(cr(n)){const t=e.data;return t&&n.insertText(t),true}}return  true}),Li),o.registerCommand(_e,(()=>{const t=Nr();return !!cr(t)&&(t.removeText(),true)}),Li),o.registerCommand(me,(t=>{const e=Nr();return !!cr(e)&&(e.formatText(t),true)}),Li),o.registerCommand(Ke,(t=>{const e=Nr();if(!cr(e)&&!ur(e))return  false;const n=e.getNodes();for(const e of n){const n=wt$2(e,(t=>di(t)&&!t.isInline()));null!==n&&n.setFormat(t);}return  true}),Li),o.registerCommand(fe,(t=>{const e=Nr();return !!cr(e)&&(e.insertLineBreak(t),true)}),Li),o.registerCommand(de,(()=>{const t=Nr();return !!cr(t)&&(t.insertParagraph(),true)}),Li),o.registerCommand(Fe,(()=>(Fr([er()]),true)),Li),o.registerCommand(Le,(()=>St$1((t=>{const e=t.getIndent();t.setIndent(e+1);}))),Li),o.registerCommand(Ie,(()=>St$1((t=>{const e=t.getIndent();e>0&&t.setIndent(Math.max(0,e-1));}))),Li),o.registerCommand(Ne,(t=>{const e=Nr();if(ur(e)){const t=e.getNodes();if(t.length>0)return t[0].selectPrevious(),true}else if(cr(e)){const n=Ks(e.focus,true);if(!t.shiftKey&&_i(n)&&!n.isIsolated()&&!n.isInline())return n.selectPrevious(),t.preventDefault(),true}return  false}),Li),o.registerCommand(we,(t=>{const e=Nr();if(ur(e)){const t=e.getNodes();if(t.length>0)return t[0].selectNext(0,0),true}else if(cr(e)){if(function(t){const e=t.focus;return "root"===e.key&&e.offset===_s().getChildrenSize()}(e))return t.preventDefault(),true;const n=Ks(e.focus,false);if(!t.shiftKey&&_i(n)&&!n.isIsolated()&&!n.isInline())return n.selectNext(),t.preventDefault(),true}return  false}),Li),o.registerCommand(Te,(t=>{const e=Nr();if(ur(e)){const n=e.getNodes();if(n.length>0)return t.preventDefault(),n[0].selectPrevious(),true}if(!cr(e))return  false;if(X$3(e,true)){const n=t.shiftKey;return t.preventDefault(),J$4(e,n,true),true}return  false}),Li),o.registerCommand(ve,(t=>{const e=Nr();if(ur(e)){const n=e.getNodes();if(n.length>0)return t.preventDefault(),n[0].selectNext(0,0),true}if(!cr(e))return  false;const o=t.shiftKey;return !!X$3(e,false)&&(t.preventDefault(),J$4(e,o,false),true)}),Li),o.registerCommand(Ae,(t=>{if(It$1(t.target))return  false;const e=Nr();if(cr(e)){if(function(t){if(!t.isCollapsed())return  false;const{anchor:e}=t;if(0!==e.offset)return  false;const n=e.getNode();if(yi(n))return  false;const r=yt$3(n);return r.getIndent()>0&&(r.is(n)||n.is(r.getFirstDescendant()))}(e))return t.preventDefault(),o.dispatchCommand(Ie,void 0);if(ht$1&&"ko-KR"===navigator.language)return  false}else if(!ur(e))return  false;return t.preventDefault(),o.dispatchCommand(ue,true)}),Li),o.registerCommand(De,(t=>{if(It$1(t.target))return  false;const e=Nr();return !(!cr(e)&&!ur(e))&&(t.preventDefault(),o.dispatchCommand(ue,false))}),Li),o.registerCommand(Ee,(t=>{const e=Nr();if(!cr(e))return  false;if(Pt$1(e),null!==t){if((ht$1||pt$1||vt$1)&&gt$1)return  false;if(t.preventDefault(),t.shiftKey)return o.dispatchCommand(fe,false)}return o.dispatchCommand(de,void 0)}),Li),o.registerCommand(Oe,(()=>{const t=Nr();return !!cr(t)&&(o.blur(),true)}),Li),o.registerCommand(ze,(t=>{const[,e]=Ft$1(t);if(e.length>0){const n=dt$1(t.clientX,t.clientY);if(null!==n){const{offset:t,node:r}=n,i=ds(r);if(null!==i){const e=vr();if(Qn(i))e.anchor.set(i.getKey(),t,"text"),e.focus.set(i.getKey(),t,"text");else {const t=i.getParentOrThrow().getKey(),n=i.getIndexWithinParent()+1;e.anchor.set(t,n,"element"),e.focus.set(t,n,"element");}const n=vt$4(e);ys(n);}o.dispatchCommand(yt$1,e);}return t.preventDefault(),true}const n=Nr();return !!cr(n)}),Li),o.registerCommand(Be,(t=>{const[e]=Ft$1(t),n=Nr();return !(e&&!cr(n))}),Li),o.registerCommand(Re,(t=>{const[e]=Ft$1(t),n=Nr();if(e&&!cr(n))return  false;const r=dt$1(t.clientX,t.clientY);if(null!==r){const e=ds(r.node);_i(e)&&t.preventDefault();}return  true}),Li),o.registerCommand($e,(()=>(Ps(),true)),Li),o.registerCommand(Je,(t=>(_$1(o,Lt$1(t,ClipboardEvent)?t:null),true)),Li),o.registerCommand(Ue,(t=>(async function(t,n){await _$1(n,Lt$1(t,ClipboardEvent)?t:null),n.update((()=>{const t=Nr();cr(t)?t.removeText():ur(t)&&t.getNodes().forEach((t=>t.remove()));}));}(t,o),true)),Li),o.registerCommand(ge,(e=>{const[,n,r]=Ft$1(e);if(n.length>0&&!r)return o.dispatchCommand(yt$1,n),true;if(fo(e.target)&&Yi(e.target))return  false;return null!==Nr()&&(function(e,n){e.preventDefault(),n.update((()=>{const r=Nr(),o=Lt$1(e,InputEvent)||Lt$1(e,KeyboardEvent)?null:e.clipboardData;null!=o&&null!==r&&D$1(o,r,n);}),{tag:bi});}(e,o),true)}),Li),o.registerCommand(Me,(t=>{const e=Nr();return cr(e)&&Pt$1(e),false}),Li),o.registerCommand(Pe,(t=>{const e=Nr();return cr(e)&&Pt$1(e),false}),Li))}

function formatCheckList(editor, currentBlockType, updateToolbarState) {
	if (currentBlockType !== "check") {
		editor.dispatchCommand(ut$1, void 0);
		updateToolbarState("blockType", "check");
	} else formatParagraph(editor, updateToolbarState);
}
const formatCode = (editor, blockType, updateToolbarState) => {
	if (blockType !== "code") {
		editor.update(() => {
			let selection = Nr();
			if (!selection) return;
			if (!cr(selection) || selection.isCollapsed()) _$2(selection, () => z$3());
			else {
				const textContent = selection.getTextContent();
				const codeNode = z$3();
				selection.insertNodes([codeNode]);
				selection = Nr();
				if (cr(selection)) selection.insertRawText(textContent);
			}
		});
		updateToolbarState("blockType", "code");
	}
};
function formatParagraph(editor, updateToolbarState) {
	editor.update(() => {
		const selection = Nr();
		_$2(selection, () => Pi());
		updateToolbarState("blockType", "paragraph");
	});
}
const formatHeading = (editor, blockType, headingSize, updateToolbarState) => {
	if (blockType !== headingSize) editor.update(() => {
		const selection = Nr();
		if (cr(selection)) {
			const anchorNode = selection.anchor.getNode();
			let element = anchorNode.getKey() === "root" ? anchorNode : wt$2(anchorNode, (e) => {
				const parent = e.getParent();
				return parent !== null && Zs(parent);
			});
			if (element === null) element = anchorNode.getTopLevelElementOrThrow();
			const currentBlockType = At(element) ? element.getTag() : at$1(element) ? element.getListType() : element.getType();
			if (currentBlockType === headingSize) {
				_$2(selection, () => Pi());
				updateToolbarState("blockType", "paragraph");
			} else {
				_$2(selection, () => _t$1(headingSize));
				updateToolbarState("blockType", headingSize);
			}
		}
	});
};
const formatQuote = (editor, blockType, updateToolbarState) => {
	if (blockType !== "quote") editor.update(() => {
		const selection = Nr();
		_$2(selection, () => xt$1());
		updateToolbarState("blockType", "paragraph");
	});
};
const formatBulletList = (editor, blockType, updateToolbarState) => {
	if (blockType !== "bullet") {
		editor.dispatchCommand(_t$2, void 0);
		updateToolbarState("blockType", "bullet");
	} else formatParagraph(editor, updateToolbarState);
};
const formatOrderedList = (editor, blockType, updateToolbarState) => {
	if (blockType !== "number") {
		editor.dispatchCommand(yt$2, void 0);
		updateToolbarState("blockType", "number");
	} else {
		editor.dispatchCommand(Ct$2, void 0);
		updateToolbarState("blockType", "paragraph");
	}
};

//#region src/components/editor/BlockTypeDropdown.tsx
function BlockTypeDropdown({ blockType }) {
	const [editor] = o$3();
	const { updateToolbarState } = useToolbarState();
	const handleSelect = (value) => {
		switch (value) {
			case "bullet":
				formatBulletList(editor, blockType, updateToolbarState);
				break;
			case "check":
				formatCheckList(editor, blockType, updateToolbarState);
				break;
			case "code":
				formatCode(editor, blockType, updateToolbarState);
				break;
			case "h1":
			case "h2":
			case "h3":
			case "h4":
			case "h5":
			case "h6":
				formatHeading(editor, blockType, value, updateToolbarState);
				break;
			case "number":
				formatOrderedList(editor, blockType, updateToolbarState);
				break;
			case "paragraph":
				formatParagraph(editor, updateToolbarState);
				break;
			case "quote":
				formatQuote(editor, blockType, updateToolbarState);
				break;
		}
	};
	return /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Select, {
		onValueChange: handleSelect,
		value: blockType,
		children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.SelectTrigger, {
			className: "w-40",
			children: /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.SelectValue, { placeholder: "Block Type" })
		}), /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.SelectContent, { children: Object.keys(blockTypeToBlockName).map((type) => /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.SelectItem, {
			value: type,
			children: blockTypeToBlockName[type]
		}, type)) })]
	});
}

//#region src/components/editor/ToolbarPlugin.tsx
const defaultToolbarOptions = [
	"bold",
	"italic",
	"underline",
	"undo",
	"redo",
	"blockTypes"
];
const formatToStateKey = {
	bold: "isBold",
	clear: "isClear",
	italic: "isItalic",
	strikethrough: "isStrikethrough",
	subscript: "isSubscript",
	superscript: "isSuperscript",
	underline: "isUnderline"
};
const ToolbarButton = ({ children, command, disabled, payload, title }) => {
	const [editor] = o$3();
	const { toolbarState, updateToolbarState } = useToolbarState();
	const isActive = command === me ? toolbarState[formatToStateKey[payload]] : false;
	const handleClick = () => {
		editor.dispatchCommand(command, payload);
	};
	if (command === me) {
		const stateKey = formatToStateKey[payload];
		return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Toggle, {
			"aria-label": title,
			disabled,
			onPressedChange: (pressed) => {
				handleClick();
				updateToolbarState(stateKey, pressed);
				if (payload === "clear") setTimeout(() => {
					updateToolbarState(stateKey, false);
				}, 300);
			},
			pressed: toolbarState[stateKey],
			size: "sm",
			title,
			children
		});
	}
	return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
		className: isActive ? "bg-gray-200" : "",
		disabled,
		onClick: handleClick,
		size: "icon",
		title,
		variant: "ghost",
		children
	});
};
function ToolbarPlugin({ enablePreview = true, isPreview, setIsPreview, toolbarOptions = defaultToolbarOptions }) {
	const [editor] = o$3();
	const { toolbarState, updateToolbarState } = useToolbarState();
	const [canUndo, setCanUndo] = dashboard__loadShare__react__loadShare__.useState(false);
	const [canRedo, setCanRedo] = dashboard__loadShare__react__loadShare__.useState(false);
	const $updateToolbar = React3.useCallback(() => {
		const selection = Nr();
		if (cr(selection)) {
			updateToolbarState("isBold", selection.hasFormat("bold"));
			updateToolbarState("isItalic", selection.hasFormat("italic"));
			updateToolbarState("isStrikethrough", selection.hasFormat("strikethrough"));
			updateToolbarState("isSubscript", selection.hasFormat("subscript"));
			updateToolbarState("isSuperscript", selection.hasFormat("superscript"));
			updateToolbarState("isUnderline", selection.hasFormat("underline"));
			const anchorNode = selection.anchor.getNode();
			let element = anchorNode.getKey() === "root" ? anchorNode : wt$2(anchorNode, (e) => {
				const parent = e.getParent();
				return parent !== null && Zs(parent);
			});
			if (element === null) element = anchorNode.getTopLevelElementOrThrow();
			const type = At(element) ? element.getTag() : at$1(element) ? element.getListType() : element.getType();
			if (type in blockTypeToBlockName) updateToolbarState("blockType", type);
		}
	}, [updateToolbarState]);
	React3.useEffect(() => {
		return j$2(editor.registerCommand(le, () => {
			$updateToolbar();
			return false;
		}, Bi), editor.registerUpdateListener(({ editorState }) => {
			editorState.read(() => {
				$updateToolbar();
			});
		}));
	}, [editor, $updateToolbar]);
	dashboard__loadShare__react__loadShare__.useEffect(() => {
		if (!enablePreview) setIsPreview(false);
		if (enablePreview) editor.setEditable(!isPreview);
	}, [
		editor,
		enablePreview,
		isPreview,
		setIsPreview
	]);
	dashboard__loadShare__react__loadShare__.useEffect(() => {
		return j$2(editor.registerCommand(He, (payload) => {
			setCanUndo(payload);
			return false;
		}, Bi), editor.registerCommand(Ye, (payload) => {
			setCanRedo(payload);
			return false;
		}, Bi));
	}, [editor]);
	return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
		className: "w-full border-b z-10 relative",
		children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
			className: "flex space-x-2 justify-center p-1",
			children: [
				toolbarOptions.includes("clear") && /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarButton, {
					command: me,
					disabled: isPreview,
					payload: "clear",
					title: "Clear Formatting",
					children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReloadIcon, { className: "text-muted-foreground" })
				}),
				toolbarOptions.includes("undo") && /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
					className: "h-8 px-2",
					disabled: !canUndo || isPreview,
					onClick: () => editor.dispatchCommand(xe, void 0),
					title: "Undo (Ctrl+Z)",
					variant: "ghost",
					children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReloadIcon, { className: "transform -scale-x-100" })
				}),
				toolbarOptions.includes("redo") && /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
					className: "h-8 px-2",
					disabled: !canRedo || isPreview,
					onClick: () => editor.dispatchCommand(Ce, void 0),
					title: "Redo (Ctrl+Y)",
					variant: "ghost",
					children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReloadIcon, { className: "rotate-180" })
				}),
				enablePreview && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
					className: "flex items-center gap-1 pr-2",
					children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
						onClick: () => setIsPreview(false),
						size: "sm",
						type: "button",
						variant: !isPreview ? "secondary" : "ghost",
						children: "Write"
					}), /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
						onClick: () => setIsPreview(true),
						size: "sm",
						type: "button",
						variant: isPreview ? "secondary" : "ghost",
						children: "Preview"
					})]
				}),
				toolbarOptions.includes("blockTypes") && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Separator, {
					className: "h-auto my-1",
					orientation: "vertical"
				}), /* @__PURE__ */ jsxRuntimeExports.jsx(BlockTypeDropdown, { blockType: toolbarState.blockType })] }),
				toolbarOptions.includes("bold") && /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarButton, {
					command: me,
					disabled: isPreview,
					payload: "bold",
					title: "Bold (Ctrl+B)",
					children: /* @__PURE__ */ jsxRuntimeExports.jsx(FontBoldIcon, {})
				}),
				toolbarOptions.includes("italic") && /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarButton, {
					command: me,
					disabled: isPreview,
					payload: "italic",
					title: "Italic (Ctrl+I)",
					children: /* @__PURE__ */ jsxRuntimeExports.jsx(FontItalicIcon, {})
				}),
				toolbarOptions.includes("underline") && /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarButton, {
					command: me,
					disabled: isPreview,
					payload: "underline",
					title: "Underline (Ctrl+U)",
					children: /* @__PURE__ */ jsxRuntimeExports.jsx(UnderlineIcon, {})
				})
			]
		})
	});
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const h$4=new Set(["http:","https:","mailto:","sms:","tel:"]);let g$3 = class g extends fi{static getType(){return "link"}static clone(t){return new g(t.__url,{rel:t.__rel,target:t.__target,title:t.__title},t.__key)}constructor(t="",e={},r){super(r);const{target:n=null,rel:i=null,title:s=null}=e;this.__url=t,this.__target=n,this.__rel=i,this.__title=s;}createDOM(e){const r=document.createElement("a");return r.href=this.sanitizeUrl(this.__url),null!==this.__target&&(r.target=this.__target),null!==this.__rel&&(r.rel=this.__rel),null!==this.__title&&(r.title=this.__title),rt$2(r,e.theme.link),r}updateDOM(t,r,n){if(ao(r)){const e=this.__url,n=this.__target,i=this.__rel,s=this.__title;e!==t.__url&&(r.href=e),n!==t.__target&&(n?r.target=n:r.removeAttribute("target")),i!==t.__rel&&(i?r.rel=i:r.removeAttribute("rel")),s!==t.__title&&(s?r.title=s:r.removeAttribute("title"));}return  false}static importDOM(){return {a:t=>({conversion:f$4,priority:1})}}static importJSON(t){return d$2().updateFromJSON(t)}updateFromJSON(t){return super.updateFromJSON(t).setURL(t.url).setRel(t.rel||null).setTarget(t.target||null).setTitle(t.title||null)}sanitizeUrl(t){try{const e=new URL(t);if(!h$4.has(e.protocol))return "about:blank"}catch(e){return t}return t}exportJSON(){return {...super.exportJSON(),rel:this.getRel(),target:this.getTarget(),title:this.getTitle(),url:this.getURL()}}getURL(){return this.getLatest().__url}setURL(t){const e=this.getWritable();return e.__url=t,e}getTarget(){return this.getLatest().__target}setTarget(t){const e=this.getWritable();return e.__target=t,e}getRel(){return this.getLatest().__rel}setRel(t){const e=this.getWritable();return e.__rel=t,e}getTitle(){return this.getLatest().__title}setTitle(t){const e=this.getWritable();return e.__title=t,e}insertNewAfter(t,e=true){const r=d$2(this.__url,{rel:this.__rel,target:this.__target,title:this.__title});return this.insertAfter(r,e),r}canInsertTextBefore(){return  false}canInsertTextAfter(){return  false}canBeEmpty(){return  false}isInline(){return  true}extractWithChild(t,e,r){if(!cr(e))return  false;const n=e.anchor.getNode(),i=e.focus.getNode();return this.isParentOf(n)&&this.isParentOf(i)&&e.getTextContent().length>0}isEmailURI(){return this.__url.startsWith("mailto:")}isWebSiteURI(){return this.__url.startsWith("https://")||this.__url.startsWith("http://")}};function f$4(t){let r=null;if(ao(t)){const e=t.textContent;(null!==e&&""!==e||t.children.length>0)&&(r=d$2(t.getAttribute("href")||"",{rel:t.getAttribute("rel"),target:t.getAttribute("target"),title:t.getAttribute("title")}));}return {node:r}}function d$2(t="",e){return eo(new g$3(t,e))}function p$2(t){return t instanceof g$3}let m$3 = class m extends g$3{constructor(t="",e={},r){super(t,e,r),this.__isUnlinked=void 0!==e.isUnlinked&&null!==e.isUnlinked&&e.isUnlinked;}static getType(){return "autolink"}static clone(t){return new m(t.__url,{isUnlinked:t.__isUnlinked,rel:t.__rel,target:t.__target,title:t.__title},t.__key)}getIsUnlinked(){return this.__isUnlinked}setIsUnlinked(t){const e=this.getWritable();return e.__isUnlinked=t,e}createDOM(t){return this.__isUnlinked?document.createElement("span"):super.createDOM(t)}updateDOM(t,e,r){return super.updateDOM(t,e,r)||t.__isUnlinked!==this.__isUnlinked}static importJSON(t){return U$1().updateFromJSON(t)}updateFromJSON(t){return super.updateFromJSON(t).setIsUnlinked(t.isUnlinked||false)}static importDOM(){return null}exportJSON(){return {...super.exportJSON(),isUnlinked:this.__isUnlinked}}insertNewAfter(t,e=true){const r=this.getParentOrThrow().insertNewAfter(t,e);if(di(r)){const t=U$1(this.__url,{isUnlinked:this.__isUnlinked,rel:this.__rel,target:this.__target,title:this.__title});return r.append(t),t}return null}};function U$1(t="",e){return eo(new m$3(t,e))}function O$1(t){return t instanceof m$3}const k$2=oe("TOGGLE_LINK_COMMAND");function v$2(t,e){if("element"===t.type){const r=t.getNode();di(r)||function(t,...e){const r=new URL("https://lexical.dev/docs/error"),n=new URLSearchParams;n.append("code",t);for(const t of e)n.append("v",t);throw r.search=n.toString(),Error(`Minified Lexical error #${t}; visit ${r.toString()} for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`)}(252);return r.getChildren()[t.offset+e]||null}return null}function N(t,e={}){const{target:n,title:i}=e,l=void 0===e.rel?"noreferrer":e.rel,h=Nr();if(null===h||!cr(h)&&!ur(h))return;if(ur(h)){const e=h.getNodes();if(0===e.length)return;return void e.forEach((e=>{if(null===t){const t=wt$2(e,(t=>!O$1(t)&&p$2(t)));t&&(t.insertBefore(e),0===t.getChildren().length&&t.remove());}else {const i=wt$2(e,(t=>!O$1(t)&&p$2(t)));if(i)i.setURL(t),void 0!==n&&i.setTarget(n),void 0!==l&&i.setRel(l);else {const r=d$2(t,{rel:l,target:n});e.insertBefore(r),r.append(e);}}}))}const g=h.extract();if(null===t)return void g.forEach((t=>{const e=wt$2(t,(t=>!O$1(t)&&p$2(t)));if(e){const t=e.getChildren();for(let r=0;r<t.length;r++)e.insertBefore(t[r]);e.remove();}}));const f=new Set,m=e=>{f.has(e.getKey())||(f.add(e.getKey()),e.setURL(t),void 0!==n&&e.setTarget(n),void 0!==l&&e.setRel(l),void 0!==i&&e.setTitle(i));};if(1===g.length){const t=x$4(g[0],p$2);if(null!==t)return m(t)}!function(t){const e=Nr();if(!cr(e))return t();const r=vt$4(e),n=r.isBackward(),i=v$2(r.anchor,n?-1:0),l=v$2(r.focus,n?0:-1);t();if(i||l){const t=Nr();if(cr(t)){const e=t.clone();if(i){const t=i.getParent();t&&e.anchor.set(t.getKey(),i.getIndexWithinParent()+(n?1:0),"element");}if(l){const t=l.getParent();t&&e.focus.set(t.getKey(),l.getIndexWithinParent()+(n?0:1),"element");}ys(vt$4(e));}}}((()=>{let e=null;for(const r of g){if(!r.isAttached())continue;const s=x$4(r,p$2);if(s){m(s);continue}if(di(r)){if(!r.isInline())continue;if(p$2(r)){if(!(O$1(r)||null!==e&&e.getParentOrThrow().isParentOf(r))){m(r),e=r;continue}for(const t of r.getChildren())r.insertBefore(t);r.remove();continue}}const u=r.getPreviousSibling();p$2(u)&&u.is(e)?u.append(r):(e=d$2(t,{rel:l,target:n,title:i}),r.insertAfter(e),e.append(r));}}));}function x$4(t,e){let r=t;for(;null!==r&&null!==r.getParent()&&!e(r);)r=r.getParentOrThrow();return e(r)?r:null}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

function M$1(t,e){const n={};for(const o of t){const t=e(o);t&&(n[t]?n[t].push(o):n[t]=[o]);}return n}function j(t){const e=M$1(t,(t=>t.type));return {element:e.element||[],multilineElement:e["multiline-element"]||[],textFormat:e["text-format"]||[],textMatch:e["text-match"]||[]}}const A$1=/[!-/:-@[-`{-~\s]/,z$1=/^\s{0,3}$/;function U(n){if(!Fi(n))return  false;const o=n.getFirstChild();return null==o||1===n.getChildrenSize()&&Qn(o)&&z$1.test(o.getTextContent())}const W=/^\+?[0-9\s()-]{5,}$/;function J(t,e){const n=function(t,e){const n=t.match(e.openTagsRegExp);if(null==n)return null;for(const o of n){const n=o.replace(/^\s/,""),r=e.fullMatchRegExpByTag[n];if(null==r)continue;const i=t.match(r),s=e.transformersByTag[n];if(null!=i&&null!=s){if(false!==s.intraword)return i;const{index:e=0}=i,n=t[e-1],o=t[e+i[0].length];if((!n||A$1.test(n))&&(!o||A$1.test(o)))return i}}return null}(t.getTextContent(),e);if(!n)return null;const o=n.index||0;return {endIndex:o+n[0].length,match:n,startIndex:o,transformer:e.transformersByTag[n[1]]}}function K(t){return Qn(t)&&!t.hasFormat("code")}function Q(t,e,n){let o=J(t,e),r=function(t,e){const n=t;let o,r,i,s;for(const t of e){if(!t.replace||!t.importRegExp)continue;const e=n.getTextContent().match(t.importRegExp);if(!e)continue;const l=e.index||0,c=t.getEndIndex?t.getEndIndex(n,e):l+e[0].length;false!==c&&(void 0===o||void 0===r||l<o&&c>r)&&(o=l,r=c,i=t,s=e);}return void 0===o||void 0===r||void 0===i||void 0===s?null:{endIndex:r,match:s,startIndex:o,transformer:i}}(t,n);if(o&&r&&(o.startIndex<=r.startIndex&&o.endIndex>=r.endIndex?r=null:o=null),o){const r=function(t,e,n,o,r){const i=t.getTextContent();let s,l,c;if(r[0]===i?s=t:0===e?[s,l]=t.splitText(n):[c,s,l]=t.splitText(e,n),s.setTextContent(r[2]),o)for(const t of o.format)s.hasFormat(t)||s.toggleFormat(t);return {nodeAfter:l,nodeBefore:c,transformedNode:s}}(t,o.startIndex,o.endIndex,o.transformer,o.match);K(r.nodeAfter)&&Q(r.nodeAfter,e,n),K(r.nodeBefore)&&Q(r.nodeBefore,e,n),K(r.transformedNode)&&Q(r.transformedNode,e,n);}else if(r){const o=function(t,e,n,o,r){let i,s,l;return 0===e?[i,s]=t.splitText(n):[l,i,s]=t.splitText(e,n),o.replace?{nodeAfter:s,nodeBefore:l,transformedNode:o.replace(i,r)||void 0}:null}(t,r.startIndex,r.endIndex,r.transformer,r.match);if(!o)return;K(o.nodeAfter)&&Q(o.nodeAfter,e,n),K(o.nodeBefore)&&Q(o.nodeBefore,e,n),K(o.transformedNode)&&Q(o.transformedNode,e,n);}const i=t.getTextContent().replace(/\\([*_`~\\])/g,"$1").replace(/&#(\d+);/g,((t,e)=>String.fromCodePoint(e)));t.setTextContent(i);}function V(t,e=false){const o=j(t),r=function(t){const e={},n={},o=[],r="(?<![\\\\])";for(const r of t){const{tag:t}=r;e[t]=r;const i=t.replace(/(\*|\^|\+)/g,"\\$1");o.push(i),1===t.length?n[t]=new RegExp(`(?<![\\\\${i}])(${i})((\\\\${i})?.*?[^${i}\\s](\\\\${i})?)((?<!\\\\)|(?<=\\\\\\\\))(${i})(?![\\\\${i}])`):n[t]=new RegExp(`(?<!\\\\)(${i})((\\\\${i})?.*?[^\\s](\\\\${i})?)((?<!\\\\)|(?<=\\\\\\\\))(${i})(?!\\\\)`);}return {fullMatchRegExpByTag:n,openTagsRegExp:new RegExp(`${r}(${o.join("|")})`,"g"),transformersByTag:e}}(o.textFormat);return (t,i)=>{const l=t.split("\n"),c=l.length,f=i||_s();f.clear();for(let t=0;t<c;t++){const n=l[t],[i,s]=X$1(l,t,o.multilineElement,f);i?t=s:Y(n,f,o.element,r,o.textMatch,e);}const a=f.getChildren();for(const t of a)!e&&U(t)&&f.getChildrenSize()>1&&t.remove();null!==Nr()&&f.selectStart();}}function X$1(t,e,n,o){for(const r of n){const{handleImportAfterStartMatch:n,regExpEnd:i,regExpStart:s,replace:l}=r,c=t[e].match(s);if(!c)continue;if(n){const i=n({lines:t,rootNode:o,startLineIndex:e,startMatch:c,transformer:r});if(null===i)continue;if(i)return i}const f="object"==typeof i&&"regExp"in i?i.regExp:i,a=i&&"object"==typeof i&&"optional"in i?i.optional:!i;let u=e;const g=t.length;for(;u<g;){const n=f?t[u].match(f):null;if(!n&&(!a||a&&u<g-1)){u++;continue}if(n&&e===u&&n.index===c.index){u++;continue}const r=[];if(n&&e===u)r.push(t[e].slice(c[0].length,-n[0].length));else for(let o=e;o<=u;o++)if(o===e){const e=t[o].slice(c[0].length);r.push(e);}else if(o===u&&n){const e=t[o].slice(0,-n[0].length);r.push(e);}else r.push(t[o]);if(false!==l(o,null,c,n,r,true))return [true,u];break}}return [false,e]}function Y(e,n,o,r,i,s){const a=Xn(e),u=Pi();u.append(a),n.append(u);for(const{regExp:t,replace:n}of o){const o=e.match(t);if(o&&(a.setTextContent(e.slice(o[0].length)),false!==n(u,[a],o,true)))break}if(Q(a,r,i),u.isAttached()&&e.length>0){const e=u.getPreviousSibling();if(!s&&(Fi(e)||wt$1(e)||at$1(e))){let t=e;if(at$1(e)){const n=e.getLastDescendant();t=null==n?null:wt$2(n,nt$1);}null!=t&&t.getTextContentSize()>0&&(t.splice(t.getChildrenSize(),0,[Pn(),...u.getChildren()]),u.remove());}}}function Z(t,...e){const n=new URL("https://lexical.dev/docs/error"),o=new URLSearchParams;o.append("code",t);for(const t of e)o.append("v",t);throw n.search=o.toString(),Error(`Minified Lexical error #${t}; visit ${n.toString()} for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`)}function tt(t,e,n){const o=n.length;for(let r=e;r>=o;r--){const e=r-o;if(et(t,e,n,0,o)&&" "!==t[e+o])return e}return  -1}function et(t,e,n,o,r){for(let i=0;i<r;i++)if(t[e+i]!==n[o+i])return  false;return  true}function nt(t,n=Mt){const o=j(n),r=M$1(o.textFormat,(({tag:t})=>t[t.length-1])),l=M$1(o.textMatch,(({trigger:t})=>t));for(const e of n){const n=e.type;if("element"===n||"text-match"===n||"multiline-element"===n){const n=e.dependencies;for(const e of n)t.hasNode(e)||Z(173,e.getType());}}const c=(t,n,c)=>{(function(t,e,n,o){const r=t.getParent();if(!Zs(r)||t.getFirstChild()!==e)return  false;const i=e.getTextContent();if(" "!==i[n-1])return  false;for(const{regExp:r,replace:s}of o){const o=i.match(r);if(o&&o[0].length===(o[0].endsWith(" ")?n:n-1)){const r=e.getNextSiblings(),[i,l]=e.splitText(n);if(i.remove(),false!==s(t,l?[l,...r]:r,o,false))return  true}}return  false})(t,n,c,o.element)||function(t,e,n,o){const r=t.getParent();if(!Zs(r)||t.getFirstChild()!==e)return  false;const i=e.getTextContent();if(" "!==i[n-1])return  false;for(const{regExpStart:r,replace:s,regExpEnd:l}of o){if(l&&!("optional"in l)||l&&"optional"in l&&!l.optional)continue;const o=i.match(r);if(o&&o[0].length===(o[0].endsWith(" ")?n:n-1)){const r=e.getNextSiblings(),[i,l]=e.splitText(n);if(i.remove(),false!==s(t,l?[l,...r]:r,o,null,null,false))return  true}}return  false}(t,n,c,o.multilineElement)||function(t,e,n){let o=t.getTextContent();const r=n[o[e-1]];if(null==r)return  false;e<o.length&&(o=o.slice(0,e));for(const e of r){if(!e.replace||!e.regExp)continue;const n=o.match(e.regExp);if(null===n)continue;const r=n.index||0,i=r+n[0].length;let s;return 0===r?[s]=t.splitText(i):[,s]=t.splitText(r,i),s.selectNext(0,0),e.replace(s,n),true}return  false}(n,c,l)||function(t,n,o){const r=t.getTextContent(),l=n-1,c=r[l],f=o[c];if(!f)return  false;for(const n of f){const{tag:o}=n,f=o.length,a=l-f+1;if(f>1&&!et(r,a,o,0,f))continue;if(" "===r[a-1])continue;const u=r[l+1];if(false===n.intraword&&u&&!A$1.test(u))continue;const p=t;let h=p,x=tt(r,a,o),T=h;for(;x<0&&(T=T.getPreviousSibling())&&!Fn(T);)if(Qn(T)){if(T.hasFormat("code"))continue;const t=T.getTextContent();h=T,x=tt(t,t.length,o);}if(x<0)continue;if(h===p&&x+f===a)continue;const C=h.getTextContent();if(x>0&&C[x-1]===c)continue;const E=C[x-1];if(false===n.intraword&&E&&!A$1.test(E))continue;const y=p.getTextContent(),$=y.slice(0,a)+y.slice(l+1);p.setTextContent($);const v=h===p?$:C;h.setTextContent(v.slice(0,x)+v.slice(x+f));const S=Nr(),b=vr();ys(b);const F=l-f*(h===p?2:1)+1;b.anchor.set(h.__key,x,"text"),b.focus.set(p.__key,F,"text");for(const t of n.format)b.hasFormat(t)||b.formatText(t);b.anchor.set(b.focus.key,b.focus.offset,b.focus.type);for(const t of n.format)b.hasFormat(t)&&b.toggleFormat(t);return cr(S)&&(b.format=S.format),true}}(n,c,r);};return t.registerUpdateListener((({tags:n,dirtyLeaves:o,editorState:r,prevEditorState:i})=>{if(n.has(Ni)||n.has(vi))return;if(t.isComposing())return;const l=r.read(Nr),f=i.read(Nr);if(!cr(f)||!cr(l)||!l.isCollapsed()||l.is(f))return;const p=l.anchor.key,d=l.anchor.offset,m=r._nodeMap.get(p);!Qn(m)||!o.has(p)||1!==d&&d>f.anchor.offset+1||t.update((()=>{if(!K(m))return;const t=m.getParent();null===t||J$2(t)||c(t,m,l.anchor.offset);}));}))}const ot=/^(\s*)(\d{1,})\.\s/,rt=/^(\s*)[-*+]\s/,it=/^(\s*)(?:-\s)?\s?(\[(\s|x)?\])\s/i,st=/^(#{1,6})\s/,lt=/^>\s/,ct=/^[ \t]*```(\w+)?/,ft=/[ \t]*```$/,at=/^[ \t]*```[^`]+(?:(?:`{1,2}|`{4,})[^`]+)*```(?:[^`]|$)/,ut=/^(?:\|)(.+)(?:\|)\s?$/,gt=/^(\| ?:?-*:? ?)+\|\s?$/,pt=t=>(e,n,o)=>{const r=t(o);r.append(...n),e.replace(r),r.select(0,0);};const dt=t=>(e,n,o)=>{const r=e.getPreviousSibling(),i=e.getNextSibling(),s=et$1("check"===t?"x"===o[3]:void 0);if(at$1(i)&&i.getListType()===t){const t=i.getFirstChild();null!==t?t.insertBefore(s):i.append(s),e.remove();}else if(at$1(r)&&r.getListType()===t)r.append(s),e.remove();else {const n=ct$1(t,"number"===t?Number(o[2]):void 0);n.append(s),e.replace(n);}s.append(...n),s.select(0,0);const l=function(t){const e=t.match(/\t/g),n=t.match(/ /g);let o=0;return e&&(o+=e.length),n&&(o+=Math.floor(n.length/4)),o}(o[1]);l&&s.setIndent(l);},mt=(t,e,n)=>{const o=[],r=t.getChildren();let i=0;for(const s of r)if(nt$1(s)){if(1===s.getChildrenSize()){const t=s.getFirstChild();if(at$1(t)){o.push(mt(t,e,n+1));continue}}const r=" ".repeat(4*n),l=t.getListType(),c="number"===l?`${t.getStart()+i}. `:"check"===l?`- [${s.getChecked()?"x":" "}] `:"- ";o.push(r+c+e(s)),i++;}return o.join("\n")},ht={dependencies:[Nt$1],export:(t,e)=>{if(!At(t))return null;const n=Number(t.getTag().slice(1));return "#".repeat(n)+" "+e(t)},regExp:st,replace:pt((t=>{const e="h"+t[1].length;return _t$1(e)})),type:"element"},xt={dependencies:[Dt],export:(t,e)=>{if(!wt$1(t))return null;const n=e(t).split("\n"),o=[];for(const t of n)o.push("> "+t);return o.join("\n")},regExp:lt,replace:(t,e,n,o)=>{if(o){const n=t.getPreviousSibling();if(wt$1(n))return n.splice(n.getChildrenSize(),0,[Pn(),...e]),n.select(0,0),void t.remove()}const r=xt$1();r.append(...e),t.replace(r),r.select(0,0);},type:"element"},Tt={dependencies:[M$4],export:t=>{if(!J$2(t))return null;const e=t.getTextContent();return "```"+(t.getLanguage()||"")+(e?"\n"+e:"")+"\n```"},regExpEnd:{optional:true,regExp:ft},regExpStart:ct,replace:(t,e,n,o,r,i)=>{let s,c;if(!e&&r){if(1===r.length)o?(s=z$3(),c=n[1]+r[0]):(s=z$3(n[1]),c=r[0].startsWith(" ")?r[0].slice(1):r[0]);else {if(s=z$3(n[1]),0===r[0].trim().length)for(;r.length>0&&!r[0].length;)r.shift();else r[0]=r[0].startsWith(" ")?r[0].slice(1):r[0];for(;r.length>0&&!r[r.length-1].length;)r.pop();c=r.join("\n");}const e=Xn(c);s.append(e),t.append(s);}else e&&pt((t=>z$3(t?t[1]:void 0)))(t,e,n,i);},type:"multiline-element"},Ct={dependencies:[rt$1,G],export:(t,e)=>at$1(t)?mt(t,e,0):null,regExp:rt,replace:dt("bullet"),type:"element"},yt={dependencies:[rt$1,G],export:(t,e)=>at$1(t)?mt(t,e,0):null,regExp:ot,replace:dt("number"),type:"element"},$t={format:["code"],tag:"`",type:"text-format"},vt={format:["highlight"],tag:"==",type:"text-format"},St={format:["bold","italic"],tag:"***",type:"text-format"},bt={format:["bold","italic"],intraword:false,tag:"___",type:"text-format"},Ft={format:["bold"],tag:"**",type:"text-format"},It={format:["bold"],intraword:false,tag:"__",type:"text-format"},Nt={format:["strikethrough"],tag:"~~",type:"text-format"},wt={format:["italic"],tag:"*",type:"text-format"},kt={format:["italic"],intraword:false,tag:"_",type:"text-format"},Lt={dependencies:[g$3],export:(t,e,n)=>{if(!p$2(t)||O$1(t))return null;const o=t.getTitle(),r=e(t);return o?`[${r}](${t.getURL()} "${o}")`:`[${r}](${t.getURL()})`},importRegExp:/(?:\[([^[]+)\])(?:\((?:([^()\s]+)(?:\s"((?:[^"]*\\")*[^"]*)"\s*)?)\))/,regExp:/(?:\[([^[]+)\])(?:\((?:([^()\s]+)(?:\s"((?:[^"]*\\")*[^"]*)"\s*)?)\))$/,replace:(t,e)=>{const[,n,o,r]=e,i=(s=o).match(/^[a-z][a-z0-9+.-]*:/i)||s.match(/^[/#.]/)?s:s.includes("@")?`mailto:${s}`:W.test(s)?`tel:${s}`:`https://${s}`;var s;const c=d$2(i,{title:r}),f=Xn(n);return f.setFormat(t.getFormat()),c.append(f),t.replace(c),f},trigger:")",type:"text-match"};const Pt=[ht,xt,Ct,yt],Rt=[Tt],_t=[$t,St,bt,Ft,It,vt,wt,kt,Nt],Bt=[Lt],Mt=[...Pt,...Rt,..._t,...Bt];function jt(t,e=Mt,n,o=false,r=false){const i=o?t:function(t,e=false){const n=t.split("\n");let o=false;const r=[];for(let t=0;t<n.length;t++){const i=n[t],s=r[r.length-1];at.test(i)?r.push(i):ct.test(i)||ft.test(i)?(o=!o,r.push(i)):o||""===i||""===s||!s||st.test(s)||st.test(i)||lt.test(i)||ot.test(i)||rt.test(i)||it.test(i)||ut.test(i)||gt.test(i)||!e?r.push(i):r[r.length-1]=s+i;}return r.join("\n")}(t,r);return V(e,o)(i,n)}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

function e(){const[e]=o$3();return dashboard__loadShare__react__loadShare__.useEffect((()=>gt$2(e)),[e]),null}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const m$2="undefined"!=typeof window&&void 0!==window.document&&void 0!==window.document.createElement,u$2=m$2?dashboard__loadShare__react__loadShare__.useLayoutEffect:dashboard__loadShare__react__loadShare__.useEffect,p$1={tag:Ti};function f$3({initialConfig:a,children:c}){const l=dashboard__loadShare__react__loadShare__.useMemo((()=>{const{theme:t,namespace:c,nodes:l,onError:d,editorState:s,html:u}=a,f=t$2(null,t),E=Wi({editable:a.editable,html:u,namespace:c,nodes:l,onError:e=>d(e,E),theme:t});return function(e,t){if(null===t)return;if(void 0===t)e.update((()=>{const t=_s();if(t.isEmpty()){const o=Pi();t.append(o);const n=m$2?document.activeElement:null;(null!==Nr()||null!==n&&n===e.getRootElement())&&o.select();}}),p$1);else if(null!==t)switch(typeof t){case "string":{const o=e.parseEditorState(t);e.setEditorState(o,p$1);break}case "object":e.setEditorState(t,p$1);break;case "function":e.update((()=>{_s().isEmpty()&&t(e);}),p$1);}}(E,s),[E,f]}),[]);return u$2((()=>{const e=a.editable,[t]=l;t.setEditable(void 0===e||e);}),[]),jsxRuntimeExports.jsx(r$2.Provider,{value:l,children:c})}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

function s$1(){return _s().getTextContent()}function f$2(t,e=true){if(t)return  false;let n=s$1();return e&&(n=n.trim()),""===n}function c$2(o){if(!f$2(o,false))return  false;const l=_s().getChildren(),s=l.length;if(s>1)return  false;for(let t=0;t<s;t++){const o=l[t];if(_i(o))return  false;if(di(o)){if(!Fi(o))return  false;if(0!==o.__indent)return  false;const e=o.getChildren(),n=e.length;for(let r=0;r<n;r++){const n=e[t];if(!Qn(n))return  false}}}return  true}function g$2(t){return ()=>c$2(t)}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const m$1="undefined"!=typeof window&&void 0!==window.document&&void 0!==window.document.createElement?dashboard__loadShare__react__loadShare__.useLayoutEffect:dashboard__loadShare__react__loadShare__.useEffect;function f$1({editor:e,ariaActiveDescendant:t,ariaAutoComplete:i,ariaControls:a,ariaDescribedBy:d,ariaErrorMessage:c,ariaExpanded:s,ariaInvalid:u,ariaLabel:f,ariaLabelledBy:b,ariaMultiline:p,ariaOwns:x,ariaRequired:E,autoCapitalize:v,className:w,id:y,role:C="textbox",spellCheck:g=true,style:h,tabIndex:L,"data-testid":D,...I},R){const[k,q]=dashboard__loadShare__react__loadShare__.useState(e.isEditable()),z=dashboard__loadShare__react__loadShare__.useCallback((t=>{t&&t.ownerDocument&&t.ownerDocument.defaultView?e.setRootElement(t):e.setRootElement(null);}),[e]),A=dashboard__loadShare__react__loadShare__.useMemo((()=>function(...e){return t=>{e.forEach((e=>{"function"==typeof e?e(t):null!=e&&(e.current=t);}));}}(R,z)),[z,R]);return m$1((()=>(q(e.isEditable()),e.registerEditableListener((e=>{q(e);})))),[e]),jsxRuntimeExports.jsx("div",{"aria-activedescendant":k?t:void 0,"aria-autocomplete":k?i:"none","aria-controls":k?a:void 0,"aria-describedby":d,...null!=c?{"aria-errormessage":c}:{},"aria-expanded":k&&"combobox"===C?!!s:void 0,...null!=u?{"aria-invalid":u}:{},"aria-label":f,"aria-labelledby":b,"aria-multiline":p,"aria-owns":k?x:void 0,"aria-readonly":!k||void 0,"aria-required":E,autoCapitalize:v,className:w,contentEditable:k,"data-testid":D,id:y,ref:A,role:k?C:void 0,spellCheck:g,style:h,tabIndex:L,...I})}const b=dashboard__loadShare__react__loadShare__.forwardRef(f$1);function p(e){return e.getEditorState().read(g$2(e.isComposing()))}const x$3=dashboard__loadShare__react__loadShare__.forwardRef(E$2);function E$2(t,i){const{placeholder:a,...r}=t,[n]=o$3();return jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment,{children:[jsxRuntimeExports.jsx(b,{editor:n,...r,ref:i}),null!=a&&jsxRuntimeExports.jsx(v$1,{editor:n,content:a})]})}function v$1({content:e,editor:i}){const a=function(e){const[t,i]=dashboard__loadShare__react__loadShare__.useState((()=>p(e)));return m$1((()=>{function t(){const t=p(e);i(t);}return t(),j$2(e.registerUpdateListener((()=>{t();})),e.registerEditableListener((()=>{t();})))}),[e]),t}(i),[n,o]=dashboard__loadShare__react__loadShare__.useState(i.isEditable());if(dashboard__loadShare__react__loadShare__.useLayoutEffect((()=>(o(i.isEditable()),i.registerEditableListener((e=>{o(e);})))),[i]),!a)return null;let d=null;return "function"==typeof e?d=e(n):null!==e&&(d=e),null===d?null:jsxRuntimeExports.jsx("div",{"aria-hidden":true,children:d})}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

function t(r,e){return t=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(r,e){return r.__proto__=e,r},t(r,e)}var o$1={error:null},n$2=function(e){var n,a;function s(){for(var r,t=arguments.length,n=new Array(t),a=0;a<t;a++)n[a]=arguments[a];return (r=e.call.apply(e,[this].concat(n))||this).state=o$1,r.resetErrorBoundary=function(){for(var e,t=arguments.length,o=new Array(t),n=0;n<t;n++)o[n]=arguments[n];null==r.props.onReset||(e=r.props).onReset.apply(e,o),r.reset();},r}a=e,(n=s).prototype=Object.create(a.prototype),n.prototype.constructor=n,t(n,a),s.getDerivedStateFromError=function(r){return {error:r}};var i=s.prototype;return i.reset=function(){this.setState(o$1);},i.componentDidCatch=function(r,e){var t,o;null==(t=(o=this.props).onError)||t.call(o,r,e);},i.componentDidUpdate=function(r,e){var t,o,n,a,s=this.state.error,i=this.props.resetKeys;null!==s&&null!==e.error&&(void 0===(n=r.resetKeys)&&(n=[]),void 0===(a=i)&&(a=[]),n.length!==a.length||n.some((function(r,e){return !Object.is(r,a[e])})))&&(null==(t=(o=this.props).onResetKeysChange)||t.call(o,r.resetKeys,i),this.reset());},i.render=function(){var e=this.state.error,t=this.props,o=t.fallbackRender,n=t.FallbackComponent,a=t.fallback;if(null!==e){var s={error:e,resetErrorBoundary:this.resetErrorBoundary};if(dashboard__loadShare__react__loadShare__.isValidElement(a))return a;if("function"==typeof o)return o(s);if(n)return dashboard__loadShare__react__loadShare__.createElement(n,s);throw new Error("react-error-boundary requires either a fallback, fallbackRender, or FallbackComponent prop")}return this.props.children},s}(dashboard__loadShare__react__loadShare__.Component);function a$3({children:r,onError:t}){return jsxRuntimeExports.jsx(n$2,{fallback:jsxRuntimeExports.jsx("div",{style:{border:"1px solid #f00",color:"#f00",padding:"8px"},children:"An error was thrown."}),onError:t,children:r})}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const m=0,h$3=1,_=2,g$1=0,S=1,k$1=2,y$1=3,C=4;function x$2(t,e,n,r,o){if(null===t||0===n.size&&0===r.size&&!o)return g$1;const i=e._selection,c=t._selection;if(o)return S;if(!(cr(i)&&cr(c)&&c.isCollapsed()&&i.isCollapsed()))return g$1;const s=function(t,e,n){const r=t._nodeMap,o=[];for(const t of e){const e=r.get(t);void 0!==e&&o.push(e);}for(const[t,e]of n){if(!e)continue;const n=r.get(t);void 0===n||yi(n)||o.push(n);}return o}(e,n,r);if(0===s.length)return g$1;if(s.length>1){const n=e._nodeMap,r=n.get(i.anchor.key),o=n.get(c.anchor.key);return r&&o&&!t._nodeMap.has(r.__key)&&Qn(r)&&1===r.__text.length&&1===i.anchor.offset?k$1:g$1}const a=s[0],u=t._nodeMap.get(a.__key);if(!Qn(u)||!Qn(a)||u.__mode!==a.__mode)return g$1;const d=u.__text,m=a.__text;if(d===m)return g$1;const h=i.anchor,_=c.anchor;if(h.key!==_.key||"text"!==h.type)return g$1;const x=h.offset,M=_.offset,z=m.length-d.length;return 1===z&&M===x-1?k$1:-1===z&&M===x+1?y$1:-1===z&&M===x?C:g$1}function M(t,e){let n=Date.now(),r=g$1;return (o,i,c,s,p,S)=>{const k=Date.now();if(S.has(vi))return r=g$1,n=k,_;const y=x$2(o,i,s,p,t.isComposing()),C=(()=>{const a=null===c||c.editor===t,C=S.has(ki);if(!C&&a&&S.has(Ti))return m;if(null===o)return h$3;const x=i._selection;if(!(s.size>0||p.size>0))return null!==x?m:_;if(false===C&&y!==g$1&&y===r&&k<n+e&&a)return m;if(1===s.size){if(function(t,e,n){const r=e._nodeMap.get(t),o=n._nodeMap.get(t),i=e._selection,c=n._selection;return !(cr(i)&&cr(c)&&"element"===i.anchor.type&&"element"===i.focus.type&&"text"===c.anchor.type&&"text"===c.focus.type||!Qn(r)||!Qn(o)||r.__parent!==o.__parent)&&JSON.stringify(e.read((()=>r.exportJSON())))===JSON.stringify(n.read((()=>o.exportJSON())))}(Array.from(s)[0],o,i))return m}return h$3})();return n=k,r=y,C}}function z(t){t.undoStack=[],t.redoStack=[],t.current=null;}function v(u,d,l){const f=M(u,l),p=j$2(u.registerCommand(xe,(()=>(function(t,e){const n=e.redoStack,r=e.undoStack;if(0!==r.length){const o=e.current,i=r.pop();null!==o&&(n.push(o),t.dispatchCommand(Ye,true)),0===r.length&&t.dispatchCommand(He,false),e.current=i||null,i&&i.editor.setEditorState(i.editorState,{tag:vi});}}(u,d),true)),Li),u.registerCommand(Ce,(()=>(function(t,e){const n=e.redoStack,r=e.undoStack;if(0!==n.length){const o=e.current;null!==o&&(r.push(o),t.dispatchCommand(He,true));const i=n.pop();0===n.length&&t.dispatchCommand(Ye,false),e.current=i||null,i&&i.editor.setEditorState(i.editorState,{tag:vi});}}(u,d),true)),Li),u.registerCommand(je,(()=>(z(d),false)),Li),u.registerCommand(Ve,(()=>(z(d),u.dispatchCommand(Ye,false),u.dispatchCommand(He,false),true)),Li),u.registerUpdateListener((({editorState:t,prevEditorState:e,dirtyLeaves:n,dirtyElements:r,tags:o})=>{const i=d.current,a=d.redoStack,l=d.undoStack,p=null===i?null:i.editorState;if(null!==i&&t===p)return;const m=f(e,t,i,n,r,o);if(m===h$3)0!==a.length&&(d.redoStack=[],u.dispatchCommand(Ye,false)),null!==i&&(l.push({...i}),u.dispatchCommand(He,true));else if(m===_)return;d.current={editor:u,editorState:t};})));return p}function E$1(){return {current:null,redoStack:[],undoStack:[]}}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

function a$2({delay:a,externalHistoryState:c}){const[l]=o$3();return function(t,a,c=1e3){const l=dashboard__loadShare__react__loadShare__.useMemo((()=>a||E$1()),[a]);dashboard__loadShare__react__loadShare__.useEffect((()=>v(t,l,c)),[c,t,l]);}(l,c,a),null}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

function d$1(e,t){return e.getEditorState().read((()=>{const e=as(t);return null!==e&&e.isSelected()}))}function u$1(c){const[u]=o$3(),[p,s]=dashboard__loadShare__react__loadShare__.useState((()=>d$1(u,c)));dashboard__loadShare__react__loadShare__.useEffect((()=>{let e=true;const t=u.registerUpdateListener((()=>{e&&s(d$1(u,c));}));return ()=>{e=false,t();}}),[u,c]);return [p,dashboard__loadShare__react__loadShare__.useCallback((e=>{u.update((()=>{let a=Nr();ur(a)||(a=kr(),ys(a)),ur(a)&&(e?a.add(c):a.delete(c));}));}),[u,c]),dashboard__loadShare__react__loadShare__.useCallback((()=>{u.update((()=>{const e=Nr();ur(e)&&e.clear();}));}),[u])]}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

function d({nodeKey:c}){const[i]=o$3(),[u,s,p]=u$1(c);return dashboard__loadShare__react__loadShare__.useEffect((()=>j$2(i.registerCommand(ae,(e=>{const t=i.getElementByKey(c);return e.target===t&&(e.shiftKey||p(),s(!u),true)}),Ii))),[p,i,u,c,s]),dashboard__loadShare__react__loadShare__.useEffect((()=>{const e=i.getElementByKey(c),t=i._config.theme.hrSelected??"selected";null!==e&&(u?rt$2(e,t):it$2(e,t));}),[i,u,c]),null}class f extends gi{static getType(){return "horizontalrule"}static clone(e){return new f(e.__key)}static importJSON(e){return y().updateFromJSON(e)}static importDOM(){return {hr:()=>({conversion:x$1,priority:0})}}exportDOM(){return {element:document.createElement("hr")}}createDOM(e){const t=document.createElement("hr");return rt$2(t,e.theme.hr),t}getTextContent(){return "\n"}isInline(){return  false}updateDOM(){return  false}decorate(){return jsxRuntimeExports.jsx(d,{nodeKey:this.__key})}}function x$1(){return {node:y()}}function y(){return eo(new f)}function h$2(e){return e instanceof f}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

function c$1({validateUrl:c,attributes:p}){const[f]=o$3();return dashboard__loadShare__react__loadShare__.useEffect((()=>{if(!f.hasNodes([g$3]))throw new Error("LinkPlugin: LinkNode not registered on editor");return j$2(f.registerCommand(k$2,(t=>{if(null===t)return N(t),true;if("string"==typeof t)return !(void 0!==c&&!c(t))&&(N(t,p),true);{const{url:r,target:o,rel:i,title:l}=t;return N(r,{...p,rel:i,target:o,title:l}),true}}),Ii),void 0!==c?f.registerCommand(ge,(t=>{const e=Nr();if(!cr(e)||e.isCollapsed()||!Lt$1(t,ClipboardEvent))return  false;if(null===t.clipboardData)return  false;const o=t.clipboardData.getData("text");return !!c(o)&&(!e.getNodes().some((t=>di(t)))&&(f.dispatchCommand(k$2,{...p,url:o}),t.preventDefault(),true))}),Ii):()=>{})}),[f,c,p]),null}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

function s({hasStrictIndent:s=false}){const[c]=o$3();return dashboard__loadShare__react__loadShare__.useEffect((()=>{if(!c.hasNodes([rt$1,G]))throw new Error("ListPlugin: ListNode and/or ListItemNode not registered on editor")}),[c]),dashboard__loadShare__react__loadShare__.useEffect((()=>{if(s)return vt$2(c)}),[c,s]),function(r){dashboard__loadShare__react__loadShare__.useEffect((()=>Tt$2(r)),[r]);}(c),null}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const i=[{dependencies:[f],export:e=>h$2(e)?"***":null,regExp:/^(---|\*\*\*|___)\s?$/,replace:(e,r,t,o)=>{const l=y();o||null!=e.getNextSibling()?e.replace(l):e.insertBefore(l),l.selectNext();},type:"element"},...Mt];function a$1({transformers:e=i}){const[o]=o$3();return dashboard__loadShare__react__loadShare__.useEffect((()=>nt(o,e)),[o,e]),null}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const r="undefined"!=typeof window&&void 0!==window.document&&void 0!==window.document.createElement?dashboard__loadShare__react__loadShare__.useLayoutEffect:dashboard__loadShare__react__loadShare__.useEffect;function n$1({ignoreHistoryMergeTagChange:o=true,ignoreSelectionChange:i=false,onChange:n}){const[a]=o$3();return r((()=>{if(n)return a.registerUpdateListener((({editorState:e,dirtyElements:r,dirtyLeaves:d,prevEditorState:s,tags:c})=>{i&&0===r.size&&0===d.size||o&&c.has(Ti)||s.isEmpty()||n(e,a,c);}))}),[a,o,i,n]),null}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const c="undefined"!=typeof window&&void 0!==window.document&&void 0!==window.document.createElement?dashboard__loadShare__react__loadShare__.useLayoutEffect:dashboard__loadShare__react__loadShare__.useEffect;function u(e){return {initialValueFn:()=>e.isEditable(),subscribe:n=>e.registerEditableListener(n)}}function a(){return function(n){const[t]=o$3(),u=dashboard__loadShare__react__loadShare__.useMemo((()=>n(t)),[t,n]),[a,l]=dashboard__loadShare__react__loadShare__.useState((()=>u.initialValueFn())),d=dashboard__loadShare__react__loadShare__.useRef(a);return c((()=>{const{initialValueFn:e,subscribe:n}=u,t=e();return d.current!==t&&(d.current=t,l(t)),n((e=>{d.current=e,l(e);}))}),[u,n]),a}(u)}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

function o(o){const i=window.location.origin,a=a=>{if(a.origin!==i)return;const r=o.getRootElement();if(document.activeElement!==r)return;const s=a.data;if("string"==typeof s){let i;try{i=JSON.parse(s);}catch(e){return}if(i&&"nuanria_messaging"===i.protocol&&"request"===i.type){const r=i.payload;if(r&&"makeChanges"===r.functionId){const i=r.args;if(i){const[r,s,c,g,d,f]=i;o.update((()=>{const o=Nr();if(cr(o)){const e=o.anchor;let t=e.getNode(),i=0,f=0;if(Qn(t)&&r>=0&&s>=0&&(i=r,f=r+s,o.setTextNodeRange(t,i,t,f)),i===f&&""===c||(o.insertRawText(c),t=e.getNode()),Qn(t)){i=g,f=g+d;const e=t.getTextContentSize();i=i>e?e:i,f=f>e?e:f,o.setTextNodeRange(t,i,t,f);}a.stopImmediatePropagation();}}));}}}}};return window.addEventListener("message",a,true),()=>{window.removeEventListener("message",a,true);}}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const g="undefined"!=typeof window&&void 0!==window.document&&void 0!==window.document.createElement?dashboard__loadShare__react__loadShare__.useLayoutEffect:dashboard__loadShare__react__loadShare__.useEffect;function E(t){return t.getEditorState().read(g$2(t.isComposing()))}function h$1({contentEditable:e,placeholder:r=null,ErrorBoundary:n}){const[E]=o$3(),h=function(t,e){const[r,o]=dashboard__loadShare__react__loadShare__.useState((()=>t.getDecorators()));return g((()=>t.registerDecoratorListener((t=>{dashboard__loadShare__react_mf_2_dom__loadShare__.flushSync((()=>{o(t);}));}))),[t]),dashboard__loadShare__react__loadShare__.useEffect((()=>{o(t.getDecorators());}),[t]),dashboard__loadShare__react__loadShare__.useMemo((()=>{const o=[],n=Object.keys(r);for(let i=0;i<n.length;i++){const c=n[i],l=jsxRuntimeExports.jsx(e,{onError:e=>t._onError(e),children:jsxRuntimeExports.jsx(dashboard__loadShare__react__loadShare__.Suspense,{fallback:null,children:r[c]})}),u=t.getElementByKey(c);null!==u&&o.push(dashboard__loadShare__react_mf_2_dom__loadShare__.createPortal(l,u,c));}return o}),[e,r,t])}(E,n);return function(t){g((()=>j$2(Mt$1(t),o(t))),[t]);}(E),jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment,{children:[e,jsxRuntimeExports.jsx(w,{content:r}),h]})}function w({content:r}){const[n]=o$3(),i=function(t){const[e,r]=dashboard__loadShare__react__loadShare__.useState((()=>E(t)));return g((()=>{function e(){const e=E(t);r(e);}return e(),j$2(t.registerUpdateListener((()=>{e();})),t.registerEditableListener((()=>{e();})))}),[t]),e}(n),l=a();return i?"function"==typeof r?r(l):r:null}

//#region src/components/editor/Editor.tsx
const Editor = dashboard__loadShare__react__loadShare__.forwardRef(({ enablePreview, onChange, placeholder, toolbarOptions, value }, ref) => {
	const [isPreview, setIsPreview] = dashboard__loadShare__react__loadShare__.useState(false);
	const handleChange = React3.useCallback((editorState) => {
		const content = editorState.read(() => _s().getTextContent());
		onChange?.(content);
	}, [onChange]);
	const initialConfig = React3.useMemo(() => ({
		editable: !isPreview,
		editorState: () => {
			jt(value ?? "", Mt);
		},
		namespace: "MarkdownEditor",
		nodes: [
			f,
			M$4,
			g$3,
			rt$1,
			G,
			Nt$1,
			Dt
		],
		onError: (error) => {
			throw error;
		},
		theme: {
			heading: {
				h1: "text-2xl font-bold",
				h2: "text-xl font-bold",
				h3: "text-lg font-semibold",
				h4: "text-base font-semibold",
				h5: "text-sm font-semibold",
				h6: "text-xs font-semibold"
			},
			link: "cursor-pointer",
			root: "p-3 border rounded-md bg-modal-input text-foreground",
			text: {
				bold: "font-semibold",
				italic: "italic",
				underline: "underline"
			}
		}
	}), [isPreview, value]);
	return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
		className: "border rounded-md bg-modal-input text-foreground",
		children: /* @__PURE__ */ jsxRuntimeExports.jsx(f$3, {
			initialConfig,
			children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ToolbarProvider, { children: [/* @__PURE__ */ jsxRuntimeExports.jsx("div", {
				className: "flex items-center justify-between gap-1 p-1 border-b border-border",
				children: /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarPlugin, {
					isPreview,
					setIsPreview,
					toolbarOptions
				})
			}), !isPreview ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
				/* @__PURE__ */ jsxRuntimeExports.jsx(h$1, {
					contentEditable: /* @__PURE__ */ jsxRuntimeExports.jsx(x$3, {
						"aria-placeholder": placeholder ?? "",
						className: "w-full min-h-[150px] bg-transparent outline-none resize-none text-foreground",
						placeholder: /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
							className: "text-foreground/50",
							children: placeholder
						})
					}),
					ErrorBoundary: a$3
				}),
				/* @__PURE__ */ jsxRuntimeExports.jsx(a$2, {}),
				/* @__PURE__ */ jsxRuntimeExports.jsx(s, {}),
				/* @__PURE__ */ jsxRuntimeExports.jsx(e, {}),
				/* @__PURE__ */ jsxRuntimeExports.jsx(c$1, {}),
				/* @__PURE__ */ jsxRuntimeExports.jsx(a$1, { transformers: Mt }),
				/* @__PURE__ */ jsxRuntimeExports.jsx(n$1, {
					ignoreHistoryMergeTagChange: true,
					ignoreSelectionChange: true,
					onChange: handleChange
				})
			] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Preview, {})] })
		})
	});
});
Editor.displayName = "Markdown";

//#region src/components/form/fields/RichText.tsx
const RichText = dashboard__loadShare__react__loadShare__.forwardRef(({ enablePreview, onChange, placeholder, required, toolbarOptions, value, autocomplete }, ref) => {
	return /* @__PURE__ */ jsxRuntimeExports.jsx(Editor, {
		enablePreview,
		onChange,
		placeholder,
		ref,
		required,
		toolbarOptions,
		value,
		...autocomplete ? { autoComplete: autocomplete } : {}
	});
});
RichText.displayName = "MarkdownEditor";
function registerRichText() {
	registerFormComponent(FormFieldType.RICH_TEXT, RichText);
}

//#region src/components/form/fields/Select.tsx
const Select = React3.forwardRef(({ inputClassName, onChange, options, placeholder = "Select...", required, value, autocomplete,...props }, ref) => {
	return /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Select, {
		onValueChange: onChange,
		required,
		value: value || "",
		...autocomplete ? { autoComplete: autocomplete } : {},
		...props,
		children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.SelectTrigger, {
			className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("w-full h-14 border-none bg-modal-input text-foreground placeholder:text-foreground/50", inputClassName, "data-[placeholder]:text-foreground/50"),
			ref,
			children: /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.SelectValue, { placeholder })
		}), /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.SelectContent, { children: (options || []).map((option) => {
			const value$1 = typeof option === "string" ? option : option.value;
			const label = typeof option === "string" ? option : option.label;
			return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.SelectItem, {
				value: value$1,
				children: label
			}, value$1);
		}) })]
	});
});
Select.displayName = "Select";
function registerSelect() {
	registerFormComponent(FormFieldType.SELECT, Select);
}

//#region src/components/form/fields/Slider.tsx
const Slider = React3.forwardRef(({ max = 100, min = 0, onChange, step = 1, value,...props }, ref) => {
	return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Slider, {
		disabled: props.disabled,
		max,
		min,
		onBlur: props.onBlur,
		onValueChange: (vals) => onChange?.(vals[0]),
		ref,
		step,
		value: [value || min]
	});
});
Slider.displayName = "Slider";
function registerSlider() {
	registerFormComponent(FormFieldType.SLIDER, Slider);
}

//#region src/components/form/fields/Textarea.tsx
const Textarea = React3.forwardRef(({ inputClassName, onChange, placeholder, value, autocomplete, autoComplete: htmlAutoComplete,...props }, ref) => {
	return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Textarea, {
		className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", inputClassName),
		onChange,
		placeholder,
		ref,
		value: value ?? "",
		autoComplete: autocomplete ?? htmlAutoComplete,
		...props
	});
});
Textarea.displayName = "Textarea";
function registerTextarea() {
	registerFormComponent(FormFieldType.TEXTAREA, Textarea);
}

//#region src/components/form/FormGroup.tsx
const FormGroup = ({ children, className, description, title }) => {
	return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
		className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn(className),
		children: title || description ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
			title && /* @__PURE__ */ jsxRuntimeExports.jsx("h3", {
				className: "text-lg font-medium",
				children: title
			}),
			description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
				className: "text-sm text-muted-foreground",
				children: description
			}),
			/* @__PURE__ */ jsxRuntimeExports.jsx("div", {
				className: "space-y-4",
				children
			})
		] }) : children
	});
};

//#region src/components/form/types.ts
let GroupOrder = /* @__PURE__ */ function(GroupOrder$1) {
	GroupOrder$1["GROUPS_FIRST"] = "groups-first";
	GroupOrder$1["UNGROUPED_FIRST"] = "ungrouped-first";
	return GroupOrder$1;
}({});
/**
* Type guard to differentiate between single-step and multi-step form configs.
*/
function isStepFormConfig(config) {
	return config?.steps !== void 0;
}

//#region src/components/form/autocomplete/register.ts
const defaultRules = [
	{
		evaluate: (fieldConfig) => {
			return fieldConfig.autocomplete;
		},
		name: "explicit",
		priority: 0
	},
	{
		evaluate: (fieldConfig) => {
			if (fieldConfig.type === FormFieldType.EMAIL) return "email";
			return void 0;
		},
		name: "email-type",
		priority: 10
	},
	{
		evaluate: (fieldConfig) => {
			const name = fieldConfig.name?.toString().toLowerCase();
			if (name?.includes("email")) return "email";
			return void 0;
		},
		name: "email-name",
		priority: 20
	},
	{
		evaluate: (fieldConfig) => {
			const name = fieldConfig.name?.toString().toLowerCase();
			if (name && (name.includes("first") || name.includes("given")) && name.includes("name")) return "given-name";
			return void 0;
		},
		name: "given-name",
		priority: 30
	},
	{
		evaluate: (fieldConfig) => {
			const name = fieldConfig.name?.toString().toLowerCase();
			if (name && (name.includes("last") || name.includes("family") || name.includes("sur")) && name.includes("name")) return "family-name";
			return void 0;
		},
		name: "family-name",
		priority: 30
	},
	{
		evaluate: (fieldConfig) => {
			const name = fieldConfig.name?.toString().toLowerCase();
			if (name && (name.includes("username") || name.includes("login"))) return "username";
			return void 0;
		},
		name: "username",
		priority: 40
	},
	{
		evaluate: (fieldConfig) => {
			const name = fieldConfig.name?.toString().toLowerCase();
			if (name && (name.includes("otp") || name.includes("verification") && name.includes("code") || name.includes("one-time-code") || name.includes("2fa") || name.includes("twofactor") || name.includes("two-factor"))) return "one-time-code";
			return void 0;
		},
		name: "one-time-code",
		priority: 45
	},
	{
		evaluate: (fieldConfig, context) => {
			const name = fieldConfig.name?.toString().toLowerCase();
			if (fieldConfig.type === FormFieldType.PASSWORD) {
				if (name?.includes("current") && name.includes("password")) return "current-password";
				if (name === "password" && context?.formPurpose === "login") return "current-password";
				if (name === "password" && context?.formPurpose === "change-password") return "current-password";
			}
			return void 0;
		},
		name: "current-password",
		priority: 50
	},
	{
		evaluate: (fieldConfig, context) => {
			const name = fieldConfig.name?.toString().toLowerCase();
			if (fieldConfig.type === FormFieldType.PASSWORD) {
				if (name?.includes("new") && name.includes("password")) return "new-password";
				if (name?.includes("confirm") && name.includes("password")) return "new-password";
				if (name === "password" && (context?.formPurpose === "register" || context?.formPurpose === "reset-password")) return "new-password";
			}
			return void 0;
		},
		name: "new-password",
		priority: 50
	},
	{
		evaluate: (fieldConfig) => {
			const name = fieldConfig.name?.toString().toLowerCase();
			if (name) {
				if ((name.includes("cc") || name.includes("card")) && name.includes("number")) return "cc-number";
				if ((name.includes("cc") || name.includes("card")) && (name.includes("exp") || name.includes("expiration"))) return "cc-exp";
				if ((name.includes("cc") || name.includes("card")) && name.includes("month")) return "cc-exp-month";
				if ((name.includes("cc") || name.includes("card")) && name.includes("year")) return "cc-exp-year";
				if ((name.includes("cc") || name.includes("card")) && (name.includes("csc") || name.includes("cvv"))) return "cc-csc";
			}
			return void 0;
		},
		name: "credit-card",
		priority: 60
	},
	{
		evaluate: (fieldConfig) => {
			const name = fieldConfig.name?.toString().toLowerCase();
			if (name) {
				if (name.includes("address2") || name.includes("address_2") || name.includes("address line 2") || name.includes("address-line2")) return "address-line2";
				if (name.includes("address1") || name.includes("address_1") || name.includes("address line 1") || name.includes("address-line1")) return "address-line1";
				if (name.includes("address") && !name.includes("email")) return "street-address";
				if (name.includes("city")) return "address-level2";
				if (name.includes("state") || name.includes("province")) return "address-level1";
				if (name.includes("zip") || name.includes("postal")) return "postal-code";
				if (name.includes("country")) {
					if (name.includes("code") || name.includes("iso")) return "country";
					return "country-name";
				}
			}
			return void 0;
		},
		name: "address",
		priority: 70
	},
	{
		evaluate: (fieldConfig) => {
			const name = fieldConfig.name?.toString().toLowerCase();
			if (name && (name.includes("phone") || name.includes("tel"))) return "tel";
			return void 0;
		},
		name: "phone",
		priority: 80
	},
	{
		evaluate: (fieldConfig) => {
			const name = fieldConfig.name?.toString().toLowerCase();
			if (name && (name.includes("bday") || name.includes("birth"))) return "bday";
			return void 0;
		},
		name: "birthday",
		priority: 90
	},
	{
		evaluate: (fieldConfig) => {
			const name = fieldConfig.name?.toString().toLowerCase();
			if (name && (name.includes("sex") || name.includes("gender"))) return "sex";
			return void 0;
		},
		name: "gender",
		priority: 100
	},
	{
		evaluate: (fieldConfig) => {
			const name = fieldConfig.name?.toString().toLowerCase();
			if (name && (name.includes("url") || name.includes("website"))) return "url";
			return void 0;
		},
		name: "url",
		priority: 110
	}
];
function registerDefaultRules() {
	defaultRules.forEach((rule) => {
		registerAutocompleteRule(rule);
	});
}

//#region src/components/form/autocomplete/rules.ts
let autocompleteRules = [
	{
		evaluate: (fieldConfig) => {
			return fieldConfig.autocomplete;
		},
		name: "explicit",
		priority: 0
	},
	{
		evaluate: (fieldConfig) => {
			if (fieldConfig.type === FormFieldType.EMAIL) return "email";
			return void 0;
		},
		name: "email-type",
		priority: 10
	},
	{
		evaluate: (fieldConfig) => {
			const name = fieldConfig.name?.toString().toLowerCase();
			if (name?.includes("email")) return "email";
			return void 0;
		},
		name: "email-name",
		priority: 20
	},
	{
		evaluate: (fieldConfig) => {
			const name = fieldConfig.name?.toString().toLowerCase();
			if (name && (name.includes("first") || name.includes("given")) && name.includes("name")) return "given-name";
			return void 0;
		},
		name: "given-name",
		priority: 30
	},
	{
		evaluate: (fieldConfig) => {
			const name = fieldConfig.name?.toString().toLowerCase();
			if (name && (name.includes("last") || name.includes("family") || name.includes("sur")) && name.includes("name")) return "family-name";
			return void 0;
		},
		name: "family-name",
		priority: 31
	},
	{
		evaluate: (fieldConfig) => {
			const name = fieldConfig.name?.toString().toLowerCase();
			if (name && (name.includes("username") || name.includes("login"))) return "username";
			return void 0;
		},
		name: "username",
		priority: 40
	},
	{
		evaluate: (fieldConfig) => {
			const name = fieldConfig.name?.toString().toLowerCase();
			if (name && (name.includes("otp") || name.includes("verification") && name.includes("code") || name.includes("one-time-code") || name.includes("2fa") || name.includes("mfa") || name.includes("totp") || name.includes("twofactor") || name.includes("two-factor") || name.includes("two factor"))) return "one-time-code";
			return void 0;
		},
		name: "one-time-code",
		priority: 45
	},
	{
		evaluate: (fieldConfig, context) => {
			const name = fieldConfig.name?.toString().toLowerCase();
			if (fieldConfig.type === FormFieldType.PASSWORD) {
				if (name?.includes("current") && name.includes("password")) return "current-password";
				if (name === "password" && context?.formPurpose === "login") return "current-password";
				if (name === "password" && context?.formPurpose === "change-password") return "current-password";
			}
			return void 0;
		},
		name: "current-password",
		priority: 51
	},
	{
		evaluate: (fieldConfig, context) => {
			const name = fieldConfig.name?.toString().toLowerCase();
			if (fieldConfig.type === FormFieldType.PASSWORD) {
				if (name?.includes("new") && name.includes("password")) return "new-password";
				if (name?.includes("confirm") && name.includes("password")) return "new-password";
				if (name === "password" && (context?.formPurpose === "register" || context?.formPurpose === "reset-password")) return "new-password";
			}
			return void 0;
		},
		name: "new-password",
		priority: 49
	},
	{
		evaluate: (fieldConfig) => {
			const name = fieldConfig.name?.toString().toLowerCase();
			if (name) {
				if ((name.includes("cc") || name.includes("card")) && name.includes("name")) return "cc-name";
				if ((name.includes("cc") || name.includes("card")) && name.includes("number")) return "cc-number";
				if ((name.includes("cc") || name.includes("card")) && name.includes("month")) return "cc-exp-month";
				if ((name.includes("cc") || name.includes("card")) && name.includes("year")) return "cc-exp-year";
				if ((name.includes("cc") || name.includes("card")) && (name.includes("exp") || name.includes("expiration"))) return "cc-exp";
				if ((name.includes("cc") || name.includes("card")) && (name.includes("csc") || name.includes("cvv") || name.includes("cvc") || name.includes("cvn"))) return "cc-csc";
			}
			return void 0;
		},
		name: "credit-card",
		priority: 60
	},
	{
		evaluate: (fieldConfig) => {
			const name = fieldConfig.name?.toString().toLowerCase();
			if (name) {
				if (name.includes("address2") || name.includes("address_2") || name.includes("address line 2") || name.includes("address-line2")) return "address-line2";
				if (name.includes("address1") || name.includes("address_1") || name.includes("address line 1") || name.includes("address-line1")) return "address-line1";
				if (name.includes("address") && !name.includes("email")) return "street-address";
				if (name.includes("city")) return "address-level2";
				if (name.includes("state") || name.includes("province") || name.includes("region")) return "address-level1";
				if (name.includes("zip") || name.includes("postal") || name.includes("postcode")) return "postal-code";
				if (name.includes("country")) {
					if (name.includes("code") || name.includes("iso")) return "country";
					return "country-name";
				}
			}
			return void 0;
		},
		name: "address",
		priority: 70
	},
	{
		evaluate: (fieldConfig) => {
			const name = fieldConfig.name?.toString().toLowerCase();
			if (name && (name.includes("phone") || name.includes("tel") || name.includes("mobile") || name.includes("cell"))) return "tel";
			return void 0;
		},
		name: "phone",
		priority: 80
	},
	{
		evaluate: (fieldConfig) => {
			const name = fieldConfig.name?.toString().toLowerCase();
			if (name && (name.includes("bday") || name.includes("birth") || name.includes("dob"))) return "bday";
			return void 0;
		},
		name: "birthday",
		priority: 90
	},
	{
		evaluate: (fieldConfig) => {
			const name = fieldConfig.name?.toString().toLowerCase();
			if (name && (name.includes("company") || name.includes("organization") || name.includes("organisation"))) return "organization";
			return void 0;
		},
		name: "organization",
		priority: 85
	},
	{
		evaluate: (fieldConfig) => {
			const name = fieldConfig.name?.toString().toLowerCase();
			if (name && (name === "name" || name.includes("full") && name.includes("name"))) return "name";
			return void 0;
		},
		name: "full-name",
		priority: 32
	},
	{
		evaluate: (fieldConfig) => {
			const name = fieldConfig.name?.toString().toLowerCase();
			if (name && (name.includes("sex") || name.includes("gender"))) return "sex";
			return void 0;
		},
		name: "gender",
		priority: 100
	},
	{
		evaluate: (fieldConfig) => {
			const name = fieldConfig.name?.toString().toLowerCase();
			if (name && (name.includes("url") || name.includes("website"))) return "url";
			return void 0;
		},
		name: "url",
		priority: 110
	}
];
let sortedRules = [...autocompleteRules].sort((a, b) => a.priority - b.priority);
function getAutocompleteValue(fieldConfig, context) {
	for (const rule of sortedRules) {
		const result = rule.evaluate(fieldConfig, context);
		if (result !== void 0) return result;
	}
	return void 0;
}
function registerAutocompleteRule(rule) {
	const existingIndex = autocompleteRules.findIndex((r) => r.name === rule.name);
	let newRules;
	if (existingIndex >= 0) {
		newRules = [...autocompleteRules];
		newRules[existingIndex] = rule;
	} else newRules = [...autocompleteRules, rule];
	autocompleteRules = newRules;
	sortedRules = [...newRules].sort((a, b) => a.priority - b.priority);
}
registerDefaultRules();

//#region src/components/form/FormRenderer.tsx
function FormRenderer({ fields = [], groups = [] }) {
	const { groupedFields, ungroupedFields } = React3.useMemo(() => {
		const grouped = {};
		const ungrouped = [];
		groups?.forEach((group) => {
			grouped[group.id] = [];
		});
		fields.forEach((field) => {
			if (field.group && grouped[field.group]) grouped[field.group].push(field);
			else ungrouped.push(field);
		});
		return {
			groupedFields: grouped,
			ungroupedFields: ungrouped
		};
	}, [fields, groups]);
	const { adapter: adapterName, config } = useFormContext();
	const adapter = adapters[adapterName];
	if (!adapter) throw new Error(`Form adapter "${String(adapterName)}" is not registered`);
	const groupOrder = config.groupOrder ?? GroupOrder.UNGROUPED_FIRST;
	const renderGroups = () => /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: groups?.map((group) => {
		const groupFields = groupedFields[group.id];
		if (!groupFields?.length) return null;
		return /* @__PURE__ */ jsxRuntimeExports.jsx(FormGroup, {
			className: group.className,
			description: group.description,
			title: group.title,
			children: groupFields.map((field) => /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRenderer, { field }, field.name))
		}, group.id);
	}) });
	const renderUngrouped = () => /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: ungroupedFields.map((field) => /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRenderer, { field }, field.name)) });
	return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: groupOrder === GroupOrder.GROUPS_FIRST ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [renderGroups(), renderUngrouped()] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [renderUngrouped(), renderGroups()] }) });
}
function FieldRenderer({ field }) {
	const rhfMethods = dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__.useFormContext();
	const { control, getValues, watch } = rhfMethods;
	const [isVisible, setIsVisible] = dashboard__loadShare__react__loadShare__.useState(true);
	const [isLoading, setIsLoading] = dashboard__loadShare__react__loadShare__.useState(false);
	const { config: formConfig } = useFormContext();
	const dependencies = dashboard__loadShare__react__loadShare__.useMemo(() => field.dependencies || [], [field.dependencies]);
	const autoCompleteValue = dashboard__loadShare__react__loadShare__.useMemo(() => getFieldAutocompleteValue(field, formConfig?.action), [field, formConfig?.action]);
	dashboard__loadShare__react__loadShare__.useEffect(() => {
		const subscription = watch((values, { name }) => {
			if (!dependencies.length || name && dependencies.includes(name)) checkVisibility();
		});
		const checkVisibility = async () => {
			if (!getValues) return;
			const currentValues = getValues();
			let shouldShow = true;
			if (field.requires) {
				for (const requiredFieldPath in field.requires) if (Object.prototype.hasOwnProperty.call(field.requires, requiredFieldPath)) {
					const requirement = field.requires[requiredFieldPath];
					const actualValue = get_1.get(currentValues, requiredFieldPath);
					let requirementMet = false;
					if (typeof requirement === "function") requirementMet = requirement(actualValue);
					else requirementMet = actualValue === requirement;
					if (!requirementMet) {
						shouldShow = false;
						break;
					}
				}
			}
			if (shouldShow && field.show) try {
				const showPromiseOrValue = field.show(currentValues);
				if (showPromiseOrValue instanceof Promise) {
					setIsLoading(true);
					shouldShow = await showPromiseOrValue;
					if (isLoading) setIsLoading(false);
				} else {
					shouldShow = showPromiseOrValue;
					if (isLoading) setIsLoading(false);
				}
			} catch (error) {
				console.error(`Error checking show status for field ${String(field.name)}:`, error);
				shouldShow = false;
				if (isLoading) setIsLoading(false);
			}
			else if (!field.show) {
				if (isLoading) setIsLoading(false);
			} else if (isLoading) setIsLoading(false);
			setIsVisible((prev) => {
				if (prev !== shouldShow) return shouldShow;
				return prev;
			});
		};
		checkVisibility();
		return () => subscription.unsubscribe();
	}, [
		dependencies,
		field,
		getValues,
		isLoading,
		watch
	]);
	if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormItem, {
		className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn(field.className, field.itemClassName),
		children: [
			field.label && /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormLabel, { children: field.label }),
			/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
				className: "flex h-14 items-center justify-center",
				children: /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Spinner, { size: "small" })
			}) }),
			field.description && /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormDescription, { children: field.description })
		]
	});
	if (!isVisible) return null;
	const componentEntry = getFormComponent(field.type);
	const RegisteredComponent = componentEntry?.component;
	if (!componentEntry && field.type !== FormFieldType.CUSTOM) {
		console.warn(`No component registered for form field type: ${field.type}`);
		return null;
	}
	return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormField, {
		control,
		name: field.name,
		render: ({ field: formFieldRenderProps }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormItem, {
			className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn(field.className, field.itemClassName),
			children: [
				field.label && !componentEntry?.handlesLabel && /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormLabel, {
					className: field.labelClassName,
					children: [field.label, field.required && isVisible && /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
						className: "text-destructive",
						children: "*"
					})]
				}),
				/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormControl, { children: RegisteredComponent ? /* @__PURE__ */ jsxRuntimeExports.jsx(RegisteredComponent, {
					...formFieldRenderProps,
					...field.inputProps,
					autocomplete: autoCompleteValue,
					inputClassName: field.inputClassName,
					label: componentEntry?.handlesLabel ? field.label : void 0,
					options: field.options,
					placeholder: field.placeholder,
					required: field.required,
					type: field.type
				}) : field.component ? /* @__PURE__ */ jsxRuntimeExports.jsx(field.component, { ...formFieldRenderProps }) : null }),
				field.description && /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormDescription, { children: field.description }),
				/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormMessage, {})
			]
		})
	}, field.name);
}
function getFieldAutocompleteValue(field, formPurpose) {
	return field.autocomplete ?? getAutocompleteValue(field, { formPurpose }) ?? field.inputProps?.autocomplete;
}

//#region src/components/form/fields/Switch.tsx
const Switch = React3.forwardRef(({ label, autocomplete,...props }, ref) => {
	return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Switch, {
		checked: props.value,
		disabled: props.disabled,
		id: props.name,
		name: props.name,
		onBlur: props.onBlur,
		onCheckedChange: props.onChange,
		ref,
		...autocomplete ? { autoComplete: autocomplete } : {}
	}), label && /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Label, {
		className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("text-foreground", props.labelClassName),
		htmlFor: props.name,
		children: label
	})] });
});
Switch.displayName = "Switch";
function registerSwitch() {
	registerFormComponent(FormFieldType.SWITCH, Switch, { handlesLabel: true });
}

//#region src/components/form/register.ts
function registerAllFormComponents() {
	registerCheckbox();
	registerDatePicker();
	registerFileInput();
	registerEmailInput();
	registerInput();
	registerRadioGroup();
	registerSelect();
	registerSlider();
	registerSwitch();
	registerTextarea();
	registerRichText();
}

//#region src/components/dialog/DialogActions.context.tsx
const DialogActionsContext = dashboard__loadShare__react__loadShare__.createContext({
	closeDialog: () => {},
	openDialog: () => {},
	replaceDialog: () => {},
	setFormMethods: () => {}
});

//#region src/components/dialog/DialogState.context.tsx
const DialogStateContext = dashboard__loadShare__react__loadShare__.createContext({
	currentDialog: void 0,
	formMethods: void 0
});

//#region src/components/dialog/Dialog.context.tsx
/**
* Required provider that maintains dialog state and context.
* Must wrap any components that will use dialogs.
*/
function DialogProvider({ children }) {
	const [dialogStack, setDialogStack] = dashboard__loadShare__react__loadShare__.useState([]);
	const [_formMethods, _setFormMethods] = dashboard__loadShare__react__loadShare__.useState();
	const currentDialog = dialogStack[dialogStack.length - 1];
	dashboard__loadShare__react__loadShare__.useEffect(() => {
		return () => {};
	}, []);
	const setFormMethods = dashboard__loadShare__react__loadShare__.useCallback((methods) => {
		_setFormMethods(methods);
	}, []);
	const openDialog = dashboard__loadShare__react__loadShare__.useCallback((config) => {
		setDialogStack((prev) => [...prev, config]);
	}, []);
	const closeDialog = dashboard__loadShare__react__loadShare__.useCallback((source = "programmatic") => {
		setDialogStack((prev) => {
			const newStack = prev.slice(0, -1);
			const closedDialog = prev[prev.length - 1];
			if (closedDialog && (closedDialog.type === "confirm" || closedDialog.type === "form")) {
				if (source === "user") closedDialog.onCancel?.(source);
			}
			return newStack;
		});
	}, []);
	const replaceDialog = dashboard__loadShare__react__loadShare__.useCallback((newDialog) => {
		setDialogStack((prev) => {
			const newStack = prev.slice(0, -1);
			return [...newStack, newDialog];
		});
	}, []);
	const stateValue = dashboard__loadShare__react__loadShare__.useMemo(() => ({
		currentDialog,
		formMethods: _formMethods
	}), [currentDialog, _formMethods]);
	const actionsValue = dashboard__loadShare__react__loadShare__.useMemo(() => ({
		closeDialog,
		openDialog,
		replaceDialog,
		setFormMethods
	}), [
		openDialog,
		closeDialog,
		replaceDialog,
		setFormMethods
	]);
	return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogStateContext.Provider, {
		value: stateValue,
		children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogActionsContext.Provider, {
			value: actionsValue,
			children
		})
	});
}
const useDialogState = () => dashboard__loadShare__react__loadShare__.useContext(DialogStateContext);
const useDialogActions = () => dashboard__loadShare__react__loadShare__.useContext(DialogActionsContext);
const useDialog = () => {
	const state = useDialogState();
	const actions = useDialogActions();
	return {
		...state,
		...state.currentDialog ? actions : {
			closeDialog: actions.closeDialog,
			openDialog: actions.openDialog,
			replaceDialog: actions.replaceDialog
		}
	};
};
dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.registerBridgedContext(DialogStateContext);
dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.registerBridgedContext(DialogActionsContext);

//#region src/components/dialog/utils/dialogActions.ts
function getDefaultDialogActions(dialog, isSubmitting = false) {
	const actions = [];
	if (dialog.type === "alert") {
		const cancelAction$1 = createCancelAction(dialog);
		if (cancelAction$1) actions.push(cancelAction$1);
		return actions;
	}
	if (dialog.type === "confirm") {
		actions.push(createCancelAction(dialog));
		actions.push(createSubmitAction(dialog, isSubmitting));
		return actions;
	}
	const cancelAction = createCancelAction(dialog);
	if (cancelAction) actions.push(cancelAction);
	actions.push(createSubmitAction(dialog, isSubmitting));
	return actions;
}
function getDefaultFormActions(formConfig, isSubmitting = false) {
	if (formConfig.actionButtons === false) return [];
	const actions = [];
	if (isFormDialogConfig(formConfig)) {
		const cancelAction = createCancelAction(formConfig);
		if (cancelAction) actions.push(cancelAction);
		actions.push(createSubmitAction(formConfig, isSubmitting));
	} else actions.push({
		disabled: isSubmitting,
		label: formConfig.submitLabel ?? "Submit",
		type: ActionItemType.SUBMIT
	});
	return actions;
}
function createCancelAction(dialog) {
	if (dialog.type === "alert") return {
		label: dialog.confirmText ?? "OK",
		onClick: dialog.onConfirm,
		type: ActionItemType.CANCEL
	};
	if (dialog.type === "confirm") return {
		label: dialog.cancelText ?? "Cancel",
		onClick: dialog.onConfirm,
		type: ActionItemType.CANCEL
	};
	const hasCancelText = "cancelText" in dialog && dialog.cancelText;
	const isForm = dialog.type === "form";
	if (!hasCancelText && !isForm) return null;
	const actionConfig = {
		label: getCancelLabel(dialog),
		type: ActionItemType.CANCEL
	};
	if (isForm && dialog.onCancel) actionConfig.onClick = () => dialog.onCancel?.("user");
	return actionConfig;
}
function createSubmitAction(dialog, isSubmitting) {
	return {
		disabled: isSubmitting,
		label: getSubmitLabel(dialog),
		type: getSubmitType(dialog),
		...dialog.variant && { props: { variant: dialog.variant } }
	};
}
function getCancelLabel(dialog) {
	switch (dialog.type) {
		case "confirm": return dialog.cancelText;
		default:
			if ("cancelText" in dialog && dialog.cancelText) return dialog.cancelText;
			return "Cancel";
	}
}
function getSubmitLabel(dialog) {
	switch (dialog.type) {
		case "alert": return dialog.confirmText ?? "OK";
		case "form": return "Submit";
		default: return dialog.confirmText ?? "Continue";
	}
}
function getSubmitType(dialog) {
	switch (dialog.type) {
		case "confirm":
		case "form": return ActionItemType.SUBMIT;
		default: return ActionItemType.BUTTON;
	}
}
function isFormDialogConfig(config) {
	return "type" in config && config.type === "form";
}

//#region src/components/form/FormFooter.tsx
function FormFooter({ className, closeDialog, config, formMethods }) {
	if ("type" in config && config.type === "form") return /* @__PURE__ */ jsxRuntimeExports.jsx(FormDialogFooter$1, {
		className,
		closeDialog,
		config,
		formMethods
	});
	return /* @__PURE__ */ jsxRuntimeExports.jsx(RegularFormFooter, {
		className,
		closeDialog,
		config,
		formMethods
	});
}
function FormDialogFooter$1({ className, closeDialog, config, formMethods }) {
	return renderFormFooter(config, (cfg) => cfg.formConfig.footer, formMethods, closeDialog, className);
}
function RegularFormFooter({ className, closeDialog, config, formMethods }) {
	return renderFormFooter(config, (cfg) => cfg.footer, formMethods, closeDialog, className);
}
function renderFormFooter(config, getFooter, formMethods, closeDialog, className) {
	const footerValue = getFooter(config);
	const defaultActions = getDefaultFormActions(config, formMethods?.formState?.isSubmitting);
	const actions = config.actionButtons ?? defaultActions;
	if (!footerValue && !actions.length) return null;
	if (footerValue) {
		const customFooter = typeof footerValue === "function" ? footerValue(formMethods, closeDialog) : footerValue;
		if (Array.isArray(customFooter)) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
			className,
			children: /* @__PURE__ */ jsxRuntimeExports.jsx(ActionListRenderer, {
				actions: customFooter,
				closeDialog,
				isSubmitting: formMethods?.formState?.isSubmitting || false,
				layout: config.actionButtonsLayout || "horizontal"
			})
		});
		return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
			className,
			children: customFooter
		});
	}
	return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
		className,
		children: /* @__PURE__ */ jsxRuntimeExports.jsx(ActionListRenderer, {
			actions,
			closeDialog,
			isSubmitting: formMethods?.formState?.isSubmitting || false,
			layout: config.actionButtonsLayout || "horizontal"
		})
	});
}

//#region src/components/dialog/types/AlertDialog.tsx
function AlertDialog({ classNames, description, title }) {
	const renderDescription = () => {
		if (!description) return null;
		const content = typeof description === "function" ? React3.createElement(description) : description;
		return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DialogDescription, {
			className: classNames?.description,
			children: content
		});
	};
	return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DialogHeader, {
		className: classNames?.header,
		children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DialogTitle, {
			className: classNames?.title,
			children: title
		}), renderDescription()]
	}) });
}

//#region src/components/dialog/types/ConfirmDialog.tsx
function ConfirmDialog({ classNames, description, title }) {
	return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DialogHeader, {
		className: classNames?.header,
		children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DialogTitle, {
			className: classNames?.title,
			children: title
		}), description && /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DialogDescription, {
			className: classNames?.description,
			children: description
		})]
	}) });
}

//#region src/components/dialog/types/CustomDialog.tsx
function CustomDialog({ classNames, content, title }) {
	return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DialogHeader, {
		className: classNames?.header,
		children: /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DialogTitle, {
			className: classNames?.title,
			children: title
		})
	}), /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
		className: classNames?.content,
		children: content
	})] });
}

//#region src/components/form/handlers/core.ts
const isErrorResponse = (response) => {
	return typeof response === "object" && response !== null && "error" in response;
};
const processErrorResponse = (response) => {
	if (response.error) return toSafeError(response.error);
	return new Error("Unknown error occurred");
};
const toSafeError = (error) => {
	if (error instanceof Error) return error;
	if (typeof error === "object" && error !== null && "message" in error) {
		const message = error.message;
		if (typeof message === "string") return new Error(message, { cause: error });
	}
	return new Error(String(error), { cause: error });
};
const handleError = async (error, options) => {
	const { config, currentDialog, onError } = options;
	const err = toSafeError(error);
	try {
		if (onError) await onError(err);
		else if (config.onError) await config.onError(err);
		else if (currentDialog?.type === "form" && currentDialog.onError) await currentDialog.onError(err);
	} catch (innerError) {
		console.error("Error in form error handler:", innerError);
	}
	throw err;
};
async function handleFormSubmission(options) {
	const { closeDialog, config, currentDialog, formMethods, isStep, onSubmit, onSuccess } = options;
	try {
		return await formMethods.handleSubmit(async (data) => {
			const submitResponse = onSubmit ? await onSubmit(data) : await config.onSubmit?.(data);
			if (isErrorResponse(submitResponse)) throw processErrorResponse(submitResponse);
			const responseData = typeof submitResponse === "object" && submitResponse !== null && "data" in submitResponse ? submitResponse.data : submitResponse;
			if (!isStep) {
				if (config.closeOnSubmit ?? true) await closeDialog?.();
				if (config.onSuccess) await config.onSuccess(responseData, data);
				else if (currentDialog?.type === "form" && currentDialog.onSuccess) await currentDialog.onSuccess(responseData, data);
			}
			if (onSuccess) await onSuccess(responseData, data);
			return responseData;
		})();
	} catch (error) {
		await handleError(error, options);
	}
}

//#region src/components/form/handlers/step.ts
function getStepOnSuccessHandler(config, formMethods, isLastStep, closeDialog) {
	return async (response, data) => {
		if (isLastStep) {
			const allValues = formMethods.getValues();
			if (config.closeOnSubmit ?? true) await closeDialog();
			if (config.onFinish) await config.onFinish(allValues);
			if (config.onSuccess) await config.onSuccess(response, allValues);
		}
	};
}
async function handleStepSubmission(options) {
	const { currentStep, goToNextStep, stepConfig,...baseOptions } = options;
	return handleFormSubmission({
		...baseOptions,
		isStep: true,
		onError: async (error) => {
			if (stepConfig.onStepError) await stepConfig.onStepError(error);
		},
		onSubmit: async (data) => {
			const { isLastStep } = options;
			if (stepConfig.onStepSubmit) return await stepConfig.onStepSubmit(data);
			if (isLastStep && options.config.onSubmit) return await options.config.onSubmit(data);
			return Promise.resolve(data);
		},
		onSuccess: async (response, data) => {
			const { isLastStep } = options;
			if (stepConfig.onStepSuccess) await stepConfig.onStepSuccess(response, data);
			if (options.config.onSuccess) await options.config.onSuccess(response, data);
			if (!isLastStep && options.goToNextStep) await options.goToNextStep();
		}
	});
}

//#region src/components/form/StepFormFooter.tsx
function StepFormFooter({ closeDialog, currentStep, formMethods, handleNext, handlePrevious, handleSubmit, isFirstStep, isLastStep, submitLabel, totalSteps }) {
	return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
		className: "flex justify-between items-center",
		children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
			disabled: isFirstStep || formMethods.formState?.isSubmitting,
			onClick: handlePrevious,
			type: "button",
			variant: "outline",
			children: "Previous"
		}), isLastStep ? /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
			disabled: formMethods.formState?.isSubmitting,
			onClick: handleSubmit,
			type: "button",
			children: formMethods.formState?.isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Spinner, {
				className: "mr-2",
				size: "small"
			}), " Submitting..."] }) : submitLabel ?? "Submit"
		}) : /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
			disabled: formMethods.formState?.isSubmitting,
			onClick: handleNext,
			type: "button",
			children: "Next"
		})]
	});
}

//#region src/components/form/StepSchemaForm.tsx
const defaultStepFormFooter = (stepMethods, formMethods, closeDialog, currentDialog) => /* @__PURE__ */ jsxRuntimeExports.jsx(StepFormFooter, {
	closeDialog,
	currentStep: stepMethods.currentStep,
	formMethods,
	handleNext: stepMethods.handleNext,
	handlePrevious: stepMethods.handlePrevious,
	handleSubmit: stepMethods.handleSubmit,
	isFirstStep: stepMethods.isFirstStep,
	isLastStep: stepMethods.isLastStep,
	submitLabel: currentDialog?.type === "form" ? currentDialog.formConfig?.submitLabel : void 0,
	totalSteps: stepMethods.totalSteps
});
function StepSchemaForm({ closeDialog, config }) {
	const { currentDialog, formMethods } = useDialog();
	const { defaultStep = 0, isBackValidate = false } = config.stepBehavior ?? {};
	const [currentStep, setCurrentStep] = dashboard__loadShare__react__loadShare__.useState(defaultStep);
	const totalSteps = config.steps.length;
	const isFirstStep = currentStep === 0;
	const isLastStep = currentStep === totalSteps - 1;
	const formInstances = dashboard__loadShare__react__loadShare__.useRef({});
	dashboard__loadShare__react__loadShare__.useEffect(() => {
		const currentSteps = config.steps;
		return () => {
			const validStepIndices = new Set(currentSteps.map((_, index) => index));
			Object.keys(formInstances.current).forEach((key) => {
				const index = Number(key);
				if (!validStepIndices.has(index)) delete formInstances.current[index];
			});
		};
	}, [config.steps]);
	const getFormInstance = dashboard__loadShare__react__loadShare__.useCallback((stepIndex) => {
		if (!formInstances.current[stepIndex]) formInstances.current[stepIndex] = {
			fields: config.steps[stepIndex]?.fields || [],
			getFields: () => config.steps[stepIndex]?.fields.map((f) => f.name) || []
		};
		return formInstances.current[stepIndex];
	}, [config.steps]);
	dashboard__loadShare__react__loadShare__.useMemo(() => {
		return getFormInstance(currentStep);
	}, [currentStep, getFormInstance]);
	const go = (step) => {
		const targetStep = Math.max(0, Math.min(step, totalSteps - 1));
		setCurrentStep(targetStep);
	};
	const handleNext = dashboard__loadShare__react__loadShare__.useCallback(async () => {
		if (!formMethods?.handleSubmit) return;
		await handleStepSubmission({
			closeDialog,
			config: {
				...config,
				onSuccess: getStepOnSuccessHandler(config, formMethods, isLastStep, closeDialog)
			},
			currentStep,
			formMethods,
			goToNextStep: isLastStep ? void 0 : () => go(currentStep + 1),
			isLastStep,
			stepConfig: config.steps[currentStep]
		});
	}, [
		formMethods,
		currentStep,
		isLastStep,
		go,
		closeDialog,
		config
	]);
	const handlePrevious = dashboard__loadShare__react__loadShare__.useCallback(async () => {
		if (isFirstStep) return;
		if (isBackValidate && formMethods?.trigger) {
			const currentForm = getFormInstance(currentStep);
			const isValid = await formMethods.trigger(currentForm.getFields());
			if (!isValid) return;
		}
		const prevStepConfig = config.steps[currentStep - 1];
		if (prevStepConfig.onStepSubmit) {
			const prevForm = getFormInstance(currentStep - 1);
			const prevStepValues = prevForm.getFields().reduce((acc, field) => {
				acc[field] = formMethods?.getValues(field);
				return acc;
			}, {});
			await prevStepConfig.onStepSubmit(prevStepValues);
		}
		go(currentStep - 1);
	}, [
		formMethods,
		currentStep,
		isFirstStep,
		isBackValidate,
		go,
		getFormInstance,
		config.steps
	]);
	const triggerSubmit = dashboard__loadShare__react__loadShare__.useCallback(() => {
		if (!formMethods?.handleSubmit) return;
		handleStepSubmission({
			closeDialog,
			config: {
				...config,
				onSuccess: getStepOnSuccessHandler(config, formMethods, isLastStep, closeDialog)
			},
			currentStep,
			formMethods,
			isLastStep,
			stepConfig: config.steps[currentStep]
		});
	}, [
		formMethods,
		config,
		currentStep,
		isLastStep,
		closeDialog
	]);
	const getStepFooter = dashboard__loadShare__react__loadShare__.useCallback((methods, closeDlg, dialog) => {
		const stepMethods = {
			currentStep,
			gotoStep: go,
			handleNext,
			handlePrevious,
			isFirstStep,
			isLastStep,
			totalSteps
		};
		const footerFn = config.footer ?? defaultStepFormFooter;
		return footerFn({
			...stepMethods,
			handleSubmit: triggerSubmit
		}, methods, closeDlg, dialog);
	}, [
		config.footer,
		currentStep,
		go,
		handleNext,
		handlePrevious,
		isFirstStep,
		isLastStep,
		totalSteps,
		triggerSubmit
	]);
	const schemaForms = dashboard__loadShare__react__loadShare__.useMemo(() => {
		return config.steps.map((step, index) => {
			const formConfig = {
				...config,
				fields: getFormInstance(index).fields,
				footer: config.footer === false ? false : getStepFooter,
				validationSchema: step.validationSchema
			};
			return /* @__PURE__ */ jsxRuntimeExports.jsx(SchemaForm, {
				active: currentStep === index,
				closeDialog,
				config: formConfig
			}, `step-${index}`);
		});
	}, [
		config,
		currentStep,
		getFormInstance,
		getStepFooter,
		closeDialog
	]);
	return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: schemaForms });
}

//#region src/components/dialog/types/FormDialog.tsx
function FormDialog({ formConfig, onClose, onSubmit, onSuccess, title }) {
	return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DialogTitle, { children: title }) }), isStepFormConfig(formConfig) ? /* @__PURE__ */ jsxRuntimeExports.jsx(StepSchemaForm, {
		closeDialog: onClose,
		config: {
			...formConfig,
			onSubmit,
			onSuccess
		}
	}) : /* @__PURE__ */ jsxRuntimeExports.jsx(SchemaForm, {
		closeDialog: onClose,
		config: {
			...formConfig,
			onSubmit,
			onSuccess
		}
	})] });
}

//#region src/components/dialog/Dialog.registry.ts
const dialogComponents = {
	alert: AlertDialog,
	confirm: ConfirmDialog,
	custom: CustomDialog,
	form: FormDialog
};
function getDialogComponent(type) {
	return dialogComponents[type];
}
function isRegisteredDialogType(config) {
	return !!config && config.type in dialogComponents;
}

//#region src/components/dialog/footer/ActionsDropdownFooter.tsx
function ActionsDropdownFooter({ className, currentDialog, onConfirm }) {
	if (!currentDialog.actions) return null;
	return /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DropdownMenu, {
		className,
		children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DropdownMenuTrigger, {
			asChild: true,
			children: /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
				disabled: currentDialog.showSpinner,
				variant: currentDialog.variant === "destructive" ? "destructive" : "default",
				children: [currentDialog.actions.triggerLabel, currentDialog.showSpinner && /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Spinner, { className: "ml-2" })]
			})
		}), /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DropdownMenuContent, {
			align: "end",
			children: [(currentDialog.type === "confirm" || currentDialog.type === "alert") && /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DropdownMenuItem, {
				onSelect: onConfirm,
				children: currentDialog.type === "confirm" ? currentDialog.confirmText : "Continue"
			}), currentDialog.actions.content]
		})]
	});
}

//#region src/components/dialog/footer/DefaultDialogFooter.tsx
function DefaultDialogFooter({ closeDialog, currentDialog, onConfirm }) {
	const actions = getDefaultDialogActions(currentDialog);
	const mappedActions = actions.map((action) => {
		if (action.type === ActionItemType.SUBMIT || action.type === ActionItemType.BUTTON) return {
			...action,
			onClick: onConfirm
		};
		return action;
	});
	return /* @__PURE__ */ jsxRuntimeExports.jsx(ActionListRenderer, {
		actions: mappedActions,
		closeDialog,
		isSubmitting: currentDialog.showSpinner,
		layout: currentDialog.actionButtonsLayout
	});
}

//#region src/components/dialog/footer/FormDialogFooter.tsx
function FormDialogFooter({ className, closeDialog, currentDialog, formMethods }) {
	if (!currentDialog.formConfig) return null;
	return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DialogFooter, {
		className,
		children: /* @__PURE__ */ jsxRuntimeExports.jsx(FormFooter, {
			closeDialog,
			config: currentDialog.formConfig,
			formMethods
		})
	});
}

//#region src/components/dialog/footer/DialogFooter.registry.ts
const footerComponents = {
	actions: ActionsDropdownFooter,
	default: DefaultDialogFooter,
	form: FormDialogFooter
};
function getFooterComponent(type) {
	return footerComponents[type];
}
function getFooterTypeForDialog(dialog) {
	if (dialog.type === "form") return "form";
	if (dialog.actions) return "actions";
	return "default";
}

//#region src/components/dialog/utils/dialogClasses.ts
function getDialogContentClasses(currentDialog) {
	const baseClasses = [currentDialog.type === "custom" && "flex flex-col", currentDialog.classNames?.content];
	const sizeClasses = {
		auto: "max-w-[calc(100%-2rem)] sm:max-w-md",
		lg: "max-w-2xl",
		md: "max-w-xl",
		sm: "max-w-sm"
	}[currentDialog.size || "auto"];
	const positionClasses = {
		"bottom": "bottom-4 inset-x-0 mx-auto",
		"bottom-left": "bottom-4 left-4",
		"bottom-right": "bottom-4 right-4",
		"left": "left-4 top-1/2 -translate-y-1/2",
		"right": "right-4 top-1/2 -translate-y-1/2",
		"top": "top-4 inset-x-0 mx-auto",
		"top-left": "top-4 left-4",
		"top-right": "top-4 right-4"
	}[currentDialog.position || "center"];
	return dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn(baseClasses, sizeClasses, positionClasses);
}

//#region src/components/dialog/utils/handleConfirm.ts
async function handleConfirm(dialog, closeDialog) {
	if (!dialog) return;
	try {
		const isConfirmLike = dialog.type === "confirm" || dialog.type === "alert";
		if (isConfirmLike && dialog.onConfirm) {
			await dialog.onConfirm();
			closeDialog();
			return;
		}
	} catch (error) {
		if (!dialog.dismissable) throw error;
	} finally {
		if ((dialog.type === "confirm" || dialog.type === "alert") && dialog.dismissable) closeDialog();
	}
}

//#region src/components/dialog/Dialog.renderer.tsx
const DialogFooterContent = ({ closeDialog, currentDialog, formMethods, onConfirm }) => {
	if (currentDialog.footer) return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DialogFooter, {
		className: currentDialog.classNames?.footer,
		children: currentDialog.footer
	});
	if (currentDialog.type === "form") return null;
	const footerType = getFooterTypeForDialog(currentDialog);
	const FooterComponent = getFooterComponent(footerType);
	return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DialogFooter, {
		className: currentDialog.classNames?.footer,
		children: /* @__PURE__ */ jsxRuntimeExports.jsx(FooterComponent, {
			closeDialog,
			currentDialog,
			formMethods,
			onConfirm
		})
	});
};
function DialogRenderer() {
	const { currentDialog, formMethods } = useDialogState();
	const DialogComponent = currentDialog ? getDialogComponent(currentDialog.type) : null;
	const { closeDialog } = useDialogActions();
	const { open: openNotification } = dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useNotification();
	if (!currentDialog) return null;
	const handleConfirm$1 = async () => {
		await handleConfirm(currentDialog, closeDialog);
	};
	return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Dialog, {
		"aria-describedby": currentDialog.description ? "dialog-description" : void 0,
		"aria-labelledby": "dialog-title",
		onOpenChange: (open) => !open && closeDialog("user"),
		open: !!currentDialog,
		children: /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DialogContent, {
			className: getDialogContentClasses(currentDialog),
			"data-has-title": !!currentDialog.title,
			onInteractOutside: (e) => {
				if (currentDialog.preventCloseOnOutsideClick === true) e.preventDefault();
				else if (currentDialog.preventCloseOnOutsideClick === "dirty") {
					e.preventDefault();
					openNotification?.({
						description: "You have unsaved changes. Are you sure you want to leave?",
						message: "Unsaved Changes",
						type: "error"
					});
				}
			},
			children: [isRegisteredDialogType(currentDialog) ? /* @__PURE__ */ jsxRuntimeExports.jsx(DialogComponent, {
				...currentDialog,
				onClose: () => closeDialog("user")
			}) : console.warn(`No component registered for dialog type: ${currentDialog.type}`), /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooterContent, {
				closeDialog,
				currentDialog,
				formMethods,
				onConfirm: handleConfirm$1
			})]
		})
	});
}

//#region src/components/dialog/Dialog.types.ts
function isAlertDialog(config) {
	return config.type === "alert";
}
function isConfirmDialog(config) {
	return config.type === "confirm";
}
function isCustomDialog(config) {
	return config.type === "custom";
}
function isFormDialog(config) {
	return config.type === "form";
}

//#region src/components/form/utils/autoSave.ts
function computeAutoSaveConfig(autoSave) {
	if (autoSave === true) return {
		debounce: 1e3,
		enabled: true
	};
	if (typeof autoSave === "object" && autoSave !== null) return {
		...autoSave,
		debounce: autoSave.debounce ?? 1e3,
		enabled: true
	};
	return { enabled: false };
}

//#region src/components/form/SchemaForm.tsx
const defaultFooterCss = "pt-4 mt-4 border-t";
function SchemaForm({ active = true, closeDialog = () => void 0, config }) {
	if (!active) return null;
	const { currentDialog, setFormMethods: setFormInstance } = useDialog();
	const { open: openNotification } = dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useNotification();
	if (!config) throw new Error("SchemaForm requires a form config");
	const shouldUseRefine = config.adapter === "refine" || config.refine || Boolean(config.refineCoreProps?.resource);
	const adapterName = shouldUseRefine ? "refine" : config.adapter ?? "rhf";
	const adapter = adapters[adapterName];
	const autoSaveConfig = computeAutoSaveConfig(config.autoSave);
	const formInstance = adapter.useForm({
		defaultValues: config.defaultValues,
		refineCoreProps: {
			...config.refineCoreProps,
			action: config.action,
			autoSave: autoSaveConfig,
			errorNotification: config.errorNotification,
			id: ["edit", "clone"].includes(config.action) ? config.id : void 0,
			redirectOnSuccess: false,
			resource: config.resource,
			successNotification: config.successNotification
		},
		validationSchema: config.validationSchema
	});
	const autoSaveProps = shouldUseRefine ? "refineCore" in formInstance ? formInstance.refineCore.autoSaveProps : void 0 : void 0;
	const isActiveDialog = !!currentDialog?.formConfig;
	dashboard__loadShare__react__loadShare__.useEffect(() => {
		if (!setFormInstance) return;
		if (isActiveDialog) setFormInstance(formInstance);
		return () => {
			try {
				setFormInstance(void 0);
			} catch {}
		};
	}, [
		formInstance,
		setFormInstance,
		isActiveDialog
	]);
	const cConfig = { ...config };
	if (cConfig.footerClassName === void 0) cConfig.footerClassName = defaultFooterCss;
	if (cConfig.footerClassName === false) cConfig.footerClassName = void 0;
	const finalConfig = dashboard__loadShare__react__loadShare__.useMemo(() => isActiveDialog ? {
		...currentDialog,
		formConfig: cConfig
	} : cConfig, [
		isActiveDialog,
		currentDialog,
		cConfig
	]);
	const isRefineWithAutosave = shouldUseRefine && autoSaveConfig?.enabled;
	return /* @__PURE__ */ jsxRuntimeExports.jsx(FormProvider, {
		adapter: adapterName,
		autoSave: autoSaveProps,
		config: cConfig,
		formInstance,
		children: /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Form, {
			...formInstance,
			children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", {
				className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn(cConfig.formClassName, {
					"flex flex-col space-y-4": cConfig.layout === "vertical" || !cConfig.layout,
					"flex flex-row items-end gap-4": cConfig.layout === "horizontal",
					"grid gap-4": cConfig.layout === "grid",
					"space-y-4": cConfig.layout !== "grid"
				}),
				onSubmit: formInstance.handleSubmit(async () => {
					await handleFormSubmission({
						closeDialog,
						config: cConfig,
						currentDialog,
						formMethods: formInstance,
						isStep: isStepFormConfig(cConfig),
						onError: async (error) => {
							if (adapterName !== "refine" && cConfig.errorNotification) {
								const notification = typeof cConfig.errorNotification === "function" ? cConfig.errorNotification(error) : cConfig.errorNotification;
								openNotification?.(notification);
							}
						},
						onSubmit: async (data) => adapter.submitHandler(cConfig, formInstance)
					});
				}),
				children: [
					cConfig.header && /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
						className: "form-header",
						children: typeof cConfig.header === "function" ? cConfig.header(formInstance) : cConfig.header
					}),
					/* @__PURE__ */ jsxRuntimeExports.jsx(FormRenderer, {
						fields: cConfig.fields,
						groups: cConfig.groups
					}),
					cConfig.footer !== false && /* @__PURE__ */ jsxRuntimeExports.jsx(FormFooter, {
						className: cConfig.footerClassName,
						closeDialog,
						config: finalConfig,
						formMethods: formInstance
					}),
					isRefineWithAutosave && /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.AutoSaveIndicator, {
						...autoSaveProps,
						elements: cConfig.autoSaveStates
					})
				]
			})
		})
	});
}

//#region src/components/form/fields/DatePicker.tsx
const DatePicker = React3.forwardRef(({ autocomplete,...props }, ref) => {
	return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DatePicker, {
		className: "border-modal-input placeholder-modal-input placeholder:text-foreground/50 p-4",
		date: props.date,
		disabled: props.disabled,
		onBlur: props.onBlur,
		placeholder: props.placeholder,
		ref,
		setDate: props.onChange,
		...autocomplete ? { autoComplete: autocomplete } : {}
	});
});
DatePicker.displayName = "DatePicker";
function registerDatePicker() {
	registerFormComponent(FormFieldType.DATE, DatePicker);
}

//#region src/components/form/fields/Checkbox.tsx
const Checkbox = React3.forwardRef(({ label, autocomplete,...props }, ref) => {
	return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Checkbox, {
		checked: props.value,
		disabled: props.disabled,
		id: props.name,
		name: props.name,
		onBlur: props.onBlur,
		onCheckedChange: props.onChange,
		ref,
		autoComplete: autocomplete
	}), label && /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Label, {
		className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("text-foreground", props.labelClassName),
		htmlFor: props.name,
		children: typeof label === "function" ? React3.createElement(label) : label
	})] });
});
Checkbox.displayName = "Checkbox";
function registerCheckbox() {
	registerFormComponent(FormFieldType.CHECKBOX, Checkbox, { handlesLabel: true });
}

//#region src/components/Loading.tsx
function Loading({ className, children,...rest }) {
	return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
		...rest,
		role: "status",
		"aria-busy": "true",
		className: `bg-background fixed inset-0 z-50 transition-opacity duration-300 ${className ?? ""}`,
		children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
			className: "flex min-h-screen flex-col items-center justify-center p-8",
			children: [/* @__PURE__ */ jsxRuntimeExports.jsx("div", {
				className: "mb-8",
				children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
					className: "bg-primary flex h-16 w-16 items-center justify-center rounded-2xl",
					children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", {
						"aria-hidden": "true",
						focusable: "false",
						className: "text-primary-foreground h-8 w-8 motion-safe:animate-spin motion-reduce:animate-none",
						fill: "currentColor",
						viewBox: "0 0 24 24",
						children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z" })
					})
				})
			}), /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
				className: "text-center",
				children: children ?? /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
					className: "text-muted-foreground",
					children: "Loading page..."
				})
			})]
		})
	});
}

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
  const api = { setState, getState, getInitialState, subscribe };
  const initialState = state = createState(setState, getState, api);
  return api;
};
const createStore = ((createState) => createState ? createStoreImpl(createState) : createStoreImpl);

const identity$1 = (arg) => arg;
function useStore(api, selector = identity$1) {
  const slice = React3.useSyncExternalStore(
    api.subscribe,
    React3.useCallback(() => selector(api.getState()), [api, selector]),
    React3.useCallback(() => selector(api.getInitialState()), [api, selector])
  );
  React3.useDebugValue(slice);
  return slice;
}

//#region src/store/appStore.ts
const helpers = {
	findMenuItem: (items, id) => {
		for (const item of items) {
			if (item.id === id) return item;
			if (item.children) {
				const found = helpers.findMenuItem(item.children, id);
				if (found) return found;
			}
		}
		return void 0;
	},
	addItemsToRoot: (newItems, existingItems) => {
		const newItemsFiltered = newItems.filter((item, index, self) => item.id && self.findIndex((i) => i.id === item.id) === index);
		const existingIds = new Set(existingItems.map((item) => item.id).filter(Boolean));
		const itemsToAdd = newItemsFiltered.filter((item) => item.id && !existingIds.has(item.id));
		return [...existingItems, ...itemsToAdd.map((item) => ({
			...item,
			children: item.children || []
		}))];
	},
	addItemsToChildren: (newItems, parent) => {
		const existingChildIds = new Set(parent.children?.map((item) => item.id).filter(Boolean));
		const itemsToAdd = newItems.filter((item) => item.id && !existingChildIds.has(item.id));
		const newChildren = [...parent.children || [], ...itemsToAdd.map((item) => {
			const child = {
				...item,
				children: item.children || []
			};
			if (parent.path && child.path && !child.path.startsWith("/")) {
				const parentPath = parent.path.endsWith("/") ? parent.path.slice(0, -1) : parent.path;
				const childPath = child.path.startsWith("/") ? child.path.slice(1) : child.path;
				child.path = `${parentPath}/${childPath}`;
			}
			return child;
		})];
		return {
			...parent,
			children: newChildren
		};
	},
	findAndModifyMenuItem: (items, key, modifier) => {
		let changed = false;
		const newItems = items.map((item) => {
			if (item.id === key) {
				changed = true;
				return modifier(item);
			}
			if (item.children) {
				const updatedChildren = helpers.findAndModifyMenuItem(item.children, key, modifier);
				if (updatedChildren !== item.children) {
					changed = true;
					return {
						...item,
						children: updatedChildren
					};
				}
			}
			return item;
		});
		return changed ? newItems : items;
	},
	removeItemFromMenu: (items, key) => {
		let removed = false;
		const newItems = items.map((item) => {
			if (item.children) {
				const updatedChildren = helpers.removeItemFromMenu(item.children, key);
				if (updatedChildren !== item.children) {
					removed = true;
					return {
						...item,
						children: [...updatedChildren]
					};
				}
			}
			return item;
		}).filter((item) => {
			if (item.id === key) {
				removed = true;
				return false;
			}
			return true;
		});
		return removed ? newItems : items;
	}
};
const appStore = createStore((set) => ({
	addMenuItem: (newItem, parentKey) => set((state) => {
		if (parentKey) {
			const parent = helpers.findMenuItem(state.menuItems, parentKey);
			if (parent) return { menuItems: helpers.findAndModifyMenuItem(state.menuItems, parentKey, (parent$1) => helpers.addItemsToChildren([newItem], parent$1)) };
			else return { menuItems: helpers.addItemsToRoot([newItem], state.menuItems) };
		} else return { menuItems: helpers.addItemsToRoot([newItem], state.menuItems) };
	}),
	addMenuItems: (items, parentKey) => set((state) => {
		let newMenuItems = [...state.menuItems];
		const itemsWithoutParents = items.filter((item) => !item.parentId);
		if (itemsWithoutParents.length > 0) newMenuItems = helpers.addItemsToRoot(itemsWithoutParents, newMenuItems);
		const itemsWithParents = items.filter((item) => item.parentId || parentKey);
		for (const item of itemsWithParents) {
			const targetParentKey = parentKey ?? item.parentId;
			if (targetParentKey) {
				const parent = helpers.findMenuItem(newMenuItems, targetParentKey);
				if (parent) {
					newMenuItems = helpers.findAndModifyMenuItem(newMenuItems, targetParentKey, (parent$1) => helpers.addItemsToChildren([item], parent$1));
					newMenuItems = newMenuItems.filter((i) => i.id !== item.id);
				} else newMenuItems = helpers.addItemsToRoot([item], newMenuItems);
			}
		}
		return { menuItems: newMenuItems };
	}),
	error: null,
	isLoading: false,
	menuItems: [],
	pluginConfigs: [],
	removeMenuItem: (key) => set((state) => {
		return { menuItems: helpers.removeItemFromMenu(state.menuItems, key) };
	}),
	routes: [],
	setError: (error) => set({ error }),
	setIsLoading: (isLoading) => set({ isLoading }),
	setPluginConfigs: (pluginConfigs) => set({ pluginConfigs }),
	setRoutes: (routes) => set({ routes })
}));
const useAppStore = (selector) => useStore(appStore, selector);

function derive(deriveFn) {
    const listeners = new Set();
    const subscriptions = new Map();
    let state;
    let dependencies;
    let invalidated = true;
    const invalidate = () => {
        if (invalidated) {
            return;
        }
        invalidated = true;
        listeners.forEach((listener) => listener(state, state));
    };
    const getState = () => {
        if (!invalidated) {
            return state;
        }
        if (!dependencies ||
            Array.from(dependencies).some(([store, value]) => !Object.is(store.getState(), value))) {
            const newDependencies = new Map();
            const get = (store) => {
                if (!store) {
                    return state;
                }
                const s = store.getState();
                newDependencies.set(store, s);
                return s;
            };
            state = deriveFn(get);
            dependencies = newDependencies;
        }
        if (listeners.size) {
            const deps = new Set(dependencies.keys());
            subscriptions.forEach((unsubscribe, store) => {
                if (deps.has(store)) {
                    deps.delete(store);
                }
                else {
                    unsubscribe();
                    subscriptions.delete(store);
                }
            });
            deps.forEach((store) => {
                subscriptions.set(store, store.subscribe(invalidate));
            });
            invalidated = false;
        }
        return state;
    };
    const subscribe = (listener) => {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
            if (!listeners.size) {
                subscriptions.forEach((unsubscribe) => unsubscribe());
                subscriptions.clear();
                invalidated = true;
            }
        };
    };
    const store = {
        getState,
        subscribe,
        getInitialState: () => {
            throw new Error('getInitialState is not available in derived store');
        },
        setState: () => {
            throw new Error('setState is not available in derived store');
        },
        destroy: () => {
            throw new Error('destory is not available in derived store');
        },
    };
    return store;
}

const isIterable = (obj) => Symbol.iterator in obj;
const hasIterableEntries = (value) => (
  // HACK: avoid checking entries type
  "entries" in value
);
const compareEntries = (valueA, valueB) => {
  const mapA = valueA instanceof Map ? valueA : new Map(valueA.entries());
  const mapB = valueB instanceof Map ? valueB : new Map(valueB.entries());
  if (mapA.size !== mapB.size) {
    return false;
  }
  for (const [key, value] of mapA) {
    if (!mapB.has(key) || !Object.is(value, mapB.get(key))) {
      return false;
    }
  }
  return true;
};
const compareIterables = (valueA, valueB) => {
  const iteratorA = valueA[Symbol.iterator]();
  const iteratorB = valueB[Symbol.iterator]();
  let nextA = iteratorA.next();
  let nextB = iteratorB.next();
  while (!nextA.done && !nextB.done) {
    if (!Object.is(nextA.value, nextB.value)) {
      return false;
    }
    nextA = iteratorA.next();
    nextB = iteratorB.next();
  }
  return !!nextA.done && !!nextB.done;
};
function shallow(valueA, valueB) {
  if (Object.is(valueA, valueB)) {
    return true;
  }
  if (typeof valueA !== "object" || valueA === null || typeof valueB !== "object" || valueB === null) {
    return false;
  }
  if (Object.getPrototypeOf(valueA) !== Object.getPrototypeOf(valueB)) {
    return false;
  }
  if (isIterable(valueA) && isIterable(valueB)) {
    if (hasIterableEntries(valueA) && hasIterableEntries(valueB)) {
      return compareEntries(valueA, valueB);
    }
    return compareIterables(valueA, valueB);
  }
  return compareEntries(
    { entries: () => Object.entries(valueA) },
    { entries: () => Object.entries(valueB) }
  );
}

var withSelector = {exports: {}};

var withSelector_production = {};

/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = dashboard__loadShare__react__loadShare__,
  shim = shimExports;
function is(x, y) {
  return (x === y && (0 !== x || 1 / x === 1 / y)) || (x !== x && y !== y);
}
var objectIs = "function" === typeof Object.is ? Object.is : is,
  useSyncExternalStore = shim.useSyncExternalStore,
  useRef = React.useRef,
  useEffect = React.useEffect,
  useMemo = React.useMemo,
  useDebugValue = React.useDebugValue;
withSelector_production.useSyncExternalStoreWithSelector = function (
  subscribe,
  getSnapshot,
  getServerSnapshot,
  selector,
  isEqual
) {
  var instRef = useRef(null);
  if (null === instRef.current) {
    var inst = { hasValue: false, value: null };
    instRef.current = inst;
  } else inst = instRef.current;
  instRef = useMemo(
    function () {
      function memoizedSelector(nextSnapshot) {
        if (!hasMemo) {
          hasMemo = true;
          memoizedSnapshot = nextSnapshot;
          nextSnapshot = selector(nextSnapshot);
          if (void 0 !== isEqual && inst.hasValue) {
            var currentSelection = inst.value;
            if (isEqual(currentSelection, nextSnapshot))
              return (memoizedSelection = currentSelection);
          }
          return (memoizedSelection = nextSnapshot);
        }
        currentSelection = memoizedSelection;
        if (objectIs(memoizedSnapshot, nextSnapshot)) return currentSelection;
        var nextSelection = selector(nextSnapshot);
        if (void 0 !== isEqual && isEqual(currentSelection, nextSelection))
          return (memoizedSnapshot = nextSnapshot), currentSelection;
        memoizedSnapshot = nextSnapshot;
        return (memoizedSelection = nextSelection);
      }
      var hasMemo = false,
        memoizedSnapshot,
        memoizedSelection,
        maybeGetServerSnapshot =
          void 0 === getServerSnapshot ? null : getServerSnapshot;
      return [
        function () {
          return memoizedSelector(getSnapshot());
        },
        null === maybeGetServerSnapshot
          ? void 0
          : function () {
              return memoizedSelector(maybeGetServerSnapshot());
            }
      ];
    },
    [getSnapshot, getServerSnapshot, selector, isEqual]
  );
  var value = useSyncExternalStore(subscribe, instRef[0], instRef[1]);
  useEffect(
    function () {
      inst.hasValue = true;
      inst.value = value;
    },
    [value]
  );
  useDebugValue(value);
  return value;
};

{
  withSelector.exports = withSelector_production;
}

var withSelectorExports = withSelector.exports;
const useSyncExternalStoreExports = /*@__PURE__*/getDefaultExportFromCjs(withSelectorExports);

const { useSyncExternalStoreWithSelector } = useSyncExternalStoreExports;
const identity = (arg) => arg;
function useStoreWithEqualityFn(api, selector = identity, equalityFn) {
  const slice = useSyncExternalStoreWithSelector(
    api.subscribe,
    api.getState,
    api.getInitialState,
    selector,
    equalityFn
  );
  React3.useDebugValue(slice);
  return slice;
}

//#region src/store/portalStore.ts
const portalStore = createStore((set) => ({
	isMetaLoading: false,
	meta: void 0,
	portalUrl: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.env.VITE_PORTAL_DOMAIN ?? "",
	sdk: null,
	setIsMetaLoading: (isMetaLoading) => set({ isMetaLoading }),
	setMeta: (meta) => set({ meta }),
	setPortalUrl: (portalUrl) => set({ portalUrl }),
	setSdk: (sdk) => set({ sdk })
}));
const usePortalActions = () => {
	return useStoreWithEqualityFn(portalStore, (state) => ({
		setIsMetaLoading: state.setIsMetaLoading,
		setMeta: state.setMeta,
		setPortalUrl: state.setPortalUrl,
		setSdk: state.setSdk
	}), shallow);
};
const usePortalStore = (selector, equalityFn = shallow) => {
	return useStoreWithEqualityFn(portalStore, selector, equalityFn);
};
const useFrameworkSync = () => {
	const framework = dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.useFramework();
	const actions = usePortalActions();
	dashboard__loadShare__react__loadShare__.useEffect(() => {
		if (!framework) return;
		if (!framework?.framework) return;
		if (framework?.framework) actions.setPortalUrl(framework.framework.portalUrl);
		if (framework?.framework?.meta) actions.setMeta(framework.framework.meta);
	}, [framework?.framework, actions]);
};
const usePortal = (selector, equalityFn) => {
	const state = usePortalStore(selector, equalityFn);
	const actions = usePortalActions();
	return {
		...state,
		...actions
	};
};
const metaStore = derive((get) => {
	const portalUrl = get(portalStore).portalUrl;
	const isMetaLoading = get(portalStore).isMetaLoading;
	if (!portalUrl || isMetaLoading) return void 0;
	return get(portalStore).meta;
});
const useMetaStore = () => useStore(metaStore);

/** @type {import('./type')} */
var type = TypeError;

var hasMap = typeof Map === 'function' && Map.prototype;
var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, 'size') : null;
var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === 'function' ? mapSizeDescriptor.get : null;
var mapForEach = hasMap && Map.prototype.forEach;
var hasSet = typeof Set === 'function' && Set.prototype;
var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, 'size') : null;
var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === 'function' ? setSizeDescriptor.get : null;
var setForEach = hasSet && Set.prototype.forEach;
var hasWeakMap = typeof WeakMap === 'function' && WeakMap.prototype;
var weakMapHas = hasWeakMap ? WeakMap.prototype.has : null;
var hasWeakSet = typeof WeakSet === 'function' && WeakSet.prototype;
var weakSetHas = hasWeakSet ? WeakSet.prototype.has : null;
var hasWeakRef = typeof WeakRef === 'function' && WeakRef.prototype;
var weakRefDeref = hasWeakRef ? WeakRef.prototype.deref : null;
var booleanValueOf = Boolean.prototype.valueOf;
var objectToString = Object.prototype.toString;
var functionToString = Function.prototype.toString;
var $match = String.prototype.match;
var $slice = String.prototype.slice;
var $replace$1 = String.prototype.replace;
var $toUpperCase = String.prototype.toUpperCase;
var $toLowerCase = String.prototype.toLowerCase;
var $test = RegExp.prototype.test;
var $concat$1 = Array.prototype.concat;
var $join = Array.prototype.join;
var $arrSlice = Array.prototype.slice;
var $floor = Math.floor;
var bigIntValueOf = typeof BigInt === 'function' ? BigInt.prototype.valueOf : null;
var gOPS = Object.getOwnPropertySymbols;
var symToString = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? Symbol.prototype.toString : null;
var hasShammedSymbols = typeof Symbol === 'function' && typeof Symbol.iterator === 'object';
// ie, `has-tostringtag/shams
var toStringTag = typeof Symbol === 'function' && Symbol.toStringTag && (typeof Symbol.toStringTag === hasShammedSymbols ? 'object' : 'symbol')
    ? Symbol.toStringTag
    : null;
var isEnumerable = Object.prototype.propertyIsEnumerable;

var gPO = (typeof Reflect === 'function' ? Reflect.getPrototypeOf : Object.getPrototypeOf) || (
    [].__proto__ === Array.prototype // eslint-disable-line no-proto
        ? function (O) {
            return O.__proto__; // eslint-disable-line no-proto
        }
        : null
);

function addNumericSeparator(num, str) {
    if (
        num === Infinity
        || num === -Infinity
        || num !== num
        || (num && num > -1e3 && num < 1000)
        || $test.call(/e/, str)
    ) {
        return str;
    }
    var sepRegex = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
    if (typeof num === 'number') {
        var int = num < 0 ? -$floor(-num) : $floor(num); // trunc(num)
        if (int !== num) {
            var intStr = String(int);
            var dec = $slice.call(str, intStr.length + 1);
            return $replace$1.call(intStr, sepRegex, '$&_') + '.' + $replace$1.call($replace$1.call(dec, /([0-9]{3})/g, '$&_'), /_$/, '');
        }
    }
    return $replace$1.call(str, sepRegex, '$&_');
}

var quotes = {
    __proto__: null,
    'double': '"',
    single: "'"
};
var quoteREs = {
    __proto__: null,
    'double': /(["\\])/g,
    single: /(['\\])/g
};

var objectInspect = function inspect_(obj, options, depth, seen) {
    var opts = options || {};

    if (has$3(opts, 'quoteStyle') && !has$3(quotes, opts.quoteStyle)) {
        throw new TypeError('option "quoteStyle" must be "single" or "double"');
    }
    if (
        has$3(opts, 'maxStringLength') && (typeof opts.maxStringLength === 'number'
            ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity
            : opts.maxStringLength !== null
        )
    ) {
        throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
    }
    var customInspect = has$3(opts, 'customInspect') ? opts.customInspect : true;
    if (typeof customInspect !== 'boolean' && customInspect !== 'symbol') {
        throw new TypeError('option "customInspect", if provided, must be `true`, `false`, or `\'symbol\'`');
    }

    if (
        has$3(opts, 'indent')
        && opts.indent !== null
        && opts.indent !== '\t'
        && !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)
    ) {
        throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
    }
    if (has$3(opts, 'numericSeparator') && typeof opts.numericSeparator !== 'boolean') {
        throw new TypeError('option "numericSeparator", if provided, must be `true` or `false`');
    }
    var numericSeparator = opts.numericSeparator;

    if (typeof obj === 'undefined') {
        return 'undefined';
    }
    if (obj === null) {
        return 'null';
    }
    if (typeof obj === 'boolean') {
        return obj ? 'true' : 'false';
    }

    if (typeof obj === 'string') {
        return inspectString(obj, opts);
    }
    if (typeof obj === 'number') {
        if (obj === 0) {
            return Infinity / obj > 0 ? '0' : '-0';
        }
        var str = String(obj);
        return numericSeparator ? addNumericSeparator(obj, str) : str;
    }
    if (typeof obj === 'bigint') {
        var bigIntStr = String(obj) + 'n';
        return numericSeparator ? addNumericSeparator(obj, bigIntStr) : bigIntStr;
    }

    var maxDepth = typeof opts.depth === 'undefined' ? 5 : opts.depth;
    if (typeof depth === 'undefined') { depth = 0; }
    if (depth >= maxDepth && maxDepth > 0 && typeof obj === 'object') {
        return isArray$3(obj) ? '[Array]' : '[Object]';
    }

    var indent = getIndent(opts, depth);

    if (typeof seen === 'undefined') {
        seen = [];
    } else if (indexOf(seen, obj) >= 0) {
        return '[Circular]';
    }

    function inspect(value, from, noIndent) {
        if (from) {
            seen = $arrSlice.call(seen);
            seen.push(from);
        }
        if (noIndent) {
            var newOpts = {
                depth: opts.depth
            };
            if (has$3(opts, 'quoteStyle')) {
                newOpts.quoteStyle = opts.quoteStyle;
            }
            return inspect_(value, newOpts, depth + 1, seen);
        }
        return inspect_(value, opts, depth + 1, seen);
    }

    if (typeof obj === 'function' && !isRegExp$1(obj)) { // in older engines, regexes are callable
        var name = nameOf(obj);
        var keys = arrObjKeys(obj, inspect);
        return '[Function' + (name ? ': ' + name : ' (anonymous)') + ']' + (keys.length > 0 ? ' { ' + $join.call(keys, ', ') + ' }' : '');
    }
    if (isSymbol(obj)) {
        var symString = hasShammedSymbols ? $replace$1.call(String(obj), /^(Symbol\(.*\))_[^)]*$/, '$1') : symToString.call(obj);
        return typeof obj === 'object' && !hasShammedSymbols ? markBoxed(symString) : symString;
    }
    if (isElement(obj)) {
        var s = '<' + $toLowerCase.call(String(obj.nodeName));
        var attrs = obj.attributes || [];
        for (var i = 0; i < attrs.length; i++) {
            s += ' ' + attrs[i].name + '=' + wrapQuotes(quote(attrs[i].value), 'double', opts);
        }
        s += '>';
        if (obj.childNodes && obj.childNodes.length) { s += '...'; }
        s += '</' + $toLowerCase.call(String(obj.nodeName)) + '>';
        return s;
    }
    if (isArray$3(obj)) {
        if (obj.length === 0) { return '[]'; }
        var xs = arrObjKeys(obj, inspect);
        if (indent && !singleLineValues(xs)) {
            return '[' + indentedJoin(xs, indent) + ']';
        }
        return '[ ' + $join.call(xs, ', ') + ' ]';
    }
    if (isError(obj)) {
        var parts = arrObjKeys(obj, inspect);
        if (!('cause' in Error.prototype) && 'cause' in obj && !isEnumerable.call(obj, 'cause')) {
            return '{ [' + String(obj) + '] ' + $join.call($concat$1.call('[cause]: ' + inspect(obj.cause), parts), ', ') + ' }';
        }
        if (parts.length === 0) { return '[' + String(obj) + ']'; }
        return '{ [' + String(obj) + '] ' + $join.call(parts, ', ') + ' }';
    }
    if (typeof obj === 'object' && customInspect) {
        if (customInspect !== 'symbol' && typeof obj.inspect === 'function') {
            return obj.inspect();
        }
    }
    if (isMap(obj)) {
        var mapParts = [];
        if (mapForEach) {
            mapForEach.call(obj, function (value, key) {
                mapParts.push(inspect(key, obj, true) + ' => ' + inspect(value, obj));
            });
        }
        return collectionOf('Map', mapSize.call(obj), mapParts, indent);
    }
    if (isSet(obj)) {
        var setParts = [];
        if (setForEach) {
            setForEach.call(obj, function (value) {
                setParts.push(inspect(value, obj));
            });
        }
        return collectionOf('Set', setSize.call(obj), setParts, indent);
    }
    if (isWeakMap(obj)) {
        return weakCollectionOf('WeakMap');
    }
    if (isWeakSet(obj)) {
        return weakCollectionOf('WeakSet');
    }
    if (isWeakRef(obj)) {
        return weakCollectionOf('WeakRef');
    }
    if (isNumber(obj)) {
        return markBoxed(inspect(Number(obj)));
    }
    if (isBigInt(obj)) {
        return markBoxed(inspect(bigIntValueOf.call(obj)));
    }
    if (isBoolean(obj)) {
        return markBoxed(booleanValueOf.call(obj));
    }
    if (isString(obj)) {
        return markBoxed(inspect(String(obj)));
    }
    // note: in IE 8, sometimes `global !== window` but both are the prototypes of each other
    /* eslint-env browser */
    if (typeof window !== 'undefined' && obj === window) {
        return '{ [object Window] }';
    }
    if (
        (typeof globalThis !== 'undefined' && obj === globalThis)
        || (typeof commonjsGlobal !== 'undefined' && obj === commonjsGlobal)
    ) {
        return '{ [object globalThis] }';
    }
    if (!isDate(obj) && !isRegExp$1(obj)) {
        var ys = arrObjKeys(obj, inspect);
        var isPlainObject = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
        var protoTag = obj instanceof Object ? '' : 'null prototype';
        var stringTag = !isPlainObject && toStringTag && Object(obj) === obj && toStringTag in obj ? $slice.call(toStr(obj), 8, -1) : protoTag ? 'Object' : '';
        var constructorTag = isPlainObject || typeof obj.constructor !== 'function' ? '' : obj.constructor.name ? obj.constructor.name + ' ' : '';
        var tag = constructorTag + (stringTag || protoTag ? '[' + $join.call($concat$1.call([], stringTag || [], protoTag || []), ': ') + '] ' : '');
        if (ys.length === 0) { return tag + '{}'; }
        if (indent) {
            return tag + '{' + indentedJoin(ys, indent) + '}';
        }
        return tag + '{ ' + $join.call(ys, ', ') + ' }';
    }
    return String(obj);
};

function wrapQuotes(s, defaultStyle, opts) {
    var style = opts.quoteStyle || defaultStyle;
    var quoteChar = quotes[style];
    return quoteChar + s + quoteChar;
}

function quote(s) {
    return $replace$1.call(String(s), /"/g, '&quot;');
}

function canTrustToString(obj) {
    return !toStringTag || !(typeof obj === 'object' && (toStringTag in obj || typeof obj[toStringTag] !== 'undefined'));
}
function isArray$3(obj) { return toStr(obj) === '[object Array]' && canTrustToString(obj); }
function isDate(obj) { return toStr(obj) === '[object Date]' && canTrustToString(obj); }
function isRegExp$1(obj) { return toStr(obj) === '[object RegExp]' && canTrustToString(obj); }
function isError(obj) { return toStr(obj) === '[object Error]' && canTrustToString(obj); }
function isString(obj) { return toStr(obj) === '[object String]' && canTrustToString(obj); }
function isNumber(obj) { return toStr(obj) === '[object Number]' && canTrustToString(obj); }
function isBoolean(obj) { return toStr(obj) === '[object Boolean]' && canTrustToString(obj); }

// Symbol and BigInt do have Symbol.toStringTag by spec, so that can't be used to eliminate false positives
function isSymbol(obj) {
    if (hasShammedSymbols) {
        return obj && typeof obj === 'object' && obj instanceof Symbol;
    }
    if (typeof obj === 'symbol') {
        return true;
    }
    if (!obj || typeof obj !== 'object' || !symToString) {
        return false;
    }
    try {
        symToString.call(obj);
        return true;
    } catch (e) {}
    return false;
}

function isBigInt(obj) {
    if (!obj || typeof obj !== 'object' || !bigIntValueOf) {
        return false;
    }
    try {
        bigIntValueOf.call(obj);
        return true;
    } catch (e) {}
    return false;
}

var hasOwn$1 = Object.prototype.hasOwnProperty || function (key) { return key in this; };
function has$3(obj, key) {
    return hasOwn$1.call(obj, key);
}

function toStr(obj) {
    return objectToString.call(obj);
}

function nameOf(f) {
    if (f.name) { return f.name; }
    var m = $match.call(functionToString.call(f), /^function\s*([\w$]+)/);
    if (m) { return m[1]; }
    return null;
}

function indexOf(xs, x) {
    if (xs.indexOf) { return xs.indexOf(x); }
    for (var i = 0, l = xs.length; i < l; i++) {
        if (xs[i] === x) { return i; }
    }
    return -1;
}

function isMap(x) {
    if (!mapSize || !x || typeof x !== 'object') {
        return false;
    }
    try {
        mapSize.call(x);
        try {
            setSize.call(x);
        } catch (s) {
            return true;
        }
        return x instanceof Map; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isWeakMap(x) {
    if (!weakMapHas || !x || typeof x !== 'object') {
        return false;
    }
    try {
        weakMapHas.call(x, weakMapHas);
        try {
            weakSetHas.call(x, weakSetHas);
        } catch (s) {
            return true;
        }
        return x instanceof WeakMap; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isWeakRef(x) {
    if (!weakRefDeref || !x || typeof x !== 'object') {
        return false;
    }
    try {
        weakRefDeref.call(x);
        return true;
    } catch (e) {}
    return false;
}

function isSet(x) {
    if (!setSize || !x || typeof x !== 'object') {
        return false;
    }
    try {
        setSize.call(x);
        try {
            mapSize.call(x);
        } catch (m) {
            return true;
        }
        return x instanceof Set; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isWeakSet(x) {
    if (!weakSetHas || !x || typeof x !== 'object') {
        return false;
    }
    try {
        weakSetHas.call(x, weakSetHas);
        try {
            weakMapHas.call(x, weakMapHas);
        } catch (s) {
            return true;
        }
        return x instanceof WeakSet; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isElement(x) {
    if (!x || typeof x !== 'object') { return false; }
    if (typeof HTMLElement !== 'undefined' && x instanceof HTMLElement) {
        return true;
    }
    return typeof x.nodeName === 'string' && typeof x.getAttribute === 'function';
}

function inspectString(str, opts) {
    if (str.length > opts.maxStringLength) {
        var remaining = str.length - opts.maxStringLength;
        var trailer = '... ' + remaining + ' more character' + (remaining > 1 ? 's' : '');
        return inspectString($slice.call(str, 0, opts.maxStringLength), opts) + trailer;
    }
    var quoteRE = quoteREs[opts.quoteStyle || 'single'];
    quoteRE.lastIndex = 0;
    // eslint-disable-next-line no-control-regex
    var s = $replace$1.call($replace$1.call(str, quoteRE, '\\$1'), /[\x00-\x1f]/g, lowbyte);
    return wrapQuotes(s, 'single', opts);
}

function lowbyte(c) {
    var n = c.charCodeAt(0);
    var x = {
        8: 'b',
        9: 't',
        10: 'n',
        12: 'f',
        13: 'r'
    }[n];
    if (x) { return '\\' + x; }
    return '\\x' + (n < 0x10 ? '0' : '') + $toUpperCase.call(n.toString(16));
}

function markBoxed(str) {
    return 'Object(' + str + ')';
}

function weakCollectionOf(type) {
    return type + ' { ? }';
}

function collectionOf(type, size, entries, indent) {
    var joinedEntries = indent ? indentedJoin(entries, indent) : $join.call(entries, ', ');
    return type + ' (' + size + ') {' + joinedEntries + '}';
}

function singleLineValues(xs) {
    for (var i = 0; i < xs.length; i++) {
        if (indexOf(xs[i], '\n') >= 0) {
            return false;
        }
    }
    return true;
}

function getIndent(opts, depth) {
    var baseIndent;
    if (opts.indent === '\t') {
        baseIndent = '\t';
    } else if (typeof opts.indent === 'number' && opts.indent > 0) {
        baseIndent = $join.call(Array(opts.indent + 1), ' ');
    } else {
        return null;
    }
    return {
        base: baseIndent,
        prev: $join.call(Array(depth + 1), baseIndent)
    };
}

function indentedJoin(xs, indent) {
    if (xs.length === 0) { return ''; }
    var lineJoiner = '\n' + indent.prev + indent.base;
    return lineJoiner + $join.call(xs, ',' + lineJoiner) + '\n' + indent.prev;
}

function arrObjKeys(obj, inspect) {
    var isArr = isArray$3(obj);
    var xs = [];
    if (isArr) {
        xs.length = obj.length;
        for (var i = 0; i < obj.length; i++) {
            xs[i] = has$3(obj, i) ? inspect(obj[i], obj) : '';
        }
    }
    var syms = typeof gOPS === 'function' ? gOPS(obj) : [];
    var symMap;
    if (hasShammedSymbols) {
        symMap = {};
        for (var k = 0; k < syms.length; k++) {
            symMap['$' + syms[k]] = syms[k];
        }
    }

    for (var key in obj) { // eslint-disable-line no-restricted-syntax
        if (!has$3(obj, key)) { continue; } // eslint-disable-line no-restricted-syntax, no-continue
        if (isArr && String(Number(key)) === key && key < obj.length) { continue; } // eslint-disable-line no-restricted-syntax, no-continue
        if (hasShammedSymbols && symMap['$' + key] instanceof Symbol) {
            // this is to prevent shammed Symbols, which are stored as strings, from being included in the string key section
            continue; // eslint-disable-line no-restricted-syntax, no-continue
        } else if ($test.call(/[^\w$]/, key)) {
            xs.push(inspect(key, obj) + ': ' + inspect(obj[key], obj));
        } else {
            xs.push(key + ': ' + inspect(obj[key], obj));
        }
    }
    if (typeof gOPS === 'function') {
        for (var j = 0; j < syms.length; j++) {
            if (isEnumerable.call(obj, syms[j])) {
                xs.push('[' + inspect(syms[j]) + ']: ' + inspect(obj[syms[j]], obj));
            }
        }
    }
    return xs;
}

var inspect$3 = objectInspect;

var $TypeError$5 = type;

/*
* This function traverses the list returning the node corresponding to the given key.
*
* That node is also moved to the head of the list, so that if it's accessed again we don't need to traverse the whole list.
* By doing so, all the recently used nodes can be accessed relatively quickly.
*/
/** @type {import('./list.d.ts').listGetNode} */
// eslint-disable-next-line consistent-return
var listGetNode = function (list, key, isDelete) {
	/** @type {typeof list | NonNullable<(typeof list)['next']>} */
	var prev = list;
	/** @type {(typeof list)['next']} */
	var curr;
	// eslint-disable-next-line eqeqeq
	for (; (curr = prev.next) != null; prev = curr) {
		if (curr.key === key) {
			prev.next = curr.next;
			if (!isDelete) {
				// eslint-disable-next-line no-extra-parens
				curr.next = /** @type {NonNullable<typeof list.next>} */ (list.next);
				list.next = curr; // eslint-disable-line no-param-reassign
			}
			return curr;
		}
	}
};

/** @type {import('./list.d.ts').listGet} */
var listGet = function (objects, key) {
	if (!objects) {
		return void 0;
	}
	var node = listGetNode(objects, key);
	return node && node.value;
};
/** @type {import('./list.d.ts').listSet} */
var listSet = function (objects, key, value) {
	var node = listGetNode(objects, key);
	if (node) {
		node.value = value;
	} else {
		// Prepend the new node to the beginning of the list
		objects.next = /** @type {import('./list.d.ts').ListNode<typeof value, typeof key>} */ ({ // eslint-disable-line no-param-reassign, no-extra-parens
			key: key,
			next: objects.next,
			value: value
		});
	}
};
/** @type {import('./list.d.ts').listHas} */
var listHas = function (objects, key) {
	if (!objects) {
		return false;
	}
	return !!listGetNode(objects, key);
};
/** @type {import('./list.d.ts').listDelete} */
// eslint-disable-next-line consistent-return
var listDelete = function (objects, key) {
	if (objects) {
		return listGetNode(objects, key, true);
	}
};

/** @type {import('.')} */
var sideChannelList = function getSideChannelList() {
	/** @typedef {ReturnType<typeof getSideChannelList>} Channel */
	/** @typedef {Parameters<Channel['get']>[0]} K */
	/** @typedef {Parameters<Channel['set']>[1]} V */

	/** @type {import('./list.d.ts').RootNode<V, K> | undefined} */ var $o;

	/** @type {Channel} */
	var channel = {
		assert: function (key) {
			if (!channel.has(key)) {
				throw new $TypeError$5('Side channel does not contain ' + inspect$3(key));
			}
		},
		'delete': function (key) {
			var root = $o && $o.next;
			var deletedNode = listDelete($o, key);
			if (deletedNode && root && root === deletedNode) {
				$o = void 0;
			}
			return !!deletedNode;
		},
		get: function (key) {
			return listGet($o, key);
		},
		has: function (key) {
			return listHas($o, key);
		},
		set: function (key, value) {
			if (!$o) {
				// Initialize the linked list as an empty node, so that we don't have to special-case handling of the first node: we can always refer to it as (previous node).next, instead of something like (list).head
				$o = {
					next: void 0
				};
			}
			// eslint-disable-next-line no-extra-parens
			listSet(/** @type {NonNullable<typeof $o>} */ ($o), key, value);
		}
	};
	// @ts-expect-error TODO: figure out why this is erroring
	return channel;
};

/** @type {import('.')} */
var esObjectAtoms = Object;

/** @type {import('.')} */
var esErrors = Error;

/** @type {import('./eval')} */
var _eval = EvalError;

/** @type {import('./range')} */
var range = RangeError;

/** @type {import('./ref')} */
var ref = ReferenceError;

/** @type {import('./syntax')} */
var syntax = SyntaxError;

/** @type {import('./uri')} */
var uri = URIError;

/** @type {import('./abs')} */
var abs$1 = Math.abs;

/** @type {import('./floor')} */
var floor$1 = Math.floor;

/** @type {import('./max')} */
var max$2 = Math.max;

/** @type {import('./min')} */
var min$2 = Math.min;

/** @type {import('./pow')} */
var pow$1 = Math.pow;

/** @type {import('./round')} */
var round$1 = Math.round;

/** @type {import('./isNaN')} */
var _isNaN = Number.isNaN || function isNaN(a) {
	return a !== a;
};

var $isNaN = _isNaN;

/** @type {import('./sign')} */
var sign$1 = function sign(number) {
	if ($isNaN(number) || number === 0) {
		return number;
	}
	return number < 0 ? -1 : 1;
};

/** @type {import('./gOPD')} */
var gOPD = Object.getOwnPropertyDescriptor;

/** @type {import('.')} */
var $gOPD$1 = gOPD;

if ($gOPD$1) {
	try {
		$gOPD$1([], 'length');
	} catch (e) {
		// IE 8 has a broken gOPD
		$gOPD$1 = null;
	}
}

var gopd = $gOPD$1;

/** @type {import('.')} */
var $defineProperty$1 = Object.defineProperty || false;
if ($defineProperty$1) {
	try {
		$defineProperty$1({}, 'a', { value: 1 });
	} catch (e) {
		// IE 8 has a broken defineProperty
		$defineProperty$1 = false;
	}
}

var esDefineProperty = $defineProperty$1;

var shams;
var hasRequiredShams;

function requireShams () {
	if (hasRequiredShams) return shams;
	hasRequiredShams = 1;

	/** @type {import('./shams')} */
	/* eslint complexity: [2, 18], max-statements: [2, 33] */
	shams = function hasSymbols() {
		if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
		if (typeof Symbol.iterator === 'symbol') { return true; }

		/** @type {{ [k in symbol]?: unknown }} */
		var obj = {};
		var sym = Symbol('test');
		var symObj = Object(sym);
		if (typeof sym === 'string') { return false; }

		if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
		if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

		// temp disabled per https://github.com/ljharb/object.assign/issues/17
		// if (sym instanceof Symbol) { return false; }
		// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
		// if (!(symObj instanceof Symbol)) { return false; }

		// if (typeof Symbol.prototype.toString !== 'function') { return false; }
		// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

		var symVal = 42;
		obj[sym] = symVal;
		for (var _ in obj) { return false; } // eslint-disable-line no-restricted-syntax, no-unreachable-loop
		if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

		if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

		var syms = Object.getOwnPropertySymbols(obj);
		if (syms.length !== 1 || syms[0] !== sym) { return false; }

		if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

		if (typeof Object.getOwnPropertyDescriptor === 'function') {
			// eslint-disable-next-line no-extra-parens
			var descriptor = /** @type {PropertyDescriptor} */ (Object.getOwnPropertyDescriptor(obj, sym));
			if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
		}

		return true;
	};
	return shams;
}

var hasSymbols$1;
var hasRequiredHasSymbols;

function requireHasSymbols () {
	if (hasRequiredHasSymbols) return hasSymbols$1;
	hasRequiredHasSymbols = 1;

	var origSymbol = typeof Symbol !== 'undefined' && Symbol;
	var hasSymbolSham = requireShams();

	/** @type {import('.')} */
	hasSymbols$1 = function hasNativeSymbols() {
		if (typeof origSymbol !== 'function') { return false; }
		if (typeof Symbol !== 'function') { return false; }
		if (typeof origSymbol('foo') !== 'symbol') { return false; }
		if (typeof Symbol('bar') !== 'symbol') { return false; }

		return hasSymbolSham();
	};
	return hasSymbols$1;
}

var Reflect_getPrototypeOf;
var hasRequiredReflect_getPrototypeOf;

function requireReflect_getPrototypeOf () {
	if (hasRequiredReflect_getPrototypeOf) return Reflect_getPrototypeOf;
	hasRequiredReflect_getPrototypeOf = 1;

	/** @type {import('./Reflect.getPrototypeOf')} */
	Reflect_getPrototypeOf = (typeof Reflect !== 'undefined' && Reflect.getPrototypeOf) || null;
	return Reflect_getPrototypeOf;
}

var Object_getPrototypeOf;
var hasRequiredObject_getPrototypeOf;

function requireObject_getPrototypeOf () {
	if (hasRequiredObject_getPrototypeOf) return Object_getPrototypeOf;
	hasRequiredObject_getPrototypeOf = 1;

	var $Object = esObjectAtoms;

	/** @type {import('./Object.getPrototypeOf')} */
	Object_getPrototypeOf = $Object.getPrototypeOf || null;
	return Object_getPrototypeOf;
}

var implementation;
var hasRequiredImplementation;

function requireImplementation () {
	if (hasRequiredImplementation) return implementation;
	hasRequiredImplementation = 1;

	/* eslint no-invalid-this: 1 */

	var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
	var toStr = Object.prototype.toString;
	var max = Math.max;
	var funcType = '[object Function]';

	var concatty = function concatty(a, b) {
	    var arr = [];

	    for (var i = 0; i < a.length; i += 1) {
	        arr[i] = a[i];
	    }
	    for (var j = 0; j < b.length; j += 1) {
	        arr[j + a.length] = b[j];
	    }

	    return arr;
	};

	var slicy = function slicy(arrLike, offset) {
	    var arr = [];
	    for (var i = offset, j = 0; i < arrLike.length; i += 1, j += 1) {
	        arr[j] = arrLike[i];
	    }
	    return arr;
	};

	var joiny = function (arr, joiner) {
	    var str = '';
	    for (var i = 0; i < arr.length; i += 1) {
	        str += arr[i];
	        if (i + 1 < arr.length) {
	            str += joiner;
	        }
	    }
	    return str;
	};

	implementation = function bind(that) {
	    var target = this;
	    if (typeof target !== 'function' || toStr.apply(target) !== funcType) {
	        throw new TypeError(ERROR_MESSAGE + target);
	    }
	    var args = slicy(arguments, 1);

	    var bound;
	    var binder = function () {
	        if (this instanceof bound) {
	            var result = target.apply(
	                this,
	                concatty(args, arguments)
	            );
	            if (Object(result) === result) {
	                return result;
	            }
	            return this;
	        }
	        return target.apply(
	            that,
	            concatty(args, arguments)
	        );

	    };

	    var boundLength = max(0, target.length - args.length);
	    var boundArgs = [];
	    for (var i = 0; i < boundLength; i++) {
	        boundArgs[i] = '$' + i;
	    }

	    bound = Function('binder', 'return function (' + joiny(boundArgs, ',') + '){ return binder.apply(this,arguments); }')(binder);

	    if (target.prototype) {
	        var Empty = function Empty() {};
	        Empty.prototype = target.prototype;
	        bound.prototype = new Empty();
	        Empty.prototype = null;
	    }

	    return bound;
	};
	return implementation;
}

var functionBind;
var hasRequiredFunctionBind;

function requireFunctionBind () {
	if (hasRequiredFunctionBind) return functionBind;
	hasRequiredFunctionBind = 1;

	var implementation = requireImplementation();

	functionBind = Function.prototype.bind || implementation;
	return functionBind;
}

var functionCall;
var hasRequiredFunctionCall;

function requireFunctionCall () {
	if (hasRequiredFunctionCall) return functionCall;
	hasRequiredFunctionCall = 1;

	/** @type {import('./functionCall')} */
	functionCall = Function.prototype.call;
	return functionCall;
}

var functionApply;
var hasRequiredFunctionApply;

function requireFunctionApply () {
	if (hasRequiredFunctionApply) return functionApply;
	hasRequiredFunctionApply = 1;

	/** @type {import('./functionApply')} */
	functionApply = Function.prototype.apply;
	return functionApply;
}

/** @type {import('./reflectApply')} */
var reflectApply = typeof Reflect !== 'undefined' && Reflect && Reflect.apply;

var bind$2 = requireFunctionBind();

var $apply$1 = requireFunctionApply();
var $call$2 = requireFunctionCall();
var $reflectApply = reflectApply;

/** @type {import('./actualApply')} */
var actualApply = $reflectApply || bind$2.call($call$2, $apply$1);

var bind$1 = requireFunctionBind();
var $TypeError$4 = type;

var $call$1 = requireFunctionCall();
var $actualApply = actualApply;

/** @type {(args: [Function, thisArg?: unknown, ...args: unknown[]]) => Function} TODO FIXME, find a way to use import('.') */
var callBindApplyHelpers = function callBindBasic(args) {
	if (args.length < 1 || typeof args[0] !== 'function') {
		throw new $TypeError$4('a function is required');
	}
	return $actualApply(bind$1, $call$1, args);
};

var get;
var hasRequiredGet;

function requireGet () {
	if (hasRequiredGet) return get;
	hasRequiredGet = 1;

	var callBind = callBindApplyHelpers;
	var gOPD = gopd;

	var hasProtoAccessor;
	try {
		// eslint-disable-next-line no-extra-parens, no-proto
		hasProtoAccessor = /** @type {{ __proto__?: typeof Array.prototype }} */ ([]).__proto__ === Array.prototype;
	} catch (e) {
		if (!e || typeof e !== 'object' || !('code' in e) || e.code !== 'ERR_PROTO_ACCESS') {
			throw e;
		}
	}

	// eslint-disable-next-line no-extra-parens
	var desc = !!hasProtoAccessor && gOPD && gOPD(Object.prototype, /** @type {keyof typeof Object.prototype} */ ('__proto__'));

	var $Object = Object;
	var $getPrototypeOf = $Object.getPrototypeOf;

	/** @type {import('./get')} */
	get = desc && typeof desc.get === 'function'
		? callBind([desc.get])
		: typeof $getPrototypeOf === 'function'
			? /** @type {import('./get')} */ function getDunder(value) {
				// eslint-disable-next-line eqeqeq
				return $getPrototypeOf(value == null ? value : $Object(value));
			}
			: false;
	return get;
}

var getProto$1;
var hasRequiredGetProto;

function requireGetProto () {
	if (hasRequiredGetProto) return getProto$1;
	hasRequiredGetProto = 1;

	var reflectGetProto = requireReflect_getPrototypeOf();
	var originalGetProto = requireObject_getPrototypeOf();

	var getDunderProto = /*@__PURE__*/ requireGet();

	/** @type {import('.')} */
	getProto$1 = reflectGetProto
		? function getProto(O) {
			// @ts-expect-error TS can't narrow inside a closure, for some reason
			return reflectGetProto(O);
		}
		: originalGetProto
			? function getProto(O) {
				if (!O || (typeof O !== 'object' && typeof O !== 'function')) {
					throw new TypeError('getProto: not an object');
				}
				// @ts-expect-error TS can't narrow inside a closure, for some reason
				return originalGetProto(O);
			}
			: getDunderProto
				? function getProto(O) {
					// @ts-expect-error TS can't narrow inside a closure, for some reason
					return getDunderProto(O);
				}
				: null;
	return getProto$1;
}

var hasown;
var hasRequiredHasown;

function requireHasown () {
	if (hasRequiredHasown) return hasown;
	hasRequiredHasown = 1;

	var call = Function.prototype.call;
	var $hasOwn = Object.prototype.hasOwnProperty;
	var bind = requireFunctionBind();

	/** @type {import('.')} */
	hasown = bind.call(call, $hasOwn);
	return hasown;
}

var undefined$1;

var $Object = esObjectAtoms;

var $Error = esErrors;
var $EvalError = _eval;
var $RangeError = range;
var $ReferenceError = ref;
var $SyntaxError = syntax;
var $TypeError$3 = type;
var $URIError = uri;

var abs = abs$1;
var floor = floor$1;
var max$1 = max$2;
var min$1 = min$2;
var pow = pow$1;
var round = round$1;
var sign = sign$1;

var $Function = Function;

// eslint-disable-next-line consistent-return
var getEvalledConstructor = function (expressionSyntax) {
	try {
		return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
	} catch (e) {}
};

var $gOPD = gopd;
var $defineProperty = esDefineProperty;

var throwTypeError = function () {
	throw new $TypeError$3();
};
var ThrowTypeError = $gOPD
	? (function () {
		try {
			// eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
			arguments.callee; // IE 8 does not throw here
			return throwTypeError;
		} catch (calleeThrows) {
			try {
				// IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
				return $gOPD(arguments, 'callee').get;
			} catch (gOPDthrows) {
				return throwTypeError;
			}
		}
	}())
	: throwTypeError;

var hasSymbols = requireHasSymbols()();

var getProto = requireGetProto();
var $ObjectGPO = requireObject_getPrototypeOf();
var $ReflectGPO = requireReflect_getPrototypeOf();

var $apply = requireFunctionApply();
var $call = requireFunctionCall();

var needsEval = {};

var TypedArray = typeof Uint8Array === 'undefined' || !getProto ? undefined$1 : getProto(Uint8Array);

var INTRINSICS = {
	__proto__: null,
	'%AggregateError%': typeof AggregateError === 'undefined' ? undefined$1 : AggregateError,
	'%Array%': Array,
	'%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined$1 : ArrayBuffer,
	'%ArrayIteratorPrototype%': hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined$1,
	'%AsyncFromSyncIteratorPrototype%': undefined$1,
	'%AsyncFunction%': needsEval,
	'%AsyncGenerator%': needsEval,
	'%AsyncGeneratorFunction%': needsEval,
	'%AsyncIteratorPrototype%': needsEval,
	'%Atomics%': typeof Atomics === 'undefined' ? undefined$1 : Atomics,
	'%BigInt%': typeof BigInt === 'undefined' ? undefined$1 : BigInt,
	'%BigInt64Array%': typeof BigInt64Array === 'undefined' ? undefined$1 : BigInt64Array,
	'%BigUint64Array%': typeof BigUint64Array === 'undefined' ? undefined$1 : BigUint64Array,
	'%Boolean%': Boolean,
	'%DataView%': typeof DataView === 'undefined' ? undefined$1 : DataView,
	'%Date%': Date,
	'%decodeURI%': decodeURI,
	'%decodeURIComponent%': decodeURIComponent,
	'%encodeURI%': encodeURI,
	'%encodeURIComponent%': encodeURIComponent,
	'%Error%': $Error,
	'%eval%': eval, // eslint-disable-line no-eval
	'%EvalError%': $EvalError,
	'%Float16Array%': typeof Float16Array === 'undefined' ? undefined$1 : Float16Array,
	'%Float32Array%': typeof Float32Array === 'undefined' ? undefined$1 : Float32Array,
	'%Float64Array%': typeof Float64Array === 'undefined' ? undefined$1 : Float64Array,
	'%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined$1 : FinalizationRegistry,
	'%Function%': $Function,
	'%GeneratorFunction%': needsEval,
	'%Int8Array%': typeof Int8Array === 'undefined' ? undefined$1 : Int8Array,
	'%Int16Array%': typeof Int16Array === 'undefined' ? undefined$1 : Int16Array,
	'%Int32Array%': typeof Int32Array === 'undefined' ? undefined$1 : Int32Array,
	'%isFinite%': isFinite,
	'%isNaN%': isNaN,
	'%IteratorPrototype%': hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined$1,
	'%JSON%': typeof JSON === 'object' ? JSON : undefined$1,
	'%Map%': typeof Map === 'undefined' ? undefined$1 : Map,
	'%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols || !getProto ? undefined$1 : getProto(new Map()[Symbol.iterator]()),
	'%Math%': Math,
	'%Number%': Number,
	'%Object%': $Object,
	'%Object.getOwnPropertyDescriptor%': $gOPD,
	'%parseFloat%': parseFloat,
	'%parseInt%': parseInt,
	'%Promise%': typeof Promise === 'undefined' ? undefined$1 : Promise,
	'%Proxy%': typeof Proxy === 'undefined' ? undefined$1 : Proxy,
	'%RangeError%': $RangeError,
	'%ReferenceError%': $ReferenceError,
	'%Reflect%': typeof Reflect === 'undefined' ? undefined$1 : Reflect,
	'%RegExp%': RegExp,
	'%Set%': typeof Set === 'undefined' ? undefined$1 : Set,
	'%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols || !getProto ? undefined$1 : getProto(new Set()[Symbol.iterator]()),
	'%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined$1 : SharedArrayBuffer,
	'%String%': String,
	'%StringIteratorPrototype%': hasSymbols && getProto ? getProto(''[Symbol.iterator]()) : undefined$1,
	'%Symbol%': hasSymbols ? Symbol : undefined$1,
	'%SyntaxError%': $SyntaxError,
	'%ThrowTypeError%': ThrowTypeError,
	'%TypedArray%': TypedArray,
	'%TypeError%': $TypeError$3,
	'%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined$1 : Uint8Array,
	'%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined$1 : Uint8ClampedArray,
	'%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined$1 : Uint16Array,
	'%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined$1 : Uint32Array,
	'%URIError%': $URIError,
	'%WeakMap%': typeof WeakMap === 'undefined' ? undefined$1 : WeakMap,
	'%WeakRef%': typeof WeakRef === 'undefined' ? undefined$1 : WeakRef,
	'%WeakSet%': typeof WeakSet === 'undefined' ? undefined$1 : WeakSet,

	'%Function.prototype.call%': $call,
	'%Function.prototype.apply%': $apply,
	'%Object.defineProperty%': $defineProperty,
	'%Object.getPrototypeOf%': $ObjectGPO,
	'%Math.abs%': abs,
	'%Math.floor%': floor,
	'%Math.max%': max$1,
	'%Math.min%': min$1,
	'%Math.pow%': pow,
	'%Math.round%': round,
	'%Math.sign%': sign,
	'%Reflect.getPrototypeOf%': $ReflectGPO
};

if (getProto) {
	try {
		null.error; // eslint-disable-line no-unused-expressions
	} catch (e) {
		// https://github.com/tc39/proposal-shadowrealm/pull/384#issuecomment-1364264229
		var errorProto = getProto(getProto(e));
		INTRINSICS['%Error.prototype%'] = errorProto;
	}
}

var doEval = function doEval(name) {
	var value;
	if (name === '%AsyncFunction%') {
		value = getEvalledConstructor('async function () {}');
	} else if (name === '%GeneratorFunction%') {
		value = getEvalledConstructor('function* () {}');
	} else if (name === '%AsyncGeneratorFunction%') {
		value = getEvalledConstructor('async function* () {}');
	} else if (name === '%AsyncGenerator%') {
		var fn = doEval('%AsyncGeneratorFunction%');
		if (fn) {
			value = fn.prototype;
		}
	} else if (name === '%AsyncIteratorPrototype%') {
		var gen = doEval('%AsyncGenerator%');
		if (gen && getProto) {
			value = getProto(gen.prototype);
		}
	}

	INTRINSICS[name] = value;

	return value;
};

var LEGACY_ALIASES = {
	__proto__: null,
	'%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
	'%ArrayPrototype%': ['Array', 'prototype'],
	'%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
	'%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
	'%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
	'%ArrayProto_values%': ['Array', 'prototype', 'values'],
	'%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
	'%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
	'%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
	'%BooleanPrototype%': ['Boolean', 'prototype'],
	'%DataViewPrototype%': ['DataView', 'prototype'],
	'%DatePrototype%': ['Date', 'prototype'],
	'%ErrorPrototype%': ['Error', 'prototype'],
	'%EvalErrorPrototype%': ['EvalError', 'prototype'],
	'%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
	'%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
	'%FunctionPrototype%': ['Function', 'prototype'],
	'%Generator%': ['GeneratorFunction', 'prototype'],
	'%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
	'%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
	'%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
	'%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
	'%JSONParse%': ['JSON', 'parse'],
	'%JSONStringify%': ['JSON', 'stringify'],
	'%MapPrototype%': ['Map', 'prototype'],
	'%NumberPrototype%': ['Number', 'prototype'],
	'%ObjectPrototype%': ['Object', 'prototype'],
	'%ObjProto_toString%': ['Object', 'prototype', 'toString'],
	'%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
	'%PromisePrototype%': ['Promise', 'prototype'],
	'%PromiseProto_then%': ['Promise', 'prototype', 'then'],
	'%Promise_all%': ['Promise', 'all'],
	'%Promise_reject%': ['Promise', 'reject'],
	'%Promise_resolve%': ['Promise', 'resolve'],
	'%RangeErrorPrototype%': ['RangeError', 'prototype'],
	'%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
	'%RegExpPrototype%': ['RegExp', 'prototype'],
	'%SetPrototype%': ['Set', 'prototype'],
	'%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
	'%StringPrototype%': ['String', 'prototype'],
	'%SymbolPrototype%': ['Symbol', 'prototype'],
	'%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
	'%TypedArrayPrototype%': ['TypedArray', 'prototype'],
	'%TypeErrorPrototype%': ['TypeError', 'prototype'],
	'%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
	'%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
	'%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
	'%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
	'%URIErrorPrototype%': ['URIError', 'prototype'],
	'%WeakMapPrototype%': ['WeakMap', 'prototype'],
	'%WeakSetPrototype%': ['WeakSet', 'prototype']
};

var bind = requireFunctionBind();
var hasOwn = /*@__PURE__*/ requireHasown();
var $concat = bind.call($call, Array.prototype.concat);
var $spliceApply = bind.call($apply, Array.prototype.splice);
var $replace = bind.call($call, String.prototype.replace);
var $strSlice = bind.call($call, String.prototype.slice);
var $exec = bind.call($call, RegExp.prototype.exec);

/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */
var stringToPath = function stringToPath(string) {
	var first = $strSlice(string, 0, 1);
	var last = $strSlice(string, -1);
	if (first === '%' && last !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
	} else if (last === '%' && first !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');
	}
	var result = [];
	$replace(string, rePropName, function (match, number, quote, subString) {
		result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
	});
	return result;
};
/* end adaptation */

var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
	var intrinsicName = name;
	var alias;
	if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
		alias = LEGACY_ALIASES[intrinsicName];
		intrinsicName = '%' + alias[0] + '%';
	}

	if (hasOwn(INTRINSICS, intrinsicName)) {
		var value = INTRINSICS[intrinsicName];
		if (value === needsEval) {
			value = doEval(intrinsicName);
		}
		if (typeof value === 'undefined' && !allowMissing) {
			throw new $TypeError$3('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
		}

		return {
			alias: alias,
			name: intrinsicName,
			value: value
		};
	}

	throw new $SyntaxError('intrinsic ' + name + ' does not exist!');
};

var getIntrinsic = function GetIntrinsic(name, allowMissing) {
	if (typeof name !== 'string' || name.length === 0) {
		throw new $TypeError$3('intrinsic name must be a non-empty string');
	}
	if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
		throw new $TypeError$3('"allowMissing" argument must be a boolean');
	}

	if ($exec(/^%?[^%]*%?$/, name) === null) {
		throw new $SyntaxError('`%` may not be present anywhere but at the beginning and end of the intrinsic name');
	}
	var parts = stringToPath(name);
	var intrinsicBaseName = parts.length > 0 ? parts[0] : '';

	var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
	var intrinsicRealName = intrinsic.name;
	var value = intrinsic.value;
	var skipFurtherCaching = false;

	var alias = intrinsic.alias;
	if (alias) {
		intrinsicBaseName = alias[0];
		$spliceApply(parts, $concat([0, 1], alias));
	}

	for (var i = 1, isOwn = true; i < parts.length; i += 1) {
		var part = parts[i];
		var first = $strSlice(part, 0, 1);
		var last = $strSlice(part, -1);
		if (
			(
				(first === '"' || first === "'" || first === '`')
				|| (last === '"' || last === "'" || last === '`')
			)
			&& first !== last
		) {
			throw new $SyntaxError('property names with quotes must have matching quotes');
		}
		if (part === 'constructor' || !isOwn) {
			skipFurtherCaching = true;
		}

		intrinsicBaseName += '.' + part;
		intrinsicRealName = '%' + intrinsicBaseName + '%';

		if (hasOwn(INTRINSICS, intrinsicRealName)) {
			value = INTRINSICS[intrinsicRealName];
		} else if (value != null) {
			if (!(part in value)) {
				if (!allowMissing) {
					throw new $TypeError$3('base intrinsic for ' + name + ' exists, but the property is not available.');
				}
				return void 0;
			}
			if ($gOPD && (i + 1) >= parts.length) {
				var desc = $gOPD(value, part);
				isOwn = !!desc;

				// By convention, when a data property is converted to an accessor
				// property to emulate a data property that does not suffer from
				// the override mistake, that accessor's getter is marked with
				// an `originalValue` property. Here, when we detect this, we
				// uphold the illusion by pretending to see that original data
				// property, i.e., returning the value rather than the getter
				// itself.
				if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
					value = desc.get;
				} else {
					value = value[part];
				}
			} else {
				isOwn = hasOwn(value, part);
				value = value[part];
			}

			if (isOwn && !skipFurtherCaching) {
				INTRINSICS[intrinsicRealName] = value;
			}
		}
	}
	return value;
};

var GetIntrinsic$2 = getIntrinsic;

var callBindBasic = callBindApplyHelpers;

/** @type {(thisArg: string, searchString: string, position?: number) => number} */
var $indexOf = callBindBasic([GetIntrinsic$2('%String.prototype.indexOf%')]);

/** @type {import('.')} */
var callBound$2 = function callBoundIntrinsic(name, allowMissing) {
	/* eslint no-extra-parens: 0 */

	var intrinsic = /** @type {(this: unknown, ...args: unknown[]) => unknown} */ (GetIntrinsic$2(name, !!allowMissing));
	if (typeof intrinsic === 'function' && $indexOf(name, '.prototype.') > -1) {
		return callBindBasic(/** @type {const} */ ([intrinsic]));
	}
	return intrinsic;
};

var GetIntrinsic$1 = getIntrinsic;
var callBound$1 = callBound$2;
var inspect$2 = objectInspect;

var $TypeError$2 = type;
var $Map = GetIntrinsic$1('%Map%', true);

/** @type {<K, V>(thisArg: Map<K, V>, key: K) => V} */
var $mapGet = callBound$1('Map.prototype.get', true);
/** @type {<K, V>(thisArg: Map<K, V>, key: K, value: V) => void} */
var $mapSet = callBound$1('Map.prototype.set', true);
/** @type {<K, V>(thisArg: Map<K, V>, key: K) => boolean} */
var $mapHas = callBound$1('Map.prototype.has', true);
/** @type {<K, V>(thisArg: Map<K, V>, key: K) => boolean} */
var $mapDelete = callBound$1('Map.prototype.delete', true);
/** @type {<K, V>(thisArg: Map<K, V>) => number} */
var $mapSize = callBound$1('Map.prototype.size', true);

/** @type {import('.')} */
var sideChannelMap = !!$Map && /** @type {Exclude<import('.'), false>} */ function getSideChannelMap() {
	/** @typedef {ReturnType<typeof getSideChannelMap>} Channel */
	/** @typedef {Parameters<Channel['get']>[0]} K */
	/** @typedef {Parameters<Channel['set']>[1]} V */

	/** @type {Map<K, V> | undefined} */ var $m;

	/** @type {Channel} */
	var channel = {
		assert: function (key) {
			if (!channel.has(key)) {
				throw new $TypeError$2('Side channel does not contain ' + inspect$2(key));
			}
		},
		'delete': function (key) {
			if ($m) {
				var result = $mapDelete($m, key);
				if ($mapSize($m) === 0) {
					$m = void 0;
				}
				return result;
			}
			return false;
		},
		get: function (key) { // eslint-disable-line consistent-return
			if ($m) {
				return $mapGet($m, key);
			}
		},
		has: function (key) {
			if ($m) {
				return $mapHas($m, key);
			}
			return false;
		},
		set: function (key, value) {
			if (!$m) {
				// @ts-expect-error TS can't handle narrowing a variable inside a closure
				$m = new $Map();
			}
			$mapSet($m, key, value);
		}
	};

	// @ts-expect-error TODO: figure out why TS is erroring here
	return channel;
};

var GetIntrinsic = getIntrinsic;
var callBound = callBound$2;
var inspect$1 = objectInspect;
var getSideChannelMap$1 = sideChannelMap;

var $TypeError$1 = type;
var $WeakMap = GetIntrinsic('%WeakMap%', true);

/** @type {<K extends object, V>(thisArg: WeakMap<K, V>, key: K) => V} */
var $weakMapGet = callBound('WeakMap.prototype.get', true);
/** @type {<K extends object, V>(thisArg: WeakMap<K, V>, key: K, value: V) => void} */
var $weakMapSet = callBound('WeakMap.prototype.set', true);
/** @type {<K extends object, V>(thisArg: WeakMap<K, V>, key: K) => boolean} */
var $weakMapHas = callBound('WeakMap.prototype.has', true);
/** @type {<K extends object, V>(thisArg: WeakMap<K, V>, key: K) => boolean} */
var $weakMapDelete = callBound('WeakMap.prototype.delete', true);

/** @type {import('.')} */
var sideChannelWeakmap = $WeakMap
	? /** @type {Exclude<import('.'), false>} */ function getSideChannelWeakMap() {
		/** @typedef {ReturnType<typeof getSideChannelWeakMap>} Channel */
		/** @typedef {Parameters<Channel['get']>[0]} K */
		/** @typedef {Parameters<Channel['set']>[1]} V */

		/** @type {WeakMap<K & object, V> | undefined} */ var $wm;
		/** @type {Channel | undefined} */ var $m;

		/** @type {Channel} */
		var channel = {
			assert: function (key) {
				if (!channel.has(key)) {
					throw new $TypeError$1('Side channel does not contain ' + inspect$1(key));
				}
			},
			'delete': function (key) {
				if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
					if ($wm) {
						return $weakMapDelete($wm, key);
					}
				} else if (getSideChannelMap$1) {
					if ($m) {
						return $m['delete'](key);
					}
				}
				return false;
			},
			get: function (key) {
				if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
					if ($wm) {
						return $weakMapGet($wm, key);
					}
				}
				return $m && $m.get(key);
			},
			has: function (key) {
				if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
					if ($wm) {
						return $weakMapHas($wm, key);
					}
				}
				return !!$m && $m.has(key);
			},
			set: function (key, value) {
				if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
					if (!$wm) {
						$wm = new $WeakMap();
					}
					$weakMapSet($wm, key, value);
				} else if (getSideChannelMap$1) {
					if (!$m) {
						$m = getSideChannelMap$1();
					}
					// eslint-disable-next-line no-extra-parens
					/** @type {NonNullable<typeof $m>} */ ($m).set(key, value);
				}
			}
		};

		// @ts-expect-error TODO: figure out why this is erroring
		return channel;
	}
	: getSideChannelMap$1;

var $TypeError = type;
var inspect = objectInspect;
var getSideChannelList = sideChannelList;
var getSideChannelMap = sideChannelMap;
var getSideChannelWeakMap = sideChannelWeakmap;

var makeChannel = getSideChannelWeakMap || getSideChannelMap || getSideChannelList;

/** @type {import('.')} */
var sideChannel = function getSideChannel() {
	/** @typedef {ReturnType<typeof getSideChannel>} Channel */

	/** @type {Channel | undefined} */ var $channelData;

	/** @type {Channel} */
	var channel = {
		assert: function (key) {
			if (!channel.has(key)) {
				throw new $TypeError('Side channel does not contain ' + inspect(key));
			}
		},
		'delete': function (key) {
			return !!$channelData && $channelData['delete'](key);
		},
		get: function (key) {
			return $channelData && $channelData.get(key);
		},
		has: function (key) {
			return !!$channelData && $channelData.has(key);
		},
		set: function (key, value) {
			if (!$channelData) {
				$channelData = makeChannel();
			}

			$channelData.set(key, value);
		}
	};
	// @ts-expect-error TODO: figure out why this is erroring
	return channel;
};

var replace = String.prototype.replace;
var percentTwenties = /%20/g;

var Format = {
    RFC1738: 'RFC1738',
    RFC3986: 'RFC3986'
};

var formats$3 = {
    'default': Format.RFC3986,
    formatters: {
        RFC1738: function (value) {
            return replace.call(value, percentTwenties, '+');
        },
        RFC3986: function (value) {
            return String(value);
        }
    },
    RFC1738: Format.RFC1738,
    RFC3986: Format.RFC3986
};

var formats$2 = formats$3;

var has$2 = Object.prototype.hasOwnProperty;
var isArray$2 = Array.isArray;

var hexTable = (function () {
    var array = [];
    for (var i = 0; i < 256; ++i) {
        array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
    }

    return array;
}());

var compactQueue = function compactQueue(queue) {
    while (queue.length > 1) {
        var item = queue.pop();
        var obj = item.obj[item.prop];

        if (isArray$2(obj)) {
            var compacted = [];

            for (var j = 0; j < obj.length; ++j) {
                if (typeof obj[j] !== 'undefined') {
                    compacted.push(obj[j]);
                }
            }

            item.obj[item.prop] = compacted;
        }
    }
};

var arrayToObject = function arrayToObject(source, options) {
    var obj = options && options.plainObjects ? { __proto__: null } : {};
    for (var i = 0; i < source.length; ++i) {
        if (typeof source[i] !== 'undefined') {
            obj[i] = source[i];
        }
    }

    return obj;
};

var merge = function merge(target, source, options) {
    /* eslint no-param-reassign: 0 */
    if (!source) {
        return target;
    }

    if (typeof source !== 'object' && typeof source !== 'function') {
        if (isArray$2(target)) {
            target.push(source);
        } else if (target && typeof target === 'object') {
            if (
                (options && (options.plainObjects || options.allowPrototypes))
                || !has$2.call(Object.prototype, source)
            ) {
                target[source] = true;
            }
        } else {
            return [target, source];
        }

        return target;
    }

    if (!target || typeof target !== 'object') {
        return [target].concat(source);
    }

    var mergeTarget = target;
    if (isArray$2(target) && !isArray$2(source)) {
        mergeTarget = arrayToObject(target, options);
    }

    if (isArray$2(target) && isArray$2(source)) {
        source.forEach(function (item, i) {
            if (has$2.call(target, i)) {
                var targetItem = target[i];
                if (targetItem && typeof targetItem === 'object' && item && typeof item === 'object') {
                    target[i] = merge(targetItem, item, options);
                } else {
                    target.push(item);
                }
            } else {
                target[i] = item;
            }
        });
        return target;
    }

    return Object.keys(source).reduce(function (acc, key) {
        var value = source[key];

        if (has$2.call(acc, key)) {
            acc[key] = merge(acc[key], value, options);
        } else {
            acc[key] = value;
        }
        return acc;
    }, mergeTarget);
};

var assign = function assignSingleSource(target, source) {
    return Object.keys(source).reduce(function (acc, key) {
        acc[key] = source[key];
        return acc;
    }, target);
};

var decode = function (str, defaultDecoder, charset) {
    var strWithoutPlus = str.replace(/\+/g, ' ');
    if (charset === 'iso-8859-1') {
        // unescape never throws, no try...catch needed:
        return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
    }
    // utf-8
    try {
        return decodeURIComponent(strWithoutPlus);
    } catch (e) {
        return strWithoutPlus;
    }
};

var limit = 1024;

/* eslint operator-linebreak: [2, "before"] */

var encode = function encode(str, defaultEncoder, charset, kind, format) {
    // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
    // It has been adapted here for stricter adherence to RFC 3986
    if (str.length === 0) {
        return str;
    }

    var string = str;
    if (typeof str === 'symbol') {
        string = Symbol.prototype.toString.call(str);
    } else if (typeof str !== 'string') {
        string = String(str);
    }

    if (charset === 'iso-8859-1') {
        return escape(string).replace(/%u[0-9a-f]{4}/gi, function ($0) {
            return '%26%23' + parseInt($0.slice(2), 16) + '%3B';
        });
    }

    var out = '';
    for (var j = 0; j < string.length; j += limit) {
        var segment = string.length >= limit ? string.slice(j, j + limit) : string;
        var arr = [];

        for (var i = 0; i < segment.length; ++i) {
            var c = segment.charCodeAt(i);
            if (
                c === 0x2D // -
                || c === 0x2E // .
                || c === 0x5F // _
                || c === 0x7E // ~
                || (c >= 0x30 && c <= 0x39) // 0-9
                || (c >= 0x41 && c <= 0x5A) // a-z
                || (c >= 0x61 && c <= 0x7A) // A-Z
                || (format === formats$2.RFC1738 && (c === 0x28 || c === 0x29)) // ( )
            ) {
                arr[arr.length] = segment.charAt(i);
                continue;
            }

            if (c < 0x80) {
                arr[arr.length] = hexTable[c];
                continue;
            }

            if (c < 0x800) {
                arr[arr.length] = hexTable[0xC0 | (c >> 6)]
                    + hexTable[0x80 | (c & 0x3F)];
                continue;
            }

            if (c < 0xD800 || c >= 0xE000) {
                arr[arr.length] = hexTable[0xE0 | (c >> 12)]
                    + hexTable[0x80 | ((c >> 6) & 0x3F)]
                    + hexTable[0x80 | (c & 0x3F)];
                continue;
            }

            i += 1;
            c = 0x10000 + (((c & 0x3FF) << 10) | (segment.charCodeAt(i) & 0x3FF));

            arr[arr.length] = hexTable[0xF0 | (c >> 18)]
                + hexTable[0x80 | ((c >> 12) & 0x3F)]
                + hexTable[0x80 | ((c >> 6) & 0x3F)]
                + hexTable[0x80 | (c & 0x3F)];
        }

        out += arr.join('');
    }

    return out;
};

var compact = function compact(value) {
    var queue = [{ obj: { o: value }, prop: 'o' }];
    var refs = [];

    for (var i = 0; i < queue.length; ++i) {
        var item = queue[i];
        var obj = item.obj[item.prop];

        var keys = Object.keys(obj);
        for (var j = 0; j < keys.length; ++j) {
            var key = keys[j];
            var val = obj[key];
            if (typeof val === 'object' && val !== null && refs.indexOf(val) === -1) {
                queue.push({ obj: obj, prop: key });
                refs.push(val);
            }
        }
    }

    compactQueue(queue);

    return value;
};

var isRegExp = function isRegExp(obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
};

var isBuffer = function isBuffer(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }

    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
};

var combine = function combine(a, b) {
    return [].concat(a, b);
};

var maybeMap = function maybeMap(val, fn) {
    if (isArray$2(val)) {
        var mapped = [];
        for (var i = 0; i < val.length; i += 1) {
            mapped.push(fn(val[i]));
        }
        return mapped;
    }
    return fn(val);
};

var utils$2 = {
    arrayToObject: arrayToObject,
    assign: assign,
    combine: combine,
    compact: compact,
    decode: decode,
    encode: encode,
    isBuffer: isBuffer,
    isRegExp: isRegExp,
    maybeMap: maybeMap,
    merge: merge
};

var getSideChannel = sideChannel;
var utils$1 = utils$2;
var formats$1 = formats$3;
var has$1 = Object.prototype.hasOwnProperty;

var arrayPrefixGenerators = {
    brackets: function brackets(prefix) {
        return prefix + '[]';
    },
    comma: 'comma',
    indices: function indices(prefix, key) {
        return prefix + '[' + key + ']';
    },
    repeat: function repeat(prefix) {
        return prefix;
    }
};

var isArray$1 = Array.isArray;
var push = Array.prototype.push;
var pushToArray = function (arr, valueOrArray) {
    push.apply(arr, isArray$1(valueOrArray) ? valueOrArray : [valueOrArray]);
};

var toISO = Date.prototype.toISOString;

var defaultFormat = formats$1['default'];
var defaults$1 = {
    addQueryPrefix: false,
    allowDots: false,
    allowEmptyArrays: false,
    arrayFormat: 'indices',
    charset: 'utf-8',
    charsetSentinel: false,
    commaRoundTrip: false,
    delimiter: '&',
    encode: true,
    encodeDotInKeys: false,
    encoder: utils$1.encode,
    encodeValuesOnly: false,
    filter: void 0,
    format: defaultFormat,
    formatter: formats$1.formatters[defaultFormat],
    // deprecated
    indices: false,
    serializeDate: function serializeDate(date) {
        return toISO.call(date);
    },
    skipNulls: false,
    strictNullHandling: false
};

var isNonNullishPrimitive = function isNonNullishPrimitive(v) {
    return typeof v === 'string'
        || typeof v === 'number'
        || typeof v === 'boolean'
        || typeof v === 'symbol'
        || typeof v === 'bigint';
};

var sentinel = {};

var stringify$1 = function stringify(
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
    sideChannel
) {
    var obj = object;

    var tmpSc = sideChannel;
    var step = 0;
    var findFlag = false;
    while ((tmpSc = tmpSc.get(sentinel)) !== void 0 && !findFlag) {
        // Where object last appeared in the ref tree
        var pos = tmpSc.get(object);
        step += 1;
        if (typeof pos !== 'undefined') {
            if (pos === step) {
                throw new RangeError('Cyclic object value');
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
    } else if (generateArrayPrefix === 'comma' && isArray$1(obj)) {
        obj = utils$1.maybeMap(obj, function (value) {
            if (value instanceof Date) {
                return serializeDate(value);
            }
            return value;
        });
    }

    if (obj === null) {
        if (strictNullHandling) {
            return encoder && !encodeValuesOnly ? encoder(prefix, defaults$1.encoder, charset, 'key', format) : prefix;
        }

        obj = '';
    }

    if (isNonNullishPrimitive(obj) || utils$1.isBuffer(obj)) {
        if (encoder) {
            var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults$1.encoder, charset, 'key', format);
            return [formatter(keyValue) + '=' + formatter(encoder(obj, defaults$1.encoder, charset, 'value', format))];
        }
        return [formatter(prefix) + '=' + formatter(String(obj))];
    }

    var values = [];

    if (typeof obj === 'undefined') {
        return values;
    }

    var objKeys;
    if (generateArrayPrefix === 'comma' && isArray$1(obj)) {
        // we need to join elements in
        if (encodeValuesOnly && encoder) {
            obj = utils$1.maybeMap(obj, encoder);
        }
        objKeys = [{ value: obj.length > 0 ? obj.join(',') || null : void 0 }];
    } else if (isArray$1(filter)) {
        objKeys = filter;
    } else {
        var keys = Object.keys(obj);
        objKeys = sort ? keys.sort(sort) : keys;
    }

    var encodedPrefix = encodeDotInKeys ? String(prefix).replace(/\./g, '%2E') : String(prefix);

    var adjustedPrefix = commaRoundTrip && isArray$1(obj) && obj.length === 1 ? encodedPrefix + '[]' : encodedPrefix;

    if (allowEmptyArrays && isArray$1(obj) && obj.length === 0) {
        return adjustedPrefix + '[]';
    }

    for (var j = 0; j < objKeys.length; ++j) {
        var key = objKeys[j];
        var value = typeof key === 'object' && key && typeof key.value !== 'undefined'
            ? key.value
            : obj[key];

        if (skipNulls && value === null) {
            continue;
        }

        var encodedKey = allowDots && encodeDotInKeys ? String(key).replace(/\./g, '%2E') : String(key);
        var keyPrefix = isArray$1(obj)
            ? typeof generateArrayPrefix === 'function' ? generateArrayPrefix(adjustedPrefix, encodedKey) : adjustedPrefix
            : adjustedPrefix + (allowDots ? '.' + encodedKey : '[' + encodedKey + ']');

        sideChannel.set(object, step);
        var valueSideChannel = getSideChannel();
        valueSideChannel.set(sentinel, sideChannel);
        pushToArray(values, stringify(
            value,
            keyPrefix,
            generateArrayPrefix,
            commaRoundTrip,
            allowEmptyArrays,
            strictNullHandling,
            skipNulls,
            encodeDotInKeys,
            generateArrayPrefix === 'comma' && encodeValuesOnly && isArray$1(obj) ? null : encoder,
            filter,
            sort,
            allowDots,
            serializeDate,
            format,
            formatter,
            encodeValuesOnly,
            charset,
            valueSideChannel
        ));
    }

    return values;
};

var normalizeStringifyOptions = function normalizeStringifyOptions(opts) {
    if (!opts) {
        return defaults$1;
    }

    if (typeof opts.allowEmptyArrays !== 'undefined' && typeof opts.allowEmptyArrays !== 'boolean') {
        throw new TypeError('`allowEmptyArrays` option can only be `true` or `false`, when provided');
    }

    if (typeof opts.encodeDotInKeys !== 'undefined' && typeof opts.encodeDotInKeys !== 'boolean') {
        throw new TypeError('`encodeDotInKeys` option can only be `true` or `false`, when provided');
    }

    if (opts.encoder !== null && typeof opts.encoder !== 'undefined' && typeof opts.encoder !== 'function') {
        throw new TypeError('Encoder has to be a function.');
    }

    var charset = opts.charset || defaults$1.charset;
    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
    }

    var format = formats$1['default'];
    if (typeof opts.format !== 'undefined') {
        if (!has$1.call(formats$1.formatters, opts.format)) {
            throw new TypeError('Unknown format option provided.');
        }
        format = opts.format;
    }
    var formatter = formats$1.formatters[format];

    var filter = defaults$1.filter;
    if (typeof opts.filter === 'function' || isArray$1(opts.filter)) {
        filter = opts.filter;
    }

    var arrayFormat;
    if (opts.arrayFormat in arrayPrefixGenerators) {
        arrayFormat = opts.arrayFormat;
    } else if ('indices' in opts) {
        arrayFormat = opts.indices ? 'indices' : 'repeat';
    } else {
        arrayFormat = defaults$1.arrayFormat;
    }

    if ('commaRoundTrip' in opts && typeof opts.commaRoundTrip !== 'boolean') {
        throw new TypeError('`commaRoundTrip` must be a boolean, or absent');
    }

    var allowDots = typeof opts.allowDots === 'undefined' ? opts.encodeDotInKeys === true ? true : defaults$1.allowDots : !!opts.allowDots;

    return {
        addQueryPrefix: typeof opts.addQueryPrefix === 'boolean' ? opts.addQueryPrefix : defaults$1.addQueryPrefix,
        allowDots: allowDots,
        allowEmptyArrays: typeof opts.allowEmptyArrays === 'boolean' ? !!opts.allowEmptyArrays : defaults$1.allowEmptyArrays,
        arrayFormat: arrayFormat,
        charset: charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults$1.charsetSentinel,
        commaRoundTrip: !!opts.commaRoundTrip,
        delimiter: typeof opts.delimiter === 'undefined' ? defaults$1.delimiter : opts.delimiter,
        encode: typeof opts.encode === 'boolean' ? opts.encode : defaults$1.encode,
        encodeDotInKeys: typeof opts.encodeDotInKeys === 'boolean' ? opts.encodeDotInKeys : defaults$1.encodeDotInKeys,
        encoder: typeof opts.encoder === 'function' ? opts.encoder : defaults$1.encoder,
        encodeValuesOnly: typeof opts.encodeValuesOnly === 'boolean' ? opts.encodeValuesOnly : defaults$1.encodeValuesOnly,
        filter: filter,
        format: format,
        formatter: formatter,
        serializeDate: typeof opts.serializeDate === 'function' ? opts.serializeDate : defaults$1.serializeDate,
        skipNulls: typeof opts.skipNulls === 'boolean' ? opts.skipNulls : defaults$1.skipNulls,
        sort: typeof opts.sort === 'function' ? opts.sort : null,
        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults$1.strictNullHandling
    };
};

var stringify_1 = function (object, opts) {
    var obj = object;
    var options = normalizeStringifyOptions(opts);

    var objKeys;
    var filter;

    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    } else if (isArray$1(options.filter)) {
        filter = options.filter;
        objKeys = filter;
    }

    var keys = [];

    if (typeof obj !== 'object' || obj === null) {
        return '';
    }

    var generateArrayPrefix = arrayPrefixGenerators[options.arrayFormat];
    var commaRoundTrip = generateArrayPrefix === 'comma' && options.commaRoundTrip;

    if (!objKeys) {
        objKeys = Object.keys(obj);
    }

    if (options.sort) {
        objKeys.sort(options.sort);
    }

    var sideChannel = getSideChannel();
    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];
        var value = obj[key];

        if (options.skipNulls && value === null) {
            continue;
        }
        pushToArray(keys, stringify$1(
            value,
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
            sideChannel
        ));
    }

    var joined = keys.join(options.delimiter);
    var prefix = options.addQueryPrefix === true ? '?' : '';

    if (options.charsetSentinel) {
        if (options.charset === 'iso-8859-1') {
            // encodeURIComponent('&#10003;'), the "numeric entity" representation of a checkmark
            prefix += 'utf8=%26%2310003%3B&';
        } else {
            // encodeURIComponent('✓')
            prefix += 'utf8=%E2%9C%93&';
        }
    }

    return joined.length > 0 ? prefix + joined : '';
};

var utils = utils$2;

var has = Object.prototype.hasOwnProperty;
var isArray = Array.isArray;

var defaults = {
    allowDots: false,
    allowEmptyArrays: false,
    allowPrototypes: false,
    allowSparse: false,
    arrayLimit: 20,
    charset: 'utf-8',
    charsetSentinel: false,
    comma: false,
    decodeDotInKeys: false,
    decoder: utils.decode,
    delimiter: '&',
    depth: 5,
    duplicates: 'combine',
    ignoreQueryPrefix: false,
    interpretNumericEntities: false,
    parameterLimit: 1000,
    parseArrays: true,
    plainObjects: false,
    strictDepth: false,
    strictNullHandling: false,
    throwOnLimitExceeded: false
};

var interpretNumericEntities = function (str) {
    return str.replace(/&#(\d+);/g, function ($0, numberStr) {
        return String.fromCharCode(parseInt(numberStr, 10));
    });
};

var parseArrayValue = function (val, options, currentArrayLength) {
    if (val && typeof val === 'string' && options.comma && val.indexOf(',') > -1) {
        return val.split(',');
    }

    if (options.throwOnLimitExceeded && currentArrayLength >= options.arrayLimit) {
        throw new RangeError('Array limit exceeded. Only ' + options.arrayLimit + ' element' + (options.arrayLimit === 1 ? '' : 's') + ' allowed in an array.');
    }

    return val;
};

// This is what browsers will submit when the ✓ character occurs in an
// application/x-www-form-urlencoded body and the encoding of the page containing
// the form is iso-8859-1, or when the submitted form has an accept-charset
// attribute of iso-8859-1. Presumably also with other charsets that do not contain
// the ✓ character, such as us-ascii.
var isoSentinel = 'utf8=%26%2310003%3B'; // encodeURIComponent('&#10003;')

// These are the percent-encoded utf-8 octets representing a checkmark, indicating that the request actually is utf-8 encoded.
var charsetSentinel = 'utf8=%E2%9C%93'; // encodeURIComponent('✓')

var parseValues = function parseQueryStringValues(str, options) {
    var obj = { __proto__: null };

    var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, '') : str;
    cleanStr = cleanStr.replace(/%5B/gi, '[').replace(/%5D/gi, ']');

    var limit = options.parameterLimit === Infinity ? undefined : options.parameterLimit;
    var parts = cleanStr.split(
        options.delimiter,
        options.throwOnLimitExceeded ? limit + 1 : limit
    );

    if (options.throwOnLimitExceeded && parts.length > limit) {
        throw new RangeError('Parameter limit exceeded. Only ' + limit + ' parameter' + (limit === 1 ? '' : 's') + ' allowed.');
    }

    var skipIndex = -1; // Keep track of where the utf8 sentinel was found
    var i;

    var charset = options.charset;
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
            continue;
        }
        var part = parts[i];

        var bracketEqualsPos = part.indexOf(']=');
        var pos = bracketEqualsPos === -1 ? part.indexOf('=') : bracketEqualsPos + 1;

        var key;
        var val;
        if (pos === -1) {
            key = options.decoder(part, defaults.decoder, charset, 'key');
            val = options.strictNullHandling ? null : '';
        } else {
            key = options.decoder(part.slice(0, pos), defaults.decoder, charset, 'key');

            val = utils.maybeMap(
                parseArrayValue(
                    part.slice(pos + 1),
                    options,
                    isArray(obj[key]) ? obj[key].length : 0
                ),
                function (encodedVal) {
                    return options.decoder(encodedVal, defaults.decoder, charset, 'value');
                }
            );
        }

        if (val && options.interpretNumericEntities && charset === 'iso-8859-1') {
            val = interpretNumericEntities(String(val));
        }

        if (part.indexOf('[]=') > -1) {
            val = isArray(val) ? [val] : val;
        }

        var existing = has.call(obj, key);
        if (existing && options.duplicates === 'combine') {
            obj[key] = utils.combine(obj[key], val);
        } else if (!existing || options.duplicates === 'last') {
            obj[key] = val;
        }
    }

    return obj;
};

var parseObject = function (chain, val, options, valuesParsed) {
    var currentArrayLength = 0;
    if (chain.length > 0 && chain[chain.length - 1] === '[]') {
        var parentKey = chain.slice(0, -1).join('');
        currentArrayLength = Array.isArray(val) && val[parentKey] ? val[parentKey].length : 0;
    }

    var leaf = valuesParsed ? val : parseArrayValue(val, options, currentArrayLength);

    for (var i = chain.length - 1; i >= 0; --i) {
        var obj;
        var root = chain[i];

        if (root === '[]' && options.parseArrays) {
            obj = options.allowEmptyArrays && (leaf === '' || (options.strictNullHandling && leaf === null))
                ? []
                : utils.combine([], leaf);
        } else {
            obj = options.plainObjects ? { __proto__: null } : {};
            var cleanRoot = root.charAt(0) === '[' && root.charAt(root.length - 1) === ']' ? root.slice(1, -1) : root;
            var decodedRoot = options.decodeDotInKeys ? cleanRoot.replace(/%2E/g, '.') : cleanRoot;
            var index = parseInt(decodedRoot, 10);
            if (!options.parseArrays && decodedRoot === '') {
                obj = { 0: leaf };
            } else if (
                !isNaN(index)
                && root !== decodedRoot
                && String(index) === decodedRoot
                && index >= 0
                && (options.parseArrays && index <= options.arrayLimit)
            ) {
                obj = [];
                obj[index] = leaf;
            } else if (decodedRoot !== '__proto__') {
                obj[decodedRoot] = leaf;
            }
        }

        leaf = obj;
    }

    return leaf;
};

var parseKeys = function parseQueryStringKeys(givenKey, val, options, valuesParsed) {
    if (!givenKey) {
        return;
    }

    // Transform dot notation to bracket notation
    var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, '[$1]') : givenKey;

    // The regex chunks

    var brackets = /(\[[^[\]]*])/;
    var child = /(\[[^[\]]*])/g;

    // Get the parent

    var segment = options.depth > 0 && brackets.exec(key);
    var parent = segment ? key.slice(0, segment.index) : key;

    // Stash the parent if it exists

    var keys = [];
    if (parent) {
        // If we aren't using plain objects, optionally prefix keys that would overwrite object prototype properties
        if (!options.plainObjects && has.call(Object.prototype, parent)) {
            if (!options.allowPrototypes) {
                return;
            }
        }

        keys.push(parent);
    }

    // Loop through children appending to the array until we hit depth

    var i = 0;
    while (options.depth > 0 && (segment = child.exec(key)) !== null && i < options.depth) {
        i += 1;
        if (!options.plainObjects && has.call(Object.prototype, segment[1].slice(1, -1))) {
            if (!options.allowPrototypes) {
                return;
            }
        }
        keys.push(segment[1]);
    }

    // If there's a remainder, check strictDepth option for throw, else just add whatever is left

    if (segment) {
        if (options.strictDepth === true) {
            throw new RangeError('Input depth exceeded depth option of ' + options.depth + ' and strictDepth is true');
        }
        keys.push('[' + key.slice(segment.index) + ']');
    }

    return parseObject(keys, val, options, valuesParsed);
};

var normalizeParseOptions = function normalizeParseOptions(opts) {
    if (!opts) {
        return defaults;
    }

    if (typeof opts.allowEmptyArrays !== 'undefined' && typeof opts.allowEmptyArrays !== 'boolean') {
        throw new TypeError('`allowEmptyArrays` option can only be `true` or `false`, when provided');
    }

    if (typeof opts.decodeDotInKeys !== 'undefined' && typeof opts.decodeDotInKeys !== 'boolean') {
        throw new TypeError('`decodeDotInKeys` option can only be `true` or `false`, when provided');
    }

    if (opts.decoder !== null && typeof opts.decoder !== 'undefined' && typeof opts.decoder !== 'function') {
        throw new TypeError('Decoder has to be a function.');
    }

    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
    }

    if (typeof opts.throwOnLimitExceeded !== 'undefined' && typeof opts.throwOnLimitExceeded !== 'boolean') {
        throw new TypeError('`throwOnLimitExceeded` option must be a boolean');
    }

    var charset = typeof opts.charset === 'undefined' ? defaults.charset : opts.charset;

    var duplicates = typeof opts.duplicates === 'undefined' ? defaults.duplicates : opts.duplicates;

    if (duplicates !== 'combine' && duplicates !== 'first' && duplicates !== 'last') {
        throw new TypeError('The duplicates option must be either combine, first, or last');
    }

    var allowDots = typeof opts.allowDots === 'undefined' ? opts.decodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;

    return {
        allowDots: allowDots,
        allowEmptyArrays: typeof opts.allowEmptyArrays === 'boolean' ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
        allowPrototypes: typeof opts.allowPrototypes === 'boolean' ? opts.allowPrototypes : defaults.allowPrototypes,
        allowSparse: typeof opts.allowSparse === 'boolean' ? opts.allowSparse : defaults.allowSparse,
        arrayLimit: typeof opts.arrayLimit === 'number' ? opts.arrayLimit : defaults.arrayLimit,
        charset: charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        comma: typeof opts.comma === 'boolean' ? opts.comma : defaults.comma,
        decodeDotInKeys: typeof opts.decodeDotInKeys === 'boolean' ? opts.decodeDotInKeys : defaults.decodeDotInKeys,
        decoder: typeof opts.decoder === 'function' ? opts.decoder : defaults.decoder,
        delimiter: typeof opts.delimiter === 'string' || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
        // eslint-disable-next-line no-implicit-coercion, no-extra-parens
        depth: (typeof opts.depth === 'number' || opts.depth === false) ? +opts.depth : defaults.depth,
        duplicates: duplicates,
        ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
        interpretNumericEntities: typeof opts.interpretNumericEntities === 'boolean' ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
        parameterLimit: typeof opts.parameterLimit === 'number' ? opts.parameterLimit : defaults.parameterLimit,
        parseArrays: opts.parseArrays !== false,
        plainObjects: typeof opts.plainObjects === 'boolean' ? opts.plainObjects : defaults.plainObjects,
        strictDepth: typeof opts.strictDepth === 'boolean' ? !!opts.strictDepth : defaults.strictDepth,
        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling,
        throwOnLimitExceeded: typeof opts.throwOnLimitExceeded === 'boolean' ? opts.throwOnLimitExceeded : false
    };
};

var parse$1 = function (str, opts) {
    var options = normalizeParseOptions(opts);

    if (str === '' || str === null || typeof str === 'undefined') {
        return options.plainObjects ? { __proto__: null } : {};
    }

    var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
    var obj = options.plainObjects ? { __proto__: null } : {};

    // Iterate over the keys and setup the new object

    var keys = Object.keys(tempObj);
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var newObj = parseKeys(key, tempObj[key], options, typeof str === 'string');
        obj = utils.merge(obj, newObj, options);
    }

    if (options.allowSparse === true) {
        return obj;
    }

    return utils.compact(obj);
};

var stringify = stringify_1;
var parse = parse$1;
var formats = formats$3;

var lib = {
    formats: formats,
    parse: parse,
    stringify: stringify
};

const P$1 = /*@__PURE__*/getDefaultExportFromCjs(lib);

var h=e=>{if(typeof e>"u")return e;let t=Number(e);return `${t}`===e?t:e};var x={addQueryPrefix:true,skipNulls:true,arrayFormat:"indices",encode:false,encodeValuesOnly:true},D={go:()=>{let{search:e,hash:t}=dashboard__loadShare__react_mf_2_router__loadShare__.useLocation(),n=dashboard__loadShare__react_mf_2_router__loadShare__.useNavigate();return dashboard__loadShare__react__loadShare__.useCallback(({to:s,type:r,query:o,hash:a,options:{keepQuery:c,keepHash:f}={}})=>{let u={...c&&e&&P$1.parse(e,{ignoreQueryPrefix:true}),...o};u.to&&(u.to=encodeURIComponent(`${u.to}`));let p=Object.keys(u).length>0,m=`#${(a||f&&t||"").replace(/^#/,"")}`,d=m.length>1,C=`${s||""}${p?P$1.stringify(u,x):""}${d?m:""}`;if(r==="path")return C;n(C,{replace:r==="replace"});},[t,e,n])},back:()=>{let e=dashboard__loadShare__react_mf_2_router__loadShare__.useNavigate();return dashboard__loadShare__react__loadShare__.useCallback(()=>{e(-1);},[e])},parse:()=>{var c;let e=dashboard__loadShare__react_mf_2_router__loadShare__.useParams(),{pathname:t,search:n}=dashboard__loadShare__react_mf_2_router__loadShare__.useLocation(),{resources:i}=dashboard__loadShare__react__loadShare__.useContext(dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.ResourceContext),{resource:s,action:r,matchedRoute:o}=React3.useMemo(()=>dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.matchResourceFromRoute(t,i),[i,t]);return Object.entries(e).length===0&&o&&(e=((c=dashboard__loadShare__react_mf_2_router__loadShare__.matchPath(o,t))==null?void 0:c.params)||{}),dashboard__loadShare__react__loadShare__.useCallback(()=>{let f=P$1.parse(n,{ignoreQueryPrefix:true}),u={...e,...f};return {...s&&{resource:s},...r&&{action:r},...(e==null?void 0:e.id)&&{id:decodeURIComponent(e.id)},pathname:t,params:{...u,current:h(u.current),pageSize:h(u.pageSize),to:u.to?decodeURIComponent(u.to):void 0}}},[t,n,e,s,r])},Link:React3.forwardRef(function(t,n){return React3.createElement(dashboard__loadShare__react_mf_2_router__loadShare__.Link,{...t,ref:n})})};

//#region src/components/app/AppComponent.tsx
registerAllFormComponents();
registerAllActionItems();
function AppComponent({ loadNavigation = true, loadRoutes = true, name = "app" }) {
	const configureBuilder = dashboard__loadShare__react__loadShare__.useCallback((builder) => {
		return builder;
	}, []);
	return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.FrameworkProvider, {
		appName: name,
		configure: configureBuilder,
		children: /* @__PURE__ */ jsxRuntimeExports.jsx(AppContent, {
			loadNavigation,
			loadRoutes
		})
	});
}
function AppContent({ loadNavigation = true, loadRoutes = true }) {
	const { error: frameworkError, framework, isLoading: isFrameworkLoading } = dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.useFramework();
	const addMenuItems = useAppStore((state) => state.addMenuItems);
	const error = useAppStore((state) => state.error);
	const isLoading = useAppStore((state) => state.isLoading);
	const pluginConfigs = useAppStore((state) => state.pluginConfigs);
	const routes = useAppStore((state) => state.routes);
	const setError = useAppStore((state) => state.setError);
	const setIsLoading = useAppStore((state) => state.setIsLoading);
	const setPluginConfigs = useAppStore((state) => state.setPluginConfigs);
	const setRoutes = useAppStore((state) => state.setRoutes);
	useFrameworkSync();
	dashboard__loadShare__react__loadShare__.useEffect(() => {
		if (!framework || isFrameworkLoading) return;
		let mounted = true;
		async function loadData() {
			setIsLoading(true);
			setError(null);
			try {
				let navigationFeature;
				let capabilities = [];
				let routes$1 = [];
				let navigation = [];
				if (loadNavigation) navigationFeature = await framework.getFeature(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.createNamespacedId("core", "navigation"));
				if (loadRoutes) capabilities = await framework.getCapabilitiesByType("core:refine-config");
				if (navigationFeature) [routes$1, navigation] = await Promise.all([navigationFeature.getRoutes(), navigationFeature.getNavigation()]);
				const configs = loadRoutes ? (() => {
					let lastConfig = [];
					return capabilities.map((cap) => {
						const latestConfig = cap.getConfig(lastConfig);
						lastConfig = Object.assign({}, lastConfig, latestConfig);
						return lastConfig;
					});
				})() : [];
				if (mounted) {
					setRoutes(routes$1);
					addMenuItems(navigation);
					setPluginConfigs(configs);
					setIsLoading(false);
				}
			} catch (err) {
				if (mounted) {
					setError(err instanceof Error ? err : new Error("Failed to load navigation data"));
					setIsLoading(false);
				}
			}
		}
		loadData();
		return () => {
			mounted = false;
		};
	}, [
		framework,
		isFrameworkLoading,
		loadNavigation,
		loadRoutes,
		setError,
		setIsLoading,
		setRoutes,
		setPluginConfigs,
		addMenuItems
	]);
	if (isFrameworkLoading || isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, {});
	if (frameworkError) return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.ErrorDisplay, {
		error: frameworkError,
		onRetry: () => window.location.reload()
	});
	if (error && (loadNavigation || loadRoutes)) return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.ErrorDisplay, {
		error,
		onRetry: () => window.location.reload()
	});
	if (!routes) return null;
	const combinedPluginConfig = Object.assign({}, ...pluginConfigs);
	const routerRoutes = dashboard__loadShare__react_mf_2_router__loadShare__.createRoutesFromElements(Array.isArray(routes) ? routes.map((route) => createRouteElement(route, framework)) : []);
	function createRouteElement(route, framework$1, child = false) {
		const LazyComponent = getLazyComponent(route.component ?? "", route.pluginId ?? dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.createNamespacedId("core", "fallback"), framework$1, route.id);
		const jsxElement = LazyComponent ? /* @__PURE__ */ jsxRuntimeExports.jsx(LazyComponent, {}) : null;
		const finalElement = jsxElement ? withRouteContainer(jsxElement, !child)() : /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.RouteErrorBoundaryFallback, { error: new Error(`Failed to load element for route ${route.id}`) });
		const childRoutes = route.children?.map((childRoute) => createRouteElement(childRoute, framework$1, true));
		return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare__react_mf_2_router__loadShare__.Route, {
			element: finalElement,
			errorElement: /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.RouteErrorBoundary, {}),
			index: route.index,
			path: route.path,
			children: childRoutes
		}, route.id);
	}
	let router;
	if (routerRoutes.length > 0) router = dashboard__loadShare__react_mf_2_router__loadShare__.createBrowserRouter(routerRoutes);
	const options = {
		...combinedPluginConfig,
		options: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.getDefaultRefineOptions(),
		routerProvider: D
	};
	return /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.Refine, {
		...options,
		children: [/* @__PURE__ */ jsxRuntimeExports.jsxs(DialogProvider, { children: [router && /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare__react_mf_2_router__loadShare__.RouterProvider, { router }), !router && /* @__PURE__ */ jsxRuntimeExports.jsx(DialogRenderer, {})] }), /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Toaster, {})]
	});
}
function getLazyComponent(componentString, pluginId, framework, routeId) {
	if (!componentString || !pluginId) {
		console.error(`Route Error: Missing component string or pluginId for route id ${routeId}`);
		return () => /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.RouteErrorBoundaryFallback, { error: new Error(`Missing component/pluginId for route ${routeId}`) });
	}
	let componentName;
	try {
		if (componentString.includes(":")) componentName = dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.parseNamespacedId(componentString).name;
		else componentName = componentString;
	} catch (e) {
		console.error(`Route Error: Failed to parse component string "${componentString}" for route id ${routeId}`, e);
		return () => /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.RouteErrorBoundaryFallback, { error: new Error(`Invalid component string format: ${componentString}`) });
	}
	if (!componentName) {
		console.error(`Route Error: Could not extract componentName from "${componentString}" for route id ${routeId}`);
		return () => /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.RouteErrorBoundaryFallback, { error: new Error(`Invalid component name from: ${componentString}`) });
	}
	try {
		return dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.createRemoteComponentLoader({
			componentPath: componentName,
			pluginId
		}, framework, {
			...dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.defaultRemoteOptions,
			LoadingComponent: Loading
		});
	} catch (e) {
		console.error(`Route Error: Failed createRemoteComponentLoader for ${pluginId}:${componentName}`, e);
		return () => /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.RouteErrorBoundaryFallback, { error: new Error(`Failed to create loader for ${pluginId}:${componentName}`) });
	}
}
function LoadingSpinner() {
	return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
		className: "animate-pulse",
		children: [/* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-3/4 rounded bg-gray-200" }), /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
			className: "mt-4 space-y-3",
			children: [/* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 rounded bg-gray-200" }), /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 rounded bg-gray-200" })]
		})]
	}) });
}
function withRouteContainer(element, renderDialog) {
	return function RouteContainerHOC() {
		return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
			renderDialog && /* @__PURE__ */ jsxRuntimeExports.jsx(DialogRenderer, {}),
			/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.HostContextBridge, {}),
			element
		] });
	};
}

/**
   * table-core
   *
   * Copyright (c) TanStack
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   */
function functionalUpdate(updater, input) {
  return typeof updater === "function" ? updater(input) : updater;
}
function makeStateUpdater(key, instance) {
  return (updater) => {
    instance.setState((old) => {
      return {
        ...old,
        [key]: functionalUpdate(updater, old[key])
      };
    });
  };
}
function isFunction(d) {
  return d instanceof Function;
}
function isNumberArray(d) {
  return Array.isArray(d) && d.every((val) => typeof val === "number");
}
function flattenBy(arr, getChildren) {
  const flat = [];
  const recurse = (subArr) => {
    subArr.forEach((item) => {
      flat.push(item);
      const children = getChildren(item);
      if (children != null && children.length) {
        recurse(children);
      }
    });
  };
  recurse(arr);
  return flat;
}
function memo(getDeps, fn, opts) {
  let deps = [];
  let result;
  return (depArgs) => {
    let depTime;
    if (opts.key && opts.debug) depTime = Date.now();
    const newDeps = getDeps(depArgs);
    const depsChanged = newDeps.length !== deps.length || newDeps.some((dep, index) => deps[index] !== dep);
    if (!depsChanged) {
      return result;
    }
    deps = newDeps;
    let resultTime;
    if (opts.key && opts.debug) resultTime = Date.now();
    result = fn(...newDeps);
    opts == null || opts.onChange == null || opts.onChange(result);
    if (opts.key && opts.debug) {
      if (opts != null && opts.debug()) {
        const depEndTime = Math.round((Date.now() - depTime) * 100) / 100;
        const resultEndTime = Math.round((Date.now() - resultTime) * 100) / 100;
        const resultFpsPercentage = resultEndTime / 16;
        const pad = (str, num) => {
          str = String(str);
          while (str.length < num) {
            str = " " + str;
          }
          return str;
        };
        console.info(`%c⏱ ${pad(resultEndTime, 5)} /${pad(depEndTime, 5)} ms`, `
            font-size: .6rem;
            font-weight: bold;
            color: hsl(${Math.max(0, Math.min(120 - 120 * resultFpsPercentage, 120))}deg 100% 31%);`, opts == null ? void 0 : opts.key);
      }
    }
    return result;
  };
}
function getMemoOptions(tableOptions, debugLevel, key, onChange) {
  return {
    debug: () => {
      var _tableOptions$debugAl;
      return (_tableOptions$debugAl = tableOptions == null ? void 0 : tableOptions.debugAll) != null ? _tableOptions$debugAl : tableOptions[debugLevel];
    },
    key: false,
    onChange
  };
}
function createCell(table, row, column, columnId) {
  const getRenderValue = () => {
    var _cell$getValue;
    return (_cell$getValue = cell.getValue()) != null ? _cell$getValue : table.options.renderFallbackValue;
  };
  const cell = {
    id: `${row.id}_${column.id}`,
    row,
    column,
    getValue: () => row.getValue(columnId),
    renderValue: getRenderValue,
    getContext: memo(() => [table, column, row, cell], (table2, column2, row2, cell2) => ({
      table: table2,
      column: column2,
      row: row2,
      cell: cell2,
      getValue: cell2.getValue,
      renderValue: cell2.renderValue
    }), getMemoOptions(table.options, "debugCells"))
  };
  table._features.forEach((feature) => {
    feature.createCell == null || feature.createCell(cell, column, row, table);
  }, {});
  return cell;
}
function createColumn(table, columnDef, depth, parent) {
  var _ref, _resolvedColumnDef$id;
  const defaultColumn = table._getDefaultColumnDef();
  const resolvedColumnDef = {
    ...defaultColumn,
    ...columnDef
  };
  const accessorKey = resolvedColumnDef.accessorKey;
  let id = (_ref = (_resolvedColumnDef$id = resolvedColumnDef.id) != null ? _resolvedColumnDef$id : accessorKey ? typeof String.prototype.replaceAll === "function" ? accessorKey.replaceAll(".", "_") : accessorKey.replace(/\./g, "_") : void 0) != null ? _ref : typeof resolvedColumnDef.header === "string" ? resolvedColumnDef.header : void 0;
  let accessorFn;
  if (resolvedColumnDef.accessorFn) {
    accessorFn = resolvedColumnDef.accessorFn;
  } else if (accessorKey) {
    if (accessorKey.includes(".")) {
      accessorFn = (originalRow) => {
        let result = originalRow;
        for (const key of accessorKey.split(".")) {
          var _result;
          result = (_result = result) == null ? void 0 : _result[key];
        }
        return result;
      };
    } else {
      accessorFn = (originalRow) => originalRow[resolvedColumnDef.accessorKey];
    }
  }
  if (!id) {
    throw new Error();
  }
  let column = {
    id: `${String(id)}`,
    accessorFn,
    parent,
    depth,
    columnDef: resolvedColumnDef,
    columns: [],
    getFlatColumns: memo(() => [true], () => {
      var _column$columns;
      return [column, ...(_column$columns = column.columns) == null ? void 0 : _column$columns.flatMap((d) => d.getFlatColumns())];
    }, getMemoOptions(table.options, "debugColumns")),
    getLeafColumns: memo(() => [table._getOrderColumnsFn()], (orderColumns2) => {
      var _column$columns2;
      if ((_column$columns2 = column.columns) != null && _column$columns2.length) {
        let leafColumns = column.columns.flatMap((column2) => column2.getLeafColumns());
        return orderColumns2(leafColumns);
      }
      return [column];
    }, getMemoOptions(table.options, "debugColumns"))
  };
  for (const feature of table._features) {
    feature.createColumn == null || feature.createColumn(column, table);
  }
  return column;
}
const debug = "debugHeaders";
function createHeader(table, column, options) {
  var _options$id;
  const id = (_options$id = options.id) != null ? _options$id : column.id;
  let header = {
    id,
    column,
    index: options.index,
    isPlaceholder: !!options.isPlaceholder,
    placeholderId: options.placeholderId,
    depth: options.depth,
    subHeaders: [],
    colSpan: 0,
    rowSpan: 0,
    headerGroup: null,
    getLeafHeaders: () => {
      const leafHeaders = [];
      const recurseHeader = (h) => {
        if (h.subHeaders && h.subHeaders.length) {
          h.subHeaders.map(recurseHeader);
        }
        leafHeaders.push(h);
      };
      recurseHeader(header);
      return leafHeaders;
    },
    getContext: () => ({
      table,
      header,
      column
    })
  };
  table._features.forEach((feature) => {
    feature.createHeader == null || feature.createHeader(header, table);
  });
  return header;
}
const Headers = {
  createTable: (table) => {
    table.getHeaderGroups = memo(() => [table.getAllColumns(), table.getVisibleLeafColumns(), table.getState().columnPinning.left, table.getState().columnPinning.right], (allColumns, leafColumns, left, right) => {
      var _left$map$filter, _right$map$filter;
      const leftColumns = (_left$map$filter = left == null ? void 0 : left.map((columnId) => leafColumns.find((d) => d.id === columnId)).filter(Boolean)) != null ? _left$map$filter : [];
      const rightColumns = (_right$map$filter = right == null ? void 0 : right.map((columnId) => leafColumns.find((d) => d.id === columnId)).filter(Boolean)) != null ? _right$map$filter : [];
      const centerColumns = leafColumns.filter((column) => !(left != null && left.includes(column.id)) && !(right != null && right.includes(column.id)));
      const headerGroups = buildHeaderGroups(allColumns, [...leftColumns, ...centerColumns, ...rightColumns], table);
      return headerGroups;
    }, getMemoOptions(table.options, debug));
    table.getCenterHeaderGroups = memo(() => [table.getAllColumns(), table.getVisibleLeafColumns(), table.getState().columnPinning.left, table.getState().columnPinning.right], (allColumns, leafColumns, left, right) => {
      leafColumns = leafColumns.filter((column) => !(left != null && left.includes(column.id)) && !(right != null && right.includes(column.id)));
      return buildHeaderGroups(allColumns, leafColumns, table, "center");
    }, getMemoOptions(table.options, debug));
    table.getLeftHeaderGroups = memo(() => [table.getAllColumns(), table.getVisibleLeafColumns(), table.getState().columnPinning.left], (allColumns, leafColumns, left) => {
      var _left$map$filter2;
      const orderedLeafColumns = (_left$map$filter2 = left == null ? void 0 : left.map((columnId) => leafColumns.find((d) => d.id === columnId)).filter(Boolean)) != null ? _left$map$filter2 : [];
      return buildHeaderGroups(allColumns, orderedLeafColumns, table, "left");
    }, getMemoOptions(table.options, debug));
    table.getRightHeaderGroups = memo(() => [table.getAllColumns(), table.getVisibleLeafColumns(), table.getState().columnPinning.right], (allColumns, leafColumns, right) => {
      var _right$map$filter2;
      const orderedLeafColumns = (_right$map$filter2 = right == null ? void 0 : right.map((columnId) => leafColumns.find((d) => d.id === columnId)).filter(Boolean)) != null ? _right$map$filter2 : [];
      return buildHeaderGroups(allColumns, orderedLeafColumns, table, "right");
    }, getMemoOptions(table.options, debug));
    table.getFooterGroups = memo(() => [table.getHeaderGroups()], (headerGroups) => {
      return [...headerGroups].reverse();
    }, getMemoOptions(table.options, debug));
    table.getLeftFooterGroups = memo(() => [table.getLeftHeaderGroups()], (headerGroups) => {
      return [...headerGroups].reverse();
    }, getMemoOptions(table.options, debug));
    table.getCenterFooterGroups = memo(() => [table.getCenterHeaderGroups()], (headerGroups) => {
      return [...headerGroups].reverse();
    }, getMemoOptions(table.options, debug));
    table.getRightFooterGroups = memo(() => [table.getRightHeaderGroups()], (headerGroups) => {
      return [...headerGroups].reverse();
    }, getMemoOptions(table.options, debug));
    table.getFlatHeaders = memo(() => [table.getHeaderGroups()], (headerGroups) => {
      return headerGroups.map((headerGroup) => {
        return headerGroup.headers;
      }).flat();
    }, getMemoOptions(table.options, debug));
    table.getLeftFlatHeaders = memo(() => [table.getLeftHeaderGroups()], (left) => {
      return left.map((headerGroup) => {
        return headerGroup.headers;
      }).flat();
    }, getMemoOptions(table.options, debug));
    table.getCenterFlatHeaders = memo(() => [table.getCenterHeaderGroups()], (left) => {
      return left.map((headerGroup) => {
        return headerGroup.headers;
      }).flat();
    }, getMemoOptions(table.options, debug));
    table.getRightFlatHeaders = memo(() => [table.getRightHeaderGroups()], (left) => {
      return left.map((headerGroup) => {
        return headerGroup.headers;
      }).flat();
    }, getMemoOptions(table.options, debug));
    table.getCenterLeafHeaders = memo(() => [table.getCenterFlatHeaders()], (flatHeaders) => {
      return flatHeaders.filter((header) => {
        var _header$subHeaders;
        return !((_header$subHeaders = header.subHeaders) != null && _header$subHeaders.length);
      });
    }, getMemoOptions(table.options, debug));
    table.getLeftLeafHeaders = memo(() => [table.getLeftFlatHeaders()], (flatHeaders) => {
      return flatHeaders.filter((header) => {
        var _header$subHeaders2;
        return !((_header$subHeaders2 = header.subHeaders) != null && _header$subHeaders2.length);
      });
    }, getMemoOptions(table.options, debug));
    table.getRightLeafHeaders = memo(() => [table.getRightFlatHeaders()], (flatHeaders) => {
      return flatHeaders.filter((header) => {
        var _header$subHeaders3;
        return !((_header$subHeaders3 = header.subHeaders) != null && _header$subHeaders3.length);
      });
    }, getMemoOptions(table.options, debug));
    table.getLeafHeaders = memo(() => [table.getLeftHeaderGroups(), table.getCenterHeaderGroups(), table.getRightHeaderGroups()], (left, center, right) => {
      var _left$0$headers, _left$, _center$0$headers, _center$, _right$0$headers, _right$;
      return [...(_left$0$headers = (_left$ = left[0]) == null ? void 0 : _left$.headers) != null ? _left$0$headers : [], ...(_center$0$headers = (_center$ = center[0]) == null ? void 0 : _center$.headers) != null ? _center$0$headers : [], ...(_right$0$headers = (_right$ = right[0]) == null ? void 0 : _right$.headers) != null ? _right$0$headers : []].map((header) => {
        return header.getLeafHeaders();
      }).flat();
    }, getMemoOptions(table.options, debug));
  }
};
function buildHeaderGroups(allColumns, columnsToGroup, table, headerFamily) {
  var _headerGroups$0$heade, _headerGroups$;
  let maxDepth = 0;
  const findMaxDepth = function(columns, depth) {
    if (depth === void 0) {
      depth = 1;
    }
    maxDepth = Math.max(maxDepth, depth);
    columns.filter((column) => column.getIsVisible()).forEach((column) => {
      var _column$columns;
      if ((_column$columns = column.columns) != null && _column$columns.length) {
        findMaxDepth(column.columns, depth + 1);
      }
    }, 0);
  };
  findMaxDepth(allColumns);
  let headerGroups = [];
  const createHeaderGroup = (headersToGroup, depth) => {
    const headerGroup = {
      depth,
      id: [headerFamily, `${depth}`].filter(Boolean).join("_"),
      headers: []
    };
    const pendingParentHeaders = [];
    headersToGroup.forEach((headerToGroup) => {
      const latestPendingParentHeader = [...pendingParentHeaders].reverse()[0];
      const isLeafHeader = headerToGroup.column.depth === headerGroup.depth;
      let column;
      let isPlaceholder = false;
      if (isLeafHeader && headerToGroup.column.parent) {
        column = headerToGroup.column.parent;
      } else {
        column = headerToGroup.column;
        isPlaceholder = true;
      }
      if (latestPendingParentHeader && (latestPendingParentHeader == null ? void 0 : latestPendingParentHeader.column) === column) {
        latestPendingParentHeader.subHeaders.push(headerToGroup);
      } else {
        const header = createHeader(table, column, {
          id: [headerFamily, depth, column.id, headerToGroup == null ? void 0 : headerToGroup.id].filter(Boolean).join("_"),
          isPlaceholder,
          placeholderId: isPlaceholder ? `${pendingParentHeaders.filter((d) => d.column === column).length}` : void 0,
          depth,
          index: pendingParentHeaders.length
        });
        header.subHeaders.push(headerToGroup);
        pendingParentHeaders.push(header);
      }
      headerGroup.headers.push(headerToGroup);
      headerToGroup.headerGroup = headerGroup;
    });
    headerGroups.push(headerGroup);
    if (depth > 0) {
      createHeaderGroup(pendingParentHeaders, depth - 1);
    }
  };
  const bottomHeaders = columnsToGroup.map((column, index) => createHeader(table, column, {
    depth: maxDepth,
    index
  }));
  createHeaderGroup(bottomHeaders, maxDepth - 1);
  headerGroups.reverse();
  const recurseHeadersForSpans = (headers) => {
    const filteredHeaders = headers.filter((header) => header.column.getIsVisible());
    return filteredHeaders.map((header) => {
      let colSpan = 0;
      let rowSpan = 0;
      let childRowSpans = [0];
      if (header.subHeaders && header.subHeaders.length) {
        childRowSpans = [];
        recurseHeadersForSpans(header.subHeaders).forEach((_ref) => {
          let {
            colSpan: childColSpan,
            rowSpan: childRowSpan
          } = _ref;
          colSpan += childColSpan;
          childRowSpans.push(childRowSpan);
        });
      } else {
        colSpan = 1;
      }
      const minChildRowSpan = Math.min(...childRowSpans);
      rowSpan = rowSpan + minChildRowSpan;
      header.colSpan = colSpan;
      header.rowSpan = rowSpan;
      return {
        colSpan,
        rowSpan
      };
    });
  };
  recurseHeadersForSpans((_headerGroups$0$heade = (_headerGroups$ = headerGroups[0]) == null ? void 0 : _headerGroups$.headers) != null ? _headerGroups$0$heade : []);
  return headerGroups;
}
const createRow = (table, id, original, rowIndex, depth, subRows, parentId) => {
  let row = {
    id,
    index: rowIndex,
    original,
    depth,
    parentId,
    _valuesCache: {},
    _uniqueValuesCache: {},
    getValue: (columnId) => {
      if (row._valuesCache.hasOwnProperty(columnId)) {
        return row._valuesCache[columnId];
      }
      const column = table.getColumn(columnId);
      if (!(column != null && column.accessorFn)) {
        return void 0;
      }
      row._valuesCache[columnId] = column.accessorFn(row.original, rowIndex);
      return row._valuesCache[columnId];
    },
    getUniqueValues: (columnId) => {
      if (row._uniqueValuesCache.hasOwnProperty(columnId)) {
        return row._uniqueValuesCache[columnId];
      }
      const column = table.getColumn(columnId);
      if (!(column != null && column.accessorFn)) {
        return void 0;
      }
      if (!column.columnDef.getUniqueValues) {
        row._uniqueValuesCache[columnId] = [row.getValue(columnId)];
        return row._uniqueValuesCache[columnId];
      }
      row._uniqueValuesCache[columnId] = column.columnDef.getUniqueValues(row.original, rowIndex);
      return row._uniqueValuesCache[columnId];
    },
    renderValue: (columnId) => {
      var _row$getValue;
      return (_row$getValue = row.getValue(columnId)) != null ? _row$getValue : table.options.renderFallbackValue;
    },
    subRows: [],
    getLeafRows: () => flattenBy(row.subRows, (d) => d.subRows),
    getParentRow: () => row.parentId ? table.getRow(row.parentId, true) : void 0,
    getParentRows: () => {
      let parentRows = [];
      let currentRow = row;
      while (true) {
        const parentRow = currentRow.getParentRow();
        if (!parentRow) break;
        parentRows.push(parentRow);
        currentRow = parentRow;
      }
      return parentRows.reverse();
    },
    getAllCells: memo(() => [table.getAllLeafColumns()], (leafColumns) => {
      return leafColumns.map((column) => {
        return createCell(table, row, column, column.id);
      });
    }, getMemoOptions(table.options, "debugRows")),
    _getAllCellsByColumnId: memo(() => [row.getAllCells()], (allCells) => {
      return allCells.reduce((acc, cell) => {
        acc[cell.column.id] = cell;
        return acc;
      }, {});
    }, getMemoOptions(table.options, "debugRows"))
  };
  for (let i = 0; i < table._features.length; i++) {
    const feature = table._features[i];
    feature == null || feature.createRow == null || feature.createRow(row, table);
  }
  return row;
};
const ColumnFaceting = {
  createColumn: (column, table) => {
    column._getFacetedRowModel = table.options.getFacetedRowModel && table.options.getFacetedRowModel(table, column.id);
    column.getFacetedRowModel = () => {
      if (!column._getFacetedRowModel) {
        return table.getPreFilteredRowModel();
      }
      return column._getFacetedRowModel();
    };
    column._getFacetedUniqueValues = table.options.getFacetedUniqueValues && table.options.getFacetedUniqueValues(table, column.id);
    column.getFacetedUniqueValues = () => {
      if (!column._getFacetedUniqueValues) {
        return /* @__PURE__ */ new Map();
      }
      return column._getFacetedUniqueValues();
    };
    column._getFacetedMinMaxValues = table.options.getFacetedMinMaxValues && table.options.getFacetedMinMaxValues(table, column.id);
    column.getFacetedMinMaxValues = () => {
      if (!column._getFacetedMinMaxValues) {
        return void 0;
      }
      return column._getFacetedMinMaxValues();
    };
  }
};
const includesString = (row, columnId, filterValue) => {
  var _filterValue$toString, _row$getValue;
  const search = filterValue == null || (_filterValue$toString = filterValue.toString()) == null ? void 0 : _filterValue$toString.toLowerCase();
  return Boolean((_row$getValue = row.getValue(columnId)) == null || (_row$getValue = _row$getValue.toString()) == null || (_row$getValue = _row$getValue.toLowerCase()) == null ? void 0 : _row$getValue.includes(search));
};
includesString.autoRemove = (val) => testFalsey(val);
const includesStringSensitive = (row, columnId, filterValue) => {
  var _row$getValue2;
  return Boolean((_row$getValue2 = row.getValue(columnId)) == null || (_row$getValue2 = _row$getValue2.toString()) == null ? void 0 : _row$getValue2.includes(filterValue));
};
includesStringSensitive.autoRemove = (val) => testFalsey(val);
const equalsString = (row, columnId, filterValue) => {
  var _row$getValue3;
  return ((_row$getValue3 = row.getValue(columnId)) == null || (_row$getValue3 = _row$getValue3.toString()) == null ? void 0 : _row$getValue3.toLowerCase()) === (filterValue == null ? void 0 : filterValue.toLowerCase());
};
equalsString.autoRemove = (val) => testFalsey(val);
const arrIncludes = (row, columnId, filterValue) => {
  var _row$getValue4;
  return (_row$getValue4 = row.getValue(columnId)) == null ? void 0 : _row$getValue4.includes(filterValue);
};
arrIncludes.autoRemove = (val) => testFalsey(val);
const arrIncludesAll = (row, columnId, filterValue) => {
  return !filterValue.some((val) => {
    var _row$getValue5;
    return !((_row$getValue5 = row.getValue(columnId)) != null && _row$getValue5.includes(val));
  });
};
arrIncludesAll.autoRemove = (val) => testFalsey(val) || !(val != null && val.length);
const arrIncludesSome = (row, columnId, filterValue) => {
  return filterValue.some((val) => {
    var _row$getValue6;
    return (_row$getValue6 = row.getValue(columnId)) == null ? void 0 : _row$getValue6.includes(val);
  });
};
arrIncludesSome.autoRemove = (val) => testFalsey(val) || !(val != null && val.length);
const equals = (row, columnId, filterValue) => {
  return row.getValue(columnId) === filterValue;
};
equals.autoRemove = (val) => testFalsey(val);
const weakEquals = (row, columnId, filterValue) => {
  return row.getValue(columnId) == filterValue;
};
weakEquals.autoRemove = (val) => testFalsey(val);
const inNumberRange = (row, columnId, filterValue) => {
  let [min2, max2] = filterValue;
  const rowValue = row.getValue(columnId);
  return rowValue >= min2 && rowValue <= max2;
};
inNumberRange.resolveFilterValue = (val) => {
  let [unsafeMin, unsafeMax] = val;
  let parsedMin = typeof unsafeMin !== "number" ? parseFloat(unsafeMin) : unsafeMin;
  let parsedMax = typeof unsafeMax !== "number" ? parseFloat(unsafeMax) : unsafeMax;
  let min2 = unsafeMin === null || Number.isNaN(parsedMin) ? -Infinity : parsedMin;
  let max2 = unsafeMax === null || Number.isNaN(parsedMax) ? Infinity : parsedMax;
  if (min2 > max2) {
    const temp = min2;
    min2 = max2;
    max2 = temp;
  }
  return [min2, max2];
};
inNumberRange.autoRemove = (val) => testFalsey(val) || testFalsey(val[0]) && testFalsey(val[1]);
const filterFns = {
  includesString,
  includesStringSensitive,
  equalsString,
  arrIncludes,
  arrIncludesAll,
  arrIncludesSome,
  equals,
  weakEquals,
  inNumberRange
};
function testFalsey(val) {
  return val === void 0 || val === null || val === "";
}
const ColumnFiltering = {
  getDefaultColumnDef: () => {
    return {
      filterFn: "auto"
    };
  },
  getInitialState: (state) => {
    return {
      columnFilters: [],
      ...state
    };
  },
  getDefaultOptions: (table) => {
    return {
      onColumnFiltersChange: makeStateUpdater("columnFilters", table),
      filterFromLeafRows: false,
      maxLeafRowFilterDepth: 100
    };
  },
  createColumn: (column, table) => {
    column.getAutoFilterFn = () => {
      const firstRow = table.getCoreRowModel().flatRows[0];
      const value = firstRow == null ? void 0 : firstRow.getValue(column.id);
      if (typeof value === "string") {
        return filterFns.includesString;
      }
      if (typeof value === "number") {
        return filterFns.inNumberRange;
      }
      if (typeof value === "boolean") {
        return filterFns.equals;
      }
      if (value !== null && typeof value === "object") {
        return filterFns.equals;
      }
      if (Array.isArray(value)) {
        return filterFns.arrIncludes;
      }
      return filterFns.weakEquals;
    };
    column.getFilterFn = () => {
      var _table$options$filter, _table$options$filter2;
      return isFunction(column.columnDef.filterFn) ? column.columnDef.filterFn : column.columnDef.filterFn === "auto" ? column.getAutoFilterFn() : (
        // @ts-ignore
        (_table$options$filter = (_table$options$filter2 = table.options.filterFns) == null ? void 0 : _table$options$filter2[column.columnDef.filterFn]) != null ? _table$options$filter : filterFns[column.columnDef.filterFn]
      );
    };
    column.getCanFilter = () => {
      var _column$columnDef$ena, _table$options$enable, _table$options$enable2;
      return ((_column$columnDef$ena = column.columnDef.enableColumnFilter) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table.options.enableColumnFilters) != null ? _table$options$enable : true) && ((_table$options$enable2 = table.options.enableFilters) != null ? _table$options$enable2 : true) && !!column.accessorFn;
    };
    column.getIsFiltered = () => column.getFilterIndex() > -1;
    column.getFilterValue = () => {
      var _table$getState$colum;
      return (_table$getState$colum = table.getState().columnFilters) == null || (_table$getState$colum = _table$getState$colum.find((d) => d.id === column.id)) == null ? void 0 : _table$getState$colum.value;
    };
    column.getFilterIndex = () => {
      var _table$getState$colum2, _table$getState$colum3;
      return (_table$getState$colum2 = (_table$getState$colum3 = table.getState().columnFilters) == null ? void 0 : _table$getState$colum3.findIndex((d) => d.id === column.id)) != null ? _table$getState$colum2 : -1;
    };
    column.setFilterValue = (value) => {
      table.setColumnFilters((old) => {
        const filterFn = column.getFilterFn();
        const previousFilter = old == null ? void 0 : old.find((d) => d.id === column.id);
        const newFilter = functionalUpdate(value, previousFilter ? previousFilter.value : void 0);
        if (shouldAutoRemoveFilter(filterFn, newFilter, column)) {
          var _old$filter;
          return (_old$filter = old == null ? void 0 : old.filter((d) => d.id !== column.id)) != null ? _old$filter : [];
        }
        const newFilterObj = {
          id: column.id,
          value: newFilter
        };
        if (previousFilter) {
          var _old$map;
          return (_old$map = old == null ? void 0 : old.map((d) => {
            if (d.id === column.id) {
              return newFilterObj;
            }
            return d;
          })) != null ? _old$map : [];
        }
        if (old != null && old.length) {
          return [...old, newFilterObj];
        }
        return [newFilterObj];
      });
    };
  },
  createRow: (row, _table) => {
    row.columnFilters = {};
    row.columnFiltersMeta = {};
  },
  createTable: (table) => {
    table.setColumnFilters = (updater) => {
      const leafColumns = table.getAllLeafColumns();
      const updateFn = (old) => {
        var _functionalUpdate;
        return (_functionalUpdate = functionalUpdate(updater, old)) == null ? void 0 : _functionalUpdate.filter((filter) => {
          const column = leafColumns.find((d) => d.id === filter.id);
          if (column) {
            const filterFn = column.getFilterFn();
            if (shouldAutoRemoveFilter(filterFn, filter.value, column)) {
              return false;
            }
          }
          return true;
        });
      };
      table.options.onColumnFiltersChange == null || table.options.onColumnFiltersChange(updateFn);
    };
    table.resetColumnFilters = (defaultState) => {
      var _table$initialState$c, _table$initialState;
      table.setColumnFilters(defaultState ? [] : (_table$initialState$c = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.columnFilters) != null ? _table$initialState$c : []);
    };
    table.getPreFilteredRowModel = () => table.getCoreRowModel();
    table.getFilteredRowModel = () => {
      if (!table._getFilteredRowModel && table.options.getFilteredRowModel) {
        table._getFilteredRowModel = table.options.getFilteredRowModel(table);
      }
      if (table.options.manualFiltering || !table._getFilteredRowModel) {
        return table.getPreFilteredRowModel();
      }
      return table._getFilteredRowModel();
    };
  }
};
function shouldAutoRemoveFilter(filterFn, value, column) {
  return (filterFn && filterFn.autoRemove ? filterFn.autoRemove(value, column) : false) || typeof value === "undefined" || typeof value === "string" && !value;
}
const sum = (columnId, _leafRows, childRows) => {
  return childRows.reduce((sum2, next) => {
    const nextValue = next.getValue(columnId);
    return sum2 + (typeof nextValue === "number" ? nextValue : 0);
  }, 0);
};
const min = (columnId, _leafRows, childRows) => {
  let min2;
  childRows.forEach((row) => {
    const value = row.getValue(columnId);
    if (value != null && (min2 > value || min2 === void 0 && value >= value)) {
      min2 = value;
    }
  });
  return min2;
};
const max = (columnId, _leafRows, childRows) => {
  let max2;
  childRows.forEach((row) => {
    const value = row.getValue(columnId);
    if (value != null && (max2 < value || max2 === void 0 && value >= value)) {
      max2 = value;
    }
  });
  return max2;
};
const extent = (columnId, _leafRows, childRows) => {
  let min2;
  let max2;
  childRows.forEach((row) => {
    const value = row.getValue(columnId);
    if (value != null) {
      if (min2 === void 0) {
        if (value >= value) min2 = max2 = value;
      } else {
        if (min2 > value) min2 = value;
        if (max2 < value) max2 = value;
      }
    }
  });
  return [min2, max2];
};
const mean = (columnId, leafRows) => {
  let count2 = 0;
  let sum2 = 0;
  leafRows.forEach((row) => {
    let value = row.getValue(columnId);
    if (value != null && (value = +value) >= value) {
      ++count2, sum2 += value;
    }
  });
  if (count2) return sum2 / count2;
  return;
};
const median = (columnId, leafRows) => {
  if (!leafRows.length) {
    return;
  }
  const values = leafRows.map((row) => row.getValue(columnId));
  if (!isNumberArray(values)) {
    return;
  }
  if (values.length === 1) {
    return values[0];
  }
  const mid = Math.floor(values.length / 2);
  const nums = values.sort((a, b) => a - b);
  return values.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};
const unique = (columnId, leafRows) => {
  return Array.from(new Set(leafRows.map((d) => d.getValue(columnId))).values());
};
const uniqueCount = (columnId, leafRows) => {
  return new Set(leafRows.map((d) => d.getValue(columnId))).size;
};
const count = (_columnId, leafRows) => {
  return leafRows.length;
};
const aggregationFns = {
  sum,
  min,
  max,
  extent,
  mean,
  median,
  unique,
  uniqueCount,
  count
};
const ColumnGrouping = {
  getDefaultColumnDef: () => {
    return {
      aggregatedCell: (props) => {
        var _toString, _props$getValue;
        return (_toString = (_props$getValue = props.getValue()) == null || _props$getValue.toString == null ? void 0 : _props$getValue.toString()) != null ? _toString : null;
      },
      aggregationFn: "auto"
    };
  },
  getInitialState: (state) => {
    return {
      grouping: [],
      ...state
    };
  },
  getDefaultOptions: (table) => {
    return {
      onGroupingChange: makeStateUpdater("grouping", table),
      groupedColumnMode: "reorder"
    };
  },
  createColumn: (column, table) => {
    column.toggleGrouping = () => {
      table.setGrouping((old) => {
        if (old != null && old.includes(column.id)) {
          return old.filter((d) => d !== column.id);
        }
        return [...old != null ? old : [], column.id];
      });
    };
    column.getCanGroup = () => {
      var _column$columnDef$ena, _table$options$enable;
      return ((_column$columnDef$ena = column.columnDef.enableGrouping) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table.options.enableGrouping) != null ? _table$options$enable : true) && (!!column.accessorFn || !!column.columnDef.getGroupingValue);
    };
    column.getIsGrouped = () => {
      var _table$getState$group;
      return (_table$getState$group = table.getState().grouping) == null ? void 0 : _table$getState$group.includes(column.id);
    };
    column.getGroupedIndex = () => {
      var _table$getState$group2;
      return (_table$getState$group2 = table.getState().grouping) == null ? void 0 : _table$getState$group2.indexOf(column.id);
    };
    column.getToggleGroupingHandler = () => {
      const canGroup = column.getCanGroup();
      return () => {
        if (!canGroup) return;
        column.toggleGrouping();
      };
    };
    column.getAutoAggregationFn = () => {
      const firstRow = table.getCoreRowModel().flatRows[0];
      const value = firstRow == null ? void 0 : firstRow.getValue(column.id);
      if (typeof value === "number") {
        return aggregationFns.sum;
      }
      if (Object.prototype.toString.call(value) === "[object Date]") {
        return aggregationFns.extent;
      }
    };
    column.getAggregationFn = () => {
      var _table$options$aggreg, _table$options$aggreg2;
      if (!column) {
        throw new Error();
      }
      return isFunction(column.columnDef.aggregationFn) ? column.columnDef.aggregationFn : column.columnDef.aggregationFn === "auto" ? column.getAutoAggregationFn() : (_table$options$aggreg = (_table$options$aggreg2 = table.options.aggregationFns) == null ? void 0 : _table$options$aggreg2[column.columnDef.aggregationFn]) != null ? _table$options$aggreg : aggregationFns[column.columnDef.aggregationFn];
    };
  },
  createTable: (table) => {
    table.setGrouping = (updater) => table.options.onGroupingChange == null ? void 0 : table.options.onGroupingChange(updater);
    table.resetGrouping = (defaultState) => {
      var _table$initialState$g, _table$initialState;
      table.setGrouping(defaultState ? [] : (_table$initialState$g = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.grouping) != null ? _table$initialState$g : []);
    };
    table.getPreGroupedRowModel = () => table.getFilteredRowModel();
    table.getGroupedRowModel = () => {
      if (!table._getGroupedRowModel && table.options.getGroupedRowModel) {
        table._getGroupedRowModel = table.options.getGroupedRowModel(table);
      }
      if (table.options.manualGrouping || !table._getGroupedRowModel) {
        return table.getPreGroupedRowModel();
      }
      return table._getGroupedRowModel();
    };
  },
  createRow: (row, table) => {
    row.getIsGrouped = () => !!row.groupingColumnId;
    row.getGroupingValue = (columnId) => {
      if (row._groupingValuesCache.hasOwnProperty(columnId)) {
        return row._groupingValuesCache[columnId];
      }
      const column = table.getColumn(columnId);
      if (!(column != null && column.columnDef.getGroupingValue)) {
        return row.getValue(columnId);
      }
      row._groupingValuesCache[columnId] = column.columnDef.getGroupingValue(row.original);
      return row._groupingValuesCache[columnId];
    };
    row._groupingValuesCache = {};
  },
  createCell: (cell, column, row, table) => {
    cell.getIsGrouped = () => column.getIsGrouped() && column.id === row.groupingColumnId;
    cell.getIsPlaceholder = () => !cell.getIsGrouped() && column.getIsGrouped();
    cell.getIsAggregated = () => {
      var _row$subRows;
      return !cell.getIsGrouped() && !cell.getIsPlaceholder() && !!((_row$subRows = row.subRows) != null && _row$subRows.length);
    };
  }
};
function orderColumns(leafColumns, grouping, groupedColumnMode) {
  if (!(grouping != null && grouping.length) || !groupedColumnMode) {
    return leafColumns;
  }
  const nonGroupingColumns = leafColumns.filter((col) => !grouping.includes(col.id));
  if (groupedColumnMode === "remove") {
    return nonGroupingColumns;
  }
  const groupingColumns = grouping.map((g) => leafColumns.find((col) => col.id === g)).filter(Boolean);
  return [...groupingColumns, ...nonGroupingColumns];
}
const ColumnOrdering = {
  getInitialState: (state) => {
    return {
      columnOrder: [],
      ...state
    };
  },
  getDefaultOptions: (table) => {
    return {
      onColumnOrderChange: makeStateUpdater("columnOrder", table)
    };
  },
  createColumn: (column, table) => {
    column.getIndex = memo((position) => [_getVisibleLeafColumns(table, position)], (columns) => columns.findIndex((d) => d.id === column.id), getMemoOptions(table.options, "debugColumns"));
    column.getIsFirstColumn = (position) => {
      var _columns$;
      const columns = _getVisibleLeafColumns(table, position);
      return ((_columns$ = columns[0]) == null ? void 0 : _columns$.id) === column.id;
    };
    column.getIsLastColumn = (position) => {
      var _columns;
      const columns = _getVisibleLeafColumns(table, position);
      return ((_columns = columns[columns.length - 1]) == null ? void 0 : _columns.id) === column.id;
    };
  },
  createTable: (table) => {
    table.setColumnOrder = (updater) => table.options.onColumnOrderChange == null ? void 0 : table.options.onColumnOrderChange(updater);
    table.resetColumnOrder = (defaultState) => {
      var _table$initialState$c;
      table.setColumnOrder(defaultState ? [] : (_table$initialState$c = table.initialState.columnOrder) != null ? _table$initialState$c : []);
    };
    table._getOrderColumnsFn = memo(() => [table.getState().columnOrder, table.getState().grouping, table.options.groupedColumnMode], (columnOrder, grouping, groupedColumnMode) => (columns) => {
      let orderedColumns = [];
      if (!(columnOrder != null && columnOrder.length)) {
        orderedColumns = columns;
      } else {
        const columnOrderCopy = [...columnOrder];
        const columnsCopy = [...columns];
        while (columnsCopy.length && columnOrderCopy.length) {
          const targetColumnId = columnOrderCopy.shift();
          const foundIndex = columnsCopy.findIndex((d) => d.id === targetColumnId);
          if (foundIndex > -1) {
            orderedColumns.push(columnsCopy.splice(foundIndex, 1)[0]);
          }
        }
        orderedColumns = [...orderedColumns, ...columnsCopy];
      }
      return orderColumns(orderedColumns, grouping, groupedColumnMode);
    }, getMemoOptions(table.options, "debugTable"));
  }
};
const getDefaultColumnPinningState = () => ({
  left: [],
  right: []
});
const ColumnPinning = {
  getInitialState: (state) => {
    return {
      columnPinning: getDefaultColumnPinningState(),
      ...state
    };
  },
  getDefaultOptions: (table) => {
    return {
      onColumnPinningChange: makeStateUpdater("columnPinning", table)
    };
  },
  createColumn: (column, table) => {
    column.pin = (position) => {
      const columnIds = column.getLeafColumns().map((d) => d.id).filter(Boolean);
      table.setColumnPinning((old) => {
        var _old$left3, _old$right3;
        if (position === "right") {
          var _old$left, _old$right;
          return {
            left: ((_old$left = old == null ? void 0 : old.left) != null ? _old$left : []).filter((d) => !(columnIds != null && columnIds.includes(d))),
            right: [...((_old$right = old == null ? void 0 : old.right) != null ? _old$right : []).filter((d) => !(columnIds != null && columnIds.includes(d))), ...columnIds]
          };
        }
        if (position === "left") {
          var _old$left2, _old$right2;
          return {
            left: [...((_old$left2 = old == null ? void 0 : old.left) != null ? _old$left2 : []).filter((d) => !(columnIds != null && columnIds.includes(d))), ...columnIds],
            right: ((_old$right2 = old == null ? void 0 : old.right) != null ? _old$right2 : []).filter((d) => !(columnIds != null && columnIds.includes(d)))
          };
        }
        return {
          left: ((_old$left3 = old == null ? void 0 : old.left) != null ? _old$left3 : []).filter((d) => !(columnIds != null && columnIds.includes(d))),
          right: ((_old$right3 = old == null ? void 0 : old.right) != null ? _old$right3 : []).filter((d) => !(columnIds != null && columnIds.includes(d)))
        };
      });
    };
    column.getCanPin = () => {
      const leafColumns = column.getLeafColumns();
      return leafColumns.some((d) => {
        var _d$columnDef$enablePi, _ref, _table$options$enable;
        return ((_d$columnDef$enablePi = d.columnDef.enablePinning) != null ? _d$columnDef$enablePi : true) && ((_ref = (_table$options$enable = table.options.enableColumnPinning) != null ? _table$options$enable : table.options.enablePinning) != null ? _ref : true);
      });
    };
    column.getIsPinned = () => {
      const leafColumnIds = column.getLeafColumns().map((d) => d.id);
      const {
        left,
        right
      } = table.getState().columnPinning;
      const isLeft = leafColumnIds.some((d) => left == null ? void 0 : left.includes(d));
      const isRight = leafColumnIds.some((d) => right == null ? void 0 : right.includes(d));
      return isLeft ? "left" : isRight ? "right" : false;
    };
    column.getPinnedIndex = () => {
      var _table$getState$colum, _table$getState$colum2;
      const position = column.getIsPinned();
      return position ? (_table$getState$colum = (_table$getState$colum2 = table.getState().columnPinning) == null || (_table$getState$colum2 = _table$getState$colum2[position]) == null ? void 0 : _table$getState$colum2.indexOf(column.id)) != null ? _table$getState$colum : -1 : 0;
    };
  },
  createRow: (row, table) => {
    row.getCenterVisibleCells = memo(() => [row._getAllVisibleCells(), table.getState().columnPinning.left, table.getState().columnPinning.right], (allCells, left, right) => {
      const leftAndRight = [...left != null ? left : [], ...right != null ? right : []];
      return allCells.filter((d) => !leftAndRight.includes(d.column.id));
    }, getMemoOptions(table.options, "debugRows"));
    row.getLeftVisibleCells = memo(() => [row._getAllVisibleCells(), table.getState().columnPinning.left], (allCells, left) => {
      const cells = (left != null ? left : []).map((columnId) => allCells.find((cell) => cell.column.id === columnId)).filter(Boolean).map((d) => ({
        ...d,
        position: "left"
      }));
      return cells;
    }, getMemoOptions(table.options, "debugRows"));
    row.getRightVisibleCells = memo(() => [row._getAllVisibleCells(), table.getState().columnPinning.right], (allCells, right) => {
      const cells = (right != null ? right : []).map((columnId) => allCells.find((cell) => cell.column.id === columnId)).filter(Boolean).map((d) => ({
        ...d,
        position: "right"
      }));
      return cells;
    }, getMemoOptions(table.options, "debugRows"));
  },
  createTable: (table) => {
    table.setColumnPinning = (updater) => table.options.onColumnPinningChange == null ? void 0 : table.options.onColumnPinningChange(updater);
    table.resetColumnPinning = (defaultState) => {
      var _table$initialState$c, _table$initialState;
      return table.setColumnPinning(defaultState ? getDefaultColumnPinningState() : (_table$initialState$c = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.columnPinning) != null ? _table$initialState$c : getDefaultColumnPinningState());
    };
    table.getIsSomeColumnsPinned = (position) => {
      var _pinningState$positio;
      const pinningState = table.getState().columnPinning;
      if (!position) {
        var _pinningState$left, _pinningState$right;
        return Boolean(((_pinningState$left = pinningState.left) == null ? void 0 : _pinningState$left.length) || ((_pinningState$right = pinningState.right) == null ? void 0 : _pinningState$right.length));
      }
      return Boolean((_pinningState$positio = pinningState[position]) == null ? void 0 : _pinningState$positio.length);
    };
    table.getLeftLeafColumns = memo(() => [table.getAllLeafColumns(), table.getState().columnPinning.left], (allColumns, left) => {
      return (left != null ? left : []).map((columnId) => allColumns.find((column) => column.id === columnId)).filter(Boolean);
    }, getMemoOptions(table.options, "debugColumns"));
    table.getRightLeafColumns = memo(() => [table.getAllLeafColumns(), table.getState().columnPinning.right], (allColumns, right) => {
      return (right != null ? right : []).map((columnId) => allColumns.find((column) => column.id === columnId)).filter(Boolean);
    }, getMemoOptions(table.options, "debugColumns"));
    table.getCenterLeafColumns = memo(() => [table.getAllLeafColumns(), table.getState().columnPinning.left, table.getState().columnPinning.right], (allColumns, left, right) => {
      const leftAndRight = [...left != null ? left : [], ...right != null ? right : []];
      return allColumns.filter((d) => !leftAndRight.includes(d.id));
    }, getMemoOptions(table.options, "debugColumns"));
  }
};
function safelyAccessDocument(_document) {
  return _document || (typeof document !== "undefined" ? document : null);
}
const defaultColumnSizing = {
  size: 150,
  minSize: 20,
  maxSize: Number.MAX_SAFE_INTEGER
};
const getDefaultColumnSizingInfoState = () => ({
  startOffset: null,
  startSize: null,
  deltaOffset: null,
  deltaPercentage: null,
  isResizingColumn: false,
  columnSizingStart: []
});
const ColumnSizing = {
  getDefaultColumnDef: () => {
    return defaultColumnSizing;
  },
  getInitialState: (state) => {
    return {
      columnSizing: {},
      columnSizingInfo: getDefaultColumnSizingInfoState(),
      ...state
    };
  },
  getDefaultOptions: (table) => {
    return {
      columnResizeMode: "onEnd",
      columnResizeDirection: "ltr",
      onColumnSizingChange: makeStateUpdater("columnSizing", table),
      onColumnSizingInfoChange: makeStateUpdater("columnSizingInfo", table)
    };
  },
  createColumn: (column, table) => {
    column.getSize = () => {
      var _column$columnDef$min, _ref, _column$columnDef$max;
      const columnSize = table.getState().columnSizing[column.id];
      return Math.min(Math.max((_column$columnDef$min = column.columnDef.minSize) != null ? _column$columnDef$min : defaultColumnSizing.minSize, (_ref = columnSize != null ? columnSize : column.columnDef.size) != null ? _ref : defaultColumnSizing.size), (_column$columnDef$max = column.columnDef.maxSize) != null ? _column$columnDef$max : defaultColumnSizing.maxSize);
    };
    column.getStart = memo((position) => [position, _getVisibleLeafColumns(table, position), table.getState().columnSizing], (position, columns) => columns.slice(0, column.getIndex(position)).reduce((sum2, column2) => sum2 + column2.getSize(), 0), getMemoOptions(table.options, "debugColumns"));
    column.getAfter = memo((position) => [position, _getVisibleLeafColumns(table, position), table.getState().columnSizing], (position, columns) => columns.slice(column.getIndex(position) + 1).reduce((sum2, column2) => sum2 + column2.getSize(), 0), getMemoOptions(table.options, "debugColumns"));
    column.resetSize = () => {
      table.setColumnSizing((_ref2) => {
        let {
          [column.id]: _,
          ...rest
        } = _ref2;
        return rest;
      });
    };
    column.getCanResize = () => {
      var _column$columnDef$ena, _table$options$enable;
      return ((_column$columnDef$ena = column.columnDef.enableResizing) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table.options.enableColumnResizing) != null ? _table$options$enable : true);
    };
    column.getIsResizing = () => {
      return table.getState().columnSizingInfo.isResizingColumn === column.id;
    };
  },
  createHeader: (header, table) => {
    header.getSize = () => {
      let sum2 = 0;
      const recurse = (header2) => {
        if (header2.subHeaders.length) {
          header2.subHeaders.forEach(recurse);
        } else {
          var _header$column$getSiz;
          sum2 += (_header$column$getSiz = header2.column.getSize()) != null ? _header$column$getSiz : 0;
        }
      };
      recurse(header);
      return sum2;
    };
    header.getStart = () => {
      if (header.index > 0) {
        const prevSiblingHeader = header.headerGroup.headers[header.index - 1];
        return prevSiblingHeader.getStart() + prevSiblingHeader.getSize();
      }
      return 0;
    };
    header.getResizeHandler = (_contextDocument) => {
      const column = table.getColumn(header.column.id);
      const canResize = column == null ? void 0 : column.getCanResize();
      return (e) => {
        if (!column || !canResize) {
          return;
        }
        e.persist == null || e.persist();
        if (isTouchStartEvent(e)) {
          if (e.touches && e.touches.length > 1) {
            return;
          }
        }
        const startSize = header.getSize();
        const columnSizingStart = header ? header.getLeafHeaders().map((d) => [d.column.id, d.column.getSize()]) : [[column.id, column.getSize()]];
        const clientX = isTouchStartEvent(e) ? Math.round(e.touches[0].clientX) : e.clientX;
        const newColumnSizing = {};
        const updateOffset = (eventType, clientXPos) => {
          if (typeof clientXPos !== "number") {
            return;
          }
          table.setColumnSizingInfo((old) => {
            var _old$startOffset, _old$startSize;
            const deltaDirection = table.options.columnResizeDirection === "rtl" ? -1 : 1;
            const deltaOffset = (clientXPos - ((_old$startOffset = old == null ? void 0 : old.startOffset) != null ? _old$startOffset : 0)) * deltaDirection;
            const deltaPercentage = Math.max(deltaOffset / ((_old$startSize = old == null ? void 0 : old.startSize) != null ? _old$startSize : 0), -0.999999);
            old.columnSizingStart.forEach((_ref3) => {
              let [columnId, headerSize] = _ref3;
              newColumnSizing[columnId] = Math.round(Math.max(headerSize + headerSize * deltaPercentage, 0) * 100) / 100;
            });
            return {
              ...old,
              deltaOffset,
              deltaPercentage
            };
          });
          if (table.options.columnResizeMode === "onChange" || eventType === "end") {
            table.setColumnSizing((old) => ({
              ...old,
              ...newColumnSizing
            }));
          }
        };
        const onMove = (clientXPos) => updateOffset("move", clientXPos);
        const onEnd = (clientXPos) => {
          updateOffset("end", clientXPos);
          table.setColumnSizingInfo((old) => ({
            ...old,
            isResizingColumn: false,
            startOffset: null,
            startSize: null,
            deltaOffset: null,
            deltaPercentage: null,
            columnSizingStart: []
          }));
        };
        const contextDocument = safelyAccessDocument(_contextDocument);
        const mouseEvents = {
          moveHandler: (e2) => onMove(e2.clientX),
          upHandler: (e2) => {
            contextDocument == null || contextDocument.removeEventListener("mousemove", mouseEvents.moveHandler);
            contextDocument == null || contextDocument.removeEventListener("mouseup", mouseEvents.upHandler);
            onEnd(e2.clientX);
          }
        };
        const touchEvents = {
          moveHandler: (e2) => {
            if (e2.cancelable) {
              e2.preventDefault();
              e2.stopPropagation();
            }
            onMove(e2.touches[0].clientX);
            return false;
          },
          upHandler: (e2) => {
            var _e$touches$;
            contextDocument == null || contextDocument.removeEventListener("touchmove", touchEvents.moveHandler);
            contextDocument == null || contextDocument.removeEventListener("touchend", touchEvents.upHandler);
            if (e2.cancelable) {
              e2.preventDefault();
              e2.stopPropagation();
            }
            onEnd((_e$touches$ = e2.touches[0]) == null ? void 0 : _e$touches$.clientX);
          }
        };
        const passiveIfSupported = passiveEventSupported() ? {
          passive: false
        } : false;
        if (isTouchStartEvent(e)) {
          contextDocument == null || contextDocument.addEventListener("touchmove", touchEvents.moveHandler, passiveIfSupported);
          contextDocument == null || contextDocument.addEventListener("touchend", touchEvents.upHandler, passiveIfSupported);
        } else {
          contextDocument == null || contextDocument.addEventListener("mousemove", mouseEvents.moveHandler, passiveIfSupported);
          contextDocument == null || contextDocument.addEventListener("mouseup", mouseEvents.upHandler, passiveIfSupported);
        }
        table.setColumnSizingInfo((old) => ({
          ...old,
          startOffset: clientX,
          startSize,
          deltaOffset: 0,
          deltaPercentage: 0,
          columnSizingStart,
          isResizingColumn: column.id
        }));
      };
    };
  },
  createTable: (table) => {
    table.setColumnSizing = (updater) => table.options.onColumnSizingChange == null ? void 0 : table.options.onColumnSizingChange(updater);
    table.setColumnSizingInfo = (updater) => table.options.onColumnSizingInfoChange == null ? void 0 : table.options.onColumnSizingInfoChange(updater);
    table.resetColumnSizing = (defaultState) => {
      var _table$initialState$c;
      table.setColumnSizing(defaultState ? {} : (_table$initialState$c = table.initialState.columnSizing) != null ? _table$initialState$c : {});
    };
    table.resetHeaderSizeInfo = (defaultState) => {
      var _table$initialState$c2;
      table.setColumnSizingInfo(defaultState ? getDefaultColumnSizingInfoState() : (_table$initialState$c2 = table.initialState.columnSizingInfo) != null ? _table$initialState$c2 : getDefaultColumnSizingInfoState());
    };
    table.getTotalSize = () => {
      var _table$getHeaderGroup, _table$getHeaderGroup2;
      return (_table$getHeaderGroup = (_table$getHeaderGroup2 = table.getHeaderGroups()[0]) == null ? void 0 : _table$getHeaderGroup2.headers.reduce((sum2, header) => {
        return sum2 + header.getSize();
      }, 0)) != null ? _table$getHeaderGroup : 0;
    };
    table.getLeftTotalSize = () => {
      var _table$getLeftHeaderG, _table$getLeftHeaderG2;
      return (_table$getLeftHeaderG = (_table$getLeftHeaderG2 = table.getLeftHeaderGroups()[0]) == null ? void 0 : _table$getLeftHeaderG2.headers.reduce((sum2, header) => {
        return sum2 + header.getSize();
      }, 0)) != null ? _table$getLeftHeaderG : 0;
    };
    table.getCenterTotalSize = () => {
      var _table$getCenterHeade, _table$getCenterHeade2;
      return (_table$getCenterHeade = (_table$getCenterHeade2 = table.getCenterHeaderGroups()[0]) == null ? void 0 : _table$getCenterHeade2.headers.reduce((sum2, header) => {
        return sum2 + header.getSize();
      }, 0)) != null ? _table$getCenterHeade : 0;
    };
    table.getRightTotalSize = () => {
      var _table$getRightHeader, _table$getRightHeader2;
      return (_table$getRightHeader = (_table$getRightHeader2 = table.getRightHeaderGroups()[0]) == null ? void 0 : _table$getRightHeader2.headers.reduce((sum2, header) => {
        return sum2 + header.getSize();
      }, 0)) != null ? _table$getRightHeader : 0;
    };
  }
};
let passiveSupported = null;
function passiveEventSupported() {
  if (typeof passiveSupported === "boolean") return passiveSupported;
  let supported = false;
  try {
    const options = {
      get passive() {
        supported = true;
        return false;
      }
    };
    const noop2 = () => {
    };
    window.addEventListener("test", noop2, options);
    window.removeEventListener("test", noop2);
  } catch (err) {
    supported = false;
  }
  passiveSupported = supported;
  return passiveSupported;
}
function isTouchStartEvent(e) {
  return e.type === "touchstart";
}
const ColumnVisibility = {
  getInitialState: (state) => {
    return {
      columnVisibility: {},
      ...state
    };
  },
  getDefaultOptions: (table) => {
    return {
      onColumnVisibilityChange: makeStateUpdater("columnVisibility", table)
    };
  },
  createColumn: (column, table) => {
    column.toggleVisibility = (value) => {
      if (column.getCanHide()) {
        table.setColumnVisibility((old) => ({
          ...old,
          [column.id]: value != null ? value : !column.getIsVisible()
        }));
      }
    };
    column.getIsVisible = () => {
      var _ref, _table$getState$colum;
      const childColumns = column.columns;
      return (_ref = childColumns.length ? childColumns.some((c) => c.getIsVisible()) : (_table$getState$colum = table.getState().columnVisibility) == null ? void 0 : _table$getState$colum[column.id]) != null ? _ref : true;
    };
    column.getCanHide = () => {
      var _column$columnDef$ena, _table$options$enable;
      return ((_column$columnDef$ena = column.columnDef.enableHiding) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table.options.enableHiding) != null ? _table$options$enable : true);
    };
    column.getToggleVisibilityHandler = () => {
      return (e) => {
        column.toggleVisibility == null || column.toggleVisibility(e.target.checked);
      };
    };
  },
  createRow: (row, table) => {
    row._getAllVisibleCells = memo(() => [row.getAllCells(), table.getState().columnVisibility], (cells) => {
      return cells.filter((cell) => cell.column.getIsVisible());
    }, getMemoOptions(table.options, "debugRows"));
    row.getVisibleCells = memo(() => [row.getLeftVisibleCells(), row.getCenterVisibleCells(), row.getRightVisibleCells()], (left, center, right) => [...left, ...center, ...right], getMemoOptions(table.options, "debugRows"));
  },
  createTable: (table) => {
    const makeVisibleColumnsMethod = (key, getColumns) => {
      return memo(() => [getColumns(), getColumns().filter((d) => d.getIsVisible()).map((d) => d.id).join("_")], (columns) => {
        return columns.filter((d) => d.getIsVisible == null ? void 0 : d.getIsVisible());
      }, getMemoOptions(table.options, "debugColumns"));
    };
    table.getVisibleFlatColumns = makeVisibleColumnsMethod("getVisibleFlatColumns", () => table.getAllFlatColumns());
    table.getVisibleLeafColumns = makeVisibleColumnsMethod("getVisibleLeafColumns", () => table.getAllLeafColumns());
    table.getLeftVisibleLeafColumns = makeVisibleColumnsMethod("getLeftVisibleLeafColumns", () => table.getLeftLeafColumns());
    table.getRightVisibleLeafColumns = makeVisibleColumnsMethod("getRightVisibleLeafColumns", () => table.getRightLeafColumns());
    table.getCenterVisibleLeafColumns = makeVisibleColumnsMethod("getCenterVisibleLeafColumns", () => table.getCenterLeafColumns());
    table.setColumnVisibility = (updater) => table.options.onColumnVisibilityChange == null ? void 0 : table.options.onColumnVisibilityChange(updater);
    table.resetColumnVisibility = (defaultState) => {
      var _table$initialState$c;
      table.setColumnVisibility(defaultState ? {} : (_table$initialState$c = table.initialState.columnVisibility) != null ? _table$initialState$c : {});
    };
    table.toggleAllColumnsVisible = (value) => {
      var _value;
      value = (_value = value) != null ? _value : !table.getIsAllColumnsVisible();
      table.setColumnVisibility(table.getAllLeafColumns().reduce((obj, column) => ({
        ...obj,
        [column.id]: !value ? !(column.getCanHide != null && column.getCanHide()) : value
      }), {}));
    };
    table.getIsAllColumnsVisible = () => !table.getAllLeafColumns().some((column) => !(column.getIsVisible != null && column.getIsVisible()));
    table.getIsSomeColumnsVisible = () => table.getAllLeafColumns().some((column) => column.getIsVisible == null ? void 0 : column.getIsVisible());
    table.getToggleAllColumnsVisibilityHandler = () => {
      return (e) => {
        var _target;
        table.toggleAllColumnsVisible((_target = e.target) == null ? void 0 : _target.checked);
      };
    };
  }
};
function _getVisibleLeafColumns(table, position) {
  return !position ? table.getVisibleLeafColumns() : position === "center" ? table.getCenterVisibleLeafColumns() : position === "left" ? table.getLeftVisibleLeafColumns() : table.getRightVisibleLeafColumns();
}
const GlobalFaceting = {
  createTable: (table) => {
    table._getGlobalFacetedRowModel = table.options.getFacetedRowModel && table.options.getFacetedRowModel(table, "__global__");
    table.getGlobalFacetedRowModel = () => {
      if (table.options.manualFiltering || !table._getGlobalFacetedRowModel) {
        return table.getPreFilteredRowModel();
      }
      return table._getGlobalFacetedRowModel();
    };
    table._getGlobalFacetedUniqueValues = table.options.getFacetedUniqueValues && table.options.getFacetedUniqueValues(table, "__global__");
    table.getGlobalFacetedUniqueValues = () => {
      if (!table._getGlobalFacetedUniqueValues) {
        return /* @__PURE__ */ new Map();
      }
      return table._getGlobalFacetedUniqueValues();
    };
    table._getGlobalFacetedMinMaxValues = table.options.getFacetedMinMaxValues && table.options.getFacetedMinMaxValues(table, "__global__");
    table.getGlobalFacetedMinMaxValues = () => {
      if (!table._getGlobalFacetedMinMaxValues) {
        return;
      }
      return table._getGlobalFacetedMinMaxValues();
    };
  }
};
const GlobalFiltering = {
  getInitialState: (state) => {
    return {
      globalFilter: void 0,
      ...state
    };
  },
  getDefaultOptions: (table) => {
    return {
      onGlobalFilterChange: makeStateUpdater("globalFilter", table),
      globalFilterFn: "auto",
      getColumnCanGlobalFilter: (column) => {
        var _table$getCoreRowMode;
        const value = (_table$getCoreRowMode = table.getCoreRowModel().flatRows[0]) == null || (_table$getCoreRowMode = _table$getCoreRowMode._getAllCellsByColumnId()[column.id]) == null ? void 0 : _table$getCoreRowMode.getValue();
        return typeof value === "string" || typeof value === "number";
      }
    };
  },
  createColumn: (column, table) => {
    column.getCanGlobalFilter = () => {
      var _column$columnDef$ena, _table$options$enable, _table$options$enable2, _table$options$getCol;
      return ((_column$columnDef$ena = column.columnDef.enableGlobalFilter) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table.options.enableGlobalFilter) != null ? _table$options$enable : true) && ((_table$options$enable2 = table.options.enableFilters) != null ? _table$options$enable2 : true) && ((_table$options$getCol = table.options.getColumnCanGlobalFilter == null ? void 0 : table.options.getColumnCanGlobalFilter(column)) != null ? _table$options$getCol : true) && !!column.accessorFn;
    };
  },
  createTable: (table) => {
    table.getGlobalAutoFilterFn = () => {
      return filterFns.includesString;
    };
    table.getGlobalFilterFn = () => {
      var _table$options$filter, _table$options$filter2;
      const {
        globalFilterFn
      } = table.options;
      return isFunction(globalFilterFn) ? globalFilterFn : globalFilterFn === "auto" ? table.getGlobalAutoFilterFn() : (_table$options$filter = (_table$options$filter2 = table.options.filterFns) == null ? void 0 : _table$options$filter2[globalFilterFn]) != null ? _table$options$filter : filterFns[globalFilterFn];
    };
    table.setGlobalFilter = (updater) => {
      table.options.onGlobalFilterChange == null || table.options.onGlobalFilterChange(updater);
    };
    table.resetGlobalFilter = (defaultState) => {
      table.setGlobalFilter(defaultState ? void 0 : table.initialState.globalFilter);
    };
  }
};
const RowExpanding = {
  getInitialState: (state) => {
    return {
      expanded: {},
      ...state
    };
  },
  getDefaultOptions: (table) => {
    return {
      onExpandedChange: makeStateUpdater("expanded", table),
      paginateExpandedRows: true
    };
  },
  createTable: (table) => {
    let registered = false;
    let queued = false;
    table._autoResetExpanded = () => {
      var _ref, _table$options$autoRe;
      if (!registered) {
        table._queue(() => {
          registered = true;
        });
        return;
      }
      if ((_ref = (_table$options$autoRe = table.options.autoResetAll) != null ? _table$options$autoRe : table.options.autoResetExpanded) != null ? _ref : !table.options.manualExpanding) {
        if (queued) return;
        queued = true;
        table._queue(() => {
          table.resetExpanded();
          queued = false;
        });
      }
    };
    table.setExpanded = (updater) => table.options.onExpandedChange == null ? void 0 : table.options.onExpandedChange(updater);
    table.toggleAllRowsExpanded = (expanded) => {
      if (expanded != null ? expanded : !table.getIsAllRowsExpanded()) {
        table.setExpanded(true);
      } else {
        table.setExpanded({});
      }
    };
    table.resetExpanded = (defaultState) => {
      var _table$initialState$e, _table$initialState;
      table.setExpanded(defaultState ? {} : (_table$initialState$e = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.expanded) != null ? _table$initialState$e : {});
    };
    table.getCanSomeRowsExpand = () => {
      return table.getPrePaginationRowModel().flatRows.some((row) => row.getCanExpand());
    };
    table.getToggleAllRowsExpandedHandler = () => {
      return (e) => {
        e.persist == null || e.persist();
        table.toggleAllRowsExpanded();
      };
    };
    table.getIsSomeRowsExpanded = () => {
      const expanded = table.getState().expanded;
      return expanded === true || Object.values(expanded).some(Boolean);
    };
    table.getIsAllRowsExpanded = () => {
      const expanded = table.getState().expanded;
      if (typeof expanded === "boolean") {
        return expanded === true;
      }
      if (!Object.keys(expanded).length) {
        return false;
      }
      if (table.getRowModel().flatRows.some((row) => !row.getIsExpanded())) {
        return false;
      }
      return true;
    };
    table.getExpandedDepth = () => {
      let maxDepth = 0;
      const rowIds = table.getState().expanded === true ? Object.keys(table.getRowModel().rowsById) : Object.keys(table.getState().expanded);
      rowIds.forEach((id) => {
        const splitId = id.split(".");
        maxDepth = Math.max(maxDepth, splitId.length);
      });
      return maxDepth;
    };
    table.getPreExpandedRowModel = () => table.getSortedRowModel();
    table.getExpandedRowModel = () => {
      if (!table._getExpandedRowModel && table.options.getExpandedRowModel) {
        table._getExpandedRowModel = table.options.getExpandedRowModel(table);
      }
      if (table.options.manualExpanding || !table._getExpandedRowModel) {
        return table.getPreExpandedRowModel();
      }
      return table._getExpandedRowModel();
    };
  },
  createRow: (row, table) => {
    row.toggleExpanded = (expanded) => {
      table.setExpanded((old) => {
        var _expanded;
        const exists = old === true ? true : !!(old != null && old[row.id]);
        let oldExpanded = {};
        if (old === true) {
          Object.keys(table.getRowModel().rowsById).forEach((rowId) => {
            oldExpanded[rowId] = true;
          });
        } else {
          oldExpanded = old;
        }
        expanded = (_expanded = expanded) != null ? _expanded : !exists;
        if (!exists && expanded) {
          return {
            ...oldExpanded,
            [row.id]: true
          };
        }
        if (exists && !expanded) {
          const {
            [row.id]: _,
            ...rest
          } = oldExpanded;
          return rest;
        }
        return old;
      });
    };
    row.getIsExpanded = () => {
      var _table$options$getIsR;
      const expanded = table.getState().expanded;
      return !!((_table$options$getIsR = table.options.getIsRowExpanded == null ? void 0 : table.options.getIsRowExpanded(row)) != null ? _table$options$getIsR : expanded === true || (expanded == null ? void 0 : expanded[row.id]));
    };
    row.getCanExpand = () => {
      var _table$options$getRow, _table$options$enable, _row$subRows;
      return (_table$options$getRow = table.options.getRowCanExpand == null ? void 0 : table.options.getRowCanExpand(row)) != null ? _table$options$getRow : ((_table$options$enable = table.options.enableExpanding) != null ? _table$options$enable : true) && !!((_row$subRows = row.subRows) != null && _row$subRows.length);
    };
    row.getIsAllParentsExpanded = () => {
      let isFullyExpanded = true;
      let currentRow = row;
      while (isFullyExpanded && currentRow.parentId) {
        currentRow = table.getRow(currentRow.parentId, true);
        isFullyExpanded = currentRow.getIsExpanded();
      }
      return isFullyExpanded;
    };
    row.getToggleExpandedHandler = () => {
      const canExpand = row.getCanExpand();
      return () => {
        if (!canExpand) return;
        row.toggleExpanded();
      };
    };
  }
};
const defaultPageIndex = 0;
const defaultPageSize = 10;
const getDefaultPaginationState = () => ({
  pageIndex: defaultPageIndex,
  pageSize: defaultPageSize
});
const RowPagination = {
  getInitialState: (state) => {
    return {
      ...state,
      pagination: {
        ...getDefaultPaginationState(),
        ...state == null ? void 0 : state.pagination
      }
    };
  },
  getDefaultOptions: (table) => {
    return {
      onPaginationChange: makeStateUpdater("pagination", table)
    };
  },
  createTable: (table) => {
    let registered = false;
    let queued = false;
    table._autoResetPageIndex = () => {
      var _ref, _table$options$autoRe;
      if (!registered) {
        table._queue(() => {
          registered = true;
        });
        return;
      }
      if ((_ref = (_table$options$autoRe = table.options.autoResetAll) != null ? _table$options$autoRe : table.options.autoResetPageIndex) != null ? _ref : !table.options.manualPagination) {
        if (queued) return;
        queued = true;
        table._queue(() => {
          table.resetPageIndex();
          queued = false;
        });
      }
    };
    table.setPagination = (updater) => {
      const safeUpdater = (old) => {
        let newState = functionalUpdate(updater, old);
        return newState;
      };
      return table.options.onPaginationChange == null ? void 0 : table.options.onPaginationChange(safeUpdater);
    };
    table.resetPagination = (defaultState) => {
      var _table$initialState$p;
      table.setPagination(defaultState ? getDefaultPaginationState() : (_table$initialState$p = table.initialState.pagination) != null ? _table$initialState$p : getDefaultPaginationState());
    };
    table.setPageIndex = (updater) => {
      table.setPagination((old) => {
        let pageIndex = functionalUpdate(updater, old.pageIndex);
        const maxPageIndex = typeof table.options.pageCount === "undefined" || table.options.pageCount === -1 ? Number.MAX_SAFE_INTEGER : table.options.pageCount - 1;
        pageIndex = Math.max(0, Math.min(pageIndex, maxPageIndex));
        return {
          ...old,
          pageIndex
        };
      });
    };
    table.resetPageIndex = (defaultState) => {
      var _table$initialState$p2, _table$initialState;
      table.setPageIndex(defaultState ? defaultPageIndex : (_table$initialState$p2 = (_table$initialState = table.initialState) == null || (_table$initialState = _table$initialState.pagination) == null ? void 0 : _table$initialState.pageIndex) != null ? _table$initialState$p2 : defaultPageIndex);
    };
    table.resetPageSize = (defaultState) => {
      var _table$initialState$p3, _table$initialState2;
      table.setPageSize(defaultState ? defaultPageSize : (_table$initialState$p3 = (_table$initialState2 = table.initialState) == null || (_table$initialState2 = _table$initialState2.pagination) == null ? void 0 : _table$initialState2.pageSize) != null ? _table$initialState$p3 : defaultPageSize);
    };
    table.setPageSize = (updater) => {
      table.setPagination((old) => {
        const pageSize = Math.max(1, functionalUpdate(updater, old.pageSize));
        const topRowIndex = old.pageSize * old.pageIndex;
        const pageIndex = Math.floor(topRowIndex / pageSize);
        return {
          ...old,
          pageIndex,
          pageSize
        };
      });
    };
    table.setPageCount = (updater) => table.setPagination((old) => {
      var _table$options$pageCo;
      let newPageCount = functionalUpdate(updater, (_table$options$pageCo = table.options.pageCount) != null ? _table$options$pageCo : -1);
      if (typeof newPageCount === "number") {
        newPageCount = Math.max(-1, newPageCount);
      }
      return {
        ...old,
        pageCount: newPageCount
      };
    });
    table.getPageOptions = memo(() => [table.getPageCount()], (pageCount) => {
      let pageOptions = [];
      if (pageCount && pageCount > 0) {
        pageOptions = [...new Array(pageCount)].fill(null).map((_, i) => i);
      }
      return pageOptions;
    }, getMemoOptions(table.options, "debugTable"));
    table.getCanPreviousPage = () => table.getState().pagination.pageIndex > 0;
    table.getCanNextPage = () => {
      const {
        pageIndex
      } = table.getState().pagination;
      const pageCount = table.getPageCount();
      if (pageCount === -1) {
        return true;
      }
      if (pageCount === 0) {
        return false;
      }
      return pageIndex < pageCount - 1;
    };
    table.previousPage = () => {
      return table.setPageIndex((old) => old - 1);
    };
    table.nextPage = () => {
      return table.setPageIndex((old) => {
        return old + 1;
      });
    };
    table.firstPage = () => {
      return table.setPageIndex(0);
    };
    table.lastPage = () => {
      return table.setPageIndex(table.getPageCount() - 1);
    };
    table.getPrePaginationRowModel = () => table.getExpandedRowModel();
    table.getPaginationRowModel = () => {
      if (!table._getPaginationRowModel && table.options.getPaginationRowModel) {
        table._getPaginationRowModel = table.options.getPaginationRowModel(table);
      }
      if (table.options.manualPagination || !table._getPaginationRowModel) {
        return table.getPrePaginationRowModel();
      }
      return table._getPaginationRowModel();
    };
    table.getPageCount = () => {
      var _table$options$pageCo2;
      return (_table$options$pageCo2 = table.options.pageCount) != null ? _table$options$pageCo2 : Math.ceil(table.getRowCount() / table.getState().pagination.pageSize);
    };
    table.getRowCount = () => {
      var _table$options$rowCou;
      return (_table$options$rowCou = table.options.rowCount) != null ? _table$options$rowCou : table.getPrePaginationRowModel().rows.length;
    };
  }
};
const getDefaultRowPinningState = () => ({
  top: [],
  bottom: []
});
const RowPinning = {
  getInitialState: (state) => {
    return {
      rowPinning: getDefaultRowPinningState(),
      ...state
    };
  },
  getDefaultOptions: (table) => {
    return {
      onRowPinningChange: makeStateUpdater("rowPinning", table)
    };
  },
  createRow: (row, table) => {
    row.pin = (position, includeLeafRows, includeParentRows) => {
      const leafRowIds = includeLeafRows ? row.getLeafRows().map((_ref) => {
        let {
          id
        } = _ref;
        return id;
      }) : [];
      const parentRowIds = includeParentRows ? row.getParentRows().map((_ref2) => {
        let {
          id
        } = _ref2;
        return id;
      }) : [];
      const rowIds = /* @__PURE__ */ new Set([...parentRowIds, row.id, ...leafRowIds]);
      table.setRowPinning((old) => {
        var _old$top3, _old$bottom3;
        if (position === "bottom") {
          var _old$top, _old$bottom;
          return {
            top: ((_old$top = old == null ? void 0 : old.top) != null ? _old$top : []).filter((d) => !(rowIds != null && rowIds.has(d))),
            bottom: [...((_old$bottom = old == null ? void 0 : old.bottom) != null ? _old$bottom : []).filter((d) => !(rowIds != null && rowIds.has(d))), ...Array.from(rowIds)]
          };
        }
        if (position === "top") {
          var _old$top2, _old$bottom2;
          return {
            top: [...((_old$top2 = old == null ? void 0 : old.top) != null ? _old$top2 : []).filter((d) => !(rowIds != null && rowIds.has(d))), ...Array.from(rowIds)],
            bottom: ((_old$bottom2 = old == null ? void 0 : old.bottom) != null ? _old$bottom2 : []).filter((d) => !(rowIds != null && rowIds.has(d)))
          };
        }
        return {
          top: ((_old$top3 = old == null ? void 0 : old.top) != null ? _old$top3 : []).filter((d) => !(rowIds != null && rowIds.has(d))),
          bottom: ((_old$bottom3 = old == null ? void 0 : old.bottom) != null ? _old$bottom3 : []).filter((d) => !(rowIds != null && rowIds.has(d)))
        };
      });
    };
    row.getCanPin = () => {
      var _ref3;
      const {
        enableRowPinning,
        enablePinning
      } = table.options;
      if (typeof enableRowPinning === "function") {
        return enableRowPinning(row);
      }
      return (_ref3 = enableRowPinning != null ? enableRowPinning : enablePinning) != null ? _ref3 : true;
    };
    row.getIsPinned = () => {
      const rowIds = [row.id];
      const {
        top,
        bottom
      } = table.getState().rowPinning;
      const isTop = rowIds.some((d) => top == null ? void 0 : top.includes(d));
      const isBottom = rowIds.some((d) => bottom == null ? void 0 : bottom.includes(d));
      return isTop ? "top" : isBottom ? "bottom" : false;
    };
    row.getPinnedIndex = () => {
      var _ref4, _visiblePinnedRowIds$;
      const position = row.getIsPinned();
      if (!position) return -1;
      const visiblePinnedRowIds = (_ref4 = position === "top" ? table.getTopRows() : table.getBottomRows()) == null ? void 0 : _ref4.map((_ref5) => {
        let {
          id
        } = _ref5;
        return id;
      });
      return (_visiblePinnedRowIds$ = visiblePinnedRowIds == null ? void 0 : visiblePinnedRowIds.indexOf(row.id)) != null ? _visiblePinnedRowIds$ : -1;
    };
  },
  createTable: (table) => {
    table.setRowPinning = (updater) => table.options.onRowPinningChange == null ? void 0 : table.options.onRowPinningChange(updater);
    table.resetRowPinning = (defaultState) => {
      var _table$initialState$r, _table$initialState;
      return table.setRowPinning(defaultState ? getDefaultRowPinningState() : (_table$initialState$r = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.rowPinning) != null ? _table$initialState$r : getDefaultRowPinningState());
    };
    table.getIsSomeRowsPinned = (position) => {
      var _pinningState$positio;
      const pinningState = table.getState().rowPinning;
      if (!position) {
        var _pinningState$top, _pinningState$bottom;
        return Boolean(((_pinningState$top = pinningState.top) == null ? void 0 : _pinningState$top.length) || ((_pinningState$bottom = pinningState.bottom) == null ? void 0 : _pinningState$bottom.length));
      }
      return Boolean((_pinningState$positio = pinningState[position]) == null ? void 0 : _pinningState$positio.length);
    };
    table._getPinnedRows = (visibleRows, pinnedRowIds, position) => {
      var _table$options$keepPi;
      const rows = ((_table$options$keepPi = table.options.keepPinnedRows) != null ? _table$options$keepPi : true) ? (
        //get all rows that are pinned even if they would not be otherwise visible
        //account for expanded parent rows, but not pagination or filtering
        (pinnedRowIds != null ? pinnedRowIds : []).map((rowId) => {
          const row = table.getRow(rowId, true);
          return row.getIsAllParentsExpanded() ? row : null;
        })
      ) : (
        //else get only visible rows that are pinned
        (pinnedRowIds != null ? pinnedRowIds : []).map((rowId) => visibleRows.find((row) => row.id === rowId))
      );
      return rows.filter(Boolean).map((d) => ({
        ...d,
        position
      }));
    };
    table.getTopRows = memo(() => [table.getRowModel().rows, table.getState().rowPinning.top], (allRows, topPinnedRowIds) => table._getPinnedRows(allRows, topPinnedRowIds, "top"), getMemoOptions(table.options, "debugRows"));
    table.getBottomRows = memo(() => [table.getRowModel().rows, table.getState().rowPinning.bottom], (allRows, bottomPinnedRowIds) => table._getPinnedRows(allRows, bottomPinnedRowIds, "bottom"), getMemoOptions(table.options, "debugRows"));
    table.getCenterRows = memo(() => [table.getRowModel().rows, table.getState().rowPinning.top, table.getState().rowPinning.bottom], (allRows, top, bottom) => {
      const topAndBottom = /* @__PURE__ */ new Set([...top != null ? top : [], ...bottom != null ? bottom : []]);
      return allRows.filter((d) => !topAndBottom.has(d.id));
    }, getMemoOptions(table.options, "debugRows"));
  }
};
const RowSelection = {
  getInitialState: (state) => {
    return {
      rowSelection: {},
      ...state
    };
  },
  getDefaultOptions: (table) => {
    return {
      onRowSelectionChange: makeStateUpdater("rowSelection", table),
      enableRowSelection: true,
      enableMultiRowSelection: true,
      enableSubRowSelection: true
      // enableGroupingRowSelection: false,
      // isAdditiveSelectEvent: (e: unknown) => !!e.metaKey,
      // isInclusiveSelectEvent: (e: unknown) => !!e.shiftKey,
    };
  },
  createTable: (table) => {
    table.setRowSelection = (updater) => table.options.onRowSelectionChange == null ? void 0 : table.options.onRowSelectionChange(updater);
    table.resetRowSelection = (defaultState) => {
      var _table$initialState$r;
      return table.setRowSelection(defaultState ? {} : (_table$initialState$r = table.initialState.rowSelection) != null ? _table$initialState$r : {});
    };
    table.toggleAllRowsSelected = (value) => {
      table.setRowSelection((old) => {
        value = typeof value !== "undefined" ? value : !table.getIsAllRowsSelected();
        const rowSelection = {
          ...old
        };
        const preGroupedFlatRows = table.getPreGroupedRowModel().flatRows;
        if (value) {
          preGroupedFlatRows.forEach((row) => {
            if (!row.getCanSelect()) {
              return;
            }
            rowSelection[row.id] = true;
          });
        } else {
          preGroupedFlatRows.forEach((row) => {
            delete rowSelection[row.id];
          });
        }
        return rowSelection;
      });
    };
    table.toggleAllPageRowsSelected = (value) => table.setRowSelection((old) => {
      const resolvedValue = typeof value !== "undefined" ? value : !table.getIsAllPageRowsSelected();
      const rowSelection = {
        ...old
      };
      table.getRowModel().rows.forEach((row) => {
        mutateRowIsSelected(rowSelection, row.id, resolvedValue, true, table);
      });
      return rowSelection;
    });
    table.getPreSelectedRowModel = () => table.getCoreRowModel();
    table.getSelectedRowModel = memo(() => [table.getState().rowSelection, table.getCoreRowModel()], (rowSelection, rowModel) => {
      if (!Object.keys(rowSelection).length) {
        return {
          rows: [],
          flatRows: [],
          rowsById: {}
        };
      }
      return selectRowsFn(table, rowModel);
    }, getMemoOptions(table.options, "debugTable"));
    table.getFilteredSelectedRowModel = memo(() => [table.getState().rowSelection, table.getFilteredRowModel()], (rowSelection, rowModel) => {
      if (!Object.keys(rowSelection).length) {
        return {
          rows: [],
          flatRows: [],
          rowsById: {}
        };
      }
      return selectRowsFn(table, rowModel);
    }, getMemoOptions(table.options, "debugTable"));
    table.getGroupedSelectedRowModel = memo(() => [table.getState().rowSelection, table.getSortedRowModel()], (rowSelection, rowModel) => {
      if (!Object.keys(rowSelection).length) {
        return {
          rows: [],
          flatRows: [],
          rowsById: {}
        };
      }
      return selectRowsFn(table, rowModel);
    }, getMemoOptions(table.options, "debugTable"));
    table.getIsAllRowsSelected = () => {
      const preGroupedFlatRows = table.getFilteredRowModel().flatRows;
      const {
        rowSelection
      } = table.getState();
      let isAllRowsSelected = Boolean(preGroupedFlatRows.length && Object.keys(rowSelection).length);
      if (isAllRowsSelected) {
        if (preGroupedFlatRows.some((row) => row.getCanSelect() && !rowSelection[row.id])) {
          isAllRowsSelected = false;
        }
      }
      return isAllRowsSelected;
    };
    table.getIsAllPageRowsSelected = () => {
      const paginationFlatRows = table.getPaginationRowModel().flatRows.filter((row) => row.getCanSelect());
      const {
        rowSelection
      } = table.getState();
      let isAllPageRowsSelected = !!paginationFlatRows.length;
      if (isAllPageRowsSelected && paginationFlatRows.some((row) => !rowSelection[row.id])) {
        isAllPageRowsSelected = false;
      }
      return isAllPageRowsSelected;
    };
    table.getIsSomeRowsSelected = () => {
      var _table$getState$rowSe;
      const totalSelected = Object.keys((_table$getState$rowSe = table.getState().rowSelection) != null ? _table$getState$rowSe : {}).length;
      return totalSelected > 0 && totalSelected < table.getFilteredRowModel().flatRows.length;
    };
    table.getIsSomePageRowsSelected = () => {
      const paginationFlatRows = table.getPaginationRowModel().flatRows;
      return table.getIsAllPageRowsSelected() ? false : paginationFlatRows.filter((row) => row.getCanSelect()).some((d) => d.getIsSelected() || d.getIsSomeSelected());
    };
    table.getToggleAllRowsSelectedHandler = () => {
      return (e) => {
        table.toggleAllRowsSelected(e.target.checked);
      };
    };
    table.getToggleAllPageRowsSelectedHandler = () => {
      return (e) => {
        table.toggleAllPageRowsSelected(e.target.checked);
      };
    };
  },
  createRow: (row, table) => {
    row.toggleSelected = (value, opts) => {
      const isSelected = row.getIsSelected();
      table.setRowSelection((old) => {
        var _opts$selectChildren;
        value = typeof value !== "undefined" ? value : !isSelected;
        if (row.getCanSelect() && isSelected === value) {
          return old;
        }
        const selectedRowIds = {
          ...old
        };
        mutateRowIsSelected(selectedRowIds, row.id, value, (_opts$selectChildren = opts == null ? void 0 : opts.selectChildren) != null ? _opts$selectChildren : true, table);
        return selectedRowIds;
      });
    };
    row.getIsSelected = () => {
      const {
        rowSelection
      } = table.getState();
      return isRowSelected(row, rowSelection);
    };
    row.getIsSomeSelected = () => {
      const {
        rowSelection
      } = table.getState();
      return isSubRowSelected(row, rowSelection) === "some";
    };
    row.getIsAllSubRowsSelected = () => {
      const {
        rowSelection
      } = table.getState();
      return isSubRowSelected(row, rowSelection) === "all";
    };
    row.getCanSelect = () => {
      var _table$options$enable;
      if (typeof table.options.enableRowSelection === "function") {
        return table.options.enableRowSelection(row);
      }
      return (_table$options$enable = table.options.enableRowSelection) != null ? _table$options$enable : true;
    };
    row.getCanSelectSubRows = () => {
      var _table$options$enable2;
      if (typeof table.options.enableSubRowSelection === "function") {
        return table.options.enableSubRowSelection(row);
      }
      return (_table$options$enable2 = table.options.enableSubRowSelection) != null ? _table$options$enable2 : true;
    };
    row.getCanMultiSelect = () => {
      var _table$options$enable3;
      if (typeof table.options.enableMultiRowSelection === "function") {
        return table.options.enableMultiRowSelection(row);
      }
      return (_table$options$enable3 = table.options.enableMultiRowSelection) != null ? _table$options$enable3 : true;
    };
    row.getToggleSelectedHandler = () => {
      const canSelect = row.getCanSelect();
      return (e) => {
        var _target;
        if (!canSelect) return;
        row.toggleSelected((_target = e.target) == null ? void 0 : _target.checked);
      };
    };
  }
};
const mutateRowIsSelected = (selectedRowIds, id, value, includeChildren, table) => {
  var _row$subRows;
  const row = table.getRow(id, true);
  if (value) {
    if (!row.getCanMultiSelect()) {
      Object.keys(selectedRowIds).forEach((key) => delete selectedRowIds[key]);
    }
    if (row.getCanSelect()) {
      selectedRowIds[id] = true;
    }
  } else {
    delete selectedRowIds[id];
  }
  if (includeChildren && (_row$subRows = row.subRows) != null && _row$subRows.length && row.getCanSelectSubRows()) {
    row.subRows.forEach((row2) => mutateRowIsSelected(selectedRowIds, row2.id, value, includeChildren, table));
  }
};
function selectRowsFn(table, rowModel) {
  const rowSelection = table.getState().rowSelection;
  const newSelectedFlatRows = [];
  const newSelectedRowsById = {};
  const recurseRows = function(rows, depth) {
    return rows.map((row) => {
      var _row$subRows2;
      const isSelected = isRowSelected(row, rowSelection);
      if (isSelected) {
        newSelectedFlatRows.push(row);
        newSelectedRowsById[row.id] = row;
      }
      if ((_row$subRows2 = row.subRows) != null && _row$subRows2.length) {
        row = {
          ...row,
          subRows: recurseRows(row.subRows)
        };
      }
      if (isSelected) {
        return row;
      }
    }).filter(Boolean);
  };
  return {
    rows: recurseRows(rowModel.rows),
    flatRows: newSelectedFlatRows,
    rowsById: newSelectedRowsById
  };
}
function isRowSelected(row, selection) {
  var _selection$row$id;
  return (_selection$row$id = selection[row.id]) != null ? _selection$row$id : false;
}
function isSubRowSelected(row, selection, table) {
  var _row$subRows3;
  if (!((_row$subRows3 = row.subRows) != null && _row$subRows3.length)) return false;
  let allChildrenSelected = true;
  let someSelected = false;
  row.subRows.forEach((subRow) => {
    if (someSelected && !allChildrenSelected) {
      return;
    }
    if (subRow.getCanSelect()) {
      if (isRowSelected(subRow, selection)) {
        someSelected = true;
      } else {
        allChildrenSelected = false;
      }
    }
    if (subRow.subRows && subRow.subRows.length) {
      const subRowChildrenSelected = isSubRowSelected(subRow, selection);
      if (subRowChildrenSelected === "all") {
        someSelected = true;
      } else if (subRowChildrenSelected === "some") {
        someSelected = true;
        allChildrenSelected = false;
      } else {
        allChildrenSelected = false;
      }
    }
  });
  return allChildrenSelected ? "all" : someSelected ? "some" : false;
}
const reSplitAlphaNumeric = /([0-9]+)/gm;
const alphanumeric = (rowA, rowB, columnId) => {
  return compareAlphanumeric(toString(rowA.getValue(columnId)).toLowerCase(), toString(rowB.getValue(columnId)).toLowerCase());
};
const alphanumericCaseSensitive = (rowA, rowB, columnId) => {
  return compareAlphanumeric(toString(rowA.getValue(columnId)), toString(rowB.getValue(columnId)));
};
const text = (rowA, rowB, columnId) => {
  return compareBasic(toString(rowA.getValue(columnId)).toLowerCase(), toString(rowB.getValue(columnId)).toLowerCase());
};
const textCaseSensitive = (rowA, rowB, columnId) => {
  return compareBasic(toString(rowA.getValue(columnId)), toString(rowB.getValue(columnId)));
};
const datetime = (rowA, rowB, columnId) => {
  const a = rowA.getValue(columnId);
  const b = rowB.getValue(columnId);
  return a > b ? 1 : a < b ? -1 : 0;
};
const basic = (rowA, rowB, columnId) => {
  return compareBasic(rowA.getValue(columnId), rowB.getValue(columnId));
};
function compareBasic(a, b) {
  return a === b ? 0 : a > b ? 1 : -1;
}
function toString(a) {
  if (typeof a === "number") {
    if (isNaN(a) || a === Infinity || a === -Infinity) {
      return "";
    }
    return String(a);
  }
  if (typeof a === "string") {
    return a;
  }
  return "";
}
function compareAlphanumeric(aStr, bStr) {
  const a = aStr.split(reSplitAlphaNumeric).filter(Boolean);
  const b = bStr.split(reSplitAlphaNumeric).filter(Boolean);
  while (a.length && b.length) {
    const aa = a.shift();
    const bb = b.shift();
    const an = parseInt(aa, 10);
    const bn = parseInt(bb, 10);
    const combo = [an, bn].sort();
    if (isNaN(combo[0])) {
      if (aa > bb) {
        return 1;
      }
      if (bb > aa) {
        return -1;
      }
      continue;
    }
    if (isNaN(combo[1])) {
      return isNaN(an) ? -1 : 1;
    }
    if (an > bn) {
      return 1;
    }
    if (bn > an) {
      return -1;
    }
  }
  return a.length - b.length;
}
const sortingFns = {
  alphanumeric,
  alphanumericCaseSensitive,
  text,
  textCaseSensitive,
  datetime,
  basic
};
const RowSorting = {
  getInitialState: (state) => {
    return {
      sorting: [],
      ...state
    };
  },
  getDefaultColumnDef: () => {
    return {
      sortingFn: "auto",
      sortUndefined: 1
    };
  },
  getDefaultOptions: (table) => {
    return {
      onSortingChange: makeStateUpdater("sorting", table),
      isMultiSortEvent: (e) => {
        return e.shiftKey;
      }
    };
  },
  createColumn: (column, table) => {
    column.getAutoSortingFn = () => {
      const firstRows = table.getFilteredRowModel().flatRows.slice(10);
      let isString = false;
      for (const row of firstRows) {
        const value = row == null ? void 0 : row.getValue(column.id);
        if (Object.prototype.toString.call(value) === "[object Date]") {
          return sortingFns.datetime;
        }
        if (typeof value === "string") {
          isString = true;
          if (value.split(reSplitAlphaNumeric).length > 1) {
            return sortingFns.alphanumeric;
          }
        }
      }
      if (isString) {
        return sortingFns.text;
      }
      return sortingFns.basic;
    };
    column.getAutoSortDir = () => {
      const firstRow = table.getFilteredRowModel().flatRows[0];
      const value = firstRow == null ? void 0 : firstRow.getValue(column.id);
      if (typeof value === "string") {
        return "asc";
      }
      return "desc";
    };
    column.getSortingFn = () => {
      var _table$options$sortin, _table$options$sortin2;
      if (!column) {
        throw new Error();
      }
      return isFunction(column.columnDef.sortingFn) ? column.columnDef.sortingFn : column.columnDef.sortingFn === "auto" ? column.getAutoSortingFn() : (_table$options$sortin = (_table$options$sortin2 = table.options.sortingFns) == null ? void 0 : _table$options$sortin2[column.columnDef.sortingFn]) != null ? _table$options$sortin : sortingFns[column.columnDef.sortingFn];
    };
    column.toggleSorting = (desc, multi) => {
      const nextSortingOrder = column.getNextSortingOrder();
      const hasManualValue = typeof desc !== "undefined" && desc !== null;
      table.setSorting((old) => {
        const existingSorting = old == null ? void 0 : old.find((d) => d.id === column.id);
        const existingIndex = old == null ? void 0 : old.findIndex((d) => d.id === column.id);
        let newSorting = [];
        let sortAction;
        let nextDesc = hasManualValue ? desc : nextSortingOrder === "desc";
        if (old != null && old.length && column.getCanMultiSort() && multi) {
          if (existingSorting) {
            sortAction = "toggle";
          } else {
            sortAction = "add";
          }
        } else {
          if (old != null && old.length && existingIndex !== old.length - 1) {
            sortAction = "replace";
          } else if (existingSorting) {
            sortAction = "toggle";
          } else {
            sortAction = "replace";
          }
        }
        if (sortAction === "toggle") {
          if (!hasManualValue) {
            if (!nextSortingOrder) {
              sortAction = "remove";
            }
          }
        }
        if (sortAction === "add") {
          var _table$options$maxMul;
          newSorting = [...old, {
            id: column.id,
            desc: nextDesc
          }];
          newSorting.splice(0, newSorting.length - ((_table$options$maxMul = table.options.maxMultiSortColCount) != null ? _table$options$maxMul : Number.MAX_SAFE_INTEGER));
        } else if (sortAction === "toggle") {
          newSorting = old.map((d) => {
            if (d.id === column.id) {
              return {
                ...d,
                desc: nextDesc
              };
            }
            return d;
          });
        } else if (sortAction === "remove") {
          newSorting = old.filter((d) => d.id !== column.id);
        } else {
          newSorting = [{
            id: column.id,
            desc: nextDesc
          }];
        }
        return newSorting;
      });
    };
    column.getFirstSortDir = () => {
      var _ref, _column$columnDef$sor;
      const sortDescFirst = (_ref = (_column$columnDef$sor = column.columnDef.sortDescFirst) != null ? _column$columnDef$sor : table.options.sortDescFirst) != null ? _ref : column.getAutoSortDir() === "desc";
      return sortDescFirst ? "desc" : "asc";
    };
    column.getNextSortingOrder = (multi) => {
      var _table$options$enable, _table$options$enable2;
      const firstSortDirection = column.getFirstSortDir();
      const isSorted = column.getIsSorted();
      if (!isSorted) {
        return firstSortDirection;
      }
      if (isSorted !== firstSortDirection && ((_table$options$enable = table.options.enableSortingRemoval) != null ? _table$options$enable : true) && // If enableSortRemove, enable in general
      (multi ? (_table$options$enable2 = table.options.enableMultiRemove) != null ? _table$options$enable2 : true : true)) {
        return false;
      }
      return isSorted === "desc" ? "asc" : "desc";
    };
    column.getCanSort = () => {
      var _column$columnDef$ena, _table$options$enable3;
      return ((_column$columnDef$ena = column.columnDef.enableSorting) != null ? _column$columnDef$ena : true) && ((_table$options$enable3 = table.options.enableSorting) != null ? _table$options$enable3 : true) && !!column.accessorFn;
    };
    column.getCanMultiSort = () => {
      var _ref2, _column$columnDef$ena2;
      return (_ref2 = (_column$columnDef$ena2 = column.columnDef.enableMultiSort) != null ? _column$columnDef$ena2 : table.options.enableMultiSort) != null ? _ref2 : !!column.accessorFn;
    };
    column.getIsSorted = () => {
      var _table$getState$sorti;
      const columnSort = (_table$getState$sorti = table.getState().sorting) == null ? void 0 : _table$getState$sorti.find((d) => d.id === column.id);
      return !columnSort ? false : columnSort.desc ? "desc" : "asc";
    };
    column.getSortIndex = () => {
      var _table$getState$sorti2, _table$getState$sorti3;
      return (_table$getState$sorti2 = (_table$getState$sorti3 = table.getState().sorting) == null ? void 0 : _table$getState$sorti3.findIndex((d) => d.id === column.id)) != null ? _table$getState$sorti2 : -1;
    };
    column.clearSorting = () => {
      table.setSorting((old) => old != null && old.length ? old.filter((d) => d.id !== column.id) : []);
    };
    column.getToggleSortingHandler = () => {
      const canSort = column.getCanSort();
      return (e) => {
        if (!canSort) return;
        e.persist == null || e.persist();
        column.toggleSorting == null || column.toggleSorting(void 0, column.getCanMultiSort() ? table.options.isMultiSortEvent == null ? void 0 : table.options.isMultiSortEvent(e) : false);
      };
    };
  },
  createTable: (table) => {
    table.setSorting = (updater) => table.options.onSortingChange == null ? void 0 : table.options.onSortingChange(updater);
    table.resetSorting = (defaultState) => {
      var _table$initialState$s, _table$initialState;
      table.setSorting(defaultState ? [] : (_table$initialState$s = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.sorting) != null ? _table$initialState$s : []);
    };
    table.getPreSortedRowModel = () => table.getGroupedRowModel();
    table.getSortedRowModel = () => {
      if (!table._getSortedRowModel && table.options.getSortedRowModel) {
        table._getSortedRowModel = table.options.getSortedRowModel(table);
      }
      if (table.options.manualSorting || !table._getSortedRowModel) {
        return table.getPreSortedRowModel();
      }
      return table._getSortedRowModel();
    };
  }
};
const builtInFeatures = [
  Headers,
  ColumnVisibility,
  ColumnOrdering,
  ColumnPinning,
  ColumnFaceting,
  ColumnFiltering,
  GlobalFaceting,
  //depends on ColumnFaceting
  GlobalFiltering,
  //depends on ColumnFiltering
  RowSorting,
  ColumnGrouping,
  //depends on RowSorting
  RowExpanding,
  RowPagination,
  RowPinning,
  RowSelection,
  ColumnSizing
];
function createTable(options) {
  var _options$_features, _options$initialState;
  const _features = [...builtInFeatures, ...(_options$_features = options._features) != null ? _options$_features : []];
  let table = {
    _features
  };
  const defaultOptions = table._features.reduce((obj, feature) => {
    return Object.assign(obj, feature.getDefaultOptions == null ? void 0 : feature.getDefaultOptions(table));
  }, {});
  const mergeOptions = (options2) => {
    if (table.options.mergeOptions) {
      return table.options.mergeOptions(defaultOptions, options2);
    }
    return {
      ...defaultOptions,
      ...options2
    };
  };
  const coreInitialState = {};
  let initialState = {
    ...coreInitialState,
    ...(_options$initialState = options.initialState) != null ? _options$initialState : {}
  };
  table._features.forEach((feature) => {
    var _feature$getInitialSt;
    initialState = (_feature$getInitialSt = feature.getInitialState == null ? void 0 : feature.getInitialState(initialState)) != null ? _feature$getInitialSt : initialState;
  });
  const queued = [];
  let queuedTimeout = false;
  const coreInstance = {
    _features,
    options: {
      ...defaultOptions,
      ...options
    },
    initialState,
    _queue: (cb) => {
      queued.push(cb);
      if (!queuedTimeout) {
        queuedTimeout = true;
        Promise.resolve().then(() => {
          while (queued.length) {
            queued.shift()();
          }
          queuedTimeout = false;
        }).catch((error) => setTimeout(() => {
          throw error;
        }));
      }
    },
    reset: () => {
      table.setState(table.initialState);
    },
    setOptions: (updater) => {
      const newOptions = functionalUpdate(updater, table.options);
      table.options = mergeOptions(newOptions);
    },
    getState: () => {
      return table.options.state;
    },
    setState: (updater) => {
      table.options.onStateChange == null || table.options.onStateChange(updater);
    },
    _getRowId: (row, index, parent) => {
      var _table$options$getRow;
      return (_table$options$getRow = table.options.getRowId == null ? void 0 : table.options.getRowId(row, index, parent)) != null ? _table$options$getRow : `${parent ? [parent.id, index].join(".") : index}`;
    },
    getCoreRowModel: () => {
      if (!table._getCoreRowModel) {
        table._getCoreRowModel = table.options.getCoreRowModel(table);
      }
      return table._getCoreRowModel();
    },
    // The final calls start at the bottom of the model,
    // expanded rows, which then work their way up
    getRowModel: () => {
      return table.getPaginationRowModel();
    },
    //in next version, we should just pass in the row model as the optional 2nd arg
    getRow: (id, searchAll) => {
      let row = (searchAll ? table.getPrePaginationRowModel() : table.getRowModel()).rowsById[id];
      if (!row) {
        row = table.getCoreRowModel().rowsById[id];
        if (!row) {
          throw new Error();
        }
      }
      return row;
    },
    _getDefaultColumnDef: memo(() => [table.options.defaultColumn], (defaultColumn) => {
      var _defaultColumn;
      defaultColumn = (_defaultColumn = defaultColumn) != null ? _defaultColumn : {};
      return {
        header: (props) => {
          const resolvedColumnDef = props.header.column.columnDef;
          if (resolvedColumnDef.accessorKey) {
            return resolvedColumnDef.accessorKey;
          }
          if (resolvedColumnDef.accessorFn) {
            return resolvedColumnDef.id;
          }
          return null;
        },
        // footer: props => props.header.column.id,
        cell: (props) => {
          var _props$renderValue$to, _props$renderValue;
          return (_props$renderValue$to = (_props$renderValue = props.renderValue()) == null || _props$renderValue.toString == null ? void 0 : _props$renderValue.toString()) != null ? _props$renderValue$to : null;
        },
        ...table._features.reduce((obj, feature) => {
          return Object.assign(obj, feature.getDefaultColumnDef == null ? void 0 : feature.getDefaultColumnDef());
        }, {}),
        ...defaultColumn
      };
    }, getMemoOptions(options, "debugColumns")),
    _getColumnDefs: () => table.options.columns,
    getAllColumns: memo(() => [table._getColumnDefs()], (columnDefs) => {
      const recurseColumns = function(columnDefs2, parent, depth) {
        if (depth === void 0) {
          depth = 0;
        }
        return columnDefs2.map((columnDef) => {
          const column = createColumn(table, columnDef, depth, parent);
          const groupingColumnDef = columnDef;
          column.columns = groupingColumnDef.columns ? recurseColumns(groupingColumnDef.columns, column, depth + 1) : [];
          return column;
        });
      };
      return recurseColumns(columnDefs);
    }, getMemoOptions(options, "debugColumns")),
    getAllFlatColumns: memo(() => [table.getAllColumns()], (allColumns) => {
      return allColumns.flatMap((column) => {
        return column.getFlatColumns();
      });
    }, getMemoOptions(options, "debugColumns")),
    _getAllFlatColumnsById: memo(() => [table.getAllFlatColumns()], (flatColumns) => {
      return flatColumns.reduce((acc, column) => {
        acc[column.id] = column;
        return acc;
      }, {});
    }, getMemoOptions(options, "debugColumns")),
    getAllLeafColumns: memo(() => [table.getAllColumns(), table._getOrderColumnsFn()], (allColumns, orderColumns2) => {
      let leafColumns = allColumns.flatMap((column) => column.getLeafColumns());
      return orderColumns2(leafColumns);
    }, getMemoOptions(options, "debugColumns")),
    getColumn: (columnId) => {
      const column = table._getAllFlatColumnsById()[columnId];
      return column;
    }
  };
  Object.assign(table, coreInstance);
  for (let index = 0; index < table._features.length; index++) {
    const feature = table._features[index];
    feature == null || feature.createTable == null || feature.createTable(table);
  }
  return table;
}
function getCoreRowModel() {
  return (table) => memo(() => [table.options.data], (data) => {
    const rowModel = {
      rows: [],
      flatRows: [],
      rowsById: {}
    };
    const accessRows = function(originalRows, depth, parentRow) {
      if (depth === void 0) {
        depth = 0;
      }
      const rows = [];
      for (let i = 0; i < originalRows.length; i++) {
        const row = createRow(table, table._getRowId(originalRows[i], i, parentRow), originalRows[i], i, depth, void 0, parentRow == null ? void 0 : parentRow.id);
        rowModel.flatRows.push(row);
        rowModel.rowsById[row.id] = row;
        rows.push(row);
        if (table.options.getSubRows) {
          var _row$originalSubRows;
          row.originalSubRows = table.options.getSubRows(originalRows[i], i);
          if ((_row$originalSubRows = row.originalSubRows) != null && _row$originalSubRows.length) {
            row.subRows = accessRows(row.originalSubRows, depth + 1, row);
          }
        }
      }
      return rows;
    };
    rowModel.rows = accessRows(data);
    return rowModel;
  }, getMemoOptions(table.options, "debugTable", "getRowModel", () => table._autoResetPageIndex()));
}
function filterRows(rows, filterRowImpl, table) {
  if (table.options.filterFromLeafRows) {
    return filterRowModelFromLeafs(rows, filterRowImpl, table);
  }
  return filterRowModelFromRoot(rows, filterRowImpl, table);
}
function filterRowModelFromLeafs(rowsToFilter, filterRow, table) {
  var _table$options$maxLea;
  const newFilteredFlatRows = [];
  const newFilteredRowsById = {};
  const maxDepth = (_table$options$maxLea = table.options.maxLeafRowFilterDepth) != null ? _table$options$maxLea : 100;
  const recurseFilterRows = function(rowsToFilter2, depth) {
    if (depth === void 0) {
      depth = 0;
    }
    const rows = [];
    for (let i = 0; i < rowsToFilter2.length; i++) {
      var _row$subRows;
      let row = rowsToFilter2[i];
      const newRow = createRow(table, row.id, row.original, row.index, row.depth, void 0, row.parentId);
      newRow.columnFilters = row.columnFilters;
      if ((_row$subRows = row.subRows) != null && _row$subRows.length && depth < maxDepth) {
        newRow.subRows = recurseFilterRows(row.subRows, depth + 1);
        row = newRow;
        if (filterRow(row) && !newRow.subRows.length) {
          rows.push(row);
          newFilteredRowsById[row.id] = row;
          newFilteredFlatRows.push(row);
          continue;
        }
        if (filterRow(row) || newRow.subRows.length) {
          rows.push(row);
          newFilteredRowsById[row.id] = row;
          newFilteredFlatRows.push(row);
          continue;
        }
      } else {
        row = newRow;
        if (filterRow(row)) {
          rows.push(row);
          newFilteredRowsById[row.id] = row;
          newFilteredFlatRows.push(row);
        }
      }
    }
    return rows;
  };
  return {
    rows: recurseFilterRows(rowsToFilter),
    flatRows: newFilteredFlatRows,
    rowsById: newFilteredRowsById
  };
}
function filterRowModelFromRoot(rowsToFilter, filterRow, table) {
  var _table$options$maxLea2;
  const newFilteredFlatRows = [];
  const newFilteredRowsById = {};
  const maxDepth = (_table$options$maxLea2 = table.options.maxLeafRowFilterDepth) != null ? _table$options$maxLea2 : 100;
  const recurseFilterRows = function(rowsToFilter2, depth) {
    if (depth === void 0) {
      depth = 0;
    }
    const rows = [];
    for (let i = 0; i < rowsToFilter2.length; i++) {
      let row = rowsToFilter2[i];
      const pass = filterRow(row);
      if (pass) {
        var _row$subRows2;
        if ((_row$subRows2 = row.subRows) != null && _row$subRows2.length && depth < maxDepth) {
          const newRow = createRow(table, row.id, row.original, row.index, row.depth, void 0, row.parentId);
          newRow.subRows = recurseFilterRows(row.subRows, depth + 1);
          row = newRow;
        }
        rows.push(row);
        newFilteredFlatRows.push(row);
        newFilteredRowsById[row.id] = row;
      }
    }
    return rows;
  };
  return {
    rows: recurseFilterRows(rowsToFilter),
    flatRows: newFilteredFlatRows,
    rowsById: newFilteredRowsById
  };
}
function getFilteredRowModel() {
  return (table) => memo(() => [table.getPreFilteredRowModel(), table.getState().columnFilters, table.getState().globalFilter], (rowModel, columnFilters, globalFilter) => {
    if (!rowModel.rows.length || !(columnFilters != null && columnFilters.length) && !globalFilter) {
      for (let i = 0; i < rowModel.flatRows.length; i++) {
        rowModel.flatRows[i].columnFilters = {};
        rowModel.flatRows[i].columnFiltersMeta = {};
      }
      return rowModel;
    }
    const resolvedColumnFilters = [];
    const resolvedGlobalFilters = [];
    (columnFilters != null ? columnFilters : []).forEach((d) => {
      var _filterFn$resolveFilt;
      const column = table.getColumn(d.id);
      if (!column) {
        return;
      }
      const filterFn = column.getFilterFn();
      if (!filterFn) {
        return;
      }
      resolvedColumnFilters.push({
        id: d.id,
        filterFn,
        resolvedValue: (_filterFn$resolveFilt = filterFn.resolveFilterValue == null ? void 0 : filterFn.resolveFilterValue(d.value)) != null ? _filterFn$resolveFilt : d.value
      });
    });
    const filterableIds = (columnFilters != null ? columnFilters : []).map((d) => d.id);
    const globalFilterFn = table.getGlobalFilterFn();
    const globallyFilterableColumns = table.getAllLeafColumns().filter((column) => column.getCanGlobalFilter());
    if (globalFilter && globalFilterFn && globallyFilterableColumns.length) {
      filterableIds.push("__global__");
      globallyFilterableColumns.forEach((column) => {
        var _globalFilterFn$resol;
        resolvedGlobalFilters.push({
          id: column.id,
          filterFn: globalFilterFn,
          resolvedValue: (_globalFilterFn$resol = globalFilterFn.resolveFilterValue == null ? void 0 : globalFilterFn.resolveFilterValue(globalFilter)) != null ? _globalFilterFn$resol : globalFilter
        });
      });
    }
    let currentColumnFilter;
    let currentGlobalFilter;
    for (let j = 0; j < rowModel.flatRows.length; j++) {
      const row = rowModel.flatRows[j];
      row.columnFilters = {};
      if (resolvedColumnFilters.length) {
        for (let i = 0; i < resolvedColumnFilters.length; i++) {
          currentColumnFilter = resolvedColumnFilters[i];
          const id = currentColumnFilter.id;
          row.columnFilters[id] = currentColumnFilter.filterFn(row, id, currentColumnFilter.resolvedValue, (filterMeta) => {
            row.columnFiltersMeta[id] = filterMeta;
          });
        }
      }
      if (resolvedGlobalFilters.length) {
        for (let i = 0; i < resolvedGlobalFilters.length; i++) {
          currentGlobalFilter = resolvedGlobalFilters[i];
          const id = currentGlobalFilter.id;
          if (currentGlobalFilter.filterFn(row, id, currentGlobalFilter.resolvedValue, (filterMeta) => {
            row.columnFiltersMeta[id] = filterMeta;
          })) {
            row.columnFilters.__global__ = true;
            break;
          }
        }
        if (row.columnFilters.__global__ !== true) {
          row.columnFilters.__global__ = false;
        }
      }
    }
    const filterRowsImpl = (row) => {
      for (let i = 0; i < filterableIds.length; i++) {
        if (row.columnFilters[filterableIds[i]] === false) {
          return false;
        }
      }
      return true;
    };
    return filterRows(rowModel.rows, filterRowsImpl, table);
  }, getMemoOptions(table.options, "debugTable", "getFilteredRowModel", () => table._autoResetPageIndex()));
}
function getSortedRowModel() {
  return (table) => memo(() => [table.getState().sorting, table.getPreSortedRowModel()], (sorting, rowModel) => {
    if (!rowModel.rows.length || !(sorting != null && sorting.length)) {
      return rowModel;
    }
    const sortingState = table.getState().sorting;
    const sortedFlatRows = [];
    const availableSorting = sortingState.filter((sort) => {
      var _table$getColumn;
      return (_table$getColumn = table.getColumn(sort.id)) == null ? void 0 : _table$getColumn.getCanSort();
    });
    const columnInfoById = {};
    availableSorting.forEach((sortEntry) => {
      const column = table.getColumn(sortEntry.id);
      if (!column) return;
      columnInfoById[sortEntry.id] = {
        sortUndefined: column.columnDef.sortUndefined,
        invertSorting: column.columnDef.invertSorting,
        sortingFn: column.getSortingFn()
      };
    });
    const sortData = (rows) => {
      const sortedData = rows.map((row) => ({
        ...row
      }));
      sortedData.sort((rowA, rowB) => {
        for (let i = 0; i < availableSorting.length; i += 1) {
          var _sortEntry$desc;
          const sortEntry = availableSorting[i];
          const columnInfo = columnInfoById[sortEntry.id];
          const sortUndefined = columnInfo.sortUndefined;
          const isDesc = (_sortEntry$desc = sortEntry == null ? void 0 : sortEntry.desc) != null ? _sortEntry$desc : false;
          let sortInt = 0;
          if (sortUndefined) {
            const aValue = rowA.getValue(sortEntry.id);
            const bValue = rowB.getValue(sortEntry.id);
            const aUndefined = aValue === void 0;
            const bUndefined = bValue === void 0;
            if (aUndefined || bUndefined) {
              if (sortUndefined === "first") return aUndefined ? -1 : 1;
              if (sortUndefined === "last") return aUndefined ? 1 : -1;
              sortInt = aUndefined && bUndefined ? 0 : aUndefined ? sortUndefined : -sortUndefined;
            }
          }
          if (sortInt === 0) {
            sortInt = columnInfo.sortingFn(rowA, rowB, sortEntry.id);
          }
          if (sortInt !== 0) {
            if (isDesc) {
              sortInt *= -1;
            }
            if (columnInfo.invertSorting) {
              sortInt *= -1;
            }
            return sortInt;
          }
        }
        return rowA.index - rowB.index;
      });
      sortedData.forEach((row) => {
        var _row$subRows;
        sortedFlatRows.push(row);
        if ((_row$subRows = row.subRows) != null && _row$subRows.length) {
          row.subRows = sortData(row.subRows);
        }
      });
      return sortedData;
    };
    return {
      rows: sortData(rowModel.rows),
      flatRows: sortedFlatRows,
      rowsById: rowModel.rowsById
    };
  }, getMemoOptions(table.options, "debugTable", "getSortedRowModel", () => table._autoResetPageIndex()));
}

/**
   * react-table
   *
   * Copyright (c) TanStack
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   */

//

/**
 * If rendering headers, cells, or footers with custom markup, use flexRender instead of `cell.getValue()` or `cell.renderValue()`.
 */
function flexRender(Comp, props) {
  return !Comp ? null : isReactComponent(Comp) ? /*#__PURE__*/dashboard__loadShare__react__loadShare__.createElement(Comp, props) : Comp;
}
function isReactComponent(component) {
  return isClassComponent(component) || typeof component === 'function' || isExoticComponent(component);
}
function isClassComponent(component) {
  return typeof component === 'function' && (() => {
    const proto = Object.getPrototypeOf(component);
    return proto.prototype && proto.prototype.isReactComponent;
  })();
}
function isExoticComponent(component) {
  return typeof component === 'object' && typeof component.$$typeof === 'symbol' && ['react.memo', 'react.forward_ref'].includes(component.$$typeof.description);
}
function useReactTable(options) {
  // Compose in the generic options to the user options
  const resolvedOptions = {
    state: {},
    // Dummy state
    onStateChange: () => {},
    // noop
    renderFallbackValue: null,
    ...options
  };

  // Create a new table and store it in state
  const [tableRef] = dashboard__loadShare__react__loadShare__.useState(() => ({
    current: createTable(resolvedOptions)
  }));

  // By default, manage table state here using the table's initial state
  const [state, setState] = dashboard__loadShare__react__loadShare__.useState(() => tableRef.current.initialState);

  // Compose the default state above with any user state. This will allow the user
  // to only control a subset of the state if desired.
  tableRef.current.setOptions(prev => ({
    ...prev,
    ...options,
    state: {
      ...state,
      ...options.state
    },
    // Similarly, we'll maintain both our internal state and any user-provided
    // state.
    onStateChange: updater => {
      setState(updater);
      options.onStateChange == null || options.onStateChange(updater);
    }
  }));
  return tableRef.current;
}

//#region src/components/data-table/BaseTableContent.tsx
function BaseTableContent({ className, emptyState, footer, getCellProps, getRowProps, header, isLoading, loadingState, onRowClick, pagination, table }) {
	return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
		className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn(className),
		children: [
			header && /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
				className: "mb-4",
				children: header
			}),
			/* @__PURE__ */ jsxRuntimeExports.jsx("div", {
				className: "sm:-mx-8 scrollbar -mx-4 flex overflow-auto",
				children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
					className: "mx-4 grow sm:mx-8",
					children: /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Table, { children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableHeader, { children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableRow, { children: headerGroup.headers.map((header$1) => {
						return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableHead, {
							className: header$1.column.columnDef.meta?.headerClassName,
							children: header$1.isPlaceholder ? null : flexRender(header$1.column.columnDef.header, header$1.getContext())
						}, header$1.id);
					}) }, headerGroup.id)) }), /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableBody, { children: isLoading ? loadingState : table.getRowModel().rows.length > 0 ? table.getRowModel().rows.map((row) => {
						const rowProps = getRowProps?.(row) || {};
						if (onRowClick) {
							rowProps.onClick = () => onRowClick(row);
							rowProps.tabIndex = 0;
							rowProps.role = "button";
							rowProps.onKeyDown = (e) => {
								if (e.key === "Enter" || e.key === " ") {
									if (e.key === " ") e.preventDefault();
									onRowClick(row);
								}
							};
							rowProps.className = [rowProps.className, "cursor-pointer hover:bg-muted"].filter(Boolean).join(" ");
						}
						return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableRow, {
							...rowProps,
							children: row.getVisibleCells().map((cell) => /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableCell, {
								className: [cell.column.columnDef.meta?.cellClassName].filter(Boolean).join(" "),
								...getCellProps?.(cell),
								children: flexRender(cell.column.columnDef.cell, cell.getContext())
							}, cell.id))
						}, row.id);
					}) : emptyState })] })
				})
			}),
			footer && /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
				className: "mt-4",
				children: footer
			}),
			pagination && /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
				className: "mt-4",
				children: pagination
			})
		]
	});
}

//#region src/components/data-table/Table.context.tsx
const TableContext = dashboard__loadShare__react__loadShare__.createContext(void 0);
function CreateTableProvider({ actionColumn, children, columns, data }) {
	const tableColumns = dashboard__loadShare__react__loadShare__.useMemo(() => {
		const cols = [...columns];
		if (actionColumn) cols.push({
			...actionColumn,
			cell: (props) => actionColumn.cell(props),
			id: actionColumn.id || "actions",
			size: actionColumn.size
		});
		return cols;
	}, [columns, actionColumn]);
	const table = useReactTable({
		columns: tableColumns,
		data,
		getCoreRowModel: getCoreRowModel()
	});
	return /* @__PURE__ */ jsxRuntimeExports.jsx(TableProvider, {
		table,
		children
	});
}
function TableProvider({ children, table }) {
	const value = dashboard__loadShare__react__loadShare__.useMemo(() => ({ table }), [table]);
	return /* @__PURE__ */ jsxRuntimeExports.jsx(TableContext.Provider, {
		value,
		children
	});
}
const useTable = () => {
	const context = dashboard__loadShare__react__loadShare__.useContext(TableContext);
	if (context === void 0) throw new Error("useTable must be used within a TableProvider");
	return context;
};
dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.registerBridgedContext(TableContext);

/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$8 = [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]];
const ChevronDown = createLucideIcon("chevron-down", __iconNode$8);

/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$7 = [
  ["path", { d: "m11 17-5-5 5-5", key: "13zhaf" }],
  ["path", { d: "m18 17-5-5 5-5", key: "h8a8et" }]
];
const ChevronsLeft = createLucideIcon("chevrons-left", __iconNode$7);

/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$6 = [
  ["path", { d: "m6 17 5-5-5-5", key: "xnjwq" }],
  ["path", { d: "m13 17 5-5-5-5", key: "17xmmf" }]
];
const ChevronsRight = createLucideIcon("chevrons-right", __iconNode$6);

/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$5 = [["circle", { cx: "12.1", cy: "12.1", r: "1", key: "18d7e5" }]];
const Dot = createLucideIcon("dot", __iconNode$5);

/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$4 = [
  ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }],
  ["circle", { cx: "19", cy: "12", r: "1", key: "1wjl8i" }],
  ["circle", { cx: "5", cy: "12", r: "1", key: "1pcz8c" }]
];
const Ellipsis = createLucideIcon("ellipsis", __iconNode$4);

/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$3 = [
  ["rect", { width: "7", height: "7", x: "3", y: "3", rx: "1", key: "1g98yp" }],
  ["rect", { width: "7", height: "7", x: "14", y: "3", rx: "1", key: "6d4xhi" }],
  ["rect", { width: "7", height: "7", x: "14", y: "14", rx: "1", key: "nxv5o0" }],
  ["rect", { width: "7", height: "7", x: "3", y: "14", rx: "1", key: "1bb6yr" }]
];
const LayoutGrid = createLucideIcon("layout-grid", __iconNode$3);

/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$2 = [
  ["path", { d: "m16 17 5-5-5-5", key: "1bji2h" }],
  ["path", { d: "M21 12H9", key: "dn1m92" }],
  ["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", key: "1uf3rs" }]
];
const LogOut = createLucideIcon("log-out", __iconNode$2);

/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$1 = [
  ["path", { d: "M4 12h16", key: "1lakjw" }],
  ["path", { d: "M4 18h16", key: "19g7jn" }],
  ["path", { d: "M4 6h16", key: "1o0s65" }]
];
const Menu = createLucideIcon("menu", __iconNode$1);

/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode = [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
];
const User = createLucideIcon("user", __iconNode);

//#region src/components/data-table/DefaultPagination.tsx
function DefaultPagination() {
	const { table } = useTable();
	const pageIndex = table.getState().pagination.pageIndex;
	const pageCount = table.getPageCount();
	return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
		className: "flex items-center justify-center gap-4",
		children: [
			/* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
					"aria-label": "First page",
					disabled: !table.getCanPreviousPage(),
					onClick: () => table.setPageIndex(0),
					size: "sm",
					variant: "outline",
					children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsLeft, { className: "h-4 w-4" })
				}), /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
					"aria-label": "Previous page",
					disabled: !table.getCanPreviousPage(),
					onClick: () => table.previousPage(),
					size: "sm",
					variant: "outline",
					children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" })
				})]
			}),
			/* @__PURE__ */ jsxRuntimeExports.jsx("span", {
				className: "text-sm font-medium",
				children: pageCount > 0 ? `Page ${pageIndex + 1} of ${pageCount}` : "No pages"
			}),
			/* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
					"aria-label": "Next page",
					disabled: !table.getCanNextPage(),
					onClick: () => table.nextPage(),
					size: "sm",
					variant: "outline",
					children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
				}), /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
					"aria-label": "Last page",
					disabled: !table.getCanNextPage(),
					onClick: () => table.setPageIndex(Math.max(0, pageCount - 1)),
					size: "sm",
					variant: "outline",
					children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsRight, { className: "h-4 w-4" })
				})]
			})
		]
	});
}

//#region src/components/data-table/EmptyState.tsx
function TableEmptyState({ children, colSpan, message = "No data available" }) {
	return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableCell, {
		className: "py-8 text-center",
		colSpan,
		children: children || message
	}) });
}

//#region src/components/SkeletonLoader.tsx
function SkeletonLoader({ className, cols = 3, layout = "default", rows = 3, showHeader = true, table }) {
	const renderTableSkeleton = () => {
		if (!table) {
			console.warn("Table object is required for table layout");
			return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {});
		}
		return /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Table, {
			className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("w-full border-collapse", className),
			children: [showHeader && /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableHeader, { children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableRow, {
				className: "border-none",
				children: headerGroup.headers.map((header) => /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableHead, {
					className: "border-none",
					style: { width: header.getSize() },
					children: header.isPlaceholder ? /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Skeleton, { className: "h-4 w-full" }) : flexRender(header.column.columnDef.header, header.getContext())
				}, header.id))
			}, headerGroup.id)) }), /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableBody, { children: Array.from({ length: rows }).map((_, rowIndex) => /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableRow, {
				className: "border-none",
				children: table.getAllColumns().map((column) => /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableCell, {
					className: "border-none",
					children: /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Skeleton, { className: "h-4 w-full" })
				}, column.id))
			}, rowIndex)) })]
		});
	};
	const renderCardSkeleton = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
		className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("space-y-2", className),
		children: [
			/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Skeleton, { className: "h-40 w-full" }),
			/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Skeleton, { className: "h-4 w-3/4" }),
			/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Skeleton, { className: "h-4 w-1/2" })
		]
	});
	const renderListSkeleton = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
		className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("flex items-center space-x-4", className),
		children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Skeleton, { className: "h-12 w-12 rounded-full" }), /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
			className: "space-y-2",
			children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Skeleton, { className: "h-4 w-[200px]" }), /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Skeleton, { className: "h-4 w-[150px]" })]
		})]
	});
	const renderProfileSkeleton = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
		className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("space-y-4", className),
		children: [
			/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Skeleton, { className: "h-20 w-20 rounded-full" }),
			/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Skeleton, { className: "h-4 w-[150px]" }),
			/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Skeleton, { className: "h-4 w-[200px]" })
		]
	});
	const renderCustomSkeleton = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
		className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn(`grid grid-cols-${cols} gap-4`, className),
		children: Array.from({ length: cols * rows }).map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Skeleton, { className: "h-4 w-full" }, index))
	});
	const renderDefaultSkeleton = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
		className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("space-y-2", className),
		children: [
			/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Skeleton, { className: "h-4 w-full" }),
			/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Skeleton, { className: "h-4 w-5/6" }),
			/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Skeleton, { className: "h-4 w-4/6" })
		]
	});
	switch (layout) {
		case "card": return renderCardSkeleton();
		case "custom": return renderCustomSkeleton();
		case "list": return renderListSkeleton();
		case "profile": return renderProfileSkeleton();
		case "table": return renderTableSkeleton();
		default: return renderDefaultSkeleton();
	}
}

//#region src/components/data-table/LoadingState.tsx
function TableLoadingState({ children, colSpan, message = "Loading data..." }) {
	const { table } = useTable();
	if (children) return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableCell, {
		className: "py-8 text-center",
		colSpan,
		children
	}) });
	return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableCell, {
		className: "pb-4 text-center",
		colSpan,
		children: message
	}) }), /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TableCell, {
		className: "py-8",
		colSpan,
		children: /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonLoader, {
			layout: "table",
			table
		})
	}) })] });
}

//#region src/components/data-table/tableOptions.tsx
function normalizeTableOptions(pagination, emptyState, emptyStateMessage, loadingState, loadingStateMessage, table) {
	let paginationComponent = null;
	const paginationEnabled = pagination !== false && (pagination === true || typeof pagination === "object" && pagination.enabled === true);
	const colSpan = table.getAllColumns().length;
	if (paginationEnabled) if (typeof pagination === "object" && pagination.component) paginationComponent = pagination.component;
	else paginationComponent = /* @__PURE__ */ jsxRuntimeExports.jsx(DefaultPagination, {});
	let normalizedEmptyState;
	if (!emptyState) normalizedEmptyState = /* @__PURE__ */ jsxRuntimeExports.jsx(TableEmptyState, {
		colSpan,
		message: emptyStateMessage
	});
	else if (typeof emptyState === "function") normalizedEmptyState = emptyState(colSpan);
	else normalizedEmptyState = emptyState;
	let normalizedLoadingState;
	if (!loadingState) normalizedLoadingState = /* @__PURE__ */ jsxRuntimeExports.jsx(TableLoadingState, {
		colSpan,
		message: loadingStateMessage
	});
	else if (typeof loadingState === "function") normalizedLoadingState = loadingState(colSpan);
	else normalizedLoadingState = loadingState;
	return {
		emptyState: normalizedEmptyState,
		loadingState: normalizedLoadingState,
		pagination: {
			component: paginationComponent,
			enabled: paginationEnabled
		}
	};
}

//#region src/components/data-table/BaseTableInner.tsx
function BaseTableInner(props) {
	const { className, emptyState, emptyStateMessage, footer, getCellProps, getRowProps, header, isLoading, loadingState, loadingStateMessage, onRowClick, pagination } = props;
	const { table } = useTable();
	const normalizedOptions = normalizeTableOptions(pagination, emptyState, emptyStateMessage, loadingState, loadingStateMessage, table);
	return /* @__PURE__ */ jsxRuntimeExports.jsx(BaseTableContent, {
		className,
		emptyState: normalizedOptions.emptyState,
		footer,
		getCellProps,
		getRowProps,
		header,
		isLoading,
		loadingState: normalizedOptions.loadingState,
		onRowClick,
		pagination: normalizedOptions.pagination.enabled ? normalizedOptions.pagination.component : void 0,
		table
	});
}

//#region src/components/data-table/BaseTable.tsx
function BaseTable(props) {
	if ("table" in props && props.table && "data" in props && props.data) throw new Error("BaseTable cannot accept both table and data props - use one or the other");
	if ("table" in props && props.table) return /* @__PURE__ */ jsxRuntimeExports.jsx(TableProvider, {
		table: props.table,
		children: /* @__PURE__ */ jsxRuntimeExports.jsx(BaseTableInner, { ...props })
	});
	if ("data" in props && props.data) return /* @__PURE__ */ jsxRuntimeExports.jsx(CreateTableProvider, {
		actionColumn: props.actionColumn,
		columns: props.columns,
		data: props.data,
		children: /* @__PURE__ */ jsxRuntimeExports.jsx(BaseTableInner, { ...props })
	});
	throw new Error("BaseTable requires either table or data prop");
}

//#region src/components/data-table/TableAction.tsx
function TableAction({ items, row }) {
	return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
		className: "flex items-center gap-1",
		children: items.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
			"aria-label": item.tooltip || item.label,
			className: "h-8 w-8 p-0",
			disabled: item.disabled,
			onClick: (e) => {
				e.stopPropagation();
				item.onClick(row);
			},
			title: item.tooltip || item.label,
			variant: "ghost",
			children: item.icon
		}, `action-${index}`))
	});
}

//#region src/components/data-table/TableActionMenu.tsx
function TableActionMenu({ items, row }) {
	return /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DropdownMenu, { children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
			"aria-label": "Open actions menu",
			className: "h-8 w-8 p-0",
			variant: "ghost",
			children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "h-4 w-4" })
		})
	}), /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DropdownMenuContent, {
		align: "end",
		children: items.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DropdownMenuItem, {
			disabled: item.disabled,
			onClick: () => item.onClick(row),
			children: [item.icon && /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
				className: "mr-2",
				children: item.icon
			}), item.label]
		}, index))
	})] });
}

var baseIsEqual = _baseIsEqual;

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

var isEqual_1 = isEqual;

const isEqual$1 = /*@__PURE__*/getDefaultExportFromCjs(isEqual_1);

var A=Object.defineProperty;var n=(t,o)=>A(t,"name",{value:o,configurable:true});var P=n(()=>{let t=dashboard__loadShare__react__loadShare__.useRef(true);return dashboard__loadShare__react__loadShare__.useEffect(()=>{t.current=false;},[]),t.current},"useIsFirstRender");var k=n(({columns:t,columnFilters:o})=>(o==null?void 0:o.map(e=>{var a,d,c,u;let r=e.operator??((d=(a=t.find(m=>m.id===e.id))==null?void 0:a.meta)==null?void 0:d.filterOperator);if((r==="and"||r==="or")&&Array.isArray(e.value))return {key:((u=(c=t.find(y=>y.id===e.id))==null?void 0:c.meta)==null?void 0:u.filterKey)??e.id,operator:r,value:e.value};let i=Array.isArray(e.value)?"in":"eq";return {field:e.id,operator:r??i,value:e.value}}))??[],"columnFiltersToCrudFilters");var O=n(({nextFilters:t,coreFilters:o})=>o.filter(r=>!t.some(s=>{let i=r.operator==="and"||r.operator==="or",a=s.operator==="and"||s.operator==="or",d=r.operator===s.operator,c=i&&a&&r.key===s.key,u=!i&&!a&&r.field===s.field;return d&&(c||u)})).map(r=>r.operator==="and"||r.operator==="or"?{key:r.key,operator:r.operator,value:[]}:{field:r.field,operator:r.operator,value:void 0}),"getRemovedFilters");var B=n(({columns:t,crudFilters:o})=>o.map(e=>{var r;return e.operator==="and"||e.operator==="or"?e.key?{id:((r=t.find(i=>{var a;return ((a=i.meta)==null?void 0:a.filterKey)===e.key}))==null?void 0:r.id)??e.key,operator:e.operator,value:e.value}:void 0:{id:e.field,operator:e.operator,value:e.value}}).filter(Boolean),"crudFiltersToColumnFilters");function X({refineCoreProps:{hasPagination:t=true,...o}={},initialState:e={},...r}){var D,E,x;let s=P(),i=dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useTable({...o,hasPagination:t}),a=(((D=o.filters)==null?void 0:D.mode)||"server")==="server",d=(((E=o.sorters)==null?void 0:E.mode)||"server")==="server",c=t===false?"off":"server",u=(((x=o.pagination)==null?void 0:x.mode)??c)!=="off",{tableQuery:{data:m},current:y,setCurrent:f,pageSize:Q,setPageSize:w,sorters:v,setSorters:H,filters:C,setFilters:K,pageCount:h}=i,g=useReactTable({data:(m==null?void 0:m.data)??[],getCoreRowModel:getCoreRowModel(),getSortedRowModel:d?void 0:getSortedRowModel(),getFilteredRowModel:a?void 0:getFilteredRowModel(),initialState:{pagination:{pageIndex:y-1,pageSize:Q},sorting:v.map(p=>({id:p.field,desc:p.order==="desc"})),columnFilters:B({columns:r.columns,crudFilters:C}),...e},pageCount:h,manualPagination:true,manualSorting:d,manualFiltering:a,...r}),{state:z,columns:I}=g.options,{pagination:M,sorting:F,columnFilters:S}=z,{pageIndex:R,pageSize:b}=M??{};return dashboard__loadShare__react__loadShare__.useEffect(()=>{R!==void 0&&f(R+1);},[R]),dashboard__loadShare__react__loadShare__.useEffect(()=>{b!==void 0&&w(b);},[b]),dashboard__loadShare__react__loadShare__.useEffect(()=>{if(F!==void 0){let p=F.map(l=>({field:l.id,order:l.desc?"desc":"asc"}));isEqual$1(v,p)||H(p),F.length>0&&u&&!s&&f(1);}},[F]),dashboard__loadShare__react__loadShare__.useEffect(()=>{let p=g.getAllColumns().map(U=>U.columnDef),l=k({columns:p,columnFilters:S});l.push(...O({nextFilters:l,coreFilters:C})),isEqual$1(l,C)||K(l),l.length>0&&u&&!s&&f(1);},[S,I]),{...g,refineCore:i}}n(X,"useTable");

//#region src/components/data-table/DataTable.tsx
function DataTable({ actionMenu, columns, dataProviderName, refineCoreProps, resource,...props }) {
	const actionColumn = actionMenu ? {
		cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
			className: "flex items-center gap-1",
			children: [actionMenu.actionItems && /* @__PURE__ */ jsxRuntimeExports.jsx(TableAction, {
				items: actionMenu.actionItems,
				row: row.original
			}), /* @__PURE__ */ jsxRuntimeExports.jsx(TableActionMenu, {
				items: actionMenu.items,
				row: row.original
			})]
		}),
		header: actionMenu.label ?? "Actions",
		id: "actions",
		meta: {
			cellClassName: "max-w-24 w-12",
			headerClassName: "max-w-24 w-12"
		},
		size: 0
	} : void 0;
	const tableColumns = [...columns || []];
	if (actionColumn) tableColumns.push(actionColumn);
	const refineTable = X({
		columns: tableColumns,
		refineCoreProps: {
			dataProviderName: dataProviderName ?? void 0,
			resource,
			...refineCoreProps
		}
	});
	const table = {
		...refineTable,
		options: {
			...refineTable.options,
			refineCore: refineTable.refineCore
		}
	};
	return /* @__PURE__ */ jsxRuntimeExports.jsx(BaseTable, {
		table,
		...props
	});
}

function isGlobalInstance(obj, className) {
  var Ctor = globalThis[className];
  return typeof Ctor === 'function' && obj instanceof Ctor;
}

/**
 * Element that user can interact with,
 * includes `<input>`, `<select>` and `<textarea>`.
 */

/**
 * Form Control element. It can either be a submit button or a submit input.
 */

function isInputElement(element) {
  return element.tagName === 'INPUT';
}
function isSelectElement(element) {
  return element.tagName === 'SELECT';
}
function createFileList(value) {
  var dataTransfer = new DataTransfer();
  if (Array.isArray(value)) {
    for (var file of value) {
      dataTransfer.items.add(file);
    }
  } else {
    dataTransfer.items.add(value);
  }
  return dataTransfer.files;
}
function normalizeStringValues(value) {
  if (typeof value === 'undefined') return undefined;
  if (value === null) return [];
  if (typeof value === 'string') return [value];
  if (Array.isArray(value) && value.every(v => typeof v === 'string')) {
    return Array.from(value);
  }
  throw new Error('Expected string or string[] value for string based input');
}
function normalizeFileValues(value) {
  if (typeof value === 'undefined') return undefined;
  if (value === null) return createFileList([]);
  if (isGlobalInstance(value, 'File')) return createFileList([value]);
  if (isGlobalInstance(value, 'FileList')) return value;
  if (Array.isArray(value) && value.every(item => isGlobalInstance(item, 'File'))) {
    return createFileList(value);
  }
  throw new Error('Expected File, FileList or File[] for file input');
}

/**
 * Updates the DOM element with the provided value and defaultValue.
 * If the value or defaultValue is undefined, it will keep the current value instead
 */
function updateField(element, options) {
  var _value$;
  if (isInputElement(element)) {
    switch (element.type) {
      case 'file':
        {
          var files = normalizeFileValues(options.value);
          if (files) {
            element.files = files;
          }
          return;
        }
      case 'checkbox':
      case 'radio':
        {
          var _value = normalizeStringValues(options.value);
          var _defaultValue = normalizeStringValues(options.defaultValue);
          if (_value) {
            var checked = _value.includes(element.value);
            if (element.type === 'checkbox' ? checked !== element.checked : checked) {
              // Simulate a click to update the checked state
              element.click();
            }
            element.checked = checked;
          }
          if (_defaultValue) {
            element.defaultChecked = _defaultValue.includes(element.value);
          }
          return;
        }
    }
  } else if (isSelectElement(element)) {
    var _value2 = normalizeStringValues(options.value);
    var _defaultValue2 = normalizeStringValues(options.defaultValue);
    var shouldUnselect = _value2 && _value2.length === 0;
    for (var option of element.options) {
      if (_value2) {
        var index = _value2.indexOf(option.value);
        var selected = index > -1;

        // Update the selected state of the option
        if (option.selected !== selected) {
          option.selected = selected;
        }

        // Remove the option from the value array
        if (selected) {
          _value2.splice(index, 1);
        }
      }
      if (_defaultValue2) {
        var _index = _defaultValue2.indexOf(option.value);
        var _selected = _index > -1;

        // Update the selected state of the option
        if (option.defaultSelected !== _selected) {
          option.defaultSelected = _selected;
        }

        // Remove the option from the defaultValue array
        if (_selected) {
          _defaultValue2.splice(_index, 1);
        }
      }
    }

    // We have already removed all selected options from the value and defaultValue array at this point
    var missingOptions = new Set([...(_value2 !== null && _value2 !== void 0 ? _value2 : []), ...(_defaultValue2 !== null && _defaultValue2 !== void 0 ? _defaultValue2 : [])]);
    for (var optionValue of missingOptions) {
      element.options.add(new Option(optionValue, optionValue, _defaultValue2 === null || _defaultValue2 === void 0 ? void 0 : _defaultValue2.includes(optionValue), _value2 === null || _value2 === void 0 ? void 0 : _value2.includes(optionValue)));
    }

    // If the select element is not multiple and the value is an empty array, unset the selected index
    // This is to prevent the select element from showing the first option as selected
    if (shouldUnselect) {
      element.selectedIndex = -1;
    }
    return;
  }
  var value = normalizeStringValues(options.value);
  var defaultValue = normalizeStringValues(options.defaultValue);
  var inputValue = (_value$ = value === null || value === void 0 ? void 0 : value[0]) !== null && _value$ !== void 0 ? _value$ : '';
  if (element.value !== inputValue) {
    /**
     * Triggering react custom change event
     * Solution based on dom-testing-library
     * @see https://github.com/facebook/react/issues/10135#issuecomment-401496776
     * @see https://github.com/testing-library/dom-testing-library/blob/main/src/events.js#L104-L123
     */
    var {
      set: valueSetter
    } = Object.getOwnPropertyDescriptor(element, 'value') || {};
    var prototype = Object.getPrototypeOf(element);
    var {
      set: prototypeValueSetter
    } = Object.getOwnPropertyDescriptor(prototype, 'value') || {};
    if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter.call(element, inputValue);
    } else if (valueSetter) {
      valueSetter.call(element, inputValue);
    } else {
      throw new Error('The given element does not have a value setter');
    }
  }
  if (defaultValue) {
    var _defaultValue$;
    element.defaultValue = (_defaultValue$ = defaultValue[0]) !== null && _defaultValue$ !== void 0 ? _defaultValue$ : '';
  }
}

function getFormElement(formId) {
  return document.forms.namedItem(formId);
}
function getFieldElements(form, name) {
  var field = form === null || form === void 0 ? void 0 : form.elements.namedItem(name);
  var elements = !field ? [] : field instanceof Element ? [field] : Array.from(field.values());
  return elements.filter(element => element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement);
}
function getEventTarget(form, name, value) {
  var _elements$;
  var elements = getFieldElements(form, name);
  if (elements.length > 1) {
    var options = value;
    for (var element of elements) {
      if (typeof options !== 'undefined' && element instanceof HTMLInputElement && element.type === 'checkbox' && (element.checked ? options.includes(element.value) : !options.includes(element.value))) {
        continue;
      }
      return element;
    }
  }
  return (_elements$ = elements[0]) !== null && _elements$ !== void 0 ? _elements$ : null;
}
function createDummySelect(form, name, value) {
  var select = document.createElement('select');
  var options = typeof value === 'string' ? [value] : value !== null && value !== void 0 ? value : [];
  select.name = name;
  select.multiple = Array.isArray(value);
  select.dataset.conform = 'true';

  // To make sure the input is hidden but still focusable
  select.setAttribute('aria-hidden', 'true');
  select.tabIndex = -1;
  select.style.position = 'absolute';
  select.style.width = '1px';
  select.style.height = '1px';
  select.style.padding = '0';
  select.style.margin = '-1px';
  select.style.overflow = 'hidden';
  select.style.clip = 'rect(0,0,0,0)';
  select.style.whiteSpace = 'nowrap';
  select.style.border = '0';
  for (var option of options) {
    select.options.add(new Option(option, option, true, true));
  }
  form.appendChild(select);
  return select;
}
function isDummySelect(element) {
  return element.dataset.conform === 'true';
}
function getInputValue(element) {
  if (element instanceof HTMLSelectElement) {
    var _value$;
    var _value = Array.from(element.selectedOptions).map(option => option.value);
    return element.multiple ? _value : (_value$ = _value[0]) !== null && _value$ !== void 0 ? _value$ : null;
  }
  if (element instanceof HTMLInputElement && (element.type === 'radio' || element.type === 'checkbox')) {
    return element.checked ? element.value : null;
  }
  return element.value;
}
function useInputEvent(onUpdate) {
  var ref = dashboard__loadShare__react__loadShare__.useRef(null);
  var observerRef = dashboard__loadShare__react__loadShare__.useRef(null);
  var eventDispatched = dashboard__loadShare__react__loadShare__.useRef({
    change: false,
    focus: false,
    blur: false
  });
  dashboard__loadShare__react__loadShare__.useEffect(() => {
    var createEventListener = listener => {
      return event => {
        var element = ref.current;
        if (element && event.target === element) {
          eventDispatched.current[listener] = true;
        }
      };
    };
    var inputHandler = createEventListener('change');
    var focusHandler = createEventListener('focus');
    var blurHandler = createEventListener('blur');
    document.addEventListener('input', inputHandler, true);
    document.addEventListener('focusin', focusHandler, true);
    document.addEventListener('focusout', blurHandler, true);
    return () => {
      document.removeEventListener('input', inputHandler, true);
      document.removeEventListener('focusin', focusHandler, true);
      document.removeEventListener('focusout', blurHandler, true);
    };
  }, [ref]);
  return dashboard__loadShare__react__loadShare__.useMemo(() => {
    return {
      change(value) {
        if (!eventDispatched.current.change) {
          eventDispatched.current.change = true;
          var element = ref.current;
          if (element) {
            updateField(element, {
              value
            });

            // Dispatch input event with the updated input value
            element.dispatchEvent(new InputEvent('input', {
              bubbles: true
            }));
            // Dispatch change event (necessary for select to update the selected option)
            element.dispatchEvent(new Event('change', {
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
            element.dispatchEvent(new FocusEvent('focusin', {
              bubbles: true
            }));
            element.dispatchEvent(new FocusEvent('focus'));
          }
        }
        eventDispatched.current.focus = false;
      },
      blur() {
        if (!eventDispatched.current.blur) {
          eventDispatched.current.blur = true;
          var element = ref.current;
          if (element) {
            element.dispatchEvent(new FocusEvent('focusout', {
              bubbles: true
            }));
            element.dispatchEvent(new FocusEvent('blur'));
          }
        }
        eventDispatched.current.blur = false;
      },
      register(element) {
        ref.current = element;
        if (observerRef.current) {
          observerRef.current.disconnect();
          observerRef.current = null;
        }
        if (!element) {
          return;
        }
        observerRef.current = new MutationObserver(mutations => {
          var _loop = function _loop() {
            if (mutation.type === 'attributes') {
              var _getInputValue;
              var nextValue = (_getInputValue = getInputValue(element)) !== null && _getInputValue !== void 0 ? _getInputValue : undefined;
              onUpdate(prevValue => {
                if (nextValue === prevValue ||
                // If the value is an array, check if the current value is the same as the new value
                JSON.stringify(prevValue) === JSON.stringify(nextValue)) {
                  return prevValue;
                }
                return nextValue;
              });
            }
          };
          for (var mutation of mutations) {
            _loop();
          }
        });
        observerRef.current.observe(element, {
          attributes: true,
          attributeFilter: ['data-conform']
        });
      }
    };
  }, [onUpdate]);
}
function useInputValue(options) {
  var initializeValue = () => {
    var _options$initialValue;
    if (typeof options.initialValue === 'string') {
      // @ts-expect-error FIXME: To ensure that the type of value is also `string | undefined` if initialValue is not an array
      return options.initialValue;
    }

    // @ts-expect-error Same as above
    return (_options$initialValue = options.initialValue) === null || _options$initialValue === void 0 ? void 0 : _options$initialValue.map(value => value !== null && value !== void 0 ? value : '');
  };
  var [key, setKey] = dashboard__loadShare__react__loadShare__.useState(options.key);
  var [value, setValue] = dashboard__loadShare__react__loadShare__.useState(initializeValue);
  if (key !== options.key) {
    setValue(initializeValue);
    setKey(options.key);
  }
  return [value, setValue];
}
function useInputControl(meta) {
  var [value, setValue] = useInputValue(meta);
  var initializedRef = dashboard__loadShare__react__loadShare__.useRef(false);
  var {
    register,
    change,
    focus,
    blur
  } = useInputEvent(
  // @ts-expect-error We will fix the type when stabilizing the API
  setValue);
  dashboard__loadShare__react__loadShare__.useEffect(() => {
    var form = getFormElement(meta.formId);
    if (!form) {
      // eslint-disable-next-line no-console
      console.warn("useInputControl is unable to find form#".concat(meta.formId, " and identify if a dummy input is required"));
      return;
    }
    var element = getEventTarget(form, meta.name);
    if (!element && typeof value !== 'undefined' && (!Array.isArray(value) || value.length > 0)) {
      element = createDummySelect(form, meta.name, value);
    }
    register(element);
    if (!initializedRef.current) {
      initializedRef.current = true;
    } else {
      change(value !== null && value !== void 0 ? value : '');
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

//#region src/components/Forms.tsx
const Field = ({ className, errors, inputProps, labelProps }) => {
	const fallbackId = dashboard__loadShare__react__loadShare__.useId();
	const id = inputProps.id ?? fallbackId;
	const errorId = errors?.length ? `${id}-error` : void 0;
	return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
		className,
		children: [
			/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Label, {
				...labelProps,
				className: "font-semibold text-sm text-secondary-foreground",
				htmlFor: id
			}),
			/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Input, {
				...inputProps,
				"aria-describedby": errorId,
				"aria-invalid": errorId ? true : void 0,
				className: "mt-4 bg-input border-border placeholder-input-placeholder",
				id
			}),
			/* @__PURE__ */ jsxRuntimeExports.jsx("div", {
				className: "min-h-[32px] px-4 pb-3 pt-1",
				children: errorId ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorList, {
					errors,
					id: errorId
				}) : null
			})
		]
	});
};
const FieldCheckbox = ({ className, errors, inputProps, labelProps }) => {
	const { defaultChecked, key,...checkboxProps } = inputProps;
	const checkedValue = inputProps.value ?? "on";
	const input = useInputControl({
		formId: inputProps.form,
		initialValue: defaultChecked ? checkedValue : void 0,
		key,
		name: inputProps.name
	});
	const fallbackId = dashboard__loadShare__react__loadShare__.useId();
	const id = inputProps.id ?? fallbackId;
	const errorId = errors?.length ? `${id}-error` : void 0;
	return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [/* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
		className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("space-x-2 flex items-center text-foreground", className),
		children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Checkbox, {
			...checkboxProps,
			"aria-describedby": errorId,
			"aria-invalid": errorId ? true : void 0,
			checked: input.value === checkedValue,
			id,
			onBlur: (event) => {
				input.blur();
				inputProps.onBlur?.(event);
			},
			onCheckedChange: (state) => {
				input.change(state.valueOf() ? checkedValue : "");
				inputProps.onCheckedChange?.(state);
			},
			onFocus: (event) => {
				input.focus();
				inputProps.onFocus?.(event);
			},
			type: "button"
		}), /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Label, {
			...labelProps,
			htmlFor: id
		})]
	}), /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
		className: "min-h-[32px] px-4 pb-3 pt-1",
		children: errorId ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorList, {
			errors,
			id: errorId
		}) : null
	})] });
};
function ErrorList({ errors, id }) {
	const errorsToRender = errors?.filter(Boolean);
	if (!errorsToRender?.length) return null;
	return /* @__PURE__ */ jsxRuntimeExports.jsx("ul", {
		className: "flex flex-col gap-1",
		id,
		children: errorsToRender.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", {
			className: "text-[12px] text-destructive-foreground",
			children: e
		}, e))
	});
}
function TextareaField({ className, errors, labelProps, textareaProps }) {
	const fallbackId = dashboard__loadShare__react__loadShare__.useId();
	const id = textareaProps.id ?? textareaProps.name ?? fallbackId;
	const errorId = errors?.length ? `${id}-error` : void 0;
	return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
		className,
		children: [
			/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Label, {
				htmlFor: id,
				...labelProps
			}),
			/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Textarea, {
				"aria-describedby": errorId,
				"aria-invalid": errorId ? true : void 0,
				id,
				...textareaProps
			}),
			/* @__PURE__ */ jsxRuntimeExports.jsx("div", {
				className: "min-h-[32px] pb-1 pt-1",
				children: errorId ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorList, {
					errors,
					id: errorId
				}) : null
			})
		]
	});
}

//#region src/components/InlineAuthLinkBanner.tsx
function InlineAuthLinkBanner({ className, label, linkClassName, linkLabel, to }) {
	return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
		className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("text-foreground text-sm w-fit flex items-center gap-2 text-left bg-secondary p-3 rounded-lg", className),
		children: [/* @__PURE__ */ jsxRuntimeExports.jsx("span", {
			className: "text-foreground/80 whitespace-nowrap",
			children: label
		}), /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare__react_mf_2_router__loadShare__.Link, {
			className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("text-foreground mx-auto whitespace-nowrap hover:underline hover:underline-offset-4", linkClassName),
			to,
			children: linkLabel ?? "Login here →"
		})]
	});
}

//#region src/hooks/usePluginMeta.ts
function usePluginMeta(pluginName, key) {
	const meta = usePortalStore((state) => state.meta);
	return dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.getPluginMeta(meta, pluginName, key);
}

function createJSONStorage(getStorage, options) {
  let storage;
  try {
    storage = getStorage();
  } catch (e) {
    return;
  }
  const persistStorage = {
    getItem: (name) => {
      var _a;
      const parse = (str2) => {
        if (str2 === null) {
          return null;
        }
        return JSON.parse(str2, void 0 );
      };
      const str = (_a = storage.getItem(name)) != null ? _a : null;
      if (str instanceof Promise) {
        return str.then(parse);
      }
      return parse(str);
    },
    setItem: (name, newValue) => storage.setItem(name, JSON.stringify(newValue, void 0 )),
    removeItem: (name) => storage.removeItem(name)
  };
  return persistStorage;
}
const toThenable = (fn) => (input) => {
  try {
    const result = fn(input);
    if (result instanceof Promise) {
      return result;
    }
    return {
      then(onFulfilled) {
        return toThenable(onFulfilled)(result);
      },
      catch(_onRejected) {
        return this;
      }
    };
  } catch (e) {
    return {
      then(_onFulfilled) {
        return this;
      },
      catch(onRejected) {
        return toThenable(onRejected)(e);
      }
    };
  }
};
const persistImpl = (config, baseOptions) => (set, get, api) => {
  let options = {
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => state,
    version: 0,
    merge: (persistedState, currentState) => ({
      ...currentState,
      ...persistedState
    }),
    ...baseOptions
  };
  let hasHydrated = false;
  const hydrationListeners = /* @__PURE__ */ new Set();
  const finishHydrationListeners = /* @__PURE__ */ new Set();
  let storage = options.storage;
  if (!storage) {
    return config(
      (...args) => {
        console.warn(
          `[zustand persist middleware] Unable to update item '${options.name}', the given storage is currently unavailable.`
        );
        set(...args);
      },
      get,
      api
    );
  }
  const setItem = () => {
    const state = options.partialize({ ...get() });
    return storage.setItem(options.name, {
      state,
      version: options.version
    });
  };
  const savedSetState = api.setState;
  api.setState = (state, replace) => {
    savedSetState(state, replace);
    return setItem();
  };
  const configResult = config(
    (...args) => {
      set(...args);
      return setItem();
    },
    get,
    api
  );
  api.getInitialState = () => configResult;
  let stateFromStorage;
  const hydrate = () => {
    var _a, _b;
    if (!storage) return;
    hasHydrated = false;
    hydrationListeners.forEach((cb) => {
      var _a2;
      return cb((_a2 = get()) != null ? _a2 : configResult);
    });
    const postRehydrationCallback = ((_b = options.onRehydrateStorage) == null ? void 0 : _b.call(options, (_a = get()) != null ? _a : configResult)) || void 0;
    return toThenable(storage.getItem.bind(storage))(options.name).then((deserializedStorageValue) => {
      if (deserializedStorageValue) {
        if (typeof deserializedStorageValue.version === "number" && deserializedStorageValue.version !== options.version) {
          if (options.migrate) {
            const migration = options.migrate(
              deserializedStorageValue.state,
              deserializedStorageValue.version
            );
            if (migration instanceof Promise) {
              return migration.then((result) => [true, result]);
            }
            return [true, migration];
          }
          console.error(
            `State loaded from storage couldn't be migrated since no migrate function was provided`
          );
        } else {
          return [false, deserializedStorageValue.state];
        }
      }
      return [false, void 0];
    }).then((migrationResult) => {
      var _a2;
      const [migrated, migratedState] = migrationResult;
      stateFromStorage = options.merge(
        migratedState,
        (_a2 = get()) != null ? _a2 : configResult
      );
      set(stateFromStorage, true);
      if (migrated) {
        return setItem();
      }
    }).then(() => {
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(stateFromStorage, void 0);
      stateFromStorage = get();
      hasHydrated = true;
      finishHydrationListeners.forEach((cb) => cb(stateFromStorage));
    }).catch((e) => {
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(void 0, e);
    });
  };
  api.persist = {
    setOptions: (newOptions) => {
      options = {
        ...options,
        ...newOptions
      };
      if (newOptions.storage) {
        storage = newOptions.storage;
      }
    },
    clearStorage: () => {
      storage == null ? void 0 : storage.removeItem(options.name);
    },
    getOptions: () => options,
    rehydrate: () => hydrate(),
    hasHydrated: () => hasHydrated,
    onHydrate: (cb) => {
      hydrationListeners.add(cb);
      return () => {
        hydrationListeners.delete(cb);
      };
    },
    onFinishHydration: (cb) => {
      finishHydrationListeners.add(cb);
      return () => {
        finishHydrationListeners.delete(cb);
      };
    }
  };
  if (!options.skipHydration) {
    hydrate();
  }
  return stateFromStorage || configResult;
};
const persist = persistImpl;

//#region src/store/uiStore.ts
const uiStore = createStore()(persist((set) => ({
	setTheme: (theme) => set({ theme }),
	theme: "default"
}), {
	name: "ui-store",
	partialize: (state) => ({ theme: state.theme })
}));
const useUIStore = (selector) => useStore(uiStore, selector);

//#region src/utils/theme.ts
/**
* Adjusts the hue of a color by a given number of degrees.
* Hue wraps around at 360.
* @param color The Color object.
* @param degrees The number of degrees to adjust the hue by.
* @returns A new Color object.
*/
function adjustHue(color, degrees) {
	let newHue = color.hue + degrees;
	newHue = newHue % 360;
	if (newHue < 0) newHue += 360;
	return {
		...color,
		hue: newHue
	};
}
/**
* Applies the styles from a Theme object to the DOM.
* This function manipulates the document head and root element class.
* @param theme The Theme object to apply.
*/
function applyThemeStyles(theme) {
	const css = generateThemeCSS(theme);
	const style = document.createElement("style");
	style.textContent = css;
	const existingStyle = document.head.querySelector("style[data-theme]");
	if (existingStyle) document.head.removeChild(existingStyle);
	style.setAttribute("data-theme", theme.id);
	document.head.appendChild(style);
	document.documentElement.className = `theme-${theme.id}`;
}
/**
* Creates default system colors for a light theme.
*/
function createDefaultSystemColors() {
	return {
		active_ui_element: {
			hue: 0,
			lightness: 80,
			saturation: 0
		},
		background: {
			hue: 0,
			lightness: 100,
			saturation: 0
		},
		borders: {
			hue: 0,
			lightness: 70,
			saturation: 0
		},
		high_contrast_text: {
			hue: 0,
			lightness: 10,
			saturation: 0
		},
		hovered_element_border: {
			hue: 0,
			lightness: 50,
			saturation: 0
		},
		hovered_solid_bg: {
			hue: 0,
			lightness: 35,
			saturation: 0
		},
		hovered_ui_element: {
			hue: 0,
			lightness: 85,
			saturation: 0
		},
		low_contrast_text: {
			hue: 0,
			lightness: 30,
			saturation: 0
		},
		solid_background: {
			hue: 0,
			lightness: 40,
			saturation: 0
		},
		subtle_background: {
			hue: 0,
			lightness: 95,
			saturation: 0
		},
		ui_element_background: {
			hue: 0,
			lightness: 90,
			saturation: 0
		},
		ui_element_border: {
			hue: 0,
			lightness: 60,
			saturation: 0
		}
	};
}
/**
* Creates a default theme object.
* This can be used as a fallback or starting point.
*/
function createDefaultTheme() {
	return {
		background_images: {
			login: "",
			register: "",
			reset_password: ""
		},
		id: "default",
		name: "Default Theme",
		system_colors: createDefaultSystemColors()
	};
}
/**
* Creates a system colors object with all values at zero.
* Useful for testing and reset operations.
*/
function createZeroSystemColors() {
	return {
		active_ui_element: {
			hue: 0,
			lightness: 0,
			saturation: 0
		},
		background: {
			hue: 0,
			lightness: 0,
			saturation: 0
		},
		borders: {
			hue: 0,
			lightness: 0,
			saturation: 0
		},
		high_contrast_text: {
			hue: 0,
			lightness: 0,
			saturation: 0
		},
		hovered_element_border: {
			hue: 0,
			lightness: 0,
			saturation: 0
		},
		hovered_solid_bg: {
			hue: 0,
			lightness: 0,
			saturation: 0
		},
		hovered_ui_element: {
			hue: 0,
			lightness: 0,
			saturation: 0
		},
		low_contrast_text: {
			hue: 0,
			lightness: 0,
			saturation: 0
		},
		solid_background: {
			hue: 0,
			lightness: 0,
			saturation: 0
		},
		subtle_background: {
			hue: 0,
			lightness: 0,
			saturation: 0
		},
		ui_element_background: {
			hue: 0,
			lightness: 0,
			saturation: 0
		},
		ui_element_border: {
			hue: 0,
			lightness: 0,
			saturation: 0
		}
	};
}
/**
* Darkens a color by a given percentage.
* @param color The Color object.
* @param amount The percentage amount to darken by (0-100).
* @returns A new Color object.
*/
function darkenColor(color, amount) {
	const newLightness = clamp(color.lightness - amount, 0, 100);
	return {
		...color,
		lightness: newLightness
	};
}
/**
* Desaturates a color by a given percentage.
* @param color The Color object.
* @param amount The percentage amount to desaturate by (0-100).
* @returns A new Color object.
*/
function desaturateColor(color, amount) {
	const newSaturation = clamp(color.saturation - amount, 0, 100);
	return {
		...color,
		saturation: newSaturation
	};
}
/**
* Attempts to adjust theme colors to meet WCAG contrast requirements.
* It iterates through common color pairs and adjusts lightness if contrast is insufficient.
* Returns a new Theme object if changes were made, otherwise returns the original theme.
* @param theme The Theme object to check and potentially adjust.
* @param textLevel The desired WCAG level for text contrast ('AA' or 'AAA'). Defaults to 'AA'.
* @param nonTextLevel The desired WCAG level for non-text contrast ('AA'). Defaults to 'AA'.
* @returns A new Theme object with adjusted colors if needed, or the original theme.
*/
function ensureWcagContrast(theme, textLevel = "AA", nonTextLevel = "AA") {
	const modifiedTheme = {
		...theme,
		systemColors: { ...theme.system_colors }
	};
	let changesMade = false;
	const colors = modifiedTheme.systemColors;
	const colorPairs = [
		{
			bgKey: "background",
			fgKey: "high_contrast_text",
			type: "text"
		},
		{
			bgKey: "background",
			fgKey: "low_contrast_text",
			type: "text"
		},
		{
			bgKey: "ui_element_background",
			fgKey: "high_contrast_text",
			type: "text"
		},
		{
			bgKey: "ui_element_background",
			fgKey: "low_contrast_text",
			type: "text"
		},
		{
			bgKey: "ui_element_background",
			fgKey: "ui_element_border",
			type: "non-text"
		},
		{
			bgKey: "hovered_ui_element",
			fgKey: "hovered_element_border",
			type: "non-text"
		},
		{
			bgKey: "ui_element_background",
			fgKey: "active_ui_element",
			type: "non-text"
		},
		{
			bgKey: "background",
			fgKey: "hovered_ui_element",
			type: "non-text"
		},
		{
			bgKey: "background",
			fgKey: "solid_background",
			type: "non-text"
		},
		{
			bgKey: "solid_background",
			fgKey: "hovered_solid_bg",
			type: "non-text"
		}
	];
	for (const { bgKey, fgKey, type } of colorPairs) {
		const fgColor = colors[fgKey];
		const bgColor = colors[bgKey];
		let needsAdjustment = false;
		let requiredRatio;
		if (type === "text") {
			requiredRatio = textLevel === "AAA" ? 7 : 4.5;
			if (!meetsWcagTextContrast(fgColor, bgColor, textLevel, false)) needsAdjustment = true;
		} else {
			requiredRatio = 3;
			if (!meetsWcagNonTextContrast(fgColor, bgColor)) needsAdjustment = true;
		}
		if (needsAdjustment) {
			changesMade = true;
			console.warn(`WCAG Contrast Warning: Pair ${fgKey} vs ${bgKey} (Current Ratio: ${getContrastRatio(fgColor, bgColor)}) does not meet required ratio ${requiredRatio} for ${type === "text" ? textLevel + " Text" : "Non-text"}. Attempting to adjust.`);
			rgbToLuminance(...hslToRgb(fgColor));
			rgbToLuminance(...hslToRgb(bgColor));
			let adjustedFg = { ...fgColor };
			let adjustedBg = { ...bgColor };
			let currentRatio = getContrastRatio(adjustedFg, adjustedBg);
			const step = 1;
			const maxAttempts = 200;
			let attempts = 0;
			let adjustingFg = true;
			while (currentRatio < requiredRatio && attempts < maxAttempts) {
				attempts++;
				const currentFgLuminance = rgbToLuminance(...hslToRgb(adjustedFg));
				const currentBgLuminance = rgbToLuminance(...hslToRgb(adjustedBg));
				let adjustedThisIteration = false;
				if (adjustingFg) {
					const fgAdjustmentDirection = currentFgLuminance < currentBgLuminance ? -1 : 1;
					const nextFgLightness = clamp(adjustedFg.lightness + fgAdjustmentDirection * step, 0, 100);
					if (adjustedFg.lightness === nextFgLightness) adjustingFg = false;
					else {
						adjustedFg = {
							...adjustedFg,
							lightness: nextFgLightness
						};
						currentRatio = getContrastRatio(adjustedFg, adjustedBg);
						adjustedThisIteration = true;
					}
				}
				if (!adjustedThisIteration && !adjustingFg) {
					const bgAdjustmentDirection = currentBgLuminance < currentFgLuminance ? 1 : -1;
					const nextBgLightness = clamp(adjustedBg.lightness + bgAdjustmentDirection * step, 0, 100);
					if (adjustedBg.lightness === nextBgLightness) break;
					else {
						adjustedBg = {
							...adjustedBg,
							lightness: nextBgLightness
						};
						currentRatio = getContrastRatio(adjustedFg, adjustedBg);
						adjustedThisIteration = true;
					}
				}
				if (!adjustedThisIteration) {
					console.warn(`  WCAG Contrast Warning: Neither FG nor BG could be adjusted further for ${fgKey} vs ${bgKey}. Current Ratio: ${currentRatio}. Required: ${requiredRatio}. Stopping.`);
					break;
				}
			}
			modifiedTheme.systemColors[fgKey] = adjustedFg;
			modifiedTheme.systemColors[bgKey] = adjustedBg;
			if (getContrastRatio(adjustedFg, adjustedBg) < requiredRatio) console.warn(`WCAG Contrast Warning: Pair ${fgKey} vs ${bgKey} could not meet required ratio ${requiredRatio} after ${attempts} attempts. Final Ratio: ${getContrastRatio(adjustedFg, adjustedBg)}.`);
		}
	}
	return changesMade ? modifiedTheme : theme;
}
/**
* Generates CSS variable declarations for a given theme.
* @param theme The Theme object.
* @returns A CSS string with variable declarations.
*/
function generateThemeCSS(theme) {
	const systemColors = theme?.system_colors && typeof theme.system_colors === "object" && !Array.isArray(theme.system_colors) ? theme.system_colors : {};
	const backgroundImages = theme?.background_images && typeof theme.background_images === "object" && !Array.isArray(theme.background_images) ? theme.background_images : {};
	const colorVariables = Object.entries(systemColors).map(([key, value]) => {
		if (!isValidColor(value)) {
			console.warn(`Skipping invalid color for key "${key}" in theme "${theme?.id}"`);
			return "";
		}
		return `--theme-${key.replace(/_/g, "-")}: ${hslToRawString(value)};`;
	}).filter((line) => line !== "").join("\n  ");
	const backgroundImageVariables = Object.entries(backgroundImages).map(([key, value]) => {
		if (typeof value !== "string") {
			console.warn(`Skipping invalid background image URL for key "${key}" in theme "${theme?.id}"`);
			return "";
		}
		return `--lume-bg-${key.replace(/_/g, "-")}: url("${value}");`;
	}).filter((line) => line !== "").join("\n  ");
	const themeId = theme?.id || "unknown";
	return `
:root.theme-${themeId} {
  ${colorVariables}
  ${backgroundImageVariables}
}
`;
}
/**
* Calculates the contrast ratio between two colors.
* Based on WCAG 2.x guidelines.
* @param color1 The first Color object.
* @param color2 The second Color object.
* @returns The contrast ratio (1 to 21).
*/
function getContrastRatio(color1, color2) {
	const [r1, g1, b1] = hslToRgb(color1);
	const [r2, g2, b2] = hslToRgb(color2);
	const luminance1 = rgbToLuminance(r1, g1, b1);
	const luminance2 = rgbToLuminance(r2, g2, b2);
	const lighter = Math.max(luminance1, luminance2);
	const darker = Math.min(luminance1, luminance2);
	const ratio = (lighter + .05) / (darker + .05);
	return Math.round(ratio * 100) / 100;
}
/**
* Finds a specific theme by its ID from a list of themes.
* @param themes The array of available themes.
* @param themeId The ID of the theme to find.
* @returns The found Theme object or undefined if not found.
*/
function getThemeById(themes, themeId) {
	return themes.find((t) => t.id === themeId);
}
/**
* Converts a Hex color string (#RRGGBB or #RGB) to an HSL Color object.
* @param hex The hex color string.
* @returns An HSL Color object or undefined if the hex string is invalid.
*/
function hexToHsl(hex) {
	const hexMatch = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(hex);
	if (!hexMatch) {
		console.error(`Invalid hex color format: ${hex}`);
		return void 0;
	}
	let cleanHex = hexMatch[1];
	if (cleanHex.length === 3) cleanHex = cleanHex[0] + cleanHex[0] + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2];
	const r = parseInt(cleanHex.substring(0, 2), 16);
	const g = parseInt(cleanHex.substring(2, 4), 16);
	const b = parseInt(cleanHex.substring(4, 6), 16);
	return rgbToHsl(r, g, b);
}
/**
* Converts an HSL Color object to RGB values (0-255).
* Needed for calculating luminance for contrast ratio.
* @param color The HSL Color object.
* @returns An array [r, g, b] with values in the range [0, 255].
*/
function hslToRgb(color) {
	const h = color.hue / 360;
	const s = color.saturation / 100;
	const l = color.lightness / 100;
	let b, g, r;
	if (s === 0) r = g = b = l;
	else {
		const hue2rgb = (p$1, q$1, t) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p$1 + (q$1 - p$1) * 6 * t;
			if (t < 1 / 2) return q$1;
			if (t < 2 / 3) return p$1 + (q$1 - p$1) * (2 / 3 - t) * 6;
			return p$1;
		};
		const q = l < .5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}
	return [
		Math.round(r * 255),
		Math.round(g * 255),
		Math.round(b * 255)
	];
}
/**
* Converts a Color object to raw HSL values as a string.
* @param color The Color object.
* @returns A string in the format "hue, saturation%, lightness%".
*/
function hslToRawString(color) {
	return `${color.hue}, ${color.saturation}%, ${color.lightness}%`;
}
/**
* Converts a Color object to a CSS HSL string.
* @param color The Color object.
* @returns A string in the format "hsl(hue, saturation%, lightness%)".
*/
function hslToString(color) {
	return `hsl(${hslToRawString(color)})`;
}
/**
* Checks if an object conforms to the BackgroundImages interface structure.
* @param data The object to validate.
* @returns True if the object is valid BackgroundImages, false otherwise.
*/
function isValidBackgroundImages(data) {
	if (typeof data !== "object" || data === null) return false;
	const expectedKeys = [
		"login",
		"register",
		"reset_password"
	];
	for (const key of expectedKeys) if (!Object.prototype.hasOwnProperty.call(data, key) || typeof data[key] !== "string") return false;
	return true;
}
/**
* Checks if an object conforms to the Color interface structure.
* @param data The object to validate.
* @returns True if the object is a valid Color, false otherwise.
*/
function isValidColor(data) {
	return typeof data === "object" && data !== null && typeof data.hue === "number" && typeof data.saturation === "number" && typeof data.lightness === "number";
}
/**
* Checks if an object conforms to the SystemColors interface structure.
* @param data The object to validate.
* @returns True if the object is valid SystemColors, false otherwise.
*/
function isValidSystemColors(data) {
	if (typeof data !== "object" || data === null) return false;
	const expectedKeys = [
		"active_ui_element",
		"background",
		"borders",
		"high_contrast_text",
		"hovered_element_border",
		"hovered_solid_bg",
		"hovered_ui_element",
		"low_contrast_text",
		"solid_background",
		"subtle_background",
		"ui_element_background",
		"ui_element_border"
	];
	for (const key of expectedKeys) if (!Object.prototype.hasOwnProperty.call(data, key) || !isValidColor(data[key])) return false;
	return true;
}
/**
* Lightens a color by a given percentage.
* @param color The Color object.
* @param amount The percentage amount to lighten by (0-100).
* @returns A new Color object.
*/
function lightenColor(color, amount) {
	const newLightness = clamp(color.lightness + amount, 0, 100);
	return {
		...color,
		lightness: newLightness
	};
}
/**
* Checks if the contrast ratio between two colors meets a specified WCAG level.
* Assumes normal text size (not large text).
* WCAG AA requires 4.5:1. WCAG AAA requires 7:1.
* @param color1 The first Color object.
* @param color2 The second Color object.
* @param level The WCAG level to check against ('AA' or 'AAA').
* @returns True if the contrast ratio meets the level, false otherwise.
*/
function meetsWcagContrast(color1, color2, level) {
	return meetsWcagTextContrast(color1, color2, level, false);
}
/**
* Checks if the contrast ratio between two colors meets the WCAG 2.1 SC 1.4.11 Non-text Contrast (AA) requirement.
* This applies to graphical objects and user interface components.
* @param color1 The first Color object (e.g., icon color, border color).
* @param color2 The second Color object (e.g., adjacent background color).
* @returns True if the contrast ratio is 3:1 or higher, false otherwise.
*/
function meetsWcagNonTextContrast(color1, color2) {
	const ratio = getContrastRatio(color1, color2);
	const requiredRatio = 3;
	return ratio >= requiredRatio;
}
/**
* Checks if the contrast ratio between two colors meets a specified WCAG level for text.
* WCAG 2.x/2.1 SC 1.4.3 (Minimum) and SC 1.4.6 (Enhanced).
* @param color1 The first Color object (e.g., text color).
* @param color2 The second Color object (e.g., background color).
* @param level The WCAG level to check against ('AA' or 'AAA').
* @param isLargeText True if the text is considered "large text" by WCAG definition.
* @returns True if the contrast ratio meets the level for the given text size, false otherwise.
*/
function meetsWcagTextContrast(color1, color2, level, isLargeText) {
	const ratio = getContrastRatio(color1, color2);
	let requiredRatio;
	if (isLargeText) requiredRatio = level === "AAA" ? 4.5 : 3;
	else requiredRatio = level === "AAA" ? 7 : 4.5;
	return ratio >= requiredRatio;
}
/**
* Merges properties from an overrides object into a base theme object.
* Performs a deep merge for systemColors and backgroundImages.
* @param base The base Theme object.
* @param overrides The partial Theme object with overrides.
* @returns A new Theme object with overrides applied.
*/
function mergeThemes(base, overrides) {
	const mergedTheme = { ...base };
	if (overrides.name !== void 0) mergedTheme.name = overrides.name;
	if (overrides.default !== void 0) mergedTheme.default = overrides.default;
	if (overrides.system_colors) mergedTheme.system_colors = {
		...base.system_colors,
		...overrides.system_colors
	};
	if (overrides.background_images) mergedTheme.background_images = {
		...base.background_images,
		...overrides.background_images
	};
	return mergedTheme;
}
/**
* Converts RGB values (0-255) to an HSL Color object.
* @param r Red value (0-255).
* @param g Green value (0-255).
* @param b Blue value (0-255).
* @returns An HSL Color object.
*/
function rgbToHsl(r, g, b) {
	r = clamp(r, 0, 255);
	g = clamp(g, 0, 255);
	b = clamp(b, 0, 255);
	const rNorm = r / 255;
	const gNorm = g / 255;
	const bNorm = b / 255;
	const max = Math.max(rNorm, gNorm, bNorm);
	const min = Math.min(rNorm, gNorm, bNorm);
	let h = 0;
	let s = 0;
	const l = (max + min) / 2;
	if (max !== min) {
		const d = max - min;
		s = l > .5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case bNorm:
				h = (rNorm - gNorm) / d + 4;
				break;
			case gNorm:
				h = (bNorm - rNorm) / d + 2;
				break;
			case rNorm:
				h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
				break;
		}
		h /= 6;
	}
	const hue = Math.round(h * 360);
	const saturation = Math.round(s * 100);
	const lightness = Math.round(l * 100);
	return {
		hue,
		lightness,
		saturation
	};
}
/**
* Calculates the relative luminance of an RGB color.
* Based on WCAG 2.x guidelines.
* @param r Red value (0-255).
* @param g Green value (0-255).
* @param b Blue value (0-255).
* @returns The relative luminance (0-1).
*/
function rgbToLuminance(r, g, b) {
	const channelLuminance = (channel) => {
		const srgb = channel / 255;
		return srgb <= .03928 ? srgb / 12.92 : Math.pow((srgb + .055) / 1.055, 2.4);
	};
	const lumR = channelLuminance(r);
	const lumG = channelLuminance(g);
	const lumB = channelLuminance(b);
	return .2126 * lumR + .7152 * lumG + .0722 * lumB;
}
/**
* Saturates a color by a given percentage.
* @param color The Color object.
* @param amount The percentage amount to saturate by (0-100).
* @returns A new Color object.
*/
function saturateColor(color, amount) {
	const newSaturation = clamp(color.saturation + amount, 0, 100);
	return {
		...color,
		saturation: newSaturation
	};
}
/**
* Validates if an object conforms to the Theme interface structure.
* @param data The object to validate.
* @returns True if the object is a valid Theme, false otherwise.
*/
function validateTheme(data) {
	if (typeof data !== "object" || data === null) return false;
	if (typeof data.id !== "string" || typeof data.name !== "string") return false;
	if (!isValidSystemColors(data.systemColors)) return false;
	if (!isValidBackgroundImages(data.backgroundImages)) return false;
	if (data.default !== void 0 && typeof data.default !== "boolean") return false;
	return true;
}
/**
* Clamps a value between a minimum and maximum.
* @param value The value to clamp.
* @param min The minimum allowed value.
* @param max The maximum allowed value.
* @returns The clamped value.
*/
function clamp(value, min, max) {
	return Math.max(min, Math.min(value, max));
}

//#region src/hooks/useTheme.tsx
/**
* Higher-Order Component (HoC) for managing theme application at the root level.
*
* This HoC is used to control the theme for the Root component, ensuring proper
* theme management throughout the application. It's an alternative to using
* React Context, which is the current best practice, but we've chosen a different
* approach here with global state management.
*
* Wrapping a component in this HoC will ensure that the theme is applied to the
* <html> element of the page, so this HoC should be used for the Root component
* only.
*
* The HoC:
* 1. Retrieves the current theme ID from the global app store using useThemeIdAndSetter.
* 2. Retrieves the list of available themes from plugin metadata using usePluginMeta.
* 3. Uses an effect to find the selected or default theme and apply it using the utility function.
* 4. Wraps the provided component, passing through all props.
*
* @param Component - The React component to be wrapped.
* @returns A new component with theme management capabilities.
*/
/**
* Hook to get the currently selected theme ID and the setter function.
* This hook directly uses the UI store.
*/
const useThemeIdAndSetter = () => {
	const theme = useUIStore((state) => state.theme);
	const setTheme = useUIStore((state) => state.setTheme);
	return {
		setTheme,
		theme
	};
};
/**
* Hook to get the full Theme object based on the selected theme ID and available themes from meta.
*/
const useTheme = () => {
	const { theme: selectedThemeId } = useThemeIdAndSetter();
	const themes = usePluginMeta("dashboard", "themes");
	if (selectedThemeId && Array.isArray(themes) && themes.length > 0) {
		const persistedTheme = getThemeById(themes, selectedThemeId);
		if (persistedTheme) return persistedTheme;
	}
	if (!themes || themes.length === 0) return void 0;
	let theme = getThemeById(themes, selectedThemeId);
	if (!theme) theme = themes.find((t) => t.default);
	if (!theme && themes.length > 0) theme = themes[0];
	return theme;
};
const withTheme = (Component) => {
	return function WithTheme(props) {
		const { theme: selectedThemeId } = useThemeIdAndSetter();
		const themes = usePluginMeta("dashboard", "themes");
		dashboard__loadShare__react__loadShare__.useEffect(() => {
			if (!themes || !Array.isArray(themes) || themes.length === 0) return;
			if (selectedThemeId) {
				const persistedTheme = getThemeById(themes, selectedThemeId);
				if (persistedTheme) {
					applyThemeStyles(persistedTheme);
					return;
				}
			}
			const themeToApply = getThemeById(themes, selectedThemeId) || themes.find((t) => t.default) || themes[0];
			if (themeToApply) applyThemeStyles(themeToApply);
			else console.warn("No theme found to apply.");
		}, [selectedThemeId, themes]);
		return /* @__PURE__ */ jsxRuntimeExports.jsx(Component, { ...props });
	};
};

//#region src/components/ThemeSwitcher.tsx
const ThemeSwitcher = () => {
	const { setTheme } = useThemeIdAndSetter();
	const themes = usePluginMeta("dashboard", "themes");
	if (!themes) return null;
	return /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Popover, { children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.PopoverTrigger, {
		asChild: true,
		children: /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
			size: "icon",
			variant: "ghost",
			children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.ThemeIcon, { className: "h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" }), /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
				className: "sr-only",
				children: "Toggle theme"
			})]
		})
	}), /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.PopoverContent, {
		className: "w-56",
		children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
			className: "flex flex-col space-y-2",
			children: themes.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
				className: "text-left",
				onClick: () => setTheme(t.id),
				variant: "ghost",
				children: t.name
			}, t.id))
		})
	})] });
};

//#region src/images/lume-logo.png
var img = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPYAAABNCAYAAACVH5l+AAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAASGSURBVHgB7d1NiFZVHMfx/5RFLzZNJaJD4ZQQ9EJa2KI2iQQtWkTRoldoUVEQ7aIWFWOrFm1MKoIghBa1KCIIes/IhQilVGJR4dCLjq8zvqCi4vF3vKI+M885jvf9Hr4f+HMu9zn3uc/A/LjPc+4995q1lHNukWrCneaXlxmA7lKIf3fT7TAA3aQAz3NhCw1A1HnWThdFXrvMAES1NdgACiDYQIIINpAggg0kiGADCSLYQIIINpAggg0kiGADCSLYQIIaCbZzbpYvA1CJWoOtMF+oekeLB1RHtPyJaoEB6C6F+I0+s7W+79NvJDK7a7EBaA+F8kAgrCNT+hFsoIC6f2NfHFg/zwCUhlFxIEEEG0hQW4N9OPJa7O4qAKy9wd6q2h947VoDENXKYA8MDDg144GX7zAAUW3+jf1jYP3jOuV1hQEIanOwVwfWD6neNQDN01F2buSik5v79B9S7Ylss0F1uwGYps6JGDdGXpucukK/sycV3BVafCWwzSLVOvVZr3aj6m+L2636TO87ZgDKoQCuDBx590a28Uft3a4846rrDEBxCtN81b+BsP1wlm3vduX6woDEVT54piBdruZt1dWBLp/GttdX52/ULLfy3GQA8jt5tN0QOXoec1NmdkXe6zHV/6649QYk7sTgmf7Z71TzkOoaK8eVqlssOzUVs2qmg1nq94E+5xotjqoetfwDfysNSNyAP6qq/covW70mVLflGaXWZx5Ws1S1TOUfq+u/5vupn7Gw/6N6S/t704DUKSQ/uWY8aQCqoYAddPV70QBURyHb5OrjT3ndYwCqpaA95aq3VfWq6hIDULkTA2YK3CNqnlPNt3LsUf1i2WWeX2rAaq3VSH/PHDWzLRtMK+Oy2XF/iasBqI+CPKi6X7VKtdlVY9QA1EOBe0G1y9XjeQNQHYVsWPWtq9fXBnRAJ5+f5bLLUP0TREasXrMN6IDCwXbZJA8/N3o40u2oartqiwah/rJi+ztfzUdWf6i9Dw1InUK20J37YNWEyx7G97Dl4LLTZk14z4COKHR9uP7Zf1Zzq+U3pnpWR/EZzZHW/vwkld9Ug5Fuf6g+V21S7bRybNRn/NOA1Clkc1x5XpvhPp+OvMdO1X0GID+F6CqXzacuy1mnU6rPmsj2NxiA4hSm71y5nons61LVocB27xuAcihQC1RrXXn8nUmHAvtaEtluqQE4pZSbK7jszp9zI138g/QuUPnfwPda/FTVcg1UjfbZxwNqPu63gfrXfZMIAGdSQGepXo8cff3psME+2z0R6P+fAehR+yN+dHA9qnrJwo/p8V/Fl9jM7TMAPZp8dpcPdyiU3IwBKKCxYJ+c3xyaVHG9Acit6adtrgusX2wAcms62NsMQOna/HxsADkRbCBBKQT7iAHo0aVgjwXW/2oAenQm2Do9ttqmX1LqT5m9bAB6dOqeZwr3g/7SUi3eZdm9y1do3WYD0B6R678JK1AAo+JAggg2kCCCDSSIYAMJIthAggg2kCCCDSSIYAMJIthAggg2kCCCDSSo6WDvCqyfNAAAcNpxd1XglbBqdCEAAAAASUVORK5CYII=";
var lume_logo_default = img;

const logoPng = lume_logo_default;

//#region src/components/LumeLogo.tsx
function LumeLogo({ className, imageClassName }) {
	return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare__react_mf_2_router__loadShare__.Link, {
		className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("flex items-center space-x-2", className),
		to: "/",
		children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
			alt: "Lume logo",
			className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("h-10", imageClassName),
			src: logoPng
		})
	});
}

//#region src/hooks/useMenuItems.ts
function useMenuItems() {
	const menuItems = useAppStore((state) => state.menuItems);
	const addMenuItem = useAppStore((state) => state.addMenuItem);
	const removeMenuItem = useAppStore((state) => state.removeMenuItem);
	return {
		addMenuItem,
		getMenuItems: () => menuItems,
		menuItems,
		removeMenuItem
	};
}

//#region src/components/layout/SidebarContext.tsx
const SidebarContext = dashboard__loadShare__react__loadShare__.createContext(void 0);
const SidebarProvider = ({ children }) => {
	const [isCollapsed, setIsCollapsed] = dashboard__loadShare__react__loadShare__.useState(false);
	const toggleCollapsed = () => {
		setIsCollapsed(!isCollapsed);
	};
	return /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarContext.Provider, {
		value: {
			isCollapsed,
			toggleCollapsed
		},
		children
	});
};
const useSidebarContext = () => {
	const context = dashboard__loadShare__react__loadShare__.useContext(SidebarContext);
	if (!context) throw new Error("useSidebarContext must be used within a SidebarProvider");
	return context;
};

//#region src/components/MainNavigation.tsx
const isRouteActive = (item, currentPathname) => {
	const itemPath = item.path;
	if (!itemPath) return false;
	if (itemPath === currentPathname) return true;
	if (itemPath !== "/" && currentPathname.startsWith(`${itemPath}/`)) return true;
	return false;
};
const isChildRouteActive = (child, parent, currentPathname) => {
	if (child.index && child.path === "" && parent.path === currentPathname) return true;
	return isRouteActive(child, currentPathname);
};
const NavItemContent = ({ IconComponent, isCollapsed, item }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
	className: "flex items-center",
	children: [IconComponent && /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
		className: "w-5 h-5 mr-2",
		children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconComponent, {})
	}), /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
		className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn({ hidden: isCollapsed }),
		children: item.label
	})]
});
const CollapseMenuButton = ({ active, icon: Icon, isOpen, item, label, onItemClick, resetKey, submenus }) => {
	const location = dashboard__loadShare__react_mf_2_router__loadShare__.useLocation();
	const pathname = location.pathname;
	const isSubmenuActive = submenus.some((submenu) => submenu.active === void 0 ? submenu.href === pathname : submenu.active);
	const [isOpenState, setIsOpenState] = React3.useState(active || isSubmenuActive);
	const headerHref = item.path || submenus[0]?.href;
	React3.useEffect(() => {
		setIsOpenState(active || isSubmenuActive);
	}, [active, isSubmenuActive]);
	React3.useEffect(() => {
		if (resetKey) setIsOpenState(false);
	}, [resetKey]);
	return /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Collapsible, {
		className: "w-full",
		onOpenChange: setIsOpenState,
		open: isOpenState,
		children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.CollapsibleTrigger, {
			asChild: true,
			className: "[&[data-state=open]>div>div>svg]:rotate-180 mb-1",
			children: /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
				className: "w-full justify-start h-10",
				variant: active || isSubmenuActive ? "secondary" : "ghost",
				children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
					className: "w-full items-center flex justify-between",
					children: [/* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
						className: "flex items-center",
						children: [Icon && /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
							className: "mr-4",
							children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 18 })
						}), headerHref && item.linkable !== false ? /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.Link, {
							"aria-label": label,
							onClick: (e) => e.stopPropagation(),
							onKeyDown: (e) => {
								if (e.key === " ") {
									e.preventDefault();
									e.stopPropagation();
								}
								if (e.key === "Enter") e.stopPropagation();
							},
							to: headerHref,
							children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
								className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn({
									"-translate-x-96 opacity-0": !isOpen,
									"translate-x-0 opacity-100": isOpen
								}),
								children: label
							})
						}) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
							"aria-disabled": "true",
							className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn({
								"-translate-x-96 opacity-0": !isOpen,
								"translate-x-0 opacity-100": isOpen
							}),
							children: label
						})]
					}), /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
						className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("whitespace-nowrap", isOpen ? "translate-x-0 opacity-100" : "-translate-x-96 opacity-0"),
						children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, {
							className: "transition-transform duration-200",
							size: 18
						})
					})]
				})
			})
		}), /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.CollapsibleContent, {
			className: "overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
			children: submenus.map(({ active: active$1, href, icon: Icon$1, label: label$1 }, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
				asChild: true,
				className: "w-full justify-start h-10 mb-1",
				variant: active$1 === void 0 && pathname === href || active$1 ? "secondary" : "ghost",
				children: /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.Link, {
					onClick: () => {
						if (onItemClick) onItemClick();
					},
					to: href,
					children: [/* @__PURE__ */ jsxRuntimeExports.jsx("span", {
						className: "mr-4 ml-2",
						children: Icon$1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon$1, { size: 18 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Dot, { size: 18 })
					}), /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
						className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn({
							"-translate-x-96 opacity-0": !isOpen,
							"translate-x-0 opacity-100": isOpen
						}),
						children: label$1
					})]
				})
			}, index))
		})]
	});
};
const LinkableNavItem = ({ active, IconComponent, isCollapsed, item, onItemClick }) => /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
	asChild: true,
	className: "w-full justify-start h-10 mb-1",
	variant: active ? "secondary" : "ghost",
	children: /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.Link, {
		onClick: onItemClick,
		to: item.path || "",
		children: /* @__PURE__ */ jsxRuntimeExports.jsx(NavItemContent, {
			active,
			IconComponent,
			isCollapsed,
			item,
			onItemClick
		})
	})
});
const NonLinkableNavItem = ({ active, IconComponent, isCollapsed, item, onItemClick }) => /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
	className: "w-full justify-start h-10 mb-1",
	onClick: onItemClick,
	variant: active ? "secondary" : "ghost",
	children: /* @__PURE__ */ jsxRuntimeExports.jsx(NavItemContent, {
		active,
		IconComponent,
		isCollapsed,
		item,
		onItemClick
	})
});
const NavItem = React3.forwardRef(({ active, item, onItemClick }, ref) => {
	const { isCollapsed } = useSidebarContext();
	let IconComponent = void 0;
	if (item.icon) IconComponent = item.icon;
	return /* @__PURE__ */ jsxRuntimeExports.jsx("li", {
		ref,
		children: item.linkable !== false && Boolean(item.path) ? /* @__PURE__ */ jsxRuntimeExports.jsx(LinkableNavItem, {
			active,
			IconComponent,
			isCollapsed,
			item,
			onItemClick
		}) : /* @__PURE__ */ jsxRuntimeExports.jsx(NonLinkableNavItem, {
			active,
			IconComponent,
			isCollapsed,
			item,
			onItemClick
		})
	});
});
NavItem.displayName = "NavItem";
const MainNavigation = ({ isOpen, onItemClick }) => {
	const menu = useMenuItems();
	const location = dashboard__loadShare__react_mf_2_router__loadShare__.useLocation();
	const pathname = location.pathname;
	const renderMenuItem = (item) => {
		const active = isRouteActive(item, pathname);
		if (item.children && item.children.length > 0) {
			const submenus = item.children.map((child) => ({
				active: isChildRouteActive(child, item, pathname),
				href: child.index ? item.path : child.path || "",
				icon: child.icon,
				label: child.label
			}));
			let CollapseMenuIcon = void 0;
			if (item.icon) CollapseMenuIcon = item.icon;
			return /* @__PURE__ */ jsxRuntimeExports.jsx(CollapseMenuButton, {
				active,
				icon: CollapseMenuIcon,
				isOpen,
				item,
				label: item.label,
				onItemClick,
				resetKey: typeof onItemClick === "function" ? pathname : void 0,
				submenus
			}, item.id);
		} else return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TooltipProvider, {
			disableHoverableContent: true,
			children: /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Tooltip, {
				delayDuration: 100,
				children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ jsxRuntimeExports.jsx(NavItem, {
						active,
						item,
						onItemClick
					})
				}), isOpen === false && /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TooltipContent, {
					side: "right",
					children: item.label
				})]
			})
		}, item.id);
	};
	return /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.ScrollArea, {
		className: "[&>div>div[style]]:!block",
		children: /* @__PURE__ */ jsxRuntimeExports.jsx("nav", {
			className: "mt-8 h-full w-full flex flex-col",
			children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", {
				className: "flex-1 flex flex-col items-start space-y-1 px-2 overflow-y-auto overflow-x-hidden",
				children: menu.getMenuItems().map(renderMenuItem)
			})
		})
	});
};

//#region src/components/layout/SidebarToggle.tsx
function SidebarToggle({ isOpen, setIsOpen }) {
	return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
		className: "invisible lg:visible absolute top-[12px] -right-[20px] z-20",
		children: /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
			"aria-label": isOpen ? "Close sidebar" : "Open sidebar",
			className: "rounded-md w-8 h-8",
			onClick: () => setIsOpen?.(),
			size: "icon",
			variant: "outline",
			children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("h-4 w-4 transition-transform ease-in-out duration-700", isOpen === false ? "rotate-180" : "rotate-0") })
		})
	});
}

//#region src/components/layout/DesktopSidebar.tsx
function DesktopSidebar() {
	const { isCollapsed, toggleCollapsed } = useSidebarContext();
	return /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", {
		className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("hidden md:flex", "fixed left-0 top-0 z-20 flex h-screen -translate-x-full flex-col transition-[width] duration-300 ease-in-out lg:translate-x-0", {
			"md:w-32": isCollapsed,
			"md:w-72": !isCollapsed
		}),
		children: [/* @__PURE__ */ jsxRuntimeExports.jsx(SidebarToggle, {
			isOpen: !isCollapsed,
			setIsOpen: toggleCollapsed
		}), /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
			className: "relative flex h-full flex-col justify-between px-3 py-4",
			children: [/* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
				asChild: true,
				className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("mb-1 transition-transform duration-300 ease-in-out", !isCollapsed ? "translate-x-1" : "translate-x-0"),
				variant: "link",
				children: /* @__PURE__ */ jsxRuntimeExports.jsx(LumeLogo, { imageClassName: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("transition transition-all", { "h-5": isCollapsed }) })
			}), /* @__PURE__ */ jsxRuntimeExports.jsx(MainNavigation, { isOpen: !isCollapsed })] }), /* @__PURE__ */ jsxRuntimeExports.jsxs("span", {
				className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("text-foreground/60 mb-4 space-y-1 transition-opacity duration-300", {
					"opacity-0": isCollapsed,
					"opacity-100": !isCollapsed,
					"text-sm": isCollapsed
				}),
				children: [
					/* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Freedom" }),
					/* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Privacy" }),
					/* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Ownership" })
				]
			})]
		})]
	});
}
var DesktopSidebar_default = DesktopSidebar;

//#region src/components/layout/MobileMenu.tsx
function MobileMenu() {
	const [open, setOpen] = React3.useState(false);
	return /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Sheet, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.SheetTrigger, {
			asChild: true,
			className: "lg:hidden ml-2",
			children: /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
				className: "h-8 w-8",
				size: "icon",
				variant: "outline",
				children: /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { size: 18 })
			})
		}), /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.SheetContent, {
			className: "sm:w-72 px-3 h-full flex flex-col",
			side: "right",
			children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.SheetHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
				asChild: true,
				className: "flex justify-center items-center pb-2 pt-1",
				variant: "link",
				children: /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.Link, {
					className: "flex items-center gap-2",
					to: "/dashboard",
					children: /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.SheetTitle, {
						className: "font-bold text-lg",
						children: "Portal"
					})
				})
			}) }), /* @__PURE__ */ jsxRuntimeExports.jsx(MainNavigation, {
				isOpen: true,
				onItemClick: () => setOpen(false)
			})]
		})]
	});
}

//#region src/components/layout/UserNav.tsx
function UserNav() {
	const { mutate: logout } = dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useLogout();
	const { data: identity } = dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useGetIdentity();
	const firstName = identity?.firstName || "";
	const lastName = identity?.lastName || "";
	const email = identity?.email || "";
	return /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DropdownMenu, { children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TooltipProvider, {
		disableHoverableContent: true,
		children: /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Tooltip, {
			delayDuration: 100,
			children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TooltipTrigger, {
				asChild: true,
				children: /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DropdownMenuTrigger, {
					asChild: true,
					children: /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
						className: "relative h-8 w-8 rounded-full",
						variant: "outline",
						children: /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Avatar, {
							className: "h-8 w-8",
							children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.AvatarImage, {
								alt: firstName || lastName ? `${firstName} ${lastName}`.trim() : email || "User avatar",
								src: identity?.avatar || "/placeholder.svg"
							}), /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.AvatarFallback, {
								className: "bg-transparent",
								children: firstName || lastName ? (firstName || lastName).charAt(0).toUpperCase() : email?.charAt(0)?.toUpperCase() || "?"
							})]
						})
					})
				})
			}), /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.TooltipContent, {
				side: "bottom",
				children: "Profile"
			})]
		})
	}), /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DropdownMenuContent, {
		align: "end",
		className: "w-56",
		forceMount: true,
		children: [
			/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DropdownMenuLabel, {
				className: "font-normal",
				children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
					className: "flex flex-col space-y-1",
					children: [/* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
						className: "text-sm font-medium leading-none",
						children: [
							firstName,
							" ",
							lastName
						]
					}), /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
						className: "text-xs leading-none text-muted-foreground",
						children: email
					})]
				})
			}),
			/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DropdownMenuSeparator, {}),
			/* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DropdownMenuGroup, { children: [/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DropdownMenuItem, {
				asChild: true,
				className: "hover:cursor-pointer",
				children: /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.Link, {
					className: "flex items-center",
					to: "/dashboard",
					children: [/* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGrid, { className: "w-4 h-4 mr-3 text-muted-foreground" }), "Dashboard"]
				})
			}), /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DropdownMenuItem, {
				asChild: true,
				className: "hover:cursor-pointer",
				children: /* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.Link, {
					className: "flex items-center",
					to: "/account",
					children: [/* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-4 h-4 mr-3 text-muted-foreground" }), "Account"]
				})
			})] }),
			/* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DropdownMenuSeparator, {}),
			/* @__PURE__ */ jsxRuntimeExports.jsxs(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.DropdownMenuItem, {
				className: "hover:cursor-pointer",
				onClick: () => logout(),
				children: [/* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "w-4 h-4 mr-3 text-muted-foreground" }), "Sign out"]
			})
		]
	})] });
}

//#region src/components/layout/GeneralLayout.tsx
function GeneralLayoutComponent({ children }) {
	return /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarProvider, { children: [/* @__PURE__ */ jsxRuntimeExports.jsx(DesktopSidebar_default, {}), /* @__PURE__ */ jsxRuntimeExports.jsx("main", {
		className: "transition-[margin-left] duration-300 ease-in-out lg:ml-72",
		children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [/* @__PURE__ */ jsxRuntimeExports.jsx("header", {
			className: "bg-background/95 supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary sticky top-0 z-10 w-full shadow-md backdrop-blur",
			children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
				className: "flex items-center justify-end gap-2 p-8 sm:mx-8",
				children: [
					/* @__PURE__ */ jsxRuntimeExports.jsx(ThemeSwitcher, {}),
					/* @__PURE__ */ jsxRuntimeExports.jsx(UserNav, {}),
					/* @__PURE__ */ jsxRuntimeExports.jsx(MobileMenu, {})
				]
			})
		}), /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
			className: "mx-4 my-8 sm:mx-8",
			children
		})] })
	})] });
}
const GeneralLayout = withTheme(GeneralLayoutComponent);

//#region src/components/layout/PageHeader.tsx
function PageHeader({ title, description, children }) {
	return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
		className: "flex items-center justify-between",
		children: [/* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [/* @__PURE__ */ jsxRuntimeExports.jsx("h1", {
			className: "text-2xl font-semibold text-white",
			children: title
		}), /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
			className: "text-gray-400 mt-1",
			children: description
		})] }), children]
	});
}

//#region src/components/TableContainer.tsx
function TableContainer({ children, className }) {
	return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
		className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("rounded-lg border shadow-sm p-6", className),
		children
	});
}

//#region src/components/ThemedBadge.tsx
function ThemedBadge({ children, className, config, value, variant,...restCoreProps }) {
	const { base = "", dark = "", hover = "", label } = config[value] || {};
	const wrapperClassName = dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", base, hover, dark, className);
	return /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
		className: wrapperClassName,
		children: children ? children : /* @__PURE__ */ jsxRuntimeExports.jsx(dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Badge, {
			variant,
			...restCoreProps,
			children: label || value.replace(/_/g, " ")
		})
	});
}

//#region src/hooks/useAccountSubdomain.ts
function useAccountSubdomain() {
	const dashboardSubdomain = usePluginMeta("dashboard", "subdomain");
	return dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.getAccountSubdomain(dashboardSubdomain);
}

//#region src/hooks/useApiUrl.ts
function useApiUrl() {
	const { framework, isLoading } = dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.useFramework();
	if (!isLoading) return framework?.portalUrl ?? dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.getApiBaseUrl({ allowLocalhost: true });
	const apiUrl = dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.getApiBaseUrl({ allowLocalhost: true });
	if (apiUrl === false) return "";
	return apiUrl;
}

//#region src/hooks/useAccountUrl.ts
const LEADING_SLASHES_REGEX = /^\/+/;
function useAccountUrl(path) {
	const accountSubdomain = useAccountSubdomain();
	const apiUrl = useApiUrl();
	const { hostname: currentHostname, protocol } = dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.getCurrentLocation();
	const normalizedPath = `/${String(path ?? "").replace(LEADING_SLASHES_REGEX, "").replace(/\/+$/, "")}`;
	if (!apiUrl) return normalizedPath;
	let parsedApiUrl;
	try {
		parsedApiUrl = new URL(apiUrl);
		if (["127.0.0.1", "localhost"].includes(parsedApiUrl.hostname)) return normalizedPath;
	} catch {
		return normalizedPath;
	}
	let host = dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.cleanTrailingSlashes(accountSubdomain || currentHostname);
	if (parsedApiUrl && parsedApiUrl.hostname !== accountSubdomain) host = dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.cleanTrailingSlashes(currentHostname);
	return new URL(normalizedPath, `${protocol}//${host}`).toString();
}

//#region src/hooks/usePortalMeta.ts
function usePortalMeta() {
	return usePortalStore((state) => state.meta);
}

//#region src/hooks/useFeatureFlag.ts
function useFeatureFlag(featureName) {
	const portalMeta = usePortalMeta();
	const flagValue = portalMeta?.feature_flags?.[featureName.toUpperCase()];
	return !!flagValue;
}

//#region src/hooks/useLoginUrl.ts
function useLoginUrl() {
	return useAccountUrl("/login");
}

//#region src/hooks/usePortalUrl.ts
function usePortalUrl() {
	const portalUrl = usePortalStore((state) => state.portalUrl);
	return isValidUrl(portalUrl) ? portalUrl : `https://${portalUrl}`;
}
function isValidUrl(url) {
	if (!url) return false;
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

//#region src/hooks/useProtocolDomain.ts
function useProtocolDomain(proto) {
	const portalMeta = usePortalMeta();
	portalMeta?.domain || dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.getCurrentLocation().hostname;
	return dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.getProtocolDomain(proto, { isRootDomain: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.env.VITE_PORTAL_DOMAIN_IS_ROOT === "true" });
}

//#region src/hooks/useRegisterUrl.ts
function useRegisterUrl() {
	return useAccountUrl("/register");
}

//#region src/hooks/useResetPasswordUrl.ts
function useResetPasswordUrl() {
	return useAccountUrl("/reset-password");
}

//#region src/types.ts
/**
* Standard error type for account-related operations
*/
var AccountError = class extends Error {
	details;
	fields;
	constructor(message, statusCode, details, fields) {
		super(message);
		this.statusCode = statusCode;
		this.name = "AccountError";
		this.details = details;
		this.fields = fields;
	}
	toJSON() {
		return {
			details: this.details,
			fields: this.fields,
			message: this.message,
			statusCode: this.statusCode
		};
	}
};
/**
* Helper function to normalize field values
*/
function normalizeFields(fields) {
	if (!fields) return void 0;
	const normalized = {};
	for (const [key, value] of Object.entries(fields)) if (Array.isArray(value)) normalized[key] = value.join(", ");
	else if (value === null || value === void 0) normalized[key] = "";
	else if (typeof value === "object") normalized[key] = JSON.stringify(value);
	else normalized[key] = String(value);
	return normalized;
}
/**
* Extract error details from a response JSON object
*/
function extractErrorDetails(data) {
	let result = {
		message: "",
		details: void 0,
		fields: void 0
	};
	if (data?.error) {
		if (typeof data.error === "string") result.message = data.error;
		else if (data.error?.message) {
			result.message = data.error.message;
			result.details = data.error.details;
			result.fields = normalizeFields(data.error.fields);
		}
	} else if (data?.message) {
		result.message = data.message;
		result.details = data.details;
		result.fields = normalizeFields(data.fields);
	} else result.message = JSON.stringify(data);
	if (!result.fields) result.fields = normalizeFields(data?.fields) || normalizeFields(data?.error?.fields);
	return result;
}
/**
* Convert a failed fetch Response to an AccountError
* @param response The failed Response object
* @returns A properly formatted AccountError
*/
async function handleFetchError(response) {
	try {
		const contentType = response.headers.get("content-type");
		const isJson = contentType?.toLowerCase()?.includes("json");
		const clone = response.clone();
		let errorData;
		if (isJson) try {
			errorData = await response.json();
		} catch {
			const txt = await clone.text().catch(() => "");
			errorData = txt || response.statusText;
		}
		else {
			errorData = await response.text();
			if (!errorData) errorData = response.statusText;
		}
		const { message, details, fields } = typeof errorData === "string" ? { message: errorData } : extractErrorDetails(errorData);
		return new AccountError(message || "Unknown error", response.status, details, fields);
	} catch (e) {
		return new AccountError(response.statusText || "Unknown error", response.status, { cause: e });
	}
}
/**
* Convert an unknown error to an AccountError
* @param e The unknown error
* @returns A properly formatted AccountError
*/
function handleUnknownError(e) {
	if (e instanceof AccountError) return e;
	if (e instanceof Error) return new AccountError(e.message, 500, { cause: e });
	if (typeof e === "object" && e !== null) {
		let msg;
		try {
			msg = JSON.stringify(e);
		} catch {
			msg = String(e);
		}
		return new AccountError(msg, 500, { cause: e });
	}
	return new AccountError(String(e), 500);
}

//#region src/account.ts
var AccountApi = class {
	_jwtToken;
	apiUrl;
	/**
	* Gets the current JWT token
	* @returns {string|undefined} The current JWT token or undefined if not set
	*/
	get jwtToken() {
		return this._jwtToken;
	}
	/**
	* Creates a new AccountApi instance
	* @param {string} apiUrl - The base API URL
	*/
	constructor(apiUrl) {
		const apiUrlParsed = new URL(apiUrl);
		apiUrlParsed.hostname = `account.${apiUrlParsed.hostname}`;
		this.apiUrl = apiUrlParsed.toString();
	}
	/**
	* Clears the current JWT token
	*/
	clearToken() {
		this._jwtToken = void 0;
	}
	/**
	* Confirm a password reset
	* @param passwordResetVerifyRequest Password reset verification details
	* @returns Result indicating success or failure
	*/
	async confirmPasswordReset(passwordResetVerifyRequest) {
		return this.fetchJson("/api/account/password-reset/confirm", {
			body: JSON.stringify(passwordResetVerifyRequest),
			method: "POST"
		});
	}
	/**
	* Disable OTP for two-factor authentication
	* @param otpDisableRequest OTP disable request details
	* @returns Result indicating success or failure
	*/
	async disableOtp(otpDisableRequest) {
		return this.fetchJson("/api/auth/otp/disable", {
			body: JSON.stringify(otpDisableRequest),
			method: "POST"
		});
	}
	/**
	* Generate OTP for two-factor authentication
	* @returns Result containing OTP response
	*/
	async generateOtp() {
		return this.fetchJson("/api/auth/otp/generate", { method: "GET" });
	}
	/**
	* Get account information
	* @returns Result containing account info
	*/
	async info() {
		return this.fetchJson("/api/account", { method: "GET" });
	}
	/**
	* Login to the account service
	* @param loginRequest Login credentials
	* @returns Result containing login response or error
	*/
	async login(loginRequest) {
		const result = await this.fetchJson("/api/auth/login", {
			body: JSON.stringify(loginRequest),
			method: "POST"
		});
		if (result.success && result.data?.token) this.setToken(result.data.token);
		return result;
	}
	/**
	* Logout from the account service
	* @returns Result indicating success or failure
	*/
	async logout() {
		const result = await this.fetchJson("/api/auth/logout", { method: "POST" });
		if (result.success) this.clearToken();
		return result;
	}
	/**
	* Check authentication status
	* @returns Result containing ping response
	*/
	async ping() {
		const result = await this.fetchJson("/api/auth/ping", { method: "POST" });
		if (result.success && result.data?.token) this.setToken(result.data.token);
		return result;
	}
	/**
	* Register a new account
	* @param registerRequest Registration details
	* @returns Result indicating success or failure
	*/
	async register(registerRequest) {
		return this.fetchJson("/api/auth/register", {
			body: JSON.stringify(registerRequest),
			method: "POST"
		});
	}
	/**
	* Request account deletion
	* @returns Result indicating success or failure
	*/
	async requestAccountDeletion() {
		return this.fetchJson("/api/account/delete", { method: "DELETE" });
	}
	/**
	* Request email verification to be resent
	* @param resendRequest Email details for verification
	* @returns Result indicating success or failure
	*/
	async requestEmailVerification(resendRequest) {
		return this.fetchJson("/api/account/verify-email/resend", {
			body: JSON.stringify(resendRequest),
			method: "POST"
		});
	}
	/**
	* Request a password reset
	* @param passwordResetRequest Password reset request details
	* @returns Result indicating success or failure
	*/
	async requestPasswordReset(passwordResetRequest) {
		return this.fetchJson("/api/account/password-reset/request", {
			body: JSON.stringify(passwordResetRequest),
			method: "POST"
		});
	}
	/**
	* Sets the JWT token for authentication
	* @param {string} token - The JWT token to set
	*/
	setToken(token) {
		this._jwtToken = token;
	}
	/**
	* Update account email address
	* @param email New email address
	* @param password Current password for verification
	* @returns Result indicating success or failure
	*/
	async updateEmail(email, password) {
		return this.fetchJson("/api/account/update-email", {
			body: JSON.stringify({
				email,
				password
			}),
			method: "POST"
		});
	}
	/**
	* Update account password
	* @param currentPassword Current password for verification
	* @param newPassword New password to set
	* @returns Result indicating success or failure
	*/
	async updatePassword(currentPassword, newPassword) {
		return this.fetchJson("/api/account/update-password", {
			body: JSON.stringify({
				current_password: currentPassword,
				new_password: newPassword
			}),
			method: "POST"
		});
	}
	/**
	* Get upload limit information
	* @returns Result containing upload limit info
	*/
	async uploadLimit() {
		return this.fetchJson("/api/upload-limit", { method: "GET" });
	}
	/**
	* Validate OTP for two-factor authentication login
	* @param otpValidateRequest OTP validation details
	* @returns Result containing login response
	*/
	async validateOtp(otpValidateRequest) {
		const result = await this.fetchJson("/api/auth/otp/validate", {
			body: JSON.stringify(otpValidateRequest),
			method: "POST"
		});
		if (result.success && result.data?.token) this.setToken(result.data.token);
		return result;
	}
	/**
	* Verify email address
	* @param verifyEmailRequest Email verification details
	* @param login Optional flag to enable auto-login after verification
	* @returns Result indicating success or failure
	*/
	async verifyEmail(verifyEmailRequest, login) {
		const url = new URL("/api/account/verify-email", this.apiUrl);
		if (login === true) url.searchParams.set("login", "true");
		return this.fetchJson(url.toString(), {
			body: JSON.stringify(verifyEmailRequest),
			method: "POST"
		});
	}
	/**
	* Verify OTP for enabling two-factor authentication
	* @param otpVerifyRequest OTP verification details
	* @returns Result indicating success or failure
	*/
	async verifyOtp(otpVerifyRequest) {
		return this.fetchJson("/api/auth/otp/verify", {
			body: JSON.stringify(otpVerifyRequest),
			method: "POST"
		});
	}
	/**
	* Builds fetch options with authorization headers
	* @param {RequestInit} [init] - Optional initial request options
	* @returns {RequestInit} The constructed request options
	* @private
	*/
	buildOptions(init = {}) {
		const headers = {
			"Content-Type": "application/json",
			...init.headers
		};
		if (this.jwtToken) headers.Authorization = `Bearer ${this.jwtToken}`;
		return {
			...init,
			credentials: "include",
			headers
		};
	}
	/**
	* Makes a JSON request to the API
	* @template T
	* @param {string} input - The API endpoint path or absolute URL
	* @param {RequestInit} [init] - Optional request initialization
	* @returns {Promise<Result<T>>} Promise resolving to the result
	* @private
	*/
	async fetchJson(input, init = {}) {
		try {
			const response = await fetch(new URL(input, this.apiUrl).toString(), this.buildOptions(init));
			if (!response.ok) return {
				error: await handleFetchError(response),
				success: false
			};
			if (this.isResponseEmpty(response)) return {
				data: void 0,
				success: true
			};
			try {
				const data = await response.json();
				return {
					data,
					success: true
				};
			} catch (parseError) {
				if (this.isResponseEmpty(response)) return {
					data: void 0,
					success: true
				};
				throw parseError;
			}
		} catch (e) {
			let error;
			if (e instanceof Response) error = await handleFetchError(e);
			else error = await handleUnknownError(e);
			return {
				error,
				success: false
			};
		}
	}
	/**
	* Checks if a response has an empty body based on status code or content-length header
	* @param {Response} response - The response to check
	* @returns {boolean} True if the response is empty, false otherwise
	* @private
	*/
	isResponseEmpty(response) {
		if (response.status === 204 || response.status === 205 || response.status === 304) return true;
		const contentLength = response.headers.get("content-length");
		return contentLength === "0" || contentLength && parseInt(contentLength, 10) === 0;
	}
};

//#region src/sdk.ts
var Sdk = class {
	accountApi;
	constructor(apiUrl) {
		if (!apiUrl) throw new Error("API URL is required");
		this.accountApi = new AccountApi(apiUrl);
	}
	account() {
		return this.accountApi;
	}
	setAuthToken(token) {
		this.accountApi.setToken(token);
	}
};

//#region src/hooks/useSdk.ts
let isGloballyInitialized = false;
const resetGloballyInitialized = () => {
	isGloballyInitialized = false;
};
function useSdk() {
	const apiUrl = useApiUrl();
	const { sdk } = usePortalStore((state) => ({ sdk: state.sdk }));
	const { setSdk } = usePortalActions();
	const initializationAttempted = dashboard__loadShare__react__loadShare__.useRef(false);
	dashboard__loadShare__react__loadShare__.useEffect(() => {
		if (apiUrl && !isGloballyInitialized && !initializationAttempted.current) {
			initializationAttempted.current = true;
			const initializeSdk = () => {
				if (!isGloballyInitialized) {
					isGloballyInitialized = true;
					const newSdk = new Sdk(apiUrl);
					setSdk(newSdk);
				}
			};
			initializeSdk();
		}
	}, [apiUrl, setSdk]);
	return sdk;
}

//#region src/types/badge.ts
const BADGE_THEME = {
	critical: {
		base: "bg-orange-100 text-orange-800",
		dark: "dark:bg-orange-900/30 dark:text-orange-400",
		hover: "hover:bg-orange-200"
	},
	default: {
		base: "bg-gray-100 text-gray-800",
		dark: "dark:bg-gray-800 dark:text-gray-200",
		hover: "hover:bg-gray-200"
	},
	destructive: {
		base: "bg-red-100 text-red-800",
		dark: "dark:bg-red-900/30 dark:text-red-400",
		hover: "hover:bg-red-200"
	},
	info: {
		base: "bg-cyan-100 text-cyan-800",
		dark: "dark:bg-cyan-900/30 dark:text-cyan-400",
		hover: "hover:bg-cyan-200"
	},
	secondary: {
		base: "bg-blue-100 text-blue-800",
		dark: "dark:bg-blue-900/30 dark:text-blue-400",
		hover: "hover:bg-blue-200"
	},
	success: {
		base: "bg-green-100 text-green-800",
		dark: "dark:bg-green-900/30 dark:text-green-400",
		hover: "hover:bg-green-200"
	},
	warning: {
		base: "bg-yellow-100 text-yellow-800",
		dark: "dark:bg-yellow-900/30 dark:text-yellow-400",
		hover: "hover:bg-yellow-200"
	}
};

//#region src/utils/asyncUtils.ts
function runWhenIdle(callback) {
	if (typeof requestIdleCallback !== "undefined") requestIdleCallback(callback);
	else setTimeout(callback, 200);
}

export { ActionItemType, ActionListRenderer, AppComponent, BADGE_THEME, BaseTable, BaseTableContent, BaseTableInner, Checkbox, CreateTableProvider, DataTable, DatePicker, DefaultPagination, DialogProvider, DialogRenderer, EmailInput, ErrorList, Field, FieldCheckbox, FileInput, FormFieldType, FormGroup, FormProvider, FormRenderer, GeneralLayout, GroupOrder, InlineAuthLinkBanner, Input, Loading, LumeLogo, PageHeader, RadioGroup, RichText, SchemaForm, Select, SkeletonLoader, Slider, StepSchemaForm, TableAction, TableActionMenu, TableContainer, TableEmptyState, TableLoadingState, TableProvider, Textarea, TextareaField, ThemeSwitcher, ThemedBadge, adapters, adjustHue, appStore, applyThemeStyles, createDefaultSystemColors, createDefaultTheme, createZeroSystemColors, darkenColor, desaturateColor, ensureWcagContrast, generateThemeCSS, getActionItemComponent, getContrastRatio, getFormComponent, getThemeById, helpers, hexToHsl, hslToRawString, hslToRgb, hslToString, isAlertDialog, isConfirmDialog, isCustomDialog, isFormDialog, isStepFormConfig, isValidBackgroundImages, isValidColor, isValidSystemColors, lightenColor, meetsWcagContrast, meetsWcagNonTextContrast, meetsWcagTextContrast, mergeThemes, metaStore, normalizeTableOptions, portalStore, registerActionItemComponent, registerAllActionItems, registerAllFormComponents, registerCheckbox, registerDatePicker, registerEmailInput, registerFileInput, registerFormComponent, registerInput, registerRadioGroup, registerRichText, registerSelect, registerSlider, registerTextarea, resetGloballyInitialized, resetRegistryForTesting, rgbToHsl, rgbToLuminance, runWhenIdle, saturateColor, useAccountSubdomain, useAccountUrl, useApiUrl, useAppStore, useDialog, useDialogActions, useDialogState, useFeatureFlag, useFormContext, useFrameworkSync, useLoginUrl, useMenuItems, useMetaStore, usePluginMeta, usePortal, usePortalActions, usePortalMeta, usePortalStore, usePortalUrl, useProtocolDomain, useRegisterUrl, useResetPasswordUrl, useSdk, useTable, useTheme, useThemeIdAndSetter, useUIStore, validateTheme, withTheme };
