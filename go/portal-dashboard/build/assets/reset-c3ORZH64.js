import { j as jsxRuntimeExports } from "./jsx-runtime-CzXAEjbZ.js";
import { t } from "./zod-BlhIUxtz.js";
import { u as useForm, F as Form, a as FormField, b as FormItem, e as FormLabel, c as FormControl, d as FormMessage } from "./form-B0KDmX57.js";
import { B as Button } from "./button-jedbwRXf.js";
import { I as Input } from "./input-Sza_mO8a.js";
import { N as co } from "./index-xFQL_PNe.js";
import { z } from "./index-BpxO7BrF.js";
import { L as Link } from "./components-D8mYRm61.js";
import "./label-DTm3nVMD.js";
import "./react-icons.esm-o-P2jf_4.js";
import "./index-COfyDwxK.js";
import "./index-QWRrEtKK.js";
import "./index-5ukv8M2q.js";
const schema = z.object({
  email: z.string().email("Invalid email address")
});
function ResetPasswordForm() {
  const forgotPassword = co();
  const form = useForm({
    resolver: t(schema),
    defaultValues: {
      email: ""
    }
  });
  const onSubmit = (data) => {
    forgotPassword.mutate(data);
  };
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
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...field }) }),
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
    title: "Reset Password"
  }];
};
function ResetPassword() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ResetPasswordForm, {});
}
export {
  ResetPassword as default,
  meta
};
