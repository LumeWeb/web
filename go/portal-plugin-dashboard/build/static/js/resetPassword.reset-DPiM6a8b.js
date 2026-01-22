import './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__-CQeXjHLK.js';
import { schema } from './resetPassword.schema-C_7aDFoR.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__, jsxRuntimeExports } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__-D-EDec9Y.js';
import { core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__-ImaNZ9yu.js';
import './core_dashboard__loadShare__react_mf_2_router__loadShare__-BFaT_n3N.js';
import './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__-BRPNVk8X.js';

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
	return /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.SchemaForm, { config: getResetPasswordForm(core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useForgotPassword().mutate) });
}
var ResetPasswordReset_default = ResetPasswordForm;

export { ResetPasswordReset_default as default };
