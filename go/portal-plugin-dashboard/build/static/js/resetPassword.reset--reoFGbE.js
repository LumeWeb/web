import './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__-BjauFvDm.js';
import { schema } from './resetPassword.schema-D8Hy_NAM.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__, jsxRuntimeExports } from './jsx-runtime-D_0QkpWj.js';
import './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__-CFuxgGnQ.js';
import { core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__-DOYraqnS.js';
import './core_dashboard__loadShare__react_mf_2_router__loadShare__-CShhB-Ww.js';

//#region src/ui/forms/resetPassword.ts
const getResetPasswordForm = (mutate) => {
	return {
		actionButtons: [{
			label: "Continue",
			type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.ActionItemType.SUBMIT
		}],
		fields: [{
			label: "Email Address",
			name: "email",
			required: true,
			type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormFieldType.EMAIL
		}],
		footerClassName: "",
		layout: "vertical",
		onSubmit: (values) => mutate(values),
		validationSchema: schema
	};
};

//#region src/ui/components/reset-password/ResetPasswordReset.tsx
function ResetPasswordForm() {
	const forgotPassword = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useForgotPassword();
	return /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.SchemaForm, { config: getResetPasswordForm(forgotPassword.mutate) });
}
var ResetPasswordReset_default = ResetPasswordForm;

export { ResetPasswordReset_default as default };
