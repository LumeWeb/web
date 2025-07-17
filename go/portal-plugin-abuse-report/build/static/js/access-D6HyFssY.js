import { jsxRuntimeExports } from './jsx-runtime-BpMlpgXU.js';
import './core_abuse_mf_2_report__loadShare__react_mf_2_router__loadShare__-BlY5pJPl.js';
import { ReportLayout } from './ReportLayout-CQGQxrUb.js';
import { core_abuse_mf_2_report__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__ } from './core_abuse_mf_2_report__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__-CRXefMZb.js';
import { core_abuse_mf_2_report__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ } from './core_abuse_mf_2_report__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__-CxWo1El1.js';
import { core_abuse_mf_2_report__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_abuse_mf_2_report__loadShare___mf_0_refinedev_mf_1_core__loadShare__-D5_BW_kK.js';
import { z } from './index-B9KvDn2S.js';

const accessSchema = z.object({
  token: z.string().min(1, "Access token is required")
});
function Access() {
  const { mutate: login } = core_abuse_mf_2_report__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useLogin();
  const onSubmit = (data) => {
    login(
      { accessKey: data.token },
      {
        onError: (error) => {
          console.error("Login error:", error);
        }
      }
    );
  };
  const formConfig = {
    actionButtons: [
      {
        className: "h-10 px-8 rounded-full bg-button hover:bg-button-hover text-foreground mx-auto",
        label: "View Report Status",
        type: core_abuse_mf_2_report__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.ActionItemType.SUBMIT
      }
    ],
    adapter: "rhf",
    fields: [
      {
        label: "Access Token",
        name: "token",
        required: true,
        type: core_abuse_mf_2_report__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormFieldType.TEXT
        // Use enum member
      }
    ],
    onSubmit,
    submitLabel: "View Report Status",
    validationSchema: accessSchema
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ReportLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "container py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-medium tracking-tight text-foreground mb-2", children: "Access Your Report" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/80", children: "Enter the access token that was provided when you submitted your report" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse_mf_2_report__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Card, { className: "border-none bg-card p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse_mf_2_report__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.SchemaForm, { config: formConfig }) })
  ] }) }) }) });
}

export { Access as default };
