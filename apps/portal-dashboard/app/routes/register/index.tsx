import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Button } from "@/components/ui/button";
import lumeColorLogoPng from "@/images/lume-color-logo.png?url";
import discordLogoPng from "@/images/discord-logo.png?url";
import lumeBgPng from "@/images/lume-bg-register.png?url";
import { Field, FieldCheckbox } from "@/components/Forms";
import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { useLogin, useNotification, useRegister } from "@refinedev/core";
import {
  AuthFormRequest,
  RegisterFormRequest,
} from "@/dataProviders/authProvider.js";
import InlineAuthLinkBanner from "@/components/InlineAuthLinkBanner";
import LumeLogo from "@/components/LumeLogo";
import { RegisterSchema } from "@/routes/register/schema";

export const meta: MetaFunction = () => {
  return [{ title: "Sign Up" }];
};

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
    <div className="p-4 h-screen relative">
      <header className="absolute top-4 left-4 sm:left-8">
        <LumeLogo />
      </header>
      <form
        className="w-full p-2 max-w-md space-y-4 mt-14 sm:bg-background"
        {...getFormProps(form)}>
        <span className=" space-y-2">
          <h2 className="text-4xl sm:text-3xl">All Roads Lead to Lume</h2>
          <p className="text-foreground mt-4">
            🤘 Get 50 GB free storage and download for free,{" "}
            <b className="text-foreground">forever</b>.{" "}
          </p>
        </span>
        <InlineAuthLinkBanner to="/login" label="Already have an account?" />
        <div className="mt-10">
          <h3 className=" block  sm:hidden text-2xl text-foreground mb-10">
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
      </form>
      <div className="h-1/3 sm:h-full fixed inset-0 -z-10 overflow-clip">
        <img
          src={lumeBgPng}
          alt="Lume background"
          className="absolute top-0 right-0 md:w-2/3 w-full sm:h-full object-cover z-[-1]"
        />
      </div>
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
