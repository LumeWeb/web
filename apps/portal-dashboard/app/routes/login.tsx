import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import logoPng from "~/images/lume-logo.png?url";
import lumeColorLogoPng from "~/images/lume-color-logo.png?url";
import discordLogoPng from "~/images/discord-logo.png?url";
import lumeBgPng from "~/images/lume-bg-image.png?url";
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
    <div className="p-10 h-screen relative">
      <header>
        <img src={logoPng} alt="Lume logo" className="h-10" />
      </header>
      <div className="fixed inset-0 -z-10 overflow-clip">
        <img
          src={lumeBgPng}
          alt="Lume background"
          className="absolute top-0 right-0 md:w-2/3 object-cover z-[-1]"
        />
      </div>

      <LoginForm />

      <footer className="my-5">
        <ul className="flex flex-row">
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
                Connect with us
              </Button>
            </Link>
          </li>
        </ul>
      </footer>
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
      className="w-full p-2 max-w-md space-y-3 mt-12 bg-background"
      {...getFormProps(form)}>
      <h2 className="text-3xl font-bold !mb-12">Welcome back! 🎉</h2>
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
      <p className="inline-block text-input-placeholder">
        Forgot your password?{" "}
        <Link
          to="/reset-password"
          className="text-primary-1 text-md hover:underline hover:underline-offset-4">
          Reset Password
        </Link>
      </p>
      <Link to="/register" className="block">
        <Button type="button" className="w-full h-14" variant={"outline"}>
          Create an Account
        </Button>
      </Link>
    </form>
  );
};
