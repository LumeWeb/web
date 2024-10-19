import { j as jsxRuntimeExports } from "./jsx-runtime-IZdvEyt_.js";
import { B as Button } from "./button-CzfLTIHt.js";
import { L as LumeLogo, d as discordLogoPng, l as lumeColorLogoPng } from "./LumeLogo-UyKObroS.js";
import { O as Outlet } from "./index-O1NGHMyc.js";
import { L as Link } from "./components-DMYkXxdw.js";
import "./lume-logo-ChvyOqr_.js";
import "./index-CfDxhBvB.js";
import "./index-BquAYmyk.js";
const lumeBgPng = "/assets/lume-bg-reset-password-BttR11xa.png";
function ResetPasswordLayout() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    className: "h-screen relative",
    children: [/* @__PURE__ */ jsxRuntimeExports.jsx("header", {
      className: "p-4 sm:p-10",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(LumeLogo, {})
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      className: "flex flex-col items-start max-w-md bg-background",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {})
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      className: "fixed inset-0 -z-10 overflow-clip",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
        src: lumeBgPng,
        alt: "Lume background",
        className: "absolute top-0 right-0 md:w-2/3 sm:h-full object-cover z-[-1]"
      })
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("footer", {
      className: "my-5",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", {
        className: "flex flex-row",
        children: [/* @__PURE__ */ jsxRuntimeExports.jsx("li", {
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
            to: "https://discord.lumeweb.com",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, {
              variant: "link",
              className: "flex flex-row gap-x-2 text-input-placeholder",
              children: [/* @__PURE__ */ jsxRuntimeExports.jsx("img", {
                className: "h-5",
                src: discordLogoPng,
                alt: "Discord Logo"
              }), "Connect with us"]
            })
          })
        }), /* @__PURE__ */ jsxRuntimeExports.jsx("li", {
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
            to: "https://lumeweb.com",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, {
              variant: "link",
              className: "flex flex-row gap-x-2 text-input-placeholder",
              children: [/* @__PURE__ */ jsxRuntimeExports.jsx("img", {
                className: "h-5",
                src: lumeColorLogoPng,
                alt: "Lume Logo"
              }), "Connect with us"]
            })
          })
        })]
      })
    })]
  });
}
export {
  ResetPasswordLayout as default
};
