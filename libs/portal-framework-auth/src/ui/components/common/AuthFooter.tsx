import {
  discordLogoPng,
  lumeColorLogoPng,
} from "@lumeweb/portal-framework-ui/images";
import React from "react";

interface AuthFooterButtonProps {
  children: React.ReactNode;
  href: string;
  icon: React.ReactNode;
}

export function AuthFooter() {
  return (
    <footer className="my-5">
      <ul className="flex flex-row">
        <AuthFooterButton
          href="https://discord.lumeweb.com"
          icon={
            <img alt="Discord Logo" className="h-5" src={discordLogoPng} />
          }>
          Connect with us
        </AuthFooterButton>
        <AuthFooterButton
          href="https://lumeweb.com"
          icon={<img alt="Lume Logo" className="h-5" src={lumeColorLogoPng} />}>
          Connect with us
        </AuthFooterButton>
      </ul>
    </footer>
  );
}

function AuthFooterButton({ children, href, icon }: AuthFooterButtonProps) {
  return (
    <li>
      <a
        className="focus-visible:ring-ring text-input-placeholder flex h-9 flex-row items-center justify-center gap-x-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50"
        href={href}
        rel="noopener noreferrer"
        target="_blank">
        {icon}
        {children}
      </a>
    </li>
  );
}
