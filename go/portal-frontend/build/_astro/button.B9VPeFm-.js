import{j as g}from"./jsx-runtime.D_zvdyIk.js";import{r as y}from"./index.0zUCkS4B.js";import{a as C,c as w}from"./utils.BEHD0UYf.js";const h=r=>typeof r=="boolean"?`${r}`:r===0?"0":r,D=C,F=(r,n)=>t=>{var l;if(n?.variants==null)return D(r,t?.class,t?.className);const{variants:d,defaultVariants:a}=n,u=Object.keys(d).map(e=>{const o=t?.[e],s=a?.[e];if(o===null)return null;const i=h(o)||h(s);return d[e][i]}),x=t&&Object.entries(t).reduce((e,o)=>{let[s,i]=o;return i===void 0||(e[s]=i),e},{}),b=n==null||(l=n.compoundVariants)===null||l===void 0?void 0:l.reduce((e,o)=>{let{class:s,className:i,...m}=o;return Object.entries(m).every(f=>{let[c,v]=f;return Array.isArray(v)?v.includes({...a,...x}[c]):{...a,...x}[c]===v})?[...e,s,i]:e},[]);return D(r,u,b,t?.class,t?.className)},V=F("inline-flex rounded-full border border-transparent  text-[13px] lg:text-lg font-medium transition ease-in-out duration-300",{variants:{style:{default:"text-[#F8F8F8] bg-[#0D2D2A] hover:bg-white hover:text-[#0D1D1C]",outline:"border !border-[#F8F8F8] text-[#f8f8f8] bg-transparent hover:!bg-[#0D2D2A] hover:text-[#F8F8F8] hover:!border-[#0D2D2A]","outline-dark":"border !border-[#0D1D1C] !text-[#0D1D1C] bg-transparent hover:!bg-[#0D1D1C] hover:!text-white hover:!border-[#0D1D1C]","btn-light":"!bg-white !text-[#0D1D1C] hover:!bg-transparent hover:!text-white !border-white",gray:"bg-[#E4E0D4] !text-[#0D1D1C] hover:!bg-[#0D2D2A] hover:!text-white",light:"bg-white text-[#0D1D1C] hover:bg-[#0D2D2A] hover:text-white"},size:{sm:"py-2 px-6 text-[13px] leading-none",md:"py-[11px] px-4 lg:py-4 lg:px-6",lg:"text-xl"}},defaultVariants:{style:"default",size:"md"}}),N=y.forwardRef(({label:r,url:n,style:t,size:l,className:d,...a},u)=>g.jsx("a",{href:n,className:w(V({style:t,size:l,className:d})),ref:u,...a,children:r}));N.displayName="Button";export{N as B,F as c};