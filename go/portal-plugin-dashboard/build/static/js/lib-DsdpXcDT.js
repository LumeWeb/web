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
function e(){return{accessor:(e,t)=>typeof e==`function`?{...t,accessorFn:e}:{...t,accessorKey:e},display:e=>e,group:e=>e}}var t=(e,t,n)=>{var r,i;let a=n==null||(r=n.toString())==null?void 0:r.toLowerCase();return!!(!((i=e.getValue(t))==null||(i=i.toString())==null||(i=i.toLowerCase())==null)&&i.includes(a))};t.autoRemove=e=>u(e);var n=(e,t,n)=>{var r;return!!(!((r=e.getValue(t))==null||(r=r.toString())==null)&&r.includes(n))};n.autoRemove=e=>u(e);var r=(e,t,n)=>{var r;return((r=e.getValue(t))==null||(r=r.toString())==null?void 0:r.toLowerCase())===n?.toLowerCase()};r.autoRemove=e=>u(e);var i=(e,t,n)=>e.getValue(t)?.includes(n);i.autoRemove=e=>u(e);var a=(e,t,n)=>!n.some(n=>{var r;return!((r=e.getValue(t))!=null&&r.includes(n))});a.autoRemove=e=>u(e)||!(e!=null&&e.length);var o=(e,t,n)=>n.some(n=>e.getValue(t)?.includes(n));o.autoRemove=e=>u(e)||!(e!=null&&e.length);var s=(e,t,n)=>e.getValue(t)===n;s.autoRemove=e=>u(e);var c=(e,t,n)=>e.getValue(t)==n;c.autoRemove=e=>u(e);var l=(e,t,n)=>{let[r,i]=n,a=e.getValue(t);return a>=r&&a<=i};l.resolveFilterValue=e=>{let[t,n]=e,r=typeof t==`number`?t:parseFloat(t),i=typeof n==`number`?n:parseFloat(n),a=t===null||Number.isNaN(r)?-1/0:r,o=n===null||Number.isNaN(i)?1/0:i;if(a>o){let e=a;a=o,o=e}return[a,o]},l.autoRemove=e=>u(e)||u(e[0])&&u(e[1]);function u(e){return e==null||e===``}export{e as createColumnHelper};
//# sourceMappingURL=lib-DsdpXcDT.js.map