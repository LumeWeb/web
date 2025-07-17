import { jsxRuntimeExports } from './jsx-runtime-ta0kGoHj.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__-CequMnfU.js';
import { core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__-2mQxKAcF.js';
import { core_dashboard__loadShare__react__loadShare__, React } from './core_dashboard__loadShare__react__loadShare__-mOMo2i32.js';
import './core_dashboard__loadShare__react_mf_2_router__loadShare__-BiEltBUg.js';
import { s } from './zod-B9uLsSD2.js';
import { core_dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__ } from './core_dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__-DuCON6Pz.js';
import { z } from './index-BxxS_31b.js';
import { k, ue } from './index-RdIJmS0Y.js';
import { createLucideIcon } from './createLucideIcon-t7U8xzo8.js';

const schema$1 = z.object({
  email: z.string().email(),
  password: z.string(),
  retypePassword: z.string()
}).superRefine((data, ctx) => {
  if (data.password !== data.retypePassword) {
    return ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["retypePassword"],
      message: "Passwords do not match"
    });
  }
  return true;
});

const formSchema$1 = schema$1;
function ChangeEmailForm({
  close,
  currentValue
}) {
  const { data: identity } = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useGetIdentity();
  const { isSuccess, mutate: updateEmail } = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useUpdate();
  const form = core_dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__.useForm({
    defaultValues: {
      email: "",
      password: "",
      retypePassword: ""
    },
    resolver: s(formSchema$1)
  });
  const onSubmit = (data) => {
    updateEmail({
      id: identity?.id || "",
      resource: "account",
      values: {
        email: data.email,
        password: data.password
      }
    });
  };
  core_dashboard__loadShare__react__loadShare__.useEffect(() => {
    if (isSuccess) {
      close();
    }
  }, [isSuccess, close]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Form, { ...form, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "space-y-8", onSubmit: form.handleSubmit(onSubmit), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogTitle, { className: "mb-8", children: "Change Email" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-full px-4 py-2 w-fit text-sm bg-ring font-bold text-secondary-1", children: currentValue }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormField,
      {
        control: form.control,
        name: "email",
        render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormItem, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormLabel, { children: "New Email Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Input, { ...field }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormMessage, {})
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormField,
      {
        control: form.control,
        name: "password",
        render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormItem, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormLabel, { children: "Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Input, { type: "password", ...field }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormMessage, {})
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormField,
      {
        control: form.control,
        name: "retypePassword",
        render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormItem, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormLabel, { children: "Retype Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Input, { type: "password", ...field }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormMessage, {})
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Button, { className: "w-full h-14", type: "submit", children: "Change Email Address" }) })
  ] }) });
}

const schema = z.object({
  currentPassword: z.string(),
  newPassword: z.string(),
  retypePassword: z.string()
}).superRefine((data, ctx) => {
  if (data.newPassword !== data.retypePassword) {
    return ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["retypePassword"],
      message: "Passwords do not match"
    });
  }
  return true;
});

const formSchema = schema;
function ChangePasswordForm({ close }) {
  const { isSuccess, mutate: updatePassword } = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useUpdatePassword();
  const form = core_dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__.useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      retypePassword: ""
    },
    resolver: s(formSchema)
  });
  const onSubmit = (data) => {
    updatePassword({
      currentPassword: data.currentPassword,
      password: data.newPassword
    });
  };
  core_dashboard__loadShare__react__loadShare__.useEffect(() => {
    if (isSuccess) {
      close();
    }
  }, [isSuccess, close]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Form, { ...form, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "space-y-6", onSubmit: form.handleSubmit(onSubmit), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogTitle, { className: "mb-8", children: "Change Password" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormField,
      {
        control: form.control,
        name: "currentPassword",
        render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormItem, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormLabel, { children: "Current Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Input, { type: "password", ...field }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormMessage, {})
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormField,
      {
        control: form.control,
        name: "newPassword",
        render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormItem, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormLabel, { children: "New Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Input, { type: "password", ...field }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormMessage, {})
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormField,
      {
        control: form.control,
        name: "retypePassword",
        render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormItem, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormLabel, { children: "Retype Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Input, { type: "password", ...field }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormMessage, {})
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Button, { className: "w-full h-14", type: "submit", children: "Change Password" }) })
  ] }) });
}

const stepOneSchema = z.object({
  confirmText: z.literal("DELETE", {
    errorMap: () => ({ message: "Please type DELETE to confirm" })
  })
});
const stepTwoSchema = z.object({
  confirmText: z.literal("I UNDERSTAND", {
    errorMap: () => ({ message: "Please type I UNDERSTAND to confirm" })
  })
});
function DeleteAccountDialog({
  close
}) {
  const [step, setStep] = core_dashboard__loadShare__react__loadShare__.useState(1);
  const { mutate: logout } = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useLogout();
  const { push } = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useNavigation();
  const deleteMutator = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useDelete();
  const stepOneForm = k({
    defaultValues: {
      confirmText: ""
    },
    resolver: s(stepOneSchema)
  });
  const stepTwoForm = k({
    defaultValues: {
      confirmText: ""
    },
    resolver: s(stepTwoSchema)
  });
  const onStepOneSubmit = (_data) => {
    setStep(2);
  };
  const onStepTwoSubmit = (_data) => {
    deleteMutator.mutate(
      {
        id: "",
        resource: "account",
        successNotification: false
        // Disable default success notification
      },
      {
        onSuccess: () => {
          setStep(3);
        }
      }
    );
  };
  const handleClose = () => {
    setStep(1);
    stepOneForm.reset();
    stepTwoForm.reset();
    close();
  };
  const handleLogout = () => {
    logout();
    push("/");
  };
  const renderStepOne = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: stepOneForm.handleSubmit(onStepOneSubmit), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Alert, { variant: "destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.AlertDescription, { children: "Are you sure you want to delete your account? This action cannot be undone." }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4", children: 'Type "DELETE" to confirm:' }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Input, { ...stepOneForm.register("confirmText"), className: "mt-2" }),
    stepOneForm.formState.errors.confirmText && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-500 mt-1", children: stepOneForm.formState.errors.confirmText.message }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogFooter, { className: "mt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Button, { onClick: handleClose, type: "button", variant: "outline", children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Button, { type: "submit", variant: "destructive", children: "Proceed" })
    ] })
  ] });
  const renderStepTwo = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: stepTwoForm.handleSubmit(onStepTwoSubmit), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Alert, { variant: "destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.AlertDescription, { children: "This is your final chance to reconsider. Your account will be permanently deleted." }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Label, { className: "mt-4 block", htmlFor: "finalConfirm", children: 'Type "I UNDERSTAND" to proceed with account deletion:' }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Input,
      {
        id: "finalConfirm",
        ...stepTwoForm.register("confirmText"),
        className: "mt-2"
      }
    ),
    stepTwoForm.formState.errors.confirmText && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-500 mt-1", children: stepTwoForm.formState.errors.confirmText.message }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogFooter, { className: "mt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Button, { onClick: handleClose, type: "button", variant: "outline", children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Button, { type: "submit", variant: "destructive", children: "Delete Account" })
    ] })
  ] });
  const renderSuccessScreen = () => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Alert, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.AlertDescription, { children: "Your account will be deleted within 48 hours. If this is an error, please contact support as soon as possible." }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogFooter, { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Button, { onClick: handleLogout, children: "OK" }) })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogTitle, { children: [
      step === 1 && "Delete Account",
      step === 2 && "Final Confirmation",
      step === 3 && "Account Deletion Scheduled"
    ] }) }),
    step === 1 && renderStepOne(),
    step === 2 && renderStepTwo(),
    step === 3 && renderSuccessScreen()
  ] });
}

/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
];
const CircleAlert = createLucideIcon("circle-alert", __iconNode);

function DisableTwoFactorDialog({
  close
}) {
  const apiUrl = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.useApiUrl();
  const form = core_dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__.useForm({
    defaultValues: {
      password: ""
    }
  });
  const invalidateAuth = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useInvalidateAuthStore();
  const { isLoading: isDisabling, mutate: disableTwoFactor } = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useCustomMutation();
  const { open } = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useNotification();
  const handleDisableTwoFactor = (values) => {
    disableTwoFactor(
      {
        method: "post",
        url: `${apiUrl}/api/auth/otp/disable`,
        values
      },
      {
        onError: () => {
          open?.({
            description: "Unable to disable 2FA. Please try again later.",
            message: "An error occurred",
            type: "error"
          });
        },
        onSuccess: () => {
          open?.({
            description: "Your account is no longer using 2FA.",
            message: "Two-factor authentication disabled",
            type: "success"
          });
          invalidateAuth();
          close();
        }
      }
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogTitle, { className: "mb-8", children: "Disable Two-Factor Authentication" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Alert, { variant: "destructive", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.AlertTitle, { children: "Warning" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.AlertDescription, { children: "Disabling two-factor authentication will make your account less secure. Please confirm this action by entering your account password." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Form, { ...form, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "form",
        {
          className: "space-y-8",
          onSubmit: form.handleSubmit(handleDisableTwoFactor),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormField,
              {
                control: form.control,
                name: "password",
                render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormItem, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormLabel, { children: "Account Password" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Input,
                    {
                      placeholder: "Enter your password",
                      type: "password",
                      ...field
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormDescription, { children: "Enter your account password to confirm disabling 2FA." }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormMessage, {})
                ] }),
                rules: {
                  minLength: {
                    message: "Password must be at least 8 characters long",
                    value: 8
                  },
                  required: "Password is required"
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end space-x-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Button, { onClick: close, type: "button", variant: "outline", children: "Cancel" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Button,
                {
                  disabled: isDisabling,
                  type: "submit",
                  variant: "destructive",
                  children: "Disable 2FA"
                }
              )
            ] })
          ]
        }
      ) })
    ] })
  ] });
}

function PasswordDots({ className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      "aria-hidden": "true",
      className,
      fill: "none",
      height: "7",
      viewBox: "0 0 219 7",
      width: "219",
      xmlns: "http://www.w3.org/2000/svg",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "3.7771", cy: "3.5", fill: "currentColor", r: "3.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "31.7771", cy: "3.5", fill: "currentColor", r: "3.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "45.7771", cy: "3.5", fill: "currentColor", r: "3.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "17.7771", cy: "3.5", fill: "currentColor", r: "3.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "59.7771", cy: "3.5", fill: "currentColor", r: "3.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "73.7771", cy: "3.5", fill: "currentColor", r: "3.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "87.7771", cy: "3.5", fill: "currentColor", r: "3.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "101.777", cy: "3.5", fill: "currentColor", r: "3.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "131.5", cy: "3.5", fill: "currentColor", r: "3.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "117.5", cy: "3.5", fill: "currentColor", r: "3.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "145.5", cy: "3.5", fill: "currentColor", r: "3.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "159.5", cy: "3.5", fill: "currentColor", r: "3.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "173.5", cy: "3.5", fill: "currentColor", r: "3.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "187.5", cy: "3.5", fill: "currentColor", r: "3.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "201.5", cy: "3.5", fill: "currentColor", r: "3.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "215.5", cy: "3.5", fill: "currentColor", r: "3.5" })
      ]
    }
  );
}

//! otpauth 9.4.0 | (c) Héctor Molinero Fernández | MIT | https://github.com/hectorm/otpauth
//! noble-hashes 1.7.1 | (c) Paul Miller | MIT | https://github.com/paulmillr/noble-hashes
/// <reference types="./otpauth.d.ts" />
// @ts-nocheck
/**
 * Converts an integer to an Uint8Array.
 * @param {number} num Integer.
 * @returns {Uint8Array} Uint8Array.
 */ const uintDecode = (num)=>{
    const buf = new ArrayBuffer(8);
    const arr = new Uint8Array(buf);
    let acc = num;
    for(let i = 7; i >= 0; i--){
        if (acc === 0) break;
        arr[i] = acc & 255;
        acc -= arr[i];
        acc /= 256;
    }
    return arr;
};

/**
 * Internal assertion helpers.
 * @module
 */ /** Asserts something is positive integer. */ function anumber(n) {
    if (!Number.isSafeInteger(n) || n < 0) throw new Error('positive integer expected, got ' + n);
}
/** Is number an Uint8Array? Copied from utils for perf. */ function isBytes(a) {
    return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === 'Uint8Array';
}
/** Asserts something is Uint8Array. */ function abytes(b, ...lengths) {
    if (!isBytes(b)) throw new Error('Uint8Array expected');
    if (lengths.length > 0 && !lengths.includes(b.length)) throw new Error('Uint8Array expected of length ' + lengths + ', got length=' + b.length);
}
/** Asserts something is hash */ function ahash(h) {
    if (typeof h !== 'function' || typeof h.create !== 'function') throw new Error('Hash should be wrapped by utils.wrapConstructor');
    anumber(h.outputLen);
    anumber(h.blockLen);
}
/** Asserts a hash instance has not been destroyed / finished */ function aexists(instance, checkFinished = true) {
    if (instance.destroyed) throw new Error('Hash instance has been destroyed');
    if (checkFinished && instance.finished) throw new Error('Hash#digest() has already been called');
}
/** Asserts output is properly-sized byte array */ function aoutput(out, instance) {
    abytes(out);
    const min = instance.outputLen;
    if (out.length < min) {
        throw new Error('digestInto() expects output buffer of length at least ' + min);
    }
}

/**
 * Utilities for hex, bytes, CSPRNG.
 * @module
 */ /*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */ // We use WebCrypto aka globalThis.crypto, which exists in browsers and node.js 16+.
// node.js versions earlier than v19 don't declare it in global scope.
// For node.js, package.json#exports field mapping rewrites import
// from `crypto` to `cryptoNode`, which imports native module.
// Makes the utils un-importable in browsers without a bundler.
// Once node.js 18 is deprecated (2025-04-30), we can just drop the import.
function u32(arr) {
    return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
}
// Cast array to view
function createView(arr) {
    return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
/** The rotate right (circular right shift) operation for uint32 */ function rotr(word, shift) {
    return word << 32 - shift | word >>> shift;
}
/** The rotate left (circular left shift) operation for uint32 */ function rotl(word, shift) {
    return word << shift | word >>> 32 - shift >>> 0;
}
/** Is current platform little-endian? Most are. Big-Endian platform: IBM */ const isLE = /* @__PURE__ */ (()=>new Uint8Array(new Uint32Array([
        0x11223344
    ]).buffer)[0] === 0x44)();
// The byte swap operation for uint32
function byteSwap(word) {
    return word << 24 & 0xff000000 | word << 8 & 0xff0000 | word >>> 8 & 0xff00 | word >>> 24 & 0xff;
}
/** In place byte swap for Uint32Array */ function byteSwap32(arr) {
    for(let i = 0; i < arr.length; i++){
        arr[i] = byteSwap(arr[i]);
    }
}
/**
 * Convert JS string to byte array.
 * @example utf8ToBytes('abc') // new Uint8Array([97, 98, 99])
 */ function utf8ToBytes(str) {
    if (typeof str !== 'string') throw new Error('utf8ToBytes expected string, got ' + typeof str);
    return new Uint8Array(new TextEncoder().encode(str)); // https://bugzil.la/1681809
}
/**
 * Normalizes (non-hex) string or Uint8Array to Uint8Array.
 * Warning: when Uint8Array is passed, it would NOT get copied.
 * Keep in mind for future mutable operations.
 */ function toBytes(data) {
    if (typeof data === 'string') data = utf8ToBytes(data);
    abytes(data);
    return data;
}
/** For runtime check if class implements interface */ class Hash {
    // Safe version that clones internal state
    clone() {
        return this._cloneInto();
    }
}
/** Wraps hash function, creating an interface on top of it */ function wrapConstructor(hashCons) {
    const hashC = (msg)=>hashCons().update(toBytes(msg)).digest();
    const tmp = hashCons();
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = ()=>hashCons();
    return hashC;
}

class HMAC extends Hash {
    update(buf) {
        aexists(this);
        this.iHash.update(buf);
        return this;
    }
    digestInto(out) {
        aexists(this);
        abytes(out, this.outputLen);
        this.finished = true;
        this.iHash.digestInto(out);
        this.oHash.update(out);
        this.oHash.digestInto(out);
        this.destroy();
    }
    digest() {
        const out = new Uint8Array(this.oHash.outputLen);
        this.digestInto(out);
        return out;
    }
    _cloneInto(to) {
        // Create new instance without calling constructor since key already in state and we don't know it.
        to || (to = Object.create(Object.getPrototypeOf(this), {}));
        const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
        to = to;
        to.finished = finished;
        to.destroyed = destroyed;
        to.blockLen = blockLen;
        to.outputLen = outputLen;
        to.oHash = oHash._cloneInto(to.oHash);
        to.iHash = iHash._cloneInto(to.iHash);
        return to;
    }
    destroy() {
        this.destroyed = true;
        this.oHash.destroy();
        this.iHash.destroy();
    }
    constructor(hash, _key){
        super();
        this.finished = false;
        this.destroyed = false;
        ahash(hash);
        const key = toBytes(_key);
        this.iHash = hash.create();
        if (typeof this.iHash.update !== 'function') throw new Error('Expected instance of class which extends utils.Hash');
        this.blockLen = this.iHash.blockLen;
        this.outputLen = this.iHash.outputLen;
        const blockLen = this.blockLen;
        const pad = new Uint8Array(blockLen);
        // blockLen can be bigger than outputLen
        pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
        for(let i = 0; i < pad.length; i++)pad[i] ^= 0x36;
        this.iHash.update(pad);
        // By doing update (processing of first block) of outer hash here we can re-use it between multiple calls via clone
        this.oHash = hash.create();
        // Undo internal XOR && apply outer XOR
        for(let i = 0; i < pad.length; i++)pad[i] ^= 0x36 ^ 0x5c;
        this.oHash.update(pad);
        pad.fill(0);
    }
}
/**
 * HMAC: RFC2104 message authentication code.
 * @param hash - function that would be used e.g. sha256
 * @param key - message key
 * @param message - message data
 * @example
 * import { hmac } from '@noble/hashes/hmac';
 * import { sha256 } from '@noble/hashes/sha2';
 * const mac1 = hmac(sha256, 'key', 'message');
 */ const hmac = (hash, key, message)=>new HMAC(hash, key).update(message).digest();
hmac.create = (hash, key)=>new HMAC(hash, key);

/** Polyfill for Safari 14. https://caniuse.com/mdn-javascript_builtins_dataview_setbiguint64 */ function setBigUint64(view, byteOffset, value, isLE) {
    if (typeof view.setBigUint64 === 'function') return view.setBigUint64(byteOffset, value, isLE);
    const _32n = BigInt(32);
    const _u32_max = BigInt(0xffffffff);
    const wh = Number(value >> _32n & _u32_max);
    const wl = Number(value & _u32_max);
    const h = isLE ? 4 : 0;
    const l = isLE ? 0 : 4;
    view.setUint32(byteOffset + h, wh, isLE);
    view.setUint32(byteOffset + l, wl, isLE);
}
/** Choice: a ? b : c */ function Chi(a, b, c) {
    return a & b ^ ~a & c;
}
/** Majority function, true if any two inputs is true. */ function Maj(a, b, c) {
    return a & b ^ a & c ^ b & c;
}
/**
 * Merkle-Damgard hash construction base class.
 * Could be used to create MD5, RIPEMD, SHA1, SHA2.
 */ class HashMD extends Hash {
    update(data) {
        aexists(this);
        const { view, buffer, blockLen } = this;
        data = toBytes(data);
        const len = data.length;
        for(let pos = 0; pos < len;){
            const take = Math.min(blockLen - this.pos, len - pos);
            // Fast path: we have at least one block in input, cast it to view and process
            if (take === blockLen) {
                const dataView = createView(data);
                for(; blockLen <= len - pos; pos += blockLen)this.process(dataView, pos);
                continue;
            }
            buffer.set(data.subarray(pos, pos + take), this.pos);
            this.pos += take;
            pos += take;
            if (this.pos === blockLen) {
                this.process(view, 0);
                this.pos = 0;
            }
        }
        this.length += data.length;
        this.roundClean();
        return this;
    }
    digestInto(out) {
        aexists(this);
        aoutput(out, this);
        this.finished = true;
        // Padding
        // We can avoid allocation of buffer for padding completely if it
        // was previously not allocated here. But it won't change performance.
        const { buffer, view, blockLen, isLE } = this;
        let { pos } = this;
        // append the bit '1' to the message
        buffer[pos++] = 0b10000000;
        this.buffer.subarray(pos).fill(0);
        // we have less than padOffset left in buffer, so we cannot put length in
        // current block, need process it and pad again
        if (this.padOffset > blockLen - pos) {
            this.process(view, 0);
            pos = 0;
        }
        // Pad until full block byte with zeros
        for(let i = pos; i < blockLen; i++)buffer[i] = 0;
        // Note: sha512 requires length to be 128bit integer, but length in JS will overflow before that
        // You need to write around 2 exabytes (u64_max / 8 / (1024**6)) for this to happen.
        // So we just write lowest 64 bits of that value.
        setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE);
        this.process(view, 0);
        const oview = createView(out);
        const len = this.outputLen;
        // NOTE: we do division by 4 later, which should be fused in single op with modulo by JIT
        if (len % 4) throw new Error('_sha2: outputLen should be aligned to 32bit');
        const outLen = len / 4;
        const state = this.get();
        if (outLen > state.length) throw new Error('_sha2: outputLen bigger than state');
        for(let i = 0; i < outLen; i++)oview.setUint32(4 * i, state[i], isLE);
    }
    digest() {
        const { buffer, outputLen } = this;
        this.digestInto(buffer);
        const res = buffer.slice(0, outputLen);
        this.destroy();
        return res;
    }
    _cloneInto(to) {
        to || (to = new this.constructor());
        to.set(...this.get());
        const { blockLen, buffer, length, finished, destroyed, pos } = this;
        to.length = length;
        to.pos = pos;
        to.finished = finished;
        to.destroyed = destroyed;
        if (length % blockLen) to.buffer.set(buffer);
        return to;
    }
    constructor(blockLen, outputLen, padOffset, isLE){
        super();
        this.blockLen = blockLen;
        this.outputLen = outputLen;
        this.padOffset = padOffset;
        this.isLE = isLE;
        this.finished = false;
        this.length = 0;
        this.pos = 0;
        this.destroyed = false;
        this.buffer = new Uint8Array(blockLen);
        this.view = createView(this.buffer);
    }
}

// Initial state
const SHA1_IV = /* @__PURE__ */ new Uint32Array([
    0x67452301,
    0xefcdab89,
    0x98badcfe,
    0x10325476,
    0xc3d2e1f0
]);
// Temporary buffer, not used to store anything between runs
// Named this way because it matches specification.
const SHA1_W = /* @__PURE__ */ new Uint32Array(80);
class SHA1 extends HashMD {
    get() {
        const { A, B, C, D, E } = this;
        return [
            A,
            B,
            C,
            D,
            E
        ];
    }
    set(A, B, C, D, E) {
        this.A = A | 0;
        this.B = B | 0;
        this.C = C | 0;
        this.D = D | 0;
        this.E = E | 0;
    }
    process(view, offset) {
        for(let i = 0; i < 16; i++, offset += 4)SHA1_W[i] = view.getUint32(offset, false);
        for(let i = 16; i < 80; i++)SHA1_W[i] = rotl(SHA1_W[i - 3] ^ SHA1_W[i - 8] ^ SHA1_W[i - 14] ^ SHA1_W[i - 16], 1);
        // Compression function main loop, 80 rounds
        let { A, B, C, D, E } = this;
        for(let i = 0; i < 80; i++){
            let F, K;
            if (i < 20) {
                F = Chi(B, C, D);
                K = 0x5a827999;
            } else if (i < 40) {
                F = B ^ C ^ D;
                K = 0x6ed9eba1;
            } else if (i < 60) {
                F = Maj(B, C, D);
                K = 0x8f1bbcdc;
            } else {
                F = B ^ C ^ D;
                K = 0xca62c1d6;
            }
            const T = rotl(A, 5) + F + E + K + SHA1_W[i] | 0;
            E = D;
            D = C;
            C = rotl(B, 30);
            B = A;
            A = T;
        }
        // Add the compressed chunk to the current hash value
        A = A + this.A | 0;
        B = B + this.B | 0;
        C = C + this.C | 0;
        D = D + this.D | 0;
        E = E + this.E | 0;
        this.set(A, B, C, D, E);
    }
    roundClean() {
        SHA1_W.fill(0);
    }
    destroy() {
        this.set(0, 0, 0, 0, 0);
        this.buffer.fill(0);
    }
    constructor(){
        super(64, 20, 8, false);
        this.A = SHA1_IV[0] | 0;
        this.B = SHA1_IV[1] | 0;
        this.C = SHA1_IV[2] | 0;
        this.D = SHA1_IV[3] | 0;
        this.E = SHA1_IV[4] | 0;
    }
}
/** SHA1 (RFC 3174) legacy hash function. It was cryptographically broken. */ const sha1 = /* @__PURE__ */ wrapConstructor(()=>new SHA1());

/** Round constants: first 32 bits of fractional parts of the cube roots of the first 64 primes 2..311). */ // prettier-ignore
const SHA256_K = /* @__PURE__ */ new Uint32Array([
    0x428a2f98,
    0x71374491,
    0xb5c0fbcf,
    0xe9b5dba5,
    0x3956c25b,
    0x59f111f1,
    0x923f82a4,
    0xab1c5ed5,
    0xd807aa98,
    0x12835b01,
    0x243185be,
    0x550c7dc3,
    0x72be5d74,
    0x80deb1fe,
    0x9bdc06a7,
    0xc19bf174,
    0xe49b69c1,
    0xefbe4786,
    0x0fc19dc6,
    0x240ca1cc,
    0x2de92c6f,
    0x4a7484aa,
    0x5cb0a9dc,
    0x76f988da,
    0x983e5152,
    0xa831c66d,
    0xb00327c8,
    0xbf597fc7,
    0xc6e00bf3,
    0xd5a79147,
    0x06ca6351,
    0x14292967,
    0x27b70a85,
    0x2e1b2138,
    0x4d2c6dfc,
    0x53380d13,
    0x650a7354,
    0x766a0abb,
    0x81c2c92e,
    0x92722c85,
    0xa2bfe8a1,
    0xa81a664b,
    0xc24b8b70,
    0xc76c51a3,
    0xd192e819,
    0xd6990624,
    0xf40e3585,
    0x106aa070,
    0x19a4c116,
    0x1e376c08,
    0x2748774c,
    0x34b0bcb5,
    0x391c0cb3,
    0x4ed8aa4a,
    0x5b9cca4f,
    0x682e6ff3,
    0x748f82ee,
    0x78a5636f,
    0x84c87814,
    0x8cc70208,
    0x90befffa,
    0xa4506ceb,
    0xbef9a3f7,
    0xc67178f2
]);
/** Initial state: first 32 bits of fractional parts of the square roots of the first 8 primes 2..19. */ // prettier-ignore
const SHA256_IV = /* @__PURE__ */ new Uint32Array([
    0x6a09e667,
    0xbb67ae85,
    0x3c6ef372,
    0xa54ff53a,
    0x510e527f,
    0x9b05688c,
    0x1f83d9ab,
    0x5be0cd19
]);
/**
 * Temporary buffer, not used to store anything between runs.
 * Named this way because it matches specification.
 */ const SHA256_W = /* @__PURE__ */ new Uint32Array(64);
class SHA256 extends HashMD {
    get() {
        const { A, B, C, D, E, F, G, H } = this;
        return [
            A,
            B,
            C,
            D,
            E,
            F,
            G,
            H
        ];
    }
    // prettier-ignore
    set(A, B, C, D, E, F, G, H) {
        this.A = A | 0;
        this.B = B | 0;
        this.C = C | 0;
        this.D = D | 0;
        this.E = E | 0;
        this.F = F | 0;
        this.G = G | 0;
        this.H = H | 0;
    }
    process(view, offset) {
        // Extend the first 16 words into the remaining 48 words w[16..63] of the message schedule array
        for(let i = 0; i < 16; i++, offset += 4)SHA256_W[i] = view.getUint32(offset, false);
        for(let i = 16; i < 64; i++){
            const W15 = SHA256_W[i - 15];
            const W2 = SHA256_W[i - 2];
            const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
            const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
            SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
        }
        // Compression function main loop, 64 rounds
        let { A, B, C, D, E, F, G, H } = this;
        for(let i = 0; i < 64; i++){
            const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
            const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
            const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
            const T2 = sigma0 + Maj(A, B, C) | 0;
            H = G;
            G = F;
            F = E;
            E = D + T1 | 0;
            D = C;
            C = B;
            B = A;
            A = T1 + T2 | 0;
        }
        // Add the compressed chunk to the current hash value
        A = A + this.A | 0;
        B = B + this.B | 0;
        C = C + this.C | 0;
        D = D + this.D | 0;
        E = E + this.E | 0;
        F = F + this.F | 0;
        G = G + this.G | 0;
        H = H + this.H | 0;
        this.set(A, B, C, D, E, F, G, H);
    }
    roundClean() {
        SHA256_W.fill(0);
    }
    destroy() {
        this.set(0, 0, 0, 0, 0, 0, 0, 0);
        this.buffer.fill(0);
    }
    constructor(){
        super(64, 32, 8, false);
        // We cannot use array here since array allows indexing by variable
        // which means optimizer/compiler cannot use registers.
        this.A = SHA256_IV[0] | 0;
        this.B = SHA256_IV[1] | 0;
        this.C = SHA256_IV[2] | 0;
        this.D = SHA256_IV[3] | 0;
        this.E = SHA256_IV[4] | 0;
        this.F = SHA256_IV[5] | 0;
        this.G = SHA256_IV[6] | 0;
        this.H = SHA256_IV[7] | 0;
    }
}
/**
 * Constants taken from https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf.
 */ class SHA224 extends SHA256 {
    constructor(){
        super();
        this.A = 0xc1059ed8 | 0;
        this.B = 0x367cd507 | 0;
        this.C = 0x3070dd17 | 0;
        this.D = 0xf70e5939 | 0;
        this.E = 0xffc00b31 | 0;
        this.F = 0x68581511 | 0;
        this.G = 0x64f98fa7 | 0;
        this.H = 0xbefa4fa4 | 0;
        this.outputLen = 28;
    }
}
/** SHA2-256 hash function */ const sha256 = /* @__PURE__ */ wrapConstructor(()=>new SHA256());
/** SHA2-224 hash function */ const sha224 = /* @__PURE__ */ wrapConstructor(()=>new SHA224());

/**
 * Internal helpers for u64. BigUint64Array is too slow as per 2025, so we implement it using Uint32Array.
 * @todo re-check https://issues.chromium.org/issues/42212588
 * @module
 */ const U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
const _32n = /* @__PURE__ */ BigInt(32);
function fromBig(n, le = false) {
    if (le) return {
        h: Number(n & U32_MASK64),
        l: Number(n >> _32n & U32_MASK64)
    };
    return {
        h: Number(n >> _32n & U32_MASK64) | 0,
        l: Number(n & U32_MASK64) | 0
    };
}
function split(lst, le = false) {
    let Ah = new Uint32Array(lst.length);
    let Al = new Uint32Array(lst.length);
    for(let i = 0; i < lst.length; i++){
        const { h, l } = fromBig(lst[i], le);
        [Ah[i], Al[i]] = [
            h,
            l
        ];
    }
    return [
        Ah,
        Al
    ];
}
const toBig = (h, l)=>BigInt(h >>> 0) << _32n | BigInt(l >>> 0);
// for Shift in [0, 32)
const shrSH = (h, _l, s)=>h >>> s;
const shrSL = (h, l, s)=>h << 32 - s | l >>> s;
// Right rotate for Shift in [1, 32)
const rotrSH = (h, l, s)=>h >>> s | l << 32 - s;
const rotrSL = (h, l, s)=>h << 32 - s | l >>> s;
// Right rotate for Shift in (32, 64), NOTE: 32 is special case.
const rotrBH = (h, l, s)=>h << 64 - s | l >>> s - 32;
const rotrBL = (h, l, s)=>h >>> s - 32 | l << 64 - s;
// Right rotate for shift===32 (just swaps l&h)
const rotr32H = (_h, l)=>l;
const rotr32L = (h, _l)=>h;
// Left rotate for Shift in [1, 32)
const rotlSH = (h, l, s)=>h << s | l >>> 32 - s;
const rotlSL = (h, l, s)=>l << s | h >>> 32 - s;
// Left rotate for Shift in (32, 64), NOTE: 32 is special case.
const rotlBH = (h, l, s)=>l << s - 32 | h >>> 64 - s;
const rotlBL = (h, l, s)=>h << s - 32 | l >>> 64 - s;
// JS uses 32-bit signed integers for bitwise operations which means we cannot
// simple take carry out of low bit sum by shift, we need to use division.
function add(Ah, Al, Bh, Bl) {
    const l = (Al >>> 0) + (Bl >>> 0);
    return {
        h: Ah + Bh + (l / 2 ** 32 | 0) | 0,
        l: l | 0
    };
}
// Addition with more than 2 elements
const add3L = (Al, Bl, Cl)=>(Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
const add3H = (low, Ah, Bh, Ch)=>Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
const add4L = (Al, Bl, Cl, Dl)=>(Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
const add4H = (low, Ah, Bh, Ch, Dh)=>Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
const add5L = (Al, Bl, Cl, Dl, El)=>(Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
const add5H = (low, Ah, Bh, Ch, Dh, Eh)=>Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;
// prettier-ignore
const u64 = {
    fromBig,
    split,
    toBig,
    shrSH,
    shrSL,
    rotrSH,
    rotrSL,
    rotrBH,
    rotrBL,
    rotr32H,
    rotr32L,
    rotlSH,
    rotlSL,
    rotlBH,
    rotlBL,
    add,
    add3L,
    add3H,
    add4L,
    add4H,
    add5H,
    add5L
};

// Round contants (first 32 bits of the fractional parts of the cube roots of the first 80 primes 2..409):
// prettier-ignore
const [SHA512_Kh, SHA512_Kl] = /* @__PURE__ */ (()=>u64.split([
        '0x428a2f98d728ae22',
        '0x7137449123ef65cd',
        '0xb5c0fbcfec4d3b2f',
        '0xe9b5dba58189dbbc',
        '0x3956c25bf348b538',
        '0x59f111f1b605d019',
        '0x923f82a4af194f9b',
        '0xab1c5ed5da6d8118',
        '0xd807aa98a3030242',
        '0x12835b0145706fbe',
        '0x243185be4ee4b28c',
        '0x550c7dc3d5ffb4e2',
        '0x72be5d74f27b896f',
        '0x80deb1fe3b1696b1',
        '0x9bdc06a725c71235',
        '0xc19bf174cf692694',
        '0xe49b69c19ef14ad2',
        '0xefbe4786384f25e3',
        '0x0fc19dc68b8cd5b5',
        '0x240ca1cc77ac9c65',
        '0x2de92c6f592b0275',
        '0x4a7484aa6ea6e483',
        '0x5cb0a9dcbd41fbd4',
        '0x76f988da831153b5',
        '0x983e5152ee66dfab',
        '0xa831c66d2db43210',
        '0xb00327c898fb213f',
        '0xbf597fc7beef0ee4',
        '0xc6e00bf33da88fc2',
        '0xd5a79147930aa725',
        '0x06ca6351e003826f',
        '0x142929670a0e6e70',
        '0x27b70a8546d22ffc',
        '0x2e1b21385c26c926',
        '0x4d2c6dfc5ac42aed',
        '0x53380d139d95b3df',
        '0x650a73548baf63de',
        '0x766a0abb3c77b2a8',
        '0x81c2c92e47edaee6',
        '0x92722c851482353b',
        '0xa2bfe8a14cf10364',
        '0xa81a664bbc423001',
        '0xc24b8b70d0f89791',
        '0xc76c51a30654be30',
        '0xd192e819d6ef5218',
        '0xd69906245565a910',
        '0xf40e35855771202a',
        '0x106aa07032bbd1b8',
        '0x19a4c116b8d2d0c8',
        '0x1e376c085141ab53',
        '0x2748774cdf8eeb99',
        '0x34b0bcb5e19b48a8',
        '0x391c0cb3c5c95a63',
        '0x4ed8aa4ae3418acb',
        '0x5b9cca4f7763e373',
        '0x682e6ff3d6b2b8a3',
        '0x748f82ee5defb2fc',
        '0x78a5636f43172f60',
        '0x84c87814a1f0ab72',
        '0x8cc702081a6439ec',
        '0x90befffa23631e28',
        '0xa4506cebde82bde9',
        '0xbef9a3f7b2c67915',
        '0xc67178f2e372532b',
        '0xca273eceea26619c',
        '0xd186b8c721c0c207',
        '0xeada7dd6cde0eb1e',
        '0xf57d4f7fee6ed178',
        '0x06f067aa72176fba',
        '0x0a637dc5a2c898a6',
        '0x113f9804bef90dae',
        '0x1b710b35131c471b',
        '0x28db77f523047d84',
        '0x32caab7b40c72493',
        '0x3c9ebe0a15c9bebc',
        '0x431d67c49c100d4c',
        '0x4cc5d4becb3e42b6',
        '0x597f299cfc657e2a',
        '0x5fcb6fab3ad6faec',
        '0x6c44198c4a475817'
    ].map((n)=>BigInt(n))))();
// Temporary buffer, not used to store anything between runs
const SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
const SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);
class SHA512 extends HashMD {
    // prettier-ignore
    get() {
        const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
        return [
            Ah,
            Al,
            Bh,
            Bl,
            Ch,
            Cl,
            Dh,
            Dl,
            Eh,
            El,
            Fh,
            Fl,
            Gh,
            Gl,
            Hh,
            Hl
        ];
    }
    // prettier-ignore
    set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
        this.Ah = Ah | 0;
        this.Al = Al | 0;
        this.Bh = Bh | 0;
        this.Bl = Bl | 0;
        this.Ch = Ch | 0;
        this.Cl = Cl | 0;
        this.Dh = Dh | 0;
        this.Dl = Dl | 0;
        this.Eh = Eh | 0;
        this.El = El | 0;
        this.Fh = Fh | 0;
        this.Fl = Fl | 0;
        this.Gh = Gh | 0;
        this.Gl = Gl | 0;
        this.Hh = Hh | 0;
        this.Hl = Hl | 0;
    }
    process(view, offset) {
        // Extend the first 16 words into the remaining 64 words w[16..79] of the message schedule array
        for(let i = 0; i < 16; i++, offset += 4){
            SHA512_W_H[i] = view.getUint32(offset);
            SHA512_W_L[i] = view.getUint32(offset += 4);
        }
        for(let i = 16; i < 80; i++){
            // s0 := (w[i-15] rightrotate 1) xor (w[i-15] rightrotate 8) xor (w[i-15] rightshift 7)
            const W15h = SHA512_W_H[i - 15] | 0;
            const W15l = SHA512_W_L[i - 15] | 0;
            const s0h = u64.rotrSH(W15h, W15l, 1) ^ u64.rotrSH(W15h, W15l, 8) ^ u64.shrSH(W15h, W15l, 7);
            const s0l = u64.rotrSL(W15h, W15l, 1) ^ u64.rotrSL(W15h, W15l, 8) ^ u64.shrSL(W15h, W15l, 7);
            // s1 := (w[i-2] rightrotate 19) xor (w[i-2] rightrotate 61) xor (w[i-2] rightshift 6)
            const W2h = SHA512_W_H[i - 2] | 0;
            const W2l = SHA512_W_L[i - 2] | 0;
            const s1h = u64.rotrSH(W2h, W2l, 19) ^ u64.rotrBH(W2h, W2l, 61) ^ u64.shrSH(W2h, W2l, 6);
            const s1l = u64.rotrSL(W2h, W2l, 19) ^ u64.rotrBL(W2h, W2l, 61) ^ u64.shrSL(W2h, W2l, 6);
            // SHA256_W[i] = s0 + s1 + SHA256_W[i - 7] + SHA256_W[i - 16];
            const SUMl = u64.add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
            const SUMh = u64.add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
            SHA512_W_H[i] = SUMh | 0;
            SHA512_W_L[i] = SUMl | 0;
        }
        let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
        // Compression function main loop, 80 rounds
        for(let i = 0; i < 80; i++){
            // S1 := (e rightrotate 14) xor (e rightrotate 18) xor (e rightrotate 41)
            const sigma1h = u64.rotrSH(Eh, El, 14) ^ u64.rotrSH(Eh, El, 18) ^ u64.rotrBH(Eh, El, 41);
            const sigma1l = u64.rotrSL(Eh, El, 14) ^ u64.rotrSL(Eh, El, 18) ^ u64.rotrBL(Eh, El, 41);
            //const T1 = (H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i]) | 0;
            const CHIh = Eh & Fh ^ ~Eh & Gh;
            const CHIl = El & Fl ^ ~El & Gl;
            // T1 = H + sigma1 + Chi(E, F, G) + SHA512_K[i] + SHA512_W[i]
            // prettier-ignore
            const T1ll = u64.add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
            const T1h = u64.add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
            const T1l = T1ll | 0;
            // S0 := (a rightrotate 28) xor (a rightrotate 34) xor (a rightrotate 39)
            const sigma0h = u64.rotrSH(Ah, Al, 28) ^ u64.rotrBH(Ah, Al, 34) ^ u64.rotrBH(Ah, Al, 39);
            const sigma0l = u64.rotrSL(Ah, Al, 28) ^ u64.rotrBL(Ah, Al, 34) ^ u64.rotrBL(Ah, Al, 39);
            const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
            const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
            Hh = Gh | 0;
            Hl = Gl | 0;
            Gh = Fh | 0;
            Gl = Fl | 0;
            Fh = Eh | 0;
            Fl = El | 0;
            ({ h: Eh, l: El } = u64.add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
            Dh = Ch | 0;
            Dl = Cl | 0;
            Ch = Bh | 0;
            Cl = Bl | 0;
            Bh = Ah | 0;
            Bl = Al | 0;
            const All = u64.add3L(T1l, sigma0l, MAJl);
            Ah = u64.add3H(All, T1h, sigma0h, MAJh);
            Al = All | 0;
        }
        // Add the compressed chunk to the current hash value
        ({ h: Ah, l: Al } = u64.add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
        ({ h: Bh, l: Bl } = u64.add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
        ({ h: Ch, l: Cl } = u64.add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
        ({ h: Dh, l: Dl } = u64.add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
        ({ h: Eh, l: El } = u64.add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
        ({ h: Fh, l: Fl } = u64.add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
        ({ h: Gh, l: Gl } = u64.add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
        ({ h: Hh, l: Hl } = u64.add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
        this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
    }
    roundClean() {
        SHA512_W_H.fill(0);
        SHA512_W_L.fill(0);
    }
    destroy() {
        this.buffer.fill(0);
        this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    }
    constructor(){
        super(128, 64, 16, false);
        // We cannot use array here since array allows indexing by variable which means optimizer/compiler cannot use registers.
        // Also looks cleaner and easier to verify with spec.
        // Initial state (first 32 bits of the fractional parts of the square roots of the first 8 primes 2..19):
        // h -- high 32 bits, l -- low 32 bits
        this.Ah = 0x6a09e667 | 0;
        this.Al = 0xf3bcc908 | 0;
        this.Bh = 0xbb67ae85 | 0;
        this.Bl = 0x84caa73b | 0;
        this.Ch = 0x3c6ef372 | 0;
        this.Cl = 0xfe94f82b | 0;
        this.Dh = 0xa54ff53a | 0;
        this.Dl = 0x5f1d36f1 | 0;
        this.Eh = 0x510e527f | 0;
        this.El = 0xade682d1 | 0;
        this.Fh = 0x9b05688c | 0;
        this.Fl = 0x2b3e6c1f | 0;
        this.Gh = 0x1f83d9ab | 0;
        this.Gl = 0xfb41bd6b | 0;
        this.Hh = 0x5be0cd19 | 0;
        this.Hl = 0x137e2179 | 0;
    }
}
class SHA384 extends SHA512 {
    constructor(){
        super();
        // h -- high 32 bits, l -- low 32 bits
        this.Ah = 0xcbbb9d5d | 0;
        this.Al = 0xc1059ed8 | 0;
        this.Bh = 0x629a292a | 0;
        this.Bl = 0x367cd507 | 0;
        this.Ch = 0x9159015a | 0;
        this.Cl = 0x3070dd17 | 0;
        this.Dh = 0x152fecd8 | 0;
        this.Dl = 0xf70e5939 | 0;
        this.Eh = 0x67332667 | 0;
        this.El = 0xffc00b31 | 0;
        this.Fh = 0x8eb44a87 | 0;
        this.Fl = 0x68581511 | 0;
        this.Gh = 0xdb0c2e0d | 0;
        this.Gl = 0x64f98fa7 | 0;
        this.Hh = 0x47b5481d | 0;
        this.Hl = 0xbefa4fa4 | 0;
        this.outputLen = 48;
    }
}
/** SHA2-512 hash function. */ const sha512 = /* @__PURE__ */ wrapConstructor(()=>new SHA512());
/** SHA2-384 hash function. */ const sha384 = /* @__PURE__ */ wrapConstructor(()=>new SHA384());

// Various per round constants calculations
const SHA3_PI = [];
const SHA3_ROTL = [];
const _SHA3_IOTA = [];
const _0n = /* @__PURE__ */ BigInt(0);
const _1n = /* @__PURE__ */ BigInt(1);
const _2n = /* @__PURE__ */ BigInt(2);
const _7n = /* @__PURE__ */ BigInt(7);
const _256n = /* @__PURE__ */ BigInt(256);
const _0x71n = /* @__PURE__ */ BigInt(0x71);
for(let round = 0, R = _1n, x = 1, y = 0; round < 24; round++){
    // Pi
    [x, y] = [
        y,
        (2 * x + 3 * y) % 5
    ];
    SHA3_PI.push(2 * (5 * y + x));
    // Rotational
    SHA3_ROTL.push((round + 1) * (round + 2) / 2 % 64);
    // Iota
    let t = _0n;
    for(let j = 0; j < 7; j++){
        R = (R << _1n ^ (R >> _7n) * _0x71n) % _256n;
        if (R & _2n) t ^= _1n << (_1n << /* @__PURE__ */ BigInt(j)) - _1n;
    }
    _SHA3_IOTA.push(t);
}
const [SHA3_IOTA_H, SHA3_IOTA_L] = /* @__PURE__ */ split(_SHA3_IOTA, true);
// Left rotation (without 0, 32, 64)
const rotlH = (h, l, s)=>s > 32 ? rotlBH(h, l, s) : rotlSH(h, l, s);
const rotlL = (h, l, s)=>s > 32 ? rotlBL(h, l, s) : rotlSL(h, l, s);
/** `keccakf1600` internal function, additionally allows to adjust round count. */ function keccakP(s, rounds = 24) {
    const B = new Uint32Array(5 * 2);
    // NOTE: all indices are x2 since we store state as u32 instead of u64 (bigints to slow in js)
    for(let round = 24 - rounds; round < 24; round++){
        // Theta θ
        for(let x = 0; x < 10; x++)B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
        for(let x = 0; x < 10; x += 2){
            const idx1 = (x + 8) % 10;
            const idx0 = (x + 2) % 10;
            const B0 = B[idx0];
            const B1 = B[idx0 + 1];
            const Th = rotlH(B0, B1, 1) ^ B[idx1];
            const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1];
            for(let y = 0; y < 50; y += 10){
                s[x + y] ^= Th;
                s[x + y + 1] ^= Tl;
            }
        }
        // Rho (ρ) and Pi (π)
        let curH = s[2];
        let curL = s[3];
        for(let t = 0; t < 24; t++){
            const shift = SHA3_ROTL[t];
            const Th = rotlH(curH, curL, shift);
            const Tl = rotlL(curH, curL, shift);
            const PI = SHA3_PI[t];
            curH = s[PI];
            curL = s[PI + 1];
            s[PI] = Th;
            s[PI + 1] = Tl;
        }
        // Chi (χ)
        for(let y = 0; y < 50; y += 10){
            for(let x = 0; x < 10; x++)B[x] = s[y + x];
            for(let x = 0; x < 10; x++)s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10];
        }
        // Iota (ι)
        s[0] ^= SHA3_IOTA_H[round];
        s[1] ^= SHA3_IOTA_L[round];
    }
    B.fill(0);
}
/** Keccak sponge function. */ class Keccak extends Hash {
    keccak() {
        if (!isLE) byteSwap32(this.state32);
        keccakP(this.state32, this.rounds);
        if (!isLE) byteSwap32(this.state32);
        this.posOut = 0;
        this.pos = 0;
    }
    update(data) {
        aexists(this);
        const { blockLen, state } = this;
        data = toBytes(data);
        const len = data.length;
        for(let pos = 0; pos < len;){
            const take = Math.min(blockLen - this.pos, len - pos);
            for(let i = 0; i < take; i++)state[this.pos++] ^= data[pos++];
            if (this.pos === blockLen) this.keccak();
        }
        return this;
    }
    finish() {
        if (this.finished) return;
        this.finished = true;
        const { state, suffix, pos, blockLen } = this;
        // Do the padding
        state[pos] ^= suffix;
        if ((suffix & 0x80) !== 0 && pos === blockLen - 1) this.keccak();
        state[blockLen - 1] ^= 0x80;
        this.keccak();
    }
    writeInto(out) {
        aexists(this, false);
        abytes(out);
        this.finish();
        const bufferOut = this.state;
        const { blockLen } = this;
        for(let pos = 0, len = out.length; pos < len;){
            if (this.posOut >= blockLen) this.keccak();
            const take = Math.min(blockLen - this.posOut, len - pos);
            out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
            this.posOut += take;
            pos += take;
        }
        return out;
    }
    xofInto(out) {
        // Sha3/Keccak usage with XOF is probably mistake, only SHAKE instances can do XOF
        if (!this.enableXOF) throw new Error('XOF is not possible for this instance');
        return this.writeInto(out);
    }
    xof(bytes) {
        anumber(bytes);
        return this.xofInto(new Uint8Array(bytes));
    }
    digestInto(out) {
        aoutput(out, this);
        if (this.finished) throw new Error('digest() was already called');
        this.writeInto(out);
        this.destroy();
        return out;
    }
    digest() {
        return this.digestInto(new Uint8Array(this.outputLen));
    }
    destroy() {
        this.destroyed = true;
        this.state.fill(0);
    }
    _cloneInto(to) {
        const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
        to || (to = new Keccak(blockLen, suffix, outputLen, enableXOF, rounds));
        to.state32.set(this.state32);
        to.pos = this.pos;
        to.posOut = this.posOut;
        to.finished = this.finished;
        to.rounds = rounds;
        // Suffix can change in cSHAKE
        to.suffix = suffix;
        to.outputLen = outputLen;
        to.enableXOF = enableXOF;
        to.destroyed = this.destroyed;
        return to;
    }
    // NOTE: we accept arguments in bytes instead of bits here.
    constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24){
        super();
        this.blockLen = blockLen;
        this.suffix = suffix;
        this.outputLen = outputLen;
        this.enableXOF = enableXOF;
        this.rounds = rounds;
        this.pos = 0;
        this.posOut = 0;
        this.finished = false;
        this.destroyed = false;
        // Can be passed from user as dkLen
        anumber(outputLen);
        // 1600 = 5x5 matrix of 64bit.  1600 bits === 200 bytes
        // 0 < blockLen < 200
        if (0 >= this.blockLen || this.blockLen >= 200) throw new Error('Sha3 supports only keccak-f1600 function');
        this.state = new Uint8Array(200);
        this.state32 = u32(this.state);
    }
}
const gen = (suffix, blockLen, outputLen)=>wrapConstructor(()=>new Keccak(blockLen, suffix, outputLen));
/** SHA3-224 hash function. */ const sha3_224 = /* @__PURE__ */ gen(0x06, 144, 224 / 8);
/** SHA3-256 hash function. Different from keccak-256. */ const sha3_256 = /* @__PURE__ */ gen(0x06, 136, 256 / 8);
/** SHA3-384 hash function. */ const sha3_384 = /* @__PURE__ */ gen(0x06, 104, 384 / 8);
/** SHA3-512 hash function. */ const sha3_512 = /* @__PURE__ */ gen(0x06, 72, 512 / 8);

/**
 * "globalThis" ponyfill.
 * @see [A horrifying globalThis polyfill in universal JavaScript](https://mathiasbynens.be/notes/globalthis)
 * @type {Object.<string, *>}
 */ const globalScope = (()=>{
    if (typeof globalThis === "object") return globalThis;
    else {
        Object.defineProperty(Object.prototype, "__GLOBALTHIS__", {
            get () {
                return this;
            },
            configurable: true
        });
        try {
            // @ts-expect-error
            // eslint-disable-next-line no-undef
            if (typeof __GLOBALTHIS__ !== "undefined") return __GLOBALTHIS__;
        } finally{
            // @ts-expect-error
            delete Object.prototype.__GLOBALTHIS__;
        }
    }
    // Still unable to determine "globalThis", fall back to a naive method.
    if (typeof self !== "undefined") return self;
    else if (typeof window !== "undefined") return window;
    else if (typeof global !== "undefined") return global;
    return undefined;
})();

/**
 * @noble/hashes hash functions.
 * @type {Object.<string, sha1|sha224|sha256|sha384|sha512|sha3_224|sha3_256|sha3_384|sha3_512>}
 */ const nobleHashes = {
    SHA1: sha1,
    SHA224: sha224,
    SHA256: sha256,
    SHA384: sha384,
    SHA512: sha512,
    "SHA3-224": sha3_224,
    "SHA3-256": sha3_256,
    "SHA3-384": sha3_384,
    "SHA3-512": sha3_512
};
/**
 * Canonicalizes a hash algorithm name.
 * @param {string} algorithm Hash algorithm name.
 * @returns {"SHA1"|"SHA224"|"SHA256"|"SHA384"|"SHA512"|"SHA3-224"|"SHA3-256"|"SHA3-384"|"SHA3-512"} Canonicalized hash algorithm name.
 */ const canonicalizeAlgorithm = (algorithm)=>{
    switch(true){
        case /^(?:SHA-?1|SSL3-SHA1)$/i.test(algorithm):
            return "SHA1";
        case /^SHA(?:2?-)?224$/i.test(algorithm):
            return "SHA224";
        case /^SHA(?:2?-)?256$/i.test(algorithm):
            return "SHA256";
        case /^SHA(?:2?-)?384$/i.test(algorithm):
            return "SHA384";
        case /^SHA(?:2?-)?512$/i.test(algorithm):
            return "SHA512";
        case /^SHA3-224$/i.test(algorithm):
            return "SHA3-224";
        case /^SHA3-256$/i.test(algorithm):
            return "SHA3-256";
        case /^SHA3-384$/i.test(algorithm):
            return "SHA3-384";
        case /^SHA3-512$/i.test(algorithm):
            return "SHA3-512";
        default:
            throw new TypeError(`Unknown hash algorithm: ${algorithm}`);
    }
};
/**
 * Calculates an HMAC digest.
 * @param {string} algorithm Algorithm.
 * @param {Uint8Array} key Key.
 * @param {Uint8Array} message Message.
 * @returns {Uint8Array} Digest.
 */ const hmacDigest = (algorithm, key, message)=>{
    if (hmac) {
        const hash = nobleHashes[algorithm] ?? nobleHashes[canonicalizeAlgorithm(algorithm)];
        return hmac(hash, key, message);
    } else {
        throw new Error("Missing HMAC function");
    }
};

/**
 * RFC 4648 base32 alphabet without pad.
 * @type {string}
 */ const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
/**
 * Converts a base32 string to an Uint8Array (RFC 4648).
 * @see [LinusU/base32-decode](https://github.com/LinusU/base32-decode)
 * @param {string} str Base32 string.
 * @returns {Uint8Array} Uint8Array.
 */ const base32Decode = (str)=>{
    // Remove spaces (although they are not allowed by the spec, some issuers add them for readability).
    str = str.replace(/ /g, "");
    // Canonicalize to all upper case and remove padding if it exists.
    let end = str.length;
    while(str[end - 1] === "=")--end;
    str = (end < str.length ? str.substring(0, end) : str).toUpperCase();
    const buf = new ArrayBuffer(str.length * 5 / 8 | 0);
    const arr = new Uint8Array(buf);
    let bits = 0;
    let value = 0;
    let index = 0;
    for(let i = 0; i < str.length; i++){
        const idx = ALPHABET.indexOf(str[i]);
        if (idx === -1) throw new TypeError(`Invalid character found: ${str[i]}`);
        value = value << 5 | idx;
        bits += 5;
        if (bits >= 8) {
            bits -= 8;
            arr[index++] = value >>> bits;
        }
    }
    return arr;
};
/**
 * Converts an Uint8Array to a base32 string (RFC 4648).
 * @see [LinusU/base32-encode](https://github.com/LinusU/base32-encode)
 * @param {Uint8Array} arr Uint8Array.
 * @returns {string} Base32 string.
 */ const base32Encode = (arr)=>{
    let bits = 0;
    let value = 0;
    let str = "";
    for(let i = 0; i < arr.length; i++){
        value = value << 8 | arr[i];
        bits += 8;
        while(bits >= 5){
            str += ALPHABET[value >>> bits - 5 & 31];
            bits -= 5;
        }
    }
    if (bits > 0) {
        str += ALPHABET[value << 5 - bits & 31];
    }
    return str;
};

/**
 * Converts a hexadecimal string to an Uint8Array.
 * @param {string} str Hexadecimal string.
 * @returns {Uint8Array} Uint8Array.
 */ const hexDecode = (str)=>{
    // Remove spaces (although they are not allowed by the spec, some issuers add them for readability).
    str = str.replace(/ /g, "");
    const buf = new ArrayBuffer(str.length / 2);
    const arr = new Uint8Array(buf);
    for(let i = 0; i < str.length; i += 2){
        arr[i / 2] = parseInt(str.substring(i, i + 2), 16);
    }
    return arr;
};
/**
 * Converts an Uint8Array to a hexadecimal string.
 * @param {Uint8Array} arr Uint8Array.
 * @returns {string} Hexadecimal string.
 */ const hexEncode = (arr)=>{
    let str = "";
    for(let i = 0; i < arr.length; i++){
        const hex = arr[i].toString(16);
        if (hex.length === 1) str += "0";
        str += hex;
    }
    return str.toUpperCase();
};

/**
 * Converts a Latin-1 string to an Uint8Array.
 * @param {string} str Latin-1 string.
 * @returns {Uint8Array} Uint8Array.
 */ const latin1Decode = (str)=>{
    const buf = new ArrayBuffer(str.length);
    const arr = new Uint8Array(buf);
    for(let i = 0; i < str.length; i++){
        arr[i] = str.charCodeAt(i) & 0xff;
    }
    return arr;
};
/**
 * Converts an Uint8Array to a Latin-1 string.
 * @param {Uint8Array} arr Uint8Array.
 * @returns {string} Latin-1 string.
 */ const latin1Encode = (arr)=>{
    let str = "";
    for(let i = 0; i < arr.length; i++){
        str += String.fromCharCode(arr[i]);
    }
    return str;
};

/**
 * TextEncoder instance.
 * @type {TextEncoder|null}
 */ const ENCODER = globalScope.TextEncoder ? new globalScope.TextEncoder() : null;
/**
 * TextDecoder instance.
 * @type {TextDecoder|null}
 */ const DECODER = globalScope.TextDecoder ? new globalScope.TextDecoder() : null;
/**
 * Converts an UTF-8 string to an Uint8Array.
 * @param {string} str String.
 * @returns {Uint8Array} Uint8Array.
 */ const utf8Decode = (str)=>{
    if (!ENCODER) {
        throw new Error("Encoding API not available");
    }
    return ENCODER.encode(str);
};
/**
 * Converts an Uint8Array to an UTF-8 string.
 * @param {Uint8Array} arr Uint8Array.
 * @returns {string} String.
 */ const utf8Encode = (arr)=>{
    if (!DECODER) {
        throw new Error("Encoding API not available");
    }
    return DECODER.decode(arr);
};

/**
 * Returns random bytes.
 * @param {number} size Size.
 * @returns {Uint8Array} Random bytes.
 */ const randomBytes = (size)=>{
    if (globalScope.crypto?.getRandomValues) {
        return globalScope.crypto.getRandomValues(new Uint8Array(size));
    } else {
        throw new Error("Cryptography API not available");
    }
};

/**
 * OTP secret key.
 */ class Secret {
    /**
   * Converts a Latin-1 string to a Secret object.
   * @param {string} str Latin-1 string.
   * @returns {Secret} Secret object.
   */ static fromLatin1(str) {
        return new Secret({
            buffer: latin1Decode(str).buffer
        });
    }
    /**
   * Converts an UTF-8 string to a Secret object.
   * @param {string} str UTF-8 string.
   * @returns {Secret} Secret object.
   */ static fromUTF8(str) {
        return new Secret({
            buffer: utf8Decode(str).buffer
        });
    }
    /**
   * Converts a base32 string to a Secret object.
   * @param {string} str Base32 string.
   * @returns {Secret} Secret object.
   */ static fromBase32(str) {
        return new Secret({
            buffer: base32Decode(str).buffer
        });
    }
    /**
   * Converts a hexadecimal string to a Secret object.
   * @param {string} str Hexadecimal string.
   * @returns {Secret} Secret object.
   */ static fromHex(str) {
        return new Secret({
            buffer: hexDecode(str).buffer
        });
    }
    /**
   * Secret key buffer.
   * @deprecated For backward compatibility, the "bytes" property should be used instead.
   * @type {ArrayBufferLike}
   */ get buffer() {
        return this.bytes.buffer;
    }
    /**
   * Latin-1 string representation of secret key.
   * @type {string}
   */ get latin1() {
        Object.defineProperty(this, "latin1", {
            enumerable: true,
            writable: false,
            configurable: false,
            value: latin1Encode(this.bytes)
        });
        return this.latin1;
    }
    /**
   * UTF-8 string representation of secret key.
   * @type {string}
   */ get utf8() {
        Object.defineProperty(this, "utf8", {
            enumerable: true,
            writable: false,
            configurable: false,
            value: utf8Encode(this.bytes)
        });
        return this.utf8;
    }
    /**
   * Base32 string representation of secret key.
   * @type {string}
   */ get base32() {
        Object.defineProperty(this, "base32", {
            enumerable: true,
            writable: false,
            configurable: false,
            value: base32Encode(this.bytes)
        });
        return this.base32;
    }
    /**
   * Hexadecimal string representation of secret key.
   * @type {string}
   */ get hex() {
        Object.defineProperty(this, "hex", {
            enumerable: true,
            writable: false,
            configurable: false,
            value: hexEncode(this.bytes)
        });
        return this.hex;
    }
    /**
   * Creates a secret key object.
   * @param {Object} [config] Configuration options.
   * @param {ArrayBufferLike} [config.buffer] Secret key buffer.
   * @param {number} [config.size=20] Number of random bytes to generate, ignored if 'buffer' is provided.
   */ constructor({ buffer, size = 20 } = {}){
        /**
     * Secret key.
     * @type {Uint8Array}
     * @readonly
     */ this.bytes = typeof buffer === "undefined" ? randomBytes(size) : new Uint8Array(buffer);
        // Prevent the "bytes" property from being modified.
        Object.defineProperty(this, "bytes", {
            enumerable: true,
            writable: false,
            configurable: false,
            value: this.bytes
        });
    }
}

/**
 * Returns true if a is equal to b, without leaking timing information that would allow an attacker to guess one of the values.
 * @param {string} a String a.
 * @param {string} b String b.
 * @returns {boolean} Equality result.
 */ const timingSafeEqual = (a, b)=>{
    {
        if (a.length !== b.length) {
            throw new TypeError("Input strings must have the same length");
        }
        let i = -1;
        let out = 0;
        while(++i < a.length){
            out |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
        return out === 0;
    }
};

/**
 * HOTP: An HMAC-based One-time Password Algorithm.
 * @see [RFC 4226](https://datatracker.ietf.org/doc/html/rfc4226)
 */ class HOTP {
    /**
   * Default configuration.
   * @type {{
   *   issuer: string,
   *   label: string,
   *   issuerInLabel: boolean,
   *   algorithm: string,
   *   digits: number,
   *   counter: number
   *   window: number
   * }}
   */ static get defaults() {
        return {
            issuer: "",
            label: "OTPAuth",
            issuerInLabel: true,
            algorithm: "SHA1",
            digits: 6,
            counter: 0,
            window: 1
        };
    }
    /**
   * Generates an HOTP token.
   * @param {Object} config Configuration options.
   * @param {Secret} config.secret Secret key.
   * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
   * @param {number} [config.digits=6] Token length.
   * @param {number} [config.counter=0] Counter value.
   * @returns {string} Token.
   */ static generate({ secret, algorithm = HOTP.defaults.algorithm, digits = HOTP.defaults.digits, counter = HOTP.defaults.counter }) {
        const digest = hmacDigest(algorithm, secret.bytes, uintDecode(counter));
        const offset = digest[digest.byteLength - 1] & 15;
        const otp = ((digest[offset] & 127) << 24 | (digest[offset + 1] & 255) << 16 | (digest[offset + 2] & 255) << 8 | digest[offset + 3] & 255) % 10 ** digits;
        return otp.toString().padStart(digits, "0");
    }
    /**
   * Generates an HOTP token.
   * @param {Object} [config] Configuration options.
   * @param {number} [config.counter=this.counter++] Counter value.
   * @returns {string} Token.
   */ generate({ counter = this.counter++ } = {}) {
        return HOTP.generate({
            secret: this.secret,
            algorithm: this.algorithm,
            digits: this.digits,
            counter
        });
    }
    /**
   * Validates an HOTP token.
   * @param {Object} config Configuration options.
   * @param {string} config.token Token value.
   * @param {Secret} config.secret Secret key.
   * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
   * @param {number} [config.digits=6] Token length.
   * @param {number} [config.counter=0] Counter value.
   * @param {number} [config.window=1] Window of counter values to test.
   * @returns {number|null} Token delta or null if it is not found in the search window, in which case it should be considered invalid.
   */ static validate({ token, secret, algorithm, digits = HOTP.defaults.digits, counter = HOTP.defaults.counter, window = HOTP.defaults.window }) {
        // Return early if the token length does not match the digit number.
        if (token.length !== digits) return null;
        let delta = null;
        const check = (/** @type {number} */ i)=>{
            const generatedToken = HOTP.generate({
                secret,
                algorithm,
                digits,
                counter: i
            });
            if (timingSafeEqual(token, generatedToken)) {
                delta = i - counter;
            }
        };
        check(counter);
        for(let i = 1; i <= window && delta === null; ++i){
            check(counter - i);
            if (delta !== null) break;
            check(counter + i);
            if (delta !== null) break;
        }
        return delta;
    }
    /**
   * Validates an HOTP token.
   * @param {Object} config Configuration options.
   * @param {string} config.token Token value.
   * @param {number} [config.counter=this.counter] Counter value.
   * @param {number} [config.window=1] Window of counter values to test.
   * @returns {number|null} Token delta or null if it is not found in the search window, in which case it should be considered invalid.
   */ validate({ token, counter = this.counter, window }) {
        return HOTP.validate({
            token,
            secret: this.secret,
            algorithm: this.algorithm,
            digits: this.digits,
            counter,
            window
        });
    }
    /**
   * Returns a Google Authenticator key URI.
   * @returns {string} URI.
   */ toString() {
        const e = encodeURIComponent;
        return "otpauth://hotp/" + `${this.issuer.length > 0 ? this.issuerInLabel ? `${e(this.issuer)}:${e(this.label)}?issuer=${e(this.issuer)}&` : `${e(this.label)}?issuer=${e(this.issuer)}&` : `${e(this.label)}?`}` + `secret=${e(this.secret.base32)}&` + `algorithm=${e(this.algorithm)}&` + `digits=${e(this.digits)}&` + `counter=${e(this.counter)}`;
    }
    /**
   * Creates an HOTP object.
   * @param {Object} [config] Configuration options.
   * @param {string} [config.issuer=''] Account provider.
   * @param {string} [config.label='OTPAuth'] Account label.
   * @param {boolean} [config.issuerInLabel=true] Include issuer prefix in label.
   * @param {Secret|string} [config.secret=Secret] Secret key.
   * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
   * @param {number} [config.digits=6] Token length.
   * @param {number} [config.counter=0] Initial counter value.
   */ constructor({ issuer = HOTP.defaults.issuer, label = HOTP.defaults.label, issuerInLabel = HOTP.defaults.issuerInLabel, secret = new Secret(), algorithm = HOTP.defaults.algorithm, digits = HOTP.defaults.digits, counter = HOTP.defaults.counter } = {}){
        /**
     * Account provider.
     * @type {string}
     */ this.issuer = issuer;
        /**
     * Account label.
     * @type {string}
     */ this.label = label;
        /**
     * Include issuer prefix in label.
     * @type {boolean}
     */ this.issuerInLabel = issuerInLabel;
        /**
     * Secret key.
     * @type {Secret}
     */ this.secret = typeof secret === "string" ? Secret.fromBase32(secret) : secret;
        /**
     * HMAC hashing algorithm.
     * @type {string}
     */ this.algorithm = canonicalizeAlgorithm(algorithm);
        /**
     * Token length.
     * @type {number}
     */ this.digits = digits;
        /**
     * Initial counter value.
     * @type {number}
     */ this.counter = counter;
    }
}

/**
 * TOTP: Time-Based One-Time Password Algorithm.
 * @see [RFC 6238](https://datatracker.ietf.org/doc/html/rfc6238)
 */ class TOTP {
    /**
   * Default configuration.
   * @type {{
   *   issuer: string,
   *   label: string,
   *   issuerInLabel: boolean,
   *   algorithm: string,
   *   digits: number,
   *   period: number
   *   window: number
   * }}
   */ static get defaults() {
        return {
            issuer: "",
            label: "OTPAuth",
            issuerInLabel: true,
            algorithm: "SHA1",
            digits: 6,
            period: 30,
            window: 1
        };
    }
    /**
   * Calculates the counter. i.e. the number of periods since timestamp 0.
   * @param {Object} [config] Configuration options.
   * @param {number} [config.period=30] Token time-step duration.
   * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
   * @returns {number} Counter.
   */ static counter({ period = TOTP.defaults.period, timestamp = Date.now() } = {}) {
        return Math.floor(timestamp / 1000 / period);
    }
    /**
   * Calculates the counter. i.e. the number of periods since timestamp 0.
   * @param {Object} [config] Configuration options.
   * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
   * @returns {number} Counter.
   */ counter({ timestamp = Date.now() } = {}) {
        return TOTP.counter({
            period: this.period,
            timestamp
        });
    }
    /**
   * Calculates the remaining time in milliseconds until the next token is generated.
   * @param {Object} [config] Configuration options.
   * @param {number} [config.period=30] Token time-step duration.
   * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
   * @returns {number} counter.
   */ static remaining({ period = TOTP.defaults.period, timestamp = Date.now() } = {}) {
        return period * 1000 - timestamp % (period * 1000);
    }
    /**
   * Calculates the remaining time in milliseconds until the next token is generated.
   * @param {Object} [config] Configuration options.
   * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
   * @returns {number} counter.
   */ remaining({ timestamp = Date.now() } = {}) {
        return TOTP.remaining({
            period: this.period,
            timestamp
        });
    }
    /**
   * Generates a TOTP token.
   * @param {Object} config Configuration options.
   * @param {Secret} config.secret Secret key.
   * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
   * @param {number} [config.digits=6] Token length.
   * @param {number} [config.period=30] Token time-step duration.
   * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
   * @returns {string} Token.
   */ static generate({ secret, algorithm, digits, period = TOTP.defaults.period, timestamp = Date.now() }) {
        return HOTP.generate({
            secret,
            algorithm,
            digits,
            counter: TOTP.counter({
                period,
                timestamp
            })
        });
    }
    /**
   * Generates a TOTP token.
   * @param {Object} [config] Configuration options.
   * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
   * @returns {string} Token.
   */ generate({ timestamp = Date.now() } = {}) {
        return TOTP.generate({
            secret: this.secret,
            algorithm: this.algorithm,
            digits: this.digits,
            period: this.period,
            timestamp
        });
    }
    /**
   * Validates a TOTP token.
   * @param {Object} config Configuration options.
   * @param {string} config.token Token value.
   * @param {Secret} config.secret Secret key.
   * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
   * @param {number} [config.digits=6] Token length.
   * @param {number} [config.period=30] Token time-step duration.
   * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
   * @param {number} [config.window=1] Window of counter values to test.
   * @returns {number|null} Token delta or null if it is not found in the search window, in which case it should be considered invalid.
   */ static validate({ token, secret, algorithm, digits, period = TOTP.defaults.period, timestamp = Date.now(), window }) {
        return HOTP.validate({
            token,
            secret,
            algorithm,
            digits,
            counter: TOTP.counter({
                period,
                timestamp
            }),
            window
        });
    }
    /**
   * Validates a TOTP token.
   * @param {Object} config Configuration options.
   * @param {string} config.token Token value.
   * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
   * @param {number} [config.window=1] Window of counter values to test.
   * @returns {number|null} Token delta or null if it is not found in the search window, in which case it should be considered invalid.
   */ validate({ token, timestamp, window }) {
        return TOTP.validate({
            token,
            secret: this.secret,
            algorithm: this.algorithm,
            digits: this.digits,
            period: this.period,
            timestamp,
            window
        });
    }
    /**
   * Returns a Google Authenticator key URI.
   * @returns {string} URI.
   */ toString() {
        const e = encodeURIComponent;
        return "otpauth://totp/" + `${this.issuer.length > 0 ? this.issuerInLabel ? `${e(this.issuer)}:${e(this.label)}?issuer=${e(this.issuer)}&` : `${e(this.label)}?issuer=${e(this.issuer)}&` : `${e(this.label)}?`}` + `secret=${e(this.secret.base32)}&` + `algorithm=${e(this.algorithm)}&` + `digits=${e(this.digits)}&` + `period=${e(this.period)}`;
    }
    /**
   * Creates a TOTP object.
   * @param {Object} [config] Configuration options.
   * @param {string} [config.issuer=''] Account provider.
   * @param {string} [config.label='OTPAuth'] Account label.
   * @param {boolean} [config.issuerInLabel=true] Include issuer prefix in label.
   * @param {Secret|string} [config.secret=Secret] Secret key.
   * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
   * @param {number} [config.digits=6] Token length.
   * @param {number} [config.period=30] Token time-step duration.
   */ constructor({ issuer = TOTP.defaults.issuer, label = TOTP.defaults.label, issuerInLabel = TOTP.defaults.issuerInLabel, secret = new Secret(), algorithm = TOTP.defaults.algorithm, digits = TOTP.defaults.digits, period = TOTP.defaults.period } = {}){
        /**
     * Account provider.
     * @type {string}
     */ this.issuer = issuer;
        /**
     * Account label.
     * @type {string}
     */ this.label = label;
        /**
     * Include issuer prefix in label.
     * @type {boolean}
     */ this.issuerInLabel = issuerInLabel;
        /**
     * Secret key.
     * @type {Secret}
     */ this.secret = typeof secret === "string" ? Secret.fromBase32(secret) : secret;
        /**
     * HMAC hashing algorithm.
     * @type {string}
     */ this.algorithm = canonicalizeAlgorithm(algorithm);
        /**
     * Token length.
     * @type {number}
     */ this.digits = digits;
        /**
     * Token time-step duration.
     * @type {number}
     */ this.period = period;
    }
}

var browser = {};

// can-promise has a crash in some versions of react native that dont have
// standard global objects
// https://github.com/soldair/node-qrcode/issues/157

var canPromise$1 = function () {
  return typeof Promise === 'function' && Promise.prototype && Promise.prototype.then
};

var qrcode = {};

var utils$1 = {};

let toSJISFunction;
const CODEWORDS_COUNT = [
  0, // Not used
  26, 44, 70, 100, 134, 172, 196, 242, 292, 346,
  404, 466, 532, 581, 655, 733, 815, 901, 991, 1085,
  1156, 1258, 1364, 1474, 1588, 1706, 1828, 1921, 2051, 2185,
  2323, 2465, 2611, 2761, 2876, 3034, 3196, 3362, 3532, 3706
];

/**
 * Returns the QR Code size for the specified version
 *
 * @param  {Number} version QR Code version
 * @return {Number}         size of QR code
 */
utils$1.getSymbolSize = function getSymbolSize (version) {
  if (!version) throw new Error('"version" cannot be null or undefined')
  if (version < 1 || version > 40) throw new Error('"version" should be in range from 1 to 40')
  return version * 4 + 17
};

/**
 * Returns the total number of codewords used to store data and EC information.
 *
 * @param  {Number} version QR Code version
 * @return {Number}         Data length in bits
 */
utils$1.getSymbolTotalCodewords = function getSymbolTotalCodewords (version) {
  return CODEWORDS_COUNT[version]
};

/**
 * Encode data with Bose-Chaudhuri-Hocquenghem
 *
 * @param  {Number} data Value to encode
 * @return {Number}      Encoded value
 */
utils$1.getBCHDigit = function (data) {
  let digit = 0;

  while (data !== 0) {
    digit++;
    data >>>= 1;
  }

  return digit
};

utils$1.setToSJISFunction = function setToSJISFunction (f) {
  if (typeof f !== 'function') {
    throw new Error('"toSJISFunc" is not a valid function.')
  }

  toSJISFunction = f;
};

utils$1.isKanjiModeEnabled = function () {
  return typeof toSJISFunction !== 'undefined'
};

utils$1.toSJIS = function toSJIS (kanji) {
  return toSJISFunction(kanji)
};

var errorCorrectionLevel = {};

(function (exports) {
	exports.L = { bit: 1 };
	exports.M = { bit: 0 };
	exports.Q = { bit: 3 };
	exports.H = { bit: 2 };

	function fromString (string) {
	  if (typeof string !== 'string') {
	    throw new Error('Param is not a string')
	  }

	  const lcStr = string.toLowerCase();

	  switch (lcStr) {
	    case 'l':
	    case 'low':
	      return exports.L

	    case 'm':
	    case 'medium':
	      return exports.M

	    case 'q':
	    case 'quartile':
	      return exports.Q

	    case 'h':
	    case 'high':
	      return exports.H

	    default:
	      throw new Error('Unknown EC Level: ' + string)
	  }
	}

	exports.isValid = function isValid (level) {
	  return level && typeof level.bit !== 'undefined' &&
	    level.bit >= 0 && level.bit < 4
	};

	exports.from = function from (value, defaultValue) {
	  if (exports.isValid(value)) {
	    return value
	  }

	  try {
	    return fromString(value)
	  } catch (e) {
	    return defaultValue
	  }
	}; 
} (errorCorrectionLevel));

function BitBuffer$1 () {
  this.buffer = [];
  this.length = 0;
}

BitBuffer$1.prototype = {

  get: function (index) {
    const bufIndex = Math.floor(index / 8);
    return ((this.buffer[bufIndex] >>> (7 - index % 8)) & 1) === 1
  },

  put: function (num, length) {
    for (let i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    }
  },

  getLengthInBits: function () {
    return this.length
  },

  putBit: function (bit) {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) {
      this.buffer.push(0);
    }

    if (bit) {
      this.buffer[bufIndex] |= (0x80 >>> (this.length % 8));
    }

    this.length++;
  }
};

var bitBuffer = BitBuffer$1;

/**
 * Helper class to handle QR Code symbol modules
 *
 * @param {Number} size Symbol size
 */

function BitMatrix$1 (size) {
  if (!size || size < 1) {
    throw new Error('BitMatrix size must be defined and greater than 0')
  }

  this.size = size;
  this.data = new Uint8Array(size * size);
  this.reservedBit = new Uint8Array(size * size);
}

/**
 * Set bit value at specified location
 * If reserved flag is set, this bit will be ignored during masking process
 *
 * @param {Number}  row
 * @param {Number}  col
 * @param {Boolean} value
 * @param {Boolean} reserved
 */
BitMatrix$1.prototype.set = function (row, col, value, reserved) {
  const index = row * this.size + col;
  this.data[index] = value;
  if (reserved) this.reservedBit[index] = true;
};

/**
 * Returns bit value at specified location
 *
 * @param  {Number}  row
 * @param  {Number}  col
 * @return {Boolean}
 */
BitMatrix$1.prototype.get = function (row, col) {
  return this.data[row * this.size + col]
};

/**
 * Applies xor operator at specified location
 * (used during masking process)
 *
 * @param {Number}  row
 * @param {Number}  col
 * @param {Boolean} value
 */
BitMatrix$1.prototype.xor = function (row, col, value) {
  this.data[row * this.size + col] ^= value;
};

/**
 * Check if bit at specified location is reserved
 *
 * @param {Number}   row
 * @param {Number}   col
 * @return {Boolean}
 */
BitMatrix$1.prototype.isReserved = function (row, col) {
  return this.reservedBit[row * this.size + col]
};

var bitMatrix = BitMatrix$1;

var alignmentPattern = {};

/**
 * Alignment pattern are fixed reference pattern in defined positions
 * in a matrix symbology, which enables the decode software to re-synchronise
 * the coordinate mapping of the image modules in the event of moderate amounts
 * of distortion of the image.
 *
 * Alignment patterns are present only in QR Code symbols of version 2 or larger
 * and their number depends on the symbol version.
 */

(function (exports) {
	const getSymbolSize = utils$1.getSymbolSize;

	/**
	 * Calculate the row/column coordinates of the center module of each alignment pattern
	 * for the specified QR Code version.
	 *
	 * The alignment patterns are positioned symmetrically on either side of the diagonal
	 * running from the top left corner of the symbol to the bottom right corner.
	 *
	 * Since positions are simmetrical only half of the coordinates are returned.
	 * Each item of the array will represent in turn the x and y coordinate.
	 * @see {@link getPositions}
	 *
	 * @param  {Number} version QR Code version
	 * @return {Array}          Array of coordinate
	 */
	exports.getRowColCoords = function getRowColCoords (version) {
	  if (version === 1) return []

	  const posCount = Math.floor(version / 7) + 2;
	  const size = getSymbolSize(version);
	  const intervals = size === 145 ? 26 : Math.ceil((size - 13) / (2 * posCount - 2)) * 2;
	  const positions = [size - 7]; // Last coord is always (size - 7)

	  for (let i = 1; i < posCount - 1; i++) {
	    positions[i] = positions[i - 1] - intervals;
	  }

	  positions.push(6); // First coord is always 6

	  return positions.reverse()
	};

	/**
	 * Returns an array containing the positions of each alignment pattern.
	 * Each array's element represent the center point of the pattern as (x, y) coordinates
	 *
	 * Coordinates are calculated expanding the row/column coordinates returned by {@link getRowColCoords}
	 * and filtering out the items that overlaps with finder pattern
	 *
	 * @example
	 * For a Version 7 symbol {@link getRowColCoords} returns values 6, 22 and 38.
	 * The alignment patterns, therefore, are to be centered on (row, column)
	 * positions (6,22), (22,6), (22,22), (22,38), (38,22), (38,38).
	 * Note that the coordinates (6,6), (6,38), (38,6) are occupied by finder patterns
	 * and are not therefore used for alignment patterns.
	 *
	 * let pos = getPositions(7)
	 * // [[6,22], [22,6], [22,22], [22,38], [38,22], [38,38]]
	 *
	 * @param  {Number} version QR Code version
	 * @return {Array}          Array of coordinates
	 */
	exports.getPositions = function getPositions (version) {
	  const coords = [];
	  const pos = exports.getRowColCoords(version);
	  const posLength = pos.length;

	  for (let i = 0; i < posLength; i++) {
	    for (let j = 0; j < posLength; j++) {
	      // Skip if position is occupied by finder patterns
	      if ((i === 0 && j === 0) || // top-left
	          (i === 0 && j === posLength - 1) || // bottom-left
	          (i === posLength - 1 && j === 0)) { // top-right
	        continue
	      }

	      coords.push([pos[i], pos[j]]);
	    }
	  }

	  return coords
	}; 
} (alignmentPattern));

var finderPattern = {};

const getSymbolSize = utils$1.getSymbolSize;
const FINDER_PATTERN_SIZE = 7;

/**
 * Returns an array containing the positions of each finder pattern.
 * Each array's element represent the top-left point of the pattern as (x, y) coordinates
 *
 * @param  {Number} version QR Code version
 * @return {Array}          Array of coordinates
 */
finderPattern.getPositions = function getPositions (version) {
  const size = getSymbolSize(version);

  return [
    // top-left
    [0, 0],
    // top-right
    [size - FINDER_PATTERN_SIZE, 0],
    // bottom-left
    [0, size - FINDER_PATTERN_SIZE]
  ]
};

var maskPattern = {};

/**
 * Data mask pattern reference
 * @type {Object}
 */

(function (exports) {
	exports.Patterns = {
	  PATTERN000: 0,
	  PATTERN001: 1,
	  PATTERN010: 2,
	  PATTERN011: 3,
	  PATTERN100: 4,
	  PATTERN101: 5,
	  PATTERN110: 6,
	  PATTERN111: 7
	};

	/**
	 * Weighted penalty scores for the undesirable features
	 * @type {Object}
	 */
	const PenaltyScores = {
	  N1: 3,
	  N2: 3,
	  N3: 40,
	  N4: 10
	};

	/**
	 * Check if mask pattern value is valid
	 *
	 * @param  {Number}  mask    Mask pattern
	 * @return {Boolean}         true if valid, false otherwise
	 */
	exports.isValid = function isValid (mask) {
	  return mask != null && mask !== '' && !isNaN(mask) && mask >= 0 && mask <= 7
	};

	/**
	 * Returns mask pattern from a value.
	 * If value is not valid, returns undefined
	 *
	 * @param  {Number|String} value        Mask pattern value
	 * @return {Number}                     Valid mask pattern or undefined
	 */
	exports.from = function from (value) {
	  return exports.isValid(value) ? parseInt(value, 10) : undefined
	};

	/**
	* Find adjacent modules in row/column with the same color
	* and assign a penalty value.
	*
	* Points: N1 + i
	* i is the amount by which the number of adjacent modules of the same color exceeds 5
	*/
	exports.getPenaltyN1 = function getPenaltyN1 (data) {
	  const size = data.size;
	  let points = 0;
	  let sameCountCol = 0;
	  let sameCountRow = 0;
	  let lastCol = null;
	  let lastRow = null;

	  for (let row = 0; row < size; row++) {
	    sameCountCol = sameCountRow = 0;
	    lastCol = lastRow = null;

	    for (let col = 0; col < size; col++) {
	      let module = data.get(row, col);
	      if (module === lastCol) {
	        sameCountCol++;
	      } else {
	        if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
	        lastCol = module;
	        sameCountCol = 1;
	      }

	      module = data.get(col, row);
	      if (module === lastRow) {
	        sameCountRow++;
	      } else {
	        if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
	        lastRow = module;
	        sameCountRow = 1;
	      }
	    }

	    if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
	    if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
	  }

	  return points
	};

	/**
	 * Find 2x2 blocks with the same color and assign a penalty value
	 *
	 * Points: N2 * (m - 1) * (n - 1)
	 */
	exports.getPenaltyN2 = function getPenaltyN2 (data) {
	  const size = data.size;
	  let points = 0;

	  for (let row = 0; row < size - 1; row++) {
	    for (let col = 0; col < size - 1; col++) {
	      const last = data.get(row, col) +
	        data.get(row, col + 1) +
	        data.get(row + 1, col) +
	        data.get(row + 1, col + 1);

	      if (last === 4 || last === 0) points++;
	    }
	  }

	  return points * PenaltyScores.N2
	};

	/**
	 * Find 1:1:3:1:1 ratio (dark:light:dark:light:dark) pattern in row/column,
	 * preceded or followed by light area 4 modules wide
	 *
	 * Points: N3 * number of pattern found
	 */
	exports.getPenaltyN3 = function getPenaltyN3 (data) {
	  const size = data.size;
	  let points = 0;
	  let bitsCol = 0;
	  let bitsRow = 0;

	  for (let row = 0; row < size; row++) {
	    bitsCol = bitsRow = 0;
	    for (let col = 0; col < size; col++) {
	      bitsCol = ((bitsCol << 1) & 0x7FF) | data.get(row, col);
	      if (col >= 10 && (bitsCol === 0x5D0 || bitsCol === 0x05D)) points++;

	      bitsRow = ((bitsRow << 1) & 0x7FF) | data.get(col, row);
	      if (col >= 10 && (bitsRow === 0x5D0 || bitsRow === 0x05D)) points++;
	    }
	  }

	  return points * PenaltyScores.N3
	};

	/**
	 * Calculate proportion of dark modules in entire symbol
	 *
	 * Points: N4 * k
	 *
	 * k is the rating of the deviation of the proportion of dark modules
	 * in the symbol from 50% in steps of 5%
	 */
	exports.getPenaltyN4 = function getPenaltyN4 (data) {
	  let darkCount = 0;
	  const modulesCount = data.data.length;

	  for (let i = 0; i < modulesCount; i++) darkCount += data.data[i];

	  const k = Math.abs(Math.ceil((darkCount * 100 / modulesCount) / 5) - 10);

	  return k * PenaltyScores.N4
	};

	/**
	 * Return mask value at given position
	 *
	 * @param  {Number} maskPattern Pattern reference value
	 * @param  {Number} i           Row
	 * @param  {Number} j           Column
	 * @return {Boolean}            Mask value
	 */
	function getMaskAt (maskPattern, i, j) {
	  switch (maskPattern) {
	    case exports.Patterns.PATTERN000: return (i + j) % 2 === 0
	    case exports.Patterns.PATTERN001: return i % 2 === 0
	    case exports.Patterns.PATTERN010: return j % 3 === 0
	    case exports.Patterns.PATTERN011: return (i + j) % 3 === 0
	    case exports.Patterns.PATTERN100: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0
	    case exports.Patterns.PATTERN101: return (i * j) % 2 + (i * j) % 3 === 0
	    case exports.Patterns.PATTERN110: return ((i * j) % 2 + (i * j) % 3) % 2 === 0
	    case exports.Patterns.PATTERN111: return ((i * j) % 3 + (i + j) % 2) % 2 === 0

	    default: throw new Error('bad maskPattern:' + maskPattern)
	  }
	}

	/**
	 * Apply a mask pattern to a BitMatrix
	 *
	 * @param  {Number}    pattern Pattern reference number
	 * @param  {BitMatrix} data    BitMatrix data
	 */
	exports.applyMask = function applyMask (pattern, data) {
	  const size = data.size;

	  for (let col = 0; col < size; col++) {
	    for (let row = 0; row < size; row++) {
	      if (data.isReserved(row, col)) continue
	      data.xor(row, col, getMaskAt(pattern, row, col));
	    }
	  }
	};

	/**
	 * Returns the best mask pattern for data
	 *
	 * @param  {BitMatrix} data
	 * @return {Number} Mask pattern reference number
	 */
	exports.getBestMask = function getBestMask (data, setupFormatFunc) {
	  const numPatterns = Object.keys(exports.Patterns).length;
	  let bestPattern = 0;
	  let lowerPenalty = Infinity;

	  for (let p = 0; p < numPatterns; p++) {
	    setupFormatFunc(p);
	    exports.applyMask(p, data);

	    // Calculate penalty
	    const penalty =
	      exports.getPenaltyN1(data) +
	      exports.getPenaltyN2(data) +
	      exports.getPenaltyN3(data) +
	      exports.getPenaltyN4(data);

	    // Undo previously applied mask
	    exports.applyMask(p, data);

	    if (penalty < lowerPenalty) {
	      lowerPenalty = penalty;
	      bestPattern = p;
	    }
	  }

	  return bestPattern
	}; 
} (maskPattern));

var errorCorrectionCode = {};

const ECLevel$1 = errorCorrectionLevel;

const EC_BLOCKS_TABLE = [
// L  M  Q  H
  1, 1, 1, 1,
  1, 1, 1, 1,
  1, 1, 2, 2,
  1, 2, 2, 4,
  1, 2, 4, 4,
  2, 4, 4, 4,
  2, 4, 6, 5,
  2, 4, 6, 6,
  2, 5, 8, 8,
  4, 5, 8, 8,
  4, 5, 8, 11,
  4, 8, 10, 11,
  4, 9, 12, 16,
  4, 9, 16, 16,
  6, 10, 12, 18,
  6, 10, 17, 16,
  6, 11, 16, 19,
  6, 13, 18, 21,
  7, 14, 21, 25,
  8, 16, 20, 25,
  8, 17, 23, 25,
  9, 17, 23, 34,
  9, 18, 25, 30,
  10, 20, 27, 32,
  12, 21, 29, 35,
  12, 23, 34, 37,
  12, 25, 34, 40,
  13, 26, 35, 42,
  14, 28, 38, 45,
  15, 29, 40, 48,
  16, 31, 43, 51,
  17, 33, 45, 54,
  18, 35, 48, 57,
  19, 37, 51, 60,
  19, 38, 53, 63,
  20, 40, 56, 66,
  21, 43, 59, 70,
  22, 45, 62, 74,
  24, 47, 65, 77,
  25, 49, 68, 81
];

const EC_CODEWORDS_TABLE = [
// L  M  Q  H
  7, 10, 13, 17,
  10, 16, 22, 28,
  15, 26, 36, 44,
  20, 36, 52, 64,
  26, 48, 72, 88,
  36, 64, 96, 112,
  40, 72, 108, 130,
  48, 88, 132, 156,
  60, 110, 160, 192,
  72, 130, 192, 224,
  80, 150, 224, 264,
  96, 176, 260, 308,
  104, 198, 288, 352,
  120, 216, 320, 384,
  132, 240, 360, 432,
  144, 280, 408, 480,
  168, 308, 448, 532,
  180, 338, 504, 588,
  196, 364, 546, 650,
  224, 416, 600, 700,
  224, 442, 644, 750,
  252, 476, 690, 816,
  270, 504, 750, 900,
  300, 560, 810, 960,
  312, 588, 870, 1050,
  336, 644, 952, 1110,
  360, 700, 1020, 1200,
  390, 728, 1050, 1260,
  420, 784, 1140, 1350,
  450, 812, 1200, 1440,
  480, 868, 1290, 1530,
  510, 924, 1350, 1620,
  540, 980, 1440, 1710,
  570, 1036, 1530, 1800,
  570, 1064, 1590, 1890,
  600, 1120, 1680, 1980,
  630, 1204, 1770, 2100,
  660, 1260, 1860, 2220,
  720, 1316, 1950, 2310,
  750, 1372, 2040, 2430
];

/**
 * Returns the number of error correction block that the QR Code should contain
 * for the specified version and error correction level.
 *
 * @param  {Number} version              QR Code version
 * @param  {Number} errorCorrectionLevel Error correction level
 * @return {Number}                      Number of error correction blocks
 */
errorCorrectionCode.getBlocksCount = function getBlocksCount (version, errorCorrectionLevel) {
  switch (errorCorrectionLevel) {
    case ECLevel$1.L:
      return EC_BLOCKS_TABLE[(version - 1) * 4 + 0]
    case ECLevel$1.M:
      return EC_BLOCKS_TABLE[(version - 1) * 4 + 1]
    case ECLevel$1.Q:
      return EC_BLOCKS_TABLE[(version - 1) * 4 + 2]
    case ECLevel$1.H:
      return EC_BLOCKS_TABLE[(version - 1) * 4 + 3]
    default:
      return undefined
  }
};

/**
 * Returns the number of error correction codewords to use for the specified
 * version and error correction level.
 *
 * @param  {Number} version              QR Code version
 * @param  {Number} errorCorrectionLevel Error correction level
 * @return {Number}                      Number of error correction codewords
 */
errorCorrectionCode.getTotalCodewordsCount = function getTotalCodewordsCount (version, errorCorrectionLevel) {
  switch (errorCorrectionLevel) {
    case ECLevel$1.L:
      return EC_CODEWORDS_TABLE[(version - 1) * 4 + 0]
    case ECLevel$1.M:
      return EC_CODEWORDS_TABLE[(version - 1) * 4 + 1]
    case ECLevel$1.Q:
      return EC_CODEWORDS_TABLE[(version - 1) * 4 + 2]
    case ECLevel$1.H:
      return EC_CODEWORDS_TABLE[(version - 1) * 4 + 3]
    default:
      return undefined
  }
};

var polynomial = {};

var galoisField = {};

const EXP_TABLE = new Uint8Array(512);
const LOG_TABLE = new Uint8Array(256)
/**
 * Precompute the log and anti-log tables for faster computation later
 *
 * For each possible value in the galois field 2^8, we will pre-compute
 * the logarithm and anti-logarithm (exponential) of this value
 *
 * ref {@link https://en.wikiversity.org/wiki/Reed%E2%80%93Solomon_codes_for_coders#Introduction_to_mathematical_fields}
 */
;(function initTables () {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    LOG_TABLE[x] = i;

    x <<= 1; // multiply by 2

    // The QR code specification says to use byte-wise modulo 100011101 arithmetic.
    // This means that when a number is 256 or larger, it should be XORed with 0x11D.
    if (x & 0x100) { // similar to x >= 256, but a lot faster (because 0x100 == 256)
      x ^= 0x11D;
    }
  }

  // Optimization: double the size of the anti-log table so that we don't need to mod 255 to
  // stay inside the bounds (because we will mainly use this table for the multiplication of
  // two GF numbers, no more).
  // @see {@link mul}
  for (let i = 255; i < 512; i++) {
    EXP_TABLE[i] = EXP_TABLE[i - 255];
  }
}());

/**
 * Returns log value of n inside Galois Field
 *
 * @param  {Number} n
 * @return {Number}
 */
galoisField.log = function log (n) {
  if (n < 1) throw new Error('log(' + n + ')')
  return LOG_TABLE[n]
};

/**
 * Returns anti-log value of n inside Galois Field
 *
 * @param  {Number} n
 * @return {Number}
 */
galoisField.exp = function exp (n) {
  return EXP_TABLE[n]
};

/**
 * Multiplies two number inside Galois Field
 *
 * @param  {Number} x
 * @param  {Number} y
 * @return {Number}
 */
galoisField.mul = function mul (x, y) {
  if (x === 0 || y === 0) return 0

  // should be EXP_TABLE[(LOG_TABLE[x] + LOG_TABLE[y]) % 255] if EXP_TABLE wasn't oversized
  // @see {@link initTables}
  return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]]
};

(function (exports) {
	const GF = galoisField;

	/**
	 * Multiplies two polynomials inside Galois Field
	 *
	 * @param  {Uint8Array} p1 Polynomial
	 * @param  {Uint8Array} p2 Polynomial
	 * @return {Uint8Array}    Product of p1 and p2
	 */
	exports.mul = function mul (p1, p2) {
	  const coeff = new Uint8Array(p1.length + p2.length - 1);

	  for (let i = 0; i < p1.length; i++) {
	    for (let j = 0; j < p2.length; j++) {
	      coeff[i + j] ^= GF.mul(p1[i], p2[j]);
	    }
	  }

	  return coeff
	};

	/**
	 * Calculate the remainder of polynomials division
	 *
	 * @param  {Uint8Array} divident Polynomial
	 * @param  {Uint8Array} divisor  Polynomial
	 * @return {Uint8Array}          Remainder
	 */
	exports.mod = function mod (divident, divisor) {
	  let result = new Uint8Array(divident);

	  while ((result.length - divisor.length) >= 0) {
	    const coeff = result[0];

	    for (let i = 0; i < divisor.length; i++) {
	      result[i] ^= GF.mul(divisor[i], coeff);
	    }

	    // remove all zeros from buffer head
	    let offset = 0;
	    while (offset < result.length && result[offset] === 0) offset++;
	    result = result.slice(offset);
	  }

	  return result
	};

	/**
	 * Generate an irreducible generator polynomial of specified degree
	 * (used by Reed-Solomon encoder)
	 *
	 * @param  {Number} degree Degree of the generator polynomial
	 * @return {Uint8Array}    Buffer containing polynomial coefficients
	 */
	exports.generateECPolynomial = function generateECPolynomial (degree) {
	  let poly = new Uint8Array([1]);
	  for (let i = 0; i < degree; i++) {
	    poly = exports.mul(poly, new Uint8Array([1, GF.exp(i)]));
	  }

	  return poly
	}; 
} (polynomial));

const Polynomial = polynomial;

function ReedSolomonEncoder$1 (degree) {
  this.genPoly = undefined;
  this.degree = degree;

  if (this.degree) this.initialize(this.degree);
}

/**
 * Initialize the encoder.
 * The input param should correspond to the number of error correction codewords.
 *
 * @param  {Number} degree
 */
ReedSolomonEncoder$1.prototype.initialize = function initialize (degree) {
  // create an irreducible generator polynomial
  this.degree = degree;
  this.genPoly = Polynomial.generateECPolynomial(this.degree);
};

/**
 * Encodes a chunk of data
 *
 * @param  {Uint8Array} data Buffer containing input data
 * @return {Uint8Array}      Buffer containing encoded data
 */
ReedSolomonEncoder$1.prototype.encode = function encode (data) {
  if (!this.genPoly) {
    throw new Error('Encoder not initialized')
  }

  // Calculate EC for this data block
  // extends data size to data+genPoly size
  const paddedData = new Uint8Array(data.length + this.degree);
  paddedData.set(data);

  // The error correction codewords are the remainder after dividing the data codewords
  // by a generator polynomial
  const remainder = Polynomial.mod(paddedData, this.genPoly);

  // return EC data blocks (last n byte, where n is the degree of genPoly)
  // If coefficients number in remainder are less than genPoly degree,
  // pad with 0s to the left to reach the needed number of coefficients
  const start = this.degree - remainder.length;
  if (start > 0) {
    const buff = new Uint8Array(this.degree);
    buff.set(remainder, start);

    return buff
  }

  return remainder
};

var reedSolomonEncoder = ReedSolomonEncoder$1;

var version = {};

var mode = {};

var versionCheck = {};

/**
 * Check if QR Code version is valid
 *
 * @param  {Number}  version QR Code version
 * @return {Boolean}         true if valid version, false otherwise
 */

versionCheck.isValid = function isValid (version) {
  return !isNaN(version) && version >= 1 && version <= 40
};

var regex = {};

const numeric = '[0-9]+';
const alphanumeric = '[A-Z $%*+\\-./:]+';
let kanji = '(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|' +
  '[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|' +
  '[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|' +
  '[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+';
kanji = kanji.replace(/u/g, '\\u');

const byte = '(?:(?![A-Z0-9 $%*+\\-./:]|' + kanji + ')(?:.|[\r\n]))+';

regex.KANJI = new RegExp(kanji, 'g');
regex.BYTE_KANJI = new RegExp('[^A-Z0-9 $%*+\\-./:]+', 'g');
regex.BYTE = new RegExp(byte, 'g');
regex.NUMERIC = new RegExp(numeric, 'g');
regex.ALPHANUMERIC = new RegExp(alphanumeric, 'g');

const TEST_KANJI = new RegExp('^' + kanji + '$');
const TEST_NUMERIC = new RegExp('^' + numeric + '$');
const TEST_ALPHANUMERIC = new RegExp('^[A-Z0-9 $%*+\\-./:]+$');

regex.testKanji = function testKanji (str) {
  return TEST_KANJI.test(str)
};

regex.testNumeric = function testNumeric (str) {
  return TEST_NUMERIC.test(str)
};

regex.testAlphanumeric = function testAlphanumeric (str) {
  return TEST_ALPHANUMERIC.test(str)
};

(function (exports) {
	const VersionCheck = versionCheck;
	const Regex = regex;

	/**
	 * Numeric mode encodes data from the decimal digit set (0 - 9)
	 * (byte values 30HEX to 39HEX).
	 * Normally, 3 data characters are represented by 10 bits.
	 *
	 * @type {Object}
	 */
	exports.NUMERIC = {
	  id: 'Numeric',
	  bit: 1 << 0,
	  ccBits: [10, 12, 14]
	};

	/**
	 * Alphanumeric mode encodes data from a set of 45 characters,
	 * i.e. 10 numeric digits (0 - 9),
	 *      26 alphabetic characters (A - Z),
	 *   and 9 symbols (SP, $, %, *, +, -, ., /, :).
	 * Normally, two input characters are represented by 11 bits.
	 *
	 * @type {Object}
	 */
	exports.ALPHANUMERIC = {
	  id: 'Alphanumeric',
	  bit: 1 << 1,
	  ccBits: [9, 11, 13]
	};

	/**
	 * In byte mode, data is encoded at 8 bits per character.
	 *
	 * @type {Object}
	 */
	exports.BYTE = {
	  id: 'Byte',
	  bit: 1 << 2,
	  ccBits: [8, 16, 16]
	};

	/**
	 * The Kanji mode efficiently encodes Kanji characters in accordance with
	 * the Shift JIS system based on JIS X 0208.
	 * The Shift JIS values are shifted from the JIS X 0208 values.
	 * JIS X 0208 gives details of the shift coded representation.
	 * Each two-byte character value is compacted to a 13-bit binary codeword.
	 *
	 * @type {Object}
	 */
	exports.KANJI = {
	  id: 'Kanji',
	  bit: 1 << 3,
	  ccBits: [8, 10, 12]
	};

	/**
	 * Mixed mode will contain a sequences of data in a combination of any of
	 * the modes described above
	 *
	 * @type {Object}
	 */
	exports.MIXED = {
	  bit: -1
	};

	/**
	 * Returns the number of bits needed to store the data length
	 * according to QR Code specifications.
	 *
	 * @param  {Mode}   mode    Data mode
	 * @param  {Number} version QR Code version
	 * @return {Number}         Number of bits
	 */
	exports.getCharCountIndicator = function getCharCountIndicator (mode, version) {
	  if (!mode.ccBits) throw new Error('Invalid mode: ' + mode)

	  if (!VersionCheck.isValid(version)) {
	    throw new Error('Invalid version: ' + version)
	  }

	  if (version >= 1 && version < 10) return mode.ccBits[0]
	  else if (version < 27) return mode.ccBits[1]
	  return mode.ccBits[2]
	};

	/**
	 * Returns the most efficient mode to store the specified data
	 *
	 * @param  {String} dataStr Input data string
	 * @return {Mode}           Best mode
	 */
	exports.getBestModeForData = function getBestModeForData (dataStr) {
	  if (Regex.testNumeric(dataStr)) return exports.NUMERIC
	  else if (Regex.testAlphanumeric(dataStr)) return exports.ALPHANUMERIC
	  else if (Regex.testKanji(dataStr)) return exports.KANJI
	  else return exports.BYTE
	};

	/**
	 * Return mode name as string
	 *
	 * @param {Mode} mode Mode object
	 * @returns {String}  Mode name
	 */
	exports.toString = function toString (mode) {
	  if (mode && mode.id) return mode.id
	  throw new Error('Invalid mode')
	};

	/**
	 * Check if input param is a valid mode object
	 *
	 * @param   {Mode}    mode Mode object
	 * @returns {Boolean} True if valid mode, false otherwise
	 */
	exports.isValid = function isValid (mode) {
	  return mode && mode.bit && mode.ccBits
	};

	/**
	 * Get mode object from its name
	 *
	 * @param   {String} string Mode name
	 * @returns {Mode}          Mode object
	 */
	function fromString (string) {
	  if (typeof string !== 'string') {
	    throw new Error('Param is not a string')
	  }

	  const lcStr = string.toLowerCase();

	  switch (lcStr) {
	    case 'numeric':
	      return exports.NUMERIC
	    case 'alphanumeric':
	      return exports.ALPHANUMERIC
	    case 'kanji':
	      return exports.KANJI
	    case 'byte':
	      return exports.BYTE
	    default:
	      throw new Error('Unknown mode: ' + string)
	  }
	}

	/**
	 * Returns mode from a value.
	 * If value is not a valid mode, returns defaultValue
	 *
	 * @param  {Mode|String} value        Encoding mode
	 * @param  {Mode}        defaultValue Fallback value
	 * @return {Mode}                     Encoding mode
	 */
	exports.from = function from (value, defaultValue) {
	  if (exports.isValid(value)) {
	    return value
	  }

	  try {
	    return fromString(value)
	  } catch (e) {
	    return defaultValue
	  }
	}; 
} (mode));

(function (exports) {
	const Utils = utils$1;
	const ECCode = errorCorrectionCode;
	const ECLevel = errorCorrectionLevel;
	const Mode = mode;
	const VersionCheck = versionCheck;

	// Generator polynomial used to encode version information
	const G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
	const G18_BCH = Utils.getBCHDigit(G18);

	function getBestVersionForDataLength (mode, length, errorCorrectionLevel) {
	  for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
	    if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, mode)) {
	      return currentVersion
	    }
	  }

	  return undefined
	}

	function getReservedBitsCount (mode, version) {
	  // Character count indicator + mode indicator bits
	  return Mode.getCharCountIndicator(mode, version) + 4
	}

	function getTotalBitsFromDataArray (segments, version) {
	  let totalBits = 0;

	  segments.forEach(function (data) {
	    const reservedBits = getReservedBitsCount(data.mode, version);
	    totalBits += reservedBits + data.getBitsLength();
	  });

	  return totalBits
	}

	function getBestVersionForMixedData (segments, errorCorrectionLevel) {
	  for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
	    const length = getTotalBitsFromDataArray(segments, currentVersion);
	    if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, Mode.MIXED)) {
	      return currentVersion
	    }
	  }

	  return undefined
	}

	/**
	 * Returns version number from a value.
	 * If value is not a valid version, returns defaultValue
	 *
	 * @param  {Number|String} value        QR Code version
	 * @param  {Number}        defaultValue Fallback value
	 * @return {Number}                     QR Code version number
	 */
	exports.from = function from (value, defaultValue) {
	  if (VersionCheck.isValid(value)) {
	    return parseInt(value, 10)
	  }

	  return defaultValue
	};

	/**
	 * Returns how much data can be stored with the specified QR code version
	 * and error correction level
	 *
	 * @param  {Number} version              QR Code version (1-40)
	 * @param  {Number} errorCorrectionLevel Error correction level
	 * @param  {Mode}   mode                 Data mode
	 * @return {Number}                      Quantity of storable data
	 */
	exports.getCapacity = function getCapacity (version, errorCorrectionLevel, mode) {
	  if (!VersionCheck.isValid(version)) {
	    throw new Error('Invalid QR Code version')
	  }

	  // Use Byte mode as default
	  if (typeof mode === 'undefined') mode = Mode.BYTE;

	  // Total codewords for this QR code version (Data + Error correction)
	  const totalCodewords = Utils.getSymbolTotalCodewords(version);

	  // Total number of error correction codewords
	  const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);

	  // Total number of data codewords
	  const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;

	  if (mode === Mode.MIXED) return dataTotalCodewordsBits

	  const usableBits = dataTotalCodewordsBits - getReservedBitsCount(mode, version);

	  // Return max number of storable codewords
	  switch (mode) {
	    case Mode.NUMERIC:
	      return Math.floor((usableBits / 10) * 3)

	    case Mode.ALPHANUMERIC:
	      return Math.floor((usableBits / 11) * 2)

	    case Mode.KANJI:
	      return Math.floor(usableBits / 13)

	    case Mode.BYTE:
	    default:
	      return Math.floor(usableBits / 8)
	  }
	};

	/**
	 * Returns the minimum version needed to contain the amount of data
	 *
	 * @param  {Segment} data                    Segment of data
	 * @param  {Number} [errorCorrectionLevel=H] Error correction level
	 * @param  {Mode} mode                       Data mode
	 * @return {Number}                          QR Code version
	 */
	exports.getBestVersionForData = function getBestVersionForData (data, errorCorrectionLevel) {
	  let seg;

	  const ecl = ECLevel.from(errorCorrectionLevel, ECLevel.M);

	  if (Array.isArray(data)) {
	    if (data.length > 1) {
	      return getBestVersionForMixedData(data, ecl)
	    }

	    if (data.length === 0) {
	      return 1
	    }

	    seg = data[0];
	  } else {
	    seg = data;
	  }

	  return getBestVersionForDataLength(seg.mode, seg.getLength(), ecl)
	};

	/**
	 * Returns version information with relative error correction bits
	 *
	 * The version information is included in QR Code symbols of version 7 or larger.
	 * It consists of an 18-bit sequence containing 6 data bits,
	 * with 12 error correction bits calculated using the (18, 6) Golay code.
	 *
	 * @param  {Number} version QR Code version
	 * @return {Number}         Encoded version info bits
	 */
	exports.getEncodedBits = function getEncodedBits (version) {
	  if (!VersionCheck.isValid(version) || version < 7) {
	    throw new Error('Invalid QR Code version')
	  }

	  let d = version << 12;

	  while (Utils.getBCHDigit(d) - G18_BCH >= 0) {
	    d ^= (G18 << (Utils.getBCHDigit(d) - G18_BCH));
	  }

	  return (version << 12) | d
	}; 
} (version));

var formatInfo = {};

const Utils$3 = utils$1;

const G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
const G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);
const G15_BCH = Utils$3.getBCHDigit(G15);

/**
 * Returns format information with relative error correction bits
 *
 * The format information is a 15-bit sequence containing 5 data bits,
 * with 10 error correction bits calculated using the (15, 5) BCH code.
 *
 * @param  {Number} errorCorrectionLevel Error correction level
 * @param  {Number} mask                 Mask pattern
 * @return {Number}                      Encoded format information bits
 */
formatInfo.getEncodedBits = function getEncodedBits (errorCorrectionLevel, mask) {
  const data = ((errorCorrectionLevel.bit << 3) | mask);
  let d = data << 10;

  while (Utils$3.getBCHDigit(d) - G15_BCH >= 0) {
    d ^= (G15 << (Utils$3.getBCHDigit(d) - G15_BCH));
  }

  // xor final data with mask pattern in order to ensure that
  // no combination of Error Correction Level and data mask pattern
  // will result in an all-zero data string
  return ((data << 10) | d) ^ G15_MASK
};

var segments = {};

const Mode$4 = mode;

function NumericData (data) {
  this.mode = Mode$4.NUMERIC;
  this.data = data.toString();
}

NumericData.getBitsLength = function getBitsLength (length) {
  return 10 * Math.floor(length / 3) + ((length % 3) ? ((length % 3) * 3 + 1) : 0)
};

NumericData.prototype.getLength = function getLength () {
  return this.data.length
};

NumericData.prototype.getBitsLength = function getBitsLength () {
  return NumericData.getBitsLength(this.data.length)
};

NumericData.prototype.write = function write (bitBuffer) {
  let i, group, value;

  // The input data string is divided into groups of three digits,
  // and each group is converted to its 10-bit binary equivalent.
  for (i = 0; i + 3 <= this.data.length; i += 3) {
    group = this.data.substr(i, 3);
    value = parseInt(group, 10);

    bitBuffer.put(value, 10);
  }

  // If the number of input digits is not an exact multiple of three,
  // the final one or two digits are converted to 4 or 7 bits respectively.
  const remainingNum = this.data.length - i;
  if (remainingNum > 0) {
    group = this.data.substr(i);
    value = parseInt(group, 10);

    bitBuffer.put(value, remainingNum * 3 + 1);
  }
};

var numericData = NumericData;

const Mode$3 = mode;

/**
 * Array of characters available in alphanumeric mode
 *
 * As per QR Code specification, to each character
 * is assigned a value from 0 to 44 which in this case coincides
 * with the array index
 *
 * @type {Array}
 */
const ALPHA_NUM_CHARS = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  ' ', '$', '%', '*', '+', '-', '.', '/', ':'
];

function AlphanumericData (data) {
  this.mode = Mode$3.ALPHANUMERIC;
  this.data = data;
}

AlphanumericData.getBitsLength = function getBitsLength (length) {
  return 11 * Math.floor(length / 2) + 6 * (length % 2)
};

AlphanumericData.prototype.getLength = function getLength () {
  return this.data.length
};

AlphanumericData.prototype.getBitsLength = function getBitsLength () {
  return AlphanumericData.getBitsLength(this.data.length)
};

AlphanumericData.prototype.write = function write (bitBuffer) {
  let i;

  // Input data characters are divided into groups of two characters
  // and encoded as 11-bit binary codes.
  for (i = 0; i + 2 <= this.data.length; i += 2) {
    // The character value of the first character is multiplied by 45
    let value = ALPHA_NUM_CHARS.indexOf(this.data[i]) * 45;

    // The character value of the second digit is added to the product
    value += ALPHA_NUM_CHARS.indexOf(this.data[i + 1]);

    // The sum is then stored as 11-bit binary number
    bitBuffer.put(value, 11);
  }

  // If the number of input data characters is not a multiple of two,
  // the character value of the final character is encoded as a 6-bit binary number.
  if (this.data.length % 2) {
    bitBuffer.put(ALPHA_NUM_CHARS.indexOf(this.data[i]), 6);
  }
};

var alphanumericData = AlphanumericData;

const Mode$2 = mode;

function ByteData (data) {
  this.mode = Mode$2.BYTE;
  if (typeof (data) === 'string') {
    this.data = new TextEncoder().encode(data);
  } else {
    this.data = new Uint8Array(data);
  }
}

ByteData.getBitsLength = function getBitsLength (length) {
  return length * 8
};

ByteData.prototype.getLength = function getLength () {
  return this.data.length
};

ByteData.prototype.getBitsLength = function getBitsLength () {
  return ByteData.getBitsLength(this.data.length)
};

ByteData.prototype.write = function (bitBuffer) {
  for (let i = 0, l = this.data.length; i < l; i++) {
    bitBuffer.put(this.data[i], 8);
  }
};

var byteData = ByteData;

const Mode$1 = mode;
const Utils$2 = utils$1;

function KanjiData (data) {
  this.mode = Mode$1.KANJI;
  this.data = data;
}

KanjiData.getBitsLength = function getBitsLength (length) {
  return length * 13
};

KanjiData.prototype.getLength = function getLength () {
  return this.data.length
};

KanjiData.prototype.getBitsLength = function getBitsLength () {
  return KanjiData.getBitsLength(this.data.length)
};

KanjiData.prototype.write = function (bitBuffer) {
  let i;

  // In the Shift JIS system, Kanji characters are represented by a two byte combination.
  // These byte values are shifted from the JIS X 0208 values.
  // JIS X 0208 gives details of the shift coded representation.
  for (i = 0; i < this.data.length; i++) {
    let value = Utils$2.toSJIS(this.data[i]);

    // For characters with Shift JIS values from 0x8140 to 0x9FFC:
    if (value >= 0x8140 && value <= 0x9FFC) {
      // Subtract 0x8140 from Shift JIS value
      value -= 0x8140;

    // For characters with Shift JIS values from 0xE040 to 0xEBBF
    } else if (value >= 0xE040 && value <= 0xEBBF) {
      // Subtract 0xC140 from Shift JIS value
      value -= 0xC140;
    } else {
      throw new Error(
        'Invalid SJIS character: ' + this.data[i] + '\n' +
        'Make sure your charset is UTF-8')
    }

    // Multiply most significant byte of result by 0xC0
    // and add least significant byte to product
    value = (((value >>> 8) & 0xff) * 0xC0) + (value & 0xff);

    // Convert result to a 13-bit binary string
    bitBuffer.put(value, 13);
  }
};

var kanjiData = KanjiData;

var dijkstra = {exports: {}};

(function (module) {

	/******************************************************************************
	 * Created 2008-08-19.
	 *
	 * Dijkstra path-finding functions. Adapted from the Dijkstar Python project.
	 *
	 * Copyright (C) 2008
	 *   Wyatt Baldwin <self@wyattbaldwin.com>
	 *   All rights reserved
	 *
	 * Licensed under the MIT license.
	 *
	 *   http://www.opensource.org/licenses/mit-license.php
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 *****************************************************************************/
	var dijkstra = {
	  single_source_shortest_paths: function(graph, s, d) {
	    // Predecessor map for each node that has been encountered.
	    // node ID => predecessor node ID
	    var predecessors = {};

	    // Costs of shortest paths from s to all nodes encountered.
	    // node ID => cost
	    var costs = {};
	    costs[s] = 0;

	    // Costs of shortest paths from s to all nodes encountered; differs from
	    // `costs` in that it provides easy access to the node that currently has
	    // the known shortest path from s.
	    // XXX: Do we actually need both `costs` and `open`?
	    var open = dijkstra.PriorityQueue.make();
	    open.push(s, 0);

	    var closest,
	        u, v,
	        cost_of_s_to_u,
	        adjacent_nodes,
	        cost_of_e,
	        cost_of_s_to_u_plus_cost_of_e,
	        cost_of_s_to_v,
	        first_visit;
	    while (!open.empty()) {
	      // In the nodes remaining in graph that have a known cost from s,
	      // find the node, u, that currently has the shortest path from s.
	      closest = open.pop();
	      u = closest.value;
	      cost_of_s_to_u = closest.cost;

	      // Get nodes adjacent to u...
	      adjacent_nodes = graph[u] || {};

	      // ...and explore the edges that connect u to those nodes, updating
	      // the cost of the shortest paths to any or all of those nodes as
	      // necessary. v is the node across the current edge from u.
	      for (v in adjacent_nodes) {
	        if (adjacent_nodes.hasOwnProperty(v)) {
	          // Get the cost of the edge running from u to v.
	          cost_of_e = adjacent_nodes[v];

	          // Cost of s to u plus the cost of u to v across e--this is *a*
	          // cost from s to v that may or may not be less than the current
	          // known cost to v.
	          cost_of_s_to_u_plus_cost_of_e = cost_of_s_to_u + cost_of_e;

	          // If we haven't visited v yet OR if the current known cost from s to
	          // v is greater than the new cost we just found (cost of s to u plus
	          // cost of u to v across e), update v's cost in the cost list and
	          // update v's predecessor in the predecessor list (it's now u).
	          cost_of_s_to_v = costs[v];
	          first_visit = (typeof costs[v] === 'undefined');
	          if (first_visit || cost_of_s_to_v > cost_of_s_to_u_plus_cost_of_e) {
	            costs[v] = cost_of_s_to_u_plus_cost_of_e;
	            open.push(v, cost_of_s_to_u_plus_cost_of_e);
	            predecessors[v] = u;
	          }
	        }
	      }
	    }

	    if (typeof d !== 'undefined' && typeof costs[d] === 'undefined') {
	      var msg = ['Could not find a path from ', s, ' to ', d, '.'].join('');
	      throw new Error(msg);
	    }

	    return predecessors;
	  },

	  extract_shortest_path_from_predecessor_list: function(predecessors, d) {
	    var nodes = [];
	    var u = d;
	    while (u) {
	      nodes.push(u);
	      predecessors[u];
	      u = predecessors[u];
	    }
	    nodes.reverse();
	    return nodes;
	  },

	  find_path: function(graph, s, d) {
	    var predecessors = dijkstra.single_source_shortest_paths(graph, s, d);
	    return dijkstra.extract_shortest_path_from_predecessor_list(
	      predecessors, d);
	  },

	  /**
	   * A very naive priority queue implementation.
	   */
	  PriorityQueue: {
	    make: function (opts) {
	      var T = dijkstra.PriorityQueue,
	          t = {},
	          key;
	      opts = opts || {};
	      for (key in T) {
	        if (T.hasOwnProperty(key)) {
	          t[key] = T[key];
	        }
	      }
	      t.queue = [];
	      t.sorter = opts.sorter || T.default_sorter;
	      return t;
	    },

	    default_sorter: function (a, b) {
	      return a.cost - b.cost;
	    },

	    /**
	     * Add a new item to the queue and ensure the highest priority element
	     * is at the front of the queue.
	     */
	    push: function (value, cost) {
	      var item = {value: value, cost: cost};
	      this.queue.push(item);
	      this.queue.sort(this.sorter);
	    },

	    /**
	     * Return the highest priority element in the queue.
	     */
	    pop: function () {
	      return this.queue.shift();
	    },

	    empty: function () {
	      return this.queue.length === 0;
	    }
	  }
	};


	// node.js module exports
	{
	  module.exports = dijkstra;
	} 
} (dijkstra));

var dijkstraExports = dijkstra.exports;

(function (exports) {
	const Mode = mode;
	const NumericData = numericData;
	const AlphanumericData = alphanumericData;
	const ByteData = byteData;
	const KanjiData = kanjiData;
	const Regex = regex;
	const Utils = utils$1;
	const dijkstra = dijkstraExports;

	/**
	 * Returns UTF8 byte length
	 *
	 * @param  {String} str Input string
	 * @return {Number}     Number of byte
	 */
	function getStringByteLength (str) {
	  return unescape(encodeURIComponent(str)).length
	}

	/**
	 * Get a list of segments of the specified mode
	 * from a string
	 *
	 * @param  {Mode}   mode Segment mode
	 * @param  {String} str  String to process
	 * @return {Array}       Array of object with segments data
	 */
	function getSegments (regex, mode, str) {
	  const segments = [];
	  let result;

	  while ((result = regex.exec(str)) !== null) {
	    segments.push({
	      data: result[0],
	      index: result.index,
	      mode: mode,
	      length: result[0].length
	    });
	  }

	  return segments
	}

	/**
	 * Extracts a series of segments with the appropriate
	 * modes from a string
	 *
	 * @param  {String} dataStr Input string
	 * @return {Array}          Array of object with segments data
	 */
	function getSegmentsFromString (dataStr) {
	  const numSegs = getSegments(Regex.NUMERIC, Mode.NUMERIC, dataStr);
	  const alphaNumSegs = getSegments(Regex.ALPHANUMERIC, Mode.ALPHANUMERIC, dataStr);
	  let byteSegs;
	  let kanjiSegs;

	  if (Utils.isKanjiModeEnabled()) {
	    byteSegs = getSegments(Regex.BYTE, Mode.BYTE, dataStr);
	    kanjiSegs = getSegments(Regex.KANJI, Mode.KANJI, dataStr);
	  } else {
	    byteSegs = getSegments(Regex.BYTE_KANJI, Mode.BYTE, dataStr);
	    kanjiSegs = [];
	  }

	  const segs = numSegs.concat(alphaNumSegs, byteSegs, kanjiSegs);

	  return segs
	    .sort(function (s1, s2) {
	      return s1.index - s2.index
	    })
	    .map(function (obj) {
	      return {
	        data: obj.data,
	        mode: obj.mode,
	        length: obj.length
	      }
	    })
	}

	/**
	 * Returns how many bits are needed to encode a string of
	 * specified length with the specified mode
	 *
	 * @param  {Number} length String length
	 * @param  {Mode} mode     Segment mode
	 * @return {Number}        Bit length
	 */
	function getSegmentBitsLength (length, mode) {
	  switch (mode) {
	    case Mode.NUMERIC:
	      return NumericData.getBitsLength(length)
	    case Mode.ALPHANUMERIC:
	      return AlphanumericData.getBitsLength(length)
	    case Mode.KANJI:
	      return KanjiData.getBitsLength(length)
	    case Mode.BYTE:
	      return ByteData.getBitsLength(length)
	  }
	}

	/**
	 * Merges adjacent segments which have the same mode
	 *
	 * @param  {Array} segs Array of object with segments data
	 * @return {Array}      Array of object with segments data
	 */
	function mergeSegments (segs) {
	  return segs.reduce(function (acc, curr) {
	    const prevSeg = acc.length - 1 >= 0 ? acc[acc.length - 1] : null;
	    if (prevSeg && prevSeg.mode === curr.mode) {
	      acc[acc.length - 1].data += curr.data;
	      return acc
	    }

	    acc.push(curr);
	    return acc
	  }, [])
	}

	/**
	 * Generates a list of all possible nodes combination which
	 * will be used to build a segments graph.
	 *
	 * Nodes are divided by groups. Each group will contain a list of all the modes
	 * in which is possible to encode the given text.
	 *
	 * For example the text '12345' can be encoded as Numeric, Alphanumeric or Byte.
	 * The group for '12345' will contain then 3 objects, one for each
	 * possible encoding mode.
	 *
	 * Each node represents a possible segment.
	 *
	 * @param  {Array} segs Array of object with segments data
	 * @return {Array}      Array of object with segments data
	 */
	function buildNodes (segs) {
	  const nodes = [];
	  for (let i = 0; i < segs.length; i++) {
	    const seg = segs[i];

	    switch (seg.mode) {
	      case Mode.NUMERIC:
	        nodes.push([seg,
	          { data: seg.data, mode: Mode.ALPHANUMERIC, length: seg.length },
	          { data: seg.data, mode: Mode.BYTE, length: seg.length }
	        ]);
	        break
	      case Mode.ALPHANUMERIC:
	        nodes.push([seg,
	          { data: seg.data, mode: Mode.BYTE, length: seg.length }
	        ]);
	        break
	      case Mode.KANJI:
	        nodes.push([seg,
	          { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
	        ]);
	        break
	      case Mode.BYTE:
	        nodes.push([
	          { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
	        ]);
	    }
	  }

	  return nodes
	}

	/**
	 * Builds a graph from a list of nodes.
	 * All segments in each node group will be connected with all the segments of
	 * the next group and so on.
	 *
	 * At each connection will be assigned a weight depending on the
	 * segment's byte length.
	 *
	 * @param  {Array} nodes    Array of object with segments data
	 * @param  {Number} version QR Code version
	 * @return {Object}         Graph of all possible segments
	 */
	function buildGraph (nodes, version) {
	  const table = {};
	  const graph = { start: {} };
	  let prevNodeIds = ['start'];

	  for (let i = 0; i < nodes.length; i++) {
	    const nodeGroup = nodes[i];
	    const currentNodeIds = [];

	    for (let j = 0; j < nodeGroup.length; j++) {
	      const node = nodeGroup[j];
	      const key = '' + i + j;

	      currentNodeIds.push(key);
	      table[key] = { node: node, lastCount: 0 };
	      graph[key] = {};

	      for (let n = 0; n < prevNodeIds.length; n++) {
	        const prevNodeId = prevNodeIds[n];

	        if (table[prevNodeId] && table[prevNodeId].node.mode === node.mode) {
	          graph[prevNodeId][key] =
	            getSegmentBitsLength(table[prevNodeId].lastCount + node.length, node.mode) -
	            getSegmentBitsLength(table[prevNodeId].lastCount, node.mode);

	          table[prevNodeId].lastCount += node.length;
	        } else {
	          if (table[prevNodeId]) table[prevNodeId].lastCount = node.length;

	          graph[prevNodeId][key] = getSegmentBitsLength(node.length, node.mode) +
	            4 + Mode.getCharCountIndicator(node.mode, version); // switch cost
	        }
	      }
	    }

	    prevNodeIds = currentNodeIds;
	  }

	  for (let n = 0; n < prevNodeIds.length; n++) {
	    graph[prevNodeIds[n]].end = 0;
	  }

	  return { map: graph, table: table }
	}

	/**
	 * Builds a segment from a specified data and mode.
	 * If a mode is not specified, the more suitable will be used.
	 *
	 * @param  {String} data             Input data
	 * @param  {Mode | String} modesHint Data mode
	 * @return {Segment}                 Segment
	 */
	function buildSingleSegment (data, modesHint) {
	  let mode;
	  const bestMode = Mode.getBestModeForData(data);

	  mode = Mode.from(modesHint, bestMode);

	  // Make sure data can be encoded
	  if (mode !== Mode.BYTE && mode.bit < bestMode.bit) {
	    throw new Error('"' + data + '"' +
	      ' cannot be encoded with mode ' + Mode.toString(mode) +
	      '.\n Suggested mode is: ' + Mode.toString(bestMode))
	  }

	  // Use Mode.BYTE if Kanji support is disabled
	  if (mode === Mode.KANJI && !Utils.isKanjiModeEnabled()) {
	    mode = Mode.BYTE;
	  }

	  switch (mode) {
	    case Mode.NUMERIC:
	      return new NumericData(data)

	    case Mode.ALPHANUMERIC:
	      return new AlphanumericData(data)

	    case Mode.KANJI:
	      return new KanjiData(data)

	    case Mode.BYTE:
	      return new ByteData(data)
	  }
	}

	/**
	 * Builds a list of segments from an array.
	 * Array can contain Strings or Objects with segment's info.
	 *
	 * For each item which is a string, will be generated a segment with the given
	 * string and the more appropriate encoding mode.
	 *
	 * For each item which is an object, will be generated a segment with the given
	 * data and mode.
	 * Objects must contain at least the property "data".
	 * If property "mode" is not present, the more suitable mode will be used.
	 *
	 * @param  {Array} array Array of objects with segments data
	 * @return {Array}       Array of Segments
	 */
	exports.fromArray = function fromArray (array) {
	  return array.reduce(function (acc, seg) {
	    if (typeof seg === 'string') {
	      acc.push(buildSingleSegment(seg, null));
	    } else if (seg.data) {
	      acc.push(buildSingleSegment(seg.data, seg.mode));
	    }

	    return acc
	  }, [])
	};

	/**
	 * Builds an optimized sequence of segments from a string,
	 * which will produce the shortest possible bitstream.
	 *
	 * @param  {String} data    Input string
	 * @param  {Number} version QR Code version
	 * @return {Array}          Array of segments
	 */
	exports.fromString = function fromString (data, version) {
	  const segs = getSegmentsFromString(data, Utils.isKanjiModeEnabled());

	  const nodes = buildNodes(segs);
	  const graph = buildGraph(nodes, version);
	  const path = dijkstra.find_path(graph.map, 'start', 'end');

	  const optimizedSegs = [];
	  for (let i = 1; i < path.length - 1; i++) {
	    optimizedSegs.push(graph.table[path[i]].node);
	  }

	  return exports.fromArray(mergeSegments(optimizedSegs))
	};

	/**
	 * Splits a string in various segments with the modes which
	 * best represent their content.
	 * The produced segments are far from being optimized.
	 * The output of this function is only used to estimate a QR Code version
	 * which may contain the data.
	 *
	 * @param  {string} data Input string
	 * @return {Array}       Array of segments
	 */
	exports.rawSplit = function rawSplit (data) {
	  return exports.fromArray(
	    getSegmentsFromString(data, Utils.isKanjiModeEnabled())
	  )
	}; 
} (segments));

const Utils$1 = utils$1;
const ECLevel = errorCorrectionLevel;
const BitBuffer = bitBuffer;
const BitMatrix = bitMatrix;
const AlignmentPattern = alignmentPattern;
const FinderPattern = finderPattern;
const MaskPattern = maskPattern;
const ECCode = errorCorrectionCode;
const ReedSolomonEncoder = reedSolomonEncoder;
const Version = version;
const FormatInfo = formatInfo;
const Mode = mode;
const Segments = segments;

/**
 * QRCode for JavaScript
 *
 * modified by Ryan Day for nodejs support
 * Copyright (c) 2011 Ryan Day
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
//---------------------------------------------------------------------
// QRCode for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//   http://www.opensource.org/licenses/mit-license.php
//
// The word "QR Code" is registered trademark of
// DENSO WAVE INCORPORATED
//   http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------
*/

/**
 * Add finder patterns bits to matrix
 *
 * @param  {BitMatrix} matrix  Modules matrix
 * @param  {Number}    version QR Code version
 */
function setupFinderPattern (matrix, version) {
  const size = matrix.size;
  const pos = FinderPattern.getPositions(version);

  for (let i = 0; i < pos.length; i++) {
    const row = pos[i][0];
    const col = pos[i][1];

    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || size <= row + r) continue

      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || size <= col + c) continue

        if ((r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
          (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          matrix.set(row + r, col + c, true, true);
        } else {
          matrix.set(row + r, col + c, false, true);
        }
      }
    }
  }
}

/**
 * Add timing pattern bits to matrix
 *
 * Note: this function must be called before {@link setupAlignmentPattern}
 *
 * @param  {BitMatrix} matrix Modules matrix
 */
function setupTimingPattern (matrix) {
  const size = matrix.size;

  for (let r = 8; r < size - 8; r++) {
    const value = r % 2 === 0;
    matrix.set(r, 6, value, true);
    matrix.set(6, r, value, true);
  }
}

/**
 * Add alignment patterns bits to matrix
 *
 * Note: this function must be called after {@link setupTimingPattern}
 *
 * @param  {BitMatrix} matrix  Modules matrix
 * @param  {Number}    version QR Code version
 */
function setupAlignmentPattern (matrix, version) {
  const pos = AlignmentPattern.getPositions(version);

  for (let i = 0; i < pos.length; i++) {
    const row = pos[i][0];
    const col = pos[i][1];

    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        if (r === -2 || r === 2 || c === -2 || c === 2 ||
          (r === 0 && c === 0)) {
          matrix.set(row + r, col + c, true, true);
        } else {
          matrix.set(row + r, col + c, false, true);
        }
      }
    }
  }
}

/**
 * Add version info bits to matrix
 *
 * @param  {BitMatrix} matrix  Modules matrix
 * @param  {Number}    version QR Code version
 */
function setupVersionInfo (matrix, version) {
  const size = matrix.size;
  const bits = Version.getEncodedBits(version);
  let row, col, mod;

  for (let i = 0; i < 18; i++) {
    row = Math.floor(i / 3);
    col = i % 3 + size - 8 - 3;
    mod = ((bits >> i) & 1) === 1;

    matrix.set(row, col, mod, true);
    matrix.set(col, row, mod, true);
  }
}

/**
 * Add format info bits to matrix
 *
 * @param  {BitMatrix} matrix               Modules matrix
 * @param  {ErrorCorrectionLevel}    errorCorrectionLevel Error correction level
 * @param  {Number}    maskPattern          Mask pattern reference value
 */
function setupFormatInfo (matrix, errorCorrectionLevel, maskPattern) {
  const size = matrix.size;
  const bits = FormatInfo.getEncodedBits(errorCorrectionLevel, maskPattern);
  let i, mod;

  for (i = 0; i < 15; i++) {
    mod = ((bits >> i) & 1) === 1;

    // vertical
    if (i < 6) {
      matrix.set(i, 8, mod, true);
    } else if (i < 8) {
      matrix.set(i + 1, 8, mod, true);
    } else {
      matrix.set(size - 15 + i, 8, mod, true);
    }

    // horizontal
    if (i < 8) {
      matrix.set(8, size - i - 1, mod, true);
    } else if (i < 9) {
      matrix.set(8, 15 - i - 1 + 1, mod, true);
    } else {
      matrix.set(8, 15 - i - 1, mod, true);
    }
  }

  // fixed module
  matrix.set(size - 8, 8, 1, true);
}

/**
 * Add encoded data bits to matrix
 *
 * @param  {BitMatrix}  matrix Modules matrix
 * @param  {Uint8Array} data   Data codewords
 */
function setupData (matrix, data) {
  const size = matrix.size;
  let inc = -1;
  let row = size - 1;
  let bitIndex = 7;
  let byteIndex = 0;

  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--;

    while (true) {
      for (let c = 0; c < 2; c++) {
        if (!matrix.isReserved(row, col - c)) {
          let dark = false;

          if (byteIndex < data.length) {
            dark = (((data[byteIndex] >>> bitIndex) & 1) === 1);
          }

          matrix.set(row, col - c, dark);
          bitIndex--;

          if (bitIndex === -1) {
            byteIndex++;
            bitIndex = 7;
          }
        }
      }

      row += inc;

      if (row < 0 || size <= row) {
        row -= inc;
        inc = -inc;
        break
      }
    }
  }
}

/**
 * Create encoded codewords from data input
 *
 * @param  {Number}   version              QR Code version
 * @param  {ErrorCorrectionLevel}   errorCorrectionLevel Error correction level
 * @param  {ByteData} data                 Data input
 * @return {Uint8Array}                    Buffer containing encoded codewords
 */
function createData (version, errorCorrectionLevel, segments) {
  // Prepare data buffer
  const buffer = new BitBuffer();

  segments.forEach(function (data) {
    // prefix data with mode indicator (4 bits)
    buffer.put(data.mode.bit, 4);

    // Prefix data with character count indicator.
    // The character count indicator is a string of bits that represents the
    // number of characters that are being encoded.
    // The character count indicator must be placed after the mode indicator
    // and must be a certain number of bits long, depending on the QR version
    // and data mode
    // @see {@link Mode.getCharCountIndicator}.
    buffer.put(data.getLength(), Mode.getCharCountIndicator(data.mode, version));

    // add binary data sequence to buffer
    data.write(buffer);
  });

  // Calculate required number of bits
  const totalCodewords = Utils$1.getSymbolTotalCodewords(version);
  const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
  const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;

  // Add a terminator.
  // If the bit string is shorter than the total number of required bits,
  // a terminator of up to four 0s must be added to the right side of the string.
  // If the bit string is more than four bits shorter than the required number of bits,
  // add four 0s to the end.
  if (buffer.getLengthInBits() + 4 <= dataTotalCodewordsBits) {
    buffer.put(0, 4);
  }

  // If the bit string is fewer than four bits shorter, add only the number of 0s that
  // are needed to reach the required number of bits.

  // After adding the terminator, if the number of bits in the string is not a multiple of 8,
  // pad the string on the right with 0s to make the string's length a multiple of 8.
  while (buffer.getLengthInBits() % 8 !== 0) {
    buffer.putBit(0);
  }

  // Add pad bytes if the string is still shorter than the total number of required bits.
  // Extend the buffer to fill the data capacity of the symbol corresponding to
  // the Version and Error Correction Level by adding the Pad Codewords 11101100 (0xEC)
  // and 00010001 (0x11) alternately.
  const remainingByte = (dataTotalCodewordsBits - buffer.getLengthInBits()) / 8;
  for (let i = 0; i < remainingByte; i++) {
    buffer.put(i % 2 ? 0x11 : 0xEC, 8);
  }

  return createCodewords(buffer, version, errorCorrectionLevel)
}

/**
 * Encode input data with Reed-Solomon and return codewords with
 * relative error correction bits
 *
 * @param  {BitBuffer} bitBuffer            Data to encode
 * @param  {Number}    version              QR Code version
 * @param  {ErrorCorrectionLevel} errorCorrectionLevel Error correction level
 * @return {Uint8Array}                     Buffer containing encoded codewords
 */
function createCodewords (bitBuffer, version, errorCorrectionLevel) {
  // Total codewords for this QR code version (Data + Error correction)
  const totalCodewords = Utils$1.getSymbolTotalCodewords(version);

  // Total number of error correction codewords
  const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);

  // Total number of data codewords
  const dataTotalCodewords = totalCodewords - ecTotalCodewords;

  // Total number of blocks
  const ecTotalBlocks = ECCode.getBlocksCount(version, errorCorrectionLevel);

  // Calculate how many blocks each group should contain
  const blocksInGroup2 = totalCodewords % ecTotalBlocks;
  const blocksInGroup1 = ecTotalBlocks - blocksInGroup2;

  const totalCodewordsInGroup1 = Math.floor(totalCodewords / ecTotalBlocks);

  const dataCodewordsInGroup1 = Math.floor(dataTotalCodewords / ecTotalBlocks);
  const dataCodewordsInGroup2 = dataCodewordsInGroup1 + 1;

  // Number of EC codewords is the same for both groups
  const ecCount = totalCodewordsInGroup1 - dataCodewordsInGroup1;

  // Initialize a Reed-Solomon encoder with a generator polynomial of degree ecCount
  const rs = new ReedSolomonEncoder(ecCount);

  let offset = 0;
  const dcData = new Array(ecTotalBlocks);
  const ecData = new Array(ecTotalBlocks);
  let maxDataSize = 0;
  const buffer = new Uint8Array(bitBuffer.buffer);

  // Divide the buffer into the required number of blocks
  for (let b = 0; b < ecTotalBlocks; b++) {
    const dataSize = b < blocksInGroup1 ? dataCodewordsInGroup1 : dataCodewordsInGroup2;

    // extract a block of data from buffer
    dcData[b] = buffer.slice(offset, offset + dataSize);

    // Calculate EC codewords for this data block
    ecData[b] = rs.encode(dcData[b]);

    offset += dataSize;
    maxDataSize = Math.max(maxDataSize, dataSize);
  }

  // Create final data
  // Interleave the data and error correction codewords from each block
  const data = new Uint8Array(totalCodewords);
  let index = 0;
  let i, r;

  // Add data codewords
  for (i = 0; i < maxDataSize; i++) {
    for (r = 0; r < ecTotalBlocks; r++) {
      if (i < dcData[r].length) {
        data[index++] = dcData[r][i];
      }
    }
  }

  // Apped EC codewords
  for (i = 0; i < ecCount; i++) {
    for (r = 0; r < ecTotalBlocks; r++) {
      data[index++] = ecData[r][i];
    }
  }

  return data
}

/**
 * Build QR Code symbol
 *
 * @param  {String} data                 Input string
 * @param  {Number} version              QR Code version
 * @param  {ErrorCorretionLevel} errorCorrectionLevel Error level
 * @param  {MaskPattern} maskPattern     Mask pattern
 * @return {Object}                      Object containing symbol data
 */
function createSymbol (data, version, errorCorrectionLevel, maskPattern) {
  let segments;

  if (Array.isArray(data)) {
    segments = Segments.fromArray(data);
  } else if (typeof data === 'string') {
    let estimatedVersion = version;

    if (!estimatedVersion) {
      const rawSegments = Segments.rawSplit(data);

      // Estimate best version that can contain raw splitted segments
      estimatedVersion = Version.getBestVersionForData(rawSegments, errorCorrectionLevel);
    }

    // Build optimized segments
    // If estimated version is undefined, try with the highest version
    segments = Segments.fromString(data, estimatedVersion || 40);
  } else {
    throw new Error('Invalid data')
  }

  // Get the min version that can contain data
  const bestVersion = Version.getBestVersionForData(segments, errorCorrectionLevel);

  // If no version is found, data cannot be stored
  if (!bestVersion) {
    throw new Error('The amount of data is too big to be stored in a QR Code')
  }

  // If not specified, use min version as default
  if (!version) {
    version = bestVersion;

  // Check if the specified version can contain the data
  } else if (version < bestVersion) {
    throw new Error('\n' +
      'The chosen QR Code version cannot contain this amount of data.\n' +
      'Minimum version required to store current data is: ' + bestVersion + '.\n'
    )
  }

  const dataBits = createData(version, errorCorrectionLevel, segments);

  // Allocate matrix buffer
  const moduleCount = Utils$1.getSymbolSize(version);
  const modules = new BitMatrix(moduleCount);

  // Add function modules
  setupFinderPattern(modules, version);
  setupTimingPattern(modules);
  setupAlignmentPattern(modules, version);

  // Add temporary dummy bits for format info just to set them as reserved.
  // This is needed to prevent these bits from being masked by {@link MaskPattern.applyMask}
  // since the masking operation must be performed only on the encoding region.
  // These blocks will be replaced with correct values later in code.
  setupFormatInfo(modules, errorCorrectionLevel, 0);

  if (version >= 7) {
    setupVersionInfo(modules, version);
  }

  // Add data codewords
  setupData(modules, dataBits);

  if (isNaN(maskPattern)) {
    // Find best mask pattern
    maskPattern = MaskPattern.getBestMask(modules,
      setupFormatInfo.bind(null, modules, errorCorrectionLevel));
  }

  // Apply mask pattern
  MaskPattern.applyMask(maskPattern, modules);

  // Replace format info bits with correct values
  setupFormatInfo(modules, errorCorrectionLevel, maskPattern);

  return {
    modules: modules,
    version: version,
    errorCorrectionLevel: errorCorrectionLevel,
    maskPattern: maskPattern,
    segments: segments
  }
}

/**
 * QR Code
 *
 * @param {String | Array} data                 Input data
 * @param {Object} options                      Optional configurations
 * @param {Number} options.version              QR Code version
 * @param {String} options.errorCorrectionLevel Error correction level
 * @param {Function} options.toSJISFunc         Helper func to convert utf8 to sjis
 */
qrcode.create = function create (data, options) {
  if (typeof data === 'undefined' || data === '') {
    throw new Error('No input text')
  }

  let errorCorrectionLevel = ECLevel.M;
  let version;
  let mask;

  if (typeof options !== 'undefined') {
    // Use higher error correction level as default
    errorCorrectionLevel = ECLevel.from(options.errorCorrectionLevel, ECLevel.M);
    version = Version.from(options.version);
    mask = MaskPattern.from(options.maskPattern);

    if (options.toSJISFunc) {
      Utils$1.setToSJISFunction(options.toSJISFunc);
    }
  }

  return createSymbol(data, version, errorCorrectionLevel, mask)
};

var canvas = {};

var utils = {};

(function (exports) {
	function hex2rgba (hex) {
	  if (typeof hex === 'number') {
	    hex = hex.toString();
	  }

	  if (typeof hex !== 'string') {
	    throw new Error('Color should be defined as hex string')
	  }

	  let hexCode = hex.slice().replace('#', '').split('');
	  if (hexCode.length < 3 || hexCode.length === 5 || hexCode.length > 8) {
	    throw new Error('Invalid hex color: ' + hex)
	  }

	  // Convert from short to long form (fff -> ffffff)
	  if (hexCode.length === 3 || hexCode.length === 4) {
	    hexCode = Array.prototype.concat.apply([], hexCode.map(function (c) {
	      return [c, c]
	    }));
	  }

	  // Add default alpha value
	  if (hexCode.length === 6) hexCode.push('F', 'F');

	  const hexValue = parseInt(hexCode.join(''), 16);

	  return {
	    r: (hexValue >> 24) & 255,
	    g: (hexValue >> 16) & 255,
	    b: (hexValue >> 8) & 255,
	    a: hexValue & 255,
	    hex: '#' + hexCode.slice(0, 6).join('')
	  }
	}

	exports.getOptions = function getOptions (options) {
	  if (!options) options = {};
	  if (!options.color) options.color = {};

	  const margin = typeof options.margin === 'undefined' ||
	    options.margin === null ||
	    options.margin < 0
	    ? 4
	    : options.margin;

	  const width = options.width && options.width >= 21 ? options.width : undefined;
	  const scale = options.scale || 4;

	  return {
	    width: width,
	    scale: width ? 4 : scale,
	    margin: margin,
	    color: {
	      dark: hex2rgba(options.color.dark || '#000000ff'),
	      light: hex2rgba(options.color.light || '#ffffffff')
	    },
	    type: options.type,
	    rendererOpts: options.rendererOpts || {}
	  }
	};

	exports.getScale = function getScale (qrSize, opts) {
	  return opts.width && opts.width >= qrSize + opts.margin * 2
	    ? opts.width / (qrSize + opts.margin * 2)
	    : opts.scale
	};

	exports.getImageWidth = function getImageWidth (qrSize, opts) {
	  const scale = exports.getScale(qrSize, opts);
	  return Math.floor((qrSize + opts.margin * 2) * scale)
	};

	exports.qrToImageData = function qrToImageData (imgData, qr, opts) {
	  const size = qr.modules.size;
	  const data = qr.modules.data;
	  const scale = exports.getScale(size, opts);
	  const symbolSize = Math.floor((size + opts.margin * 2) * scale);
	  const scaledMargin = opts.margin * scale;
	  const palette = [opts.color.light, opts.color.dark];

	  for (let i = 0; i < symbolSize; i++) {
	    for (let j = 0; j < symbolSize; j++) {
	      let posDst = (i * symbolSize + j) * 4;
	      let pxColor = opts.color.light;

	      if (i >= scaledMargin && j >= scaledMargin &&
	        i < symbolSize - scaledMargin && j < symbolSize - scaledMargin) {
	        const iSrc = Math.floor((i - scaledMargin) / scale);
	        const jSrc = Math.floor((j - scaledMargin) / scale);
	        pxColor = palette[data[iSrc * size + jSrc] ? 1 : 0];
	      }

	      imgData[posDst++] = pxColor.r;
	      imgData[posDst++] = pxColor.g;
	      imgData[posDst++] = pxColor.b;
	      imgData[posDst] = pxColor.a;
	    }
	  }
	}; 
} (utils));

(function (exports) {
	const Utils = utils;

	function clearCanvas (ctx, canvas, size) {
	  ctx.clearRect(0, 0, canvas.width, canvas.height);

	  if (!canvas.style) canvas.style = {};
	  canvas.height = size;
	  canvas.width = size;
	  canvas.style.height = size + 'px';
	  canvas.style.width = size + 'px';
	}

	function getCanvasElement () {
	  try {
	    return document.createElement('canvas')
	  } catch (e) {
	    throw new Error('You need to specify a canvas element')
	  }
	}

	exports.render = function render (qrData, canvas, options) {
	  let opts = options;
	  let canvasEl = canvas;

	  if (typeof opts === 'undefined' && (!canvas || !canvas.getContext)) {
	    opts = canvas;
	    canvas = undefined;
	  }

	  if (!canvas) {
	    canvasEl = getCanvasElement();
	  }

	  opts = Utils.getOptions(opts);
	  const size = Utils.getImageWidth(qrData.modules.size, opts);

	  const ctx = canvasEl.getContext('2d');
	  const image = ctx.createImageData(size, size);
	  Utils.qrToImageData(image.data, qrData, opts);

	  clearCanvas(ctx, canvasEl, size);
	  ctx.putImageData(image, 0, 0);

	  return canvasEl
	};

	exports.renderToDataURL = function renderToDataURL (qrData, canvas, options) {
	  let opts = options;

	  if (typeof opts === 'undefined' && (!canvas || !canvas.getContext)) {
	    opts = canvas;
	    canvas = undefined;
	  }

	  if (!opts) opts = {};

	  const canvasEl = exports.render(qrData, canvas, opts);

	  const type = opts.type || 'image/png';
	  const rendererOpts = opts.rendererOpts || {};

	  return canvasEl.toDataURL(type, rendererOpts.quality)
	}; 
} (canvas));

var svgTag = {};

const Utils = utils;

function getColorAttrib (color, attrib) {
  const alpha = color.a / 255;
  const str = attrib + '="' + color.hex + '"';

  return alpha < 1
    ? str + ' ' + attrib + '-opacity="' + alpha.toFixed(2).slice(1) + '"'
    : str
}

function svgCmd (cmd, x, y) {
  let str = cmd + x;
  if (typeof y !== 'undefined') str += ' ' + y;

  return str
}

function qrToPath (data, size, margin) {
  let path = '';
  let moveBy = 0;
  let newRow = false;
  let lineLength = 0;

  for (let i = 0; i < data.length; i++) {
    const col = Math.floor(i % size);
    const row = Math.floor(i / size);

    if (!col && !newRow) newRow = true;

    if (data[i]) {
      lineLength++;

      if (!(i > 0 && col > 0 && data[i - 1])) {
        path += newRow
          ? svgCmd('M', col + margin, 0.5 + row + margin)
          : svgCmd('m', moveBy, 0);

        moveBy = 0;
        newRow = false;
      }

      if (!(col + 1 < size && data[i + 1])) {
        path += svgCmd('h', lineLength);
        lineLength = 0;
      }
    } else {
      moveBy++;
    }
  }

  return path
}

svgTag.render = function render (qrData, options, cb) {
  const opts = Utils.getOptions(options);
  const size = qrData.modules.size;
  const data = qrData.modules.data;
  const qrcodesize = size + opts.margin * 2;

  const bg = !opts.color.light.a
    ? ''
    : '<path ' + getColorAttrib(opts.color.light, 'fill') +
      ' d="M0 0h' + qrcodesize + 'v' + qrcodesize + 'H0z"/>';

  const path =
    '<path ' + getColorAttrib(opts.color.dark, 'stroke') +
    ' d="' + qrToPath(data, size, opts.margin) + '"/>';

  const viewBox = 'viewBox="' + '0 0 ' + qrcodesize + ' ' + qrcodesize + '"';

  const width = !opts.width ? '' : 'width="' + opts.width + '" height="' + opts.width + '" ';

  const svgTag = '<svg xmlns="http://www.w3.org/2000/svg" ' + width + viewBox + ' shape-rendering="crispEdges">' + bg + path + '</svg>\n';

  if (typeof cb === 'function') {
    cb(null, svgTag);
  }

  return svgTag
};

const canPromise = canPromise$1;

const QRCode = qrcode;
const CanvasRenderer = canvas;
const SvgRenderer = svgTag;

function renderCanvas (renderFunc, canvas, text, opts, cb) {
  const args = [].slice.call(arguments, 1);
  const argsNum = args.length;
  const isLastArgCb = typeof args[argsNum - 1] === 'function';

  if (!isLastArgCb && !canPromise()) {
    throw new Error('Callback required as last argument')
  }

  if (isLastArgCb) {
    if (argsNum < 2) {
      throw new Error('Too few arguments provided')
    }

    if (argsNum === 2) {
      cb = text;
      text = canvas;
      canvas = opts = undefined;
    } else if (argsNum === 3) {
      if (canvas.getContext && typeof cb === 'undefined') {
        cb = opts;
        opts = undefined;
      } else {
        cb = opts;
        opts = text;
        text = canvas;
        canvas = undefined;
      }
    }
  } else {
    if (argsNum < 1) {
      throw new Error('Too few arguments provided')
    }

    if (argsNum === 1) {
      text = canvas;
      canvas = opts = undefined;
    } else if (argsNum === 2 && !canvas.getContext) {
      opts = text;
      text = canvas;
      canvas = undefined;
    }

    return new Promise(function (resolve, reject) {
      try {
        const data = QRCode.create(text, opts);
        resolve(renderFunc(data, canvas, opts));
      } catch (e) {
        reject(e);
      }
    })
  }

  try {
    const data = QRCode.create(text, opts);
    cb(null, renderFunc(data, canvas, opts));
  } catch (e) {
    cb(e);
  }
}

browser.create = QRCode.create;
browser.toCanvas = renderCanvas.bind(null, CanvasRenderer.render);
browser.toDataURL = renderCanvas.bind(null, CanvasRenderer.renderToDataURL);

// only svg for now.
browser.toString = renderCanvas.bind(null, function (data, _, opts) {
  return SvgRenderer.render(data, opts)
});

function SetupTwoFactorDialog({ close }) {
  const [otp, setOtp] = core_dashboard__loadShare__react__loadShare__.useState("");
  const [qrCodeSvg, setQrCodeSvg] = core_dashboard__loadShare__react__loadShare__.useState("");
  const apiUrl = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.useApiUrl();
  const form = ue();
  const invalidateAuth = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useInvalidateAuthStore();
  const portalMeta = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.usePortalMeta();
  const identity = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useGetIdentity();
  const {
    steps: { currentStep, gotoStep }
  } = form;
  const { open } = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useNotification();
  const { isLoading: isGeneratingOtp, mutate: generateOtp } = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useCustomMutation();
  const generateNewOtp = core_dashboard__loadShare__react__loadShare__.useCallback(() => {
    generateOtp(
      {
        method: "post",
        url: `${apiUrl}/api/auth/otp/generate`,
        values: {}
      },
      {
        async onSuccess(data) {
          setOtp(data.data.otp);
          let totp = new TOTP({
            // Provider or service the account is associated with.
            issuer: portalMeta?.domain,
            // Account identifier.
            label: `${portalMeta?.domain}:${identity.data?.email}`,
            secret: data.data.otp
          });
          const svg = await browser.toString(totp.toString(), { type: "svg" });
          setQrCodeSvg(svg);
        }
      }
    );
  }, [generateOtp, apiUrl]);
  core_dashboard__loadShare__react__loadShare__.useEffect(() => {
    if (currentStep === 0) {
      generateNewOtp();
    }
  }, [currentStep, generateNewOtp]);
  const { isLoading: isVerifyingOtp, mutate: verifyOtp } = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useCustomMutation();
  const handleVerifyOtp = (values) => {
    verifyOtp(
      {
        method: "post",
        url: `${apiUrl}/api/auth/otp/verify`,
        values
      },
      {
        onError: (_error) => {
          open?.({
            description: "Please check the code and try again.",
            message: "OTP verification failed",
            type: "error"
          });
        },
        onSuccess: (_data) => {
          open?.({
            description: "Your account is now more secure.",
            message: "Two-factor authentication setup successful!",
            type: "success"
          });
          invalidateAuth();
          close();
        }
      }
    );
  };
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Form, { ...form, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "form",
          {
            className: "space-y-8",
            onSubmit: (e) => {
              e.preventDefault();
              gotoStep(1);
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormItem, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 flex justify-center border bg-secondary-2", children: qrCodeSvg && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "w-3/4",
                    dangerouslySetInnerHTML: { __html: qrCodeSvg }
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormDescription, { className: "font-semibold", children: "Don't have access to scan? Use this code instead." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border text-center font-bold", children: otp || "Loading..." }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Button,
                {
                  className: "w-full h-14",
                  disabled: isGeneratingOtp,
                  type: "submit",
                  children: "Continue"
                }
              )
            ]
          }
        ) });
      case 1:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Form, { ...form, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "form",
          {
            className: "space-y-8",
            onSubmit: form.handleSubmit(handleVerifyOtp),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormField,
                {
                  control: form.control,
                  name: "otp",
                  render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormItem, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormLabel, { children: "Authentication Code" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Input, { placeholder: "Enter OTP", ...field }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormDescription, { children: "Enter the authentication code generated in your two-factor application to confirm your setup." }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormMessage, {})
                  ] })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Button,
                {
                  className: "w-full h-14",
                  disabled: isVerifyingOtp,
                  type: "submit",
                  children: "Confirm"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Button,
                {
                  className: "w-full h-14 mt-2",
                  onClick: () => gotoStep(0),
                  type: "button",
                  variant: "outline",
                  children: "Back"
                }
              )
            ]
          }
        ) });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogTitle, { className: "mb-8", children: "Setup Two-Factor" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-y-6", children: renderStep() })
  ] });
}

const ManagementCardTitle = ({
  children,
  className,
  icon: Icon = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FingerPrintIcon
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.cn("flex items-center gap-x-2 font-semibold", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "text-foreground" }),
    children
  ] });
};
const ManagementCardContent = ({
  children,
  className
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.cn("mt-4 mb-8 text-sm text-muted", className), children });
};
const ManagementCardFooter = ({
  children,
  className
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className, children });
};
const ManagementCard = ({
  children,
  variant
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.cn(
        "rounded-lg p-8 border border-border/30 bg-secondary/30 w-full ",
        !variant && "[--variant-color:theme(colors.border)]",
        variant === "accent" && "[--variant-color:theme(colors.primary-1.DEFAULT)]"
      ),
      children
    }
  );
};

function ManagementGrid({
  children,
  columns = 3
}) {
  const grids = Math.ceil(React.Children.toArray(children).length / columns);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-4", children: [
    React.Children.map(children, (child, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: child }, index)),
    Array.from({
      length: grids * columns - React.Children.toArray(children).length
    }).fill(null).map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}, index))
  ] });
}

function Account() {
  const { data: identity } = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useGetIdentity();
  const [openModal, setModal] = core_dashboard__loadShare__react__loadShare__.useState({
    changeAvatar: false,
    changeEmail: false,
    changePassword: false,
    deleteAccount: false,
    disableTwoFactor: false,
    setupTwoFactor: false
  });
  const closeModal = () => {
    setModal({
      changeAvatar: false,
      changeEmail: false,
      changePassword: false,
      deleteAccount: false,
      disableTwoFactor: false,
      setupTwoFactor: false
    });
  };
  const isModalOpen = Object.values(openModal).some((isOpen) => isOpen);
  const billingEnabled = false;
  const supportEnabled = false;
  core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.usePluginMeta("support", "support_portal");
  core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.usePluginMeta("support", "mailbox_id");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Dialog,
    {
      onOpenChange: (open) => {
        if (!open) {
          closeModal();
        }
      },
      open: isModalOpen,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ManagementGrid, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(ManagementCard, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardTitle, { children: "Email Address" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardContent, { className: "text-foreground font-semibold", children: identity?.email }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Button,
              {
                className: "h-12 gap-x-2",
                onClick: () => setModal({ ...openModal, changeEmail: true }),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.AddIcon, {}),
                  "Change Email Address"
                ]
              }
            ) }) })
          ] }),
          billingEnabled,
          /* @__PURE__ */ jsxRuntimeExports.jsxs(ManagementCard, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardTitle, { children: "Password" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardContent, { className: "text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PasswordDots, { className: "mt-6" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Button,
              {
                className: "h-12 gap-x-2",
                onClick: () => setModal({ ...openModal, changePassword: true }),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.AddIcon, {}),
                  "Change Password"
                ]
              }
            ) }) })
          ] }),
          supportEnabled,
          /* @__PURE__ */ jsxRuntimeExports.jsxs(ManagementCard, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardTitle, { children: "Delete Account" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardContent, { className: "text-foreground", children: "Once initiated, this action cannot be undone." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Button,
              {
                className: "h-12 gap-x-2",
                onClick: () => setModal({ ...openModal, deleteAccount: true }),
                variant: "destructive",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.AddIcon, {}),
                  "Delete my Account"
                ]
              }
            ) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogContent, { children: [
          openModal.changeEmail && /* @__PURE__ */ jsxRuntimeExports.jsx(
            ChangeEmailForm,
            {
              close: closeModal,
              currentValue: identity?.email || ""
            }
          ),
          openModal.changePassword && /* @__PURE__ */ jsxRuntimeExports.jsx(ChangePasswordForm, { close: closeModal }),
          openModal.setupTwoFactor && /* @__PURE__ */ jsxRuntimeExports.jsx(SetupTwoFactorDialog, { close: closeModal }),
          openModal.disableTwoFactor && /* @__PURE__ */ jsxRuntimeExports.jsx(DisableTwoFactorDialog, { close: closeModal }),
          openModal.deleteAccount && /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteAccountDialog, { close: closeModal })
        ] })
      ]
    }
  ) });
}

export { Account as default };
