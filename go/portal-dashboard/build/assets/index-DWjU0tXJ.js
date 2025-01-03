import { j as jsxRuntimeExports } from "./jsx-runtime-CzXAEjbZ.js";
import { B as Button } from "./button-jedbwRXf.js";
import { L as LumeLogo, d as discordLogoPng, l as lumeColorLogoPng } from "./LumeLogo-4oQo6CSC.js";
import { F as Field, a as FieldCheckbox } from "./Forms-BMCjNw47.js";
import { b as io, $ as $t, c as $e } from "./index-xFQL_PNe.js";
import { u as useForm, g as getZodConstraint, p as parseWithZod, a as getFormProps, I as InlineAuthLinkBanner } from "./InlineAuthLinkBanner-BMtX4VOx.js";
import { z } from "./index-BpxO7BrF.js";
import { L as Link } from "./components-D8mYRm61.js";
import "./lume-logo-ChvyOqr_.js";
import "./input-Sza_mO8a.js";
import "./react-icons.esm-o-P2jf_4.js";
import "./index-COfyDwxK.js";
import "./index-DpbAjMft.js";
import "./index-DSJ5IsRY.js";
import "./index-CJ8FhmRo.js";
import "./index-DdpwiKzx.js";
import "./textarea-CO5zMSog.js";
import "./index-QWRrEtKK.js";
import "./index-5ukv8M2q.js";
const lumeBgPng = "/assets/lume-bg-register-Cs8gjzis.png";
const RegisterSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
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
const meta = () => {
  return [{
    title: "Sign Up"
  }];
};
function Register() {
  const register = io();
  $t();
  $e();
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
    className: "p-4 h-screen relative",
    children: [/* @__PURE__ */ jsxRuntimeExports.jsx("header", {
      className: "absolute top-4 left-4 sm:left-8",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(LumeLogo, {})
    }), /* @__PURE__ */ jsxRuntimeExports.jsxs("form", {
      className: "w-full p-2 max-w-md space-y-4 mt-14 sm:bg-background",
      ...getFormProps(form),
      children: [/* @__PURE__ */ jsxRuntimeExports.jsx("span", {
        className: " space-y-2",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", {
          className: "text-4xl sm:text-3xl",
          children: "All Roads Lead to Lume"
        })
      }), /* @__PURE__ */ jsxRuntimeExports.jsx(InlineAuthLinkBanner, {
        to: "/login",
        label: "Already have an account?"
      }), /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: "mt-10",
        children: [/* @__PURE__ */ jsxRuntimeExports.jsx("h3", {
          className: " block  sm:hidden text-2xl text-foreground mb-10",
          children: "Create a New Account"
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
              className: "text-sm",
              children: ["I agree to the", /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
                to: "/terms-of-service",
                className: "text-foreground underline mx-1",
                children: "Terms of Service"
              }), "and", /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
                to: "/privacy-policy",
                className: "text-foreground underline mx-1",
                children: "Privacy Policy"
              })]
            })
          },
          errors: fields.termsOfService.errors
        }), /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
          className: " w-full h-14",
          children: "Create Account"
        })]
      })]
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      className: "h-1/3 sm:h-full fixed inset-0 -z-10 overflow-clip",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
        src: lumeBgPng,
        alt: "Lume background",
        className: "absolute top-0 right-0 md:w-2/3 w-full sm:h-full object-cover z-[-1]"
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
