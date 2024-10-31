import { j as jsxRuntimeExports } from "./jsx-runtime-IZdvEyt_.js";
import { m as mc } from "./index-C-G3KncW.js";
import { G as GeneralLayout } from "./GeneralLayout-BXNdht89.js";
import { d as getServiceIds, c as getServiceById } from "./index-CEno6qhM.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-DMdyRxkb.js";
import { D as DataTable } from "./DataTable-R9ZBpoL0.js";
import "./avatar-UQ3udEfp.js";
import "./useFeatureFlag-CZhDezMF.js";
import "./usePortalMeta-Bj0hVK70.js";
import "./usePortalUrl-QWoAKYQr.js";
import "./index-BpxO7BrF.js";
import "./index-bnQotRZh.js";
import "./index-DzjV6XGT.js";
import "./button-CxRLgqWQ.js";
import "./react-icons.esm-BJVio-o0.js";
import "./useTheme-B_Xzr1Gx.js";
import "./Combination-px7rCmli.js";
import "./index-DKrFfig3.js";
import "./index-gIJO3bJT.js";
import "./index-wx_5TVOY.js";
import "./index-C6Wr53b0.js";
import "./icons-DXepPAEW.js";
import "./usePluginMeta-aNbgo9DI.js";
import "./LumeLogo-q-d-k-3u.js";
import "./lume-logo-ChvyOqr_.js";
import "./components-XyVy0HiW.js";
import "./index-CVd92JJe.js";
import "./index-v7sdPLyF.js";
import "./sheet-CDPpZ0wU.js";
import "./index-BNJrySUY.js";
import "./dialog-bMhe1ZLy.js";
import "./label-GoC-rw9-.js";
import "./input-B5SdZGo1.js";
import "./select-kY7Uezc3.js";
import "./index-WXDFwduM.js";
import "./progress-CxS0Yg7S.js";
import "./Forms-DrsuE72V.js";
import "./textarea-CojA7Bd2.js";
import "./useEmailVerification-bvWTBpqU.js";
import "./useSdk-DQzcIssv.js";
import "./alert-3RvGnShr.js";
import "./index-BOOu2P05.js";
import "./skeleton-Cez4AWj1.js";
function Manager() {
  const serviceIds = getServiceIds().sort();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: serviceIds[0], children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsList, { className: "mb-6", children: serviceIds.map((serviceId) => {
      const service = getServiceById(serviceId);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: serviceId, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground", children: [
        " ",
        service == null ? void 0 : service.name()
      ] }) }, "activeService") });
    }) }),
    serviceIds.map((serviceId) => {
      const service = getServiceById(serviceId);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: serviceId, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-4 text-xl font-semibold", children: "IPFS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataTable,
          {
            className: "min-w-full border border-gray-700 border-x-1",
            columns: (service == null ? void 0 : service.UIUploadQueueColumns()) || [],
            resource: (service == null ? void 0 : service.id()) || "",
            dataProviderName: (service == null ? void 0 : service.id()) || "",
            autoRefresh: true,
            autoRefreshInterval: 5e3
          }
        ) })
      ] }) }, "activeService") });
    })
  ] });
}
function Uploads() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(mc, {
    v3LegacyAuthProviderCompatible: false,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(GeneralLayout, {
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Manager, {})
    })
  }, "uploads");
}
export {
  Uploads as default
};
