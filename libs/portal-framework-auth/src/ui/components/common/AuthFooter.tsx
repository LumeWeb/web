import { discordLogoPng, lumeColorLogoPng } from "@lumeweb/portal-framework-ui/images";
import React from "react";

interface AuthFooterButtonProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function AuthFooterButton({ href, icon, children }: AuthFooterButtonProps) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 underline-offset-4 hover:underline flex flex-row gap-x-2 text-input-placeholder"
      >
        {icon}
        {children}
      </a>
    </li>
  );
}

export function AuthFooter() {
  return (
    <footer className="my-5">
      <ul className="flex flex-row">
        <AuthFooterButton
          href="https://discord.lumeweb.com"
          icon={<img alt="Discord Logo" className="h-5" src={discordLogoPng} />}
        >
          Connect with us
        </AuthFooterButton>
        <AuthFooterButton
          href="https://lumeweb.com"
          icon={<img alt="Lume Logo" className="h-5" src={lumeColorLogoPng} />}
        >
          Connect with us
        </AuthFooterButton>
      </ul>
    </footer>
  );
}
