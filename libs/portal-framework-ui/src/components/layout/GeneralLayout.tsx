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
      <main className="transition-[margin-left] duration-300 ease-in-out lg:ml-72">
        <div>
          <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary sticky top-0 z-10 w-full shadow-md backdrop-blur">
            <div className="flex items-center justify-end gap-2 p-8 sm:mx-8">
              <ThemeSwitcher />
              <UserNav />
              <MobileMenu />
            </div>
          </header>
          <div className="mx-4 my-8 sm:mx-8">{children}</div>
        </div>
      </main>
    </SidebarProvider>
  );
}

export const GeneralLayout = withTheme(GeneralLayoutComponent);
