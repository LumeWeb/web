import { core_dashboard__loadShare__react__loadShare__, React } from './core_dashboard__loadShare__react__loadShare__-mOMo2i32.js';
import { castPath, toKey, isLength, isIndex, isArray, isArguments, get } from './isLength-BjcVZakP.js';
import { core_dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__ } from './core_dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__-DuCON6Pz.js';
import { core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__-2mQxKAcF.js';

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
    (isArray(object) || isArguments(object));
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
function has(object, path) {
  return object != null && hasPath(object, path, baseHas);
}

var ee=Object.defineProperty;var R=(e,a)=>ee(e,"name",{value:a,configurable:true});var k=R(({refineCoreProps:e,warnWhenUnsavedChanges:a,disableServerSideValidation:c=false,...H}={})=>{let{options:y}=core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useRefineContext(),h=(y==null?void 0:y.disableServerSideValidation)||c,S=core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useTranslate(),{warnWhenUnsavedChanges:U,setWarnWhen:f}=core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useWarnAboutChange(),V=a??U,o=core_dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__.useForm({...H}),{watch:m,setValue:E,getValues:u,handleSubmit:n,setError:x}=o,b=core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useForm({...e,onMutationError:(t,i,r)=>{var F,v;if(h){(F=e==null?void 0:e.onMutationError)==null||F.call(e,t,i,r);return}let s=t==null?void 0:t.errors;for(let g in s){if(!Object.keys(core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.flattenObjectKeys(i)).includes(g))continue;let l=s[g],D="";Array.isArray(l)&&(D=l.join(" ")),typeof l=="string"&&(D=l),typeof l=="boolean"&&l&&(D="Field is not valid."),typeof l=="object"&&"key"in l&&(D=S(l.key,l.message)),x(g,{message:D});}(v=e==null?void 0:e.onMutationError)==null||v.call(e,t,i,r);}}),{query:p,onFinish:d,formLoading:B,onFinishAutoSave:M}=b;core_dashboard__loadShare__react__loadShare__.useEffect(()=>{var r;let t=(r=p==null?void 0:p.data)==null?void 0:r.data;if(!t)return;Object.keys(core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.flattenObjectKeys(u())).forEach(s=>{let F=has(t,s),v=get(t,s);F&&E(s,v);});},[p==null?void 0:p.data,E,u]),core_dashboard__loadShare__react__loadShare__.useEffect(()=>{let t=m((i,{type:r})=>{r==="change"&&W(i);});return ()=>t.unsubscribe()},[m]);let W=R(t=>{var i,r;if(V&&f(true),(i=e==null?void 0:e.autoSave)!=null&&i.enabled){f(false);let s=((r=e.autoSave)==null?void 0:r.onFinish)??(F=>F);return M(s(t)).catch(F=>F)}return t},"onValuesChange"),C=R((t,i)=>async r=>(f(false),n(t,i)(r)),"handleSubmit");return {...o,handleSubmit:C,refineCore:b,saveButtonProps:{disabled:B,onClick:t=>{C(i=>d(i).catch(()=>{}),()=>false)(t);}}}},"useForm");var ue=R(({stepsProps:e,...a}={})=>{let{defaultStep:c=0,isBackValidate:H=false}=e??{},[y,h]=core_dashboard__loadShare__react__loadShare__.useState(c),S=k({...a}),{trigger:U,getValues:f,setValue:V,formState:{dirtyFields:o},refineCore:{query:m}}=S;core_dashboard__loadShare__react__loadShare__.useEffect(()=>{var b;let n=(b=m==null?void 0:m.data)==null?void 0:b.data;if(!n)return;let x=Object.keys(f());console.log({dirtyFields:o,registeredFields:x,data:n}),Object.entries(n).forEach(([p,d])=>{let B=p;x.includes(B)&&(get(o,B)||V(B,d));});},[m==null?void 0:m.data,y,V,f]);let E=R(n=>{let x=n;n<0&&(x=0),h(x);},"go");return {...S,steps:{currentStep:y,gotoStep:R(async n=>{if(n===y)return;if(n<y&&!H){E(n);return}await U()&&E(n);},"gotoStep")}}},"useStepsForm");R(({modalProps:e,refineCoreProps:a,syncWithLocation:c,...H}={})=>{var N,I;let y=core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useInvalidate(),[h,S]=React.useState(false),U=core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useTranslate(),{resource:f,action:V}=a??{},{resource:o,action:m,identifier:E}=core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useResource(f),u=core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useParsed(),n=core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useGo(),x=core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useUserFriendlyName(),b=V??m??"",p=!(typeof c=="object"&&(c==null?void 0:c.syncId)===false),d=typeof c=="object"&&"key"in c?c.key:o&&b&&c?`modal-${E}-${b}`:void 0,{defaultVisible:B=false,autoSubmitClose:M=true,autoResetForm:W=true,autoResetFormWhenClose:C=true}=e??{},O=k({refineCoreProps:{...a,meta:{...d?{[d]:void 0}:{},...a==null?void 0:a.meta}},...H}),{reset:t,refineCore:{onFinish:i,id:r,setId:s,autoSaveProps:F},saveButtonProps:v,handleSubmit:g}=O,{visible:Q,show:l,close:D}=core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useModal({defaultVisible:B});React.useEffect(()=>{var T,j,P,G;if(h===false&&d){let w=(j=(T=u==null?void 0:u.params)==null?void 0:T[d])==null?void 0:j.open;if(typeof w=="boolean"?w&&l():typeof w=="string"&&w==="true"&&l(),p){let Y=(G=(P=u==null?void 0:u.params)==null?void 0:P[d])==null?void 0:G.id;Y&&(s==null||s(Y));}S(true);}},[d,u,p,s]),React.useEffect(()=>{var T;h===true&&(Q&&d?n({query:{[d]:{...(T=u==null?void 0:u.params)==null?void 0:T[d],open:true,...p&&r&&{id:r}}},options:{keepQuery:true},type:"replace"}):d&&!Q&&n({query:{[d]:void 0},options:{keepQuery:true},type:"replace"}));},[r,Q,l,d,p]);let K=R(async T=>{await i(T),M&&D(),W&&t();},"submit"),{warnWhen:A,setWarnWhen:Z}=core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useWarnAboutChange(),_=core_dashboard__loadShare__react__loadShare__.useCallback(()=>{var T;if(F.status==="success"&&((T=a==null?void 0:a.autoSave)!=null&&T.invalidateOnClose)&&y({id:r,invalidates:a.invalidates||["list","many","detail"],dataProviderName:a.dataProviderName,resource:E}),A)if(window.confirm(U("warnWhenUnsavedChanges","Are you sure you want to leave? You have unsaved changes.")))Z(false);else return;s==null||s(void 0),D(),C&&t();},[A,F.status]),q=core_dashboard__loadShare__react__loadShare__.useCallback(T=>{typeof T<"u"&&(s==null||s(T)),(!(b==="edit"||b==="clone")||(typeof T<"u"||typeof r<"u"))&&l();},[r]),L=U(`${E}.titles.${V}`,void 0,`${x(`${V} ${((N=o==null?void 0:o.meta)==null?void 0:N.label)??((I=o==null?void 0:o.options)==null?void 0:I.label)??(o==null?void 0:o.label)??E}`,"singular")}`);return {modal:{submit:K,close:_,show:q,visible:Q,title:L},...O,saveButtonProps:{...v,onClick:T=>g(K)(T)}}},"useModalForm");

export { k, ue };
