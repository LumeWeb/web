import { j as jsxRuntimeExports, r as reactExports } from "./jsx-runtime-IZdvEyt_.js";
import { o as oo, y as yo, l as lo, d as Lr, P as Pe, x as xo } from "./index-DU1IfKY5.js";
import { f as CloudUploadIcon, i as CloudCheckIcon, A as AddIcon, j as CrownIcon } from "./icons-DfV8n6Ey.js";
import { A as AccountUsage, M as ManagementGrid, a as ManagementCard, b as ManagementCardTitle, c as ManagementCardContent, d as ManagementCardFooter, S as SetupTwoFactorDialog, D as DisableTwoFactorDialog } from "./AccountUsage-B-VjgqE9.js";
import { B as Button } from "./button-CzfLTIHt.js";
import { b as DialogHeader, c as DialogTitle, e as DialogFooter, D as Dialog, f as DialogTrigger, a as DialogContent } from "./dialog-D6SmLySg.js";
import { c as DialogClose } from "./index-DUTfRgmH.js";
import { C as Cross2Icon } from "./index-DiXcXsr5.js";
import { t } from "./zod-DADFYJkp.js";
import { u as useForm, F as Form, a as FormField, b as FormItem, e as FormLabel, c as FormControl, d as FormMessage } from "./form-D1HtfKzz.js";
import { I as Input } from "./input-B6UnxZyR.js";
import { z } from "./index-BpxO7BrF.js";
import { C } from "./index-BWzHRlC6.js";
import { L as Label } from "./label-DPLqB6Bj.js";
import { A as Alert, b as AlertDescription } from "./alert-BS46AoM-.js";
import { u as useIsBillingEnabled } from "./avatar-BEvRnn4D.js";
import { u as useFeatureFlag } from "./useFeatureFlag-PPzt5-ch.js";
import { u as usePluginMeta } from "./usePluginMeta-BNkMCdOH.js";
import { b as useIsPaidBillingEnabled, u as useSubscription } from "./useSubscription-BJBkiziB.js";
import { L as Link } from "./components-DMYkXxdw.js";
import "./usePortalMeta-BrKLDHxF.js";
import "./usePortalUrl-Bjyn0q0k.js";
import "./circle-alert-Bf8XKLoY.js";
import "./Combination-BC6FEbU4.js";
import "./index-C-2rzX6a.js";
import "./index-BquAYmyk.js";
import "./useCurrentUsage-CtAD3g0m.js";
import "./filesize-DaDW_CYa.js";
import "./index-CfDxhBvB.js";
import "./index-O1NGHMyc.js";
function PasswordDots({ className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      "aria-hidden": "true",
      width: "219",
      height: "7",
      viewBox: "0 0 219 7",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      className,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "3.7771", cy: "3.5", r: "3.5", fill: "currentColor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "31.7771", cy: "3.5", r: "3.5", fill: "currentColor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "45.7771", cy: "3.5", r: "3.5", fill: "currentColor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "17.7771", cy: "3.5", r: "3.5", fill: "currentColor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "59.7771", cy: "3.5", r: "3.5", fill: "currentColor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "73.7771", cy: "3.5", r: "3.5", fill: "currentColor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "87.7771", cy: "3.5", r: "3.5", fill: "currentColor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "101.777", cy: "3.5", r: "3.5", fill: "currentColor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "131.5", cy: "3.5", r: "3.5", fill: "currentColor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "117.5", cy: "3.5", r: "3.5", fill: "currentColor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "145.5", cy: "3.5", r: "3.5", fill: "currentColor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "159.5", cy: "3.5", r: "3.5", fill: "currentColor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "173.5", cy: "3.5", r: "3.5", fill: "currentColor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "187.5", cy: "3.5", r: "3.5", fill: "currentColor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "201.5", cy: "3.5", r: "3.5", fill: "currentColor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "215.5", cy: "3.5", r: "3.5", fill: "currentColor" })
      ]
    }
  );
}
function useUppy() {
  return {
    getRootProps: () => ({}),
    getInputProps: () => ({}),
    getFiles: () => [],
    upload: () => {
    },
    state: "idle",
    removeFile: () => {
    },
    cancelAll: () => {
    }
  };
}
function ChangeAvatarForm({ close }) {
  var _a;
  const {
    getRootProps,
    getInputProps,
    getFiles,
    upload,
    state,
    removeFile,
    cancelAll
  } = useUppy();
  const isUploading = state === "uploading";
  const isCompleted = state === "completed";
  const hasStarted = state !== "idle" && state !== "initializing";
  const file = (_a = getFiles()) == null ? void 0 : _a[0];
  const imagePreview = reactExports.useMemo(() => {
    if (file) {
      return URL.createObjectURL(file == null ? void 0 : file.data);
    }
  }, [file]);
  reactExports.useEffect(() => {
    if (isCompleted) {
      close();
    }
  }, [isCompleted, close]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Edit Avatar" }) }),
    !hasStarted && !getFiles().length ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        ...getRootProps(),
        className: "border border-border rounded text-muted bg-primary-dark h-48 flex flex-col items-center justify-center",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              hidden: true,
              "aria-hidden": true,
              name: "uppyFiles[]",
              multiple: true,
              ...getInputProps()
            },
            (/* @__PURE__ */ new Date()).toISOString()
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CloudUploadIcon, { className: "w-24 h-24 stroke stroke-primary-dark" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Drag & Drop Files or Browse" })
        ]
      }
    ) : null,
    !hasStarted && file && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded p-4 bg-primary-dark relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          className: "absolute top-1/2 right-1/2 rounded-full bg-gray-800/50 hover:bg-primary p-2 text-sm",
          onClick: () => removeFile(file == null ? void 0 : file.id),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Cross2Icon, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          className: "w-full h-48 object-contain",
          src: imagePreview,
          alt: "New Avatar Preview"
        }
      )
    ] }),
    hasStarted ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-y-2 w-full text-primary-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CloudCheckIcon, { className: "w-32 h-32" }),
      isCompleted ? "Upload completed" : "0% completed"
    ] }) : null,
    isUploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(DialogClose, { asChild: true, onClick: cancelAll, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "lg", className: "mt-6", children: "Cancel" }) }) : null,
    isCompleted ? /* @__PURE__ */ jsxRuntimeExports.jsx(DialogClose, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "lg", className: "mt-6", children: "Close" }) }) : null,
    !hasStarted && !isCompleted && !isUploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "lg", className: "mt-6", onClick: upload, children: "Upload" }) : null
  ] });
}
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
  currentValue,
  close
}) {
  const { data: identity } = oo();
  const { mutate: updateEmail, isSuccess } = yo();
  const form = useForm({
    resolver: t(formSchema$1),
    defaultValues: {
      email: "",
      password: "",
      retypePassword: ""
    }
  });
  const onSubmit = (data) => {
    updateEmail({
      resource: "account",
      id: (identity == null ? void 0 : identity.id) || "",
      values: {
        email: data.email,
        password: data.password
      }
    });
  };
  reactExports.useEffect(() => {
    if (isSuccess) {
      close();
    }
  }, [isSuccess, close]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Form, { ...form, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "mb-8", children: "Change Email" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-full px-4 py-2 w-fit text-sm bg-ring font-bold text-secondary-1", children: currentValue }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      FormField,
      {
        control: form.control,
        name: "email",
        render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "New Email Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...field }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      FormField,
      {
        control: form.control,
        name: "password",
        render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", ...field }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      FormField,
      {
        control: form.control,
        name: "retypePassword",
        render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "Retype Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", ...field }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full h-14", children: "Change Email Address" }) })
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
  const { mutate: updatePassword, isSuccess } = lo();
  const form = useForm({
    resolver: t(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      retypePassword: ""
    }
  });
  const onSubmit = (data) => {
    updatePassword({
      currentPassword: data.currentPassword,
      password: data.newPassword
    });
  };
  reactExports.useEffect(() => {
    if (isSuccess) {
      close();
    }
  }, [isSuccess, close]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Form, { ...form, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "mb-8", children: "Change Password" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      FormField,
      {
        control: form.control,
        name: "currentPassword",
        render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "Current Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", ...field }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      FormField,
      {
        control: form.control,
        name: "newPassword",
        render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "New Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", ...field }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      FormField,
      {
        control: form.control,
        name: "retypePassword",
        render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "Retype Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", ...field }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full h-14", children: "Change Password" }) })
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
  const [step, setStep] = reactExports.useState(1);
  const { mutate: logout } = Lr();
  const { push } = Pe();
  const deleteMutator = xo();
  const stepOneForm = C({
    resolver: t(stepOneSchema),
    defaultValues: {
      confirmText: ""
    }
  });
  const stepTwoForm = C({
    resolver: t(stepTwoSchema),
    defaultValues: {
      confirmText: ""
    }
  });
  const onStepOneSubmit = (data) => {
    setStep(2);
  };
  const onStepTwoSubmit = (data) => {
    deleteMutator.mutate(
      {
        resource: "account",
        id: "",
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { variant: "destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "Are you sure you want to delete your account? This action cannot be undone." }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4", children: 'Type "DELETE" to confirm:' }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...stepOneForm.register("confirmText"), className: "mt-2" }),
    stepOneForm.formState.errors.confirmText && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-500 mt-1", children: stepOneForm.formState.errors.confirmText.message }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: handleClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", variant: "destructive", children: "Proceed" })
    ] })
  ] });
  const renderStepTwo = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: stepTwoForm.handleSubmit(onStepTwoSubmit), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { variant: "destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "This is your final chance to reconsider. Your account will be permanently deleted." }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "finalConfirm", className: "mt-4 block", children: 'Type "I UNDERSTAND" to proceed with account deletion:' }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Input,
      {
        id: "finalConfirm",
        ...stepTwoForm.register("confirmText"),
        className: "mt-2"
      }
    ),
    stepTwoForm.formState.errors.confirmText && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-500 mt-1", children: stepTwoForm.formState.errors.confirmText.message }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: handleClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", variant: "destructive", children: "Delete Account" })
    ] })
  ] });
  const renderSuccessScreen = () => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "Your account will be deleted within 48 hours. If this is an error, please contact support as soon as possible." }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleLogout, children: "OK" }) })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      step === 1 && "Delete Account",
      step === 2 && "Final Confirmation",
      step === 3 && "Account Deletion Scheduled"
    ] }) }),
    step === 1 && renderStepOne(),
    step === 2 && renderStepTwo(),
    step === 3 && renderSuccessScreen()
  ] });
}
function useIsSupportEnabled() {
  return useFeatureFlag("support");
}
function MyAccount() {
  var _a, _b;
  const {
    data: identity
  } = oo();
  const [openModal, setModal] = reactExports.useState({
    changeEmail: false,
    changePassword: false,
    setupTwoFactor: false,
    disableTwoFactor: false,
    changeAvatar: false,
    deleteAccount: false
  });
  const closeModal = () => {
    setModal({
      changeEmail: false,
      changePassword: false,
      setupTwoFactor: false,
      disableTwoFactor: false,
      changeAvatar: false,
      deleteAccount: false
    });
  };
  const isModalOpen = Object.values(openModal).some((isOpen) => isOpen);
  const billingEnabled = useIsBillingEnabled();
  const paidBillingEnabled = useIsPaidBillingEnabled();
  const supportEnabled = useIsSupportEnabled();
  const supportPortalUrl = usePluginMeta("support", "support_portal");
  const supportPortalMailboxID = usePluginMeta("support", "mailbox_id");
  const supportPortalUrlSSO = `${supportPortalUrl}/help/${supportPortalMailboxID}/oauth`;
  const subscription = useSubscription();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, {
      onOpenChange: (open) => {
        if (!open) {
          closeModal();
        }
      },
      open: isModalOpen,
      children: [/* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className: "mt-10",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccountUsage, {})
      }), /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className: "mt-10",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ManagementGrid, {
          children: [/* @__PURE__ */ jsxRuntimeExports.jsxs(ManagementCard, {
            children: [/* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardTitle, {
              children: "Email Address"
            }), /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardContent, {
              className: "text-foreground font-semibold",
              children: identity == null ? void 0 : identity.email
            }), /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardFooter, {
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, {
                asChild: true,
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, {
                  className: "h-12 gap-x-2",
                  onClick: () => setModal({
                    ...openModal,
                    changeEmail: true
                  }),
                  children: [/* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}), "Change Email Address"]
                })
              })
            })]
          }), billingEnabled && paidBillingEnabled && /* @__PURE__ */ jsxRuntimeExports.jsxs(ManagementCard, {
            children: [/* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardTitle, {
              children: "Account Type"
            }), /* @__PURE__ */ jsxRuntimeExports.jsxs(ManagementCardContent, {
              className: "text-foreground font-semibold flex gap-x-2",
              children: [/* @__PURE__ */ jsxRuntimeExports.jsx("span", {
                children: (_b = (_a = subscription == null ? void 0 : subscription.subscriptionData) == null ? void 0 : _a.plan) == null ? void 0 : _b.name
              }), /* @__PURE__ */ jsxRuntimeExports.jsx(CrownIcon, {})]
            }), /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardFooter, {
              children: paidBillingEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
                to: "/account/subscription",
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, {
                  className: "h-12 gap-x-2 text-foreground",
                  children: [/* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}), "Change Plan"]
                })
              })
            })]
          }), /* @__PURE__ */ jsxRuntimeExports.jsxs(ManagementCard, {
            children: [/* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardTitle, {
              children: "Password"
            }), /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardContent, {
              className: "text-foreground",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(PasswordDots, {
                className: "mt-6"
              })
            }), /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardFooter, {
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, {
                asChild: true,
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, {
                  className: "h-12 gap-x-2",
                  onClick: () => setModal({
                    ...openModal,
                    changePassword: true
                  }),
                  children: [/* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}), "Change Password"]
                })
              })
            })]
          }), supportEnabled && /* @__PURE__ */ jsxRuntimeExports.jsxs(ManagementCard, {
            children: [/* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardTitle, {
              children: "Read our Resources"
            }), /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardContent, {
              className: "text-foreground",
              children: "Navigate helpful articles or get assistance."
            }), /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardFooter, {
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
                to: supportPortalUrlSSO,
                target: "_blank",
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, {
                  className: "h-12 gap-x-2",
                  children: [/* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}), "Open Help Center"]
                })
              })
            })]
          }), /* @__PURE__ */ jsxRuntimeExports.jsxs(ManagementCard, {
            children: [/* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardTitle, {
              children: "Delete Account"
            }), /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardContent, {
              className: "text-foreground",
              children: "Once initiated, this action cannot be undone."
            }), /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardFooter, {
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, {
                className: "h-12 gap-x-2",
                variant: "destructive",
                onClick: () => setModal({
                  ...openModal,
                  deleteAccount: true
                }),
                children: [/* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}), "Delete my Account"]
              })
            })]
          })]
        })
      }), /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, {
        children: [openModal.changeAvatar && /* @__PURE__ */ jsxRuntimeExports.jsx(ChangeAvatarForm, {
          close: closeModal
        }), openModal.changeEmail && /* @__PURE__ */ jsxRuntimeExports.jsx(ChangeEmailForm, {
          currentValue: (identity == null ? void 0 : identity.email) || "",
          close: closeModal
        }), openModal.changePassword && /* @__PURE__ */ jsxRuntimeExports.jsx(ChangePasswordForm, {
          close: closeModal
        }), openModal.setupTwoFactor && /* @__PURE__ */ jsxRuntimeExports.jsx(SetupTwoFactorDialog, {
          close: closeModal
        }), openModal.disableTwoFactor && /* @__PURE__ */ jsxRuntimeExports.jsx(DisableTwoFactorDialog, {
          close: closeModal
        }), openModal.deleteAccount && /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteAccountDialog, {
          close: closeModal
        })]
      })]
    })
  });
}
export {
  MyAccount as default
};
