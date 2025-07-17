import './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__-YjtT0XC7.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ } from './form-D1oJQ5Wn.js';
import { ResetPasswordForm_schema_default } from './ResetPasswordForm.schema-DU2Wl-50.js';
import './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__-CequMnfU.js';
import { core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__-2mQxKAcF.js';
import './core_dashboard__loadShare__react__loadShare__-mOMo2i32.js';
import { core_dashboard__loadShare__react_mf_2_router__loadShare__ } from './core_dashboard__loadShare__react_mf_2_router__loadShare__-BiEltBUg.js';
import { jsxRuntimeExports } from './jsx-runtime-ta0kGoHj.js';
import { core_dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__ } from './core_dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__-DuCON6Pz.js';
import { s } from './zod-B9uLsSD2.js';

//#region src/ui/components/reset-password/ResetPasswordReset.tsx
function ResetPasswordForm() {
	const forgotPassword = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useForgotPassword();
	const form = core_dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__.useForm({
		defaultValues: { email: "" },
		resolver: s(ResetPasswordForm_schema_default)
	});
	const onSubmit = (data) => {
		forgotPassword.mutate(data);
	};
	return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
		className: "w-full h-full p-4 sm:p-10 space-y-4 mt-12",
		children: [
			/* @__PURE__ */ jsxRuntimeExports.jsx("p", {
				className: "text-input-placeholder w-full text-left mb-10",
				children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare__react_mf_2_router__loadShare__.Link, {
					className: "text-foreground text-md hover:underline hover:underline-offset-4",
					to: "/login",
					children: "← Back to Login"
				})
			}),
			/* @__PURE__ */ jsxRuntimeExports.jsx("div", {
				className: "!mb-12 space-y-2",
				children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", {
					className: "text-3xl font-bold",
					children: "Reset your password"
				})
			}),
			/* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Form, {
				...form,
				children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", {
					className: "space-y-4",
					onSubmit: form.handleSubmit(onSubmit),
					children: [/* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormField, {
						control: form.control,
						name: "email",
						render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormItem, { children: [
							/* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormLabel, { children: "Email Address" }),
							/* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Input, { ...field }) }),
							/* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormMessage, {})
						] })
					}), /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
						className: "w-full h-14",
						type: "submit",
						children: "Reset Password"
					})]
				})
			})
		]
	});
}
var ResetPasswordReset_default = ResetPasswordForm;

export { ResetPasswordReset_default as default };
