import { LumeLogo, withTheme } from "@lumeweb/portal-framework-ui";
import { Button } from "@lumeweb/portal-framework-ui-core";
import {
  discordLogoPng,
  lumeBgPng,
  lumeColorLogoPng,
} from "@lumeweb/portal-framework-ui/images";
import React from "react";
import "@lumeweb/portal-framework-ui-core/tailwind.css";
import { Link, Outlet } from "react-router";

function ResetPasswordLayout() {
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
          alt="Lume background"
          className="absolute top-0 right-0 md:w-2/3 sm:h-full object-cover z-[-1]"
          src={lumeBgPng}
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

export default withTheme(ResetPasswordLayout);
