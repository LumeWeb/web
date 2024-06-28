import { j as jsxRuntimeExports } from "./index-D_nKaDFf.js";
import { B as Button } from "./button-C80IS_oC.js";
import { L as LumeLogo, d as discordLogoPng, l as lumeColorLogoPng } from "./lume-logo-JlLg43OR.js";
import { F as Field } from "./forms-Ckmp4BMS.js";
import { z } from "./index-D6hcoGBN.js";
import { f as ToastAction } from "./toast-BRtHcHLh.js";
import { w as we } from "./index-PvxHHzOq.js";
import { u as useForm, g as getZodConstraint, p as parseWithZod, a as getFormProps } from "./parse-BXCwHSH6.js";
import { L as Link } from "./components-BjLx0zCB.js";
import "./utils-Cugm_gHJ.js";
import "./lume-logo-ChvyOqr_.js";
import "./index-DTpHO9Dm.js";
import "./index-reyVn01_.js";
import "./index-CnnG_NQj.js";
const lumeBgPng = "/assets/lume-bg-reset-password-BttR11xa.png";
const meta = () => {
  return [{
    title: "Sign Up"
  }];
};
const RecoverPasswordSchema = z.object({
  email: z.string().email()
});
function RecoverPassword() {
  const {
    open
  } = we();
  const [form, fields] = useForm({
    id: "sign-up",
    constraint: getZodConstraint(RecoverPasswordSchema),
    onValidate({
      formData
    }) {
      return parseWithZod(formData, {
        schema: RecoverPasswordSchema
      });
    },
    onSubmit(e) {
      e.preventDefault();
      open == null ? void 0 : open({
        type: "success",
        message: "Password reset email sent",
        description: "Check your email for a link to reset your password. If it doesn’t appear within a few minutes, check your spam folder.",
        action: /* @__PURE__ */ jsxRuntimeExports.jsx(ToastAction, {
          altText: "Cancel",
          children: "Cancel"
        }),
        cancelMutation: () => {
          console.log("cancel mutation");
        }
      });
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    className: " h-screen relative",
    children: [/* @__PURE__ */ jsxRuntimeExports.jsx("header", {
      className: "p-4 sm:p-10",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(LumeLogo, {})
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      className: "flex flex-col items-start max-w-md bg-background",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", {
        className: "w-full h-full  p-4 sm:p-10 space-y-4 mt-12 ",
        ...getFormProps(form),
        children: [/* @__PURE__ */ jsxRuntimeExports.jsx("p", {
          className: "text-input-placeholder w-full text-left mb-10",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
            to: "/login",
            className: "text-foreground text-md hover:underline hover:underline-offset-4",
            children: "← Back to Login"
          })
        }), /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
          className: "!mb-12 space-y-2",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", {
            className: "text-3xl font-bold",
            children: "Reset your password"
          })
        }), /* @__PURE__ */ jsxRuntimeExports.jsx(Field, {
          inputProps: {
            name: fields.email.name
          },
          labelProps: {
            children: "Email Address"
          },
          errors: fields.email.errors
        }), /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
          className: "w-full h-14",
          children: "Reset Password"
        })]
      })
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      className: "fixed inset-0 -z-10 overflow-clip ",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
        src: lumeBgPng,
        alt: "Lume background",
        className: "absolute top-0 right-0 md:w-2/3 sm:h-full object-cover z-[-1]"
      })
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("footer", {
      className: "my-5",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", {
        className: "flex flex-row",
        children: [/* @__PURE__ */ jsxRuntimeExports.jsx("li", {
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
            to: "https://discord.lumeweb.com",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, {
              variant: "link",
              className: "flex flex-row gap-x-2 text-input-placeholder",
              children: [/* @__PURE__ */ jsxRuntimeExports.jsx("img", {
                className: "h-5",
                src: discordLogoPng,
                alt: "Discord Logo"
              }), "Connect with us"]
            })
          })
        }), /* @__PURE__ */ jsxRuntimeExports.jsx("li", {
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
            to: "https://lumeweb.com",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, {
              variant: "link",
              className: "flex flex-row gap-x-2 text-input-placeholder",
              children: [/* @__PURE__ */ jsxRuntimeExports.jsx("img", {
                className: "h-5",
                src: lumeColorLogoPng,
                alt: "Lume Logo"
              }), "Connect with us"]
            })
          })
        })]
      })
    })]
  });
}
export {
  RecoverPassword as default,
  meta
};
