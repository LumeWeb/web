import { jsxRuntimeExports } from './jsx-runtime-D_0QkpWj.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__-CFuxgGnQ.js';

function Card({
  border = false,
  children,
  className = "",
  contentClassName = "",
  description,
  headerClassName = "",
  icon: Icon,
  title,
  titleClassName = ""
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Card,
    {
      className: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn(
        border && "border-border",
        "h-full flex flex-col",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.CardHeader, { className: headerClassName, children: [
          title && /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.CardTitle, { className: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("flex items-center gap-2", titleClassName), children: [
            Icon && /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-5 h-5 text-primary" }),
            title
          ] }),
          description && /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.CardDescription, { children: description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.CardContent, { className: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("space-y-4 mt-auto", contentClassName), children })
      ]
    }
  );
}

export { Card };
