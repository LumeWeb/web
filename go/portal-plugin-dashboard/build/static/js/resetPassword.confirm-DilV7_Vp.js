import './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__-BjauFvDm.js';
import { resetPasswordConfirm_schema_default } from './resetPassword.schema-Dp8aq7MN.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__, core_dashboard__loadShare__react__loadShare__, jsxRuntimeExports } from './jsx-runtime-D_0QkpWj.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__-CFuxgGnQ.js';
import { core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__-CUREaEX2.js';
import { core_dashboard__loadShare__react_mf_2_router__loadShare__ } from './core_dashboard__loadShare__react_mf_2_router__loadShare__-CShhB-Ww.js';

//#region src/ui/forms/resetPasswordConfirm.ts
const getResetPasswordConfirmForm = (mutate) => {
	return {
		footerClassName: "",
		actionButtons: [{
			label: "Reset Password",
			type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.ActionItemType.SUBMIT
		}],
		fields: [
			{
				inputProps: { readOnly: true },
				label: "Email Address",
				name: "email",
				required: true,
				type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormFieldType.TEXT,
				autocomplete: "username"
			},
			{
				inputProps: {
					readOnly: true,
					autoComplete: "off"
				},
				label: "Reset Token",
				name: "token",
				required: true,
				type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormFieldType.PASSWORD
			},
			{
				label: "New Password",
				name: "password",
				required: true,
				type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormFieldType.PASSWORD,
				autocomplete: "new-password"
			},
			{
				label: "Confirm New Password",
				name: "confirmPassword",
				required: true,
				type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormFieldType.PASSWORD,
				autocomplete: "new-password"
			}
		],
		layout: "vertical",
		onSubmit: (values) => {
			const { confirmPassword,...submitValues } = values;
			mutate(submitValues);
		},
		validationSchema: resetPasswordConfirm_schema_default
	};
};

//#region src/ui/components/reset-password/ResetPasswordConfirm.tsx
function ResetPasswordConfirm() {
	const go = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useGo();
	const forgotPassword = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useForgotPassword();
	const [isSuccess, setIsSuccess] = core_dashboard__loadShare__react__loadShare__.useState(false);
	const [searchParams] = core_dashboard__loadShare__react_mf_2_router__loadShare__.useSearchParams();
	const email = searchParams.get("email") || "";
	const token = searchParams.get("token") || "";
	const handleSubmit = (values) => {
		forgotPassword.mutate(values, { onSuccess: (result) => {
			if (result.success) setIsSuccess(true);
		} });
	};
	const handleGoToLogin = () => {
		go({ to: "/login" });
	};
	if (isSuccess) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
		className: "flex flex-col items-center",
		children: [/* @__PURE__ */ jsxRuntimeExports.jsx("p", {
			className: "opacity-60 mb-4",
			children: "Your password has been reset successfully."
		}), /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
			onClick: handleGoToLogin,
			children: "Go to Login"
		})]
	});
	return /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.SchemaForm, { config: {
		...getResetPasswordConfirmForm(handleSubmit),
		defaultValues: {
			email,
			token
		}
	} });
}
var ResetPasswordConfirm_default = ResetPasswordConfirm;

export { ResetPasswordConfirm_default as default };
