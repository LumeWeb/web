import {
  InlineAuthLinkBanner,
  LumeLogo,
  useFeatureFlag,
  useRegisterUrl,
  withTheme,
} from "@lumeweb/portal-framework-ui";
import { Button } from "@lumeweb/portal-framework-ui-core";
import {
  discordLogoPng,
  lumeBgLoginPng,
  lumeColorLogoPng,
} from "@lumeweb/portal-framework-ui/images";
import React from "react";
import { Link } from "react-router";

import { LoginForm } from "./LoginForm";
import { SocialLogin } from "./SocialLogin";
import "@lumeweb/portal-framework-ui-core/tailwind.css";

function LoginIndex() {
  const showRegister = true;
  const socialLoginEnabled = useFeatureFlag("social_login");
  const registerUrl = useRegisterUrl();
  return (
    <div className="h-screen relative sm:overflow-hidden">
      <div className="flex flex-col sm:flex-row-reverse items-center justify-center w-full h-full">
        <header className="absolute z-50 top-4 left-4 sm:left-8">
          <LumeLogo />
        </header>
        <div className="relative w-full h-full ">
          <img
            alt="Lume background"
            className="w-full sm:h-full object-cover"
            src={lumeBgLoginPng}
          />
          <div className="absolute inset-0 flex sm:hidden flex-col items-start justify-center gap-2 text-left p-4 mt-60 sm:mt-10 ">
            <h2 className="text-4xl sm:text-3xl font-bold">Welcome back</h2>
            {showRegister && (
              <InlineAuthLinkBanner
                label="New user?"
                linkLabel="Create an account →"
                to={registerUrl}
              />
            )}
          </div>
        </div>
        {socialLoginEnabled && <SocialLogin />}
        <div className="flex flex-col items-start justify-start bg-background w-full sm:max-w-md ">
          <div className="sm:mt-20 p-4 sm:p-10">
            <div className="hidden sm:flex flex-col items-start justify-center gap-2 text-left mb-10">
              <h2 className="text-4xl mb-2">Welcome back</h2>
              {showRegister && (
                <InlineAuthLinkBanner
                  label="New user?"
                  linkLabel="Create an account →"
                  to={registerUrl}
                />
              )}
            </div>
            <LoginForm />
            <footer className="my-5">
              <ul className="flex flex-row sm:flex-row gap-4">
                <li>
                  <Link to="https://discord.lumeweb.com">
                    <Button
                      className="flex flex-row gap-x-2 text-input-placeholder"
                      variant="link">
                      <img
                        alt="Discord Logo"
                        className="h-5"
                        src={discordLogoPng}
                      />
                      Connect with us
                    </Button>
                  </Link>
                </li>
                <li>
                  <Link to="https://lumeweb.com">
                    <Button
                      className="flex flex-row gap-x-2 text-input-placeholder"
                      variant="link">
                      <img
                        alt="Lume Logo"
                        className="h-5"
                        src={lumeColorLogoPng}
                      />
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

export default withTheme(LoginIndex);
