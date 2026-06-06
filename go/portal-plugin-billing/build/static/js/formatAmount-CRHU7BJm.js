import{__commonJSMin,__toCommonJS}from"./rolldown-runtime-DfC7aybR.js";import{__mfe_internal__core_billing__loadShare__react__loadShare___exports,init___mfe_internal__core_billing__loadShare__react__loadShare__}from"./__mfe_internal__core_billing__loadShare__react__loadShare__.mjs-BCGE4cEL.js";
/**
* @license React
* react-compiler-runtime.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_compiler_runtime_production=__commonJSMin((exports=>{var ReactSharedInternals=(init___mfe_internal__core_billing__loadShare__react__loadShare__(),__toCommonJS(__mfe_internal__core_billing__loadShare__react__loadShare___exports)).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;exports.c=function(size){return ReactSharedInternals.H.useMemoCache(size)}})),require_compiler_runtime=__commonJSMin(((exports,module)=>{module.exports=require_react_compiler_runtime_production()})),require_react_jsx_runtime_production=__commonJSMin((exports=>{
/**
* @license React
* react-jsx-runtime.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var REACT_ELEMENT_TYPE=Symbol.for(`react.transitional.element`),REACT_FRAGMENT_TYPE=Symbol.for(`react.fragment`);function jsxProd(type,config,maybeKey){var key=null;if(maybeKey!==void 0&&(key=``+maybeKey),config.key!==void 0&&(key=``+config.key),`key`in config)for(var propName in maybeKey={},config)propName!==`key`&&(maybeKey[propName]=config[propName]);else maybeKey=config;return config=maybeKey.ref,{$$typeof:REACT_ELEMENT_TYPE,type,key,ref:config===void 0?null:config,props:maybeKey}}exports.Fragment=REACT_FRAGMENT_TYPE,exports.jsx=jsxProd,exports.jsxs=jsxProd})),require_jsx_runtime=__commonJSMin(((exports,module)=>{module.exports=require_react_jsx_runtime_production()})),ZERO_DECIMAL_CURRENCIES=new Set([`JPY`,`KRW`,`VND`,`CLP`,`PYG`,`ISK`,`XOF`,`XAF`,`UGX`]),THREE_DECIMAL_CURRENCIES=new Set([`KWD`,`BHD`,`OMR`,`JOD`,`TND`]);function formatAmount(value,options={}){let{currency=`USD`,locale=`en-US`,minimumFractionDigits,maximumFractionDigits}=options,numValue=typeof value==`string`?parseFloat(value):value;if(Number.isNaN(numValue))return`—`;let currencyUpper=currency.toUpperCase(),defaultFractions;defaultFractions=ZERO_DECIMAL_CURRENCIES.has(currencyUpper)?0:THREE_DECIMAL_CURRENCIES.has(currencyUpper)?3:2;let minFractions=minimumFractionDigits??defaultFractions,maxFractions=maximumFractionDigits??defaultFractions;return new Intl.NumberFormat(locale,{style:`currency`,currency,minimumFractionDigits:minFractions,maximumFractionDigits:maxFractions}).format(numValue)}function formatNumber(value,options={}){let{locale=`en-US`,maximumFractionDigits=2}=options,numValue=typeof value==`string`?parseFloat(value):value;return Number.isNaN(numValue)?`—`:new Intl.NumberFormat(locale,{maximumFractionDigits}).format(numValue)}export{formatAmount,formatNumber,require_compiler_runtime,require_jsx_runtime};
//# sourceMappingURL=formatAmount-CRHU7BJm.js.map