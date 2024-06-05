import { r as reactExports, j as jsxRuntimeExports } from "./index-BIsqO_uY.js";
import { f as fr, g as ge, d as ae } from "./index-Cb6cVh9L.js";
import { u as useForm, g as getZodConstraint, p as parseWithZod, a as getFormProps, z } from "./parse-C3g2df8G.js";
import { F as Field } from "./forms-uCsZ1COU.js";
import { B as Button } from "./button-CM1o2_Dc.js";
import { L as Link } from "./components-C01XGMk1.js";
import "./utils-Hh79uNMy.js";
import "./index-CVPXomLy.js";
import "./index-BVHF9LaM.js";
const OtpSchema = z.object({
  otp: z.string().length(6, {
    message: "OTP must be 6 characters"
  })
});
function OtpForm() {
  var _a;
  const {
    isLoading: isAuthLoading,
    data: authData
  } = fr();
  const go = ge();
  const parsed = ae();
  const [form, fields] = useForm({
    id: "otp",
    constraint: getZodConstraint(OtpSchema),
    onValidate({
      formData
    }) {
      return parseWithZod(formData, {
        schema: OtpSchema
      });
    },
    shouldValidate: "onSubmit"
  });
  const valid = true;
  const to = ((_a = parsed.params) == null ? void 0 : _a.to) ?? "/dashboard";
  reactExports.useEffect(() => {
    if (!isAuthLoading) {
      if ((authData == null ? void 0 : authData.authenticated) && valid) {
        go({
          to,
          type: "push"
        });
      }
    }
  }, [isAuthLoading, authData, to, go]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", {
    className: "w-full p-2 max-w-md mt-12 bg-background",
    ...getFormProps(form),
    children: [/* @__PURE__ */ jsxRuntimeExports.jsxs("span", {
      className: "block !mb-8 space-y-2",
      children: [/* @__PURE__ */ jsxRuntimeExports.jsx("h2", {
        className: "text-3xl font-bold",
        children: "Check your inbox"
      }), /* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
        className: "text-input-placeholder",
        children: ["We will need the six digit confirmation code you received in your email in order to verify your account and get started. Didn’t receive a code?", " ", /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
          type: "button",
          variant: "link",
          className: "text-md h-0",
          children: "Resend now →"
        })]
      })]
    }), /* @__PURE__ */ jsxRuntimeExports.jsx(Field, {
      inputProps: {
        name: fields.otp.name
      },
      labelProps: {
        children: "Confirmation Code"
      },
      errors: fields.otp.errors
    }), /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
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
  });
}
export {
  OtpForm as default
};
