import{j as s}from"./jsx-runtime.D_zvdyIk.js";const l=({logos:t,title:a,logoType:i="dark"})=>s.jsx("section",{className:`py-[40px] md:py-[90px] ${i==="light"?"bg-white":"bg-[#051413]"}`,children:s.jsx("div",{className:"xl:container px-6",children:s.jsxs("div",{className:"lg:flex items-start md:items-center justify-between gap-[150px]",children:[s.jsx("div",{className:"basis-80 md:basis-[17rem] mb-[30px] lg:mb-0",children:s.jsx("h2",{className:`text-[31px] font-medium ${i==="light"?"text-[#0D1D1C]":"text-[#F8F8F8]"}`,children:a})}),s.jsx("div",{className:"flex-grow",children:s.jsx("div",{className:"flex-wrap grid grid-cols-4 lg:grid-cols-6 gap-7 md:gap-10 flex-2 items-center justify-start md:justify-between",children:i==="light"?t.logoLight.map(e=>s.jsx("img",{src:e.src,alt:"brand logo"},e.id)):t.logoDark.map(e=>s.jsx("img",{src:e.src,alt:"brand logo"},e.id))})})]})})});export{l as default};