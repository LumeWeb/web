import { Link } from "@remix-run/react";
import React from "react";
import { CircleLockIcon, ClockIcon, DriveIcon } from "../icons";
import LumeLogo from "~/components/LumeLogo";
import NavigationButton from "~/components/NavigationButton";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";

const navigationLinks = [
  { path: "/dashboard", label: "Dashboard", icon: ClockIcon },
  { path: "/cron", label: "Cron", icon: ClockIcon },
];

export default function DesktopSidebar() {
  return (
    <header className="p-10 pr-0 flex flex-col w-[240px] h-full scroll-m-0 overflow-hidden">
      <LumeLogo />
      <nav className="my-10 flex-1">
        {navigationLinks.map((link) => (
          <Link key={link.path} to={link.path}>
            <NavigationButton active={location.pathname.includes(link.path)}>
              {link.icon && <link.icon className="w-5 h-5 mr-2" />}
              {link.label}
            </NavigationButton>
          </Link>
        ))}
      </nav>
      <span className="text-foreground/60 mb-3 space-y-1 ">
        <p>Freedom</p>
        <p>Privacy</p>
        <p>Ownership</p>
      </span>
    </header>
  );
}
