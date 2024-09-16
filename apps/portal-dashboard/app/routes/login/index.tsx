import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Button } from "@/components/ui/button.js";
import lumeColorLogoPng from "@/images/lume-color-logo.png?url";
import discordLogoPng from "@/images/discord-logo.png?url";
import lumeBgPng from "@/images/lume-bg-login.png?url";
import InlineAuthLinkBanner from "@/components/InlineAuthLinkBanner";
import LumeLogo from "@/components/LumeLogo.js";
import { LoginForm } from "@/routes/login/components/LoginForm";
import SocialLogin from "@/routes/login/components/SocialLogin";
import useFeatureFlag from "@/hooks/useFeatureFlag";

export const meta: MetaFunction = () => {
  return [
    { title: "Login" },
    { name: "description", content: "Welcome to Lume!" },
  ];
};

export default function Login() {
  const socialLoginEnabled = useFeatureFlag("social_login");
  return (
    <div className="h-screen relative sm:overflow-hidden">
      <div className="flex flex-col sm:flex-row-reverse items-center justify-center w-full h-full">
        <header className="absolute z-50 top-4 left-4 sm:left-8">
          <LumeLogo />
        </header>
        <div className="relative w-full h-full ">
          <img
            src={lumeBgPng}
            alt="Lume background"
            className="w-full sm:h-full object-cover"
          />
          <div className="absolute inset-0 flex sm:hidden flex-col items-start justify-center gap-2 text-left p-4 mt-60 sm:mt-10 ">
            <h2 className="text-4xl sm:text-3xl font-bold">Welcome back</h2>
            <InlineAuthLinkBanner
              to="/register"
              label="New user?"
              linkLabel="Create an account →"
            />
          </div>
        </div>{" "}
        {socialLoginEnabled && <SocialLogin />}
        <div className="flex flex-col items-start justify-start bg-background w-full sm:max-w-md ">
          <div className="sm:mt-20 p-4 sm:p-10">
            <div className="hidden sm:flex flex-col items-start justify-center gap-2 text-left mb-10">
              <h2 className="text-4xl mb-2">Welcome back</h2>
              <InlineAuthLinkBanner
                to="/register"
                label="New user?"
                linkLabel="Create an account →"
              />
            </div>
            <LoginForm />
            <footer className="my-5">
              <ul className="flex flex-row sm:flex-row gap-4">
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
                      <img
                        className="h-5"
                        src={lumeColorLogoPng}
                        alt="Lume Logo"
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
