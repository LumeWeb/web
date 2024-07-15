import { Link, useLocation } from "@remix-run/react";
import {
  ChevronDownIcon,
  CircleLockIcon,
  ClockIcon,
  CloudUploadIcon,
  DriveIcon,
  HamburgerMenuIcon,
} from "@/components/icons";
import LumeLogo from "@/components/LumeLogo";
import NavigationButton from "apps/portal-dashboard/app/components/NavigationButton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ExitIcon } from "@radix-ui/react-icons";
import { useLogout } from "@refinedev/core";
import React from "react";
import UploadForm from "apps/portal-dashboard/app/features/uploadManager/components/UploadForm";
import { MainNavigation } from "@/components/MainNavigation";

export default function MobileSidebar() {
  const location = useLocation();
  const { mutate: logout } = useLogout();
  return (
    <>
      <header className="flex flex-row w-full max-h-30 items-center justify-between p-4  bg-secondary border-b">
        <LumeLogo />
        <nav className="relative">
          <div className="flex items-center justify-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-none outline-none h-full flex flex-row gap-2">
                  <Avatar className="bg-ring h-10 w-10 rounded-full" />
                  <ChevronDownIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => logout()}>
                    <ExitIcon className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Sheet>
              <SheetTrigger>
                <Button
                  size="lg"
                  className="h-full p-2 bg-upload-file-background">
                  <CloudUploadIcon className="w-7 h-7 text-black" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom">
                <div className="w-full flex flex-col items-start justify-between my-auto">
                  <div className="w-full flex flex-col">
                    <UploadForm />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Sheet>
              <SheetTrigger>
                <Button
                  size="lg"
                  className="h-full p-2 border border-border bg-none">
                  <HamburgerMenuIcon className="text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetDescription>
                    <MainNavigation />
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>
    </>
  );
}
