import React from "react";
import LumeLogo from "@/components/LumeLogo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UploadButton } from "apps/portal-dashboard/app/components/UploadButton";
import UploadForm from "apps/portal-dashboard/app/features/uploadManager/components/UploadForm";
import { MainNavigation } from "@/components/MainNavigation";

interface DesktopSidebarProps {
  showUploadForm: boolean;
}

function DesktopSidebar({ showUploadForm }: DesktopSidebarProps) {
  return (
    <header className="p-10 pr-0 flex flex-col w-[240px] h-full scroll-m-0 overflow-hidden">
      <LumeLogo />
      <nav className="my-10 flex-1">
        <MainNavigation />
      </nav>
      <span className="text-foreground/60 mb-3 space-y-1 ">
        <p>Freedom</p>
        <p>Privacy</p>
        <p>Ownership</p>
      </span>

      {showUploadForm && (
        <Sheet>
          <SheetTrigger asChild>
            <UploadButton />
          </SheetTrigger>
          <SheetContent>
            <UploadForm />
          </SheetContent>
        </Sheet>
      )}
    </header>
  );
}

export default DesktopSidebar;
