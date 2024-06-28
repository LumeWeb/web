import { j as jsxRuntimeExports } from "./index-DVnsepjX.js";
import { B as Button } from "./button-CokKPMQs.js";
import { l as logoPng } from "./lume-logo-ChvyOqr_.js";
import { d as discordLogoPng, l as lumeColorLogoPng } from "./discord-logo-aRR5czcd.js";
import { F as Field, a as FieldCheckbox } from "./forms-f-hmn-ie.js";
import { z } from "./index-Ja1h8Z59.js";
import { e as _r, A as At, w as we } from "./index-DajgEckg.js";
import { u as useForm, g as getZodConstraint, p as parseWithZod, a as getFormProps } from "./parse-Bf82GLPO.js";
import { L as Link } from "./components-CpdSlbpj.js";
import "./utils-DrdLlttq.js";
import "./index-AZ_Vndox.js";
import "./index-BPJinGo7.js";
const lumeBgPng = "/assets/lume-bg-register-Cs8gjzis.png";
const meta = () => {
  return [{
    title: "Sign Up"
  }];
};
const RegisterSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters"
  }),
  confirmPassword: z.string().min(8, {
    message: "Password must be at least 8 characters"
  }),
  termsOfService: z.boolean({
    required_error: "You must agree to the terms of service"
  })
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    return ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["confirmPassword"],
      message: "Passwords do not match"
    });
  }
  return true;
});
function Register() {
  const register = _r();
  At();
  we();
  const [form, fields] = useForm({
    id: "register",
    constraint: getZodConstraint(RegisterSchema),
    onValidate({
      formData
    }) {
      return parseWithZod(formData, {
        schema: RegisterSchema
      });
    },
    onSubmit(e) {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.currentTarget).entries());
      register.mutate({
        email: data.email.toString(),
        password: data.password.toString(),
        firstName: data.firstName.toString(),
        lastName: data.lastName.toString()
      });
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    className: "p-10 h-screen relative",
    children: [/* @__PURE__ */ jsxRuntimeExports.jsx("header", {
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
        src: logoPng,
        alt: "Lume logo",
        className: "h-10"
      })
    }), /* @__PURE__ */ jsxRuntimeExports.jsxs("form", {
      className: "w-full p-2 max-w-md space-y-4 mt-12 bg-background",
      ...getFormProps(form),
      children: [/* @__PURE__ */ jsxRuntimeExports.jsxs("span", {
        className: "!mb-12 space-y-2",
        children: [/* @__PURE__ */ jsxRuntimeExports.jsx("h2", {
          className: "text-3xl font-bold",
          children: "All roads lead to Lume"
        }), /* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
          className: "text-input-placeholder",
          children: ["🤘 Get 50 GB free storage and download for free,", " ", /* @__PURE__ */ jsxRuntimeExports.jsx("b", {
            className: "text-foreground",
            children: "forever"
          }), ".", " "]
        })]
      }), /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: "flex gap-4",
        children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Field, {
          className: "flex-1",
          inputProps: {
            name: fields.firstName.name
          },
          labelProps: {
            children: "First Name"
          },
          errors: fields.firstName.errors
        }), /* @__PURE__ */ jsxRuntimeExports.jsx(Field, {
          className: "flex-1",
          inputProps: {
            name: fields.lastName.name
          },
          labelProps: {
            children: "Last Name"
          },
          errors: fields.lastName.errors
        })]
      }), /* @__PURE__ */ jsxRuntimeExports.jsx(Field, {
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
      }), /* @__PURE__ */ jsxRuntimeExports.jsx(Field, {
        inputProps: {
          name: fields.confirmPassword.name,
          type: "password"
        },
        labelProps: {
          children: "Confirm Password"
        },
        errors: fields.confirmPassword.errors
      }), /* @__PURE__ */ jsxRuntimeExports.jsx(FieldCheckbox, {
        inputProps: {
          name: fields.termsOfService.name,
          form: form.id
        },
        labelProps: {
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", {
            children: ["I agree to the", /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
              to: "/terms-of-service",
              className: "text-primary-1 text-md hover:underline hover:underline-offset-4 mx-1",
              children: "Terms of Service"
            }), "and", /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
              to: "/privacy-policy",
              className: "text-primary-1 text-md hover:underline hover:underline-offset-4 mx-1",
              children: "Privacy Policy"
            })]
          })
        },
        errors: fields.termsOfService.errors
      }), /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
        className: "w-full h-14",
        children: "Create Account"
      }), /* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
        className: "text-input-placeholder w-full text-right",
        children: ["Already have an account?", " ", /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
          to: "/login",
          className: "text-primary-1 text-md hover:underline hover:underline-offset-4",
          children: "Login here instead →"
        })]
      })]
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      className: "fixed inset-0 -z-10 overflow-clip",
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
  Register as default,
  meta
};
