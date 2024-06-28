import { j as jsxRuntimeExports } from "./index-CZkutDaP.js";
import { L as Link } from "./components-Bt5ybS0r.js";
const InlineAuthLinkBanner = ({ to, label, linkLabel }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-foreground text-sm w-fit flex items-center  gap-2 text-left bg-secondary p-3 rounded-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/80 whitespace-nowrap", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to,
        className: "text-foreground mx-auto whitespace-nowrap hover:underline hover:underline-offset-4",
        children: linkLabel || "Login here →"
      }
    )
  ] });
};
const InlineAuthLinkBanner$1 = InlineAuthLinkBanner;
export {
  InlineAuthLinkBanner$1 as I
};
