import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { useLogin, useNotification, useRegister } from "@refinedev/core";
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { z } from "zod";
import { CssThemeableBg } from "~/components/css-themeable-bg";
import { Field, FieldCheckbox } from "~/components/forms";
import InlineAuthLinkBanner from "~/components/inline-auth-link-banner";
import LumeLogo from "~/components/lume-logo";
import { Button } from "~/components/ui/button";
import type {
  AuthFormRequest,
  RegisterFormRequest,
} from "~/data/auth-provider.js";
import { ThemeSwitcher } from "~/hooks/useTheme";
import discordLogoPng from "~/images/discord-logo.png?url";
import lumeColorLogoPng from "~/images/lume-color-logo.png?url";

export const meta: MetaFunction = () => {
  return [{ title: "Sign Up" }];
};

const RegisterSchema = z
  .object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    termsOfService: z.boolean({
      required_error: "You must agree to the terms of service",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      return ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
    return true;
  });

export default function Register() {
  const register = useRegister<RegisterFormRequest>();
  const login = useLogin<AuthFormRequest>();
  const { open } = useNotification();
  const [form, fields] = useForm({
    id: "register",
    constraint: getZodConstraint(RegisterSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: RegisterSchema });
    },
    onSubmit(e) {
      e.preventDefault();

      const data = Object.fromEntries(new FormData(e.currentTarget).entries());
      register.mutate({
        email: data.email.toString(),
        password: data.password.toString(),
        firstName: data.firstName.toString(),
        lastName: data.lastName.toString(),
      });
    },
  });

  return (
    <div className="p-4 h-screen flex flex-col lg:justify-center relative">
      <header className="absolute top-0 left-0 md:left-4 flex flex-row justify-between w-full p-8 lg:p-4">
        <LumeLogo />
        <ThemeSwitcher />
      </header>
      <form
        className="w-full p-4 lg:p-10 max-w-md mt-14 sm:bg-background"
        {...getFormProps(form)}>
        <span className="space-y-4 block">
          <h2 className="text-4xl sm:text-3xl font-medium">
            All Roads Lead to Lume
          </h2>
          <p className="text-foreground">
            🤘 Get 50 GB free storage and download for free,{" "}
            <b className="text-foreground">forever</b>.{" "}
          </p>
          <InlineAuthLinkBanner to="/login" label="Already have an account?" />
        </span>
        <div className="mt-6 lg:mt-10">
          <h3 className="block sm:hidden text-2xl text-foreground mb-10">
            Create a New Account
          </h3>
          <div className="flex gap-4">
            <Field
              className="flex-1"
              inputProps={{ name: fields.firstName.name }}
              labelProps={{ children: "First Name" }}
              errors={fields.firstName.errors}
            />
            <Field
              className="flex-1"
              inputProps={{ name: fields.lastName.name }}
              labelProps={{ children: "Last Name" }}
              errors={fields.lastName.errors}
            />
          </div>
          <Field
            inputProps={{ name: fields.email.name }}
            labelProps={{ children: "Email" }}
            errors={fields.email.errors}
          />
          <Field
            inputProps={{ name: fields.password.name, type: "password" }}
            labelProps={{ children: "Password" }}
            errors={fields.password.errors}
          />
          <Field
            inputProps={{ name: fields.confirmPassword.name, type: "password" }}
            labelProps={{ children: "Confirm Password" }}
            errors={fields.confirmPassword.errors}
          />
          <FieldCheckbox
            inputProps={{ name: fields.termsOfService.name, form: form.id }}
            labelProps={{
              children: (
                <span className="text-sm">
                  I agree to the
                  <Link
                    to="/terms-of-service"
                    className="text-foreground underline mx-1">
                    Terms of Service
                  </Link>
                  and
                  <Link
                    to="/privacy-policy"
                    className="text-foreground underline mx-1">
                    Privacy Policy
                  </Link>
                </span>
              ),
            }}
            errors={fields.termsOfService.errors}
          />
          <Button className=" w-full h-14">Create Account</Button>
        </div>
        <footer className="my-5">
          <ul className="flex flex-row">
            <li>
              <Link to="https://discord.lumeweb.com">
                <Button
                  variant={"link"}
                  className="flex flex-row gap-x-2 text-input-placeholder">
                  <img
                    className="h-5"
                    src={discordLogoPng}
                    alt="Discord Logo"
                  />
                  Connect with us
                </Button>
              </Link>
            </li>
            <li>
              <Link to="https://lumeweb.com">
                <Button
                  variant={"link"}
                  className="flex flex-row gap-x-2 text-input-placeholder">
                  <img className="h-5" src={lumeColorLogoPng} alt="Lume Logo" />
                  Connect with us
                </Button>
              </Link>
            </li>
          </ul>
        </footer>
      </form>
      <CssThemeableBg
        varName="--lume-bg-register"
        className="h-1/3 lg:w-auto lg:h-1/3"
      />
    </div>
  );
}
