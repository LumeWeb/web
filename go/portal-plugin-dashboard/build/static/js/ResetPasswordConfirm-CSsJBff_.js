import './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__-YjtT0XC7.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ } from './form-D1oJQ5Wn.js';
import { ResetPasswordConfirmForm_schema_default } from './ResetPasswordForm.schema-DU2Wl-50.js';
import './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__-CequMnfU.js';
import { core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__-2mQxKAcF.js';
import { core_dashboard__loadShare__react__loadShare__ } from './core_dashboard__loadShare__react__loadShare__-mOMo2i32.js';
import { core_dashboard__loadShare__react_mf_2_router__loadShare__ } from './core_dashboard__loadShare__react_mf_2_router__loadShare__-BiEltBUg.js';
import { jsxRuntimeExports } from './jsx-runtime-ta0kGoHj.js';
import { s } from './zod-B9uLsSD2.js';
import { core_dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__ } from './core_dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__-DuCON6Pz.js';

//#region src/ui/components/reset-password/ResetPasswordConfirm.tsx
function ResetPasswordConfirm() {
	const go = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useGo();
	const forgotPassword = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useForgotPassword();
	const [isSuccess, setIsSuccess] = core_dashboard__loadShare__react__loadShare__.useState(false);
	const [searchParams] = core_dashboard__loadShare__react_mf_2_router__loadShare__.useSearchParams();
	const form = core_dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__.useForm({
		defaultValues: {
			confirmPassword: "",
			email: "",
			password: "",
			token: ""
		},
		resolver: s(ResetPasswordConfirmForm_schema_default)
	});
	core_dashboard__loadShare__react__loadShare__.useEffect(() => {
		const email = searchParams.get("email") || "";
		const token = searchParams.get("token") || "";
		form.setValue("email", email);
		form.setValue("token", token);
	}, [searchParams, form]);
	const onSubmit = (data) => {
		const { confirmPassword,...submitData } = data;
		forgotPassword.mutate(submitData, { onSuccess: (result) => {
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
					children: [
						/* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormField, {
							control: form.control,
							name: "email",
							render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormItem, { children: [
								/* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormLabel, { children: "Email Address" }),
								/* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Input, {
									...field,
									readOnly: true
								}) }),
								/* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormMessage, {})
							] })
						}),
						/* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormField, {
							control: form.control,
							name: "token",
							render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormItem, { children: [
								/* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormLabel, { children: "Reset Token" }),
								/* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Input, {
									...field,
									readOnly: true
								}) }),
								/* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormMessage, {})
							] })
						}),
						/* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormField, {
							control: form.control,
							name: "password",
							render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormItem, { children: [
								/* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormLabel, { children: "New Password" }),
								/* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Input, {
									type: "password",
									...field
								}) }),
								/* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormMessage, {})
							] })
						}),
						/* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormField, {
							control: form.control,
							name: "confirmPassword",
							render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormItem, { children: [
								/* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormLabel, { children: "Confirm New Password" }),
								/* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Input, {
									type: "password",
									...field
								}) }),
								/* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.FormMessage, {})
							] })
						}),
						/* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, {
							className: "w-full h-14",
							type: "submit",
							children: "Reset Password"
						})
					]
				})
			})
		]
	});
}
var ResetPasswordConfirm_default = ResetPasswordConfirm;

export { ResetPasswordConfirm_default as default };
