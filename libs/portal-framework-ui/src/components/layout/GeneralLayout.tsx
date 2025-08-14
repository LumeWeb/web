import React from "react";

import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { withTheme } from "@/hooks/useTheme";

import DesktopSidebar from "./DesktopSidebar";
import { MobileMenu } from "./MobileMenu";
import { SidebarProvider } from "./SidebarContext";
import { UserNav } from "./UserNav";

interface GeneralLayoutProps {
  children?: React.ReactNode;
}

function GeneralLayoutComponent({ children }: GeneralLayoutProps) {
  return (
    <SidebarProvider>
      <DesktopSidebar />
      <main className="transition-[margin-left] ease-in-out duration-300 lg:ml-72">
        <div>
          <header className="sticky top-0 z-10 w-full bg-background/95 shadow-md backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
            <div className="flex items-center gap-2 sm:mx-8 justify-end p-8">
              <ThemeSwitcher />
              <UserNav />
              <MobileMenu />
            </div>
          </header>
          <div className="pt-8 pb-8 pl-4 sm:pl-8 sm:pr-16">{children}</div>
        </div>
      </main>
    </SidebarProvider>
  );
}

export const GeneralLayout = withTheme(GeneralLayoutComponent);
