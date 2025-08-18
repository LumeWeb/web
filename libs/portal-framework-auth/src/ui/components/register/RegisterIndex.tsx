import {
  InlineAuthLinkBanner,
  LumeLogo,
  SchemaForm,
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

import { RegisterFormRequest } from "../../../dataProviders/auth";
import { getRegisterForm } from "../../forms/register";

function RegisterIndex() {
  const register = useRegister<RegisterFormRequest>();

  const onSubmit = async (values: any) => {
    await register.mutateAsync({
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      password: values.password,
    });
  };

  const finalRegisterFormConfig = getRegisterForm(onSubmit);

  return (
    <div className="p-4 h-screen relative">
      <header className="absolute top-4 left-4 sm:left-8">
        <LumeLogo />
      </header>
      <SchemaForm config={finalRegisterFormConfig} />
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
