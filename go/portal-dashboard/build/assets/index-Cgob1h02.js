import { j as jsxRuntimeExports } from "./jsx-runtime-CzXAEjbZ.js";
import { m as mc } from "./index-xFQL_PNe.js";
import { G as GeneralLayout } from "./GeneralLayout-COi4Rngp.js";
import { d as getServiceIds, c as getServiceById } from "./index-DpjZXSnv.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-N4hUChmK.js";
import { D as DataTable } from "./DataTable-DHoCv7gR.js";
import "./avatar-BR3FNp1h.js";
import "./useFeatureFlag-BpxbgP9R.js";
import "./usePortalMeta-iFy40cTW.js";
import "./usePortalUrl-CWejBXEP.js";
import "./index-BpxO7BrF.js";
import "./index-DpbAjMft.js";
import "./react-icons.esm-o-P2jf_4.js";
import "./index-COfyDwxK.js";
import "./button-jedbwRXf.js";
import "./useTheme-DYUrJKc_.js";
import "./index-CxTzuwWC.js";
import "./component-Da1x9Q9K.js";
import "./index-CJ8FhmRo.js";
import "./index-DdpwiKzx.js";
import "./index-COopH7IU.js";
import "./index-DO2s7-z0.js";
import "./icons-3kvdaKde.js";
import "./usePluginMeta-DuNGe9eG.js";
import "./LumeLogo-4oQo6CSC.js";
import "./lume-logo-ChvyOqr_.js";
import "./components-D8mYRm61.js";
import "./index-QWRrEtKK.js";
import "./index-5ukv8M2q.js";
import "./sheet-CJbdGOgA.js";
import "./index-DVyQH_Qd.js";
import "./dialog-e2EjNOoC.js";
import "./label-DTm3nVMD.js";
import "./input-Sza_mO8a.js";
import "./select-BEMrC4Fv.js";
import "./index-DSJ5IsRY.js";
import "./progress-DqLuAjsp.js";
import "./Forms-BMCjNw47.js";
import "./textarea-CO5zMSog.js";
import "./useEmailVerification-CcjfZDtz.js";
import "./useSdk-hjgK5j7F.js";
import "./createLucideIcon-B7dNuMLx.js";
import "./alert-CN5Jif_P.js";
import "./index-BOOu2P05.js";
import "./skeleton-DaJxHvFz.js";
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
