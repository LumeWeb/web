import { r as reactExports, j as jsxRuntimeExports } from "./jsx-runtime-CzXAEjbZ.js";
import { t } from "./zod-BlhIUxtz.js";
import { u as useForm, F as Form, a as FormField, b as FormItem, e as FormLabel, c as FormControl, d as FormMessage } from "./form-B0KDmX57.js";
import { z } from "./index-BpxO7BrF.js";
import { B as Button } from "./button-jedbwRXf.js";
import { I as Input } from "./input-Sza_mO8a.js";
import { L as Le, N as co } from "./index-xFQL_PNe.js";
import { a as useSearchParams } from "./index-QWRrEtKK.js";
import { L as Link } from "./components-D8mYRm61.js";
import "./label-DTm3nVMD.js";
import "./react-icons.esm-o-P2jf_4.js";
import "./index-COfyDwxK.js";
import "./index-5ukv8M2q.js";
const schema = z.object({
  email: z.string().email().min(1),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  token: z.string().min(1)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});
function ConfirmResetPasswordForm() {
  const go = Le();
  const forgotPassword = co();
  const [isSuccess, setIsSuccess] = reactExports.useState(false);
  const [searchParams] = useSearchParams();
  const form = useForm({
    resolver: t(schema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      token: ""
    }
  });
  reactExports.useEffect(() => {
    const email = searchParams.get("email") || "";
    const token = searchParams.get("token") || "";
    form.setValue("email", email);
    form.setValue("token", token);
  }, [searchParams, form]);
  const onSubmit = (data) => {
    const { confirmPassword, ...submitData } = data;
    forgotPassword.mutate(submitData, {
      onSuccess: (result) => {
        if (result.success) {
          setIsSuccess(true);
        }
      }
    });
  };
  const handleGoToLogin = () => {
    go({ to: "/login" });
  };
  if (isSuccess) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "opacity-60 mb-4", children: "Your password has been reset successfully." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleGoToLogin, children: "Go to Login" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full h-full p-4 sm:p-10 space-y-4 mt-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-input-placeholder w-full text-left mb-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/login",
        className: "text-foreground text-md hover:underline hover:underline-offset-4",
        children: "← Back to Login"
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "!mb-12 space-y-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-bold", children: "Reset your password" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Form, { ...form, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        FormField,
        {
          control: form.control,
          name: "email",
          render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "Email Address" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...field, readOnly: true }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        FormField,
        {
          control: form.control,
          name: "token",
          render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "Reset Token" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...field, readOnly: true }) }),
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
          name: "confirmPassword",
          render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "Confirm New Password" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", ...field }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full h-14", children: "Reset Password" })
    ] }) })
  ] });
}
const meta = () => {
  return [{
    title: "Confirm Reset Password"
  }];
};
function Confirm() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmResetPasswordForm, {});
}
export {
  Confirm as default,
  meta
};
