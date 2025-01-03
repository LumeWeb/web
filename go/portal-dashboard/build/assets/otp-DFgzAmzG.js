import { r as reactExports, j as jsxRuntimeExports } from "./jsx-runtime-CzXAEjbZ.js";
import { u as useForm, F as Form, a as FormField, b as FormItem, e as FormLabel, c as FormControl, d as FormMessage } from "./form-B0KDmX57.js";
import { t } from "./zod-BlhIUxtz.js";
import { M as Mr, L as Le, T as Te, $ as $t } from "./index-xFQL_PNe.js";
import { B as Button } from "./button-jedbwRXf.js";
import { I as Input } from "./input-Sza_mO8a.js";
import { z } from "./index-BpxO7BrF.js";
import { L as Link } from "./components-D8mYRm61.js";
import "./label-DTm3nVMD.js";
import "./react-icons.esm-o-P2jf_4.js";
import "./index-COfyDwxK.js";
import "./index-QWRrEtKK.js";
import "./index-5ukv8M2q.js";
const schema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 characters" })
});
function OtpForm() {
  var _a;
  const {
    isLoading: isAuthLoading,
    data: authData
  } = Mr();
  const go = Le();
  const parsed = Te();
  const to = (_a = parsed.params) == null ? void 0 : _a.to;
  const login = $t();
  const form = useForm({
    resolver: t(schema),
    defaultValues: {
      otp: ""
    }
  });
  const onSubmit = (data) => {
    debugger;
    login.mutate({
      otp: data.otp,
      redirectTo: to ?? void 0
    });
  };
  reactExports.useEffect(() => {
    if (!isAuthLoading && (authData == null ? void 0 : authData.authenticated)) {
      go({
        to,
        type: "push"
      });
    }
  }, [isAuthLoading, authData, to, go]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Form, {
    ...form,
    children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", {
      onSubmit: form.handleSubmit(onSubmit),
      className: "w-full p-2 max-w-md mt-12 bg-background",
      children: [/* @__PURE__ */ jsxRuntimeExports.jsxs("span", {
        className: "block !mb-8 space-y-2",
        children: [/* @__PURE__ */ jsxRuntimeExports.jsx("h2", {
          className: "text-3xl font-bold",
          children: "Check your inbox"
        }), /* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
          className: "text-input-placeholder",
          children: ["We will need the six digit confirmation code you received in your email in order to verify your account and get started. Didn't receive a code?", " ", /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
            type: "button",
            variant: "link",
            className: "text-md h-0",
            children: "Resend now →"
          })]
        })]
      }), /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, {
        control: form.control,
        name: "otp",
        render: ({
          field
        }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, {
          children: [/* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, {
            children: "Confirmation Code"
          }), /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, {
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, {
              ...field
            })
          }), /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})]
        })
      }), /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
        type: "submit",
        className: "w-full h-14",
        children: "Verify"
      }), /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
        className: "text-input-placeholder w-full text-left",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
          to: "/login",
          className: "text-primary-1 text-md hover:underline hover:underline-offset-4",
          children: "← Back to Login"
        })
      })]
    })
  });
}
export {
  OtpForm as default
};
