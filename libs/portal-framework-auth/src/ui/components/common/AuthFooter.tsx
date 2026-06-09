import {
  discordLogoPng,
  lumeColorLogoPng,
} from "@lumeweb/portal-framework-ui/images";
import React from "react";

import type { BrandConfig } from "@lumeweb/portal-framework-core";

interface AuthFooterButtonProps {
  children: React.ReactNode;
  href: string;
  icon: React.ReactNode;
}

interface AuthFooterProps {
  brand?: BrandConfig;
}

export function AuthFooter({ brand }: AuthFooterProps) {
  const social = brand?.social;

  return (
    <footer className="my-5">
      <ul className="flex flex-row">
        {social?.discord && (
          <AuthFooterButton
            href={social.discord}
            icon={
              <img alt="Discord Logo" className="h-5" src={discordLogoPng} />
            }>
            Connect with us
          </AuthFooterButton>
        )}
        {social?.github && (
          <AuthFooterButton
            href={social.github}
            icon={
              <img alt="Logo" className="h-5" src={brand?.logoUrl || lumeColorLogoPng} />
            }>
            View on GitHub
          </AuthFooterButton>
        )}
        {social?.twitter && (
          <AuthFooterButton
            href={social.twitter}
            icon={
              <img alt="Logo" className="h-5" src={brand?.logoUrl || lumeColorLogoPng} />
            }>
            Follow us
          </AuthFooterButton>
        )}
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
