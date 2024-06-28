import { j as jsxRuntimeExports, r as reactExports } from "./index-D_nKaDFf.js";
import { z } from "./index-D6hcoGBN.js";
import { B as Button } from "./button-C80IS_oC.js";
import { L as LumeLogo, d as discordLogoPng, l as lumeColorLogoPng } from "./lume-logo-JlLg43OR.js";
import { F as Field, a as FieldCheckbox } from "./forms-Ckmp4BMS.js";
import { A as At, g as ge, f as ae } from "./index-PvxHHzOq.js";
import { I as InlineAuthLinkBanner } from "./inline-auth-link-banner-DN4KLAR_.js";
import { L as Link } from "./components-BjLx0zCB.js";
import { u as useForm, g as getZodConstraint, p as parseWithZod, a as getFormProps } from "./parse-BXCwHSH6.js";
import "./utils-Cugm_gHJ.js";
import "./lume-logo-ChvyOqr_.js";
import "./index-DTpHO9Dm.js";
import "./index-reyVn01_.js";
const lumeBgPng = "/assets/lume-bg-login-ClkbcaVZ.png";
const meta = () => {
  return [{
    title: "Login"
  }, {
    name: "description",
    content: "Welcome to Lume!"
  }];
};
function Login() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    className: "h-screen relative sm:overflow-hidden",
    children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      className: "flex flex-col sm:flex-row-reverse items-center justify-center w-full h-full",
      children: [/* @__PURE__ */ jsxRuntimeExports.jsx("header", {
        className: "absolute z-50 top-4 left-4 sm:left-8",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(LumeLogo, {})
      }), /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: "relative w-full h-full ",
        children: [/* @__PURE__ */ jsxRuntimeExports.jsx("img", {
          src: lumeBgPng,
          alt: "Lume background",
          className: "w-full sm:h-full object-cover"
        }), /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className: "absolute inset-0 flex sm:hidden flex-col items-start justify-center gap-2 text-left p-4 mt-60 sm:mt-10 ",
          children: [/* @__PURE__ */ jsxRuntimeExports.jsx("h2", {
            className: "text-4xl sm:text-3xl font-bold",
            children: "Welcome back"
          }), /* @__PURE__ */ jsxRuntimeExports.jsx(InlineAuthLinkBanner, {
            to: "/register",
            label: "New user?",
            linkLabel: "Create an account →"
          })]
        })]
      }), /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className: "flex flex-col items-start justify-start bg-background w-full sm:max-w-md ",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className: "sm:mt-20 p-4 sm:p-10",
          children: [/* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className: "hidden sm:flex flex-col items-start justify-center gap-2 text-left mb-10",
            children: [/* @__PURE__ */ jsxRuntimeExports.jsx("h2", {
              className: "text-4xl mb-2",
              children: "Welcome back"
            }), /* @__PURE__ */ jsxRuntimeExports.jsx(InlineAuthLinkBanner, {
              to: "/register",
              label: "New user?",
              linkLabel: "Create an account →"
            })]
          }), /* @__PURE__ */ jsxRuntimeExports.jsx(LoginForm, {}), /* @__PURE__ */ jsxRuntimeExports.jsx("footer", {
            className: "my-5",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", {
              className: "flex flex-row sm:flex-row gap-4",
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
                    }), "Learn about Lume"]
                  })
                })
              })]
            })
          })]
        })
      })]
    })
  });
}
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  rememberMe: z.boolean().optional()
});
const LoginForm = () => {
  const login = At();
  const go = ge();
  const parsed = ae();
  const [form, fields] = useForm({
    id: "login",
    constraint: getZodConstraint(LoginSchema),
    onValidate({
      formData
    }) {
      return parseWithZod(formData, {
        schema: LoginSchema
      });
    },
    shouldValidate: "onSubmit",
    onSubmit(e, {
      submission
    }) {
      var _a;
      e.preventDefault();
      if ((submission == null ? void 0 : submission.status) === "success") {
        const data = submission.value;
        login.mutate({
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe ?? false,
          redirectTo: (_a = parsed.params) == null ? void 0 : _a.to
        });
      }
    }
  });
  reactExports.useEffect(() => {
    if (form.status === "success") {
      go({
        to: "/login/otp",
        type: "push"
      });
    }
  }, [form.status, go]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", {
    className: "w-full max-w-md ",
    ...getFormProps(form),
    children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Field, {
      inputProps: {
        name: fields.email.name
      },
      labelProps: {
        children: "Email"
      },
      errors: fields.email.errors
    }), /* @__PURE__ */ jsxRuntimeExports.jsx(Field, {
      inputProps: {
        name: fields.password.name,
        type: "password"
      },
      labelProps: {
        children: "Password"
      },
      errors: fields.password.errors
    }), /* @__PURE__ */ jsxRuntimeExports.jsx(FieldCheckbox, {
      inputProps: {
        name: fields.rememberMe.name,
        form: form.id
      },
      labelProps: {
        children: "Remember Me"
      },
      errors: fields.rememberMe.errors
    }), /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
      className: "w-full h-14",
      children: "Login"
    }), /* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
      className: "inline-block mt-4 text-input-placeholder",
      children: ["Forgot your password?", " ", /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
        to: "/reset-password",
        className: "text-foreground text-md hover:underline hover:underline-offset-4",
        children: "Reset Password"
      })]
    })]
  });
};
export {
  Login as default,
  meta
};
