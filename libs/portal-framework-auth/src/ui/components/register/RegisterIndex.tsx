import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  Field,
  FieldCheckbox,
  InlineAuthLinkBanner,
  LumeLogo,
  withTheme,
} from "@lumeweb/portal-framework-ui";
import { Button } from "@lumeweb/portal-framework-ui-core";
import {
  discordLogoPng,
  lumeBgRegisterPng,
  lumeColorLogoPng,
} from "@lumeweb/portal-framework-ui/images";
import { useRegister } from "@refinedev/core";
import React from "react";
import { Link } from "react-router";
import "@lumeweb/portal-framework-ui-core/tailwind.css";

import { RegisterFormRequest } from "../../../dataProviders/auth";
import { RegisterSchema } from "./schema";

function RegisterIndex() {
  const register = useRegister<RegisterFormRequest>();
  const [form, fields] = useForm({
    constraint: getZodConstraint(RegisterSchema),
    id: "register",
    onSubmit(e) {
      e.preventDefault();

      // @ts-ignore
      const data = Object.fromEntries(new FormData(e.currentTarget).entries());
      register.mutate({
        email: data.email.toString(),
        firstName: data.firstName.toString(),
        lastName: data.lastName.toString(),
        password: data.password.toString(),
      });
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: RegisterSchema });
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
        </span>
        <InlineAuthLinkBanner label="Already have an account?" to="/login" />
        <div className="mt-10">
          <h3 className=" block  sm:hidden text-2xl text-foreground mb-10">
            Create a New Account
          </h3>
          <div className="flex gap-4">
            <Field
              className="flex-1"
              errors={fields.firstName.errors}
              inputProps={{ name: fields.firstName.name }}
              labelProps={{ children: "First Name" }}
            />
            <Field
              className="flex-1"
              errors={fields.lastName.errors}
              inputProps={{ name: fields.lastName.name }}
              labelProps={{ children: "Last Name" }}
            />
          </div>
          <Field
            errors={fields.email.errors}
            inputProps={{ name: fields.email.name }}
            labelProps={{ children: "Email" }}
          />
          <Field
            errors={fields.password.errors}
            inputProps={{ name: fields.password.name, type: "password" }}
            labelProps={{ children: "Password" }}
          />
          <Field
            errors={fields.confirmPassword.errors}
            inputProps={{ name: fields.confirmPassword.name, type: "password" }}
            labelProps={{ children: "Confirm Password" }}
          />
          <FieldCheckbox
            errors={fields.termsOfService.errors}
            inputProps={{ form: form.id, name: fields.termsOfService.name }}
            labelProps={{
              children: (
                <span className="text-sm">
                  I agree to the
                  <Link
                    className="text-foreground underline mx-1"
                    to="/terms-of-service">
                    Terms of Service
                  </Link>
                  and
                  <Link
                    className="text-foreground underline mx-1"
                    to="/privacy-policy">
                    Privacy Policy
                  </Link>
                </span>
              ),
            }}
          />
          <Button className=" w-full h-14">Create Account</Button>
        </div>
      </form>
      <div className="h-1/3 sm:h-full fixed inset-0 -z-10 overflow-clip">
        <img
          alt="Lume background"
          className="absolute top-0 right-0 md:w-2/3 w-full sm:h-full object-cover z-[-1]"
          src={lumeBgRegisterPng}
        />
      </div>
      <footer className="my-5">
        <ul className="flex flex-row">
          <li>
            <Link to="https://discord.lumeweb.com">
              <Button
                className="flex flex-row gap-x-2 text-input-placeholder"
                variant={"link"}>
                <img alt="Discord Logo" className="h-5" src={discordLogoPng} />
                Connect with us
              </Button>
            </Link>
          </li>
          <li>
            <Link to="https://lumeweb.com">
              <Button
                className="flex flex-row gap-x-2 text-input-placeholder"
                variant={"link"}>
                <img alt="Lume Logo" className="h-5" src={lumeColorLogoPng} />
                Connect with us
              </Button>
            </Link>
          </li>
        </ul>
      </footer>
    </div>
  );
}

export default withTheme(RegisterIndex);
