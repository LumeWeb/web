import { Link, Outlet } from "@remix-run/react";
import { Button } from "portal-shared/components/ui/button.js";
import lumeBgPng from "portal-shared/images/lume-bg-reset-password.png";
import discordLogoPng from "portal-shared/images/discord-logo.png?url";
import lumeColorLogoPng from "portal-shared/images/lume-color-logo.png?url";
import LumeLogo from "portal-shared/components/LumeLogo";

export default function ResetPasswordLayout() {
  return (
    <div className="h-screen relative">
      <header className="p-4 sm:p-10">
        <LumeLogo />
      </header>

      <div className="flex flex-col items-start max-w-md bg-background">
        <Outlet />
      </div>

      <div className="fixed inset-0 -z-10 overflow-clip">
        <img
          src={lumeBgPng}
          alt="Lume background"
          className="absolute top-0 right-0 md:w-2/3 sm:h-full object-cover z-[-1]"
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
