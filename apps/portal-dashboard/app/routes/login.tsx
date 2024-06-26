import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import lumeColorLogoPng from "~/images/lume-color-logo.png?url";
import discordLogoPng from "~/images/discord-logo.png?url";
import lumeBgPng from "~/images/lume-bg-login.png?url";
import { Field, FieldCheckbox } from "~/components/forms";
import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  useGo,
  useLogin,
  useParsed,
} from "@refinedev/core";
import type { AuthFormRequest } from "~/data/auth-provider";
import { useEffect } from "react";
import InlineAuthLinkBanner from "~/components/inline-auth-link-banner";
import LumeLogo from "~/components/lume-logo";

export const meta: MetaFunction = () => {
  return [
    { title: "Login" },
    { name: "description", content: "Welcome to Lume!" },
  ];
};

export type LoginParams = {
  to: string;
};

export default function Login() {
  return (
    <div className="h-screen relative sm:overflow-hidden">
      <div className="flex flex-col sm:flex-row-reverse items-center justify-center w-full h-full">
        <header
          className="absolute z-50 top-4 left-4 sm:left-8"
        >
          <LumeLogo />
        </header>
        <div className="relative w-full h-full ">
          <img
            src={lumeBgPng}
            alt="Lume background"
            className="w-full sm:h-full object-cover"
          />
          <div className="absolute inset-0 flex sm:hidden flex-col items-start justify-center gap-2 text-left p-4 mt-60 sm:mt-10 ">
            <h2 className="text-4xl sm:text-3xl font-bold">
              Welcome back
            </h2>
            <InlineAuthLinkBanner to="/register" label="New user?" linkLabel="Create an account →" />
          </div>
        </div>
        <div className="flex flex-col items-start justify-start bg-background w-full sm:max-w-md ">
          <div className="sm:mt-20 p-4 sm:p-10">
            <div className="hidden sm:flex flex-col items-start justify-center gap-2 text-left mb-10">
              <h2 className="text-4xl mb-2">
                Welcome back
              </h2>
              <InlineAuthLinkBanner to="/register" label="New user?" linkLabel="Create an account →" />
            </div>
            <LoginForm />
            <footer className="my-5">
              <ul className="flex flex-row sm:flex-row gap-4">
                <li>
                  <Link to="https://discord.lumeweb.com">
                    <Button
                      variant={"link"}
                      className="flex flex-row gap-x-2 text-input-placeholder">
                      <img className="h-5" src={discordLogoPng} alt="Discord Logo" />
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
                      Learn about Lume
                    </Button>
                  </Link>
                </li>
              </ul>
            </footer>
          </div>
        </div>

      </div>
    </div>
  );
}

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  rememberMe: z.boolean().optional(),
});

const LoginForm = () => {
  const login = useLogin<AuthFormRequest>();
  const go = useGo();
  const parsed = useParsed<LoginParams>();
  const [form, fields] = useForm({
    id: "login",
    constraint: getZodConstraint(LoginSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: LoginSchema });
    },
    shouldValidate: "onSubmit",
    onSubmit(e, { submission }) {
      e.preventDefault();

      if (submission?.status === "success") {
        const data = submission.value;
        login.mutate({
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe ?? false,
          redirectTo: parsed.params?.to,
        });
      }
    },
  });

  useEffect(() => {
    if (form.status === "success") {
      go({ to: "/login/otp", type: "push" });
    }
  }, [form.status, go]);

  return (
    <form
      className="w-full max-w-md "
      {...getFormProps(form)}>
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
      <FieldCheckbox
        inputProps={{ name: fields.rememberMe.name, form: form.id }}
        labelProps={{ children: "Remember Me" }}
        errors={fields.rememberMe.errors}
      />
      <Button className="w-full h-14">Login</Button>
      <p className="inline-block mt-4 text-input-placeholder">
        Forgot your password?{" "}
        <Link
          to="/reset-password"
          className="text-foreground text-md hover:underline hover:underline-offset-4">
          Reset Password
        </Link>
      </p>
    </form>
  );
};
